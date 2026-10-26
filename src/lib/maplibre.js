// Loads MapLibre GL on demand, so only the Sites page downloads it.
import 'maplibre-gl/dist/maplibre-gl.css'

let loading

export function supportsWebGL() {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    return false
  }
}

export function loadMapLibre() {
  loading ||= (async () => {
    const [maplibregl, { default: workerUrl }] = await Promise.all([
      import('maplibre-gl'),
      // MapLibre processes map data in a web worker; once bundled it cannot find
      // the worker file by itself, so Vite ships it as a file and we pass its URL
      import('maplibre-gl/dist/maplibre-gl-worker.mjs?url')
    ])
    maplibregl.setWorkerUrl(workerUrl)
    return maplibregl
  })()
  return loading
}
