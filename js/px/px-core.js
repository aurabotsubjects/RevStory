/* ============================================================================
 *  AURABOT PROJECT · REVELATION · PIXEL CORE
 *  A tiny software renderer for 2D pixel-art scenes. Everything is drawn into a
 *  480x200 buffer (2.4:1) of packed 0xAABBGGRR pixels, then the engine blits it
 *  and the browser scales it up with nearest-neighbour filtering.
 *  Every frame is a pure function of time `t` (scrubbing always works).
 * ========================================================================== */
(function () {
  'use strict';
  const Aura = (window.Aura = window.Aura || {});
  const W = 480, H = 200;
  const px = (Aura.px = { W, H });

  /* ----------------------------------------------------------- maths */
  const clamp = (x, a, b) => (x < a ? a : x > b ? b : x);
  const lerp = (a, b, t) => a + (b - a) * t;
  const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  px.clamp = clamp; px.lerp = lerp; px.sstep = sstep;

  /* --------------------------------------------------------- colours */
  const pack = (r, g, b) => (0xff000000 | (clamp(b | 0, 0, 255) << 16) | (clamp(g | 0, 0, 255) << 8) | clamp(r | 0, 0, 255)) >>> 0;
  const hex = (s) => { s = s.replace('#', ''); return pack(parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)); };
  const R = (c) => c & 255, G = (c) => (c >> 8) & 255, B = (c) => (c >> 16) & 255;
  const mix = (a, b, k) => {
    if (k <= 0) return a; if (k >= 1) return b;
    const ar = a & 255, ag = (a >> 8) & 255, ab = (a >> 16) & 255;
    return (0xff000000 | ((ab + (((b >> 16) & 255) - ab) * k) << 16) | ((ag + (((b >> 8) & 255) - ag) * k) << 8) | (ar + ((b & 255) - ar) * k)) >>> 0;
  };
  const scale = (c, k) => pack((c & 255) * k, ((c >> 8) & 255) * k, ((c >> 16) & 255) * k);
  px.pack = pack; px.hex = hex; px.mix = mix; px.scale = scale; px.R = R; px.G = G; px.B = B;
  px.hexes = (arr) => arr.map(hex);
  /* mix two equal-length palettes */
  px.mixRamp = (A, Bm, k) => A.map((c, i) => mix(c, Bm[i], k));

  /* ------------------------------------------------------- dithering */
  const B4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  const thr = (x, y) => (B4[((y & 3) << 2) + (x & 3)] + 0.5) / 16;
  px.thr = thr;
  /* ordered-dither pick from a ramp of colours; v in 0..1 */
  px.ramp = (cols, v, x, y) => {
    const n = cols.length;
    if (v <= 0) return cols[0]; if (v >= 1) return cols[n - 1];
    const f = v * (n - 1), i = f | 0;
    /* sharpened ordered dither: flat colour plateaus with narrow dithered seams (cleaner, more hand-painted) */
    const fr = clamp((f - i - 0.5) * px.sharp + 0.5, 0, 1);
    return fr > thr(x, y) ? cols[i + 1] : cols[i];
  };
  px.sharp = 1.8;

  /* ----------------------------------------------------------- noise */
  const hash = (x, y, s) => {
    let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul((s | 0) + 1, 1442695041)) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
  const hash3 = (x, y, z, s) => {
    let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(z | 0, 2147483647) + Math.imul((s | 0) + 1, 1442695041)) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
  const sm = (t) => t * t * (3 - 2 * t);
  const vnoise = (x, y, s) => {
    const ix = Math.floor(x), iy = Math.floor(y), fx = sm(x - ix), fy = sm(y - iy);
    const a = hash(ix, iy, s), b = hash(ix + 1, iy, s), c = hash(ix, iy + 1, s), d = hash(ix + 1, iy + 1, s);
    return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
  };
  const vnoise3 = (x, y, z, s) => {
    const ix = Math.floor(x), iy = Math.floor(y), iz = Math.floor(z), fx = sm(x - ix), fy = sm(y - iy), fz = sm(z - iz);
    const l = (a, b, t) => a + (b - a) * t;
    const h = (i, j, k) => hash3(ix + i, iy + j, iz + k, s);
    return l(l(l(h(0, 0, 0), h(1, 0, 0), fx), l(h(0, 1, 0), h(1, 1, 0), fx), fy), l(l(h(0, 0, 1), h(1, 0, 1), fx), l(h(0, 1, 1), h(1, 1, 1), fx), fy), fz);
  };
  const fbm = (x, y, oct, s) => { let a = 0.5, f = 1, v = 0, n = 0; for (let i = 0; i < oct; i++) { v += vnoise(x * f, y * f, s + i * 17) * a; n += a; a *= 0.5; f *= 2; } return v / n; };
  const fbm3 = (x, y, z, oct, s) => { let a = 0.5, f = 1, v = 0, n = 0; for (let i = 0; i < oct; i++) { v += vnoise3(x * f, y * f, z * f, s + i * 17) * a; n += a; a *= 0.5; f *= 2; } return v / n; };
  px.hash = hash; px.vnoise = vnoise; px.fbm = fbm; px.fbm3 = fbm3;
  /* tiny deterministic RNG */
  px.rng = (seed) => { let s = (seed | 0) || 1; return () => { s = (Math.imul(s, 1664525) + 1013904223) | 0; return ((s >>> 8) & 0xffffff) / 16777216; }; };

  /* sin lookup (fast wave maths) */
  const SIN = new Float32Array(2048); for (let i = 0; i < 2048; i++) SIN[i] = Math.sin((i / 2048) * Math.PI * 2);
  px.sin = (x) => SIN[((x * 325.9493) | 0) & 2047];   /* x in radians */

  /* ------------------------------------------------------- surface */
  let U = null;                     /* current target Uint32Array(W*H) */
  px.target = (u32) => { U = u32; };
  px.cur = () => U;
  px.surface = () => { const buf = new ArrayBuffer(W * H * 4); return { u32: new Uint32Array(buf), u8: new Uint8ClampedArray(buf) }; };

  px.set = (x, y, c) => { if (x >= 0 && x < W && y >= 0 && y < H) U[y * W + x] = c; };
  px.get = (x, y) => (x >= 0 && x < W && y >= 0 && y < H ? U[y * W + x] : 0);
  px.fill = (c) => U.fill(c);
  px.rect = (x, y, w, h, c) => {
    x |= 0; y |= 0; w |= 0; h |= 0;
    const x0 = Math.max(0, x), x1 = Math.min(W, x + w), y0 = Math.max(0, y), y1 = Math.min(H, y + h);
    for (let j = y0; j < y1; j++) { const o = j * W; for (let i = x0; i < x1; i++) U[o + i] = c; }
  };
  px.hline = (x0, x1, y, c) => { y |= 0; if (y < 0 || y >= H) return; x0 = Math.max(0, x0 | 0); x1 = Math.min(W - 1, x1 | 0); for (let i = x0; i <= x1; i++) U[y * W + i] = c; };
  px.vline = (x, y0, y1, c) => { x |= 0; if (x < 0 || x >= W) return; y0 = Math.max(0, y0 | 0); y1 = Math.min(H - 1, y1 | 0); for (let j = y0; j <= y1; j++) U[j * W + x] = c; };
  /* blend a single pixel toward colour c by k (0..1) */
  px.blend = (x, y, c, k) => { if (x >= 0 && x < W && y >= 0 && y < H) { const i = y * W + x; U[i] = mix(U[i], c, k); } };
  /* ordered-dither stamp: draws c where k > bayer */
  px.dpx = (x, y, c, k) => { if (k > thr(x, y) && x >= 0 && x < W && y >= 0 && y < H) U[y * W + x] = c; };
  px.disc = (cx, cy, r, c) => {
    const r2 = r * r + r * 0.6;
    for (let j = Math.floor(-r); j <= r; j++) for (let i = Math.floor(-r); i <= r; i++) if (i * i + j * j <= r2) px.set((cx + i) | 0, (cy + j) | 0, c);
  };
  px.ring = (cx, cy, r, c) => {
    /* 1px circle outline (midpoint) */
    let x = r | 0, y = 0, err = 1 - x; cx |= 0; cy |= 0;
    while (x >= y) {
      px.set(cx + x, cy + y, c); px.set(cx + y, cy + x, c); px.set(cx - y, cy + x, c); px.set(cx - x, cy + y, c);
      px.set(cx - x, cy - y, c); px.set(cx - y, cy - x, c); px.set(cx + y, cy - x, c); px.set(cx + x, cy - y, c);
      y++; if (err < 0) err += 2 * y + 1; else { x--; err += 2 * (y - x + 1); }
    }
  };
  /* dithered radial glow: stamps colour ramp outward from centre. strength 0..1, radius in px */
  px.glow = (cx, cy, r, cols, strength, sy) => {
    sy = sy || 1;
    const x0 = Math.max(0, Math.floor(cx - r)), x1 = Math.min(W - 1, Math.ceil(cx + r));
    const y0 = Math.max(0, Math.floor(cy - r * sy)), y1 = Math.min(H - 1, Math.ceil(cy + r * sy));
    const n = cols.length;
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const dx = (x - cx) / r, dy = (y - cy) / (r * sy), d2 = dx * dx + dy * dy;
      if (d2 >= 1) continue;
      const k = Math.pow(1 - d2, 1.6) * strength;
      const f = k * (n - 0.001); const i = f | 0;
      if (i <= 0 && f - i <= thr(x, y)) continue;
      const idx = Math.min(n - 1, f - i > thr(x, y) ? i + 1 : i);
      if (idx <= 0) continue;
      const o = y * W + x; U[o] = cols[idx];
    }
  };
  /* soft dark scrim (dithered) behind titles */
  px.scrim = (cx, cy, rx, ry, k, col) => {
    col = col === undefined ? 0xff0a0612 : col;
    for (let y = Math.max(0, Math.floor(cy - ry)); y <= Math.min(H - 1, Math.ceil(cy + ry)); y++) for (let x = Math.max(0, Math.floor(cx - rx)); x <= Math.min(W - 1, Math.ceil(cx + rx)); x++) {
      const dx = (x - cx) / rx, dy = (y - cy) / ry, d2 = dx * dx + dy * dy; if (d2 >= 1) continue;
      const u = Math.pow(1 - d2, 0.8) * k; if (u > thr(x, y)) { const i = y * W + x; U[i] = mix(U[i], col, 0.62); }
    }
  };
  /* copy a W+pad sized background with offset */
  px.blit = (src, sw, sh, ox, oy) => {
    for (let y = 0; y < H; y++) {
      const sy = clamp(y + oy, 0, sh - 1) * sw, o = y * W;
      for (let x = 0; x < W; x++) U[o + x] = src[sy + clamp(x + ox, 0, sw - 1)];
    }
  };

  /* ------------------------------------------------ 5x7 bitmap font */
  const FONT = {
    A: '01110 10001 10001 11111 10001 10001 10001', B: '11110 10001 10001 11110 10001 10001 11110',
    C: '01110 10001 10000 10000 10000 10001 01110', D: '11110 10001 10001 10001 10001 10001 11110',
    E: '11111 10000 10000 11110 10000 10000 11111', F: '11111 10000 10000 11110 10000 10000 10000',
    G: '01110 10001 10000 10111 10001 10001 01111', H: '10001 10001 10001 11111 10001 10001 10001',
    I: '01110 00100 00100 00100 00100 00100 01110', J: '00111 00010 00010 00010 00010 10010 01100',
    K: '10001 10010 10100 11000 10100 10010 10001', L: '10000 10000 10000 10000 10000 10000 11111',
    M: '10001 11011 10101 10101 10001 10001 10001', N: '10001 11001 10101 10011 10001 10001 10001',
    O: '01110 10001 10001 10001 10001 10001 01110', P: '11110 10001 10001 11110 10000 10000 10000',
    Q: '01110 10001 10001 10001 10101 10010 01101', R: '11110 10001 10001 11110 10100 10010 10001',
    S: '01111 10000 10000 01110 00001 00001 11110', T: '11111 00100 00100 00100 00100 00100 00100',
    U: '10001 10001 10001 10001 10001 10001 01110', V: '10001 10001 10001 10001 10001 01010 00100',
    W: '10001 10001 10001 10101 10101 11011 10001', X: '10001 10001 01010 00100 01010 10001 10001',
    Y: '10001 10001 01010 00100 00100 00100 00100', Z: '11111 00001 00010 00100 01000 10000 11111',
    '0': '01110 10001 10011 10101 11001 10001 01110', '1': '00100 01100 00100 00100 00100 00100 01110',
    '2': '01110 10001 00001 00010 00100 01000 11111', '3': '11110 00001 00001 01110 00001 00001 11110',
    '4': '00010 00110 01010 10010 11111 00010 00010', '5': '11111 10000 11110 00001 00001 10001 01110',
    '6': '00110 01000 10000 11110 10001 10001 01110', '7': '11111 00001 00010 00100 01000 01000 01000',
    '8': '01110 10001 10001 01110 10001 10001 01110', '9': '01110 10001 10001 01111 00001 00010 01100',
    '.': '00000 00000 00000 00000 00000 01100 01100', '-': '00000 00000 00000 11111 00000 00000 00000',
    '·': '00000 00000 00000 00100 00000 00000 00000',
    "'": '00100 00100 01000 00000 00000 00000 00000', ',': '00000 00000 00000 00000 01100 00100 01000', ' ': '00000 00000 00000 00000 00000 00000 00000',
  };
  const GL = {};
  Object.keys(FONT).forEach((k) => { GL[k] = FONT[k].split(' ').map((r) => parseInt(r, 2)); });
  px.textWidth = (s, sc, track) => { track = track === undefined ? 1 : track; return s.length * (5 + track) * sc - track * sc; };
  /* draw text. colour: packed number or fn(col,row,x,y)->packed. alpha 0..1 is applied with ordered dither. */
  px.text = (s, x, y, sc, color, alpha, track) => {
    track = track === undefined ? 1 : track; alpha = alpha === undefined ? 1 : alpha; sc = sc || 1;
    let cx = x | 0;
    for (let ci = 0; ci < s.length; ci++) {
      const g = GL[s[ci] === '\u2019' ? "'" : s[ci].toUpperCase()] || GL[' '];
      for (let r = 0; r < 7; r++) for (let c = 0; c < 5; c++) {
        if (!(g[r] & (16 >> c))) continue;
        for (let j = 0; j < sc; j++) for (let i = 0; i < sc; i++) {
          const X = cx + c * sc + i, Y = (y | 0) + r * sc + j;
          if (alpha < 1 && alpha <= thr(X, Y)) continue;
          px.set(X, Y, typeof color === 'function' ? color(c * sc + i, r * sc + j, X, Y, ci) : color);
        }
      }
      cx += (5 + track) * sc;
    }
  };
  /* 1px dark outline behind text (call before px.text) */
  px.textShadow = (s, x, y, sc, color, alpha, track, dx, dy) => { px.text(s, x + (dx === undefined ? sc : dx), y + (dy === undefined ? sc : dy), sc, color, alpha, track); };

  /* ------------------------------------------------ post (vignette / fades) */
  const VIG = new Uint8Array(W * H);           /* 0..3 static dithered darkness level */
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const dx = (x / W - 0.5) * 1.0, dy = (y / H - 0.5) * 1.35, d = Math.sqrt(dx * dx + dy * dy);
    const v = sstep(0.34, 0.78, d) * 3.0; const i = v | 0;
    VIG[y * W + x] = Math.min(3, v - i > thr(x, y) ? i + 1 : i);
  }
  const VIGK = [1, 0.84, 0.68, 0.5];
  /* one pass: dithered vignette, scene fade (to colour), flash. fade/flash 0..1 */
  px.post = (o) => {
    o = o || {};
    const vig = o.vignette === undefined ? 1 : o.vignette;
    const fade = o.fade || 0, fc = o.fadeCol === undefined ? 0xff000000 : o.fadeCol;
    const flash = o.flash || 0, flc = o.flashCol === undefined ? 0xffffffff : o.flashCol;
    const need = vig > 0 || fade > 0.001 || flash > 0.001;
    if (!need) return;
    const fr = fc & 255, fg = (fc >> 8) & 255, fb = (fc >> 16) & 255, lr = flc & 255, lg = (flc >> 8) & 255, lb = (flc >> 16) & 255;
    const STEPS = 6;
    for (let y = 0; y < H; y++) {
      const o2 = y * W;
      for (let x = 0; x < W; x++) {
        const i = o2 + x; let c = U[i];
        let r = c & 255, g = (c >> 8) & 255, b = (c >> 16) & 255;
        if (vig > 0) { const k = 1 - (1 - VIGK[VIG[i]]) * vig; r *= k; g *= k; b *= k; }
        if (flash > 0.001) { const f = Math.floor(flash * STEPS + thr(x, y)) / STEPS; if (f > 0) { r += (lr - r) * f; g += (lg - g) * f; b += (lb - b) * f; } }
        if (fade > 0.001) { const f = Math.floor(fade * STEPS + thr(x, y)) / STEPS; if (f > 0) { r += (fr - r) * f; g += (fg - g) * f; b += (fb - b) * f; } }
        U[i] = (0xff000000 | (b << 16) | (g << 8) | r) >>> 0;
      }
    }
  };
  /* dithered fade/flash only (no vignette) for post-title overlays */
  px.fadeOnly = (fade, col) => { if (fade > 0.001) px.post({ vignette: 0, fade, fadeCol: col }); };
})();
