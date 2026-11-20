/* ============================================================================
 *  REVELATION · PIXEL EDITION · Episode 43 · Come Up Here · Revelation 11:11–14
 *  2D pixel-art cut (480x200). After three and a half days the breath of life enters them, in macro close-up; they stand and terror falls on those watching. A voice from heaven: Come up here. They rise in a cloud, the camera following them up through cloud. A severe earthquake, a tenth of the city falls; the survivors give glory to God. No faces.
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

  Aura.define(43, {
    pixel: true,
    duration: 62,
    cues: [
      { ref: '11:11', t0: 5.0, t1: 16.0 },
      { ref: '11:12', t0: 17.0, t1: 30.0 },
      { ref: '11:13', t0: 31.0, t1: 46.0 },
      { ref: '11:14', t0: 47.0, t1: 58.0 },
    ],
    titles: [],

    build(ctx) {
      const shock = (cx, k, seed) => { lib.ell(cx, 104, 40, 50, (X, Y, dx, dy) => px.set(X, Y, mix(hex('#06040a'), px.ramp(hexes(['#3a2018', '#7a4a38', '#c89070']), clamp(0.5 - dx * 0.3 - dy * 0.2, 0, 1), X, Y), k))); for (const q of [-1, 1]) { lib.ell(cx + q * 14, 92, 7, 8, (X, Y) => px.set(X, Y, hex('#f8f0e0'))); px.set(cx + q * 14, 92, hex('#000000')); px.set(cx + q * 14 + 1, 92, hex('#000000')); } lib.ell(cx, 128, 9, 12, (X, Y) => px.set(X, Y, hex('#100408'))); };
      return {
        render(t) {
          const U = px.cur();
          if (t < 17) {
            for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const n = px.fbm(x * 0.05, y * 0.12, 4, 8); U[y * W + x] = px.ramp(hexes(['#04060c', '#101420', '#242a3c', '#4a5470']), clamp(0.15 + n * 0.5 - (y - 100) * 0.001, 0, 1), x, y); }
            const br = S(5, 12, t); for (let i = 0; i < 80; i++) { const q = ((t - 5) * 0.12 + i / 80) % 1, x = px.hash(i, 1, 4) * 120 + 60 + q * 60, y = 60 + px.hash(i, 2, 4) * 90 - q * 20; G(x, y, 3 + 4 * (1 - q), '#ffe9a0', 0.8 * br * (1 - q)); }
            G(240, 110, 80 + 60 * S(10, 16, t), '#ffd890', 0.5 * S(8, 16, t));
            for (let f = 0; f < 5; f++) { const x = 320 + f * 12, bend = S(12 + f * 0.3, 16, t) * 24; lib.line(x, 190, Math.round(x - 6 - bend * 0.3), Math.round(150 - bend), hex('#8a6a50'), 4); } G(350, 130, 40, '#ffd890', 0.3 * S(12, 16, t));
            px.post({ vignette: 1.6, flash: 0, fade: Math.max(1 - S(0, 1.4, t), S(16.2, 17, t)), fadeCol: hex('#000000') }); lib.titleCard(t, 'COME UP HERE', 43); return;
          }
          if (t < 31) {
            const up = (t - 17) / 13, cs = up * 700;
            for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) U[y * W + x] = px.ramp(hexes(['#2a3a68', '#6a8ac0', '#c8d8f0', '#fff0c8', '#ffffff']), clamp(0.15 + 0.7 * up + 0.2 * (1 - y / H), 0, 1), x, y);
            for (let i = 0; i < 16; i++) { const cy = ((px.hash(i, 1, 3) * 500 + cs * (0.5 + 0.8 * px.hash(i, 2, 3))) % 560) - 60, cx = px.hash(i, 3, 3) * 520 - 20, r = 30 + px.hash(i, 4, 3) * 50; lib.ell(cx, cy, r, r * 0.4, (X, Y, dx, dy) => px.dpx(X, Y, mix(hex('#a0a8c8'), hex('#ffffff'), clamp(0.55 - dy * 0.4, 0, 1)), 0.9)); }
            const k = S(17, 20, t); for (const [x, d] of [[210, 0], [270, 1]]) { G(x, 100, 60, '#ffe9a0', 0.5 * k); lib.person({ x, y: 150 + Math.sin(t + d) * 3, h: 80, k, col: '#e8d8b0' }); lib.line(x - 6, 100, x - 18, 118, hex('#e8d8b0'), 2); lib.line(x + 6, 100, x + 18, 118, hex('#e8d8b0'), 2); } G(240, 20, 90, '#ffffff', 0.7 * up);
            px.post({ vignette: 0.8, flash: 0, fade: Math.max(S(16, 17.4, t) < 1 && t < 17.5 ? 1 - S(16, 17.4, t) : 0, S(30, 31, t)), fadeCol: hex('#ffffff') }); return;
          }
          if (t < 36) { for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) U[y * W + x] = hex('#08060a'); const idx = Math.min(2, Math.floor((t - 31) / 1.7)); shock([110, 240, 370][idx], 1, idx); G(240, 100, 190, '#ffd890', 0.2); px.post({ vignette: 1.6, flash: 0, fade: 0, fadeCol: hex('#000000') }); return; }
          lib.skyGrad({ t, top: '#4a3a60', mid: '#9a6a60', bot: '#e0a070', cloud: 0.4, wind: 0.2, y1: 160, dark: 0.2 });
          const eq = t < 46 ? S(36, 37, t) * (1 - S(44, 46, t)) : 0, col = S(37, 42, t);
          for (let b = 0; b < 16; b++) { const fallB = px.hash(b, 9, 3) < 0.34 ? S(38 + px.hash(b, 1, 3) * 4, 44, t) : 0, x = b * 31 - 6 + (px.hash(b, 4, 3) - 0.5) * 6 * fallB, h = (50 + px.hash(b, 1, 3) * 70) * (1 - 0.85 * fallB), tl = fallB * (px.hash(b, 5, 3) - 0.5) * 0.5; for (let y = Math.round(160 - h); y < 160; y++) for (let xx = Math.round(x);  xx < x + 28; xx++) px.dpx(Math.round(xx + (160 - y) * tl), y, px.ramp(hexes(['#10101a', '#2a2a3c', '#5a5a70', '#908a98']), clamp(0.3 + (xx - x) * 0.01 + 0.05 * px.hash(xx, y, 2), 0, 1), xx, y), 1); if (fallB > 0.05 && fallB < 0.99) for (let i = 0; i < 12; i++) G(x + 14 + (px.hash(i, b, 6) - 0.5) * 50, 150 - px.hash(i, b, 7) * 60 * fallB, 8, '#b09a88', 0.3); }
          for (let y = 160; y < H; y++) for (let x = 0; x < W; x++) px.set(x, y, px.ramp(hexes(['#1a1614', '#3a3028', '#6a5a48']), clamp(0.3 + (y - 160) * 0.004, 0, 1), x, y));
          const gk = S(47, 52, t); crowd(190, 30, 0.9, 7, 24, '#0a0608', 10, 470); for (let i = 0; i < 30; i++) { const x = 10 + 460 * (i + px.hash(i, 7, 3) * 0.7) / 30; lib.line(Math.round(x - 3), 170, Math.round(x - 6), 160, hex('#0a0608'), 1); lib.line(Math.round(x + 3), 170, Math.round(x + 6), 160, hex('#0a0608'), 1); G(x, 160, 12, '#ffd890', 0.4 * gk); }
          tint(150, H, '#8a7a6a', 0.2 * col * (1 - gk));
          px.post({ vignette: 1.2, flash: 0, fade: Math.max(S(35, 36.4, t) < 1 && t < 36.5 ? 1 - S(35, 36.4, t) : 0, S(57, 58, t)), fadeCol: hex('#000000') }); shake(Math.sin(t * 57) * eq * 6, Math.sin(t * 43) * eq * 5);
        },
      };
    },

    score(A, from) {
      const D2 = 73.42, D3 = 146.83, A3 = 220, D4 = 293.66, F4 = 349.23, Fs4 = 369.99, A4 = 440, D5 = 587.33, F5 = 698.46, Fs5 = 739.99, A5 = 880, D6 = 1174.66;
      A.drone(0, 62, D2, { gain: 0.06, attack: 2.0, release: 3.0 });
      A.shimmer(5, A5, { dur: 11, gain: 0.05 }); A.choir(8, 17, [D3, A3, D4], { gain: 0.05, attack: 4.0, release: 1.0, vowel: 0.8 }); A.boom(15, { freq: 40, gain: 0.5, dur: 3 });
      A.choir(17, 31, [D3, A3, D4, Fs4, A4], { gain: 0.08, attack: 3.0, release: 1.5, vowel: 1.0 }); A.brass(17, 31, D3, { gain: 0.08, attack: 2.0, release: 2.0, sweep: [[17, 500], [29, 2000]] }); A.riser(18, 30.5, { from: 100, to: 1500, gain: 0.12 });
      [31, 32.7, 34.4].forEach((q) => A.boom(q + 0.05, { freq: 42, gain: 0.7, dur: 2 }));
      A.boom(36.2, { freq: 30, gain: 1.0, dur: 7 }); A.noise({ t0: 36.2, t1: 46, gain: [[36.2, 0.6], [46, 0]], filter: { type: 'lowpass', freq: 900, q: 1 }, wet: 0.4, attack: 0.02, release: 3 });
      A.choir(47, 62, [D3, A3, D4, Fs4], { gain: 0.07, attack: 3.0, release: 3.0, vowel: 1.0 }); A.bell(47.5, D5, { gain: 0.07, dur: 10 }); A.shimmer(48, A5, { dur: 10, gain: 0.05 });
    },
  });
})();
