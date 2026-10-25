# Changelog

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
