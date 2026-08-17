#!/usr/bin/env node
/**
 * TRUTH Observatory — Atmospheric Deposition Chemistry Collector
 * DarkWave Studios LLC — Copyright 2026
 *
 * Fetches wet and dry deposition chemistry data from the
 * National Atmospheric Deposition Program (NADP) and
 * CoCoRaHS community rain gauge network.
 * All public — no API keys required.
 *
 * DDA 42-Doctrine module mapping:
 *   [01] Identity Kernel    → COLLECTOR_IDENTITY
 *   [02] Boundary Engine    → Only NADP + CoCoRaHS sources
 *   [14] Determinacy Engine → SHA-256 hash of every response
 *   [32] Integrity Layer    → Raw data preserved as-is
 *   [40] Non-Being Guard    → Missing data recorded as gap
 *
 * Sources:
 *   - NADP NTN: https://nadp.slh.wisc.edu/networks/national-trends-network/
 *   - NADP MDN: https://nadp.slh.wisc.edu/networks/mercury-deposition-network/
 *   - CoCoRaHS: https://www.cocorahs.org/ViewData/
 */

import { createHash } from 'crypto';
import { mkdirSync, writeFileSync, readdirSync, statSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..', '..');
const STATE_DIR = process.env.STATE_DIR || join(REPO_ROOT, 'observatory', 'state');
const RAW_DIR = process.env.RAW_DIR || join(REPO_ROOT, 'observatory', 'raw', 'deposition');

const IDENTITY = Object.freeze({
  name: 'observatory-atmospheric-deposition-collector',
  version: '1.0.0',
  author: 'Andrews, Ronald Jason — DarkWave Studios LLC',
  architecture: 'DDA 42-Doctrine / Deterministic Dissolution Ladder',
  source: 'NADP NTN/MDN + CoCoRaHS',
  domain: 'ecological-chemistry',
  dataType: 'deposition-chemistry',
  maxConsecutiveFailures: 5,
});

const SOURCES = [
  { id: 'nadp-ntn', name: 'NADP NTN Site List', url: 'https://nadp.slh.wisc.edu/networks/national-trends-network/' },
  { id: 'nadp-mdn', name: 'NADP Mercury Deposition', url: 'https://nadp.slh.wisc.edu/networks/mercury-deposition-network/' },
  { id: 'nadp-data', name: 'NADP Data Access', url: 'https://nadp.slh.wisc.edu/data/' },
  { id: 'cocorahs-tn', name: 'CoCoRaHS Tennessee', url: 'https://www.cocorahs.org/ViewData/ListDailyPrecipReports.aspx?state=TN' },
  { id: 'cocorahs-national', name: 'CoCoRaHS National', url: 'https://www.cocorahs.org/ViewData/ListDailyPrecipReports.aspx' },
];

const CONFIG = Object.freeze({
  intervalMs: parseInt(process.env.DEPOSITION_INTERVAL_MS || '86400000', 10), // Daily
  timeoutMs: 30000,
});

function manifestFilePath() { mkdirSync(STATE_DIR, { recursive: true }); return join(STATE_DIR, 'deposition-manifest.jsonl'); }
function appendManifest(entry) { writeFileSync(manifestFilePath(), JSON.stringify({ ...entry, writtenAt: new Date().toISOString() }) + '\n', { flag: 'a' }); }
function sha256(buffer) { return createHash('sha256').update(buffer).digest('hex'); }

async function safeFetch(url) {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), CONFIG.timeoutMs);
    const res = await fetch(url, { signal: controller.signal, headers: { 'User-Agent': 'TruthObservatory/1.0 (research)' } });
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
  console.log(`\n[DEPOSITION] Cycle start — ${now.toISOString()}`);

  let successes = 0;
  for (const source of SOURCES) {
    const result = await safeFetch(source.url);
    if (result.ok) {
      const ext = result.body.trim().startsWith('{') || result.body.trim().startsWith('[') ? 'json' : 'html';
      const filename = `${source.id}_${dateStr}.${ext}`;
      writeFileSync(join(rawDir, filename), result.body);
      appendManifest({ type: 'OBSERVATION', source: source.name, sourceId: source.id, domain: IDENTITY.domain, retrievedAt: now.toISOString(), sha256: result.sha256, bytes: result.body.length });
      console.log(`  [${source.id}] ${result.body.length} bytes`);
      successes++;
    } else {
      appendManifest({ type: 'DATA-GAP', source: source.name, sourceId: source.id, domain: IDENTITY.domain, retrievedAt: now.toISOString(), reason: result.error });
      console.log(`  [${source.id} GAP] ${result.error}`);
    }
    await new Promise(r => setTimeout(r, 1500));
  }

  if (successes > 0) consecutiveFailures = 0;
  else { consecutiveFailures++; if (consecutiveFailures >= IDENTITY.maxConsecutiveFailures) { console.error('  [COLLAPSE] Halting'); process.exit(1); } }
  console.log(`  [DEPOSITION] ${successes}/${SOURCES.length} sources reached`);
  pruneOldFiles(RAW_DIR, RETENTION_DAYS);
}

console.log(`[DEPOSITION] ${IDENTITY.name} v${IDENTITY.version}`);
console.log(`[DEPOSITION] Sources: ${SOURCES.map(s => s.name).join(', ')}`);
console.log(`[DEPOSITION] Interval: ${CONFIG.intervalMs}ms`);

process.on('uncaughtException', (err) => { console.error('[DEPOSITION] FATAL:', err); appendManifest({ type: 'FATAL', error: err.message, at: new Date().toISOString() }); process.exit(1); });
(async () => { await runCycle(); setInterval(runCycle, CONFIG.intervalMs); })();
