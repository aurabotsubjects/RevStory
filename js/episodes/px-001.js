/* ============================================================================
 *  REVELATION · PIXEL EDITION · Episode 1 · The Unveiling · Revelation 1:1–3
 *  2D pixel-art cut (480x200, dithered palettes). Same storyline, timing, score
 *  and WEB subtitles as the original 3D episode; only the look has changed.
 *
 *  0:00  Aurabot Project sting (rings + pixel wordmark) over a night sky of stars
 *  0:06  REVELATION title
 *  0:12  VERSES BEGIN · orbit: the Earth's night side, city lights, dawn on the limb
 *  0:14  the dive through cloud into a white-out
 *  0:25  dawn over the Aegean: sea, Patmos, the sun climbing behind the hills
 *  0:37  the cliff: John, seen from behind, watching the sunrise
 *  0:43  push-in behind his shoulder
 *  0:50  the wind rises; grass, robe and hair stream; fade out
 * ========================================================================== */
(function () {
  'use strict';
  const Aura = window.Aura, px = Aura.px, lib = Aura.pxlib;
  const { W, H, clamp, lerp, sstep, hex, mix } = px;
  const ease = Aura.math.ease;

  Aura.define(1, {
    pixel: true,
    duration: 60,

    /* subtitle cues (text comes from js/scripture-web.js) */
    cues: [
      { ref: '1:1', t0: 12.6, t1: 25.2 },
      { ref: '1:2', t0: 25.6, t1: 32.6 },
      { ref: '1:3', t0: 33.0, t1: 47.8 },
    ],
    titles: [],   /* titles are drawn in pixels by the renderer */

    build(ctx) {
      const U0 = () => px.cur();
      /* -------- target spot on the globe (the Aegean), tuned so coast lies near the dive centre */
      const lonT = lib.target.lon, latT = lib.target.lat;
      const gold = [hex('#fff6d0'), hex('#ffe9a0'), hex('#ffd070'), hex('#f2a444'), hex('#c8702a'), hex('#8a4420')];

      /* ---------- global timeline curves ---------- */
      const dawnAt = (t) => lerp(0.17, 0.98, Math.pow(sstep(24.6, 62, t), 0.85));
      const riseAt = (t) => lerp(-13, 27, sstep(24.6, 60, t));
      const windAt = (t) => (t < 44 ? 0.16 : lerp(0.16, 1.0, Math.pow(sstep(44, 59.5, t), 1.4)));

      /* ================================================================ SPACE */
      function drawSpace(t) {
        const U = U0();
        lib.space({ ox: -t * 0.5, oy: t * 0.12, t });
        const phi = lerp(1.28, 0.7, sstep(0, 17, t)), Lz = lerp(-0.93, 0.6, Math.pow(sstep(0, 23.5, t), 1.2)), m = Math.sqrt(1 - Lz * Lz);
        const L = [Math.cos(phi) * m, Math.sin(phi) * m, Lz];
        let cx, cy, R, lon0, lat0;
        if (t < 14.6) {
          const e = sstep(0, 14.6, t);
          cx = lerp(240, 215, e); cy = lerp(384, 330, e); R = lerp(305, 330, e);
          lon0 = lonT - lerp(1.3, 0.8, e); lat0 = lerp(-0.12, 0.2, e);
        } else {
          const u = clamp((t - 14.6) / 10, 0, 1), e = Math.pow(u, 1.35);
          cx = lerp(215, 240, ease.io2(u)); cy = lerp(330, 100, ease.io2(Math.min(1, u * 1.08)));
          R = 330 * Math.exp(Math.log(2400 / 330) * e);
          lon0 = lonT - lerp(0.8, 0, ease.io2(u)); lat0 = lerp(0.2, latT, ease.io2(u));
        }
        const sh = t > 18 ? Math.round((Math.sin(t * 41) + Math.sin(t * 27 + 1)) * 0.5 * clamp((t - 18) / 5, 0, 1) * 2) : 0;
        cx += sh; cy += (t > 18 ? Math.round(Math.sin(t * 33 + 2) * clamp((t - 18) / 5, 0, 1) * 1.6) : 0);
        /* the sun sits just behind the limb */
        const sx = cx + Math.cos(phi) * R * 1.01, sy = cy - Math.sin(phi) * R * 1.01;
        const sunK = 1 - sstep(9, 16, t);
        if (sunK > 0.01) px.glow(sx, sy, 70, [0, hex('#2a1838'), hex('#5a2a50'), hex('#a84a5a'), hex('#f08a58'), hex('#ffd890'), hex('#ffffff')], 0.95 * sunK, 0.8);
        lib.planet({ U, cx, cy, R, lon0, lat0, L, cloudBoost: sstep(15.5, 22.6, t) * 0.97, lights: 1 });
        if (sunK > 0.01 && sx > -40 && sx < W + 40 && sy > -30 && sy < H + 30) lib.flare(sx, sy, 0.9 * sunK, 1);
      }

      /* ======================================================== SEA / CLIFF */
      function drawDawn(t) {
        const U = U0();
        const dawn = dawnAt(t), rise = riseAt(t), wind = windAt(t);
        const inCliff = t >= 36.6;
        let hy, camX, z = 1, ox = 0, oy = 0, pX = 140;
        if (!inCliff) {
          const u = (t - 24.6) / 12;
          hy = lerp(134, 106, ease.io2(clamp(u, 0, 1)));
          camX = lerp(700, 0, ease.io2(clamp(u, 0, 1)));
        } else {
          if (t < 43.2) { const u = sstep(36.6, 43.2, t); z = 1.08 + 0.06 * u; ox = 0; oy = 0; }
          else if (t < 50.2) { const u = ease.io2((t - 43.2) / 7); z = lerp(1.14, 1.75, u); ox = lerp(0, 60, u); oy = lerp(0, 10, u); }
          else { const u = (t - 50.2) / 9.8; z = lerp(1.75, 1.9, u); ox = lerp(60, 84, ease.io2(u)); oy = lerp(10, 12, u) + Math.sin(u * 3.1) * 1.2; }
          hy = 98 + oy * 0.5;
          camX = -(t - 36.6) * 1.6;
        }
        const sunX = 262 + camX * 0.04 - (inCliff ? (z - 1) * 6 : 0);
        const seaPar = inCliff ? 0.62 : 0.62;
        const info = lib.seascape({ U, t, dawn, hy, sunX, rise, camX, camY: 0, wind, amp: 1 + wind * 1.5, rays: inCliff ? sstep(44, 56, t) * 0.38 : 0, patmosPar: seaPar, patmosScale: 1 });
        if (inCliff) {
          const gy = lib.groundY(pX);
          const c = { z, pX, pY: gy, ox, oy };
          const lit = clamp(0.3 + 0.7 * sstep(30, 58, t), 0, 1);
          const l = { U, dawn, sunX, lit };
          lib.cliffGround(c, l);
          lib.grass(c, l, 'edge', t, wind);
          const M = lib.camMap(c);
          lib.john({ U, x: M.sx(pX), y: M.sy(gy) + 3 * z, h: 46 * z, t, wind, sunX, lit, dawn });
          lib.grass(c, l, 'front', t, wind);
          lib.windStreaks(t, wind * sstep(44, 50, t) + 0.0, mix(info.horizon, hex('#ffffff'), 0.4), 10, hy + 30);
        } else {
          lib.windStreaks(t, wind * 0.6, mix(info.horizon, hex('#ffffff'), 0.3), 12, hy + 40);
        }
      }

      /* =============================================================== TITLES */
      function drawTitles(t) {
        /* studio sting */
        const ks = sstep(0.5, 1.9, t) * (1 - sstep(3.9, 4.7, t));
        if (ks > 0.01) {
          lib.studioMark(240, 78, ks, t);
          const label = 'AURABOT', label2 = 'PROJECT';
          const wA = px.textWidth(label, 2), wB = px.textWidth(label2, 2), gap = 14, total = wA + gap + wB, x0 = Math.round(240 - total / 2), y0 = 112;
          const colA = hex('#f1ecff'), colB = hex('#ffd48a');
          px.text(label, x0 + 2, y0 + 2, 2, hex('#05060f'), ks * 0.9);
          px.text(label2, x0 + wA + gap + 2, y0 + 2, 2, hex('#05060f'), ks * 0.9);
          px.text(label, x0, y0, 2, colA, ks);
          px.text(label2, x0 + wA + gap, y0, 2, colB, ks);
        }
        /* REVELATION */
        const kt = sstep(6.4, 7.8, t) * (1 - sstep(12.0, 12.8, t));
        if (kt > 0.01) {
          const word = 'REVELATION', sc = 5, tw = px.textWidth(word, sc, 1), x0 = Math.round(240 - tw / 2), y0 = 56;
          px.scrim(240, y0 + 22, 190, 42, kt * 1.05);
          const sweep = lerp(-40, 330, sstep(8.6, 10.6, t));
          for (let i = 0; i < word.length; i++) {
            const ka = clamp((t - 6.6 - i * 0.16) / 0.8, 0, 1) * (1 - sstep(12.0, 12.8, t));
            if (ka <= 0) continue;
            const lx = x0 + i * 6 * sc, ch = word[i];
            px.text(ch, lx + 3, y0 + 3, sc, hex('#1a0c16'), ka);
            px.text(ch, lx + 2, y0 + 2, sc, hex('#3a1a1c'), ka);
            px.text(ch, lx, y0, sc, (c, r, X, Y) => {
              let col = px.ramp(gold, (r + 1) / (7 * sc), X, Y);
              const d = (X - Y * 0.7) - sweep; if (d > 0 && d < 8) col = hex(d < 4 ? '#ffffff' : '#fff0c0');
              return col;
            }, ka);
          }
          const sub = 'EPISODE 1 · THE UNVEILING', ks2 = sstep(8.2, 9.4, t) * (1 - sstep(12.0, 12.8, t));
          const sw = px.textWidth(sub, 2, 1), sx0 = Math.round(240 - sw / 2), sy0 = y0 + 7 * sc + 14;
          px.text(sub, sx0 + 1, sy0 + 1, 2, hex('#0a0814'), ks2);
          px.text(sub, sx0, sy0, 2, hex('#ffd48a'), ks2);
        }
      }

      return {
        render(t) {
          const U = U0();
          if (t < 24.7) drawSpace(t); else drawDawn(t);
          /* scene grading */
          let dim = 0;
          if (t > 0.9 && t < 4.7) dim = 0.8 * (1 - sstep(0.9, 1.6, t));
          dim = Math.max(dim, 0.8 * (1 - sstep(4.2, 6.4, t)) * (t < 6.5 ? 1 : 0));
          const wo = sstep(22.4, 24.4, t) * (1 - sstep(24.6, 27.2, t));
          let flash = wo, flashCol = hex('#fff4e0');
          const leak = Math.exp(-Math.pow((t - 36.7) / 0.35, 2)) * 0.6; if (leak > flash) { flash = leak; flashCol = hex('#ffb860'); }
          px.post({ vignette: 1, fade: Math.max(dim, 0), flash, flashCol });
          drawTitles(t);
          const gf = Math.max(1 - sstep(0, 0.9, t), sstep(58.1, 59.9, t));
          px.fadeOnly(gf);
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
})();
