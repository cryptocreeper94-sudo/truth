# Physical Evidence

The Physical Evidence layer is a record type within the Truth project.  It documents independently reproducible experiments and observations that bear on contested physical questions — surface geometry, optical propagation, celestial mechanics, gravitational effects, atmospheric behaviour, and related domains.

It connects the other two Truth layers:
- A **Historical Record** entry can cite a Physical Evidence case file as its documented source.
- An **Observatory** measurement can be linked as the raw data source for a Physical Evidence case file.

Physical Evidence does not decide which model is correct.  It documents what was measured, under what conditions, against what competing predictions, and what the result category is.  Conclusions are earned by the data, not asserted in advance.

---

## Governing principles

These extend the Observatory principles and METHOD.md to experimental case files.

1. **Competing predictions are stated before measurement.**  Every case file must specify what each model predicts for the experimental setup before any result is recorded.  Post-hoc model adjustment to fit an unexpected result must be documented as a separate case file entry.

2. **Setup is fully specified.**  Instrument type, calibration, exact coordinates, elevations, distances, atmospheric conditions, and alignment method are all required fields.  An experiment without a complete setup record is classified `INCOMPLETE`, not `SUPPORTED` or `CONTRADICTED`.

3. **Observation and interpretation are separate fields.**  What the instrument recorded is the observation.  What that implies for a model is the interpretation.  They live in separate fields and are never merged.

4. **Atmospheric and optical conditions are measured, not estimated.**  Refraction, temperature inversion, pressure, humidity, and wind must be recorded if the experiment involves long-distance optical propagation.  Invoking refraction as an explanation after an unexpected result, without measurement, is classified as `INCONCLUSIVE — ENVIRONMENTAL CONTROLS MISSING`.

5. **Reproducibility is a requirement.**  A single trial is preliminary.  A case file reaches `SUPPORTED` or `CONTRADICTED` status only after independent replication or documented repeated trials under varying conditions.

6. **Institutional authority is not evidence.**  Neither "NASA says so" nor "authority X says so" is a valid citation in a Physical Evidence record.  Primary measurements, instrument specifications, and retrievable raw data are valid citations.

7. **Ridicule and dismissal are not documented.**  How a finding was received socially is irrelevant to the case file.  The record documents the measurement, not the reaction.

8. **Both sides are preserved.**  A case file may link sources that support different interpretations.  The record should expose disagreement, not collapse it into a single approved narrative.

---

## Documentary source classes

Physical Evidence is not limited to video experiments.  Every source is classified before it is used:

| Class | Examples | Evidentiary role |
|---|---|---|
| `PRIMARY_MEASUREMENT` | Instrument log, survey notebook, raw image, original video, field sheet | Direct record of an observation or measurement |
| `TECHNICAL_REPORT` | Government report, observatory bulletin, engineering report, expedition record | Documents methods, measurements, or stated institutional conclusions |
| `PEER_REVIEWED_RESEARCH` | Journal paper, conference paper, dissertation | Documents a published method, result, or replication |
| `ARCHIVAL_RECORD` | Historical map, chart, ledger, newspaper scan, original correspondence | Documents what existed or was stated at a historical time |
| `PUBLIC_DATASET` | Raw or downloadable catalog, weather series, survey data | Reusable machine-readable observations |
| `INDEPENDENT_REPLICATION` | A separate group's repeat measurement or critique | Tests reproducibility |
| `MEDIA_REPORT` | News article, interview, documentary, explainer | Leads to underlying sources; not a substitute for them |
| `COMMENTARY` | Blog, forum post, social post, advocacy video, debate clip | Records a claim or framing; requires underlying-source recovery |

`MEDIA_REPORT` and `COMMENTARY` sources are valuable for locating evidence and documenting public framing, but they do not inherit the evidentiary strength of the source they discuss.  The underlying report, dataset, or measurement must be linked separately.

### Source record fields

Every source linked to a case file should include:

```
SOURCE_ID             Stable source identifier
SOURCE_CLASS          One class from the table above
AUTHOR_OR_ORG         Named author, institution, or "unknown"
TITLE
PUBLICATION_DATE      Date stated by the source, if known
RETRIEVED_AT          ISO 8601 retrieval timestamp
CANONICAL_URL         Original URL, DOI, archive pointer, or catalog identifier
MIRROR_URLS           Optional independent mirrors or archive.org snapshots
ARTIFACT_HASH         SHA-256 of the preserved file when available
PAGES_OR_TIMECODES    Exact pages, figures, tables, or video timecodes used
CLAIMS_EXTRACTED      Neutral statements supported or asserted by the source
METHOD_EXTRACTED      Instruments, sample, controls, and analysis described
LIMITATIONS_EXTRACTED Uncertainty, missing controls, and stated limitations
RELATED_SOURCES       Primary source, replication, correction, or response links
```

### Agenda and framing record

The project may document advocacy, funding, affiliations, editorial choices, and omitted controls, but it must not present an inferred motive as fact.  Use three separate fields:

```
DECLARED_INTERESTS    Interests the author or organization explicitly discloses
OBSERVED_FRAMING      Verifiable wording, selection, omissions, or edits in the source
MOTIVE_STATUS         "documented" | "plausible but unverified" | "unknown"
```

"This source advocates model X" can be documented from its wording.
"This source is intentionally lying" requires evidence beyond disagreement and must not be asserted by the engine.

---

## Case file schema

Every Physical Evidence case file is a structured document.  The following fields are required unless marked optional.

```
CASE_ID          Unique identifier. Format: PE-YYYY-NNN (e.g. PE-2026-001)
TITLE            Short descriptive title of the experiment or observation
STATUS           See status codes below
CREATED          ISO 8601 date
UPDATED          ISO 8601 date
LINKED_HR        [optional] Historical Record entry IDs this case supports
LINKED_OBS       [optional] Observatory measurement IDs used as data source

CLAIM
  Statement of the observation or experimental claim being evaluated.
  Written neutrally — not as "proof" or "debunking."

SETUP
  LOCATION_A
    description  Human-readable location name
    coordinates  GPS lat/lon to 6 decimal places
    elevation_m  Elevation above mean sea level in metres
  LOCATION_B     [optional — if two-endpoint experiment]
    description
    coordinates
    elevation_m
  DISTANCE_M     Measured distance between endpoints in metres (method stated)
  INSTRUMENT     Name, model, calibration date, accuracy spec
  TARGET         Description of target or receiver
  INSTRUMENT_HEIGHT_M   Height of instrument above surface at its location
  TARGET_HEIGHT_M       Height of target above surface at its location
  ALIGNMENT_METHOD      How the instrument was leveled or aimed (stated precisely)
  REPEATED_TRIALS       Number of independent trials
  TRIAL_CONDITIONS      [array] Weather, temperature, time of day for each trial

ENVIRONMENTAL
  AIR_TEMP_C     [array] Temperature at multiple heights above surface
  WATER_TEMP_C   [optional] Water surface temperature if applicable
  PRESSURE_HPA
  HUMIDITY_PCT
  WIND_MS
  INVERSION      boolean — was a temperature inversion present?
  INVERSION_SOURCE  How the inversion status was determined
  REFRACTION_CORRECTION_APPLIED  boolean

PREDICTIONS
  Each entry states what a specific model predicts for this exact setup.

  - MODEL: Spherical Earth (no refraction)
    PREDICTED_VALUE:
    FORMULA_USED:
    INPUTS:

  - MODEL: Spherical Earth (with standard atmospheric refraction k=0.13)
    PREDICTED_VALUE:
    FORMULA_USED:
    INPUTS:

  - MODEL: Flat plane (no curvature)
    PREDICTED_VALUE:
    FORMULA_USED:
    INPUTS:

  [Additional models may be added]

OBSERVATION
  RAW_RESULT      What the instrument or camera recorded, stated precisely
  MEDIA           [array] URLs or file hashes of original unedited images/video
  MEDIA_NOTES     Lens type, focal length, any stitching or processing applied
  DATA_FILES      [array] Raw instrument output files with SHA-256 hashes

INTERPRETATION
  RESULT_AGAINST_SPHERICAL   numeric difference or qualitative match/mismatch
  RESULT_AGAINST_FLAT        numeric difference or qualitative match/mismatch
  NOTES           Any factors that complicate interpretation

STATUS_RATIONALE  Why this case file carries its current STATUS code

SOURCES
  [array] Retrievable citations — URLs with retrieval timestamps, DOIs,
  instrument manuals, calibration certificates. No bare assertions.
```

---

## Status codes

| Code | Meaning |
|---|---|
| `PRELIMINARY` | Single trial, setup documented, result recorded, not yet replicated |
| `INCOMPLETE` | Required setup or environmental fields are missing |
| `SUPPORTED — SPHERICAL` | Multiple independent trials support the spherical prediction |
| `SUPPORTED — FLAT` | Multiple independent trials support the flat-plane prediction |
| `CONTRADICTED — SPHERICAL` | Result is inconsistent with the spherical prediction after controls |
| `CONTRADICTED — FLAT` | Result is inconsistent with the flat-plane prediction after controls |
| `INCONCLUSIVE — REFRACTION` | Result is consistent with atmospheric refraction but refraction was not directly measured |
| `INCONCLUSIVE — SETUP` | Alignment, elevation, or distance data is insufficient to resolve the ambiguity |
| `INCONCLUSIVE — ENVIRONMENTAL` | Environmental controls were not recorded during the trial |
| `CONFLICTING` | Multiple trials produced different results without a clear explanation |
| `RETRACTED` | A material error was found in the setup or data; see STATUS_RATIONALE |

No case file moves from `PRELIMINARY` to a definitive status without at least one independent replication or a documented repeated trial under meaningfully different conditions.

---

## First case files queued

The following experiments are documented in the public record and are ready for case file construction.

### PE-2026-001 — Great Salt Lake long-baseline laser
A laser was reportedly aligned on tripods at equal heights across a 70+ mile stretch of the Great Salt Lake and was reported to reach the receiver with no measurable drop.  Source: video documentation circulating among independent researchers.

**Initial status:** `INCOMPLETE` — distance, exact coordinates, tripod height, alignment method, and atmospheric conditions must be extracted from the original video and independently verified.

**Next step:** Locate the earliest original video.  Extract all stated measurements.  Reconstruct the geometry against spherical and flat predictions.  Identify what is verified and what is missing.

---

### PE-2026-002 — Chicago skyline visibility across Lake Michigan
Multiple photographs show the Chicago skyline visible from the Michigan shoreline at approximately 50–55 miles.  The visible extent — whether only upper floors or lower building structure — is disputed.

**Initial status:** `INCOMPLETE` — exact shooting location, observer elevation, camera specifications, and building identification must be established from original unedited photographs.

**Next step:** Locate the earliest original photographs.  Identify the specific buildings visible and their measured heights.  Calculate the geometric horizon for the observer elevation.  Compare visible building extent with spherical and flat predictions.  Document atmospheric conditions at the time.

---

## File locations

```
PHYSICAL_EVIDENCE.md          This file — layer overview, schema, and principles
evidence/                     Case file directory (to be created)
evidence/PE-YYYY-NNN.md       One file per case
evidence/media/               Original media files (images, video) — gitignored if large
```

---

## Relationship to METHOD.md

Physical Evidence case files follow the same provenance discipline as Historical Record entries:

- `DOCUMENTED` means the measurement exists and its source resolves.  It does not mean the underlying claim is true.
- Both sides of any contested result may be documented simultaneously.
- A case file with status `SUPPORTED — SPHERICAL` does not prevent a competing case file from being opened with contradicting evidence.  The record holds both.
