/**
 * TRUTH Observatory — Email alert service (opt-in)
 * DarkWave Studios LLC — Copyright 2026
 *
 * Plumbing only: preferences API, one-click unsubscribe, the sweep that fetches
 * public feeds and sends mail. Every decision about WHAT qualifies and HOW the
 * message reads lives in alerts.lume (compiled to alerts.mjs). Lume 1.1 has no
 * try/catch and no async database ergonomics, so the I/O wrapper stays plain JS.
 *
 * Guarantees:
 *   - Nothing is sent unless the subscriber turned it on (enabled = false by default).
 *   - Every email carries a one-click unsubscribe link and List-Unsubscribe headers.
 *   - A (subscriber, event) pair is claimed in the database BEFORE sending, so
 *     overlapping sweeps or two server instances can never double-send.
 *   - At most 12 emails per subscriber per rolling 24 hours.
 *
 * DDA 42-Doctrine mapping:
 *   [35] Safety Envelope → opt-in only, daily cap, unsubscribe in every message
 *   [40] Non-Being Guard → no matching event, no email
 */
import { randomBytes } from 'crypto';
import * as A from './alerts.mjs';

export const ALERT_SCHEMA_SQL = `
  CREATE TABLE IF NOT EXISTS alert_prefs (
    subscriber_id INTEGER PRIMARY KEY REFERENCES subscribers(id) ON DELETE CASCADE,
    enabled BOOLEAN NOT NULL DEFAULT FALSE,
    zip TEXT,
    lat DOUBLE PRECISION,
    lon DOUBLE PRECISION,
    place TEXT,
    tz TEXT,
    weather BOOLEAN NOT NULL DEFAULT TRUE,
    weather_min TEXT NOT NULL DEFAULT 'severe',
    brief BOOLEAN NOT NULL DEFAULT FALSE,
    brief_level TEXT NOT NULL DEFAULT 'observer',
    quakes BOOLEAN NOT NULL DEFAULT FALSE,
    quake_min NUMERIC NOT NULL DEFAULT 5,
    space BOOLEAN NOT NULL DEFAULT FALSE,
    volcano BOOLEAN NOT NULL DEFAULT FALSE,
    unsub_token TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  CREATE TABLE IF NOT EXISTS alert_sent (
    subscriber_id INTEGER NOT NULL REFERENCES subscribers(id) ON DELETE CASCADE,
    dedupe_key TEXT NOT NULL,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (subscriber_id, dedupe_key)
  );
  CREATE INDEX IF NOT EXISTS alert_sent_recent_idx ON alert_sent (subscriber_id, sent_at);
`;

const WEATHER_MIN = new Set(['moderate', 'severe', 'extreme']);
const BRIEF_LEVELS = new Set(['observer', 'analyst', 'researcher']);

function validTimeZone(tz) {
  if (typeof tz !== 'string' || tz.length > 64) return null;
  try { new Intl.DateTimeFormat('en-US', { timeZone: tz }); return tz; } catch { return null; }
}

function publicPrefs(row) {
  if (!row) {
    return {
      enabled: false, zip: '', place: '', tz: '',
      weather: true, weather_min: 'severe',
      brief: false, brief_level: 'observer',
      quakes: false, quake_min: 5, space: false, volcano: false,
    };
  }
  return {
    enabled: row.enabled, zip: row.zip || '', place: row.place || '', tz: row.tz || '',
    weather: row.weather, weather_min: row.weather_min,
    brief: row.brief, brief_level: row.brief_level,
    quakes: row.quakes, quake_min: Number(row.quake_min),
    space: row.space, volcano: row.volcano,
  };
}

async function fetchJson(url, ms = 10000) {
  const r = await fetch(url, {
    headers: { 'User-Agent': 'TruthObservatory/1.0 (contact@darkwavestudios.io)' },
    signal: AbortSignal.timeout(ms),
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

/**
 * deps: { pool, siteUrl, sendEmail, fetchPointAlerts, geocodeZip, getBrief,
 *         isSubscribed, getSubscriber, readJson, jsonResponse }
 */
export function createAlertService(deps) {
  const { pool, siteUrl, sendEmail, fetchPointAlerts, geocodeZip, getBrief,
    isSubscribed, getSubscriber, readJson, jsonResponse } = deps;

  const lastTest = new Map();
  let sweeping = false;

  function linksFor(token) {
    return {
      manage: `${siteUrl}/cockpit.html#email-alerts`,
      unsub: `${siteUrl}/api/alerts/unsubscribe?token=${token}`,
    };
  }

  function headersFor(links) {
    return {
      'List-Unsubscribe': `<${links.unsub}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    };
  }

  function sendAlert(to, mail, links) {
    return sendEmail({
      to, subject: mail.subject, html: mail.html, text: mail.plain,
      from: 'Truth Observatory Alerts <alerts@observatory.tlid.io>',
      headers: headersFor(links),
    });
  }

  function unsubPage(ok) {
    const msg = ok
      ? 'You are unsubscribed. No more alert emails will be sent.'
      : 'That unsubscribe link is not valid. If you still get alert emails, turn them off in your cockpit.';
    return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Email alerts — Truth Observatory</title></head>`
      + `<body style="margin:0;background:#0a0a0a;color:#e8e8e8;font-family:Helvetica,Arial,sans-serif"><main style="max-width:480px;margin:12vh auto;padding:0 20px">`
      + `<div style="font-size:11px;letter-spacing:2px;color:#9a9a9a;text-transform:uppercase">Truth Observatory</div>`
      + `<h1 style="font-size:22px;margin:12px 0">${ok ? 'Unsubscribed' : 'Link not valid'}</h1><p style="line-height:1.6;color:#cfcfcf">${msg}</p>`
      + `<p><a href="/cockpit.html#email-alerts" style="color:#fff">Back to your cockpit</a></p></main></body></html>`;
  }

  /** Handles /api/alerts/*. Returns true if the request was handled. */
  async function handle(req, res, path, url) {
    if (!path.startsWith('/api/alerts/')) return false;
    if (!pool) { jsonResponse(res, 503, { error: 'Alerts are unavailable right now.' }); return true; }

    // Public, token-authenticated one-click unsubscribe (GET from the email body, POST from mail clients).
    if (path === '/api/alerts/unsubscribe' && (req.method === 'GET' || req.method === 'POST')) {
      const token = (url.searchParams.get('token') || '').trim();
      let ok = false;
      if (/^[a-f0-9]{48}$/.test(token)) {
        try {
          const r = await pool.query('UPDATE alert_prefs SET enabled = FALSE, updated_at = NOW() WHERE unsub_token = $1', [token]);
          ok = r.rowCount > 0;
        } catch (e) { console.error('[ALERTS] unsubscribe error:', e.message); }
      }
      if (req.method === 'POST') { jsonResponse(res, ok ? 200 : 400, { ok }); return true; }
      res.writeHead(ok ? 200 : 400, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      res.end(unsubPage(ok));
      return true;
    }

    const subscriber = await getSubscriber(req);
    if (!isSubscribed(subscriber)) {
      jsonResponse(res, 401, { error: 'Sign in with your subscriber email to manage alerts.' });
      return true;
    }
    const sid = subscriber.subscriber_id;

    if (path === '/api/alerts/prefs' && req.method === 'GET') {
      const r = await pool.query('SELECT * FROM alert_prefs WHERE subscriber_id = $1', [sid]);
      jsonResponse(res, 200, { email: subscriber.email, prefs: publicPrefs(r.rows[0]) });
      return true;
    }

    if (path === '/api/alerts/prefs' && req.method === 'POST') {
      let b;
      try { b = await readJson(req); } catch (e) { jsonResponse(res, e.statusCode || 400, { error: e.message }); return true; }
      const enabled = b.enabled === true;
      const weather = b.weather === true;
      const brief = b.brief === true;
      const quakes = b.quakes === true;
      const space = b.space === true;
      const volcano = b.volcano === true;
      const weatherMin = WEATHER_MIN.has(b.weather_min) ? b.weather_min : 'severe';
      const briefLevel = BRIEF_LEVELS.has(b.brief_level) ? b.brief_level : 'observer';
      let quakeMin = Number(b.quake_min);
      if (!Number.isFinite(quakeMin)) quakeMin = 5;
      quakeMin = Math.min(8, Math.max(4, Math.round(quakeMin * 2) / 2));
      const tz = validTimeZone(b.tz) || 'America/Chicago';
      const zip = String(b.zip || '').trim();

      if (enabled && !(weather || brief || quakes || space || volcano)) {
        jsonResponse(res, 400, { error: 'Pick at least one kind of alert.' });
        return true;
      }
      let place = null, lat = null, lon = null, zipOut = null;
      if (weather || zip) {
        if (!/^\d{5}$/.test(zip)) {
          jsonResponse(res, 400, { error: 'Enter a 5-digit US ZIP code for weather warnings.' });
          return true;
        }
        const g = await geocodeZip(zip);
        if (!g) { jsonResponse(res, 400, { error: 'We could not find that ZIP code.' }); return true; }
        place = g.label; lat = g.lat; lon = g.lon; zipOut = zip;
      }
      const token = randomBytes(24).toString('hex');
      const r = await pool.query(
        `INSERT INTO alert_prefs (subscriber_id, enabled, zip, lat, lon, place, tz, weather, weather_min, brief, brief_level, quakes, quake_min, space, volcano, unsub_token)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
         ON CONFLICT (subscriber_id) DO UPDATE SET
           enabled=$2, zip=$3, lat=$4, lon=$5, place=$6, tz=$7, weather=$8, weather_min=$9, brief=$10,
           brief_level=$11, quakes=$12, quake_min=$13, space=$14, volcano=$15, updated_at=NOW()
         RETURNING *`,
        [sid, enabled, zipOut, lat, lon, place, tz, weather, weatherMin, brief, briefLevel, quakes, quakeMin, space, volcano, token]
      );
      jsonResponse(res, 200, { ok: true, prefs: publicPrefs(r.rows[0]) });
      return true;
    }

    if (path === '/api/alerts/test' && req.method === 'POST') {
      const last = lastTest.get(sid) || 0;
      if (Date.now() - last < 60000) {
        jsonResponse(res, 429, { error: 'Wait a minute before sending another test.' });
        return true;
      }
      const r = await pool.query('SELECT * FROM alert_prefs WHERE subscriber_id = $1', [sid]);
      if (!r.rows[0]) { jsonResponse(res, 400, { error: 'Save your alert settings first.' }); return true; }
      lastTest.set(sid, Date.now());
      const links = linksFor(r.rows[0].unsub_token);
      const ok = await sendAlert(subscriber.email, A.testMail(r.rows[0].place || 'your account', links), links);
      jsonResponse(res, ok ? 200 : 502, ok ? { ok: true } : { error: 'The email could not be sent right now. Try again in a few minutes.' });
      return true;
    }

    jsonResponse(res, 404, { error: 'Not found' });
    return true;
  }

  // ── Sweep ────────────────────────────────────────────────────────────────
  async function loadFeeds(need, now) {
    const feeds = { quakes: [], gScale: 0, volcanoes: [], brief: null };
    const jobs = [];
    if (need.quakes) {
      jobs.push(fetchJson('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_day.geojson').then(j => {
        feeds.quakes = (j.features || [])
          .filter(f => f.properties && f.properties.time > now - 3 * 3600000 && f.properties.mag != null)
          .map(f => ({ id: f.id, mag: f.properties.mag, place: f.properties.place || 'unknown location', time: new Date(f.properties.time).toISOString() }));
      }).catch(e => console.warn('[ALERTS] quake feed:', e.message)));
    }
    if (need.space) {
      jobs.push(fetchJson('https://services.swpc.noaa.gov/products/noaa-scales.json').then(j => {
        const g = Number(j && j['0'] && j['0'].G && j['0'].G.Scale);
        feeds.gScale = Number.isFinite(g) ? g : 0;
      }).catch(e => console.warn('[ALERTS] space feed:', e.message)));
    }
    if (need.volcano) {
      jobs.push(fetchJson('https://volcanoes.usgs.gov/hans-public/api/volcano/getElevatedVolcanoes').then(j => {
        feeds.volcanoes = (Array.isArray(j) ? j : []).map(v => ({ name: v.volcano_name, alertLevel: v.alert_level }));
      }).catch(e => console.warn('[ALERTS] volcano feed:', e.message)));
    }
    if (need.brief) {
      const b = getBrief();
      if (b && b.generatedAt && now - Date.parse(b.generatedAt) < 14 * 3600000) feeds.brief = b;
    }
    await Promise.all(jobs);
    return feeds;
  }

  async function deliver(p, candidates) {
    if (!candidates.length) return;
    const used = await pool.query(
      `SELECT COUNT(*)::int AS n FROM alert_sent WHERE subscriber_id = $1 AND sent_at > NOW() - INTERVAL '24 hours'`, [p.subscriber_id]);
    let room = A.remainingToday(used.rows[0].n);
    const links = linksFor(p.unsub_token);
    for (const c of candidates) {
      if (room <= 0) break;
      // Claim first; only the process that inserts the row may send.
      const claim = await pool.query(
        'INSERT INTO alert_sent (subscriber_id, dedupe_key) VALUES ($1,$2) ON CONFLICT DO NOTHING RETURNING 1',
        [p.subscriber_id, c.key]);
      if (!claim.rowCount) continue;
      const ok = await sendAlert(p.email, c.mail, links);
      if (ok) { room -= 1; continue; }
      await pool.query('DELETE FROM alert_sent WHERE subscriber_id = $1 AND dedupe_key = $2', [p.subscriber_id, c.key]);
    }
  }

  async function sweep() {
    if (!pool || sweeping) return;
    sweeping = true;
    try {
      const { rows } = await pool.query(
        `SELECT p.*, s.email, s.status FROM alert_prefs p JOIN subscribers s ON s.id = p.subscriber_id WHERE p.enabled`);
      if (!rows.length) return;
      const now = Date.now();
      const need = {
        quakes: rows.some(r => r.quakes), space: rows.some(r => r.space),
        volcano: rows.some(r => r.volcano), brief: rows.some(r => r.brief),
      };
      const feeds = await loadFeeds(need, now);
      const utcDay = new Date(now).toISOString().slice(0, 10);

      for (const p of rows) {
        try {
          if (!isSubscribed({ email: p.email, status: p.status })) continue;
          const links = linksFor(p.unsub_token);
          const cands = [];
          if (p.weather && p.lat != null && p.lon != null) {
            const alerts = await fetchPointAlerts(p.lat, p.lon);
            for (const c of A.pickWeather(alerts, p.weather_min)) cands.push({ key: c.key, mail: A.weatherMail(c.alert, p.place, links) });
          }
          if (p.quakes) {
            for (const c of A.pickQuakes(feeds.quakes, Number(p.quake_min))) cands.push({ key: c.key, mail: A.quakeMail(c.quake, links) });
          }
          if (p.space) {
            for (const c of A.pickSpace(feeds.gScale, utcDay)) cands.push({ key: c.key, mail: A.spaceMail(c.scale, links) });
          }
          if (p.volcano) {
            for (const c of A.pickVolcanoes(feeds.volcanoes)) cands.push({ key: c.key, mail: A.volcanoMail(c.volcano, links) });
          }
          if (p.brief && feeds.brief && A.briefDue(now, p.tz)) {
            const lvl = feeds.brief.briefs && feeds.brief.briefs[p.brief_level];
            if (lvl && lvl.text) {
              let headline;
              try {
                headline = new Intl.DateTimeFormat('en-US', { timeZone: p.tz || 'UTC', weekday: 'long', month: 'long', day: 'numeric' }).format(new Date(now));
              } catch { headline = utcDay; }
              cands.push({ key: A.briefKey(now, p.tz), mail: A.briefMail(headline, lvl.text, links) });
            }
          }
          await deliver(p, cands);
        } catch (e) {
          console.error('[ALERTS] subscriber', p.subscriber_id, 'failed:', e.message);
        }
      }
      // Housekeeping: dedupe rows older than 14 days can never match a live event.
      await pool.query(`DELETE FROM alert_sent WHERE sent_at < NOW() - INTERVAL '14 days'`);
    } catch (e) {
      console.error('[ALERTS] sweep error:', e.message);
    } finally {
      sweeping = false;
    }
  }

  return { handle, sweep };
}
