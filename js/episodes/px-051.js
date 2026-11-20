/* ============================================================================
 *  REVELATION · PIXEL EDITION · Episode 51 · Forty-Two Months · Revelation 13:5–10
 *  2D pixel-art cut (480x200). A claustrophobic, dark, imperial mood on a tilted frame. The beast is given a mouth to utter proud words for forty-two months; shadows swallow the small light of the faithful, while the Lamb book of life glows in counter-image. It closes on a defiant candle flame. No faces.
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

  Aura.define(51, {
    pixel: true,
    duration: 56,
    cues: [
      { ref: '13:5', t0: 5.0, t1: 14.0 },
      { ref: '13:6', t0: 15.0, t1: 24.0 },
      { ref: '13:7', t0: 25.0, t1: 36.0 },
      { ref: '13:8', t0: 37.0, t1: 46.0 },
      { ref: '13:9', t0: 47.0, t1: 50.0 },
      { ref: '13:10', t0: 51.0, t1: 54.0 },
    ],
    titles: [],

    build(ctx) {
      const cosmos = (t, a, y1) => { const U = px.cur(); for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const n = px.fbm(x * 0.012 + t * 0.004, y * 0.02, 3, 7); U[y * W + x] = px.ramp(hexes(['#02030a', '#080c20', '#10183a', '#1c2a58']), clamp(0.08 + n * a + 0.08 * (1 - y / H), 0, 1), x, y); } };
      const tilt = (a) => { if (Math.abs(a) < 0.001) return; const U = px.cur(), C = U.slice(), ca = Math.cos(a), sa = Math.sin(a); for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const X = x - 240, Y = y - 100, sx = Math.round(240 + X * ca - Y * sa), sy = Math.round(100 + X * sa + Y * ca); U[y * W + x] = C[clamp(sy, 0, H - 1) * W + clamp(sx, 0, W - 1)]; } };
      return {
        render(t) {
          const U = px.cur(); for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const n = px.fbm(x * 0.02 + t * 0.01, y * 0.03, 3, 6); U[y * W + x] = px.ramp(hexes(['#030204', '#0a0608', '#1a1010', '#2a1a18']), clamp(0.12 + n * 0.4, 0, 1), x, y); }
          if (t < 25) {
            const open = S(4, 12, t), jaw = 40 * open + 8 * Math.sin(t * 4) * open;
            for (let x = 0; x < W; x++) for (let y = 0; y < H; y++) { const top = 70 - jaw - 10 * Math.sin(x * 0.03), bot = 130 + jaw + 10 * Math.sin(x * 0.04 + 1); if (y < top) px.set(x, y, mix(hex('#14080a'), hex('#4a1a14'), clamp((top - y) * 0.01, 0, 1))); else if (y > bot) px.set(x, y, hex('#14080a')); else px.dpx(x, y, hex('#3a0808'), 0.55 * open); }
            for (let i = 0; i < 18; i++) { const x = 20 + i * 26, th = 20 + 12 * px.hash(i, 1, 2); for (let q = 0; q < th; q++) { const hw = (th - q) * 0.3; lib.line(Math.round(x - hw), Math.round(70 - jaw + q - 6), Math.round(x + hw), Math.round(70 - jaw + q - 6), hex('#d8c8a0'), 1); lib.line(Math.round(x - hw), Math.round(130 + jaw - q + 6), Math.round(x + hw), Math.round(130 + jaw - q + 6), hex('#c8b890'), 1); } }
            for (let i = 0; i < 90; i++) { const q = ((t - 5) * 0.15 + px.hash(i, 1, 3)) % 1, x = 60 + px.hash(i, 2, 3) * 360, y = 100 - q * 110; if (t > 6) { lib.line(Math.round(x), Math.round(y), Math.round(x + 4 + px.hash(i, 3, 3) * 6), Math.round(y), hex('#a02818'), 1); px.dpx(Math.round(x), Math.round(y) + 2, hex('#5a1810'), 0.7); } }
            const tt = 'FORTY-TWO MONTHS', tw = px.textWidth(tt, 3, 1); px.text(tt, Math.round(240 - tw / 2), 170, 3, hex('#ffd0a0'), S(6, 9, t) * (1 - S(22, 25, t)) * 0.8);
          } else if (t < 37) {
            const sw = S(25, 36, t); for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283, x = Math.round(240 + Math.cos(a) * 46), y = Math.round(150 + Math.sin(a) * 14); lib.person({ x, y, h: 20, k: 1, col: '#1a1014' }); G(x + 4, y - 8, 12 * (1 - sw * 0.85), '#ffc060', 0.7 * (1 - sw)); }
            G(240, 150, 100 * (1 - sw * 0.9), '#ffb050', 0.35 * (1 - sw));
            for (let b = 0; b < 8; b++) { const a = b / 8 * 6.283 + t * 0.2, rr = 300 * (1 - sw * 0.9) + 20; lib.ell(240 + Math.cos(a) * rr, 150 + Math.sin(a) * rr * 0.5, 80, 50, (X, Y) => px.dpx(X, Y, hex('#020103'), 0.9)); }
          } else if (t < 47) {
            const bk = S(37, 41, t); G(240, 110, 130, '#ffe9a0', 0.55 * bk); lib.ell(240, 110, 48, 34, (X, Y, dx, dy) => { if (Math.abs(dx) < 0.98) px.dpx(X, Y, px.ramp(hexes(['#7a4a1a', '#b8802a', '#ffd070', '#fff6d0']), clamp(0.6 - dy * 0.2 + dx * 0.1, 0, 1), X, Y), bk); }); lib.line(240, 80, 240, 140, hex('#8a5a20'), 2);
            for (let r = 0; r < 9; r++) for (let q = 0; q < 2; q++) { for (let c = 0; c < 5; c++) px.dpx(Math.round(200 + q * 44 + c * 6 + 3), Math.round(90 + r * 5), hex('#a07030'), 0.8 * bk); }
            lib.lamb({ x: 240, y: 90, s: 0.8, k: bk * 0.9, t, glow: 1.2 });
          } else {
            const ck = S(47, 51, t); lib.flame({ x: 240, y: 150, s: 2.6, k: ck, t, seed: 3, glow: 1.4 }); G(240, 140, 90, '#ffb050', 0.35 * ck); G(240, 140, 30, '#ffe9a0', 0.4 * ck);
          }
          tilt(0.16); px.post({ vignette: 1.9, flash: 0, fade: Math.max(1 - S(0, 1.4, t), S(54, 56, t)), fadeCol: hex('#000000') }); lib.titleCard(t, 'FORTY-TWO', 51);
        },
      };
    },

    score(A, from) {
      const D2 = 73.42, D3 = 146.83, A3 = 220, D4 = 293.66, F4 = 349.23, Fs4 = 369.99, A4 = 440, D5 = 587.33, F5 = 698.46, Fs5 = 739.99, A5 = 880, D6 = 1174.66;
      A.drone(0, 56, D2 * 0.75, { gain: 0.09, attack: 2.0, release: 3.0 });
      A.choir(4, 25, [D3, F4, Fs4], { gain: 0.06, attack: 4.0, release: 3.0, vowel: 0.2 }); A.brass(5, 25, D3, { gain: 0.08, attack: 3.0, release: 2.0, sweep: [[5, 250], [22, 900]] });
      A.noise({ t0: 5, t1: 25, gain: [[5, 0.0], [14, 0.15], [25, 0]], filter: { type: 'bandpass', freq: 500, q: 0.8 }, wet: 0.4, attack: 2, release: 2 });
      for (let q = 25; q < 36; q += 1.1) A.boom(q, { freq: 38, gain: 0.35, dur: 1.4 });
      A.bell(37.5, D5, { gain: 0.08, dur: 9 }); A.shimmer(37.5, A5, { dur: 9, gain: 0.05 }); A.choir(37, 47, [D3, A3, D4], { gain: 0.05, attack: 2.0, release: 2.0, vowel: 0.8 });
      A.choir(47, 56, [D3, A3, D4, Fs4], { gain: 0.06, attack: 2.0, release: 3.0, vowel: 0.9 }); A.bell(49, A4, { gain: 0.07, dur: 8 });
    },
  });
})();
