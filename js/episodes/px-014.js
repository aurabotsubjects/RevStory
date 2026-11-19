/* ============================================================================
 *  REVELATION · PIXEL EDITION · Episode 14 · Laodicea: Neither Hot nor Cold · Revelation 3:14–19
 *  2D pixel-art cut (480x200). Opens in the lukewarm haze where Episode 13 ended. A wealthy, polished, tepid city.
 *  One steady beam of light stands over it (the faithful witness); a spark at its top is the beginning of creation.
 *  A hot stream and a cold stream run to one pool and become the same grey-green water; a blast from above
 *  empties it. A figure in a gold robe says she is rich; the gold dulls, the robe drains, a haze closes her sight.
 *  Gold refined in a furnace; a white cloth unfurls; a drop of light on the eyes clears the haze and colour
 *  returns. A steady warm sun and a step toward it. Then the light dims to a dark door: a knock is heard. No faces.
 *
 *  0:00  lukewarm haze, title
 *  0:05  v14  the steady beam; the beginning
 *  0:12  v15  hot and cold, and a tepid pool between
 *  0:19  v16  the water is spat out
 *  0:25  v17  rich and in need of nothing... wretched, poor, blind
 *  0:34  v18  gold refined in fire; white garments; eye salve; colour returns
 *  0:48  v19  steady warm love, a step toward the light
 *  0:54  the light dims to a door in the dark; a knock (Episode 15)
 * ========================================================================== */
(function () {
  'use strict';
  const Aura = window.Aura, px = Aura.px, lib = Aura.pxlib;
  const { W, H, clamp, lerp, sstep, hex, hexes, mix } = px;
  const S = sstep;

  Aura.define(14, {
    pixel: true,
    duration: 64,
    cues: [
      { ref: '3:14', t0: 5.0, t1: 12.0 },
      { ref: '3:15', t0: 12.8, t1: 18.2 },
      { ref: '3:16', t0: 19.0, t1: 24.6 },
      { ref: '3:17', t0: 25.4, t1: 33.8 },
      { ref: '3:18', t0: 34.6, t1: 47.8 },
      { ref: '3:19', t0: 48.6, t1: 53.4 },
    ],
    titles: [],

    build(ctx) {
      const SKYT = hexes(['#35322a', '#4a463a', '#625c4a', '#7a7458', '#938b6c', '#aaa282', '#c2b992']);
      const SKYV = hexes(['#2a3258', '#40507a', '#6a80a0', '#a8b0b0', '#e8c890', '#ffd898', '#fff4c8']);
      const GRDT = hexes(['#1c1a16', '#2c2a22', '#423e30', '#5c5642', '#756e56', '#8e8668']);
      const GRDV = hexes(['#1a1410', '#2e2216', '#4a3820', '#6e5a2a', '#98803a', '#c8a850']);
      const STNT = hexes(['#3a362c', '#58513f', '#7a7258', '#9c9372', '#bcb28e', '#dcd2ac']);
      const STNV = hexes(['#4a3c3c', '#7a6458', '#a88a70', '#d0b090', '#f0d8b0', '#fff4dc']);
      const HOT = hexes(['#4a1a0e', '#8a2a12', '#c8501c', '#f08a3a', '#ffc070', '#ffe8b0']);
      const COLD = hexes(['#1a3a5a', '#2a5a8a', '#4a8ab8', '#8ac4e0', '#e0f4ff', '#ffffff']);
      const POOL = hexes(['#323830', '#485046', '#5e6858', '#788272', '#8e9886', '#a4ae9a']);
      const GOLDR = hexes(['#3a2410', '#7a4a1a', '#b8802a', '#e8b04a', '#ffd987', '#fff3c8']);
      const GREYR = hexes(['#222018', '#3a362c', '#58513f', '#7a7258', '#9c9372', '#bcb28e']);
      const WHITER = hexes(['#6a6e84', '#8a90a8', '#b0b6cc', '#d8dcec', '#f4f6ff', '#ffffff']);

      const colK = (t) => S(44.2, 48.5, t);
      const P = (a, b, v, x, y, k) => { const c = px.ramp(a, clamp(v, 0, 1), x, y); return k > 0.01 ? mix(c, px.ramp(b, clamp(v, 0, 1), x, y), k) : c; };
      const BLD = []; for (let i = 0; i < 24; i++) BLD.push({ x: 138 + i * 12.5 + 5 * px.hash(i, 1, 70), w: 9 + 12 * px.hash(i, 2, 70), h: 12 + 26 * px.hash(i, 3, 70), i });
      const PLAT = 108, POOLX = 240, POOLY = 172;
      const streamY = (u) => 136 + 32 * Math.pow(u, 1.25);
      const goldK = (t) => S(25.4, 27, t) * (1 - S(29.5, 32.5, t));

      function ring(cx, cy, r, ry, col, k) {
        if (k <= 0.01) return;
        const N = Math.max(60, Math.round(r * 5));
        for (let i = 0; i < N; i++) { const a = i / N * 6.2832; px.dpx(Math.round(cx + Math.cos(a) * r), Math.round(cy + Math.sin(a) * ry), col, k); }
      }
      function fig(x, y, h, ramp, a, t, lean) {
        if (a <= 0.01) return;
        const head = Math.max(2, Math.round(h * 0.1));
        for (let r = 0; r <= h; r++) {
          const f = r / h, hw = f < 0.13 ? head : f < 0.17 ? head * 0.55 : f < 0.32 ? h * 0.2 : lerp(h * 0.2, h * 0.3, S(0.32, 1, f)), yy = Math.round(y - h + r);
          for (let dx = -Math.ceil(hw); dx <= Math.ceil(hw); dx++) {
            if (Math.abs(dx) > hw) continue;
            const u = dx / Math.max(1, hw), X = Math.round(x + dx + lean * (1 - f) * (1 - f) * 3);
            if (a > px.thr(X, yy)) px.set(X, yy, px.ramp(ramp, clamp(0.5 - 0.3 * u + 0.12 * (1 - f) + (Math.abs(u) > 0.86 ? 0.14 : 0) + (f > 0.45 && f < 0.5 ? -0.1 : 0), 0, 1), X, yy));
          }
        }
        for (let dy = -head; dy <= head; dy++) for (let dx = -head; dx <= head; dx++) if (dx * dx + dy * dy <= head * head) { const X = Math.round(x + lean * 3) + dx, Y = Math.round(y - h - head * 0.4) + dy; if (a > px.thr(X, Y)) px.set(X, Y, px.ramp(ramp, clamp(0.62 - 0.25 * dx / head, 0, 1), X, Y)); }
      }

      function x0w(y) { return y * 0.7; }
      function world(t, ck) {
        const U = px.cur(), steady = S(5.2, 6.6, t) * (1 - S(17, 19.5, t));
        /* sky */
        for (let y = 0; y < PLAT + 2; y++) for (let x = 0; x < W; x++) {
          let v = 0.3 + 0.38 * S(0, PLAT, y) + 0.08 * (px.fbm(x * 0.012 + t * 0.01, y * 0.04, 3, 11) - 0.5);
          v += 0.35 * ck * Math.exp(-(Math.pow((x - 40) / 170, 2) + Math.pow((y - 100) / 70, 2))) * S(47, 50, t);
          U[y * W + x] = P(SKYT, SKYV, v, x, y, ck);
        }
        /* the plateau and the valley floor */
        for (let y = PLAT; y < H; y++) for (let x = 0; x < W; x++) {
          const v = 0.34 + 0.12 * px.fbm(x * 0.03, y * 0.05, 3, 17) - 0.0012 * (y - PLAT) + (y < PLAT + 2 ? 0.14 : 0);
          U[y * W + x] = P(GRDT, GRDV, v + 0.1 * ck * S(47, 50, t) * Math.exp(-Math.pow((x - 40) / 200, 2)), x, y, ck);
        }
        for (const ty of [PLAT + 16, PLAT + 36, PLAT + 60]) for (let x = 0; x < W; x++) if (((x >> 4) & 3) !== 1) U[ty * W + x] = P(GRDT, GRDV, 0.5 - 0.0012 * (ty - PLAT), x, ty, ck);
        /* the theatre: a half-bowl of seats */
        for (let r = 14; r < 36; r += 3) for (let a = 0; a <= 180; a += 2) { const an = a * Math.PI / 180, x = Math.round(262 + Math.cos(an) * r * 1.7), y = Math.round(PLAT - 1 - Math.sin(an) * r * 0.62); U[y * W + x] = P(STNT, STNV, 0.42 + 0.14 * ((r / 3) & 1) + 0.12 * (a / 180) , x, y, ck); }
        /* the city: pale stone, gold roofs; polished, and dull */
        for (const b of BLD) {
          const x0 = Math.round(b.x), x1 = Math.round(b.x + b.w), top = Math.round(PLAT - b.h);
          for (let y = top; y < PLAT; y++) for (let x = x0; x <= x1; x++) {
            const f = (x - x0) / Math.max(1, x1 - x0), col = ((x - x0) % 4) === 0 ? -0.08 : 0, cap = y < top + 2;
            U[y * W + x] = cap ? P(GOLDR, GOLDR, 0.48 + 0.2 * f, x, y, 0) : P(STNT, STNV, 0.56 + 0.2 * f + col + 0.05 * px.hash(b.i, y >> 2, 3), x, y, ck);
          }
          /* windows, and a dome or a pediment on some */
          for (let wy = top + 5; wy < PLAT - 3; wy += 5) for (let wx = x0 + 2; wx < x1 - 1; wx += 4) { U[wy * W + wx] = P(STNT, STNV, 0.26, wx, wy, ck); U[(wy + 1) * W + wx] = P(STNT, STNV, 0.3, wx, wy + 1, ck); }
          if (b.i % 3 === 0) { const rr = Math.max(3, Math.round(b.w * 0.5)), cxx = Math.round((x0 + x1) / 2); for (let dy = 0; dy < rr; dy++) { const hw = Math.round(Math.sqrt(rr * rr - dy * dy)); for (let dx = -hw; dx <= hw; dx++) { const X = cxx + dx, Y = top - dy - 1; if (Y >= 0) U[Y * W + X] = P(GOLDR, GOLDR, 0.45 + 0.25 * (1 - dy / rr) - 0.1 * dx / hw, X, Y, 0); } } }
          else if (b.i % 3 === 1) { const cxx = Math.round((x0 + x1) / 2), hw = Math.round(b.w / 2); for (let dy = 0; dy < 5; dy++) for (let dx = -hw + dy; dx <= hw - dy; dx++) { const X = cxx + dx, Y = top - 1 - dy; U[Y * W + X] = P(STNT, STNV, 0.7 - 0.06 * dy, X, Y, ck); } }
          const gk = goldK(t) * (0.5 + 0.5 * Math.sin(t * 2.4 + b.i * 1.7));
          if (gk > 0.6 && b.i % 2 === 0) { const sx = x0 + (b.w >> 1), sy = top - 1; px.set(sx, sy, hex('#ffffff')); px.dpx(sx + 1, sy, hex('#ffe08a'), gk); px.dpx(sx - 1, sy, hex('#ffe08a'), gk); px.dpx(sx, sy - 1, hex('#ffe08a'), gk); px.dpx(sx, sy + 1, hex('#ffe08a'), gk); }
        }
        /* v14: one steady beam over the city; a spark at its head, and a ring: the beginning */
        const bx = 292;
        if (steady > 0.01) {
          for (let y = 0; y < PLAT; y++) { const w = 6 + 4 * (y / PLAT); for (let x = Math.round(bx - w - 3); x <= Math.round(bx + w + 3); x++) { const e = Math.abs(x - bx) / w, a = steady * (e < 1 ? 0.9 - 0.4 * e : Math.max(0, 1 - (e - 1) * 4) * 0.4); if (a > px.thr(x, y)) U[y * W + x] = mix(U[y * W + x], hex(e < 0.5 ? '#ffffff' : '#fff0c8'), 0.55); } }
          lib.halo(bx, 6, 30, hex('#fff6d8'), 0.6 * steady, 1);
          lib.flare(bx, 6, 0.5 * steady, 1);
        }
        for (let r = 0; r < 2; r++) { const u = (t - 9.0 - r * 1.2) / 3.4; if (u > 0 && u < 1) ring(bx, 6, u * 330, u * 110, hex('#fff0c8'), (1 - u) * 0.8); }
      }

      function waters(t, ck) {
        const U = px.cur(), sk = S(12.4, 13.6, t) * (1 - S(22.6, 23.8, t)), pk = S(12.4, 13.4, t) * (1 - S(21.2, 21.8, t));
        if (sk > 0.01) for (let side = 0; side < 2; side++) for (let x = 0; x < 236; x++) {
          const u = x / 236, yc = streamY(u) + 2 * Math.sin(x * 0.07 + t), hw = 4 + 6 * u, X = side ? 479 - x : x;
          for (let y = Math.round(yc - hw); y <= Math.round(yc + hw); y++) {
            if (sk <= px.thr(X, y)) continue;
            const e = Math.abs(y - yc) / hw, fl = px.fbm((x - t * (side ? -30 : 30)) * 0.08, y * 0.2, 2, 5), v = 0.38 + 0.4 * fl + (e > 0.8 ? -0.2 : 0.06 * (1 - e));
            U[y * W + X] = px.ramp(side ? COLD : HOT, clamp(v + (side ? 0 : 0.1), 0, 1), X, y);
          }
        }
        /* steam from the hot stream, a cold glitter on the other */
        if (sk > 0.01) for (let i = 0; i < 40; i++) {
          const ph = (px.hash(i, 1, 6) + t * 0.18) % 1, x = Math.round(14 + px.hash(i, 2, 6) * 190), y = Math.round(streamY(x / 236) - 4 - ph * 36), u = x / 236;
          px.dpx(x + Math.round(Math.sin(t + i) * 2), y, hex('#e8d8c0'), sk * 0.7 * (1 - ph));
          px.dpx(x + 1, y, hex('#e8d8c0'), sk * 0.5 * (1 - ph));
          if (px.hash(i, 3, 6) > 0.5) { const cx = 479 - Math.round(10 + px.hash(i, 4, 6) * 200), cy = Math.round(streamY((479 - cx) / 236)) + Math.round(Math.sin(t * 3 + i) * 3); if (Math.sin(t * 4 + i * 2) > 0.8) px.set(cx, cy, hex('#ffffff')); }
        }
        /* the pool: hot on the left, cold on the right, one tepid colour in the middle */
        if (pk > 0.01) for (let y = POOLY - 14; y <= POOLY + 14; y++) for (let x = POOLX - 52; x <= POOLX + 52; x++) {
          const dx = (x - POOLX) / 52, dy = (y - POOLY) / 13; if (dx * dx + dy * dy > 1 || pk <= px.thr(x, y)) continue;
          const tw = 0.4 + 0.18 * px.fbm(x * 0.08 + t * 0.2, y * 0.2, 2, 5);
          let c = px.ramp(POOL, clamp(tw, 0, 1), x, y);
          const side = dx < 0 ? HOT : COLD, wk = 1 - S(0.0, 0.75, Math.abs(dx));
          c = mix(c, px.ramp(side, clamp(0.4 + 0.3 * tw, 0, 1), x, y), clamp(wk * 0.9, 0, 1));
          if (dy * dy > 0.7) c = mix(c, hex('#1a1a14'), 0.3);
          U[y * W + x] = c;
        }
      }

      return {
        render(t) {
          const U = px.cur(), ck = colK(t);
          world(t, ck);
          waters(t, ck);
          /* v16: a blast from above, and the tepid water is thrown out */
          const bl = S(20.8, 21.1, t) * (1 - S(21.5, 22.3, t));
          if (bl > 0.01) { for (let y = 0; y < POOLY; y++) for (let x = 200; x <= 280; x++) { const e = Math.abs(x - 240) / 40, a = bl * (1 - e * e); if (a > px.thr(x, y)) U[y * W + x] = mix(U[y * W + x], hex(e < 0.6 ? '#ffffff' : '#fff0c0'), 0.6); } lib.halo(240, POOLY, 70, hex('#fff6d8'), 0.7 * bl, 0.7); }
          if (t > 21.0 && t < 23.4) {
            const tau = t - 21.1;
            for (let i = 0; i < 90; i++) {
              const a = (px.hash(i, 1, 8) * 2 - 1) * 1.25, v0 = 70 + 110 * px.hash(i, 2, 8), X = POOLX + Math.sin(a) * v0 * tau * 1.3, Y = POOLY - Math.cos(a) * v0 * tau + 150 * tau * tau;
              if (Y > 199 || X < 0 || X > 479) continue;
              px.set(Math.round(X), Math.round(Y), hex(i % 5 === 0 ? '#e87a3a' : i % 5 === 1 ? '#8ac4e0' : '#a4ae9a')); if (i % 3 === 0) px.set(Math.round(X) + 1, Math.round(Y), hex('#a4ae9a'));
            }
            const u = (t - 21.1) / 1.6; ring(POOLX, POOLY, u * 150, u * 30, hex('#fff0c8'), (1 - u) * 0.8);
          }
          /* the figure: a gold robe that drains, then white */
          const fa = S(25.0, 26.5, t), d1 = S(29.5, 33, t), d2 = S(40.8, 42.6, t);
          const walk = S(48.6, 53.4, t), fx = lerp(150, 122, walk), fy = 182, fh = 50;
          const robe = px.mixRamp(px.mixRamp(GOLDR, GREYR, d1), WHITER, d2);
          const lean = S(30, 34, t) * (1 - S(44, 46, t)) * 0.9;
          fig(fx, fy, fh, robe, fa, t, lean);
          /* the veil of not seeing: it closes in (3:17) and is cleared from the eyes outward (3:18) */
          const vk = S(30, 34.5, t) * 0.88, clearR = S(44.0, 47.8, t) * 640;
          if (vk > 0.01) for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
            const dist = Math.hypot(x - fx, (y - (fy - fh)) * 1.2), k = vk * S(clearR - 80, clearR, dist) * (0.75 + 0.25 * px.fbm(x * 0.03 + t * 0.1, y * 0.05, 2, 9));
            const f = Math.floor(k * 4 + px.thr(x, y)) / 4; if (f > 0) U[y * W + x] = mix(U[y * W + x], px.ramp(lib.LUKE, 0.7, x, y), clamp(f, 0, 1) * 0.92);
          }
          /* v18: gold refined in the fire (above the haze: light pierces it) */
          const fk = S(34.6, 36, t) * (1 - S(42, 44, t));
          if (fk > 0.01) {
            const cx = 352, cy = 150, heat = S(35, 39, t);
            lib.halo(cx, cy, 50, hex('#ffb040'), 0.55 * fk * (0.4 + 0.6 * heat), 0.9);
            for (let y = cy + 6; y < 178; y++) for (let x = cx - 20; x <= cx + 20; x++) if (fk > px.thr(x, y)) px.set(x, y, px.ramp(lib.BRONZE, clamp(0.12 + 0.12 * px.hash(x >> 2, y >> 2, 2), 0, 1), x, y));
            for (let y = cy - 2; y <= cy + 7; y++) for (let x = cx - 14; x <= cx + 14; x++) { const e = (x - cx) * (x - cx) / 196 + (y - cy - 2) * (y - cy - 2) / 50; if (e < 1 && fk > px.thr(x, y)) px.set(x, y, px.ramp(lib.BRONZE, clamp(0.5 - 0.3 * (x - cx) / 14, 0, 1), x, y)); }
            for (let y = cy - 3; y <= cy + 1; y++) for (let x = cx - 8; x <= cx + 8; x++) if (fk > px.thr(x, y)) px.set(x, y, px.ramp(GOLDR, clamp(0.3 + 0.7 * heat - 0.1 * (y - cy + 3) + 0.08 * Math.sin(t * 6 + x), 0, 1), x, y));
            for (let i = 0; i < 4; i++) lib.flame({ x: cx - 15 + i * 10, y: cy + 8, k: fk, pop: 0, t, seed: 20 + i, s: 1.6, glow: 0.8 });
            for (let i = 0; i < 12; i++) { const ph = ((t - 36 - i * 0.2) % 2.4) / 2.4; if (t > 36 && t < 41 && ph >= 0 && ph < 1) px.dpx(Math.round(cx - 7 + i * 1.3 + ph * (i - 6) * 3), Math.round(cy + 2 + ph * 40), hex('#120a08'), fk * (1 - ph)); }
          }
          /* white garments unfurl from above */
          const gk = S(39, 41.2, t) * (1 - S(42.4, 43.6, t));
          if (gk > 0.01) { const bot = (fy - fh * 0.85) * S(39, 41.5, t); for (let y = 0; y < bot; y++) { const w = 22 + 1.5 * Math.sin(y * 0.1 + t * 2) + (y > bot - 8 ? 3 * Math.sin(x0w(y) + t * 3) : 0), cx2 = fx + Math.sin(y * 0.03 + t) * 2; for (let x = Math.round(cx2 - w); x <= Math.round(cx2 + w); x++) { const u = (x - cx2) / w; if (gk > px.thr(x, y)) px.set(x, y, px.ramp(WHITER, clamp(0.66 + 0.22 * Math.sin(u * 9) - 0.12 * Math.abs(u), 0, 1), x, y)); } } lib.halo(fx, Math.round(bot * 0.6), 40, hex('#f4f6ff'), 0.25 * gk, 1.4); }
          /* the salve: a drop of light on the eyes */
          if (t > 43.1 && t < 44.6) { const u = clamp((t - 43.1) / 1.0, 0, 1), dy = lerp(0, fy - fh - 2, u * u); if (t < 44.1) { lib.halo(Math.round(fx), Math.round(dy), 10, hex('#fff0a0'), 0.7, 1.6); px.disc(Math.round(fx), Math.round(dy), 1.5, hex('#fffbe0')); } const r = (t - 44.1) / 0.5; if (r > 0 && r < 1) ring(fx, fy - fh, r * 40, r * 40, hex('#fff6d8'), 1 - r); }
          /* v19: the steady warm light, a step toward it */
          const sun = S(47.2, 50.5, t); if (sun > 0.01) { lib.halo(40, 101, 120, hex('#ffd890'), 0.5 * sun, 0.7); px.disc(40, 104, 8 * sun, hex('#fff0c0')); lib.flare(40, 104, 0.5 * sun, 1); }
          lib.motes({ x0: 0, x1: W, y0: 40, y1: 190, t, k: 0.4 * S(46, 50, t) * (1 - S(53.5, 56, t)), n: 40, speed: 6 });
          /* the light dims to a door in the dark: a knock */
          const nk = S(53.8, 60, t);
          if (nk > 0.01) {
            for (let i = 0; i < W * H; i++) { const x = i % W, y = (i / W) | 0, c = U[i], f = 1 - nk * 0.97, d = Math.floor((1 - f) * 6 + px.thr(x, y)) / 6; U[i] = mix(c, hex('#030206'), clamp(d, 0, 1)); }
            const dk = S(57, 60.5, t);
            for (let y = 70; y <= 160; y++) for (let x = 206; x <= 274; x++) {
              const ax = Math.abs(x - 240), inD = ax <= 30 && (y >= 100 || Math.hypot(x - 240, y - 100) <= 30), inF = ax <= 34 && (y >= 100 || Math.hypot(x - 240, y - 100) <= 34);
              if (inD) px.set(x, y, px.ramp(lib.BRONZE, 0.07 + 0.05 * px.hash(x >> 2, y >> 3, 6), x, y));
              else if (inF && dk > px.thr(x, y)) px.set(x, y, px.ramp(lib.BRONZE, 0.3 + 0.25 * Math.sin(t * 2), x, y));
            }
            for (let y = 150; y <= 160; y++) for (let x = 210; x <= 270; x++) px.dpx(x, y, hex('#ffc060'), dk * 0.5 * (1 - (y - 150) / 10));
            const kn = (t - 62.5) / 1.0; if (kn > 0 && kn < 1) ring(240, 120, kn * 40, kn * 52, hex('#ffd890'), (1 - kn) * 0.8);
          }
          /* the blast shakes the world a little */
          const sh = t > 21.0 && t < 22.4 ? Math.round(Math.sin(t * 60) * 2 * Math.exp(-(t - 21) / 0.5)) : 0;
          if (sh) { const copy = U.slice(); for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) U[y * W + x] = copy[Math.min(H - 1, Math.max(0, y + sh)) * W + x]; }
          px.post({ vignette: 0.9, flash: 0.55 * (t > 21.0 ? Math.exp(-(t - 21.0) / 0.3) : 0) * (t < 22.5 ? 1 : 0), flashCol: hex('#fff6e0') });
          lib.titleCard(t, 'LUKEWARM', 14);
          px.fadeOnly(clamp(1 - S(0, 0.8, t)) * 0.0);
        },
      };
    },

    score(A, from) {
      const D2 = 73.42, D3 = 146.83, A3 = 220, E4 = 329.63, D4 = 293.66, Fs4 = 369.99, A4 = 440, D5 = 587.33, Fs5 = 739.99, A5 = 880, D6 = 1174.66, Bb3 = 233.08, B3 = 246.94, G3 = 196;
      /* continuity: the hollow fifth of the haze */
      A.drone(0, 64, D2, { gain: 0.07, attack: 0.8, release: 3 });
      A.choir(0, 12, [D3, A3, E4], { gain: 0.04, attack: 1.2, release: 2.0, vowel: 0.4 });
      A.wind(1, 20, { gain: 0.03, bright: 0.3, attack: 2.0 });
      /* v14: one steady tone (the witness), and the beginning */
      A.shimmer(5.4, A5, { dur: 7, gain: 0.05 }); A.choir(6, 14, [A3, A4], { gain: 0.04, attack: 2.0, release: 2.0, vowel: 0.9 });
      A.boom(9.0, { freq: 55, gain: 0.3, dur: 2.2 }); A.bell(9.0, D5, { gain: 0.1, dur: 7 }); A.bell(10.2, A5, { gain: 0.06, dur: 6 });
      /* v15: lukewarm: a flat, slightly sour hum; water */
      A.choir(12.6, 24, [A3, Bb3, E4], { gain: 0.035, attack: 1.5, release: 2.0, vowel: 0.3 });
      A.noise({ t0: 12.6, t1: 21, gain: 0.03, filter: { type: 'bandpass', freq: 1400, q: 0.5 }, wet: 0.4, attack: 1.0, release: 1.0 });
      /* v16: spat out */
      A.boom(21.0, { freq: 40, gain: 0.65, dur: 3.2 }); A.noise({ t0: 21.0, t1: 22.6, gain: [[21.0, 0.2], [22.6, 0]], filter: { type: 'bandpass', freq: [[21.0, 4200], [22.6, 700]], q: 0.7 }, wet: 0.4, attack: 0.005, release: 0.5 });
      A.bell(21.0, G3, { gain: 0.1, dur: 6 });
      /* v17: rich: bright bells that thin out and go dull */
      [D5, Fs5, A5, D6, A5, Fs5, D5, A4].forEach((f, i) => A.bell(25.6 + i * 0.5, f, { gain: 0.05 * (1 - i * 0.08), dur: 3.5 }));
      A.drone(29.5, 37, G3 / 2, { gain: 0.05, attack: 2.0, release: 2.0 });
      /* v18: the furnace; the white cloth; the salve; colour returns */
      A.noise({ t0: 34.6, t1: 43, gain: [[34.6, 0], [37, 0.06], [43, 0.02]], filter: { type: 'lowpass', freq: 600, q: 0.7 }, wet: 0.3, attack: 0.8, release: 1.5 });
      A.brass(35, 44, D3, { gain: 0.045, attack: 3.0, release: 1.5, sweep: [[35, 300], [43, 1400]] });
      A.choir(39, 49, [D3, A3, D4, Fs4], { gain: 0.05, attack: 2.4, release: 2.0, vowel: 1.0 });
      A.shimmer(43.2, D6, { dur: 5, gain: 0.07 }); A.bell(44.1, A5, { gain: 0.14, dur: 8 }); A.boom(44.1, { freq: 50, gain: 0.3, dur: 2 });
      A.choir(44.4, 56, [D3, A3, D4, Fs4, A4, D5], { gain: 0.07, attack: 2.0, release: 2.4, vowel: 1.1 });
      /* v19: a firm, warm love */
      A.brass(48.6, 56, D3, { gain: 0.055, attack: 1.6, release: 1.6, sweep: [[48.6, 500], [53, 1500]] });
      [A5, Fs5, D5].forEach((f, i) => A.bell(49 + i * 1.5, f, { gain: 0.05, dur: 5 }));
      /* the dark, and a knock */
      A.choir(56, 64, [D3, A3], { gain: 0.035, attack: 2.0, release: 2.0, vowel: 0.4 });
      A.boom(62.5, { freq: 90, gain: 0.35, dur: 0.5 }); A.noise({ t0: 62.5, t1: 62.7, gain: 0.12, filter: { type: 'lowpass', freq: 500, q: 1 }, wet: 0.3, attack: 0.002, release: 0.15 });
    },
  });
})();
