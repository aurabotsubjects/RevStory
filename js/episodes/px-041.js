/* ============================================================================
 *  REVELATION · PIXEL EDITION · Episode 41 · The Two Witnesses · Revelation 11:3–6
 *  2D pixel-art cut (480x200). Two figures in sackcloth stand low and monumental in a city square, flanked by two olive trees and two lampstands. Fire from their mouths, a drought-cracked land under a sky that gives no rain, rivers that turn red, and plagues. No faces.
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

  Aura.define(41, {
    pixel: true,
    duration: 64,
    cues: [
      { ref: '11:3', t0: 5.0, t1: 16.0 },
      { ref: '11:4', t0: 17.0, t1: 27.0 },
      { ref: '11:5', t0: 28.0, t1: 42.0 },
      { ref: '11:6', t0: 43.0, t1: 58.0 },
    ],
    titles: [],

    build(ctx) {
      const olive = (x, y, k) => { lib.line(x, y, x - 3, y - 30, hex('#3a2a18'), 4); for (let i = 0; i < 6; i++) lib.ell(x - 3 + (px.hash(i, 1, 3) - 0.5) * 36, y - 36 - px.hash(i, 2, 3) * 18, 15, 9, (X, Y, dx, dy) => px.dpx(X, Y, px.ramp(hexes(['#1a2a18', '#4a6a38', '#8aa868', '#c8d8a0']), clamp(0.5 - dy * 0.4 + dx * 0.1, 0, 1), X, Y), k)); };
      return {
        render(t) {
          const dry = S(34, 56, t), U = px.cur();
          lib.skyGrad({ t, top: mix(hex('#3a5a98'), hex('#b88a50'), dry) ? '#3a5a98' : '#3a5a98', mid: '#8aa8d0', bot: '#e8d0a8', cloud: 0.6 * (1 - S(40, 48, t)), wind: 0.3, y1: 132 });
          tint(0, 132, '#c8903a', 0.5 * dry);
          for (let b = 0; b < 12; b++) { const L = b < 6, x = L ? 10 + b * 28 : 330 + (b - 6) * 28, h = 40 + px.hash(b, 1, 3) * 56; for (let y = Math.round(110 - h); y < 132; y++) for (let xx = x; xx < x + 26; xx++) px.set(xx, y, px.ramp(hexes(['#1a1620', '#3a3040', '#6a5a60', '#a09088']), clamp(0.3 + (xx - x) * 0.012 - (110 - y) * 0.001 + 0.05 * px.hash(xx, y, 2), 0, 1), xx, y)); }
          for (let y = 130; y < H; y++) for (let x = 0; x < W; x++) px.set(x, y, px.ramp(hexes(['#2a2018', '#5a4838', '#8a7458', '#b8a078']), clamp(0.35 + (y - 130) * 0.003 + 0.08 * px.fbm(x * 0.03, y * 0.08, 3, 6), 0, 1), x, y));
          const cr = dry; for (let i = 0; i < 40; i++) { let x = px.hash(i, 1, 6) * W, y = 140 + px.hash(i, 2, 6) * 58; for (let s = 0; s < 8 * cr; s++) { const nx = x + (px.hash(s, i, 3) - 0.5) * 22, ny = y + (px.hash(s, i, 4) - 0.3) * 8; lib.line(Math.round(x), Math.round(y), Math.round(nx), Math.round(ny), hex('#140c08'), 1); x = nx; y = ny; } }
          const red = S(43, 52, t); for (let y = 150; y < H; y++) { const cx = 240 + Math.sin(y * 0.1) * 14, w2 = 4 + (y - 150) * 0.55; for (let x = Math.round(cx - w2); x <= Math.round(cx + w2); x++) px.dpx(x, y, mix(hex('#5a8ac0'), hex('#a01010'), red) ? px.ramp(red > 0.5 ? hexes(['#3a0606', '#7a1010', '#c02020']) : hexes(['#2a4a78', '#5a8ac0', '#a8c8e8']), 0.5 + 0.3 * px.fbm(x * 0.1, y * 0.2 + t, 2, 3) - 0.2, x, y) : hex('#000'), 0.9); }
          olive(110, 156, 1); olive(370, 156, 1);
          const lk = S(2, 6, t), lit = S(10, 20, t); [150, 330].forEach((lx) => { lib.line(lx, 172, lx, 140, hex('#c8902a'), 2); lib.line(lx - 12, 172, lx + 12, 172, hex('#a07020'), 2); for (let q = -3; q <= 3; q++) { lib.line(lx + q * 4, 140 + Math.abs(q) * 2, lx, 150, hex('#c8902a'), 1); G(lx + q * 4, 136 + Math.abs(q) * 2, 5, '#ffd070', 0.9 * lit * lk); px.set(lx + q * 4, 137 + Math.abs(q) * 2, hex('#fff6d0')); } });
          const wk = S(1, 5, t); for (const [x, ph] of [[200, 0], [280, 1.7]]) { const y = 200, h = 120; lib.person({ x, y, h, k: wk, col: '#4a3a2a' }); for (let q = 0; q < 7; q++) lib.line(x - 14 + q * 5, y - 40, x - 16 + q * 5, y, hex('#2a2018'), 1); lib.ell(x, y - h + 12, 9, 11, (X, Y, dx, dy) => px.dpx(X, Y, mix(hex('#1a1210'), hex('#8a6a50'), clamp(0.4 - dx * 0.2, 0, 1)), wk)); }
          const fk = S(28, 31, t) * (1 - S(41, 43, t));
          if (fk > 0.01) for (const [x, dir] of [[200, 1], [280, -1]]) for (let i = 0; i < 40; i++) { const q = (t * 2.2 + i / 40 + (dir > 0 ? 0 : 0.3)) % 1, X = x + dir * (10 + q * 130), Y = 98 + Math.sin(q * 9 + i) * 3 + q * 40; G(X, Y, 5 + q * 8, q < 0.3 ? '#fff0b0' : '#ff7a28', 0.8 * fk * (1 - q)); }
          const enemy = S(29, 32, t) * (1 - S(36, 40, t)); crowd(186, 10, enemy, 3, 30, '#08060a', 20, 460);
          if (t >= 46) for (let i = 0; i < 4; i++) { const a = t - 46 - i * 3; if (a > 0 && a < 0.6) { const x = 40 + i * 120; bolt(x, 0, x + 20, 150, i, '#ffe0e0', 1 - a / 0.6); } }
          tint(0, H, '#3a0808', 0.1 * red);
          px.post({ vignette: 1.3, flash: 0, fade: Math.max(1 - S(0, 1.4, t), S(62, 64, t)), fadeCol: hex('#000000') }); lib.titleCard(t, 'TWO WITNESSES', 41);
        },
      };
    },

    score(A, from) {
      const D2 = 73.42, D3 = 146.83, A3 = 220, D4 = 293.66, F4 = 349.23, Fs4 = 369.99, A4 = 440, D5 = 587.33, F5 = 698.46, Fs5 = 739.99, A5 = 880, D6 = 1174.66;
      A.drone(0, 64, D2, { gain: 0.06, attack: 2.0, release: 3.0 });
      A.choir(3, 28, [D3, A3, D4], { gain: 0.05, attack: 4.0, release: 2.0, vowel: 0.6 }); A.bell(17, D5, { gain: 0.05, dur: 6 }); A.bell(19.5, A5, { gain: 0.05, dur: 6 });
      A.boom(28, { freq: 44, gain: 0.6, dur: 4 }); A.noise({ t0: 28, t1: 42, gain: [[28, 0.0], [31, 0.25], [41, 0.2], [43, 0]], filter: { type: 'bandpass', freq: 900, q: 0.8 }, wet: 0.3, attack: 1, release: 1 });
      A.brass(28.5, 42, D3, { gain: 0.07, attack: 0.5, release: 2.0, sweep: [[28.5, 1500], [40, 500]] });
      A.drone(34, 64, D2 * 0.75, { gain: 0.06, attack: 8.0, release: 3.0 });
      for (let i = 0; i < 4; i++) A.boom(46 + i * 3, { freq: 48 - i * 3, gain: 0.5, dur: 3 });
      A.choir(43, 64, [D3, F4, A3, D4], { gain: 0.06, attack: 3.0, release: 3.0, vowel: 0.4 });
    },
  });
})();
