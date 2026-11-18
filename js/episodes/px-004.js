/* ============================================================================
 *  REVELATION · PIXEL EDITION · Episode 4 · One Like a Son of Man · Revelation 1:12–16
 *  2D pixel-art cut (480x200). Same verses, cues, timing, score and handoff as the 3D cut.
 *  No faces: the figure is made of light, and where His face would be there is only light.
 *
 *  0:00  Episode 3's last frame (John turning, the seven lamps and names fading)
 *  0:07  v12 "I turned to see the voice": the camera pans from John to what he sees
 *  0:10  seven golden lampstands light one by one (the seven-note figure)
 *  0:14  v13 one like a son of man gathers out of light among them; slow orbit of the stands;
 *        the robe to His feet; the golden sash
 *  0:25  v14 head and hair white as wool; eyes like a flame of fire
 *  0:33  v15 feet like burnished bronze in a furnace; the voice of many waters rolls over the sea
 *  0:42  v16 seven stars in His right hand; a sharp two-edged sword from His mouth;
 *        His face like the sun in full strength
 *  0:52  white-gold light swallows the frame (handoff to Episode 5)
 * ========================================================================== */
(function () {
  'use strict';
  const Aura = window.Aura, px = Aura.px, lib = Aura.pxlib;
  const { W, H, clamp, lerp, sstep, hex, mix } = px;
  const S = sstep;

  Aura.define(4, {
    pixel: true,
    duration: 60,
    cues: [
      { ref: '1:12', t0: 6.8, t1: 13.4 },
      { ref: '1:13', t0: 14.0, t1: 24.4 },
      { ref: '1:14', t0: 25.0, t1: 32.2 },
      { ref: '1:15', t0: 32.8, t1: 41.6 },
      { ref: '1:16', t0: 42.2, t1: 51.9 },
    ],
    titles: [],

    build(ctx) {
      const U0 = () => px.cur();
      const PX_ = 140, gy = lib.groundY(PX_);
      const FXw = 232, feetY = lib.groundY(FXw) - 3, ZU = 1;           /* the figure stands to John's right, a little above the ground */
      const WATERS = 38.2;                                              /* the voice of many waters */
      const sA = px.surface().u32;

      const curve = (t, k) => {
        if (t <= k[0][0]) return k[0][1];
        const n = k.length; if (t >= k[n - 1][0]) return k[n - 1][1];
        let i = 1; while (t > k[i][0]) i++;
        const a = k[i - 1], b = k[i], h = b[0] - a[0], u = (t - a[0]) / h;
        const m0 = i > 1 ? (b[1] - k[i - 2][1]) / (b[0] - k[i - 2][0]) : 0, m1 = i < n - 1 ? (k[i + 1][1] - a[1]) / (k[i + 1][0] - a[0]) : 0;
        const u2 = u * u, u3 = u2 * u;
        return (2 * u3 - 3 * u2 + 1) * a[1] + (u3 - 2 * u2 + u) * h * m0 + (-2 * u3 + 3 * u2) * b[1] + (u3 - u2) * h * m1;
      };
      const kf = (t, k) => { if (t <= k[0][0]) return k[0][1]; for (let i = 1; i < k.length; i++) if (t <= k[i][0]) return lerp(k[i - 1][1], k[i][1], S(k[i - 1][0], k[i][0], t)); return k[k.length - 1][1]; };

      /* camera: centre (cx, cy) in cliff-world units and z (px per unit). Keys are [t, dx from the figure, h above its feet, z]. */
      const startCx = 140 + (100 - 78) / 2.3, startCy = gy + (112 - gy - 27) / 2.3;
      const KEYS = [
        [0, startCx - FXw, feetY - startCy, 2.3], [6.9, startCx - FXw + 4, feetY - startCy - 1, 2.35],
        [10.6, 12, 46, 1.15], [14, 8, 50, 1.0], [18.4, 0, 52, 1.3],
        [20, 0, 16, 2.9], [23.3, 0, 60, 3.3], [26.5, 0, 82, 3.6], [29.4, 0, 87, 4.6], [31, 0, 88.5, 7.5], [32.7, 0, 88.5, 8.5],
        [33.6, 0, 7, 3.8], [38.3, 0, 6, 3.6], [40.4, 20, 50, 0.85], [42.6, -20, 63, 3.2], [45.4, -18, 64, 4.0],
        [46.6, 14, 84, 3.2], [48.4, 14, 85, 3.2], [49.5, 0, 87, 3.6], [52, 0, 87, 6], [60, 0, 87, 4],
      ];
      function cam(t) {
        const K = (i) => KEYS.map((k) => [k[0], i === 3 ? Math.log(k[3]) : k[i]]);
        const dx = curve(t, K(1)), hc = curve(t, K(2)), z = Math.exp(curve(t, K(3)));
        return { z, cx: FXw + dx, cy: feetY - hc };
      }

      const dawnAt = () => 0.25, riseAt = () => -16, sunX = 262;
      const NAMES = ['EPHESUS', 'SMYRNA', 'PERGAMUM', 'THYATIRA', 'SARDIS', 'PHILADELPHIA', 'LAODICEA'];
      const IGN = (i) => 10.5 + i * 0.45;
      const waterK = (t) => S(WATERS, WATERS + 1.2, t) * (1 - S(42.5, 44.5, t));

      function drawVision(t) {
        const U = U0(), c = cam(t), z = c.z, sX = (wx) => 240 + (wx - c.cx) * z, sY = (wy) => 112 + (wy - c.cy) * z;
        const wk = waterK(t), formK = S(14.2, 18.6, t), blaze = S(49.4, 52, t), lampsLit = 0;
        const dawn = dawnAt(), hyRaw = sY(gy - 30), hy = clamp(Math.round(hyRaw), 34, 192);
        const wind = lerp(0.5, 0.3, S(0, 6, t)) + 0.5 * wk + 0.3 * S(48, 52, t);
        const veil = S(2.4, 3.8, z);                                    /* close in on the figure: the world falls away */
        lib.seascape({ U, t, dawn, hy, sunX, rise: riseAt(), camX: -292 + 0.6 * (c.cx - 140), camY: 0, wind: Math.min(wind, 1), amp: 1 + wk * 1.5, rays: 0, patmosPar: 0.62, patmosScale: 1, cloudOffA: 611, cloudOffB: 461 });
        /* the sky of Episode 3's last frame: the seven lamps and their names, fading out */
        const sk = 1 - S(0.4, 5.5, t);
        if (sk > 0.01) {
          const hy3 = 118 - 0;
          for (let i = 0; i < 7; i++) {
            const u = (i - 3) / 3, lx = 240 + u * 180 - (sX(140) - 218) * 0.0, ly = hy3 - 106 + 20 * u * u;
            lib.flame({ x: lx, y: ly, k: sk, pop: 0, t, seed: i, s: 2.25, glow: 1 });
            lib.nameSign(NAMES[i], lx, ly + (i % 2 ? 44 : 17), { k: 1, a: 0.5 * sk, t, sc: 2, pop: 0, seed: i, glow: 0.6 });
          }
        }
        /* the sea: the voice of many waters rolls out from His feet */
        if (wk > 0.01) lib.waveRings({ cx: sX(FXw), cy: sY(feetY) + 8, t, starts: [WATERS, WATERS + 0.9, WATERS + 1.8, WATERS + 2.7, WATERS + 3.6], speed: 150 * Math.max(0.5, z), ky: 0.2, yMin: hy + 1, yMax: H - 1, life: 3.4, crest: hex('#fff2d8'), col: hex('#8aa0c8'), dark: hex('#0a1430') });
        /* the world falls away as the camera closes on Him: a dark dusk veil, still lit by Him */
        if (veil > 0.01) { const vc = hex('#05060f'), vc2 = hex('#0b0e22'); for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (px.thr(x, y) < veil * 0.94) U[y * W + x] = ((x + y) & 1) && veil < 0.97 ? vc2 : vc; }
        /* the light of His presence on everything */
        const fx = sX(FXw), fyF = sY(feetY), fz = z * 1.0;
        const ring = 62, lampPos = [];
        const orbit = 0.1 * (t - 10) + 0.55 * S(14, 18.4, t);
        for (let i = 0; i < 7; i++) {
          const a = Math.PI / 7 + i * 2 * Math.PI / 7 + orbit, wx = FXw + ring * Math.cos(a), dep = Math.sin(a);
          lampPos.push({ i, a, dep, x: sX(wx), y: sY(feetY + 2 + 15 * dep), sc: z * (1 + 0.16 * dep) });
        }
        lampPos.sort((p, q) => p.dep - q.dep);
        const bright = formK * 0.5 + 0.25 * S(10.5, 14, t);
        if (bright > 0.02 && fz < 4.5) lib.halo(fx, fyF - 50 * z, Math.min(240, 80 * z), hex('#ffd890'), 0.4 * bright, 0.9);
        const drawStand = (L) => {
          const i = L.i, k = S(IGN(i), IGN(i) + 0.8, t), pop = Math.exp(-Math.pow((t - IGN(i) - 0.25) / 0.45, 2));
          if (L.x < -60 || L.x > W + 60) return;
          lib.lampstand({ U, x: Math.round(L.x), y: Math.round(L.y), z: L.sc, lit: k, pop, t, seed: i, lean: 7 * wk * L.sc * (0.6 + 0.4 * Math.sin(t * 3 + i)), a: S(IGN(i) - 0.7, IGN(i) - 0.1, t) });
          if (k > 0.05 && L.sc < 3) lib.halo(L.x, L.y - 30 * L.sc, 20 * L.sc + 6, hex('#ffc060'), 0.28 * k, 0.9);
        };
        /* ground, grass, John */
        const cm = { z, pX: PX_, pY: gy, ox: 240 - PX_ - (c.cx - PX_) * z, oy: 112 - gy - (c.cy - gy) * z };
        const M = lib.camMap(cm), l = { U, dawn: lerp(dawn, 1, 0.5 * (1 - S(0, 6, t)) + 0.55 * formK), sunX: 240, lit: 1 };
        lampPos.filter((p) => p.dep < 0).forEach(drawStand);
        if (z < 3.0) lib.cliffGround(cm, l);
        else { const fy0 = Math.max(0, Math.round(fyF)), fl = hex('#07080f'), fl2 = hex('#0d0f1c'); for (let y = fy0; y < H; y++) for (let x = 0; x < W; x++) U[y * W + x] = (y - fy0) < 2 ? fl2 : ((x + y) & 1) && y - fy0 < 8 ? fl2 : fl; lib.halo(fx, fyF + 3, 70 * Math.min(z, 4), hex('#ffb85a'), 0.35 * formK, 0.25); }
        lib.grass(cm, l, 'edge', t, Math.min(wind, 1));
        const jx = M.sx(PX_), jy = M.sy(gy) + 3 * z, jh = 46 * z;
        if (jx > -80 && jx < W + 80) {
          if (t < 8) { lib.halo(jx, jy - jh * 0.55, 110 * z * 0.6, hex('#ffb85a'), 0.45 * (1 - S(0, 6, t)), 0.9); }
          lib.johnTurn({ U, x: jx, y: jy, h: jh, t, wind: Math.min(wind, 1), sunX: 240, lit: 1, dawn: Math.max(dawn, 0.9 - 0.4 * S(0, 7, t) + 0.1 * formK), ang: lerp(1.25, 0.55, S(0, 6.9, t)), dir: 1 });
        }
        /* the figure, and the stands in front of Him */
        lib.sonOfMan({ U, sx: fx, sy: fyF, z, t, form: formK, face: 0.3 + 0.7 * S(48.4, 51.6, t), eyes: S(29.3, 30.3, t), stars: clamp((t - 42.4) / 0.36 + 0.001, 0, 7) * (t > 42.4 ? 1 : 0), sword: t > 45.55 ? clamp((t - 45.55) / 0.5, 0, 1) : 0, blaze, waves: 0.3 + 0.9 * wk, feet: S(32.6, 34, t) });
        lampPos.filter((p) => p.dep >= 0).forEach(drawStand);
        lib.grass(cm, l, 'front', t, Math.min(wind, 1));
        /* light gathering into the form (14–18.5), sparks from the feet, snow from the hair */
        if (t > 12.5 && t < 18.8) lib.motes({ t, k: S(12.5, 14.4, t) * (1 - S(17, 18.8, t)), x0: fx - 40 * z, x1: fx + 40 * z, y0: fyF - 96 * z, y1: fyF, n: 70, speed: 20, dir: 1 });
        if (t > 24.6 && t < 47) lib.motes({ t, k: 0.5 * S(24.6, 26.5, t) * (1 - S(45, 47, t)), x0: fx - 14 * z, x1: fx + 14 * z, y0: fyF - 100 * z, y1: fyF - 66 * z, n: 40, speed: 7, dir: 1 });
        if (t > 32.6 && t < 47) lib.motes({ t, k: S(32.6, 34, t) * (1 - S(45, 47, t)), x0: fx - 8 * z, x1: fx + 8 * z, y0: fyF - 30 * z, y1: fyF + 2 * z, n: 40, speed: 22, dir: -1 });
        lib.windStreaks(t, Math.min(wind, 1) * 0.5 + 0.05, mix(hex('#9fb4d8'), hex('#ffffff'), 0.3), 10, hy + 40);
      }

      function vblur(F, src, amt) {
        for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const tap = (px.thr(x, y) * 4) | 0, Y = clamp(y + Math.round((tap / 3 - 0.5) * amt), 0, H - 1); F[y * W + x] = src[Y * W + x]; }
      }

      const gold = [hex('#fff6d0'), hex('#ffe9a0'), hex('#ffd070'), hex('#f2a444'), hex('#c8702a'), hex('#8a4420')];
      function drawTitle(t) {
        const k = S(1.3, 2.3, t) * (1 - S(4.0, 4.8, t));
        if (k <= 0.01) return;
        const sc = 3, word = 'ONE LIKE A SON OF MAN', tw = px.textWidth(word, sc, 1), x0 = Math.round(240 - tw / 2), y0 = 66;
        px.scrim(240, y0 + 16, 224, 40, k * 1.05);
        for (let i = 0; i < word.length; i++) {
          const ka = clamp((t - 1.4 - i * 0.05) / 0.6, 0, 1) * (1 - S(4.0, 4.8, t)); if (ka <= 0) continue;
          const lx = x0 + i * 6 * sc, ch = word[i];
          px.text(ch, lx + 2, y0 + 2, sc, hex('#1a0c16'), ka);
          const sweep = lerp(-40, 440, S(2.4, 3.9, t));
          px.text(ch, lx, y0, sc, (cc, r, X, Y) => { let col = px.ramp(gold, (r + 1) / (7 * sc), X, Y); const d = (X - Y * 0.7) - sweep; if (d > 0 && d < 8) col = hex(d < 4 ? '#ffffff' : '#fff0c0'); return col; }, ka);
        }
        const sub = 'REVELATION · EPISODE 4', sw = px.textWidth(sub, 2, 1), sx0 = Math.round(240 - sw / 2), sy0 = y0 - 17, ks = S(1.1, 2.0, t) * (1 - S(4.0, 4.8, t));
        px.text(sub, sx0 + 1, sy0 + 1, 2, hex('#0a0814'), ks); px.text(sub, sx0, sy0, 2, hex('#ffd48a'), ks);
        const rule = Math.round(lerp(0, 150, S(1.8, 3.2, t))); px.hline(240 - rule, 240 + rule, y0 + 7 * sc + 8, mix(hex('#ffd48a'), hex('#0a0814'), 0.15 + (1 - k) * 0.8));
      }

      return {
        render(t) {
          const main = px.cur();
          const wv = Math.sin(Math.PI * S(32.7, 33.6, t));
          if (wv > 0.02) { px.target(sA); drawVision(t); px.target(main); vblur(main, sA, 44 * wv); }
          else drawVision(t);
          const zing = Math.exp(-Math.pow((t - 45.62) / 0.07, 2)) * 0.28;
          const flash = clamp(Math.max(zing, S(50.8, 55.2, t)));
          px.post({ vignette: 1 - 0.0, fade: 0, flash, flashCol: hex('#fff0d2') });
          drawTitle(t);
          px.fadeOnly(clamp(1 - S(0, 1.2, t)));
        },
      };
    },

    score(A, from) {
      const D2 = 73.42, D3 = 146.83, G3 = 196, A3 = 220, D4 = 293.66, Fs4 = 369.99, G4 = 392, A4 = 440, B4 = 493.88, D5 = 587.33, E5 = 659.25, Fs5 = 739.99, A5 = 880, B5 = 987.77, D6 = 1174.66, E6 = 1318.51, Fs6 = 1479.98, A6 = 1760, B6 = 1975.5, D7 = 2349.3;
      /* continuity: the same wind, sea and sustained chord that closed Episode 3 */
      A.drone(0, 59.6, D2, { gain: 0.11, attack: 0.4, release: 2.0 });
      A.wind(0, 38, { gain: 0.09, bright: 1.0, attack: 0.5 });
      A.sea(0, 40, { gain: 0.09, attack: 0.5 });
      A.choir(0, 12.5, [D3, A3, D4, Fs4, A4, D5], { gain: 0.05, attack: 0.6, release: 3 });
      A.brass(0, 5, G4, { gain: 0.045, attack: 0.2, release: 2.5, wet: 0.88, sweep: [[0, 1500], [5, 350]] });
      /* he turns */
      A.voice({ type: 'sine', freq: [[1, 110], [6.8, 164.8]], t0: 1, t1: 7.2, gain: 0.06, attack: 2, release: 0.6, wet: 0.5 });
      A.shimmer(6.9, A4, { dur: 4.4, gain: 0.045 });
      A.riser(8.6, 10.5, { f0: 300, f1: 5200, gain: 0.08 });
      /* seven golden lamp stands: the seven-note figure, one note for each light */
      [D5, E5, Fs5, A5, B5, D6, E6].forEach((f, i) => { const t = 10.5 + i * 0.45; A.bell(t, f, { gain: 0.1, dur: 4 }); A.shimmer(t + 0.05, f / 2, { dur: 2.2, gain: 0.022 }); });
      /* one like a son of man: light gathers into a form */
      A.riser(12.8, 14.4, { f0: 250, f1: 3800, gain: 0.1 });
      A.boom(14.4, { freq: 46, gain: 0.4, dur: 3.4 });
      A.choir(14.2, 32.6, [D3, A3, D4, Fs4, A4], { gain: 0.058, attack: 3.0, release: 2.6, vowel: 1.02 });
      A.pad(14.5, 34, [D3, A3, D4, Fs4], { gain: 0.032, attack: 3, wet: 0.75 });
      [[16.0, A4], [17.3, B4], [18.6, D5], [20.2, Fs5]].forEach(([t, f]) => A.bell(t, f, { gain: 0.07, dur: 4.2 }));
      /* robe and sash: a warm, low brass */
      A.brass(19.0, 27.5, G3, { gain: 0.06, attack: 2.4, release: 2.2, sweep: [[19, 300], [23, 1500], [27.5, 700]] });
      /* hair like snow: small bright sparks */
      [A5, E6, D6, B5, Fs5, A5, E6, D6, B5].forEach((f, i) => A.bell(25.2 + i * 0.46, f, { gain: 0.034, dur: 2.6, pan: i % 2 ? 0.5 : -0.5 }));
      /* eyes like a flame of fire */
      A.boom(29.35, { freq: 52, gain: 0.5, dur: 2.2 });
      A.noise({ t0: 29.3, t1: 30.8, gain: 0.15, attack: 0.02, release: 1.0, filter: { type: 'bandpass', freq: [[29.3, 5200], [30.8, 1800]], q: 0.7 }, wet: 0.4 });
      A.brass(29.4, 37, D3, { gain: 0.06, attack: 0.5, release: 2.6, sweep: [[29.4, 500], [31, 2200], [37, 900]] });
      A.noise({ t0: 30.3, t1: 38.3, gain: [[30.3, 0], [31, 0.03], [38, 0.03], [38.3, 0]], filter: { type: 'highpass', freq: 3200, q: 0.5 }, attack: 0.3, release: 0.3, wet: 0.3 });
      /* feet like burnished brass: a struck bronze, and the furnace roar */
      A.bell(32.9, D3 * 1.5, { gain: 0.16, dur: 7 }); A.boom(32.9, { freq: 44, gain: 0.55, dur: 2.6 });
      A.noise({ t0: 33, t1: 38.6, gain: [[33, 0], [34, 0.1], [37.4, 0.1], [38.6, 0]], filter: { type: 'lowpass', freq: [[33, 300], [36, 760], [38.6, 300]], q: 0.7 }, attack: 0.5, release: 0.5, wet: 0.4 });
      /* the voice of many waters */
      A.boom(38.2, { freq: 40, gain: 0.7, dur: 4.2 });
      A.noise({ t0: 38.0, t1: 44.5, gain: [[38.0, 0], [39.2, 0.26], [42, 0.2], [44.5, 0]], filter: { type: 'bandpass', freq: [[38, 250], [40, 900], [44.5, 350]], q: 0.35 }, wet: 0.5, attack: 0.6, release: 1.0 });
      A.noise({ t0: 38.3, t1: 44, gain: [[38.3, 0], [39.5, 0.08], [43, 0.06], [44, 0]], filter: { type: 'highpass', freq: 2600, q: 0.4 }, wet: 0.5, attack: 0.5, release: 0.8 });
      A.voice({ type: 'sine', freq: [[38.0, 50], [44, 62]], t0: 38.0, t1: 44.5, gain: 0.15, attack: 1.2, release: 1.4, wet: 0.4 });
      A.choir(38.4, 47.5, [D3, A3, D4, Fs4, A4, D5], { gain: 0.062, attack: 2.0, release: 2.0, vowel: 1.06 });
      /* seven stars: seven bright notes */
      [B5, D6, E6, Fs6, A6, B6, D7].forEach((f, i) => { const t = 42.5 + i * 0.36; A.bell(t, f, { gain: 0.06, dur: 3.4 }); });
      /* out of his mouth, a sharp two-edged sword */
      A.voice({ type: 'sawtooth', freq: [[45.55, 1800], [45.72, 6500], [46.6, 5200]], t0: 45.55, t1: 46.9, gain: 0.045, attack: 0.01, release: 0.9, wet: 0.7, filter: { type: 'highpass', freq: 1500, q: 0.7 } });
      A.noise({ t0: 45.55, t1: 46.4, gain: 0.12, attack: 0.01, release: 0.6, filter: { type: 'bandpass', freq: [[45.55, 3000], [46.4, 9000]], q: 1.1 }, wet: 0.6 });
      A.boom(45.6, { freq: 70, gain: 0.45, dur: 2.2 }); A.bell(45.6, D7, { gain: 0.06, dur: 5 });
      /* his face, like the sun shining at its brightest */
      A.riser(47.6, 51.6, { f0: 200, f1: 9500, gain: 0.22 });
      A.brass(48.4, 59.8, D3, { gain: 0.1, attack: 2.6, release: 2.0, sweep: [[48.4, 300], [51.6, 3200], [59.8, 1600]] });
      A.brass(48.4, 59.8, D4, { gain: 0.07, attack: 2.6, release: 2.0, sweep: [[48.4, 400], [51.6, 3800], [59.8, 1900]] });
      A.choir(48.4, 59.8, [D3, A3, D4, Fs4, A4, D5, A5], { gain: 0.075, attack: 2.4, release: 1.2, vowel: 1.12 });
      A.boom(51.6, { freq: 34, gain: 0.95, dur: 6 });
      A.noise({ t0: 51.6, t1: 57.5, gain: [[51.6, 0.3], [53, 0.2], [57.5, 0]], filter: { type: 'bandpass', freq: [[51.6, 2500], [57.5, 6000]], q: 0.4 }, wet: 0.6, attack: 0.05, release: 1.0 });
      A.shimmer(51.7, D5, { dur: 7, gain: 0.09 }); A.shimmer(51.9, A5, { dur: 7, gain: 0.06 });
    },
  });
})();
