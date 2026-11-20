/* ============================================================================
 *  REVELATION · PIXEL EDITION · Episode 65 · Armageddon · Revelation 16:12–16
 *  2D pixel-art cut (480x200). The sixth bowl dries up the great river Euphrates for the kings from the East. Three unclean spirits like frogs come from the mouths of the dragon, the beast and the false prophet and gather the kings for the great day of God Almighty. Behold, I come like a thief, blessed is the one who stays awake. They gather at Armageddon. Dry riverbed, blood-orange sky, green smoke-forms. No faces.
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

  Aura.define(65, {
    pixel: true,
    duration: 60,
    cues: [
      { ref: '16:12', t0: 4.0, t1: 16.0 },
      { ref: '16:13', t0: 17.0, t1: 30.0 },
      { ref: '16:15', t0: 31.0, t1: 42.0 },
      { ref: '16:16', t0: 43.0, t1: 57.0 },
    ],
    titles: [],

    build(ctx) {
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
          if (t < 43) {
            lib.skyGrad({ t, top: '#3a0c10', mid: '#b83a18', bot: '#ffa050', cloud: 0.5, wind: 0.2, y1: 120 });
            const dr = S(3, 15, t);
            for (let y = 120; y < H; y++) for (let x = 0; x < W; x++) { const cx = 240 + Math.sin(y * 0.05) * 20, hw = lerp(80, 30, dr) * (1 + (y - 120) / 60), inR = Math.abs(x - cx) < hw; const n = px.fbm(x * 0.05, y * 0.08, 3, 3); U[y * W + x] = inR ? px.ramp(hexes(['#2a1a10', '#5a3a20', '#8a6a3a']), clamp(0.2 + n * 0.6 * dr + (1 - dr) * 0.0, 0, 1), x, y) : px.ramp(hexes(['#3a2410', '#6a4a24', '#a07a40']), clamp(0.3 + n * 0.5, 0, 1), x, y); if (inR && dr < 0.9 && (y + x) % 7 < 3) U[y * W + x] = mix(U[y * W + x], hex('#1a5a8a'), 0.5 * (1 - dr)); }
            for (let i = 0; i < 40; i++) { const x = px.hash(i, 1, 8) * W, y = 140 + px.hash(i, 2, 8) * 50; if (dr > 0.6) lib.line(Math.round(x), Math.round(y), Math.round(x + 8), Math.round(y + 2), hex('#1a1008'), 1); }
            const hk = S(17, 22, t); const heads = [[100, 74, '#b02020'], [240, 60, '#4a3418'], [380, 74, '#6a4a8a']]; for (let i = 0; i < 3; i++) { const sp = S(19 + i * 2, 27 + i * 2, t); G(heads[i][0], heads[i][1], 60, heads[i][2], 0.3 * hk); for (let j = 0; j < 90; j++) { const q = (t * 0.2 + j / 90) % 1, a = (px.hash(j, i, 5) - 0.5) * 2, X = heads[i][0] + a * q * 40 + Math.sin(q * 8 + j) * 8, Y = heads[i][1] + q * 40; lib.ell(X, Y, 3 + q * 7, 2 + q * 5, (a2, b2) => px.dpx(a2, b2, hex('#5aff40'), 0.28 * sp * (1 - q))); } G(heads[i][0] + (240 - heads[i][0]) * sp * 0.0, heads[i][1] + 30 + sp * 60, 18, '#7aff50', 0.4 * sp); }
            for (let i = 0; i < 3; i++) { const x = heads[i][0], y = 40; lib.ell(x, y, 16, 10, (X, Y, dx, dy) => px.dpx(X, Y, hex('#0a0408'), 0.85 * hk)); lib.ell(x, y + 8, 10, 8, (X, Y, dx, dy) => px.dpx(X, Y, hex('#1a0408'), 0.9 * hk)); }
            px.post({ vignette: 1.3, flash: 0, fade: Math.max(1 - S(0, 1.4, t), S(42, 43, t)), fadeCol: hex('#000000') }); lib.titleCard(t, 'ARMAGEDDON', 65); 
            const th = Math.exp(-Math.max(0, t - 33) * 5) * (t > 33 && t < 36 ? 1 : 0); tint(0, H, '#ffffff', 0.7 * th); return;
          }
          const fl = S(43, 46, t); for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) U[y * W + x] = px.ramp(hexes(['#3a2410', '#6a4a24', '#a07a40']), clamp(0.3 + px.fbm(x * 0.02, y * 0.03, 4, 6) * 0.6, 0, 1), x, y);
          const fx = [[0, 50], [480, 60], [0, 120], [480, 110], [240, 0], [240, 200]];
          for (let g = 0; g < 4; g++) for (let i = 0; i < 160; i++) { const p = clamp((t - 44 - g * 0.5) / 10 * (0.6 + px.hash(i, g, 4) * 0.5), 0, 1), s0 = [[10, 30], [470, 40], [30, 190], [460, 190]][g], X = lerp(s0[0], 240 + (px.hash(i, 5, 4) - 0.5) * 120, p * p * (3 - 2 * p)), Y = lerp(s0[1], 110 + (px.hash(i, 6, 4) - 0.5) * 70, p * p * (3 - 2 * p)); px.dpx(Math.round(X), Math.round(Y), hex(['#c03020', '#e0a020', '#4a60c0', '#a040a0'][g]), 0.9); for (const [ox, oy] of [[1, 0], [0, 1], [1, 1], [0, -1], [0, -2]]) px.dpx(Math.round(X) + ox, Math.round(Y) + oy, hex(oy < 0 ? '#1a1008' : ['#c03020', '#e0a020', '#4a60c0', '#a040a0'][g]), 0.95); }
          G(240, 110, 80 * S(50, 57, t), '#ff4a20', 0.5 * S(50, 57, t)); const tw = 'ARMAGEDDON', ww = px.textWidth(tw, 5, 1); px.text(tw, Math.round(240 - ww / 2), 14, 5, hex('#ffd0a0'), S(48, 53, t) * 0.9);
          px.post({ vignette: 1.2, flash: 0, fade: Math.max(S(42, 43.4, t) < 1 && t < 43.5 ? 1 - S(42, 43.4, t) : 0, S(56, 60, t)), fadeCol: hex('#000000') });
        },
      };
    },

    score(A, from) {
      const D2 = 73.42, D3 = 146.83, A3 = 220, D4 = 293.66, F4 = 349.23, Fs4 = 369.99, A4 = 440, D5 = 587.33, F5 = 698.46, Fs5 = 739.99, A5 = 880, D6 = 1174.66;
      A.drone(0, 60, D2 * 0.75, { gain: 0.08, attack: 2.0, release: 3.0 });
      A.noise({ t0: 3, t1: 16, gain: [[3, 0.0], [10, 0.2], [16, 0.05]], filter: { type: 'lowpass', freq: 1000, q: 1 }, wet: 0.3, attack: 2, release: 2 }); A.brass(4, 16, D3 / 2, { gain: 0.07, attack: 2.0, release: 3.0, sweep: [[4, 300], [14, 700]] });
      A.boom(17.3, { freq: 36, gain: 0.5, dur: 4 }); A.choir(17, 31, [D3, F4, Fs4], { gain: 0.06, attack: 3.0, release: 3.0, vowel: 0.3 }); for (let q = 19; q < 31; q += 3) A.boom(q, { freq: 44, gain: 0.3, dur: 2 });
      A.bell(33, D6, { gain: 0.09, dur: 6 }); A.shimmer(33, A5, { dur: 6, gain: 0.07 }); A.choir(33, 42, [D3, A3, D4], { gain: 0.05, attack: 1.0, release: 3.0, vowel: 0.9 });
      A.boom(43.2, { freq: 34, gain: 0.8, dur: 6 }); A.riser(43, 56, { from: 80, to: 1000, gain: 0.12 }); for (let q = 44; q < 57; q += 1.0) A.boom(q, { freq: 40 + (q % 2) * 5, gain: 0.25, dur: 1 }); A.brass(46, 58, D3, { gain: 0.07, attack: 4.0, release: 3.0, sweep: [[46, 400], [56, 1200]] });
    },
  });
})();
