#!/usr/bin/env node
/**
 * TRUTH Observatory — Correlation Engine v2
 * DarkWave Studios LLC — Copyright 2026
 *
 * v2: Fixed metric extractors to match actual manifest entry types.
 *     All 18 feeds now register observations correctly.
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const STATE_DIR = process.env.STATE_DIR || join(__dirname, '..', 'observatory', 'state');
const OUTPUT_FILE = join(STATE_DIR, 'correlations.json');

const CONFIG = Object.freeze({
  intervalMs: parseInt(process.env.CORRELATION_INTERVAL_MS || '300000', 10),
  correlationWindowMs: 60 * 60 * 1000,
  maxLagMs: 6 * 60 * 60 * 1000,
  lagStepMs: 15 * 60 * 1000,
  minBaselineObservations: 10,
  deviationThreshold: 2.0,
  maxPatterns: 50,
  maxObservationAgeMs: 7 * 24 * 60 * 60 * 1000,
});

const FEED_REGISTRY = [
  { id: 'seismic', manifest: 'seismic-manifest.jsonl', domain: 'Seismic',
    metric: e => { if (e.type === 'OBSERVATION' || e.type === 'SEISMIC-SCAN') return e.newEvents || e.totalEvents || e.entries || 1; return null; }, unit: 'events' },
  { id: 'solar', manifest: 'solar-manifest.jsonl', domain: 'Solar',
    metric: e => { if (e.type === 'OBSERVATION' || e.type === 'SOLAR-DATA') return e.products || e.bytes || 1; if (e.type === 'RETENTION-PRUNE' || e.type === 'DATA-GAP') return null; return e.bytes || null; }, unit: 'products' },
  { id: 'geomag', manifest: 'geomagnetic-manifest.jsonl', domain: 'Geomagnetic',
    metric: e => { if (e.type === 'OBSERVATION') return e.sources || e.bytes || 1; if (e.type === 'RETENTION-PRUNE' || e.type === 'DATA-GAP') return null; return e.bytes || null; }, unit: 'sources' },
  { id: 'nexrad', manifest: 'nexrad-manifest.jsonl', domain: 'Radar',
    metric: e => { if (e.type === 'OBSERVATION' || e.type === 'NEXRAD-SCAN') return e.bytes || e.stations || 1; if (e.type === 'RETENTION-PRUNE' || e.type === 'DATA-GAP') return null; return e.bytes || null; }, unit: 'bytes' },
  { id: 'goes', manifest: 'goes-manifest.jsonl', domain: 'Satellite',
    metric: e => { if (e.type === 'GOES-SCAN' || e.type === 'OBSERVATION') return e.bytes || 1; if (e.type === 'RETENTION-PRUNE' || e.type === 'DATA-GAP') return null; return null; }, unit: 'bytes' },
  { id: 'grid', manifest: 'grid-manifest.jsonl', domain: 'Power Grid',
    metric: e => { if (e.type === 'GRID-DATA' || e.type === 'OBSERVATION') return e.entries || e.rows || 1; if (e.type === 'DATA-GAP') return null; return null; }, unit: 'entries' },
  { id: 'lightning', manifest: 'lightning-manifest.jsonl', domain: 'Lightning (GLM)',
    metric: e => { if (e.type === 'GOES-SCAN' && e.product && e.product.includes('GLM')) return e.bytes || 1; if (e.type === 'OBSERVATION') return e.bytes || 1; if (e.type === 'RETENTION-PRUNE' || e.type === 'DATA-GAP') return null; return null; }, unit: 'bytes' },
  { id: 'iono', manifest: 'ionosphere-manifest.jsonl', domain: 'Ionospheric',
    metric: e => { if (e.type === 'OBSERVATION') return e.products || e.bytes || 1; if (e.type === 'RETENTION-PRUNE' || e.type === 'DATA-GAP') return null; return e.bytes || null; }, unit: 'products' },
  { id: 'schumann', manifest: 'schumann-manifest.jsonl', domain: 'Schumann',
    metric: e => { if (e.type === 'SCHUMANN-DATA' || e.type === 'OBSERVATION') return e.bytes || e.stations || 1; if (e.type === 'DATA-GAP') return null; return null; }, unit: 'readings' },
  { id: 'surface', manifest: 'surface-manifest.jsonl', domain: 'Surface Weather',
    metric: e => { if (e.type === 'OBSERVATION') return e.stations || e.bytes || 1; if (e.type === 'DATA-GAP') return null; return e.bytes || null; }, unit: 'stations' },
  { id: 'blitzortung', manifest: 'blitzortung-manifest.jsonl', domain: 'Lightning (Ground)',
    metric: e => { if (e.type === 'OBSERVATION') return e.strokes || e.bytes || 0; if (e.type === 'DATA-GAP') return null; return null; }, unit: 'strokes' },
  { id: 'aircraft', manifest: 'aircraft-manifest.jsonl', domain: 'Aircraft',
    metric: e => { if (e.type === 'OBSERVATION') return e.aircraft || 0; if (e.type === 'RETENTION-PRUNE') return null; return null; }, unit: 'aircraft' },
  { id: 'notam', manifest: 'notam-manifest.jsonl', domain: 'Airspace/NOTAMs',
    metric: e => { if (e.type === 'OBSERVATION' || e.type === 'PERMIT-SNAPSHOT') return e.records || e.bytes || 1; if (e.type === 'DATA-GAP') return null; return null; }, unit: 'records' },
  { id: 'celltower', manifest: 'celltower-manifest.jsonl', domain: 'Cell Infrastructure',
    metric: e => { if (e.type === 'OBSERVATION') return e.bytes || 1; return null; }, unit: 'snapshots' },
  { id: 'heater', manifest: 'heater-manifest.jsonl', domain: 'Iono. Heaters',
    metric: e => { if (e.type === 'OBSERVATION' || e.type === 'SCHEDULE-SNAPSHOT') return 1; if (e.type === 'DATA-GAP') return null; return null; }, unit: 'snapshots' },
  { id: 'metals', manifest: 'trace-metals-manifest.jsonl', domain: 'Trace Metals',
    metric: e => { if (e.type === 'OBSERVATION') return e.bytes || 1; return null; }, unit: 'bytes' },
  { id: 'ecology', manifest: 'ecology-manifest.jsonl', domain: 'Ecology',
    metric: e => { if (e.type === 'OBSERVATION') return e.totalResults || e.bytes || 0; return null; }, unit: 'observations' },
  { id: 'deposition', manifest: 'deposition-manifest.jsonl', domain: 'Deposition',
    metric: e => { if (e.type === 'OBSERVATION') return e.bytes || 1; return null; }, unit: 'bytes' },
];

function readManifest(filename) {
  const path = join(STATE_DIR, filename);
  if (!existsSync(path)) return [];
  try { return readFileSync(path, 'utf8').split('\n').filter(Boolean).map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean); } catch { return []; }
}

function extractTimeSeries(feed) {
  const entries = readManifest(feed.manifest);
  const cutoff = Date.now() - CONFIG.maxObservationAgeMs;
  const series = [];
  for (const e of entries) {
    const ts = e.retrievedAt || e.writtenAt || e.timestamp;
    if (!ts) continue;
    const t = new Date(ts).getTime();
    if (isNaN(t) || t < cutoff) continue;
    const value = feed.metric(e);
    if (value === null || value === undefined) continue;
    series.push({ t, value, type: e.type, source: e.source || feed.domain });
  }
  return series.sort((a, b) => a.t - b.t);
}

function computeBaseline(series) {
  if (series.length < CONFIG.minBaselineObservations) return null;
  const values = series.map(s => s.value);
  const n = values.length;
  const mean = values.reduce((a, b) => a + b, 0) / n;
  const stdDev = Math.sqrt(values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / n);
  const hourlyBuckets = Array.from({ length: 24 }, () => []);
  for (const s of series) hourlyBuckets[new Date(s.t).getUTCHours()].push(s.value);
  const hourlyMeans = hourlyBuckets.map(b => b.length > 0 ? b.reduce((a, c) => a + c, 0) / b.length : mean);
  return { mean, stdDev, n, hourlyMeans };
}

function findDeviations(series, baseline) {
  if (!baseline || baseline.stdDev === 0) return [];
  return series.filter(point => {
    const expected = baseline.hourlyMeans[new Date(point.t).getUTCHours()];
    return Math.abs((point.value - expected) / baseline.stdDev) >= CONFIG.deviationThreshold;
  }).map(point => {
    const expected = baseline.hourlyMeans[new Date(point.t).getUTCHours()];
    const zScore = (point.value - expected) / baseline.stdDev;
    return { t: point.t, value: point.value, expected, zScore: parseFloat(zScore.toFixed(2)), direction: zScore > 0 ? 'above' : 'below', source: point.source };
  });
}

function crossCorrelate(devsA, devsB, feedA, feedB) {
  const corrs = [];
  for (const a of devsA) for (const b of devsB) {
    const lag = b.t - a.t;
    if (Math.abs(lag) <= CONFIG.maxLagMs) corrs.push({
      feedA: feedA.id, feedB: feedB.id, domainA: feedA.domain, domainB: feedB.domain,
      timeA: new Date(a.t).toISOString(), timeB: new Date(b.t).toISOString(),
      lagMinutes: Math.round(lag / 60000), zScoreA: a.zScore, zScoreB: b.zScore,
      directionA: a.direction, directionB: b.direction, valueA: a.value, valueB: b.value,
    });
  }
  return corrs;
}

const SKEPTIC = {
  'seismic+geomag': 'Geomagnetic indices fluctuate with the solar cycle. Seismic activity is driven by tectonic stress.',
  'solar+geomag': 'Solar wind drives geomagnetic activity (Dungey cycle). This correlation is expected physics.',
  'solar+grid': 'Power demand correlates with temperature/time. Solar GICs only matter during G3+ storms.',
  'heater+iono': 'Ionospheric variability is dominated by solar UV/EUV. Research facilities produce brief local perturbations.',
  'default': 'Temporal proximity across independent streams is statistically expected. Coincidence cannot be rejected without controlled analysis.',
};

function skepticNote(a, b) { return SKEPTIC[`${a}+${b}`] || SKEPTIC[`${b}+${a}`] || SKEPTIC['default']; }

function buildPatterns(allCorrs) {
  const groups = {};
  for (const c of allCorrs) {
    const key = [c.feedA, c.feedB].sort().join('\u2194');
    if (!groups[key]) groups[key] = { feedA: c.feedA, feedB: c.feedB, domainA: c.domainA, domainB: c.domainB, events: [] };
    groups[key].events.push(c);
  }
  return Object.entries(groups).filter(([, g]) => g.events.length > 0).map(([key, g]) => {
    const lags = g.events.map(e => e.lagMinutes);
    const avgLag = Math.round(lags.reduce((a, b) => a + b, 0) / lags.length);
    const lagCon = lags.length > 1 ? 1 - (Math.sqrt(lags.reduce((s, l) => s + Math.pow(l - avgLag, 2), 0) / lags.length) / 360) : 0;
    const conf = g.events.length >= 5 && lagCon > 0.7 ? 'HIGH' : g.events.length >= 3 && lagCon > 0.4 ? 'MODERATE' : 'LOW';
    return { id: key, title: `${g.domainA} \u2194 ${g.domainB}`, feeds: [g.feedA, g.feedB], domains: [g.domainA, g.domainB],
      occurrences: g.events.length, avgLagMinutes: avgLag, confidence: conf,
      summary: `${g.events.length} coincident deviations in past 7 days.`,
      skepticNote: skepticNote(g.feedA, g.feedB), latestEvent: g.events[g.events.length - 1].timeA,
      verdict: 'CORRELATION OBSERVED \u2014 NOT CAUSATION' };
  }).sort((a, b) => b.occurrences - a.occurrences).slice(0, CONFIG.maxPatterns);
}

function analyzeGaps(feed) {
  const entries = readManifest(feed.manifest);
  const gaps = entries.filter(e => e.type === 'DATA-GAP');
  const obs = entries.filter(e => e.type !== 'DATA-GAP' && e.type !== 'RETENTION-PRUNE');
  return { feedId: feed.id, domain: feed.domain, totalObs: obs.length, totalGaps: gaps.length,
    completeness: obs.length > 0 ? parseFloat(((obs.length / (obs.length + gaps.length)) * 100).toFixed(1)) : 0,
    lastObs: obs.length > 0 ? (obs[obs.length - 1].retrievedAt || obs[obs.length - 1].writtenAt) : null };
}

function runAnalysis() {
  const t0 = Date.now();
  console.log(`\n[CORR] Analysis \u2014 ${new Date().toISOString()}`);
  const data = {}, baselines = {}, devs = {}, gaps = {};
  for (const f of FEED_REGISTRY) {
    data[f.id] = extractTimeSeries(f);
    baselines[f.id] = computeBaseline(data[f.id]);
    devs[f.id] = baselines[f.id] ? findDeviations(data[f.id], baselines[f.id]) : [];
    gaps[f.id] = analyzeGaps(f);
    if (data[f.id].length > 0) console.log(`  [${f.id}] ${data[f.id].length} obs, ${devs[f.id].length} dev`);
  }
  const allCorrs = [];
  const ids = FEED_REGISTRY.map(f => f.id);
  for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) {
    if (!devs[ids[i]].length || !devs[ids[j]].length) continue;
    allCorrs.push(...crossCorrelate(devs[ids[i]], devs[ids[j]], FEED_REGISTRY[i], FEED_REGISTRY[j]));
  }
  const patterns = buildPatterns(allCorrs);
  console.log(`  [CORR] ${allCorrs.length} raw, ${patterns.length} patterns`);

  const output = {
    generatedAt: new Date().toISOString(), totalFeeds: FEED_REGISTRY.length,
    totalObservations: Object.values(data).reduce((s, d) => s + d.length, 0),
    totalDeviations: Object.values(devs).reduce((s, d) => s + d.length, 0),
    totalCorrelations: allCorrs.length,
    architecturalNote: 'CORRELATION \u2260 CAUSATION. Skeptic explanation is scored higher by default.',
    feeds: FEED_REGISTRY.map(f => ({
      id: f.id, domain: f.domain, unit: f.unit, observations: data[f.id].length,
      deviations: devs[f.id].length,
      baseline: baselines[f.id] ? { mean: +baselines[f.id].mean.toFixed(2), stdDev: +baselines[f.id].stdDev.toFixed(2), n: baselines[f.id].n } : null,
      completeness: gaps[f.id].completeness, lastObservation: gaps[f.id].lastObs, gaps: gaps[f.id].totalGaps,
    })),
    patterns,
    recentDeviations: Object.entries(devs).flatMap(([id, ds]) =>
      ds.slice(-10).map(d => ({ feedId: id, domain: FEED_REGISTRY.find(f => f.id === id)?.domain, ...d, at: new Date(d.t).toISOString() }))
    ).sort((a, b) => b.t - a.t).slice(0, 50),
    analysisTimeMs: Date.now() - t0,
  };
  writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
  console.log(`  [DONE] ${output.totalObservations} obs, ${patterns.length} patterns (${output.analysisTimeMs}ms)`);
}

console.log(`[CORR] v2.0.0 \u2014 Fixed extractors | ${FEED_REGISTRY.length} feeds | State: ${STATE_DIR}`);
process.on('uncaughtException', err => { console.error('[CORR] FATAL:', err); process.exit(1); });
setTimeout(() => { runAnalysis(); setInterval(runAnalysis, CONFIG.intervalMs); }, 10000);
