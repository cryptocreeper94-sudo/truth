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
