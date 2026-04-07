# Lume Papers — Reviewer Pushback Response Handoff

**Purpose:** Every substantive concern a peer reviewer is likely to raise, organized by paper, with the specific text change or addition needed to address it. This is a surgical fix list — not structural rewrites, but targeted responses to anticipated criticism. The agent should work through these in order within each paper.

---

## How to Use This Document

For each item:
- **The Concern** — what a reviewer will write
- **The Fix** — the specific text change, addition, or clarification needed
- **Location** — which section to modify

---

## Cross-Paper Issues (All Six Papers)

### C-1: "Validated" vs. "Demonstrated"

**The concern:** Reviewers in medical, financial, and engineering venues will object to the word "validated" when describing results produced by the same author who designed the system. Validation implies independent reproduction.

**The fix:** Global search and replace across all six papers:
- `validated across` → `demonstrated across`
- `has been validated` → `has been demonstrated`  
- `validates the DAIGS approach` → `demonstrates the DAIGS approach`
- `Lume-Med, Lume-Fin, and Lume-Ops validate` → `Lume-Med, Lume-Fin, and Lume-Ops demonstrate`

Keep "validated" only in its mathematical sense (e.g., "validates the proposal against invariants") where it means a specific technical operation, not an independent scientific claim.

---

### C-2: "First" Claims Need Hedging

**The concern:** "Lume-X introduces the first deterministic multi-agent cognition substrate" — "first" claims require either a prior art search or a hedge. Reviewers in established fields will immediately ask what prior work was surveyed.

**The fix:** Add "to the best of our knowledge" to every "first" claim across all six papers. Also acceptable: "the first formally specified" or "the first certificate-anchored" — which are narrower and easier to defend. Specific instances:
- Lume: "the first language where voice-to-code is architecturally natural" → "to our knowledge, the first language where voice-to-code is a compiler-level feature rather than an external integration"
- Lume-Med: "the first deterministic governance substrate" → "the first formally specified deterministic governance substrate, to our knowledge"
- Lume-X: "the first deterministic multi-agent cognition substrate" → "to our knowledge, the first multi-agent framework to enforce replay-identical collective cognition through certificate-anchored arbitration"

---

### C-3: "Conceptual" Examples Cannot Appear in Venue Submissions

**The concern:** Every domain paper (Lume-Med, Lume-Fin, Lume-Ops, Lume-X) explicitly labels every example as "(Conceptual)." A reviewer will write: "The paper presents no empirical results and all examples are synthetic. It is impossible to assess whether the proposed system is implementable."

**The fix:** Before any conference submission, each domain paper needs at minimum one example that is not labeled conceptual. The minimum viable approach is to run the Lume-V pipeline against a toy dataset and show real JSON certificate output. Specific requirements:
- The example must show a real LumeVProposal structure with actual values
- The LTC certificate output must be real (actual hash, actual signature structure)
- Remove the word "Conceptual" from all example labels
- Replace "(Conceptual)" with the source of the data: "(Simulated quadrotor data)" or "(Synthetic credit dataset)" — "synthetic" is acceptable; "conceptual" signals the system has never run

---

### C-4: Single-Author Preprints with No External Review Signal

**The concern:** All six papers are single-author, from the same institution, with no acknowledgment of external review or collaboration. This is not disqualifying, but it is a flag. Reviewers may wonder if the work has received any external scrutiny.

**The fix:** Add to the Acknowledgments section of each paper: "The author thanks [any colleagues, online reviewers, or domain experts who read any draft] for feedback on earlier versions of this work." If no one has read drafts, this fix cannot be applied — but it should be considered. Even one domain expert reviewing Lume-Med or Lume-Fin before submission significantly changes the reception.

---

## Lume (Compiler) — `10.5281/zenodo.19441103`

### L-1: "2,331 tests" Claim Must Be Verifiable

**The concern:** "2,331 tests across 62 test files with 0 failures" appears in the abstract, metrics table, and description. If a reviewer or reader attempts to reproduce this by cloning the GitHub repo and running the test suite, the number must match. If it doesn't match — or if the tests don't run — this becomes scientific misconduct territory, not just a minor error.

**The fix:** 
1. Run `npm test` (or equivalent) in the Lume repo right now. Note the actual count.
2. If it matches: add a footnote with the exact command to reproduce: "Test suite reproducible via `npm test` in the root of `github.com/cryptocreeper94-sudo/lume` at commit `[hash]`."
3. If it doesn't match: update the number in the paper to reflect reality. Do not leave a number in the abstract that cannot be reproduced.

**Location:** Abstract, Section 9 (Implementation Metrics table)

---

### L-2: Layer 7 AI Fallback — "Normalized" Qualifier Is Load-Bearing

**The concern:** The paper claims 6 of 7 pipeline layers are deterministic, with AI only at Layer 7. But Layer 7 uses "a probabilistic model for intent classification." The asterisk says "output is immediately normalized into deterministic AST structures." A reviewer will ask: if the AI classifies intent probabilistically, what prevents two different classifications of the same ambiguous input from producing two different ASTs?

**The fix:** Add one paragraph to Section 4.2 (Architectural Guarantee) explaining normalization:

> "Layer 7's AI model produces a probability distribution over intent categories. The normalization step selects the maximum-probability intent class — a deterministic argmax operation. This means that for any given probability distribution output from the AI model, there is exactly one normalized output. Nondeterminism is confined to the AI model's internal computation; the bridge between AI output and AST construction is deterministic. Two calls to Layer 7 with identical input will produce the same argmax result if and only if the AI model's output is identical — which is why Layer 7 is invoked in under 2% of compilation events and the Clarification Loop provides a 100% deterministic bypass."

**Location:** Section 4.2

---

### L-3: Voice Homophone Resolution — Context Rules Underspecified

**The concern:** The paper states "write the data" is resolved differently depending on file vs. database context. How is context determined? If context determination fails, which interpretation wins? A reviewer will ask for the specification of the context rules.

**The fix:** Add a table to Section 5.3 with the context signals for each of the 10 homophone pairs:

| Pair | Signal for Interpretation A | Signal for Interpretation B | Default |
|---|---|---|---|
| write/right | Prior `file`, `save`, or `path` token in scope | Prior `direction`, `correct`, or `navigation` token | write (more common in code context) |
| new/knew | Creation verb in scope | Past-tense narrative context | new |
| ... | ... | ... | ... |

Add: "When no context signal is present, the default interpretation is the statistically dominant programming usage. All defaults are listed in the table. The default is always deterministic — the same input produces the same interpretation."

**Location:** Section 5.3

---

### L-4: Synthetic Organisms Section — Scope Defense

**The concern:** "The paper jumps from a mature compiler with 16,500 LOC to a conceptual $50 robot finger prototype. This belongs in a separate paper."

**The fix (two options):**

Option A (preferred for venue submission): Move Section 8 (Synthetic Organisms) to a standalone companion paper or an appendix. In the main body, replace it with a forward reference: "The Lume runtime's self-sustaining architecture extends naturally to cyber-physical systems. A companion paper (Synthetic Organisms: A Lume Runtime Taxonomy, in preparation) develops this extension formally."

Option B (if keeping in same paper): Add an explicit scope paragraph at the start of Section 8: "This section presents the theoretical framework for Synthetic Organisms as a natural extension of the Lume runtime's deterministic, self-sustaining architecture. The prototype described is a research roadmap item, not an implemented system. Readers primarily interested in the Lume language and compiler may treat this section as a forward-looking theoretical extension."

**Location:** Section 8 introduction

---

## Lume-V — `10.5281/zenodo.19433981`

### V-1: 24 Decisions Is Not a Sufficient Evaluation

**The concern:** "The evaluation consists of 24 decisions in a simulated environment. This is insufficient to make claims about governance performance, latency, or reliability. Standard machine learning and systems evaluation requires hundreds or thousands of test cases."

**The fix:** Expand Section 10 (Evaluation) before any venue submission. Minimum targets:
- Total decisions: 500 minimum (24 is not defensible)
- Introduce at least 3 fault types (not just timing faults — add sensor noise and out-of-distribution inputs)
- Add a baseline condition: same AI without Lume-V governance, measuring unsafe commands that would have reached actuators
- Add a comparison: what does SHAP/LIME take to produce an explanation on the same decisions? Compare to 4ms
- Run on at least 2 different hardware platforms to verify "bit-identical" claim

Until this expansion is done, the paper should not be submitted to any venue. This is the single highest-priority fix in the entire series.

**Location:** Section 10 (full rewrite)

---

### V-2: "Bit-Identical Replay" Is Hardware-Dependent

**The concern:** "The authors claim 24/24 bit-identical replay verification. However, bit-identical reproduction is hardware-dependent for any computation involving floating-point arithmetic. The paper does not specify the hardware, OS, or software environment."

**The fix:** Add a dedicated subsection 10.4 — "Bit-Identical Replay: Scope and Conditions":

> "Bit-identical replay in Lume-V applies specifically to the governance layer, not to the underlying AI model. The governance pipeline operates exclusively on: (1) canonical JSON structures (RFC 8785), which are platform-independent; (2) SHA3-256 hash computation, which is deterministic across all conforming implementations; (3) Ed25519 signature verification, which is deterministic; and (4) integer comparison operations in invariant evaluation. No floating-point arithmetic is used in the governance layer. The AI model's output — which may involve floating-point computation — is normalized into a canonical LumeVProposal before entering the governance pipeline. Replay reconstructs the governance decision from the certificate, not from the AI model output. The experimental environment was: [OS], [CPU], [Node.js version], [dependency versions at commit hash]."

**Location:** New Section 10.4

---

### V-3: No Comparison Baseline

**The concern:** "The paper reports 0 unsafe commands reaching actuators. Without a baseline condition (same AI without governance), it is impossible to assess what Lume-V contributes. Perhaps the AI system would have produced 0 unsafe commands anyway."

**The fix:** Add baseline condition to the experiment: run the same RL drone agent with the same fault injection but without Lume-V governance. Report how many unsafe commands reach the actuators in the baseline. The comparison is: Lume-V prevented X unsafe commands; without Lume-V, Y unsafe commands would have reached actuators. Y must be > 0 for the result to be meaningful. This is a straightforward experiment to add.

**Location:** Section 10 — add Table showing baseline vs. governed conditions

---

### V-4: Simplex Architecture Must Be Cited

**The concern:** A reviewer with safety-critical systems background will immediately recognize that Lume-V's core concept — a certified monitor that can override an AI controller — is related to the Simplex Architecture (Sha et al., 2001). Not citing it signals either unfamiliarity with the literature or deliberate omission, both of which damage credibility.

**The fix:** Add to Section 12 (Related Work):

> "The Simplex Architecture [Sha et al., 2001] provides a formally verified safety controller that can override an untrusted high-performance controller in real-time systems. Lume-V extends this concept to AI governance: where Simplex provides a static, pre-verified safety controller, Lume-V provides a dynamic, certificate-anchored governance pipeline that evaluates AI outputs against configurable invariants and produces cryptographic evidence of each governance decision. Lume-V is not a replacement for Simplex in hardware-safety-rated systems; rather, it operates at the AI governance layer above the control layer where Simplex applies."

Citation: Sha, L. (2001). Using Simplicity to Control Complexity. *IEEE Software*, 18(4), 20–28.

**Location:** Section 12 (Related Work)

---

### V-5: Multi-Agent Latency Overhead Not Characterized

**The concern:** "The paper notes that multi-agent arbitration adds latency proportional to the number of agents (Limitations, Section 13), but provides no data on this overhead. The evaluation only tests a single-agent scenario."

**The fix:** Either (a) add a multi-agent latency experiment to Section 10, measuring governance overhead at 2, 4, and 8 agents, or (b) add a subsection to the Limitations (Section 13) with a theoretical analysis: "For n agents, arbitration requires O(n²) certificate exchanges. At 4ms per single-agent governance cycle and network round-trip times of [X]ms in a local environment, a 4-agent arbitration is estimated to complete in [Y]ms. Empirical multi-agent evaluation is deferred to future work." Option (b) is faster and still addresses the concern.

**Location:** Section 13 (Limitations) or Section 10 (Evaluation)

---

## Lume-Med — `10.5281/zenodo.19434970`

### M-1: Normalization Boundary — How Is Confidence Extracted From a Heatmap?

**The concern:** "The system claims to normalize AI outputs from radiology models, which typically produce heatmaps, segmentation masks, or multi-class probability distributions — not a single confidence scalar. The paper does not specify how `ImageDiagnosticAdapter` extracts a `confidence` value from these output types."

**The fix:** Add a subsection to Section 5.1 (Layer 1 — Medical Domain Input Normalization):

> "For image-based models (ImageDiagnosticAdapter), confidence is extracted as follows: for classification heads, the maximum softmax probability; for segmentation models, the mean foreground confidence across the predicted region; for detection models, the per-instance confidence of the highest-scoring prediction. The adapter specification requires that domain deployers define extraction logic for their specific model architecture. This is a deployment-time responsibility, not a governance-layer responsibility. The invariant (I₁) evaluates the extracted confidence, whatever its source — the governance layer does not interpret the extraction method."

This is honest about what the system does and does not do. It also moves the responsibility to the deployer, which is architecturally correct.

**Location:** Section 5.1

---

### M-2: Confidence as Universal Comparable Scalar

**The concern:** "Invariant I₁ treats confidence as a universal comparable scalar with a fixed domain threshold. However, confidence scores are model-specific and not comparable across architectures. A well-calibrated model at 0.62 may be more reliable than an overconfident model at 0.88."

**The fix:** Add a calibration caveat to Section 5.2 (Layer 2 — Safety Invariant Engine):

> "Invariant I₁ evaluates confidence against a domain-specific threshold (T_domain). This threshold must be calibrated per model — a threshold appropriate for a well-calibrated classifier is not necessarily appropriate for an overconfident ensemble. Lume-Med does not perform inter-model confidence calibration; it enforces that whatever confidence value the adapter reports must meet the threshold. Deployers are responsible for ensuring that their adapter's confidence extraction is calibrated to the intended threshold semantics. Platt scaling, isotonic regression, or similar post-hoc calibration techniques should be applied before deployment [Guo et al., 2017]."

Citation to add: Guo, C., et al. (2017). On Calibration of Modern Neural Networks. *ICML*.

**Location:** Section 5.2, after Invariant 1 definition

---

### M-3: Proof Sketches Are Too Thin

**The concern:** "The proof sketches in Section 6 are informal to the point of being trivial. 'Confidence is a scalar. Threshold comparison is deterministic' is a statement about the concept, not a proof about the implementation."

**The fix:** Reframe Section 6 explicitly as proof sketches (not proofs) and add one line to each that connects the concept to the implementation:

> "**Invariant 1 — Confidence Threshold Integrity (Sketch):**
> The adapter produces `P.confidence ∈ [0,1]`. The threshold `T_domain` is a real constant configured at deployment time. The comparison `P.confidence ≥ T_domain` is a deterministic real comparison with no branching based on runtime state. The InvariantEvaluator returns `true` if and only if `P.confidence ≥ T_domain`. This evaluation is stateless, side-effect-free, and produces the same result for the same inputs under any conforming implementation. ∎ (Sketch)"

Repeat this pattern for all seven invariants, adding the implementation-level bridge sentence. This is still a sketch, but it's a sketch that tells a reviewer you understand what a proof requires.

**Location:** Section 6

---

### M-4: No Real Examples — Remove "(Conceptual)" Label

**The concern:** See C-3 above. Specifically for Lume-Med: run the Lume-V pipeline against a synthetic radiology proposal (confidence: 0.62, model: synthetic-classifier-v1, domain: radiology) and show the actual JSON output and certificate. This takes less than an hour to produce and transforms the paper from "pure architecture" to "demonstrated architecture."

**Location:** Section 7.2 (Example — Radiology Model)

---

## Lume-Fin — `10.5281/zenodo.19435715`

### F-1: RI-1 Stability Invariant vs. Nondeterministic Models

**The concern:** "RI-1 requires that risk scores remain stable under repeated evaluation of identical inputs. Many production risk models — Monte Carlo simulations, random forests with stochastic sampling, ensemble methods — are deliberately nondeterministic. RI-1 as written would reject the outputs of these models on every evaluation."

**The fix:** Add a clarifying paragraph to Section 6.1 (Risk Invariants, RI-1):

> "RI-1 applies to the normalized proposal output entering the governance layer — not to the underlying risk model. A Monte Carlo simulation may produce different raw samples on each run; the risk model's adapter is responsible for aggregating these samples into a canonical normalized output (e.g., mean VaR, 95th percentile loss, median credit score) before forming a LumeVProposal. The stability invariant evaluates whether the normalized, adapter-produced output is stable — not whether the underlying model is deterministic. This is a deployment-time adapter responsibility: deployers of nondeterministic risk models must design adapters that produce stable normalized outputs (e.g., by using fixed random seeds for Monte Carlo, or by reporting distributional statistics rather than individual samples)."

**Location:** Section 6.1, after RI-1 definition

---

### F-2: RI-2 Monotonicity Invariant Oversimplifies Credit Risk

**The concern:** "RI-2 states 'higher debt → higher risk.' In practice, debt-to-income ratio, collateral, duration, credit history, and asset quality all interact. A simple monotonicity invariant on absolute debt would incorrectly reject many well-validated risk models."

**The fix:** Revise the RI-2 definition to apply to normalized risk factors, not absolute values:

> "**RI-2: Monotonicity Invariant.** Risk classifications must move in the correct direction relative to canonicalized risk factor changes, as defined by the domain deployer. For credit risk: an increase in debt-to-income ratio must not produce a decrease in risk score; an increase in collateral coverage must not produce an increase in risk score. The specific monotonicity rules are deployment-defined — Lume-Fin enforces that they are specified and that model outputs conform to them. This invariant does not mandate that absolute debt level monotonically increases risk; it mandates that the deployer-defined risk factor relationships are respected."

**Location:** Section 6.1, RI-2 definition

---

### F-3: 15 Regulatory Frameworks — None Demonstrated in Detail

**The concern:** "The paper claims alignment with 15 regulatory frameworks. However, no specific regulatory article or requirement is cited. This is asserted, not demonstrated."

**The fix:** Pick three frameworks and add a specific alignment table. Do not try to address all 15 — depth on three is more credible than breadth on 15. Suggested:

| Framework | Specific Requirement | Lume-Fin Mechanism |
|---|---|---|
| ECOA (Equal Credit Opportunity Act) | Adverse action notices must include specific reasons for denial | BF-1–BF-3 invariants + LTC-Fin explainability trace produces machine-readable denial rationale per 15 U.S.C. § 1691 |
| EU AI Act (2024) Art. 13 | High-risk AI systems must provide transparency to affected persons | LTC-Fin narrative trace satisfies Art. 13(1) transparency requirement |
| Basel III (CRR Art. 144) | IRB models must be validated and documented | RI-5 Cross-Model Consistency + RI-6 Regulatory Alignment + LTC-Fin certificate chain satisfies CRR Art. 144(1)(d) |

Then add a footnote: "Full alignment mapping for all 15 frameworks referenced in the abstract is available as a supplementary document." This is honest and satisfies the reviewer without requiring the paper to triple in length.

**Location:** New Section mapping regulatory alignment, after Section 5

---

### F-4: Fairness Invariant BF-1 — Protected Attributes Must Be Specified

**The concern:** "BF-1 states decisions must not vary based on protected attributes. But the protected attribute set is jurisdiction-specific. ECOA's protected classes differ from GDPR's special categories differ from California's CCPA definitions. Which applies?"

**The fix:** Add one sentence to BF-1:

> "The protected attribute set is deployment-defined and jurisdiction-specific. Lume-Fin provides invariant enforcement; the deployer is responsible for specifying the protected attribute list in accordance with applicable law. A reference set covering ECOA (race, color, religion, national origin, sex, marital status, age, receipt of public assistance), EU AI Act high-risk categories, and GDPR special categories is provided in Appendix A."

Then add Appendix A with this reference set.

**Location:** Section 6.4, BF-1

---

## Lume-Ops — `10.5281/zenodo.19440680`

### O-1: IEC 61508 and ISO 13849 Not Addressed

**The concern:** "The paper defines safety invariants for industrial machinery (machine guarding — SI-331, collision avoidance — SI-204) without any reference to IEC 61508 (functional safety) or ISO 13849 (safety of machinery). These are the foundational standards for exactly the systems Lume-Ops targets. The omission suggests unfamiliarity with the field."

**The fix:** Add to the Related Works section (to be written — see lume-papers-handoff.md):

> "Functional safety standards — IEC 61508, ISO 13849, and ISO 26262 (automotive) — govern the hardware and software safety functions in industrial machinery. These standards define Safety Integrity Levels (SIL 1–4) and Performance Levels (PL a–e) for safety functions. Lume-Ops does not replace these standards. It operates at the AI governance layer: Lume-Ops validates AI-generated proposals before they reach the certified safety control layer that implements IEC 61508-compliant safety functions. The Safety Evaluator's output (approve/override/escalate) is an input to the safety PLC or safety relay — not a replacement for it. Lume-Ops is to IEC 61508 what a pre-flight checklist is to FAA regulations: a structured verification process that feeds a safety-certified system."

Also add a note in Section 6.1 (Safety Invariants): "Safety invariant codes (SI-112, SI-204, SI-331, etc.) are Lume-Ops internal identifiers. They do not correspond to IEC 61508 SIL assignments or ISO 13849 category classifications, which are determined by the hardware/software safety function design, not by the AI governance layer."

**Location:** Related Works (new), Section 6.1 note

---

### O-2: FailSafeController Escalation Criteria Missing

**The concern:** "Five escalation levels are defined but the conditions for escalating between levels are not specified. When does a machine freeze become a line freeze?"

**The fix:** Add a decision table to Section 5 or Section 7 (System Governance Layer):

| From Level | To Level | Escalation Trigger |
|---|---|---|
| Machine Freeze | Line Freeze | (a) Freeze duration exceeds T_line threshold, OR (b) 2+ machines in same cell are frozen simultaneously, OR (c) frozen machine is on the critical path of active WIP |
| Line Freeze | Zone Freeze | (a) 2+ lines in zone are frozen, OR (b) zone-level safety invariant (SI-801, SI-812) is triggered, OR (c) LedgerGuardian detects certificate chain corruption spanning multiple lines |
| Zone Freeze | Facility Freeze | (a) 3+ zones are frozen, OR (b) Regulatory invariant violation (OSHA-reportable incident threshold), OR (c) human injury confirmed by safety sensor cluster |
| Facility Freeze | System-Wide Freeze | (a) 2+ facilities are in Facility Freeze, OR (b) Governance kernel violation detected, OR (c) explicit system-wide safety signal received |

Add: "All thresholds (T_line, etc.) are deployment-configured. Default values are specified in Appendix B."

**Location:** New subsection in Section 5 or Section 7

---

### O-3: Confidence Score Purpose Must Be Stated

**The concern:** "Each evaluator produces a Boolean result plus a confidence score, but the paper says 'any unsafe status immediately triggers Class I Arbitration.' If the Boolean drives the decision, what is the confidence score used for?"

**The fix:** Add one sentence to Section 6 (after the Invariant Guarantee paragraph):

> "The Boolean result determines the arbitration trigger: any `false` (unsafe) result immediately escalates to the corresponding arbitration class, regardless of confidence. The confidence score serves three secondary functions: (1) it is included in the arbitration ordering function σ (Section 7.3) to rank competing `true` proposals by reliability; (2) it is reported in the Supervisor-Facing Explanation (SFE) to convey evaluator certainty to engineers; and (3) it is logged in the LedgerGuardian for post-incident trend analysis. A low-confidence `true` result does not trigger arbitration but is flagged in the SFE and logged for drift monitoring."

**Location:** Section 6, after Invariant Guarantee paragraph

---

### O-4: SHA3-256 vs SHA-256 — Unexplained Change From Earlier Papers

**The concern:** "The first paper (Lume) used SHA-256. Lume-Ops uses SHA3-256. This inconsistency is not explained. If the DAIGS certificate standard is meant to be consistent across verticals, the hash algorithm should be the same."

**The fix:** Two options:
- Option A: Standardize to SHA3-256 across all papers and add a footnote to the Lume paper: "Subsequent versions of the LTC certificate standard (v1.1+) upgrade the hash algorithm to SHA3-256 for improved collision resistance. SHA-256 certificates issued under LTC v1.0 remain valid."
- Option B: Standardize to SHA-256 in Lume-Ops to match the earlier papers and note it as LTC v1.0 compliant.

Option A is the better technical choice (SHA3-256 is more resistant to length-extension attacks). In that case, update the Lume paper's "certified at birth" section to reference LTC v1.1.

**Location:** Lume Section 6.4 (Security Certificate), Lume-Ops Section 4 (Certificate Layer), and a consistent note in Lume-Med and Lume-Fin.

---

### O-5: 13 Domains — Each Is Too Thin

**The concern:** "The paper claims to govern 13 domains including manufacturing, logistics, warehousing, robotics, supply chain, fleet, predictive maintenance, energy, construction, industrial IoT, aviation ground ops, maritime, and emergency response. Each domain receives approximately one paragraph. A reviewer in any of these fields will find the domain treatment superficial."

**The fix:** In the abstract and introduction, narrow the claimed scope to the three most developed domains: manufacturing, logistics, and robotics. Describe the architecture as "generalizable to" the remaining 10 domains, and add: "Domain-specific instantiations for the full set of 13 domains are deferred to companion technical reports."

This is not dishonest — the architecture does generalize. But claiming 13 domains as primary scope when only 3 are developed creates an expectation the paper cannot meet.

**Location:** Abstract, Section 1.2, Section 3 (Operational Domains)

---

## Lume-X — `10.5281/zenodo.19443968`

### X-1: 60 Cognitive Blocks — Count Must Match Paper Content

**The concern:** "The abstract claims 60 cognitive blocks, but many listed in the scope (forecasting, scenario planning, strategy, policy, trust, reputation, credentialing, threat detection) are not developed in the paper."

**The fix:** Count the blocks actually defined with specification-level detail in the paper. If the count is lower than 60, update the abstract to the real number. Alternatively, add stub sections (2–3 sentences each) for the underdeveloped blocks:

> "**Block 52 — Deterministic Trust and Reputation:** Each agent maintains a deterministic trust score for each peer agent based on certificate verification success rate, safety invariant compliance history, and arbitration alignment over a configurable time window. Trust scores are certificate-anchored and do not use probabilistic reputation models. Full specification deferred to Lume-X v2.0."

This signals that the system is designed, not forgotten, while being honest about completion level.

**Location:** Abstract (update count), Main body (add stubs for underdeveloped blocks)

---

### X-2: "Bit-Exact Reconstruction" — Same Issue as Lume-V

**The concern:** Same as V-2. Bit-exact replay is hardware-dependent for floating-point computations.

**The fix:** Add the same clarifying paragraph as prescribed for Lume-V (see V-2 above), adapted for Lume-X context:

> "Bit-exact reconstruction in Lume-X applies to the cognitive governance layer, which operates exclusively on canonical JSON structures, SHA3-256 hashes, Ed25519 signatures, and integer comparisons. Agent cognitive state (S in the agent tuple) is represented as a canonical JSON document. All cross-agent communication uses RFC 8785 canonical serialization. Underlying AI model computations — which may involve floating-point arithmetic — are normalized through Lume-V adapters before entering the Lume-X cognitive layer. Replay reconstructs the governance decisions and agent state transitions from the certificate chain, not from AI model outputs."

**Location:** Section 3 (DMAC definition), or a dedicated subsection on replay semantics

---

### X-3: "No Quorum" Design — Liveness Concern

**The concern:** "The paper prohibits quorum and requires total deterministic convergence. This raises a liveness concern: what happens when one agent is offline, slow, or malicious? In distributed systems, requiring all-node agreement (no quorum) makes the system vulnerable to a single point of failure or a single Byzantine agent that refuses to converge."

**The fix:** Add a paragraph addressing liveness to Section 6.3 (Deterministic Negotiation Model):

> "The no-quorum requirement does not mean all agents must be online for the system to operate. Lume-X defines agent eligibility as a precondition for participation in collective cognition (Section 6.3, Phase 1 — Eligibility Validation). An offline, unresponsive, or certificate-invalid agent fails eligibility and is excluded from the negotiation cycle. The minimum eligible group size for collective decision is configurable per deployment (default: all eligible agents). If no eligible quorum can be formed, the society enters a deterministic freeze rather than proceeding with partial agreement — safety-dominant behavior is preserved at the cost of liveness. This is a deliberate design choice: in safety-critical environments, a wrong collective decision is worse than no decision."

**Location:** Section 6.3

---

### X-4: FIPA Agent Communication Standards Must Be Cited

**The concern:** "The paper does not cite FIPA (Foundation for Intelligent Physical Agents) agent communication language standards, which have defined multi-agent communication protocols since the 1990s. Omitting this foundational prior work is a significant gap."

**The fix:** Add to Related Works section:

> "The FIPA Agent Communication Language (ACL) [FIPA, 2002] defines a standardized messaging protocol for multi-agent systems, including performatives (inform, request, propose, agree, refuse) and content language specifications. Lume-X communication is not FIPA-ACL compliant by design: FIPA-ACL messages are not signed, not certificate-anchored, and permit asynchronous delivery without deterministic ordering. Lume-X replaces performative semantics with certificate-anchored proposal exchange, eliminating message authenticity ambiguity and enabling deterministic replay. Systems requiring FIPA-ACL interoperability can bridge to Lume-X through an adapter that wraps incoming FIPA messages in LumeVProposal structures."

Citation: FIPA (2002). FIPA ACL Message Structure Specification. Foundation for Intelligent Physical Agents. http://www.fipa.org/specs/fipa00061/

**Location:** Related Works (to be written)

---

### X-5: Biological Mapping in Main Body

**The concern:** "The biological mapping (nervous system, muscular system, circulatory system, etc.) appears for the third time across this series and occupies main body space in a formal systems paper. It reads as rhetorical rather than technical."

**The fix:** Move Section 10.5 (Synthetic Organism Fusion) to an appendix titled "Appendix A — Conceptual Bridge: Lume-X/Lume-Ops as a Synthetic Organism." Add a forward reference in the main body: "The combined Lume-X/Lume-Ops system exhibits structural analogies to biological organism architectures; see Appendix A."

This preserves the content (which is genuinely evocative and useful for communicating to a non-specialist audience) while removing it from the formal paper structure.

**Location:** Move Section 10.5 to Appendix A

---

## Summary Priority Table

| Priority | Fix | Paper(s) | Effort |
|---|---|---|---|
| 🔴 1 | Expand Lume-V evaluation to 500+ decisions with baseline | Lume-V | High |
| 🔴 2 | Add "bit-identical replay: scope and conditions" section | Lume-V, Lume-X | Low |
| 🔴 3 | Add Simplex Architecture citation and engagement | Lume-V | Low |
| 🔴 4 | Verify test count (2,331) against running test suite | Lume | Low |
| 🔴 5 | Add IEC 61508 positioning paragraph | Lume-Ops | Low |
| 🟡 6 | Replace all "conceptual" example labels with real pipeline output | All domain papers | Medium |
| 🟡 7 | Add calibration caveat to I₁ / RI-1 confidence threshold | Lume-Med, Lume-Fin | Low |
| 🟡 8 | Revise RI-2 Monotonicity Invariant definition | Lume-Fin | Low |
| 🟡 9 | Add FailSafeController escalation decision table | Lume-Ops | Medium |
| 🟡 10 | Add confidence score purpose statement | Lume-Ops | Low |
| 🟡 11 | Add regulatory alignment detail table (3 frameworks in depth) | Lume-Fin | Medium |
| 🟡 12 | Add Layer 7 normalization clarification | Lume | Low |
| 🟡 13 | Add voice homophone context rules table | Lume | Medium |
| 🟡 14 | Add normalization boundary spec to ImageDiagnosticAdapter | Lume-Med | Low |
| 🟡 15 | Add proof sketch implementation bridges | Lume-Med | Medium |
| 🟡 16 | Add FIPA citation and engagement | Lume-X | Low |
| 🟡 17 | Add "no quorum" liveness explanation | Lume-X | Low |
| 🟢 18 | Narrow Lume-Ops scope claim to 3 primary domains | Lume-Ops | Low |
| 🟢 19 | Add 60-block count stubs or update count | Lume-X | Medium |
| 🟢 20 | Move biological mapping to appendix | Lume-X | Low |
| 🟢 21 | Move Synthetic Organisms to appendix or companion paper | Lume | Medium |
| 🟢 22 | Add "to our knowledge" to all "first" claims | All | Low |
| 🟢 23 | Replace "validated" with "demonstrated" everywhere | All | Low |
| 🟢 24 | Standardize SHA3-256 across all papers with version note | All | Low |
