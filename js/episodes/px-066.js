/* ============================================================================
 *  REVELATION · PIXEL EDITION · Episode 66 · It Is Done! · Revelation 16:17–21
 *  2D pixel-art cut (480x200). The seventh bowl poured into the air. A voice from the throne: It is done! Lightning, thunder and the greatest earthquake since mankind was on earth. The great city splits into three, the cities of the nations fall, Babylon remembered, every island flees and mountains cannot be found. Hundred-pound hailstones fall. The biggest sequence of the series, ending in a hard cut to black. No faces.
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

  Aura.define(66, {
    pixel: true,
    duration: 66,
    cues: [
      { ref: '16:17', t0: 4.0, t1: 14.0 },
      { ref: '16:18', t0: 15.0, t1: 30.0 },
      { ref: '16:19', t0: 31.0, t1: 46.0 },
      { ref: '16:21', t0: 47.0, t1: 62.0 },
    ],
    titles: [],

    build(ctx) {
      const angel = (x, y, s, k, t, seed, o) => { o = o || {}; lib.lightFig({ x, y, h: 44 * s, a: k, t, seed, sway: 0.3, glow: o.glow === undefined ? 1.2 : o.glow }); lib.wings({ x, y: y - 28 * s, s: 0.9 * s, k: k * 0.85, t: t * 1.5 + seed, spread: o.spread === undefined ? 0.7 : o.spread, eyes: 0, n: 2 }); };
      const bowl = (x, y, s, k, t, fill, col) => { if (k <= 0.01) return; x = Math.round(x); y = Math.round(y); lib.ell(x, y, 9 * s, 3 * s, (X, Y) => px.dpx(X, Y, hex('#e8b04a'), k)); for (let yy = 0; yy < 7 * s; yy++) { const u = yy / (7 * s), hw = lerp(9, 3, u) * s; for (let xx = Math.round(x - hw); xx <= Math.round(x + hw); xx++) px.dpx(xx, Math.round(y + yy), px.ramp(hexes(['#6a4a18', '#b8802a', '#ffd070']), clamp(0.6 - (xx - x) / hw * 0.4, 0, 1), xx, yy), k); } lib.ell(x, y, 8 * s, 2.4 * s, (X, Y) => px.dpx(X, Y, hex(col || '#ff4a30'), k * fill)); G(x, y, 14 * s, col || '#ff4a30', 0.4 * k * fill); };
      return {
        render(t) {
          const U = px.cur(), qk = S(14, 20, t) * (1 - S(58, 62, t));
          if (t < 14) {
            for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) U[y * W + x] = px.ramp(hexes(['#0a0a14', '#1a1a2c', '#2a2a40']), clamp(0.3 + px.fbm(x * 0.02, y * 0.03, 3, 2) * 0.5, 0, 1), x, y);
            const bk = S(2, 6, t); angel(240, 130, 1.4, bk, t, 3, { spread: 0.5 }); bowl(262, 96, 1.4, bk * (1 - S(8, 12, t)), t, 1 - S(8, 12, t), '#e8f0ff'); G(240, 90, 120, '#e8f0ff', 0.2 * S(8, 14, t));
            px.post({ vignette: 1.5, flash: 0, fade: Math.max(1 - S(0, 1.4, t), 0), fadeCol: hex('#000000') }); lib.titleCard(t, 'IT IS DONE', 66); return;
          }
          const lt = px.hash(Math.floor(t * 6), 1, 2) > 0.6 ? 1 : 0, sky = clamp(0.35 + lt * 0.5, 0, 1);
          lib.skyGrad({ t, top: '#10101c', mid: '#2a2a48', bot: '#5a5a78', cloud: 0.7, wind: 0.5, y1: 130, dark: 0.3 });
          tint(0, 130, '#ffffff', 0.5 * lt * qk);
          const split = S(30, 46, t) * 26, sink = S(30, 50, t);
          for (let mt = 0; mt < 5; mt++) { const mx = 60 + mt * 90, mh = 40 + px.hash(mt, 1, 3) * 40, drop = sink * (mh + 20); for (let x = mx - 40; x < mx + 40; x++) { const h = Math.round(mh * (1 - Math.abs(x - mx) / 40)), top = Math.round(130 - h + drop); for (let y = top; y < 140 + (drop > 0 ? 40 : 0) && y < 150; y++) px.dpx(x, y, px.ramp(hexes(['#1a1a24', '#3a3a50', '#5a5a70']), clamp(0.35 + (x - mx) * 0.004 + (y - top) * 0.004, 0, 1), x, y), 1); } }
          for (let y = 140; y < H; y++) for (let x = 0; x < W; x++) { const sea = y > 138 + 0, dx = Math.abs(x - 240), gap = dx < split * (1 + (y - 140) * 0.05) ? 1 : 0; U[y * W + x] = gap ? px.ramp(hexes(['#050308', '#2a0a08', '#7a2a10']), clamp(0.3 + (y - 140) * 0.01 + 0.2 * Math.sin(t * 8 + x), 0, 1), x, y) : px.ramp(sink > 0.3 ? hexes(['#0a1a30', '#1a3a60', '#3a6a90']) : hexes(['#1a1a20', '#3a3a30', '#5a5a48']), clamp(0.3 + px.fbm(x * 0.03, y * 0.1 + t * 0.2, 3, 4) * 0.5, 0, 1), x, y); }
          for (let b = 0; b < 18; b++) { const x0 = 240 + (b < 9 ? -1 : 1) * (40 + (b % 9) * 14 + split * 1.0 * (1 + (b % 3) * 0.2)), h = 20 + 30 * px.hash(b, 4, 3), cl = S(32 + (b % 9) * 1.2, 46, t), top = Math.round(160 - h + cl * h * 0.9), tilt = (b < 9 ? -1 : 1) * cl * 0.5; for (let y = top; y < 164; y++) for (let x = Math.round(x0 + tilt * (y - top)); x < Math.round(x0 + tilt * (y - top)) + 10; x++) px.dpx(x, y, px.ramp(hexes(['#0a0810', '#2a2038', '#5a4a68']), clamp(0.4 + (x - x0) * 0.04, 0, 1), x, y), 1 - cl * 0.4); }
          for (let c = 0; c < 6; c++) { const dd = S(32 + c, 42, t); G(120 + c * 48, 168, 20 * dd, '#ff6a30', 0.5 * dd); }
          for (let i = 0; i < 220; i++) { const sp = 50 + px.hash(i, 1, 5) * 90, ph = ((t - 47) * sp / 160 * 0.5 + px.hash(i, 2, 5)) % 1, X = px.hash(i, 3, 5) * W + ph * 20, Y = -10 + ph * 220, r = 2 + px.hash(i, 4, 5) * 3, hk = S(46, 50, t) * (1 - S(60, 61, t)); if (t > 47) lib.ell(X, Y, r, r, (a, b) => px.dpx(a, b, hex('#e8f4ff'), 0.9 * hk)); }
          if (t >= 47) for (let i = 0; i < 16; i++) { const x = px.hash(i, 8, 5) * W, y = ((t - 47) * (30 + i * 3) + i * 40) % 220; G(x, y, 6, '#c0e0ff', 0.4); }
          const fl = lt * 0.5 * qk + Math.exp(-Math.max(0, t - 15) * 3) * (t > 15 ? 0.6 : 0);
          shake(Math.sin(t * 43) * 5 * qk + Math.sin(t * 17) * 3 * qk, Math.cos(t * 37) * 4 * qk);
          px.post({ vignette: 1.3, flash: fl, flashCol: hex('#e8f0ff'), fade: Math.max(S(13.5, 14.6, t) < 1 && t < 14.6 ? 1 - S(13.5, 14.6, t) : 0, t >= 62 ? 1 : 0), fadeCol: hex('#000000') });
        },
      };
    },

    score(A, from) {
      const D2 = 73.42, D3 = 146.83, A3 = 220, D4 = 293.66, F4 = 349.23, Fs4 = 369.99, A4 = 440, D5 = 587.33, F5 = 698.46, Fs5 = 739.99, A5 = 880, D6 = 1174.66;
      A.drone(0, 14, D2, { gain: 0.03, attack: 2.0, release: 1.0 }); A.bell(7, D5, { gain: 0.04, dur: 6 });
      A.boom(14.5, { freq: 30, gain: 1.0, dur: 9 }); A.riser(10, 14.5, { from: 60, to: 800, gain: 0.14 });
      for (let q = 15; q < 62; q += 0.9) A.boom(q, { freq: 34 + (q % 3) * 6, gain: 0.3 + 0.2 * Math.sin(q), dur: 1.4 });
      A.noise({ t0: 14.5, t1: 62, gain: [[14.5, 0.3], [30, 0.5], [47, 0.7], [62, 0.0]], filter: { type: 'lowpass', freq: 1400, q: 0.8 }, wet: 0.3, attack: 1, release: 1 });
      A.brass(16, 62, D3 / 2, { gain: 0.1, attack: 3.0, release: 0.5, sweep: [[16, 300], [50, 1800]] }); A.choir(20, 62, [D3, F4, Fs4, A4, D5], { gain: 0.1, attack: 6.0, release: 0.5, vowel: 0.9 });
      A.boom(47, { freq: 28, gain: 1.0, dur: 6 }); A.riser(50, 62, { from: 100, to: 3000, gain: 0.16 });
    },
  });
})();
