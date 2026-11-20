/* ============================================================================
 *  REVELATION · PIXEL EDITION · Episode 33 · The Abyss Is Opened · Revelation 9:1–6
 *  2D pixel-art cut (480x200). The fifth trumpet. A fallen star is given the key to the shaft of the Abyss. Smoke rises like a great furnace and darkens the sun. A swarm of locusts pours out, tormenting only those without the seal, and keeping away from the sealed, who are ringed in gold. Tense and tilted. No faces.
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

  Aura.define(33, {
    pixel: true,
    duration: 66,
    cues: [
      { ref: '9:1', t0: 5.0, t1: 15.0 },
      { ref: '9:2', t0: 16.0, t1: 27.0 },
      { ref: '9:3', t0: 28.0, t1: 37.0 },
      { ref: '9:4', t0: 38.0, t1: 47.0 },
      { ref: '9:5', t0: 48.0, t1: 56.0 },
      { ref: '9:6', t0: 57.0, t1: 64.0 },
    ],
    titles: [],

    build(ctx) {
      const SEALED = [[352, 172], [378, 176], [404, 171], [430, 177]];
      const tilt = (a) => { const U = px.cur(), C = U.slice(), ca = Math.cos(a), sa = Math.sin(a); for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const X = x - 240, Y = y - 100, sx = Math.round(240 + X * ca - Y * sa), sy = Math.round(100 + X * sa + Y * ca); U[y * W + x] = C[clamp(sy, 0, H - 1) * W + clamp(sx, 0, W - 1)]; } };
      return {
        render(t) {
          const sm = S(17, 32, t), sunk = 1 - 0.95 * S(20, 30, t), cz = 1 + t * 0.006, shaftOpen = S(14, 22, t);
          lib.skyGrad({ t, top: '#1a1c34', mid: '#4a3a50', bot: '#8a5a44', cloud: 0.25, wind: 0.2, y1: 140, dark: 0.3 });
          G(130, 46, 54, '#ffdf9a', 0.6 * sunk); lib.ell(130, 46, 13, 13, (X, Y) => px.dpx(X, Y, hex('#fff2c0'), sunk));
          const U = px.cur();
          for (let y = 140; y < H; y++) for (let x = 0; x < W; x++) { const v = 0.18 + 0.1 * px.fbm(x * 0.03, y * 0.08, 3, 17) + (y - 140) * 0.0018, c = px.ramp(hexes(['#0a0608', '#1c1210', '#3a2a22', '#5a4636']), clamp(v, 0, 1), x, y); U[y * W + x] = c; }
          for (let i = 0; i < 26; i++) { const x0 = px.hash(i, 1, 5) * W, y0 = 142 + px.hash(i, 2, 5) * 56; lib.line(Math.round(x0), Math.round(y0), Math.round(x0 + 14 * (px.hash(i, 3, 5) - 0.5)), Math.round(y0 + 5), hex('#08040a'), 1); }
          const cx = 240, cy = 168, rx = 62 * cz * (0.35 + 0.65 * shaftOpen), ry = 13 * cz * (0.35 + 0.65 * shaftOpen);
          G(cx, cy - 6, rx * 1.6, '#ff6a18', 0.55 * shaftOpen); lib.ell(cx, cy, rx, ry, (X, Y, dx, dy) => px.set(X, Y, mix(hex('#030204'), hex('#3a0c06'), clamp(0.6 + dy * 0.5 - Math.abs(dx) * 0.4, 0, 1) * shaftOpen)));
          for (let i = 0; i < 30; i++) { const q = (t * 0.5 + i / 30) % 1; G(cx + (px.hash(i, 1, 8) - 0.5) * rx * 1.6, cy - q * 110, 4 + q * 10, '#c8503a', 0.5 * (1 - q) * shaftOpen); }
          const fk = S(3, 5, t) * (1 - 0 * S(20, 24, t)), fy = t < 10 ? lerp(10, 150, S(5.5, 10, t)) : 150;
          if (t < 10) { G(70, fy, 20, '#ffb060', 0.6); for (let q = 0; q < 18; q++) G(70 - q * 1.2, fy - q * 3.4, 6 - q * 0.25, '#ff8a30', 0.6 * (1 - q / 18)); }
          const fa = S(9.5, 11, t); lib.lightFig({ x: 70, y: 176, h: 56 * cz, a: fa, t, seed: 2, sway: 0.1, glow: 0.35, dusk: 0.8 });
          lib.key({ x: 92, y: 150, z: 0.8 * cz, rot: t * 0.7, t, k: fa * (1 - S(17, 20, t) * 0.6), glow: 0.8 });
          for (let y = 0; y < 170; y++) for (let x = 0; x < W; x++) { const n = px.fbm(x * 0.011 + t * 0.01, y * 0.013 - t * 0.12, 4, 31), d = clamp((n - 0.28) * 3.0, 0, 1) * sm * clamp(1.2 - y / 220, 0.35, 1); if (d > 0.02) px.dpx(x, y, hex(n > 0.62 ? '#2a2420' : '#0c0a0c'), Math.min(1, d * 1.05)); }
          const sk = S(32, 36, t), glowk = S(38, 41, t);
          for (const [sx, sy] of SEALED) { lib.person({ x: sx, y: sy, h: 26, k: sk, col: '#0a0810' }); G(sx, sy - 14, 34, '#ffd890', 0.6 * glowk * sk); G(sx, sy - 26, 5, '#fff2c0', 0.9 * glowk * sk); }
          const sw = S(28, 33, t); if (sw > 0) for (let i = 0; i < 300; i++) { const born = px.hash(i, 7, 3) * 12, a = t - 28 - born; if (a < 0) continue; const ang = -0.3 - px.hash(i, 1, 3) * 2.6, sp = 18 + px.hash(i, 2, 3) * 36; let X = cx + Math.cos(ang) * sp * a * 0.5 + Math.sin(a * 2 + i) * 4 + (px.hash(i, 4, 3) - 0.5) * a * 22, Y = cy - 6 + Math.sin(ang) * sp * a * 0.45 + Math.cos(a * 2.3 + i) * 3 + a * 2; for (const [qx, qy] of SEALED) { const d = Math.hypot(X - qx, Y - (qy - 14)); if (d < 40 && d > 0.1) { X += (X - qx) / d * (40 - d); Y += (Y - (qy - 14)) / d * (40 - d); } } const fl = Math.sin(t * 40 + i) > 0; const RX = Math.round(X), RY = Math.round(Y); px.set(RX, RY, hex('#0a0608')); px.set(RX + 1, RY, hex('#1a0e0a')); px.set(RX, RY + 1, hex('#0a0608')); px.set(RX + (fl ? 2 : -1), RY - 1, hex('#c8a060')); px.set(RX + (fl ? 3 : -2), RY - 2, hex('#8a6a40')); }
          tilt(0.045 * S(2, 14, t)); px.post({ vignette: 1.5, flash: 0, fade: Math.max(1 - S(0, 1.4, t), S(64, 66, t)), fadeCol: hex('#000000') });
          lib.titleCard(t, 'THE ABYSS', 33);
        },
      };
    },

    score(A, from) {
      const D2 = 73.42, D3 = 146.83, A3 = 220, D4 = 293.66, F4 = 349.23, Fs4 = 369.99, A4 = 440, D5 = 587.33, F5 = 698.46, Fs5 = 739.99, A5 = 880, D6 = 1174.66;
      A.drone(0, 66, D2, { gain: 0.07, attack: 2.0, release: 3.0 });
      A.brass(4.8, 12, D3, { gain: 0.09, attack: 0.05, release: 2.5, sweep: [[4.8, 1500], [9, 500]] }); A.boom(4.9, { freq: 44, gain: 0.5, dur: 3 });
      A.bell(10.5, A5, { gain: 0.05, dur: 6 });
      A.boom(14.5, { freq: 36, gain: 0.8, dur: 6 }); A.noise({ t0: 15, t1: 34, gain: [[15, 0.0], [22, 0.3], [34, 0.2]], filter: { type: 'lowpass', freq: 700, q: 1 }, wet: 0.5, attack: 2, release: 3 });
      A.choir(18, 40, [D3, F4, Fs4], { gain: 0.05, attack: 4.0, release: 3.0, vowel: 0.3 });
      A.noise({ t0: 28, t1: 66, gain: [[28, 0.0], [34, 0.22], [60, 0.22], [66, 0]], filter: { type: 'bandpass', freq: 3200, q: 1.5 }, wet: 0.2, attack: 2, release: 3 });
      A.choir(38, 48, [A4, D5], { gain: 0.05, attack: 2.0, release: 2.0, vowel: 1.0 }); A.shimmer(38, A5, { dur: 10, gain: 0.04 });
      A.drone(40, 66, D2 * 0.75, { gain: 0.07, attack: 3.0, release: 3.0 });
      A.brass(57, 64, D3, { gain: 0.07, attack: 1.5, release: 2.5, sweep: [[57, 400], [62, 1200]] });
    },
  });
})();
