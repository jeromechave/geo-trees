// Loads Leaflet and its plugins on demand, so only the Sites page downloads them.
// Both plugins are UMD builds that expect Leaflet as a global "L".
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet-gesture-handling/dist/leaflet-gesture-handling.css'

let loading

export function loadLeaflet() {
  loading ||= (async () => {
    const { default: L } = await import('leaflet')
    window.L = L
    await import('leaflet.markercluster')
    await import('leaflet-gesture-handling') // registers the "gestureHandling" map option
    return L
  })()
  return loading
}
