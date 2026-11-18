/* ============================================================================
 *  REVELATION · Episodes 1–10  (data file)
 *  EP 01 · The Unveiling · Revelation 1:1–3
 *  EP 02 · Grace and Peace · Revelation 1:4–8
 *  EP 03 · On the Lord's Day · Revelation 1:9–11
 *  EP 04 · One Like a Son of Man · Revelation 1:12–16
 *  EP 05 · Do Not Be Afraid · Revelation 1:17–20
 * ========================================================================== */
(function () {
  'use strict';
  const Aura = window.Aura, THREE = window.THREE;
  const { clamp, lerp, smooth } = Aura.math;
  const V3 = THREE.Vector3;
  const letters = (s) => s.split('').map((c, i) => c === ' ' ? '<i class="sp"></i>' : '<span style="--i:' + i + '">' + c + '</span>').join('');

  /* ====================================================== EPISODE 1 ===== */
  Aura.define(1, {
    duration: 60,

    /* subtitle cues (text comes from js/scripture-web.js) */
    cues: [
      { ref: '1:1', t0: 12.6, t1: 25.2 },
      { ref: '1:2', t0: 25.6, t1: 32.6 },
      { ref: '1:3', t0: 33.0, t1: 47.8 },
    ],

    /* overlay titles */
    titles: [
      { t0: 0.5, t1: 4.6, fi: 1.4, fo: 0.7, cls: 'studio', html:
        '<div class="studio-mark"><svg viewBox="0 0 120 120" aria-hidden="true"><circle class="r1" cx="60" cy="60" r="18"/><circle class="r2" cx="60" cy="60" r="31"/><circle class="r3" cx="60" cy="60" r="44"/><circle class="core" cx="60" cy="60" r="6"/></svg></div>' +
        '<div class="studio-name">AURABOT <b>PROJECT</b></div>' },
      { t0: 6.4, t1: 12.8, fi: 1.4, fo: 0.9, cls: 'maintitle', html:
        '<div class="mt-word">' + letters('REVELATION') + '</div><div class="mt-sub">EPISODE 1 &nbsp;·&nbsp; THE UNVEILING</div>' },
    ],

    build(ctx) {
      const { scene, camera, fx, lib, renderer } = ctx;
      const env = lib.env();
      env.uPR.value = renderer.getPixelRatio();
      const q = ctx.quality;
      const hi = q === 'high';

      /* ---------- shared backdrop ---------- */
      const stars = lib.stars(env, { count: hi ? 9000 : 5000 }), milky = lib.milkyWay(env);
      scene.add(milky, stars);
      const sky = lib.sky(env); scene.add(sky);
      const sea = lib.sea(env); scene.add(sea);
      const flare = lib.flare(); scene.add(flare.group);

      /* ---------- SPACE ---------- */
      const gSpace = new THREE.Group(); scene.add(gSpace);
      const Sdir = new V3(0.7, 0.3, -0.65).normalize();
      const planet = lib.planet({ radius: 100, sunDir: Sdir });
      gSpace.add(planet.group);
      const T = new V3(0.8, 0.25, 0.55).normalize();           // Aegean target direction
      planet.uniforms.uTarget.value.copy(T);
      const sunSpace = Sdir.clone();

      /* ---------- ISLAND (approach) ---------- */
      const gIsland = new THREE.Group(); scene.add(gIsland);
      lib.setSun(env, 0.0, 0.1);                                // so terrain bakes warm shadows
      const sunAz = 0.12;
      lib.setSun(env, 0.04, sunAz);
      const patmos = lib.terrain({ env, x0: -1700, x1: 1700, z0: -1900, z1: 1900, cell: q === 'low' ? 18 : hi ? 11 : 14, detail: 0.02,
        height: lib.islandHeight(0, 0, 900, 1300, 170, 11) });
      gIsland.add(patmos);
      [[2100, -900, 260, 55, 21], [-300, 2600, 340, 80, 33], [2600, 900, 200, 40, 41], [-2200, -1300, 220, 36, 51]].forEach((s) => {
        const m = lib.terrain({ env, x0: s[0] - s[2] * 2.2, x1: s[0] + s[2] * 2.2, z0: s[1] - s[2] * 2.2, z1: s[1] + s[2] * 2.2, cell: 16, detail: 0.02, height: lib.islandHeight(s[0], s[1], s[2], s[2] * 1.2, s[3], s[4]) });
        gIsland.add(m);
      });

      /* ---------- CLIFF (Patmos shore, shared set) ---------- */
      const cs = lib.cliffScene(ctx, env); const gCliff = cs.group; scene.add(gCliff);
      const john = cs.john, jc = cs.jc, jp = cs.jWorld;

      /* ---------- CAMERA (absolute episode time) ---------- */
      const pt = (v, k) => v.clone().multiplyScalar(k);
      const Tp = pt(T, 100);
      const E = Sdir.clone().sub(T.clone().multiplyScalar(Sdir.dot(T))).normalize();
      const at = (h, b) => { const v = T.clone().multiplyScalar(100 + h).addScaledVector(E, -b); return [v.x, v.y, v.z]; };
      const lookAtT = (k) => { const v = T.clone().multiplyScalar(100).addScaledVector(E, k); return [v.x, v.y, v.z]; };
      const P = (arr) => arr;
      const shots = [
        // 0 – 14.5: space, tilt & drift toward the dawn side
        { t0: 0, t1: 14.6,
          pos: [[0, 0, 14, 420], [4.5, 10, 16, 395], [9, 34, 22, 330], [14.6, 62, 30, 250]],
          look: [[0, 0, 70, 700], [4.5, 20, 40, 300], [8, 25, 8, 0], [14.6, 62, 24, 20]],
          fov: [[0, 36], [14.6, 36]], shake: 0.0 },
        // 14.6 – 24.6: the dive (toward the dawn side, sun ahead)
        { t0: 14.6, t1: 24.6,
          pos: [[14.6, 62, 30, 250], [18.5, ...at(70, 95)], [22, ...at(16, 34)], [24.6, ...at(1.8, 8)]],
          look: [[14.6, 62, 24, 20], [18.5, ...lookAtT(5)], [22, ...lookAtT(22)], [24.6, ...lookAtT(70)]],
          fov: [[14.6, 36], [22, 46], [24.6, 62]], shake: [[14.6, 0], [20, 0.1], [24.6, 0.9]], shakeScale: 1 },
        // 24.6 – 36.6: low along the sea, Patmos on the left, sunrise ahead; then rising
        { t0: 24.6, t1: 36.6,
          pos: [[24.6, -1700, 20, -1720], [28.5, -1120, 34, -1680], [32.5, -420, 80, -1640], [36.6, 260, 140, -1580]],
          look: [[24.6, 300, 70, -1200], [28.5, 900, 60, -1400], [32.5, 1500, 55, -1450], [36.6, 2000, 45, -1380]],
          fov: [[24.6, 42], [36.6, 34]], shake: 0.14, shakeScale: 1 },
        // 36.6 – 43.2: cliff, wide establishing
        { t0: 36.6, t1: 43.2,
          pos: [[36.6, ...jc(1.35, -13.5, 6.8)], [43.2, ...jc(1.6, -9.2, 3.8)]],
          look: [[36.6, ...jc(1.5, 0.6, 0.2)], [43.2, ...jc(1.55, 0.8, 0)]],
          fov: [[36.6, 34], [43.2, 30]], shake: 0.01, shakeScale: 0.3 },
        // 43.2 – 50.2: behind the shoulder, push in
        { t0: 43.2, t1: 50.2,
          pos: [[43.2, ...jc(1.2, -4.2, 1.3)], [50.2, ...jc(1.55, -2.35, 0.4)]],
          look: [[43.2, ...jc(1.5, 1.2, 0)], [50.2, ...jc(1.58, 2.5, 0)]],
          fov: [[43.2, 30], [50.2, 24]], shake: 0.015, shakeScale: 0.3 },
        // 50.2 – 60: arc through profile and settle behind him as the wind rises
        { t0: 50.2, t1: 60,
          pos: [[50.2, ...jc(1.4, -3.2, 2.6)], [54.2, ...jc(1.35, -0.7, 3.5)], [58, ...jc(1.7, -5.6, 0.8)], [60, ...jc(1.75, -6.2, 0.7)]],
          look: [[50.2, ...jc(1.38, 0.2, 0)], [54.2, ...jc(1.4, 0.4, 0)], [58, ...jc(1.7, 3, 0)], [60, ...jc(1.75, 4, 0)]],
          fov: [[50.2, 28], [54, 26], [60, 30]], shake: [[50.2, 0.01], [56, 0.05], [60, 0.09]], shakeScale: 0.4 },
      ];

      const tmp = new V3(), sdir = new V3();
      return {
        shots,
        update(t, c) {
          const inSpace = t < 24.7, inIsland = t >= 24.7 && t < 36.7, inCliff = t >= 36.7;
          gSpace.visible = inSpace; sky.visible = !inSpace; sea.visible = !inSpace;
          gIsland.visible = inIsland; gCliff.visible = inCliff;
          stars.visible = true; milky.visible = true;
          if (inSpace) env.uStar.value = 1;

          /* sun rises through the second half */
          const el = inSpace ? 0.04 : lerp(-0.045, 0.085, smooth(24.6, 58, t));
          lib.setSun(env, el, sunAz);
          if (!inSpace) lib.setSun(env, el, sunAz);
          sdir.copy(env.uSunDir.value);
          env.uTime.value = t; env.uPR.value = c.renderer.getPixelRatio();
          planet.uniforms.uTime.value = t;
          planet.uniforms.uCloudBoost.value = smooth(18, 23, t) * 0.55;
          const wind = inCliff ? lerp(0.22, 1.0, Math.pow(smooth(44, 59, t), 1.4)) : 0.25;
          env.uWind.value = wind;
          env.uWaveAmp.value = inCliff ? lerp(0.9, 1.7, smooth(46, 60, t)) : 1.0;
          if (inIsland) { const gh = patmos.userData.heightAt(camera.position.x, camera.position.z); if (camera.position.y < gh + 35) camera.position.y = gh + 35; }
          sky.position.copy(camera.position);
          milky.position.copy(camera.position); stars.position.copy(camera.position);
          sea.position.set(camera.position.x, 0, camera.position.z);
          if (inCliff) cs.update(t, wind, sdir, camera);

          /* sun flare + rays */
          const sunVisible = inSpace ? 1 : 1;
          if (inSpace) {
            flare.update(camera, sunSpace, smooth(0.3, 7, t) * (1 - smooth(14, 22, t)) * 0.9, 1.0);
            fx.sunWorld = tmp.copy(camera.position).addScaledVector(sunSpace, 1500); fx.rays = 0.5 * (1 - smooth(14, 20, t));
          } else {
            flare.update(camera, sdir, 0.55 + 0.45 * smooth(24.6, 58, t), 1.0);
            fx.sunWorld = tmp.copy(camera.position).addScaledVector(sdir, 1500);
            fx.rays = inCliff ? 0.55 : 0.4; fx.raysCol = [1, 0.72, 0.42];
          }

          /* ---------- grade & transitions ---------- */
          fx.bloom = inSpace ? 0.55 : 0.85; fx.bloomRadius = 0.8; fx.bloomThreshold = inSpace ? 1.0 : 0.8;
          fx.grain = 0.055; fx.vignette = 0.6; fx.aber = 0.0018;
          fx.tint = [1.05, 0.99, 0.93]; fx.shadow = [0.8, 0.9, 1.15]; fx.contrast = 1.08; fx.saturation = 1.08;
          fx.exposure = inSpace ? 1.0 : 1.05;
          if (t < 6.4) { fx.exposure = 0.9; }
          // studio sting: darkness first, stars fade up under logo
          let fade = 0;
          fade = Math.max(fade, 1 - smooth(0.0, 0.9, t));                       // 0 -> in
          if (t > 0.9 && t < 4.7) fade = Math.max(fade, 0.65 * (1 - smooth(0.9, 1.6, t)) );
          fade = Math.max(fade, 0.78 * (1 - smooth(4.2, 6.4, t)) * (t < 6.5 ? 1 : 0));  // logo dim -> reveal
          fade = Math.max(fade, smooth(58.1, 59.9, t));                          // out
          fx.fade = clamp(fade);
          // cloud white-out between space and island
          const wo = smooth(22.4, 24.4, t) * (1 - smooth(24.6, 27.2, t));
          fx.flash = clamp(wo); fx.flashCol = [1.0, 0.95, 0.88];
          // warm light-leak at the cut to the cliff
          const leak = Math.exp(-Math.pow((t - 36.7) / 0.35, 2)) * 0.55; if (leak > fx.flash) { fx.flash = leak; fx.flashCol = [1.0, 0.72, 0.35]; }
        },
      };
    },

    /* ===================================================== SCORE ===== */
    score(A, from) {
      const D2 = 73.42, A2 = 110, D3 = 146.83, F3 = 174.61, A3 = 220, Bb3 = 233.08, C4 = 261.63, D4 = 293.66, F4 = 349.23, G4 = 392, A4 = 440, Bb4 = 466.16, D5 = 587.33, F5 = 698.46, G5 = 783.99, A5 = 880;
      /* studio sting */
      A.voice({ type: 'sine', freq: [[0.3, 48], [4.6, 82]], t0: 0.3, t1: 5.2, gain: 0.28, attack: 2.2, release: 1.2, wet: 0.3 });
      A.shimmer(0.6, A4, { dur: 4.2, gain: 0.06 });
      A.bell(1.5, A5, { gain: 0.09, dur: 4 }); A.bell(2.7, 659.25, { gain: 0.07, dur: 3.6 }); A.bell(3.6, A5 * 1.5, { gain: 0.045, dur: 3 });
      /* the void, then the title */
      A.drone(4.2, 58.5, D2, { gain: 0.14, attack: 3 });
      A.pad(5, 17, [D3, A3, D4], { gain: 0.03, attack: 3, wet: 0.7 });
      A.boom(6.3, { freq: 46, gain: 0.85, dur: 3.2 });
      A.brass(6.2, 11, D3, { gain: 0.07, attack: 0.9, release: 1.4 });
      A.choir(7.5, 24.5, [D3, A3, D4, F4], { gain: 0.04, attack: 3.5, release: 2.5 });
      /* main motif (bells) while the verses begin */
      [[12.8, D5], [14.4, A4], [16.0, Bb4], [18.2, A4]].forEach(([t, f]) => A.bell(t, f, { gain: 0.11, dur: 4 }));
      /* descent */
      A.riser(14.8, 23.6, { f0: 220, f1: 6500, gain: 0.2 });
      A.voice({ type: 'sawtooth', freq: [[14.8, D2 * 2], [23.6, D3 * 2]], t0: 14.8, t1: 24.2, gain: 0.07, attack: 3, release: 1.2, wet: 0.45, filter: { type: 'lowpass', freq: [[14.8, 200], [23.6, 2400]], q: 1 } });
      A.boom(23.7, { freq: 70, gain: 0.5, dur: 2.6 });
      A.noise({ t0: 23.0, t1: 25.4, gain: 0.22, attack: 0.9, release: 1.2, filter: { type: 'bandpass', freq: [[23, 800], [24.4, 2600], [25.4, 500]], q: 0.5 }, wet: 0.5 });
      /* dawn over the Aegean */
      A.sea(24, 60, { gain: 0.1 });
      A.wind(24.5, 60, { gain: 0.06 });
      A.pad(24.2, 41, [F3, A3, C4, G4], { gain: 0.04, attack: 3, wet: 0.7 });
      [[26.2, F5], [27.9, A5], [29.6, G5], [31.4, F5], [33.4, A4 * 2 * 1.122], [35.2, A5]].forEach(([t, f]) => A.bell(t, f, { gain: 0.07, dur: 3.2 }));
      /* Patmos */
      A.choir(36.4, 52.5, [D3, A3, D4, F4, A4], { gain: 0.048, attack: 2.6, release: 2.5 });
      A.brass(37.4, 46.2, D3, { gain: 0.07, attack: 2, release: 1.8 });
      [[40.0, D5], [41.6, A4], [43.2, Bb4], [45.2, A4]].forEach(([t, f]) => A.bell(t, f, { gain: 0.11, dur: 4 }));
      /* the wind rises */
      A.wind(46, 60, { gain: 0.15, bright: 1.3 });
      A.riser(50.5, 58.4, { f0: 300, f1: 3000, gain: 0.1 });
      A.brass(50.5, 58.2, D3 * 0.5, { gain: 0.075, attack: 3.5, release: 1.2 });
      A.brass(56.4, 59.9, G4, { gain: 0.05, attack: 1.6, release: 1.2, wet: 0.85 });
    },
  });

  /* ====================================================== EPISODE 2 ===== */
  /* Grace and Peace · Revelation 1:4–8 · opens on the final frame of Episode 1 */
  Aura.define(2, {
    duration: 72,
    cues: Aura.autoCues(['1:4', '1:5', '1:6', '1:7', '1:8'], 5.0, 2.5, 0.6),
    titles: [
      { t0: 1.3, t1: 4.8, fi: 1.0, fo: 0.8, cls: 'epcard', html: '<div class="ec-k">REVELATION · EPISODE 2</div><div class="ec-t">Grace and Peace</div><div class="ec-l"></div>' },
    ],

    build(ctx) {
      const { scene, camera, fx, lib, renderer } = ctx;
      const env = lib.env(); env.uPR.value = renderer.getPixelRatio();
      const hi = ctx.quality === 'high';
      const sunAz = 0.12;
      lib.setSun(env, 0.085, sunAz);

      scene.add(lib.milkyWay(env)); const stars = lib.stars(env, { count: hi ? 9000 : 5000 }); scene.add(stars);
      const sky = lib.sky(env); scene.add(sky);
      const sea = lib.sea(env); scene.add(sea);
      const flare = lib.flare(); scene.add(flare.group);
      const cs = lib.cliffScene(ctx, env); scene.add(cs.group);
      const jc = cs.jc;

      /* seven lamps over the seven assemblies of Asia */
      lib.reseed(2024);
      const lamps = [];
      for (let i = 0; i < 7; i++) {
        const sp = lib.orb(1.0, 0.82, 0.5); sp.renderOrder = 5; scene.add(sp);
        const u = (i - 3) / 3;
        lamps.push({ sp, i, az0: -0.74 + i * 0.105, el0: 0.012 + 0.008 * Math.abs(Math.sin(i * 2.1)), az1: -0.04 + u * 0.5, el1: 0.38 + 0.13 * (1 - u * u), ign: 7.6 + i * 1.35, rise: 35.4 + i * 0.28 });
      }
      /* clouds that gather and part */
      const texes = [lib.cloudTex(11), lib.cloudTex(23), lib.cloudTex(37)];
      lib.reseed(555);
      const clouds = [];
      for (let k = 0; k < (hi ? 56 : 36); k++) {
        const side = k % 2 ? 1 : -1;
        const m = new THREE.SpriteMaterial({ map: texes[k % 3], transparent: true, depthWrite: false, opacity: 0 });
        const sp = new THREE.Sprite(m); sp.renderOrder = 3; scene.add(sp);
        clouds.push({ sp, side, a0: 0.015 + Math.pow(lib.rnd(), 0.8) * 0.62, el: 0.16 + lib.rnd() * 0.6, dist: 1250 + lib.rnd() * 450, size: 560 + lib.rnd() * 620, rot: (lib.rnd() - 0.5) * 0.5 });
      }
      const GAZ = 0.05, GEL = 0.43;
      const core = lib.orb(1.0, 0.86, 0.6); core.renderOrder = 4; scene.add(core);
      const shaft = lib.shaft(); scene.add(shaft);
      const alpha = lib.glyph('\u0391'), omega = lib.glyph('\u03A9'); alpha.renderOrder = omega.renderOrder = 6; scene.add(alpha, omega);

      /* camera helpers: look target = position + 60 * direction(az, el) */
      const L = (p, az, el) => { const d = lib.dirOf(az, el); return [p[0] + d.x * 60, p[1] + d.y * 60, p[2] + d.z * 60]; };
      const p0 = jc(1.75, -6.2, 0.7), p8 = jc(1.85, -5.4, 0.9), p14 = jc(2.4, -6.4, -0.4), p20 = jc(3.0, -7.4, -1.5), p28 = jc(3.4, -8.2, -1.0),
        p35 = jc(3.2, -7.0, 0.3), p41 = jc(2.8, -5.6, 0.6), p47 = jc(1.05, -4.4, 0.8), p58 = jc(1.0, -3.4, 0.8), p64 = jc(1.1, -3.8, 1.0), p675 = jc(1.6, -5.5, 1.4), p72 = jc(1.7, -5.8, 1.8);
      const lk675 = jc(1.55, 3.0, 0.2);
      const shots = [
        { t0: 0, t1: 8, pos: [[0, ...p0], [8, ...p8]], look: [[0, ...jc(1.75, 4, 0)], [8, ...L(p8, -0.12, 0.03)]], fov: [[0, 28], [8, 28]], shake: 0.02, shakeScale: 0.3 },
        { t0: 8, t1: 20, pos: [[8, ...p8], [14, ...p14], [20, ...p20]], look: [[8, ...L(p8, -0.12, 0.03)], [14, ...L(p14, -0.28, 0.035)], [20, ...L(p20, -0.3, 0.05)]], fov: [[8, 28], [20, 33]], shake: 0.015, shakeScale: 0.3 },
        { t0: 20, t1: 35, pos: [[20, ...p20], [28, ...p28], [35, ...p35]], look: [[20, ...L(p20, -0.3, 0.05)], [28, ...L(p28, -0.16, 0.08)], [35, ...L(p35, -0.05, 0.12)]], fov: [[20, 33], [35, 36]], shake: 0.012, shakeScale: 0.3 },
        { t0: 35, t1: 47, pos: [[35, ...p35], [41, ...p41], [47, ...p47]], look: [[35, ...L(p35, -0.05, 0.12)], [41, ...L(p41, 0.0, 0.3)], [47, ...L(p47, 0.05, 0.42)]], fov: [[35, 36], [47, 40]], shake: 0.02, shakeScale: 0.3 },
        { t0: 47, t1: 58, pos: [[47, ...p47], [58, ...p58]], look: [[47, ...L(p47, 0.05, 0.42)], [52, ...L(jc(1.03, -3.9, 0.8), 0.05, 0.46)], [58, ...L(p58, 0.05, 0.5)]], fov: [[47, 40], [58, 42]], shake: [[47, 0.02], [58, 0.05]], shakeScale: 0.3 },
        { t0: 58, t1: 67.5, pos: [[58, ...p58], [64, ...p64], [67.5, ...p675]], look: [[58, ...L(p58, 0.05, 0.5)], [63, ...L(p64, 0.05, 0.5)], [67.5, ...lk675]], fov: [[58, 42], [67.5, 30]], shake: 0.03, shakeScale: 0.3 },
        { t0: 67.5, t1: 72, pos: [[67.5, ...p675], [72, ...p72]], look: [[67.5, ...lk675], [72, ...jc(1.6, 3, 0.1)]], fov: [[67.5, 30], [72, 28]], shake: 0.03, shakeScale: 0.3 },
      ];

      const dir = new THREE.Vector3(), sdir = new THREE.Vector3(), tmp = new THREE.Vector3();
      const place = (obj, az, el, dist) => { lib.dirOf(az, el, dir); obj.position.copy(camera.position).addScaledVector(dir, dist); };
      return {
        shots,
        update(t, c) {
          const el = THREE.MathUtils.lerp(0.085, 0.13, smooth(0, 72, t));
          lib.setSun(env, el, sunAz); env.uHor.value.multiplyScalar(0.58); env.uSunCol.value.multiplyScalar(0.8); sdir.copy(env.uSunDir.value);
          env.uTime.value = t; env.uPR.value = c.renderer.getPixelRatio(); env.uStar.value = 0.6;
          const wind = t < 12 ? lerp(1.0, 0.55, smooth(0, 12, t)) : lerp(0.55, 0.75, smooth(30, 58, t)) * (1 - 0.25 * smooth(66, 72, t));
          env.uWind.value = wind; env.uWaveAmp.value = lerp(1.7, 1.2, smooth(0, 14, t));
          sky.position.copy(camera.position); stars.position.copy(camera.position); sea.position.set(camera.position.x, 0, camera.position.z);
          cs.update(t, wind, sdir, camera);

          /* seven lamps */
          for (const L7 of lamps) {
            const ig = smooth(L7.ign, L7.ign + 0.9, t), pop = Math.exp(-Math.pow((t - L7.ign - 0.25) / 0.45, 2));
            const rise = smooth(L7.rise, L7.rise + 8.5, t), rs = rise * rise * (3 - 2 * rise);
            const az = lerp(L7.az0, L7.az1, rs), elv = lerp(L7.el0, L7.el1, rs);
            place(L7.sp, az, elv, 1400);
            const flick = 0.9 + 0.1 * Math.sin(t * 7.3 + L7.i * 3.1) * Math.sin(t * 3.7 + L7.i);
            const sz = lerp(95, 190, rs) * (0.55 + 0.45 * ig) * flick + pop * 120;
            L7.sp.scale.set(sz, sz, 1);
            L7.sp.material.opacity = clamp(ig);
            L7.sp.visible = ig > 0.001;
          }

          /* clouds */
          const gather = smooth(40, 47, t), part = smooth(47, 57, t), fade = 1 - smooth(63, 72, t) * 0.7;
          for (const C of clouds) {
            const spread = lerp(1.7, 1.0, gather) + part * 1.1;
            const az = GAZ + C.side * C.a0 * spread * 1.0;
            place(C.sp, az, C.el, C.dist);
            const prox = Math.exp(-Math.pow(C.a0 * spread / 0.35, 2));
            const sunk = Math.max(0, Math.cos((az - sunAz) * 1.0));
            const br = 0.16 + 1.25 * prox * (0.4 + 0.6 * part) + 0.3 * sunk;
            C.sp.material.color.setRGB(0.55 * br + 0.10, 0.42 * br + 0.07, 0.4 * br + 0.09);
            C.sp.material.opacity = 0.9 * gather * fade;
            C.sp.material.rotation = C.rot;
            C.sp.scale.set(C.size * (0.9 + 0.2 * smooth(40, 57, t)), C.size * 0.62, 1);
            C.sp.visible = gather > 0.001;
          }
          const lightK = smooth(47, 57, t);
          place(core, GAZ, GEL, 1500); const cs0 = 900 + 700 * lightK; core.scale.set(cs0, cs0, 1); core.material.opacity = clamp(lightK * 0.5) * fade; core.visible = lightK > 0.001;
          lib.dirOf(GAZ, GEL, dir);
          shaft.position.set(camera.position.x + Math.cos(GAZ) * 900, 0, camera.position.z + Math.sin(GAZ) * 900);
          const hgt = 900 * Math.tan(GEL) + camera.position.y; shaft.scale.set(80 + 40 * lightK, hgt, 80 + 40 * lightK);
          shaft.material.uniforms.uInt.value = 0.8 * smooth(49, 57, t) * fade; shaft.visible = lightK > 0.001;

          /* Alpha and Omega */
          const rA = smooth(57.6, 62.2, t), rO = smooth(58.9, 63.6, t), gf = 1 - smooth(68.5, 72, t);
          place(alpha, GAZ - 0.27, 0.52, 1100); place(omega, GAZ + 0.27, 0.52, 1100);
          alpha.lookAt(camera.position); omega.lookAt(camera.position); alpha.scale.set(470, 470, 1); omega.scale.set(470, 470, 1);
          alpha.material.uniforms.uReveal.value = rA; omega.material.uniforms.uReveal.value = rO;
          alpha.material.uniforms.uTime.value = t; omega.material.uniforms.uTime.value = t;
          alpha.material.uniforms.uBright.value = omega.material.uniforms.uBright.value = 2.3 * gf;
          alpha.visible = omega.visible = rA > 0.001;

          /* sun flare + rays */
          flare.update(camera, sdir, 0.6 * (1 - 0.6 * smooth(50, 58, t)), 1.0);
          const toGap = smooth(47, 52, t) * (1 - smooth(64, 68, t));
          if (toGap > 0.01) { lib.dirOf(GAZ, GEL, dir); fx.sunWorld = tmp.copy(camera.position).addScaledVector(dir, 1400); fx.rays = 0.6 * toGap; }
          else { fx.sunWorld = tmp.copy(camera.position).addScaledVector(sdir, 1500); fx.rays = 0.22; }
          fx.raysCol = [1, 0.74, 0.44];

          /* grade */
          const wash = smooth(26, 29, t) * (1 - smooth(33, 36, t));
          fx.bloom = 0.7 + 0.15 * wash + 0.12 * lightK; fx.bloomRadius = 0.8; fx.bloomThreshold = 0.8;
          fx.grain = 0.055; fx.vignette = 0.6; fx.aber = 0.0018;
          fx.tint = [1.05 + 0.1 * wash, 0.99 - 0.05 * wash, 0.93 - 0.08 * wash]; fx.shadow = [0.8, 0.9, 1.15]; fx.contrast = 1.08; fx.saturation = 1.08 + 0.12 * wash;
          fx.exposure = lerp(0.95, 0.66, smooth(1, 12, t));
          fx.fade = clamp(Math.max(1 - smooth(0, 1.2, t), smooth(70.6, 72, t)));
        },
      };
    },

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

  /* ====================================================== EPISODE 3 ===== */
  /* On the Lord's Day · Revelation 1:9–11 · opens on the final frame of Episode 2 */
  Aura.define(3, {
    duration: 60,

    cues: [
      { ref: '1:9',  t0: 9.0,  t1: 23.0 },
      { ref: '1:10', t0: 23.6, t1: 32.0 },
      { ref: '1:11', t0: 32.6, t1: 47.8 },
    ],

    titles: [
      { t0: 1.3, t1: 4.8, fi: 1.0, fo: 0.8, cls: 'epcard', html: '<div class="ec-k">REVELATION · EPISODE 3</div><div class="ec-t">On the Lord’s Day</div><div class="ec-l"></div>' },
    ],

    build(ctx) {
      const { scene, camera, fx, lib, renderer } = ctx;
      const env = lib.env(); env.uPR.value = renderer.getPixelRatio();
      const q = ctx.quality, hi = q === 'high';
      const sunAz = 0.12;
      lib.setSun(env, 0.12, sunAz);

      scene.add(lib.milkyWay(env)); const stars = lib.stars(env, { count: hi ? 9000 : 5000 }); scene.add(stars);
      const sky = lib.sky(env); scene.add(sky);
      const sea = lib.sea(env); scene.add(sea);
      const flare = lib.flare(); scene.add(flare.group);
      const cs = lib.cliffScene(ctx, env); scene.add(cs.group);
      const john = cs.john, jW = cs.jWorld;

      /* the high ground behind the cliff: so the land has a horizon when we look inland */
      const back = lib.terrain({ env, x0: -2400, x1: -62, z0: 3600, z1: 8400, cell: q === 'low' ? 46 : 32, detail: 0.02,
        height: (x, z) => 9.4 + 3.1 * smooth(-62, -94, x) + 70 * smooth(-110, -900, x) * (0.5 + 0.5 * lib.noise.fbm(x * 0.0016 + 4, z * 0.0016, 4, 5)) + 3 * smooth(-100, -400, x) * lib.noise.perlin(x * 0.02, z * 0.02, 3) });
      scene.add(back);

      /* the rocky shore: foam and spray where the sea meets the cliff */
      const wl = lib.waterline(cs, -70, 70, 2);
      const wlx = wl[(wl.length / 2) | 0][0];
      const foam = lib.foam(env, wl, 6000); cs.group.add(foam);
      const spray = lib.spray(env, wl, { sources: hi ? 26 : 16, perBurst: hi ? 44 : 28 }); cs.group.add(spray);
      /* the set's own boulders: darker, rounder */
      cs.group.children.forEach((o) => {
        if (!(o.isMesh && o.geometry && o.geometry.type === 'IcosahedronGeometry')) return;
        const pp = o.geometry.attributes.position, nn = new Float32Array(pp.count * 3), v = new THREE.Vector3();
        for (let k = 0; k < pp.count; k++) { v.set(pp.getX(k), pp.getY(k) / 0.5, pp.getZ(k)).normalize(); nn.set([v.x, v.y, v.z], k * 3); }
        o.geometry.setAttribute('normal', new THREE.BufferAttribute(nn, 3));
        o.material.color.set(0x3b342d); o.material.emissive.setRGB(0.008, 0.006, 0.005);
      });
      /* the cliff face: stratified, darker and wetter toward the sea */
      (function () {
        const g = cs.terrain.geometry, P = g.attributes.position, N = g.attributes.normal, Cc = g.attributes.aCol;
        const dark = [0.014, 0.019, 0.03], mid = [0.05, 0.068, 0.098], lite = [0.12, 0.145, 0.18];
        for (let i = 0; i < P.count; i++) {
          const x = P.getX(i), y = P.getY(i), z = P.getZ(i), k = smooth(0.04, 0.3, 1 - N.getY(i));
          if (k <= 0) continue;
          const n = lib.noise.fbm(x * 0.3 + z * 0.06, y * 0.8, 3, 21) * 0.5 + 0.5, band = 0.5 + 0.5 * Math.sin(y * 2.1 + n * 5.5 + z * 0.12) * (0.4 + 0.6 * (lib.noise.fbm(x * 0.8 + z * 0.9, y * 0.15, 3, 44) * 0.5 + 0.5)), wet = 1 - smooth(0.4, 3.6, y);
          const c = [0, 1, 2].map((m) => lerp(lerp(mid[m], lite[m], band * n), dark[m], wet * 0.85));
          for (let m = 0; m < 3; m++) Cc.array[i * 3 + m] = lerp(Cc.array[i * 3 + m], c[m], k);
        }
        Cc.needsUpdate = true;
      })();
      {
        lib.reseed(31337);
        const rm = new THREE.MeshStandardMaterial({ color: Aura.col(0x2a2a2c), roughness: 0.6, metalness: 0, emissive: new THREE.Color(0.012, 0.011, 0.01) });
        for (let i = 0; i < (hi ? 46 : 28); i++) {
          const pt = wl[(lib.rnd() * wl.length) | 0], r = 0.5 + Math.pow(lib.rnd(), 2) * 1.9, g = new THREE.IcosahedronGeometry(r, 2), pp = g.attributes.position;
          for (let k = 0; k < pp.count; k++) { const sc = 1 + 0.32 * lib.noise.perlin(pp.getX(k) * 2.2 + i, pp.getZ(k) * 2.2, 3) + 0.12 * lib.noise.perlin(pp.getX(k) * 7, pp.getY(k) * 7, 5); pp.setXYZ(k, pp.getX(k) * sc, pp.getY(k) * sc * 0.72, pp.getZ(k) * sc); }
          { const nn = new Float32Array(pp.count * 3); for (let k = 0; k < pp.count; k++) { const v = new THREE.Vector3(pp.getX(k), pp.getY(k) / 0.52, pp.getZ(k)).normalize(); nn.set([v.x, v.y, v.z], k * 3); } g.setAttribute('normal', new THREE.BufferAttribute(nn, 3)); }
          const m = new THREE.Mesh(g, rm); m.position.set(pt[0] + 0.2 + lib.rnd() * 2.6, -0.05 + r * 0.1, pt[1] + (lib.rnd() - 0.5) * 2); m.rotation.y = lib.rnd() * 6; cs.group.add(m);
        }
      }
      /* the pressure of the voice lifts the dust */
      lib.reseed(909);
      const GN = hi ? 260 : 150, gA = new Float32Array(GN * 3), gS = new Float32Array(GN * 3);
      for (let i = 0; i < GN; i++) { gA.set([-190 + lib.rnd() * 170, jW.y + 0.1 + Math.pow(lib.rnd(), 1.4) * 6, (lib.rnd() - 0.5) * 30], i * 3); gS.set([30 + lib.rnd() * 28, 0.7 + lib.rnd() * 2.0, lib.rnd()], i * 3); }
      const gGeo = new THREE.BufferGeometry(); gGeo.setAttribute('position', new THREE.BufferAttribute(gA, 3)); gGeo.setAttribute('aS', new THREE.BufferAttribute(gS, 3));
      const gust = new THREE.Points(gGeo, new THREE.ShaderMaterial({
        uniforms: { uT: { value: 0 }, uVH: { value: 800 }, uSunCol: env.uSunCol, uAmbS: env.uAmbS },
        vertexShader: 'attribute vec3 aS; uniform float uT,uVH; varying float vA; void main(){ vec3 p=position; p.x+=aS.x*uT; p.y+=sin(uT*3.0+aS.z*30.0)*0.5; vec4 mv=modelViewMatrix*vec4(p,1.0); float d=max(-mv.z,0.5); vA=step(0.001,uT)*(1.0-smoothstep(2.2,3.2,uT))*smoothstep(0.8,2.5,d)*(0.45+0.55*aS.z); gl_PointSize=clamp(aS.y*(1.0+uT*0.6)*projectionMatrix[1][1]*uVH*0.5/d,1.0,110.0); gl_Position=projectionMatrix*mv; }',
        fragmentShader: 'uniform vec3 uSunCol,uAmbS; varying float vA; void main(){ float d=length(gl_PointCoord-0.5)*2.0; float a=smoothstep(1.0,0.1,d)*vA*0.32; vec3 c=vec3(0.5,0.38,0.27)*(0.2+uSunCol*0.12+uAmbS*1.5); gl_FragColor=vec4(c,a); }',
        transparent: true, depthWrite: false }));
      gust.frustumCulled = false; gust.renderOrder = 5; cs.group.add(gust);
      /* motes of light: "in the Spirit" */
      const motes = lib.motes(env, { count: hi ? 360 : 200, radius: 6, height: 9 }); motes.position.copy(john.group.position); cs.group.add(motes);

      /* the seven lamps over the seven assemblies, exactly where Episode 2 left them */
      const NAMES = ['EPHESUS', 'SMYRNA', 'PERGAMUM', 'THYATIRA', 'SARDIS', 'PHILADELPHIA', 'LAODICEA'];
      const lamps = [];
      for (let i = 0; i < 7; i++) {
        const sp = lib.orb(1.0, 0.82, 0.5); sp.renderOrder = 5; scene.add(sp);
        const u = (i - 3) / 3, az = -0.04 + u * 0.5, el = 0.38 + 0.13 * (1 - u * u);
        const tag = lib.nameTag(NAMES[i]); tag.renderOrder = 7; tag.material.opacity = 0; scene.add(tag);
        lamps.push({ sp, tag, i, az, el, ign: 42.0 + i * 0.95, off: i % 2 ? 0.15 : 0.075 });
      }
      if (document.fonts && document.fonts.load) document.fonts.load('700 100px Cinzel').then(() => lamps.forEach((L) => { L.tag.userData.redraw(); })).catch(() => {});

      /* the last of Episode 2's clouds and light, drifting away */
      const texes = [lib.cloudTex(11), lib.cloudTex(23), lib.cloudTex(37)];
      lib.reseed(555);
      const clouds = [];
      for (let k = 0; k < (hi ? 56 : 36); k++) {
        const side = k % 2 ? 1 : -1;
        const m = new THREE.SpriteMaterial({ map: texes[k % 3], transparent: true, depthWrite: false, opacity: 0 });
        const sp = new THREE.Sprite(m); sp.renderOrder = 3; scene.add(sp);
        clouds.push({ sp, side, a0: 0.015 + Math.pow(lib.rnd(), 0.8) * 0.62, el: 0.16 + lib.rnd() * 0.6, dist: 1250 + lib.rnd() * 450, size: 560 + lib.rnd() * 620, rot: (lib.rnd() - 0.5) * 0.5 });
      }
      const GAZ = 0.05, GEL = 0.43;
      const core = lib.orb(1.0, 0.86, 0.6); core.renderOrder = 4; scene.add(core);
      const shaft = lib.shaft(); scene.add(shaft);

      const hairMats = []; { const hc = Aura.col(0x8f8a80); john.group.traverse((o) => { if (o.isMesh && o.material && o.material.color && Math.abs(o.material.color.r - hc.r) < 0.004 && Math.abs(o.material.color.b - hc.b) < 0.004 && hairMats.indexOf(o.material) < 0) hairMats.push(o.material); }); }
      /* a warm glory that finds John as he turns */
      const glory = new THREE.DirectionalLight(0xffd8a0, 0); scene.add(glory); scene.add(glory.target);

      /* ---------------- camera ---------------- */
      const Jr = (dx, dy, dz) => [jW.x + dx, jW.y + dy, jW.z + dz];          // relative to John's feet
      const Pw = (dx, y, dz) => [jW.x + dx, y, jW.z + dz];                    // absolute height
      const arc = (p, psi, pitch) => [p[0] + 20 * Math.cos(psi) * Math.cos(pitch), p[1] + 20 * Math.sin(pitch), p[2] + 20 * Math.sin(psi) * Math.cos(pitch)];
      const dirPt = (p, az, el) => { const d = lib.dirOf(az, el); return [p[0] + d.x * 60, p[1] + d.y * 60, p[2] + d.z * 60]; };
      const pBlast = Jr(-1.3, 1.6, 1.7);
      const pSky = Jr(-2.4, 1.5, 0.4), pSky2 = Jr(-2.6, 1.5, 0.4), pSky3 = Jr(-3.4, 1.45, 0.5);
      const TR = 29.4;
      const shots = [
        /* 0 – 9   Continuity: Episode 2's last frame, behind John */
        { t0: 0, t1: 9, pos: [[0, ...Jr(-5.8, 1.7, 1.8)], [9, ...Jr(-5.1, 1.78, 1.4)]], look: [[0, ...Jr(3, 1.6, 0.1)], [9, ...Jr(3, 1.62, 0.2)]], fov: [[0, 28], [9, 29]], shake: 0.03, shakeScale: 0.3 },
        /* 9 – 16.5   The isle: from the sea, the rocky shore and the small figure above it */
        { t0: 9, t1: 16.5, pos: [[9, ...Pw(wlx + 34, 2.2, 20)], [16.5, ...Pw(wlx + 24, 3.4, 11)]], look: [[9, ...Pw(1, 7.4, 0)], [16.5, ...Pw(0.8, jW.y + 0.5, 0)]], fov: [[9, 32], [16.5, 33]], shake: 0.05, shakeScale: 0.6 },
        /* 16.5 – 23.4   Over the edge: surf breaking on the rocks below */
        { t0: 16.5, t1: 23.4, pos: [[16.5, ...Pw(wlx + 13, 1.7, 11)], [20, ...Pw(wlx + 11, 2.2, 6)], [23.4, ...Pw(wlx + 9, 2.8, 2)]], look: [[16.5, ...Pw(wlx + 0.5, 2.2, -1)], [20, ...Pw(wlx, 3.2, -1.5)], [23.4, ...Pw(0.6, jW.y + 0.9, 0)]], fov: [[16.5, 38], [23.4, 36]], shake: 0.04, shakeScale: 0.4 },
        /* 23.4 – 29.4   In the Spirit: close behind John, the world hushing */
        { t0: 23.4, t1: TR, pos: [[23.4, ...Jr(-3.4, 1.5, 2.6)], [TR, ...pBlast]], look: [[23.4, ...Jr(0.3, 1.45, 0)], [TR, ...Jr(0.35, 1.5, 0)]], fov: [[23.4, 30], [TR, 24]], shake: 0.0, shakeScale: 0.3 },
        /* 29.4 – 30.25   The voice: whip-pan to look behind */
        { t0: TR, t1: 30.25, pos: [[TR, ...pBlast], [30.25, ...pBlast]],
          look: [[TR, ...arc(pBlast, -0.8, -0.04)], [TR + 0.12, ...arc(pBlast, -1.45, 0.0)], [TR + 0.26, ...arc(pBlast, -2.35, 0.03)], [TR + 0.4, ...arc(pBlast, -3.05, 0.04)], [TR + 0.55, ...arc(pBlast, -3.35, 0.05)], [30.25, ...arc(pBlast, -3.45, 0.05)]],
          fov: [[TR, 24], [TR + 0.3, 38], [30.25, 32]], shake: [[TR, 1.6], [30.25, 1.0]], shakeScale: 0.3 },
        /* 30.25 – 31.9   Behind him: the grass laid flat, dust rolling away */
        { t0: 30.25, t1: 31.9, pos: [[30.25, ...pBlast], [31.9, ...Jr(-1.6, 1.62, 1.8)]], look: [[30.25, ...arc(pBlast, -3.45, 0.05)], [31.9, ...arc(Jr(-1.6, 1.62, 1.8), -3.62, 0.05)]], fov: [[30.25, 32], [31.9, 30]], shake: [[30.25, 0.9], [31.9, 0.3]], shakeScale: 0.3 },
        /* 31.9 – 32.5   Whip back, over the sea */
        { t0: 31.9, t1: 32.5, pos: [[31.9, ...Jr(-1.6, 1.62, 1.8)], [32.5, ...Jr(-1.5, 1.62, 1.8)]],
          look: [[31.9, ...arc(Jr(-1.6, 1.62, 1.8), -3.62, 0.05)], [32.05, ...arc(Jr(-1.6, 1.62, 1.8), -4.3, 0.0)], [32.2, ...arc(Jr(-1.6, 1.62, 1.8), -5.3, -0.03)], [32.35, ...arc(Jr(-1.5, 1.62, 1.8), -6.0, -0.05)], [32.5, ...arc(Jr(-1.5, 1.62, 1.8), -6.2, -0.07)]],
          fov: [[31.9, 30], [32.1, 36], [32.5, 34]], shake: [[31.9, 0.3], [32.5, 0.2]], shakeScale: 0.3 },
        /* 32.5 – 41.5   The rings of the sound crossing the sea */
        { t0: 32.5, t1: 41.5, pos: [[32.5, ...Jr(-1.5, 1.62, 1.8)], [41.5, ...Jr(-0.4, 2.9, 2.6)]], look: [[32.5, ...arc(Jr(-1.5, 1.62, 1.8), -6.2, -0.07)], [41.5, ...Pw(120, 6, 8)]], fov: [[32.5, 34], [41.5, 31]], shake: [[32.5, 0.2], [34, 0.05], [41.5, 0.03]], shakeScale: 0.3 },
        /* 41.5 – 49.5   Tilt up: the seven names written in light */
        { t0: 41.5, t1: 49.5, pos: [[41.5, ...pSky], [49.5, ...pSky2]], look: [[41.5, ...Pw(120, 6, 8)], [43, ...dirPt(pSky, 0.0, 0.16)], [45, ...dirPt(pSky, 0.0, 0.34)], [49.5, ...dirPt(pSky2, 0.03, 0.37)]], fov: [[41.5, 31], [45, 40], [49.5, 42]], shake: 0.02, shakeScale: 0.3 },
        /* 49.5 – 54   Wide: John's small silhouette under the seven */
        { t0: 49.5, t1: 54, pos: [[49.5, ...pSky2], [54, ...pSky3]], look: [[49.5, ...dirPt(pSky2, 0.03, 0.37)], [54, ...dirPt(pSky3, 0.02, 0.31)]], fov: [[49.5, 42], [54, 52]], shake: 0.015, shakeScale: 0.3 },
        /* 54 – 56.2   Down from the seven to the man beneath them */
        { t0: 54, t1: 56.2, pos: [[54, ...pSky3], [56.2, ...Jr(-3.0, 1.5, -0.4)]], look: [[54, ...dirPt(pSky3, 0.02, 0.31)], [56.2, ...Jr(0.4, 1.6, 0)]], fov: [[54, 52], [56.2, 32]], shake: 0.015, shakeScale: 0.3, ease: 'io2' },
        /* 56.2 – 60   He begins to turn */
        { t0: 56.2, t1: 60.1, pos: [[56.2, ...Jr(-3.0, 1.5, -0.4)], [60, ...Jr(-2.7, 1.55, -1.9)]], look: [[56.2, ...Jr(0.4, 1.6, 0)], [60, ...Jr(0.3, 1.62, -0.1)]], fov: [[56.2, 32], [60, 26]], shake: [[56.2, 0.015], [60, 0.04]], shakeScale: 0.3, ease: 'io2' },
      ];

      const dir = new THREE.Vector3(), sdir = new THREE.Vector3(), tmp = new THREE.Vector3();
      const place = (obj, az, el, dist) => { lib.dirOf(az, el, dir); obj.position.copy(camera.position).addScaledVector(dir, dist); };
      return {
        shots, cs, wlx, wl,
        update(t, c) {
          const spirit = smooth(23.4, 26.0, t) * (1 - smooth(29.25, 29.4, t));
          const blast = t >= TR ? Math.exp(-(t - TR) / 0.5) : 0;

          /* sun: a low, deepening dawn */
          const el = lerp(0.13, -0.025, smooth(22, 44, t));
          lib.setSun(env, el, sunAz); env.uHor.value.multiplyScalar(0.58); env.uSunCol.value.multiplyScalar(0.8); sdir.copy(env.uSunDir.value);
          env.uTime.value = t; env.uPR.value = c.renderer.getPixelRatio(); env.uStar.value = lerp(0.6, 1.0, smooth(22, 44, t));

          /* wind: breath, hush, then the blast */
          let wind = 0.56 - 0.06 * smooth(0, 9, t);
          wind = lerp(wind, 0.05, smooth(23.4, 26, t));
          if (t >= 28.8) wind = 0.02;
          if (t >= TR) wind = 0.5 * smooth(30.2, 36, t) + 2.0 * Math.exp(-(t - TR) / 0.9);
          wind += 0.28 * smooth(52, 60, t);
          env.uWind.value = wind;
          let wa = lerp(1.2, 0.95, smooth(0, 9, t));
          wa = lerp(wa, 0.5, smooth(23.4, 26, t)); if (t >= TR) wa = lerp(1.35, 1.0, smooth(TR, 41, t));
          env.uWaveAmp.value = wa;
          /* the pressure wave of the voice: across the land, then out over the water */
          env.uShock.value.set(jW.x - 70, jW.z, 70 + 58 * (t - 29.5), t >= TR ? 3.2 * smooth(TR, TR + 0.8, t) * (1 - smooth(42, 52, t)) : 0);
          env.uGust.value.set(-1.3 + 80 * (t - 29.45), 3.2, t > 29.2 && t < 30.4 ? 2.4 * (1 - smooth(29.9, 30.4, t)) : 0);

          sky.position.copy(camera.position); stars.position.copy(camera.position); sea.position.set(camera.position.x, 0, camera.position.z);
          john.group.rotation.y = 2.0 * smooth(53.6, 60, t);
          cs.update(t, Math.min(wind, 1.5), sdir, camera);
          foam.userData.update(t);
          const vh = c.renderer.domElement.height;
          spray.material.uniforms.uVH.value = vh; motes.material.uniforms.uVH.value = vh; gust.material.uniforms.uVH.value = vh; gust.material.uniforms.uT.value = Math.max(0, t - TR);
          const surf = 1 - 0.65 * smooth(23.4, 26, t) * (1 - smooth(29.3, 29.6, t));
          spray.material.uniforms.uAmt.value = surf; foam.material.uniforms.uAmt.value = surf;
          motes.material.uniforms.uAmt.value = spirit + 0.3 * smooth(40, 46, t) * (1 - smooth(56, 60, t));
          back.visible = true;

          /* lamps and names */
          const flick = (i) => 0.9 + 0.1 * Math.sin(t * 7.3 + i * 3.1) * Math.sin(t * 3.7 + i);
          for (const L of lamps) {
            place(L.sp, L.az, L.el, 1400);
            const pop = Math.exp(-Math.pow((t - L.ign - 0.25) / 0.5, 2));
            const sz = 190 * flick(L.i) + pop * 200 + 40 * smooth(L.ign, L.ign + 2, t);
            L.sp.scale.set(sz, sz, 1); L.sp.material.opacity = 1; L.sp.visible = true;
            const a = smooth(L.ign, L.ign + 1.1, t);
            place(L.tag, L.az, L.el - L.off, 1390);
            L.tag.scale.set(450, 450 * 192 / 1024, 1);
            const b = (1 + 2.2 * Math.exp(-(t - L.ign) / 0.45) * (t >= L.ign ? 1 : 0)) * (0.92 + 0.08 * Math.sin(t * 2 + L.i));
            L.tag.material.color.setRGB(b, b, b); L.tag.material.opacity = a * (1 - 0.5 * smooth(54, 59, t));
            L.tag.visible = a > 0.002;
          }

          /* residual clouds / core / shaft from Episode 2 */
          const f0 = 0.3 * (1 - smooth(0, 7, t));
          for (const C of clouds) {
            const spread = 2.1, az = GAZ + C.side * C.a0 * spread;
            place(C.sp, az, C.el, C.dist);
            const prox = Math.exp(-Math.pow(C.a0 * spread / 0.35, 2)), sunk = Math.max(0, Math.cos(az - sunAz));
            const br = 0.16 + 1.25 * prox + 0.3 * sunk;
            C.sp.material.color.setRGB(0.55 * br + 0.10, 0.42 * br + 0.07, 0.4 * br + 0.09);
            C.sp.material.opacity = 0.9 * f0; C.sp.material.rotation = C.rot; C.sp.scale.set(C.size * 1.1, C.size * 0.62, 1); C.sp.visible = f0 > 0.002;
          }
          place(core, GAZ, GEL, 1500); core.scale.set(1600, 1600, 1); core.material.opacity = 0.5 * f0; core.visible = f0 > 0.002;
          shaft.position.set(camera.position.x + Math.cos(GAZ) * 900, 0, camera.position.z + Math.sin(GAZ) * 900);
          shaft.scale.set(120, 900 * Math.tan(GEL) + camera.position.y, 120); shaft.material.uniforms.uInt.value = 0.8 * f0; shaft.visible = f0 > 0.002;

          /* glory on John's face as he turns */
          glory.position.set(john.group.position.x - 6, john.group.position.y + 3.5, john.group.position.z - 5).add(cs.group.position);
          glory.target.position.copy(john.group.position).add(cs.group.position).add(tmp.set(0, 1.5, 0));
          glory.intensity = 0.85 * smooth(54, 59.5, t);
          hairMats.forEach((m) => m.emissive.setRGB(0.012 + 0.1 * smooth(54, 59, t), 0.011 + 0.094 * smooth(54, 59, t), 0.009 + 0.08 * smooth(54, 59, t)));

          /* sun flare + rays */
          const sunUp = smooth(-0.04, 0.03, el);
          flare.update(camera, sdir, (0.26 + 0.2 * smooth(0, 14, t)) * (1 - 0.6 * blast) * sunUp, 1.0);
          fx.sunWorld = tmp.copy(camera.position).addScaledVector(sdir, 1500); fx.rays = 0.22 * sunUp; fx.raysCol = [1, 0.74, 0.44];

          /* grade */
          fx.bloom = 0.82 + 0.25 * spirit + 0.7 * blast + 0.1 * smooth(41, 46, t); fx.bloomRadius = 0.8; fx.bloomThreshold = 0.8;
          fx.grain = 0.055; fx.aber = 0.0018 + 0.004 * blast; fx.vignette = 0.6 + 0.2 * spirit;
          fx.tint = [1.05 + 0.05 * spirit, 0.99, 0.93 - 0.05 * spirit]; fx.shadow = [0.8, 0.9, 1.15]; fx.contrast = 1.08 + 0.04 * spirit; fx.saturation = 1.08 + 0.22 * spirit;
          fx.exposure = lerp(0.66, 0.95, smooth(0, 10, t)) * (1 - 0.1 * spirit) * lerp(1, 0.92, smooth(41, 46, t));
          let flash = t >= TR ? Math.exp(-Math.pow((t - (TR + 0.03)) / 0.1, 2)) * 0.9 + 0.3 * Math.exp(-(t - TR) / 0.35) * smooth(TR, TR + 0.05, t) : 0;
          fx.flash = clamp(flash); fx.flashCol = [1.0, 0.94, 0.82];
          fx.fade = clamp(Math.max(1 - smooth(0, 1.2, t), smooth(58.9, 60, t)));
        },
      };
    },

    /* ===================================================== SCORE ===== */
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
  /*@@EP4X-BEGIN@@*/
  /* ====================================================== EPISODE 4 ===== */
  Aura.define(4, {
    duration: 60,

    /* v12: "I turned to see the voice…" / "Having turned, I saw seven golden lamp stands."  v13: the figure, robe, sash.
       v14: hair, eyes.  v15: feet, voice.  v16: stars, sword, face. */
    cues: [
      { ref: '1:12', t0: 6.8,  t1: 13.4 },
      { ref: '1:13', t0: 14.0, t1: 24.4 },
      { ref: '1:14', t0: 25.0, t1: 32.2 },
      { ref: '1:15', t0: 32.8, t1: 41.6 },
      { ref: '1:16', t0: 42.2, t1: 51.9 },
    ],

    titles: [
      { t0: 1.3, t1: 4.8, fi: 1.0, fo: 0.8, cls: 'epcard', html: '<div class="ec-k">REVELATION · EPISODE 4</div><div class="ec-t">One Like a Son of Man</div><div class="ec-l"></div>' },
    ],

    build(ctx) {
      const { scene, camera, fx, lib, renderer } = ctx;
      const env = lib.env(); env.uPR.value = renderer.getPixelRatio();
      const q = ctx.quality, hi = q === 'high';
      const sunAz = 0.12;
      lib.setSun(env, -0.025, sunAz);

      /* the same night, the same island as the end of Episode 3 */
      scene.add(lib.milkyWay(env)); const stars = lib.stars(env, { count: hi ? 9000 : 5000 }); scene.add(stars);
      const sky = lib.sky(env); scene.add(sky);
      const sea = lib.sea(env); scene.add(sea);
      const flare = lib.flare(); scene.add(flare.group);
      flare.group.children.forEach((c) => { c.material.depthTest = false; });
      const cs = lib.cliffScene(ctx, env); scene.add(cs.group);
      const john = cs.john, jW = cs.jWorld, gp = cs.group.position;
      const back = lib.terrain({ env, x0: -2400, x1: -62, z0: 3600, z1: 8400, cell: q === 'low' ? 46 : 32, detail: 0.02,
        height: (x, z) => 9.4 + 3.1 * smooth(-62, -94, x) + 70 * smooth(-110, -900, x) * (0.5 + 0.5 * lib.noise.fbm(x * 0.0016 + 4, z * 0.0016, 4, 5)) + 3 * smooth(-100, -400, x) * lib.noise.perlin(x * 0.02, z * 0.02, 3) });
      scene.add(back);
      const wl = lib.waterline(cs, -70, 70, 2);
      const foam = lib.foam(env, wl, 6000); cs.group.add(foam);
      const spray = lib.spray(env, wl, { sources: hi ? 26 : 16, perBurst: hi ? 44 : 28 }); cs.group.add(spray);
      cs.group.children.forEach((o) => {
        if (!(o.isMesh && o.geometry && o.geometry.type === 'IcosahedronGeometry')) return;
        const pp = o.geometry.attributes.position, nn = new Float32Array(pp.count * 3), v = new THREE.Vector3();
        for (let k = 0; k < pp.count; k++) { v.set(pp.getX(k), pp.getY(k) / 0.5, pp.getZ(k)).normalize(); nn.set([v.x, v.y, v.z], k * 3); }
        o.geometry.setAttribute('normal', new THREE.BufferAttribute(nn, 3));
        o.material.color.set(0x3b342d); o.material.emissive.setRGB(0.008, 0.006, 0.005);
      });
      const hairMats = []; { const hc = Aura.col(0x8f8a80); john.group.traverse((o) => { if (o.isMesh && o.material && o.material.color && Math.abs(o.material.color.r - hc.r) < 0.004 && Math.abs(o.material.color.b - hc.b) < 0.004 && hairMats.indexOf(o.material) < 0) hairMats.push(o.material); }); }
      const glory = new THREE.DirectionalLight(0xffd8a0, 0.85); scene.add(glory); scene.add(glory.target);

      /* ---------------- the vision: seven golden lamp stands, and one like a son of man among them ---------------- */
      const FX = -30, FZ = 0.6, gy = cs.cliffH(FX, FZ), FYf = gy + 0.5;           // the figure's feet hover just above the ground
      const vis = new THREE.Group(); cs.group.add(vis);
      const W = (x, y, z) => [x + gp.x, y + gp.y, z + gp.z];
      const Rg = (deg, r, h) => { const a = deg * Math.PI / 180; return W(FX + r * Math.cos(a), FYf + h, FZ + r * Math.sin(a)); };   // ring-relative: angle from +x toward +z, radius, height above his feet
      const christ = lib.christ(env, { scale: 1.2 }); christ.group.position.set(FX, FYf, FZ); vis.add(christ.group);
      const stands = [];
      for (let i = 0; i < 7; i++) {
        const a = Math.PI / 7 + i * 2 * Math.PI / 7, x = FX + 6.8 * Math.cos(a), z = FZ + 6.8 * Math.sin(a);
        const L = lib.lampstand(env, { seed: i + 1 }); L.group.position.set(x, cs.cliffH(x, z), z); vis.add(L.group);
        stands.push({ L, ign: 10.5 + i * 0.45, x, z });
      }
      const figLight = new THREE.PointLight(0xffe0aa, 0, 70, 1.5); figLight.position.set(FX + 0.9, FYf + 1.9, FZ); vis.add(figLight);
      const hMax = (x, z) => Math.max(cs.cliffH(x, z), cs.cliffH(x + 0.8, z), cs.cliffH(x - 0.8, z), cs.cliffH(x, z + 0.8), cs.cliffH(x, z - 0.8));
      const pool = { material: { uniforms: { uT: { value: 0 }, uAmt: { value: 0 }, uCol: { value: new THREE.Color() } } } };   // (ground glow comes from the point light + ambient)
      const rings = lib.waveRings(hMax, FX, FZ, 38); rings.material.uniforms.uXFade.value.set(-9, 1.0); cs.group.add(rings);
      const motes = lib.motes(env, { count: hi ? 420 : 240, radius: 9, height: 7, seed: 101 }); motes.position.set(FX, gy, FZ); cs.group.add(motes);
      const snow = lib.motes(env, { count: hi ? 220 : 130, radius: 0.6, height: 1.4, size: 0.024, seed: 202 }); snow.material.uniforms.uCol.value.set(1, 1, 1); snow.position.set(FX, FYf + 1.7, FZ); cs.group.add(snow);
      const sparks = lib.motes(env, { count: hi ? 130 : 80, radius: 0.5, height: 1.9, size: 0.032, seed: 303 }); sparks.material.uniforms.uCol.value.set(1.0, 0.46, 0.1); sparks.position.set(FX + 0.12, FYf + 0.05, FZ); cs.group.add(sparks);

      /* ---------------- camera ---------------- */
      const Jr = (dx, dy, dz) => [jW.x + dx, jW.y + dy, jW.z + dz];
      const eye = W(FX + 0.118, FYf + 2.19, FZ), faceP = W(FX + 0.144, FYf + 2.17, FZ), headP = W(FX, FYf + 2.2, FZ), sashP = W(FX, FYf + 1.7, FZ), hemP = W(FX, FYf + 0.55, FZ), feetP = W(FX + 0.12, FYf + 0.2, FZ), midP = W(FX, FYf + 1.3, FZ);
      const handP = W(FX + 0.6, FYf + 1.9, FZ + 0.6), bladeP = W(FX + 0.75, FYf + 2.1, FZ + 0.25), vP = W(FX, FYf + 2.1, FZ);
      const shots = [
        /* 0 – 6.9   Continuity: Episode 3's last frame, then John finishes turning, glory on his face */
        { t0: 0, t1: 6.9, pos: [[0, ...Jr(-2.7, 1.55, -1.9)], [6.9, ...Jr(-2.9, 1.62, -2.6)]], look: [[0, ...Jr(0.3, 1.62, -0.1)], [6.9, ...Jr(-0.1, 1.6, 0.1)]], fov: [[0, 26], [6.9, 27]], shake: [[0, 0.04], [6.9, 0.0]], shakeScale: 0.3 },
        /* 6.9 – 10.6   "I turned to see": the pan from the man to what he sees */
        { t0: 6.9, t1: 10.6, ease: 'io2', pos: [[6.9, ...Jr(-2.9, 1.62, -2.6)], [10.6, ...Jr(-9.5, 1.85, -1.6)]], look: [[6.9, ...Jr(-0.1, 1.6, 0.1)], [8.3, ...vP], [10.6, ...vP]], fov: [[6.9, 27], [10.6, 34]], shake: 0.015, shakeScale: 0.3 },
        /* 10.6 – 14   seven golden lamp stands, igniting one by one */
        { t0: 10.6, t1: 14.0, pos: [[10.6, ...Jr(-9.5, 1.85, -1.6)], [14.0, ...Jr(-17.5, 2.0, -1.0)]], look: [[10.6, ...vP], [14.0, ...vP]], fov: [[10.6, 34], [14.0, 40]], shake: 0.012, shakeScale: 0.3 },
        /* 14 – 18.4   one like a son of man, rising in the midst: a slow orbit and crane */
        { t0: 14.0, t1: 18.4, pos: [[14.0, ...Jr(-17.5, 2.0, -1.0)], [18.4, ...Rg(-22, 11, 3.0)]], look: [[14.0, ...vP], [18.4, ...W(FX, FYf + 1.6, FZ)]], fov: [[14.0, 40], [18.4, 36]], shake: 0.01, shakeScale: 0.3 },
        /* 18.4 – 21.7   the robe reaching down to his feet: in through the gap, low */
        { t0: 18.4, t1: 21.7, pos: [[18.4, ...Rg(-22, 11, 3.0)], [21.7, ...Rg(-3, 5.6, 0.45)]], look: [[18.4, ...W(FX, FYf + 1.6, FZ)], [21.7, ...hemP]], fov: [[18.4, 36], [21.7, 34]], shake: 0.012, shakeScale: 0.3 },
        /* 21.7 – 24.8   the golden sash around his chest */
        { t0: 21.7, t1: 24.8, pos: [[21.7, ...Rg(-3, 5.6, 0.45)], [24.8, ...Rg(-2, 5.0, 0.9)]], look: [[21.7, ...hemP], [24.8, ...sashP]], fov: [[21.7, 34], [24.8, 30]], shake: 0.01, shakeScale: 0.3 },
        /* 24.8 – 29.4   head and hair, white as wool, like snow */
        { t0: 24.8, t1: 29.4, pos: [[24.8, ...Rg(-2, 5.0, 0.9)], [29.4, ...Rg(-12, 3.3, 2.0)]], look: [[24.8, ...sashP], [29.4, ...headP]], fov: [[24.8, 30], [29.4, 24]], shake: 0.008, shakeScale: 0.3 },
        /* 29.4 – 32.7   eyes like a flame of fire */
        { t0: 29.4, t1: 32.7, pos: [[29.4, ...Rg(-12, 3.3, 2.0)], [32.7, ...Rg(-8, 1.5, 2.16)]], look: [[29.4, ...headP], [32.7, ...eye]], fov: [[29.4, 24], [30.5, 18], [32.7, 15]], shake: 0.01, shakeScale: 0.3 },
        /* 32.7 – 38.3   feet like burnished brass: whip down to the furnace glow */
        { t0: 32.7, t1: 38.3, ease: 'io2', pos: [[32.7, ...Rg(-8, 1.5, 2.16)], [33.6, ...Rg(-28, 2.6, 0.35)], [38.3, ...Rg(-42, 2.2, 0.18)]], look: [[32.7, ...eye], [33.6, ...feetP], [38.3, ...feetP]], fov: [[32.7, 15], [33.6, 32], [38.3, 28]], shake: 0.015, shakeScale: 0.3 },
        /* 38.3 – 42.2   the voice of many waters: pull back as the swell rolls out */
        { t0: 38.3, t1: 42.2, pos: [[38.3, ...Rg(-42, 2.2, 0.18)], [42.2, ...Rg(-50, 16, 3.5)]], look: [[38.3, ...feetP], [42.2, ...W(FX, FYf + 1.8, FZ)]], fov: [[38.3, 28], [42.2, 46]], shake: [[38.3, 0.12], [42.2, 0.02]], shakeScale: 0.3 },
        /* 42.2 – 45.4   seven stars in his right hand */
        { t0: 42.2, t1: 45.4, pos: [[42.2, ...Rg(62, 3.8, 2.1)], [45.4, ...Rg(58, 2.7, 2.0)]], look: [[42.2, ...handP], [45.4, ...handP]], fov: [[42.2, 30], [45.4, 22]], shake: 0.008, shakeScale: 0.3 },
        /* 45.4 – 48.4   out of his mouth a sharp two-edged sword: his profile */
        { t0: 45.4, t1: 48.4, pos: [[45.4, ...Rg(95, 3.1, 2.2)], [48.4, ...Rg(70, 3.9, 2.0)]], look: [[45.4, ...bladeP], [48.4, ...bladeP]], fov: [[45.4, 30], [48.4, 30]], shake: [[45.4, 0.05], [47, 0.01], [48.4, 0.01]], shakeScale: 0.3 },
        /* 48.4 – 52   his face like the sun at its brightest */
        { t0: 48.4, t1: 52, pos: [[48.4, ...Rg(-6, 7.2, 1.4)], [52, ...Rg(-1, 2.6, 2.1)]], look: [[48.4, ...faceP], [52, ...faceP]], fov: [[48.4, 32], [52, 24]], shake: [[48.4, 0.0], [50, 0.05], [52, 0.3]], shakeScale: 0.3 },
        /* 52 – 60   into the light */
        { t0: 52, t1: 60.1, pos: [[52, ...Rg(-1, 2.6, 2.1)], [60, ...Rg(0, 0.9, 2.2)]], look: [[52, ...faceP], [60, ...faceP]], fov: [[52, 24], [60, 30]], shake: [[52, 0.3], [56, 0.1], [60, 0.0]], shakeScale: 0.3 },
      ];

      const sdir = new THREE.Vector3(), tmp = new THREE.Vector3(), toFace = new THREE.Vector3();
      return {
        shots, cs, christ, stands, pool, rings, foam, spray,
        update(t, c) {
          scene.updateMatrixWorld(true);
          const lampK = stands.map((S) => smooth(S.ign, S.ign + 0.8, t)), lampsLit = lampK.reduce((a, b) => a + b, 0) / 7;
          const formK = smooth(14.2, 18.6, t), blaze = smooth(49.4, 52, t);
          const visK = 0.3 * smooth(5.8, 10.4, t) + 0.25 * lampsLit + 0.45 * formK;
          const waterT = t - 38.2, waters = smooth(38.2, 39.4, t) * (1 - smooth(42.5, 44.5, t));

          /* the same dusk as the end of Episode 3 */
          lib.setSun(env, -0.025, sunAz); env.uHor.value.multiplyScalar(0.58); env.uSunCol.value.multiplyScalar(0.8); sdir.copy(env.uSunDir.value);
          env.uAmbS.value.r += 0.17 * visK; env.uAmbS.value.g += 0.12 * visK; env.uAmbS.value.b += 0.05 * visK;
          env.uAmbG.value.r += 0.13 * visK; env.uAmbG.value.g += 0.085 * visK; env.uAmbG.value.b += 0.03 * visK;
          env.uTime.value = t; env.uPR.value = c.renderer.getPixelRatio(); env.uStar.value = 1.0;
          let wind = lerp(0.78, 0.3, smooth(0, 6, t)) + 0.25 * visK + 0.5 * waters + 0.3 * smooth(48, 52, t);
          env.uWind.value = wind; env.uWaveAmp.value = 1.0 + 0.35 * waters;
          /* the voice like many waters: a pressure swell across the sea */
          env.uShock.value.set(FX + gp.x, FZ + gp.z, 30 + 58 * Math.max(0, waterT), t > 38.2 ? 3.0 * smooth(38.2, 39.0, t) * (1 - smooth(43, 50, t)) : 0);
          env.uGust.value.set(-1.0, 3.0, waters * 1.6);

          sky.position.copy(camera.position); stars.position.copy(camera.position); sea.position.set(camera.position.x, 0, camera.position.z);
          john.group.rotation.y = 2.0 + (Math.PI - 2.0) * smooth(1.0, 6.4, t);
          cs.update(t, Math.min(wind, 1.5), sdir, camera);
          foam.userData.update(t);
          const vh = c.renderer.domElement.height;
          [spray, motes, snow, sparks].forEach((m) => { m.material.uniforms.uVH.value = vh; });
          spray.material.uniforms.uAmt.value = 0.35; foam.material.uniforms.uAmt.value = 0.35;
          motes.material.uniforms.uAmt.value = 0.9 * clamp(lampsLit * 0.5 + formK);
          snow.material.uniforms.uAmt.value = formK * (0.35 + 0.65 * smooth(24.6, 26.5, t)) * (1 - smooth(45, 48, t));
          sparks.material.uniforms.uAmt.value = smooth(32.6, 34, t) * (1 - smooth(45, 48, t));

          /* John: the glory finds his face and the white of his hair */
          glory.position.set(john.group.position.x - 12, john.group.position.y + 3, john.group.position.z).add(gp);
          glory.target.position.copy(john.group.position).add(gp).add(tmp.set(0, 1.5, 0));
          glory.intensity = 0.85 + 0.7 * visK;
          hairMats.forEach((m) => m.emissive.setRGB(0.112 + 0.08 * visK, 0.105 + 0.07 * visK, 0.089 + 0.05 * visK));

          /* the lamp stands */
          const bend = 0.8 * waters;
          stands.forEach((S, i) => S.L.update(t, lampK[i], bend));
          /* the figure */
          christ.update(t, { form: formK, eyes: smooth(29.3, 30.3, t), stars: clamp((t - 42.4) / 0.36, 0, 7), sword: smooth(45.6, 46.7, t), face: 0.3 + 0.7 * smooth(48.4, 51.6, t), blaze, wind: 0.3 + 0.9 * waters, aura: 1 });
          figLight.intensity = 3.4 * (0.2 * lampsLit + 0.8 * formK) + 3.2 * blaze;
          /* ground light and rolling swells */
          pool.material.uniforms.uT.value = t; pool.material.uniforms.uAmt.value = 0.07 * lampsLit + 0.12 * formK + 0.4 * blaze;
          pool.material.uniforms.uCol.value.setRGB(1.0, 0.72 + 0.1 * smooth(32.5, 34, t), 0.36);
          rings.material.uniforms.uT.value = t; rings.material.uniforms.uFront.value = waterT > 0 ? waterT * 9.0 : -50; rings.material.uniforms.uAmt.value = 0.25 * waters; rings.visible = waterT > 0 && waters > 0.001;

          /* sun flare, god-rays and bloom: the light of his face */
          toFace.copy(christ.face).sub(camera.position).normalize();
          const sunK = smooth(49.5, 52, t);
          flare.update(camera, toFace, 0.95 * sunK, 0.75);
          fx.sunWorld = tmp.copy(christ.face); fx.rays = 0.22 * smooth(15, 20, t) + 0.28 * smooth(44, 48, t) + 0.75 * sunK; fx.raysCol = [1, 0.86, 0.6];

          /* grade */
          fx.bloom = 0.9 + 0.45 * visK + 0.25 * smooth(43, 45.5, t) + 1.5 * blaze; fx.bloomRadius = 0.8; fx.bloomThreshold = 0.8;
          fx.grain = 0.055; fx.aber = 0.0018 + 0.004 * blaze; fx.vignette = 0.6 - 0.2 * blaze;
          fx.tint = [1.05, 0.99, 0.93]; fx.shadow = [0.8, 0.9, 1.15]; fx.contrast = 1.08; fx.saturation = 1.08 + 0.1 * visK;
          fx.exposure = 0.874 + 0.05 * visK;
          const zing = Math.exp(-Math.pow((t - 45.62) / 0.07, 2)) * 0.28;
          fx.flash = clamp(Math.max(zing, smooth(50.8, 55.2, t))); fx.flashCol = [1.0, 0.95, 0.84];
          fx.fade = clamp(1 - smooth(0, 1.2, t));
        },
      };
    },

    /* ===================================================== SCORE ===== */
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
  /*@@EP4X-END@@*/
  /*@@EP5X-BEGIN@@*/
  /* ====================================================== EPISODE 5 ===== */
  Aura.define(5, {
    duration: 60,

    /* v17: "When I saw him, I fell at his feet like a dead man."  v17b: "He laid his right hand on me… Don't be afraid. I am the first and the last,"
       v18: "and the Living one… I have the keys of Death and of Hades."  v19: "Write therefore…"  v20: the stars, the lamp stands, the assemblies. */
    cues: [
      { ref: '1:17', t0: 5.6,  t1: 16.0 },
      { ref: '1:18', t0: 16.6, t1: 24.9 },
      { ref: '1:19', t0: 25.5, t1: 32.3 },
      { ref: '1:20', t0: 32.9, t1: 46.4 },
    ],

    titles: [
      { t0: 2.2, t1: 5.5, fi: 1.0, fo: 0.8, cls: 'epcard', html: '<div class="ec-k">REVELATION · EPISODE 5</div><div class="ec-t">Do Not Be Afraid</div><div class="ec-l"></div>' },
    ],

    build(ctx) {
      const { scene, camera, fx, lib, renderer } = ctx;
      const env = lib.env(); env.uPR.value = renderer.getPixelRatio();
      const q = ctx.quality, hi = q === 'high';
      const sunAz = 0.12;
      lib.setSun(env, -0.025, sunAz);

      /* the same night, the same island, the same vision as the end of Episode 4 */
      scene.add(lib.milkyWay(env)); const stars = lib.stars(env, { count: hi ? 9000 : 5000 }); scene.add(stars);
      const sky = lib.sky(env); scene.add(sky);
      const sea = lib.sea(env); scene.add(sea);
      const flare = lib.flare(); scene.add(flare.group);
      flare.group.children.forEach((c) => { c.material.depthTest = false; });
      const cs = lib.cliffScene(ctx, env); scene.add(cs.group);
      const john = cs.john, gp = cs.group.position;
      const back = lib.terrain({ env, x0: -2400, x1: -62, z0: 3600, z1: 8400, cell: q === 'low' ? 46 : 32, detail: 0.02,
        height: (x, z) => 9.4 + 3.1 * smooth(-62, -94, x) + 70 * smooth(-110, -900, x) * (0.5 + 0.5 * lib.noise.fbm(x * 0.0016 + 4, z * 0.0016, 4, 5)) + 3 * smooth(-100, -400, x) * lib.noise.perlin(x * 0.02, z * 0.02, 3) });
      scene.add(back);
      const wl = lib.waterline(cs, -70, 70, 2);
      const foam = lib.foam(env, wl, 6000); cs.group.add(foam);
      const spray = lib.spray(env, wl, { sources: hi ? 26 : 16, perBurst: hi ? 44 : 28 }); cs.group.add(spray);
      cs.group.children.forEach((o) => {
        if (!(o.isMesh && o.geometry && o.geometry.type === 'IcosahedronGeometry')) return;
        const pp = o.geometry.attributes.position, nn = new Float32Array(pp.count * 3), v = new THREE.Vector3();
        for (let k = 0; k < pp.count; k++) { v.set(pp.getX(k), pp.getY(k) / 0.5, pp.getZ(k)).normalize(); nn.set([v.x, v.y, v.z], k * 3); }
        o.geometry.setAttribute('normal', new THREE.BufferAttribute(nn, 3));
        o.material.color.set(0x3b342d); o.material.emissive.setRGB(0.008, 0.006, 0.005);
      });
      const hairMats = []; { const hc = Aura.col(0x8f8a80); john.group.traverse((o) => { if (o.isMesh && o.material && o.material.color && Math.abs(o.material.color.r - hc.r) < 0.004 && Math.abs(o.material.color.b - hc.b) < 0.004 && hairMats.indexOf(o.material) < 0) hairMats.push(o.material); }); }
      const glory = new THREE.DirectionalLight(0xffd8a0, 0.85); scene.add(glory); scene.add(glory.target);

      /* ---------------- the vision, as it stood: one like a son of man, among seven golden lamp stands ---------------- */
      const S = 1.2, FX = -30, FZ = 0.6, gy = cs.cliffH(FX, FZ), FYf = gy + 0.1;
      const vis = new THREE.Group(); cs.group.add(vis);
      const W = (x, y, z) => [x + gp.x, y + gp.y, z + gp.z];
      const Rg = (deg, r, h) => { const a = deg * Math.PI / 180; return W(FX + r * Math.cos(a), FYf + h, FZ + r * Math.sin(a)); };
      const christ = lib.christ(env, { scale: S }); christ.group.position.set(FX, FYf, FZ); vis.add(christ.group);
      const stands = [];
      for (let i = 0; i < 7; i++) {
        const a = Math.PI / 7 + i * 2 * Math.PI / 7, x = FX + 6.8 * Math.cos(a), z = FZ + 6.8 * Math.sin(a);
        const L = lib.lampstand(env, { seed: i + 1 }); L.group.position.set(x, cs.cliffH(x, z), z); vis.add(L.group);
        stands.push({ L });
      }
      /* the keys of Death and of Hades, on his left hand */
      const keys = lib.keys(env); keys.group.position.set(0.05, 0.86, -0.37); christ.group.children[0].add(keys.group);
      const figLight = new THREE.PointLight(0xffe0aa, 0, 70, 1.5); vis.add(figLight);
      const motes = lib.motes(env, { count: hi ? 420 : 240, radius: 9, height: 7, seed: 101 }); motes.position.set(FX, gy, FZ); cs.group.add(motes);
      const snow = lib.motes(env, { count: hi ? 220 : 130, radius: 0.6, height: 1.4, size: 0.024, seed: 202 }); snow.material.uniforms.uCol.value.set(1, 1, 1); cs.group.add(snow);
      /* the seven stars, set free from his hand */
      const fly = []; for (let i = 0; i < 7; i++) { const sp = lib.star(0.96, 0.97, 1.0); sp.renderOrder = 8; sp.visible = false; scene.add(sp); fly.push(sp); }

      /* ---------------- John: he stands where the last frame left him, falls at his feet, and is raised ---------------- */
      const JX0 = FX + 2.15, jg = cs.cliffH(JX0, FZ);
      const yA = new THREE.Vector3(0, 1, 0), zA = new THREE.Vector3(0, 0, 1), qy = new THREE.Quaternion().setFromAxisAngle(yA, Math.PI), qz = new THREE.Quaternion();
      const theta = (t) => (1.52 - 0.14 * (1 - smooth(9.6, 10.7, t))) * (1 - smooth(19.2, 24.6, t));

      /* ---------------- the figure, bending down to him: pure functions of time so the camera can follow ---------------- */
      const lean = (t) => 0.7 * smooth(9.7, 12.3, t) * (1 - smooth(17.4, 20.6, t));
      const reachAmt = (t) => smooth(10.5, 12.6, t) * (1 - smooth(17.6, 20.8, t));
      const chW = (lx, ly, lz, t) => { const l = lean(t), x = (lx * Math.cos(l) + ly * Math.sin(l)) * S, y = (-lx * Math.sin(l) + ly * Math.cos(l)) * S; return W(FX + x, FYf + y, FZ + lz * S); };
      const handT = new THREE.Vector3(), tmp = new THREE.Vector3(), tmp2 = new THREE.Vector3();

      /* ---------------- the vision in the sky: seven lamp stands, seven stars, seven cities ---------------- */
      const PO = new THREE.Vector3(1800, 0, -2000);
      const pano = new THREE.Group(); pano.position.copy(PO); pano.visible = false; scene.add(pano);
      const phF = (x, z) => { const d = Math.hypot(x / 400, (z - 60) / 340), m = smooth(1.0, 0.7, d); return m * (5.5 + 3.2 * lib.noise.fbm(x * 0.012 + 7, z * 0.012, 3, 5) + 1.5 * lib.noise.perlin(x * 0.05, z * 0.05, 3)) - (1 - m) * 14; };
      const land = lib.terrain({ env, x0: -440, x1: 440, z0: -340, z1: 440, cell: q === 'low' ? 8 : 5, detail: 0.5, height: phF, color: (x, z, h, slope) => {
        const n = lib.noise.fbm(x * 0.02, z * 0.02, 3, 11) * 0.5 + 0.5; const v = 0.75 + n * 0.5; return [0.075 * v, 0.068 * v, 0.04 * v]; } });
      pano.add(land);
      const PS = 8, panoStands = [];
      for (let i = 0; i < 7; i++) {
        const phi = (-40 + i * 13.333) * Math.PI / 180, Ra = 210 + (i % 2 ? 9 : -7), cx = Ra * Math.sin(phi), cz = Ra * Math.cos(phi) - 6, g0 = phF(cx, cz);
        const city = lib.cityLights({ radius: 24, count: hi ? 170 : 110, buildings: hi ? 58 : 36, size: 3.6, seed: 900 + i * 17, height: (x, z) => phF(cx + x, cz + z) - g0 }); city.group.position.set(cx, g0, cz); pano.add(city.group);
        const L = lib.lampstand(env, { seed: i + 11 }); L.group.position.set(cx, g0, cz); L.group.scale.setScalar(PS); pano.add(L.group);
        const st = lib.star(0.96, 0.97, 1.0); st.renderOrder = 8; st.position.set(cx, g0 + PS * 3.1 + 34, cz); st.scale.setScalar(0.001); pano.add(st);
        const sh = lib.shaft(); sh.position.set(cx, g0, cz); sh.scale.set(7, PS * 3.1 + 34, 7); sh.material.uniforms.uInt.value = 0; pano.add(sh);
        const glow = lib.orb(1.0, 0.7, 0.3); glow.renderOrder = 5; glow.position.set(cx, g0 + PS * 3.1, cz); glow.scale.setScalar(1); pano.add(glow);
        panoStands.push({ cx, cz, g0, city, L, st, sh, glow, ign: 43.9 + i * 0.4 });
      }
      const ps0 = panoStands[0];
      const P = (x, y, z) => [PO.x + x, y, PO.z + z];
      const top = (s) => P(s.cx, s.g0 + PS * 3.0, s.cz);

      /* ---------------- camera ---------------- */
      const faceStatic = chW(0.12, 1.81, 0, 14), eyeJ = W(JX0, jg + 1.6, FZ);
      const dyn = (base, lookFn) => { const s = Aura.shot(base); s.look = lookFn; return s; };
      const shots = [
        /* 0 – 7   Continuity: Episode 4's last light, from where John stands; it clears and he sees him */
        { t0: 0, t1: 7.0, pos: [[0, ...W(JX0, jg + 1.62, FZ)], [7.0, ...W(JX0 - 0.06, jg + 1.58, FZ)]], look: [[0, ...chW(0.12, 1.81, 0, 0)], [7.0, ...chW(0.12, 1.81, 0, 0)]], fov: [[0, 30], [7.0, 34]], shake: [[0, 0.05], [3.5, 0.02], [7.0, 0.02]], shakeScale: 0.3 },
        /* 7 – 9.6   "I fell at his feet like a dead man": the fall, in his eyes */
        { t0: 7.0, t1: 9.6, ease: 'io2', pos: [[7.0, ...W(JX0 - 0.06, jg + 1.58, FZ)], [8.3, ...W(JX0 - 0.2, jg + 0.75, FZ + 0.1)], [9.6, ...W(JX0 - 0.4, jg + 0.1, FZ + 0.18)]], look: [[7.0, ...chW(0.12, 1.81, 0, 0)], [8.3, ...chW(0.15, 0.9, 0, 0)], [9.6, ...chW(0.15, 1.3, 0, 0)]], fov: [[7.0, 34], [9.6, 40]], roll: [[7.0, 0], [9.6, 0.28]], shake: [[7.0, 0.02], [8.2, 0.16], [9.0, 0.1], [9.6, 0.01]], shakeScale: 0.3 },
        /* 9.6 – 12.9   he lies at his feet; the right hand comes down */
        { t0: 9.6, t1: 12.9, pos: [[9.6, ...Rg(75, 6.2, 0.9)], [12.9, ...Rg(62, 4.6, 0.8)]], look: [[9.6, ...W(FX + 0.95, jg + 0.6, FZ)], [12.9, ...W(FX + 0.9, jg + 0.55, FZ)]], fov: [[9.6, 30], [12.9, 27]], shake: 0.006, shakeScale: 0.3 },
        /* 12.9 – 16.5   the hand laid on him, the stars glowing over his back: "Don't be afraid. I am the first and the last" */
        { t0: 12.9, t1: 16.5, ease: 'io2', pos: [[12.9, ...W(FX + 3.6, jg + 1.5, FZ + 2.8)], [16.5, ...W(FX + 2.6, jg + 1.15, FZ + 2.0)]], look: [[12.9, ...W(FX + 0.85, jg + 0.55, FZ + 0.1)], [14.6, ...W(FX + 0.85, jg + 0.75, FZ + 0.1)], [16.5, ...faceStatic]], fov: [[12.9, 30], [16.5, 32]], shake: 0.006, shakeScale: 0.3 },
        /* 16.5 – 21.8   "the Living one… alive forever and ever": he straightens, and is whole light */
        dyn({ t0: 16.5, t1: 21.8, look: [[16.5, 0, 0, 0]], pos: [[16.5, ...Rg(55, 3.9, 0.5)], [21.8, ...Rg(30, 6.2, 1.0)]], fov: [[16.5, 34], [21.8, 36]], shake: 0.006, shakeScale: 0.3 }, (t) => chW(0.1, 1.55, 0, t)),
        /* 21.8 – 25.5   the keys of Death and of Hades */
        { t0: 21.8, t1: 25.5, pos: [[21.8, ...Rg(-82, 3.0, 1.3)], [25.5, ...Rg(-60, 1.25, 0.98)]], look: [[21.8, ...chW(0.05, 1.0, -0.37, 22)], [25.5, ...chW(0.05, 0.72, -0.37, 25)]], fov: [[21.8, 32], [25.5, 21]], shake: 0.006, shakeScale: 0.3 },
        /* 25.5 – 32.9   "Write therefore": John on his feet, the light before him, over his shoulder */
        { t0: 25.5, t1: 32.9, pos: [[25.5, ...W(JX0 + 2.7, jg + 1.62, FZ + 1.1)], [32.9, ...W(JX0 + 1.1, jg + 1.95, FZ - 0.5)]], look: [[25.5, ...chW(0.05, 1.5, 0, 25)], [32.9, ...chW(0.05, 1.75, 0, 33)]], fov: [[25.5, 30], [32.9, 26]], shake: 0.006, shakeScale: 0.3 },
        /* 32.9 – 37.8   the seven stars in his right hand */
        { t0: 32.9, t1: 37.8, pos: [[32.9, ...Rg(80, 3.7, 2.05)], [37.8, ...Rg(52, 2.3, 2.0)]], look: [[32.9, ...W(FX + 0.6, FYf + 1.95, FZ + 0.6)], [37.8, ...W(FX + 0.6, FYf + 1.95, FZ + 0.6)]], fov: [[32.9, 30], [37.8, 20]], shake: 0.006, shakeScale: 0.3 },
        /* 37.8 – 41   the seven golden lamp stands */
        { t0: 37.8, t1: 41.0, pos: [[37.8, ...Rg(-150, 13, 2.6)], [41.0, ...Rg(-132, 18, 4.2)]], look: [[37.8, ...W(FX, FYf + 1.8, FZ)], [41.0, ...W(FX, FYf + 3.0, FZ)]], fov: [[37.8, 40], [41.0, 44]], shake: 0.006, shakeScale: 0.3 },
        /* 41 – 43.4   the stars rise out of his hand into the night */
        { t0: 41.0, t1: 43.4, ease: 'io2', pos: [[41.0, ...Rg(-132, 18, 4.2)], [43.4, ...Rg(-122, 20, 3.0)]], look: [[41.0, ...W(FX, FYf + 3.0, FZ)], [42.2, ...W(FX, FYf + 30, FZ)], [43.4, ...W(FX, FYf + 70, FZ)]], fov: [[41.0, 44], [43.4, 50]], shake: 0.006, shakeScale: 0.3 },
        /* 43.4 – 52   the same seven, in the sky: crane up from the first, to see them all */
        { t0: 43.4, t1: 52, ease: 'io2', pos: [[43.4, ...P(-150, 9, 95)], [48, ...P(-70, 32, -10)], [52, ...P(0, 88, -175)]], look: [[43.4, ...P(ps0.cx, ps0.g0 + 30, ps0.cz)], [48, ...P(-15, 34, 170)], [52, ...P(0, 26, 175)]], fov: [[43.4, 40], [52, 38]], shake: 0.004, shakeScale: 0.3 },
        /* 52 – 60   the first light brightens, toward the first assembly */
        { t0: 52, t1: 60.1, ease: 'io2', pos: [[52, ...P(0, 88, -175)], [60, ...P(-118, 40, 38)]], look: [[52, ...P(0, 26, 175)], [60, ...P(ps0.cx, ps0.g0 + 24, ps0.cz)]], fov: [[52, 38], [60, 34]], shake: 0.004, shakeScale: 0.3 },
      ];

      const sdir = new THREE.Vector3(), toFace = new THREE.Vector3();
      const flyFrom = new THREE.Vector3(), flyTo = new THREE.Vector3(), flyMid = new THREE.Vector3();
      return {
        shots, cs, christ, stands, foam, spray, pano, panoStands,
        update(t, c) {
          scene.updateMatrixWorld(true);
          const blaze = 1 - smooth(0.4, 4.2, t), inPano = t >= 43.4;
          pano.visible = inPano; cs.group.visible = !inPano; back.visible = !inPano;

          /* the same dusk */
          lib.setSun(env, -0.025, sunAz); env.uHor.value.multiplyScalar(0.58); env.uSunCol.value.multiplyScalar(0.8); sdir.copy(env.uSunDir.value);
          env.uAmbS.value.r += 0.17; env.uAmbS.value.g += 0.12; env.uAmbS.value.b += 0.05;
          env.uAmbG.value.r += 0.13; env.uAmbG.value.g += 0.085; env.uAmbG.value.b += 0.03;
          env.uTime.value = t; env.uPR.value = c.renderer.getPixelRatio(); env.uStar.value = 1.0;
          const wind = 0.3 + 0.2 * blaze;
          env.uWind.value = wind; env.uWaveAmp.value = 1.0; env.uShock.value.set(0, 0, 0, 0); env.uGust.value.set(-1.0, 3.0, 0);

          sky.position.copy(camera.position); stars.position.copy(camera.position); sea.position.set(camera.position.x, 0, camera.position.z);

          /* John */
          const th = theta(t);
          john.group.visible = t >= 9.4; john.group.position.set(JX0, jg, FZ);
          qz.setFromAxisAngle(zA, th); john.group.quaternion.multiplyQuaternions(qz, qy);
          cs.update(t, Math.min(wind, 1.5), sdir, camera);
          foam.userData.update(t);
          const vh = c.renderer.domElement.height;
          [spray, motes, snow].forEach((m) => { m.material.uniforms.uVH.value = vh; });
          spray.material.uniforms.uAmt.value = 0.35; foam.material.uniforms.uAmt.value = 0.35;
          motes.material.uniforms.uAmt.value = 0.9; snow.material.uniforms.uAmt.value = 0.8 * smooth(9.6, 12, t) * (1 - smooth(40, 42, t));
          glory.position.set(FX - 8, FYf + 6, FZ).add(gp); glory.target.position.set(JX0, jg + 0.5, FZ).add(gp);
          glory.intensity = 1.3;
          hairMats.forEach((m) => m.emissive.setRGB(0.19, 0.175, 0.14));

          /* the lamp stands of the vision */
          stands.forEach((S0, i) => S0.L.update(t, 1, 0));

          /* the figure bends to him, lays his right hand on John, then rises and holds the stars again */
          const l = lean(t), ra = reachAmt(t);
          christ.group.rotation.z = -l;
          christ.group.position.set(FX, FYf, FZ);
          tmp.set(FX + 0.85, jg + 0.4, FZ + 0.12 + 0.02 * Math.sin(t * 0.9)).sub(tmp2.set(FX, FYf, FZ));
          const cl = Math.cos(l), sl = Math.sin(l);
          handT.set((tmp.x * cl - tmp.y * sl) / S, (tmp.x * sl + tmp.y * cl) / S, tmp.z / S);
          christ.reachRight(handT, ra);
          const flown = (i) => t >= 40.5 + i * 0.2;
          const starsOn = 7;
          christ.update(t, { form: 1, eyes: smooth(0, 1, t), stars: starsOn, sword: 1 - smooth(9.0, 9.5, t), face: 0.3 + 0.7 * (1 - smooth(1.0, 4.6, t)) + 0.12 * Math.sin(Math.PI * clamp((t - 12.8) / 3.4)), blaze, wind: 0.3, aura: 1 });
          christ.parts.stars.children.forEach((s, i) => { if (i < 7 && flown(i)) s.visible = false; });
          christ.parts.stars.children[7] && (christ.parts.stars.children[7].visible = t < 40.5);
          figLight.position.set(FX + 0.9 + 0.6 * l, FYf + 1.7 - 0.5 * l, FZ); figLight.intensity = 3.4 + 3.2 * blaze + 1.2 * ra;
          /* the keys */
          const kk = smooth(20.4, 21.4, t), gl = Math.exp(-Math.pow((t - 23.05) / 0.22, 2)) + 0.9 * Math.exp(-Math.pow((t - 23.9) / 0.25, 2)) + 0.25 * kk;
          keys.update(t, kk, clamp(gl * kk));
          /* the stars, set free */
          fly.forEach((sp, i) => {
            const t0 = 40.5 + i * 0.2, u = clamp((t - t0) / 3.0);
            sp.visible = u > 0 && !inPano;
            if (!sp.visible) return;
            christ.parts.stars.getWorldPosition(flyFrom);
            const a = (i / 7) * Math.PI * 2 + 0.6; flyTo.set(FX + gp.x + Math.cos(a) * 26, FYf + gp.y + 70 + i * 4, FZ + gp.z + Math.sin(a) * 26);
            const e = u * u * (3 - 2 * u); sp.position.copy(flyFrom).lerp(flyTo, e); sp.position.y += 6 * Math.sin(Math.PI * u) * 1.0;
            const sz = (0.3 + 4.5 * e) * (0.9 + 0.1 * Math.sin(t * 7 + i)); sp.scale.set(sz, sz, 1); sp.material.rotation = t * 0.3; sp.material.opacity = 1;
          });

          /* the panorama: seven lamp stands, seven stars, seven cities */
          const b0 = smooth(54.0, 57.6, t);
          const cityAmt = smooth(43.6, 46.5, t);
          panoStands.forEach((s, i) => {
            const k = smooth(s.ign, s.ign + 0.8, t), dim = i === 0 ? 1 : 1 - 0.28 * b0;
            s.L.update(t, k * dim, 0);
            const grow = 1 + (i === 0 ? 0.3 * b0 : 0);
            s.L.group.scale.setScalar(PS * grow);
            s.city.update(cityAmt * (0.55 + 0.45 * k) * (i === 0 ? 1 + 0.4 * b0 : 1));
            const st = smooth(s.ign - 0.15, s.ign + 0.7, t), tw = 0.9 + 0.1 * Math.sin(t * 3.1 + i * 1.7), sz = 30 * st * tw * (1 + (i === 0 ? 0.5 * b0 : 0));
            s.st.scale.set(sz, sz, 1); s.st.material.opacity = clamp(st * 1.2); s.st.material.rotation = t * 0.1 * (i % 2 ? 1 : -1);
            s.sh.material.uniforms.uInt.value = (0.16 * k + (i === 0 ? 0.5 * b0 : 0)) * smooth(45, 48, t);
            const gs = PS * 5 * k * (1 + (i === 0 ? 1.0 * b0 : 0)); s.glow.scale.set(gs, gs, 1); s.glow.material.opacity = clamp(0.5 * k * dim + (i === 0 ? 0.4 * b0 : 0));
          });

          /* sun flare, god-rays and bloom: the light of his face, then of the first lamp */
          toFace.copy(christ.face).sub(camera.position).normalize();
          flare.update(camera, toFace, 0.95 * blaze * (1 - inPano), 0.75);
          fx.sunWorld = tmp.copy(christ.face); fx.rays = (0.75 * blaze + 0.16) * (1 - smooth(42.6, 43.4, t)) * (inPano ? 0 : 1); fx.raysCol = [1, 0.86, 0.6];

          /* grade */
          fx.bloom = 1.0 + 1.5 * blaze + 0.3 * smooth(32, 36, t) + 0.35 * (inPano ? 1 : 0); fx.bloomRadius = 0.8; fx.bloomThreshold = 0.8;
          fx.grain = 0.055; fx.aber = 0.0018 + 0.004 * blaze; fx.vignette = 0.6 - 0.2 * blaze;
          fx.tint = [1.05, 0.99, 0.93]; fx.shadow = [0.8, 0.9, 1.15]; fx.contrast = 1.08; fx.saturation = 1.18;
          fx.exposure = 0.9 + (inPano ? 0.12 : 0);
          const blink = Math.exp(-Math.pow((t - 9.58) / 0.07, 2));
          fx.flash = clamp(Math.max(1 - smooth(0.15, 3.8, t), smooth(42.4, 43.4, t) * (1 - smooth(43.55, 45.0, t)))); fx.flashCol = [1.0, 0.95, 0.84];
          fx.fade = clamp(blink * 1.05);
        },
      };
    },

    /* ===================================================== SCORE ===== */
    score(A, from) {
      const D2 = 73.42, G2 = 98, D3 = 146.83, G3 = 196, A3 = 220, D4 = 293.66, Fs4 = 369.99, G4 = 392, A4 = 440, B4 = 493.88, D5 = 587.33, E5 = 659.25, Fs5 = 739.99, A5 = 880, B5 = 987.77, D6 = 1174.66, E6 = 1318.51, Fs6 = 1479.98, A6 = 1760, B6 = 1975.5, D7 = 2349.3;
      /* continuity: the sustained light of Episode 4's last chord, fading */
      A.drone(0, 59.6, D2, { gain: 0.11, attack: 0.4, release: 2.0 });
      A.choir(0, 5.6, [D3, A3, D4, Fs4, A4, D5, A5], { gain: 0.075, attack: 0.3, release: 3.0, vowel: 1.1 });
      A.brass(0, 4.5, D3, { gain: 0.08, attack: 0.2, release: 2.4, sweep: [[0, 1600], [4.5, 500]] });
      A.wind(0, 22, { gain: 0.07, bright: 0.8, attack: 1.2 });
      A.sea(0, 26, { gain: 0.07, attack: 1.0 });
      /* "When I saw him": a held breath; "I fell": the floor drops away */
      A.shimmer(5.7, A4, { dur: 3.4, gain: 0.04 });
      A.voice({ type: 'sine', freq: [[7.2, 330], [9.5, 58]], t0: 7.2, t1: 9.6, gain: 0.1, attack: 0.3, release: 0.3, wet: 0.5 });
      A.noise({ t0: 7.2, t1: 9.5, gain: [[7.2, 0], [8.4, 0.1], [9.5, 0]], filter: { type: 'lowpass', freq: [[7.2, 1800], [9.5, 120]], q: 0.7 }, wet: 0.3, attack: 0.1, release: 0.1 });
      A.boom(9.55, { freq: 38, gain: 0.75, dur: 4 });
      /* like a dead man: stillness, only the low drone and the wind */
      /* he laid his right hand on me: warmth arrives */
      A.choir(10.3, 29, [D3, A3, D4, Fs4, A4], { gain: 0.055, attack: 2.4, release: 2.6, vowel: 1.0 });
      A.pad(10.5, 30, [D3, A3, D4, Fs4], { gain: 0.034, attack: 3, wet: 0.75 });
      A.bell(12.4, A4, { gain: 0.07, dur: 5 });
      /* "Don't be afraid": the Lamb figure, four gentle rising notes */
      [[13.0, D5], [13.75, E5], [14.5, Fs5], [15.3, A5]].forEach(([t, f]) => { A.bell(t, f, { gain: 0.075, dur: 4.5 }); A.shimmer(t + 0.05, f / 2, { dur: 2.4, gain: 0.02 }); });
      /* "the Living one… alive for ever and ever": a slow brass swell that stands up */
      A.brass(17.0, 27.0, G3, { gain: 0.06, attack: 2.6, release: 2.6, sweep: [[17, 300], [21, 1700], [27, 700]] });
      A.riser(19.2, 21.4, { f0: 260, f1: 4800, gain: 0.07 });
      A.boom(21.4, { freq: 46, gain: 0.4, dur: 3.2 });
      /* the keys: a gold chime, then a dark iron toll */
      A.bell(23.0, E6, { gain: 0.1, dur: 3.2 }); A.bell(23.05, A5, { gain: 0.05, dur: 3 });
      A.bell(23.85, G2, { gain: 0.16, dur: 7 }); A.boom(23.85, { freq: 41, gain: 0.45, dur: 3.2 });
      /* "Write therefore": things seen, things that are, things hereafter: three rising bells */
      [[27.9, D5], [29.3, A5], [30.8, D6]].forEach(([t, f]) => A.bell(t, f, { gain: 0.07, dur: 4.2 }));
      /* the seven stars: the seven-note figure */
      A.choir(32.6, 44, [D3, A3, D4, Fs4, A4, D5], { gain: 0.06, attack: 2.2, release: 2.4, vowel: 1.04 });
      [B5, D6, E6, Fs6, A6, B6, D7].forEach((f, i) => A.bell(33.6 + i * 0.4, f, { gain: 0.06, dur: 3.4 }));
      /* the seven golden lamp stands */
      [D5, E5, Fs5, A5, B5, D6, E6].forEach((f, i) => { const t = 38.0 + i * 0.4; A.bell(t, f, { gain: 0.08, dur: 4 }); A.shimmer(t + 0.05, f / 2, { dur: 2.2, gain: 0.02 }); });
      /* the stars rise, and the sky receives them */
      A.riser(40.4, 43.2, { f0: 300, f1: 7200, gain: 0.16 });
      A.boom(43.4, { freq: 40, gain: 0.7, dur: 5 });
      A.brass(43.4, 59.8, D3, { gain: 0.085, attack: 2.4, release: 2.2, sweep: [[43.4, 400], [47, 2400], [59.8, 1200]] });
      A.brass(44.0, 59.8, D4, { gain: 0.055, attack: 2.4, release: 2.2, sweep: [[44, 500], [48, 2800], [59.8, 1500]] });
      A.choir(43.6, 59.8, [D3, A3, D4, Fs4, A4, D5, A5], { gain: 0.07, attack: 2.2, release: 1.4, vowel: 1.1 });
      [D5, E5, Fs5, A5, B5, D6, E6].forEach((f, i) => { const t = 43.9 + i * 0.4; A.bell(t, f, { gain: 0.095, dur: 5 }); });
      /* the first lamp brightens: warm, low, amber */
      A.brass(53.6, 59.9, G3, { gain: 0.06, attack: 2.4, release: 0.8, wet: 0.8, sweep: [[53.6, 300], [58, 1400], [59.9, 900]] });
      A.bell(55.0, D5, { gain: 0.12, dur: 5 }); A.shimmer(55.1, A5, { dur: 5, gain: 0.05 });
    },
  });
  /*@@EP5X-END@@*/
})();
