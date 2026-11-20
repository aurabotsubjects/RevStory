/* ============================================================================
 *  REVELATION · PIXEL EDITION · Episode 61 · The Seven Golden Bowls · Revelation 15:5–8
 *  2D pixel-art cut (480x200). The heavenly temple opens. Seven angels in clean shining linen with golden sashes come out; one of the living creatures hands each a golden bowl full of the wrath of God. The temple fills with smoke from God glory and no one can enter. A symmetrical dolly-in, then smoke dimming the frame to near-white. No faces.
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

  Aura.define(61, {
    pixel: true,
    duration: 56,
    cues: [
      { ref: '15:5', t0: 5.0, t1: 16.0 },
      { ref: '15:6', t0: 17.0, t1: 30.0 },
      { ref: '15:7', t0: 31.0, t1: 42.0 },
      { ref: '15:8', t0: 43.0, t1: 54.0 },
    ],
    titles: [],

    build(ctx) {
      const angel = (x, y, s, k, t, seed, o) => { o = o || {}; lib.lightFig({ x, y, h: 44 * s, a: k, t, seed, sway: 0.3, glow: o.glow === undefined ? 1.2 : o.glow }); lib.wings({ x, y: y - 28 * s, s: 0.9 * s, k: k * 0.85, t: t * 1.5 + seed, spread: o.spread === undefined ? 0.7 : o.spread, eyes: 0, n: 2 }); };
      const bowl = (x, y, s, k, t, fill, col) => { if (k <= 0.01) return; x = Math.round(x); y = Math.round(y); lib.ell(x, y, 9 * s, 3 * s, (X, Y) => px.dpx(X, Y, hex('#e8b04a'), k)); for (let yy = 0; yy < 7 * s; yy++) { const u = yy / (7 * s), hw = lerp(9, 3, u) * s; for (let xx = Math.round(x - hw); xx <= Math.round(x + hw); xx++) px.dpx(xx, Math.round(y + yy), px.ramp(hexes(['#6a4a18', '#b8802a', '#ffd070']), clamp(0.6 - (xx - x) / hw * 0.4, 0, 1), xx, yy), k); } lib.ell(x, y, 8 * s, 2.4 * s, (X, Y) => px.dpx(X, Y, hex(col || '#ff4a30'), k * fill)); G(x, y, 14 * s, col || '#ff4a30', 0.4 * k * fill); };
      return {
        render(t) {
          const U = px.cur(), z = 1 + 0.9 * S(0, 56, t), op = S(3, 14, t);
          for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) U[y * W + x] = px.ramp(hexes(['#08060c', '#1a1224', '#3a2a40']), clamp(0.3 + (1 - y / H) * 0.3, 0, 1), x, y);
          G(240, 80, 130 * op, '#ffe0a0', 0.9 * op);
          for (let y = 0; y < H; y++) for (let x = Math.round(240 - 60 * z * op); x < 240 + 60 * z * op; x++) px.dpx(x, y, px.ramp(hexes(['#ffd890', '#fff6d8', '#ffffff']), clamp(0.5 + (y / H) * 0.3, 0, 1), x, y), 0.85 * op * (1 - Math.abs(x - 240) / (62 * z)));
          for (let i = 0; i < 6; i++) for (const sd of [-1, 1]) { const x = 240 + sd * (130 * i / 6 + 10) * 1.0; lib.line(Math.round(x), 0, Math.round(x), H, hex('#2a1e30'), 3); }
          for (let r = 0; r < 7; r++) { const x = 240 + (r - 3) * 38 * Math.min(1.5, z), g = S(17 + r * 0.4, 22 + r * 0.4, t), y = 150 + Math.abs(r - 3) * 2; angel(x, y, 0.9 * z, op * g, t, r, { spread: 0.5, glow: 0.7 }); bowl(x + 14 * z, y - 22 * z, 1.1 * z, S(21 + r * 0.9, 24 + r * 0.9, t), t, 1, '#ff5a30'); }
          const sm = S(31, 50, t); for (let i = 0; i < 90; i++) { const q = (t * 0.06 + px.hash(i, 1, 2)) % 1; lib.ell(px.hash(i, 2, 2) * W, 200 - q * 220, 24 + q * 30, 16 + q * 20, (X, Y, dx, dy) => px.dpx(X, Y, hex('#e8e4ec'), 0.28 * sm)); }
          px.post({ vignette: 1.0 - 0.5 * sm, flash: 0, fade: Math.max(1 - S(0, 1.4, t), S(52, 56, t)), fadeCol: hex('#ffffff') }); lib.titleCard(t, 'THE GOLDEN BOWLS', 61);
        },
      };
    },

    score(A, from) {
      const D2 = 73.42, D3 = 146.83, A3 = 220, D4 = 293.66, F4 = 349.23, Fs4 = 369.99, A4 = 440, D5 = 587.33, F5 = 698.46, Fs5 = 739.99, A5 = 880, D6 = 1174.66;
      A.drone(0, 56, D2, { gain: 0.06, attack: 3.0, release: 3.0 });
      A.choir(3, 56, [D3, A3, D4], { gain: 0.06, attack: 5.0, release: 4.0, vowel: 0.8 }); A.bell(5, D5, { gain: 0.06, dur: 8 });
      for (let r = 0; r < 7; r++) A.bell(21 + r * 0.9, [D5, F5, A5][r % 3], { gain: 0.05, dur: 3 });
      A.boom(31, { freq: 36, gain: 0.5, dur: 5 }); A.noise({ t0: 31, t1: 54, gain: [[31, 0.0], [44, 0.18], [54, 0]], filter: { type: 'lowpass', freq: 1200, q: 0.6 }, wet: 0.5, attack: 3, release: 3 });
    },
  });
})();
