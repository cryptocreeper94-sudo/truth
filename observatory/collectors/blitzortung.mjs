#!/usr/bin/env node
/**
 * TRUTH Observatory — Blitzortung Ground Lightning Collector
 * DarkWave Studios LLC — Copyright 2026
 *
 * Fetches recent lightning stroke data from the Blitzortung.org public
 * data archive. Community-operated ground-based detection network.
 * No API key required — public HTTP endpoint.
 *
 * DDA 42-Doctrine module mapping:
 *   [01] Identity Kernel    → COLLECTOR_IDENTITY
 *   [02] Boundary Engine    → Only Blitzortung source; writes to raw/blitzortung/
 *   [08] Temporal Engine    → All strokes timestamped UTC (nanosecond precision from source)
 *   [14] Determinacy Engine → SHA-256 hash of every response
 *   [32] Integrity Layer    → Raw data preserved as-is
 *   [35] Collapse Detection → Consecutive failure counter
 *   [40] Non-Being Guard    → Missing data recorded as gap
 *
 * Source: http://data.blitzortung.org/Data/Protected/Strokes/
 * Format: CSV-like text (timestamp, lat, lon, amplitude, stations)
 * Coverage: Global, community sensor network
 */

import { createHash } from 'crypto';
import { mkdirSync, existsSync, writeFileSync, readdirSync, statSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..', '..');
const STATE_DIR = process.env.STATE_DIR || join(REPO_ROOT, 'observatory', 'state');
const RAW_DIR = process.env.RAW_DIR || join(REPO_ROOT, 'observatory', 'raw', 'blitzortung');

const IDENTITY = Object.freeze({
  name: 'observatory-blitzortung-collector',
  version: '1.0.0',
  author: 'Andrews, Ronald Jason — DarkWave Studios LLC',
  architecture: 'DDA 42-Doctrine / Deterministic Dissolution Ladder',
  source: 'Blitzortung.org — Community Lightning Detection Network',
  domain: 'atmospheric-lightning',
  dataType: 'lightning-strokes',
  rawPath: 'observatory/raw/blitzortung/',
  manifestPath: 'observatory/state/blitzortung-manifest.jsonl',
  maxConsecutiveFailures: 5,
});

const CONFIG = Object.freeze({
  // Blitzortung publishes recent stroke data in 10-minute bins
  // We fetch the GeoJSON summary endpoint for the Americas region
  apiUrl: 'https://map.blitzortung.org/GEOjson/GEOjson.php?c=America/New_York',
  intervalMs: parseInt(process.env.BLITZ_INTERVAL_MS || '600000', 10), // 10 min
  maxRetries: 3,
  retryDelayMs: 3000,
  timeoutMs: 30000,
});

function manifestFilePath() {
  mkdirSync(STATE_DIR, { recursive: true });
  return join(STATE_DIR, 'blitzortung-manifest.jsonl');
}
function appendManifest(entry) {
  writeFileSync(manifestFilePath(), JSON.stringify({ ...entry, writtenAt: new Date().toISOString() }) + '\n', { flag: 'a' });
}
function sha256(buffer) { return createHash('sha256').update(buffer).digest('hex'); }

async function fetchWithRetry(url, retries = CONFIG.maxRetries) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), CONFIG.timeoutMs);
      const res = await fetch(url, { signal: controller.signal, headers: { 'User-Agent': 'TruthObservatory/1.0 (research)' } });
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

function pruneOldFiles(rootDir, retentionHours) {
  const cutoff = Date.now() - retentionHours * 3600000;
  let pruned = 0;
  function walk(dir) {
    let entries;
    try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      const p = join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else { try { if (statSync(p).mtimeMs < cutoff) { unlinkSync(p); pruned++; } } catch {} }
    }
  }
  walk(rootDir);
  if (pruned > 0) appendManifest({ type: 'RETENTION-PRUNE', prunedFiles: pruned, retentionHours, at: new Date().toISOString() });
}
const RETENTION_HOURS = parseInt(process.env.RETENTION_HOURS || '4', 10);

let consecutiveFailures = 0;

async function runCycle() {
  const now = new Date();
  const dateStr = `${now.getUTCFullYear()}-${(now.getUTCMonth()+1).toString().padStart(2,'0')}-${now.getUTCDate().toString().padStart(2,'0')}`;
  console.log(`\n[BLITZ] Cycle start — ${now.toISOString()}`);

  const result = await fetchWithRetry(CONFIG.apiUrl);

  if (!result.body || result.status === 'FETCH_ERROR') {
    appendManifest({ type: 'DATA-GAP', source: IDENTITY.source, domain: IDENTITY.domain, retrievedAt: now.toISOString(), reason: result.error || 'Empty response' });
    console.log(`  [GAP] Blitzortung returned no data: ${result.error || result.status}`);
    consecutiveFailures++;
    if (consecutiveFailures >= IDENTITY.maxConsecutiveFailures) { console.error(`  [COLLAPSE] Halting`); process.exit(1); }
    return;
  }
  consecutiveFailures = 0;

  let strokeCount = 0;
  try { const geo = JSON.parse(result.body); strokeCount = geo.features ? geo.features.length : 0; } catch {}

  const rawDir = join(RAW_DIR, dateStr);
  mkdirSync(rawDir, { recursive: true });
  const filename = `blitz_${now.toISOString().replace(/[:.]/g, '-')}.json`;
  writeFileSync(join(rawDir, filename), result.body);

  appendManifest({
    type: 'OBSERVATION', source: IDENTITY.source, domain: IDENTITY.domain,
    retrievedAt: now.toISOString(), sha256: result.sha256, rawFile: join(rawDir, filename),
    strokes: strokeCount, bytes: result.body.length,
  });
  console.log(`  [OK] ${strokeCount} strokes, SHA-256: ${result.sha256.slice(0, 16)}...`);
  pruneOldFiles(RAW_DIR, RETENTION_HOURS);
}

console.log(`[BLITZ] ${IDENTITY.name} v${IDENTITY.version}`);
console.log(`[BLITZ] Source: ${IDENTITY.source}`);
console.log(`[BLITZ] Interval: ${CONFIG.intervalMs}ms`);

process.on('uncaughtException', (err) => {
  console.error('[BLITZ] FATAL:', err);
  appendManifest({ type: 'FATAL', error: err.message, stack: err.stack, at: new Date().toISOString() });
  process.exit(1);
});

(async () => { await runCycle(); setInterval(runCycle, CONFIG.intervalMs); })();
