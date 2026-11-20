/* ============================================================================
 *  REVELATION · PIXEL EDITION · Episode 27 · The Twelve Tribes Sealed · Revelation 7:4–8
 *  2D pixel-art cut (480x200). A ring of twelve lights, one for each tribe of Israel, ignites in the order John hears them (12,000 points of light in each), forming a huge radiant circle. The circle opens onto a boundless crowd. No faces.
 * ========================================================================== */
(function () {
  'use strict';
  const Aura = window.Aura, px = Aura.px, lib = Aura.pxlib;
  const { W, H, clamp, lerp, sstep, hex, hexes, mix } = px;
  const S = sstep;
  const GOLDSKY = hexes(['#1a1008', '#3d2410', '#7a4a1a', '#b8802a', '#e8b04a', '#ffd987', '#fff3c8']);
  const ring = (cx, cy, r, ry, col, k) => { if (k <= 0.01) return; const N = Math.max(60, Math.round(r * 5)); for (let i = 0; i < N; i++) { const a = i / N * 6.2832; px.dpx(Math.round(cx + Math.cos(a) * r), Math.round(cy + Math.sin(a) * ry), col, k); } };
  const shake = (dx, dy) => { if (!dx && !dy) return; const U = px.cur(), C = U.slice(); for (let y = 0; y < H; y++) { const sy = clamp(y - dy, 0, H - 1); for (let x = 0; x < W; x++) U[y * W + x] = C[sy * W + clamp(x - dx, 0, W - 1)]; } };
  const bg = (t, glow, flash) => { const U = px.cur(); for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const dx = (x - 240) / 240, f = y / H; const v = 0.05 + 0.12 * f + glow * 0.34 * Math.exp(-dx * dx * 2.4 - Math.pow((y - 90) / 100, 2)) + 0.03 * px.fbm(x * 0.02, y * 0.04 + t * 0.03, 2, 8); U[y * W + x] = px.ramp(GOLDSKY, clamp(v + (flash || 0) * 0.4, 0, 1), x, y); } };

  Aura.define(27, {
    pixel: true,
    duration: 62,
    cues: [
      { ref: '7:4', t0: 5.0, t1: 14.5 },
      { ref: '7:5', t0: 15.5, t1: 24.8 },
      { ref: '7:6', t0: 26.0, t1: 34.2 },
      { ref: '7:7', t0: 35.5, t1: 43.8 },
      { ref: '7:8', t0: 45.0, t1: 54.8 },
    ],
    titles: [],

    build(ctx) {
      const HUES = ['#f0c040', '#e86a4a', '#58c878', '#5aa0e8', '#b078e0', '#f08ab0', '#40d0d0', '#e8e8f0', '#e89040', '#90e060', '#6070e8', '#e060a0'];
      const CX = 240, CY = 100, RX = 150, RY = 74;
      return {
        render(t) {
          const U = px.cur(), open = S(55, 62, t);
          bg(t, 0.4 + 0.3 * S(5, 54, t), 0);
          lib.halo(CX, CY, 120, hex('#fff0c0'), 0.4 * S(2, 8, t), 1);
          ring(CX, CY, RX, RY, hex('#ffe9a0'), 0.18 * S(3, 8, t));
          for (let i = 0; i < 12; i++) {
            const a = -Math.PI / 2 + i / 12 * 6.2832 + t * 0.03 * S(45, 55, t), cx = CX + Math.cos(a) * RX * (1 + 1.4 * open), cy = CY + Math.sin(a) * RY * (1 + 0.6 * open), on = S(15.5 + i * 2.8 - 0.0, 17.5 + i * 2.8, t) * (i === 0 ? 1 : 1);
            const ign = i < 0 ? 0 : clamp((t - (15.5 + Math.floor(i / 3) * 10.2 + (i % 3) * 2.4)) / 2.0, 0, 1);
            const c = hex(HUES[i]);
            lib.halo(cx, cy, 30 * ign + 6, c, 0.7 * ign + 0.1, 1);
            for (let q = 0; q < 220; q++) { const r1 = Math.sqrt(px.hash(q, i, 7)) * 15, a1 = px.hash(q, i, 8) * 6.28 + t * 0.5 * (0.5 + px.hash(q, i, 9)), X = Math.round(cx + Math.cos(a1) * r1), Y = Math.round(cy + Math.sin(a1) * r1 * 0.8), tw = 0.5 + 0.5 * Math.sin(t * 3 + q); if ((0.2 + 0.8 * ign) * tw > px.thr(X, Y)) px.set(X, Y, q % 5 === 0 ? hex('#ffffff') : c); }
          }
          /* a boundless crowd as the circle opens */
          if (open > 0.02) for (let i = 0; i < 700; i++) { const x = Math.round(px.hash(i, 1, 21) * W), y = 120 + Math.round(px.hash(i, 2, 21) * 80); if (open * (0.4 + 0.6 * (y - 120) / 80) > px.thr(x, y)) px.set(x, y, hex(i % 3 ? '#f4eee0' : '#e8d8b0')); }
          px.post({ vignette: 1.1, flash: 1 - S(0, 1.5, t), flashCol: hex('#fff6dc') });
          lib.titleCard(t, 'TWELVE TRIBES', 27);
        },
      };
    },

    score(A, from) {
      const D2 = 73.42, D3 = 146.83, A3 = 220, D4 = 293.66, Fs4 = 369.99, A4 = 440, D5 = 587.33, Fs5 = 739.99, A5 = 880, D6 = 1174.66;
      A.drone(0, 62, D2, { gain: 0.06, attack: 2.0, release: 3.0 });
      A.choir(2, 56, [D3, A3, D4, Fs4], { gain: 0.06, attack: 4.0, release: 3.0, vowel: 1.0 });
      for (let i = 0; i < 12; i++) { const t0 = 16.5 + Math.floor(i / 3) * 10.2 + (i % 3) * 2.4; A.bell(t0, [D5, Fs5, A5, D6][i % 4], { gain: 0.07, dur: 6 }); A.shimmer(t0, A5, { dur: 3, gain: 0.03 }); }
      A.brass(15, 56, D3, { gain: 0.04, attack: 4.0, release: 3.0, sweep: [[15, 500], [45, 1900]] });
      A.choir(45, 62, [D3, A3, D4, Fs4, A4, D5], { gain: 0.08, attack: 3.0, release: 3.0, vowel: 1.2 });
      A.riser(54, 61, { f0: 200, f1: 2000, gain: 0.05 });
    },
  });
})();
