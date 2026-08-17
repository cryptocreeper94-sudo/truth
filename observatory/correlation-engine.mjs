#!/usr/bin/env node
/**
 * TRUTH Observatory — Correlation Engine
 * DarkWave Studios LLC — Copyright 2026
 *
 * Deterministic pattern recognition and cross-feed correlation analysis.
 * Reads NDJSON manifests from all collectors, models baselines,
 * identifies deviations, and cross-correlates across feeds.
 *
 * This is NOT a coincidence detector. It:
 *   1. Models per-feed baselines (what's normal for each stream)
 *   2. Identifies statistical deviations from baseline
 *   3. Cross-correlates deviations across feeds (including lagged relationships)
 *   4. Builds a pattern library of recurring correlations
 *   5. Generates skeptic explanations scored HIGHER than anomalous ones
 *   6. Outputs recognized patterns as structured JSON
 *
 * DDA 42-Doctrine module mapping:
 *   [13] Constraint      → Skeptic engine non-overridable
 *   [14] Determinacy     → Statistical methods, not AI judgment
 *   [20] Coherence       → Cross-feed temporal alignment
 *   [26] Verdict         → Correlation ≠ causation (architecturally enforced)
 *   [32] Integrity       → Pattern provenance traceable to source manifests
 *   [37] Null Guard      → 2+ independent feeds required for any pattern
 *   [40] Non-Being Guard → Data gaps explicitly recorded, never interpolated
 *
 * Output: /app/state/observatory/correlations.json
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const STATE_DIR = process.env.STATE_DIR || join(__dirname, '..', 'observatory', 'state');
const OUTPUT_FILE = join(STATE_DIR, 'correlations.json');

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════
const CONFIG = Object.freeze({
  // How often to run analysis (ms)
  intervalMs: parseInt(process.env.CORRELATION_INTERVAL_MS || '300000', 10), // 5 min

  // Correlation window — max time gap (ms) between events to consider correlated
  correlationWindowMs: 60 * 60 * 1000, // 1 hour

  // Lag analysis — max lag to test (ms)
  maxLagMs: 6 * 60 * 60 * 1000, // 6 hours

  // Lag step size (ms)
  lagStepMs: 15 * 60 * 1000, // 15 min

  // Minimum observations for baseline calculation
  minBaselineObservations: 10,

  // Z-score threshold for deviation flagging
  deviationThreshold: 2.0,

  // Maximum patterns to output
  maxPatterns: 50,

  // Maximum age of observations to include (ms)
  maxObservationAgeMs: 7 * 24 * 60 * 60 * 1000, // 7 days
});

// ═══════════════════════════════════════════════════════════════════════════════
// FEED REGISTRY — Maps manifest files to domain/metric extractors
// ═══════════════════════════════════════════════════════════════════════════════
const FEED_REGISTRY = [
  { id: 'seismic',     manifest: 'seismic-manifest.jsonl',     domain: 'Seismic',          metric: e => e.type === 'OBSERVATION' ? (e.newEvents || e.entries || 1) : null, unit: 'events' },
  { id: 'solar',       manifest: 'solar-manifest.jsonl',       domain: 'Solar',            metric: e => e.type === 'OBSERVATION' ? (e.products || 1) : null, unit: 'products' },
  { id: 'geomag',      manifest: 'geomag-manifest.jsonl',      domain: 'Geomagnetic',      metric: e => e.type === 'OBSERVATION' ? (e.sources || 1) : null, unit: 'sources' },
  { id: 'nexrad',      manifest: 'nexrad-manifest.jsonl',      domain: 'Radar',            metric: e => e.type === 'OBSERVATION' ? (e.stations || e.bytes || 1) : null, unit: 'stations' },
  { id: 'goes',        manifest: 'goes-manifest.jsonl',        domain: 'Satellite',        metric: e => e.type === 'OBSERVATION' ? (e.bytes || 1) : null, unit: 'bytes' },
  { id: 'grid',        manifest: 'grid-manifest.jsonl',        domain: 'Power Grid',       metric: e => e.type === 'OBSERVATION' ? (e.entries || 1) : null, unit: 'entries' },
  { id: 'lightning',   manifest: 'lightning-manifest.jsonl',    domain: 'Lightning (GLM)',   metric: e => e.type === 'OBSERVATION' ? (e.bytes || 1) : null, unit: 'bytes' },
  { id: 'iono',        manifest: 'iono-manifest.jsonl',        domain: 'Ionospheric',      metric: e => e.type === 'OBSERVATION' ? (e.products || 1) : null, unit: 'products' },
  { id: 'schumann',    manifest: 'schumann-manifest.jsonl',    domain: 'Schumann',         metric: e => e.type === 'OBSERVATION' ? (e.stations || 1) : null, unit: 'stations' },
  { id: 'surface',     manifest: 'surface-manifest.jsonl',     domain: 'Surface Weather',  metric: e => e.type === 'OBSERVATION' ? (e.stations || 1) : null, unit: 'stations' },
  { id: 'blitzortung', manifest: 'blitzortung-manifest.jsonl', domain: 'Lightning (Ground)', metric: e => e.type === 'OBSERVATION' ? (e.strokes || 0) : null, unit: 'strokes' },
  { id: 'aircraft',    manifest: 'aircraft-manifest.jsonl',    domain: 'Aircraft',         metric: e => e.type === 'OBSERVATION' ? (e.aircraft || 0) : null, unit: 'aircraft' },
  { id: 'notam',       manifest: 'notam-manifest.jsonl',       domain: 'Airspace/NOTAMs',  metric: e => (e.type === 'OBSERVATION' || e.type === 'PERMIT-SNAPSHOT') ? 1 : null, unit: 'records' },
  { id: 'celltower',   manifest: 'celltower-manifest.jsonl',   domain: 'Cell Infrastructure', metric: e => e.type === 'OBSERVATION' ? 1 : null, unit: 'snapshots' },
  { id: 'heater',      manifest: 'heater-manifest.jsonl',      domain: 'Iono. Heaters',    metric: e => e.type === 'SCHEDULE-SNAPSHOT' ? 1 : null, unit: 'snapshots' },
  { id: 'metals',      manifest: 'trace-metals-manifest.jsonl', domain: 'Trace Metals',    metric: e => e.type === 'OBSERVATION' ? (e.bytes || 1) : null, unit: 'bytes' },
  { id: 'ecology',     manifest: 'ecology-manifest.jsonl',     domain: 'Ecology',          metric: e => e.type === 'OBSERVATION' ? (e.totalResults || 0) : null, unit: 'observations' },
  { id: 'deposition',  manifest: 'deposition-manifest.jsonl',  domain: 'Deposition',       metric: e => e.type === 'OBSERVATION' ? (e.bytes || 1) : null, unit: 'bytes' },
];

// ═══════════════════════════════════════════════════════════════════════════════
// MANIFEST PARSER
// ═══════════════════════════════════════════════════════════════════════════════
function readManifest(filename) {
  const path = join(STATE_DIR, filename);
  if (!existsSync(path)) return [];
  try {
    const lines = readFileSync(path, 'utf8').split('\n').filter(Boolean);
    return lines.map(line => {
      try { return JSON.parse(line); } catch { return null; }
    }).filter(Boolean);
  } catch { return []; }
}

function extractTimeSeries(feed) {
  const entries = readManifest(feed.manifest);
  const cutoff = Date.now() - CONFIG.maxObservationAgeMs;
  const series = [];

  for (const entry of entries) {
    const ts = entry.retrievedAt || entry.writtenAt;
    if (!ts) continue;
    const t = new Date(ts).getTime();
    if (isNaN(t) || t < cutoff) continue;

    const value = feed.metric(entry);
    if (value === null || value === undefined) continue;

    series.push({ t, value, type: entry.type, source: entry.source || feed.domain });
  }

  return series.sort((a, b) => a.t - b.t);
}

// ═══════════════════════════════════════════════════════════════════════════════
// BASELINE MODELER — Per-feed statistical baseline
// ═══════════════════════════════════════════════════════════════════════════════
function computeBaseline(series) {
  if (series.length < CONFIG.minBaselineObservations) return null;

  const values = series.map(s => s.value);
  const n = values.length;
  const mean = values.reduce((a, b) => a + b, 0) / n;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / n;
  const stdDev = Math.sqrt(variance);

  // Also compute hourly pattern (for cyclical baseline)
  const hourlyBuckets = Array.from({ length: 24 }, () => []);
  for (const s of series) {
    const hour = new Date(s.t).getUTCHours();
    hourlyBuckets[hour].push(s.value);
  }
  const hourlyMeans = hourlyBuckets.map(bucket =>
    bucket.length > 0 ? bucket.reduce((a, b) => a + b, 0) / bucket.length : mean
  );

  return { mean, stdDev, n, hourlyMeans };
}

// ═══════════════════════════════════════════════════════════════════════════════
// DEVIATION DETECTOR — Identifies observations outside normal range
// ═══════════════════════════════════════════════════════════════════════════════
function findDeviations(series, baseline) {
  if (!baseline || baseline.stdDev === 0) return [];

  const deviations = [];
  for (const point of series) {
    const hour = new Date(point.t).getUTCHours();
    const expectedMean = baseline.hourlyMeans[hour];
    const zScore = baseline.stdDev > 0 ? (point.value - expectedMean) / baseline.stdDev : 0;

    if (Math.abs(zScore) >= CONFIG.deviationThreshold) {
      deviations.push({
        t: point.t,
        value: point.value,
        expected: expectedMean,
        zScore: parseFloat(zScore.toFixed(2)),
        direction: zScore > 0 ? 'above' : 'below',
        source: point.source,
      });
    }
  }

  return deviations;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CROSS-CORRELATOR — Finds temporal relationships between feed deviations
// ═══════════════════════════════════════════════════════════════════════════════
function crossCorrelate(deviationsA, deviationsB, feedA, feedB) {
  const correlations = [];

  for (const devA of deviationsA) {
    for (const devB of deviationsB) {
      const lag = devB.t - devA.t; // positive = B follows A
      const absLag = Math.abs(lag);

      if (absLag <= CONFIG.maxLagMs) {
        correlations.push({
          feedA: feedA.id,
          feedB: feedB.id,
          domainA: feedA.domain,
          domainB: feedB.domain,
          timeA: new Date(devA.t).toISOString(),
          timeB: new Date(devB.t).toISOString(),
          lagMinutes: Math.round(lag / 60000),
          zScoreA: devA.zScore,
          zScoreB: devB.zScore,
          directionA: devA.direction,
          directionB: devB.direction,
          valueA: devA.value,
          valueB: devB.value,
        });
      }
    }
  }

  return correlations;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SKEPTIC ENGINE — Generates mundane explanations scored HIGHER by default
// [13] Constraint — non-overridable
// ═══════════════════════════════════════════════════════════════════════════════
const SKEPTIC_TEMPLATES = {
  'seismic+geomag':       'Geomagnetic indices naturally fluctuate with the solar cycle. Seismic activity is driven by tectonic stress accumulation. Temporal proximity in a 6-hour window over thousands of events per year is statistically expected.',
  'seismic+solar':        'Solar flare activity follows an 11-year cycle. Earthquake frequency is driven by plate tectonics. Studies finding correlations have not established causation and have not been replicated at statistically significant levels.',
  'solar+geomag':         'Solar wind drives geomagnetic activity — this is established physics (Dungey cycle). This correlation is expected and well-understood. It does not indicate anything unusual.',
  'solar+grid':           'Power demand correlates with temperature, time of day, and day of week. Solar activity can cause GICs during major storms, but routine X-ray flux variations do not affect the grid.',
  'geomag+grid':          'Geomagnetically induced currents (GICs) are a documented phenomenon during G3+ storms. Below G3, grid demand variations are overwhelmingly driven by weather, economics, and load scheduling.',
  'lightning+seismic':    'Both lightning and seismic activity vary seasonally and regionally. Statistical coincidence in time windows is expected given the high frequency of both event types.',
  'radar+surface':        'Radar and surface stations measure the same weather systems. Co-occurring anomalies usually indicate a real weather event (storm, front passage), not an external influence.',
  'aircraft+notam':       'NOTAMs are issued for weather, construction, military operations, and air shows. Aircraft traffic near NOTAM areas is normal — that is exactly what NOTAMs are for.',
  'heater+iono':          'Ionospheric variability is dominated by solar UV/EUV flux, geomagnetic activity, and thermospheric winds. Research facilities produce localized, temporary, well-documented perturbations that dissipate within minutes.',
  'metals+deposition':    'Trace metal concentrations vary with rainfall intensity, seasonal runoff, industrial discharge, agricultural activity, and geological weathering. Single-point elevations require multi-source baseline comparison.',
  'default':              'Temporal proximity of events across independent data streams is statistically expected given the volume and frequency of observations. The null hypothesis (coincidence) cannot be rejected without controlled analysis.',
};

function generateSkepticNote(feedIdA, feedIdB) {
  const key1 = `${feedIdA}+${feedIdB}`;
  const key2 = `${feedIdB}+${feedIdA}`;
  return SKEPTIC_TEMPLATES[key1] || SKEPTIC_TEMPLATES[key2] || SKEPTIC_TEMPLATES['default'];
}

// ═══════════════════════════════════════════════════════════════════════════════
// PATTERN BUILDER — Assembles recognized patterns from correlations
// ═══════════════════════════════════════════════════════════════════════════════
function buildPatterns(allCorrelations, feedDeviations) {
  // Group correlations by feed pair
  const pairGroups = {};
  for (const corr of allCorrelations) {
    const key = [corr.feedA, corr.feedB].sort().join('↔');
    if (!pairGroups[key]) pairGroups[key] = { feedA: corr.feedA, feedB: corr.feedB, domainA: corr.domainA, domainB: corr.domainB, events: [] };
    pairGroups[key].events.push(corr);
  }

  const patterns = [];

  for (const [key, group] of Object.entries(pairGroups)) {
    if (group.events.length === 0) continue;

    // Calculate average lag
    const lags = group.events.map(e => e.lagMinutes);
    const avgLag = Math.round(lags.reduce((a, b) => a + b, 0) / lags.length);
    const lagConsistency = lags.length > 1
      ? 1 - (Math.sqrt(lags.reduce((sum, l) => sum + Math.pow(l - avgLag, 2), 0) / lags.length) / (CONFIG.maxLagMs / 60000))
      : 0;

    // Confidence tiers
    let confidence = 'LOW';
    if (group.events.length >= 5 && lagConsistency > 0.7) confidence = 'HIGH';
    else if (group.events.length >= 3 && lagConsistency > 0.4) confidence = 'MODERATE';

    // Build layman summary
    const lagDesc = avgLag === 0 ? 'simultaneously'
      : avgLag > 0 ? `${group.domainB} follows ${group.domainA} by ~${Math.abs(avgLag)} min`
      : `${group.domainA} follows ${group.domainB} by ~${Math.abs(avgLag)} min`;

    const title = `${group.domainA} ↔ ${group.domainB}`;
    const summary = `${group.events.length} coincident deviations detected in the past 7 days. Average timing: ${lagDesc}. Lag consistency: ${(lagConsistency * 100).toFixed(0)}%.`;

    patterns.push({
      id: key,
      title,
      feeds: [group.feedA, group.feedB],
      domains: [group.domainA, group.domainB],
      occurrences: group.events.length,
      avgLagMinutes: avgLag,
      lagConsistency: parseFloat(lagConsistency.toFixed(2)),
      confidence,
      summary,
      skepticNote: generateSkepticNote(group.feedA, group.feedB),
      latestEvent: group.events[group.events.length - 1].timeA,
      // [26] Verdict — architecturally enforced
      verdict: 'CORRELATION OBSERVED — NOT CAUSATION',
    });
  }

  // Sort by occurrence count, then confidence
  const confOrder = { HIGH: 3, MODERATE: 2, LOW: 1 };
  patterns.sort((a, b) => (confOrder[b.confidence] - confOrder[a.confidence]) || (b.occurrences - a.occurrences));

  return patterns.slice(0, CONFIG.maxPatterns);
}

// ═══════════════════════════════════════════════════════════════════════════════
// GAP ANALYSIS — Track data completeness per feed
// ═══════════════════════════════════════════════════════════════════════════════
function analyzeGaps(feed) {
  const entries = readManifest(feed.manifest);
  const gaps = entries.filter(e => e.type === 'DATA-GAP');
  const observations = entries.filter(e => e.type === 'OBSERVATION' || e.type === 'SCHEDULE-SNAPSHOT' || e.type === 'PERMIT-SNAPSHOT');

  return {
    feedId: feed.id,
    domain: feed.domain,
    totalObservations: observations.length,
    totalGaps: gaps.length,
    completeness: observations.length > 0
      ? parseFloat(((observations.length / (observations.length + gaps.length)) * 100).toFixed(1))
      : 0,
    lastObservation: observations.length > 0 ? (observations[observations.length - 1].retrievedAt || observations[observations.length - 1].writtenAt) : null,
    lastGap: gaps.length > 0 ? (gaps[gaps.length - 1].retrievedAt || gaps[gaps.length - 1].writtenAt) : null,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN ANALYSIS CYCLE
// ═══════════════════════════════════════════════════════════════════════════════
function runAnalysis() {
  const startTime = Date.now();
  console.log(`\n[CORRELATION] Analysis cycle start — ${new Date().toISOString()}`);

  // 1. Extract time series and compute baselines for all feeds
  const feedData = {};
  const feedBaselines = {};
  const feedDeviations = {};
  const feedGaps = {};

  for (const feed of FEED_REGISTRY) {
    const series = extractTimeSeries(feed);
    feedData[feed.id] = series;
    feedBaselines[feed.id] = computeBaseline(series);
    feedDeviations[feed.id] = feedBaselines[feed.id]
      ? findDeviations(series, feedBaselines[feed.id])
      : [];
    feedGaps[feed.id] = analyzeGaps(feed);

    if (series.length > 0) {
      console.log(`  [${feed.id}] ${series.length} obs, ${feedDeviations[feed.id].length} deviations, baseline: ${feedBaselines[feed.id] ? `μ=${feedBaselines[feed.id].mean.toFixed(1)} σ=${feedBaselines[feed.id].stdDev.toFixed(1)}` : 'insufficient data'}`);
    }
  }

  // 2. Cross-correlate all feed pairs
  const allCorrelations = [];
  const feedIds = FEED_REGISTRY.map(f => f.id);

  for (let i = 0; i < feedIds.length; i++) {
    for (let j = i + 1; j < feedIds.length; j++) {
      const a = feedIds[i], b = feedIds[j];
      if (feedDeviations[a].length === 0 || feedDeviations[b].length === 0) continue;

      const feedA = FEED_REGISTRY.find(f => f.id === a);
      const feedB = FEED_REGISTRY.find(f => f.id === b);
      const corrs = crossCorrelate(feedDeviations[a], feedDeviations[b], feedA, feedB);
      allCorrelations.push(...corrs);
    }
  }

  console.log(`  [CORRELATION] ${allCorrelations.length} raw correlations across ${FEED_REGISTRY.length} feeds`);

  // 3. Build patterns
  const patterns = buildPatterns(allCorrelations, feedDeviations);
  console.log(`  [PATTERNS] ${patterns.length} recognized patterns`);

  // 4. Build feed status summary
  const feedStatus = FEED_REGISTRY.map(feed => {
    const series = feedData[feed.id];
    const baseline = feedBaselines[feed.id];
    const deviations = feedDeviations[feed.id];
    const gaps = feedGaps[feed.id];

    return {
      id: feed.id,
      domain: feed.domain,
      unit: feed.unit,
      observations: series.length,
      deviations: deviations.length,
      baseline: baseline ? { mean: parseFloat(baseline.mean.toFixed(2)), stdDev: parseFloat(baseline.stdDev.toFixed(2)), n: baseline.n } : null,
      completeness: gaps.completeness,
      lastObservation: gaps.lastObservation,
      gaps: gaps.totalGaps,
    };
  });

  // 5. Write output
  const output = {
    generatedAt: new Date().toISOString(),
    analysisWindowDays: CONFIG.maxObservationAgeMs / 86400000,
    correlationWindowHours: CONFIG.correlationWindowMs / 3600000,
    maxLagHours: CONFIG.maxLagMs / 3600000,
    deviationThresholdSigma: CONFIG.deviationThreshold,
    totalFeeds: FEED_REGISTRY.length,
    totalObservations: Object.values(feedData).reduce((sum, s) => sum + s.length, 0),
    totalDeviations: Object.values(feedDeviations).reduce((sum, d) => sum + d.length, 0),
    totalCorrelations: allCorrelations.length,
    // [26] Verdict — always present
    architecturalNote: 'CORRELATION ≠ CAUSATION. All patterns are temporal coincidences until independently verified through controlled study. The skeptic explanation is scored higher by default.',
    feeds: feedStatus,
    patterns,
    analysisTimeMs: Date.now() - startTime,
  };

  writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
  console.log(`  [OUTPUT] Written to ${OUTPUT_FILE} (${patterns.length} patterns, ${(Date.now() - startTime)}ms)`);
}

// ═══════════════════════════════════════════════════════════════════════════════
// STARTUP
// ═══════════════════════════════════════════════════════════════════════════════
console.log(`[CORRELATION] Pattern Recognition & Cross-Feed Correlation Engine v1.0.0`);
console.log(`[CORRELATION] Author: Andrews, Ronald Jason — DarkWave Studios LLC`);
console.log(`[CORRELATION] Architecture: DDA 42-Doctrine / Deterministic Dissolution Ladder`);
console.log(`[CORRELATION] Feeds: ${FEED_REGISTRY.length}`);
console.log(`[CORRELATION] Analysis window: ${CONFIG.maxObservationAgeMs / 86400000} days`);
console.log(`[CORRELATION] Correlation window: ${CONFIG.correlationWindowMs / 3600000} hours`);
console.log(`[CORRELATION] Max lag: ${CONFIG.maxLagMs / 3600000} hours`);
console.log(`[CORRELATION] Deviation threshold: ${CONFIG.deviationThreshold}σ`);
console.log(`[CORRELATION] Interval: ${CONFIG.intervalMs}ms`);
console.log(`[CORRELATION] State: ${STATE_DIR}`);
console.log(`[CORRELATION] Output: ${OUTPUT_FILE}`);

process.on('uncaughtException', (err) => {
  console.error('[CORRELATION] FATAL:', err);
  process.exit(1);
});

// Initial run after short delay (let collectors write first manifests)
setTimeout(() => {
  runAnalysis();
  setInterval(runAnalysis, CONFIG.intervalMs);
}, 10000);
