/* ============================================================================
 *  REVELATION · PIXEL EDITION · Episode 44 · The Kingdom of Our Lord · Revelation 11:15–19
 *  2D pixel-art cut (480x200). The seventh trumpet. The Throne Theme returns in triumph: great voices, the kingdom of the world become the kingdom of our Lord and of His Messiah. The twenty-four elders fall on their faces. The temple in heaven is opened and the ark of His covenant is seen in golden light. Lightning, thunder, earthquake and hail, heaven to earth. Closes Part IV on majesty. No faces.
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

  Aura.define(44, {
    pixel: true,
    duration: 70,
    cues: [
      { ref: '11:15', t0: 5.0, t1: 22.0 },
      { ref: '11:16', t0: 23.0, t1: 34.0 },
      { ref: '11:17', t0: 35.0, t1: 46.0 },
      { ref: '11:18', t0: 47.0, t1: 58.0 },
      { ref: '11:19', t0: 59.0, t1: 68.0 },
    ],
    titles: [],

    build(ctx) {
      const GOLD = hexes(['#1a1008', '#3d2410', '#7a4a1a', '#b8802a', '#e8b04a', '#ffd987', '#fff3c8']);
      const hall = (t, glow, flash) => { const U = px.cur(); for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const dx = (x - 240) / 240, f = y / H, v = 0.05 + 0.12 * f + glow * 0.4 * Math.exp(-dx * dx * 2.4 - Math.pow((y - 80) / 90, 2)) + 0.03 * px.fbm(x * 0.02, y * 0.04 + t * 0.03, 2, 8); U[y * W + x] = px.ramp(GOLD, clamp(v + (flash || 0) * 0.4, 0, 1), x, y); } };
      const ark = (x, y, k, t) => { G(x, y - 6, 80, '#ffe9a0', 0.8 * k); lib.ell(x, y, 24, 11, (X, Y, dx, dy) => px.dpx(X, Y, px.ramp(hexes(['#7a4a1a', '#b8802a', '#ffd070', '#fff6d0']), clamp(0.5 - dy * 0.4 + dx * 0.15, 0, 1), X, Y), k)); for (let q = -1; q <= 1; q += 2) for (let f = 0; f < 6; f++) lib.line(x + q * 16, y - 12, Math.round(x + q * (6 + f * 3)), Math.round(y - 34 - f * 2 + Math.sin(t * 2 + f) * 1.5), hex('#ffe9a0'), 1); };
      return {
        render(t) {
          const lt = t >= 59 && t < 68, fl = lt ? Math.exp(-((t - 59) % 1.7) * 6) : 0;
          hall(t, 0.5 + 0.5 * S(5, 20, t), fl);
          if (t >= 59 && t < 64) { lib.skyGrad({ t, top: '#10101c', mid: '#2a2a40', bot: '#5a4a50', cloud: 0.7, wind: 0.5, y1: 100, dark: 0.7 }); }
          lib.glory({ cx: 240, cy: 90, hy: 150, k: S(3, 12, t) * (1 - S(59, 60, t) * 0.7), rays: 1, t });
          const tk = S(1, 5, t) * (1 - S(59, 60, t)); lib.throne({ U: px.cur(), z: 1.3, x: 240, y: 168, k: tk, t });
          for (let r = 0; r < 24; r++) { const a = r / 24 * 6.2832, ex = 240 + Math.cos(a) * 150, ey = 160 + Math.sin(a) * 30, ek = S(6 + r * 0.2, 12 + r * 0.2, t) * (1 - S(59, 60, t)); lib.elder({ x: ex, y: ey, h: 34, k: ek, kneel: S(23 + (r % 6) * 0.3, 28, t) * (1 - S(36, 38, t) * 0), t, seed: r, glow: 0.8 }); }
          const ak = S(5, 8, t) * (1 - S(24, 26, t)); lib.lightFig({ x: 240, y: 70, h: 40, a: ak, t, seed: 7, sway: 0.3, glow: 1.3 }); lib.line(246, 52, 270, 34, hex('#ffd070'), 2); G(270, 34, 12, '#fff0b0', 0.7 * ak * (0.6 + 0.4 * Math.sin(t * 6)));
          if (t > 12 && t < 22) for (let i = 0; i < 6; i++) { const a = (t - 12 - i * 0.7) / 3; if (a > 0 && a < 1) for (let q = 0; q < 70; q++) px.dpx(Math.round(240 + Math.cos(q / 70 * 6.28) * a * 280), Math.round(100 + Math.sin(q / 70 * 6.28) * a * 120), hex('#ffe9a0'), 0.4 * (1 - a)); }
          const ok = S(35, 42, t) * (1 - S(59, 60, t)); if (ok > 0.01) { for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const cx = Math.abs(x - 240), edge = 240 * (1 - ok); if (cx > edge - 4 && cx < edge + 60 && y < 200) px.dpx(x, y, hex('#10080c'), 0.7 * Math.min(1, (cx - edge + 4) / 20) * (1 - ok * 0.4)); } ark(240, 122, ok, t); }
          const hk = S(47, 55, t); if (hk > 0.01 && t < 59) G(240, 100, 160 + 50 * Math.sin(t * 2), '#ffe9a0', 0.15 * hk);
          if (lt) { if (true) { for (let y = 100; y < H; y++) for (let x = 0; x < W; x++) px.set(x, y, px.ramp(hexes(['#0a0c10', '#1a2028', '#3a4450']), clamp(0.3 + (y - 100) * 0.004, 0, 1), x, y)); } const hail = S(60, 62, t); for (let i = 0; i < 160; i++) { const ph = (t * 1.6 + px.hash(i, 5, 3)) % 1, y = -10 + ph * 220, x = px.hash(i, 4, 3) * W - ph * 40; lib.line(Math.round(x), Math.round(y), Math.round(x + 3), Math.round(y - 9), hex('#e8f0ff'), 1); } for (let i = 0; i < 3; i++) { const a = (t - 59.2 - i * 1.7); if (a > 0 && a < 0.5) bolt(100 + i * 140, 0, 100 + i * 140 + (px.hash(i, 1, 2) - 0.5) * 40, 160, i + 11, '#fff8e0', 1 - a * 2); } }
          const closing = S(64, 66, t); if (closing > 0) { hall(t, 1.0, 0); lib.glory({ cx: 240, cy: 90, hy: 150, k: closing, rays: 1.2, t }); lib.throne({ U: px.cur(), z: 1.3, x: 240, y: 168, k: closing, t }); }
          px.post({ vignette: 1.0, flash: fl * 0.7, flashCol: hex('#fff0d0'), fade: Math.max(1 - S(0, 1.4, t), S(68, 70, t)), fadeCol: hex('#000000') }); shake(Math.sin(t * 61) * fl * 4, Math.sin(t * 47) * fl * 4); lib.titleCard(t, 'THE KINGDOM', 44);
        },
      };
    },

    score(A, from) {
      const D2 = 73.42, D3 = 146.83, A3 = 220, D4 = 293.66, F4 = 349.23, Fs4 = 369.99, A4 = 440, D5 = 587.33, F5 = 698.46, Fs5 = 739.99, A5 = 880, D6 = 1174.66;
      A.drone(0, 70, D2, { gain: 0.08, attack: 2.0, release: 3.0 });
      A.boom(4.8, { freq: 40, gain: 0.7, dur: 4 }); A.brass(5, 24, D3, { gain: 0.12, attack: 0.05, release: 3.0, sweep: [[5, 1900], [10, 900]] });
      A.choir(5, 70, [D3, A3, D4, Fs4, A4], { gain: 0.07, attack: 3.0, release: 4.0, vowel: 1.1 });
      [12, 14.7, 17.4, 20.1].forEach((q, i) => { A.brass(q, q + 3.5, [D4, A4, D5, Fs5][i] / 2, { gain: 0.08, attack: 0.1, release: 1.5, sweep: [[q, 1600], [q + 2, 1200]] }); A.boom(q, { freq: 44, gain: 0.45, dur: 3 }); });
      A.bell(23, D5, { gain: 0.07, dur: 8 }); A.boom(23.2, { freq: 36, gain: 0.6, dur: 5 });
      A.shimmer(35, A5, { dur: 24, gain: 0.05 }); A.riser(35, 42, { from: 200, to: 1600, gain: 0.1 }); A.bell(42, D6, { gain: 0.07, dur: 12 });
      [59, 60.7, 62.4].forEach((q, i) => { A.boom(q, { freq: 40 - i * 2, gain: 0.9, dur: 4 }); A.noise({ t0: q, t1: q + 1.5, gain: [[q, 0.4], [q + 1.5, 0]], filter: { type: 'bandpass', freq: 600, q: 0.7 }, wet: 0.4, attack: 0.01, release: 1 }); });
      A.noise({ t0: 60, t1: 66, gain: [[60, 0.0], [62, 0.25], [66, 0]], filter: { type: 'highpass', freq: 3000, q: 1 }, wet: 0.3, attack: 0.5, release: 1 });
      A.brass(64, 70, D3, { gain: 0.1, attack: 1.0, release: 3.0, sweep: [[64, 800], [67, 2000]] }); A.bell(65, D5, { gain: 0.08, dur: 10 });
    },
  });
})();
