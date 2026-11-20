/* ============================================================================
 *  REVELATION · PIXEL EDITION · Episode 102 · Come, Lord Jesus · Revelation 22:18–21
 *  2D pixel-art cut (480x200). The finale: John on the Patmos cliff with the scroll
 *  finished; the camera pulls away, the Ep 1 opening in reverse: cliff, sea, dawn,
 *  orbit. The word AMEN on the final hush, then black.
 * ========================================================================== */
(function () {
  'use strict';
  const Aura = window.Aura, px = Aura.px, lib = Aura.pxlib;
  const { W, H, clamp, lerp, sstep, hex, mix } = px;
  const ease = Aura.math.ease;

  Aura.define(102, {
    pixel: true,
    duration: 72,
    cues: [
      { ref: '22:18', t0: 4.0, t1: 18.0 },
      { ref: '22:19', t0: 19.0, t1: 32.0 },
      { ref: '22:20', t0: 33.0, t1: 46.0 },
      { ref: '22:21', t0: 47.0, t1: 60.0 },
    ],
    titles: [],

    build(ctx) {
      const U0 = () => px.cur();
      /* -------- target spot on the globe (the Aegean), tuned so coast lies near the dive centre */
      const lonT = lib.target.lon, latT = lib.target.lat;
      const S2 = sstep; const gold = [hex('#fff6d0'), hex('#ffe9a0'), hex('#ffd070'), hex('#f2a444'), hex('#c8702a'), hex('#8a4420')];

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
          /* the Ep 1 opening in reverse: static on John, then pull away: cliff, sea, dawn, orbit */
          const hold = 30, T = t < hold ? 55 + 3 * Math.sin(t * 0.3) : lerp(55, 1.5, Math.pow(sstep(hold, 66, t), 0.9));
          if (T < 24.7) drawSpace(T); else drawDawn(T);
          const wo = sstep(22.4, 24.4, T) * (1 - sstep(24.6, 27.2, T));
          let flash = wo, flashCol = hex('#fff4e0');
          px.post({ vignette: 1, fade: 0, flash, flashCol });
          const am = sstep(62, 65, t) * (1 - sstep(68, 70, t));
          if (am > 0.01) { const word = 'AMEN', sc = 7, tw = px.textWidth(word, sc, 1), x0 = Math.round(240 - tw / 2), y0 = 64; px.scrim(240, y0 + 26, 200, 52, am * 0.9); px.text(word, x0 + 2, y0 + 2, sc, hex('#1a0c16'), am); px.text(word, x0, y0, sc, (c, r, X, Y) => px.ramp(gold, (r + 1) / (7 * sc), X, Y), am); const cr = 'REVELATION · WEB', cw = px.textWidth(cr, 2, 1); px.text(cr, Math.round(240 - cw / 2), y0 + 7 * sc + 14, 2, hex('#ffd48a'), am * S2(65, 67, t)); }
          px.fadeOnly(Math.max(1 - sstep(0, 1.4, t), sstep(70, 73.5, t)));
        },
      };
    },

    score(A, from) {
      const D2 = 73.42, D3 = 146.83, F3 = 174.61, A3 = 220, D4 = 293.66, F4 = 349.23, Fs4 = 369.99, A4 = 440, D5 = 587.33, F5 = 698.46, A5 = 880, D6 = 1174.66;
      A.drone(0, 72, D2, { gain: 0.12, attack: 3, release: 4 }); A.pad(2, 60, [D3, A3, D4], { gain: 0.03, attack: 4, wet: 0.7 });
      A.choir(3, 66, [D3, A3, D4, F4, A4], { gain: 0.05, attack: 4, release: 4, vowel: 0.8 });
      A.sea(0, 60, { gain: 0.07 }); A.wind(0, 46, { gain: 0.05 });
      [[6, D5], [10, A4], [14, F5], [19, A4], [24, D5]].forEach(([t, f]) => A.bell(t, f, { gain: 0.06, dur: 4 }));
      A.brass(33, 60, D3, { gain: 0.06, attack: 4, release: 4, sweep: [[33, 400], [58, 1100]] }); A.shimmer(34, A5, { dur: 30, gain: 0.04 });
      A.riser(46, 60, { f0: 200, f1: 3000, gain: 0.1 });
      A.boom(62, { freq: 40, gain: 0.6, dur: 6 }); A.bell(63, D6, { gain: 0.08, dur: 10 }); A.bell(65, A5, { gain: 0.06, dur: 10 });
      A.drone(62, 72, D2 * 0.75, { gain: 0.05, attack: 2, release: 6 });
    },
  });
})();
