/**
 * ═══════════════════════════════════════════════════════════
 *  LUME-V INTEGRATION MODES
 *  Layer 8: 9 patterns for attaching Lume-V to
 *  existing AI systems without rebuilding their stack.
 *
 *  Modes:
 *    A. Inline     — Blocking validation layer
 *    B. Shadow     — Parallel audit without blocking
 *    C. Arbitration — Ensemble model consensus
 *    D. Sensor Fusion — Post-fusion reality checking
 *    E. Gatekeeper — High-friction manual approval
 *    F. Orchestration — Microservice validation
 *    G. Fleet      — Distributed hive-mind safety
 *    H. HITL       — Human-in-the-loop pre-filtering
 *    I. Forensics  — Post-crash reconstruction
 *
 *  By DarkWave Studios LLC — DarkWaveStudios.io
 *  Copyright 2026. Protected by TrustShield.tech
 * ═══════════════════════════════════════════════════════════
 */

import { Governor } from './governor.js'
import { DECISIONS, INTEGRATION_MODES } from './types.js'

// ═══════════════════════════════════════════
//  A. INLINE MODE
//  Blocking layer between AI and Control.
//  No output passes without validation.
// ═══════════════════════════════════════════

export class InlineIntegration {
    constructor(governor) {
        this.governor = governor || new Governor()
        this.mode = INTEGRATION_MODES.INLINE
    }

    /**
     * Validate and gate a proposal. Blocks execution until
     * validation completes. Returns the safe command.
     * @param {import('./types.js').LumeVProposal} proposal
     * @returns {import('./types.js').GovernorOutput}
     */
    gate(proposal) {
        return this.governor.process(proposal)
    }
}

// ═══════════════════════════════════════════
//  B. SHADOW MODE
//  Parallel audit without blocking.
//  AI executes normally; Lume-V logs violations.
// ═══════════════════════════════════════════

export class ShadowIntegration {
    constructor(governor) {
        this.governor = governor || new Governor()
        this.mode = INTEGRATION_MODES.SHADOW
        this.shadowLog = []
    }

    /**
     * Audit a proposal without blocking.
     * Returns the ORIGINAL command regardless of validation.
     * Logs violations for later review.
     */
    audit(proposal) {
        const result = this.governor.process(proposal)
        const entry = {
            proposalId: proposal.id,
            wouldHaveBlocked: result.decision !== DECISIONS.APPROVED,
            decision: result.decision,
            explanation: result.explanation.summary,
            timestamp: Date.now(),
        }
        this.shadowLog.push(entry)

        // Return the original command — shadow mode doesn't block
        return {
            ...result,
            command: proposal.payload, // override governor's safe fallback
            shadowBlocked: result.decision !== DECISIONS.APPROVED,
        }
    }

    getShadowLog() {
        return [...this.shadowLog]
    }

    getBlockRate() {
        if (this.shadowLog.length === 0) return '0%'
        const blocked = this.shadowLog.filter(e => e.wouldHaveBlocked).length
        return `${(blocked / this.shadowLog.length * 100).toFixed(1)}%`
    }
}

// ═══════════════════════════════════════════
//  C. ARBITRATION MODE
//  Forces consensus between ensemble models.
// ═══════════════════════════════════════════

export class ArbitrationIntegration {
    constructor(governor) {
        this.governor = governor || new Governor()
        this.mode = INTEGRATION_MODES.ARBITRATION
    }

    /**
     * Arbitrate between multiple model proposals.
     * Uses consensus-by-safety (not majority).
     * @param {import('./types.js').LumeVProposal[]} proposals
     * @returns {import('./types.js').GovernorOutput}
     */
    arbitrate(proposals) {
        if (proposals.length === 0) {
            throw new Error('Arbitration requires at least one proposal')
        }

        // Pick the highest-confidence proposal as primary
        const sorted = [...proposals].sort((a, b) => b.confidence - a.confidence)
        const primary = sorted[0]
        const others = sorted.slice(1)

        // Process primary with all others as agent proposals
        return this.governor.process(primary, { agentProposals: others })
    }
}

// ═══════════════════════════════════════════
//  D. SENSOR FUSION MODE
//  Post-fusion reality checking.
// ═══════════════════════════════════════════

export class SensorFusionIntegration {
    constructor(governor) {
        this.governor = governor || new Governor()
        this.mode = INTEGRATION_MODES.SENSOR_FUSION
    }

    /**
     * Validate a fused sensor proposal.
     * Checks for stale readings, contradictions, and bounds.
     */
    validate(fusedProposal) {
        return this.governor.process(fusedProposal)
    }
}

// ═══════════════════════════════════════════
//  E. GATEKEEPER MODE
//  High-friction manual approval trigger.
// ═══════════════════════════════════════════

export class GatekeeperIntegration {
    constructor(governor) {
        this.governor = governor || new Governor()
        this.mode = INTEGRATION_MODES.GATEKEEPER
        this.pendingApprovals = new Map()
    }

    /**
     * Validate and hold for manual approval if necessary.
     * Returns immediately with a pending ticket if approval required.
     */
    submit(proposal) {
        const result = this.governor.process(proposal)

        if (result.decision === DECISIONS.APPROVED) {
            return { ...result, requiresApproval: false }
        }

        // Create an approval ticket
        const ticketId = `ticket_${Date.now()}_${proposal.id.slice(0, 8)}`
        this.pendingApprovals.set(ticketId, {
            proposal,
            governorResult: result,
            submittedAt: Date.now(),
            status: 'pending',
        })

        return {
            ...result,
            requiresApproval: true,
            ticketId,
            command: null, // don't execute until approved
        }
    }

    /**
     * Manually approve a held proposal.
     */
    approve(ticketId) {
        const ticket = this.pendingApprovals.get(ticketId)
        if (!ticket) throw new Error(`Ticket ${ticketId} not found`)
        ticket.status = 'approved'
        ticket.approvedAt = Date.now()
        return { ...ticket.governorResult, command: ticket.proposal.payload }
    }

    /**
     * Manually reject a held proposal.
     */
    reject(ticketId, reason) {
        const ticket = this.pendingApprovals.get(ticketId)
        if (!ticket) throw new Error(`Ticket ${ticketId} not found`)
        ticket.status = 'rejected'
        ticket.rejectedAt = Date.now()
        ticket.rejectionReason = reason
        return ticket.governorResult
    }

    getPendingCount() {
        return [...this.pendingApprovals.values()].filter(t => t.status === 'pending').length
    }
}

// ═══════════════════════════════════════════
//  F. ORCHESTRATION MODE
//  Microservice validation checks.
// ═══════════════════════════════════════════

export class OrchestrationIntegration {
    constructor(governor) {
        this.governor = governor || new Governor()
        this.mode = INTEGRATION_MODES.ORCHESTRATION
        this.services = new Map() // name → validate function
    }

    /**
     * Register a pre-validation hook for a service.
     */
    registerService(name, validateFn) {
        this.services.set(name, validateFn)
    }

    /**
     * Run all service validations before the governor.
     */
    async orchestrate(proposal) {
        // Run all registered service validations
        for (const [name, validateFn] of this.services) {
            try {
                const serviceResult = await validateFn(proposal)
                if (serviceResult && serviceResult.block) {
                    proposal.flags = proposal.flags || []
                    proposal.flags.push(`service_block:${name}:${serviceResult.reason || 'blocked'}`)
                }
            } catch (err) {
                proposal.flags = proposal.flags || []
                proposal.flags.push(`service_error:${name}:${err.message}`)
            }
        }

        // Now run through the governor
        return this.governor.process(proposal)
    }
}

// ═══════════════════════════════════════════
//  G. FLEET MODE
//  Distributed hive-mind safety governance.
// ═══════════════════════════════════════════

export class FleetIntegration {
    constructor(governor) {
        this.governor = governor || new Governor()
        this.mode = INTEGRATION_MODES.FLEET
        this.fleetState = new Map() // agentId → latest proposal
    }

    /**
     * Process a proposal from a fleet agent.
     * All fleet agents' state is considered for safety.
     */
    processFleetProposal(agentId, proposal) {
        this.fleetState.set(agentId, proposal)

        // Collect all other agents' proposals
        const agentProposals = []
        for (const [id, p] of this.fleetState) {
            if (id !== agentId) agentProposals.push(p)
        }

        return this.governor.process(proposal, { agentProposals })
    }

    getFleetStatus() {
        const agents = {}
        for (const [id, p] of this.fleetState) {
            agents[id] = {
                lastProposal: p.id,
                confidence: p.confidence,
                flags: p.flags || [],
                timestamp: p.timestamp,
            }
        }
        return { agentCount: this.fleetState.size, agents }
    }
}

// ═══════════════════════════════════════════
//  I. FORENSICS MODE
//  Post-crash cryptographic reconstruction.
// ═══════════════════════════════════════════

export class ForensicsIntegration {
    constructor(governor) {
        this.governor = governor || new Governor()
        this.mode = INTEGRATION_MODES.FORENSICS
        this.eventTimeline = []
    }

    /**
     * Record an event in the forensic timeline.
     */
    recordEvent(event) {
        this.eventTimeline.push({
            ...event,
            recordedAt: Date.now(),
        })
    }

    /**
     * Reconstruct the decision chain from recorded events.
     * Re-validates each proposal to verify the original decisions.
     */
    reconstruct() {
        const reconstruction = {
            timelineLength: this.eventTimeline.length,
            events: [],
            summary: '',
        }

        for (const event of this.eventTimeline) {
            if (event.proposal) {
                // Re-validate to verify the original decision
                const revalidation = this.governor.process(event.proposal)
                reconstruction.events.push({
                    originalEvent: event,
                    revalidation: {
                        decision: revalidation.decision,
                        safe: revalidation.explanation.machineReadable,
                        certificate: revalidation.certificate,
                    },
                    matchesOriginal: event.originalDecision
                        ? event.originalDecision === revalidation.decision
                        : null,
                })
            } else {
                reconstruction.events.push({ originalEvent: event })
            }
        }

        const mismatches = reconstruction.events.filter(e =>
            e.matchesOriginal === false
        )

        reconstruction.summary = mismatches.length > 0
            ? `⚠ FORENSIC ANOMALY: ${mismatches.length} decision(s) differ from original. Possible tampering or state mutation.`
            : `✓ All ${reconstruction.events.length} events verified — decision chain is consistent.`

        return reconstruction
    }

    getTimeline() {
        return [...this.eventTimeline]
    }
}

// ═══════════════════════════════════════════
//  INTEGRATION FACTORY
// ═══════════════════════════════════════════

export function createIntegration(mode, governor) {
    const modes = {
        [INTEGRATION_MODES.INLINE]: InlineIntegration,
        [INTEGRATION_MODES.SHADOW]: ShadowIntegration,
        [INTEGRATION_MODES.ARBITRATION]: ArbitrationIntegration,
        [INTEGRATION_MODES.SENSOR_FUSION]: SensorFusionIntegration,
        [INTEGRATION_MODES.GATEKEEPER]: GatekeeperIntegration,
        [INTEGRATION_MODES.ORCHESTRATION]: OrchestrationIntegration,
        [INTEGRATION_MODES.FLEET]: FleetIntegration,
        [INTEGRATION_MODES.FORENSICS]: ForensicsIntegration,
    }

    const IntegrationClass = modes[mode]
    if (!IntegrationClass) {
        throw new Error(`Unknown integration mode: ${mode}. Valid modes: ${Object.keys(modes).join(', ')}`)
    }

    return new IntegrationClass(governor)
}

export default {
    InlineIntegration,
    ShadowIntegration,
    ArbitrationIntegration,
    SensorFusionIntegration,
    GatekeeperIntegration,
    OrchestrationIntegration,
    FleetIntegration,
    ForensicsIntegration,
    createIntegration,
}
