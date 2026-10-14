# Truth Observatory — Handoff for Gemini Agent

**Date:** 2026-10-13 (evening, US Central)
**Last deployed commit:** `54a6ed5` on `cryptocreeper94-sudo/truth` @ `main`
**Live site:** https://observatory.tlid.io
**Owner:** Jason (DarkWave Studios). He is about to promote the site on social media, so stability and honesty matter more than new features.

> [!IMPORTANT]
> Read this whole document before touching code. Then read the sections of the files you will edit. Do not trust this doc over the live code; verify each file path and symbol before you edit it.

---

## 1. Hard rules (non-negotiable)

1. **Tone and honesty.** Be calm, factual and plain-English.
   - Never present fetch counts, file counts or byte sizes as physical signals.
   - Never invent "elevated/severe" thresholds without a cited basis.
   - Label inferred data as inferred. For example, aircraft classes are inferred from callsign, emitter category and type code.
   - No hype, no sci-fi wording, no gamification.
2. **Secrets live only in Coolify env vars**, never in code or commits. Run `git grep` for any key before you push. Never paste passwords into docs or chat.
3. **PM2 is banned.** All processes run inside the Coolify Docker container, supervised by `start.sh`.
4. **Language.** Jason explicitly allows plain JS for this project, as long as Lume-V governs. Do not convert files to Lume.
   - Two files have Lume sources (`*.lume`): `lib/signal-catalog` and `lib/signal-store`. Also `archiver` and `signal-extractor`.
   - If you edit the generated `.mjs`, make the **same edit in the `.lume` file**. Example: catalog entries are one `put(SERIES, ...)` line in each file.
5. **42-Doctrine alignment.** New modules carry a header comment mapping code sections to DDA doctrine numbers, e.g. `[01] Identity Kernel`, `[08] Temporal Engine`, `[14] Determinacy`, `[32] Integrity Layer`, `[40] Non-Being Guard`. Copy the style from existing collectors.
6. **UI rules:**
   - Every page or view needs a back button.
   - Card grids are **horizontal scroll carousels** with snap points, prev/next arrows and centered dot indicators.
   - No unexplained abbreviations. Write the full name, or add a hover/long-press explanation.
7. **Do not break the deploy.** A push to `main` auto-deploys to production in about 3–5 minutes. Syntax-check every file you edit (`node --check <file>`), and test locally before pushing (section 6).

---

## 2. Topology

| Thing | Value |
|---|---|
| Live code (edit here) | `D:\truth\observatory\` |
| Legacy, **do not edit** | `D:\observatory\` (old standalone frontend) |
| Repo / branch | `cryptocreeper94-sudo/truth` / `main` (the observatory lives in subfolder `observatory/`) |
| Dockerfile | `D:\truth\Dockerfile.observatory` (node:20, `npm ci`, `CMD bash observatory/start.sh`) |
| Coolify dashboard | `http://95.217.135.158:8000` |
| Coolify app | "Observatory - Sentinel", uuid `rylyxlapysufovkrfffusluj`, app id 96 |
| Container host | Hetzner `157.180.70.175` (root SSH; credentials are in Jason's Coolify / the previous agent's scratch python scripts. Ask Jason if you need them, and never print them) |
| Persistent volume | `/app/state` → `STATE_DIR=/app/state/observatory`, `RAW_DIR=/app/state/observatory/raw` (shared by all collectors) |
| Env vars in Coolify | `ADSB_API_KEY` (RapidAPI ADS-B Exchange), `EIA_API_KEY`, `ADMIN_PASSWORD`, `DATABASE_URL`, Stripe keys, etc. `FAA_API_KEY` is **not** set (not needed now) |

Helper scripts left by the previous agent are in `C:\Users\unfor\.gemini\antigravity-ide\brain\f28d5eff-1b02-4772-82a9-d5601d506dee\scratch\`.

| Script | Purpose |
|---|---|
| `deploy_obs.py` | Manual Coolify deploy trigger |
| `test_measures_live.py` | Runs a patched server inside the container on port 3998 |
| `inspect_manifests.py` | Inspect manifests on the server |
| `check_live_adsb.py` | Check the live aircraft data |

There is also a deploy-status checker: `C:\Users\unfor\.gemini\antigravity-ide\brain\a0663165-8fa4-46fa-a426-7f39ebfbcdf4\scratch\check_deploy.py`.

---

## 3. Code map

```
observatory/
├── start.sh                    # bash supervisor: run_collector() restart loops + server + correlation engine
├── server.mjs                  # HTTP server: static site + REST API (~1,520 lines)
├── signal-extractor.mjs/.lume  # raw files → permanent series/events (lib/signal-store)
├── correlation-engine.mjs      # cross-feed correlation (FEEDS list w/ metric() per feed)
├── brief-generator.mjs         # daily brief
├── archiver.mjs/.lume          # seals manifests daily, TrustLayer anchor hourly
├── collectors/*.mjs            # 19 active collectors (blitzortung.mjs is retired, still in repo, not started)
├── lib/
│   ├── signal-catalog.mjs/.lume  # SERIES catalog (id → name/unit/res/stat/source/plain)
│   ├── signal-store.mjs/.lume    # readSeries/upsertSeries/readEvents/upsertEvents/aggregate/hourKey/tidy
│   └── manifest-ledger.mjs       # readTail / readSince over live manifest + sealed archive
└── site/
    ├── index.html  today.html  about.html  cockpit.html  explorer.html  stream.html ...
    ├── app.js       # `const Observatory = {...}` (top-level const, NOT on window) ~2,750 lines
    ├── levels.js    # per-feed copy for observer/analyst/researcher expertise levels
    ├── style.css    landing.css
    ├── sw.js        # service worker, CACHE_NAME = 'observatory-v17' → bump on every frontend change
    └── assets/      # images incl. share-card.png (1200x630 OG image)
```

### Data model
- **Manifests:** `$STATE_DIR/<name>-manifest.jsonl` hold append-only JSON lines. Only a short tail stays live; older lines are sealed in `archive/`. Read them with `readTail(STATE_DIR, file, n)` or `readSince(STATE_DIR, file, hours)`.
- **Series:** `$STATE_DIR/signals/series/<id>/<YYYY>.jsonl`.
  - Rows are `[key, mean, min, max, n]`. The key is `YYYY-MM-DDTHH` (hourly) or `YYYY-MM-DD` (daily).
  - Writes are idempotent per key.
  - A series must be listed in `SERIES` (signal-catalog) for the API and charts to use it.
- **Events:** `$STATE_DIR/signals/events/<kind>/<YYYY>.jsonl`, objects `{id, t, ...}`. Example: quake `{id,t,lat,lon,depth,mag,magType,place}`.

### Key server pieces (`server.mjs`)
- `FEEDS` array (around line 273): id, manifest, name, domain, icon, interval. There are 19 entries.
- `FEED_MEASURES` defines which feeds chart a **real measurement**. Supported kinds:
  - `series: '<id>'`: reads a series via `seriesPoints()`. The window is 24h for 1h, 72h for 3h and 30d for 1d.
  - `manifestField: '<field>'`: hourly mean of a numeric field in manifest entries, last 24h. The tail is limited to 500 entries.
  - `events: 'quake'`: hourly counts plus the largest magnitude.
  - `cond(v, lastEntry)` returns `[text, level]`. Levels are `ok | info | watch | warn | alert | offline`.
- `buildMeasure()` and `buildHealth()`. A feed without a measure gets the honest **collection health** chart: successful vs failed pulls per hour or day.
- `getFeedStatus(feed)` returns `{status, measure, health, condition:{text,level}, sparkline, sparklineKind, ...}`.
- Geo endpoints:

  | Endpoint | Access / notes |
  |---|---|
  | `/api/geo/heaters` | |
  | `/api/geo/aircraft` | **subscriber-only**; gzip; ≤20k aircraft; adds `cls` |
  | `/api/geo/lightning` | public; gzip; `[ageSec, lat, lon]` |
  | `/api/geo/surface` | |
  | `/api/geo/wildfires` | |
  | `/api/geo/volcanoes` | |

- Static files are served with `Cache-Control: no-cache` + ETag for html/js/css, and `max-age=86400` for media.
- Subscriber whitelist emails: gladevillej@gmail.com, team@dwsc.io, jason@livfitoken.com.

### Key frontend pieces (`site/app.js`)
- `layerDefs`: name, info (source / what / update / attribution) and legend for each map layer. Info feeds the hover tooltips (`_initLayerTooltips`) and the legend (`updateDynamicLegend`).
- Main map: `initMap()` (around line 360) creates `this.mapLayers.*`.
  - Marker layers are `L.layerGroup()` filled by `load*Markers()`.
  - The fullscreen map is `openFullscreenMap()` with `this.fsMapLayers.*`.
  - Marker layers are copied to fullscreen via `_mirrorToFs(name)`. Aircraft and lightning use a canvas renderer.
- Layer toggles live in `cockpit.html` as `<input data-layer="x">` (main) and `<input data-fslayer="x">` (fullscreen).
- `drawFeedChart(feed)` draws the modal chart: value axis with units, UTC time axis spanning the full window, line or bars, or stacked health bars. `.modal__chart-stats` shows Now/Low/High plus the source.
- Aircraft: `_planeClass()` (canvas plane symbol rotated by heading), `_aircraftColor()` (by altitude), `_aircraftPopup()`, and the type filter `_ensureAircraftFilter()` / `AIRCRAFT_CLASSES` (localStorage `obs-ac-filter`).
- Radar loop: preloads all frames, flips opacity, holds on the live frame, and restores prior layers on stop.

---

## 4. What shipped in this session (so you don't redo it)

| Commit | Summary |
|---|---|
| `4f2372f` and earlier | Fullscreen layer mirroring; NASA GIBS fire layer (FIRMS key revoked); full layer names + tooltips; worldwide aircraft (2 alternating RapidAPI zones per 5 min ≈ 8,640 calls/mo of the 10k quota; adsb.lol fallback); plane symbols, popups, type filter; scrolling desktop cockpit; radar loop fix |
| `2538d9b` | Feed charts show real measurements with units and axis; honest collection-health charts; condition badges on real thresholds |
| `54a6ed5` | GOES GLM lightning: flash extraction (`jsfive` pure-JS HDF5), hourly series `glm_flash_rate` (flashes/min, East/West deduplicated by a 106.2°W split), 15-minute flash map layer `glm`; keyless FAA TFR collection; Blitzortung retired; honest copy in `levels.js`; "19 streams" everywhere; social share card + OG/Twitter meta |

**Verified live after `54a6ed5`:**
- `/api/geo/lightning` returned ~14.5k flashes.
- The lightning feed showed "1,175 FLASHES / MIN · AMERICAS & OCEANS".
- The flight restrictions (`notam`) feed showed "77 ACTIVE FLIGHT RESTRICTIONS".
- `assets/share-card.png` returned 200, and the index page references it.

**Collector details you will need:**
- `collectors/lightning-glm.mjs` v1.1.0:
  - Lists the current and previous hour from `noaa-goes19` / `noaa-goes18` S3, takes up to 15 newest unseen files per satellite, and parses `flash_lat` / `flash_lon`.
  - Writes a `GLM-FILE` manifest entry with `flashes`, `flashesInFile` and `flashesPerMin`.
  - Writes `STATE_DIR/lightning-recent.json` (`samples` 48h, `flashes` 15 min, max 30k) and upserts the `glm_flash_rate` series.
  - Prunes only `.nc` files, because `RAW_DIR` is shared.
- `collectors/notam-cloudseeding.mjs` v1.1.0:
  - Pulls `https://tfr.faa.gov/tfrapi/exportTfrList` (public JSON) and writes an `OBSERVATION` entry with `tfrs`, `byType` and `byState`.
  - Takes HTML snapshots of TX (`tdlr.texas.gov/weather/weathermod.htm`) and ND (`swc.nd.gov/arb/`).
  - Uses the FAA NOTAM API only if `FAA_API_KEY` is set.

---

## 5. Remaining work (prioritized)

### P1 — Small fixes before the social launch

**5.1 Flight-restriction badge loses the "by type" breakdown**
- **Cause:** `buildMeasure()` passes `lastEntry` = the last non-gap entry. For `notam`, that is often a `PERMIT-SNAPSHOT` with no `byType` field.
- **Fix:** in `buildMeasure`, when `m.manifestField` is set, choose `lastEntry` as the last entry with a numeric `m.manifestField`.
- **Acceptance:** the badge reads e.g. `77 ACTIVE FLIGHT RESTRICTIONS · 41 SECURITY · 12 HAZARDS`.

**5.2 Earthquake badge M6.9 vs USGS M6.8**
- **Check:** does the seismic collector / `signal-extractor` (`quakeOf`, `fromSeismicManifest`) update an event when USGS revises the magnitude? `upsertEvents` is last-wins by `id`, so confirm the newest record is processed last.
- Also confirm that a single event can't appear under two ids (USGS sometimes re-ids events: `ids` field, `code` vs `id`).
- **Acceptance:** the largest-quake badge matches `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson` within revision lag.

**5.3 Mobile pass on new UI**
- Check the lightning layer toggle, its legend and its tooltip at 390px width on the cockpit and the fullscreen map.
- Check that the feed modal chart is legible and the stats row wraps.
- Use headless Chrome (section 6) with `--window-size=390,844`.

**5.4 Share-preview cache:** this is for Jason, not the agent. Remind him to run the URL through the Facebook Sharing Debugger / LinkedIn Post Inspector once.

### P2 — More feeds with real measurements (currently health charts)

Feeds still on the health chart: `nexrad`, `goes`, `grid`, `ionosonde`, `schumann`, `celltower`, `heater`, `metals`, `ecology`, `deposition`.
- **Grid (EIA-930):** inspect `grid-manifest.jsonl` entries and the raw files for a numeric demand value (MW). If one exists, add a series (e.g. `grid_demand_us`, unit `MW`, res `1h`), extract it, and add a `FEED_MEASURES.grid` entry with a neutral `info` condition.
- **Ionosonde:** look for foF2 / TEC values in the raw GIRO data. Add a series only if the values are real per-station readings; label the station.
- **Schumann:** check whether the aggregator stores any numeric frequency or amplitude. If it only stores images, keep the health chart. **Do not fabricate.**
- Image products (nexrad, goes) stay on health charts. That is correct.

For each one you add:
1. A `SERIES` entry (in both `.mjs` and `.lume`).
2. Extraction in the collector or `signal-extractor`.
3. A `FEED_MEASURES` entry.
4. A local test (section 6).

### P3 — Lightning follow-ups
- **Thresholds:** after at least 30 days of `glm_flash_rate`, compute hourly-of-day percentiles. Only then add watch/warn levels (e.g. above the 95th percentile for that hour). Until then keep `info`.
- **Optional:** add `glm_flash_rate` to `KNOWN_LINKS` in signal-catalog only if there is a physical justification. Do not invent links.
- **Optional:** a flash-density heat layer at low zoom for performance, if 30k points ever feels slow on mobile.

### P4 — Awaiting Jason's go-ahead (do not start without asking)

1. **Polar / UN-style map view toggle + side-by-side compare + magnetic/auroral overlay.**
   - Visualization only. All correlation math stays on WGS84.
   - Possible approaches: Leaflet with `Proj4Leaflet` (EPSG:3413/3031 polar stereographic), or a second canvas map.
   - The auroral oval data source would be NOAA SWPC OVATION: `https://services.swpc.noaa.gov/json/ovation_aurora_latest.json`.
2. **Phase 2 subscriber email alerts via Resend.**
   - The API key goes in a Coolify env var (`RESEND_API_KEY`).
   - Alerts trigger on real condition levels (`warn` / `alert`) from `getFeedStatus`.
   - Needs: per-subscriber preferences in Postgres (`DATABASE_URL`), rate limiting / dedupe, an unsubscribe link, and plain-English templates.
   - Jason must approve the alert rules and the wording.

---

## 6. How to test locally (Windows, pwsh)

**Run the server against a temp state dir:**
```powershell
$env:PORT="3997"; $env:STATE_DIR="$env:TEMP\glmstate"; $env:RAW_DIR="$env:TEMP\glmraw"
$env:ADMIN_PASSWORD="localtest"; $env:DATABASE_URL=""
node D:\truth\observatory\server.mjs   # ~10 s startup
```
- Subscriber endpoints need the cookie `obs_dev_bypass=localtest`.
- Example: `Invoke-RestMethod http://localhost:3997/api/feeds -Headers @{Cookie="obs_dev_bypass=localtest"}`.

**Run a collector once against temp dirs.** Start it, wait about 60–75 s for one cycle, then kill it:
```powershell
$env:STATE_DIR="$env:TEMP\glmstate"; $env:RAW_DIR="$env:TEMP\glmraw"
node D:\truth\observatory\collectors\lightning-glm.mjs
```

**Headless visual checks.** Copy the harnesses in the scratch dir:
- `verify_glm.js` (port 4896) proxies lightning and feeds to the local server and everything else to the live site.
  - It injects a `<script>` into `cockpit.html` that calls `Observatory.openFullscreenMap()` / `Observatory.openDetail(feed)`.
  - It screenshots with `"C:\Program Files\Google\Chrome\Application\chrome.exe" --headless=new --window-size=W,H --virtual-time-budget=20000 --screenshot=...`.
  - It reports via an injected `<pre id="__report">` read from `--dump-dom`.
- `verify_aircraft.js` (port 4895) and `make_share_card.js` (port 4897) follow the same pattern. The share card is a real map render with a text overlay; re-run it to refresh `site/assets/share-card.png`.
- Set `localStorage.obs_welcomed='1'` and `obs-expertise-level='observer'` in the prelude to skip the welcome modal.

**Run on the real server data.** `test_measures_live.py` copies a patched server into the container and runs it on port 3998 against the real `/app/state`. Use this to validate measures with production data before pushing.

---

## 7. Deploy and verify

1. `node --check` every edited `.mjs` / `.js`.
2. Bump `site/sw.js` `CACHE_NAME` (`observatory-v17` → `v18`) if any frontend file changed.
3. `git add -A . ; git commit -m "<type>(observatory): ..." ; git push origin main`, run from `D:\truth\observatory`.
4. Wait about 4–5 minutes, then verify:
   - `https://observatory.tlid.io/app.js?x=<timestamp>` contains your new marker string.
   - `https://observatory.tlid.io/api/feeds` lists 19 feeds with the expected `condition` and `measure` (it is public).
   - Any new endpoint returns real data.
5. If the deploy fails, check the Coolify deployment logs. `npm ci` uses `package-lock.json`, so commit lock changes with any new dependency.

---

## 8. Gotchas (learned the hard way)

- **Line endings:** files are LF in git and CRLF in the Windows working copy.
  - Edit with a Node script that does `s.replace(/\r\n/g,'\n')`, string-replaces, then restores CRLF if the file had it.
  - `bash -n start.sh` fails locally only because of CRLF. Check the git version instead: `git show HEAD:observatory/start.sh | bash -n`.
- **PowerShell mangles quotes** in inline `node -e` / `python -c`. Write script files instead.
- **Search tools:** the IDE `grep_search` tool returned nothing in this environment. Use `Select-String` via the shell.
- **Encoding:** `Set-Content` in pwsh writes UTF-8 without BOM, which is OK, but check emoji (⚡ 🔥 🌋) survive in `cockpit.html` / `app.js` after edits.
- **`Observatory` is not on `window`.** It is a top-level `const`, so reference it by name in injected scripts.
- **Shared `RAW_DIR`:** every collector shares `RAW_DIR` in production. Never write a pruner that deletes everything in it; filter by your own file pattern.
- **Aircraft quota:** the ADS-B Exchange RapidAPI quota is 10k calls/month, and the current usage is about 8,640. Do not add calls. adsb.lol returns 429 after a few rapid requests.
- **Map clamping:** `setView` on the fullscreen map can be clamped by `maxBounds` / `minZoom`.
- **Blitzortung stays retired.** Its terms forbid automated collection and the endpoint returns 404. `stream.html` still has an informational Blitzortung reference page (public map images, outbound links), which is fine.
- **Colorado DNR** returns 403 to automated requests, so it is intentionally not polled.

---

## 9. Definition of done for the next agent

- [ ] 5.1 and 5.2 fixed, tested locally and on production data, deployed, verified live
- [ ] 5.3 mobile screenshots checked; any overflow fixed
- [ ] P2 feeds converted **only where a real numeric value exists**; others left as health charts with an explanation
- [ ] No secrets in commits; `sw.js` bumped; `/api/feeds` still lists 19 feeds, all healthy or honestly labelled
- [ ] Short report to Jason: what changed, what's live, anything that needs his decision (P4 items)
