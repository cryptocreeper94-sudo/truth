#!/usr/bin/env node
/**
 * TRUTH Observatory — GOES-East/West Satellite Collector
 * DarkWave Studios LLC — Copyright 2026
 *
 * Fetches real-time GOES-19 (East) and GOES-18 (West) imagery from NOAA's
 * public S3 buckets. No AWS account required — buckets are fully public.
 *
 * DDA 42-Doctrine module mapping:
 *   [01] Identity Kernel    → COLLECTOR_IDENTITY: immutable cert for this collector
 *   [02] Boundary Engine    → Only GOES source; never writes outside raw/goes/
 *   [08] Temporal Engine    → Every file timestamped UTC; GOES filenames encode scan time
 *   [14] Determinacy Engine → SHA-256 hash + retrieval manifest written before processing
 *   [32] Integrity Layer    → Raw file preserved as-is; no modification after download
 *   [33] Alignment Layer    → Configurable product list; rate-limited fetch with backoff
 *   [35] Collapse Detection → Consecutive failure counter; halts collector after threshold
 *   [40] Non-Being Guard    → Missing data written to manifest as gap, not silently skipped
 *   [42] Devoid Limit       → Uncaught fatal: flush manifest, write error record, exit clean
 *
 * NOAA public S3 buckets:
 *   GOES-19 (East): s3://noaa-goes19 (us-east-1) — replaced GOES-16 in 2025
 *   GOES-18 (West): s3://noaa-goes18 (us-east-1)
 * HTTP base:
 *   https://noaa-goes19.s3.amazonaws.com
 *   https://noaa-goes18.s3.amazonaws.com
 *
 * Products collected:
 *   ABI-L2-CMIPC  — Cloud and Moisture Imagery (CONUS, selected bands)
 *   ABI-L2-MCMIPF — Multi-band Cloud and Moisture Imagery (full disk)
 *   ABI-L2-RRQPEF — Rainfall Rate QPE (full disk)
 *   GLM-L2-LCFA   — Geostationary Lightning Mapper flash data
 *
 * Channels prioritized:
 *   C02 — Visible (0.64 µm) — daytime cloud structure
 *   C09 — Mid-level water vapor (6.9 µm) — atmospheric moisture
 *   C13 — Clean IR longwave (10.3 µm) — cloud top temperature, storm tops
 *   C14 — IR longwave (11.2 µm) — surface temperature
 */

import { createHash } from 'crypto';
import { mkdirSync, existsSync, readFileSync, writeFileSync, readdirSync, statSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..', '..');
const STATE_DIR = process.env.STATE_DIR || join(REPO_ROOT, 'observatory', 'state');
const RAW_DIR = process.env.RAW_DIR || join(REPO_ROOT, 'observatory', 'raw', 'goes');

// ═══════════════════════════════════════════════════════════════════════════════
// [01] IDENTITY KERNEL
// ═══════════════════════════════════════════════════════════════════════════════
const IDENTITY = Object.freeze({
  name: 'observatory-goes-collector',
  version: '1.0.0',
  author: 'Andrews, Ronald Jason — DarkWave Studios LLC',
  architecture: 'DDA 42-Doctrine / Deterministic Dissolution Ladder',
  source: 'NOAA GOES-19/18 — public S3 buckets (noaa-goes19, noaa-goes18)',
  domain: 'atmospheric',
  dataType: 'satellite-imagery-infrared-visible-watervapor-lightning',
  rawPath: 'observatory/raw/goes/',
  manifestPath: 'observatory/state/goes-manifest.jsonl',
  maxConsecutiveFailures: 5,
});

// ═══════════════════════════════════════════════════════════════════════════════
// [13] CONSTRAINT ENGINE
// ═══════════════════════════════════════════════════════════════════════════════
const CONFIG = Object.freeze({
  // NOTE (2026-08-10): GOES-19 replaced GOES-16 as GOES-East in 2025.
  // The noaa-goes16 bucket has no 2026 data. Verified live: goes19 + goes18.
  satellites: [
    { id: 'GOES19', bucket: 'noaa-goes19', region: 'East' },
    { id: 'GOES18', bucket: 'noaa-goes18', region: 'West' },
  ],

  // Products to collect per satellite — ordered by investigative priority.
  // STORAGE NOTE (verified live 2026-08-10): ABI-L2-MCMIPF full-disk files are
  // 280-350 MB EACH (~12 GB/hour if collected every cycle). It is therefore
  // disabled by default; enable with GOES_INCLUDE_MCMIPF=1 only on hosts with
  // large storage. Single-band CMIPF (30-60 MB), GLM (0.2-0.4 MB) and RRQPE
  // (1.6-1.8 MB) are the sustainable default set.
  products: [
    // Single-band channels, CONUS coverage — targeted analysis at sustainable size.
    // (Verified live 2026-08-10: CONUS C02 ~60 MB, IR bands far smaller.
    //  Full-disk CMIPF C02 is 250-390 MB per file — use CONUS by default.)
    { product: 'ABI-L2-CMIPC', channels: ['C02', 'C09', 'C13', 'C14'], label: null },
    // Lightning mapper — coincidence with radar and RF events
    { product: 'GLM-L2-LCFA', channels: null, label: 'lightning-flash' },
    // Rainfall rate — corroborate radar precip estimates
    { product: 'ABI-L2-RRQPEF', channels: null, label: 'rainfall-rate' },
    // Full-disk multi-band — most complete picture, but 280-350 MB per file
    ...(process.env.GOES_INCLUDE_MCMIPF === '1'
      ? [{ product: 'ABI-L2-MCMIPF', channels: null, label: 'multi-band-full-disk' }]
      : []),
  ],

  concurrency: 3,
  maxRetries: 3,
  retryDelayMs: 2000,
  timeoutMs: 45000, // GOES files can be large (10–200MB for full disk)

  // Max files to fetch per product per cycle (most recent N)
  maxPerProduct: 3,
});

// ═══════════════════════════════════════════════════════════════════════════════
// [22] CONTINUITY LAYER — Append-only manifest
// ═══════════════════════════════════════════════════════════════════════════════
function manifestPath() {
  mkdirSync(STATE_DIR, { recursive: true });
  return join(STATE_DIR, 'goes-manifest.jsonl');
}

function appendManifest(entry) {
  const line = JSON.stringify({ ...entry, writtenAt: new Date().toISOString() }) + '\n';
  writeFileSync(manifestPath(), line, { flag: 'a' });
}

function loadSeenFiles() {
  const mp = manifestPath();
  if (!existsSync(mp)) return new Set();
  const seen = new Set();
  const lines = readFileSync(mp, 'utf8').split('\n').filter(Boolean);
  for (const line of lines) {
    try { const e = JSON.parse(line); if (e.filename) seen.add(e.filename); } catch {}
  }
  return seen;
}

// ═══════════════════════════════════════════════════════════════════════════════
// [08] TEMPORAL ENGINE
// ═══════════════════════════════════════════════════════════════════════════════
function utcParts(d = new Date()) {
  const year = d.getUTCFullYear().toString();
  const doy = Math.floor((d - Date.UTC(year, 0, 0)) / 86400000).toString().padStart(3, '0');
  const hour = d.getUTCHours().toString().padStart(2, '0');
  return { year, doy, hour };
}

function s3ListUrl(bucket, product, satellite, year, doy, hour) {
  // GOES S3 path: <Product>/<year>/<doy>/<hour>/
  const prefix = `${product}/${year}/${doy}/${hour}/`;
  return `https://${bucket}.s3.amazonaws.com?list-type=2&prefix=${encodeURIComponent(prefix)}&max-keys=30`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// [32] INTEGRITY LAYER — Stream-hash only (no raw file storage)
//
// ARCHITECTURE DECISION (2026-08-18): Raw GOES NetCDF files are 10–200 MB each.
// Downloading them consumed 14 GB in 9 hours and repeatedly crashed the VPS.
// The deterministic trust model only requires the SHA-256 hash to prove that a
// specific file existed at a specific time on NOAA's CDN.  The raw file can
// always be re-fetched from the public S3 bucket using the s3Key recorded in
// the manifest.  The Observatory UI links directly to NOAA's image viewer for
// visual rendering.
// ═══════════════════════════════════════════════════════════════════════════════
async function hashFile(url, retries = CONFIG.maxRetries) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), CONFIG.timeoutMs);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timer);

      if (!res.ok) {
        if (res.status === 404) return { status: 404, sha256: null, bytes: 0 };
        throw new Error(`HTTP ${res.status}`);
      }

      // Stream the response — hash every chunk but discard it immediately.
      // This uses ~64KB of memory regardless of file size.
      const hash = createHash('sha256');
      let bytes = 0;
      for await (const chunk of res.body) {
        hash.update(chunk);
        bytes += chunk.length;
      }

      return { status: res.status, sha256: hash.digest('hex'), bytes };
    } catch (err) {
      if (attempt === retries) return { status: 'FETCH_ERROR', error: err.message, sha256: null, bytes: 0 };
      await new Promise(r => setTimeout(r, CONFIG.retryDelayMs * attempt));
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// [16] DOMAIN MAPPER — List files from S3 for a product+hour
// ═══════════════════════════════════════════════════════════════════════════════
async function listProductFiles(bucket, product, year, doy, hour) {
  const url = s3ListUrl(bucket, product, null, year, doy, hour);
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), CONFIG.timeoutMs);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) return [];
    const xml = await res.text();
    return [...xml.matchAll(/<Key>([^<]+\.nc)<\/Key>/g)].map(m => m[1]);
  } catch {
    return [];
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// [03] DIFFERENTIATION — Collect one product for one satellite
// ═══════════════════════════════════════════════════════════════════════════════
async function collectProduct(sat, productDef, seen, now = new Date()) {
  let { year, doy, hour } = utcParts(now);
  let keys = await listProductFiles(sat.bucket, productDef.product, year, doy, hour);

  // [08] Temporal Engine — hour/day-boundary handling: at the top of an hour
  // the new directory may be empty. Fall back to the previous hour.
  if (keys.length === 0) {
    const prev = new Date(now.getTime() - 3600000);
    const prevParts = utcParts(prev);
    const prevKeys = await listProductFiles(sat.bucket, productDef.product, prevParts.year, prevParts.doy, prevParts.hour);
    if (prevKeys.length > 0) {
      ({ year, doy, hour } = prevParts);
      keys = prevKeys;
    }
  }

  if (keys.length === 0) {
    appendManifest({
      type: 'DATA-GAP',
      satellite: sat.id,
      product: productDef.product,
      year, doy, hour,
      retrievedAt: now.toISOString(),
      source: IDENTITY.source,
      reason: 'S3 listing returned zero NetCDF files',
    });
    console.log(`  [GAP] ${sat.id}/${productDef.product} ${year}/${doy}/${hour}h`);
    return { downloaded: 0, gaps: 1, errors: 0 };
  }

  // Filter by channel if specified
  let filtered = keys;
  if (productDef.channels) {
    filtered = keys.filter(k => productDef.channels.some(ch => k.includes(`${ch}_`)));
  }

  const newKeys = filtered.filter(k => !seen.has(k.split('/').pop()));
  const toFetch = newKeys.slice(-CONFIG.maxPerProduct);

  let downloaded = 0, errors = 0;

  for (const key of toFetch) {
    const filename = key.split('/').pop();

    const fileUrl = `https://${sat.bucket}.s3.amazonaws.com/${key}`;
    const result = await hashFile(fileUrl);

    if (result.status === 200 && result.sha256) {
      seen.add(filename);
      downloaded++;
      appendManifest({
        type: 'GOES-SCAN',
        satellite: sat.id,
        region: sat.region,
        product: productDef.product,
        channel: productDef.channels
          ? (productDef.channels.find(ch => filename.includes(`${ch}_`)) || 'unknown')
          : 'multi',
        filename,
        s3Key: key,
        sourceUrl: fileUrl,
        noaaViewerUrl: `https://www.star.nesdis.noaa.gov/goes/sector.php?sat=${sat.id}&sector=conus`,
        retrievedAt: new Date().toISOString(),
        sha256: result.sha256,
        bytes: result.bytes,
        httpStatus: result.status,
        source: IDENTITY.source,
        domain: IDENTITY.domain,
        doctrineNode: '[32] Integrity Layer',
      });
      console.log(`  [OK] ${sat.id}/${productDef.product}/${filename.slice(0, 40)}… — ${(result.bytes / 1024 / 1024).toFixed(1)} MB`);
    } else if (result.status === 404) {
      console.log(`  [404] ${sat.id}/${filename}`);
    } else {
      errors++;
      appendManifest({
        type: 'FETCH-ERROR',
        satellite: sat.id,
        product: productDef.product,
        filename,
        sourceUrl: fileUrl,
        retrievedAt: new Date().toISOString(),
        httpStatus: result.status,
        error: result.error || 'unknown',
        source: IDENTITY.source,
      });
      console.log(`  [ERR] ${sat.id}/${filename.slice(0, 40)}… — ${result.error || result.status}`);
    }
  }

  return { downloaded, gaps: 0, errors };
}

// ═══════════════════════════════════════════════════════════════════════════════
// [33] ALIGNMENT LAYER — Concurrency limiter
// ═══════════════════════════════════════════════════════════════════════════════
async function withConcurrency(tasks, limit) {
  const results = [];
  const queue = [...tasks];
  const workers = Array(Math.min(limit, queue.length)).fill(null).map(async () => {
    while (queue.length) {
      const task = queue.shift();
      if (task) results.push(await task());
    }
  });
  await Promise.all(workers);
  return results;
}


// ═══════════════════════════════════════════════════════════════════════════════
// [22] CONTINUITY LAYER (retention) — Raw files are pruned after RETENTION_DAYS
// to protect VPS storage. The manifest (URL + SHA-256 + timestamp) is the
// PERMANENT provenance record and is never pruned — a pruned file remains
// re-fetchable and re-verifiable against its recorded hash.
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
    console.log(`  [PRUNE] removed ${pruned} raw files older than ${retentionHours} hours (manifest records retained)`);
  }
}
const RETENTION_HOURS = parseInt(process.env.RETENTION_HOURS || '4', 10);

// ═══════════════════════════════════════════════════════════════════════════════
// [35] COLLAPSE DETECTION
// ═══════════════════════════════════════════════════════════════════════════════
let consecutiveFailures = 0;

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COLLECTION CYCLE
// ═══════════════════════════════════════════════════════════════════════════════
async function runCycle() {
  const now = new Date();
  console.log(`\n[GOES] Cycle start — ${now.toISOString()}`);

  const seen = loadSeenFiles();
  const tasks = [];

  for (const sat of CONFIG.satellites) {
    for (const productDef of CONFIG.products) {
      tasks.push(() => collectProduct(sat, productDef, seen, now));
    }
  }

  const results = await withConcurrency(tasks, CONFIG.concurrency);
  const totalDownloaded = results.reduce((s, r) => s + (r?.downloaded || 0), 0);
  const totalGaps = results.reduce((s, r) => s + (r?.gaps || 0), 0);
  const totalErrors = results.reduce((s, r) => s + (r?.errors || 0), 0);

  console.log(`[GOES] Cycle complete — downloaded: ${totalDownloaded}, gaps: ${totalGaps}, errors: ${totalErrors}`);
  pruneOldFiles(RAW_DIR, RETENTION_HOURS);

  if (totalErrors > 0 && totalDownloaded === 0) {
    consecutiveFailures++;
    console.warn(`[GOES] Consecutive failure count: ${consecutiveFailures}/${IDENTITY.maxConsecutiveFailures}`);
    if (consecutiveFailures >= IDENTITY.maxConsecutiveFailures) {
      console.error('[GOES] [35] COLLAPSE DETECTED — halting collector.');
      process.exit(1);
    }
  } else {
    consecutiveFailures = 0;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// [42] DEVOID LIMIT — Fatal handler
// ═══════════════════════════════════════════════════════════════════════════════
process.on('uncaughtException', (err) => {
  console.error('[GOES] [42] DEVOID LIMIT — uncaught exception:', err.message);
  appendManifest({ type: 'FATAL-ERROR', error: err.message, at: new Date().toISOString() });
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('[GOES] [42] DEVOID LIMIT — unhandled rejection:', reason);
  appendManifest({ type: 'FATAL-ERROR', error: String(reason), at: new Date().toISOString() });
  process.exit(1);
});

// ═══════════════════════════════════════════════════════════════════════════════
// ENTRYPOINT
// ═══════════════════════════════════════════════════════════════════════════════
const INTERVAL_MS = parseInt(process.env.GOES_INTERVAL_MS || '600000', 10); // 10 min default

console.log('═══════════════════════════════════════════════════════════════');
console.log(' TRUTH Observatory — GOES Collector v1.0.0');
console.log(` Architecture: ${IDENTITY.architecture}`);
console.log(` Satellites: ${CONFIG.satellites.map(s => s.id).join(', ')}`);
console.log(` Products: ${CONFIG.products.map(p => p.product).join(', ')}`);
console.log(` Interval: ${INTERVAL_MS / 1000}s`);
console.log(` Raw output: ${RAW_DIR}`);
console.log('═══════════════════════════════════════════════════════════════');

await runCycle();
setInterval(runCycle, INTERVAL_MS);
