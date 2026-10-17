/**
 * TRUTH Observatory — Twilio transport (send SMS, verify inbound webhooks)
 * DarkWave Studios LLC — Copyright 2026
 *
 * Transport only. No decisions about who gets what: that is alerts.lume and
 * alerts-service.mjs. Plain JS because it needs try/catch and HMAC, which
 * Lume 1.1 does not emit. No Twilio SDK: one REST call and one HMAC check.
 *
 * Env (Observatory's OWN campaign — never the HappyEats number):
 *   TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN
 *   OBS_TWILIO_MESSAGING_SERVICE_SID  (preferred; the A2P campaign is attached to it)
 *   OBS_TWILIO_FROM                   (fallback: an E.164 number on that campaign)
 *
 * DDA 42-Doctrine mapping:
 *   [35] Safety Envelope → unconfigured means disabled, never a fallback number
 *   [42] Devoid Limit    → send failures come back as values, never throw
 */
import { createHmac, timingSafeEqual } from 'crypto';

const SID = process.env.TWILIO_ACCOUNT_SID || '';
const TOKEN = process.env.TWILIO_AUTH_TOKEN || '';
const MSG_SERVICE = process.env.OBS_TWILIO_MESSAGING_SERVICE_SID || '';
const FROM = process.env.OBS_TWILIO_FROM || '';

export function smsConfigured() {
  return Boolean(SID && TOKEN && (MSG_SERVICE || FROM));
}

/** US numbers only. Returns +1XXXXXXXXXX or null. */
export function normalizeUsPhone(input) {
  const d = String(input || '').replace(/\D/g, '');
  const ten = d.length === 11 && d[0] === '1' ? d.slice(1) : d;
  if (!/^[2-9]\d{2}[2-9]\d{6}$/.test(ten)) return null;
  return '+1' + ten;
}

export function maskPhone(e164) {
  const s = String(e164 || '');
  return s.length >= 4 ? '(***) ***-' + s.slice(-4) : '';
}

/**
 * Send one SMS. Resolves to { ok, code?, error? }.
 * code is Twilio's numeric error (21610 = recipient replied STOP, 21211/21614 = bad number).
 */
export async function sendSms(to, body) {
  if (!smsConfigured()) return { ok: false, error: 'not_configured' };
  const form = new URLSearchParams({ To: to, Body: body });
  if (MSG_SERVICE) form.set('MessagingServiceSid', MSG_SERVICE);
  else form.set('From', FROM);
  try {
    const r = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${SID}/Messages.json`, {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + Buffer.from(`${SID}:${TOKEN}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: form,
      signal: AbortSignal.timeout(15000),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      console.error('[SMS] Twilio rejected send:', data.code, data.message);
      return { ok: false, code: data.code, error: data.message || `HTTP ${r.status}` };
    }
    console.log(`[SMS] Sent to ${maskPhone(to)} (${data.sid})`);
    return { ok: true };
  } catch (e) {
    console.error('[SMS] network error:', e.message);
    return { ok: false, error: e.message };
  }
}

/**
 * Twilio request signature: base64(HMAC-SHA1(authToken, url + sorted key+value pairs)).
 * `url` must be the exact public URL configured in Twilio.
 */
export function validTwilioSignature(url, params, signature) {
  if (!TOKEN || !signature) return false;
  let data = url;
  for (const k of Object.keys(params).sort()) data += k + params[k];
  const expected = createHmac('sha1', TOKEN).update(Buffer.from(data, 'utf-8')).digest('base64');
  const a = Buffer.from(expected);
  const b = Buffer.from(String(signature));
  return a.length === b.length && timingSafeEqual(a, b);
}
