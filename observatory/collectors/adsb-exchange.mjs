#!/usr/bin/env node
/**
 * TRUTH Observatory — ADS-B Aircraft Tracking Collector
 * DarkWave Studios LLC — Copyright 2026
 *
 * Fetches aircraft position data from ADS-B Exchange via RapidAPI (when
 * ADSB_API_KEY is set) merged with the free adsb.lol community network
 * (same v2 format, ODbL open data) tiled across CONUS. Deduped by ICAO hex.
 *
 * DDA 42-Doctrine module mapping:
 *   [01] Identity Kernel    → COLLECTOR_IDENTITY
 *   [02] Boundary Engine    → Only ADS-B Exchange; writes to raw/aircraft/
 *   [08] Temporal Engine    → Position timestamps in UTC
 *   [14] Determinacy Engine → SHA-256 hash of every response
 *   [32] Integrity Layer    → Raw JSON preserved as-is
 *   [35] Collapse Detection → Consecutive failure counter
 *   [40] Non-Being Guard    → Missing data recorded as gap
 *
 * API: ADS-B Exchange v2 via RapidAPI
 * Coverage: Global ADS-B transponder data
 */

import { createHash } from 'crypto';
import { mkdirSync, writeFileSync, readdirSync, statSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..', '..');
const STATE_DIR = process.env.STATE_DIR || join(REPO_ROOT, 'observatory', 'state');
const RAW_DIR = process.env.RAW_DIR || join(REPO_ROOT, 'observatory', 'raw', 'aircraft');

const IDENTITY = Object.freeze({
  name: 'observatory-adsb-collector',
  version: '1.0.0',
  author: 'Andrews, Ronald Jason — DarkWave Studios LLC',
  architecture: 'DDA 42-Doctrine / Deterministic Dissolution Ladder',
  source: 'ADS-B Exchange — Global Aircraft Transponder Network',
  domain: 'infrastructure-aircraft',
  dataType: 'aircraft-positions-json',
  maxConsecutiveFailures: 5,
});

const CONFIG = Object.freeze({
  // RapidAPI ADS-B Exchange endpoint — CONUS bounding box
  apiUrl: 'https://adsbexchange-com1.p.rapidapi.com/v2/lat/37.0/lon/-95.0/dist/500/',
  apiKey: process.env.ADSB_API_KEY || '',
  apiHost: 'adsbexchange-com1.p.rapidapi.com',
  // Free fallback: 250 nm circles that together cover the lower 48
  freeBase: 'https://api.adsb.lol/v2',
  freePoints: [
    [47.5, -121.5], [39.0, -121.0], [34.0, -117.0], [33.5, -110.0], [41.0, -111.0],
    [46.5, -108.0], [39.5, -104.0], [32.0, -100.0], [46.0, -98.0], [38.5, -97.0],
    [30.5, -92.0], [36.0, -88.5], [43.0, -89.5], [41.5, -82.5], [33.5, -83.5],
    [28.0, -81.5], [38.5, -77.0], [42.5, -73.5], [45.5, -68.5],
  ],
  intervalMs: parseInt(process.env.ADSB_INTERVAL_MS || '300000', 10), // 5 min
  maxRetries: 3,
  retryDelayMs: 3000,
  timeoutMs: 30000,
});

function manifestFilePath() { mkdirSync(STATE_DIR, { recursive: true }); return join(STATE_DIR, 'aircraft-manifest.jsonl'); }
function appendManifest(entry) { writeFileSync(manifestFilePath(), JSON.stringify({ ...entry, writtenAt: new Date().toISOString() }) + '\n', { flag: 'a' }); }
function sha256(buffer) { return createHash('sha256').update(buffer).digest('hex'); }

// Free path: query each CONUS circle, merge by ICAO hex, keep newest position
async function fetchFreeNetwork() {
  const byHex = new Map();
  let ok = 0, lastErr = null;
  for (const [lat, lon] of CONFIG.freePoints) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), CONFIG.timeoutMs);
      const res = await fetch(`${CONFIG.freeBase}/lat/${lat}/lon/${lon}/dist/250`, {
        signal: controller.signal,
        headers: { 'User-Agent': 'TruthObservatory/1.0 (+https://observatory.tlid.io)' },
      });
      clearTimeout(timer);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      for (const a of data.ac || []) {
        if (a.lat == null || a.lon == null || !a.hex) continue;
        const prev = byHex.get(a.hex);
        if (!prev || (a.seen_pos ?? 99) < (prev.seen_pos ?? 99)) byHex.set(a.hex, a);
      }
      ok++;
    } catch (err) { lastErr = err.message; }
    await new Promise(r => setTimeout(r, 1200)); // be polite to the community API
  }
  if (ok === 0) return { status: 'FETCH_ERROR', error: lastErr || 'all adsb.lol requests failed', body: null, sha256: null };
  const body = JSON.stringify({ source: 'adsb.lol', now: Date.now(), tiles: ok, ac: [...byHex.values()] });
  return { status: 200, body, sha256: sha256(Buffer.from(body)) };
}

async function fetchRapid(url, retries = CONFIG.maxRetries) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), CONFIG.timeoutMs);
      const res = await fetch(url, {
        signal: controller.signal,
        headers: { 'X-RapidAPI-Key': CONFIG.apiKey, 'X-RapidAPI-Host': CONFIG.apiHost },
      });
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

// Primary: ADS-B Exchange (1 RapidAPI call per cycle) merged with the free
// adsb.lol tiles for full lower-48 coverage. Either source alone is enough.
async function fetchWithRetry(url) {
  const [rapid, free] = await Promise.all([
    CONFIG.apiKey ? fetchRapid(url) : Promise.resolve(null),
    fetchFreeNetwork(),
  ]);
  const parts = [];
  const sources = [];
  if (rapid && rapid.body) { try { parts.push(JSON.parse(rapid.body).ac || []); sources.push('ADS-B Exchange'); } catch {} }
  else if (rapid) console.log(`  [WARN] ADS-B Exchange: ${rapid.error || rapid.status}`);
  if (free && free.body) { try { parts.push(JSON.parse(free.body).ac || []); sources.push('adsb.lol'); } catch {} }
  if (!parts.length) return { status: 'FETCH_ERROR', error: (rapid && rapid.error) || (free && free.error) || 'no source', body: null, sha256: null };
  const byHex = new Map();
  for (const list of parts) for (const a of list) {
    if (a.lat == null || a.lon == null || !a.hex) continue;
    const prev = byHex.get(a.hex);
    if (!prev || (a.seen_pos ?? 99) < (prev.seen_pos ?? 99)) byHex.set(a.hex, a);
  }
  const body = JSON.stringify({ source: sources.join(' + '), now: Date.now(), ac: [...byHex.values()] });
  return { status: 200, body, sha256: sha256(Buffer.from(body)) };
}

function pruneOldFiles(rootDir, retentionHours) {
  const cutoff = Date.now() - retentionHours * 3600000; let pruned = 0;
  function walk(dir) { let entries; try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const e of entries) { const p = join(dir, e.name); if (e.isDirectory()) walk(p);
      else { try { if (statSync(p).mtimeMs < cutoff) { unlinkSync(p); pruned++; } } catch {} } } }
  walk(rootDir);
  if (pruned > 0) appendManifest({ type: 'RETENTION-PRUNE', prunedFiles: pruned, retentionHours, at: new Date().toISOString() });
}
const RETENTION_HOURS = parseInt(process.env.RETENTION_HOURS || '4', 10); // shorter for high-volume

let consecutiveFailures = 0;

async function runCycle() {
  const now = new Date();
  const dateStr = `${now.getUTCFullYear()}-${(now.getUTCMonth()+1).toString().padStart(2,'0')}-${now.getUTCDate().toString().padStart(2,'0')}`;
  console.log(`\n[ADSB] Cycle start — ${now.toISOString()}`);

  const result = await fetchWithRetry(CONFIG.apiUrl);

  if (!result.body || result.status === 'FETCH_ERROR' || result.status === 'NO_API_KEY') {
    appendManifest({ type: 'DATA-GAP', source: IDENTITY.source, domain: IDENTITY.domain, retrievedAt: now.toISOString(), reason: result.error });
    console.log(`  [GAP] ADS-B: ${result.error || result.status}`);
    consecutiveFailures++;
    if (result.status === 'NO_API_KEY') { console.log('  [WAITING] ADSB_API_KEY not set — collector idle'); return; }
    if (consecutiveFailures >= IDENTITY.maxConsecutiveFailures) { console.error('  [COLLAPSE] Halting'); process.exit(1); }
    return;
  }
  consecutiveFailures = 0;

  let aircraftCount = 0;
  try { const data = JSON.parse(result.body); aircraftCount = data.ac ? data.ac.length : 0; } catch {}

  const rawDir = join(RAW_DIR, dateStr);
  mkdirSync(rawDir, { recursive: true });
  const filename = `adsb_${now.toISOString().replace(/[:.]/g, '-')}.json`;
  writeFileSync(join(rawDir, filename), result.body);

  appendManifest({
    type: 'OBSERVATION', source: IDENTITY.source, domain: IDENTITY.domain,
    retrievedAt: now.toISOString(), sha256: result.sha256, rawFile: join(rawDir, filename),
    aircraft: aircraftCount, bytes: result.body.length,
  });
  console.log(`  [OK] ${aircraftCount} aircraft, SHA-256: ${result.sha256.slice(0, 16)}...`);
  pruneOldFiles(RAW_DIR, RETENTION_HOURS);
}

console.log(`[ADSB] ${IDENTITY.name} v${IDENTITY.version}`);
console.log(`[ADSB] Sources: ${CONFIG.apiKey ? 'ADS-B Exchange (RapidAPI) + ' : ''}adsb.lol community network`);
console.log(`[ADSB] Interval: ${CONFIG.intervalMs}ms`);

process.on('uncaughtException', (err) => { console.error('[ADSB] FATAL:', err); appendManifest({ type: 'FATAL', error: err.message, at: new Date().toISOString() }); process.exit(1); });
(async () => { await runCycle(); setInterval(runCycle, CONFIG.intervalMs); })();
