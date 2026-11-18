/* ============================================================================
 *  REVELATION · PIXEL EDITION · Episode 9 · Thyatira: Eyes Like Fire · Revelation 2:18–23
 *  2D pixel-art cut (480x200). Forge-city: orange light on bronze. No faces: the eyes are light,
 *  and the false prophetess is a silhouette only.
 *
 *  0:00  Episode 8's torch-light from below: embers rise and the furnace of Thyatira roars up
 *  0:05  v18 the Son of God: eyes like a flame of fire; feet like burnished bronze
 *  0:19  v19 love, faith, service, patient endurance: the anvils light one by one, and the last works are more than the first
 *  0:28  v20 the woman Jezebel, a silhouette before the furnace: the servants' lights are drawn away (rack focus, flame and shadow)
 *  0:44  v21 time to repent, given: an ember burns along a bronze bar
 *  0:50  v22 the weight of great oppression; those who turn back are rekindled
 *  1:02  v23 her children turn to ash; the eyes search minds and hearts; to each according to deeds
 *  1:17  the glowing bronze cools to a soft ember (handoff)
 * ========================================================================== */
(function () {
  'use strict';
  const Aura = window.Aura, px = Aura.px, lib = Aura.pxlib;
  const { W, H, clamp, lerp, sstep, hex, mix } = px;
  const S = sstep;

  Aura.define(9, {
    pixel: true,
    duration: 86,
    cues: [
      { ref: '2:18', t0: 5.0, t1: 18.2 },
      { ref: '2:19', t0: 18.8, t1: 27.6 },
      { ref: '2:20', t0: 28.2, t1: 43.0 },
      { ref: '2:21', t0: 43.6, t1: 49.6 },
      { ref: '2:22', t0: 50.2, t1: 61.4 },
      { ref: '2:23', t0: 62.0, t1: 77.2 },
    ],
    titles: [],

    build(ctx) {
      const U0 = () => px.cur();
      const sFG = new Uint32Array(W * H), tmpA = new Uint32Array(W * H), tmpB = new Float32Array(W * H), tmpC = new Uint32Array(W * H);
      const BR = lib.BRONZE;
      const AX = [-170, -110, -60, 60, 110, 170], LIT = AX.map((_, i) => 19.0 + i * 1.4);      /* the anvils, lit one by one (v19) */

      const SHOTS = [
        [0, 5.0, [0, -40, 1.2], [0, -44, 1.4]],
        [5.0, 11.6, [70, -84, 4.2], [70, -84, 5.0]],
        [11.6, 18.6, [70, -8, 4.5], [70, -10, 4.0]],
        [18.6, 28.0, [0, -30, 1.9], [0, -30, 1.6]],
        [28.0, 43.2, [-10, -34, 1.5], [20, -34, 1.5]],
        [43.2, 49.8, [0, -28, 2.3], [0, -28, 2.3]],
        [49.8, 61.8, [0, -40, 1.4], [0, -40, 1.5]],
        [61.8, 77.2, [0, -44, 1.45], [0, -44, 1.45]],
        [77.2, 86.1, [70, -10, 4.0], [70, -6, 5.0]],
      ];
      function cam(t) {
        let s = SHOTS[SHOTS.length - 1];
        for (const q of SHOTS) if (t < q[1]) { s = q; break; }
        const u = S(s[0], s[1], t), A = s[2], B = s[3];
        return { cx: lerp(A[0], B[0], u), cy: lerp(A[1], B[1], u), Z: Math.exp(lerp(Math.log(A[2]), Math.log(B[2]), u)) };
      }
      const heat = (t) => (0.25 + 0.75 * S(0.4, 4.4, t)) * (1 - 0.78 * S(77.4, 85.0, t));
      /* the servants' lights: drawn toward her (v20) and rekindled when they turn back (v22) */
      const pulled = (i, t) => S(31.5 + i * 1.0, 34.9 + i * 1.0, t) * (1 - S(55.5 + i * 0.7, 58.5 + i * 0.7, t));
      const anvilGlow = (i, t) => S(LIT[i], LIT[i] + 0.7, t) * (1 - 0.85 * pulled(i, t)) * (1 - 0.25 * S(43, 50, t) * (1 - S(55, 61, t)));
      const herK = (t) => S(28.4, 30.4, t) * (1 - S(75.4, 77.0, t));

      function sparkle(x, y, r, k, colHex) {
        if (k <= 0.01) return;
        x = Math.round(x); y = Math.round(y);
        lib.halo(x, y, r * 2.2, hex(colHex), 0.5 * k, 1);
        for (let d = 0; d <= r; d++) { const a = k * Math.pow(1 - d / r, 1.3); px.dpx(x + d, y, hex('#ffffff'), a); px.dpx(x - d, y, hex('#ffffff'), a); px.dpx(x, y + d, hex('#ffffff'), a); px.dpx(x, y - d, hex('#ffffff'), a); }
        px.set(x, y, hex('#ffffff'));
      }
      /* eyes like a flame of fire: two slits of burning light, nothing else */
      function eyesLight(x, y, s, k, t) {
        if (k <= 0.01) return;
        lib.halo(x, y, 20 * s, hex('#ff7a1a'), 0.45 * k, 0.8);
        for (const sg of [-1, 1]) {
          const cx = Math.round(x + sg * 7.2 * s), lw = 4.6 * s, lh = 1.5 * s;
          for (let dy = -Math.ceil(lh * 2); dy <= Math.ceil(lh * 2); dy++) for (let dx = -Math.ceil(lw); dx <= Math.ceil(lw); dx++) {
            const d = Math.pow(Math.abs(dx) / lw, 1.6) + Math.pow(Math.abs(dy) / (lh * 1.4), 2); if (d > 1) continue;
            const fl = 0.5 + 0.5 * px.fbm(dx * 0.2 + sg * 3, dy * 0.3 - t * 2.4, 2, 64), v = clamp(1.05 - 0.75 * d + 0.18 * fl, 0, 1);
            if (k > px.thr(cx + dx, Math.round(y) + dy)) px.set(cx + dx, Math.round(y) + dy, px.ramp(BR, v, cx + dx, Math.round(y) + dy));
          }
          lib.halo(cx, y, 8 * s, hex('#ffd070'), 0.5 * k, 0.9);
        }
      }
      function blurRGB(buf, r) {
        if (r < 0.5) return; r = Math.round(r); const n = (2 * r + 1);
        tmpA.set(buf);
        for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { let R = 0, G = 0, B = 0; for (let k = -r; k <= r; k++) { const v = tmpA[y * W + clamp(x + k, 0, W - 1)]; R += v & 255; G += (v >> 8) & 255; B += (v >> 16) & 255; } tmpC[y * W + x] = (255 << 24) | (((B / n) | 0) << 16) | (((G / n) | 0) << 8) | ((R / n) | 0); }
        for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { let R = 0, G = 0, B = 0; for (let k = -r; k <= r; k++) { const v = tmpC[clamp(y + k, 0, H - 1) * W + x]; R += v & 255; G += (v >> 8) & 255; B += (v >> 16) & 255; } buf[y * W + x] = (255 << 24) | (((B / n) | 0) << 16) | (((G / n) | 0) << 8) | ((R / n) | 0); }
      }
      /* a transparent layer (0 = nothing), optionally blurred, composited onto the frame */
      function compositeLayer(main, layer, r) {
        if (r < 0.5) { for (let i = 0; i < W * H; i++) if (layer[i]) main[i] = layer[i]; return; }
        r = Math.round(r); const n = (2 * r + 1) * (2 * r + 1);
        for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
          let c = 0, R = 0, G = 0, B = 0;
          for (let j = -r; j <= r; j++) { const yy = y + j; if (yy < 0 || yy >= H) continue; for (let k = -r; k <= r; k++) { const xx = x + k; if (xx < 0 || xx >= W) continue; const v = layer[yy * W + xx]; if (v) { c++; R += v & 255; G += (v >> 8) & 255; B += (v >> 16) & 255; } } }
          if (c && c / n > px.thr(x, y) * 0.9) main[y * W + x] = (255 << 24) | (((B / c) | 0) << 16) | (((G / c) | 0) << 8) | ((R / c) | 0);
        }
      }


      /* the hem of a dark robe, and two feet like burnished bronze, glowing as they are heated and cooling to ember */
      function bronzeFeet(x, y, Z, heatK, t) {
        const U = U0(), hem = [hex('#020101'), hex('#0a0605'), hex('#1a0e0a'), hex('#3a1a10'), hex('#7a3a14')];
        for (let yy = 0; yy < Math.round(y) - Math.round(2 * Z); yy++) {
          const u = yy / Math.max(1, y), w = Math.round((26 + 6 * (1 - Math.min(1, yy / y))) * Z);
          for (let xx = Math.round(x - w); xx <= Math.round(x + w); xx++) { const f = (xx - (x - w)) / (2 * w); px.set(xx, yy, px.ramp(hem, clamp(0.12 + 0.5 * heatK * Math.exp(-Math.pow((yy - y) / (22 * Z), 2)) * (0.4 + 0.6 * f) + (xx > x + w - 2 ? 0.25 : 0), 0, 1), xx, yy)); }
        }
        for (const sg of [-1, 1]) {
          const cx = Math.round(x + sg * 10 * Z), cy = Math.round(y - 3 * Z), rx = 7.5 * Z, ry = 3.6 * Z;
          for (let dy = -Math.ceil(ry); dy <= Math.ceil(ry); dy++) for (let dx = -Math.ceil(rx); dx <= Math.ceil(rx); dx++) {
            const d = (dx * dx) / (rx * rx) + (dy * dy) / (ry * ry); if (d > 1) continue;
            const v = clamp((0.95 - 0.5 * d - 0.25 * (dy / ry)) * (0.2 + 0.8 * heatK) + 0.04 * Math.sin(dx * 0.7 + t), 0, 1);
            px.set(cx + dx, cy + dy, px.ramp(BR, v, cx + dx, cy + dy));
          }
        }
      }

      /* ---------------------------------------------------------------- the forge-city */
      function drawBG(t) {
        const U = U0(), c = cam(t), Z = c.Z, sX = (wx) => 240 + (wx - c.cx) * Z, sY = (wy) => 112 + (wy - c.cy) * Z, hk = heat(t);
        lib.forge({ U, cx: c.cx, cy: c.cy, Z, t, heat: hk });
        lib.halo(sX(0), sY(-24), 130 * Z, hex('#ff7a1a'), 0.22 * hk, 0.7);
        /* soot and smoke in the vault */
        for (let i = 0; i < 40; i++) { const age = ((t * 0.12 + i / 40) % 1), x = sX(-30 + px.hash(i, 1, 41) * 60 + Math.sin(age * 5 + i) * 10), y = sY(-70 - age * 90); px.dpx(Math.round(x), Math.round(y), hex('#3a2a28'), 0.55 * (1 - age) * hk); }
        /* the anvils and the people at them (v19), who are drawn away in v20 and return in v22 */
        const showWork = t > 18.4;
        if (showWork) AX.forEach((ax, i) => {
          const gl = anvilGlow(i, t), ph = (((t - LIT[i] - 0.2) % 0.9) + 0.9) % 0.9, active = t > LIT[i] + 0.2 && (1 - pulled(i, t)) > 0.5, hit = active && ph < 0.11 ? 1 - ph / 0.11 : 0;
          const X = sX(ax), Y = sY(3 + (i % 2) * 5);
          if (X < -60 || X > W + 60) return;
          lib.anvil({ U, x: X, y: Y, z: Z * 1.0, glow: gl, hit });
          if (active && ph < 0.5) for (let k = 0; k < 9; k++) { const r1 = px.hash(i * 9 + k, Math.floor((t - LIT[i] - 0.2) / 0.9), 21), r2 = px.hash(k, i, 22), age = ph / 0.5; px.dpx(Math.round(X + (r1 * 2 - 1) * 26 * Z * age), Math.round(Y - 12 * Z - 14 * Z * age + 36 * Z * age * age * (0.5 + r2)), mix(hex('#ffe9a0'), hex('#ff6a1a'), age), (1 - age) * 0.95); }
          const wk = S(LIT[i] - 0.4, LIT[i] + 0.5, t);
          lib.robed({ U, x: X + 17 * Z, y: Y + 2, h: 29 * Z, t, a: wk, seed: i + 70, lean: (active ? (ph < 0.2 ? 2.5 : -1.2 * Math.sin(Math.PI * clamp((ph - 0.2) / 0.6))) : 0) });
          /* the servant's own small light, over the head */
          const f = pulled(i, t), lx = lerp(X + 17 * Z, sX(0), f), ly = lerp(Y - 40 * Z, sY(-52), f) - 14 * Z * Math.sin(Math.PI * f) * (i % 2 ? 1 : -0.6);
          if (wk > 0.05) { lib.flame({ x: Math.round(lx), y: Math.round(ly), k: wk * (1 - S(0.92, 1, f) * 0.9), pop: 0, t, seed: 80 + i, s: clamp(0.45 * Z + 0.7, 1, 2.8), glow: 0.8 }); if (f > 0.02 && f < 0.98) for (let q = 1; q < 6; q++) px.dpx(Math.round(lerp(lx, X + 17 * Z, q * 0.07)), Math.round(lerp(ly, Y - 40 * Z, q * 0.07)), hex('#ffc070'), 0.6 * (1 - q / 6)); }
        });
        /* idols, dim, at the edge of the hall (v20: food offered to idols) */
        const ik = S(33, 35, t) * (1 - S(43, 45, t));
        if (ik > 0.02) for (let i = 0; i < 2; i++) lib.idol({ U, x: sX(205 + i * 24), y: sY(3), h: 36 * Z, t, a: ik * 0.8 });
        const dv = S(5.0, 6.0, t) * (1 - S(11.0, 11.6, t));
        if (dv > 0.01) for (let i = 0; i < W * H; i++) { const v = U[i]; U[i] = mix(v, 0xff020101, 0.9 * dv); }
        /* ---- v18: the eyes and the feet (and, at the end, the feet cooling) */
        if (t >= 5 && t < 11.7) { const k = S(5.0, 6.2, t) * (1 - S(11.0, 11.6, t)); eyesLight(sX(70), sY(-84), Z, k, t); }
        if ((t >= 11.5 && t < 18.8) || t >= 77) {
          const kf = t < 18.8 ? S(11.6, 12.8, t) * (1 - S(18.2, 18.7, t)) : 1, feet = t < 18.8 ? 1 : lerp(1, 0.18, S(77.4, 85, t));
          if (kf > 0.01) {
            bronzeFeet(sX(70), sY(0), Z, feet * kf, t);
            lib.halo(sX(70), sY(-4), 36 * Z * (0.4 + 0.6 * feet), hex('#ff8a2a'), 0.55 * feet * kf, 0.4);
          }
          if (t < 18.8) {                                                      /* the bronze is poured */
            const pk = S(12.6, 13.6, t) * (1 - S(17.6, 18.4, t)), px0 = Math.round(sX(30));
            if (pk > 0.02) { for (let y = 0; y < Math.round(sY(0)); y++) for (let dx = -1; dx <= 1; dx++) px.set(px0 + dx, y, px.ramp(BR, 0.82 + 0.15 * Math.sin(y * 0.4 - t * 12) - Math.abs(dx) * 0.2, px0 + dx, y)); lib.halo(px0, sY(-2), 20 * Z, hex('#ffb040'), 0.6 * pk, 0.6); }
          }
          if (t >= 77) for (let i = 0; i < 30; i++) { const r1 = px.hash(i, 1, 55), age = ((t * 0.18 + r1) % 1); px.dpx(Math.round(sX(70) + (px.hash(i, 2, 55) - 0.5) * 60 * Z * 0.6), Math.round(sY(-4) - age * 60 * Z), mix(hex('#ffb040'), hex('#c8401a'), age), 0.7 * (1 - age) * feet); }
        }
        /* ---- v21: the time to repent, an ember burning along a bronze bar */
        if (t >= 43 && t < 50.2) {
          const k = S(43.4, 44.4, t) * (1 - S(49.6, 50.2, t)), x0 = sX(-70), x1 = sX(70), by = Math.round(sY(-22)), u = S(44.2, 49.2, t);
          for (let x = Math.round(x0); x <= Math.round(x1); x++) for (let j = 0; j < Math.max(2, Math.round(3 * Z)); j++) { const f = (x - x0) / (x1 - x0), burnt = f < u, v = burnt ? 0.14 : 0.5 - 0.1 * j; if (k > px.thr(x, by + j)) px.set(x, by + j, px.ramp(BR, v + (Math.abs(f - u) < 0.03 ? 0.4 : 0), x, by + j)); }
          const ex = x0 + (x1 - x0) * u; lib.halo(ex, by, 14 * Z, hex('#ffb040'), 0.7 * k, 0.9); sparkle(ex, by - 2, 5, k * (0.6 + 0.4 * Math.sin(t * 20)), '#fff0c0');
          for (let i = 0; i < 12; i++) px.dpx(Math.round(ex + (px.hash(i, 1, 9) - 0.5) * 10 * Z), Math.round(by - ((t * 20 + i * 7) % 24)), hex('#ff9a3a'), 0.7 * k);
        }
        /* ---- v22: the great oppression: a heavy dark weight from above; it lifts as the servants turn back */
        const wk = S(50.6, 54, t) * (1 - S(58.0, 61, t));
        if (wk > 0.02) for (let y = 0; y < Math.round(100 * wk); y++) for (let x = 0; x < W; x++) if ((1 - y / (100 * wk)) * wk * 1.1 > px.thr(x, y) + 0.05) U[y * W + x] = hex(y & 1 ? '#020101' : '#060302');
        /* ---- v23: Death, a pale mist that passes; the searching eyes; hearts and minds laid bare */
        const mk = S(63.6, 65, t) * (1 - S(67.4, 69, t));
        if (mk > 0.02) { const front = lerp(-300, 320, S(63.6, 68.6, t)); for (let y = Math.max(0, Math.round(sY(-50))); y < Math.min(H, Math.round(sY(14))); y++) for (let x = 0; x < W; x++) { const wx = c.cx + (x - 240) / Z, d = (1 - Math.abs(wx - front) / 110) * Math.max(0, 1 - Math.abs(y - sY(-18)) / (34 * Z)); if (d > 0 && mk * d * (0.5 + 0.5 * px.fbm(x * 0.03 + t, y * 0.08, 2, 33)) > px.thr(x, y) + 0.08) U[y * W + x] = mix(U[y * W + x], hex('#a8b8d0'), 0.5); } }
        const ek = S(66.0, 67.6, t) * (1 - S(75.4, 77.0, t));
        if (ek > 0.01) {
          eyesLight(sX(0), sY(-104), Z * 1.9, ek, t);
          const sweep = lerp(-190, 190, S(68.4, 74.6, t)), bk = S(68.0, 69.0, t) * (1 - S(74.6, 76, t));
          if (bk > 0.02) for (let y = Math.round(sY(-102)); y < Math.round(sY(2)); y++) { const f = (y - sY(-102)) / (sY(2) - sY(-102)), cxm = sX(sweep) * f + sX(0) * (1 - f), hw = 18 * Z * f + 2; for (let x = Math.round(cxm - hw); x <= Math.round(cxm + hw); x++) { const e = 1 - Math.abs(x - cxm) / hw; if (bk * e * 0.32 > px.thr(x, y)) U[y * W + x] = mix(U[y * W + x], hex('#ffc060'), 0.55); } }
          AX.forEach((ax, i) => {
            const tb = Math.abs(((i + 0.5) / AX.length) * 380 - 190 - sweep) < 34 ? 1 : 0, hk2 = S(68.2 + i * 1.0, 69.0 + i * 1.0, t) * (1 - S(75.4, 77, t)), X = sX(ax + 17), Y = sY(3 + (i % 2) * 5);
            if (hk2 > 0.02 && X > -20 && X < W + 20) {
              const beat = Math.pow(Math.max(0, Math.sin(t * 7 + i)), 6);
              lib.halo(X, Y - 18 * Z, (6 + 6 * beat) * Z, hex('#ff6a4a'), 0.75 * hk2, 1); px.set(Math.round(X), Math.round(Y - 18 * Z), hex('#fff0e0'));        /* the heart */
              lib.halo(X, Y - 34 * Z, 7 * Z, hex('#ffe9a0'), 0.6 * hk2, 1); px.set(Math.round(X), Math.round(Y - 34 * Z), hex('#ffffff'));                       /* the mind */
            }
          });
        }
        /* embers rising at the start (the torch-light from below, carried over from Episode 8) */
        if (t < 8) for (let i = 0; i < 60; i++) { const r1 = px.hash(i, 1, 55), age = ((t * 0.28 + r1) % 1), k = (1 - S(5, 8, t)); px.dpx(Math.round(60 + px.hash(i, 2, 55) * 360 + Math.sin(age * 7 + i) * 6), Math.round(H - age * (110 + 90 * px.hash(i, 3, 55))), mix(hex('#ffb040'), hex('#ff4a1a'), age), k * (1 - age) * 0.95); }
      }

      /* the silhouette layer: the false prophetess, and her children, who are lost (v20 – v23) */
      function drawFG(t) {
        const c = cam(t), Z = c.Z, sX = (wx) => 240 + (wx - c.cx) * Z, sY = (wy) => 112 + (wy - c.cy) * Z, hk = herK(t);
        if (hk <= 0.01) return;
        const fall = S(51, 55, t) * (1 - S(57, 61, t));                                  /* bowed under the weight (v22) */
        lib.robed({ U: sFG, x: sX(0), y: sY(2), h: lerp(66, 52, fall) * Z, t, a: hk, seed: 3, lean: -2 * fall, glow: 0 });
        for (let i = 0; i < 5; i++) {
          const gone = S(63.4 + i * 0.5, 65.4 + i * 0.5, t); if (gone >= 1) continue;
          lib.robed({ U: sFG, x: sX(26 + i * 12), y: sY(2 + (i % 2) * 3), h: (20 + (i % 3) * 2) * Z, t, a: hk * (1 - gone), seed: 9 + i, lean: 0 });
        }
      }
      function drawHer(t) {
        const c = cam(t), Z = c.Z, sX = (wx) => 240 + (wx - c.cx) * Z, sY = (wy) => 112 + (wy - c.cy) * Z, hk = herK(t);
        if (hk <= 0.01) return;
        /* her false gilding: a dim ring of light over a dark head; it gutters when she will not repent (v21 – v22) */
        const fall = S(51, 55, t) * (1 - S(57, 61, t)), gx = sX(0), gy = sY(2 - lerp(66, 52, fall) - 7), gl = hk * (0.6 - 0.5 * S(43.6, 49.6, t)) * (1 - 0.9 * fall);
        if (gl > 0.02) { const gr = 7 * Z; lib.halo(gx, gy, gr * 2.4, hex('#ffc060'), 0.35 * gl, 1); for (let k = 0; k < 64; k++) { const an = k / 64 * 6.2832; if (gl * 1.1 > px.thr(k, 7)) px.set(Math.round(gx + Math.cos(an) * gr), Math.round(gy + Math.sin(an) * gr * 0.8), mix(hex('#ffd070'), hex('#fff6d0'), 0.5 + 0.5 * Math.sin(t * 9))); } }
        /* her glitter, drawn out toward the servants (v20) */
        const gk = S(31, 33, t) * (1 - S(42, 43.6, t));
        if (gk > 0.02) for (let i = 0; i < 40; i++) { const dir = (i % 2 ? 1 : -1), age = ((t * 0.3 + i / 40) % 1), x = gx + dir * age * (60 + 120 * px.hash(i, 1, 7)) * Z * 0.5, y = gy + 20 * Z + Math.sin(age * 8 + i) * 8 * Z * 0.4 - age * 10 * Z; px.dpx(Math.round(x), Math.round(y), hex('#ffd890'), gk * 0.8 * (1 - age)); }
        /* the ash of her children (v23) */
        for (let i = 0; i < 5; i++) { const g = S(63.4 + i * 0.5, 65.4 + i * 0.5, t); if (g > 0.02 && g < 1) for (let q = 0; q < 14; q++) { const age = clamp((t - 63.4 - i * 0.5) / 4, 0, 1), x = sX(26 + i * 12) + (px.hash(q, i, 5) - 0.5) * 12 * Z + 6 * age * Z, y = sY(-10 - (q % 3) * 8) - age * 40 * Z; px.dpx(Math.round(x), Math.round(y), mix(hex('#b8a090'), hex('#ff8a3a'), px.hash(q, 2, 5) * 0.5), 0.8 * (1 - age)); } }
      }

      const gold = [hex('#fff6d0'), hex('#ffe9a0'), hex('#ffd070'), hex('#f2a444'), hex('#c8702a'), hex('#8a4420')];
      function drawTitle(t) {
        const t0 = 1.2, t1 = 4.6, k = S(t0, t0 + 1.0, t) * (1 - S(t1 - 0.8, t1, t));
        if (k <= 0.01) return;
        const sc = 3, word = 'EYES LIKE FIRE', tw = px.textWidth(word, sc, 1), x0 = Math.round(240 - tw / 2), y0 = 66, fo = 1 - S(t1 - 0.8, t1, t);
        px.scrim(240, y0 + 16, 224, 40, k * 1.05);
        for (let i = 0; i < word.length; i++) {
          const ka = clamp((t - t0 - 0.1 - i * 0.05) / 0.6, 0, 1) * fo; if (ka <= 0) continue;
          const lx = x0 + i * 6 * sc, ch = word[i];
          px.text(ch, lx + 2, y0 + 2, sc, hex('#0a0408'), ka);
          const sweep = lerp(-40, 440, S(t0 + 1.1, t0 + 2.6, t));
          px.text(ch, lx, y0, sc, (cc, r, X, Y) => { let col = px.ramp(gold, (r + 1) / (7 * sc), X, Y); const d = (X - Y * 0.7) - sweep; if (d > 0 && d < 8) col = hex(d < 4 ? '#ffffff' : '#fff0c0'); return col; }, ka);
        }
        const sub = 'REVELATION · EPISODE 9', sw = px.textWidth(sub, 2, 1), sx0 = Math.round(240 - sw / 2), sy0 = y0 - 17, ks = S(t0 - 0.1, t0 + 0.8, t) * fo;
        px.text(sub, sx0 + 1, sy0 + 1, 2, hex('#0a0408'), ks); px.text(sub, sx0, sy0, 2, hex('#ff9a3a'), ks);
        const rule = Math.round(lerp(0, 150, S(t0 + 0.6, t0 + 2.0, t))); px.hline(240 - rule, 240 + rule, y0 + 7 * sc + 8, mix(hex('#ff9a3a'), hex('#0a0408'), 0.15 + (1 - k) * 0.8));
      }

      return {
        render(t) {
          const main = px.cur();
          drawBG(t);
          /* rack focus: the flame sharp and the shadow soft, then the shadow sharp and the flame soft (v20) */
          const b = S(33.0, 35.5, t), rb = (t >= 28 && t < 43.5) ? 2.4 * b * (1 - S(40, 42.2, t)) : (t > 4.8 && t < 8.2 ? 2.4 * (1 - S(5.4, 8, t)) : 0), rf = (t >= 28 && t < 43.5) ? 2.4 * (1 - b) : 0;
          if (rb > 0.5) blurRGB(main, rb);
          if (herK(t) > 0.01) { sFG.fill(0); px.target(sFG); drawFG(t); px.target(main); compositeLayer(main, sFG, rf); drawHer(t); }
          px.post({ vignette: 1.15, fade: 0, flash: 0 });
          drawTitle(t);
        },
      };
    },

    score(A, from) {
      const D2 = 73.42, D3 = 146.83, A3 = 220, D4 = 293.66, Eb4 = 311.13, F4 = 349.23, G4 = 392, Ab4 = 415.3, A4 = 440, C5 = 523.25, D5 = 587.33, F5 = 698.46, G5 = 783.99, A5 = 880, C6 = 1046.5, D6 = 1174.66, F6 = 1396.9, E6 = 1318.5, Fs4 = 369.99;
      /* continuity: Episode 8's furnace rumble, now roaring up into the forge */
      A.drone(0, 85.6, D2, { gain: 0.11, attack: 0.4, release: 2.4 });
      A.noise({ t0: 0, t1: 6, gain: [[0, 0.07], [3, 0.1], [6, 0.05]], filter: { type: 'lowpass', freq: [[0, 500], [4, 1400], [6, 700]], q: 0.7 }, wet: 0.4, attack: 0.2, release: 0.6 });
      A.noise({ t0: 0, t1: 85, gain: 0.02, filter: { type: 'highpass', freq: 5200, q: 0.4 }, wet: 0.3, attack: 1.0, release: 2.0 });           /* embers crackling */
      A.brass(1.4, 6.4, D3, { gain: 0.07, attack: 2.6, release: 1.2, sweep: [[1.4, 400], [5.5, 1800]] });
      /* v18 (5 - 18): eyes like a flame of fire; feet like burnished bronze */
      A.choir(5, 18.6, [D3, A3, D4, F4, A4], { gain: 0.055, attack: 1.4, release: 2.2, vowel: 0.9 });
      A.boom(5.1, { freq: 44, gain: 0.5, dur: 3.2 });
      A.bell(6.0, E6, { gain: 0.07, dur: 4 }); A.bell(6.1, D6, { gain: 0.05, dur: 4 }); A.shimmer(6.3, A5, { dur: 5, gain: 0.05 });
      A.bell(11.8, D3, { gain: 0.2, dur: 9 }); A.boom(11.8, { freq: 36, gain: 0.55, dur: 3.6 });                                              /* a bronze gong at the feet */
      A.noise({ t0: 12.6, t1: 17.8, gain: [[12.6, 0], [13.6, 0.06], [17.8, 0]], filter: { type: 'bandpass', freq: 1400, q: 0.6 }, wet: 0.4, attack: 0.3, release: 0.8 });  /* the pour */
      /* v19 (18 - 28): the anvils, one by one: the last works more than the first */
      const SC = [D5, F5, G5, A5, C6, D6];
      for (let i = 0; i < 6; i++) { A.bell(19.0 + i * 1.4, SC[i], { gain: 0.09, dur: 3.4 }); A.shimmer(19.05 + i * 1.4, SC[i] / 2, { dur: 2, gain: 0.03 }); }
      for (let i = 0; i < 6; i++) for (let k = 0; k < 14; k++) { const t = 19.2 + i * 1.4 + k * 0.9; if (t < 28 && t < 43) A.noise({ t0: t, t1: t + 0.09, gain: 0.05 * (0.5 + 0.5 * (i / 5)), filter: { type: 'bandpass', freq: 3200 + i * 300, q: 1.2 }, wet: 0.3, attack: 0.002, release: 0.07 }); }
      A.choir(19, 28.4, [D3, A3, D4, Fs4, A4], { gain: 0.06, attack: 1.2, release: 2.0, vowel: 1.0 });
      /* v20 (28 - 43): the woman Jezebel: slinking half-steps, a false sweetness; the servants drawn away */
      A.choir(28.4, 43.8, [D3, A3, D4, Eb4, A4], { gain: 0.05, attack: 1.8, release: 2.2, vowel: 0.8 });
      [[28.8, A4, 1.0, Ab4 * 1.0], [31.2, A4, 1.0, Ab4], [33.6, C5, 1.0, 493.88]].forEach(([t, f, d, f2]) => A.voice({ type: 'triangle', freq: [[t, f], [t + 1.0, f2], [t + 2.0, f]], t0: t, t1: t + 2.4, gain: 0.04, attack: 0.3, release: 0.8, wet: 0.7, filter: { type: 'lowpass', freq: 1400, q: 0.6 } }));
      for (let i = 0; i < 6; i++) A.bell(32.0 + i * 1.0, [G5, A5, C6, A5, G5, F5][i], { gain: 0.035, dur: 2.4 });
      A.voice({ type: 'sawtooth', freq: 55, t0: 33, t1: 43, gain: 0.035, attack: 2.4, release: 1.4, wet: 0.5, filter: { type: 'lowpass', freq: 320, q: 1 } });
      /* v21 (43 - 50): time to repent: a dry, steady tick while an ember burns along the bar */
      for (let t = 44.2; t < 49.4; t += 0.7) A.boom(t, { freq: 190, gain: 0.05, dur: 0.18 });
      A.riser(46.4, 49.4, { f0: 240, f1: 1800, gain: 0.05 });
      A.boom(49.4, { freq: 40, gain: 0.45, dur: 3 });
      /* v22 (50 - 61): the great oppression, then those who turn back are rekindled */
      A.voice({ type: 'sawtooth', freq: 41, t0: 50.6, t1: 58.6, gain: 0.06, attack: 3.0, release: 1.6, wet: 0.5, filter: { type: 'lowpass', freq: [[50.6, 180], [58, 520]], q: 1 } });
      A.boom(54.2, { freq: 34, gain: 0.55, dur: 4 });
      [D5, F5, A5, D6, F6, A5, D6].forEach((f, i) => A.bell(56.0 + i * 0.6, f, { gain: 0.07, dur: 3.6 }));
      A.choir(58.4, 62.6, [D3, A3, D4, Fs4, A4], { gain: 0.06, attack: 1.2, release: 2.2, vowel: 1.0 });
      /* v23 (62 - 77): Death, pale and thin; the searching eyes; hearts beating; to each according to deeds */
      A.voice({ type: 'sine', freq: [[63.8, 880], [64.6, 830], [68.6, 780]], t0: 63.8, t1: 68.8, gain: 0.035, attack: 0.8, release: 1.8, wet: 0.8 });
      A.noise({ t0: 63.6, t1: 69, gain: [[63.6, 0], [66, 0.05], [69, 0]], filter: { type: 'bandpass', freq: [[63.6, 1500], [69, 4200]], q: 0.5 }, wet: 0.6, attack: 0.6, release: 0.8 });
      A.riser(65.4, 67.8, { f0: 300, f1: 5200, gain: 0.09 });
      A.boom(67.9, { freq: 42, gain: 0.55, dur: 3.6 });
      A.bell(68.0, E6, { gain: 0.08, dur: 5 }); A.bell(68.06, D6, { gain: 0.06, dur: 5 });
      for (let k = 0; k < 14; k++) { const t = 68.8 + k * 0.62; if (t < 75.6) { A.boom(t, { freq: 58, gain: 0.16, dur: 0.22 }); A.boom(t + 0.2, { freq: 52, gain: 0.1, dur: 0.2 }); } }
      A.choir(68, 77.6, [D3, A3, D4, F4, A4, D5], { gain: 0.06, attack: 2.0, release: 2.6, vowel: 1.0 });
      A.choir(75, 78, [D3, A3, D4, Fs4, A4, D5], { gain: 0.07, attack: 0.8, release: 2.4, vowel: 1.1 });
      /* handoff (77 - 86): the glowing bronze cools: the gong dies away to a soft ember */
      A.bell(77.4, D3, { gain: 0.15, dur: 8 });
      A.noise({ t0: 77.4, t1: 85.6, gain: [[77.4, 0.05], [82, 0.03], [85.6, 0]], filter: { type: 'lowpass', freq: [[77.4, 900], [85.6, 160]], q: 0.7 }, wet: 0.5, attack: 0.6, release: 1.0 });
      A.choir(78, 85.6, [D3, A3], { gain: 0.045, attack: 1.8, release: 3.0, vowel: 0.7 });
    },
  });
})();
