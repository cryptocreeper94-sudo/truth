# Truth Observatory

> Read `OBSERVATORY.md` in the repo root before working on this directory.
> Read `ROADMAP.md` for cross-agent coordination and implementation stage status.

The Observatory is the daily-cadence atmospheric and geophysical monitoring section of Truth.
It is NOT a separate product. It lives inside Truth alongside the Historical Record.

## Directory structure

```
observatory/
  README.md              — this file
  start.sh               — Coolify/Docker entrypoint (no PM2, no process managers)
  collectors/
    nexrad.mjs            — NEXRAD Level II radar (Unidata public S3 mirror, 5 min interval)
    goes.mjs              — NOAA GOES-19/18 satellite imagery (public S3, 10 min interval)
  raw/                   — raw downloaded files (on /app/state volume in production)
    nexrad/<year>/<mm>/<dd>/<SITE>/<filename>
    goes/<GOES19|GOES18>/<product>/<year>/<doy>/<hour>/<filename>
  state/                 — manifests and collector state (on /app/state volume)
    nexrad-manifest.jsonl — append-only provenance record for every NEXRAD file
    goes-manifest.jsonl   — append-only provenance record for every GOES file
  events/                — OBS-nnnn event records (Stage 3+)
  digests/               — daily evidence digests (Stage 5+)
  normalizers/           — normalizer scripts, one per source (Stage 2+)
  detectors/             — event detector and skeptic engine (Stage 3+)
  visual/                — live map, layer adapters, timeline, and replay UI (Stage 6+)
```

## Container deployment (Coolify)

- Use `Dockerfile.observatory` at repo root
- Volume mount: `/app/state` (NOT `/app/observatory` — avoids overlaying code)
- No PM2. The `start.sh` supervisor restarts crashed collectors with exponential backoff
- Auto-deploy is OFF — manual deploy from Coolify after every push
- Environment variables to set in Coolify:
  - `STATE_DIR` — defaults to `/app/state/observatory`
  - `RAW_DIR` — defaults to `/app/state/observatory/raw`
  - `NEXRAD_INTERVAL_MS` — defaults to `300000` (5 min)
  - `GOES_INTERVAL_MS` — defaults to `600000` (10 min)
  - `NEXRAD_SITES` — comma-separated list of 4-letter site IDs (defaults to 20 priority sites)

## Stage 1 status (current) ✅

- [x] NEXRAD collector — fetches Level II scans from NOAA public S3; SHA-256 hash + manifest
- [x] GOES collector — fetches GOES-19/18 NetCDF files from NOAA public S3; SHA-256 hash + manifest
- [x] Dockerfile.observatory — node:20-slim, no PM2, /app/state volume, Coolify-ready
- [x] start.sh supervisor — pure bash, restarts collectors on exit with backoff
- [x] Live-tested 2026-08-10: real NEXRAD scans + GOES-19/18 imagery downloaded, SHA-256 verified
- [x] Retention pruning: raw files pruned after RETENTION_DAYS (default 7); manifests never pruned
- [ ] Deploy Observatory container in Coolify (separate from Truth Sentinel)

## Stage 2 (next)

Add collectors for: solar/space weather (NOAA SWPC), geomagnetic (INTERMAGNET),
**seismic/geological observations** (USGS/ANSS, public FDSN stations, volcano
alerts, deformation products), lightning (Blitzortung), power grid (EIA-930),
Schumann resonance.
Build normalizer for NEXRAD and GOES.
Wire event detector with 15-minute coincidence window.

### Sequencing guardrail

The seismic task is an additive Stage 2 workstream. It does not replace or
reconfigure the Stage 1 NEXRAD/GOES collectors, and it does not implement
Stage 3 verdicts, the skeptic engine, or Stage 6 map UI. Its output is
preserved source records and normalized seismic observations for later stages.
Task-agent code remains isolated until review, validation, and an explicit
merge.

## Live visual Observatory map (planned Stage 6)

The public interface is a required multi-layer map, not a collection of links
to separate provider websites. Its first release will combine NEXRAD and GOES
with shared timestamps, opacity controls, source/latency metadata, raw-file
provenance, and visible data gaps. Lightning and surface stations follow as
their normalizers become available; seismic/geological, infrastructure, RF,
space-weather, grid, and ecological streams are added when their coverage and
timestamps support reliable overlays.

Seismic overlays must retain earthquake catalog IDs, provider and review
status, location/magnitude/depth uncertainty, station coverage, and duplicate
reconciliation. A nearby earthquake or fault is a context relationship, not
evidence of an intentional or human-made cause.

The map is a comparison workspace. It must preserve independent layer
identity and must not turn visual proximity into a causal claim. Completed
events will later be replayable on the same timeline with Raw, Normalized, and
Interpretive modes plus the skeptic panel.

## 42-doctrine alignment

Every collector script declares its doctrine nodes in its header comment.
See `OBSERVATORY.md` for the full module map.
Key rules:
- [13] Skeptic engine is non-overridable — never disable
- [26] Verdict is deterministic rules, not AI judgment
- [32] SHA-256 hash every raw file before any processing
- [37] No event published without two independent streams confirming
- [40] Data gaps are recorded explicitly — never silently skipped
