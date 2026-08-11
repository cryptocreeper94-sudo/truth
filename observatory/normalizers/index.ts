/**
 * Observatory — Normalizer Registry and Runner
 *
 * Runs the seismic normalizer against a batch of CatalogEvent records and
 * returns NormalizedSeismicEvent records ready for storage.
 *
 * The normalizer runner is stateless — it does not read from or write to
 * the store.  That separation keeps the normalizer testable in isolation.
 */

import type {
  CatalogEvent,
  NormalizedSeismicEvent,
} from "../schema/seismic.js";
import {
  normalizeSeismicEvents,
  assignTectonicSetting,
  buildSeismicMapLayer,
  estimateMagnitudeCompleteness,
  DEFAULT_INDUCED_SEISMICITY_ZONES,
  type NormalizerConfig,
  type InducedSeismicityZone,
} from "./seismic.js";

// Re-export so callers import from this module only
export {
  DEFAULT_INDUCED_SEISMICITY_ZONES,
  assignTectonicSetting,
  buildSeismicMapLayer,
  estimateMagnitudeCompleteness,
};
export type { NormalizerConfig, InducedSeismicityZone };

// ── Run config ────────────────────────────────────────────────────────────────

export interface NormalizerRunConfig extends NormalizerConfig {
  /**
   * Whether to enrich each event with a tectonic setting via the simplified
   * global tectonic map.  Default: true.
   */
  enrichTectonicSetting?: boolean;

  /**
   * Whether to generate a GeoJSON map layer for events above each magnitude
   * threshold.  Default thresholds: [2.5, 4.0, 6.0].
   */
  generateMapLayers?: boolean;
  mapLayerThresholds?: number[];

  /**
   * Window start / end for map layer metadata (ISO 8601 UTC).
   * Required if generateMapLayers is true.
   */
  windowStart?: string;
  windowEnd?: string;
}

// ── Run result ────────────────────────────────────────────────────────────────

export interface NormalizerRunResult {
  /** Normalized events, one per physical earthquake. */
  normalizedEvents: NormalizedSeismicEvent[];

  /** How many catalog reports were merged into normalizedEvents. */
  totalCatalogReports: number;

  /** How many distinct physical events were identified. */
  distinctEventCount: number;

  /** How many events had reports from more than one catalog (cross-validation count). */
  crossValidatedCount: number;

  /** Events tagged as aftershocks. */
  aftershockCount: number;

  /** Events flagged as induced-seismicity candidates. */
  inducedCandidateCount: number;

  /** Magnitude of completeness estimate (null if insufficient data). */
  completenessEstimate: { Mc: number; method: string; sampleSize: number } | null;

  /** GeoJSON map layers keyed by magnitude threshold, e.g. "M2.5+". */
  mapLayers: Record<string, import("../schema/seismic.js").SeismicMapLayer>;

  /** ISO 8601 UTC when normalization ran. */
  normalizedAt: string;
}

// ── Runner ────────────────────────────────────────────────────────────────────

/**
 * Run the seismic normalizer on a batch of catalog events.
 *
 * @param catalogEvents Raw CatalogEvent records from one or more collectors.
 * @param config Optional normalizer configuration.
 * @returns NormalizerRunResult with normalized events and statistics.
 */
export async function runSeismicNormalizer(
  catalogEvents: CatalogEvent[],
  config: NormalizerRunConfig = {}
): Promise<NormalizerRunResult> {
  const normalizedAt = new Date().toISOString();
  const enrichTectonicSetting = config.enrichTectonicSetting ?? true;
  const generateMapLayers = config.generateMapLayers ?? false;
  const mapLayerThresholds = config.mapLayerThresholds ?? [2.5, 4.0, 6.0];

  console.log(
    `[normalizer] Starting normalization of ${catalogEvents.length} catalog reports…`
  );

  // ── Normalize ────────────────────────────────────────────────────────────
  const normalizedEvents = normalizeSeismicEvents(catalogEvents, config);

  console.log(
    `[normalizer] ${catalogEvents.length} reports → ${normalizedEvents.length} distinct events`
  );

  // ── Tectonic enrichment ──────────────────────────────────────────────────
  if (enrichTectonicSetting) {
    let enriched = 0;
    for (const event of normalizedEvents) {
      if (event.tectonicSetting === "unknown") {
        const setting = assignTectonicSetting(event.latitude, event.longitude);
        if (setting !== "unknown") {
          event.tectonicSetting = setting;
          enriched++;
        }
      }
    }
    console.log(`[normalizer] Tectonic setting enriched for ${enriched} events`);
  }

  // ── Statistics ───────────────────────────────────────────────────────────
  const crossValidatedCount = normalizedEvents.filter(
    (e) => e.allReports.length > 1
  ).length;

  const aftershockCount = normalizedEvents.filter(
    (e) => e.sequenceRole === "aftershock"
  ).length;

  const inducedCandidateCount = normalizedEvents.filter(
    (e) => e.inducedSeismicityCandidate
  ).length;

  console.log(`[normalizer] Cross-validated (multi-catalog): ${crossValidatedCount}`);
  console.log(`[normalizer] Aftershocks tagged: ${aftershockCount}`);
  console.log(`[normalizer] Induced-seismicity candidates: ${inducedCandidateCount}`);

  // ── Completeness ─────────────────────────────────────────────────────────
  const completenessEstimate = estimateMagnitudeCompleteness(normalizedEvents);
  if (completenessEstimate) {
    console.log(
      `[normalizer] Magnitude of completeness (${completenessEstimate.method}): ` +
        `Mc=${completenessEstimate.Mc.toFixed(1)} ` +
        `(n=${completenessEstimate.sampleSize})`
    );
  }

  // ── Map layers ───────────────────────────────────────────────────────────
  const mapLayers: Record<string, import("../schema/seismic.js").SeismicMapLayer> = {};

  if (generateMapLayers) {
    const windowStart = config.windowStart ?? normalizedEvents[0]?.originTime ?? normalizedAt;
    const windowEnd = config.windowEnd ?? normalizedAt;

    for (const threshold of mapLayerThresholds) {
      const layerKey = `M${threshold}+`;
      const layer = buildSeismicMapLayer(normalizedEvents, {
        layerId: `observatory-seismic-${layerKey.toLowerCase().replace("+", "plus")}`,
        label: `Earthquakes ${layerKey}`,
        description:
          `Observatory seismic events M≥${threshold} from ${windowStart} to ${windowEnd}. ` +
          `Sources: USGS ComCat and FDSN catalogs. ` +
          `Each event is independently identifiable via its observatoryId.`,
        minimumMagnitude: threshold,
        windowStart,
        windowEnd,
      });
      mapLayers[layerKey] = layer;
      console.log(
        `[normalizer] Map layer ${layerKey}: ${layer.geojson.features.length} features`
      );
    }
  }

  return {
    normalizedEvents,
    totalCatalogReports: catalogEvents.length,
    distinctEventCount: normalizedEvents.length,
    crossValidatedCount,
    aftershockCount,
    inducedCandidateCount,
    completenessEstimate,
    mapLayers,
    normalizedAt,
  };
}
