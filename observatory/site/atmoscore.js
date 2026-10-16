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
    optical:       '#b8b8b8',  // Light grey
    dynamic:       '#5A7A8A',  // Slate
    temporal:      '#4A3060',  // Deep violet
    optimal:       '#87CEEB',  // Clear sky blue
    advisory:      '#b8b8b8',  // Light grey
    caution:       '#b5524c',  // Muted red
    critical:      '#8B1A1A',  // Deep crimson
  },

  // ── Node Definitions ──────────────────────────────────────────
  // Each node: { id, name, primitive, weight, source, value, confidence }
  nodes: [],

  // ── Primitive State Vector P ──────────────────────────────────
  primitives: {
    TH: { value: 0, label: 'Thermodynamic Flow', color: '#1E6FA8', nodes: [] },
    OP: { value: 0, label: 'Optical Propagation', color: '#b8b8b8', nodes: [] },
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
    overall: 0,       // -1.0 to +1.0 (meaningful only when scored)
    scored: false,    // true once a fresh local observation exists
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
  // Normalized State Mapping — real observations → node values [-1, +1]
  // Positive = good for observing the sky and being outside. Negative = poor.
  // Only nodes with a real input are scored. Everything else stays
  // 'unavailable' and is left OUT of every average (never filled with a guess).
  // ═══════════════════════════════════════════════════════════════

  /** Clamp to [-1, +1] */
  clamp(v) { return Math.max(-1, Math.min(1, v)); },

  _num(v) { const n = Number(v); return (v === null || v === undefined || v === '' || !Number.isFinite(n)) ? null : n; },

  /** Surface temperature (°C) → TH1 */
  mapTH1(tempC) {
    if (tempC === null) return { value: 0, confidence: 'unavailable' };
    let v;
    if (tempC < -10 || tempC > 40) v = -0.9;
    else if (tempC < 0 || tempC > 35) v = -0.5;
    else if (tempC < 5 || tempC > 25) v = -0.1;
    else v = 0.3 + (1 - Math.abs(tempC - 15) / 10) * 0.7;
    return { value: this.clamp(v), confidence: 'measured' };
  },

  /** Pressure (hPa) → TH2. Far from normal usually means an active weather system. */
  mapTH2(pressHpa) {
    if (!pressHpa) return { value: 0, confidence: 'unavailable' };
    const dev = Math.abs(pressHpa - 1013.25);
    const v = dev < 5 ? 0.8 : dev < 10 ? 0.4 : dev < 20 ? -0.2 : -0.7;
    return { value: v, confidence: 'measured' };
  },

  /** Relative humidity (%) → TH4 */
  mapTH4(humPct) {
    if (humPct === null) return { value: 0, confidence: 'unavailable' };
    if (humPct >= 30 && humPct <= 60) return { value: 0.7, confidence: 'measured' };
    if (humPct >= 20 && humPct <= 75) return { value: 0.2, confidence: 'measured' };
    if (humPct >= 10 && humPct <= 90) return { value: -0.3, confidence: 'measured' };
    return { value: -0.8, confidence: 'measured' };
  },

  /** Temperature minus dew point (°C): small gap means fog, haze or cloud is near. */
  mapTH5(marginC) {
    if (marginC === null) return { value: 0, confidence: 'unavailable' };
    const v = marginC > 10 ? 0.9 : marginC > 5 ? 0.4 : marginC > 2 ? -0.2 : -0.8;
    return { value: v, confidence: 'derived' };
  },

  /** Sustained wind (m/s) → DY1 */
  mapDY1(windMs) {
    if (windMs === null) return { value: 0, confidence: 'unavailable' };
    const v = windMs < 3 ? 0.9 : windMs < 8 ? 0.4 : windMs < 15 ? -0.2 : windMs < 25 ? -0.6 : -0.9;
    return { value: v, confidence: 'measured' };
  },

  /** Gust speed (m/s) → DY9. A station that reports no gust is reporting steady wind. */
  mapDY9(gustMs, hasWind) {
    if (gustMs === null) return hasWind ? { value: 0.7, confidence: 'measured' } : { value: 0, confidence: 'unavailable' };
    const v = gustMs < 8 ? 0.5 : gustMs < 13 ? -0.2 : gustMs < 20 ? -0.6 : -0.9;
    return { value: v, confidence: 'measured' };
  },

  /** Gust spread (knots above steady wind) → DY5 turbulence */
  mapDY5(spreadKt, hasWind) {
    if (spreadKt === null) return hasWind ? { value: 0.6, confidence: 'derived' } : { value: 0, confidence: 'unavailable' };
    const v = spreadKt < 5 ? 0.5 : spreadKt < 10 ? 0 : spreadKt < 15 ? -0.4 : -0.8;
    return { value: v, confidence: 'derived' };
  },

  /** Present-weather codes / hourly precipitation → DY8 */
  mapDY8(codes, phour) {
    const wet = /\b(-|\+)?(RA|SN|DZ|TS|GR|GS|SG|PL|IC|SH|FZRA)/.test(codes) || (phour !== null && phour > 0);
    return { value: wet ? -0.6 : 0.8, confidence: 'measured' };
  },

  /** Visibility (statute miles) → OP1 */
  mapOP1(visMiles) {
    if (visMiles === null) return { value: 0, confidence: 'unavailable' };
    const km = visMiles * 1.609;
    const v = km > 20 ? 0.9 : km > 10 ? 0.5 : km > 5 ? 0.1 : km > 1 ? -0.4 : -0.9;
    return { value: v, confidence: 'measured' };
  },

  /** Haze, fog, smoke, dust codes → OP3 scattering */
  mapOP3(codes) {
    const murky = /\b(FG|BR|HZ|FU|DU|SA|VA)\b/.test(codes);
    return { value: murky ? -0.6 : 0.5, confidence: 'measured' };
  },

  /** Planetary Kp (0-9) → TS8. Quiet geomagnetic field means a stable radio and GPS environment. */
  mapKp(kp) {
    if (kp === null) return { value: 0, confidence: 'unavailable' };
    const v = kp < 3 ? 0.7 : kp < 4 ? 0.2 : kp < 5 ? -0.2 : kp < 6 ? -0.5 : -0.8;
    return { value: v, confidence: 'measured' };
  },

  /** Time of day at the user's longitude (local solar time) → TS6 */
  mapTS6(lon) {
    const now = new Date();
    let h = now.getUTCHours() + now.getUTCMinutes() / 60 + (lon === null ? 0 : lon / 15);
    h = ((h % 24) + 24) % 24;
    let v;
    if (h >= 3 && h < 7) v = 0.9;          // pre-dawn: most stable air
    else if (h >= 7 && h < 10) v = 0.5;
    else if (h >= 10 && h < 14) v = -0.1;
    else if (h >= 14 && h < 18) v = -0.5;  // afternoon: most turbulent
    else if (h >= 18 && h < 22) v = 0.2;
    else v = 0.7;                           // night
    return { value: v, confidence: lon === null ? 'unavailable' : 'derived' };
  },

  // ═══════════════════════════════════════════════════════════════
  // Core Compute
  //   feeds = /api/feeds list (national collectors; only Kp is used here)
  //   local = /api/atmoscore/local for the user's saved location (or null)
  // ═══════════════════════════════════════════════════════════════
  compute(feeds, local) {
    if (!this.nodes.length) this.init();

    // Previous state for trend detection
    this._prevOverall = this.suitability.scored ? this.suitability.overall : null;

    // Reset every node before applying inputs
    for (const n of this.nodes) { n.value = 0; n.confidence = 'unavailable'; n.source = null; }

    const feedMap = {};
    for (const f of (feeds || [])) feedMap[f.id] = f;

    // ── Local station (nearest NOAA airport station to the user's location) ──
    const st = local && local.station ? local.station : null;
    const ageMin = st && st.observedAt ? (Date.now() - Date.parse(st.observedAt)) / 60000 : Infinity;
    const fresh = !!st && ageMin <= 180;
    const lon = local && local.location && Number.isFinite(local.location.lon) ? local.location.lon : null;
    this.basis = { located: !!(local && local.location), station: fresh ? st : null, stale: !!st && !fresh, noStation: !!local && !st };

    if (fresh) {
      const tmpf = this._num(st.tmpf), dwpf = this._num(st.dwpf), sknt = this._num(st.sknt), gust = this._num(st.gust);
      const alti = this._num(st.alti), mslp = this._num(st.mslp);
      const codes = Array.isArray(st.wxcodes) ? st.wxcodes.join(' ') : String(st.wxcodes || '');
      const hasWind = sknt !== null;

      this._setNode('TH1', this.mapTH1(tmpf !== null ? (tmpf - 32) * 5 / 9 : null));
      this._setNode('TH2', this.mapTH2(mslp !== null ? mslp : (alti !== null ? alti * 33.8639 : null)));
      this._setNode('TH4', this.mapTH4(this._num(st.relh)));
      this._setNode('TH5', this.mapTH5(tmpf !== null && dwpf !== null ? (tmpf - dwpf) * 5 / 9 : null));
      this._setNode('DY1', this.mapDY1(hasWind ? sknt * 0.5144 : null));
      this._setNode('DY9', this.mapDY9(gust !== null ? gust * 0.5144 : null, hasWind));
      this._setNode('DY5', this.mapDY5(gust !== null && hasWind ? gust - sknt : null, hasWind));
      this._setNode('DY8', this.mapDY8(codes, this._num(st.phour)));
      this._setNode('OP1', this.mapOP1(this._num(st.vsby)));
      this._setNode('OP3', this.mapOP3(codes));

      // TH8 air density: derived from the two measured nodes above
      const th1 = this._getNode('TH1'), th2 = this._getNode('TH2');
      if (th1.confidence !== 'unavailable' && th2.confidence !== 'unavailable') {
        this._setNode('TH8', { value: this.clamp((th1.value + th2.value) / 2), confidence: 'derived' });
      }
    }

    // ── National inputs ──
    const geomag = feedMap.geomag;
    if (geomag && geomag.status !== 'offline' && geomag.sparkline && geomag.sparkline.length) {
      this._setNode('TS8', this.mapKp(this._num(geomag.sparkline[geomag.sparkline.length - 1])));
    }
    this._setNode('TS6', this.mapTS6(lon));

    // ── Aggregate ──
    this._computePrimitives();
    this._enforceHardConstraints(local, fresh);
    this._computeSuitability(fresh);
    this._computeTrend();

    this._history.push({ timestamp: Date.now(), suitability: this.suitability.overall });
    if (this._history.length > 60) this._history.shift();
  },

  // ── Node accessors ──────────────────────────────────────────
  _setNode(id, { value, confidence }) {
    const node = this.nodes.find(n => n.id === id);
    if (node && confidence !== 'unavailable') {
      node.value = value;
      node.confidence = confidence;
      node.source = confidence === 'measured' ? 'station-observation' : 'derived';
    }
  },

  _getNode(id) {
    const node = this.nodes.find(n => n.id === id);
    return node || { value: 0, confidence: 'unavailable' };
  },

  // ── Primitive aggregates: weighted mean over nodes that have data ──
  _computePrimitives() {
    for (const key of Object.keys(this.primitives)) {
      const prim = this.primitives[key];
      let wSum = 0, wTotal = 0, count = 0;
      for (const n of prim.nodes) {
        if (n.confidence === 'unavailable') continue;
        wSum += n.value * n.weight;
        wTotal += n.weight;
        count++;
      }
      prim.available = wTotal > 0;
      prim.nodeCount = count;
      prim.value = wTotal > 0 ? this.clamp(wSum / wTotal) : 0;
    }
  },

  // ── Hard Constraints ────────────────────────────────────────
  _enforceHardConstraints(local, fresh) {
    const has = id => this._getNode(id).confidence !== 'unavailable';
    const dy1 = this._getNode('DY1').value;
    const th1 = this._getNode('TH1').value;
    const dy9 = this._getNode('DY9').value;

    // HC1 Observer Safety: official severe warning at the location, or measured extremes.
    const DANGER = /(Tornado|Severe Thunderstorm|Flash Flood|Hurricane|Tropical Storm|Blizzard|Ice Storm|Extreme Wind|Dust Storm|Excessive Heat|Extreme Cold|Wind Chill|Winter Storm)/i;
    const warning = ((local && local.alerts) || []).find(a => (a.severity === 'Severe' || a.severity === 'Extreme') && DANGER.test(a.event || ''));
    let hc1 = '';
    if (warning) hc1 = `${warning.event} in effect at your location`;
    else if (has('DY1') && dy1 < -0.7) hc1 = 'Extreme wind at the nearest station';
    else if (has('TH1') && th1 < -0.8) hc1 = 'Temperature extreme at the nearest station';
    else if (has('DY9') && dy9 < -0.6) hc1 = 'Strong gusts at the nearest station';
    this.hardConstraints.HC1.active = !!hc1;
    this.hardConstraints.HC1.reason = hc1;

    // HC2 Optical validity: needs refraction / ducting measurements we do not have yet. Never fires.
    this.hardConstraints.HC2.active = false;
    this.hardConstraints.HC2.reason = '';

    // HC3 Data provenance: no fresh local observation means no local score.
    const hc3 = !local || !local.location ? 'No location set'
      : !fresh ? (local.station ? 'Nearest station report is more than 3 hours old' : 'No weather station within 100 miles') : '';
    this.hardConstraints.HC3.active = !!hc3;
    this.hardConstraints.HC3.reason = hc3;
  },

  // ── Observation Suitability ─────────────────────────────────
  _computeSuitability(fresh) {
    const P = this.primitives;
    const W = { TH: 0.3, OP: 0.35, DY: 0.2, TS: 0.15 };
    let wSum = 0, wTotal = 0;
    for (const k of Object.keys(W)) if (P[k].available) { wSum += P[k].value * W[k]; wTotal += W[k]; }
    const scored = fresh && wTotal > 0;
    const overall = scored ? this.clamp(wSum / wTotal) : 0;
    this.suitability.scored = scored;
    this.suitability.overall = overall;

    if (!scored) this.suitability.status = 'unknown';
    else if (this.hardConstraints.HC1.active || this.hardConstraints.HC2.active) this.suitability.status = 'unsuitable';
    else if (P.OP.available && P.OP.value <= -0.4) this.suitability.status = 'unsuitable'; // can't see: poor no matter what else is fine
    else if (overall > 0.2) this.suitability.status = 'suitable';
    else if (overall > -0.3) this.suitability.status = 'qualified';
    else this.suitability.status = 'unsuitable';

    // Binding constraint: the weakest primitive that has data
    const avail = Object.entries(P).filter(([, p]) => p.available).sort((a, b) => a[1].value - b[1].value);
    this.suitability.bindingConstraint = avail.length ? avail[0][0] : null;
  },

  // ── Trend: change since the previous refresh ────────────────
  _computeTrend() {
    if (!this.suitability.scored || this._prevOverall === null || this._prevOverall === undefined) { this.suitability.trend = 'stable'; return; }
    const delta = this.suitability.overall - this._prevOverall;
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
