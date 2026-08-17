#!/usr/bin/env node
/**
 * TRUTH Observatory — ADS-B Aircraft Tracking Collector
 * DarkWave Studios LLC — Copyright 2026
 *
 * Fetches aircraft position data from ADS-B Exchange via RapidAPI.
 * REQUIRES API key — set ADSB_API_KEY in environment.
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
  intervalMs: parseInt(process.env.ADSB_INTERVAL_MS || '300000', 10), // 5 min
  maxRetries: 3,
  retryDelayMs: 3000,
  timeoutMs: 30000,
});

function manifestFilePath() { mkdirSync(STATE_DIR, { recursive: true }); return join(STATE_DIR, 'aircraft-manifest.jsonl'); }
function appendManifest(entry) { writeFileSync(manifestFilePath(), JSON.stringify({ ...entry, writtenAt: new Date().toISOString() }) + '\n', { flag: 'a' }); }
function sha256(buffer) { return createHash('sha256').update(buffer).digest('hex'); }

async function fetchWithRetry(url, retries = CONFIG.maxRetries) {
  if (!CONFIG.apiKey) return { status: 'NO_API_KEY', error: 'ADSB_API_KEY not set', body: null, sha256: null };
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

function pruneOldFiles(rootDir, retentionDays) {
  const cutoff = Date.now() - retentionDays * 86400000; let pruned = 0;
  function walk(dir) { let entries; try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const e of entries) { const p = join(dir, e.name); if (e.isDirectory()) walk(p);
      else { try { if (statSync(p).mtimeMs < cutoff) { unlinkSync(p); pruned++; } } catch {} } } }
  walk(rootDir);
  if (pruned > 0) appendManifest({ type: 'RETENTION-PRUNE', prunedFiles: pruned, retentionDays, at: new Date().toISOString() });
}
const RETENTION_DAYS = parseInt(process.env.RETENTION_DAYS || '3', 10); // shorter for high-volume

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
  pruneOldFiles(RAW_DIR, RETENTION_DAYS);
}

console.log(`[ADSB] ${IDENTITY.name} v${IDENTITY.version}`);
console.log(`[ADSB] API Key: ${CONFIG.apiKey ? 'SET' : 'NOT SET — collector will idle'}`);
console.log(`[ADSB] Interval: ${CONFIG.intervalMs}ms`);

process.on('uncaughtException', (err) => { console.error('[ADSB] FATAL:', err); appendManifest({ type: 'FATAL', error: err.message, at: new Date().toISOString() }); process.exit(1); });
(async () => { await runCycle(); setInterval(runCycle, CONFIG.intervalMs); })();
