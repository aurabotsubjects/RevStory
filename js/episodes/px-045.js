/* ============================================================================
 *  REVELATION · PIXEL EDITION · Episode 45 · A Woman Clothed with the Sun · Revelation 12:1–2
 *  2D pixel-art cut (480x200). A great sign in the heavens: a woman clothed with the sun, the moon under her feet, a crown of twelve stars, crying out in the pain of birth. A slow orbit around her in the star-field, made of light. No faces.
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

  Aura.define(45, {
    pixel: true,
    duration: 54,
    cues: [
      { ref: '12:1', t0: 5.0, t1: 30.0 },
      { ref: '12:2', t0: 31.0, t1: 46.0 },
    ],
    titles: [],

    build(ctx) {
      const cosmos = (t, a, y1) => { const U = px.cur(); for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const n = px.fbm(x * 0.012 + t * 0.004, y * 0.02, 3, 7); U[y * W + x] = px.ramp(hexes(['#02030a', '#080c20', '#10183a', '#1c2a58']), clamp(0.08 + n * a + 0.08 * (1 - y / H), 0, 1), x, y); } };
      return {
        render(t) {
          const orb = t * 0.14, sk = S(2, 10, t);
          cosmos(t, 0.35, 200); stars(t, 1, 200);
          for (let i = 0; i < 70; i++) { const x = (px.hash(i, 1, 9) * W + orb * 60 * (0.3 + px.hash(i, 2, 9))) % W, y = px.hash(i, 3, 9) * 190; px.dpx(Math.round(x), Math.round(y), hex('#c8d8ff'), 0.7); }
          lib.glory({ cx: 240, cy: 104, hy: 200, k: sk, rays: 1, t }); G(240, 104, 130, '#ffd070', 0.55 * sk);
          lib.ell(240, 104, 46, 46, (X, Y, dx, dy) => px.dpx(X, Y, mix(hex('#ffb040'), hex('#fff6d0'), clamp(0.7 - Math.hypot(dx, dy) * 0.5, 0, 1)), sk));
          const wk = S(5, 11, t); lib.lightFig({ x: 240, y: 186, h: 118, a: wk, t, seed: 5, sway: 0.15, glow: 1.5 });
          lib.ell(240, 188, 38, 9, (X, Y) => px.dpx(X, Y, hex('#e8eeff'), wk)); lib.ell(246, 185, 36, 8, (X, Y) => px.dpx(X, Y, hex('#0a1030'), wk * 0.9));
          for (let i = 0; i < 12; i++) { const a = i / 12 * 6.2832 + orb * 2, X = Math.round(240 + Math.cos(a) * 30), Y = Math.round(58 + Math.sin(a) * 8), z = Math.sin(a) > 0 ? 1 : 0.7; G(X, Y, 7, '#fff0b0', 0.8 * wk * S(14 + i * 0.5, 20 + i * 0.5, t) * z); px.set(X, Y, hex('#ffffff')); px.set(X + 1, Y, hex('#ffe9a0')); px.set(X - 1, Y, hex('#ffe9a0')); px.set(X, Y - 1, hex('#ffe9a0')); px.set(X, Y + 1, hex('#ffe9a0')); }
          const pk = S(31, 34, t); if (pk > 0) for (let r = 0; r < 4; r++) { const a = ((t - 31) * 0.7 + r * 0.25) % 1, rr = 10 + a * 90; for (let i = 0; i < 90; i++) { const an = i / 90 * 6.283; px.dpx(Math.round(240 + Math.cos(an) * rr), Math.round(136 + Math.sin(an) * rr * 0.8), hex(r % 2 ? '#ff7a50' : '#ffd890'), 0.6 * (1 - a) * pk); } }
          G(240, 136, 40 * (1 + 0.3 * Math.sin(t * 8)), '#ff8a60', 0.3 * pk);
          px.post({ vignette: 1.1, flash: 0, fade: Math.max(1 - S(0, 1.4, t), S(52, 54, t)), fadeCol: hex('#000000') }); shake(Math.sin(t * 47) * pk * 1.2, 0);
          lib.titleCard(t, 'THE WOMAN', 45);
        },
      };
    },

    score(A, from) {
      const D2 = 73.42, D3 = 146.83, A3 = 220, D4 = 293.66, F4 = 349.23, Fs4 = 369.99, A4 = 440, D5 = 587.33, F5 = 698.46, Fs5 = 739.99, A5 = 880, D6 = 1174.66;
      A.drone(0, 54, D2, { gain: 0.06, attack: 3.0, release: 3.0 });
      A.choir(3, 54, [D3, A3, D4, Fs4, A4], { gain: 0.07, attack: 5.0, release: 4.0, vowel: 1.0 }); A.shimmer(8, A5, { dur: 30, gain: 0.05 });
      for (let i = 0; i < 12; i++) A.bell(14 + i * 0.9, [D5, Fs5, A5, D6][i % 4], { gain: 0.04, dur: 4 });
      for (let q = 31; q < 46; q += 1.4) A.boom(q, { freq: 48, gain: 0.3, dur: 1.2 });
      A.brass(31, 46, D3, { gain: 0.05, attack: 3.0, release: 3.0, sweep: [[31, 400], [44, 1200]] });
    },
  });
})();
