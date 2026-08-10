# Truth Observatory — Specification & Handoff

> **CRITICAL: Any agent working on Truth MUST read this file AND ROADMAP.md before making changes.**
> **Last Updated: 2026-08-10 — Specification written by main agent (Jason Andrews / DarkWave Studios LLC)**
> **Architecture: DDA 42-Doctrine / Deterministic Dissolution Ladder**

---

## Architecture: DDA 42-Doctrine

The Observatory is a **42-doctrine organism** — every module maps to a numbered doctrine node. This is not an analogy or a label. It is the design constraint. Any agent building Observatory components must maintain this mapping.

The existing Truth Sentinel daemon (`daemon/daemon.mjs`) demonstrates the full pattern. The Observatory follows the same discipline across its different functional layers.

### Module map

```
Layer 1 — Identity & Structure
  [01] Identity Kernel      → OBSERVATORY_IDENTITY: immutable identity cert, version, author, purpose
  [02] Boundary Engine      → METHOD.md + OBSERVATORY.md as hard boundaries; no event published outside them
  [03] Differentiation      → Source domains separated: atmospheric / geophysical / infrastructure / RF
  [07] Locality Engine      → Each event record is an isolated cell; no cross-contamination between OBS entries

Layer 2 — Cognition & Reference
  [08] Temporal Engine      → Every reading timestamped UTC; all streams locked to a shared time axis
  [10] Epistemic Model      → Four verdict states: CORROBORATED / UNRESOLVED / CONTRADICTED / INSUFFICIENT-DATA
  [12] Meta-Phenomenology   → Validation pass: does a detection meet the multi-stream coincidence threshold?

Layer 3 — Constraint & Determinacy
  [13] Constraint Engine    → Skeptic engine is non-overridable; ordinary explanations always stored alongside anomaly
  [14] Determinacy Engine   → Every reading traceable to a raw file with SHA-256 hash; no inference from absence
  [16] Domain Mapper        → Source domains route to correct normalizer and detector layer

Layer 4 — System & Coherence
  [20] Coherence Engine     → Control-region comparison: every event tested against a neighboring region
  [22] Continuity Layer     → Raw file archive is append-only; no raw data is modified or deleted
  [23] Causality Engine     → Git commit chain: cryptographic causal ordering of all collected data
  [26] Arbitration Layer    → Verdict rules: detector generates verdict deterministically; AI does not set verdict

Layer 5 — Integration & Resolution
  [31] Verification         → verify.mjs checks every cited URL in every OBS event record weekly
  [32] Integrity Layer      → SHA-256 on every raw file at time of download; hash stored in retrieval manifest
  [33] Alignment Layer      → Collection budget gates: human-controlled rate limits per source
  [34] Invariance Layer     → OBSERVATORY.md and METHOD.md are immutable; collectors cannot modify them

Layer 6 — Safety Envelope
  [35] Collapse Detection   → Source failure monitoring: if a collector fails repeatedly, alert and halt
  [37] Null Boundary        → No event record published without at least two independent streams confirming
  [40] Non-Being Guard      → Data-gap detection: missing data is recorded as a gap, not silently skipped
  [42] Devoid Limit         → Fatal error handler: clean shutdown, raw archive preserved, state written before exit
```

### What this means in practice

- Every collector script must declare its doctrine nodes in its header comment (same pattern as `daemon/daemon.mjs`).
- The skeptic engine is **[13] Constraint Engine** — it is non-overridable by design. Disabling it breaks the architecture.
- The verdict is **[26] Arbitration Layer** — deterministic rules, not AI judgment.
- The hash-and-manifest provenance is **[32] Integrity Layer** — every file, every time, no exceptions.
- The control-region comparison is **[20] Coherence Engine** — an anomaly without a control comparison is incomplete.
- Data gaps are **[40] Non-Being Guard** — silence from a sensor is a recorded fact, not an ignored absence.

---

## What the Observatory is

The Observatory is a new major section of Truth — a continuously running, provenance-preserving atmospheric and geophysical monitoring system that:

- Collects raw data from dozens of independent public sources 24/7
- Detects coincident events across multiple data streams
- Tests ordinary explanations automatically before surfacing anything for human review
- Produces a **daily evidence digest** reviewing major events from the previous 24 hours
- Preserves every original artifact (file, image, data table) with a cryptographic hash, retrieval timestamp, and source URL
- Never declares manipulation — it builds a record that either supports or contradicts it

The Observatory is **not** a separate product. It lives inside Truth alongside the Historical Record.

## Why this exists

Jason has been observing for over a year that major storm systems, unusual radar and Doppler patterns, apparent microwave-frequency events, and infrastructure-coincident atmospheric events appear to be increasing in frequency and intensity — at a pace and pattern that does not fit natural climate variation alone. The existing Truth Historical Record tests historical claims. The Observatory tests current and near-real-time physical observations using the same evidentiary discipline.

The goal: show coincidence first, eliminate ordinary explanations systematically, and document what remains — whether that is a natural phenomenon, an infrastructure correlation, or something that genuinely warrants a stronger claim.

**The system must be capable of disproving the investigator's preferred explanation. If the skeptic engine is disabled, it becomes advocacy software.**

---

## Operating cadence

| Cycle | What happens |
|---|---|
| Every 5–15 min | Raw data collected from each source and hashed |
| Every 15 min | Event detector scans last 6 hours for multi-stream coincidences |
| Immediately after detection | Skeptic engine runs ordinary-explanation tests |
| Once or twice daily | Daily evidence digest generated |
| Weekly | Pattern comparison across recent events; longer-term trend review |
| Monthly | Geographic and seasonal correlation analysis |

**The daily digest is not optional reporting — it is the central output of the Observatory.** Major storms, unusual patterns, and multi-stream coincidences must be surfaced within 24 hours, not weekly.

---

## Data source architecture

### Layer 1 — Atmospheric observation

| Source | What | Interval |
|---|---|---|
| NOAA NCEI S3 (public) | NEXRAD Level II radar — reflectivity, radial velocity, spectrum width, dual-pol | 5 min per site |
| NOAA MRMS | Multi-radar multi-sensor products | 5 min |
| GOES-East/West CDN | Satellite — IR, visible, water vapor, lightning | 10 min |
| NOAA ASOS / Mesonet | Surface stations — wind, temp, pressure, humidity | 15 min |
| Blitzortung | Lightning — stroke location, time, amplitude | 1 min |
| NWS radiosonde | Upper-air balloon soundings | 12 hr |

### Layer 2 — Solar and geophysical

| Source | What | Interval |
|---|---|---|
| NOAA SWPC API | Solar X-ray flux, Kp index, solar wind speed/density | 15 min |
| INTERMAGNET public API | Ground magnetometers — Bx, By, Bz | 1 min |
| GIRO / DIDBase | Ionosonde soundings — foF2, hmF2 | Hourly |
| HeartMath / Sierra (public) | Schumann resonance power spectral density | Hourly |
| NOAA riometer network | HF absorption (proxy for ionospheric disturbance) | As available |

> **Schumann resonance note:** no single global meter exists. Compare multiple independent stations; never treat one colorful waterfall plot as a ground truth reading. Different stations use different instruments, locations, and filtering methods.

### Layer 3 — Human infrastructure

| Source | What | Interval |
|---|---|---|
| EIA-930 API | Power generation by source, demand, interchange | Hourly |
| ADS-B Exchange (public) | Aircraft tracks — position, altitude, type, transponder | 5 min |
| FAA NOTAM API | Active flight restrictions and airspace notices | Daily |
| State cloud-seeding permit databases | Authorized weather-modification operations | Daily |
| FCC Tower Registration DB | Cell tower locations, operators, frequencies | Weekly refresh |
| OpenCelliD | 4G/5G cell site locations | Weekly refresh |

### Layer 4 — Radio-frequency and ionospheric

| Source | What | Interval |
|---|---|---|
| HAARP public schedule | Research facility operating windows and logs | Daily |
| Other ionospheric heater schedules | Identify each facility by real name, location, frequency, documentation | Daily |
| NOAA HF propagation reports | HF band conditions | Hourly |
| Public spectrum monitoring | RF power in monitored bands | As available |

> **Important naming rule:** HAARP is a specific facility in Gakona, Alaska. There are other ionospheric heaters worldwide (EISCAT, Sura, HIPAS, HAARP-like systems). Every facility must be identified by its real name and documented operating frequency — not generically called a "HAARP array." This protects the archive from technical dismissal.

> **5G / cell tower rule:** the presence of a tower near an atmospheric event is a geographic coincidence, not evidence of effect. The system must record whether RF energy was independently measured, not only whether a tower exists nearby.

---

## Event detection rules

The detector looks for:

1. **Single-stream anomaly** — a reading departs from the 30-day historical baseline for that location and season
2. **Multi-stream coincidence** — two or more independent streams change within a 15-minute window at overlapping geographic areas
3. **Timing pattern** — the same anomaly repeats at similar times across multiple days or weeks
4. **Control region comparison** — whether the same effect appears in a neighboring region without the suspected variable

Each event is tagged:

- `COINCIDENT` — multiple streams changed together
- `ISOLATED` — single stream only
- `REPEATED` — pattern appears more than once
- `CONTROL-MATCHED` — same effect seen in control region (weakens causal argument)
- `CONTROL-ABSENT` — effect not seen in control region (strengthens it)
- `DATA-GAP` — a source that should have data shows none

---

## Skeptic engine (mandatory — never disable)

Before any event is surfaced for human review, the skeptic engine tests ordinary explanations. All tests and their results are stored in the event record alongside the anomaly — never discarded.

**Radar / Doppler anomalies:**
- Anomalous propagation (AP) — does the beam geometry and atmospheric profile fit AP?
- Ground clutter — does the location match known clutter for that site?
- Velocity aliasing — is the velocity pattern explainable by range folding or aliasing?
- Biological targets — birds, insects at migration altitudes?
- Sidelobe contamination?

**Geomagnetic / Schumann events:**
- Was there a documented solar event (CME, X-flare, geomagnetic storm)?
- Does the spike appear at multiple independent stations?
- Does duration match natural patterns?

**RF / frequency detections:**
- What band and measured power level?
- Is the instrument public, calibrated, and independent?
- Is there a licensed transmitter or documented facility that explains it?
- Does it appear on multiple independent instruments?

**Power-grid events:**
- Documented dispatch, demand spike, or fault at that time?
- Regional or local?

**All events:**
- What is the simplest natural explanation consistent with all available data?
- What would need to be true for a deliberate-intervention hypothesis to hold?
- What evidence would disprove the intervention hypothesis?

---

## Event record format

Every event that passes detection produces a structured record, compatible with METHOD.md provenance rules:

```yaml
id: OBS-0001
type: coincident-event | isolated-anomaly | timing-pattern | control-comparison
timestamp-start: 2026-08-10T09:11:00Z
timestamp-end: 2026-08-10T21:11:00Z
location-center: [lat, lon]
location-radius-km: 150
streams-involved:
  - NEXRAD-KTLX: [description of reading]
  - GOES16-CH13: [description of reading]
  - SOLAR-Kp: [value at time]
  - GRID-SPP: [generation change or event]
detection-tags: [COINCIDENT, CONTROL-ABSENT]
ordinary-explanations:
  - explanation: [description]
    evidence-for: [what supports it]
    evidence-against: [what contradicts it]
    verdict: HOLDS | CONTRADICTED | INSUFFICIENT-DATA
intervention-indicators:
  - indicator: [description]
    evidence: [what was observed]
    mechanism-required: [what physical mechanism would produce this]
    mechanism-supported: true | false | unknown
control-region:
  location: [description]
  result: [what the control region showed]
verdict: UNRESOLVED | CORROBORATED | CONTRADICTED | INSUFFICIENT-DATA
confidence: SPECULATIVE | CONTESTED | DOCUMENTED
sources:
  - url: [original source URL]
    retrieved: [UTC timestamp]
    sha256: [hash of raw file]
    http-status: [200 / 403 / etc]
verified-on: [date verify.mjs confirmed all URLs resolve]
notes: [anything a human reviewer should know]
```

The AI writes summaries and explanation lists. It does not write the verdict. The verdict is generated deterministically from detection rules.

---

## Visual interface (to be built)

Primary view: **synchronized replay map**

- **Center:** geographic map with selectable overlays (radar, satellite, lightning, tower locations, facility locations, aircraft tracks)
- **Timeline:** scrubber at the bottom — moves all layers simultaneously
- **Data strip:** stacked graphs below the timeline (solar Kp, geomagnetic nT, Schumann SR power, grid MW, RF dBm) on a shared time axis
- **Event markers:** flagged moments where multi-stream coincidences occurred
- **Source panel:** the original raw artifact for the active layer
- **Claim panel:** the structured event record
- **Control comparison:** same time window in a nearby control region, side by side
- **Skeptic panel:** ordinary explanations at equal visual prominence — never buried

Three rendering modes always labeled:
1. **Raw** — unprocessed sensor data, original file
2. **Normalized** — corrected for units, projection, and time zone
3. **Interpretive** — anomaly highlighting and coincidence markers (always labeled as interpretive)

---

## Daily evidence digest format

Produced once or twice per day. Covers the previous 24 hours.

Sections:
1. Major storm systems — size, path, intensity, and anomaly score vs. 30-day baseline
2. Multi-stream coincident events — what streams, what changed, what time
3. Infrastructure overlays — documented facility activity, NOTAMs, cloud-seeding authorizations, grid events during storm periods
4. Skeptic engine results — which anomalies had ordinary explanations; which remain unresolved
5. Control region comparison — whether neighboring regions showed the same patterns
6. Data gaps — which sources had no data and why
7. Carry-forward items — unresolved events from prior days

---

## Observatory vs. Historical Record — the boundary

| Observatory | Historical Record |
|---|---|
| Current and near-real-time observations | Historical artifacts, maps, documents, records |
| Event records (OBS-nnnn) | Claims (C-nnnn), Sources (S-nnnn), Links (L-nnnn) |
| Automated collection | Curated human research |
| Daily cadence | No fixed cadence — trench by trench |
| May provide future source material for claims | Governs what becomes a formal claim |

An Observatory event record may eventually be cited as a Tier-1 source in a Historical Record claim, but only after:
- The raw data has been preserved and hashed
- The source URL has been verified by verify.mjs
- A human has reviewed the event record
- The DOCUMENTED confidence standard has been met

---

## Implementation stages

### Stage 1 — Foundation ← **START HERE**

- Define the `/observatory/` directory structure in the truth repo
- Define the event record schema (OBS-nnnn frontmatter format)
- Set up raw storage layout: `/observatory/raw/<source>/<date>/`
- Build the first two collectors: **NEXRAD** (NOAA public S3) and **GOES** (NOAA CDN)
- Build the normalizer for those two sources
- Build the provenance writer: hash every downloaded file; write retrieval manifest
- No AI, no analysis, no verdicts at this stage — just collection and preservation
- Confirm files are landing, hashing correctly, and are retrievable
- Commit structure and first collected files to truth repo
- Update ROADMAP.md and this file with Stage 1 complete

### Stage 2 — Multi-stream expansion

- Add solar/space weather, geomagnetic, lightning, grid, and Schumann collectors
- Build normalizer for each
- Build the event detector with the 15-minute coincidence window
- Tag events only — no verdicts yet
- Build the timeline replay interface with the first radar and satellite layers visible

### Stage 3 — Skeptic engine and event records

- Build the skeptic engine for each data type
- Wire into the detector
- Build the event record writer (OBS-nnnn files)
- Build the ordinary-explanation and intervention-indicator fields
- Extend visual interface: source panel, event record panel, control comparison
- Wire verify.mjs to check Observatory event record URLs

### Stage 4 — Infrastructure layers

- Add cell tower, HAARP/facility schedule, aircraft, and NOTAM collectors
- Each facility named, documented, and sourced — never generically labeled
- Build map overlay for infrastructure layers
- Wire into event detector as additional coincidence sources

### Stage 5 — Autonomous operation and daily digest

- Wire all collectors into the existing Coolify daemon architecture or a new Observatory container
- Build the daily digest generator
- Add pattern detection across historical event records (same location, same time window, multiple days)
- Wire verify.mjs to run against Observatory records weekly

### Stage 6 — Visual interface and public view

- Full synchronized replay map
- Three rendering modes (Raw / Normalized / Interpretive)
- Control region comparison
- Skeptic panel at equal visual prominence
- Daily digest public page on truth.tlid.io/observatory

---

## File map for Observatory

```
/observatory/
  README.md              — brief description linking to this spec
  /raw/                  — raw downloaded files, organized by source and date
    /nexrad/
    /goes/
    /solar/
    /geomagnetic/
    /lightning/
    /schumann/
    /grid/
    /aircraft/
    /rf/
    /infrastructure/
  /events/               — event records (OBS-nnnn.md files)
  /digests/              — daily evidence digests
  /collectors/           — collector scripts (one per source)
  /normalizers/          — normalizer scripts (one per source)
  /detectors/            — event detector and skeptic engine
```

---

## Rules carried over from METHOD.md

All Observatory records follow the same provenance discipline as the Historical Record:

- Every source is identified by real institution, URL, and retrieval date
- Raw data is preserved before any processing
- DOCUMENTED means the record exists and the pointer resolves — not that the claim is true
- Both sides of a dispute may be DOCUMENTED
- The skeptic engine is mandatory and its output is stored alongside every event
- Motive ("who benefits") appears only after mechanism and corroboration are established
- A timing coincidence alone does not establish causation or intent
- The system must show when an anomaly has an ordinary explanation — not only when it doesn't

---

*Truth is the product. "Strata" is an obsolete historical project name — do not use it.*
*ROADMAP.md is the cross-agent coordination document. Update it when stages are completed.*
*Auto-deploy is OFF in Coolify. Manual deploy required after every push.*
