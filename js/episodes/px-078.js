/* ============================================================================
 *  REVELATION · PIXEL EDITION · Episode 78 · The Millstone · Revelation 18:21–24
 *  2D pixel-art cut (480x200). A mighty angel lifts a boulder like a great millstone and hurls it into the sea: with such violence the great city Babylon will be thrown down, never to be found again. Then the no-more lines, one by one: music, craftsmen, the millstone, the lamp light, the voice of bridegroom and bride, each fading from the sound until only silence. The whole city beneath the waves. No faces.
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

  Aura.define(78, {
    pixel: true,
    duration: 62,
    cues: [
      { ref: '18:21', t0: 4.0, t1: 16.0 },
      { ref: '18:22', t0: 17.0, t1: 30.0 },
      { ref: '18:23', t0: 31.0, t1: 44.0 },
      { ref: '18:24', t0: 45.0, t1: 58.0 },
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
      const angel = (x, y, s, k, t, seed, o) => { o = o || {}; lib.lightFig({ x, y, h: 44 * s, a: k, t, seed, sway: 0.3, glow: o.glow === undefined ? 1.2 : o.glow }); lib.wings({ x, y: y - 28 * s, s: 0.9 * s, k: k * 0.85, t: t * 1.5 + seed, spread: o.spread === undefined ? 0.7 : o.spread, eyes: 0, n: 2 }); };
      const skyline = (x0, x1, base, k, t, seed, o) => { o = o || {}; if (k <= 0.01) return; const n = Math.round((x1 - x0) / 14); for (let b = 0; b < n; b++) { const x = x0 + b * 14, hh = Math.round(24 + 60 * px.hash(b, seed, 3) * (1 - 0.4 * Math.abs(x - (x0 + x1) / 2) / ((x1 - x0) / 2))), top = Math.round(base - hh); const fall = o.collapse ? clamp((o.collapse * 1.4 - px.hash(b, seed, 6)) * 2, 0, 1) : 0; for (let y = top + Math.round(fall * hh); y < base; y++) for (let xx = x; xx < x + 12; xx++) px.dpx(xx, y, px.ramp(hexes(['#1a1020', '#3a2a40', '#6a5a70']), clamp(0.3 + (xx - x) * 0.03 + (y - top) * 0.002, 0, 1), xx, y), k); for (let q = 0; q < hh / 6; q++) for (let c = 0; c < 2; c++) if (px.hash(b * 3 + c, q + seed, 8) < 0.7 && q * 6 > fall * hh) px.dpx(x + 2 + c * 5, top + 3 + q * 6, hex(o.fire ? '#ff9a40' : '#ffd890'), k * (o.fire ? 0.6 + 0.4 * Math.sin(t * 6 + b + q) : 1)); G(x + 6, top + fall * hh, 7, o.fire ? '#ff6a30' : '#ffe0a0', 0.35 * k); if (o.fire && px.hash(b, seed, 9) < o.fire) fire(x + 6, top + fall * hh + 2, 9, k, t); } if (o.crack) for (let c = 0; c < 5; c++) { let X = x0 + 40 + c * ((x1 - x0 - 80) / 4), Y = base; for (let s = 0; s < 10; s++) { if (s / 10 > o.crack) break; const nx = X + (px.hash(s, c, 4) - 0.5) * 14, ny = Y - 8 - px.hash(s, c, 5) * 8; lib.line(Math.round(X), Math.round(Y), Math.round(nx), Math.round(ny), hex('#050204'), 2); G(nx, ny, 5, '#ff5a30', 0.4 * o.crack * k); X = nx; Y = ny; } } };
      const robed = (x, y, s, k, t) => { if (k <= 0.01) return; x = Math.round(x); y = Math.round(y); G(x, y - 22 * s, 36 * s, '#ffb040', 0.35 * k); for (let yy = 0; yy < 40 * s; yy++) { const u = yy / (40 * s), hw = lerp(5, 17, u) * s; for (let xx = Math.round(x - hw); xx <= Math.round(x + hw); xx++) px.dpx(xx, Math.round(y - 40 * s + yy), px.ramp(hexes(['#3a0a3a', '#7a1a5a', '#b02848', '#e8a040']), clamp(0.3 + 0.3 * Math.sin(xx * 0.4 + yy * 0.2) + (1 - u) * 0.1, 0, 1), xx, yy), k); } lib.ell(x, y - 44 * s, 5 * s, 6 * s, (X, Y) => px.dpx(X, Y, hex('#c89060'), k)); for (let q = -2; q <= 2; q++) lib.line(x + q * Math.round(2 * s), Math.round(y - 52 * s), x + q * Math.round(2 * s), Math.round(y - 58 * s + Math.abs(q)), hex('#ffd060'), 1); lib.line(x - Math.round(4 * s), Math.round(y - 30 * s), x + Math.round(4 * s), Math.round(y - 30 * s), hex('#ffd060'), 2); };
      const cupg = (x, y, s, k, t) => { if (k <= 0.01) return; x = Math.round(x); y = Math.round(y); G(x, y, 30 * s, '#ffb040', 0.4 * k); for (let yy = 0; yy < 12 * s; yy++) { const hw = lerp(10, 4, yy / (12 * s)) * s; for (let xx = Math.round(x - hw); xx <= Math.round(x + hw); xx++) px.dpx(xx, y + yy, px.ramp(hexes(['#6a4a18', '#d89a30', '#fff0a0']), clamp(0.6 - (xx - x) / hw * 0.4, 0, 1), xx, yy), k); } lib.ell(x, y, 10 * s, 3 * s, (X, Y) => px.dpx(X, Y, px.ramp(hexes(['#3a0408', '#a01018', '#e03040']), clamp(0.5 + 0.3 * Math.sin(X * 0.4 + t * 2), 0, 1), X, Y), k)); lib.line(x, y + Math.round(12 * s), x, y + Math.round(20 * s), hex('#c8902a'), 2); };
      const wat = (y0, t, k, a, b, c) => { const U = px.cur(); for (let y = y0; y < H; y++) for (let x = 0; x < W; x++) { const wv = Math.sin(x * 0.08 + t * 1.2 + y * 0.4) * 0.5 + 0.5; U[y * W + x] = px.ramp(hexes([a, b, c]), clamp(0.25 + (y - y0) * 0.003 + wv * 0.25 * k, 0, 1), x, y); } };
      const fadeOut = (t, d, col) => px.post({ vignette: 1.2, flash: 0, fade: S(d - 3, d, t), fadeCol: hex(col || '#000000') });
      return {
        render(t) {
          const U = px.cur(), fall = S(6, 12, t), splash = t > 12 ? Math.exp(-(t - 12) * 0.6) : 0, sub = S(14, 44, t);
          lib.skyGrad({ t, top: '#10142a', mid: '#4a3a60', bot: '#c88a78', cloud: 0.4, wind: 0.2, y1: 130 });
          for (let y = 130; y < H; y++) for (let x = 0; x < W; x++) { const wv = Math.sin(x * 0.06 + t * 1.2 + y * 0.3) * 0.5 + 0.5, dp = (y - 130) / 70; U[y * W + x] = px.ramp(hexes(['#10305a', '#1a4a80', '#2a70a0', '#a0d0e0']), clamp(0.3 + wv * 0.2 - dp * 0.1 + splash * Math.exp(-Math.pow((x - 300) / (30 + (t - 12) * 25), 2)) * 0.5, 0, 1), x, y); }
          const ck = 1 - S(14, 40, t); skyline(160, 460, Math.round(130 + sub * 70), 0.9 * ck, t, 12, { fire: 0.5 * (1 - sub) }); const wl = S(20, 44, t); if (wl > 0) for (let y = 130; y < H; y++) for (let x = 120; x < 480; x++) px.dpx(x, y, hex('#10305a'), 0.5 * wl * clamp((y - 130 + sub * 20) / 60, 0, 1) * 0.0 + 0);
          const sy = lerp(-30, 135, fall * fall), sk = 1 - S(12.5, 13.5, t); if (sk > 0) { lib.ell(300, sy, 24, 20, (X, Y, dx, dy) => px.dpx(X, Y, px.ramp(hexes(['#2a2a30', '#5a5a64', '#9a9aa4']), clamp(0.45 - dx * 0.3 - dy * 0.3 + 0.3 * px.fbm(X * 0.2, Y * 0.2, 2, 5), 0, 1), X, Y), sk)); for (let q = 1; q < 8; q++) lib.line(300 + q, Math.round(sy - 40 - q * 6), 300 + q, Math.round(sy - 20), hex('#a0b0d0'), 1); }
          angel(220, 60, 2.0, S(2, 6, t) * (1 - S(10, 14, t)), t, 3, { spread: 0.7 });
          if (splash > 0.02) for (let i = 0; i < 70; i++) { const a = -1.57 + (px.hash(i, 1, 4) - 0.5) * 2.2, v = 60 + px.hash(i, 2, 4) * 80, tt = t - 12, X = 300 + Math.cos(a) * v * tt * 0.7, Y = 130 + Math.sin(a) * v * tt * 0.7 + 60 * tt * tt; if (Y < H) lib.ell(X, Y, 2, 2, (a2, b2) => px.dpx(a2, b2, hex('#e8f4ff'), 0.9 * splash)); }
          const nm = [['MUSIC', 17, 24], ['WORK', 25, 30], ['MILL', 31, 36], ['LAMP', 37, 42], ['VOICES', 45, 52]]; for (let j = 0; j < nm.length; j++) { const a = S(nm[j][1], nm[j][1] + 1.5, t) * (1 - S(nm[j][2], nm[j][2] + 4, t)); if (a > 0) { const tx = 'NO MORE ' + nm[j][0], tw = px.textWidth(tx, 4, 1); px.text(tx, Math.round(240 - tw / 2), 20 + j * 4, 4, hex('#c8d8f0'), a * 0.9); } }
          const dk = S(40, 58, t); tint(0, H, '#02040a', 0.8 * dk); const lamp = (1 - S(36, 41, t)) * S(14, 18, t); for (let i = 0; i < 8; i++) G(180 + i * 38, 150 + sub * 60, 8, '#ffd890', 0.6 * lamp * (1 - sub * 0.5));
          px.post({ vignette: 1.2, flash: 0, fade: Math.max(1 - S(0, 1.4, t), S(59, 62, t)), fadeCol: hex('#000000') }); lib.titleCard(t, 'THE MILLSTONE', 78);
        },
      };
    },

    score(A, from) {
      const D2 = 73.42, D3 = 146.83, A3 = 220, D4 = 293.66, F4 = 349.23, Fs4 = 369.99, A4 = 440, D5 = 587.33, F5 = 698.46, Fs5 = 739.99, A5 = 880, D6 = 1174.66;
      A.drone(0, 62, D2, { gain: 0.06, attack: 3.0, release: 3.0 });
      A.boom(11.9, { freq: 28, gain: 1.0, dur: 8 }); A.noise({ t0: 11.9, t1: 22, gain: [[11.9, 0.5], [22, 0]], filter: { type: 'lowpass', freq: 2000, q: 0.5 }, wet: 0.4, attack: 0.1, release: 3 }); A.riser(6, 11.9, { from: 100, to: 1500, gain: 0.12 });
      A.choir(4, 24, [D3, A3, D4, Fs4], { gain: 0.07, attack: 4.0, release: 4.0, vowel: 0.8 });
      for (let i = 0; i < 16; i++) A.bell(17 + i * 1.2, [D5, A5, Fs5][i % 3], { gain: 0.04 * (1 - i / 17), dur: 3 });
      A.shimmer(18, A5, { dur: 22, gain: 0.04 }); A.brass(26, 40, D3, { gain: 0.03, attack: 3.0, release: 4.0, sweep: [[26, 800], [38, 300]] }); A.bell(42, D5, { gain: 0.04, dur: 6 });
      A.drone(44, 62, D2 * 0.75, { gain: 0.04, attack: 3.0, release: 6.0 });
    },
  });
})();
