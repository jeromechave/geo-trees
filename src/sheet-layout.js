// Layout of the Google Sheet used as the site's CMS. Plain JavaScript with no
// browser- or Vite-specific code, so that both the site (src/config.js) and the
// build script that saves a fallback copy (scripts/snapshot-sheet.js) use the same
// rules. Settings come from VITE_* variables (.env.local or the build environment).

// The spreadsheet (Geotrees_Back-CARTO) must be shared as "Anyone with the link: Viewer".
// https://docs.google.com/spreadsheets/d/1YEtBjP4UZ5L0VtHnMXWZifZ50j74ezvsNmhjHiNPfng
const DEFAULT_SPREADSHEET_ID = '1YEtBjP4UZ5L0VtHnMXWZifZ50j74ezvsNmhjHiNPfng'
// The API key is visible to visitors (it is called from the browser), so it must be
// restricted in Google Cloud Console: see README, "Google Sheets API key".
const DEFAULT_SHEETS_API_KEY = 'AIzaSyA1-lEBOiEyohPSN9jBFTDG51qsmp5-Kn0'

// env: import.meta.env in the site, the loaded .env files in the build script
export function sheetSettings(env = {}) {
  const spreadsheetId = env.VITE_SPREADSHEET_ID || DEFAULT_SPREADSHEET_ID
  return {
    spreadsheetId,
    // the Data tab (map and site directory) can live in another spreadsheet
    mapSpreadsheetId: env.VITE_MAP_SPREADSHEET_ID || spreadsheetId,
    apiKey: env.VITE_SHEETS_API_KEY || DEFAULT_SHEETS_API_KEY,
    // Names of the tabs, exactly as shown at the bottom of the sheet. If a tab is
    // renamed in Google Sheets, rename it here too. VITE_DATA_TAB can point the site
    // at a copy of the Data tab, for example to try it first.
    tabs: {
      data: env.VITE_DATA_TAB || 'Data', // the map and the site directory
      about: 'Aboutus',
      opportunities: 'Opportunities',
      news: 'News'
    }
  }
}

// Columns of each tab, listed in their usual order (the first is column A).
// The site finds each column by its header in row 1 (case, accents, spaces and
// underscores ignored), so columns can be moved or inserted. If no header matches,
// it uses the usual position and says so in the browser console.
// Each field lists the header names it accepts.
export const SHEET_COLUMNS = {
  data: {
    name: ['Site'],
    description: ['Description'],
    country: ['Country'],
    latitude: ['Latitude'],
    longitude: ['Longitude'],
    website: ['Site_URL', 'Website'],
    als: ['ALS'],
    tls: ['TLS'],
    plot: ['Inventory', 'Plot'],
    piNames: ['PI_Names'],
    piInstitutions: ['PI_Institutions_Names'],
    supportWebsites: ['Support_Institutions_websites'],
    funders: ['Funders'],
    partnerNames: ['Partners_Names'],
    partnerInstitutions: ['Partners_Institutions_Names'],
    partnerWebsites: ['Partners_Institutions_Websites'],
    networks: ['Networks_Names'],
    networkWebsites: ['Networks_websites']
  },
  about: {
    display: ['display'],
    name: ['name'],
    group: ['group'],
    role: ['role'],
    affiliation: ['affiliation'],
    image: ['image'],
    zoom: ['zoom'],
    link: ['link']
  },
  news: {
    date: ['Date'],
    title: ['Title'],
    text: ['Text'],
    linkText: ['Link_text'],
    linkUrl: ['Link_url'],
    image: ['Img_url', 'Image']
  },
  opportunities: {
    category: ['Categorie', 'Category'],
    date: ['Date'],
    title: ['Title'],
    text: ['Text'],
    linkText: ['Link_text'],
    linkUrl: ['Link_url']
  }
}

// "Lopé National Park" -> "lope-national-park"
export const slugify = (value) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const normalizeHeader = (header) => slugify(header).replace(/-/g, '')

// 0 -> "A", 25 -> "Z", 26 -> "AA"
export function columnLetter(index) {
  let letters = ''
  for (let n = index + 1; n > 0; n = Math.floor((n - 1) / 26)) letters = String.fromCharCode(65 + ((n - 1) % 26)) + letters
  return letters
}

// Finds the columns of a tab from its header row.
// -> { columns: { field: index }, missing: [{ field, title, usual }], lastColumn: "R" }
export function resolveColumns(tabKey, header = []) {
  const positions = new Map()
  header.forEach((title, index) => {
    const key = normalizeHeader(title)
    if (key && !positions.has(key)) positions.set(key, index)
  })
  const columns = {}
  const missing = []
  Object.entries(SHEET_COLUMNS[tabKey]).forEach(([field, titles], usual) => {
    const found = titles.map((title) => positions.get(normalizeHeader(title))).find((index) => index !== undefined)
    if (found === undefined) missing.push({ field, title: titles[0], usual, header: header[usual] || '' })
    columns[field] = found === undefined ? usual : found
  })
  return { columns, missing, lastColumn: columnLetter(Math.max(...Object.values(columns))) }
}
