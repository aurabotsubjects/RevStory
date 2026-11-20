/* ============================================================================
 *  REVELATION · PIXEL EDITION · Episode 34 · Abaddon · Revelation 9:7–12
 *  2D pixel-art cut (480x200). The locusts revealed piece by piece: gold crowns, human faces, long hair, lions teeth, iron breastplates, the roar of wings, scorpion tails; then the wide shot of the horde. A cracked black stone is carved with the name of their king, Abaddon, Apollyon. The first woe is past. No gore.
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

  Aura.define(34, {
    pixel: true,
    duration: 62,
    cues: [
      { ref: '9:7', t0: 5.0, t1: 14.0 },
      { ref: '9:8', t0: 14.0, t1: 21.0 },
      { ref: '9:9', t0: 21.0, t1: 31.0 },
      { ref: '9:10', t0: 31.0, t1: 38.0 },
      { ref: '9:11', t0: 48.0, t1: 56.0 },
      { ref: '9:12', t0: 57.0, t1: 61.0 },
    ],
    titles: [],

    build(ctx) {
      const SM = (t, a) => { const U = px.cur(); for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const n = px.fbm(x * 0.012 + t * 0.02, y * 0.02 - t * 0.04, 3, 41); U[y * W + x] = px.ramp(hexes(['#030204', '#0e0a0c', '#241a18', '#3c2a22']), clamp(0.12 + n * a, 0, 1), x, y); } };
      const panel = (i, t, u) => {
        if (i === 0) { SM(t, 0.45); for (let r = 0; r < 4; r++) for (let q = 0; q < 10; q++) { const x = 70 + q * 38 - r * 6 + Math.sin(t + q) * 2, y = 150 - r * 8; lib.horse({ x, y, s: 0.55 - r * 0.05, k: 0.9, coat: 'black', speed: 0.3, t: t + q, glow: 0 }); } }
        else if (i === 1) { SM(t, 0.4); G(240, 100, 130, '#ffb040', 0.35); for (let q = -1; q <= 1; q++) lib.crown({ x: 240 + q * 120, y: 105 + Math.abs(q) * 10, z: 3.6 - Math.abs(q), k: u > 0.05 ? 1 : 0, t, glow: 1 }); }
        else if (i === 2) { SM(t, 0.3); G(240, 100, 150, '#d09060', 0.25); lib.ell(240, 100, 44, 56, (X, Y, dx, dy) => px.set(X, Y, mix(hex('#4a2a20'), hex('#d09870'), clamp(0.5 - dx * 0.4 - dy * 0.15 + 0.04 * px.hash(X, Y, 2), 0, 1)))); for (const q of [-1, 1]) lib.ell(240 + q * 17, 88, 8, 4, (X, Y) => px.set(X, Y, hex('#0a0408'))); lib.line(224, 126, 256, 126, hex('#2a0c10'), 2); lib.line(240, 96, 240, 114, hex('#8a5a40'), 1); }
        else if (i === 3) { SM(t, 0.3); for (let s = 0; s < 70; s++) { const u2 = s / 70, x = 150 + u2 * 180 + Math.sin(u2 * 9 + t * 0.8) * 10, y0 = -10 + u2 * 6; lib.line(Math.round(x), 0, Math.round(x + Math.sin(u2 * 5 + t) * 30), 210, hex(px.hash(s, 1, 2) < 0.5 ? '#2a1814' : '#8a5a30'), 2); } }
        else if (i === 4) { SM(t, 0.25); G(240, 108, 120, '#ffb860', 0.3); for (let q = 0; q < 9; q++) { const x = 90 + q * 38, up = q % 2 ? -1 : 1; for (let j = -1; j <= 1; j += 2) { const th = 20 + 6 * Math.sin(t * 5 + q); lib.line(x, 100 + up * 4, x + j * 8, 100 + up * 4 + th * 0.9 * up, hex('#f2eadc'), 3); } lib.line(x - 9, 100, x + 9, 100, hex('#0a0408'), 1); } lib.ell(240, 100, 130, 8, (X, Y) => px.dpx(X, Y, hex('#0a0408'), 0.55)); for (let q = -4; q <= 4; q++) lib.line(240 + q * 22, 95, 240 + q * 22 + 5, 120 + Math.abs(q) * 0.5, hex('#e8e0d0'), 2); }
        else if (i === 5) { SM(t, 0.25); for (let r = 0; r < 12; r++) for (let q = 0; q < 28; q++) { const x = 20 + q * 17 + (r % 2) * 8, y = 30 + r * 14; lib.ell(x, y, 9, 8, (X, Y, dx, dy) => px.set(X, Y, mix(hex('#1c1e26'), hex('#9aa0b0'), clamp(0.35 - dy * 0.35 + dx * 0.15 + 0.15 * Math.sin(t * 3 + q), 0, 1)))); } G(240, 100, 80, '#d8e0ff', 0.2); }
        else if (i === 6) { SM(t, 0.25); for (let q = -1; q <= 1; q += 2) for (let f = 0; f < 12; f++) { const wob = Math.sin(t * 90 + f * 1.4) * 5; lib.line(240, 100, Math.round(240 + q * (60 + f * 14)), Math.round(100 - 40 + f * 7 + wob), hex('#c8c0a0'), 1); } for (let i2 = 0; i2 < 8; i2++) { const rr = ((t * 70 + i2 * 40) % 320); for (let a = 0; a < 90; a++) px.dpx(Math.round(240 + Math.cos(a / 90 * 6.283) * rr), Math.round(100 + Math.sin(a / 90 * 6.283) * rr * 0.4), hex('#a89870'), 0.3 * (1 - rr / 320)); } }
        else if (i === 7) { SM(t, 0.3); for (let q = 0; q < 5; q++) { const bx = 80 + q * 80, by = 70 + (q % 2) * 20; let px0 = bx, py0 = by; for (let s = 1; s <= 26; s++) { const a = s / 26, x = bx + s * 4.5, y = by + 90 - Math.sin(a * 2.4) * 80; lib.line(Math.round(px0), Math.round(py0), Math.round(x), Math.round(y), hex('#8a5a34'), 3); px0 = x; py0 = y; } G(px0, py0, 12, '#ffa040', 0.7); lib.line(Math.round(px0), Math.round(py0), Math.round(px0 + 4), Math.round(py0 - 6), hex('#a06a30'), 1); } }
      };
      const SEQ = [[5, 8, 1], [8, 14, 1], [14, 21, 2], [21, 26, 3], [26, 31, 4], [31, 35, 5], [35, 38.5, 6], [38.5, 48, 7]];
      return {
        render(t) {
          if (t < 48) {
            let idx = 0; if (t < 5) idx = 0; else for (const [a, b, p] of SEQ) if (t >= a && t < b) idx = p;
            const seg = t < 5 ? [0, 5] : SEQ.find((s) => t >= s[0] && t < s[1]) || [38.5, 48];
            panel(idx, t, clamp((t - seg[0]) / 1.0, 0, 1)); const u = (t - seg[0]) / Math.max(1, seg[1] - seg[0]);
            lib.titleCard(t, 'ABADDON', 34);
            px.post({ vignette: 1.7, flash: 0, fade: Math.max(1 - S(0, 1.2, t), 0, 0), fadeCol: hex('#000000') });
            if (t > 38.5 && t < 48) { const hz = S(38.5, 41, t) * (1 - S(46.5, 48, t)); tint(0, H, '#000000', 0.0); }
            return;
          }
          const cr = S(48, 52, t), ap = S(53, 56, t), X0 = 240, Y0 = 100;
          const U = px.cur(); for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) U[y * W + x] = hex('#030204');
          G(240, 100, 190, '#6a0e08', 0.3 * cr);
          const sw = 150, sh = 70; for (let y = Y0 - sh; y <= Y0 + sh; y++) for (let x = X0 - sw; x <= X0 + sw; x++) { const e = Math.pow((x - X0) / sw, 4) + Math.pow((y - Y0) / sh, 4); if (e > 1) continue; const n = px.fbm(x * 0.07, y * 0.07, 3, 5); px.set(x, y, mix(hex('#0a080c'), hex('#2a2630'), clamp(n * 0.9 + 0.1 * (1 - e) - (y - Y0) * 0.002, 0, 1))); }
          for (let q = 0; q < 3; q++) { let x = 230 + q * 18, y = Y0 - sh + 2; for (let s = 0; s < 18; s++) { const nx = x + (px.hash(s, q, 9) - 0.5) * 18, ny = y + 8; lib.line(Math.round(x), Math.round(y), Math.round(nx), Math.round(ny), hex('#020104'), 1); G(nx, ny, 5, '#ff4a10', 0.35 * cr * S(50, 54, t)); x = nx; y = ny; } }
          const w1 = px.textWidth('ABADDON', 5, 1); px.text('ABADDON', Math.round(240 - w1 / 2), 78, 5, (cc, r, X, Y) => mix(hex('#8a2008'), hex('#ffb060'), clamp(0.5 + 0.5 * Math.sin(t * 2 + X * 0.05), 0, 1)), cr);
          const w2 = px.textWidth('APOLLYON', 3, 1); px.text('APOLLYON', Math.round(240 - w2 / 2), 120, 3, hex('#d08850'), ap * 0.9);
          px.post({ vignette: 1.4, flash: 0, fade: Math.max(S(47, 48.4, t) < 1 && t < 48.5 ? 1 - S(47, 48.4, t) : 0, S(60, 62, t)), fadeCol: hex('#000000') });
        },
      };
    },

    score(A, from) {
      const D2 = 73.42, D3 = 146.83, A3 = 220, D4 = 293.66, F4 = 349.23, Fs4 = 369.99, A4 = 440, D5 = 587.33, F5 = 698.46, Fs5 = 739.99, A5 = 880, D6 = 1174.66;
      A.drone(0, 62, D2, { gain: 0.07, attack: 2.0, release: 3.0 });
      A.noise({ t0: 0, t1: 48, gain: [[0, 0.1], [5, 0.18], [37, 0.3], [48, 0.05]], filter: { type: 'bandpass', freq: 3000, q: 1.8 }, wet: 0.2, attack: 1, release: 2 });
      [5, 8, 14, 21, 26, 31, 35, 38.5].forEach((q, i) => A.boom(q + 0.1, { freq: 56 - i * 2, gain: 0.35, dur: 2 }));
      A.choir(8, 38, [D3, F4, A3], { gain: 0.04, attack: 3.0, release: 3.0, vowel: 0.4 });
      A.riser(38.5, 48, { from: 100, to: 800, gain: 0.12 }); A.boom(48.2, { freq: 34, gain: 0.8, dur: 6 });
      A.choir(48.5, 62, [D3, F4, A3, D4], { gain: 0.08, attack: 1.5, release: 3.0, vowel: 0.8 }); A.bell(52, D5, { gain: 0.07, dur: 8 }); A.bell(57.2, D5, { gain: 0.06, dur: 6 });
    },
  });
})();
