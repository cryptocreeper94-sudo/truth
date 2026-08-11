/**
 * Observatory — USGS ComCat / FDSN Earthquake Collector
 *
 * Retrieves earthquake events from the USGS Earthquake Hazards Program via
 * the FDSN-compatible ComCat REST API (https://earthquake.usgs.gov/fdsnws/event/1/).
 *
 * API documentation: https://earthquake.usgs.gov/fdsnws/event/1/
 *
 * Authoritative source: USGS/ANSS (Advanced National Seismic System) Comprehensive
 * Catalog (ComCat), which aggregates contributions from ~30 regional and
 * national networks.
 *
 * What this collector captures:
 *  - All ANSS-contributed events above a configurable minimum magnitude
 *  - Full QuakeML field set: origin time, hypocenter, depth, magnitude type,
 *    uncertainty, phase count, azimuthal gap, review status, alert level,
 *    felt reports, significance score, event type
 *  - Raw GeoJSON payload preserved verbatim for audit
 *
 * What this collector does NOT do:
 *  - Interpret proximity to faults or volcanoes as causation
 *  - Filter out "boring" events — that decision belongs to the normalizer
 *  - Deduplicate across other catalogs — that is the normalizer's job
 */

import crypto from "node:crypto";
import type {
  CatalogEvent,
  MagnitudeType,
  ReviewStatus,
} from "../schema/seismic.js";

// ── Configuration ─────────────────────────────────────────────────────────────

export interface UsgsCollectorConfig {
  /**
   * Start time for the query window (ISO 8601 UTC).
   * Defaults to 30 days ago if not provided.
   */
  startTime?: string;

  /**
   * End time for the query window (ISO 8601 UTC).
   * Defaults to now if not provided.
   */
  endTime?: string;

  /** Minimum magnitude to retrieve (inclusive).  Default: 2.5 */
  minimumMagnitude?: number;

  /**
   * Maximum number of events to return per request.
   * USGS ComCat maximum is 20,000; default here is 5,000.
   */
  limit?: number;

  /**
   * Geographic bounding box [minLon, minLat, maxLon, maxLat] WGS84.
   * When null, the global catalog is queried.
   */
  boundingBox?: [number, number, number, number] | null;

  /**
   * Order results by: "time" (most recent first) or "time-asc" (oldest first).
   * Default: "time-asc" so incremental runs always process events in order.
   */
  orderBy?: "time" | "time-asc";

  /** Optional fetch timeout in milliseconds.  Default: 30 000. */
  fetchTimeoutMs?: number;
}

// ── USGS GeoJSON response types ───────────────────────────────────────────────
// These are the shapes returned by the USGS ComCat GeoJSON feed.
// We preserve them verbatim so rawPayload is always the literal API response.

interface UsgsFeatureProperties {
  mag: number | null;
  place: string | null;
  time: number;           // epoch ms
  updated: number;        // epoch ms
  tz: number | null;      // timezone offset minutes
  url: string;
  detail: string;         // URL to GeoJSON detail page
  felt: number | null;
  cdi: number | null;     // Max Community Internet Intensity
  mmi: number | null;     // Max Modified Mercalli Intensity
  alert: string | null;   // "green" | "yellow" | "orange" | "red"
  status: string;         // "automatic" | "reviewed" | "deleted"
  tsunami: number;        // 0 or 1
  sig: number;            // significance 0–1000
  net: string;            // contributing network code
  code: string;           // event code within the network
  ids: string;            // comma-separated list of contributing IDs
  sources: string;        // comma-separated list of contributing networks
  types: string;          // comma-separated list of available product types
  nst: number | null;     // number of stations used
  dmin: number | null;    // minimum distance to station (degrees)
  rms: number | null;     // RMS of travel-time residuals (s)
  gap: number | null;     // azimuthal gap (degrees)
  magType: string | null;
  type: string | null;    // "earthquake" | "quarry blast" | ...
  title: string;
}

interface UsgsFeature {
  type: "Feature";
  properties: UsgsFeatureProperties;
  geometry: {
    type: "Point";
    coordinates: [number, number, number]; // [lon, lat, depthKm]
  };
  id: string; // e.g. "us7000n2sc"
}

interface UsgsGeoJsonResponse {
  type: "FeatureCollection";
  metadata: {
    generated: number;
    url: string;
    title: string;
    status: number;
    api: string;
    count: number;
  };
  features: UsgsFeature[];
}

// ── Collector implementation ──────────────────────────────────────────────────

const USGS_FDSN_BASE = "https://earthquake.usgs.gov/fdsnws/event/1/query";
const CATALOG_CODE = "usgs";

/**
 * Collect earthquake events from USGS ComCat for the specified time window.
 *
 * Returns CatalogEvent records — one per USGS feature.  All uncertainty fields
 * available in the summary feed are populated; fields requiring detail-page
 * requests (origin-time uncertainty, horizontal uncertainty) are set to null
 * here and may be enriched by a follow-up enricher.
 *
 * @throws Error with descriptive message on HTTP or parse failures.
 */
export async function collectUsgsEvents(
  config: UsgsCollectorConfig = {}
): Promise<{
  events: CatalogEvent[];
  totalReported: number;
  queryUrl: string;
  retrievedAt: string;
}> {
  const retrievedAt = new Date().toISOString();

  // ── Build query parameters ────────────────────────────────────────────────
  const endTime = config.endTime ?? new Date().toISOString();
  const startTime =
    config.startTime ??
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const params = new URLSearchParams({
    format: "geojson",
    starttime: startTime,
    endtime: endTime,
    minmagnitude: String(config.minimumMagnitude ?? 2.5),
    limit: String(config.limit ?? 5000),
    orderby: config.orderBy ?? "time-asc",
  });

  if (config.boundingBox) {
    const [minLon, minLat, maxLon, maxLat] = config.boundingBox;
    params.set("minlongitude", String(minLon));
    params.set("minlatitude", String(minLat));
    params.set("maxlongitude", String(maxLon));
    params.set("maxlatitude", String(maxLat));
  }

  const queryUrl = `${USGS_FDSN_BASE}?${params.toString()}`;

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const controller = new AbortController();
  const timeoutMs = config.fetchTimeoutMs ?? 30_000;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let raw: UsgsGeoJsonResponse;
  try {
    const response = await fetch(queryUrl, { signal: controller.signal });

    if (!response.ok) {
      const body = await response.text().catch(() => "(no body)");
      throw new Error(
        `USGS ComCat returned HTTP ${response.status}: ${body.slice(0, 300)}`
      );
    }

    raw = (await response.json()) as UsgsGeoJsonResponse;
  } finally {
    clearTimeout(timeoutId);
  }

  // ── Parse features ────────────────────────────────────────────────────────
  const events: CatalogEvent[] = raw.features.map((feature) =>
    parseUsgsFeature(feature, queryUrl, retrievedAt)
  );

  const totalReported: number = raw.metadata?.count ?? events.length;

  // Fail explicitly when the server reports more events than were retrieved.
  // Silently using a truncated result would make the collection appear complete
  // while actually omitting events — a provenance violation.  The caller
  // (collectors/index.ts) converts this throw into a DataGapRecord.
  if (totalReported > events.length) {
    throw new Error(
      `USGS ComCat count mismatch: server reported ${totalReported} events but ` +
        `only ${events.length} were retrieved (limit=${config.limit ?? 5000}). ` +
        `Reduce the time window, raise minimumMagnitude, or lower the limit to ` +
        `guarantee a complete result.  Partial result discarded.`
    );
  }

  return {
    events,
    totalReported,
    queryUrl,
    retrievedAt,
  };
}

// ── Detail-page enrichment ────────────────────────────────────────────────────

/**
 * Fetch the GeoJSON detail page for a single event to obtain fields not
 * available in the summary feed: origin-time uncertainty, horizontal
 * uncertainty, and per-magnitude-method details.
 *
 * This is called selectively (e.g. for M≥4.0 events or events near the
 * study region) to avoid hammering the API for every event.
 *
 * Returns a partial CatalogEvent with only the enriched fields populated.
 */
export async function enrichUsgsEventDetail(
  event: CatalogEvent,
  fetchTimeoutMs = 15_000
): Promise<{
  originTimeUncertaintySeconds: number | null;
  horizontalUncertaintyKm: number | null;
  depthUncertaintyKm: number | null;
  depthFixed: boolean;
  magnitudeUncertainty: number | null;
}> {
  // The raw payload now stores the complete feature JSON; the detail URL
  // lives at rawPayload.properties.detail (not rawPayload.detail).
  const props = event.rawPayload["properties"] as Record<string, unknown> | undefined;
  const detailUrl = (props?.["detail"] as string | undefined) ?? null;
  if (!detailUrl) {
    return {
      originTimeUncertaintySeconds: null,
      horizontalUncertaintyKm: null,
      depthUncertaintyKm: null,
      depthFixed: false,
      magnitudeUncertainty: null,
    };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), fetchTimeoutMs);

  try {
    const response = await fetch(detailUrl, { signal: controller.signal });
    if (!response.ok) {
      return {
        originTimeUncertaintySeconds: null,
        horizontalUncertaintyKm: null,
        depthUncertaintyKm: null,
        depthFixed: false,
        magnitudeUncertainty: null,
      };
    }

    // USGS detail GeoJSON has a deeply nested structure; we extract
    // the preferred-origin uncertainty fields from the quakeml product.
    const detail = (await response.json()) as Record<string, unknown>;
    return extractDetailUncertainties(detail);
  } finally {
    clearTimeout(timeoutId);
  }
}

// ── Private helpers ───────────────────────────────────────────────────────────

function parseUsgsFeature(
  feature: UsgsFeature,
  queryUrl: string,
  retrievedAt: string
): CatalogEvent {
  const p = feature.properties;
  const [lon, lat, depthKm] = feature.geometry.coordinates;

  // USGS uses comma-delimited lists for multi-network contributions
  const networkCodes = p.sources
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  // Minimum distance from degrees → km (approximate: 1 degree ≈ 111.19 km)
  const minimumStationDistanceKm =
    p.dmin !== null ? Math.round(p.dmin * 111.19 * 100) / 100 : null;

  // Store the COMPLETE verbatim GeoJSON feature as raw payload — every field
  // from the source response is preserved, including coordinates and all
  // properties, so the original API record can be reconstructed from the
  // hash even if the upstream catalog updates the event.
  const rawPayload: Record<string, unknown> = {
    type: feature.type,
    id: feature.id,
    geometry: feature.geometry as unknown as Record<string, unknown>,
    properties: feature.properties as unknown as Record<string, unknown>,
  };

  const rawHash = crypto
    .createHash("sha256")
    .update(JSON.stringify(rawPayload))
    .digest("hex");

  return {
    catalogEventId: feature.id,
    catalog: CATALOG_CODE,
    networkCodes,
    originTime: new Date(p.time).toISOString(),
    // Summary feed does not expose origin-time uncertainty; enricher fills this
    originTimeUncertaintySeconds: null,

    latitude: lat,
    longitude: lon,
    depthKm: depthKm ?? null,
    depthUncertaintyKm: null,    // requires detail page
    depthFixed: false,            // requires detail page
    horizontalUncertaintyKm: null, // requires detail page

    magnitude: p.mag,
    magnitudeUncertainty: null,  // requires detail page
    magnitudeType: normalizeMagType(p.magType),
    magnitudeAuthor: p.net,

    phaseCount: null,             // not in summary feed
    stationCount: p.nst,
    azimuthalGapDegrees: p.gap,
    minimumStationDistanceKm,
    rmsResidualSeconds: p.rms,
    qualityCode: null,            // USGS uses "status" rather than letter grade

    eventType: p.type,
    reviewStatus: normalizeReviewStatus(p.status),
    regionName: p.place,
    feltReportCount: p.felt,
    alertLevel: p.alert,
    significance: p.sig,

    retrievedAt,
    sourceUrl: queryUrl,
    rawPayloadHash: rawHash,
    rawPayload,
  };
}

function normalizeMagType(raw: string | null | undefined): MagnitudeType {
  if (!raw) return "unknown";
  const known: MagnitudeType[] = [
    "Ml", "Ms", "Mb", "Mw", "Mww", "Mwb", "Mwc", "Mwr",
    "Md", "Mi", "Mc", "MLg", "Me",
  ];
  return (known.find((m) => m.toLowerCase() === raw.toLowerCase()) ??
    "unknown") as MagnitudeType;
}

function normalizeReviewStatus(raw: string | null | undefined): ReviewStatus {
  switch (raw?.toLowerCase()) {
    case "automatic":
      return "automatic";
    case "reviewed":
      return "reviewed";
    case "deleted":
      return "deleted";
    default:
      return "unknown";
  }
}

function extractDetailUncertainties(detail: Record<string, unknown>): {
  originTimeUncertaintySeconds: number | null;
  horizontalUncertaintyKm: number | null;
  depthUncertaintyKm: number | null;
  depthFixed: boolean;
  magnitudeUncertainty: number | null;
} {
  // USGS detail response nests uncertainties under
  // properties.products.origin[0].properties
  try {
    const products = (detail as {
      properties?: { products?: { origin?: Array<{ properties?: Record<string, string> }> } };
    }).properties?.products?.origin;

    if (!products?.length) {
      return {
        originTimeUncertaintySeconds: null,
        horizontalUncertaintyKm: null,
        depthUncertaintyKm: null,
        depthFixed: false,
        magnitudeUncertainty: null,
      };
    }

    const op = products[0].properties ?? {};

    return {
      originTimeUncertaintySeconds: parseFloatOrNull(op["time-error"]),
      horizontalUncertaintyKm: parseFloatOrNull(op["horizontal-error"]),
      depthUncertaintyKm: parseFloatOrNull(op["vertical-error"]),
      depthFixed: op["depth-type"] === "operator assigned" || op["depth-type"] === "constrained",
      magnitudeUncertainty: parseFloatOrNull(op["magnitude-error"]),
    };
  } catch {
    return {
      originTimeUncertaintySeconds: null,
      horizontalUncertaintyKm: null,
      depthUncertaintyKm: null,
      depthFixed: false,
      magnitudeUncertainty: null,
    };
  }
}

function parseFloatOrNull(value: string | undefined): number | null {
  if (value === undefined || value === null || value === "") return null;
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : null;
}
