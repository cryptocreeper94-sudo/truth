#!/usr/bin/env node
/**
 * TRUTH Observatory — FAA NOTAM & Cloud Seeding Permit Collector
 * DarkWave Studios LLC — Copyright 2026
 *
 * Fetches active NOTAMs from the FAA NOTAM API and scrapes known
 * state-level weather modification permit databases.
 * FAA API is public (requires free registration for key).
 *
 * DDA 42-Doctrine module mapping:
 *   [01] Identity Kernel    → COLLECTOR_IDENTITY
 *   [02] Boundary Engine    → Only FAA NOTAM + state permit sources
 *   [08] Temporal Engine    → All notices timestamped UTC
 *   [14] Determinacy Engine → SHA-256 hash of every response
 *   [32] Integrity Layer    → Raw data preserved as-is
 *   [40] Non-Being Guard    → Missing data recorded as gap
 *
 * Sources:
 *   - FAA NOTAM Search: https://notams.aim.faa.gov/notamSearch/
 *   - Texas WM permits: https://www.tdlr.texas.gov/weather/weathermod.htm
 *   - Colorado WM: https://dnr.colorado.gov/divisions/water/weather-modification
 */

import { createHash } from 'crypto';
import { mkdirSync, writeFileSync, readdirSync, statSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..', '..');
const STATE_DIR = process.env.STATE_DIR || join(REPO_ROOT, 'observatory', 'state');
const RAW_DIR = process.env.RAW_DIR || join(REPO_ROOT, 'observatory', 'raw', 'notams');

const IDENTITY = Object.freeze({
  name: 'observatory-notam-collector',
  version: '1.0.0',
  author: 'Andrews, Ronald Jason — DarkWave Studios LLC',
  architecture: 'DDA 42-Doctrine / Deterministic Dissolution Ladder',
  source: 'FAA NOTAM Search + State Weather Modification Permits',
  domain: 'infrastructure-airspace',
  dataType: 'notams-and-permits',
  maxConsecutiveFailures: 5,
});

const CONFIG = Object.freeze({
  // FAA NOTAM API — fetches TFRs and active NOTAMs for key FIRs
  notamUrl: 'https://external-api.faa.gov/notamapi/v1/notams?responseFormat=geoJSON&notamType=N&classification=DOM&sortBy=effectiveStartDate&sortOrder=DESC&pageSize=100',
  notamApiKey: process.env.FAA_API_KEY || '',
  // State weather modification permit pages (public HTML)
  permitUrls: [
    { state: 'TX', url: 'https://www.tdlr.texas.gov/weather/wmlicensees.htm' },
    { state: 'CO', url: 'https://dnr.colorado.gov/divisions/water/weather-modification' },
    { state: 'ND', url: 'https://www.swc.nd.gov/arb/atmospherics/' },
  ],
  intervalMs: parseInt(process.env.NOTAM_INTERVAL_MS || '3600000', 10), // 1 hour
  maxRetries: 3,
  retryDelayMs: 3000,
  timeoutMs: 30000,
});

function manifestFilePath() { mkdirSync(STATE_DIR, { recursive: true }); return join(STATE_DIR, 'notam-manifest.jsonl'); }
function appendManifest(entry) { writeFileSync(manifestFilePath(), JSON.stringify({ ...entry, writtenAt: new Date().toISOString() }) + '\n', { flag: 'a' }); }
function sha256(buffer) { return createHash('sha256').update(buffer).digest('hex'); }

async function safeFetch(url, headers = {}) {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), CONFIG.timeoutMs);
    const res = await fetch(url, { signal: controller.signal, headers: { 'User-Agent': 'TruthObservatory/1.0', ...headers } });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    return { ok: true, body: text, sha256: sha256(Buffer.from(text)) };
  } catch (err) {
    return { ok: false, error: err.message };
  }
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
  console.log(`\n[NOTAM] Cycle start — ${now.toISOString()}`);

  let anySuccess = false;

  // 1. FAA NOTAMs
  if (CONFIG.notamApiKey) {
    const result = await safeFetch(CONFIG.notamUrl, { 'client_id': CONFIG.notamApiKey });
    if (result.ok) {
      const filename = `notam_${now.toISOString().replace(/[:.]/g, '-')}.json`;
      writeFileSync(join(rawDir, filename), result.body);
      let count = 0;
      try { const d = JSON.parse(result.body); count = d.features ? d.features.length : d.items ? d.items.length : 0; } catch {}
      appendManifest({ type: 'OBSERVATION', source: 'FAA NOTAM API', domain: IDENTITY.domain, retrievedAt: now.toISOString(), sha256: result.sha256, notams: count, bytes: result.body.length });
      console.log(`  [NOTAM] ${count} NOTAMs fetched`);
      anySuccess = true;
    } else {
      appendManifest({ type: 'DATA-GAP', source: 'FAA NOTAM API', domain: IDENTITY.domain, retrievedAt: now.toISOString(), reason: result.error });
      console.log(`  [NOTAM GAP] ${result.error}`);
    }
  } else {
    console.log('  [NOTAM] FAA_API_KEY not set — skipping NOTAM fetch');
  }

  // 2. State weather modification permit pages
  for (const permit of CONFIG.permitUrls) {
    const result = await safeFetch(permit.url);
    if (result.ok) {
      const filename = `permit_${permit.state}_${now.toISOString().replace(/[:.]/g, '-')}.html`;
      writeFileSync(join(rawDir, filename), result.body);
      appendManifest({ type: 'PERMIT-SNAPSHOT', source: `${permit.state} Weather Modification`, domain: IDENTITY.domain, retrievedAt: now.toISOString(), sha256: result.sha256, state: permit.state, bytes: result.body.length });
      console.log(`  [PERMIT] ${permit.state}: ${result.body.length} bytes`);
      anySuccess = true;
    } else {
      appendManifest({ type: 'DATA-GAP', source: `${permit.state} WM Permits`, domain: IDENTITY.domain, retrievedAt: now.toISOString(), reason: result.error });
    }
  }

  if (anySuccess) consecutiveFailures = 0;
  else { consecutiveFailures++; if (consecutiveFailures >= IDENTITY.maxConsecutiveFailures) { console.error('  [COLLAPSE] Halting'); process.exit(1); } }

  pruneOldFiles(RAW_DIR, RETENTION_HOURS);
}

console.log(`[NOTAM] ${IDENTITY.name} v${IDENTITY.version}`);
console.log(`[NOTAM] FAA Key: ${CONFIG.notamApiKey ? 'SET' : 'NOT SET'}`);
console.log(`[NOTAM] Permit sources: ${CONFIG.permitUrls.length} states`);
console.log(`[NOTAM] Interval: ${CONFIG.intervalMs}ms`);

process.on('uncaughtException', (err) => { console.error('[NOTAM] FATAL:', err); appendManifest({ type: 'FATAL', error: err.message, at: new Date().toISOString() }); process.exit(1); });
(async () => { await runCycle(); setInterval(runCycle, CONFIG.intervalMs); })();
