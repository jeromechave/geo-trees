# Changelog

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
