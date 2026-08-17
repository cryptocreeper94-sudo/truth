# Truth Project — Build Agent Handoff
*Combined handoff for post-infrastructure-wipe rebuild. Covers the full ecosystem: Observatory, Physical Evidence, Historical Record, DVE, and infrastructure recovery state.*

---

## Read this first

The GitHub repository `cryptocreeper94-sudo/truth` has **two branches with separate histories:**

- **`main`** — existing production codebase deployed via Coolify to axiom42.com. Contains the Truth Sentinel daemon and seismic Observatory work.
- **`master`** — Replit development branch containing DVE Phase 1 implementation, this handoff, `ROADMAP.md`, `DVE_PRODUCT_SPEC.md`, `OBSERVATORY.md`, `PHYSICAL_EVIDENCE.md`, and `BACKUP_STRATEGY.md`.

**Do not blindly merge these branches.** Inspect both before making any cross-branch change. The recommended next action is to port the DVE work from `master` into `main` deliberately, adapting it to the Coolify deployment architecture.

Before writing a single line of code, confirm:
1. Which branch Coolify currently deploys (should be `main`).
2. Whether auto-deploy is enabled or manual.
3. The production database type, host, and connection method.
4. Whether Python (`yt-dlp`, `faster-whisper`, `ffmpeg`) is available on the production server.
5. What environment variables exist in Coolify and match the DVE pipeline's requirements.

---

## Infrastructure state (post-wipe recovery)

### What was lost
A `docker system prune` on the Hetzner CX33 server wiped all Docker containers, volumes, networks, and build cache. This included:
- All running Coolify-managed apps
- All Coolify-provisioned PostgreSQL and Redis databases
- All persistent file storage in Docker volumes
- All environment variables that existed only in Coolify's UI

### What was recovered
- Server upgraded from CX33 to CX43 (8 vCPUs, 16 GB RAM)
- Coolify dashboard restored (Redis RDB permissions fixed)
- SSH key access restored
- Disk freed from 100% full to ~67% free
- All 14 production domains restored to HTTP 200
- 11 PostgreSQL databases backed up to `/data/db-backups/` on host
- Daily automated backup cron configured at 3 AM UTC, 7-day retention
- Health checks configured for 31 apps via Coolify API

### What is still needed before considering infrastructure stable
- **Off-server database backups** — current backups are only on the same host. Must be sent to Backblaze B2, Cloudflare R2, or AWS S3. This is the most critical remaining gap.
- **Coolify configuration backup** — Coolify's own SQLite or Postgres database should be backed up off-server.
- **Encrypted environment variable store** — all Coolify env vars should be mirrored into an encrypted external location (Bitwarden recommended).
- **VPS snapshot** — take a fresh Hetzner snapshot now that the system is stable.
- **Backup restore test** — at least one database restore should be tested before the backup is trusted.
- **Disk-space alert** — add a cron-based alert or Hetzner monitoring rule when disk exceeds 80%.

### Production server details
- Server: Hetzner CX43 at 95.217.135.158
- SSH: `ssh -i ~/.ssh/id_ed25519 root@95.217.135.158`
- Coolify dashboard: accessible after Redis recovery
- Domains: darkwavestudios.io, invariant.tlid.io, trustlayer.tlid.io, axiom42news.com, fla.tlid.io, lume42.com, lumescan.tech, meridiancanon.com, axiomstudio.dev, axiom42suite.com, trustgen.design, lumeauto.tech, axiom42.com, study.tlid.io
- Axiom agent runs separately on CPX42

### Safe Docker cleanup rule
**Never run `docker system prune`, `docker volume prune`, or `docker image prune` without `--filter` flags.**

Safe alternatives:
```bash
docker builder prune -f         # Build cache only — safe
docker image prune -f           # Dangling images only — safe
# Always take a VPS snapshot before any broader cleanup
```

---

## Truth — product structure

Truth is one consolidated product. It is not several separate applications. Everything lives in the existing monorepo. Do not create separate apps or repositories for Observatory, Physical Evidence, or DVE work.

```
Truth
├── Historical Record       — claims, sources, provenance; governed by METHOD.md
├── Observatory             — continuous physical measurement; governed by OBSERVATORY.md
├── Physical Evidence       — documented experiments and observations; governed by PHYSICAL_EVIDENCE.md
└── DVE                     — media analysis and claim verification; governed by DVE_PRODUCT_SPEC.md
```

These layers are related:
- A Historical Record entry can cite a Physical Evidence case file as its documented source.
- An Observatory measurement can be linked as the raw data source for a Physical Evidence case file.
- A DVE report can be promoted into a draft Physical Evidence case file (but they are not the same thing).

---

## Historical Record

The Historical Record is the public research archive for claims, sources, historical documents, and research digs. It is governed by `METHOD.md`.

**The key rule:** `DOCUMENTED` means the record exists and the source resolves. It does not mean the claim is true. Both sides of any dispute may be documented simultaneously.

Institutional authority is not evidence. A claim that "NASA says so" requires a traceable pointer to the original measurement or dataset, not to a press release or institutional statement.

---

## Observatory

The Observatory continuously collects and preserves physical-world measurements from authoritative public sources. It documents that events occurred, when, where, how they were measured, and what uncertainty the source reported. It does not explain events.

**File:** `OBSERVATORY.md`  
**Implementation:** `observatory/` directory  
**Data store:** `observatory/data/` (gitignored)

### Governing principles

1. Source identifiers are never discarded. Every catalog's ID is preserved.
2. Uncertainty is first-class. Unknown ≠ zero. Every measurement carries its uncertainty or an explicit null.
3. Data gaps are explicit. A `DataGapRecord` is written for every collection failure.
4. Proximity is not causation. Documenting that two things happened near each other is not an explanation.
5. Retrieval is traceable. Every record contains the exact query URL, retrieval timestamp, and a hash of the raw payload.
6. Both sides of any coincidence are documented. Temporal relationships are recorded alongside baseline rates.

### Seismic layer — substantially complete

The seismic layer is the first and most complete Observatory layer. It includes:

- USGS ComCat (FDSN) collection with full field set
- Generic FDSN collection supporting ISC, EMSC, INGV, GeoNet, BGR
- Cross-catalog deduplication (time + distance + magnitude matching)
- Source identifier preservation
- Aftershock / foreshock / mainshock sequence tagging
- Induced-seismicity candidacy flagging (documentary — not causal attribution)
- Tectonic setting classification
- Magnitude of completeness estimation (MAXC method)
- Seismic station, volcano, fault, and GNSS deformation context collectors
- Explicit `DataGapRecord` entries for all collection failures
- Control-region baseline schema
- GeoJSON map layer generation
- NDJSON file store with per-day files and deduplication on write
- CLI runner (`observatory/run.ts`) with incremental and full-backfill modes

### Evidence layers status

| Layer | Status | Sources |
|---|---|---|
| Seismic | ✅ Active | USGS ComCat, ISC, EMSC, INGV, GeoNet |
| Atmospheric | Planned | NOAA GSOD, ERA5, MERRA-2, NOAA SWDI |
| Ionospheric / RF | Planned | GIRO, NOAA SWPC, NASA/JPL GPS TEC |
| Infrastructure | Planned | FAA NOTAMs, FAA ATIS, ADS-B Exchange, EIA grid reports |
| GNSS / Deformation | Partial | EarthScope PBO |

### Near-term Observatory roadmap

**ISC cross-validation** — Compare USGS and ISC preferred solutions for M≥4 events. Flag events where depth or magnitude disagree by more than 2σ.

**Detail-page enrichment** — Retrieve origin-time uncertainty, horizontal uncertainty, depth uncertainty, and magnitude uncertainty for M≥4.0 events from USGS detail-page endpoints.

**Reasenberg declustering** — Add as an opt-in alternative to the current simplified aftershock classifier. The simple method remains default.

**Regional completeness** — Replace a single global Mc estimate with per-region values. California and Japan detect much smaller events than remote ocean regions. Events below regional completeness should be visually distinguished on the map, not hidden.

**Live API** — Expose seismic events, GeoJSON layers, gap records, and station context through Observatory API endpoints for the front-end map.

**PostgreSQL migration** — The NDJSON file store works for development. Production continuous collection (~300 M≥2.5 events/day globally) requires indexed database storage. Schema: `lib/db/src/schema/seismic.ts` using Drizzle ORM.

### Medium-term Observatory layers

**Atmospheric** — NOAA surface observations and ERA5/MERRA-2 reanalysis fields, synchronized to the seismic event timeline, for comparison without causation claims.

**Ionospheric / RF** — Total Electron Content measurements, ionospheric disturbance indexes, Kp and Dst space-weather indexes.

**Infrastructure** — Public aviation NOTAMs, ATIS archives, ADS-B historical data, electric-grid emergency reports.

---

## Physical Evidence

Physical Evidence documents independently reproducible experiments and observations bearing on contested physical questions: surface geometry, optical propagation, celestial mechanics, gravitational effects, atmospheric behavior.

**File:** `PHYSICAL_EVIDENCE.md`  
**Case files:** `evidence/` directory (to be created)  
**Format:** `evidence/PE-YYYY-NNN.md`

### Governing principles

1. Competing predictions are stated before measurement, not adjusted to fit an unexpected result.
2. Setup is fully specified. An experiment without complete coordinates, elevations, instruments, calibration, and atmospheric conditions is `INCOMPLETE`.
3. Observation and interpretation are separate fields. They are never merged.
4. Atmospheric and optical conditions are measured, not estimated. Invoking refraction after an unexpected result without measurement is `INCONCLUSIVE — ENVIRONMENTAL CONTROLS MISSING`.
5. Reproducibility is required. A case file reaches a definitive status only after independent replication or documented repeated trials under varying conditions.
6. Institutional authority is not evidence. Primary measurements and retrievable raw data are valid citations.
7. Ridicule and dismissal are not documented. Social reception is irrelevant.
8. Both sides are preserved. A case file may link sources supporting different interpretations.

### Source classes

| Class | Evidentiary role |
|---|---|
| `PRIMARY_MEASUREMENT` | Direct record of an observation or measurement |
| `TECHNICAL_REPORT` | Documents methods, measurements, or institutional conclusions |
| `PEER_REVIEWED_RESEARCH` | Published method, result, or replication |
| `ARCHIVAL_RECORD` | Documents what existed or was stated at a historical time |
| `PUBLIC_DATASET` | Reusable machine-readable observations |
| `INDEPENDENT_REPLICATION` | A separate group's repeat measurement or critique |
| `MEDIA_REPORT` | Leads to underlying sources — not a substitute |
| `COMMENTARY` | Records a claim or framing — requires underlying-source recovery |

`MEDIA_REPORT` and `COMMENTARY` may document claims and framing, but they do not inherit the evidentiary strength of the source they discuss.

### Status codes

| Code | Meaning |
|---|---|
| `PRELIMINARY` | Single trial, documented, not yet replicated |
| `INCOMPLETE` | Required setup or environmental fields are missing |
| `SUPPORTED — SPHERICAL` | Multiple independent trials support the spherical prediction |
| `SUPPORTED — FLAT` | Multiple independent trials support the flat-plane prediction |
| `CONTRADICTED — SPHERICAL` | Result is inconsistent with spherical prediction after controls |
| `CONTRADICTED — FLAT` | Result is inconsistent with flat-plane prediction after controls |
| `INCONCLUSIVE — REFRACTION` | Consistent with atmospheric refraction but refraction was not measured |
| `INCONCLUSIVE — SETUP` | Alignment, elevation, or distance data insufficient |
| `INCONCLUSIVE — ENVIRONMENTAL` | Environmental controls were not recorded |
| `CONFLICTING` | Multiple trials produced different results without explanation |
| `RETRACTED` | A material error was found — see STATUS_RATIONALE |

### First case files queued

**PE-2026-001 — Great Salt Lake long-baseline laser**  
Initial status: `INCOMPLETE`. A laser reportedly aligned on equal-height tripods across 70+ miles of the Great Salt Lake was reported to reach the receiver with no measurable drop. Next step: locate earliest original video, extract all stated measurements, calculate spherical and flat predictions, identify missing controls.

**PE-2026-002 — Chicago skyline across Lake Michigan**  
Initial status: `INCOMPLETE`. Photographs show the Chicago skyline from approximately 55 miles. The disputed question is whether lower building structure is visible. Next step: identify exact shooting location, observer elevation, camera specs, building heights, and calculate geometric predictions.

---

## DVE — Deterministic Verification Engine

The DVE is a media-analysis and verification workspace inside Truth. It is not a separate product or brand. It downloads supported public media, transcribes it with timestamps, extracts claims, and labels each claim with one of five statuses.

**Files:** `DVE_PRODUCT_SPEC.md`, `artifacts/api-server/src/routes/verify.ts`, `artifacts/axiom-home/src/pages/verify.tsx`

### The five claim labels

| Label | Meaning |
|---|---|
| `DOCUMENTED` | The record or source exists and resolves. Does not mean the claim is true. |
| `CONTESTED` | Sources support opposing interpretations |
| `SPECULATIVE` | Claim lacks primary source support |
| `REFUTED` | Sources actively contradict the claim |
| `UNVERIFIABLE` | Cannot be checked with available sources |

### Phase 1 — complete (on `master` branch)

What was built and working as of August 2026:

- `POST /api/v1/verify` — accepts a public video URL, launches background pipeline
- Background pipeline: `yt-dlp` download → `ffmpeg` audio → `faster-whisper` transcription → OpenAI claim extraction and labeling → result persisted to DB
- `GET /api/v1/verify/:jobId` — polls job progress through named steps
- `GET /api/verify/share/:slug` — serves stable shareable report
- Frontend at `/verify` — submit form, progress tracker, report with expandable claim cards, share
- Frontend at `/verify/report/:slug` — stable shared-report page
- Database schema: `lib/db/src/schema/verify-jobs.ts` (Drizzle ORM, `dve_jobs` table)
- Visual language: alternating crème/black sections, 4% noise overlay, brutalist typography, tilt cards

**This work is on `master` and has NOT been ported to the Coolify production `main` branch.**

### Environment notes — critical for any agent picking this up

- `yt-dlp` and `faster-whisper` are Python packages. The managed package installer may fail trying to write into a protected Nix store path. If jobs fail at `downloading` or `transcribing`, run: `pip install yt-dlp faster-whisper`
- OpenAI access in Replit goes through Replit AI Integrations (`AI_INTEGRATIONS_OPENAI_BASE_URL` and `AI_INTEGRATIONS_OPENAI_API_KEY`).
- On Coolify or any self-hosted deployment, provide a real OpenAI API key as `OPENAI_API_KEY` and update the client initialization in `artifacts/api-server/src/routes/verify.ts`.
- Session secret: stored in Coolify env vars. Must be regenerated and re-entered after a wipe.
- GitHub PAT: stored in Coolify env vars. Must be re-entered.

### DVE next phases

**Phase 2 — Job persistence across server restarts**  
On startup, all jobs in a non-terminal step must be set to `error` with "Server restarted — please resubmit." The polling UI should surface the error instead of hanging.

**Phase 3 — Rate limiting and resource caps**  
Per-IP submission rate limit, configurable concurrent-job cap, and duration/size limits before download begins.

**Phase 4 — Source verification**  
Each source URL returned by the model must be fetched server-side. Dead links must be flagged. Source titles should come from the actual fetched page, not the model.

**Phase 5 — Physical Evidence promotion adapter**  
A researcher should be able to select a completed DVE report and begin a pre-populated `PRELIMINARY` case file draft. All required schema fields should either be filled from the report or explicitly marked `MISSING — requires field observation`.

### Product direction (approved)

- Public/free: limited analysis, public reports, stable sharing.
- Pro (~$15–20/month): saved library, private reports, exports, priority processing.
- Research/Team (~$99+/month): collaboration, API, batch, Physical Evidence promotion.
- Paid plans must never provide a more favorable verdict or a hidden truth standard.
- Public reports by default. Paid users may choose unlisted or private.
- Reports must show retrieval timestamp, source URL, media hash, engine version, transcript confidence, and source status.
- DVE is a provenance and verification workspace, not a fast verdict generator.

---

## Monorepo structure

```
artifacts/
  api-server/           Express 5 API (TypeScript, esbuild CJS bundle)
  axiom-home/           React/Vite frontend
  mockup-sandbox/       Component preview server
lib/
  db/                   PostgreSQL + Drizzle ORM (shared schema)
observatory/            Seismic and future Observatory collectors
evidence/               Physical Evidence case files (to be created)
knowledge_packs/        AXIOM knowledge packs (T1–T4, 40 packs)
OBSERVATORY.md          Observatory layer overview and principles
PHYSICAL_EVIDENCE.md    Physical Evidence schema and principles
DVE_PRODUCT_SPEC.md     DVE product brief
ROADMAP.md              Detailed project roadmap with done-looks-like criteria
BACKUP_STRATEGY.md      Infrastructure backup procedures
METHOD.md               Historical Record provenance standard (check `main` branch)
replit.md               Full project overview and naming conventions
```

### Tech stack

- Monorepo: pnpm workspaces
- Node.js: 24
- TypeScript: 5.9
- API: Express 5
- Database: PostgreSQL + Drizzle ORM
- Validation: Zod (v4), drizzle-zod
- Build: esbuild (CJS bundle)
- Frontend: React + Vite
- Python: yt-dlp, faster-whisper, ffmpeg (DVE pipeline)

---

## Principles that govern all layers

When adding any new evidence layer, data type, or feature:

1. Define the source authority first — who publishes this data, what is their methodology, what are their stated accuracy limits?
2. Write the gap record before writing data. If collection fails, a gap record must be written.
3. Capture raw payloads. Store the original API response alongside the normalized record.
4. Define a control region baseline before analysis. Any claim about elevated event rates requires an a priori comparison region and time window.
5. Proximity is context, not explanation. Co-location or temporal coincidence is a relationship to document, not a mechanism to assert.
6. Observation and interpretation are always separate fields.
7. Both sides of any contested result are preserved.
8. Institutional authority is not evidence. Trace every claim to a primary measurement.
9. Missing controls are documented, not silently filled.
10. "Unverifiable" is a valid result, not a failure state.

---

## Recommended first actions for the build agent

1. Confirm which Coolify branch is in production (`main` or `master`).
2. Read `ROADMAP.md` on `master` for the full technical plan with done-looks-like criteria.
3. Read `DVE_PRODUCT_SPEC.md` for the approved product direction before changing any DVE behavior.
4. Read `OBSERVATORY.md` and `PHYSICAL_EVIDENCE.md` before adding or modifying those layers.
5. Port DVE Phase 1 from `master` into `main` deliberately, adapting to the Coolify architecture.
6. Recreate self-hosted environment requirements on Coolify: Python packages, database, OpenAI key, session secret.
7. Run a real verification test after porting and record the result.
8. Set up off-server database backups as described in `BACKUP_STRATEGY.md`.
9. Rotate any secrets that appeared in documents, screenshots, or handoffs.
10. Take a VPS snapshot before and after any significant infrastructure change.

---

*Last updated: August 2026. Source branches: `master` (Replit), `main` (Coolify/production).*
