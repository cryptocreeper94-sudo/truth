#!/usr/bin/env node
/**
 * TRUTH Observatory — Volcanic Activity Collector
 * DarkWave Studios LLC — Copyright 2026
 *
 * Fetches volcanic activity status from USGS Volcano Hazards Program (VHP).
 * Free, public, no API key required.
 *
 * DDA 42-Doctrine module mapping:
 *   [01] Identity Kernel    → COLLECTOR_IDENTITY
 *   [02] Boundary Engine    → Only USGS-monitored volcanoes
 *   [14] Determinacy Engine → SHA-256 hash of every API response
 *   [32] Integrity Layer    → Raw JSON preserved as-is
 *   [40] Non-Being Guard    → Missing data recorded as gap
 *
 * Source: USGS Volcano Hazards Program
 * Endpoint: https://volcanoes.usgs.gov/vsc/api/volcanoApi/vhpstatus
 */

import { createHash } from 'crypto';
import { mkdirSync, writeFileSync, readdirSync, statSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..', '..');
const STATE_DIR = process.env.STATE_DIR || join(REPO_ROOT, 'observatory', 'state');
const RAW_DIR = process.env.RAW_DIR || join(REPO_ROOT, 'observatory', 'raw', 'volcanic');

const IDENTITY = Object.freeze({
  name: 'observatory-volcanic-collector',
  version: '1.0.0',
  author: 'Andrews, Ronald Jason — DarkWave Studios LLC',
  architecture: 'DDA 42-Doctrine / Deterministic Dissolution Ladder',
  source: 'USGS Volcano Hazards Program (VHP)',
  domain: 'geophysical-volcanic',
  dataType: 'volcano-status-json',
  maxConsecutiveFailures: 5,
});

const CONFIG = Object.freeze({
  statusUrl: 'https://volcanoes.usgs.gov/vsc/api/volcanoApi/vhpstatus',
  intervalMs: parseInt(process.env.VOLCANIC_INTERVAL_MS || '3600000', 10), // 1 hour
  timeoutMs: 60000,
});

function manifestFilePath() { mkdirSync(STATE_DIR, { recursive: true }); return join(STATE_DIR, 'volcanic-manifest.jsonl'); }
function appendManifest(entry) { writeFileSync(manifestFilePath(), JSON.stringify({ ...entry, writtenAt: new Date().toISOString() }) + '\n', { flag: 'a' }); }
function sha256(buffer) { return createHash('sha256').update(buffer).digest('hex'); }

async function fetchVolcanoes() {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), CONFIG.timeoutMs);
    const res = await fetch(CONFIG.statusUrl, { signal: controller.signal, headers: { 'User-Agent': 'TruthObservatory/1.0 (academic research)' } });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    const hash = sha256(Buffer.from(text));
    const data = JSON.parse(text);
    const volcanoes = data.map(v => ({
      name: v.vName,
      lat: v.lat,
      lon: v.long,
      region: v.region,
      observatory: v.obs,
      alertLevel: v.alertLevel,
      colorCode: v.colorCode,
      threatLevel: v.nvewsThreat,
      synopsis: v.noticeSynopsis,
      alertDate: v.alertDate,
      url: v.vUrl,
    }));
    return { status: 'OK', volcanoes, count: volcanoes.length, sha256: hash, body: text };
  } catch (err) {
    return { status: 'FETCH_ERROR', error: err.message, volcanoes: [], count: 0, sha256: null, body: null };
  }
}

function pruneOldFiles(rootDir, retentionHours) {
  const cutoff = Date.now() - retentionHours * 3600000; let pruned = 0;
  function walk(dir) { let entries; try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const e of entries) { const p = join(dir, e.name); if (e.isDirectory()) walk(p);
      else { try { if (statSync(p).mtimeMs < cutoff) { unlinkSync(p); pruned++; } } catch {} } } }
  walk(rootDir); return pruned;
}

const RETENTION_HOURS = parseInt(process.env.RETENTION_HOURS || '168', 10); // 7 days

async function cycle() {
  const now = new Date();
  console.log(`\n[VOLCANIC] Cycle start — ${now.toISOString()}`);

  const result = await fetchVolcanoes();

  if (result.status !== 'OK') {
    appendManifest({ type: 'DATA-GAP', source: IDENTITY.source, domain: IDENTITY.domain, retrievedAt: now.toISOString(), reason: result.error || result.status });
    console.log(`  [GAP] ${result.error || result.status}`);
    return;
  }

  // Write raw JSON
  mkdirSync(RAW_DIR, { recursive: true });
  const filename = `volcanic_${now.toISOString().replace(/[:.]/g, '-')}.json`;
  writeFileSync(join(RAW_DIR, filename), JSON.stringify({ volcanoes: result.volcanoes, count: result.count, retrievedAt: now.toISOString() }, null, 2));

  // Summarize — focus on elevated activity
  const elevated = result.volcanoes.filter(v => v.alertLevel && v.alertLevel !== 'NORMAL' && v.alertLevel !== 'UNASSIGNED');
  const warning = elevated.filter(v => v.alertLevel === 'WARNING' || v.colorCode === 'ORANGE' || v.colorCode === 'RED');

  appendManifest({
    type: 'OBSERVATION',
    source: IDENTITY.source,
    domain: IDENTITY.domain,
    retrievedAt: now.toISOString(),
    sha256: result.sha256,
    totalMonitored: result.count,
    elevatedCount: elevated.length,
    warningCount: warning.length,
    elevated: elevated.map(v => `${v.name} (${v.alertLevel}/${v.colorCode})`),
    summary: `${result.count} monitored, ${elevated.length} elevated, ${warning.length} at WARNING+`,
  });

  console.log(`  [OK] ${result.count} volcanoes, ${elevated.length} elevated, ${warning.length} at WARNING+`);
  elevated.forEach(v => console.log(`  [ELEVATED] ${v.name} — ${v.alertLevel}/${v.colorCode} — ${v.region}`));

  // Prune
  const pruned = pruneOldFiles(RAW_DIR, RETENTION_HOURS);
  if (pruned > 0) console.log(`  [PRUNE] Removed ${pruned} old files`);
}

// ── Main ────────────────────────────────────────────────────────
console.log(`[VOLCANIC] ${IDENTITY.name} v${IDENTITY.version}`);
console.log(`[VOLCANIC] Source: ${IDENTITY.source}`);
console.log(`[VOLCANIC] Interval: ${CONFIG.intervalMs}ms`);

cycle();
setInterval(cycle, CONFIG.intervalMs);
process.on('uncaughtException', (err) => { console.error('[VOLCANIC] FATAL:', err); appendManifest({ type: 'FATAL', error: err.message }); });
