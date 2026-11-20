/* ============================================================================
 *  REVELATION · PIXEL EDITION · Episode 63 · The Third Bowl · Revelation 16:4–7
 *  2D pixel-art cut (480x200). The third bowl is poured on the rivers and springs, and they become blood. A macro shot of a stream turning red. The angel in charge of the waters speaks: You are just, the Holy One. And the altar answers: true and just are your judgments. Awe-struck and calm. No faces.
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

  Aura.define(63, {
    pixel: true,
    duration: 52,
    cues: [
      { ref: '16:4', t0: 4.0, t1: 16.0 },
      { ref: '16:5', t0: 17.0, t1: 32.0 },
      { ref: '16:7', t0: 33.0, t1: 48.0 },
    ],
    titles: [],

    build(ctx) {
      const angel = (x, y, s, k, t, seed, o) => { o = o || {}; lib.lightFig({ x, y, h: 44 * s, a: k, t, seed, sway: 0.3, glow: o.glow === undefined ? 1.2 : o.glow }); lib.wings({ x, y: y - 28 * s, s: 0.9 * s, k: k * 0.85, t: t * 1.5 + seed, spread: o.spread === undefined ? 0.7 : o.spread, eyes: 0, n: 2 }); };
      const bowl = (x, y, s, k, t, fill, col) => { if (k <= 0.01) return; x = Math.round(x); y = Math.round(y); lib.ell(x, y, 9 * s, 3 * s, (X, Y) => px.dpx(X, Y, hex('#e8b04a'), k)); for (let yy = 0; yy < 7 * s; yy++) { const u = yy / (7 * s), hw = lerp(9, 3, u) * s; for (let xx = Math.round(x - hw); xx <= Math.round(x + hw); xx++) px.dpx(xx, Math.round(y + yy), px.ramp(hexes(['#6a4a18', '#b8802a', '#ffd070']), clamp(0.6 - (xx - x) / hw * 0.4, 0, 1), xx, yy), k); } lib.ell(x, y, 8 * s, 2.4 * s, (X, Y) => px.dpx(X, Y, hex(col || '#ff4a30'), k * fill)); G(x, y, 14 * s, col || '#ff4a30', 0.4 * k * fill); };
      return {
        render(t) {
          const U = px.cur(), rd = S(5, 22, t), cam = t * 14;
          for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const wx = x + cam, n = px.fbm(wx * 0.02, y * 0.04, 3, 6), ripple = Math.sin(wx * 0.12 + y * 0.35 - t * 3) * 0.5 + 0.5, spread = clamp(rd * 1.7 - (x / W) * 0.9, 0, 1), v = clamp(0.3 + n * 0.4 + ripple * 0.25, 0, 1), cl = px.ramp(hexes(['#0a4a60', '#2a8aa0', '#7ad0d8', '#e0ffff']), v, x, y), bl = px.ramp(hexes(['#2a0408', '#7a0c14', '#c82028', '#ff7060']), v, x, y); U[y * W + x] = mix(cl, bl, spread); }
          for (let i = 0; i < 40; i++) { const x = Math.round(((px.hash(i, 1, 2) * 520 - cam * 1.6) % 520 + 520) % 520 - 20), y = Math.round(px.hash(i, 2, 2) * H); lib.ell(x, y, 5, 3, (X, Y) => px.dpx(X, Y, hex('#1a1a14'), 0.5)); }
          const ak = S(15, 22, t) * (1 - S(31, 35, t)); angel(120, 150, 1.5, ak, t, 5, { spread: 0.5 }); G(120, 100, 80, '#fff0c0', 0.3 * ak);
          const al = S(33, 40, t); lib.ell(380, 170, 40, 10, (X, Y) => px.dpx(X, Y, hex('#2a1810'), al)); for (let yy = 0; yy < 30; yy++) for (let xx = 350; xx < 410; xx++) px.dpx(xx, 140 + yy, hex('#3a2418'), al); fire(380, 134, 22, al, t); G(380, 120, 110, '#ffb060', 0.4 * al);
          px.post({ vignette: 1.1, flash: 0, fade: Math.max(1 - S(0, 1.4, t), S(48, 52, t)), fadeCol: hex('#000000') }); lib.titleCard(t, 'THE THIRD BOWL', 63);
        },
      };
    },

    score(A, from) {
      const D2 = 73.42, D3 = 146.83, A3 = 220, D4 = 293.66, F4 = 349.23, Fs4 = 369.99, A4 = 440, D5 = 587.33, F5 = 698.46, Fs5 = 739.99, A5 = 880, D6 = 1174.66;
      A.drone(0, 52, D2, { gain: 0.07, attack: 2.0, release: 3.0 });
      A.noise({ t0: 0, t1: 30, gain: [[0, 0.1], [14, 0.18], [30, 0.05]], filter: { type: 'bandpass', freq: 1500, q: 0.6 }, wet: 0.4, attack: 2, release: 2 }); A.boom(4.5, { freq: 40, gain: 0.5, dur: 4 });
      A.choir(17, 33, [D3, A3, D4], { gain: 0.06, attack: 3.0, release: 3.0, vowel: 0.7 }); A.bell(18, D5, { gain: 0.05, dur: 8 });
      A.choir(33, 52, [D3, A3, D4, Fs4, A4], { gain: 0.09, attack: 4.0, release: 4.0, vowel: 1.0 }); A.bell(34, A5, { gain: 0.06, dur: 10 });
    },
  });
})();
