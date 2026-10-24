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

// "Satellite" is still a Mapbox style in the "clementthorez" account (the developer of
// the previous map). Once GEO-TREES has its own Mapbox account, set in .env.local:
//   VITE_MAPBOX_TOKEN=pk....
//   VITE_MAPBOX_STYLE_SATELLITE=<account>/<style id>
// or replace this layer with an open imagery source (see README).
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN ||
  'pk.eyJ1IjoiY2xlbWVudHRob3JleiIsImEiOiJja3BzYzl1dDcwbmhkMndxazdoYTB2ZDJ2In0.8Zh8sFimodwWLUEy_lO3Cw'
const MAPBOX_STYLE_SATELLITE = import.meta.env.VITE_MAPBOX_STYLE_SATELLITE || 'clementthorez/clvqoti6201qs01qp0ahs7sx5'

// Mapbox and OpenStreetMap require this attribution to stay visible on the map.
const MAPBOX_ATTRIBUTION =
  '© <a href="https://www.mapbox.com/about/maps/" target="_blank" rel="noopener">Mapbox</a> ' +
  '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> ' +
  '<a href="https://www.mapbox.com/map-feedback/" target="_blank" rel="noopener">Improve this map</a> ' +
  '© <a href="https://www.maxar.com/" target="_blank" rel="noopener">Maxar</a>'

// type "vector": a MapLibre style URL; type "raster": a {z}/{x}/{y} tile URL
export const MAP_LAYERS = [
  { id: 'outdoors', label: 'Outdoors', type: 'vector', style: OPENFREEMAP_STYLE, attribution: OPENFREEMAP_ATTRIBUTION },
  {
    id: 'satellite',
    label: 'Satellite',
    type: 'raster',
    url: `https://api.mapbox.com/styles/v1/${MAPBOX_STYLE_SATELLITE}/tiles/256/{z}/{x}/{y}{r}?access_token=${MAPBOX_TOKEN}`,
    attribution: MAPBOX_ATTRIBUTION
  }
]

// Used instead of a vector layer in the rare browsers without WebGL
export const MAP_FALLBACK_LAYER = {
  type: 'raster',
  url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
  maxZoom: 19
}

// Site statuses. "aliases" are the values accepted in the "Datas" tab of the sheet
// (case, accents and extra spaces are ignored). Colours are used for both the
// diamonds and the filter legend.
export const SITE_STATUSES = [
  { id: 'completed', label: 'Completed', color: '#53A034', aliases: ['réalisé', 'realise', 'completed', 'complete', 'done', 'terminé'] },
  { id: 'ongoing', label: 'Ongoing', color: '#FDAB0A', aliases: ['en cours', 'ongoing', 'in progress', 'current'] },
  { id: 'planned', label: 'Planned', color: '#4C4C4C', aliases: ['futur', 'future', 'planned', 'prévu', 'prevu'] }
]
