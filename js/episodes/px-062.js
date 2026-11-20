/* ============================================================================
 *  REVELATION · PIXEL EDITION · Episode 62 · The First Two Bowls · Revelation 16:1–3
 *  2D pixel-art cut (480x200). A loud voice from the temple: Go, pour out the seven bowls. The first bowl: painful sores on those with the mark of the beast, shown as symbolic red sigils. The second: the sea becomes like blood, every living thing in it dies, shown in an aerial view as the sea reddens. No faces.
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

  Aura.define(62, {
    pixel: true,
    duration: 56,
    cues: [
      { ref: '16:1', t0: 4.0, t1: 14.0 },
      { ref: '16:2', t0: 15.0, t1: 30.0 },
      { ref: '16:3', t0: 31.0, t1: 52.0 },
    ],
    titles: [],

    build(ctx) {
      const angel = (x, y, s, k, t, seed, o) => { o = o || {}; lib.lightFig({ x, y, h: 44 * s, a: k, t, seed, sway: 0.3, glow: o.glow === undefined ? 1.2 : o.glow }); lib.wings({ x, y: y - 28 * s, s: 0.9 * s, k: k * 0.85, t: t * 1.5 + seed, spread: o.spread === undefined ? 0.7 : o.spread, eyes: 0, n: 2 }); };
      const bowl = (x, y, s, k, t, fill, col) => { if (k <= 0.01) return; x = Math.round(x); y = Math.round(y); lib.ell(x, y, 9 * s, 3 * s, (X, Y) => px.dpx(X, Y, hex('#e8b04a'), k)); for (let yy = 0; yy < 7 * s; yy++) { const u = yy / (7 * s), hw = lerp(9, 3, u) * s; for (let xx = Math.round(x - hw); xx <= Math.round(x + hw); xx++) px.dpx(xx, Math.round(y + yy), px.ramp(hexes(['#6a4a18', '#b8802a', '#ffd070']), clamp(0.6 - (xx - x) / hw * 0.4, 0, 1), xx, yy), k); } lib.ell(x, y, 8 * s, 2.4 * s, (X, Y) => px.dpx(X, Y, hex(col || '#ff4a30'), k * fill)); G(x, y, 14 * s, col || '#ff4a30', 0.4 * k * fill); };
      const sig = (x, y, r, k, t, sd) => { for (let a = 0; a < 6.283; a += 0.5) { const rr = r * (0.6 + 0.4 * px.hash(Math.round(a * 4), sd, 3)); px.dpx(Math.round(x + Math.cos(a) * rr), Math.round(y + Math.sin(a) * rr), hex('#ff3a20'), k); } lib.line(Math.round(x - r), Math.round(y), Math.round(x + r), Math.round(y), hex('#b01810'), 1); lib.line(Math.round(x), Math.round(y - r), Math.round(x), Math.round(y + r), hex('#b01810'), 1); G(x, y, r * 1.6, '#ff2a10', 0.4 * k * (0.7 + 0.3 * Math.sin(t * 5 + sd))); };
      return {
        render(t) {
          const U = px.cur();
          if (t < 31) {
            for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) U[y * W + x] = px.ramp(hexes(['#06040a', '#14081a', '#2a1020']), clamp(0.3 + px.fbm(x * 0.02, y * 0.02, 3, 4) * 0.4, 0, 1), x, y);
            const bk = S(2, 6, t); angel(240, 80, 1.2, bk * (1 - S(10, 15, t)), t, 2, { spread: 0.6 }); bowl(262, 52, 1.4, bk * (1 - S(10, 15, t)), t, 1, '#ff4a30');
            const sg = S(15, 30, t); const n = Math.round(sg * 70); for (let i = 0; i < n; i++) { const x = 20 + px.hash(i, 1, 6) * 440, y = 20 + px.hash(i, 2, 6) * 160; sig(x, y, 5 + px.hash(i, 3, 6) * 9, S(15 + i * 0.2, 17 + i * 0.2, t), t, i); }
            px.post({ vignette: 1.4, flash: 0, fade: Math.max(1 - S(0, 1.4, t), S(30, 31, t)), fadeCol: hex('#000000') }); lib.titleCard(t, 'THE FIRST BOWLS', 62); return;
          }
          const rd = S(31, 44, t);
          for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const n = px.fbm(x * 0.012 + t * 0.02, y * 0.02, 4, 3); const land = n > 0.6 && (x * 0.7 + y) % 3 >= 0; const v = clamp(0.3 + n * 0.5, 0, 1), blue = px.ramp(hexes(['#08204a', '#10408a', '#2a70c0']), v, x, y), red = px.ramp(hexes(['#1a0408', '#5a0a10', '#a01820', '#d04030']), clamp(v + 0.1 * Math.sin(x * 0.2 + t * 2), 0, 1), x, y); U[y * W + x] = land ? px.ramp(hexes(['#1a2a10', '#3a4a20', '#6a6a30']), v, x, y) : mix(blue, red, clamp(rd * 1.6 - Math.abs(x - 240) / 300 * (1 - rd) - (y / H) * 0.2, 0, 1)); }
          for (let i = 0; i < 40; i++) { const x = Math.round(px.hash(i, 1, 9) * W), y = Math.round(px.hash(i, 2, 9) * H); if (rd > 0.5 && px.hash(i, 3, 9) < rd) lib.line(x, y, x + 6, y + 1, hex('#e8d0c0'), 1); }
          px.post({ vignette: 1.2, flash: 0, fade: Math.max(S(30, 31.4, t) < 1 && t < 31.5 ? 1 - S(30, 31.4, t) : 0, S(50, 52, t)), fadeCol: hex('#000000') });
        },
      };
    },

    score(A, from) {
      const D2 = 73.42, D3 = 146.83, A3 = 220, D4 = 293.66, F4 = 349.23, Fs4 = 369.99, A4 = 440, D5 = 587.33, F5 = 698.46, Fs5 = 739.99, A5 = 880, D6 = 1174.66;
      A.drone(0, 56, D2 * 0.75, { gain: 0.08, attack: 2.0, release: 3.0 });
      A.brass(4, 14, D3 / 2, { gain: 0.09, attack: 0.5, release: 3.0, sweep: [[4, 400], [10, 800]] }); A.boom(4.2, { freq: 38, gain: 0.7, dur: 4 });
      for (let q = 15; q < 30; q += 1.2) A.boom(q, { freq: 50 + (q % 3) * 6, gain: 0.25, dur: 1 });
      A.noise({ t0: 15, t1: 30, gain: [[15, 0.0], [24, 0.2], [30, 0]], filter: { type: 'bandpass', freq: 900, q: 1 }, wet: 0.3, attack: 1, release: 1 });
      A.boom(31, { freq: 32, gain: 0.8, dur: 6 }); A.noise({ t0: 31, t1: 50, gain: [[31, 0.0], [38, 0.25], [50, 0]], filter: { type: 'lowpass', freq: 700, q: 1 }, wet: 0.4, attack: 2, release: 3 }); A.choir(32, 52, [D3, F4, Fs4], { gain: 0.06, attack: 4.0, release: 4.0, vowel: 0.3 });
    },
  });
})();
