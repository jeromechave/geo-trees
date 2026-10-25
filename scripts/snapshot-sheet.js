/*
 * Saves a copy of the Google Sheet's content in public/sheet-snapshot.json, so that
 * the published site can still show it if Google Sheets cannot be reached.
 * Runs before every build (npm run build); also on its own with npm run snapshot.
 *
 * Each tab is read as the site reads it (src/sheet-layout.js): header row first,
 * then the rows up to the last column the site uses, never further.
 * If a tab cannot be read, the copy from the previous run is kept for that tab and
 * the build goes on: this script never makes the build fail.
 *
 * The Sheets API key may be restricted to the site's addresses (recommended). Such a
 * key also works here because requests carry the site's address as referrer
 * (VITE_SITE_URL, default https://geo-trees.org/). Otherwise set SHEETS_SNAPSHOT_API_KEY
 * to a key restricted to the Sheets API only.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadEnv } from 'vite'
import { resolveColumns, sheetSettings } from '../src/sheet-layout.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const output = path.join(root, 'public', 'sheet-snapshot.json')
const env = { ...loadEnv(process.env.NODE_ENV === 'development' ? 'development' : 'production', root, ''), ...process.env }
const settings = sheetSettings(env)
const apiKey = env.SHEETS_SNAPSHOT_API_KEY || settings.apiKey
const apiBase = env.SHEETS_API_URL || 'https://sheets.googleapis.com' // overridable for tests
const referrer = env.VITE_SITE_URL || 'https://geo-trees.org/'

async function fetchRange(spreadsheetId, range) {
  const url = `${apiBase}/v4/spreadsheets/${spreadsheetId}/values:batchGet?ranges=${encodeURIComponent(range)}&key=${apiKey}`
  const response = await fetch(url, { headers: { Referer: referrer }, signal: AbortSignal.timeout(20000) })
  if (!response.ok) throw new Error(`Google Sheets answered ${response.status} for "${range}"`)
  const body = await response.json()
  return body.valueRanges[0].values || []
}

async function readTab(tabKey) {
  const tab = settings.tabs[tabKey]
  const spreadsheetId = tabKey === 'data' ? settings.mapSpreadsheetId : settings.spreadsheetId
  const [header = []] = await fetchRange(spreadsheetId, `${tab}!1:1`)
  const { lastColumn, missing } = resolveColumns(tabKey, header)
  missing.forEach(({ title }) => console.warn(`  snapshot: no column "${title}" in tab "${tab}" (check its header in row 1)`))
  const rows = await fetchRange(spreadsheetId, `${tab}!A2:${lastColumn}10000`)
  const width = rows.reduce((max, row) => Math.max(max, row.length), 0)
  return { tab, savedAt: new Date().toISOString().slice(0, 10), header: header.slice(0, Math.max(width, 1)), rows }
}

let previous = {}
try {
  previous = JSON.parse(fs.readFileSync(output, 'utf8'))
} catch {
  /* no previous copy */
}

const tabs = {}
let saved = 0
for (const tabKey of Object.keys(settings.tabs)) {
  try {
    tabs[tabKey] = await readTab(tabKey)
    saved++
  } catch (error) {
    const old = previous.tabs && previous.tabs[tabKey]
    if (old && old.tab === settings.tabs[tabKey]) {
      tabs[tabKey] = old
      console.warn(`  snapshot: could not read tab "${settings.tabs[tabKey]}" (${error.message}); keeping the copy of ${old.savedAt}`)
    } else {
      console.warn(`  snapshot: could not read tab "${settings.tabs[tabKey]}" (${error.message}); no copy for it`)
    }
  }
}

if (Object.keys(tabs).length) {
  fs.mkdirSync(path.dirname(output), { recursive: true })
  fs.writeFileSync(output, JSON.stringify({ tabs }))
  const rows = Object.values(tabs).reduce((sum, tab) => sum + tab.rows.length, 0)
  console.log(`Sheet copy: ${saved} of ${Object.keys(settings.tabs).length} tabs read now, ${rows} rows -> public/sheet-snapshot.json`)
} else {
  console.warn('Sheet copy: nothing saved (no tab could be read and there is no previous copy). The site still works, without a fallback.')
}
