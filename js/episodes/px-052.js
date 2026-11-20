/* ============================================================================
 *  REVELATION · PIXEL EDITION · Episode 52 · The Beast from the Earth · Revelation 13:11–14
 *  2D pixel-art cut (480x200). Another beast rises from the land, with two horns like a lamb but a dragon voice, shown as a lamb-like form casting a dragon shadow. It calls fire down from heaven before an astonished crowd, and a giant image of the first beast is raised in a vast plaza, in a crane-up shot. No faces.
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

  Aura.define(52, {
    pixel: true,
    duration: 58,
    cues: [
      { ref: '13:11', t0: 5.0, t1: 18.0 },
      { ref: '13:12', t0: 19.0, t1: 30.0 },
      { ref: '13:13', t0: 31.0, t1: 44.0 },
      { ref: '13:14', t0: 45.0, t1: 54.0 },
    ],
    titles: [],

    build(ctx) {
      const cosmos = (t, a, y1) => { const U = px.cur(); for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const n = px.fbm(x * 0.012 + t * 0.004, y * 0.02, 3, 7); U[y * W + x] = px.ramp(hexes(['#02030a', '#080c20', '#10183a', '#1c2a58']), clamp(0.08 + n * a + 0.08 * (1 - y / H), 0, 1), x, y); } };
      const hydra = (x, y, s, k, t, n, o) => {
        o = o || {}; if (k <= 0.01) return; const c1 = o.c1 || '#8a1208', c2 = o.c2 || '#ff4a20', dark = o.dark || '#2a0604', out = [];
        G(x, y - 10 * s, 80 * s, c2, 0.3 * k);
        for (let q = -1; q <= 1; q += 2) for (let f = 0; f < 9; f++) { const a = -0.5 - f * 0.17 + Math.sin(t * 1.5 + f * 0.1) * 0.05, L = (62 - f * 3) * s; lib.line(Math.round(x + q * 16 * s), Math.round(y - 12 * s), Math.round(x + q * Math.cos(a) * L), Math.round(y - 12 * s + Math.sin(a) * L), px.ramp(hexes([dark, c1, c2]), 0.2 + f * 0.03, f, q), 3); }
        for (let i = 0; i < n; i++) {
          const m = i - (n - 1) / 2, bx = x + m * 8 * s, by = y - 14 * s, a = -1.57 + m * 0.3 + Math.sin(t * 1.2 + i * 1.3) * 0.12, L = (50 + (i % 3) * 10) * s; let lx = bx, ly = by;
          for (let j = 1; j <= 10; j++) { const u = j / 10, nx = bx + Math.cos(a) * L * u + Math.sin(u * 3.14 + i) * 9 * s * (i % 2 ? 1 : -1), ny = by + Math.sin(a) * L * u; lib.line(Math.round(lx), Math.round(ly), Math.round(nx), Math.round(ny), px.ramp(hexes([dark, c1, c2]), 0.35 + 0.3 * (1 - u), j, i), Math.max(2, Math.round((9 - 5 * u) * s))); lx = nx; ly = ny; }
          lib.line(Math.round(lx), Math.round(ly), Math.round(lx + Math.cos(a + 0.6 * m) * 13 * s), Math.round(ly + Math.sin(a + 0.6 * m) * 6 * s - 3 * s), hex(c1), Math.max(3, Math.round(5 * s)));
          lib.ell(lx, ly, 9 * s, 6 * s, (X, Y, dx, dy) => px.dpx(X, Y, mix(hex(dark), hex(c2), clamp(0.4 - dy * 0.4 + dx * 0.2, 0, 1)), k));
          for (const q of [-1, 1]) lib.line(Math.round(lx + q * 3 * s), Math.round(ly - 4 * s), Math.round(lx + q * 6 * s), Math.round(ly - 11 * s), hex('#e8d0a0'), 1);
          G(lx + 3 * s, ly - 1, 3 * s, '#ffe040', 0.9 * k); if (o.crowns !== false) G(lx, ly - 7 * s, 4 * s, '#ffd070', 0.8 * k); out.push([lx, ly]);
        }
        lib.ell(x, y, 50 * s, 24 * s, (X, Y, dx, dy) => px.dpx(X, Y, mix(hex(dark), hex(c1), clamp(0.5 - dy * 0.5 + dx * 0.1 + 0.08 * px.fbm(X * 0.1, Y * 0.1, 2, 3), 0, 1)), k));
        for (let i = 0; i < 5; i++) lib.line(Math.round(x + 38 * s + i * 7 * s), Math.round(y + 4 * s + i * 2), Math.round(x + 60 * s + i * 9 * s), Math.round(y + 14 * s + Math.sin(t + i) * 4 * s), hex(c1), Math.max(2, Math.round(5 * s - i)));
        return out;
      };
      return {
        render(t) {
          const U = px.cur();
          if (t < 31) {
            lib.skyGrad({ t, top: '#10101c', mid: '#3a2a30', bot: '#8a6a50', cloud: 0.3, wind: 0.2, y1: 140, dark: 0.3 }); lib.land({ y0: 140, amp: 8, c1: '#3a3024', c2: '#14100a', seed: 5, scroll: 0, k: 1 });
            const up = S(5, 14, t), ly = lerp(230, 170, up); hydra(300, 170, 1.8, 0.0, t, 7, {});
            for (let y = 100; y < H; y++) for (let x = 170; x < 450; x++) { const dx = (x - 300) / 140; if (Math.abs(dx) < 1 && y > 100) { /* long dragon shadow thrown behind */ } }
            hydra(380, 178, 1.5, 0.75 * up, t, 7, { c1: '#10040a', c2: '#2a0a10', dark: '#06020a', crowns: false });
            lib.lamb({ x: 210, y: ly, s: 3.2, k: up, t, glow: 0.9, horns: 1, eyes: 0.3 });
            const sp = S(19, 22, t) * (1 - S(29, 31, t)); for (let r = 0; r < 4; r++) { const a = ((t - 19) * 0.6 + r * 0.25) % 1; if (t > 19) for (let i = 0; i < 90; i++) { const an = i / 90 * 6.283; px.dpx(Math.round(236 + Math.cos(an) * a * 220), Math.round(150 + Math.sin(an) * a * 70), hex('#a02818'), 0.55 * (1 - a) * sp); } }
            G(222, 136, 6, '#ff2a18', 0.7 * S(8, 14, t));
            px.post({ vignette: 1.4, flash: 0, fade: Math.max(1 - S(0, 1.4, t), S(30, 31, t)), fadeCol: hex('#000000') }); lib.titleCard(t, 'THE SECOND BEAST', 52); return;
          }
          if (t < 45) {
            lib.skyGrad({ t, top: '#06060e', mid: '#2a1a28', bot: '#6a3a30', cloud: 0.5, wind: 0.3, y1: 150, dark: 0.5 }); lib.land({ y0: 150, amp: 5, c1: '#2a2018', c2: '#0c0806', seed: 6, scroll: 0, k: 1 });
            const fk = S(33, 38, t); for (let i = 0; i < 70; i++) { const ph = (t * 0.7 + px.hash(i, 5, 3)) % 1, y = -20 + ph * 190, x = px.hash(i, 4, 3) * W - ph * 30; G(x, y, 6 + 6 * ph, '#ff8a30', 0.7 * fk); lib.line(Math.round(x), Math.round(y), Math.round(x + 4), Math.round(y - 22 * fk), hex(i % 3 ? '#ffd070' : '#fff0c0'), 1); }
            G(240, 180, 200, '#ff8a30', 0.25 * fk);
            crowd(190, 36, 1, 4, 24, '#0a0608', 6, 474); for (let i = 0; i < 36; i++) { const x = 6 + 468 * (i + px.hash(i, 4, 3) * 0.7) / 36, up2 = S(32 + (i % 6) * 0.3, 36, t); lib.line(Math.round(x - 4), 176, Math.round(x - 6), Math.round(176 - 10 * up2), hex('#0a0608'), 1); lib.line(Math.round(x + 4), 176, Math.round(x + 6), Math.round(176 - 10 * up2), hex('#0a0608'), 1); }
            px.post({ vignette: 1.2, flash: 0, fade: Math.max(S(30, 31.4, t) < 1 && t < 31.5 ? 1 - S(30, 31.4, t) : 0, S(44, 45, t)), fadeCol: hex('#000000') }); return;
          }
          const cr = S(45, 54, t), oy = lerp(120, 0, cr * cr * (3 - 2 * cr));
          lib.skyGrad({ t, top: '#06060e', mid: '#2a1a28', bot: '#8a5a40', cloud: 0.3, wind: 0.2, y1: H });
          for (let y = Math.round(150 + oy); y < H; y++) for (let x = 0; x < W; x++) if (y >= 0) px.set(x, y, px.ramp(hexes(['#1a1410', '#3a2e24', '#6a5a46']), clamp(0.3 + (y - 150 - oy) * 0.004 + 0.06 * px.hash(x >> 3, y >> 3, 4), 0, 1), x, y));
          for (let b = 0; b < 16; b++) { const bx = b * 31, bh = 30 + 40 * px.hash(b, 1, 3); for (let y = Math.round(150 + oy - bh); y < Math.round(150 + oy); y++) for (let x = bx; x < bx + 27; x++) if (y >= 0 && y < H) px.set(x, y, hex(b % 2 ? '#1a1420' : '#241c2a')); }
          const rise = S(45, 52, t), sy = 150 + oy - 8; hydra(240, sy + 110 - 110 * rise + 30, 2.2, 1, t, 7, { c1: '#3a2a10', c2: '#c8a040', dark: '#140c04' });
          for (let q = -1; q <= 1; q += 2) for (let j = 0; j < 8; j++) { lib.line(Math.round(240 + q * 120), Math.round(sy + 20), Math.round(240 + q * 120), Math.round(sy - 130 * rise - j * 0), hex('#6a5030'), 2); lib.line(Math.round(240 + q * 120), Math.round(sy - 20 - j * 14), Math.round(240 + q * 60), Math.round(sy - 40 - j * 10 * rise), hex('#6a5030'), 1); }
          crowd(Math.round(190 + oy), 40, 1, 7, 14, '#0a0608', 0, 480);
          const ek = S(52.5, 54, t); for (const q of [-1, 1]) G(240 + q * 6, sy - 100 * rise, 10, '#ff2a18', 0.9 * ek);
          px.post({ vignette: 1.2, flash: 0, fade: Math.max(S(44, 45.4, t) < 1 && t < 45.5 ? 1 - S(44, 45.4, t) : 0, S(54, 58, t) * 0.0 + S(56, 58, t)), fadeCol: hex('#000000') });
        },
      };
    },

    score(A, from) {
      const D2 = 73.42, D3 = 146.83, A3 = 220, D4 = 293.66, F4 = 349.23, Fs4 = 369.99, A4 = 440, D5 = 587.33, F5 = 698.46, Fs5 = 739.99, A5 = 880, D6 = 1174.66;
      A.drone(0, 58, D2 * 0.75, { gain: 0.08, attack: 2.0, release: 3.0 });
      A.choir(4, 19, [D3, A3, D4], { gain: 0.05, attack: 3.0, release: 2.0, vowel: 0.8 }); A.noise({ t0: 6, t1: 31, gain: [[6, 0.0], [14, 0.1], [30, 0.12]], filter: { type: 'lowpass', freq: 400, q: 1.5 }, wet: 0.5, attack: 2, release: 2 });
      A.boom(19.5, { freq: 36, gain: 0.7, dur: 4 }); A.brass(19, 31, D3 / 2, { gain: 0.09, attack: 0.3, release: 2.0, sweep: [[19, 300], [28, 700]] });
      A.noise({ t0: 33, t1: 44, gain: [[33, 0.0], [37, 0.35], [44, 0]], filter: { type: 'bandpass', freq: 1600, q: 0.6 }, wet: 0.3, attack: 1, release: 2 }); A.riser(33, 38, { from: 100, to: 1400, gain: 0.14 });
      A.boom(38, { freq: 36, gain: 0.8, dur: 5 }); A.choir(33, 44, [D3, F4, Fs4], { gain: 0.05, attack: 2.0, release: 2.0, vowel: 0.4 });
      A.riser(45, 52.5, { from: 80, to: 900, gain: 0.14 }); A.brass(45, 58, D3, { gain: 0.08, attack: 3.0, release: 3.0, sweep: [[45, 400], [54, 1300]] }); A.boom(52.6, { freq: 32, gain: 0.8, dur: 6 });
    },
  });
})();
