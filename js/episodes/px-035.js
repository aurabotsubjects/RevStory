/* ============================================================================
 *  REVELATION · PIXEL EDITION · Episode 35 · Release the Four Angels · Revelation 9:13–16
 *  2D pixel-art cut (480x200). The sixth trumpet. A voice from the four horns of the golden altar. Four bound angels at the great river Euphrates; their chains fall in sparks. An ocean of riders on the far horizon, rendered as thousands of tiny silhouettes to say two hundred million. Heavy pulse. No faces.
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

  Aura.define(35, {
    pixel: true,
    duration: 62,
    cues: [
      { ref: '9:13', t0: 5.0, t1: 17.0 },
      { ref: '9:14', t0: 18.0, t1: 30.0 },
      { ref: '9:15', t0: 31.0, t1: 44.0 },
      { ref: '9:16', t0: 45.0, t1: 56.0 },
    ],
    titles: [],

    build(ctx) {
      const AX = [92, 186, 294, 388];
      const pulse = (t) => Math.pow(Math.max(0, Math.sin(t * 5.0)), 6);
      return {
        render(t) {
          if (t < 17.5) {
            const U = px.cur(); for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const v = 0.04 + 0.1 * (y / H) + 0.3 * Math.exp(-Math.pow((x - 240) / 150, 2) - Math.pow((y - 90) / 70, 2)); U[y * W + x] = px.ramp(hexes(['#0a0608', '#2a1408', '#6a3a10', '#c88a30', '#ffd070', '#fff3c8']), clamp(v, 0, 1), x, y); }
            const k = S(2, 5, t); lib.altar2({ cx: 240, by: 150, w: 120, h: 40, k, t, glow: 1.2, fire: 0.5 * k });
            for (let q = 0; q < 4; q++) { const hx = 188 + q * 34; lib.line(hx, 112, hx - 3 + (q % 3 === 0 ? -4 : q === 1 ? -1 : 1), 92, hex('#ffd070'), 3); G(hx, 90, 12 + 5 * S(5, 9, t) * pulse(t * 0.5), '#fff0b0', 0.8 * S(4, 8, t)); }
            G(240, 90, 120 + 60 * S(5, 12, t), '#ffe8a0', 0.25 * S(5, 12, t));
            for (let i = 0; i < 70; i++) { const q = (t * 0.1 + i / 70) % 1; px.dpx(Math.round(130 + px.hash(i, 1, 5) * 220), Math.round(190 - q * 190), hex('#fff0c0'), 0.7 * k * (1 - q)); }
            px.post({ vignette: 1.1, flash: 0, fade: Math.max(1 - S(0, 1.4, t), S(16.2, 17.5, t)), fadeCol: hex('#000000') });
            lib.titleCard(t, 'EUPHRATES', 35); return;
          }
          lib.skyGrad({ t, top: '#1a1028', mid: '#6a2a3a', bot: '#e8803a', cloud: 0.4, wind: 0.2, y1: 126, dark: 0.1 });
          G(330, 124, 80, '#ffb050', 0.5); lib.land({ y0: 124, amp: 3, c1: '#2a1410', c2: '#140808', seed: 2, scroll: 0, k: 1 });
          lib.sea({ t, y0: 128, cx: 330, glow: 0.55, ripple: 1, k: 1 }); tint(128, H, '#3a1a50', 0.18);
          const arrive = S(44, 48, t), mass = S(45, 52, t);
          if (mass > 0) { for (let i = 0; i < 3400; i++) { const row = Math.floor(i / 340), x = (px.hash(i, 1, 7) * 560 - 40 + t * 1.5 * (1 + row * 0.1)) % 520 - 20, y = 109 + row * 1.6 + px.hash(i, 2, 7) * 3; if (px.hash(i, 3, 7) < mass) { px.set(Math.round(x), Math.round(y), hex(row % 2 ? '#0a0608' : '#160c0c')); if (px.hash(i, 4, 7) < 0.3) px.set(Math.round(x), Math.round(y) - 1, hex('#0a0608')); } } for (let i = 0; i < 200; i++) { const x = (px.hash(i, 9, 7) * 500 + t * 6) % 500; px.dpx(Math.round(x), 110 - Math.floor(px.hash(i, 8, 7) * 5), hex('#ffa040'), 0.6 * mass); } }
          const ck = S(31, 36, t), fall = S(33, 40, t), fr = S(31, 33, t);
          for (let q = 0; q < 4; q++) {
            const x = AX[q], a = S(18 + q * 1.5, 22 + q * 1.5, t);
            G(x, 150, 50, '#ff3010', 0.3 * a * (1 + fr));
            lib.lightFig({ x, y: 184, h: 56, a, t, seed: q, sway: 0.1, glow: 0.4, dusk: 0.8 });
            lib.wings({ x, y: 160, s: 1.0, k: a * 0.7, t, spread: 0.2 + 0.7 * S(36, 42, t), eyes: 0, n: 2, glow: 0.4 });
            for (let c = 0; c < 6; c++) { const cy = 130 + c * 9 + fall * (c + 1) * 8, ok = 1 - S(36 + c * 0.3, 41, t) * 0.9; if (fall > 0.01 && cy > 200) continue; lib.line(Math.round(x - 24), cy, Math.round(x + 24), cy + (c % 2 ? 2 : -2), hex('#6a6a78'), 2); px.dpx(Math.round(x + (px.hash(c, q, 3) - 0.5) * 50), cy, hex('#ffd890'), a * fall * (1 - fall) * 3); }
            if (fall > 0.05 && fall < 1) for (let s = 0; s < 14; s++) px.dpx(Math.round(x + (px.hash(s, q, 9) - 0.5) * 70), Math.round(150 + s * 3 + fall * 40), hex('#ffc060'), 1 - fall);
          }
          G(330, 118, 130 * (0.5 + pulse(t)), '#ff4018', 0.35 * mass);
          px.post({ vignette: 1.2, flash: 0, fade: Math.max(S(16.2, 17.5, t) < 1 && t < 17.6 ? 1 - S(16.2, 17.5, t) : 0, S(60, 62, t)), fadeCol: hex('#000000') });
          const sh = pulse(t) * 1.6 * mass; shake(0, Math.sin(t * 60) * sh);
          if (t > 51 && t < 58) { const tt = '200,000,000'; const tw = px.textWidth(tt, 3, 1); px.text(tt, Math.round(240 - tw / 2), 36, 3, hex('#ffd890'), S(51, 53, t) * (1 - S(56, 58, t)) * 0.85); }
        },
      };
    },

    score(A, from) {
      const D2 = 73.42, D3 = 146.83, A3 = 220, D4 = 293.66, F4 = 349.23, Fs4 = 369.99, A4 = 440, D5 = 587.33, F5 = 698.46, Fs5 = 739.99, A5 = 880, D6 = 1174.66;
      A.drone(0, 62, D2, { gain: 0.07, attack: 2.0, release: 3.0 });
      A.choir(3, 17, [D3, A3, D4, Fs4], { gain: 0.06, attack: 3.0, release: 2.5, vowel: 0.8 }); A.bell(7, A5, { gain: 0.06, dur: 7 });
      A.brass(5.2, 17, D3, { gain: 0.1, attack: 0.05, release: 2.5, sweep: [[5.2, 1800], [9, 700]] }); A.boom(5.3, { freq: 44, gain: 0.6, dur: 3.5 });
      for (let q = 18; q < 56; q += 1.256) A.boom(q, { freq: 38, gain: 0.35, dur: 0.9 });
      A.choir(18, 62, [D3, F4, A3], { gain: 0.05, attack: 4.0, release: 3.0, vowel: 0.4 });
      A.noise({ t0: 33, t1: 41, gain: [[33, 0.0], [37, 0.3], [41, 0]], filter: { type: 'highpass', freq: 3000, q: 1 }, wet: 0.3, attack: 0.5, release: 1 });
      A.riser(44, 52, { from: 80, to: 800, gain: 0.14 }); A.brass(45, 56, D3, { gain: 0.1, attack: 0.5, release: 3.0, sweep: [[45, 400], [52, 1800]] }); A.shimmer(50, A5, { dur: 8, gain: 0.04 });
    },
  });
})();
