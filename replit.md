# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Naming Conventions — Critical for All Build Agents

### Trust Layer vs. Trust Layer Ledger (TLL)

These are NESTED concepts. They do not conflict.

| Term | Scope | What It Is |
|------|-------|------------|
| **Trust Layer** | Ecosystem | The full platform: 42 apps, Signal token, identity layer, governance, DeFi architecture. Covered by US Provisional Patent 64/032,339 and DOI 10.5281/zenodo.19560674. References to the ecosystem, SSO, identity fabric, session management, and authorization always use "Trust Layer." |
| **Trust Layer Ledger (TLL)** | Service within Trust Layer | The specific verification and ledger service inside the Trust Layer ecosystem. Handles: hashing, sealing, hallmark stamping, and public verification of records. "Sealed on the TLL," "TLL-verified," and "Trust Layer Ledger stamp" are correct uses. |

**Analogy:** AWS is Trust Layer. AWS CloudTrail is TLL. Same relationship.

**Correct usage examples:**
- "Authenticated via Trust Layer SSO" ✅ (ecosystem function)
- "Identity managed by the Trust Layer" ✅ (ecosystem function)
- "Record sealed on the Trust Layer Ledger (TLL)" ✅ (ledger service function)
- "TLL-verified condition report" ✅ (ledger service function)
- "Part of the Trust Layer ecosystem, verified by the Trust Layer Ledger" ✅ (full sentence)
- "Renamed Trust Layer to TLL" ✗ (they are not the same thing)

The Zenodo paper (DOI: 10.5281/zenodo.19560674) correctly describes the Trust Layer ecosystem. No update or notation needed on that paper. TLL is an operational product name for the ledger service — it strengthens the ecosystem narrative by showing individual services now carry their own branded identity within the parent platform.

---

## DarkWave Studios LLC — Domain Registry

| Domain | Status | Purpose |
|--------|--------|---------|
| axiom42.com | Live | AXIOM deterministic agent — 181k topics, 148 domain packs, 11 specialty agents, <2ms response |
| lume42.com | Acquiring | Lume organism aggregate site — all 7 organisms (Meridian → GovernanceCore), 4/42 reference hub |
| lume-cortex.com | Registered | Lume-Cortex — the full operating system built on Lume; sits above the organism stack |
| lume-lang.org | Live | Lume Language Specification — canonical DOI property |
| vedasolus.io | Registered | BioCore target container |

**AXIOM Consumer Products** (spec: `axiom-consumer-suite-spec.md`):
AXIOM Neuro (NeuroCore) · AXIOM Bio (BioCore) · AXIOM Social (SocioCore) · AXIOM Daily (3-organism aggregate) · AXIOM Work (GovernanceCore + SocioCore, B2B)

**Key build documents:**
- `lume-engine-spec.md` — Lume Organism Engine full technical specification (node population, API endpoints, data source mappings, coupling logic, hard constraints)
- `master-build-handoff.md` — Master combined handoff: ecosystem + all 7 organisms + engine + lume42.com site + all 5 AXIOM products + build order
- `hydrocore-physical-spec.md` — Full engineering spec for the Deterministic Hydraulic Engine (BOM, firmware, 42-node sensor mapping, lag compensation, test harness)
- `hydrocore-physical-paper.md` — Canon² paper: HydroCore Physical — first physical instantiation of the Lume 4/42 architecture

**Product hierarchy:**
```
lume-cortex.com          ← Lume-OS: Deterministic Meta-Operating System
                            Browser-based OS shell (Windows/iOS hybrid)
                            Hosts and showcases all ecosystem products
                            Auth: Trust Layer SSO (already live)
        ├── lume42.com   ← Organism stack module (Meridian → GovernanceCore)
        │                   4/42 reference hub, 7 organisms, 294 nodes
        └── axiom42.com  ← AXIOM agent module
                            181k topics, 148 domain packs, <2ms response
                            Operates within organism governance framework

Trust Layer (DOI: 10.5281/zenodo.19560674)
        ↑ identity and auth fabric beneath all products
```

---

## AXIOM Engine Knowledge Packs

**Project:** Trust Layer Ecosystem — Lume Knowledge Pack Generation
**Author:** Jason Andrews, DarkWave Studios LLC
**ORCID:** 0009-0007-5214-649X | **Contact:** team@dwsc.io
**DOIs:** Lume=19382282, Trust Layer=19560674, DAIGS=19491784, Lume-V=19645097, Lume-X=19443968
**Patent:** 64/032,339

All packs live in `knowledge_packs/` and follow the strict 7-component format:
Purpose · Scope · Structure · Core Concepts (20–50) · Patterns (10–30) · Anti-Patterns (5–15) · Facts (30–100)

All 10 invariants are satisfied in every pack: Determinism, Identity Primacy, Safety Dominance, Governance Supremacy, Physical Realism, Domain Integrity, Abstraction Coherence, Semantic Graph Consistency, Ontology Alignment, Safety-First Failure.

### Tier Status

| Tier | Packs | Status |
|------|-------|--------|
| T1 (10 packs) | Core foundational domains | ✅ Complete |
| T2 (10 packs) | Applied/engineering domains | ✅ Complete |
| T3 (10 packs) | Wild-domain variety | ✅ Complete |
| T4 (10 packs) | Deep academic/professional domains | ✅ Complete |

### Tier 4 Packs (AXIOM-KP-T4-001 through T4-010)

| ID | Domain | File (numbered) |
|----|--------|-----------------|
| T4-001 | Mathematics | `036_mathematics_knowledge_pack.md` |
| T4-002 | Physics | `039_physics_2_knowledge_pack.md` |
| T4-003 | Chemistry | `032_chemistry_3_knowledge_pack.md` |
| T4-004 | Molecular Biology & Genetics | `038_molecular_biology_genetics_knowledge_pack.md` |
| T4-005 | Medicine & Clinical Practice | `037_medicine_clinical_practice_knowledge_pack.md` |
| T4-006 | Law & Jurisprudence | `035_law_jurisprudence_knowledge_pack.md` |
| T4-007 | Electrical Engineering & Electronics | `033_electrical_engineering_electronics_knowledge_pack.md` |
| T4-008 | Statistics & Data Science | `040_statistics_data_science_knowledge_pack.md` |
| T4-009 | Art History & Visual Arts | `031_art_history_visual_arts_knowledge_pack.md` |
| T4-010 | Finance & Investment Theory | `034_finance_investment_theory_knowledge_pack.md` |

**Total packs in `knowledge_packs/`:** 40 (T1–T4), numbered 001–040 in chronological creation order.

---

## Canon³ — The Lume Synthetic Organism Canon (L-SOC)

**Series name:** The Lume Synthetic Organism Canon
**Abbreviation:** L-SOC
**Series designation:** Canon³ (follows Canon¹ — original Lume papers; Canon² — organism spec papers)

All L-SOC papers follow the DarkWave Studios LLC Canon³ Technical Paper Series format: abstract, table of contents, full academic sections, appendices, and references. Files live in the project root.

### Meridian Papers

| File | Title |
|------|-------|
| `meridian-paper.md` | Meridian: A Four-Layer Deterministic Wireless Energy Routing Architecture |
| `meridian-paper-2.md` | Meridian as Synthetic Organism |
| `meridian-paper-3.md` through `meridian-paper-8.md` | Additional Meridian series papers |

### Lume Physical Flow Organism Papers

| File | Title |
|------|-------|
| `verdara-ultra-paper.md` | Verdara Ultra: A Four-Primitive Deterministic Outdoor Flow Organism |
| `hydrocore-paper.md` | HydroCore: A Four-Primitive Deterministic Hydrological Flow Organism |
| `biocore-paper.md` | BioCore: A Four-Primitive Deterministic Biological Flow Organism |
| `tri-organism-geometry-paper.md` | Tri-Organism Geometry: A Formal Interaction Framework for Lume-Native Physical Flow Organisms |

### L-SOC Papers — Physical Instantiation Series

| File | Title | Companion Spec |
|------|-------|---------------|
| `hydrocore-physical-paper.md` | HydroCore Physical — Physical Instantiation Vol. I | `hydrocore-physical-spec.md` |
| `hydrocore-drive-paper.md` | HydroCore Drive — Physical Instantiation Vol. II | `hydrocore-drive-spec.md` |
| `hydrocore-steam-paper.md` | HydroCore Steam — Physical Instantiation Vol. III | (no spec yet) |
| `4-hydrocore-nuclear-paper.md` | HydroCore Nuclear — Physical Instantiation Vol. IV | (no spec yet) |
| `meridian-infrastructure-paper.md` | Meridian Infrastructure — Infrastructure Vol. I | `meridian-infrastructure-spec.md` |

### L-SOC Papers — Cognitive Physical Instantiation Series

| File | Title | Notes |
|------|-------|-------|
| `4-neurocore-physical-paper.md` | NeuroCore Physical — Cognitive Physical Instantiation Vol. I | Neuromorphic computing substrate. 4 novel nodes: FS10 output quality, SL5 lifecycle fraction. Recursive governance: cognitive organism governing cognitive hardware. |

### L-SOC Papers — Biological Physical Instantiation Series

| File | Title | Notes |
|------|-------|-------|
| `4-biocore-physical-paper.md` | BioCore Physical — Biological Physical Instantiation Vol. I | Wearable biosensor array. 6 sensing modalities. 3 HC clinical alerts. First consumer L-SOC product. Novel nodes: SL10 physiological resilience, FS10 attentional flow proxy. |

### L-SOC Papers — Governance Physical Instantiation Series

| File | Title | Notes |
|------|-------|-------|
| `4-governancecore-physical-paper.md` | GovernanceCore Physical — Governance Physical Instantiation Vol. I | Institutional decision process governance. Process-level observation without content surveillance. Novel nodes: FS7 precedent coherence, SL10 long-term governance health. 3 HCs: quorum failure, COI, out-of-mandate. |

### L-SOC Papers — Social Network Series

| File | Title | Notes |
|------|-------|-------|
| `4-sociocore-network-paper.md` | SocioCore Network — Social Network Series Vol. I | Multi-agent coordination governance. Federated organism architecture. Novel nodes: PR8 trust deficit, FS7 AI-human collaboration flow. Cascade isolation theorem. Human-AI mixed network governance. |

### L-SOC Papers — Language Architecture Series

| File | Title | Notes |
|------|-------|-------|
| `dla-paper.md` | DLA: Deterministic Language Architecture — Language Architecture Vol. I | Category-defining paper. Coins "DLA." Hallucination impossibility theorem. Patent 64/032,339. |
| `4-axiom-consumer-suite-paper.md` | AXIOM Consumer Suite — Language Architecture Vol. II | Five DLA products: AXIOM Bio, Neuro, Social, Daily, Work. Organism grounding by product. Shared DLA composition engine. Trust Layer SSO. B2B audit trail. |

### L-SOC Papers — Automotive Series

| File | Title | Notes |
|------|-------|-------|
| `4-lume-auto-paper.md` | Lume-Auto: A Four-Primitive Deterministic Petroleum Engine Efficiency Organism — Automotive Vol. I | First petroleum engine organism. 42 nodes (TB10/PR10/FS12/SL10). Novel nodes: FS8 combustion cycle coherence, FS10 driver behavioral flow state, SL10 vehicle efficiency lifecycle score. Read-only governance architecture. HC1: no lean detonation, HC2: emissions inviolability, HC3: safety-critical suspension. Coupling: BioCore, HydroCore, Meridian. |

### Lume-Auto Product Package

| File | Contents |
|------|----------|
| `lume-auto-product.md` | Full commercial package: accessible whitepaper, landing page copy (all sections), investor narrative, press release, site blueprint, FAQ, build agent instructions |

### L-SOC Papers — Architecture Series

| File | Title | Notes |
|------|-------|-------|
| `4-lume-stack-paper.md` | The Lume Organism Stack — Architecture Vol. I | Canonical system-of-systems paper. All 7 layers. Coupling topology. Full-stack formal guarantees. The paper everything else cites. |
| `4-coupling-protocol-paper.md` | Organism Coupling: LIOCP — Architecture Vol. II | Formal inter-organism coupling protocol. NSEP format, α-bounded integration, mode-aware coupling, conflict resolution. Two worked examples. |
| `4-lume-formal-math-paper.md` | The Lume 4/42 Formal Mathematics — Architecture Vol. III | Complete formal dynamical system specification. Six theorems: compactness, determinism, hard constraint invariance, coupled determinism, mode stability, convergence. |
| `4-human-machine-coupling-paper.md` | Human-Machine Coupling — Architecture Vol. IV | First formal governance of the human-machine boundary. BioCore ↔ HydroCore coupling. Microsleep hard constraint. Causal model + full coupling table. |
| `4-lume-safety-certification-paper.md` | Safety and Certification — Architecture Vol. V | IEC 61508 / ISO 26262 / IEC 61511 framework. Translates organism formal properties to regulatory language. SIL assessment, ASIL D for HydroCore Drive H₂ isolation, safety case structure. |
| `4-lume-cortex-paper.md` | Lume-Cortex — Architecture Vol. VI | Deterministic meta-OS for the organism stack. Five modules: Lifecycle Manager, Coupling Registry, Query Router, State Display, Policy Enforcer. CCD version control. DLA as OS interface. |

### L-SOC Papers — Infrastructure Series

| File | Title | Notes |
|------|-------|-------|
| `meridian-infrastructure-paper.md` | Meridian Infrastructure — Infrastructure Vol. I | Single-segment roadway organism. First inter-organism coupling across physical system boundary. |
| `4-meridian-network-paper.md` | Meridian Network — Infrastructure Vol. II | City-scale federated Meridian mesh. Cascade isolation theorem. Load migration protocol. District and city mode hierarchy. Decade deployment path. |

**HydroCore Drive ↔ Meridian Infrastructure cross-boundary coupling:** First formal inter-organism coupling across a physical system boundary in the Canon² series. HydroCore (vehicle) and Meridian (road) exchange governance state bidirectionally at 100ms intervals. Coupling nodes: PR8, FS9, TB10 (HydroCore receives Meridian input); LD2, LD4 (Meridian receives HydroCore demand).

**HydroCore Steam scope:** 80% of global electricity (~22,400 TWh/year) is generated by steam turbines. HydroCore Steam applies the same 4/42 organism to nuclear, ultra-supercritical coal, combined-cycle gas, concentrated solar, and industrial process steam. Novel nodes: SL5 thermal creep accumulation (remaining-life estimation), SL3 real-time Campbell diagram resonance governance, asymmetric TB2 normalization for high-temperature operation, FS4 flash vaporization risk. Decade-scale deployment path with prior art anchored May 2026.

### Lume-Cognition Vertical Papers

| File | Title | Notes |
|------|-------|-------|
| `neurocore-paper.md` | NeuroCore: A Four-Primitive Deterministic Cognitive Flow Organism | First organism of the Cognitive Layer; formally coupled to BioCore |
| `sociocore-paper.md` | SocioCore: A Four-Primitive Deterministic Social Flow Organism | First organism of the Social Layer; formally coupled to NeuroCore and BioCore |
| `governancecore-paper.md` | GovernanceCore: A Four-Primitive Deterministic Governance Flow Organism | First organism of the Governance Layer; substrate for Trust Layer, Lume-QOS, DAMOS |

### Organism Specs (in `attached_assets/`)

| File | Description |
|------|-------------|
| `verdara_ultra_geometry_spec.md` | Verdara Ultra 2D/3D geometry spec |
| `HYDROCORE — 2D/3D GEOMETRY SPEC v1.0` | HydroCore 2D/3D geometry spec |

---

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   └── api-server/         # Express API server
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (single workspace package)
│   └── src/                # Individual .ts scripts, run via `pnpm --filter @workspace/scripts run <script>`
├── pnpm-workspace.yaml     # pnpm workspace (artifacts/*, lib/*, lib/integrations/*, scripts)
├── tsconfig.base.json      # Shared TS options (composite, bundler resolution, es2022)
├── tsconfig.json           # Root TS project references
└── package.json            # Root package with hoisted devDeps
```

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references. This means:

- **Always typecheck from the root** — run `pnpm run typecheck` (which runs `tsc --build --emitDeclarationOnly`). This builds the full dependency graph so that cross-package imports resolve correctly. Running `tsc` inside a single package will fail if its dependencies haven't been built yet.
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck; actual JS bundling is handled by esbuild/tsx/vite...etc, not `tsc`.
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array. `tsc --build` uses this to determine build order and skip up-to-date packages.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages that define it
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Routes live in `src/routes/` and use `@workspace/api-zod` for request and response validation and `@workspace/db` for persistence.

- Entry: `src/index.ts` — reads `PORT`, starts Express
- App setup: `src/app.ts` — mounts CORS, JSON/urlencoded parsing, routes at `/api`
- Routes: `src/routes/index.ts` mounts sub-routers; `src/routes/health.ts` exposes `GET /health` (full path: `/api/health`)
- Depends on: `@workspace/db`, `@workspace/api-zod`
- `pnpm --filter @workspace/api-server run dev` — run the dev server
- `pnpm --filter @workspace/api-server run build` — production esbuild bundle (`dist/index.cjs`)
- Build bundles an allowlist of deps (express, cors, pg, drizzle-orm, zod, etc.) and externalizes the rest

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL. Exports a Drizzle client instance and schema models.

- `src/index.ts` — creates a `Pool` + Drizzle instance, exports schema
- `src/schema/index.ts` — barrel re-export of all models
- `src/schema/<modelname>.ts` — table definitions with `drizzle-zod` insert schemas (no models definitions exist right now)
- `drizzle.config.ts` — Drizzle Kit config (requires `DATABASE_URL`, automatically provided by Replit)
- Exports: `.` (pool, db, schema), `./schema` (schema only)

Production migrations are handled by Replit when publishing. In development, we just use `pnpm --filter @workspace/db run push`, and we fallback to `pnpm --filter @workspace/db run push-force`.

### `lib/api-spec` (`@workspace/api-spec`)

Owns the OpenAPI 3.1 spec (`openapi.yaml`) and the Orval config (`orval.config.ts`). Running codegen produces output into two sibling packages:

1. `lib/api-client-react/src/generated/` — React Query hooks + fetch client
2. `lib/api-zod/src/generated/` — Zod schemas

Run codegen: `pnpm --filter @workspace/api-spec run codegen`

### `lib/api-zod` (`@workspace/api-zod`)

Generated Zod schemas from the OpenAPI spec (e.g. `HealthCheckResponse`). Used by `api-server` for response validation.

### `lib/api-client-react` (`@workspace/api-client-react`)

Generated React Query hooks and fetch client from the OpenAPI spec (e.g. `useHealthCheck`, `healthCheck`).

### `scripts` (`@workspace/scripts`)

Utility scripts package. Each script is a `.ts` file in `src/` with a corresponding npm script in `package.json`. Run scripts via `pnpm --filter @workspace/scripts run <script>`. Scripts can import any workspace package (e.g., `@workspace/db`) by adding it as a dependency in `scripts/package.json`.
