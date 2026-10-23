import { SPREADSHEET_ID, SHEETS_API_KEY } from '@/config'

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

async function fetchRange(range) {
  const url =
    `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values:batchGet` +
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
