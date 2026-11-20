/* ============================================================================
 *  REVELATION · PIXEL EDITION · Episode 49 · Wings of a Great Eagle · Revelation 12:13–17
 *  2D pixel-art cut (480x200). The woman is given the two wings of a great eagle and flies over a desert canyon, away from the serpent. The dragon spews a river after her; the earth opens its mouth and swallows the river. Enraged, the dragon stands on the shore of the sea, in silhouette, as the waves begin to churn. No faces.
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

  Aura.define(49, {
    pixel: true,
    duration: 60,
    cues: [
      { ref: '12:13', t0: 5.0, t1: 16.0 },
      { ref: '12:14', t0: 17.0, t1: 30.0 },
      { ref: '12:15', t0: 31.0, t1: 42.0 },
      { ref: '12:16', t0: 43.0, t1: 52.0 },
      { ref: '12:17', t0: 53.0, t1: 58.0 },
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
      const canyon = (t, sp, tone) => { lib.skyGrad({ t, top: '#3a5a98', mid: '#c89a78', bot: '#f0c890', cloud: 0.3, wind: 0.4, y1: H }); for (let L = 0; L < 3; L++) { const base = 90 + L * 30, sc = t * sp * (1 + L * 0.8); for (let x = 0; x < W; x++) { const hL = Math.round(base - 40 + 30 * px.fbm(x * 0.012 + sc * 0.01, L * 3, 3, 5)), hR = Math.round(200 - (base - 60) - 30 * px.fbm(x * 0.012 + sc * 0.01, L * 3 + 9, 3, 5)); for (let y = 0; y < hL; y++) px.set(x, y, px.ramp(hexes(['#2a1810', '#6a3a20', '#a86a3a', '#d8a068']), clamp(0.2 + L * 0.2 + y * 0.003 + 0.1 * px.hash(x, y, 4), 0, 1), x, y)); for (let y = Math.max(0, hR); y < H; y++) px.set(x, y, px.ramp(hexes(['#2a1810', '#6a3a20', '#a86a3a', '#d8a068']), clamp(0.15 + L * 0.2 + (y - hR) * 0.003 + 0.1 * px.hash(x, y, 4), 0, 1), x, y)); } } };
      const fly = (x, y, k, t) => { lib.lightFig({ x, y: y + 22, h: 36, a: k, t, seed: 2, sway: 0.2, glow: 1.0 }); for (let q = -1; q <= 1; q += 2) for (let f = 0; f < 18; f++) { const a = -0.3 + Math.sin(t * 5) * 0.55 - f * 0.03, L = (18 + f * 2.4) * 1.4; lib.line(Math.round(x), Math.round(y), Math.round(x + q * Math.cos(a) * L), Math.round(y + Math.sin(a) * L * 0.7), hex(f % 2 ? '#e8d8b0' : '#fff6d8'), 2); } G(x, y, 36, '#fff0c0', 0.3 * k); };
      return {
        render(t) {
          const U = px.cur();
          if (t < 31) {
            canyon(t, 30, 0);
            const wk = S(2, 6, t), wx = 150 + 20 * Math.sin(t * 0.9), wy = 100 + 12 * Math.sin(t * 1.3); fly(wx, wy, wk, t);
            if (t > 17) { const dk = S(17, 22, t); hydra(lerp(-60, 40, S(17, 30, t)), 140, 1.2, dk, t, 7, {}); for (let i = 0; i < 40; i++) { const q = (t * 1.5 + i / 40) % 1; G(70 + q * 140, 142 + Math.sin(q * 9 + i) * 3 - q * 30, 5, '#ff5a30', 0.4 * dk * (1 - q)); } }
            px.post({ vignette: 1.1, flash: 0, fade: Math.max(1 - S(0, 1.4, t), S(30, 31, t)), fadeCol: hex('#000000') }); lib.titleCard(t, 'GREAT EAGLE', 49); return;
          }
          if (t < 53) {
            canyon(t, 8, 0); const flood = S(31, 36, t), open = S(43, 47, t), drain = S(44, 52, t);
            fly(380, 70 + 6 * Math.sin(t), 1, t);
            hydra(60, 120, 1.0, 1, t, 7, {});
            for (let x = 70; x < 460; x++) { const u = (x - 70) / 390, wv = Math.sin(x * 0.08 - t * 6) * 3, yy = Math.round(155 + wv + u * 18), thick = 22 * flood * (1 - drain * u * 0.95), reach = x < 70 + 390 * Math.min(1, flood + 0.0) ; if (!reach) continue; for (let y = yy; y < yy + thick; y++) px.dpx(x, y, px.ramp(hexes(['#1a3a6a', '#3a6ab0', '#8ac0f0', '#e8f8ff']), clamp(0.4 + 0.3 * Math.sin(x * 0.2 - t * 8) - (y - yy) * 0.01, 0, 1), x, y), 0.95); }
            if (open > 0) { const cx = 300, cw = 60 * open; for (let y = 160; y < H; y++) for (let x = Math.round(cx - cw); x <= Math.round(cx + cw); x++) px.dpx(x, y, hex('#050204'), 0.97); G(cx, 170, 80 * open, '#ff8a30', 0.3 * open); for (let i = 0; i < 30; i++) { const q = ((t - 44) * 0.5 + i / 30) % 1; px.dpx(Math.round(cx - cw + (px.hash(i, 1, 3) * 2 * cw)), Math.round(160 + q * 40), hex('#8ac0f0'), 0.8 * (1 - q) * open); } }
            px.post({ vignette: 1.1, flash: 0, fade: Math.max(S(30, 31.4, t) < 1 && t < 31.5 ? 1 - S(30, 31.4, t) : 0, S(52, 53, t)), fadeCol: hex('#000000') }); shake(Math.sin(t * 45) * open * (1 - open) * 8, 0); return;
          }
          lib.skyGrad({ t, top: '#10122a', mid: '#4a2a50', bot: '#c86a40', cloud: 0.3, wind: 0.3, y1: 150 }); lib.sea({ t, y0: 150, cx: 240, glow: 0.4, ripple: 1 + S(53, 58, t) * 2, k: 1 });
          lib.land({ y0: 160, amp: 4, c1: '#1a1008', c2: '#0a0604', seed: 4, scroll: 0, k: 1 });
          const sk = S(53, 56, t), dr = hydra(110, 176, 1.8, 0, t, 7, {}); for (let y = 0; y < H; y++) { /* silhouette: the whole dragon in black */ }
          hydra(130, 176, 1.8, sk, t, 7, { c1: '#06020a', c2: '#14060c', dark: '#02010a', crowns: false });
          for (let i = 0; i < 4; i++) { const a = t - 53 - i * 0.5; if (a > 0 && a < 3) for (let q = 0; q < 100; q++) { const an = q / 100 * 6.283; px.dpx(Math.round(300 + Math.cos(an) * a * 120), Math.round(152 + Math.sin(an) * a * 14), hex('#ffd0b0'), 0.5 * (1 - a / 3)); } }
          px.post({ vignette: 1.4, flash: 0, fade: Math.max(S(52, 53.4, t) < 1 && t < 53.5 ? 1 - S(52, 53.4, t) : 0, S(57, 60, t)), fadeCol: hex('#000000') });
        },
      };
    },

    score(A, from) {
      const D2 = 73.42, D3 = 146.83, A3 = 220, D4 = 293.66, F4 = 349.23, Fs4 = 369.99, A4 = 440, D5 = 587.33, F5 = 698.46, Fs5 = 739.99, A5 = 880, D6 = 1174.66;
      A.drone(0, 60, D2, { gain: 0.06, attack: 2.0, release: 3.0 });
      A.choir(4, 31, [D3, A3, D4, Fs4], { gain: 0.07, attack: 3.0, release: 2.0, vowel: 1.0 }); A.shimmer(5, A5, { dur: 20, gain: 0.04 });
      A.brass(5, 31, D3, { gain: 0.07, attack: 1.0, release: 2.0, sweep: [[5, 700], [28, 1700]] });
      for (let q = 17; q < 31; q += 0.8) A.boom(q, { freq: 50, gain: 0.2, dur: 0.6 });
      A.noise({ t0: 31, t1: 43, gain: [[31, 0.0], [36, 0.3], [43, 0.2]], filter: { type: 'bandpass', freq: 1000, q: 0.6 }, wet: 0.3, attack: 1, release: 1 });
      A.boom(43.5, { freq: 32, gain: 1.0, dur: 7 }); A.noise({ t0: 43.5, t1: 52, gain: [[43.5, 0.5], [52, 0]], filter: { type: 'lowpass', freq: 700, q: 1 }, wet: 0.4, attack: 0.1, release: 3 });
      A.drone(53, 60, D2 * 0.75, { gain: 0.09, attack: 1.0, release: 3.0 }); A.choir(53, 60, [D3, F4], { gain: 0.05, attack: 2.0, release: 3.0, vowel: 0.3 });
    },
  });
})();
