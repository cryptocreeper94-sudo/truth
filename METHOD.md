# METHOD — the full specification

This file is the law of the archive. If an entry conflicts with this file, the entry is wrong.

## 1. Source tiers

Sources are ranked by **how hard they are to retroactively edit**, not by who published them.

| Tier | Name | What belongs | Status |
|------|------|-------------|--------|
| 1 | Physical survivors | Old maps, first editions, gravestones, buildings, coins, patents, court records, ship manifests — anything existing in scattered physical copies the pen cannot reach after the fact | **OPEN** |
| 2 | Contemporary record | What people wrote *at the time*: newspapers of that week, diaries, letters, church registers, insurance and grain ledgers | specified, not yet open |
| 3 | Official narrative (as exhibit) | Textbooks, encyclopedias, institutional histories — catalogued as *claims*, never as truth; edition diffs are the evidence | specified, not yet open |
| 4 | Testimony & tradition | Oral histories, tribal accounts, family stories, deathbed witnesses — real, valuable, tagged as what they are | specified, not yet open |
| 5 | The absence catalogue | Records that should exist and don't. Absence counts ONLY when expected presence is documented (a fire with a date and a manifest of what it took) | specified, not yet open |

**Special rule for racial history:** this is the territory of the pen's ugliest work AND the most active modern falsification in both directions. Tier-1-or-silence. No exceptions.

## 2. Confidence tags (claims)

- `DOCUMENTED` — supported by Tier 1–2 sources with checkable provenance.
- `CONTESTED` — credible sources genuinely conflict; both sides recorded.
- `SUPPRESSED-IF-TRUE` — a claim whose supporting record shows documented signs of removal or alteration; the suppression evidence must itself be cited.
- `SPECULATIVE` — an honest hypothesis. Allowed to exist; never allowed to corroborate anything.

Demotion is normal. A claim moving from DOCUMENTED to CONTESTED is the system working.

## 3. Link types (connections between entries)

Every link is itself a claim and carries its own confidence tag.

- `TEXTUAL-MATCH` — identical or near-identical wording across supposedly independent sources. Quote both passages.
- `CHRONOLOGY` — a dated sequence (e.g., narrative flips in lockstep after a specific year). Cite the dated exhibits.
- `PROVENANCE` — documented chain of custody between sources (one copied/derived from another).
- `ABSENCE` — a documented gap connecting entries (requires the Tier-5 standard even before Tier 5 opens).
- `THEMATIC` — "these feel related." Always tagged SPECULATIVE. **Never counts as corroboration. Two thematic links do not equal one textual match. A thousand don't.**

## 4. ID scheme & file format

- Sources: `S-0001`, one file per source in `sources/tier-<n>/S-0001-short-slug.md`
- Claims: `C-0001`, one file per claim in `claims/C-0001-short-slug.md`
- Links: `L-0001`, one file per link in `links/L-0001-short-slug.md`
- Digs: named, not numbered: `digs/new-madrid-1811.md`

Every file opens with YAML frontmatter (see TEMPLATE.md in each directory). IDs are permanent; a retired entry is marked `status: retired` with a reason, never deleted — the archive's own history is part of the record.

## 5. Writing standard

- Documentary voice. Presented, not asserted. Objections recorded at full strength inside the entry.
- A source record describes what the object IS and where a reader can verify it (institution, catalog number, scan URL). It does not argue.
- A claim card argues only from listed sources. If the argument needs a source not listed, the card isn't done.
- Motive ("who benefits") appears only in dig-site files, argued exclusively from DOCUMENTED links.

## 6. Completeness & anti-partiality (the "no cherry-picking" rules)

- **The hunting map.** MANIFEST.md lists the collections where Tier-1 material lives and their search status. Unexamined territory must be on the record; an unknown gap is partiality, a recorded gap is a to-do.
- **Corpus statements.** Any claim card asserting a *pattern* (a change over time, a consistency across sources) must state the known corpus and the examined fraction — e.g., "23 catalogued plate states exist; 7 examined." A pattern claimed without a corpus statement is capped at SPECULATIVE regardless of how good the examples are.
- **Counter-exhibits are mandatory.** Every dig site file carries a "Counter-exhibits" section listing Tier-1 objects that cut AGAINST the dig's working question, catalogued with identical care. A dig with an empty counter-exhibits section and more than three supporting claims is flagged non-compliant until someone has genuinely looked. An archive where every exhibit points one direction is evidence of curation, not of truth.

## 7. Order of work

Start from trenches already opened by *Through The Veil* — map chronology, calendar record, name transliterations, New Madrid 1811 — where the source trail is personally known. Expand outward from proven trenches. Never bulldoze the whole field.
