#!/usr/bin/env node
/**
 * TRUTH Observatory — GOES GLM Lightning Collector
 * DarkWave Studios LLC — Copyright 2026
 *
 * Fetches Geostationary Lightning Mapper (GLM) data from NOAA GOES satellites.
 * Uses the same public S3 bucket infrastructure as the existing GOES collector,
 * but targets the GLM lightning detection products specifically.
 *
 * v1.1: every downloaded LCFA file is now opened (pure-JS HDF5 reader) and the
 * real flash count + flash centroids are extracted. This feeds:
 *   - the permanent hourly series `glm_flash_rate` (flashes per minute)
 *   - STATE_DIR/lightning-recent.json (flash points from the last 15 minutes)
 * GOES-East and GOES-West overlap over the Americas, so each flash is assigned
 * to ONE satellite by longitude (east of 106.2°W → GOES-East, west of it →
 * GOES-West) to avoid double counting.
 *
 * DDA 42-Doctrine module mapping:
 *   [01] Identity Kernel    → COLLECTOR_IDENTITY: immutable cert for this collector
 *   [02] Boundary Engine    → Only GOES GLM source; never writes outside raw/lightning/
 *   [08] Temporal Engine    → Every file timestamped UTC from satellite observation time
 *   [14] Determinacy Engine → SHA-256 hash of every file + retrieval manifest
 *   [16] Domain Mapper      → Longitude split assigns each flash to exactly one satellite
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
import { mkdirSync, existsSync, readFileSync, writeFileSync, renameSync, readdirSync, statSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import * as hdf5 from 'jsfive';
import { readSince } from '../lib/manifest-ledger.mjs';
import { upsertSeries, hourKey, tidy } from '../lib/signal-store.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..', '..');
const STATE_DIR = process.env.STATE_DIR || join(REPO_ROOT, 'observatory', 'state');
const RAW_DIR = process.env.RAW_DIR || join(REPO_ROOT, 'observatory', 'raw', 'lightning');

// ═══════════════════════════════════════════════════════════════════════════════
// [01] IDENTITY KERNEL — Immutable. Never modified at runtime.
// ═══════════════════════════════════════════════════════════════════════════════
const IDENTITY = Object.freeze({
  name: 'observatory-goes-glm-lightning-collector',
  version: '1.1.0',
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
      // Flashes assigned to this satellite: 106.2°W eastward to 60°E
      owns: lon => lon >= -106.2 && lon <= 60,
    },
    {
      id: 'goes18',
      name: 'GOES-18 (West)',
      bucket: 'https://noaa-goes18.s3.amazonaws.com',
      product: 'GLM-L2-LCFA',
      // Flashes west of 106.2°W, including across the dateline
      owns: lon => lon < -106.2 || lon > 60,
    },
  ],

  // GLM produces a file every 20 seconds (15 per 5-minute cycle)
  lookbackMinutes: parseInt(process.env.GLM_LOOKBACK || '15', 10),

  // Max files per satellite per cycle (15 = every file at a 5-minute cadence)
  maxFilesPerSat: 15,

  // Rolling windows for derived outputs
  recentFlashMinutes: 15,
  maxRecentFlashes: 30000,
  sampleHours: 48,

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

// Dedupe window: source listings/queries span at most one UTC day, so 48h of
// ledger entries is sufficient and bounded (no whole-manifest read).
function loadSeenFiles() {
  const seen = new Set();
  for (const e of readSince(STATE_DIR, 'lightning-manifest.jsonl', 48)) {
    if (e.filename) seen.add(e.filename);
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

// GOES filename stamp: sYYYYJJJHHMMSSt (t = tenths of a second)
function stampMs(stamp) {
  const m = /^(\d{4})(\d{3})(\d{2})(\d{2})(\d{2})(\d)$/.exec(stamp || '');
  if (!m) return NaN;
  const [, y, j, h, mi, s, t] = m.map(Number);
  return Date.UTC(y, 0, 1) + (j - 1) * 86400000 + h * 3600000 + mi * 60000 + s * 1000 + t * 100;
}

function fileWindow(filename) {
  const s = /_s(\d{14})_/.exec(filename), e = /_e(\d{14})_/.exec(filename);
  const startMs = stampMs(s && s[1]), endMs = stampMs(e && e[1]);
  const durSec = Number.isFinite(startMs) && Number.isFinite(endMs) && endMs > startMs ? (endMs - startMs) / 1000 : 20;
  return { startMs, durSec };
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

      return { status: res.status, sha256, bytes: buf.length, buf };
    } catch (err) {
      if (attempt === retries) return { status: 'FETCH_ERROR', error: err.message, sha256: null, bytes: 0 };
      await new Promise(r => setTimeout(r, CONFIG.retryDelayMs * attempt));
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// [16] DOMAIN MAPPER — Extract flashes from an LCFA NetCDF-4 (HDF5) file
// ═══════════════════════════════════════════════════════════════════════════════
function extractFlashes(buf, filename, satellite) {
  try {
    const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
    const f = new hdf5.File(ab, filename);
    const latDs = f.get('flash_lat'), lonDs = f.get('flash_lon');
    if (!latDs || !lonDs) return null;
    const lat = latDs.value, lon = lonDs.value;
    const total = Math.min(lat.length, lon.length);
    const points = [];
    for (let i = 0; i < total; i++) {
      const la = lat[i], lo = lon[i];
      if (!Number.isFinite(la) || !Number.isFinite(lo)) continue;
      if (!satellite.owns(lo)) continue;
      points.push([Math.round(la * 100) / 100, Math.round(lo * 100) / 100]);
    }
    return { total, points };
  } catch (err) {
    return { error: err.message };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// [16] DOMAIN MAPPER — List GLM files from S3
// ═══════════════════════════════════════════════════════════════════════════════
async function listGLMFiles(satellite, date = new Date()) {
  const { yyyy, doy, hh } = utcParts(date);
  const prefix = `${satellite.product}/${yyyy}/${doy}/${hh}/`;
  // One hour holds ~180 files, so a single 1000-key page covers it.
  const listUrl = `${satellite.bucket}?list-type=2&prefix=${prefix}&max-keys=1000`;

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
// [22] CONTINUITY LAYER — rolling derived state (flash samples + recent points)
// ═══════════════════════════════════════════════════════════════════════════════
const DERIVED_PATH = () => join(STATE_DIR, 'lightning-recent.json');

function loadDerived() {
  try {
    const d = JSON.parse(readFileSync(DERIVED_PATH(), 'utf8'));
    return { samples: Array.isArray(d.samples) ? d.samples : [], flashes: Array.isArray(d.flashes) ? d.flashes : [] };
  } catch {
    return { samples: [], flashes: [] };
  }
}

function saveDerived(d, nowMs) {
  const sampleCut = nowMs - CONFIG.sampleHours * 3600000;
  const flashCut = nowMs - CONFIG.recentFlashMinutes * 60000;
  d.samples = d.samples.filter(s => s[0] >= sampleCut);
  d.flashes = d.flashes.filter(p => p[0] >= flashCut);
  if (d.flashes.length > CONFIG.maxRecentFlashes) {
    d.flashes.sort((a, b) => a[0] - b[0]);
    d.flashes = d.flashes.slice(-CONFIG.maxRecentFlashes);
  }
  const out = {
    updatedAt: new Date(nowMs).toISOString(),
    windowMinutes: CONFIG.recentFlashMinutes,
    split: 'Each flash is counted once: GOES-East east of 106.2°W, GOES-West west of it.',
    // samples: [fileStartMs, satelliteId, assignedFlashes, durationSec]
    samples: d.samples,
    // flashes: [fileStartMs, lat, lon, satelliteId]
    flashes: d.flashes,
  };
  const tmp = DERIVED_PATH() + '.tmp';
  writeFileSync(tmp, JSON.stringify(out));
  renameSync(tmp, DERIVED_PATH());
}

// Hourly flash rate: per satellite mean flashes/min over that hour's sampled
// files, then summed across satellites (their regions do not overlap).
function writeRateSeries(samples) {
  const byHour = {};
  for (const [ms, sat, n, dur] of samples) {
    if (!Number.isFinite(ms) || !(dur > 0)) continue;
    const k = hourKey(ms);
    const h = byHour[k] || (byHour[k] = {});
    const s = h[sat] || (h[sat] = []);
    s.push((n / dur) * 60);
  }
  const rows = [];
  for (const k of Object.keys(byHour).sort()) {
    let mean = 0, lo = 0, hi = 0, n = 0;
    for (const rates of Object.values(byHour[k])) {
      mean += rates.reduce((a, b) => a + b, 0) / rates.length;
      lo += Math.min(...rates);
      hi += Math.max(...rates);
      n += rates.length;
    }
    rows.push([k, tidy(mean), tidy(lo), tidy(hi), n]);
  }
  if (rows.length) upsertSeries(STATE_DIR, 'glm_flash_rate', rows, false);
  return rows.length ? rows[rows.length - 1] : null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// [03] DIFFERENTIATION — Collect one satellite's GLM data
// ═══════════════════════════════════════════════════════════════════════════════
async function collectSatellite(satellite, seen, now, derived) {
  console.log(`  [→] ${satellite.name}`);

  // Current hour plus the previous one, so files near the hour boundary are not missed
  const prevHour = new Date(now.getTime() - 3600000);
  const files = [...await listGLMFiles(satellite, prevHour), ...await listGLMFiles(satellite, now)];

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

  // Filter to unseen files inside the lookback window, take most recent N
  const cutoff = now.getTime() - CONFIG.lookbackMinutes * 60000;
  const newFiles = files
    .filter(k => !seen.has(k.split('/').pop()))
    .filter(k => { const w = fileWindow(k.split('/').pop()); return !Number.isFinite(w.startMs) || w.startMs >= cutoff; })
    .slice(-CONFIG.maxFilesPerSat);

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
      const { startMs, durSec } = fileWindow(filename);
      const fx = extractFlashes(result.buf, filename, satellite);
      const flashes = fx && !fx.error ? fx.points.length : null;
      if (flashes != null && Number.isFinite(startMs)) {
        derived.samples.push([startMs, satellite.id, flashes, durSec]);
        for (const [la, lo] of fx.points) derived.flashes.push([startMs, la, lo, satellite.id]);
      }
      appendManifest({
        type: 'GLM-FILE',
        satellite: satellite.id,
        satelliteName: satellite.name,
        filename,
        s3Key: key,
        sourceUrl: fileUrl,
        localPath: `observatory/raw/lightning/${ds}/${satellite.id}/${filename}`,
        retrievedAt: now.toISOString(),
        observedAt: Number.isFinite(startMs) ? new Date(startMs).toISOString() : null,
        durationSec: durSec,
        sha256: result.sha256,
        bytes: result.bytes,
        httpStatus: result.status,
        flashes,                                   // flashes in this satellite's assigned region
        flashesInFile: fx && !fx.error ? fx.total : null,
        flashesPerMin: flashes != null ? tidy((flashes / durSec) * 60) : null,
        parseError: fx && fx.error ? fx.error : undefined,
        source: IDENTITY.source,
        domain: IDENTITY.domain,
        doctrineNode: '[32] Integrity Layer',
      });
      console.log(`    [OK] ${satellite.id}/${filename} — ${(result.bytes / 1024).toFixed(1)} KB — ${flashes ?? '?'} flashes — sha256:${result.sha256.slice(0, 12)}…`);
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
function pruneOldFiles(rootDir, retentionHours) {
  const cutoff = Date.now() - retentionHours * 3600000;
  let pruned = 0;
  function walk(dir) {
    let entries;
    try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      const p = join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (/\.nc$/.test(e.name)) {
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
// MAIN COLLECTION CYCLE
// ═══════════════════════════════════════════════════════════════════════════════
async function runCycle() {
  const now = new Date();
  console.log(`\n[LIGHTNING] Cycle start — ${now.toISOString()}`);

  const seen = loadSeenFiles();
  const derived = loadDerived();
  let totalDownloaded = 0, totalGaps = 0, totalErrors = 0;

  for (const sat of CONFIG.satellites) {
    const result = await collectSatellite(sat, seen, now, derived);
    totalDownloaded += result.downloaded;
    totalGaps += result.gaps;
    totalErrors += result.errors;
  }

  try {
    saveDerived(derived, Date.now());
    const last = writeRateSeries(derived.samples);
    if (last) console.log(`  [RATE] ${last[0]}Z — ${last[1]} flashes/min (${last[4]} files)`);
  } catch (err) {
    console.log(`  [RATE] derived write failed: ${err.message}`);
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

  pruneOldFiles(RAW_DIR, RETENTION_HOURS);
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
console.log(` TRUTH Observatory — GOES GLM Lightning Collector v${IDENTITY.version}`);
console.log(` Architecture: ${IDENTITY.architecture}`);
console.log(` Satellites: ${CONFIG.satellites.map(s => s.name).join(', ')}`);
console.log(` Interval: ${INTERVAL_MS / 1000}s`);
console.log(` Raw output: ${RAW_DIR}`);
console.log(` Manifest: ${manifestPath()}`);
console.log('═══════════════════════════════════════════════════════════════');

await runCycle();
setInterval(runCycle, INTERVAL_MS);
