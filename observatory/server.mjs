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
import { randomBytes, createHmac } from 'crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const STATE_DIR = process.env.STATE_DIR || join(__dirname, 'state');
const SITE_DIR = join(__dirname, 'site');
const PORT = parseInt(process.env.PORT || '3000', 10);

// ═══════════════════════════════════════════════════════════════════════════
// Stripe & Database Configuration (dynamic imports — graceful degradation)
// ═══════════════════════════════════════════════════════════════════════════
let stripe = null;
let pool = null;

const STRIPE_PRICE_ID = process.env.STRIPE_PRICE_ID || '';
const SITE_URL = process.env.SITE_URL || 'https://observatory.tlid.io';
const SESSION_SECRET = process.env.SESSION_SECRET || 'dev-secret-change-me';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
const PK_KEY = process.env.STRIPE_PUBLISHABLE_KEY || '';

// Load Stripe (optional — server starts without it)
try {
  const Stripe = (await import('stripe')).default;
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2024-12-18.acacia' });
  console.log('[OBSERVATORY] Stripe loaded');
} catch (err) {
  console.warn('[OBSERVATORY] Stripe not available:', err.message);
}

// Load PostgreSQL (optional — server starts without it)
try {
  if (process.env.DATABASE_URL) {
    const pg = (await import('pg')).default;
    pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: false, max: 5 });
    console.log('[OBSERVATORY] PostgreSQL pool created');
  }
} catch (err) {
  console.warn('[OBSERVATORY] PostgreSQL not available:', err.message);
}

// ═══════════════════════════════════════════════════════════════════════════
// Database Initialization
// ═══════════════════════════════════════════════════════════════════════════
async function initDatabase() {
  if (!pool) { console.warn('[OBSERVATORY] No DATABASE_URL — billing disabled'); return; }
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS subscribers (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        stripe_customer_id TEXT UNIQUE NOT NULL,
        stripe_subscription_id TEXT,
        status TEXT DEFAULT 'active',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        subscriber_id INTEGER REFERENCES subscribers(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days'
      );
    `);
    console.log('[OBSERVATORY] Database tables ready');
  } catch (err) {
    console.error('[OBSERVATORY] Database init error:', err.message);
  }
}
initDatabase();

// ═══════════════════════════════════════════════════════════════════════════
// Session Management
// ═══════════════════════════════════════════════════════════════════════════
function signCookie(value) {
  return value + '.' + createHmac('sha256', SESSION_SECRET).update(value).digest('hex').slice(0, 16);
}

function verifyCookie(signed) {
  if (!signed) return null;
  const idx = signed.lastIndexOf('.');
  if (idx < 0) return null;
  const value = signed.slice(0, idx);
  const sig = signed.slice(idx + 1);
  const expected = createHmac('sha256', SESSION_SECRET).update(value).digest('hex').slice(0, 16);
  return sig === expected ? value : null;
}

function parseCookies(req) {
  const header = req.headers.cookie || '';
  const cookies = {};
  header.split(';').forEach(c => {
    const [k, ...v] = c.trim().split('=');
    if (k) cookies[k.trim()] = decodeURIComponent(v.join('='));
  });
  return cookies;
}

function setSessionCookie(res, sessionId) {
  const signed = signCookie(sessionId);
  res.setHeader('Set-Cookie', `obs_session=${encodeURIComponent(signed)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${30 * 24 * 3600}`);
}

function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', 'obs_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0');
}

async function getSubscriberFromRequest(req) {
  if (!pool) return null;
  const cookies = parseCookies(req);
  const sessionId = verifyCookie(cookies.obs_session);
  if (!sessionId) return null;
  try {
    const result = await pool.query(
      `SELECT s.*, sub.email, sub.status, sub.stripe_customer_id, sub.stripe_subscription_id
       FROM sessions s JOIN subscribers sub ON s.subscriber_id = sub.id
       WHERE s.id = $1 AND s.expires_at > NOW()`,
      [sessionId]
    );
    return result.rows[0] || null;
  } catch { return null; }
}

function isSubscribed(subscriber) {
  return subscriber && (subscriber.status === 'active' || subscriber.status === 'trialing');
}

// ═══════════════════════════════════════════════════════════════════════════
// Request Body Parser
// ═══════════════════════════════════════════════════════════════════════════
function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function jsonResponse(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function redirect(res, url) {
  res.writeHead(303, { Location: url });
  res.end();
}

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
  // Stage 4
  { id: 'wildfire',   manifest: 'wildfire-manifest.jsonl',    name: 'Wildfires (NIFC)',    domain: 'Ecological',     icon: '🔥', interval: 1800000 },
  { id: 'volcanic',   manifest: 'volcanic-manifest.jsonl',    name: 'Volcanic Activity',   domain: 'Geological',     icon: '🌋', interval: 3600000 },
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
const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const path = url.pathname;

  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');

  // ── Billing Routes ──────────────────────────────────────────────────
  if (path === '/api/subscribe' && req.method === 'POST') {
    if (!STRIPE_PRICE_ID) return jsonResponse(res, 500, { error: 'Billing not configured' });
    try {
      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [{ price: STRIPE_PRICE_ID, quantity: 1 }],
        success_url: `${SITE_URL}/api/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${SITE_URL}/?cancelled=1`,
        allow_promotion_codes: true,
      });
      jsonResponse(res, 200, { url: session.url });
    } catch (err) {
      console.error('[BILLING] Checkout error:', err.message);
      jsonResponse(res, 500, { error: 'Failed to create checkout session' });
    }
    return;
  }

  if (path === '/api/subscribe/success' && req.method === 'GET') {
    const sessionId = url.searchParams.get('session_id');
    if (!sessionId || !pool) return redirect(res, '/');
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ['subscription'] });
      if (session.payment_status !== 'paid') return redirect(res, '/?error=payment');

      const email = session.customer_details?.email || session.customer_email || '';
      const customerId = session.customer;
      const subscriptionId = typeof session.subscription === 'object' ? session.subscription.id : session.subscription;

      // Upsert subscriber
      await pool.query(
        `INSERT INTO subscribers (email, stripe_customer_id, stripe_subscription_id, status, updated_at)
         VALUES ($1, $2, $3, 'active', NOW())
         ON CONFLICT (stripe_customer_id) DO UPDATE SET
           email = EXCLUDED.email,
           stripe_subscription_id = EXCLUDED.stripe_subscription_id,
           status = 'active',
           updated_at = NOW()`,
        [email, customerId, subscriptionId]
      );

      const sub = await pool.query('SELECT id FROM subscribers WHERE stripe_customer_id = $1', [customerId]);
      const subscriberId = sub.rows[0]?.id;

      // Create session
      const sid = randomBytes(32).toString('hex');
      await pool.query(
        'INSERT INTO sessions (id, subscriber_id, expires_at) VALUES ($1, $2, NOW() + INTERVAL \'30 days\')',
        [sid, subscriberId]
      );
      setSessionCookie(res, sid);
      redirect(res, '/cockpit?welcome=1');
    } catch (err) {
      console.error('[BILLING] Success handler error:', err.message);
      redirect(res, '/?error=setup');
    }
    return;
  }

  if (path === '/api/webhook' && req.method === 'POST') {
    const body = await readBody(req);
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;
    if (webhookSecret && sig) {
      try { event = stripe.webhooks.constructEvent(body, sig, webhookSecret); }
      catch (err) { console.error('[WEBHOOK] Signature failed:', err.message); return jsonResponse(res, 400, { error: 'Invalid signature' }); }
    } else {
      try { event = JSON.parse(body.toString()); }
      catch { return jsonResponse(res, 400, { error: 'Invalid JSON' }); }
    }

    if (pool) {
      try {
        if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
          const sub = event.data.object;
          const status = sub.status === 'active' || sub.status === 'trialing' ? 'active' : sub.status;
          await pool.query(
            'UPDATE subscribers SET status = $1, updated_at = NOW() WHERE stripe_subscription_id = $2',
            [status, sub.id]
          );
          console.log(`[WEBHOOK] Subscription ${sub.id} → ${status}`);
        }
        if (event.type === 'invoice.payment_failed') {
          const invoice = event.data.object;
          if (invoice.subscription) {
            await pool.query(
              'UPDATE subscribers SET status = $1, updated_at = NOW() WHERE stripe_subscription_id = $2',
              ['past_due', invoice.subscription]
            );
            console.log(`[WEBHOOK] Subscription ${invoice.subscription} → past_due`);
          }
        }
      } catch (err) { console.error('[WEBHOOK] DB error:', err.message); }
    }
    return jsonResponse(res, 200, { received: true });
  }

  if (path === '/api/account' && req.method === 'GET') {
    const subscriber = await getSubscriberFromRequest(req);
    if (isSubscribed(subscriber)) {
      return jsonResponse(res, 200, { subscribed: true, email: subscriber.email, status: subscriber.status });
    }
    return jsonResponse(res, 200, { subscribed: false });
  }

  if (path === '/api/portal' && req.method === 'POST') {
    const subscriber = await getSubscriberFromRequest(req);
    if (!isSubscribed(subscriber)) return jsonResponse(res, 401, { error: 'Not subscribed' });
    try {
      const session = await stripe.billingPortal.sessions.create({
        customer: subscriber.stripe_customer_id,
        return_url: `${SITE_URL}/cockpit`,
      });
      return jsonResponse(res, 200, { url: session.url });
    } catch (err) {
      console.error('[BILLING] Portal error:', err.message);
      return jsonResponse(res, 500, { error: 'Portal unavailable' });
    }
  }

  // Email-based portal — for Payment Link subscribers without session cookies
  if (path === '/api/portal-email' && req.method === 'POST') {
    if (!stripe || !pool) return jsonResponse(res, 503, { error: 'Billing not configured' });
    try {
      const { email } = JSON.parse(body);
      if (!email) return jsonResponse(res, 400, { error: 'Email required' });
      const result = await pool.query(
        'SELECT stripe_customer_id, status FROM subscribers WHERE LOWER(email) = LOWER($1)',
        [email]
      );
      if (result.rows.length === 0) {
        // Try Stripe directly — Payment Link customers may not be in our DB yet
        const customers = await stripe.customers.list({ email: email.toLowerCase(), limit: 1 });
        if (customers.data.length === 0) return jsonResponse(res, 404, { error: 'No subscription found for this email' });
        const session = await stripe.billingPortal.sessions.create({
          customer: customers.data[0].id,
          return_url: `${SITE_URL}/cockpit`,
        });
        return jsonResponse(res, 200, { url: session.url });
      }
      const sub = result.rows[0];
      const session = await stripe.billingPortal.sessions.create({
        customer: sub.stripe_customer_id,
        return_url: `${SITE_URL}/cockpit`,
      });
      return jsonResponse(res, 200, { url: session.url });
    } catch (err) {
      console.error('[BILLING] Email portal error:', err.message);
      return jsonResponse(res, 500, { error: 'Portal unavailable' });
    }
  }

  if (path === '/api/logout' && req.method === 'POST') {
    const cookies = parseCookies(req);
    const sessionId = verifyCookie(cookies.obs_session);
    if (sessionId && pool) {
      try { await pool.query('DELETE FROM sessions WHERE id = $1', [sessionId]); } catch {}
    }
    clearSessionCookie(res);
    return redirect(res, '/');
  }

  // ── API Routes ──────────────────────────────────────────────────────
  if (path === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString(), feeds: FEEDS.length, billing: !!STRIPE_PRICE_ID }));
  }

  // ── Dev Auth — validates admin password, sets bypass cookie ──────────
  if (path === '/api/dev-auth' && req.method === 'POST') {
    if (!ADMIN_PASSWORD) return jsonResponse(res, 403, { error: 'Admin access not configured' });
    try {
      const { password } = JSON.parse(body);
      if (password === ADMIN_PASSWORD) {
        res.writeHead(200, {
          'Content-Type': 'application/json',
          'Set-Cookie': `obs_dev_bypass=${ADMIN_PASSWORD}; Path=/; Max-Age=31536000; SameSite=Lax; HttpOnly`,
        });
        return res.end(JSON.stringify({ ok: true }));
      }
      return jsonResponse(res, 401, { error: 'Invalid code' });
    } catch { return jsonResponse(res, 400, { error: 'Bad request' }); }
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
    // Premium route — requires subscription
    const subscriber = await getSubscriberFromRequest(req);
    if (!isSubscribed(subscriber)) return jsonResponse(res, 401, { error: 'Subscription required', subscribe_url: '/api/subscribe' });

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
    // Premium routes — require subscription
    const subscriber = await getSubscriberFromRequest(req);
    if (!isSubscribed(subscriber)) return jsonResponse(res, 401, { error: 'Subscription required', subscribe_url: '/api/subscribe' });

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
    // Premium route — requires subscription
    const subscriber = await getSubscriberFromRequest(req);
    if (!isSubscribed(subscriber)) return jsonResponse(res, 401, { error: 'Subscription required', subscribe_url: '/api/subscribe' });

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

  // ── Geo API: Ionospheric Heater Locations ────────────────────────────
  if (path === '/api/geo/heaters') {
    const heaters = [
      { id: 'haarp', name: 'HAARP', lat: 62.39, lon: -145.15, location: 'Gakona, Alaska', status: 'active', power: '3.6 MW ERP', frequency: '2.8-10 MHz' },
      { id: 'eiscat', name: 'EISCAT', lat: 69.58, lon: 19.23, location: 'Tromsø, Norway', status: 'active', power: '1.2 GW ERP', frequency: '224-931 MHz' },
      { id: 'eiscat-3d', name: 'EISCAT_3D', lat: 69.34, lon: 20.31, location: 'Skibotn, Norway', status: 'active', power: 'Phased Array', frequency: '233 MHz' },
      { id: 'sura', name: 'Sura', lat: 56.15, lon: 46.10, location: 'Vasilsursk, Russia', status: 'active', power: '190 MW ERP', frequency: '4.5-9.3 MHz' },
      { id: 'jicamarca', name: 'Jicamarca', lat: -11.95, lon: -76.87, location: 'Lima, Peru', status: 'active', power: '6 MW', frequency: '49.92 MHz' },
      { id: 'arecibo', name: 'Arecibo', lat: 18.34, lon: -66.75, location: 'Arecibo, Puerto Rico', status: 'decommissioned', power: 'N/A', frequency: 'N/A' },
      { id: 'mu-radar', name: 'MU Radar', lat: 34.85, lon: 136.10, location: 'Shigaraki, Japan', status: 'active', power: '1 MW', frequency: '46.5 MHz' },
      { id: 'sondrestrom', name: 'Sondrestrom', lat: 67.0, lon: -50.95, location: 'Kangerlussuaq, Greenland', status: 'active', power: '1.2 MW', frequency: '1290 MHz' },
    ];
    // Check heater manifest for latest status
    try {
      const manifest = join(STATE_DIR, 'heater-manifest.jsonl');
      if (existsSync(manifest)) {
        const lines = readFileSync(manifest, 'utf-8').trim().split('\n').slice(-20);
        for (const line of lines) {
          try {
            const entry = JSON.parse(line);
            if (entry.facilityId) {
              const h = heaters.find(x => x.id === entry.facilityId);
              if (h && entry.type !== 'DATA-GAP') h.lastSeen = entry.retrievedAt;
            }
          } catch {}
        }
      }
    } catch {}
    return jsonResponse(res, 200, { timestamp: new Date().toISOString(), heaters });
  }

  // ── Geo API: ADS-B Aircraft (subscriber-only) ───────────────────────
  if (path === '/api/geo/aircraft') {
    // Subscriber-only
    const cookies = parseCookies(req);
    const devBypass = ADMIN_PASSWORD && cookies.obs_dev_bypass === ADMIN_PASSWORD;
    if (!devBypass) {
      const subscriber = await getSubscriberFromRequest(req);
      if (!isSubscribed(subscriber)) return jsonResponse(res, 401, { error: 'Subscription required' });
    }
    // Read latest aircraft data from raw files
    const rawDir = join(STATE_DIR, 'raw', 'aircraft');
    try {
      if (existsSync(rawDir)) {
        const files = readdirSync(rawDir).filter(f => f.endsWith('.json')).sort().reverse();
        if (files.length > 0) {
          const data = JSON.parse(readFileSync(join(rawDir, files[0]), 'utf-8'));
          const aircraft = (data.ac || []).slice(0, 200).map(a => ({
            hex: a.hex, flight: (a.flight || '').trim(), lat: a.lat, lon: a.lon,
            alt: a.alt_baro || a.alt_geom, speed: a.gs, heading: a.track,
            type: a.t, squawk: a.squawk, category: a.category,
          })).filter(a => a.lat && a.lon);
          return jsonResponse(res, 200, { timestamp: new Date().toISOString(), count: aircraft.length, aircraft });
        }
      }
    } catch {}
    return jsonResponse(res, 200, { timestamp: new Date().toISOString(), count: 0, aircraft: [], message: 'No aircraft data available. Ensure ADSB_API_KEY is set.' });
  }

  // ── Geo API: Surface Stations ───────────────────────────────────────
  if (path === '/api/geo/surface') {
    try {
      const rawDir = join(STATE_DIR, 'raw', 'surface');
      if (existsSync(rawDir)) {
        const files = readdirSync(rawDir).filter(f => f.endsWith('.json')).sort().reverse();
        if (files.length > 0) {
          const data = JSON.parse(readFileSync(join(rawDir, files[0]), 'utf-8'));
          const stations = (data.stations || data.features || []).slice(0, 100).map(s => {
            const props = s.properties || s;
            return {
              id: props.station || props.id, name: props.name || props.station,
              lat: s.geometry?.coordinates?.[1] || props.lat, lon: s.geometry?.coordinates?.[0] || props.lon,
              temp: props.temp_f || props.temperature, wind_speed: props.wind_speed_kt || props.windSpeed,
              wind_dir: props.wind_dir || props.windDirection, visibility: props.visibility_mi,
              sky: props.sky_condition || props.weather,
            };
          }).filter(s => s.lat && s.lon);
          return jsonResponse(res, 200, { timestamp: new Date().toISOString(), count: stations.length, stations });
        }
      }
    } catch {}
    return jsonResponse(res, 200, { timestamp: new Date().toISOString(), count: 0, stations: [] });
  }

  // ── Geo API: Wildfires ──────────────────────────────────────────────
  if (path === '/api/geo/wildfires') {
    try {
      const rawDir = join(STATE_DIR, 'raw', 'wildfire');
      if (existsSync(rawDir)) {
        const files = readdirSync(rawDir).filter(f => f.endsWith('.json')).sort().reverse();
        if (files.length > 0) {
          const data = JSON.parse(readFileSync(join(rawDir, files[0]), 'utf-8'));
          return jsonResponse(res, 200, { timestamp: new Date().toISOString(), count: (data.fires || []).length, fires: data.fires || [] });
        }
      }
    } catch {}
    return jsonResponse(res, 200, { timestamp: new Date().toISOString(), count: 0, fires: [] });
  }

  // ── Geo API: Volcanoes ──────────────────────────────────────────────
  if (path === '/api/geo/volcanoes') {
    try {
      const rawDir = join(STATE_DIR, 'raw', 'volcanic');
      if (existsSync(rawDir)) {
        const files = readdirSync(rawDir).filter(f => f.endsWith('.json')).sort().reverse();
        if (files.length > 0) {
          const data = JSON.parse(readFileSync(join(rawDir, files[0]), 'utf-8'));
          // Only return elevated volcanoes for map markers (not all 160+)
          const elevated = (data.volcanoes || []).filter(v => v.alertLevel && v.alertLevel !== 'NORMAL' && v.alertLevel !== 'UNASSIGNED');
          return jsonResponse(res, 200, { timestamp: new Date().toISOString(), count: elevated.length, total: (data.volcanoes || []).length, volcanoes: elevated });
        }
      }
    } catch {}
    return jsonResponse(res, 200, { timestamp: new Date().toISOString(), count: 0, total: 0, volcanoes: [] });
  }

  // ── Protected Page Routes ───────────────────────────────────────────
  const PREMIUM_PAGES = ['/cockpit', '/explorer', '/stream'];
  if (PREMIUM_PAGES.some(p => path === p || path.startsWith(p + '?'))) {
    // Dev bypass: obs_dev_bypass cookie skips subscription check
    const cookies = parseCookies(req);
    const devBypass = ADMIN_PASSWORD && cookies.obs_dev_bypass === ADMIN_PASSWORD;
    if (!devBypass) {
      const subscriber = await getSubscriberFromRequest(req);
      if (!isSubscribed(subscriber)) {
        return redirect(res, '/?upgrade=1');
      }
    }
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
    '/stream': '/stream.html',
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
