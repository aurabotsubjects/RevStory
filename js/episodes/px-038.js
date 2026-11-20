/* ============================================================================
 *  REVELATION · PIXEL EDITION · Episode 38 · No More Delay · Revelation 10:5–7
 *  2D pixel-art cut (480x200). Hero low angle: the angel raises his right hand to heaven against a sun-bright sky and swears by Him who lives for ever and ever. A slow, solemn push-in on the raised hand. Creation in the clouds: heaven, earth, sea. A crescendo held to one note. No face.
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

  Aura.define(38, {
    pixel: true,
    duration: 54,
    cues: [
      { ref: '10:5', t0: 5.0, t1: 16.0 },
      { ref: '10:6', t0: 17.0, t1: 36.0 },
      { ref: '10:7', t0: 37.0, t1: 50.0 },
    ],
    titles: [],

    build(ctx) {
      const DISC = (cx, cy, r, kind, t, k) => { if (k <= 0.01) return; lib.ell(cx, cy, r, r, (X, Y, dx, dy) => { let c; if (kind === 0) c = mix(hex('#0a1030'), hex('#3a5aa0'), clamp(0.5 - dy * 0.5, 0, 1)); else if (kind === 1) { const n = px.fbm((X + 50) * 0.08, (Y + t * 0.0) * 0.08, 3, 5); c = n > 0.5 ? mix(hex('#2a6a30'), hex('#6aa850'), clamp(0.5 - dx * 0.3, 0, 1)) : mix(hex('#1a3a78'), hex('#3a6ac0'), clamp(0.5 - dx * 0.3, 0, 1)); } else c = mix(hex('#0a2a5a'), hex('#5aa0d8'), clamp(0.5 + 0.4 * Math.sin(X * 0.4 + Y * 0.9 + t) - dy * 0.3, 0, 1)); if (kind === 0 && px.hash(X, Y, 3) < 0.04) c = hex('#ffffff'); px.dpx(X, Y, c, k); }); G(cx, cy, r * 1.5, '#ffe9a0', 0.3 * k); };
      return {
        render(t) {
          const sc = 1 + 0.32 * S(5, 48, t), cx0 = 240, cy0 = 78;
          const U = px.cur(); for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const d = Math.hypot((x - cx0) / 300, (y - 20) / 180), v = clamp(0.95 - d * 0.75 + 0.05 * px.fbm(x * 0.02, y * 0.03, 2, 4), 0, 1); U[y * W + x] = px.ramp(hexes(['#3a6ac0', '#6a9ae0', '#a8c8f0', '#e8f0ff', '#fffbe8', '#ffffff']), v, x, y); }
          G(240, 14, 150, '#ffffff', 0.7); for (let i = 0; i < 14; i++) { const a = -1.2 + i * 0.18; for (let r = 30; r < 330; r += 4) px.dpx(Math.round(240 + Math.cos(a + 1.57) * r * 0.35 * 0), Math.round(0), hex('#ffffff'), 0); }
          for (let i = 0; i < 9; i++) { const bx = ((i * 97 - t * 3) % 560 + 560) % 560 - 40, by = 150 + (i % 3) * 14; lib.ell(bx, by, 60, 18, (X, Y, dx, dy) => px.dpx(X, Y, mix(hex('#9aa8c8'), hex('#ffffff'), clamp(0.5 - dy * 0.4, 0, 1)), 0.9)); }
          const dk = [[96, 62, 0, 18, 26], [240, 38, 1, 26, 34], [384, 62, 2, 36, 44]]; dk.forEach(([x, y, kind, t0, t1], i) => DISC(x, y, 22, kind, t, S(t0 - 1, t0 + 3, t) * (1 - S(t1 + 4, t1 + 8, t) * 0.3)));
          const ak = S(1, 4, t), armx = (y) => 296 + (200 - y) * 0.15 * sc, aw = (y) => lerp(70, 24, clamp((200 - y) / 150, 0, 1)) * sc;
          const gy = (yy) => cy0 + (yy - cy0) * sc, gx = (xx) => cx0 + (xx - cx0) * sc;
          for (let y = 0; y < H; y++) { const yw = cy0 + (y - cy0) / sc; if (yw < 90 || yw > 230) continue; const cxm = gx(armx(yw)) - (yw - 90) * 0, w2 = aw(Math.min(200, yw)); const top = Math.min(1, (yw - 90) / 20); for (let x = Math.round(cxm - w2); x <= Math.round(cxm + w2); x++) { const f = (x - cxm) / w2, v = clamp(0.35 - f * 0.4 + 0.08 * px.fbm(x * 0.1, y * 0.1, 2, 3), 0, 1); px.dpx(x, y, px.ramp(hexes(['#10162a', '#2a3050', '#6a7ab0', '#c8d4f0', '#ffffff']), v, x, y), ak * (0.2 + 0.8 * top)); } }
          const hx = gx(armx(96)) - 4, hy = gy(86), hs = sc;
          lib.ell(hx, hy, 15 * hs, 18 * hs, (X, Y, dx, dy) => px.dpx(X, Y, px.ramp(hexes(['#2a1a18', '#6a4a40', '#b88a70', '#f0c8a8']), clamp(0.45 - dx * 0.4 - dy * 0.1, 0, 1), X, Y), ak));
          for (let f = 0; f < 4; f++) { const a = -1.75 + f * 0.22, L = (34 + (f === 1 || f === 2 ? 7 : 0)) * hs; lib.line(Math.round(hx + (f - 1.5) * 8 * hs), Math.round(hy - 12 * hs), Math.round(hx + (f - 1.5) * 8 * hs + Math.cos(a) * L * 0.5), Math.round(hy - 12 * hs - L), hex('#d8a888'), Math.max(3, Math.round(4 * hs))); }
          lib.line(Math.round(hx - 14 * hs), Math.round(hy - 2 * hs), Math.round(hx - 30 * hs), Math.round(hy - 32 * hs), hex('#d8a888'), Math.round(4 * hs)); G(hx, hy - 20 * hs, 60 * hs, '#fff6d0', 0.35 * ak);
          px.post({ vignette: 0.8, flash: 0, fade: Math.max(1 - S(0, 1.4, t), S(52, 54, t)), fadeCol: hex('#ffffff') }); lib.titleCard(t, 'NO MORE DELAY', 38);
        },
      };
    },

    score(A, from) {
      const D2 = 73.42, D3 = 146.83, A3 = 220, D4 = 293.66, F4 = 349.23, Fs4 = 369.99, A4 = 440, D5 = 587.33, F5 = 698.46, Fs5 = 739.99, A5 = 880, D6 = 1174.66;
      A.drone(0, 54, D2, { gain: 0.07, attack: 2.0, release: 3.0 });
      A.choir(4, 54, [D3, A3, D4, Fs4, A4], { gain: 0.06, attack: 8.0, release: 4.0, vowel: 0.9 });
      A.brass(10, 50, D3, { gain: 0.07, attack: 8.0, release: 3.0, sweep: [[10, 400], [38, 1500]] });
      A.riser(20, 38, { from: 120, to: 1100, gain: 0.1 }); A.boom(37, { freq: 36, gain: 0.7, dur: 6 });
      A.shimmer(37, A5, { dur: 15, gain: 0.05 }); A.bell(37.2, D5, { gain: 0.07, dur: 12 });
    },
  });
})();
