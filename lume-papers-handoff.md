# Lume Academic Papers — Editorial & Submission Handoff

**Author:** Ronald Jason Andrews, DarkWave Studios LLC  
**Date:** April 7, 2026  
**Purpose:** Comprehensive handoff for the agent working in VS Code to get the Lume body of work into submission-ready shape and through a logical venue progression.

---

## The Body of Work — Overview

Six papers. One complete theoretical ecosystem:

| Paper | Zenodo DOI | Status | Layer |
|---|---|---|---|
| Lume (v4) | 10.5281/zenodo.19441103 | Published | 1 — Compiler & runtime |
| Lume-V | 10.5281/zenodo.19433981 | Published (bundled w/ Lume v3) — **holding from formal submission** | 2 — Governance engine |
| Lume-Med | 10.5281/zenodo.19434970 | Published | 5 — Medical DAIGS vertical |
| Lume-Fin | 10.5281/zenodo.19435715 | Published | 6 — Financial DAIGS vertical |
| Lume-Ops | 10.5281/zenodo.19440680 | Published | 4 — Operational DAIGS vertical |
| Lume-X | 10.5281/zenodo.19443968 | Published | 3 — Multi-agent cognition |

**Why Lume-V is being held:** It is the only paper with a real experimental evaluation (drone simulation, 24 decisions, 4ms latency, 0 unsafe commands, 24/24 bit-identical replay). It is the only paper with a real Related Work section and a Limitations section. The evaluation is too small (24 decisions in simulation) to survive peer review scrutiny at a serious venue. The strategy is correct: publish the domain verticals first to establish DAIGS as a demonstrated category, then submit Lume-V with a stronger evidence base that the verticals provide.

---

## 🔴 Cross-Paper Issues — Fix First, Before Anything Else

These affect the entire series and must be resolved before any venue submission.

### 1. DOI Inconsistency — Lume-Ops

Every paper in the series cites Lume-Ops at `10.5281/zenodo.19437982`. The actual live Lume-Ops record is at `10.5281/zenodo.19440680`. These do not match. Every paper that cites Lume-Ops has the wrong DOI in its References section.

**Fix:** Audit every References section in every paper. Update all Lume-Ops citations to `10.5281/zenodo.19440680`. Then push updated versions to Zenodo (Zenodo supports versioning — existing DOIs remain valid and point to latest version).

### 2. Lume-X Paper Body Says "DOI: (pending Zenodo upload)"

Lume-X is live on Zenodo at `10.5281/zenodo.19443968`. The paper body still has the placeholder text from before upload.

**Fix:** Update the Lume-X PDF, re-upload to Zenodo as v2. The DOI remains the same.

### 3. Lume Compiler DOI Fragmentation

Three different Lume DOIs are cited across the series:
- `10.5281/zenodo.19382282` — Lume v2 (cited by Lume-X and Lume-V)
- `10.5281/zenodo.19430898` — Lume v3 (cited by Lume-Med and Lume-Fin)  
- `10.5281/zenodo.19441103` — Lume v4 (the current paper)

The series should cite the current version consistently. Decide whether to cite v4 everywhere (preferred — most current) or v3 (more stable at time of domain paper writing). Either is defensible; inconsistency is not.

**Fix:** Standardize all Lume citations to v4 (`10.5281/zenodo.19441103`) across all papers.

### 4. Missing Related Works in Lume-Med, Lume-Fin, Lume-Ops, and Lume-X

Lume-V is the only paper with a Related Work section. Every domain paper and Lume-X lack one entirely. This is a mandatory section for any peer-reviewed venue. See per-paper sections below for specific citations needed.

### 5. All Domain Paper Examples Are Labeled "(Conceptual)"

Every example in Lume-Med, Lume-Fin, Lume-Ops, and Lume-X is explicitly marked as conceptual. This is honest but means the domain papers have zero empirical content. The Lume-V drone simulation (even at 24 decisions) is the only real evaluation in the series. The domain papers need at minimum one small-scale prototype or simulation result each.

---

## Per-Paper Editorial Notes

### Lume (v4) — `10.5281/zenodo.19441103`

**What's strong:** The cognitive distance framing is the best prose in the series. The progression table (Assembly → C → Python → AI Agents → Lume) is a compelling hook. The 7-layer pipeline with AI only at Layer 7 is architecturally principled.

**What needs work before formal submission:**

1. **Verify the test count independently.** "2,331 tests across 62 test files with 0 failures" — this number appears in the abstract and metrics table. Based on code review of the ecosystem, test counts in many apps are maintained in markdown files rather than running test suites. Before citing this number in any peer-reviewed venue, run the suite and confirm the count. If the real number is different, update it. If it matches, you have proof to cite.

2. **The Synthetic Organisms section (Section 8) is a different paper.** It jumps from a mature, 16,500 LOC compiler to a conceptual $50 robot finger prototype. A peer reviewer at a programming languages venue (PLDI, OOPSLA, ECOOP) will ask why it's in the same submission. Split it out. The compiler paper ends at Section 9 (Implementation Metrics). Synthetic Organisms becomes a companion paper or a section of the Lume-V/Lume-X papers where self-sustaining runtime is more at home.

3. **Add a Related Works section.** Comparisons needed: Intentional Programming (Simonyi, 1995), Programming by Example systems (FlashFill, Gulwani et al.), natural language interfaces to code (Codex, AlphaCode, GitHub Copilot), voice coding tools (Talon, Serenade). The paper currently positions against these in prose but lacks a formal related works. This section would make the cognitive distance contribution much sharper.

4. **Target venue for the compiler:** OOPSLA (Object-Oriented Programming, Systems, Languages & Applications) or SPLASH. Alternatively, the cognitive distance framing positions well for CHI (human-computer interaction) as a position paper. The voice pipeline specifically targets UIST.

---

### Lume-V — `10.5281/zenodo.19433981` — **HOLD FOR EXPANDED EVALUATION**

**Why this is the most important paper in the series:** It is the foundation layer. It has the only real experimental results. It has the only related works. It has the only limitations section. It is the paper that everything else cites.

**Why it is being held and what to do about it:**

The drone simulation (24 decisions, 4ms latency, 0 unsafe actuator commands, 24/24 bit-identical replay) is a proof of concept, not a rigorous evaluation. A serious venue will ask: 24 decisions is far too few. Simulated environment, not real hardware. No comparison baseline. No ablation study.

**Expansion plan for the evaluation (Section 10):**

| Addition | Why it matters |
|---|---|
| Increase to 500+ decisions minimum | 24 is below the threshold for statistical credibility |
| Run across 3+ domains (drone + one medical scenario + one financial) | Demonstrates DAIGS generalizability without domain verticals doing it alone |
| Add a baseline condition: same AI without Lume-V governance | Measures what governance actually adds — without this, 0 unsafe commands has no context |
| Document hardware/software platform exactly | "Bit-identical replay" is a hardware-dependent claim |
| Add latency breakdown by stage | 4ms total is good; showing which of the 6 pipeline stages costs what makes it stronger |

**Structural fixes:**

1. The Related Works already present (Amodei, Ribeiro/LIME, Lundberg/SHAP, Mitchell/Model Cards, Seshia/Verified AI, Lamport/Paxos, EU AI Act, NIST AI RMF) is a good foundation. Add: Formal verification tools (TLA+, Isabelle/HOL for AI safety), Runtime Verification (Falcone et al., 2012 — runtime monitoring), Simplex Architecture (Sha, 2001 — the closest prior work in safety override architecture), FDIR (Fault Detection, Isolation, and Recovery) in aerospace.

2. **Simplex Architecture is the most important missing citation.** Sha et al. (2001) "Using Simplicity to Control Complexity" — the Simplex architecture is essentially a hardware precursor to what Lume-V does in software: a certified safety monitor that can override an AI controller. Reviewers will expect engagement with this.

3. The Limitations section (Section 13) is good. Add: "The current evaluation uses a simulated environment; physical deployment may introduce timing non-determinism not captured in simulation."

**Target venue:** IEEE Transactions on Dependable and Secure Computing (TDSC) — best fit for the certificate + safety invariant approach. Alternatively: ICCPS (International Conference on Cyber-Physical Systems) or EMSOFT (Embedded Software). For broader reach: a SafeAI or AISafety workshop at NeurIPS or AAAI is a good first step to get community feedback before journal submission.

---

### Lume-Med — `10.5281/zenodo.19434970`

**What's strong:** The LTC-Med v1.0 certificate structure. The regulatory alignment table (FDA SaMD, HIPAA, IEC 62304, ISO 14971, NIST AI RMF). The seven invariants with medical domain mapping.

**What needs work:**

1. **Add Related Works section.** Required citations:  
   - Topol, E.J. (2019). High-performance medicine: the convergence of human and AI. *Nature Medicine* — establishes the AI-in-medicine baseline  
   - Rajpurkar et al. (2022). AI in health and medicine. *Nature Medicine* — current state  
   - Existing FDA SaMD guidance documents (IMDRF, 2021) — the regulatory standard this claims alignment with  
   - Formal verification in medical devices: IEC 62304 compliance tooling (e.g., ISO 26262 analogs in medical)  
   - Human-AI teaming in clinical decision support: existing literature on automation bias

2. **Replace "validated" with "demonstrated."** The abstract says DAIGS is "validated" across three verticals. Validation implies independent reproduction. "Demonstrated" is accurate. This one word will get flagged by every clinical/biomedical reviewer.

3. **The confidence threshold invariant (I₁) needs calibration nuance.** Confidence scores are model-specific and not comparable across architectures. Add a sentence acknowledging that Invariant 1 requires domain-specific threshold calibration and that confidence interpretation is adapter-dependent.

4. **Add one small non-conceptual demonstration.** Even a synthetic dataset run through the governance pipeline showing real JSON certificate output would make this categorically different from a pure architecture paper.

5. **Target venue:** CHIL (Conference on Health, Inference, and Learning) for the governance architecture contribution. Alternatively: AMIA Annual Symposium (clinical informatics) or IEEE EMBC (biomedical engineering). For the regulatory alignment piece specifically: Journal of the American Medical Informatics Association (JAMIA).

---

### Lume-Fin — `10.5281/zenodo.19435715`

**What's strong:** The 30 invariants across 5 classes is the most granular invariant taxonomy in the series. The Bias & Fairness invariants (BF-1 through BF-6) directly map to ECOA, Fair Lending, and CFPB requirements. Credit Decision Arbitration with fairness-dominance ordering. The Adversarial Drift Invariant (FI-5).

**What needs work:**

1. **Add Related Works section.** Required citations:  
   - Barocas, Hardt & Narayanan. *Fairness and Machine Learning* (2019, fairmlbook.org) — canonical fairness reference  
   - Mehrabi et al. (2021). A Survey on Bias and Fairness in Machine Learning. *ACM CSUR* — required for the fairness invariant claims  
   - Hendrycks & Mazeika (2022). *X-Risk Analysis for AI Research* — AI risk in financial systems  
   - Chen et al. (2018). Explaining decisions of graph convolutional neural networks: Patient‑specific molecular subnetworks — explainability baseline  
   - Existing fintech governance: IBM OpenScale documentation, Google What-If Tool, Microsoft Fairlearn

2. **The regulatory alignment section covers 15 frameworks but specifies none.** Pick three (e.g., Basel III, ECOA, EU AI Act) and demonstrate precisely how LTC-Fin v1.0 satisfies specific articles or sections. A reviewer with regulatory expertise will be skeptical of broad claims without specific mapping.

3. **The RI-1 Stability Invariant tension needs a paragraph.** Risk models (Monte Carlo, random forests) are intentionally nondeterministic. RI-1 requires stable outputs under repeated evaluation of identical inputs. The paper needs to explain that RI-1 applies to the governance layer output, not the underlying model — i.e., the normalized proposal passed through Lume-V must be stable, even if the model producing it is stochastic.

4. **The Bias & Fairness section (BF-1 through BF-6) is the most publishable piece.** This section alone could be submitted as a regulatory comment to CFPB's AI in Credit Decisions inquiry or as a short paper to ACM FAccT (Fairness, Accountability, and Transparency). Seriously consider extracting it.

5. **Target venue:** ACM FAccT for the fairness invariants. Journal of Financial Regulation or Journal of Financial Compliance for the regulatory alignment contribution. IEEE Symposium on Security and Privacy for the certificate chain and audit trail work.

---

### Lume-Ops — `10.5281/zenodo.19440680`

**What's strong:** The best-constructed paper in the series. Named invariant codes (SI-112, SI-204, QI-311, etc.) create a taxonomy others can reference. The three-tier explainability (operator, supervisor, regulator) is the most novel contribution in the entire body of work. The LedgerGuardian immutable ledger. RFC 8785 canonical JSON is correctly cited. SHA3-256 is the right choice.

**What needs work:**

1. **Add Related Works section.** This paper has the most obvious gap because the domain (industrial automation safety) has deep existing literature:  
   - IEC 61508: Functional Safety of Electrical/Electronic/Programmable Electronic Safety-related Systems — mandatory citation; Lume-Ops must position relative to SIL ratings  
   - ISO 13849: Safety of machinery — directly governs machine guarding (which SI-331 addresses)  
   - ISO 26262: Road vehicles — functional safety (relevant to fleet operations domain)  
   - Sha, L. (2001). Using Simplicity to Control Complexity. *IEEE Software* — Simplex Architecture  
   - Rushby, J. (1994). A formally verified algorithm for clock synchronization — relevant to deterministic timebase governance  
   - Runtime Verification: Falcone et al. (2012). What can you verify and enforce at runtime?

2. **Position Lume-Ops relative to IEC 61508 explicitly.** A single paragraph is needed: "Lume-Ops does not replace functional safety standards (IEC 61508, ISO 13849). It provides a deterministic governance substrate for AI outputs that feeds into safety-rated control systems. The Lume-Ops Safety Evaluator operates at the AI governance layer; traditional functional safety standards govern the control layer beneath it." Without this, an industrial automation reviewer will reject on the grounds that Lume-Ops appears ignorant of existing standards.

3. **The three-tier explainability should be the abstract's centerpiece.** Currently it's buried in Section 8. This is the most publishable contribution and should be in the first paragraph of the abstract. No existing operational AI governance framework produces audit-grade explanations simultaneously with operator-facing plain-language summaries. Make that claim prominently.

4. **FailSafeController escalation criteria are missing.** Five levels are defined (machine → line → zone → facility → system-wide freeze) but the conditions for escalation between levels are not specified. What threshold or event promotes a machine freeze to a line freeze? Add a decision table.

5. **The invariant confidence score ambiguity needs one clarifying sentence.** Evaluators produce a Boolean result plus a confidence score. The paper says any unsafe status triggers Class I Arbitration — so the Boolean is the decision input, not the confidence. What is the confidence score used for? Probably for ordering in arbitration and for the SFE/RFE explanations. State this explicitly.

6. **Target venue:** ICRA (International Conference on Robotics and Automation) for the safety invariant and arbitration architecture. ICCPS (Cyber-Physical Systems) for the full governance stack. IEEE Transactions on Automation Science and Engineering (TASE) for a journal submission. The three-tier explainability specifically targets HRI (Human-Robot Interaction) as a conference.

---

### Lume-X — `10.5281/zenodo.19443968`

**What's strong:** The DMAC vs. existing paradigms table (Swarm Intelligence, Consensus Protocols, MARL, Game Theory vs. DMAC) makes the strongest "new category" argument in the series. The "no quorum" design is principled and defensible. The Deterministic Simulation Universe. The Lume-X ↔ Lume-Ops integration layer with bidirectional certificate translation.

**What needs work:**

1. **Fix "DOI: (pending Zenodo upload)" in the paper body.** Update to `10.5281/zenodo.19443968` and re-upload as v2.

2. **Add Related Works section.** Required citations:  
   - FIPA (Foundation for Intelligent Physical Agents) agent communication standards — the existing multi-agent communication standard  
   - Shoham & Leyton-Brown (2009). *Multiagent Systems: Algorithmic, Game-Theoretic, and Logical Foundations* — canonical MAS textbook  
   - Wooldridge (2009). *An Introduction to MultiAgent Systems* — standard reference  
   - AutoGen (Wu et al., 2023) — Microsoft's recent multi-agent framework  
   - JADE (Java Agent DEvelopment Framework) — existing production MAS framework  
   - Lamport (2019). Byzantizing Paxos by Refinement — consensus without deterministic cognition  
   - OpenAI multi-agent research — for contrast with probabilistic approaches

3. **60 cognitive blocks claimed in abstract — not all developed.** Count the blocks actually specified in the paper. If the count is lower, either update the abstract number or add stub sections for the underdeveloped blocks. Forecasting, scenario planning, strategy, policy, threat detection, trust, reputation, and credentialing are mentioned in scope but not built out.

4. **"Bit-exact reconstruction" needs hardware qualification.** Floating-point arithmetic is hardware-dependent. Add a clarifying statement: bit-exact reconstruction applies to the governance layer (canonical JSON, SHA3-256 hashing, Ed25519 signatures) — not to the underlying model outputs, which are normalized before entering the governance pipeline. The normalization step itself must be deterministic.

5. **The biological mapping (nervous system, muscular, circulatory, etc.) appears for the third time across the series.** Consider moving it to a brief "conceptual bridge" appendix rather than main body. In a formal multi-agent systems submission, it reads as rhetorical rather than technical.

6. **Target venue:** AAMAS (International Conference on Autonomous Agents and Multi-Agent Systems) is the primary target. JAAMAS (Journal of Autonomous Agents and Multi-Agent Systems) for a journal version. For the safety-dominant arbitration piece specifically: SafeAI workshop at AAAI.

---

## Submission Progression Strategy

### Phase 1 — Immediate (now): Establish arXiv Presence

Upload all five published papers to arXiv (cs.AI, cs.SE, or cs.RO depending on paper). arXiv submission is free, fast, and dramatically increases visibility. Order matters — submit in logical stack order so the citation chain is clear:

1. Lume (cs.PL — Programming Languages)
2. Lume-Med (cs.AI + eess.SP)
3. Lume-Fin (cs.AI + q-fin.RM)
4. Lume-Ops (cs.RO + cs.SY)
5. Lume-X (cs.MA — Multi-Agent Systems)

Hold Lume-V from arXiv until the evaluation is expanded.

### Phase 2 — Short-term (1–3 months): Workshop Papers

Workshops are peer-reviewed, fast-turnaround, and build community before full conference submission. They also strengthen the Related Works problem because workshop reviewers give feedback rather than just reject.

| Paper | Workshop | Conference |
|---|---|---|
| DAIGS category definition (pull from Lume-V + Lume-Med) | SafeAI | AAAI 2027 |
| Three-tier explainability (pull from Lume-Ops) | Workshop on Explainability for Robots | HRI 2027 |
| Fairness invariants (pull from Lume-Fin BF-1–BF-6) | FAccT workshop | FAccT 2027 |
| DMAC definition (pull from Lume-X) | OPTMAS or PAIR | AAMAS 2027 |

### Phase 3 — Medium-term (3–9 months): Full Conference Papers

With workshop feedback incorporated and Related Works added:

| Paper | Primary Target | Backup |
|---|---|---|
| Lume (compiler) | OOPSLA 2027 | SPLASH / ECOOP |
| Lume-V (expanded evaluation) | ICCPS 2027 | EMSOFT / RTSS |
| Lume-Med | CHIL 2027 | AMIA Annual |
| Lume-Fin | ACM FAccT 2027 | IEEE S&P |
| Lume-Ops | ICRA 2027 | ICCPS |
| Lume-X | AAMAS 2027 | IJCAI |

### Phase 4 — Long-term (9–18 months): Journal Submissions

| Paper | Target Journal |
|---|---|
| Lume (compiler) | ACM TOPLAS or PACMPL |
| Lume-V | IEEE TDSC (Transactions on Dependable and Secure Computing) |
| DAIGS unified (Med + Fin + Ops combined) | ACM TOSEM or IEEE Transactions on Software Engineering |
| Lume-X | JAAMAS (Journal of Autonomous Agents and Multi-Agent Systems) |

---

## Priority Work Order for the Agent

Do these in this exact sequence:

**Step 1 — Audit and fix all DOI cross-references across all 6 papers.**  
Use the authoritative table at the top of this document. Every internal citation in every References section must point to the correct live Zenodo record.

**Step 2 — Fix Lume-X paper body DOI placeholder.**  
Update to `10.5281/zenodo.19443968`. Re-upload as Zenodo v2.

**Step 3 — Standardize all Lume compiler citations to v4.**  
`10.5281/zenodo.19441103` everywhere.

**Step 4 — Write Related Works sections for Lume-Med, Lume-Fin, Lume-Ops, and Lume-X.**  
Use the per-paper citation lists above. Each section should be 400–600 words, positioning the paper's contribution clearly against each cited work.

**Step 5 — Add IEC 61508 positioning paragraph to Lume-Ops.**  
One paragraph, main body, after the architecture overview. Template provided in the Lume-Ops section above.

**Step 6 — Replace "validated" with "demonstrated" in Lume-Med abstract and body.**  
Global search and replace. Reword any sentence where the distinction matters.

**Step 7 — Add RI-1 Stability Invariant tension paragraph to Lume-Fin.**  
One paragraph in Section 6.1 clarifying that RI-1 applies to the governance layer output, not the underlying nondeterministic model.

**Step 8 — Add FailSafeController escalation decision table to Lume-Ops.**  
A table showing the conditions (invariant type, duration, scope of impact) that promote each freeze level.

**Step 9 — Rewrite Lume-Ops abstract to lead with three-tier explainability.**  
This is the most novel contribution. It should be sentence 2 or 3 of the abstract, not buried in Section 8.

**Step 10 — Lume-V evaluation expansion (longest task).**  
Target: 500+ decisions minimum, 3 domains, baseline comparison, platform documentation. This unblocks Lume-V for arXiv and venue submission.

---

## Notes on Tone and Framing Across the Series

- **"Validated" vs "demonstrated":** Use "demonstrated" for internal results. Reserve "validated" for results that have been reproduced independently. This applies to all six papers.
- **"First" claims:** "Lume-X introduces the first deterministic multi-agent cognition substrate" — strong claims like this require either prior art searches or more careful hedging ("to our knowledge, the first..."). Add this qualifier to every "first" claim across the series.
- **Conceptual examples:** Before any conference submission, each domain paper needs at least one non-conceptual example — real JSON output from a real (even toy) pipeline run. The word "conceptual" should not appear in a venue submission.
- **The Ω-Canon and biological mapping sections** in Lume-X are publishable in a magazine or essay format (like ACM Queue, IEEE Spectrum, or Communications of the ACM) but should be appendices or discussion sections in formal venue submissions, not main body content.

---

## What the Agent Has Going In Its Favor

Reading all six papers as a body: the architecture is internally consistent. Each paper builds correctly on the one below it. The stack is coherent. The certificate format is consistent (Ed25519, SHA3-256, RFC 8785) across all papers from Lume-V onward. The vocabulary is stable (LumeVProposal, LTC, DAIGS, invariant classes, arbitration semantics). This kind of consistency across six papers is unusual and will be noticed by reviewers who read more than one.

The cognitive distance framing in the Lume paper is independently publishable and accessible to a general technical audience. That paper, cleaned up, is the best entry point for media coverage and should go to arXiv first.

The three-tier explainability in Lume-Ops is the contribution most likely to have near-term practical adoption because it solves an immediate, concrete problem: how do you communicate an AI safety decision to three different audiences simultaneously? That contribution should be extracted and submitted fast.
