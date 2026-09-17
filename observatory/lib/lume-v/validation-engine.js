/**
 * ═══════════════════════════════════════════════════════════
 *  LUME-V VALIDATION ENGINE
 *  Layer 3–4: The 7 Safety Invariants
 *
 *  These are non-negotiable rules. If ANY invariant is
 *  violated, Lume-V MUST override the AI's proposal.
 *
 *  Invariants:
 *    1. Confidence Threshold Integrity
 *    2. Contradiction Resolution
 *    3. Safety-First Override
 *    4. Ambiguity Escalation
 *    5. Temporal Consistency
 *    6. Domain Boundary Enforcement (OOD)
 *    7. Multi-Agent Agreement
 *
 *  By DarkWave Studios LLC — DarkWaveStudios.io
 *  Copyright 2026. Protected by TrustShield.tech
 * ═══════════════════════════════════════════════════════════
 */

import { DECISIONS, SEVERITY } from './types.js'

export class ValidationEngine {
    constructor(config = {}) {
        // Configurable thresholds
        this.confidenceThreshold = config.confidenceThreshold ?? 0.3
        this.ambiguityThreshold = config.ambiguityThreshold ?? 0.15
        this.temporalJitterThreshold = config.temporalJitterThreshold ?? 0.4
        this.temporalWindowSize = config.temporalWindowSize ?? 5
        this.domainBounds = config.domainBounds ?? {}
        this.requiredAgentAgreement = config.requiredAgentAgreement ?? 1

        // Historical state for temporal consistency
        this._proposalHistory = []
        this._maxHistory = config.maxHistory ?? 100

        // Multi-agent tracking
        this._agentProposals = new Map()
    }

    /**
     * Validate a proposal against all 7 safety invariants.
     * @param {import('./types.js').LumeVProposal} proposal
     * @param {Object} [options]
     * @param {import('./types.js').LumeVProposal[]} [options.agentProposals] - Proposals from other agents
     * @returns {import('./types.js').ValidationResult}
     */
    validate(proposal, options = {}) {
        const invariants = [
            this._invariant1_confidenceThreshold(proposal),
            this._invariant2_contradictionResolution(proposal),
            this._invariant3_safetyFirstOverride(proposal),
            this._invariant4_ambiguityEscalation(proposal),
            this._invariant5_temporalConsistency(proposal),
            this._invariant6_domainBoundary(proposal),
            this._invariant7_multiAgentAgreement(proposal, options.agentProposals),
        ]

        const failedCount = invariants.filter(i => !i.passed).length
        const criticalFailures = invariants.filter(i => !i.passed && i.severity === SEVERITY.CRITICAL)

        // Decision logic:
        // - Any critical failure → REJECTED
        // - Any warning failure → OVERRIDDEN (modified to be safe)
        // - All passed → APPROVED
        let decision = DECISIONS.APPROVED
        let overrideAction = null

        if (criticalFailures.length > 0) {
            decision = DECISIONS.REJECTED
            overrideAction = `HALT: ${criticalFailures.map(f => f.name).join(', ')}`
        } else if (failedCount > 0) {
            decision = DECISIONS.OVERRIDDEN
            const failedNames = invariants.filter(i => !i.passed).map(i => i.name)
            overrideAction = `SAFE_FALLBACK: ${failedNames.join(', ')}`
        }

        // Store in history for temporal consistency
        this._proposalHistory.push(proposal)
        if (this._proposalHistory.length > this._maxHistory) {
            this._proposalHistory.shift()
        }

        return {
            proposalId: proposal.id,
            safe: failedCount === 0,
            decision,
            invariants,
            failedCount,
            overrideAction,
            validatedAt: Date.now(),
        }
    }

    // ═══════════════════════════════════════════
    //  INVARIANT 1: CONFIDENCE THRESHOLD
    //  If confidence < threshold, assume unsafe.
    // ═══════════════════════════════════════════

    _invariant1_confidenceThreshold(proposal) {
        const result = {
            invariant: 1,
            name: 'CONFIDENCE_THRESHOLD',
            passed: true,
            explanation: '',
            severity: SEVERITY.CRITICAL,
        }

        if (proposal.confidence < this.confidenceThreshold) {
            result.passed = false
            result.violation = `Confidence ${(proposal.confidence * 100).toFixed(1)}% is below threshold ${(this.confidenceThreshold * 100).toFixed(1)}%`
            result.explanation = `Because the AI's confidence (${(proposal.confidence * 100).toFixed(1)}%) is below the safety threshold (${(this.confidenceThreshold * 100).toFixed(1)}%), this proposal cannot be trusted and must be rejected.`
            result.data = { confidence: proposal.confidence, threshold: this.confidenceThreshold }
        } else {
            result.explanation = `Confidence ${(proposal.confidence * 100).toFixed(1)}% meets threshold ${(this.confidenceThreshold * 100).toFixed(1)}%.`
        }

        return result
    }

    // ═══════════════════════════════════════════
    //  INVARIANT 2: CONTRADICTION RESOLUTION
    //  Multi-subsystem conflicts require arbitration.
    // ═══════════════════════════════════════════

    _invariant2_contradictionResolution(proposal) {
        const result = {
            invariant: 2,
            name: 'CONTRADICTION_RESOLUTION',
            passed: true,
            explanation: '',
            severity: SEVERITY.CRITICAL,
        }

        const contradictions = proposal.payload?.contradictions || []
        const flaggedContradictions = (proposal.flags || []).filter(f =>
            f.startsWith('contradictions:') || f.startsWith('sensor_contradictions:')
        )

        if (contradictions.length > 0 || flaggedContradictions.length > 0) {
            result.passed = false
            const count = contradictions.length || parseInt(flaggedContradictions[0]?.split(':')[1] || '0')
            result.violation = `${count} contradiction(s) detected in proposal`
            result.explanation = `Because ${count} subsystem(s) produced contradictory outputs for the same input, deterministic arbitration is required. The proposal is unsafe until contradictions are resolved.`
            result.data = { contradictions, flaggedContradictions }
        } else {
            result.explanation = 'No contradictions detected between subsystems.'
        }

        return result
    }

    // ═══════════════════════════════════════════
    //  INVARIANT 3: SAFETY-FIRST OVERRIDE
    //  If ANY system flags danger, danger is real.
    // ═══════════════════════════════════════════

    _invariant3_safetyFirstOverride(proposal) {
        const result = {
            invariant: 3,
            name: 'SAFETY_FIRST_OVERRIDE',
            passed: true,
            explanation: '',
            severity: SEVERITY.CRITICAL,
        }

        const dangerFlags = (proposal.flags || []).filter(f =>
            f.startsWith('danger_pattern:') ||
            f.startsWith('forbidden_action:') ||
            f.startsWith('out_of_bounds:')
        )

        if (dangerFlags.length > 0) {
            result.passed = false
            result.violation = `Safety flag(s) raised: ${dangerFlags.join(', ')}`
            result.explanation = `Because one or more subsystems flagged a safety concern (${dangerFlags.join(', ')}), the Safety-First principle requires assuming the danger is real. The proposal must be blocked.`
            result.data = { dangerFlags }
        } else {
            result.explanation = 'No safety flags raised by any subsystem.'
        }

        return result
    }

    // ═══════════════════════════════════════════
    //  INVARIANT 4: AMBIGUITY ESCALATION
    //  Ambiguous outputs trigger safe fallbacks.
    // ═══════════════════════════════════════════

    _invariant4_ambiguityEscalation(proposal) {
        const result = {
            invariant: 4,
            name: 'AMBIGUITY_ESCALATION',
            passed: true,
            explanation: '',
            severity: SEVERITY.WARNING,
        }

        const ambiguityFlags = (proposal.flags || []).filter(f =>
            f === 'near_tie' ||
            f === 'high_entropy' ||
            f === 'empty_response'
        )

        // Check entropy if available
        const entropy = proposal.payload?.entropy
        const nearTie = ambiguityFlags.includes('near_tie')

        if (ambiguityFlags.length > 0 || (entropy && entropy > 0.85)) {
            result.passed = false
            result.violation = `Ambiguity detected: ${ambiguityFlags.join(', ') || `entropy=${entropy?.toFixed(3)}`}`
            result.explanation = `Because the AI output is ambiguous (${ambiguityFlags.join(', ')}), Lume-V escalates to a safe fallback state. Ambiguous proposals cannot produce deterministic guarantees.`
            result.severity = nearTie ? SEVERITY.WARNING : SEVERITY.INFO
            result.data = { ambiguityFlags, entropy }
        } else {
            result.explanation = 'No ambiguity detected. Output is decisive.'
        }

        return result
    }

    // ═══════════════════════════════════════════
    //  INVARIANT 5: TEMPORAL CONSISTENCY
    //  Prevents frame-to-frame oscillation/jitter.
    // ═══════════════════════════════════════════

    _invariant5_temporalConsistency(proposal) {
        const result = {
            invariant: 5,
            name: 'TEMPORAL_CONSISTENCY',
            passed: true,
            explanation: '',
            severity: SEVERITY.WARNING,
        }

        // Need history to check temporal consistency
        const recentHistory = this._proposalHistory
            .filter(p => p.type === proposal.type)
            .slice(-this.temporalWindowSize)

        if (recentHistory.length < 2) {
            result.explanation = 'Insufficient history for temporal consistency check.'
            return result
        }

        // Check for oscillation in confidence
        const confidences = [...recentHistory.map(p => p.confidence), proposal.confidence]
        let oscillations = 0
        for (let i = 2; i < confidences.length; i++) {
            const d1 = confidences[i - 1] - confidences[i - 2]
            const d2 = confidences[i] - confidences[i - 1]
            if (d1 * d2 < 0 && Math.abs(d2) > this.temporalJitterThreshold) {
                oscillations++
            }
        }

        if (oscillations >= 2) {
            result.passed = false
            result.violation = `${oscillations} confidence oscillations detected in last ${confidences.length} frames`
            result.explanation = `Because the AI's confidence is oscillating rapidly (${oscillations} reversals in ${confidences.length} frames), the output is temporally inconsistent and cannot be trusted for stable control.`
            result.data = { oscillations, confidences, windowSize: this.temporalWindowSize }
        } else {
            result.explanation = `Temporal consistency verified across ${confidences.length} frames.`
        }

        return result
    }

    // ═══════════════════════════════════════════
    //  INVARIANT 6: DOMAIN BOUNDARY ENFORCEMENT
    //  Out-of-Distribution (OOD) halting.
    // ═══════════════════════════════════════════

    _invariant6_domainBoundary(proposal) {
        const result = {
            invariant: 6,
            name: 'DOMAIN_BOUNDARY',
            passed: true,
            explanation: '',
            severity: SEVERITY.CRITICAL,
        }

        const violations = []

        // Check domain constraints from proposal
        const constraints = proposal.domainConstraints || {}
        for (const [key, bounds] of Object.entries(constraints)) {
            const value = this._extractValue(proposal, key)
            if (value !== undefined) {
                if (bounds.min !== undefined && value < bounds.min) {
                    violations.push({ key, value, bound: 'min', limit: bounds.min })
                }
                if (bounds.max !== undefined && value > bounds.max) {
                    violations.push({ key, value, bound: 'max', limit: bounds.max })
                }
                if (bounds.allowed && !bounds.allowed.includes(value)) {
                    violations.push({ key, value, bound: 'allowed', limit: bounds.allowed })
                }
            }
        }

        // Check configured domain bounds
        for (const [key, bounds] of Object.entries(this.domainBounds)) {
            const value = this._extractValue(proposal, key)
            if (value !== undefined) {
                if (bounds.min !== undefined && value < bounds.min) {
                    violations.push({ key, value, bound: 'min', limit: bounds.min })
                }
                if (bounds.max !== undefined && value > bounds.max) {
                    violations.push({ key, value, bound: 'max', limit: bounds.max })
                }
            }
        }

        // Check bound violations from adapter
        const boundViolations = proposal.payload?.boundViolations || []
        violations.push(...boundViolations.map(bv => ({
            key: bv.parameter, value: bv.value, bound: 'range', limit: `${bv.min}–${bv.max}`,
        })))

        if (violations.length > 0) {
            result.passed = false
            result.violation = `${violations.length} domain boundary violation(s)`
            result.explanation = `Because ${violations.length} parameter(s) are outside the allowed domain boundaries (${violations.map(v => `${v.key}=${v.value} exceeds ${v.bound}=${v.limit}`).join('; ')}), this proposal represents an Out-of-Distribution state and must be halted.`
            result.data = { violations }
        } else {
            result.explanation = 'All values within domain boundaries.'
        }

        return result
    }

    // ═══════════════════════════════════════════
    //  INVARIANT 7: MULTI-AGENT AGREEMENT
    //  Consensus by safety, NOT majority.
    // ═══════════════════════════════════════════

    _invariant7_multiAgentAgreement(proposal, agentProposals = null) {
        const result = {
            invariant: 7,
            name: 'MULTI_AGENT_AGREEMENT',
            passed: true,
            explanation: '',
            severity: SEVERITY.CRITICAL,
        }

        if (!agentProposals || agentProposals.length === 0) {
            result.explanation = 'Single-agent mode — multi-agent agreement not applicable.'
            return result
        }

        // Consensus-by-safety: if ANY agent flags a violation, the state is unsafe
        const allProposals = [proposal, ...agentProposals]
        const flaggedAgents = allProposals.filter(p =>
            (p.flags || []).some(f =>
                f.startsWith('danger_pattern:') ||
                f.startsWith('forbidden_action:') ||
                f.startsWith('out_of_bounds:') ||
                f.startsWith('contradictions:')
            )
        )

        // Check confidence divergence across agents
        const confidences = allProposals.map(p => p.confidence)
        const maxConfidence = Math.max(...confidences)
        const minConfidence = Math.min(...confidences)
        const divergence = maxConfidence - minConfidence

        if (flaggedAgents.length > 0) {
            result.passed = false
            result.violation = `${flaggedAgents.length}/${allProposals.length} agent(s) flagged safety concerns`
            result.explanation = `Because ${flaggedAgents.length} out of ${allProposals.length} agents raised safety flags, Consensus-by-Safety requires treating the global state as unsafe. Unlike majority voting, a single safety flag is sufficient to override.`
            result.data = { flaggedAgents: flaggedAgents.length, totalAgents: allProposals.length }
        } else if (divergence > 0.5) {
            result.passed = false
            result.severity = SEVERITY.WARNING
            result.violation = `Agent confidence divergence ${(divergence * 100).toFixed(1)}% exceeds threshold`
            result.explanation = `Because agent confidence scores diverge significantly (${(minConfidence * 100).toFixed(1)}% to ${(maxConfidence * 100).toFixed(1)}%), the agents do not agree on the state, requiring arbitration.`
            result.data = { confidences, divergence }
        } else {
            result.explanation = `${allProposals.length} agents in agreement (divergence: ${(divergence * 100).toFixed(1)}%).`
        }

        return result
    }

    // ── Private Helpers ──

    _extractValue(proposal, key) {
        // Try payload first, then context, then top-level
        if (proposal.payload?.[key] !== undefined) return proposal.payload[key]
        if (proposal.context?.[key] !== undefined) return proposal.context[key]
        if (proposal[key] !== undefined) return proposal[key]
        return undefined
    }
}

export default ValidationEngine
