/* ============================================================================
 *  REVELATION · PIXEL EDITION · Episode 54 · The Lamb on Mount Zion · Revelation 14:1–5
 *  2D pixel-art cut (480x200). After the dark chapter, a glorious and orderly shot: sunrise on Mount Zion, the Lamb standing on the summit and the hundred and forty-four thousand around Him with His name and His Father name shining on their foreheads. A gentle rotation of the camera; the sound like many waters, harpists, and a new song sung before the throne. No faces.
 * ========================================================================== */
(function () {
  'use strict';
  const Aura = window.Aura, px = Aura.px, lib = Aura.pxlib;
  const { W, H, clamp, lerp, sstep, hex, hexes, mix } = px;
  const S = sstep;
  const G = (x, y, r, c, k, sy) => { if (k > 0.01) lib.halo(Math.round(x), Math.round(y), r, hex(c), k, sy || 1); };
  const shake = (dx, dy) => { dx = Math.round(dx); dy = Math.round(dy); if (!dx && !dy) return; const U = px.cur(), C = U.slice(); for (let y = 0; y < H; y++) { const sy = clamp(y - dy, 0, H - 1); for (let x = 0; x < W; x++) U[y * W + x] = C[sy * W + clamp(x - dx, 0, W - 1)]; } };
  const fire = (x, y, r, k, t) => { if (k <= 0.01) return; const f = 0.85 + 0.15 * Math.sin(t * 9 + x); G(x, y, r * 1.7 * f, '#ff4a10', 0.4 * k); G(x, y, r * f, '#ff9a30', 0.7 * k); G(x, y, r * 0.5, '#fff0b0', 0.9 * k); };
  const bolt = (x0, y0, x1, y1, seed, col, k) => { if (k <= 0.01) return; let px0 = x0, py0 = y0; const n = 9; for (let i = 1; i <= n; i++) { const u = i / n, nx = lerp(x0, x1, u) + (i < n ? (px.hash(i, seed, 5) - 0.5) * 26 : 0), ny = lerp(y0, y1, u); lib.line(Math.round(px0), Math.round(py0), Math.round(nx), Math.round(ny), hex(col), 1); G(nx, ny, 5, col, 0.25 * k); px0 = nx; py0 = ny; } };
  const tint = (y0, y1, col, k) => { if (k <= 0.01) return; const c = hex(col); for (let y = Math.max(0, y0 | 0); y < Math.min(H, y1 | 0); y++) for (let x = 0; x < W; x++) px.dpx(x, y, c, k); };
  const stars = (t, k, y1, col) => { if (k <= 0.01) return; for (let i = 0; i < 110; i++) { const x = Math.round(px.hash(i, 1, 41) * W), y = Math.round(px.hash(i, 2, 41) * (y1 || 120)); px.dpx(x, y, hex(col || '#fff6e0'), k * (0.4 + 0.6 * Math.abs(Math.sin(t * 1.3 + i)))); } };
  const crowd = (y, n, k, seed, h, col, x0, x1) => { for (let i = 0; i < n; i++) { const x = lerp(x0 === undefined ? 10 : x0, x1 === undefined ? 470 : x1, (i + px.hash(i, seed, 3) * 0.7) / n); lib.person({ x, y: y + px.hash(i, seed, 7) * 8, h: h * (0.8 + 0.4 * px.hash(i, seed, 11)), k, col: col || '#0a0810' }); } };
  const done = (t, dur, fl, flc, vig) => px.post({ vignette: vig === undefined ? 1.0 : vig, flash: fl || 0, flashCol: hex(flc || '#fff0d0'), fade: Math.max(1 - S(0, 1.4, t), S(dur - 1.6, dur, t)), fadeCol: hex('#000000') });

  Aura.define(54, {
    pixel: true,
    duration: 64,
    cues: [
      { ref: '14:1', t0: 5.0, t1: 20.0 },
      { ref: '14:2', t0: 21.0, t1: 32.0 },
      { ref: '14:3', t0: 33.0, t1: 44.0 },
      { ref: '14:4', t0: 45.0, t1: 54.0 },
      { ref: '14:5', t0: 55.0, t1: 61.0 },
    ],
    titles: [],

    build(ctx) {
      return {
        render(t) {
          const U = px.cur(), sun = S(0, 20, t), rot = Math.sin(t * 0.12) * 0.12;
          lib.skyGrad({ t, top: lerp(0, 1, sun) ? '#2a3a78' : '#2a3a78', mid: '#c8809a', bot: '#ffd890', cloud: 0.5, wind: 0.2, y1: 150 });
          tint(0, 150, '#10142a', 0.5 * (1 - sun)); lib.glory({ cx: 240 + rot * 200, cy: 150, hy: 150, k: sun, rays: 1.1, t }); G(240 + rot * 200, 150, 90, '#fff0b0', 0.6 * sun);
          for (let x = 0; x < W; x++) { const ph = (x - 240 - rot * 120) / 240, h = Math.round(70 + 40 * Math.exp(-ph * ph * 3.2) + 6 * px.fbm(x * 0.02, 3, 3, 5)); for (let y = 200 - h; y < H; y++) px.set(x, y, px.ramp(hexes(['#1a1410', '#4a3a2a', '#9a7a50', '#e8c888']), clamp(0.3 + (y - (200 - h)) * 0.003 + 0.4 * sun * Math.exp(-ph * ph * 2) - 0.1 * (x < 240 ? 0 : 1), 0, 1), x, y)); }
          const top = 200 - Math.round(86 + 66 * Math.exp(-rot * rot * 0));
          const hk = S(8, 16, t) * 0.5; lib.host({ cx: 240 + rot * 120, cy: 190, k: hk, n: 600, arms: 6, t, r0: 14, r1: 260, tilt: 0.28, rot: t * 0.05 * 0, s: 1 });
          for (let i = 0; i < 160; i++) { const a = i / 160 * 6.283 * 3 + t * 0.05, rr = 20 + (i % 40) * 6, X = Math.round(240 + rot * 120 + Math.cos(a) * rr * 1.4), Y = Math.round(172 + Math.sin(a) * rr * 0.28); G(X, Y - 3, 3, '#ffd890', 0.8 * S(14 + (i % 20) * 0.3, 22, t)); }
          lib.lamb({ x: 240 + rot * 120, y: 124, s: 2.4, k: S(3, 8, t), t, glow: 1.5 });
          const wv = S(21, 24, t) * (1 - S(31, 33, t)); for (let r = 0; r < 4; r++) { const a = ((t - 21) * 0.5 + r * 0.25) % 1; if (t > 21) for (let i = 0; i < 100; i++) { const an = i / 100 * 6.283; px.dpx(Math.round(240 + Math.cos(an) * a * 300), Math.round(120 + Math.sin(an) * a * 100), hex('#fff0c0'), 0.4 * (1 - a) * wv); } }
          const nk = S(10, 22, t); for (let r = 0; r < 6; r++) { const n = 18 + r * 7, y = 142 + r * 10, hh = 9 + r * 2.5; for (let i = 0; i < n; i++) { const x = ((i + 0.5 + (r % 2) * 0.5) / n) * 520 - 20 + Math.sin(t * 0.3 + i + r) * 1.5 + rot * 60; if (px.hash(i, r, 7) > nk) continue; lib.person({ x, y, h: hh, k: 1, col: r % 2 ? '#4a3438' : '#3a2a30' }); G(x, y - hh * 0.9, 3 + r * 0.5, '#ffe9a0', 0.9 * S(14 + (i % 10) * 0.4, 24, t)); } }
          tint(0, H, '#ffe0a0', 0.06 * sun); px.post({ vignette: 0.9, flash: 0, fade: Math.max(1 - S(0, 1.6, t), S(62, 64, t)), fadeCol: hex('#ffffff') }); lib.titleCard(t, 'MOUNT ZION', 54);
        },
      };
    },

    score(A, from) {
      const D2 = 73.42, D3 = 146.83, A3 = 220, D4 = 293.66, F4 = 349.23, Fs4 = 369.99, A4 = 440, D5 = 587.33, F5 = 698.46, Fs5 = 739.99, A5 = 880, D6 = 1174.66;
      A.drone(0, 64, D2, { gain: 0.06, attack: 4.0, release: 4.0 });
      A.choir(3, 64, [D3, A3, D4, Fs4, A4], { gain: 0.09, attack: 6.0, release: 4.0, vowel: 1.1 }); A.shimmer(5, A5, { dur: 55, gain: 0.06 });
      for (let q = 6; q < 60; q += 1.5) A.bell(q, [D5, Fs5, A5, D6, A5, Fs5][Math.floor(q / 1.5) % 6], { gain: 0.04, dur: 3 });
      A.noise({ t0: 21, t1: 33, gain: [[21, 0.0], [26, 0.1], [33, 0]], filter: { type: 'bandpass', freq: 500, q: 0.5 }, wet: 0.5, attack: 2, release: 3 }); A.boom(21.2, { freq: 48, gain: 0.5, dur: 4 });
      A.brass(33, 55, D3, { gain: 0.05, attack: 4.0, release: 4.0, sweep: [[33, 500], [50, 1400]] });
    },
  });
})();
