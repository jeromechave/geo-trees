import { MAP_SPREADSHEET_ID, MEASUREMENT_STATES, MEASUREMENTS, SPREADSHEET_ID, SHEETS_API_KEY, SITE_STATUSES } from '@/config'

// The Sheets API leaves out empty cells at the end of a row, so any column
// may be missing. These helpers always return a string / an array.
const cell = (row, i) => (row[i] === undefined || row[i] === null ? '' : String(row[i]).trim())

// "a;b;c" -> ['a', 'b', 'c']; empty cell -> [] (not ['']).
// Inner empty items are kept so paired columns (names / urls) stay aligned.
const list = (row, i) => {
  const value = cell(row, i)
  return value === '' ? [] : value.split(';').map((item) => item.trim())
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
  const rows = await fetchRange('Aboutus!A2:K10000')
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
  const rows = await fetchRange('news!A2:K10000')
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
  const rows = await fetchRange('opportunities!A2:K10000')
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

export async function loadSites() {
  const rows = await fetchRange('Sitesdirectory!A2:N10000')
  const items = rows.map((row) => ({
    country: cell(row, 0),
    name: cell(row, 1),
    latitude: cell(row, 2),
    longitude: cell(row, 3),
    Website: cell(row, 4),
    PI_Names: list(row, 5),
    PI_Institutions_Names: list(row, 6),
    Support_Institutions_websites: list(row, 7),
    Funders: list(row, 8),
    Partners_Names: list(row, 9),
    Partners_Institutions_Names: list(row, 10),
    Partners_Institutions_Websites: list(row, 11),
    Networks_Names: list(row, 12),
    Networks_websites: list(row, 13)
  }))
  return groupBy(items, 'country')
}

// "Lopé National Park" -> "lope-national-park". Used to match the same site
// between the "Datas" (map) and "Sitesdirectory" (directory) tabs.
export const slugify = (value) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const normalizeWords = (value) => slugify(value).replace(/-/g, ' ')

const STATUS_BY_ALIAS = new Map(
  SITE_STATUSES.flatMap((status) => status.aliases.map((alias) => [normalizeWords(alias), status.id]))
)

const MEASUREMENT_STATE_BY_ALIAS = new Map(
  MEASUREMENT_STATES.flatMap((state) => state.aliases.map((alias) => [normalizeWords(alias), state.id]))
)

// Accepts "-0.2" and "-0,2"
const coordinate = (value) => parseFloat(value.replace(',', '.'))

// "Datas" tab: one row per site shown on the map
export async function loadMapSites() {
  const rows = await fetchRange('Datas!A2:K10000', MAP_SPREADSHEET_ID)
  const sites = []
  rows.forEach((row, index) => {
    const line = index + 2 // spreadsheet row number, for messages
    const name = cell(row, 0)
    const lat = coordinate(cell(row, 3))
    const lon = coordinate(cell(row, 4))
    if (!name) return
    if (!(lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180)) {
      console.warn(`Map: "${name}" (Datas row ${line}) has no valid coordinates and is not shown.`)
      return
    }
    const rawStatus = cell(row, 5)
    let status = STATUS_BY_ALIAS.get(normalizeWords(rawStatus))
    if (!status) {
      console.warn(`Map: "${name}" (Datas row ${line}) has an unknown status "${rawStatus}"; shown as planned.`)
      status = 'planned'
    }
    sites.push({
      id: `${slugify(name)}-${line}`,
      slug: slugify(name),
      name,
      description: cell(row, 1),
      country: cell(row, 2),
      lat,
      lon,
      status,
      date: cell(row, 6),
      url: cell(row, 7),
      // { als: 'completed', tls: 'ongoing', plot: 'not-started' }
      measurements: Object.fromEntries(
        MEASUREMENTS.map((measurement) => {
          const value = cell(row, measurement.column)
          let state = MEASUREMENT_STATE_BY_ALIAS.get(normalizeWords(value))
          if (!state) {
            console.warn(`Map: "${name}" (Datas row ${line}) has an unknown ${measurement.short} value "${value}"; shown as not started.`)
            state = 'not-started'
          }
          return [measurement.id, state]
        })
      )
    })
  })
  return sites
}
