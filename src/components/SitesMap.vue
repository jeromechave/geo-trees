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
      <div class="panel-header">
        <h3 class="panel-name">{{ selected.name }}</h3>
        <button type="button" class="panel-close" aria-label="Close" @click="closePanel">×</button>
      </div>
      <div class="panel-content">
        <p v-if="selected.country" class="panel-country">{{ selected.country }}</p>
        <p class="panel-coordinates">{{ selected.lat }}, {{ selected.lon }}</p>
        <p v-if="selected.description" class="panel-description">{{ selected.description }}</p>
      </div>
      <div v-if="selected.urls.length || hasDirectoryEntry(selected)" class="panel-links">
        <a v-for="(url, i) in selected.urls" :key="i" :href="url" target="_blank" rel="noopener">
          {{ selected.urls.length === 1 ? 'Visit the site’s website' : `Visit ${linkLabels(selected.urls)[i]}` }}
        </a>
        <button v-if="hasDirectoryEntry(selected)" type="button" @click="emit('show-in-directory', selected.slug)">
          See in the site directory
        </button>
      </div>
    </aside>

    <!-- Credits required by the background map's data providers -->
    <p class="sites-map-credits">
      <template v-for="(credit, i) in credits" :key="i">
        <a v-if="credit.url" :href="credit.url" target="_blank" rel="noopener">{{ credit.text }}</a>
        <span v-else>{{ credit.text }}</span>
        {{ ' ' }}
      </template>
      · <a href="https://maplibre.org" target="_blank" rel="noopener">MapLibre</a>
    </p>

    <p v-if="loading" class="sites-map-message">Loading sites…</p>
    <p v-else-if="error" class="sites-map-message" role="alert">
      The sites could not be loaded. Check your connection and reload the page.
    </p>
    <p v-else-if="noWebGL" class="sites-map-message" role="alert">
      This browser cannot display the map (WebGL is not available). The list of sites is below.
    </p>
  </section>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import { MAP_LAYERS, MEASUREMENT_STATES, MEASUREMENTS } from '@/config'
import { linkLabels, loadMapSites, slugify } from '@/lib/sheets'
import { loadMapLibre, supportsWebGL } from '@/lib/maplibre'
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
const noWebGL = ref(false)
const query = ref('')
const selected = shallowRef(null)
const activeLayer = ref(MAP_LAYERS[0].id)
const zoom = ref(0)

let maplibregl
let resizeObserver
const markers = new Map() // site.id -> { site, marker, leaderMarker }

const stateOf = (site, measurement) => MEASUREMENT_STATES.find((state) => state.id === site.measurements[measurement.id])
const showLabels = computed(() => zoom.value >= LABEL_ZOOM)
const hasDirectoryEntry = (site) => props.directorySlugs.has(site.slug)
const credits = computed(() => MAP_LAYERS.find((layer) => layer.id === activeLayer.value).credits)

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

// ---------- background maps ----------

function styleFor(layer) {
  if (layer.type === 'vector') return layer.style
  return {
    version: 8,
    sources: { background: { type: 'raster', tiles: [layer.url], tileSize: 256, maxzoom: layer.maxZoom || 18 } },
    layers: [{ id: 'background', type: 'raster', source: 'background' }]
  }
}

watch(activeLayer, (id) => {
  if (map.value) map.value.setStyle(styleFor(MAP_LAYERS.find((layer) => layer.id === id)), { diff: false })
})

// ---------- site markers ----------

// A site is drawn with two markers: first (so, below all bars) a dot at its true
// position and a leader line to its bar, shown only when the bar had to move to
// avoid another one; then the bar itself, with the site name above it.
function leaderElement() {
  const element = document.createElement('div')
  element.className = 'site-leader'
  element.innerHTML = '<span class="site-marker-leader"></span><span class="site-marker-anchor"></span>'
  return element
}

function barElement(site) {
  const element = document.createElement('div')
  element.className = 'site-marker'
  const label = document.createElement('span')
  label.className = 'site-marker-label'
  label.textContent = site.name // textContent: names from the sheet are never parsed as HTML
  const squares = MEASUREMENTS.map((measurement) => {
    const state = stateOf(site, measurement)
    return `<span class="site-bar-square fill-${state.fill}" style="--c:${state.color}"></span>`
  }).join('')
  element.innerHTML = `<span class="site-marker-body">${label.outerHTML}<span class="site-bar">${squares}</span></span>`
  element.setAttribute('role', 'button')
  element.setAttribute('tabindex', '0')
  element.setAttribute('aria-label', markerDescription(site))
  element.addEventListener('click', () => selectSite(site))
  element.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      selectSite(site)
    }
  })
  return element
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

// Moves bars apart so that none overlap (see lib/repel.js). On a flat map only zooming
// changes the distances between sites on screen, so this runs after every zoom.
function layoutMarkers() {
  if (!map.value || markers.size === 0) return
  const entries = [...markers.values()]
  const withLabels = showLabels.value
  const items = entries.map(({ site }) => {
    const point = map.value.project([site.lon, site.lat])
    if (!withLabels) return { x: point.x, y: point.y, width: BAR.width, height: BAR.height }
    // the box covers the bar and the name above it
    const height = BAR.height + LABEL.gap + LABEL.height
    return { x: point.x, y: point.y - (height - BAR.height) / 2, width: Math.max(BAR.width, labelWidth(site)), height }
  })
  // 5 px between bars, so a hovered or selected (enlarged) bar never touches another
  const offsets = repel(items, { gap: 5 })
  entries.forEach(({ marker, leaderMarker }, i) => {
    const { dx, dy } = offsets[i]
    const distance = Math.hypot(dx, dy)
    marker.getElement().querySelector('.site-marker-body').style.transform = `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px)`
    const leader = leaderMarker.getElement()
    leader.classList.toggle('displaced', distance > 2)
    const line = leader.querySelector('.site-marker-leader')
    line.style.width = `${distance.toFixed(1)}px`
    line.style.transform = `rotate(${Math.atan2(dy, dx)}rad)`
  })
}

function renderMarkers() {
  markers.forEach(({ marker, leaderMarker }) => {
    marker.remove()
    leaderMarker.remove()
  })
  markers.clear()
  const options = { anchor: 'center', subpixelPositioning: true }
  // all leaders first, so that every bar is drawn above every leader
  sites.value.forEach((site) => {
    const leaderMarker = new maplibregl.Marker({ ...options, element: leaderElement() }).setLngLat([site.lon, site.lat]).addTo(map.value)
    markers.set(site.id, { site, leaderMarker })
  })
  sites.value.forEach((site) => {
    const marker = new maplibregl.Marker({ ...options, element: barElement(site) }).setLngLat([site.lon, site.lat]).addTo(map.value)
    markers.get(site.id).marker = marker
  })
  layoutMarkers()
}

// ---------- view ----------

function fitAll({ animate = true } = {}) {
  if (!map.value || sites.value.length === 0) return
  const bounds = new maplibregl.LngLatBounds()
  sites.value.forEach((site) => bounds.extend([site.lon, site.lat]))
  const small = mapElement.value.clientWidth < 500
  const padding = small ? 25 : 40
  // leave room at the top for the search box and legend, where the map is tall enough
  const toolbar = mapElement.value.parentElement.querySelector('.sites-map-toolbar')
  const top = small ? padding : Math.max(padding, toolbar.offsetTop + toolbar.offsetHeight + 15)
  map.value.fitBounds(bounds, { padding: { top, bottom: padding, left: padding, right: padding }, maxZoom: 8, animate })
}

function resetView() {
  closePanel()
  fitAll()
}

function selectSite(site, { fly = false } = {}) {
  query.value = ''
  selected.value = selected.value === site && !fly ? null : site
  if (selected.value && fly) flyToSite(site)
  if (selected.value) nextTick(() => panel.value && panel.value.focus({ preventScroll: true }))
}

// On small screens the panel covers the bottom of the map: aim higher so the site stays visible
function flyToSite(site) {
  const small = window.matchMedia('(max-width: 700px)').matches
  map.value.flyTo({
    center: [site.lon, site.lat],
    zoom: Math.max(map.value.getZoom(), 7),
    offset: [0, small ? -mapElement.value.clientHeight * 0.2 : 0],
    duration: 1200,
    essential: true
  })
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
    if (marker) marker.getElement().classList.toggle('selected', Boolean(site) && site.id === id)
  })
})

onMounted(async () => {
  try {
    const loadedSites = await loadMapSites()
    sites.value = loadedSites
    emit('sites-loaded', new Set(loadedSites.map((site) => site.slug)))
    if (!supportsWebGL()) {
      noWebGL.value = true
      return
    }
    maplibregl = await loadMapLibre()
    map.value = new maplibregl.Map({
      container: mapElement.value,
      style: styleFor(MAP_LAYERS[0]),
      center: [0, 10],
      zoom: 1.5,
      minZoom: -1, // low enough for all sites to fit on a phone screen
      maxZoom: 14,
      maxPitch: 0,
      dragRotate: false,
      attributionControl: false, // credits are shown below the map controls
      cooperativeGestures: true, // ctrl / ⌘ + scroll to zoom, two fingers to move on phones
      locale: {
        'CooperativeGesturesHandler.WindowsHelpText': 'Use Ctrl + scroll to zoom the map',
        'CooperativeGesturesHandler.MacHelpText': 'Use ⌘ + scroll to zoom the map',
        'CooperativeGesturesHandler.MobileHelpText': 'Use two fingers to move the map'
      }
    })
    // keep the map's drawing size in step with its frame (fonts, layout changes)
    resizeObserver = new ResizeObserver(() => map.value && map.value.resize())
    resizeObserver.observe(mapElement.value)
    map.value.touchZoomRotate.disableRotation()
    map.value.keyboard.disableRotation()
    map.value.on('zoom', () => {
      zoom.value = map.value.getZoom()
    })
    map.value.on('zoomend', layoutMarkers)
    map.value.on('click', (event) => {
      if (!event.originalEvent.target.closest('.site-marker')) closePanel()
    })
    await new Promise((resolve) => map.value.once('load', resolve))
    zoom.value = map.value.getZoom()
    renderMarkers()
    fitAll({ animate: false })
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
  if (resizeObserver) resizeObserver.disconnect()
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
  // nothing drawn by the map (site bars, names, lines) may show outside its frame;
  // isolation keeps the map's layers from mixing with the rest of the page
  overflow: hidden;
  isolation: isolate;
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
  overflow: hidden;
  z-index: 0;
  background: #dfe5d8;
}

// ---------- markers ----------
// The marker element itself sits on the site's true position (BAR size, centred);
// .site-marker-body is moved by layoutMarkers() when bars would overlap.
.site-marker {
  width: 20px; // BAR in the script
  height: 6px;
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
  // a hovered or selected site comes above its neighbours
  &:hover, &:focus-visible, &.selected { z-index: 2; }
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
  width: 20px; // BAR in the script
  height: 6px;
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
.panel-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 10px 10px 10px 16px;
  background: $navy;
  color: #fff;

  .panel-name {
    flex: 1;
    margin: 0;
    padding-top: 3px;
    font-family: "Lato-Bold", sans-serif;
    font-size: 15px;
    line-height: 1.3;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    overflow-wrap: anywhere; // long names wrap instead of widening the panel
  }
  .panel-close {
    flex: none;
    width: 26px;
    height: 26px;
    border: 0;
    background: none;
    color: #fff;
    font-size: 20px;
    line-height: 1;
  }
}
.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 11px 16px 13px;

  p { margin: 0; }
  .panel-country { font-size: 13px; line-height: 1.4; font-style: italic; }
  .panel-coordinates { margin-top: 1px; font-size: 11px; letter-spacing: 0.05em; opacity: 0.75; }
  .panel-description { margin-top: 10px; font-size: 13px; line-height: 1.55; }
}
.panel-links {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 11px 16px;
  background: $light;

  a, button {
    padding: 0;
    border: 0;
    background: none;
    color: $navy;
    font-family: "Lato-Bold", sans-serif;
    font-size: 13px;
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

.sites-map-credits {
  position: absolute;
  right: 0;
  bottom: 0;
  z-index: 500;
  margin: 0;
  padding: 2px 6px;
  max-width: calc(100% - 12px);
  background: rgba(255, 255, 255, 0.8);
  font-size: 11px;
  line-height: 1.4;
  color: $navy;
  a { color: $navy; }
}

// MapLibre's "use ctrl + scroll" message, in the site's font
.sites-map .maplibregl-cooperative-gesture-screen {
  font-family: "Lato-Regular", sans-serif;
  z-index: 550;
}

// ---------- small screens: panel becomes a bottom sheet ----------
@media screen and (max-width: 700px) {
  .sites-map {
    // close to square: a flat map cannot zoom out beyond the world's height, so on a
    // tall narrow map the sites (258° of longitude) would not all fit side by side
    height: clamp(400px, 112vw, 560px);
  }
  .sites-map-toolbar {
    top: 12px;
    left: 12px;
    width: calc(100% - 24px);
  }
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
