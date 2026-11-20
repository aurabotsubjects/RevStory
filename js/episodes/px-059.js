/* ============================================================================
 *  REVELATION · PIXEL EDITION · Episode 59 · The Great Winepress · Revelation 14:17–20
 *  2D pixel-art cut (480x200). Another angel with a sharp sickle gathers the clusters from the earth vine, and they are thrown into the great winepress of God wrath, trampled outside the city. Dark red palette, stylised and non-graphic: the blood reads as a crimson river of light, rising as high as the horses bridles for sixteen hundred stadia, in a slow aerial pull-back. No faces.
 * ========================================================================== */
(function () {
  'use strict';
  const Aura = window.Aura, px = Aura.px, lib = Aura.pxlib;
  const { W, H, clamp, lerp, sstep, hex, hexes, mix } = px;
  const S = sstep;
  const G = (x, y, r, c, k, sy) => { if (k > 0.01) lib.halo(Math.round(x), Math.round(y), r, hex(c), k, sy || 1); };
  const shake = (dx, dy) => { dx = Math.round(dx); dy = Math.round(dy); if (!dx && !dy) return; const U = px.cur(), C = U.slice(); for (let y = 0; y < H; y++) { const sy = clamp(y - dy, 0, H - 1); for (let x = 0; x < W; x++) U[y * W + x] = C[sy * W + clamp(x - dx, 0, W - 1)]; } };
  const fire = (x, y, r, k, t) => { if (k <= 0.01) return; const f = 0.85 + 0.15 * Math.sin(t * 9 + x); G(x, y, r * 1.7 * f, '#ff4a10', 0.4 * k); G(x, y, r * f, '#ff9a30', 0.7 * k); G(x, y, r * 0.5, '#fff0b0', 0.9 * k); };
  const bolt = (x0, y0, x1, y1, seed, col, k) => { if (k <= 0.01) return; let px0 = x0, py0 = y0; const n = 9; for (let i = 1; i <= n; i++) { const u = i / n, nx = lerp(x0, x1, u) + (i < n ? (px.hash(i, seed, 5) - 0.5) * 26 : 0), ny = lerp(y0, y1, u); lib.line(Math.round(px0), Math.round(py0), Math.round(nx), Math.round(ny), hex(col), 1); G(nx, ny, 5, col, 0.25 * k); px0 = nx; py0 = ny; } };
  const tint = (y0, y1, col, k) => { if (k <= 0.01) return; const c = hex(col); for (let y = Math.max(0, y0 | 0); y < Math.min(H, y1 | 0); y++) for (let x = 0; x < W; x++) px.dpx(x, y, c, k); };
  const stars = (t, k, y1, col) => { if (k <= 0.01) return; for (let i = 0; i < 110; i++) { const x = Math.round(px.hash(i, 1, 41) * W), y = Math.round(px.hash(i, 2, 41) * (y1 || 120)); px.dpx(x, y, hex(col || '#fff6e0'), k * (0.4 + 0.6 * Math.abs(Math.sin(t * 1.3 + i)))); } };
  const crowd = (y, n, k, seed, h, col, x0, x1) => { for (let i = 0; i < n; i++) { const x = lerp(x0 === undefined ? 10 : x0, x1 === undefined ? 470 : x1, (i + px.hash(i, seed, 3) * 0.7) / n); lib.person({ x, y: y + px.hash(i, seed, 7) * 8, h: h * (0.8 + 0.4 * px.hash(i, seed, 11)), k, col: col || '#0a0810' }); } };
  const done = (t, dur, fl, flc, vig) => px.post({ vignette: vig === undefined ? 1.0 : vig, flash: fl || 0, flashCol: hex(flc || '#fff0d0'), fade: Math.max(1 - S(0, 1.4, t), S(dur - 1.6, dur, t)), fadeCol: hex('#000000') });

  Aura.define(59, {
    pixel: true,
    duration: 62,
    cues: [
      { ref: '14:17', t0: 5.0, t1: 16.0 },
      { ref: '14:18', t0: 17.0, t1: 30.0 },
      { ref: '14:19', t0: 31.0, t1: 44.0 },
      { ref: '14:20', t0: 45.0, t1: 58.0 },
    ],
    titles: [],

    build(ctx) {
      const angel = (x, y, s, k, t, seed, o) => { o = o || {}; lib.lightFig({ x, y, h: 44 * s, a: k, t, seed, sway: 0.3, glow: o.glow === undefined ? 1.2 : o.glow }); lib.wings({ x, y: y - 28 * s, s: 0.9 * s, k: k * 0.85, t: t * 1.5 + seed, spread: o.spread === undefined ? 0.7 : o.spread, eyes: 0, n: 2 }); };
      const GR = hexes(['#1a0410', '#4a0e28', '#8a1a48', '#c03060', '#e870a0']);
      return {
        render(t) {
          const U = px.cur();
          if (t < 45) {
            lib.skyGrad({ t, top: '#10040c', mid: '#5a1020', bot: '#c05030', cloud: 0.3, wind: 0.2, y1: 120, dark: 0.3 });
            for (let y = 120; y < H; y++) for (let x = 0; x < W; x++) px.set(x, y, px.ramp(hexes(['#10040a', '#2a0c14', '#4a1a1c']), clamp(0.3 + (y - 120) * 0.004, 0, 1), x, y));
            const ga = S(17, 28, t); for (let r = 0; r < 5; r++) { const y = 130 + r * 14; lib.line(0, y + 6, W, y + 6, hex('#2a1008'), 1); for (let i = 0; i < 18 + r * 3; i++) { const x = (i + 0.5) / (18 + r * 3) * W, taken = r * 0.12 + (i / (18 + r * 3)) * 0.4 < ga ? 1 : 0; if (taken) continue; for (let q = 0; q < 4 + r; q++) lib.ell(x + (q % 2) * 3, y - q * 2, 2.5 + r * 0.5, 2.5 + r * 0.5, (X, Y, dx, dy) => px.dpx(X, Y, px.ramp(GR, clamp(0.55 - dy * 0.3 + dx * 0.1, 0, 1), X, Y), 1)); } }
            angel(90 + 220 * ga, 130, 1.1, S(4, 8, t), t, 3, { spread: 0.7 }); for (let q = 0; q < 14; q++) { const a = -2.1 + q * 0.12; lib.line(Math.round(90 + 220 * ga + 12), Math.round(100), Math.round(90 + 220 * ga + 12 + Math.cos(a) * 20), Math.round(100 + Math.sin(a) * 20), hex('#e8e0d0'), 1); }
            if (t >= 17) { const alt = S(17, 22, t) * (1 - S(33, 37, t)); angel(400, 60, 1.0, alt, t, 6, { spread: 0.8 }); G(400, 60, 50, '#ff8a30', 0.5 * alt); }
            if (t >= 31) { const wp = S(31, 36, t), tr = S(36, 44, t); for (let y = 130; y < 190; y++) for (let x = 330; x < 440; x++) { const e = Math.pow((x - 385) / 55, 2) + Math.pow((y - 160) / 28, 4); if (e < 1) px.dpx(x, y, px.ramp(hexes(['#2a1810', '#5a3a28', '#9a6a48']), clamp(0.3 + (x - 330) * 0.003 + (190 - y) * 0.003, 0, 1), x, y), wp); } lib.ell(385, 142, 46, 10, (X, Y) => px.dpx(X, Y, px.ramp(GR, clamp(0.5 + 0.3 * Math.sin(X * 0.3 + t * 4), 0, 1), X, Y), wp)); G(385, 142, 70, '#e83060', 0.5 * wp * (0.7 + 0.3 * Math.sin(t * 5)));
              for (let i = 0; i < 30; i++) { const a = (t - 31 - i * 0.3), p = clamp(a / 1.6, 0, 1); if (a < 0 || a > 2) continue; G(lerp(180, 385, p) , lerp(60, 140, p * p) - 30 * Math.sin(p * 3.14), 4, '#c03060', 0.8); }
              const wall = 330; for (let x = 0; x < 330; x++) { const hh = 26 + 6 * Math.sin(x * 0.1); for (let y = 160 - hh; y < 180; y++) px.dpx(x, Math.round(y), hex('#1a0a10'), 0.95 * wp); } G(100, 150, 80, '#ffb060', 0.2 * wp); for (let i = 0; i < 12; i++) { const x = 20 + i * 26; lib.person({ x: 335 + Math.sin(t * 6 + i) * 6 + (i % 4) * 14, y: 186 + (i % 3) * 3, h: 14, k: tr, col: '#0a0408' }); }
              const ri = S(38, 44, t); for (let x = 380; x > 380 - 400 * ri; x--) { const yy = 176 + Math.sin(x * 0.05 + t * 3) * 2; for (let y = 0; y < 10; y++) px.dpx(x, Math.round(yy + y), px.ramp(GR, clamp(0.7 - y * 0.03 + 0.2 * Math.sin(x * 0.2 - t * 5), 0, 1), x, y), 0.95); } }
            px.post({ vignette: 1.4, flash: 0, fade: Math.max(1 - S(0, 1.4, t), S(44, 45, t)), fadeCol: hex('#000000') }); lib.titleCard(t, 'THE WINEPRESS', 59); return;
          }
          const pb = S(45, 58, t), sc = lerp(1.0, 0.35, pb * pb * (3 - 2 * pb)); const gx = (x) => 240 + (x - 240) * sc, gy = (y) => 120 + (y - 120) * sc;
          for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) U[y * W + x] = px.ramp(hexes(['#08020a', '#1a0610', '#3a0c18', '#5a1020']), clamp(0.25 + (1 - y / H) * 0.3, 0, 1), x, y);
          const fl = Math.round(lerp(36, 62, pb)); for (let y = Math.round(gy(150)); y < H; y++) for (let x = 0; x < W; x++) { const flow = 0.5 + 0.5 * Math.sin(x * 0.08 - t * 3 + y * 0.2), v = clamp(0.5 + 0.3 * flow - (y - gy(150)) * 0.002, 0, 1); px.set(x, y, px.ramp(GR, v, x, y)); }
          for (let x = 0; x < W; x++) { const yy = Math.round(gy(150) + Math.sin(x * 0.06 + t * 2) * 2); px.dpx(x, yy, hex('#ffb0c8'), 0.6); }
          for (let i = 0; i < 24; i++) { const x = (i + 0.5) * W / 24 + Math.sin(t + i) * 3, y = gy(150) + 16 + (i % 4) * 8 * sc; lib.horse({ x, y, s: 0.5 * sc, k: 1, coat: 'black', speed: 0, t, glow: 0 }); }
          const ek = S(48, 54, t) * (1 - S(57, 58, t)); const tt = '1,600 STADIA', tw = px.textWidth(tt, 4, 1); px.text(tt, Math.round(240 - tw / 2), 20, 4, hex('#ffc0d0'), ek * 0.9);
          px.post({ vignette: 1.4, flash: 0, fade: Math.max(S(44, 45.4, t) < 1 && t < 45.5 ? 1 - S(44, 45.4, t) : 0, S(58, 62, t)), fadeCol: hex('#000000') });
        },
      };
    },

    score(A, from) {
      const D2 = 73.42, D3 = 146.83, A3 = 220, D4 = 293.66, F4 = 349.23, Fs4 = 369.99, A4 = 440, D5 = 587.33, F5 = 698.46, Fs5 = 739.99, A5 = 880, D6 = 1174.66;
      A.drone(0, 62, D2 * 0.75, { gain: 0.08, attack: 2.0, release: 3.0 });
      A.choir(4, 62, [D3, F4, Fs4], { gain: 0.05, attack: 4.0, release: 4.0, vowel: 0.3 }); A.brass(5, 16, D3, { gain: 0.07, attack: 1.0, release: 3.0, sweep: [[5, 500], [12, 900]] });
      for (let q = 17; q < 44; q += 1.4) A.boom(q, { freq: 42, gain: 0.25, dur: 1.2 }); A.noise({ t0: 31, t1: 45, gain: [[31, 0.0], [38, 0.25], [45, 0]], filter: { type: 'lowpass', freq: 900, q: 1 }, wet: 0.4, attack: 1, release: 2 });
      A.boom(36, { freq: 34, gain: 0.7, dur: 5 }); A.riser(40, 45, { from: 100, to: 1200, gain: 0.14 }); A.boom(45.2, { freq: 30, gain: 0.9, dur: 7 });
      A.choir(45, 62, [D3, F4, A3, D4], { gain: 0.07, attack: 3.0, release: 4.0, vowel: 0.5 }); A.brass(46, 60, D3, { gain: 0.06, attack: 4.0, release: 4.0, sweep: [[46, 400], [56, 1100]] });
    },
  });
})();
