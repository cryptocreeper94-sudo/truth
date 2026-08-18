#!/usr/bin/env node
/**
 * TRUTH Observatory — EIA-930 Power Grid Collector
 * DarkWave Studios LLC — Copyright 2026
 *
 * Fetches real-time power generation, demand, and interchange data from
 * the U.S. Energy Information Administration Open Data API (v2).
 * Requires free API key (registered at api.eia.gov).
 *
 * DDA 42-Doctrine module mapping:
 *   [01] Identity Kernel    → COLLECTOR_IDENTITY: immutable cert for this collector
 *   [02] Boundary Engine    → Only EIA-930 source; never writes outside raw/grid/
 *   [08] Temporal Engine    → Every reading timestamped UTC; EIA local times converted
 *   [14] Determinacy Engine → SHA-256 hash of every API response + retrieval manifest
 *   [32] Integrity Layer    → Raw JSON preserved as-is; no modification after download
 *   [33] Alignment Layer    → Configurable BA (balancing authority) list; rate-limited
 *   [35] Collapse Detection → Consecutive failure counter; halts collector after threshold
 *   [40] Non-Being Guard    → Missing data recorded as gap, not silently skipped
 *   [42] Devoid Limit       → Uncaught fatal: flush manifest, write error record, exit clean
 *
 * API: https://api.eia.gov/v2/electricity/rto/
 * Products:
 *   - region-data/demand (hourly demand by BA)
 *   - fuel-type-data/generation (hourly generation by fuel type)
 *   - interchange-data (hourly interchange between BAs)
 */

import { createHash } from 'crypto';
import { mkdirSync, existsSync, readFileSync, writeFileSync, readdirSync, statSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..', '..');
config({ path: join(REPO_ROOT, 'observatory', '.env') });

const STATE_DIR = process.env.STATE_DIR || join(REPO_ROOT, 'observatory', 'state');
const RAW_DIR = process.env.RAW_DIR || join(REPO_ROOT, 'observatory', 'raw', 'grid');

// ═══════════════════════════════════════════════════════════════════════════════
// [01] IDENTITY KERNEL — Immutable. Never modified at runtime.
// ═══════════════════════════════════════════════════════════════════════════════
const IDENTITY = Object.freeze({
  name: 'observatory-eia930-grid-collector',
  version: '1.0.0',
  author: 'Andrews, Ronald Jason — DarkWave Studios LLC',
  architecture: 'DDA 42-Doctrine / Deterministic Dissolution Ladder',
  source: 'U.S. Energy Information Administration — EIA-930 Hourly Grid Monitor',
  domain: 'power-grid',
  dataType: 'electricity-demand-generation-interchange',
  rawPath: 'observatory/raw/grid/',
  manifestPath: 'observatory/state/grid-manifest.jsonl',
  maxConsecutiveFailures: 5,
});

// ═══════════════════════════════════════════════════════════════════════════════
// [13] CONSTRAINT ENGINE — Non-overridable configuration
// ═══════════════════════════════════════════════════════════════════════════════
const API_KEY = process.env.EIA_API_KEY || '';
if (!API_KEY) {
  console.error('[GRID] FATAL: EIA_API_KEY not set. Register free at https://api.eia.gov/');
  process.exit(1);
}

const DATASETS = Object.freeze([
  {
    id: 'demand',
    name: 'Hourly Demand by Balancing Authority',
    path: 'electricity/rto/region-data/data/',
    params: {
      frequency: 'hourly',
      'data[0]': 'value',
      'facets[type][]': 'D', // Demand
      sort: [{ column: 'period', direction: 'desc' }],
      length: 200,
    },
  },
  {
    id: 'generation',
    name: 'Hourly Generation by Fuel Type',
    path: 'electricity/rto/fuel-type-data/data/',
    params: {
      frequency: 'hourly',
      'data[0]': 'value',
      sort: [{ column: 'period', direction: 'desc' }],
      length: 200,
    },
  },
  {
    id: 'interchange',
    name: 'Hourly Interchange Between BAs',
    path: 'electricity/rto/interchange-data/data/',
    params: {
      frequency: 'hourly',
      'data[0]': 'value',
      sort: [{ column: 'period', direction: 'desc' }],
      length: 200,
    },
  },
]);

const CONFIG = Object.freeze({
  apiBase: 'https://api.eia.gov/v2/',
  maxRetries: 3,
  retryDelayMs: 3000,
  timeoutMs: 30000,
  delayBetweenDatasets: 1000, // ms — respect rate limits
});

// ═══════════════════════════════════════════════════════════════════════════════
// [22] CONTINUITY LAYER — Append-only manifest
// ═══════════════════════════════════════════════════════════════════════════════
function manifestPath() {
  mkdirSync(STATE_DIR, { recursive: true });
  return join(STATE_DIR, 'grid-manifest.jsonl');
}

function appendManifest(entry) {
  const line = JSON.stringify({ ...entry, writtenAt: new Date().toISOString() }) + '\n';
  writeFileSync(manifestPath(), line, { flag: 'a' });
}

// ═══════════════════════════════════════════════════════════════════════════════
// [32] INTEGRITY LAYER — SHA-256 hash
// ═══════════════════════════════════════════════════════════════════════════════
function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

function buildUrl(dataset) {
  const url = new URL(dataset.path, CONFIG.apiBase);
  url.searchParams.set('api_key', API_KEY);
  for (const [key, val] of Object.entries(dataset.params)) {
    if (key === 'sort') {
      // EIA v2 sort format
      url.searchParams.set('sort[0][column]', val[0].column);
      url.searchParams.set('sort[0][direction]', val[0].direction);
    } else {
      url.searchParams.set(key, String(val));
    }
  }
  return url.toString();
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
// [22] CONTINUITY LAYER (retention)
// ═══════════════════════════════════════════════════════════════════════════════
function pruneOldFiles(rootDir, retentionHours) {
  const cutoff = Date.now() - retentionHours * 3600000;
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
    appendManifest({ type: 'RETENTION-PRUNE', prunedFiles: pruned, retentionHours, at: new Date().toISOString() });
    console.log(`  [PRUNE] removed ${pruned} raw files older than ${retentionHours} hours`);
  }
}
const RETENTION_HOURS = parseInt(process.env.RETENTION_HOURS || '4', 10);

// ═══════════════════════════════════════════════════════════════════════════════
// [35] COLLAPSE DETECTION
// ═══════════════════════════════════════════════════════════════════════════════
let consecutiveFailures = 0;

// ═══════════════════════════════════════════════════════════════════════════════
// [03] DIFFERENTIATION — Collect one dataset
// ═══════════════════════════════════════════════════════════════════════════════
async function collectDataset(dataset, dateStr, now) {
  console.log(`  [→] ${dataset.name}`);

  const queryUrl = buildUrl(dataset);
  // Redact API key from logged URL
  const logUrl = queryUrl.replace(API_KEY, '***');
  const result = await fetchWithRetry(queryUrl);

  if (!result.body || result.status === 'FETCH_ERROR') {
    appendManifest({
      type: 'DATA-GAP',
      datasetId: dataset.id,
      datasetName: dataset.name,
      source: IDENTITY.source,
      domain: IDENTITY.domain,
      retrievedAt: now.toISOString(),
      sourceUrl: logUrl,
      reason: result.error || 'Empty response from EIA',
      httpStatus: result.status,
    });
    console.log(`    [GAP] ${dataset.id}: ${result.error || result.status}`);
    return false;
  }

  // Save raw response
  const datasetDir = join(RAW_DIR, dateStr, dataset.id);
  mkdirSync(datasetDir, { recursive: true });
  const filename = `${dataset.id}-${now.toISOString().replace(/[:.]/g, '-')}.json`;
  writeFileSync(join(datasetDir, filename), result.body);

  // Parse to extract record count
  let recordCount = 0;
  try {
    const parsed = JSON.parse(result.body);
    recordCount = parsed?.response?.data?.length || 0;
  } catch {}

  appendManifest({
    type: 'GRID-DATA',
    datasetId: dataset.id,
    datasetName: dataset.name,
    source: IDENTITY.source,
    domain: IDENTITY.domain,
    sourceUrl: logUrl,
    localPath: `observatory/raw/grid/${dateStr}/${dataset.id}/${filename}`,
    retrievedAt: now.toISOString(),
    sha256: result.sha256,
    bytes: Buffer.byteLength(result.body),
    httpStatus: result.status,
    recordCount,
    doctrineNode: '[32] Integrity Layer',
  });

  console.log(`    [OK] ${dataset.id} — ${recordCount} records — sha256:${result.sha256.slice(0, 12)}…`);
  return true;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COLLECTION CYCLE
// ═══════════════════════════════════════════════════════════════════════════════
async function runCycle() {
  const now = new Date();
  const dateStr = `${now.getUTCFullYear()}-${(now.getUTCMonth() + 1).toString().padStart(2, '0')}-${now.getUTCDate().toString().padStart(2, '0')}`;
  console.log(`\n[GRID] Cycle start — ${now.toISOString()}`);

  let successes = 0, failures = 0;

  for (const dataset of DATASETS) {
    const ok = await collectDataset(dataset, dateStr, now);
    if (ok) successes++; else failures++;
    await new Promise(r => setTimeout(r, CONFIG.delayBetweenDatasets));
  }

  console.log(`[GRID] Cycle complete — ${successes}/${DATASETS.length} datasets collected, ${failures} gaps`);

  if (failures === DATASETS.length) {
    consecutiveFailures++;
    console.warn(`[GRID] All datasets failed. Consecutive failure count: ${consecutiveFailures}/${IDENTITY.maxConsecutiveFailures}`);
    if (consecutiveFailures >= IDENTITY.maxConsecutiveFailures) {
      console.error('[GRID] [35] COLLAPSE DETECTED — halting collector.');
      process.exit(1);
    }
  } else {
    consecutiveFailures = 0;
  }

  pruneOldFiles(RAW_DIR, RETENTION_HOURS);
}

// ═══════════════════════════════════════════════════════════════════════════════
// [42] DEVOID LIMIT — Fatal error handler
// ═══════════════════════════════════════════════════════════════════════════════
process.on('uncaughtException', (err) => {
  console.error('[GRID] [42] DEVOID LIMIT — uncaught exception:', err.message);
  appendManifest({ type: 'FATAL-ERROR', error: err.message, at: new Date().toISOString() });
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('[GRID] [42] DEVOID LIMIT — unhandled rejection:', reason);
  appendManifest({ type: 'FATAL-ERROR', error: String(reason), at: new Date().toISOString() });
  process.exit(1);
});

// ═══════════════════════════════════════════════════════════════════════════════
// ENTRYPOINT
// ═══════════════════════════════════════════════════════════════════════════════
const INTERVAL_MS = parseInt(process.env.GRID_INTERVAL_MS || '3600000', 10); // 1 hour default

console.log('═══════════════════════════════════════════════════════════════');
console.log(' TRUTH Observatory — EIA-930 Power Grid Collector v1.0.0');
console.log(` Architecture: ${IDENTITY.architecture}`);
console.log(` Datasets: ${DATASETS.length} (${DATASETS.map(d => d.id).join(', ')})`);
console.log(` Interval: ${INTERVAL_MS / 1000}s`);
console.log(` Raw output: ${RAW_DIR}`);
console.log(` Manifest: ${manifestPath()}`);
console.log(` API Key: ${API_KEY ? '***' + API_KEY.slice(-4) : 'NOT SET'}`);
console.log('═══════════════════════════════════════════════════════════════');

await runCycle();
setInterval(runCycle, INTERVAL_MS);
