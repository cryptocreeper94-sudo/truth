/**
 * ═══════════════════════════════════════════════════════════
 *  LUME-V OUTPUT GOVERNOR
 *  Layer 5 → Output: The final deterministic gate.
 *
 *  Takes a validated proposal + explainability trace and
 *  emits the safe, deterministic command with a Trust
 *  Certificate (LTC v1.0) proving the entire decision chain.
 *
 *  The Governor is the last line of defense. Nothing reaches
 *  the downstream system without Governor approval.
 *
 *  By DarkWave Studios LLC — DarkWaveStudios.io
 *  Copyright 2026. Protected by TrustShield.tech
 * ═══════════════════════════════════════════════════════════
 */

import crypto from 'crypto'
import { DECISIONS } from './types.js'
import { LumeTrustCertificate, CERT_TYPES, PROOF_TYPES, generateKeyPair } from './trust/certificate.js'
import { ValidationEngine } from './validation-engine.js'
import { ExplainabilityLayer } from './explainability.js'

export class Governor {
    constructor(config = {}) {
        this.validationEngine = config.validationEngine || new ValidationEngine(config)
        this.explainability = config.explainability || new ExplainabilityLayer(config)

        // Safe fallback commands per proposal type
        this.safeFallbacks = config.safeFallbacks ?? {
            control_command: { action: 'HOLD_POSITION', parameters: {} },
            llm_text: { text: '[Response blocked by safety governor]' },
            bounding_box: { boxes: [], override: 'CLEAR_PERCEPTION' },
            sensor_fusion: { action: 'SENSOR_RESET', parameters: {} },
            confidence_vector: { label: 'UNKNOWN', confidence: 0 },
        }

        // Ed25519 keypair for certificate signing
        this._keyPair = config.keyPair || generateKeyPair()

        // Decision log
        this.decisionLog = []
        this._maxLog = config.maxLog ?? 1000

        // Callbacks
        this.onDecision = config.onDecision || null
        this.onOverride = config.onOverride || null
        this.onReject = config.onReject || null
    }

    /**
     * Process a proposal through the full Lume-V pipeline:
     *   1. Validate (7 invariants)
     *   2. Explain (reasoning trace)
     *   3. Decide (approve / reject / override)
     *   4. Certify (Trust Certificate)
     *   5. Emit (safe command)
     *
     * @param {import('./types.js').LumeVProposal} proposal
     * @param {Object} [options]
     * @param {import('./types.js').LumeVProposal[]} [options.agentProposals]
     * @returns {import('./types.js').GovernorOutput}
     */
    process(proposal, options = {}) {
        const startTime = Date.now()

        // Step 1: Validate against 7 safety invariants
        const validation = this.validationEngine.validate(proposal, options)

        // Step 2: Generate explainability trace
        let explanation
        try {
            explanation = this.explainability.explain(proposal, validation)
        } catch (err) {
            // No silent fails — always produce a trace
            explanation = this.explainability.failureTrace(proposal.id, err)
            // If explainability fails, force rejection
            validation.decision = DECISIONS.REJECTED
            validation.safe = false
        }

        // Step 3: Determine the output command
        let command = null
        let originalCommand = proposal.payload

        switch (validation.decision) {
            case DECISIONS.APPROVED:
                command = proposal.payload
                break

            case DECISIONS.OVERRIDDEN:
                // Use safe fallback but include what was overridden
                command = this.safeFallbacks[proposal.type] || { action: 'SAFE_STOP' }
                break

            case DECISIONS.REJECTED:
                // Full rejection — only emit safe fallback
                command = this.safeFallbacks[proposal.type] || { action: 'EMERGENCY_STOP' }
                break

            case DECISIONS.ESCALATED:
                // Escalate to human — hold position
                command = this.safeFallbacks[proposal.type] || { action: 'AWAIT_HUMAN' }
                break
        }

        // Step 4: Generate Trust Certificate
        const certificate = this._generateCertificate(proposal, validation, explanation)

        // Step 5: Build output
        const output = {
            proposalId: proposal.id,
            decision: validation.decision,
            command,
            originalCommand,
            explanation,
            certificate: certificate.toJSON(),
            latency: Date.now() - startTime,
        }

        // Log
        this.decisionLog.push({
            proposalId: proposal.id,
            decision: validation.decision,
            safe: validation.safe,
            failedInvariants: validation.failedCount,
            latency: output.latency,
            timestamp: Date.now(),
        })
        if (this.decisionLog.length > this._maxLog) this.decisionLog.shift()

        // Callbacks
        if (this.onDecision) this.onDecision(output)
        if (validation.decision === DECISIONS.OVERRIDDEN && this.onOverride) this.onOverride(output)
        if (validation.decision === DECISIONS.REJECTED && this.onReject) this.onReject(output)

        return output
    }

    /**
     * Process multiple proposals (batch mode).
     * @param {import('./types.js').LumeVProposal[]} proposals
     * @returns {import('./types.js').GovernorOutput[]}
     */
    processBatch(proposals) {
        return proposals.map(p => this.process(p))
    }

    /**
     * Get governor statistics.
     */
    stats() {
        const total = this.decisionLog.length
        const approved = this.decisionLog.filter(d => d.decision === DECISIONS.APPROVED).length
        const rejected = this.decisionLog.filter(d => d.decision === DECISIONS.REJECTED).length
        const overridden = this.decisionLog.filter(d => d.decision === DECISIONS.OVERRIDDEN).length
        const escalated = this.decisionLog.filter(d => d.decision === DECISIONS.ESCALATED).length
        const avgLatency = total > 0
            ? Math.round(this.decisionLog.reduce((s, d) => s + d.latency, 0) / total)
            : 0

        return {
            totalDecisions: total,
            approved,
            rejected,
            overridden,
            escalated,
            approvalRate: total > 0 ? (approved / total * 100).toFixed(1) + '%' : 'N/A',
            avgLatencyMs: avgLatency,
            recentDecisions: this.decisionLog.slice(-10),
        }
    }

    // ── Private ──

    _generateCertificate(proposal, validation, explanation) {
        const cert = new LumeTrustCertificate({
            cert_type: CERT_TYPES.RUNTIME_CELL,
            issuer: {
                authority: 'lume-v-governor',
                version: '1.0',
            },
            subject: {
                subject_type: 'ai_proposal_validation',
                subject_id: proposal.id,
                subject_name: `${proposal.type} from ${proposal.source}`,
            },
            intent_binding: {
                intent_hash: this._hash(JSON.stringify(proposal.payload)),
                intent_lang: 'deterministic',
                ast_hash: this._hash(JSON.stringify(validation)),
                ir_hash: this._hash(explanation.humanReadable),
            },
            metadata: {
                lume_v_version: '1.0',
                proposal_type: proposal.type,
                proposal_source: proposal.source,
                decision: validation.decision,
                safe: validation.safe,
                failed_invariants: validation.failedCount,
                override_action: validation.overrideAction || null,
                latency_ms: Date.now() - validation.validatedAt,
                explanation_summary: explanation.summary,
            },
        })

        // Add security proofs for each validated invariant
        for (const inv of validation.invariants) {
            cert.addProof(
                inv.passed ? PROOF_TYPES.DETERMINISM : PROOF_TYPES.BOUNDS,
                {
                    invariant: inv.invariant,
                    name: inv.name,
                    passed: inv.passed,
                    severity: inv.severity,
                    explanation: inv.explanation,
                }
            )
        }

        // Sign the certificate
        cert.sign(this._keyPair.privateKey)

        return cert
    }

    _hash(data) {
        return crypto.createHash('sha256').update(data).digest('hex')
    }
}

export default Governor
