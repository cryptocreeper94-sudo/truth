#!/usr/bin/env node
/**
 * TRUTH Observatory — Ionospheric/Upper Atmosphere Collector
 * DarkWave Studios LLC — Copyright 2026
 *
 * Collects ionospheric and upper atmosphere data from publicly accessible
 * NOAA SWPC products. The original GIRO/DIDBase API has been retired;
 * this collector uses the SWPC products that remain available:
 *
 *   - NOAA Space Weather Scales (R/S/G — radio blackout, solar radiation, geomagnetic)
 *   - Aurora hemispheric power (auroral activity indicator)
 *   - 3-day space weather forecast (text bulletin)
 *   - GOES EUV flux (ionizing radiation proxy for D/E/F layer ionization)
 *
 * DDA 42-Doctrine module mapping:
 *   [01] Identity Kernel    → COLLECTOR_IDENTITY: immutable cert
 *   [02] Boundary Engine    → Only ionospheric/upper-atmo sources; raw/ionosphere/
 *   [08] Temporal Engine    → Every reading timestamped UTC
 *   [14] Determinacy Engine → SHA-256 hash of every response + retrieval manifest
 *   [32] Integrity Layer    → Raw data preserved as-is
 *   [33] Alignment Layer    → Rate-limited sequential fetch
 *   [35] Collapse Detection → Consecutive failure counter
 *   [40] Non-Being Guard    → Missing data recorded as gap
 *   [42] Devoid Limit       → Clean shutdown on fatal error
 *
 * NOTE: When GIRO/DIDBase or another ionosonde API becomes publicly available
 * again, add it as an additional source here — do not replace existing sources.
 */

import { createHash } from 'crypto';
import { mkdirSync, writeFileSync, readdirSync, statSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..', '..');
const STATE_DIR = process.env.STATE_DIR || join(REPO_ROOT, 'observatory', 'state');
const RAW_DIR = process.env.RAW_DIR || join(REPO_ROOT, 'observatory', 'raw', 'ionosphere');

// ═══════════════════════════════════════════════════════════════════════════════
// [01] IDENTITY KERNEL
// ═══════════════════════════════════════════════════════════════════════════════
const IDENTITY = Object.freeze({
  name: 'observatory-ionosphere-collector',
  version: '1.1.0',
  author: 'Andrews, Ronald Jason — DarkWave Studios LLC',
  architecture: 'DDA 42-Doctrine / Deterministic Dissolution Ladder',
  source: 'NOAA SWPC Ionospheric/Upper Atmosphere Products',
  domain: 'ionospheric',
  dataType: 'space-weather-scales-aurora-forecast-euv',
  rawPath: 'observatory/raw/ionosphere/',
  manifestPath: 'observatory/state/ionosphere-manifest.jsonl',
  maxConsecutiveFailures: 5,
  migrationNote: 'v1.0.0 used GIRO/DIDBase (lgdc.uml.edu) which was retired. v1.1.0 uses SWPC products.',
});

// ═══════════════════════════════════════════════════════════════════════════════
// [13] CONSTRAINT ENGINE — Available ionospheric data products
// ═══════════════════════════════════════════════════════════════════════════════
const PRODUCTS = Object.freeze([
  {
    id: 'noaa-scales',
    name: 'NOAA Space Weather Scales (R/S/G)',
    url: 'https://services.swpc.noaa.gov/products/noaa-scales.json',
    description: 'Radio blackout (R), solar radiation (S), geomagnetic (G) scale levels — direct ionospheric impact',
    format: 'json',
  },
  {
    id: 'aurora-power',
    name: 'Aurora Hemispheric Power',
    url: 'https://services.swpc.noaa.gov/text/aurora-nowcast-hemi-power.txt',
    description: 'NOAA/POES auroral hemispheric power index — ionospheric energy input (GW)',
    format: 'text',
  },
  {
    id: 'forecast-3day',
    name: '3-Day Space Weather Forecast',
    url: 'https://services.swpc.noaa.gov/text/3-day-forecast.txt',
    description: 'SWPC 3-day forecast bulletin — geomagnetic activity, solar activity, ionospheric conditions',
    format: 'text',
  },
  {
    id: 'goes-euv',
    name: 'GOES EUV Flux (ionization proxy)',
    url: 'https://services.swpc.noaa.gov/json/goes/primary/xrays-1-day.json',
    description: 'GOES X-ray/EUV flux — primary driver of dayside ionospheric ionization',
    format: 'json',
  },
  {
    id: 'planetary-k',
    name: 'Planetary K-Index (Estimated)',
    url: 'https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json',
    description: 'Estimated planetary Kp — geomagnetic activity / ionospheric disturbance indicator',
    format: 'json',
  },
  {
    id: 'solar-synoptic-map',
    name: 'Solar Synoptic Map Data',
    url: 'https://services.swpc.noaa.gov/json/solar_probabilities.json',
    description: 'Solar event probabilities — C/M/X flare and proton event forecast',
    format: 'json',
  },
]);

const CONFIG = Object.freeze({
  maxRetries: 3,
  retryDelayMs: 2000,
  timeoutMs: 20000,
  delayBetweenProducts: 500,
});

// ═══════════════════════════════════════════════════════════════════════════════
// [22] CONTINUITY LAYER
// ═══════════════════════════════════════════════════════════════════════════════
function manifestPath() {
  mkdirSync(STATE_DIR, { recursive: true });
  return join(STATE_DIR, 'ionosphere-manifest.jsonl');
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
// [03] DIFFERENTIATION — Collect one product
// ═══════════════════════════════════════════════════════════════════════════════
async function collectProduct(product, dateStr, now) {
  console.log(`  [→] ${product.name}`);

  const result = await fetchWithRetry(product.url);

  if (!result.body || result.status === 'FETCH_ERROR') {
    appendManifest({
      type: 'DATA-GAP',
      productId: product.id,
      productName: product.name,
      source: IDENTITY.source,
      domain: IDENTITY.domain,
      retrievedAt: now.toISOString(),
      sourceUrl: product.url,
      reason: result.error || 'Empty response',
      httpStatus: result.status,
    });
    console.log(`    [GAP] ${product.id}: ${result.error || result.status}`);
    return false;
  }

  const ext = product.format === 'json' ? '.json' : '.txt';
  const productDir = join(RAW_DIR, dateStr, product.id);
  mkdirSync(productDir, { recursive: true });
  const filename = `${product.id}-${now.toISOString().replace(/[:.]/g, '-')}${ext}`;
  writeFileSync(join(productDir, filename), result.body);

  let recordCount = 0;
  if (product.format === 'json') {
    try {
      const parsed = JSON.parse(result.body);
      recordCount = Array.isArray(parsed) ? parsed.length : 1;
    } catch {}
  } else {
    recordCount = result.body.split('\n').filter(l => l.trim()).length;
  }

  appendManifest({
    type: 'IONOSPHERE-DATA',
    productId: product.id,
    productName: product.name,
    description: product.description,
    dataFormat: product.format,
    source: IDENTITY.source,
    domain: IDENTITY.domain,
    sourceUrl: product.url,
    localPath: `observatory/raw/ionosphere/${dateStr}/${product.id}/${filename}`,
    retrievedAt: now.toISOString(),
    sha256: result.sha256,
    bytes: Buffer.byteLength(result.body),
    httpStatus: result.status,
    recordCount,
    doctrineNode: '[32] Integrity Layer',
  });

  console.log(`    [OK] ${product.id} — ${recordCount} records — sha256:${result.sha256.slice(0, 12)}…`);
  return true;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Retention + Collapse + Main
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
        try { if (statSync(p).mtimeMs < cutoff) { unlinkSync(p); pruned++; } } catch {}
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
let consecutiveFailures = 0;

async function runCycle() {
  const now = new Date();
  const dateStr = `${now.getUTCFullYear()}-${(now.getUTCMonth() + 1).toString().padStart(2, '0')}-${now.getUTCDate().toString().padStart(2, '0')}`;
  console.log(`\n[IONOSPHERE] Cycle start — ${now.toISOString()}`);

  let successes = 0, failures = 0;
  for (const product of PRODUCTS) {
    const ok = await collectProduct(product, dateStr, now);
    if (ok) successes++; else failures++;
    await new Promise(r => setTimeout(r, CONFIG.delayBetweenProducts));
  }

  console.log(`[IONOSPHERE] Cycle complete — ${successes}/${PRODUCTS.length} products collected, ${failures} gaps`);

  if (failures === PRODUCTS.length) {
    consecutiveFailures++;
    if (consecutiveFailures >= IDENTITY.maxConsecutiveFailures) {
      console.error('[IONOSPHERE] [35] COLLAPSE DETECTED — halting collector.');
      process.exit(1);
    }
  } else {
    consecutiveFailures = 0;
  }
  pruneOldFiles(RAW_DIR, RETENTION_HOURS);
}

// ═══════════════════════════════════════════════════════════════════════════════
// [42] DEVOID LIMIT
// ═══════════════════════════════════════════════════════════════════════════════
process.on('uncaughtException', (err) => {
  console.error('[IONOSPHERE] [42] DEVOID LIMIT — uncaught exception:', err.message);
  appendManifest({ type: 'FATAL-ERROR', error: err.message, at: new Date().toISOString() });
  process.exit(1);
});
process.on('unhandledRejection', (reason) => {
  console.error('[IONOSPHERE] [42] DEVOID LIMIT — unhandled rejection:', reason);
  appendManifest({ type: 'FATAL-ERROR', error: String(reason), at: new Date().toISOString() });
  process.exit(1);
});

// ═══════════════════════════════════════════════════════════════════════════════
// ENTRYPOINT
// ═══════════════════════════════════════════════════════════════════════════════
const INTERVAL_MS = parseInt(process.env.IONO_INTERVAL_MS || '900000', 10); // 15 min default

console.log('═══════════════════════════════════════════════════════════════');
console.log(' TRUTH Observatory — Ionosphere Collector v1.1.0');
console.log(` Architecture: ${IDENTITY.architecture}`);
console.log(` Products: ${PRODUCTS.length} (${PRODUCTS.map(p => p.id).join(', ')})`);
console.log(` Interval: ${INTERVAL_MS / 1000}s`);
console.log(` Raw output: ${RAW_DIR}`);
console.log(` Manifest: ${manifestPath()}`);
console.log(` Note: ${IDENTITY.migrationNote}`);
console.log('═══════════════════════════════════════════════════════════════');

await runCycle();
setInterval(runCycle, INTERVAL_MS);
