# TRUTH Archive — Project Roadmap

> **CRITICAL**: This document persists across agent sessions. Any agent working on Truth MUST read this before making changes.
> **Last Updated**: 2026-08-10 — Phase 1a complete, enrichment pass done.

## Architecture

- **Site**: Static SPA at `D:\truth\site\index.html` + `style.css` — reads raw markdown from GitHub
- **Daemon**: `D:\truth\daemon\daemon.mjs` — Truth Sentinel, runs as Coolify container on Hetzner VPS
- **Repo**: `cryptocreeper94-sudo/truth` on GitHub
- **Live URL**: `truth.tlid.io`
- **Model**: GPT-4o-mini (env var `TRUTH_MODEL` in Coolify)
- **Budget**: $30/month, 3 claims per 6-hour cycle
- **Parser**: Custom regex in index.html (lines ~55-68), strips quotes, maps source_ids→sources, derives id from filename

## Key Rules

1. **Auto-deploy is OFF** on both Site and Sentinel. Manual deploy from Coolify.
2. **Truth is not a wiki — it's a courtroom.** Anyone can submit evidence. No one edits the record.
3. **DOCUMENTED ≠ TRUE.** It means a verifiable source exists. Both sides of a debate can be DOCUMENTED.
4. **PM2 is BANNED.** All daemons run as Coolify containers.
5. **Volume mount issue**: Sentinel Coolify volume mounts `/app/daemon` which overlays code. Need to change to `/app/state`.


## Phase 0 — Observatory Specification ✅ COMPLETE (2026-08-10, main agent)

> **NEW MAJOR SECTION: The Truth Observatory** — a continuously running atmospheric and geophysical monitoring system.
> Read `OBSERVATORY.md` in full before doing any Observatory work. It is the governing specification.

### What the Observatory is
A daily-cadence evidence collection and review system for atmospheric, geophysical, infrastructure, and RF events. It sits alongside the Historical Record inside Truth. It is NOT a separate product. "Strata" is an obsolete name — do not use it.

### Why it exists
Jason has observed for over a year that major storm systems, unusual Doppler/radar patterns, apparent microwave-frequency events, and infrastructure-coincident atmospheric events appear at a pace and pattern that doesn't fit normal climate variation. The Observatory tests these observations using the same provenance discipline as the Historical Record.

### Core operating rule
The system must be capable of **disproving** the investigator's preferred explanation. If the skeptic engine is disabled, it becomes advocacy software.

### Primary output: daily evidence digest
Major storms and multi-stream coincidences must be surfaced within 24 hours — not weekly. The daily digest is the central output, not an optional report.

### Data sources (full spec in OBSERVATORY.md)
- NEXRAD / Doppler radar (NOAA public S3, Level II)
- GOES satellite (IR, visible, water vapor)
- Surface weather stations (NOAA ASOS / Mesonet)
- Lightning (Blitzortung)
- Solar / space weather (NOAA SWPC)
- Geomagnetic (INTERMAGNET)
- Schumann resonance (multiple independent stations — never treat one plot as ground truth)
- Ionosonde (GIRO/DIDBase)
- Power grid (EIA-930)
- Aircraft tracks (ADS-B Exchange)
- NOTAMs and cloud-seeding permits (FAA)
- Cell tower infrastructure (FCC DB + OpenCelliD)
- HAARP and ionospheric research facilities (by real name, not generic label)
- **Ecological indicators and atmospheric chemistry** (Layer 5 — see OBSERVATORY.md):
  - Trace metal deposition in soil, snow, and water (Al, Ba, Sr) — USGS, EPA AQS, NADP
  - Pollinator and native insect population indices — USGS Bee Lab, iNaturalist
  - Wild plant and species observation trends — iNaturalist API
  - Independent peer-reviewed aerosol and sample studies (DOI-cited, chain-of-custody required)
  - All ecological observations require baseline comparison, source attribution alternatives, geographic controls, and independent replication before linking to atmospheric events

### Architecture
All Observatory components follow the **DDA 42-Doctrine / Deterministic Dissolution Ladder** — same architecture as the Truth Sentinel daemon. Read the module map in `OBSERVATORY.md` before writing any collector, normalizer, or detector script. Every script must declare its doctrine nodes in its header comment.

### Implementation stages (next agent: start at Stage 1)
1. **Stage 1 — Foundation** ✅ COLLECTORS BUILT & LIVE-TESTED (2026-08-10, main agent)
   - [x] `/observatory/` directory structure (see observatory/README.md)
   - [x] NEXRAD collector (`observatory/collectors/nexrad.mjs`) — verified live: real Level II scans downloaded, SHA-256 hashes confirmed against re-computation
   - [x] GOES collector (`observatory/collectors/goes.mjs`) — verified live: GOES-19/18 CONUS imagery, lightning (GLM), rainfall rate
   - [x] `Dockerfile.observatory` + `observatory/start.sh` — Coolify container, NO PM2, volume at `/app/state`
   - [x] Retention pruning (default 7 days) — manifests are the permanent provenance record, never pruned
   - [ ] Deploy Observatory container in Coolify (Jason: new service from Dockerfile.observatory, volume `/app/state`)
   - [ ] OBS-nnnn event record schema (define in Stage 3 when detector exists)
   - **Live-verified source notes:** NOAA primary NEXRAD bucket denies anonymous listing — use `unidata-nexrad-level2` mirror. GOES-19 replaced GOES-16 as GOES-East (noaa-goes16 has no 2026 data). Full-disk imagery is 250-390 MB/file — CONUS products are the sustainable default; enable full-disk with `GOES_INCLUDE_MCMIPF=1`.
2. Stage 2 — Multi-stream expansion (solar, geomagnetic, lightning, grid, Schumann)
3. Stage 3 — Skeptic engine + event record writer
4. Stage 4 — Infrastructure layers (towers, facilities, aircraft, NOTAMs)
5. Stage 5 — Autonomous daemon + daily digest generator
6. **Stage 6 — Public visual interface** — live multi-layer map, synchronized
   replay, and daily digest page
   - [ ] Build a public live map that combines NEXRAD and GOES in one view
   - [ ] Add shared timestamps, play/pause, timeline scrubbing, and current-event following
   - [ ] Add layer controls: visibility, opacity, legends, coverage, and source identity
   - [ ] Show observation time, retrieval time, latency, raw artifact pointer, and manifest hash
   - [ ] Show delayed, stale, unavailable, and partial data as explicit data gaps
   - [ ] Add lightning and surface-station overlays after their collectors/normalizers exist
   - [ ] Add later context overlays for solar/geomagnetic, RF, aircraft, infrastructure, grid, and ecological/chemical streams
   - [ ] Keep coincidence visually distinct from causation; no interpretive label from proximity alone
   - [ ] Add synchronized event replay, Raw / Normalized / Interpretive modes, and equal-prominence skeptic panel

### Deferred deliverable — Truth Observatory methods/protocol paper

**Status: DEFERRED — do not begin drafting yet.**

After the Observatory has matured beyond the initial implementation and has
produced a meaningful body of event records, create a project-specific
methods/protocol paper. This is a documentation and methodology deliverable,
not a claim that the Observatory has already established a particular
explanation for any phenomenon.

The paper should make the project understandable as a coherent, reproducible
research system rather than a collection of unrelated tools. It should
eventually cover:

- the Observatory's research questions, scope, and geographic coverage tiers
- the literature foundation, including the 93-paper research corpus
- source selection, access boundaries, collection cadence, and provenance
- normalization, event detection, baselines, and control-region comparisons
- the mandatory skeptic engine and falsification procedures
- how observations are kept separate from interpretations and Historical Record claims
- evidence, uncertainty, data gaps, retention, and known limitations
- representative event records and synchronized replay examples

**Start condition:** begin only after Stages 2–3 are substantially developed
and there is enough real Observatory operation to document actual methods and
limitations. Until then, keep `OBSERVATORY.md`, `METHOD.md`, source notes,
event schemas, and implementation records current; do not create the paper
itself or present preliminary observations as conclusions.

## Phase 1a — Domain Navigation & Content Quality ✅ COMPLETE

- [x] 19 domain categories (Biblical Lineage, Cartography, Intelligence Programs, etc.)
- [x] Tiered accordion on home page (Tiers I-V by source-material density)
- [x] Domain filter bar on claims page
- [x] Breadcrumb navigation on claim/source detail pages
- [x] Related Claims sidebar
- [x] Source detail: evidence preview (image-url), verify button, external refs
- [x] Retroactive domain assignment for all 89 claims via GitHub API
- [x] GPT-4o-mini enrichment of 70 thin daemon claims (~$0.035)
- [x] Daemon prompt v0.4.0 with strict frontmatter template
- [x] Model switch: gpt-4o → gpt-4o-mini (15x cheaper)
- [x] Ken Burns hero slideshow (4 generated images)
- [x] Canonical footer with easter egg admin gate (triple-click → PIN input)

## Phase 1c — Record Integrity ✅ ENGINE BUILT (2026-08-10, main agent)

> DOCUMENTED means "the record exists AND the pointer to it resolves" — not that the claim is true.
> A fabricated catalog number or invented URL fails this even under the weak reading.

- [x] `daemon/verify.mjs` — citation verification engine. Fetches every source verify-at/verification_url and every URL in claim bodies. Verdicts: verified / blocked (site refuses bots) / failed / no-checkable-source. Writes `verification/report.json` + stamps claim frontmatter (`verification:`, `verified-on:`).
- [x] Demotion pass run: claims whose citations did not resolve dropped DOCUMENTED → SPECULATIVE (original tag preserved in `confidence-claimed:` — verify.mjs auto-restores when citations later pass). Result: 18 verified, 39 demoted, 32 already pending.
- [x] Daemon contract fixed: daemon may NEVER assign DOCUMENTED; drafts start SPECULATIVE; fabricating citations prohibited in prompt. Only verify.mjs promotes.
- [x] Site shows verification badges (claim cards + detail) and a Verification sidebar card explaining the gate.
- [x] Duplicate ID fixed: second C-0077 renumbered to C-0089.
- [ ] Repair pass on failed citations: replace invented URLs/catalog refs with real ones (Rumsey luna URLs, real LMA/archive references), then re-run verify.mjs to restore DOCUMENTED. **Do this as part of the image/link enrichment session.**
- [ ] Run verify.mjs at the end of every daemon cycle (wire into daemon.mjs or cron).

## Phase 1b — Image Caching & Infrastructure

- [ ] Create `/evidence/` directory in repo for hosting cached source images
- [ ] Script to download external evidence images and cache locally
- [ ] Fix Coolify volume mount: `/app/daemon` → `/app/state`
- [ ] Reset daemon budget tracking after model switch

## Phase 2 — Courtroom Model (User Evidence Submission)

- [ ] Admin page behind PIN gate (route: `#/admin`)
- [ ] Submission form: claim text, confidence tag, sources, domain
- [ ] Moderation queue: admin reviews before publishing
- [ ] Discussion system persistence (currently localStorage only → needs backend or GitHub Issues API)
- [ ] User authentication (simple PIN-based for admin, open for discussion)

## Phase 3 — Cross-Reference Graph

- [ ] Visual graph of claim-to-claim relationships
- [ ] `related:` field auto-populated by daemon
- [ ] Network view showing which domains interconnect
- [ ] Timeline view for chronological claims
- [ ] Search functionality across claims, sources, and digs

## Phase 4 — Community & Evidence Standards

- [ ] Public evidence submission portal (non-admin)
- [ ] Evidence quality scoring (Tier 1-5 source classification)
- [ ] Automated duplicate detection
- [ ] RSS/Atom feed of new claims
- [ ] API for programmatic access

## Domain → Tier Mapping

| Tier | Name | Domains |
|---|---|---|
| I | Foundation | Biblical Lineage, Biblical Texts, Calendar Systems, Cartography, Financial Origins |
| II | Institutional | Intelligence Programs, Institutional Origins, Education Design |
| III | Physical Evidence | Ancient Engineering, Buried Cities, Star Forts, Archaeology |
| IV | Civilization Patterns | Orphan History, World Fairs, Reset Evidence |
| V | Deep Chronology | Suppressed Finds, Ancient Texts, Flood Narratives, Etymology |

## File Map

| File | Purpose |
|---|---|
| `site/index.html` | Core SPA — all routing, rendering, parsing |
| `site/style.css` | All styles — design system, components, responsive |
| `site/img/hero-*.png` | Ken Burns slideshow images |
| `daemon/daemon.mjs` | Truth Sentinel — autonomous research daemon |
| `daemon/Dockerfile` | Container build for Coolify |
| `METHOD.md` | The Law — archive methodology rules |
| `claims/*.md` | Individual claim files with YAML frontmatter |
| `sources/*.md` | Source documentation files |
| `digs/*.md` | Dig site investigation files |
| `links/*.md` | Cross-reference link files |
