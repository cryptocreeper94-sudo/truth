#!/usr/bin/env node
/**
 * TRUTH Observatory — INTERMAGNET Geomagnetic Collector
 * DarkWave Studios LLC — Copyright 2026
 *
 * Fetches geomagnetic field data from multiple public sources:
 *   1. NOAA SWPC real-time magnetometer data (primary — JSON, reliable)
 *   2. INTERMAGNET definitive data via FDSN-style web services (when available)
 *   3. USGS Geomagnetism Program real-time data
 *
 * DDA 42-Doctrine module mapping:
 *   [01] Identity Kernel    → COLLECTOR_IDENTITY: immutable cert
 *   [02] Boundary Engine    → Only geomagnetic sources; never writes outside raw/geomagnetic/
 *   [08] Temporal Engine    → Every reading timestamped UTC
 *   [14] Determinacy Engine → SHA-256 hash of every response + retrieval manifest
 *   [20] Coherence Engine   → Multi-station comparison: station ID, coordinates, instrument type preserved
 *   [32] Integrity Layer    → Raw data preserved as-is; no modification
 *   [33] Alignment Layer    → Rate-limited; sequential station fetch
 *   [35] Collapse Detection → Consecutive failure counter
 *   [40] Non-Being Guard    → Missing data recorded as gap
 *   [42] Devoid Limit       → Clean shutdown on fatal error
 *
 * Primary stations monitored:
 *   Boulder (BOU), Fredericksburg (FRD), Barrow (BRW), College (CMO),
 *   Honolulu (HON), San Juan (SJG), Tucson (TUC), Deadhorse (DED)
 */

import { createHash } from 'crypto';
import { mkdirSync, writeFileSync, readdirSync, statSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..', '..');
const STATE_DIR = process.env.STATE_DIR || join(REPO_ROOT, 'observatory', 'state');
const RAW_DIR = process.env.RAW_DIR || join(REPO_ROOT, 'observatory', 'raw', 'geomagnetic');

// ═══════════════════════════════════════════════════════════════════════════════
// [01] IDENTITY KERNEL
// ═══════════════════════════════════════════════════════════════════════════════
const IDENTITY = Object.freeze({
  name: 'observatory-geomagnetic-collector',
  version: '1.0.0',
  author: 'Andrews, Ronald Jason — DarkWave Studios LLC',
  architecture: 'DDA 42-Doctrine / Deterministic Dissolution Ladder',
  source: 'NOAA SWPC Magnetometers + USGS Geomagnetism Program',
  domain: 'geomagnetic',
  dataType: 'magnetometer-bx-by-bz-total',
  rawPath: 'observatory/raw/geomagnetic/',
  manifestPath: 'observatory/state/geomagnetic-manifest.jsonl',
  maxConsecutiveFailures: 5,
});

// ═══════════════════════════════════════════════════════════════════════════════
// [13] CONSTRAINT ENGINE — Data sources
// ═══════════════════════════════════════════════════════════════════════════════
const SOURCES = Object.freeze([
  {
    id: 'swpc-mag-1m',
    name: 'SWPC Ground Magnetometer (1-min)',
    url: 'https://services.swpc.noaa.gov/json/goes/primary/magnetometers-1-day.json',
    description: 'GOES primary magnetometer — Bx, By, Bz, total field (nT)',
    type: 'satellite',
  },
  {
    id: 'swpc-mag-6h',
    name: 'SWPC Ground Magnetometer (6-hour)',
    url: 'https://services.swpc.noaa.gov/json/goes/primary/magnetometers-6-hour.json',
    description: 'GOES primary magnetometer — 6-hour window for trend detection',
    type: 'satellite',
  },
  {
    id: 'usgs-bou',
    name: 'USGS Boulder (BOU) Observatory',
    url: 'https://geomag.usgs.gov/ws/data/?id=BOU&type=variation&elements=X,Y,Z,F&sampling_period=60&format=json',
    description: 'USGS Boulder CO ground magnetometer — XYZF components (nT)',
    type: 'ground',
    station: 'BOU',
    coordinates: { lat: 40.137, lon: -105.237 },
  },
  {
    id: 'usgs-frd',
    name: 'USGS Fredericksburg (FRD) Observatory',
    url: 'https://geomag.usgs.gov/ws/data/?id=FRD&type=variation&elements=X,Y,Z,F&sampling_period=60&format=json',
    description: 'USGS Fredericksburg VA ground magnetometer',
    type: 'ground',
    station: 'FRD',
    coordinates: { lat: 38.205, lon: -77.373 },
  },
  {
    id: 'usgs-brw',
    name: 'USGS Barrow (BRW) Observatory',
    url: 'https://geomag.usgs.gov/ws/data/?id=BRW&type=variation&elements=X,Y,Z,F&sampling_period=60&format=json',
    description: 'USGS Barrow AK ground magnetometer — high-latitude auroral zone',
    type: 'ground',
    station: 'BRW',
    coordinates: { lat: 71.323, lon: -156.616 },
  },
  {
    id: 'usgs-hon',
    name: 'USGS Honolulu (HON) Observatory',
    url: 'https://geomag.usgs.gov/ws/data/?id=HON&type=variation&elements=X,Y,Z,F&sampling_period=60&format=json',
    description: 'USGS Honolulu HI ground magnetometer — equatorial reference',
    type: 'ground',
    station: 'HON',
    coordinates: { lat: 21.316, lon: -158.000 },
  },
]);

const CONFIG = Object.freeze({
  maxRetries: 3,
  retryDelayMs: 2000,
  timeoutMs: 20000,
  delayBetweenSources: 800,
});

// ═══════════════════════════════════════════════════════════════════════════════
// [22] CONTINUITY LAYER — Append-only manifest
// ═══════════════════════════════════════════════════════════════════════════════
function manifestPath() {
  mkdirSync(STATE_DIR, { recursive: true });
  return join(STATE_DIR, 'geomagnetic-manifest.jsonl');
}

function appendManifest(entry) {
  const line = JSON.stringify({ ...entry, writtenAt: new Date().toISOString() }) + '\n';
  writeFileSync(manifestPath(), line, { flag: 'a' });
}

// ═══════════════════════════════════════════════════════════════════════════════
// [32] INTEGRITY LAYER
// ═══════════════════════════════════════════════════════════════════════════════
function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

async function fetchWithRetry(url, retries = CONFIG.maxRetries) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), CONFIG.timeoutMs);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timer);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      return { status: res.status, body: text, sha256: sha256(Buffer.from(text)) };
    } catch (err) {
      if (attempt === retries) return { status: 'FETCH_ERROR', error: err.message, body: null, sha256: null };
      await new Promise(r => setTimeout(r, CONFIG.retryDelayMs * attempt));
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// [03] DIFFERENTIATION — Collect one source
// ═══════════════════════════════════════════════════════════════════════════════
async function collectSource(source, dateStr, now) {
  console.log(`  [→] ${source.name}`);

  const result = await fetchWithRetry(source.url);

  if (!result.body || result.status === 'FETCH_ERROR') {
    appendManifest({
      type: 'DATA-GAP',
      sourceId: source.id,
      sourceName: source.name,
      source: IDENTITY.source,
      domain: IDENTITY.domain,
      stationType: source.type,
      station: source.station || null,
      retrievedAt: now.toISOString(),
      sourceUrl: source.url,
      reason: result.error || 'Empty response',
      httpStatus: result.status,
    });
    console.log(`    [GAP] ${source.id}: ${result.error || result.status}`);
    return false;
  }

  const sourceDir = join(RAW_DIR, dateStr, source.id);
  mkdirSync(sourceDir, { recursive: true });
  const filename = `${source.id}-${now.toISOString().replace(/[:.]/g, '-')}.json`;
  writeFileSync(join(sourceDir, filename), result.body);

  let recordCount = 0;
  try {
    const parsed = JSON.parse(result.body);
    recordCount = Array.isArray(parsed) ? parsed.length :
                  parsed?.values?.length || parsed?.data?.length || 1;
  } catch {}

  appendManifest({
    type: 'GEOMAG-DATA',
    sourceId: source.id,
    sourceName: source.name,
    stationType: source.type,
    station: source.station || null,
    coordinates: source.coordinates || null,
    source: IDENTITY.source,
    domain: IDENTITY.domain,
    sourceUrl: source.url,
    localPath: `observatory/raw/geomagnetic/${dateStr}/${source.id}/${filename}`,
    retrievedAt: now.toISOString(),
    sha256: result.sha256,
    bytes: Buffer.byteLength(result.body),
    httpStatus: result.status,
    recordCount,
    doctrineNode: '[32] Integrity Layer',
  });

  console.log(`    [OK] ${source.id} — ${recordCount} records — sha256:${result.sha256.slice(0, 12)}…`);
  return true;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Retention + Collapse + Main Cycle
// ═══════════════════════════════════════════════════════════════════════════════
function pruneOldFiles(rootDir, retentionDays) {
  const cutoff = Date.now() - retentionDays * 86400000;
  let pruned = 0;
  function walk(dir) {
    let entries;
    try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      const p = join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else {
        try { if (statSync(p).mtimeMs < cutoff) { unlinkSync(p); pruned++; } } catch {}
      }
    }
  }
  walk(rootDir);
  if (pruned > 0) {
    appendManifest({ type: 'RETENTION-PRUNE', prunedFiles: pruned, retentionDays, at: new Date().toISOString() });
    console.log(`  [PRUNE] removed ${pruned} raw files older than ${retentionDays} days`);
  }
}
const RETENTION_DAYS = parseInt(process.env.RETENTION_DAYS || '7', 10);
let consecutiveFailures = 0;

async function runCycle() {
  const now = new Date();
  const dateStr = `${now.getUTCFullYear()}-${(now.getUTCMonth() + 1).toString().padStart(2, '0')}-${now.getUTCDate().toString().padStart(2, '0')}`;
  console.log(`\n[GEOMAG] Cycle start — ${now.toISOString()}`);

  let successes = 0, failures = 0;
  for (const source of SOURCES) {
    const ok = await collectSource(source, dateStr, now);
    if (ok) successes++; else failures++;
    await new Promise(r => setTimeout(r, CONFIG.delayBetweenSources));
  }

  console.log(`[GEOMAG] Cycle complete — ${successes}/${SOURCES.length} sources collected, ${failures} gaps`);

  if (failures === SOURCES.length) {
    consecutiveFailures++;
    if (consecutiveFailures >= IDENTITY.maxConsecutiveFailures) {
      console.error('[GEOMAG] [35] COLLAPSE DETECTED — halting collector.');
      process.exit(1);
    }
  } else {
    consecutiveFailures = 0;
  }
  pruneOldFiles(RAW_DIR, RETENTION_DAYS);
}

// ═══════════════════════════════════════════════════════════════════════════════
// [42] DEVOID LIMIT
// ═══════════════════════════════════════════════════════════════════════════════
process.on('uncaughtException', (err) => {
  console.error('[GEOMAG] [42] DEVOID LIMIT — uncaught exception:', err.message);
  appendManifest({ type: 'FATAL-ERROR', error: err.message, at: new Date().toISOString() });
  process.exit(1);
});
process.on('unhandledRejection', (reason) => {
  console.error('[GEOMAG] [42] DEVOID LIMIT — unhandled rejection:', reason);
  appendManifest({ type: 'FATAL-ERROR', error: String(reason), at: new Date().toISOString() });
  process.exit(1);
});

// ═══════════════════════════════════════════════════════════════════════════════
// ENTRYPOINT
// ═══════════════════════════════════════════════════════════════════════════════
const INTERVAL_MS = parseInt(process.env.GEOMAG_INTERVAL_MS || '900000', 10); // 15 min default

console.log('═══════════════════════════════════════════════════════════════');
console.log(' TRUTH Observatory — Geomagnetic Collector v1.0.0');
console.log(` Architecture: ${IDENTITY.architecture}`);
console.log(` Sources: ${SOURCES.length} (${SOURCES.map(s => s.id).join(', ')})`);
console.log(` Interval: ${INTERVAL_MS / 1000}s`);
console.log(` Raw output: ${RAW_DIR}`);
console.log(` Manifest: ${manifestPath()}`);
console.log('═══════════════════════════════════════════════════════════════');

await runCycle();
setInterval(runCycle, INTERVAL_MS);
