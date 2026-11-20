/* ============================================================================
 *  REVELATION · PIXEL EDITION · Episode 64 · Bowls Four and Five · Revelation 16:8–11
 *  2D pixel-art cut (480x200). The fourth bowl lets the sun scorch people with fire; they curse God and refuse to repent. Overexposed whites, a scorched landscape and heat distortion. The fifth bowl plunges the throne of the beast into darkness: total black with only dull torches, tight and shaky. No faces.
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

  Aura.define(64, {
    pixel: true,
    duration: 56,
    cues: [
      { ref: '16:8', t0: 4.0, t1: 18.0 },
      { ref: '16:10', t0: 28.0, t1: 44.0 },
      { ref: '16:11', t0: 45.0, t1: 54.0 },
    ],
    titles: [],

    build(ctx) {
      const angel = (x, y, s, k, t, seed, o) => { o = o || {}; lib.lightFig({ x, y, h: 44 * s, a: k, t, seed, sway: 0.3, glow: o.glow === undefined ? 1.2 : o.glow }); lib.wings({ x, y: y - 28 * s, s: 0.9 * s, k: k * 0.85, t: t * 1.5 + seed, spread: o.spread === undefined ? 0.7 : o.spread, eyes: 0, n: 2 }); };
      const bowl = (x, y, s, k, t, fill, col) => { if (k <= 0.01) return; x = Math.round(x); y = Math.round(y); lib.ell(x, y, 9 * s, 3 * s, (X, Y) => px.dpx(X, Y, hex('#e8b04a'), k)); for (let yy = 0; yy < 7 * s; yy++) { const u = yy / (7 * s), hw = lerp(9, 3, u) * s; for (let xx = Math.round(x - hw); xx <= Math.round(x + hw); xx++) px.dpx(xx, Math.round(y + yy), px.ramp(hexes(['#6a4a18', '#b8802a', '#ffd070']), clamp(0.6 - (xx - x) / hw * 0.4, 0, 1), xx, yy), k); } lib.ell(x, y, 8 * s, 2.4 * s, (X, Y) => px.dpx(X, Y, hex(col || '#ff4a30'), k * fill)); G(x, y, 14 * s, col || '#ff4a30', 0.4 * k * fill); };
      return {
        render(t) {
          const U = px.cur();
          if (t < 26) {
            const hot = S(2, 14, t);
            for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const hz = Math.sin(y * 0.2 + t * 6) * 3 * hot, n = px.fbm((x + hz) * 0.02, y * 0.03, 3, 8), g = y > 130; U[y * W + x] = g ? px.ramp(hexes(['#6a4a28', '#b08a50', '#e8d0a0', '#ffffff']), clamp(0.3 + n * 0.5 + hot * 0.4, 0, 1), x, y) : px.ramp(hexes(['#c0c8d8', '#f0f0f0', '#ffffff']), clamp(0.4 + hot * 0.5 + (1 - y / 130) * 0.2, 0, 1), x, y); }
            G(240, 30, 200 * hot, '#ffffff', 1.0 * hot); lib.ell(240, 30, 28 + 10 * hot, 28 + 10 * hot, (X, Y) => px.dpx(X, Y, hex('#fffbe8'), 1)); for (let i = 0; i < 16; i++) { const a = i / 16 * 6.283 + t * 0.3; lib.line(240, 30, Math.round(240 + Math.cos(a) * 200), Math.round(30 + Math.sin(a) * 200), hex('#fff6c0'), 1); }
            for (let i = 0; i < 18; i++) { const x = 20 + i * 26, y = 168 + (i % 3) * 6; const bend = S(8 + (i % 5), 16, t); lib.person({ x, y: y + bend * 3, h: 22 - bend * 5, k: S(2, 5, t), col: '#3a2a20', kneel: bend > 0.5 }); }
            tint(0, H, '#ffffff', 0.4 * hot); shake(Math.sin(t * 40) * hot, 0);
            px.post({ vignette: 0.4, flash: 0, fade: Math.max(1 - S(0, 1.4, t), S(24, 26, t)), fadeCol: hex('#ffffff') }); lib.titleCard(t, 'THE FOURTH BOWL', 64); return;
          }
          for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) U[y * W + x] = hex('#030204');
          const tt = [[60, 90], [400, 70], [180, 160], [330, 150], [110, 40], [440, 160]], k = S(27, 32, t);
          for (let i = 0; i < tt.length; i++) { const fl = 0.7 + 0.3 * Math.sin(t * 9 + i * 2); G(tt[i][0], tt[i][1], 55 * fl, '#ff6a20', 0.45 * k); lib.ell(tt[i][0], tt[i][1], 2, 4, (X, Y) => px.dpx(X, Y, hex('#ffb040'), k)); }
          const th = S(28, 34, t); lib.ell(240, 120, 36, 56, (X, Y, dx, dy) => px.dpx(X, Y, hex('#0a0608'), 0.85 * th)); G(240, 70, 70, '#6a1a10', 0.25 * th); for (let i = 0; i < 12; i++) lib.person({ x: 90 + i * 28 + Math.sin(t * 8 + i) * 2, y: 186, h: 26, k: S(30, 36, t) * 0.8, col: '#0e0a0c' });
          shake(Math.sin(t * 27) * 2, Math.cos(t * 31) * 1.5);
          px.post({ vignette: 2.0, flash: 0, fade: Math.max(S(26, 27.4, t) < 1 && t < 27.5 ? 1 - S(26, 27.4, t) : 0, S(52, 56, t)), fadeCol: hex('#000000') });
        },
      };
    },

    score(A, from) {
      const D2 = 73.42, D3 = 146.83, A3 = 220, D4 = 293.66, F4 = 349.23, Fs4 = 369.99, A4 = 440, D5 = 587.33, F5 = 698.46, Fs5 = 739.99, A5 = 880, D6 = 1174.66;
      A.drone(0, 56, D2 * 0.75, { gain: 0.07, attack: 2.0, release: 3.0 });
      A.boom(4, { freq: 38, gain: 0.6, dur: 4 }); A.noise({ t0: 3, t1: 26, gain: [[3, 0.0], [14, 0.3], [26, 0.1]], filter: { type: 'highpass', freq: 2500, q: 0.6 }, wet: 0.2, attack: 2, release: 2 }); A.riser(6, 24, { from: 200, to: 2400, gain: 0.1 });
      A.boom(26.5, { freq: 30, gain: 0.8, dur: 6 }); A.noise({ t0: 27, t1: 54, gain: [[27, 0.12], [40, 0.06], [54, 0]], filter: { type: 'lowpass', freq: 400, q: 1 }, wet: 0.5, attack: 2, release: 3 });
      A.choir(28, 54, [D3, F4, Fs4], { gain: 0.05, attack: 4.0, release: 4.0, vowel: 0.3 }); for (let q = 30; q < 52; q += 2.2) A.boom(q, { freq: 38, gain: 0.25, dur: 2 });
    },
  });
})();
