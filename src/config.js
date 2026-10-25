// Google Sheets used as the site's CMS.
// The API key is visible to visitors (it is called from the browser), so it must be
// restricted in Google Cloud Console: see README, "Google Sheets API key".
// Override at build time with VITE_SHEETS_API_KEY in a .env.local file.
// The spreadsheet (Geotrees_Back-CARTO) must be shared as "Anyone with the link: Viewer".
// It holds the tabs Data (map and site directory), Aboutus, Opportunities and News.
// https://docs.google.com/spreadsheets/d/1YEtBjP4UZ5L0VtHnMXWZifZ50j74ezvsNmhjHiNPfng
export const SPREADSHEET_ID = import.meta.env.VITE_SPREADSHEET_ID || '1YEtBjP4UZ5L0VtHnMXWZifZ50j74ezvsNmhjHiNPfng'
// Names of the spreadsheet tabs, exactly as shown at the bottom of the sheet.
// If a tab is renamed in Google Sheets, rename it here too. The Data tab can also be
// set with VITE_DATA_TAB in .env.local (for example to try a copy of it first).
export const SHEET_TABS = {
  data: import.meta.env.VITE_DATA_TAB || 'Data', // the map and the site directory
  about: 'Aboutus',
  opportunities: 'Opportunities',
  news: 'News'
}

// Columns of the Data tab (0 = column A), one row per site
export const DATA_COLUMNS = {
  name: 0, //                              A  Site
  description: 1, //                       B  Description
  country: 2, //                           C  Country
  latitude: 3, //                          D  Latitude
  longitude: 4, //                         E  Longitude
  website: 5, //                           F  Site_URL
  als: 6, //                               G  ALS
  tls: 7, //                               H  TLS
  plot: 8, //                              I  Inventory
  piNames: 9, //                           J  PI_Names
  piInstitutions: 10, //                   K  PI_Institutions_Names
  supportWebsites: 11, //                  L  Support_Institutions_websites
  funders: 12, //                          M  Funders
  partnerNames: 13, //                     N  Partners_Names
  partnerInstitutions: 14, //              O  Partners_Institutions_Names
  partnerWebsites: 15, //                  P  Partners_Institutions_Websites
  networks: 16, //                         Q  Networks_Names
  networkWebsites: 17 //                   R  Networks_websites
  // S (PI email addresses) and T (update notes) are never read by the website
}
export const DATA_LAST_COLUMN = 'R'

// The Data tab (map and site directory) is read from the same spreadsheet unless set otherwise
export const MAP_SPREADSHEET_ID = import.meta.env.VITE_MAP_SPREADSHEET_ID || SPREADSHEET_ID
export const SHEETS_API_KEY = import.meta.env.VITE_SHEETS_API_KEY || 'AIzaSyA1-lEBOiEyohPSN9jBFTDG51qsmp5-Kn0'

// Where the images named in the spreadsheet (people, partner logos) are hosted
export const SHEET_IMAGE_BASE = 'https://geo-trees.org/geo-trees/img/'

export const sheetImage = (name) => SHEET_IMAGE_BASE + name

// ---------------------------------------------------------------------------
// Sites map
// ---------------------------------------------------------------------------

// Background maps.
// "Outdoors" is OpenFreeMap's Liberty style: free and open, no account, no API key,
// no usage limits (https://openfreemap.org). It is a vector map drawn with MapLibre GL.
// Other OpenFreeMap styles: https://tiles.openfreemap.org/styles/positron, .../bright
const OPENFREEMAP_STYLE = import.meta.env.VITE_OPENFREEMAP_STYLE || 'https://tiles.openfreemap.org/styles/liberty'
const OPENFREEMAP_ATTRIBUTION =
  '<a href="https://openfreemap.org" target="_blank" rel="noopener">OpenFreeMap</a> ' +
  '© <a href="https://www.openmaptiles.org/" target="_blank" rel="noopener">OpenMapTiles</a> ' +
  'Data from <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>'

// "Satellite" is EOX's Sentinel-2 cloudless mosaic (https://cloudless.eox.at):
// free with attribution, no account or API key. The 2018 and later years are licensed
// CC BY-NC-SA 4.0, i.e. for non-commercial use only. 10 m imagery, sharp up to
// regional scale; tiles exist up to zoom 14 and are enlarged beyond that.
// Another year (2020 to 2024) can be chosen with VITE_EOX_YEAR in .env.local.
const EOX_YEAR = import.meta.env.VITE_EOX_YEAR || '2024'
const EOX_ATTRIBUTION =
  '<a href="https://cloudless.eox.at" target="_blank" rel="noopener">EOxCloudless</a> by ' +
  '<a href="https://eox.at" target="_blank" rel="noopener">EOX IT Services GmbH</a> ' +
  `(Contains modified Copernicus Sentinel data ${EOX_YEAR})`

// type "vector": a MapLibre style URL; type "raster": a {z}/{x}/{y} tile URL
export const MAP_LAYERS = [
  { id: 'outdoors', label: 'Outdoors', type: 'vector', style: OPENFREEMAP_STYLE, attribution: OPENFREEMAP_ATTRIBUTION },
  {
    id: 'satellite',
    label: 'Satellite',
    type: 'raster',
    url: `https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-${EOX_YEAR}_3857/default/g/{z}/{y}/{x}.jpg`,
    attribution: EOX_ATTRIBUTION,
    maxNativeZoom: 14
  }
]

// Used instead of a vector layer in the rare browsers without WebGL
export const MAP_FALLBACK_LAYER = {
  type: 'raster',
  url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
  maxZoom: 19
}

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

// The three squares of each site's bar, left to right, and their Data column
export const MEASUREMENTS = [
  { id: 'als', short: 'ALS', label: 'Airborne laser scanning', column: DATA_COLUMNS.als },
  { id: 'tls', short: 'TLS', label: 'Terrestrial laser scanning', column: DATA_COLUMNS.tls },
  { id: 'plot', short: 'Plot', label: 'Forest plot inventory', column: DATA_COLUMNS.plot }
]
