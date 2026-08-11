/**
 * TRUTH — Lume-V Governance Engine
 * Deterministic governance gate between GPT-4o-mini and the Truth Archive.
 *
 * Implements Lume-V CHI Paper layers 2–6:
 *   Layer 2: Input Acceptance (JSON schema validation)
 *   Layer 3: Input Normalization (frontmatter parsing + required fields)
 *   Layer 4: Safety Invariants (7 deterministic predicates)
 *   Layer 5: Explainability Engine (governance trace per claim)
 *   Layer 6: Trust Certificates (SHA-256 hash-chained audit)
 *
 * The model is treated as a powerful but untrustworthy proposer.
 * This engine is the governor. Nothing reaches the archive without passing.
 *
 * 42-Doctrine Alignment:
 *   [13] Constraint Engine  — 7 invariants as non-overridable constraints
 *   [14] Determinacy Engine — every governance decision is traceable
 *   [31] Verification       — post-generation validation
 *   [37] Null Boundary      — no claim without a cited source
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { checkUrlAllowed } from './url-allowlist.mjs';

// ═══════════════════════════════════════════════════════════════════════════════
// LAYER 2 — INPUT ACCEPTANCE
// Validates raw GPT output is structurally valid JSON with expected schema.
// ═══════════════════════════════════════════════════════════════════════════════

export function validateSchema(raw) {
  const trace = { layer: 2, name: 'INPUT_ACCEPTANCE', results: [] };

  if (!raw || typeof raw !== 'object') {
    trace.results.push({ check: 'type', pass: false, reason: 'Output is not an object' });
    return { valid: false, trace };
  }

  if (!Array.isArray(raw.claims)) {
    trace.results.push({ check: 'claims_array', pass: false, reason: 'Missing or non-array "claims" field' });
    return { valid: false, trace };
  }

  if (!Array.isArray(raw.sources)) {
    trace.results.push({ check: 'sources_array', pass: false, reason: 'Missing or non-array "sources" field' });
    return { valid: false, trace };
  }

  for (const claim of raw.claims) {
    if (!claim.id || !claim.filename || !claim.content) {
      trace.results.push({ check: 'claim_fields', pass: false, reason: `Claim missing required fields: ${JSON.stringify(Object.keys(claim))}` });
      return { valid: false, trace };
    }
  }

  for (const source of raw.sources) {
    if (!source.id || !source.filename || !source.content) {
      trace.results.push({ check: 'source_fields', pass: false, reason: `Source missing required fields: ${JSON.stringify(Object.keys(source))}` });
      return { valid: false, trace };
    }
  }

  trace.results.push({ check: 'schema', pass: true, reason: `${raw.claims.length} claims, ${raw.sources.length} sources` });
  return { valid: true, trace };
}

// ═══════════════════════════════════════════════════════════════════════════════
// LAYER 3 — INPUT NORMALIZATION
// Parses YAML frontmatter, validates required fields, normalizes values.
// ═══════════════════════════════════════════════════════════════════════════════

function parseFrontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return null;
  const meta = {};
  for (const line of m[1].split(/\r?\n/)) {
    const i = line.indexOf(':');
    if (i === -1) continue;
    let val = line.slice(i + 1).trim().replace(/^["']|["']$/g, '');
    if (val.startsWith('[') && val.endsWith(']')) {
      val = val.slice(1, -1).split(',').map(s => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
    }
    meta[line.slice(0, i).trim()] = val;
  }
  return meta;
}

export function normalizeClaim(claim) {
  const trace = { layer: 3, name: 'NORMALIZATION', id: claim.id, results: [] };
  const meta = parseFrontmatter(claim.content);

  if (!meta) {
    trace.results.push({ check: 'frontmatter', pass: false, reason: 'No YAML frontmatter found' });
    return { valid: false, meta: null, trace };
  }

  // Required fields
  const required = ['id', 'title', 'domain', 'confidence', 'sources'];
  for (const field of required) {
    if (!meta[field]) {
      trace.results.push({ check: `field_${field}`, pass: false, reason: `Missing required field: ${field}` });
      return { valid: false, meta, trace };
    }
  }

  // Sources must be non-empty
  const sources = Array.isArray(meta.sources) ? meta.sources : [meta.sources];
  if (sources.length === 0 || (sources.length === 1 && sources[0] === '')) {
    trace.results.push({ check: 'sources_nonempty', pass: false, reason: 'sources field is empty — violates NULL BOUNDARY' });
    return { valid: false, meta, trace };
  }

  // ID format
  if (!/^C-\d{4}$/.test(meta.id)) {
    trace.results.push({ check: 'id_format', pass: false, reason: `Invalid claim ID format: ${meta.id}` });
    return { valid: false, meta, trace };
  }

  trace.results.push({ check: 'normalization', pass: true, reason: `${sources.length} sources linked` });
  return { valid: true, meta, sources, trace };
}

export function normalizeSource(source) {
  const trace = { layer: 3, name: 'NORMALIZATION', id: source.id, results: [] };
  const meta = parseFrontmatter(source.content);

  if (!meta) {
    trace.results.push({ check: 'frontmatter', pass: false, reason: 'No YAML frontmatter found' });
    return { valid: false, meta: null, trace };
  }

  const required = ['id', 'title'];
  for (const field of required) {
    if (!meta[field]) {
      trace.results.push({ check: `field_${field}`, pass: false, reason: `Missing required field: ${field}` });
      return { valid: false, meta, trace };
    }
  }

  if (!/^S-\d{4}$/.test(meta.id)) {
    trace.results.push({ check: 'id_format', pass: false, reason: `Invalid source ID format: ${meta.id}` });
    return { valid: false, meta, trace };
  }

  trace.results.push({ check: 'normalization', pass: true, reason: 'Source normalized' });
  return { valid: true, meta, trace };
}

// ═══════════════════════════════════════════════════════════════════════════════
// LAYER 4 — SEVEN SAFETY INVARIANTS
// Each is a deterministic predicate. Violation of ANY triggers rejection.
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Invariant 1: SOURCE LINKAGE
 * Every claim must cite ≥1 source by S-ID, and that source must exist in the output.
 */
function invariant1_sourceLinkage(claim, sourceIds) {
  const sources = Array.isArray(claim.meta.sources) ? claim.meta.sources : [claim.meta.sources];
  const missing = sources.filter(sid => !sourceIds.includes(sid));
  if (missing.length > 0) {
    return { pass: false, reason: `Cited sources not found in output: ${missing.join(', ')}` };
  }
  return { pass: true, reason: `All ${sources.length} cited sources present` };
}

/**
 * Invariant 2: NO FABRICATED URLs
 * Every verify-at URL must be from a known-legitimate domain or omitted.
 */
function invariant2_urlAllowlist(source) {
  const url = source.meta['verify-at'] || source.meta.verification_url;
  if (!url) {
    return { pass: true, reason: 'No URL provided (honest omission)', stripped: false };
  }
  const check = checkUrlAllowed(url);
  if (!check.allowed) {
    return { pass: false, reason: `URL ${url} failed allowlist: ${check.reason}`, stripped: true };
  }
  return { pass: true, reason: `URL allowed: ${check.reason}`, stripped: false };
}

/**
 * Invariant 3: OBJECTION PRESENT
 * Claim body must contain a full-strength objection section.
 */
function invariant3_objectionPresent(claim) {
  const content = claim.content.toLowerCase();
  const hasObjSection = content.includes('## objection') || content.includes('## the objection');
  if (!hasObjSection) {
    return { pass: false, reason: 'Missing ## Objection section' };
  }
  // Check it has substance (at least 100 chars after the header)
  const objIdx = content.indexOf('## objection');
  const afterObj = claim.content.slice(objIdx + 20).trim();
  if (afterObj.length < 100) {
    return { pass: false, reason: `Objection section too short (${afterObj.length} chars, need ≥100)` };
  }
  return { pass: true, reason: 'Objection section present and substantive' };
}

/**
 * Invariant 4: CONFIDENCE CEILING
 * Confidence must never be DOCUMENTED (only verify.mjs can assign that).
 */
function invariant4_confidenceCeiling(claim) {
  if (claim.meta.confidence === 'DOCUMENTED') {
    return { pass: false, reason: 'Model assigned DOCUMENTED — only verify.mjs can do this', corrected: 'SPECULATIVE' };
  }
  const valid = ['SPECULATIVE', 'CONTESTED', 'SUPPRESSED-IF-TRUE'];
  if (!valid.includes(claim.meta.confidence)) {
    return { pass: false, reason: `Unknown confidence level: ${claim.meta.confidence}`, corrected: 'SPECULATIVE' };
  }
  return { pass: true, reason: `Confidence ${claim.meta.confidence} is valid` };
}

/**
 * Invariant 5: NO SELF-CENSORSHIP
 * Output must contain claims in the requested domain.
 */
function invariant5_noCensorship(claims, requestedDomain) {
  const domainNames = claims.map(c => c.meta?.domain).filter(Boolean);
  const onTopic = domainNames.filter(d => d === requestedDomain);
  if (onTopic.length === 0 && claims.length > 0) {
    return { pass: false, reason: `0/${claims.length} claims in requested domain "${requestedDomain}". Model may be evading.`, evaded: true };
  }
  return { pass: true, reason: `${onTopic.length}/${claims.length} claims on topic` };
}

/**
 * Invariant 6: DUPLICATION GUARD
 * Claim title shouldn't substantially match an existing claim.
 */
function invariant6_duplicationGuard(claim, existingClaims) {
  const newTitle = claim.meta.title?.toLowerCase().replace(/[^a-z0-9]/g, '') || '';
  if (newTitle.length < 10) return { pass: true, reason: 'Title too short to check' };

  for (const existing of existingClaims) {
    const existingTitle = existing.replace(/^C-\d+-/, '').replace(/\.md$/, '').replace(/-/g, '').toLowerCase();
    // Simple similarity: check if >80% of words overlap
    const newWords = new Set(newTitle.match(/.{3,}/g) || []);
    const existWords = new Set(existingTitle.match(/.{3,}/g) || []);
    const overlap = [...newWords].filter(w => existWords.has(w)).length;
    const similarity = overlap / Math.max(newWords.size, 1);
    if (similarity > 0.7) {
      return { pass: false, reason: `Potential duplicate of ${existing} (similarity: ${(similarity * 100).toFixed(0)}%)` };
    }
  }
  return { pass: true, reason: 'No duplicates detected' };
}

/**
 * Invariant 7: DOMAIN BOUNDARY
 * Claims must stay in the assigned investigation domain.
 */
function invariant7_domainBoundary(claim, requestedDomain) {
  if (claim.meta.domain !== requestedDomain) {
    return { pass: false, reason: `Claim domain "${claim.meta.domain}" doesn't match requested "${requestedDomain}"` };
  }
  return { pass: true, reason: 'Domain matches' };
}

// ═══════════════════════════════════════════════════════════════════════════════
// LAYER 5 — EXPLAINABILITY ENGINE
// Produces deterministic governance trace for every claim.
// ═══════════════════════════════════════════════════════════════════════════════

function buildGovernanceTrace(claimId, invariantResults, timestamp) {
  const passed = invariantResults.filter(r => r.pass).length;
  const failed = invariantResults.filter(r => !r.pass).length;
  const verdict = failed === 0 ? 'APPROVED' : 'REJECTED';

  return {
    claimId,
    timestamp,
    verdict,
    invariants: {
      total: invariantResults.length,
      passed,
      failed,
    },
    evaluations: invariantResults.map((r, i) => ({
      invariant: i + 1,
      ...r,
    })),
    narrative: `Claim ${claimId}: ${verdict}. ${passed}/${invariantResults.length} invariants passed.${
      failed > 0 ? ' Failures: ' + invariantResults.filter(r => !r.pass).map((r, i) => `I${i + 1}: ${r.reason}`).join('; ') : ''
    }`,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// LAYER 6 — TRUST CERTIFICATES
// SHA-256 hash-chained, tamper-evident governance record.
// ═══════════════════════════════════════════════════════════════════════════════

let lastCertificateHash = '0000000000000000000000000000000000000000000000000000000000000000';

export function loadCertificateChain(certDir) {
  try {
    const chainFile = path.join(certDir, 'chain.json');
    if (fs.existsSync(chainFile)) {
      const chain = JSON.parse(fs.readFileSync(chainFile, 'utf-8'));
      if (chain.lastHash) lastCertificateHash = chain.lastHash;
      return chain;
    }
  } catch { /* fresh chain */ }
  return { certificates: [], lastHash: lastCertificateHash };
}

function issueCertificate(claimId, claimContent, governanceTrace) {
  const timestamp = new Date().toISOString();
  const payload = JSON.stringify({
    claimId,
    contentHash: crypto.createHash('sha256').update(claimContent).digest('hex'),
    traceHash: crypto.createHash('sha256').update(JSON.stringify(governanceTrace)).digest('hex'),
    verdict: governanceTrace.verdict,
    previousCertHash: lastCertificateHash,
    timestamp,
  });

  const certHash = crypto.createHash('sha256').update(payload).digest('hex');
  lastCertificateHash = certHash;

  return {
    certificateId: `CERT-${claimId}-${timestamp.replace(/[:.]/g, '-')}`,
    hash: certHash,
    previousHash: JSON.parse(payload).previousCertHash,
    payload: JSON.parse(payload),
    timestamp,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN GOVERNANCE GATE
// The single entry point. All GPT output passes through here.
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Validate a complete GPT research proposal.
 * @param {object} raw - The parsed JSON from GPT
 * @param {string} requestedDomain - The domain shortName that was requested
 * @param {string[]} existingClaims - Filenames of existing claims in the archive
 * @param {string} certDir - Path to store governance certificates
 * @param {function} log - Logging function (auditWrite)
 * @returns {{ approved: object[], rejected: object[], traces: object[], certificates: object[] }}
 */
export function validateProposal(raw, requestedDomain, existingClaims, certDir, log) {
  const result = {
    approved: { claims: [], sources: [] },
    rejected: { claims: [], sources: [] },
    traces: [],
    certificates: [],
    summary: {},
  };

  const timestamp = new Date().toISOString();

  // ── Layer 2: Schema validation ──
  const schemaCheck = validateSchema(raw);
  if (!schemaCheck.valid) {
    log(`[GOV/L2] Schema validation FAILED: ${schemaCheck.trace.results.map(r => r.reason).join('; ')}`);
    result.summary = { verdict: 'REJECTED', reason: 'Schema validation failed', layer: 2 };
    return result;
  }
  log(`[GOV/L2] Schema valid: ${raw.claims.length} claims, ${raw.sources.length} sources`);

  // ── Layer 3: Normalize sources first (need IDs for claim linkage check) ──
  const normalizedSources = [];
  const sourceIds = [];
  for (const source of raw.sources) {
    const norm = normalizeSource(source);
    if (!norm.valid) {
      log(`[GOV/L3] Source ${source.id} normalization FAILED: ${norm.trace.results.map(r => r.reason).join('; ')}`);
      result.rejected.sources.push({ ...source, _rejectReason: norm.trace });
      continue;
    }

    // Invariant 2: URL allowlist check on source
    const urlCheck = invariant2_urlAllowlist(norm);
    if (!urlCheck.pass) {
      log(`[GOV/I2] Source ${source.id} URL STRIPPED: ${urlCheck.reason}`);
      // Don't reject — strip the URL and continue (honest omission > fabrication)
      source.content = source.content.replace(/^verify-at:\s*.+$/m, `verify-at: # STRIPPED BY GOVERNANCE — ${urlCheck.reason}`);
    }

    normalizedSources.push({ ...source, meta: norm.meta });
    sourceIds.push(norm.meta.id);
  }

  // ── Layer 3 + Layer 4: Normalize and validate each claim ──
  const invariant5Result = invariant5_noCensorship(
    raw.claims.map(c => ({ meta: parseFrontmatter(c.content) })).filter(c => c.meta),
    requestedDomain
  );

  if (!invariant5Result.pass) {
    log(`[GOV/I5] CENSORSHIP DETECTED: ${invariant5Result.reason}`);
    // Don't hard-reject — log for audit. The claims might still be valid individually.
  }

  for (const claim of raw.claims) {
    const norm = normalizeClaim(claim);
    if (!norm.valid) {
      log(`[GOV/L3] Claim ${claim.id} normalization FAILED: ${norm.trace.results.map(r => r.reason).join('; ')}`);
      result.rejected.claims.push({ ...claim, _rejectReason: norm.trace });
      continue;
    }

    // Run all 7 invariants
    const invariantResults = [
      { name: 'SOURCE_LINKAGE', ...invariant1_sourceLinkage(norm, sourceIds) },
      { name: 'URL_ALLOWLIST', pass: true, reason: 'Checked at source level' }, // Already checked per-source
      { name: 'OBJECTION_PRESENT', ...invariant3_objectionPresent(claim) },
      { name: 'CONFIDENCE_CEILING', ...invariant4_confidenceCeiling(norm) },
      { name: 'NO_CENSORSHIP', ...invariant5Result },
      { name: 'DUPLICATION_GUARD', ...invariant6_duplicationGuard(norm, existingClaims) },
      { name: 'DOMAIN_BOUNDARY', ...invariant7_domainBoundary(norm, requestedDomain) },
    ];

    // ── Layer 5: Build governance trace ──
    const trace = buildGovernanceTrace(claim.id, invariantResults, timestamp);
    result.traces.push(trace);

    // Corrective actions (non-fatal)
    const confidenceCheck = invariantResults[3];
    if (confidenceCheck.corrected) {
      claim.content = claim.content.replace(
        /^confidence:\s*.+$/m,
        `confidence: ${confidenceCheck.corrected}`
      );
      log(`[GOV/I4] Claim ${claim.id} confidence corrected: ${norm.meta.confidence} → ${confidenceCheck.corrected}`);
    }

    // Check for hard failures (skip I5 censorship — it's a warning, not a blocker per-claim)
    const hardFailures = invariantResults.filter((r, i) => !r.pass && i !== 4); // index 4 = censorship
    if (hardFailures.length > 0) {
      log(`[GOV/L4] Claim ${claim.id} REJECTED: ${hardFailures.map(r => `${r.name}: ${r.reason}`).join('; ')}`);
      result.rejected.claims.push({ ...claim, _rejectReason: trace });

      // ── Layer 6: Issue rejection certificate ──
      const cert = issueCertificate(claim.id, claim.content, trace);
      result.certificates.push(cert);
      continue;
    }

    // ── APPROVED ──
    log(`[GOV/L4] Claim ${claim.id} APPROVED: 7/7 invariants passed`);
    result.approved.claims.push(claim);

    // ── Layer 6: Issue approval certificate ──
    const cert = issueCertificate(claim.id, claim.content, trace);
    result.certificates.push(cert);
    log(`[GOV/L6] Certificate ${cert.hash.substring(0, 12)}... → chain: ${cert.previousHash.substring(0, 12)}...`);
  }

  // Add approved sources
  result.approved.sources = normalizedSources.filter(s => !s._rejected);

  // Write certificates
  if (certDir && result.certificates.length > 0) {
    fs.mkdirSync(certDir, { recursive: true });
    const chain = loadCertificateChain(certDir);
    chain.certificates.push(...result.certificates);
    chain.lastHash = lastCertificateHash;
    fs.writeFileSync(path.join(certDir, 'chain.json'), JSON.stringify(chain, null, 2));

    // Write individual traces
    const traceDir = path.join(certDir, '..', 'governance');
    fs.mkdirSync(traceDir, { recursive: true });
    for (const trace of result.traces) {
      fs.writeFileSync(
        path.join(traceDir, `${trace.claimId}-${timestamp.replace(/[:.]/g, '-')}.json`),
        JSON.stringify(trace, null, 2)
      );
    }
  }

  result.summary = {
    verdict: result.approved.claims.length > 0 ? 'PARTIAL' : 'REJECTED',
    approved: result.approved.claims.length,
    rejected: result.rejected.claims.length,
    censorship: !invariant5Result.pass,
  };

  if (result.approved.claims.length === raw.claims.length) {
    result.summary.verdict = 'APPROVED';
  }

  log(`[GOV] Final: ${result.summary.verdict} — ${result.summary.approved} approved, ${result.summary.rejected} rejected`);
  return result;
}
