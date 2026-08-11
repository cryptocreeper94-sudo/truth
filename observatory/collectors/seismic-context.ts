/**
 * Observatory — Seismic Context Collector
 *
 * Collects public reference data that provides geological context for seismic
 * events.  This data is NOT used to explain or attribute earthquakes — it is
 * collected so that proximity relationships can be documented explicitly,
 * with the source and retrieval date preserved, rather than asserted from
 * memory or omitted entirely.
 *
 * Sources and confirmed working endpoints:
 *
 *  Seismic stations:
 *    FDSN Station WS — https://service.iris.edu/fdsnws/station/1/
 *    Format: pipe-delimited text, level=station
 *
 *  Volcanoes:
 *    USGS Volcano Hazards Program (VHP) HANS API
 *    Endpoint: https://volcanoes.usgs.gov/hans-public/api/vhp/activity
 *    Note: The /vhp/status route has been removed from the VHP API.
 *    If the API returns an error object rather than an array, the collector
 *    throws so a DataGapRecord is written instead of silently returning zero
 *    volcanoes.
 *
 *  Faults:
 *    USGS Mineral Resources Data System (mrdata) WFS
 *    Endpoint: https://mrdata.usgs.gov/wfs/qfaults
 *    Service: OGC WFS 1.1.0, GML output parsed to FaultContext records
 *    Note: The deprecated earthquake.usgs.gov/hazards/qfaults/ws/faults
 *    endpoint returns 404 and must not be used.
 *
 *  Deformation:
 *    EarthScope PBO GNSS velocity solution
 *    https://data.unavco.org/archive/gnss/products/velocity/pbo.final_nam14.vel
 *
 * Design note: context collectors run on a slower schedule (daily/weekly)
 * because the underlying datasets change infrequently.  The faster event
 * collectors retrieve new earthquakes on a cadence of minutes to hours.
 */

import crypto from "node:crypto";
import type {
  SeismicStation,
  VolcanoContext,
  FaultContext,
  DeformationObservation,
} from "../schema/seismic.js";

// ── Station collector ─────────────────────────────────────────────────────────

export interface StationCollectorConfig {
  /**
   * FDSN station WS base URL.  Defaults to IRIS/EarthScope.
   */
  baseUrl?: string;

  /** Network codes to retrieve, e.g. ["IU", "US", "AK"].  Null = all networks. */
  networks?: string[] | null;

  /** Bounding box [minLon, minLat, maxLon, maxLat] or null for global. */
  boundingBox?: [number, number, number, number] | null;

  fetchTimeoutMs?: number;
}

/**
 * Retrieve seismic station metadata from an FDSN Station web service.
 *
 * Returns station-level records only (not channel-level) to keep the
 * payload manageable.
 */
export async function collectSeismicStations(
  config: StationCollectorConfig = {}
): Promise<{ stations: SeismicStation[]; queryUrl: string; retrievedAt: string }> {
  const retrievedAt = new Date().toISOString();
  const baseUrl =
    config.baseUrl ?? "https://service.iris.edu/fdsnws/station/1";

  const params = new URLSearchParams({
    format: "text",
    level: "station",
    nodata: "404",
  });

  if (config.networks?.length) {
    params.set("network", config.networks.join(","));
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
  const timeoutId = setTimeout(
    () => controller.abort(),
    config.fetchTimeoutMs ?? 30_000
  );

  let rawText: string;
  try {
    const response = await fetch(queryUrl, { signal: controller.signal });

    if (response.status === 404) {
      // FDSN returns 404 when no stations match the filter — not an error.
      return { stations: [], queryUrl, retrievedAt };
    }

    if (!response.ok) {
      const body = await response.text().catch(() => "(no body)");
      throw new Error(
        `FDSN Station WS returned HTTP ${response.status}: ${body.slice(0, 200)}`
      );
    }

    rawText = await response.text();
  } finally {
    clearTimeout(timeoutId);
  }

  const stations = parseFdsnStationText(rawText, queryUrl, retrievedAt);
  return { stations, queryUrl, retrievedAt };
}

/**
 * Parse FDSN Station text format (pipe-delimited, station level).
 *
 * Columns: Network | Station | Latitude | Longitude | Elevation | SiteName | StartTime | EndTime
 */
function parseFdsnStationText(
  raw: string,
  queryUrl: string,
  retrievedAt: string
): SeismicStation[] {
  const lines = raw.split("\n").filter((l) => l.trim() && !l.startsWith("#"));
  const stations: SeismicStation[] = [];

  for (const line of lines) {
    const parts = line.split("|");
    if (parts.length < 6) continue;

    const [network, station, latStr, lonStr, elevStr, siteName, startStr, endStr] = parts;

    const lat = parseFloat(latStr ?? "");
    const lon = parseFloat(lonStr ?? "");
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;

    const endTime = endStr?.trim() || null;

    stations.push({
      networkCode: (network ?? "").trim(),
      stationCode: (station ?? "").trim(),
      stationName: siteName?.trim() || null,
      latitude: lat,
      longitude: lon,
      elevationMetres: parseFloat(elevStr ?? "") || null,
      startTime: startStr?.trim() || null,
      endTime: endTime === "" || endTime === "2599-12-31T23:59:59" ? null : endTime,
      operationalAtRetrieval: !endStr?.trim() || endStr.trim() > retrievedAt,
      instrumentTypes: [],
      dataCentre: queryUrl.includes("iris") ? "IRIS/EarthScope" :
                  queryUrl.includes("ncedc") ? "NCEDC" : "FDSN",
      retrievedAt,
    });
  }

  return stations;
}

// ── Volcano collector ─────────────────────────────────────────────────────────

/**
 * Retrieve volcano context records from the NOAA NGDC Significant Volcanic
 * Eruptions database.
 *
 * Endpoint: https://www.ngdc.noaa.gov/hazel/hazard-service/api/v1/volcanoes
 *
 * The NOAA NGDC endpoint returns eruption event records, each of which carries
 * the volcano's location metadata (name, country, lat/lon, elevation, morphology).
 * This collector de-duplicates by `volcanoLocationId` to produce one
 * VolcanoContext record per unique volcano rather than one per eruption event.
 *
 * Notes on endpoint choice:
 *   - USGS VHP HANS API (https://volcanoes.usgs.gov/hans-public/api/) returns
 *     HTTP 200 with {"error":"Did not find vhp/*"} for all currently tested
 *     routes; it is not usable for catalog retrieval as of this implementation.
 *   - Smithsonian GVP API (https://volcano.si.edu/api/) returns HTTP 403.
 *   - NOAA NGDC returns HTTP 200 with structured JSON for the volcanoes route.
 *
 * @throws Error on HTTP failure, non-JSON response, or missing `items` array,
 *   so the caller's Promise.allSettled converts this to a DataGapRecord.
 */
export async function collectVolcanoes(
  fetchTimeoutMs = 45_000
): Promise<{ volcanoes: VolcanoContext[]; retrievedAt: string }> {
  const retrievedAt = new Date().toISOString();

  // Fetch a large set of eruption events and deduplicate to volcano locations.
  // NOAA's database contains ~650 unique volcano locations; maxResults=2000
  // ensures we capture all of them even if events per volcano are many.
  const queryUrl =
    "https://www.ngdc.noaa.gov/hazel/hazard-service/api/v1/volcanoes?maxResults=2000";

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), fetchTimeoutMs);

  let raw: unknown;
  try {
    const response = await fetch(queryUrl, { signal: controller.signal });

    if (!response.ok) {
      const body = await response.text().catch(() => "(no body)");
      throw new Error(
        `NOAA NGDC Volcanoes API returned HTTP ${response.status}: ${body.slice(0, 300)}`
      );
    }

    const text = await response.text();
    try {
      raw = JSON.parse(text) as unknown;
    } catch {
      throw new Error(
        `NOAA NGDC Volcanoes API returned non-JSON response: ${text.slice(0, 300)}`
      );
    }
  } finally {
    clearTimeout(timeoutId);
  }

  // Validate shape — expect { items: [...] }
  if (
    typeof raw !== "object" ||
    raw === null ||
    !("items" in raw) ||
    !Array.isArray((raw as Record<string, unknown>)["items"])
  ) {
    throw new Error(
      `NOAA NGDC Volcanoes API returned unexpected structure: ` +
        `${JSON.stringify(raw).slice(0, 300)}`
    );
  }

  const items = (raw as { items: NoaaVolcanoItem[] }).items;

  if (items.length === 0) {
    throw new Error(
      "NOAA NGDC Volcanoes API returned an empty items array — " +
        "the endpoint may be temporarily unavailable."
    );
  }

  const volcanoes = parseNoaaVolcanoItems(items, retrievedAt);
  return { volcanoes, retrievedAt };
}

interface NoaaVolcanoItem {
  id?: number;
  year?: number;
  month?: number;
  day?: number;
  volcanoLocationId?: number;
  volcanoLocationNewNum?: number;
  volcanoLocationNum?: string;
  name?: string;
  location?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  elevation?: number;
  morphology?: string;
  status?: string;
  [key: string]: unknown;
}

/**
 * Deduplicate NOAA eruption event records by volcanoLocationId to produce one
 * VolcanoContext per unique volcano.  When a volcano appears in multiple
 * eruption events, the most recent event's data is used.
 */
function parseNoaaVolcanoItems(items: NoaaVolcanoItem[], retrievedAt: string): VolcanoContext[] {
  // Group by volcanoLocationId — keep the record with the most-recent year
  const byLocation = new Map<number | string, NoaaVolcanoItem>();

  for (const item of items) {
    const locId = item.volcanoLocationId ?? item.volcanoLocationNum ?? item.name ?? "unknown";
    const existing = byLocation.get(locId);
    if (!existing || (item.year ?? 0) > (existing.year ?? 0)) {
      byLocation.set(locId, item);
    }
  }

  return Array.from(byLocation.values())
    .filter((item) => item.latitude !== undefined && item.longitude !== undefined)
    .map((item) => ({
      gvpVolcanoNumber: item.volcanoLocationNum ?? null,
      smitsonianId: item.volcanoLocationId !== undefined
        ? String(item.volcanoLocationId)
        : null,
      name: item.name ?? "Unknown",
      latitude: item.latitude!,
      longitude: item.longitude!,
      volcanoType: item.morphology ?? null,
      lastEruptionDate:
        item.year !== undefined
          ? `${item.year}${item.month !== undefined ? `-${String(item.month).padStart(2, "0")}` : ""}${item.day !== undefined ? `-${String(item.day).padStart(2, "0")}` : ""}`
          : null,
      alertLevel: null, // NOAA does not provide current alert levels
      source:
        "NOAA NGDC Significant Volcanic Eruptions Database " +
        "(https://www.ngdc.noaa.gov/hazel/hazard-service/api/v1/volcanoes)",
      retrievedAt,
    } satisfies VolcanoContext));
}

// ── Fault collector ───────────────────────────────────────────────────────────

export interface FaultCollectorConfig {
  /**
   * OGC WFS base URL for the USGS Quaternary Fault and Fold Database.
   * The USGS mrdata WFS service (https://mrdata.usgs.gov/wfs/qfaults) is the
   * current public endpoint.  The deprecated endpoint at
   * earthquake.usgs.gov/hazards/qfaults/ws/faults returns 404 and must not
   * be used.
   */
  wfsBaseUrl?: string;

  /** Maximum number of fault features to retrieve.  Default: 500. */
  maxFeatures?: number;

  /** Bounding box [minLon, minLat, maxLon, maxLat] for spatial filter. */
  boundingBox?: [number, number, number, number] | null;

  fetchTimeoutMs?: number;
}

/**
 * Retrieve fault records from the USGS Quaternary Fault and Fold Database
 * via the mrdata OGC WFS service.
 *
 * Endpoint: https://mrdata.usgs.gov/wfs/qfaults
 * Request:  WFS 1.1.0 GetFeature, typeName=qfaults, outputFormat=json
 *
 * The WFS service returns GML by default; a JSON outputFormat is requested
 * where supported.  If the service returns GML (XML), the collector detects
 * this and throws so a DataGapRecord is written.
 *
 * @throws Error on HTTP error, non-OK status, missing or malformed response.
 *   The caller (collectors/index.ts via Promise.allSettled) converts throws
 *   into DataGapRecords so collection failures are explicitly documented.
 */
export async function collectFaults(
  config: FaultCollectorConfig = {}
): Promise<{ faults: FaultContext[]; queryUrl: string; retrievedAt: string }> {
  const retrievedAt = new Date().toISOString();

  const wfsBaseUrl =
    config.wfsBaseUrl ?? "https://mrdata.usgs.gov/wfs/qfaults";
  const maxFeatures = config.maxFeatures ?? 500;

  // Build OGC WFS GetFeature request parameters
  const params = new URLSearchParams({
    service: "WFS",
    version: "1.1.0",
    request: "GetFeature",
    typeName: "qfaults",
    maxFeatures: String(maxFeatures),
    outputFormat: "json",
  });

  // Add spatial (BBOX) filter if bounding box is specified
  if (config.boundingBox) {
    const [minLon, minLat, maxLon, maxLat] = config.boundingBox;
    // OGC WFS BBOX filter format: minX,minY,maxX,maxY,EPSG:4326
    params.set("BBOX", `${minLon},${minLat},${maxLon},${maxLat},EPSG:4326`);
  }

  const queryUrl = `${wfsBaseUrl}?${params.toString()}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    config.fetchTimeoutMs ?? 45_000
  );

  let responseText: string;
  try {
    const response = await fetch(queryUrl, { signal: controller.signal });

    if (!response.ok) {
      const body = await response.text().catch(() => "(no body)");
      throw new Error(
        `USGS QFaults WFS returned HTTP ${response.status}: ${body.slice(0, 300)}`
      );
    }

    responseText = await response.text();
  } finally {
    clearTimeout(timeoutId);
  }

  const trimmed = responseText.trim();

  // Detect HTML error pages — MapServer and other WFS servers return HTML
  // when a configuration error occurs, even with HTTP 200.  An HTML response
  // is not a valid WFS reply; treat it as a collection failure so a
  // DataGapRecord is written instead of silently returning zero faults.
  if (trimmed.toLowerCase().startsWith("<!doctype html") ||
      trimmed.toLowerCase().startsWith("<html")) {
    const title = /<title[^>]*>([^<]*)<\/title>/i.exec(trimmed);
    throw new Error(
      `USGS QFaults WFS returned an HTML error page (HTTP 200 with HTML body). ` +
        `Server message: "${title?.[1]?.trim() ?? "unknown"}". ` +
        `The WFS endpoint may be misconfigured or the layer unavailable.`
    );
  }

  // Detect GML/XML response — WFS may return XML when JSON is not supported
  if (trimmed.startsWith("<") || trimmed.startsWith("<?xml")) {
    return parseWfsGmlResponse(trimmed, queryUrl, retrievedAt);
  }

  // Parse JSON GeoJSON response
  let raw: Record<string, unknown>;
  try {
    raw = JSON.parse(trimmed) as Record<string, unknown>;
  } catch {
    throw new Error(
      `USGS QFaults WFS returned non-JSON, non-XML response: ${trimmed.slice(0, 300)}`
    );
  }

  if (!raw.features || !Array.isArray(raw.features)) {
    throw new Error(
      `USGS QFaults WFS JSON response missing features array: ${trimmed.slice(0, 300)}`
    );
  }

  const faults = parseQFaultsGeoJson(raw, queryUrl, retrievedAt);
  return { faults, queryUrl, retrievedAt };
}

// ── WFS GML (XML) parser ──────────────────────────────────────────────────────

/**
 * Parse a WFS GML response for the USGS QFaults layer.
 *
 * GML responses contain <qfaults:*> elements.  We extract key attributes
 * (fault name, type, slip rate, age) using regex-based extraction since
 * importing a full XML parser would add a dependency.
 *
 * This parser handles the subset of GML returned by mrdata.usgs.gov for
 * the qfaults layer.  It is intentionally conservative — fields that cannot
 * be reliably extracted are set to null rather than silently guessed.
 */
function parseWfsGmlResponse(
  gml: string,
  queryUrl: string,
  retrievedAt: string
): { faults: FaultContext[]; queryUrl: string; retrievedAt: string } {
  const faults: FaultContext[] = [];

  // Extract feature members
  const memberRegex = /<(?:gml:)?featureMember>([\s\S]*?)<\/(?:gml:)?featureMember>/g;
  let match: RegExpExecArray | null;

  while ((match = memberRegex.exec(gml)) !== null) {
    const member = match[1] ?? "";

    const extractTag = (tag: string): string | null => {
      const m = new RegExp(`<[^>]*:${tag}[^>]*>([^<]*)<\/[^>]*:${tag}>`, "i").exec(member);
      return m ? m[1]?.trim() ?? null : null;
    };

    // Try common QFaults field names (vary by WFS version)
    const faultId =
      extractTag("OBJECTID") ??
      extractTag("objectid") ??
      extractTag("FID") ??
      crypto.randomUUID();

    const name =
      extractTag("FaultName") ??
      extractTag("fault_name") ??
      extractTag("name") ??
      "Unnamed fault";

    const faultType =
      extractTag("FaultType") ??
      extractTag("fault_type") ??
      extractTag("type") ??
      null;

    const slipRate =
      extractTag("SlipRate") ??
      extractTag("slip_rate") ??
      null;

    const age =
      extractTag("Age") ??
      extractTag("age") ??
      extractTag("MostRecentDeformation") ??
      null;

    // Extract GML coordinates for bounding box
    let boundingBox: [number, number, number, number] | null = null;
    const envMatch = /<(?:gml:)?Envelope[^>]*>([\s\S]*?)<\/(?:gml:)?Envelope>/.exec(member);
    if (envMatch) {
      const lowerMatch = /<(?:gml:)?lowerCorner>([^<]+)<\//.exec(envMatch[1] ?? "");
      const upperMatch = /<(?:gml:)?upperCorner>([^<]+)<\//.exec(envMatch[1] ?? "");
      if (lowerMatch && upperMatch) {
        const [minLon, minLat] = (lowerMatch[1] ?? "").trim().split(" ").map(Number);
        const [maxLon, maxLat] = (upperMatch[1] ?? "").trim().split(" ").map(Number);
        if (minLon !== undefined && minLat !== undefined &&
            maxLon !== undefined && maxLat !== undefined &&
            [minLon, minLat, maxLon, maxLat].every(Number.isFinite)) {
          boundingBox = [minLon, minLat, maxLon, maxLat];
        }
      }
    }

    faults.push({
      sourceId: String(faultId),
      name,
      faultType,
      dipDirection: null,
      slipRateCategory: slipRate,
      mostRecentRupture: age,
      boundingBox,
      geometry: null, // Full geometry from GML requires dedicated XML parsing
      source: "USGS Quaternary Fault and Fold Database (mrdata WFS)",
      retrievedAt,
    });
  }

  return { faults, queryUrl, retrievedAt };
}

// ── GeoJSON fault parser ──────────────────────────────────────────────────────

interface QFaultProperties {
  fault_id?: string | number;
  FaultName?: string;
  fault_name?: string;
  name?: string;
  FaultType?: string;
  fault_type?: string;
  dip_direction?: string;
  DipDirection?: string;
  SlipRate?: string;
  slip_rate?: string;
  Age?: string;
  age_of_most_recent_deformation?: string;
  [key: string]: unknown;
}

interface QFaultFeature {
  type: "Feature";
  id?: string | number;
  geometry: Record<string, unknown> | null;
  properties: QFaultProperties;
}

function parseQFaultsGeoJson(
  raw: Record<string, unknown>,
  queryUrl: string,
  retrievedAt: string
): FaultContext[] {
  const features = (raw.features ?? []) as QFaultFeature[];

  return features.map((feature) => {
    const p = feature.properties;
    const geom = feature.geometry;

    let boundingBox: [number, number, number, number] | null = null;
    if (geom?.type === "MultiLineString" || geom?.type === "LineString") {
      const coords = flattenCoords(geom as { type: string; coordinates: unknown });
      if (coords.length > 0) {
        boundingBox = [
          Math.min(...coords.map((c) => c[0])),
          Math.min(...coords.map((c) => c[1])),
          Math.max(...coords.map((c) => c[0])),
          Math.max(...coords.map((c) => c[1])),
        ];
      }
    }

    return {
      sourceId: String(p.fault_id ?? feature.id ?? crypto.randomUUID()),
      name: p.FaultName ?? p.fault_name ?? p.name ?? "Unnamed fault",
      faultType: p.FaultType ?? p.fault_type ?? null,
      dipDirection: p.DipDirection ?? p.dip_direction ?? null,
      slipRateCategory: p.SlipRate ?? p.slip_rate ?? null,
      mostRecentRupture: p.Age ?? p.age_of_most_recent_deformation ?? null,
      boundingBox,
      geometry: geom,
      source: "USGS Quaternary Fault and Fold Database",
      retrievedAt,
    } satisfies FaultContext;
  });
}

function flattenCoords(
  geom: { type: string; coordinates: unknown }
): [number, number][] {
  if (geom.type === "LineString") {
    return (geom.coordinates as [number, number][]) ?? [];
  }
  if (geom.type === "MultiLineString") {
    return ((geom.coordinates as [number, number][][]) ?? []).flat();
  }
  return [];
}

// ── Deformation collector ─────────────────────────────────────────────────────

/**
 * Retrieve GNSS velocity observations from the EarthScope (UNAVCO) Plate
 * Boundary Observatory (PBO) network public data.
 *
 * The PBO velocity solution is published as a public space-delimited file.
 * We parse station ID, location, velocity components, and uncertainties.
 *
 * Data URL (ITRF2014 solution):
 *   https://data.unavco.org/archive/gnss/products/velocity/pbo.final_nam14.vel
 */
export async function collectGnssVelocities(
  fetchTimeoutMs = 60_000
): Promise<{ observations: DeformationObservation[]; retrievedAt: string }> {
  const retrievedAt = new Date().toISOString();
  const dataUrl =
    "https://data.unavco.org/archive/gnss/products/velocity/pbo.final_nam14.vel";

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), fetchTimeoutMs);

  let rawText: string;
  try {
    const response = await fetch(dataUrl, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(
        `EarthScope PBO velocity file returned HTTP ${response.status}`
      );
    }
    rawText = await response.text();
  } finally {
    clearTimeout(timeoutId);
  }

  const observations = parsePboVelocityFile(rawText, retrievedAt);
  return { observations, retrievedAt };
}

/**
 * Parse a UNAVCO/EarthScope PBO .vel velocity solution file.
 *
 * Space-delimited; comment lines start with "*".
 * Header line starts with "Sta".
 * Relevant columns: Sta, Ref_Lat, Ref_Lon, dN, dE, dU, Sn, Se, Su
 * (velocities and sigmas in mm/yr).
 */
function parsePboVelocityFile(
  raw: string,
  retrievedAt: string
): DeformationObservation[] {
  const lines = raw
    .split("\n")
    .filter((l) => l.trim() && !l.trim().startsWith("*") && !l.trim().startsWith("#"));

  const observations: DeformationObservation[] = [];
  let headerParsed = false;
  let colIndices: Record<string, number> = {};

  for (const line of lines) {
    const tokens = line.trim().split(/\s+/);

    if (!headerParsed && tokens[0] === "Sta") {
      headerParsed = true;
      colIndices = Object.fromEntries(tokens.map((t, i) => [t, i]));
      continue;
    }

    if (!headerParsed) continue;
    if (tokens.length < 8) continue;

    const get = (col: string): string | undefined => tokens[colIndices[col]];

    const lat = parseFloat(get("Ref_Lat") ?? "");
    const lon = parseFloat(get("Ref_Lon") ?? "");
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;

    observations.push({
      stationId: get("Sta") ?? "unknown",
      network: "EarthScope PBO (UNAVCO)",
      latitude: lat,
      longitude: lon,
      observationTime: retrievedAt,
      velocityNorthMmPerYear: parseFloatOrNull(get("dN")),
      velocityEastMmPerYear: parseFloatOrNull(get("dE")),
      velocityUpMmPerYear: parseFloatOrNull(get("dU")),
      velocityNorthUncertaintyMmPerYear: parseFloatOrNull(get("Sn")),
      velocityEastUncertaintyMmPerYear: parseFloatOrNull(get("Se")),
      velocityUpUncertaintyMmPerYear: parseFloatOrNull(get("Su")),
      retrievedAt,
    });
  }

  return observations;
}

function parseFloatOrNull(value: string | undefined): number | null {
  if (value === undefined || value === null || value === "") return null;
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : null;
}

// Suppress unused import warning — crypto is used in fault ID generation
void crypto;
