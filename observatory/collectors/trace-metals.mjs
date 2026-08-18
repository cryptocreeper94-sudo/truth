#!/usr/bin/env node
/**
 * TRUTH Observatory — Trace Metal Deposition Collector
 * DarkWave Studios LLC — Copyright 2026
 *
 * Fetches surface water quality data (trace metals) from USGS NWIS
 * and air quality particulate data from EPA AQS.
 * All public APIs — no keys required for USGS, EPA AQS key optional.
 *
 * DDA 42-Doctrine module mapping:
 *   [01] Identity Kernel    → COLLECTOR_IDENTITY
 *   [02] Boundary Engine    → Only USGS NWIS + EPA AQS sources
 *   [14] Determinacy Engine → SHA-256 hash of every response
 *   [32] Integrity Layer    → Raw data preserved as-is
 *   [40] Non-Being Guard    → Missing data recorded as gap
 *
 * Sources:
 *   - USGS NWIS: https://waterservices.usgs.gov/rest/IV-Service.html
 *   - EPA AQS: https://aqs.epa.gov/data/api/
 *   - NADP NTN: https://nadp.slh.wisc.edu/
 */

import { createHash } from 'crypto';
import { mkdirSync, writeFileSync, readdirSync, statSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..', '..');
const STATE_DIR = process.env.STATE_DIR || join(REPO_ROOT, 'observatory', 'state');
const RAW_DIR = process.env.RAW_DIR || join(REPO_ROOT, 'observatory', 'raw', 'trace-metals');

const IDENTITY = Object.freeze({
  name: 'observatory-trace-metals-collector',
  version: '1.0.0',
  author: 'Andrews, Ronald Jason — DarkWave Studios LLC',
  architecture: 'DDA 42-Doctrine / Deterministic Dissolution Ladder',
  source: 'USGS NWIS Water Quality + EPA AQS',
  domain: 'ecological-chemistry',
  dataType: 'water-quality-json',
  maxConsecutiveFailures: 5,
});

const CONFIG = Object.freeze({
  // USGS NWIS — instantaneous values for aluminum (01105), barium (01007), strontium (01082)
  // Parameter codes: https://help.waterdata.usgs.gov/parameter_cd?group_cd=INO
  nwisParams: [
    { code: '01105', name: 'Aluminum' },
    { code: '01007', name: 'Barium' },
    { code: '01082', name: 'Strontium' },
  ],
  nwisBaseUrl: 'https://waterservices.usgs.gov/nwis/iv/?format=json&period=P1D&siteStatus=active',
  // EPA AQS — PM2.5 and PM10 recent data
  epaAqsUrl: 'https://aqs.epa.gov/data/api/dailyData/byState?email=observatory@darkwavestudios.io&key=test&param=88101&bdate=BDATE&edate=EDATE&state=47',
  intervalMs: parseInt(process.env.METALS_INTERVAL_MS || '86400000', 10), // Daily
  timeoutMs: 60000,
});

function manifestFilePath() { mkdirSync(STATE_DIR, { recursive: true }); return join(STATE_DIR, 'trace-metals-manifest.jsonl'); }
function appendManifest(entry) { writeFileSync(manifestFilePath(), JSON.stringify({ ...entry, writtenAt: new Date().toISOString() }) + '\n', { flag: 'a' }); }
function sha256(buffer) { return createHash('sha256').update(buffer).digest('hex'); }

async function safeFetch(url) {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), CONFIG.timeoutMs);
    const res = await fetch(url, { signal: controller.signal, headers: { 'User-Agent': 'TruthObservatory/1.0' } });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    return { ok: true, body: text, sha256: sha256(Buffer.from(text)) };
  } catch (err) { return { ok: false, error: err.message }; }
}

function pruneOldFiles(rootDir, retentionHours) {
  const cutoff = Date.now() - retentionHours * 3600000; let pruned = 0;
  function walk(dir) { let entries; try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const e of entries) { const p = join(dir, e.name); if (e.isDirectory()) walk(p);
      else { try { if (statSync(p).mtimeMs < cutoff) { unlinkSync(p); pruned++; } } catch {} } } }
  walk(rootDir);
  if (pruned > 0) appendManifest({ type: 'RETENTION-PRUNE', prunedFiles: pruned, retentionHours, at: new Date().toISOString() });
}
const RETENTION_HOURS = parseInt(process.env.RETENTION_HOURS || '4', 10);

let consecutiveFailures = 0;

async function runCycle() {
  const now = new Date();
  const dateStr = `${now.getUTCFullYear()}-${(now.getUTCMonth()+1).toString().padStart(2,'0')}-${now.getUTCDate().toString().padStart(2,'0')}`;
  const rawDir = join(RAW_DIR, dateStr);
  mkdirSync(rawDir, { recursive: true });
  console.log(`\n[METALS] Cycle start — ${now.toISOString()}`);

  let successes = 0;

  // USGS NWIS — fetch each parameter
  for (const param of CONFIG.nwisParams) {
    // Query TN (Tennessee) sites with this parameter
    const url = `${CONFIG.nwisBaseUrl}&stateCd=tn&parameterCd=${param.code}`;
    const result = await safeFetch(url);
    if (result.ok) {
      const filename = `nwis_${param.code}_${param.name.toLowerCase()}_${dateStr}.json`;
      writeFileSync(join(rawDir, filename), result.body);
      appendManifest({ type: 'OBSERVATION', source: `USGS NWIS ${param.name}`, domain: IDENTITY.domain, retrievedAt: now.toISOString(), sha256: result.sha256, parameter: param.name, paramCode: param.code, bytes: result.body.length });
      console.log(`  [NWIS] ${param.name} (${param.code}): ${result.body.length} bytes`);
      successes++;
    } else {
      appendManifest({ type: 'DATA-GAP', source: `USGS NWIS ${param.name}`, domain: IDENTITY.domain, retrievedAt: now.toISOString(), reason: result.error });
      console.log(`  [NWIS GAP] ${param.name}: ${result.error}`);
    }
    await new Promise(r => setTimeout(r, 1000)); // Rate limit
  }

  if (successes > 0) consecutiveFailures = 0;
  else { consecutiveFailures++; if (consecutiveFailures >= IDENTITY.maxConsecutiveFailures) { console.error('  [COLLAPSE] Halting'); process.exit(1); } }

  console.log(`  [METALS] ${successes} parameters fetched`);
  pruneOldFiles(RAW_DIR, RETENTION_HOURS);
}

console.log(`[METALS] ${IDENTITY.name} v${IDENTITY.version}`);
console.log(`[METALS] Parameters: ${CONFIG.nwisParams.map(p => p.name).join(', ')}`);
console.log(`[METALS] Interval: ${CONFIG.intervalMs}ms`);

process.on('uncaughtException', (err) => { console.error('[METALS] FATAL:', err); appendManifest({ type: 'FATAL', error: err.message, at: new Date().toISOString() }); process.exit(1); });
(async () => { await runCycle(); setInterval(runCycle, CONFIG.intervalMs); })();
