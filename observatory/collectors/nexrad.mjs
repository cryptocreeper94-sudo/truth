#!/usr/bin/env node
/**
 * TRUTH Observatory — NEXRAD Level II Collector
 * DarkWave Studios LLC — Copyright 2026
 *
 * Fetches real-time NEXRAD Level II radar data from the NOAA public S3 bucket.
 * No AWS account required — the bucket is public (requester-pays disabled for listing).
 *
 * DDA 42-Doctrine module mapping:
 *   [01] Identity Kernel    → COLLECTOR_IDENTITY: immutable cert for this collector
 *   [02] Boundary Engine    → Only NEXRAD source; never writes outside raw/nexrad/
 *   [08] Temporal Engine    → Every file timestamped UTC; filenames encode scan time
 *   [14] Determinacy Engine → SHA-256 hash + retrieval manifest written before processing
 *   [32] Integrity Layer    → Raw file preserved as-is; no modification after download
 *   [33] Alignment Layer    → Configurable site list; rate-limited fetch with backoff
 *   [35] Collapse Detection → Consecutive failure counter; halts collector after threshold
 *   [40] Non-Being Guard    → Missing data written to manifest as gap, not silently skipped
 *   [42] Devoid Limit       → Uncaught fatal: flush manifest, write error record, exit clean
 *
 * Bucket: unidata-nexrad-level2 (Unidata mirror of NOAA Level II archive)
 * HTTP base: https://unidata-nexrad-level2.s3.amazonaws.com
 * (NOAA primary noaa-nexrad-level2 denies anonymous listing as of 2026-08)
 * Path format: <YYYY>/<MM>/<DD>/<SITE>/<SITE><YYYYMMDD>_<HHMMSS>_V06
 *
 * Data format: NEXRAD Level II (Archive II), binary, 10–30 MB per volume scan
 * Coverage: ~160 CONUS sites, 4–10 minute scan intervals
 */

import { createHash } from 'crypto';
import { mkdirSync, existsSync, readFileSync, writeFileSync, readdirSync, statSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..', '..');
const STATE_DIR = process.env.STATE_DIR || join(REPO_ROOT, 'observatory', 'state');
const RAW_DIR = process.env.RAW_DIR || join(REPO_ROOT, 'observatory', 'raw', 'nexrad');

// ═══════════════════════════════════════════════════════════════════════════════
// [01] IDENTITY KERNEL — Immutable. Never modified at runtime.
// ═══════════════════════════════════════════════════════════════════════════════
const IDENTITY = Object.freeze({
  name: 'observatory-nexrad-collector',
  version: '1.0.0',
  author: 'Andrews, Ronald Jason — DarkWave Studios LLC',
  architecture: 'DDA 42-Doctrine / Deterministic Dissolution Ladder',
  source: 'NOAA NEXRAD Level II — public S3 bucket (noaa-nexrad-level2)',
  domain: 'atmospheric',
  dataType: 'radar-reflectivity-velocity-spectrum',
  rawPath: 'observatory/raw/nexrad/',
  manifestPath: 'observatory/state/nexrad-manifest.jsonl',
  maxConsecutiveFailures: 5,
});

// ═══════════════════════════════════════════════════════════════════════════════
// [13] CONSTRAINT ENGINE — Non-overridable configuration
// ═══════════════════════════════════════════════════════════════════════════════
const CONFIG = Object.freeze({
  // S3 HTTP endpoint — no auth required.
  // NOTE (2026-08-10): the NOAA primary bucket (noaa-nexrad-level2) now returns
  // AccessDenied for anonymous listing. The Unidata mirror of the same Level II
  // archive allows anonymous list + GET and carries identical files.
  s3Base: process.env.NEXRAD_S3_BASE || 'https://unidata-nexrad-level2.s3.amazonaws.com',

  // Primary sites to monitor — chosen for geographic/event diversity
  // CONUS sites prioritized where infrastructure and weather-modification activity is high
  sites: (process.env.NEXRAD_SITES || [
    'KTLX', // Oklahoma City OK — tornado alley, high convective activity
    'KFWS', // Dallas/Fort Worth TX
    'KLVX', // Louisville KY — Ohio Valley
    'KMLB', // Melbourne FL — Gulf/Atlantic moisture
    'KVTX', // Los Angeles CA — western US
    'KRTX', // Portland OR — Pacific Northwest
    'KMAX', // Medford OR
    'KPUX', // Pueblo CO — Front Range
    'KCYS', // Cheyenne WY
    'KOAX', // Omaha NE
    'KARX', // La Crosse WI
    'KMKX', // Milwaukee WI
    'KDVN', // Quad Cities IL/IA
    'KLOT', // Chicago IL
    'KGRR', // Grand Rapids MI
    'KENX', // Albany NY
    'KBOX', // Boston MA
    'KDOX', // Dover DE — East Coast
    'KAMX', // Miami FL
    'KEVX',  // Eglin FL — Gulf Coast
  ].join(',')).split(',').map(s => s.trim().toUpperCase()),

  // How many scans back to fetch on startup (avoids re-downloading on restart)
  lookbackMinutes: 30,

  // Fetch concurrency — respect NOAA servers
  concurrency: 4,

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
  return join(STATE_DIR, 'nexrad-manifest.jsonl');
}

function appendManifest(entry) {
  const line = JSON.stringify({ ...entry, writtenAt: new Date().toISOString() }) + '\n';
  const mp = manifestPath();
  const { appendFileSync } = { appendFileSync: (p, d) => writeFileSync(p, d, { flag: 'a' }) };
  appendFileSync(mp, line);
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
// [08] TEMPORAL ENGINE — UTC date helpers
// ═══════════════════════════════════════════════════════════════════════════════
function utcParts(d = new Date()) {
  return {
    yyyy: d.getUTCFullYear().toString(),
    mm: (d.getUTCMonth() + 1).toString().padStart(2, '0'),
    dd: d.getUTCDate().toString().padStart(2, '0'),
    hh: d.getUTCHours().toString().padStart(2, '0'),
  };
}

function s3DirUrl(site, date = new Date()) {
  const { yyyy, mm, dd } = utcParts(date);
  return `${CONFIG.s3Base}?list-type=2&prefix=${yyyy}/${mm}/${dd}/${site}/&max-keys=50`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// [32] INTEGRITY LAYER — SHA-256 hash every raw file at download time
// ═══════════════════════════════════════════════════════════════════════════════
async function sha256Stream(readable) {
  const hash = createHash('sha256');
  for await (const chunk of readable) hash.update(chunk);
  return hash.digest('hex');
}

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
// [16] DOMAIN MAPPER — List available scans for a site from S3 XML listing
// ═══════════════════════════════════════════════════════════════════════════════
async function listScans(site, date = new Date()) {
  const url = s3DirUrl(site, date);
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), CONFIG.timeoutMs);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) return [];
    const xml = await res.text();
    // Extract <Key> values from S3 XML listing
    const keys = [...xml.matchAll(/<Key>([^<]+)<\/Key>/g)].map(m => m[1]);
    // Filter to Volume Coverage Pattern files (V06, V08 etc), exclude MDM
    return keys.filter(k => /V0\d$/.test(k) || /V0\d\.gz$/.test(k));
  } catch {
    return [];
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// [03] DIFFERENTIATION — Process one site; returns result summary
// ═══════════════════════════════════════════════════════════════════════════════
async function collectSite(site, seen, date = new Date()) {
  let { yyyy, mm, dd } = utcParts(date);
  let scans = await listScans(site, date);

  // [08] Temporal Engine — UTC day-boundary handling: shortly after 00:00 UTC
  // the new day's directory may not exist yet. Fall back to the previous day
  // so the collector never falsely reports a gap at midnight.
  if (scans.length === 0) {
    const prev = new Date(date.getTime() - 86400000);
    const prevScans = await listScans(site, prev);
    if (prevScans.length > 0) {
      ({ yyyy, mm, dd } = utcParts(prev));
      scans = prevScans;
    }
  }

  if (scans.length === 0) {
    // [40] Non-Being Guard — gap recorded explicitly
    const gapEntry = {
      type: 'DATA-GAP',
      site,
      date: `${yyyy}-${mm}-${dd}`,
      retrievedAt: new Date().toISOString(),
      source: IDENTITY.source,
      reason: 'S3 listing returned zero scan files',
    };
    appendManifest(gapEntry);
    console.log(`  [GAP] ${site} — no scans found for ${yyyy}-${mm}-${dd}`);
    return { site, downloaded: 0, gaps: 1, errors: 0 };
  }

  // Only fetch scans not already in manifest
  const newScans = scans.filter(k => {
    const filename = k.split('/').pop();
    return !seen.has(filename);
  });

  // Limit to most recent N scans per cycle to avoid bursting
  const toFetch = newScans.slice(-8);

  let downloaded = 0, errors = 0;

  for (const key of toFetch) {
    const filename = key.split('/').pop();
    const destPath = join(RAW_DIR, yyyy, mm, dd, site, filename);

    if (existsSync(destPath)) {
      seen.add(filename);
      continue;
    }

    const fileUrl = `${CONFIG.s3Base}/${key}`;
    const result = await downloadFile(fileUrl, destPath);

    if (result.status === 200 && result.sha256) {
      seen.add(filename);
      downloaded++;
      const entry = {
        type: 'NEXRAD-SCAN',
        site,
        filename,
        s3Key: key,
        sourceUrl: fileUrl,
        localPath: `observatory/raw/nexrad/${yyyy}/${mm}/${dd}/${site}/${filename}`,
        retrievedAt: new Date().toISOString(),
        sha256: result.sha256,
        bytes: result.bytes,
        httpStatus: result.status,
        source: IDENTITY.source,
        domain: IDENTITY.domain,
        doctrineNode: '[32] Integrity Layer',
      };
      appendManifest(entry);
      console.log(`  [OK] ${site}/${filename} — ${(result.bytes / 1024 / 1024).toFixed(1)} MB — sha256:${result.sha256.slice(0, 12)}…`);
    } else if (result.status === 404) {
      console.log(`  [404] ${site}/${filename} — not found`);
    } else {
      errors++;
      appendManifest({
        type: 'FETCH-ERROR',
        site,
        filename,
        sourceUrl: fileUrl,
        retrievedAt: new Date().toISOString(),
        httpStatus: result.status,
        error: result.error || 'unknown',
        source: IDENTITY.source,
      });
      console.log(`  [ERR] ${site}/${filename} — ${result.status} ${result.error || ''}`);
    }
  }

  return { site, downloaded, gaps: 0, errors };
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
    console.log(`  [PRUNE] removed ${pruned} raw files older than ${retentionDays} days (manifest records retained)`);
  }
}
const RETENTION_DAYS = parseInt(process.env.RETENTION_DAYS || '7', 10);

// ═══════════════════════════════════════════════════════════════════════════════
// [35] COLLAPSE DETECTION — Track consecutive failures across cycles
// ═══════════════════════════════════════════════════════════════════════════════
let consecutiveFailures = 0;

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COLLECTION CYCLE
// ═══════════════════════════════════════════════════════════════════════════════
async function runCycle() {
  const now = new Date();
  console.log(`\n[NEXRAD] Cycle start — ${now.toISOString()}`);
  console.log(`[NEXRAD] Sites: ${CONFIG.sites.join(', ')}`);

  const seen = loadSeenFiles();
  const tasks = CONFIG.sites.map(site => () => collectSite(site, seen, now));
  const results = await withConcurrency(tasks, CONFIG.concurrency);

  const totalDownloaded = results.reduce((s, r) => s + (r?.downloaded || 0), 0);
  const totalGaps = results.reduce((s, r) => s + (r?.gaps || 0), 0);
  const totalErrors = results.reduce((s, r) => s + (r?.errors || 0), 0);

  console.log(`[NEXRAD] Cycle complete — downloaded: ${totalDownloaded}, gaps: ${totalGaps}, errors: ${totalErrors}`);
  pruneOldFiles(RAW_DIR, RETENTION_DAYS);

  if (totalErrors > 0 && totalDownloaded === 0) {
    consecutiveFailures++;
    console.warn(`[NEXRAD] Consecutive failure count: ${consecutiveFailures}/${IDENTITY.maxConsecutiveFailures}`);
    if (consecutiveFailures >= IDENTITY.maxConsecutiveFailures) {
      console.error('[NEXRAD] [35] COLLAPSE DETECTED — halting collector. Check NOAA connectivity.');
      process.exit(1);
    }
  } else {
    consecutiveFailures = 0;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// [42] DEVOID LIMIT — Fatal error handler; clean shutdown
// ═══════════════════════════════════════════════════════════════════════════════
process.on('uncaughtException', (err) => {
  console.error('[NEXRAD] [42] DEVOID LIMIT — uncaught exception:', err.message);
  appendManifest({ type: 'FATAL-ERROR', error: err.message, at: new Date().toISOString() });
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('[NEXRAD] [42] DEVOID LIMIT — unhandled rejection:', reason);
  appendManifest({ type: 'FATAL-ERROR', error: String(reason), at: new Date().toISOString() });
  process.exit(1);
});

// ═══════════════════════════════════════════════════════════════════════════════
// ENTRYPOINT — Run immediately, then on interval
// ═══════════════════════════════════════════════════════════════════════════════
const INTERVAL_MS = parseInt(process.env.NEXRAD_INTERVAL_MS || '300000', 10); // 5 min default

console.log('═══════════════════════════════════════════════════════════════');
console.log(' TRUTH Observatory — NEXRAD Collector v1.0.0');
console.log(` Architecture: ${IDENTITY.architecture}`);
console.log(` Interval: ${INTERVAL_MS / 1000}s`);
console.log(` Raw output: ${RAW_DIR}`);
console.log(` Manifest: ${manifestPath()}`);
console.log('═══════════════════════════════════════════════════════════════');

await runCycle();
setInterval(runCycle, INTERVAL_MS);
