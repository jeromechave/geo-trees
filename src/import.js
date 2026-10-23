import axios from 'axios'
import * as _ from 'lodash'

// Google Sheets used as the site's CMS.
// The API key is necessarily visible to visitors (it is called from the browser),
// so it must be restricted in Google Cloud Console: see README, "Google Sheets API key".
// It can be overridden at build time with VUE_APP_SHEETS_API_KEY in a .env.local file.
const SPREADSHEET_ID = '16qusGlajdZwqx6lX_RIxuWoxmiQqhxf-Guzwe4hI538'
const API_KEY = process.env.VUE_APP_SHEETS_API_KEY || 'AIzaSyA1-lEBOiEyohPSN9jBFTDG51qsmp5-Kn0'

// The Sheets API leaves out empty cells at the end of a row, so any column
// may be missing. These helpers always return a string / an array.
const cell = (row, i) => (row[i] === undefined || row[i] === null ? '' : String(row[i]).trim())

// "a;b;c" -> ['a','b','c'] ; empty cell -> [] (not ['']).
// Inner empty items are kept so that paired columns (names / urls) stay aligned.
const list = (row, i) => {
	const value = cell(row, i)
	return value === '' ? [] : value.split(';').map(item => item.trim())
}

const fetchRange = function (range) {
	const url = 'https://sheets.googleapis.com/v4/spreadsheets/' + SPREADSHEET_ID +
		'/values:batchGet?ranges=' + encodeURIComponent(range) + '&key=' + API_KEY
	return axios.get(url).then(response => {
		const rows = response.data.valueRanges[0].values || []
		// skip completely empty rows
		return rows.filter(row => row && row.some(value => String(value).trim() !== ''))
	})
}

const importRange = function (store, range, mapRow, mutation, transform) {
	return fetchRange(range)
		.then(rows => {
			let items = rows.map(mapRow)
			if (transform) {
				items = transform(items)
			}
			store.commit(mutation, items)
			store.commit('endImport', true)
			return true
		})
		.catch(error => {
			console.error('Could not load "' + range + '" from Google Sheets:', error)
			return false
		})
}

export const getData = function (store) {
	return importRange(store, 'Aboutus!A2:K10000', row => ({
		display: cell(row, 0),
		name: cell(row, 1),
		group: cell(row, 2),
		role: cell(row, 3),
		affiliation: cell(row, 4),
		image: cell(row, 5),
		zoom: cell(row, 6),
		link: cell(row, 7)
	}), 'initializeAboutData')
}

export const getNewsData = function (store) {
	return importRange(store, 'news!A2:K10000', row => ({
		date: cell(row, 0),
		title: cell(row, 1),
		text: cell(row, 2),
		link_text: list(row, 3),
		link_url: list(row, 4),
		img_url: cell(row, 5)
	}), 'initializeNewsData')
}

export const getOpportunitiesData = function (store) {
	return importRange(store, 'opportunities!A2:K10000', row => ({
		categorie: cell(row, 0),
		date: cell(row, 1),
		title: cell(row, 2),
		text: cell(row, 3),
		link_text: list(row, 4),
		link_url: list(row, 5)
	}), 'initializeOpportunitiesData', items => _.groupBy(items, 'categorie'))
}

export const getSitesData = function (store) {
	return importRange(store, 'Sitesdirectory!A2:N10000', row => ({
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
	}), 'initializeSitesData', items => _.groupBy(items, 'country'))
}
