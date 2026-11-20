/* ============================================================================
 *  REVELATION · PIXEL EDITION · Episode 22 · The Black Horse and the Pale Horse · Revelation 6:5–8
 *  2D pixel-art cut (480x200). A black horse with a rider holding scales; wheat prices; the oil and the wine are not to be touched. Then a pale horse in sickly green light, its rider named Death with Hades following close behind. A quarter of the earth darkens. An altar appears in the dim distance. No faces; stylised, non-graphic.
 * ========================================================================== */
(function () {
  'use strict';
  const Aura = window.Aura, px = Aura.px, lib = Aura.pxlib;
  const { W, H, clamp, lerp, sstep, hex, hexes, mix } = px;
  const S = sstep;
  const GOLDSKY = hexes(['#1a1008', '#3d2410', '#7a4a1a', '#b8802a', '#e8b04a', '#ffd987', '#fff3c8']);
  const ring = (cx, cy, r, ry, col, k) => { if (k <= 0.01) return; const N = Math.max(60, Math.round(r * 5)); for (let i = 0; i < N; i++) { const a = i / N * 6.2832; px.dpx(Math.round(cx + Math.cos(a) * r), Math.round(cy + Math.sin(a) * ry), col, k); } };
  const shake = (dx, dy) => { if (!dx && !dy) return; const U = px.cur(), C = U.slice(); for (let y = 0; y < H; y++) { const sy = clamp(y - dy, 0, H - 1); for (let x = 0; x < W; x++) U[y * W + x] = C[sy * W + clamp(x - dx, 0, W - 1)]; } };
  const bg = (t, glow, flash) => { const U = px.cur(); for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const dx = (x - 240) / 240, f = y / H; const v = 0.05 + 0.12 * f + glow * 0.34 * Math.exp(-dx * dx * 2.4 - Math.pow((y - 90) / 100, 2)) + 0.03 * px.fbm(x * 0.02, y * 0.04 + t * 0.03, 2, 8); U[y * W + x] = px.ramp(GOLDSKY, clamp(v + (flash || 0) * 0.4, 0, 1), x, y); } };

  Aura.define(22, {
    pixel: true,
    duration: 68,
    cues: [
      { ref: '6:5', t0: 5.0, t1: 18.2 },
      { ref: '6:6', t0: 19.5, t1: 33.5 },
      { ref: '6:7', t0: 34.5, t1: 41.0 },
      { ref: '6:8', t0: 42.0, t1: 61.2 },
    ],
    titles: [],

    build(ctx) {
      return {
        render(t) {
          const U = px.cur();
          if (t < 19.5) {
            lib.skyGrad({ t, top: '#2a2418', mid: '#6a5a3a', bot: '#a08a56', cloud: 0.5, wind: 0.03, y1: 150, cloudCol: '#c8b890' });
            lib.land({ y0: 136, amp: 6, c1: '#7a6a3a', c2: '#3a3018', seed: 4, scroll: t * 0.2, k: 1 });
            /* wheat */
            for (let i = 0; i < 260; i++) { const x = (i * 1.85) % W, y = 142 + px.hash(i, 1, 33) * 50, sw = Math.sin(t * 1.6 + i * 0.3) * 1.4; px.vline(Math.round(x + sw), Math.round(y - 7), Math.round(y), mix(hex('#c8a040'), hex('#6a5020'), (y - 142) / 50)); px.set(Math.round(x + sw), Math.round(y - 8), hex('#e8c860')); }
            lib.horse({ x: 150 + 60 * S(5, 14, t), y: 178, s: 2.1, k: S(0, 2, t), t, coat: 'black', rider: 'scales', glow: 0.6, speed: 0.8 });
            px.post({ vignette: 1.2, flash: 1 - S(0, 1.5, t), flashCol: hex('#e8d8a8') });
          } else if (t < 34.5) {
            const u = t - 19.5; px.cur().fill(hex('#1a1408'));
            lib.skyGrad({ t, top: '#100c06', mid: '#2c2210', bot: '#4a3a1a', cloud: 0.2, y1: 200 });
            /* large scales in slow motion, grain falling into the left pan */
            const cx = 240, by = 50, sw = Math.sin(t * 1.4) * 0.05 + 0.1 * S(0, 8, u);
            lib.halo(cx, by + 40, 120, hex('#e0b860'), 0.35, 1);
            lib.line(cx - 66, by - sw * 66, cx + 66, by + sw * 66, hex('#d8b860'), 2); lib.line(cx, by - 24, cx, by + 100, hex('#c8a850'), 2); lib.line(cx - 22, by + 100, cx + 22, by + 100, hex('#c8a850'), 3);
            for (const sd of [-1, 1]) { const ex = cx + sd * 66, ey = by + sd * sw * 66, py2 = ey + 52; lib.line(ex, ey, ex - 26, py2, hex('#a88a40'), 1); lib.line(ex, ey, ex + 26, py2, hex('#a88a40'), 1); for (let q = -28; q <= 28; q++) { const yy = py2 + Math.round((q * q) / 140); px.set(Math.round(ex + q), yy, hex('#e0c070')); px.set(Math.round(ex + q), yy + 1, hex('#8a6a28')); } }
            for (let i = 0; i < 90; i++) { const u2 = ((u * 0.22 + px.hash(i, 1, 6)) % 1), X = cx - 66 + Math.round((px.hash(i, 2, 6) - 0.5) * 22), Y = Math.round(10 + u2 * (by + 50 + 66 * -sw * -1 - 5)); if (Y < by + 150 - 100) px.dpx(X, Y, hex('#f0d070'), 0.9); }
            for (let i = 0; i < 160; i++) { const X = cx - 66 - 22 + Math.round(px.hash(i, 1, 8) * 44), Y = by + 50 + Math.round(66 * (-sw) * -1) * 0 + 50 - Math.round(Math.sqrt(px.hash(i, 2, 8)) * 6); px.set(X, Y + 6 - Math.round(sw * 60), hex(i % 2 ? '#f0d070' : '#c8a040')); }
            /* the oil and the wine, untouched, glowing at the right */
            for (const [jx, c] of [[392, '#e8c860'], [424, '#a82840']]) { lib.halo(jx, 150, 26, hex(c), 0.5, 1); for (let y = 126; y < 164; y++) for (let x = jx - 9; x <= jx + 9; x++) { const w2 = 9 - Math.abs(y - 150) * 0.12 - (y < 132 ? (132 - y) * 1.2 : 0); if (Math.abs(x - jx) <= w2) px.set(x, y, mix(hex(c), hex('#ffffff'), clamp(0.25 - (x - jx) / 30, 0, 0.5))); } }
            px.post({ vignette: 1.2 });
          } else if (t < 50) {
            const u = t - 34.5, fog = 0.3 + 0.2 * Math.sin(t);
            lib.skyGrad({ t, top: '#0a1a10', mid: '#2a4a30', bot: '#6a9a60', cloud: 0.7, wind: 0.04, y1: 160, cloudCol: '#b0d0a0' });
            lib.land({ y0: 142, amp: 5, c1: '#2a4a2a', c2: '#0c1a0c', seed: 11, scroll: t * 0.15, k: 1 });
            for (let i = 0; i < 60; i++) { const x = ((px.hash(i, 1, 7) * 560 + t * 14 * (0.4 + px.hash(i, 2, 7))) % 560) - 40, y = 150 + px.hash(i, 3, 7) * 40; lib.glyph ? 0 : 0; px.dpx(Math.round(x), Math.round(y), hex('#a0d0a0'), 0.25); }
            lib.horse({ x: 240 - 40 + 70 * S(0, 12, u), y: 176, s: 2.5, k: S(0, 2, u), t, coat: 'pale', rider: 'death', glow: 1, speed: 0.55 });
            /* Hades, following close behind: a low shadow that keeps pace */
            for (let i = 0; i < 70; i++) { const a = px.hash(i, 1, 3) * 6.28, r = 12 + px.hash(i, 2, 3) * 26, X = 240 + 70 * S(0, 12, u) - 100 + Math.cos(a) * r * 1.6, Y = 168 + Math.sin(a) * r * 0.5; px.dpx(Math.round(X), Math.round(Y), hex('#000000'), 0.55 * S(5, 9, u)); }
            px.post({ vignette: 1.3 });
          } else {
            const u = t - 50, dark = S(0, 8, u), a = 0;
            lib.space ? lib.space({ t, k: 1 }) : 0;
            px.cur().fill(hex('#04060c'));
            for (let i = 0; i < 120; i++) { const x = Math.floor(px.hash(i, 1, 51) * W), y = Math.floor(px.hash(i, 2, 51) * H); px.set(x, y, hex(i % 3 ? '#8890b0' : '#ffffff')); }
            const cx = 240, cy = 96, R = 66;
            lib.halo(cx, cy, 100, hex('#5a8ac0'), 0.3, 1);
            for (let y = cy - R; y <= cy + R; y++) for (let x = cx - R; x <= cx + R; x++) { const dx = (x - cx) / R, dy = (y - cy) / R; if (dx * dx + dy * dy > 1) continue; const land = px.fbm(x * 0.035 + 4, y * 0.035, 4, 3) > 0.52; let f = 0.35 + (land ? 0.18 : 0) - 0.3 * dx + 0.05 - 0.1 * dy; const col = land ? px.ramp(lib.EMER, clamp(f + 0.1, 0, 1), x, y) : px.ramp(lib.CRYS, clamp(f + 0.2, 0, 1), x, y); const q = dx > 0 && dy < 0 ? clamp(dark * 1.25 - px.hash(x >> 1, y >> 1, 3) * 0.25, 0, 1) : 0; px.set(x, y, mix(col, hex('#07030a'), q * 0.92)); }
            /* far off, a golden altar in the dim distance (handoff) */
            const ak = S(5, 11, u);
            if (ak > 0.01) { lib.altar2({ cx: 240, by: 190, w: 30, h: 16, k: ak, t, glow: 1.2, fire: 0.8 * ak }); }
            px.post({ vignette: 1.2 });
          }
          lib.titleCard(t, 'BLACK AND PALE', 22);
        },
      };
    },

    score(A, from) {
      const D2 = 73.42, D3 = 146.83, A3 = 220, D4 = 293.66, Fs4 = 369.99, A4 = 440, D5 = 587.33, Fs5 = 739.99, A5 = 880, D6 = 1174.66;
      A.drone(0, 68, D2, { gain: 0.06, attack: 1.0, release: 3.0 });
      for (let i = 0; i < 14; i++) A.boom(5.5 + i * 0.9, { freq: 66, gain: 0.07, dur: 0.5 });
      A.choir(5, 34, [D3, Fs4 / 2 * 2], { gain: 0.035, attack: 3.0, release: 2.0, vowel: 0.3 });
      A.bell(22, D5, { gain: 0.04, dur: 8 }); A.bell(28, A4, { gain: 0.04, dur: 8 });
      A.brass(34.5, 62, D3 * 0.94, { gain: 0.05, attack: 1.5, release: 2.5, sweep: [[34.5, 300], [55, 1200]] });
      A.noise({ t0: 34.5, t1: 62, gain: [[34.5, 0.04], [50, 0.07], [62, 0]], filter: { type: 'bandpass', freq: 500, q: 0.6 }, wet: 0.7, attack: 2, release: 3 });
      for (let i = 0; i < 18; i++) A.boom(36 + i * 0.7, { freq: 55, gain: 0.06, dur: 0.5 });
      A.boom(42.2, { freq: 40, gain: 0.5, dur: 4 });
      A.choir(50, 68, [D3, A3, D4], { gain: 0.04, attack: 4.0, release: 3.0, vowel: 0.5 });
      A.bell(62, A5, { gain: 0.05, dur: 6 });
    },
  });
})();
