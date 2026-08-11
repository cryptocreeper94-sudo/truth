/**
 * Observatory — Seismic Schema
 *
 * Canonical TypeScript types for all seismic observations collected by the
 * Observatory.  Every field maps directly to a named concept in the USGS
 * ComCat / FDSN QuakeML vocabulary so future consumers can trace values back
 * to source documentation without reverse-engineering the collector.
 *
 * Design principles:
 *  - Source identifiers are NEVER discarded during normalization.
 *  - Uncertainty is a first-class field, not a footnote.
 *  - "Unknown" is an explicit value, not null.  This keeps downstream filters
 *    deterministic (null ≠ unknown ≠ missing).
 *  - Every record carries retrieval metadata so data gaps are auditable.
 */

// ── Enumerations ─────────────────────────────────────────────────────────────

/** USGS/FDSN review-status vocabulary (QuakeML EventType status). */
export type ReviewStatus =
  | "automatic"   // Processed by automated pipeline, not human-reviewed
  | "reviewed"    // Human analyst has verified the solution
  | "deleted"     // Retracted; record kept for audit trail
  | "unknown";

/** Magnitude scale identifiers used by USGS ComCat and FDSN networks. */
export type MagnitudeType =
  | "Ml"   // Local (Richter) magnitude
  | "Ms"   // Surface-wave magnitude
  | "Mb"   // Body-wave magnitude
  | "Mw"   // Moment magnitude (preferred for M≥3.5)
  | "Mww"  // W-phase moment magnitude
  | "Mwb"  // Body-wave moment magnitude
  | "Mwc"  // Centroid moment magnitude
  | "Mwr"  // Regional moment magnitude
  | "Md"   // Duration magnitude
  | "Mi"   // Integrated magnitude
  | "Mc"   // Coda magnitude
  | "MLg"  // Lg-wave magnitude
  | "Me"   // Energy magnitude
  | "unknown";

/** Tectonic setting codes for contextual classification. */
export type TectonicSetting =
  | "subduction_zone"
  | "transform_fault"
  | "normal_fault"
  | "reverse_fault"
  | "intraplate"
  | "volcanic"
  | "induced"          // Human-induced seismicity
  | "unknown";

/** Data-gap severity used in completeness records. */
export type GapSeverity = "none" | "minor" | "major" | "critical";

/** Aftershock sequence classification. */
export type SequenceRole = "mainshock" | "foreshock" | "aftershock" | "swarm_member" | "unknown";

// ── Core seismic event ───────────────────────────────────────────────────────

/**
 * A single earthquake or seismic event as reported by one catalog.
 * Multiple CatalogEvent records for the same physical event are linked via
 * NormalizedSeismicEvent.sourceIds.
 */
export interface CatalogEvent {
  /** Unique ID within this catalog, e.g. "us7000n2sc" (USGS) or "20240101_0000001" (ISC). */
  catalogEventId: string;

  /** Short catalog code, e.g. "usgs", "isc", "emsc", "ingv". */
  catalog: string;

  /**
   * Network source codes as reported in QuakeML <author> or FDSN network code.
   * USGS ComCat uses agency codes like "us", "ak", "nc", "ci".
   */
  networkCodes: string[];

  /** ISO 8601 UTC origin time.  Millisecond precision preserved from source. */
  originTime: string;

  /** Origin-time uncertainty in seconds (one standard deviation). */
  originTimeUncertaintySeconds: number | null;

  // ── Hypocenter ────────────────────────────────────────────────────────────

  /** Epicentre latitude in decimal degrees WGS84, south is negative. */
  latitude: number;

  /** Epicentre longitude in decimal degrees WGS84, west is negative. */
  longitude: number;

  /** Depth in kilometres below the surface.  Negative values are invalid. */
  depthKm: number | null;

  /** Depth uncertainty in kilometres (one standard deviation). */
  depthUncertaintyKm: number | null;

  /**
   * Whether the depth was fixed (e.g. fixed at 10 km for shallow events where
   * depth is unconstrained).  Fixed depths inflate uncertainty artificially.
   */
  depthFixed: boolean;

  /** Horizontal location uncertainty (95 % confidence ellipse semi-major axis, km). */
  horizontalUncertaintyKm: number | null;

  // ── Magnitude ─────────────────────────────────────────────────────────────

  /** Preferred magnitude value. */
  magnitude: number | null;

  /** Magnitude uncertainty (one standard deviation). */
  magnitudeUncertainty: number | null;

  /** Magnitude scale identifier. */
  magnitudeType: MagnitudeType;

  /** Network that computed the preferred magnitude. */
  magnitudeAuthor: string | null;

  // ── Quality metrics ───────────────────────────────────────────────────────

  /** Number of seismic phases (P + S arrivals) used in the location solution. */
  phaseCount: number | null;

  /** Number of reporting stations used in the location. */
  stationCount: number | null;

  /** Azimuthal gap (degrees) — largest angular gap in the station azimuth distribution. */
  azimuthalGapDegrees: number | null;

  /** Minimum epicentral distance to any reporting station (km). */
  minimumStationDistanceKm: number | null;

  /** Root-mean-square of residuals to arrival-time picks (seconds). */
  rmsResidualSeconds: number | null;

  /** Catalog quality code where defined, e.g. USGS "A"–"D". */
  qualityCode: string | null;

  // ── Classification ────────────────────────────────────────────────────────

  /** FDSN/USGS event type string, e.g. "earthquake", "quarry blast", "nuclear explosion". */
  eventType: string | null;

  /** Review status at time of retrieval. */
  reviewStatus: ReviewStatus;

  /** Named region from the catalog, e.g. "Northern California". */
  regionName: string | null;

  /** Felt-report count (USGS "felt" parameter, if available). */
  feltReportCount: number | null;

  /** USGS alert level for impact estimation ("green", "yellow", "orange", "red"). */
  alertLevel: string | null;

  /** Significance score (0–1000, USGS-specific). */
  significance: number | null;

  // ── Provenance ────────────────────────────────────────────────────────────

  /** ISO 8601 UTC timestamp when this event was retrieved from the catalog. */
  retrievedAt: string;

  /** URL of the source record or feed used to retrieve this event. */
  sourceUrl: string;

  /**
   * SHA-256 of the raw source JSON/XML payload.  Allows the raw record to be
   * reconstructed from archive even if the catalog later updates the event.
   */
  rawPayloadHash: string | null;

  /**
   * Verbatim source record preserved for full traceability.
   * Stored as-is; the normalizer operates on a copy of this field.
   */
  rawPayload: Record<string, unknown>;
}

// ── Normalized / reconciled event ────────────────────────────────────────────

/**
 * A single physical seismic event that may have been reported by multiple
 * catalogs.  Normalization selects a preferred solution and retains all
 * original identifiers so nothing is silently discarded.
 */
export interface NormalizedSeismicEvent {
  /**
   * Stable Observatory identifier.  Format: "obs-eq-<YYYY>-<catalog>-<catalogEventId>".
   * The <catalog>-<catalogEventId> portion is from the *preferred* source.
   */
  observatoryId: string;

  /**
   * All (catalog, catalogEventId) pairs for this physical event.
   * Allows downstream systems to cross-reference against any catalog.
   */
  sourceIds: Array<{ catalog: string; catalogEventId: string }>;

  /** Preferred catalog for the primary solution.  Typically "usgs" or "isc". */
  preferredCatalog: string;

  /** Preferred origin time (ISO 8601 UTC). */
  originTime: string;

  /** Preferred hypocenter. */
  latitude: number;
  longitude: number;
  depthKm: number | null;

  /** Preferred magnitude. */
  magnitude: number | null;
  magnitudeType: MagnitudeType;

  /** Review status from the preferred solution. */
  reviewStatus: ReviewStatus;

  /** Tectonic classification (may be enriched post-collection). */
  tectonicSetting: TectonicSetting;

  /** Aftershock/foreshock/mainshock role within a detected sequence. */
  sequenceRole: SequenceRole;

  /**
   * observatoryId of the parent mainshock if this event is classified as an
   * aftershock or foreshock, null otherwise.
   */
  parentEventId: string | null;

  /**
   * True if this event falls within a region or time window associated with
   * known induced seismicity (injection wells, reservoir impoundment, mining).
   * This is an alternative hypothesis marker — it does not assert causation.
   */
  inducedSeismicityCandidate: boolean;

  /**
   * Free-text note summarising the induced-seismicity basis, e.g.
   * "Within 10 km of SWD well API-3700123456 active 2019–2024."
   */
  inducedSeismicityNote: string | null;

  /** Full preferred CatalogEvent record for map / display use. */
  preferredEvent: CatalogEvent;

  /** All CatalogEvent records that were matched to this physical event. */
  allReports: CatalogEvent[];

  /** ISO 8601 UTC when this normalized record was created or last updated. */
  normalizedAt: string;

  /** Version counter incremented each time this record is re-normalized. */
  normalizationVersion: number;
}

// ── Seismic station context ───────────────────────────────────────────────────

/**
 * A seismic monitoring station providing detection capability context.
 * Station records are used to assess detection completeness — not to
 * attribute signals to a specific station without authoritative evidence.
 */
export interface SeismicStation {
  /** FDSN network code, e.g. "IU", "US", "AK". */
  networkCode: string;

  /** Station code within the network, e.g. "ANMO". */
  stationCode: string;

  /** Full station name as reported by the data centre. */
  stationName: string | null;

  latitude: number;
  longitude: number;

  /** Elevation in metres above sea level. */
  elevationMetres: number | null;

  /** ISO 8601 UTC date when the station was deployed. */
  startTime: string | null;

  /** ISO 8601 UTC date when the station was decommissioned, null if still active. */
  endTime: string | null;

  /** Whether the station was reporting during the most recent retrieval window. */
  operationalAtRetrieval: boolean;

  /** Instrument types installed, e.g. ["broadband", "strong-motion"]. */
  instrumentTypes: string[];

  /** Source data centre that provided this record, e.g. "IRIS/FDSN", "NCEDC". */
  dataCentre: string;

  /** ISO 8601 UTC when this record was retrieved. */
  retrievedAt: string;
}

// ── Volcano context ───────────────────────────────────────────────────────────

/**
 * Volcano record providing geological context for seismic events.
 * Proximity to a volcano is documented, not used as an explanation.
 */
export interface VolcanoContext {
  /** GVP (Global Volcanism Program) volcano number, e.g. "321060". */
  gvpVolcanoNumber: string | null;

  /** Smithsonian GVP or Vnum identifier if available. */
  smitsonianId: string | null;

  /** Volcano name. */
  name: string;

  latitude: number;
  longitude: number;

  /** Volcano type per GVP taxonomy, e.g. "stratovolcano", "caldera". */
  volcanoType: string | null;

  /** Last known eruption date (ISO 8601, year precision acceptable). */
  lastEruptionDate: string | null;

  /** Current alert level if available from USGS or WOVOdat. */
  alertLevel: string | null;

  /** Source providing this record. */
  source: string;

  retrievedAt: string;
}

// ── Fault context ─────────────────────────────────────────────────────────────

/**
 * A mapped fault or fault zone relevant to seismic interpretation.
 * Proximity to a fault is documented as geological context only.
 */
export interface FaultContext {
  /** Identifier in the source database, e.g. USGS Quaternary Fault ID. */
  sourceId: string;

  /** Fault or fault-zone name. */
  name: string;

  /** Fault type per the source classification, e.g. "strike-slip", "thrust", "normal". */
  faultType: string | null;

  /** Dip direction, e.g. "NE", "SW", null if unknown. */
  dipDirection: string | null;

  /** Slip rate category per USGS classification, e.g. ">5 mm/yr", "<0.2 mm/yr". */
  slipRateCategory: string | null;

  /**
   * Age of most recent documented surface rupture per USGS Quaternary Fault DB.
   * E.g. "Holocene (<11,700 yr)", "Pleistocene (<1.81 Ma)".
   */
  mostRecentRupture: string | null;

  /** Bounding box [minLon, minLat, maxLon, maxLat] WGS84. */
  boundingBox: [number, number, number, number] | null;

  /** GeoJSON LineString or MultiLineString geometry if available. */
  geometry: Record<string, unknown> | null;

  source: string;
  retrievedAt: string;
}

// ── Crustal deformation context ───────────────────────────────────────────────

/**
 * Snapshot of GNSS/InSAR deformation data at a monitoring point.
 * Provides independent geodetic context that can be compared with seismic
 * observations without asserting a causal link.
 */
export interface DeformationObservation {
  /** Station or pixel identifier in the source network. */
  stationId: string;

  /** Source network or product, e.g. "UNAVCO GNSS", "Sentinel-1 InSAR". */
  network: string;

  latitude: number;
  longitude: number;

  /** Observation timestamp (ISO 8601 UTC). */
  observationTime: string;

  /**
   * Velocity components (mm/yr) in east, north, up directions.
   * Null when the component is not estimated by the source product.
   */
  velocityEastMmPerYear: number | null;
  velocityNorthMmPerYear: number | null;
  velocityUpMmPerYear: number | null;

  /** Uncertainties (mm/yr, one standard deviation). */
  velocityEastUncertaintyMmPerYear: number | null;
  velocityNorthUncertaintyMmPerYear: number | null;
  velocityUpUncertaintyMmPerYear: number | null;

  retrievedAt: string;
}

// ── Detection completeness ────────────────────────────────────────────────────

/**
 * A completeness estimate for a geographic region and time window.
 * Documents the minimum magnitude above which the catalog is believed
 * complete, so map displays can show a reliable lower bound.
 */
export interface CompletenessEstimate {
  /** Human-readable region label, e.g. "Northern California", "Oklahoma". */
  regionLabel: string;

  /** Approximate bounding polygon as GeoJSON or bounding box [minLon, minLat, maxLon, maxLat]. */
  boundingBox: [number, number, number, number];

  /** ISO 8601 UTC start of the time window for this estimate. */
  windowStart: string;

  /** ISO 8601 UTC end of the time window for this estimate. */
  windowEnd: string;

  /**
   * Magnitude of completeness (Mc) — the minimum magnitude at which the
   * catalog captures approximately 100 % of events in this region/window.
   */
  magnitudeOfCompleteness: number;

  /** Method used to estimate Mc, e.g. "GFT", "MAXC", "b-value". */
  method: string | null;

  /**
   * Names or types of known data gaps within the window that affected
   * completeness, e.g. "Station XY offline 2024-01-15 – 2024-02-01".
   */
  knownGaps: string[];

  source: string;
  retrievedAt: string;
}

// ── Control-region baseline ───────────────────────────────────────────────────

/**
 * Statistical baseline for a control region — an area with similar tectonic
 * setting used to contextualise event rates in the region of interest.
 * Explicit baselines prevent post-hoc selection of "calm" comparison periods.
 */
export interface ControlRegionBaseline {
  /** Label for this control region, e.g. "Western Kansas (low induced seismicity)". */
  label: string;

  /** Why this region was chosen as a control. */
  rationale: string;

  boundingBox: [number, number, number, number];

  /** ISO 8601 UTC start of the baseline period. */
  baselineStart: string;

  /** ISO 8601 UTC end of the baseline period. */
  baselineEnd: string;

  /** Mean seismicity rate (events/day) above Mc during the baseline period. */
  meanEventRatePerDay: number;

  /** Mc used when computing the rate. */
  magnitudeOfCompleteness: number;

  /** Standard deviation of the daily event rate during the baseline period. */
  rateStdDev: number | null;

  source: string;
  createdAt: string;
}

// ── Data gap record ───────────────────────────────────────────────────────────

/**
 * An explicit record of a collection gap so downstream analysis can
 * distinguish "no events" from "no data".
 */
export interface DataGapRecord {
  /** Short code for the affected catalog, e.g. "usgs". */
  catalog: string;

  /** ISO 8601 UTC start of the gap. */
  gapStart: string;

  /** ISO 8601 UTC end of the gap, null if still ongoing. */
  gapEnd: string | null;

  severity: GapSeverity;

  /** Human-readable cause if known, e.g. "USGS ComCat API maintenance window". */
  cause: string | null;

  /** Whether this gap was detected automatically (feed went silent) or documented externally. */
  detectionMethod: "automatic" | "manual";

  /** ISO 8601 UTC when this gap record was created. */
  recordedAt: string;
}

// ── Map overlay descriptor ────────────────────────────────────────────────────

/**
 * Everything a future map renderer needs to treat seismic events as an
 * independently identifiable overlay layer.  Each event becomes one
 * GeoJSON Feature; this type captures the layer-level metadata.
 */
export interface SeismicMapLayer {
  /** Stable layer identifier for the map renderer, e.g. "observatory-seismic-m2plus". */
  layerId: string;

  /** Human-readable label shown in the map legend. */
  label: string;

  /** Description shown on hover or in an info panel. */
  description: string;

  /** Minimum magnitude threshold for events included in this layer. */
  minimumMagnitude: number;

  /** ISO 8601 UTC time window start for events in this snapshot. */
  windowStart: string;

  /** ISO 8601 UTC time window end for events in this snapshot. */
  windowEnd: string;

  /** GeoJSON FeatureCollection of seismic events. */
  geojson: {
    type: "FeatureCollection";
    features: Array<{
      type: "Feature";
      geometry: {
        type: "Point";
        coordinates: [number, number, number]; // [lon, lat, -depthKm]
      };
      properties: {
        observatoryId: string;
        magnitude: number | null;
        magnitudeType: MagnitudeType;
        originTime: string;
        depthKm: number | null;
        reviewStatus: ReviewStatus;
        tectonicSetting: TectonicSetting;
        sequenceRole: SequenceRole;
        inducedSeismicityCandidate: boolean;
        regionName: string | null;
        catalog: string;
      };
    }>;
  };

  /** ISO 8601 UTC when this layer snapshot was generated. */
  generatedAt: string;
}

// ── Collection run metadata ───────────────────────────────────────────────────

/**
 * Metadata written at the end of each collection run so provenance is
 * traceable at the run level, not just at the event level.
 */
export interface CollectionRunMeta {
  /** ISO 8601 UTC when the collection run started. */
  runStartedAt: string;

  /** ISO 8601 UTC when the collection run finished. */
  runFinishedAt: string;

  /** Collectors that ran during this pass. */
  collectors: string[];

  /** Events retrieved per catalog. */
  eventsRetrieved: Record<string, number>;

  /** Events newly written to the store (not duplicates). */
  eventsNew: number;

  /** Events updated (re-reviewed, magnitude updated, etc.). */
  eventsUpdated: number;

  /** Data gaps detected or extended during this run. */
  gapsRecorded: number;

  /** Errors per collector (empty object = no errors). */
  errors: Record<string, string>;

  /** Observatory software version or git SHA at run time. */
  softwareVersion: string;
}
