#!/usr/bin/env node
/**
 * TRUTH Archive — Citation Verification Engine
 *
 * The gate between drafted claims and the DOCUMENTED tag.
 * A claim may carry DOCUMENTED only if every source it cites has a
 * verify-at URL that actually resolves. No resolution, no DOCUMENTED.
 *
 * What it does (all real, no placeholders):
 *   1. Parses every source file and claim file in the repo.
 *   2. Fetches every verify-at URL and every URL cited in claim bodies.
 *   3. Classifies each: VERIFIED (2xx/3xx), BLOCKED (401/403/429 — the
 *      site refuses bots; needs a human eyeball), FAILED (404/5xx/DNS/timeout).
 *   4. Rewrites claim frontmatter:
 *        - adds `verification: verified|blocked|failed|no-checkable-source (<date>)`
 *        - demotes DOCUMENTED -> SPECULATIVE when verification did not pass,
 *          preserving the original tag in `confidence-claimed:` for restoration.
 *   5. Writes verification/report.json with the full evidence trail.
 *
 * Usage:  node daemon/verify.mjs [--dry-run]
 * Run it after every daemon cycle, or standalone. Idempotent.
 */

import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DRY = process.argv.includes('--dry-run');
const TODAY = new Date().toISOString().slice(0, 10);
const TIMEOUT_MS = 15000;
const CONCURRENCY = 8;
const UA = 'TruthArchiveVerifier/1.0 (+https://truth.tlid.io; citation integrity check)';

// ── frontmatter ────────────────────────────────────────────────────────────
function parseFrontmatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return { meta: {}, raw: null };
  const meta = {};
  for (const line of m[1].split('\n')) {
    const i = line.indexOf(':');
    if (i === -1) continue;
    meta[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^["']|["']$/g, '');
  }
  return { meta, raw: m[0] };
}

function listMd(dir) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) out.push(...listMd(join(dir, e.name)));
    else if (e.name.endsWith('.md') && e.name !== 'TEMPLATE.md') out.push(join(dir, e.name));
  }
  return out;
}

// ── URL checking (real network fetches) ────────────────────────────────────
const urlCache = new Map();
async function checkUrl(url) {
  if (urlCache.has(url)) return urlCache.get(url);
  let result;
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    let res = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: ctrl.signal, headers: { 'User-Agent': UA } })
      .catch(() => null);
    // Many archives reject HEAD; retry with ranged GET before judging.
    if (!res || res.status === 405 || res.status === 501 || res.status >= 400) {
      res = await fetch(url, { method: 'GET', redirect: 'follow', signal: ctrl.signal, headers: { 'User-Agent': UA, Range: 'bytes=0-2047' } });
    }
    clearTimeout(timer);
    const s = res.status;
    result = { url, status: s, verdict: s < 400 ? 'VERIFIED' : [401, 403, 429, 999].includes(s) ? 'BLOCKED' : 'FAILED' };
  } catch (err) {
    result = { url, status: 0, verdict: 'FAILED', error: String(err && err.cause ? err.cause.code || err.cause : err).slice(0, 120) };
  }
  urlCache.set(url, result);
  return result;
}

async function mapLimit(items, limit, fn) {
  const out = new Array(items.length);
  let i = 0;
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (i < items.length) { const idx = i++; out[idx] = await fn(items[idx]); }
  }));
  return out;
}

const extractUrls = (text) =>
  [...new Set((text.match(/https?:\/\/[^\s)\]>"'`]+/g) || []).map(u => u.replace(/[.,;:]+$/, '')))];

// ── main ───────────────────────────────────────────────────────────────────
const sources = {};
for (const f of listMd(join(ROOT, 'sources'))) {
  const text = readFileSync(f, 'utf8');
  const { meta } = parseFrontmatter(text);
  // Two frontmatter generations exist: original (id + verify-at) and
  // daemon-era (no id, verification_url). Derive id from filename if absent.
  const id = meta.id || (f.match(/(S-\d{4})/) || [])[1];
  if (!id) continue;
  const rawUrl = meta['verify-at'] || meta.verification_url || null;
  const verifyAt = rawUrl ? (rawUrl.match(/https?:\/\/[^\s)"']+/) || [null])[0] : null;
  sources[id] = { file: f.replace(ROOT + '/', ''), verifyAt, title: meta.title || '' };
}

console.log(`Loaded ${Object.keys(sources).length} sources. Checking verify-at URLs...`);
const sourceChecks = await mapLimit(Object.values(sources), CONCURRENCY, async (s) => {
  if (!s.verifyAt || !/^https?:\/\//.test(s.verifyAt)) return Object.assign(s, { check: { verdict: 'NO-URL' } });
  return Object.assign(s, { check: await checkUrl(s.verifyAt) });
});
for (const s of sourceChecks) console.log(`  [${s.check.verdict}${s.check.status ? ' ' + s.check.status : ''}] ${s.file}`);

const report = { generated: new Date().toISOString(), sources: {}, claims: {} };
for (const [id, s] of Object.entries(sources)) report.sources[id] = { file: s.file, verifyAt: s.verifyAt, ...s.check };

console.log('\nVerifying claims...');
let promotedOk = 0, demoted = 0, alreadyPending = 0;
for (const f of listMd(join(ROOT, 'claims'))) {
  let text = readFileSync(f, 'utf8');
  const { meta, raw } = parseFrontmatter(text);
  if (!raw) continue;
  const ids = (meta.sources || '').replace(/[\[\]]/g, '').split(',').map(x => x.trim()).filter(Boolean);

  const perSource = ids.map(id => ({ id, ...(sources[id] ? sources[id].check : { verdict: 'MISSING-SOURCE-FILE' }) }));
  const bodyUrls = extractUrls(text.slice(raw.length));
  const bodyChecks = await mapLimit(bodyUrls, CONCURRENCY, checkUrl);

  const allSourcesOk = ids.length > 0 && perSource.every(c => c.verdict === 'VERIFIED');
  const anyFailed = perSource.some(c => ['FAILED', 'MISSING-SOURCE-FILE', 'NO-URL'].includes(c.verdict)) || bodyChecks.some(c => c.verdict === 'FAILED');
  const verdict = allSourcesOk && !anyFailed ? 'verified' : anyFailed ? 'failed' : ids.length === 0 ? 'no-checkable-source' : 'blocked';

  report.claims[meta.id || f] = { file: f.replace(ROOT + '/', ''), confidence: meta.confidence, verdict, sources: perSource, bodyUrls: bodyChecks };

  // Rewrite frontmatter
  let fm = raw;
  fm = fm.replace(/\nverification:.*(?=\n)/, '').replace(/\nverified-on:.*(?=\n)/, '');
  const stamp = `\nverification: ${verdict}\nverified-on: ${TODAY}`;
  if (verdict !== 'verified' && meta.confidence === 'DOCUMENTED') {
    if (!/confidence-claimed:/.test(fm)) fm = fm.replace(/\nconfidence: DOCUMENTED/, '\nconfidence: SPECULATIVE\nconfidence-claimed: DOCUMENTED');
    else fm = fm.replace(/\nconfidence: DOCUMENTED/, '\nconfidence: SPECULATIVE');
    demoted++;
  } else if (verdict === 'verified' && meta['confidence-claimed'] === 'DOCUMENTED' && meta.confidence === 'SPECULATIVE') {
    fm = fm.replace(/\nconfidence: SPECULATIVE/, '\nconfidence: DOCUMENTED').replace(/\nconfidence-claimed:.*(?=\n)/, '');
    promotedOk++;
  } else if (verdict !== 'verified') { alreadyPending++; } else { promotedOk++; }
  fm = fm.replace(/\n---$/, `${stamp}\n---`);

  if (!DRY) writeFileSync(f, fm + text.slice(raw.length));
  console.log(`  [${verdict.toUpperCase()}] ${meta.id || f} (${meta.confidence}${verdict !== 'verified' && meta.confidence === 'DOCUMENTED' ? ' -> SPECULATIVE' : ''})`);
}

if (!DRY) {
  mkdirSync(join(ROOT, 'verification'), { recursive: true });
  writeFileSync(join(ROOT, 'verification', 'report.json'), JSON.stringify(report, null, 2));
}
console.log(`\nDone. verified-and-standing: ${promotedOk}, demoted: ${demoted}, other-pending: ${alreadyPending}`);
console.log(DRY ? '(dry run — nothing written)' : 'Report: verification/report.json');
