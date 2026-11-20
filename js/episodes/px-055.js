/* ============================================================================
 *  REVELATION · PIXEL EDITION · Episode 55 · Fallen Is Babylon · Revelation 14:6–8
 *  2D pixel-art cut (480x200). Another angel flies in mid-air with the eternal gospel for every nation, tribe, language and people: fear God and give Him glory, worship Him who made the heavens, earth, sea and springs. A second angel follows: Fallen, fallen is Babylon the Great. A long high-altitude tracking shot across continents, and a glittering city beginning to crack. No faces.
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

  Aura.define(55, {
    pixel: true,
    duration: 56,
    cues: [
      { ref: '14:6', t0: 5.0, t1: 14.0 },
      { ref: '14:7', t0: 15.0, t1: 28.0 },
      { ref: '14:8', t0: 30.0, t1: 44.0 },
    ],
    titles: [],

    build(ctx) {
      const angel = (x, y, s, k, t, seed, o) => { o = o || {}; lib.lightFig({ x, y, h: 44 * s, a: k, t, seed, sway: 0.3, glow: o.glow === undefined ? 1.2 : o.glow }); lib.wings({ x, y: y - 28 * s, s: 0.9 * s, k: k * 0.85, t: t * 1.5 + seed, spread: o.spread === undefined ? 0.7 : o.spread, eyes: 0, n: 2 }); };
      const earth = (t, sp) => { const U = px.cur(); for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const wx = x + t * sp, n = px.fbm(wx * 0.006, y * 0.01, 4, 3), land = n > 0.52; U[y * W + x] = land ? px.ramp(hexes(['#10200c', '#26401a', '#4a6a2a', '#8a8a4a']), clamp((n - 0.5) * 4 + 0.15 * px.fbm(wx * 0.05, y * 0.05, 2, 9), 0, 1), x, y) : px.ramp(hexes(['#08183a', '#10306a', '#2a5aa0']), clamp(0.3 + n * 0.8, 0, 1), x, y); } };
      return {
        render(t) {
          const U = px.cur();
          if (t < 30) {
            earth(t, 40);
            for (let i = 0; i < 16; i++) { const x = (((px.hash(i, 1, 3) * 640 - t * 120 * (0.6 + px.hash(i, 2, 3))) % 640) + 640) % 640 - 80, y = px.hash(i, 3, 3) * 200, r = 30 + px.hash(i, 4, 3) * 50; lib.ell(x, y, r, r * 0.28, (X, Y, dx, dy) => px.dpx(X, Y, mix(hex('#a0b0d0'), hex('#ffffff'), clamp(0.55 - dy * 0.4, 0, 1)), 0.75)); }
            const ak = S(2, 5, t); angel(220, 120 + 6 * Math.sin(t * 1.2), 1.3, ak, t, 1, { spread: 0.9 }); G(220, 100, 90, '#fff0c0', 0.3 * ak);
            for (let q = 0; q < 24; q++) G(200 - q * 12, 112 + q * 0.5, 14 - q * 0.4, '#fff6d0', 0.35 * ak * (1 - q / 24));
            const sk = S(15, 20, t); angel(110, 150 + 4 * Math.sin(t * 1.4), 1.0, sk, t, 7, { spread: 0.9 });
            const pk = S(5, 8, t) * (1 - S(27, 30, t)); for (let r = 0; r < 3; r++) { const a = ((t - 6) * 0.45 + r * 0.33) % 1; for (let i = 0; i < 80; i++) { const an = i / 80 * 6.283; px.dpx(Math.round(220 + Math.cos(an) * a * 260), Math.round(110 + Math.sin(an) * a * 110), hex('#fff0c8'), 0.4 * (1 - a) * pk); } }
            px.post({ vignette: 1.0, flash: 0, fade: Math.max(1 - S(0, 1.4, t), S(29, 30, t)), fadeCol: hex('#000000') }); lib.titleCard(t, 'FALLEN BABYLON', 55); return;
          }
          lib.skyGrad({ t, top: '#1a1228', mid: '#5a3a58', bot: '#d89070', cloud: 0.6, wind: 0.2, y1: 140 }); lib.land({ y0: 140, amp: 6, c1: '#2a2030', c2: '#0c0810', seed: 8, scroll: 0, k: 1 });
          const ck = S(30, 35, t), crack = S(34, 42, t);
          for (let b = 0; b < 22; b++) { const x = 40 + b * 19, h = 30 + 70 * px.hash(b, 1, 3) * (1 - 0.5 * Math.abs(x - 240) / 200), y0 = Math.round(150 - h); for (let y = y0; y < 150; y++) for (let xx = x; xx < x + 16; xx++) px.dpx(xx, y, px.ramp(hexes(['#10101c', '#2a2a40', '#5a5a80']), clamp(0.3 + (xx - x) * 0.02, 0, 1), xx, y), ck); for (let q = 0; q < h / 6; q++) if (px.hash(b, q, 8) < 0.7) { G(x + 3 + (q % 2) * 8, y0 + 4 + q * 6, 2.5, '#ffd890', 0.9 * ck * (0.6 + 0.4 * Math.sin(t * 4 + b + q))); } G(x + 8, y0, 8, '#fff0c0', 0.5 * ck); }
          for (let c = 0; c < 4; c++) { let x = 120 + c * 80, y = 150; for (let s = 0; s < 14; s++) { if (s / 14 > crack) break; const nx = x + (px.hash(s, c, 4) - 0.5) * 18, ny = y - 8 - px.hash(s, c, 5) * 8; lib.line(Math.round(x), Math.round(y), Math.round(nx), Math.round(ny), hex('#050204'), 2); G(nx, ny, 6, '#ff5a30', 0.5 * crack); x = nx; y = ny; } }
          angel(380, 60, 0.9, S(30, 34, t) * (1 - S(40, 44, t)), t, 3, { spread: 0.9 }); const fl = Math.exp(-Math.max(0, t - 36) * 3) * (t > 36 ? 1 : 0);
          px.post({ vignette: 1.2, flash: fl * 0.4, flashCol: hex('#ffd890'), fade: Math.max(S(29, 30.4, t) < 1 && t < 30.5 ? 1 - S(29, 30.4, t) : 0, S(54, 56, t) * 0 + S(42, 44, t) * 0 + S(54, 56, t)), fadeCol: hex('#000000') }); shake(Math.sin(t * 55) * crack * (1 - crack) * 8, 0);
        },
      };
    },

    score(A, from) {
      const D2 = 73.42, D3 = 146.83, A3 = 220, D4 = 293.66, F4 = 349.23, Fs4 = 369.99, A4 = 440, D5 = 587.33, F5 = 698.46, Fs5 = 739.99, A5 = 880, D6 = 1174.66;
      A.drone(0, 56, D2, { gain: 0.06, attack: 3.0, release: 3.0 });
      A.choir(3, 30, [D3, A3, D4, Fs4], { gain: 0.07, attack: 4.0, release: 3.0, vowel: 1.0 }); A.shimmer(5, A5, { dur: 25, gain: 0.05 }); A.brass(5, 28, D3, { gain: 0.06, attack: 2.0, release: 3.0, sweep: [[5, 600], [24, 1500]] });
      A.noise({ t0: 3, t1: 30, gain: [[3, 0.05], [15, 0.1], [30, 0]], filter: { type: 'highpass', freq: 2000, q: 0.5 }, wet: 0.5, attack: 2, release: 2 });
      A.boom(30.3, { freq: 36, gain: 0.8, dur: 5 }); A.choir(30, 44, [D3, F4, A3], { gain: 0.07, attack: 1.0, release: 3.0, vowel: 0.5 });
      for (let q = 34; q < 44; q += 1.6) A.boom(q, { freq: 44, gain: 0.35, dur: 2 }); A.noise({ t0: 34, t1: 46, gain: [[34, 0.0], [40, 0.3], [46, 0]], filter: { type: 'lowpass', freq: 800, q: 1 }, wet: 0.4, attack: 1, release: 2 });
      A.drone(44, 56, D2 * 0.75, { gain: 0.07, attack: 1.0, release: 3.0 });
    },
  });
})();
