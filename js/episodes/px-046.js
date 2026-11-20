/* ============================================================================
 *  REVELATION · PIXEL EDITION · Episode 46 · The Enormous Red Dragon · Revelation 12:3–6
 *  2D pixel-art cut (480x200). Another sign: an enormous red dragon with seven heads, ten horns and seven crowns. It rises from behind the stars; its tail sweeps a third of them to the earth. It waits before the woman to devour her child; the child is snatched up to God in a quick vertical rush of light, and she flees to the wilderness for 1,260 days. No faces.
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

  Aura.define(46, {
    pixel: true,
    duration: 62,
    cues: [
      { ref: '12:3', t0: 5.0, t1: 18.0 },
      { ref: '12:4', t0: 19.0, t1: 32.0 },
      { ref: '12:5', t0: 33.0, t1: 46.0 },
      { ref: '12:6', t0: 47.0, t1: 58.0 },
    ],
    titles: [],

    build(ctx) {
      const cosmos = (t, a, y1) => { const U = px.cur(); for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const n = px.fbm(x * 0.012 + t * 0.004, y * 0.02, 3, 7); U[y * W + x] = px.ramp(hexes(['#02030a', '#080c20', '#10183a', '#1c2a58']), clamp(0.08 + n * a + 0.08 * (1 - y / H), 0, 1), x, y); } };
      const hydra = (x, y, s, k, t, n, o) => {
        o = o || {}; if (k <= 0.01) return; const c1 = o.c1 || '#8a1208', c2 = o.c2 || '#ff4a20', dark = o.dark || '#2a0604', out = [];
        G(x, y - 10 * s, 80 * s, c2, 0.3 * k);
        for (let q = -1; q <= 1; q += 2) for (let f = 0; f < 9; f++) { const a = -0.5 - f * 0.17 + Math.sin(t * 1.5 + f * 0.1) * 0.05, L = (62 - f * 3) * s; lib.line(Math.round(x + q * 16 * s), Math.round(y - 12 * s), Math.round(x + q * Math.cos(a) * L), Math.round(y - 12 * s + Math.sin(a) * L), px.ramp(hexes([dark, c1, c2]), 0.2 + f * 0.03, f, q), 3); }
        for (let i = 0; i < n; i++) {
          const m = i - (n - 1) / 2, bx = x + m * 8 * s, by = y - 14 * s, a = -1.57 + m * 0.3 + Math.sin(t * 1.2 + i * 1.3) * 0.12, L = (50 + (i % 3) * 10) * s; let lx = bx, ly = by;
          for (let j = 1; j <= 10; j++) { const u = j / 10, nx = bx + Math.cos(a) * L * u + Math.sin(u * 3.14 + i) * 9 * s * (i % 2 ? 1 : -1), ny = by + Math.sin(a) * L * u; lib.line(Math.round(lx), Math.round(ly), Math.round(nx), Math.round(ny), px.ramp(hexes([dark, c1, c2]), 0.35 + 0.3 * (1 - u), j, i), Math.max(2, Math.round((9 - 5 * u) * s))); lx = nx; ly = ny; }
          lib.line(Math.round(lx), Math.round(ly), Math.round(lx + Math.cos(a + 0.6 * m) * 13 * s), Math.round(ly + Math.sin(a + 0.6 * m) * 6 * s - 3 * s), hex(c1), Math.max(3, Math.round(5 * s)));
          lib.ell(lx, ly, 9 * s, 6 * s, (X, Y, dx, dy) => px.dpx(X, Y, mix(hex(dark), hex(c2), clamp(0.4 - dy * 0.4 + dx * 0.2, 0, 1)), k));
          for (const q of [-1, 1]) lib.line(Math.round(lx + q * 3 * s), Math.round(ly - 4 * s), Math.round(lx + q * 6 * s), Math.round(ly - 11 * s), hex('#e8d0a0'), 1);
          G(lx + 3 * s, ly - 1, 3 * s, '#ffe040', 0.9 * k); if (o.crowns !== false) G(lx, ly - 7 * s, 4 * s, '#ffd070', 0.8 * k); out.push([lx, ly]);
        }
        lib.ell(x, y, 50 * s, 24 * s, (X, Y, dx, dy) => px.dpx(X, Y, mix(hex(dark), hex(c1), clamp(0.5 - dy * 0.5 + dx * 0.1 + 0.08 * px.fbm(X * 0.1, Y * 0.1, 2, 3), 0, 1)), k));
        for (let i = 0; i < 5; i++) lib.line(Math.round(x + 38 * s + i * 7 * s), Math.round(y + 4 * s + i * 2), Math.round(x + 60 * s + i * 9 * s), Math.round(y + 14 * s + Math.sin(t + i) * 4 * s), hex(c1), Math.max(2, Math.round(5 * s - i)));
        return out;
      };
      return {
        render(t) {
          const U = px.cur();
          if (t < 47) {
            cosmos(t, 0.3, 200);
            const dr = S(5, 14, t), dx = lerp(430, 300, S(5, 28, t)), dyy = lerp(260, 130, dr) - 10 * S(19, 28, t), ds = lerp(0.7, 1.7, dr);
            for (let i = 0; i < 120; i++) { const hs = px.hash(i, 5, 3) < 0.34, fall = hs ? S(19 + px.hash(i, 6, 3) * 8, 32, t) : 0; const x = px.hash(i, 1, 41) * W - fall * 90, y = px.hash(i, 2, 41) * 150 + fall * fall * 250; if (fall > 0.02) lib.line(Math.round(x), Math.round(y), Math.round(x + 8), Math.round(y - 20 * fall), hex('#ffd890'), 1); px.dpx(Math.round(x), Math.round(y), hex('#fff6e0'), 0.4 + 0.6 * Math.abs(Math.sin(t + i))); }
            hydra(dx, dyy, ds, dr, t, 7, {});
            if (t > 19) { const tk = S(19, 24, t), ph = S(19, 30, t); let lx = dx + 50 * ds, ly = dyy + 10 * ds; for (let j = 1; j <= 24; j++) { const u = j / 24, nx = dx + 50 * ds - u * 280 * ph - u * 30, ny = dyy + 10 * ds - Math.sin(u * 3.2 * (0.4 + ph)) * 110 * ph; lib.line(Math.round(lx), Math.round(ly), Math.round(nx), Math.round(ny), hex('#6a0e08'), Math.max(2, Math.round((8 - 6 * u) * ds * 0.5))); lx = nx; ly = ny; } }
            if (t >= 33) {
              const wk = S(33, 36, t) * (1 - S(44, 46, t)), snatch = S(41, 45, t); lib.lightFig({ x: 110, y: 188, h: 70, a: wk, t, seed: 2, sway: 0.2, glow: 1.0 });
              const cy2 = lerp(150, -30, snatch * snatch); const ck = S(35, 37, t); G(122, cy2, 12 + 20 * snatch, '#fff6d0', 0.95 * ck); px.set(122, Math.round(cy2), hex('#ffffff'));
              if (snatch > 0.02) for (let q = 0; q < 40; q++) lib.line(110 + (px.hash(q, 1, 2) - 0.5) * 70, 0, 110 + (px.hash(q, 1, 2) - 0.5) * 70, Math.round(cy2 + 200 * px.hash(q, 2, 2)), hex('#fff0c0'), 1);
              hydra(330, 150, 1.5, 1, t, 7, {}); const lunge = S(38, 41, t) * (1 - S(41, 43, t)); G(150, 140, 60 * lunge, '#ff3010', 0.6 * lunge);
            }
            px.post({ vignette: 1.1, flash: Math.exp(-Math.max(0, t - 43.5) * 2.5) * (t > 43.5 && t < 46 ? 1 : 0) * 0.9, flashCol: hex('#fff6d0'), fade: Math.max(1 - S(0, 1.4, t), S(46, 47, t)), fadeCol: hex('#000000') }); lib.titleCard(t, 'THE DRAGON', 46); return;
          }
          lib.skyGrad({ t, top: '#2a2a58', mid: '#a06a60', bot: '#f0b878', cloud: 0.2, wind: 0.3, y1: 130 });
          lib.land({ y0: 130, amp: 10, c1: '#b88a50', c2: '#6a4a28', seed: 5, scroll: t * 0.01, k: 1 }); lib.land({ y0: 160, amp: 8, c1: '#a07840', c2: '#4a3018', seed: 2, scroll: t * 0.03, k: 1 });
          lib.lightFig({ x: lerp(60, 380, S(47, 58, t)), y: 186, h: 36, a: S(47, 50, t), t, seed: 2, sway: 0.4, glow: 0.8 });
          const dk = '1,260 DAYS', tw = px.textWidth(dk, 4, 1); px.text(dk, Math.round(240 - tw / 2), 28, 4, hex('#fff0c0'), S(50, 53, t) * (1 - S(56, 58, t)) * 0.9);
          px.post({ vignette: 1.1, flash: 0, fade: Math.max(S(46, 47.4, t) < 1 && t < 47.5 ? 1 - S(46, 47.4, t) : 0, S(57, 58, t)), fadeCol: hex('#000000') });
        },
      };
    },

    score(A, from) {
      const D2 = 73.42, D3 = 146.83, A3 = 220, D4 = 293.66, F4 = 349.23, Fs4 = 369.99, A4 = 440, D5 = 587.33, F5 = 698.46, Fs5 = 739.99, A5 = 880, D6 = 1174.66;
      A.drone(0, 62, D2, { gain: 0.07, attack: 2.0, release: 3.0 });
      A.riser(5, 14, { from: 60, to: 500, gain: 0.14 }); A.boom(12, { freq: 34, gain: 0.8, dur: 6 }); A.brass(12, 32, D3, { gain: 0.08, attack: 1.5, release: 3.0, sweep: [[12, 300], [20, 1100]] });
      A.noise({ t0: 19, t1: 32, gain: [[19, 0.0], [24, 0.25], [32, 0]], filter: { type: 'bandpass', freq: 1200, q: 0.7 }, wet: 0.4, attack: 1, release: 2 });
      A.choir(33, 46, [D3, A3, D4], { gain: 0.05, attack: 2.0, release: 2.0, vowel: 0.7 }); A.boom(38.5, { freq: 40, gain: 0.6, dur: 3 });
      A.riser(41, 44.5, { from: 200, to: 2000, gain: 0.16 }); A.bell(44.6, D6, { gain: 0.09, dur: 8 }); A.boom(44.5, { freq: 50, gain: 0.5, dur: 3 });
      A.drone(47, 62, D2 * 0.75, { gain: 0.06, attack: 3.0, release: 3.0 }); A.choir(47, 62, [D3, F4, A3], { gain: 0.04, attack: 4.0, release: 4.0, vowel: 0.3 });
    },
  });
})();
