/* ============================================================================
 *  REVELATION · PIXEL EDITION · Episode 48 · The Accuser Hurled Down · Revelation 12:10–12
 *  2D pixel-art cut (480x200). A loud voice in heaven: now have come salvation, power and the kingdom of our God; the accuser has been hurled down. They overcame him by the blood of the Lamb and the word of their testimony, in slow motion. Woe to earth and sea, for the devil has come down in fury, knowing his time is short. No faces.
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

  Aura.define(48, {
    pixel: true,
    duration: 56,
    cues: [
      { ref: '12:10', t0: 5.0, t1: 22.0 },
      { ref: '12:11', t0: 23.0, t1: 38.0 },
      { ref: '12:12', t0: 39.0, t1: 52.0 },
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
          if (t < 23) {
            for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const v = 0.1 + 0.2 * (y / H) + 0.45 * Math.exp(-Math.pow((x - 240) / 160, 2) - Math.pow((y - 70) / 80, 2)); U[y * W + x] = px.ramp(hexes(['#1a1008', '#3d2410', '#7a4a1a', '#b8802a', '#e8b04a', '#ffd987', '#fff3c8']), clamp(v, 0, 1), x, y); }
            lib.glory({ cx: 240, cy: 70, hy: 200, k: S(2, 10, t), rays: 1.2, t }); lib.throne({ U, z: 0.9, x: 240, y: 170, k: S(2, 6, t), t });
            for (let r = 0; r < 5; r++) { const a = ((t - 6) * 0.35 + r * 0.2) % 1; if (t > 6) for (let i = 0; i < 100; i++) { const an = i / 100 * 6.283; px.dpx(Math.round(240 + Math.cos(an) * a * 300), Math.round(90 + Math.sin(an) * a * 120), hex('#fff0c0'), 0.55 * (1 - a) * S(6, 9, t)); } }
            for (let i = 0; i < 12; i++) lib.elder({ x: 60 + i * 34, y: 192, h: 30, k: S(8 + i * 0.3, 12, t), kneel: 0, t, seed: i, glow: 0.8 });
            if (t > 14) { const fz = S(14, 21, t); hydra(240, lerp(120, 330, fz * fz), 0.9, 1 - S(19, 22, t), t, 7, { c2: '#ff4a20' }); }
            px.post({ vignette: 1.0, flash: 0, fade: Math.max(1 - S(0, 1.4, t), S(22, 23, t)), fadeCol: hex('#000000') }); lib.titleCard(t, 'THE ACCUSER', 48); return;
          }
          if (t < 39) {
            cosmos(t, 0.2, 200); const sl = 0.35;
            for (let i = 0; i < 90; i++) { const q = ((t - 23) * 0.06 + px.hash(i, 1, 2)) % 1, X = px.hash(i, 2, 2) * W, Y = 200 - q * 200; G(X, Y, 3 + 3 * (1 - q), i % 3 ? '#ffd890' : '#ff6a40', 0.6 * S(24, 28, t)); }
            lib.lamb({ x: 240, y: 150, s: 2.4, k: S(24, 28, t), t: t * sl, glow: 1.4 });
            for (let i = 0; i < 40; i++) { const q = ((t - 24) * 0.12 * sl + i / 40) % 1; G(240 + 12 * 2.4 + Math.sin(i) * 12, 130 - q * 130, 4, '#ff3a30', 0.8 * (1 - q) * S(26, 30, t)); }
            for (let i = 0; i < 14; i++) { const x = 40 + i * 31, k = S(28 + i * 0.4, 34, t); lib.lightFig({ x, y: 196, h: 40, a: k, t, seed: i, sway: 0.2, glow: 1.0 }); }
            G(240, 100, 190, '#ffd890', 0.2); px.post({ vignette: 1.2, flash: 0, fade: Math.max(S(22, 23.4, t) < 1 && t < 23.5 ? 1 - S(22, 23.4, t) : 0, S(38, 39, t)), fadeCol: hex('#000000') }); return;
          }
          lib.skyGrad({ t, top: '#2a0a10', mid: '#8a2a20', bot: '#e86a30', cloud: 0.5, wind: 0.3, y1: 140, dark: 0.3 });
          lib.sea({ t, y0: 140, cx: 240, glow: 0.5, ripple: 1, k: 1 }); tint(140, H, '#a01010', 0.25); lib.land({ y0: 150, amp: 6, c1: '#2a1410', c2: '#0c0606', seed: 3, scroll: 0, k: 1 });
          const lk = S(39, 44, t); hydra(240, lerp(50, 160, lk), 1.4, 1, t, 7, {}); G(240, 160, 140, '#ff3010', 0.4 * lk * (0.7 + 0.3 * Math.sin(t * 7)));
          for (let i = 0; i < 4; i++) { const a = t - 44 - i * 0.6; if (a > 0 && a < 2) for (let q = 0; q < 90; q++) { const an = q / 90 * 6.283; px.dpx(Math.round(240 + Math.cos(an) * a * 220), Math.round(160 + Math.sin(an) * a * 40), hex('#ff6040'), 0.6 * (1 - a / 2)); } }
          px.post({ vignette: 1.3, flash: Math.exp(-Math.max(0, t - 43.5) * 3) * (t > 43.5 ? 0.6 : 0), flashCol: hex('#ff6a40'), fade: Math.max(S(38, 39.4, t) < 1 && t < 39.5 ? 1 - S(38, 39.4, t) : 0, S(50, 52, t) * 0 + S(54, 56, t)), fadeCol: hex('#000000') }); shake(Math.sin(t * 59) * (t > 43.5 && t < 46 ? 3 : 0), 0);
        },
      };
    },

    score(A, from) {
      const D2 = 73.42, D3 = 146.83, A3 = 220, D4 = 293.66, F4 = 349.23, Fs4 = 369.99, A4 = 440, D5 = 587.33, F5 = 698.46, Fs5 = 739.99, A5 = 880, D6 = 1174.66;
      A.drone(0, 56, D2, { gain: 0.07, attack: 2.0, release: 3.0 });
      A.brass(4.8, 22, D3, { gain: 0.1, attack: 0.1, release: 3.0, sweep: [[4.8, 1800], [10, 1000]] }); A.choir(4, 23, [D3, A3, D4, Fs4, A4], { gain: 0.08, attack: 2.0, release: 1.5, vowel: 1.1 }); A.boom(4.9, { freq: 42, gain: 0.7, dur: 4 });
      A.boom(17, { freq: 34, gain: 0.7, dur: 5 }); A.riser(14, 21, { from: 100, to: 1500, gain: 0.12 });
      A.choir(23, 39, [D3, A3, Fs4], { gain: 0.04, attack: 3.0, release: 3.0, vowel: 0.5 }); A.bell(24, D5, { gain: 0.06, dur: 10 }); A.shimmer(24, A5, { dur: 14, gain: 0.04 });
      A.drone(39, 56, D2 * 0.75, { gain: 0.09, attack: 0.5, release: 3.0 }); A.boom(43.6, { freq: 32, gain: 0.9, dur: 6 }); A.brass(40, 52, D3, { gain: 0.08, attack: 3.0, release: 3.0, sweep: [[40, 300], [50, 900]] });
    },
  });
})();
