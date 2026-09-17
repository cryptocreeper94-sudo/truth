/**
 * ═══════════════════════════════════════════════════════════
 *  LUME-V: DETERMINISTIC GOVERNOR FOR NONDETERMINISTIC AI
 *  Version 1.0
 *
 *  The insurance policy for enterprise AI.
 *  AI can see. Lume-V decides whether what it sees is acceptable.
 *  Nondeterministic systems produce proposals;
 *  Lume-V produces guarantees.
 *
 *  By DarkWave Studios LLC — DarkWaveStudios.io
 *  Copyright 2026. Protected by TrustShield.tech
 * ═══════════════════════════════════════════════════════════
 *
 *  Usage:
 *
 *    import { LumeV } from './lume-v/index.js'
 *
 *    const governor = new LumeV({ confidenceThreshold: 0.5 })
 *    const result = governor.validate(proposal)
 *    console.log(result.decision)     // 'approved' | 'rejected' | 'overridden'
 *    console.log(result.explanation)   // human-readable reasoning trace
 *    console.log(result.certificate)   // signed trust certificate
 */

// ── Core Modules ──
export {
    PROPOSAL_TYPES,
    DECISIONS,
    SEVERITY,
    INTEGRATION_MODES,
} from './types.js'

export {
    BoundingBoxAdapter,
    LLMTextAdapter,
    ConfidenceVectorAdapter,
    SensorFusionAdapter,
    ControlCommandAdapter,
} from './input-adapter.js'

export { ValidationEngine } from './validation-engine.js'
export { ExplainabilityLayer } from './explainability.js'
export { Governor } from './governor.js'

export {
    InlineIntegration,
    ShadowIntegration,
    ArbitrationIntegration,
    SensorFusionIntegration,
    GatekeeperIntegration,
    OrchestrationIntegration,
    FleetIntegration,
    ForensicsIntegration,
    createIntegration,
} from './integration.js'

// ═══════════════════════════════════════════
//  LUME-V FACADE
//  Single entry point for the full pipeline.
// ═══════════════════════════════════════════

import { Governor } from './governor.js'
import {
    BoundingBoxAdapter,
    LLMTextAdapter,
    ConfidenceVectorAdapter,
    SensorFusionAdapter,
    ControlCommandAdapter,
} from './input-adapter.js'
import { createIntegration } from './integration.js'

export class LumeV {
    /**
     * Create a new Lume-V instance.
     * @param {Object} [config]
     * @param {number} [config.confidenceThreshold] - Minimum confidence (0-1)
     * @param {number} [config.ambiguityThreshold] - Near-tie threshold
     * @param {number} [config.temporalJitterThreshold] - Oscillation detection
     * @param {Object} [config.domainBounds] - Domain-specific bounds
     * @param {Object} [config.safeFallbacks] - Per-type safe fallback commands
     * @param {string} [config.verbosity] - 'minimal' | 'standard' | 'full'
     */
    constructor(config = {}) {
        this.config = config
        this.governor = new Governor(config)

        // Pre-configured adapters
        this.adapters = {
            boundingBox: new BoundingBoxAdapter(config.adapters?.boundingBox),
            llmText: new LLMTextAdapter(config.adapters?.llmText),
            confidence: new ConfidenceVectorAdapter(config.adapters?.confidence),
            sensorFusion: new SensorFusionAdapter(config.adapters?.sensorFusion),
            control: new ControlCommandAdapter(config.adapters?.control),
        }
    }

    /**
     * Full pipeline: adapt + validate + explain + certify.
     * @param {import('./types.js').LumeVProposal} proposal - Pre-normalized proposal
     * @param {Object} [options]
     * @returns {import('./types.js').GovernorOutput}
     */
    validate(proposal, options = {}) {
        return this.governor.process(proposal, options)
    }

    /**
     * Validate an LLM text response.
     * @param {string} text - LLM output text
     * @param {number} [confidence] - 0.0 → 1.0
     * @param {string} [model] - Model name
     * @returns {import('./types.js').GovernorOutput}
     */
    validateLLM(text, confidence = 0.8, model = 'unknown') {
        const proposal = this.adapters.llmText.normalize(
            { text, confidence, model },
        )
        return this.governor.process(proposal)
    }

    /**
     * Validate bounding box detections.
     * @param {import('./types.js').BoundingBox[]} boxes
     * @returns {import('./types.js').GovernorOutput}
     */
    validateDetections(boxes) {
        const proposal = this.adapters.boundingBox.normalize(boxes)
        return this.governor.process(proposal)
    }

    /**
     * Validate a control command.
     * @param {import('./types.js').ControlCommand} command
     * @returns {import('./types.js').GovernorOutput}
     */
    validateCommand(command) {
        const proposal = this.adapters.control.normalize(command)
        return this.governor.process(proposal)
    }

    /**
     * Validate sensor readings.
     * @param {import('./types.js').SensorReading[]} readings
     * @returns {import('./types.js').GovernorOutput}
     */
    validateSensors(readings) {
        const proposal = this.adapters.sensorFusion.normalize(readings)
        return this.governor.process(proposal)
    }

    /**
     * Validate a classification result.
     * @param {number[]} scores - Raw confidence scores
     * @param {string[]} [labels] - Class labels
     * @returns {import('./types.js').GovernorOutput}
     */
    validateClassification(scores, labels = []) {
        this.adapters.confidence.labels = labels
        const proposal = this.adapters.confidence.normalize(scores)
        return this.governor.process(proposal)
    }

    /**
     * Create an integration mode.
     * @param {string} mode - 'inline' | 'shadow' | 'arbitration' | etc.
     * @returns {Object}
     */
    integration(mode) {
        return createIntegration(mode, this.governor)
    }

    /**
     * Get governor statistics.
     */
    stats() {
        return this.governor.stats()
    }

    /**
     * Get the version.
     */
    static get version() {
        return '1.0.0'
    }
}

export default LumeV
