// Loads Leaflet and its plugins on demand, so only the Sites page downloads them.
// The gesture-handling plugin is a UMD build that expects Leaflet as a global "L".
import 'leaflet/dist/leaflet.css'
import 'leaflet-gesture-handling/dist/leaflet-gesture-handling.css'

let loadingLeaflet
let loadingVector

export function loadLeaflet() {
  loadingLeaflet ||= (async () => {
    const { default: L } = await import('leaflet')
    window.L = L
    await import('leaflet-gesture-handling') // registers the "gestureHandling" map option
    return L
  })()
  return loadingLeaflet
}

export function supportsWebGL() {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    return false
  }
}

// MapLibre GL draws vector maps (OpenFreeMap) inside Leaflet. Loaded only when needed.
export function loadVectorSupport() {
  loadingVector ||= (async () => {
    await loadLeaflet()
    await import('maplibre-gl/dist/maplibre-gl.css')
    const [maplibregl, { default: workerUrl }] = await Promise.all([
      import('maplibre-gl'),
      // MapLibre processes map data in a web worker; once bundled it cannot find
      // the worker file by itself, so Vite ships it as a file and we pass its URL
      import('maplibre-gl/dist/maplibre-gl-worker.mjs?url')
    ])
    maplibregl.setWorkerUrl(workerUrl)
    const { maplibreGL } = await import('@maplibre/maplibre-gl-leaflet')
    return maplibreGL
  })()
  return loadingVector
}
