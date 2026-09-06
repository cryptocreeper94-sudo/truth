#!/usr/bin/env node
/**
 * TRUTH Observatory — Wildfire Incident Collector
 * DarkWave Studios LLC — Copyright 2026
 *
 * Fetches active wildfire incidents from NIFC (National Interagency Fire Center)
 * via the ESRI ArcGIS FeatureServer. Free, public, no API key required.
 *
 * DDA 42-Doctrine module mapping:
 *   [01] Identity Kernel    → COLLECTOR_IDENTITY
 *   [02] Boundary Engine    → Only active US wildfires
 *   [14] Determinacy Engine → SHA-256 hash of every API response
 *   [32] Integrity Layer    → Raw JSON preserved as-is
 *   [40] Non-Being Guard    → Missing data recorded as gap
 *
 * Source: NIFC / IRWIN via ESRI ArcGIS
 * Endpoint: https://services9.arcgis.com/RHVPKKiFTONKtxq3/ArcGIS/rest/services/USA_Wildfires_v1/FeatureServer/0/query
 */

import { createHash } from 'crypto';
import { mkdirSync, writeFileSync, readdirSync, statSync, unlinkSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..', '..');
const STATE_DIR = process.env.STATE_DIR || join(REPO_ROOT, 'observatory', 'state');
const RAW_DIR = process.env.RAW_DIR || join(REPO_ROOT, 'observatory', 'raw', 'wildfire');

const IDENTITY = Object.freeze({
  name: 'observatory-wildfire-collector',
  version: '1.0.0',
  author: 'Andrews, Ronald Jason — DarkWave Studios LLC',
  architecture: 'DDA 42-Doctrine / Deterministic Dissolution Ladder',
  source: 'NIFC / IRWIN — National Interagency Fire Center',
  domain: 'ecological-wildfire',
  dataType: 'incident-geojson',
  maxConsecutiveFailures: 5,
});

const CONFIG = Object.freeze({
  // ESRI ArcGIS FeatureServer — USA Wildfires (active incidents)
  apiUrl: 'https://services9.arcgis.com/RHVPKKiFTONKtxq3/ArcGIS/rest/services/USA_Wildfires_v1/FeatureServer/0/query',
  // Only fires discovered in last 30 days, not fully contained
  params: new URLSearchParams({
    where: 'PercentContained < 100',
    outFields: 'IncidentName,DailyAcres,PercentContained,FireDiscoveryDateTime,POOState,FireCause,GACC,TotalIncidentPersonnel,ResidencesDestroyed,Fatalities,Injuries,PredominantFuelGroup,PrimaryFuelModel,ModifiedOnDateTime,IrwinID',
    f: 'json',
    resultRecordCount: '200',
    returnGeometry: 'true',
    outSR: '4326',
    orderByFields: 'DailyAcres DESC',
  }),
  intervalMs: parseInt(process.env.WILDFIRE_INTERVAL_MS || '1800000', 10), // 30 min
  timeoutMs: 30000,
});

function manifestFilePath() { mkdirSync(STATE_DIR, { recursive: true }); return join(STATE_DIR, 'wildfire-manifest.jsonl'); }
function appendManifest(entry) { writeFileSync(manifestFilePath(), JSON.stringify({ ...entry, writtenAt: new Date().toISOString() }) + '\n', { flag: 'a' }); }
function sha256(buffer) { return createHash('sha256').update(buffer).digest('hex'); }

async function fetchWildfires() {
  const url = `${CONFIG.apiUrl}?${CONFIG.params.toString()}`;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), CONFIG.timeoutMs);
    const res = await fetch(url, { signal: controller.signal, headers: { 'User-Agent': 'TruthObservatory/1.0' } });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    const hash = sha256(Buffer.from(text));
    const data = JSON.parse(text);
    const fires = (data.features || []).map(f => ({
      name: f.attributes.IncidentName,
      acres: f.attributes.DailyAcres,
      contained: f.attributes.PercentContained,
      state: f.attributes.POOState,
      cause: f.attributes.FireCause,
      gacc: f.attributes.GACC,
      personnel: f.attributes.TotalIncidentPersonnel,
      residences_destroyed: f.attributes.ResidencesDestroyed,
      fatalities: f.attributes.Fatalities,
      injuries: f.attributes.Injuries,
      fuel: f.attributes.PrimaryFuelModel,
      irwinId: f.attributes.IrwinID,
      lat: f.geometry?.y,
      lon: f.geometry?.x,
      discoveredAt: f.attributes.FireDiscoveryDateTime ? new Date(f.attributes.FireDiscoveryDateTime).toISOString() : null,
      updatedAt: f.attributes.ModifiedOnDateTime ? new Date(f.attributes.ModifiedOnDateTime).toISOString() : null,
    }));
    return { status: 'OK', fires, count: fires.length, sha256: hash, body: text };
  } catch (err) {
    return { status: 'FETCH_ERROR', error: err.message, fires: [], count: 0, sha256: null, body: null };
  }
}

function pruneOldFiles(rootDir, retentionHours) {
  const cutoff = Date.now() - retentionHours * 3600000; let pruned = 0;
  function walk(dir) { let entries; try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const e of entries) { const p = join(dir, e.name); if (e.isDirectory()) walk(p);
      else { try { if (statSync(p).mtimeMs < cutoff) { unlinkSync(p); pruned++; } } catch {} } } }
  walk(rootDir); return pruned;
}

const RETENTION_HOURS = parseInt(process.env.RETENTION_HOURS || '72', 10);

async function cycle() {
  const now = new Date();
  console.log(`\n[WILDFIRE] Cycle start — ${now.toISOString()}`);

  const result = await fetchWildfires();

  if (result.status !== 'OK') {
    appendManifest({ type: 'DATA-GAP', source: IDENTITY.source, domain: IDENTITY.domain, retrievedAt: now.toISOString(), reason: result.error || result.status });
    console.log(`  [GAP] ${result.error || result.status}`);
    return;
  }

  // Write raw JSON
  mkdirSync(RAW_DIR, { recursive: true });
  const filename = `wildfire_${now.toISOString().replace(/[:.]/g, '-')}.json`;
  writeFileSync(join(RAW_DIR, filename), JSON.stringify({ fires: result.fires, count: result.count, retrievedAt: now.toISOString() }, null, 2));

  // Summarize
  const totalAcres = result.fires.reduce((sum, f) => sum + (f.acres || 0), 0);
  const largest = result.fires[0];

  appendManifest({
    type: 'OBSERVATION',
    source: IDENTITY.source,
    domain: IDENTITY.domain,
    retrievedAt: now.toISOString(),
    sha256: result.sha256,
    activeFires: result.count,
    totalAcres: Math.round(totalAcres),
    largestFire: largest ? `${largest.name} (${largest.state}) — ${largest.acres?.toLocaleString()} acres` : 'N/A',
    summary: `${result.count} active fires, ${Math.round(totalAcres).toLocaleString()} total acres burning`,
  });

  console.log(`  [OK] ${result.count} active fires, ${Math.round(totalAcres).toLocaleString()} acres`);
  if (largest) console.log(`  [LARGEST] ${largest.name} (${largest.state}) — ${largest.acres?.toLocaleString()} acres, ${largest.contained}% contained`);

  // Prune
  const pruned = pruneOldFiles(RAW_DIR, RETENTION_HOURS);
  if (pruned > 0) console.log(`  [PRUNE] Removed ${pruned} old files`);
}

// ── Main ────────────────────────────────────────────────────────
console.log(`[WILDFIRE] ${IDENTITY.name} v${IDENTITY.version}`);
console.log(`[WILDFIRE] Source: ${IDENTITY.source}`);
console.log(`[WILDFIRE] Interval: ${CONFIG.intervalMs}ms`);

cycle();
setInterval(cycle, CONFIG.intervalMs);
process.on('uncaughtException', (err) => { console.error('[WILDFIRE] FATAL:', err); appendManifest({ type: 'FATAL', error: err.message }); });
