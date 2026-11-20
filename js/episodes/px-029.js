/* ============================================================================
 *  REVELATION · PIXEL EDITION · Episode 29 · Out of the Great Tribulation · Revelation 7:13–17
 *  2D pixel-art cut (480x200). An elder asks John who these in white are; John answers "Sir, you know." They have come out of the great tribulation and washed their robes white in the blood of the Lamb; they serve before the throne day and night; the One on the throne spreads His shelter over them. They will never hunger or thirst; the Lamb is their shepherd, leads them to springs of living water; God wipes away every tear. No faces.
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

  Aura.define(29, {
    pixel: true,
    duration: 70,
    cues: [
      { ref: '7:13', t0: 5.0, t1: 15.4 },
      { ref: '7:14', t0: 16.5, t1: 29.5 },
      { ref: '7:15', t0: 30.5, t1: 42.0 },
      { ref: '7:16', t0: 43.0, t1: 50.2 },
      { ref: '7:17', t0: 51.5, t1: 64.0 },
    ],
    titles: [],

    build(ctx) {
      return {
        render(t) {
          const U = px.cur(), wash = S(20, 29, t), shelter = S(32, 40, t), spring = S(52, 60, t), tear = S(58, 62.5, t);
          bg(t, 0.35 + 0.4 * shelter + 0.3 * spring, 0);
          lib.sea({ t, y0: 150, cx: 240, glow: 0.3 + 0.4 * spring, ripple: 0.3 * spring, k: 1 });
          /* the One on the throne spreading a shelter: a vast soft canopy of light over the white-robed */
          lib.halo(240, 20, 260 * shelter, hex('#fff0c0'), 0.5 * shelter, 0.7);
          for (let i = 0; i < 90; i++) { const a = Math.PI * (0.05 + 0.9 * i / 89), r = 220, X = Math.round(240 + Math.cos(a) * r), Y = Math.round(150 - Math.sin(a) * r * 0.55); if (shelter * 0.9 > px.thr(X, Y)) px.set(X, Y, hex('#ffe9a0')); }
          /* the white-robed crowd; their robes pass from stained to white */
          for (let r = 3; r >= 0; r--) for (let c = 0; c < 18; c++) { const x = 40 + c * 24 + (r % 2) * 10, y = 176 - r * 8, h = 22 - r * 2, w3 = wash * wash, ch = (a0, a1, a2) => Math.round(lerp(lerp(a0, a1, wash), a2, w3)); lib.person({ x, y, h, k: S(6, 10, t), col: '#' + [ch(138, 200, 255), ch(36, 180, 246), ch(24, 160, 232)].map((v) => ('0' + v.toString(16)).slice(-2)).join(''), arms: 0.2 * S(40, 50, t) }); }
          /* the elder and John, in front, small */
          lib.elder({ x: 360, y: 186, h: 34, k: S(1, 4, t) * (1 - S(18, 21, t)), t, seed: 6, glow: 0.5 });
          lib.robed({ U, h: 28, x: 400, y: 186, a: S(1, 4, t) * (1 - S(18, 21, t)), t, seed: 2, glow: 0 });
          /* the Lamb shepherds them: He leads them down to springs of living water */
          const lk = S(51, 55, t);
          lib.lamb({ x: 150 + 90 * S(52, 62, t), y: 160, s: 1.0, k: lk, t, glow: 1.2, horns: 1, eyes: 1 });
          if (spring > 0.01) for (let y = 150; y < H; y++) for (let x = 30; x < W - 30; x++) { const f = Math.sin(x * 0.07 + y * 0.2 - t * 2) * 0.5 + 0.5; if (spring * 0.4 * f > px.thr(x, y)) px.blend ? px.blend(x, y, hex('#a8f0ff'), 0.5) : 0; }
          /* a tear, and it is wiped away */
          if (tear > 0.01) { const tx = 240, ty = 70 + 60 * Math.pow(S(58, 61, t), 1.4); const ta = 1 - S(61, 62.5, t); lib.halo(tx, ty, 14, hex('#c8e8ff'), 0.7 * ta, 1); lib.ell(tx, ty, 2, 3, (X, Y) => { if (ta > px.thr(X, Y)) px.set(X, Y, hex('#ffffff')); }); const hx = lerp(200, 280, S(60.5, 62.5, t)); lib.halo(hx, 100, 32 * S(60, 61.5, t), hex('#fff6d0'), 0.8 * S(60, 61.5, t) * (1 - S(63, 64, t)), 1); }
          px.post({ vignette: 1.1, flash: 1 - S(0, 1.5, t), flashCol: hex('#fff6dc'), fade: S(66, 70, t), fadeCol: hex('#000000') });
          lib.titleCard(t, 'WASHED WHITE', 29);
        },
      };
    },

    score(A, from) {
      const D2 = 73.42, D3 = 146.83, A3 = 220, D4 = 293.66, Fs4 = 369.99, A4 = 440, D5 = 587.33, Fs5 = 739.99, A5 = 880, D6 = 1174.66;
      A.drone(0, 70, D2, { gain: 0.055, attack: 2.0, release: 3.0 });
      A.choir(3, 52, [D3, A3, D4, Fs4], { gain: 0.05, attack: 4.0, release: 3.0, vowel: 0.8 });
      A.bell(6, A4, { gain: 0.05, dur: 7 }); A.bell(13.5, D5, { gain: 0.05, dur: 7 });
      A.shimmer(20, D6, { dur: 10, gain: 0.05 });
      A.choir(30, 66, [D3, A3, D4, Fs4, A4, D5], { gain: 0.07, attack: 4.0, release: 4.0, vowel: 1.1 });
      A.noise({ t0: 52, t1: 64, gain: [[52, 0.0], [58, 0.03], [64, 0]], filter: { type: 'bandpass', freq: 3000, q: 0.5 }, wet: 0.8, attack: 2, release: 2 });
      for (let i = 0; i < 10; i++) A.bell(52 + i * 1.2, [D5, Fs5, A5, D6, A5][i % 5], { gain: 0.03, dur: 4 });
      A.bell(60.5, A5, { gain: 0.07, dur: 8 });
    },
  });
})();
