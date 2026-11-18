/* ============================================================================
 *  REVELATION · PIXEL EDITION · Episode 7 · Smyrna: Faithful Until Death · Revelation 2:8–11
 *  2D pixel-art cut (480x200). Cold blue palette, narrow street, rain, one lamp in a window. No faces.
 *
 *  0:00  Episode 6's last smoke drifts over the dark sea toward Smyrna; rain begins
 *  0:05  v8 the First and the Last, who was dead and has come to life: the lamp goes out, and is lit again
 *  0:14  v9 oppression and poverty, yet the window overflows with gold (you are rich); slander as dark whispers broken on the light
 *  0:28  v10 do not be afraid: bars fall; ten small lights, one for each day; faithful to death: the crown of life
 *  0:48  v11 he who has an ear; the second death comes as a dark ring and cannot harm the lamp
 *  0:58  the rain clears into stark mountain light (handoff to Pergamum)
 * ========================================================================== */
(function () {
  'use strict';
  const Aura = window.Aura, px = Aura.px, lib = Aura.pxlib;
  const { W, H, clamp, lerp, sstep, hex, mix } = px;
  const S = sstep;

  Aura.define(7, {
    pixel: true,
    duration: 66,
    cues: [
      { ref: '2:8', t0: 5.0, t1: 13.8 },
      { ref: '2:9', t0: 14.4, t1: 27.6 },
      { ref: '2:10', t0: 28.2, t1: 47.4 },
      { ref: '2:11', t0: 48.0, t1: 58.4 },
    ],
    titles: [],

    build(ctx) {
      const U0 = () => px.cur();
      const sA = px.surface().u32, sB = px.surface().u32;

      const SHOTS = [
        [4.8, 14.2, [0, -52, 1.0], [0, -48, 1.55]],
        [14.2, 21.0, [-30, -34, 1.7], [-6, -38, 1.9]],
        [21.0, 28.0, [0, -40, 2.7], [0, -42, 2.3]],
        [28.0, 32.0, [0, -50, 1.1], [0, -50, 1.25]],
        [32.0, 42.0, [0, -18, 2.1], [0, -22, 2.1]],
        [42.0, 47.6, [0, -56, 3.0], [0, -60, 3.4]],
        [47.6, 58.4, [0, -46, 1.9], [0, -50, 1.3]],
        [58.4, 66.1, [0, -50, 1.3], [0, -62, 1.2]],
      ];
      function cam(t) {
        let s = SHOTS[SHOTS.length - 1];
        for (const q of SHOTS) if (t < q[1]) { s = q; break; }
        const u = S(s[0], s[1], t), A = s[2], B = s[3];
        return { cx: lerp(A[0], B[0], u), cy: lerp(A[1], B[1], u), Z: Math.exp(lerp(Math.log(A[2]), Math.log(B[2]), u)) };
      }
      /* the lamp in the window: lit, goes out ("who was dead"), lit again ("has come to life"), low in oppression, overflowing ("you are rich") */
      const lampK = (t) => {
        if (t < 8.0) return 1;
        if (t < 10.8) return lerp(1, 0, S(8.0, 9.4, t));
        if (t < 14) return lerp(0, 1, S(10.8, 11.8, t));
        if (t < 22) return lerp(1, 0.5, S(14.6, 17, t));
        return lerp(0.5, 1, S(22.0, 24.0, t));
      };
      const rich = (t) => S(22.0, 24.0, t) * (1 - S(28, 30, t));                /* the gold spilling from the window */
      const glowK = (t) => 0.18 + 0.7 * lampK(t) + 0.55 * rich(t) + 0.2 * S(44, 46, t);
      const rainK = (t) => 0.2 * S(0.5, 3, t) + 0.55 * S(3, 6, t) + 0.3 * S(14, 18, t) - 0.25 * S(48, 54, t) - 0.5 * S(56, 62, t);
      const pop = (t) => Math.exp(-Math.pow((t - 11.3) / 0.35, 2)) + 0.6 * Math.exp(-Math.pow((t - 23.3) / 0.4, 2));

      function sparkle(x, y, r, k, colHex) {
        if (k <= 0.01) return;
        x = Math.round(x); y = Math.round(y);
        lib.halo(x, y, r * 2.2, hex(colHex), 0.5 * k, 1);
        for (let d = 0; d <= r; d++) { const a = k * Math.pow(1 - d / r, 1.3); px.dpx(x + d, y, hex('#ffffff'), a); px.dpx(x - d, y, hex('#ffffff'), a); px.dpx(x, y + d, hex('#ffffff'), a); px.dpx(x, y - d, hex('#ffffff'), a); }
        px.set(x, y, hex('#ffffff'));
      }

      /* ---------------------------------------------------------------- the street */
      function drawStreet(t) {
        const U = U0(), c = cam(t), Z = c.Z, sX = (wx) => 240 + (wx - c.cx) * Z, sY = (wy) => 112 + (wy - c.cy) * Z;
        const bars = S(33.2, 34.0, t) * (1 - S(46.2, 47.4, t));
        lib.smyrnaStreet({ U, cx: c.cx, cy: c.cy, Z, t, glow: glowK(t), lamp: lampK(t), bars, pop: pop(t) });
        /* halo of the lamp */
        const lx = sX(0), ly = sY(-38), lk = lampK(t);
        if (lk > 0.02) lib.halo(lx, ly, (24 + 30 * rich(t)) * Z, hex('#ffc060'), 0.25 * lk + 0.35 * rich(t), 0.9);
        /* you are rich: the gold pours out of the plain window into the street */
        const rk = rich(t);
        if (rk > 0.02) for (let i = 0; i < 40; i++) { const r1 = px.hash(i, 1, 55), ph = ((t * 0.35 + r1) % 1), x = lx + (px.hash(i, 2, 55) - 0.5) * 36 * Z * (0.3 + ph), y = ly + 10 * Z + ph * 70 * Z; px.dpx(Math.round(x), Math.round(y), hex('#ffe9a0'), rk * 0.9 * (1 - ph)); }
        /* slander (14 – 28): dark whispers slide along the wall and break on the light */
        if (t > 15.5 && t < 28.5) for (let i = 0; i < 6; i++) {
          const t0 = 16.0 + i * 1.55, u = clamp((t - t0) / 5.2, 0, 1); if (u <= 0 || u >= 1) continue;
          const dir = i % 2 ? 1 : -1, head = dir * lerp(190, 26, u * u * (3 - 2 * u)), fade = Math.min(1, u * 6) * (1 - S(0.82, 1, u));
          for (let k = 0; k < 20; k++) {
            const wx = head - dir * k * 5.5, wy = -46 + Math.sin(k * 0.55 + t * 2.2 + i * 1.3) * 7 - 4 * Math.sin(i), r = (3.2 - k * 0.13) * Z, X = sX(wx), Y = sY(wy), a = fade * (1 - k / 20) * 0.95;
            for (let dy = -Math.ceil(r); dy <= Math.ceil(r); dy++) for (let dx = -Math.ceil(r); dx <= Math.ceil(r); dx++) if (dx * dx + dy * dy <= r * r && a > px.thr(Math.round(X) + dx, Math.round(Y) + dy)) px.set(Math.round(X) + dx, Math.round(Y) + dy, hex('#02030a'));
          }
          if (u > 0.85 && u < 1) sparkle(sX(dir * 24), sY(-46), 4, (1 - u) * 5, '#c8dcff');
        }
        /* the oppression: a dark weight pressing down from above, and lifting */
        const pr = S(14.4, 17.5, t) * (1 - S(21.0, 23.5, t));
        if (pr > 0.02) for (let y = 0; y < Math.round(70 * pr); y++) for (let x = 0; x < W; x++) if ((1 - y / (70 * pr)) * pr > px.thr(x, y) * 0.9) U[y * W + x] = hex(y & 1 ? '#02030a' : '#05070f');
        /* v10: the bars fall (28 – 33.6); the devil's shadow darkens the street */
        const cage = S(28.4, 31.8, t) * (1 - S(35.2, 37.0, t));
        if (cage > 0.02) {
          const front = lerp(-10, H + 6, S(28.4, 31.4, t)), sp = Math.round(30 * Z * 0.9);
          for (let bx = ((Math.round(sX(0)) % sp) + sp) % sp; bx < W; bx += sp) for (let y = 0; y < Math.min(H, front); y++) { px.set(bx, y, hex('#04060c')); px.set(bx + 1, y, hex('#070a14')); if (y > front - 4) px.set(bx, y, hex('#0e1426')); }
          for (let y = 0; y < Math.min(H, front); y += 34) for (let x = 0; x < W; x++) if (cage > px.thr(x, y)) px.set(x, y, hex('#04060c'));
          const sh = S(28.4, 31, t) * (1 - S(35, 37, t)); for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (sh * (0.35 + 0.35 * (1 - y / H)) * (0.7 + 0.3 * px.fbm(x * 0.03 + t * 0.3, y * 0.04, 2, 47)) > px.thr(x, y) + 0.2) U[y * W + x] = mix(U[y * W + x], hex('#02030a'), 0.6);
        }
        /* ten days: ten small lights along the foot of the wall, one for each day */
        if (t > 32.2) {
          const lz = Z;
          for (let i = 0; i < 10; i++) {
            const t0 = 33.0 + i * 0.9, k = S(t0, t0 + 0.5, t), wx = -90 + i * 20, X = Math.round(sX(wx)), Y = Math.round(sY(-5));
            if (k <= 0.01 || X < -10 || X > W + 10) continue;
            for (let j = 0; j < Math.max(3, Math.round(5 * lz)); j++) for (let d = 0; d < Math.max(1, Math.round(1.6 * lz)); d++) px.set(X + d - 1, Y - 1 - j, px.ramp(lib.STONE, d === 0 ? 0.5 : 0.78, X, Y));
            lib.flame({ x: X, y: Y - Math.max(3, Math.round(5 * lz)) - 2, k, pop: Math.exp(-Math.pow((t - t0 - 0.3) / 0.3, 2)), t, seed: 30 + i, s: clamp(0.4 * lz + 0.7, 1, 2.6), glow: 0.8 });
            lib.halo(X, Y - 8 * lz, 12 * lz, hex('#ffb060'), 0.22 * k, 0.9);
          }
        }
        /* the crown of life */
        const ck = S(42.4, 46.2, t);
        if (ck > 0.01) lib.crown({ U, x: Math.round(sX(0)), y: Math.round(sY(-70)), z: 1.1 * Z * 0.8 + 0.4, k: ck, t, glow: 1 });
        /* v11: the second death, a dark ring that cannot reach the lamp */
        if (t > 49 && t < 58) {
          const u = S(49.6, 55.4, t), r = lerp(260, 22, u) * Z * 0.8 * 1.0, a = (1 - S(54.6, 56.6, t)), cx0 = Math.round(sX(0)), cy0 = Math.round(sY(-42));
          for (let y = Math.max(0, cy0 - 140); y < Math.min(H, cy0 + 140); y++) for (let x = 0; x < W; x++) {
            const dx = x - cx0, dy = (y - cy0) * 1.25, d = Math.hypot(dx, dy), band = 1 - Math.abs(d - r) / (14 * Z * 0.6 + 5);
            if (band > 0 && band * a * 0.95 > px.thr(x, y) + 0.1) U[y * W + x] = hex(band > 0.6 ? '#010208' : '#06080f');
          }
          if (u > 0.9) sparkle(cx0, cy0, 6 + 4 * (1 - a), (1 - a) * 1.4 + 0.2, '#ffe9a0');
        }
        lib.rain({ t, k: rainK(t), wind: 0.22 });
        /* splashes on the wet street */
        if (rainK(t) > 0.1) for (let i = 0; i < 30; i++) { const x = Math.round(px.hash(i, Math.floor(t * 7), 61) * W), y = Math.round(sY(0) + 4 + px.hash(i, Math.floor(t * 7), 62) * 40 * Z); px.dpx(x, y, hex('#8aa4d0'), 0.5 * rainK(t)); px.dpx(x + 1, y, hex('#8aa4d0'), 0.35 * rainK(t)); }
      }

      /* ---------------------------------------------------------------- opening: the smoke reaches Smyrna across the dark sea */
      function drawOpening(t) {
        const U = U0(), hy = 112;
        lib.seascape({ U, t: 80 + t * 0.4, dawn: 0.2 * (1 - S(0, 4, t)), hy, sunX: 60, rise: -20, camX: -40 + 6 * t, camY: 0, wind: 0.8, amp: 1, rays: 0, patmosPar: 0.5, patmosScale: 1, cloudOffA: 611, cloudOffB: 211, stars: 0.6 });
        const sx = 330 - 14 * t;
        lib.cities({ xs: [-999, sx, -999, -999, -999, -999, -999], hy: hy + 1, lit: [0, 0.5 + 0.3 * S(3, 5, t), 0, 0, 0, 0, 0], t, col: hex('#0a1022'), rim: hex('#4a64a0'), hazeCol: hex('#1e2c52'), sunX: 60, amber: hex('#ffb85a') });
        /* the smoke of the last flame, carried north on the sea wind */
        for (let i = 0; i < 160; i++) {
          const age = ((t * 0.32 + i / 160) % 1), r2 = px.hash(i, 2, 51), x = -10 + age * 520 * (0.6 + 0.4 * px.hash(i, 1, 51)), y = 78 + 14 * Math.sin(age * 5 + i) * (0.5 + r2) - 22 * age + 8 * (1 - age);
          px.dpx(Math.round(x), Math.round(y), mix(hex('#c8b0a0'), hex('#8aa4d0'), S(0, 4, t) * 0.9 + 0.1 * age), 1.2 * Math.min(1, age * 8) * (1 - age * 0.7));
        }
        lib.windStreaks(t, 0.5, hex('#9ab4e0'), 14, 190);
        lib.rain({ t, k: rainK(t), wind: 0.22 });
        const tint = hex('#0a1030'); for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (0.35 * (1 - S(0, 3.5, t)) < px.thr(x, y) * 0.0) U[y * W + x] = tint;
      }

      /* ---------------------------------------------------------------- handoff: the rain clears into stark mountain light */
      function drawStark(t) {
        const U = U0(), k = S(58.4, 64, t), stark = [hex('#2a2e3e'), hex('#565c74'), hex('#8a90a8'), hex('#c0c6d8'), hex('#eef2fa'), hex('#ffffff')];
        for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
          const v = 0.25 + 0.55 * Math.pow(1 - y / H, 0.8) + 0.3 * Math.exp(-(Math.pow(x - 90, 2) + Math.pow(y - 36, 2)) / 5200) + 0.04 * px.fbm(x * 0.02, y * 0.03, 2, 9);
          U[y * W + x] = px.ramp(stark, clamp(v, 0, 1), x, y);
        }
        for (let x = 0; x < W; x++) {
          const ridge = 120 - 62 * Math.pow(px.fbm(x * 0.012 + 2, 3.3, 4, 13), 1.2) - 26 * Math.exp(-Math.pow((x - 330) / 70, 2)) + 3 * Math.sin(x * 0.2), r2 = 138 - 26 * px.fbm(x * 0.02 + 7, 1.1, 3, 17);
          for (let y = Math.max(0, Math.round(ridge)); y < H; y++) { const d = (y - ridge) / 60; U[y * W + x] = y < r2 ? px.ramp([hex('#0a0c18'), hex('#1c2034'), hex('#363c58'), hex('#6a7090')], clamp(0.7 - 0.4 * d + 0.4 * (x > 200 ? 0.3 : 0) * (y - ridge < 2 ? 1 : 0), 0, 1), x, y) : px.ramp([hex('#04050c'), hex('#0a0c18'), hex('#14172a')], clamp(0.3 + d * 0.2, 0, 1), x, y); }
        }
        lib.flare && 0;
      }

      const gold = [hex('#fff6d0'), hex('#ffe9a0'), hex('#ffd070'), hex('#f2a444'), hex('#c8702a'), hex('#8a4420')];
      function drawTitle(t) {
        const t0 = 1.6, t1 = 4.9, k = S(t0, t0 + 1.0, t) * (1 - S(t1 - 0.8, t1, t));
        if (k <= 0.01) return;
        const sc = 3, word = 'FAITHFUL UNTIL DEATH', tw = px.textWidth(word, sc, 1), x0 = Math.round(240 - tw / 2), y0 = 66, fo = 1 - S(t1 - 0.8, t1, t);
        px.scrim(240, y0 + 16, 232, 40, k * 1.05);
        for (let i = 0; i < word.length; i++) {
          const ka = clamp((t - t0 - 0.1 - i * 0.05) / 0.6, 0, 1) * fo; if (ka <= 0) continue;
          const lx = x0 + i * 6 * sc, ch = word[i];
          px.text(ch, lx + 2, y0 + 2, sc, hex('#0a0814'), ka);
          const sweep = lerp(-40, 440, S(t0 + 1.1, t0 + 2.6, t));
          px.text(ch, lx, y0, sc, (cc, r, X, Y) => { let col = px.ramp(gold, (r + 1) / (7 * sc), X, Y); const d = (X - Y * 0.7) - sweep; if (d > 0 && d < 8) col = hex(d < 4 ? '#ffffff' : '#fff0c0'); return col; }, ka);
        }
        const sub = 'REVELATION · EPISODE 7', sw = px.textWidth(sub, 2, 1), sx0 = Math.round(240 - sw / 2), sy0 = y0 - 17, ks = S(t0 - 0.1, t0 + 0.8, t) * fo;
        px.text(sub, sx0 + 1, sy0 + 1, 2, hex('#0a0814'), ks); px.text(sub, sx0, sy0, 2, hex('#8aa4d0'), ks);
        const rule = Math.round(lerp(0, 150, S(t0 + 0.6, t0 + 2.0, t))); px.hline(240 - rule, 240 + rule, y0 + 7 * sc + 8, mix(hex('#8aa4d0'), hex('#0a0814'), 0.15 + (1 - k) * 0.8));
      }

      function dissolve(main, a, k) { for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (px.thr(x, y) >= k) main[y * W + x] = a[y * W + x]; }

      return {
        render(t) {
          const main = px.cur(), X1 = S(3.6, 4.8, t), X2 = S(60.5, 63.5, t);
          if (t < 3.6) drawOpening(t);
          else if (X1 < 1) { px.target(sA); drawOpening(t); px.target(main); drawStreet(t); dissolve(main, sA, X1); }
          else if (X2 > 0) { px.target(sB); drawStark(t); px.target(main); drawStreet(t); dissolve(main, sB, 1 - X2); }
          else drawStreet(t);
          px.post({ vignette: 1, fade: 0, flash: 0 });
          drawTitle(t);
        },
      };
    },

    score(A, from) {
      const D2 = 73.42, A2 = 110, D3 = 146.83, A3 = 220, E4 = 329.63, D4 = 293.66, F4 = 349.23, A4 = 440, C5 = 523.25, D5 = 587.33, F5 = 698.46, G5 = 783.99, A5 = 880, C6 = 1046.5, D6 = 1174.66, F6 = 1396.9, G6 = 1567.98, A6 = 1760, C7 = 2093, Fs4 = 369.99;
      /* continuity: the sea wind that carried the smoke, the low drone */
      A.drone(0, 65.6, D2, { gain: 0.1, attack: 0.4, release: 2.0 });
      A.wind(0, 10, { gain: 0.09, bright: 0.8, attack: 0.4 });
      A.sea(0, 20, { gain: 0.06, attack: 1.0 });
      A.noise({ t0: 1, t1: 61, gain: [[1, 0], [6, 0.05], [18, 0.07], [48, 0.07], [56, 0.03], [61, 0]], filter: { type: 'highpass', freq: 3200, q: 0.5 }, wet: 0.3, attack: 1.0, release: 2.0 });   /* rain */
      A.choir(0, 6, [D3, A3, D4, F4, A4], { gain: 0.05, attack: 1.2, release: 2.0, vowel: 0.8 });
      /* v8 (5 - 14): the First and the Last, who was dead and has come to life */
      A.choir(5, 8.4, [D3, A3, D4, F4, A4], { gain: 0.06, attack: 0.8, release: 1.2, vowel: 0.8 });
      A.bell(6.0, A5, { gain: 0.07, dur: 4 });
      A.voice({ type: 'sine', freq: [[8.0, 330], [9.6, 60]], t0: 8.0, t1: 9.7, gain: 0.08, attack: 0.1, release: 0.5, wet: 0.6 });
      A.boom(9.4, { freq: 40, gain: 0.5, dur: 3 });
      A.riser(10.0, 11.4, { f0: 300, f1: 2800, gain: 0.06 });
      A.bell(11.4, D6, { gain: 0.11, dur: 5 }); A.shimmer(11.45, A5, { dur: 4, gain: 0.05 });
      A.choir(11.4, 20, [D3, A3, D4, Fs4, A4, D5], { gain: 0.06, attack: 0.6, release: 2.4, vowel: 1.0 });
      /* v9 (14 - 28): oppression and poverty, but you are rich; blasphemy as a low murmur */
      A.voice({ type: 'sawtooth', freq: 55, t0: 15, t1: 23, gain: 0.04, attack: 2.0, release: 2.0, wet: 0.5, filter: { type: 'lowpass', freq: 300, q: 1 } });
      for (let i = 0; i < 6; i++) { const t = 17.2 + i * 1.55; A.voice({ type: 'sine', freq: [[t, 392], [t + 0.9, 262]], t0: t, t1: t + 1.0, gain: 0.03, attack: 0.05, release: 0.6, wet: 0.6 }); }
      A.riser(21.0, 22.8, { f0: 260, f1: 3600, gain: 0.07 });
      A.bell(22.9, D6, { gain: 0.1, dur: 5 }); A.bell(23.0, A5, { gain: 0.06, dur: 4 });
      A.choir(22.9, 29, [D3, A3, D4, Fs4, A4, D5, A5], { gain: 0.07, attack: 0.6, release: 2.2, vowel: 1.1 });
      /* v10 (28 - 47): do not be afraid; the bars fall; ten lights, ten days; faithful; the crown */
      A.boom(28.8, { freq: 36, gain: 0.5, dur: 3.4 });
      A.noise({ t0: 28.4, t1: 33, gain: [[28.4, 0], [31, 0.08], [33, 0]], filter: { type: 'lowpass', freq: [[28.4, 1800], [33, 300]], q: 0.7 }, wet: 0.4, attack: 0.1, release: 0.4 });
      A.choir(29, 34, [D3, A3, D4, F4, A4], { gain: 0.05, attack: 0.8, release: 1.6, vowel: 0.9 });
      [D5, F5, G5, A5, C6, D6, F6, G6, A6, C7].forEach((f, i) => { const t = 33.0 + i * 0.9; A.bell(t, f, { gain: 0.075, dur: 3.4 }); A.shimmer(t + 0.04, f / 2, { dur: 1.8, gain: 0.025 }); });
      A.choir(34, 47.5, [D3, A3, D4, F4, A4, D5], { gain: 0.055, attack: 2.0, release: 2.4, vowel: 1.0 });
      A.riser(41.6, 44.2, { f0: 300, f1: 6000, gain: 0.12 });
      A.boom(44.4, { freq: 42, gain: 0.55, dur: 4 });
      [D5, Fs4 * 2, A5, D6, Fs4 * 4, A6].forEach((f, i) => A.bell(44.4 + i * 0.3, f, { gain: 0.09, dur: 4.4 }));
      A.choir(44.4, 52, [D3, A3, D4, Fs4, A4, D5], { gain: 0.075, attack: 0.8, release: 2.6, vowel: 1.2 });
      /* v11 (48 - 58): the second death, a dark ring that cannot harm */
      A.voice({ type: 'sawtooth', freq: 41, t0: 49.4, t1: 55.6, gain: 0.05, attack: 3.0, release: 1.4, wet: 0.5, filter: { type: 'lowpass', freq: [[49.4, 200], [55.6, 600]], q: 1 } });
      A.boom(55.3, { freq: 34, gain: 0.45, dur: 3.2 });
      A.bell(55.5, D6, { gain: 0.1, dur: 5 }); A.shimmer(55.55, A5, { dur: 5, gain: 0.05 });
      /* handoff: the rain clears; a stark, bare fifth for Pergamum */
      A.choir(57, 65.4, [A3, E4], { gain: 0.06, attack: 1.4, release: 2.4, vowel: 0.7 });
      A.wind(58, 66, { gain: 0.07, bright: 1.0, attack: 2.0 });
      A.bell(62.0, E4 * 2, { gain: 0.06, dur: 5 });
    },
  });
})();
