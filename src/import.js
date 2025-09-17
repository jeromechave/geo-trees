/* eslint-disable no-unused-vars */
/* eslint-disable no-mixed-spaces-and-tabs */



import axios from 'axios'
import * as _ from 'lodash'

export const getData = async function (store) {
	
	return axios.get("https://sheets.googleapis.com/v4/spreadsheets/16qusGlajdZwqx6lX_RIxuWoxmiQqhxf-Guzwe4hI538/values:batchGet?ranges=Aboutus!A2:K10000&key=AIzaSyA1-lEBOiEyohPSN9jBFTDG51qsmp5-Kn0")
      .then(response => {
        const values = response.data.valueRanges[0].values;
		var allItems = []
		_.each(values,function(item){
			var itemObj = {}
			itemObj.name = item[0]
			itemObj.group = item[1]
			itemObj.role = item[2]
			itemObj.affiliation = item[3]
			itemObj.image = item[4]
			itemObj.link = item[5]
			allItems.push(itemObj)
		})
		
		store.commit('initializeAboutData',allItems)
        store.commit("endImport",true)
        return true 
      })
	}

	export const getNewsData = async function (store) {
	
		return axios.get("https://sheets.googleapis.com/v4/spreadsheets/16qusGlajdZwqx6lX_RIxuWoxmiQqhxf-Guzwe4hI538/values:batchGet?ranges=news!A2:K10000&key=AIzaSyA1-lEBOiEyohPSN9jBFTDG51qsmp5-Kn0")
		  .then(response => {
			const values = response.data.valueRanges[0].values;
			var allItems = []
			_.each(values,function(item){
				var itemObj = {}
				itemObj.date = item[0]
				itemObj.title = item[1]
				itemObj.text = item[2]
				itemObj.link = item[3]
				allItems.push(itemObj)
			})
			
			store.commit('initializeNewsData',allItems)
			store.commit("endImport",true)
			return true 
		  })
		}

	export const getSitesData = async function (store) {
	
		return axios.get("https://sheets.googleapis.com/v4/spreadsheets/16qusGlajdZwqx6lX_RIxuWoxmiQqhxf-Guzwe4hI538/values:batchGet?ranges=Sitesdirectory!A2:N10000&key=AIzaSyA1-lEBOiEyohPSN9jBFTDG51qsmp5-Kn0")
		  .then(response => {
			const values = response.data.valueRanges[0].values;
			var allItems = []
			_.each(values,function(item){
				var itemObj = {}
				itemObj.country = item[0]
				itemObj.name = item[1]
				itemObj.latitude = item[2]
				itemObj.longitude = item[3]
				itemObj.Website = item[4]
				itemObj.PI_Names = item[5].split(';')
				itemObj.PI_Institutions_Names = item[6].split(';')
				itemObj.Support_Institutions_websites = item[7].split(';')
				itemObj.Funders = item[8].split(';')
				itemObj.Partners_Names = item[9].split(';')
				itemObj.Partners_Institutions_Names = item[10].split(';')
				itemObj.Partners_Institutions_Websites = item[11].split(';')
				itemObj.Networks_Names = item[12].split(';')
				itemObj.Networks_websites = item[13].split(';')
				allItems.push(itemObj)
			})

			var byCountry = _.groupBy(allItems, 'country')
			
			store.commit('initializeSitesData',byCountry)
			store.commit("endImport",true)
			return true 
		  })
		}