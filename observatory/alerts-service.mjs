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
 *
 * Text messages (SMS) ride on the same alert settings, as a second channel:
 *   - Subscribers only, US numbers only, explicit consent checkbox on /sms-optin.
 *   - Every opt-in, opt-out and STOP/START is written to sms_consent_log (append-only)
 *     with the exact consent wording, so consent can be proven to carriers.
 *   - At most 4 texts per subscriber per rolling 24 hours. The daily brief is never texted.
 *   - STOP replies (inbound webhook) and Twilio error 21610 switch SMS off immediately.
 */
import { randomBytes } from 'crypto';
import * as A from './alerts.mjs';
import { smsConfigured, sendSms, normalizeUsPhone, maskPhone, validTwilioSignature } from './twilio-client.mjs';

// Must match the checkbox wording on site/sms-optin.html word for word.
export const SMS_CONSENT_VERSION = 'sms-consent-2026-10-16';
export const SMS_CONSENT_TEXT = 'I agree to receive automated text message alerts from Truth Observatory (DarkWave Studios LLC) at the number above, for the alert types I have chosen in my account. Message frequency varies, up to 4 messages per day. Message and data rates may apply. Reply HELP for help and STOP to cancel at any time. Consent is not a condition of purchase.';

const STOP_WORDS = new Set(['STOP', 'STOPALL', 'UNSUBSCRIBE', 'CANCEL', 'END', 'QUIT', 'OPTOUT', 'REVOKE']);
const START_WORDS = new Set(['START', 'UNSTOP', 'YES']);

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
  ALTER TABLE alert_prefs ADD COLUMN IF NOT EXISTS sms_phone TEXT;
  ALTER TABLE alert_prefs ADD COLUMN IF NOT EXISTS sms_enabled BOOLEAN NOT NULL DEFAULT FALSE;
  ALTER TABLE alert_prefs ADD COLUMN IF NOT EXISTS sms_consent_at TIMESTAMPTZ;
  ALTER TABLE alert_prefs ADD COLUMN IF NOT EXISTS sms_opted_out_at TIMESTAMPTZ;
  CREATE INDEX IF NOT EXISTS alert_prefs_sms_phone_idx ON alert_prefs (sms_phone);
  CREATE TABLE IF NOT EXISTS sms_sent (
    subscriber_id INTEGER NOT NULL REFERENCES subscribers(id) ON DELETE CASCADE,
    dedupe_key TEXT NOT NULL,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (subscriber_id, dedupe_key)
  );
  CREATE INDEX IF NOT EXISTS sms_sent_recent_idx ON sms_sent (subscriber_id, sent_at);
  CREATE TABLE IF NOT EXISTS sms_consent_log (
    id BIGSERIAL PRIMARY KEY,
    subscriber_id INTEGER,
    phone TEXT NOT NULL,
    action TEXT NOT NULL,
    source TEXT NOT NULL,
    ip TEXT,
    consent_version TEXT,
    consent_text TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
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
 *         isSubscribed, getSubscriber, readJson, readBody, jsonResponse, getClientIp }
 */
export function createAlertService(deps) {
  const { pool, siteUrl, sendEmail, fetchPointAlerts, geocodeZip, getBrief,
    isSubscribed, getSubscriber, readJson, readBody, jsonResponse, getClientIp } = deps;

  const lastTest = new Map();
  const smsOptinTries = new Map(); // subscriber_id -> [timestamps] (confirmation texts cost money)
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

  function smsCategories(row) {
    if (!row) return [];
    const out = [];
    if (row.weather && row.lat != null) out.push(`NWS warnings (${row.weather_min} and above) for ${row.place || row.zip}`);
    if (row.quakes) out.push(`Earthquakes M${Number(row.quake_min)} and up`);
    if (row.space) out.push('Geomagnetic storms G3 and up');
    if (row.volcano) out.push('US volcano watch or warning');
    return out;
  }

  function logConsent(subscriberId, phone, action, source, ip, withText) {
    return pool.query(
      `INSERT INTO sms_consent_log (subscriber_id, phone, action, source, ip, consent_version, consent_text)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [subscriberId, phone, action, source, ip || null,
        withText ? SMS_CONSENT_VERSION : null, withText ? SMS_CONSENT_TEXT : null]
    ).catch(e => console.error('[SMS] consent log failed:', e.message));
  }

  /** Handles /api/sms/*. Returns true if the request was handled. */
  async function handleSms(req, res, path) {
    if (!pool) { jsonResponse(res, 503, { error: 'Text alerts are unavailable right now.' }); return true; }

    // Inbound messages from Twilio (STOP / START / HELP). Public, signature-verified.
    if (path === '/api/sms/inbound' && req.method === 'POST') {
      let params = {};
      try {
        const raw = await readBody(req, 16 * 1024);
        params = Object.fromEntries(new URLSearchParams(raw.toString()));
      } catch { res.writeHead(400); res.end(); return true; }
      if (!validTwilioSignature(`${siteUrl}/api/sms/inbound`, params, req.headers['x-twilio-signature'])) {
        console.warn('[SMS] inbound with bad signature rejected');
        res.writeHead(403); res.end(); return true;
      }
      const phone = normalizeUsPhone(params.From);
      const word = String(params.Body || '').trim().split(/\s+/)[0].toUpperCase();
      if (phone && STOP_WORDS.has(word)) {
        const r = await pool.query(
          `UPDATE alert_prefs SET sms_enabled = FALSE, sms_opted_out_at = NOW(), updated_at = NOW()
           WHERE sms_phone = $1 RETURNING subscriber_id`, [phone]);
        for (const row of r.rows) await logConsent(row.subscriber_id, phone, 'opt_out', 'sms_stop', null, false);
        if (!r.rowCount) await logConsent(null, phone, 'opt_out', 'sms_stop', null, false);
      } else if (phone && START_WORDS.has(word)) {
        // Re-subscribing by text is valid only for numbers that opted in on the website before.
        const r = await pool.query(
          `UPDATE alert_prefs SET sms_enabled = TRUE, sms_opted_out_at = NULL, updated_at = NOW()
           WHERE sms_phone = $1 AND sms_consent_at IS NOT NULL RETURNING subscriber_id`, [phone]);
        for (const row of r.rows) await logConsent(row.subscriber_id, phone, 'opt_in', 'sms_start', null, false);
      }
      // Replies to STOP/START/HELP are sent by Twilio's opt-out management, so we answer empty.
      res.writeHead(200, { 'Content-Type': 'text/xml' });
      res.end('<?xml version="1.0" encoding="UTF-8"?><Response></Response>');
      return true;
    }

    const subscriber = await getSubscriber(req);
    const signedIn = isSubscribed(subscriber);

    if (path === '/api/sms/status' && req.method === 'GET') {
      if (!signedIn) { jsonResponse(res, 200, { configured: smsConfigured(), signedIn: false }); return true; }
      const r = await pool.query('SELECT * FROM alert_prefs WHERE subscriber_id = $1', [subscriber.subscriber_id]);
      const row = r.rows[0];
      jsonResponse(res, 200, {
        configured: smsConfigured(), signedIn: true, email: subscriber.email,
        enabled: Boolean(row && row.sms_enabled), phone: row && row.sms_phone ? maskPhone(row.sms_phone) : '',
        categories: smsCategories(row), maxPerDay: A.smsMaxPerDay(),
      });
      return true;
    }

    if (!signedIn) {
      jsonResponse(res, 401, { error: 'Text alerts are for subscribers. Sign in with your subscriber email first.' });
      return true;
    }
    const sid = subscriber.subscriber_id;
    const ip = getClientIp(req);

    if (path === '/api/sms/optin' && req.method === 'POST') {
      let b;
      try { b = await readJson(req); } catch (e) { jsonResponse(res, e.statusCode || 400, { error: e.message }); return true; }
      if (!smsConfigured()) {
        jsonResponse(res, 503, { error: 'Text alerts open once carrier registration is approved. Email alerts work now.' });
        return true;
      }
      if (b.consent !== true || b.consent_version !== SMS_CONSENT_VERSION) {
        jsonResponse(res, 400, { error: 'Tick the consent box to sign up for text alerts.' });
        return true;
      }
      const phone = normalizeUsPhone(b.phone);
      if (!phone) { jsonResponse(res, 400, { error: 'Enter a 10-digit US mobile number.' }); return true; }
      const tries = (smsOptinTries.get(sid) || []).filter(t => Date.now() - t < 3600000);
      if (tries.length >= 3) { jsonResponse(res, 429, { error: 'Too many attempts. Try again in an hour.' }); return true; }

      const cur = await pool.query('SELECT * FROM alert_prefs WHERE subscriber_id = $1', [sid]);
      if (!smsCategories(cur.rows[0]).length) {
        jsonResponse(res, 400, { error: 'Choose your alert types (and ZIP for weather) in the cockpit first. Texts use the same settings.' });
        return true;
      }
      tries.push(Date.now()); smsOptinTries.set(sid, tries);

      await pool.query(
        `UPDATE alert_prefs SET sms_phone = $2, sms_enabled = TRUE, sms_consent_at = NOW(), sms_opted_out_at = NULL, updated_at = NOW()
         WHERE subscriber_id = $1`, [sid, phone]);
      await logConsent(sid, phone, 'opt_in', 'web', ip, true);
      const sent = await sendSms(phone, A.smsConfirm());
      if (!sent.ok) {
        await pool.query('UPDATE alert_prefs SET sms_enabled = FALSE, updated_at = NOW() WHERE subscriber_id = $1', [sid]);
        await logConsent(sid, phone, 'opt_out', 'confirm_failed', ip, false);
        const msg = sent.code === 21610
          ? 'This number replied STOP earlier. Text START to our number to allow messages again, then retry.'
          : 'We could not text that number. Check it is a US mobile number and try again.';
        jsonResponse(res, 502, { error: msg });
        return true;
      }
      jsonResponse(res, 200, { ok: true, phone: maskPhone(phone) });
      return true;
    }

    if (path === '/api/sms/optout' && req.method === 'POST') {
      const r = await pool.query(
        `UPDATE alert_prefs SET sms_enabled = FALSE, sms_opted_out_at = NOW(), updated_at = NOW()
         WHERE subscriber_id = $1 RETURNING sms_phone`, [sid]);
      const phone = r.rows[0] && r.rows[0].sms_phone;
      if (phone) await logConsent(sid, phone, 'opt_out', 'web', ip, false);
      jsonResponse(res, 200, { ok: true });
      return true;
    }

    jsonResponse(res, 404, { error: 'Not found' });
    return true;
  }

  /** Handles /api/alerts/* and /api/sms/*. Returns true if the request was handled. */
  async function handle(req, res, path, url) {
    if (path.startsWith('/api/sms/')) return handleSms(req, res, path);
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

  async function deliverSms(p, candidates) {
    const texts = candidates.filter(c => c.sms);
    if (!texts.length) return;
    const used = await pool.query(
      `SELECT COUNT(*)::int AS n FROM sms_sent WHERE subscriber_id = $1 AND sent_at > NOW() - INTERVAL '24 hours'`, [p.subscriber_id]);
    let room = A.smsRemainingToday(used.rows[0].n);
    for (const c of texts) {
      if (room <= 0) break;
      const claim = await pool.query(
        'INSERT INTO sms_sent (subscriber_id, dedupe_key) VALUES ($1,$2) ON CONFLICT DO NOTHING RETURNING 1',
        [p.subscriber_id, c.key]);
      if (!claim.rowCount) continue;
      const r = await sendSms(p.sms_phone, c.sms);
      if (r.ok) { room -= 1; continue; }
      await pool.query('DELETE FROM sms_sent WHERE subscriber_id = $1 AND dedupe_key = $2', [p.subscriber_id, c.key]);
      if (r.code === 21610 || r.code === 21211 || r.code === 21614) {
        // Recipient replied STOP or the number cannot receive texts: stop trying.
        await pool.query(
          'UPDATE alert_prefs SET sms_enabled = FALSE, sms_opted_out_at = NOW(), updated_at = NOW() WHERE subscriber_id = $1',
          [p.subscriber_id]);
        await logConsent(p.subscriber_id, p.sms_phone, 'opt_out', `twilio_${r.code}`, null, false);
        return;
      }
    }
  }

  async function sweep() {
    if (!pool || sweeping) return;
    sweeping = true;
    try {
      const { rows } = await pool.query(
        `SELECT p.*, s.email, s.status FROM alert_prefs p JOIN subscribers s ON s.id = p.subscriber_id
         WHERE p.enabled OR (p.sms_enabled AND p.sms_phone IS NOT NULL)`);
      if (!rows.length) return;
      const now = Date.now();
      const need = {
        quakes: rows.some(r => r.quakes), space: rows.some(r => r.space),
        volcano: rows.some(r => r.volcano), brief: rows.some(r => r.brief && r.enabled),
      };
      const feeds = await loadFeeds(need, now);
      const utcDay = new Date(now).toISOString().slice(0, 10);
      const textsOn = smsConfigured();

      for (const p of rows) {
        try {
          if (!isSubscribed({ email: p.email, status: p.status })) continue;
          const links = linksFor(p.unsub_token);
          const cands = [];
          if (p.weather && p.lat != null && p.lon != null) {
            const alerts = await fetchPointAlerts(p.lat, p.lon);
            for (const c of A.pickWeather(alerts, p.weather_min)) cands.push({ key: c.key, mail: A.weatherMail(c.alert, p.place, links), sms: A.weatherSms(c.alert, p.place) });
          }
          if (p.quakes) {
            for (const c of A.pickQuakes(feeds.quakes, Number(p.quake_min))) cands.push({ key: c.key, mail: A.quakeMail(c.quake, links), sms: A.quakeSms(c.quake) });
          }
          if (p.space) {
            for (const c of A.pickSpace(feeds.gScale, utcDay)) cands.push({ key: c.key, mail: A.spaceMail(c.scale, links), sms: A.spaceSms(c.scale) });
          }
          if (p.volcano) {
            for (const c of A.pickVolcanoes(feeds.volcanoes)) cands.push({ key: c.key, mail: A.volcanoMail(c.volcano, links), sms: A.volcanoSms(c.volcano) });
          }
          if (p.enabled && p.brief && feeds.brief && A.briefDue(now, p.tz)) {
            const lvl = feeds.brief.briefs && feeds.brief.briefs[p.brief_level];
            if (lvl && lvl.text) {
              let headline;
              try {
                headline = new Intl.DateTimeFormat('en-US', { timeZone: p.tz || 'UTC', weekday: 'long', month: 'long', day: 'numeric' }).format(new Date(now));
              } catch { headline = utcDay; }
              cands.push({ key: A.briefKey(now, p.tz), mail: A.briefMail(headline, lvl.text, links), sms: null });
            }
          }
          if (p.enabled) await deliver(p, cands);
          if (textsOn && p.sms_enabled && p.sms_phone) await deliverSms(p, cands);
        } catch (e) {
          console.error('[ALERTS] subscriber', p.subscriber_id, 'failed:', e.message);
        }
      }
      // Housekeeping: dedupe rows older than 14 days can never match a live event.
      await pool.query(`DELETE FROM alert_sent WHERE sent_at < NOW() - INTERVAL '14 days'`);
      await pool.query(`DELETE FROM sms_sent WHERE sent_at < NOW() - INTERVAL '14 days'`);
    } catch (e) {
      console.error('[ALERTS] sweep error:', e.message);
    } finally {
      sweeping = false;
    }
  }

  return { handle, sweep };
}
