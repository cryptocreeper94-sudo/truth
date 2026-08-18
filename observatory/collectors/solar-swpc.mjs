#!/usr/bin/env node
/**
 * TRUTH Observatory — NOAA SWPC Solar/Space Weather Collector
 * DarkWave Studios LLC — Copyright 2026
 *
 * Fetches solar and space weather data from NOAA Space Weather Prediction Center.
 * No API key required — public JSON endpoints.
 *
 * DDA 42-Doctrine module mapping:
 *   [01] Identity Kernel    → COLLECTOR_IDENTITY: immutable cert for this collector
 *   [02] Boundary Engine    → Only SWPC source; never writes outside raw/solar/
 *   [08] Temporal Engine    → Every reading timestamped UTC from SWPC time tags
 *   [14] Determinacy Engine → SHA-256 hash of every API response + retrieval manifest
 *   [32] Integrity Layer    → Raw JSON preserved as-is; no modification after download
 *   [33] Alignment Layer    → Configurable product set; rate-limited sequential fetch
 *   [35] Collapse Detection → Consecutive failure counter; halts collector after threshold
 *   [40] Non-Being Guard    → Missing data recorded as gap, not silently skipped
 *   [42] Devoid Limit       → Uncaught fatal: flush manifest, write error record, exit clean
 *
 * Products collected:
 *   - Solar X-ray flux (GOES XRS 1-minute)
 *   - Planetary Kp index (3-hour)
 *   - Solar wind (speed, density, Bz — ACE/DSCOVR real-time)
 *   - Solar flare events (recent)
 *   - Geomagnetic storm alerts
 *   - Solar energetic particle flux
 */

import { createHash } from 'crypto';
import { mkdirSync, existsSync, readFileSync, writeFileSync, readdirSync, statSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..', '..');
const STATE_DIR = process.env.STATE_DIR || join(REPO_ROOT, 'observatory', 'state');
const RAW_DIR = process.env.RAW_DIR || join(REPO_ROOT, 'observatory', 'raw', 'solar');

// ═══════════════════════════════════════════════════════════════════════════════
// [01] IDENTITY KERNEL — Immutable. Never modified at runtime.
// ═══════════════════════════════════════════════════════════════════════════════
const IDENTITY = Object.freeze({
  name: 'observatory-solar-swpc-collector',
  version: '1.0.0',
  author: 'Andrews, Ronald Jason — DarkWave Studios LLC',
  architecture: 'DDA 42-Doctrine / Deterministic Dissolution Ladder',
  source: 'NOAA Space Weather Prediction Center (SWPC)',
  domain: 'solar-geophysical',
  dataType: 'solar-wind-xray-kp-flares',
  rawPath: 'observatory/raw/solar/',
  manifestPath: 'observatory/state/solar-manifest.jsonl',
  maxConsecutiveFailures: 5,
});

// ═══════════════════════════════════════════════════════════════════════════════
// [13] CONSTRAINT ENGINE — SWPC product endpoints
// ═══════════════════════════════════════════════════════════════════════════════
const PRODUCTS = Object.freeze([
  {
    id: 'xray-flux',
    name: 'GOES X-Ray Flux (1-min)',
    url: 'https://services.swpc.noaa.gov/json/goes/primary/xrays-1-day.json',
    description: 'GOES XRS 0.1-0.8nm X-ray flux — solar flare detection',
  },
  {
    id: 'kp-index',
    name: 'Planetary Kp Index',
    url: 'https://services.swpc.noaa.gov/json/planetary_k_index_1m.json',
    description: 'Planetary Kp geomagnetic activity index — 1-minute estimated',
  },
  {
    id: 'solar-wind-mag',
    name: 'GOES Electron Flux (solar wind proxy)',
    url: 'https://services.swpc.noaa.gov/json/goes/primary/differential-electrons-1-day.json',
    description: 'GOES differential electron flux — solar wind/magnetosphere coupling indicator',
  },
  {
    id: 'solar-wind-plasma',
    name: 'GOES Proton Flux (high-energy proxy)',
    url: 'https://services.swpc.noaa.gov/json/goes/primary/integral-protons-6-hour.json',
    description: 'GOES high-energy proton flux 6-hour window — solar wind particle proxy',
  },
  {
    id: 'flare-events',
    name: 'Recent Solar Flare Events',
    url: 'https://services.swpc.noaa.gov/json/goes/primary/xray-flares-latest.json',
    description: 'Recent classified X-ray flare events (C/M/X class)',
  },
  {
    id: 'geomag-alerts',
    name: 'Geomagnetic Storm Alerts',
    url: 'https://services.swpc.noaa.gov/products/alerts.json',
    description: 'SWPC alerts, watches, and warnings for geomagnetic storms',
  },
  {
    id: 'particle-flux',
    name: 'Energetic Particle Flux',
    url: 'https://services.swpc.noaa.gov/json/goes/primary/integral-protons-1-day.json',
    description: 'GOES integral proton flux ≥10/≥50/≥100 MeV — solar particle events',
  },
]);

const CONFIG = Object.freeze({
  maxRetries: 3,
  retryDelayMs: 2000,
  timeoutMs: 20000,
  delayBetweenProducts: 500, // ms between requests to avoid hammering SWPC
});

// ═══════════════════════════════════════════════════════════════════════════════
// [22] CONTINUITY LAYER — Append-only manifest
// ═══════════════════════════════════════════════════════════════════════════════
function manifestPath() {
  mkdirSync(STATE_DIR, { recursive: true });
  return join(STATE_DIR, 'solar-manifest.jsonl');
}

function appendManifest(entry) {
  const line = JSON.stringify({ ...entry, writtenAt: new Date().toISOString() }) + '\n';
  writeFileSync(manifestPath(), line, { flag: 'a' });
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
      reason: result.error || 'Empty response from SWPC',
      httpStatus: result.status,
    });
    console.log(`    [GAP] ${product.id}: ${result.error || result.status}`);
    return false;
  }

  // Save raw response
  const productDir = join(RAW_DIR, dateStr, product.id);
  mkdirSync(productDir, { recursive: true });
  const filename = `${product.id}-${now.toISOString().replace(/[:.]/g, '-')}.json`;
  writeFileSync(join(productDir, filename), result.body);

  // Parse to extract summary stats
  let recordCount = 0;
  try {
    const parsed = JSON.parse(result.body);
    recordCount = Array.isArray(parsed) ? parsed.length : 1;
  } catch {}

  appendManifest({
    type: 'SOLAR-PRODUCT',
    productId: product.id,
    productName: product.name,
    description: product.description,
    source: IDENTITY.source,
    domain: IDENTITY.domain,
    sourceUrl: product.url,
    localPath: `observatory/raw/solar/${dateStr}/${product.id}/${filename}`,
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
// MAIN COLLECTION CYCLE
// ═══════════════════════════════════════════════════════════════════════════════
async function runCycle() {
  const now = new Date();
  const dateStr = `${now.getUTCFullYear()}-${(now.getUTCMonth() + 1).toString().padStart(2, '0')}-${now.getUTCDate().toString().padStart(2, '0')}`;
  console.log(`\n[SOLAR] Cycle start — ${now.toISOString()}`);

  let successes = 0, failures = 0;

  for (const product of PRODUCTS) {
    const ok = await collectProduct(product, dateStr, now);
    if (ok) successes++; else failures++;
    // Rate-limit between requests
    await new Promise(r => setTimeout(r, CONFIG.delayBetweenProducts));
  }

  console.log(`[SOLAR] Cycle complete — ${successes}/${PRODUCTS.length} products collected, ${failures} gaps`);

  if (failures === PRODUCTS.length) {
    consecutiveFailures++;
    console.warn(`[SOLAR] All products failed. Consecutive failure count: ${consecutiveFailures}/${IDENTITY.maxConsecutiveFailures}`);
    if (consecutiveFailures >= IDENTITY.maxConsecutiveFailures) {
      console.error('[SOLAR] [35] COLLAPSE DETECTED — halting collector. Check SWPC connectivity.');
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
  console.error('[SOLAR] [42] DEVOID LIMIT — uncaught exception:', err.message);
  appendManifest({ type: 'FATAL-ERROR', error: err.message, at: new Date().toISOString() });
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('[SOLAR] [42] DEVOID LIMIT — unhandled rejection:', reason);
  appendManifest({ type: 'FATAL-ERROR', error: String(reason), at: new Date().toISOString() });
  process.exit(1);
});

// ═══════════════════════════════════════════════════════════════════════════════
// ENTRYPOINT
// ═══════════════════════════════════════════════════════════════════════════════
const INTERVAL_MS = parseInt(process.env.SOLAR_INTERVAL_MS || '900000', 10); // 15 min default

console.log('═══════════════════════════════════════════════════════════════');
console.log(' TRUTH Observatory — NOAA SWPC Solar Collector v1.0.0');
console.log(` Architecture: ${IDENTITY.architecture}`);
console.log(` Products: ${PRODUCTS.length} (${PRODUCTS.map(p => p.id).join(', ')})`);
console.log(` Interval: ${INTERVAL_MS / 1000}s`);
console.log(` Raw output: ${RAW_DIR}`);
console.log(` Manifest: ${manifestPath()}`);
console.log('═══════════════════════════════════════════════════════════════');

await runCycle();
setInterval(runCycle, INTERVAL_MS);
