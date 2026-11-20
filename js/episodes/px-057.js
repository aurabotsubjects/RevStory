/* ============================================================================
 *  REVELATION · PIXEL EDITION · Episode 57 · Blessed Are the Dead · Revelation 14:12–13
 *  2D pixel-art cut (480x200). The tonal turn to comfort. The patient endurance of the people of God who keep His commands and remain faithful to Jesus, walking steadily; then a voice from heaven: Write this, blessed are the dead who die in the Lord from now on. They will rest from their labour, and their deeds follow them. White light and a quiet, gentle ending. No faces.
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

  Aura.define(57, {
    pixel: true,
    duration: 50,
    cues: [
      { ref: '14:12', t0: 5.0, t1: 22.0 },
      { ref: '14:13', t0: 23.0, t1: 44.0 },
    ],
    titles: [],

    build(ctx) {
      return {
        render(t) {
          const U = px.cur(), wh = S(22, 36, t), dawn = S(0, 50, t);
          lib.skyGrad({ t, top: '#10142a', mid: '#4a4a78', bot: '#c8a090', cloud: 0.4, wind: 0.2, y1: 150 });
          for (let y = 0; y < 150; y++) for (let x = 0; x < W; x++) px.dpx(x, y, hex('#ffffff'), 0.0 + 0.75 * wh * Math.exp(-Math.pow((x - 240) / 260, 2) - Math.pow((y - 40) / 140, 2)));
          G(240, 40, 150 + 60 * wh, '#ffffff', 0.9 * S(18, 30, t));
          lib.land({ y0: 126, amp: 14, c1: '#2a3a3a', c2: '#101a1c', seed: 4, scroll: 0, k: 1 }); lib.land({ y0: 150, amp: 8, c1: '#3a4a40', c2: '#141e18', seed: 7, scroll: 30, k: 1 });
          for (let y = 150; y < H; y++) for (let x = 0; x < W; x++) px.set(x, y, px.ramp(hexes(['#10181a', '#2a3a34', '#5a6a58']), clamp(0.3 + (y - 150) * 0.004 + 0.4 * wh * 0.4, 0, 1), x, y));
          for (let i = 0; i < 16; i++) { const sp = 6 + (i % 4), p = ((t * sp * 0.02 + i * 0.07) % 1), x = lerp(-20, 500, p) , rest = S(26 + (i % 6), 36, t), y = 178 + (i % 3) * 5 - 20 * Math.sin(Math.min(1, p) * 3.14) * 0.0; lib.person({ x, y, h: 28, k: S(1 + i * 0.2, 4, t), col: '#1a1620' }); G(x + 4, y - 14, 10 + 10 * wh, '#ffe9a0', 0.45 + 0.4 * wh); if (t > 25) for (let q = 0; q < 10; q++) G(x - q * 5, y - 16 + q * 1.5, 4, '#ffd890', 0.5 * (1 - q / 10) * S(24 + (i % 6) * 0.4, 30, t)); }
          const wt = 'BLESSED', tw = px.textWidth(wt, 7, 1), tk = S(24, 30, t) * (1 - S(40, 44, t)); px.text(wt, Math.round(240 - tw / 2), 50, 7, (cc, r, X, Y) => mix(hex('#c8a060'), hex('#ffffff'), clamp(0.5 + 0.5 * Math.sin(t + X * 0.03), 0, 1)), tk * 0.95);
          for (let i = 0; i < 60; i++) { const q = (t * 0.05 + px.hash(i, 1, 2)) % 1; G(px.hash(i, 2, 2) * W, 190 - q * 190, 3, '#ffffff', 0.6 * wh * (1 - q)); }
          px.post({ vignette: 1.0 - 0.4 * wh, flash: 0, fade: Math.max(1 - S(0, 1.6, t), S(46, 50, t)), fadeCol: hex(wh > 0.5 ? '#ffffff' : '#000000') }); lib.titleCard(t, 'BLESSED', 57);
        },
      };
    },

    score(A, from) {
      const D2 = 73.42, D3 = 146.83, A3 = 220, D4 = 293.66, F4 = 349.23, Fs4 = 369.99, A4 = 440, D5 = 587.33, F5 = 698.46, Fs5 = 739.99, A5 = 880, D6 = 1174.66;
      A.drone(0, 50, D2, { gain: 0.06, attack: 3.0, release: 4.0 });
      A.choir(3, 24, [D3, A3, D4], { gain: 0.05, attack: 4.0, release: 3.0, vowel: 0.6 });
      for (let q = 6; q < 22; q += 2) A.bell(q, [D5, A4][Math.floor(q / 2) % 2], { gain: 0.03, dur: 4 });
      A.choir(22, 50, [D3, A3, D4, Fs4, A4, D5], { gain: 0.09, attack: 6.0, release: 5.0, vowel: 1.1 }); A.shimmer(22, A5, { dur: 26, gain: 0.06 }); A.bell(23.5, D6, { gain: 0.08, dur: 12 });
      A.brass(26, 46, D3, { gain: 0.04, attack: 6.0, release: 5.0, sweep: [[26, 500], [42, 1500]] });
    },
  });
})();
