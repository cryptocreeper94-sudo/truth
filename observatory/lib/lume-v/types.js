/**
 * ═══════════════════════════════════════════════════════════
 *  LUME-V TYPE DEFINITIONS
 *  Deterministic Governor for Nondeterministic AI
 *
 *  All types defined via JSDoc for runtime-free type checking.
 *  By DarkWave Studios LLC — DarkWaveStudios.io
 *  Copyright 2026. Protected by TrustShield.tech
 * ═══════════════════════════════════════════════════════════
 */

/**
 * @typedef {'bounding_box' | 'llm_text' | 'confidence_vector' | 'sensor_fusion' | 'control_command' | 'classification'} ProposalType
 */

/**
 * @typedef {'approved' | 'rejected' | 'overridden' | 'escalated' | 'pending'} GovernorDecision
 */

/**
 * @typedef {'inline' | 'shadow' | 'arbitration' | 'sensor_fusion' | 'gatekeeper' | 'orchestration' | 'fleet' | 'hitl' | 'forensics'} IntegrationMode
 */

/**
 * @typedef {Object} BoundingBox
 * @property {string} label - Object label (e.g., "person", "vehicle")
 * @property {number} confidence - 0.0 → 1.0
 * @property {number} x - Left edge
 * @property {number} y - Top edge
 * @property {number} width - Box width
 * @property {number} height - Box height
 * @property {string} [model] - Model that produced this
 */

/**
 * @typedef {Object} LLMProposal
 * @property {string} text - The LLM's proposed action/response
 * @property {number} confidence - 0.0 → 1.0
 * @property {string} model - Model name
 * @property {number} [tokens] - Token count
 * @property {string[]} [reasoning] - Chain of thought steps
 */

/**
 * @typedef {Object} SensorReading
 * @property {string} sensorId - Unique sensor identifier
 * @property {string} sensorType - e.g., "lidar", "camera", "imu", "gps"
 * @property {*} value - The reading value
 * @property {number} confidence - 0.0 → 1.0
 * @property {number} timestamp - Unix ms
 */

/**
 * @typedef {Object} ControlCommand
 * @property {string} target - System being commanded
 * @property {string} action - The proposed action
 * @property {Object} parameters - Action parameters
 * @property {number} confidence - 0.0 → 1.0
 * @property {string} source - What produced this command
 */

/**
 * The normalized proposal that all adapters produce.
 * This is what the validation engine operates on.
 *
 * @typedef {Object} LumeVProposal
 * @property {string} id - Unique proposal ID
 * @property {ProposalType} type - What kind of AI output this is
 * @property {number} timestamp - When the proposal was created
 * @property {string} source - Which AI system produced this
 * @property {number} confidence - Normalized confidence 0.0 → 1.0
 * @property {*} payload - The actual proposal data (type-specific)
 * @property {Object} context - Environmental context
 * @property {LumeVProposal[]} [previousProposals] - For temporal consistency
 * @property {Object} [domainConstraints] - Domain-specific safety rules
 * @property {string[]} [flags] - Any flags raised during normalization
 */

/**
 * Result of a single safety invariant check.
 *
 * @typedef {Object} InvariantResult
 * @property {number} invariant - Invariant number (1-7)
 * @property {string} name - Invariant name
 * @property {boolean} passed - Whether this invariant holds
 * @property {string} explanation - Human-readable explanation
 * @property {string} [violation] - What specifically was violated
 * @property {string} severity - 'critical' | 'warning' | 'info'
 * @property {Object} [data] - Supporting evidence
 */

/**
 * Full validation result from the engine.
 *
 * @typedef {Object} ValidationResult
 * @property {string} proposalId - Which proposal was validated
 * @property {boolean} safe - Overall safety determination
 * @property {GovernorDecision} decision - Final decision
 * @property {InvariantResult[]} invariants - Per-invariant results
 * @property {number} failedCount - How many invariants failed
 * @property {string} [overrideAction] - What override was applied
 * @property {number} validatedAt - Timestamp
 */

/**
 * Explainability trace — the causal reasoning chain.
 *
 * @typedef {Object} ExplainTrace
 * @property {string} proposalId - Which proposal
 * @property {string} summary - One-line summary
 * @property {string[]} chain - Sequential "Because X, therefore Y" chain
 * @property {string} humanReadable - Full human-readable narrative
 * @property {Object} machineReadable - Structured JSON for API consumers
 * @property {number} generatedAt - Timestamp
 */

/**
 * Governor output — the final deterministic command.
 *
 * @typedef {Object} GovernorOutput
 * @property {string} proposalId - Original proposal ID
 * @property {GovernorDecision} decision - approved | rejected | overridden | escalated
 * @property {*} [command] - The safe command to execute (if approved/overridden)
 * @property {*} [originalCommand] - The original AI proposal (for audit)
 * @property {ExplainTrace} explanation - Why this decision was made
 * @property {Object} certificate - Trust certificate for this decision
 * @property {number} latency - Time from proposal to decision (ms)
 */

export const PROPOSAL_TYPES = {
    BOUNDING_BOX: 'bounding_box',
    LLM_TEXT: 'llm_text',
    CONFIDENCE_VECTOR: 'confidence_vector',
    SENSOR_FUSION: 'sensor_fusion',
    CONTROL_COMMAND: 'control_command',
    CLASSIFICATION: 'classification',
}

export const DECISIONS = {
    APPROVED: 'approved',
    REJECTED: 'rejected',
    OVERRIDDEN: 'overridden',
    ESCALATED: 'escalated',
    PENDING: 'pending',
}

export const SEVERITY = {
    CRITICAL: 'critical',
    WARNING: 'warning',
    INFO: 'info',
}

export const INTEGRATION_MODES = {
    INLINE: 'inline',
    SHADOW: 'shadow',
    ARBITRATION: 'arbitration',
    SENSOR_FUSION: 'sensor_fusion',
    GATEKEEPER: 'gatekeeper',
    ORCHESTRATION: 'orchestration',
    FLEET: 'fleet',
    HITL: 'hitl',
    FORENSICS: 'forensics',
}
