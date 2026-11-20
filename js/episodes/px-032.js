/* ============================================================================
 *  REVELATION · PIXEL EDITION · Episode 32 · Wormwood and the Darkened Sky · Revelation 8:10–13
 *  2D pixel-art cut (480x200). A blazing star falls into a river and the water turns bitter. A third of the sun, moon and stars is struck dark. Then an eagle crosses the sky and cries woe. No faces.
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

  Aura.define(32, {
    pixel: true,
    duration: 60,
    cues: [
      { ref: '8:10', t0: 5.0, t1: 20.0 },
      { ref: '8:11', t0: 21.0, t1: 30.0 },
      { ref: '8:12', t0: 31.0, t1: 44.0 },
      { ref: '8:13', t0: 46.0, t1: 57.0 },
    ],
    titles: [],

    build(ctx) {
      const riverX = (y) => 240 + Math.sin(y * 0.09 + 0.6) * 22 * (y - 120) / 80, riverW = (y) => 3 + (y - 128) * 0.75;
      const eagle = (x, y, s, flap, k) => { if (k <= 0.01) return; const col = hex('#05040a'); for (let q = -1; q <= 1; q += 2) for (let f = 0; f < 26; f++) { const a = (-0.35 + flap * 0.6 - f * 0.028) , L = (22 + f * 2.8) * s; lib.line(Math.round(x), Math.round(y), Math.round(x + q * Math.cos(a) * L), Math.round(y + Math.sin(a) * L * (q < 0 ? 1 : 1) * 0.9 - f * 0.3), col, 2); } lib.ell(x, y + 2 * s, 7 * s, 4 * s, (X, Y) => px.set(X, Y, col)); lib.ell(x + 8 * s, y - 1 * s, 3 * s, 2.4 * s, (X, Y) => px.set(X, Y, col)); px.set(Math.round(x + 12 * s), Math.round(y), hex('#c88a30')); };
      return {
        render(t) {
          const imp = 19.0;
          if (t < 30) {
            const night = hexes(['#02030a', '#0a1020', '#141c34']);
            lib.skyGrad({ t, top: '#02030a', mid: '#0c1428', bot: '#2a2a40', cloud: 0.1, wind: 0.1, y1: 130, dark: 0.5 });
            stars(t, 1, 110);
            lib.land({ y0: 128, amp: 8, c1: '#1a2418', c2: '#0a1008', seed: 4, scroll: 0, k: 1 });
            for (let y = 130; y < H; y++) { const cx = riverX(y), rw = riverW(y); for (let x = Math.round(cx - rw); x <= Math.round(cx + rw); x++) { const b = clamp((t - imp) * 0.12 - Math.abs(y - 160) / 70, 0, 1), c = mix(hex('#4a6a98'), hex('#223014'), b), sh = 0.8 + 0.2 * px.fbm(x * 0.05, y * 0.2 + t * 0.2, 2, 3); px.set(x, y, mix(hex('#0a1020'), c, sh * 0.8)); } }
            for (const [sx, sy, sw] of [[90, 168, 22], [410, 172, 26]]) lib.ell(sx, sy, sw, 6, (X, Y, dx, dy) => px.set(X, Y, mix(hex('#0a1428'), hex('#4a6a98'), clamp(0.4 - dy * 0.3, 0, 1))));
            const burn = S(5, 9, t), fall = S(9, imp, t);
            if (t < imp) { const X = lerp(110, 250, fall), Y = lerp(26, 158, fall * fall); G(X, Y, 26, '#ffb060', 0.5 * burn); for (let q = 0; q < 34; q++) G(X - q * 4.2 * (1 - fall * 0.2), Y - q * 3.4, 8 - q * 0.18, q < 5 ? '#fff6e0' : '#ff7a28', 0.7 * burn * (1 - q / 34)); px.set(Math.round(X), Math.round(Y), hex('#ffffff')); }
            else { const a = t - imp; G(250, 158, 20 + a * 30, '#ffd890', Math.max(0, 0.9 - a * 0.3)); for (let i = 0; i < 40; i++) { const vx = (px.hash(i, 1, 6) - 0.5) * 80, vy = 40 + px.hash(i, 2, 6) * 60; px.dpx(Math.round(250 + vx * a), Math.round(158 - vy * a + 50 * a * a), hex('#ffd0a0'), Math.max(0, 1 - a / 1.5)); } }
            const dead = S(23, 27, t); for (let i = 0; i < 18; i++) { const y = 138 + px.hash(i, 1, 7) * 56, X = riverX(y) + (px.hash(i, 2, 7) - 0.5) * riverW(y) * 1.5; lib.ell(X, y, 3, 1.1, (x2, y2) => px.dpx(x2, y2, hex('#d8e0c8'), 0.85 * dead)); }
            tint(0, H, '#102008', 0.18 * S(imp + 2, imp + 8, t));
            px.post({ vignette: 1.1, flash: Math.exp(-Math.max(0, t - imp) / 0.25) * (t > imp ? 0.7 : 0), flashCol: hex('#fff0d0'), fade: Math.max(1 - S(0, 1.4, t), S(28.6, 30, t)), fadeCol: hex('#000000') });
            lib.titleCard(t, 'WORMWOOD', 32);
            return;
          }
          lib.skyGrad({ t, top: '#16264e', mid: '#34487a', bot: '#c89870', cloud: 0.35, wind: 0.2, y1: 150 });
          lib.land({ y0: 150, amp: 6, c1: '#2a4a24', c2: '#142010', seed: 5, scroll: 0, k: 1 });
          const sx = 90, mx = 240; G(sx, 56, 52, '#ffe9a0', 0.7); lib.ell(sx, 56, 15, 15, (X, Y) => px.set(X, Y, hex('#fff6c8')));
          G(mx, 44, 34, '#d8e4ff', 0.5); lib.ell(mx, 44, 11, 11, (X, Y) => px.set(X, Y, hex('#eef2ff'))); stars(t, 0.6, 90, '#ffffff');
          const dk = S(32.5, 36, t), st = S(33, 34, t) * Math.exp(-Math.max(0, t - 33) / 0.4);
          lib.ell(sx, 56, 15, 15, (X, Y) => { if (X < sx - 5) px.dpx(X, Y, hex('#05060c'), dk); }); lib.ell(mx, 44, 11, 11, (X, Y) => { if (X < mx - 4) px.dpx(X, Y, hex('#05060c'), dk); });
          for (let i = 0; i < 110; i++) { const X = Math.round(px.hash(i, 1, 41) * W); if (px.hash(i, 3, 41) < 0.34) px.dpx(X, Math.round(px.hash(i, 2, 41) * 90), hex('#05060c'), dk); }
          tint(0, H, '#02030a', 0.34 * dk); tint(0, 150, '#02030a', 0.46 * S(44, 48, t)); for (let y = 0; y < 150; y++) for (let x = 0; x < 160; x++) px.dpx(x, y, hex('#02030a'), 0.3 * dk * (1 - S(120, 160, x)));
          const ek = S(45, 48, t), ex = lerp(-60, 540, S(46, 58, t)), flap = Math.sin(t * 2.3);
          eagle(ex, 70 + Math.sin(t * 0.5) * 6, 1.6, flap, ek); G(ex, 72, 60, '#8a9ac8', 0.1 * ek);
          for (let r = 0; r < 3; r++) { const a = (t - 47.5 - r * 0.7); if (a > 0 && a < 3) { const rr = a * 150; for (let i = 0; i < 90; i++) { const an = i / 90 * 6.283; px.dpx(Math.round(ex + Math.cos(an) * rr), Math.round(72 + Math.sin(an) * rr * 0.4), hex('#c8d4ff'), 0.45 * (1 - a / 3)); } } }
          px.post({ vignette: 1.1, flash: st * 0.6, flashCol: hex('#ffffff'), fade: Math.max(S(30, 31.4, t) < 1 && t < 31.5 ? 1 - S(30, 31.4, t) : 0, S(58, 60, t)), fadeCol: hex('#000000') });
          shake(Math.sin(t * 50) * st * 3, 0);
        },
      };
    },

    score(A, from) {
      const D2 = 73.42, D3 = 146.83, A3 = 220, D4 = 293.66, F4 = 349.23, Fs4 = 369.99, A4 = 440, D5 = 587.33, F5 = 698.46, Fs5 = 739.99, A5 = 880, D6 = 1174.66;
      A.drone(0, 60, D2, { gain: 0.05, attack: 2.0, release: 3.0 });
      A.brass(4.8, 12, F4, { gain: 0.08, attack: 0.05, release: 2.5, sweep: [[4.8, 1600], [9, 600]] }); A.boom(4.9, { freq: 46, gain: 0.45, dur: 3 });
      A.riser(9, 19, { from: 120, to: 900, gain: 0.12 }); A.boom(19, { freq: 40, gain: 0.8, dur: 5 });
      A.noise({ t0: 19, t1: 25, gain: [[19, 0.4], [25, 0]], filter: { type: 'lowpass', freq: 1500, q: 1 }, wet: 0.4, attack: 0.02, release: 2 });
      A.choir(21, 31, [D3, F4, A3], { gain: 0.04, attack: 3.0, release: 2.0, vowel: 0.3 });
      A.brass(31.5, 38, D3, { gain: 0.09, attack: 0.05, release: 3.0, sweep: [[31.5, 1500], [35, 500]] }); A.boom(32.8, { freq: 38, gain: 0.8, dur: 5 });
      A.drone(33, 60, D2 * 0.75, { gain: 0.07, attack: 3.0, release: 3.0 });
      A.choir(46, 60, [D3, F4, A3, D4], { gain: 0.08, attack: 2.0, release: 3.0, vowel: 1.0 });
      [47.5, 49.5, 51.5].forEach((q, i) => A.boom(q, { freq: 60 - i * 8, gain: 0.5, dur: 4 })); A.shimmer(47.5, A4, { dur: 9, gain: 0.05 });
    },
  });
})();
