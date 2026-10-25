// Google Sheets used as the site's CMS.
// The API key is visible to visitors (it is called from the browser), so it must be
// restricted in Google Cloud Console: see README, "Google Sheets API key".
// Override at build time with VITE_SHEETS_API_KEY in a .env.local file.
export const SPREADSHEET_ID = '16qusGlajdZwqx6lX_RIxuWoxmiQqhxf-Guzwe4hI538'
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

// State of each measurement (columns I, J, K of the "Datas" tab). "aliases" are the
// values accepted in those cells; case, accents and extra spaces are ignored.
export const MEASUREMENT_STATES = [
  {
    id: 'not-started',
    label: 'Not started',
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

// The three squares of each site's bar, left to right, and their sheet column
// (0 = column A, so 8 = column I)
export const MEASUREMENTS = [
  { id: 'als', short: 'ALS', label: 'Airborne laser scanning', column: 8 },
  { id: 'tls', short: 'TLS', label: 'Terrestrial laser scanning', column: 9 },
  { id: 'plot', short: 'Plot', label: 'Forest plot inventory', column: 10 }
]

// Site statuses (column F of the "Datas" tab), used by the filters. "aliases" are
// the values accepted in the sheet (case, accents and extra spaces are ignored).
export const SITE_STATUSES = [
  { id: 'completed', label: 'Completed', color: GREEN, fill: 'full', aliases: ['réalisé', 'realise', 'completed', 'complete', 'done', 'terminé'] },
  { id: 'ongoing', label: 'Ongoing', color: ORANGE, fill: 'half', aliases: ['en cours', 'ongoing', 'in progress', 'current'] },
  { id: 'planned', label: 'Planned', color: RED, fill: 'empty', aliases: ['futur', 'future', 'planned', 'prévu', 'prevu'] }
]
