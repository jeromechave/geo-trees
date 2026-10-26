# GEO-TREES website

Source of the GEO-TREES website, built with [Vue 3](https://vuejs.org) and
[Vite](https://vite.dev) and deployed to GitHub Pages (`gh-pages` branch).
Team members, partners, news, opportunities and the site directory are loaded
at runtime from a Google Sheet, so they can be edited without touching the code.

## Running locally

You need Node 20.19 or later (22 recommended; `nvm use` picks it up from `.nvmrc`).

```
npm install
npm run dev
```

Then open http://localhost:5173. Other commands:

- `npm run build` saves a copy of the Google Sheet (see below), then builds the site
  into `dist/`.
- `npm run preview` serves that build at http://localhost:4173/geo-trees/.
- `npm run lint` checks the code.

## How the code is organised

- `index.html`, `about-us.html`, … one HTML file per page, so the URLs are the same
  as on the previous site. Each loads `src/entries/<page>.js`.
- `src/pages/` one Vue component per page.
- `src/components/SiteHeader.vue` the header and menu shared by every page.
- `src/lib/sheets.js` reads the Google Sheet tabs and turns rows into objects.
- `src/config.js` spreadsheet id, API key and where sheet images are hosted.
- `src/styles/` fonts and the styles shared by all pages.
- `public/` files published as they are at the root of the site (`icon.png`, a PDF).
- `scripts/snapshot-sheet.js` saves the fallback copy of the sheet at each build.
- `.github/` the automatic checks (GitHub Actions) and dependency updates (Dependabot).
- `pages.config.js` the list of pages. To add one, follow the comment in that file.

The site is built for `https://geo-trees.org/geo-trees/`. To build it for the root
of a domain instead, run `VITE_BASE=/ npm run build`.

## The sites map

The map on the Sites page is part of this site (`src/components/SitesMap.vue`).
It replaces the separate map previously embedded from `geo-trees.org/carto/`.

The map is a flat map in the Mercator projection, the web standard, drawn by
MapLibre GL: one continuous zoom from the whole world to a site, with both
background maps. Like every Mercator map it enlarges areas towards the poles (about
2× at 45° of latitude), so at world scale the tropics, where most sites are, look
smaller than they are. It opens on all sites; zooming with the mouse wheel needs
Ctrl (⌘ on a Mac) and moving the map on a phone needs two fingers, so that
scrolling the page is not caught by the map.

**Data.** The map and the site directory below it both read the `Data` tab of the
Google Sheet, one row per site:

| Column | Content | Used by |
| --- | --- | --- |
| A | Site (name) | map, directory |
| B | Description | map |
| C | Country | map, directory |
| D, E | Latitude, Longitude (decimal degrees; `5.27` or `5,27`) | map, directory |
| F | Site_URL | map, directory |
| G, H, I | ALS, TLS, Inventory (see below) | map |
| J | PI_Names | directory |
| K | PI_Institutions_Names | directory |
| L | Support_Institutions_websites | directory |
| M | Funders | (hidden) |
| N, O, P | Partners_Names, Partners_Institutions_Names, Partners_Institutions_Websites | (hidden) |
| Q, R | Networks_Names, Networks_websites | directory |

Columns J–R hold lists separated by `;` (`Name A; Name B; Name C`), with any
number of items. In each name/website pair of columns (K–L, O–P, Q–R) the n-th
website is linked to the n-th name; extra names are shown as text and extra websites
as links labelled with their site. The same applies to `Link_text` / `Link_url` in
`News` and `Opportunities`. Web addresses may omit `https://`, and may contain
spaces (e.g. a PDF name), so they too are separated by `;`. Format columns D and E as
**Format → Number → Plain text** in Google Sheets: in a French-locale sheet, typing
`4.08` in an automatic cell turns it into a date.

Each site is drawn as a bar of three squares, left to right: **ALS**, **TLS**,
**Plot** (forest plot inventory). Each square takes its colour from columns G, H, I:

| Cell value (case and accents ignored) | Square |
| --- | --- |
| `Planned`, empty, `0`, `no`, `not started`, `futur` | planned: empty, red outline |
| `Ongoing`, `en cours`, `in progress`, `started`, `partial` | ongoing: half filled, orange |
| `Completed`, `1`, `yes`, `x`, `done`, `réalisé` | completed: filled, green |

The fill level (empty, half, full) carries the state on its own, so the map can be
read with colour blindness or in greyscale; the colours add a second cue.

When bars would overlap, they push each other apart; a thin line links a moved
bar to a dot at the site's true position. The layout is recalculated at every zoom.

Rows without valid coordinates are left off the map (they still appear in the
directory) and an unknown G/H/I value is shown as planned; both are reported in the
browser console (View → Developer → JavaScript Console). Accepted words and colours
are in `src/config.js` (`MEASUREMENT_STATES`); the columns are in `SHEET_COLUMNS`.

**Map and directory.** Each site on the map has "See in the site directory", and
each directory entry has "Show on map".

**Background maps.** "Outdoors" is [OpenFreeMap](https://openfreemap.org)'s
Liberty style: free and open, with no account, no API key and no usage limits.
It is a vector map drawn by MapLibre GL, which loads only on the Sites page. To
try another OpenFreeMap style (`positron`, `bright`), set
`VITE_OPENFREEMAP_STYLE=https://tiles.openfreemap.org/styles/positron` in
`.env.local`. Browsers without WebGL (rare) cannot show the map; they get a message,
and the site directory below it still works.

"Satellite" is [EOX's Sentinel-2 cloudless](https://cloudless.eox.at) mosaic
of 2024, also with no account or API key. Its licence (CC BY-NC-SA 4.0 for the
2018 and later years) allows **non-commercial use only**, with attribution. The
imagery has a 10 m resolution: sharp at country and regional scale, soft when
zoomed in on a plot. Another year (2020 to 2024) can be chosen with
`VITE_EOX_YEAR=2023` in `.env.local`.

The background layers are defined in `MAP_LAYERS` in `src/config.js`. The
attribution in the map's corner is required by OpenFreeMap/OpenMapTiles,
OpenStreetMap and EOX: keep it visible.

## Fallback copy of the Google Sheet

Every build (`npm run build`, and so `npm run deploy`) first saves the sheet's
content in `public/sheet-snapshot.json` (`scripts/snapshot-sheet.js`; also
`npm run snapshot` on its own). The published site uses it only if Google Sheets
cannot be reached, so pages still show their content, as of the last build; the
browser console then says so and gives the date of the copy.

The copy holds only the columns the site uses. It is not stored in git. If Google
Sheets cannot be read during a build, the previous copy is kept and the build goes on.

A Sheets API key restricted to the site's addresses also works for the copy, because
the build sends the site's address (`VITE_SITE_URL`, default `https://geo-trees.org/`).
Otherwise, set `SHEETS_SNAPSHOT_API_KEY` to a key restricted to the Sheets API only.

## Automatic checks (GitHub Actions)

Every push to GitHub, and every pull request, runs `.github/workflows/check.yml`:
install the locked dependencies, `npm run lint`, `npm run build`, and check that every
page was built. A green tick or red cross appears next to each commit on GitHub; the
**Actions** tab shows the details. It publishes nothing.

## Deploying

```
npm run deploy
```

This builds the site and commits the result on top of the `gh-pages` branch, then
pushes it (no force push). Files already on `gh-pages` that the build does not
produce (for example files from an older version) are **kept** and listed in the
output. To remove them, run `npm run deploy -- --clean`.

The script works in a temporary folder, so it does not touch your working copy.

## Adding an image

Where an image goes depends on the page that shows it.

**About us (people's photos, partner logos).** These images are not part of this
project. The `image` column of the `Aboutus` tab gives a file name, and the site
loads that file from `https://geo-trees.org/geo-trees/img/` (`SHEET_IMAGE_BASE` in
`src/config.js`). To add one:

1. Resize it: about 400 px on its longest side for a photo, 800 px for a logo
   (twice the displayed size, for high-resolution screens). Larger files only make
   the page slower.
2. Give it a simple name: no spaces or accents (e.g. `Logo_Sites_Gabon_ANPN.png`).
   Names are case-sensitive.
3. Upload it to the `geo-trees/img/` folder on the geo-trees.org server.
4. Write its exact file name in the `image` column of its row.

It appears at the next page load, without rebuilding the site.

**News.** Put the image's full web address in the `Img_url` column of the `News` tab.
It can be on any site; only `https://` and `http://` addresses are used.

**The site's own pages** (homepage background, Project page illustrations). Put the
file in `src/assets/`, refer to it from the page's template as `@/assets/<name>`,
then build and deploy. The build copies it into `img/`.

**`public/`** is only for files that need a fixed address (`icon.png`, the terms and
conditions PDF linked from the Data page). Anything put there is published as is.

## Google Sheet

All content comes from the Geotrees_Back-CARTO spreadsheet
(https://docs.google.com/spreadsheets/d/1YEtBjP4UZ5L0VtHnMXWZifZ50j74ezvsNmhjHiNPfng),
tabs `Data` (map and site directory), `Aboutus`, `Opportunities` and `News`;
other tabs, including `Sitesdirectory`, are ignored. Tab names must stay as they are; if a tab is renamed, update `SHEET_TABS` in
`src/config.js`. Columns are found by their header in row 1 (case, accents, spaces
and underscores ignored), so they can be moved and new ones inserted. If a header
is renamed, the site uses the column's usual position and says so in the browser
console; the accepted header names are listed in `SHEET_COLUMNS` in
`src/config.js`. Only `https:`, `http:` and `mailto:` addresses become links.
The spreadsheet must be shared as
**Anyone with the link: Viewer**, because visitors' browsers read it directly.

To use another spreadsheet without changing the code, set in `.env.local` or the
build environment:

```
VITE_SPREADSHEET_ID=<id>          # all tabs
VITE_MAP_SPREADSHEET_ID=<id>      # only the Data tab, if it lives elsewhere
VITE_DATA_TAB=<tab name>          # read another tab instead of Data (e.g. a copy to test)
```

The id is the part of the sheet's address between `/d/` and `/edit`.

## Google Sheets API key

The key is in `src/config.js`. It is called from the browser, so it is visible to
anyone and **must be restricted** in
[Google Cloud Console](https://console.cloud.google.com/apis/credentials) → the key:

- **Application restrictions** → *Websites*: the site's addresses, e.g.
  `https://geo-trees.org/*` and `https://nicolasboeuf.github.io/*`.
- **API restrictions** → *Restrict key* → *Google Sheets API* only.
- Optionally, cap the daily quota under *APIs & Services* → *Google Sheets API* → *Quotas*.

To check, request the sheet without a referrer. A restricted key answers
`403` with `API_KEY_HTTP_REFERRER_BLOCKED`:

```
curl -s "https://sheets.googleapis.com/v4/spreadsheets/1YEtBjP4UZ5L0VtHnMXWZifZ50j74ezvsNmhjHiNPfng/values/news!A1:A1?key=<KEY>"
```

Once the key is restricted to the live domains, the sheet data will not load on
`localhost`. For local work, create a second key restricted to
`http://localhost:5173/*` and put it in a `.env.local` file (not committed):

```
VITE_SHEETS_API_KEY=<local key>
```

The spreadsheet itself must stay readable by anyone with the link, so every cell,
including rows hidden with the `display` column, can be read through the API.
Do not put confidential information in it.
