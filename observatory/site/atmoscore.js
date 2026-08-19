/**
 * ═══════════════════════════════════════════════════════════════
 *  AtmosCore — 4/42 Deterministic Atmospheric Flow Organism
 *  DarkWave Studios LLC — Copyright 2026
 *
 *  Four Primitives:
 *    TH (Thermodynamic Flow)    — TH1..TH10
 *    OP (Optical Propagation)   — OP1..OP10
 *    DY (Dynamic Flow)          — DY1..DY12
 *    TS (Temporal Stability)    — TS1..TS10
 *
 *  Hard Constraints:
 *    HC1 — Observer Safety
 *    HC2 — Optical Propagation Validity
 *    HC3 — Data Provenance
 * ═══════════════════════════════════════════════════════════════
 */

const AtmosCore = {

  // ── Organism Identity ─────────────────────────────────────────
  version: '1.0.0',
  organism_id: 'atmoscore',

  // ── Color Palette (from spec) ─────────────────────────────────
  colors: {
    thermodynamic: '#1E6FA8',  // Deep cerulean
    optical:       '#D4A017',  // Amber-gold
    dynamic:       '#5A7A8A',  // Slate
    temporal:      '#4A3060',  // Deep violet
    optimal:       '#87CEEB',  // Clear sky blue
    advisory:      '#D4A017',  // Haze amber
    caution:       '#D4601A',  // Storm orange
    critical:      '#8B1A1A',  // Deep crimson
  },

  // ── Node Definitions ──────────────────────────────────────────
  // Each node: { id, name, primitive, weight, source, value, confidence }
  nodes: [],

  // ── Primitive State Vector P ──────────────────────────────────
  primitives: {
    TH: { value: 0, label: 'Thermodynamic Flow', color: '#1E6FA8', nodes: [] },
    OP: { value: 0, label: 'Optical Propagation', color: '#D4A017', nodes: [] },
    DY: { value: 0, label: 'Dynamic Flow', color: '#5A7A8A', nodes: [] },
    TS: { value: 0, label: 'Temporal Stability', color: '#4A3060', nodes: [] },
  },

  // ── Hard Constraint State ─────────────────────────────────────
  hardConstraints: {
    HC1: { active: false, label: 'Observer Safety', reason: '' },
    HC2: { active: false, label: 'Optical Propagation Validity', reason: '' },
    HC3: { active: false, label: 'Data Provenance', reason: '' },
  },

  // ── Observation Suitability ───────────────────────────────────
  suitability: {
    overall: 0,       // -1.0 to +1.0
    status: 'unknown', // suitable | qualified | unsuitable | unknown
    trend: 'stable',   // improving | stable | degrading
    bindingConstraint: null,
  },

  // ── Previous state for trend detection ────────────────────────
  _prevP: null,
  _history: [],

  // ═══════════════════════════════════════════════════════════════
  // Initialize the 42-node ring
  // ═══════════════════════════════════════════════════════════════
  init() {
    this.nodes = [
      // ── Thermodynamic Flow (TH1–TH10) ─────────────────────────
      { id: 'TH1',  name: 'Surface Temperature',        primitive: 'TH', weight: 1, value: 0, confidence: 'unavailable', source: null },
      { id: 'TH2',  name: 'Surface Pressure',           primitive: 'TH', weight: 1, value: 0, confidence: 'unavailable', source: null },
      { id: 'TH3',  name: 'Temperature Gradient',       primitive: 'TH', weight: 3, value: 0, confidence: 'unavailable', source: null },
      { id: 'TH4',  name: 'Relative Humidity',          primitive: 'TH', weight: 1, value: 0, confidence: 'unavailable', source: null },
      { id: 'TH5',  name: 'Dew Point Margin',           primitive: 'TH', weight: 1, value: 0, confidence: 'unavailable', source: null },
      { id: 'TH6',  name: 'Atmospheric Lapse Rate',     primitive: 'TH', weight: 3, value: 0, confidence: 'unavailable', source: null },
      { id: 'TH7',  name: 'Water Vapor Pressure',       primitive: 'TH', weight: 1, value: 0, confidence: 'unavailable', source: null },
      { id: 'TH8',  name: 'Atmospheric Density',        primitive: 'TH', weight: 1, value: 0, confidence: 'unavailable', source: null },
      { id: 'TH9',  name: 'Thermal Plume Activity',     primitive: 'TH', weight: 1, value: 0, confidence: 'unavailable', source: null },
      { id: 'TH10', name: 'Atmospheric Stability Index', primitive: 'TH', weight: 3, value: 0, confidence: 'unavailable', source: null },

      // ── Optical Propagation Flow (OP1–OP10) ───────────────────
      { id: 'OP1',  name: 'Visibility Distance',        primitive: 'OP', weight: 1, value: 0, confidence: 'unavailable', source: null },
      { id: 'OP2',  name: 'Aerosol / Particulate Load',  primitive: 'OP', weight: 1, value: 0, confidence: 'unavailable', source: null },
      { id: 'OP3',  name: 'Atmospheric Scattering',     primitive: 'OP', weight: 1, value: 0, confidence: 'unavailable', source: null },
      { id: 'OP4',  name: 'Refractive Index Estimate',  primitive: 'OP', weight: 1, value: 0, confidence: 'unavailable', source: null },
      { id: 'OP5',  name: 'Refraction Coefficient',     primitive: 'OP', weight: 3, value: 0, confidence: 'unavailable', source: null },
      { id: 'OP6',  name: 'Thermal Shimmer Index',      primitive: 'OP', weight: 1, value: 0, confidence: 'unavailable', source: null },
      { id: 'OP7',  name: 'Atmospheric Ducting State',   primitive: 'OP', weight: 3, value: 0, confidence: 'unavailable', source: null },
      { id: 'OP8',  name: 'Sub-Refraction Risk',        primitive: 'OP', weight: 1, value: 0, confidence: 'unavailable', source: null },
      { id: 'OP9',  name: 'Geometry Compatibility',     primitive: 'OP', weight: 1, value: 0, confidence: 'unavailable', source: null },
      { id: 'OP10', name: 'Long-Baseline Propagation',  primitive: 'OP', weight: 3, value: 0, confidence: 'unavailable', source: null },

      // ── Dynamic Flow (DY1–DY12) ───────────────────────────────
      { id: 'DY1',  name: 'Wind Speed',                 primitive: 'DY', weight: 1, value: 0, confidence: 'unavailable', source: null },
      { id: 'DY2',  name: 'Wind Direction Coherence',   primitive: 'DY', weight: 1, value: 0, confidence: 'unavailable', source: null },
      { id: 'DY3',  name: 'Wind Shear',                 primitive: 'DY', weight: 1, value: 0, confidence: 'unavailable', source: null },
      { id: 'DY4',  name: 'Boundary Layer Height',      primitive: 'DY', weight: 1, value: 0, confidence: 'unavailable', source: null },
      { id: 'DY5',  name: 'Surface Turbulence',         primitive: 'DY', weight: 1, value: 0, confidence: 'unavailable', source: null },
      { id: 'DY6',  name: 'CAPE',                       primitive: 'DY', weight: 1, value: 0, confidence: 'unavailable', source: null },
      { id: 'DY7',  name: 'Frontal Proximity',          primitive: 'DY', weight: 1, value: 0, confidence: 'unavailable', source: null },
      { id: 'DY8',  name: 'Precipitation State',        primitive: 'DY', weight: 1, value: 0, confidence: 'unavailable', source: null },
      { id: 'DY9',  name: 'Squall / Gust Probability',   primitive: 'DY', weight: 1, value: 0, confidence: 'unavailable', source: null },
      { id: 'DY10', name: 'Jet Stream Influence',       primitive: 'DY', weight: 1, value: 0, confidence: 'unavailable', source: null },
      { id: 'DY11', name: 'Sea/Land Breeze State',      primitive: 'DY', weight: 1, value: 0, confidence: 'unavailable', source: null },
      { id: 'DY12', name: 'Dynamic Flow Coherence',     primitive: 'DY', weight: 3, value: 0, confidence: 'unavailable', source: null },

      // ── Temporal Stability Flow (TS1–TS10) ────────────────────
      { id: 'TS1',  name: 'Pressure Trend',             primitive: 'TS', weight: 1, value: 0, confidence: 'unavailable', source: null },
      { id: 'TS2',  name: 'Pressure System Stage',      primitive: 'TS', weight: 1, value: 0, confidence: 'unavailable', source: null },
      { id: 'TS3',  name: 'Inversion Persistence',      primitive: 'TS', weight: 3, value: 0, confidence: 'unavailable', source: null },
      { id: 'TS4',  name: 'Session Observation Quality', primitive: 'TS', weight: 1, value: 0, confidence: 'unavailable', source: null },
      { id: 'TS5',  name: 'Seasonal Suitability',       primitive: 'TS', weight: 1, value: 0, confidence: 'unavailable', source: null },
      { id: 'TS6',  name: 'Diurnal Phase',              primitive: 'TS', weight: 1, value: 0, confidence: 'unavailable', source: null },
      { id: 'TS7',  name: 'Solar Heating Accumulation',  primitive: 'TS', weight: 1, value: 0, confidence: 'unavailable', source: null },
      { id: 'TS8',  name: 'Anomaly Index',              primitive: 'TS', weight: 1, value: 0, confidence: 'unavailable', source: null },
      { id: 'TS9',  name: 'Trend Coherence',            primitive: 'TS', weight: 3, value: 0, confidence: 'unavailable', source: null },
      { id: 'TS10', name: 'Stability Lifecycle Score',   primitive: 'TS', weight: 3, value: 0, confidence: 'unavailable', source: null },
    ];

    // Index nodes by primitive
    for (const p of Object.keys(this.primitives)) {
      this.primitives[p].nodes = this.nodes.filter(n => n.primitive === p);
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // Normalized State Mapping — raw feed data → node values [-1, +1]
  // ═══════════════════════════════════════════════════════════════

  /** Clamp to [-1, +1] */
  clamp(v) { return Math.max(-1, Math.min(1, v)); },

  /** Map surface temperature (°C) to TH1 */
  mapTH1(tempC) {
    if (tempC === null || tempC === undefined) return { value: 0, confidence: 'unavailable' };
    let v;
    if (tempC < -10 || tempC > 40) v = -0.9;
    else if (tempC < 0 || tempC > 35) v = -0.5;
    else if (tempC < 5 || tempC > 25) v = -0.1;
    else v = 0.3 + (1 - Math.abs(tempC - 15) / 10) * 0.7;
    return { value: this.clamp(v), confidence: 'estimated' };
  },

  /** Map pressure (hPa) to TH2 */
  mapTH2(pressHpa) {
    if (!pressHpa) return { value: 0, confidence: 'unavailable' };
    // Standard sea-level ~1013.25. Deviation from normal indicates weather systems.
    const dev = Math.abs(pressHpa - 1013.25);
    let v;
    if (dev < 5) v = 0.8;
    else if (dev < 10) v = 0.4;
    else if (dev < 20) v = -0.2;
    else v = -0.7;
    return { value: this.clamp(v), confidence: 'estimated' };
  },

  /** Map humidity (%) to TH4 */
  mapTH4(humPct) {
    if (humPct === null || humPct === undefined) return { value: 0, confidence: 'unavailable' };
    // Optimal 30-60%, marginal outside, critical at extremes
    if (humPct >= 30 && humPct <= 60) return { value: 0.7, confidence: 'estimated' };
    if (humPct >= 20 && humPct <= 75) return { value: 0.2, confidence: 'estimated' };
    if (humPct >= 10 && humPct <= 90) return { value: -0.3, confidence: 'estimated' };
    return { value: -0.8, confidence: 'estimated' };
  },

  /** Map wind speed (m/s) to DY1 */
  mapDY1(windMs) {
    if (windMs === null || windMs === undefined) return { value: 0, confidence: 'unavailable' };
    if (windMs < 3) return { value: 0.9, confidence: 'estimated' };
    if (windMs < 8) return { value: 0.4, confidence: 'estimated' };
    if (windMs < 15) return { value: -0.2, confidence: 'estimated' };
    if (windMs < 25) return { value: -0.6, confidence: 'estimated' };
    return { value: -0.9, confidence: 'estimated' };
  },

  /** Map precipitation state from NEXRAD to DY8 */
  mapDY8(radarActive) {
    if (radarActive === null) return { value: 0, confidence: 'unavailable' };
    return { value: radarActive ? -0.6 : 0.8, confidence: 'estimated' };
  },

  /** Map lightning density to DY6 (CAPE proxy) and DY9 (squall probability) */
  mapLightning(lightningEntries) {
    if (!lightningEntries) return { DY6: { value: 0, confidence: 'unavailable' }, DY9: { value: 0, confidence: 'unavailable' } };
    const rate = lightningEntries;
    let dy6, dy9;
    if (rate > 50) { dy6 = -0.8; dy9 = -0.7; }
    else if (rate > 20) { dy6 = -0.4; dy9 = -0.3; }
    else if (rate > 5) { dy6 = -0.1; dy9 = 0.1; }
    else { dy6 = 0.6; dy9 = 0.7; }
    return {
      DY6: { value: this.clamp(dy6), confidence: 'estimated' },
      DY9: { value: this.clamp(dy9), confidence: 'estimated' },
    };
  },

  /** Map visibility (km) to OP1 */
  mapOP1(visKm) {
    if (!visKm) return { value: 0, confidence: 'unavailable' };
    if (visKm > 20) return { value: 0.9, confidence: 'estimated' };
    if (visKm > 10) return { value: 0.5, confidence: 'estimated' };
    if (visKm > 5) return { value: 0.1, confidence: 'estimated' };
    if (visKm > 1) return { value: -0.4, confidence: 'estimated' };
    return { value: -0.9, confidence: 'estimated' };
  },

  /** Map solar activity to TS8 anomaly index */
  mapSolar(solarEntries, sparkline) {
    if (!sparkline || !sparkline.length) return { value: 0, confidence: 'unavailable' };
    const recent = sparkline[sparkline.length - 1] || 0;
    const avg = sparkline.reduce((a, b) => a + b, 0) / sparkline.length;
    if (avg === 0) return { value: 0.5, confidence: 'estimated' };
    const ratio = recent / avg;
    if (ratio > 3) return { value: -0.8, confidence: 'estimated' };
    if (ratio > 2) return { value: -0.4, confidence: 'estimated' };
    if (ratio > 1.5) return { value: -0.1, confidence: 'estimated' };
    return { value: 0.5, confidence: 'estimated' };
  },

  /** Map geomagnetic activity to TS8 */
  mapGeomag(entries, sparkline) {
    return this.mapSolar(entries, sparkline); // Same anomaly detection pattern
  },

  /** Map Schumann resonance to TS9 trend coherence */
  mapSchumann(sparkline) {
    if (!sparkline || !sparkline.length) return { value: 0, confidence: 'unavailable' };
    // Stable Schumann = coherent atmosphere
    const variance = this._variance(sparkline);
    if (variance < 0.5) return { value: 0.8, confidence: 'estimated' };
    if (variance < 2) return { value: 0.3, confidence: 'estimated' };
    return { value: -0.3, confidence: 'estimated' };
  },

  /** Map diurnal phase to TS6 */
  mapTS6() {
    const hour = new Date().getUTCHours();
    // Pre-dawn (3-6 UTC) most stable, midday (14-18 UTC) least stable
    if (hour >= 3 && hour <= 6) return { value: 0.9, confidence: 'measured' };
    if (hour >= 6 && hour <= 10) return { value: 0.5, confidence: 'measured' };
    if (hour >= 10 && hour <= 14) return { value: -0.1, confidence: 'measured' };
    if (hour >= 14 && hour <= 18) return { value: -0.5, confidence: 'measured' };
    if (hour >= 18 && hour <= 22) return { value: 0.2, confidence: 'measured' };
    return { value: 0.7, confidence: 'measured' }; // nighttime
  },

  _variance(arr) {
    if (!arr.length) return 0;
    const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
    return arr.reduce((s, v) => s + (v - mean) ** 2, 0) / arr.length;
  },

  // ═══════════════════════════════════════════════════════════════
  // Core Compute — ingest feeds, compute state ring + primitives
  // ═══════════════════════════════════════════════════════════════
  compute(feeds) {
    if (!feeds || !feeds.length) return;
    if (!this.nodes.length) this.init();

    // Save previous state for trend detection
    this._prevP = {
      TH: this.primitives.TH.value,
      OP: this.primitives.OP.value,
      DY: this.primitives.DY.value,
      TS: this.primitives.TS.value,
    };

    // Build feed lookup
    const feedMap = {};
    for (const f of feeds) feedMap[f.id] = f;

    // ── Map feeds to nodes ────────────────────────────────────
    const surface = feedMap.surface;
    const surfaceData = surface?.latestEntry || {};

    // TH nodes from Surface Stations
    if (surface && surface.status !== 'offline') {
      this._setNode('TH1', this.mapTH1(surfaceData.tmpf != null ? (surfaceData.tmpf - 32) * 5/9 : null));
      this._setNode('TH2', this.mapTH2(surfaceData.mslp || surfaceData.alti ? (surfaceData.alti || 0) * 33.8639 : null));
      this._setNode('TH4', this.mapTH4(surfaceData.relh));
      this._setNode('DY1', this.mapDY1(surfaceData.sknt ? surfaceData.sknt * 0.5144 : null));

      // Dew point margin TH5
      if (surfaceData.tmpf != null && surfaceData.dwpf != null) {
        const margin = (surfaceData.tmpf - surfaceData.dwpf) * 5/9;
        const v = margin > 10 ? 0.9 : margin > 5 ? 0.4 : margin > 2 ? -0.2 : -0.8;
        this._setNode('TH5', { value: this.clamp(v), confidence: 'estimated' });
      }
    }

    // OP nodes from NEXRAD radar
    const nexrad = feedMap.nexrad;
    if (nexrad && nexrad.status !== 'offline') {
      const hasActivity = nexrad.sparkline && nexrad.sparkline.some(v => v > 0);
      this._setNode('DY8', this.mapDY8(hasActivity));
      this._setNode('OP1', this.mapOP1(hasActivity ? 8 : 25));
      this._setNode('OP3', { value: hasActivity ? -0.3 : 0.6, confidence: 'estimated' });
    }

    // GOES satellite — aerosol/cloud proxy
    const goes = feedMap.goes;
    if (goes && goes.status !== 'offline') {
      const goesRate = goes.sparkline ? goes.sparkline[goes.sparkline.length - 1] || 0 : 0;
      this._setNode('OP2', { value: this.clamp(0.5 - goesRate * 0.1), confidence: 'estimated' });
      this._setNode('TH9', { value: this.clamp(0.3 - goesRate * 0.05), confidence: 'estimated' });
    }

    // Lightning (GLM + Blitzortung) → DY6, DY9
    const lightning = feedMap.lightning;
    const blitz = feedMap.blitzortung;
    const lightningTotal = (lightning?.entries || 0) + (blitz?.entries || 0);
    if (lightningTotal > 0) {
      const lm = this.mapLightning(lightningTotal);
      this._setNode('DY6', lm.DY6);
      this._setNode('DY9', lm.DY9);
    }

    // Solar/SWPC → TS8
    const solar = feedMap.solar;
    if (solar && solar.status !== 'offline') {
      this._setNode('TS8', this.mapSolar(solar.entries, solar.sparkline));
    }

    // Geomagnetic → TS8 (combines with solar)
    const geomag = feedMap.geomag;
    if (geomag && geomag.status !== 'offline') {
      const gm = this.mapGeomag(geomag.entries, geomag.sparkline);
      const existing = this._getNode('TS8');
      if (existing.confidence !== 'unavailable') {
        // Average with solar contribution
        this._setNode('TS8', { value: this.clamp((existing.value + gm.value) / 2), confidence: 'estimated' });
      } else {
        this._setNode('TS8', gm);
      }
    }

    // Schumann → TS9
    const schumann = feedMap.schumann;
    if (schumann && schumann.status !== 'offline') {
      this._setNode('TS9', this.mapSchumann(schumann.sparkline));
    }

    // Ionosonde → OP4 (refractive index proxy)
    const iono = feedMap.ionosonde;
    if (iono && iono.status !== 'offline') {
      const ionoRate = iono.sparkline ? iono.sparkline[iono.sparkline.length - 1] || 0 : 0;
      this._setNode('OP4', { value: this.clamp(0.4 - ionoRate * 0.05), confidence: 'estimated' });
    }

    // Heaters → OP4 perturbation, TS8
    const heater = feedMap.heater;
    if (heater && heater.status !== 'offline' && heater.entries > 0) {
      this._setNode('TS8', { value: this.clamp(this._getNode('TS8').value - 0.1), confidence: 'estimated' });
    }

    // Trace metals → OP2 (aerosol contribution)
    const metals = feedMap.metals;
    if (metals && metals.status !== 'offline' && metals.entries > 0) {
      const op2 = this._getNode('OP2');
      this._setNode('OP2', { value: this.clamp(op2.value - 0.1), confidence: 'estimated' });
    }

    // Deposition → OP2, TH7
    const deposition = feedMap.deposition;
    if (deposition && deposition.status !== 'offline') {
      this._setNode('TH7', { value: this.clamp(0.3), confidence: 'estimated' });
    }

    // Ecology → TS5 seasonal proxy
    const ecology = feedMap.ecology;
    if (ecology && ecology.status !== 'offline') {
      this._setNode('TS5', { value: 0.4, confidence: 'estimated' });
    }

    // NOTAMs → DY7 (frontal proximity if cloud seeding active)
    const notam = feedMap.notam;
    if (notam && notam.status !== 'offline' && notam.entries > 5) {
      this._setNode('DY7', { value: -0.3, confidence: 'estimated' });
      this._setNode('OP2', { value: this.clamp(this._getNode('OP2').value - 0.15), confidence: 'estimated' });
    }

    // ADS-B → DY3 (wind shear proxy), DY4 (boundary layer)
    const aircraft = feedMap.aircraft;
    if (aircraft && aircraft.status !== 'offline') {
      this._setNode('DY3', { value: 0.3, confidence: 'estimated' });
      this._setNode('DY4', { value: 0.2, confidence: 'estimated' });
    }

    // Diurnal phase (always available)
    this._setNode('TS6', this.mapTS6());

    // ── Derive composite nodes ────────────────────────────────
    this._deriveComposites();

    // ── Compute primitive aggregates ──────────────────────────
    this._computePrimitives();

    // ── Enforce hard constraints ─────────────────────────────
    this._enforceHardConstraints();

    // ── Compute observation suitability ──────────────────────
    this._computeSuitability();

    // ── Compute trend ────────────────────────────────────────
    this._computeTrend();

    // ── Store history ────────────────────────────────────────
    this._history.push({
      timestamp: Date.now(),
      P: { ...this._prevP },
      suitability: this.suitability.overall,
    });
    if (this._history.length > 60) this._history.shift();
  },

  // ── Node accessors ──────────────────────────────────────────
  _setNode(id, { value, confidence }) {
    const node = this.nodes.find(n => n.id === id);
    if (node) {
      node.value = value;
      node.confidence = confidence;
      node.source = 'observatory-feed';
    }
  },

  _getNode(id) {
    const node = this.nodes.find(n => n.id === id);
    return node || { value: 0, confidence: 'unavailable' };
  },

  // ── Derive composite nodes from other nodes ─────────────────
  _deriveComposites() {
    // TH10 = f(TH3, TH6, TH9)
    const th3 = this._getNode('TH3').value;
    const th6 = this._getNode('TH6').value;
    const th9 = this._getNode('TH9').value;
    const th10val = (th3 * 3 + th6 * 3 + th9) / 7;
    this._setNode('TH10', { value: this.clamp(th10val), confidence: 'derived' });

    // TH3 and TH6 — estimate from available surface data
    const th1 = this._getNode('TH1');
    if (th1.confidence !== 'unavailable') {
      // Estimate gradient from temperature and time of day
      const ts6 = this._getNode('TS6').value;
      const gradientEstimate = ts6 > 0 ? 0.3 : -0.2; // simplified: stable at night, less stable midday
      this._setNode('TH3', { value: this.clamp(gradientEstimate), confidence: 'estimated' });
      this._setNode('TH6', { value: this.clamp(gradientEstimate * 0.8), confidence: 'estimated' });
    }

    // TH8 — atmospheric density from temp and pressure
    const th2 = this._getNode('TH2');
    if (th1.confidence !== 'unavailable' && th2.confidence !== 'unavailable') {
      this._setNode('TH8', { value: this.clamp((th1.value + th2.value) / 2), confidence: 'derived' });
    }

    // OP5 — refraction coefficient (from gradient + density)
    const th3v = this._getNode('TH3').value;
    const op5val = th3v > 0 ? 0.5 - th3v * 0.5 : -0.3 - Math.abs(th3v) * 0.5;
    this._setNode('OP5', { value: this.clamp(op5val), confidence: 'derived' });

    // OP6 — shimmer from thermal plume and wind
    const dy1 = this._getNode('DY1').value;
    this._setNode('OP6', { value: this.clamp((th9 + dy1) / 2), confidence: 'derived' });

    // OP7 — ducting from gradient inversion
    const duckVal = th3v < -0.5 ? th3v : 0.5;
    this._setNode('OP7', { value: this.clamp(duckVal), confidence: 'derived' });

    // OP8 — sub-refraction risk (opposite of ducting)
    this._setNode('OP8', { value: this.clamp(-duckVal * 0.5), confidence: 'derived' });

    // OP9 — geometry compatibility (default moderate)
    this._setNode('OP9', { value: 0.3, confidence: 'estimated' });

    // OP10 — composite of OP1-OP9
    const opNodes = this.nodes.filter(n => n.primitive === 'OP' && n.id !== 'OP10');
    const opAvg = opNodes.reduce((s, n) => s + n.value * n.weight, 0) / opNodes.reduce((s, n) => s + n.weight, 0);
    this._setNode('OP10', { value: this.clamp(opAvg), confidence: 'derived' });

    // DY2 — wind coherence (estimated from wind speed stability)
    this._setNode('DY2', { value: this.clamp(dy1 * 0.8), confidence: 'estimated' });

    // DY5 — surface turbulence
    this._setNode('DY5', { value: this.clamp(dy1 * 0.7), confidence: 'estimated' });

    // DY10-11 — default moderate
    this._setNode('DY10', { value: 0.2, confidence: 'estimated' });
    this._setNode('DY11', { value: 0.3, confidence: 'estimated' });

    // DY12 — composite
    const dyNodes = this.nodes.filter(n => n.primitive === 'DY' && n.id !== 'DY12');
    const dyAvg = dyNodes.reduce((s, n) => s + n.value * n.weight, 0) / dyNodes.reduce((s, n) => s + n.weight, 0);
    this._setNode('DY12', { value: this.clamp(dyAvg), confidence: 'derived' });

    // TS1 — pressure trend (from sparkline if available)
    this._setNode('TS1', { value: 0.3, confidence: 'estimated' });
    this._setNode('TS2', { value: 0.2, confidence: 'estimated' });
    this._setNode('TS3', { value: 0.5, confidence: 'estimated' }); // no inversion by default
    this._setNode('TS4', { value: 0.3, confidence: 'estimated' });
    this._setNode('TS7', { value: this._getNode('TS6').value > 0 ? 0.3 : -0.2, confidence: 'derived' });

    // TS10 — composite
    const tsNodes = this.nodes.filter(n => n.primitive === 'TS' && n.id !== 'TS10');
    const tsAvg = tsNodes.reduce((s, n) => s + n.value * n.weight, 0) / tsNodes.reduce((s, n) => s + n.weight, 0);
    this._setNode('TS10', { value: this.clamp(tsAvg), confidence: 'derived' });
  },

  // ── Compute primitive aggregates (weighted mean) ────────────
  _computePrimitives() {
    for (const key of Object.keys(this.primitives)) {
      const prim = this.primitives[key];
      const nodes = prim.nodes;
      let wSum = 0, wTotal = 0;
      for (const n of nodes) {
        wSum += n.value * n.weight;
        wTotal += n.weight;
      }
      prim.value = wTotal > 0 ? this.clamp(wSum / wTotal) : 0;
    }
  },

  // ── Hard Constraint Enforcement ─────────────────────────────
  _enforceHardConstraints() {
    // HC1: Observer Safety — wind, lightning, temperature extremes
    const dy1 = this._getNode('DY1').value;
    const th1 = this._getNode('TH1').value;
    const dy9 = this._getNode('DY9').value;
    if (dy1 < -0.7 || th1 < -0.8 || dy9 < -0.6) {
      this.hardConstraints.HC1.active = true;
      this.hardConstraints.HC1.reason =
        dy1 < -0.7 ? 'Extreme wind conditions' :
        th1 < -0.8 ? 'Temperature extremes' : 'High squall/gust probability';
    } else {
      this.hardConstraints.HC1.active = false;
      this.hardConstraints.HC1.reason = '';
    }

    // HC2: Optical Propagation Validity
    const op5 = this._getNode('OP5').value;
    const op7 = this._getNode('OP7').value;
    if (op5 < -0.5 || op7 < -0.5) {
      this.hardConstraints.HC2.active = true;
      this.hardConstraints.HC2.reason =
        op7 < -0.5 ? 'Active atmospheric ducting detected' :
        'Refraction coefficient outside reliable range';
    } else {
      this.hardConstraints.HC2.active = false;
      this.hardConstraints.HC2.reason = '';
    }

    // HC3: Data Provenance — count unavailable nodes
    const unavailCount = this.nodes.filter(n => n.confidence === 'unavailable').length;
    const totalNodes = this.nodes.length;
    if (unavailCount > totalNodes * 0.5) {
      this.hardConstraints.HC3.active = true;
      this.hardConstraints.HC3.reason = `${unavailCount}/${totalNodes} nodes have no data source`;
    } else {
      this.hardConstraints.HC3.active = false;
      this.hardConstraints.HC3.reason = '';
    }
  },

  // ── Observation Suitability ─────────────────────────────────
  _computeSuitability() {
    const P = this.primitives;
    // Weighted aggregate: TH and OP weighted higher for observation
    const overall = (P.TH.value * 0.3 + P.OP.value * 0.35 + P.DY.value * 0.2 + P.TS.value * 0.15);
    this.suitability.overall = this.clamp(overall);

    // Status classification
    if (this.hardConstraints.HC1.active || this.hardConstraints.HC2.active) {
      this.suitability.status = 'unsuitable';
    } else if (overall > 0.2) {
      this.suitability.status = 'suitable';
    } else if (overall > -0.3) {
      this.suitability.status = 'qualified';
    } else {
      this.suitability.status = 'unsuitable';
    }

    // Find binding constraint
    const primEntries = Object.entries(P);
    primEntries.sort((a, b) => a[1].value - b[1].value);
    this.suitability.bindingConstraint = primEntries[0][0];
  },

  // ── Trend Detection ─────────────────────────────────────────
  _computeTrend() {
    if (!this._prevP) { this.suitability.trend = 'stable'; return; }
    const curr = this.suitability.overall;
    const prev = (this._prevP.TH * 0.3 + this._prevP.OP * 0.35 + this._prevP.DY * 0.2 + this._prevP.TS * 0.15);
    const delta = curr - prev;
    if (delta > 0.05) this.suitability.trend = 'improving';
    else if (delta < -0.05) this.suitability.trend = 'degrading';
    else this.suitability.trend = 'stable';
  },

  // ═══════════════════════════════════════════════════════════════
  // Status band for a value
  // ═══════════════════════════════════════════════════════════════
  getBand(value) {
    if (value >= 0) return 'optimal';
    if (value >= -0.3) return 'advisory';
    if (value >= -0.7) return 'caution';
    return 'critical';
  },

  getBandColor(value) {
    const band = this.getBand(value);
    return this.colors[band];
  },

  // ═══════════════════════════════════════════════════════════════
  // Data provenance summary
  // ═══════════════════════════════════════════════════════════════
  getProvenanceSummary() {
    const measured = this.nodes.filter(n => n.confidence === 'measured').length;
    const estimated = this.nodes.filter(n => n.confidence === 'estimated').length;
    const derived = this.nodes.filter(n => n.confidence === 'derived').length;
    const unavailable = this.nodes.filter(n => n.confidence === 'unavailable').length;
    return { measured, estimated, derived, unavailable, total: this.nodes.length };
  },

  // ═══════════════════════════════════════════════════════════════
  // Export as structured state snapshot
  // ═══════════════════════════════════════════════════════════════
  getStateSnapshot() {
    return {
      organism_id: this.organism_id,
      version: this.version,
      timestamp: new Date().toISOString(),
      primitives: {
        TH: this.primitives.TH.value,
        OP: this.primitives.OP.value,
        DY: this.primitives.DY.value,
        TS: this.primitives.TS.value,
      },
      nodes: this.nodes.map(n => ({
        id: n.id, value: n.value, confidence: n.confidence,
      })),
      suitability: { ...this.suitability },
      hardConstraints: { ...this.hardConstraints },
      provenance: this.getProvenanceSummary(),
    };
  },
};
