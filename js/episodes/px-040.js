/* ============================================================================
 *  REVELATION · PIXEL EDITION · Episode 40 · Measure the Temple · Revelation 11:1–2
 *  2D pixel-art cut (480x200). John is given a reed like a measuring rod. The temple of God and the altar are measured in lines of light and the worshippers counted; the outer court is left out, given to the nations, who trample the holy city for forty-two months. No faces.
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

  Aura.define(40, {
    pixel: true,
    duration: 58,
    cues: [
      { ref: '11:1', t0: 5.0, t1: 22.0 },
      { ref: '11:2', t0: 23.0, t1: 52.0 },
    ],
    titles: [],

    build(ctx) {
      const temple = (k, lit) => { const col = (a, b, f) => px.ramp(hexes(['#10101c', '#2a2a40', '#5a5a80', '#a0a0c8', '#e0e0f8']), clamp(a, 0, 1), b, f); for (let s = 0; s < 4; s++) for (let x = 90 + s * 6; x <= 390 - s * 6; x++) px.dpx(x, 150 - s * 4, hex(s % 2 ? '#3a3a58' : '#2a2a44'), k); for (let c = 0; c < 8; c++) { const x = 112 + c * 36; for (let y = 60; y < 134; y++) for (let xx = x - 6; xx <= x + 6; xx++) px.dpx(xx, y, px.ramp(hexes(['#10101c', '#3a3a5a', '#8a8ab0', '#d0d0f0']), clamp(0.5 - (xx - x) * 0.04 + lit * 0.2, 0, 1), xx, y), k); } for (let y = 36; y < 60; y++) { const hw = (y - 36) / 24 * 150; for (let x = 240 - Math.round(hw); x <= 240 + Math.round(hw); x++) px.dpx(x, y, hex(y < 40 ? '#8a8ab0' : '#3a3a58'), k); } for (let x = 100; x <= 380; x++) for (let y = 56; y < 62; y++) px.dpx(x, y, hex('#5a5a80'), k); };
      return {
        render(t) {
          const U = px.cur(); for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const v = 0.06 + 0.1 * (1 - y / H) + 0.1 * Math.exp(-Math.pow((x - 240) / 170, 2)); U[y * W + x] = px.ramp(hexes(['#04040c', '#0c0c20', '#1c1c3c', '#3a3a68']), clamp(v, 0, 1), x, y); }
          stars(t, 0.8, 70, '#d0d8ff'); lib.land({ y0: 150, amp: 3, c1: '#1a1a24', c2: '#08080c', seed: 4, scroll: 0, k: 1 });
          const tk = S(1, 4, t); temple(tk, 0.5 + 0.5 * S(8, 20, t)); G(240, 100, 190, '#c8d0ff', 0.12 * tk);
          const m1 = S(6, 14, t), m2 = S(12, 20, t);
          for (let q = 0; q < 9; q++) { const x = 90 + q * 37.5; if (q / 8 <= m1) { lib.line(Math.round(x), 30, Math.round(x), 156, hex('#ffe08a'), 1); G(x, 30, 5, '#fff0b0', 0.5); } }
          for (let q = 0; q < 6; q++) { const y = 34 + q * 24; if (q / 5 <= m2) { lib.line(86, y, 394, y, hex('#ffe08a'), 1); G(86, y, 5, '#fff0b0', 0.5); } }
          const rx = lerp(30, 90 + 300 * S(6, 22, t), 1), ry = 150 - 60 * S(6, 14, t); lib.line(14, 190, Math.round(rx), Math.round(ry), hex('#d8b070'), 2); G(rx, ry, 14, '#ffe9a0', 0.7 * S(5, 8, t));
          lib.altar2({ cx: 240, by: 168, w: 54, h: 16, k: tk, t, glow: 0.8, fire: 0.6 * tk });
          const wk = S(14, 24, t); for (let i = 0; i < 24; i++) { const x = 130 + (i % 12) * 18 + (px.hash(i, 1, 2) - 0.5) * 6, y = 164 + Math.floor(i / 12) * 10; lib.person({ x, y, h: 11, k: wk, col: '#e8d8a8' }); G(x, y - 7, 6, '#ffe9a0', 0.4 * wk * (0.5 + 0.5 * S(14 + i * 0.4, 24, t))); }
          const ck = S(23, 28, t); for (let i = 0; i < 46; i++) { const x = ((i * 31 + t * 18) % 640) - 80, y = 178 + (i % 3) * 7; lib.person({ x, y, h: 20 + (i % 4), k: ck, col: '#050408' }); }
          for (let i = 0; i < 80; i++) px.dpx(Math.round(px.hash(i, 1, 4) * W), 176 + Math.round(px.hash(i, 2, 4) * 20), hex('#6a3a28'), 0.3 * ck);
          if (t > 40) { const tt = '42 MONTHS', tw = px.textWidth(tt, 4, 1); px.text(tt, Math.round(240 - tw / 2), 12, 4, hex('#ffd890'), S(40, 43, t) * (1 - S(49, 52, t)) * 0.9); }
          px.post({ vignette: 1.2, flash: 0, fade: Math.max(1 - S(0, 1.4, t), S(56, 58, t)), fadeCol: hex('#000000') }); lib.titleCard(t, 'MEASURE', 40);
        },
      };
    },

    score(A, from) {
      const D2 = 73.42, D3 = 146.83, A3 = 220, D4 = 293.66, F4 = 349.23, Fs4 = 369.99, A4 = 440, D5 = 587.33, F5 = 698.46, Fs5 = 739.99, A5 = 880, D6 = 1174.66;
      A.drone(0, 58, D2, { gain: 0.06, attack: 2.0, release: 3.0 });
      A.choir(3, 24, [D3, A3, D4], { gain: 0.05, attack: 4.0, release: 2.0, vowel: 0.7 });
      for (let q = 7; q < 20; q += 1.3) A.bell(q, [D5, Fs5, A5, D6][Math.floor(q) % 4], { gain: 0.04, dur: 4 });
      A.boom(22.8, { freq: 44, gain: 0.5, dur: 4 });
      for (let q = 24; q < 52; q += 0.9) A.boom(q, { freq: 48, gain: 0.18, dur: 0.5 });
      A.choir(24, 58, [D3, F4, A3], { gain: 0.05, attack: 4.0, release: 3.0, vowel: 0.3 }); A.brass(40, 52, D3, { gain: 0.07, attack: 1.0, release: 3.0, sweep: [[40, 500], [48, 1400]] });
    },
  });
})();
