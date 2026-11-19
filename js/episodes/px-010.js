/* ============================================================================
 *  REVELATION · PIXEL EDITION · Episode 10 · Thyatira: Hold On Until I Come · Revelation 2:24–29
 *  2D pixel-art cut (480x200). An ember rises into a rod of iron; dawn breaks behind it and the morning
 *  star stands on the horizon. Wide, calm, hopeful. No faces.
 *
 *  0:00  Episode 9's soft ember, close, in the dark
 *  0:05  v24 to the rest in Thyatira: no other burden; the burdens dissolve into light
 *  0:20  v25 hold firmly to what you have until I come: the flames lean in the wind and hold
 *  0:25  v26 the ember rises into a glowing rod of iron: authority over the nations
 *  0:33  v27 the rod strikes the ground; the clay pots shatter
 *  0:45  v28 dawn begins; the morning star stands on the horizon
 *  0:49  v29 he who has an ear: the wide, calm dawn
 *  0:55  the morning star fades into a dull grey sky (handoff to Sardis)
 * ========================================================================== */
(function () {
  'use strict';
  const Aura = window.Aura, px = Aura.px, lib = Aura.pxlib;
  const { W, H, clamp, lerp, sstep, hex, mix } = px;
  const S = sstep;

  Aura.define(10, {
    pixel: true,
    duration: 66,
    cues: [
      { ref: '2:24', t0: 5.0, t1: 19.8 },
      { ref: '2:25', t0: 20.4, t1: 24.0 },
      { ref: '2:26', t0: 24.6, t1: 32.6 },
      { ref: '2:27', t0: 33.2, t1: 44.0 },
      { ref: '2:28', t0: 44.6, t1: 48.2 },
      { ref: '2:29', t0: 48.8, t1: 54.8 },
    ],
    titles: [],

    build(ctx) {
      const U0 = () => px.cur();
      const tmp = new Uint32Array(W * H);
      const HYW = -46;                                    /* the horizon, in world units; the terrace floor is y = 0 */
      const FIG = [-96, -62, -30, 30, 62, 96];            /* the rest in Thyatira */
      const POTS = [-148, -120, -92, -64, -40, 40, 64, 92, 120, 148];
      const STRIKE = 38.0;

      const SHOTS = [
        [0, 5.0, [0, -10, 3.4], [0, -12, 3.0]],
        [5.0, 20.2, [0, -30, 1.3], [0, -32, 1.5]],
        [20.2, 24.4, [0, -32, 1.7], [0, -34, 1.9]],
        [24.4, 33.0, [0, -42, 1.5], [0, -62, 1.3]],
        [33.0, 44.2, [0, -44, 1.15], [0, -42, 1.1]],
        [44.2, 48.6, [0, -42, 1.2], [0, -52, 1.3]],
        [48.6, 54.9, [0, -46, 1.0], [0, -46, 1.0]],
        [54.9, 66.1, [0, -46, 1.0], [0, -62, 1.0]],
      ];
      function cam(t) {
        let s = SHOTS[SHOTS.length - 1];
        for (const q of SHOTS) if (t < q[1]) { s = q; break; }
        const u = S(s[0], s[1], t), A = s[2], B = s[3];
        return { cx: lerp(A[0], B[0], u), cy: lerp(A[1], B[1], u), Z: Math.exp(lerp(Math.log(A[2]), Math.log(B[2]), u)) };
      }
      /* the sky: dark through the rod and the shattering, then dawn, then dull grey */
      const dawnK = (t) => 0.04 + 0.86 * S(39.5, 54, t);
      const greyK = (t) => S(55.0, 63.0, t);
      const emberK = (t) => 0.25 + 0.75 * S(5, 8, t);
      const scepterK = (t) => S(24.8, 31.2, t) * (1 - 0.0 * S(54, 62, t));
      const scepterHeat = (t) => (1 - 0.9 * S(55, 63, t)) * (0.55 + 0.45 * S(24.8, 31, t));
      const starK = (t) => S(44.4, 47.0, t) * (1 - S(57, 63.5, t) * 0.97);
      const hitAmt = (t) => t < STRIKE ? 0 : Math.exp(-(t - STRIKE) / 0.12);

      function sparkle(x, y, r, k, colHex) {
        if (k <= 0.01) return;
        x = Math.round(x); y = Math.round(y);
        lib.halo(x, y, r * 2.2, hex(colHex), 0.5 * k, 1);
        for (let d = 0; d <= r; d++) { const a = k * Math.pow(1 - d / r, 1.3); px.dpx(x + d, y, hex('#ffffff'), a); px.dpx(x - d, y, hex('#ffffff'), a); px.dpx(x, y + d, hex('#ffffff'), a); px.dpx(x, y - d, hex('#ffffff'), a); }
        px.set(x, y, hex('#ffffff'));
      }

      function drawScene(t) {
        const U = U0(), c = cam(t), Z = c.Z, sX = (wx) => 240 + (wx - c.cx) * Z, sY = (wy) => 112 + (wy - c.cy) * Z, dk = dawnK(t), gk = greyK(t);
        const hy = clamp(Math.round(sY(HYW)), 10, 196), y0 = Math.round(sY(0));
        /* sky */
        lib.seascape({ U, t: t * 0.6, dawn: dk, hy, sunX: sX(0), rise: -34, camX: 0, camY: 0, wind: 0.25, amp: 0.2, rays: 0, patmosPar: 0.4, patmosScale: 1, cloudOffA: 411, cloudOffB: 911, stars: 1 - S(0.04, 0.5, dk) });
        /* the hills, and the forge-city's chimneys, far off */
        const LAND = [hex('#04050c'), hex('#080a18'), hex('#10142a'), hex('#1c2240'), hex('#3a2a40'), hex('#6a3a40'), hex('#c8703a')];
        for (let x = 0; x < W; x++) {
          const wx = c.cx + (x - 240) / Z, r1 = HYW - 4 - 10 * px.fbm(wx * 0.011 + 3, 2.2, 3, 5) - 5 * Math.sin(wx * 0.019), r2 = HYW + 6 - 7 * px.fbm(wx * 0.02 + 9, 1.3, 3, 8);
          for (let y = Math.max(0, Math.round(sY(r1))); y < Math.min(H, y0 + 1); y++) {
            const near = y >= Math.round(sY(r2)), rim = (y - Math.round(sY(near ? r2 : r1))) < 1;
            U[y * W + x] = px.ramp(LAND, clamp((near ? 0.1 : 0.16) + 0.5 * dk * (rim ? 1.0 : 0.25) * (near ? 0.6 : 1) + (rim ? 0.15 * dk : 0) - 0.05 * ((y - sY(r1)) / 60), 0, 1), x, y);
          }
        }
        for (const wx of [-170, -150, -130]) { const X = Math.round(sX(wx)), top = Math.round(sY(HYW - 10 - (wx % 3 + 3))); for (let y = top; y < Math.round(sY(HYW + 2)); y++) for (let i = 0; i < Math.max(2, Math.round(2 * Z)); i++) px.set(X + i, y, hex('#040510')); px.dpx(X + 1, top - 1, hex('#ff8a3a'), 0.7 * (0.6 + 0.4 * Math.sin(t * 3 + wx))); for (let q = 0; q < 8; q++) px.dpx(X + Math.round(Math.sin(t + q + wx) * 3), top - 3 - q * 3, hex('#3a3a4a'), 0.4 * (1 - q / 8)); }
        /* the terrace floor */
        for (let y = Math.max(0, y0); y < H; y++) for (let x = 0; x < W; x++) {
          const d = (y - y0) / Math.max(1, H - y0), wx = c.cx + (x - 240) / Z, cb = Math.floor((wx + (Math.floor(d * 9) & 1) * 7 + 1000) / 14), mc = ((wx + (Math.floor(d * 9) & 1) * 7 + 1000) % 14) < 1;
          let v = 0.18 - 0.1 * d + 0.06 * px.hash(cb, Math.floor(d * 9), 83) - (mc ? 0.05 : 0) + (y - y0 < 2 ? 0.35 * dk : 0);
          const em = emberK(t) * Math.exp(-(wx * wx) / (700 + (y - y0) * 20)) * (1 - 0.9 * S(18, 26, t)) * 0.8;
          const sc = scepterK(t) * scepterHeat(t) * Math.exp(-(wx * wx) / 1400) * 0.45;
          U[y * W + x] = px.ramp(lib.BRONZE, clamp(v * (0.5 + 0.8 * dk) + em + sc, 0, 1), x, y);
        }
        const ember = (t < 25.5);
        /* the ember: the cooled bronze, glowing softly */
        if (t < 31) { const ek = emberK(t) * (1 - S(25, 31, t)), ex = Math.round(sX(0)), ey = Math.round(sY(1)); for (let dy = -4; dy <= 1; dy++) for (let dx = -9; dx <= 9; dx++) { const d = (dx * dx) / 81 + ((dy + 1.5) * (dy + 1.5)) / 12; if (d > 1) continue; px.set(Math.round(ex + dx * Z * 0.6), ey + Math.round(dy * Z * 0.6), px.ramp(lib.BRONZE, clamp((0.45 + 0.4 * (1 - d)) * (0.3 + 0.9 * ek * (0.85 + 0.15 * Math.sin(t * 2.4))), 0, 1), dx, dy)); } lib.halo(ex, ey - 2, (30 + 14 * Math.sin(t * 2.4)) * Z, hex('#ff8a2a'), 0.5 * ek, 0.8); for (let i = 0; i < 16; i++) { const age = ((t * 0.22 + i / 16) % 1); px.dpx(Math.round(ex + Math.sin(age * 6 + i) * 8 * Z), Math.round(ey - age * 40 * Z), mix(hex('#ffb040'), hex('#ff4a1a'), age), ek * (1 - age) * 0.9); } }
        /* ---- v24 (5 – 20): the rest in Thyatira; the burdens are lifted and rise as light */
        if (t > 4.6) {
          const lift = S(10.5, 15.5, t), wind = 0.6 * S(19.5, 21, t) * (1 - S(23.5, 25, t));
          FIG.forEach((fx, i) => {
            const a = S(5.2 + i * 0.2, 6.6 + i * 0.2, t), X = sX(fx), Y = sY(4 + (i % 2) * 6), h = 27 * Z, bow = 1 - lift;
            lib.robed({ U, x: X, y: Y, h, t, a, seed: i + 20, lean: (fx < 0 ? 1 : -1) * 2.4 * bow + (fx < 0 ? 1 : -1) * wind * 0.8 * Math.sin(t * 3 + i) });
            /* the burden on the back: a dark bundle that dissolves into light */
            if (lift < 1) { const bx = X + (fx < 0 ? -1 : 1) * 8 * Z * 0, by = Y - 18 * Z; for (let j = -Math.round(5 * Z); j <= Math.round(5 * Z); j++) for (let k = -Math.round(6 * Z); k <= Math.round(6 * Z); k++) if (k * k / 36 + j * j / 25 < Z * Z * 1.0 && a * (1 - lift) > px.thr(bx + k, by + j) + 0.05) px.set(Math.round(bx + k + (fx < 0 ? -10 : 10) * Z * 0.5), Math.round(by + j), px.ramp(lib.CLAY, 0.08 + 0.1 * (k / (6 * Z) + 1), k, j)); }
            if (lift > 0.02 && lift < 1) for (let q = 0; q < 10; q++) { const age = clamp((t - 10.5 - q * 0.3) / 4, 0, 1); px.dpx(Math.round(X + (px.hash(q, i, 3) - 0.5) * 18 * Z), Math.round(Y - 20 * Z - age * 50 * Z), hex('#ffe9b0'), 0.9 * (1 - age) * lift); }
            /* each holds a small light, which does not go out */
            const lx = X + (fx < 0 ? 9 : -9) * Z * 0.8, ly = Y - 14 * Z;
            if (a > 0.05) lib.flame({ x: Math.round(lx), y: Math.round(ly), k: a, pop: 0, t, seed: 90 + i, s: clamp(0.4 * Z + 0.7, 1, 2.4), glow: 0.8 });
          });
          /* the deep things: dark wisps that cannot come near the light (v24) */
          if (t > 8 && t < 20.5) for (let i = 0; i < 4; i++) {
            const t0 = 8.5 + i * 2.6, u = clamp((t - t0) / 5.0, 0, 1); if (u <= 0 || u >= 1) continue;
            const dir = i % 2 ? 1 : -1, head = dir * lerp(230, 126, S(0, 1, u)), fade = Math.min(1, u * 5) * (1 - S(0.55, 0.95, u));
            for (let k = 0; k < 14; k++) { const wx = head - dir * k * 6, wy = -22 + Math.sin(k * 0.6 + t * 2 + i) * 5, r = (2.8 - k * 0.15) * Z, X = sX(wx), Y = sY(wy), a = fade * (1 - k / 14) * 0.9; for (let dy = -Math.ceil(r); dy <= Math.ceil(r); dy++) for (let dx = -Math.ceil(r); dx <= Math.ceil(r); dx++) if (dx * dx + dy * dy <= r * r && a > px.thr(Math.round(X) + dx, Math.round(Y) + dy)) px.set(Math.round(X) + dx, Math.round(Y) + dy, hex('#020208')); }
          }
        }
        /* ---- v26 (24 – 32): the ember rises into a rod of iron; the nations' lights glimmer along the horizon */
        const sk = scepterK(t), strike = clamp((t - (STRIKE - 0.45)) / 0.45, 0, 1) * (1 - S(STRIKE + 0.05, STRIKE + 0.5, t)), lift2 = S(STRIKE - 1.4, STRIKE - 0.45, t) * (1 - S(STRIKE - 0.45, STRIKE, t));
        if (sk > 0.01) lib.scepter({ U, x: Math.round(sX(0)), y: Math.round(sY(2)) - Math.round(7 * Z * lift2), h: 96 * Z, k: sk, heat: scepterHeat(t) * (0.8 + 0.2 * Math.sin(t * 2)) + 0.2 * hitAmt(t), t, w: Math.max(2, Math.round(2.3 * Z)) });
        const nk = S(29, 32, t);
        if (nk > 0.01) for (let i = 0; i < 26; i++) { const wx = -230 + i * 18 + px.hash(i, 1, 4) * 10, X = Math.round(sX(wx)), Y = Math.round(sY(HYW + 2 + px.hash(i, 2, 4) * 3)); if (nk * 1.2 > px.hash(i, 3, 4)) px.dpx(X, Y, hex('#ffc060'), 0.9 * (0.5 + 0.5 * Math.sin(t * 2 + i))); }
        /* ---- v27 (33 – 44): the rod strikes; the clay pots shatter */
        POTS.forEach((wx, i) => {
          const ts = STRIKE + 0.12 + Math.abs(wx) / 110, k = S(33.4 + i * 0.1, 34.6 + i * 0.1, t), X = sX(wx), Y = sY(6 + (i % 3) * 4);
          if (t < ts) lib.pot({ U, x: X, y: Y, z: Z * 0.95, a: k, t });
          else {
            const age = t - ts; if (age > 3.6) return;
            for (let q = 0; q < 18; q++) { const r1 = px.hash(q, i, 6), r2 = px.hash(q, i, 7), vx = (r1 * 2 - 1) * 60 * Z, vy = -(30 + 70 * r2) * Z, x = X + vx * age, y = Y - 12 * Z + vy * age + 160 * Z * age * age, floor = Y + 3; const yy = Math.min(y, floor), a = 1 - S(2.2, 3.6, age); px.set(Math.round(x), Math.round(yy), px.ramp(lib.CLAY, 0.2 + 0.6 * r2, q, i)); if (a > px.thr(Math.round(x), Math.round(yy))) px.set(Math.round(x) + 1, Math.round(yy), px.ramp(lib.CLAY, 0.3 + 0.5 * r1, q, i)); }
            if (age < 0.5) lib.halo(X, Y - 10 * Z, 22 * Z, hex('#ffd890'), 0.6 * (1 - age / 0.5), 1);
          }
        });
        if (t > STRIKE && t < STRIKE + 2.2) { const u = (t - STRIKE) / 2.2, r = u * 200 * Z; for (let k = 0; k < 220; k++) { const an = k / 220 * 6.2832, x = sX(0) + Math.cos(an) * r, y = sY(3) + Math.sin(an) * r * 0.07; px.dpx(Math.round(x), Math.round(y), hex('#ffe9b0'), (1 - u) * 0.9); px.dpx(Math.round(x), Math.round(y) - 1, hex('#ff9a3a'), (1 - u) * 0.6); } }
        /* ---- v28 (44 – 48): the morning star on the horizon */
        const st = starK(t);
        if (st > 0.01) {
          const X = sX(0), Y = sY(HYW - 14 - 12 * S(44.6, 54, t)), r = 14 + 8 * Math.sin(t * 1.6);
          lib.halo(X, Y, 80 * (0.4 + 0.6 * st), hex('#ffffff'), 0.4 * st, 0.8);
          lib.halo(X, Y, 26, hex('#fff6d8'), 0.9 * st, 1);
          for (let d = 0; d <= r * 2.2; d++) { const a = st * Math.pow(1 - d / (r * 2.2), 1.5) * 0.9; px.dpx(Math.round(X) + d, Math.round(Y), hex('#ffffff'), a); px.dpx(Math.round(X) - d, Math.round(Y), hex('#ffffff'), a); }
          for (let d = 0; d <= r * 1.4; d++) { const a = st * Math.pow(1 - d / (r * 1.4), 1.5) * 0.9; px.dpx(Math.round(X), Math.round(Y) + d, hex('#ffffff'), a); px.dpx(Math.round(X), Math.round(Y) - d, hex('#ffffff'), a); }
          px.set(Math.round(X), Math.round(Y), hex('#ffffff'));
        }
        /* ---- the handoff: the colour drains out of the sky (Sardis) */
        if (gk > 0.01) for (let i = 0; i < W * H; i++) { const v = U[i], r = v & 255, g = (v >> 8) & 255, b = (v >> 16) & 255, l = (0.3 * r + 0.59 * g + 0.11 * b) | 0, gr = Math.min(255, (l * 0.8 + 60) | 0), m = gk * 0.92; U[i] = (255 << 24) | ((((b + (gr - b) * m) | 0) & 255) << 16) | ((((g + (gr - g) * m) | 0) & 255) << 8) | (((r + (gr - r) * m) | 0) & 255); }
      }

      const gold = [hex('#fff6d0'), hex('#ffe9a0'), hex('#ffd070'), hex('#f2a444'), hex('#c8702a'), hex('#8a4420')];
      function drawTitle(t) {
        const t0 = 1.2, t1 = 4.6, k = S(t0, t0 + 1.0, t) * (1 - S(t1 - 0.8, t1, t));
        if (k <= 0.01) return;
        const sc = 3, word = 'HOLD ON UNTIL I COME', tw = px.textWidth(word, sc, 1), x0 = Math.round(240 - tw / 2), y0 = 66, fo = 1 - S(t1 - 0.8, t1, t);
        px.scrim(240, y0 + 16, 232, 40, k * 1.05);
        for (let i = 0; i < word.length; i++) {
          const ka = clamp((t - t0 - 0.1 - i * 0.05) / 0.6, 0, 1) * fo; if (ka <= 0) continue;
          const lx = x0 + i * 6 * sc, ch = word[i];
          px.text(ch, lx + 2, y0 + 2, sc, hex('#0a0408'), ka);
          const sweep = lerp(-40, 440, S(t0 + 1.1, t0 + 2.6, t));
          px.text(ch, lx, y0, sc, (cc, r, X, Y) => { let col = px.ramp(gold, (r + 1) / (7 * sc), X, Y); const d = (X - Y * 0.7) - sweep; if (d > 0 && d < 8) col = hex(d < 4 ? '#ffffff' : '#fff0c0'); return col; }, ka);
        }
        const sub = 'REVELATION · EPISODE 10', sw = px.textWidth(sub, 2, 1), sx0 = Math.round(240 - sw / 2), sy0 = y0 - 17, ks = S(t0 - 0.1, t0 + 0.8, t) * fo;
        px.text(sub, sx0 + 1, sy0 + 1, 2, hex('#0a0408'), ks); px.text(sub, sx0, sy0, 2, hex('#ff9a3a'), ks);
        const rule = Math.round(lerp(0, 150, S(t0 + 0.6, t0 + 2.0, t))); px.hline(240 - rule, 240 + rule, y0 + 7 * sc + 8, mix(hex('#ff9a3a'), hex('#0a0408'), 0.15 + (1 - k) * 0.8));
      }

      return {
        render(t) {
          const main = px.cur();
          drawScene(t);
          const sh = (t > STRIKE && t < STRIKE + 0.7) ? Math.round(Math.sin(t * 80) * 3 * (1 - (t - STRIKE) / 0.7)) : 0;
          if (sh) { tmp.set(main); for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) main[y * W + x] = tmp[clamp(y + sh, 0, H - 1) * W + x]; }
          px.post({ vignette: 1.1, fade: 0, flash: 0.45 * hitAmt(t), flashCol: hex('#fff0d0') });
          drawTitle(t);
          px.fadeOnly(clamp(1 - S(0, 1.0, t)));
        },
      };
    },

    score(A, from) {
      const D2 = 73.42, D3 = 146.83, A3 = 220, D4 = 293.66, Fs4 = 369.99, A4 = 440, B4 = 493.88, D5 = 587.33, E5 = 659.25, Fs5 = 739.99, A5 = 880, B5 = 987.77, D6 = 1174.66, E6 = 1318.5, Fs6 = 1479.98, A6 = 1760, E4 = 329.63;
      /* continuity: the cooled bronze, a soft hush; the day begins to turn */
      A.drone(0, 65.6, D2, { gain: 0.1, attack: 0.6, release: 2.6 });
      A.choir(0, 6, [D3, A3], { gain: 0.05, attack: 1.2, release: 2.2, vowel: 0.7 });
      A.noise({ t0: 0, t1: 8, gain: 0.02, filter: { type: 'highpass', freq: 5200, q: 0.4 }, wet: 0.3, attack: 0.6, release: 1.4 });     /* embers */
      A.wind(2, 66, { gain: 0.04, bright: 0.5, attack: 2.0 });
      /* v24 (5 - 20): no other burden: a warm, easy chord and slow bells as the burdens lift */
      A.choir(5, 20.6, [D3, A3, D4, Fs4, A4], { gain: 0.055, attack: 2.0, release: 2.4, vowel: 1.0 });
      [D5, Fs5, A5, D6, A5, Fs5].forEach((f, i) => A.bell(10.6 + i * 0.9, f, { gain: 0.06, dur: 4 }));
      A.shimmer(11.0, A5, { dur: 6, gain: 0.04 });
      /* v25 (20 - 24): hold firmly: one steady, patient note under a rising wind */
      A.wind(19.5, 25, { gain: 0.09, bright: 0.9, attack: 1.0 });
      A.brass(20.4, 25, D3, { gain: 0.06, attack: 1.0, release: 1.2, sweep: [[20.4, 500], [24.5, 1200]] });
      A.bell(20.6, A5, { gain: 0.08, dur: 5 }); A.bell(22.4, D6, { gain: 0.07, dur: 5 });
      /* v26 (24 - 33): the ember rises into the rod of iron: a long brass swell */
      A.riser(24.6, 31.4, { f0: 160, f1: 3000, gain: 0.08 });
      A.brass(24.8, 33, D3, { gain: 0.08, attack: 3.0, release: 1.4, sweep: [[24.8, 400], [31.4, 2200]] });
      A.choir(26, 33.2, [D3, A3, D4, Fs4, A4, D5], { gain: 0.065, attack: 2.4, release: 1.6, vowel: 1.1 });
      A.bell(31.4, D6, { gain: 0.1, dur: 5 });
      /* v27 (33 - 44): the strike: boom and iron bell, then the clay pots shattering as the ring passes */
      A.boom(37.95, { freq: 40, gain: 0.75, dur: 3.8 }); A.bell(38.0, D4, { gain: 0.16, dur: 8 }); A.bell(38.02, A5, { gain: 0.08, dur: 6 });
      A.noise({ t0: 37.98, t1: 39.2, gain: [[37.98, 0.2], [39.2, 0]], filter: { type: 'bandpass', freq: [[37.98, 5200], [39.2, 1200]], q: 0.9 }, wet: 0.4, attack: 0.005, release: 0.5 });
      [40, 64, 92, 120, 148].forEach((x, i) => { const t = 38.12 + x / 110; A.noise({ t0: t, t1: t + 0.35, gain: 0.07, filter: { type: 'bandpass', freq: 3600 - i * 300, q: 1.1 }, wet: 0.3, attack: 0.004, release: 0.3 }); });
      A.choir(38.0, 44.6, [D3, A3, D4, Fs4, A4, D5], { gain: 0.07, attack: 0.6, release: 2.4, vowel: 1.1 });
      /* v28 (44 - 48): the morning star: a high, clear light */
      A.shimmer(44.6, D6, { dur: 7, gain: 0.07 }); A.shimmer(44.8, A6, { dur: 7, gain: 0.05 });
      [D6, Fs6, A6, E6, D6].forEach((f, i) => A.bell(44.8 + i * 0.7, f, { gain: 0.07, dur: 5 }));
      A.choir(44.6, 55, [D3, A3, D4, Fs4, A4, D5, E5], { gain: 0.065, attack: 1.6, release: 2.6, vowel: 1.2 });
      /* v29 (48 - 55): calm: slow bells, an open sky */
      [D5, A5, Fs5, D6].forEach((f, i) => A.bell(49.4 + i * 1.4, f, { gain: 0.05, dur: 5 }));
      /* handoff (55 - 66): the morning star fades into a dull, grey, hollow fifth (Sardis) */
      A.choir(55.4, 65.4, [A3, E4], { gain: 0.05, attack: 2.4, release: 3.0, vowel: 0.7 });
      A.noise({ t0: 56, t1: 65.5, gain: [[56, 0], [60, 0.04], [65.5, 0.01]], filter: { type: 'lowpass', freq: 700, q: 0.6 }, wet: 0.5, attack: 1.4, release: 1.6 });
      A.bell(57.0, A5, { gain: 0.05, dur: 6 });
    },
  });
})();
