# Truth Project Roadmap

This file tracks planned work across all three Truth evidence layers: the **Observatory** (continuous physical measurement), the **Physical Evidence** layer (documented experiments and reproducible observations), and the **Historical Record** (claims, sources, and digs governed by METHOD.md).  Each item includes a rationale and the done-looks-like criteria used to assess completion.

The three layers are part of one project in one monorepo.  Do not create separate apps or repositories for Physical Evidence work.  See `PHYSICAL_EVIDENCE.md` for the case file schema and governing principles, `OBSERVATORY.md` for the observation layer overview, and `METHOD.md` for the Historical Record provenance standard.

---

## Physical Evidence layer

The Physical Evidence layer documents independently reproducible experiments and observations that bear on contested physical questions — surface geometry, long-baseline optical propagation, celestial mechanics, gravitational effects, and atmospheric behaviour.  Case files live in `evidence/` and follow the schema in `PHYSICAL_EVIDENCE.md`.

### First case files — construction

**Rationale:** Two high-profile experiments are documented in the public record and ready for structured case file construction.  Neither has been analysed under the full Physical Evidence schema.  Building these first two establishes the workflow for all future cases.

**Case PE-2026-001 — Great Salt Lake long-baseline laser**
A laser was reportedly aligned on equal-height tripods across a 70+ mile stretch of the Great Salt Lake and reached the receiver with no measurable vertical drop.  The experiment has been widely circulated but never analysed against a complete setup record.

**Case PE-2026-002 — Chicago skyline visibility across Lake Michigan**
Photographs show the Chicago skyline visible from the Michigan shoreline at approximately 50–55 miles.  The disputed question is whether lower building structure is visible, not just upper floors.

**Done looks like:**
- `evidence/PE-2026-001.md` and `evidence/PE-2026-002.md` exist with all required schema fields populated or explicitly marked `MISSING — [reason]`
- Competing model predictions (spherical no refraction, spherical with standard refraction, flat plane) are calculated and recorded for each experiment's stated setup
- Original source media is linked with retrieval timestamps
- Each case carries a justified STATUS code per the codes defined in `PHYSICAL_EVIDENCE.md`
- Neither case asserts a conclusion beyond what the documented evidence supports

---

### Case file tooling — extraction and verification pipeline

**Rationale:** Case files will increasingly be sourced from video and photographic evidence.  Manual extraction of setup data from video is slow and error-prone.  A lightweight pipeline that extracts stated measurements, flags missing fields, and reconstructs geometry against model predictions will accelerate case construction and ensure consistency.

**Done looks like:**
- A CLI or script accepts a video URL or local file and extracts: stated distances, heights, instrument descriptions, and location claims as structured text
- A geometry module takes those inputs and calculates spherical and flat predictions with stated formulas and inputs
- Output is a partially pre-populated case file template ready for human review and completion
- Missing required fields are flagged explicitly, not silently omitted

---

---

## Completed

### Seismic layer — collection and normalization
- USGS ComCat (FDSN) event collector with full field set
- Generic FDSN collector supporting ISC, EMSC, INGV, GeoNet, BGR
- Cross-catalog deduplication with time + distance + magnitude matching
- Source identifier preservation — all catalog IDs retained in `sourceIds`
- Aftershock / foreshock / mainshock sequence tagging
- Induced-seismicity candidacy flagging (documentary — not causal)
- Tectonic setting classification (simplified global map)
- Magnitude of completeness estimation (MAXC method)
- Seismic station, volcano, fault, and GNSS deformation context collectors
- Explicit `DataGapRecord` entries for all collection failures
- Control-region baseline schema
- GeoJSON map layer generation (independently identifiable event overlays)
- NDJSON file store with per-day files and deduplication on write
- CLI runner (`observatory/run.ts`) with incremental and full-backfill modes

---

## Planned — Near term

### ISC Bulletin cross-validation integration
**Rationale:** The ISC Bulletin is the only fully hand-reviewed global earthquake catalog.  Its phase associations and depth solutions are significantly more reliable than automated solutions for events in poorly instrumented regions.  A systematic comparison between USGS and ISC preferred solutions for M≥4 events would quantify the disagreement rate and flag events where the preferred solution should switch.

**Done looks like:**
- ISC-vs-USGS solution comparison runs automatically after each normalization pass
- Events where depth or magnitude disagree by more than 2σ are flagged in the normalized record
- A summary report is written to `data/runs/isc-comparison-{date}.json`

---

### Detail-page enrichment for high-magnitude events
**Rationale:** The USGS ComCat summary GeoJSON feed does not include origin-time uncertainty, horizontal uncertainty, or per-magnitude-method statistics.  These fields are only available from the detail-page GeoJSON endpoint.  For events M≥4.0 or within the study bounding box, the additional uncertainty fields are important for map display and analysis.

**Done looks like:**
- `enrichUsgsEventDetail()` (already implemented in `seismic-usgs.ts`) is called for all M≥4.0 events after the initial collection pass
- `originTimeUncertaintySeconds`, `horizontalUncertaintyKm`, `depthUncertaintyKm`, and `magnitudeUncertainty` are populated in the stored `CatalogEvent` records for those events

---

### Reasenberg declustering
**Rationale:** The current aftershock classifier is a simplified distance-magnitude-time window rule.  Reasenberg (1985) declustering is the standard method for earthquake sequence analysis; it accounts for the temporal evolution of aftershock zones and is more accurate for complex sequences (swarms, multiple mainshocks).

**Done looks like:**
- `normalizers/seismic.ts` supports `declusteringMethod: "reasenberg" | "gardnerKnopoff" | "simple"` option
- Reasenberg implementation matches published catalog comparison test cases
- Simple method remains the default; Reasenberg is opt-in

---

### Detection completeness per-region
**Rationale:** A single global Mc estimate is too coarse for regional analysis.  Events in poorly instrumented regions (e.g. remote ocean, central Africa) have Mc ≈ 4.5–5.0 while well-instrumented regions (California, Japan) have Mc ≈ 1.5–2.0.  Map displays and rate comparisons must use region-specific completeness.

**Done looks like:**
- `CompletenessEstimate` records are generated for each pre-defined monitoring region
- The map layer metadata includes the applicable Mc for the displayed region
- Events below the regional Mc are visually distinguished on the map (not hidden)

---

## Planned — Medium term

### Atmospheric layer
Collect surface weather observations and reanalysis fields (NOAA ASOS, ERA5, MERRA-2) synchronized to the seismic event timeline.  Allows comparison of atmospheric state at the time of seismic events against baseline distributions — without implying any causal relationship.

**Sources:**
- NOAA Global Surface Summary of Day (GSOD)
- ERA5 reanalysis (Copernicus CDS API)
- MERRA-2 (NASA GES DISC)
- NOAA storm reports (SWDI)

---

### Ionospheric / RF layer
Collect Total Electron Content (TEC) measurements and ionospheric disturbance indices.  Provides context for any reported electromagnetic anomalies coincident with seismic events.

**Sources:**
- NOAA National Centers for Environmental Information — Global Ionosphere Radio Observatory (GIRO)
- NASA/JPL GPS-derived TEC maps
- NOAA Space Weather Prediction Center — planetary Kp index, Dst

---

### Infrastructure layer
Collect publicly available aviation, rail, and power infrastructure status data for the region and time windows matching seismic events.

**Sources:**
- FAA Notice to Air Missions (NOTAMs) — public REST API
- FAA ATIS archived reports
- ADS-B Exchange historical flight data (public tier)
- EIA electric grid emergency reports

---

### Live map API endpoint
Expose the seismic GeoJSON map layers through the Observatory API so the front-end map can display seismic events as independently identifiable overlays alongside other evidence layers.

**Done looks like:**
- `GET /observatory/seismic/events` — paginated NormalizedSeismicEvent records with filter params (minMag, startTime, endTime, bbox, catalog, reviewStatus, tectonicSetting, inducedCandidate)
- `GET /observatory/seismic/layers/{layerId}` — GeoJSON FeatureCollection for map overlay
- `GET /observatory/seismic/gaps` — DataGapRecord list for the requested time window
- `GET /observatory/seismic/context/stations` — SeismicStation records with bbox filter
- All endpoints return retrieval metadata in response headers

---

### PostgreSQL migration
The NDJSON file store is intentionally simple and suitable for development and low-frequency collection.  For production continuous collection (6-hour cadence, global M≥2.5 = ~300 events/day), a database with proper indexing on `originTime`, `latitude`, `longitude`, and `magnitude` is required.

**Done looks like:**
- Schema defined in `lib/db/src/schema/seismic.ts` using Drizzle ORM
- Migration applied without data loss from existing NDJSON files
- Query time for 90-day M≥2.5 global bounding-box request < 200 ms

---

## Principles for new evidence layers

When adding a new layer:

1. **Define the source authority first.**  Who publishes this data, what is their methodology, what are their stated accuracy limits?  Document it in the layer's `README.md` and in each record's `source` field.

2. **Write the gap record before writing data.**  If a collection pass fails, a `DataGapRecord` must be written.  Never leave a silent gap.

3. **Capture raw payloads.**  Store the raw API or file response verbatim alongside the normalized record so retrieval can be reconstructed.

4. **Define a control region baseline before analysis.**  Any claim about elevated event rates in a region requires an a priori comparison region and time window.  Define it in a `ControlRegionBaseline` record before running the comparison.

5. **Proximity is context, not explanation.**  Any co-location or temporal coincidence between layers is a relationship to document, not a mechanism to assert.
