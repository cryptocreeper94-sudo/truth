# Observatory

The Observatory is a continuously collected, provenance-preserving record of atmospheric, geophysical, infrastructure, and RF observations.  It is a component of the Truth project — a separately governed dataset that may provide documented source material for historical-record claims, but observation and interpretation remain strictly separate.

Observations are collected from authoritative public sources, normalized into a common schema, and stored with full retrieval metadata.  The Observatory does not explain events.  It documents that they occurred, when, where, how they were measured, and what uncertainties the source reported.

---

## Evidence layers

| Layer | Status | Sources |
|---|---|---|
| **Seismic** | ✅ Active | USGS ComCat, ISC, EMSC, INGV, GeoNet |
| Atmospheric | Planned | NOAA, ERA5, MERRA-2 |
| Ionospheric / RF | Planned | GIRO, NOAA SWPC |
| Infrastructure | Planned | FAA ATIS, ADS-B Exchange |
| GNSS / Deformation | Partial | EarthScope PBO |

---

## Seismic layer

The seismic layer collects earthquake events from the USGS/ANSS Comprehensive Catalog (ComCat) and cross-checks them against the ISC Bulletin and other FDSN-compliant data centres.

Every event record carries:
- **Source identifiers** from every contributing catalog — no IDs are discarded during normalization
- **Origin time** with uncertainty in seconds
- **Hypocenter** (latitude, longitude, depth) with uncertainty and fixed-depth flag
- **Magnitude** with type (Ml, Mw, Mb, …), value, and uncertainty
- **Quality metrics**: phase count, station count, azimuthal gap, minimum station distance, RMS residuals
- **Review status**: `automatic`, `reviewed`, `deleted`, `unknown`
- **Retrieval metadata**: query URL, retrieval timestamp, raw payload SHA-256

Context data collected separately (slower cadence):
- **Seismic stations**: FDSN station metadata including operational status at time of retrieval
- **Volcanoes**: USGS VHP alert levels + Smithsonian GVP
- **Active faults**: USGS Quaternary Fault and Fold Database
- **Deformation**: EarthScope PBO GNSS velocities

Normalizer features:
- Cross-catalog deduplication using time + distance + magnitude matching
- Aftershock / foreshock / mainshock sequence tagging
- Induced-seismicity candidacy flagging (documentary only — not causal attribution)
- Tectonic setting classification
- Magnitude of completeness estimation (MAXC method)

Data gaps are recorded explicitly as `DataGapRecord` entries so downstream analysis can distinguish "no events" from "no data."

Control-region baselines are documented with explicit rationale so comparison regions are defined a priori, not selected post-hoc.

For implementation details, see `observatory/README.md`.

---

## Governing principles

1. **Source identifiers are never discarded.**  Every catalog's ID for every event is preserved in `NormalizedSeismicEvent.sourceIds`.

2. **Uncertainty is first-class.**  Unknown ≠ zero.  Every measurement carries its uncertainty or an explicit `null` (not available in source) rather than a silent zero or omission.

3. **Data gaps are explicit.**  A `DataGapRecord` is written for every collection failure.  Analysis that does not first check for gaps may confuse absence of records with absence of events.

4. **Proximity is not causation.**  The normalizer documents that an event occurred near a fault, volcano, or induced-seismicity zone.  It does not explain why the event occurred.

5. **Retrieval is traceable.**  Every record contains the exact query URL, retrieval timestamp, and a hash of the raw payload so the complete retrieval history can be audited even if the upstream catalog later updates or retracts records.

6. **Both sides of any coincidence are documented.**  If an earthquake preceded a reported anomaly, that temporal relationship is recorded.  So is the baseline rate of earthquakes in the same region during unrelated periods.

---

## File locations

```
observatory/             Implementation (collectors, normalizers, store, CLI)
observatory/data/        Runtime data store (gitignored)
OBSERVATORY.md           This file — product overview and governing principles
ROADMAP.md               Upcoming Observatory evidence layers and features
```
