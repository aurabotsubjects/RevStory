/* ============================================================================
 *  REVELATION · PIXEL EDITION · Episode 39 · Take It and Eat · Revelation 10:8–11
 *  2D pixel-art cut (480x200). Intimate close-ups of John taking the little scroll from the angel. Honey-gold light, then a cold, sour green. His face lit from the scroll. A final pull-back shows the world of nations spread before him. No faces seen in detail.
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

  Aura.define(39, {
    pixel: true,
    duration: 56,
    cues: [
      { ref: '10:8', t0: 5.0, t1: 14.0 },
      { ref: '10:9', t0: 15.0, t1: 28.0 },
      { ref: '10:10', t0: 29.0, t1: 40.0 },
      { ref: '10:11', t0: 41.0, t1: 52.0 },
    ],
    titles: [],

    build(ctx) {
      const head = (cx, cy, k, lit, t) => { lib.ell(cx, cy, 44, 54, (X, Y, dx, dy) => px.set(X, Y, mix(hex('#0a0608'), px.ramp(hexes(['#3a2018', '#7a4a38', '#c89070', '#f0c8a0']), clamp(0.3 + lit * (0.5 - dx * 0.5) - dy * 0.1, 0, 1), X, Y), k))); lib.ell(cx - 6, cy - 28, 56, 44, (X, Y, dx, dy) => { if (dy < 0.2) px.set(X, Y, hex('#0a0810')); }); for (let q = 0; q < 6; q++) lib.line(cx + 10 - q * 5, cy + 36, cx + 14 - q * 6, cy + 56 + q * 2, hex('#2a1a18'), 3); lib.ell(cx + 14, cy - 8, 6, 3, (X, Y) => px.set(X, Y, hex('#0a0608'))); lib.line(cx + 4, cy + 14, cx + 12, cy + 18, hex('#2a0c10'), 2); };
      return {
        render(t) {
          const sour = S(30, 33, t) * (1 - S(40, 41, t) * 0), U = px.cur();
          if (t < 41) {
            for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) U[y * W + x] = hex('#050304');
            const lit = 0.4 + 0.6 * S(10, 18, t);
            G(300, 112, 130, sour > 0.5 ? '#8ae860' : '#ffc860', 0.5 * lit);
            head(240, 100, 1, lit, t);
            const scy = 118 - 12 * S(28, 30, t) * 0, sk = 1 - S(27.5, 30, t);
            lib.scroll({ x: 322 - 70 * S(26, 29, t), y: 116 - 30 * S(26, 29, t), w: 54, h: 30, k: S(9, 14, t) * sk, t, broken: 0, glow: 1.2 });
            if (t > 28 && t < 33) { const a = t - 28; for (let i = 0; i < 40; i++) px.dpx(Math.round(250 + (px.hash(i, 1, 5) - 0.5) * 120 * a), Math.round(120 + (px.hash(i, 2, 5) - 0.5) * 90 * a), hex('#ffe08a'), Math.max(0, 1 - a / 4)); }
            for (let i = 0; i < 40; i++) { const q = (t * 0.08 + i / 40) % 1; px.dpx(Math.round(320 + (px.hash(i, 1, 3) - 0.5) * 140), Math.round(190 - q * 190), hex(sour > 0.5 ? '#a8f080' : '#ffd890'), 0.6 * lit * (1 - q)); }
            tint(0, H, '#3a7a20', 0.32 * sour); tint(0, H, '#0a1a04', 0.22 * sour);
            px.post({ vignette: 1.5, flash: 0, fade: Math.max(1 - S(0, 1.4, t), S(40, 41, t)), fadeCol: hex('#000000') }); lib.titleCard(t, 'TAKE AND EAT', 39); return;
          }
          const pull = S(41, 52, t);
          lib.skyGrad({ t, top: '#1a2850', mid: '#7a5a70', bot: '#f0b070', cloud: 0.3, wind: 0.3, y1: 130 });
          lib.land({ y0: 130, amp: 14, c1: '#3a3a30', c2: '#14140c', seed: 9, scroll: 0, k: 1 }); lib.land({ y0: 150, amp: 8, c1: '#2a2a20', c2: '#0c0c08', seed: 3, scroll: 40, k: 1 });
          lib.cities({ xs: [40, 110, 180, 250, 320, 390, 450], a: S(42, 48, t), amber: hex('#ffb85a') });
          lib.sea({ t, y0: 178, cx: 240, glow: 0.4, ripple: 1, k: 1 });
          for (let i = 0; i < 60; i++) { const x = px.hash(i, 1, 9) * W, y = 130 + px.hash(i, 2, 9) * 40; px.dpx(Math.round(x), Math.round(y), hex('#ffd890'), 0.7 * S(43, 50, t)); }
          lib.person({ x: 70, y: 160, h: 28 - 8 * pull, k: 1, col: '#06060c' }); G(70, 140, 24, '#fff0c0', 0.3);
          tint(0, H, '#3a7a20', 0.1 * (1 - pull)); px.post({ vignette: 1.0, flash: 0, fade: Math.max(1 - S(41, 42.4, t) , S(50, 52, t)) * (t < 41.1 ? 0 : 1), fadeCol: hex('#000000') });
        },
      };
    },

    score(A, from) {
      const D2 = 73.42, D3 = 146.83, A3 = 220, D4 = 293.66, F4 = 349.23, Fs4 = 369.99, A4 = 440, D5 = 587.33, F5 = 698.46, Fs5 = 739.99, A5 = 880, D6 = 1174.66;
      A.drone(0, 56, D2, { gain: 0.06, attack: 2.0, release: 3.0 });
      A.choir(4, 30, [D3, A3, Fs4, A4], { gain: 0.05, attack: 4.0, release: 2.0, vowel: 0.8 }); A.bell(15, A5, { gain: 0.05, dur: 8 }); A.shimmer(15, D6, { dur: 14, gain: 0.04 });
      A.boom(29, { freq: 46, gain: 0.5, dur: 3 });
      A.choir(30, 40.5, [D3, F4, Fs4], { gain: 0.05, attack: 1.0, release: 1.0, vowel: 0.2 }); A.drone(30, 40.5, D2 * 0.75, { gain: 0.07, attack: 1.0, release: 0.5 });
      A.choir(41, 56, [D3, A3, D4, Fs4, A4], { gain: 0.07, attack: 4.0, release: 4.0, vowel: 1.0 }); A.brass(41, 52, D3, { gain: 0.06, attack: 4.0, release: 3.0, sweep: [[41, 400], [50, 1600]] });
    },
  });
})();
