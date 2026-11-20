/* ============================================================================
 *  REVELATION · PIXEL EDITION · Episode 26 · The Four Winds Held Back · Revelation 7:1–3
 *  2D pixel-art cut (480x200). A frozen world: waves, leaves and smoke hanging in the air, four angels at the four corners of the earth holding back the four winds. Another angel rises from the east with the seal of the living God and calls out. Then small figures on the land, each marked with a point of gold light, the land, sea and trees untouched. No faces.
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

  Aura.define(26, {
    pixel: true,
    duration: 54,
    cues: [
      { ref: '7:1', t0: 5.0, t1: 20.2 },
      { ref: '7:2', t0: 21.5, t1: 36.5 },
      { ref: '7:3', t0: 38.0, t1: 47.4 },
    ],
    titles: [],

    build(ctx) {
      const FROZ = (t) => t * 0.015;
      const CORN = [[56, 66], [424, 66], [56, 150], [424, 150]];
      function world(t, east) {
        lib.skyGrad({ t: FROZ(t), top: '#2a4a78', mid: '#7a9ac0', bot: '#e8d0a8', cloud: 0.5, wind: 0.0, y1: 140 });
        lib.land({ y0: 128, amp: 10, c1: '#4a6a3a', c2: '#243a1c', seed: 6, scroll: 0, k: 1 });
        lib.sea({ t: 0, y0: 160, cx: 240, glow: 0.2 + 0.5 * east, ripple: 0, k: 1 });
        for (let i = 0; i < 22; i++) { const x = 20 + i * 21.5, h = 14 + px.hash(i, 1, 3) * 14; lib.line(x, 136, x, 136 - h, hex('#4a3018'), 1); lib.ell(x, 136 - h - 4, 7, 6, (X, Y, dx, dy) => px.set(X, Y, px.ramp(lib.EMER, clamp(0.4 + 0.2 * dx - 0.2 * dy + 0.05 * px.hash(X, Y, 2), 0, 1), X, Y))); }
        /* leaves hanging mid-air, a column of smoke standing still */
        for (let i = 0; i < 40; i++) { const x = Math.round(30 + px.hash(i, 1, 9) * 420), y = Math.round(40 + px.hash(i, 2, 9) * 90); px.set(x, y, hex(i % 3 ? '#7a9a40' : '#c8a040')); px.set(x + 1, y, hex('#5a7a30')); }
        for (let y = 60; y < 135; y++) { const w2 = 2 + (135 - y) * 0.05, x = 330 + Math.sin(y * 0.15) * 3; for (let xx = -w2; xx <= w2; xx++) px.dpx(Math.round(x + xx), y, hex('#a0a0a8'), 0.5 * (1 - (y - 60) / 90)); }
      }
      return {
        render(t) {
          const U = px.cur(), east = S(21, 25, t);
          world(t, east);
          for (let i = 0; i < 4; i++) {
            const [cx, cy] = CORN[i], a = S(7 + i * 1.6, 10 + i * 1.6, t) * (1 - 0.0 * S(40, 47, t));
            lib.lightFig({ x: cx, y: cy + 38, h: 54, a, t: FROZ(t) * 40, seed: i, sway: 0.2, glow: 1 });
            lib.wings({ x: cx, y: cy + 18, s: 1.2, k: a * 0.8, t: 0, spread: 0.6, eyes: 0, n: 2 });
            /* the wind, held: frozen curls in front of each angel's hands */
            for (let q = 0; q < 26; q++) { const u = q / 25, ang = u * 8 + i, r = 6 + u * 24, X = Math.round(cx + (cx < 240 ? 16 : -16) + Math.cos(ang) * r * 0.6 * (cx < 240 ? 1 : -1)), Y = Math.round(cy + 22 + Math.sin(ang) * r * 0.5); px.dpx(X, Y, hex('#e8f0ff'), a * (1 - u * 0.5)); }
          }
          /* the angel from the east, with the seal of the living God */
          const ak = S(21, 27, t) * (1 - S(36.5, 39.5, t)), ey = lerp(190, 84, S(21, 30, t));
          lib.halo(400, 190, 140 * east, hex('#ffd890'), 0.6 * east * (1 - S(36, 42, t)), 0.8);
          lib.lightFig({ x: 330, y: ey + 50, h: 72, a: ak, t, seed: 9, sway: 0.5, glow: 1.4 });
          lib.wings({ x: 330, y: ey + 14, s: 1.8, k: ak, t, spread: 0.8, eyes: 0, n: 3 });
          ring(330 + 22, ey + 10, 9, 9, hex('#ffe9a0'), ak); lib.halo(352, ey + 10, 24, hex('#ffe9a0'), 0.8 * ak, 1);
          for (let q = 0; q < 6; q++) { const a2 = q * 1.047 + t * 0.6; px.dpx(Math.round(352 + Math.cos(a2) * 5), Math.round(ey + 10 + Math.sin(a2) * 5), hex('#ffffff'), ak); }
          for (let r = 0; r < 3; r++) { const u = (t - 24 - r * 2) / 4.5; if (u > 0 && u < 1) ring(330, ey, u * 280, u * 90, hex('#ffe9a0'), (1 - u) * 0.6); }
          /* the people, marked one by one */
          const mk = S(38, 47, t);
          for (let i = 0; i < 22; i++) { const x = 40 + i * 19.5 + (i % 3) * 3, y = 188 - (i % 4) * 7; lib.person({ x, y, h: 11, k: S(33, 37, t), col: '#0a0810' }); const m = clamp(mk * 24 - i, 0, 1) * S(33, 37, t); if (m > 0.01) { lib.halo(x, y - 9, 8, hex('#ffe9a0'), 0.9 * m, 1); px.set(Math.round(x), Math.round(y - 9), hex('#ffffff')); } }
          px.post({ vignette: 1.1, fade: S(46.5, 53, t), fadeCol: hex('#000000'), flash: 1 - S(0, 1.5, t), flashCol: hex('#e8f0ff') });
          lib.titleCard(t, 'FOUR WINDS HELD', 26);
        },
      };
    },

    score(A, from) {
      const D2 = 73.42, D3 = 146.83, A3 = 220, D4 = 293.66, Fs4 = 369.99, A4 = 440, D5 = 587.33, Fs5 = 739.99, A5 = 880, D6 = 1174.66;
      A.drone(0, 54, D2, { gain: 0.05, attack: 2.0, release: 3.0 });
      A.choir(2, 22, [D3, A3, D4], { gain: 0.04, attack: 4.0, release: 3.0, vowel: 0.5 });
      [7, 8.6, 10.2, 11.8].forEach((t, i) => A.bell(t, [D5, A4, Fs5, A5][i], { gain: 0.05, dur: 7 }));
      A.noise({ t0: 6, t1: 21, gain: [[6, 0.0], [12, 0.025], [21, 0]], filter: { type: 'highpass', freq: 3000, q: 0.5 }, wet: 0.6, attack: 2, release: 2 });
      A.riser(21.3, 30, { f0: 200, f1: 2200, gain: 0.04 });
      A.brass(23, 37, D3, { gain: 0.05, attack: 2.0, release: 2.0, sweep: [[23, 500], [32, 1700]] });
      A.choir(22, 48, [D3, A3, D4, Fs4, A4], { gain: 0.06, attack: 3.0, release: 3.0, vowel: 1.0 });
      for (let i = 0; i < 22; i++) A.bell(38.5 + i * 0.4, [D5, Fs5, A5, D6][i % 4], { gain: 0.03, dur: 3 });
      A.shimmer(38, D6, { dur: 9, gain: 0.05 });
    },
  });
})();
