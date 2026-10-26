# Changelog

## 2.1.2 (2026-10-25)

### Changed
- Sites page: slimmer title band; the map starts right below the title (the dark
  band above the map goes from about 240 to 100 px).
- The map opens on latitudes 60°S to 60°N (with a small margin), across all sites;
  "Show all sites" returns to this view. On narrow screens, where all sites must fit
  side by side, it shows more latitude. If a site would lie under the search box or
  legend, the view is fitted below them.

## 2.1.1 (2026-10-25)

### Changed
- The sites map is a flat map again (Mercator projection), as up to 2.0.19, instead
  of the globe of 2.1.0: all sites are visible at once and the zoom is continuous.
  It keeps everything else from 2.1.0: drawn by MapLibre alone (no Leaflet), the
  three-square bars with their non-overlapping layout, panel, search, legend, both
  backgrounds, built-in gestures and credits.

### Fixed
- Site bars, names and lines no longer show outside the map's frame (some browsers
  drew sites beyond its edge, over the page's title band). The map also follows any
  change of its frame's size.

## 2.1.0 (2026-10-25)

### Changed
- The sites map is a globe instead of a flat Mercator map: at world scale, tropical
  and polar areas are shown at their true relative size; zooming in flattens it into
  a usual map. It opens on the whole globe, turned to the side with the most sites
  (a globe shows one hemisphere at a time); sites on the far side are hidden until
  the globe is turned. Search and "Show on map" turn the globe to the site.
- The map is drawn by MapLibre GL alone (it was Leaflet with MapLibre drawing the
  background): same bars, non-overlapping layout, panel, search, legend, background
  switch and links to the directory. The layout is recalculated after every move,
  since turning a globe moves sites relative to each other.
- "Ctrl / ⌘ + scroll to zoom" and "two fingers to move" now come with MapLibre.
- The map credits are shown as plain links under the map.

### Removed
- Leaflet, leaflet-gesture-handling (unmaintained since 2022) and
  maplibre-gl-leaflet: the site now has two runtime dependencies, Vue and MapLibre.
- The OpenStreetMap fallback for browsers without WebGL: such browsers (rare) get
  a message, and the site directory still works.

## 2.0.19 (2026-10-25)

### Removed
- 150 unused files from `public/` (5 MB): 139 old uploads of logos and photos (the
  About page loads them from geo-trees.org) and 11 copies of `src/assets` images.
  `public/` now holds only `icon.png` and the terms and conditions PDF.
- Dead code: the hidden news block of the home page and its styles, an unused test
  helper (`hasOverlap`), three unused style rules.

### Changed
- README: the image instructions describe where each kind of image really goes
  (About us images on the geo-trees.org server, news images by address, page images
  in `src/assets`).
- Every link opening a new tab has `rel="noopener"`.

### Added
- Dependabot (`.github/dependabot.yml`): weekly pull requests for npm and GitHub
  Actions updates, a week after their release, checked by GitHub Actions before
  being merged.

## 2.0.18 (2026-10-25)

### Added
- Fallback copy of the Google Sheet: each build saves the content the site uses in
  `sheet-snapshot.json`; if Google Sheets cannot be reached, pages show that copy
  instead of an error. Downloaded only in that case (about 32 kB compressed).
- GitHub Actions check on every push and pull request: install, lint, build.
- `npm run snapshot` to save the copy on its own.

### Changed
- The sheet's layout (spreadsheet, key, tabs, columns and how columns are found)
  moved to `src/sheet-layout.js`, shared by the site and the build script.
- The removed private columns (PI emails, update notes) are no longer mentioned.

## 2.0.17 (2026-10-24)

### Changed
- Spreadsheet columns are found by their header in row 1 instead of by position,
  in every tab: columns can be moved or inserted without misplacing data. If a
  header is renamed, the usual position is used and the browser console says
  which header to check. Accepted headers are in `SHEET_COLUMNS` (`src/config.js`).
  Each tab is read in two requests (header row, then data), still never beyond the
  last column the site uses.
- Images load lazily (only when scrolled near), and decode without blocking the page.

### Security
- Only `https:`, `http:` and `mailto:` addresses from the sheet become links; any
  other (e.g. `javascript:`) is ignored and reported in the console.

### Fixed
- Partner logos without a website are no longer links to the current page.
- Console messages about sheet rows give the right row number when the tab has
  empty rows.

## 2.0.16 (2026-10-24)

### Changed
- About us: the Community section is hidden, between Network Partners and Site
  Partners. Its code is kept for a later release: set `SHOW_COMMUNITY` to `true`
  in `src/pages/AboutPage.vue` to show it again. The community rows stay in the
  `Aboutus` tab.

## 2.0.15 (2026-10-24)

### Changed
- Smaller body text on every page: 20 px → 17 px, 18 px → 15 px (narrow screens
  and secondary text), 16 px → 14 px. Headings are unchanged. Line heights are now
  relative to the text size (1.75), so spacing shrinks with it.
- Contact: the download buttons sit side by side (one per line, equal width, on
  phones). The whole button is now the link, not only its text.

## 2.0.14 (2026-10-24)

Goes with GEOTREES_Supersites_fixed.xlsx, where every list cell is written
`item; item; item`.

### Changed
- Lists are separated by `;`, with any number of items, in every tab. Web addresses
  are no longer split on spaces (some PDF names contain spaces).
- Names and websites are paired in order for as many items as each cell contains:
  a name without a website is shown as text, a website without a name as a link
  labelled with its site. (2.0.13 showed no links when the counts differed.)
- The same pairing for the links of News and Opportunities; a partner's logo link
  on About us uses the first address of its cell (some ended with a stray `;`).

## 2.0.13 (2026-10-24)

### Fixed
- List cells separated by line breaks (16 sites) are split correctly; they produced
  broken links such as `https://afritron.org/%20%20https://forestplots.net/`.
- Web addresses without `https://` (e.g. `www.kufos.ac.in`) no longer point to a
  page of this website.
- A Site_URL cell with several addresses (Manaus, Sepilok) gives one link per
  address in the directory and the map panel, labelled by site.
- When names and websites do not pair up (different numbers of items), the names
  are shown without links instead of linking to the wrong organisation; the
  console lists those cells.
- "Show on map" uses the site's font.

## 2.0.12 (2026-10-24)

Goes with the merged `Data` tab (GEOTREES_Supersite_Data.xlsx): the
`Sitesdirectory` columns were added to `Data`, and its status and year columns
removed. Update the Google Sheet and deploy this version at the same time.

### Changed
- The site directory reads the `Data` tab instead of `Sitesdirectory`, so the map
  and the directory always list the same sites. Both share one request.
- New `Data` columns: A–E unchanged, F Site_URL, G–I ALS/TLS/Inventory, J–R the
  former `Sitesdirectory` columns (see README). Positions are set in
  `DATA_COLUMNS` in `src/config.js`.
- A site without valid coordinates is left off the map but stays in the directory.

### Added
- `VITE_DATA_TAB` to read another tab instead of `Data` (to test a copy first).

### Removed
- The site status and year (former `Data` columns F and G) and everything that read
  them; the check comparing the two tabs' site names.

## 2.0.11 (2026-10-24)

### Changed
- Smaller text in the site panel (name 15 px, country, description and links
  13 px, coordinates 11 px).
- On phones, the selected site is placed a little lower so its name clears the
  legend.

### Removed
- The Completed / Ongoing / Planned filter buttons on the map. All sites are always
  shown; the status column of the `Data` tab is still read but no longer displayed.

## 2.0.10 (2026-10-24)

### Changed
- Simpler site panel on the map: the site name is in the dark header (instead of
  the status and date), followed by country and coordinates, the description, and
  the links to the site's website and to the site directory. The list of
  ALS/TLS/Plot states is removed, since the bar on the map already shows them
  (screen readers still hear them on each bar).

## 2.0.9 (2026-10-24)

### Fixed
- The map reads the spreadsheet tab `Data` (renamed from `Datas`).

### Added
- All tab names are set in one place, `SHEET_TABS` in `src/config.js`.

## 2.0.8 (2026-10-24)

### Fixed
- The `News` and `Opportunities` tabs are requested with their new capitalised
  names.
- Cells ending with a semicolon (`Name A; Name B;`) no longer produce an empty
  entry in the site directory.
- Repeated names in a cell (e.g. the same institution listed twice) are all shown:
  lists are no longer identified by their text, which Vue requires to be unique.

## 2.0.7 (2026-10-24)

### Changed
- On the map, the "Not started" state is now called "Planned" (legend, site panel,
  screen-reader text), matching the planned status filter.
- Smaller bars without the white frame: 6 px squares with 1 px between them
  (20 × 6 px). A soft shadow keeps them visible on light and satellite backgrounds.
  The clickable area extends 2 px around each bar.
- Smaller dots and thinner lines linking a moved bar to its true position.

## 2.0.6 (2026-10-24)

### Changed
- Content is read from the Geotrees_Back-CARTO spreadsheet
  `1YEtBjP4UZ5L0VtHnMXWZifZ50j74ezvsNmhjHiNPfng` (was
  `16qusGlajdZwqx6lX_RIxuWoxmiQqhxf-Guzwe4hI538`).

### Added
- `VITE_SPREADSHEET_ID` to change the spreadsheet without editing the code, and
  `VITE_MAP_SPREADSHEET_ID` to read the map's `Datas` tab from a separate one.

## 2.0.5 (2026-10-24)

### Changed
- Each state is shown by fill level as well as colour: not started is an empty
  square with a red outline, ongoing is half filled in orange, completed is filled
  in green. The map can now be read with colour blindness (with the colours alone,
  red and green look the same to people with deuteranopia) and in greyscale.
  Filters, legend and site panel use the same three looks.
- Smaller site bars: 8 px squares with 1 px white borders (28 × 10 px instead of
  38 × 14 px).
- Bars keep 5 px between them, so a hovered or selected bar (shown 20% larger)
  never touches its neighbours.

## 2.0.4 (2026-10-24)

### Changed
- Each site is drawn as a horizontal bar of three squares, left to right ALS, TLS
  and Plot (forest plot inventory), instead of a diamond. Each square is red (not
  started), orange (ongoing) or green (completed).
- Columns I, J, K of the `Datas` tab now accept three states. Existing values keep
  their meaning (`1` = completed, empty = not started); type `en cours` or
  `ongoing` for a measurement under way.
- Status filters use the same colours: planned red, ongoing orange, completed green.
- The site panel lists the state of all three measurements.

### Added
- Non-overlapping layout: bars push each other apart instead of overlapping (names
  included when they are shown), recalculated at every zoom. A line links a moved
  bar to a dot at the site's true position.
- A legend explaining the bar and its colours.

### Removed
- Grouping of sites at identical coordinates (leaflet.markercluster): such sites
  are now simply placed next to each other.

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
