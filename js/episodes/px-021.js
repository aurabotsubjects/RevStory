/* ============================================================================
 *  REVELATION · PIXEL EDITION · Episode 21 · Come! The White Horse and the Red · Revelation 6:1–4
 *  2D pixel-art cut (480x200). Extreme close-up: the first seal cracks, light through the wax. A thunder-voice, "Come!" A white horse gallops through a bright plain, its rider with a bow and a crown. The second seal; a fiery red horse in a red sky, its rider with a great sword. The sky darkens (handoff). No faces.
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

  Aura.define(21, {
    pixel: true,
    duration: 60,
    cues: [
      { ref: '6:1', t0: 5.0, t1: 17.4 },
      { ref: '6:2', t0: 18.5, t1: 29.8 },
      { ref: '6:3', t0: 31.0, t1: 36.8 },
      { ref: '6:4', t0: 38.0, t1: 52.5 },
    ],
    titles: [],

    build(ctx) {
      const rip = (cx, cy, t0, t) => { const u = (t - t0) / 3.6; if (u > 0 && u < 1) ring(cx, cy, u * 300, u * 130, hex('#ffe9a0'), (1 - u) * 0.85); };
      function seal(t) {
        const U = px.cur(), crack = S(5.5, 12.2, t), sep = 22 * S(12.2, 15.5, t), fall = 60 * Math.pow(S(12.5, 17, t), 2);
        for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) U[y * W + x] = px.ramp(lib.HONEY, clamp(0.28 + 0.12 * px.fbm(x * 0.05, y * 0.12, 3, 5) + 0.05 * Math.sin(y * 0.9), 0, 1), x, y);
        const cx = 240, cy = 100, R = 48;
        lib.halo(cx, cy, 120 * (0.4 + crack), hex('#fff0c0'), 0.9 * crack, 1);
        for (const side of [-1, 1]) for (let y = cy - R; y <= cy + R + 30; y++) for (let x = cx - R - 4; x <= cx + R + 4; x++) {
          const dx = x - cx, dy = y - cy, off = Math.round(Math.sin(y * 0.35) * 3 * crack), inB = dx * dx + dy * dy <= R * R, rim = dx * dx + dy * dy > (R - 7) * (R - 7);
          if (!inB || (dx - off) * side < (side < 0 ? 1 : 0) * 0 - (crack > 0 ? 0 : 99) + 0 && false) continue;
          if ((dx - off) * side < 0) continue; const X = x + side * Math.round(sep), Y = y + Math.round(fall * (side * 0.3 + 0.7));
          const f = clamp(0.5 + 0.2 * (-dx - dy) / R * 0.7 + (rim ? 0.12 : -0.02) + 0.04 * px.hash(x >> 1, y >> 1, 7), 0, 1); px.set(X, Y, px.ramp(lib.REDH, f, X, Y));
        }
        /* the light in the crack */
        for (let y = cy - R; y <= cy - R + 2 * R * crack; y++) { const X = cx + Math.round(Math.sin(y * 0.35) * 3 * crack); px.dpx(X, y, hex('#ffffff'), 1); px.dpx(X + 1, y, hex('#ffe9a0'), 0.8); px.dpx(X - 1, y, hex('#ffe9a0'), 0.8); }
        /* shards flying */
        for (let i = 0; i < 28; i++) { const u = S(12.2, 16, t), a = px.hash(i, 1, 4) * 6.28, r = u * (30 + px.hash(i, 2, 4) * 120); if (u > 0 && u < 1) px.dpx(Math.round(cx + Math.cos(a) * r), Math.round(cy + Math.sin(a) * r * 0.8 + u * u * 40), hex('#ff6a40'), 1 - u); }
        rip(240, 100, 14.0, t); rip(240, 100, 15.4, t);
      }
      function plain(t, c, scroll, sky, k) { lib.skyGrad(Object.assign({ t, cloud: 0.5, wind: 0.05, y1: 150 }, sky)); lib.land({ y0: 130, amp: 14, c1: c[0], c2: c[1], seed: 2, scroll: scroll * 0.3, k }); lib.land({ y0: 148, amp: 8, c1: c[2], c2: c[3], seed: 7, scroll: scroll * 0.9, freq: 0.02, k }); }
      return {
        render(t) {
          const U = px.cur();
          if (t < 18) { seal(t); px.post({ vignette: 1.2, flash: Math.exp(-Math.max(0, t - 12.2) / 0.25) * (t > 12.2 ? 0.9 : 0), flashCol: hex('#fff6dc') }); }
          else if (t < 31) {
            const u = t - 18; plain(t, ['#6a8a50', '#3a5a30', '#4a7a3a', '#243e1e'], u * 1.4, { top: '#78b8f0', mid: '#b8d8f4', bot: '#fff0c8' }, 1);
            for (let i = 0; i < 24; i++) { const x = ((px.hash(i, 1, 9) * 520 - u * 160 * (0.5 + px.hash(i, 2, 9))) % 520 + 520) % 520 - 20, y = 150 + px.hash(i, 3, 9) * 40; px.hline(Math.round(x), Math.round(x + 8 + px.hash(i, 4, 9) * 10), Math.round(y), hex('#d8e8c8')); }
            lib.horse({ x: 180 + 40 * S(0, 3, u), y: 172, s: 2.2, k: 1, t, coat: 'white', rider: 'bow', glow: 1, speed: 1 });
            px.post({ vignette: 1.0, flash: 1 - S(0, 0.8, u), flashCol: hex('#fff6dc') });
          } else if (t < 53) {
            const u = t - 31, red = S(0, 2, u), dk = S(21, 22, u) * 0 + 0; plain(t, ['#5a1a10', '#2a0a08', '#4a1410', '#1c0604'], u * 1.8, { top: '#4a0a08', mid: '#a82a10', bot: '#ff8a30', cloudCol: '#ff9a50' }, 1);
            for (let i = 0; i < 40; i++) { const x = ((px.hash(i, 1, 19) * 520 - u * 60) % 520 + 520) % 520, y = 160 - ((px.hash(i, 2, 19) * 200 + u * 40 * (0.5 + px.hash(i, 3, 19))) % 160); px.dpx(Math.round(x), Math.round(y), hex('#ffb060'), 0.8); }
            const sw = S(41, 44, u);
            lib.horse({ x: 200 + 30 * S(0, 3, u), y: 174, s: 2.3, k: 1, t, coat: 'red', rider: 'sword', glow: 1, speed: 1.15, sword: sw });
            px.post({ vignette: 1.1, flash: Math.exp(-Math.max(0, u - 12) / 0.3) * (u > 12 ? 0.6 : 0) + (1 - S(0, 0.6, u)) * 0.9, flashCol: hex('#ffd0a0') });
          } else {
            const u = t - 53; plain(t, ['#2a0a08', '#100404', '#1c0604', '#080202'], 0, { top: '#04040c', mid: '#18060a', bot: '#400a08', dark: S(0, 5, u) * 0.85, cloud: 0.2 }, 1);
            lib.horse({ x: 230, y: 176, s: 2.3, k: 1 - S(1, 5, u), t, coat: 'red', rider: 'sword', glow: 0.5, speed: 0.4, sword: 0.2 });
            px.post({ vignette: 1.2, fade: S(3, 7, u) * 0.6, fadeCol: hex('#000000') });
          }
          lib.titleCard(t, 'COME!', 21);
        },
      };
    },

    score(A, from) {
      const D2 = 73.42, D3 = 146.83, A3 = 220, D4 = 293.66, Fs4 = 369.99, A4 = 440, D5 = 587.33, Fs5 = 739.99, A5 = 880, D6 = 1174.66;
      A.drone(0, 60, D2, { gain: 0.06, attack: 1.0, release: 3.0 });
      A.choir(0, 18, [D3, A3], { gain: 0.04, attack: 3.0, release: 2.0, vowel: 0.5 });
      [6.5, 9, 11, 12.1].forEach((t, i) => A.boom(t, { freq: 90 - i * 14, gain: 0.18 + i * 0.07, dur: 1.4 }));
      A.boom(12.2, { freq: 50, gain: 0.5, dur: 3.5 }); A.bell(12.3, D5, { gain: 0.08, dur: 6 });
      A.boom(14, { freq: 60, gain: 0.55, dur: 3 });
      for (let i = 0; i < 30; i++) A.boom(18.5 + i * 0.37, { freq: 70, gain: 0.07, dur: 0.4 });
      A.brass(18.5, 31, D3, { gain: 0.05, attack: 1.0, release: 2.0, sweep: [[18.5, 600], [28, 1800]] });
      A.choir(18.5, 31, [D3, A3, D4, Fs4], { gain: 0.06, attack: 2.0, release: 2.0, vowel: 1.0 });
      A.boom(31, { freq: 56, gain: 0.5, dur: 3 });
      for (let i = 0; i < 40; i++) A.boom(31.5 + i * 0.31, { freq: 62, gain: 0.08, dur: 0.35 });
      A.brass(31, 53, Fs4 / 2, { gain: 0.06, attack: 0.6, release: 2.0, sweep: [[31, 500], [45, 2000]] });
      A.noise({ t0: 43.8, t1: 46, gain: [[43.8, 0.15], [46, 0]], filter: { type: 'bandpass', freq: 4000, q: 1 }, wet: 0.3, attack: 0.02, release: 1.5 });
      A.choir(38, 56, [D3, A3, D4], { gain: 0.05, attack: 2.0, release: 3.0, vowel: 0.4 });
      A.drone(53, 60, D2, { gain: 0.07, attack: 2.0, release: 3.0 });
    },
  });
})();
