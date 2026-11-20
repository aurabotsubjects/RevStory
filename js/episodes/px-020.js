/* ============================================================================
 *  REVELATION · PIXEL EDITION · Episode 20 · Worthy Is the Lamb · Revelation 5:11–14
 *  2D pixel-art cut (480x200). Thousands upon thousands, ten thousand times ten thousand angels around the throne. The camera rises in a huge spiral and an endless galaxy-sized host is revealed. Worthy is the Lamb: seven pulses of light for power, wealth, wisdom, strength, honour, glory and praise. Every creature in heaven, on earth, under the earth and in the sea joins in. A held chord, then silence and Amen; the elders fall and worship. The Lamb lifts the first seal (Episode 21). No faces.
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

  Aura.define(20, {
    pixel: true,
    duration: 64,
    cues: [
      { ref: '5:11', t0: 4.0, t1: 17.8 },
      { ref: '5:12', t0: 19.0, t1: 28.8 },
      { ref: '5:13', t0: 30.0, t1: 48.6 },
      { ref: '5:14', t0: 50.0, t1: 56.0 },
    ],
    titles: [],

    build(ctx) {
      return {
        render(t) {
          const U = px.cur();
          if (t < 19) {
            hall(t, 0.4, 0);
            const rise = S(0, 16, t), cy = lerp(110, 96, rise), zoom = lerp(1, 0.28, rise);
            lib.host({ cx: 240, cy, k: 0.95, t, arms: 6, spin: 0.14, r0: 14 * zoom + 6, r1: 520 * zoom, n: 900, tilt: lerp(0.3, 0.5, rise) });
            lib.host({ cx: 240, cy, k: 0.8, t: t + 5, arms: 4, spin: 0.1, r0: 20, r1: 640 * zoom, n: 500, tilt: lerp(0.3, 0.5, rise) });
            lib.bigThrone({ cx: 240, by: cy + 40, s: lerp(0.9, 0.35, rise), k: 1, t, glow: 1 });
            lib.rainbow({ cx: 240, cy: cy - 8 * (1 - rise), rx: 56 * lerp(1, 0.4, rise) + 24, ry: 40 * lerp(1, 0.4, rise) + 12, k: 0.8 * (1 - rise), t, th: 5 });
            px.post({ vignette: 1.0, flash: 1 - S(0, 1.5, t), flashCol: hex('#fff6dc') });
          } else if (t < 30) {
            hall(t, 0.8, 0);
            lib.host({ cx: 240, cy: 96, k: 0.9, t, arms: 6, spin: 0.14, r0: 20, r1: 230, n: 800, tilt: 0.5 });
            lib.bigThrone({ cx: 240, by: 134, s: 0.4, k: 1, t, glow: 1 });
            lib.lamb({ x: 240, y: 142, s: 0.9, k: 1, t, glow: 1.4, horns: 1, eyes: 1 });
            for (let i = 0; i < 7; i++) { const u = (t - (19.4 + i * 1.3)) / 2.6; if (u > 0 && u < 1) ring(240, 96, u * 400, u * 190, mix(hex('#fff6d0'), hex(['#e86a4a', '#f0b040', '#58c878', '#5aa0e8', '#b078e0', '#f08ab0', '#ffffff'][i]), 0.45), (1 - u) * 0.95); }
            px.post({ vignette: 1.0 });
          } else if (t < 49.5) {
            const z = (t - 30) / 18;
            hall(t, 0.9, 0);
            const zones = [{ y0: 0, y1: 50, c: '#fff0c0' }, { y0: 50, y1: 100, c: '#58c878' }, { y0: 100, y1: 150, c: '#b078e0' }, { y0: 150, y1: 200, c: '#5aa0e8' }];
            for (let i = 0; i < 4; i++) { const k = S(30 + i * 3.2, 33 + i * 3.2, t); if (k > 0.01) for (let y = zones[i].y0; y < zones[i].y1; y++) for (let x = 0; x < W; x++) { const v = 0.5 + 0.5 * Math.sin(x * 0.04 + y * 0.1 - t * 2 - i); if (v * k * 0.16 > px.thr(x, y)) px.blend(x, y, hex(zones[i].c), 0.55); } }
            lib.host({ cx: 240, cy: 92, k: 0.95, t, arms: 7, spin: 0.16, r0: 14, r1: 250, n: 900, tilt: 0.5 + 0.1 * z });
            for (let w = 0; w < 5; w++) { const u = (t - (31 + w * 3.3)) / 5; if (u > 0 && u < 1) ring(240, 100, u * 440, u * 220, hex('#fff6d0'), (1 - u) * 0.8); }
            lib.lamb({ x: 240, y: 118, s: 1.0, k: 1, t, glow: 1.5, horns: 1, eyes: 1 });
            lib.motes({ x0: 20, x1: 460, y0: 10, y1: 190, t, k: 0.8, n: 100, speed: 10, dir: -1 });
            px.post({ vignette: 1.0 });
          } else {
            const hush = S(52, 57, t), seal = S(59, 62.5, t);
            hall(t, 0.75 * (1 - 0.6 * hush), 0);
            lib.sea({ t, y0: 156, cx: 240, glow: 0.6 * (1 - 0.5 * hush), ripple: 0.2, k: 1 });
            lib.host({ cx: 240, cy: 80, k: 0.7 * (1 - 0.5 * hush), t, arms: 7, spin: 0.1 * (1 - hush), r0: 14, r1: 250, n: 600, tilt: 0.5 });
            for (let i = 0; i < 4; i++) lib.creature({ kind: ['lion', 'ox', 'man', 'eagle'][i], x: 110 + i * 86, y: 118, s: 0.95, k: 0.95, t, eyes: 1, wing: 0.6 - 0.25 * S(50, 52, t) });
            for (let i = 0; i < 24; i++) lib.elder({ x: 30 + i * 18.5, y: 176, h: 18, k: 0.9, t, seed: i, kneel: S(50.4, 52.6, t), glow: 0.05 });
            lib.bigThrone({ cx: 240, by: 134, s: 0.5, k: 1, t, glow: 0.9 });
            if (seal > 0.01) { lib.scroll({ x: 240, y: 100, w: 150, h: 60, k: seal, t, broken: S(61.4, 62.4, t), glow: 1 }); px.post({ vignette: 1.0, flash: Math.exp(-Math.max(0, t - 61.6) / 0.35) * (t > 61.6 ? 0.9 : 0), flashCol: hex('#fff0c8') }); }
            else px.post({ vignette: 1.0 + 0.2 * hush });
          }
          lib.titleCard(t, 'WORTHY IS THE LAMB', 20, { t1: 4.6 });
        },
      };
    },

    score(A, from) {
      const D2 = 73.42, D3 = 146.83, A3 = 220, D4 = 293.66, Fs4 = 369.99, A4 = 440, D5 = 587.33, Fs5 = 739.99, A5 = 880, D6 = 1174.66;
      A.drone(0, 64, D2, { gain: 0.06, attack: 2.0, release: 3.0 });
      A.choir(0, 19, [D3, A3, D4, Fs4, A4, D5], { gain: 0.08, attack: 3.0, release: 2.5, vowel: 1.2 });
      A.riser(1, 17, { f0: 200, f1: 3200, gain: 0.05 });
      A.brass(5, 20, D3, { gain: 0.05, attack: 3.0, release: 2.0, sweep: [[5, 500], [16, 1900]] });
      [19.4, 20.7, 22, 23.3, 24.6, 25.9, 27.2].forEach((t, i) => { A.bell(t, [D5, Fs5, A5, D6, A5, Fs5, D5][i], { gain: 0.09, dur: 6 }); A.boom(t, { freq: 52, gain: 0.18, dur: 1.8 }); });
      A.choir(19, 50, [D3, A3, D4, Fs4, A4, D5, Fs5, A5], { gain: 0.11, attack: 2.0, release: 3.0, vowel: 1.3 });
      A.brass(30, 50, D3, { gain: 0.06, attack: 3.0, release: 2.0, sweep: [[30, 700], [44, 2200]] });
      A.shimmer(30, D6, { dur: 18, gain: 0.07 });
      A.choir(50, 55, [D3, A3, D4, Fs4, A4, D5], { gain: 0.1, attack: 0.3, release: 2.5, vowel: 1.3 });
      A.boom(50, { freq: 40, gain: 0.5, dur: 4 }); A.bell(50, D4, { gain: 0.15, dur: 7 });
      A.drone(55, 64, D2, { gain: 0.04, attack: 2.0, release: 3.0 });
      A.bell(61.6, A5, { gain: 0.09, dur: 5 }); A.boom(61.6, { freq: 60, gain: 0.35, dur: 2 });
    },
  });
})();
