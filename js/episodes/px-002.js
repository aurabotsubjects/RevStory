/* ============================================================================
 *  REVELATION · PIXEL EDITION · Episode 2 · Grace and Peace · Revelation 1:4–8
 *  2D pixel-art cut (480x200, dithered palettes). Same storyline, timing, score
 *  and WEB subtitles as the original 3D episode; only the look has changed.
 *
 *  0:00  opens on Episode 1's last frame: John on the Patmos cliff, wind high
 *  0:01  title card: REVELATION · EPISODE 2 · GRACE AND PEACE
 *  0:05  v4  "John, to the seven assemblies in Asia ..." the camera pulls back and
 *            turns; seven lamps ignite one by one over seven far-off cities
 *  0:20  v5  "Jesus Christ, the faithful witness ..." the lamps pulse together;
 *            a warm light washes over the sea (motes of light falling)
 *  0:35  v6  "a Kingdom, priests ..." the seven rise and gather into an arc
 *  0:45  v7  "Behold, he is coming with the clouds" the clouds close in and wall
 *            the sky; at 0:48 they part and the light breaks through
 *  0:58  v8  "I am the Alpha and the Omega" both letters form out of stars
 *  1:04  low-angle push-in on John, lit gold, looking toward the light; a distant
 *        sound builds (handoff to Episode 3)
 * ========================================================================== */
(function () {
  'use strict';
  const Aura = window.Aura, px = Aura.px, lib = Aura.pxlib;
  const { W, H, clamp, lerp, sstep, hex, mix } = px;
  const ease = Aura.math.ease;
  const S = sstep;

  Aura.define(2, {
    pixel: true,
    duration: 72,

    /* subtitle cues (text comes from js/scripture-web.js); timed exactly like the 3D cut */
    cues: [
      { ref: '1:4', t0: 5.0, t1: 19.4 },
      { ref: '1:5', t0: 20.0, t1: 34.0 },
      { ref: '1:6', t0: 34.6, t1: 44.6 },
      { ref: '1:7', t0: 45.2, t1: 57.6 },
      { ref: '1:8', t0: 58.2, t1: 67.4 },
    ],
    titles: [],   /* title card is drawn in pixels by the renderer */

    build(ctx) {
      const U0 = () => px.cur();
      const PX_ = 140;                                   /* cliff pivot (same as Episode 1) */
      const gold = [hex('#fff6d0'), hex('#ffe9a0'), hex('#ffd070'), hex('#f2a444'), hex('#c8702a'), hex('#8a4420')];

      /* ---------------- camera: starts exactly where Episode 1 ended (z 1.9, ox 84, oy 12, hy 104, camX -37.3) */
      const camX = (t) => -37.3 - 224 * S(0, 20, t) - 0.25 * Math.max(0, t - 20);
      const camZ = (t) => 1.9 - 0.64 * S(0, 16, t) - 0.08 * S(16, 38, t) + 0.82 * S(61, 70, t);
      const camOx = (t) => 84 - 74 * S(0, 16, t) + 55 * S(61, 70, t);
      const camHy = (t) => 104 - 2 * S(0, 16, t) + 14 * S(36, 48, t) + 2 * S(48, 60, t) + 22 * S(61, 70, t);
      const camOy = (t) => 12 - 6 * S(0, 16, t) - 2 * S(16, 36, t) + 16 * S(36, 48, t) + 2 * S(48, 60, t) + 8 * S(61, 70, t);

      /* ---------------- world curves */
      const windAt = (t) => (t < 12 ? lerp(1.0, 0.55, S(0, 12, t)) : lerp(0.55, 0.75, S(30, 58, t)) * (1 - 0.25 * S(66, 72, t)));
      const gloryK = (t) => (0.16 * S(43, 48.4, t) + 0.84 * S(48.5, 53.5, t)) * (1 - 0.18 * S(64, 72, t));
      const dawnAt = (t) => 0.98 - 0.42 * S(1, 10, t) - 0.16 * S(39, 47, t) + 0.14 * S(48, 60, t) + 0.1 * S(64, 72, t);
      const riseAt = (t) => 27 + 5 * S(0, 40, t) - 52 * S(41, 48.2, t);
      const sunXAt = (t) => 255 + 16 * S(0, 20, t);
      const raysAt = (t) => (0.05 + 0.33 * (1 - S(0, 7, t))) * (1 - S(41, 47, t));

      /* ---------------- the seven: cities on the horizon, lamps above them */
      const CITY_X = [28, 82, 136, 190, 348, 404, 460];
      const cityX = (i, t) => CITY_X[i] - 0.06 * (camX(t) - camX(20));
      const IGN = (i) => 7.6 + i * 1.35, RISE = (i) => 35.4 + i * 0.28;
      const lamp = (i, t, hy) => {
        const ig = S(IGN(i), IGN(i) + 0.9, t);
        const pop = Math.exp(-Math.pow((t - IGN(i) - 0.25) / 0.45, 2));
        const r = S(RISE(i), RISE(i) + 8.5, t), rs = r * r * (3 - 2 * r);
        const Cy = hy - 66, u = (i - 3) / 3;
        const ax = 240 + u * 84, ay = Cy - 10 - 20 * (1 - u * u);
        const hx = cityX(i, t), hyy = hy - 19 + Math.sin(t * 1.3 + i * 1.9) * 1.2;
        return { k: ig, pop, rs, x: lerp(hx, ax, rs), y: lerp(hyy, ay, rs) - Math.sin(rs * Math.PI) * 12, s: lerp(1.75, 2.35, rs) };
      };
      /* the four rising notes at "Jesus Christ" make the lamps pulse together */
      const pulseAt = (t) => [20.4, 22.4, 24.4, 26.4].reduce((a, p) => a + Math.exp(-Math.pow((t - p) / 0.5, 2)), 0);

      /* ---------------- the clouds that come, close up, and part. [sprite, inner offset, dy, layer] */
      const CL = [
        [3, -30, -56, 0], [4, 100, -50, 0], [1, 236, -54, 0], [5, 372, -48, 0],
        [0, -8, -34, 1], [2, 126, -28, 1], [5, 268, -32, 1], [1, 400, -26, 1],
        [4, 4, -9, 1], [3, 150, -4, 1], [0, 298, -10, 2],
        [2, -14, 14, 2], [5, 118, 20, 2], [1, 246, 12, 2], [4, 372, 18, 2],
        [0, 20, 38, 2], [3, 176, 44, 2], [2, 330, 40, 2],
        [4, 60, 58, 2], [1, 230, 62, 2],
      ];
      const SW = [176, 150, 196, 132, 164, 184];

      /* ================================================================ SCENE */
      function drawScene(t) {
        const U = U0();
        const hy = camHy(t), cx = camX(t), z = camZ(t), ox = camOx(t), oy = camOy(t);
        const wind = windAt(t), dawn = dawnAt(t), rise = riseAt(t), sunX = sunXAt(t), gk = gloryK(t);
        const info = lib.seascape({ U, t, dawn, hy, sunX, rise, camX: cx, camY: 0, wind, amp: 1 + wind * 1.5, rays: raysAt(t), patmosPar: 0.62, patmosScale: 1, cloudOffA: 611, cloudOffB: 461 });
        const horizon = info.horizon;

        /* seven cities, each with its lamp */
        const lamps = []; for (let i = 0; i < 7; i++) lamps.push(lamp(i, t, hy));
        const lit = lamps.map((L) => L.k * (1 - L.rs * 0.6));
        lib.cities({ a: S(2.2, 6.4, t), xs: CITY_X.map((_, i) => cityX(i, t)), hy, lit, t, col: mix(horizon, hex('#0a0c20'), 0.84), rim: mix(hex('#6a7aa8'), hex('#ffc27a'), dawn), hazeCol: horizon, sunX });
        lamps.forEach((L, i) => lib.lampGlint(cityX(i, t), hy, L.k * (1 - L.rs) * 0.9, t, i, 24));

        /* light breaking through (drawn behind the clouds so they silhouette against it) */
        const GX = 240, GY = hy - 66;
        lib.glory({ cx: GX, cy: GY, k: gk, t, hy, rays: 0.9 });

        /* clouds */
        const gather = S(39, 47.5, t), part = S(48.5, 61, t);
        if (gather > 0.001) {
          const gapHalf = 4 + 176 * Math.pow(part, 0.9), lk = Math.max(0.3, gk);
          const order = CL.map((c, n) => n).sort((a, b) => CL[a][3] - CL[b][3]);
          for (const side of [-1, 1]) for (const n of order) {
            const [sp, off, dy, layer] = CL[n], w = SW[sp];
            const arrive = lerp(380, 0, ease.out3 ? ease.out3(gather) : gather);
            const x = GX + side * (gapHalf + off + w / 2 + arrive + (layer === 0 ? 14 : 0));
            const y = GY + dy + Math.sin(t * 0.5 + n) * 0.8;
            lib.cloud({ spr: sp, x, y, flip: side < 0, lx: GX, ly: GY, k: lk, tone: layer === 0 ? 0.6 : layer === 1 ? 0.9 : 1.0, a: 1 });
          }
        }
        /* the sea catches the light */
        lib.seaGlow(GX, hy, gk * 0.9, t);
        const sunHot = gk * (1 - 0.0);
        lib.halo(GX, GY, 30 * gk, hex('#ffffff'), 0.9 * sunHot);
        if (gk > 0.2) lib.flare(GX, GY, 0.55 * gk, 1);

        /* the seven lamps (in front of the clouds) */
        const pul = pulseAt(t);
        lamps.forEach((L, i) => lib.flame({ x: L.x, y: L.y, k: L.k, pop: Math.min(1, L.pop + pul * 0.35), t, seed: i, s: L.s, glow: 1 + 0.25 * pul }));

        /* Alpha and Omega, formed out of stars */
        const gb = 1 - 0.55 * S(68.5, 72, t);
        lib.glyph('alpha', { cx: GX - 118, cy: hy - 60, reveal: S(57.6, 63.4, t), t, bright: gb, sc: 2 });
        lib.glyph('omega', { cx: GX + 118, cy: hy - 60, reveal: S(58.9, 64.6, t), t, bright: gb, sc: 2 });

        /* "washed us from our sins": a warm light falling through the whole scene */
        const wash = S(25, 28, t) * (1 - S(33.5, 37, t));
        lib.halo(sunX, hy - rise, 210, hex('#ffb85a'), 0.3 * wash, 0.62);
        lib.motes({ t, k: wash, x0: 0, x1: W, y0: 0, y1: hy + 50, n: 130, speed: 14, dir: 1 });

        /* ------------------------------------------------ foreground: the cliff, grass and John */
        const gy = lib.groundY(PX_);
        const c = { z, pX: PX_, pY: gy, ox, oy };
        const lightX = lerp(sunX, GX, S(0.4, 0.9, gk));
        const dawnFg = lerp(dawn, 1, gk * 0.9);
        const l = { U, dawn: dawnFg, sunX: lightX, lit: 1 };
        lib.cliffGround(c, l);
        lib.grass(c, l, 'edge', t, wind);
        const M = lib.camMap(c);
        lib.john({ U, x: M.sx(PX_), y: M.sy(gy) + 3 * z, h: 46 * z, t, wind, sunX: lightX, lit: 1, dawn: dawnFg });
        lib.grass(c, l, 'front', t, wind);
        lib.windStreaks(t, wind * 0.6 + 0.1, mix(horizon, hex('#ffffff'), 0.35), 10, hy + 40);
      }

      /* =============================================================== TITLES */
      function drawTitle(t) {
        const k = S(1.3, 2.3, t) * (1 - S(4.0, 4.8, t));
        if (k <= 0.01) return;
        const sc = 4, word = 'GRACE AND PEACE', tw = px.textWidth(word, sc, 1), x0 = Math.round(240 - tw / 2), y0 = 62;
        px.scrim(240, y0 + 20, 215, 44, k * 1.05);
        for (let i = 0; i < word.length; i++) {
          const ka = clamp((t - 1.4 - i * 0.06) / 0.6, 0, 1) * (1 - S(4.0, 4.8, t));
          if (ka <= 0) continue;
          const lx = x0 + i * 6 * sc, ch = word[i];
          px.text(ch, lx + 3, y0 + 3, sc, hex('#1a0c16'), ka);
          px.text(ch, lx + 2, y0 + 2, sc, hex('#3a1a1c'), ka);
          const sweep = lerp(-40, 420, S(2.4, 3.9, t));
          px.text(ch, lx, y0, sc, (cc, r, X, Y) => {
            let col = px.ramp(gold, (r + 1) / (7 * sc), X, Y);
            const d = (X - Y * 0.7) - sweep; if (d > 0 && d < 8) col = hex(d < 4 ? '#ffffff' : '#fff0c0');
            return col;
          }, ka);
        }
        const sub = 'REVELATION · EPISODE 2', sw = px.textWidth(sub, 2, 1), sx0 = Math.round(240 - sw / 2), sy0 = y0 - 17, ks = S(1.1, 2.0, t) * (1 - S(4.0, 4.8, t));
        px.text(sub, sx0 + 1, sy0 + 1, 2, hex('#0a0814'), ks);
        px.text(sub, sx0, sy0, 2, hex('#ffd48a'), ks);
        const rule = Math.round(lerp(0, 150, S(1.8, 3.2, t))), ry = y0 + 7 * sc + 8;
        px.hline(240 - rule, 240 + rule, ry, mix(hex('#ffd48a'), hex('#0a0814'), 0.15 + (1 - k) * 0.8));
      }

      return {
        render(t) {
          drawScene(t);
          /* grade: a warm wash for "washed", flashes on the two big hits, fades in and out of black */
          let flash = 0, flashCol = hex('#fff4e0');
          const boom1 = Math.exp(-Math.pow((t - 48.7) / 0.2, 2)) * 0.62, boom2 = Math.exp(-Math.pow((t - 58.35) / 0.22, 2)) * 0.5;
          if (boom1 > flash) { flash = boom1; flashCol = hex('#fff4e0'); }
          if (boom2 > flash) { flash = boom2; flashCol = hex('#fff4e0'); }
          px.post({ vignette: 1, fade: 0, flash, flashCol });
          drawTitle(t);
          px.fadeOnly(Math.max(1 - S(0, 1.0, t), S(70.6, 72, t)));
        },
      };
    },

    /* ===================================================== SCORE =====
     * identical to the 3D cut, so a voice-over recorded on either version stays in sync */
    score(A, from) {
      const D2 = 73.42, A2 = 110, D3 = 146.83, F3 = 174.61, A3 = 220, C4 = 261.63, D4 = 293.66, Fs4 = 369.99, G4 = 392, A4 = 440, Bb4 = 466.16, D5 = 587.33, E5 = 659.25, Fs5 = 739.99, A5 = 880, B5 = 987.77, D6 = 1174.66;
      /* continuity from Episode 1: wind, the low drone, the choir settling */
      A.drone(0, 70, D2, { gain: 0.12, attack: 0.5, release: 3 });
      A.wind(0, 72, { gain: 0.11, bright: 1.1, attack: 0.5 });
      A.sea(0, 72, { gain: 0.09, attack: 0.5 });
      A.choir(0, 12, [D3, A3, D4, F3 * 2], { gain: 0.04, attack: 0.5, release: 3 });
      A.pad(4, 34, [D3, A3, D4], { gain: 0.032, attack: 3, wet: 0.7 });
      /* seven lamps: a rising seven-note bell figure, one for each light */
      [D5, E5, Fs5, A5, B5, D6, 1318.51].forEach((f, i) => { const t = 7.6 + i * 1.35; A.bell(t, f, { gain: 0.1, dur: 4.5 }); A.shimmer(t + 0.05, f / 2, { dur: 2.4, gain: 0.025 }); });
      /* Jesus Christ named: the Lamb figure, warm and rising */
      [[20.4, A3], [22.4, D4], [24.4, Fs4], [26.4, A4]].forEach(([t, f]) => A.voice({ type: 'triangle', freq: f, t0: t, t1: t + 3.4, gain: 0.07, attack: 0.5, release: 2.2, wet: 0.7, filter: { type: 'lowpass', freq: 1500, q: 0.5 } }));
      /* washed, made a kingdom: D minor lifts to D major */
      A.choir(27, 46, [D3, A3, Fs4 * 0.5 * 2, D4, A4], { gain: 0.05, attack: 3.5, release: 3 });
      A.shimmer(28, A4, { dur: 5, gain: 0.05 });
      A.brass(36, 46, D3, { gain: 0.06, attack: 2.5, release: 2 });
      [[36.5, D5], [38.0, A4], [39.5, Fs5], [41.0, A5], [43.0, D6]].forEach(([t, f]) => A.bell(t, f, { gain: 0.09, dur: 4 }));
      /* he is coming with the clouds: tension, then the clouds part */
      A.riser(41, 48.4, { f0: 200, f1: 4200, gain: 0.16 });
      A.boom(48.6, { freq: 44, gain: 0.8, dur: 3.4 });
      A.choir(48.6, 59, [D3, A3, D4, F3 * 2, A4], { gain: 0.058, attack: 2.2, release: 2.6, vowel: 1.08 });
      A.voice({ type: 'sawtooth', freq: Bb4 / 4, t0: 50, t1: 57.5, gain: 0.05, attack: 2.5, release: 2, wet: 0.6, filter: { type: 'lowpass', freq: 600, q: 1 } }); // the mourning
      A.voice({ type: 'sine', freq: [[50, 98], [57.5, 98]], t0: 50, t1: 57.5, gain: 0.07, attack: 2.5, release: 2, wet: 0.4 });
      /* Alpha and Omega */
      A.riser(55.6, 58.2, { f0: 600, f1: 7000, gain: 0.14 });
      A.boom(58.3, { freq: 40, gain: 0.95, dur: 4.2 });
      A.brass(58.2, 67.4, D3, { gain: 0.085, attack: 0.9, release: 2.2, sweep: [[58.2, 300], [61, 2400], [67.4, 900]] });
      A.choir(58.3, 68.5, [D3, A3, D4, Fs4, A4, D5], { gain: 0.06, attack: 1.2, release: 3 });
      [[59.0, D5], [60.8, A4], [62.6, A5], [64.6, D5]].forEach(([t, f]) => A.bell(t, f, { gain: 0.1, dur: 4.5 }));
      /* a distant sound builds toward Episode 3 */
      A.brass(66.4, 72, G4, { gain: 0.05, attack: 3.2, release: 1.0, wet: 0.88, sweep: [[66.4, 250], [72, 1400]] });
    },
  });
})();
