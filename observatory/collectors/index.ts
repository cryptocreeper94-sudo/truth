/**
 * Observatory — Collector Registry and Runner
 *
 * Orchestrates all seismic data collectors for a single collection pass.
 * Each collector is independent: a failure in one does not abort the others.
 *
 * Usage (from the CLI in run.ts):
 *   const result = await runSeismicCollectors({ ... });
 *
 * The runner writes a CollectionRunMeta record to the store when finished so
 * every pass is auditable even if no new events were found.
 */

import type {
  CatalogEvent,
  SeismicStation,
  VolcanoContext,
  FaultContext,
  DeformationObservation,
  DataGapRecord,
  CollectionRunMeta,
} from "../schema/seismic.js";
import { collectUsgsEvents, enrichUsgsEventDetail, type UsgsCollectorConfig } from "./seismic-usgs.js";
import {
  collectFdsnEvents,
  collectFromMultipleFdsnCatalogs,
  FDSN_CATALOGS,
  type FdsnCollectorConfig,
} from "./seismic-fdsn.js";
import {
  collectSeismicStations,
  collectVolcanoes,
  collectFaults,
  collectGnssVelocities,
  type StationCollectorConfig,
  type FaultCollectorConfig,
} from "./seismic-context.js";

// ── Run configuration ─────────────────────────────────────────────────────────

export interface SeismicCollectionConfig {
  /**
   * ISO 8601 UTC start time for the event query window.
   * Defaults to 48 hours ago for incremental runs.
   */
  startTime?: string;

  /**
   * ISO 8601 UTC end time for the event query window.
   * Defaults to now.
   */
  endTime?: string;

  /** Minimum magnitude to retrieve from all event catalogs.  Default: 2.5 */
  minimumMagnitude?: number;

  /**
   * Geographic bounding box [minLon, minLat, maxLon, maxLat].
   * Null = global query (may be slow for high-activity periods).
   */
  boundingBox?: [number, number, number, number] | null;

  /**
   * FDSN catalog codes to query in addition to USGS.
   * Defaults to ["isc"] for cross-catalog reconciliation.
   * Set to [] to query USGS only.
   */
  additionalCatalogs?: string[];

  /**
   * Whether to collect station, volcano, and fault context data.
   * Context data changes slowly; run this on a daily / weekly cadence
   * rather than with every event-collection pass.
   * Default: false (context must be explicitly requested).
   */
  collectContext?: boolean;

  /**
   * Station networks to retrieve when collectContext is true.
   * Null = all networks (large download).
   */
  stationNetworks?: string[] | null;

  /**
   * Whether to collect GNSS deformation data.
   * This download is large (several MB); enable for scheduled runs only.
   * Default: false
   */
  collectDeformation?: boolean;

  /**
   * Minimum magnitude for USGS detail-page enrichment.
   * Events at or above this magnitude have origin-time uncertainty,
   * horizontal uncertainty, depth uncertainty, depth-fixed flag, and
   * magnitude uncertainty fetched from the USGS GeoJSON detail page.
   * Default: 4.0.  Set to Infinity to skip enrichment entirely.
   */
  enrichMagnitudeThreshold?: number;

  /** Maximum concurrent detail-page requests during enrichment.  Default: 5. */
  enrichConcurrency?: number;

  /** Per-request HTTP timeout in milliseconds.  Default: 30 000. */
  fetchTimeoutMs?: number;

  /** Observatory software version string embedded in run metadata. */
  softwareVersion?: string;
}

// ── Run result ────────────────────────────────────────────────────────────────

export interface SeismicCollectionResult {
  /** All CatalogEvent records retrieved during this run (across all catalogs). */
  events: CatalogEvent[];

  /** Per-catalog event counts. */
  eventsByCatalog: Record<string, number>;

  /** Station records collected (empty if collectContext was false). */
  stations: SeismicStation[];

  /** Volcano records collected (empty if collectContext was false). */
  volcanoes: VolcanoContext[];

  /** Fault records collected (empty if collectContext was false). */
  faults: FaultContext[];

  /**
   * GNSS velocity observations collected (empty unless collectDeformation was
   * true and the EarthScope PBO endpoint was reachable).
   */
  deformationObservations: DeformationObservation[];

  /** Data gap records detected during this run. */
  gaps: DataGapRecord[];

  /** Per-collector error messages. */
  errors: Record<string, string>;

  /** Run metadata for the store. */
  meta: CollectionRunMeta;
}

// ── Runner ────────────────────────────────────────────────────────────────────

/**
 * Run all configured seismic collectors and return combined results.
 *
 * This function does NOT write to storage — it returns raw results so the
 * caller (run.ts or tests) can decide what to do with them.
 */
export async function runSeismicCollectors(
  config: SeismicCollectionConfig = {}
): Promise<SeismicCollectionResult> {
  const runStartedAt = new Date().toISOString();
  const fetchTimeoutMs = config.fetchTimeoutMs ?? 30_000;

  const endTime = config.endTime ?? new Date().toISOString();
  const startTime =
    config.startTime ??
    new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

  const additionalCatalogs = config.additionalCatalogs ?? ["isc"];
  const allEvents: CatalogEvent[] = [];
  const eventsByCatalog: Record<string, number> = {};
  const errors: Record<string, string> = {};

  const sharedEventConfig = {
    startTime,
    endTime,
    minimumMagnitude: config.minimumMagnitude ?? 2.5,
    boundingBox: config.boundingBox ?? null,
    fetchTimeoutMs,
  };

  // ── USGS ComCat (primary) ─────────────────────────────────────────────────
  console.log(
    `[collector] USGS ComCat: querying ${startTime} → ${endTime}, M≥${sharedEventConfig.minimumMagnitude}`
  );

  try {
    const usgsResult = await collectUsgsEvents(sharedEventConfig as UsgsCollectorConfig);
    // Note: collectUsgsEvents now throws when totalReported > events.length
    // (count mismatch) rather than silently returning a truncated set.
    // That throw is caught below and becomes a DataGapRecord.
    eventsByCatalog["usgs"] = usgsResult.events.length;
    console.log(
      `[collector] USGS ComCat: ${usgsResult.events.length} events`
    );

    // ── Detail-page enrichment for significant events ─────────────────────
    // Fetch origin-time uncertainty, horizontal/depth uncertainty, depth-fixed
    // flag, and magnitude uncertainty from the USGS GeoJSON detail page for
    // events at or above the enrichment threshold.  These fields are not
    // available in the summary feed.
    const enrichThreshold = config.enrichMagnitudeThreshold ?? 4.0;
    const enrichConcurrency = config.enrichConcurrency ?? 5;
    const toEnrich = usgsResult.events.filter(
      (e) => (e.magnitude ?? 0) >= enrichThreshold
    );

    if (toEnrich.length > 0) {
      console.log(
        `[collector] USGS enrichment: fetching detail pages for ${toEnrich.length} M≥${enrichThreshold} events…`
      );

      // Track which events could not be enriched — used to produce a
      // DataGapRecord so the missing uncertainty fields are explicitly
      // documented rather than silently absent.
      const enrichmentFailures: string[] = [];

      // Fetch in bounded concurrent batches to avoid rate-limiting
      for (let i = 0; i < toEnrich.length; i += enrichConcurrency) {
        const batch = toEnrich.slice(i, i + enrichConcurrency);
        await Promise.all(
          batch.map(async (event) => {
            try {
              const detail = await enrichUsgsEventDetail(
                event,
                fetchTimeoutMs
              );
              // Merge enriched uncertainty fields in place — the event object
              // is already in usgsResult.events so the update is visible after push
              event.originTimeUncertaintySeconds =
                detail.originTimeUncertaintySeconds;
              event.horizontalUncertaintyKm = detail.horizontalUncertaintyKm;
              event.depthUncertaintyKm = detail.depthUncertaintyKm;
              event.depthFixed = detail.depthFixed;
              event.magnitudeUncertainty = detail.magnitudeUncertainty;
            } catch {
              enrichmentFailures.push(event.catalogEventId);
            }
          })
        );
      }

      if (enrichmentFailures.length > 0) {
        // Record this as an explicit gap so downstream analysis knows
        // which events are missing uncertainty data.
        errors["usgs-enrichment"] =
          `Detail-page enrichment failed for ${enrichmentFailures.length}` +
          ` of ${toEnrich.length} M≥${enrichThreshold} events.` +
          ` Uncertainty fields (origin time, horizontal, depth, magnitude)` +
          ` are null for: ${enrichmentFailures.slice(0, 20).join(", ")}` +
          `${enrichmentFailures.length > 20 ? ` … and ${enrichmentFailures.length - 20} more` : ""}.`;
        console.warn(
          `[collector] USGS enrichment: ${enrichmentFailures.length} failures recorded as data gap`
        );
      }

      console.log(`[collector] USGS enrichment: complete`);
    }

    allEvents.push(...usgsResult.events);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    errors["usgs"] = message;
    eventsByCatalog["usgs"] = 0;
    console.error(`[collector] USGS ComCat error: ${message}`);
  }

  // ── Additional FDSN catalogs (parallel) ───────────────────────────────────
  if (additionalCatalogs.length > 0) {
    const unknownCatalogs = additionalCatalogs.filter(
      (c) => !(c in FDSN_CATALOGS)
    );
    if (unknownCatalogs.length > 0) {
      console.warn(
        `[collector] Unknown FDSN catalog codes (will be skipped): ${unknownCatalogs.join(", ")}`
      );
    }

    const knownAdditional = additionalCatalogs.filter((c) => c in FDSN_CATALOGS);

    if (knownAdditional.length > 0) {
      console.log(
        `[collector] FDSN catalogs: querying ${knownAdditional.join(", ")}`
      );

      const fdsnResult = await collectFromMultipleFdsnCatalogs(
        knownAdditional,
        sharedEventConfig as Omit<FdsnCollectorConfig, "catalogCode">
      );

      for (const [code, events] of fdsnResult.results.entries()) {
        allEvents.push(...events);
        eventsByCatalog[code] = events.length;
        console.log(`[collector] ${code.toUpperCase()}: ${events.length} events`);
      }

      for (const [code, message] of fdsnResult.errors.entries()) {
        errors[code] = message;
        console.error(`[collector] ${code.toUpperCase()} error: ${message}`);
      }
    }
  }

  // ── Context data (optional) ───────────────────────────────────────────────
  let stations: SeismicStation[] = [];
  let volcanoes: VolcanoContext[] = [];
  let faults: FaultContext[] = [];
  let deformationObservations: DeformationObservation[] = [];

  if (config.collectContext) {
    console.log(
      "[collector] Collecting context data (stations, volcanoes, faults)…"
    );

    const stationConfig: StationCollectorConfig = {
      networks: config.stationNetworks ?? null,
      boundingBox: config.boundingBox ?? null,
      fetchTimeoutMs,
    };

    const faultConfig: FaultCollectorConfig = {
      boundingBox: config.boundingBox ?? null,
      fetchTimeoutMs,
    };

    const [stationResult, volcanoResult, faultResult] = await Promise.allSettled([
      collectSeismicStations(stationConfig),
      collectVolcanoes(fetchTimeoutMs),
      collectFaults(faultConfig),
    ]);

    if (stationResult.status === "fulfilled") {
      stations = stationResult.value.stations;
      console.log(`[collector] Stations: ${stations.length} records`);
    } else {
      errors["stations"] =
        stationResult.reason instanceof Error
          ? stationResult.reason.message
          : String(stationResult.reason);
      console.error(`[collector] Station context error: ${errors["stations"]}`);
    }

    if (volcanoResult.status === "fulfilled") {
      volcanoes = volcanoResult.value.volcanoes;
      console.log(`[collector] Volcanoes: ${volcanoes.length} records`);
    } else {
      errors["volcanoes"] =
        volcanoResult.reason instanceof Error
          ? volcanoResult.reason.message
          : String(volcanoResult.reason);
      console.error(`[collector] Volcano context error: ${errors["volcanoes"]}`);
    }

    if (faultResult.status === "fulfilled") {
      faults = faultResult.value.faults;
      console.log(`[collector] Faults: ${faults.length} records`);
    } else {
      errors["faults"] =
        faultResult.reason instanceof Error
          ? faultResult.reason.message
          : String(faultResult.reason);
      console.error(`[collector] Fault context error: ${errors["faults"]}`);
    }
  }

  // ── GNSS deformation (optional, large download) ───────────────────────────
  if (config.collectDeformation) {
    console.log(
      "[collector] Collecting GNSS deformation data (EarthScope PBO velocity solution)…"
    );
    try {
      const defResult = await collectGnssVelocities(fetchTimeoutMs + 30_000);
      deformationObservations = defResult.observations;
      console.log(
        `[collector] Deformation: ${deformationObservations.length} GNSS station velocities`
      );
    } catch (err) {
      errors["deformation"] =
        err instanceof Error ? err.message : String(err);
      console.error(
        `[collector] Deformation context error: ${errors["deformation"]}`
      );
    }
  }

  // ── Gap detection ──────────────────────────────────────────────────────────
  const gaps: DataGapRecord[] = detectGaps(errors, startTime, endTime);

  const runFinishedAt = new Date().toISOString();

  const meta: CollectionRunMeta = {
    runStartedAt,
    runFinishedAt,
    collectors: [
      "usgs",
      ...additionalCatalogs,
      ...(config.collectContext ? ["stations", "volcanoes", "faults"] : []),
      ...(config.collectDeformation ? ["deformation"] : []),
    ],
    eventsRetrieved: eventsByCatalog,
    eventsNew: 0,    // filled in by the store after dedup
    eventsUpdated: 0, // filled in by the store after dedup
    gapsRecorded: gaps.length,
    errors,
    softwareVersion: config.softwareVersion ?? "dev",
  };

  return {
    events: allEvents,
    eventsByCatalog,
    stations,
    volcanoes,
    faults,
    deformationObservations,
    gaps,
    errors,
    meta,
  };
}

// ── Gap detection ──────────────────────────────────────────────────────────────

/**
 * Produce DataGapRecord entries for any collector that errored.
 *
 * A failed collection is an explicit data gap — downstream analysis must
 * not treat the absence of events during this window as "no seismicity".
 */
function detectGaps(
  errors: Record<string, string>,
  windowStart: string,
  windowEnd: string
): DataGapRecord[] {
  const now = new Date().toISOString();
  return Object.entries(errors).map(([catalog, cause]) => ({
    catalog,
    gapStart: windowStart,
    gapEnd: windowEnd,
    severity: "major" as const,
    cause: `Collector error: ${cause.slice(0, 500)}`,
    detectionMethod: "automatic" as const,
    recordedAt: now,
  }));
}
