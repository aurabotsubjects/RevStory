/* ============================================================================
 *  REVELATION · PIXEL EDITION · Episode 42 · The Witnesses Fall · Revelation 11:7–10
 *  2D pixel-art cut (480x200). A dark shape from the Abyss rises beneath the square, shown only in shadow. The two fall. A sky-high shot of the great city celebrating, lanterns and crowds, then a cold close view of the still figures. Three and a half days. Non-graphic. No faces.
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

  Aura.define(42, {
    pixel: true,
    duration: 62,
    cues: [
      { ref: '11:7', t0: 5.0, t1: 17.0 },
      { ref: '11:8', t0: 18.0, t1: 30.0 },
      { ref: '11:9', t0: 31.0, t1: 44.0 },
      { ref: '11:10', t0: 45.0, t1: 58.0 },
    ],
    titles: [],

    build(ctx) {
      const bld = (k, t) => { for (let b = 0; b < 22; b++) { const x = b * 22 - 4, h = 40 + px.hash(b, 1, 3) * 70; for (let y = Math.round(140 - h); y < 150; y++) for (let xx = x; xx < x + 20; xx++) px.dpx(xx, y, px.ramp(hexes(['#0a0810', '#1a1424', '#2a2438', '#4a4058']), clamp(0.3 + (xx - x) * 0.01 + 0.05 * px.hash(xx, y, 2), 0, 1), xx, y), k); for (let q = 0; q < 6; q++) px.dpx(x + 4 + Math.floor(px.hash(b, q, 8) * 12), 140 - h + 6 + Math.floor(px.hash(b, q + 5, 8) * (h - 10)), hex('#ffc060'), 0.8 * k * (0.5 + 0.5 * Math.sin(t + q + b))); } };
      const lie = (x, y, k, col) => { lib.ell(x, y, 30, 5, (X, Y) => px.dpx(X, Y, hex(col), k)); lib.ell(x + 28, y - 2, 6, 5, (X, Y) => px.dpx(X, Y, hex('#8a6a50'), k)); };
      return {
        render(t) {
          const U = px.cur();
          if (t < 31) {
            lib.skyGrad({ t, top: '#0a0818', mid: '#2a1a38', bot: '#6a3a40', cloud: 0.3, wind: 0.2, y1: 150, dark: 0.4 }); bld(1, t);
            for (let y = 148; y < H; y++) for (let x = 0; x < W; x++) px.set(x, y, px.ramp(hexes(['#0c0a0c', '#2a2020', '#4a3a30']), clamp(0.3 + (y - 148) * 0.003, 0, 1), x, y));
            const fl = S(5, 6, t);
            const rise = S(5, 14, t), fall = S(14, 20, t);
            for (const [x, d] of [[200, 0], [280, 1]]) { if (fall < 0.99) { lib.person({ x, y: 190, h: 100 * (1 - fall * 0.8), k: 1, col: '#4a3a2a' }); G(x, 100, 30, '#ffd890', 0.2 * (1 - fall)); } else lie(x + (d ? 20 : -40), 194, 1, '#4a3a2a'); }
            const bk = rise * (1 - S(24, 30, t) * 0.3); for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const e = Math.pow((x - 240) / (170 * bk + 1), 2) + Math.pow((y - (240 - 170 * bk)) / (170 * bk + 1), 2); if (e < 1 && bk > 0.02) { const n = px.fbm(x * 0.05 + t * 0.2, y * 0.05, 3, 11); px.dpx(x, y, hex(n > 0.55 ? '#14060a' : '#06020a'), 0.96); if (e > 0.85 && n < 0.5) px.dpx(x, y, hex('#601010'), 0.5); } }
            if (bk > 0.4) { G(205, 110, 12, '#ff2010', 0.6 * bk * (1 - S(24, 30, t))); G(275, 110, 12, '#ff2010', 0.6 * bk * (1 - S(24, 30, t))); }
            px.post({ vignette: 1.4, flash: Math.exp(-Math.max(0, t - 14) * 2) * (t > 14 ? 0.5 : 0), flashCol: hex('#ff4020'), fade: Math.max(1 - S(0, 1.4, t), S(30, 31, t)), fadeCol: hex('#000000') }); shake(Math.sin(t * 40) * (t > 14 && t < 16 ? 4 : 0), 0);
            lib.titleCard(t, 'THE WITNESSES FALL', 42); return;
          }
          if (t < 45) {
            for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) U[y * W + x] = hex('#080610');
            const ph = (t - 31) / 14;
            for (let r = 0; r < 14; r++) for (let c = 0; c < 24; c++) { const x = c * 20 + 4, y = 10 + r * 14; px.dpx(x, y, hex('#241c30'), 0.9); lib.ell(x + 4, y + 3, 7, 5, (X, Y) => px.dpx(X, Y, hex('#1a1424'), 0.9)); if (px.hash(c, r, 5) < 0.35) G(x + 4, y + 3, 4, '#ffc060', 0.7 * (0.5 + 0.5 * Math.sin(t * 2 + c + r))); }
            for (let i = 0; i < 90; i++) { const q = (t * 0.06 + px.hash(i, 1, 2)) % 1, x = px.hash(i, 2, 2) * W + Math.sin(q * 6 + i) * 6, y = 200 - q * 200; G(x, y, 4, i % 3 === 0 ? '#ff6a28' : '#ffc060', 0.8); lib.line(Math.round(x), Math.round(y) + 3, Math.round(x), Math.round(y) + 8, hex('#6a3a20'), 1); }
            crowd(196, 40, 0.9, 5, 14, '#0a0610', 0, 480);
            px.post({ vignette: 1.2, flash: 0, fade: Math.max(S(30, 31.4, t) < 1 && t < 31.5 ? 1 - S(30, 31.4, t) : 0, S(44, 45, t)), fadeCol: hex('#000000') }); return;
          }
          for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) U[y * W + x] = px.ramp(hexes(['#04060c', '#0c1424', '#1a2840', '#34486a']), clamp(0.2 + 0.2 * (y / H) + 0.04 * px.fbm(x * 0.03, y * 0.05, 2, 2), 0, 1), x, y);
          stars(t, 0.5, 80, '#a8c0ff'); lib.ell(240, 190, 220, 12, (X, Y) => px.dpx(X, Y, hex('#1a2030'), 0.9)); lie(150, 170, 1, '#3a3a44'); lie(330, 176, 1, '#3a3a44');
          G(240, 120, 150, '#a8c0ff', 0.1); const tk = S(46, 50, t) * (1 - S(55, 58, t)); const tt = '3 1/2 DAYS'; const tw = px.textWidth('THREE AND A HALF DAYS', 3, 1); px.text('THREE AND A HALF DAYS', Math.round(240 - tw / 2), 40, 3, hex('#b8c8f0'), tk * 0.85);
          px.post({ vignette: 1.5, flash: 0, fade: Math.max(S(44, 45.4, t) < 1 && t < 45.5 ? 1 - S(44, 45.4, t) : 0, S(57, 58, t)), fadeCol: hex('#000000') });
        },
      };
    },

    score(A, from) {
      const D2 = 73.42, D3 = 146.83, A3 = 220, D4 = 293.66, F4 = 349.23, Fs4 = 369.99, A4 = 440, D5 = 587.33, F5 = 698.46, Fs5 = 739.99, A5 = 880, D6 = 1174.66;
      A.drone(0, 62, D2 * 0.75, { gain: 0.07, attack: 2.0, release: 3.0 });
      A.riser(5, 14, { from: 60, to: 400, gain: 0.14 }); A.boom(14.2, { freq: 34, gain: 0.8, dur: 6 }); A.choir(12, 30, [D3, F4, Fs4], { gain: 0.05, attack: 3.0, release: 3.0, vowel: 0.2 });
      A.brass(18, 30, D3, { gain: 0.06, attack: 2.0, release: 3.0, sweep: [[18, 300], [28, 900]] });
      A.drone(31, 45, D2, { gain: 0.05, attack: 1.0, release: 1.0 });
      for (let q = 31; q < 45; q += 0.75) A.bell(q, [D5, F5, A5, D6][Math.floor(q * 2) % 4], { gain: 0.035, dur: 1.5 }); A.noise({ t0: 31, t1: 45, gain: [[31, 0.05], [38, 0.15], [44, 0.05]], filter: { type: 'bandpass', freq: 1800, q: 0.6 }, wet: 0.3, attack: 1, release: 1 });
      A.choir(45.5, 62, [D3, F4], { gain: 0.03, attack: 4.0, release: 4.0, vowel: 0.2 }); A.bell(48, D5, { gain: 0.04, dur: 10 });
    },
  });
})();
