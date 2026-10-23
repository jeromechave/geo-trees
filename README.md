# GEO-TREES website

Source of the GEO-TREES website: a Vue 2 multi-page site deployed to GitHub Pages
(`gh-pages` branch). Team members, partners, news, opportunities and the site
directory are loaded at runtime from a Google Sheet.

## Running locally

Use Node 16 (for example with [nvm](https://github.com/nvm-sh/nvm): `nvm install 16 && nvm use 16`).

```
npm install
npm run serve
```

On Node 17 or later, webpack 4 needs the legacy OpenSSL provider:
`NODE_OPTIONS=--openssl-legacy-provider npm run serve`.

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

The key is in `src/import.js`. It is called from the browser, so it is visible to
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
`http://localhost:8080/*` and put it in a `.env.local` file (not committed):

```
VUE_APP_SHEETS_API_KEY=<local key>
```

The spreadsheet itself must stay readable by anyone with the link, so every cell,
including rows hidden with the `display` column, can be read through the API.
Do not put confidential information in it.
