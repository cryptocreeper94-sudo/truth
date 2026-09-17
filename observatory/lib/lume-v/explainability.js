/**
 * ═══════════════════════════════════════════════════════════
 *  LUME-V EXPLAINABILITY LAYER
 *  Layer 5: Transforms valid/invalid states into
 *  deterministic reasoning traces.
 *
 *  Outputs:
 *    - Machine-readable: Structured JSON for API consumers
 *    - Human-readable: "Because X, therefore Y" narrative
 *    - Never silent: Always produces a trace, even on failure
 *
 *  By DarkWave Studios LLC — DarkWaveStudios.io
 *  Copyright 2026. Protected by TrustShield.tech
 * ═══════════════════════════════════════════════════════════
 */

import { DECISIONS } from './types.js'

export class ExplainabilityLayer {
    constructor(config = {}) {
        this.verbosity = config.verbosity ?? 'full'  // 'minimal' | 'standard' | 'full'
        this.includeData = config.includeData ?? true
        this.traceLog = []
    }

    /**
     * Generate an explainability trace from a validation result.
     * @param {import('./types.js').LumeVProposal} proposal
     * @param {import('./types.js').ValidationResult} validationResult
     * @returns {import('./types.js').ExplainTrace}
     */
    explain(proposal, validationResult) {
        const chain = []
        const machineReadable = {
            proposalId: proposal.id,
            proposalType: proposal.type,
            source: proposal.source,
            confidence: proposal.confidence,
            decision: validationResult.decision,
            invariants: [],
        }

        // Build causal chain from invariant results
        for (const inv of validationResult.invariants) {
            // Machine-readable entry
            machineReadable.invariants.push({
                invariant: inv.invariant,
                name: inv.name,
                passed: inv.passed,
                severity: inv.severity,
                violation: inv.violation || null,
            })

            // Human-readable chain entry
            if (inv.passed) {
                chain.push(`✓ Invariant ${inv.invariant} (${inv.name}): ${inv.explanation}`)
            } else {
                chain.push(`✗ Invariant ${inv.invariant} (${inv.name}): ${inv.explanation}`)
            }
        }

        // Build decision explanation
        const decisionExplanation = this._buildDecisionNarrative(
            proposal, validationResult
        )
        chain.push('')
        chain.push(decisionExplanation)

        // Build summary
        const summary = this._buildSummary(proposal, validationResult)

        // Full human-readable narrative
        const humanReadable = this._buildFullNarrative(
            proposal, validationResult, chain
        )

        const trace = {
            proposalId: proposal.id,
            summary,
            chain,
            humanReadable,
            machineReadable,
            generatedAt: Date.now(),
        }

        this.traceLog.push(trace)
        return trace
    }

    /**
     * Generate a failure trace when explainability itself fails.
     * Per spec: "No Silent Fails"
     * @param {string} proposalId
     * @param {Error} error
     * @returns {import('./types.js').ExplainTrace}
     */
    failureTrace(proposalId, error) {
        const trace = {
            proposalId,
            summary: `EXPLAINABILITY FAILURE: ${error.message}`,
            chain: [
                `✗ Explainability layer encountered an internal error: ${error.message}`,
                '→ Falling back to SAFE STATE per Lume-V protocol',
                '→ A failure certificate has been emitted',
            ],
            humanReadable: `The Lume-V explainability layer was unable to generate a complete reasoning trace for proposal ${proposalId}. Error: ${error.message}. Per the Lume-V specification, the system falls back to a safe state. A failure certificate is emitted to ensure no decision is made silently.`,
            machineReadable: {
                proposalId,
                error: error.message,
                fallback: 'SAFE_STATE',
                failureCertificateRequired: true,
            },
            generatedAt: Date.now(),
        }

        this.traceLog.push(trace)
        return trace
    }

    /**
     * Get the reasoning log.
     */
    getTraceLog() {
        return [...this.traceLog]
    }

    // ── Private ──

    _buildSummary(proposal, result) {
        const icon = result.safe ? '✅' : '🛑'
        const action = {
            [DECISIONS.APPROVED]: 'APPROVED — all safety invariants passed',
            [DECISIONS.REJECTED]: `REJECTED — ${result.failedCount} critical violation(s)`,
            [DECISIONS.OVERRIDDEN]: `OVERRIDDEN — ${result.failedCount} warning(s) triggered safe fallback`,
            [DECISIONS.ESCALATED]: 'ESCALATED — requires human review',
        }
        return `${icon} Proposal ${proposal.id.slice(0, 8)} from ${proposal.source}: ${action[result.decision] || result.decision}`
    }

    _buildDecisionNarrative(proposal, result) {
        if (result.decision === DECISIONS.APPROVED) {
            return `CONCLUSION: Because all 7 safety invariants passed, the AI proposal from ${proposal.source} (confidence: ${(proposal.confidence * 100).toFixed(1)}%) is APPROVED for execution.`
        }

        if (result.decision === DECISIONS.REJECTED) {
            const critical = result.invariants.filter(i => !i.passed && i.severity === 'critical')
            const reasons = critical.map(i => i.name).join(', ')
            return `CONCLUSION: Because ${critical.length} critical invariant(s) failed (${reasons}), the AI proposal from ${proposal.source} is REJECTED. The system falls back to a safe state. Override action: ${result.overrideAction}`
        }

        if (result.decision === DECISIONS.OVERRIDDEN) {
            const warnings = result.invariants.filter(i => !i.passed)
            const reasons = warnings.map(i => i.name).join(', ')
            return `CONCLUSION: Because ${warnings.length} invariant(s) raised warnings (${reasons}), the AI proposal from ${proposal.source} has been OVERRIDDEN with a safe fallback. ${result.overrideAction}`
        }

        return `CONCLUSION: Decision ${result.decision} for proposal from ${proposal.source}.`
    }

    _buildFullNarrative(proposal, result, chain) {
        const lines = [
            `═══ LUME-V EXPLAINABILITY TRACE ═══`,
            `Proposal ID: ${proposal.id}`,
            `Source: ${proposal.source}`,
            `Type: ${proposal.type}`,
            `Confidence: ${(proposal.confidence * 100).toFixed(1)}%`,
            `Timestamp: ${new Date(proposal.timestamp).toISOString()}`,
            ``,
            `── INVARIANT EVALUATION ──`,
            ...chain,
            ``,
            `── DECISION ──`,
            `Decision: ${result.decision.toUpperCase()}`,
            `Safe: ${result.safe}`,
            `Failed Invariants: ${result.failedCount} / 7`,
            result.overrideAction ? `Override: ${result.overrideAction}` : '',
            `Validated At: ${new Date(result.validatedAt).toISOString()}`,
            ``,
            `═══ END TRACE ═══`,
        ]

        return lines.filter(l => l !== undefined).join('\n')
    }
}

export default ExplainabilityLayer
