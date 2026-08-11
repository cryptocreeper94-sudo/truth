# Observatory — Seismic Layer

The Observatory collects authoritative earthquake catalogs and public seismic context so that observations can be compared with weather, atmospheric, infrastructure, and other Earth-system data.  Proximity is documented — it is never treated as proof of causation.

---

## Quick start

```bash
# Single 48-hour incremental run (global, M≥2.5, USGS + ISC)
tsx observatory/run.ts

# 30-day backfill
tsx observatory/run.ts --full

# Include station / volcano / fault context (runs daily/weekly — slower)
tsx observatory/run.ts --context

# Generate GeoJSON map layers for the live map overlay
tsx observatory/run.ts --layers

# Dry run (collect and normalize but do not write to store)
tsx observatory/run.ts --dry-run

# Help
tsx observatory/run.ts --help
```

---

## Directory layout

```
observatory/
  run.ts                     CLI entry point
  schema/
    seismic.ts               Canonical TypeScript types for all seismic data
  collectors/
    index.ts                 Collector registry and run orchestrator
    seismic-usgs.ts          USGS ComCat / FDSN collector (primary)
    seismic-fdsn.ts          Generic FDSN collector (ISC, EMSC, INGV, GeoNet, BGR)
    seismic-context.ts       Station, volcano, fault, and deformation collectors
  normalizers/
    index.ts                 Normalizer runner
    seismic.ts               Cross-catalog deduplication and normalization
  store/
    index.ts                 NDJSON file store (read + write)
  data/                      ← created at runtime; gitignored
    events/                  Raw CatalogEvent records per catalog per day
    normalized/              NormalizedSeismicEvent records per day
    context/                 Station, volcano, fault records
    gaps/                    DataGapRecord entries
    runs/                    CollectionRunMeta entries
    map-layers/              GeoJSON FeatureCollection files
```

---

## Environment variables

| Variable | Default | Description |
|---|---|---|
| `OBSERVATORY_DATA_DIR` | `observatory/data` | Where to write NDJSON files |
| `OBSERVATORY_MIN_MAG` | `2.5` | Minimum magnitude for event queries |
| `OBSERVATORY_CATALOGS` | `isc` | Comma-separated additional FDSN catalog codes |
| `OBSERVATORY_BBOX` | _(global)_ | `minLon,minLat,maxLon,maxLat` — restrict query geographically |
| `OBSERVATORY_VERSION` | `dev` | Version string embedded in run metadata |

---

## Data sources

### Event catalogs

| Source | Code | Authority | Lag |
|---|---|---|---|
| USGS ComCat / ANSS | `usgs` | National | Minutes (automatic), Hours–days (reviewed) |
| ISC Bulletin | `isc` | International | Months (hand-reviewed phase associations) |
| EMSC | `emsc` | European-Mediterranean | Minutes |
| INGV | `ingv` | Italian national | Minutes |
| GeoNet | `geonet` | New Zealand | Minutes |
| BGR | `bgr` | German national | Hours |

**Primary catalog:** USGS ComCat — aggregates contributions from ~30 US regional and national networks.  All ANSS-contributing networks report to ComCat; events originating outside US regions are contributed by USGS global network (network code `us`).

**Cross-check catalog:** ISC Bulletin — independent, hand-reviewed phase associations, ~2–3 month lag.  Used to verify USGS solutions and catch events the automated pipeline missed or mislocated.

### Context data

| Source | What | Schedule |
|---|---|---|
| FDSN Station WS (IRIS/EarthScope) | Seismic station metadata | Weekly |
| USGS Volcano Hazards Program | Volcano names, coordinates, alert levels | Daily |
| USGS Quaternary Fault and Fold DB | Fault geometry, type, slip rate | Monthly |
| EarthScope PBO (UNAVCO) | GNSS velocity field | Monthly |

---

## Schema overview

All types are defined in `observatory/schema/seismic.ts`.

### `CatalogEvent`
One report from one catalog for one physical event.  Multiple CatalogEvents may represent the same earthquake as reported by different networks.

Key fields: `catalogEventId`, `catalog`, `originTime`, `latitude`, `longitude`, `depthKm`, `magnitude`, `magnitudeType`, `reviewStatus`, `rawPayload`, `retrievedAt`.

### `NormalizedSeismicEvent`
A single physical earthquake reconciled from one or more CatalogEvent records.

Key fields: `observatoryId`, `sourceIds`, `preferredCatalog`, `tectonicSetting`, `sequenceRole`, `inducedSeismicityCandidate`, `allReports`.

**`observatoryId`** format: `obs-eq-{YYYY}-{catalog}-{catalogEventId}` where `{catalog}` and `{catalogEventId}` come from the preferred source.

**`sourceIds`** always retains all contributing catalog identifiers so no source information is silently discarded.

### `DataGapRecord`
An explicit record that data was missing during a window.  Distinguishes "no events" from "no data."

### `CompletenessEstimate`
Minimum magnitude above which the catalog is believed complete for a region/time window.  Required for honest map displays — events below Mc are invisible to the network and must not be interpreted as absence.

### `ControlRegionBaseline`
Statistical baseline for a geographic control region with documented rationale.  Prevents post-hoc selection of comparison periods.

### `SeismicMapLayer`
GeoJSON FeatureCollection for the future live map.  Each event is a Point Feature at `[lon, lat, -depthKm]` with all observatory properties attached.

---

## Normalization and deduplication

Two catalog reports are matched as the same physical event if all three hold:

| Criterion | Default tolerance |
|---|---|
| Origin-time difference | ≤ 60 seconds (120 s for M≥6) |
| Epicentral distance | ≤ 50 km |
| Magnitude difference | ≤ 1.0 (generous — handles Ml vs Mw) |

**Preferred solution selection** priority:
1. Review status: `reviewed` > `unknown` > `automatic` > `deleted`
2. Catalog priority: USGS > ISC > INGV > GeoNet > EMSC > BGR
3. Station count (more = better constrained)
4. Azimuthal gap (smaller = better station coverage)

---

## Aftershock sequence tagging

Each normalized event is tagged as `mainshock`, `foreshock`, `aftershock`, `swarm_member`, or `unknown`.

- An event is an **aftershock** if there is a larger nearby event (ΔM ≥ 0.5) within 90 days and 50 km that occurred before it.
- An event is a **foreshock** if the larger nearby event occurred after it.
- `parentEventId` points to the mainshock's `observatoryId`.

This is a simplified classification.  Production analysis should use Reasenberg (1985) or Gardner-Knopoff declustering.

---

## Induced-seismicity candidacy

Events inside documented induced-seismicity monitoring zones are flagged with `inducedSeismicityCandidate: true` and an explanatory note.

**This is an alternative-hypothesis marker — it does not assert causation.**  Default zones are drawn from the USGS human-induced earthquakes monitoring list.

To add a custom zone, pass `inducedSeismicityZones` to `runSeismicNormalizer()`.

---

## Data gaps

Every collector failure is recorded as a `DataGapRecord` with:
- `gapStart` / `gapEnd` — the time window affected
- `severity` — `minor | major | critical`
- `cause` — the error message from the collector
- `detectionMethod: "automatic"` — detected by the runner

Downstream analysis must check for gap records before concluding "no seismicity."

---

## Map overlay

Run with `--layers` to generate GeoJSON FeatureCollection files in `data/map-layers/`.

```
M2.5plus-2024-01-15.geojson   All events M≥2.5
M4.0plus-2024-01-15.geojson   Events M≥4.0
M6.0plus-2024-01-15.geojson   Events M≥6.0
```

Each feature carries all observatory properties so the map can display depth, magnitude, review status, tectonic setting, and induced-seismicity candidacy as independent filter dimensions.

---

## Adding a new FDSN catalog

1. Add an entry to `FDSN_CATALOGS` in `collectors/seismic-fdsn.ts`.
2. Optionally add a priority entry in `CATALOG_PRIORITY` in `normalizers/seismic.ts`.
3. Add the catalog code to `OBSERVATORY_CATALOGS` env var or the `additionalCatalogs` config field.

No other changes required.

---

## Scheduled operation

The Observatory is designed for scheduled runs via cron or a task scheduler.

```cron
# Event collection every 6 hours
0 */6 * * * cd /path/to/project && tsx observatory/run.ts >> /var/log/observatory-seismic.log 2>&1

# Context data (stations, volcanoes, faults) weekly on Sunday
0 2 * * 0 cd /path/to/project && tsx observatory/run.ts --context >> /var/log/observatory-context.log 2>&1

# Map layer generation daily
30 1 * * * cd /path/to/project && tsx observatory/run.ts --layers >> /var/log/observatory-layers.log 2>&1
```

---

## Provenance and audit trail

Every `CatalogEvent` record carries:
- `retrievedAt` — ISO 8601 UTC timestamp of retrieval
- `sourceUrl` — the exact query URL used
- `rawPayloadHash` — SHA-256 of the raw API response payload
- `rawPayload` — the verbatim source payload

Every `CollectionRunMeta` record logs:
- Which collectors ran
- How many events were retrieved per catalog
- How many were new vs. skipped (duplicates)
- Any errors and gap records

This allows the full retrieval history to be reconstructed even if the upstream catalog updates or retracts records.
