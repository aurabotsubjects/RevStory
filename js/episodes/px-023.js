/* ============================================================================
 *  REVELATION · PIXEL EDITION · Episode 23 · How Long, Sovereign Lord? · Revelation 6:9–11
 *  2D pixel-art cut (480x200). Solemn. A low camera under a great golden altar; the souls of those slain for the word of God, as soft forms of light. They cry out "How long?" Each is given a white robe that unfurls slowly; told to wait a little longer. The gentlest, most reverent mood after the violence. The hand of the Lamb moves to the sixth seal. No faces.
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

  Aura.define(23, {
    pixel: true,
    duration: 56,
    cues: [
      { ref: '6:9', t0: 5.0, t1: 18.6 },
      { ref: '6:10', t0: 20.0, t1: 31.2 },
      { ref: '6:11', t0: 32.5, t1: 48.5 },
    ],
    titles: [],

    build(ctx) {
      const SOULS = 11;
      const soul = (i, t, k, robe) => {
        const x = 70 + i * 34 + (px.hash(i, 1, 5) - 0.5) * 12, base = 170 - (i % 3) * 6, rise = Math.sin(t * 0.8 + i) * 2;
        lib.halo(x, base - 18 + rise, 26, hex('#fff0d0'), 0.35 * k, 1);
        if (robe > 0.01) { const rh = 34 * robe; for (let j = 0; j < rh; j++) { const w2 = 3 + j * 0.16 + Math.sin(t * 1.2 + i + j * 0.2) * 0.7; for (let xx = -w2; xx <= w2; xx++) { const X = Math.round(x + xx), Y = Math.round(base - 30 + rise + j); if (k > px.thr(X, Y)) px.set(X, Y, px.ramp(lib.WHITE, clamp(0.55 + 0.4 * (1 - j / rh) + 0.1 * xx / w2, 0, 1), X, Y)); } } }
        lib.lightFig({ x, y: base + rise, h: 34, a: k * (1 - 0.5 * robe), t, seed: i, sway: 0.4, glow: 0.8 });
      };
      return {
        render(t) {
          const U = px.cur(), K = S(1, 5, t), cry = S(20, 22, t) * (1 - S(31, 33, t)), rb = S(33, 44, t);
          bg(t, 0.2 + 0.4 * cry + 0.4 * rb, 0);
          /* the great altar seen from below: a vast golden underside, horns at its corners, fire glowing along the top edge */
          for (let y = 0; y < 78; y++) for (let x = 0; x < W; x++) { const f = y / 78; px.set(x, y, px.ramp(lib.HONEY, clamp(0.5 - 0.35 * f + 0.1 * px.fbm(x * 0.03, y * 0.1, 2, 7), 0, 1), x, y)); }
          for (const hx of [14, 466]) for (let y = 78; y < 100; y++) for (let w2 = -5; w2 <= 5; w2++) { const ww = 5 - (y - 78) * 0.22; if (Math.abs(w2) <= ww) px.set(hx + w2, y, px.ramp(lib.HONEY, 0.5 - 0.1 * (y - 78) / 22, hx + w2, y)); }
          lib.halo(240, 0, 200, hex('#ffd890'), 0.35 + 0.3 * rb, 0.6);
          lib.sea({ t, y0: 158, cx: 240, glow: 0.3, ripple: 0, k: 1 });
          for (let i = 0; i < SOULS; i++) soul(i, t, K * S(i * 0.12, i * 0.12 + 1.2, t - 3), clamp((rb * 11 - i) * 0.5, 0, 1));
          for (let r = 0; r < 3; r++) { const u = (t - 21 - r * 2.4) / 5; if (u > 0 && u < 1) ring(240, 120, u * 380, u * 90, hex('#fff0c8'), (1 - u) * 0.6); }
          lib.motes({ x0: 40, x1: 440, y0: 80, y1: 170, t, k: 0.5 * K, n: 60, speed: 6, dir: -1 });
          if (t > 44) { const hk = S(44, 48, t); lib.halo(240, 100, 80 * hk, hex('#fff6d0'), 0.4 * hk, 1); lib.scroll({ x: 240, y: 100, w: 150, h: 60, k: hk, t, broken: 5 + 0.3 * Math.sin(t * 3) * 0 + 0.0, glow: 1 }); lib.halo(240 + 55, 100 + 31, 18, hex('#ff8a50'), 0.8 * hk * (0.6 + 0.4 * Math.sin(t * 5)), 1); }
          px.post({ vignette: 1.2, fade: 1 - S(0, 2, t), fadeCol: hex('#000000') });
          lib.titleCard(t, 'HOW LONG?', 23);
        },
      };
    },

    score(A, from) {
      const D2 = 73.42, D3 = 146.83, A3 = 220, D4 = 293.66, Fs4 = 369.99, A4 = 440, D5 = 587.33, Fs5 = 739.99, A5 = 880, D6 = 1174.66;
      A.drone(0, 56, D2, { gain: 0.055, attack: 2.0, release: 3.0 });
      A.choir(1, 33, [A3, D4, Fs4], { gain: 0.04, attack: 4.0, release: 3.0, vowel: 0.5 });
      A.bell(6, A4, { gain: 0.05, dur: 8 }); A.bell(11, Fs4, { gain: 0.05, dur: 8 }); A.bell(15, D4, { gain: 0.05, dur: 8 });
      A.choir(20, 33, [D4, Fs4, A4, D5], { gain: 0.05, attack: 1.5, release: 3.0, vowel: 0.9 });
      A.shimmer(33, D6, { dur: 10, gain: 0.05 });
      A.choir(33, 50, [D3, A3, D4, Fs4, A4], { gain: 0.07, attack: 3.0, release: 3.0, vowel: 1.1 });
      A.boom(44, { freq: 52, gain: 0.3, dur: 3 }); A.bell(44.2, D5, { gain: 0.08, dur: 6 });
      A.drone(48, 56, D2, { gain: 0.06, attack: 1.0, release: 3.0 });
    },
  });
})();
