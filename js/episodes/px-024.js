/* ============================================================================
 *  REVELATION · PIXEL EDITION · Episode 24 · The Sky Rolls Up · Revelation 6:12–14
 *  2D pixel-art cut (480x200). The sixth seal: a great earthquake, the sun black as sackcloth, the whole moon blood red; stars fall like figs shaken from a tree; the sky recedes like a scroll rolling up, and every mountain and island is moved from its place. The biggest effects of the series so far. No faces.
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

  Aura.define(24, {
    pixel: true,
    duration: 46,
    cues: [
      { ref: '6:12', t0: 5.0, t1: 17.0 },
      { ref: '6:13', t0: 18.5, t1: 28.5 },
      { ref: '6:14', t0: 30.0, t1: 39.5 },
    ],
    titles: [],

    build(ctx) {
      return {
        render(t) {
          const U = px.cur(), q = S(5, 6, t) * (1 - S(40, 45, t)), roll = S(30, 38, t), sink = S(33, 41, t);
          const eY = Math.round(lerp(-30, 168, 1 - roll));          /* the edge of the sky as it rolls up */
          /* behind the sky: a gold light, heaven */
          for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) U[y * W + x] = px.ramp(GOLDSKY, clamp(0.62 + 0.3 * (1 - y / H) + 0.2 * Math.exp(-Math.pow((x - 240) / 200, 2)), 0, 1), x, y);
          /* the sky itself, pulled upward */
          const sunBlack = S(5, 8, t), moonRed = S(8, 12, t);
          for (let y = 0; y < Math.min(H, eY); y++) for (let x = 0; x < W; x++) { const f = y / 160; let col = mix(mix(hex('#0a0c24'), hex('#2a2850'), f), hex('#000000'), 0.5 * sunBlack); if (px.fbm(x * 0.012 - t * 0.04, y * 0.05, 3, 17) > 0.62) col = mix(col, hex('#5a5878'), 0.4); U[y * W + x] = col; }
          for (let d = 0; d < 9; d++) for (let x = 0; x < W; x++) { const y = eY + d; if (y >= 0 && y < H) U[y * W + x] = mix(hex('#e8e0f4'), hex('#0a0c24'), d / 8); }
          /* stars, then stars falling like figs in a gale */
          const fall = S(18, 30, t);
          for (let i = 0; i < 120; i++) { const x0 = px.hash(i, 1, 51) * W, y0 = px.hash(i, 2, 51) * 130, st = px.hash(i, 3, 51) * 10, u = clamp((t - 18 - st * 0.9) / 3.5, 0, 1); const X = Math.round(x0 - u * 90 * (0.6 + px.hash(i, 4, 51)) + Math.sin(t * 3 + i) * 1.5), Y = Math.round(y0 + u * u * 160); if (Y >= 0 && Y < eY && X >= 0 && X < W) { px.set(X, Y, hex('#ffffff')); if (u > 0.05) for (let tr = 1; tr < 6; tr++) px.dpx(X + tr, Y - Math.round(tr * 0.6), hex('#c8d4ff'), 1 - tr / 6); } }
          /* the sun, black like sackcloth, with a thin corona */
          if (eY > 60) { lib.halo(120, 54, 54, hex('#7a7a98'), 0.45 * sunBlack, 1); lib.ell(120, 54, 22, 22, (X, Y) => px.set(X, Y, hex('#020204'))); ring(120, 54, 23, 23, hex('#8a8aa8'), 0.8 * sunBlack); }
          if (eY > 50) { const mk = moonRed; lib.ell(350, 44, 16, 16, (X, Y, dx, dy) => { if (mk > px.thr(X, Y)) px.set(X, Y, px.ramp(lib.REDH, clamp(0.55 - 0.25 * dx - 0.1 * dy, 0, 1), X, Y)); }); lib.halo(350, 44, 40, hex('#ff4020'), 0.35 * mk, 1); }
          /* the land: mountains and islands move out of their places */
          const ls = (o) => lib.land(Object.assign({}, o, { y0: o.y0 + sink * 90 }));
          ls({ y0: 120, amp: 30, c1: '#3a3a4c', c2: '#14141e', seed: 5, scroll: Math.sin(t * 2) * 0.01 + t * 0.012 * S(5, 40, t), freq: 0.011, k: 1 });
          ls({ y0: 146, amp: 14, c1: '#2a2c38', c2: '#0c0c14', seed: 9, scroll: t * 0.02, freq: 0.02, k: 1 });
          lib.sea({ t, y0: 166 + Math.round(sink * 20), cx: 240, glow: 0.1, ripple: 0.8 * q, k: 1 });
          const eq = q * (2.6 + 1.5 * S(10, 14, t) * 0 + 1.5 * (1 - S(5, 6.4, t)) + 0.8 * S(30, 34, t));
          shake(Math.round(Math.sin(t * 61) * eq), Math.round(Math.sin(t * 47 + 1) * eq * 0.7));
          px.post({ vignette: 1.0, flash: Math.exp(-Math.max(0, t - 5) / 0.3) * (t > 5 ? 0.85 : 0) * 0.8, flashCol: hex('#e8e0ff'), fade: S(41, 46, t), fadeCol: hex('#000000') });
          lib.titleCard(t, 'THE SKY ROLLS UP', 24);
        },
      };
    },

    score(A, from) {
      const D2 = 73.42, D3 = 146.83, A3 = 220, D4 = 293.66, Fs4 = 369.99, A4 = 440, D5 = 587.33, Fs5 = 739.99, A5 = 880, D6 = 1174.66;
      A.drone(0, 46, D2, { gain: 0.06, attack: 1.0, release: 3.0 });
      A.boom(5, { freq: 38, gain: 0.7, dur: 6 });
      A.noise({ t0: 5, t1: 18, gain: [[5, 0.2], [14, 0.12], [18, 0.04]], filter: { type: 'lowpass', freq: 380, q: 1 }, wet: 0.4, attack: 0.05, release: 3 });
      for (let i = 0; i < 6; i++) A.boom(7 + i * 2.1, { freq: 42, gain: 0.32, dur: 2.4 });
      A.choir(6, 30, [D3, A3, Fs4 * 0.94], { gain: 0.05, attack: 3.0, release: 2.0, vowel: 0.4 });
      for (let i = 0; i < 26; i++) A.bell(19 + i * 0.4, [D5, A5, D6, Fs5, A5][i % 5] * 1.0, { gain: 0.035, dur: 2.5 });
      A.riser(29.5, 38, { f0: 100, f1: 2600, gain: 0.07 });
      A.boom(30, { freq: 44, gain: 0.5, dur: 6 });
      A.noise({ t0: 30, t1: 40, gain: [[30, 0.1], [36, 0.18], [40, 0]], filter: { type: 'bandpass', freq: 700, q: 0.7 }, wet: 0.5, attack: 0.5, release: 2 });
      A.drone(38, 46, D2, { gain: 0.04, attack: 1.0, release: 3.0 });
    },
  });
})();
