/**
 * ═══════════════════════════════════════════════════════════
 *  LUME-V INPUT ADAPTERS
 *  Layer 2–3: Ingests nondeterministic AI output into
 *  a unified LumeVProposal format for deterministic validation.
 *
 *  Adapters:
 *    - BoundingBoxAdapter: YOLO/vision model bounding boxes
 *    - LLMTextAdapter: ChatGPT/Claude/Gemini text proposals
 *    - ConfidenceVectorAdapter: Raw confidence score arrays
 *    - SensorFusionAdapter: Multi-sensor data fusion
 *    - ControlCommandAdapter: Actuator/control proposals
 *
 *  By DarkWave Studios LLC — DarkWaveStudios.io
 *  Copyright 2026. Protected by TrustShield.tech
 * ═══════════════════════════════════════════════════════════
 */

import crypto from 'crypto'
import { PROPOSAL_TYPES } from './types.js'

function uid() {
    return crypto.randomUUID()
}

// ═══════════════════════════════════════════
//  BOUNDING BOX ADAPTER
//  Ingests YOLO, TensorFlow, etc. detections
// ═══════════════════════════════════════════

export class BoundingBoxAdapter {
    constructor(config = {}) {
        this.minConfidence = config.minConfidence ?? 0.0
        this.maxBoxes = config.maxBoxes ?? 100
        this.validLabels = config.validLabels ?? null // null = accept all
    }

    /**
     * Normalize an array of bounding box detections into a LumeVProposal.
     * @param {import('./types.js').BoundingBox[]} boxes
     * @param {Object} [context] - Environmental context
     * @returns {import('./types.js').LumeVProposal}
     */
    normalize(boxes, context = {}) {
        const flags = []

        // Filter by minimum confidence
        let filtered = boxes.filter(b => b.confidence >= this.minConfidence)
        if (filtered.length < boxes.length) {
            flags.push(`filtered_low_confidence:${boxes.length - filtered.length}`)
        }

        // Filter by valid labels
        if (this.validLabels) {
            const before = filtered.length
            filtered = filtered.filter(b => this.validLabels.includes(b.label))
            if (filtered.length < before) {
                flags.push(`filtered_invalid_labels:${before - filtered.length}`)
            }
        }

        // Cap at max boxes
        if (filtered.length > this.maxBoxes) {
            filtered = filtered
                .sort((a, b) => b.confidence - a.confidence)
                .slice(0, this.maxBoxes)
            flags.push(`capped_at_max:${this.maxBoxes}`)
        }

        // Compute aggregate confidence
        const avgConfidence = filtered.length > 0
            ? filtered.reduce((s, b) => s + b.confidence, 0) / filtered.length
            : 0

        // Check for contradictions (same region, different labels)
        const contradictions = this._detectContradictions(filtered)
        if (contradictions.length > 0) {
            flags.push(`contradictions:${contradictions.length}`)
        }

        return {
            id: uid(),
            type: PROPOSAL_TYPES.BOUNDING_BOX,
            timestamp: Date.now(),
            source: filtered[0]?.model || 'vision_model',
            confidence: avgConfidence,
            payload: {
                boxes: filtered,
                totalDetections: boxes.length,
                filteredDetections: filtered.length,
                contradictions,
            },
            context,
            flags,
        }
    }

    _detectContradictions(boxes) {
        const contradictions = []
        for (let i = 0; i < boxes.length; i++) {
            for (let j = i + 1; j < boxes.length; j++) {
                const overlap = this._iou(boxes[i], boxes[j])
                if (overlap > 0.5 && boxes[i].label !== boxes[j].label) {
                    contradictions.push({
                        boxA: boxes[i],
                        boxB: boxes[j],
                        iou: overlap,
                    })
                }
            }
        }
        return contradictions
    }

    _iou(a, b) {
        const x1 = Math.max(a.x, b.x)
        const y1 = Math.max(a.y, b.y)
        const x2 = Math.min(a.x + a.width, b.x + b.width)
        const y2 = Math.min(a.y + a.height, b.y + b.height)
        if (x2 <= x1 || y2 <= y1) return 0
        const intersection = (x2 - x1) * (y2 - y1)
        const areaA = a.width * a.height
        const areaB = b.width * b.height
        return intersection / (areaA + areaB - intersection)
    }
}

// ═══════════════════════════════════════════
//  LLM TEXT ADAPTER
//  Ingests ChatGPT/Claude/Gemini proposals
// ═══════════════════════════════════════════

export class LLMTextAdapter {
    constructor(config = {}) {
        this.maxTokens = config.maxTokens ?? 100000
        this.dangerPatterns = config.dangerPatterns ?? [
            /\b(delete|drop|truncate|rm\s+-rf|shutdown|kill|destroy)\b/i,
            /\b(sudo|root|admin|password|secret)\b/i,
            /\b(eval|exec|system|spawn|fork)\b/i,
        ]
        this.requiredFields = config.requiredFields ?? []
    }

    /**
     * Normalize an LLM text response into a LumeVProposal.
     * @param {import('./types.js').LLMProposal} llmOutput
     * @param {Object} [context]
     * @returns {import('./types.js').LumeVProposal}
     */
    normalize(llmOutput, context = {}) {
        const flags = []
        const { text, confidence, model, tokens, reasoning } = llmOutput

        // Token limit check
        if (tokens && tokens > this.maxTokens) {
            flags.push(`exceeds_token_limit:${tokens}`)
        }

        // Danger pattern scan
        const dangerMatches = []
        for (const pattern of this.dangerPatterns) {
            const match = text.match(pattern)
            if (match) {
                dangerMatches.push(match[0])
                flags.push(`danger_pattern:${match[0]}`)
            }
        }

        // Empty/missing text
        if (!text || text.trim().length === 0) {
            flags.push('empty_response')
        }

        // Confidence normalization (some models return 0-100)
        let normalizedConfidence = confidence
        if (confidence > 1) normalizedConfidence = confidence / 100
        normalizedConfidence = Math.max(0, Math.min(1, normalizedConfidence ?? 0.5))

        return {
            id: uid(),
            type: PROPOSAL_TYPES.LLM_TEXT,
            timestamp: Date.now(),
            source: model || 'llm',
            confidence: normalizedConfidence,
            payload: {
                text,
                tokens: tokens || text.length,
                reasoning: reasoning || [],
                dangerMatches,
                model,
            },
            context,
            flags,
        }
    }
}

// ═══════════════════════════════════════════
//  CONFIDENCE VECTOR ADAPTER
//  Normalizes raw confidence score arrays
// ═══════════════════════════════════════════

export class ConfidenceVectorAdapter {
    constructor(config = {}) {
        this.labels = config.labels ?? []
        this.minConfidence = config.minConfidence ?? 0.0
    }

    /**
     * Normalize a confidence vector (e.g., softmax output).
     * @param {number[]} scores - Raw confidence scores
     * @param {string} source - Model name
     * @param {Object} [context]
     * @returns {import('./types.js').LumeVProposal}
     */
    normalize(scores, source = 'classifier', context = {}) {
        const flags = []

        // Normalize to sum to 1 if needed
        const sum = scores.reduce((s, v) => s + v, 0)
        const normalized = sum > 0 ? scores.map(s => s / sum) : scores

        // Find top prediction
        const topIndex = normalized.indexOf(Math.max(...normalized))
        const topScore = normalized[topIndex]
        const topLabel = this.labels[topIndex] || `class_${topIndex}`

        // Entropy — high entropy = high uncertainty
        const entropy = -normalized.reduce((s, p) => {
            if (p <= 0) return s
            return s + p * Math.log2(p)
        }, 0)
        const maxEntropy = Math.log2(normalized.length)
        const normalizedEntropy = maxEntropy > 0 ? entropy / maxEntropy : 0

        if (normalizedEntropy > 0.8) flags.push('high_entropy')
        if (topScore < this.minConfidence) flags.push('below_min_confidence')

        // Check for near-ties (ambiguity)
        const sorted = [...normalized].sort((a, b) => b - a)
        if (sorted.length >= 2 && sorted[0] - sorted[1] < 0.05) {
            flags.push('near_tie')
        }

        return {
            id: uid(),
            type: PROPOSAL_TYPES.CONFIDENCE_VECTOR,
            timestamp: Date.now(),
            source,
            confidence: topScore,
            payload: {
                scores: normalized,
                labels: this.labels,
                topPrediction: { label: topLabel, confidence: topScore, index: topIndex },
                entropy: normalizedEntropy,
                ranking: sorted.map((s, i) => ({
                    label: this.labels[normalized.indexOf(s)] || `class_${i}`,
                    confidence: s,
                })),
            },
            context,
            flags,
        }
    }
}

// ═══════════════════════════════════════════
//  SENSOR FUSION ADAPTER
//  Combines multi-sensor data
// ═══════════════════════════════════════════

export class SensorFusionAdapter {
    constructor(config = {}) {
        this.maxStaleness = config.maxStaleness ?? 1000 // ms
        this.minSensors = config.minSensors ?? 1
        this.weights = config.weights ?? {} // sensorType → weight
    }

    /**
     * Fuse multiple sensor readings into a single proposal.
     * @param {import('./types.js').SensorReading[]} readings
     * @param {Object} [context]
     * @returns {import('./types.js').LumeVProposal}
     */
    normalize(readings, context = {}) {
        const flags = []
        const now = Date.now()

        // Filter stale readings
        const fresh = readings.filter(r => now - r.timestamp <= this.maxStaleness)
        if (fresh.length < readings.length) {
            flags.push(`stale_readings:${readings.length - fresh.length}`)
        }

        // Check minimum sensor count
        if (fresh.length < this.minSensors) {
            flags.push(`insufficient_sensors:${fresh.length}/${this.minSensors}`)
        }

        // Weighted confidence
        let totalWeight = 0
        let weightedConfidence = 0
        for (const r of fresh) {
            const w = this.weights[r.sensorType] ?? 1.0
            weightedConfidence += r.confidence * w
            totalWeight += w
        }
        const fusedConfidence = totalWeight > 0 ? weightedConfidence / totalWeight : 0

        // Detect contradictions between sensors
        const contradictions = this._detectSensorContradictions(fresh)
        if (contradictions.length > 0) {
            flags.push(`sensor_contradictions:${contradictions.length}`)
        }

        // Group by sensor type
        const bySensorType = {}
        for (const r of fresh) {
            if (!bySensorType[r.sensorType]) bySensorType[r.sensorType] = []
            bySensorType[r.sensorType].push(r)
        }

        return {
            id: uid(),
            type: PROPOSAL_TYPES.SENSOR_FUSION,
            timestamp: now,
            source: 'sensor_fusion',
            confidence: fusedConfidence,
            payload: {
                readings: fresh,
                totalSensors: fresh.length,
                bySensorType,
                contradictions,
                fusionMethod: 'weighted_average',
            },
            context,
            flags,
        }
    }

    _detectSensorContradictions(readings) {
        // Group by sensor type, check if readings diverge significantly
        const byType = {}
        for (const r of readings) {
            if (!byType[r.sensorType]) byType[r.sensorType] = []
            byType[r.sensorType].push(r)
        }

        const contradictions = []
        for (const [type, group] of Object.entries(byType)) {
            if (group.length < 2) continue
            const confidences = group.map(r => r.confidence)
            const maxDiff = Math.max(...confidences) - Math.min(...confidences)
            if (maxDiff > 0.4) {
                contradictions.push({
                    sensorType: type,
                    maxDivergence: maxDiff,
                    readings: group,
                })
            }
        }
        return contradictions
    }
}

// ═══════════════════════════════════════════
//  CONTROL COMMAND ADAPTER
//  For actuator/drone/robot control proposals
// ═══════════════════════════════════════════

export class ControlCommandAdapter {
    constructor(config = {}) {
        this.safeBounds = config.safeBounds ?? {}       // parameter → { min, max }
        this.allowedActions = config.allowedActions ?? null // null = allow all
        this.forbiddenActions = config.forbiddenActions ?? []
    }

    /**
     * Normalize a control command proposal.
     * @param {import('./types.js').ControlCommand} command
     * @param {Object} [context]
     * @returns {import('./types.js').LumeVProposal}
     */
    normalize(command, context = {}) {
        const flags = []

        // Check forbidden actions
        if (this.forbiddenActions.includes(command.action)) {
            flags.push(`forbidden_action:${command.action}`)
        }

        // Check allowed actions
        if (this.allowedActions && !this.allowedActions.includes(command.action)) {
            flags.push(`unrecognized_action:${command.action}`)
        }

        // Check parameter bounds
        const boundViolations = []
        for (const [param, value] of Object.entries(command.parameters || {})) {
            const bounds = this.safeBounds[param]
            if (bounds && typeof value === 'number') {
                if (value < bounds.min || value > bounds.max) {
                    boundViolations.push({
                        parameter: param,
                        value,
                        min: bounds.min,
                        max: bounds.max,
                    })
                    flags.push(`out_of_bounds:${param}`)
                }
            }
        }

        return {
            id: uid(),
            type: PROPOSAL_TYPES.CONTROL_COMMAND,
            timestamp: Date.now(),
            source: command.source || 'controller',
            confidence: command.confidence ?? 1.0,
            payload: {
                target: command.target,
                action: command.action,
                parameters: command.parameters,
                boundViolations,
            },
            context,
            flags,
        }
    }
}

export default {
    BoundingBoxAdapter,
    LLMTextAdapter,
    ConfidenceVectorAdapter,
    SensorFusionAdapter,
    ControlCommandAdapter,
}
