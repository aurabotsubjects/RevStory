/* ============================================================================
 *  REVELATION · PIXEL EDITION · Episode 56 · The Cup of God's Wrath · Revelation 14:9–11
 *  2D pixel-art cut (480x200). A third angel with a more severe voice: those who worship the beast and its image and take its mark will drink the wine of God fury. Stern and controlled, with no gore: a dark crimson sky, a great cup glowing with deep red wine, smoke rising in silhouette. No faces.
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

  Aura.define(56, {
    pixel: true,
    duration: 52,
    cues: [
      { ref: '14:9', t0: 5.0, t1: 18.0 },
      { ref: '14:10', t0: 19.0, t1: 34.0 },
      { ref: '14:11', t0: 35.0, t1: 48.0 },
    ],
    titles: [],

    build(ctx) {
      const angel = (x, y, s, k, t, seed, o) => { o = o || {}; lib.lightFig({ x, y, h: 44 * s, a: k, t, seed, sway: 0.3, glow: o.glow === undefined ? 1.2 : o.glow }); lib.wings({ x, y: y - 28 * s, s: 0.9 * s, k: k * 0.85, t: t * 1.5 + seed, spread: o.spread === undefined ? 0.7 : o.spread, eyes: 0, n: 2 }); };
      const cup = (x, y, s, k, t, fill) => { if (k <= 0.01) return; G(x, y - 10 * s, 70 * s, '#ff3a18', 0.35 * k * fill); lib.ell(x, y - 30 * s, 30 * s, 8 * s, (X, Y, dx, dy) => px.dpx(X, Y, hex('#e8b04a'), k)); for (let yy = 0; yy < 28 * s; yy++) { const u = yy / (28 * s), hw = lerp(30, 12, Math.sqrt(u)) * s; for (let xx = Math.round(x - hw); xx <= Math.round(x + hw); xx++) px.dpx(xx, Math.round(y - 30 * s + yy), px.ramp(hexes(['#6a4a18', '#b8802a', '#ffd070', '#fff0b0']), clamp(0.55 - (xx - x) / hw * 0.4 + 0.2 * (1 - u), 0, 1), xx, yy), k); } lib.line(Math.round(x), Math.round(y - 2 * s), Math.round(x), Math.round(y + 14 * s), hex('#c8902a'), Math.max(2, Math.round(4 * s))); lib.ell(x, y + 16 * s, 16 * s, 4 * s, (X, Y) => px.dpx(X, Y, hex('#b8802a'), k)); lib.ell(x, y - 30 * s, 28 * s, 6 * s, (X, Y, dx, dy) => px.dpx(X, Y, px.ramp(hexes(['#3a0408', '#8a0c14', '#e02030', '#ff7080']), clamp(0.5 + 0.2 * Math.sin(X * 0.3 + t * 2) - dy * 0.2, 0, 1), X, Y), k * fill)); };
      return {
        render(t) {
          const U = px.cur();
          lib.skyGrad({ t, top: '#10040a', mid: '#4a0e18', bot: '#a02a20', cloud: 0.5, wind: 0.2, y1: 170, dark: 0.3 });
          for (let y = 170; y < H; y++) for (let x = 0; x < W; x++) U[y * W + x] = px.ramp(hexes(['#0a0204', '#1a0608', '#3a1010']), clamp(0.3 + (y - 170) * 0.01, 0, 1), x, y);
          const sm = S(35, 42, t); for (let c = 0; c < 6; c++) { const x = 40 + c * 78; for (let j = 0; j < 36; j++) { const q = (j / 36 + t * 0.04 + px.hash(c, 1, 2)) % 1, X = x + Math.sin(q * 6 + c) * (6 + q * 24), Y = 175 - q * 175; lib.ell(X, Y, 8 + q * 22, 6 + q * 12, (a, b) => px.dpx(a, b, hex('#06020a'), 0.35 * sm * (1 - q * 0.6))); } G(x, 172, 40, '#ff3a18', 0.35 * sm); }
          const ak = S(2, 7, t); angel(240, 168, 2.2, ak, t, 3, { glow: 0.5, spread: 0.4 }); G(240, 70, 70, '#ff8a60', 0.2 * ak);
          const sh = S(5, 9, t); for (let r = 0; r < 3; r++) { const a = ((t - 6) * 0.5 + r * 0.33) % 1; if (t > 6) for (let i = 0; i < 80; i++) { const an = i / 80 * 6.283; px.dpx(Math.round(240 + Math.cos(an) * a * 260), Math.round(80 + Math.sin(an) * a * 70), hex('#ff6a40'), 0.3 * (1 - a) * sh * (t < 20 ? 1 : 0.4)); } }
          const ck = S(19, 24, t); cup(240, 160 - 10 * S(19, 24, t), 1.6, ck, t, S(22, 28, t));
          px.post({ vignette: 1.5, flash: 0, fade: Math.max(1 - S(0, 1.4, t), S(50, 52, t)), fadeCol: hex('#000000') }); lib.titleCard(t, 'THE CUP', 56);
        },
      };
    },

    score(A, from) {
      const D2 = 73.42, D3 = 146.83, A3 = 220, D4 = 293.66, F4 = 349.23, Fs4 = 369.99, A4 = 440, D5 = 587.33, F5 = 698.46, Fs5 = 739.99, A5 = 880, D6 = 1174.66;
      A.drone(0, 52, D2 * 0.75, { gain: 0.09, attack: 2.0, release: 3.0 });
      A.boom(5.2, { freq: 36, gain: 0.7, dur: 4 }); A.brass(5.2, 18, D3 / 2, { gain: 0.09, attack: 0.3, release: 3.0, sweep: [[5.2, 500], [12, 300]] }); A.choir(4, 20, [D3, F4, Fs4], { gain: 0.06, attack: 3.0, release: 2.0, vowel: 0.3 });
      A.bell(21, D5, { gain: 0.05, dur: 10 }); A.choir(19, 52, [D3, F4, A3], { gain: 0.05, attack: 4.0, release: 4.0, vowel: 0.4 });
      for (let q = 20; q < 48; q += 2.4) A.boom(q, { freq: 40, gain: 0.3, dur: 2 });
      A.noise({ t0: 35, t1: 50, gain: [[35, 0.0], [42, 0.22], [50, 0]], filter: { type: 'lowpass', freq: 500, q: 1 }, wet: 0.5, attack: 2, release: 3 });
    },
  });
})();
