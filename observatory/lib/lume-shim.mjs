/**
 * TRUTH Observatory — Lume interop shim
 * DarkWave Studios LLC — Copyright 2026
 *
 * Lume 1.1 compiles to ESM but does not yet emit: try/catch, `new`, computed
 * property assignment, or promise chaining (`then`/`set` are reserved words).
 * This shim exposes exactly those primitives as plain functions so the
 * application logic can stay in .lume source. No business logic lives here.
 *
 * DDA 42-Doctrine mapping:
 *   [35] Collapse Detection → attempt(): failures become values, never throws
 *   [42] Devoid Limit       → whenDone(): rejected promises resolve to an error value
 */

/** Run fn(); on throw return fallback. */
export function attempt(fn, fallback = null) {
  try { return fn(); } catch { return fallback; }
}

/** JSON.parse that returns null on malformed input. */
export function tryParse(line) {
  try { return JSON.parse(line); } catch { return null; }
}

/** Promise continuation: fn(result) on resolve, fn({ success:false, error }) on reject. */
export function whenDone(p, fn) {
  return Promise.resolve(p).then(fn, (e) => fn({ success: false, error: String((e && e.message) || e) }));
}

/** obj[key] = val; returns obj. */
export function put(obj, key, val) {
  obj[key] = val;
  return obj;
}

/** Blocking sleep (used only for the 2s post-rename settle window). */
export function sleepSync(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

/** ISO-8601 string for epoch ms. */
export function iso(ms) {
  return new Date(ms).toISOString();
}

/** Hour 0-23 of epoch ms in an IANA timezone (UTC if the zone is invalid). */
export function localHour(ms, tz) {
  try {
    return Number(new Intl.DateTimeFormat('en-US', { timeZone: tz || 'UTC', hour: 'numeric', hourCycle: 'h23' }).format(new Date(ms)));
  } catch { return new Date(ms).getUTCHours(); }
}

/** YYYY-MM-DD of epoch ms in an IANA timezone (UTC if the zone is invalid). */
export function localDay(ms, tz) {
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone: tz || 'UTC', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(ms));
  } catch { return new Date(ms).toISOString().slice(0, 10); }
}

/** Truncate text to n characters with an ellipsis. */
export function clip(s, n) {
  const t = String(s || '').replace(/\s+/g, ' ').trim();
  return t.length > n ? t.slice(0, n - 1) + '…' : t;
}

/** Escape text for safe HTML interpolation. */
export function escHtml(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
