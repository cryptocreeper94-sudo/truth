---
name: Truth project
description: Current Truth product structure and provenance rules, including its historical record and future observatory sections.
---
Truth is the current product and repository at cryptocreeper94-sudo/truth. The former Strata Archive name is obsolete and should not be used in product copy or planning.

Truth has two planned sections:
- Historical Record: claims, sources, links, and digs governed by METHOD.md.
- Observatory: continuously collected atmospheric, geophysical, infrastructure, and RF observations with synchronized visual replay and provenance-preserving event records.

Physical Evidence case files are a cross-cutting record type inside Truth, not a separate app or repository. They can link Historical Record claims to Observatory measurements, experiments, source media, methods, and analysis while preserving observation and interpretation as separate layers.

The Observatory is part of Truth, not a separate Strata product. It may later provide documented source material for historical-record claims, but observation and interpretation remain separate. Keep the product consolidated in the existing monorepo; prefer new modules/routes/data types over new standalone apps.

METHOD.md remains the governing provenance standard. DOCUMENTED means the record exists and its pointer resolves; it does not mean the claim is true. Both sides of a dispute may be documented.

The live site is a static SPA with a Truth Sentinel daemon on Coolify. Auto-deploy is off, PM2 is banned, and daemon state must not be mounted over the application code.

**Why:** the historical archive and the new observatory share the same evidentiary discipline and product identity, while requiring separate data models and operating concerns.

**How to apply:** use “Truth,” “Historical Record,” “Observatory,” and “Physical Evidence” as sections or record types within the existing product. Do not create a new standalone project for physical-evidence research. Do not reintroduce “Strata” unless discussing the obsolete historical name.

The Deterministic Verification Engine (DVE) owns media ingestion and decomposition: downloading a source, extracting audio/video/text, identifying claims, checking them against sources, and producing claim-level verification reports. Physical Evidence case files are a downstream promotion/curation record for selected physical experiments or observations; they should consume DVE outputs rather than duplicate ingestion, transcription, or claim verification.

**Why:** DVE answers “what claims are in this media and what evidence bears on each claim?” A Physical Evidence case file answers “what exact physical setup, observation, competing predictions, controls, and replication record can be preserved?” The scopes overlap at the source and claim layers but are not the same artifact.

**How to apply:** keep generic videos as DVE reports. Only offer a later “promote to Physical Evidence” flow when a source documents a qualifying physical experiment or observation. Map timecodes, extracted measurements, hashes, and linked sources into a draft case file, explicitly flag missing setup/environmental fields, and require human review. Do not build a second video-to-case-file extraction engine.