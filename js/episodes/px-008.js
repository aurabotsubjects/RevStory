/* ============================================================================
 *  REVELATION · PIXEL EDITION · Episode 8 · Pergamum: The Throne of Satan · Revelation 2:12–17
 *  2D pixel-art cut (480x200). Dark crimson, harsh low-key light, tilted angles. No faces.
 *
 *  0:00  Episode 7's stark mountain light darkens into crimson dusk over the acropolis
 *  0:05  v12 the sharp two-edged sword: a blade of light slices across the screen
 *  0:11  v13 you dwell where the throne is: the climb, the tilted throne; Antipas, the faithful witness (a light that rises)
 *  0:31  v14 Balaam: a stumbling block across the path; food offered to idols; a veil drawn across a doorway
 *  0:49  v15 likewise the Nicolaitans: the shadow along the terrace
 *  0:56  v16 repent, or I come quickly: the sword of my mouth cuts the shadow away
 *  1:05  v17 the hidden manna; a white stone with a new name no one can read
 *  1:22  torch-light from below: the furnaces of Thyatira (handoff)
 * ========================================================================== */
(function () {
  'use strict';
  const Aura = window.Aura, px = Aura.px, lib = Aura.pxlib;
  const { W, H, clamp, lerp, sstep, hex, mix } = px;
  const S = sstep;

  Aura.define(8, {
    pixel: true,
    duration: 90,
    cues: [
      { ref: '2:12', t0: 5.0, t1: 11.0 },
      { ref: '2:13', t0: 11.6, t1: 30.8 },
      { ref: '2:14', t0: 31.4, t1: 48.2 },
      { ref: '2:15', t0: 48.8, t1: 55.2 },
      { ref: '2:16', t0: 55.8, t1: 64.6 },
      { ref: '2:17', t0: 65.2, t1: 82.0 },
    ],
    titles: [],

    build(ctx) {
      const U0 = () => px.cur();
      const sA = px.surface().u32, sB = px.surface().u32, sC = px.surface().u32, sD = px.surface().u32;
      const CRIM = lib.CRIM, PH = lib.pergamumHeight;
      const SKY = [hex('#050205'), hex('#12040a'), hex('#2a0812'), hex('#561220'), hex('#8e2428'), hex('#d4522a'), hex('#ffa850'), hex('#ffe0a0')];
      const NIGHT = [hex('#02030a'), hex('#060a18'), hex('#0c1230'), hex('#162048'), hex('#243068')];

      /* camera: hard cuts, each a smooth move [cx, cy, Z], plus a tilt in radians */
      const SHOTS = [
        [3.0, 11.4, [60, -92, 0.9], [100, -98, 1.0], 0.0, 0.0],
        [11.4, 15.5, [20, -30, 1.15], [110, -150, 1.6], 0.06, 0.1],
        [15.5, 21.0, [118, -168, 2.4], [118, -174, 2.8], -0.08, -0.06],
        [21.0, 30.9, [-96, -24, 2.4], [-70, -24, 2.4], 0.0, 0.0],
        [30.9, 38.0, [-70, -24, 1.7], [-24, -24, 1.7], 0.0, 0.0],
        [38.0, 43.0, [28, -24, 2.0], [60, -24, 2.0], 0.0, 0.0],
        [43.0, 48.6, [116, -24, 2.3], [124, -24, 2.3], 0.03, 0.0],
        [48.6, 55.4, [40, -70, 1.1], [100, -72, 1.0], 0.0, 0.03],
        [55.4, 64.8, [100, -100, 1.0], [100, -104, 1.05], 0.0, 0.0],
        [64.8, 72.0, [-8, -42, 2.0], [-8, -44, 2.0], 0.0, 0.0],
        [72.0, 82.0, [0, -52, 2.4], [0, -54, 2.5], 0.0, 0.0],
        [82.0, 90.1, [0, -46, 2.2], [0, 8, 2.2], 0.0, 0.0],
      ];
      function cam(t) {
        let s = SHOTS[SHOTS.length - 1];
        for (const q of SHOTS) if (t < q[1]) { s = q; break; }
        const u = S(s[0], s[1], t), A = s[2], B = s[3];
        return { cx: lerp(A[0], B[0], u), cy: lerp(A[1], B[1], u), Z: Math.exp(lerp(Math.log(A[2]), Math.log(B[2]), u)), roll: lerp(s[4], s[5], u) };
      }
      const nightK = (t) => S(63.5, 72.5, t) * 0.92 + 0.0 * S(82, 90, t);           /* the crimson light gives way to a calm night */
      const litK = (t) => 1 - 0.85 * nightK(t);
      const shadowK = (t) => S(49.2, 51.6, t) * (1 - S(60.0, 60.8, t));              /* the shadow of the Nicolaitans, until the sword */

      function sparkle(x, y, r, k, colHex) {
        if (k <= 0.01) return;
        x = Math.round(x); y = Math.round(y);
        lib.halo(x, y, r * 2.2, hex(colHex), 0.5 * k, 1);
        for (let d = 0; d <= r; d++) { const a = k * Math.pow(1 - d / r, 1.3); px.dpx(x + d, y, hex('#ffffff'), a); px.dpx(x - d, y, hex('#ffffff'), a); px.dpx(x, y + d, hex('#ffffff'), a); px.dpx(x, y - d, hex('#ffffff'), a); }
        px.set(x, y, hex('#ffffff'));
      }

      /* ---------------------------------------------------------------- the world */
      function drawWorld(t) {
        const U = U0(), c = cam(t), Z = c.Z, sX = (wx) => 240 + (wx - c.cx) * Z, sY = (wy) => 112 + (wy - c.cy) * Z, nk = nightK(t), lk = litK(t);
        const yFloor = Math.round(sY(0));
        /* the sky: crimson, with the sun low behind the summit */
        const sunX = sX(100), sunY = sY(-150);
        for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
          const yy = y > yFloor ? yFloor : y, g = Math.exp(-(Math.pow(x - sunX, 2) + Math.pow((y - sunY) * 1.4, 2)) / Math.pow(70 * Z, 2));
          let v = 0.1 + 0.42 * (yy / Math.max(40, yFloor)) + 0.5 * g * lk - 0.14 * px.fbm(x * 0.012 + t * 0.012, y * 0.05, 3, 25);
          let col = px.ramp(SKY, clamp(v * (1 - 0.8 * nk), 0, 1), x, y);
          if (nk > 0.05) { const nv = 0.2 + 0.5 * (yy / Math.max(40, yFloor)) - 0.1 * px.fbm(x * 0.01, y * 0.04, 3, 26); col = mix(col, px.ramp(NIGHT, clamp(nv, 0, 1), x, y), nk); }
          U[y * W + x] = col;
        }
        if (nk > 0.3) for (let i = 0; i < 70; i++) { const x = Math.round(px.hash(i, 1, 99) * W), y = Math.round(px.hash(i, 2, 99) * Math.min(yFloor - 8, 150)); if (Math.sin(t * 2 + i * 3) > -0.4) px.dpx(x, y, hex('#e8f0ff'), nk * (0.5 + 0.5 * px.hash(i, 3, 99))); }
        lib.acropolis({ U, cx: c.cx, cy: c.cy, Z, t, lit: lk });
        if (lk > 0.2) lib.halo(sunX, sunY, 90 * Z, hex('#ff9a3a'), 0.28 * lk, 0.8);
        /* the town floor: dark wet stone */
        for (let y = Math.max(0, yFloor); y < H; y++) for (let x = 0; x < W; x++) {
          const d = (y - yFloor) / Math.max(1, H - yFloor), wx = c.cx + (x - 240) / Z, cb = Math.floor((wx + (Math.floor(d * 8) & 1) * 6 + 1000) / 12);
          let v = 0.26 - 0.2 * d + 0.06 * px.hash(cb, Math.floor(d * 8), 83) + (y - yFloor < 2 ? 0.45 * lk : 0);
          U[y * W + x] = px.ramp(CRIM, clamp(v * (0.4 + 0.6 * lk) + 0.04, 0, 1), x, y);
        }
        const fl = yFloor;
        /* ---- v13 (11 – 21): the throne at the summit, tilted */
        if (t > 11 && t < 22) lib.throne({ U, x: sX(112), y: sY(-PH(112)), z: Z * 0.85, k: S(11.8, 13.2, t) * (1 - S(20.4, 21.0, t)), t });
        if (t > 11.5 && t < 21.5) lib.halo(sX(112), sY(-PH(112) - 24), 60 * Z, hex('#ff6a2a'), 0.35 * S(12, 14, t) * (1 - S(20, 21, t)), 0.8);
        /* ---- v13 (21 – 31): the church's lamp stands; Antipas, the faithful witness, a light that rises */
        if (t > 20.5 && t < 31.5) {
          const kk = S(20.8, 22, t) * (1 - S(30.4, 31.4, t));
          lib.lampstand({ U, x: Math.round(sX(-40)), y: Math.round(sY(0)) + 3, z: Z * 0.95, lit: 1, pop: 0.2 * Math.sin(t * 3), t, seed: 3, lean: 3 * Math.sin(t * 2.2) * Z, a: kk });
          lib.halo(sX(-40), sY(-32), 32 * Z, hex('#ffb060'), 0.3 * kk, 0.9);
          /* the witness: a second lamp, which goes out; its light rises as a star and stays */
          const wk = S(20.8, 22, t), out = S(25.0, 26.4, t), rise = S(26.2, 30.4, t);
          lib.lampstand({ U, x: Math.round(sX(-110)), y: Math.round(sY(0)) + 3, z: Z * 0.95, lit: 1 - out, pop: 0, t, seed: 4, lean: 0, a: wk * (1 - S(27, 28.4, t)) });
          if (out > 0.02) for (let i = 0; i < 26; i++) { const r1 = px.hash(i, 1, 66), ph = clamp(rise * 1.2 - r1 * 0.2, 0, 1), x = sX(-110) + (r1 - 0.5) * 20 * Z * (0.4 + ph), y = sY(-30) - ph * 120 * Z * (0.6 + 0.4 * px.hash(i, 2, 66)); px.dpx(Math.round(x), Math.round(y), hex('#ffe9c0'), out * (1 - ph) * 0.95); }
          sparkle(sX(-110), sY(-30) - rise * 118 * Z, 6 + 3 * rise, S(26.8, 27.8, t), '#fff6d8');
          if (t > 28) sparkle(sX(-110), sY(-30) - 118 * Z, 6, S(28, 29.5, t), '#fff6d8');
        }
        /* ---- v14 (31 – 48): Balaam: a stumbling block laid across the path; idols' food; a veil drawn across a door */
        if (t > 30.5 && t < 48.6) {
          const blockK = S(35.4, 36.4, t) * (1 - S(46, 48, t));
          const bx = sX(-24), by = sY(0);
          for (let i = 0; i < 9; i++) {
            const wx0 = -190 + i * 17 + 14 * (t - 31.0), cap = -50 - i * 0, wx = Math.min(wx0, -52 - i * 7), stumble = S(36.2, 37.4, t) * Math.sin(t * 8 + i) * 0.5;
            lib.robed({ U, x: sX(wx), y: sY(i % 2 ? 6 : 12), h: 12 * Z, t, a: S(30.8, 31.8, t) * (1 - S(46, 48, t)), seed: i + 40, walk: wx0 < -52 - i * 7, lean: 2.2 * (wx0 >= -52 - i * 7 ? stumble * 2 : 0) });
          }
          if (blockK > 0.02) {
            const bw = Math.round(24 * Z), bh = Math.round(13 * Z * blockK), rise = 0;
            for (let j = 0; j < bh; j++) for (let i = 0; i < bw; i++) { const X = Math.round(bx - bw / 2 + i), Y = Math.round(by - j + 2); px.set(X, Y, px.ramp(CRIM, i > bw - 3 ? 0.78 : j > bh - 3 ? 0.7 : 0.1 + 0.08 * (i / bw), X, Y)); }
            lib.halo(bx, by - 8 * Z, 26 * Z, hex('#ff5a2a'), 0.3 * blockK, 0.7);
          }
          /* food sacrificed to idols */
          const ik = S(38.2, 39.6, t) * (1 - S(43.4, 44.6, t));
          if (ik > 0.02) for (let i = 0; i < 3; i++) {
            const wx = 30 + i * 30, ix = sX(wx), iy = sY(4);
            lib.idol({ U, x: ix, y: iy, h: 38 * Z, t, a: ik });
            const bwx = ix + 14 * Z, byy = iy - 2 * Z;
            for (let q = 0; q < Math.max(3, Math.round(5 * Z)); q++) for (let d = -q; d <= q; d++) if (ik > px.thr(Math.round(bwx + d), Math.round(byy + q))) px.set(Math.round(bwx + d), Math.round(byy + q) - Math.round(5 * Z), px.ramp(lib.STONE, 0.35 + 0.1 * q, d, q));
            lib.flame({ x: Math.round(bwx), y: Math.round(byy) - Math.round(6 * Z), k: ik, pop: 0, t, seed: 60 + i, s: clamp(0.5 * Z + 0.6, 1, 3), glow: 0.7 });
            for (let sm = 0; sm < 14; sm++) { const age = ((t * 0.4 + sm / 14 + i * 0.3) % 1); px.dpx(Math.round(bwx + Math.sin(age * 6 + i) * 5 * Z * age), Math.round(byy - 8 * Z - age * 40 * Z), hex('#8a5a5a'), ik * 0.6 * (1 - age)); }
          }
          /* a veil drawn across a doorway */
          const vk = S(43.4, 44.6, t) * (1 - S(47.6, 48.6, t));
          if (vk > 0.02) {
            const dx0 = sX(104), dw = Math.round(32 * Z), dh = Math.round(44 * Z), close = S(44.2, 47.2, t);
            for (let j = 0; j < dh; j++) for (let i = 0; i < dw; i++) {
              const X = Math.round(dx0 - dw / 2 + i), Y = Math.round(sY(0) - j), u = i / dw;
              px.set(X, Y, px.ramp(CRIM, (i < 2 || i > dw - 3 || j > dh - 3) ? 0.7 : 0.03, X, Y));
            }
            const covered = Math.round(dw * close);
            for (let j = 0; j < dh; j++) for (let i = 0; i < covered; i++) {
              const X = Math.round(dx0 - dw / 2 + i), Y = Math.round(sY(0) - j) , wave = Math.sin(i * 0.7 + t * 2 + j * 0.05) * 0.5 + 0.5, fold = Math.sin(i * 1.3) * 0.5 + 0.5;
              if (vk > px.thr(X, Y)) px.set(X, Y, px.ramp(CRIM, 0.42 + 0.22 * fold + 0.12 * wave - 0.1 * j / dh + (i === covered - 1 ? 0.2 : 0), X, Y));
            }
            lib.halo(dx0, sY(-20), 26 * Z, hex('#ff3a2a'), 0.18 * vk, 0.9);
          }
        }
        /* ---- v15 (48 – 56) and v16 (56 – 64): the shadow along the terrace, until the sword of His mouth cuts it away */
        const sk = shadowK(t);
        if (sk > 0.02) {
          const front = lerp(-120, 330, S(49.2, 59.6, t)), dk = hex('#020103');
          for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
            const wx = c.cx + (x - 240) / Z, d = (front - wx) / 80, m = d > 0 ? Math.min(1, d) * (0.6 + 0.4 * px.fbm(x * 0.04 + t * 0.35, y * 0.05, 2, 78)) : 0;
            const band = clamp(1 - Math.abs((y - sY(-48)) / (120 * Z * 0.6)), 0, 1);
            if (m * sk * (0.4 + 0.6 * band) > px.thr(x, y) + 0.05) U[y * W + x] = dk;
          }
        }
        /* ---- v17 (65 – 82): the hidden manna, and the white stone with a new name */
        if (t > 64) {
          const jk = S(64.8, 66.0, t) * (1 - S(78, 80, t)), jx = Math.round(sX(-40)), jy = Math.round(sY(0)) + 2, z = Z;
          if (jk > 0.01) {
            for (let j = 0; j < 22 * z; j++) { const u = j / (22 * z), w = Math.round(z * (u < 0.2 ? 5 + 7 * u * 5 : u < 0.8 ? 12 - 4 * Math.abs(u - 0.5) * 2 : 4 + (1 - u) * 20) * 0.8 + 3); for (let i = -w; i <= w; i++) { const X = jx + i, Y = jy - j; if (jk > px.thr(X, Y)) px.set(X, Y, px.ramp(lib.STONE, i > 0 ? 0.5 + 0.2 * (1 - u) : 0.18, X, Y)); } }
            for (let i = -Math.round(5 * z); i <= Math.round(5 * z); i++) for (let j = 0; j < Math.max(2, Math.round(2.5 * z)); j++) if (jk > px.thr(jx + i, jy - Math.round(22 * z) - j)) px.set(jx + i, jy - Math.round(22 * z) - j, px.ramp(lib.STONE, i > 0 ? 0.7 : 0.3, i, j));   /* its lid: the manna is hidden */
            lib.halo(jx, jy - 24 * z, 18 * z, hex('#fff0c0'), 0.45 * jk * (0.6 + 0.4 * S(65.5, 69, t)), 0.8);
            for (let i = 0; i < 40; i++) { const r1 = px.hash(i, 1, 77), age = ((t * 0.16 + r1) % 1), x = jx + (px.hash(i, 2, 77) - 0.5) * 44 * z * (1 - age * 0.7) + Math.sin(age * 9 + i) * 3 * z, y = sY(-150) + age * (jy - sY(-150) - 22 * z); if (t < 74) { px.dpx(Math.round(x), Math.round(y), hex('#fff6e0'), jk * 0.95 * S(65, 66.5, t) * (1 - S(71.5, 74, t))); px.dpx(Math.round(x) + 1, Math.round(y), hex('#fff6e0'), jk * 0.6 * S(65, 66.5, t) * (1 - S(71.5, 74, t))); } }
          }
          const stk = S(72.4, 75.4, t);
          if (stk > 0.01) lib.whiteStone({ U, x: Math.round(sX(30)), y: Math.round(lerp(sY(-150), sY(-46), S(72.4, 76.4, t))), z: Z * 0.8, k: stk, t });
        }
        /* ---- the handoff (82 – 90): torch-light from below, the furnaces of Thyatira */
        if (t > 81.5) {
          const k = S(82.4, 88, t), bot = H + 20;
          lib.halo(240, bot - 4, 330 * k, hex('#ff6a1a'), 0.75 * k, 0.55);
          lib.halo(240, bot, 160 * k, hex('#ffb040'), 0.7 * k, 0.5);
          for (let i = 0; i < 70; i++) { const r1 = px.hash(i, 1, 55), age = ((t * 0.3 + r1) % 1), x = 120 + px.hash(i, 2, 55) * 240 + Math.sin(age * 7 + i) * 6, y = H - age * (80 + 80 * px.hash(i, 3, 55)); px.dpx(Math.round(x), Math.round(y), mix(hex('#ffb040'), hex('#ff4a1a'), age), k * (1 - age) * 0.95); }
        }
      }

      /* tilt the camera: a nearest-neighbour rotation about the centre of the frame */
      function rollInto(dst, src, ang) {
        if (Math.abs(ang) < 0.002) { dst.set(src); return; }
        const cs = Math.cos(ang), sn = Math.sin(ang), cx = 240, cy = 100;
        for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
          const dx = x - cx, dy = y - cy, sx = Math.round(cx + dx * cs + dy * sn), sy = Math.round(cy - dx * sn + dy * cs);
          dst[y * W + x] = src[clamp(sy, 0, H - 1) * W + clamp(sx, 0, W - 1)];
        }
      }

      /* the sword of light: a slash that splits the picture for a moment. o: point (px,py), angle, u 0..1 progress, width */
      function slash(main, tmp, o) {
        const u = o.u; if (u <= 0 || u >= 1) return;
        tmp.set(main);
        const cs = Math.cos(o.ang), sn = Math.sin(o.ang), nx = -sn, ny = cs, len = lerp(0, 700, S(0, 0.28, u)), gap = Math.sin(Math.PI * clamp((u - 0.12) / 0.7, 0, 1)) * 5, wd = 1.5 + 4 * Math.sin(Math.PI * clamp(u * 1.3, 0, 1)), fade = 1 - S(0.7, 1, u);
        const ox = Math.round(nx * gap), oy = Math.round(ny * gap);
        for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
          const dx = x - o.px, dy = y - o.py, along = dx * cs + dy * sn + 350, d = dx * nx + dy * ny;
          if (along > len || along < 0) continue;
          if (d > wd + gap) { const sx = clamp(x - ox, 0, W - 1), sy = clamp(y - oy, 0, H - 1); main[y * W + x] = tmp[sy * W + sx]; }
          else if (d > -wd) {
            const e = Math.abs(d - (gap * 0.5)) / (wd + gap * 0.5);
            const a = fade * (e < 0.45 ? 1 : 0.8), col = e < 0.3 ? hex('#ffffff') : e < 0.6 ? hex('#fff0c8') : hex('#ffb060');
            if (a > px.thr(x, y)) main[y * W + x] = col;
          }
        }
        /* the two edges of the blade glow along the cut */
        if (u > 0.05 && u < 0.9) for (let k = 0; k < 160; k++) { const along = (k / 160) * len - 350, x = Math.round(o.px + cs * along + nx * (wd + gap)), y = Math.round(o.py + sn * along + ny * (wd + gap)); px.dpx(x, y, hex('#fff6d8'), fade); const x2 = Math.round(o.px + cs * along - nx * wd), y2 = Math.round(o.py + sn * along - ny * wd); px.dpx(x2, y2, hex('#ffd890'), fade); }
      }

      /* ---------------------------------------------------------------- continuity: Episode 7's stark mountain light */
      function drawStark(t) {
        const U = U0(), stark = [hex('#2a2e3e'), hex('#565c74'), hex('#8a90a8'), hex('#c0c6d8'), hex('#eef2fa'), hex('#ffffff')], k = S(1.2, 3.8, t);
        for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
          const v = 0.25 + 0.55 * Math.pow(1 - y / H, 0.8) + 0.3 * Math.exp(-(Math.pow(x - 90, 2) + Math.pow(y - 36, 2)) / 5200) + 0.04 * px.fbm(x * 0.02, y * 0.03, 2, 9);
          let col = px.ramp(stark, clamp(v, 0, 1), x, y);
          const cr = px.ramp(SKY, clamp(0.1 + 0.42 * (y / 110) + 0.5 * Math.exp(-(Math.pow(x - 300, 2) + Math.pow((y - 60) * 1.4, 2)) / 9000), 0, 1), x, y);
          U[y * W + x] = k > px.thr(x, y) ? cr : col;
        }
        for (let x = 0; x < W; x++) {
          const ridge = 120 - 62 * Math.pow(px.fbm(x * 0.012 + 2, 3.3, 4, 13), 1.2) - 26 * Math.exp(-Math.pow((x - 330) / 70, 2)) + 3 * Math.sin(x * 0.2), r2 = 138 - 26 * px.fbm(x * 0.02 + 7, 1.1, 3, 17);
          for (let y = Math.max(0, Math.round(ridge)); y < H; y++) { const d = (y - ridge) / 60; U[y * W + x] = y < r2 ? px.ramp([hex('#0a0c18'), hex('#1c2034'), hex('#363c58'), hex('#6a7090')], clamp(0.7 - 0.4 * d, 0, 1), x, y) : px.ramp([hex('#04050c'), hex('#0a0c18'), hex('#14172a')], clamp(0.3 + d * 0.2, 0, 1), x, y); }
        }
      }

      const gold = [hex('#fff6d0'), hex('#ffe9a0'), hex('#ffd070'), hex('#f2a444'), hex('#c8702a'), hex('#8a4420')];
      function drawTitle(t) {
        const t0 = 1.0, t1 = 4.6, k = S(t0, t0 + 1.0, t) * (1 - S(t1 - 0.8, t1, t));
        if (k <= 0.01) return;
        const sc = 3, word = 'THE THRONE OF SATAN', tw = px.textWidth(word, sc, 1), x0 = Math.round(240 - tw / 2), y0 = 66, fo = 1 - S(t1 - 0.8, t1, t);
        px.scrim(240, y0 + 16, 232, 40, k * 1.05);
        for (let i = 0; i < word.length; i++) {
          const ka = clamp((t - t0 - 0.1 - i * 0.05) / 0.6, 0, 1) * fo; if (ka <= 0) continue;
          const lx = x0 + i * 6 * sc, ch = word[i];
          px.text(ch, lx + 2, y0 + 2, sc, hex('#0a0408'), ka);
          const sweep = lerp(-40, 440, S(t0 + 1.1, t0 + 2.6, t));
          px.text(ch, lx, y0, sc, (cc, r, X, Y) => { let col = px.ramp(gold, (r + 1) / (7 * sc), X, Y); const d = (X - Y * 0.7) - sweep; if (d > 0 && d < 8) col = hex(d < 4 ? '#ffffff' : '#fff0c0'); return col; }, ka);
        }
        const sub = 'REVELATION · EPISODE 8', sw = px.textWidth(sub, 2, 1), sx0 = Math.round(240 - sw / 2), sy0 = y0 - 17, ks = S(t0 - 0.1, t0 + 0.8, t) * fo;
        px.text(sub, sx0 + 1, sy0 + 1, 2, hex('#0a0408'), ks); px.text(sub, sx0, sy0, 2, hex('#e0602a'), ks);
        const rule = Math.round(lerp(0, 150, S(t0 + 0.6, t0 + 2.0, t))); px.hline(240 - rule, 240 + rule, y0 + 7 * sc + 8, mix(hex('#e0602a'), hex('#0a0408'), 0.15 + (1 - k) * 0.8));
      }

      return {
        render(t) {
          const main = px.cur();
          if (t < 3.0) drawStark(t);
          else if (t < 4.2) { px.target(sA); drawStark(t); px.target(sB); drawWorld(t); px.target(main); main.set(sB); const X = S(3.0, 4.2, t); for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (px.thr(x, y) >= X) main[y * W + x] = sA[y * W + x]; }
          else {
            const ang = cam(t).roll;
            if (Math.abs(ang) > 0.002) { px.target(sB); drawWorld(t); px.target(main); rollInto(main, sB, ang); } else drawWorld(t);
          }
          /* the sword of His mouth, v12 (7.0) and v16 (60.2) */
          slash(main, sC, { px: 250, py: 96, ang: 0.42, u: clamp((t - 7.0) / 2.1, -1, 2) });
          slash(main, sC, { px: 230, py: 104, ang: -0.5, u: clamp((t - 60.2) / 2.1, -1, 2) });
          const shake = (t > 60.4 && t < 61.4) ? Math.round(Math.sin(t * 90) * 2 * (1 - (t - 60.4))) : 0;
          if (shake) { sD.set(main); for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) main[y * W + x] = sD[y * W + clamp(x + shake, 0, W - 1)]; }
          px.post({ vignette: 1.15 - 0.3 * nightK(t), fade: 0, flash: 0.55 * Math.exp(-Math.pow((t - 7.35) / 0.12, 2)) + 0.55 * Math.exp(-Math.pow((t - 60.55) / 0.12, 2)), flashCol: hex('#fff2d8') });
          drawTitle(t);
          px.fadeOnly(S(89.4, 90, t) * 0);
        },
      };
    },

    score(A, from) {
      const D2 = 73.42, D3 = 146.83, A3 = 220, D4 = 293.66, Eb4 = 311.13, Fs4 = 369.99, A4 = 440, D5 = 587.33, E5 = 659.25, Fs5 = 739.99, A5 = 880, B5 = 987.77, D6 = 1174.66, E6 = 1318.5, Fs6 = 1479.98, A6 = 1760;
      /* continuity: the bare fifth from Episode 7 darkens into a harsh, low drone */
      A.drone(0, 89.6, D2, { gain: 0.11, attack: 0.4, release: 2.0 });
      A.choir(0, 5, [A3, 329.63], { gain: 0.05, attack: 0.8, release: 1.8, vowel: 0.7 });
      A.wind(0, 12, { gain: 0.07, bright: 1.0, attack: 0.8 });
      A.brass(2.6, 7.0, D3, { gain: 0.07, attack: 2.2, release: 0.5, sweep: [[2.6, 400], [7, 1600]] });
      /* v12 (5 - 11): the sharp two-edged sword: a hard stab as the blade slices across the screen */
      A.riser(5.4, 7.0, { f0: 300, f1: 7000, gain: 0.14 });
      A.boom(7.05, { freq: 44, gain: 0.65, dur: 3.4 });
      A.noise({ t0: 7.0, t1: 8.6, gain: [[7.0, 0.2], [8.6, 0]], filter: { type: 'bandpass', freq: [[7.0, 5200], [8.6, 900]], q: 0.9 }, wet: 0.4, attack: 0.01, release: 0.6 });
      A.bell(7.1, D6, { gain: 0.1, dur: 4 }); A.bell(7.14, Eb4 * 4, { gain: 0.06, dur: 4 });
      A.choir(7.2, 12, [D3, A3, D4, Eb4, A4], { gain: 0.06, attack: 0.4, release: 2.2, vowel: 0.8 });
      /* v13 (11 - 31): the climb to the throne: menace; then Antipas, a faithful witness */
      A.voice({ type: 'sawtooth', freq: 55, t0: 11.6, t1: 21, gain: 0.05, attack: 2.4, release: 1.4, wet: 0.5, filter: { type: 'lowpass', freq: [[11.6, 260], [21, 900]], q: 1 } });
      for (let t = 12; t < 21; t += 1.5) A.boom(t, { freq: 49, gain: 0.14, dur: 1.0 });
      A.boom(15.6, { freq: 36, gain: 0.5, dur: 3.2 });
      A.choir(21, 31.4, [D3, A3, D4, Fs4, A4], { gain: 0.055, attack: 1.4, release: 2.2, vowel: 0.9 });
      A.bell(22.2, A5, { gain: 0.06, dur: 4 });
      A.voice({ type: 'sine', freq: [[25.0, 440], [26.6, 196]], t0: 25.0, t1: 26.8, gain: 0.06, attack: 0.1, release: 0.6, wet: 0.7 });
      A.riser(26.2, 28.2, { f0: 300, f1: 3600, gain: 0.07 });
      [D5, Fs5, A5, D6, Fs6].forEach((f, i) => A.bell(27.4 + i * 0.45, f, { gain: 0.07, dur: 4 }));
      A.shimmer(28.0, A5, { dur: 4, gain: 0.05 });
      /* v14 (31 - 48): Balaam: a stumbling block, idols, a veil; unsettled */
      A.choir(31.4, 48.6, [D3, A3, D4, Eb4, A4], { gain: 0.05, attack: 1.6, release: 2.4, vowel: 0.8 });
      A.boom(35.6, { freq: 38, gain: 0.55, dur: 3 });
      [36.2, 37.0, 37.8].forEach((t, i) => A.voice({ type: 'sine', freq: [[t, 392 - i * 20], [t + 0.5, 300 - i * 20]], t0: t, t1: t + 0.6, gain: 0.04, attack: 0.02, release: 0.4, wet: 0.6 }));
      for (let t = 38.4; t < 43.4; t += 1.0) A.boom(t, { freq: 62, gain: 0.1, dur: 0.7 });
      A.noise({ t0: 43.4, t1: 47.6, gain: [[43.4, 0], [45.4, 0.05], [47.6, 0]], filter: { type: 'bandpass', freq: [[43.4, 600], [47.6, 1800]], q: 0.6 }, wet: 0.5, attack: 0.3, release: 0.6 });
      /* v15 (48 - 55): likewise the Nicolaitans: the shadow */
      A.voice({ type: 'sawtooth', freq: 49, t0: 48.8, t1: 59.6, gain: 0.05, attack: 2.4, release: 1.0, wet: 0.5, filter: { type: 'lowpass', freq: [[48.8, 250], [59.6, 800]], q: 1 } });
      A.noise({ t0: 49.2, t1: 59.8, gain: [[49.2, 0], [55, 0.07], [59.8, 0]], filter: { type: 'lowpass', freq: [[49.2, 300], [59.8, 1100]], q: 0.8 }, wet: 0.4, attack: 0.6, release: 0.4 });
      /* v16 (56 - 64): repent, or I come quickly: the sword of my mouth cuts the shadow away */
      A.riser(58.4, 60.3, { f0: 260, f1: 7000, gain: 0.14 });
      A.boom(60.4, { freq: 40, gain: 0.7, dur: 3.6 });
      A.noise({ t0: 60.3, t1: 61.9, gain: [[60.3, 0.2], [61.9, 0]], filter: { type: 'bandpass', freq: [[60.3, 5200], [61.9, 800]], q: 0.9 }, wet: 0.4, attack: 0.01, release: 0.6 });
      A.bell(60.5, D6, { gain: 0.1, dur: 4 });
      A.choir(60.5, 66, [D3, A3, D4, Fs4, A4, D5], { gain: 0.07, attack: 0.5, release: 2.6, vowel: 1.1 });
      /* v17 (65 - 82): hidden manna; the white stone: a calm, bright, major hush */
      A.choir(65.2, 82, [D3, A3, D4, Fs4, A4, E5], { gain: 0.06, attack: 2.4, release: 3.0, vowel: 1.2 });
      for (let i = 0; i < 12; i++) A.bell(66.0 + i * 0.7, [D6, E6, Fs6, A6][i % 4], { gain: 0.04, dur: 3.2 });
      A.riser(70.8, 72.6, { f0: 400, f1: 5000, gain: 0.07 });
      A.bell(72.8, A5, { gain: 0.09, dur: 5 }); A.shimmer(73.0, D6, { dur: 6, gain: 0.06 });
      A.bell(76.2, D6, { gain: 0.09, dur: 5 }); A.shimmer(76.3, A5, { dur: 6, gain: 0.05 });
      A.bell(79.4, Fs6, { gain: 0.07, dur: 4 });
      /* handoff (82 - 90): torch-light from below: a low furnace rumble and rising embers */
      A.noise({ t0: 82.0, t1: 89.6, gain: [[82, 0], [86, 0.09], [89.6, 0.04]], filter: { type: 'lowpass', freq: [[82, 180], [89.6, 700]], q: 0.7 }, wet: 0.4, attack: 1.2, release: 1.0 });
      A.boom(84.4, { freq: 36, gain: 0.35, dur: 4 });
      A.brass(84, 89.6, D3, { gain: 0.06, attack: 2.4, release: 1.4, sweep: [[84, 400], [89.6, 1200]] });
      A.noise({ t0: 83.0, t1: 89.6, gain: 0.03, filter: { type: 'highpass', freq: 4200, q: 0.4 }, wet: 0.3, attack: 0.8, release: 0.8 });
    },
  });
})();
