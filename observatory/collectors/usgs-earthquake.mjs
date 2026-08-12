#!/usr/bin/env node
/**
 * TRUTH Observatory — USGS Earthquake Catalog Collector
 * DarkWave Studios LLC — Copyright 2026
 *
 * Fetches real-time earthquake events from the USGS Earthquake Hazards API.
 * No API key required — public GeoJSON endpoint.
 *
 * DDA 42-Doctrine module mapping:
 *   [01] Identity Kernel    → COLLECTOR_IDENTITY: immutable cert for this collector
 *   [02] Boundary Engine    → Only USGS earthquake source; never writes outside raw/seismic/
 *   [08] Temporal Engine    → Every event timestamped UTC; origin time preserved from catalog
 *   [14] Determinacy Engine → SHA-256 hash of every API response + retrieval manifest
 *   [20] Coherence Engine   → Catalog source, event ID, review status preserved for cross-catalog comparison
 *   [32] Integrity Layer    → Raw GeoJSON preserved as-is; no modification after download
 *   [33] Alignment Layer    → Configurable magnitude threshold and query window; rate-limited
 *   [35] Collapse Detection → Consecutive failure counter; halts collector after threshold
 *   [40] Non-Being Guard    → Missing data / empty results recorded as gap, not silently skipped
 *   [42] Devoid Limit       → Uncaught fatal: flush manifest, write error record, exit clean
 *
 * API: https://earthquake.usgs.gov/fdsnws/event/1/query
 * Format: GeoJSON (FeatureCollection)
 * Coverage: Global, near real-time
 */

import { createHash } from 'crypto';
import { mkdirSync, existsSync, readFileSync, writeFileSync, readdirSync, statSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..', '..');
const STATE_DIR = process.env.STATE_DIR || join(REPO_ROOT, 'observatory', 'state');
const RAW_DIR = process.env.RAW_DIR || join(REPO_ROOT, 'observatory', 'raw', 'seismic');

// ═══════════════════════════════════════════════════════════════════════════════
// [01] IDENTITY KERNEL — Immutable. Never modified at runtime.
// ═══════════════════════════════════════════════════════════════════════════════
const IDENTITY = Object.freeze({
  name: 'observatory-usgs-earthquake-collector',
  version: '1.0.0',
  author: 'Andrews, Ronald Jason — DarkWave Studios LLC',
  architecture: 'DDA 42-Doctrine / Deterministic Dissolution Ladder',
  source: 'USGS Earthquake Hazards Program — FDSN Event Service',
  domain: 'seismic',
  dataType: 'earthquake-catalog-geojson',
  rawPath: 'observatory/raw/seismic/',
  manifestPath: 'observatory/state/seismic-manifest.jsonl',
  maxConsecutiveFailures: 5,
});

// ═══════════════════════════════════════════════════════════════════════════════
// [13] CONSTRAINT ENGINE — Non-overridable configuration
// ═══════════════════════════════════════════════════════════════════════════════
const CONFIG = Object.freeze({
  // USGS FDSN Event API
  apiBase: 'https://earthquake.usgs.gov/fdsnws/event/1/query',

  // Minimum magnitude to collect (M2.5+ = broadly felt / network-complete for CONUS)
  minMagnitude: parseFloat(process.env.USGS_MIN_MAG || '2.5'),

  // Query window — how far back each cycle looks (minutes)
  lookbackMinutes: parseInt(process.env.USGS_LOOKBACK || '30', 10),

  // Max events per query (USGS limit is 20000)
  maxEvents: 500,

  // Retry config
  maxRetries: 3,
  retryDelayMs: 2000,

  // Request timeout
  timeoutMs: 30000,
});

// ═══════════════════════════════════════════════════════════════════════════════
// [22] CONTINUITY LAYER — Append-only manifest; never modifies raw files
// ═══════════════════════════════════════════════════════════════════════════════
function manifestPath() {
  mkdirSync(STATE_DIR, { recursive: true });
  return join(STATE_DIR, 'seismic-manifest.jsonl');
}

function appendManifest(entry) {
  const line = JSON.stringify({ ...entry, writtenAt: new Date().toISOString() }) + '\n';
  writeFileSync(manifestPath(), line, { flag: 'a' });
}

function loadSeenEvents() {
  const mp = manifestPath();
  if (!existsSync(mp)) return new Set();
  const seen = new Set();
  const lines = readFileSync(mp, 'utf8').split('\n').filter(Boolean);
  for (const line of lines) {
    try { const e = JSON.parse(line); if (e.eventId) seen.add(e.eventId); } catch {}
  }
  return seen;
}

// ═══════════════════════════════════════════════════════════════════════════════
// [08] TEMPORAL ENGINE — UTC date helpers
// ═══════════════════════════════════════════════════════════════════════════════
function utcDateStr(d = new Date()) {
  return `${d.getUTCFullYear()}-${(d.getUTCMonth() + 1).toString().padStart(2, '0')}-${d.getUTCDate().toString().padStart(2, '0')}`;
}

function buildQueryUrl(now = new Date()) {
  const start = new Date(now.getTime() - CONFIG.lookbackMinutes * 60000);
  const params = new URLSearchParams({
    format: 'geojson',
    starttime: start.toISOString(),
    endtime: now.toISOString(),
    minmagnitude: CONFIG.minMagnitude.toString(),
    limit: CONFIG.maxEvents.toString(),
    orderby: 'time',
  });
  return `${CONFIG.apiBase}?${params}`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// [32] INTEGRITY LAYER — SHA-256 hash every raw response
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
// [22] CONTINUITY LAYER (retention) — Prune raw files older than retention window
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
        try {
          if (statSync(p).mtimeMs < cutoff) { unlinkSync(p); pruned++; }
        } catch {}
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

// ═══════════════════════════════════════════════════════════════════════════════
// [35] COLLAPSE DETECTION — Track consecutive failures
// ═══════════════════════════════════════════════════════════════════════════════
let consecutiveFailures = 0;

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COLLECTION CYCLE
// ═══════════════════════════════════════════════════════════════════════════════
async function runCycle() {
  const now = new Date();
  console.log(`\n[SEISMIC] Cycle start — ${now.toISOString()}`);

  const queryUrl = buildQueryUrl(now);
  const result = await fetchWithRetry(queryUrl);

  if (!result.body || result.status === 'FETCH_ERROR') {
    // [40] Non-Being Guard — gap recorded
    appendManifest({
      type: 'DATA-GAP',
      source: IDENTITY.source,
      domain: IDENTITY.domain,
      retrievedAt: now.toISOString(),
      queryUrl,
      reason: result.error || 'Empty response from USGS API',
      httpStatus: result.status,
    });
    console.log(`  [GAP] USGS API returned no data: ${result.error || result.status}`);
    consecutiveFailures++;
    if (consecutiveFailures >= IDENTITY.maxConsecutiveFailures) {
      console.error('[SEISMIC] [35] COLLAPSE DETECTED — halting collector.');
      process.exit(1);
    }
    return;
  }

  // Parse GeoJSON
  let geojson;
  try {
    geojson = JSON.parse(result.body);
  } catch (err) {
    appendManifest({
      type: 'PARSE-ERROR',
      source: IDENTITY.source,
      retrievedAt: now.toISOString(),
      error: err.message,
    });
    console.error(`  [ERR] Failed to parse USGS GeoJSON: ${err.message}`);
    return;
  }

  const features = geojson.features || [];
  const dateStr = utcDateStr(now);
  const seen = loadSeenEvents();

  // Save raw response
  const rawDir = join(RAW_DIR, dateStr);
  mkdirSync(rawDir, { recursive: true });
  const rawFilename = `usgs-query-${now.toISOString().replace(/[:.]/g, '-')}.json`;
  const rawPath = join(rawDir, rawFilename);
  writeFileSync(rawPath, result.body);

  appendManifest({
    type: 'QUERY-RESPONSE',
    source: IDENTITY.source,
    domain: IDENTITY.domain,
    queryUrl,
    localPath: `observatory/raw/seismic/${dateStr}/${rawFilename}`,
    retrievedAt: now.toISOString(),
    sha256: result.sha256,
    bytes: Buffer.byteLength(result.body),
    httpStatus: result.status,
    eventCount: features.length,
    doctrineNode: '[32] Integrity Layer',
  });

  // Process individual events
  let newEvents = 0;
  for (const feature of features) {
    const props = feature.properties || {};
    const eventId = feature.id || props.code || props.ids;

    if (!eventId || seen.has(eventId)) continue;
    seen.add(eventId);
    newEvents++;

    const [lon, lat, depthKm] = feature.geometry?.coordinates || [null, null, null];

    appendManifest({
      type: 'EARTHQUAKE-EVENT',
      eventId,
      source: IDENTITY.source,
      domain: IDENTITY.domain,
      // Core seismic parameters
      magnitude: props.mag,
      magnitudeType: props.magType,
      place: props.place,
      originTime: props.time ? new Date(props.time).toISOString() : null,
      updatedTime: props.updated ? new Date(props.updated).toISOString() : null,
      latitude: lat,
      longitude: lon,
      depthKm,
      // Catalog metadata
      status: props.status, // "automatic" or "reviewed"
      net: props.net,       // Contributing network
      nst: props.nst,       // Number of stations
      gap: props.gap,       // Azimuthal gap (degrees)
      rms: props.rms,       // RMS travel time residual
      dmin: props.dmin,     // Min station distance (degrees)
      alert: props.alert,   // PAGER alert level
      tsunami: props.tsunami,
      felt: props.felt,     // Number of felt reports
      cdi: props.cdi,       // Community intensity
      mmi: props.mmi,       // ShakeMap intensity
      sig: props.sig,       // Significance score
      // Provenance
      detailUrl: props.detail,
      url: props.url,
      retrievedAt: now.toISOString(),
      doctrineNode: '[14] Determinacy Engine',
    });
  }

  console.log(`[SEISMIC] Cycle complete — ${features.length} events in window, ${newEvents} new`);
  consecutiveFailures = 0;
  pruneOldFiles(RAW_DIR, RETENTION_DAYS);
}

// ═══════════════════════════════════════════════════════════════════════════════
// [42] DEVOID LIMIT — Fatal error handler; clean shutdown
// ═══════════════════════════════════════════════════════════════════════════════
process.on('uncaughtException', (err) => {
  console.error('[SEISMIC] [42] DEVOID LIMIT — uncaught exception:', err.message);
  appendManifest({ type: 'FATAL-ERROR', error: err.message, at: new Date().toISOString() });
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('[SEISMIC] [42] DEVOID LIMIT — unhandled rejection:', reason);
  appendManifest({ type: 'FATAL-ERROR', error: String(reason), at: new Date().toISOString() });
  process.exit(1);
});

// ═══════════════════════════════════════════════════════════════════════════════
// ENTRYPOINT — Run immediately, then on interval
// ═══════════════════════════════════════════════════════════════════════════════
const INTERVAL_MS = parseInt(process.env.SEISMIC_INTERVAL_MS || '900000', 10); // 15 min default

console.log('═══════════════════════════════════════════════════════════════');
console.log(' TRUTH Observatory — USGS Earthquake Collector v1.0.0');
console.log(` Architecture: ${IDENTITY.architecture}`);
console.log(` Min magnitude: M${CONFIG.minMagnitude}+`);
console.log(` Lookback: ${CONFIG.lookbackMinutes} min`);
console.log(` Interval: ${INTERVAL_MS / 1000}s`);
console.log(` Raw output: ${RAW_DIR}`);
console.log(` Manifest: ${manifestPath()}`);
console.log('═══════════════════════════════════════════════════════════════');

await runCycle();
setInterval(runCycle, INTERVAL_MS);
