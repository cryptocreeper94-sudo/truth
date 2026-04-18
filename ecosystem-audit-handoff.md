# Lume DAIGS Ecosystem — Complete Audit Handoff
**All 42 Canonical Papers | April 2026**
**Purpose:** Fix every DOI error across all 42 papers in one pass using concept DOIs. After this fix, re-uploading any paper will never break another paper's citations again.

---

## THE ROOT CAUSE — AND THE PERMANENT FIX

**Why citations keep breaking:** Every time you re-upload a paper to Zenodo, it gets a new version-specific DOI. Any other paper citing that version DOI is now pointing at an old version. The more papers you update, the more citations break. This is the circular trap.

**The permanent solution: Concept DOIs.**

Zenodo assigns every paper two kinds of DOIs:
1. **Version DOI** — points to one specific upload. Changes every re-upload.
2. **Concept DOI** — points to the paper as a whole, always resolves to the latest version. Never changes, no matter how many times you re-upload.

All 42 cross-citations in this ecosystem must use concept DOIs. Once you make this change, you can re-upload any paper as many times as you want and nothing else breaks.

---

## MASTER CONCEPT DOI TABLE — USE THESE EVERYWHERE

These are the permanent, version-agnostic DOIs to cite in every paper. Never cite a version DOI in a cross-reference again.

| Paper | Concept DOI (cite this) | Current Version DOI (do not cite in other papers) |
|---|---|---|
| Lume (compiler) | `10.5281/zenodo.19382282` | `10.5281/zenodo.19612948` |
| Lume-V | `10.5281/zenodo.19463415` | `10.5281/zenodo.19596736` |
| Lume-X | `10.5281/zenodo.19443967` | `10.5281/zenodo.19596693` |
| Lume-Relational | `10.5281/zenodo.19597341` | `10.5281/zenodo.19597342` |
| The Lume Ecosystem | `10.5281/zenodo.19509860` | `10.5281/zenodo.19596608` |
| The Trust Layer (book) | `10.5281/zenodo.19560674` | `10.5281/zenodo.19596531` |
| TLPP | `10.5281/zenodo.19571978` | `10.5281/zenodo.19596406` |
| Lume-Quantum | `10.5281/zenodo.19578113` | `10.5281/zenodo.19596371` |
| Lume-Chronos | `10.5281/zenodo.19596253` | `10.5281/zenodo.19596254` |
| Lume-Causal | `10.5281/zenodo.19596130` | `10.5281/zenodo.19596131` |
| Lume-Identity | `10.5281/zenodo.19595746` | `10.5281/zenodo.19595747` |
| Lume-Dimensional | `10.5281/zenodo.19595592` | `10.5281/zenodo.19595965` |
| Lume-OS v2 | `10.5281/zenodo.19501103` | `10.5281/zenodo.19559355` |
| Lume-OS v1 | `10.5281/zenodo.19475103` | `10.5281/zenodo.19559307` |
| Lume-Ops v2 | `10.5281/zenodo.19500229` | `10.5281/zenodo.19559266` |
| Lume-Ops v1 | `10.5281/zenodo.19487668` | `10.5281/zenodo.19559242` |
| DAIGS-Fusion | `10.5281/zenodo.19509694` | `10.5281/zenodo.19559081` |
| DAIGS v3 | `10.5281/zenodo.19546191` | `10.5281/zenodo.19559064` |
| DAIGS v2 | `10.5281/zenodo.19501314` | `10.5281/zenodo.19559020` |
| DAIGS Master Taxonomy | `10.5281/zenodo.19491784` | `10.5281/zenodo.19558908` |
| Lume-Fin | `10.5281/zenodo.19435714` | `10.5281/zenodo.19558853` |
| Lume-Gov | `10.5281/zenodo.19474510` | `10.5281/zenodo.19558825` |
| Lume-Def | `10.5281/zenodo.19474750` | `10.5281/zenodo.19558713` |
| Lume-Cyber | `10.5281/zenodo.19509049` | `10.5281/zenodo.19558639` |
| Lume-Ind | `10.5281/zenodo.19440679` | `10.5281/zenodo.19558522` |
| Lume-Space | `10.5281/zenodo.19484776` | `10.5281/zenodo.19558493` |
| Lume-Aero | `10.5281/zenodo.19474585` | `10.5281/zenodo.19558406` |
| Lume-Auto | `10.5281/zenodo.19485587` | `10.5281/zenodo.19558317` |
| Lume-Civ | `10.5281/zenodo.19485018` | `10.5281/zenodo.19558246` |
| Lume-Grid | `10.5281/zenodo.19485365` | `10.5281/zenodo.19558218` |
| Lume-Energy | `10.5281/zenodo.19472759` | `10.5281/zenodo.19558030` |
| Lume-Env | `10.5281/zenodo.19485823` | `10.5281/zenodo.19557990` |
| Lume-Geo | `10.5281/zenodo.19508415` | `10.5281/zenodo.19557797` |
| Lume-Hydro | `10.5281/zenodo.19486693` | `10.5281/zenodo.19557771` |
| Lume-Mar | `10.5281/zenodo.19508901` | `10.5281/zenodo.19557753` |
| Lume-Agri | `10.5281/zenodo.19485202` | `10.5281/zenodo.19557698` |
| Lume-Med | `10.5281/zenodo.19434969` | `10.5281/zenodo.19557655` |
| Lume-LifeBio | `10.5281/zenodo.19508754` | `10.5281/zenodo.19557627` |
| Lume-Com | `10.5281/zenodo.19509633` | `10.5281/zenodo.19557601` |
| Lume-Food | `10.5281/zenodo.19499845` | `10.5281/zenodo.19557556` |
| Lume-Edu | `10.5281/zenodo.19509312` | `10.5281/zenodo.19557472` |
| Lume-Omni | `10.5281/zenodo.19548261` | `10.5281/zenodo.19557371` |

> **Important note on Lume compiler:** The concept DOI for Lume is `10.5281/zenodo.19382282` — the same number that appeared as a "stale" version DOI in the old audit. It isn't stale. It is the concept DOI, which is why it resolved correctly for most readers. The papers citing `19382282` were accidentally citing the right thing. However, going forward be explicit: cite it as the concept DOI intentionally, not because it happens to match an old version.

---

## 🔴 CRITICAL ERRORS — Three Papers Cite Completely Wrong Documents

These are not DOI staleness issues. These are citations that resolve to documents with no relation to the ecosystem. Fix these first.

---

### CRITICAL-1: Lume-Quantum cites the Shadow Burn article as DAIGS Master Taxonomy

**Paper:** Lume-Quantum (`19596371`)
**Error:** Three locations cite `10.5281/zenodo.19512459` as the DAIGS Master Taxonomy.
**What that DOI actually is:** "THE SHADOW BURN: What If the Virality Was the Extraction? (Ontario Combustion Claims)" — a completely unrelated document.
**Fix:** Replace `10.5281/zenodo.19512459` → `10.5281/zenodo.19491784` (DAIGS Master Taxonomy concept DOI) in all three locations: header Related Work block, body citation, and References entry.

---

### CRITICAL-2: Six Papers Cite a French Humanities Article as Lume-Civ

**Papers:** Lume-Edu (`19557472`), Lume-Com (`19557601`), DAIGS Master Taxonomy (`19558908`), DAIGS v2 (`19559020`), Lume-Ops v2 (`19559266`), Lume-OS v2 (`19559355`)
**Error:** All six cite `10.5281/zenodo.19485506` as Lume-Civ.
**What that DOI actually is:** "La géométrie des sensibilités — Vers une reconstruction riemannienne de l'histoire des arts" — a French language humanities paper by a different author.
**Fix:** Replace `10.5281/zenodo.19485506` → `10.5281/zenodo.19485018` (Lume-Civ concept DOI) in all six papers.

---

### CRITICAL-3: Lume-Edu Cites a Deleted Record as Lume-Auto

**Paper:** Lume-Edu (`19557472`)
**Error:** `10.5281/zenodo.19484695` is cited as Lume-Auto. That record no longer exists on Zenodo (returns 404).
**Fix:** Replace `10.5281/zenodo.19484695` → `10.5281/zenodo.19485587` (Lume-Auto concept DOI) in the header, body, and references.

---

## STALE DOI CORRECTION MAP

Every non-concept DOI currently cited across the 42 papers, with its correct concept DOI replacement. After converting to concept DOIs, this entire map becomes permanently irrelevant — no future re-upload will ever create a new entry here.

| DOI Currently Cited (stale version DOI) | Paper | Replace With (concept DOI) |
|---|---|---|
| `10.5281/zenodo.19463416` | Lume-V | `10.5281/zenodo.19463415` |
| `10.5281/zenodo.19559423` | Lume-V | `10.5281/zenodo.19463415` |
| `10.5281/zenodo.19443968` | Lume-X | `10.5281/zenodo.19443967` |
| `10.5281/zenodo.19559388` | Lume-X | `10.5281/zenodo.19443967` |
| `10.5281/zenodo.19475104` | Lume-OS v1 | `10.5281/zenodo.19475103` |
| `10.5281/zenodo.19501104` | Lume-OS v2 | `10.5281/zenodo.19501103` |
| `10.5281/zenodo.19499466` | Lume-Med | `10.5281/zenodo.19434969` |
| `10.5281/zenodo.19488366` | Lume-Fin | `10.5281/zenodo.19435714` |
| `10.5281/zenodo.19487669` | Lume-Ops v1 | `10.5281/zenodo.19487668` |
| `10.5281/zenodo.19440680` | Lume-Ind (cited as Ops) | `10.5281/zenodo.19440679` |
| `10.5281/zenodo.19486295` | Lume-Ind | `10.5281/zenodo.19440679` |
| `10.5281/zenodo.19475426` | Lume-Aero | `10.5281/zenodo.19474585` |
| `10.5281/zenodo.19485506` | Lume-Civ (WRONG — is French paper) | `10.5281/zenodo.19485018` |
| `10.5281/zenodo.19484695` | Lume-Auto (WRONG — is deleted) | `10.5281/zenodo.19485587` |
| `10.5281/zenodo.19486694` | Lume-Hydro | `10.5281/zenodo.19486693` |
| `10.5281/zenodo.19501315` | DAIGS v2 | `10.5281/zenodo.19501314` |
| `10.5281/zenodo.19491785` | DAIGS Master Taxonomy | `10.5281/zenodo.19491784` |
| `10.5281/zenodo.19512459` | DAIGS Master Taxonomy (WRONG — is Shadow Burn) | `10.5281/zenodo.19491784` |
| `10.5281/zenodo.19475366` | Lume-Energy | `10.5281/zenodo.19472759` |
| `10.5281/zenodo.19560675` | The Trust Layer (book) | `10.5281/zenodo.19560674` |
| `10.5281/zenodo.19485824` | Lume-Env | `10.5281/zenodo.19485823` |
| `10.5281/zenodo.19485203` | Lume-Agri | `10.5281/zenodo.19485202` |
| `10.5281/zenodo.19474511` | Lume-Gov | `10.5281/zenodo.19474510` |
| `10.5281/zenodo.19499846` | Lume-Food | `10.5281/zenodo.19499845` |
| `10.5281/zenodo.19475467` | Lume-Def | `10.5281/zenodo.19474750` |
| `10.5281/zenodo.19484777` | Lume-Space | `10.5281/zenodo.19484776` |
| `10.5281/zenodo.19580740` | Lume-Quantum | `10.5281/zenodo.19578113` |
| `10.5281/zenodo.19433981` | Lume/Lume-V old bundle | `10.5281/zenodo.19382282` (Lume) or `10.5281/zenodo.19463415` (Lume-V) depending on context |
| `10.5281/zenodo.19430898` | Lume (old version) | `10.5281/zenodo.19382282` |
| `10.5281/zenodo.19559443` | Lume (intermediate version) | `10.5281/zenodo.19382282` |

---

## UNIVERSAL CONTENT FIXES

Apply these across all 42 papers in the same pass.

---

### UNI-1: "The First" Claims Need Hedging

Over 24 papers open with or contain "the first deterministic governance substrate / architecture / system / classification" with no qualification. This is an invitation for rejection at any formal venue.

**Find:** `the first deterministic`
**Replace:** `to our knowledge, the first deterministic`

Also apply to:
- "the first governance architecture that..."
- "the first distributed multi-agent..."
- "the first complete, hierarchical classification..."
- "the first to satisfy them"
- "For the first time, enterprises can..." (in TLPP conclusion → "For the first time, to our knowledge, enterprises can...")

---

### UNI-2: Semantic "Validated" → "Demonstrated"

Where "validated" means "we proved this approach works" (not the technical operation of validating a proposal against invariants), replace with "demonstrated."

**Replace:**
- `validated across` → `demonstrated across`
- `has been validated` → `has been demonstrated`
- `validates the DAIGS approach` → `demonstrates the DAIGS approach`
- `validated by [N papers / N verticals]` → `demonstrated by`

**Do NOT change:** `validates the proposal`, `validates invariants`, `validates certificates` — those are correct technical uses.

---

### UNI-3: SHA-256 → SHA3-256 in 5 Papers

These papers use SHA-256 in certificate or hash computation contexts where the ecosystem standard is SHA3-256:

- Lume (compiler) `19612948` — `SHA-256 tamper-evident certificate`
- Lume-V `19596736` — `Input hash: SHA-256 hash of the normalized input`
- Lume-Relational `19597342` — `RelHash = SHA-256(PayloadData + ...)`
- Lume-Quantum `19596371` — `SHA-256(analysis_hash || data_hash || ...)`
- DAIGS v3 `19559064` — `"certificate_id": "SHA-256 cert_id"` in JSON example

**Fix:** Replace SHA-256 with SHA3-256 in all certificate and hash computation contexts in these five papers. In the Lume compiler paper, add a versioning note: *"Early LTC v1.0 prototypes used SHA-256. The canonical certificate format uses SHA3-256 throughout."*

---

### UNI-4: Remove Remaining "(Conceptual)" Labels

**Papers with "(Conceptual)" still present:**
- DAIGS-Fusion (`19559081`)
- Lume (compiler) (`19612948`)

Replace "(Conceptual)" with "(Illustrative)" or "(Simulated scenario)" as appropriate to the context, or remove the label entirely. "Conceptual" signals to external readers that the system has never run.

---

## SPECIFIC PAPER FIXES

---

### TLPP (`10.5281/zenodo.19596406`)

**Fix 1 — The "0 bits" contradiction:**
Section 7.7 table shows "Information Leaked: 0 bits" for all five scenarios. Section 8.2 states "transaction graph metadata (who transacts with whom, how often, at what times) remains visible."
→ Change the table column header from *"Information Leaked"* to *"Payload Information Leaked"*. Add a footnote: *"Transaction graph metadata is not concealed by TLPP; see §8.2."*

**Fix 2 — The Visa TPS comparison:**
Section 7.6: "1,400 TPS multi-core throughput exceeds Visa's average processing rate (~1,700 TPS average)."
This compares TLPP's capacity to Visa's average, not Visa's capacity (~24,000 TPS peak). It's a cherry-pick.
→ Replace with: *"1,400 TPS multi-core throughput is sufficient for enterprise deployment scenarios including payroll processing, treasury operations, and cross-border settlement. Visa-scale public payment volumes would require further throughput optimization beyond the scope of this paper."*

**Fix 3 — Performance numbers need a source:**
35ms range proof generation, ~3.5ms verification — these are consistent with Bünz et al. (2018) Bulletproof benchmarks. If they were derived from that work rather than a running TLPP prototype, cite the source.
→ Add to performance table caption: *"Range proof and verification benchmarks are derived from Bünz et al. (2018) Bulletproof specifications on comparable hardware. End-to-end TLPP prototype benchmarks are pending."*

---

### Lume-V (`10.5281/zenodo.19596736`)

**Fix 1 — Platform specs still missing from Section 10.4:**
Section 10.4 discusses bit-identical replay and platform conditions but the actual platform specification line is blank.
→ Fill in: OS, CPU, Node.js version, dependency lock commit hash.

**Fix 2 — SHA-256 in input hash field (see UNI-3).**

---

### Lume (Compiler) (`10.5281/zenodo.19612948`)

**Fix 1 — "(Conceptual)" label (see UNI-4).**

**Fix 2 — SHA-256 → SHA3-256 with versioning note (see UNI-3).**

**Fix 3 — "Standalone Lume-V specification paper is pending" is outdated:**
Lume-V is now published.
→ Update to: *"A standalone Lume-V specification is available at `10.5281/zenodo.19463415`."*

---

## PRIORITY EXECUTION ORDER

**Step 1 — Three critical wrong-document citations:**
1. Lume-Quantum: `19512459` (Shadow Burn) → `10.5281/zenodo.19491784`
2. Six papers: `19485506` (French paper) → `10.5281/zenodo.19485018`
3. Lume-Edu: `19484695` (deleted) → `10.5281/zenodo.19485587`

**Step 2 — Convert all cross-citations to concept DOIs using the Stale DOI Correction Map above.**
Highest stale citation counts to prioritize: Lume Ecosystem (38), Lume-LifeBio (18), Lume-Edu (18), Lume-Def (17), Lume-V (16), Lume-Gov (16).

**Step 3 — Universal content passes:**
4. Add "to our knowledge" to all unhedged "first" claims
5. Replace semantic "validated" with "demonstrated"
6. SHA-256 → SHA3-256 in 5 papers

**Step 4 — Specific paper fixes:**
7. TLPP: table header, Visa comparison, performance source note
8. Lume-V: fill platform specs
9. Lume compiler: update pending Lume-V reference, remove "(Conceptual)"
10. DAIGS-Fusion: remove "(Conceptual)"

---

## VERIFICATION CHECKLIST

Run these grep checks after all corrections are applied:

- [ ] Zero hits for `10.5281/zenodo.19463416` across all 42 papers (was 29 papers)
- [ ] Zero hits for `10.5281/zenodo.19443968` across all 42 papers (was 32 papers)
- [ ] Zero hits for `10.5281/zenodo.19485506` — the French paper
- [ ] Zero hits for `10.5281/zenodo.19512459` — the Shadow Burn article
- [ ] Zero hits for `10.5281/zenodo.19484695` — the deleted record
- [ ] Zero hits for `10.5281/zenodo.19488366`, `19487669`, `19440680`, `19499466`, `19486295`, `19475426`, `19486694`, `19501315`, `19491785`, `19475366`, `19560675`, `19485824`, `19485203`, `19474511`, `19499846`, `19475467`, `19484777`, `19580740`
- [ ] All internal cross-citations match a concept DOI from the Master Concept DOI Table
- [ ] TLPP table column reads "Payload Information Leaked"
- [ ] Visa comparison removed from TLPP §7.6
- [ ] Platform specs filled in Lume-V §10.4
- [ ] No unhedged "the first deterministic" in any paper
- [ ] No "(Conceptual)" label in DAIGS-Fusion or Lume compiler
