import {
  DATA_COLUMNS as C,
  DATA_LAST_COLUMN,
  MAP_SPREADSHEET_ID,
  MEASUREMENT_STATES,
  MEASUREMENTS,
  SHEET_TABS,
  SHEETS_API_KEY,
  SPREADSHEET_ID
} from '@/config'

// The Sheets API leaves out empty cells at the end of a row, so any column
// may be missing. These helpers always return a string / an array.
const cell = (row, i) => (row[i] === undefined || row[i] === null ? '' : String(row[i]).trim())

// A list cell: items separated by ";" or by line breaks (both are used in the sheet).
// "a; b;" -> ['a', 'b'], empty cell -> []
const list = (row, i) =>
  cell(row, i)
    .split(/;|\r?\n/)
    .map((item) => item.trim())
    .filter((item) => item !== '')

// A cell of web addresses: separated by ";", line breaks or spaces (an address never
// contains a space). "www.example.org" gets "https://", otherwise the browser would
// treat it as a page of this website.
const urls = (row, i) =>
  cell(row, i)
    .split(/[;\s]+/)
    .filter((url) => url !== '')
    .map((url) => (/^[a-z][a-z0-9+.-]*:/i.test(url) ? url : `https://${url}`))

// Short labels for a list of web addresses: "example.org", or "example.org/en/page"
// when two addresses of the list are on the same site.
export function linkLabels(addresses) {
  const parts = addresses.map((url) => {
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

// Pairs names with the web addresses of the next column, by position. When the two
// cells do not have the same number of items, the pairs would be wrong, so the names
// are shown without links and the problem is reported in the browser console.
function linked(names, addresses, site, what) {
  const paired = names.length === addresses.length
  if (!paired && addresses.length > 0) {
    console.warn(
      names.length === 0
        ? `Directory: "${site}" has ${addresses.length} websites for ${what} but no names; not shown.`
        : `Directory: "${site}" has ${names.length} ${what} but ${addresses.length} websites; shown without links.`
    )
  }
  return names.map((name, index) => ({ name, url: paired ? addresses[index] : null }))
}

const groupBy = (items, key) =>
  items.reduce((groups, item) => {
    ;(groups[item[key]] ||= []).push(item)
    return groups
  }, {})

async function fetchRange(range, spreadsheetId = SPREADSHEET_ID) {
  const url =
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchGet` +
    `?ranges=${encodeURIComponent(range)}&key=${SHEETS_API_KEY}`
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Google Sheets answered ${response.status} for "${range}"`)
  }
  const body = await response.json()
  const rows = body.valueRanges[0].values || []
  // skip completely empty rows
  return rows.filter((row) => row.some((value) => String(value).trim() !== ''))
}

export async function loadAbout() {
  const rows = await fetchRange(`${SHEET_TABS.about}!A2:K10000`)
  return rows.map((row) => ({
    display: cell(row, 0),
    name: cell(row, 1),
    group: cell(row, 2),
    role: cell(row, 3),
    affiliation: cell(row, 4),
    image: cell(row, 5),
    zoom: cell(row, 6),
    link: cell(row, 7)
  }))
}

export async function loadNews() {
  const rows = await fetchRange(`${SHEET_TABS.news}!A2:K10000`)
  return rows.map((row) => ({
    date: cell(row, 0),
    title: cell(row, 1),
    text: cell(row, 2),
    link_text: list(row, 3),
    link_url: list(row, 4),
    img_url: cell(row, 5)
  }))
}

export async function loadOpportunities() {
  const rows = await fetchRange(`${SHEET_TABS.opportunities}!A2:K10000`)
  const items = rows.map((row) => ({
    categorie: cell(row, 0),
    date: cell(row, 1),
    title: cell(row, 2),
    text: cell(row, 3),
    link_text: list(row, 4),
    link_url: list(row, 5)
  }))
  return groupBy(items, 'categorie')
}

// "Lopé National Park" -> "lope-national-park". Used to link a site on the map to
// its entry in the site directory, and to read sheet values tolerantly.
export const slugify = (value) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const normalizeWords = (value) => slugify(value).replace(/-/g, ' ')

const MEASUREMENT_STATE_BY_ALIAS = new Map(
  MEASUREMENT_STATES.flatMap((state) => state.aliases.map((alias) => [normalizeWords(alias), state.id]))
)

// Accepts "-0.2" and "-0,2"
const coordinate = (value) => parseFloat(value.replace(',', '.'))

// The Data tab: one row per site, read once and shared by the map and the directory
let dataRows
function loadDataRows() {
  dataRows ||= fetchRange(`${SHEET_TABS.data}!A2:${DATA_LAST_COLUMN}10000`, MAP_SPREADSHEET_ID).then((rows) =>
    rows.map((row, index) => ({ row, line: index + 2 })).filter(({ row }) => cell(row, C.name) !== '')
  )
  return dataRows
}

// Sites shown on the map
export async function loadMapSites() {
  const rows = await loadDataRows()
  const sites = []
  rows.forEach(({ row, line }) => {
    const name = cell(row, C.name)
    const lat = coordinate(cell(row, C.latitude))
    const lon = coordinate(cell(row, C.longitude))
    if (!(lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180)) {
      console.warn(`Map: "${name}" (${SHEET_TABS.data} row ${line}) has no valid coordinates and is not shown.`)
      return
    }
    sites.push({
      id: `${slugify(name)}-${line}`,
      slug: slugify(name),
      name,
      description: cell(row, C.description),
      country: cell(row, C.country),
      lat,
      lon,
      urls: urls(row, C.website),
      // { als: 'completed', tls: 'ongoing', plot: 'not-started' }
      measurements: Object.fromEntries(
        MEASUREMENTS.map((measurement) => {
          const value = cell(row, measurement.column)
          let state = MEASUREMENT_STATE_BY_ALIAS.get(normalizeWords(value))
          if (!state) {
            console.warn(`Map: "${name}" (${SHEET_TABS.data} row ${line}) has an unknown ${measurement.short} value "${value}"; shown as planned.`)
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
  const items = rows.map(({ row }) => {
    const name = cell(row, C.name)
    return {
      country: cell(row, C.country),
      name,
      latitude: cell(row, C.latitude),
      longitude: cell(row, C.longitude),
      websites: urls(row, C.website),
      piNames: list(row, C.piNames),
      // [{ name, url }]; url is null when names and websites do not pair up
      institutions: linked(list(row, C.piInstitutions), urls(row, C.supportWebsites), name, 'supporting institutions'),
      funders: list(row, C.funders),
      partnerNames: list(row, C.partnerNames),
      partnerInstitutions: linked(list(row, C.partnerInstitutions), urls(row, C.partnerWebsites), name, 'partner institutions'),
      networks: linked(list(row, C.networks), urls(row, C.networkWebsites), name, 'networks')
    }
  })
  return groupBy(items, 'country')
}
