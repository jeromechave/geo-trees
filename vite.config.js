import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { pages } from './pages.config.js'

const root = (path) => fileURLToPath(new URL(path, import.meta.url))
const imagePattern = /\.(png|jpe?g|gif|svg|webp|avif)$/i

export default defineConfig(({ command }) => ({
  // The site is published at https://geo-trees.org/geo-trees/ (GitHub Pages project site).
  // Override with VITE_BASE=/ npm run build to build for a domain root.
  base: command === 'build' ? process.env.VITE_BASE || '/geo-trees/' : '/',
  plugins: [vue()],
  resolve: {
    alias: { '@': root('./src') }
  },
  build: {
    rolldownOptions: {
      // One HTML file per page, so the URLs stay the same as on the old site
      input: Object.fromEntries(pages.map((page) => [page, root(`./${page}.html`)])),
      output: {
        // Keep images under img/ with their original names, as the previous build did:
        // URLs such as /geo-trees/img/homepage-background.jpg keep working.
        assetFileNames: (asset) => {
          const name = (asset.names && asset.names[0]) || asset.name || ''
          return imagePattern.test(name) ? 'img/[name][extname]' : 'assets/[name]-[hash][extname]'
        }
      }
    }
  }
}))
