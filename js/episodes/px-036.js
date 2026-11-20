/* ============================================================================
 *  REVELATION · PIXEL EDITION · Episode 36 · Fire, Smoke and Sulfur · Revelation 9:17–21
 *  2D pixel-art cut (480x200). The riders in breastplates of red, dark blue and yellow. A charge in speed-ramped walls of red, blue and yellow light, fire, smoke and sulfur streaming forward from the horses. Then the quiet aftermath: grey ground, survivors standing before their idols of gold, silver, bronze, stone and wood, and not repenting. Stylised, non-graphic. No faces.
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

  Aura.define(36, {
    pixel: true,
    duration: 64,
    cues: [
      { ref: '9:17', t0: 5.0, t1: 25.0 },
      { ref: '9:18', t0: 26.0, t1: 36.0 },
      { ref: '9:19', t0: 37.0, t1: 46.0 },
      { ref: '9:20', t0: 47.0, t1: 55.0 },
      { ref: '9:21', t0: 56.0, t1: 62.0 },
    ],
    titles: [],

    build(ctx) {
      const LANES = [['#ff3a18', '#ffb060'], ['#2a3a9a', '#7a9aff'], ['#e8d020', '#fff8a0']];
      const IDOL = [['#d8a020', '#fff0a0', 0], ['#c8ccd8', '#ffffff', 1], ['#b06a30', '#ffc080', 2], ['#6a6a70', '#b0b0b8', 3], ['#6a4a28', '#a0784a', 4]];
      const idol = (x, y, i, k) => { const [c1, c2, kind] = IDOL[i]; if (k <= 0.01) return; const a = hex(c1), b = hex(c2); lib.ell(x, y - 24, 9, 12, (X, Y, dx, dy) => px.dpx(X, Y, mix(a, b, clamp(0.5 - dx * 0.3 - dy * 0.4, 0, 1)), k)); for (let q = -1; q <= 1; q += 2) lib.line(Math.round(x + q * 5), y - 30, Math.round(x + q * 8), y - 40, a, 2); for (let yy = y - 14; yy < y; yy++) for (let xx = x - 10; xx <= x + 10; xx++) px.dpx(xx, yy, mix(a, hex('#1a1a1a'), 0.4 + 0.3 * ((yy - y + 14) / 14)), k); };
      return {
        render(t) {
          if (t < 37) {
            const sp = t < 8 ? 0.4 : 0.4 + 2.2 * S(8, 18, t) - 1.2 * S(24, 28, t) * 0, ph = t * sp * 1.0, glow = S(4, 9, t);
            const U = px.cur(); for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const lane = Math.min(2, Math.floor(y / 66.7)), v = 0.1 + 0.5 * glow * (0.5 + 0.5 * Math.sin(x * 0.02 - t * 3 + lane)) * Math.exp(-Math.pow((((y % 66.7) - 33) / 38), 2)); U[y * W + x] = px.ramp(hexes(['#050306', hex(LANES[lane][0]) ? LANES[lane][0] : '#000', LANES[lane][1], '#ffffff'].map((c) => c)), clamp(v, 0, 1), x, y); }
            for (let lane = 0; lane < 3; lane++) for (let r = 0; r < 12; r++) { const x = ((r * 52 + ph * 90 * (1 + lane * 0.1)) % 600) - 60, y = 54 + lane * 66 + (r % 3) * 4; lib.horse({ x, y, s: 0.78, k: S(3, 7, t), t: t + r * 0.3 + lane, speed: 0.4 + 1.8 * S(8, 18, t), coat: 'black', glow: 0, rider: true }); for (let q = 0; q < 12; q++) { const d = q * 7, X = x + 22 + d + (px.hash(q, r, 3) - 0.5) * 3, Y = y - 12 + (px.hash(q, lane, 5) - 0.5) * 10 - d * 0.08; G(X, Y, 5 + q * 0.9, LANES[lane][1], 0.5 * (1 - q / 12) * glow); } }
            for (let i = 0; i < 80; i++) { const y = px.hash(i, 1, 4) * H, x = ((px.hash(i, 2, 4) * 520 - t * 400 * sp) % 520 + 520) % 520 - 20; lib.line(Math.round(x), Math.round(y), Math.round(x + 30 * sp), Math.round(y), hex('#ffffff'), 1); }
            const fl = Math.exp(-Math.max(0, t - 36.2) * 3) * (t > 36.2 ? 1 : 0);
            px.post({ vignette: 1.1, flash: fl * 0.6, flashCol: hex('#ffffff'), fade: Math.max(1 - S(0, 1.4, t), S(36, 37, t)), fadeCol: hex('#000000') }); lib.titleCard(t, 'FIRE AND SULFUR', 36); return;
          }
          const U = px.cur(); for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const v = 0.28 + 0.2 * (1 - y / H) + 0.05 * px.fbm(x * 0.02, y * 0.05 + t * 0.02, 3, 2); U[y * W + x] = px.ramp(hexes(['#141416', '#2a2a2e', '#4a4a50', '#7a7a80', '#a0a0a4']), clamp(v, 0, 1), x, y); }
          for (let i = 0; i < 60; i++) { const q = (t * 0.03 + px.hash(i, 1, 2)) % 1; px.dpx(Math.round(px.hash(i, 2, 2) * W), Math.round(40 + q * 120), hex('#c8c8cc'), 0.4 * (1 - q)); }
          lib.land({ y0: 150, amp: 5, c1: '#2a2a2c', c2: '#121214', seed: 7, scroll: 0, k: 1 });
          const ik = S(40, 46, t); for (let i = 0; i < 5; i++) { const x = 60 + i * 90; idol(x, 156, i, ik); lib.person({ x: x - 20 + (i % 2) * 40, y: 186, h: 44, k: S(38 + i * 0.6, 44, t), col: '#0a0a0c', kneel: 0 }); G(x, 130, 24, IDOL[i][1], 0.18 * ik); }
          px.post({ vignette: 1.4, flash: 0, fade: Math.max(S(37, 38.4, t) < 1 && t < 38.5 ? 1 - S(37, 38.4, t) : 0, S(60, 62, t)), fadeCol: hex('#000000') });
        },
      };
    },

    score(A, from) {
      const D2 = 73.42, D3 = 146.83, A3 = 220, D4 = 293.66, F4 = 349.23, Fs4 = 369.99, A4 = 440, D5 = 587.33, F5 = 698.46, Fs5 = 739.99, A5 = 880, D6 = 1174.66;
      A.drone(0, 64, D2, { gain: 0.07, attack: 2.0, release: 3.0 });
      A.boom(4.8, { freq: 40, gain: 0.5, dur: 3 }); A.brass(5, 12, D3, { gain: 0.09, attack: 0.05, release: 2.5, sweep: [[5, 1700], [9, 700]] });
      A.noise({ t0: 6, t1: 36, gain: [[6, 0.05], [18, 0.35], [34, 0.3], [36.5, 0]], filter: { type: 'bandpass', freq: 1400, q: 0.5 }, wet: 0.3, attack: 1, release: 1 });
      for (let q = 8; q < 36; q += 0.7 - 0.3 * Math.min(1, (q - 8) / 10)) A.boom(q, { freq: 50, gain: 0.22, dur: 0.6 });
      A.riser(24, 36.4, { from: 100, to: 1200, gain: 0.14 });
      A.boom(36.5, { freq: 32, gain: 0.9, dur: 6 });
      A.drone(37, 64, D2 * 0.75, { gain: 0.05, attack: 3.0, release: 3.0 });
      A.choir(38, 62, [D3, F4], { gain: 0.04, attack: 4.0, release: 4.0, vowel: 0.3 }); A.bell(41, D5, { gain: 0.05, dur: 9 }); A.bell(50, A4, { gain: 0.04, dur: 9 });
    },
  });
})();
