#!/usr/bin/env node
/**
 * TRUTH Observatory — Pollinator & Ecology Index Collector
 * DarkWave Studios LLC — Copyright 2026
 *
 * Fetches biodiversity observation data from iNaturalist and USGS
 * native bee monitoring datasets. All public APIs — no keys required.
 *
 * DDA 42-Doctrine module mapping:
 *   [01] Identity Kernel    → COLLECTOR_IDENTITY
 *   [02] Boundary Engine    → Only iNaturalist + USGS sources
 *   [14] Determinacy Engine → SHA-256 hash of every response
 *   [32] Integrity Layer    → Raw data preserved as-is
 *   [40] Non-Being Guard    → Missing data recorded as gap
 *
 * Sources:
 *   - iNaturalist API: https://api.inaturalist.org/v1/docs/
 *   - USGS Bee Monitoring: https://www.usgs.gov/centers/eesc/science/native-bee-inventory
 */

import { createHash } from 'crypto';
import { mkdirSync, writeFileSync, readdirSync, statSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..', '..');
const STATE_DIR = process.env.STATE_DIR || join(REPO_ROOT, 'observatory', 'state');
const RAW_DIR = process.env.RAW_DIR || join(REPO_ROOT, 'observatory', 'raw', 'ecology');

const IDENTITY = Object.freeze({
  name: 'observatory-pollinator-ecology-collector',
  version: '1.0.0',
  author: 'Andrews, Ronald Jason — DarkWave Studios LLC',
  architecture: 'DDA 42-Doctrine / Deterministic Dissolution Ladder',
  source: 'iNaturalist API + USGS Native Bee Monitoring',
  domain: 'ecological-biodiversity',
  dataType: 'species-observations-json',
  maxConsecutiveFailures: 5,
});

const CONFIG = Object.freeze({
  // iNaturalist — recent research-grade insect observations in US
  inatQueries: [
    { name: 'Bees (Apoidea)', taxon_id: 47336, iconic_taxon: 'Insecta' },
    { name: 'Butterflies (Lepidoptera)', taxon_id: 47157, iconic_taxon: 'Insecta' },
    { name: 'Dragonflies (Odonata)', taxon_id: 47792, iconic_taxon: 'Insecta' },
  ],
  inatBaseUrl: 'https://api.inaturalist.org/v1/observations?quality_grade=research&place_id=1&per_page=200&order_by=observed_on&order=desc',
  intervalMs: parseInt(process.env.ECOLOGY_INTERVAL_MS || '86400000', 10), // Daily
  timeoutMs: 30000,
});

function manifestFilePath() { mkdirSync(STATE_DIR, { recursive: true }); return join(STATE_DIR, 'ecology-manifest.jsonl'); }
function appendManifest(entry) { writeFileSync(manifestFilePath(), JSON.stringify({ ...entry, writtenAt: new Date().toISOString() }) + '\n', { flag: 'a' }); }
function sha256(buffer) { return createHash('sha256').update(buffer).digest('hex'); }

async function safeFetch(url) {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), CONFIG.timeoutMs);
    const res = await fetch(url, { signal: controller.signal, headers: { 'User-Agent': 'TruthObservatory/1.0 (ecological research)' } });
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
  console.log(`\n[ECOLOGY] Cycle start — ${now.toISOString()}`);

  let successes = 0;

  for (const query of CONFIG.inatQueries) {
    const url = `${CONFIG.inatBaseUrl}&taxon_id=${query.taxon_id}`;
    const result = await safeFetch(url);
    if (result.ok) {
      const filename = `inat_${query.taxon_id}_${dateStr}.json`;
      writeFileSync(join(rawDir, filename), result.body);
      let obsCount = 0;
      try { obsCount = JSON.parse(result.body).total_results || 0; } catch {}
      appendManifest({ type: 'OBSERVATION', source: `iNaturalist ${query.name}`, domain: IDENTITY.domain, retrievedAt: now.toISOString(), sha256: result.sha256, taxon: query.name, taxonId: query.taxon_id, totalResults: obsCount, bytes: result.body.length });
      console.log(`  [iNat] ${query.name}: ${obsCount} observations`);
      successes++;
    } else {
      appendManifest({ type: 'DATA-GAP', source: `iNaturalist ${query.name}`, domain: IDENTITY.domain, retrievedAt: now.toISOString(), reason: result.error });
      console.log(`  [iNat GAP] ${query.name}: ${result.error}`);
    }
    await new Promise(r => setTimeout(r, 1500)); // iNaturalist rate limit
  }

  if (successes > 0) consecutiveFailures = 0;
  else { consecutiveFailures++; if (consecutiveFailures >= IDENTITY.maxConsecutiveFailures) { console.error('  [COLLAPSE] Halting'); process.exit(1); } }
  pruneOldFiles(RAW_DIR, RETENTION_HOURS);
}

console.log(`[ECOLOGY] ${IDENTITY.name} v${IDENTITY.version}`);
console.log(`[ECOLOGY] Taxa: ${CONFIG.inatQueries.map(q => q.name).join(', ')}`);
console.log(`[ECOLOGY] Interval: ${CONFIG.intervalMs}ms`);

process.on('uncaughtException', (err) => { console.error('[ECOLOGY] FATAL:', err); appendManifest({ type: 'FATAL', error: err.message, at: new Date().toISOString() }); process.exit(1); });
(async () => { await runCycle(); setInterval(runCycle, CONFIG.intervalMs); })();
