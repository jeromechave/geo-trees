import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    aboutData:undefined,
    sitesData:undefined,
    newsData:undefined,
    endImport:false
  },
  mutations: {
    initializeAboutData (state,data) {
      state.aboutData = data
    },
    initializeSitesData (state,data) {
      state.sitesData = data
    },
    initializeNewsData (state,data) {
      state.newsData = data
    },
    endImport(state,value){
      state.endImport = value
    }
  }
})
