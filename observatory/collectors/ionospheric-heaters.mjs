#!/usr/bin/env node
/**
 * TRUTH Observatory — Ionospheric Heater Schedule Collector
 * DarkWave Studios LLC — Copyright 2026
 *
 * Fetches operating schedules and experiment logs from known ionospheric
 * research facilities: HAARP, EISCAT, Sura.
 * All public pages — no API keys required.
 *
 * DDA 42-Doctrine module mapping:
 *   [01] Identity Kernel    → COLLECTOR_IDENTITY
 *   [02] Boundary Engine    → Only named facility schedules
 *   [14] Determinacy Engine → SHA-256 hash of every page snapshot
 *   [32] Integrity Layer    → Raw HTML preserved as-is
 *   [40] Non-Being Guard    → Missing data recorded as gap
 *
 * Sources:
 *   - HAARP: https://haarp.gi.alaska.edu/
 *   - EISCAT: https://www.eiscat.se/schedule/
 *   - Sura: Published research schedules (periodic)
 */

import { createHash } from 'crypto';
import { mkdirSync, writeFileSync, readdirSync, statSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..', '..');
const STATE_DIR = process.env.STATE_DIR || join(REPO_ROOT, 'observatory', 'state');
const RAW_DIR = process.env.RAW_DIR || join(REPO_ROOT, 'observatory', 'raw', 'heaters');

const IDENTITY = Object.freeze({
  name: 'observatory-ionospheric-heater-collector',
  version: '1.0.0',
  author: 'Andrews, Ronald Jason — DarkWave Studios LLC',
  architecture: 'DDA 42-Doctrine / Deterministic Dissolution Ladder',
  source: 'HAARP, EISCAT, Sura — Ionospheric Research Facility Schedules',
  domain: 'rf-ionospheric',
  dataType: 'facility-schedules-html',
  maxConsecutiveFailures: 5,
});

const FACILITIES = [
  { id: 'haarp', name: 'HAARP', url: 'https://haarp.gi.alaska.edu/', location: 'Gakona, Alaska', lat: 62.39, lon: -145.15 },
  { id: 'haarp-schedule', name: 'HAARP Schedule', url: 'https://haarp.gi.alaska.edu/experiments', location: 'Gakona, Alaska', lat: 62.39, lon: -145.15 },
  { id: 'eiscat', name: 'EISCAT', url: 'https://www.eiscat.se/schedule/', location: 'Tromsø, Norway', lat: 69.58, lon: 19.23 },
  { id: 'eiscat-3d', name: 'EISCAT_3D', url: 'https://www.eiscat.se/eiscat3d/', location: 'Skibotn, Norway', lat: 69.34, lon: 20.31 },
  { id: 'jicamarca', name: 'Jicamarca', url: 'https://jro.igp.gob.pe/', location: 'Lima, Peru', lat: -11.95, lon: -76.87 },
  { id: 'arecibo', name: 'Arecibo (archive)', url: 'https://www.naic.edu/', location: 'Arecibo, Puerto Rico', lat: 18.34, lon: -66.75 },
];

const CONFIG = Object.freeze({
  intervalMs: parseInt(process.env.HEATER_INTERVAL_MS || '21600000', 10), // 6 hours
  timeoutMs: 30000,
});

function manifestFilePath() { mkdirSync(STATE_DIR, { recursive: true }); return join(STATE_DIR, 'heater-manifest.jsonl'); }
function appendManifest(entry) { writeFileSync(manifestFilePath(), JSON.stringify({ ...entry, writtenAt: new Date().toISOString() }) + '\n', { flag: 'a' }); }
function sha256(buffer) { return createHash('sha256').update(buffer).digest('hex'); }

async function safeFetch(url) {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), CONFIG.timeoutMs);
    const res = await fetch(url, { signal: controller.signal, headers: { 'User-Agent': 'TruthObservatory/1.0 (academic research)' } });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    return { ok: true, body: text, sha256: sha256(Buffer.from(text)) };
  } catch (err) { return { ok: false, error: err.message }; }
}

function pruneOldFiles(rootDir, retentionDays) {
  const cutoff = Date.now() - retentionDays * 86400000; let pruned = 0;
  function walk(dir) { let entries; try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const e of entries) { const p = join(dir, e.name); if (e.isDirectory()) walk(p);
      else { try { if (statSync(p).mtimeMs < cutoff) { unlinkSync(p); pruned++; } } catch {} } } }
  walk(rootDir);
  if (pruned > 0) appendManifest({ type: 'RETENTION-PRUNE', prunedFiles: pruned, retentionDays, at: new Date().toISOString() });
}
const RETENTION_DAYS = parseInt(process.env.RETENTION_DAYS || '30', 10);

let consecutiveFailures = 0;

async function runCycle() {
  const now = new Date();
  const dateStr = `${now.getUTCFullYear()}-${(now.getUTCMonth()+1).toString().padStart(2,'0')}-${now.getUTCDate().toString().padStart(2,'0')}`;
  const rawDir = join(RAW_DIR, dateStr);
  mkdirSync(rawDir, { recursive: true });
  console.log(`\n[HEATER] Cycle start — ${now.toISOString()}`);

  let successes = 0;
  for (const facility of FACILITIES) {
    const result = await safeFetch(facility.url);
    if (result.ok) {
      const filename = `${facility.id}_${now.toISOString().replace(/[:.]/g, '-')}.html`;
      writeFileSync(join(rawDir, filename), result.body);
      appendManifest({
        type: 'SCHEDULE-SNAPSHOT', source: facility.name, facility: facility.id,
        domain: IDENTITY.domain, retrievedAt: now.toISOString(),
        sha256: result.sha256, location: facility.location, lat: facility.lat, lon: facility.lon,
        bytes: result.body.length,
      });
      console.log(`  [${facility.id.toUpperCase()}] ${result.body.length} bytes`);
      successes++;
    } else {
      appendManifest({ type: 'DATA-GAP', source: facility.name, facility: facility.id, domain: IDENTITY.domain, retrievedAt: now.toISOString(), reason: result.error });
      console.log(`  [${facility.id.toUpperCase()} GAP] ${result.error}`);
    }
    // Rate limit between facilities
    await new Promise(r => setTimeout(r, 2000));
  }

  if (successes > 0) consecutiveFailures = 0;
  else { consecutiveFailures++; if (consecutiveFailures >= IDENTITY.maxConsecutiveFailures) { console.error('  [COLLAPSE] Halting'); process.exit(1); } }

  console.log(`  [HEATER] ${successes}/${FACILITIES.length} facilities reached`);
  pruneOldFiles(RAW_DIR, RETENTION_DAYS);
}

console.log(`[HEATER] ${IDENTITY.name} v${IDENTITY.version}`);
console.log(`[HEATER] Facilities: ${FACILITIES.map(f => f.name).join(', ')}`);
console.log(`[HEATER] Interval: ${CONFIG.intervalMs}ms`);

process.on('uncaughtException', (err) => { console.error('[HEATER] FATAL:', err); appendManifest({ type: 'FATAL', error: err.message, at: new Date().toISOString() }); process.exit(1); });
(async () => { await runCycle(); setInterval(runCycle, CONFIG.intervalMs); })();
