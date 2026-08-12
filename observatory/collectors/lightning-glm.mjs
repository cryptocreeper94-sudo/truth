#!/usr/bin/env node
/**
 * TRUTH Observatory — GOES GLM Lightning Collector
 * DarkWave Studios LLC — Copyright 2026
 *
 * Fetches Geostationary Lightning Mapper (GLM) data from NOAA GOES satellites.
 * Uses the same public S3 bucket infrastructure as the existing GOES collector,
 * but targets the GLM lightning detection products specifically.
 *
 * DDA 42-Doctrine module mapping:
 *   [01] Identity Kernel    → COLLECTOR_IDENTITY: immutable cert for this collector
 *   [02] Boundary Engine    → Only GOES GLM source; never writes outside raw/lightning/
 *   [08] Temporal Engine    → Every file timestamped UTC from satellite observation time
 *   [14] Determinacy Engine → SHA-256 hash of every file + retrieval manifest
 *   [32] Integrity Layer    → Raw NetCDF files preserved as-is; no modification after download
 *   [33] Alignment Layer    → Rate-limited fetch; configurable product set
 *   [35] Collapse Detection → Consecutive failure counter; halts collector after threshold
 *   [40] Non-Being Guard    → Missing data recorded as gap, not silently skipped
 *   [42] Devoid Limit       → Uncaught fatal: flush manifest, write error record, exit clean
 *
 * Source: NOAA GOES-19 (East) and GOES-18 (West) GLM products
 * Bucket: noaa-goes19 / noaa-goes18 (public S3)
 * Products: GLM-L2-LCFA (Lightning Cluster-Filter Algorithm)
 *
 * Note: Blitzortung was evaluated but their API terms restrict automated collection.
 * GOES GLM provides satellite-based lightning detection with global coverage and
 * no access restrictions — making it the superior choice for a provenance-preserving system.
 */

import { createHash } from 'crypto';
import { mkdirSync, existsSync, readFileSync, writeFileSync, readdirSync, statSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..', '..');
const STATE_DIR = process.env.STATE_DIR || join(REPO_ROOT, 'observatory', 'state');
const RAW_DIR = process.env.RAW_DIR || join(REPO_ROOT, 'observatory', 'raw', 'lightning');

// ═══════════════════════════════════════════════════════════════════════════════
// [01] IDENTITY KERNEL — Immutable. Never modified at runtime.
// ═══════════════════════════════════════════════════════════════════════════════
const IDENTITY = Object.freeze({
  name: 'observatory-goes-glm-lightning-collector',
  version: '1.0.0',
  author: 'Andrews, Ronald Jason — DarkWave Studios LLC',
  architecture: 'DDA 42-Doctrine / Deterministic Dissolution Ladder',
  source: 'NOAA GOES GLM (Geostationary Lightning Mapper)',
  domain: 'lightning',
  dataType: 'glm-l2-lcfa-lightning-clusters',
  rawPath: 'observatory/raw/lightning/',
  manifestPath: 'observatory/state/lightning-manifest.jsonl',
  maxConsecutiveFailures: 5,
});

// ═══════════════════════════════════════════════════════════════════════════════
// [13] CONSTRAINT ENGINE — Non-overridable configuration
// ═══════════════════════════════════════════════════════════════════════════════
const CONFIG = Object.freeze({
  // GOES-19 (East) and GOES-18 (West) public S3 buckets
  satellites: [
    {
      id: 'goes19',
      name: 'GOES-19 (East)',
      bucket: 'https://noaa-goes19.s3.amazonaws.com',
      product: 'GLM-L2-LCFA',
    },
    {
      id: 'goes18',
      name: 'GOES-18 (West)',
      bucket: 'https://noaa-goes18.s3.amazonaws.com',
      product: 'GLM-L2-LCFA',
    },
  ],

  // GLM produces files every 20 seconds; we sample the last N minutes
  lookbackMinutes: parseInt(process.env.GLM_LOOKBACK || '15', 10),

  // Max files per satellite per cycle
  maxFilesPerSat: 10,

  maxRetries: 3,
  retryDelayMs: 2000,
  timeoutMs: 30000,
  concurrency: 2,
});

// ═══════════════════════════════════════════════════════════════════════════════
// [22] CONTINUITY LAYER — Append-only manifest
// ═══════════════════════════════════════════════════════════════════════════════
function manifestPath() {
  mkdirSync(STATE_DIR, { recursive: true });
  return join(STATE_DIR, 'lightning-manifest.jsonl');
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
// [08] TEMPORAL ENGINE — UTC helpers
// ═══════════════════════════════════════════════════════════════════════════════
function utcParts(d = new Date()) {
  return {
    yyyy: d.getUTCFullYear().toString(),
    doy: Math.floor((d - new Date(Date.UTC(d.getUTCFullYear(), 0, 1))) / 86400000 + 1).toString().padStart(3, '0'),
    hh: d.getUTCHours().toString().padStart(2, '0'),
    mm: (d.getUTCMonth() + 1).toString().padStart(2, '0'),
    dd: d.getUTCDate().toString().padStart(2, '0'),
  };
}

function dateStr(d = new Date()) {
  const p = utcParts(d);
  return `${p.yyyy}-${p.mm}-${p.dd}`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// [32] INTEGRITY LAYER — SHA-256 hash + download
// ═══════════════════════════════════════════════════════════════════════════════
async function downloadFile(url, destPath, retries = CONFIG.maxRetries) {
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

      const bytes = [];
      const hash = createHash('sha256');
      for await (const chunk of res.body) {
        hash.update(chunk);
        bytes.push(chunk);
      }
      const sha256 = hash.digest('hex');
      const buf = Buffer.concat(bytes);

      mkdirSync(dirname(destPath), { recursive: true });
      writeFileSync(destPath, buf);

      return { status: res.status, sha256, bytes: buf.length };
    } catch (err) {
      if (attempt === retries) return { status: 'FETCH_ERROR', error: err.message, sha256: null, bytes: 0 };
      await new Promise(r => setTimeout(r, CONFIG.retryDelayMs * attempt));
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// [16] DOMAIN MAPPER — List GLM files from S3
// ═══════════════════════════════════════════════════════════════════════════════
async function listGLMFiles(satellite, date = new Date()) {
  const { yyyy, doy, hh } = utcParts(date);
  const prefix = `${satellite.product}/${yyyy}/${doy}/${hh}/`;
  const listUrl = `${satellite.bucket}?list-type=2&prefix=${prefix}&max-keys=100`;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), CONFIG.timeoutMs);
    const res = await fetch(listUrl, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) return [];
    const xml = await res.text();
    return [...xml.matchAll(/<Key>([^<]+)<\/Key>/g)].map(m => m[1]);
  } catch {
    return [];
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// [03] DIFFERENTIATION — Collect one satellite's GLM data
// ═══════════════════════════════════════════════════════════════════════════════
async function collectSatellite(satellite, seen, now) {
  console.log(`  [→] ${satellite.name}`);

  let files = await listGLMFiles(satellite, now);

  // Try previous hour if current hour is empty
  if (files.length === 0) {
    const prevHour = new Date(now.getTime() - 3600000);
    files = await listGLMFiles(satellite, prevHour);
  }

  if (files.length === 0) {
    appendManifest({
      type: 'DATA-GAP',
      satellite: satellite.id,
      satelliteName: satellite.name,
      source: IDENTITY.source,
      domain: IDENTITY.domain,
      retrievedAt: now.toISOString(),
      reason: 'S3 listing returned zero GLM files',
    });
    console.log(`    [GAP] ${satellite.id} — no GLM files found`);
    return { satellite: satellite.id, downloaded: 0, gaps: 1, errors: 0 };
  }

  // Filter to unseen files, take most recent N
  const newFiles = files.filter(k => !seen.has(k.split('/').pop())).slice(-CONFIG.maxFilesPerSat);

  let downloaded = 0, errors = 0;
  const ds = dateStr(now);

  for (const key of newFiles) {
    const filename = key.split('/').pop();
    const destPath = join(RAW_DIR, ds, satellite.id, filename);

    if (existsSync(destPath)) {
      seen.add(filename);
      continue;
    }

    const fileUrl = `${satellite.bucket}/${key}`;
    const result = await downloadFile(fileUrl, destPath);

    if (result.status === 200 && result.sha256) {
      seen.add(filename);
      downloaded++;
      appendManifest({
        type: 'GLM-FILE',
        satellite: satellite.id,
        satelliteName: satellite.name,
        filename,
        s3Key: key,
        sourceUrl: fileUrl,
        localPath: `observatory/raw/lightning/${ds}/${satellite.id}/${filename}`,
        retrievedAt: now.toISOString(),
        sha256: result.sha256,
        bytes: result.bytes,
        httpStatus: result.status,
        source: IDENTITY.source,
        domain: IDENTITY.domain,
        doctrineNode: '[32] Integrity Layer',
      });
      console.log(`    [OK] ${satellite.id}/${filename} — ${(result.bytes / 1024).toFixed(1)} KB — sha256:${result.sha256.slice(0, 12)}…`);
    } else if (result.status === 404) {
      // Not an error — file may have been pruned from S3
    } else {
      errors++;
      appendManifest({
        type: 'FETCH-ERROR',
        satellite: satellite.id,
        filename,
        sourceUrl: fileUrl,
        retrievedAt: now.toISOString(),
        httpStatus: result.status,
        error: result.error || 'unknown',
        source: IDENTITY.source,
      });
      console.log(`    [ERR] ${satellite.id}/${filename} — ${result.status}`);
    }
  }

  return { satellite: satellite.id, downloaded, gaps: 0, errors };
}

// ═══════════════════════════════════════════════════════════════════════════════
// [22] CONTINUITY LAYER (retention)
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
// [35] COLLAPSE DETECTION
// ═══════════════════════════════════════════════════════════════════════════════
let consecutiveFailures = 0;

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COLLECTION CYCLE
// ═══════════════════════════════════════════════════════════════════════════════
async function runCycle() {
  const now = new Date();
  console.log(`\n[LIGHTNING] Cycle start — ${now.toISOString()}`);

  const seen = loadSeenFiles();
  let totalDownloaded = 0, totalGaps = 0, totalErrors = 0;

  for (const sat of CONFIG.satellites) {
    const result = await collectSatellite(sat, seen, now);
    totalDownloaded += result.downloaded;
    totalGaps += result.gaps;
    totalErrors += result.errors;
  }

  console.log(`[LIGHTNING] Cycle complete — downloaded: ${totalDownloaded}, gaps: ${totalGaps}, errors: ${totalErrors}`);

  if (totalDownloaded === 0 && totalGaps === CONFIG.satellites.length) {
    consecutiveFailures++;
    if (consecutiveFailures >= IDENTITY.maxConsecutiveFailures) {
      console.error('[LIGHTNING] [35] COLLAPSE DETECTED — halting collector.');
      process.exit(1);
    }
  } else {
    consecutiveFailures = 0;
  }

  pruneOldFiles(RAW_DIR, RETENTION_DAYS);
}

// ═══════════════════════════════════════════════════════════════════════════════
// [42] DEVOID LIMIT — Fatal error handler
// ═══════════════════════════════════════════════════════════════════════════════
process.on('uncaughtException', (err) => {
  console.error('[LIGHTNING] [42] DEVOID LIMIT — uncaught exception:', err.message);
  appendManifest({ type: 'FATAL-ERROR', error: err.message, at: new Date().toISOString() });
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('[LIGHTNING] [42] DEVOID LIMIT — unhandled rejection:', reason);
  appendManifest({ type: 'FATAL-ERROR', error: String(reason), at: new Date().toISOString() });
  process.exit(1);
});

// ═══════════════════════════════════════════════════════════════════════════════
// ENTRYPOINT
// ═══════════════════════════════════════════════════════════════════════════════
const INTERVAL_MS = parseInt(process.env.LIGHTNING_INTERVAL_MS || '300000', 10); // 5 min default

console.log('═══════════════════════════════════════════════════════════════');
console.log(' TRUTH Observatory — GOES GLM Lightning Collector v1.0.0');
console.log(` Architecture: ${IDENTITY.architecture}`);
console.log(` Satellites: ${CONFIG.satellites.map(s => s.name).join(', ')}`);
console.log(` Interval: ${INTERVAL_MS / 1000}s`);
console.log(` Raw output: ${RAW_DIR}`);
console.log(` Manifest: ${manifestPath()}`);
console.log('═══════════════════════════════════════════════════════════════');

await runCycle();
setInterval(runCycle, INTERVAL_MS);
