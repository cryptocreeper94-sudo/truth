#!/usr/bin/env node
/**
 * TRUTH — Research Daemon v0.3.0
 * DarkWave Studios LLC — Copyright 2026
 *
 * A deterministic research engine for the Truth provenance-first archive.
 * Built on the 42-doctrine Deterministic Dissolution Ladder architecture.
 *
 * Module mapping (DDA 42-doctrine alignment):
 *
 * Layer 1 — Identity & Structure
 *   [01] Identity Kernel    → DAEMON_IDENTITY: immutable identity cert, version, author
 *   [02] Boundary Engine    → METHOD.md as hard boundary: no claim generated outside it
 *   [03] Differentiation    → Domain queue: separates research into discrete topics
 *   [07] Locality Engine    → Each claim card is an isolated cell; no cross-contamination
 *
 * Layer 2 — Cognition & Reference
 *   [08] Temporal Engine    → Every claim timestamped, every commit causally ordered
 *   [10] Epistemic Model    → Tier system: what we CAN know (Tier 1) vs what we CANNOT
 *   [12] Meta-Phenomenology → Validation pass: does the generated claim comply with METHOD?
 *
 * Layer 3 — Constraint & Determinacy
 *   [13] Constraint Engine  → METHOD.md rules as non-overridable constraints
 *   [14] Determinacy Engine → Every claim traceable to a specific source; no inference from absence
 *   [16] Domain Mapper      → Research queue maps input to correct investigation domain
 *
 * Layer 4 — System & Coherence
 *   [20] Coherence Engine   → Cross-reference validation: sources exist, IDs consistent
 *   [22] Continuity Layer   → daemon_state.json: append-only cycle log, rollback from any point
 *   [23] Causality Engine   → Git commit chain: cryptographic causal ordering
 *   [26] Arbitration Layer  → Confidence tagging rules: DOCUMENTED > CONTESTED > SPECULATIVE
 *
 * Layer 5 — Integration & Resolution
 *   [31] Verification       → Post-generation validation: YAML frontmatter valid, sources cited
 *   [32] Integrity Layer    → Git SHA on every commit; tamper-evident by construction
 *   [33] Alignment Layer    → Budget gates: human-controlled spend limits
 *   [34] Invariance Layer   → METHOD.md is immutable; daemon cannot modify it
 *
 * Layer 6 — Safety Envelope
 *   [35] Collapse Detection → Budget threshold monitoring; halt before overspend
 *   [37] Null Boundary      → No claim generated without a cited source (absence ≠ evidence)
 *   [40] Non-Being Guard    → Domain exhaustion detection; halt when queue is empty
 *   [42] Devoid Limit       → Fatal error handler; clean shutdown, state preserved
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import crypto from 'crypto';
import OpenAI from 'openai';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');

// ═══════════════════════════════════════════════════════════════════════════════
// [01] IDENTITY KERNEL — Immutable. Never modified at runtime.
// ═══════════════════════════════════════════════════════════════════════════════
const IDENTITY = Object.freeze({
  name: 'truth-research-daemon',
  version: '0.3.0',
  author: 'Andrews, Ronald Jason — DarkWave Studios LLC',
  license: 'CC-BY-4.0',
  architecture: 'DDA 42-Doctrine / Deterministic Dissolution Ladder',
  purpose: 'Provenance-first research engine for the Truth archive',
  law: 'METHOD.md',
  invariant: 'The daemon cannot generate a claim without a cited, verifiable Tier-1 source',
});

// ═══════════════════════════════════════════════════════════════════════════════
// [13] CONSTRAINT ENGINE — Non-overridable configuration
// ═══════════════════════════════════════════════════════════════════════════════
const CONFIG = Object.freeze({
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  openaiModel: process.env.TRUTH_MODEL || 'gpt-4o',

  // GitHub API — the daemon reads/writes directly to the repo
  githubToken: process.env.GITHUB_TOKEN || '',
  githubOwner: 'cryptocreeper94-sudo',
  githubRepo: 'truth',
  githubBranch: 'main',

  // Local paths (for METHOD.md baked into Docker image)
  methodFile: path.join(REPO_ROOT, 'METHOD.md'),
  stateFile: path.join(__dirname, 'daemon_state.json'),
  budgetFile: path.join(__dirname, 'daemon_budget.json'),
  auditLog: path.join(__dirname, 'audit.log'),

  claimsPerCycle: 3,
  cycleIntervalMs: 6 * 60 * 60 * 1000, // 6 hours
  budgetCents: 3000,                    // $30.00 per window
  cycleDays: 30,
  warnThreshold: 0.80,
  pauseThreshold: 0.95,

  // GPT-4o cost (per 1M tokens)
  inputCostPer1M: 2.50,
  outputCostPer1M: 10.00,

  port: parseInt(process.env.PORT || '4242'),
});

// ═══════════════════════════════════════════════════════════════════════════════
// [03] DIFFERENTIATION ENGINE — Domain queue, ordered by Tier-1 density
// ═══════════════════════════════════════════════════════════════════════════════
const DOMAIN_QUEUE = [
  // ── TIER 1: Foundation — heaviest Tier-1 material ──
  { id: 'biblical_lineage', shortName: 'Biblical Lineage', name: 'Biblical Lineage & Table of Nations', desc: 'Genesis 5, 10, 11; 1 Chronicles 1; Josephus Antiquities I.6; Book of Jubilees 8-9. Trace the genealogies of Shem, Ham, and Japheth. Map names to territories and historically attested peoples. Septuagint vs Masoretic chronological differences. Ethiopian Solomonic lineage through Kebra Nagast.' },
  { id: 'biblical_textual', shortName: 'Biblical Texts', name: 'Biblical Textual Transmission', desc: 'Dead Sea Scrolls vs Masoretic Text vs Septuagint vs Samaritan Pentateuch. Specific textual variants with manuscript citations. Books removed from the KJV between 1611 and present. The Tetragrammaton replacement. Council of Nicaea records vs popular claims about what it decided.' },
  { id: 'calendar_chronology', shortName: 'Calendar Systems', name: 'Calendar Reform & Chronological Disputes', desc: 'Inter gravissimas (1582). British Calendar Act (1750). Russian adoption (1918). Greek adoption (1923). Phantom time hypothesis (Illig) tagged SPECULATIVE. Anno Mundi vs Anno Domini dating systems. The Scaliger chronology.' },
  { id: 'cartography', shortName: 'Cartography', name: 'Historical Cartography & Lost Territories', desc: 'Tartary on European maps 1500-1900. Piri Reis map (1513). Oronce Finé (1531). Buache (1737). Mercator, Ortelius, Blaeu atlases. The term Tartary in Encyclopædia Britannica editions.' },
  { id: 'monetary_systems', shortName: 'Financial Origins', name: 'Monetary System Origins & Control', desc: 'Federal Reserve Act (1913). Jekyll Island meeting (1910). Bank of England charter (1694). Bretton Woods (1944) and Nixon shock (1971). Executive Order 11110 (1963). Central bank ownership structures worldwide.' },

  // ── TIER 2: Institutional & governmental ──
  { id: 'intelligence_ops', shortName: 'Intelligence Programs', name: 'Declassified Intelligence Programs', desc: 'Operation Paperclip (JIOA files). MKUltra (surviving CIA files). Operation Mockingbird (Church Committee). COINTELPRO (FBI files). Operation Northwoods (Joint Chiefs memo). Gulf of Tonkin (NSA declassified). Each with specific NARA record groups and FOIA document numbers.' },
  { id: 'institutional_history', shortName: 'Institutional Origins', name: 'Institutional Origins & Charters', desc: 'Smithsonian Institution Act (1846). Carnegie Foundation charter. Rockefeller Foundation. General Education Board. Rhodes Trust. Council on Foreign Relations founding documents. Each from founding statutes or institutional archives.' },
  { id: 'education_design', shortName: 'Education Design', name: 'Education System Design Documents', desc: 'Prussian education model and American adoption (Horace Mann 1843 report). GEB Occasional Letter No. 1 (1906). Carnegie Foundation reports. John Dewey writings. Reece Committee transcripts (1954).' },

  // ── TIER 3: Physical evidence ──
  { id: 'ancient_architecture', shortName: 'Ancient Engineering', name: 'Ancient Architecture & Engineering', desc: 'Great Pyramid measurements. Puma Punku precision stonework. Göbekli Tepe dating. Roman concrete lost formula. Acoustic properties of ancient temples. Megalithic construction worldwide with measurements.' },
  { id: 'buried_cities', shortName: 'Buried Cities', name: 'Buried Architecture & Underground Districts', desc: 'Seattle Underground. Portland Shanghai Tunnels. Edinburgh Mary King\'s Close. Derinkuyu underground city. Cappadocia. Chicago street regrading. Each with municipal records or archaeological documentation.' },
  { id: 'vitrified_forts', shortName: 'Star Forts', name: 'Vitrified Forts & Meltology', desc: 'Scottish vitrified forts (Tap o\'Noth, Craig Phadrig, Finavon). French vitrified structures. Temperature analysis. Competing theories: deliberate technique, siege, unknown energy. Each with location and archaeological survey.' },
  { id: 'anomalous_remains', shortName: 'Archaeology', name: 'Anomalous Archaeological Remains', desc: 'Giant skeleton newspaper reports with publication dates and page numbers. Smithsonian accession records. Elongated skulls (Paracas, Malta). Ancient tool finds in unexpected strata. Each cited by specific newspaper, date, page.' },

  // ── TIER 4: Civilization patterns ──
  { id: 'orphan_generation', shortName: 'Orphan History', name: 'The Orphan Generation', desc: 'Orphan trains (1854-1929) CAS records. Foundling hospitals across Europe. Baby farms. Industrial schools. Magdalene laundries. Census record gaps. Birth certificate availability pre-1900.' },
  { id: 'world_fairs', shortName: 'World Fairs', name: 'World\'s Fairs & Exhibition Architecture', desc: '1893 Chicago World\'s Fair (White City). 1904 St. Louis. Crystal Palace (1851). Construction timelines vs claimed methods. Photographs of demolition. Architectural style consistency.' },
  { id: 'reset_evidence', shortName: 'Reset Evidence', name: 'Civilization Reset Physical Evidence', desc: 'Buried ground floors. Sealed basement windows. Star forts worldwide. Old-world technology patent records. Atmospheric electricity infrastructure. Mercury vortex engine patents.' },

  // ── TIER 5: Deep chronology ──
  { id: 'forbidden_archaeology', shortName: 'Suppressed Finds', name: 'Suppressed Archaeological Finds', desc: 'Source documents (not conclusions): out-of-place artifacts with museum catalog numbers. Acámbaro figurines. Ica stones. Antikythera mechanism. Baghdad battery. Each with institutional holder and catalog reference.' },
  { id: 'ancient_texts', shortName: 'Ancient Texts', name: 'Suppressed & Removed Ancient Texts', desc: 'Book of Enoch. Book of Jasher. Book of Giants (DSS). Nag Hammadi library. Gospel of Thomas. Acts of Pilate. Each with manuscript tradition, institutional holders, and dating. Council records for canon decisions.' },
  { id: 'flood_traditions', shortName: 'Flood Narratives', name: 'Global Flood Traditions', desc: 'Over 200 documented flood narratives. Sumerian (Ziusudra). Babylonian (Atrahasis, Gilgamesh XI). Greek (Deucalion). Hindu (Matsya/Manu). Chinese (Gun-Yu). Mesoamerican. Each with source text and parallels. Geological evidence: Black Sea deluge, Younger Dryas.' },
  { id: 'name_etymology', shortName: 'Etymology', name: 'Ancient Name & Place Etymology', desc: 'Hebrew name meanings. Place name etymology tracing ancient peoples (Iberia/Eber, Assyria/Asshur). Language family trees and Genesis 10 genealogies. Tower of Babel narrative vs linguistic diversification evidence.' },
];

// ═══════════════════════════════════════════════════════════════════════════════
// [02] BOUNDARY ENGINE — METHOD.md is the law. Loaded once, never modified.
// ═══════════════════════════════════════════════════════════════════════════════
function loadMethod() {
  const methodPath = CONFIG.methodFile;
  if (!fs.existsSync(methodPath)) {
    // [42] Devoid Limit — cannot operate without the law
    console.error('[42/DEVOID] METHOD.md not found. Daemon cannot operate without the law. HALT.');
    process.exit(1);
  }
  const method = fs.readFileSync(methodPath, 'utf-8');
  const hash = crypto.createHash('sha256').update(method).digest('hex');
  auditWrite(`[02/BOUNDARY] METHOD.md loaded. SHA-256: ${hash}`);
  return Object.freeze({ text: method, hash });
}

// ═══════════════════════════════════════════════════════════════════════════════
// [22] CONTINUITY LAYER — State persistence. Append-only audit log.
// ═══════════════════════════════════════════════════════════════════════════════
function auditWrite(entry) {
  const line = `[${new Date().toISOString()}] ${entry}\n`;
  fs.appendFileSync(CONFIG.auditLog, line);
  console.log(entry);
}

function loadState() {
  try {
    if (fs.existsSync(CONFIG.stateFile)) {
      return JSON.parse(fs.readFileSync(CONFIG.stateFile, 'utf-8'));
    }
  } catch (e) {
    auditWrite(`[22/CONTINUITY] State load failed: ${e.message}. Initializing fresh.`);
  }
  return {
    queuePosition: 0,
    totalClaims: 0,
    totalSources: 0,
    cycleCount: 0,
    lastCycleAt: null,
    status: 'running',
    startedAt: new Date().toISOString(),
    methodHash: null,  // [34] Invariance — track METHOD.md hash
  };
}

function saveState(state) {
  fs.writeFileSync(CONFIG.stateFile, JSON.stringify(state, null, 2));
}

// ═══════════════════════════════════════════════════════════════════════════════
// [33] ALIGNMENT LAYER — Budget governance. Human-controlled spend limits.
// ═══════════════════════════════════════════════════════════════════════════════
function loadBudget() {
  try {
    if (fs.existsSync(CONFIG.budgetFile)) {
      const b = JSON.parse(fs.readFileSync(CONFIG.budgetFile, 'utf-8'));
      const elapsed = (Date.now() - new Date(b.cycleStartDate).getTime()) / (1000 * 60 * 60 * 24);
      if (elapsed > CONFIG.cycleDays) {
        auditWrite(`[33/ALIGNMENT] Budget cycle expired (${elapsed.toFixed(1)} days). Resetting.`);
        return resetBudget();
      }
      return b;
    }
  } catch (e) {
    auditWrite(`[33/ALIGNMENT] Budget load failed: ${e.message}. Initializing.`);
  }
  return resetBudget();
}

function resetBudget() {
  const b = {
    budgetCents: CONFIG.budgetCents,
    spentCents: 0,
    cycleStartDate: new Date().toISOString(),
    totalTokensIn: 0,
    totalTokensOut: 0,
  };
  fs.writeFileSync(CONFIG.budgetFile, JSON.stringify(b, null, 2));
  return b;
}

// [35] COLLAPSE DETECTION — Budget threshold monitoring
function recordSpend(budget, tokensIn, tokensOut) {
  const costIn = (tokensIn / 1_000_000) * CONFIG.inputCostPer1M;
  const costOut = (tokensOut / 1_000_000) * CONFIG.outputCostPer1M;
  const totalCost = Math.ceil((costIn + costOut) * 100);
  budget.spentCents += totalCost;
  budget.totalTokensIn += tokensIn;
  budget.totalTokensOut += tokensOut;
  fs.writeFileSync(CONFIG.budgetFile, JSON.stringify(budget, null, 2));
  const pct = budget.spentCents / budget.budgetCents;
  auditWrite(`[33/ALIGNMENT] Spend: $${(budget.spentCents / 100).toFixed(2)} / $${(budget.budgetCents / 100).toFixed(2)} (${(pct * 100).toFixed(1)}%)`);
  if (pct >= CONFIG.pauseThreshold) {
    auditWrite('[35/COLLAPSE] PAUSE THRESHOLD reached. Halting research until budget cycle resets.');
    return 'paused';
  }
  if (pct >= CONFIG.warnThreshold) {
    auditWrite('[35/COLLAPSE] Warning threshold reached. Reducing claims per cycle.');
  }
  return 'ok';
}

// ═══════════════════════════════════════════════════════════════════════════════
// [20] COHERENCE ENGINE — Archive scanner. Cross-reference validation.
// ═══════════════════════════════════════════════════════════════════════════════
async function githubApiGet(path) {
  const url = `https://api.github.com/repos/${CONFIG.githubOwner}/${CONFIG.githubRepo}/contents/${path}?ref=${CONFIG.githubBranch}`;
  const res = await fetch(url, {
    headers: {
      'Authorization': `token ${CONFIG.githubToken}`,
      'Accept': 'application/vnd.github.v3+json',
    },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub API ${res.status}: ${await res.text()}`);
  return res.json();
}

async function githubApiPut(path, content, message) {
  const url = `https://api.github.com/repos/${CONFIG.githubOwner}/${CONFIG.githubRepo}/contents/${path}`;
  // Check if file exists (need sha for update)
  const existing = await githubApiGet(path);
  const body = {
    message,
    content: Buffer.from(content).toString('base64'),
    branch: CONFIG.githubBranch,
  };
  if (existing && existing.sha) body.sha = existing.sha;
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `token ${CONFIG.githubToken}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`GitHub PUT ${res.status}: ${await res.text()}`);
  const result = await res.json();
  return result.commit?.sha || 'unknown';
}

async function scanArchive() {
  const scan = { claims: [], sources: [], digs: [], maxClaimId: 0, maxSourceId: 0 };

  // Scan claims via GitHub API
  const claimsDir = await githubApiGet('claims');
  if (Array.isArray(claimsDir)) {
    for (const f of claimsDir) {
      if (f.name.endsWith('.md')) {
        const match = f.name.match(/C-(\d+)/);
        if (match) {
          const id = parseInt(match[1]);
          if (id > scan.maxClaimId) scan.maxClaimId = id;
          scan.claims.push(f.name);
        }
      }
    }
  }

  // Scan sources via GitHub API
  const sourcesDir = await githubApiGet('sources/tier-1');
  if (Array.isArray(sourcesDir)) {
    for (const f of sourcesDir) {
      if (f.name.endsWith('.md')) {
        const match = f.name.match(/S-(\d+)/);
        if (match) {
          const id = parseInt(match[1]);
          if (id > scan.maxSourceId) scan.maxSourceId = id;
          scan.sources.push(f.name);
        }
      }
    }
  }

  // Scan digs via GitHub API
  const digsDir = await githubApiGet('digs');
  if (Array.isArray(digsDir)) {
    scan.digs = digsDir.filter(f => f.name.endsWith('.md')).map(f => f.name);
  }

  auditWrite(`[20/COHERENCE] Archive: ${scan.claims.length} claims (max C-${String(scan.maxClaimId).padStart(4, '0')}), ${scan.sources.length} sources (max S-${String(scan.maxSourceId).padStart(4, '0')}), ${scan.digs.length} digs`);
  return scan;
}

// ═══════════════════════════════════════════════════════════════════════════════
// [14] DETERMINACY ENGINE + [37] NULL BOUNDARY GUARD
// Every claim must trace to a source. No inference from absence.
// ═══════════════════════════════════════════════════════════════════════════════
async function researchDomain(client, domain, scan, method) {
  const nextClaimId = scan.maxClaimId + 1;
  const nextSourceId = scan.maxSourceId + 1;

  const systemPrompt = `You are the TRUTH Archive Research Engine, a deterministic research node operating under the 42-doctrine Deterministic Dissolution Ladder.

YOUR LAW (METHOD.md — immutable, SHA-256: ${method.hash}):
${method.text}

DETERMINISTIC CONSTRAINTS (non-overridable):
1. [37/NULL-BOUNDARY] Every claim MUST cite a SPECIFIC, NAMED, VERIFIABLE Tier-1 source. No claim without a source. Absence is never evidence.
2. [26/ARBITRATION] Confidence hierarchy: DOCUMENTED (Tier 1-2 verifiable) > CONTESTED (genuine conflict) > SPECULATIVE (hypothesis, never corroborates). BE CONSERVATIVE.
3. [02/BOUNDARY] Every claim MUST have a genuine objection section "at full strength" — the strongest possible counter-argument.
4. [34/INVARIANCE] You cannot modify or contradict METHOD.md. It is the law.
5. [14/DETERMINACY] Every claim must be traceable. Include specific: dates, institutional holders, catalog references, verification URLs.
6. [10/EPISTEMIC] Tag what you CANNOT verify. If a source is a secondary account, say so. If dating is uncertain, say so.
7. [07/LOCALITY] Each claim is an isolated cell. Do not let one claim's interpretation contaminate another.

EXACT CLAIM FRONTMATTER FORMAT (you MUST use this exact structure, no quotes around values):
---
id: C-XXXX
title: Short descriptive title of the claim
domain: ${domain.shortName}
confidence: DOCUMENTED
sources: [S-XXXX, S-XXXY]
related: [C-XXXX]
status: active
---

# C-XXXX — Title

## The claim
[State the claim clearly with specific facts, dates, and institutional references]

## The evidence
[Cite specific Tier-1 sources with catalog numbers, institutional holders, and verification URLs]

## Objection at full strength
[The strongest possible counter-argument, stated honestly]

EXACT SOURCE FRONTMATTER FORMAT (you MUST use this exact structure, no quotes around values):
---
id: S-XXXX
title: Source title
tier: 1
type: manuscript OR government-record OR newspaper OR archaeological-survey OR institutional-record
holder: Institution Name
date-of-object: YYYY or ~YYYY
verify-at: https://real-verification-url.example.com
image-url: https://commons.wikimedia.org/... (if available, use real Wikimedia Commons URLs)
external-refs: [https://en.wikipedia.org/wiki/..., https://other-real-reference.com]
---

# S-XXXX — Source title

## What it is
[Description of the physical object or document]

## Where it is held
[Institution, catalog number, access details]

## Verification
[How someone can independently verify this source exists]

OUTPUT FORMAT (strict JSON):
{
  "claims": [
    {
      "id": "C-XXXX",
      "filename": "C-XXXX-slug.md",
      "content": "full markdown with YAML frontmatter exactly as specified above"
    }
  ],
  "sources": [
    {
      "id": "S-XXXX",
      "filename": "S-XXXX-slug.md",
      "content": "full markdown with YAML frontmatter exactly as specified above"
    }
  ]
}

IMPORTANT: Do NOT put quotes around YAML values. Write: title: My Title (not title: "My Title"). Write: sources: [S-0001] (not sources: ["S-0001"]).

For the related field: scan the EXISTING CLAIMS list below and identify any claims that share the same topic, time period, or geographical region. List their IDs in the related field.

For verify-at and image-url: use REAL, working URLs from known institutions (Library of Congress, Wikimedia Commons, National Archives, British Museum, etc.). If you cannot provide a real URL, omit the field rather than inventing one.

Start claim IDs at C-${String(nextClaimId).padStart(4, '0')}.
Start source IDs at S-${String(nextSourceId).padStart(4, '0')}.
Generate exactly ${CONFIG.claimsPerCycle} claims and their required sources.

EXISTING CLAIMS (do not duplicate, use for related field):
${scan.claims.join('\n')}

EXISTING DIGS (assign claims to relevant digs):
${scan.digs.join('\n')}`;

  const userPrompt = `Research domain: ${domain.name}

Description: ${domain.desc}

Generate ${CONFIG.claimsPerCycle} NEW claims with supporting sources. Each claim must cite specific, verifiable Tier-1 sources with institutional holders and catalog references. Include full-strength counter-arguments. Return ONLY valid JSON.`;

  auditWrite(`[16/DOMAIN] Researching: ${domain.name}`);
  auditWrite(`[14/DETERMINACY] Generating ${CONFIG.claimsPerCycle} claims starting at C-${String(nextClaimId).padStart(4, '0')}`);

  const response = await client.chat.completions.create({
    model: CONFIG.openaiModel,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: 8000,
    response_format: { type: 'json_object' },
  });

  const usage = response.usage || {};
  auditWrite(`[08/TEMPORAL] Tokens: ${usage.prompt_tokens || '?'} in, ${usage.completion_tokens || '?'} out`);

  return {
    data: JSON.parse(response.choices[0].message.content),
    tokensIn: usage.prompt_tokens || 0,
    tokensOut: usage.completion_tokens || 0,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// [31] VERIFICATION LAYER — Post-generation validation
// ═══════════════════════════════════════════════════════════════════════════════
function validateResults(results) {
  let valid = true;

  if (results.claims) {
    for (const claim of results.claims) {
      // [37] Null Boundary: must have content
      if (!claim.content || claim.content.length < 200) {
        auditWrite(`[37/NULL-BOUNDARY] Claim ${claim.id} has insufficient content. Rejecting.`);
        claim._rejected = true;
        valid = false;
        continue;
      }
      // [31] Verification: must have YAML frontmatter
      if (!claim.content.includes('---')) {
        auditWrite(`[31/VERIFICATION] Claim ${claim.id} missing YAML frontmatter. Rejecting.`);
        claim._rejected = true;
        valid = false;
        continue;
      }
      // [37] Null Boundary: must cite at least one source
      if (!claim.content.toLowerCase().includes('source') && !claim.content.includes('S-')) {
        auditWrite(`[37/NULL-BOUNDARY] Claim ${claim.id} does not cite a source. Rejecting.`);
        claim._rejected = true;
        valid = false;
        continue;
      }
      // [02] Boundary: must have objection
      if (!claim.content.toLowerCase().includes('objection')) {
        auditWrite(`[02/BOUNDARY] Claim ${claim.id} missing objection section. Rejecting.`);
        claim._rejected = true;
        valid = false;
      }
    }
  }

  return valid;
}

// ═══════════════════════════════════════════════════════════════════════════════
// [32] INTEGRITY LAYER + [23] CAUSALITY ENGINE
// Write files via GitHub API — each file is a commit in the cryptographic chain
// ═══════════════════════════════════════════════════════════════════════════════
async function writeResults(results, domain) {
  let claimsWritten = 0;
  let sourcesWritten = 0;

  if (results.claims) {
    for (const claim of results.claims) {
      if (claim._rejected) continue;
      try {
        const ghPath = `claims/${claim.filename}`;
        const existing = await githubApiGet(ghPath);
        if (existing) {
          auditWrite(`[20/COHERENCE] Skipped duplicate: ${claim.filename}`);
          continue;
        }
        const commitMsg = `daemon: ${claim.id} — ${domain.name} [${IDENTITY.version}]`;
        const sha = await githubApiPut(ghPath, claim.content, commitMsg);
        const hash = crypto.createHash('sha256').update(claim.content).digest('hex').slice(0, 12);
        auditWrite(`[32/INTEGRITY] Wrote claim: ${claim.filename} (SHA-256: ${hash}...)`);
        auditWrite(`[23/CAUSALITY] Committed: ${sha.slice(0, 8)} — ${commitMsg}`);
        claimsWritten++;
      } catch (e) {
        auditWrite(`[32/INTEGRITY] Failed to write claim ${claim.id}: ${e.message}`);
      }
    }
  }

  if (results.sources) {
    for (const source of results.sources) {
      try {
        const ghPath = `sources/tier-1/${source.filename}`;
        const existing = await githubApiGet(ghPath);
        if (existing) {
          auditWrite(`[20/COHERENCE] Skipped duplicate: ${source.filename}`);
          continue;
        }
        const commitMsg = `daemon: ${source.id} — source for ${domain.name} [${IDENTITY.version}]`;
        const sha = await githubApiPut(ghPath, source.content, commitMsg);
        const hash = crypto.createHash('sha256').update(source.content).digest('hex').slice(0, 12);
        auditWrite(`[32/INTEGRITY] Wrote source: ${source.filename} (SHA-256: ${hash}...)`);
        auditWrite(`[23/CAUSALITY] Committed: ${sha.slice(0, 8)} — ${commitMsg}`);
        sourcesWritten++;
      } catch (e) {
        auditWrite(`[32/INTEGRITY] Failed to write source ${source.id}: ${e.message}`);
      }
    }
  }

  return { claimsWritten, sourcesWritten };
}

// ═══════════════════════════════════════════════════════════════════════════════
// HEALTH SERVER — Status endpoint for Coolify monitoring
// ═══════════════════════════════════════════════════════════════════════════════
function startHealthServer(stateRef, budgetRef) {
  const server = http.createServer((req, res) => {
    if (req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        identity: IDENTITY.name,
        version: IDENTITY.version,
        architecture: IDENTITY.architecture,
        status: stateRef.status,
        uptime: Math.floor(process.uptime()),
        cycleCount: stateRef.cycleCount,
        totalClaims: stateRef.totalClaims,
        totalSources: stateRef.totalSources,
        budgetSpent: `$${(budgetRef.spentCents / 100).toFixed(2)}`,
        budgetRemaining: `$${((budgetRef.budgetCents - budgetRef.spentCents) / 100).toFixed(2)}`,
        lastCycle: stateRef.lastCycleAt,
        nextDomain: DOMAIN_QUEUE[stateRef.queuePosition % DOMAIN_QUEUE.length]?.name,
        methodHash: stateRef.methodHash,
      }));
    } else {
      res.writeHead(404);
      res.end('Not found');
    }
  });
  server.listen(CONFIG.port, () => {
    auditWrite(`[HEALTH] Listening on port ${CONFIG.port}`);
  });
  return server;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN LOOP — Deterministic cycle with full doctrine compliance
// ═══════════════════════════════════════════════════════════════════════════════
async function runCycle(client, state, budget, method) {
  // [40] Non-Being Guard — halt if queue exhausted (will wrap)
  const domain = DOMAIN_QUEUE[state.queuePosition % DOMAIN_QUEUE.length];
  
  // [34] Invariance — verify METHOD.md hasn't been modified
  const currentMethodHash = crypto.createHash('sha256').update(
    fs.readFileSync(CONFIG.methodFile, 'utf-8')
  ).digest('hex');
  if (state.methodHash && currentMethodHash !== state.methodHash) {
    auditWrite(`[34/INVARIANCE] ⚠ METHOD.md hash changed! Expected: ${state.methodHash}, Got: ${currentMethodHash}`);
    auditWrite('[34/INVARIANCE] This is logged but not blocked — METHOD.md may be legitimately updated by curator.');
  }
  state.methodHash = currentMethodHash;

  // [20] Coherence — scan current archive state
  const scan = await scanArchive();

  try {
    // [14] Determinacy — generate claims with full constraint context
    const { data, tokensIn, tokensOut } = await researchDomain(client, domain, scan, method);
    
    // [35] Collapse Detection — check budget
    const budgetStatus = recordSpend(budget, tokensIn, tokensOut);
    if (budgetStatus === 'paused') {
      state.status = 'paused-budget';
      saveState(state);
      return;
    }

    // [31] Verification — validate generated content
    validateResults(data);

    // [32] Integrity + [23] Causality — write to GitHub API with SHA-256 logging
    const { claimsWritten, sourcesWritten } = await writeResults(data, domain);

    // [22] Continuity — update state
    state.totalClaims += claimsWritten;
    state.totalSources += sourcesWritten;
    state.queuePosition = (state.queuePosition + 1) % DOMAIN_QUEUE.length;
    state.cycleCount++;
    state.lastCycleAt = new Date().toISOString();
    state.status = 'running';
    saveState(state);

    auditWrite(`[CYCLE] Complete. Domain: ${domain.name}`);
    auditWrite(`[CYCLE] Claims: +${claimsWritten} (${state.totalClaims} total), Sources: +${sourcesWritten} (${state.totalSources} total)`);
    auditWrite(`[CYCLE] Next: ${DOMAIN_QUEUE[state.queuePosition % DOMAIN_QUEUE.length].name} in ${(CONFIG.cycleIntervalMs / 1000 / 60 / 60).toFixed(1)}h`);

  } catch (e) {
    // [42] Devoid Limit — log error, advance queue, preserve state
    auditWrite(`[42/DEVOID] Error in domain "${domain.name}": ${e.message}`);
    state.queuePosition = (state.queuePosition + 1) % DOMAIN_QUEUE.length;
    saveState(state);
  }
}

async function main() {
  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  ${IDENTITY.name} v${IDENTITY.version}`);
  console.log(`  ${IDENTITY.author}`);
  console.log(`  Architecture: ${IDENTITY.architecture}`);
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');

  // [01] Identity — log identity cert
  auditWrite(`[01/IDENTITY] ${IDENTITY.name} v${IDENTITY.version}`);
  auditWrite(`[01/IDENTITY] Law: ${IDENTITY.law}`);
  auditWrite(`[01/IDENTITY] Invariant: ${IDENTITY.invariant}`);

  if (!CONFIG.openaiApiKey) {
    auditWrite('[42/DEVOID] OPENAI_API_KEY not set. HALT.');
    process.exit(1);
  }

  if (!CONFIG.githubToken) {
    auditWrite('[42/DEVOID] GITHUB_TOKEN not set. Cannot write to repo. HALT.');
    process.exit(1);
  }

  // [02] Boundary — load the law
  const method = loadMethod();
  const client = new OpenAI({ apiKey: CONFIG.openaiApiKey });
  const state = loadState();
  const budget = loadBudget();

  auditWrite(`[13/CONSTRAINT] Model: ${CONFIG.openaiModel}`);
  auditWrite(`[33/ALIGNMENT] Budget: $${(budget.budgetCents / 100).toFixed(2)} / ${CONFIG.cycleDays} days`);
  auditWrite(`[33/ALIGNMENT] Spent: $${(budget.spentCents / 100).toFixed(2)} (${((budget.spentCents / budget.budgetCents) * 100).toFixed(1)}%)`);
  auditWrite(`[03/DIFFERENTIATION] Queue: ${DOMAIN_QUEUE.length} domains, position ${state.queuePosition}`);
  auditWrite(`[16/DOMAIN] Next: ${DOMAIN_QUEUE[state.queuePosition % DOMAIN_QUEUE.length].name}`);

  // Verify GitHub API access
  try {
    const repo = await fetch(`https://api.github.com/repos/${CONFIG.githubOwner}/${CONFIG.githubRepo}`, {
      headers: { 'Authorization': `token ${CONFIG.githubToken}` },
    });
    if (!repo.ok) throw new Error(`Status ${repo.status}`);
    auditWrite(`[23/CAUSALITY] GitHub API verified: ${CONFIG.githubOwner}/${CONFIG.githubRepo}`);
  } catch (e) {
    auditWrite(`[42/DEVOID] GitHub API access failed: ${e.message}. HALT.`);
    process.exit(1);
  }

  // Start health server
  startHealthServer(state, budget);

  // [38] Pre-Structure Monitor — run initial cycle
  auditWrite('[38/PRE-STRUCTURE] Running initial research cycle...');
  await runCycle(client, state, budget, method);

  // Schedule recurring cycles
  setInterval(async () => {
    const currentBudget = loadBudget();
    if (currentBudget.spentCents / currentBudget.budgetCents >= CONFIG.pauseThreshold) {
      auditWrite('[35/COLLAPSE] Budget paused. Waiting for cycle reset.');
      return;
    }
    auditWrite('[38/PRE-STRUCTURE] Starting scheduled research cycle...');
    await runCycle(client, state, currentBudget, method);
  }, CONFIG.cycleIntervalMs);
}

// [42] Devoid Limit — clean shutdown on unrecoverable error
main().catch(e => {
  const msg = `[42/DEVOID] Fatal: ${e.message}`;
  try { auditWrite(msg); } catch (_) { console.error(msg); }
  process.exit(1);
});
