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

const TRUSTLAYER_RPC = process.env.TRUSTLAYER_RPC_URL || 'https://trustlayer.tlid.io';
const APP_ID = 'observatory-sentinel';
const TIMEOUT_MS = 10000;

/**
 * Submit a data hash to TrustLayer chain.
 * @param {string} dataHash - SHA-256 hex string
 * @param {string} category - e.g. 'daily-brief', 'manifest', 'lume-v-cert'
 * @param {object} [metadata] - Additional context for the stamp
 * @returns {{ success: boolean, txHash?: string, blockHeight?: number, error?: string }}
 */
export async function anchorToTrustLayer(dataHash, category, metadata = {}) {
  const timestamp = new Date().toISOString();

  // Encode hash submission as chain transaction data
  const payload = {
    type: 'hash_submission',
    hash: dataHash,
    category: category || 'general',
    metadata: { ...metadata, appId: APP_ID, stampedAt: timestamp },
    timestamp,
  };

  const jsonStr = JSON.stringify(payload);
  const bytes = new TextEncoder().encode(jsonStr);
  const hexData = '0x' + Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');

  const TREASURY = '0x212686509aec07fab9a5c3e324494e0c8094e637';

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    // Trust Layer API: POST /api/devnet/transaction
    const res = await fetch(`${TRUSTLAYER_RPC}/api/devnet/transaction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        from: TREASURY,
        to: TREASURY,
        amount: 0,
        data: hexData,
      }),
    });

    clearTimeout(timer);

    if (!res.ok) {
      const errBody = await res.text().catch(() => 'unknown');
      console.warn(`[TrustAnchor] Chain returned HTTP ${res.status}: ${errBody.substring(0, 200)}`);
      return { success: false, error: `HTTP ${res.status}` };
    }

    const result = await res.json();

    // Trust Layer response format: { success, transaction: { txHash, blockHeight, ... } }
    if (result.success && result.transaction) {
      console.log(`[TrustAnchor] ✓ ${category} anchored — tx: ${result.transaction.txHash}`);
      return {
        success: true,
        txHash: result.transaction.txHash,
        blockHeight: result.transaction.blockHeight || null,
        timestamp,
      };
    }

    // Fallback: try older response format { tx_hash, status }
    if (result.tx_hash) {
      console.log(`[TrustAnchor] ✓ ${category} anchored — tx: ${result.tx_hash}`);
      return {
        success: true,
        txHash: result.tx_hash,
        blockHeight: result.block_height || null,
        timestamp,
      };
    }

    console.warn(`[TrustAnchor] Unexpected response:`, JSON.stringify(result).substring(0, 200));
    return { success: false, error: 'Unexpected response format' };
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
