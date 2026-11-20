/* ============================================================================
 *  REVELATION · PIXEL EDITION · Episode 47 · War in Heaven · Revelation 12:7–9
 *  2D pixel-art cut (480x200). War in heaven: Michael and his angels against the dragon and his angels, swords of light against red, a rolling aerial battle; the dragon is not strong enough and loses its place, and is hurled down in a long vertical fall, burning through the sky. No faces.
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

  Aura.define(47, {
    pixel: true,
    duration: 54,
    cues: [
      { ref: '12:7', t0: 5.0, t1: 20.0 },
      { ref: '12:8', t0: 21.0, t1: 32.0 },
      { ref: '12:9', t0: 33.0, t1: 46.0 },
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
      const tilt = (a) => { if (Math.abs(a) < 0.001) return; const U = px.cur(), C = U.slice(), ca = Math.cos(a), sa = Math.sin(a); for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const X = x - 240, Y = y - 100, sx = Math.round(240 + X * ca - Y * sa), sy = Math.round(100 + X * sa + Y * ca); U[y * W + x] = C[clamp(sy, 0, H - 1) * W + clamp(sx, 0, W - 1)]; } };
      const hits = [9.5, 12.8, 15.5, 18.0, 22.5, 26.0, 29.5];
      const angel = (x, y, s, k, t, seed, col) => { lib.lightFig({ x, y, h: 34 * s, a: k, t, seed, sway: 0.5, glow: 1 }); lib.wings({ x, y: y - 22 * s, s: 0.6 * s, k: k * 0.8, t: t * 2 + seed, spread: 0.7, eyes: 0, n: 2 }); lib.line(Math.round(x + 5 * s), Math.round(y - 20 * s), Math.round(x + 24 * s), Math.round(y - 40 * s - Math.sin(t * 6 + seed) * 6), hex(col), 1); };
      return {
        render(t) {
          const U = px.cur(), fall = S(33, 46, t);
          if (t < 33) {
            lib.skyGrad({ t, top: '#2a2058', mid: '#8a4a70', bot: '#f0a870', cloud: 0.6, wind: 0.9, y1: H });
            lib.glory({ cx: 120, cy: 60, hy: 200, k: 0.7, rays: 1, t });
            const bk = S(3, 7, t);
            for (let i = 0; i < 9; i++) { const x = 70 + (i % 5) * 36 + Math.sin(t * 1.5 + i) * 10, y = 70 + Math.floor(i / 5) * 60 + Math.cos(t * 1.1 + i) * 8; angel(x, y + 30, 1.1, bk, t, i, '#fff6d0'); }
            lib.lightFig({ x: 150, y: 120, h: 70, a: bk, t, seed: 11, sway: 0.4, glow: 1.6 }); lib.line(160, 90, 205, 40 + Math.sin(t * 4) * 8, hex('#ffffff'), 2); G(205, 40, 14, '#ffffff', 0.9 * bk);
            hydra(380, 140, 1.3, bk, t, 7, {}); for (let i = 0; i < 7; i++) angel(300 + (i % 4) * 42, 60 + Math.floor(i / 4) * 80 + 20, 1.0, bk, t, i + 20, '#ff6040');
            for (const h of hits) { const a = t - h; if (a > 0 && a < 0.9) { const k = 1 - a / 0.9, x = 250 + Math.sin(h * 7) * 20, y = 90 + Math.cos(h * 5) * 30; for (let q = 0; q < 18; q++) { const an = q / 18 * 6.283; lib.line(Math.round(x), Math.round(y), Math.round(x + Math.cos(an) * 60 * a), Math.round(y + Math.sin(an) * 40 * a), hex('#fff6d0'), 1); } G(x, y, 40 * k, '#ffffff', 0.8 * k); } }
            const hf = hits.reduce((m, h) => Math.max(m, Math.exp(-Math.max(0, t - h) * 8) * (t > h ? 1 : 0)), 0);
            tilt(0.1 * Math.sin(t * 0.4) + 0.05 * Math.sin(t * 1.3));
            px.post({ vignette: 1.0, flash: hf * 0.6, flashCol: hex('#fff6d0'), fade: Math.max(1 - S(0, 1.4, t), 0), fadeCol: hex('#000000') }); shake(Math.sin(t * 61) * hf * 3, Math.sin(t * 47) * hf * 3); lib.titleCard(t, 'WAR IN HEAVEN', 47); return;
          }
          const sy = fall * 900, atm = S(36, 44, t);
          for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) U[y * W + x] = px.ramp(hexes(['#10102a', '#3a2858', '#8a4a70', '#e08a50', '#ffd890']), clamp(0.2 + 0.4 * (y / H) + 0.3 * atm - 0.2 * (1 - fall), 0, 1), x, y);
          for (let i = 0; i < 26; i++) { const cy = ((px.hash(i, 1, 3) * 700 - sy * (0.4 + px.hash(i, 2, 3)) * 0.6) % 720 + 720) % 720 - 80, cx = px.hash(i, 3, 3) * 520 - 20, r = 24 + px.hash(i, 4, 3) * 50; lib.ell(cx, cy, r, r * 0.35, (X, Y, dx, dy) => px.dpx(X, Y, mix(hex('#6a5a88'), hex('#e8d0c8'), clamp(0.5 - dy * 0.4, 0, 1)), 0.7)); }
          const dy2 = lerp(-40, 110, S(33, 40, t)) + 30 * fall; hydra(240, dy2 + 40, 1.2 - 0.3 * fall, 1, t, 7, {}); for (let q = 0; q < 40; q++) G(240 + (px.hash(q, 1, 3) - 0.5) * 60, dy2 - q * 6, 18 - q * 0.3, q < 6 ? '#fff0b0' : '#ff6a20', 0.5 * (1 - q / 40) * S(35, 40, t));
          if (t < 38) for (let i = 0; i < 5; i++) angel(60 + i * 90, 40 + (i % 2) * 20, 1.1, 1 - S(36, 38, t), t, i, '#fff6d0');
          tint(0, H, '#ff4a10', 0.14 * atm); px.post({ vignette: 1.1, flash: Math.exp(-Math.max(0, t - 33.2) * 3) * (t > 33.2 ? 0.7 : 0), flashCol: hex('#fff6d0'), fade: Math.max(S(32, 33.4, t) < 1 && t < 33.5 ? 1 - S(32, 33.4, t) : 0, S(52, 54, t)), fadeCol: hex('#000000') }); shake(Math.sin(t * 53) * atm * 2, 0);
        },
      };
    },

    score(A, from) {
      const D2 = 73.42, D3 = 146.83, A3 = 220, D4 = 293.66, F4 = 349.23, Fs4 = 369.99, A4 = 440, D5 = 587.33, F5 = 698.46, Fs5 = 739.99, A5 = 880, D6 = 1174.66;
      A.drone(0, 54, D2, { gain: 0.07, attack: 1.0, release: 3.0 });
      for (let q = 5; q < 33; q += 0.65) A.boom(q, { freq: 54, gain: 0.18, dur: 0.5 });
      A.brass(5, 33, D3, { gain: 0.08, attack: 0.5, release: 2.0, sweep: [[5, 900], [20, 1900]] }); A.choir(5, 33, [D3, A3, D4, Fs4], { gain: 0.06, attack: 2.0, release: 2.0, vowel: 1.0 });
      [9.5, 12.8, 15.5, 18, 22.5, 26, 29.5].forEach((q, i) => { A.boom(q, { freq: 46 - i, gain: 0.55, dur: 2 }); A.bell(q, [D5, A5, Fs5][i % 3], { gain: 0.05, dur: 2.5 }); });
      A.riser(28, 33.2, { from: 120, to: 1800, gain: 0.16 }); A.boom(33.2, { freq: 30, gain: 1.0, dur: 6 });
      A.noise({ t0: 34, t1: 46, gain: [[34, 0.1], [42, 0.4], [46, 0.05]], filter: { type: 'lowpass', freq: 1400, q: 1 }, wet: 0.4, attack: 1, release: 3 });
      A.drone(34, 54, D2 * 0.75, { gain: 0.08, attack: 2.0, release: 3.0 });
    },
  });
})();
