/* ============================================================================
 *  REVELATION · PIXEL EDITION · Episode 50 · The Beast from the Sea · Revelation 13:1–4
 *  2D pixel-art cut (480x200). A beast rises from black water, ten horns and seven heads, lit from below with a dull red glow. The dragon gives it his power and throne. One head with a deadly wound, the wound healed in pulsing red light. Giant overhead shots of the whole world worshipping. No faces.
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

  Aura.define(50, {
    pixel: true,
    duration: 56,
    cues: [
      { ref: '13:1', t0: 5.0, t1: 20.0 },
      { ref: '13:2', t0: 21.0, t1: 32.0 },
      { ref: '13:3', t0: 33.0, t1: 44.0 },
      { ref: '13:4', t0: 45.0, t1: 52.0 },
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
      const BEAST = { c1: '#4a3418', c2: '#b87a30', dark: '#120a06', crowns: true };
      return {
        render(t) {
          const U = px.cur();
          if (t < 33) {
            lib.skyGrad({ t, top: '#06040a', mid: '#1a0a14', bot: '#4a1a18', cloud: 0.5, wind: 0.2, y1: 170, dark: 0.7 });
            const up = S(5, 20, t); const by = lerp(290, 168, up * up * (3 - 2 * up));
            hydra(240, by, 1.9, 1, t, 7, BEAST); lib.sea({ t, y0: 168, cx: 240, glow: 0.1, ripple: 1, k: 1 }); tint(168, H, '#0a0408', 0.5);
            G(240, 176, 150, '#ff3a18', 0.35 * S(4, 14, t)); for (let i = 0; i < 40; i++) { const q = (t * 0.5 + i / 40) % 1; px.dpx(Math.round(160 + px.hash(i, 1, 3) * 160), Math.round(168 + q * 32), hex('#ff6a40'), 0.5 * (1 - q) * up); }
            for (let i = 0; i < 40; i++) { const x = Math.round(px.hash(i, 3, 3) * W), y = Math.round(168 + px.hash(i, 4, 3) * 30); if (up > 0.2 && px.hash(i, 5, 3) < up) px.dpx(x, y, hex('#ffa070'), 0.5); }
            if (t >= 21) { const bk = S(21, 26, t) * (1 - S(30, 33, t)); for (let y = 0; y < 150; y++) for (let x = 226; x < 254; x++) px.dpx(x, y, px.ramp(hexes(['#3a0606', '#a01810', '#ff5a30', '#ffd0a0']), clamp(0.35 + 0.4 * px.fbm(x * 0.2, y * 0.05 - t * 2, 2, 5) + (1 - y / 150) * 0.3, 0, 1), x, y), 0.8 * bk * (1 - Math.abs(x - 240) / 16)); hydra(240, 28, 0.35, bk, t, 7, { c1: '#8a1208', c2: '#ff4a20' }); G(240, 150, 50, '#ffb060', 0.6 * bk); lib.throne({ U, z: 0.4, x: 240, y: 70, k: bk * 0.9, t }); }
            px.post({ vignette: 1.5, flash: 0, fade: Math.max(1 - S(0, 1.4, t), S(32, 33, t)), fadeCol: hex('#000000') }); lib.titleCard(t, 'THE BEAST', 50); return;
          }
          if (t < 45) {
            for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const n = px.fbm(x * 0.05, y * 0.05, 3, 4); U[y * W + x] = px.ramp(hexes(['#0a0604', '#1a1008', '#3a2410', '#6a4a20']), clamp(0.2 + n * 0.5 - Math.abs(x - 240) * 0.0008, 0, 1), x, y); }
            for (let i = 0; i < 150; i++) { const X = Math.round(px.hash(i, 1, 2) * W), Y = Math.round(px.hash(i, 2, 2) * H); if (px.hash(i, 3, 2) < 0.5) lib.ell(X, Y, 5, 4, (a, b) => px.dpx(a, b, hex('#0a0604'), 0.8)); }
            lib.ell(240, 108, 120, 78, (X, Y, dx, dy) => px.dpx(X, Y, mix(hex('#0a0604'), px.ramp(hexes(['#1a1008', '#4a3418', '#8a6a30', '#c8a050']), clamp(0.45 - dy * 0.3 + dx * 0.15 + 0.15 * px.fbm(X * 0.08, Y * 0.08, 3, 6), 0, 1), X, Y), 1), 1));
            for (const q of [-1, 1]) { lib.ell(240 + q * 52, 84, 14, 8, (X, Y) => px.set(X, Y, hex('#ffb030'))); px.set(240 + q * 52, 84, hex('#000000')); lib.line(240 + q * 90, 52, 240 + q * 120, 20, hex('#d8c8a0'), 4); }
            const heal = S(36, 43, t), pulse = 0.6 + 0.4 * Math.sin(t * 8), gx0 = 190, gy0 = 60, gx1 = 190 + 80 * (1 - heal * 0.0), gy1 = 138;
            const gk = S(33, 36, t) * (1 - heal); for (let j = 0; j <= 30; j++) { const u = j / 30, X = Math.round(lerp(gx0, gx1, u) + Math.sin(u * 9) * 5), Y = Math.round(lerp(gy0, gy1, u)); G(X, Y, 9 * (1 - heal * 0.6), '#ff2a18', 0.7 * gk * pulse); lib.line(X, Y, X + 1, Y + 3, hex('#8a0a08'), Math.max(1, Math.round(4 * (1 - heal)))); }
            for (let q = 0; q < 50; q++) { const u = q / 50, X = lerp(gx0, gx1, u) + Math.sin(u * 9) * 5, Y = lerp(gy0, gy1, u); if (u < heal) G(X, Y, 6, '#ffd890', 0.5 * (1 - heal) * 2 * pulse); }
            px.post({ vignette: 1.4, flash: Math.exp(-Math.max(0, t - 42.8) * 4) * (t > 42.8 ? 0.5 : 0), flashCol: hex('#ffb060'), fade: Math.max(S(32, 33.4, t) < 1 && t < 33.5 ? 1 - S(32, 33.4, t) : 0, S(44, 45, t)), fadeCol: hex('#000000') }); return;
          }
          for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) U[y * W + x] = hex('#0a0408');
          const rot = (t - 45) * 0.25; G(240, 100, 60, '#ff3a18', 0.7); for (let r = 1; r <= 9; r++) { const rr = r * 20 + 10, n = r * 9, dirn = r % 2 ? 1 : -1; for (let i = 0; i < n; i++) { const a = i / n * 6.283 + rot * dirn; lib.person({ x: Math.round(240 + Math.cos(a) * rr * 1.25), y: Math.round(100 + Math.sin(a) * rr * 0.62) + 3, h: 6, k: 1, col: r % 3 ? '#2a1a14' : '#3a2018' }); } }
          for (let i = 0; i < 60; i++) { const a = i / 60 * 6.283 + rot * 0.5, q = ((t - 45) * 0.3 + i / 60) % 1; G(240 + Math.cos(a) * 20 * (1 + q * 9), 100 + Math.sin(a) * 12 * (1 + q * 9), 3, '#ff6a40', 0.5 * (1 - q)); }
          tilt(0.12 * Math.sin(t * 0.7)); px.post({ vignette: 1.2, flash: 0, fade: Math.max(S(44, 45.4, t) < 1 && t < 45.5 ? 1 - S(44, 45.4, t) : 0, S(54, 56, t)), fadeCol: hex('#000000') });
        },
      };
    },

    score(A, from) {
      const D2 = 73.42, D3 = 146.83, A3 = 220, D4 = 293.66, F4 = 349.23, Fs4 = 369.99, A4 = 440, D5 = 587.33, F5 = 698.46, Fs5 = 739.99, A5 = 880, D6 = 1174.66;
      A.drone(0, 56, D2 * 0.75, { gain: 0.08, attack: 2.0, release: 3.0 });
      A.noise({ t0: 4, t1: 21, gain: [[4, 0.0], [12, 0.25], [21, 0.1]], filter: { type: 'lowpass', freq: 900, q: 1 }, wet: 0.4, attack: 2, release: 2 }); A.riser(8, 20, { from: 50, to: 400, gain: 0.14 }); A.boom(19.5, { freq: 32, gain: 0.9, dur: 6 });
      A.brass(20, 33, D3, { gain: 0.08, attack: 1.0, release: 3.0, sweep: [[20, 400], [30, 1200]] }); A.choir(21, 33, [D3, F4, Fs4], { gain: 0.05, attack: 3.0, release: 3.0, vowel: 0.3 });
      for (let q = 34; q < 44; q += 1.0) A.boom(q, { freq: 44, gain: 0.3, dur: 1 });
      A.bell(42.8, D5, { gain: 0.08, dur: 6 }); A.shimmer(42.8, A5, { dur: 6, gain: 0.05 });
      A.choir(45, 56, [D3, F4, A3, D4], { gain: 0.08, attack: 1.5, release: 3.0, vowel: 1.0 }); A.boom(45, { freq: 36, gain: 0.7, dur: 5 });
    },
  });
})();
