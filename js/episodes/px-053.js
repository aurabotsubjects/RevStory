/* ============================================================================
 *  REVELATION · PIXEL EDITION · Episode 53 · The Mark and the Number · Revelation 13:15–18
 *  2D pixel-art cut (480x200). The image is given breath and speaks; its eyes glow and its voice demands worship. In a heavy, controlled marketplace, a glowing mark is received on hands and foreheads (symbolic, never gory), doors close on those without it, and the number 666 appears as a large cold-light glyph. No faces.
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

  Aura.define(53, {
    pixel: true,
    duration: 58,
    cues: [
      { ref: '13:15', t0: 5.0, t1: 16.0 },
      { ref: '13:16', t0: 17.0, t1: 30.0 },
      { ref: '13:17', t0: 31.0, t1: 42.0 },
      { ref: '13:18', t0: 43.0, t1: 54.0 },
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
      const stalls = () => { for (let i = 0; i < 7; i++) { const x = 20 + i * 66; for (let y = 128; y < 168; y++) for (let xx = x; xx < x + 52; xx++) px.set(xx, y, px.ramp(hexes(['#1a1410', '#3a2e24', '#6a5a46']), clamp(0.3 + (y - 128) * 0.004 + 0.05 * px.hash(xx, y, 3), 0, 1), xx, y)); for (let xx = x - 4; xx < x + 56; xx++) for (let y = 116; y < 128; y++) px.set(xx, y, hex(i % 2 ? '#4a3a58' : '#3a4a58')); } };
      return {
        render(t) {
          const U = px.cur();
          if (t < 17) {
            for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) U[y * W + x] = px.ramp(hexes(['#04030a', '#0c0810', '#1a1220']), clamp(0.2 + (1 - y / H) * 0.3, 0, 1), x, y);
            hydra(240, 120, 1.7, 1, t, 7, { c1: '#3a2a10', c2: '#c8a040', dark: '#140c04' }); const ek = S(5, 9, t); for (const q of [-1, 1]) { G(240 + q * 34, 14, 14, '#ff2a18', 0.9 * ek * (0.8 + 0.2 * Math.sin(t * 8))); }
            for (let r = 0; r < 4; r++) { const a = ((t - 8) * 0.5 + r * 0.25) % 1; if (t > 8) for (let i = 0; i < 90; i++) { const an = i / 90 * 6.283; px.dpx(Math.round(240 + Math.cos(an) * a * 260), Math.round(70 + Math.sin(an) * a * 90), hex('#c04030'), 0.5 * (1 - a) * ek); } }
            crowd(194, 34, 1, 5, 22, '#0a0608', 6, 474); const kn = S(9, 14, t); for (let i = 0; i < 34; i++) { const x = 6 + 468 * (i + px.hash(i, 5, 3) * 0.7) / 34; lib.line(Math.round(x), 180, Math.round(x), Math.round(180 + 8 * kn), hex('#0a0608'), 2); }
            for (let i = 0; i < 4; i++) { const x = 90 + i * 100, dim = S(10 + i, 15, t); lib.person({ x, y: 192, h: 26, k: 1, col: '#e8d098' }); G(x, 178, 14 * (1 - dim), '#ffd890', 0.6 * (1 - dim)); }
            px.post({ vignette: 1.4, flash: 0, fade: Math.max(1 - S(0, 1.4, t), S(16, 17, t)), fadeCol: hex('#000000') }); lib.titleCard(t, 'THE MARK', 53); return;
          }
          if (t < 43) {
            lib.skyGrad({ t, top: '#1a1a22', mid: '#3a3a40', bot: '#6a5a4a', cloud: 0.2, wind: 0.1, y1: 130, dark: 0.3 }); for (let y = 130; y < H; y++) for (let x = 0; x < W; x++) px.set(x, y, px.ramp(hexes(['#1a1612', '#322a22', '#5a4a3a']), clamp(0.3 + (y - 130) * 0.003 + 0.05 * px.hash(x >> 2, y >> 2, 3), 0, 1), x, y)); stalls();
            const mk = S(17, 28, t);
            for (let i = 0; i < 26; i++) { const x = 14 + i * 18, y = 184 + (i % 3) * 3, r = (mk * 26 - i); lib.person({ x, y, h: 26, k: 1, col: i % 4 === 0 ? '#2a2630' : '#14101a' }); if (r > 0 && i % 4 !== 0) { const a = Math.min(1, r / 2), pulse = 0.7 + 0.3 * Math.sin(t * 5 + i); G(x, y - 24, 8, '#a070ff', 0.8 * a * pulse); px.set(x, Math.round(y - 25), hex('#e8d8ff')); G(x + 6, y - 12, 6, '#70a8ff', 0.7 * a * pulse); if (r < 3) { const rr = r * 14; for (let q = 0; q < 24; q++) { const an = q / 24 * 6.283; px.dpx(Math.round(x + Math.cos(an) * rr), Math.round(y - 24 + Math.sin(an) * rr * 0.6), hex('#c8a8ff'), 0.7 * (1 - r / 3)); } } } }
            if (t >= 31) { const dc = S(31, 40, t); for (let i = 0; i < 4; i++) { const x = 40 + i * 120, w2 = 52 * dc; for (let y = 120; y < 176; y++) { for (let xx = x; xx < x + w2; xx++) px.set(xx, y, hex('#0a0810')); for (let xx = x + 104 - w2; xx < x + 104; xx++) px.set(xx, y, hex('#0a0810')); } if (dc > 0.9) lib.line(x + 52, 120, x + 52, 176, hex('#2a2030'), 1); lib.person({ x: x + 52, y: 186, h: 24, k: 1 - dc * 0.0, col: '#e8d098' }); G(x + 52, 172, 12 * (1 - dc), '#ffd890', 0.5 * (1 - dc)); } }
            tint(0, H, '#2a3038', 0.12); px.post({ vignette: 1.5, flash: 0, fade: Math.max(S(16, 17.4, t) < 1 && t < 17.5 ? 1 - S(16, 17.4, t) : 0, S(42, 43, t)), fadeCol: hex('#000000') }); return;
          }
          for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) U[y * W + x] = hex('#05060c');
          const nk = S(43, 47, t), tw = px.textWidth('666', 14, 1); G(240, 100, 150, '#7aa8ff', 0.25 * nk);
          px.text('666', Math.round(240 - tw / 2), 44, 14, (cc, r, X, Y) => mix(hex('#3a5aa0'), hex('#e8f4ff'), clamp(0.5 + 0.5 * Math.sin(t * 2 + Y * 0.1), 0, 1)), nk);
          for (let i = 0; i < 3; i++) { const dg = S(46 + i * 1.2, 49 + i * 1.2, t); G(240 - tw / 2 + (i + 0.5) * tw / 3, 100, 36, '#a0c8ff', 0.4 * dg); }
          const wk = S(50, 53, t); const wt = 'THE NUMBER OF A MAN', ww = px.textWidth(wt, 2, 1); px.text(wt, Math.round(240 - ww / 2), 150, 2, hex('#9ab8e8'), wk * (1 - S(53, 54, t)) * 0.9);
          px.post({ vignette: 1.4, flash: 0, fade: Math.max(S(42, 43.4, t) < 1 && t < 43.5 ? 1 - S(42, 43.4, t) : 0, S(53, 54, t) * 0.0 + S(52, 54, t)), fadeCol: hex('#000000') });
        },
      };
    },

    score(A, from) {
      const D2 = 73.42, D3 = 146.83, A3 = 220, D4 = 293.66, F4 = 349.23, Fs4 = 369.99, A4 = 440, D5 = 587.33, F5 = 698.46, Fs5 = 739.99, A5 = 880, D6 = 1174.66;
      A.drone(0, 58, D2 * 0.75, { gain: 0.08, attack: 2.0, release: 3.0 });
      A.choir(4, 17, [D3, F4, Fs4], { gain: 0.05, attack: 3.0, release: 2.0, vowel: 0.3 }); A.boom(8.5, { freq: 38, gain: 0.8, dur: 5 }); A.brass(8.5, 17, D3 / 2, { gain: 0.08, attack: 0.2, release: 2.0, sweep: [[8.5, 300], [15, 800]] });
      A.noise({ t0: 17, t1: 43, gain: [[17, 0.05], [30, 0.12], [43, 0]], filter: { type: 'bandpass', freq: 800, q: 0.8 }, wet: 0.3, attack: 1, release: 2 });
      for (let q = 18; q < 30; q += 0.9) A.bell(q, [A5, Fs5, D6][Math.floor(q) % 3], { gain: 0.03, dur: 1.5 });
      [32, 34.5, 37, 39.5].forEach((q) => A.boom(q, { freq: 40, gain: 0.6, dur: 2 }));
      A.boom(43.2, { freq: 30, gain: 1.0, dur: 7 }); A.brass(43.3, 54, D3, { gain: 0.1, attack: 0.1, release: 3.0, sweep: [[43.3, 700], [47, 400]] }); A.choir(44, 58, [D3, F4, A3], { gain: 0.05, attack: 3.0, release: 3.0, vowel: 0.3 });
    },
  });
})();
