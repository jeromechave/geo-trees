import { createApp } from 'vue'
import '@/styles/fonts.css'
import '@/styles/commons.scss'

export function mountPage(Page) {
  createApp(Page).mount('#app')
}
