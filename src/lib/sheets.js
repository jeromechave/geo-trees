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

// "a;b;c" -> ['a', 'b', 'c']; empty cell -> [] (not ['']).
// Empty items at the end ("a; b;") are dropped; inner ones ("a;;c") are kept so
// paired columns (names / urls) stay aligned.
const list = (row, i) => {
  const items = cell(row, i).split(';').map((item) => item.trim())
  while (items.length && items[items.length - 1] === '') items.pop()
  return items
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
      url: cell(row, C.website),
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
  const items = rows.map(({ row }) => ({
    country: cell(row, C.country),
    name: cell(row, C.name),
    latitude: cell(row, C.latitude),
    longitude: cell(row, C.longitude),
    Website: cell(row, C.website),
    PI_Names: list(row, C.piNames),
    PI_Institutions_Names: list(row, C.piInstitutions),
    Support_Institutions_websites: list(row, C.supportWebsites),
    Funders: list(row, C.funders),
    Partners_Names: list(row, C.partnerNames),
    Partners_Institutions_Names: list(row, C.partnerInstitutions),
    Partners_Institutions_Websites: list(row, C.partnerWebsites),
    Networks_Names: list(row, C.networks),
    Networks_websites: list(row, C.networkWebsites)
  }))
  return groupBy(items, 'country')
}
