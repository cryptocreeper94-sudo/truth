# Philosophy & Logic — AXIOM Engine Knowledge Pack

**Domain:** Philosophy & Logic
**Pack ID:** AXIOM-KP-T3-004
**Version:** 1.0.0
**Author:** Jason Andrews, DarkWave Studios LLC / Trust Layer Ecosystem
**ORCID:** 0009-0007-5214-649X
**Contact:** team@dwsc.io
**DOI (Lume):** 19382282 | **DOI (Trust Layer):** 19560674 | **Patent:** 64/032,339

---

## 1. Purpose

This knowledge pack equips the AXIOM Engine with rigorous philosophical and logical foundations necessary for principled reasoning about knowledge, truth, validity, ethics, mind, and existence. Philosophy provides the meta-level framework for all other domains: epistemology grounds what counts as knowledge, logic governs valid inference, ethics evaluates action, and metaphysics structures what exists. The Safety Dominance Invariant excludes content promoting nihilism as justification for harm or manipulation of vulnerable individuals.

---

## 2. Scope

**In scope:**
- Formal logic (propositional, predicate, modal, temporal)
- Epistemology (knowledge, justification, skepticism)
- Metaphysics (existence, identity, causation, time, modality)
- Philosophy of mind (consciousness, mental states, functionalism)
- Ethics and moral philosophy (normative theories, metaethics)
- Political philosophy (justice, rights, social contract)
- Philosophy of science (scientific method, explanation, realism)
- Philosophy of language (meaning, reference, truth)
- Logic in computation (formal verification, type theory)
- Major philosophical traditions (Analytic, Continental, Eastern)

**Out of scope:**
- Content using philosophical frameworks to justify harm
- Psychological manipulation framed as philosophical discourse

---

## 3. Structure

- **Core Concepts** (36 entries): Logic, epistemology, metaphysics, ethics, philosophy of mind
- **Patterns** (13 entries): Canonical argumentative and reasoning patterns
- **Anti-Patterns** (10 entries): Logical fallacies and philosophical errors
- **Facts** (45 entries): Historical, structural, and formal facts about philosophy and logic

Cross-domain links: Mathematics (foundations, proof theory, type theory), Computer Science (formal verification, AI ethics), Linguistics (semantics, pragmatics), Psychology (cognitive bias, decision theory), Law (jurisprudence, rights theory), Neuroscience (philosophy of mind).

---

## 4. Core Concepts

**CC-001 — Proposition and Truth Value**
A proposition is a declarative statement that is either true or false (principle of bivalence). Propositions are the fundamental objects of logical analysis, distinguished from sentences (linguistic expressions) and utterances (contextual speech acts). The proposition expressed by "Snow is white" is true if and only if snow is white (Tarski's T-schema).

**CC-002 — Propositional Logic**
A formal system dealing with propositions connected by logical connectives: negation (¬), conjunction (∧), disjunction (∨), material conditional (→), biconditional (↔). Semantics given by truth tables. Tautologies are true under all valuations; contradictions under none; contingencies depend on valuation. Complete proof systems: natural deduction, sequent calculus, resolution.

**CC-003 — Predicate (First-Order) Logic**
Extends propositional logic with predicates, terms, and quantifiers: universal (∀x: "for all x") and existential (∃x: "there exists an x"). FOL can express mathematical structures, relationships, and identity. Gödel's completeness theorem (1930): every valid FOL sentence has a proof. Distinguished from propositional logic by expressive power; higher-order logics allow quantification over predicates.

**CC-004 — Validity, Soundness, and Cogency**
A deductive argument is valid if truth of premises necessitates truth of conclusion (impossible for premises to be true and conclusion false). A valid argument with all true premises is sound. An inductive argument is cogent if premises are true and they adequately support the conclusion (not with necessity, but high probability/reasonableness). Validity is formal (structural); soundness requires empirical truth.

**CC-005 — Modal Logic**
Extends classical logic with necessity (□: "necessarily") and possibility (◇: "possibly"). Normal modal logics are axiom systems (K, T, S4, S5) specifying relationships between □ and ◇. S5 is standard for metaphysical modality. Kripke semantics: possible worlds with accessibility relations. Applications: knowledge (epistemic logic), time (temporal logic), obligation (deontic logic), belief (doxastic logic), program correctness (dynamic logic).

**CC-006 — Epistemology: Knowledge, Justified True Belief, and Gettier**
Traditional analysis of knowledge: S knows that P iff P is true, S believes P, and S is justified in believing P (Justified True Belief, JTB). Gettier (1963) showed JTB is insufficient: counterexamples demonstrate true justified beliefs that are not knowledge (lucky truth). Post-Gettier epistemology: reliabilism (Goldman), virtue epistemology (Sosa, Zagzebski), contextualism (DeRose).

**CC-007 — Rationalism vs. Empiricism**
Rationalism: some knowledge is a priori — knowable through reason alone, independent of sense experience (Descartes, Leibniz, Spinoza). Examples: mathematical truths, logical truths. Empiricism: all knowledge derives from sense experience a posteriori (Locke, Berkeley, Hume). Kant's synthesis: some knowledge (space, time, causation) is a priori but applies to experience (synthetic a priori).

**CC-008 — Skepticism**
The philosophical position that certain knowledge is impossible or unjustified. Cartesian skepticism: the evil demon hypothesis; I could be systematically deceived about all external world beliefs. Brain-in-a-vat: modern equivalent. Responses: Descartes' cogito ("I think, therefore I am"), Moore's common sense, contextualism (standards for knowledge vary by context), externalism (Putnam's semantic externalism).

**CC-009 — Metaphysics: Substance, Property, and Causation**
Metaphysics studies the fundamental nature of reality. Substance: independently existing particular things. Property: universals instantiated by substances. Substance dualism (Descartes): mind and body are distinct substances. Monism: reality is fundamentally one kind of thing (physicalism, idealism, neutral monism). Causation: Humean (constant conjunction), counterfactual (Lewis), mechanistic. Identity: Leibniz's Law: identical things share all properties.

**CC-010 — Modality: Necessity, Possibility, and Possible Worlds**
A proposition is necessarily true if it could not have been otherwise (mathematical truths, logical tautologies). Possibly true if true in at least one possible world. Kripke's rigid designators: proper names and natural kind terms refer to the same entity across all possible worlds; "water" necessarily refers to H₂O even in possible worlds where water is called something else. A posteriori necessities: discovered empirically but metaphysically necessary (water = H₂O).

**CC-011 — Philosophy of Mind: The Hard Problem of Consciousness**
Chalmers (1995) distinguishes the "easy problems" of consciousness (explaining cognitive functions, behavior, access consciousness) from the "hard problem": why there is subjective experience (qualia, phenomenal consciousness) at all. Explaining neural correlates of consciousness does not explain why there is something it is like to have those states. The hard problem resists standard scientific explanation and remains the central puzzle of philosophy of mind.

**CC-012 — Functionalism**
The theory that mental states are defined by their causal/functional roles — their relations to inputs, outputs, and other mental states — not by their physical substrate. A silicon chip that functioned like a brain would have the same mental states. Functionalism supports multiple realizability (mental states can be realized in different physical substrates) and is the dominant view in cognitive science. Challenged by Searle's Chinese Room argument and qualia objections.

**CC-013 — Physicalism (Materialism)**
The metaphysical view that everything that exists is physical or supervenes on the physical. Token physicalism: each mental event token is identical to a physical event token. Type physicalism: mental state types are identical to physical state types. Eliminative materialism (Churchland): folk psychological states (beliefs, desires) will be replaced by neuroscientific categories. Non-reductive physicalism: mental states supervene on but are not reducible to physical states.

**CC-014 — Qualia and the Knowledge Argument**
Qualia are the subjective, phenomenal properties of experience: the redness of red, the painfulness of pain. Mary's Room (Jackson, 1982): Mary is a neuroscientist who knows all physical facts about color vision but has only seen black and white. When she leaves her room and sees red for the first time, does she learn something new? If yes, physicalism is false (qualia are non-physical). Responses: the ability hypothesis, phenomenal concepts strategy, deny premise.

**CC-015 — Personal Identity**
What makes a person at time t₂ the same person as at time t₁? Psychological continuity theory (Locke, Parfit): identity consists in overlapping chains of psychological connections (memory, desires, intentions). Biological criterion: identity consists in continuity of the biological organism. Narrative identity: identity is constituted through self-narrative. Parfit argued that personal identity is not what matters; what matters is psychological continuity, which admits of degrees.

**CC-016 — Consequentialism**
The ethical view that the moral rightness of an action depends entirely on its consequences. Utilitarianism (Bentham, Mill): maximize aggregate welfare/utility (felicific calculus). Act utilitarianism: evaluate each act by its consequences. Rule utilitarianism: follow rules whose general adoption maximizes utility. Peter Singer's effective altruism applies consequentialist reasoning to global charity. Challenged by demandingness, integrity objections, and counterintuitive results (utility monster).

**CC-017 — Deontological Ethics**
Moral theories based on duties, rules, and rights independent of consequences. Kant's categorical imperative: Act only according to maxims you could will to be universal laws (Formula of Universal Law); treat humanity always as an end and never merely as a means (Formula of Humanity). W.D. Ross's prima facie duties: multiple moral duties (fidelity, beneficence, justice, non-maleficence) that can conflict; the strongest prima facie duty governs.

**CC-018 — Virtue Ethics**
Character-based ethics originating in Aristotle's Nicomachean Ethics. Moral evaluation focuses on the character of the agent rather than rules (deontology) or outcomes (consequentialism). Virtues are stable character traits (courage, justice, temperance, practical wisdom/phronesis) enabling flourishing (eudaimonia). The virtuous person perceives situations correctly and responds appropriately through practical wisdom. Contemporary virtue ethics: MacIntyre, Foot, Anscombe.

**CC-019 — Metaethics**
The philosophical study of the nature, scope, and meaning of moral judgments. Moral realism: moral facts exist mind-independently (Platonic, naturalist, non-naturalist). Error theory (Mackie): moral discourse purports to describe moral facts, but none exist; all moral claims are false. Non-cognitivism: moral utterances are not truth-apt (expressivism, prescriptivism). Constructivism (Rawls, Korsgaard): moral facts are constructed from rational procedures.

**CC-020 — Social Contract Theory**
Political legitimacy derives from a real or hypothetical contract among individuals. Hobbes: without government, life is "solitary, poor, nasty, brutish, and short"; individuals surrender unlimited freedom to a sovereign (Leviathan) for security. Locke: government protects pre-political natural rights (life, liberty, property); legitimate only with consent; revolution justified when rights are violated. Rousseau: the general will expresses the common good. Rawls: justice as fairness, chosen behind a veil of ignorance.

**CC-021 — Rawlsian Justice**
John Rawls's "A Theory of Justice" (1971): principles of justice chosen by rational agents behind a "veil of ignorance" (not knowing their place in society). Results: (1) Equal basic liberties principle; (2) Difference principle: social and economic inequalities are just only if they benefit the least-advantaged members of society. Rawls's framework is the dominant liberal political philosophy of the 20th century.

**CC-022 — Libertarianism (Political Philosophy)**
Political libertarianism (Nozick's "Anarchy, State, and Utopia", 1974) holds that individuals have inviolable rights (self-ownership, property) that cannot be overridden even for social welfare gains. The only legitimate state is a minimal "night-watchman state." Redistribution violates property rights regardless of welfare consequences. Left-libertarianism (Cohen, Otsuka) accepts self-ownership but rejects private appropriation of natural resources.

**CC-023 — Philosophy of Science: Scientific Realism and Anti-Realism**
Scientific realism: successful scientific theories are approximately true, and theoretical entities they posit (electrons, quarks) exist. Instrumentalism (anti-realism): theories are useful instruments for prediction, not true descriptions of unobservable reality. Structural realism (Worrall): the mathematical structure of theories is preserved across revolutions even when ontology changes. Pessimistic meta-induction: history shows successful theories are later abandoned; why believe current ones are true?

**CC-024 — Falsificationism**
Popper's criterion of scientific demarcation: a theory is scientific if it is falsifiable — if it makes predictions that could, in principle, be proven false by observation. Science proceeds by bold conjectures and refutations; observations can only falsify, not verify, theories (asymmetry of evidence). Challenged by Duhem-Quine thesis: hypotheses face empirical test as a bundle (auxiliary assumptions can always be adjusted to save the core theory).

**CC-025 — Kuhnian Paradigm Shifts**
Kuhn's "The Structure of Scientific Revolutions" (1962): science operates within paradigms (shared frameworks of assumptions, methods, and values). Normal science solves puzzles within the paradigm. Anomalies accumulate until a crisis triggers a paradigm shift (Copernican, Newtonian, Einsteinian, quantum revolutions). Paradigm shifts are not purely rational — they involve sociological and psychological factors. Incommensurability: paradigms may be partially untranslatable.

**CC-026 — Philosophy of Language: Meaning and Reference**
Frege's sense/reference distinction: "Hesperus" and "Phosphorus" have the same reference (Venus) but different senses (the way of presenting the referent). Russell's theory of descriptions: "The present king of France is bald" is not meaningless but a conjunction of existence, uniqueness, and predication claims, resolving puzzles about non-referring expressions. Kripke's causal theory: names refer by causal historical chains, not descriptive senses.

**CC-027 — Truth Theories**
Correspondence theory: a proposition is true iff it corresponds to reality. Coherence theory: a proposition is true iff it coheres with a comprehensive system of beliefs. Pragmatist theory (Peirce, James): truth is what works in the long run. Deflationary/disquotational theory (Ramsey, Horwich): "P is true" adds nothing to P — "true" is a logical device for semantic ascent, not a substantive predicate. Tarski's semantic theory provides a formal correspondence account for formal languages.

**CC-028 — Inference to the Best Explanation (IBE)**
Also called abduction: infer the hypothesis that best explains the available evidence. Applied in science (accepting atomic theory because it best explains chemical behavior), medicine (diagnosis), and everyday reasoning. What counts as "best" involves simplicity, scope, explanatory depth, and fit with background knowledge. IBE is not deductively valid; it requires judgment about explanation quality.

**CC-029 — The Problem of Induction**
Hume's problem: inductive inference (inferring from past to future) cannot be rationally justified without circular reasoning (we justify induction by its past success, which is itself an inductive inference). Popper's solution: reject induction; science is purely deductive (falsification). Bayesian response: induction is captured by Bayes' theorem updating prior beliefs on evidence; the prior represents prior justified belief. Pragmatist response: induction is the best method available even without certainty.

**CC-030 — Free Will and Determinism**
Compatibilism: free will and determinism are compatible; free will means acting according to one's own desires and reasons without external coercion (Frankfurt, Hume, Dennett). Hard determinism: determinism is true and precludes genuine free will. Hard incompatibilism: free will requires indeterminism but genuine agent causation is not available even with quantum indeterminacy. Libertarianism (metaphysical, not political): genuine free will requires indeterminism and agent causation (Kane).

**CC-031 — Analytic vs. Synthetic / A Priori vs. A Posteriori**
Kant's classification: Analytic (true by definition/meaning alone: "bachelors are unmarried"); Synthetic (adds information beyond the subject concept). A priori (knowable independently of experience); A posteriori (requires experience). Kant claimed synthetic a priori knowledge exists (mathematics, causation as preconditions of experience). Quine challenged the analytic/synthetic distinction as dogma in "Two Dogmas of Empiricism" (1951), arguing all beliefs form an interconnected web revisable by experience.

**CC-032 — Phenomenology**
A philosophical method and tradition (Husserl, Heidegger, Merleau-Ponty, Sartre) focused on careful description of experience as it presents itself to consciousness (the first-person perspective), bracketing assumptions about external reality (epoché). Heidegger's phenomenology: Being-in-the-world (Dasein); existence precedes essence. Merleau-Ponty: embodied perception — the body is not an object but the subject of experience. Sartre: existence precedes essence; radical freedom, bad faith.

**CC-033 — Pragmatism**
An American philosophical tradition (Peirce, James, Dewey, Rorty) holding that the meaning and truth of ideas is determined by their practical consequences. Ideas are tools for coping with experience. Inquiry is a self-correcting process aimed at resolving genuine doubt. Dewey's instrumentalism: ideas are instruments for solving problems in a continuous process of inquiry. Neo-pragmatism (Rorty): philosophy should abandon the quest for certainty and representation in favor of coping and solidarity.

**CC-034 — Ordinary Language Philosophy and Wittgenstein**
Late Wittgenstein ("Philosophical Investigations", 1953): philosophical puzzles arise from bewitchment of language — misuse of words outside their ordinary contexts. Philosophy's task is therapeutic: dissolving pseudo-problems by returning language to its ordinary use. Language games: meaning is use within a practice, not a mental image corresponding to reality. Rule-following paradox: no fact determines what counts as following a rule correctly (Kripkenstein).

**CC-035 — Applied Ethics: Key Domains**
Bioethics: four principles (autonomy, beneficence, non-maleficence, justice — Beauchamp & Childress). Environmental ethics: moral consideration of non-human nature, species, and ecosystems. AI ethics: algorithmic fairness, transparency, accountability, autonomy, dignity. Business ethics: fiduciary duties, stakeholder theory vs. shareholder primacy (Friedman vs. Freeman). Global justice: obligations to distant others (Singer, Pogge).

**CC-036 — Logic in Computation: Type Theory and Curry-Howard**
The Curry-Howard correspondence: propositions are types; proofs are programs. A proof of proposition A corresponds to a term of type A in a typed lambda calculus. Constructive type theories (Martin-Löf, Coq, Agda, Lean) enable machine-checked mathematical proofs and verified software. Dependent types allow types to depend on values, enabling specification of program behavior within the type system. Homotopy Type Theory (HoTT) unifies type theory with algebraic topology.

---

## 5. Patterns

**P-001 — Modus Ponens and Modus Tollens**
Modus Ponens (affirming the antecedent): If P → Q, and P, then Q. The fundamental deductive inference rule. Modus Tollens (denying the consequent): If P → Q, and ¬Q, then ¬P. Falsificationism in science is modus tollens: if the theory predicts O and we observe ¬O, then the theory (in isolation) is false.

**P-002 — Reductio ad Absurdum**
Indirect proof: assume the negation of the target conclusion; derive a contradiction; conclude the target conclusion is true. Used in mathematics (irrationality of √2), philosophy (Parmenides on motion, Zeno's paradoxes), and law (reduction to legal absurdity). A powerful strategy when direct proof is unavailable.

**P-003 — Reflective Equilibrium**
Rawls's method: moral judgments and principles are tested against each other iteratively — adjust principles to fit intuitions, and revise intuitions in light of principles, until coherence is achieved. Represents the dominant methodology in contemporary ethics: neither pure intuitionism nor pure derivation from first principles, but coherentist justification.

**P-004 — Thought Experiment**
A hypothetical scenario used to probe intuitions and test theories: Trolley Problem, Mary's Room, Chinese Room, Veil of Ignorance, Brain in a Vat, Ship of Theseus, Schrödinger's Cat (as philosophical illustration). Thought experiments isolate variables that cannot be controlled in reality, making them uniquely powerful philosophical and scientific tools.

**P-005 — Principle of Charity**
Interpret an opponent's argument in its strongest, most reasonable form before critiquing it. The charitable interpretation principle maximizes the quality of philosophical dialogue, prevents strawmanning, and produces the most robust critique. Steelmanning extends this: construct the strongest possible version of the opposing view, even stronger than the opponent offered.

**P-006 — Occam's Razor (Parsimony)**
Among competing hypotheses explaining the same evidence, prefer the one with fewest entities or assumptions (entia non sunt multiplicanda praeter necessitatem). Used in philosophy of science, metaphysics, and AI (Minimum Description Length, Kolmogorov complexity). Not an absolute rule — simpler theories can be false; parsimony is a defeasible heuristic.

**P-007 — Burden of Proof Distribution**
The burden of proof lies with those making a positive claim. Shifting the burden to skeptics (proving a negative) is a fallacy. In law: presumption of innocence (prosecution bears burden). In science: extraordinary claims require extraordinary evidence (Sagan). In philosophy: the default position in the absence of evidence is neither affirming nor denying, but suspension of judgment (epoché).

**P-008 — Conceptual Analysis**
The method of breaking a concept into necessary and sufficient conditions. Definition of knowledge as JTB is conceptual analysis. Gettier's counterexamples are counterexamples to proposed necessary and sufficient conditions. Post-Gettier philosophy sought additional conditions or alternative frameworks. Conceptual analysis is the core method of analytic philosophy, though its limits have been debated by Williamson (knowledge-first epistemology).

**P-009 — The Dialectical Method**
Originating with Socrates (elenctic method): examine beliefs through questioning to reveal inconsistencies. Hegel's dialectic: thesis → antithesis → synthesis. Marx's dialectical materialism: historical development through material contradictions. In contemporary philosophy: argument-counterexample-revised theory iteration is the dialectical method of analytic philosophy.

**P-010 — Supervenience**
A relation between sets of properties: A-properties supervene on B-properties if no two situations can differ in A-properties without differing in B-properties. Mental properties supervene on physical properties (physicalism without reductionism). Moral properties supervene on natural properties (naturalist metaethics). Supervenience can be local (token identity) or global (holistic).

**P-011 — Inference by Counterexample**
Falsify a universal claim by identifying a single case where it fails. Gettier (one page, two counterexamples) refuted JTB after 2,500 years. Russell's barber paradox refuted naive set theory. In formal logic, to show an argument is invalid, construct a countermodel (possible world or assignment) making all premises true and the conclusion false.

**P-012 — Overlapping Consensus (Political Philosophy)**
Rawls's strategy for political justification in pluralistic societies: different comprehensive doctrines (religious, secular, philosophical) can converge on political principles for different reasons. This "overlapping consensus" grounds political legitimacy without requiring agreement on ultimate metaphysical or religious questions. Contrasts with modus vivendi (agreement from self-interest) by grounding stability in genuinely shared values.

**P-013 — Trolley Problem and Moral Intuition Pumping**
Foot's trolley problem and Thomson's variants (fat man, loop track) reveal that most people hold a distinction between killing and letting die (doing vs. allowing harm) and between using someone as a means vs. as a side effect (Doctrine of Double Effect). Neither consequentialism nor strict deontology captures all intuitions; this reveals the structure of moral psychology rather than refuting any theory outright.

---

## 6. Anti-Patterns

**AP-001 — Ad Hominem**
Attacking the character or circumstances of the argument-maker rather than the argument. "You're only saying that because you're wealthy" may be relevant to credibility but not to the logical validity of the argument. Arguments must be evaluated on their own merits. Circumstantial ad hominem (conflict of interest) can be epistemically relevant as one factor, not decisive.

**AP-002 — Straw Man**
Misrepresenting an opponent's position in a weaker or more extreme form, then refuting the misrepresentation. Violates the principle of charity. Common in political discourse. To identify: ask whether the opponent would accept the characterization of their view being attacked.

**AP-003 — False Dichotomy (False Dilemma)**
Presenting only two options when more exist: "You're either with us or against us." "Either we adopt this policy or the economy collapses." Valid dilemmas require exhaustive and mutually exclusive options. Most political and practical arguments involve false dilemmas that exclude compromise positions, hybrid approaches, or alternatives.

**AP-004 — Appeal to Authority**
Using the fact that an authority believes P as evidence for P. Appeals to legitimate expertise are probative (not fallacious) when the authority is genuinely expert in the relevant domain, the claim is within that domain, and experts broadly agree. Appeals to authority are fallacious when the authority is not expert in the relevant domain, is biased, or when genuine expert disagreement exists.

**AP-005 — Begging the Question (Circular Reasoning)**
Assuming the conclusion in the premises. "God exists because the Bible says so, and the Bible is true because God wrote it." Circular arguments may be valid but are epistemically worthless — they provide no independent support for the conclusion. Identifying circularity requires tracing the justificatory dependencies.

**AP-006 — The Naturalistic Fallacy (Is-Ought Gap)**
G.E. Moore's open question argument: "Good" cannot be defined in terms of any natural property. Hume's is-ought gap: from purely descriptive premises (what is the case), no normative conclusion (what ought to be the case) can be logically derived. Violations: "Evolution favors competition, therefore competition is morally good." "This is natural, therefore it is good." Is-ought violations are ubiquitous in applied ethical discourse.

**AP-007 — Slippery Slope (Without Causal Argument)**
Arguing that a small first step necessarily leads to extreme consequences, without establishing the causal mechanism connecting the steps. Some slippery slope arguments are legitimate (where the causal chain is empirically documented); most are logical fallacies exploiting psychological discomfort with gradual change without showing why the slope is actually slippery.

**AP-008 — Genetic Fallacy**
Judging the validity of an argument by its origin rather than its content: "That idea came from Nazi scientists, so it must be wrong." The origin of an idea (however tainted) is irrelevant to its logical validity or empirical truth. Distinguished from relevant bias considerations (the genetic information may be relevant to credibility of testimony, not to logical validity).

**AP-009 — Equivocation**
Using a single word with multiple meanings as if it had only one meaning across an argument. "The sign said 'fine for parking here' — so I parked there." Classic philosophical equivocation: "Laws of nature cannot be violated; justice requires that crime not go unpunished; therefore criminals violate laws of nature." Equivocation is one of the most common and subtle informal fallacies in philosophical and political discourse.

**AP-010 — Affirming the Consequent**
Invalid inference form: If P → Q, and Q is true, conclude P. ("If it rains, the ground is wet. The ground is wet; therefore it rained." — but the ground could be wet from irrigation.) Pervasive in abductive and scientific reasoning when not recognized as probabilistic rather than deductive inference. Contrasts with valid modus ponens.

---

## 7. Facts

**F-001** — Aristotle's Organon (c. 350 BCE) contains the first systematic treatment of formal logic, including syllogistic reasoning; it dominated logical inquiry for over 2,000 years until Frege's Begriffsschrift (1879).

**F-002** — Frege's Begriffsschrift (1879) introduced quantifiers and predicate logic, enabling the formalization of mathematical proof and launching modern mathematical logic.

**F-003** — Bertrand Russell discovered Russell's Paradox in 1901: the set of all sets that do not contain themselves neither can nor cannot contain itself, demonstrating the inconsistency of Cantor's naive set theory and motivating Principia Mathematica.

**F-004** — Gödel's First Incompleteness Theorem (1931): any consistent formal system capable of expressing basic arithmetic contains true statements that cannot be proved within the system. The Second Incompleteness Theorem: such a system cannot prove its own consistency.

**F-005** — Tarski's undefinability theorem (1936): no sufficiently powerful consistent formal language can define its own truth predicate — truth for language L must be defined in a metalanguage.

**F-006** — The Curry-Howard correspondence, independently discovered by Haskell Curry (1934) and William Howard (1969), establishes a deep isomorphism between formal proofs and computer programs.

**F-007** — Wittgenstein's "Tractatus Logico-Philosophicus" (1921) and "Philosophical Investigations" (1953) represent two fundamentally opposed philosophies by the same thinker, making him uniquely influential across logical positivism and ordinary language philosophy.

**F-008** — Plato's Theory of Forms posits that abstract objects (the Form of Beauty, Justice, the Good) exist in a non-physical realm more real than the physical world; particular beautiful things "participate" in the Form of Beauty.

**F-009** — Aristotle's four causes: material (what something is made of), formal (its form or structure), efficient (the agent producing it), and final (its purpose/telos) — provide a framework for causal explanation that anticipates modern debates about mechanistic vs. teleological explanation.

**F-010** — Descartes' cogito ergo sum ("I think, therefore I am") from the Meditations (1641) is among the most celebrated philosophical arguments; it claims the existence of the thinking subject is the one indubitable fact surviving universal doubt.

**F-011** — Kant's "Critique of Pure Reason" (1781/1787) is widely considered the most important work in Western philosophy since Plato and Aristotle; its 856 pages synthesize rationalism and empiricism by arguing that the mind actively structures experience via categories and forms of intuition.

**F-012** — Hume's skepticism about causation: all we observe is constant conjunction (A followed by B); the "necessary connection" between cause and effect is a psychological habit of expectation, not an objective feature of reality.

**F-013** — The Principle of Non-Contradiction (Aristotle): it is impossible for something to be and not be at the same time and in the same respect. Considered the most fundamental law of logic; Hegel controversially challenged it with his dialectic; paraconsistent logics are formal systems tolerating contradictions without explosion.

**F-014** — The Trolley Problem was introduced by Philippa Foot in 1967 ("The Problem of Abortion and the Doctrine of Double Effect") and developed by Judith Jarvis Thomson; it has generated one of the largest empirical ethics literatures through cross-cultural moral psychology studies.

**F-015** — Peter Singer's "Famine, Affluence, and Morality" (1972) argued that affluent people have a strong moral obligation to donate to famine relief until they reach marginal utility; it is the philosophical foundation of the effective altruism movement.

**F-016** — John Rawls's "A Theory of Justice" (1971) is the most influential work of political philosophy of the 20th century; its veil of ignorance thought experiment and difference principle defined liberal egalitarianism for subsequent decades.

**F-017** — Robert Nozick's "Anarchy, State, and Utopia" (1974) was written explicitly as a response to Rawls; it argues from self-ownership and rights to libertarian minimal-state conclusions and sold over 1 million copies.

**F-018** — Aristotle's Nicomachean Ethics identifies eudaimonia (often translated "happiness" or "flourishing") as the highest human good, achieved through virtuous activity in accordance with reason over a complete life — not a momentary feeling but an activity.

**F-019** — Edmund Gettier's 1963 paper "Is Justified True Belief Knowledge?" is 3 pages long, contains two counterexamples, and generated thousands of papers; it remains one of the most impactful short papers in the history of philosophy.

**F-020** — The Sorites Paradox (heap paradox): if 1 million grains constitute a heap, removing one grain still leaves a heap; by repeated application, even 1 grain is a heap. Challenges classical bivalent logic; responses include fuzzy logic, supervaluationism, and contextualism about vagueness.

**F-021** — David Chalmers coined the term "hard problem of consciousness" in 1995; his 1996 book "The Conscious Mind" revived philosophical interest in consciousness as a genuine explanatory gap, not merely a scientific puzzle.

**F-022** — The Chinese Room argument (Searle, 1980): a person in a room following rules to manipulate Chinese symbols appears to understand Chinese from outside but does not understand it — programs manipulating syntax do not thereby have semantic understanding or consciousness.

**F-023** — Frank Jackson's Mary's Room thought experiment was published in "Epiphenomenal Qualia" (1982); Jackson himself later changed his position to physicalism (the ability hypothesis), demonstrating philosophy's self-correcting character.

**F-024** — Consequentialism was systematized by Jeremy Bentham in "An Introduction to the Principles of Morals and Legislation" (1789), which proposed a "felicific calculus" for measuring pleasure and pain across intensity, duration, certainty, propinquity, fecundity, purity, and extent.

**F-025** — Immanuel Kant articulated three formulations of the categorical imperative in "Groundwork of the Metaphysics of Morals" (1785); all are supposed to be equivalent, though philosophers disagree whether they yield the same results.

**F-026** — The term "paradigm shift" has become so widely used as to be largely stripped of its Kuhnian technical meaning (incommensurable scientific framework change); Kuhn himself expressed frustration at its popular trivialization.

**F-027** — Karl Popper's "The Logic of Scientific Discovery" (German 1934, English 1959) and "Conjectures and Refutations" (1963) established falsificationism; Popper applied it to demarcate science (falsifiable) from pseudoscience (unfalsifiable): astrology, Freudianism, and Marxism were his target examples.

**F-028** — W.V.O. Quine's "Two Dogmas of Empiricism" (1951, Philosophical Review) attacked the analytic-synthetic distinction and reductionism, and introduced the metaphor of the "web of belief" — one of the most cited philosophy papers of the 20th century.

**F-029** — Simone de Beauvoir's "The Second Sex" (1949) is the foundational text of feminist philosophy; her claim "One is not born, but rather becomes, a woman" introduced the sex/gender distinction central to feminist theory.

**F-030** — Epicurus (341–270 BCE) argued that death is nothing to us, since when death is, we are not, and when we are, death is not — an argument against fear of death grounded in the non-existence of the subject of harm.

**F-031** — The Stoics (Zeno, Epictetus, Marcus Aurelius) held that virtue is the only true good; externals (health, wealth, reputation) are "preferred indifferents." The dichotomy of control — distinguishing what is "up to us" (judgments, desires, actions) from what is not — is the operational core of Stoic practice.

**F-032** — Formal logic is complete and decidable for propositional logic (truth tables decide all valid sentences in finite time) and complete but not decidable for first-order logic (Church-Turing undecidability of FOL validity, 1936).

**F-033** — Bayesian epistemology represents beliefs as probability distributions and updates via Bayes' theorem: P(H|E) = P(E|H)P(H)/P(E). Dutch book arguments demonstrate that agents with incoherent degrees of belief are susceptible to sure-loss combinations of bets, motivating probabilistic rationality norms.

**F-034** — Hannah Arendt's "The Origins of Totalitarianism" (1951) and "The Human Condition" (1958) analyzed the conditions enabling totalitarian regimes and introduced the distinction between labor (biological necessity), work (durable artifact production), and action (political engagement among free individuals).

**F-035** — The Hard Problem of consciousness has resisted solution for over 25 years since Chalmers named it; leading positions include illusionism (Frankish: qualia don't exist as commonly conceived), IIT (Tononi: consciousness = integrated information Φ), and panpsychism (Goff: consciousness is fundamental).

**F-036** — Parfit's "Reasons and Persons" (1984) argued that personal identity over time is not what matters (what matters is psychological continuity) and that the separateness of persons objection to utilitarianism is weaker than assumed once personal identity is properly understood; it is among the most philosophically innovative books of the 20th century.

**F-037** — Modal realism (David Lewis, "On the Plurality of Worlds", 1986): possible worlds are as real as the actual world — the actual world is simply the one we inhabit. Lewis argued this is the most philosophically parsimonious account of modality, counterfactuals, and properties; it remains the most controversial position in contemporary metaphysics.

**F-038** — The naturalistic fallacy was named by G.E. Moore in "Principia Ethica" (1903); Moore argued that "good" is a simple, non-natural, indefinable property — known through a kind of moral intuition.

**F-039** — Decision theory combines probability theory and utility theory to determine rational choice: maximize expected utility (EU = Σ P(outcome) × U(outcome)). Allais paradox and Ellsberg paradox demonstrate systematic violations of expected utility theory in human decision-making.

**F-040** — Leibniz's monadology (1714) proposed that reality consists of infinite simple substances (monads) with no windows — they do not causally interact but are synchronized by God's pre-established harmony, one of the most elaborate metaphysical systems ever constructed.

**F-041** — The is-ought distinction was first articulated by David Hume in "A Treatise of Human Nature" (1739-1740), Book III, Part I, Section I — arguably the most important single paragraph in the history of ethics.

**F-042** — Effective altruism, philosophically grounded in Singer's consequentialism, has directed over $2 billion in charitable giving (2022) through organizations like GiveWell, Open Philanthropy, and EA Funds, representing a major real-world impact of academic philosophy.

**F-043** — Continental philosophy (Hegel, Nietzsche, Husserl, Heidegger, Sartre, Derrida, Foucault) and analytic philosophy (Russell, Moore, Wittgenstein, Carnap, Quine) diverged sharply in the early 20th century on method, style, and subject matter; the split remains significant but is increasingly bridged by cross-tradition scholarship.

**F-044** — Aristotle's excluded middle law: for any proposition P, either P or ¬P is true. Intuitionistic logic (Brouwer, Heyting) rejects the excluded middle: a mathematical proposition is true only if there is a constructive proof of it; existence proofs by contradiction (assuming non-existence and deriving a contradiction) are not accepted.

**F-045** — The Allegory of the Cave (Plato, Republic, Book VII) depicts prisoners in a cave watching shadows on a wall, mistaking them for reality — illustrating the difference between the world of appearances (sensory experience) and the world of Forms (true knowledge), accessible only through philosophical education.

---

*Pack ID: AXIOM-KP-T3-004 | Invariants satisfied: Determinism, Identity Primacy, Safety Dominance, Governance Supremacy, Physical Realism, Domain Integrity, Abstraction Coherence, Semantic Graph Consistency, Ontology Alignment, Safety-First Failure*
