/**
 * TRUTH Observatory — TrustLayer Anchor
 * DarkWave Studios LLC — Copyright 2026
 *
 * Submits SHA-256 hashes to the DarkWave TrustLayer PoA blockchain
 * for immutable provenance anchoring. Every brief, manifest hash,
 * and Lume-V trust certificate gets anchored on-chain.
 *
 * DDA 42-Doctrine mapping:
 *   [14] Determinacy Engine → Deterministic hash submission
 *   [32] Integrity Layer    → On-chain provenance anchoring
 *   [35] Safety Envelope    → Graceful degradation if chain unreachable
 *
 * Uses the DarkWave Chain SDK submitHash() API:
 *   POST /transaction → chain RPC at TRUSTLAYER_RPC_URL
 */

import { createHash } from 'crypto';

const TRUSTLAYER_RPC = process.env.TRUSTLAYER_RPC_URL || 'https://dwtl.io';
const TRUSTLAYER_API_KEY = process.env.TRUSTLAYER_API_KEY || '';
const APP_ID = 'observatory-sentinel';
const TIMEOUT_MS = 10000;

/**
 * Submit a data hash to TrustLayer chain.
 * Uses POST /api/hash/submit — the authenticated chain submission endpoint.
 *
 * @param {string} dataHash - SHA-256 hex string
 * @param {string} category - e.g. 'daily-brief', 'manifest', 'lume-v-cert'
 * @param {object} [metadata] - Additional context for the stamp
 * @returns {{ success: boolean, txHash?: string, blockHeight?: number, error?: string }}
 */
export async function anchorToTrustLayer(dataHash, category, metadata = {}) {
  if (!TRUSTLAYER_API_KEY) {
    console.warn('[TrustAnchor] No TRUSTLAYER_API_KEY set — skipping anchor');
    return { success: false, error: 'No API key configured' };
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const res = await fetch(`${TRUSTLAYER_RPC}/api/hash/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': TRUSTLAYER_API_KEY,
      },
      signal: controller.signal,
      body: JSON.stringify({
        dataHash,
        category: category || 'general',
        appId: APP_ID,
        metadata: { ...metadata, stampedAt: new Date().toISOString() },
      }),
    });

    clearTimeout(timer);

    if (!res.ok) {
      const errBody = await res.text().catch(() => 'unknown');
      console.warn(`[TrustAnchor] Chain returned HTTP ${res.status}: ${errBody.substring(0, 200)}`);
      return { success: false, error: `HTTP ${res.status}` };
    }

    const result = await res.json();

    if (result.success) {
      console.log(`[TrustAnchor] ✓ ${category} anchored — tx: ${result.txHash}, block: ${result.blockHeight}`);
      return {
        success: true,
        txHash: result.txHash,
        blockHeight: result.blockHeight || null,
        timestamp: result.timestamp,
      };
    }

    console.warn(`[TrustAnchor] Submission failed:`, JSON.stringify(result).substring(0, 200));
    return { success: false, error: result.error || 'Unknown error' };
  } catch (err) {
    console.warn(`[TrustAnchor] Chain unreachable: ${err.message}`);
    return { success: false, error: err.message };
  }
}

/**
 * Anchor a daily brief's SHA-256 hash to TrustLayer.
 */
export async function anchorBrief(briefHash, briefMeta = {}) {
  return anchorToTrustLayer(briefHash, 'daily-brief', {
    type: 'observatory-daily-brief',
    ...briefMeta,
  });
}

/**
 * Anchor a Lume-V trust certificate hash to TrustLayer.
 */
export async function anchorLumeVCert(certHash, certMeta = {}) {
  return anchorToTrustLayer(certHash, 'lume-v-certificate', {
    type: 'lume-v-governance-decision',
    ...certMeta,
  });
}

/**
 * Anchor a collector manifest hash to TrustLayer.
 */
export async function anchorManifest(manifestHash, feedId) {
  return anchorToTrustLayer(manifestHash, 'collector-manifest', {
    type: 'observatory-manifest',
    feedId,
  });
}

/**
 * Generate SHA-256 hash of any data.
 */
export function sha256(data) {
  return createHash('sha256').update(
    typeof data === 'string' ? data : JSON.stringify(data)
  ).digest('hex');
}
