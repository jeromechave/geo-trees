import {
  MAP_SPREADSHEET_ID,
  MEASUREMENT_STATES,
  MEASUREMENTS,
  SHEET_TABS,
  SHEETS_API_KEY,
  SPREADSHEET_ID
} from '@/config'
import { columnLetter, resolveColumns, slugify } from '@/sheet-layout'

export { slugify }

// The Sheets API leaves out empty cells at the end of a row, so any column
// may be missing. These helpers always return a string / an array.
const cell = (row, i) => (row[i] === undefined || row[i] === null ? '' : String(row[i]).trim())

// A list cell: items separated by ";" ("a; b; c"), however many there are.
// Empty items are skipped ("a; b;" -> ['a', 'b']); a line break is accepted as a
// separator too, in case one slips into the sheet.
export const splitItems = (value) =>
  String(value || '')
    .split(/;|\r?\n/)
    .map((item) => item.trim())
    .filter((item) => item !== '')
const list = (row, i) => splitItems(cell(row, i))

// A cell of web addresses, separated by ";" like other lists (an address may contain
// spaces, e.g. a PDF name). "www.example.org" gets "https://", otherwise the browser
// would treat it as a page of this website.
// Only these kinds of address are turned into links: a "javascript:" or other
// address typed into the sheet is ignored (it could run code in visitors' browsers).
const SAFE_URL = /^(https?:\/\/|mailto:)/i
const withScheme = (url) => (/^[a-z][a-z0-9+.-]*:/i.test(url) ? url : `https://${url}`)
// -> list of addresses; an unsafe one becomes null, so the others keep their position
const urls = (row, i, where = 'Sheet') =>
  list(row, i).map((item) => {
    const url = withScheme(item)
    if (SAFE_URL.test(url)) return url
    console.warn(`${where}: link "${item}" ignored (only https, http and mailto links are allowed).`)
    return null
  })

// Short labels for a list of web addresses: "example.org", or "example.org/en/page"
// when two addresses of the list are on the same site.
export function linkLabels(addresses) {
  const parts = addresses.map((url) => {
    if (!url) return { host: '', path: '' }
    try {
      const { hostname, pathname } = new URL(url)
      return { host: hostname.replace(/^www\./, ''), path: pathname.replace(/\/$/, '') }
    } catch {
      return { host: url, path: '' }
    }
  })
  return parts.map(({ host, path }) =>
    parts.filter((other) => other.host === host).length > 1 && path ? `${host}${path}` : host
  )
}

// Pairs the names of one cell with the web addresses of the next, in order: the 1st
// name with the 1st address, and so on, for as many items as each cell contains.
// A name without an address is shown as text; an address without a name is shown as
// a link labelled with its site. Different counts are noted in the browser console,
// since one missing item shifts the pairs that follow it.
function linked(names, addresses, where, what) {
  if (names.length !== addresses.length && names.length && addresses.length) {
    console.info(`${where}: ${names.length} ${what} and ${addresses.length} web addresses, paired in order.`)
  }
  const labels = linkLabels(addresses)
  return Array.from({ length: Math.max(names.length, addresses.length) }, (_, index) => ({
    name: names[index] || labels[index],
    url: addresses[index] || null
  })).filter((link) => link.name)
}

const groupBy = (items, key) =>
  items.reduce((groups, item) => {
    ;(groups[item[key]] ||= []).push(item)
    return groups
  }, {})

async function fetchRange(range, spreadsheetId) {
  const url =
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchGet` +
    `?ranges=${encodeURIComponent(range)}&key=${SHEETS_API_KEY}`
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Google Sheets answered ${response.status} for "${range}"`)
  }
  const body = await response.json()
  return body.valueRanges[0].values || []
}

// The copy of the sheet saved at each build (scripts/snapshot-sheet.js), used when
// Google Sheets cannot be reached. Loaded only when needed.
let snapshot
const loadSnapshot = () =>
  (snapshot ||= fetch(`${import.meta.env.BASE_URL}sheet-snapshot.json`)
    .then((response) => (response.ok ? response.json() : null))
    .catch(() => null))

// Rows of a tab as records: each with its spreadsheet row number and functions to read
// a field as text, as a list ("a; b") or as web addresses.
function toRecords(tabKey, header, values) {
  const tab = SHEET_TABS[tabKey]
  const { columns, missing } = resolveColumns(tabKey, header)
  missing.forEach(({ title, usual, header: found }) =>
    console.warn(
      `Sheet: no column "${title}" in tab "${tab}"; using column ${columnLetter(usual)} ` +
        `("${found || 'no header'}") instead. Check the header in row 1.`
    )
  )
  return values
    .map((row, index) => ({ row, line: index + 2 }))
    .filter(({ row }) => row.some((value) => String(value).trim() !== ''))
    .map(({ row, line }) => ({
      line,
      text: (field) => cell(row, columns[field]),
      list: (field) => list(row, columns[field]),
      urls: (field, where) => urls(row, columns[field], where)
    }))
}

// Reads one tab: its header row first, to find the columns, then the rows up to the
// last column the site uses. If Google Sheets fails, the saved copy is used instead.
async function readTab(tabKey, spreadsheetId = SPREADSHEET_ID) {
  const tab = SHEET_TABS[tabKey]
  try {
    const [header = []] = await fetchRange(`${tab}!1:1`, spreadsheetId)
    const values = await fetchRange(`${tab}!A2:${resolveColumns(tabKey, header).lastColumn}10000`, spreadsheetId)
    return toRecords(tabKey, header, values)
  } catch (error) {
    const saved = await loadSnapshot()
    const copy = saved && saved.tabs && saved.tabs[tabKey]
    if (!copy || copy.tab !== tab) throw error
    console.warn(`Sheet: could not read tab "${tab}" (${error.message}); showing the copy saved on ${copy.savedAt}.`)
    return toRecords(tabKey, copy.header, copy.rows)
  }
}

export async function loadAbout() {
  const rows = await readTab('about')
  return rows.map((r) => ({
    display: r.text('display'),
    name: r.text('name'),
    group: r.text('group'),
    role: r.text('role'),
    affiliation: r.text('affiliation'),
    image: r.text('image'),
    zoom: r.text('zoom'),
    link: r.urls('link', `About us "${r.text('name')}"`).find(Boolean) || '' // one partner website
  }))
}

export async function loadNews() {
  const rows = await readTab('news')
  return rows.map((r) => {
    const where = `News "${r.text('title')}"`
    return {
      date: r.text('date'),
      title: r.text('title'),
      text: r.text('text'),
      links: linked(r.list('linkText'), r.urls('linkUrl', where), where, 'link texts'),
      img_url: r.urls('image', where).find(Boolean) || ''
    }
  })
}

export async function loadOpportunities() {
  const rows = await readTab('opportunities')
  const items = rows.map((r) => {
    const where = `Opportunity "${r.text('title')}"`
    return {
      categorie: r.text('category'),
      date: r.text('date'),
      title: r.text('title'),
      text: r.text('text'),
      links: linked(r.list('linkText'), r.urls('linkUrl', where), where, 'link texts')
    }
  })
  return groupBy(items, 'categorie')
}

const normalizeWords = (value) => slugify(value).replace(/-/g, ' ')

const MEASUREMENT_STATE_BY_ALIAS = new Map(
  MEASUREMENT_STATES.flatMap((state) => state.aliases.map((alias) => [normalizeWords(alias), state.id]))
)

// Accepts "-0.2" and "-0,2"
const coordinate = (value) => parseFloat(value.replace(',', '.'))

// The Data tab: one row per site, read once and shared by the map and the directory
let dataRows
function loadDataRows() {
  dataRows ||= readTab('data', MAP_SPREADSHEET_ID).then((rows) => rows.filter((r) => r.text('name') !== ''))
  return dataRows
}

// Sites shown on the map
export async function loadMapSites() {
  const rows = await loadDataRows()
  const sites = []
  rows.forEach((r) => {
    const name = r.text('name')
    const lat = coordinate(r.text('latitude'))
    const lon = coordinate(r.text('longitude'))
    if (!(lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180)) {
      console.warn(`Map: "${name}" (${SHEET_TABS.data} row ${r.line}) has no valid coordinates and is not shown.`)
      return
    }
    sites.push({
      id: `${slugify(name)}-${r.line}`,
      slug: slugify(name),
      name,
      description: r.text('description'),
      country: r.text('country'),
      lat,
      lon,
      urls: r.urls('website', `Map "${name}"`).filter(Boolean),
      // { als: 'completed', tls: 'ongoing', plot: 'not-started' }
      measurements: Object.fromEntries(
        MEASUREMENTS.map((measurement) => {
          const value = r.text(measurement.field)
          let state = MEASUREMENT_STATE_BY_ALIAS.get(normalizeWords(value))
          if (!state) {
            console.warn(`Map: "${name}" (${SHEET_TABS.data} row ${r.line}) has an unknown ${measurement.short} value "${value}"; shown as planned.`)
            state = 'not-started'
          }
          return [measurement.id, state]
        })
      )
    })
  })
  return sites
}

// Sites in the directory below the map, grouped by country
export async function loadSites() {
  const rows = await loadDataRows()
  const items = rows.map((r) => {
    const name = r.text('name')
    const where = `Directory "${name}"`
    return {
      country: r.text('country'),
      name,
      latitude: r.text('latitude'),
      longitude: r.text('longitude'),
      websites: r.urls('website', where).filter(Boolean),
      piNames: r.list('piNames'),
      // [{ name, url }]; url is null for a name without (a safe) web address
      institutions: linked(r.list('piInstitutions'), r.urls('supportWebsites', where), where, 'supporting institutions'),
      funders: r.list('funders'),
      partnerNames: r.list('partnerNames'),
      partnerInstitutions: linked(r.list('partnerInstitutions'), r.urls('partnerWebsites', where), where, 'partner institutions'),
      networks: linked(r.list('networks'), r.urls('networkWebsites', where), where, 'networks')
    }
  })
  return groupBy(items, 'country')
}
