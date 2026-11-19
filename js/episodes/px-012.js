/* ============================================================================
 *  REVELATION · PIXEL EDITION · Episode 12 · Philadelphia: The Open Door · Revelation 3:7–9
 *  2D pixel-art cut (480x200). We open on the warm door at the end of Sardis's grey hall. A key of light
 *  turns; the leaves swing wide and shadows cannot push them shut; another gate shuts and no one can open
 *  it. We pass through into a small hill-town under a vast door of light. A little flame stands against the
 *  wind; shadow-figures come, and bow, and are loved. No faces.
 *
 *  0:00  the warm light of Episode 11 resolves into the door, title
 *  0:05  v7  the key; the door opens and no one can shut it; a gate shuts and no one can open it
 *  0:17  (through the door: white-out)
 *  0:18  v8  the open door set before the town; little power; the word kept; the name not denied
 *  0:29  v9  shadows come to the town, and kneel at the feet of the faithful; they know they are loved
 *  0:41  quiet: the door still open (Episode 13 begins on this frame)
 * ========================================================================== */
(function () {
  'use strict';
  const Aura = window.Aura, px = Aura.px, lib = Aura.pxlib;
  const { W, H, clamp, lerp, sstep, hex, hexes, mix } = px;
  const S = sstep;

  Aura.define(12, {
    pixel: true,
    duration: 54,
    cues: [
      { ref: '3:7', t0: 5.0, t1: 17.0 },
      { ref: '3:8', t0: 18.0, t1: 28.0 },
      { ref: '3:9', t0: 29.0, t1: 41.0 },
    ],
    titles: [],

    build(ctx) {
      const GREY = hexes(['#07080b', '#12141a', '#20232b', '#343943', '#525865', '#7c8290', '#b4b9c6']);
      const WARMW = hexes(['#0a0706', '#1a110c', '#2e1e14', '#4a3220', '#7a5632', '#b08848', '#e8c070']);
      const IRON = hexes(['#030305', '#0c0d14', '#1a1c28', '#2c3042', '#4a5068', '#7c84a0']);
      const DARKF = hexes(['#010102', '#04050a', '#0a0c14', '#181c28', '#34425a']);
      const LIFTF = hexes(['#0c0808', '#1e1410', '#3a261c', '#6a4630', '#b07a44']);

      const zoomK = (t) => S(4.6, 14.5, t);
      const openK = (t) => S(9.3, 13.0, t);
      const shutK = (t) => S(13.4, 14.2, t);
      const CY = 168;

      function ring(cx, cy, r, ry, col, k) {
        if (k <= 0.01) return;
        const N = Math.max(60, Math.round(r * 5));
        for (let i = 0; i < N; i++) { const a = i / N * 6.2832; px.dpx(Math.round(cx + Math.cos(a) * r), Math.round(cy + Math.sin(a) * ry), col, k); }
      }

      /* the door close-up: a wall, a glowing arch, two leaves, a gate to the left */
      function doorScene(t) {
        const U = px.cur(), Z = lerp(2.1, 0.95, zoomK(t)), open = openK(t), th = open * 1.35, cw = Math.cos(th) * 30;
        const gap = 22 * (1 - shutK(t)), warm = 0.3 + 0.7 * open;
        for (let y = 0; y < H; y++) {
          const wy = (y - CY) / Z;
          for (let x = 0; x < W; x++) {
            const wx = (x - 240) / Z;
            let col;
            const inArch = Math.abs(wx) <= 30 && ((wy <= 0 && wy >= -64) || (wy < -64 && Math.hypot(wx, wy + 64) <= 30));
            const inFrame = Math.abs(wx) <= 36 && ((wy <= 0 && wy >= -64) || (wy < -64 && Math.hypot(wx, wy + 64) <= 36));
            if (inArch) {
              const lw = wx < 0 ? wx + 30 : 30 - wx;            /* distance from the outer edge */
              if (lw <= cw) {
                const plank = Math.floor((wx + 30) / 6), toGap = cw - lw;
                let v = 0.2 + 0.07 * px.hash(plank, 1, 4) + (((wx + 300) % 6) < 0.9 ? -0.06 : 0) + (1 - open) * 0.35 * Math.exp(-Math.abs(wx) / 5) + 0.5 * open * Math.exp(-toGap / 2.5);
                if ((wy > -53 && wy < -49) || (wy > -21 && wy < -17)) v -= 0.1;
                col = px.ramp(lib.BRONZE, clamp(v, 0, 1), x, y);
              } else col = px.ramp(lib.HONEY, clamp(0.82 + 0.18 * (1 + wy / 94) + 0.05 * px.fbm(wx * 0.1, wy * 0.1 - t * 0.3, 2, 5), 0, 1), x, y);
            } else if (inFrame) col = px.ramp(GREY, 0.42 + 0.18 * px.hash(Math.floor(wx / 7), Math.floor(wy / 7), 3), x, y);
            else if (wy > 0) {
              const i = Math.floor(wx / 20), j = Math.floor(wy / 12);
              let v = 0.2 + 0.05 * ((i + j) & 1) + 0.04 * px.hash(i, j, 5);
              v += open * 0.6 * Math.exp(-wx * wx / 3200) * Math.exp(-wy / 55);
              col = mix(px.ramp(GREY, clamp(v, 0, 1), x, y), px.ramp(WARMW, clamp(v, 0, 1), x, y), clamp(open * Math.exp(-wx * wx / 5000) + 0.1, 0, 1));
            } else {
              const bj = Math.floor(wy / 16), bi = Math.floor((wx + (bj & 1) * 12) / 24), mx = (((wx + (bj & 1) * 12) % 24) + 24) % 24, my = ((wy % 16) + 16) % 16;
              let v = 0.3 + 0.08 * px.hash(bi, bj, 3) - ((mx < 1.4 || my < 1.2) ? 0.09 : 0);
              const d = Math.hypot(wx, wy + 40);
              v += (0.18 + 0.5 * open) * Math.exp(-d / 70);
              col = mix(px.ramp(GREY, clamp(v, 0, 1), x, y), px.ramp(WARMW, clamp(v, 0, 1), x, y), clamp((0.25 + 0.75 * open) * Math.exp(-d / 150) + 0.1, 0, 1));
            }
            /* the iron gate to the left: it shuts, and no one opens it */
            const gx = wx + 108;
            if (Math.abs(gx) <= 24 && wy <= 0 && wy >= -62) {
              const edge = Math.abs(gx) > 22 || wy < -60;
              col = px.ramp(IRON, edge ? 0.5 : 0.1, x, y);
              if (!edge) {
                const side = gx < 0 ? -1 : 1, depth = (24 - Math.abs(gx));
                const shake = shutK(t) > 0.99 ? Math.sin(t * 40) * 0.7 * Math.exp(-(t - 14.4) / 0.6) * (t > 14.4 ? 1 : 0) : 0;
                if (depth <= 24 - gap + shake + 1) { const bar = ((Math.floor(Math.abs(gx)) % 5) === 0) || (wy > -22 && wy < -19) || (wy > -44 && wy < -41); col = px.ramp(IRON, bar ? 0.4 + 0.15 * (side > 0 ? 1 : 0) : 0.05, x, y); if (bar && Math.abs(gx) < 4 && gap < 1) col = px.ramp(IRON, 0.3, x, y); }
              }
            }
            U[y * W + x] = col;
          }
        }
        /* the lock of the gate glows once it is shut, a pale gold that no hand can turn */
        if (shutK(t) > 0.95) { const lx = Math.round(240 + (-108) * Z), ly = Math.round(CY - 30 * Z), q = 0.7 + 0.3 * Math.sin(t * 4); lib.halo(lx, ly, 12 * Z, hex('#ffd070'), 0.5 * q, 1); px.disc(lx, ly, Math.max(2, Math.round(2.4 * Z)), hex('#ffe9a0')); }
      }

      /* a stroke of shadow reaching toward a point, torn away by light */
      function reach(x0, y0, x1, y1, k, t) {
        if (k <= 0.01) return;
        for (let u = 0; u <= 1; u += 0.025) {
          const x = lerp(x0, x1, u) + Math.sin(u * 9 + t * 6) * 2.4 * u, y = lerp(y0, y1, u) + Math.cos(u * 7 + t * 5) * 1.6, r = 3.4 * (1 - u) + 1;
          for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) if (dx * dx + dy * dy <= r * r) px.dpx(Math.round(x) + dx, Math.round(y) + dy, hex('#07040a'), k);
        }
      }

      function shadowFig(x, y, h, a, lift, t, seed, bow) {
        if (a <= 0.01) return;
        const ramp = px.mixRamp(DARKF, LIFTF, clamp(lift, 0, 1)), head = Math.max(2, Math.round(h * 0.1));
        const glitch = lift < 0.5 && Math.sin(t * 11 + seed * 3) > 0.93 ? 1 : 0;
        for (let r = 0; r <= h; r++) {
          const f = r / h, hw = f < 0.13 ? head : f < 0.17 ? head * 0.55 : f < 0.32 ? h * 0.2 : lerp(h * 0.2, h * 0.3, S(0.32, 1, f)), yy = Math.round(y - h + r);
          for (let dx = -Math.ceil(hw); dx <= Math.ceil(hw); dx++) {
            if (Math.abs(dx) > hw) continue;
            const u = dx / Math.max(1, hw), X = Math.round(x + dx + bow * (1 - f) * (1 - f) * 0.8 + glitch * ((r >> 2) & 1) * 2);
            if (a > px.thr(X, yy)) px.set(X, yy, px.ramp(ramp, clamp(0.35 + 0.3 * (-u) + 0.15 * (1 - f), 0, 1), X, yy));
          }
        }
        for (let dy = -head; dy <= head; dy++) for (let dx = -head; dx <= head; dx++) if (dx * dx + dy * dy <= head * head) { const X = Math.round(x + bow) + dx, Y = Math.round(y - h - head * 0.4) + dy; if (a > px.thr(X, Y)) px.set(X, Y, px.ramp(ramp, clamp(0.5 - 0.25 * dx / head, 0, 1), X, Y)); }
      }

      const camK = (t) => S(17.2, 30, t);
      function camAt(t) { return { z: lerp(1.7, 1.0, camK(t)), cx: lerp(46, 10, camK(t)), cy: lerp(-26, 20, camK(t)) }; }
      const FIGX = -28;

      return {
        render(t) {
          const U = px.cur();
          if (t < 17.4) {
            doorScene(t);
            const Z = lerp(2.1, 0.95, zoomK(t)), open = openK(t);
            /* the key of David: appears, turns, rises */
            const kk = S(5.3, 6.6, t) * (1 - S(15.4, 17.0, t)), rise = S(10.5, 16, t);
            const kz = lerp(1.2, 0.9, zoomK(t)), ky = lerp(CY - 54 * Z, 80, rise);
            lib.key({ x: 240, y: ky, z: kz, k: kk, rot: 1.35 * Math.sin(Math.PI * S(7.7, 9.6, t)), t, glow: 1 });
            /* shadows push at the leaves and are torn away: no one can shut it */
            const pk = S(11.6, 12.2, t) * (1 - S(13.1, 14.0, t));
            reach(240 - 92 * Z, CY - 44 * Z, 240 - 26 * Z, CY - 38 * Z, pk, t); reach(240 + 92 * Z, CY - 22 * Z, 240 + 26 * Z, CY - 30 * Z, pk, t);
            if (t > 13.0 && t < 14.6) { const u = (t - 13.0) / 1.6; ring(240, CY - 40 * Z, u * 90, u * 60, hex('#fff0c0'), (1 - u) * 0.9); }
            /* the gate slams: a ring at the lock, and the shadows that try it fail */
            if (t > 13.9 && t < 15.3) { const u = (t - 13.9) / 1.4; ring(240 - 108 * Z, CY - 30 * Z, u * 40, u * 40, hex('#ffd070'), (1 - u) * 0.8); }
            const gk = S(14.6, 15.2, t) * (1 - S(16.2, 17, t));
            reach(240 - 108 * Z - 70, CY - 16 * Z, 240 - 108 * Z - 20 * Z, CY - 28 * Z, gk, t + 3);
            lib.flare(240, CY - 40 * Z, 0.55 * open * (1 - S(15.5, 17.2, t)), 1);
            px.post({ vignette: 1.0, flash: 0.9 * (1 - S(0, 2.2, t)) + 1.0 * S(16.2, 17.3, t), flashCol: hex('#ffe6b0') });
          } else {
            const c = camAt(t), wind = 0.5 + 2.6 * S(21.5, 23, t) * (1 - S(25, 26.5, t));
            const sc = lib.philadelphia({ t, z: c.z, cx: c.cx, cy: c.cy, lit: 1, door: S(17.2, 19.5, t), wind });
            const fx = sc.sX(FIGX), fy = Math.round(sc.sY(sc.groundY(FIGX) + 2)), fh = Math.round(34 * c.z);
            /* v9: shadows come from the left, kneel at the feet of the faithful, and are loved */
            const walk = S(29.5, 34.5, t), kneel = S(35, 37.5, t), lift = S(38.5, 41.5, t), fade = 1 - S(44, 51, t);
            for (let i = 0; i < 4; i++) {
              const wxp = lerp(-150 - i * 22, FIGX - 24 - i * 13, walk), gy = Math.round(sc.sY(sc.groundY(wxp) + 2)), hh = Math.round(32 * c.z * lerp(1, 0.6, kneel));
              shadowFig(sc.sX(wxp), gy, hh, S(29.2, 30.4, t) * fade, lift, t, i, kneel * 7 * c.z);
            }
            /* the faithful one, and the little flame she or he carries: it bends in the wind and does not go out */
            const gust = S(21.5, 23, t) * (1 - S(25, 26.5, t));
            lib.robed({ U, h: fh, x: fx, y: fy, a: 1, t, seed: 1, glow: 0, lean: -gust * 3 });
            lib.flame({ x: fx + 9 * c.z, y: fy - 13 * c.z, k: 1 - 0.45 * gust, pop: 0, t, seed: 77, s: 0.55 * c.z, glow: 0.9 });
            if (gust > 0.02) lib.windStreaks(t, gust * 0.45, hex('#ffe0b0'), 120, 170);
            /* the word kept, the name not denied */
            const mk = S(25.6, 28.2, t) * (1 - S(40, 44, t));
            if (mk > 0.01) lib.marks(fx, fy - fh - 14 * c.z, 4, mk, t, 3, { sp: 6, h: 6 });
            /* v9: warm rings of being loved */
            for (let r = 0; r < 3; r++) { const u = (t - 38.4 - r * 0.9) / 3.4; if (u > 0 && u < 1) ring(fx, fy - fh * 0.5, u * 220, u * 120, hex('#ffe0a0'), (1 - u) * 0.8); }
            lib.motes({ x0: 0, x1: W, y0: 20, y1: 190, t, k: 0.5 * S(18, 24, t), n: 50, speed: 5 });
            px.post({ vignette: 1.0, flash: 1.0 * (1 - S(17.4, 19.6, t)) + 0.25 * (t > 38.4 ? Math.exp(-(t - 38.4) / 0.5) : 0), flashCol: hex('#fff4d8') });
          }
          lib.titleCard(t, 'THE OPEN DOOR', 12);
        },
      };
    },

    score(A, from) {
      const D2 = 73.42, D3 = 146.83, A3 = 220, D4 = 293.66, Fs4 = 369.99, A4 = 440, D5 = 587.33, Fs5 = 739.99, A5 = 880, D6 = 1174.66, E5 = 659.25, G3 = 196;
      /* continuity: Sardis's hollow D, warming */
      A.drone(0, 52, D2, { gain: 0.09, attack: 0.8, release: 3 });
      A.choir(0, 6, [D3, A3, D4], { gain: 0.05, attack: 1.4, release: 2.0, vowel: 0.8 });
      A.wind(1, 20, { gain: 0.03, bright: 0.4, attack: 2.0 });
      /* v7: the key */
      A.shimmer(5.4, A5, { dur: 5, gain: 0.07 }); A.bell(5.5, D6, { gain: 0.08, dur: 6 });
      A.boom(8.3, { freq: 80, gain: 0.3, dur: 0.5 }); A.bell(8.3, A4, { gain: 0.1, dur: 3 });
      /* the door opens, and no one can shut it */
      A.brass(9.4, 17.4, D3, { gain: 0.06, attack: 2.6, release: 1.4, sweep: [[9.4, 500], [14, 1800]] });
      A.choir(9.4, 18, [D3, A3, D4, Fs4, A4, D5], { gain: 0.07, attack: 2.0, release: 2.0, vowel: 1.1 });
      A.noise({ t0: 11.6, t1: 13.4, gain: [[11.6, 0.0], [12.4, 0.07], [13.4, 0]], filter: { type: 'lowpass', freq: 400, q: 0.7 }, wet: 0.5, attack: 0.3, release: 0.5 });
      /* the gate shuts, and no one can open it */
      A.boom(13.9, { freq: 44, gain: 0.55, dur: 2.4 }); A.bell(13.9, 300, { gain: 0.12, dur: 4 });
      A.noise({ t0: 13.9, t1: 14.6, gain: [[13.9, 0.14], [14.6, 0]], filter: { type: 'bandpass', freq: [[13.9, 3600], [14.6, 900]], q: 1.0 }, wet: 0.4, attack: 0.004, release: 0.3 });
      /* through the door: white-out */
      A.riser(15.5, 17.4, { f0: 300, f1: 2400, gain: 0.05 }); A.shimmer(17.2, D6, { dur: 6, gain: 0.07 });
      /* v8: the little flame: a few quiet bells, a gust, the flame stays */
      [D5, Fs5, A5, Fs5, D5].forEach((f, i) => A.bell(18.6 + i * 1.7, f, { gain: 0.05, dur: 4.5 }));
      A.choir(18, 29, [D3, A3, Fs4], { gain: 0.045, attack: 2.4, release: 2.0, vowel: 0.7 });
      A.noise({ t0: 21.5, t1: 26.5, gain: [[21.5, 0.0], [23, 0.09], [26.5, 0]], filter: { type: 'bandpass', freq: [[21.5, 600], [24, 1500], [26.5, 700]], q: 0.6 }, wet: 0.5, attack: 0.5, release: 1.0 });
      A.shimmer(25.8, A5, { dur: 4, gain: 0.05 });
      /* v9: shadows approach; they bow; love */
      A.drone(29, 38, G3 / 2, { gain: 0.06, attack: 1.5, release: 2.0 });
      for (let t = 30; t < 35; t += 1.4) A.boom(t, { freq: 50, gain: 0.1, dur: 0.6 });
      A.noise({ t0: 30, t1: 36, gain: 0.02, filter: { type: 'highpass', freq: 3600, q: 0.4 }, wet: 0.4, attack: 1.2, release: 1.2 });
      A.choir(35, 46, [D3, A3, D4, Fs4, A4, E5], { gain: 0.065, attack: 2.0, release: 2.4, vowel: 1.1 });
      A.boom(38.4, { freq: 46, gain: 0.4, dur: 3.0 }); A.bell(38.4, D5, { gain: 0.14, dur: 8 }); A.bell(38.45, A5, { gain: 0.08, dur: 7 });
      A.shimmer(38.5, D6, { dur: 7, gain: 0.06 });
      /* quiet: ready for the hour of trial */
      A.choir(44, 54, [D3, A3, D4, A4], { gain: 0.05, attack: 2.4, release: 2.0, vowel: 0.9 });
    },
  });
})();
