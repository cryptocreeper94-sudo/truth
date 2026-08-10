# TRUTH — Provenance-First Evidence Archive

> **Live:** [truth.tlid.io](https://truth.tlid.io)  
> **Architecture:** DDA 42-Doctrine / Deterministic Dissolution Ladder  
> **Author:** Andrews, Ronald Jason — DarkWave Studios LLC  
> **License:** CC-BY-4.0

---

## What this is

A **provenance-first archive** of historical claims, the sources behind them, and the documented gaps between them. Topic-agnostic. The archive is the framework itself.

This is not a collection of things we believe. It is a **case file system** — right or wrong, we document it all and allow the user to figure it out. The method outranks any conclusion.

## The three iron rules

1. **Every claim carries a confidence tag.** DOCUMENTED / CONTESTED / SPECULATIVE. No untagged claims. Ever.
2. **Every link between claims is typed and tagged.** A connection is itself a claim. "These sources use identical phrasing" (documented) ≠ "these events feel related" (speculative). Speculative links never count as corroboration.
3. **Motive is argued last, from documented links only.** "Who benefits" is a conclusion the evidence earns, never an assumption the evidence is arranged around.

## Structure

```
README.md              — this file
METHOD.md              — the full specification: tiers, tags, link types, ID scheme
site/                  — static SPA (Brutalist Apex UI, hash-based routing)
  index.html           — full archive frontend (reads from GitHub API)
  style.css            — Apex UI design system
claims/                — claim cards: one file per claim, tagged and sourced
sources/tier-1/        — source records: physical survivors (manuscripts, maps,
                         statutes, patents, institutional records)
digs/                  — dig sites: investigation trenches gathering claims,
                         sources, and links around one question
daemon/                — Truth Sentinel research daemon (42-doctrine aligned)
  daemon.mjs           — deterministic research engine
  start.sh             — Coolify startup script
Dockerfile             — nginx:alpine for static site (truth.tlid.io)
Dockerfile.daemon      — node:20-slim for Truth Sentinel daemon
nginx.conf             — nginx config with /health endpoint
```

## Current Archive

| Category | Count | Examples |
|---|---|---|
| **Claims** | 20+ | Table of Nations, calendar reform, orphan trains, cartography, meltology |
| **Sources** | 26+ | Dead Sea Scrolls, Josephus, Encyclopædia Britannica, Kebra Nagast |
| **Digs** | 12+ | Lineage of Nations, Civilization Resets, Buried Architecture, Monetary |

## Community Discussion

Every claim, source, and dig detail page includes a built-in discussion panel. Comments are tagged:

- **SOURCED** — backed by a verifiable reference
- **QUESTION** — seeking clarification or additional evidence
- **OPINION** — clearly labeled interpretation
- **LEAD** — pointer to uninvestigated material

## Truth Sentinel — Research Daemon

An autonomous, budget-governed research engine that continuously mines new claims and sources, following the METHOD strictly. Deployed as a separate Coolify container.

- **Architecture:** 42-doctrine Deterministic Dissolution Ladder
- **Model:** GPT-4o (configurable)
- **Cycle:** Every 6 hours, 3 claims per cycle
- **Budget:** $30/30 days with pause threshold at 95%
- **Audit:** Append-only log, SHA-256 on every artifact, git commit chain

Key doctrine mappings:
- `[02] Boundary Engine` → METHOD.md as hard law
- `[14] Determinacy Engine` → every claim traceable to a source
- `[34] Invariance Layer` → METHOD.md hash tracking
- `[37] Null Boundary Guard` → no claim without a cited source

## Deployment

| Component | Stack | URL |
|---|---|---|
| **Site** | nginx:alpine → Coolify | [truth.tlid.io](https://truth.tlid.io) |
| **Sentinel** | node:20-slim → Coolify | Internal (port 4242) |

```bash
# Local development
# Open site/index.html in browser — reads from GitHub API

# Docker (site)
docker build -t truth-site .
docker run -p 80:80 truth-site

# Docker (daemon)
docker build -f Dockerfile.daemon -t truth-sentinel .
docker run -e OPENAI_API_KEY=xxx truth-sentinel
```

## What this archive is not

- Not a wiki of conclusions. Evidence and its sorting live here.
- Not a place where a pile of speculative links adds up to proof. It doesn't, and the tags exist so it can't.
- Not finished. Entries get demoted as well as promoted. The willingness to rule against ourselves is the feature.

---

*Part of the Invariant Ecosystem — DarkWave Studios LLC*
