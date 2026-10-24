# Changelog

## 2.0.3 (2026-10-24)

### Changed
- The "Satellite" background is now EOX's Sentinel-2 cloudless mosaic (2024)
  instead of a Mapbox style. The site no longer uses Mapbox at all: no account,
  token or style from any Mapbox account remains.

### Added
- `VITE_EOX_YEAR` to choose another year of the mosaic (2020 to 2024).

### Removed
- `VITE_MAPBOX_TOKEN` and `VITE_MAPBOX_STYLE_SATELLITE`.

## 2.0.2 (2026-10-24)

### Changed
- The "Outdoors" background map is now OpenFreeMap's Liberty style (open, no
  account or API key) instead of a Mapbox style from a personal account. It is
  drawn by MapLibre GL 6.13, loaded only on the Sites page.
- "Satellite" is unchanged (Mapbox) and is only loaded when selected.

### Added
- Browsers without WebGL get OpenStreetMap's standard map as the outdoors view.
- `VITE_OPENFREEMAP_STYLE` to choose another OpenFreeMap style.

## 2.0.1 (2026-10-24)

### Changed
- The sites map is now part of the site instead of the separate app embedded
  from `geo-trees.org/carto/`. Same data (`Datas` tab), diamonds, status filters,
  site search, outdoors/satellite switch and site panel.
- Leaflet 1.9.4 (was 1.0.3); it loads only on the Sites page.
- The legend and the diamonds now use the same colours (ongoing was light green
  in the legend but amber on the map).

### Added
- Links between the map and the site directory ("See in the site directory",
  "Show on map") for sites whose names match.
- Map and Mapbox style settings in `src/config.js`, overridable with
  `VITE_MAPBOX_TOKEN`, `VITE_MAPBOX_STYLE_OUTDOORS`, `VITE_MAPBOX_STYLE_SATELLITE`.
- Keyboard and screen-reader support: markers, filters, layer switch and panel are
  buttons with labels; Esc closes the panel.
- Console messages for rows with invalid coordinates or an unknown status, and for
  names present in only one of the two tabs.
- On phones the site panel opens as a bottom sheet and the map keeps the selected
  site visible above it.

### Fixed
- Mapbox and OpenStreetMap attribution is shown again (it was hidden, which their
  terms do not allow).
- A status typo (e.g. `Réalisé`, `completed`, a trailing space) no longer makes a
  site disappear from the map.
- Coordinates written with a decimal comma are read correctly.
- Site names from the sheet are always displayed as text, never interpreted as HTML.

### Removed
- The unused Esri scripts (a 2014 beta) loaded from a third-party bucket, the map's
  service worker, and the place search (searching any address on OpenStreetMap).

## 2.0.0 (2026-10-23)

The site moves from Vue 2 / Vue CLI to Vue 3 / Vite. Pages, URLs, content and
look are unchanged.

### Changed
- Vue 3 with `<script setup>`; Vite 8 replaces Vue CLI 4 and webpack 4.
- Requires Node 20.19 or later (`.nvmrc`: 22).
- Vue is shared between pages: 116 kB of JavaScript in total instead of 1.6 MB.
- Vuex, axios and lodash removed; pages load their sheet with `useSheet()`.
- Each page has its own `<title>`.
- `npm run serve` is now `npm run dev`.
- The API key override is now `VITE_SHEETS_API_KEY` (was `VUE_APP_SHEETS_API_KEY`).

### Fixed
- Pages no longer fail to load when a Google Sheet row has empty trailing cells.
- Empty list cells no longer show empty labels (e.g. "Networks:").
- `npm run deploy` no longer deletes files uploaded directly to `gh-pages`,
  no longer force-pushes, and no longer discards uncommitted local changes.
- The active menu link no longer disappears when the URL has `?query` or `#hash`.

### Added
- A message when a Google Sheet cannot be loaded.
- Accessibility: menu button with `aria-expanded`, `aria-current` on the active
  link, labelled social icons, visible keyboard focus, image alt text, map title.
- `npm run deploy -- --clean` removes leftover files from `gh-pages`.
- README: local setup, deployment, images, API key restriction.

### Removed
- The `about-us-2` test page.
- 142 unused images from `src/assets` (the published site is unaffected).
