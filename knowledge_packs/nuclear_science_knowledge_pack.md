# NUCLEAR SCIENCE KNOWLEDGE PACK (v1.0)

*DarkWave Studios LLC — AXIOM Engine — Canon² Knowledge Series*
*Domain: Physical Sciences / Applied Sciences / Engineering*
*Ontology Alignment: identity, governance, routing, safety, monitoring*

---

## 1. Purpose

This pack encodes the structured knowledge base for Nuclear Science — the physical and engineering discipline governing the structure and behavior of atomic nuclei, nuclear reactions, and the technology of nuclear energy, radiation, and nuclear applications. It provides deterministic, queryable knowledge for reasoning about nuclear physics, reactor design, radiation safety, nuclear fuel cycles, nuclear medicine, fusion research, and the governance of nuclear materials and technology.

---

## 2. Scope

**Included:**
- Nuclear physics: atomic structure, radioactivity, nuclear reactions
- Reactor physics: neutron behavior, criticality, chain reactions
- Reactor design: thermal and fast reactors, advanced concepts
- Nuclear fuel cycle: mining, enrichment, fabrication, reprocessing, waste
- Radiation protection and dosimetry
- Radiation effects on matter and biology
- Nuclear power economics and role in energy systems
- Nuclear medicine: diagnostics and therapy
- Nuclear fusion: basic physics and experimental progress
- Accelerator physics and applications
- Nuclear weapons physics (academic, high-level)
- Nuclear governance: NPT, IAEA, safeguards, export controls

**Excluded:**
- Detailed nuclear weapons design beyond physics principles
- Classified technical details of any nuclear weapons program
- Medical imaging physics beyond nuclear medicine scope (see Medical pack)

*Safety Dominance Invariant: This pack contains no information that could provide meaningful technical assistance toward the construction of nuclear weapons or radiological dispersal devices. All weapons-relevant content is restricted to academic physics fundamentals available in standard textbooks.*

---

## 3. Structure

This pack is organized in five tiers: (1) nuclear physics fundamentals; (2) reactor physics and design; (3) the nuclear fuel cycle; (4) radiation protection, dosimetry, and nuclear medicine; (5) fusion, accelerators, governance, and emerging technology.

---

## 4. Core Concepts

**C01 — Atomic Nucleus Structure**
Definition: The nucleus contains protons (Z, atomic number — determines element) and neutrons (N); mass number A = Z + N. Nuclides identified as ᴬ_Z X (e.g., ²³⁵U). Isotopes: same Z, different N (e.g., ²³⁵U and ²³⁸U). Nuclear binding energy: energy required to disassemble the nucleus; released during nuclear reactions. Binding energy per nucleon peaks at iron (⁵⁶Fe) — maximum stability.
Key relationships: Mass defect (Δm = Z·m_p + N·m_n − m_nucleus), E = Δmc² (Einstein mass-energy equivalence), semi-empirical mass formula (Weizsäcker), strong nuclear force (range ~1 fm), Pauli exclusion principle (nuclear shell model).

**C02 — Radioactive Decay**
Definition: Spontaneous transformation of an unstable nucleus to a more stable state. Types: Alpha decay (α, ⁴He nucleus emitted, Z−2, A−4), Beta-minus decay (β⁻, neutron→proton + electron + antineutrino, Z+1), Beta-plus/electron capture (β⁺/EC, proton→neutron, Z−1), Gamma decay (γ, electromagnetic radiation, no change in Z or A), spontaneous fission.
Key relationships: Decay constant (λ), half-life (t₁/₂ = ln2/λ), activity (A = λN, Becquerel — 1 decay/s, Curie — 3.7×10¹⁰ decays/s), radioactive equilibrium (secular, transient), decay series (uranium, thorium, actinium).

**C03 — Nuclear Reactions**
Definition: Interactions between a projectile (neutron, proton, photon) and a target nucleus. Key reactions: fission (heavy nucleus splits after neutron absorption, releasing energy + 2–3 neutrons + fission products), fusion (light nuclei combine to form heavier nucleus + energy), capture (neutron absorbed, emitting gamma), activation (stable nucleus → radioactive nuclide).
Key relationships: Q-value (energy released/absorbed: positive = exothermic), cross section (σ, probability of reaction, barns: 1b = 10⁻²⁴ cm²), reaction kinematics, threshold energy, compound nucleus model.

**C04 — Nuclear Fission**
Definition: A heavy nucleus (typically ²³⁵U, ²³⁹Pu, ²³³U) absorbs a neutron and splits into two fission fragments + 2–3 prompt neutrons + prompt gamma + ~200 MeV energy per fission. Fission products are initially neutron-rich and radioactive, decaying through beta chains over seconds to years — the source of long-lived nuclear waste.
Key relationships: Fissile vs. fertile material (fissile: directly fissionable by thermal neutrons: ²³⁵U, ²³⁹Pu, ²³³U; fertile: converted to fissile: ²³⁸U→²³⁹Pu, ²³²Th→²³³U), prompt vs. delayed neutrons (delayed: 0.7% for ²³⁵U fission, critical for reactor controllability), energy per fission (~200 MeV vs. ~4 eV for coal combustion — ratio of 50 million).

**C05 — Neutron Chain Reaction and Criticality**
Definition: Multiplication factor k_eff: average number of fission neutrons causing the next fission. k_eff = 1: critical (steady-state chain reaction — reactor operation); k_eff < 1: subcritical (reaction dies); k_eff > 1: supercritical (exponential growth). k_eff depends on: neutron production (fission), losses (leakage, absorption in non-fissile materials), and geometry.
Key relationships: Six-factor formula (k_∞ = η × ε × p × f; k_eff = k_∞ × P_NL × P_TL), prompt criticality (dangerous — most reactors designed to be subcritical on prompt neutrons alone), delayed neutron fraction (β), reactivity (ρ = (k−1)/k, measured in pcm or dollars), generation time.

**C06 — Reactor Physics: Moderators and Coolants**
Definition: Moderator: material slowing fast fission neutrons to thermal energies (where ²³⁵U fission cross section is much higher — 585 barns vs. ~1 barn at fast energies) by elastic scattering. Best moderators: H₂O (light water — absorbs some neutrons, requires enriched fuel), D₂O (heavy water — very low absorption, can use natural uranium), graphite, beryllium.
Key relationships: Neutron thermalization, lethargy (logarithmic energy variable), moderating ratio (slowing power / absorption), neutron flux (Φ = n × v, neutrons/cm²/s), neutron energy spectrum (thermal ~0.025 eV, fast ~1 MeV), void coefficient (positive void coefficient in RBMK led to Chernobyl instability).

**C07 — Reactor Types**
Definition: Classified by neutron spectrum (thermal vs. fast), moderator, and coolant. Light Water Reactors (LWR, dominant: ~70% of world fleet): Pressurized Water Reactor (PWR) and Boiling Water Reactor (BWR). Heavy Water Reactor (HWR, CANDU): natural uranium fuel, online refueling. Gas-Cooled Reactors (Magnox, AGR, UK). Sodium Fast Reactors (SFR): breed plutonium, no moderator. Advanced concepts: SMR (Small Modular Reactors), molten salt reactors (MSR), high-temperature gas reactors (HTGR).
Key relationships: Thermal efficiency (PWR: ~33%, HTGR: ~45%), load factor, capacity factor, core power density, thermal hydraulics.

**C08 — Pressurized Water Reactor (PWR)**
Definition: Most common reactor type. High-pressure (155 bar) water primary circuit transfers heat through steam generator to lower-pressure secondary circuit producing steam for turbine. Reactor cooling and moderating function both performed by water. Negative temperature coefficient (increased temperature → decreased reactivity → inherent stability). Requires enriched uranium (3–5% ²³⁵U).
Key relationships: Primary/secondary circuit separation (no radioactivity in steam cycle), pressurizer (maintains liquid phase), steam generator, ECCS (Emergency Core Cooling System), PWR fuel assembly (17×17 pin array, UO₂ pellets in Zircaloy cladding, ~3.66 m length).

**C09 — Nuclear Fuel Cycle**
Definition: Complete path of nuclear material from mine to final disposal. Once-through (open) cycle: mining → conversion → enrichment → fuel fabrication → reactor → spent fuel storage → repository. Closed cycle: reprocessing extracts plutonium and uranium for reuse → reduces waste volume, creates proliferation risk.
Key relationships: Uranium mining (ISL, open pit, underground), conversion (UO₃ → UF₆ for enrichment), enrichment (gas centrifuge, diffusion obsolete), fuel fabrication (UO₂ pellets → fuel rods → assemblies), spent fuel storage (wet pool 5–10 years, then dry cask), geological disposal (deep geological repository — DGR).

**C10 — Uranium Enrichment**
Definition: Natural uranium: 0.711% ²³⁵U. Enrichment increases ²³⁵U concentration. Gas centrifuge (modern standard): UF₆ gas spun at high speed; heavier ²³⁸UF₆ concentrates at periphery; requires many cascade stages. Produces: low-enriched uranium (LEU, <20% ²³⁵U, reactor fuel); highly enriched uranium (HEU, >20%, weapons-grade typically >90%) — strict IAEA safeguards.
Key relationships: Separative Work Unit (SWU — measure of enrichment effort), natural feed, tails assay, product assay, cascade efficiency, gaseous diffusion (legacy, US, France — energy intensive), electromagnetic separation (calutron, legacy), centrifuge leaders (Urenco, Rosatom, CNNC).

**C11 — Radiation Types and Properties**
Definition: Ionizing radiation: Alpha (α, ²He nucleus, 2+ charge, 4–10 MeV, stopped by paper/skin — hazardous if inhaled/ingested). Beta (β, electron or positron, stopped by plastic/aluminum). Gamma (γ, high-energy photons, requires lead/concrete shielding). Neutron (electrically neutral, highly penetrating, moderated by hydrogen-rich materials). X-ray (lower energy photons, medical, industrial).
Key relationships: Linear energy transfer (LET), interaction mechanisms (photoelectric, Compton scattering, pair production for γ; ionization for α/β), range vs. energy vs. charge relationships, shielding materials (Pb, concrete for γ; PE, H₂O for neutrons), Bragg peak (α, β — maximum energy deposition near end of range).

**C12 — Radiation Dosimetry**
Definition: Measuring radiation dose. Absorbed dose (D): energy deposited per unit mass (Gray, Gy = J/kg). Equivalent dose (H = D × wR): weighted by radiation type (wR: α=20, neutron=5–20, β=1, γ=1). Unit: Sievert (Sv). Effective dose (E): weighted by tissue sensitivity (lung, colon, gonads most sensitive). Background dose: ~2–3 mSv/yr (global average).
Key relationships: ALARA principle (As Low As Reasonably Achievable), dose limits (occupational: 20 mSv/yr; public: 1 mSv/yr — ICRP), committed effective dose (from internal emitters), dose rate, collective dose (person-Sv).

**C13 — Biological Effects of Radiation**
Definition: Ionizing radiation damages DNA by direct ionization and free radical production. Deterministic effects (threshold dose): acute radiation syndrome (ARS, whole-body >1 Gy: prodrome, latent, manifest illness, recovery/death), local tissue necrosis, cataracts. Stochastic effects (no threshold, probabilistic): cancer (ICRP nominal probability coefficient: ~5% increased cancer risk per 100 mSv), hereditary effects.
Key relationships: LD₅₀/₃₀ (lethal dose for 50% of population in 30 days: ~4–5 Gy whole body), linear no-threshold model (LNT, basis of radiation protection), radiation-induced cancer latency (5–30+ years), dose-response models (LNT vs. threshold vs. hormesis debate).

**C14 — Reactor Safety Systems**
Definition: Defense-in-depth principle: multiple independent barriers and safety systems. Barriers: UO₂ fuel matrix, Zircaloy cladding, reactor pressure vessel (RPV), containment building (reinforced concrete or steel). Safety systems: scram (rapid reactor shutdown via control rod insertion), ECCS (core cooling), passive safety systems (gravity/natural convection-driven — Gen III+).
Key relationships: Passive safety (AP1000, NuScale SMR: cooling without pumps for 72+ hours), negative feedback coefficients (temperature, void — ensure natural stability), core damage frequency (CDF: target <10⁻⁵ per reactor-year), large early release frequency (LERF: target <10⁻⁶), defense-in-depth.

**C15 — Major Nuclear Accidents**
Definition: Three Mile Island (TMI, 1979, Pennsylvania, PWR partial core melt, confined within containment, no significant public health impact, major loss of public confidence). Chernobyl (1986, Ukraine, RBMK graphite-moderated, positive void coefficient instability during flawed test, steam explosion + fire, 31 direct deaths, 15 thyroid cancer deaths, 350,000 evacuated, ~3,500 km² exclusion zone). Fukushima Daiichi (2011, Japan, PWR station blackout from tsunami, 3 core melt-throughs, hydrogen explosions, ~1,700 km² evacuation zone, no direct radiation fatalities, massive economic impact).
Key relationships: Loss of coolant accident (LOCA), station blackout (SBO), hydrogen generation (Zircaloy-water reaction), iodine-131 (thyroid dose from food/milk pathway), cesium-137 (long-term ground contamination), INES scale (International Nuclear Event Scale, 0–7: Chernobyl and Fukushima = 7 maximum).

**C16 — Nuclear Fusion**
Definition: Fusing light nuclei (most promising: deuterium + tritium → helium + neutron + 17.6 MeV) releases far more energy per reaction mass than fission. Requires: temperatures >100 million K (plasma), sufficient density and confinement time (Lawson criterion: n·τ_E × T > 3×10²¹ m⁻³·s·keV for D-T). Approaches: magnetic confinement (tokamak — ITER, stellarator — W7-X), inertial confinement (NIF laser), and commercial fusion startups (CFS SPARC, TAE, Helion).
Key relationships: Q-factor (fusion energy out / heating energy in: Q=1 = breakeven; Q=10 = commercial target), plasma beta (β = plasma pressure / magnetic pressure), tokamak plasma stability (kink, ballooning modes), tritium breeding (lithium blanket: ⁶Li + n → T + ⁴He), neutron activation of structural materials.

**C17 — ITER and Fusion Programs**
Definition: ITER (International Thermonuclear Experimental Reactor): international collaborative fusion project (EU, US, Russia, Japan, China, India, South Korea) under construction at Cadarache, France. World's largest tokamak; target: Q=10 (500 MW fusion power from 50 MW input, 10× energy gain); first plasma planned ~2025–2027 (revised); full fusion operation ~2035.
Key relationships: Tokamak operation (toroidal magnetic field + plasma current → helical field for stability), superconducting magnets (Nb₃Sn, 13 Tesla), plasma facing components, divertor (exhaust management), breeding blanket (tritium), neutron wall load.

**C18 — Small Modular Reactors (SMRs)**
Definition: Reactors typically <300 MW(e) using factory manufacturing and modular assembly to reduce capital cost, construction time, and financial risk vs. large-unit nuclear. Types: Light water SMRs (NuScale VOYGR, GE-Hitachi BWRX-300), High Temperature Gas (HTGR: X-energy Xe-100), Molten Salt (Terrestrial Energy IMSR), Fast spectrum (TerraPower Natrium). First commercial SMR deployments anticipated 2028–2035.
Key relationships: Passive safety, overnight capital cost ($/kW), construction time, factory fabrication learning curve, siting flexibility (smaller footprint), waste heat applications (process heat, hydrogen production), SMR deployment status by country.

**C19 — Nuclear Medicine**
Definition: Using radioactive materials for diagnosis (imaging) and therapy. Diagnostic: PET (Positron Emission Tomography, ¹⁸F-FDG: fluoro-deoxyglucose, detects glucose-hungry cancer cells), SPECT (Single Photon Emission CT, ⁹⁹ᵐTc, ¹²³I), gamma camera. Therapeutic: I-131 (thyroid cancer/hyperthyroidism), Y-90 (microspheres for liver cancer), Lu-177 DOTATATE (neuroendocrine tumors), targeted alpha therapy.
Key relationships: Radiopharmaceuticals (carrier molecule + radionuclide), generator systems (⁹⁹Mo/⁹⁹ᵐTc cow: most widely used medical radionuclide), cyclotron production of PET isotopes (¹⁸F, ¹¹C, ¹³N), ALARA in nuclear medicine, nuclear medicine dose (typical PET scan ~7 mSv, CT component ~8 mSv).

**C20 — Radiation Protection: Shielding**
Definition: Shielding materials selected by radiation type: Alpha — thin material (paper, skin — primary concern is internal contamination); Beta — low-Z material (plastic, water — prevents bremsstrahlung from high-Z); Gamma/X-ray — high-Z dense material (lead, concrete); Neutron — hydrogen-rich material (polyethylene, water) + boron/cadmium for thermal neutron absorption.
Key relationships: Half-value layer (HVL: thickness reducing intensity by 50%); Pb HVL for 1 MeV γ = ~1 cm; concrete HVL ~15 cm; attenuation coefficient (μ: intensity I = I₀ × e^(−μx)); buildup factor (scattered photons increase dose behind shield); shielding design calculation vs. measurement.

**C21 — Nuclear Waste Management**
Definition: Classified by radioactivity level: High-Level Waste (HLW, spent fuel or reprocessing liquid — requires deep geological repository — DGR); Intermediate-Level Waste (ILW, resins, filters, cladding); Low-Level Waste (LLW, gloves, tools, contaminated materials — near-surface disposal). HLW must be isolated for ~100,000–1,000,000 years. KBS-3 method (Sweden/Finland): copper canister in bentonite clay in stable granite, ~500m depth.
Key relationships: Fission product heat decay (requires cooling for decades), actinide transmutation (fast reactor reducing long-lived waste), Onkalo (Finland: world's first DGR under construction), Yucca Mountain (US: licensed but politically stalled), glass vitrification of HLW liquid, intergenerational equity.

**C22 — Nuclear Non-Proliferation**
Definition: The global framework preventing spread of nuclear weapons. NPT (Nuclear Non-Proliferation Treaty, 1968, 191 parties): NWS (US, Russia, UK, France, China) commit to disarmament; NNWS commit not to acquire nuclear weapons; right to peaceful nuclear energy. IAEA Safeguards: inspections and monitoring to verify declared materials. Export controls (NSG: Nuclear Suppliers Group): control dual-use technology.
Key relationships: IAEA Additional Protocol (enhanced inspection rights), enrichment and reprocessing (E&R) as proliferation-sensitive, fuel bank (IAEA LEU reserve for countries forgoing E&R), states outside NPT (India, Pakistan, Israel), DPRK (North Korea — withdrew from NPT 2003, tested weapons 2006–2017).

**C23 — Accelerator Physics**
Definition: Particle accelerators use electromagnetic fields to accelerate charged particles. Types: Linear (linac: Stanford SLAC, medical proton linacs), circular (cyclotron: medical isotope production; synchrotron: CERN LHC, synchrotron X-ray sources). Applications: fundamental physics research (LHC: Higgs boson 2012), medical radiotherapy (proton therapy, carbon ion), neutron sources (spallation: SNS, ISIS), isotope production (cyclotrons for ¹⁸F, ⁶⁸Ga).
Key relationships: Proton therapy Bragg peak (precisely deposits dose at tumor depth), cyclotron principle (resonance frequency = qB/2πm), synchrotron radiation (X-ray, used in materials science, structural biology), luminosity (particle collision rate), spallation (high-energy proton hits heavy target → neutron shower).

**C24 — Radiation Detectors**
Definition: Instruments measuring ionizing radiation. Gas detectors: ionization chamber (measures charge from ionization, accurate, calibration standard), proportional counter (amplified signal, discriminate α/β), Geiger-Müller (GM) tube (simple, widely used, no energy discrimination). Scintillation detectors: NaI(Tl) (gamma spectroscopy), BGO, LSC (liquid scintillation for α/β). Solid-state: HPGe (high-purity germanium, excellent energy resolution for gamma spectroscopy), Si(Li).
Key relationships: Energy resolution (HPGe: 0.2% vs. NaI: 7% at 662 keV), dead time, detector efficiency (intrinsic, absolute), MDA (Minimum Detectable Activity), dose rate meter vs. spectrometer.

**C25 — Nuclear Energy Economics and Climate Role**
Definition: Nuclear power provides ~10% of global electricity (~2,600 TWh/yr, 2023) from 440 operating reactors; low lifecycle carbon emissions (~15 g CO₂-eq/kWh, comparable to wind); provides firm, dispatchable, 24/7 power unlike most renewables. Challenged by high capital costs (overnight cost $6,000–$12,000/kW for new large units), long construction times, and waste management costs. Levelized Cost of Energy (LCOE): $70–$150/MWh for new nuclear (varies by country and financing).
Key relationships: Capacity factor (nuclear ~90%+ vs. solar ~25%, wind ~35%), dispatchability, energy density (1 kg uranium = ~50,000 kWh vs. 1 kg coal = ~8 kWh), loan guarantees (US DOE), Construction Work in Progress (CWIP) vs. AFUDC.

---

## 5. Patterns

**P01 — Criticality Safety Analysis**
Description: Identify all credible configurations of fissile material in facility; calculate k_eff for each configuration using validated neutronics codes (SCALE, MCNP); demonstrate k_eff ≤ 0.95 with double contingency principle (two simultaneous, independent failures required to reach criticality); document in criticality safety evaluation (CSE).
When to use: Fissile material handling, storage, and processing facilities; fuel fabrication; reprocessing.
Example: Fuel fabrication plant: MCNP criticality calculation for worst-case geometric configuration of enriched UO₂ powder; k_eff = 0.88 <0.95; single parameter control system qualified with safety margin; updated for new enrichment level per ANSI/ANS-8 standards.

**P02 — ALARA Optimization for Radiation Workers**
Description: Identify radiation sources and exposures; quantify doses with dosimetry and calculations; identify ALARA measures (time reduction, distance increase, shielding addition); estimate dose savings; apply cost-benefit ($/person-mSv); implement measures where cost-effective; verify effectiveness; document.
When to use: New work task in radiation area; annual ALARA review; high-dose work planning.
Example: Maintenance on primary circuit valve in PWR: estimated 5 mSv/job; ALARA analysis: pre-job training (saves 1 mSv, $10k), water shielding blankets (saves 2 mSv, $20k), rapid valve replacement tool (saves 0.5 mSv, $5k/job → cost-effective if done annually); final dose 1.5 mSv vs. 5 mSv baseline.

**P03 — Radioactive Waste Classification and Segregation**
Description: Characterize waste stream (radionuclides, concentrations, half-lives, physical/chemical form); classify per national regulations (LLW/ILW/HLW or Class A/B/C in US 10 CFR 61); segregate at source by class; condition into appropriate waste form (grouting for LLW, vitrification for HLW); package in approved container; document for waste tracking.
When to use: Nuclear facility operations; decommissioning; waste minimization programs.
Example: Reactor decommissioning: structural steel surveyed; activated steel (above clearance level, short-lived — ⁶⁰Co) → classified ILW → segmented, packaged in shielded containers, sent to licensed facility; unactivated structural steel → cleared for unrestricted release after survey.

**P04 — Nuclear Emergency Response**
Description: Declare emergency (event classification: notification of unusual event, alert, site area emergency, general emergency — US 10 CFR 50.72); notify NRC/regulators; activate emergency response organization (ERO); implement protective action guidelines (PAG: shelter-in-place, potassium iodide distribution, evacuation); activate emergency plan; notify off-site authorities; assess and mitigate source.
When to use: Nuclear plant emergency; radioactive material accident; declared nuclear emergency.
Example: Fukushima response (2011): INES Level 7 declared; 20 km evacuation zone; potassium iodide distributed (partially delayed, reducing effectiveness); UN Scientific Committee on the Effects of Atomic Radiation (UNSCEAR) assessment found no attributable radiation fatalities.

**P05 — Radiation Source Term Characterization**
Description: Identify radionuclides in source (gamma spectroscopy for γ-emitters; radiochemical separation + LSC/alpha spectrometry for α/β); measure activity; calculate dose rate as function of distance; assess containment status; determine exposure pathways (direct, inhalation, ingestion); calculate doses to workers and public; compare to limits.
When to use: Characterizing unknown radioactive sources; environmental monitoring; decommissioning.
Example: Found orphan source: GM survey → high reading; lead pig for transport; HPGe spectroscopy → identifies Cs-137 (661.7 keV gamma); activity 3.7 GBq; dose rate 5 mSv/hr at 1 m; implement appropriate shielding for handling; notify NRC.

**P06 — Neutron Activation Analysis (NAA)**
Description: Irradiate sample with neutrons (in reactor or neutron generator); stable nuclides become radioactive; measure characteristic gamma energies using HPGe; compare to standards; quantify elemental concentrations at ppm–ppb level; non-destructive analysis of archaeological artifacts, forensics, environmental samples.
When to use: Trace element analysis; material provenance; archaeological artifact characterization.
Example: NAA of Maya obsidian artifacts: compare to geological source database; element ratios (Rb, Zr, Mn) match El Chayal source with >95% confidence; establishes trade network distribution without destroying artifacts.

**P07 — Reactor Fuel Management (Core Loading)**
Description: Simulate fuel assembly depletion history (burnup, Pu buildup); optimize fresh fuel placement vs. partially burned fuel (low-leakage loading — fresh fuel in center reduces neutron leakage and radiation dose to vessel); calculate power distribution (peaking factor limit ~1.55); verify shutdown margin; run physics testing (criticality prediction, control rod worth measurement) after loading.
When to use: Nuclear plant refueling outage preparation.
Example: PWR 18-month fuel cycle: 1/3 core replaced (68 fresh assemblies); low-leakage loading places burned assemblies on periphery; peak linear heat rate <400 W/cm (limit); ΔT between prediction and measurement <0.1% Δk during startup physics testing.

---

## 6. Anti-Patterns

**AP01 — Applying Linear No-Threshold (LNT) Mechanically Without Context**
Why wrong: LNT (linear extrapolation from high-dose effects to zero dose, assuming no safe threshold) is a regulatory conservatism tool, not an established biological fact for low doses. Mechanically applying LNT to calculate collective dose from small individual doses (e.g., from nuclear power plants) produces scientifically questionable predictions of cancer cases that may not actually occur.
What to do instead: Use LNT for regulatory purposes and radiation protection as intended; acknowledge the scientific uncertainty below ~100 mSv; do not use LNT-derived collective dose calculations to make public health claims about low-dose exposures without appropriate scientific caveats.

**AP02 — Treating All Nuclear Reactor Types as Equally Safe**
Why wrong: Nuclear reactor designs have fundamentally different safety characteristics. The RBMK (Chernobyl) had a positive void coefficient — increasing power as coolant boiled, creating inherent instability. Modern LWRs have negative temperature and void coefficients — inherently self-limiting. Passive safety designs (AP1000, NuScale) eliminate the need for active cooling following loss of power.
What to do instead: Evaluate each reactor design on its specific safety characteristics: temperature coefficient, void coefficient, passive safety mechanisms, containment design, and defense-in-depth implementation; do not generalize from one design to another.

**AP03 — Conflating Radiation with Radioactive Contamination**
Why wrong: Radiation is energy traveling through space (stops when source stops or you move away). Radioactive contamination is radioactive material deposited on surfaces or inside the body (a continuing source of exposure requiring decontamination). A radiation survey finding a high dose rate does not identify contamination; a contamination survey uses different instruments and techniques.
What to do instead: Distinguish radiation fields (measured with Geiger/ionization chambers) from surface contamination (measured with smear tests, alpha probes, beta probes) and internal contamination (whole-body counting, bioassay); apply different controls and protective measures for each.

**AP04 — Underestimating Nuclear Waste Volume from Closed Fuel Cycle**
Why wrong: Reprocessing reduces the volume of high-level waste but creates large volumes of intermediate and low-level waste (from solvent extraction, equipment contamination, and process chemicals) and introduces plutonium separation — the primary proliferation concern. Total waste management burden is not simply reduced by reprocessing.
What to do instead: Conduct total waste cycle accounting; evaluate reprocessing benefits (reduced HLW volume, resource recovery) against costs (proliferation risk, large LLW/ILW generation, high reprocessing cost $1,000–2,000/kg HM) and alternatives (direct disposal in DGR).

**AP05 — Dismissing Nuclear Power Based on Chernobyl/Fukushima Without Comparative Risk Analysis**
Why wrong: Epidemiological comparison of deaths per TWh of electricity generated: coal (~25 deaths/TWh from air pollution), oil (~18), biomass (~25), natural gas (~3), nuclear (~0.07, including Chernobyl); nuclear is among the safest energy sources per unit electricity generated despite its dramatic accident history.
What to do instead: Apply consistent comparative risk methodology across energy sources; include lifecycle mortality, air pollution, climate impacts, and accident risk; acknowledge that all energy sources have risks and the comparison determines relative policy value.

**AP06 — Using Geiger Counters for All Radiation Measurement Tasks**
Why wrong: Geiger-Müller (GM) tubes detect ionizing radiation but cannot distinguish energy or type accurately, can saturate (read falsely low in very high fields), and are not calibrated for dose measurement. Using a GM tube to measure dose rate in a neutron field, identify isotopes, or measure very high doses produces incorrect results.
What to do instead: Select instrument matched to the measurement task: ionization chamber for dose rate in photon field, HPGe for isotope identification, TLD or OSL for personnel dosimetry, BF₃ or He-3 detectors for neutron fields, scintillation for low-level environmental gamma spectroscopy.

**AP07 — Treating Nuclear Safeguards as a Box-Checking Exercise**
Why wrong: IAEA safeguards depend on accurate material accounting (nuclear material control and accounting — NMC&A), facility declarations, inspector access, and instrument reliability. States or facilities that provide technically accurate but strategically incomplete declarations (as Iraq did before 1991) can evade detection. Safeguards confidence depends on inspector independence, access, and analytical capability.
What to do instead: Treat safeguards as substantive non-proliferation verification — support inspector access and environmental sampling; implement integrated safeguards where earned; support IAEA Additional Protocol universalization; invest in safeguards technology (environmental sampling, satellite monitoring, big data analytics).

---

## 7. Facts & Descriptors

| Fact ID | Statement | Category | Confidence |
|---|---|---|---|
| F001 | Nuclear power provides ~10% of global electricity; ~440 operating reactors in 32 countries; France generates ~70% of its electricity from nuclear (highest share globally). | Energy | Very High |
| F002 | Energy density: 1 kg of natural uranium (~0.7% ²³⁵U) produces ~45,000 kWh of electricity when used in current LWRs; in a fast breeder reactor, potentially ~3.7 million kWh — a factor of ~80 more. | Physics | Very High |
| F003 | The Chernobyl accident (April 26, 1986): INES Level 7; 31 direct deaths (2 explosion, 28 ARS); WHO estimates 4,000 additional cancer deaths from radiation among the 600,000 most exposed; ~3,500 km² Exclusion Zone still restricted. | Accidents | Very High |
| F004 | Fukushima Daiichi (March 11, 2011): INES Level 7; zero attributable radiation deaths (UNSCEAR 2022); ~2,200 evacuation-related deaths; cost estimated at ~$200 billion including decommissioning; drove major policy reversals (Germany, Japan). | Accidents | Very High |
| F005 | Three Mile Island (March 28, 1979): INES Level 5; partial core melt (PWR); containment held; no significant radiation releases; average dose to nearby population <0.1 mSv; largest US nuclear accident — fundamentally altered nuclear industry safety culture. | Accidents | Very High |
| F006 | Natural background radiation: average global dose ~2.4 mSv/yr (UNSCEAR): cosmic radiation ~0.39 mSv, terrestrial (soil, radon) ~1.5 mSv, internal (food/water ingestion) ~0.29 mSv; Ramsar, Iran: up to 260 mSv/yr (highest natural background on Earth). | Dosimetry | Very High |
| F007 | Radon-222 (from uranium decay in soil) contributes ~50% of average public radiation dose in developed countries; causes ~21,000 lung cancer deaths/yr in the US (2nd leading cause of lung cancer, after smoking). | Dosimetry | Very High |
| F008 | ITER (France): 35-nation project; estimated cost >€20 billion; largest magnet system ever built (18 D-shaped TF coils, 11,000 tonnes superconducting magnets); Q=10 target; designed to demonstrate fusion viability, not generate electricity. | Fusion | Very High |
| F009 | NIF fusion milestone (December 5, 2022): National Ignition Facility (Livermore, CA) achieved ignition — laser energy input 2.05 MJ, fusion energy output 3.15 MJ (Q=1.5 on target, Q<<1 including laser inefficiency); first controlled thermonuclear ignition in a laboratory. | Fusion | Very High |
| F010 | Nuclear weapons: 9 states possess nuclear weapons (US ~5,500 warheads, Russia ~6,255, UK ~225, France ~290, China ~410, India ~160, Pakistan ~160, Israel ~90 est., DPRK ~40–50); global total peaked at ~70,000 (1986); ~12,500 today (SIPRI 2024). | Weapons | Very High |
| F011 | Global uranium production: ~58,000 tU/yr (2021); Kazakhstan largest producer (~45%), Canada (~13%), Namibia (~12%); world's largest uranium mine: Cigar Lake (Canada, 18% U₃O₈ average grade — world's highest). | Resources | Very High |
| F012 | Technetium-99m (⁹⁹ᵐTc): most widely used medical radioisotope; ~85% of nuclear medicine diagnostic procedures; 6-hour half-life (ideal for imaging); produced by ⁹⁹Mo/⁹⁹ᵐTc generators; supply chain vulnerability (depends on 4–5 aging research reactors). | Medicine | Very High |
| F013 | The Manhattan Project (1942–1945): first nuclear weapons program; 130,000 workers; $2 billion cost; Trinity test (July 16, 1945, New Mexico); Hiroshima (Little Boy, ²³⁵U gun-type, ~15 kt, ~70,000–80,000 immediate deaths) and Nagasaki (Fat Man, ²³⁹Pu implosion, ~21 kt, ~40,000 immediate deaths). | History | Very High |
| F014 | Thorium fuel cycle: ²³²Th (fertile) + neutron → ²³³U (fissile); 3× more abundant than uranium; produces less transuranic waste; India pursuing thorium fuel cycle; molten salt reactors (MSR) particularly suited; commercial viability still unproven. | Fuel Cycle | High |
| F015 | NuScale Power: first SMR to receive NRC design certification (January 2023, NuScale VOYGR-6); 77 MW(e) per module; passive safety; 12-module plant = 924 MW(e); first customer project cancelled (UAMPS/Carbon Free Power Project, November 2023) due to cost escalation. | SMR | Very High |
| F016 | Global nuclear construction: 58 reactors under construction (2024); China leads with 24; largest projects: Hinkley Point C (UK, 2×EPR, >£35 billion — world's most expensive power station); Vogtle 3&4 (Georgia, US, AP1000, first new US reactors in 30 years — opened 2023/2024 at $35+ billion, years late). | Economics | Very High |
| F017 | Proton therapy: uses Bragg peak to concentrate dose at tumor depth while sparing surrounding tissue; ~100 proton therapy centers worldwide (2024); ~13,000 patients treated annually; costs ~2–3× conventional X-ray therapy; particularly beneficial for pediatric brain tumors, prostate, head-and-neck cancers. | Medicine | Very High |
| F018 | Radiation hormesis hypothesis: some evidence suggests low doses of radiation (<100 mSv) may stimulate protective cellular mechanisms; supported by some epidemiological data (Ramsar, high-dose areas, nuclear worker studies); not accepted in regulatory framework; scientifically contested. | Dosimetry | Medium |
| F019 | Tritium (³H, T): radioactive hydrogen isotope, β⁻ emitter, t₁/₂ = 12.3 years; fusion fuel (D-T reaction); produced by ⁶Li(n,α)T in blanket; also produced in CANDU reactors and released in small amounts from all nuclear plants; tritium water (HTO) is primary environmental concern. | Physics | Very High |
| F020 | The IAEA safeguards system verifies ~185,000 significant quantities of nuclear material annually across 1,300+ facilities in 180 states; operates with budget ~€175 million/yr and 340+ inspectors. | Governance | Very High |
| F021 | Nuclear power capacity factor: global average ~90% (nuclear plants run at nearly full power most of the time); highest capacity factors: US nuclear fleet ~93% average; far exceeds wind (~35%) and solar (~25%). | Energy | Very High |
| F022 | Spent nuclear fuel: ~10,000 tonnes heavy metal (tHM)/yr generated globally; ~400,000 tHM in storage worldwide (2022); 94% ²³⁸U, 1% ²³⁵U, 1% Pu, 4% fission products; 1 year of global electricity production from nuclear generates ~3 kg of spent fuel per person in nuclear countries. | Waste | Very High |
| F023 | Onkalo (Finland): world's first deep geological repository for high-level nuclear waste, approved and under construction (~500m depth in Precambrian granite); designed for 100,000 year isolation; operated by Posiva Oy; first emplacement expected ~2025. | Waste | Very High |
| F024 | The world's first nuclear reactor: Chicago Pile-1 (CP-1), Stagg Field, University of Chicago, December 2, 1942; Enrico Fermi led the team; achieved first self-sustaining controlled nuclear chain reaction; used natural uranium + graphite moderator; no shielding, no cooling. | History | Very High |
| F025 | Nuclear power lifecycle GHG emissions: ~12–15 g CO₂-eq/kWh (IPCC range); comparable to wind (7–14 g) and much lower than solar (27–48 g), natural gas (490 g), and coal (820 g). | Climate | Very High |
| F026 | CANDU reactor (Canadian Deuterium Uranium): uses heavy water moderator and coolant; can use natural uranium fuel (no enrichment needed); online refueling (no shutdown required); 31 reactors operating globally; pressurized heavy water reactor (PHWR) design. | Reactors | Very High |
| F027 | The U.S. Nuclear Regulatory Commission (NRC): independent regulatory agency; 3,000 employees; regulates ~95 commercial nuclear power reactors, research reactors, fuel facilities, and radioactive material users; operates 24/7 Operations Center; issues licenses and conducts inspections. | Governance | Very High |
| F028 | Carbon-14 (¹⁴C, t₁/₂ = 5,730 years): produced by cosmic ray interactions with ¹⁴N in atmosphere; fundamental tool for radiocarbon dating of organic materials up to ~50,000 years; revolutionized archaeology and paleoclimatology; Nobel Prize Chemistry 1960 (Willard Libby). | Applications | Very High |
| F029 | Yucca Mountain (Nevada, US): proposed deep geological repository for US high-level nuclear waste; licensed by NRC in 2009; Obama administration withdrew funding 2010; politically blocked by Nevada opposition; ~80,000 tonnes of spent fuel continues accumulating at reactor sites. | Waste | Very High |
| F030 | Nuclear decommissioning: ~200 reactors under decommissioning globally; cost per reactor: $200M–$2 billion; time: 15–60 years (SAFSTOR — safe storage 40+ years before dismantlement, vs. DECON — immediate dismantlement); US decommissioning trust fund requirements (10 CFR 50.75). | Economics | Very High |

*Cross-references: Physics pack (quantum mechanics, particle physics), Chemistry pack (radiochemistry, heavy element chemistry), Medicine pack (radiation oncology, medical imaging), Military Science pack (nuclear deterrence theory), Energy pack (nuclear power system design).*

*Pack integrity: 25 core concepts, 7 patterns, 7 anti-patterns, 30 facts. All 10 invariants satisfied.*
*Version 1.0 — DarkWave Studios LLC — AXIOM Engine*
