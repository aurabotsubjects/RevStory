/* ============================================================================
 *  REVELATION · PIXEL EDITION · Episode 60 · The Song of Moses and of the Lamb · Revelation 15:1–4
 *  2D pixel-art cut (480x200). A great and marvelous sign: seven angels with the seven last plagues. A sea of glass mixed with fire, and the victors standing beside it with harps, singing the song of Moses and of the Lamb. Reflective turquoise and orange, a choir in perfect symmetry, a slow orbit. No faces.
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

  Aura.define(60, {
    pixel: true,
    duration: 58,
    cues: [
      { ref: '15:1', t0: 5.0, t1: 16.0 },
      { ref: '15:2', t0: 17.0, t1: 32.0 },
      { ref: '15:3', t0: 33.0, t1: 48.0 },
      { ref: '15:4', t0: 49.0, t1: 56.0 },
    ],
    titles: [],

    build(ctx) {
      const angel = (x, y, s, k, t, seed, o) => { o = o || {}; lib.lightFig({ x, y, h: 44 * s, a: k, t, seed, sway: 0.3, glow: o.glow === undefined ? 1.2 : o.glow }); lib.wings({ x, y: y - 28 * s, s: 0.9 * s, k: k * 0.85, t: t * 1.5 + seed, spread: o.spread === undefined ? 0.7 : o.spread, eyes: 0, n: 2 }); };
      const bowl = (x, y, s, k, t, fill, col) => { if (k <= 0.01) return; x = Math.round(x); y = Math.round(y); lib.ell(x, y, 9 * s, 3 * s, (X, Y) => px.dpx(X, Y, hex('#e8b04a'), k)); for (let yy = 0; yy < 7 * s; yy++) { const u = yy / (7 * s), hw = lerp(9, 3, u) * s; for (let xx = Math.round(x - hw); xx <= Math.round(x + hw); xx++) px.dpx(xx, Math.round(y + yy), px.ramp(hexes(['#6a4a18', '#b8802a', '#ffd070']), clamp(0.6 - (xx - x) / hw * 0.4, 0, 1), xx, yy), k); } lib.ell(x, y, 8 * s, 2.4 * s, (X, Y) => px.dpx(X, Y, hex(col || '#ff4a30'), k * fill)); G(x, y, 14 * s, col || '#ff4a30', 0.4 * k * fill); };
      return {
        render(t) {
          const U = px.cur(), orb = Math.sin(t * 0.18) * 30;
          lib.skyGrad({ t, top: '#10183a', mid: '#3a3a70', bot: '#e89050', cloud: 0.4, wind: 0.2, y1: 100 });
          for (let y = 100; y < H; y++) for (let x = 0; x < W; x++) { const d = (y - 100) / 100, wv = Math.sin(x * 0.07 + t * 0.8 + y * 0.3) * 0.5 + 0.5, fl = px.fbm(x * 0.03 + orb * 0.02, y * 0.12 - t * 0.2, 3, 5); U[y * W + x] = px.ramp(hexes(['#0a4a58', '#18808a', '#40c0b0', '#ff9a50', '#ffd890']), clamp(0.25 + d * 0.15 + wv * 0.15 + fl * 0.45 - Math.abs(x - 240 - orb) * 0.0006, 0, 1), x, y); }
          G(240 + orb, 100, 130, '#ffb060', 0.5 * S(2, 8, t));
          const ak = S(3, 9, t); for (let i = 0; i < 7; i++) angel(90 + i * 50 + orb * 0.3, 96, 0.8, ak, t, i, { spread: 0.8, glow: 0.8 });
          const ck = S(17, 26, t); for (const sd of [-1, 1]) for (let r = 0; r < 4; r++) for (let i = 0; i < 12 - r; i++) { const x = 240 + sd * (50 + i * 17 + r * 4), y = 168 + r * 7; lib.person({ x: Math.round(x + orb * 0.2), y, h: 20 - r, k: ck, col: '#14101c' }); G(x + orb * 0.2, y - 10, 8, '#ffe0a0', 0.35 * ck); }
          const sg = S(33, 40, t); for (let i = 0; i < 40; i++) { const q = (t * 0.1 + px.hash(i, 1, 2)) % 1; G(px.hash(i, 2, 2) * W, 170 - q * 130, 3, '#fff0c0', 0.5 * sg * (1 - q)); }
          px.post({ vignette: 1.0, flash: 0, fade: Math.max(1 - S(0, 1.4, t), S(55, 58, t)), fadeCol: hex('#000000') }); lib.titleCard(t, 'THE SEVEN BOWLS', 60);
        },
      };
    },

    score(A, from) {
      const D2 = 73.42, D3 = 146.83, A3 = 220, D4 = 293.66, F4 = 349.23, Fs4 = 369.99, A4 = 440, D5 = 587.33, F5 = 698.46, Fs5 = 739.99, A5 = 880, D6 = 1174.66;
      A.drone(0, 58, D2, { gain: 0.06, attack: 3.0, release: 3.0 });
      A.choir(3, 58, [D3, A3, D4, Fs4, A4], { gain: 0.07, attack: 5.0, release: 4.0, vowel: 1.0 }); A.shimmer(5, A5, { dur: 50, gain: 0.05 });
      A.brass(5, 16, D3, { gain: 0.07, attack: 1.5, release: 3.0, sweep: [[5, 500], [14, 1300]] });
      for (let i = 0; i < 12; i++) A.bell(18 + i * 2.5, [D5, A5, Fs5, F5][i % 4], { gain: 0.04, dur: 4 });
      A.choir(33, 56, [D3, F4, A3, D4, A4], { gain: 0.08, attack: 3.0, release: 4.0, vowel: 1.1 });
    },
  });
})();
