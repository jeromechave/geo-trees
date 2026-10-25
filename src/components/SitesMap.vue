<template>
  <section class="sites-map" aria-label="Map of the Biomass Reference Measurement sites" @keydown.esc="closePanel">
    <div ref="mapElement" class="sites-map-canvas" :class="{ 'show-labels': showLabels }"></div>

    <!-- Search and filters -->
    <div class="sites-map-toolbar">
      <div class="sites-map-search">
        <label class="visually-hidden" for="sites-map-search-input">Search a site</label>
        <input
          id="sites-map-search-input"
          v-model="query"
          type="search"
          placeholder="Search a site"
          autocomplete="off"
          @keydown.enter.prevent="searchResults.length && selectSite(searchResults[0], { fly: true })"
        >
        <ul v-if="query.trim()" class="sites-map-search-results">
          <li v-for="site in searchResults" :key="site.id">
            <button type="button" @click="selectSite(site, { fly: true })">
              <span class="result-name">{{ site.name }}</span>
              <span class="result-country">{{ site.country }}</span>
            </button>
          </li>
          <li v-if="searchResults.length === 0" class="no-result">No site found</li>
        </ul>
      </div>

      <div class="sites-map-filters" role="group" aria-label="Filter by status">
        <button
          v-for="status in SITE_STATUSES"
          :key="status.id"
          type="button"
          class="sites-map-filter"
          :class="{ off: !visibleStatuses[status.id] }"
          :aria-pressed="visibleStatuses[status.id] ? 'true' : 'false'"
          @click="toggleStatus(status.id)"
        >
          <span class="swatch" :class="'fill-' + status.fill" :style="{ '--c': status.color }" aria-hidden="true"></span>
          {{ status.label }}
          <span class="count">{{ counts[status.id] }}</span>
        </button>
      </div>

      <div class="sites-map-legend">
        <div class="legend-bar" aria-hidden="true">
          <span v-for="measurement in MEASUREMENTS" :key="measurement.id" class="legend-square">
            <span class="square"></span>
            <span class="legend-caption">{{ measurement.short }}</span>
          </span>
        </div>
        <p class="visually-hidden">
          Each site is a bar of three squares: {{ MEASUREMENTS.map((measurement) => measurement.label).join(', ') }}.
        </p>
        <ul class="legend-states">
          <li v-for="state in MEASUREMENT_STATES" :key="state.id">
            <span class="swatch" :class="'fill-' + state.fill" :style="{ '--c': state.color }" aria-hidden="true"></span>{{ state.label }}
          </li>
        </ul>
      </div>
    </div>

    <!-- Background map -->
    <div class="sites-map-layers" role="group" aria-label="Background map">
      <button
        v-for="layer in MAP_LAYERS"
        :key="layer.id"
        type="button"
        :aria-pressed="activeLayer === layer.id ? 'true' : 'false'"
        @click="activeLayer = layer.id"
      >{{ layer.label }}</button>
    </div>

    <!-- Zoom and reset -->
    <div class="sites-map-controls">
      <button type="button" aria-label="Zoom in" @click="map && map.zoomIn()">+</button>
      <button type="button" aria-label="Zoom out" @click="map && map.zoomOut()">−</button>
      <button type="button" aria-label="Show all sites" class="reset" @click="resetView">
        <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 7V3h4M17 7V3h-4M3 13v4h4M17 13v4h-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
    </div>

    <!-- Selected site -->
    <aside
      v-if="selected"
      ref="panel"
      class="sites-map-panel"
      tabindex="-1"
      :aria-label="selected.name"
    >
      <div class="panel-status">
        <span class="swatch" :class="'fill-' + statusOf(selected).fill" :style="{ '--c': statusOf(selected).color }" aria-hidden="true"></span>
        <span class="status-text">{{ statusOf(selected).label }}</span>
        <span v-if="selected.date" class="status-date">{{ selected.date }}</span>
        <button type="button" class="panel-close" aria-label="Close" @click="closePanel">×</button>
      </div>
      <div class="panel-content">
        <p v-if="selected.country" class="panel-country">{{ selected.country }}</p>
        <h3 class="panel-name">{{ selected.name }}</h3>
        <p class="panel-coordinates">{{ selected.lat }}, {{ selected.lon }}</p>
        <p v-if="selected.description" class="panel-description">{{ selected.description }}</p>
        <hr>
        <p class="panel-measurements-title">Measurements:</p>
        <ul class="panel-measurements">
          <li v-for="measurement in MEASUREMENTS" :key="measurement.id">
            <span
              class="swatch"
              :class="'fill-' + stateOf(selected, measurement).fill"
              :style="{ '--c': stateOf(selected, measurement).color }"
              aria-hidden="true"
            ></span>
            <span class="measurement-name">{{ measurement.label }} ({{ measurement.short }})</span>
            <span class="measurement-state">{{ stateOf(selected, measurement).label }}</span>
          </li>
        </ul>
      </div>
      <div v-if="selected.url || hasDirectoryEntry(selected)" class="panel-links">
        <a v-if="selected.url" :href="selected.url" target="_blank" rel="noopener">Visit the site’s website</a>
        <button v-if="hasDirectoryEntry(selected)" type="button" @click="emit('show-in-directory', selected.slug)">
          See in the site directory
        </button>
      </div>
    </aside>

    <p v-if="loading" class="sites-map-message">Loading sites…</p>
    <p v-else-if="error" class="sites-map-message" role="alert">
      The sites could not be loaded. Check your connection and reload the page.
    </p>
  </section>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, shallowRef, watch } from 'vue'
import { MAP_FALLBACK_LAYER, MAP_LAYERS, MEASUREMENT_STATES, MEASUREMENTS, SITE_STATUSES } from '@/config'
import { loadMapSites, slugify } from '@/lib/sheets'
import { loadLeaflet, loadVectorSupport, supportsWebGL } from '@/lib/leaflet'
import { repel } from '@/lib/repel'

const props = defineProps({
  // slugs of the sites listed in the site directory, to link the two
  directorySlugs: { type: Object, default: () => new Set() }
})
const emit = defineEmits(['sites-loaded', 'show-in-directory'])

const LABEL_ZOOM = 5 // site names appear from this zoom level

// Size of a site's bar in pixels (keep in sync with .site-bar in the styles)
// 3 squares of 6 px with 1 px between them (no frame)
const BAR = { width: 20, height: 6 }
// Site name above the bar: height, gap to the bar, and font used to measure it
const LABEL = { height: 22, gap: 6, font: '12px Lato-Bold, sans-serif', padding: 18 }

const mapElement = ref(null)
const panel = ref(null)
const map = shallowRef(null)
const sites = shallowRef([])
const loading = ref(true)
const error = ref(null)
const query = ref('')
const selected = shallowRef(null)
const activeLayer = ref(MAP_LAYERS[0].id)
const zoom = ref(0)
const visibleStatuses = reactive(Object.fromEntries(SITE_STATUSES.map((status) => [status.id, true])))

let L
let markerLayer
let tileLayers = {}
const markers = new Map() // site.id -> Leaflet marker

const statusOf = (site) => SITE_STATUSES.find((status) => status.id === site.status)
const stateOf = (site, measurement) => MEASUREMENT_STATES.find((state) => state.id === site.measurements[measurement.id])
const showLabels = computed(() => zoom.value >= LABEL_ZOOM)
const hasDirectoryEntry = (site) => props.directorySlugs.has(site.slug)

const counts = computed(() =>
  Object.fromEntries(SITE_STATUSES.map((status) => [status.id, sites.value.filter((site) => site.status === status.id).length]))
)

const searchResults = computed(() => {
  const words = slugify(query.value)
  if (!words) return []
  const seen = new Set()
  return sites.value
    .filter((site) => slugify(`${site.name} ${site.country}`).includes(words))
    .filter((site) => !seen.has(site.slug) && seen.add(site.slug))
    .sort((a, b) => a.name.localeCompare(b.name))
    .slice(0, 8)
})

// First click on a status when all are shown keeps only that one;
// after that, clicks toggle (at least one status always stays visible).
function toggleStatus(id) {
  const shown = SITE_STATUSES.filter((status) => visibleStatuses[status.id])
  if (shown.length === SITE_STATUSES.length) {
    SITE_STATUSES.forEach((status) => { visibleStatuses[status.id] = status.id === id })
  } else if (!visibleStatuses[id]) {
    visibleStatuses[id] = true
  } else if (shown.length > 1) {
    visibleStatuses[id] = false
  } else {
    SITE_STATUSES.forEach((status) => { visibleStatuses[status.id] = true })
  }
}

// A site is drawn with two markers: in a layer below all bars, a dot at its true
// position and a leader line to its bar (shown only when the bar had to move to
// avoid another one); above, the bar itself with the name above it.
const leaderHtml = '<span class="site-marker-leader"></span><span class="site-marker-anchor"></span>'

function markerHtml(site) {
  const label = document.createElement('span')
  label.className = 'site-marker-label'
  label.textContent = site.name // textContent: names from the sheet are never parsed as HTML
  const squares = MEASUREMENTS.map((measurement) => {
    const state = stateOf(site, measurement)
    return `<span class="site-bar-square fill-${state.fill}" style="--c:${state.color}"></span>`
  }).join('')
  return `<span class="site-marker-body">${label.outerHTML}<span class="site-bar">${squares}</span></span>`
}

const markerDescription = (site) =>
  `${site.name}: ` + MEASUREMENTS.map((measurement) => `${measurement.short} ${stateOf(site, measurement).label.toLowerCase()}`).join(', ')

// Width of each site name in pixels, measured once
const labelWidths = new Map()
function labelWidth(site) {
  if (!labelWidths.has(site.id)) {
    const context = document.createElement('canvas').getContext('2d')
    context.font = LABEL.font
    labelWidths.set(site.id, Math.ceil(context.measureText(site.name).width * 1.08) + LABEL.padding)
  }
  return labelWidths.get(site.id)
}

// Moves bars apart so that none overlap at the current zoom level (see lib/repel.js).
// Runs after every zoom; panning does not change the layout.
function layoutMarkers() {
  if (!map.value || markers.size === 0) return
  const entries = [...markers.values()]
  const withLabels = showLabels.value
  const items = entries.map(({ site, marker }) => {
    const point = map.value.latLngToLayerPoint(marker.getLatLng())
    if (!withLabels) return { x: point.x, y: point.y, width: BAR.width, height: BAR.height }
    // the box covers the bar and the name above it
    const height = BAR.height + LABEL.gap + LABEL.height
    return { x: point.x, y: point.y - (height - BAR.height) / 2, width: Math.max(BAR.width, labelWidth(site)), height }
  })
  // 5 px between bars, so a hovered or selected (enlarged) bar never touches another
  const offsets = repel(items, { gap: 5 })
  entries.forEach(({ marker, leaderMarker }, i) => {
    const element = marker.getElement()
    const leaderElement = leaderMarker.getElement()
    if (!element || !leaderElement) return
    const { dx, dy } = offsets[i]
    const distance = Math.hypot(dx, dy)
    element.querySelector('.site-marker-body').style.transform = `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px)`
    leaderElement.classList.toggle('displaced', distance > 2)
    const leader = leaderElement.querySelector('.site-marker-leader')
    leader.style.width = `${distance.toFixed(1)}px`
    leader.style.transform = `rotate(${Math.atan2(dy, dx)}rad)`
  })
}

function renderMarkers() {
  if (!markerLayer) return
  markerLayer.clearLayers()
  markers.clear()
  sites.value
    .filter((site) => visibleStatuses[site.status])
    .forEach((site) => {
      const marker = L.marker([site.lat, site.lon], {
        icon: L.divIcon({ className: 'site-marker', html: markerHtml(site), iconSize: [BAR.width, BAR.height] }),
        riseOnHover: true
      })
      marker.on('click', () => selectSite(site))
      marker.on('add', () => {
        const element = marker.getElement()
        element.setAttribute('role', 'button')
        element.setAttribute('aria-label', markerDescription(site))
        // Leaflet makes markers focusable but does not open them with the keyboard
        element.onkeydown = (event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            selectSite(site)
          }
        }
        element.classList.toggle('selected', selected.value === site)
      })
      const leaderMarker = L.marker([site.lat, site.lon], {
        pane: 'siteLeaders',
        interactive: false,
        keyboard: false,
        icon: L.divIcon({ className: 'site-leader', html: leaderHtml, iconSize: [BAR.width, BAR.height] })
      })
      markers.set(site.id, { site, marker, leaderMarker })
      markerLayer.addLayer(leaderMarker)
      markerLayer.addLayer(marker)
    })
  layoutMarkers()
}

function fitAll() {
  const visible = [...markers.values()].map((entry) => entry.marker)
  if (!map.value || visible.length === 0) return
  map.value.fitBounds(L.featureGroup(visible).getBounds(), { padding: [40, 40], maxZoom: 8 })
}

function resetView() {
  closePanel()
  fitAll()
}

function selectSite(site, { fly = false } = {}) {
  query.value = ''
  if (!visibleStatuses[site.status]) visibleStatuses[site.status] = true
  selected.value = selected.value === site && !fly ? null : site
  if (selected.value && fly) {
    nextTick(() => {
      const entry = markers.get(site.id)
      if (entry) flyToSite(entry.marker.getLatLng())
    })
  }
  if (selected.value) nextTick(() => panel.value && panel.value.focus({ preventScroll: true }))
}

// On small screens the panel covers the bottom of the map: aim higher so the site stays visible
function flyToSite(latLng) {
  const zoomLevel = Math.max(map.value.getZoom(), 7)
  let target = latLng
  if (window.matchMedia('(max-width: 700px)').matches) {
    const offset = map.value.getSize().y * 0.28
    target = map.value.unproject(map.value.project(latLng, zoomLevel).add([0, offset]), zoomLevel)
  }
  map.value.flyTo(target, zoomLevel, { duration: 1.2 })
}

function closePanel() {
  selected.value = null
}

// Called by the Sites page ("Show on map" in the directory)
function focusSite(slug) {
  const site = sites.value.find((item) => item.slug === slug)
  if (site) selectSite(site, { fly: true })
}
defineExpose({ focusSite })

watch(selected, (site) => {
  markers.forEach(({ marker }, id) => {
    const element = marker.getElement()
    if (element) element.classList.toggle('selected', Boolean(site) && site.id === id)
  })
})

watch(visibleStatuses, () => {
  if (selected.value && !visibleStatuses[selected.value.status]) selected.value = null
  renderMarkers()
  fitAll()
})

// Background layers are created the first time they are shown
async function createBackground(layer) {
  if (layer.type === 'vector') {
    if (supportsWebGL()) {
      const maplibreGL = await loadVectorSupport()
      return maplibreGL({ style: layer.style, attributionControl: { customAttribution: layer.attribution } })
    }
    layer = MAP_FALLBACK_LAYER
  }
  return L.tileLayer(layer.url, {
    attribution: layer.attribution,
    maxZoom: layer.maxZoom || 18,
    maxNativeZoom: layer.maxNativeZoom || layer.maxZoom || 18
  })
}

let backgroundRequest = 0
async function showBackground(id) {
  const request = ++backgroundRequest
  if (!tileLayers[id]) tileLayers[id] = await createBackground(MAP_LAYERS.find((layer) => layer.id === id))
  if (request !== backgroundRequest || !map.value) return // the user switched again meanwhile
  Object.entries(tileLayers).forEach(([layerId, layer]) => {
    if (layerId !== id && map.value.hasLayer(layer)) map.value.removeLayer(layer)
  })
  if (!map.value.hasLayer(tileLayers[id])) tileLayers[id].addTo(map.value)
}

watch(activeLayer, (id) => {
  if (map.value) showBackground(id)
})

onMounted(async () => {
  try {
    const [leaflet, loadedSites] = await Promise.all([loadLeaflet(), loadMapSites()])
    L = leaflet
    sites.value = loadedSites
    emit('sites-loaded', new Set(loadedSites.map((site) => site.slug)))

    map.value = L.map(mapElement.value, {
      zoomControl: false,
      minZoom: 2,
      maxZoom: 14,
      worldCopyJump: true,
      gestureHandling: true,
      gestureHandlingOptions: {
        text: {
          touch: 'Use two fingers to move the map',
          scroll: 'Use ctrl + scroll to zoom the map',
          scrollMac: 'Use ⌘ + scroll to zoom the map'
        }
      },
    }).setView([5, 0], 2)
    showBackground(activeLayer.value)
    map.value.attributionControl.setPrefix('<a href="https://leafletjs.com" target="_blank" rel="noopener">Leaflet</a>')
    map.value.on('zoomend', () => {
      zoom.value = map.value.getZoom()
      layoutMarkers()
    })
    map.value.on('click', closePanel)

    // leader lines and true-position dots go below every bar
    map.value.createPane('siteLeaders').style.zIndex = 590
    markerLayer = L.layerGroup().addTo(map.value)

    zoom.value = map.value.getZoom()
    renderMarkers()
    fitAll()
    // the site names use a web font: lay out again once it is loaded
    document.fonts && document.fonts.ready.then(() => { labelWidths.clear(); layoutMarkers() })
  } catch (e) {
    console.error(e)
    error.value = e
  } finally {
    loading.value = false
  }
})

onBeforeUnmount(() => {
  if (map.value) map.value.remove()
})
</script>

<style lang="scss">
$navy: #213043;
$green: #53A034;
$light: #F3F5E5;

.visually-hidden {
  position: absolute !important;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

.sites-map {
  position: relative;
  height: clamp(460px, 72vh, 640px);
  font-family: "Lato-Regular", sans-serif;
  color: $navy;
  text-align: left; // the site's sections centre their text
  background: #dfe5d8;

  button {
    font: inherit;
    color: inherit;
    cursor: pointer;
  }
  button:focus-visible, input:focus-visible, a:focus-visible {
    outline: 2px solid $green;
    outline-offset: 2px;
  }
}

.sites-map-canvas {
  position: absolute;
  inset: 0;
  z-index: 0;
  background: #dfe5d8;
}

// ---------- markers ----------
// The marker element itself sits on the site's true position (BAR size, centred);
// .site-marker-body is moved by layoutMarkers() when bars would overlap.
.site-marker {
  background: none;
  border: 0;
  overflow: visible;
  // only the bar is clickable, not the (possibly empty) spot where the site really is
  pointer-events: none !important;
  .site-bar { pointer-events: auto; cursor: pointer; }
  // slightly larger clickable area than the small bar (stays within the 5 px between bars)
  .site-bar::after { content: ""; position: absolute; inset: -2px; }

  &:focus-visible { outline: none; }
  &:focus-visible .site-bar { outline: 2px solid $navy; outline-offset: 2px; }
}
.site-marker-body {
  position: absolute;
  inset: 0;
  transition: transform 0.25s ease-out;
}
.site-bar {
  position: absolute;
  inset: 0;
  display: flex;
  gap: 1px;
  // shadow follows the squares' shapes, so they stand out on any background
  filter: drop-shadow(0 0.5px 1.5px rgba(33, 48, 67, 0.6));
  transition: transform 0.15s ease-out;
}
.site-bar-square {
  flex: 1;
  // thinner outline than elsewhere: the squares are only 6 px
  &.fill-empty, &.fill-half { box-shadow: inset 0 0 0 1px var(--c); }
}
.site-marker:hover .site-bar,
.site-marker:focus-visible .site-bar,
.site-marker.selected .site-bar {
  transform: scale(1.2); // grows 2.5 px per side: less than the spacing kept by layoutMarkers()
}
.site-marker.selected .site-bar {
  outline: 1.5px solid $navy;
  outline-offset: 1.5px;
}
// shown when the bar was moved away from the site's real position
.site-marker-anchor {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 4px;
  height: 4px;
  margin: -2px 0 0 -2px;
  border-radius: 50%;
  background: $navy;
  box-shadow: 0 0 0 1px #fff;
  opacity: 0;
}
.site-marker-leader {
  position: absolute;
  left: 50%;
  top: 50%;
  height: 1px;
  margin-top: -0.5px;
  background: $navy;
  transform-origin: 0 50%;
  opacity: 0;
  transition: width 0.25s ease-out, transform 0.25s ease-out;
}
.site-leader {
  background: none;
  border: 0;
  overflow: visible;
  pointer-events: none;
  &.displaced {
    .site-marker-anchor,
    .site-marker-leader { opacity: 0.85; }
  }
}
.site-marker-label {
  position: absolute;
  bottom: 12px; // bar height + gap (BAR.height + LABEL.gap in the script)
  left: 50%;
  transform: translateX(-50%);
  padding: 3px 9px;
  background: #fff;
  border-radius: 3px;
  box-shadow: 0 0 14px rgba(33, 48, 67, 0.35);
  font-family: "Lato-Bold", sans-serif;
  font-size: 12px;
  line-height: 16px;
  white-space: nowrap;
  color: $navy;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s ease-out;
}
.show-labels .site-marker-label,
.site-marker:hover .site-marker-label,
.site-marker:focus-visible .site-marker-label,
.site-marker.selected .site-marker-label {
  opacity: 1;
}

// ---------- overlays ----------
.sites-map-toolbar {
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 500;
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: min(320px, calc(100% - 32px));
}
.sites-map-search {
  position: relative;

  input {
    box-sizing: border-box;
    width: 100%;
    height: 42px;
    padding: 0 14px;
    border: 0;
    border-radius: 4px;
    box-shadow: 0 2px 10px rgba(33, 48, 67, 0.25);
    font: 15px "Lato-Regular", sans-serif;
    color: $navy;
  }
}
.sites-map-search-results {
  position: absolute;
  top: 46px;
  left: 0;
  right: 0;
  margin: 0;
  padding: 4px 0;
  list-style: none;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 4px 16px rgba(33, 48, 67, 0.3);

  button {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    width: 100%;
    padding: 9px 14px;
    border: 0;
    background: none;
    text-align: left;
    &:hover, &:focus-visible { background: $light; }
  }
  .result-name { font-family: "Lato-Bold", sans-serif; }
  .result-country { font-style: italic; opacity: 0.75; }
  .no-result { padding: 9px 14px; font-style: italic; }
}
.sites-map-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.sites-map-filter {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 6px 10px;
  border: 0;
  border-radius: 4px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(33, 48, 67, 0.2);
  font-size: 13px;

  .count {
    font-family: "Lato-Bold", sans-serif;
  }
  &.off {
    background: rgba(255, 255, 255, 0.7);
    color: rgba(33, 48, 67, 0.55);
    .swatch { opacity: 0.35; }
  }
}
.swatch {
  display: inline-block;
  width: 10px;
  height: 10px;
  flex: none;
}
// State shown by fill level as well as colour (see MEASUREMENT_STATES in config.js):
// --c is the state's colour, set inline
.fill-empty {
  background: #fff;
  box-shadow: inset 0 0 0 1.5px var(--c);
}
.fill-half {
  background: linear-gradient(to top, var(--c) 50%, #fff 50%);
  box-shadow: inset 0 0 0 1.5px var(--c);
}
.fill-full {
  background: var(--c);
}

.sites-map-legend {
  display: flex;
  align-items: center;
  gap: 14px;
  align-self: flex-start;
  padding: 7px 12px 6px;
  background: rgba(255, 255, 255, 0.94);
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(33, 48, 67, 0.2);
  font-size: 12px;

  .legend-bar {
    display: flex;
    gap: 3px;
  }
  .legend-square {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    .square {
      width: 14px;
      height: 14px;
      border-radius: 1px;
      background: #9aa3ad;
      box-shadow: 0 0 0 1px #fff, 0 0 0 2px #c6ccd2;
    }
  }
  .legend-caption {
    font-family: "Lato-Bold", sans-serif;
    font-size: 10px;
    line-height: 12px;
  }
  .legend-states {
    display: flex;
    flex-direction: column;
    gap: 2px;
    margin: 0;
    padding: 0 0 0 14px;
    list-style: none;
    border-left: 1px solid #d1dcc4;
    li { display: flex; align-items: center; gap: 6px; line-height: 14px; }
  }
}

.sites-map-layers {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 500;
  display: flex;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(33, 48, 67, 0.2);

  button {
    padding: 8px 12px;
    border: 0;
    background: #fff;
    font-size: 13px;
    &[aria-pressed="true"] {
      background: $navy;
      color: #fff;
    }
  }
}

.sites-map-controls {
  position: absolute;
  right: 16px;
  bottom: 36px;
  z-index: 500;
  display: flex;
  flex-direction: column;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(33, 48, 67, 0.2);

  button {
    width: 36px;
    height: 36px;
    border: 0;
    border-bottom: 1px solid #e3e7dc;
    background: #fff;
    font-size: 20px;
    line-height: 1;
    &:last-child { border-bottom: 0; }
    &:hover { background: $light; }
  }
  .reset svg { width: 18px; height: 18px; vertical-align: middle; }
}

.sites-map-panel {
  position: absolute;
  top: 66px;
  right: 16px;
  z-index: 600;
  display: flex;
  flex-direction: column;
  width: 340px;
  // stays above the zoom buttons
  max-height: calc(100% - 66px - 170px);
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 6px 24px rgba(33, 48, 67, 0.35);
  overflow: hidden;

  &:focus { outline: none; }
}
.panel-status {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px 12px 20px;
  background: $navy;
  color: #fff;

  .swatch { width: 11px; height: 11px; outline: 1.5px solid #fff; }
  .status-text { font-family: "Lato-Bold", sans-serif; text-transform: uppercase; letter-spacing: 0.06em; }
  .status-date { opacity: 0.8; font-size: 14px; }
  .panel-close {
    margin-left: auto;
    width: 30px;
    height: 30px;
    border: 0;
    background: none;
    color: #fff;
    font-size: 24px;
    line-height: 1;
  }
}
.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;

  p { margin: 0; }
  .panel-country { font-style: italic; }
  .panel-name {
    margin: 2px 0;
    font-family: "Lato-Bold", sans-serif;
    font-size: 21px;
    line-height: 1.2;
    text-transform: uppercase;
  }
  .panel-coordinates { font-size: 12px; letter-spacing: 0.05em; opacity: 0.75; }
  .panel-description { margin-top: 12px; font-size: 14px; line-height: 1.6; }
  hr { margin: 16px 0; border: 0; border-top: 1px solid #d1dcc4; }
  .panel-measurements-title { font-style: italic; margin-bottom: 8px; }
  .panel-measurements {
    margin: 0;
    padding: 0;
    list-style: none;
    li {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 7px;
      font-size: 14px;
    }
    .swatch { width: 12px; height: 12px; }
    .measurement-name { flex: 1; }
    .measurement-state { font-family: "Lato-Bold", sans-serif; }
  }
}
.panel-links {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px 20px;
  background: $light;

  a, button {
    padding: 0;
    border: 0;
    background: none;
    color: $navy;
    font-family: "Lato-Bold", sans-serif;
    font-size: 15px;
    text-align: left;
    text-decoration: underline;
    text-underline-offset: 3px;
  }
}

.sites-map-message {
  position: absolute;
  left: 50%;
  bottom: 40px;
  z-index: 700;
  transform: translateX(-50%);
  margin: 0;
  padding: 10px 16px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(33, 48, 67, 0.25);
  font-size: 14px;
}

// Leaflet's own attribution and gesture message, in the site's style
.sites-map .leaflet-control-attribution {
  font-family: "Lato-Regular", sans-serif;
  font-size: 11px;
}
.sites-map .leaflet-gesture-handling:after {
  font-family: "Lato-Regular", sans-serif;
}

// ---------- small screens: panel becomes a bottom sheet ----------
@media screen and (max-width: 700px) {
  .sites-map {
    height: clamp(480px, 78vh, 620px);
  }
  .sites-map-toolbar {
    top: 12px;
    left: 12px;
    width: calc(100% - 24px);
  }
  .sites-map-filter { padding: 5px 8px; font-size: 12px; }
  .sites-map-layers {
    top: auto;
    right: auto;
    left: 12px;
    bottom: 28px;
  }
  .sites-map-controls { right: 12px; bottom: 28px; }
  .sites-map-panel {
    top: auto;
    left: 0;
    right: 0;
    bottom: 0;
    width: auto;
    max-height: 62%;
    border-radius: 10px 10px 0 0;
  }
}
</style>
