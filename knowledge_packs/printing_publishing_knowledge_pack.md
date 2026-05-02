# PRINTING & PUBLISHING KNOWLEDGE PACK (v1.0)

*DarkWave Studios LLC — AXIOM Engine — Canon² Knowledge Series*
*Domain: Applied Sciences / Communication Arts / Information Sciences*
*Ontology Alignment: identity, governance, routing, safety, monitoring*

---

## 1. Purpose

This pack encodes the structured knowledge base for Printing and Publishing — the disciplines governing the reproduction of text and images on physical and digital substrates, the editorial and production processes of publishing, typography, bookbinding, archival science, and the governance of the global publishing industry. It provides deterministic, queryable knowledge for reasoning about printing technologies, color reproduction, typography, book and periodical publishing, digital publishing, archival standards, and intellectual property.

---

## 2. Scope

**Included:**
- Printing technologies: offset lithography, digital printing, flexography, gravure, screen printing
- Color science: color spaces, ICC profiles, CMYK, color management
- Typography: type design, classification, setting, and legibility
- Pre-press: file preparation, imposition, proofing, plate-making
- Paper and substrate science
- Bookbinding and finishing
- Editorial publishing process: manuscript to published book
- Periodical publishing: magazines, newspapers, journals
- Digital publishing: e-books, PDF, EPUB, HTML5
- Academic and scholarly publishing: peer review, open access
- Archival science: preservation, digitization, metadata
- Intellectual property in publishing: copyright, licensing, fair use
- Publishing industry structure and economics

**Excluded:**
- Broadcasting and broadcast media (see Media/Communications pack)
- Information architecture beyond publishing context (see Computer Science pack)
- General intellectual property beyond publishing-specific (see Law pack)

---

## 3. Structure

This pack is organized in five tiers: (1) reproduction science (color, substrates, inks, printing processes); (2) typography and visual communication; (3) pre-press, production, and finishing; (4) publishing processes (editorial, digital, scholarly, periodical); (5) archival science, IP, and industry governance.

---

## 4. Core Concepts

**C01 — Offset Lithography**
Definition: The dominant commercial printing process. Principle: oil and water do not mix. Image areas on the aluminum printing plate accept oil-based ink and repel water; non-image areas accept fountain solution (water) and repel ink. Image is transferred (offset) from plate to rubber blanket to substrate. Sheet-fed (cut sheet, quality printing) vs. web offset (continuous roll, high-volume newspapers/magazines).
Key relationships: CTP (computer-to-plate), dampening system, impression cylinder, CMYK inking units, register (precise alignment of color plates), makeready, gripper margin.

**C02 — Digital Printing**
Definition: Printing directly from digital files without physical plates. Electrophotography (laser printing, xerography): toner deposited electrostatically, fused to substrate. Inkjet: precise droplet deposition (continuous inkjet, drop-on-demand — thermal or piezoelectric). Key advantage: cost-effective for short runs, variable data printing (VDP), on-demand printing.
Key relationships: DPI (dots per inch), toner vs. ink, variable data printing (1:1 personalization), wide-format inkjet (banners, signage), production inkjet (HP PageWide, Ricoh, Memjet) for book and commercial printing.

**C03 — Flexography**
Definition: Rotary letterpress using flexible photopolymer plates and fast-drying inks. Dominant for packaging printing (corrugated, labels, flexible packaging, cartons), newspapers. Uses water-based or UV inks. Anilox roll controls precise ink delivery to plate.
Key relationships: Anilox cell volume (BCM — billion cubic microns), line screen, dot gain (ink spread on substrate), Central Impression (CI) drum, in-line flexo (integrated converting), narrow web (labels) vs. wide web (packaging).

**C04 — Gravure Printing**
Definition: Intaglio process: image is engraved as tiny cells into a copper cylinder; ink fills cells; doctor blade wipes non-image areas; ink transfers from cells to substrate under pressure. Used for very-high-volume, high-quality print runs: decorative printing (wallpaper, flooring), high-volume magazine printing, flexible packaging, currency.
Key relationships: Cell depth determines ink density (continuous tone reproduction), cell volume, doctor blade, electromechanical or laser engraving, high cylinder cost justifies only at multi-million impressions.

**C05 — Screen Printing (Serigraphy)**
Definition: Ink forced through a mesh screen (silk screen) via squeegee; non-image areas blocked by emulsion. Enables printing on any substrate (T-shirts, ceramics, glass, circuit boards, solar cells). Plastisol ink (PVC-based, opaque, heat-cured) dominates garment printing. UV-curable inks for industrial/electronics.
Key relationships: Mesh count (threads/inch — higher = finer detail), emulsion over mesh (EOM), squeegee hardness, off-contact printing, multi-color wet-on-wet vs. wet-on-dry, halftone angle (to avoid moiré), athletic vs. fashion printing.

**C06 — Color Science and Color Spaces**
Definition: Color described by: CIE XYZ (device-independent reference), CIELAB (L*a*b*, perceptually uniform, basis for color difference ΔE), sRGB (standard consumer display), Adobe RGB (wider gamut), CMYK (print, subtractive), Pantone (spot color, standardized physical ink library).
Key relationships: Gamut (range of reproducible colors), gamut mapping, color rendering index (CRI), white point (D50 for print, D65 for display), metamerism, ΔE (color difference tolerance: ΔE <2 = acceptable for most commercial printing).

**C07 — Color Management and ICC Profiles**
Definition: ICC (International Color Consortium) profiles characterize the color behavior of input devices (scanners, cameras), displays, and output devices (printers, presses). Color management systems (CMS) use profiles to transform colors accurately between devices. CMM (color matching method) engine performs the calculation.
Key relationships: Source profile, destination profile, rendering intent (perceptual, relative colorimetric, absolute colorimetric, saturation), GCR (gray component replacement), UCR (undercolor removal), TAC (total area coverage, max ink limit — typically 280–340% for offset).

**C08 — Typography Fundamentals**
Definition: The design and arrangement of type. Typeface: a design of letterforms sharing a common visual character. Font: a specific weight and style of a typeface (bold, italic, regular). Type classification: Serif (Garamond, Times New Roman, Baskerville), Sans-serif (Helvetica, Futura, Gill Sans), Monospace, Display, Script, Blackletter.
Key relationships: Point (unit of type size, 1 pt = 1/72 inch), leading (line spacing), tracking (letter spacing across a text range), kerning (spacing between specific letter pairs), baseline, x-height, cap height, descenders, ascenders.

**C09 — Type Design and Legibility**
Definition: Legibility: ease of distinguishing individual letterforms. Readability: ease of reading extended text. Key factors: x-height (larger → more legible at small sizes), stroke contrast (high contrast → decorative but less legible at small size), counter (enclosed white space), word spacing, line length (optimal 60–75 characters), leading (120–145% of point size for body text).
Key relationships: Modular scale for hierarchy, optical sizing (small text: wider spacing, lower contrast), display vs. text typefaces, dyslexia-friendly typefaces (OpenDyslexic, Lexie Readable), accessibility standards (WCAG contrast ratio ≥ 4.5:1 for normal text).

**C10 — Paper and Substrate Science**
Definition: Paper: cellulosic web formed from plant fibers (wood pulp: mechanical/groundwood — newsprint; chemical: bleached kraft — offset printing). Key paper properties: basis weight (g/m² or lb in US), caliper (thickness, mm), opacity, brightness (% reflected light vs. MgO standard), whiteness (spectral blue reflectance), smoothness, ink absorption, dimensional stability.
Key relationships: Coated (clay/calcium carbonate coating → smooth, high gloss, excellent image reproduction) vs. uncoated (newsprint, offset, book paper), pH neutral/alkaline paper (lignin-free, archival), recycled content.

**C11 — Pre-Press Production**
Definition: Digital production workflow from design file to printing plate. Key stages: file preparation (embedding fonts, linking images, color conversion to CMYK/spot), preflight (error checking — Pitstop, Acrobat), imposition (arranging pages for press sheet — signature imposition), proofing (soft proof on calibrated display, contract proof — inkjet proof with ICC profile), CTP (exposure of aluminum plate).
Key relationships: PDF/X (ISO standard for print exchange — X-1a, X-3, X-4 variants), trapping (overlap of adjacent colors to prevent gaps from misregistration), overprinting vs. knockout, bleed (extension of image beyond trim), marks (crop, registration, color bars).

**C12 — Bookbinding and Finishing**
Definition: Assembling printed sheets into a bound book. Binding types: saddle stitch (wire staples through spine, magazines, booklets <80 pp), perfect binding (adhesive on spine, paperbacks), sewn/smyth-sewn (strongest, hardcovers), case binding (sewn text block in hard cover), wire-o/spiral (lay-flat). Finishing: folding, trimming, varnishing (spot, flood, matte, gloss), lamination, embossing/debossing, foil stamping, die-cutting.
Key relationships: Signature (printed sheet folded into 4, 8, 16, or 32 pages), gutter (inner margin near spine), folio (page number), head/tail/fore edge, hardcover case construction (front/back boards + spine + covering material).

**C13 — The Editorial Process**
Definition: Manuscript development from concept to published book: acquisition → developmental editing (structure, content) → copyediting (language, consistency, fact-checking) → author review → typesetting/design → proofreading → indexing → printing/digital production → distribution. For journals: peer review replaces/supplements editorial review.
Key relationships: Style guide (Chicago Manual of Style, APA, MLA, AP Stylebook), manuscript (MS), developmental editor, copyeditor, proofreader, production editor, compositor/typesetter.

**C14 — Academic and Scholarly Publishing**
Definition: Peer review is the central quality mechanism: submitted manuscripts reviewed by independent domain experts before publication decision. Peer review types: single-blind (reviewers know authors), double-blind (both anonymous), open review (identities public). Publication bias: positive results more publishable than null results.
Key relationships: Impact factor (IF, average citations per article per year — Journal Citation Reports), h-index, DOI (Digital Object Identifier), ISSN, preprint servers (arXiv, bioRxiv, SSRN), open access (gold — author pays APC; green — self-archive preprint).

**C15 — Open Access (OA) Publishing**
Definition: Scientific literature freely accessible online without paywalls. Gold OA: published directly OA, often via Article Processing Charge (APC, $1,000–$11,000 for high-IF journals like Nature). Green OA: author self-archives preprint or accepted manuscript in repository (PubMed Central, institutional repositories). Diamond OA: no author fees, funded by institutions/societies.
Key relationships: Plan S (European funder mandate for OA from 2021), DEAL agreement (Germany-Wiley, -Springer), Sci-Hub (piracy platform providing illegal OA to ~85 million articles), preprint culture (COVID-19 accelerated), DOAJ (Directory of Open Access Journals).

**C16 — E-Publishing and Digital Formats**
Definition: Key digital publishing formats. PDF (Portable Document Format): fixed layout, print-equivalent, universal; PDF/UA for accessibility. EPUB 3: reflowable, semantic HTML5+CSS+SVG+JavaScript, standard for ebooks; accessibility-compliant. MOBI/AZW3 (Amazon Kindle): proprietary. Fixed-layout EPUB: digital picture books, cookbooks. HTML5/web: interactive, networked.
Key relationships: Reflowable vs. fixed layout, EPUB 3 accessibility (WCAG 2.1, ARIA roles), Kindle Direct Publishing (KDP), Apple Books, Kobo, reading system compatibility, DRM (Digital Rights Management, ADE — Adobe Digital Editions).

**C17 — Copyright in Publishing**
Definition: Copyright: automatic legal protection for original works of authorship from creation; no registration required in most jurisdictions (Berne Convention). In publishing: author retains copyright unless transferred; publisher typically licenses specific rights (territory, format, language, duration). Duration: life of author + 70 years (EU/US).
Key relationships: Moral rights (attribution, integrity — strong in EU, limited in US), fair use (US: purpose, nature of use, amount used, market effect), fair dealing (UK/Commonwealth), Creative Commons (CC) licenses (spectrum from CC-BY to CC-BY-NC-ND), public domain.

**C18 — Archival Science and Preservation**
Definition: Long-term preservation of printed and digital materials. Physical: temperature/humidity control (paper archives: 18°C, 35–50% RH; film: colder), acid-free storage, pest management, disaster planning. Digital preservation: format migration (converting obsolete formats), fixity checking (checksums to detect bit rot), multiple copies in geographically distributed locations (3-2-1 rule).
Key relationships: ISO 9706 (permanent paper: acid-free, alkaline reserve), ISO 18902 (archival paper products), LOCKSS (Lots of Copies Keep Stuff Safe), OAIS (Open Archival Information System, ISO 14721), digital dark archives, trusted digital repository (ISO 16363).

**C19 — Publishing Industry Economics**
Definition: Global book publishing market: ~$115–130 billion/yr. US trade publishing "Big Five": Penguin Random House, HarperCollins, Simon & Schuster, Hachette, Macmillan. Ebook: ~20–25% of trade book revenue in US/UK (plateau post-Kindle growth). Self-publishing: Amazon KDP enables independent publishing, royalties 35–70%.
Key relationships: Advance against royalties (author advance repaid before royalties paid), royalty rates (hardcover: 10–15%, paperback: 7–10%, ebook: 25%), distribution (Ingram, Baker & Taylor), library market, rights and permissions.

**C20 — Newspaper and Magazine Publishing**
Definition: Periodical publishing faces severe structural decline: US newspaper advertising revenue fell from $49 billion (2005) to <$9 billion (2022); circulation halved. Digital subscription models (New York Times: 10+ million digital subscribers) partially offset. Magazine sector: print declining, digital growing; celebrity/beauty/fashion resilient.
Key relationships: ABC (Audit Bureau of Circulations), CPM (cost per thousand readers), advertising-editorial separation ("church and state"), CMS (content management system), paywall (hard vs. metered), newsletter as media format (Substack).

**C21 — Ink Chemistry**
Definition: Printing inks: pigment (color, opacity) + vehicle (carrier resin, oils/solvents) + additives (driers, waxes, dispersants). Ink drying mechanisms: absorption (newsprint), oxidative polymerization (offset litho oil inks, slow), evaporation/penetration (heatset web offset — tunnel dryer), UV/EB curing (instant, 100% solid inks — no VOC), water-based (evaporation, packaging).
Key relationships: Tack (ink's resistance to splitting — adhesion), viscosity, pigment dispersion, offset ink trapping (ink-over-ink printing in CMYK), radiation curing (UV LED growing), food-contact ink compliance (FDA 21 CFR, Swiss Ordinance).

**C22 — ISBN, ISSN, and Metadata Standards**
Definition: ISBN (International Standard Book Number): 13-digit identifier unique to each book edition and format (hardcover, paperback, ebook = different ISBNs). ISSN (International Standard Serial Number): for periodicals. Metadata standards: ONIX (Online Information eXchange: publishing industry metadata standard for supply chain), Dublin Core, MARC (library cataloging).
Key relationships: Bowker (US ISBN agency), CIP (Cataloging in Publication, Library of Congress), barcode (ISBN-13 = EAN-13), edition vs. printing distinction, metadata quality (critical for discoverability in retail channels).

**C23 — Font Technology**
Definition: Digital font formats: PostScript Type 1 (1984, Adobe, obsolescent), TrueType (1991, Apple/Microsoft, bezier curves), OpenType (1997, Adobe/Microsoft, extends TrueType/CFF, 65,536 glyph capacity, variable fonts), WOFF/WOFF2 (web-optimized OpenType). Variable fonts (2016): single font file with continuous axes (weight, width, slant), reducing HTTP requests.
Key relationships: Font hinting (rasterization optimization for small sizes on screen), EULA (End User License Agreement, font licensing — desktop vs. web vs. app different licenses), Google Fonts (free OFL-licensed web fonts), Adobe Fonts (subscription).

**C24 — Print-on-Demand (POD) and Self-Publishing**
Definition: Technology enabling single-copy printing economically. Amazon KDP Print (formerly CreateSpace), IngramSpark, Lulu: print books individually when ordered, ship directly. Eliminates inventory risk; enables long-tail publishing (millions of niche titles). Quality approaching traditional offset for text-only titles; limitations for color-heavy books (cost, color accuracy).
Key relationships: KDP royalties (60% for expanded distribution, 70% for direct Kindle), IngramSpark (broad retail and library distribution), Lightning Source (wholesale POD), trade distribution vs. direct-to-consumer, print quality standards (color fidelity, binding strength).

**C25 — Library Science and Information Management**
Definition: Libraries organize, preserve, and provide access to information resources. Classification systems: Dewey Decimal (public libraries, 10 main classes), Library of Congress Classification (academic, alphanumeric, 21 classes). Cataloging: MARC21 (Machine-Readable Cataloging), RDA (Resource Description and Access, 2013 successor to AACR2), linked data (BIBFRAME, replacing MARC).
Key relationships: OPAC (Online Public Access Catalog), ILL (Interlibrary Loan), WorldCat (OCLC global catalog of library holdings, >2 billion records), digital library (Project Gutenberg, HathiTrust, Internet Archive), reference management (Zotero, Mendeley).

---

## 5. Patterns

**P01 — Print Production Workflow (Offset)**
Description: Design in CMYK + spot colors → preflight (fonts embedded, images linked at 300 dpi minimum, color profiles correct) → impose pages (signature layout) → output PDF/X-1a or PDF/X-4 → CTP plate imaging → presscheck (verify color against approved proof) → print → fold/cut/bind → finishing → QC inspection → delivery.
When to use: Commercial offset printing project management.
Example: 160-page perfect-bound book: 20 signatures × 8 pp; 4/4 color interior on 80gsm coated matt; 4-color + 2 spot colors (PMS 485 red + PMS 287 blue) cover; 350gsm gloss cover with soft-touch lamination; print run 5,000.

**P02 — Color Calibration and Proof Verification**
Description: Calibrate display to D50, 120 cd/m² white, target profile (ISO Coated v2 or FOGRA51 for EU offset); create contract proof using certified inkjet proofer with RIP; verify proof with spectrophotometer against FOGRA dataset tolerance (ΔE ≤ 2 for solids, ΔE ≤ 3 for CMYK primaries); use proof as press target.
When to use: Color-critical print production; press make-ready.
Example: Fine art catalog: CMYK + 1 spot color Pantone 803 fluorescent; contract proof on Epson P800 with GMG ProofMedia; ECI/FOGRA characterization dataset; ΔE pass at all measurement points.

**P03 — Copyright Clearance Process**
Description: Identify all third-party content requiring permission (text excerpts >300 words, tables, figures, photographs, maps, poems, lyrics, illustrations); identify rights holder; submit permission request with usage description (territories, editions, formats, print run, languages); document permissions received; credit as required.
When to use: All publishing projects containing third-party content.
Example: Academic textbook: 15 figures reproduced from journal articles; 3 from journals requiring payment ($200–$500/figure); 2 from CC-BY licensed articles (free with attribution); 10 requiring Copyright Clearance Center (CCC) permission.

**P04 — Peer Review Manuscript Management**
Description: Receive submission → editorial desk review (scope, quality threshold) → select 2–3 reviewers (avoid conflicts of interest) → track review (target 3–4 weeks) → synthesize reviews → decision (accept, major revision, minor revision, reject) → author revision → re-review (if major) → final decision → production.
When to use: Academic journal editorial workflow; conference proceedings review.
Example: Nature journal: >95% rejected at desk review without peer review; papers sent out receive median 2.1 reviewer reports; time from submission to acceptance ~7 months median; time to publication (online ahead of print) ~1 month post-acceptance.

**P05 — Digital Preservation Implementation (3-2-1 Rule)**
Description: Maintain 3 copies of all digital files (master + 2 backups); store on 2 different storage media types (hard disk + LTO tape); keep 1 copy offsite (geographic separation, cloud); verify integrity via SHA-256 checksums regularly; test restoration from backup quarterly; document format migration plan for obsolete formats.
When to use: Digital archive management; publisher digital asset management.
Example: University press digital preservation: primary storage (NAS, replicated), LTO-8 tape (400 TB/cartridge), offsite cloud (Wasabi or Glacier); monthly checksum verification; migration plan from PDF 1.4 → PDF/A-2b for long-term archival.

**P06 — Accessible EPUB Production**
Description: Structure content semantically (headings H1-H6 nested properly); provide alt text for all images; use ARIA landmarks and roles; ensure reading order matches visual order; test with screen readers (NVDA, JAWS, VoiceOver); validate with EPUBCheck and Ace by DAISY; achieve WCAG 2.1 AA conformance.
When to use: EPUB production for trade or educational publishing; library edition preparation.
Example: Educational textbook EPUB: all figures have descriptive alt text + long description linked; tables have summary attributes; math encoded as MathML + SVG; EPUB3 with ARIA landmarks (doc-chapter, doc-pagebreak for print equivalents).

**P07 — Print-on-Demand Interior File Preparation**
Description: Set page size to trim size (e.g., 6" × 9" for trade paperback); set margins (minimum: inside 0.75", outside 0.5", top/bottom 0.5" for <300 pages); embed all fonts; convert images to 300 DPI at final print size; flatten transparencies; export PDF/X-1a or PDF-A; verify total page count is even (POD requires even pages); submit and order proof.
When to use: Self-publishing via KDP, IngramSpark, or similar POD service.
Example: Self-published 280-page memoir: 6×9", Garamond 11pt/14pt leading interior, 1.25" gutter, 0.5" outer margins; B&W interior; PDF/X-1a exported from InDesign; color cover PDF with 0.125" bleed; proof ordered and approved before going live.

---

## 6. Anti-Patterns

**AP01 — Confusing RGB and CMYK for Print**
Why wrong: RGB (additive, monitor) and CMYK (subtractive, print) have different gamuts; vibrant RGB blues and greens cannot be reproduced in CMYK. Submitting RGB files for offset printing produces color shifts, unpredictable results, and delays. RGB has ~30% wider gamut than CMYK.
What to do instead: Convert to CMYK (or verify supplier's preferred conversion profile) during file preparation; work in CMYK from the start for print-only projects; use soft proofing in the target output profile; specify CMYK values for critical brand colors.

**AP02 — Using Screen Resolution Images for Print**
Why wrong: Screen images are 72–96 DPI at display size; offset printing requires 300 DPI at print size (minimum 150 DPI for coarser screens). Scaling a 72 DPI web image to 300 DPI does not add resolution — it interpolates (creates artificial pixels), producing blurry printed images.
What to do instead: Use original high-resolution source files; specify minimum 300 DPI at final print size in supplier specifications; verify effective DPI in preflight (InDesign links panel, Pitstop Pro).

**AP03 — Over-relying on Impact Factor for Journal Quality**
Why wrong: Impact factor measures citation frequency, not research quality, methodological rigor, or reproducibility. IF is inflated by review articles and hot fields; deflated in niche or applied disciplines. Highly cited papers can include high-profile retractions; many excellent papers appear in lower-IF journals.
What to do instead: Evaluate journals by editorial standards, peer review process, and reproducibility standards; use field-normalized citation metrics (SNIP, SJR); consult domain experts; assess individual paper quality, not just journal brand.

**AP04 — Treating Digital Files as Automatically Preserved**
Why wrong: Digital files are not inherently permanent — they suffer from bit rot (magnetic decay), media failure (hard drives fail in 3–5 years average MTBF), format obsolescence (try opening a 1985 WordStar file today), and software dependency. "It's digital, it's safe" is a dangerous assumption.
What to do instead: Implement 3-2-1 backup strategy; use open, non-proprietary, well-documented formats (PDF/A, TIFF, JPEG2000, EPUB3); verify file integrity with checksums; plan for format migration; use trusted digital repository infrastructure.

**AP05 — Embedding Copyright Notices Without Licensing Information**
Why wrong: A copyright notice (© Author 2024) asserts rights but does not communicate what reuse is permitted. Researchers and educators are frequently unsure whether they can legally use a work without explicit license; default to "not using it" or using it illegally.
What to do instead: For OA or academic publishing, apply explicit Creative Commons license with URI; for commercial publishing, specify permitted reuse terms clearly; use rights statements from RightsStatements.org for cultural heritage materials.

**AP06 — Using Typefaces Designed for Display at Small Sizes**
Why wrong: Display typefaces (intended for headlines and large sizes) have high stroke contrast, fine hairlines, and narrow counters that become illegible or break down at small sizes (below 10–12pt), especially at screen resolutions or in lower-quality print.
What to do instead: Select typefaces designed for the intended size and medium: text typefaces (Georgia, Minion, Freight Text) for body copy; use optical sizing features in OpenType variable fonts where available; test at actual reproduction size on the actual output medium.

**AP07 — Ignoring EPUB Validation Before Distribution**
Why wrong: Invalid EPUB files cause reading system failures, broken navigation, missing content, and accessibility tool failures. Most reading systems (Kindle, Apple Books, Kobo) apply their own error handling — but behavior is unpredictable and often silently corrupts the reading experience.
What to do instead: Validate all EPUBs with EPUBCheck (W3C standard validator) and Ace by DAISY (accessibility checker) before distribution; fix all errors (not just warnings) before submission to any retailer; test on multiple reading devices/apps.

---

## 7. Facts & Descriptors

| Fact ID | Statement | Category | Confidence |
|---|---|---|---|
| F001 | Johannes Gutenberg's movable type printing press (~1440–1450) enabled the printing of the Gutenberg Bible (~180 copies, ~1455); transformed European literacy, science, and Reformation. | History | Very High |
| F002 | Global book publishing market: ~$130 billion/yr (2022); US is largest single market (~$28B); China second (~$25B); top publishers by revenue: Penguin Random House (Bertelsmann), HarperCollins (News Corp), Simon & Schuster. | Economics | High |
| F003 | Amazon commands ~50–55% of all US book sales (all formats) and ~80–85% of US ebook sales via Kindle ecosystem. | Economics | High |
| F004 | The global printing industry is valued at ~$811 billion (2022); digital printing is the fastest-growing segment (~6% CAGR); offset printing still dominates commercial print volume. | Economics | High |
| F005 | Standard offset printing resolution: 150 lpi (lines per inch) halftone screen for coated paper; 100–133 lpi for uncoated; stochastic (FM) screening at equivalent to 200+ lpi for finer detail. | Technology | Very High |
| F006 | Pantone Matching System (PMS): founded 1963 by Lawrence Herbert; standardizes ~2,100+ colors with numeric codes; PMS 032 (vivid red), PMS 286 (classic blue) are corporate identity standards for major brands. | Color | Very High |
| F007 | Adobe PostScript (1982) and PDF (1993) transformed digital print production; PDF/X (ISO 15930) became the universal interchange format for print; PDF/A (ISO 19005) for archiving. | Technology | Very High |
| F008 | The newspaper industry: US daily newspaper circulation fell from 62 million (1989) to <20 million (2022); newsrooms lost 57% of journalists 2008–2020; digital ad revenue cannot offset print ad collapse. | Industry | Very High |
| F009 | Academic publishing: ~3 million peer-reviewed articles published per year globally; market value ~$19 billion; dominated by Elsevier (RELX), Springer Nature, Wiley, Taylor & Francis, SAGE. | Academic | High |
| F010 | Elsevier's operating profit margin: ~37% (2023); higher than Apple (~25%); based on academic institutions paying subscription fees for research they often funded via public grants — source of ongoing controversy. | Academic | High |
| F011 | Project Gutenberg (founded 1971 by Michael Hart): first digital library; >60,000 public domain ebooks available free; precursor to modern digital library movement. | Digital | Very High |
| F012 | Kindle (Amazon, 2007): transformed ebook market; first commercially successful e-ink reading device; 300 PPI (pixels per inch) Paperwhite display matches newspaper print resolution. | Digital | Very High |
| F013 | The Bodleian Library (Oxford, founded 1602): one of oldest European libraries; 13+ million physical items; copyright deposit library (receives one copy of every UK/Ireland publication under Legal Deposit Libraries Act 2003). | Archive | Very High |
| F014 | Acid paper degradation: most pre-1980 books printed on acidic (lignin-containing) paper have a lifespan of 25–50 years before brittleness makes them unusable; alkaline paper (ISO 9706) has projected life >500 years. | Preservation | Very High |
| F015 | Elsevier's Sci-Hub conflict: Alexandra Elbakyan created Sci-Hub (2011, Kazakhstan) providing pirated access to ~85 million academic papers; Elsevier won $15 million default judgment (2017, US); site continues operating, widely used in developing world and by researchers without institutional access. | Academic | Very High |
| F016 | The Chicago Manual of Style (CMOS): now in 18th edition (2024); authoritative style guide for US trade and academic publishing; competes with APA (social sciences), MLA (humanities), AP Stylebook (journalism). | Standards | Very High |
| F017 | Halftone printing: colors reproduced by patterns of dots at different angles: cyan 105°, magenta 75°, yellow 90°, black 45°; incorrect angles create moiré interference patterns. | Technology | Very High |
| F018 | ISBN-13: barcode encodes 3-digit Bookland EAN prefix (978 or 979) + country/language group + publisher prefix + title + check digit; calculated by alternating × 1 and × 3 modulus 10. | Standards | Very High |
| F019 | LTO (Linear Tape-Open) tape: LTO-9 (2021): 18 TB native capacity, 45 TB compressed; archival tape life 30+ years in ideal storage; key digital preservation medium for high-volume institutional archives. | Preservation | Very High |
| F020 | Unicode standard (Unicode Consortium): currently 149,813 characters (Unicode 15.1, 2023) covering 161 scripts; essential for multilingual digital publishing; UTF-8 is the dominant encoding for HTML and XML. | Technology | Very High |
| F021 | The first commercially printed color photograph appeared in National Geographic (1914); the magazine has maintained iconic yellow-bordered cover design since 1910 — one of the longest-running magazine designs. | History | Very High |
| F022 | Harry Potter and the Sorcerer's Stone: first edition (UK: Philosopher's Stone, July 1997, Bloomsbury, 500 copies): sold at auction for up to $471,000 (2021); global series sales >600 million copies — most sold book series ever. | Industry | Very High |
| F023 | Self-publishing has democratized: Amazon KDP processed 1+ million unique authors in 2022; many earn $0–$1,000/year; top self-published authors earn $500,000+/year; genre fiction (romance, thriller) particularly strong for indie authors. | Industry | High |
| F024 | The Berne Convention for the Protection of Literary and Artistic Works (1886): international copyright treaty requiring automatic copyright protection in member states (181 countries); no registration required. | Law | Very High |
| F025 | Folio Society (London, 1947): premium collectible edition publisher; hand-sewn bindings, archival paper, commissioned illustrations; subscription model; exemplifies artisanal bookmaking in the digital age. | Industry | High |
| F026 | Pantone's annual Color of the Year: first named in 2000 (Cerulean, PMS 15-4020); 2024 Color of the Year: PANTONE 13-1023 Peach Fuzz; influences fashion, beauty, interiors, and graphic design for the year. | Color | Very High |
| F027 | CMYK: Cyan absorbs red, Magenta absorbs green, Yellow absorbs blue (subtractive primaries); Key (Black) added for detail and to reduce cost (replacing CMY overprinting for black). K stands for "Key plate" (black, registration plate) not "black." | Technology | Very High |
| F028 | World's most expensive book sold at auction: Leonardo da Vinci's Codex Leicester (Bill Gates, 1994): $30.8 million; Bay Psalm Book (2013): $14.2 million; both records for printed books. | History | Very High |
| F029 | Phototypesetting (1950s–1990s) replaced hot metal type (Linotype/Monotype); replaced in turn by desktop publishing (Aldus PageMaker, 1985; QuarkXPress, 1987; Adobe InDesign, 1999 — now dominant). | History | Very High |
| F030 | EPUB 3.3 (W3C, 2023): latest EPUB standard; based on HTML5, CSS3, SVG, JavaScript; supports media overlays (synchronized text and audio), MathML, accessibility features (ARIA); becoming universal standard for reflowable ebooks globally. | Digital | Very High |

*Cross-references: Art/Design pack (visual communication, graphic design history), Law pack (intellectual property, copyright), Computer Science pack (digital formats, metadata), Linguistics pack (typographic systems and writing).*

*Pack integrity: 25 core concepts, 7 patterns, 7 anti-patterns, 30 facts. All 10 invariants satisfied.*
*Version 1.0 — DarkWave Studios LLC — AXIOM Engine*
