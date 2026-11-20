/* ============================================================================
 *  REVELATION · PIXEL EDITION · Episode 28 · A Great Multitude · Revelation 7:9–12
 *  2D pixel-art cut (480x200). A crane-up from a single figure in a white robe with a palm branch, pulling back to reveal a sea of people no one can count, from every nation, all in white with palms, before the throne and the Lamb. Salvation belongs to our God. All the angels, elders and creatures fall and worship; the sevenfold amen. No faces.
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

  Aura.define(28, {
    pixel: true,
    duration: 60,
    cues: [
      { ref: '7:9', t0: 5.0, t1: 22.8 },
      { ref: '7:10', t0: 24.0, t1: 32.5 },
      { ref: '7:11', t0: 33.5, t1: 44.5 },
      { ref: '7:12', t0: 45.5, t1: 53.0 },
    ],
    titles: [],

    build(ctx) {
      const SKIN = ['#f4eee0', '#e8d8b0', '#e8c8a0', '#d8b088', '#c89868', '#a87850', '#8a5a38', '#6a4028'];
      const crowd = (z, cx, baseY, k, t) => {
        const uu = S(5, 22, t), RR = Math.round(33 * Math.pow(uu, 1.4)), CC = Math.round(30 * Math.pow(uu, 1.2));
        for (let r = 0; r <= RR; r++) for (let c = -CC; c <= CC; c++) {
          const wy = r, wx = c * 17 + (r % 2) * 8, sx = cx + wx * z / (1 + wy * 0.05), sy = baseY - wy * 5.2 * z / (1 + wy * 0.08);
          if (sx < -12 || sx > W + 12 || sy < 40 || sy > H + 20) continue;
          const sc = z / (1 + wy * 0.06), h = 20 * sc; if (h < 2) continue;
          { const sh = clamp(r / 34 * 0.75 + (px.hash(c + 40, r, 3) - 0.5) * 0.35, 0, 0.85), ch = (v) => Math.round(lerp(v, 90, sh)); lib.person({ x: sx, y: sy, h, k, col: '#' + [ch(244), ch(236), ch(216)].map((v) => ('0' + v.toString(16)).slice(-2)).join(''), arms: 0.35 + 0.2 * Math.sin(t * 2 + c + r) }); }
          if (h > 4) lib.palm({ x: sx + 2, y: sy - h * 0.9, s: Math.max(0.3, sc * 0.55), k, t });
        }
      };
      return {
        render(t) {
          const U = px.cur(), zoom = lerp(1.7, 0.62, S(5, 22, t)), k = 1, fallK = S(34, 38, t);
          bg(t, 0.5 + 0.4 * S(22, 30, t), 0);
          lib.halo(240, 40, 180, hex('#fff0c0'), 0.5 * S(8, 22, t), 0.7);
          lib.bigThrone({ cx: 240, by: 80, s: 0.5 * S(10, 22, t), k: S(10, 22, t), t, glow: 1 });
          lib.lamb({ x: 240, y: 94, s: 0.45 * S(10, 22, t), k: S(12, 22, t), t, glow: 1, horns: 1, eyes: 1 });
          /* first the single figure; then the crowd is revealed behind and around as the camera rises */
          crowd(zoom, 240, lerp(184, 176, S(5, 22, t)), k, t);
          for (let i = 0; i < 12; i++) { const a = S(34 + i * 0.2, 38 + i * 0.2, t); lib.wings({ x: 40 + i * 36, y: 54 + (i % 2) * 8, s: 0.8, k: a * 0.9, t, spread: 0.6, eyes: 0, n: 2 }); lib.lightFig({ x: 40 + i * 36, y: 90 + (i % 2) * 8, h: 34, a: a * 0.8, t, seed: i, sway: 0.4, glow: 0.8 }); }
          for (let i = 0; i < 7; i++) { const u = (t - (46.2 + i * 0.85)) / 3.2; if (u > 0 && u < 1) { ring(240, 80, u * 360, u * 140, hex('#fff6d0'), (1 - u) * 0.8); } }
          lib.motes({ x0: 0, x1: 480, y0: 20, y1: 190, t, k: 0.6 * S(22, 30, t), n: 80, speed: 8, dir: -1 });
          px.post({ vignette: 1.0, flash: 1 - S(0, 1.5, t), flashCol: hex('#fff6dc'), fade: S(56, 60, t) * 0.0, fadeCol: hex('#000000') });
          lib.titleCard(t, 'A GREAT MULTITUDE', 28);
        },
      };
    },

    score(A, from) {
      const D2 = 73.42, D3 = 146.83, A3 = 220, D4 = 293.66, Fs4 = 369.99, A4 = 440, D5 = 587.33, Fs5 = 739.99, A5 = 880, D6 = 1174.66;
      A.drone(0, 60, D2, { gain: 0.06, attack: 2.0, release: 3.0 });
      A.choir(4, 24, [A3, D4, Fs4], { gain: 0.04, attack: 4.0, release: 3.0, vowel: 0.6 });
      A.choir(12, 60, [D3, A3, D4, Fs4, A4, D5, Fs5], { gain: 0.09, attack: 6.0, release: 3.0, vowel: 1.2 });
      A.riser(8, 22.5, { f0: 200, f1: 2400, gain: 0.05 });
      A.brass(22, 54, D3, { gain: 0.05, attack: 2.0, release: 2.5, sweep: [[22, 600], [45, 2000]] });
      A.boom(24, { freq: 46, gain: 0.45, dur: 4 }); A.bell(24, D5, { gain: 0.12, dur: 8 });
      A.shimmer(34, D6, { dur: 10, gain: 0.06 });
      for (let i = 0; i < 7; i++) { A.bell(46.2 + i * 0.85, [A5, Fs5, D5, D6, A5, Fs5, D5][i], { gain: 0.09, dur: 5 }); A.boom(46.2 + i * 0.85, { freq: 50, gain: 0.16, dur: 1.6 }); }
    },
  });
})();
