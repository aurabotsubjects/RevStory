/* ============================================================================
 *  REVELATION · PIXEL EDITION · Episode 25 · Who Can Withstand? · Revelation 6:15–17
 *  2D pixel-art cut (480x200). Kings, rulers, generals, the rich, the mighty, slave and free: tiny silhouettes hiding in caves in a vast rock face, crying out for the rocks to fall on them and hide them from the face of the One on the throne and the wrath of the Lamb. The question "Who can withstand it?" ends in silence. Darkness, then four points of light at the four corners of the earth. No faces.
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

  Aura.define(25, {
    pixel: true,
    duration: 50,
    cues: [
      { ref: '6:15', t0: 5.0, t1: 18.8 },
      { ref: '6:16', t0: 20.0, t1: 32.5 },
      { ref: '6:17', t0: 33.5, t1: 40.0 },
    ],
    titles: [],

    build(ctx) {
      const CAVES = [[60, 100, 22], [150, 128, 18], [230, 88, 26], [318, 120, 20], [400, 98, 24], [100, 160, 16], [290, 164, 18], [440, 150, 14]];
      return {
        render(t) {
          const U = px.cur(), wrath = S(8, 30, t) * (1 - S(35, 39, t)), sil = S(33, 38, t);
          /* a glow from above, the face of the One on the throne, and the wrath of the Lamb, a red light behind */
          lib.skyGrad({ t, top: '#08040c', mid: '#2a0a10', bot: '#80200c', cloud: 0.3, y1: 80, dark: 0.25 * (1 - wrath) });
          lib.halo(240, -20, 240, hex('#ff5a30'), 0.55 * wrath, 0.7);
          /* the rock face */
          for (let y = 60; y < H; y++) for (let x = 0; x < W; x++) { let f = 0.42 + 0.2 * px.fbm(x * 0.03, y * 0.05, 4, 7) + 0.12 * (1 - y / H) + 0.04 * Math.sin(x * 0.4 + y * 0.1), cave = 0; for (const [cx, cy, r] of CAVES) { const d = Math.hypot((x - cx) / r, (y - cy) / (r * 0.8)); if (d < 1) cave = 1 - d * 0.5; else if (d < 1.2) f *= 0.65; } U[y * W + x] = cave > 0 ? px.ramp(lib.REDH, clamp(0.12 + 0.2 * cave * (0.5 + 0.5 * wrath), 0, 1), x, y) : px.ramp(lib.BLACKH, clamp(f, 0, 1), x, y); }
          for (let y = 60; y < H; y++) for (let x = 0; x < W; x++) { const g = wrath * 0.2 * Math.exp(-Math.pow((y - 60) / 80, 2)); if (g > px.thr(x, y)) px.blend ? px.blend(x, y, hex('#ff6a40'), 0.5) : 0; }
          /* the people: tiny, hiding, filling the caves one by one */
          for (let i = 0; i < 60; i++) {
            const c = CAVES[i % CAVES.length], inx = S(5 + (i % 12) * 0.9, 8 + (i % 12) * 0.9, t), a = px.hash(i, 1, 41) * 6.28, r = px.hash(i, 2, 41);
            const tx = c[0] + Math.cos(a) * c[2] * 0.6 * r, ty = c[1] + 8 + Math.abs(Math.sin(a)) * c[2] * 0.3, sx = c[0] + (px.hash(i, 3, 41) - 0.5) * 300 * (1 - inx) + (i % 2 ? 200 : -200) * (1 - inx), sy = Math.min(ty + 40, H - 4);
            const X = lerp(sx, tx, inx), Y = lerp(sy, ty, inx);
            lib.person({ x: X, y: Y, h: 9, k: 1, col: '#020104', arms: S(20, 22, t) * 0.8 * (i % 3 === 0 ? 1 : 0), kneel: i % 4 === 0 ? 0.5 : 0 });
            if (i % 9 === 0) lib.miniCrown({ x: X, y: Y - 11, s: 0.45, k: 0.9, rot: 0 });
          }
          /* the cry rings out of each cave, then falls silent */
          for (const [cx, cy, r] of CAVES) for (const t0 of [20.5, 24, 27.6]) { const u = (t - t0 - cx * 0.004) / 2.6; if (u > 0 && u < 1) ring(cx, cy, u * 50, u * 24, hex('#ffb090'), (1 - u) * 0.55); }
          px.post({ vignette: 1.3, fade: S(34, 41, t) * 0.97 + S(0, 2, t) * 0.0, fadeCol: hex('#000000') });
          /* darkness; then four points of light at the four corners of the earth */
          if (t > 41) { for (const [fx, fy, d] of [[40, 30, 43], [440, 30, 44.2], [40, 170, 45.4], [440, 170, 46.6]]) { const u = S(d, d + 1.6, t); lib.halo(fx, fy, 26 * u, hex('#fff0c0'), 0.9 * u, 1); if (u > px.thr(fx, fy)) for (let q = -2; q <= 2; q++) { px.set(fx + q, fy, hex('#ffffff')); px.set(fx, fy + q, hex('#ffffff')); } } }
          lib.titleCard(t, 'WHO CAN WITHSTAND?', 25);
        },
      };
    },

    score(A, from) {
      const D2 = 73.42, D3 = 146.83, A3 = 220, D4 = 293.66, Fs4 = 369.99, A4 = 440, D5 = 587.33, Fs5 = 739.99, A5 = 880, D6 = 1174.66;
      A.drone(0, 50, D2, { gain: 0.06, attack: 1.0, release: 3.0 });
      A.choir(3, 34, [D3, A3, Fs4 * 0.94], { gain: 0.05, attack: 3.0, release: 2.0, vowel: 0.5 });
      A.noise({ t0: 5, t1: 33, gain: [[5, 0.02], [20, 0.1], [33, 0.05]], filter: { type: 'bandpass', freq: 900, q: 0.5 }, wet: 0.6, attack: 2, release: 3 });
      [20.5, 24, 27.6, 31].forEach((t) => A.boom(t, { freq: 46, gain: 0.3, dur: 3 }));
      A.brass(8, 33, Fs4 / 2, { gain: 0.045, attack: 3.0, release: 2.0, sweep: [[8, 400], [28, 1600]] });
      A.boom(33.5, { freq: 40, gain: 0.45, dur: 4 });
      [43, 44.2, 45.4, 46.6].forEach((t, i) => A.bell(t, [D5, Fs5, A5, D6][i], { gain: 0.07, dur: 7 }));
      A.shimmer(43, D6, { dur: 8, gain: 0.04 });
    },
  });
})();
