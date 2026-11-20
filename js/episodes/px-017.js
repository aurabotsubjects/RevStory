/* ============================================================================
 *  REVELATION · PIXEL EDITION · Episode 17 · Holy, Holy, Holy · Revelation 4:6–11
 *  2D pixel-art cut (480x200). Overhead over the sea of glass; the four living creatures each in turn (lion, ox, man, eagle), six wings, eyes all around. Day and night: holy, holy, holy. The elders fall and throw down their crowns into the light. The camera pushes toward the right hand of the One on the throne. No faces on any person.
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

  Aura.define(17, {
    pixel: true,
    duration: 94,
    cues: [
      { ref: '4:6', t0: 5.0, t1: 17.4 },
      { ref: '4:7', t0: 19.0, t1: 31.6 },
      { ref: '4:8', t0: 33.0, t1: 50.6 },
      { ref: '4:9', t0: 52.0, t1: 60.4 },
      { ref: '4:10', t0: 62.0, t1: 72.2 },
      { ref: '4:11', t0: 74.0, t1: 87.4 },
    ],
    titles: [],

    build(ctx) {
      const order = ['lion', 'ox', 'man', 'eagle'];
      function elders(t, kneel, k, cy) {
        for (let i = 0; i < 24; i++) { const x = 240 + (i < 12 ? -1 : 1) * (60 + (i % 12) * 14), y = cy + 6 - Math.abs(Math.sin(i * 1.3)) * 3 - (i % 12) * 2; lib.elder({ x, y, h: 20, k, t, seed: i, kneel: clamp(kneel * 1.6 - (i % 12) * 0.03, 0, 1), glow: 0.1 }); }
      }
      function crowns(t) {
        for (let i = 0; i < 24; i++) {
          const t0 = 64.5 + (i % 12) * 0.35 + (i >> 4) * 0.2, u = (t - t0) / 3.2; if (u <= 0 || u >= 1) continue;
          const sd = i < 12 ? -1 : 1, x0 = 240 + sd * (60 + (i % 12) * 14), y0 = 150, x = lerp(x0, 240, u * u) + Math.sin(u * 3 + i) * 4, y = y0 - Math.sin(u * 3.14 * 0.9) * 60 - u * 30 + u * u * 6;
          lib.miniCrown({ x, y, s: 1.2 - 0.5 * u, k: 1 - S(0.7, 1, u), rot: u * 6 + i });
        }
      }
      return {
        render(t) {
          const U = px.cur();
          if (t < 19) {
            const k = S(0, 3, t), cx = 240, lift = 18 * S(0, 14, t); hall(t, 0.4, 0);
            lib.sea({ t, y0: 70 - lift, cx, glow: 0.7, ripple: 0.4, k: 1 });
            lib.bigThrone({ cx, by: 72 - lift, s: 0.55 + 0.1 * S(0, 14, t), k, t, glow: 0.9 });
            lib.rainbow({ cx, cy: 52 - lift, rx: 78, ry: 58, k: 0.8, t, th: 4 });
            px.post({ vignette: 1.0, flash: 1 - S(0, 2, t), flashCol: hex('#fff6dc') });
          } else if (t < 52) {
            hall(t, 0.5, 0);
            lib.sea({ t, y0: 150, cx: 240, glow: 0.6, ripple: 0.3, k: 1 });
            const u = t - 19, slot = Math.min(3, Math.floor(u / 3.2)), all = S(32.4, 34.5, t);
            for (let i = 0; i < 4; i++) {
              const own = i <= slot ? S(0, 0.9, u - i * 3.2) : 0;
              const wide = { x: 90 + i * 100, y: 112 + (i % 2) * 4, s: 1.35 }, solo = { x: 240, y: 112, s: 2.3 };
              const c = { x: lerp(solo.x, wide.x, all), y: lerp(solo.y, wide.y, all), s: lerp(solo.s, wide.s, all) };
              lib.creature({ kind: order[i], x: c.x, y: c.y, s: c.s, k: all > 0.01 ? S(0, 0.9, u - i * 3.2 > 0 ? 1 : 0) || 1 : (i === slot ? own : 0), t, eyes: 0.4 + 0.6 * S(0, 1.2, u - i * 3.2), wing: 0.7 });
            }
            px.post({ vignette: 1.0 });
          } else if (t < 62) {
            hall(t, 0.8, 0); lib.sea({ t, y0: 150, cx: 240, glow: 0.7, ripple: 0.5, k: 1 });
            for (let i = 0; i < 4; i++) lib.creature({ kind: order[i], x: 90 + i * 100, y: 108, s: 1.4, k: 1, t, eyes: 1, wing: 0.7 + 0.3 * Math.sin(t * 2 + i) });
            px.post({ vignette: 1.0 });
          } else {
            hall(t, 0.9, 0); lib.sea({ t, y0: 150, cx: 240, glow: 0.8, ripple: 0.4, k: 1 });
            lib.bigThrone({ cx: 240, by: 150, s: 0.9, k: 1, t, glow: 1 });
            const kn = S(62, 66, t); elders(t, kn, 1, 168);
            for (let i = 0; i < 4; i++) lib.creature({ kind: order[i], x: i < 2 ? 130 + i * 40 : 280 + (i - 2) * 40, y: 120, s: 0.9, k: 0.9, t, eyes: 1, wing: 0.8 });
            crowns(t);
            const pu = S(84, 94, t); lib.halo(lerp(240, 306, pu), lerp(95, 100, pu), 40 + 30 * pu, hex('#fff6d0'), 0.5 * pu, 1);
            px.post({ vignette: 1.0, flash: S(88, 93, t) * 0.5, flashCol: hex('#fff0c8') });
          }
          lib.titleCard(t, 'HOLY HOLY HOLY', 17);
        },
      };
    },

    score(A, from) {
      const D2 = 73.42, D3 = 146.83, A3 = 220, D4 = 293.66, Fs4 = 369.99, A4 = 440, D5 = 587.33, Fs5 = 739.99, A5 = 880, D6 = 1174.66;
      A.drone(0, 94, D2, { gain: 0.06, attack: 2.0, release: 3.0 });
      A.choir(1, 33, [D3, A3, D4, Fs4], { gain: 0.06, attack: 3.0, release: 2.5, vowel: 1.0 });
      [A4, D5, Fs5, A5].forEach((f, i) => A.bell(19 + i * 3.2, f, { gain: 0.07, dur: 6 }));
      A.choir(33, 62, [D3, A3, D4, Fs4, A4, D5], { gain: 0.08, attack: 2.0, release: 2.5, vowel: 1.2 });
      A.brass(33, 62, D3, { gain: 0.05, attack: 3.0, release: 2.0, sweep: [[33, 600], [48, 1900]] });
      [38.2, 43.0, 47.4].forEach((t) => { A.boom(t, { freq: 46, gain: 0.35, dur: 3 }); A.bell(t, D5, { gain: 0.11, dur: 6 }); A.bell(t + 0.02, A5, { gain: 0.06, dur: 6 }); A.shimmer(t, D6, { dur: 5, gain: 0.05 }); });
      A.shimmer(52, A5, { dur: 8, gain: 0.06 });
      A.choir(62, 94, [D3, A3, D4, Fs4, A4, D5, Fs5], { gain: 0.085, attack: 2.0, release: 3.0, vowel: 1.3 });
      for (let i = 0; i < 12; i++) A.bell(64.5 + i * 0.4, [D5, Fs5, A5, D6][i % 4], { gain: 0.05, dur: 5 });
      A.riser(82, 93.6, { f0: 200, f1: 2400, gain: 0.04 });
    },
  });
})();
