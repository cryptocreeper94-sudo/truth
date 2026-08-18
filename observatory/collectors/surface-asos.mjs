#!/usr/bin/env node
/**
 * TRUTH Observatory — NOAA ASOS Surface Station Collector
 * DarkWave Studios LLC — Copyright 2026
 *
 * Fetches real-time surface weather observations from NOAA's
 * Iowa Environmental Mesonet (IEM) ASOS/AWOS network.
 * No API key required — public JSON endpoint.
 *
 * DDA 42-Doctrine module mapping:
 *   [01] Identity Kernel    → COLLECTOR_IDENTITY
 *   [02] Boundary Engine    → Only IEM ASOS source; writes to raw/surface/
 *   [08] Temporal Engine    → All observations timestamped UTC
 *   [14] Determinacy Engine → SHA-256 hash of every API response
 *   [32] Integrity Layer    → Raw JSON preserved as-is
 *   [35] Collapse Detection → Consecutive failure counter
 *   [40] Non-Being Guard    → Missing data recorded as gap
 *   [42] Devoid Limit       → Fatal errors logged, state preserved
 *
 * API: https://mesonet.agron.iastate.edu/api/1/currents.json
 * Format: JSON (station array with temp, wind, pressure, visibility)
 * Coverage: ~2000 US ASOS/AWOS stations
 */

import { createHash } from 'crypto';
import { mkdirSync, existsSync, readFileSync, writeFileSync, readdirSync, statSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..', '..');
const STATE_DIR = process.env.STATE_DIR || join(REPO_ROOT, 'observatory', 'state');
const RAW_DIR = process.env.RAW_DIR || join(REPO_ROOT, 'observatory', 'raw', 'surface');

const IDENTITY = Object.freeze({
  name: 'observatory-surface-asos-collector',
  version: '1.0.0',
  author: 'Andrews, Ronald Jason — DarkWave Studios LLC',
  architecture: 'DDA 42-Doctrine / Deterministic Dissolution Ladder',
  source: 'Iowa Environmental Mesonet — ASOS/AWOS Current Conditions',
  domain: 'atmospheric-surface',
  dataType: 'surface-observations-json',
  rawPath: 'observatory/raw/surface/',
  manifestPath: 'observatory/state/surface-manifest.jsonl',
  maxConsecutiveFailures: 5,
});

const CONFIG = Object.freeze({
  apiUrl: 'https://mesonet.agron.iastate.edu/api/1/currents.json?network=ASOS&only_online=true',
  intervalMs: parseInt(process.env.SURFACE_INTERVAL_MS || '900000', 10), // 15 min
  maxRetries: 3,
  retryDelayMs: 2000,
  timeoutMs: 30000,
});

function manifestFilePath() {
  mkdirSync(STATE_DIR, { recursive: true });
  return join(STATE_DIR, 'surface-manifest.jsonl');
}

function appendManifest(entry) {
  writeFileSync(manifestFilePath(), JSON.stringify({ ...entry, writtenAt: new Date().toISOString() }) + '\n', { flag: 'a' });
}

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
  if (pruned > 0) {
    appendManifest({ type: 'RETENTION-PRUNE', prunedFiles: pruned, retentionHours, at: new Date().toISOString() });
  }
}
const RETENTION_HOURS = parseInt(process.env.RETENTION_HOURS || '4', 10);

let consecutiveFailures = 0;

async function runCycle() {
  const now = new Date();
  const dateStr = `${now.getUTCFullYear()}-${(now.getUTCMonth()+1).toString().padStart(2,'0')}-${now.getUTCDate().toString().padStart(2,'0')}`;
  console.log(`\n[SURFACE] Cycle start — ${now.toISOString()}`);

  const result = await fetchWithRetry(CONFIG.apiUrl);

  if (!result.body || result.status === 'FETCH_ERROR') {
    appendManifest({
      type: 'DATA-GAP', source: IDENTITY.source, domain: IDENTITY.domain,
      retrievedAt: now.toISOString(), reason: result.error || 'Empty response',
    });
    console.log(`  [GAP] IEM API returned no data: ${result.error || result.status}`);
    consecutiveFailures++;
    if (consecutiveFailures >= IDENTITY.maxConsecutiveFailures) {
      console.error(`  [COLLAPSE] ${consecutiveFailures} consecutive failures — halting collector`);
      process.exit(1);
    }
    return;
  }

  consecutiveFailures = 0;

  // Parse to count stations
  let stationCount = 0;
  try {
    const data = JSON.parse(result.body);
    stationCount = data.data ? data.data.length : 0;
  } catch {}

  // Save raw file
  const rawDir = join(RAW_DIR, dateStr);
  mkdirSync(rawDir, { recursive: true });
  const filename = `asos_${now.toISOString().replace(/[:.]/g, '-')}.json`;
  const rawPath = join(rawDir, filename);
  writeFileSync(rawPath, result.body);

  appendManifest({
    type: 'OBSERVATION',
    source: IDENTITY.source,
    domain: IDENTITY.domain,
    retrievedAt: now.toISOString(),
    sha256: result.sha256,
    rawFile: rawPath,
    stations: stationCount,
    bytes: result.body.length,
  });

  console.log(`  [OK] ${stationCount} stations, ${result.body.length} bytes, SHA-256: ${result.sha256.slice(0, 16)}...`);

  // Retention pruning
  pruneOldFiles(RAW_DIR, RETENTION_HOURS);
}

// ═══════════════════════════════════════════════════════════════════════════════
// [42] DEVOID LIMIT — Main loop with uncaught protection
// ═══════════════════════════════════════════════════════════════════════════════
console.log(`[SURFACE] ${IDENTITY.name} v${IDENTITY.version}`);
console.log(`[SURFACE] Source: ${IDENTITY.source}`);
console.log(`[SURFACE] Interval: ${CONFIG.intervalMs}ms`);
console.log(`[SURFACE] State: ${STATE_DIR}`);
console.log(`[SURFACE] Raw: ${RAW_DIR}`);

process.on('uncaughtException', (err) => {
  console.error('[SURFACE] FATAL:', err);
  appendManifest({ type: 'FATAL', error: err.message, stack: err.stack, at: new Date().toISOString() });
  process.exit(1);
});

(async () => {
  await runCycle();
  setInterval(runCycle, CONFIG.intervalMs);
})();
