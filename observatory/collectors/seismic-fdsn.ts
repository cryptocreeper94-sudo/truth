/**
 * Observatory — Generic FDSN Earthquake Collector
 *
 * Retrieves earthquake events from FDSN-compliant web services.
 *
 * Supported services and their confirmed output formats:
 *
 *   ISC  (International Seismological Centre)
 *     URL:    https://www.isc.ac.uk/fdsnws/event/1/
 *     Format: text  (ISC explicitly rejects format=geojson; only xml/isf/isf2/text accepted)
 *     Note:   orderby parameter not supported — ISC returns the default time-descending order
 *
 *   EMSC (European-Mediterranean Seismological Centre)
 *     URL:    https://www.seismicportal.eu/fdsnws/event/1/
 *     Format: geojson
 *
 *   INGV (Istituto Nazionale di Geofisica e Vulcanologia)
 *     URL:    https://webservices.ingv.it/fdsnws/event/1/
 *     Format: geojson
 *
 *   GeoNet (New Zealand)
 *     URL:    https://service.geonet.org.nz/fdsnws/event/1/
 *     Format: geojson
 *
 * FDSN text format column specification (pipe-delimited, header starts with #):
 *   EventID | Time | Latitude | Longitude | Depth/km | Author | Catalog |
 *   Contributor | ContributorID | MagType | Magnitude | MagAuthor |
 *   EventLocationName | EventType
 *
 * FDSN event WS specification:
 *   https://www.fdsn.org/webservices/fdsnws-event-1.2.pdf
 */

import crypto from "node:crypto";
import type {
  CatalogEvent,
  MagnitudeType,
  ReviewStatus,
} from "../schema/seismic.js";

// ── Catalog registry ──────────────────────────────────────────────────────────

export interface FdsnCatalogDefinition {
  /** Short code used as CatalogEvent.catalog, e.g. "isc", "emsc". */
  code: string;

  /** Human-readable name. */
  name: string;

  /** Base URL for the FDSN event web service (without trailing slash). */
  baseUrl: string;

  /**
   * Output format to request from this provider.
   * ISC only accepts "text"; most others accept "geojson".
   */
  preferredFormat: "geojson" | "text";

  /**
   * Whether this provider supports the FDSN orderby parameter.
   * ISC does not; requests to ISC must omit orderby entirely.
   */
  supportsOrderBy: boolean;

  /**
   * Preferred magnitude type for this catalog if the API does not specify.
   * Used only as a fallback when magType is absent.
   */
  defaultMagType?: MagnitudeType;

  /**
   * Whether to trust this catalog's depth values without the "fixed" flag.
   * The ISC bulletin assigns depths from carefully reviewed phase associations
   * and is generally more reliable for depth than automated catalogs.
   */
  depthTrusted?: boolean;
}

/**
 * Pre-registered FDSN data centres with confirmed query parameters.
 * Add new entries here; the batch collector picks them up automatically.
 */
export const FDSN_CATALOGS: Record<string, FdsnCatalogDefinition> = {
  isc: {
    code: "isc",
    name: "International Seismological Centre",
    baseUrl: "https://www.isc.ac.uk/fdsnws/event/1",
    // ISC EXPLICITLY rejects format=geojson — returns HTTP 200 with error text
    // "geojson is not valid for format, xml, isf, isf2 or text."
    preferredFormat: "text",
    supportsOrderBy: false,
    defaultMagType: "Mb",
    depthTrusted: true,
  },
  emsc: {
    code: "emsc",
    name: "European-Mediterranean Seismological Centre",
    baseUrl: "https://www.seismicportal.eu/fdsnws/event/1",
    preferredFormat: "geojson",
    supportsOrderBy: true,
    depthTrusted: false,
  },
  ingv: {
    code: "ingv",
    name: "Istituto Nazionale di Geofisica e Vulcanologia",
    baseUrl: "https://webservices.ingv.it/fdsnws/event/1",
    preferredFormat: "geojson",
    supportsOrderBy: true,
    depthTrusted: false,
  },
  geonet: {
    code: "geonet",
    name: "GeoNet (New Zealand)",
    baseUrl: "https://service.geonet.org.nz/fdsnws/event/1",
    preferredFormat: "geojson",
    supportsOrderBy: true,
    depthTrusted: false,
  },
  bgr: {
    code: "bgr",
    name: "Bundesanstalt für Geowissenschaften und Rohstoffe (Germany)",
    baseUrl: "https://eida.bgr.de/fdsnws/event/1",
    preferredFormat: "geojson",
    supportsOrderBy: true,
    depthTrusted: false,
  },
};

// ── Configuration ─────────────────────────────────────────────────────────────

export interface FdsnCollectorConfig {
  /** Which catalog to query (must be a key in FDSN_CATALOGS, or provide baseUrl). */
  catalogCode: string;

  /** Override the base URL from the registry (useful for testing/staging). */
  baseUrlOverride?: string;

  startTime?: string;
  endTime?: string;

  /** Default: 2.5 */
  minimumMagnitude?: number;

  /** Default: 5000 */
  limit?: number;

  boundingBox?: [number, number, number, number] | null;

  orderBy?: "time" | "time-asc";

  fetchTimeoutMs?: number;
}

// ── FDSN GeoJSON response types ───────────────────────────────────────────────

interface FdsnFeatureProperties {
  mag: number | null;
  place: string | null;
  time: number;
  updated: number | null;
  tz: number | null;
  url: string | null;
  detail: string | null;
  felt: number | null;
  alert: string | null;
  status: string;
  tsunami: number | null;
  sig: number | null;
  net: string | null;
  code: string | null;
  ids: string | null;
  sources: string | null;
  types: string | null;
  nst: number | null;
  dmin: number | null;
  rms: number | null;
  gap: number | null;
  magType: string | null;
  type: string | null;
  title: string | null;
  [key: string]: unknown;
}

interface FdsnFeature {
  type: "Feature";
  properties: FdsnFeatureProperties;
  geometry: {
    type: "Point";
    coordinates: [number, number, number];
  };
  id: string;
}

interface FdsnGeoJsonResponse {
  type: "FeatureCollection";
  metadata?: {
    generated?: number;
    url?: string;
    title?: string;
    status?: number;
    api?: string;
    count?: number;
  };
  features: FdsnFeature[];
}

// ── Collector ─────────────────────────────────────────────────────────────────

/**
 * Collect earthquake events from any registered FDSN provider.
 *
 * Routes to GeoJSON or text-format parsers based on the catalog's
 * `preferredFormat` setting.  Omits `orderby` for providers that do not
 * support it (e.g. ISC).
 *
 * @throws Error with descriptive message on HTTP or parse failures, including
 *   when an HTTP-200 response contains an error body (as ISC returns for
 *   unsupported format requests).
 */
export async function collectFdsnEvents(
  config: FdsnCollectorConfig
): Promise<{
  events: CatalogEvent[];
  totalReported: number;
  queryUrl: string;
  retrievedAt: string;
  catalogCode: string;
}> {
  const retrievedAt = new Date().toISOString();

  const catalog =
    FDSN_CATALOGS[config.catalogCode] ??
    ({
      code: config.catalogCode,
      name: config.catalogCode,
      baseUrl: "",
      preferredFormat: "geojson",
      supportsOrderBy: true,
    } as FdsnCatalogDefinition);

  const baseUrl = config.baseUrlOverride ?? catalog.baseUrl;
  if (!baseUrl) {
    throw new Error(
      `Unknown FDSN catalog "${config.catalogCode}" and no baseUrlOverride provided. ` +
        `Known catalogs: ${Object.keys(FDSN_CATALOGS).join(", ")}`
    );
  }

  const endTime = config.endTime ?? new Date().toISOString();
  const startTime =
    config.startTime ??
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const params = new URLSearchParams({
    format: catalog.preferredFormat,
    // Use YYYY-MM-DDTHH:MM:SS (no Z, no sub-seconds) for maximum
    // compatibility across FDSN providers.  ISC explicitly rejects the
    // trailing Z and milliseconds in its time parameters.
    starttime: formatFdsnTime(startTime),
    endtime: formatFdsnTime(endTime),
    minmagnitude: String(config.minimumMagnitude ?? 2.5),
    limit: String(config.limit ?? 5000),
  });

  // Only add orderby if the catalog supports it
  if (catalog.supportsOrderBy) {
    params.set("orderby", config.orderBy ?? "time-asc");
  }

  if (config.boundingBox) {
    const [minLon, minLat, maxLon, maxLat] = config.boundingBox;
    params.set("minlongitude", String(minLon));
    params.set("minlatitude", String(minLat));
    params.set("maxlongitude", String(maxLon));
    params.set("maxlatitude", String(maxLat));
  }

  const queryUrl = `${baseUrl}/query?${params.toString()}`;

  const controller = new AbortController();
  const timeoutMs = config.fetchTimeoutMs ?? 30_000;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let responseText: string;
  try {
    const response = await fetch(queryUrl, { signal: controller.signal });

    if (!response.ok) {
      const body = await response.text().catch(() => "(no body)");
      throw new Error(
        `${catalog.name} returned HTTP ${response.status}: ${body.slice(0, 300)}`
      );
    }

    responseText = await response.text();
  } finally {
    clearTimeout(timeoutId);
  }

  // Route to the appropriate parser
  if (catalog.preferredFormat === "text") {
    return parseFdsnTextResponse(
      responseText,
      catalog,
      queryUrl,
      retrievedAt
    );
  } else {
    return parseFdsnGeoJsonResponse(
      responseText,
      catalog,
      queryUrl,
      retrievedAt
    );
  }
}

// ── Text format parser ────────────────────────────────────────────────────────

/**
 * Parse FDSN text format response (used by ISC and other providers).
 *
 * Column order (pipe-delimited, header line starts with #):
 *   EventID | Time | Latitude | Longitude | Depth/km | Author | Catalog |
 *   Contributor | ContributorID | MagType | Magnitude | MagAuthor |
 *   EventLocationName | EventType
 *
 * Comment lines (starting with #) are skipped after the header is parsed.
 * Empty lines are skipped.
 *
 * @throws Error if the response body contains an error message rather than
 *   pipe-delimited event data.
 */
function parseFdsnTextResponse(
  text: string,
  catalog: FdsnCatalogDefinition,
  queryUrl: string,
  retrievedAt: string
): {
  events: CatalogEvent[];
  totalReported: number;
  queryUrl: string;
  retrievedAt: string;
  catalogCode: string;
} {
  // Detect error responses — FDSN text endpoints may return HTTP 200 with
  // an error body (e.g. ISC returns "Error 400: Bad Request:\n..." for
  // unsupported parameter combinations).
  const trimmed = text.trim();
  if (trimmed.startsWith("Error ") || trimmed.startsWith("error ")) {
    throw new Error(
      `${catalog.name} returned an error body with HTTP 200: ${trimmed.slice(0, 300)}`
    );
  }

  // Parse column headers from the first line starting with #
  const lines = trimmed.split("\n");
  let headerLine: string | undefined;
  let headerCols: string[] = [];
  const dataLines: string[] = [];

  for (const line of lines) {
    const l = line.trim();
    if (!l) continue;
    if (l.startsWith("#")) {
      // Only use the first pipe-delimited header line; later comment lines
      // (like agency descriptions) have no pipes.
      if (!headerLine && l.includes("|")) {
        headerLine = l.replace(/^#\s*/, "");
        headerCols = headerLine.split("|").map((c) => c.trim());
      }
      continue;
    }
    if (l.includes("|")) {
      dataLines.push(l);
    }
  }

  // Column index map (case-insensitive)
  const colIndex = (name: string): number =>
    headerCols.findIndex((h) => h.toLowerCase() === name.toLowerCase());

  const idxEventId = colIndex("EventID");
  const idxTime = colIndex("Time");
  const idxLat = colIndex("Latitude");
  const idxLon = colIndex("Longitude");
  const idxDepth = colIndex("Depth/km");
  const idxAuthor = colIndex("Author");
  const idxMagType = colIndex("MagType");
  const idxMagnitude = colIndex("Magnitude");
  const idxMagAuthor = colIndex("MagAuthor");
  const idxLocation = colIndex("EventLocationName");
  const idxEventType = colIndex("EventType");

  const events: CatalogEvent[] = [];

  for (const line of dataLines) {
    const parts = line.split("|");

    const eventId = parts[idxEventId]?.trim() ?? "";
    const timeStr = parts[idxTime]?.trim() ?? "";
    const latStr = parts[idxLat]?.trim() ?? "";
    const lonStr = parts[idxLon]?.trim() ?? "";

    if (!eventId || !timeStr || !latStr || !lonStr) continue;

    const lat = parseFloat(latStr);
    const lon = parseFloat(lonStr);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;

    const depthKm = parseFloatOrNull(parts[idxDepth]?.trim());
    const magnitude = parseFloatOrNull(parts[idxMagnitude]?.trim());
    const magTypeRaw = parts[idxMagType]?.trim() ?? null;
    const author = parts[idxAuthor]?.trim() ?? catalog.code;
    const magAuthor = parts[idxMagAuthor]?.trim() ?? null;
    const locationName = parts[idxLocation]?.trim() ?? null;
    const eventType = parts[idxEventType]?.trim() ?? null;

    // Store the verbatim parsed record as raw payload — preserves all
    // columns including those not mapped to named fields.
    const rawPayload: Record<string, unknown> = {};
    headerCols.forEach((col, i) => {
      rawPayload[col] = parts[i]?.trim() ?? null;
    });

    const rawHash = crypto
      .createHash("sha256")
      .update(JSON.stringify({ eventId, line }))
      .digest("hex");

    // Parse origin time — ISC format: "2026-08-10T00:27:23.769"
    let originTime: string;
    try {
      originTime = new Date(timeStr).toISOString();
    } catch {
      continue; // Skip unparseable timestamps
    }

    const event: CatalogEvent = {
      catalogEventId: eventId,
      catalog: catalog.code,
      networkCodes: author ? [author] : [catalog.code],
      originTime,
      originTimeUncertaintySeconds: null,

      latitude: lat,
      longitude: lon,
      depthKm,
      depthUncertaintyKm: null,
      depthFixed: false,
      horizontalUncertaintyKm: null,

      magnitude,
      magnitudeUncertainty: null,
      magnitudeType: normalizeMagType(magTypeRaw, catalog.defaultMagType),
      magnitudeAuthor: magAuthor,

      phaseCount: null,
      stationCount: null,
      azimuthalGapDegrees: null,
      minimumStationDistanceKm: null,
      rmsResidualSeconds: null,
      qualityCode: null,

      eventType: eventType ?? "earthquake",
      // ISC text format does not carry a review-status field — ISC bulletin
      // events are reviewed by definition; ISC-NRT (real-time) events are
      // automatic.  Use "unknown" here; downstream analysis should check
      // the Catalog column to distinguish bulletin vs NRT.
      reviewStatus: "unknown",
      regionName: locationName,
      feltReportCount: null,
      alertLevel: null,
      significance: null,

      retrievedAt,
      sourceUrl: queryUrl,
      rawPayloadHash: rawHash,
      rawPayload,
    };

    events.push(event);
  }

  return {
    events,
    totalReported: events.length,
    queryUrl,
    retrievedAt,
    catalogCode: catalog.code,
  };
}

// ── GeoJSON format parser ─────────────────────────────────────────────────────

function parseFdsnGeoJsonResponse(
  text: string,
  catalog: FdsnCatalogDefinition,
  queryUrl: string,
  retrievedAt: string
): {
  events: CatalogEvent[];
  totalReported: number;
  queryUrl: string;
  retrievedAt: string;
  catalogCode: string;
} {
  let raw: FdsnGeoJsonResponse;
  try {
    raw = JSON.parse(text) as FdsnGeoJsonResponse;
  } catch {
    // If the body is not valid JSON it is likely an error message
    throw new Error(
      `${catalog.name} returned non-JSON response: ${text.slice(0, 300)}`
    );
  }

  // Some providers return HTTP 200 with a JSON error object
  if (!("features" in raw) || !Array.isArray(raw.features)) {
    throw new Error(
      `${catalog.name} returned unexpected JSON (missing features array): ${text.slice(0, 300)}`
    );
  }

  const events: CatalogEvent[] = raw.features.map((feature) =>
    parseFdsnGeoJsonFeature(feature, catalog, queryUrl, retrievedAt)
  );

  return {
    events,
    totalReported: raw.metadata?.count ?? events.length,
    queryUrl,
    retrievedAt,
    catalogCode: catalog.code,
  };
}

/**
 * Parse a single FDSN GeoJSON feature into a CatalogEvent.
 *
 * The complete verbatim feature JSON is preserved in rawPayload so the
 * full source record is always available for audit, even if the upstream
 * catalog later updates or retracts the event.
 */
function parseFdsnGeoJsonFeature(
  feature: FdsnFeature,
  catalog: FdsnCatalogDefinition,
  queryUrl: string,
  retrievedAt: string
): CatalogEvent {
  const p = feature.properties;
  const [lon, lat, depthKm] = feature.geometry.coordinates;

  const networkCodes: string[] = [];
  if (p.net) networkCodes.push(p.net);
  if (p.sources) {
    networkCodes.push(...p.sources.split(",").map((s: string) => s.trim()).filter(Boolean));
  }
  const uniqueNetworks = [...new Set(networkCodes)];

  const minimumStationDistanceKm =
    p.dmin !== null && p.dmin !== undefined
      ? Math.round(p.dmin * 111.19 * 100) / 100
      : null;

  // Store the COMPLETE verbatim feature JSON as the raw payload.
  // This includes all fields returned by the provider, not just those mapped
  // to named schema fields.  The rawPayloadHash covers this complete record.
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
    catalog: catalog.code,
    networkCodes: uniqueNetworks,
    originTime: new Date(p.time).toISOString(),
    originTimeUncertaintySeconds: null,

    latitude: lat,
    longitude: lon,
    depthKm: depthKm ?? null,
    depthUncertaintyKm: null,
    depthFixed: false,
    horizontalUncertaintyKm: null,

    magnitude: p.mag,
    magnitudeUncertainty: null,
    magnitudeType: normalizeMagType(p.magType, catalog.defaultMagType),
    magnitudeAuthor: p.net ?? catalog.code,

    phaseCount: null,
    stationCount: p.nst,
    azimuthalGapDegrees: p.gap,
    minimumStationDistanceKm,
    rmsResidualSeconds: p.rms,
    qualityCode: null,

    eventType: p.type,
    reviewStatus: normalizeReviewStatus(p.status),
    regionName: p.place ?? p.title ?? null,
    feltReportCount: p.felt,
    alertLevel: p.alert,
    significance: p.sig,

    retrievedAt,
    sourceUrl: queryUrl,
    rawPayloadHash: rawHash,
    rawPayload,
  };
}

// ── Batch collector ───────────────────────────────────────────────────────────

/**
 * Run collectors for multiple FDSN catalogs and return combined results.
 * Each catalog is queried independently so a failure in one does not abort
 * the others.
 */
export async function collectFromMultipleFdsnCatalogs(
  catalogCodes: string[],
  sharedConfig: Omit<FdsnCollectorConfig, "catalogCode">
): Promise<{
  results: Map<string, CatalogEvent[]>;
  errors: Map<string, string>;
  retrievedAt: string;
}> {
  const retrievedAt = new Date().toISOString();
  const results = new Map<string, CatalogEvent[]>();
  const errors = new Map<string, string>();

  await Promise.all(
    catalogCodes.map(async (code) => {
      try {
        const r = await collectFdsnEvents({ ...sharedConfig, catalogCode: code });
        results.set(code, r.events);
      } catch (err) {
        errors.set(code, err instanceof Error ? err.message : String(err));
        results.set(code, []);
      }
    })
  );

  return { results, errors, retrievedAt };
}

// ── Private helpers ───────────────────────────────────────────────────────────

/**
 * Format an ISO 8601 timestamp for FDSN query parameters.
 *
 * Produces "YYYY-MM-DDTHH:MM:SS" without a trailing Z or sub-second digits.
 * This is the format explicitly documented by ISC and accepted by all other
 * FDSN providers.  The Z suffix is omitted because ISC rejects it; all FDSN
 * times are implicitly UTC.
 */
function formatFdsnTime(isoString: string): string {
  // new Date().toISOString() → "2026-08-09T02:13:40.928Z"
  // We want:                   "2026-08-09T02:13:40"
  return isoString.slice(0, 19);
}

function normalizeMagType(
  raw: string | null | undefined,
  fallback?: MagnitudeType
): MagnitudeType {
  if (!raw) return fallback ?? "unknown";
  const known: MagnitudeType[] = [
    "Ml", "Ms", "Mb", "Mw", "Mww", "Mwb", "Mwc", "Mwr",
    "Md", "Mi", "Mc", "MLg", "Me",
  ];
  return (known.find((m) => m.toLowerCase() === raw.toLowerCase()) ??
    fallback ??
    "unknown") as MagnitudeType;
}

function normalizeReviewStatus(raw: string | null | undefined): ReviewStatus {
  switch (raw?.toLowerCase()) {
    case "automatic":
      return "automatic";
    case "reviewed":
    case "manual":
      return "reviewed";
    case "deleted":
      return "deleted";
    default:
      return "unknown";
  }
}

function parseFloatOrNull(value: string | undefined | null): number | null {
  if (value === undefined || value === null || value === "") return null;
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : null;
}
