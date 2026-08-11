/**
 * Observatory — NDJSON File Store
 *
 * Persists Observatory records to newline-delimited JSON (NDJSON) files.
 * One record per line, one file per data type per day.
 *
 * File layout:
 *   observatory/data/
 *     events/             CatalogEvent records (raw, per-catalog)
 *       usgs-2024-01-15.ndjson
 *       isc-2024-01-15.ndjson
 *     normalized/         NormalizedSeismicEvent records
 *       2024-01-15.ndjson
 *     context/
 *       stations-2024-01-15.ndjson
 *       volcanoes-2024-01-15.ndjson
 *       faults-2024-01-15.ndjson
 *     gaps/
 *       gaps-2024-01-15.ndjson
 *     runs/
 *       run-2024-01-15T12-00-00Z.ndjson
 *     map-layers/
 *       M2.5plus-2024-01-15.geojson
 *
 * Design rationale:
 *  - NDJSON is append-friendly and grep-friendly; no database dependency.
 *  - Each record is self-contained — the file is not invalidated if a later
 *    record is added.
 *  - Daily files keep individual file sizes manageable and make date-range
 *    queries trivial (list files, filter by date).
 *  - The store de-duplicates on write by checking catalogEventId + catalog.
 *    This prevents exact duplicates from accumulating on re-runs without
 *    requiring a full database scan.
 *
 * Limitations:
 *  - No indexing — full-file scans required for non-date queries.
 *  - Concurrent writes from multiple processes may corrupt files.
 *    For production use, replace with SQLite or PostgreSQL.
 */

import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import type {
  CatalogEvent,
  NormalizedSeismicEvent,
  SeismicStation,
  VolcanoContext,
  FaultContext,
  DeformationObservation,
  DataGapRecord,
  CollectionRunMeta,
  SeismicMapLayer,
} from "../schema/seismic.js";

// ── Store root ────────────────────────────────────────────────────────────────

/** Absolute path to the data directory.  Override via OBSERVATORY_DATA_DIR. */
export function getDataDir(): string {
  return (
    process.env["OBSERVATORY_DATA_DIR"] ??
    path.join(process.cwd(), "observatory", "data")
  );
}

// ── Write helpers ─────────────────────────────────────────────────────────────

/**
 * Append a single JSON record as a newline to an NDJSON file.
 * Creates parent directories automatically.
 */
function appendNdjson(filePath: string, record: unknown): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.appendFileSync(filePath, JSON.stringify(record) + "\n", "utf-8");
}

/**
 * Write or overwrite a JSON file (used for GeoJSON map layers).
 */
function writeJson(filePath: string, data: unknown): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

// ── Date key ──────────────────────────────────────────────────────────────────

function dateKey(isoString: string): string {
  return isoString.slice(0, 10); // "YYYY-MM-DD"
}

function safeTimestamp(isoString: string): string {
  // Replace colons in time part for use in filenames
  return isoString.replace(/:/g, "-").replace(/\.\d+Z$/, "Z");
}

// ── Deduplication ─────────────────────────────────────────────────────────────

/**
 * Read all catalogEventId+catalog pairs from an NDJSON file without loading
 * the entire file into memory.
 */
async function readExistingIds(filePath: string): Promise<Set<string>> {
  const ids = new Set<string>();
  if (!fs.existsSync(filePath)) return ids;

  const rl = readline.createInterface({
    input: fs.createReadStream(filePath),
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    try {
      const record = JSON.parse(line) as Partial<CatalogEvent>;
      if (record.catalog && record.catalogEventId) {
        ids.add(`${record.catalog}:${record.catalogEventId}`);
      }
    } catch {
      // Malformed line — skip
    }
  }

  return ids;
}

// ── Write API ─────────────────────────────────────────────────────────────────

/**
 * Write CatalogEvent records to the events store.
 *
 * Events are grouped by (catalog, date) and written to separate files.
 * Duplicate records (same catalog + catalogEventId) are skipped.
 *
 * Returns { written, skipped } counts.
 */
export async function writeCatalogEvents(
  events: CatalogEvent[]
): Promise<{ written: number; skipped: number }> {
  const dataDir = getDataDir();
  let written = 0;
  let skipped = 0;

  // Group by catalog + date
  const groups = new Map<string, CatalogEvent[]>();
  for (const event of events) {
    const key = `${event.catalog}:${dateKey(event.originTime)}`;
    let group = groups.get(key);
    if (!group) {
      group = [];
      groups.set(key, group);
    }
    group.push(event);
  }

  for (const [key, groupEvents] of groups.entries()) {
    const [catalog, date] = key.split(":") as [string, string];
    const filePath = path.join(dataDir, "events", `${catalog}-${date}.ndjson`);

    // Load existing IDs to avoid duplicates
    const existingIds = await readExistingIds(filePath);

    for (const event of groupEvents) {
      const id = `${event.catalog}:${event.catalogEventId}`;
      if (existingIds.has(id)) {
        skipped++;
        continue;
      }
      appendNdjson(filePath, event);
      existingIds.add(id);
      written++;
    }
  }

  return { written, skipped };
}

/**
 * Write NormalizedSeismicEvent records.
 * Grouped by origin date.  Updates (same observatoryId, new normalizationVersion)
 * are appended as new records — the latest record for each ID is authoritative.
 *
 * Returns { written } count.
 */
export async function writeNormalizedEvents(
  events: NormalizedSeismicEvent[]
): Promise<{ written: number }> {
  const dataDir = getDataDir();
  let written = 0;

  const groups = new Map<string, NormalizedSeismicEvent[]>();
  for (const event of events) {
    const date = dateKey(event.originTime);
    let group = groups.get(date);
    if (!group) {
      group = [];
      groups.set(date, group);
    }
    group.push(event);
  }

  for (const [date, groupEvents] of groups.entries()) {
    const filePath = path.join(dataDir, "normalized", `${date}.ndjson`);
    for (const event of groupEvents) {
      appendNdjson(filePath, event);
      written++;
    }
  }

  return { written };
}

/**
 * Write station context records.  All stations go to a single daily file.
 */
export function writeStationContext(stations: SeismicStation[]): void {
  if (stations.length === 0) return;
  const dataDir = getDataDir();
  const date = dateKey(stations[0]!.retrievedAt);
  const filePath = path.join(dataDir, "context", `stations-${date}.ndjson`);
  for (const station of stations) {
    appendNdjson(filePath, station);
  }
}

/**
 * Write volcano context records.
 */
export function writeVolcanoContext(volcanoes: VolcanoContext[]): void {
  if (volcanoes.length === 0) return;
  const dataDir = getDataDir();
  const date = dateKey(volcanoes[0]!.retrievedAt);
  const filePath = path.join(dataDir, "context", `volcanoes-${date}.ndjson`);
  for (const v of volcanoes) {
    appendNdjson(filePath, v);
  }
}

/**
 * Write fault context records.
 */
export function writeFaultContext(faults: FaultContext[]): void {
  if (faults.length === 0) return;
  const dataDir = getDataDir();
  const date = dateKey(faults[0]!.retrievedAt);
  const filePath = path.join(dataDir, "context", `faults-${date}.ndjson`);
  for (const f of faults) {
    appendNdjson(filePath, f);
  }
}

/**
 * Write GNSS/InSAR deformation observation records.
 * Grouped by observation date.  Large velocity solution files may contain
 * thousands of station records; each is stored as an NDJSON line.
 */
export function writeDeformationContext(
  observations: DeformationObservation[]
): void {
  if (observations.length === 0) return;
  const dataDir = getDataDir();
  const date = dateKey(observations[0]!.retrievedAt);
  const filePath = path.join(
    dataDir,
    "context",
    `deformation-${date}.ndjson`
  );
  for (const obs of observations) {
    appendNdjson(filePath, obs);
  }
}

/**
 * Write data gap records.
 */
export function writeGapRecords(gaps: DataGapRecord[]): void {
  if (gaps.length === 0) return;
  const dataDir = getDataDir();
  const date = dateKey(gaps[0]!.recordedAt);
  const filePath = path.join(dataDir, "gaps", `gaps-${date}.ndjson`);
  for (const gap of gaps) {
    appendNdjson(filePath, gap);
  }
}

/**
 * Write collection run metadata.
 */
export function writeRunMeta(meta: CollectionRunMeta): void {
  const dataDir = getDataDir();
  const ts = safeTimestamp(meta.runStartedAt);
  const filePath = path.join(dataDir, "runs", `run-${ts}.ndjson`);
  appendNdjson(filePath, meta);
}

/**
 * Write GeoJSON map layers.  Each layer is a separate .geojson file.
 */
export function writeMapLayers(
  layers: Record<string, SeismicMapLayer>,
  windowDate: string
): void {
  const dataDir = getDataDir();
  for (const [key, layer] of Object.entries(layers)) {
    const safeName = key.replace(/[^a-zA-Z0-9_-]/g, "");
    const filePath = path.join(
      dataDir,
      "map-layers",
      `${safeName}-${dateKey(windowDate)}.geojson`
    );
    writeJson(filePath, layer);
  }
}

// ── Read API ──────────────────────────────────────────────────────────────────

/**
 * Read all NormalizedSeismicEvent records for a given date range.
 * Returns the last seen record for each observatoryId (handles updates).
 */
export async function readNormalizedEvents(
  startDate: string,
  endDate: string
): Promise<NormalizedSeismicEvent[]> {
  const dataDir = getDataDir();
  const dir = path.join(dataDir, "normalized");

  if (!fs.existsSync(dir)) return [];

  const files = fs
    .readdirSync(dir)
    .filter((f: string) => f.endsWith(".ndjson") && f >= startDate && f <= endDate + ".ndjson")
    .sort();

  const byId = new Map<string, NormalizedSeismicEvent>();

  for (const file of files) {
    const rl = readline.createInterface({
      input: fs.createReadStream(path.join(dir, file)),
      crlfDelay: Infinity,
    });

    for await (const line of rl) {
      try {
        const record = JSON.parse(line) as NormalizedSeismicEvent;
        if (record.observatoryId) {
          byId.set(record.observatoryId, record);
        }
      } catch {
        // Malformed line — skip
      }
    }
  }

  return [...byId.values()].sort(
    (a, b) =>
      new Date(a.originTime).getTime() - new Date(b.originTime).getTime()
  );
}

/**
 * Read data gap records for a given date range.
 */
export async function readGapRecords(
  startDate: string,
  endDate: string
): Promise<DataGapRecord[]> {
  const dataDir = getDataDir();
  const dir = path.join(dataDir, "gaps");

  if (!fs.existsSync(dir)) return [];

  const files = fs
    .readdirSync(dir)
    .filter(
      (f: string) =>
        f.startsWith("gaps-") &&
        f.endsWith(".ndjson") &&
        f >= `gaps-${startDate}` &&
        f <= `gaps-${endDate}.ndjson`
    )
    .sort();

  const gaps: DataGapRecord[] = [];

  for (const file of files) {
    const rl = readline.createInterface({
      input: fs.createReadStream(path.join(dir, file)),
      crlfDelay: Infinity,
    });

    for await (const line of rl) {
      try {
        gaps.push(JSON.parse(line) as DataGapRecord);
      } catch {
        // skip
      }
    }
  }

  return gaps;
}

/**
 * List all map-layer GeoJSON files available in the store.
 */
export function listMapLayers(): Array<{ filename: string; path: string }> {
  const dataDir = getDataDir();
  const dir = path.join(dataDir, "map-layers");

  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((f: string) => f.endsWith(".geojson"))
    .sort()
    .map((f: string) => ({ filename: f, path: path.join(dir, f) }));
}

/**
 * Read a stored GeoJSON map layer by filename.
 */
export function readMapLayer(filename: string): SeismicMapLayer | null {
  const dataDir = getDataDir();
  const filePath = path.join(dataDir, "map-layers", filename);

  if (!fs.existsSync(filePath)) return null;

  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8")) as SeismicMapLayer;
  } catch {
    return null;
  }
}

/**
 * Return a summary of what's in the store: record counts per data type,
 * date range of available data, and any detected gaps.
 */
export function storeInventory(): {
  eventFiles: number;
  normalizedFiles: number;
  gapFiles: number;
  mapLayerFiles: number;
  dataDir: string;
} {
  const dataDir = getDataDir();

  const count = (subDir: string, ext = ".ndjson"): number => {
    const dir = path.join(dataDir, subDir);
    if (!fs.existsSync(dir)) return 0;
    return fs.readdirSync(dir).filter((f: string) => f.endsWith(ext)).length;
  };

  return {
    eventFiles: count("events"),
    normalizedFiles: count("normalized"),
    gapFiles: count("gaps"),
    mapLayerFiles: count("map-layers", ".geojson"),
    dataDir,
  };
}
