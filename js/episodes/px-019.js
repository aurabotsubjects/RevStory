/* ============================================================================
 *  REVELATION · PIXEL EDITION · Episode 19 · The Lamb Who Was Slain · Revelation 5:6–10
 *  2D pixel-art cut (480x200). In the centre before the throne a Lamb stands as if slain, with seven horns and seven eyes, in soft intimate light. It takes the scroll from the right hand of the One on the throne; a bloom of light. The creatures and elders fall with harps and golden bowls of incense; a new song rises from every tribe and language and people and nation; a kingdom and priests. No faces.
 * ========================================================================== */
(function () {
  'use strict';
  const Aura = window.Aura, px = Aura.px, lib = Aura.pxlib;
  const { W, H, clamp, lerp, sstep, hex, hexes, mix } = px;
  const S = sstep;
  const GOLDSKY = hexes(['#1a1008', '#3d2410', '#7a4a1a', '#b8802a', '#e8b04a', '#ffd987', '#fff3c8']);
  const ring = (cx, cy, r, ry, col, k) => { if (k <= 0.01) return; const N = Math.max(60, Math.round(r * 5)); for (let i = 0; i < N; i++) { const a = i / N * 6.2832; px.dpx(Math.round(cx + Math.cos(a) * r), Math.round(cy + Math.sin(a) * ry), col, k); } };
  function hall(t, glow, flash) {
    const U = px.cur();
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const dx = (x - 240) / 240, f = y / H;
      const v = 0.05 + 0.12 * f + glow * 0.34 * Math.exp(-dx * dx * 2.4 - Math.pow((y - 90) / 100, 2)) + 0.03 * px.fbm(x * 0.02, y * 0.04 + t * 0.03, 2, 8);
      U[y * W + x] = px.ramp(GOLDSKY, clamp(v + (flash || 0) * 0.4, 0, 1), x, y);
    }
  }

  Aura.define(19, {
    pixel: true,
    duration: 78,
    cues: [
      { ref: '5:6', t0: 5.0, t1: 25.0 },
      { ref: '5:7', t0: 26.0, t1: 33.8 },
      { ref: '5:8', t0: 35.0, t1: 50.2 },
      { ref: '5:9', t0: 51.0, t1: 66.2 },
      { ref: '5:10', t0: 67.0, t1: 73.4 },
    ],
    titles: [],

    build(ctx) {
      const ORDER = ['lion', 'ox', 'man', 'eagle'];
      const TRIBE = ['#e86a4a', '#f0b040', '#58c878', '#5aa0e8', '#b078e0', '#f08ab0', '#fff0c0'];
      return {
        render(t) {
          hall(t, 0.55 + 0.4 * S(26.4, 28.6, t), 0);
          const take = S(26.4, 28.6, t), kneel = S(35, 38.5, t);
          lib.sea({ t, y0: 152, cx: 240, glow: 0.5 + 0.4 * take, ripple: 0.3, k: 1 });
          lib.bigThrone({ cx: 240, by: 150, s: 0.85, k: 1, t, glow: 0.8 });
          const sx = lerp(318, 256, take), sy = lerp(84, 120, take), lk = S(2, 9, t);
          for (let i = 0; i < 4; i++) lib.creature({ kind: ORDER[i], x: 100 + i * 94 + (i > 1 ? 6 : 0), y: 112 + 16 * kneel, s: 0.9 * (1 - 0.12 * kneel), k: 0.95 * S(0, 3, t), t, eyes: 1, wing: 0.55 - 0.25 * kneel });
          for (let i = 0; i < 12; i++) lib.elder({ x: 44 + i * 36, y: 170, h: 18, k: S(0, 3, t) * 0.8, t, seed: i, kneel: clamp(kneel * 1.6 - i * 0.04, 0, 1), glow: 0.05 });
          const lz = 1.5 + 1.0 * S(4, 22, t) + 0.1 * take;
          lib.scroll({ x: lerp(318, 240, take), y: lerp(84, 54, take), w: lerp(86, 70, take), h: lerp(36, 30, take), k: S(2, 4, t), t, broken: 0, glow: 1 });
          lib.lamb({ x: 238, y: 168 - 6 * S(4, 22, t), s: lz, k: lk, t, glow: 0.9 + 0.6 * take, horns: S(10, 15, t), eyes: S(14, 19, t) });
          for (let i = 0; i < 4; i++) { const hk = S(36 + i * 0.6, 38 + i * 0.6, t); lib.harp({ x: 100 + i * 94 + 20, y: 146, s: 1.1, k: hk }); lib.bowl({ x: 100 + i * 94 - 14, y: 146, s: 1.1, k: hk, t, smoke: hk }); }
          const sk = S(51, 56, t) * (1 - S(66, 72, t));
          if (sk > 0.02) for (let i = 0; i < 220; i++) { const r1 = px.hash(i, 1, 99), r2 = px.hash(i, 2, 99), c = TRIBE[Math.floor(r1 * 7)], u = ((t * 0.12 * (0.6 + r2) + r1 * 3) % 1), x = Math.round(20 + r2 * 440 + Math.sin(t + i) * 2), y = Math.round(170 - u * 160); if (sk * (1 - u * 0.6) > px.thr(x, y)) { px.set(x, y, hex(c)); if (i % 5 === 0) px.set(x + 1, y, hex('#ffffff')); } }
          px.post({ vignette: 1.0, flash: Math.exp(-Math.max(0, t - 27.4) / 0.7) * (t > 27.4 ? 0.85 : 0) + (1 - S(0, 2, t)), flashCol: hex('#fff6dc') });
          const fh = S(70, 76, t); if (fh > 0.01) for (let i = 0; i < 160; i++) { const x = Math.round(px.hash(i, 1, 33) * W), y = 22 + Math.round(px.hash(i, 2, 33) * 56); if (fh * 0.8 > px.thr(x, y)) px.set(x, y, hex(i % 3 ? '#fff0c0' : '#b8d8ff')); }
          lib.titleCard(t, 'THE LAMB', 19);
        },
      };
    },

    score(A, from) {
      const D2 = 73.42, D3 = 146.83, A3 = 220, D4 = 293.66, Fs4 = 369.99, A4 = 440, D5 = 587.33, Fs5 = 739.99, A5 = 880, D6 = 1174.66;
      A.drone(0, 78, D2, { gain: 0.06, attack: 2.0, release: 3.0 });
      A.choir(3, 26, [A3, D4, Fs4], { gain: 0.04, attack: 4.0, release: 2.5, vowel: 0.6 });
      [Fs5, A5, D6].forEach((f, i) => A.bell(8 + i * 3.5, f, { gain: 0.05, dur: 6 }));
      A.shimmer(26.4, D6, { dur: 9, gain: 0.09 }); A.boom(26.6, { freq: 48, gain: 0.45, dur: 4 }); A.bell(26.6, D5, { gain: 0.12, dur: 8 });
      A.choir(26.5, 52, [D3, A3, D4, Fs4, A4, D5], { gain: 0.08, attack: 1.5, release: 3.0, vowel: 1.1 });
      for (let i = 0; i < 8; i++) A.bell(36 + i * 1.8, [D5, Fs5, A5, D6][i % 4], { gain: 0.05, dur: 5 });
      A.choir(51, 70, [D3, A3, D4, Fs4, A4, D5, Fs5, A5], { gain: 0.1, attack: 2.0, release: 3.0, vowel: 1.3 });
      A.brass(52, 68, D3, { gain: 0.055, attack: 2.0, release: 2.5, sweep: [[52, 600], [64, 2000]] });
      A.shimmer(58, A5, { dur: 8, gain: 0.07 });
      A.noise({ t0: 70, t1: 78, gain: [[70, 0], [76, 0.035], [78, 0]], filter: { type: 'bandpass', freq: 1400, q: 0.7 }, wet: 0.7, attack: 2, release: 2 });
    },
  });
})();
