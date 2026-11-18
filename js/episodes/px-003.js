/* ============================================================================
 *  REVELATION · PIXEL EDITION · Episode 3 · On the Lord's Day · Revelation 1:9–11
 *  2D pixel-art cut (480x200, dithered palettes). Same verses, cues, timing, score
 *  and handoff as the original 3D episode; only the look has changed.
 *
 *  0:00  opens on Episode 2's last frame: John on the cliff, the seven lamps in an arc
 *        in the sky, the glory fading into a low sun
 *  0:01  title card: REVELATION · EPISODE 3 · ON THE LORD'S DAY
 *  0:09  v9  "I John ... was on the isle that is called Patmos": the isle from the sea,
 *            the rocky shore, a small figure above it; the camera pushes in to the
 *            surf breaking on the rocks below, then tilts up to John's feet
 *  0:23  v10 "I was in the Spirit on the Lord's day": close behind John, the world
 *            hushes, light rises round him; at 0:29.4 the voice like a trumpet
 *            (flash, sub-bass), a whip-pan to look behind: the grass laid flat, dust
 *            rolling away; a whip back to the sea
 *  0:32  v11 "What you see, write in a book ...": the sound crosses the sea in rings;
 *            the camera tilts up and the seven names are written in light, one by one
 *  0:49  wide: John small under the seven; down to the man beneath; he begins to turn
 *  1:00  fade (handoff to Episode 4: John turns around)
 * ========================================================================== */
(function () {
  'use strict';
  const Aura = window.Aura, px = Aura.px, lib = Aura.pxlib;
  const { W, H, clamp, lerp, sstep, hex, mix } = px;
  const S = sstep;
  const ease = Aura.math.ease;

  Aura.define(3, {
    pixel: true,
    duration: 60,

    /* subtitle cues (text comes from js/scripture-web.js); timed exactly like the 3D cut */
    cues: [
      { ref: '1:9', t0: 9.0, t1: 23.0 },
      { ref: '1:10', t0: 23.6, t1: 32.0 },
      { ref: '1:11', t0: 32.6, t1: 47.8 },
    ],
    titles: [],   /* title card is drawn in pixels by the renderer */

    build(ctx) {
      const U0 = () => px.cur();
      const PX_ = 140;                                       /* cliff pivot (same as Episodes 1 and 2) */
      const TR = 29.4;                                       /* the loud voice */
      const BURSTS = [11.2, 14.9, 18.7, 22.4];               /* the surf, on the score's sub-bass hits */
      const NAMES = ['EPHESUS', 'SMYRNA', 'PERGAMUM', 'THYATIRA', 'SARDIS', 'PHILADELPHIA', 'LAODICEA'];
      const IGN = (i) => 42.0 + i * 0.95;                    /* each name is written as the score rings its bell */
      const RINGS = []; for (let i = 0; i < 9; i++) RINGS.push(TR + 0.1 + i * 1.1);
      const sA = px.surface().u32, sB = px.surface().u32, sC = px.surface().u32;

      /* a smooth path through keyframes [[t, v], ...] (Hermite, tangents from neighbours) */
      const curve = (t, k) => {
        if (t <= k[0][0]) return k[0][1];
        const n = k.length; if (t >= k[n - 1][0]) return k[n - 1][1];
        let i = 1; while (t > k[i][0]) i++;
        const a = k[i - 1], b = k[i], h = b[0] - a[0], u = (t - a[0]) / h;
        const m0 = i > 1 ? (b[1] - k[i - 2][1]) / (b[0] - k[i - 2][0]) : 0, m1 = i < n - 1 ? (k[i + 1][1] - a[1]) / (k[i + 1][0] - a[0]) : 0;
        const u2 = u * u, u3 = u2 * u;
        return (2 * u3 - 3 * u2 + 1) * a[1] + (u3 - 2 * u2 + u) * h * m0 + (-2 * u3 + 3 * u2) * b[1] + (u3 - u2) * h * m1;
      };
      /* eased steps between keyframes (stop and start at every key) */
      const kf = (t, k) => { if (t <= k[0][0]) return k[0][1]; for (let i = 1; i < k.length; i++) if (t <= k[i][0]) return lerp(k[i - 1][1], k[i][1], S(k[i - 1][0], k[i][0], t)); return k[k.length - 1][1]; };

      /* ---------------- world curves ---------------- */
      const dawnAt = (t) => kf(t, [[0, 0.64], [12, 0.54], [44, 0.27], [60, 0.3]]);      /* a low, deepening dawn */
      const riseAt = (t) => kf(t, [[0, -20], [7, -4], [11, 3], [44, -16], [60, -16]]);   /* the glory settles into a low sun */
      const sunX = 262;
      const windAt = (t) => {
        let w = lerp(0.56, 0.5, S(0, 9, t));
        w = lerp(w, 0.05, S(23.4, 26, t));
        if (t >= 28.8) w = 0.02;
        if (t >= TR) w = 0.5 * S(30.2, 36, t) + 0.9 * Math.exp(-(t - TR) / 0.9);
        return w + 0.28 * S(52, 60, t);
      };
      const gloryK = (t) => 0.82 * (1 - S(0.5, 8.5, t));                       /* Episode 2's glory, fading */
      const spiritK = (t) => S(23.4, 26.0, t) * (1 - S(29.25, 29.4, t));
      const turnK = (t) => S(53.6, 60, t);
      const glowK = (t) => S(53.5, 59.5, t);                                    /* the glory that finds John */
      const shakeAt = (t) => (t >= TR && t < 34 ? 2.6 * Math.exp(-(t - TR) / 0.55) + 0.5 * Math.exp(-(t - TR) / 3) : 0);

      /* ---------------- cliff camera (Episodes 1 and 2: z, ox, oy, hy) ---------------- */
      function cam1(t) {
        let z, ox, oy, hy, camX;
        if (t < 12) {                                              /* Episode 2's last frame, then a slow drift */
          z = kf(t, [[0, 2.0], [10, 1.88]]); ox = kf(t, [[0, 65], [10, 60]]); oy = kf(t, [[0, 30], [10, 28]]); hy = kf(t, [[0, 140], [10, 134]]);
          camX = -274.3 - 0.25 * t;
        } else if (t < 31.9) {                                     /* close behind John: the Spirit */
          z = kf(t, [[23.2, 1.7], [29.4, 2.3]]); ox = kf(t, [[23.2, 72], [29.4, 90]]); oy = kf(t, [[23.2, 28], [29.4, 25]]); hy = kf(t, [[23.2, 128], [29.4, 116]]);
          camX = -280 - 0.25 * (t - 12);
        } else if (t < 41.5) {                                     /* the sound crosses the sea */
          z = kf(t, [[31.9, 1.8], [41.5, 1.7]]); ox = kf(t, [[31.9, 10], [41.5, 16]]); oy = 28; hy = kf(t, [[31.9, 118], [41.5, 112]]);
          camX = -285 - 0.25 * (t - 12);
        } else if (t < 49.5) {                                     /* tilt up to the seven names */
          z = kf(t, [[41.5, 1.7], [49.5, 1.3]]); ox = kf(t, [[41.5, 16], [49.5, 100]]);
          hy = curve(t, [[41.5, 112], [45.5, 150], [49.5, 176]]); oy = 28 + (hy - 112);
          camX = -290 - 0.25 * (t - 12);
        } else if (t < 54) {                                       /* wide: John small under the seven */
          z = kf(t, [[49.5, 1.3], [54, 0.95]]); ox = 100; hy = kf(t, [[49.5, 176], [54, 150]]); oy = kf(t, [[49.5, 92], [54, 28]]);
          camX = -292;
        } else if (t < 56.2) {                                     /* down to the man beneath them */
          z = kf(t, [[54, 0.95], [56.2, 1.9]]); ox = kf(t, [[54, 100], [56.2, 70]]); hy = kf(t, [[54, 150], [56.2, 124]]); oy = kf(t, [[54, 28], [56.2, 27]]);
          camX = -292;
        } else {                                                   /* he begins to turn */
          z = kf(t, [[56.2, 1.9], [60, 2.3]]); ox = kf(t, [[56.2, 70], [60, 78]]); hy = kf(t, [[56.2, 124], [60, 118]]); oy = 27;
          camX = -292;
        }
        return { z, ox, oy, hy, camX };
      }

      /* ---------------- the seven lamps (they hang where Episode 2 left them, then spread to carry their names) */
      const lampPos = (i, t, hy) => {
        const u = (i - 3) / 3, spread = lerp(84, 180, S(40.5, 47, t)), K = lerp(96, 106, S(40.5, 47, t));
        return { x: 240 + u * spread, y: hy - K + 20 * u * u, u };
      };
      const CITY_X = [28, 82, 136, 190, 348, 404, 460];
      /* clouds of Episode 2's glory: they draw apart and fade. [sprite, inner offset, dy, layer] */
      const CL = [
        [3, -30, -56, 0], [4, 100, -50, 0], [1, 236, -54, 0], [5, 372, -48, 0],
        [0, -8, -34, 1], [2, 126, -28, 1], [5, 268, -32, 1], [1, 400, -26, 1],
        [4, 4, -9, 1], [3, 150, -4, 1], [0, 298, -10, 2],
        [2, -14, 14, 2], [5, 118, 20, 2], [1, 246, 12, 2], [4, 372, 18, 2],
        [0, 20, 38, 2], [3, 176, 44, 2], [2, 330, 40, 2],
        [4, 60, 58, 2], [1, 230, 62, 2],
      ];
      const SW = [176, 150, 196, 132, 164, 184];

      /* ============================================================ CLIFF SCENE */
      function drawCliff(t) {
        const U = U0(), c1 = cam1(t), z = c1.z, ox = c1.ox, oy = c1.oy, hy = c1.hy;
        const dawn = dawnAt(t), rise = riseAt(t), wind = windAt(t), gk = gloryK(t), spirit = spiritK(t), gl = glowK(t);
        const info = lib.seascape({ U, t, dawn, hy, sunX, rise, camX: c1.camX, camY: 0, wind: Math.min(wind, 0.9), amp: 1 + Math.min(wind, 1) * 1.5, rays: 0.05 * (1 - S(9, 14, t)), patmosPar: 0.62, patmosScale: 1, cloudOffA: 611, cloudOffB: 461 });
        const horizon = info.horizon;
        const GX = 240, GY = hy - 66;

        /* the seven small cities on the horizon; each brightens as its name is written */
        const lamps = []; for (let i = 0; i < 7; i++) lamps.push(lampPos(i, t, hy));
        const lit = []; for (let i = 0; i < 7; i++) lit.push((0.4 + 0.6 * S(IGN(i), IGN(i) + 1.4, t)) * (1 - 0.35 * S(54, 59, t)));
        lib.cities({ a: 1, xs: CITY_X.map((x) => x + 0.78 - 0.06 * (c1.camX + 274.3)), hy, lit, t, col: mix(horizon, hex('#0a0c20'), 0.84), rim: mix(hex('#6a7aa8'), hex('#ffc27a'), dawn), hazeCol: horizon, sunX });

        /* the sound of the voice, rolling over the sea in rings */
        if (t >= TR && t < 43.5) {
          const rc = mix(horizon, hex('#ffffff'), 0.55);
          lib.waveRings({ cx: M0(c1).sx(PX_) + 36, cy: 200, t, starts: RINGS, speed: 88, ky: 0.21, yMin: hy + 1, yMax: H - 1, life: 4.4, crest: hex('#fff2d8'), col: mix(rc, hex('#5a78b0'), 0.4), dark: hex('#0a1430') });
        }
        /* Episode 2's glory and clouds, drifting away */
        if (gk > 0.004) {
          lib.glory({ cx: GX, cy: GY, k: gk, t, hy, rays: 0.9 });
          const out = 170 * S(0.4, 8.4, t), ca = 1 - S(1.5, 8.0, t), lk = Math.max(0.3, gk), order = CL.map((c, n) => n).sort((a, b) => CL[a][3] - CL[b][3]);
          if (ca > 0.01) for (const side of [-1, 1]) for (const n of order) {
            const [sp, off, dy, layer] = CL[n], w = SW[sp];
            const x = GX + side * (180 + out + off + w / 2 + (layer === 0 ? 14 : 0)), y = GY + dy + Math.sin(t * 0.5 + n) * 0.8;
            lib.cloud({ spr: sp, x, y, flip: side < 0, lx: GX, ly: GY, k: lk, tone: layer === 0 ? 0.6 : layer === 1 ? 0.9 : 1.0, a: ca });
          }
          lib.seaGlow(GX, hy, gk * 0.9, t);
          lib.halo(GX, GY, 30 * gk, hex('#ffffff'), 0.9 * gk);
          if (gk > 0.2) lib.flare(GX, GY, 0.55 * gk, 1);
        }

        /* the seven lamps, and their reflections on the sea */
        lamps.forEach((L, i) => {
          const pop = Math.exp(-Math.pow((t - IGN(i) - 0.25) / 0.45, 2));
          lib.lampGlint(L.x, hy, 0.3 + 0.6 * Math.min(1, pop), t, i, 24);
        });
        lamps.forEach((L, i) => {
          const pop = Math.exp(-Math.pow((t - IGN(i) - 0.25) / 0.45, 2)), fl = 1 - 0.25 * S(54, 59, t);
          lib.flame({ x: L.x, y: L.y, k: fl, pop, t, seed: i, s: 2.25, glow: 1 + 0.3 * pop });
        });
        /* the seven names, written in light under the lamps (two rows so that they never touch) */
        for (let i = 0; i < 7; i++) {
          const L = lamps[i], a = (1 - 0.5 * S(54, 59, t)) * (1 - 0.0), k = S(IGN(i), IGN(i) + 1.6, t);
          if (k <= 0.004) continue;
          const pop = Math.exp(-Math.pow((t - IGN(i) - 0.4) / 0.35, 2));
          lib.nameSign(NAMES[i], L.x, L.y + (i % 2 ? 44 : 17), { k, a, t, sc: 2, pop, seed: i, glow: 1 });
        }

        /* ------------------------------------------------ foreground: cliff, grass, John */
        const gy = lib.groundY(PX_), c = { z, pX: PX_, pY: gy, ox, oy }, M = lib.camMap(c);
        const jx = M.sx(PX_), jy = M.sy(gy) + 3 * z, jh = 46 * z;
        const lightX = sunX, dawnFg = Math.max(dawn, 0.9 * gk + 0.0, gl);
        const dawnGround = lerp(dawn, 1, 0.55 * gl + 0.9 * gk);
        const l = { U, dawn: dawnGround, sunX: lightX, lit: 1 };
        /* light behind him: the Spirit, then the glory that finds him */
        if (spirit > 0.01) { lib.halo(jx, jy - jh * 0.55, 62 * z, hex('#ffd890'), 0.55 * spirit, 0.9); lib.halo(jx, jy - jh * 0.55, 30 * z, hex('#fff0c0'), 0.45 * spirit, 0.95); }
        if (gl > 0.01) { lib.halo(jx, jy - jh * 0.55, 120 * z, hex('#ffb85a'), 0.5 * gl, 0.9); lib.halo(jx, jy - jh * 0.55, 54 * z, hex('#fff0c0'), 0.55 * gl); }
        lib.cliffGround(c, l);
        lib.grass(c, l, 'edge', t, Math.min(wind, 1));
        lib.johnTurn({ U, x: jx, y: jy, h: jh, t, wind: Math.min(wind, 1), sunX: lightX, lit: 1, dawn: dawnFg, ang: 1.25 * turnK(t), dir: 1 });
        lib.grass(c, l, 'front', t, Math.min(wind, 1));
        /* motes of light: "in the Spirit", and again around the names */
        const mk = spirit * 0.95 + 0.3 * S(40, 46, t) * (1 - S(56, 60, t));
        if (mk > 0.02) lib.motes({ t, k: mk, x0: spirit > 0.2 ? jx - 70 : 0, x1: spirit > 0.2 ? jx + 70 : W, y0: spirit > 0.2 ? jy - jh * 1.2 : 0, y1: spirit > 0.2 ? jy : hy + 30, n: spirit > 0.2 ? 80 : 60, speed: 12, dir: -1 });
        lib.windStreaks(t, Math.min(wind, 1) * 0.6 + 0.05, mix(horizon, hex('#ffffff'), 0.35), 10, hy + 40);
      }
      const M0 = (c1) => lib.camMap({ z: c1.z, pX: PX_, pY: lib.groundY(PX_), ox: c1.ox, oy: c1.oy });

      /* ============================================================ SHORE SCENE */
      function shoreCam(t) {
        const z = curve(t, [[8.7, 0.5], [16.5, 0.72], [19, 0.96], [22, 0.96], [23.7, 0.94]]);
        const Jx = curve(t, [[8.7, 380], [16.5, 356], [19, 330], [23.7, 322]]);
        const Jy = curve(t, [[8.7, 66], [16.5, 48], [19, 8], [22, 16], [23.4, 62], [23.7, 66]]);
        return { z, Jx, Jy };
      }
      function drawShore(t) {
        const U = U0(), sc = shoreCam(t), dawn = dawnAt(t), rise = riseAt(t), wind = windAt(t);
        const ys = Math.round(sc.Jy + 150 * sc.z), hy = Math.max(60, Math.min(199, Math.round(ys - (22 + 24 * sc.z))));
        const camX = -30 + 3.2 * (t - 9);
        const surf = 1 - 0.65 * S(23.4, 26, t);
        lib.seascape({ U, t, dawn, hy, sunX, rise, camX, camY: 0, wind: Math.min(wind, 0.9), amp: 1 + wind * 1.5, rays: 0.1, patmosPar: 0.62, patmosScale: 1.15, cloudOffA: 611, cloudOffB: 461 });
        lib.shore({ U, Jx: sc.Jx, Jy: sc.Jy, z: sc.z, t, dawn, sunX, lit: 1, bursts: BURSTS, calm: 1 });
        /* spray thrown from the foot of the cliff at each wave */
        BURSTS.forEach((tb, i) => lib.spray({ t, tb, Jx: sc.Jx, Jy: sc.Jy, z: sc.z, wx: lib.shoreFoot + (i % 2 ? 10 : -4), wy: 147, n: 80, seed: i, dir: 1 }));
        /* John, small, above it all */
        const jh = 46 * sc.z, lightX = sunX;
        lib.halo(Math.round(sc.Jx + 6 * sc.z), Math.round(sc.Jy - jh * 0.5), 46 * sc.z + 10, hex('#ff9a60'), 0.4 * (1 - S(22.5, 23.4, t) * 0), 0.9);
        lib.john({ U, x: Math.round(sc.Jx + 6 * sc.z), y: Math.round(sc.Jy + 1), h: jh, t, wind: Math.min(wind, 0.7), sunX: lightX, lit: 1, dawn: Math.max(dawn, 0.55) });
        lib.windStreaks(t, wind * 0.5, mix(hex('#9fb4d8'), hex('#ffffff'), 0.3), 8, ys + 30);
      }

      /* ============================================================ INLAND SCENE (behind him) */
      function drawInland(t) {
        const U = U0(), a = t - TR;
        const flat = S(TR + 0.05, TR + 0.5, t) * (1 - 0.4 * S(30.8, 32.4, t));
        lib.inland({ U, t, hy: 88, dawn: dawnAt(t), flat, wind: 1, lit: 0.55 });
        lib.waveRings({ cx: 240, cy: 232, t, starts: [TR + 0.05, TR + 0.55, TR + 1.2, TR + 1.9], speed: 300, ky: 0.27, yMin: 90, yMax: H - 1, life: 2.7, crest: hex('#fff0d0'), col: hex('#c8a880'), dark: hex('#150f1c') });
        /* the pressure of the voice: a pale veil flashing over the land, then thinning */
        if (a >= 0 && a < 1.0) lib.halo(240, 120, 230, hex('#ffe9c0'), 0.5 * Math.exp(-a / 0.4), 0.7);
        lib.shoulder({ U, k: S(TR - 0.2, TR + 0.5, t), t, dawn: dawnAt(t) });
      }

      /* ============================================================ COMPOSITING */
      function whip(F, Asrc, Bsrc, k) {
        const s = Math.round(clamp(k, 0, 1) * W), blur = 54 * Math.sin(Math.PI * clamp(k, 0, 1));
        for (let y = 0; y < H; y++) {
          const row = y * W;
          for (let x = 0; x < W; x++) {
            const tap = (px.thr(x, y) * 4) | 0, X = x + s + Math.round((tap / 3 - 0.5) * blur);
            F[row + x] = X < W ? Asrc[row + (X < 0 ? 0 : X)] : Bsrc[row + (X - W >= W ? W - 1 : X - W)];
          }
        }
      }
      function dissolve(F, Asrc, Bsrc, k) {
        for (let y = 0; y < H; y++) { const row = y * W; for (let x = 0; x < W; x++) F[row + x] = px.thr(x, y) < k ? Bsrc[row + x] : Asrc[row + x]; }
      }
      function shiftInto(dst, src, dx, dy) {
        for (let y = 0; y < H; y++) { const sy = clamp(y - dy, 0, H - 1) * W, row = y * W; for (let x = 0; x < W; x++) dst[row + x] = src[sy + clamp(x - dx, 0, W - 1)]; }
      }
      const draw = (buf, fn, t) => { px.target(buf); fn(t); };

      /* =============================================================== TITLES */
      const gold = [hex('#fff6d0'), hex('#ffe9a0'), hex('#ffd070'), hex('#f2a444'), hex('#c8702a'), hex('#8a4420')];
      function drawTitle(t) {
        const k = S(1.3, 2.3, t) * (1 - S(4.0, 4.8, t));
        if (k <= 0.01) return;
        const sc = 4, word = 'ON THE LORD’S DAY', tw = px.textWidth(word, sc, 1), x0 = Math.round(240 - tw / 2), y0 = 62;
        px.scrim(240, y0 + 20, 232, 44, k * 1.05);
        for (let i = 0; i < word.length; i++) {
          const ka = clamp((t - 1.4 - i * 0.06) / 0.6, 0, 1) * (1 - S(4.0, 4.8, t));
          if (ka <= 0) continue;
          const lx = x0 + i * 6 * sc, ch = word[i];
          px.text(ch, lx + 3, y0 + 3, sc, hex('#1a0c16'), ka);
          px.text(ch, lx + 2, y0 + 2, sc, hex('#3a1a1c'), ka);
          const sweep = lerp(-40, 440, S(2.4, 3.9, t));
          px.text(ch, lx, y0, sc, (cc, r, X, Y) => {
            let col = px.ramp(gold, (r + 1) / (7 * sc), X, Y);
            const d = (X - Y * 0.7) - sweep; if (d > 0 && d < 8) col = hex(d < 4 ? '#ffffff' : '#fff0c0');
            return col;
          }, ka);
        }
        const sub = 'REVELATION · EPISODE 3', sw = px.textWidth(sub, 2, 1), sx0 = Math.round(240 - sw / 2), sy0 = y0 - 17, ks = S(1.1, 2.0, t) * (1 - S(4.0, 4.8, t));
        px.text(sub, sx0 + 1, sy0 + 1, 2, hex('#0a0814'), ks);
        px.text(sub, sx0, sy0, 2, hex('#ffd48a'), ks);
        const rule = Math.round(lerp(0, 150, S(1.8, 3.2, t))), ry = y0 + 7 * sc + 8;
        px.hline(240 - rule, 240 + rule, ry, mix(hex('#ffd48a'), hex('#0a0814'), 0.15 + (1 - k) * 0.8));
      }

      return {
        render(t) {
          const main = px.cur();
          const sh = shakeAt(t), dx = sh > 0.05 ? Math.round(Math.sin(t * 61) * sh) : 0, dy = sh > 0.05 ? Math.round(Math.sin(t * 47 + 1) * sh * 0.7) : 0;
          const F = (dx || dy) ? sC : main;
          /* which shot is it? */
          if (t < 8.75) draw(F, drawCliff, t);
          else if (t < 9.25) { draw(sA, drawCliff, 8.75); draw(sB, drawShore, t); dissolve(F, sA, sB, S(8.75, 9.25, t)); }
          else if (t < 23.15) draw(F, drawShore, t);
          else if (t < 23.65) { draw(sA, drawShore, t); draw(sB, drawCliff, t); dissolve(F, sA, sB, S(23.15, 23.65, t)); }
          else if (t < TR) draw(F, drawCliff, t);
          else if (t < TR + 0.55) { draw(sA, drawCliff, t); draw(sB, drawInland, t); whip(F, sA, sB, S(TR, TR + 0.55, t)); }
          else if (t < 31.9) draw(F, drawInland, t);
          else if (t < 32.45) { draw(sA, drawInland, t); draw(sB, drawCliff, t); whip(F, sA, sB, S(31.9, 32.45, t)); }
          else draw(F, drawCliff, t);
          if (F !== main) shiftInto(main, F, dx, dy);
          px.target(main);

          /* grade: the voice flashes; warm glory at the end; fades in and out of black */
          let flash = t >= TR ? Math.exp(-Math.pow((t - (TR + 0.03)) / 0.1, 2)) * 0.9 + 0.3 * Math.exp(-(t - TR) / 0.35) * S(TR, TR + 0.05, t) : 0;
          const swell = 0.12 * S(41, 46, t) * (1 - S(56, 60, t)); if (swell > flash) flash = swell * 0.0;
          px.post({ vignette: 1 - 0.0, fade: 0, flash: clamp(flash, 0, 1), flashCol: hex('#fff0d2') });
          drawTitle(t);
          px.fadeOnly(Math.max(1 - S(0, 1.2, t), S(58.9, 60, t)));
        },
      };
    },

    /* ===================================================== SCORE =====
     * identical to the 3D cut, so a voice-over recorded on either version stays in sync */
    score(A, from) {
      const D2 = 73.42, D3 = 146.83, F3 = 174.61, A3 = 220, C4 = 261.63, D4 = 293.66, E4 = 329.63, F4 = 349.23, Fs4 = 369.99, G4 = 392, A4 = 440, Bb4 = 466.16, D5 = 587.33, E5 = 659.25, Fs5 = 739.99, A5 = 880, B5 = 987.77, D6 = 1174.66, E6 = 1318.51;
      const TR = 29.4;
      /* continuity from Episode 2: wind, sea, the distant brass fading out */
      A.drone(0, 28.6, D2, { gain: 0.11, attack: 0.5, release: 1.6 });
      A.drone(29.4, 59.4, D2, { gain: 0.11, attack: 0.1, release: 2.5 });
      A.wind(0, 28.8, { gain: 0.1, bright: 1.0, attack: 0.5 });
      A.sea(0, 28.8, { gain: 0.1, attack: 0.5 });
      A.brass(0, 6.5, G4, { gain: 0.05, attack: 0.3, release: 3, wet: 0.88, sweep: [[0, 1400], [6.5, 300]] });
      A.pad(1, 24, [D3, A3, D4], { gain: 0.03, attack: 3, wet: 0.7 });
      /* the isle: the Patmos motif, sparse and lonely; waves breaking on the rocks */
      A.choir(9, 24, [D3, A3, D4, F4], { gain: 0.036, attack: 3.2, release: 3 });
      [[10.0, D5], [11.7, A4], [13.3, Bb4], [15.5, A4], [18.4, D5], [20.1, A4], [21.7, Bb4]].forEach(([t, f]) => A.bell(t, f, { gain: 0.08, dur: 4 }));
      [11.2, 14.9, 18.7, 22.4].forEach((t, i) => { A.boom(t, { freq: 62, gain: 0.17, dur: 1.8 }); A.noise({ t0: t, t1: t + 1.8, gain: 0.07, attack: 0.05, release: 1.4, filter: { type: 'bandpass', freq: [[t, 1800], [t + 1.8, 500]], q: 0.6 }, wet: 0.35, pan: i % 2 ? 0.3 : -0.3 }); });
      /* in the Spirit: the sound softens and lifts; a slow pulse; then held breath */
      A.shimmer(24.0, A4, { dur: 5.6, gain: 0.05 });
      A.choir(24.4, 28.7, [D4, A4, E5], { gain: 0.04, attack: 2.6, release: 1.2, vowel: 1.05 });
      A.voice({ type: 'sine', freq: [[24.4, 220], [29.3, 440]], t0: 24.4, t1: 29.4, gain: 0.06, attack: 2.4, release: 0.3, wet: 0.7 });
      [25.2, 26.5, 27.8].forEach((t) => { A.boom(t, { freq: 48, gain: 0.12, dur: 1.2 }); A.boom(t + 0.28, { freq: 44, gain: 0.08, dur: 1.0 }); });
      A.riser(27.4, 29.38, { f0: 400, f1: 7000, gain: 0.13 });
      /* the loud voice, like a trumpet: brass, then the sub-bass hit */
      A.boom(TR, { freq: 38, gain: 0.8, dur: 3.8 });
      A.noise({ t0: TR, t1: TR + 1.5, gain: 0.22, attack: 0.01, release: 1.2, filter: { type: 'bandpass', freq: [[TR, 3000], [TR + 1.5, 300]], q: 0.5 }, wet: 0.6 });
      A.brass(TR, TR + 6.6, D3, { gain: 0.085, attack: 0.1, release: 2.6, sweep: [[TR, 500], [TR + 0.35, 3600], [TR + 3, 1900], [TR + 6.6, 600]] });
      A.brass(TR, TR + 6.6, D4, { gain: 0.06, attack: 0.1, release: 2.6, sweep: [[TR, 600], [TR + 0.35, 4200], [TR + 3, 2200], [TR + 6.6, 700]] });
      A.voice({ type: 'sawtooth', freq: [[TR, D4 * 0.95], [TR + 0.14, D4], [TR + 2.3, D4], [TR + 2.55, A4], [TR + 6.4, A4]], t0: TR, t1: TR + 6.6, gain: 0.085, attack: 0.08, release: 2.4, wet: 0.6, filter: { type: 'lowpass', freq: [[TR, 700], [TR + 0.3, 4600], [TR + 3, 2600], [TR + 6.6, 900]], q: 1.4 } });
      A.shimmer(TR + 0.1, D5, { dur: 5, gain: 0.07 });
      /* the sound travels out over the sea; the world exhales */
      A.wind(30.2, 60, { gain: 0.1, bright: 1.1, attack: 1.2 });
      A.sea(30.2, 60, { gain: 0.1, attack: 1.2 });
      A.choir(31.5, 52, [D3, A3, D4, Fs4, A4], { gain: 0.048, attack: 3.4, release: 3 });
      A.pad(33, 54, [D3, A3, D4, Fs4], { gain: 0.03, attack: 3, wet: 0.75 });
      /* the seven names: the seven-note figure, one for each assembly */
      [D5, E5, Fs5, A5, B5, D6, E6].forEach((f, i) => { const t = 42.0 + i * 0.95; A.bell(t, f, { gain: 0.1, dur: 4.5 }); A.shimmer(t + 0.05, f / 2, { dur: 2.4, gain: 0.025 }); });
      A.riser(44, 48.8, { f0: 250, f1: 4200, gain: 0.1 });
      A.brass(47.5, 59.5, D3, { gain: 0.075, attack: 3.0, release: 2.0, sweep: [[47.5, 300], [52, 2000], [59.5, 700]] });
      A.choir(48.8, 59.6, [D3, A3, D4, Fs4, A4, D5], { gain: 0.058, attack: 2.2, release: 2.4, vowel: 1.08 });
      /* he begins to turn; something is about to be seen */
      A.voice({ type: 'sine', freq: [[54, 110], [59.8, 164.8]], t0: 54, t1: 59.9, gain: 0.07, attack: 2, release: 0.8, wet: 0.5 });
      A.brass(55.5, 60, G4, { gain: 0.045, attack: 3, release: 0.8, wet: 0.88, sweep: [[55.5, 250], [60, 1500]] });
    },
  });
})();
