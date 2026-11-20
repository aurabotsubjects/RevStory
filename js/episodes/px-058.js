/* ============================================================================
 *  REVELATION · PIXEL EDITION · Episode 58 · The Harvest of the Earth · Revelation 14:14–16
 *  2D pixel-art cut (480x200). A white cloud, and seated on it one like a son of man with a golden crown and a sharp sickle. An angel from the temple calls: take your sickle and reap, for the harvest of the earth is ripe. He swings His sickle and the earth is harvested. A golden grainfield rippling in cinematic light. No faces.
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

  Aura.define(58, {
    pixel: true,
    duration: 56,
    cues: [
      { ref: '14:14', t0: 5.0, t1: 20.0 },
      { ref: '14:15', t0: 21.0, t1: 36.0 },
      { ref: '14:16', t0: 37.0, t1: 50.0 },
    ],
    titles: [],

    build(ctx) {
      const angel = (x, y, s, k, t, seed, o) => { o = o || {}; lib.lightFig({ x, y, h: 44 * s, a: k, t, seed, sway: 0.3, glow: o.glow === undefined ? 1.2 : o.glow }); lib.wings({ x, y: y - 28 * s, s: 0.9 * s, k: k * 0.85, t: t * 1.5 + seed, spread: o.spread === undefined ? 0.7 : o.spread, eyes: 0, n: 2 }); };
      const field = (t, reap, ripple) => { for (let x = 0; x < W; x += 2) for (let r = 0; r < 4; r++) { const y0 = 120 + r * 22, h = 22 + r * 8, cut = clamp((reap - (x / W)) * 6, 0, 1); const wv = Math.sin(x * 0.04 + t * 2 + r) * 4 * ripple * (1 - cut); const hh = h * (1 - 0.8 * cut); lib.line(x, y0 + 30, Math.round(x + wv), Math.round(y0 + 30 - hh), hex(r % 2 ? '#e8b040' : '#ffd070'), 2); px.set(Math.round(x + wv), Math.round(y0 + 30 - hh) - 1, hex('#fff0b0')); } };
      return {
        render(t) {
          const U = px.cur(), reap = S(37, 48, t);
          lib.skyGrad({ t, top: '#3a5aa8', mid: '#a0b8e0', bot: '#fff0c8', cloud: 0.4, wind: 0.3, y1: 150 });
          for (let y = 140; y < H; y++) for (let x = 0; x < W; x++) px.set(x, y, px.ramp(hexes(['#4a3410', '#8a6a20', '#c8a040', '#ffd870']), clamp(0.35 + (y - 140) * 0.004 + 0.1 * px.fbm(x * 0.05, y * 0.1, 2, 4), 0, 1), x, y));
          field(t, reap, 1);
          const cl = S(2, 6, t); for (let i = 0; i < 9; i++) lib.ell(240 + (px.hash(i, 1, 3) - 0.5) * 120, 58 + (px.hash(i, 2, 3) - 0.5) * 20, 30 + px.hash(i, 3, 3) * 14, 16, (X, Y, dx, dy) => px.dpx(X, Y, mix(hex('#c8d0e8'), hex('#ffffff'), clamp(0.6 - dy * 0.4, 0, 1)), 0.95 * cl));
          G(240, 40, 100, '#fff6d0', 0.6 * cl); lib.lightFig({ x: 240, y: 62, h: 58, a: cl, t, seed: 4, sway: 0.1, glow: 1.5 }); lib.crown({ x: 240, y: 6, z: 0.9, k: S(4, 8, t), t, glow: 1 });
          const sk = S(8, 14, t); for (let q = 0; q < 24; q++) { const a = -1.9 + q * 0.07; px.dpx(Math.round(268 + Math.cos(a) * 20), Math.round(30 - Math.sin(a) * 20 + 14), hex('#fff6d0'), sk); } lib.line(262, 40, 276, 20, hex('#d8d0c0'), 2); G(270, 20, 8, '#ffffff', 0.7 * sk);
          const an = S(21, 26, t) * (1 - S(34, 37, t)); angel(120, 80, 1.1, an, t, 8, { spread: 0.8 });
          for (let r = 0; r < 3; r++) { const a = ((t - 22) * 0.5 + r * 0.33) % 1; if (t > 22 && t < 36) for (let i = 0; i < 80; i++) { const q = i / 80 * 6.283; px.dpx(Math.round(120 + Math.cos(q) * a * 220), Math.round(80 + Math.sin(q) * a * 80), hex('#fff6d0'), 0.4 * (1 - a) * an); } }
          if (t > 37 && t < 50) { const x = reap * W; for (let q = 0; q < 6; q++) lib.line(Math.round(x - q * 10), 60 + q * 12, Math.round(x + 20 - q * 10), 150 + q * 6, hex('#ffffff'), 1); G(x, 140, 60, '#fff0b0', 0.55); for (let i = 0; i < 40; i++) { const q = ((t - 37) * 0.4 + px.hash(i, 1, 4)) % 1; px.dpx(Math.round(x - px.hash(i, 2, 4) * 120), Math.round(150 + q * 40), hex('#ffd870'), 0.8 * (1 - q)); } }
          px.post({ vignette: 0.9, flash: 0, fade: Math.max(1 - S(0, 1.4, t), S(54, 56, t)), fadeCol: hex('#ffffff') }); lib.titleCard(t, 'THE HARVEST', 58);
        },
      };
    },

    score(A, from) {
      const D2 = 73.42, D3 = 146.83, A3 = 220, D4 = 293.66, F4 = 349.23, Fs4 = 369.99, A4 = 440, D5 = 587.33, F5 = 698.46, Fs5 = 739.99, A5 = 880, D6 = 1174.66;
      A.drone(0, 56, D2, { gain: 0.06, attack: 3.0, release: 3.0 });
      A.choir(3, 56, [D3, A3, D4, Fs4, A4], { gain: 0.07, attack: 5.0, release: 4.0, vowel: 1.0 }); A.shimmer(5, A5, { dur: 48, gain: 0.05 });
      A.brass(21, 36, D3, { gain: 0.08, attack: 1.0, release: 2.0, sweep: [[21, 600], [30, 1700]] }); A.boom(21.2, { freq: 44, gain: 0.5, dur: 4 });
      A.riser(33, 37.4, { from: 100, to: 1500, gain: 0.14 }); A.boom(37.5, { freq: 38, gain: 0.7, dur: 4 });
      A.noise({ t0: 37.5, t1: 49, gain: [[37.5, 0.0], [42, 0.22], [49, 0]], filter: { type: 'highpass', freq: 3500, q: 0.7 }, wet: 0.3, attack: 1, release: 2 });
      for (let i = 0; i < 8; i++) A.bell(38 + i * 1.3, [D5, A5, Fs5, D6][i % 4], { gain: 0.04, dur: 3 });
    },
  });
})();
