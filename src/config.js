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

// Background maps: Mapbox styles. They currently live in the "clementthorez"
// Mapbox account (the developer of the previous map). Once GEO-TREES has its own
// account, set these in .env.local (or the build environment):
//   VITE_MAPBOX_TOKEN=pk....
//   VITE_MAPBOX_STYLE_OUTDOORS=<account>/<style id>
//   VITE_MAPBOX_STYLE_SATELLITE=<account>/<style id>
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN ||
  'pk.eyJ1IjoiY2xlbWVudHRob3JleiIsImEiOiJja3BzYzl1dDcwbmhkMndxazdoYTB2ZDJ2In0.8Zh8sFimodwWLUEy_lO3Cw'
const MAPBOX_STYLE_OUTDOORS = import.meta.env.VITE_MAPBOX_STYLE_OUTDOORS || 'clementthorez/clwgkjsgd000c01po64d18a7e'
const MAPBOX_STYLE_SATELLITE = import.meta.env.VITE_MAPBOX_STYLE_SATELLITE || 'clementthorez/clvqoti6201qs01qp0ahs7sx5'

const mapboxTiles = (style) =>
  `https://api.mapbox.com/styles/v1/${style}/tiles/256/{z}/{x}/{y}{r}?access_token=${MAPBOX_TOKEN}`

// Mapbox and OpenStreetMap require this attribution to stay visible on the map.
const MAPBOX_ATTRIBUTION =
  '© <a href="https://www.mapbox.com/about/maps/" target="_blank" rel="noopener">Mapbox</a> ' +
  '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> ' +
  '<a href="https://www.mapbox.com/map-feedback/" target="_blank" rel="noopener">Improve this map</a>'

export const MAP_LAYERS = [
  { id: 'outdoors', label: 'Outdoors', url: mapboxTiles(MAPBOX_STYLE_OUTDOORS), attribution: MAPBOX_ATTRIBUTION },
  {
    id: 'satellite',
    label: 'Satellite',
    url: mapboxTiles(MAPBOX_STYLE_SATELLITE),
    attribution: MAPBOX_ATTRIBUTION + ' © <a href="https://www.maxar.com/" target="_blank" rel="noopener">Maxar</a>'
  }
]

// Site statuses. "aliases" are the values accepted in the "Datas" tab of the sheet
// (case, accents and extra spaces are ignored). Colours are used for both the
// diamonds and the filter legend.
export const SITE_STATUSES = [
  { id: 'completed', label: 'Completed', color: '#53A034', aliases: ['réalisé', 'realise', 'completed', 'complete', 'done', 'terminé'] },
  { id: 'ongoing', label: 'Ongoing', color: '#FDAB0A', aliases: ['en cours', 'ongoing', 'in progress', 'current'] },
  { id: 'planned', label: 'Planned', color: '#4C4C4C', aliases: ['futur', 'future', 'planned', 'prévu', 'prevu'] }
]
