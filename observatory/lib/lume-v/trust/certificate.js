/**
 * ═══════════════════════════════════════════════════════════
 *  LUME TRUST CERTIFICATE (LTC) v1.0
 *  Implements §8 of the Full-Stack Expansion Block.
 *
 *  Format: CBOR-compatible JSON with Ed25519 signatures
 *  Hash: SHA-256
 *  Encoding: JSON (with CBOR upgrade path)
 *
 *  Certificate Types:
 *    COMPILE_ROOT   — Bound to a compiled program (permanent)
 *    COMPILE_PROOF  — Bound to a security proof (permanent)
 *    RUNTIME_CELL   — Bound to a runtime cell (cell lifetime)
 *    AGENT_SESSION  — Bound to an agent session (session lifetime)
 *    CHAIN_EXTENSION — Extends a certificate chain (varies)
 *    REVOCATION     — Revokes a certificate (permanent)
 *
 *  By DarkWave Studios LLC — DarkWaveStudios.io
 *  Copyright 2026. Protected by TrustShield.tech
 * ═══════════════════════════════════════════════════════════
 */

import crypto from 'crypto'

export const LTC_VERSION = '1.0'

export const CERT_TYPES = {
    COMPILE_ROOT: 'COMPILE_ROOT',
    COMPILE_PROOF: 'COMPILE_PROOF',
    RUNTIME_CELL: 'RUNTIME_CELL',
    AGENT_SESSION: 'AGENT_SESSION',
    CHAIN_EXTENSION: 'CHAIN_EXTENSION',
    REVOCATION: 'REVOCATION',
}

export const PROOF_TYPES = {
    DETERMINISM: 'determinism',
    ISOLATION: 'isolation',
    PERMISSION: 'permission',
    BOUNDS: 'bounds',
    REVOCATION: 'revocation',
}

export const PROOF_STATUS = {
    VERIFIED: 'verified',
    PENDING: 'pending',
    FAILED: 'failed',
}

/**
 * Generate a new Ed25519 keypair for certificate signing.
 * In production, the private key would be stored securely.
 * @returns {{ publicKey: Buffer, privateKey: Buffer }}
 */
export function generateKeyPair() {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519', {
        publicKeyEncoding: { type: 'spki', format: 'der' },
        privateKeyEncoding: { type: 'pkcs8', format: 'der' },
    })
    return { publicKey, privateKey }
}

/**
 * Create a canonical body from certificate fields (excluding signature).
 * This is the data that gets signed and hashed.
 */
function canonicalBody(cert) {
    return {
        ltc_version: cert.ltc_version,
        cert_type: cert.cert_type,
        issued_at: cert.issued_at,
        expires_at: cert.expires_at,
        issuer: cert.issuer,
        subject: cert.subject,
        intent_binding: cert.intent_binding,
        security_proofs: cert.security_proofs,
        permissions: cert.permissions,
        chain: {
            parent_cert: cert.chain?.parent_cert,
            depth: cert.chain?.depth,
        },
        metadata: cert.metadata,
    }
}

/**
 * Compute the cert_id as SHA-256 hash of the canonical body.
 */
function computeCertId(body) {
    return crypto
        .createHash('sha256')
        .update(JSON.stringify(body), 'utf8')
        .digest('hex')
}

/**
 * Sign data with an Ed25519 private key.
 * @param {string|Buffer} data - Data to sign
 * @param {Buffer} privateKey - Ed25519 private key (DER format)
 * @returns {string} Base64-encoded signature
 */
export function sign(data, privateKey) {
    const keyObject = crypto.createPrivateKey({
        key: privateKey,
        type: 'pkcs8',
        format: 'der',
    })
    const signature = crypto.sign(null, Buffer.from(data, 'utf8'), keyObject)
    return signature.toString('base64')
}

/**
 * Verify an Ed25519 signature.
 * @param {string|Buffer} data - Original data
 * @param {string} signature - Base64-encoded signature
 * @param {Buffer} publicKey - Ed25519 public key (DER format)
 * @returns {boolean}
 */
export function verify(data, signature, publicKey) {
    const keyObject = crypto.createPublicKey({
        key: publicKey,
        type: 'spki',
        format: 'der',
    })
    return crypto.verify(
        null,
        Buffer.from(data, 'utf8'),
        keyObject,
        Buffer.from(signature, 'base64')
    )
}

/**
 * Lume Trust Certificate class.
 * Represents a single certificate in the trust chain.
 */
export class LumeTrustCertificate {
    /**
     * @param {Object} fields
     * @param {string} fields.cert_type - One of CERT_TYPES
     * @param {Object} fields.issuer - { authority, version, instance_id }
     * @param {Object} fields.subject - { subject_type, subject_id, subject_name }
     * @param {Object} [fields.intent_binding] - { intent_hash, intent_lang, ast_hash, ir_hash }
     * @param {Array} [fields.security_proofs] - [{ proof_type, proof_hash, proof_status, verifier }]
     * @param {Object} [fields.permissions] - { allowed, denied, inherited }
     * @param {Object} [fields.chain] - { parent_cert, depth, root_hash }
     * @param {Object} [fields.metadata] - Additional metadata
     * @param {string} [fields.expires_at] - ISO timestamp or 'NEVER'
     */
    constructor(fields) {
        this.ltc_version = LTC_VERSION
        this.cert_type = fields.cert_type
        this.issued_at = new Date().toISOString()
        this.expires_at = fields.expires_at || 'NEVER'

        this.issuer = {
            authority: fields.issuer?.authority || 'lume-compiler',
            version: fields.issuer?.version || '1.1.0',
            instance_id: fields.issuer?.instance_id || crypto.randomUUID(),
        }

        this.subject = {
            subject_type: fields.subject?.subject_type || 'compiled_program',
            subject_id: fields.subject?.subject_id || crypto.randomUUID(),
            subject_name: fields.subject?.subject_name || 'unknown',
        }

        this.intent_binding = fields.intent_binding || {
            intent_hash: null,
            intent_lang: 'en',
            ast_hash: null,
            ir_hash: null,
        }

        this.security_proofs = fields.security_proofs || []
        this.permissions = fields.permissions || { allowed: [], denied: [], inherited: null }
        this.chain = fields.chain || { parent_cert: 'ROOT', depth: 0, root_hash: null }
        this.metadata = {
            compiler_version: fields.metadata?.compiler_version || '1.1.0',
            compilation_id: fields.metadata?.compilation_id || crypto.randomUUID(),
            target_platform: fields.metadata?.target_platform || 'wasm',
            darkwave_identity: 'DarkWave Studios LLC — DarkWaveStudios.io',
            ...fields.metadata,
        }

        // Compute cert_id from canonical body
        // Note: root_hash is excluded from canonical body to avoid circular dependency
        const body = canonicalBody(this)
        this.cert_id = computeCertId(body)

        // Set root_hash to cert_id if this is a root cert (after cert_id is computed)
        if (this.chain.parent_cert === 'ROOT') {
            this.chain.root_hash = this.cert_id
        }

        // Signature — set after signing
        this.signature = null
    }

    /**
     * Sign this certificate with an Ed25519 private key.
     * @param {Buffer} privateKey - Ed25519 private key
     * @returns {string} The signature
     */
    sign(privateKey) {
        const body = canonicalBody(this)
        const data = JSON.stringify(body)
        this.signature = sign(data, privateKey)
        return this.signature
    }

    /**
     * Verify this certificate's signature.
     * @param {Buffer} publicKey - Ed25519 public key
     * @returns {boolean}
     */
    verifySignature(publicKey) {
        if (!this.signature) return false
        const body = canonicalBody(this)
        const data = JSON.stringify(body)
        return verify(data, this.signature, publicKey)
    }

    /**
     * Verify the cert_id integrity (tamper detection).
     * @returns {boolean}
     */
    verifyIntegrity() {
        const body = canonicalBody(this)
        const expected = computeCertId(body)
        return expected === this.cert_id
    }

    /**
     * Check if the certificate is expired.
     * @returns {boolean}
     */
    isExpired() {
        if (this.expires_at === 'NEVER') return false
        return new Date(this.expires_at) < new Date()
    }

    /**
     * Add a security proof to this certificate.
     */
    addProof(proofType, proofData, verifier = 'lume-verifier-core-1.1.0') {
        const proofHash = crypto
            .createHash('sha256')
            .update(JSON.stringify(proofData))
            .digest('hex')

        this.security_proofs.push({
            proof_type: proofType,
            proof_hash: proofHash,
            proof_status: PROOF_STATUS.VERIFIED,
            verifier,
        })

        // Recompute cert_id since body changed
        const body = canonicalBody(this)
        this.cert_id = computeCertId(body)
        if (this.chain.parent_cert === 'ROOT') {
            this.chain.root_hash = this.cert_id
        }

        return proofHash
    }

    /**
     * Serialize to JSON.
     */
    toJSON() {
        return {
            ltc_version: this.ltc_version,
            cert_id: this.cert_id,
            cert_type: this.cert_type,
            issued_at: this.issued_at,
            expires_at: this.expires_at,
            issuer: this.issuer,
            subject: this.subject,
            intent_binding: this.intent_binding,
            security_proofs: this.security_proofs,
            permissions: this.permissions,
            facets: this.facets,
            chain: this.chain,
            metadata: this.metadata,
            signature: this.signature,
        }
    }

    /**
     * Deserialize from JSON.
     */
    static fromJSON(json) {
        // Build a cert that exactly matches the original by passing
        // all fields through so no new UUIDs are generated
        const cert = Object.create(LumeTrustCertificate.prototype)
        cert.ltc_version = json.ltc_version
        cert.cert_id = json.cert_id
        cert.cert_type = json.cert_type
        cert.issued_at = json.issued_at
        cert.expires_at = json.expires_at
        cert.issuer = json.issuer
        cert.subject = json.subject
        cert.intent_binding = json.intent_binding
        cert.security_proofs = json.security_proofs || []
        cert.permissions = json.permissions || { allowed: [], denied: [], inherited: null }
        cert.facets = json.facets || []
        cert.chain = json.chain || { parent_cert: 'ROOT', depth: 0, root_hash: null }
        cert.metadata = json.metadata || {}
        cert.signature = json.signature || null
        return cert
    }
}

export default LumeTrustCertificate
