#!/usr/bin/env node
/**
 * TRUTH Observatory — API Server
 * DarkWave Studios LLC — Copyright 2026
 *
 * Serves the Apex UI dashboard and provides REST API endpoints
 * for reading collector manifests, feed status, and detected patterns.
 *
 * DDA 42-Doctrine module mapping:
 *   [01] Identity Kernel    → OBSERVATORY_API_SERVER
 *   [02] Boundary Engine    → Read-only access to /app/state/observatory
 *   [08] Temporal Engine    → All API responses include UTC timestamps
 *   [14] Determinacy Engine → Same input manifests → same API output
 *   [32] Integrity Layer    → Raw manifest data returned unmodified
 */

import { createServer } from 'http';
import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, extname, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const STATE_DIR = process.env.STATE_DIR || join(__dirname, 'state');
const SITE_DIR = join(__dirname, 'site');
const PORT = parseInt(process.env.PORT || '3000', 10);

// ═══════════════════════════════════════════════════════════════════════════
// MIME types for static serving
// ═══════════════════════════════════════════════════════════════════════════
const MIME = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.gif': 'image/gif',
};

// ═══════════════════════════════════════════════════════════════════════════
// Feed Configuration — maps manifest filenames to display metadata
// ═══════════════════════════════════════════════════════════════════════════
const FEEDS = [
  { id: 'nexrad',     manifest: 'nexrad-manifest.jsonl',       name: 'NEXRAD Radar',        domain: 'Atmospheric',    icon: '◉', interval: 300000 },
  { id: 'goes',       manifest: 'goes-manifest.jsonl',         name: 'GOES Satellite',      domain: 'Atmospheric',    icon: '◎', interval: 600000 },
  { id: 'solar',      manifest: 'solar-manifest.jsonl',        name: 'Solar / SWPC',        domain: 'Space Weather',  icon: '☀', interval: 900000 },
  { id: 'earthquake', manifest: 'seismic-manifest.jsonl',      name: 'USGS Seismic',        domain: 'Geological',     icon: '▲', interval: 900000 },
  { id: 'lightning',  manifest: 'lightning-manifest.jsonl',     name: 'GLM Lightning',       domain: 'Atmospheric',    icon: '⚡', interval: 300000 },
  { id: 'grid',       manifest: 'grid-manifest.jsonl',         name: 'EIA Power Grid',      domain: 'Infrastructure', icon: '⏚', interval: 3600000 },
  { id: 'geomag',     manifest: 'geomagnetic-manifest.jsonl',  name: 'Geomagnetic',         domain: 'Space Weather',  icon: '◈', interval: 900000 },
  { id: 'ionosonde',  manifest: 'ionosphere-manifest.jsonl',   name: 'Ionospheric TEC',     domain: 'Space Weather',  icon: '◇', interval: 900000 },
  { id: 'schumann',   manifest: 'schumann-manifest.jsonl',     name: 'Schumann Resonance',  domain: 'Geophysical',    icon: '∿', interval: 3600000 },
  // Stage 3
  { id: 'surface',    manifest: 'surface-manifest.jsonl',      name: 'Surface Stations',    domain: 'Atmospheric',    icon: '◫', interval: 900000 },
  { id: 'blitzortung', manifest: 'blitzortung-manifest.jsonl', name: 'Blitzortung',         domain: 'Atmospheric',    icon: '↯', interval: 600000 },
  { id: 'aircraft',   manifest: 'aircraft-manifest.jsonl',     name: 'ADS-B Aircraft',      domain: 'Infrastructure', icon: '✈', interval: 300000 },
  { id: 'notam',      manifest: 'notam-manifest.jsonl',        name: 'NOTAMs / Cloud Seeding', domain: 'Airspace',    icon: '⚐', interval: 3600000 },
  { id: 'celltower',  manifest: 'celltower-manifest.jsonl',    name: 'Cell Towers',         domain: 'Infrastructure', icon: '⌁', interval: 86400000 },
  { id: 'heater',     manifest: 'heater-manifest.jsonl',       name: 'Iono. Heaters',       domain: 'RF Research',    icon: '⏛', interval: 21600000 },
  { id: 'metals',     manifest: 'trace-metals-manifest.jsonl', name: 'Trace Metals',        domain: 'Ecological',     icon: '⬡', interval: 86400000 },
  { id: 'ecology',    manifest: 'ecology-manifest.jsonl',      name: 'Pollinator Index',    domain: 'Ecological',     icon: '❀', interval: 86400000 },
  { id: 'deposition', manifest: 'deposition-manifest.jsonl',   name: 'Atmo. Deposition',    domain: 'Ecological',     icon: '◌', interval: 86400000 },
];

// ═══════════════════════════════════════════════════════════════════════════
// Manifest Reader — reads NDJSON manifest, returns parsed entries
// ═══════════════════════════════════════════════════════════════════════════
function readManifest(filename, limit = 100) {
  const filepath = join(STATE_DIR, filename);
  if (!existsSync(filepath)) return [];

  try {
    const raw = readFileSync(filepath, 'utf-8');
    const lines = raw.trim().split('\n').filter(Boolean);
    // Return last N entries (most recent)
    const slice = lines.slice(-limit);
    const entries = [];
    for (const line of slice) {
      try { entries.push(JSON.parse(line)); } catch {}
    }
    return entries;
  } catch { return []; }
}

// ═══════════════════════════════════════════════════════════════════════════
// Feed Status — computes live/stale/offline status for each feed
// ═══════════════════════════════════════════════════════════════════════════
function getFeedStatus(feed) {
  const entries = readManifest(feed.manifest, 200);
  const total = entries.length;
  if (total === 0) return { ...feed, status: 'offline', entries: 0, last: null, sparkline: [] };

  const dataEntries = entries.filter(e => e.type !== "RETENTION-PRUNE");
  const last = dataEntries.length > 0 ? dataEntries[dataEntries.length - 1] : entries[entries.length - 1];
  const lastTs = last.timestamp || last.retrievedAt || last.fetchedAt || last.collected_at || last.at || last.writtenAt || null;
  const lastTime = lastTs ? new Date(lastTs).getTime() : 0;
  const age = Date.now() - lastTime;

  // stale = more than 3x the expected interval
  const status = age > feed.interval * 3 ? 'stale' : 'live';

  // Build sparkline: count entries per hour over last 24h
  const now = Date.now();
  const sparkline = [];
  for (let h = 23; h >= 0; h--) {
    const start = now - (h + 1) * 3600000;
    const end = now - h * 3600000;
    const count = entries.filter(e => {
      const ts = new Date(e.timestamp || e.retrievedAt || e.fetchedAt || e.collected_at || e.at || e.writtenAt || 0).getTime();
      return ts >= start && ts < end;
    }).length;
    sparkline.push(count);
  }

  return {
    id: feed.id,
    name: feed.name,
    domain: feed.domain,
    icon: feed.icon,
    status,
    entries: total,
    last: lastTs,
    ageMs: age,
    sparkline,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// Event Ledger — builds a unified stream of events + correlations
// ═══════════════════════════════════════════════════════════════════════════
function buildEventLedger(limit = 40) {
  const allEvents = [];
  const now = Date.now();
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours of events

  // 1. Collect recent events from all manifests
  for (const feed of FEEDS) {
    const entries = readManifest(feed.manifest, 50);
    for (const entry of entries) {
      const ts = entry.retrievedAt || entry.writtenAt || entry.timestamp;
      if (!ts) continue;
      const t = new Date(ts).getTime();
      if (isNaN(t) || now - t > maxAge) continue;

      // Skip prune entries — not interesting to the user
      if (entry.type === 'RETENTION-PRUNE') continue;

      const isGap = entry.type === 'DATA-GAP';
      allEvents.push({
        kind: isGap ? 'gap' : 'observation',
        feedId: feed.id,
        feedName: feed.name,
        domain: feed.domain,
        icon: feed.icon,
        type: entry.type,
        at: ts,
        t,
        source: entry.source || feed.name,
        detail: buildEventDetail(entry, feed),
        isCorrelation: false,
      });
    }
  }

  // 2. Load correlation patterns and deviations
  const corrFile = join(STATE_DIR, 'correlations.json');
  let patterns = [];
  let recentDeviations = [];
  let corrMeta = {};

  if (existsSync(corrFile)) {
    try {
      const data = JSON.parse(readFileSync(corrFile, 'utf-8'));
      patterns = data.patterns || [];
      recentDeviations = data.recentDeviations || [];
      corrMeta = {
        totalObservations: data.totalObservations,
        totalDeviations: data.totalDeviations,
        totalCorrelations: data.totalCorrelations,
        generatedAt: data.generatedAt,
      };

      // Add deviation events
      for (const dev of recentDeviations) {
        const t = new Date(dev.at).getTime();
        if (now - t > maxAge) continue;
        allEvents.push({
          kind: 'deviation',
          feedId: dev.feedId,
          feedName: FEEDS.find(f => f.id === dev.feedId)?.name || dev.feedId,
          domain: dev.domain,
          icon: FEEDS.find(f => f.id === dev.feedId)?.icon || '!',
          type: 'DEVIATION',
          at: dev.at,
          t,
          source: dev.source,
          detail: `${dev.direction === 'above' ? '\u2191' : '\u2193'}${Math.abs(dev.zScore)}\u03C3 from baseline (value: ${typeof dev.value === 'number' ? dev.value.toLocaleString() : dev.value}, expected: ${typeof dev.expected === 'number' ? Math.round(dev.expected).toLocaleString() : dev.expected})`,
          zScore: dev.zScore,
          direction: dev.direction,
          isCorrelation: false,
        });
      }

      // Add correlation pattern events (most recent occurrence)
      for (const pat of patterns) {
        if (!pat.latestEvent) continue;
        const t = new Date(pat.latestEvent).getTime();
        if (now - t > maxAge) continue;
        allEvents.push({
          kind: 'correlation',
          feedId: pat.feeds.join('+'),
          feedName: pat.title,
          domain: pat.domains.join(' \u2194 '),
          icon: '\u2194',
          type: 'CORRELATION',
          at: pat.latestEvent,
          t,
          source: 'Correlation Engine',
          detail: pat.summary,
          confidence: pat.confidence,
          skepticNote: pat.skepticNote,
          verdict: pat.verdict,
          feeds: pat.feeds,
          domains: pat.domains,
          occurrences: pat.occurrences,
          avgLagMinutes: pat.avgLagMinutes,
          isCorrelation: true,
        });
      }
    } catch {}
  }

  // 3. Sort by time (newest first) and limit
  allEvents.sort((a, b) => b.t - a.t);
  const events = allEvents.slice(0, limit);

  // 4. Assign block numbers (descending from current block)
  const baseBlock = Math.floor(now / (15 * 60 * 1000)); // 15-min blocks
  events.forEach((ev, i) => {
    ev.block = Math.floor(ev.t / (15 * 60 * 1000));
    ev.blockLabel = `#${ev.block}`;
    // Simple hash: feed + type + timestamp
    ev.hash = simpleHash(`${ev.feedId}:${ev.type}:${ev.at}`).slice(0, 12);
  });

  return {
    timestamp: new Date().toISOString(),
    currentBlock: baseBlock,
    totalEvents: allEvents.length,
    events,
    correlationMeta: corrMeta,
    retention: {
      rawDataDays: 30,
      metadataRetention: 'permanent',
      note: 'Raw observation data is pruned after 30 days. Block hashes and metadata summaries are retained permanently.',
    },
  };
}

function buildEventDetail(entry, feed) {
  // Extract meaningful details from manifest entries
  if (entry.type === 'DATA-GAP') return `Source offline: ${entry.reason || 'unknown'}`;
  if (entry.type === 'GOES-SCAN') return `${entry.satellite || 'GOES'} ${entry.product || ''} ${entry.region || ''}`.trim();
  if (entry.type === 'GRID-DATA') return `${entry.datasetName || 'Grid data'} (${entry.entries || entry.rows || '?'} entries)`;
  if (entry.type === 'SCHUMANN-DATA') return `${entry.stationName || 'Station'} (${entry.country || '?'})`;
  if (entry.type === 'OBSERVATION') {
    const parts = [];
    if (entry.source) parts.push(entry.source);
    if (entry.bytes) parts.push(`${(entry.bytes / 1024).toFixed(1)}KB`);
    if (entry.stations) parts.push(`${entry.stations} stations`);
    if (entry.aircraft) parts.push(`${entry.aircraft} aircraft`);
    if (entry.totalResults) parts.push(`${entry.totalResults.toLocaleString()} results`);
    return parts.join(' \u2014 ') || feed.name;
  }
  return entry.source || entry.type || feed.name;
}

function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

// ═══════════════════════════════════════════════════════════════════════════
// HTTP Server
// ═══════════════════════════════════════════════════════════════════════════
const server = createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const path = url.pathname;

  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');

  // ── API Routes ──────────────────────────────────────────────────────
  if (path === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString(), feeds: FEEDS.length }));
  }

  if (path === '/api/feeds') {
    const statuses = FEEDS.map(getFeedStatus);
    const live = statuses.filter(s => s.status === 'live').length;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      timestamp: new Date().toISOString(),
      total: FEEDS.length,
      live,
      feeds: statuses,
    }));
  }

  if (path.startsWith('/api/feed/')) {
    const feedId = path.split('/')[3];
    const feed = FEEDS.find(f => f.id === feedId);
    if (!feed) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Feed not found' }));
    }
    const limit = parseInt(url.searchParams.get('limit') || '50', 10);
    const entries = readManifest(feed.manifest, limit);
    const status = getFeedStatus(feed);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ...status, recentEntries: entries.slice(-20) }));
  }

  if (path === '/api/events' || path === '/api/correlations') {
    // Read from correlation engine output
    const corrFile = join(STATE_DIR, 'correlations.json');
    if (existsSync(corrFile)) {
      try {
        const data = JSON.parse(readFileSync(corrFile, 'utf-8'));
        if (path === '/api/events') {
          // Return patterns in the events format for the frontend
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({
            timestamp: new Date().toISOString(),
            events: (data.patterns || []).map(p => ({
              title: p.title,
              confidence: p.confidence,
              summary: p.summary,
              skepticNote: p.skepticNote,
              feeds: p.domains,
              occurrences: p.occurrences,
              avgLagMinutes: p.avgLagMinutes,
              verdict: p.verdict,
              latestEvent: p.latestEvent,
            })),
          }));
        }
        // /api/correlations — full analysis output
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify(data));
      } catch {}
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      timestamp: new Date().toISOString(),
      events: [],
      message: 'Correlation engine is modeling baselines. Patterns will appear as deviations are identified.',
    }));
  }

  // ── Event Ledger — unified stream of events + correlations ──────────
  if (path === '/api/ledger') {
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '40', 10), 100);
    const ledger = buildEventLedger(limit);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify(ledger));
  }

  if (path === '/api/digests') {
    const digestsDir = join(STATE_DIR, 'digests');
    const digests = [];
    if (existsSync(digestsDir)) {
      const files = readdirSync(digestsDir).filter(f => f.endsWith('.json')).sort().reverse().slice(0, 30);
      for (const f of files) {
        try { digests.push(JSON.parse(readFileSync(join(digestsDir, f), 'utf-8'))); } catch {}
      }
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ timestamp: new Date().toISOString(), digests }));
  }

  // ── Static File Serving ─────────────────────────────────────────────
  // Page routes → static HTML files
  const PAGE_ROUTES = {
    '/cockpit': '/cockpit.html',
    '/terms': '/terms.html',
    '/privacy': '/privacy.html',
    '/legal': '/legal.html',
    '/sms-optin': '/sms-optin.html',
    '/about': '/about.html',
    '/explorer': '/explorer.html',
  };
  let filePath = PAGE_ROUTES[path] || (path === '/' ? '/index.html' : path);
  const fullPath = join(SITE_DIR, filePath);

  // Security: prevent directory traversal
  if (!fullPath.startsWith(SITE_DIR)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  if (existsSync(fullPath) && statSync(fullPath).isFile()) {
    const ext = extname(fullPath);
    const mime = MIME[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': mime });
    return res.end(readFileSync(fullPath));
  }

  // SPA fallback
  if (!path.startsWith('/api/') && existsSync(join(SITE_DIR, 'index.html'))) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    return res.end(readFileSync(join(SITE_DIR, 'index.html')));
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, () => {
  console.log(`[OBSERVATORY API] Server listening on port ${PORT}`);
  console.log(`[OBSERVATORY API] State dir: ${STATE_DIR}`);
  console.log(`[OBSERVATORY API] Site dir: ${SITE_DIR}`);
  console.log(`[OBSERVATORY API] Feeds configured: ${FEEDS.length}`);
});
