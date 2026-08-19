/**
 * ═══════════════════════════════════════════════════════════════
 *  AtmosCore — 4/42 Polar Ring Visualization
 *  DarkWave Studios LLC — Copyright 2026
 *
 *  Renders the 42-node state ring as a polar coordinate diagram
 *  with four primitive arcs, radial bars, and core quadrant.
 * ═══════════════════════════════════════════════════════════════
 */

const AtmosCoreViz = {

  canvas: null,
  ctx: null,
  width: 0,
  height: 0,
  centerX: 0,
  centerY: 0,
  radius: 0,
  animFrame: null,
  targetValues: [],
  currentValues: [],
  initialized: false,

  // ── Primitive arc config ─────────────────────────────────────
  arcs: [
    { key: 'TH', label: 'THERMO', color: '#1E6FA8', start: 0,   count: 10 },
    { key: 'OP', label: 'OPTICAL', color: '#D4A017', start: 10,  count: 10 },
    { key: 'DY', label: 'DYNAMIC', color: '#5A7A8A', start: 20,  count: 12 },
    { key: 'TS', label: 'TEMPORAL', color: '#4A3060', start: 32,  count: 10 },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Initialize
  // ═══════════════════════════════════════════════════════════════
  init(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.resize();
    this.currentValues = new Array(42).fill(0);
    this.targetValues = new Array(42).fill(0);
    this.initialized = true;

    // Handle resize
    const ro = new ResizeObserver(() => this.resize());
    ro.observe(this.canvas.parentElement);
  },

  resize() {
    if (!this.canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const size = Math.min(rect.width, rect.height);

    this.canvas.width = size * dpr;
    this.canvas.height = size * dpr;
    this.canvas.style.width = size + 'px';
    this.canvas.style.height = size + 'px';

    this.width = size * dpr;
    this.height = size * dpr;
    this.centerX = this.width / 2;
    this.centerY = this.height / 2;
    this.radius = this.width * 0.38;

    if (this.ctx) {
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // Update with AtmosCore state
  // ═══════════════════════════════════════════════════════════════
  update(atmosCore) {
    if (!this.initialized || !atmosCore.nodes.length) return;

    this.targetValues = atmosCore.nodes.map(n => n.value);

    // Animate toward target
    if (!this.animFrame) this._animate();
  },

  _animate() {
    let needsUpdate = false;
    for (let i = 0; i < 42; i++) {
      const diff = this.targetValues[i] - this.currentValues[i];
      if (Math.abs(diff) > 0.005) {
        this.currentValues[i] += diff * 0.08;
        needsUpdate = true;
      } else {
        this.currentValues[i] = this.targetValues[i];
      }
    }

    this._render();

    if (needsUpdate) {
      this.animFrame = requestAnimationFrame(() => this._animate());
    } else {
      this.animFrame = null;
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // Render the polar ring
  // ═══════════════════════════════════════════════════════════════
  _render() {
    const ctx = this.ctx;
    const cx = this.centerX / (window.devicePixelRatio || 1);
    const cy = this.centerY / (window.devicePixelRatio || 1);
    const r = this.radius / (window.devicePixelRatio || 1);
    const w = this.width / (window.devicePixelRatio || 1);
    const h = this.height / (window.devicePixelRatio || 1);

    ctx.clearRect(0, 0, w, h);

    // ── Background ring tracks ──────────────────────────────
    this._drawRingTrack(ctx, cx, cy, r);

    // ── Node radial bars ────────────────────────────────────
    this._drawNodeBars(ctx, cx, cy, r);

    // ── Primitive arc labels ────────────────────────────────
    this._drawArcLabels(ctx, cx, cy, r);

    // ── Core quadrant ───────────────────────────────────────
    this._drawCoreQuadrant(ctx, cx, cy, r * 0.35);

    // ── Center text ─────────────────────────────────────────
    this._drawCenterInfo(ctx, cx, cy);
  },

  _drawRingTrack(ctx, cx, cy, r) {
    // Outer ring track
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(40, 40, 55, 0.4)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Inner ring track
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.5, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(40, 40, 55, 0.3)';
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // Primitive divider lines
    const totalNodes = 42;
    for (const arc of this.arcs) {
      const angle = (arc.start / totalNodes) * Math.PI * 2 - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle) * r * 0.4, cy + Math.sin(angle) * r * 0.4);
      ctx.lineTo(cx + Math.cos(angle) * (r + 10), cy + Math.sin(angle) * (r + 10));
      ctx.strokeStyle = 'rgba(60, 60, 80, 0.3)';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }
  },

  _drawNodeBars(ctx, cx, cy, r) {
    const totalNodes = 42;
    const barWidth = (Math.PI * 2) / totalNodes * 0.7;
    const maxBarLen = r * 0.35;

    for (let i = 0; i < totalNodes; i++) {
      const value = this.currentValues[i];
      const angle = (i / totalNodes) * Math.PI * 2 - Math.PI / 2;

      // Find which arc this node belongs to
      const arc = this.arcs.find(a => i >= a.start && i < a.start + a.count);
      if (!arc) continue;

      const barLen = Math.abs(value) * maxBarLen;
      const isNegative = value < 0;

      // Bar start from the ring center outward (positive) or inward (negative)
      const ringR = r * 0.65;
      const startR = isNegative ? ringR - barLen : ringR;
      const endR = isNegative ? ringR : ringR + barLen;

      // Color based on status band
      const bandColor = this._getBandColor(value);

      // Draw bar as arc segment
      ctx.beginPath();
      ctx.arc(cx, cy, startR, angle - barWidth / 2, angle + barWidth / 2);
      ctx.arc(cx, cy, endR, angle + barWidth / 2, angle - barWidth / 2, true);
      ctx.closePath();

      // Gradient fill
      const grd = ctx.createRadialGradient(cx, cy, startR, cx, cy, endR);
      grd.addColorStop(0, this._withAlpha(bandColor, 0.3));
      grd.addColorStop(1, this._withAlpha(bandColor, 0.8));
      ctx.fillStyle = grd;
      ctx.fill();

      // Border
      ctx.strokeStyle = this._withAlpha(bandColor, 0.5);
      ctx.lineWidth = 0.5;
      ctx.stroke();

      // End cap dot
      const capR = isNegative ? startR : endR;
      const capX = cx + Math.cos(angle) * capR;
      const capY = cy + Math.sin(angle) * capR;
      ctx.beginPath();
      ctx.arc(capX, capY, 2, 0, Math.PI * 2);
      ctx.fillStyle = bandColor;
      ctx.fill();
    }
  },

  _drawArcLabels(ctx, cx, cy, r) {
    ctx.font = '600 8px "JetBrains Mono"';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (const arc of this.arcs) {
      const midIndex = arc.start + arc.count / 2;
      const angle = (midIndex / 42) * Math.PI * 2 - Math.PI / 2;
      const labelR = r + 22;
      const x = cx + Math.cos(angle) * labelR;
      const y = cy + Math.sin(angle) * labelR;

      ctx.fillStyle = this._withAlpha(arc.color, 0.6);
      ctx.fillText(arc.label, x, y);
    }
  },

  _drawCoreQuadrant(ctx, cx, cy, coreR) {
    // Four quadrants sized by primitive value
    const primKeys = ['TH', 'OP', 'DY', 'TS'];
    const quadAngles = [
      -Math.PI / 2,   // TH: top
      0,              // OP: right
      Math.PI / 2,    // DY: bottom
      Math.PI,        // TS: left
    ];

    for (let i = 0; i < 4; i++) {
      const arc = this.arcs[i];
      const prim = AtmosCore.primitives[arc.key];
      const value = prim ? prim.value : 0;
      const qR = coreR * (0.3 + Math.abs(value) * 0.7);

      const startAngle = quadAngles[i];
      const endAngle = startAngle + Math.PI / 2;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, qR, startAngle, endAngle);
      ctx.closePath();

      const bandColor = this._getBandColor(value);
      const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, qR);
      grd.addColorStop(0, this._withAlpha(arc.color, 0.15));
      grd.addColorStop(1, this._withAlpha(bandColor, 0.35));
      ctx.fillStyle = grd;
      ctx.fill();

      ctx.strokeStyle = this._withAlpha(arc.color, 0.3);
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }
  },

  _drawCenterInfo(ctx, cx, cy) {
    // Suitability score in center
    const suit = AtmosCore.suitability;
    const score = suit.overall;
    const status = suit.status;

    // Score
    ctx.font = '700 18px "JetBrains Mono"';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = this._getBandColor(score);
    ctx.fillText(score >= 0 ? `+${score.toFixed(2)}` : score.toFixed(2), cx, cy - 8);

    // Status label
    ctx.font = '600 7px "JetBrains Mono"';
    ctx.fillStyle = this._withAlpha(this._getBandColor(score), 0.7);
    ctx.fillText(status.toUpperCase(), cx, cy + 8);

    // Trend indicator
    const trendChar = suit.trend === 'improving' ? '▲' : suit.trend === 'degrading' ? '▼' : '●';
    const trendColor = suit.trend === 'improving' ? '#87CEEB' : suit.trend === 'degrading' ? '#D4601A' : '#5A7A8A';
    ctx.font = '8px sans-serif';
    ctx.fillStyle = trendColor;
    ctx.fillText(trendChar, cx, cy + 20);
  },

  // ── Helpers ─────────────────────────────────────────────────
  _getBandColor(value) {
    if (value >= 0) return '#87CEEB';      // optimal — clear sky blue
    if (value >= -0.3) return '#D4A017';   // advisory — haze amber
    if (value >= -0.7) return '#D4601A';   // caution — storm orange
    return '#8B1A1A';                       // critical — deep crimson
  },

  _withAlpha(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  },
};
