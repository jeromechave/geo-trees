import { sheetSettings } from './sheet-layout.js'

// Google Sheets used as the site's CMS: spreadsheet, API key, tab names and columns
// are set in src/sheet-layout.js (shared with the build script).
const sheet = sheetSettings(import.meta.env)
export const SPREADSHEET_ID = sheet.spreadsheetId
export const MAP_SPREADSHEET_ID = sheet.mapSpreadsheetId
export const SHEETS_API_KEY = sheet.apiKey
export const SHEET_TABS = sheet.tabs
export { SHEET_COLUMNS } from './sheet-layout.js'

// Where the images named in the spreadsheet (people, partner logos) are hosted
const SHEET_IMAGE_BASE = 'https://geo-trees.org/geo-trees/img/'

export const sheetImage = (name) => SHEET_IMAGE_BASE + name

// ---------------------------------------------------------------------------
// Sites map
// ---------------------------------------------------------------------------

// Background maps.
// "Outdoors" is OpenFreeMap's Liberty style: free and open, no account, no API key,
// no usage limits (https://openfreemap.org). It is a vector map drawn with MapLibre GL.
// Other OpenFreeMap styles: https://tiles.openfreemap.org/styles/positron, .../bright
const OPENFREEMAP_STYLE = import.meta.env.VITE_OPENFREEMAP_STYLE || 'https://tiles.openfreemap.org/styles/liberty'
// Credits shown on the map; each background's data providers require them
const OPENFREEMAP_CREDITS = [
  { text: 'OpenFreeMap', url: 'https://openfreemap.org' },
  { text: '© OpenMapTiles', url: 'https://www.openmaptiles.org/' },
  { text: 'Data from OpenStreetMap', url: 'https://www.openstreetmap.org/copyright' }
]

// "Satellite" is EOX's Sentinel-2 cloudless mosaic (https://cloudless.eox.at):
// free with attribution, no account or API key. The 2018 and later years are licensed
// CC BY-NC-SA 4.0, i.e. for non-commercial use only. 10 m imagery, sharp up to
// regional scale; tiles exist up to zoom 14.
// Another year (2020 to 2024) can be chosen with VITE_EOX_YEAR in .env.local.
const EOX_YEAR = import.meta.env.VITE_EOX_YEAR || '2024'
const EOX_CREDITS = [
  { text: 'EOxCloudless', url: 'https://cloudless.eox.at' },
  { text: 'by EOX IT Services GmbH', url: 'https://eox.at' },
  { text: `(Contains modified Copernicus Sentinel data ${EOX_YEAR})` }
]

// type "vector": a MapLibre style URL; type "raster": a {z}/{x}/{y} tile URL
export const MAP_LAYERS = [
  { id: 'outdoors', label: 'Outdoors', type: 'vector', style: OPENFREEMAP_STYLE, credits: OPENFREEMAP_CREDITS },
  {
    id: 'satellite',
    label: 'Satellite',
    type: 'raster',
    url: `https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-${EOX_YEAR}_3857/default/g/{z}/{y}/{x}.jpg`,
    maxZoom: 14,
    credits: EOX_CREDITS
  }
]

// Colours shared by the measurement squares and the status filters.
// Each state is also shown by how full its square is (empty, half, full), so it can
// be read without telling colours apart (colour blindness, greyscale printing).
const RED = '#D7372B'
const ORANGE = '#F28E1C'
const GREEN = '#53A034'

// State of each measurement (columns G, H, I of the "Data" tab). "aliases" are the
// values accepted in those cells; case, accents and extra spaces are ignored.
export const MEASUREMENT_STATES = [
  {
    id: 'not-started',
    label: 'Planned',
    color: RED,
    fill: 'empty',
    aliases: ['', '0', 'no', 'non', 'n', 'false', 'not started', 'todo', 'to do', 'futur', 'future', 'planned', 'prévu']
  },
  {
    id: 'ongoing',
    label: 'Ongoing',
    color: ORANGE,
    fill: 'half',
    aliases: ['en cours', 'ongoing', 'in progress', 'started', 'partial', 'current']
  },
  {
    id: 'completed',
    label: 'Completed',
    color: GREEN,
    fill: 'full',
    aliases: ['1', 'yes', 'y', 'x', 'oui', 'true', 'done', 'completed', 'complete', 'réalisé', 'terminé', 'fait']
  }
]

// The three squares of each site's bar, left to right, and their Data field
export const MEASUREMENTS = [
  { id: 'als', short: 'ALS', label: 'Airborne laser scanning', field: 'als' },
  { id: 'tls', short: 'TLS', label: 'Terrestrial laser scanning', field: 'tls' },
  { id: 'plot', short: 'Plot', label: 'Forest plot inventory', field: 'plot' }
]
