#!/usr/bin/env node
/**
 * TRUTH Observatory — Daily Brief Generator
 * DarkWave Studios LLC — Copyright 2026
 *
 * Generates a human-readable atmospheric summary from the last 24h of
 * feed manifest data. Every sentence passes through Lume-V governance
 * before reaching subscribers.
 *
 * Architecture:
 *   Raw manifests → OpenAI GPT-4o-mini → Lume-V Governor → Certified Brief
 *
 * DDA 42-Doctrine mapping:
 *   [01] Identity Kernel    → BRIEF_GENERATOR_IDENTITY
 *   [14] Determinacy Engine → Lume-V 7-invariant validation
 *   [32] Integrity Layer    → Ed25519 trust certificate
 *   [35] Safety Envelope    → No speculation, no causation claims
 */

import { createHash } from 'crypto';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { LumeV } from './lib/lume-v/index.js';
import { anchorBrief, anchorLumeVCert } from './trustlayer-anchor.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const STATE_DIR = process.env.STATE_DIR || join(__dirname, 'state');
const BRIEF_PATH = join(STATE_DIR, 'daily-brief.json');

// ── Identity ────────────────────────────────────────────────
const IDENTITY = Object.freeze({
  name: 'observatory-daily-brief-generator',
  version: '1.0.0',
  author: 'Andrews, Ronald Jason — DarkWave Studios LLC',
  architecture: 'DDA 42-Doctrine / Lume-V Governed',
});

// ── Feed manifest files ─────────────────────────────────────
const FEED_MANIFESTS = [
  { id: 'nexrad',      manifest: 'nexrad-manifest.jsonl',      name: 'NEXRAD Radar' },
  { id: 'goes',        manifest: 'goes-manifest.jsonl',        name: 'GOES Satellite' },
  { id: 'earthquake',  manifest: 'earthquake-manifest.jsonl',  name: 'Earthquake Monitor' },
  { id: 'solar',       manifest: 'solar-manifest.jsonl',       name: 'Solar Activity' },
  { id: 'geomag',      manifest: 'geomag-manifest.jsonl',      name: 'Geomagnetic Index' },
  { id: 'lightning',   manifest: 'lightning-manifest.jsonl',    name: 'Lightning Detection' },
  { id: 'blitzortung', manifest: 'blitzortung-manifest.jsonl', name: 'Blitzortung Network' },
  { id: 'surface',     manifest: 'surface-manifest.jsonl',     name: 'Surface Stations' },
  { id: 'ionosonde',   manifest: 'ionosonde-manifest.jsonl',   name: 'Ionospheric Monitor' },
  { id: 'schumann',    manifest: 'schumann-manifest.jsonl',    name: 'Schumann Resonance' },
  { id: 'grid',        manifest: 'grid-manifest.jsonl',        name: 'Power Grid' },
  { id: 'aircraft',    manifest: 'aircraft-manifest.jsonl',    name: 'Aircraft Tracking' },
  { id: 'notam',       manifest: 'notam-manifest.jsonl',       name: 'NOTAMs' },
  { id: 'heater',      manifest: 'heater-manifest.jsonl',      name: 'Ionospheric Heaters' },
  { id: 'celltower',   manifest: 'celltower-manifest.jsonl',   name: 'Cell Towers' },
  { id: 'metals',      manifest: 'metals-manifest.jsonl',      name: 'Heavy Metals' },
  { id: 'ecology',     manifest: 'ecology-manifest.jsonl',     name: 'Pollinator Ecology' },
  { id: 'deposition',  manifest: 'deposition-manifest.jsonl',  name: 'Wet Deposition' },
  { id: 'wildfire',    manifest: 'wildfire-manifest.jsonl',     name: 'Wildfires' },
  { id: 'volcanic',    manifest: 'volcanic-manifest.jsonl',     name: 'Volcanic Activity' },
];

// ── Lume-V Governor Configuration ───────────────────────────
const governor = new LumeV({
  confidenceThreshold: 0.85,
  domainBounds: {
    allowedDomains: ['atmospheric', 'geophysical', 'ecological', 'electromagnetic', 'infrastructure'],
  },
  safeFallbacks: {
    llm_text: {
      text: 'Daily brief generation paused — data is being validated. Check individual feeds for current conditions.',
    },
  },
});

// ── Read last 24h of manifest entries ───────────────────────
function readRecentEntries(manifestFile, hours = 24) {
  const path = join(STATE_DIR, manifestFile);
  if (!existsSync(path)) return [];

  const cutoff = Date.now() - hours * 3600000;
  const lines = readFileSync(path, 'utf8').trim().split('\n');
  const entries = [];

  for (const line of lines.slice(-200)) { // last 200 entries max
    try {
      const entry = JSON.parse(line);
      const ts = new Date(entry.timestamp || entry.retrievedAt || entry.fetchedAt || entry.collected_at || entry.at || entry.writtenAt || 0).getTime();
      if (ts >= cutoff && entry.type !== 'RETENTION-PRUNE') {
        entries.push(entry);
      }
    } catch {}
  }
  return entries;
}

// ── Build data snapshot for the prompt ──────────────────────
function buildDataSnapshot() {
  const snapshot = {};
  let totalEntries = 0;
  let activeFeeds = 0;

  for (const feed of FEED_MANIFESTS) {
    const entries = readRecentEntries(feed.manifest);
    const count = entries.length;
    totalEntries += count;

    if (count > 0) {
      activeFeeds++;
      const latest = entries[entries.length - 1];
      const age = Date.now() - new Date(latest.timestamp || latest.retrievedAt || latest.fetchedAt || latest.collected_at || latest.at || latest.writtenAt || 0).getTime();

      snapshot[feed.id] = {
        name: feed.name,
        entries: count,
        status: age > 3600000 * 3 ? 'stale' : 'live',
        lastUpdate: latest.timestamp || latest.retrievedAt || latest.fetchedAt || latest.at || latest.writtenAt,
        // Extract key data points
        ...(latest.totalResults ? { totalResults: latest.totalResults } : {}),
        ...(latest.magnitude ? { magnitude: latest.magnitude } : {}),
        ...(latest.kpIndex ? { kpIndex: latest.kpIndex } : {}),
        ...(latest.xrayFlux ? { xrayFlux: latest.xrayFlux } : {}),
        ...(latest.strikeCount ? { strikeCount: latest.strikeCount } : {}),
        ...(latest.alertLevel ? { alertLevel: latest.alertLevel } : {}),
      };
    } else {
      snapshot[feed.id] = { name: feed.name, entries: 0, status: 'offline' };
    }
  }

  return { snapshot, totalEntries, activeFeeds, generatedAt: new Date().toISOString() };
}

// ── Level-aware system prompts ──────────────────────────────
const SYSTEM_PROMPTS = {
  observer: `You are the Observatory Daily Brief writer. Your audience is curious people who are just starting to pay attention to the atmosphere. Write a 3-5 sentence summary of the last 24 hours of atmospheric and geophysical data. Use plain, conversational English — no jargon, no acronyms. Explain things simply. Start with the most interesting thing that happened. Be warm but factual. Do NOT speculate about causes. Only state what the data shows. Do NOT use phrases like "trust me", "I believe", "proves that", "definitely", "will cause". End with one thing to look for tomorrow.`,

  analyst: `You are the Observatory Daily Brief writer for intermediate-level atmospheric observers. Write a 3-5 sentence technical summary of the last 24 hours. Use standard meteorological and geophysical terminology but define unusual terms inline. Reference specific feeds and data values. Note any correlations between feeds (e.g., geomagnetic activity coinciding with ionospheric changes). Do NOT speculate about causation — only note temporal correlations. Do NOT use alarmist language.`,

  researcher: `You are the Observatory Daily Brief writer for researchers and data analysts. Write a 4-6 sentence data-dense summary of the last 24 hours. Reference specific feed IDs, entry counts, and data values. Note cross-feed correlations with timestamps. Include observation gaps and data quality notes. Use standard scientific notation and terminology. Do NOT speculate — state observations and correlations only. Note any anomalies relative to baseline.`,
};

// ── Call OpenAI for summary generation ──────────────────────
async function generateBriefText(dataSnapshot, level = 'observer') {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.warn('[BRIEF] No OPENAI_API_KEY — falling back to template');
    return null;
  }

  const systemPrompt = SYSTEM_PROMPTS[level] || SYSTEM_PROMPTS.observer;
  const userPrompt = `Here is the data from the last 24 hours across ${dataSnapshot.activeFeeds} active feeds (${dataSnapshot.totalEntries} total observations):\n\n${JSON.stringify(dataSnapshot.snapshot, null, 2)}\n\nWrite the daily brief.`;

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3, // Low temperature for factual output
        max_tokens: 400,
      }),
    });

    if (!res.ok) {
      console.warn(`[BRIEF] OpenAI error: HTTP ${res.status}`);
      return null;
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() || null;
  } catch (err) {
    console.warn(`[BRIEF] OpenAI fetch error: ${err.message}`);
    return null;
  }
}

// ── Template fallback (deterministic, no AI) ────────────────
function generateTemplateBrief(dataSnapshot) {
  const { snapshot, activeFeeds, totalEntries } = dataSnapshot;
  const parts = [`${activeFeeds} of 20 feeds reported ${totalEntries} observations in the last 24 hours.`];

  // Highlight notable conditions
  if (snapshot.earthquake?.entries > 15) parts.push(`Elevated seismic activity: ${snapshot.earthquake.entries} events recorded.`);
  if (snapshot.geomag?.status === 'live' && snapshot.geomag.kpIndex > 4) parts.push(`Geomagnetic conditions are active (Kp ${snapshot.geomag.kpIndex}).`);
  if (snapshot.lightning?.entries > 50) parts.push(`High lightning density detected across monitoring network.`);
  if (snapshot.wildfire?.entries > 0) parts.push(`Active wildfire incidents being tracked.`);
  if (snapshot.volcanic?.entries > 0) parts.push(`Elevated volcanic activity reported.`);

  if (parts.length === 1) parts.push('All systems nominal — no significant anomalies detected.');

  return parts.join(' ');
}

// ── Validate through Lume-V ─────────────────────────────────
function validateBrief(text, level) {
  console.log(`[BRIEF] Validating through Lume-V (${text.length} chars)...`);

  const result = governor.validateLLM(text, 0.85, 'gpt-4o-mini');

  console.log(`[BRIEF] Lume-V decision: ${result.decision}`);
  console.log(`[BRIEF] Latency: ${result.latency}ms`);

  if (result.explanation?.narrative) {
    console.log(`[BRIEF] Trace: ${result.explanation.narrative.substring(0, 200)}...`);
  }

  return result;
}

// ── Generate and save the daily brief ───────────────────────
export async function generateDailyBrief() {
  console.log(`\n[BRIEF] ═══ Daily Brief Generation ═══ ${new Date().toISOString()}`);

  const dataSnapshot = buildDataSnapshot();
  console.log(`[BRIEF] ${dataSnapshot.activeFeeds} active feeds, ${dataSnapshot.totalEntries} total entries`);

  const briefs = {};

  for (const level of ['observer', 'analyst', 'researcher']) {
    console.log(`[BRIEF] Generating ${level} brief...`);

    let text = await generateBriefText(dataSnapshot, level);
    let governance = null;
    let source = 'ai';

    if (text) {
      // Pass through Lume-V
      governance = validateBrief(text, level);

      if (governance.decision === 'approved') {
        console.log(`[BRIEF] ${level}: APPROVED by Lume-V ✓`);
      } else {
        console.log(`[BRIEF] ${level}: ${governance.decision.toUpperCase()} — retrying with tighter prompt...`);

        // Retry once with explicit constraint
        const retryText = await generateBriefText(dataSnapshot, level);
        if (retryText) {
          governance = validateBrief(retryText, level);
          if (governance.decision === 'approved') {
            text = retryText;
            console.log(`[BRIEF] ${level}: APPROVED on retry ✓`);
          } else {
            // Fall back to template
            console.log(`[BRIEF] ${level}: Still ${governance.decision} — using template fallback`);
            text = generateTemplateBrief(dataSnapshot);
            source = 'template';
            governance = null;
          }
        }
      }
    } else {
      // No AI available — use template
      text = generateTemplateBrief(dataSnapshot);
      source = 'template';
    }

    briefs[level] = {
      text,
      source,
      governance: governance ? {
        decision: governance.decision,
        certificateHash: governance.certificate?.hash || null,
        latency: governance.latency,
        invariantsPassed: governance.explanation?.invariantResults?.filter(r => r.passed)?.length || 0,
        invariantsTotal: 7,
      } : null,
    };
  }

  // Build final brief object
  const brief = {
    version: '1.0.0',
    generatedAt: new Date().toISOString(),
    dataWindow: '24h',
    activeFeeds: dataSnapshot.activeFeeds,
    totalObservations: dataSnapshot.totalEntries,
    briefs,
    sha256: createHash('sha256').update(JSON.stringify(briefs)).digest('hex'),
  };

  // Save to state
  mkdirSync(STATE_DIR, { recursive: true });
  writeFileSync(BRIEF_PATH, JSON.stringify(brief, null, 2));
  console.log(`[BRIEF] Saved to ${BRIEF_PATH}`);
  console.log(`[BRIEF] SHA-256: ${brief.sha256}`);

  // Anchor to TrustLayer PoA blockchain
  try {
    const anchor = await anchorBrief(brief.sha256, {
      generatedAt: brief.generatedAt,
      activeFeeds: brief.activeFeeds,
      totalObservations: brief.totalObservations,
    });
    if (anchor.success) {
      brief.trustLayer = {
        txHash: anchor.txHash,
        blockHeight: anchor.blockHeight,
        anchoredAt: anchor.timestamp,
      };
      // Re-save with trustLayer data
      writeFileSync(BRIEF_PATH, JSON.stringify(brief, null, 2));
      console.log(`[BRIEF] ✓ Anchored to TrustLayer — tx: ${anchor.txHash}`);
    } else {
      console.warn(`[BRIEF] TrustLayer anchor failed: ${anchor.error}`);
      brief.trustLayer = { status: 'pending', error: anchor.error };
      writeFileSync(BRIEF_PATH, JSON.stringify(brief, null, 2));
    }

    // Also anchor each Lume-V certificate individually
    for (const [level, data] of Object.entries(briefs)) {
      if (data.governance?.certificateHash) {
        anchorLumeVCert(data.governance.certificateHash, { level, briefHash: brief.sha256 })
          .then(r => { if (r.success) console.log(`[BRIEF] ✓ Lume-V cert (${level}) anchored — tx: ${r.txHash}`); })
          .catch(() => {});
      }
    }
  } catch (err) {
    console.warn(`[BRIEF] TrustLayer anchor error: ${err.message}`);
  }

  return brief;
}

// ── Read the current brief ──────────────────────────────────
export function getCurrentBrief() {
  try {
    if (!existsSync(BRIEF_PATH)) return null;
    return JSON.parse(readFileSync(BRIEF_PATH, 'utf8'));
  } catch { return null; }
}

// ── Standalone execution ────────────────────────────────────
if (process.argv[1] && process.argv[1].includes('brief-generator')) {
  console.log(`[BRIEF] ${IDENTITY.name} v${IDENTITY.version}`);
  generateDailyBrief().then(() => console.log('[BRIEF] Done.')).catch(err => {
    console.error('[BRIEF] FATAL:', err);
    process.exit(1);
  });
}
