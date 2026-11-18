/* ============================================================================
 *  REVELATION · PIXEL EDITION · Episode 5 · Do Not Be Afraid · Revelation 1:17–20
 *  2D pixel-art cut (480x200). Same verses, cues, timing, score and handoff as the 3D cut.
 *  No faces: the Lord is light, and where His face would be there is only light.
 *
 *  0:00  Episode 4's white-gold light clearing from the frame
 *  0:07  v17 John falls at His feet like a dead man
 *  0:10  the right hand of light laid on him: "Do not be afraid. I am the first and the last"
 *  0:17  v18 the Living One; the keys of Death and of Hades glint
 *  0:25  v19 "Write": John on his feet before the light
 *  0:33  v20 the seven stars in His hand; the seven lampstands
 *  0:41  the stars rise into the night
 *  0:43  the same seven, over the seven cities; the first light brightens (handoff to Ephesus)
 * ========================================================================== */
(function () {
  'use strict';
  const Aura = window.Aura, px = Aura.px, lib = Aura.pxlib;
  const { W, H, clamp, lerp, sstep, hex, mix } = px;
  const S = sstep;

  Aura.define(5, {
    pixel: true,
    duration: 60,
    cues: [
      { ref: '1:17', t0: 5.6, t1: 16.0 },
      { ref: '1:18', t0: 16.6, t1: 24.9 },
      { ref: '1:19', t0: 25.5, t1: 32.3 },
      { ref: '1:20', t0: 32.9, t1: 46.4 },
    ],
    titles: [],

    build(ctx) {
      const U0 = () => px.cur();
      const PX_ = 140, jg = lib.groundY(PX_), FXw = 232, feetY = lib.groundY(FXw) - 3, G = lib.groundY(190);
      const sA = px.surface().u32, TB = new Uint32Array(W * H);
      const ign = (i) => 43.9 + i * 0.4;
      const NAMES = ['EPHESUS', 'SMYRNA', 'PERGAMUM', 'THYATIRA', 'SARDIS', 'PHILADELPHIA', 'LAODICEA'];

      /* camera shots: hard cuts, each a smooth move [cx, height above ground, zoom] */
      const SHOTS = [
        [0, 7.0, [232, 84, 4.0], [205, 44, 1.3]],
        [7.0, 9.6, [196, 40, 1.35], [184, 14, 2.2]],
        [9.6, 12.9, [186, 10, 2.0], [182, 12, 2.6]],
        [12.9, 16.5, [176, 16, 3.2], [178, 14, 3.8]],
        [16.5, 21.8, [196, 40, 1.9], [205, 48, 1.5]],
        [21.8, 25.5, [250, 62, 3.6], [252, 60, 6.0]],
        [25.5, 32.9, [168, 30, 2.4], [190, 40, 2.0]],
        [32.9, 37.8, [212, 68, 5.0], [210, 66, 9.0]],
        [37.8, 41.0, [232, 46, 0.95], [232, 60, 0.8]],
        [41.0, 60.1, [232, 60, 0.8], [232, 260, 0.8]],
      ];
      function cam(t) {
        let s = SHOTS[SHOTS.length - 1];
        for (const q of SHOTS) if (t < q[1]) { s = q; break; }
        const u = S(s[0], s[1], t), A = s[2], B = s[3];
        const z = Math.exp(lerp(Math.log(A[2]), Math.log(B[2]), u));
        return { z, cx: lerp(A[0], B[0], u), cy: G - lerp(A[1], B[1], u) };
      }

      const figX = (t) => FXw - 18 * S(9.5, 12.5, t) * (1 - S(17, 20.6, t));
      const phi = (t) => 1.5 * S(7.4, 9.4, t) * (1 - S(19.2, 24.6, t)) + 0.04 * Math.sin(t * 0.9) * S(9.6, 11, t) * (1 - S(19.2, 24.6, t));

      /* a four-pointed star of light */
      function sparkle(x, y, r, k, col) {
        if (k <= 0.01) return;
        x = Math.round(x); y = Math.round(y);
        lib.halo(x, y, r * 2.2, col, 0.5 * k, 1);
        for (let d = 0; d <= r; d++) { const a = k * Math.pow(1 - d / r, 1.3); px.dpx(x + d, y, hex('#ffffff'), a); px.dpx(x - d, y, hex('#ffffff'), a); px.dpx(x, y + d, hex('#ffffff'), a); px.dpx(x, y - d, hex('#ffffff'), a); }
        px.set(x, y, hex('#ffffff'));
      }
      /* a ribbon of light along a bezier (the hand laid on John) */
      function ribbon(P0, P1, P2, u1, w0, w1) {
        const n = 60;
        for (let i = 0; i <= n * u1; i++) {
          const u = i / n, a = (1 - u) * (1 - u), b = 2 * u * (1 - u), c = u * u;
          const x = a * P0[0] + b * P1[0] + c * P2[0], y = a * P0[1] + b * P1[1] + c * P2[1], r = lerp(w0, w1, u);
          for (let dy = -Math.ceil(r); dy <= Math.ceil(r); dy++) for (let dx = -Math.ceil(r); dx <= Math.ceil(r); dx++) {
            const d = Math.hypot(dx, dy); if (d > r) continue;
            px.set(Math.round(x + dx), Math.round(y + dy), px.ramp(GOLDW_, clamp(0.95 - 0.5 * (d / r) * (d / r) - 0.12 * (dx < 0 ? 0 : 1), 0, 1), Math.round(x + dx), Math.round(y + dy)));
          }
        }
        const x = P2[0], y = P2[1];
        if (u1 > 0.5) { px.disc && px.disc(Math.round(x), Math.round(y), w1 * 1.15, hex('#fff2c8')); lib.halo(x, y, 26 + w1 * 4, hex('#ffd890'), 0.6 * u1, 0.9); }
      }
      const GOLDW_ = [hex('#fffbe8'), hex('#ffeebd'), hex('#ffdc90'), hex('#e8b05a'), hex('#b97a38'), hex('#7a4a28')];

      function johnDraw(M, z, t, wind, dawn) {
        const jx = M.sx(PX_), jy = M.sy(jg) + 3 * z, jh = 46 * z, ph = phi(t);
        if (jx < -120 || jx > W + 200) return;
        const opts = { x: jx, y: jy, h: jh, t, wind, sunX: 240, lit: 1, dawn, ang: 0.55 * (1 - S(5.5, 7, t)), dir: 1 };
        if (ph < 0.02) { lib.johnTurn(Object.assign({ U: U0() }, opts)); return; }
        const main = px.cur(); TB.fill(0); px.target(TB);
        lib.johnTurn(Object.assign({ U: TB }, opts)); px.target(main);
        const cs = Math.cos(ph), sn = Math.sin(ph), R = Math.round(jh * 1.15);
        const U = main;
        for (let y = Math.max(0, Math.round(jy - R)); y <= Math.min(H - 1, Math.round(jy + 4)); y++) for (let x = Math.max(0, Math.round(jx - R)); x <= Math.min(W - 1, Math.round(jx + R)); x++) {
          const dx = x - jx, dy = y - jy, sx = Math.round(jx + dx * cs + dy * sn), sy = Math.round(jy - dx * sn + dy * cs);
          if (sx < 0 || sx >= W || sy < 0 || sy >= H) continue;
          const v = TB[sy * W + sx]; if (v) U[y * W + x] = v;
        }
      }

      function drawVision(t) {
        const U = U0(), c = cam(t), z = c.z, sX = (wx) => 240 + (wx - c.cx) * z, sY = (wy) => 112 + (wy - c.cy) * z;
        const blaze = 1 - S(0.4, 4.2, t), dawn = 0.25, hy = clamp(Math.round(sY(jg - 30)), 34, 192);
        const wind = 0.4 - 0.1 * S(0, 6, t);
        lib.seascape({ U, t, dawn, hy, sunX: 262, rise: -16, camX: -292 + 0.6 * (c.cx - 140), camY: 0, wind, amp: 1, rays: 0, patmosPar: 0.62, patmosScale: 1, cloudOffA: 611, cloudOffB: 461 });
        const veil = S(2.6, 3.9, z);
        if (veil > 0.01) { const vc = hex('#05060f'), vc2 = hex('#0b0e22'); for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (px.thr(x, y) < veil * 0.94) U[y * W + x] = ((x + y) & 1) && veil < 0.97 ? vc2 : vc; }
        const fxw = figX(t), fx = sX(fxw), fyF = sY(feetY), face = 0.3 + 0.7 * (1 - S(1, 4.6, t)) + 0.12 * Math.sin(Math.PI * clamp((t - 12.8) / 3.4));
        const ra = S(10.5, 12.6, t) * (1 - S(17.6, 20.8, t));
        const bright = 0.5 + 0.3 * ra;
        if (z < 4.5) lib.halo(fx, fyF - 50 * z, Math.min(240, 80 * z), hex('#ffd890'), 0.4 * bright, 0.9);
        /* the ring of lampstands (37.8 –) */
        const lampK = S(37.8, 38.2, t), lampPos = [];
        for (let i = 0; i < 7; i++) {
          const a = Math.PI / 7 + i * 2 * Math.PI / 7 + 0.1 * (t - 37), wx = FXw + 62 * Math.cos(a), dep = Math.sin(a);
          lampPos.push({ i, dep, x: sX(wx), y: sY(feetY + 2 + 15 * dep), sc: z * (1 + 0.16 * dep) });
        }
        lampPos.sort((p, q) => p.dep - q.dep);
        const drawStand = (L) => { if (lampK < 0.02 || L.x < -60 || L.x > W + 60) return; const i0 = 38.0 + L.i * 0.4, k = S(i0 - 0.1, i0 + 0.7, t); lib.lampstand({ U, x: Math.round(L.x), y: Math.round(L.y), z: L.sc, lit: 1, pop: Math.exp(-Math.pow((t - i0 - 0.2) / 0.4, 2)), t, seed: L.i, lean: 0, a: k }); if (k > 0.05 && L.sc < 3) lib.halo(L.x, L.y - 30 * L.sc, 20 * L.sc + 6, hex('#ffc060'), 0.28 * k, 0.9); };
        const cm = { z, pX: PX_, pY: G, ox: 240 - PX_ - (c.cx - PX_) * z, oy: 112 - G - (c.cy - G) * z };
        const M = lib.camMap(cm), l = { U, dawn: lerp(dawn, 1, 0.5), sunX: 240, lit: 1 };
        lampPos.filter((p) => p.dep < 0).forEach(drawStand);
        if (z < 3.4) lib.cliffGround(cm, l);
        else { const fy0 = Math.max(0, Math.round(fyF)), fl = hex('#07080f'), fl2 = hex('#0d0f1c'); for (let y = fy0; y < H; y++) for (let x = 0; x < W; x++) U[y * W + x] = (y - fy0) < 2 ? fl2 : ((x + y) & 1) && y - fy0 < 8 ? fl2 : fl; lib.halo(fx, fyF + 3, 70 * Math.min(z, 4), hex('#ffb85a'), 0.35, 0.25); }
        lib.grass(cm, l, 'edge', t, wind);
        if (phi(t) > 0.3) lib.halo(M.sx(PX_ + 24), M.sy(jg) - 6 * z, 46 * z, hex('#ffc070'), 0.3 * (0.4 + ra), 0.5);
        johnDraw(M, z, t, wind, 0.9 - 0.3 * S(0, 7, t) + 0.1 * ra);
        const flown = clamp((t - 40.6) / 0.25, 0, 7);
        lib.sonOfMan({ U, sx: fx, sy: fyF, z, t, form: 1, face, eyes: 1, stars: Math.max(0, 7 - flown) , sword: 1 - S(9.0, 9.5, t), blaze, waves: 0.3, feet: 0.4 });
        /* the right hand, laid on him */
        if (ra > 0.02) {
          const tx = M.sx(PX_ + 36), ty = M.sy(jg) - 4 * z;
          ribbon([fx - 22.8 * z, fyF - 61 * z], [fx - 40 * z, fyF - 14 * z], [tx, ty], ra, 1.7 * z, 2.3 * z);
        }
        /* the keys of Death and of Hades, in His left hand */
        const kk = S(20.4, 21.4, t) * (1 - S(25.2, 26, t));
        if (kk > 0.02) {
          const kx = Math.round(fx + 15.6 * z), ky = Math.round(fyF - 50 * z), gl = Math.exp(-Math.pow((t - 23.05) / 0.22, 2)) + 0.9 * Math.exp(-Math.pow((t - 23.9) / 0.25, 2)) + 0.25 * kk;
          const ring = (cx, cy, r, col) => { for (let a = 0; a < 40; a++) px.dpx(Math.round(cx + Math.cos(a / 40 * 6.283) * r), Math.round(cy + Math.sin(a / 40 * 6.283) * r), col, kk); };
          const gold = hex('#ffd060'), pale = hex('#fff2b8');
          ring(kx, ky + 3 * z * 0.5, 1.6 * z, gold); ring(kx + 3 * z, ky + 5 * z * 0.5, 1.2 * z, gold);
          for (let d = 0; d < 6 * z; d++) { px.dpx(kx, Math.round(ky + 3 * z * 0.5 + 1.6 * z + d), gold, kk); px.dpx(kx + Math.round(3 * z), Math.round(ky + 5 * z * 0.5 + 1.2 * z + d), pale, kk); }
          lib.halo(kx, ky + 10 * z * 0.5, 14 * z * 0.5 + 8, hex('#ffd890'), 0.5 * Math.min(1, gl), 1);
          if (gl > 0.3) sparkle(kx + 2 * z, ky + 4 * z, 5 + 5 * z * 0.3, clamp(gl), hex('#fff0c0'));
        }
        lampPos.filter((p) => p.dep >= 0).forEach(drawStand);
        lib.grass(cm, l, 'front', t, wind);
        /* seven stars of light hover over John's back while the hand is on him */
        const sk = S(12.9, 14.0, t) * (1 - S(16.0, 17.6, t));
        if (sk > 0.02) for (let i = 0; i < 7; i++) { const sx = M.sx(PX_ + 14 + i * 5.5), sy = M.sy(jg) - (10 + 3 * Math.sin(t * 1.3 + i)) * z; sparkle(sx, sy, 3 + z, sk * (0.6 + 0.4 * Math.sin(t * 3 + i * 2)), hex('#e8f0ff')); }
        if (t > 8.0 && t < 20) lib.motes({ t, k: 0.5 * S(10, 12, t) * (1 - S(17, 20, t)), x0: fx - 70 * z, x1: fx + 20 * z, y0: fyF - 60 * z, y1: fyF, n: 50, speed: 14, dir: 1 });
        /* the stars rise out of His hand into the night (41 – 43.4) */
        for (let i = 0; i < 7; i++) {
          const t0 = 40.6 + i * 0.25, u = clamp((t - t0) / 2.8); if (u <= 0) continue;
          const sx0 = fx - 22.8 * z, sy0 = fyF - 61 * z, tx = 240 + (i - 3) * 56, ty = 22 + 12 * Math.abs(i - 3) * 0.5, e = u * u * (3 - 2 * u);
          sparkle(lerp(sx0, tx, e) + 14 * Math.sin(u * 6 + i), lerp(sy0, ty, Math.pow(e, 0.8)), 4 + 3 * e, 1 - S(0.9, 1, u), hex('#f4f8ff'));
        }
        lib.windStreaks(t, wind * 0.5 + 0.05, mix(hex('#9fb4d8'), hex('#ffffff'), 0.3), 10, hy + 40);
      }

      /* the same seven, in the sky: lampstands and stars over the seven cities */
      const rh = (x) => 8 * px.fbm(x * 0.012 + 3, 1.7, 3, 5) + 4 * Math.sin(x * 0.02);
      function drawPano(t) {
        const U = U0(), u = clamp((t - 43.4) / 8.6), e = u * u * (3 - 2 * u), back = S(52, 59, t);
        const sp = lerp(150, 62, e) + (150 - 62) * 0 + lerp(0, 88, back), c0 = lerp(0, 3, e) * (1 - back), hy = Math.round(lerp(142, 156, e));
        lib.seascape({ U, t, dawn: 0.05, hy: hy - 22, sunX: -400, rise: -60, camX: 0, camY: 0, wind: 0.2, amp: 0.5, rays: 0, patmosPar: 0.5, patmosScale: 1, cloudOffA: 311, cloudOffB: 211, stars: 1 });
        const dk = [hex('#080a16'), hex('#0d1022'), hex('#141830'), hex('#1c2142')], xs = [], lit = [];
        for (let i = 0; i < 7; i++) { xs.push(240 + (i - c0) * sp); lit.push(S(ign(i), ign(i) + 0.8, t)); }
        /* land: dim ridges under the lights */
        for (let x = 0; x < W; x++) {
          const top = hy - 22 + 6 + rh(x + (c0 * sp) * 1) * 0.7;
          for (let y = Math.max(0, Math.round(top)); y < H; y++) { const d = (y - top) / 40; U[y * W + x] = px.ramp(dk, clamp(0.15 + d * 0.5, 0, 1), x, y); }
        }
        lib.cities({ xs, hy, lit, t, col: hex('#1a1d36'), rim: hex('#8a7a8a'), hazeCol: hex('#2a2c4c'), sunX: 240, amber: hex('#ffb85a') });
        for (let i = 0; i < 7; i++) {
          const x = Math.round(xs[i]); if (x < -40 || x > W + 40) continue;
          const k = S(ign(i), ign(i) + 0.8, t), pop = Math.exp(-Math.pow((t - ign(i) - 0.25) / 0.45, 2)), first = i === 0 ? S(52.5, 57, t) : 0, dim = i === 0 ? 1 : 1 - 0.35 * back;
          const zl = i === 0 ? 1.25 + 0.5 * first : 1.15;
          const ly = hy - 6;
          /* a shaft of light from lamp to star */
          const topY = ly - 34 * zl, starY = Math.max(10, ly - 100 - 6 * (i % 2));
          const ks = S(ign(i) + 0.3, ign(i) + 1.2, t) * dim;
          for (let y = Math.round(starY); y < topY; y++) for (let dx = -2; dx <= 2; dx++) { const a = ks * 0.2 * (1 - Math.abs(dx) / 3) * (0.5 + 0.5 * (y - starY) / (topY - starY)); px.dpx(x + dx, y, hex('#ffe8a8'), a); }
          lib.lampstand({ U, x, y: ly, z: zl, lit: k * (0.7 + 0.3 * dim), pop: pop + first * 0.6 * (0.5 + 0.5 * Math.sin(t * 3)), t, seed: i + 11, lean: 0, a: Math.min(1, k * 3 + 0.0) });
          if (k > 0.05) lib.halo(x, ly - 30 * zl, (26 + 24 * first) * zl, hex('#ffc060'), (0.3 + 0.4 * first) * k * dim, 0.9);
          sparkle(x, starY, 5 + 3 * pop + 2 * first, ks * (0.8 + 0.2 * Math.sin(t * 2 + i)), hex('#f4f8ff'));
        }
        const f0 = S(52.5, 57, t); if (f0 > 0) lib.halo(xs[0], hy - 40, 70 + 60 * f0, hex('#ffd890'), 0.28 * f0, 0.8);
      }

      const gold = [hex('#fff6d0'), hex('#ffe9a0'), hex('#ffd070'), hex('#f2a444'), hex('#c8702a'), hex('#8a4420')];
      function drawTitle(t) {
        const t0 = 2.2, t1 = 5.5, k = S(t0, t0 + 1.0, t) * (1 - S(t1 - 0.8, t1, t));
        if (k <= 0.01) return;
        const sc = 3, word = 'DO NOT BE AFRAID', tw = px.textWidth(word, sc, 1), x0 = Math.round(240 - tw / 2), y0 = 66, fo = 1 - S(t1 - 0.8, t1, t);
        px.scrim(240, y0 + 16, 224, 40, k * 1.05);
        for (let i = 0; i < word.length; i++) {
          const ka = clamp((t - t0 - 0.1 - i * 0.05) / 0.6, 0, 1) * fo; if (ka <= 0) continue;
          const lx = x0 + i * 6 * sc, ch = word[i];
          px.text(ch, lx + 2, y0 + 2, sc, hex('#1a0c16'), ka);
          const sweep = lerp(-40, 440, S(t0 + 1.1, t0 + 2.6, t));
          px.text(ch, lx, y0, sc, (cc, r, X, Y) => { let col = px.ramp(gold, (r + 1) / (7 * sc), X, Y); const d = (X - Y * 0.7) - sweep; if (d > 0 && d < 8) col = hex(d < 4 ? '#ffffff' : '#fff0c0'); return col; }, ka);
        }
        const sub = 'REVELATION · EPISODE 5', sw = px.textWidth(sub, 2, 1), sx0 = Math.round(240 - sw / 2), sy0 = y0 - 17, ks = S(t0 - 0.1, t0 + 0.8, t) * fo;
        px.text(sub, sx0 + 1, sy0 + 1, 2, hex('#0a0814'), ks); px.text(sub, sx0, sy0, 2, hex('#ffd48a'), ks);
        const rule = Math.round(lerp(0, 150, S(t0 + 0.6, t0 + 2.0, t))); px.hline(240 - rule, 240 + rule, y0 + 7 * sc + 8, mix(hex('#ffd48a'), hex('#0a0814'), 0.15 + (1 - k) * 0.8));
      }

      return {
        render(t) {
          const main = px.cur(), X = S(42.8, 44.0, t);
          if (t >= 44.0) drawPano(t);
          else if (X > 0) {
            px.target(sA); drawVision(t); px.target(main); drawPano(t);
            for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (px.thr(x, y) >= X) main[y * W + x] = sA[y * W + x];
          } else drawVision(t);
          /* the floor drops away: a dark dip as he falls */
          const dip = 0.55 * Math.exp(-Math.pow((t - 9.3) / 0.35, 2));
          const flash = clamp(1 - S(0, 2.2, t));
          px.post({ vignette: 1 + 0.5 * dip, fade: dip, flash, flashCol: hex('#fff0d2') });
          drawTitle(t);
          px.fadeOnly(clamp(S(59.2, 60, t)) * 0);
        },
      };
    },

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
})();
