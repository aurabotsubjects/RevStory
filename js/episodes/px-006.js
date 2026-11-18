/* ============================================================================
 *  REVELATION · PIXEL EDITION · Episode 6 · Ephesus: The First Love · Revelation 2:1–7
 *  2D pixel-art cut (480x200). No faces on any figure.
 *
 *  0:00  Episode 5's last frame: the first lamp over Ephesus, brightening
 *  0:05  v1 He holds the seven stars and walks among the seven lampstands
 *  0:16  v2 toil and perseverance on the quay; those who call themselves apostles are tested and found false
 *  0:29  v3 the flame endures and does not grow weary
 *  0:36  v4 "you left your first love": the flame sinks low, the warm light withdraws
 *  0:41  v5 remember where you have fallen; the lights are lit again; the lampstand is moved out of its place
 *  0:56  v6 a shadow creeps along the colonnade and is driven back
 *  1:03  v7 he who has an ear; the tree of life in the Paradise of God
 *  1:17  the flame steadies; the sea wind carries its smoke north (handoff to Smyrna)
 * ========================================================================== */
(function () {
  'use strict';
  const Aura = window.Aura, px = Aura.px, lib = Aura.pxlib;
  const { W, H, clamp, lerp, sstep, hex, mix } = px;
  const S = sstep;

  Aura.define(6, {
    pixel: true,
    duration: 80,
    cues: [
      { ref: '2:1', t0: 5.0, t1: 15.8 },
      { ref: '2:2', t0: 16.4, t1: 28.8 },
      { ref: '2:3', t0: 29.4, t1: 35.4 },
      { ref: '2:4', t0: 36.0, t1: 40.8 },
      { ref: '2:5', t0: 41.4, t1: 55.4 },
      { ref: '2:6', t0: 56.0, t1: 62.4 },
      { ref: '2:7', t0: 63.0, t1: 77.0 },
    ],
    titles: [],

    build(ctx) {
      const U0 = () => px.cur();
      const sA = px.surface().u32, sB = px.surface().u32;
      const HYW = -64;                                   /* world y of the far horizon; the quay top is y = 0 */
      const LAMPS = [-180, -120, -60, 0, 60, 120, 180];  /* the seven lampstands on the quay; Ephesus's own is the middle one */
      const FEET = 4;                                    /* screen depth of the quay: lamps stand a little in front of the columns */

      /* ---- camera: hard cuts, each a smooth move [cx, cy, Z] ---- */
      const SHOTS = [
        [0, 4.8, [0, -50, 0.95], [0, -50, 0.95]],
        [4.8, 16.2, [-10, -50, 0.95], [14, -46, 1.12]],
        [16.2, 29.2, [-20, -26, 1.9], [34, -26, 1.9]],
        [29.2, 35.8, [0, -38, 3.2], [0, -40, 3.6]],
        [35.8, 41.2, [0, -40, 3.6], [0, -44, 2.4]],
        [41.2, 46.2, [0, -140, 1.2], [0, -40, 2.6]],
        [46.2, 51.0, [-30, -44, 1.15], [40, -44, 1.15]],
        [51.0, 56.2, [0, -44, 2.3], [14, -44, 2.3]],
        [56.2, 63.0, [70, -30, 1.7], [10, -30, 1.7]],
        [63.0, 70.4, [0, -52, 1.0], [0, -56, 1.05]],
        [70.4, 76.8, [0, -62, 1.0], [0, -112, 1.25]],
        [76.8, 80.1, [0, -38, 3.4], [0, -38, 3.4]],
      ];
      function cam(t) {
        let s = SHOTS[SHOTS.length - 1];
        for (const q of SHOTS) if (t < q[1]) { s = q; break; }
        const u = S(s[0], s[1], t), A = s[2], B = s[3];
        return { cx: lerp(A[0], B[0], u), cy: lerp(A[1], B[1], u), Z: Math.exp(lerp(Math.log(A[2]), Math.log(B[2]), u)) };
      }

      /* ---- the story state, as pure functions of time ---- */
      const flameK = (t) => (t < 36 ? 1 : t < 41 ? lerp(1, 0.26, S(36.3, 40.2, t)) : t < 46 ? 0.26 : lerp(0.26, 1, S(46.2, 50.2, t)));
      const warm = (t) => (t < 36 ? 1 : t < 46 ? lerp(1, 0.3, S(36.3, 40.2, t)) : lerp(0.3, 1, S(46.4, 50.6, t)));   /* the warm light of the city */
      const slide = (t) => S(51.4, 53.6, t) * (1 - S(54.6, 56.0, t));                                             /* the lampstand, moved out of its place */
      const treeK = S(70.6, 74.6, 0 + 0) * 0;

      /* ---------------------------------------------------------------- the Ephesus scene */
      function drawEphesus(t) {
        const U = U0(), c = cam(t), Z = c.Z, sX = (wx) => 240 + (wx - c.cx) * Z, sY = (wy) => 112 + (wy - c.cy) * Z;
        const wm = warm(t), dawn = lerp(0.2, 0.66, wm) + 0.08 * S(70, 74, t), hy = clamp(Math.round(sY(HYW)), 20, 196), y0 = Math.round(sY(0));
        const wind = 0.3 + 0.4 * S(62.5, 66, t) * (1 - S(74, 77, t)) + 0.35 * S(76.6, 78.5, t);
        lib.seascape({ U, t, dawn, hy, sunX: clamp(240 + (320 - c.cx) * Z * 0.35, 40, 440), rise: -6 + 8 * S(63, 70, t), camX: 0.3 * c.cx, camY: 0, wind: Math.min(1, wind), amp: 0.7, rays: 0, patmosPar: 0.4, patmosScale: 1, cloudOffA: 811, cloudOffB: 511, stars: 1 - S(0.15, 0.5, dawn) });
        /* the far shore */
        lib.ephesusCity({ U, cx: c.cx, cy: c.cy, Z, hyW: HYW, lit: wm, t });
        /* ships in the harbour */
        [[-90, -50, 0.8], [40, -48, 0.7], [-200, -52, 0.75]].forEach(([wx, wy, s], i) => { const x = sX(wx), y = sY(wy); if (x > -50 && x < W + 50) lib.ship({ U, x, y, s: Math.max(0.6, s * Z * 0.9), t, a: 1 }); });
        /* the quay */
        if (y0 < H) {
          const pave = [hex('#0e0a14'), hex('#1c1220'), hex('#2e1e2c'), hex('#4e3036'), hex('#7a4c42')];
          for (let y = Math.max(0, y0); y < H; y++) {
            const d = (y - y0) / Math.max(1, H - y0), seam = ((Math.floor(Math.pow(Math.max(0, y - y0) / (2.2 * Z), 0.8)) & 1) === 0) && (y - y0) % 7 === 0;
            for (let x = 0; x < W; x++) {
              let v = 0.46 - 0.3 * d + 0.12 * wm + 0.05 * px.fbm(x * 0.05, y * 0.12, 2, 41);
              if (y - y0 < 2) v = 0.95;
              else if (seam) v -= 0.14; else if (((x + Math.floor((y - y0) / 7) * 17) % Math.max(12, Math.round(34 * Z))) === 0) v -= 0.12;
              U[y * W + x] = px.ramp(pave, clamp(v, 0, 1), x, y);
            }
          }
        }
        /* the great colonnade of the harbour street; the lamps stand in front of it */
        lib.colonnade({ U, cx: c.cx, cy: c.cy, Z, x0: -290, n: 14, gap: 46, h: 112, w: 13, lit: 0.55 + 0.45 * wm });
        /* the dark places between the columns glow with the city's light */
        const cityGlow = 0.22 * wm;
        if (cityGlow > 0.02) lib.halo(sX(0), sY(-30), 150 * Z, hex('#ffb060'), cityGlow, 0.5);
        const lampZ = (i) => Z * 1.0;
        const ly = sY(0) + FEET * Z * 0.5;
        const passT = (i) => 7.0 + i * 1.3;
        /* ---- the seven lampstands */
        LAMPS.forEach((wx, i) => {
          const mid = i === 3, x = sX(wx), pop = Math.exp(-Math.pow((t - passT(i)) / 0.5, 2)) * (t < 17 ? 1 : 0);
          if (x < -50 || x > W + 50) return;
          const off = mid ? slide(t) * 190 : 0;
          const lean = 6 * wind * lampZ(i) * (0.6 + 0.4 * Math.sin(t * 2.6 + i)) + (mid ? 7 * Z * 0.5 * Math.sin(t * 3.3) * S(29.4, 30.4, t) * (1 - S(35, 36, t)) : 0);
          const lit = mid ? flameK(t) : 1;
          lib.lampstand({ U, x: Math.round(x + off), y: Math.round(ly), z: lampZ(i), lit, pop: pop + (mid ? 0 : 0), t, seed: i + 2, lean, a: S(4.8, 6.2, t) + (t > 6.2 ? 0 : 0) });
          if (lit > 0.05) lib.halo(x + off, ly - 30 * lampZ(i), (20 * lampZ(i) + 8) * (0.5 + 0.5 * lit), hex('#ffc060'), 0.3 * lit + 0.35 * pop, 0.9);
          /* the empty place left by the moved lampstand */
          if (mid && slide(t) > 0.05) lib.halo(x, ly - 24 * lampZ(i), 12 * lampZ(i) + 6, hex('#ffd890'), 0.18 * slide(t), 1);
        });
        /* ---- B (5 – 16): the seven stars in His hand, and a light walking among the lampstands */
        if (t > 5 && t < 17.5) {
          const sk = S(8.0, 9.0, t) * (1 - S(15.4, 16.2, t));
          for (let i = 0; i < 7; i++) {
            const k = S(8.0 + i * 0.4, 8.9 + i * 0.4, t) * (1 - S(15.4, 16.2, t));
            lib.glyph && 0;
            sparkle(sX((i - 3) * 55), sY(-126 + 7 * Math.abs(i - 3)), 6 * Math.max(0.8, Z), k * (0.8 + 0.2 * Math.sin(t * 3 + i)), '#f4f8ff');
          }
          const u = S(6.6, 15.2, t), wx = lerp(-200, 200, u), k = S(6.4, 7.2, t) * (1 - S(15.0, 15.9, t));
          if (k > 0.02) { lib.halo(sX(wx), sY(-34), 34 * Z + 10, hex('#fff6d0'), 0.8 * k, 0.9); lib.halo(sX(wx), sY(-34), 15 * Z + 5, hex('#ffffff'), 0.9 * k, 1); }
        }
        /* ---- C (16 – 29): toil and perseverance; the apostles are tested */
        if (t > 15 && t < 30) {
          const walk = (i, wx0, spd, dy, h, carry) => { const wx = wx0 + spd * (t - 16.2); const ka = S(16, 17, t) * (1 - S(22.8, 23.6, t)); if (ka > 0.02) lib.robed({ U, x: sX(wx), y: sY(dy), h: h * Z, t, a: ka, seed: i + 5, walk: true, carry, lean: 1 }); };
          walk(0, -120, 14, 8, 27, true); walk(1, -150, 14, 20, 26, true); walk(2, -170, 15, 13, 27, false); walk(3, -80, 13, 24, 26, true);
          for (let i = 0; i < 5; i++) {
            const wx = 52 + i * 24, beam = lerp(30, 150, S(23.2, 27.6, t)), pass = clamp((beam - wx) / 8, 0, 1);
            const ka = S(17.0, 18.6, t) * (1 - S(28.0 + i * 0.05, 29.0, t));
            const glow = (1 - S(0, 1, pass) * (0.4 + 0.6 * (Math.sin(t * 40 + i * 3) > -0.2 ? 1 : 0))) * S(17.6, 19, t);   /* the gilding flickers out as the light passes */
            const gl = pass >= 1 ? 0 : glow;
            lib.robed({ U, x: sX(wx), y: sY(10 + (i % 2) * 6), h: 30 * Z, t, a: ka, glow: gl * 0.9 + (t < 23.2 ? 0.1 : 0), seed: i * 2, lean: 0 });
            if (t > 27 && t < 29.2) lib.motes({ t, k: 0.7 * S(27.4, 27.9, t) * (1 - S(28.6, 29.2, t)), x0: sX(wx) - 6 * Z, x1: sX(wx) + 6 * Z, y0: sY(10 + (i % 2) * 6) - 30 * Z, y1: sY(10 + (i % 2) * 6), n: 12, speed: 6, dir: 1 });
          }
          if (t > 22.8 && t < 28.4) { const bx = sX(lerp(30, 150, S(23.2, 27.6, t))), k = S(22.8, 23.6, t) * (1 - S(27.6, 28.4, t)); for (let y = Math.round(sY(-48)); y < Math.round(sY(8)); y++) for (let dx = -2; dx <= 2; dx++) px.dpx(Math.round(bx) + dx, y, hex('#fff2c8'), k * 0.5 * (1 - Math.abs(dx) / 3)); lib.halo(bx, sY(-20), 30 * Z, hex('#ffe9a0'), 0.4 * k, 0.9); }
        }
        /* ---- E (36 – 41): the first love left; the cold creeps in at the edges */
        const cold = S(36.3, 40.2, t) * (1 - S(46.4, 50.6, t));
        if (cold > 0.02) { const cc = hex('#0a1030'); for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const e = Math.pow(Math.abs(x - 240) / 240, 1.5) * 0.7 + Math.pow(Math.abs(y - 100) / 100, 2) * 0.3; if (e * cold * 0.85 > px.thr(x, y)) U[y * W + x] = mix(U[y * W + x], cc, 0.55); } }
        /* ---- F (41 – 56): a spark falls from on high; the lights are lit again; the lampstand moves */
        if (t > 41.2 && t < 47) {
          const u = S(41.4, 45.8, t), wx = 0 + 4 * Math.sin(u * 5), wy = lerp(-210, -36, u * u * (1.2 - 0.2 * u));
          for (let k = 0; k < 24; k++) { const f = k / 24, yy = wy - f * 60, a = (1 - f) * 0.8 * S(41.2, 42.4, t) * (1 - S(45.8, 46.6, t)); px.dpx(Math.round(sX(wx - 2 * f)) + ((k * 7) % 3) - 1, Math.round(sY(yy)), hex('#ffe9a0'), a); }
          sparkle(sX(wx), sY(wy), 6, S(41.2, 42.2, t) * (1 - S(45.8, 46.6, t)), '#fff6d0');
        }
        /* ---- G (56 – 63): a shadow creeps along the colonnade and is driven back */
        if (t > 55.8 && t < 63.4) {
          const k = S(56.2, 58.6, t) * (1 - S(60.8, 62.6, t)), front = lerp(-60, 120, S(56.4, 60.2, t)) - 150 * S(60.8, 62.6, t), dk = hex('#030308');
          for (let y = Math.max(0, Math.round(sY(-82))); y < Math.min(H, Math.round(sY(14))); y++) for (let x = 0; x < W; x++) {
            const wx = c.cx + (x - 240) / Z, d = (front - wx) / 90, m = d > 0 ? Math.min(1, d) * (0.65 + 0.35 * px.fbm(x * 0.04 + t * 0.4, y * 0.05, 2, 77)) : 0;
            if (m * k * 0.8 > px.thr(x, y) + 0.1) U[y * W + x] = dk;
          }
          lib.halo(sX(0), ly - 30 * Z, 50 * Z, hex('#ffc060'), 0.25 * k + 0.3 * S(60.6, 62.4, t), 0.9);
        }
        /* ---- H (63 – 77): the Spirit speaks to the assemblies; the tree of life in the Paradise of God */
        const tk = S(70.8, 75.4, t) * (1 - S(76.4, 77.2, t));
        if (tk > 0.01) {
          const tx = sX(0), tbase = sY(-96);
          lib.halo(tx, tbase + 4, 90 * Z, hex('#ffd890'), 0.35 * tk, 0.4);
          for (let i = -34; i <= 34; i++) { const a = tk * (1 - Math.abs(i) / 36) * 0.8; px.dpx(Math.round(tx + i * Z), Math.round(tbase + 2 + (i * i) / 300), hex('#ffe9a0'), a); px.dpx(Math.round(tx + i * Z), Math.round(tbase + 3 + (i * i) / 300), hex('#c8702a'), a * 0.7); }
          lib.treeOfLife({ U, x: Math.round(tx), y: Math.round(tbase), z: 1.7 * Z, t, k: S(70.8, 75.4, t), glow: tk });
        }
        /* ---- I (77 – 80): the flame steadies, and the sea wind carries its smoke north */
        if (t > 76.6) {
          const k = S(76.8, 78.4, t), fx = sX(0) + 0.0, fy = ly - 34 * Z - 2.4 * Z * 1;
          for (let i = 0; i < 160; i++) {
            const age = ((t * 0.55 + i / 70) % 1), x = fx + 4 + age * 300 * (0.5 + 0.5 * px.hash(i, 1, 51)) , y = fy - 6 - age * 22 * (0.4 + px.hash(i, 2, 51)) - Math.sin(age * 9 + i) * 2;
            px.dpx(Math.round(x), Math.round(y), mix(hex('#9a9ab0'), hex('#f0e0d0'), 1 - age), k * 1.4 * Math.min(1, age * 8) * (1 - age * 0.8));
          }
        }
        lib.windStreaks(t, wind * 0.4, mix(hex('#c8b0a0'), hex('#ffffff'), 0.3), 12, hy + 30);
        if (t > 16 && t < 77) lib.motes({ t, k: 0.18, x0: 0, x1: W, y0: 20, y1: 190, n: 22, speed: 6, dir: 1 });
      }

      function sparkle(x, y, r, k, colHex) {
        if (k <= 0.01) return;
        x = Math.round(x); y = Math.round(y);
        lib.halo(x, y, r * 2.2, hex(colHex), 0.5 * k, 1);
        for (let d = 0; d <= r; d++) { const a = k * Math.pow(1 - d / r, 1.3); px.dpx(x + d, y, hex('#ffffff'), a); px.dpx(x - d, y, hex('#ffffff'), a); px.dpx(x, y + d, hex('#ffffff'), a); px.dpx(x, y - d, hex('#ffffff'), a); }
        px.set(x, y, hex('#ffffff'));
      }

      /* ---------------------------------------------------------------- continuity: Episode 5's last frame */
      const rh = (x) => 8 * px.fbm(x * 0.012 + 3, 1.7, 3, 5) + 4 * Math.sin(x * 0.02);
      function drawLastFrame(t) {
        const U = U0(), hy = 156, dk = [hex('#080a16'), hex('#0d1022'), hex('#141830'), hex('#1c2142')];
        lib.seascape({ U, t: 59.9 + t * 0.2, dawn: 0.05, hy: hy - 22, sunX: -400, rise: -60, camX: 0, camY: 0, wind: 0.2, amp: 0.5, rays: 0, patmosPar: 0.5, patmosScale: 1, cloudOffA: 311, cloudOffB: 211, stars: 1 });
        for (let x = 0; x < W; x++) { const top = hy - 22 + 6 + rh(x) * 0.7; for (let y = Math.max(0, Math.round(top)); y < H; y++) { const d = (y - top) / 40; U[y * W + x] = px.ramp(dk, clamp(0.15 + d * 0.5, 0, 1), x, y); } }
        const xs = [240, 390, 540, 690, 840, 990, 1140], lit = [1, 1, 1, 1, 1, 1, 1];
        lib.cities({ xs, hy, lit, t, col: hex('#1a1d36'), rim: hex('#8a7a8a'), hazeCol: hex('#2a2c4c'), sunX: 240, amber: hex('#ffb85a') });
        const grow = 1 + 0.06 * S(0, 4, t);
        lib.halo(240, hy - 40, 130 * grow, hex('#ffd890'), 0.28 + 0.1 * S(0, 3, t), 0.8);
        lib.lampstand({ U, x: 240, y: hy - 6, z: 1.75, lit: 1, pop: 0.5 + 0.4 * Math.sin(t * 3), t, seed: 11, lean: 0, a: 1 });
        lib.halo(240, hy - 6 - 30 * 1.75, 56, hex('#ffc060'), 0.7, 0.9);
        sparkle(240, hy - 106, 8, 1, '#f4f8ff');
        for (let y = hy - 106; y < hy - 6 - 34 * 1.75; y++) px.dpx(240, y, hex('#ffe8a8'), 0.4);
        lib.lampstand({ U, x: 390, y: hy - 6, z: 1.15, lit: 1, pop: 0, t, seed: 12, lean: 0, a: 1 });
        lib.halo(390, hy - 36, 30, hex('#ffc060'), 0.3, 0.9);
      }

      const gold = [hex('#fff6d0'), hex('#ffe9a0'), hex('#ffd070'), hex('#f2a444'), hex('#c8702a'), hex('#8a4420')];
      function drawTitle(t) {
        const t0 = 1.6, t1 = 4.9, k = S(t0, t0 + 1.0, t) * (1 - S(t1 - 0.8, t1, t));
        if (k <= 0.01) return;
        const sc = 3, word = 'THE FIRST LOVE', tw = px.textWidth(word, sc, 1), x0 = Math.round(240 - tw / 2), y0 = 66, fo = 1 - S(t1 - 0.8, t1, t);
        px.scrim(240, y0 + 16, 224, 40, k * 1.05);
        for (let i = 0; i < word.length; i++) {
          const ka = clamp((t - t0 - 0.1 - i * 0.05) / 0.6, 0, 1) * fo; if (ka <= 0) continue;
          const lx = x0 + i * 6 * sc, ch = word[i];
          px.text(ch, lx + 2, y0 + 2, sc, hex('#1a0c16'), ka);
          const sweep = lerp(-40, 440, S(t0 + 1.1, t0 + 2.6, t));
          px.text(ch, lx, y0, sc, (cc, r, X, Y) => { let col = px.ramp(gold, (r + 1) / (7 * sc), X, Y); const d = (X - Y * 0.7) - sweep; if (d > 0 && d < 8) col = hex(d < 4 ? '#ffffff' : '#fff0c0'); return col; }, ka);
        }
        const sub = 'REVELATION · EPISODE 6', sw = px.textWidth(sub, 2, 1), sx0 = Math.round(240 - sw / 2), sy0 = y0 - 17, ks = S(t0 - 0.1, t0 + 0.8, t) * fo;
        px.text(sub, sx0 + 1, sy0 + 1, 2, hex('#0a0814'), ks); px.text(sub, sx0, sy0, 2, hex('#ffd48a'), ks);
        const rule = Math.round(lerp(0, 150, S(t0 + 0.6, t0 + 2.0, t))); px.hline(240 - rule, 240 + rule, y0 + 7 * sc + 8, mix(hex('#ffd48a'), hex('#0a0814'), 0.15 + (1 - k) * 0.8));
      }

      /* a dithered crossfade of two renderings */
      function dissolve(main, a, k) { for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (px.thr(x, y) >= k) main[y * W + x] = a[y * W + x]; }

      return {
        render(t) {
          const main = px.cur();
          const X1 = S(3.4, 4.8, t), X2 = S(76.4, 77.2, t);
          if (X1 > 0 && X1 < 1) { px.target(sA); drawLastFrame(t); px.target(main); drawEphesus(t); dissolve(main, sA, X1); }
          else if (t < 3.4) drawLastFrame(t);
          else drawEphesus(t);
          px.post({ vignette: 1, fade: 0, flash: 0 });
          drawTitle(t);
          px.fadeOnly(S(79.4, 80, t) * 0);
        },
      };
    },

    score(A, from) {
      const D2 = 73.42, D3 = 146.83, A3 = 220, D4 = 293.66, F4 = 349.23, Fs4 = 369.99, G4 = 392, A4 = 440, B4 = 493.88, D5 = 587.33, E5 = 659.25, Fs5 = 739.99, A5 = 880, B5 = 987.77, D6 = 1174.66, E6 = 1318.5, Fs6 = 1479.98, A6 = 1760, B6 = 1975.5, D7 = 2349.3;
      /* continuity: the last chord of Episode 5, and the first lamp */
      A.drone(0, 79.6, D2, { gain: 0.1, attack: 0.4, release: 2.0 });
      A.choir(0, 4.8, [D3, A3, D4, Fs4, A4, D5], { gain: 0.07, attack: 0.3, release: 2.2, vowel: 1.0 });
      A.bell(0.2, D5, { gain: 0.1, dur: 5 }); A.shimmer(0.3, A5, { dur: 4, gain: 0.05 });
      A.sea(0, 79, { gain: 0.05, attack: 1.4 });
      A.wind(0, 30, { gain: 0.04, bright: 0.6, attack: 1.0 });
      /* v1 (5 - 16): He who holds the seven stars and walks among the seven lampstands: seven bells as the light passes */
      A.choir(4.6, 16.4, [D3, A3, D4, Fs4, A4], { gain: 0.05, attack: 1.6, release: 1.8, vowel: 1.1 });
      [[7.0, D5], [8.3, E5], [9.6, Fs5], [10.9, A5], [12.2, B5], [13.5, D6], [14.8, E6]].forEach(([t, f]) => { A.bell(t, f, { gain: 0.085, dur: 4.2 }); A.shimmer(t + 0.05, f / 2, { dur: 2.2, gain: 0.03 }); });
      [B5, D6, E6, Fs6, A6, B6, D7].forEach((f, i) => A.bell(8.0 + i * 0.4, f, { gain: 0.035, dur: 3 }));
      /* v2 (16 - 29): toil, a slow labouring pulse; then the testing, and each false light going out */
      for (let t = 16.6; t < 23; t += 1.3) A.boom(t, { freq: 55, gain: 0.12, dur: 0.9 });
      A.brass(16.6, 29, D3, { gain: 0.055, attack: 1.2, release: 2.0, sweep: [[16.6, 500], [23, 900], [29, 500]] });
      A.choir(16.6, 29.4, [A3, D4, Fs4, A4], { gain: 0.045, attack: 1.4, release: 2.0, vowel: 0.9 });
      A.noise({ t0: 23.2, t1: 27.6, gain: [[23.2, 0], [25.4, 0.09], [27.6, 0]], filter: { type: 'bandpass', freq: [[23.2, 600], [27.6, 3200]], q: 0.8 }, wet: 0.5, attack: 0.2, release: 0.4 });
      [24.0, 25.0, 26.0, 26.9, 27.5].forEach((t, i) => A.voice({ type: 'sine', freq: [[t, 466], [t + 0.8, 311]], t0: t, t1: t + 0.9, gain: 0.05, attack: 0.02, release: 0.7, wet: 0.6 }));
      /* v3 (29 - 36): endurance: a steady warm chord, one patient bell */
      A.choir(29.4, 36.4, [A3, D4, Fs4, A4, D5], { gain: 0.06, attack: 1.0, release: 1.8, vowel: 1.0 });
      for (let t = 30; t < 36; t += 1.6) A.bell(t, A5, { gain: 0.05, dur: 3 });
      A.wind(29.4, 36, { gain: 0.07, bright: 0.7, attack: 0.5 });
      /* v4 (36 - 41): you left your first love: the chord goes minor and sinks */
      A.choir(36.2, 41.6, [D3, A3, D4, F4, A4], { gain: 0.055, attack: 0.6, release: 2.4, vowel: 0.8 });
      [[36.3, A5], [37.8, F4 * 4], [39.3, D5]].forEach(([t, f]) => A.bell(t, f, { gain: 0.07, dur: 3.6 }));
      A.voice({ type: 'sine', freq: [[36.3, 440], [40.4, 196]], t0: 36.3, t1: 40.6, gain: 0.06, attack: 0.3, release: 0.6, wet: 0.6 });
      /* v5 (41 - 56): remember where you have fallen; repent; do the first works; the lampstand moved out of its place */
      A.voice({ type: 'sine', freq: [[41.6, 1500], [46.0, 330]], t0: 41.6, t1: 46.1, gain: 0.05, attack: 0.1, release: 0.4, wet: 0.7 });
      A.shimmer(41.7, A5, { dur: 4, gain: 0.04 });
      A.boom(46.1, { freq: 44, gain: 0.35, dur: 2.6 });
      [D4, Fs4, A4, D5, Fs5, A5, D6].forEach((f, i) => A.bell(47.0 + i * 0.5, f, { gain: 0.08, dur: 4 }));
      A.choir(46.4, 51.2, [D3, A3, D4, Fs4, A4], { gain: 0.06, attack: 1.6, release: 1.8, vowel: 1.1 });
      A.riser(49.4, 51.4, { f0: 300, f1: 3200, gain: 0.06 });
      A.boom(51.4, { freq: 38, gain: 0.55, dur: 4 });
      A.noise({ t0: 51.4, t1: 54, gain: [[51.4, 0.08], [53, 0.05], [54, 0]], filter: { type: 'lowpass', freq: [[51.4, 1400], [54, 200]], q: 0.7 }, wet: 0.4, attack: 0.1, release: 0.4 });
      A.choir(51.6, 54.6, [D3, A3, D4, F4], { gain: 0.04, attack: 0.5, release: 1.4, vowel: 0.7 });
      A.bell(54.8, A5, { gain: 0.1, dur: 5 }); A.choir(54.8, 57, [D3, A3, D4, Fs4, A4, D5], { gain: 0.065, attack: 0.6, release: 2.0, vowel: 1.1 });
      /* v6 (56 - 63): the works of the Nicolaitans: a low shadow, then driven back */
      A.voice({ type: 'sawtooth', freq: 49, t0: 56.4, t1: 61.4, gain: 0.05, attack: 1.8, release: 1.0, wet: 0.5, filter: { type: 'lowpass', freq: 380, q: 1 } });
      A.noise({ t0: 56.4, t1: 61.4, gain: [[56.4, 0], [59, 0.07], [61.4, 0]], filter: { type: 'lowpass', freq: [[56.4, 300], [61.4, 900]], q: 0.8 }, wet: 0.4, attack: 0.5, release: 0.4 });
      A.riser(60.6, 62.5, { f0: 260, f1: 4200, gain: 0.07 });
      A.bell(62.5, D6, { gain: 0.1, dur: 4 }); A.boom(62.5, { freq: 46, gain: 0.3, dur: 2.4 });
      /* v7 (63 - 77): he who has an ear: the Spirit's wind; the tree of life */
      A.wind(62.6, 78, { gain: 0.09, bright: 0.9, attack: 2.4 });
      A.choir(63, 77.6, [D3, A3, D4, Fs4, A4, D5], { gain: 0.07, attack: 2.0, release: 2.6, vowel: 1.2 });
      A.brass(70, 77, D3, { gain: 0.07, attack: 1.8, release: 2.2, sweep: [[70, 500], [74, 1700], [77, 800]] });
      [D6, E6, Fs6, A6, B6, D7].forEach((f, i) => { A.bell(70.7 + i * 0.32, f, { gain: 0.08, dur: 4.4 }); A.shimmer(70.75 + i * 0.32, f / 2, { dur: 2.4, gain: 0.03 }); });
      A.boom(70.6, { freq: 41, gain: 0.5, dur: 4 });
      A.bell(77.2, D5, { gain: 0.11, dur: 5 }); A.shimmer(77.3, A5, { dur: 5, gain: 0.05 });
      A.noise({ t0: 76.8, t1: 79.6, gain: [[76.8, 0.05], [78.5, 0.05], [79.6, 0]], filter: { type: 'bandpass', freq: [[76.8, 900], [79.6, 1600]], q: 0.5 }, wet: 0.4, attack: 0.4, release: 0.8 });
    },
  });
})();
