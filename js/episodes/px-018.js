/* ============================================================================
 *  REVELATION · PIXEL EDITION · Episode 18 · The Scroll Nobody Could Open · Revelation 5:1–5
 *  2D pixel-art cut (480x200). A huge scroll in the right hand of the One on the throne, written on both sides and sealed with seven seals. A mighty angel asks who is worthy. No one in heaven, on earth or under the earth. A small figure of John in the vast hall, weeping; the hand of an elder on his shoulder; the Lion has triumphed. No faces.
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

  Aura.define(18, {
    pixel: true,
    duration: 66,
    cues: [
      { ref: '5:1', t0: 5.0, t1: 15.0 },
      { ref: '5:2', t0: 16.0, t1: 24.8 },
      { ref: '5:3', t0: 26.0, t1: 35.6 },
      { ref: '5:4', t0: 37.0, t1: 44.6 },
      { ref: '5:5', t0: 46.0, t1: 59.6 },
    ],
    titles: [],

    build(ctx) {
      function hand(cx, cy, k) {
        const SKIN = hexes(['#140c10', '#3a2420', '#6a4630', '#a8744a', '#e0a870', '#ffd9a0', '#fff0d0']);
        for (let y = cy - 14; y <= cy + 30; y++) for (let x = cx - 70; x <= cx + 22; x++) {
          const dx = x - cx, dy = y - cy, palm = dx > -48 && dx < 20 && Math.abs(dy - 4) < 15 - 0.1 * Math.abs(dx + 14), fing = dx > -2 && dx < 20 && dy >= 14 && dy < 30 && (dy - 14) % 5 !== 4;
          if (!(palm || fing) || k <= px.thr(x, y)) continue;
          px.set(x, y, px.ramp(SKIN, clamp(0.55 + 0.25 * (dx / 40) - 0.15 * (dy / 15) + 0.06 * px.hash(x >> 1, y >> 1, 3), 0, 1), x, y));
        }
        for (let x = cx - 120; x <= cx - 40; x++) for (let y = cy - 4; y <= cy + 14; y++) { const f = (x - (cx - 120)) / 80; if (k > px.thr(x, y)) px.set(x, y, px.ramp(SKIN, clamp(0.35 + 0.35 * f, 0, 1), x, y)); }
      }
      return {
        render(t) {
          const U = px.cur();
          if (t < 16) {
            hall(t, 0.8, 0); const k = S(0.5, 3, t), z = 1 + 0.12 * S(0, 14, t);
            lib.bigThrone({ cx: 150, by: 190, s: 1.0, k: 0.5 * k, t, glow: 0.6 });
            lib.halo(226, 100, 60, hex('#fff0c0'), 0.8 * k, 1);
            lib.scroll({ x: 296, y: 98, w: 120 * z, h: 52 * z, k, t, broken: 0, glow: 0.9 });
            px.post({ vignette: 1.0, flash: 1 - S(0, 2, t), flashCol: hex('#fff6dc') });
          } else if (t < 37) {
            const sil = S(25.4, 27, t); hall(t, 0.5 * (1 - 0.7 * sil), 0);
            const ak = S(16, 18, t) * (1 - S(24.8, 26.5, t));
            lib.halo(240, 70, 110, hex('#fff0c0'), 0.6 * ak, 1);
            lib.wings({ x: 240, y: 78, s: 2.2, k: ak, t, spread: 0.8, eyes: 0, n: 4 });
            lib.lightFig({ x: 240, y: 126, h: 70, a: ak, t, seed: 4, sway: 0.5, glow: 1.2 });
            for (let r = 0; r < 3; r++) { const u = (t - 18 - r * 1.8) / 4.5; if (u > 0 && u < 1) ring(240, 74, u * 330, u * 110, hex('#ffe9a0'), (1 - u) * 0.8); }
            for (let i = 0; i < 3; i++) { const u = (t - (26.4 + i * 2.8)) / 3.6; if (u > 0 && u < 1) { const yy = 50 + i * 55; ring(240, yy, u * 240, u * 24, hex('#7a82aa'), (1 - u) * 0.7); } }
            px.post({ vignette: 1.0 + 0.4 * sil, fade: sil * 0.35, fadeCol: hex('#04050e') });
          } else if (t < 46) {
            hall(t, 0.12, 0);
            for (let i = 0; i < 6; i++) { const x = 40 + i * 80; for (let y = 20; y < 170; y++) px.dpx(x, y, hex('#3a3050'), 0.2); }
            lib.sea({ t, y0: 160, cx: 240, glow: 0.12, ripple: 0, k: 1 });
            lib.robed({ U, h: 26, x: 240, y: 174, a: 1, t, seed: 2, glow: 0, lean: 3 });
            for (let i = 0; i < 14; i++) { const u = ((t * 0.7 + i * 0.37) % 1), x = 238 + (px.hash(i, 1, 5) - 0.5) * 6, y = 150 + u * 24; px.dpx(Math.round(x), Math.round(y), hex('#b8d8ff'), 1 - u); }
            px.post({ vignette: 1.3 });
          } else {
            const lk = S(52, 54.5, t); hall(t, 0.12 + 0.7 * lk, 0);
            lib.sea({ t, y0: 160, cx: 240, glow: 0.12 + 0.5 * lk, ripple: 0, k: 1 });
            lib.robed({ U, h: 26, x: 218, y: 174, a: 1, t, seed: 2, glow: 0, lean: 2 * (1 - lk) });
            lib.elder({ x: 262, y: 174, h: 34, k: S(46, 48, t), t, seed: 6, glow: 0.4 });
            lib.creature({ kind: 'lion', x: 240, y: 76, s: 1.7, k: lk, t, eyes: 0.3, wing: 0.1 });
            lib.halo(240, 80, 130, hex('#fff6d0'), 0.8 * lk, 1);
            lib.motes({ x0: 100, x1: 380, y0: 20, y1: 170, t, k: 0.7 * lk, n: 60, speed: 8, dir: -1 });
            px.post({ vignette: 1.0, flash: Math.exp(-Math.max(0, t - 52.4) / 0.4) * (t > 52.4 ? 0.7 : 0), flashCol: hex('#fff0c8') });
          }
          lib.titleCard(t, 'THE SEALED SCROLL', 18);
        },
      };
    },

    score(A, from) {
      const D2 = 73.42, D3 = 146.83, A3 = 220, D4 = 293.66, Fs4 = 369.99, A4 = 440, D5 = 587.33, Fs5 = 739.99, A5 = 880, D6 = 1174.66;
      A.drone(0, 66, D2, { gain: 0.06, attack: 2.0, release: 3.0 });
      A.choir(0.5, 16, [D3, A3, D4, Fs4], { gain: 0.06, attack: 3.0, release: 2.0, vowel: 0.9 });
      [6, 6.7, 7.4, 8.1, 8.8, 9.5, 10.2].forEach((t, i) => A.bell(t, [D5, Fs5, A5, D6, A5, Fs5, D5][i], { gain: 0.05, dur: 4 }));
      A.brass(16.4, 25, D3, { gain: 0.06, attack: 0.5, release: 2.0, sweep: [[16.4, 500], [22, 1700]] });
      A.boom(16.6, { freq: 70, gain: 0.35, dur: 2.5 });
      A.noise({ t0: 26, t1: 36, gain: [[26, 0.03], [36, 0]], filter: { type: 'lowpass', freq: 300, q: 1 }, wet: 0.8, attack: 1, release: 2 });
      A.choir(37, 46, [A3, D4], { gain: 0.025, attack: 2.0, release: 2.0, vowel: 0.3 });
      A.bell(38, A4, { gain: 0.04, dur: 6 }); A.bell(41.5, Fs4, { gain: 0.04, dur: 6 });
      A.boom(52.4, { freq: 46, gain: 0.5, dur: 4 });
      A.brass(52, 62, D3, { gain: 0.07, attack: 0.6, release: 3.0, sweep: [[52, 700], [58, 2000]] });
      A.choir(52, 66, [D3, A3, D4, Fs4, A4, D5], { gain: 0.08, attack: 1.2, release: 3.0, vowel: 1.2 });
      A.shimmer(52.4, D6, { dur: 8, gain: 0.07 });
    },
  });
})();
