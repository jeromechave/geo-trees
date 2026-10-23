// Google Sheets used as the site's CMS.
// The API key is visible to visitors (it is called from the browser), so it must be
// restricted in Google Cloud Console: see README, "Google Sheets API key".
// Override at build time with VITE_SHEETS_API_KEY in a .env.local file.
export const SPREADSHEET_ID = '16qusGlajdZwqx6lX_RIxuWoxmiQqhxf-Guzwe4hI538'
export const SHEETS_API_KEY = import.meta.env.VITE_SHEETS_API_KEY || 'AIzaSyA1-lEBOiEyohPSN9jBFTDG51qsmp5-Kn0'

// Where the images named in the spreadsheet (people, partner logos) are hosted
export const SHEET_IMAGE_BASE = 'https://geo-trees.org/geo-trees/img/'

export const sheetImage = (name) => SHEET_IMAGE_BASE + name
