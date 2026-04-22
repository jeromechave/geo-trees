import Vue from 'vue'

import store from '@/store'
//import { getData } from './import.js'
//Vue.use(getData(store))

import App from './App.vue'

new Vue({
 store,
 render: h => h(App)
}).$mount("#app")