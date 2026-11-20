/* ============================================================================
 *  REVELATION · PIXEL EDITION · Episode 31 · Hail and Fire; the Burning Mountain · Revelation 8:7–9
 *  2D pixel-art cut (480x200). The first trumpet: hail and fire mixed with blood sweeps over a forest from above, a third of it burning. The second trumpet: a great mountain, all ablaze, is hurled into the sea. The wave, the sea turned to blood, a third of the ships lost. A star burns brighter in the night. No faces.
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

  Aura.define(31, {
    pixel: true,
    duration: 62,
    cues: [
      { ref: '8:7', t0: 5.0, t1: 28.0 },
      { ref: '8:8', t0: 31.0, t1: 44.0 },
      { ref: '8:9', t0: 45.0, t1: 56.0 },
    ],
    titles: [],

    build(ctx) {
      const GREEN = lib.EMER;
      const shipPos = [[90, 152, 0], [330, 160, 1], [410, 150, 2]];
      const ship = (x, y, tilt, burn, t, sink) => { const yy = y + sink; for (let i = -14; i <= 14; i++) { const hy = Math.round(yy + Math.abs(i) * 0.12 + i * tilt); for (let d = 0; d < 5; d++) px.set(Math.round(x + i), hy - d, hex(d < 1 ? '#2a1a10' : '#1a1010')); } lib.line(Math.round(x), Math.round(yy - 4), Math.round(x + tilt * 20), Math.round(yy - 30), hex('#1a1010'), 1); for (let q = -1; q <= 1; q += 2) lib.line(Math.round(x + tilt * 20), Math.round(yy - 28), Math.round(x + q * 11), Math.round(yy - 12), hex('#3a2a20'), 1); fire(x, yy - 12, 10, burn, t); };
      return {
        render(t) {
          if (t < 30) {
            const prog = S(7, 27, t);
            lib.skyGrad({ t, top: '#1a2030', mid: '#6a4a5a', bot: '#d08040', cloud: 0.5, wind: 0.6, y1: 112, dark: 0.3 });
            for (let y = 112; y < H; y++) for (let x = 0; x < W; x++) px.set(x, y, hex('#10200c'));
            for (let row = 0; row < 11; row++) {
              const y = 114 + row * row * 0.9 + row * 5, sz = 4 + row * 1.5, span = W + 60;
              for (let c = 0; c < Math.ceil(span / (sz * 1.5)); c++) {
                const i = row * 200 + c, bx = (((c * sz * 1.5 - t * (row + 1) * 2.2) % span) + span) % span - 20, th = px.hash(i, 2, 3), burnAt = th / 0.34, age = prog - burnAt, burned = th < 0.34 && age > 0;
                lib.ell(bx, y, sz, sz * 0.7, (X, Y, dx, dy) => { if (burned) px.set(X, Y, mix(hex('#1c1210'), hex('#3a2218'), clamp(0.5 + 0.4 * dx - 0.3 * dy, 0, 1))); else px.set(X, Y, px.ramp(GREEN, clamp(0.35 + 0.18 * dx - 0.2 * dy + 0.1 * px.hash(X, Y, 2), 0, 1), X, Y)); });
                if (burned && age < 0.22) fire(bx, y - sz * 0.3, sz * 1.6, 1 - age / 0.22, t + i);
              }
            }
            const hk = S(3, 6, t) * (1 - S(26, 30, t));
            for (let i = 0; i < 150; i++) { const ph = (t * 0.8 + px.hash(i, 5, 3)) % 1, y = -12 + ph * 230, x = px.hash(i, 4, 3) * W * 1.4 - ph * 110, c = i % 3 === 0 ? '#ff5a2a' : i % 3 === 1 ? '#fff6e0' : '#ffb870'; lib.line(Math.round(x), Math.round(y), Math.round(x + 7), Math.round(y - 14), hex(c), 1); px.dpx(Math.round(x), Math.round(y), hex('#ffffff'), hk); }
            tint(0, H, '#a00808', 0.12 * hk);
            px.post({ vignette: 1.0, flash: 0, fade: Math.max(1 - S(0, 1.4, t), S(28, 30, t)), fadeCol: hex('#000000') });
            lib.titleCard(t, 'HAIL AND FIRE', 31);
            return;
          }
          const u = S(33, 41, t), imp = 41.4, age = t - imp, sea0 = 150;
          lib.skyGrad({ t, top: '#1a0c14', mid: '#7a2a24', bot: '#e07a30', cloud: 0.6, wind: 0.2, y1: sea0, dark: 0.2 });
          lib.sea({ t, y0: sea0, cx: 240, glow: 0.5, ripple: 1, k: 1 });
          const bloodK = S(42, 52, t); tint(sea0, H, '#a01010', 0.55 * bloodK);
          const peak = t < imp ? lerp(-140, 124, Math.pow(u, 1.6)) : lerp(124, 190, S(imp, imp + 5, t));
          for (let x = 110; x <= 370; x++) { const top = Math.round(peak + Math.pow(Math.abs(x - 240) / 130, 0.8) * 110 + (px.fbm(x * 0.06, 1, 2, 9) - 0.5) * 14); for (let y = Math.max(0, top); y < Math.min(sea0 + (age > 0 ? 6 : 200), top + 160); y++) { const v = px.fbm(x * 0.07, y * 0.09 - t * 0.3, 3, 21), lava = v > 0.55; px.set(x, y, lava ? px.ramp(hexes(['#7a1a08', '#d04010', '#ff8a2a', '#ffd070']), clamp((v - 0.5) * 3, 0, 1), x, y) : mix(hex('#140c0c'), hex('#3a2218'), clamp(v + (y - top) * 0.004, 0, 1))); } }
          if (peak > -100 && peak < 160 && t < imp + 3) { G(240, peak + 30, 90, '#ff6a20', 0.5 * (1 - S(imp, imp + 3, t))); for (let i = 0; i < 40; i++) { const q = (t * 1.2 + i / 40) % 1; G(240 + (px.hash(i, 3, 8) - 0.5) * 120, peak - q * 70, 4, '#ff9a40', 0.5 * (1 - q)); } }
          if (age > 0) {
            for (let r = 0; r < 3; r++) { const a = age - r * 0.5; if (a <= 0) continue; const rr = 20 + a * 85, k = Math.max(0, 1 - a / 4.5); for (let i = 0; i < 160; i++) { const an = i / 160 * 6.283, X = Math.round(240 + Math.cos(an) * rr), Y = Math.round(sea0 + 4 + Math.sin(an) * rr * 0.16); if (Y >= sea0 - 4) px.dpx(X, Y, hex('#ffe0c0'), k * 0.8); } }
            for (let i = 0; i < 90; i++) { const vx = (px.hash(i, 1, 6) - 0.5) * 110, vy = 70 + px.hash(i, 2, 6) * 110, X = 240 + vx * age, Y = sea0 - vy * age + 90 * age * age; if (Y < sea0 + 6) { px.dpx(Math.round(X), Math.round(Y), hex('#ffd8c0'), 0.9); px.dpx(Math.round(X), Math.round(Y) - 1, hex('#ff8a60'), 0.6); } }
            const col = clamp(1 - age / 1.6, 0, 1); for (let y = 60; y < sea0; y++) for (let x = 205; x < 275; x++) px.dpx(x, y, hex('#ffe0c0'), 0.0 + col * 0.5 * Math.exp(-Math.pow((x - 240) / 18, 2)) * S(60, 150, y) * (1 - S(0, 0.2, age) * 0.0));
          }
          const sk = S(45, 49, t);
          shipPos.forEach(([x, y, i]) => { const bad = i === 1, sink = bad ? S(46, 55, t) * 22 : 0; ship(x, y, bad ? 0.1 + 0.25 * S(46, 55, t) : 0, bad ? sk : 0, t, sink); });
          for (let i = 0; i < 26; i++) { const X = 40 + px.hash(i, 1, 4) * 400, Y = sea0 + 6 + px.hash(i, 2, 4) * 40; lib.ell(X, Y, 3, 1.2, (x2, y2) => px.dpx(x2, y2, hex('#e8d8c8'), 0.8 * S(46 + px.hash(i, 3, 4) * 6, 52, t))); }
          const night = S(54, 58, t); tint(0, H, '#04050e', 0.88 * night); if (night > 0) { stars(t, night, 100); G(330, 36, 14 + 18 * S(56, 61, t), '#ffe0b0', 0.8 * night); px.set(330, 36, hex('#ffffff')); }
          const eq = Math.exp(-Math.max(0, age) / 1.1) * (age > 0 ? 6 : 0); const fl = Math.exp(-Math.max(0, age) / 0.3) * (age > 0 ? 1 : 0);
          px.post({ vignette: 1.0, flash: fl * 0.85, flashCol: hex('#fff0d0'), fade: Math.max(S(30, 31.4, t) < 1 && t < 31.5 ? 1 - S(30, 31.4, t) : 0, S(60, 62, t)), fadeCol: hex('#000000') });
          shake(Math.sin(t * 61) * eq, Math.sin(t * 47) * eq);
        },
      };
    },

    score(A, from) {
      const D2 = 73.42, D3 = 146.83, A3 = 220, D4 = 293.66, F4 = 349.23, Fs4 = 369.99, A4 = 440, D5 = 587.33, F5 = 698.46, Fs5 = 739.99, A5 = 880, D6 = 1174.66;
      /* first trumpet debut: brass, bass hit */
      A.drone(0, 62, D2, { gain: 0.06, attack: 2.0, release: 3.0 });
      A.brass(4.6, 12, D3, { gain: 0.1, attack: 0.05, release: 2.5, sweep: [[4.6, 1800], [8, 700]] }); A.boom(4.7, { freq: 48, gain: 0.55, dur: 3 });
      A.noise({ t0: 6, t1: 28, gain: [[6, 0.0], [10, 0.16], [27, 0.12], [29, 0]], filter: { type: 'bandpass', freq: 2200, q: 0.6 }, wet: 0.25, attack: 1, release: 2 });
      [14, 19, 23].forEach((q, i) => A.boom(q, { freq: 52 - i * 4, gain: 0.3, dur: 2 }));
      A.brass(30.5, 38, D3, { gain: 0.1, attack: 0.05, release: 3.0, sweep: [[30.5, 1700], [34, 600]] }); A.boom(30.6, { freq: 44, gain: 0.55, dur: 3.5 });
      A.riser(34, 41.3, { from: 80, to: 700, gain: 0.14 });
      A.boom(41.4, { freq: 34, gain: 0.9, dur: 6 }); A.noise({ t0: 41.4, t1: 48, gain: [[41.4, 0.5], [48, 0]], filter: { type: 'lowpass', freq: 1800, q: 1 }, wet: 0.4, attack: 0.02, release: 3 });
      A.choir(44, 62, [D3, A3, D4, F4], { gain: 0.05, attack: 3.0, release: 3.0, vowel: 0.4 });
      A.bell(55, D6, { gain: 0.06, dur: 6 }); A.shimmer(56, A5, { dur: 6, gain: 0.04 });
    },
  });
})();
