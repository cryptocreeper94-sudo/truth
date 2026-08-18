#!/usr/bin/env node
/**
 * TRUTH Observatory — FCC Cell Tower Registry Collector
 * DarkWave Studios LLC — Copyright 2026
 *
 * Fetches cell tower registration data from the FCC ASR (Antenna Structure
 * Registration) database and supplements with OpenCelliD community data.
 *
 * DDA 42-Doctrine module mapping:
 *   [01] Identity Kernel    → COLLECTOR_IDENTITY
 *   [02] Boundary Engine    → Only FCC + OpenCelliD sources
 *   [14] Determinacy Engine → SHA-256 hash of every response
 *   [32] Integrity Layer    → Raw data preserved as-is
 *   [40] Non-Being Guard    → Missing data recorded as gap
 *
 * Sources:
 *   - FCC ASR: https://www.fcc.gov/uls/transactions/daily-weekly
 *   - OpenCelliD: https://opencellid.org/downloads.php (token required)
 */

import { createHash } from 'crypto';
import { mkdirSync, writeFileSync, readdirSync, statSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..', '..');
const STATE_DIR = process.env.STATE_DIR || join(REPO_ROOT, 'observatory', 'state');
const RAW_DIR = process.env.RAW_DIR || join(REPO_ROOT, 'observatory', 'raw', 'celltower');

const IDENTITY = Object.freeze({
  name: 'observatory-celltower-collector',
  version: '1.0.0',
  author: 'Andrews, Ronald Jason — DarkWave Studios LLC',
  architecture: 'DDA 42-Doctrine / Deterministic Dissolution Ladder',
  source: 'FCC ASR Database + OpenCelliD',
  domain: 'infrastructure-rf',
  dataType: 'cell-tower-registry',
  maxConsecutiveFailures: 5,
});

const CONFIG = Object.freeze({
  // FCC ASR public search — query for recently registered structures
  fccUrl: 'https://www.fcc.gov/api/license-view/basicSearch/getLicenses?searchValue=cell&limit=100&format=json',
  // OpenCelliD — requires OCID_TOKEN
  ocidToken: process.env.OCID_TOKEN || '',
  ocidUrl: 'https://opencellid.org/cell/getInArea?BBOX=-125,24,-66,50&format=json&limit=1000',
  intervalMs: parseInt(process.env.CELLTOWER_INTERVAL_MS || '86400000', 10), // Daily
  maxRetries: 3,
  retryDelayMs: 3000,
  timeoutMs: 60000,
});

function manifestFilePath() { mkdirSync(STATE_DIR, { recursive: true }); return join(STATE_DIR, 'celltower-manifest.jsonl'); }
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
  console.log(`\n[CELLTOWER] Cycle start — ${now.toISOString()}`);

  let anySuccess = false;

  // 1. FCC ASR
  const fcc = await safeFetch(CONFIG.fccUrl);
  if (fcc.ok) {
    const filename = `fcc_${now.toISOString().replace(/[:.]/g, '-')}.json`;
    writeFileSync(join(rawDir, filename), fcc.body);
    appendManifest({ type: 'OBSERVATION', source: 'FCC ASR', domain: IDENTITY.domain, retrievedAt: now.toISOString(), sha256: fcc.sha256, bytes: fcc.body.length });
    console.log(`  [FCC] ${fcc.body.length} bytes`);
    anySuccess = true;
  } else {
    appendManifest({ type: 'DATA-GAP', source: 'FCC ASR', domain: IDENTITY.domain, retrievedAt: now.toISOString(), reason: fcc.error });
    console.log(`  [FCC GAP] ${fcc.error}`);
  }

  // 2. OpenCelliD (if token set)
  if (CONFIG.ocidToken) {
    const ocidUrl = `${CONFIG.ocidUrl}&key=${CONFIG.ocidToken}`;
    const ocid = await safeFetch(ocidUrl);
    if (ocid.ok) {
      const filename = `ocid_${now.toISOString().replace(/[:.]/g, '-')}.json`;
      writeFileSync(join(rawDir, filename), ocid.body);
      appendManifest({ type: 'OBSERVATION', source: 'OpenCelliD', domain: IDENTITY.domain, retrievedAt: now.toISOString(), sha256: ocid.sha256, bytes: ocid.body.length });
      console.log(`  [OCID] ${ocid.body.length} bytes`);
      anySuccess = true;
    }
  } else {
    console.log('  [OCID] OCID_TOKEN not set — skipping OpenCelliD');
  }

  if (anySuccess) consecutiveFailures = 0;
  else { consecutiveFailures++; if (consecutiveFailures >= IDENTITY.maxConsecutiveFailures) { console.error('  [COLLAPSE] Halting'); process.exit(1); } }
  pruneOldFiles(RAW_DIR, RETENTION_HOURS);
}

console.log(`[CELLTOWER] ${IDENTITY.name} v${IDENTITY.version}`);
console.log(`[CELLTOWER] Interval: ${CONFIG.intervalMs}ms`);
process.on('uncaughtException', (err) => { console.error('[CELLTOWER] FATAL:', err); appendManifest({ type: 'FATAL', error: err.message, at: new Date().toISOString() }); process.exit(1); });
(async () => { await runCycle(); setInterval(runCycle, CONFIG.intervalMs); })();
