# DVE Product Brief

**Version:** 1.0  
**Last updated:** 2026-08-13  
**Status:** Direction approved  
**Owner:** Truth project

## Product thesis

Truth is a public research site with a provenance-first method. The Deterministic Verification Engine (DVE) is the productized analysis tool inside Truth: it helps a person turn public media into a traceable set of claims, evidence pointers, uncertainty, and follow-up research.

DVE should not be marketed as an oracle that decides whether a video is "true." It should be marketed as a **provenance and verification workspace** that makes the reasoning inspectable.

**One-sentence positioning:**

> Truth DVE turns a video or document into an inspectable claim record — with timecodes, source pointers, uncertainty, and a path to deeper research.

## Why this belongs inside Truth

- **Truth supplies the method.** `METHOD.md`, the Historical Record, Observatory data, and Physical Evidence case files give DVE a defensible evidence model.
- **DVE supplies the intake.** It decomposes media into claims and sources instead of duplicating that work in each research area.
- **Physical Evidence remains distinct.** A DVE report is a media-analysis result. A Physical Evidence case file is a curated record of setup, observation, controls, competing models, and replication. A report may later be promoted into a draft case file, but it must not silently become one.
- **The public corpus compounds.** Published reports become searchable research artifacts and can prevent repeated processing of the same source.

## Target users

### 1. Curious public users

They encounter a video making a consequential claim and want a calm, inspectable breakdown rather than a partisan verdict.

**Job story:** When I encounter a surprising video, I want to see what it actually claims and which parts are documented, contested, speculative, refuted, or unverifiable.

### 2. Independent researchers and journalists

They need repeatable media intake, timestamped claims, source links, transcripts, and shareable work products.

**Job story:** When I am investigating a claim, I want to turn source media into a structured research artifact that another person can audit.

### 3. Scientists and research groups

They need a controlled workspace, source verification, private drafts, exports, and eventual promotion into Physical Evidence records.

**Job story:** When a media source describes a physical experiment, I want to extract the relevant observations without losing missing controls, competing interpretations, or the original context.

## Core product principles

1. **Observation before interpretation.** Quote or transcribe what is present before evaluating it.
2. **No verdict inflation.** Paid plans never make labels more confident or more favorable.
3. **Every label is inspectable.** A label must expand to rationale, timecode, source pointers, and limitations.
4. **Uncertainty is a result.** `UNVERIFIABLE` is a valid outcome, not a failed product experience.
5. **Public by default, private by choice.** Public reports grow the research corpus; paid users can keep work private.
6. **One source, one canonical report.** Duplicate submissions should resolve to a cached report when the source and analysis configuration match.
7. **Human review for consequential use.** DVE assists research; it does not certify legal, medical, scientific, or safety-critical claims.
8. **Method over brand neutrality theater.** The product shows its method and evidence trail instead of promising impossible objectivity.

## Product surface

### Public Truth site

The public site remains accessible without an account:

- Browse Observatory measurements, Historical Record entries, Physical Evidence case files, and published DVE reports.
- Submit a limited number of public media sources for analysis.
- Read the resulting report when processing is complete.
- Open expandable claim cards with labels, timecodes, rationale, and sources.
- Share published reports through stable links.

### DVE workspace

The workspace is the paid and account-based layer:

- Saved report library and search.
- Full transcript and structured claim export.
- Private reports and team workspaces.
- Re-analysis when the source changes or the methodology improves.
- Source retrieval and verification records.
- Watchlists for recurring claims or updated source media.
- Promotion of qualifying reports into Physical Evidence case-file drafts.

### Supported media rollout

The product should expand in stages rather than promise "any media" on day one:

1. **Current:** public video URLs.
2. **Next:** YouTube and Rumble verification, with platform-specific retrieval tests and clear unsupported-platform errors.
3. **Then:** uploaded video and audio files with size, duration, and retention limits.
4. **Then:** public documents and PDFs, with page-level citations and extracted text.
5. **Later:** images and social posts, only when the system can preserve the original asset and distinguish image content from caption/context.

The interface may eventually say "media," but marketing copy must name the formats actually supported by the current release.

## Access and pricing model

Pricing below is a starting hypothesis for validation, not a promise.

### Public / Free

Purpose: demonstrate the method and build the public corpus.

- Limited analysis submissions per day or month.
- Public reports by default.
- Standard processing queue.
- Expandable claim-level report.
- Stable sharing for published reports.
- No private research library or bulk export.

### Pro — hypothesis: $15–20/month

Purpose: serve regular independent researchers, journalists, and serious users.

- Higher or unlimited fair-use submission allowance.
- Saved reports and searchable history.
- Private reports with share-by-link controls.
- Full transcript and JSON/CSV export.
- Priority processing.
- Re-analysis when the source or analysis version changes.
- Claim and source watchlists.
- Report annotations and research notes.

### Research / Team — hypothesis: $99+/month

Purpose: support labs, newsrooms, nonprofits, and collaborative investigations.

- Multiple members and roles.
- Shared private workspace.
- API access and batch submission.
- Configurable retention and export.
- Verified-source retrieval with archived retrieval metadata.
- Custom reference packs or organization-provided documents.
- Physical Evidence draft promotion.
- Usage controls and an auditable activity log.

### What is not paywalled

- The method and label definitions.
- Published public reports.
- The ability to inspect why a claim received a label.
- Access to public Observatory and Historical Record material.

The paid product sells **workflow, scale, privacy, and reproducibility**, not privileged truth.

## Report visibility and caching

The recommended policy is **public by default with a paid privacy opt-out**.

- A free submission produces a public report unless the user explicitly has a private-capable plan.
- Pro and Research users can choose public, unlisted, or private.
- Public reports are indexed only when the submitter allows indexing; unlisted reports are accessible by stable link but omitted from search.
- A canonical source fingerprint should prevent duplicate processing when URL, retrieved media identity, and analysis configuration match.
- A new analysis version must not silently overwrite an old report. Preserve the original result and show which engine version produced each report.
- Reports must retain retrieval metadata and a clear statement of what was and was not checked.

## Trust and safety boundaries

DVE must not:

- Present an LLM-generated source URL as verified without fetching it.
- Treat a `DOCUMENTED` claim as true; it means the record or source exists and resolves.
- infer motive, intent, or criminality from a video.
- expose private uploads or reports through predictable URLs.
- allow a report to be presented as scientific certification, legal advice, medical advice, or an official fact-check.
- claim to have analyzed a format or source that the current pipeline cannot actually retrieve.

Reports should include:

- Retrieval timestamp and source URL.
- Media identity or hash when available.
- Engine and analysis version.
- Transcript confidence and known gaps.
- Claim label definitions.
- Source status: checked, unreachable, redirected, or not yet checked.
- A visible "human review recommended" notice for consequential decisions.

## Success metrics

Early metrics should test whether DVE is useful and trusted before optimizing revenue:

### Activation

- Percentage of visitors who submit a valid supported source.
- Percentage of accepted jobs that reach a completed report.
- Time from submission to first useful claim.

### Trust and usefulness

- Report expansion rate: users opening rationale and source details.
- Share rate for completed reports.
- User-reported helpfulness and source-quality feedback.
- Percentage of reports ending in `UNVERIFIABLE` that users understand rather than treating as a system failure.

### Retention and business

- Free-to-returning-user conversion.
- Pro trial-to-paid conversion.
- Monthly retained researchers.
- Paid reports per active account, balanced against compute cost.
- Percentage of repeat submissions served from a valid canonical report.
- Team workspace retention and export/API usage.

Do not use "number of verdicts" as the primary success metric. It rewards overconfident output and conflicts with Truth's method.

## Delivery sequence

### Now

- Keep Phase 1 video submission and shareable reports stable.
- Make YouTube and Rumble reliable.
- Add clear unsupported-source and processing-error states.
- Define the report schema and engine-version fields before adding more media types.

### Next

- Add account identity and a saved report library.
- Add durable job state and restart recovery.
- Add rate limits, concurrency limits, and video resource caps.
- Add source retrieval/verification and source-status display.
- Add public/unlisted/private visibility.

### Later

- Add paid billing and usage entitlements.
- Add transcript/JSON/CSV exports, watchlists, and re-analysis.
- Add team workspaces and API access.
- Add document/PDF intake.
- Add the reviewed DVE-to-Physical-Evidence promotion flow.

## Non-goals

- Building a generic social-media moderation product.
- Replacing journalists, scientists, or peer review.
- A universal truth score from 0 to 100.
- A second independent video-to-case-file pipeline.
- Selling access to a hidden "better" verdict model.
- Launching a separate DVE brand before Truth's public research corpus and method are established.

## Open decisions

1. Exact free-tier allowance and fair-use policy.
2. Whether free reports are automatically public or require an explicit publish action.
3. Billing provider and account/authentication system for the Coolify deployment.
4. Retention period and storage cost policy for uploaded media.
5. Whether custom reference packs are available in Pro or only Research.
6. Which source types qualify for Physical Evidence promotion.
7. Whether public reports are indexed by search engines or only discoverable inside Truth.

## Decision rule

If a feature makes DVE look more like a fast verdict generator and less like a traceable research instrument, it is probably the wrong feature — even if it increases short-term submission volume.