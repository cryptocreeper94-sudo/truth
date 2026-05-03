# MINING & METALLURGY KNOWLEDGE PACK (v1.0)

*DarkWave Studios LLC — AXIOM Engine — Canon² Knowledge Series*
*Domain: Applied Sciences / Engineering / Earth Sciences*
*Ontology Alignment: identity, governance, routing, safety, monitoring*

---

## 1. Purpose

This pack encodes the structured knowledge base for Mining and Metallurgy — the applied sciences of extracting mineral resources from the Earth and transforming them into useful metals, alloys, and materials. It provides deterministic, queryable knowledge for reasoning about ore deposits, mining methods, mineral processing, extractive metallurgy, physical metallurgy, alloy design, materials failure, and the governance and environmental management of the mining sector.

---

## 2. Scope

**Included:**
- Economic geology: ore deposit types and formation
- Mineral exploration: geophysics, geochemistry, drilling
- Mining methods: surface and underground
- Rock mechanics and ground support
- Mineral processing: comminution, concentration, separation
- Extractive metallurgy: pyrometallurgy, hydrometallurgy, electrometallurgy
- Physical and mechanical metallurgy
- Alloy systems: iron-carbon, aluminum, copper, titanium
- Corrosion science
- Metallurgical failure analysis
- Mining safety and hazard management
- Environmental management of mining operations
- Critical minerals and supply chain security
- Mining governance, regulation, and social license

**Excluded:**
- Detailed ceramics and glasses (see Materials Science pack)
- Petroleum and gas extraction (see Energy pack)
- Coal mining environmental impacts in depth (noted, cross-reference Energy pack)

---

## 3. Structure

This pack is organized in five tiers: (1) ore deposits and mineral exploration; (2) mining methods and rock mechanics; (3) mineral processing and extractive metallurgy; (4) physical metallurgy, alloys, and materials behavior; (5) environmental management, safety, and governance. The pack traces the flow of material from geological concentration → extraction → processing → refined metal → alloy → application.

---

## 4. Core Concepts

**C01 — Ore Deposits**
Definition: Concentrations of minerals or metals sufficiently rich to be extracted economically. Classified by: commodity (metallic, non-metallic, energy); deposit type (porphyry copper, volcanogenic massive sulfide, iron formation); genesis (magmatic, hydrothermal, sedimentary, supergene, placer). Grade: metal concentration (g/t for gold, % for copper). Cut-off grade: minimum economic grade.
Key relationships: Ore vs. protore (unmineralized rock), stripping ratio, mineral reserve vs. mineral resource (JORC/NI 43-101 reporting codes), tenor, grade-tonnage curve.

**C02 — Porphyry Copper Deposits**
Definition: Large, low-grade copper ± molybdenum ± gold deposits associated with porphyritic felsic-intermediate intrusions. Most important copper deposit type globally (~75% of world's copper). Characterized by stockwork veining, alteration zones (potassic core, phyllic, argillic, propylitic), disseminated sulfides (chalcopyrite, molybdenite).
Key relationships: Copper grade 0.3–1.5% Cu; size 100 Mt to >5 Gt; alteration zonation, supergene enrichment zone (chalcocite blanket), leach cap, tonnage-grade relationship.

**C03 — Mineral Exploration**
Definition: Systematic search for economic mineral deposits. Stages: grassroots (target generation, geologic mapping, geochemistry, geophysics) → target drilling → resource definition drilling → prefeasibility/feasibility study. Key methods: stream sediment geochemistry, soil sampling, IP geophysics, gravity, magnetics, drilling (diamond core, RC).
Key relationships: Anomaly, pathfinder elements (arsenic for gold, zinc for VMS deposits), Lowell-Guilbert porphyry model, exploration risk (discovery rate <1% of explored targets), NI 43-101 resource categorization (inferred → indicated → measured).

**C04 — Open Pit Mining**
Definition: Surface mining method used for large, low-grade ore bodies near surface. Ore and waste rock removed by drilling, blasting, loading, and hauling. Key parameters: pit slope angle (critical for stability), bench height, bench width, haul road design, waste dump design.
Key relationships: Stripping ratio (tonnes waste : tonnes ore), pit optimization (Whittle 4X), slope stability analysis (factor of safety ≥ 1.3 for operational slopes), blasting design (delay patterns, powder factor), ultra-class haul trucks (400–500 t payload, e.g., Caterpillar 797F).

**C05 — Underground Mining Methods**
Definition: Methods for extracting ore from underground. Cut-and-fill (C&F): selective, high-value ore; stope mined in horizontal lifts, backfilled with paste or cemented rock. Sublevel stoping (open stoping/longhole): large void stopes, pillar recovery, massive ore; primary-secondary sequence. Block caving: mass caving of large low-grade ore bodies (e.g., Chuquicamata underground, Resolution Copper). Room-and-pillar: flat-lying ore; coal mining.
Key relationships: Stope design, pillar (stable remnants for support), crown pillar, paste fill (hydraulic, cemented paste tailings), ground support (rock bolts, cable bolts, shotcrete, mesh).

**C06 — Rock Mechanics and Ground Support**
Definition: Study of mechanical behavior of rock in the context of mining, tunneling, and geotechnical engineering. Rock mass classification: RMR (Rock Mass Rating), Q-system, GSI (Geological Strength Index). Support design: rock bolts (friction, grouted), cable bolts, shotcrete (wet or dry mix), steel sets, backfill.
Key relationships: In-situ stress (vertical ~25 MPa/km, horizontal variable), principal stresses, UCS (Uniaxial Compressive Strength), Mohr-Coulomb failure criterion, stress redistribution around excavations, seismic monitoring (microseismics for rockburst prediction).

**C07 — Comminution**
Definition: Size reduction of ore to liberate valuable minerals from gangue (waste minerals). Crushing stages: primary (jaw/gyratory, >100 mm → 100–200 mm), secondary (cone, 100–200 mm → 25–50 mm), tertiary (cone, <25 mm). Grinding: SAG (semi-autogenous grinding) and ball mills → pulp for flotation (target P80: 100–200 μm for most sulfide ores).
Key relationships: Bond Work Index (Wᵢ, kWh/t required for specific size reduction), SAG mill load (critical for throughput), liberation size, comminution circuit energy consumption (typically 30–50% of total mine energy).

**C08 — Froth Flotation**
Definition: Physicochemical process selectively separating hydrophobic (water-repelling) minerals from hydrophilic (water-loving) gangue. Process: conditioning with collectors (xanthates: make sulfide minerals hydrophobic), frothers (MIBC: create stable bubbles), pH modifiers, depressants; air injection; hydrophobic particles attach to bubbles and float to froth.
Key relationships: Collector selectivity (xanthate for sulfides, fatty acid for oxides), recovery vs. grade trade-off, flotation circuit (rougher-scavenger-cleaner), concentrate grade (Cu: 25–35% Cu, Au: 20–80 g/t Au), tailings.

**C09 — Hydrometallurgy**
Definition: Extraction of metals using aqueous solutions. Key processes: leaching (dissolving metals — heap leach for gold/copper, tank leach for complex ores), solvent extraction (SX: selective transfer of metal from aqueous to organic phase), electrowinning (EW: depositing metal from solution onto cathode by electrolysis), ion exchange.
Key relationships: SXEW (solvent extraction-electrowinning, standard for copper cathode from oxide ores), cyanide leaching (gold: AuS₂⁻ complex, Merrill-Crowe or CIL/CIP for recovery), acid mine drainage (AMD) and heap leach acid consumption, pregnant liquor solution (PLS).

**C10 — Pyrometallurgy**
Definition: Extraction of metals using high-temperature thermal processes. Key processes: roasting (converting sulfides to oxides), smelting (producing molten metal from oxide ore + flux), converting (oxidizing impurities from molten metal), refining (fire refining, electrolytic refining).
Key relationships: Flash smelting (Outotec, for copper and nickel), reverberatory furnace, electric arc furnace (EAF, steelmaking from scrap), blast furnace (iron production from oxide ore + coke), slag (waste from smelting), slag chemistry (FeO, SiO₂, CaO ratios), SO₂ capture (acid plant).

**C11 — Iron and Steel Metallurgy**
Definition: Iron-carbon system: iron with <2.11% C = steel; 2.11–6.67% C = cast iron. Key steel types: plain carbon steel (low <0.25% C, medium 0.25–0.6%, high >0.6%); alloy steels (alloying elements: Mn, Cr, Ni, Mo, V, Si); stainless steel (>10.5% Cr, passive oxide layer — 304, 316L).
Key relationships: Blast furnace (iron oxide → pig iron, coke + limestone), basic oxygen furnace (BOF: pig iron → steel, oxygen blown), EAF (scrap → steel), continuous casting, rolling (hot, cold, temper).

**C12 — Heat Treatment of Steel**
Definition: Thermal processes altering the microstructure and properties of steel. Annealing (full, process, stress relief): softening, improving machinability. Normalizing: refining grain size, improving toughness. Quenching: rapid cooling → martensite (hard, brittle). Tempering: reheating quenched steel → tempered martensite (hard + tougher). Case hardening (carburizing, nitriding): hard surface + tough core.
Key relationships: Iron-carbon phase diagram, TTT (Time-Temperature-Transformation) and CCT diagrams, martensite start temperature (Ms), hardenability (Jominy test), tempering temperature-hardness relationship.

**C13 — Aluminum Metallurgy**
Definition: Aluminum production: Bayer process (alumina from bauxite: Al(OH)₃ → Al₂O₃) + Hall-Héroult process (electrolysis of molten Al₂O₃ in cryolite — requires ~13–15 kWh/kg, most energy-intensive primary metal). Recycling: ~95% energy savings vs. primary. Key alloy series: 2xxx (Al-Cu, high strength), 6xxx (Al-Mg-Si, extrusions), 7xxx (Al-Zn-Mg, highest strength, aerospace).
Key relationships: Age hardening (precipitation hardening), T6 temper (solution heat treat + artificial age), 6061-T6, 7075-T6, bauxite reserves (Guinea, Australia, Brazil), aluminum recycling (closed-loop).

**C14 — Copper Metallurgy**
Definition: Copper smelting: concentrates (25–35% Cu) → flash smelter → matte (60–70% Cu) → converter (blister copper 98.5% Cu) → fire refining → electrolytic refining (99.99% Cu cathode). Electrolytic: anode slimes contain precious metals (Au, Ag, PGM). Copper alloys: brass (Cu-Zn), bronze (Cu-Sn), cupro-nickel.
Key relationships: Chalcopyrite (CuFeS₂, primary ore), chalcocite (Cu₂S, supergene), electrolytic tough pitch (ETP) copper, oxygen-free high conductivity (OFHC) copper, resistivity (Cu: 1.72 μΩ·cm vs. Al: 2.82 μΩ·cm).

**C15 — Rare Earth Elements (REEs)**
Definition: Group of 17 elements (15 lanthanides + Sc + Y) critical for clean energy technologies (neodymium for NdFeB permanent magnets in EVs and wind turbines; dysprosium for high-temperature magnets; lanthanum for EV batteries, NiMH; erbium for fiber optic amplifiers). Predominantly mined in China (~60% of production, ~80% of processing).
Key relationships: Light REE (La, Ce, Pr, Nd, Sm) vs. heavy REE (Eu, Gd, Tb, Dy, Er, Tm, Yb, Lu, Y), bastnasite/monazite (primary minerals), solvent extraction separation (14 elements with nearly identical chemistry), China's supply dominance, national security concern, Mountain Pass (CA), Lynas (Australia), MP Materials.

**C16 — Critical Minerals**
Definition: Minerals essential for clean energy and defense technologies, with concentrated supply chains representing geopolitical risk. US DOE/DOI critical mineral lists: lithium (batteries), cobalt (batteries, magnets), nickel (batteries, stainless steel), REEs, graphite (battery anode), manganese, chromium, platinum group metals (PGMs).
Key relationships: Battery mineral supply chains (Li-Co-Ni-Mn-graphite for Li-ion batteries), EV demand projection (10× increase in Li/Co demand by 2040), Congo cobalt (>70% global supply), DRC child labor issues, recycling as domestic source.

**C17 — Corrosion Science**
Definition: Electrochemical destruction of metals by reaction with the environment. Galvanic corrosion: dissimilar metals in electrical contact in an electrolyte (more active metal = anode, corrodes). Uniform corrosion. Pitting corrosion (stainless steels in chloride). Crevice corrosion. Stress corrosion cracking (SCC). Hydrogen embrittlement.
Key relationships: Galvanic series (nobility ranking), passivation (Cr₂O₃ on stainless, Al₂O₃ on aluminum), corrosion protection methods (cathodic protection, coatings, galvanizing, inhibitors), Pourbaix diagrams (pH-potential stability domains).

**C18 — Metallurgical Failure Analysis**
Definition: Systematic investigation of component failures using fractography (fracture surface examination), microstructural analysis (SEM, EDS, optical metallography), chemical analysis, mechanical testing, and reconstruction of failure sequence. Root causes: design deficiency, material deficiency, manufacturing defect, improper service condition.
Key relationships: Fatigue failure (beach marks, striations, crack initiation site), brittle fracture (Charpy impact, transition temperature, cleavage fracture), ductile fracture (dimples, necking), intergranular vs. transgranular cracking, NDT (non-destructive testing: UT, RT, PT, MT, ET).

**C19 — Mine Waste Management**
Definition: Mining generates large volumes of waste: tailings (fine-grained mill waste, often stored in tailings dams/storage facilities — TSFs), waste rock (coarser non-ore material), process water. Tailings dams are among the world's largest engineering structures and pose catastrophic failure risk (Brumadinho 2019, Fundão 2015).
Key relationships: Tailings Dam failure (seismic, piping, overtopping, foundation failure), acid rock drainage (ARD) from sulfide oxidation, paste tailings (dewatered, reduce water consumption, reduce dam volume), dry stack tailings, closure planning.

**C20 — Mining Safety**
Definition: Mining is among the world's most hazardous occupations. Major hazards: ground fall/rockburst (underground), haul truck/mobile equipment collisions (surface), blasting, dust (silicosis, COPD), noise-induced hearing loss, heat stress, explosions (methane in coal mines), flooding. ICMM (International Council on Mining & Metals) Safety Leadership framework.
Key relationships: Fatal injury frequency rate (FIFR), lost time injury frequency rate (LTIFR), safety management system (ISO 45001), Job Safety Analysis (JSA), management of critical controls, seismic monitoring for rockburst.

**C21 — Environmental Impact of Mining**
Definition: Key environmental impacts: habitat destruction (open pit footprint, waste dumps), water contamination (AMD, cyanide spills, process water), air pollution (dust, SO₂, vehicle emissions), noise, vibration. Mitigation: progressive rehabilitation, acid-generating material isolation, water treatment, engineered closure, financial assurance (reclamation bond).
Key relationships: Acid rock drainage (ARD), cyanide management (ICMC — International Cyanide Management Code), sulfide oxidation kinetics, acid base accounting (ABA), water balance, closure criteria.

**C22 — Lithium and Battery Minerals**
Definition: Lithium: mined from hard rock (spodumene, Australia — highest grade, ~6% Li₂O) or continental brines (Atacama, Bolivia — low-cost, solar evaporation). Direct lithium extraction (DLE) emerging technology. Cobalt: primarily from Democratic Republic of Congo as a copper by-product; child labor concerns. Nickel: from laterite (Indonesia, high-volume) and sulfide (Canada, higher grade).
Key relationships: Lithium carbonate equivalent (LCE, standard unit), spodumene → lithium hydroxide conversion, hard rock vs. brine cost curve, DRC cobalt supply risk, battery chemistries (NMC, LFP — cobalt-free, NCA), recycling (Redwood Materials, Li-Cycle).

**C23 — Platinum Group Metals (PGMs)**
Definition: Six elements (Pt, Pd, Rh, Ir, Os, Ru) with remarkable catalytic and chemical properties. Primary uses: automotive catalytic converters (Pt, Pd, Rh — 40% of Rh used in 3-way catalysts), chemical catalysis, jewelry, hydrogen fuel cells (Pt). Overwhelmingly concentrated in South Africa (Bushveld Complex, ~75% of world's Pt), Zimbabwe, and Russia.
Key relationships: Merensky Reef (Bushveld), UG2 Reef (chromite), Stillwater Complex (US, only significant non-South African Pt/Pd mine), PGM price volatility (Rh peaked at $29,800/troy oz in 2021), recycling from spent autocatalysts.

**C24 — Gold Metallurgy**
Definition: Gold extraction: gravity concentration (densemedium, shaking tables, jigs, centrifuges — for coarse, visible gold) + cyanidation (heap leach for low-grade oxide, CIL/CIP for higher-grade). Recovery of dissolved gold: carbon-in-leach (CIL), carbon-in-pulp (CIP), Merrill-Crowe (zinc cementation). Refining: smelting to doré (Au-Ag alloy) → London Good Delivery bar (99.5% purity).
Key relationships: Gold price (USD/troy oz, ~$1,900–$2,400 in 2023–2024), all-in sustaining cost (AISC: total cost including sustaining capex), gravity recoverable gold (GRG), refractory gold (locked in sulfides — requires pressure oxidation, BIOX, or roasting before cyanidation).

**C25 — Mine Planning and Economics**
Definition: Mine planning optimizes the extraction sequence to maximize net present value (NPV). Key tools: block model (3D grade model from drill data), pit optimization (Lerchs-Grossmann, Whittle), production scheduling, discounted cash flow (DCF) analysis. Feasibility study levels: scoping, prefeasibility (PFS), feasibility (BFS ±15% capital accuracy).
Key relationships: NPV, IRR (internal rate of return), payback period, capex (capital expenditure), opex (operating cost), metal price sensitivity, reserve estimation (proven and probable under JORC/NI43-101), LOM (life of mine) plan.

---

## 5. Patterns

**P01 — Drill Core Logging and Sampling**
Description: Log drill core systematically (rock type, structure, alteration, mineralization, RQD — Rock Quality Designation); split core with diamond saw; collect half-core samples at consistent intervals (0.5–2 m); process by crush, split (riffle splitter or rotary splitter), pulverize to 200 mesh; analyze by fire assay (gold), ICP-MS (multi-element); QAQC (standards, blanks, duplicates).
When to use: Mineral resource definition drilling; geotechnical core logging.
Example: Gold exploration: 2 m core samples → fire assay → results show 30 m of 2.5 g/t Au → drill infill to convert inferred to indicated resource.

**P02 — Flotation Circuit Optimization**
Description: Sample plant streams (feed, rougher concentrate, rougher tail, cleaner concentrate, final tail) systematically; calculate mass balance (metal distribution by stream); identify recovery and grade losses; adjust reagent dosages (collector, frother, pH, depressant); test in continuous pilot or at full scale with appropriate controls.
When to use: Operating concentrator plant optimization; new plant commissioning.
Example: Cu plant mass balance shows 85% Cu recovery in rougher but 75% to final concentrate; cleaner audit shows high Cu in cleaner tail → increase cleaner regrind, recirculate cleaner scavenger → improves overall recovery to 88%.

**P03 — Rock Mechanics Site Investigation**
Description: Collect oriented core for RQD and structural mapping; measure in-situ stress (hydraulic fracturing, overcoring); test intact rock (UCS, Brazilian tensile, triaxial shear); log structural data (joints, faults, foliation); classify rock mass (RMR, Q, GSI); model numerical stress analysis; design support for excavation geometry and stress state.
When to use: Underground mine design; tunnel excavation; large open pit slope design.
Example: Underground mine at 1,200 m depth: in-situ σ₁ = 45 MPa horizontal; σ₃ = 25 MPa vertical; GSI = 50; design 3 m long cement-grouted rock bolts at 1.5 m × 1.5 m spacing + 100 mm shotcrete.

**P04 — Acid Base Accounting (ABA) for Mine Waste**
Description: Measure acid potential (AP, from sulfide-S oxidation) and neutralizing potential (NP, from carbonate minerals); calculate NP:AP ratio; if NP:AP < 1 → potentially acid-generating (PAG); if NP:AP > 2 → non-acid-generating (NAG); require kinetic testing for uncertain materials; design waste facility segregation and water treatment based on classification.
When to use: Mine waste management design; regulatory permitting; closure planning.
Example: Waste rock classified: Zone A (NP:AP 0.5) → PAG, requires encapsulation with NAG material and monitoring of drainage chemistry; Zone B (NP:AP 3.5) → NAG, can be used for dam construction.

**P05 — Mine Ventilation Design**
Description: Calculate heat load (geothermal gradient, equipment heat, auto-compression, blasting), dust, and diesel/explosive gases (NO₂, CO); size primary fans for required airflow (typically 0.06–0.1 m³/s per kW diesel equipment); design ventilation raises, bulkheads, regulators, auxiliary fans; simulate with VentSim; ensure regulatory minimums (typically 0.06 m³/s/kW, O₂ > 19.5%, CO₂ < 0.5%).
When to use: Underground mine design; expansion ventilation review.
Example: New development at 1,500 m depth with 50 kW diesel bolter: requires minimum 3 m³/s; thermal simulation shows 35°C wet bulb at face without cooling → design refrigeration plant for deep ventilation.

**P06 — Metallurgical Testwork Program**
Description: Conduct representative sampling (variability composites); perform liberation analysis (QEMSCAN, MLA); bench-scale flotation or leach tests; determine head grade, recovery, concentrate grade; optimize reagent conditions; conduct locked-cycle tests (simulate recirculating loads); scale-up to pilot; use results to design plant and estimate capital/operating costs.
When to use: Feasibility study; process design; new deposit assessment.
Example: New porphyry copper deposit: QEMSCAN shows 85% chalcopyrite liberation at 150 μm; bench flotation tests at pH 11.5 with 30 g/t xanthate achieve 89% Cu recovery at 28% Cu concentrate; locked-cycle confirms; size SAG+ball mill circuit for P80 = 150 μm.

**P07 — Tailings Storage Facility (TSF) Design Review**
Description: Apply MAC (Mining Association of Canada) or ANCOLD guidelines; classify dam by consequence (Extreme/High/Significant based on downstream population, environment); design for PMF (Probable Maximum Flood); apply conservative freeboard; implement piezometer network; require independent technical review panel (TRP); mandatory annual inspection; emergency action plan (EAP).
When to use: New TSF design; existing TSF review/MERT; permitting.
Example: Post-Brumadinho (2019, 270 deaths): Brazil requires all upstream-construction dams to be decommissioned by 2027; global shift to filtered (dry stack) tailings despite higher capex.

---

## 6. Anti-Patterns

**AP01 — Using Grade Alone to Define Economic Value**
Why wrong: High-grade ore with poor metallurgical recovery, deep location, or remote geography may be uneconomic; low-grade ore with simple metallurgy, bulk mining, and infrastructure access may be highly profitable. Grade is one input to value, not a proxy for value.
What to do instead: Evaluate all value drivers: grade × recovery × metal price − (mining cost + processing cost + G&A + royalties); use NPV at appropriate discount rate; test sensitivity to metal price, recovery, and capital cost.

**AP02 — Ignoring Geotechnical Risk in Mine Design**
Why wrong: Slope failures in open pits (Bingham Canyon 2013, ~165 Mt slide) and underground rockbursts cause enormous financial loss and fatalities. Ignoring geotechnical data in mine design can create life-threatening situations and unscheduled production interruptions.
What to do instead: Integrate geotechnical data from earliest exploration; appoint qualified geotechnical engineer; conduct slope stability analysis as part of pit design; implement real-time monitoring (radar, total stations, piezometers, microseismics) for early warning.

**AP03 — Inadequate Tailings Dam Governance**
Why wrong: Tailings dam failures (Mount Polley 2014, Samarco/Fundão 2015, Brumadinho 2019) have caused mass fatalities, catastrophic environmental damage, and corporate liability exceeding $10 billion per event. The root cause typically involves governance failures: inadequate independent oversight, construction method not matched to risk, inadequate water management.
What to do instead: Apply Global Industry Standard on Tailings Management (GISTM, 2020 mandatory for ICMM members); require Extreme Consequence classification where downstream populations exist; mandate independent Technical Review Panel; CEO and Board accountability.

**AP04 — Treating All Ores as Amenable to Standard Processing**
Why wrong: Refractory gold ores (gold locked in arsenopyrite/pyrite) do not respond to standard cyanidation — gold dissolution rates <20%. Applying standard CIL to refractory ore results in gold being paid for in feed (purchased in acquisition) but not recovered in processing.
What to do instead: Conduct definitive metallurgical testwork including liberation analysis (QEMSCAN, MLA); identify ore type variability; design process flowsheet specifically for the ore type; account for ore type variability in resource/reserve estimates.

**AP05 — Underestimating Mine Closure Costs**
Why wrong: Mine closure involves decades of water treatment (AMD can persist for centuries), rehabilitation of waste dumps, tailings stabilization, and social transition. Closure costs are routinely underestimated by 50–200% at feasibility stage; financial assurance (bonding) is often insufficient, leaving public liability.
What to do instead: Estimate closure costs using detailed engineering from early project stage; update annually as mine life evolves; place financial assurance (bond or trust) equal to full closure cost; integrate closure planning into mine design (progressive rehabilitation).

**AP06 — Ignoring Social License to Operate**
Why wrong: Technically and economically viable mines are abandoned, delayed, or violently opposed because of inadequate community engagement, benefit-sharing failures, environmental conflicts, or indigenous rights violations. Protest and regulatory delay can exceed the economic impact of technical risks.
What to do instead: Engage communities from earliest exploration; obtain free, prior, and informed consent (FPIC) for indigenous-affected projects; negotiate community benefit agreements; disclose environmental impacts transparently; maintain ongoing dialogue throughout mine life.

**AP07 — Applying Galvanic Series Data Without Context**
Why wrong: Galvanic corrosion rates depend on area ratio (small anode/large cathode accelerates corrosion), electrolyte conductivity, temperature, and solution chemistry — not just relative nobility. Bolting stainless steel (noble) fittings to aluminum (less noble) with a small aluminum area creates rapid aluminum corrosion.
What to do instead: Consult galvanic compatibility tables with area ratio consideration; use insulating fittings between dissimilar metals; apply protective coatings; design to minimize electrolyte exposure; specify materials based on full environmental analysis.

---

## 7. Facts & Descriptors

| Fact ID | Statement | Category | Confidence |
|---|---|---|---|
| F001 | Global metal mining produces ~16 billion tonnes of ore per year (including waste rock); approximately 10 billion tonnes of waste rock and 2 billion tonnes of tailings generated annually. | Production | High |
| F002 | Chile produces ~27% of world's mined copper (~5.6 million tonnes/yr); Peru ~10%, DRC ~9%, China ~8%; Escondida (Chile) is the world's largest copper mine. | Production | Very High |
| F003 | Iron ore: ~2.5 billion tonnes mined/yr; Australia (900 Mt, BHP/Rio Tinto/FMG) and Brazil (400 Mt, Vale) dominate; Pilbara region (W. Australia) has largest Hamersley Formation deposits. | Production | Very High |
| F004 | Gold: ~3,200 tonnes mined/yr; China ~10%, Australia ~9%, Russia ~9%, Canada ~6%, US ~5%; Grasberg (Indonesia, Freeport) and Muruntau (Uzbekistan) are largest single mines. | Production | Very High |
| F005 | The Brumadinho tailings dam collapse (Brazil, January 25, 2019): 270 people killed; Vale faced $7+ billion in legal settlements; triggered global review of tailings dam safety. | Safety | Very High |
| F006 | Copper demand for EVs: an EV requires ~83 kg Cu vs. ~23 kg for ICE vehicle; total Cu demand from EVs projected to double by 2035, requiring significant new mine supply. | Critical Minerals | High |
| F007 | Lithium demand: EV adoption will require 40–50 Mt LCE/yr by 2050 vs. ~0.75 Mt in 2021 — requiring 50× production increase; Australia, Chile, Argentina (the "Lithium Triangle") hold ~75% of reserves. | Critical Minerals | High |
| F008 | China controls ~60% of global rare earth mining and ~85% of processing/refining; 2010 export restriction to Japan demonstrated geopolitical leverage; triggered major diversification investment. | Critical Minerals | Very High |
| F009 | Platinum group metals: South Africa's Bushveld Igneous Complex contains ~80% of world's platinum reserves; ~70% of world's rhodium and 40% of palladium. | PGMs | Very High |
| F010 | Bingham Canyon Mine (Utah, USA): world's largest open pit mine by excavated volume (~5 km wide, ~1.2 km deep); one of Earth's largest human-made excavations; operated continuously since 1906 by Rio Tinto. | Mining | Very High |
| F011 | Hall-Héroult process (aluminum electrolysis): requires 13–15 kWh/kg Al; global aluminum production ~68 Mt/yr consumes ~3–4% of global electricity; recycling requires only 5% of primary energy. | Metallurgy | Very High |
| F012 | JORC Code (Australasian) and NI 43-101 (Canada) are the primary international mineral resource and reserve reporting codes; require Competent Person (JORC) or Qualified Person (NI43-101) sign-off. | Governance | Very High |
| F013 | Acid mine drainage (AMD): can persist for centuries after mine closure; Iron Mountain Mine (California) produces pH -3.6 drainage — the most acidic natural water on Earth; treatment cost millions/yr in perpetuity. | Environment | Very High |
| F014 | The Grasberg mine (Papua, Indonesia, Freeport-McMoRan / Indonesia government): world's largest gold mine and second-largest copper mine; contentious indigenous rights, environmental, and governance history. | Production | Very High |
| F015 | Cyanide in gold mining: ~180,000 tonnes HCN equivalent used annually in gold mining; toxic (lethal at 300 mg/kg); International Cyanide Management Code (ICMC) provides responsible use framework; meticulously managed at certified sites. | Environment | Very High |
| F016 | Steel: global production ~1.95 billion tonnes/yr; China produces ~53%; most energy-intensive industrial sector (~7–9% of global CO₂); green steel (H₂-DRI-EAF) is emerging but <1% of production. | Metallurgy | Very High |
| F017 | The DRC (Democratic Republic of Congo) produces ~73% of world's cobalt; majority sourced through industrial mines (Glencore, China Molybdenum) plus artisanal mining (ASM) — the latter associated with child labor and unsafe conditions. | Critical Minerals | Very High |
| F018 | Titanium (Ti): 4th most abundant structural metal; extremely corrosion-resistant; high strength-to-weight ratio; used in aerospace (B787: ~15% Ti), biomedical implants, marine, chemical processing; ilmenite and rutile are primary ores. | Metallurgy | Very High |
| F019 | The Mohs hardness scale (1812): defines 10 reference minerals from talc (1) to diamond (10); used for mineral identification and abrasive selection; not a linear scale (diamond is ~1,500× harder than talc in absolute terms). | Mineralogy | Very High |
| F020 | Nickel demand for batteries: NMC811 battery cathode requires ~80% Ni; EV-driven demand growth projected to triple global Ni demand by 2040; Indonesia dominates supply (~45% global Ni), primarily from laterite HPAL (high-pressure acid leach) operations. | Critical Minerals | High |
| F021 | Block caving: resolving Oyu Tolgoi underground (Mongolia, Rio Tinto/Turquoise Hill) — world's largest ongoing underground mine development (block cave at ~1,300 m depth); initial schedule and cost overruns ~$1.4 billion over budget. | Mining | High |
| F022 | The Iron Ore Company of Canada (IOC): produces ~18 Mt/yr of iron ore concentrate; typical BF-grade pellet (65–67% Fe) required for blast furnace steelmaking; DRI-grade pellet (67–69% Fe, <3% SiO₂) required for hydrogen DRI production. | Metallurgy | High |
| F023 | Metallurgical coal (coking coal): ~1.07 billion tonnes/yr consumed for steelmaking; Australia (~60%) and Canada (~8%) are key exporters; seaborne coking coal price ~$200–300/t typically. | Production | Very High |
| F024 | ICMM (International Council on Mining & Metals): voluntary industry organization with 29 member companies and 38 national/regional associations; requires members to meet Position Statements on safety, environment, and human rights. | Governance | Very High |
| F025 | Mine water treatment: AMD treatment using active lime neutralization produces large volumes of sludge (metal hydroxides); passive treatment (constructed wetlands, permeable reactive barriers) is lower cost but lower performance; bioremediation emerging. | Environment | High |
| F026 | Froth flotation was invented by the Bessel brothers (Germany, 1877) and independently developed in Australia (1902–1906); now processes ~2 billion tonnes of ore annually; most widely used mineral separation technique. | History | Very High |
| F027 | Pressure oxidation (POX): used to pretreat refractory gold ores (arsenopyrite/pyrite matrix); operates at 190–230°C, 2–3 MPa in autoclave; oxidizes sulfide minerals, liberating gold for cyanidation; Barrick Goldstrike POX is world's largest. | Metallurgy | Very High |
| F028 | Phytoremediation: using hyperaccumulator plants (Thlaspi caerulescens for Zn/Cd, Alyssum bertolonii for Ni) to remediate metal-contaminated mine soils; slow but low-cost; can recover valuable metals (phytomining of Ni). | Environment | High |
| F029 | Global gold recycling: ~1,200 tonnes/yr (37% of total supply) recovered from jewelry, electronics, dental — the largest metal recycling economy by value. | Recycling | Very High |
| F030 | The GISTM (Global Industry Standard on Tailings Management, 2020): mandatory for ICMM members; requires "zero harm" design philosophy, Extreme Consequence classification for populated downstream areas, independent Technical Review Panel, 5-year TSF review cycle. | Governance | Very High |

*Cross-references: Geology pack (ore deposit genesis, rock mechanics), Chemistry pack (metallurgical chemistry, electrochemistry), Engineering pack (structural engineering, fluid mechanics), Environmental Science pack (AMD, closure, reclamation).*

*Pack integrity: 25 core concepts, 7 patterns, 7 anti-patterns, 30 facts. All 10 invariants satisfied.*
*Version 1.0 — DarkWave Studios LLC — AXIOM Engine*
