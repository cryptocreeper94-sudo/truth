#!/usr/bin/env tsx
/**
 * Observatory — Seismic Collection CLI
 *
 * Entry point for running a seismic data collection pass.
 *
 * Usage:
 *   pnpm observatory:seismic               # 48-hour incremental run, M≥2.5
 *   pnpm observatory:seismic --full        # 30-day backfill, M≥2.5
 *   pnpm observatory:seismic --context     # Include station/volcano/fault context
 *   pnpm observatory:seismic --layers      # Generate GeoJSON map layers
 *   pnpm observatory:seismic --help        # Print usage
 *
 * Environment variables:
 *   OBSERVATORY_DATA_DIR   Output directory (default: observatory/data)
 *   OBSERVATORY_MIN_MAG    Minimum magnitude (default: 2.5)
 *   OBSERVATORY_CATALOGS   Comma-separated additional FDSN catalog codes
 *                          (default: "isc"; use "" for USGS only)
 *   OBSERVATORY_BBOX       Bounding box "minLon,minLat,maxLon,maxLat"
 *                          (default: global)
 *   OBSERVATORY_VERSION    Version string embedded in run metadata
 *
 * Exit codes:
 *   0  Success (all collectors ran without fatal errors)
 *   1  Fatal error (collection could not start or store write failed)
 *
 * Non-fatal errors (individual collector failures) do not cause a non-zero
 * exit code — they are recorded as data gaps and reported in the run summary.
 */

import {
  runSeismicCollectors,
  type SeismicCollectionConfig,
} from "./collectors/index.js";
import { runSeismicNormalizer } from "./normalizers/index.js";
import {
  writeCatalogEvents,
  writeNormalizedEvents,
  writeStationContext,
  writeVolcanoContext,
  writeFaultContext,
  writeDeformationContext,
  writeGapRecords,
  writeRunMeta,
  writeMapLayers,
  storeInventory,
} from "./store/index.js";

// ── Argument parsing ──────────────────────────────────────────────────────────

function parseArgs(): {
  full: boolean;
  context: boolean;
  deformation: boolean;
  layers: boolean;
  help: boolean;
  dryRun: boolean;
} {
  const args = process.argv.slice(2);
  return {
    full: args.includes("--full"),
    context: args.includes("--context"),
    deformation: args.includes("--deformation"),
    layers: args.includes("--layers"),
    help: args.includes("--help") || args.includes("-h"),
    dryRun: args.includes("--dry-run"),
  };
}

function printHelp(): void {
  console.log(`
Observatory — Seismic Collection CLI

USAGE
  tsx observatory/run.ts [options]

OPTIONS
  --full          30-day backfill (default: 48-hour incremental)
  --context       Collect station, volcano, and fault context data
  --deformation   Collect GNSS deformation data (large download, ~10 MB)
  --layers        Generate GeoJSON map layers in the store
  --dry-run       Run collectors but do not write to store
  --help          Show this message

ENVIRONMENT
  OBSERVATORY_DATA_DIR   Output directory (default: observatory/data)
  OBSERVATORY_MIN_MAG    Minimum magnitude (default: 2.5)
  OBSERVATORY_CATALOGS   Comma-separated FDSN catalog codes (default: isc)
  OBSERVATORY_BBOX       "minLon,minLat,maxLon,maxLat" (default: global)
  OBSERVATORY_VERSION    Version string in run metadata
`);
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const args = parseArgs();

  if (args.help) {
    printHelp();
    process.exit(0);
  }

  console.log("=".repeat(60));
  console.log(" Observatory — Seismic Collection Run");
  console.log(`   Mode:     ${args.full ? "30-day backfill" : "48-hour incremental"}`);
  console.log(`   Context:  ${args.context ? "yes" : "no"}`);
  console.log(`   Layers:   ${args.layers ? "yes" : "no"}`);
  console.log(`   Dry run:  ${args.dryRun ? "yes" : "no"}`);
  console.log("=".repeat(60));

  // ── Build config from environment ────────────────────────────────────────
  const minMag = parseFloat(process.env["OBSERVATORY_MIN_MAG"] ?? "2.5");
  const catalogsEnv = process.env["OBSERVATORY_CATALOGS"];
  const additionalCatalogs =
    catalogsEnv !== undefined
      ? catalogsEnv.split(",").map((s: string) => s.trim()).filter(Boolean)
      : ["isc"];

  const bboxEnv = process.env["OBSERVATORY_BBOX"];
  let boundingBox: [number, number, number, number] | null = null;
  if (bboxEnv) {
    const parts = bboxEnv.split(",").map(Number);
    if (parts.length === 4 && parts.every(Number.isFinite)) {
      boundingBox = parts as [number, number, number, number];
    } else {
      console.warn(`[run] Invalid OBSERVATORY_BBOX "${bboxEnv}" — querying globally`);
    }
  }

  const now = new Date();
  const endTime = now.toISOString();
  const startTime = args.full
    ? new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
    : new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString();

  const collectorConfig: SeismicCollectionConfig = {
    startTime,
    endTime,
    minimumMagnitude: minMag,
    boundingBox,
    additionalCatalogs,
    collectContext: args.context,
    collectDeformation: args.deformation,
    fetchTimeoutMs: 45_000,
    softwareVersion: process.env["OBSERVATORY_VERSION"] ?? "dev",
  };

  // ── Collect ───────────────────────────────────────────────────────────────
  console.log(`\n[run] Collecting events from ${startTime} to ${endTime}…`);

  let collectionResult: Awaited<ReturnType<typeof runSeismicCollectors>>;
  try {
    collectionResult = await runSeismicCollectors(collectorConfig);
  } catch (err) {
    console.error("[run] Fatal error during collection:", err);
    process.exit(1);
    return; // unreachable but satisfies control-flow analysis
  }

  console.log(`\n[run] Collection complete:`);
  for (const [cat, count] of Object.entries(collectionResult.eventsByCatalog)) {
    console.log(`   ${cat.padEnd(10)} ${count} events`);
  }
  console.log(`   Total:     ${collectionResult.events.length} events`);

  if (Object.keys(collectionResult.errors).length > 0) {
    console.warn("\n[run] Collector errors (recorded as data gaps):");
    for (const [cat, err] of Object.entries(collectionResult.errors)) {
      console.warn(`   ${cat}: ${err}`);
    }
  }

  // ── Normalize ─────────────────────────────────────────────────────────────
  console.log("\n[run] Normalizing events…");

  let normalizerResult: Awaited<ReturnType<typeof runSeismicNormalizer>>;
  try {
    normalizerResult = await runSeismicNormalizer(collectionResult.events, {
      generateMapLayers: args.layers,
      windowStart: startTime,
      windowEnd: endTime,
    });
  } catch (err) {
    console.error("[run] Fatal error during normalization:", err);
    process.exit(1);
    return; // unreachable but satisfies control-flow analysis
  }

  console.log(`\n[run] Normalization complete:`);
  console.log(`   Distinct events:   ${normalizerResult.distinctEventCount}`);
  console.log(`   Cross-validated:   ${normalizerResult.crossValidatedCount}`);
  console.log(`   Aftershocks:       ${normalizerResult.aftershockCount}`);
  console.log(`   Induced-seismicity candidates: ${normalizerResult.inducedCandidateCount}`);
  if (normalizerResult.completenessEstimate) {
    const c = normalizerResult.completenessEstimate;
    console.log(`   Mc (${c.method}):        ${c.Mc.toFixed(1)} (n=${c.sampleSize})`);
  }

  // ── Write to store ────────────────────────────────────────────────────────
  if (args.dryRun) {
    console.log("\n[run] Dry run — skipping store writes.");
  } else {
    console.log("\n[run] Writing to store…");

    try {
      // Catalog events (raw)
      const { written: evWritten, skipped: evSkipped } =
        await writeCatalogEvents(collectionResult.events);
      console.log(
        `   Catalog events: ${evWritten} written, ${evSkipped} skipped (duplicates)`
      );

      // Normalized events
      const { written: normWritten } = await writeNormalizedEvents(
        normalizerResult.normalizedEvents
      );
      console.log(`   Normalized events: ${normWritten} written`);

      // Context
      if (args.context) {
        writeStationContext(collectionResult.stations);
        writeVolcanoContext(collectionResult.volcanoes);
        writeFaultContext(collectionResult.faults);
        console.log(
          `   Context: ${collectionResult.stations.length} stations, ` +
            `${collectionResult.volcanoes.length} volcanoes, ` +
            `${collectionResult.faults.length} faults`
        );
      }

      // Deformation observations
      if (args.deformation && collectionResult.deformationObservations.length > 0) {
        writeDeformationContext(collectionResult.deformationObservations);
        console.log(
          `   Deformation: ${collectionResult.deformationObservations.length} GNSS station velocities`
        );
      }

      // Gap records
      if (collectionResult.gaps.length > 0) {
        writeGapRecords(collectionResult.gaps);
        console.log(`   Gaps recorded: ${collectionResult.gaps.length}`);
      }

      // Map layers
      if (args.layers && Object.keys(normalizerResult.mapLayers).length > 0) {
        writeMapLayers(normalizerResult.mapLayers, endTime);
        console.log(
          `   Map layers written: ${Object.keys(normalizerResult.mapLayers).join(", ")}`
        );
      }

      // Run metadata (update with actual written counts)
      const meta = {
        ...collectionResult.meta,
        eventsNew: evWritten,
        eventsUpdated: 0, // NDJSON append-only; updates appear as new records
      };
      writeRunMeta(meta);
      console.log("   Run metadata written.");
    } catch (err) {
      console.error("[run] Fatal error writing to store:", err);
      process.exit(1);
    }
  }

  // ── Store inventory ───────────────────────────────────────────────────────
  if (!args.dryRun) {
    const inv = storeInventory();
    console.log(`\n[run] Store summary (${inv.dataDir}):`);
    console.log(`   Event files:      ${inv.eventFiles}`);
    console.log(`   Normalized files: ${inv.normalizedFiles}`);
    console.log(`   Gap files:        ${inv.gapFiles}`);
    console.log(`   Map layer files:  ${inv.mapLayerFiles}`);
  }

  console.log("\n[run] Done.");
  console.log("=".repeat(60));
}

main().catch((err) => {
  console.error("[run] Unhandled error:", err);
  process.exit(1);
});
