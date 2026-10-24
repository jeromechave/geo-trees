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

- `npm run build` builds the site into `dist/`.
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
- `public/` files copied as they are to the root of the site (logos, photos, PDFs).
- `pages.config.js` the list of pages. To add one, follow the comment in that file.

The site is built for `https://geo-trees.org/geo-trees/`. To build it for the root
of a domain instead, run `VITE_BASE=/ npm run build`.

## The sites map

The map on the Sites page is part of this site (`src/components/SitesMap.vue`).
It replaces the separate map previously embedded from `geo-trees.org/carto/`.

**Data.** It reads the `Datas` tab of the same Google Sheet, one row per site:

| Column | Content |
| --- | --- |
| A | Site name |
| B | Description |
| C | Country |
| D, E | Latitude, longitude (decimal degrees; `5.27` or `5,27`) |
| F | Status: `réalisé` / `completed`, `en cours` / `ongoing`, `futur` / `planned` (case and accents ignored) |
| G | Date shown next to the status |
| H | Website URL |
| I, J, K | ALS, TLS, forest plot inventory done: `1`, `yes` or `x` |

Rows without valid coordinates are skipped and an unknown status is shown as
planned; both are reported in the browser console (View → Developer → JavaScript
Console). Accepted status words and the diamond colours are in `src/config.js`.

**Map and directory.** A site whose name matches an entry of the `Sitesdirectory`
tab (case, accents and punctuation ignored) gets "See in the site directory" on
the map and "Show on map" in the directory. The console lists names found in one
tab but not the other, to help keep them in sync.

**Background maps.** "Outdoors" is [OpenFreeMap](https://openfreemap.org)'s
Liberty style: free and open, with no account, no API key and no usage limits.
It is a vector map drawn by MapLibre GL, which loads only on the Sites page. To
try another OpenFreeMap style (`positron`, `bright`), set
`VITE_OPENFREEMAP_STYLE=https://tiles.openfreemap.org/styles/positron` in
`.env.local`. Browsers without WebGL (rare) get OpenStreetMap's standard map instead.

"Satellite" is [EOX's Sentinel-2 cloudless](https://cloudless.eox.at) mosaic
of 2024, also with no account or API key. Its licence (CC BY-NC-SA 4.0 for the
2018 and later years) allows **non-commercial use only**, with attribution. The
imagery has a 10 m resolution: sharp at country and regional scale, soft when
zoomed in on a plot. Another year (2020 to 2024) can be chosen with
`VITE_EOX_YEAR=2023` in `.env.local`.

The background layers are defined in `MAP_LAYERS` in `src/config.js`. The
attribution in the map's corner is required by OpenFreeMap/OpenMapTiles,
OpenStreetMap and EOX: keep it visible.

## Deploying

```
npm run deploy
```

This builds the site and commits the result on top of the `gh-pages` branch, then
pushes it (no force push). Files already on `gh-pages` that the build does not
produce, such as images uploaded through GitHub, are **kept** and listed in the
output. To remove them, run `npm run deploy -- --clean`.

The script works in a temporary folder, so it does not touch your working copy.

## Adding an image (logo, photo)

Preferred: put the file in `public/`, commit it to `master`, and run `npm run deploy`.
The file then lives with the source and is published at the root of `gh-pages`.

Without a local setup, you can still upload it directly to `gh-pages`:

1. On GitHub, switch from `master` to the `gh-pages` branch.
2. Click **Add file** → **Upload files** and drop the image.
3. Commit directly to the `gh-pages` branch.
4. Check **Settings** → **Pages** for the last deployment date.

Deployments keep files uploaded this way, but please also add them to `public/`
afterwards so they are not lost if someone deploys with `--clean`.

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
curl -s "https://sheets.googleapis.com/v4/spreadsheets/16qusGlajdZwqx6lX_RIxuWoxmiQqhxf-Guzwe4hI538/values/news!A1:A1?key=<KEY>"
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
