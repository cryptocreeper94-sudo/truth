# Lume Papers — Insertion-Ready Fix Text

**How to use:** Each fix block contains the exact text to insert, the exact location, and whether it replaces existing text or is a new addition. Work top to bottom. Every block is self-contained.

---

## CROSS-PAPER FIXES (Apply to all papers before touching individual ones)

---

### FIX C-1: Global Search and Replace — "Validated" → "Demonstrated"

Run these replacements across all six paper source files:

| Find | Replace |
|---|---|
| `validated across three published verticals` | `demonstrated across three published verticals` |
| `validated across` | `demonstrated across` |
| `has been validated` | `has been demonstrated` |
| `validates the DAIGS approach` | `demonstrates the DAIGS approach` |
| `Lume‑Med, Lume‑Fin, and Lume‑Ops validate` | `Lume‑Med, Lume‑Fin, and Lume‑Ops demonstrate` |
| `validated by three` | `demonstrated by three` |

**Do NOT replace:** Any instance where "validates" means a technical operation performed by the system (e.g., "validates the proposal against invariants," "validates all certificates"). Those are correct.

---

### FIX C-2: Global Search and Replace — "First" Claim Hedging

| Find (approximate — match context) | Replace |
|---|---|
| `Lume is the first language where voice‑to‑code is architecturally natural` | `Lume is, to our knowledge, the first language where voice‑to‑code is a compiler‑level feature rather than an external editor integration` |
| `the first deterministic multi‑agent cognition substrate` | `to our knowledge, the first multi‑agent framework to enforce replay‑identical collective cognition through certificate‑anchored arbitration` |
| `the first formally specified deterministic governance substrate` | `the first formally specified deterministic governance substrate for medical AI, to our knowledge` |
| `the first implementation of DAIGS` | `the first implementation of DAIGS, to our knowledge` |
| Any remaining `the first [X]` claim | `to our knowledge, the first [X]` |

---

### FIX C-3: SHA3-256 Versioning Note

**Add to Lume compiler paper, Section 6.4 (Security Certificate), as a footnote or inline note:**

> ¹ The initial LTC v1.0 format uses SHA‑256. Subsequent LTC versions (v1.1+, used in Lume‑Ops, Lume‑Med, Lume‑Fin, and Lume‑X) upgrade to SHA3‑256 for improved collision resistance and resistance to length‑extension attacks. SHA‑256 certificates issued under LTC v1.0 remain valid and verifiable. The hash algorithm version is encoded in the certificate's `hash.algorithm` field.

**Add to Lume-Med, Lume-Fin certificate sections — replace "SHA‑256" with "SHA3‑256" and note:**

> Note: LTC‑Med v1.0 uses SHA3‑256 hashing (an upgrade from the SHA‑256 used in the initial LTC v1.0 specification). The `hash.algorithm` field in the certificate structure records the algorithm used, ensuring backward-compatible verification.

---

## LUME (COMPILER) FIXES

---

### FIX L-1: Test Count Reproducibility Footnote

**Location:** Section 9 (Implementation Metrics), in the row or caption for "Test suite: 2,331 tests, 62 test files, 0 failures"

**Add as footnote:**

> ᵃ Test suite reproducible via `npm test` in the root of the repository at commit `[INSERT COMMIT HASH HERE]`. Count reflects unit and integration tests across compiler, server, and site modules. Snapshot and type-check tests are excluded from this count.

**Action required:** Run `npm test` before inserting. Insert the actual commit hash and verify the count matches 2,331. If the count differs, update the number in the abstract, the metrics table, and the Zenodo description to match.

---

### FIX L-2: Layer 7 Normalization Clarification

**Location:** Section 4.2 (Architectural Guarantee), add as a new paragraph after the existing guarantee text.

**Insert:**

> Layer 7's AI model produces a probability distribution over intent categories. The normalization step selects the maximum-probability intent class — a deterministic argmax operation. For any given probability distribution output from the AI model, there is exactly one normalized output. Nondeterminism is confined to the AI model's internal computation; the bridge between AI output and AST construction is deterministic. Two calls to Layer 7 with identical AI model output will always produce the same normalized intent and the same AST node. This is why Layer 7 is invoked in under 2% of compilation events in testing, and why the Clarification Loop (Section 4.4) provides a 100% deterministic bypass for environments where AI is disabled entirely.

---

### FIX L-3: Voice Homophone Context Rules Table

**Location:** Section 5.3 (Homophone Resolution Rules), replace the current text with the following expanded version.

**Replace current Section 5.3 with:**

> Lume implements context-aware disambiguation for 10 common speech-to-text homophone pairs. Context is determined by scanning the preceding 5 tokens in the current statement and the last 3 resolved statements in the compilation session. The resolution rules are:
>
> | Pair | Interpretation A | Context Signal for A | Interpretation B | Context Signal for B | Default (no signal) |
> |---|---|---|---|---|---|
> | write / right | write (file/save operation) | Prior: `file`, `save`, `path`, `append`, `output` | right (direction/correct) | Prior: `direction`, `turn`, `correct`, `left` | write |
> | new / knew | new (creation) | Creation verb in scope: `create`, `make`, `build`, `define` | knew (past tense, narrative) | Past-tense markers: `was`, `had`, `before` | new |
> | for / four | for (loop/purpose) | Loop keywords: `each`, `every`, `repeat`, `while` | four (quantity) | Numeric context: adjacent number words | for |
> | their / there / they're | their (possessive) | Noun phrase following | there (location) | Location keywords: `at`, `in`, `to` | their |
> | two / to / too | to (purpose/direction) | Verb phrase following | two (quantity) | Numeric context | to |
> | no / know | no (negation) | Following a question or condition | know (knowledge verb) | `if`, `whether`, `how` preceding | no |
> | by / buy | by (method/agent) | `using`, `with`, `through` context | buy (purchase) | Commerce context: `pay`, `cost`, `price` | by |
> | sea / see | see (visual verb) | Action verb context | sea (marine noun) | Marine context: `ocean`, `water`, `shore` | see |
> | mail / male | mail (message/post) | Communication context | male (gender) | Biological/form context | mail |
> | wait / weight | wait (delay) | Temporal context: `until`, `before`, `pause` | weight (measurement) | Measurement context: `kilograms`, `pounds`, `load` | wait |
>
> When no context signal is present, the default interpretation (rightmost column) is applied. All defaults are statically defined and produce the same resolution for the same input — the resolution is deterministic regardless of session context. The defaults represent the statistically dominant programming interpretation of each pair.

---

### FIX L-4: Synthetic Organisms Scope Defense

**Location:** Section 8 (Synthetic Organisms), beginning of section — insert as the first paragraph.

**Insert:**

> This section presents the theoretical framework for Synthetic Organisms as a natural extension of the Lume runtime's deterministic, self-sustaining architecture. The runtime subsystems — Monitor, Healer, Optimizer, Evolver — map cleanly to biological self-maintenance systems, providing both conceptual grounding and a design vocabulary for cyber-physical applications. The hardware prototype described in Section 8.4 is a research roadmap item targeting a sub-$50 proof of concept; it is not an implemented system at the time of this writing. Readers whose primary interest is the Lume language, compiler, or runtime may treat Sections 8.1–8.4 as a forward-looking theoretical extension. A companion paper currently in preparation will develop the Synthetic Organisms taxonomy and prototype in full.

---

## LUME-V FIXES

---

### FIX V-1: Bit-Identical Replay — Scope and Conditions

**Location:** Section 10, add as new Section 10.4 after the existing "Key Findings" subsection.

**Insert:**

> **10.4 Bit-Identical Replay: Scope and Platform Conditions**
>
> The bit-identical replay claim applies specifically to the governance layer, not to the underlying AI model. The governance pipeline operates exclusively on: (1) canonical JSON structures serialized per RFC 8785, which are platform-independent; (2) SHA3-256 hash computation, which is deterministic across all conforming implementations; (3) Ed25519 signature verification, which is deterministic; and (4) integer and boolean comparison operations in invariant evaluation. No floating-point arithmetic is performed within the governance layer itself.
>
> The AI model's output — which may involve floating-point computation — is normalized into a canonical LumeVProposal structure (Section 4.2) before entering the governance pipeline. Replay reconstructs the governance decision from the stored certificate, not from re-running the AI model. Accordingly, replay-identical reconstruction does not require the original AI model to be available or to produce identical outputs.
>
> Experimental platform: [INSERT OS], [INSERT CPU], Node.js [INSERT VERSION], dependencies at commit [INSERT HASH]. All 24 certificates verified on the same hardware used for generation. Cross-platform replay verification is deferred to future work.

---

### FIX V-2: Baseline Condition Addition to Evaluation

**Location:** Section 10.1 (Experimental Setup), add a new row to the setup table, and Section 10.2 (Results), add a new row to the results table.

**Add to Section 10.1 setup:**

> | Baseline Condition | Same RL agent and fault injection, Lume-V governance disabled. Actuator commands passed directly from model to motor controllers. |

**Add to Section 10.2 results table:**

> | Baseline: Unsafe Commands Without Governance | [INSERT NUMBER] of 24 decisions reached actuators unsafely |
> | Governance Reduction | [BASELINE COUNT] unsafe commands intercepted (100% interception rate) |

**Action required:** Run the drone simulation with Lume-V disabled and count how many of the same 24 fault scenarios produce unsafe actuator commands. Insert the real number. This transforms the result from "0 unsafe commands with governance" (uninterpretable without context) to "X unsafe commands without governance, 0 with governance" (meaningful).

---

### FIX V-3: Simplex Architecture Citation

**Location:** Section 12 (Related Work), add after the Seshia et al. (2022) entry.

**Insert:**

> The Simplex Architecture [Sha, 2001] provides a formally verified safety controller that overrides an untrusted high-performance controller in real-time systems. Simplex establishes the foundational concept of a deterministic safety monitor that can preempt an AI or adaptive controller without modifying it — a concept directly relevant to Lume-V. Lume-V extends this principle to the AI governance domain: where Simplex provides a static, pre-verified safety controller at the hardware/firmware layer, Lume-V provides a dynamic, certificate-anchored governance pipeline at the AI output layer that evaluates outputs against configurable invariants and produces cryptographic evidence of each governance decision. Lume-V is not a replacement for Simplex in hardware-safety-rated systems; it operates at the layer above, governing AI proposals before they reach the certified control layer where Simplex applies.

**Add to References:**

> Sha, L. (2001). Using Simplicity to Control Complexity. *IEEE Software*, 18(4), 20–28. https://doi.org/10.1109/52.935852

---

### FIX V-4: Multi-Agent Latency Theoretical Analysis

**Location:** Section 13 (Limitations), add after the existing multi-agent latency bullet point.

**Replace:**
> "Multi-agent arbitration adds latency overhead proportional to the number of agents."

**With:**

> Multi-agent arbitration adds latency overhead proportional to the number of agents. For n agents, arbitration requires O(n²) certificate exchanges in the worst case (all-pairs contradiction detection). At 4ms per single-agent governance cycle and an estimated 1ms network round-trip time in a local deployment, a 4-agent arbitration is estimated to complete within 20–30ms — within the latency budget of most non-hard-real-time systems. Hard-real-time systems (latency budget < 10ms) should use single-agent inline validation or the shadow validation pattern (Section 9, Pattern 2) rather than multi-agent arbitration. Empirical multi-agent latency characterization is deferred to future work.

---

## LUME-MED FIXES

---

### FIX M-1: ImageDiagnosticAdapter Normalization Boundary

**Location:** Section 5.1 (Layer 1 — Medical Domain Input Normalization), add after the adapter list table.

**Insert:**

> For image-based models (ImageDiagnosticAdapter), the confidence value is extracted as follows: for classification heads, the maximum softmax probability over output classes; for segmentation models, the mean foreground confidence across the predicted region of interest; for detection models, the per-instance confidence score of the highest-scoring prediction. The specific extraction logic is defined by the domain deployer for their model architecture — Lume-Med provides the adapter interface, not the extraction implementation.
>
> This is a deliberate design choice: confidence extraction is model-specific and cannot be generalized without domain knowledge. The governance layer (Invariant I₁) evaluates the extracted confidence against T_domain regardless of its source. Deployers are responsible for ensuring their extraction logic is calibrated to the threshold semantics of their domain (see Section 5.2, Invariant I₁ calibration note).

---

### FIX M-2: Confidence Calibration Caveat

**Location:** Section 5.2 (Layer 2 — Safety Invariant Engine), after the I₁ definition, insert a calibration note.

**Insert:**

> *Calibration Note:* Invariant I₁ evaluates confidence against a domain-specific threshold T_domain. This threshold must be calibrated per model — a threshold appropriate for a well-calibrated classifier may not be appropriate for an overconfident or underconfident model. Confidence scores from different model architectures are not directly comparable. Deployers should apply post-hoc calibration techniques — such as Platt scaling [Platt, 1999] or isotonic regression [Zadrozny & Elkan, 2002] — before deployment to ensure that reported confidence values have consistent semantics relative to T_domain. Lume-Med does not perform inter-model calibration; it enforces the threshold on whatever confidence value the adapter reports.

**Add to References:**

> Platt, J. (1999). Probabilistic Outputs for Support Vector Machines and Comparisons to Regularized Likelihood Methods. *Advances in Large Margin Classifiers*, 10(3), 61–74.
>
> Zadrozny, B., & Elkan, C. (2002). Transforming Classifier Scores into Accurate Multiclass Probability Estimates. *Proceedings of the 8th ACM SIGKDD*, 694–699.

> Guo, C., Pleiss, G., Sun, Y., & Weinberger, K. Q. (2017). On Calibration of Modern Neural Networks. *ICML*, 1321–1330.

---

### FIX M-3: Proof Sketch Enhancement — Invariant 1 Template

**Location:** Section 6 (Invariant Proof Sketches), Invariant 1. Replace the current short sketch with this version. Repeat the pattern for all seven invariants.

**Replace Invariant 1 proof sketch with:**

> **Invariant 1 — Confidence Threshold Integrity (Sketch)**
>
> *Statement:* If P.confidence < T_domain, the system MUST reject the proposal.
>
> *Implementation bridge:* The adapter produces `P.confidence ∈ [0,1]` as a floating-point scalar. T_domain is a real constant defined at deployment time and fixed for the duration of a governance session. The InvariantEvaluator computes the comparison `P.confidence ≥ T_domain` as a deterministic real comparison: no branching on runtime state, no stochastic elements, no side effects. The evaluator returns `I₁(P) = true` if and only if `P.confidence ≥ T_domain`, and `I₁(P) = false` otherwise.
>
> *Determinism argument:* For identical (P, T_domain), the comparison always produces the same Boolean. I₁ is a pure function with no mutable state.
>
> *Safety consequence:* I₁(P) = false ⇒ the override function O maps V(P) to a non-approve action (Definition 4). No proposal with sub-threshold confidence may reach a downstream medical system.
>
> *Conclusion:* P.confidence < T_domain ⇒ decision = override. ∎ (Sketch)

**Apply the same structure to Invariants 2–7:** For each invariant, add the three elements: "Implementation bridge" (connecting the formal definition to how the code evaluates it), "Determinism argument" (why same input → same output), and "Safety consequence" (what happens to the overall decision when this invariant fails).

---

### FIX M-4: "Validated" in Abstract

**Location:** Abstract, second paragraph.

**Find:** `This work positions Lume‑Med as the medical instantiation of a general, cross‑industry deterministic governance architecture`

**Insert after:** `, demonstrated through the DAIGS framework established in this work and its companion verticals`

---

## LUME-FIN FIXES

---

### FIX F-1: RI-1 Stability Invariant — Nondeterministic Model Tension

**Location:** Section 6.1 (Risk Invariants), after the RI-1 definition and before RI-2.

**Insert:**

> *Deployment Note — Nondeterministic Risk Models:* RI-1 applies to the normalized LumeVProposal entering the governance layer, not to the underlying risk model. Many production risk models — Monte Carlo simulations, random forests with stochastic sampling, ensemble methods — are deliberately nondeterministic. For these models, the adapter is responsible for aggregating model outputs into a stable normalized proposal before Lume-Fin governance: for example, reporting the mean value-at-risk over N Monte Carlo samples (using a fixed seed per evaluation), or reporting distributional statistics (median, 95th percentile) rather than individual samples. Deployers of nondeterministic risk models must design adapters that produce stable normalized outputs. RI-1 verifies stability at the governance boundary; it does not require the underlying model to be deterministic.

---

### FIX F-2: RI-2 Monotonicity Invariant — Revised Definition

**Location:** Section 6.1 (Risk Invariants), RI-2.

**Replace current RI-2 definition with:**

> **RI-2: Monotonicity Invariant.** Risk classifications must move in the correct direction relative to changes in canonicalized risk factors, as defined by the domain deployer. For credit risk, the deployer specifies a monotonicity rule set — for example: an increase in debt-to-income ratio must not produce a decrease in risk score; an increase in collateral coverage ratio must not produce an increase in risk score; a decrease in payment history score must not produce a decrease in risk score. The Monotonicity Invariant does not mandate that any single variable (e.g., absolute debt level) monotonically determines risk in isolation — risk is a multivariate function. It mandates that the deployer-specified risk factor relationships are respected by the model's normalized output. RI-2 is violated if a model output contradicts a deployer-specified monotonicity rule given the observed input change.

---

### FIX F-3: Regulatory Alignment Detail — Three Frameworks

**Location:** New Section (insert after Section 5 — Architecture, before Section 6 — Invariants). Title: "Section 5A — Regulatory Alignment: Detailed Mapping (Selected Frameworks)"

**Insert:**

> Lume-Fin claims alignment with 15 regulatory frameworks. The following table demonstrates specific alignment for three representative frameworks. Full alignment documentation for all 15 frameworks is available as a supplementary technical report.
>
> | Framework | Specific Requirement | Lume-Fin Mechanism |
> |---|---|---|
> | ECOA (15 U.S.C. § 1691) | Adverse action notices must provide specific reasons for credit denial (Regulation B, 12 CFR § 202.9) | BF-1–BF-3 invariants evaluate protected class influence at decision time. The LTC-Fin narrative trace contains machine-readable denial rationale linked to specific invariant evaluations, satisfying the Regulation B requirement for specific reasons. |
> | EU AI Act (2024), Article 13 | High-risk AI systems must provide transparency to affected persons in clear and comprehensible language | The Lume-Fin three-tier explainability produces a narrative trace suitable for consumer disclosure. The LTC-Fin certificate contains a `consumer_explanation` field formatted per Art. 13(1) transparency requirements. |
> | Basel III / CRR Article 144(1)(d) | Internal ratings-based (IRB) models must be validated, documented, and subject to independent review | RI-5 (Cross-Model Consistency) and RI-6 (Regulatory Alignment) invariants, combined with the LTC-Fin hash-linked certificate chain, provide the documentation and auditability required under CRR Art. 144(1)(d). Each governance decision is immutably recorded with the model identifier, invariant results, and arbitration outcome. |
>
> Note: Lume-Fin provides the governance and auditability substrate. Legal compliance determination remains the responsibility of deploying institutions and their counsel.

---

### FIX F-4: BF-1 Protected Attribute Set

**Location:** Section 6.4 (Bias & Fairness Invariants), after the BF-1 definition.

**Insert:**

> *Protected Attribute Set:* The protected attribute set evaluated by BF-1 is deployment-defined and jurisdiction-specific. Lume-Fin enforces that the deployer-specified set is applied consistently; it does not define the set universally. A reference set covering major jurisdictions is provided in Appendix A:
>
> - **United States (ECOA/Regulation B):** Race, color, religion, national origin, sex, marital status, age (if ≥ 18), receipt of public assistance income, exercise of rights under Consumer Credit Protection Act
> - **European Union (GDPR Art. 9 + EU AI Act):** Racial or ethnic origin, political opinions, religious or philosophical beliefs, trade union membership, genetic data, biometric data, health data, sex life or sexual orientation
> - **United Kingdom (Equality Act 2010):** Age, disability, gender reassignment, marriage/civil partnership, pregnancy/maternity, race, religion/belief, sex, sexual orientation
>
> Deployers must specify which jurisdictional set applies at configuration time. Multi-jurisdictional deployments must apply the union of applicable sets.

**Add Appendix A to Lume-Fin** with the above table expanded as a full appendix section.

---

## LUME-OPS FIXES

---

### FIX O-1: IEC 61508 Positioning Paragraph

**Location:** Section 1.2 (Scope and Positioning) or after the architecture overview in Section 5. Insert as a dedicated paragraph titled "Relationship to Functional Safety Standards."

**Insert:**

> **Relationship to Functional Safety Standards**
>
> Functional safety standards — IEC 61508 (Functional Safety of Electrical/Electronic/Programmable Electronic Safety-related Systems), ISO 13849 (Safety of Machinery — Safety-Related Parts of Control Systems), and ISO 26262 (Road Vehicles — Functional Safety) — govern the hardware and software safety functions of industrial machinery, defining Safety Integrity Levels (SIL 1–4) and Performance Levels (PL a–e). Lume-Ops does not replace these standards and does not claim SIL or PL ratings.
>
> Lume-Ops operates at the AI governance layer, above the certified safety control layer. Its Safety Evaluator validates AI-generated proposals (robot trajectories, scheduling commands, logistics routing instructions) before those proposals reach the certified PLC, safety relay, or safety-rated controller that implements IEC 61508-compliant safety functions. Lume-Ops is to IEC 61508 what a pre-operation inspection checklist is to an aviation airworthiness standard: a structured verification process that feeds a safety-certified system without substituting for it.
>
> The invariant codes used in Lume-Ops (SI-112, SI-204, SI-331, etc.) are internal Lume-Ops identifiers. They do not correspond to IEC 61508 SIL assignments or ISO 13849 category classifications, which are determined by hardware and software safety function design, risk assessment, and independent certification — not by the AI governance layer.

---

### FIX O-2: FailSafeController Escalation Decision Table

**Location:** Section 5.1 (The Seven Deterministic Layers), after the Layer 7 (System Governance Layer) description, or in Section 7 (Arbitration Architecture) as a new subsection.

**Insert as Section 7.5 — FailSafeController Escalation Criteria:**

> The FailSafeController manages a five-level escalation hierarchy. Escalation between levels is triggered by the following deterministic conditions:
>
> | From Level | To Level | Trigger Conditions (any one sufficient) |
> |---|---|---|
> | **Machine Freeze** | **Line Freeze** | (a) Freeze duration exceeds T_line_timeout (default: 30s, deployment-configurable); OR (b) 2 or more machines in the same production cell are simultaneously frozen; OR (c) the frozen machine is on the critical path of active WIP per the current MES schedule |
> | **Line Freeze** | **Zone Freeze** | (a) 2 or more lines within the zone are simultaneously in Line Freeze; OR (b) A zone-level environmental safety invariant is triggered (SI-801 smoke, SI-812 chemical hazard); OR (c) LedgerGuardian detects certificate chain corruption spanning entries from multiple lines |
> | **Zone Freeze** | **Facility Freeze** | (a) 3 or more zones within the facility are simultaneously in Zone Freeze; OR (b) A regulatory-threshold event is detected (OSHA recordable incident threshold, as defined in 29 CFR § 1904); OR (c) A confirmed human injury signal is received from the safety sensor cluster |
> | **Facility Freeze** | **System-Wide Freeze** | (a) 2 or more facilities are simultaneously in Facility Freeze; OR (b) A governance kernel violation is detected by LedgerGuardian; OR (c) An explicit system-wide safety signal is received from the central operations authority |
>
> All timeout thresholds (T_line_timeout, etc.) are deployment-configured. Recovery from any freeze level requires explicit operator certification via a signed recovery command, which is recorded as a LedgerGuardian entry before any restart proceeds. Recovery does not auto-escalate — the system stays frozen until human-authorized recovery.

---

### FIX O-3: Confidence Score Purpose Statement

**Location:** Section 6 (Operational Invariant Classes), after the "Invariant Guarantee" paragraph at the end of Section 6.

**Insert:**

> **Confidence Score Usage:** Each evaluator produces a Boolean result and an attached confidence score. The Boolean result is the decision input: any `false` (unsafe/violated) result immediately triggers the corresponding arbitration class, regardless of the confidence score. The confidence score does not moderate or delay the arbitration trigger. The confidence score serves three secondary functions: (1) it is included in the arbitration priority ordering function σ (Section 7.3) to rank competing `true` proposals by evaluator certainty; (2) it is reported in the Supervisor-Facing Explanation (SFE) to convey evaluator confidence to shift engineers; and (3) it is logged in the LedgerGuardian for post-incident drift analysis. A low-confidence `true` result does not trigger arbitration but is flagged in the SFE and recorded for ongoing drift monitoring.

---

### FIX O-4: Abstract Rewrite — Lead With Three-Tier Explainability

**Location:** Abstract, second sentence area.

**Find the current abstract's description of the paper's contributions and ensure this text appears early — ideally in the first 3 sentences:**

**Insert or move to the front of the abstract contributions list:**

> A central contribution of this work is a three-tier explainability architecture that simultaneously produces: operator-facing plain-language explanations for HMI displays ("Robot arm stopped — human detected in zone"), supervisor-facing technical explanations for engineers (invariant IDs, arbitration class, threshold values, corrective actions), and regulator-facing audit-grade explanations for OSHA, DOT, and FAA auditors (certificate chain, hash verification, replay commands, regulatory mapping). No existing operational AI governance framework produces all three simultaneously from a single governance evaluation.

---

### FIX O-5: Scope Narrowing in Abstract and Introduction

**Location:** Abstract and Section 1.2 (Scope and Positioning).

**Find:** All instances of the 13-domain list (manufacturing, robotics, logistics, fleet, warehousing, supply chain, predictive maintenance, energy, construction, industrial IoT, aviation ground ops, maritime, emergency response)

**Replace with:** "cyber-physical operational environments — with primary development in manufacturing, robotics, and logistics — and a generalizable architecture applicable to fleet operations, warehousing, supply chain, predictive maintenance, energy systems, construction, industrial IoT, and related domains"

**In Section 3 (Operational Domains), add at the start:**

> The Lume-Ops governance architecture is domain-agnostic by design. This section surveys 13 operational domains to demonstrate the breadth of applicability. The primary developed domains in this paper are manufacturing, robotics, and logistics; the remaining domains share the same invariant architecture with domain-specific evaluator configuration. Companion technical reports providing domain-specific instantiations for fleet operations, warehousing, and predictive maintenance are in preparation.

---

## LUME-X FIXES

---

### FIX X-1: Update DOI in Paper Body

**Location:** Paper header / title page area, wherever "DOI: (pending Zenodo upload)" appears.

**Replace:** `DOI: (pending Zenodo upload)`
**With:** `DOI: 10.5281/zenodo.19443968`

---

### FIX X-2: Bit-Exact Reconstruction Clarification

**Location:** Section 3 (DMAC category definition), after the "Deterministic Replay" property definition, or as a new Section 3.1 — "Replay Semantics."

**Insert:**

> **Replay Semantics:** Bit-exact reconstruction in Lume-X applies to the cognitive governance layer, which operates exclusively on canonical JSON structures (RFC 8785), SHA3-256 hashes, Ed25519 signatures, and integer/boolean comparisons. Agent cognitive state (the S component of the agent tuple A = (id, K, E, S, C, M, t)) is represented as a canonical JSON document. All cross-agent communication uses RFC 8785 canonical serialization, ensuring platform-independent message representation.
>
> Underlying AI model computations — which may involve floating-point arithmetic and are inherently nondeterministic — are normalized through Lume-V adapters before entering the Lume-X cognitive layer (see Lume-V, Section 4). The normalized LumeVProposal is the boundary at which nondeterminism is eliminated. Replay reconstructs agent state transitions and governance decisions from the certificate chain, not from re-running underlying models. This means bit-exact reconstruction does not require the original AI model to be available or to produce reproducible outputs.

---

### FIX X-3: "No Quorum" Liveness Explanation

**Location:** Section 6.3 (Deterministic Negotiation Model), after the "No probabilistic consensus or partial outcomes are allowed" statement.

**Insert:**

> **Liveness Under Agent Failure:** The no-quorum requirement does not mean all agents must be online for the system to operate. Lume-X defines agent eligibility as a precondition for participation in collective cognition (Section 6.3, Phase 1 — Eligibility Validation). An offline, unresponsive, or certificate-invalid agent fails eligibility and is excluded from the negotiation cycle deterministically — the governance kernel records the exclusion in a certificate. The minimum eligible group size for collective decision is deployment-configurable (default: all registered agents that pass eligibility).
>
> If no eligible group can be formed, the society enters a deterministic freeze rather than proceeding with partial agreement. This is a deliberate design choice: in safety-critical environments, a wrong collective decision is worse than no decision. Availability is sacrificed in favor of safety. Systems requiring higher availability should deploy redundant agents, where N-of-M subsets can form eligible groups under deployment-configured quorum rules — but even in this case, the eligible subgroup must reach total deterministic convergence, not probabilistic consensus.

---

### FIX X-4: FIPA Citation in Related Works

**Location:** Related Works section (to be written per lume-papers-handoff.md). Insert as one entry.

**Insert:**

> The FIPA Agent Communication Language (ACL) [FIPA, 2002] defines a standardized messaging protocol for multi-agent systems, including a set of performatives (inform, request, propose, agree, refuse, failure) and content language specifications. JADE (Java Agent DEvelopment Framework) [Bellifemine et al., 2007] provides a production implementation of FIPA-ACL widely used in industry and research. Lume-X communication is not FIPA-ACL compatible by design: FIPA-ACL messages are unsigned, not certificate-anchored, permit asynchronous delivery without deterministic ordering, and produce no replay-compatible evidence. Lume-X replaces performative semantics with certificate-anchored proposal exchange, eliminating message authenticity ambiguity and enabling deterministic replay. Systems requiring interoperability with existing FIPA-ACL agents can bridge to Lume-X through an adapter that wraps incoming FIPA messages in LumeVProposal structures before they enter the Lume-X governance pipeline.

**Add to References:**

> FIPA (2002). FIPA ACL Message Structure Specification. Foundation for Intelligent Physical Agents. http://www.fipa.org/specs/fipa00061/
>
> Bellifemine, F. L., Caire, G., & Greenwood, D. (2007). *Developing Multi-Agent Systems with JADE*. Wiley.

---

### FIX X-5: Move Biological Mapping to Appendix

**Location:** Section 10.5 (Synthetic Organism Fusion) — move entire section to Appendix A.

**In Section 10's conclusion, add forward reference:**

> The combined Lume-X/Lume-Ops system exhibits structural correspondences to biological organism architectures — the cognitive layer (Lume-X) mapping to the nervous system, the operational layer (Lume-Ops) to the muscular system, the certificate fabric to the circulatory system, and the safety fabric to the immune system. A conceptual bridge elaborating this correspondence is provided in Appendix A for readers working at the intersection of bio-inspired computing and deterministic systems.

**Retitle Section 10.5 as:** "Appendix A — Conceptual Bridge: Lume-X/Lume-Ops as a Synthetic Organism"

---

## DOI CROSS-REFERENCE CORRECTIONS (All Papers)

Apply to every References section and every in-text citation across all six papers:

| Incorrect DOI | Correct DOI | Paper |
|---|---|---|
| `10.5281/zenodo.19437982` | `10.5281/zenodo.19440680` | Lume-Ops (all papers that cite it) |
| `10.5281/zenodo.19382282` | `10.5281/zenodo.19441103` | Lume v2 → update to Lume v4 |
| `10.5281/zenodo.19430898` | `10.5281/zenodo.19441103` | Lume v3 → update to Lume v4 |

After applying, verify by checking each DOI URL resolves to the correct record.

---

## RELATED WORKS SECTIONS — Full Text

These sections do not exist yet in Lume-Med, Lume-Fin, Lume-Ops, or Lume-X. Insert each as a new section titled "Related Work" before the Conclusion section.

---

### RELATED WORK — Lume-Med

> **Related Work**
>
> **AI in Clinical Decision Support.** Topol [2019] surveys the convergence of AI and medicine, establishing the baseline capabilities and risks of AI in clinical environments that Lume-Med's governance substrate addresses. Rajpurkar et al. [2022] provide a comprehensive assessment of AI across medical domains, documenting failure modes — including distribution shift, calibration errors, and hallucination — that Lume-Med's invariant framework is designed to govern.
>
> **Post-hoc Explainability.** Ribeiro et al. [2016] introduce LIME and Lundberg & Lee [2017] introduce SHAP as post-hoc explainability methods widely used in medical AI. These methods explain model behavior after a decision is made and are nondeterministic — the same input can produce different explanations on different runs. Lume-Med's explainability layer generates traces during governance, not after, and is fully deterministic: the same input always produces the same trace.
>
> **Regulatory Frameworks for Medical AI.** The IMDRF [2021] guidance on AI/ML-based Software as a Medical Device (SaMD) establishes the regulatory expectations that Lume-Med's LTC-Med certificates and audit trails are designed to address. FDA's action plan for AI/ML-based SaMD [FDA, 2021] emphasizes the need for transparency, explainability, and monitoring — properties that Lume-Med provides structurally rather than procedurally.
>
> **Confidence Calibration.** Guo et al. [2017] demonstrate that modern neural networks are systematically overconfident, making raw confidence scores unreliable for threshold-based governance without calibration. Lume-Med's Invariant I₁ requires threshold-calibrated confidence; deployers are responsible for applying calibration techniques [Platt, 1999; Zadrozny & Elkan, 2002] appropriate for their model architecture.
>
> **Formal Verification.** Seshia et al. [2022] survey approaches to verified AI, positioning formal methods as a path toward provably safe AI systems. Lume-Med's proof sketches (Section 6) are informal by comparison — they establish logical correctness of the invariant evaluation logic, not the safety of the underlying AI models. Full formal verification of Lume-Med governance properties is deferred to future work.

**Add to References:**
> Topol, E. J. (2019). High-performance medicine: the convergence of human and artificial intelligence. *Nature Medicine*, 25(1), 44–56.
>
> Rajpurkar, P., Chen, E., Banerjee, O., & Topol, E. J. (2022). AI in health and medicine. *Nature Medicine*, 28(1), 31–38.
>
> IMDRF (2021). Machine Learning-Enabled Medical Devices: Key Terms and Definitions. International Medical Device Regulators Forum.
>
> FDA (2021). Artificial Intelligence/Machine Learning (AI/ML)-Based Software as a Medical Device (SaMD) Action Plan. U.S. Food and Drug Administration.

---

### RELATED WORK — Lume-Fin

> **Related Work**
>
> **Fairness in Machine Learning.** Barocas, Hardt & Narayanan [2019] provide the canonical treatment of fairness in machine learning, formalizing disparate impact, individual fairness, and calibration as competing fairness criteria. Lume-Fin's Bias & Fairness invariants (BF-1–BF-6) operationalize several of these criteria as deterministic governance predicates. Mehrabi et al. [2021] survey bias sources and mitigation techniques across the ML pipeline — Lume-Fin's approach governs model outputs rather than the training pipeline, making it complementary to bias mitigation during training.
>
> **AI Governance Tools.** IBM OpenScale (now Watson OpenScale) and Microsoft Fairlearn provide post-hoc fairness monitoring and explanation for AI systems in production. These tools detect bias statistically after deployment and flag violations for human review. Lume-Fin differs in approach: rather than detecting bias after decisions are made, it enforces deterministic fairness invariants before any decision reaches a downstream system, producing a certificate of compliance (or non-compliance) for every decision.
>
> **Financial Risk Modeling.** McNeil, Frey & Embrechts [2015] provide the quantitative foundations of financial risk modeling, including the VaR, CVaR, and stress testing frameworks that Lume-Fin's Risk Invariants (RI-1–RI-6) govern. Basel III's internal ratings-based (IRB) framework [BIS, 2017] establishes the model validation and documentation requirements that Lume-Fin's certificate chain addresses.
>
> **Post-hoc Explainability in Finance.** Ribeiro et al. [2016] (LIME) and Lundberg & Lee [2017] (SHAP) are used in financial AI for credit decision explanation. As with Lume-Med, Lume-Fin's explainability is generated during governance — deterministically — rather than post-hoc. This distinction matters for regulatory compliance: ECOA's adverse action notice requirements need specific, consistent reasons, not statistically approximate ones.
>
> **Multi-Agent Financial Systems.** Farmer & Foley [2009] and Turrell [2016] survey agent-based models in macroeconomics and finance, documenting how multi-agent financial systems produce emergent, nondeterministic behavior. Lume-Fin's arbitration classes are designed to impose deterministic governance on exactly these types of multi-model, multi-agent financial decision systems.

**Add to References:**
> Barocas, S., Hardt, M., & Narayanan, A. (2019). *Fairness and Machine Learning: Limitations and Opportunities*. fairmlbook.org.
>
> Mehrabi, N., Morstatter, F., Saxena, N., Lerman, K., & Galstyan, A. (2021). A Survey on Bias and Fairness in Machine Learning. *ACM Computing Surveys*, 54(6), 1–35.
>
> McNeil, A. J., Frey, R., & Embrechts, P. (2015). *Quantitative Risk Management: Concepts, Techniques and Tools*. Princeton University Press.
>
> BIS (2017). Basel III: Finalising Post-crisis Reforms. Bank for International Settlements.
>
> Farmer, J. D., & Foley, D. (2009). The economy needs agent-based modelling. *Nature*, 460(7256), 685–686.

---

### RELATED WORK — Lume-Ops

> **Related Work**
>
> **Functional Safety Standards.** IEC 61508 [IEC, 2010] establishes Safety Integrity Levels (SIL 1–4) for programmable electronic safety systems. ISO 13849 [ISO, 2015] applies this framework to machinery safety, defining Performance Levels (PL a–e) for safety-related control system components. ISO 26262 [ISO, 2018] covers functional safety for automotive systems. These standards govern the certified safety control layer in industrial systems. Lume-Ops operates at the AI governance layer above this control layer — validating AI proposals before they reach IEC 61508-compliant safety controllers (see Section 1.2, Relationship to Functional Safety Standards).
>
> **The Simplex Architecture.** Sha [2001] introduces the Simplex Architecture — a formally verified safety controller that can preempt an untrusted high-performance controller in real-time systems. Simplex is the foundational prior work for the concept of a deterministic safety monitor that overrides an AI or adaptive controller. Lume-Ops extends this concept to AI governance in operational environments: where Simplex provides a static, pre-verified safety controller at the firmware layer, Lume-Ops provides a dynamic, certificate-anchored governance pipeline at the AI output layer.
>
> **Runtime Verification.** Falcone et al. [2012] provide a comprehensive framework for runtime verification — monitoring system behavior against formal specifications at runtime. Lume-Ops' invariant evaluation and LedgerGuardian implement a form of runtime verification where every AI proposal is verified against the operational invariant specification before any physical action is taken.
>
> **Industrial AI Governance.** ISO/IEC TR 24028 [ISO/IEC, 2020] surveys trustworthiness in AI systems, and ISO/IEC 42001 [ISO/IEC, 2023] establishes an AI management system standard. These standards define governance requirements at an organizational level. Lume-Ops provides the technical substrate that satisfies these organizational requirements at the system level.
>
> **Multi-Robot Coordination.** Parker [2008] surveys multi-robot systems, documenting the coordination, communication, and conflict resolution challenges in multi-robot environments. Lume-Ops' Class IV and Class V arbitration directly address the conflict resolution problem Parker identifies, providing a deterministic, certificate-anchored resolution mechanism in place of the probabilistic approaches common in multi-robot literature.

**Add to References:**
> IEC (2010). IEC 61508: Functional Safety of Electrical/Electronic/Programmable Electronic Safety-related Systems. International Electrotechnical Commission.
>
> ISO (2015). ISO 13849: Safety of Machinery — Safety-Related Parts of Control Systems. International Organization for Standardization.
>
> Sha, L. (2001). Using Simplicity to Control Complexity. *IEEE Software*, 18(4), 20–28.
>
> Falcone, Y., Fernandez, J.-C., & Mounier, L. (2012). What can you verify and enforce at runtime? *International Journal on Software Tools for Technology Transfer*, 14(3), 349–382.
>
> Parker, L. E. (2008). Multiple Mobile Robot Systems. In B. Siciliano & O. Khatib (Eds.), *Springer Handbook of Robotics*, 921–941.

---

### RELATED WORK — Lume-X

> **Related Work**
>
> **Multi-Agent Systems Foundations.** Wooldridge [2009] and Shoham & Leyton-Brown [2009] provide the canonical foundations of multi-agent systems theory, including agent architectures, interaction protocols, and game-theoretic coordination. Lume-X builds on these foundations by replacing probabilistic coordination mechanisms with deterministic, certificate-anchored alternatives.
>
> **Consensus Protocols.** Lamport's Paxos [1998] and its variants (Raft [Ongaro & Ousterhout, 2014], PBFT [Castro & Liskov, 1999]) provide fault-tolerant agreement protocols for distributed systems. These protocols guarantee that agents agree on a value but do not govern how each agent reasoned to that value. Lume-X addresses the reasoning layer: agents must not only agree but must produce individually deterministic reasoning traces and collectively verifiable certificates. Agreement without deterministic cognition is insufficient for DMAC compliance.
>
> **FIPA Standards.** The FIPA Agent Communication Language [FIPA, 2002] defines a standardized multi-agent messaging protocol widely used in production MAS frameworks such as JADE [Bellifemine et al., 2007]. FIPA-ACL provides performative semantics but lacks certificate anchoring, deterministic ordering, and replay capability. Lume-X is not FIPA-ACL compatible by design; an adapter layer can bridge FIPA-ACL agents into Lume-X governance.
>
> **Contemporary Multi-Agent Frameworks.** AutoGen [Wu et al., 2023] and related LLM-based multi-agent frameworks enable agent collaboration through natural language exchange. These systems are powerful but fundamentally nondeterministic: agent decisions depend on LLM sampling, message history, and tool availability in ways that cannot be replayed. Lume-X provides the governance substrate that could, in principle, sit above AutoGen-style orchestration layers to enforce DMAC compliance on their collective outputs.
>
> **AI Safety and Governance.** Amodei et al. [2016] survey concrete problems in AI safety, including specification, robustness, and oversight. Lume-X addresses the oversight problem specifically for multi-agent collectives: how to maintain human oversight of collective AI behavior when no individual agent is solely responsible for a collective decision. The certificate chain provides the auditability mechanism that makes collective AI oversight tractable.

**Add to References:**
> Wooldridge, M. (2009). *An Introduction to MultiAgent Systems* (2nd ed.). Wiley.
>
> Shoham, Y., & Leyton-Brown, K. (2009). *Multiagent Systems: Algorithmic, Game-Theoretic, and Logical Foundations*. Cambridge University Press.
>
> Ongaro, D., & Ousterhout, J. (2014). In Search of an Understandable Consensus Algorithm. *USENIX ATC*, 305–319.
>
> Castro, M., & Liskov, B. (1999). Practical Byzantine Fault Tolerance. *OSDI*, 173–186.
>
> Wu, Q., et al. (2023). AutoGen: Enabling Next-Gen LLM Applications via Multi-Agent Conversation. *arXiv*:2308.08155.
