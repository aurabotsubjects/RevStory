/* ============================================================================
 *  REVELATION · PIXEL EDITION · Episode 30 · Silence in Heaven · Revelation 8:1–6
 *  2D pixel-art cut (480x200). The seventh seal opens, and then nearly eight seconds of complete stillness and silence in heaven, the only motion a drifting particle. Seven angels are given seven trumpets. Another angel with a golden censer is given incense to offer with the prayers of the people of God; the smoke rises before God. He fills the censer with fire from the altar and hurls it to the earth: thunder, rumblings, lightning, an earthquake. The seven angels prepare to sound. No faces.
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

  Aura.define(30, {
    pixel: true,
    duration: 76,
    cues: [
      { ref: '8:1', t0: 5.0, t1: 11.4 },
      { ref: '8:2', t0: 20.0, t1: 26.4 },
      { ref: '8:3', t0: 27.5, t1: 43.4 },
      { ref: '8:4', t0: 44.5, t1: 52.6 },
      { ref: '8:5', t0: 53.5, t1: 65.0 },
      { ref: '8:6', t0: 66.0, t1: 71.0 },
    ],
    titles: [],

    build(ctx) {
      const SIL0 = 11.6, SIL1 = 19.6;
      const trump = (x, y, s, k, up) => { const a = -0.25 - 0.9 * up; const L = 22 * s, ex = x + Math.cos(a) * L, ey = y + Math.sin(a) * L; if (k <= 0.01) return; lib.line(x, y, ex, ey, hex('#ffd070'), 1); lib.line(ex - 2, ey - 3, ex + 3, ey + 3, hex('#fff0a0'), 1); lib.halo(ex, ey, 8 * s, hex('#ffe9a0'), 0.5 * k * up, 1); };
      return {
        render(t) {
          const U = px.cur(), still = t > SIL0 && t < SIL1;
          bg(t, 0.55, 0);
          const tt = still ? SIL0 : t;
          /* the seventh seal: the scroll, the last wax gone */
          if (t < 20) { const sk = 1 - S(SIL0 + 4, SIL1, t); lib.scroll({ x: 240, y: 96, w: 190, h: 76, k: sk * S(0, 2, t), t: SIL0, broken: 6 + S(5.2, 7, t), glow: 1 }); }
          lib.sea({ t: tt, y0: 158, cx: 240, glow: 0.4, ripple: 0, k: 1 });
          /* silence: one drifting particle, nothing else */
          if (still) { const u = (t - SIL0) / (SIL1 - SIL0); lib.halo(240 + Math.sin(u * 3) * 60, 110 - u * 40, 6, hex('#fff0c8'), 0.9, 1); px.set(Math.round(240 + Math.sin(u * 3) * 60), Math.round(110 - u * 40), hex('#ffffff')); }
          /* the seven angels and their trumpets, in perfect formation */
          const ak = S(20, 24, t) * (1 - S(62, 63, t) * 0.0), up = S(64, 69, t);
          for (let i = 0; i < 7; i++) { const x = 60 + i * 60, y = 84 - Math.abs(i - 3) * 5; lib.lightFig({ x, y: y + 34, h: 36, a: ak, t, seed: i, sway: 0.2, glow: 0.9 }); lib.wings({ x, y: y + 6, s: 0.9, k: ak * 0.8, t, spread: 0.5, eyes: 0, n: 2 }); trump(x + 6, y + 14, 1.1, ak, 0.2 + 0.8 * up); }
          /* the golden altar, the censer-angel, the incense rising slowly */
          const ck = S(27.5, 31, t) * (1 - S(60, 64, t));
          lib.altar2({ cx: 240, by: 194, w: 70, h: 22, k: ck, t, glow: 1, fire: S(53, 56, t) * 0.9 * ck });
          lib.lightFig({ x: 240, y: 168, h: 50, a: ck, t, seed: 3, sway: 0.3, glow: 1.1 });
          lib.bowl({ x: 266, y: 150, s: 1.6, k: ck, t: t * 0.5, smoke: S(33, 40, t) * ck });
          if (t > 36 && t < 56) for (let i = 0; i < 40; i++) { const u = ((t - 36) * 0.07 + i / 40) % 1, x = 262 + Math.sin(u * 8 + i) * (4 + u * 16), y = 138 - u * 130; px.dpx(Math.round(x), Math.round(y), hex('#fff0d0'), (1 - u) * 0.8 * S(36, 44, t)); }
          /* the censer filled with fire and hurled to the earth like a comet; thunder, lightning, earthquake */
          const hu = (t - 56.5) / 5.5;
          if (hu > 0 && hu < 1) { const X = lerp(262, 340, hu), Y = lerp(140, 190, hu * hu); for (let q = 0; q < 22; q++) lib.halo(X - q * 3, Y - q * 2 * (1 - hu) - q, 7 - q * 0.25, hex(q < 5 ? '#fff6d0' : '#ff8a30'), 0.7 * (1 - q / 22), 1); }
          const fl = Math.exp(-Math.max(0, t - 62) / 0.4) * (t > 62 ? 1 : 0), eq = fl * 3;
          px.post({ vignette: 1.0, flash: fl * 0.8, flashCol: hex('#fff0d0'), fade: still ? 0.0 : S(0, 1.5, t) < 1 ? 1 - S(0, 1.5, t) : 0, fadeCol: hex('#000000') });
          shake(Math.round(Math.sin(t * 61) * eq), Math.round(Math.sin(t * 47) * eq));
          lib.titleCard(t, 'SILENCE', 30);
        },
      };
    },

    score(A, from) {
      const D2 = 73.42, D3 = 146.83, A3 = 220, D4 = 293.66, Fs4 = 369.99, A4 = 440, D5 = 587.33, Fs5 = 739.99, A5 = 880, D6 = 1174.66;
      /* silence in heaven, almost eight seconds with no sound at all, 11.6 to 19.6 */
      A.drone(0, 11.5, D2, { gain: 0.06, attack: 1.0, release: 0.6 });
      A.choir(0, 11.5, [D3, A3], { gain: 0.04, attack: 2.0, release: 0.6, vowel: 0.5 });
      A.boom(5.4, { freq: 44, gain: 0.4, dur: 3 }); A.bell(5.5, D5, { gain: 0.06, dur: 5 });
      A.drone(19.8, 76, D2, { gain: 0.05, attack: 3.0, release: 3.0 });
      A.brass(20, 27, D3, { gain: 0.05, attack: 0.5, release: 1.5, sweep: [[20, 500], [24, 1400]] });
      for (let i = 0; i < 7; i++) A.bell(22 + i * 0.6, [D5, Fs5, A5, D6, A5, Fs5, D5][i], { gain: 0.05, dur: 4 });
      A.choir(27.5, 54, [D3, A3, D4, Fs4], { gain: 0.05, attack: 4.0, release: 3.0, vowel: 0.7 });
      A.shimmer(36, A5, { dur: 12, gain: 0.04 });
      A.boom(56.6, { freq: 56, gain: 0.3, dur: 2.5 });
      A.noise({ t0: 61.5, t1: 66, gain: [[61.5, 0.2], [66, 0]], filter: { type: 'lowpass', freq: 600, q: 1 }, wet: 0.4, attack: 0.02, release: 2 });
      [62, 63.4, 64.4].forEach((t, i) => A.boom(t, { freq: 42 - i * 4, gain: 0.55, dur: 3.5 }));
      A.choir(66, 76, [D3, A3, D4, Fs4, A4], { gain: 0.07, attack: 1.5, release: 3.0, vowel: 1.1 });
      A.brass(66, 72, D3, { gain: 0.05, attack: 1.5, release: 2.0, sweep: [[66, 500], [70, 1800]] });
    },
  });
})();
