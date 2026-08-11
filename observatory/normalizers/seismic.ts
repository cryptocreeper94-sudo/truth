/**
 * Observatory — Seismic Event Normalizer
 *
 * Reconciles earthquake reports from multiple catalogs into a single
 * NormalizedSeismicEvent per physical event.  The normalizer:
 *
 *  1. Groups CatalogEvent records that refer to the same physical earthquake
 *     using spatial + temporal proximity matching.
 *
 *  2. Selects a preferred solution using a catalog priority ordering and a
 *     review-status preference (reviewed > automatic).
 *
 *  3. Retains ALL original identifiers in sourceIds so no source information
 *     is ever silently discarded.
 *
 *  4. Tags events with tectonic setting, aftershock sequence role, and
 *     induced-seismicity candidacy based on spatial context.
 *
 *  5. Generates a stable observatoryId that does not change if a later run
 *     finds additional catalog matches for the same event.
 *
 * What this normalizer does NOT do:
 *  - Interpret or explain the cause of any earthquake
 *  - Assert that proximity to a fault or volcano caused the event
 *  - Remove events because they seem unremarkable
 *  - Discard automatic locations that were later superseded — those are
 *    preserved in allReports
 *
 * Matching algorithm:
 *  Two CatalogEvent records are considered candidates for the same physical
 *  event if they satisfy all three of:
 *   a) |Δt| ≤ TIME_TOLERANCE_SECONDS (default 60 s, relaxed to 120 s for M≥6)
 *   b) Haversine distance ≤ DISTANCE_TOLERANCE_KM (default 50 km)
 *   c) |ΔM| ≤ MAGNITUDE_TOLERANCE (default 1.0, generous to handle Ml vs Mw)
 *
 *  These tolerances are intentionally generous — false merges are better
 *  detected by a human analyst than missed matches that create duplicate
 *  normalized records.
 *
 *  The algorithm is O(n²) which is acceptable for ≤10 000 events per run.
 *  Larger windows should be split into shorter time slices.
 */

import type {
  CatalogEvent,
  NormalizedSeismicEvent,
  MagnitudeType,
  TectonicSetting,
  SequenceRole,
} from "../schema/seismic.js";

// ── Constants ─────────────────────────────────────────────────────────────────

/** Maximum origin-time difference (seconds) to consider two reports the same event. */
const TIME_TOLERANCE_SECONDS = 60;

/** Maximum epicentral distance (km) to consider two reports the same event. */
const DISTANCE_TOLERANCE_KM = 50;

/** Maximum magnitude difference to consider two reports the same event. */
const MAGNITUDE_TOLERANCE = 1.0;

/**
 * Catalog priority order for preferred-solution selection.
 * USGS is preferred because it is the authoritative ANSS contributor and
 * typically has the most rapid updates.  ISC has the most reliable
 * reviewed solutions but lags by months.
 */
const CATALOG_PRIORITY: Record<string, number> = {
  usgs: 1,
  isc: 2,
  ingv: 3,
  geonet: 4,
  emsc: 5,
  bgr: 6,
};

// ── Main normalizer ───────────────────────────────────────────────────────────

export interface NormalizerConfig {
  /**
   * Aftershock window in days.  Events within this window and within
   * AFTERSHOCK_RADIUS_KM of a mainshock candidate are classified as aftershocks.
   * Default: 90 days.
   */
  aftershockWindowDays?: number;

  /**
   * Radius (km) within which an event is classified as a potential aftershock
   * of a nearby larger event.
   * Default: 50 km.
   */
  aftershockRadiusKm?: number;

  /**
   * Minimum magnitude difference between mainshock and aftershock.
   * Following Bath's Law, aftershocks are typically M ≥ mainshock - 1.2.
   * We use 0.5 as a conservative threshold.
   * Default: 0.5
   */
  mainshockMinMagnitudeDelta?: number;

  /**
   * Bounding boxes where induced seismicity is a documented alternative
   * hypothesis.  Events inside these boxes are flagged as candidates.
   *
   * Each entry: { label, boundingBox: [minLon, minLat, maxLon, maxLat], note }
   */
  inducedSeismicityZones?: InducedSeismicityZone[];
}

export interface InducedSeismicityZone {
  label: string;
  boundingBox: [number, number, number, number];
  /** Why this zone is flagged, e.g. "High-density SWD wells, USGS induced list." */
  note: string;
}

/**
 * Default induced-seismicity zones based on the USGS Human-Induced Earthquakes
 * monitoring list (https://earthquake.usgs.gov/research/induced/).
 *
 * These are documentary — they do not assert causation.  Analysts should
 * verify against the USGS catalog before drawing any conclusion.
 */
export const DEFAULT_INDUCED_SEISMICITY_ZONES: InducedSeismicityZone[] = [
  {
    label: "Central Oklahoma (SWD wastewater injection)",
    boundingBox: [-100.0, 34.5, -96.0, 37.5],
    note:
      "High-density saltwater disposal well (SWD) operations 2010–present; " +
      "USGS identified this as the most active induced seismicity zone in the US.",
  },
  {
    label: "Permian Basin, West Texas/New Mexico (oil and gas operations)",
    boundingBox: [-104.5, 29.5, -101.0, 33.5],
    note:
      "Rapid increase in seismicity correlated with Permian Basin oil production " +
      "and high-volume water disposal; USGS 2020–2024 monitoring.",
  },
  {
    label: "Denver Basin / Colorado (Rocky Mountain Arsenal legacy)",
    boundingBox: [-105.5, 39.0, -104.0, 40.5],
    note:
      "Historical induced seismicity from Rocky Mountain Arsenal deep injection " +
      "(1960s); ongoing monitoring for similarity to legacy events.",
  },
  {
    label: "Kansas / Arkansas (SWD operations)",
    boundingBox: [-99.5, 36.0, -93.5, 39.5],
    note:
      "Documented increase in M≥3 seismicity correlated with SWD well operations; " +
      "USGS induced seismicity monitoring region.",
  },
  {
    label: "Fort Worth Basin, North Texas (Barnett Shale)",
    boundingBox: [-98.5, 32.0, -96.5, 34.0],
    note:
      "Seismicity increase coinciding with hydraulic fracturing and SWD operations " +
      "in the Barnett Shale play.",
  },
];

// ── Normalize ─────────────────────────────────────────────────────────────────

/**
 * Normalize a list of CatalogEvent records into NormalizedSeismicEvent records.
 *
 * Events from multiple catalogs are matched and merged.  The function is
 * pure (no side effects) and can be called on any slice of the event catalog.
 */
export function normalizeSeismicEvents(
  catalogEvents: CatalogEvent[],
  config: NormalizerConfig = {}
): NormalizedSeismicEvent[] {
  const normalizedAt = new Date().toISOString();
  const aftershockWindowMs =
    (config.aftershockWindowDays ?? 90) * 24 * 60 * 60 * 1000;
  const aftershockRadiusKm = config.aftershockRadiusKm ?? 50;
  const mainshockDelta = config.mainshockMinMagnitudeDelta ?? 0.5;
  const inducedZones =
    config.inducedSeismicityZones ?? DEFAULT_INDUCED_SEISMICITY_ZONES;

  // ── Step 1: Group events by physical event ────────────────────────────────
  const groups = groupEventsByPhysicalEvent(catalogEvents);

  // ── Step 2: Build normalized records ─────────────────────────────────────
  const normalized: NormalizedSeismicEvent[] = groups.map((group) => {
    const preferred = selectPreferredEvent(group);
    const sourceIds = group.map((e) => ({
      catalog: e.catalog,
      catalogEventId: e.catalogEventId,
    }));

    const observatoryId = buildObservatoryId(preferred);
    const inducedCheck = checkInducedSeismicity(preferred, inducedZones);

    return {
      observatoryId,
      sourceIds,
      preferredCatalog: preferred.catalog,
      originTime: preferred.originTime,
      latitude: preferred.latitude,
      longitude: preferred.longitude,
      depthKm: preferred.depthKm,
      magnitude: preferred.magnitude,
      magnitudeType: preferred.magnitudeType,
      reviewStatus: preferred.reviewStatus,
      tectonicSetting: "unknown" as TectonicSetting, // enriched post-collection
      sequenceRole: "unknown" as SequenceRole,        // enriched in step 3
      parentEventId: null,                            // enriched in step 3
      inducedSeismicityCandidate: inducedCheck.candidate,
      inducedSeismicityNote: inducedCheck.note,
      preferredEvent: preferred,
      allReports: group,
      normalizedAt,
      normalizationVersion: 1,
    };
  });

  // ── Step 3: Tag aftershock sequences ─────────────────────────────────────
  tagAfterShockSequences(normalized, aftershockWindowMs, aftershockRadiusKm, mainshockDelta);

  return normalized;
}

// ── Grouping ──────────────────────────────────────────────────────────────────

/**
 * Cluster CatalogEvent records into groups of reports for the same physical
 * earthquake using a greedy union-find approach.
 */
function groupEventsByPhysicalEvent(events: CatalogEvent[]): CatalogEvent[][] {
  // Sort by origin time to make matching more efficient
  const sorted = [...events].sort(
    (a, b) => new Date(a.originTime).getTime() - new Date(b.originTime).getTime()
  );

  const parent = sorted.map((_, i) => i);

  function find(i: number): number {
    if (parent[i] !== i) parent[i] = find(parent[i]!);
    return parent[i]!;
  }

  function union(i: number, j: number): void {
    const pi = find(i);
    const pj = find(j);
    if (pi !== pj) parent[pi] = pj;
  }

  // Compare each event only against events within a 2-minute window
  for (let i = 0; i < sorted.length; i++) {
    const a = sorted[i]!;
    const tA = new Date(a.originTime).getTime();

    for (let j = i + 1; j < sorted.length; j++) {
      const b = sorted[j]!;
      const tB = new Date(b.originTime).getTime();

      // Break early: events more than TIME_TOLERANCE_SECONDS apart can't match
      if ((tB - tA) / 1000 > TIME_TOLERANCE_SECONDS * 2) break;

      if (areTheSameEvent(a, b)) {
        union(i, j);
      }
    }
  }

  // Collect groups
  const groupMap = new Map<number, CatalogEvent[]>();
  for (let i = 0; i < sorted.length; i++) {
    const root = find(i);
    let group = groupMap.get(root);
    if (!group) {
      group = [];
      groupMap.set(root, group);
    }
    group.push(sorted[i]!);
  }

  return [...groupMap.values()];
}

/**
 * Determine whether two CatalogEvent records likely refer to the same
 * physical earthquake.
 *
 * All three criteria must pass.  Magnitude tolerance is generous (1.0) to
 * handle systematic differences between Ml and Mw scales.
 */
function areTheSameEvent(a: CatalogEvent, b: CatalogEvent): boolean {
  // 1. Time criterion
  const dtSeconds =
    Math.abs(
      new Date(a.originTime).getTime() - new Date(b.originTime).getTime()
    ) / 1000;

  // Relax time tolerance for large events (M≥6) where origin solutions
  // may differ more between networks
  const mag = Math.max(a.magnitude ?? 0, b.magnitude ?? 0);
  const timeTolerance = mag >= 6.0 ? TIME_TOLERANCE_SECONDS * 2 : TIME_TOLERANCE_SECONDS;

  if (dtSeconds > timeTolerance) return false;

  // 2. Distance criterion
  const distKm = haversineKm(a.latitude, a.longitude, b.latitude, b.longitude);
  if (distKm > DISTANCE_TOLERANCE_KM) return false;

  // 3. Magnitude criterion (if both have magnitudes)
  if (
    a.magnitude !== null &&
    b.magnitude !== null &&
    Math.abs(a.magnitude - b.magnitude) > MAGNITUDE_TOLERANCE
  ) {
    return false;
  }

  return true;
}

// ── Preferred solution selection ──────────────────────────────────────────────

/**
 * Select the preferred CatalogEvent from a group of reports for the same event.
 *
 * Priority:
 *  1. Reviewed events beat automatic events
 *  2. Higher catalog priority (USGS > ISC > …)
 *  3. More stations used (higher stationCount)
 *  4. Smaller azimuthal gap (if available)
 */
function selectPreferredEvent(group: CatalogEvent[]): CatalogEvent {
  return group.reduce((best, candidate) => {
    if (!best) return candidate;

    // Review status: reviewed > unknown > automatic > deleted
    const reviewScore = { reviewed: 3, unknown: 2, automatic: 1, deleted: 0 };
    const bScore = reviewScore[best.reviewStatus] ?? 1;
    const cScore = reviewScore[candidate.reviewStatus] ?? 1;
    if (cScore > bScore) return candidate;
    if (bScore > cScore) return best;

    // Catalog priority
    const bPriority = CATALOG_PRIORITY[best.catalog] ?? 99;
    const cPriority = CATALOG_PRIORITY[candidate.catalog] ?? 99;
    if (cPriority < bPriority) return candidate;
    if (bPriority < cPriority) return best;

    // Station count (more = better)
    const bStations = best.stationCount ?? 0;
    const cStations = candidate.stationCount ?? 0;
    if (cStations > bStations) return candidate;
    if (bStations > cStations) return best;

    // Azimuthal gap (smaller = better)
    const bGap = best.azimuthalGapDegrees ?? 360;
    const cGap = candidate.azimuthalGapDegrees ?? 360;
    if (cGap < bGap) return candidate;

    return best;
  });
}

// ── Observatory ID ────────────────────────────────────────────────────────────

/**
 * Build a stable Observatory event ID from the preferred CatalogEvent.
 *
 * Format: obs-eq-<YYYY>-<catalog>-<catalogEventId>
 *
 * The year is derived from origin time so IDs sort chronologically.
 * The catalog+catalogEventId portion is stable as long as the preferred
 * catalog does not change between runs.
 */
function buildObservatoryId(event: CatalogEvent): string {
  const year = new Date(event.originTime).getUTCFullYear();
  const safe = event.catalogEventId.replace(/[^a-zA-Z0-9_-]/g, "_");
  return `obs-eq-${year}-${event.catalog}-${safe}`;
}

// ── Aftershock sequence tagging ───────────────────────────────────────────────

/**
 * Tag normalized events with mainshock / aftershock / foreshock roles.
 *
 * Algorithm: for each event, check whether there is a larger nearby event
 * within the aftershock window.  If yes, the smaller event is an aftershock
 * of the larger.  If the smaller event precedes the larger, it is a foreshock.
 *
 * This is a simplified classification.  Production Observatory analysis
 * should use a proper declustering algorithm (e.g. Reasenberg 1985 or
 * ZMAP's Gardner-Knopoff windowing).
 *
 * This function mutates the normalized array in place (sets sequenceRole and
 * parentEventId) so it must be called after initial construction.
 */
function tagAfterShockSequences(
  events: NormalizedSeismicEvent[],
  aftershockWindowMs: number,
  aftershockRadiusKm: number,
  mainshockDelta: number
): void {
  // Sort by magnitude descending so we process potential mainshocks first
  const byMag = [...events].sort(
    (a, b) => (b.magnitude ?? 0) - (a.magnitude ?? 0)
  );

  // For each event, find potential mainshocks (larger events within the window)
  for (const event of events) {
    if (event.magnitude === null) continue;

    const tEvent = new Date(event.originTime).getTime();

    let bestMainshock: NormalizedSeismicEvent | null = null;
    let bestMagDiff = 0;

    for (const candidate of byMag) {
      if (candidate.observatoryId === event.observatoryId) continue;
      if (candidate.magnitude === null) continue;

      const magDiff = candidate.magnitude - event.magnitude;
      if (magDiff < mainshockDelta) continue; // candidate is not large enough

      const tCandidate = new Date(candidate.originTime).getTime();
      const dt = tEvent - tCandidate; // positive = event is after candidate

      // Must be within the aftershock window (in either direction for foreshocks)
      if (Math.abs(dt) > aftershockWindowMs) continue;

      const distKm = haversineKm(
        event.latitude,
        event.longitude,
        candidate.latitude,
        candidate.longitude
      );
      if (distKm > aftershockRadiusKm) continue;

      // Prefer the highest-magnitude nearby event as the parent
      if (magDiff > bestMagDiff) {
        bestMagDiff = magDiff;
        bestMainshock = candidate;
      }
    }

    if (bestMainshock !== null) {
      const tMainshock = new Date(bestMainshock.originTime).getTime();
      event.parentEventId = bestMainshock.observatoryId;
      event.sequenceRole =
        tEvent < tMainshock ? "foreshock" : "aftershock";
    } else if (event.sequenceRole === "unknown") {
      event.sequenceRole = "mainshock";
    }
  }
}

// ── Induced seismicity candidacy ──────────────────────────────────────────────

/**
 * Check whether an event falls within a known induced-seismicity zone.
 *
 * Returns a candidate flag and a note explaining the basis.
 * This is a documentary flag — it does not assert causation.
 */
function checkInducedSeismicity(
  event: CatalogEvent,
  zones: InducedSeismicityZone[]
): { candidate: boolean; note: string | null } {
  for (const zone of zones) {
    const [minLon, minLat, maxLon, maxLat] = zone.boundingBox;
    if (
      event.longitude >= minLon &&
      event.longitude <= maxLon &&
      event.latitude >= minLat &&
      event.latitude <= maxLat
    ) {
      return {
        candidate: true,
        note: `Within "${zone.label}": ${zone.note}`,
      };
    }
  }
  return { candidate: false, note: null };
}

// ── Tectonic setting enrichment ───────────────────────────────────────────────

/**
 * Assign a tectonic setting to a normalized event based on its location
 * relative to known plate boundary types.
 *
 * This is a first-pass approximation using a simplified global tectonic map.
 * A production Observatory should use USGS GSHAP or SLAB2 for subduction
 * geometry and NUVEL-1A plate boundary files for transform faults.
 *
 * The function returns "unknown" for events outside the predefined regions
 * rather than guessing.
 */
export function assignTectonicSetting(
  latitude: number,
  longitude: number
): TectonicSetting {
  // Simplified global tectonic regions (bounding boxes only — real
  // implementation should use polygon containment)
  const regions: Array<{ bbox: [number, number, number, number]; setting: TectonicSetting }> = [
    // Cascadia subduction zone
    { bbox: [-130, 40, -121, 50], setting: "subduction_zone" },
    // Alaska / Aleutian subduction
    { bbox: [-180, 50, -130, 72], setting: "subduction_zone" },
    // Pacific Ring of Fire — Japan
    { bbox: [130, 30, 145, 46], setting: "subduction_zone" },
    // Pacific Ring of Fire — Andes
    { bbox: [-80, -55, -65, 0], setting: "subduction_zone" },
    // San Andreas transform system
    { bbox: [-122, 32, -115, 40], setting: "transform_fault" },
    // North Anatolian transform
    { bbox: [25, 38, 45, 42], setting: "transform_fault" },
    // Dead Sea transform
    { bbox: [35, 28, 37, 37], setting: "transform_fault" },
    // Mid-ocean ridge (mid-Atlantic)
    { bbox: [-30, -55, -15, 65], setting: "normal_fault" },
    // Basin and Range (extensional)
    { bbox: [-120, 31, -105, 42], setting: "normal_fault" },
    // Oklahoma / Kansas (induced candidate zone)
    { bbox: [-100, 34.5, -96, 37.5], setting: "induced" },
    // Permian Basin
    { bbox: [-104.5, 29.5, -101, 33.5], setting: "induced" },
  ];

  for (const { bbox, setting } of regions) {
    const [minLon, minLat, maxLon, maxLat] = bbox;
    if (
      longitude >= minLon &&
      longitude <= maxLon &&
      latitude >= minLat &&
      latitude <= maxLat
    ) {
      return setting;
    }
  }

  return "unknown";
}

// ── Map layer generator ───────────────────────────────────────────────────────

/**
 * Convert normalized seismic events into a GeoJSON FeatureCollection suitable
 * for map overlay display.
 *
 * Each event becomes a GeoJSON Point Feature at [lon, lat, -depthKm].
 * The negative depth convention (positive = above surface, negative = below)
 * is standard for 3D geospatial rendering.
 */
export function buildSeismicMapLayer(
  events: NormalizedSeismicEvent[],
  layerConfig: {
    layerId: string;
    label: string;
    description: string;
    minimumMagnitude: number;
    windowStart: string;
    windowEnd: string;
  }
): import("../schema/seismic.js").SeismicMapLayer {
  const filtered = events.filter(
    (e) => (e.magnitude ?? 0) >= layerConfig.minimumMagnitude
  );

  return {
    ...layerConfig,
    geojson: {
      type: "FeatureCollection",
      features: filtered.map((event) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [
            event.longitude,
            event.latitude,
            event.depthKm !== null ? -event.depthKm : 0,
          ],
        },
        properties: {
          observatoryId: event.observatoryId,
          magnitude: event.magnitude,
          magnitudeType: event.magnitudeType,
          originTime: event.originTime,
          depthKm: event.depthKm,
          reviewStatus: event.reviewStatus,
          tectonicSetting: event.tectonicSetting,
          sequenceRole: event.sequenceRole,
          inducedSeismicityCandidate: event.inducedSeismicityCandidate,
          regionName: event.preferredEvent.regionName,
          catalog: event.preferredCatalog,
        },
      })),
    },
    generatedAt: new Date().toISOString(),
  };
}

// ── Utilities ─────────────────────────────────────────────────────────────────

/**
 * Haversine great-circle distance in kilometres.
 */
export function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's mean radius km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Compute detection completeness statistics for a set of normalized events.
 *
 * Uses the Gutenberg-Richter maximum curvature method (MAXC) as a first
 * estimate of the magnitude of completeness (Mc).  This is a rough estimate;
 * a production Observatory should use the Goodness-of-Fit Test (GFT) or
 * b-value stability (MBS) method.
 *
 * Returns null if there are fewer than 10 events (insufficient sample).
 */
export function estimateMagnitudeCompleteness(
  events: NormalizedSeismicEvent[]
): { Mc: number; method: string; sampleSize: number } | null {
  const magnitudes = events
    .map((e) => e.magnitude)
    .filter((m): m is number => m !== null)
    .sort((a, b) => a - b);

  if (magnitudes.length < 10) return null;

  // Build frequency-magnitude distribution in 0.1 magnitude bins
  const binWidth = 0.1;
  const minMag = Math.floor(magnitudes[0]! * 10) / 10;
  const maxMag = Math.ceil(magnitudes[magnitudes.length - 1]! * 10) / 10;

  const bins: number[] = [];
  const binMags: number[] = [];

  for (let m = minMag; m <= maxMag + 0.001; m = Math.round((m + binWidth) * 100) / 100) {
    const count = magnitudes.filter(
      (mag) => mag >= m && mag < m + binWidth
    ).length;
    bins.push(count);
    binMags.push(m);
  }

  // MAXC: Mc is at the peak of the frequency-magnitude distribution
  const maxCount = Math.max(...bins);
  const maxIndex = bins.indexOf(maxCount);
  const Mc = binMags[maxIndex] ?? magnitudes[0]!;

  return { Mc, method: "MAXC", sampleSize: magnitudes.length };
}
