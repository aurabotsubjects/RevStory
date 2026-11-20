/* ============================================================================
 *  REVELATION · PIXEL EDITION · Episode 16 · A Door Standing Open in Heaven · Revelation 4:1–5
 *  2D pixel-art cut (480x200). Opens on the open door in the night sky that ended Episode 15. A trumpet voice: "Come up here."
 *  The great ascent: John rises through clouds and starlight. A throne in heaven, back-lit; the One on it appears like jasper and ruby,
 *  and an emerald rainbow circles it. Twenty-four thrones, twenty-four elders in white with gold crowns. Lightning, rumblings, thunder.
 *  Seven blazing lamps before the throne. The sea of glass begins to ripple. No faces.
 *
 *  0:00  the door in the night sky, title
 *  0:05  v1   the trumpet voice: "Come up here"
 *  0:23  v2   in the Spirit: the ascent through the clouds
 *  0:32  v3   the throne, jasper and ruby, the emerald rainbow
 *  0:42  v4   twenty-four thrones, twenty-four elders
 *  0:53  v5   lightnings, voices, thunder; seven lamps
 *  0:64  the sea of glass ripples beneath the throne (Episode 17)
 * ========================================================================== */
(function () {
  'use strict';
  const Aura = window.Aura, px = Aura.px, lib = Aura.pxlib;
  const { W, H, clamp, lerp, sstep, hex, hexes, mix } = px;
  const S = sstep;

  Aura.define(16, {
    pixel: true,
    duration: 72,
    cues: [
      { ref: '4:1', t0: 5.0, t1: 21.6 },
      { ref: '4:2', t0: 23.0, t1: 30.6 },
      { ref: '4:3', t0: 32.0, t1: 40.4 },
      { ref: '4:4', t0: 42.0, t1: 51.4 },
      { ref: '4:5', t0: 53.0, t1: 63.4 },
    ],
    titles: [],

    build(ctx) {
      const NAVY = hexes(['#04050e', '#080b1c', '#0e1432', '#1a2250', '#2c3470', '#4a508c', '#8890bc']);
      const CLOUD = hexes(['#0a0e24', '#161c42', '#2a3268', '#4a5496', '#7e88c0', '#b4bce0', '#eef0ff']);
      const GOLDSKY = hexes(['#1a1008', '#3d2410', '#7a4a1a', '#b8802a', '#e8b04a', '#ffd987', '#fff3c8']);
      const ring = (cx, cy, r, ry, col, k) => { if (k <= 0.01) return; const N = Math.max(60, Math.round(r * 5)); for (let i = 0; i < N; i++) { const a = i / N * 6.2832; px.dpx(Math.round(cx + Math.cos(a) * r), Math.round(cy + Math.sin(a) * ry), col, k); } };
      const stars = (t, n, ymax, v) => { for (let i = 0; i < n; i++) { const x = Math.floor(px.hash(i, 1, 51) * W), y = Math.floor(px.hash(i, 2, 51) * ymax), tw = 0.5 + 0.5 * Math.sin(t * 1.5 + i); if (tw > 0.3) px.set(x, y, hex(i % 4 === 0 ? '#ffffff' : '#b8c0e8')); } };

      function night(t, glowY, glow) {
        const U = px.cur();
        for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
          const dx = (x - 240) / 240, v = 0.05 + 0.2 * (y / 200) + glow * 0.55 * Math.exp(-dx * dx * 2.4 - Math.pow((y - glowY) / 90, 2)) + 0.03 * px.fbm(x * 0.02, y * 0.04 + t * 0.03, 2, 8);
          U[y * W + x] = px.ramp(NAVY, clamp(v, 0, 1), x, y);
        }
      }

      /* scene A: the open door high in the sky, John small below it */
      function doorScene(t) {
        const k = 1 - S(20.5, 23.5, t);
        night(t, 70, 0.7);
        stars(t, 150, 110);
        /* a long bank of cloud */
        const U = px.cur();
        for (let y = 130; y < H; y++) for (let x = 0; x < W; x++) { const f = (y - 130) / 70, v = 0.14 + 0.5 * f + 0.14 * px.fbm(x * 0.012 - t * 0.02, y * 0.05, 3, 9); U[y * W + x] = px.ramp(CLOUD, clamp(v * (1 - 0.1 * (1 - f)), 0, 1), x, y); }
        /* the door */
        const cx = 240, top = 20, base = 86, R = 22;
        for (let d = 0; d < 6; d++) lib.halo(cx, base - d * 9, 70 - d * 4, hex('#ffe9b0'), 0.2 * k, 1.2);
        for (let y = top; y <= base; y++) for (let x = cx - R - 3; x <= cx + R + 3; x++) {
          const dx = x - cx, inA = Math.abs(dx) <= R && (y >= top + R || Math.hypot(dx, y - (top + R)) <= R), inF = Math.abs(dx) <= R + 3 && (y >= top + R || Math.hypot(dx, y - (top + R)) <= R + 3);
          if (inA) px.set(x, y, px.ramp(lib.HONEY, clamp(0.82 + 0.18 * (y - top) / (base - top) + 0.05 * Math.sin(t * 1.5 + y * 0.2), 0, 1), x, y));
          else if (inF) px.set(x, y, px.ramp(lib.HONEY, 0.4, x, y));
        }
        lib.flare(cx, base - 4, 0.55, 1);
        /* the voice, like a trumpet: rings from the door */
        for (let r = 0; r < 4; r++) { const u = ((t - 6.0 - r * 1.8) / 4.2); if (u > 0 && u < 1) ring(cx, 64, u * 300, u * 120, hex('#ffe9a0'), (1 - u) * 0.8); }
        /* John, small on the cloud, looking up */
        lib.robed({ U, h: 24, x: 118, y: 168, a: 1, t, seed: 2, glow: 0 });
        return k;
      }

      /* scene B: the ascent, a long climb through cloud and starlight */
      function ascent(t) {
        const U = px.cur(), u = (t - 22.0) / 11.0, sp = 40 + 260 * S(0, 0.8, u), off = (t - 22.0) * sp * 0.5;
        for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
          const dx = (x - 240) / 240, up = 1 - y / H, glow = Math.exp(-dx * dx * 4 - Math.pow((y - 20) / 100, 2)) * (0.15 + 0.85 * S(0.3, 1, u));
          const band = px.fbm(x * 0.012, (y + off) * 0.03, 4, 21), band2 = px.fbm(x * 0.03 + 9, (y + off * 1.8) * 0.06, 3, 33);
          const cl = clamp((band - 0.46) * 2.6, 0, 1) * (1 - 0.5 * up) + clamp((band2 - 0.56) * 2, 0, 1) * 0.4;
          let v = 0.06 + 0.14 * up + cl * (0.45 + 0.3 * glow) + glow * 0.55;
          U[y * W + x] = px.ramp(GOLDSKY, clamp(v * (0.65 + 0.35 * S(0.15, 0.7, u)), 0, 1), x, y);
          if (v < 0.4 * 0 + 0.0) U[y * W + x] = px.ramp(CLOUD, 0.1, x, y);
        }
        /* before the golden light: still the night's blue at the bottom of the climb */
        const nb = 1 - S(0.0, 0.55, u);
        for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = y * W + x; const bl = px.ramp(CLOUD, clamp(0.08 + 0.4 * (px.fbm(x * 0.012, (y + off) * 0.03, 4, 21)) * (1 - y / H * 0.5), 0, 1), x, y); if (nb > px.thr(x, y)) U[i] = bl; }
        /* streaks of starlight falling past */
        for (let i = 0; i < 90; i++) { const x = Math.floor(px.hash(i, 1, 71) * W), sp2 = 0.4 + px.hash(i, 2, 71), y0 = ((px.hash(i, 3, 71) * 260 + off * sp2 * 2) % 260) - 30, len = Math.round(2 + sp * 0.05 * sp2); for (let q = 0; q < len; q++) px.dpx(x, Math.round(y0 + q), hex(i % 3 ? '#fff6d8' : '#cfe0ff'), (1 - q / len) * 0.85 * S(0, 0.3, u)); }
        /* John rising in a column of light (a small robed figure, centre) */
        const fy = 150 - 40 * S(0.55, 1, u);
        lib.halo(240, fy - 20, 60, hex('#ffe9b0'), 0.5 * S(0.1, 0.6, u), 1.3);
        lib.robed({ U, h: 28, x: 240, y: fy, a: 1 - S(0.92, 1, u), t, seed: 2, glow: 0 });
        lib.motes({ x0: 140, x1: 340, y0: 0, y1: 200, t, k: 0.6, n: 60, speed: sp * 0.8, dir: 1 });
      }

      /* the glory room: backdrop, throne, rainbow, elders, lightning, lamps */
      function hallBack(t, flash) {
        const U = px.cur();
        for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
          const dx = (x - 240) / 240, f = y / H;
          let v = 0.05 + 0.12 * f + 0.34 * Math.exp(-dx * dx * 2.4 - Math.pow((y - 90) / 100, 2)) + 0.03 * px.fbm(x * 0.02, y * 0.04 + t * 0.03, 2, 8);
          if (y > 150) v = 0.1 + 0.2 * Math.exp(-dx * dx * 1.5) * ((y - 150) / 50) + 0.04 * px.fbm(x * 0.04, y * 0.2 - t * 0.1, 2, 4);
          U[y * W + x] = px.ramp(y > 150 ? lib.CRYS : GOLDSKY, clamp(v + flash * 0.4, 0, 1), x, y);
        }
      }
      /* twenty-four thrones: two rising arcs, twelve each side, with an elder on each */
      function elders(t, k, seat) {
        const pts = [];
        for (let i = 0; i < 24; i++) {
          const side = i < 12 ? -1 : 1, j = i % 12, row = Math.floor(j / 4), col = j % 4;
          pts.push({ x: 240 + side * (74 + col * 28 + row * 6), y: 168 - row * 20 - col * 3, s: 0.78 + row * -0.04, i });
        }
        pts.sort((a, b) => a.y - b.y);
        for (const p of pts) {
          const ek = clamp(k * 26 - p.i * 0.9, 0, 1), sd = p.x < 240 ? -1 : 1; if (ek <= 0.02) continue;
          /* the small throne */
          for (let y = p.y - 17; y <= p.y; y++) for (let x = p.x - 7; x <= p.x + 7; x++) { const back = Math.abs(x - p.x) >= 5 && y < p.y - 3 || y < p.y - 14; if (!(Math.abs(x - p.x) >= 5 || y > p.y - 4) && !(y < p.y - 14 && Math.abs(x - p.x) <= 7)) continue; if (ek > px.thr(x, y)) px.set(x, y, px.ramp(lib.HONEY, clamp(0.5 + 0.25 * (sd * (x - p.x)) / 7 - 0.1 * (p.y - y) / 17, 0, 1), x, y)); }
          lib.elder({ x: p.x, y: p.y - 4, h: 17, k: ek, t, seed: p.i, glow: 0.2 });
        }
      }
      function lightning(t) {
        let f = 0;
        for (const s0 of [54.0, 57.2, 60.6, 62.2]) { const d = t - s0; if (d > 0 && d < 0.5) { f = Math.max(f, Math.exp(-d / 0.09) * (0.6 + 0.4 * Math.sin(d * 60))); if (d < 0.18) { const bx = 40 + px.hash(Math.round(s0 * 7), 1, 8) * 400; let x = bx, y = 0; while (y < 150) { y += 3; x += (px.hash(Math.round(x), y, 5) - 0.5) * 12; px.dpx(Math.round(x), y, hex('#ffffff'), 1); px.dpx(Math.round(x) + 1, y, hex('#e8f0ff'), 0.8); } } } }
        return f;
      }

      return {
        render(t) {
          const U = px.cur();
          if (t < 23.5) {
            const k = doorScene(t);
            px.post({ vignette: 1.0, flash: S(20.5, 23.2, t) * 0.5, flashCol: hex('#fff0c8') });
          } else if (t < 33.0) {
            ascent(t);
            px.post({ vignette: 0.8, flash: S(31.0, 33.0, t) * 0.95, flashCol: hex('#fff6dc') });
          } else {
            const fl = lightning(t), tk = S(32.5, 36.5, t), rb = S(35.5, 40, t), ek = S(41.5, 50.5, t), lk = S(54, 58, t);
            hallBack(t, fl * 0.5);
            /* a floor of crystal, just beginning to ripple at the end */
            lib.sea({ t, y0: 150, cx: 240, glow: 0.4 + 0.5 * tk, ripple: S(64, 68, t), k: S(33.5, 38, t) });
            lib.rainbow({ cx: 240, cy: 118, rx: 130, ry: 100, k: rb, t, th: 7 });
            lib.bigThrone({ cx: 240, by: 152, s: 1.0, k: tk, t, glow: 0.7 + 0.3 * rb });
            elders(t, ek, 1);
            /* seven blazing lamps in front of the throne */
            for (let i = 0; i < 7; i++) { const lk2 = S(54 + i * 0.35, 55.4 + i * 0.35, t); if (lk2 > 0.01) lib.flame({ x: 150 + i * 30, y: 166, k: lk2, pop: Math.exp(-Math.max(0, t - (54 + i * 0.35)) / 0.35) * (t > 54 + i * 0.35 ? 1 : 0), t, seed: 30 + i, s: 1.0, glow: 1 }); }
            /* rumbling: a little shake on the thunder */
            if (fl > 0.2) px.post({ vignette: 1.0, flash: fl * 0.5, flashCol: hex('#e8f0ff') });
            else px.post({ vignette: 1.0, flash: 1 - S(33.0, 35.0, t), flashCol: hex('#fff6dc') });
            lib.motes({ x0: 120, x1: 360, y0: 20, y1: 150, t, k: 0.35 * tk, n: 40, speed: 5, dir: -1 });
            px.post({ vignette: 1.0, fade: S(70.4, 72, t), fadeCol: hex('#04050e') });
          }
          lib.titleCard(t, 'THE OPEN DOOR', 16);
        },
      };
    },

    score(A, from) {
      const D2 = 73.42, D3 = 146.83, A3 = 220, D4 = 293.66, Fs4 = 369.99, A4 = 440, D5 = 587.33, Fs5 = 739.99, A5 = 880, D6 = 1174.66;
      A.drone(0, 23, D2, { gain: 0.06, attack: 1.0, release: 2.5 });
      A.choir(0, 22, [D3, A3], { gain: 0.03, attack: 3.0, release: 2.0, vowel: 0.4 });
      /* v1: a voice like a trumpet */
      A.brass(5.4, 14, D3, { gain: 0.05, attack: 0.8, release: 2.0, sweep: [[5.4, 400], [10, 1600]] });
      A.brass(14, 23, A3, { gain: 0.045, attack: 0.8, release: 2.0, sweep: [[14, 600], [20, 1800]] });
      A.bell(6.0, A4, { gain: 0.05, dur: 5 }); A.bell(10.4, D5, { gain: 0.05, dur: 5 }); A.bell(14.8, Fs5, { gain: 0.05, dur: 5 });
      /* v2: the ascent */
      A.riser(22.2, 32.4, { f0: 160, f1: 3000, gain: 0.06 });
      A.choir(23, 34, [D3, A3, D4, Fs4], { gain: 0.05, attack: 3.0, release: 2.0, vowel: 0.8 });
      A.shimmer(25, D6, { dur: 8, gain: 0.05 });
      /* v3: the Throne theme, first full statement, broad */
      A.boom(32.6, { freq: 44, gain: 0.45, dur: 4 }); A.bell(32.6, D4, { gain: 0.14, dur: 9 }); A.bell(32.65, A5, { gain: 0.07, dur: 7 });
      A.choir(33, 52, [D3, A3, D4, Fs4, A4, D5], { gain: 0.075, attack: 2.4, release: 3.0, vowel: 1.2 });
      A.brass(33.5, 53, D3, { gain: 0.05, attack: 3.0, release: 2.0, sweep: [[33.5, 500], [45, 1800]] });
      A.shimmer(36, A5, { dur: 7, gain: 0.07 });
      /* v4: twenty-four: a soft ripple of bells down the arc */
      for (let i = 0; i < 12; i++) A.bell(42.2 + i * 0.6, [D5, Fs5, A5, D6][i % 4], { gain: 0.04, dur: 4 });
      /* v5: lightning and thunder, seven pulses */
      [54.0, 57.2, 60.6, 62.2].forEach((t, i) => { A.boom(t + 0.2, { freq: 52 - i * 4, gain: 0.5, dur: 3 }); A.noise({ t0: t, t1: t + 1.6, gain: [[t, 0.12], [t + 1.6, 0]], filter: { type: 'lowpass', freq: 700, q: 1 }, wet: 0.5, attack: 0.01, release: 1.0 }); });
      for (let i = 0; i < 7; i++) A.bell(54 + i * 0.35, [D5, Fs5, A5, D6, A5, Fs5, D5][i], { gain: 0.06, dur: 5 });
      A.choir(52, 66, [D3, A3, D4, Fs4, A4], { gain: 0.07, attack: 2.0, release: 3.0, vowel: 1.0 });
      /* the sea of glass: a soft, glassy shimmer */
      A.shimmer(64, D6, { dur: 8, gain: 0.05 });
      A.drone(60, 72, D2, { gain: 0.06, attack: 3.0, release: 3.0 });
    },
  });
})();
