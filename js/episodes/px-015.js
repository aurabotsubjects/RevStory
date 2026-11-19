/* ============================================================================
 *  REVELATION · PIXEL EDITION · Episode 15 · Behold, I Stand at the Door · Revelation 3:20–22
 *  2D pixel-art cut (480x200). Opens on the dark door that ended Episode 14. Two knocks; light under the door.
 *  A hand on the handle; the door opens onto light. A table is set for two: a person and a figure of light dine
 *  together. The room falls away: the two sit on one throne, and behind it a vast throne of light (the Father's).
 *  The voice ripples out and seven lamps light, one by one: to the churches. Part I ends in a hush; far above, a door
 *  stands open in the sky (Episode 16). No faces.
 *
 *  0:00  the door in the dark, title
 *  0:04  two knocks
 *  0:08  v20  the hand on the handle; the door opens; the table; the two who eat together
 *  0:18  v21  the throne: the two seated, and the Father's throne of light behind
 *  0:28  v22  "let him hear": the voice ripples out; seven lamps, one by one
 *  0:33  hush; a door stands open in the sky
 * ========================================================================== */
(function () {
  'use strict';
  const Aura = window.Aura, px = Aura.px, lib = Aura.pxlib;
  const { W, H, clamp, lerp, sstep, hex, hexes, mix } = px;
  const S = sstep;

  Aura.define(15, {
    pixel: true,
    duration: 48,
    cues: [
      { ref: '3:20', t0: 8.0, t1: 17.6 },
      { ref: '3:21', t0: 18.6, t1: 27.0 },
      { ref: '3:22', t0: 28.0, t1: 32.5 },
    ],
    titles: [],

    build(ctx) {
      const NAVY = hexes(['#04050e', '#080b1c', '#0e1432', '#1a2250', '#2c3470', '#4a508c', '#8890bc']);
      const SKIN = hexes(['#06040a', '#140c10', '#241618', '#3a2420', '#5a3a2c', '#8a5a3a']);
      const WOOD = hexes(['#0a0604', '#1c1008', '#34200e', '#52331a', '#7a4e26', '#a8743a']);
      const IRON = hexes(['#030305', '#0c0d14', '#1a1c28', '#2c3042', '#4a5068', '#7c84a0']);
      const knocks = [4.0, 5.4];

      function ring(cx, cy, r, ry, col, k) {
        if (k <= 0.01) return;
        const N = Math.max(60, Math.round(r * 5));
        for (let i = 0; i < N; i++) { const a = i / N * 6.2832; px.dpx(Math.round(cx + Math.cos(a) * r), Math.round(cy + Math.sin(a) * ry), col, k); }
      }

      /* ---- scene A: the door, from the room side ------------------------------------------------ */
      const open = (t) => S(13.2, 17.0, t);
      function doorScene(t) {
        const U = px.cur(), op = open(t), th = op * 1.38, HW = 50, hing = 290, wLeaf = 100 * Math.cos(th);
        let shake = 0, pulse = 0; for (const k of knocks) { const d = t - k; if (d > 0 && d < 0.5) { shake = Math.round(Math.sin(d * 90) * 1.2 * Math.exp(-d / 0.12)); pulse = Math.max(pulse, Math.exp(-d / 0.4)); } }
        const under = 0.35 + 0.25 * pulse + 0.4 * op;
        for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
          const dx = x - 240, inArch = Math.abs(dx) <= HW + 6 && (y >= 70 || Math.hypot(dx, y - 70) <= HW + 6);
          let col;
          const wv = 0.05 + 0.03 * px.hash(x >> 3, y >> 3, 4) + 0.1 * op * Math.exp(-dx * dx / 18000);
          col = px.ramp(lib.BRONZE, clamp(wv, 0, 1), x, y);
          if (y >= 190) col = px.ramp(lib.BRONZE, 0.04 + 0.12 * op * Math.exp(-dx * dx / 9000), x, y);
          if (inArch) {
            const inD = Math.abs(dx) <= HW && (y >= 70 || Math.hypot(dx, y - 70) <= HW), X = x - shake;
            if (!inD) col = px.ramp(lib.BRONZE, 0.22 + 0.2 * under, x, y);                                   /* the lit frame */
            else {
              /* behind the leaf: the light beyond */
              const light = px.ramp(lib.HONEY, clamp(0.78 + 0.2 * (1 - y / 190) + 0.04 * px.fbm(x * 0.08, y * 0.08 - t * 0.2, 2, 5), 0, 1), x, y);
              const lx = hing - X;                                                                          /* distance from the hinge side */
              const inLeaf = lx >= 0 && lx <= wLeaf + 0.001 && X <= hing;
              if (inLeaf && !(op > 0.02 && false)) {
                const f = lx / Math.max(1, wLeaf), plank = Math.floor((X + 400) / 7);
                let v = 0.2 + 0.07 * px.hash(plank, 1, 4) + (((X + 700) % 7) < 0.9 ? -0.06 : 0) + 0.3 * op * Math.exp(-(wLeaf - lx) / 3) - 0.03 * f;
                if ((y > 56 && y < 62) || (y > 128 && y < 134)) v -= 0.12;
                col = px.ramp(WOOD, clamp(v + (1 - op) * 0.04, 0, 1), X, y);
              } else col = op > 0.02 ? light : px.ramp(WOOD, 0.12, x, y);
            }
          }
          U[y * W + x] = col;
        }
        /* iron straps and studs */
        if (op < 0.35) for (const sy of [58, 131]) for (let x = 190 - 0; x <= 290; x += 10) { px.set(x - shake + 0, sy + 1, px.ramp(IRON, 0.5, x, sy)); px.set(x - shake + 1, sy + 1, px.ramp(IRON, 0.3, x, sy)); }
        /* light under the door and a thin edge of light all round */
        for (let x = 190; x <= 290; x++) for (let y = 184; y <= 190; y++) { const a = under * (1 - (y - 184) / 8); if (op < 0.9) px.dpx(x, y, hex(y > 186 ? '#ffd070' : '#ffb040'), a); }
        if (op < 0.5) lib.halo(240, 192, 90, hex('#ffc060'), 0.55 * under * (1 - op), 0.3);
        /* the ring handle on our side: it moves with the leaf's free edge */
        const hx = Math.round(hing - wLeaf + 14), hy = 120;
        if (wLeaf > 20) { px.disc(hx, hy, 5, px.ramp(IRON, 0.35, hx, hy)); px.ring(hx, hy + 2, 7, hex('#7c84a0')); px.ring(hx, hy + 2, 6, hex('#4a5068')); }
        /* the knocks: a ring of warm light spreading from the door, and a little dust */
        for (const k of knocks) { const u = (t - k) / 1.0; if (u > 0 && u < 1) { ring(240 - shake, 96, u * 64, u * 64, hex('#ffd890'), (1 - u) * 0.9); ring(240, 96, u * 40, u * 40, hex('#fff0c0'), (1 - u) * 0.5); } }
        return { hx, hy, wLeaf };
      }

      function hand(hx, hy, k, t) {
        if (k <= 0.01) return;
        const reach = S(0, 1, k), tipx = hx - 9 - (1 - reach) * 150;
        const pts = [];
        for (let u = 0; u <= 1; u += 0.02) pts.push([lerp(-12, tipx - 22, u) , lerp(hy + 46, hy + 8, u)]);
        const lit = (x, y) => clamp(0.42 + 0.4 * (x / 260) + 0.15 * Math.exp(-((x - tipx) * (x - tipx)) / 900), 0, 1);
        for (const [x, y] of pts) { const th = 8 + 5 * (x / 220); for (let dy = -th; dy <= th; dy++) { const X = Math.round(x), Y = Math.round(y + dy); px.set(X, Y, px.ramp(SKIN, clamp(lit(X, Y) - 0.18 * Math.abs(dy) / th + 0.1 * (dy < 0 ? 1 : 0), 0, 1), X, Y)); } }
        const cx = Math.round(tipx - 10), cy = hy + 4;
        for (let dy = -9; dy <= 9; dy++) for (let dx = -13; dx <= 13; dx++) if (dx * dx / 169 + dy * dy / 81 <= 1) px.set(cx + dx, cy + dy, px.ramp(SKIN, clamp(0.45 + 0.35 * (dx / 13 + 1) / 2 + 0.12 * (dy < 0 ? 1 : 0), 0, 1), cx + dx, cy + dy));
        for (let f = 0; f < 3; f++) for (let j = 0; j < 9; j++) { const X = cx + 12 + Math.round(j * 0.15), Y = cy - 6 + f * 5 + Math.round(j * 0.4); for (let q = 0; q < 3; q++) px.set(X + q - 2, Y, px.ramp(SKIN, 0.75 - 0.05 * f, X, Y)); }
        lib.halo(Math.round(tipx + 4), hy, 26, hex('#ffc070'), 0.25 * k, 1);
      }

      /* ---- scene B: a table set for two --------------------------------------------------------- */
      function tableScene(t) {
        const U = px.cur(), k = S(17.2, 19.0, t) * (1 - S(21.0, 22.2, t));
        for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
          const dx = (x - 240) / 240, dy = (y - 90) / 120;
          let v = 0.1 + 0.55 * Math.exp(-dx * dx * 1.6 - dy * dy * 1.2) + 0.03 * px.hash(x >> 2, y >> 2, 6);
          if (y > 170) v = 0.08 + 0.2 * Math.exp(-dx * dx * 2) * (0.5 + 0.5 * (190 - y) / 20);
          U[y * W + x] = px.ramp(lib.BRONZE, clamp(v, 0, 1), x, y);
        }
        lib.halo(240, 120, 150, hex('#ffd090'), 0.3, 0.8);
        lib.robed({ U, h: 46, x: 190, y: 148, a: 1, t, seed: 3, glow: 0 });
        lib.lightFig({ x: 292, y: 148, h: 50, a: 1, t, seed: 2, sway: 0.4, glow: 1 });
        /* the table */
        for (let y = 138; y < 190; y++) for (let x = 90; x <= 390; x++) {
          const top = y < 144, apron = y >= 144 && y < 158, leg = (x < 106 || x > 374 || (x > 238 && x < 244 && false)) && y >= 158;
          if (!(top || apron || leg)) continue;
          px.set(x, y, px.ramp(WOOD, clamp((top ? 0.65 : apron ? 0.32 : 0.2) + 0.08 * px.hash(x >> 2, y >> 3, 7) + 0.1 * Math.exp(-Math.pow((x - 240) / 120, 2)) * (top ? 1 : 0.5), 0, 1), x, y));
        }
        /* bread, cups, a candle */
        for (const bx of [196, 286]) for (let dy = -4; dy <= 3; dy++) for (let dx = -10; dx <= 10; dx++) if (dx * dx / 100 + dy * dy / 16 <= 1) px.set(bx + dx, 136 + dy, px.ramp(lib.BRONZE, clamp(0.55 + 0.25 * (-dy / 4) + 0.1 * Math.sin(dx), 0, 1), bx + dx, 136 + dy));
        for (const cx of [222, 258]) { for (let y = 128; y < 138; y++) for (let x = cx - 3; x <= cx + 3; x++) px.set(x, y, px.ramp(lib.BRONZE, 0.5 + 0.2 * (x - cx) / 3, x, y)); px.set(cx, 128, hex('#ffe9a0')); }
        for (let y = 128; y < 138; y++) for (let x = 238; x <= 242; x++) px.set(x, y, hex(x < 240 ? '#e8dcc0' : '#b0a488'));
        lib.flame({ x: 240, y: 122, k: 1, pop: 0, t, seed: 5, s: 1.1, glow: 1 });
        lib.halo(240, 128, 70, hex('#ffd890'), 0.35, 0.7);
        return k;
      }

      /* ---- scene C/D/E: the throne, the lamps, the door in the sky ------------------------------ */
      function sky(t, dim) {
        const U = px.cur();
        for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
          const dx = (x - 240) / 240, v = 0.06 + 0.2 * (y / 200) + dim * 0.5 * Math.exp(-dx * dx * 2.2 - Math.pow((y - 70) / 110, 2)) + 0.03 * px.fbm(x * 0.02, y * 0.04 + t * 0.03, 2, 8);
          U[y * W + x] = px.ramp(NAVY, clamp(v, 0, 1), x, y);
        }
        for (let i = 0; i < 160; i++) { const x = Math.floor(px.hash(i, 1, 51) * W), y = Math.floor(px.hash(i, 2, 51) * 130), tw = 0.5 + 0.5 * Math.sin(t * 1.5 + i); if (tw > 0.3) px.set(x, y, hex(i % 4 === 0 ? '#ffffff' : '#b8c0e8')); }
      }
      function throne(k, t, oyOff, scale) {
        if (k <= 0.01) return;
        const cx = 240, by = 150 + oyOff, a = k;
        const col = (v, x, y) => px.ramp(lib.HONEY, clamp(v, 0, 1), x, y);
        const rect = (x0, y0, x1, y1, f) => { for (let y = Math.round(y0); y <= Math.round(y1); y++) for (let x = Math.round(x0); x <= Math.round(x1); x++) if (a > px.thr(x, y)) px.set(x, y, col(f(x, y), x, y)); };
        /* the back, an arch */
        for (let y = by - 106; y <= by - 34; y++) for (let x = cx - 48; x <= cx + 48; x++) { const dx = x - cx; if (y < by - 58 && Math.hypot(dx, y - (by - 58)) > 48) continue; if (a <= px.thr(x, y)) continue; const e = 48 - Math.hypot(dx, Math.max(0, y - (by - 58)) * 0 + (y < by - 58 ? y - (by - 58) : 0)), inner = Math.abs(dx) < 38 && (y > by - 100 && (y >= by - 58 || Math.hypot(dx, y - (by - 58)) < 38)); px.set(x, y, col(inner ? 0.46 + 0.1 * Math.sin(t + x * 0.1) : 0.72 + 0.2 * (dx / 48) * -1, x, y)); }
        rect(cx - 58, by - 36, cx + 58, by - 26, (x) => 0.78 - 0.12 * Math.abs(x - cx) / 58);                 /* the seat */
        rect(cx - 62, by - 46, cx - 50, by - 26, () => 0.82); rect(cx + 50, by - 46, cx + 62, by - 26, () => 0.7);   /* the arms */
        rect(cx - 90, by - 26, cx + 90, by - 14, (x, y) => 0.6 + 0.2 * (1 - (y - (by - 26)) / 12) - 0.1 * Math.abs(x - cx) / 90);
        rect(cx - 112, by - 14, cx + 112, by, (x, y) => 0.5 + 0.2 * (1 - (y - (by - 14)) / 14) - 0.1 * Math.abs(x - cx) / 112);
        lib.halo(cx, by - 70, 90, hex('#ffe9b0'), 0.35 * k, 1.1);
      }
      function vastThrone(k, t) {
        if (k <= 0.01) return;
        lib.halo(240, 40, 170, hex('#fff6d8'), 0.9 * k, 0.75);
        lib.halo(240, 40, 90, hex('#ffffff'), 0.9 * k, 0.8);
        for (let i = 0; i < 16; i++) { const an = -Math.PI * (i / 15), ph = Math.sin(t * 0.5 + i * 1.3) * 0.4 + 0.6; for (let d = 30; d < 220 * k; d += 1) { const X = Math.round(240 + Math.cos(an) * d * 1.3), Y = Math.round(40 - Math.sin(an) * d * 0.9) + 40; px.dpx(X, Y, hex('#fff0c0'), 0.5 * ph * k * (1 - d / 230)); } }
      }
      function skyDoor(t, k) {
        if (k <= 0.01) return;
        const cx = 240, top = 38, base = 112, R = 24;
        for (let d = 0; d < 6; d++) lib.halo(cx, base - d * 10, 70 - d * 4, hex('#ffe9b0'), 0.18 * k, 1.2);
        for (let y = top; y <= base; y++) for (let x = cx - R - 3; x <= cx + R + 3; x++) {
          const dx = x - cx, inA = Math.abs(dx) <= R && (y >= top + R || Math.hypot(dx, y - (top + R)) <= R), inF = Math.abs(dx) <= R + 3 && (y >= top + R || Math.hypot(dx, y - (top + R)) <= R + 3);
          if (k <= px.thr(x, y)) continue;
          if (inA) px.set(x, y, px.ramp(lib.HONEY, clamp(0.8 + 0.2 * (y - top) / (base - top) + 0.04 * Math.sin(t + y * 0.2), 0, 1), x, y));
          else if (inF) px.set(x, y, px.ramp(lib.HONEY, 0.42, x, y));
        }
        for (const side of [-1, 1]) for (let y = top + R; y <= base; y++) for (let w = 0; w < 7; w++) { const x = cx + side * (R + 4 + w); if (k > px.thr(x, y)) px.set(x, y, px.ramp(lib.HONEY, 0.2 + 0.1 * (6 - w) / 6, x, y)); }
        lib.flare(cx, base - 4, 0.6 * k, 1);
      }

      return {
        render(t) {
          const U = px.cur();
          if (t < 17.6) {
            const o = doorScene(t);
            hand(o.hx, o.hy, S(10.4, 12.4, t) * (1 - S(14.5, 16, t)), t);
            px.post({ vignette: 1.0, flash: S(15.8, 17.4, t) * 0.95, flashCol: hex('#fff0c8') });
          } else if (t < 22.4) {
            tableScene(t);
            px.post({ vignette: 1.0, flash: (1 - S(17.4, 19.0, t)) * 0.9 + S(21.0, 22.3, t), flashCol: hex('#fff0c8') });
          } else {
            const fade = S(33, 38, t), dim = 1 - 0.75 * fade;
            sky(t, 0.4 + 0.6 * S(22.4, 26, t) * dim);
            const kk = S(22.5, 25, t) * (1 - S(33, 37, t)), vk = S(24.4, 26.8, t) * (1 - S(33, 37, t));
            vastThrone(vk, t);
            throne(kk, t, 0, 1);
            const sit = S(22.8, 25.5, t);
            lib.robed({ U, h: 42, x: 214, y: 124, a: kk * sit, t, seed: 3, glow: 0 });
            lib.lightFig({ x: 266, y: 124, h: 46, a: kk * sit, t, seed: 2, sway: 0.3, glow: 1 + 0.6 * vk });
            /* v22: the voice ripples out; the seven lamps, one by one */
            for (let r = 0; r < 3; r++) { const u = (t - 28.2 - r * 1.1) / 3.6; if (u > 0 && u < 1) ring(240, 100, u * 330, u * 110, hex('#ffe9a0'), (1 - u) * 0.85); }
            for (let i = 0; i < 7; i++) { const lk = S(28.8 + i * 0.5, 29.8 + i * 0.5, t) * (1 - S(34, 38, t)); if (lk > 0.01) lib.lampstand({ U, x: 54 + i * 62, y: 194, z: 0.9, lit: lk, pop: Math.exp(-Math.max(0, t - (28.8 + i * 0.5)) / 0.35) * (t > 28.8 + i * 0.5 ? 1 : 0), t, seed: 10 + i, lean: 0, a: 1 }); }
            /* hush: a door stands open in the sky */
            skyDoor(t, S(37, 43, t));
            lib.motes({ x0: 120, x1: 360, y0: 20, y1: 140, t, k: 0.4 * S(38, 44, t), n: 40, speed: 5, dir: -1 });
            px.post({ vignette: 1.0, flash: 1 - S(22.4, 24, t), flashCol: hex('#fff0c8') });
          }
          lib.titleCard(t, 'AT THE DOOR', 15);
        },
      };
    },

    score(A, from) {
      const D2 = 73.42, D3 = 146.83, A3 = 220, D4 = 293.66, Fs4 = 369.99, A4 = 440, D5 = 587.33, Fs5 = 739.99, A5 = 880, D6 = 1174.66, E4 = 329.63;
      /* continuity: the dark, and the hollow fifth */
      A.drone(0, 17, D2, { gain: 0.06, attack: 0.8, release: 2.5 });
      A.choir(0, 8, [D3, A3], { gain: 0.03, attack: 2.0, release: 2.0, vowel: 0.4 });
      /* two knocks */
      [4.0, 5.4].forEach((t) => { A.boom(t, { freq: 90, gain: 0.4, dur: 0.5 }); A.noise({ t0: t, t1: t + 0.2, gain: 0.12, filter: { type: 'lowpass', freq: 500, q: 1 }, wet: 0.3, attack: 0.002, release: 0.15 }); A.bell(t, A4, { gain: 0.04, dur: 3 }); });
      /* v20: the hand, the door opens, light */
      A.choir(8, 18, [D3, A3, D4, Fs4], { gain: 0.05, attack: 2.4, release: 2.0, vowel: 0.8 });
      A.noise({ t0: 12.4, t1: 15, gain: [[12.4, 0], [14, 0.05], [15, 0]], filter: { type: 'bandpass', freq: [[12.4, 500], [15, 1800]], q: 0.8 }, wet: 0.4, attack: 0.3, release: 0.6 });
      A.brass(13.2, 22, D3, { gain: 0.055, attack: 3.0, release: 1.5, sweep: [[13.2, 400], [19, 1700]] });
      A.shimmer(16.4, D6, { dur: 7, gain: 0.07 });
      /* the table: warm, close, quiet */
      A.choir(17.4, 28, [D3, A3, D4, Fs4, A4], { gain: 0.06, attack: 1.4, release: 2.2, vowel: 1.0 });
      [A5, Fs5, D5, Fs5].forEach((f, i) => A.bell(18.6 + i * 1.6, f, { gain: 0.045, dur: 5 }));
      /* v21: the throne: the Throne theme, wide and slow */
      A.shimmer(22.2, A5, { dur: 7, gain: 0.07 });
      A.choir(22.4, 36, [D3, A3, D4, Fs4, A4, D5, Fs5], { gain: 0.075, attack: 2.4, release: 2.6, vowel: 1.2 });
      A.brass(23, 33, D3, { gain: 0.05, attack: 3.0, release: 2.0, sweep: [[23, 500], [30, 1800]] });
      A.boom(24.6, { freq: 44, gain: 0.4, dur: 3 }); A.bell(24.6, D4, { gain: 0.14, dur: 9 }); A.bell(24.65, A5, { gain: 0.07, dur: 7 });
      /* v22: seven bells: the seven pulse */
      [D5, Fs5, A5, D6, A5, Fs5, D5].forEach((f, i) => A.bell(28.8 + i * 0.5, f, { gain: 0.08, dur: 6 }));
      /* hush */
      A.choir(34, 48, [D3, A3, D4], { gain: 0.04, attack: 3.0, release: 3.0, vowel: 0.7 });
      A.drone(34, 48, D2, { gain: 0.06, attack: 3.0, release: 3.0 });
      A.shimmer(38, D6, { dur: 9, gain: 0.05 });
      A.riser(40, 47.8, { f0: 300, f1: 2200, gain: 0.035 });
    },
  });
})();
