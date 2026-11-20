/* ============================================================================
 *  REVELATION · PIXEL EDITION · Episode 37 · The Mighty Angel and the Seven Thunders · Revelation 10:1–4
 *  2D pixel-art cut (480x200). Another mighty angel, colossal, robed in cloud with a rainbow over his head; his face like the sun, legs like pillars of fire, a small open scroll in his hand. The camera begins at his feet in the waves and tilts up for many seconds. One foot on the sea, one on the land. Seven thunders in rhythm; then a hard cut to silence. No face.
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

  Aura.define(37, {
    pixel: true,
    duration: 66,
    cues: [
      { ref: '10:1', t0: 5.0, t1: 22.0 },
      { ref: '10:2', t0: 23.0, t1: 31.0 },
      { ref: '10:3', t0: 32.0, t1: 40.0 },
      { ref: '10:4', t0: 41.0, t1: 58.0 },
    ],
    titles: [],

    build(ctx) {
      const SEA = 300;
      return {
        render(t) {
          if (t >= 41 && t < 60) {
            const U = px.cur(); for (let i = 0; i < W * H; i++) U[i] = hex('#000000');
            const k = S(43, 48, t) * (1 - S(56, 59, t)); G(240, 118, 26, '#ffd890', 0.6 * k); lib.line(232, 126, 248, 112, hex('#fff6d0'), 1); lib.ell(240, 122, 10, 2, (X, Y) => px.dpx(X, Y, hex('#e8d8b0'), 0.7 * k));
            px.post({ vignette: 1.8, flash: 0, fade: Math.max(S(40.4, 41, t) < 1 && t < 41.1 ? 1 - S(40.4, 41, t) : 0, S(58, 60, t)), fadeCol: hex('#000000') }); return;
          }
          const cam = lerp(150, -10, S(8, 28, t) * S(8, 28, t) * (3 - 2 * S(8, 28, t))) , oy = -cam, flash = t >= 32 && t < 40 ? Math.exp(-((t - 32) % 1.1) * 7) : 0;
          lib.skyGrad({ t, top: '#2a4a9a', mid: '#7aa0d8', bot: '#f0d8b0', cloud: 0.4, wind: 0.3, y1: Math.max(1, Math.min(H, SEA + oy)), dark: 0.15 * S(30, 32, t) });
          const U = px.cur(); const sy0 = Math.round(SEA + oy); if (sy0 < H) lib.sea({ t, y0: Math.max(0, sy0), cx: 240, glow: 0.6, ripple: 1, k: 1 });
          const ak = S(2, 6, t);
          for (let lg = 0; lg < 2; lg++) { const x0 = lg ? 262 : 198, wd = 28; for (let yw = 150; yw < SEA; yw++) { const y = Math.round(yw + oy); if (y < 0 || y >= H) continue; for (let x = x0 - wd / 2 + (yw - 150) * 0.0; x < x0 + wd / 2; x++) { const n = px.fbm(x * 0.12, yw * 0.05 - t * 0.5, 3, 7), c = px.ramp(hexes(['#7a1a08', '#d04010', '#ff8a2a', '#ffd070', '#fff6d0']), clamp(0.35 + n * 0.7 - Math.abs(x - x0) / wd * 0.5, 0, 1), x, yw); px.dpx(Math.round(x), y, c, ak); } } G(x0, 280 + oy, 40, '#ff8a30', 0.5 * ak); lib.spray({ t: t, tb: 0, z: 1, n: 20 }); }
          for (let i = 0; i < 60; i++) { const bx = 200 + px.hash(i, 1, 3) * 80, by = 70 + px.hash(i, 2, 3) * 90, r = 20 + px.hash(i, 3, 3) * 22; lib.ell(bx, by + oy, r, r * 0.7, (X, Y, dx, dy) => px.dpx(X, Y, mix(hex('#8a96b8'), hex('#ffffff'), clamp(0.55 - dy * 0.45 + dx * 0.1, 0, 1)), 0.95 * ak)); }
          lib.ell(240, 80 + oy, 44, 30, (X, Y, dx, dy) => px.dpx(X, Y, mix(hex('#8a96b8'), hex('#ffffff'), clamp(0.55 - dy * 0.4, 0, 1)), 0.9 * ak));
          G(240, 58 + oy, 70, '#fff6c8', 0.9 * ak); lib.ell(240, 58 + oy, 17, 18, (X, Y, dx, dy) => px.dpx(X, Y, hex('#fffbe0'), ak));
          lib.rainbow({ k: S(12, 22, t), t, th: 8, cx: 240, cy: 50 + oy, rx: 78, ry: 56, x: 240, y: 50 + oy, s: 1 });
          lib.line(310, 86 + oy, 322, 120 + oy, hex('#e8e0d0'), 3); lib.ell(322, 124 + oy, 11, 4, (X, Y, dx, dy) => px.dpx(X, Y, hex('#fff6d0'), ak)); G(322, 124 + oy, 24, '#ffe9a0', 0.6 * ak);
          if (t >= 32 && t < 40) for (let i = 0; i < 7; i++) { const ts = 32 + i * 1.1, a = t - ts; if (a < 0 || a > 0.9) continue; const x = 30 + i * 70 + (i > 3 ? 0 : 0); bolt(x, 0, x + (px.hash(i, 1, 2) - 0.5) * 30, 190, i + 3, '#e8f0ff', 1 - a); for (let y = 0; y < 190; y += 6) px.dpx(x - 1, y, hex('#ffffff'), (1 - a) * 0.8); }
          tint(0, H, '#101828', 0.28 * S(30, 32, t));
          px.post({ vignette: 1.0, flash: flash * 0.7, flashCol: hex('#e8f0ff'), fade: Math.max(1 - S(0, 1.4, t), S(40.2, 40.9, t) * (t < 41 ? 1 : 0)), fadeCol: hex('#000000') }); shake(Math.sin(t * 53) * flash * 3, Math.sin(t * 41) * flash * 3);
          lib.titleCard(t, 'SEVEN THUNDERS', 37);
        },
      };
    },

    score(A, from) {
      const D2 = 73.42, D3 = 146.83, A3 = 220, D4 = 293.66, F4 = 349.23, Fs4 = 369.99, A4 = 440, D5 = 587.33, F5 = 698.46, Fs5 = 739.99, A5 = 880, D6 = 1174.66;
      A.drone(0, 40.5, D2, { gain: 0.07, attack: 2.0, release: 0.5 });
      A.noise({ t0: 0, t1: 10, gain: [[0, 0.2], [10, 0.05]], filter: { type: 'lowpass', freq: 900, q: 1 }, wet: 0.4, attack: 1, release: 2 });
      A.choir(8, 40.5, [D3, A3, D4, Fs4], { gain: 0.05, attack: 6.0, release: 0.5, vowel: 0.9 }); A.brass(14, 31, D3, { gain: 0.08, attack: 3.0, release: 1.5, sweep: [[14, 400], [28, 1800]] });
      A.boom(22.8, { freq: 38, gain: 0.7, dur: 5 }); A.riser(23, 31.8, { from: 100, to: 1000, gain: 0.12 });
      for (let i = 0; i < 7; i++) A.boom(32 + i * 1.1, { freq: 52 - i * 3, gain: 0.7, dur: 4 });
      for (let i = 0; i < 7; i++) A.noise({ t0: 32 + i * 1.1, t1: 33 + i * 1.1, gain: [[32 + i * 1.1, 0.35], [33 + i * 1.1, 0]], filter: { type: 'bandpass', freq: 500, q: 0.7 }, wet: 0.4, attack: 0.01, release: 0.6 });
      /* silence: nearly nothing from 41 */
      A.drone(42, 59, D2, { gain: 0.012, attack: 4.0, release: 3.0 }); A.bell(46, D6, { gain: 0.03, dur: 8 });
    },
  });
})();
