/* ============================================================================
 *  REVELATION · PIXEL EDITION · Episode 13 · Philadelphia: The Hour of Trial · Revelation 3:10–13
 *  2D pixel-art cut (480x200). Opens on the last frame of Episode 12 (the town under the open door).
 *  A dial in the sky reaches its hour; a dark front rolls over the whole world, and the town is kept under a
 *  dome of light. "I am coming quickly": streaks of light fall from the door, hands of shadow reach for the
 *  crown and cannot take it. The faithful one becomes a pillar in a temple; three names are written on it, and a
 *  city comes down out of heaven. A sound ripples out ("let him hear"). The light dims to a lukewarm haze.
 *
 *  0:00  title over the quiet town
 *  0:05  v10  the dial; the hour comes; the dark front; the town kept
 *  0:15  v11  coming quickly; the crown held fast
 *  0:21  (white-out into the temple)
 *  0:21  v12  the pillar; the name of God, the name of the city, the new name; the city descending
 *  0:39  v13  the ear: the Spirit's voice ripples out
 *  0:44  the light dims into lukewarm haze (Laodicea)
 * ========================================================================== */
(function () {
  'use strict';
  const Aura = window.Aura, px = Aura.px, lib = Aura.pxlib;
  const { W, H, clamp, lerp, sstep, hex, hexes, mix } = px;
  const S = sstep;

  Aura.define(13, {
    pixel: true,
    duration: 58,
    cues: [
      { ref: '3:10', t0: 5.0, t1: 14.5 },
      { ref: '3:11', t0: 15.3, t1: 20.5 },
      { ref: '3:12', t0: 21.3, t1: 38.5 },
      { ref: '3:13', t0: 39.3, t1: 44.0 },
    ],
    titles: [],

    build(ctx) {
      const TEMPLE = hexes(['#0e0810', '#201020', '#3c1c2c', '#6a3030', '#a85a38', '#e09a50', '#ffd890']);
      const WH = hexes(['#2a2838', '#4a4658', '#7a748c', '#aaa6bc', '#d4d0e0', '#f2f0fa']);
      const FIGX = -28, FIGH = 34;

      function ring(cx, cy, r, ry, col, k) {
        if (k <= 0.01) return;
        const N = Math.max(60, Math.round(r * 5));
        for (let i = 0; i < N; i++) { const a = i / N * 6.2832; px.dpx(Math.round(cx + Math.cos(a) * r), Math.round(cy + Math.sin(a) * ry), col, k); }
      }
      function reach(x0, y0, x1, y1, k, t) {
        if (k <= 0.01) return;
        for (let u = 0; u <= 1; u += 0.03) {
          const x = lerp(x0, x1, u) + Math.sin(u * 9 + t * 6) * 2.2 * u, y = lerp(y0, y1, u) + Math.cos(u * 7 + t * 5) * 1.6, r = 3.2 * (1 - u) + 1;
          for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) if (dx * dx + dy * dy <= r * r) px.dpx(Math.round(x) + dx, Math.round(y) + dy, hex('#07040a'), k);
        }
      }
      /* the dial of the hour */
      function dial(t) {
        const k = S(5.2, 6.4, t) * (1 - S(14.5, 16, t)); if (k <= 0.01) return;
        const cx = 404, cy = 40, r = 21, ang = lerp(-2.45, -Math.PI / 2, S(6.2, 11.4, t)), hit = t > 11.4 ? Math.exp(-(t - 11.4) / 0.6) : 0;
        lib.halo(cx, cy, 34, hex('#ffd890'), 0.4 * k + 0.4 * hit, 1);
        px.disc(cx, cy, r, px.mix(hex('#1a1020'), hex('#3a2418'), 0.5));
        for (let q = 0; q < 12; q++) { const a = q / 12 * 6.2832; for (let d = r - (q % 3 === 0 ? 5 : 3); d <= r - 1; d++) px.dpx(Math.round(cx + Math.cos(a) * d), Math.round(cy + Math.sin(a) * d), hex(q === 9 ? '#ffffff' : '#ffd070'), k); }
        px.ring(cx, cy, r, hex('#c8702a'));
        for (let d = 0; d < r - 5; d++) px.dpx(Math.round(cx + Math.cos(ang) * d), Math.round(cy + Math.sin(ang) * d), hex('#fff0c0'), k);
        px.disc(cx, cy, 1, hex('#ffffff'));
      }
      function newCity(cx, cy, s, k, t) {
        if (k <= 0.01) return;
        lib.halo(cx, cy, s * 1.3, hex('#fff0c0'), 0.6 * k, 1);
        for (let y = -s; y <= s; y++) for (let x = -s; x <= s; x++) {
          const e = Math.max(Math.abs(x), Math.abs(y)), X = cx + x, Y = cy + y;
          if (k <= px.thr(X, Y)) continue;
          if (e >= s - 1) px.set(X, Y, px.ramp(lib.HONEY, 0.7 + 0.3 * Math.sin(t * 2 + x * 0.2), X, Y));
          else { const g = ((x + s) % 6 < 1 || (y + s) % 6 < 1) ? 0.62 : 0.92 + 0.06 * Math.sin(t + x * 0.3 + y * 0.2); px.set(X, Y, px.ramp(lib.HONEY, g, X, Y)); }
        }
        for (let side = 0; side < 4; side++) for (let g = 0; g < 3; g++) { const o = (g - 1) * s * 0.55, gx = side < 2 ? o : (side === 2 ? -s : s), gy = side < 2 ? (side === 0 ? -s : s) : o; px.disc(Math.round(cx + gx), Math.round(cy + gy), 1, hex('#ffffff')); }
      }

      const camK = (t) => S(14.5, 21, t);
      function camAt(t) { const k = camK(t); return { z: lerp(1.0, 1.6, k), cx: lerp(10, -14, k), cy: lerp(20, 36, k) }; }

      function templeScene(t) {
        const U = px.cur(), f0 = S(20.2, 22.4, t), glow = 0.35 + 0.65 * S(22, 27, t);
        for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
          const dx = (x - 240) / 240, up = y / 170;
          let v = 0.12 + 0.3 * (1 - up) * 0.6 + glow * 0.5 * Math.exp(-(dx * dx) * 2.2 - Math.pow((y - 90) / 120, 2)) + 0.03 * px.fbm(x * 0.03, y * 0.05 + t * 0.05, 2, 4);
          if (y >= 170) { const tx = Math.floor((x - 240) / 24 * (1 + (y - 170) / 40)), ty = Math.floor((y - 170) / 6); v = 0.1 + 0.05 * ((tx + ty) & 1) + glow * 0.45 * Math.exp(-dx * dx * 3) * (0.6 + 0.4 * Math.exp(-(y - 170) / 18)); }
          U[y * W + x] = px.ramp(TEMPLE, clamp(v, 0, 1), x, y);
        }
        /* receding columns of the temple */
        [[118, 150, 17, 0], [172, 120, 11, 1], [205, 95, 7, 2]].forEach(([off, ht, w, i]) => [-1, 1].forEach((s) => {
          const xc = 240 + s * off * 1.55, top = 170 - ht * 1.1;
          for (let y = Math.round(top); y < 170; y++) for (let dx = -w; dx <= w; dx++) { const u = dx / w; px.set(xc + dx, y, px.ramp(TEMPLE, clamp(0.34 + 0.3 * (-s * u) + 0.1 * glow * (1 - Math.abs(xc - 240) / 240) + (((dx + 40) % 4) === 0 ? -0.05 : 0), 0, 1), xc + dx, y)); }
        }));
      }

      return {
        render(t) {
          const U = px.cur();
          if (t < 21.4) {
            const c = camAt(t);
            const storm = 0.22 * S(8, 11.4, t) + 0.78 * S(11.4, 14.5, t) * (1 - S(19.5, 21.4, t)), shield = S(11.4, 14.5, t);
            const quick = S(15.3, 16, t) * (1 - S(19, 20.5, t));
            const sc = lib.philadelphia({ t, z: c.z, cx: c.cx, cy: c.cy, lit: 1, door: 1, wind: 0.5 + 1.5 * storm, storm, shield, flash: 0.5 * (t > 11.4 ? Math.exp(-(t - 11.4) / 0.3) : 0) });
            const fx = sc.sX(FIGX), fy = Math.round(sc.sY(sc.groundY(FIGX) + 2)), fh = Math.round(FIGH * c.z);
            dial(t);
            /* v11: streaks of light falling fast from the door */
            if (quick > 0.01) for (let i = 0; i < 46; i++) {
              const bx = sc.doorX + (px.hash(i, 1, 33) - 0.5) * 120 * c.z, sp = 260 + 220 * px.hash(i, 2, 33), ph = ((t - 15.3) * sp + px.hash(i, 3, 33) * 300) % 300;
              for (let d = 0; d < 12; d++) px.dpx(Math.round(bx + (bx - sc.doorX) * ph / 600), Math.round(sc.doorY - 20 + ph - d), hex(d < 3 ? '#ffffff' : '#ffe0a0'), quick * (1 - d / 12));
            }
            lib.robed({ U, h: fh, x: fx, y: fy, a: 1, t, seed: 1, glow: 0, lean: -1 * quick });
            lib.flame({ x: fx + 9 * c.z, y: fy - 13 * c.z, k: 1, pop: 0, t, seed: 77, s: 0.55 * c.z, glow: 0.9 });
            /* the crown, and the hands of shadow that cannot take it */
            const ck = S(16.0, 17.4, t) * (1 - S(20.2, 21.2, t)), cy0 = fy - fh - 14 * c.z;
            lib.crown({ k: ck, z: 1.3 * c.z, x: fx, y: cy0, t, glow: 1 });
            for (let i = 0; i < 3; i++) { const side = i === 1 ? 1 : -1, tk = S(17.6 + i * 0.5, 18.3 + i * 0.5, t) * (1 - S(19.0 + i * 0.4, 19.8 + i * 0.4, t)); reach(fx + side * (42 + 10 * i) * c.z, cy0 + (i - 1) * 14 * c.z, fx + side * 14 * c.z, cy0, tk, t + i); }
            if (t > 19.0 && t < 20.6) { const u = (t - 19.0) / 1.6; ring(fx, cy0, u * 130, u * 80, hex('#fff0c0'), (1 - u) * 0.9); }
            if (t < 12.5 && t > 11.4) ring(sc.sX(24), sc.sY(4), (t - 11.4) * 120, (t - 11.4) * 80, hex('#fff0c0'), 1 - (t - 11.4) / 1.1);
            px.post({ vignette: 1.0, flash: S(19.8, 21.2, t) });
          } else {
            templeScene(t);
            const hall = 170;
            /* the faithful one stands, then the pillar rises through and becomes them */
            const pk = S(22.0, 27.2, t), figA = 1 - S(23.2, 25.5, t);
            lib.robed({ U, h: 40, x: 240, y: hall, a: figA, t, seed: 1, glow: 0 });
            lib.pillar({ x: 240, y: hall, h: 150, w: 15, k: pk, a: 1, glow: 1, t, marks: [S(24.5, 27.5, t), S(28.5, 31.5, t), S(32.5, 35.5, t)] });
            for (const [tt, c] of [[26.4, 0], [30.2, 1], [34.0, 2]]) { const u = (t - tt) / 1.4; if (u > 0 && u < 1) { const yy = hall - 150 * (0.3 + c * 0.17); ring(240, yy, u * 40, u * 14, hex('#fff0c0'), (1 - u) * 0.9); } }
            /* the city coming down out of heaven */
            const nk = S(27, 30, t), ny = lerp(-30, 34, S(28, 38, t)), ns = lerp(26, 22, S(28, 38, t));
            if (nk > 0.01) { for (let d = 0; d < 10; d++) lib.halo(360, Math.round(ny - 20 - d * 8), 14, hex('#ffe0a0'), 0.14 * nk, 1.6); newCity(360, Math.round(ny), Math.round(ns), nk, t); }
            lib.motes({ x0: 100, x1: 380, y0: 10, y1: 170, t, k: 0.5 * S(24, 30, t), n: 70, speed: 8, dir: -1 });
            /* v13: let him hear, the voice goes out */
            for (let r = 0; r < 3; r++) { const u = (t - 39.4 - r * 1.3) / 4.0; if (u > 0 && u < 1) ring(240, hall - 100, u * 330, u * 120, hex('#ffe9a0'), (1 - u) * 0.85); }
            /* the light dims into a lukewarm haze */
            const tp = S(44, 56, t);
            if (tp > 0.01) for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = y * W + x, cc = U[i], l = (0.3 * (cc & 255) + 0.59 * ((cc >> 8) & 255) + 0.11 * ((cc >> 16) & 255)) / 255; U[i] = mix(cc, px.ramp(lib.LUKE, clamp(l * 0.9 + 0.12 * tp, 0, 1), x, y), tp); }
            px.post({ vignette: 1.0 - 0.8 * S(44, 56, t), flash: 1 - S(21.4, 23.4, t) });
          }
          lib.titleCard(t, 'THE HOUR OF TRIAL', 13);
        },
      };
    },

    score(A, from) {
      const D2 = 73.42, D3 = 146.83, A3 = 220, D4 = 293.66, Fs4 = 369.99, A4 = 440, D5 = 587.33, Fs5 = 739.99, A5 = 880, D6 = 1174.66, E4 = 329.63, E5 = 659.25, G4 = 392;
      /* continuity: the warm D major of Episode 12 */
      A.drone(0, 58, D2, { gain: 0.09, attack: 0.6, release: 3 });
      A.choir(0, 12, [D3, A3, D4, Fs4, A4], { gain: 0.055, attack: 1.2, release: 2.0, vowel: 1.0 });
      /* v10: the hour approaches: a tick, then a great bell; the dark front; the town is kept */
      for (let i = 0; i < 10; i++) A.bell(6.2 + i * 0.52, 1500, { gain: 0.018, dur: 0.5 });
      A.drone(8, 15, D2 * 0.75, { gain: 0.06, attack: 3.0, release: 2.0 });
      A.noise({ t0: 8, t1: 16, gain: [[8, 0], [12, 0.07], [16, 0.02]], filter: { type: 'lowpass', freq: [[8, 300], [12, 900], [16, 500]], q: 0.7 }, wet: 0.5, attack: 0.5, release: 1.5 });
      A.boom(11.4, { freq: 42, gain: 0.6, dur: 3.4 }); A.bell(11.4, D4, { gain: 0.16, dur: 9 }); A.bell(11.42, A5, { gain: 0.07, dur: 6 });
      A.choir(11.6, 21, [D3, A3, D4, Fs4, A4, D5], { gain: 0.07, attack: 1.4, release: 2.0, vowel: 1.1 });
      /* v11: coming quickly */
      A.riser(15.2, 19.5, { f0: 250, f1: 2600, gain: 0.05 });
      A.brass(15.4, 21, D3, { gain: 0.06, attack: 1.6, release: 1.2, sweep: [[15.4, 600], [20, 2000]] });
      A.boom(19.0, { freq: 50, gain: 0.3, dur: 1.2 }); A.shimmer(19.0, A5, { dur: 3, gain: 0.06 });
      /* the white-out into the temple */
      A.shimmer(21.2, D6, { dur: 7, gain: 0.07 });
      /* v12: the pillar and three names */
      A.choir(21.5, 40, [D3, A3, D4, Fs4, A4, D5, Fs5], { gain: 0.07, attack: 2.2, release: 2.4, vowel: 1.2 });
      A.brass(22.5, 30, D3, { gain: 0.045, attack: 3.0, release: 1.6, sweep: [[22.5, 400], [28, 1500]] });
      [26.4, 30.2, 34.0].forEach((tt, i) => { A.bell(tt, [D5, Fs5, A5][i], { gain: 0.13, dur: 7 }); A.boom(tt, { freq: 58, gain: 0.22, dur: 1.2 }); });
      [D5, Fs5, A5, D6, A5].forEach((f, i) => A.bell(29 + i * 1.4, f, { gain: 0.04, dur: 4 }));
      /* v13: the ear: a calm ripple of bells */
      [A5, D5, Fs5].forEach((f, i) => A.bell(39.4 + i * 1.3, f, { gain: 0.07, dur: 6 }));
      /* the light dims: the chord loses its third and goes hollow */
      A.drone(44, 58, D2, { gain: 0.06, attack: 3.0, release: 3.0 });
      A.choir(44, 58, [D3, A3, E4], { gain: 0.04, attack: 3.0, release: 3.0, vowel: 0.4 });
    },
  });
})();
