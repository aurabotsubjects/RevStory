/* ============================================================================
 *  AURABOT PROJECT · REVELATION · PIXEL SET-PIECE LIBRARY
 *  Reusable 2D pixel-art pieces: starfield, planet, sea & sky, clouds, islands,
 *  cliff, grass, John, wind. Every function draws into the current px target.
 *  Palette rule: dark cool blues + one warm accent (dawn orange/gold), dithered.
 * ========================================================================== */
(function () {
  'use strict';
  const Aura = window.Aura, px = Aura.px;
  const { W, H, clamp, lerp, sstep, hex, hexes, mix, pack, thr, hash, fbm3, sin } = px;
  const lib = (Aura.pxlib = {});
  lib.target = { lon: 0.43, lat: 0.64 };   /* the dive target (centre of the Aegean) */
  const TAU = Math.PI * 2;
  const frac = (x) => x - Math.floor(x);
  const wrapi = (i, n) => ((i % n) + n) % n;

  /* =================================================== SPACE BACKDROP */
  let SPACE = null;
  function ensureSpace() {
    if (SPACE) return SPACE;
    const PX = 80, PY = 40, w = W + PX * 2, h = H + PY * 2;
    const surf = px.surface(), u = new Uint32Array(w * h);
    const mw = hexes(['#03040a', '#060815', '#0b0f28', '#141a42', '#222858', '#363470']);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const line = h * 0.62 - (x - w / 2) * 0.30, d = (y - line) / (h * 0.2);
      const band = Math.exp(-d * d), n = px.fbm(x * 0.03, y * 0.045, 3, 5);
      const dust = px.fbm(x * 0.012 + 9, y * 0.02, 2, 9);
      let v = band * (0.2 + 1.1 * n) - 0.12 + (dust - 0.5) * 0.12;
      v = clamp(v, 0, 1);
      let c = px.ramp(mw, v * 0.95, x, y);
      if (band > 0.35 && dust > 0.58 && n < 0.45 && v < 0.5) c = mix(c, hex('#04050a'), 0.6);  /* dark dust lanes */
      u[y * w + x] = c;
    }
    const rnd = px.rng(2026), twinks = [];
    const starCols = hexes(['#5d6a9c', '#8c9acc', '#c8d4f0', '#ffffff', '#ffe9b8', '#ffd0a0', '#bcd6ff']);
    for (let i = 0; i < 520; i++) {
      const x = (rnd() * w) | 0, y = (rnd() * h) | 0, b = Math.pow(rnd(), 2.4);
      const ci = b > 0.8 ? 3 + ((rnd() * 4) | 0) : b > 0.4 ? 1 + ((rnd() * 2) | 0) : 0;
      u[y * w + x] = starCols[Math.min(6, ci)];
      if (b > 0.93) {  /* cross sparkle */
        const arm = mix(starCols[2], hex('#0b1030'), 0.55);
        [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => { const k = (y + dy) * w + x + dx; if (k >= 0 && k < u.length) u[k] = arm; });
        twinks.push({ x, y, p: rnd() * 6.28, s: 1.4 + rnd() * 2.2 });
      } else if (b > 0.55 && twinks.length < 70) twinks.push({ x, y, p: rnd() * 6.28, s: 1 + rnd() * 2 });
    }
    SPACE = { u, w, h, PX, PY, twinks, starCols };
    return SPACE;
  }
  /* o: {ox,oy: camera drift in px (parallax applied inside), t, alpha} */
  lib.space = function (o) {
    const S = ensureSpace(); o = o || {};
    const bx = clamp(Math.round(S.PX + (o.ox || 0)), 0, S.PX * 2), by = clamp(Math.round(S.PY + (o.oy || 0)), 0, S.PY * 2);
    px.blit(S.u, S.w, S.h, bx, by);
    const t = o.t || 0;
    for (const s of S.twinks) {
      const sx = s.x - bx, sy = s.y - by; if (sx < 1 || sx > W - 2 || sy < 1 || sy > H - 2) continue;
      const k = 0.5 + 0.5 * Math.sin(t * s.s + s.p);
      px.set(sx, sy, k > 0.8 ? S.starCols[3] : k > 0.4 ? S.starCols[2] : S.starCols[1]);
    }
  };

  /* ============================================================== PLANET */
  const PL = { w: 384, h: 192, hgt: null, cld: null, ari: null, sea: 0.5 };
  function buildPlanet() {
    if (PL.hgt) return;
    const w = PL.w, h = PL.h, hg = new Float32Array(w * h), cl = new Float32Array(w * h), ar = new Float32Array(w * h);
    for (let j = 0; j < h; j++) {
      const lat = (0.5 - (j + 0.5) / h) * Math.PI, cy = Math.cos(lat), sy = Math.sin(lat);
      for (let i = 0; i < w; i++) {
        const lon = ((i + 0.5) / w - 0.5) * TAU, x = cy * Math.sin(lon), z = cy * Math.cos(lon);
        const base = fbm3(x * 1.5 + 7, sy * 1.5 + 3, z * 1.5, 4, 11), det = fbm3(x * 5, sy * 5, z * 5, 3, 23);
        hg[j * w + i] = base * 0.78 + det * 0.22;
        /* wispy, banded clouds: stretched along longitude, thin streaks */
        let c = fbm3(x * 2.0 + 3, sy * 5.5 + 1, z * 2.0, 5, 41);
        c += 0.09 * Math.sin(lat * 8.0 + x * 2.5) - 0.02;
        cl[j * w + i] = c;
        ar[j * w + i] = fbm3(x * 2.2 + 11, sy * 2.2 + 5, z * 2.2, 3, 71);
      }
    }
    /* normalise: 36% land */
    const bins = new Uint32Array(256); let mn = 1, mx = 0;
    for (let i = 0; i < hg.length; i++) { mn = Math.min(mn, hg[i]); mx = Math.max(mx, hg[i]); }
    for (let i = 0; i < hg.length; i++) bins[Math.min(255, ((hg[i] - mn) / (mx - mn) * 255) | 0)]++;
    let acc = 0, q = 0; for (; q < 256; q++) { acc += bins[q]; if (acc > hg.length * 0.62) break; }
    const sea = mn + (q / 255) * (mx - mn), span = (mx - sea) * 1.05;
    for (let i = 0; i < hg.length; i++) hg[i] = clamp(0.5 + (hg[i] - sea) / span * 0.5, 0, 1);
    /* hand-shape the dive target (Aegean): open sea with scattered islands, a mainland on each side */
    const T = lib.target, tcl = Math.cos(T.lat), tx = tcl * Math.sin(T.lon), ty = Math.sin(T.lat), tz = tcl * Math.cos(T.lon);
    const blobs = [[0.26, 0.02, 0.15, 0.66], [-0.27, -0.02, 0.13, 0.64], [0.02, 0.2, 0.12, 0.6], [0.0, -0.22, 0.1, 0.6],
      [0.035, 0.015, 0.022, 0.62], [-0.05, -0.035, 0.015, 0.6], [0.075, -0.05, 0.018, 0.64], [-0.09, 0.05, 0.026, 0.62], [0.11, 0.06, 0.014, 0.6], [-0.02, 0.07, 0.012, 0.6], [0.05, -0.11, 0.02, 0.62], [-0.14, -0.08, 0.02, 0.6]];
    const frameLon = (dl) => T.lon + dl / Math.max(0.3, tcl);
    for (let j = 0; j < h; j++) {
      const lat = (0.5 - (j + 0.5) / h) * Math.PI, cy = Math.cos(lat), sy = Math.sin(lat);
      for (let i = 0; i < w; i++) {
        const lon = ((i + 0.5) / w - 0.5) * TAU, x = cy * Math.sin(lon), z = cy * Math.cos(lon);
        const dot = x * tx + sy * ty + z * tz, ang = Math.acos(clamp(dot, -1, 1));
        const k = i + j * w;
        if (ang < 0.5) { const wgt = Math.exp(-Math.pow(ang / 0.3, 2)); hg[k] = hg[k] * (1 - wgt * 0.92) + 0.3 * wgt * 0.92; }
        for (const b of blobs) {
          const bl = frameLon(b[0]), bla = T.lat + b[1], bc = Math.cos(bla);
          const bx = bc * Math.sin(bl), by = Math.sin(bla), bz = bc * Math.cos(bl);
          const dd = Math.acos(clamp(x * bx + sy * by + z * bz, -1, 1)), q = dd / b[2];
          if (q < 1.6) { const wob = 0.82 + 0.36 * hash((i * 0.35) | 0, (j * 0.35) | 0, 5); hg[k] = Math.max(hg[k], b[3] * Math.exp(-q * q * 1.3) * wob); }
        }
      }
    }
    PL.hgt = hg; PL.cld = cl; PL.ari = ar;
  }
  const bil = (map, u, v) => {
    const w = PL.w, h = PL.h;
    let fx = u * w - 0.5, fy = v * h - 0.5; const ix = Math.floor(fx), iy = Math.floor(fy); fx -= ix; fy -= iy;
    const x0 = ((ix % w) + w) % w, x1 = (x0 + 1) % w, y0 = clamp(iy, 0, h - 1), y1 = clamp(iy + 1, 0, h - 1);
    const a = map[y0 * w + x0], b = map[y0 * w + x1], c = map[y1 * w + x0], d = map[y1 * w + x1];
    return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
  };
  const OCEAN = hexes(['#04081a', '#071230', '#0b2150', '#14407c', '#2a6eb0', '#4ea0d0']);
  const SHALLOW = hexes(['#06142a', '#0a2a40', '#124a5a', '#1f7a82', '#3aa8a0', '#7ad0c0']);
  const LAND = hexes(['#050a0c', '#0f1c1a', '#1c3624', '#2e5a2e', '#4a7a3a', '#7a9a48']);
  const ARID = hexes(['#0a0808', '#221a16', '#44331f', '#6a512e', '#92763f', '#b89a5a']);
  const MTN = hexes(['#08090e', '#1a1c26', '#3a3c48', '#6c6e78', '#a8a8b0', '#e8e8f0']);
  const CLOUD = hexes(['#0a1022', '#1c2640', '#3c4c70', '#8898b8', '#d8e4f4', '#ffffff']);
  const ATMO = hexes(['#0a1a3a', '#17418a', '#2f78c8', '#6cb8f0', '#c4ecff']);
  const WARM = hex('#ff8a3a'), CITY = hexes(['#ff9a30', '#ffc860', '#ff7a28']);
  /* o: {cx,cy,R,lon0,lat0,L:[x,y,z],cloudBoost,lights} */
  lib.planet = function (o) {
    buildPlanet();
    const cx = o.cx, cy = o.cy, R = o.R, L = o.L, cb = o.cloudBoost || 0, lights = o.lights === undefined ? 1 : o.lights;
    const cl0 = Math.cos(o.lat0), sl0 = Math.sin(o.lat0);
    const aW = Math.max(3, R * 0.028), outer = 1 + aW / R;
    const x0 = Math.max(0, Math.floor(cx - R - aW)), x1 = Math.min(W - 1, Math.ceil(cx + R + aW));
    const y0 = Math.max(0, Math.floor(cy - R - aW)), y1 = Math.min(H - 1, Math.ceil(cy + R + aW));
    const U = o.U;
    const cthr = 0.585 - cb * 0.43;
    for (let y = y0; y <= y1; y++) {
      const dy = -(y + 0.5 - cy) / R;
      for (let x = x0; x <= x1; x++) {
        const dx = (x + 0.5 - cx) / R, r2 = dx * dx + dy * dy;
        if (r2 > 1) {
          if (r2 < outer * outer) {
            const r = Math.sqrt(r2), t = (r - 1) / (outer - 1), lamA = (dx * L[0] + dy * L[1]) / r;
            const I = Math.pow(1 - t, 2.2) * (0.1 + 0.9 * sstep(-0.35, 0.65, lamA));
            const n = ATMO.length, f = I * (n - 0.001), i = f | 0;
            if (i === 0 && f <= thr(x, y)) continue;
            const idx = f - i > thr(x, y) ? Math.min(n - 1, i + 1) : i;
            let c = ATMO[idx];
            if (lamA > 0.55 && idx >= 2 && t < 0.5) c = mix(c, WARM, (lamA - 0.55) * 1.4);
            U[y * W + x] = c;
          }
          continue;
        }
        const Z = Math.sqrt(1 - r2);
        const Yp = dy * cl0 + Z * sl0, Zp = -dy * sl0 + Z * cl0;
        const lat = Math.asin(clamp(Yp, -1, 1)), lon = o.lon0 + Math.atan2(dx, Zp);
        const u = frac(lon / TAU + 0.5), v = 0.5 - lat / Math.PI;
        let h = bil(PL.hgt, u, v);
        const cc = bil(PL.cld, u, v);
        if (R > 380) { const dk = Math.min(1, R / 1400), dn = px.vnoise(u * 1100, v * 550, 4) * 0.65 + px.vnoise(u * 2600, v * 1300, 6) * 0.35; h += (dn - 0.5) * 0.11 * dk; }
        const lam = dx * L[0] + dy * L[1] + Z * L[2];
        const day = sstep(-0.03, 0.42, lam);
        let c;
        const polar = Math.abs(lat) > 1.25 + (h - 0.5) * 0.3;
        const noise = hash(x >> 1, y >> 1, 9) - 0.5;
        if (polar) c = px.ramp(MTN, day * 0.95 + 0.05, x, y);
        else if (h + noise * 0.012 > 0.5) {
          const hE = bil(PL.hgt, u + 1.4 / PL.w, v), shade = clamp((h - hE) * 10, -0.14, 0.14);
          if (h > 0.9) c = px.ramp(MTN, clamp(day + shade * 0.5, 0, 1), x, y);
          else {
            const ar = bil(PL.ari, u, v);
            const dry = clamp((ar - 0.6) * 6 + (Math.abs(lat) < 0.75 ? 0.1 : -1.2), 0, 1);
            const dd = clamp(day * 0.92 + 0.08 + shade * (0.4 + day) + (hash(x, y >> 1, 3) - 0.5) * 0.05, 0, 1);
            c = (dry > thr(x, y + 3)) ? px.ramp(ARID, dd, x, y) : px.ramp(LAND, dd, x, y);
          }
        } else if (h + noise * 0.01 > 0.46) c = px.ramp(SHALLOW, day, x, y);
        else c = px.ramp(OCEAN, day * (0.85 + 0.15 * h * 2), x, y);
        /* night-side city lights */
        if (lights && R > 70 && !polar && h > 0.5 && h < 0.74 && lam < 0.08 && cc < cthr + 0.08) {
          const ui = (u * PL.w * 1.5) | 0, vi = (v * PL.h * 1.5) | 0, hh = hash(ui, vi, 77), cl2 = hash(ui >> 2, vi >> 2, 78);
          if (hh < 0.34 * cl2 * cl2 * (1 - day)) c = CITY[(hh * 90) % 3 | 0];
        }
        /* clouds */
        const cov = clamp((cc - cthr) * 3.4, 0, 1);
        if (cov > thr(x + 1, y + 2)) {
          c = px.ramp(CLOUD, clamp(day * 0.92 + 0.04 + (cov - 0.5) * 0.08, 0, 1), x, y);
        }
        /* warm terminator band */
        const bw = Math.exp(-Math.pow((lam - 0.035) / 0.055, 2)) * 0.9;
        if (bw > thr(x, y + 1)) c = mix(c, WARM, 0.34);
        /* limb brightening */
        const lim = Math.pow(1 - Z, 3) * (0.15 + 0.85 * sstep(-0.2, 0.5, lam));
        if (lim > thr(x + 2, y)) c = mix(c, ATMO[3], 0.7);
        U[y * W + x] = c;
      }
    }
  };

  /* anamorphic sun flare: horizontal streak + cross */
  lib.flare = function (sx, sy, k, warmth) {
    if (k <= 0.01) return;
    const col = [hex('#ffb870'), hex('#ffd8a0'), hex('#fff0d0'), hex('#ffffff')];
    const L = 210 * k + 30;
    for (let dx = -L; dx <= L; dx++) {
      const a = Math.pow(1 - Math.abs(dx) / L, 2.2) * k;
      const x = (sx + dx) | 0; if (x < 0 || x >= W) continue;
      const f = a * 3.99, i = f | 0, idx = Math.min(3, f - i > thr(x, sy | 0) ? i + 1 : i);
      if (a > 0.04) px.blend(x, sy | 0, col[idx], Math.min(1, a * 1.6));
      if (a > 0.3) { px.dpx(x, (sy | 0) - 1, col[Math.max(0, idx - 1)], a * 0.7); px.dpx(x, (sy | 0) + 1, col[Math.max(0, idx - 1)], a * 0.7); }
    }
    const V = 24 * k + 4;
    for (let d = 1; d < V; d++) { const a = Math.pow(1 - d / V, 2) * k; px.dpx(sx | 0, (sy | 0) + d, col[1], a); px.dpx(sx | 0, (sy | 0) - d, col[1], a); }
    px.disc(sx | 0, sy | 0, 1 + k * 2.2, col[3]);
  };

  /* ============================================================== SEA & SKY */
  const SKY_NIGHT = hexes(['#05060f', '#080b1c', '#0d1230', '#161a45', '#222459', '#35305f', '#4a3a62', '#5a4560']);
  const SKY_DAWN = hexes(['#0f1634', '#1d2455', '#3b2f78', '#7a3f86', '#c4526a', '#f0805a', '#ffb468', '#ffe49a']);
  lib.skyRamp = (dawn) => px.mixRamp(SKY_NIGHT, SKY_DAWN, clamp(dawn, 0, 1));

  /* seamless horizontal cloud layer: returns {map,w,h} with shade indices 0..4 */
  function makeClouds(w, h, seed, fy, thick) {
    const map = new Uint8Array(w * h), val = new Float32Array(w * h);
    const Rr = w / TAU;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const a = (x / w) * TAU, n = fbm3(Math.cos(a) * Rr * 0.085, Math.sin(a) * Rr * 0.085, y * fy, 4, seed);
      const d = (y - h * 0.5) / (h * 0.34), env = Math.exp(-d * d);
      val[y * w + x] = n + (env - 0.5) * thick;
    }
    const thrv = 0.575;
    const isM = (x, y) => y >= 0 && y < h && val[y * w + wrapi(x, w)] > thrv;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      if (!isM(x, y)) continue;
      let below = 0; while (below < 4 && isM(x, y + 1 + below)) below++;
      let above = 0; while (above < 3 && isM(x, y - 1 - above)) above++;
      let idx;
      if (below === 0) idx = 4; else if (below === 1) idx = 3; else if (above === 0) idx = 2; else idx = val[y * w + x] > thrv + 0.13 ? 1 : 2;
      map[y * w + x] = idx;
    }
    return { map, w, h };
  }
  /* island silhouettes */
  function makeRidge(w, seed, islands) {
    const hgt = new Float32Array(w);
    for (const il of islands) {
      for (let x = 0; x < w; x++) {
        let dx = Math.abs(x - il.cx); dx = Math.min(dx, w - dx);
        const u = dx / il.hw; if (u >= 1) continue;
        const n = 0.7 + 0.6 * px.fbm(x * 0.07, seed + il.cx, 3, seed);
        const shape = Math.pow(1 - u * u, il.k || 1.4);
        hgt[x] = Math.max(hgt[x], il.peak * shape * n);
      }
    }
    return { hgt, w };
  }
  let SEA = null;
  function ensureSea() {
    if (SEA) return SEA;
    SEA = {
      cloudA: makeClouds(1100, 40, 5, 0.11, 0.42),
      cloudB: makeClouds(1500, 26, 9, 0.13, 0.5),
      far: makeRidge(1400, 3, [{ cx: 220, hw: 120, peak: 7 }, { cx: 520, hw: 70, peak: 5 }, { cx: 760, hw: 160, peak: 9 }, { cx: 1110, hw: 90, peak: 6 }, { cx: 1300, hw: 80, peak: 4 }]),
      mid: makeRidge(1500, 8, [{ cx: 120, hw: 70, peak: 12, k: 1.2 }, { cx: 640, hw: 150, peak: 17 }, { cx: 1000, hw: 60, peak: 9 }, { cx: 1330, hw: 80, peak: 11 }]),
      /* Patmos: bold hills left-of-centre, with a lower spur to the right */
      patmos: makeRidge(1600, 14, [{ cx: 560, hw: 250, peak: 40, k: 1.05 }, { cx: 400, hw: 110, peak: 34, k: 1.2 }, { cx: 760, hw: 120, peak: 28, k: 1.1 }, { cx: 930, hw: 90, peak: 14, k: 1.4 }]),
      stars: (() => { const r = px.rng(88), a = []; for (let i = 0; i < 140; i++) a.push({ x: (r() * (W + 60)) | 0, y: (r() * 120) | 0, b: r(), p: r() * 6.28 }); return a; })(),
    };
    return SEA;
  }
  const SUN_RAMP = [0, hex('#ff8a48'), hex('#ffb060'), hex('#ffd890'), hex('#fff2c0'), hex('#ffffff')];

  function drawClouds(layer, y0, par, speed, o, pal, litX, off) {
    const { map, w, h } = layer, U = o.U, cam = o.camX * par + o.t * speed + (off || 0);
    for (let j = 0; j < h; j++) {
      const y = y0 + j; if (y < 0 || y >= o.hy) continue;
      for (let x = 0; x < W; x++) {
        const idx = map[j * w + wrapi((x + cam) | 0, w)]; if (!idx) continue;
        if (o.hole) { const dx = x - o.sunX, dy = (y - o.sunY) * 1.4, d = Math.sqrt(dx * dx + dy * dy); if (d < o.hole && (d < o.hole * 0.55 || thr(x, y) > (d - o.hole * 0.55) / (o.hole * 0.45))) continue; }
        U[y * W + x] = pal[idx][litX[x]];
      }
    }
  }
  function cloudPalette(dawn) {
    const dk = mix(hex('#0a0d24'), hex('#3c2f62'), dawn), md = mix(hex('#151a3c'), hex('#7c4478'), dawn),
      lt = mix(hex('#242c58'), hex('#e0705a'), dawn), rim = mix(hex('#38426e'), hex('#ffd08a'), dawn);
    const hot = [0, hex('#6a3a58'), hex('#c8605a'), hex('#ff9a60'), hex('#ffe4a8')];
    const base = [0, dk, md, lt, rim], pal = [];
    for (let i = 0; i < 5; i++) { pal[i] = []; for (let l = 0; l < 6; l++) pal[i][l] = i === 0 ? 0 : mix(base[i], hot[i], (l / 5) * (0.35 + 0.65 * dawn)); }
    return pal;
  }
  function drawRidge(R, o, par, col, hazeCol, rimCol, sunX, scaleH, baseY) {
    const U = o.U, hy = o.hy, cam = o.camX * par;
    for (let x = 0; x < W; x++) {
      const wx = wrapi((x + cam) | 0, R.w), hgt = R.hgt[wx] * scaleH; if (hgt < 0.6) continue;
      const top = Math.round((baseY === undefined ? hy : baseY) - hgt), bottom = Math.round(baseY === undefined ? hy : baseY);
      const slope = R.hgt[wx] - R.hgt[wrapi(wx + 1, R.w)], prev = R.hgt[wrapi(wx - 1, R.w)] - R.hgt[wx];
      const facing = sunX > x ? clamp(slope * 2.2 + 0.25, 0, 1) : clamp(prev * -2.2 + 0.25, 0, 1);
      for (let y = Math.max(0, top); y < bottom && y < H; y++) {
        const v = (y - top) / Math.max(1, hgt);
        let c = col;
        if (v > 0.55 && thr(x, y) < (v - 0.55) * 1.6) c = hazeCol;
        const edge = y - top;
        if (edge === 0) c = mix(c, rimCol, 0.4 + 0.6 * facing);
        else if (edge === 1 && facing > thr(x, y)) c = mix(c, rimCol, 0.55);
        else if (edge <= 4 && facing > 0.6 && thr(x + 1, y) < facing * 0.5 - edge * 0.1) c = mix(c, rimCol, 0.3);
        U[y * W + x] = c;
      }
    }
  }

  /* master sea-and-sky draw. o: {t,dawn,hy,sunX,rise,camX,wind,amp,stars,rays,U} */
  lib.seascape = function (o) {
    const S = ensureSea(), U = o.U, hy = o.hy | 0, t = o.t, dawn = o.dawn;
    o.camX = o.camX || 0;
    const sky = lib.skyRamp(dawn), n = sky.length;
    const sunX = o.sunX, sunY = hy - o.rise;
    const sunK = clamp((o.rise + 14) / 28, 0, 1);               /* glow strength: builds before the disc appears */
    const gx = new Float32Array(W);
    for (let x = 0; x < W; x++) { const d = (x - sunX) / (W * 0.4); gx[x] = Math.exp(-d * d); }
    /* ---- sky */
    for (let y = 0; y < hy; y++) {
      const base = Math.pow(y / hy, 1.45);
      for (let x = 0; x < W; x++) {
        let v = base + gx[x] * sunK * 0.5 * (0.15 + 0.85 * base) * (0.4 + 0.6 * dawn);
        const dyy = (y - sunY) * 1.3, dd = (x - sunX) * (x - sunX) + dyy * dyy;
        v += Math.exp(-dd / 1800) * sunK * 0.55 * (0.4 + 0.6 * dawn);
        U[y * W + x] = px.ramp(sky, v > 1 ? 1 : v, x, y);
      }
    }
    /* ---- stars (fade out with dawn) */
    const sa = o.stars === undefined ? 1 - sstep(0.15, 0.7, dawn) : o.stars;
    if (sa > 0.02) for (const s of S.stars) {
      const x = ((s.x - o.camX * 0.04) | 0), y = s.y; x < 0; if (x < 0 || x >= W || y >= hy * 0.78) continue;
      const k = (0.55 + 0.45 * Math.sin(t * 1.6 + s.p)) * s.b * sa * (1 - y / (hy * 0.78));
      if (k > 0.22) U[y * W + x] = k > 0.6 ? hex('#ffffff') : k > 0.4 ? hex('#c8d4f0') : hex('#7c8ab8');
    }
    /* ---- sun (behind clouds & land) */
    if (o.rise > -9) {
      px.glow(sunX, sunY, 34, SUN_RAMP, 0.55 * Math.min(1, (o.rise + 9) / 12), 0.9);
      const sr = 7;
      for (let j = -sr; j <= sr; j++) for (let i = -sr; i <= sr; i++) {
        const d = Math.sqrt(i * i + j * j); if (d > sr + 0.4) continue;
        const y = Math.round(sunY + j), x = Math.round(sunX + i); if (y >= hy) continue;
        U[y * W + x] = px.ramp([hex('#ffd890'), hex('#fff0b8'), hex('#ffffff')], 1 - d / sr, x, y);
      }
    }
    /* ---- clouds (three bands, parallax; underside lit near the sun) */
    const pal = cloudPalette(dawn);
    const litX = new Uint8Array(W);
    for (let x = 0; x < W; x++) litX[x] = Math.min(5, (Math.exp(-Math.pow((x - sunX) / 190, 2)) * 5.99 * sunK) | 0);
    const camY = o.camY || 0;
    o.sunX = sunX; o.sunY = sunY; o.hole = 62 * sunK;
    drawClouds(S.cloudA, Math.round(hy * 0.1 + camY * 0.5), 0.14, 2.2 + o.wind * 8, o, pal, litX, o.cloudOffA);
    drawClouds(S.cloudB, Math.round(hy * 0.58 - 4 + camY * 0.2), 0.1, 1.7 + o.wind * 6, o, pal, litX, o.cloudOffB);
    /* ---- horizon colour used for haze + sea */
    const horizon = sky[n - 1], horizonDark = mix(sky[n - 3], hex('#070b1c'), 0.35);
    const sunWarm = mix(hex('#ffb060'), hex('#fff0c0'), dawn);
    /* ---- land: far islands, middle islands, Patmos */
    const ridgeCol = (k, base) => mix(mix(base, horizonDark, k), mix(base, hex('#16102a'), 0.4), dawn * 0.0);
    const rimCol = mix(hex('#6a7aa8'), hex('#ffc27a'), dawn);
    if (o.far !== false) drawRidge(S.far, o, 0.22, mix(horizonDark, horizon, 0.28), horizon, rimCol, sunX, 1, hy);
    if (o.mid !== false) drawRidge(S.mid, o, 0.42, mix(horizonDark, hex('#0a0e22'), 0.5), mix(horizonDark, horizon, 0.4), rimCol, sunX, 1, hy);
    if (o.patmos !== false) drawRidge(S.patmos, o, o.patmosPar || 0.62, mix(hex('#0a0d20'), hex('#1a1530'), dawn), mix(horizonDark, horizon, 0.3), rimCol, sunX, o.patmosScale || 1, hy);
    /* ---- sea */
    const seaFar = mix(horizonDark, horizon, 0.45), seaNear = mix(hex('#04081a'), hex('#101c3c'), dawn * 0.7);
    const wind = o.wind || 0, amp = o.amp || 1;
    const sunCol = mix(hex('#ffc078'), hex('#fff4d0'), 0.5);
    const cool = mix(sky[3], hex('#2a4a78'), 0.35), deepTeal = mix(hex('#06101f'), hex('#0e2a46'), dawn);
    for (let y = hy; y < H; y++) {
      const s = (y - hy) / (H - hy), sp = Math.pow(s, 0.6);
      const row = mix(mix(seaFar, cool, 0.35), mix(seaNear, deepTeal, 0.7), sp);
      const dark = mix(row, hex('#03060f'), 0.5), crest = mix(row, cool, 0.55 + 0.2 * (1 - s)), light = mix(row, cool, 0.25);
      const segLen = 6 + 70 * Math.pow(s, 1.1), spd = (0.9 + 5 * s) * (0.6 + wind * 1.8), spread = 12 + 100 * s;
      const gain = amp * 0.04 + wind * 0.2;
      for (let x = 0; x < W; x++) {
        const u = x + o.camX * (0.9 + s * 0.4) + t * spd * 3;
        const sg = Math.floor(u / segLen), within = u - sg * segLen;
        const h1 = hash(sg, y, 7), h2 = hash(sg, y, 8), h3 = hash(sg, y >> 1, 9);
        let c = row;
        const sd = (x - sunX) / spread, g = Math.exp(-sd * sd) * sunK * (1 - s * 0.25);
        const isCrest = h1 > 0.7 - gain && within < segLen * (0.25 + 0.5 * h2), isTrough = !isCrest && h3 > 0.72 && within < segLen * 0.6;
        if (isCrest) {
          c = crest;
          if (g > 0.18) c = mix(crest, sunCol, clamp(g * 1.25, 0, 1));
          if (wind > 0.4 && h2 < (wind - 0.4) * 0.8) c = mix(c, hex('#e8f0ff'), 0.75);
        } else if (isTrough) c = dark;
        else if (h1 > 0.5 && within < segLen * 0.5) { c = light; if (g > thr(x, y) * 1.1) c = mix(light, sunWarm, 0.7 * g); }
        else if (g > thr(x, y) * 1.4 + 0.12) c = mix(row, sunWarm, 0.55 * g);
        if (s < 0.06 && thr(x, y) > s * 14) c = mix(c, horizon, 0.5);
        U[y * W + x] = c;
      }
    }
    /* ---- light shafts */
    if (o.rays > 0.02) {
      const rc = hex('#ffd8a0'), yMax = Math.min(H, hy + 40);
      for (let y = 0; y < yMax; y++) for (let x = 0; x < W; x++) {
        const dx = x - sunX, dy = y - sunY, d = Math.sqrt(dx * dx + dy * dy) + 1;
        const ang = Math.atan2(dy, dx);
        const r = Math.pow(0.5 + 0.5 * Math.sin(ang * 9 + t * 0.12 + Math.sin(ang * 3.3) * 2), 3) * Math.exp(-d / 230) * o.rays;
        if (r > thr(x + 1, y) * 0.5 + 0.08) { const i = y * W + x; U[i] = mix(U[i], rc, 0.22); }
      }
    }
    return { sunX, sunY, horizon, sunK, sky };
  };

  /* wind streaks (small horizontal dashes blown across the frame) */
  lib.windStreaks = function (t, wind, col, yMin, yMax) {
    if (wind <= 0.05) return;
    const N = Math.floor(10 + wind * 90);
    for (let i = 0; i < N; i++) {
      const r1 = hash(i, 1, 31), r2 = hash(i, 2, 31), r3 = hash(i, 3, 31);
      const sp = 40 + r3 * 140 + wind * 120, len = 3 + ((r2 * 10) | 0) + ((wind * 8) | 0);
      const x = wrapi(W + 40 - ((t * sp + r1 * 1000) % (W + 80)), W + 80) - 20, y = yMin + ((r2 * 977) % 1) * (yMax - yMin) + Math.sin(t * 1.3 + i) * 1.5;
      for (let j = 0; j < len; j++) px.dpx(x + j | 0, y | 0, col, wind * (1 - j / len) * 0.9);
    }
  };

  /* ================================================================ CLIFF */
  let CL = null;
  function ensureCliff() {
    if (CL) return CL;
    const X0 = -300, X1 = 900, n = X1 - X0, gy = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const x = X0 + i;
      let y = 160 + 0.04 * (x - 150) + 5 * (px.fbm(x * 0.03, 4, 3, 3) - 0.5) * 2;
      if (x < 70) y -= (70 - x) * 0.14;
      if (x > 380) y += (x - 380) * 0.04;
      /* a few terraces */
      y = Math.round(y);
      gy[i] = y;
    }
    const rnd = px.rng(41), blades = [];
    for (let x = X0; x < X1; x += 1.4 + rnd() * 1.4) blades.push({ x, h: 3 + rnd() * 7, p: rnd() * 6.28, lit: rnd() > 0.82 });
    const fb = [];
    for (let x = -20; x < W + 20; x += 1 + rnd() * 1.6) fb.push({ x, h: 6 + rnd() * rnd() * 20, p: rnd() * 6.28, lit: rnd() > 0.9 });
    const rocks = [{ x: 40, r: 11 }, { x: 96, r: 6 }, { x: 250, r: 8 }, { x: 330, r: 5 }, { x: 405, r: 10 }, { x: -60, r: 14 }];
    CL = { X0, X1, gy, blades, fb, rocks };
    return CL;
  }
  lib.groundY = (wx) => { const C = ensureCliff(); const i = clamp(Math.round(wx - C.X0), 0, C.gy.length - 1); return C.gy[i]; };

  /* camera mapping for foreground: screen = pivot + (world - pivot)*z + offset */
  function mapper(c) { return { sx: (wx) => c.pX + (wx - c.pX) * c.z + c.ox, sy: (wy) => c.pY + (wy - c.pY) * c.z + c.oy, wx: (sx) => c.pX + (sx - c.ox - c.pX) / c.z }; }
  lib.camMap = mapper;

  /* ground + rocks (world->screen). c: {z,pX,pY,ox,oy}, l: {U,dawn,sunX,lit} */
  lib.cliffGround = function (c, l) {
    const C = ensureCliff(), M = mapper(c), U = l.U;
    const baseA = mix(hex('#06080f'), hex('#120f18'), l.dawn), baseB = mix(hex('#0a0d17'), hex('#1b1620'), l.dawn), baseC = mix(hex('#04060b'), hex('#0b0a10'), l.dawn);
    const rim = mix(hex('#52689a'), hex('#ffb870'), l.dawn), lit = l.lit;
    for (let x = 0; x < W; x++) {
      const wx = M.wx(x + 0.5), wi = clamp(Math.round(wx - C.X0), 1, C.gy.length - 2);
      const top = Math.round(M.sy(C.gy[wi]));
      const slope = C.gy[wi] - C.gy[wi + 1];
      const facing = (l.sunX > x ? clamp(slope * 0.7 + 0.45, 0, 1) : clamp(-slope * 0.7 + 0.45, 0, 1));
      for (let y = Math.max(0, top); y < H; y++) {
        const dep = y - top, h = hash((wx * 0.6) | 0, (y * 0.6) | 0, 6);
        let col = h < 0.08 ? baseC : h > 0.88 ? baseB : baseA;
        if (dep < 14 && h > 0.7 - (14 - dep) * 0.02) col = baseB;
        if (dep === 0) col = mix(col, rim, clamp(lit * (0.35 + 0.65 * facing), 0, 1));
        else if (dep === 1 && lit * facing > thr(x, y)) col = mix(col, rim, 0.5);
        else if (dep === 2 && lit * facing > thr(x, y) + 0.45) col = mix(col, rim, 0.3);
        U[y * W + x] = col;
      }
    }
    /* boulders: irregular chunks with one lit facet */
    for (const rk of C.rocks) {
      const gx = rk.x, gyv = lib.groundY(gx), cx = M.sx(gx), cy = M.sy(gyv) + 2, r = rk.r * c.z;
      if (cx + r * 1.5 < 0 || cx - r * 1.5 > W) continue;
      for (let j = -r * 1.1; j <= 2; j++) for (let i = -r * 1.5; i <= r * 1.5; i++) {
        const nx = i / (r * 1.4), ny = (j + r * 0.45) / (r * 0.8);
        const edge = 1 - 0.18 * hash(Math.round(i / 2), rk.x, 11) - 0.12 * Math.sin(nx * 5 + rk.x);
        if (nx * nx + ny * ny > edge) continue;
        const X = Math.round(cx + i), Y = Math.round(cy + j); if (X < 0 || X >= W || Y < 0 || Y >= H) continue;
        let col = hash(X >> 1, Y >> 1, 12) > 0.8 ? baseC : baseB;
        const toSun = (l.sunX > cx) ? nx : -nx;
        if (toSun > 0.45 - ny * 0.2 && ny < 0.2) col = mix(col, rim, clamp(lit, 0, 1) * 0.55 * (toSun - 0.3 + 0.4));
        if (nx * nx + ny * ny > edge * 0.82 && toSun > 0.2 && lit * 1.2 > thr(X, Y)) col = mix(col, rim, clamp(lit, 0, 1) * 0.8);
        U[Y * W + X] = col;
      }
    }
  };

  /* grass blades. which: 'edge' (small tufts on the ground edge) | 'front' (big fringe along the bottom) */
  lib.grass = function (c, l, which, t, wind) {
    const C = ensureCliff(), M = mapper(c), U = l.U;
    const dark = mix(hex('#03050a'), hex('#0a0a10'), l.dawn), tip = mix(hex('#3a4a6a'), hex('#ffc070'), l.dawn);
    const list = which === 'edge' ? C.blades : C.fb;
    for (const b of list) {
      let x0, y0, h;
      if (which === 'edge') { x0 = M.sx(b.x); y0 = M.sy(lib.groundY(b.x)) + 1; h = b.h * c.z; }
      else { x0 = b.x; y0 = H; h = b.h * (0.75 + 0.35 * c.z); }
      if (x0 < -4 || x0 > W + 4) continue;
      const sway = (Math.sin(t * (1.1 + wind * 3) + b.p + x0 * 0.04) * (0.6 + wind * 3.2) - wind * 2.2) * 0.32;
      for (let j = 0; j < h; j++) {
        const k = j / h, xx = Math.round(x0 + Math.max(-4, Math.min(4, sway * k * k * h * 0.4))), yy = Math.round(y0 - j);
        if (yy < 0 || yy >= H || xx < 0 || xx >= W) continue;
        const tipLit = (j >= h - 1.5 && b.lit && l.lit > 0.2);
        const col = tipLit ? mix(dark, tip, clamp(l.lit, 0, 1)) : dark;
        U[yy * W + xx] = col;
        if (k < 0.55 && h > 6) U[yy * W + Math.min(W - 1, xx + 1)] = dark;     /* thicker base, tapering tip */
      }
    }
  };

  /* ================================================================ JOHN */
  /* An elderly man in a simple robe, seen from behind. o: {x,y(feet),h,t,wind,sunX,lit,dawn,U} */
  const JK = [[0, 0.0], [0.012, 0.035], [0.04, 0.066], [0.085, 0.076], [0.13, 0.066], [0.158, 0.046], [0.185, 0.05], [0.215, 0.105], [0.255, 0.158], [0.3, 0.184], [0.46, 0.192], [0.62, 0.205], [0.8, 0.238], [1.0, 0.275]];
  const jw = (u) => { for (let i = 1; i < JK.length; i++) if (u <= JK[i][0]) { const a = JK[i - 1], b = JK[i], k = (u - a[0]) / (b[0] - a[0]); return a[1] + (b[1] - a[1]) * k; } return JK[JK.length - 1][1]; };
  lib.john = function (o) {
    const U = o.U, h = o.h, cx = o.x, t = o.t, wind = o.wind || 0, lit = clamp(o.lit, 0, 1), dawn = o.dawn;
    const side = o.sunX > cx ? 1 : -1;
    const robeA = mix(hex('#0a0c16'), hex('#1a1424'), dawn * 0.7), robeB = mix(hex('#121626'), hex('#261c32'), dawn * 0.7), robeF = mix(hex('#05060c'), hex('#0e0a14'), dawn * 0.6);
    const rim = mix(hex('#6a7aa8'), hex('#ffb468'), dawn), rimHot = mix(hex('#9aaad0'), hex('#ffe4a8'), dawn);
    const hairA = mix(hex('#3c4460'), hex('#8a8aa0'), 0.3 + 0.7 * dawn), hairB = mix(hex('#262c48'), hex('#58566e'), 0.3 + 0.7 * dawn), hairC = mix(hex('#141830'), hex('#34324a'), 0.3 + 0.7 * dawn);
    const top = o.y - h;
    const lean = -side * wind;
    for (let j = 0; j <= h; j++) {
      const u = j / h, y = Math.round(top + j), isHead = u < 0.16;
      const flutter = (Math.sin(t * (2.2 + wind * 4) + u * 6) * 0.5 + 0.5) * wind * u * u * 0.11 * h;
      const shift = lean * (0.015 * u * u + 0.09 * Math.pow(u, 3)) * h + (u > 0.55 ? -side * flutter : 0) + (isHead ? lean * 0.02 * h : 0);
      const wdt = jw(u) * h;
      const xl = Math.round(cx - wdt + shift), xr = Math.round(cx + wdt + shift - 0.001);
      for (let x = xl; x <= xr; x++) {
        if (x < 0 || x >= W || y < 0 || y >= H) continue;
        let col;
        const fx = (x - cx) / Math.max(1, wdt);
        if (isHead) { col = fx * -side > 0.2 ? hairC : hash(x, y, 8) > 0.6 ? hairA : hairB; if (u < 0.05) col = hairA; }
        else if (u < 0.27 && Math.abs(fx) < 0.5 + (u - 0.15) * 0.2) { col = hash(x, y >> 1, 9) > 0.62 ? hairA : (fx * side > 0 ? hairB : hairC); if (u > 0.2 && (x + y) % 3 === 0) col = hairC; }  /* long hair down the back */
        else {
          const fold = Math.sin(((x - cx) / h) * 40 + u * 1.6 + wind * Math.sin(t * 2 + u * 3));
          col = fold > 0.7 ? robeB : fold < -0.78 ? robeF : robeA;
          if (u > 0.44 && u < 0.475) col = robeF;                            /* a simple cord at the waist */
        }
        const dEdge = side > 0 ? xr - x : x - xl;
        if (dEdge === 0) col = mix(col, isHead ? rimHot : rim, clamp(0.4 + lit * 0.6, 0, 1));
        else if (dEdge === 1 && lit > thr(x, y) + 0.1) col = mix(col, rim, 0.55);
        else if (dEdge === 2 && lit > thr(x, y) + 0.55) col = mix(col, rim, 0.3);
        U[y * W + x] = col;
      }
      if (u > 0.03 && u < 0.27 && wind > 0.12) {          /* hair streaming away from the sun */
        const len = Math.round(wind * 0.2 * h * (0.4 + 0.6 * Math.sin(t * 4.3 + j * 1.1) * 0.5 + 0.3) + wind * 2);
        const edge = side > 0 ? xl : xr;
        for (let k = 1; k <= len; k++) { const x = edge - side * k; if (hash(x, j, 5) > 0.2 + (k / len) * 0.45) px.set(x, y + ((k * 0.3) | 0), k > len * 0.55 ? hairB : hairA); }
      }
    }
    /* arms: dark seams where the sleeves hang (readable from behind) */
    for (let j = Math.round(h * 0.28); j < h * 0.6; j++) {
      const y = Math.round(top + j), u = j / h, w = jw(u) * h, shift = lean * (0.015 * u * u + 0.09 * Math.pow(u, 3)) * h;
      px.set(Math.round(cx - w * 0.58 + shift), y, robeF); px.set(Math.round(cx + w * 0.58 + shift), y, robeF);
    }
  };

  /* =========================================================== STUDIO MARK */
  lib.studioMark = function (cx, cy, k, t) {
    const gold = hex('#ffd48a'), white = hex('#f4f0ff'), blue = hex('#8aa8ff');
    const pulse = 0.5 + 0.5 * Math.sin(t * 2.2);
    if (k <= 0.02) return;
    const rings = [[7 + pulse * 1.2, white], [14 + pulse * 1.6, gold], [21 + pulse * 2, blue]];
    rings.forEach(([r, c], i) => { for (let a = 0; a < 360; a += 1.2) { const rad = a * Math.PI / 180; px.dpx(Math.round(cx + Math.cos(rad) * r), Math.round(cy + Math.sin(rad) * r), c, k * (0.55 + 0.45 * Math.sin(t * 2 + i))); } });
    px.disc(cx, cy, 2, white);
  };

  /* ============================================================================
   *  EPISODE 2 ADDITIONS · Grace and Peace
   *  halo (soft dithered glow that keeps what is underneath), flame (one of the
   *  seven lamps), cities (seven far silhouettes), cloudMass (lit cloud sprites),
   *  glory (light breaking through), seaGlow, glyph (Alpha / Omega made of
   *  stars), motes (drifting light)
   * ========================================================================== */

  /* soft dithered halo: tints what is already there toward `col` (centre strongest). strength 0..1 */
  lib.halo = function (cx, cy, r, col, strength, sy) {
    if (strength <= 0.01 || r < 1) return;
    sy = sy || 1;
    const U = px.cur();
    const x0 = Math.max(0, Math.floor(cx - r)), x1 = Math.min(W - 1, Math.ceil(cx + r));
    const y0 = Math.max(0, Math.floor(cy - r * sy)), y1 = Math.min(H - 1, Math.ceil(cy + r * sy));
    for (let y = y0; y <= y1; y++) {
      const dy = (y - cy) / (r * sy);
      for (let x = x0; x <= x1; x++) {
        const dx = (x - cx) / r, d2 = dx * dx + dy * dy;
        if (d2 >= 1) continue;
        const a = Math.pow(1 - d2, 1.7) * strength;
        const q = Math.floor(a * 4 + thr(x, y));
        if (q <= 0) continue;
        const i = y * W + x;
        U[i] = mix(U[i], col, Math.min(1, q * 0.22));
      }
    }
  };

  /* ---------------------------------------------------------------- FLAME
   * One of the seven lamps. o: {x, y (centre), k (lit 0..1), pop (0..1 flash), t, seed, s (size), glow (0..1)} */
  const FL = { core: hex('#fffbe8'), mid: hex('#ffe58a'), out: hex('#ffa63c'), edge: hex('#c4672a'), halo: hex('#ffc060'), halo2: hex('#ffe9b0') };
  lib.flame = function (o) {
    const k = o.k; if (k <= 0.004) return;
    const t = o.t, s = o.s || 1, seed = o.seed || 0, pop = o.pop || 0, glow = o.glow === undefined ? 1 : o.glow;
    const flick = 0.9 + 0.1 * Math.sin(t * 7.3 + seed * 3.1) * Math.sin(t * 3.7 + seed);
    const cx = Math.round(o.x), cy = Math.round(o.y);
    /* halo first, so the flame sits inside it */
    lib.halo(cx, cy, (13 + 14 * pop) * s * glow * (0.5 + 0.5 * k), FL.halo, 0.62 * k * flick);
    lib.halo(cx, cy, (6 + 7 * pop) * s * glow * (0.5 + 0.5 * k), FL.halo2, 0.75 * k);
    /* body: a teardrop, narrow tip, round belly */
    const Hf = Math.max(2, Math.round((8 + 3 * pop) * s * (0.35 + 0.65 * k) * flick)), wmax = Math.max(1, (2.3 + 0.6 * pop) * s * 0.9);
    const top = cy - Math.round(Hf * 0.55);
    for (let j = 0; j < Hf; j++) {
      const u = j / Math.max(1, Hf - 1);
      const hw = u < 0.68 ? wmax * Math.pow(u / 0.68, 1.35) : wmax * Math.sqrt(Math.max(0, 1 - Math.pow((u - 0.68) / 0.34, 2)));
      const sway = Math.sin(t * 5.2 + seed + u * 2.4) * (1 - u) * 0.9 * s;
      const y = top + j, n = Math.round(hw);
      for (let i = -n; i <= n; i++) {
        const ad = Math.abs(i) / Math.max(0.6, hw);
        let c = ad < 0.34 && u > 0.3 ? FL.core : ad < 0.7 && u > 0.12 ? FL.mid : FL.out;
        if (ad > 0.88 || u < 0.08 || u > 0.97) c = FL.edge;
        if (u > 0.55 && ad < 0.6) c = ad < 0.3 ? FL.core : FL.mid;
        px.set(cx + i + Math.round(sway), y, c);
      }
    }
    /* four-point sparkle on ignition */
    if (pop > 0.04) {
      const L = Math.round(4 + 13 * pop * s);
      for (let d = 1; d <= L; d++) {
        const a = Math.pow(1 - d / L, 1.5) * pop;
        px.dpx(cx + d, cy, FL.halo2, a); px.dpx(cx - d, cy, FL.halo2, a);
        px.dpx(cx, cy + d, FL.halo2, a * 0.8); px.dpx(cx, cy - d, FL.halo2, a * 0.8);
      }
    }
  };
  /* its reflection glinting on the sea below the horizon */
  lib.lampGlint = function (x, hy, k, t, seed, len) {
    if (k <= 0.02) return;
    len = len || 26; x = Math.round(x);
    for (let j = 2; j < len; j++) {
      const y = Math.round(hy + j), sp = hash(j, (t * 3 + seed * 5) | 0, seed + 3);
      if (sp < 0.38 + 0.2 * (j / len)) continue;
      const w = 1 + ((hash(j, seed, 17) * 2.4 * (0.4 + j / len)) | 0), off = Math.round(Math.sin(t * 2.1 + j * 0.9 + seed) * (0.5 + j * 0.07));
      for (let i = -w; i <= w; i++) px.dpx(x + off + i, y, i === 0 ? hex('#fff0c0') : hex('#ffc060'), k * (1 - j / len) * 0.95);
    }
  };

  /* -------------------------------------------------------------- CITIES
   * Seven small far-off silhouettes standing on the horizon, one per assembly of Asia.
   * Masks: 1 = body, 2 = window (amber once its lamp is lit), 3 = open door of light, 4 = forge glow */
  let CITYS = null;
  function ensureCities() {
    if (CITYS) return CITYS;
    const CW = 60, CH = 28, BASE = CH - 1, Cs = [];
    const mk = (name, haze) => ({ name, haze: haze || 0, w: CW, h: CH, m: new Uint8Array(CW * CH), chim: [] });
    const box = (c, x, w, z0, hh, v) => { for (let j = 0; j < hh; j++) for (let i = 0; i < w; i++) { const X = x + i, Y = BASE - z0 - j; if (X >= 0 && X < CW && Y >= 0 && Y < CH) c.m[Y * CW + X] = v === undefined ? 1 : v; } };
    const tri = (c, cx, z0, hw, hh) => { for (let j = 0; j < hh; j++) { const w = Math.round(hw * (1 - j / hh)); for (let i = -w; i <= w; i++) { const X = cx + i, Y = BASE - z0 - j; if (X >= 0 && X < CW && Y >= 0) c.m[Y * CW + X] = 1; } } };
    const hill = (c, fn) => { for (let x = 0; x < CW; x++) box(c, x, 1, 0, Math.max(0, Math.round(fn(x)))); };
    /* 0 · Ephesus: the great temple, a long row of columns */
    { const c = mk('Ephesus'); hill(c, (x) => (x < 3 || x > 56 ? 1 : 2.4));
      for (let i = 0; i < 9; i++) box(c, 14 + i * 3, 1, 2, 9);
      box(c, 12, 29, 11, 2); tri(c, 26, 13, 14, 4); box(c, 3, 8, 2, 5); box(c, 47, 9, 2, 4);
      box(c, 5, 1, 3, 1, 2); box(c, 8, 1, 3, 1, 2); box(c, 50, 1, 3, 1, 2); Cs.push(c); }
    /* 1 · Smyrna: a harbour town on a hill, masts at the quay */
    { const c = mk('Smyrna'); const hf = (x) => (x < 38 ? 2 + 9 * Math.sin(Math.PI * x / 40) : 2);
      hill(c, hf);
      [[5, 5, 3], [11, 6, 4], [19, 5, 3], [26, 7, 4], [33, 4, 3]].forEach(([x, w, hh], n) => { box(c, x, w, Math.round(hf(x + w / 2)) - 1, hh); box(c, x + 2, 1, Math.round(hf(x + w / 2)) + 1, 1, 2); });
      box(c, 41, 15, 2, 2); box(c, 44, 1, 3, 16); box(c, 51, 1, 3, 12); box(c, 42, 5, 14, 1); box(c, 49, 5, 11, 1); tri(c, 46, 6, 1, 6); Cs.push(c); }
    /* 2 · Pergamum: the acropolis, a temple on the high rock */
    { const c = mk('Pergamum'); const hf = (x) => 3 + 15 * Math.exp(-Math.pow((x - 29) / 13, 2));
      hill(c, hf); const top = Math.round(hf(29)) - 1;
      for (let i = 0; i < 6; i++) box(c, 21 + i * 3, 1, top, 6);
      box(c, 20, 17, top + 6, 1); tri(c, 28, top + 7, 9, 3); box(c, 9, 9, 3, 4); box(c, 43, 8, 3, 3); box(c, 12, 1, 4, 1, 2); box(c, 46, 1, 4, 1, 2); Cs.push(c); }
    /* 3 · Thyatira: the forge-city, chimneys and a furnace glow */
    { const c = mk('Thyatira'); hill(c, () => 2);
      [[2, 8, 5], [11, 7, 8], [19, 9, 4], [29, 6, 9], [36, 8, 5], [45, 10, 6]].forEach(([x, w, hh]) => box(c, x, w, 2, hh));
      box(c, 14, 2, 10, 6); box(c, 32, 2, 11, 7); c.chim.push([15, BASE - 15], [33, BASE - 17]);
      box(c, 5, 1, 4, 1, 2); box(c, 22, 1, 4, 1, 2); box(c, 39, 2, 4, 1, 2); box(c, 13, 2, 3, 2, 4); box(c, 30, 2, 3, 2, 4); box(c, 48, 3, 3, 1, 4); Cs.push(c); }
    /* 4 · Sardis: a faded, hollow city of broken columns */
    { const c = mk('Sardis', 0.3); hill(c, (x) => 1 + (x > 8 && x < 50 ? 1.2 : 0) + 1.5 * Math.sin(x * 0.6) * 0);
      [[9, 11], [14, 6], [19, 13], [25, 8], [31, 12], [37, 5], [43, 9]].forEach(([x, hh]) => { box(c, x, 2, 2, hh); if (hh > 8) box(c, x, 1, 2 + hh, 1); });
      box(c, 19, 8, 15, 1); box(c, 9, 10, 13, 1); box(c, 49, 7, 2, 2); box(c, 16, 2, 2, 1, 0); box(c, 33, 1, 8, 2, 0); Cs.push(c); }
    /* 5 · Philadelphia: a small town beneath a great open doorway of light */
    { const c = mk('Philadelphia'); hill(c, () => 2);
      box(c, 4, 52, 2, 9); box(c, 2, 6, 2, 13); box(c, 52, 6, 2, 13);
      box(c, 25, 10, 2, 8, 3); box(c, 26, 8, 10, 1, 3); box(c, 27, 6, 11, 1, 3); box(c, 28, 4, 12, 1, 3);
      box(c, 11, 1, 6, 1, 2); box(c, 17, 1, 6, 1, 2); box(c, 43, 1, 6, 1, 2); box(c, 48, 1, 6, 1, 2); Cs.push(c); }
    /* 6 · Laodicea: aqueduct arches and a golden dome (a wealthy, polished city) */
    { const c = mk('Laodicea'); hill(c, () => 2);
      for (let i = 0; i < 6; i++) box(c, 3 + i * 8, 3, 2, 8);
      box(c, 3, 43, 10, 2);
      for (let i = 0; i < 5; i++) { box(c, 6 + i * 8, 5, 2, 7, 0); box(c, 7 + i * 8, 3, 9, 1, 0); }
      box(c, 48, 9, 2, 9); for (let j = 0; j < 5; j++) { const w = Math.round(Math.sqrt(25 - j * j * 1.0)); box(c, 52 - w, w * 2, 11 + j, 1); }
      box(c, 52, 1, 17, 3); box(c, 50, 1, 5, 1, 2); box(c, 54, 1, 5, 1, 2); Cs.push(c); }
    CITYS = Cs; return Cs;
  }
  lib.cityCount = 7;
  /* o: {xs[7], hy, lit[7], t, col, rim, hazeCol, sunX, amber} */
  lib.cities = function (o) {
    const Cs = ensureCities(), U = px.cur(), amber = o.amber || hex('#ffb85a'), door = hex('#ffd890'), forge = hex('#ff7a28');
    for (let ci = 0; ci < Cs.length; ci++) {
      const c = Cs[ci], cx = Math.round(o.xs[ci]), ca = o.a === undefined ? 1 : o.a;
      if (cx < -40 || cx > W + 40 || ca <= 0.01) continue;
      const x0 = cx - (c.w >> 1), y0 = Math.round(o.hy) - (c.h - 1), side = o.sunX > cx ? 1 : -1, lit = o.lit ? o.lit[ci] : 0;
      const col = mix(o.col, o.hazeCol, c.haze), rim = mix(o.rim, o.hazeCol, c.haze * 0.5);
      for (let j = 0; j < c.h; j++) for (let i = 0; i < c.w; i++) {
        const v = c.m[j * c.w + i]; if (!v) continue;
        const X = x0 + i, Y = y0 + j; if (X < 0 || X >= W || Y < 0 || Y >= H) continue;
        if (ca < 1 && ca <= thr(X, Y)) continue;
        let q = col;
        if (v === 1) {
          const up = j > 0 ? c.m[(j - 1) * c.w + i] : 0, ni = i + side, sd = ni >= 0 && ni < c.w ? c.m[j * c.w + ni] : 0;
          if (!up) q = mix(col, rim, 0.6); else if (!sd) q = mix(col, rim, 0.4);
        } else if (v === 2) q = lit > 0.05 ? mix(col, amber, clamp(lit * 1.15, 0, 1)) : col;
        else if (v === 3) q = mix(col, door, 0.25 + 0.75 * lit);
        else if (v === 4) q = mix(col, forge, 0.45 + 0.35 * Math.sin(o.t * 6 + i));
        U[Y * W + X] = q;
      }
      /* Thyatira's chimney smoke drifting downwind */
      for (const ch of c.chim) for (let p = 0; p < 7; p++) {
        const ph = ((o.t * 0.7 + p / 7) % 1), sx = x0 + ch[0] + ph * 16, sy = y0 + ch[1] - ph * 8;
        px.dpx(Math.round(sx), Math.round(sy), mix(o.hazeCol, col, 0.35), 0.6 * (1 - ph));
      }
    }
  };

  /* ---------------------------------------------------------- CLOUD MASSES
   * Stand-alone cumulus sprites, shaded per pixel from a light source: edges that face
   * the light catch it. Built once from layered puffs + noise. */
  let CMS = null;
  function ensureCloudSprites() {
    if (CMS) return CMS;
    const defs = [[176, 34, 3], [150, 29, 9], [196, 38, 17], [132, 27, 25], [164, 35, 31], [184, 31, 41]];
    CMS = defs.map(([w, h, seed]) => {
      /* ragged, wide strata: many small puffs along a flat base, bigger toward the middle */
      const rnd = px.rng(seed * 77 + 1), puffs = [], B = h * 0.84;
      const n = 13 + ((rnd() * 4) | 0);
      for (let i = 0; i < n; i++) {
        const u = (i + 0.5) / n, cxp = w * (0.06 + 0.88 * u + (rnd() - 0.5) * 0.05), mid = 1 - Math.abs(u - 0.5) * 2;
        const r = h * (0.13 + 0.17 * mid * (0.5 + 0.5 * rnd()) + 0.06 * rnd());
        puffs.push([cxp, B - r * (0.45 + 0.5 * rnd()), r]);
      }
      const d = new Float32Array(w * h), m = new Uint8Array(w * h);
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        let v = 0; for (const [cx_, cy_, r] of puffs) { const dx = x - cx_, dy = y - cy_; v += (r * r) / (dx * dx * 0.62 + dy * dy * 1.35 + 1); }
        v = v * 0.5 + (px.fbm(x * 0.15 + seed, y * 0.2, 3, seed) - 0.5) * 0.42;
        if (y > B) v *= sstep(B + 3.5, B, y + (hash(x >> 1, seed, 4) - 0.5) * 3);   /* flat, slightly torn underside */
        d[y * w + x] = v; m[y * w + x] = v > 0.5 ? 1 : 0;
      }
      const nx = new Int8Array(w * h), ny = new Int8Array(w * h), dep = new Uint8Array(w * h);
      const D = (x, y) => d[clamp(y, 0, h - 1) * w + clamp(x, 0, w - 1)];
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const i = y * w + x; if (!m[i]) continue;
        let gx = D(x + 2, y) - D(x - 2, y), gy = D(x, y + 2) - D(x, y - 2); const L = Math.hypot(gx, gy) + 1e-4;
        nx[i] = Math.round(-gx / L * 100); ny[i] = Math.round(-gy / L * 100);
        dep[i] = Math.round(clamp((d[i] - 0.5) / 0.4, 0, 1) * 255);
      }
      return { w, h, m, nx, ny, dep };
    });
    return CMS;
  }
  const CLOUD_PAL = hexes(['#07061a', '#120c2a', '#241638', '#4a2646', '#84405a', '#c0605c', '#f0925e', '#ffcc84', '#fff2c8']);
  /* o: {spr, x, y (centre), flip, lx, ly (light), k (light strength 0..1), tone (0..1 brightness), a (0..1 opacity), haze (colour or 0)} */
  lib.cloud = function (o) {
    const S = ensureCloudSprites()[o.spr % 6], U = px.cur(), w = S.w, h = S.h;
    const x0 = Math.round(o.x - w / 2), y0 = Math.round(o.y - h / 2);
    if (x0 > W || x0 + w < 0 || y0 > H || y0 + h < 0) return;
    let lx = o.lx - o.x, ly = o.ly - o.y; const ll = Math.hypot(lx, ly) + 1e-3; lx /= ll; ly /= ll;
    const prox = Math.exp(-ll / 200), k = o.k, tone = o.tone === undefined ? 1 : o.tone, a = o.a === undefined ? 1 : o.a, flip = o.flip;
    for (let j = 0; j < h; j++) {
      const Y = y0 + j; if (Y < 0 || Y >= H) continue;
      for (let i = 0; i < w; i++) {
        const si = j * w + (flip ? w - 1 - i : i); if (!S.m[si]) continue;
        const X = x0 + i; if (X < 0 || X >= W) continue;
        if (a < 1 && a <= thr(X, Y)) continue;
        const nxv = (flip ? -S.nx[si] : S.nx[si]) / 100, nyv = S.ny[si] / 100, dep = S.dep[si] / 255;
        const lam = Math.max(0, nxv * lx + nyv * ly);
        let s = 0.1 + 0.09 * (1 - dep) + k * (0.95 * lam * (0.45 + 0.55 * (1 - dep * 0.8)) + 0.3 * prox * (1 - dep * 0.6)) * tone;
        U[Y * W + X] = px.ramp(CLOUD_PAL, s < 0 ? 0 : s > 1 ? 1 : s, X, Y);
      }
    }
  };

  /* ---------------------------------------------------------------- GLORY
   * Light breaking through the clouds: warm beams, layered halos and a column of light.
   * o: {cx, cy, k (0..1), t, hy, rays (0..1)} */
  lib.glory = function (o) {
    const k = o.k; if (k <= 0.01) return;
    const U = px.cur(), cx = o.cx, cy = o.cy, hy = o.hy | 0, t = o.t, rc = hex('#ffd890'), rays = o.rays === undefined ? 1 : o.rays;
    /* beams */
    const R = 250 * (0.45 + 0.55 * k), x0 = Math.max(0, Math.floor(cx - R)), x1 = Math.min(W - 1, Math.ceil(cx + R)), y0 = Math.max(0, Math.floor(cy - R)), y1 = Math.min(hy, Math.ceil(cy + R));
    for (let y = y0; y < y1; y++) for (let x = x0; x <= x1; x++) {
      const dx = x - cx, dy = y - cy, d = Math.sqrt(dx * dx + dy * dy) + 1; if (d > R) continue;
      const ang = Math.atan2(dy, dx), b0 = 0.5 + 0.5 * Math.sin(ang * 10 + t * 0.12 + Math.sin(ang * 3.3) * 1.9);
      const a = b0 * b0 * b0 * Math.exp(-d / 125) * k * rays;
      if (a > thr(x + 1, y) * 0.6 + 0.07) { const i = y * W + x; U[i] = mix(U[i], rc, a > 0.34 ? 0.32 : 0.19); }
    }
    lib.halo(cx, cy, 175 * k, hex('#ff9a48'), 0.5 * k, 0.8);
    lib.halo(cx, cy, 108 * k, hex('#ffc870'), 0.72 * k, 0.85);
    lib.halo(cx, cy, 58 * k, hex('#fff0c0'), 0.86 * k);
    lib.halo(cx, cy, 24 * k, hex('#ffffff'), 1.0 * k);
    /* the column of light falling to the sea */
    const pale = hex('#fff0c0');
    for (let y = Math.max(0, cy | 0); y < hy; y++) {
      const v = (y - cy) / Math.max(1, hy - cy), hw = 7 + 16 * k + v * 12;
      for (let x = Math.floor(cx - hw * 1.7); x <= cx + hw * 1.7; x++) {
        const dx = (x - cx) / hw, a = Math.exp(-dx * dx) * k * 0.62 * (1 - 0.45 * v), q = Math.floor(a * 3 + thr(x, y));
        if (q > 0 && x >= 0 && x < W) { const i = y * W + x; U[i] = mix(U[i], pale, q * 0.2); }
      }
    }
  };
  /* the light's reflection: a shimmering road across the sea */
  lib.seaGlow = function (cx, hy, k, t) {
    if (k <= 0.02) return;
    const c1 = hex('#fff6d0'), c2 = hex('#ffd070'), c3 = hex('#ff9a48');
    for (let y = hy | 0; y < H; y++) {
      const s = (y - hy) / (H - hy), hw = 16 + 60 * s, segLen = 6 + 40 * s, sp = (0.9 + 4 * s) * 3;
      for (let x = Math.floor(cx - hw * 1.5); x <= cx + hw * 1.5; x++) {
        if (x < 0 || x >= W) continue;
        const dx = (x - cx) / hw, g = Math.exp(-dx * dx) * k, u = x + t * sp, sg = Math.floor(u / segLen), within = u - sg * segLen;
        const h1 = hash(sg, y, 61), on = h1 > 0.34 && within < segLen * (0.3 + 0.55 * hash(sg, y, 62));
        if (!on) { if (g > 0.55 && thr(x, y) < g - 0.5) px.blend(x, y, c3, 0.35); continue; }
        px.blend(x, y, g > 0.7 ? c1 : g > 0.4 ? c2 : c3, clamp(g * 1.2, 0, 0.92));
      }
    }
  };

  /* ---------------------------------------------------------- ALPHA & OMEGA
   * Big Greek capitals formed from stars. Bitmaps are drawn once from thick line segments. */
  let GLY = null;
  function ensureGlyphs() {
    if (GLY) return GLY;
    const seg = (m, w, x0, y0, x1, y1, th) => {
      const dx = x1 - x0, dy = y1 - y0, L2 = dx * dx + dy * dy;
      for (let y = 0; y < m.h; y++) for (let x = 0; x < w; x++) {
        let u = clamp(((x - x0) * dx + (y - y0) * dy) / L2, 0, 1); const px_ = x0 + u * dx, py_ = y0 + u * dy;
        if (Math.hypot(x - px_, y - py_) <= th / 2) m.a[y * w + x] = 1;
      }
    };
    /* ALPHA 26 x 30 */
    const A = { w: 26, h: 30, a: new Uint8Array(26 * 30) };
    seg(A, 26, 12.5, 1.5, 2.5, 28.5, 3.6); seg(A, 26, 13.5, 1.5, 23.5, 28.5, 3.6); seg(A, 26, 6.6, 19, 19.4, 19, 2.9);
    seg(A, 26, 1, 28.5, 5.5, 28.5, 2.6); seg(A, 26, 20.5, 28.5, 25, 28.5, 2.6);
    /* OMEGA 30 x 30 */
    const O = { w: 30, h: 30, a: new Uint8Array(30 * 30) };
    for (let y = 0; y < 30; y++) for (let x = 0; x < 30; x++) { const r = Math.hypot(x - 14.5, y - 13), ang = Math.atan2(y - 13, x - 14.5); if (r >= 9.6 && r <= 13.2 && !(ang > 0.62 && ang < Math.PI - 0.62)) O.a[y * 30 + x] = 1; }
    seg(O, 30, 6.6, 21.6, 6.2, 27.8, 3.4); seg(O, 30, 22.4, 21.6, 22.8, 27.8, 3.4);
    seg(O, 30, 1, 28.4, 8.6, 28.4, 2.8); seg(O, 30, 20.4, 28.4, 28, 28.4, 2.8);
    GLY = { alpha: A, omega: O };
    /* edge flags + a random home for every cell */
    for (const g of [A, O]) { g.edge = new Uint8Array(g.w * g.h); for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) if (g.a[y * g.w + x]) { const n = (xx, yy) => (xx >= 0 && yy >= 0 && xx < g.w && yy < g.h ? g.a[yy * g.w + xx] : 0); g.edge[y * g.w + x] = n(x - 1, y) && n(x + 1, y) && n(x, y - 1) && n(x, y + 1) ? 0 : 1; } }
    return GLY;
  }
  /* which: 'alpha' | 'omega'. o: {cx, cy, reveal 0..1, t, bright 0..1, sc (cell size)} */
  lib.glyph = function (which, o) {
    const G = ensureGlyphs()[which], p = o.reveal; if (p <= 0.001) return;
    const t = o.t, sc = o.sc || 2, br = o.bright === undefined ? 1 : o.bright, seed = which === 'alpha' ? 3 : 9;
    const cx = o.cx - (G.w * sc) / 2, cy = o.cy - (G.h * sc) / 2;
    const gold = hex('#ffd070'), pale = hex('#fff0c0'), white = hex('#ffffff'), warm = hex('#ffb04a');
    lib.halo(o.cx, o.cy, 44 * sc / 2 * (0.4 + 0.6 * p), warm, 0.5 * p * br);
    lib.halo(o.cx, o.cy, 26 * sc / 2 * (0.4 + 0.6 * p), pale, 0.4 * p * br);
    for (let j = 0; j < G.h; j++) for (let i = 0; i < G.w; i++) {
      const gi = j * G.w + i; if (!G.a[gi]) continue;
      const born = hash(i, j, seed) * 0.55, local = clamp((p - born) / 0.45, 0, 1); if (local <= 0) continue;
      const settle = 1 - Math.pow(1 - local, 3), ox = (hash(i, j, seed + 1) - 0.5) * 70 * (1 - settle), oy = (hash(i, j, seed + 2) - 0.5) * 46 * (1 - settle) - 14 * (1 - settle);
      const X = Math.round(cx + i * sc + ox), Y = Math.round(cy + j * sc + oy);
      const tw = 0.5 + 0.5 * Math.sin(t * 2.4 + hash(i, j, seed + 3) * 6.28);
      let c = G.edge[gi] ? gold : pale; if (tw > 0.93) c = white; else if (tw < 0.12 && !G.edge[gi]) c = gold;
      if (local < 0.55) { px.set(X, Y, tw > 0.4 ? white : pale); continue; }
      const s2 = sc >= 2 ? 2 : 1;
      for (let b = 0; b < s2; b++) for (let a = 0; a < s2; a++) { if (br < 1 && br <= thr(X + a, Y + b)) continue; px.set(X + a, Y + b, c); }
    }
    /* loose stars around it, so it reads as drawn in the stars */
    const N = 26;
    for (let n = 0; n < N; n++) {
      const a = hash(n, 1, seed + 5) * 6.283, r = (G.w * sc * 0.5) * (0.75 + hash(n, 2, seed + 5) * 0.8), kk = clamp((p - hash(n, 3, seed + 5) * 0.6) / 0.35, 0, 1);
      if (kk <= 0) continue;
      const tw = 0.5 + 0.5 * Math.sin(t * (1.5 + hash(n, 4, seed + 5) * 2) + n);
      if (tw * kk * br > 0.35) { const X = Math.round(o.cx + Math.cos(a) * r * 1.1), Y = Math.round(o.cy + Math.sin(a) * r * 1.2); px.set(X, Y, tw > 0.8 ? white : pale); if (tw > 0.9) { px.set(X + 1, Y, gold); px.set(X - 1, Y, gold); px.set(X, Y + 1, gold); px.set(X, Y - 1, gold); } }
    }
  };

  /* ----------------------------------------------------------------- MOTES
   * Specks of light drifting down (dir = 1) or up (dir = -1) through a box. o: {t, k, x0, x1, y0, y1, n, speed, dir} */
  lib.motes = function (o) {
    const k = o.k; if (k <= 0.02) return;
    const n = o.n || 80, dir = o.dir === undefined ? 1 : o.dir, c1 = hex('#fff6d0'), c2 = hex('#ffd070'), c3 = hex('#ffb04a');
    for (let i = 0; i < n; i++) {
      const r1 = hash(i, 1, 81), r2 = hash(i, 2, 81), r3 = hash(i, 3, 81), hgt = o.y1 - o.y0;
      let ph = (r2 + (o.t * (o.speed || 10) * (0.55 + r3 * 0.9)) / hgt) % 1; if (dir < 0) ph = 1 - ph;
      const x = o.x0 + r1 * (o.x1 - o.x0) + Math.sin(o.t * 0.9 + i * 1.7) * 3, y = o.y0 + ph * hgt;
      const tw = 0.5 + 0.5 * Math.sin(o.t * 3 + i * 2.3), a = k * (0.35 + 0.65 * tw) * Math.min(1, ph * 6) * Math.min(1, (1 - ph) * 6);
      if (a * 1.3 < thr(x | 0, y | 0)) continue;
      px.set(x | 0, y | 0, r3 > 0.75 ? c1 : r3 > 0.35 ? c2 : c3);
      if (r3 > 0.8) px.dpx((x | 0) + 1, y | 0, c2, a);
    }
  };
  /* ============================================================================
   *  EPISODE 3 ADDITIONS · On the Lord's Day
   *  shore (the rocky cliff of Patmos seen from the sea, with surf), spray (a burst
   *  of water), waveRings (the sound crossing water or ground), inland (the view
   *  behind John: hills, flattened grass, dust), johnTurn (John turning round),
   *  nameSign (a name written in light), shoulder (John's shoulder at the edge of
   *  a point-of-view shot)
   * ========================================================================== */

  /* ---------------------------------------------------------------- SHORE
   * The headland of Patmos in world units where John (feet at 0,0) is 46 units tall.
   * Screen = (Jx + wx*z, Jy + wy*z). The sea lies at wy = SEA. The land falls to the sea in
   * ledges on John's left; its foot is at lib.shoreFoot. */
  const SH = { SEA: 150, X0: -560, X1: 760, EDGE: -50 };
  let SHORE = null;
  function ensureShore() {
    if (SHORE) return SHORE;
    const n = SH.X1 - SH.X0, top = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const wx = SH.X0 + i;
      if (wx >= SH.EDGE) { top[i] = 2.5 * (px.fbm(wx * 0.03, 9, 3, 8) - 0.5) * 2 - Math.max(0, wx - 90) * 0.03; continue; }
      const d = SH.EDGE - wx;
      let y = d * 1.1 + 22 * (px.fbm(wx * 0.025 + 3, 2, 3, 5) - 0.5) + 6 * Math.sin(wx * 0.11);
      const st = 17, q = Math.max(0, y) / st, fl = Math.floor(q);
      y = (fl + sstep(0.5, 0.95, q - fl)) * st;                         /* ledges, then risers */
      top[i] = Math.min(SH.SEA + 12, y);
    }
    /* boulders at the foot and a sea stack standing out in the water */
    const r = px.rng(77), boulders = [];
    for (let k = 0; k < 14; k++) boulders.push([-215 + r() * 70, SH.SEA + 1 - r() * 5, 6 + r() * r() * 17]);
    boulders.push([-318, SH.SEA + 8, 24], [-296, SH.SEA + 3, 13], [-392, SH.SEA + 5, 10], [-110, SH.SEA + 5, 9]);
    for (const [cx, cy, rad] of boulders) for (let wx = Math.floor(cx - rad); wx <= cx + rad; wx++) {
      const i = wx - SH.X0; if (i < 0 || i >= n) continue;
      const d = rad * rad - (wx - cx) * (wx - cx); if (d < 0) continue;
      top[i] = Math.min(top[i], cy - Math.sqrt(d) * 0.82);
    }
    let foot = SH.EDGE; for (let i = 0; i < n; i++) if (top[i] < SH.SEA - 2) { foot = SH.X0 + i; break; }
    SHORE = { top, n, foot: -176 };
    lib.shoreFoot = SHORE.foot;
    return SHORE;
  }
  const ROCK = hexes(['#05060d', '#0a0c18', '#12142a', '#1d1b36', '#2e2542', '#4a3350', '#7a4858', '#b86a5a']);
  /* o: {U, Jx, Jy, z, t, dawn, sunX, lit, bursts[], calm 0..1}. returns {ys} (screen row of the waterline) */
  lib.shore = function (o) {
    const S = ensureShore(), U = o.U, z = o.z, Jx = o.Jx, Jy = o.Jy, t = o.t, dawn = o.dawn, lit = clamp(o.lit === undefined ? 1 : o.lit, 0, 1);
    const SEAy = SH.SEA, ys = Math.round(Jy + SEAy * z), rim = mix(hex('#6a7aa8'), hex('#ffc27a'), dawn), rimHot = mix(hex('#9aaad0'), hex('#ffe4a8'), dawn);
    const tone = clamp((dawn - 0.25) * 1.6, 0, 1);
    const mask = new Uint8Array(W * H);
    const topAt = (wx) => { const i = Math.round(wx) - SH.X0; return i < 0 ? 1e6 : i >= S.n ? S.top[S.n - 1] : S.top[i]; };
    const colTop = new Int16Array(W), lam = new Float32Array(W);
    for (let x = 0; x < W; x++) {
      const wx = (x - Jx) / z, tp = topAt(wx);
      const f1 = (topAt(wx + 2) - topAt(wx - 2)) / 4, nn = Math.sqrt(f1 * f1 + 1);
      lam[x] = clamp((-0.75 * f1 + 0.65) / nn, 0, 1.2);
      colTop[x] = tp > SEAy ? 9999 : Math.round(Jy + tp * z);
      if (tp > SEAy) continue;
      const y0 = Math.max(0, colTop[x]), y1 = Math.min(H - 1, ys);
      for (let y = y0; y <= y1; y++) mask[y * W + x] = 1;
    }
    const solid = (x, y) => x >= 0 && x < W && y >= 0 && y < H && mask[y * W + x] === 1;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      if (!mask[y * W + x]) continue;
      const wx = (x - Jx) / z, wy = (y - Jy) / z, tp = topAt(wx), depth = wy - tp;
      const strata = Math.sin(wy * 0.19 + px.fbm(wx * 0.03, wy * 0.04, 3, 21) * 6.0);
      const gully = px.fbm((wx + wy * 0.7) * 0.035, (wy - wx * 0.25) * 0.05, 3, 33), crack = px.fbm(wx * 0.16, wy * 0.025, 2, 52);
      const wet = sstep(SEAy - 40, SEAy, wy);
      let v = 0.2 + 0.1 * strata + 0.3 * (gully - 0.5) + 0.12 * tone + 0.42 * lam[x] * Math.exp(-depth / 34) * (0.35 + 0.65 * tone) + 0.1 * (1 - wy / SEAy) - 0.3 * wet;
      if (crack > 0.62) v -= 0.16;                                           /* dark vertical cracks */
      if (hash((wx * 0.7) | 0, (wy * 0.7) | 0, 6) > 0.93) v -= 0.1;
      let c = px.ramp(ROCK, clamp(v, 0, 1), x, y);
      /* the sun catches the top of each ledge and every edge that faces it */
      const up = !solid(x, y - 1), left = !solid(x - 1, y), u2 = !solid(x, y - 2), l2 = !solid(x - 2, y), toSun = o.sunX > x;
      if (up) c = mix(c, rimHot, clamp(0.4 + 0.6 * lit, 0, 1));
      else if (left && toSun) c = mix(c, rim, clamp(0.45 + 0.45 * lit, 0, 1));
      else if ((u2 || (l2 && toSun)) && lit > thr(x, y) + 0.2) c = mix(c, rim, 0.5);
      else if (strata > 0.82 && !solid(x, y - 3) === false && gully > 0.45 && lit > thr(x, y) + 0.45 && (solid(x, y - 1) && hash(x >> 1, y, 3) > 0.5)) c = mix(c, rim, 0.28);
      U[y * W + x] = c;
    }
    /* tufts of grass along the top and a few blades on John's plateau */
    for (let wx = -48; wx < 300; wx += 2.3) {
      const x = Math.round(Jx + wx * z); if (x < 0 || x >= W) continue;
      const tp = topAt(wx), y = Math.round(Jy + tp * z); if (y < 1 || y >= H) continue;
      const hh = Math.max(1, Math.round((2 + 5 * hash(Math.round(wx), 3, 61)) * Math.min(1.3, z * 1.2)));
      const sway = Math.sin(t * (1.2 + (o.calm === undefined ? 1 : o.calm) * 1.2) + wx * 0.2) * 0.6;
      for (let j = 1; j <= hh; j++) px.set(x + Math.round(sway * (j / hh)), y - j, hash(Math.round(wx), j, 62) > 0.85 ? mix(ROCK[3], rim, lit * 0.5) : ROCK[1]);
    }
    if (ys < 0 || ys > H + 30) return { ys, colTop };
    /* the sea against the rock: a dark reflection that wobbles, then the foam */
    const calm = o.calm === undefined ? 1 : o.calm;
    for (let x = 0; x < W; x++) {
      if (colTop[x] === 9999) continue;
      const len = Math.round(4 + (ys - colTop[x]) * 0.08);
      for (let j = 1; j <= Math.min(len, 22); j++) {
        const yy = ys + j; if (yy >= H) break;
        const off = Math.round(Math.sin(t * 2 + j * 0.8 + x * 0.12) * 1.6);
        if (hash(x + off, j, 41) < (1 - j / len) * 0.8) px.dpx(x, yy, mix(ROCK[1], hex('#0a1428'), 0.4), 0.85 * (1 - j / (len + 4)));
      }
    }
    const bursts = o.bursts || [], footX = Jx + S.foot * z;
    let impact = 0; for (const tb of bursts) if (t >= tb - 0.1) impact += Math.exp(-(t - tb) / 0.5);
    for (let x = 0; x < W; x++) {
      if (colTop[x] === 9999) continue;
      const wx = (x - Jx) / z, near = 1 - 0.78 * sstep(S.foot + 70, S.foot + 150, wx), sw = 0.5 + 0.5 * Math.sin(t * 1.5 + wx * 0.07) * (0.4 + 0.6 * calm);
      const hgt = (1.0 + 2.0 * sw * near + impact * 4 * near * (0.4 + hash(x, 9, 4))) * Math.min(1.5, Math.max(0.7, z));
      for (let j = -Math.round(hgt); j <= Math.round(hgt * 0.5); j++) {
        const yy = ys + j, edge = Math.abs(j) / Math.max(1, hgt);
        if (hash(x, j, 17) < 0.3 + edge * 0.4 + (1 - near) * 0.3) continue;
        px.set(x, yy, edge > 0.7 ? hex('#7a98c0') : edge > 0.35 ? hex('#c8dcf2') : hex('#f4f8ff'));
      }
    }
    /* a swell rolls in before every burst, then slaps the foot of the cliff */
    for (const tb of bursts) {
      const u = (t - (tb - 1.7)) / 1.7; if (u <= 0 || u >= 1.04) continue;
      const span = 120 * z;
      for (let x = Math.round(footX - span); x <= Math.round(footX + 14 * z); x++) {
        if (x < 0 || x >= W) continue;
        const d = (x - (footX - span)) / span, yy = Math.round(ys + (1 - Math.min(1, u)) * 15 * z + Math.sin(x * 0.2) * 0.8 - 1.8 * z * Math.sin(d * 3.1));
        const a = 0.35 + 0.6 * u; if (hash(x, 5, 3) < 0.15) continue;
        px.dpx(x, yy, hex('#d6e8fa'), a); px.dpx(x, yy + 1, hex('#5a7aa8'), a * 0.8);
      }
    }
    /* the column of water thrown up the rocks */
    for (const tb of bursts) {
      const a = t - tb; if (a < 0 || a > 1.5) continue;
      const rise = (1 - Math.exp(-a / 0.1)) * Math.exp(-a / 0.6), hw = (22 + 10 * (1 - Math.exp(-a / 0.3))) * z, Hh = (46 * rise) * Math.max(0.6, z);
      for (let y = Math.round(ys - Hh); y <= ys; y++) {
        const v = (ys - y) / Math.max(1, Hh), w = hw * (1 - v * 0.6) * (0.5 + 0.5 * hash(y, tb | 0, 2));
        for (let x = Math.round(footX - w); x <= footX + w; x++) {
          if (x < 0 || x >= W) continue;
          const d = Math.abs(x - footX) / Math.max(1, w), q = (1 - d) * (1 - v * 0.5) * Math.exp(-a / 0.8) * 1.25;
          if (q > thr(x, y) + 0.1) px.set(x, y, q > 0.8 ? hex('#ffffff') : q > 0.5 ? hex('#d6e8fa') : hex('#8aa8cf'));
        }
      }
    }
    return { ys, colTop };
  };

  /* a burst of spray. o: {t, tb, Jx, Jy, z, wx, wy, n, seed, dir} */
  lib.spray = function (o) {
    const a0 = o.t - o.tb; if (a0 < 0 || a0 > 2.2) return;
    const n = o.n || 70, G = 170, z = o.z;
    for (let i = 0; i < n; i++) {
      const r1 = hash(i, 1, 90 + (o.seed || 0)), r2 = hash(i, 2, 90 + (o.seed || 0)), r3 = hash(i, 3, 90 + (o.seed || 0)), r4 = hash(i, 4, 90 + (o.seed || 0));
      const age = a0 - r4 * 0.12, life = 0.7 + r3 * 1.3; if (age <= 0 || age > life) continue;
      const vx = ((r1 - 0.72) * 96) * (o.dir || 1), vy = -(36 + r2 * 120);
      const wx = o.wx + vx * age, wy = o.wy + vy * age + 0.5 * G * age * age;
      if (wy > o.wy + 3) continue;
      const x = Math.round(o.Jx + wx * z), y = Math.round(o.Jy + wy * z), k = 1 - age / life;
      if (k < thr(x, y) * 0.9) continue;
      const big = r3 > 0.78 && z > 0.8;
      const c = r1 > 0.5 ? hex('#ffffff') : r1 > 0.2 ? hex('#d6e8fa') : hex('#8aa8cf');
      px.set(x, y, c); if (big) { px.set(x + 1, y, c); px.set(x, y + 1, hex('#8aa8cf')); }
    }
  };

  /* ---------------------------------------------------------- WAVE RINGS
   * Rings of pressure spreading over a flat surface seen low: ellipses of ratio ky centred on
   * (cx, cy). Only drawn between yMin and yMax. o: {cx, cy, t, starts[], speed, ky, yMin, yMax, life, col, crest} */
  lib.waveRings = function (o) {
    const c1 = o.crest || hex('#f6f2e0'), c2 = o.col || hex('#9fb4d8'), dark = o.dark || hex('#0b1530');
    for (const ts of o.starts) {
      const age = o.t - ts; if (age <= 0) continue;
      const k = clamp(1 - age / (o.life || 3.6), 0, 1) * clamp(age / 0.2, 0, 1); if (k <= 0) continue;
      for (let band = 0; band < 2; band++) {                         /* the crest, and a fainter ripple behind it */
        const r = Math.max(1, age * o.speed - band * 16), ry = r * o.ky, N = Math.max(120, Math.round(Math.PI * Math.max(r, 20) * 1.3)), kb = k * (band ? 0.55 : 1);
        for (let i = 0; i <= N; i++) {
          const a = (i / N) * Math.PI, x = Math.round(o.cx + Math.cos(a) * r), y = Math.round(o.cy - Math.sin(a) * ry);
          if (x < 0 || x >= W || y < o.yMin || y > o.yMax) continue;
          const depth = clamp((y - o.yMin) / Math.max(1, o.yMax - o.yMin), 0, 1), wob = 0.72 + 0.28 * Math.sin(a * 9 + age * 2 + ts * 3), q = kb * wob;
          if (q * 1.5 < thr(x, y)) continue;
          px.set(x, y, band ? c2 : q > 0.3 ? c1 : c2);
          if (!band) { px.set(x, y + 1, c1); px.set(x, y + 2, c2); if (depth > 0.55) px.set(x, y + 2, c2); if (q > 0.3) px.dpx(x, y - 1, dark, 0.8); }
        }
      }
    }
  };

  /* ------------------------------------------------------------- INLAND
   * What John sees when the voice sounds behind him: the dim land, hills, grass that is laid
   * flat, dust rolling away. o: {U, t, hy, dawn, flat 0..1, wind, shake, lit} */
  lib.inland = function (o) {
    const U = o.U, t = o.t, hy = o.hy | 0, dawn = o.dawn, flat = o.flat;
    const sky = px.mixRamp(lib.skyRamp(dawn * 0.55), SKY_NIGHT, 0.45);
    for (let y = 0; y < hy; y++) { const base = Math.pow(y / hy, 1.2); for (let x = 0; x < W; x++) { const v = base * 0.9 + 0.05 + 0.1 * Math.exp(-Math.pow((x - 60) / 140, 2)) * base; U[y * W + x] = px.ramp(sky, v, x, y); } }
    const r = px.rng(9); for (let i = 0; i < 70; i++) { const x = (r() * W) | 0, y = (r() * hy * 0.6) | 0, b = r(); if (b > 0.35 && (0.5 + 0.5 * Math.sin(t * 1.7 + i)) * b > 0.25) U[y * W + x] = b > 0.8 ? hex('#ffffff') : hex('#8a98c8'); }
    /* two ridges of high ground */
    const hz = sky[sky.length - 1], far = mix(hz, hex('#0a0d20'), 0.55), near = mix(hex('#07091a'), hex('#14122a'), dawn);
    for (let x = 0; x < W; x++) {
      const h1 = 14 + 16 * px.fbm(x * 0.012 + 3, 1, 3, 4) + 10 * Math.exp(-Math.pow((x - 330) / 90, 2)), h2 = 8 + 13 * px.fbm(x * 0.02 + 9, 5, 3, 6) + 12 * Math.exp(-Math.pow((x - 110) / 70, 2));
      for (let y = hy - Math.round(h1); y < hy; y++) U[y * W + x] = y === hy - Math.round(h1) ? mix(far, hex('#6a7aa8'), 0.35) : far;
      for (let y = hy - Math.round(h2) + 5; y < hy + 3; y++) U[y * W + x] = y === hy - Math.round(h2) + 5 ? mix(near, hex('#6a7aa8'), 0.3) : near;
    }
    /* the ground: calm bands of dark meadow, with long streaks where the grass lies down */
    const G = hexes(['#04060d', '#080b17', '#0f1424', '#171d33', '#222a45']);
    for (let y = hy; y < H; y++) {
      const s = (y - hy) / (H - hy), sp = 0.35 + 0.5 * s;
      for (let x = 0; x < W; x++) {
        const n = px.fbm(x * 0.012 + t * 0.15 * flat, y * 0.09, 2, 12), streak = hash(Math.floor((x + t * 220 * flat * (0.3 + s)) / (6 + 40 * s * flat)), y, 14);
        let v = sp * 0.55 + 0.38 * (n - 0.5) + (streak > 0.8 ? 0.12 * flat : 0);
        U[y * W + x] = px.ramp(G, clamp(v, 0, 1), x, y);
      }
    }
    /* grass laid flat by the sound: blades lean away along the ground */
    const rg = px.rng(5), gl = hex('#2a3250');
    for (let row = 0; row < 38; row++) {
      const s = Math.pow(row / 37, 1.5), y = Math.round(hy + 3 + s * (H - hy + 12)), len = 2 + s * 18, step = 8 - s * 5;
      for (let x = -10; x < W + 10; x += step * (0.7 + rg() * 0.8)) {
        const ph = rg() * 6.28, bend = clamp(flat * (0.8 + 0.4 * Math.sin(ph)), 0, 1), ang = lerp(1.4, 0.16, bend), L = len * (0.7 + 0.5 * rg());
        const flut = Math.sin(t * 9 + ph + x * 0.1) * flat * 0.8;
        for (let k = 0; k < L; k++) {
          const q = k / L, X = Math.round(x + Math.cos(ang) * k * (1 + q * 0.3)), Y = Math.round(y - Math.sin(ang) * k * (1 - q * 0.15) + flut * q * q * 2);
          if (X < 0 || X >= W || Y < 0 || Y >= H) continue;
          U[Y * W + X] = q > 0.8 && s > 0.3 && rg() > 0.6 ? mix(gl, hex('#e2c07a'), o.lit * 0.7) : G[0];
        }
      }
    }
    /* dust rolling away */
    for (let i = 0; i < 70; i++) {
      const r1 = hash(i, 1, 55), r2 = hash(i, 2, 55), r3 = hash(i, 3, 55), sp = 90 + r3 * 260;
      const x = ((r1 * 700 + t * sp * (0.3 + flat)) % 600) - 60, s = Math.pow(r2, 0.8), y = hy + 6 + s * (H - hy - 6) - Math.sin(t * 3 + i) * 1.2, len = 4 + Math.round(flat * 16 * (0.3 + r3) * (0.4 + s));
      for (let j = 0; j < len; j++) px.dpx(Math.round(x - j), Math.round(y), mix(hex('#8a6a58'), hex('#d8b890'), o.lit), flat * (1 - j / len) * 0.6 * (0.35 + s));
    }
  };

  /* John's shoulder and the streaming hair at the edge of a point-of-view shot. o: {U, k 0..1 (slide in), t, wind, dawn} */
  lib.shoulder = function (o) {
    const U = o.U, k = o.k === undefined ? 1 : o.k, t = o.t, dawn = o.dawn, rim = mix(hex('#4a5a88'), hex('#c89060'), dawn * 0.6);
    const robeA = mix(hex('#080a14'), hex('#161220'), dawn * 0.7), robeB = mix(hex('#10142a'), hex('#221a30'), dawn * 0.7), robeF = hex('#04050a'), hairA = hex('#8a8aa0'), hairB = hex('#58566e');
    const cx = -12 - (1 - k) * 80, cy = 214, rx = 66, ry = 92;
    for (let y = 0; y < H; y++) for (let x = 0; x < 90; x++) {
      const dx = (x - cx) / rx, dy = (y - cy) / ry, d = dx * dx + dy * dy; if (d > 1) continue;
      const fold = Math.sin(x * 0.34 + y * 0.09 + Math.sin(t * 3 + y * 0.05) * 0.4);
      let c = fold > 0.7 ? robeB : fold < -0.8 ? robeF : robeA;
      if (d > 0.93) c = mix(c, rim, 0.8); else if (d > 0.85 && thr(x, y) < 0.4) c = mix(c, rim, 0.4);
      U[y * W + x] = c;
    }
    for (let i = 0; i < 18; i++) {                                   /* the long hair, streaming away with the sound */
      const y0 = Math.round(cy - ry * 0.95 + i * 1.2), len = 16 + hash(i, 1, 4) * 36 + Math.sin(t * 5 + i) * 5;
      for (let j = 0; j < len; j++) { const x = Math.round(cx + rx * 0.3 - (1 - k) * 80 + j * 1.25), y = Math.round(y0 - j * 0.1 + Math.sin(j * 0.2 + t * 6 + i) * 1.1); if (hash(j, i, 7) > j / len) px.set(x, y, j > len * 0.5 ? hairB : hairA); }
    }
  };

  /* ---------------------------------------------------------- JOHN TURNS
   * John turning to look behind him: the same figure, squeezed by the turn, the leading edge catching light.
   * Same options as lib.john plus ang (radians, 0 = back to us), dir (+1 turns toward the right). */
  let TBUF = null;
  lib.johnTurn = function (o) {
    const ang = o.ang || 0;
    if (ang < 0.03) { lib.john(o); return; }
    const save = px.cur(); TBUF = TBUF || new Uint32Array(W * H); TBUF.fill(0);
    px.target(TBUF); lib.john(Object.assign({}, o, { U: TBUF })); px.target(save);
    const c = Math.max(0.28, Math.cos(ang)), dir = o.dir || 1, h = o.h, cx = o.x, bias = Math.sin(ang) * h * 0.05 * dir;
    const top = Math.max(0, Math.round(o.y - h - 2)), bot = Math.min(H - 1, Math.round(o.y + 3));
    const gold = mix(hex('#c8a060'), hex('#ffe9a8'), o.lit === undefined ? 1 : o.lit);
    for (let y = top; y <= bot; y++) {
      let lead = -1;
      for (let x = Math.round(cx - h * 0.45); x <= Math.round(cx + h * 0.45); x++) {
        if (x < 0 || x >= W) continue;
        const sx = Math.round(cx + (x - cx - bias) / c); if (sx < 0 || sx >= W) continue;
        const v = TBUF[y * W + sx]; if (!v) continue;
        save[y * W + x] = v;
        if (dir > 0) lead = x; else if (lead < 0) lead = x;
      }
      /* the leading edge of the turn catches the glory */
      if (lead >= 0) for (let k = 0; k < 3; k++) { const x = lead - dir * k; if (save[y * W + x] !== undefined && (k === 0 || thr(x, y) < 0.7 - k * 0.2)) save[y * W + x] = mix(save[y * W + x], gold, (0.85 - k * 0.25) * clamp(ang / 0.5, 0, 1)); }
    }
  };

  /* ---------------------------------------------------------- NAME SIGN
   * A name written in light. o: {k (0..1 reveal), a (0..1 overall alpha), t, sc, glow, pop (0..1), seed}.
   * Letters appear from the left with a hot white edge, then settle to gold. Centred on (cx, y). */
  lib.nameSign = function (text, cx, y, o) {
    const k = o.k; if (k <= 0.004) return;
    const sc = o.sc || 2, tw = px.textWidth(text, sc, 1), x0 = Math.round(cx - tw / 2), a = o.a === undefined ? 1 : o.a, t = o.t;
    const gold = hexes(['#fff6d0', '#ffe9a0', '#ffd070', '#f2a444', '#c8702a', '#8a4420']);
    lib.halo(cx, y + 3.5 * sc, tw * 0.62, hex('#ffb04a'), 0.34 * k * a * (o.glow === undefined ? 1 : o.glow), 0.32);
    const edge = lerp(-20, tw + 20, clamp(k, 0, 1));
    for (let i = 0; i < text.length; i++) {
      const lx = x0 + i * 6 * sc, ch = text[i], pos = i * 6 * sc;
      const ka = clamp((edge - pos) / 18, 0, 1) * a; if (ka <= 0) continue;
      const hot = clamp(1 - (edge - pos) / 46, 0, 1) * (k < 1 ? 1 : 0) + (o.pop || 0) * 0.8;
      px.text(ch, lx + sc, y + sc, sc, hex('#1a0c16'), ka * 0.9);
      px.text(ch, lx, y, sc, (cc, r, X, Y) => {
        let col = px.ramp(gold, (r + 1) / (7 * sc), X, Y);
        if (hot > 0.15) col = hot > 0.55 ? hex('#ffffff') : hex('#fff0c0');
        const tw2 = Math.sin(t * 3 + (X + Y) * 0.4 + (o.seed || 0) * 2.1);
        if (tw2 > 0.96) col = hex('#ffffff');
        return col;
      }, ka);
    }
  };
  /* ============================================================================
   *  EPISODE 4 ADDITIONS · One Like a Son of Man
   *  lampstand (a golden stand with a flame), sonOfMan (a figure made of light: robe, sash,
   *  hair like wool, eyes of fire, feet like furnace bronze, seven stars, a sword, a face like
   *  the sun). Faces are never drawn: where the face would be there is only light.
   *  Both are analytic, so they stay crisp at any zoom.
   * ========================================================================== */
  const GOLDW = hexes(['#3a1a10', '#8a4420', '#c8702a', '#f2a444', '#ffd070', '#ffe9a0', '#fff6d0', '#ffffff']);
  const FURN = hexes(['#2a0a06', '#6a1c0a', '#b8400e', '#f07a22', '#ffb84a', '#ffe6a0', '#ffffff']);
  const WOOL = hexes(['#7a86b0', '#aab6dc', '#d8e2fa', '#f2f6ff', '#ffffff']);

  /* o: {U, x, y (base on screen), z (px per unit; stand is 36 units tall), lit 0..1, pop, t, seed, lean (px at the top), a (alpha 0..1)} */
  lib.lampstand = function (o) {
    const z = o.z, x = o.x, y = o.y, lit = o.lit === undefined ? 1 : o.lit, a = o.a === undefined ? 1 : o.a, lean = o.lean || 0;
    if (a <= 0.01) return;
    const dim = mix(hex('#3a2a28'), hex('#b8802a'), 0.25 + 0.75 * lit), bright = mix(hex('#6a4a38'), hex('#ffe08a'), 0.2 + 0.8 * lit), dark = hex('#1a1020');
    const H_ = 34 * z, bx = (hh) => x + lean * Math.pow(hh / H_, 2);
    /* foot: a disc on three small legs */
    for (let i = -Math.round(5 * z); i <= Math.round(5 * z); i++) { const w = Math.sqrt(Math.max(0, 1 - Math.pow(i / (5 * z), 2))), yy = Math.round(y - 0.4 * z * w); px.dpx(x + i, yy, i < 0 ? bright : dim, a); px.dpx(x + i, yy + 1, dark, a * 0.8); }
    /* stem with three knops, then the bowl */
    for (let hh = 1; hh < H_; hh++) {
      const xx = bx(hh), k = hh / z, knop = (Math.abs(k - 9) < 1.1 || Math.abs(k - 18) < 1.1 || Math.abs(k - 27) < 1.1) ? 1 : 0, wd = Math.max(0.5, (0.7 + knop * 1.0) * z * 0.5);
      for (let i = -Math.ceil(wd); i <= Math.ceil(wd); i++) { if (Math.abs(i) > wd) continue; px.dpx(Math.round(xx + i), Math.round(y - hh), i < 0 ? bright : i === 0 ? dim : mix(dim, dark, 0.5), a); }
    }
    const tx = bx(H_), ty = y - H_;
    for (let i = -Math.round(4.4 * z); i <= Math.round(4.4 * z); i++) {       /* the bowl */
      const w = Math.abs(i) / (4.4 * z), yy = Math.round(ty + 1.5 * z * (1 - w * w));
      px.dpx(Math.round(tx + i), yy, i < 0 ? bright : dim, a); px.dpx(Math.round(tx + i), yy + 1, dark, a * 0.7);
    }
    if (lit > 0.01) lib.flame({ x: Math.round(tx), y: Math.round(ty - 2.4 * z), k: lit, pop: o.pop || 0, t: o.t, seed: o.seed || 0, s: clamp(0.5 * z + 0.9, 1.1, 5.5), glow: 1 + 0.3 * (o.pop || 0) });
  };

  /* o: {U, sx, sy (feet on screen), z (px per unit; the figure is 96 units tall), t, form 0..1, face 0..1, eyes 0..1,
   *     stars 0..7 (float: number lit), starT0 (time the first star lights), sword 0..1, blaze 0..1, waves 0..1} */
  lib.sonOfMan = function (o) {
    const U = o.U, z = o.z, sx = o.sx, sy = o.sy, t = o.t, form = o.form, face = o.face === undefined ? 0.4 : o.face, blaze = o.blaze || 0, waves = o.waves || 0;
    if (form <= 0.003) return;
    const x0 = Math.max(0, Math.floor(sx - 40 * z)), x1 = Math.min(W - 1, Math.ceil(sx + (o.sword > 0 ? 100 : 40) * z)), y0 = Math.max(0, Math.floor(sy - 104 * z)), y1 = Math.min(H - 1, Math.ceil(sy + 6 * z));
    const hw = (h) => h > 76 ? lerp(14, 3.8, sstep(76, 80.5, h)) : lerp(13.2, 10.6, sstep(5, 45, h)) + lerp(0, 3.4, sstep(48, 74, h));
    const capsule = (px_, py_, ax, ay, bx, by, r) => { const vx = bx - ax, vy = by - ay, l2 = vx * vx + vy * vy, k = clamp(((px_ - ax) * vx + (py_ - ay) * vy) / l2, 0, 1), dx = px_ - (ax + vx * k), dy = py_ - (ay + vy * k); return Math.sqrt(dx * dx + dy * dy) - r; };
    const HC = 88.4;                                                         /* head centre height */
    const nStars = o.stars || 0, SL = 70 * (1 - Math.exp(-Math.max(0, (o.sword || 0) * 1.0) * 6)) * (o.sword > 0 ? 1 : 0);
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      let u = (x - sx) / z; const h = (sy - y) / z;
      const sway = Math.sin(h * 0.16 - t * 2.1) * waves * 2.6 * (1 - h / 90);
      u -= sway;
      /* materialising: a wipe of light from the feet upward, dithered */
      if (form < 1 && form * 1.35 - (h / 96) * 0.35 < thr(x, y)) continue;
      let col = -1;
      const inRobe = h >= 4.5 && h <= 80.5 && Math.abs(u) < hw(h);
      /* the body */
      if (inRobe) {
        const e = Math.abs(u) / hw(h), fold = Math.sin(u * 1.1 + Math.sin(h * 0.07) * 1.9) * 0.05 + Math.sin(u * 2.3 + h * 0.04) * 0.02;
        let v = 0.98 - 0.72 * e * e + fold + 0.1 * face + 0.14 * Math.exp(-h / 9);
        if (e > 0.88) v -= 0.18;
        col = px.ramp(GOLDW, clamp(v * 0.9, 0, 1), x, y);
        /* the golden sash around the chest */
        const sh = 60.8 - 0.012 * u * u;
        if (h > sh - 3.2 && h < sh + 3.2) { const sv = 0.78 + 0.2 * Math.sin(u * 2.2) - 0.35 * Math.abs(h - sh) / 3.2; col = px.ramp(GOLDW, clamp(sv, 0, 1), x, y); if (Math.abs(h - sh) > 2.7) col = mix(col, hex('#8a4420'), 0.55); }
        if (u > 3 && u < 5.4 && h < sh - 2.6 && h > 44 - 1.5 * Math.sin(t * 1.5) - 0) col = px.ramp(GOLDW, 0.56 + 0.1 * Math.sin(h * 0.6), x, y);   /* the loose end of the sash */
      }
      /* arms: his right hand (our left) lifted, holding the stars; the other hangs */
      if (col < 0 && h > 40) {
        const dA = capsule(u, h, -12.6, 74.5, -22.8, 61, 1.9), dB = capsule(u, h, 12.8, 74.5, 15.6, 50, 1.8);
        if (dA < 0 || dB < 0) col = px.ramp(GOLDW, 0.46 + 0.14 * Math.sin(u * 1.4 + h * 0.2) - (dA < -1.1 || dB < -1.0 ? 0 : 0.2), x, y);
        if (Math.hypot(u + 23.2, h - 60) < 2.5) col = px.ramp(GOLDW, 0.82, x, y);
      }
      /* the feet: burnished bronze glowing in a furnace */
      if (col < 0 && h < 5.2 && h > -0.5) {
        for (const fx of [-4.4, 4.4]) {
          const d = Math.pow((u - fx) / 3.3, 2) + Math.pow((h - 2.1) / 2.5, 2);
          if (d < 1) { const hot = 0.66 + 0.2 * Math.sin(t * 4 + fx) + 0.25 * (1 - d); col = px.ramp(FURN, clamp(hot * (0.8 + 0.4 * (o.feet || 0)), 0, 1), x, y); }
        }
      }
      /* hair white as wool, white as snow */
      const hairE = Math.pow(u / (9.4 + 1.2 * sstep(94, 78, h)), 2) + Math.pow((h - 83.5) / 14.2, 2);
      if (hairE < 1) {
        const n = px.fbm(u * 0.5 + 3, h * 0.5, 2, 71), v = 0.55 + 0.5 * n + 0.18 * Math.sin(t * 1.3 + u) * 0 - 0.25 * Math.max(0, hairE - 0.7);
        col = px.ramp(WOOL, clamp(v * (0.85 + 0.3 * face), 0, 1), x, y);
      }
      /* where the face would be: only light */
      const fe = Math.pow(u / 6.4, 2) + Math.pow((h - 87.4) / 8.6, 2);
      if (fe < 1 && Math.pow(1 - fe, 0.8) * (0.55 + 0.6 * face + 0.5 * blaze) > thr(x, y)) col = px.ramp(GOLDW, clamp(0.5 + 0.5 * face - 0.3 * fe + 0.35 * blaze, 0, 1), x, y);
      /* eyes like a flame of fire: two small furnace-bright flames, nothing else of a face */
      if (o.eyes > 0.01) {
        const fl = Math.sin(t * 17 + u * 1.3) * 0.3, dv = Math.abs(h - 89.6 - fl * 0.3), band = Math.abs(u) < 9.5 ? Math.pow(1 - Math.abs(u) / 9.5, 1.6) : 0;
        const th = (0.1 + 0.2 * o.eyes) * band + 0.55 * Math.exp(-Math.pow((Math.abs(u) - 2.6) / 0.7, 2)) * o.eyes * (1 + fl) * (h > 89.4 ? 1 : 0.2);
        if (th > dv && band > 0) col = dv < th * 0.4 ? hex('#ffffff') : dv < th * 0.75 ? hex('#ffe6a0') : px.ramp(FURN, 0.66, x, y);
        else if (th > dv * 0.5 && band > 0 && thr(x, y) < o.eyes * 0.6) col = px.ramp(FURN, 0.62, x, y);
      }
      if (col >= 0) U[y * W + x] = col;
    }
    /* seven stars in his right hand */
    for (let i = 0; i < 7; i++) {
      const k = clamp(nStars - i, 0, 1); if (k <= 0) continue;
      const sxu = -23 + (i - 3) * 3.4, syu = 66.5 + 6.4 * (1 - Math.pow((i - 3) / 3, 2)), cx = sx + sxu * z, cy = sy - syu * z, r = Math.max(1, 0.8 * z * (0.7 + 0.5 * k)), tw = 0.75 + 0.25 * Math.sin(t * 5 + i * 2);
      for (let d = -Math.round(r * 2.2); d <= Math.round(r * 2.2); d++) {
        const f = 1 - Math.abs(d) / (r * 2.2); if (f * tw * k > thr(cx + d, cy) * 0.9) px.set(Math.round(cx + d), Math.round(cy), f > 0.6 ? hex('#ffffff') : hex('#b8d4ff'));
        if (f * tw * k > thr(cx, cy + d) * 0.9) px.set(Math.round(cx), Math.round(cy + d), f > 0.6 ? hex('#ffffff') : hex('#b8d4ff'));
      }
      for (let dy = -Math.round(r * 0.35); dy <= Math.round(r * 0.35); dy++) for (let dx = -Math.round(r * 0.35); dx <= Math.round(r * 0.35); dx++) px.set(Math.round(cx + dx), Math.round(cy + dy), hex('#ffffff'));
    }
    /* out of his mouth, a sharp two-edged sword */
    if (SL > 0.5) {
      const mx = sx + 1.5 * z, my = sy - 83.4 * z, ang = -0.07, ca = Math.cos(ang), sa = Math.sin(ang), L = SL * z;
      for (let s = 0; s <= L; s += 0.5) {
        const wdt = (1.9 * Math.pow(1 - s / L, 0.55) + 0.25) * z * 0.5 + 0.4;
        for (let q = -Math.ceil(wdt); q <= Math.ceil(wdt); q++) {
          if (Math.abs(q) > wdt) continue;
          const X = Math.round(mx + ca * s - sa * q), Y = Math.round(my + sa * s + ca * q), edge = Math.abs(q) / wdt;
          px.set(X, Y, edge > 0.72 ? hex('#8ec8ff') : edge > 0.35 ? hex('#e8f4ff') : hex('#ffffff'));
        }
      }
    }
    /* his face, like the sun shining in full strength: a disc of white that grows, with rays */
    if (blaze > 0.003) {
      const cx = sx, cy = sy - HC * z, Rb = z * lerp(6, 54, Math.pow(blaze, 1.4)), n = Math.max(0, 1 - blaze * 0.0);
      const rx0 = Math.max(0, Math.floor(cx - Rb * 4.2)), rx1 = Math.min(W - 1, Math.ceil(cx + Rb * 4.2)), ry0 = Math.max(0, Math.floor(cy - Rb * 4.2)), ry1 = Math.min(H - 1, Math.ceil(cy + Rb * 4.2));
      for (let y = ry0; y <= ry1; y++) for (let x = rx0; x <= rx1; x++) {
        const dx = x - cx, dy = y - cy, r = Math.sqrt(dx * dx + dy * dy);
        if (r < Rb) { U[y * W + x] = r < Rb * 0.8 || thr(x, y) < 0.55 ? hex('#ffffff') : hex('#fff6d0'); continue; }
        const ang = Math.atan2(dy, dx), ray = 0.5 + 0.5 * Math.sin(ang * 13 + t * 0.6 + Math.sin(ang * 5 + t) * 1.5), q = blaze * (0.35 + 0.65 * ray) * Math.exp(-(r - Rb) / (Rb * 1.6)) * 1.3;
        if (q > thr(x, y) + 0.12) U[y * W + x] = q > 0.75 ? hex('#fff6d0') : q > 0.5 ? hex('#ffe9a0') : q > 0.3 ? hex('#ffd070') : hex('#f2a444');
      }
    }
  };

  /* ============================================================================
   *  EPISODE 6 ADDITIONS · Ephesus
   *  colonnade (a row of great columns with an entablature), ephesusCity (the hill-city
   *  and its theatre across the harbour), robed (a faceless robed figure, optionally gilded),
   *  ship (a harbour sail), treeOfLife (a golden tree that grows in light)
   *  World units: Screen = (240 + (wx - cx) * Z, 112 + (wy - cy) * Z).
   * ========================================================================== */
  const STONE = hexes(['#1a1220', '#2e1e2c', '#4e3036', '#7a4c42', '#b07048', '#e0a060', '#ffd890']);
  const CITYR = hexes(['#120d1a', '#241626', '#3a2230', '#5a3238', '#8a4a3a', '#c8703c', '#ffb060']);
  const BARK = hexes(['#2a1608', '#4a2a10', '#7a4a1c', '#b07a30', '#e0b050']);
  lib.STONE = STONE;

  /* o: {U, cx, cy, Z, x0 (world x of first column), n, gap, h, lit 0..1} */
  lib.colonnade = function (o) {
    const U = o.U, Z = o.Z, sX = (wx) => 240 + (wx - o.cx) * Z, sY = (wy) => 112 + (wy - o.cy) * Z;
    const h = o.h || 72, w = Math.max(4, Math.round((o.w || 6) * Z)), lit = o.lit === undefined ? 1 : o.lit;
    const y0 = Math.round(sY(0)), y1 = Math.round(sY(-h)), capH = Math.max(3, Math.round(3.4 * Z)), baseH = Math.max(2, Math.round(2.6 * Z));
    const eh = Math.max(5, Math.round(7 * Z)), yb = y1 - capH, wide = Math.round(w * 0.3);
    let xmin = 1e9, xmax = -1e9;
    for (let k = 0; k < o.n; k++) {
      const bx = Math.round(sX(o.x0 + k * o.gap)), xl = bx - (w >> 1);
      xmin = Math.min(xmin, xl - wide); xmax = Math.max(xmax, xl + w + wide);
      if (xl + w + wide < 0 || xl - wide >= W) continue;
      for (let y = Math.max(0, y1); y < Math.min(H, y0); y++) {
        const vy = (y - y1) / Math.max(1, y0 - y1);
        for (let i = 0; i < w; i++) {
          const x = xl + i; if (x < 0 || x >= W) continue;
          const u = i / (w - 1);
          let v = 0.12 + 0.78 * Math.pow(u, 1.25) - 0.1 * vy * vy;
          if (i > 0 && i < w - 1 && i % 3 === 0) v -= 0.1;               /* the fluting */
          if (i === w - 1) v += 0.2;                                      /* rim light from the sun side */
          U[y * W + x] = px.ramp(STONE, clamp(v * (0.55 + 0.45 * lit), 0, 1), x, y);
        }
      }
      const blk = (ya, yb2, xa, xb, v0) => { for (let y = Math.max(0, ya); y < Math.min(H, yb2); y++) for (let x = Math.max(0, xa); x < Math.min(W, xb); x++) { const u = (x - xa) / Math.max(1, xb - xa - 1); U[y * W + x] = px.ramp(STONE, clamp((v0 + 0.5 * u) * (0.55 + 0.45 * lit), 0, 1), x, y); } };
      blk(y1 - capH, y1, xl - wide, xl + w + wide, 0.25);                 /* capital */
      blk(y0 - baseH, y0, xl - wide, xl + w + wide, 0.18);                /* base */
    }
    if (xmax > xmin) {
      for (let y = Math.max(0, yb - eh); y < Math.min(H, yb); y++) {
        const r = (y - (yb - eh)) / eh;
        for (let x = Math.max(0, xmin); x < Math.min(W, xmax); x++) {
          let v = 0.62 - 0.35 * r + 0.05 * Math.sin(x * 0.3); if (r < 0.12) v += 0.3;
          if (r > 0.78 && ((x >> 1) & 1)) v -= 0.3;                       /* a row of dentils */
          U[y * W + x] = px.ramp(STONE, clamp(v * (0.55 + 0.45 * lit), 0, 1), x, y);
        }
      }
    }
  };

  /* the far shore: a hill of terraced houses with a great theatre. o: {U, cx, cy, Z, hyW, lit, t} */
  lib.ephesusCity = function (o) {
    const U = o.U, Z = o.Z, sX = (wx) => 240 + (wx - o.cx) * Z, sY = (wy) => 112 + (wy - o.cy) * Z, lit = o.lit === undefined ? 1 : o.lit;
    const prof = (wx) => 58 * sstep(40, 290, wx) - 36 * sstep(330, 480, wx) + 4 * Math.sin(wx * 0.07);
    const hyS = Math.round(sY(o.hyW));
    for (let x = 0; x < W; x++) {
      const wx = o.cx + (x - 240) / Z; if (wx < 40 || wx > 480) continue;
      const cell = Math.floor(wx / 7), bh = 4 + hash(cell, 3, 61) * hash(cell, 5, 61) * 20, top = Math.max(2, prof(wx)) + bh;
      const yTop = Math.round(sY(o.hyW - top));
      for (let y = Math.max(0, yTop); y < Math.min(H, hyS); y++) {
        const d = (y - yTop) / Math.max(1, hyS - yTop);
        let v = 0.16 + 0.3 * (1 - d) + 0.34 * hash(cell, 7, 61) + 0.12 * lit;
        if (y === yTop || y === yTop + 1) v += 0.35;
        let col = px.ramp(CITYR, clamp(v * (0.6 + 0.4 * lit), 0, 1), x, y);
        const row = Math.floor((y - yTop) / (4 * Z)), wcol = Math.floor(wx) % 7;
        if ((wcol === 2 || wcol === 4) && ((y - yTop) % Math.max(3, Math.round(4 * Z))) === 1 && row > 0 && hash(cell, row, 62) > 0.4 && lit * 1.2 > hash(cell, row, 63)) col = hex('#ffc060');
        U[y * W + x] = col;
      }
    }
    /* the theatre: tiers of seats cut into the hill */
    const tcx = 292, tcy = o.hyW - Math.max(2, prof(292)) - 4;
    for (let r = 11; r <= 31; r += 4) for (let a = 0; a <= 1; a += 0.005) {
      const ang = Math.PI * (0.06 + 0.88 * a), wx = tcx + Math.cos(ang) * r * 1.5, wy = tcy + Math.sin(ang) * r * 0.55;
      px.dpx(Math.round(sX(wx)), Math.round(sY(wy)), mix(hex('#8a4a3a'), hex('#ffb060'), 0.3 + 0.6 * lit), 0.55 + 0.3 * lit);
    }
  };

  /* a faceless robed figure. o: {U, x, y (feet), h, t, a, glow 0..1 (a gilded ring of light over the head), lean, seed, walk, carry} */
  const CLOAK = hexes(['#07070e', '#131220', '#221c30', '#3a2a3a', '#5a3a38', '#a8683c']);
  lib.robed = function (o) {
    const U = o.U, h = o.h, cx = o.x, fy = o.y, a = o.a === undefined ? 1 : o.a, t = o.t, seed = o.seed || 0, glow = o.glow || 0, lean = o.lean || 0;
    if (a <= 0.01) return;
    const bob = o.walk ? Math.round(Math.abs(Math.sin(t * 5 + seed)) * h * 0.03) : 0, top = fy - h - bob, hr = Math.max(2, h * 0.1);
    for (let j = 0; j <= h; j++) {
      const u = j / h, y = Math.round(top + j); if (y < 0 || y >= H) continue;
      if (u < 0.2) continue;
      const w = h * (u < 0.3 ? 0.1 + 0.1 * (u - 0.2) / 0.1 : 0.2 + 0.07 * (u - 0.3)), sh = lean * u * u * 2 + (o.walk ? Math.sin(t * 5 + seed + u * 3) * 0.04 * h * u : 0);
      const xl = Math.round(cx - w + sh), xr = Math.round(cx + w + sh);
      for (let x = xl; x <= xr; x++) {
        if (x < 0 || x >= W || a <= thr(x, y)) continue;
        const f = (x - xl) / Math.max(1, xr - xl);
        let v = 0.18 + 0.2 * f + 0.05 * Math.sin(x * 0.9 + u * 6);
        if (x === xr) v = 0.95; else if (x === xr - 1) v += 0.2;
        if (u > 0.3 && u < 0.34) v = 0.62;                                 /* a cord at the waist */
        U[y * W + x] = px.ramp(CLOAK, clamp(v, 0, 1), x, y);
      }
    }
    const hx = Math.round(cx + lean * 0.1 * 2), hy = Math.round(top + h * 0.1);
    for (let dy = -Math.ceil(hr); dy <= Math.ceil(hr); dy++) for (let dx = -Math.ceil(hr); dx <= Math.ceil(hr); dx++) {
      if (dx * dx + dy * dy > hr * hr || a <= thr(hx + dx, hy + dy)) continue;
      px.set(hx + dx, hy + dy, px.ramp(CLOAK, dx > 0 ? 0.7 : 0.22, hx + dx, hy + dy));    /* a plain head: no face */
    }
    if (o.carry) {                                                           /* a jar on the shoulder */
      const jx = hx - Math.round(hr * 1.6), jy = hy + Math.round(hr * 0.9), jr = Math.max(2, Math.round(h * 0.09));
      for (let dy = -jr; dy <= jr; dy++) for (let dx = -jr; dx <= jr; dx++) if (dx * dx * 1.1 + dy * dy < jr * jr && a > thr(jx + dx, jy + dy)) px.set(jx + dx, jy + dy, px.ramp(STONE, dx > 0 ? 0.7 : 0.35, jx + dx, jy + dy));
    }
    if (glow > 0.02) {
      const gr = hr * 2.4, gc = mix(hex('#ffd070'), hex('#fff6d0'), 0.5 + 0.5 * Math.sin(t * 9 + seed));
      lib.halo(hx, hy, gr * 2.2, hex('#ffc060'), 0.4 * glow * a, 1);
      for (let k = 0; k < 64; k++) { const an = k / 64 * 6.2832; if (a * glow > thr(k, seed)) px.set(Math.round(hx + Math.cos(an) * gr), Math.round(hy + Math.sin(an) * gr * 0.8), gc); }
    }
  };

  /* a harbour ship: hull, mast, a lit sail. o: {U, x, y (waterline), s, t, a} */
  lib.ship = function (o) {
    const U = o.U, s = o.s, x = Math.round(o.x), y = Math.round(o.y), a = o.a === undefined ? 1 : o.a, bob = Math.round(Math.sin(o.t * 0.8 + x) * 0.6);
    const hull = hex('#0c0912'), hull2 = hex('#2a1c28'), sail = [hex('#3a2a36'), hex('#8a5a48'), hex('#d89860'), hex('#ffd890')];
    for (let i = -Math.round(11 * s); i <= Math.round(11 * s); i++) {
      const hh = Math.round((3.2 - Math.abs(i) / (11 * s) * 2.2) * s);
      for (let j = 0; j < hh; j++) if (a > thr(x + i, y + j)) px.set(x + i, y + bob - j, j === hh - 1 ? hull2 : hull);
    }
    for (let j = 0; j < 22 * s; j++) if (a > thr(x, y)) px.set(x, y + bob - Math.round(3 * s) - j, hull);
    for (let j = 2; j < 20 * s; j++) {
      const wdt = Math.round((1 - j / (20 * s)) * 8 * s);
      for (let i = 1; i <= wdt; i++) { const X = x + i, Y = y + bob - Math.round(3 * s) - j; if (a > thr(X, Y)) px.set(X, Y, px.ramp(sail, 0.2 + 0.7 * (i / Math.max(1, wdt)) * (1 - j / (22 * s)) + 0.12, X, Y)); }
    }
  };

  /* the tree of life: a golden tree growing in light. o: {U, x, y (base), z, t, k 0..1, glow} */
  lib.treeOfLife = function (o) {
    const U = o.U, z = o.z, t = o.t, k = o.k; if (k <= 0.01) return;
    const leaf = hexes(['#8a4420', '#c8702a', '#f2a444', '#ffd070', '#ffe9a0', '#fff6d0']);
    if (o.glow !== 0) lib.halo(o.x, o.y - 40 * z, 74 * z * (0.5 + 0.5 * k), hex('#ffc060'), 0.5 * k * (o.glow === undefined ? 1 : o.glow), 0.9);
    const seg = (x0, y0, x1, y1, wd) => {
      const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0)));
      for (let i = 0; i <= n; i++) { const x = x0 + (x1 - x0) * i / n, y = y0 + (y1 - y0) * i / n; for (let d = 0; d < wd; d++) px.set(Math.round(x + d - wd / 2), Math.round(y), px.ramp(BARK, 0.15 + 0.7 * (d / Math.max(1, wd - 1)), Math.round(x) + d, Math.round(y))); }
    };
    const branch = (x0, y0, ang, len, wd, depth, seed) => {
      const g = clamp(k * 6.2 - depth * 1.0, 0, 1); if (g <= 0) return;
      ang += Math.sin(t * 0.9 + depth * 0.8 + seed) * 0.035 * depth;
      const L = len * g, x1 = x0 + Math.cos(ang) * L, y1 = y0 + Math.sin(ang) * L;
      seg(x0, y0, x1, y1, Math.max(1, Math.round(wd)));
      if (depth < 4) {
        const nk = depth < 2 ? 3 : 2;
        for (let c = 0; c < nk; c++) { const off = (nk === 3 ? (c - 1) * 0.62 : (c ? 0.5 : -0.5)) + (hash(seed + c, depth, 91) - 0.5) * 0.4; branch(x1, y1, ang + off, len * 0.7, wd * 0.62, depth + 1, seed * 3 + c + 1); }
      } else {
        const lc = clamp(k * 6.2 - 4.2, 0, 1);
        for (let n = 0; n < 28; n++) {
          const r1 = hash(seed, n, 92), r2 = hash(seed, n, 93), an = r1 * 6.283, rr = (1 + r2 * 8) * z * 0.6 * lc, lx = x1 + Math.cos(an) * rr, ly = y1 + Math.sin(an) * rr * 0.8;
          const tw = 0.5 + 0.5 * Math.sin(t * 3 + n * 2 + seed), cc = leaf[Math.min(5, 1 + ((r2 * 4 + tw * 2) | 0))];
          if (lc > thr(n, seed)) { px.set(Math.round(lx), Math.round(ly), cc); if (r1 > 0.7) px.set(Math.round(lx) + 1, Math.round(ly), leaf[3]); }
        }
        if (hash(seed, 1, 94) > 0.55 && lc > 0.5) px.set(Math.round(x1), Math.round(y1 + 2), hex('#ffffff'));      /* a fruit of light */
      }
    };
    branch(o.x, o.y, -Math.PI / 2, 24 * z, 7 * z * 0.6, 0, 7);
  };

  /* ============================================================================
   *  EPISODE 7 ADDITIONS · Smyrna
   *  smyrnaStreet (a narrow stone street at night with one lit window), rain,
   *  crown (a crown of life that shimmers into being)
   *  World units as in Episode 6: Screen = (240 + (wx - cx) * Z, 112 + (wy - cy) * Z); the street floor is y = 0.
   * ========================================================================== */
  const COLD = hexes(['#04060e', '#0a1022', '#121c3a', '#1e2c52', '#2e4272', '#4a64a0', '#8aa4d0', '#c8dcff']);
  lib.COLD = COLD;

  /* o: {U, cx, cy, Z, t, glow 0..1.5 (the window's light on the wall and the wet street), lamp 0..1 (the lamp inside), bars 0..1, wet} */
  lib.smyrnaStreet = function (o) {
    const U = o.U, Z = o.Z, glow = o.glow || 0, lamp = o.lamp === undefined ? 1 : o.lamp, bars = o.bars || 0;
    const sky = [hex('#04060e'), hex('#0a1022'), hex('#121c3a'), hex('#1e2c52')];
    const amber = [hex('#0a0810'), hex('#3a1c18'), hex('#8a4a22'), hex('#d8902e'), hex('#ffc860'), hex('#fff0b0')];
    const WALLTOP = -104;
    for (let y = 0; y < H; y++) {
      const wy = o.cy + (y - 112) / Z;
      for (let x = 0; x < W; x++) {
        const wx = o.cx + (x - 240) / Z;
        let col;
        if (wy < WALLTOP - 6) {                                                     /* rain cloud above the roofs */
          const n = px.fbm(wx * 0.012 + o.t * 0.01, wy * 0.02, 3, 21);
          col = px.ramp(sky, clamp(0.25 + 0.55 * n + 0.2 * glow * Math.exp(-(wx * wx) / 40000), 0, 1), x, y);
        } else if (wy < 0) {
          /* the roof eave */
          if (wy < WALLTOP) { col = px.ramp(COLD, wy > WALLTOP - 3 ? 0.4 : 0.14, x, y); }
          else {
            const row = Math.floor(-wy / 9), off = (row & 1) * 10, bx = Math.floor((wx + off + 1000) / 20), mr = ((-wy) % 9) < 1, mc = ((wx + off + 1000) % 20) < 1;
            let v = 0.2 + 0.14 * hash(bx, row, 71) + 0.1 * (1 + wy / 104) * 0 - 0.08 * Math.pow(-wy / 104, 2) * 0;
            if (mr || mc) v -= 0.1;
            const dx = wx, dy = wy + 45, g = glow * Math.exp(-(dx * dx + dy * dy) / 2600);
            v += 0.05 * px.fbm(wx * 0.05, wy * 0.05, 2, 31);
            col = px.ramp(COLD, clamp(v, 0, 1), x, y);
            if (g > 0.02) col = mix(col, px.ramp(amber, clamp(0.2 + 0.7 * g, 0, 1), x, y), clamp(g * 0.9, 0, 0.85));
            /* the lit window: an arched opening with open shutters */
            const wxl = Math.abs(wx), inRect = wxl < 11 && wy > -62 && wy < -30, arch = wy < -52 && wxl * wxl / 121 + Math.pow((wy + 52) / 10, 2) > 1;
            const win = inRect && !arch;
            if (win) {
              const iv = lamp * (0.62 + 0.3 * Math.exp(-(wx * wx + Math.pow(wy + 38, 2)) / 220)) + 0.1;
              col = px.ramp(amber, clamp(iv, 0, 1), x, y);
              if (bars > 0 && (((Math.round(wx + 11) % 5) === 0) || (Math.abs(wy + 46) < 0.7) || (Math.abs(wy + 36) < 0.7))) col = hex('#050710');
            } else {
              const frame = wxl < 14 && wy > -65 && wy < -27 && !(wxl < 11 && wy > -62 && wy < -30);
              if (frame) col = px.ramp(COLD, 0.5 - 0.1 * (wx > 0 ? 0 : 1) + 0.3 * glow, x, y);
              if (wxl >= 14 && wxl < 22 && wy > -62 && wy < -30) col = px.ramp([hex('#0a0608'), hex('#241410'), hex('#3a2418')], 0.3 + 0.3 * hash(Math.floor(wx), 3, 5), x, y);   /* open shutters */
            }
            /* a doorway (planked, in a stone frame) and a dark window beside */
            const dxx = wx + 72, dOut = Math.abs(dxx) < 13 && wy > -44 && (wy > -30 || Math.abs(dxx) * Math.abs(dxx) / 169 + Math.pow((wy + 30) / 14, 2) < 1), dIn = Math.abs(dxx) < 11 && wy > -42 && (wy > -30 || dxx * dxx / 121 + Math.pow((wy + 30) / 12, 2) < 1);
            if (dOut) col = dIn ? px.ramp(COLD, 0.05 + 0.04 * (Math.floor(wx) % 4 === 0 ? 1 : 0) + 0.1 * glow * Math.exp(-(wx + 40) * (wx + 40) / 900), x, y) : px.ramp(COLD, 0.36 + 0.2 * glow, x, y);
            const wOut = wx > 61 && wx < 79 && wy > -60 && wy < -34, wIn = wx > 63 && wx < 77 && wy > -58 && wy < -36;
            if (wOut) col = wIn ? px.ramp(COLD, 0.05 + (Math.abs(wx - 70) < 0.6 ? 0.2 : 0), x, y) : px.ramp(COLD, 0.34 + 0.2 * glow, x, y);
          }
        } else {
          /* the wet cobbles, reflecting the window */
          const row = Math.floor(Math.pow(wy, 0.9) / 3.5), cb = Math.floor((wx + (row & 1) * 6 + 1000) / 12), mc = ((wx + (row & 1) * 6 + 1000) % 12) < 1;
          let v = 0.3 - 0.2 * Math.min(1, wy / 90) + 0.08 * hash(cb, row, 72) - (mc ? 0.08 : 0);
          const refl = glow * Math.exp(-(wx * wx) / (260 + wy * 6)) * Math.max(0, 1 - wy / 90) * (0.6 + 0.4 * hash(cb, row, 73));
          col = px.ramp(COLD, clamp(v, 0, 1), x, y);
          if (refl > 0.02) col = mix(col, px.ramp(amber, clamp(0.2 + 0.8 * refl, 0, 1), x, y), clamp(refl * 1.1, 0, 0.9));
        }
        U[y * W + x] = col;
      }
    }
    /* a sill with the lamp, and a stone ledge running along the foot of the wall */
    const sx = (wx) => 240 + (wx - o.cx) * Z, sy = (wy) => 112 + (wy - o.cy) * Z;
    for (let x = Math.round(sx(-14)); x <= Math.round(sx(14)); x++) for (let j = 0; j < Math.max(2, Math.round(3 * Z)); j++) px.set(x, Math.round(sy(-30)) + j, px.ramp(COLD, 0.55 - 0.1 * j, x, j));
    for (let x = 0; x < W; x++) for (let j = 0; j < Math.max(1, Math.round(5 * Z)); j++) px.set(x, Math.round(sy(-5)) + j, px.ramp(COLD, 0.5 - 0.16 * j / Z * 1.6 + 0.2 * glow, x, j));
    const lx = Math.round(sx(0)), ly = Math.round(sy(-30)) - 1;
    for (let j = 0; j < Math.max(2, Math.round(3 * Z)); j++) for (let i = -Math.round(2.6 * Z); i <= Math.round(2.6 * Z); i++) px.set(lx + i, ly - j, px.ramp(amber, i < 0 ? 0.35 : 0.15, i, j));   /* the clay lamp */
    if (lamp > 0.02) lib.flame({ x: lx, y: ly - Math.round(5 * Z), k: lamp, pop: o.pop || 0, t: o.t, seed: 5, s: clamp(0.5 * Z + 0.8, 1.2, 4.5), glow: 1 + 0.4 * glow });
  };

  /* o: {t, k 0..1, wind (-1..1 slant), col} */
  lib.rain = function (o) {
    const k = o.k; if (k <= 0.02) return;
    const n = Math.round(150 * k), col = o.col || hex('#9ab4e0'), sl = o.wind === undefined ? 0.25 : o.wind;
    for (let i = 0; i < n; i++) {
      const r1 = hash(i, 1, 33), r2 = hash(i, 2, 33), sp = 190 + 150 * r2, len = 4 + ((r2 * 5) | 0);
      const y = (r1 * (H + 40) + o.t * sp) % (H + 40) - 20, x = (hash(i, 3, 33) * (W + 80) - o.t * sp * sl * 0.5 + 4000) % (W + 80) - 40 + y * sl * 0.5;
      for (let j = 0; j < len; j++) px.dpx(Math.round(x - j * sl), Math.round(y - j), col, k * 0.55 * (1 - j / len));
    }
  };

  /* a crown of life, shimmering into being. o: {U, x, y (centre of the band), z, k 0..1, t, glow} */
  lib.crown = function (o) {
    const k = o.k, z = o.z, x = o.x, y = o.y, t = o.t; if (k <= 0.01) return;
    const gold = hexes(['#8a4420', '#c8702a', '#f2a444', '#ffd070', '#ffe9a0', '#fff6d0']);
    lib.halo(x, y - 6 * z, 40 * z * (0.5 + 0.5 * k), hex('#ffd890'), 0.5 * k * (o.glow === undefined ? 1 : o.glow), 0.8);
    const W2 = 12 * z, steps = Math.round(W2 * 2 * 1.4);
    for (let i = 0; i <= steps; i++) {
      const u = i / steps, ph = clamp(k * 1.6 - u * 0.6, 0, 1); if (ph <= 0) continue;
      const wx = x + (u * 2 - 1) * W2, band = y + 2.2 * z * Math.pow(u * 2 - 1, 2) * 0.6;
      for (let j = 0; j < Math.max(2, Math.round(2.6 * z)); j++) px.dpx(Math.round(wx), Math.round(band) + j - 1, px.ramp(gold, 0.45 + 0.4 * (1 - j / (2.6 * z)) + 0.15 * Math.sin(t * 3 + u * 12), Math.round(wx), j), ph);
    }
    for (let p = -2; p <= 2; p++) {
      const u = (p + 2) / 4, ph = clamp(k * 1.7 - u * 0.7, 0, 1); if (ph <= 0) continue;
      const bx = x + p * W2 / 2, base = y + 2.2 * z * Math.pow(p / 2, 2) * 0.6, tip = base - (p === 0 ? 11 : (p & 1) ? 8 : 9.5) * z * ph;
      for (let yy = Math.round(tip); yy < base; yy++) { const f = (yy - tip) / Math.max(1, base - tip), hw = f * 2.2 * z; for (let xx = Math.round(bx - hw); xx <= Math.round(bx + hw); xx++) px.dpx(xx, yy, px.ramp(gold, 0.4 + 0.5 * (1 - f) + (xx < bx ? 0.1 : -0.05), xx, yy), ph); }
      if (ph > 0.9) { px.set(Math.round(bx), Math.round(tip) - 1, hex('#ffffff')); lib.halo(bx, tip, 4 * z, hex('#fff0c0'), 0.5 * (0.6 + 0.4 * Math.sin(t * 4 + p)), 1); }
    }
    for (let i = 0; i < 14; i++) { const a = hash(i, 4, 77), tw = Math.sin(t * 3.4 + i * 1.7); if (tw > 0.6) { const sx = x + (a * 2 - 1) * 15 * z, sy = y - (hash(i, 5, 77) * 12) * z; px.set(Math.round(sx), Math.round(sy), hex('#ffffff')); px.dpx(Math.round(sx) + 1, Math.round(sy), hex('#fff0c0'), 0.6); px.dpx(Math.round(sx) - 1, Math.round(sy), hex('#fff0c0'), 0.6); } }
  };

  /* ============================================================================
   *  EPISODE 8 ADDITIONS · Pergamum
   *  crimson (the dark crimson ramps), acropolis (a steep terraced citadel hill, backlit),
   *  throne (a dark stone seat with a tall back), idol (a faceless statue), whiteStone (a glowing white stone
   *  whose new name is written in marks we cannot read)
   *  World units as in Episodes 6 and 7: Screen = (240 + (wx - cx) * Z, 112 + (wy - cy) * Z); the town floor is y = 0.
   * ========================================================================== */
  const CRIM = hexes(['#050205', '#12040a', '#240810', '#3c0e16', '#661a1e', '#a02c22', '#e0602a', '#ffb060']);
  lib.CRIM = CRIM;
  const PERG_H = (wx) => {
    const base = 160 * sstep(-140, 130, wx) - 160 * sstep(170, 440, wx);
    return base <= 2 ? 0 : (wx > -50 && wx < 210 ? Math.floor(base / 16) * 16 + 6 * sstep(-50, 0, wx) : base);
  };
  lib.pergamumHeight = PERG_H;

  /* the acropolis. o: {U, cx, cy, Z, t, lit 0..1 (how much of the crimson light), sunX (screen), sunY (screen)} */
  lib.acropolis = function (o) {
    const U = o.U, Z = o.Z, sX = (wx) => 240 + (wx - o.cx) * Z, sY = (wy) => 112 + (wy - o.cy) * Z, lit = o.lit === undefined ? 1 : o.lit;
    const yFloor = Math.round(sY(0));
    for (let x = 0; x < W; x++) {
      const wx = o.cx + (x - 240) / Z, h = PERG_H(wx); if (h <= 0) continue;
      const yTop = Math.round(sY(-h));
      for (let y = Math.max(0, yTop); y < Math.min(H, yFloor + 2); y++) {
        const dd = (y - yTop) / Math.max(1, yFloor - yTop), wy = -(h - (y - yTop) / Z);
        let v = 0.15 + 0.12 * px.fbm(wx * 0.06, wy * 0.06, 3, 15) + 0.1 * (1 - dd) * lit + 0.3 * lit * Math.exp(-(Math.pow(wx - 100, 2) / 19600 + Math.pow(wy + 150, 2) / 12100));
        const ec = Math.floor(-wy / 9), isMort = ((-wy) % 9) < 1 && wx > -50 && wx < 215;
        if (isMort) v -= 0.07;
        if (isMort === false && wx > -50 && wx < 215 && hash(Math.floor(wx / 6), ec, 84) > 0.965 && (((wx % 6) + 6) % 6) < 2.6 && ((-wy) % 9) < 4.5 && lit > 0.3) { U[y * W + x] = hex('#ff9a3a'); continue; }
        if (y - yTop < 2) v = 0.78 * lit + 0.1;                                   /* the rim of the terrace, hard-lit */
        else if (wx > 40 && PERG_H(wx - 1.5) < h - 2) v += 0.28 * lit;               /* a step's lit face */
        U[y * W + x] = px.ramp(CRIM, clamp(v, 0, 1), x, y);
      }
    }
    /* the temple colonnade on the summit terrace, and the great altar's wall below it */
    lib.colonnade({ U, cx: o.cx, cy: o.cy + PERG_H(110), Z, x0: 74, n: 6, gap: 17, h: 38, w: 5, lit: 0.45 });
    lib.colonnade({ U, cx: o.cx, cy: o.cy + PERG_H(30), Z, x0: 8, n: 4, gap: 15, h: 26, w: 4, lit: 0.3 });
    /* the town at the foot of the hill: dark roofs with a few lit windows */
    for (let x = 0; x < W; x++) {
      const wx = o.cx + (x - 240) / Z, cell = Math.floor(wx / 9), bh = 8 + hash(cell, 1, 81) * 14;
      if (wx > -40 && wx < 400) continue;
      const yTop = Math.round(sY(-bh)); for (let y = Math.max(0, yTop); y < Math.min(H, yFloor + 1); y++) {
        let col = px.ramp(CRIM, y - yTop < 1 ? 0.6 * lit + 0.1 : 0.07 + 0.05 * hash(cell, 2, 81), x, y);
        if (((Math.floor(wx) % 9) === 3) && ((y - yTop) % Math.max(4, Math.round(5 * Z))) === 2 && hash(cell, Math.floor((y - yTop) / (5 * Z)), 82) > 0.5) col = hex('#ff9a3a');
        U[y * W + x] = col;
      }
    }
  };

  /* a throne: a tall-backed seat of dark stone, rim-lit. o: {U, x, y (floor), z, k, t} */
  lib.throne = function (o) {
    const U = o.U, z = o.z, x = Math.round(o.x), y = Math.round(o.y), k = o.k === undefined ? 1 : o.k;
    /* one dark silhouette (tall back, arms, seat, step) with a hard rim of crimson light on its right and top edges */
    const inside = (u, v) => (Math.abs(u) <= 13 && v >= 0 && v <= 2) || (Math.abs(u) <= 12 && v > 2 && v <= 58) || (Math.abs(u) <= 14.5 && v > 16 && v <= 26) || (Math.abs(u) <= 8 && v > 58 && v <= 63);
    for (let j = 0; j < 66 * z; j++) for (let i = -Math.ceil(16 * z); i <= Math.ceil(16 * z); i++) {
      const u = i / z, v = j / z; if (!inside(u, v)) continue;
      const X = x + i, Y = y - j, edgeR = !inside(u + 1.4 / z, v), edgeT = !inside(u, v + 1.4 / z);
      if (k > px.thr(X, Y)) px.set(X, Y, px.ramp(CRIM, edgeR ? 0.9 : edgeT ? 0.74 : 0.04 + 0.03 * (u > 0 ? 1 : 0), X, Y));
    }
  };

  /* a faceless idol: a stone figure on a plinth. o: {U, x, y (feet), h, t, a} */
  lib.idol = function (o) {
    const h = o.h, x = Math.round(o.x), y = Math.round(o.y), a = o.a === undefined ? 1 : o.a;
    for (let j = 0; j < h; j++) {
      const u = j / h, w = Math.round(h * (u < 0.12 ? 0.3 : u < 0.62 ? 0.16 - 0.04 * u : u < 0.74 ? 0.26 : 0.09));
      for (let i = -w; i <= w; i++) { const X = x + i, Y = y - j; if (a > px.thr(X, Y)) px.set(X, Y, px.ramp(CRIM, i === w ? 0.8 : (i > 0 ? 0.3 : 0.1) + (u > 0.9 ? 0.1 : 0), X, Y)); }
    }
    const hr = Math.max(2, Math.round(h * 0.11)), hy = y - h - hr;
    for (let dy = -hr; dy <= hr; dy++) for (let dx = -hr; dx <= hr; dx++) if (dx * dx + dy * dy <= hr * hr && a > px.thr(x + dx, hy + dy)) px.set(x + dx, hy + dy, px.ramp(CRIM, dx > 0 ? 0.62 : 0.14, x + dx, hy + dy));   /* a smooth head: no face */
  };

  /* a white stone with a new name written on it, in marks nobody can read. o: {U, x, y, z, k, t} */
  lib.whiteStone = function (o) {
    const k = o.k, z = o.z, x = Math.round(o.x), y = Math.round(o.y), t = o.t; if (k <= 0.01) return;
    lib.halo(x, y, 38 * z * (0.6 + 0.4 * k), hex('#ffffff'), 0.5 * k, 0.9);
    lib.halo(x, y, 70 * z * (0.6 + 0.4 * k), hex('#cfe0ff'), 0.2 * k, 0.9);
    const rx = 11 * z, ry = 8 * z, wh = hexes(['#7a86a8', '#aab6d6', '#d8e2f6', '#f2f6ff', '#ffffff']);
    for (let dy = -Math.ceil(ry); dy <= Math.ceil(ry); dy++) for (let dx = -Math.ceil(rx); dx <= Math.ceil(rx); dx++) {
      const d = (dx * dx) / (rx * rx) + (dy * dy) / (ry * ry); if (d > 1 || k <= px.thr(x + dx, y + dy)) continue;
      const nx = dx / rx, ny = dy / ry, v = clamp(0.62 - 0.35 * nx * 0.7 - 0.3 * ny + 0.25 * (1 - d) + 0.05 * Math.sin(t * 1.4), 0, 1);
      px.set(x + dx, y + dy, px.ramp(wh, v, x + dx, y + dy));
    }
    /* the new name: three lines of marks, written in a hand we cannot read; they re-form slowly */
    const seed = Math.floor(t * 0.7);
    for (let row = 0; row < 3; row++) {
      const n = 4 + ((hash(row, seed, 91) * 3) | 0), x0 = x - Math.round((n * 2.6 * z) / 2), yy = y - Math.round(3.2 * z) + Math.round(row * 3.2 * z);
      for (let m = 0; m < n; m++) {
        const mx = x0 + Math.round(m * 2.6 * z), kind = (hash(m, row + seed * 7, 92) * 4) | 0, hgt = Math.max(2, Math.round(2.2 * z)), c = mix(hex('#8a6a30'), hex('#d8a040'), 0.5 + 0.5 * Math.sin(t * 2 + m + row));
        if (Math.abs(x0 + (n * 1.3 * z) - mx) > rx * 0.7) continue;
        for (let j = 0; j < hgt; j++) { px.dpx(mx, yy + j, c, k); if (kind === 1 && j === 0) px.dpx(mx + 1, yy, c, k); if (kind === 2 && j === hgt - 1) px.dpx(mx + 1, yy + j, c, k); if (kind === 3 && j === (hgt >> 1)) px.dpx(mx - 1, yy + j, c, k); }
      }
    }
  };

  /* ============================================================================
   *  EPISODE 9 ADDITIONS · Thyatira
   *  forge (the forge-city: a vaulted hall of stone with a great furnace), anvil
   *  World units as in Episodes 6-8: Screen = (240 + (wx - cx) * Z, 112 + (wy - cy) * Z); the floor is y = 0; the furnace is at x = 0.
   * ========================================================================== */
  const BRONZE = hexes(['#050302', '#140a05', '#2a140a', '#4a2410', '#7a3a14', '#b45e1c', '#f0902a', '#ffd070', '#fff4c8']);
  lib.BRONZE = BRONZE;

  /* o: {U, cx, cy, Z, t, heat 0..1} */
  lib.forge = function (o) {
    const U = o.U, Z = o.Z, heat = o.heat === undefined ? 1 : o.heat, t = o.t;
    for (let y = 0; y < H; y++) {
      const wy = o.cy + (y - 112) / Z;
      for (let x = 0; x < W; x++) {
        const wx = o.cx + (x - 240) / Z;
        let v, col;
        if (wy > 0) {                                                                /* the floor, with the furnace on the stones */
          const d = Math.min(1, wy / 70), cb = Math.floor((wx + (Math.floor(wy / 7) & 1) * 7 + 1000) / 14);
          v = 0.1 + 0.05 * hash(cb, Math.floor(wy / 7), 74) + heat * 0.5 * Math.exp(-(wx * wx) / (900 + wy * 40)) * (1 - d * 0.7) * (0.75 + 0.25 * hash(cb, 2, 75));
          col = px.ramp(BRONZE, clamp(v, 0, 1), x, y);
        } else if (wy < -140) {
          col = px.ramp(BRONZE, 0.02 + 0.03 * px.fbm(wx * 0.02, wy * 0.02 + t * 0.02, 2, 61), x, y);
        } else {
          const row = Math.floor(-wy / 8), off = (row & 1) * 9, bx = Math.floor((wx + off + 1000) / 18), mr = ((-wy) % 8) < 1, mc = ((wx + off + 1000) % 18) < 1;
          const glow = heat * Math.exp(-(wx * wx + Math.pow(wy + 26, 2)) / 7000);
          v = 0.05 + 0.05 * hash(bx, row, 73) + 0.58 * glow * (mr || mc ? 0.7 : 1) + 0.04 * px.fbm(wx * 0.05, wy * 0.05, 2, 62);
          /* the vaulted piers */
          for (const pc of [-200, -110, 110, 200]) if (Math.abs(wx - pc) < 7) { v = 0.05 + 0.4 * glow + (wx > pc + 4 ? 0.12 : 0); }
          col = px.ramp(BRONZE, clamp(v, 0, 1), x, y);
          /* the furnace mouth: an arch of white-hot fire */
          const ax = Math.abs(wx), inArch = ax < 24 && wy > -46 && (wy > -30 || (ax * ax) / 576 + Math.pow((wy + 30) / 16, 2) < 1);
          if (inArch) {
            const d = Math.sqrt((wx * wx) / 576 + Math.pow((wy + 12) / 36, 2)), fl = 0.5 + 0.5 * px.fbm(wx * 0.15, wy * 0.12 - t * 1.6, 3, 63);
            col = px.ramp(BRONZE, clamp((0.95 - 0.75 * d + 0.3 * fl - 0.1) * (0.15 + 0.85 * heat), 0, 1), x, y);
          } else if (ax < 30 && wy > -52 && wy < -44) col = px.ramp(BRONZE, 0.15 + 0.3 * heat, x, y);                    /* the lintel */
          else if (ax < 34 && wy > -96 && wy <= -52 && ax < 34 - (-52 - wy) * 0.35) col = px.ramp(BRONZE, 0.05 + 0.18 * glow, x, y);   /* the hood */
        }
        U[y * W + x] = col;
      }
    }
  };

  /* an anvil. o: {U, x, y (floor), z, glow 0..1 (the iron's heat), hit 0..1 (the instant of a hammer blow)} */
  lib.anvil = function (o) {
    const U = o.U, z = o.z, x = Math.round(o.x), y = Math.round(o.y), glow = o.glow || 0, hit = o.hit || 0;
    const iron = hexes(['#030202', '#0e0a0a', '#241818', '#4a3030', '#8a5a40', '#e08a40', '#fff0b0']);
    const blk = (x0, y0, w, h, base) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) { const X = x + x0 + i, Y = y - y0 - j; px.set(X, Y, px.ramp(iron, clamp(base + 0.18 * (i / w) + (j === h - 1 ? 0.3 * glow + 0.4 * hit : 0), 0, 1), X, Y)); } };
    blk(Math.round(-9 * z), 0, Math.round(18 * z), Math.round(3 * z), 0.12);               /* the base */
    blk(Math.round(-5 * z), Math.round(3 * z), Math.round(10 * z), Math.round(5 * z), 0.1);  /* the waist */
    blk(Math.round(-11 * z), Math.round(8 * z), Math.round(22 * z), Math.round(4 * z), 0.16 + 0.3 * glow); /* the face */
    for (let k = 0; k < Math.round(7 * z); k++) for (let j = 0; j < Math.round(3.5 * z * (1 - k / (7 * z))); j++) px.set(x - Math.round(11 * z) - k, y - Math.round(10.5 * z) + j, px.ramp(iron, 0.18 + 0.3 * glow, k, j));   /* the horn */
    if (glow > 0.05 || hit > 0.05) lib.halo(x, y - 12 * z, 16 * z, hex('#ff8a2a'), 0.3 * glow + 0.6 * hit, 0.9);
  };

  /* ============================================================================
   *  EPISODE 10 ADDITIONS · Thyatira II
   *  scepter (a rod of iron that rises from an ember), pot (a clay pot, to be shattered)
   * ========================================================================== */
  const CLAY = hexes(['#2a1008', '#5a2a14', '#8a4a24', '#c0763a', '#e8a060', '#fff0c8']);
  lib.CLAY = CLAY;

  /* o: {U, x, y (base), h (full height), k 0..1 (how much has risen), heat 0..1, t} */
  lib.scepter = function (o) {
    const U = o.U, k = o.k, h = o.h * k, x = Math.round(o.x), y = Math.round(o.y), w = o.w || 4, heat = o.heat === undefined ? 1 : o.heat, t = o.t;
    if (k <= 0.01) return;
    const iron = hexes(['#06070c', '#12141e', '#222838', '#3c4660', '#6a7898', '#aab6d0', '#f0f4ff']);
    for (let j = 0; j < h; j++) {
      const u = j / Math.max(1, o.h), hot = clamp((heat * (0.35 + 0.65 * u) + (j > h - 8 ? 0.4 * heat : 0)), 0, 1), Y = Math.round(y - j);
      for (let i = -w; i <= w; i++) {
        const f = (i + w) / (2 * w), band = (j % 14) < 2 ? 0.12 : 0;
        let v = 0.2 + 0.5 * f * f + band;
        let col = px.ramp(iron, clamp(v + (i === w ? 0.2 : 0), 0, 1), x + i, Y);
        if (hot > 0.05) col = mix(col, px.ramp(lib.BRONZE, clamp(0.35 + 0.6 * hot - 0.2 * Math.abs(i) / w, 0, 1), x + i, Y), clamp(hot * 1.15, 0, 0.95));
        px.set(x + i, Y, col);
      }
    }
    const ty = Math.round(y - h), r = w + 3;
    for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) if (dx * dx + dy * dy <= r * r) px.set(x + dx, ty + dy - 1, px.ramp(lib.BRONZE, clamp((0.55 + 0.4 * heat) - 0.12 * dy / r - 0.1 * Math.abs(dx) / r, 0, 1), x + dx, ty + dy));      /* the knob at its head */
    lib.halo(x, ty, 40 * (0.4 + 0.6 * heat) + 10, hex('#ffb040'), 0.6 * heat, 0.8);
    lib.halo(x, y - h * 0.5, 30 + 0.2 * h, hex('#ff8a2a'), 0.25 * heat, 0.9);
  };

  /* a clay pot. o: {U, x, y (base), z, a, t} */
  lib.pot = function (o) {
    const U = o.U, z = o.z, x = Math.round(o.x), y = Math.round(o.y), a = o.a === undefined ? 1 : o.a;
    for (let j = 0; j < 20 * z; j++) {
      const u = j / (20 * z), w = Math.round(z * (u < 0.15 ? 3.5 + 20 * u : u < 0.7 ? 6.5 - 1.5 * Math.abs(u - 0.45) * 3 : 5 - (u - 0.7) * 10));
      for (let i = -w; i <= w; i++) { const X = x + i, Y = y - j; if (a > px.thr(X, Y)) px.set(X, Y, px.ramp(CLAY, clamp(0.18 + 0.5 * (i + w) / (2 * w) + (i === w ? 0.15 : 0) + (j % 9 === 0 ? -0.08 : 0), 0, 1), X, Y)); }
    }
    for (let i = -Math.round(3 * z); i <= Math.round(3 * z); i++) if (a > px.thr(x + i, y - Math.round(20 * z))) px.set(x + i, y - Math.round(20 * z), px.ramp(CLAY, i > 0 ? 0.7 : 0.4, i, 0));
  };

  /* ============================================================================
   *  EPISODES 12-15 ADDITIONS · Philadelphia, Laodicea, the door
   *  HONEY / LUKE ramps, titleCard (shared title), key (the key of David), marks (glowing unreadable
   *  glyphs), pillar (a white pillar that grows), lightFig (a figure of light, no face),
   *  philadelphia (a small hill-town under a vast door of light, with storm / shield / tepid states)
   * ========================================================================== */
  const HONEY = hexes(['#1a0f08', '#3d2410', '#7a4a1a', '#b8802a', '#e8b04a', '#ffd987', '#fff3c8']);
  const LUKE = hexes(['#26231d', '#3f3b30', '#625c4a', '#8a8266', '#b0a684', '#cfc6a2', '#e8e0bf']);
  lib.HONEY = HONEY; lib.LUKE = LUKE;

  /* the shared title card: o: {t0, t1, y} */
  lib.titleCard = function (t, word, epNo, o) {
    o = o || {};
    const t0 = o.t0 === undefined ? 1.0 : o.t0, t1 = o.t1 === undefined ? 4.6 : o.t1;
    const k = sstep(t0, t0 + 1.0, t) * (1 - sstep(t1 - 0.8, t1, t));
    if (k <= 0.01) return;
    const gold = [hex('#fff6d0'), hex('#ffe9a0'), hex('#ffd070'), hex('#f2a444'), hex('#c8702a'), hex('#8a4420')];
    let sc = 4; if (px.textWidth(word, sc, 1) > 430) sc = 3;
    const tw = px.textWidth(word, sc, 1), x0t = Math.round(240 - tw / 2), y0 = o.y === undefined ? 66 : o.y, fo = 1 - sstep(t1 - 0.8, t1, t);
    px.scrim(240, y0 + 18, 232, 46, k * 1.05);
    for (let i = 0; i < word.length; i++) {
      const ka = clamp((t - t0 - 0.1 - i * 0.07) / 0.6, 0, 1) * fo; if (ka <= 0) continue;
      const lx = x0t + i * 6 * sc, ch = word[i];
      px.text(ch, lx + 2, y0 + 2, sc, hex('#0a0408'), ka);
      const sweep = lerp(-40, 440, sstep(t0 + 1.1, t0 + 2.6, t));
      px.text(ch, lx, y0, sc, (cc, r, X, Y) => { let col = px.ramp(gold, (r + 1) / (7 * sc), X, Y); const d = (X - Y * 0.7) - sweep; if (d > 0 && d < 8) col = hex(d < 4 ? '#ffffff' : '#fff0c0'); return col; }, ka);
    }
    const sub = 'REVELATION · EPISODE ' + epNo, sw = px.textWidth(sub, 2, 1), sx0 = Math.round(240 - sw / 2), sy0 = y0 - 17, ks = sstep(t0 - 0.1, t0 + 0.8, t) * fo;
    px.text(sub, sx0 + 1, sy0 + 1, 2, hex('#0a0408'), ks); px.text(sub, sx0, sy0, 2, hex('#e8c070'), ks);
    const rule = Math.round(lerp(0, 150, sstep(t0 + 0.6, t0 + 2.0, t))); px.hline(240 - rule, 240 + rule, y0 + 7 * sc + 8, mix(hex('#e8c070'), hex('#0a0408'), 0.15 + (1 - k) * 0.8));
  };

  /* the key of David: a golden key about 40 units tall. o: {x, y (middle of the shaft), z, k 0..1, rot (turning, radians), t, glow} */
  lib.key = function (o) {
    const k = o.k === undefined ? 1 : o.k; if (k <= 0.01) return;
    const z = o.z, x0 = o.x, y0 = o.y, cs = Math.max(0.16, Math.abs(Math.cos(o.rot || 0))), t = o.t;
    lib.halo(Math.round(x0), Math.round(y0), 38 * z, hex('#ffd890'), 0.55 * k * (o.glow === undefined ? 1 : o.glow), 1);
    const bx0 = Math.floor(x0 - 9 * z), bx1 = Math.ceil(x0 + 9 * z), by0 = Math.floor(y0 - 26 * z), by1 = Math.ceil(y0 + 22 * z);
    for (let y = by0; y <= by1; y++) for (let x = bx0; x <= bx1; x++) {
      const u = (x - x0) / z / cs, v = (y0 - y) / z;
      let m = 0, sh = 0.6;
      const rd = Math.hypot(u, v - 17);
      if (rd < 6.2 && rd > 3) { m = 1; sh = 0.55 + 0.35 * (-u / 6) + 0.12 * (v - 17) / 6; }
      else if (Math.abs(u) < 0.95 && v > -17 && v < 11) { m = 1; sh = 0.5 + 0.4 * (-u / 0.95); }
      else if (Math.abs(u) < 2.4 && v > 10 && v < 13) { m = 1; sh = 0.72 - 0.2 * Math.abs(u) / 2.4; }
      else if (u >= 0.9 && u < 6.4 && v > -17 && v < -7.5) {
        const notch = (v > -14.6 && v < -12.6 && u > 3.2) || (v > -11 && v < -9.2 && u > 2.2);
        if (!notch) { m = 1; sh = 0.62 + 0.2 * (v + 17) / 9.5; }
      }
      if (!m) continue;
      if (k < 1 && k <= thr(x, y)) continue;
      px.set(x, y, px.ramp(HONEY, clamp(sh + 0.1 * Math.sin(t * 2.2 + v * 0.3), 0, 1), x, y));
    }
    const g = 0.5 + 0.5 * Math.sin(t * 3.1);
    if (g > 0.6) { const gx = Math.round(x0 - 3 * z * cs), gy = Math.round(y0 - 17 * z - 5 * z); for (let d = 1; d < 5; d++) { px.dpx(gx + d, gy, hex('#ffffff'), k * (1 - d / 5)); px.dpx(gx - d, gy, hex('#ffffff'), k * (1 - d / 5)); px.dpx(gx, gy + d, hex('#ffffff'), k * (1 - d / 5)); px.dpx(gx, gy - d, hex('#ffffff'), k * (1 - d / 5)); } px.set(gx, gy, hex('#ffffff')); }
  };

  /* a row of n glowing marks in a hand we cannot read; k 0..1 lights them one by one. o: {sp, h, col} */
  lib.marks = function (x, y, n, k, t, seed, o) {
    o = o || {}; const sp = o.sp || 5, hgt = o.h || 5;
    for (let m = 0; m < n; m++) {
      const lt = clamp(k * (n + 1) - m, 0, 1); if (lt <= 0.01) continue;
      const mx = Math.round(x + (m - (n - 1) / 2) * sp), kind = (hash(m, seed, 92) * 4) | 0, yy = Math.round(y);
      const c = mix(hex('#d8a040'), hex('#fff0b0'), (0.45 + 0.4 * Math.sin(t * 2 + m + seed)) * (lt < 1 ? 1.4 : 1));
      for (let j = 0; j < hgt; j++) {
        px.dpx(mx, yy + j, c, lt);
        if (kind === 1 && j === 0) px.dpx(mx + 1, yy, c, lt);
        if (kind === 2 && j === hgt - 1) px.dpx(mx + 1, yy + j, c, lt);
        if (kind === 3 && j === (hgt >> 1)) px.dpx(mx - 1, yy + j, c, lt);
        if (kind === 0 && j === 1) px.dpx(mx + 1, yy + j, c, lt);
      }
      lib.halo(mx, yy + (hgt >> 1), 9, hex('#ffd890'), 0.3 * lt, 1);
    }
  };

  /* a white marble pillar that grows from its base. o: {x, y (base), h (px), w (half width), k 0..1, a, glow, t, marks [k1,k2,k3]} */
  lib.pillar = function (o) {
    const k = o.k; if (k <= 0.01) return;
    const WH = hexes(['#4a4658', '#7a748c', '#aaa6bc', '#d4d0e0', '#f2f0fa', '#ffffff']);
    const hh = Math.round(o.h * k), w = o.w, x = Math.round(o.x), y = Math.round(o.y), a = o.a === undefined ? 1 : o.a, gl = o.glow === undefined ? 1 : o.glow;
    lib.halo(x, y - Math.round(hh * 0.5), Math.max(34, hh * 0.9), hex('#ffe9b0'), 0.42 * gl * a, 1.1);
    for (let j = 0; j < hh; j++) {
      const Y = y - j; if (Y < 0 || Y >= H) continue;
      const base = j < 7, cap = hh - j <= 9 && k > 0.97, ww = Math.round(w * (1 - 0.05 * j / Math.max(1, o.h)) + (base ? 3 - j * 0.3 : 0) + (cap ? 3 : 0));
      for (let i = -ww; i <= ww; i++) {
        const X = x + i; if (X < 0 || X >= W || a <= thr(X, Y)) continue;
        const u = i / Math.max(1, ww);
        let v = 0.5 + 0.38 * u + (((i + 400) % 5) === 0 && !base && !cap ? -0.08 : 0) + 0.06 * (1 - j / Math.max(1, hh));
        if (j === 7 || (cap && hh - j === 9) || (cap && hh - j === 1)) v -= 0.22;
        px.set(X, Y, px.ramp(WH, clamp(v, 0, 1), X, Y));
      }
    }
    const mk = o.marks || [0, 0, 0];
    for (let q = 0; q < 3; q++) if (mk[q] > 0.01) lib.marks(x, y - hh * (0.3 + q * 0.17), 3, mk[q], o.t, 4 + q, { sp: Math.max(4, Math.round(w * 0.55)), h: 5 });
  };

  /* a figure of light (white-gold, no face). o: {x, y (feet / hidden base), h, a, t, seed, sway, glow} */
  lib.lightFig = function (o) {
    const h = o.h, x = o.x, y = o.y, a = o.a === undefined ? 1 : o.a, t = o.t, seed = o.seed || 0, sway = o.sway || 0, glow = o.glow === undefined ? 1 : o.glow;
    if (a <= 0.01) return;
    const head = Math.max(2, Math.round(h * 0.1));
    lib.halo(Math.round(x), Math.round(y - h * 0.55), h * 1.0, hex('#fff0c0'), 0.45 * a * glow, 1.1);
    for (let r = 0; r <= h; r++) {
      const f = r / h, hw = f < 0.1 ? head * 0.9 : lerp(h * 0.14, h * 0.3, sstep(0.1, 1, f)), yy = Math.round(y - h + r);
      if (yy < 0 || yy >= H) continue;
      for (let dx = -Math.ceil(hw); dx <= Math.ceil(hw); dx++) {
        if (Math.abs(dx) > hw) continue;
        const u = dx / Math.max(1, hw), X = Math.round(x + dx + Math.sin(t * 1.6 + seed + f * 3) * sway * f);
        if (a <= thr(X, yy)) continue;
        px.set(X, yy, px.ramp(GOLDW, clamp(0.78 - 0.18 * u + 0.12 * (1 - f) + (Math.abs(u) > 0.86 ? 0.18 : 0), 0, 1), X, yy));
      }
    }
    for (let dy = -head; dy <= head; dy++) for (let dx = -head; dx <= head; dx++) if (dx * dx + dy * dy <= head * head) { const X = Math.round(x) + dx, Y = Math.round(y - h - head * 0.5) + dy; if (a > thr(X, Y)) px.set(X, Y, px.ramp(GOLDW, clamp(0.92 - 0.12 * dx / head, 0, 1), X, Y)); }
  };

  /* ---------------------------------------------------------- PHILADELPHIA
   * A small town on a hill under a vast door of light standing in the sky.
   * Screen = (240 + (wx - cx) * z, 112 + (wy - cy) * z). The hill is near wx = 20; the door stands at wx = 60.
   * o: {t, z, cx, cy, lit 0..1, door 0..1 (leaves swung open), dusk 0..1, storm 0..1, shield 0..1, tepid 0..1, flash 0..1}
   * returns {sX, sY, z, groundY(wx), doorX, doorY} so an episode can stand figures on the ground. */
  const PHIL_SKY = hexes(['#1e1226', '#3e2238', '#7a3c44', '#bc5e44', '#ee9650', '#ffcb7c', '#fff0c0']);
  const PHIL_DUSK = hexes(['#0c0a14', '#1a1424', '#2c1e30', '#463040', '#6a4448', '#8a5a4c', '#b07a58']);
  const DOORX = 60, DOORW = 40, DOORT = -96, DOORB = -2, DOORC = DOORT + DOORW;
  const hillY = (wx) => 30 - 40 * Math.exp(-Math.pow((wx - 20) / 75, 2));
  const fgY = (wx) => 70 + 0.12 * (wx + 60) + 3 * Math.sin(wx * 0.07);
  lib.philadelphia = function (o) {
    const U = px.cur(), t = o.t, z = o.z || 1, cx = o.cx || 0, cy = o.cy || 0, lit = o.lit === undefined ? 1 : o.lit, door = o.door === undefined ? 1 : o.door;
    const dusk = o.dusk || 0, storm = o.storm || 0, shield = o.shield || 0, tepid = o.tepid || 0, flash = o.flash || 0;
    const sX = (wx) => 240 + (wx - cx) * z, sY = (wy) => 112 + (wy - cy) * z, wX = (sx) => cx + (sx - 240) / z, wY = (sy) => cy + (sy - 112) / z;
    const skyR = px.mixRamp(PHIL_SKY, PHIL_DUSK, dusk), HZ = 6;
    /* sky and the door of light */
    for (let y = 0; y < H; y++) {
      const wy = wY(y);
      for (let x = 0; x < W; x++) {
        const wx = wX(x);
        const dd = Math.hypot((wx - DOORX) * 0.8, (wy - (DOORT + DOORB) / 2) * 0.55);
        let v = clamp(0.1 + 0.58 * sstep(-130, 8, wy), 0, 1) + 0.5 * lit * Math.exp(-dd * dd / 9000) * (0.4 + 0.6 * door) + 0.14 * (px.fbm(wx * 0.02 + t * 0.012, wy * 0.045, 3, 21) - 0.5);
        let col = px.ramp(skyR, clamp(v, 0, 1), x, y);
        const ax = (wx - DOORX) / DOORW;
        const inside = Math.abs(ax) <= 1 && ((wy >= DOORC && wy <= DOORB) || (wy < DOORC && Math.hypot(wx - DOORX, wy - DOORC) <= DOORW));
        if (inside) {
          const edge = Math.min(1 - Math.abs(ax), wy < DOORC ? (DOORW - Math.hypot(wx - DOORX, wy - DOORC)) / DOORW : 1);
          col = edge < 0.07 ? px.ramp(HONEY, 0.3 + 0.2 * lit, x, y) : px.ramp(HONEY, clamp(0.78 + 0.22 * lit * (0.5 + 0.5 * (wy - DOORT) / (DOORB - DOORT)) + 0.05 * px.fbm(wx * 0.05, wy * 0.1 - t * 0.2, 2, 7), 0, 1), x, y);
          if (lit < 0.97) col = mix(col, px.ramp(skyR, 0.45, x, y), 1 - lit);
        } else if (door > 0.04) {                                     /* the two leaves, swung wide open */
          const L = 9 * door, dl = (DOORX - DOORW) - wx, dr = wx - (DOORX + DOORW);
          if (((dl > 0 && dl < L) || (dr > 0 && dr < L)) && wy > DOORT + 26 - 8 * (dl > 0 ? dl : dr) / L && wy < DOORB + 2) col = px.ramp(HONEY, 0.16 + 0.22 * (1 - (dl > 0 ? dl : dr) / L) * lit, x, y);
        }
        U[y * W + x] = col;
      }
    }
    /* far ridges */
    for (let L = 0; L < 2; L++) for (let x = 0; x < W; x++) {
      const wx = wX(x), top = HZ + (L ? 4 : -8) - (L ? 12 : 9) * px.fbm(wx * (L ? 0.016 : 0.011) + 3 + L * 9, 0.5, 3, 7 + L) - 5 * Math.sin(wx * 0.02 + L);
      const y0 = Math.max(0, Math.floor(sY(top)));
      for (let y = y0; y < H; y++) U[y * W + x] = px.ramp(skyR, (L ? 0.2 : 0.3) + 0.1 * lit * Math.exp(-Math.pow((wx - DOORX) / 100, 2)) + 0.03 * (y === y0 ? 1 : 0), x, y);
    }
    /* the hill, its houses */
    const HILL = hexes(['#0a0608', '#180e0e', '#2a1a14', '#4a2e20', '#7a4a2c', '#b07a44']);
    for (let x = 0; x < W; x++) {
      const wx = wX(x), y0 = Math.max(0, Math.round(sY(hillY(wx))));
      for (let y = y0; y < H; y++) { const d = y - y0; U[y * W + x] = px.ramp(HILL, clamp(0.16 + 0.42 * lit * Math.exp(-Math.pow((wx - DOORX) / 90, 2)) + 0.1 * px.fbm(wx * 0.06, (wY(y)) * 0.08, 2, 3) - 0.004 * d + (d < 2 ? 0.18 * lit : 0), 0, 1), x, y); }
    }
    const rows = [];
    for (let i = 0; i < 26; i++) { const wx = -62 + i * 7.4 + 5 * hash(i, 1, 40), by = hillY(wx) + 1 + 6 * hash(i, 2, 40) - 3; rows.push({ i, wx, by, w: 8 + 6 * hash(i, 3, 40), h: 6 + 5 * hash(i, 4, 40) }); }
    rows.sort((a, b) => a.by - b.by);
    for (const r of rows) {
      const x0 = Math.round(sX(r.wx - r.w / 2)), x1 = Math.round(sX(r.wx + r.w / 2)), yb = Math.round(sY(r.by)), yt = Math.round(sY(r.by - r.h)), rh = Math.max(2, Math.round(3 * z));
      const lv = lit * (0.35 + 0.65 * Math.exp(-Math.pow((r.wx - DOORX) / 80, 2)));
      for (let y = yt; y <= yb; y++) for (let x = x0; x <= x1; x++) { const f = (x - x0) / Math.max(1, x1 - x0); px.set(x, y, px.ramp(HILL, clamp(0.16 + 0.5 * lv * (0.6 + 0.5 * f) + (y < yt + rh ? -0.05 : 0), 0, 1), x, y)); }
      for (let q = 0; q < rh; q++) for (let x = x0 - 1 + q; x <= x1 + 1 - q; x++) px.set(x, yt - rh + q + 1, px.ramp(HILL, clamp(0.1 + 0.3 * lv * (x > (x0 + x1) / 2 ? 1 : 0.5), 0, 1), x, yt - rh + q));
      const nw = 2 + (r.i % 2);
      for (let q = 0; q < nw; q++) { const wx2 = Math.round(x0 + (x1 - x0) * (nw === 1 ? 0.5 : 0.3 + 0.4 * q)), wy2 = yt + Math.max(2, Math.round((yb - yt) * 0.4)); const wl = Math.min(1, lit * (1.1 + 0.3 * Math.sin(t * 2 + r.i * 3 + q))); px.set(wx2, wy2, wl > thr(wx2, wy2) ? hex('#ffe08a') : hex('#b8802a')); px.set(wx2, wy2 + 1, hex('#f2a444')); if (z > 1.3) { px.set(wx2 + 1, wy2, hex('#ffe08a')); px.set(wx2 + 1, wy2 + 1, hex('#f2a444')); } }
    }
    /* the great ray of light falling from the door onto the town */
    const dsx = sX(DOORX), dsy = sY(DOORB);
    if (lit > 0.05) for (let y = Math.max(0, Math.round(dsy)); y < H; y++) for (let x = 0; x < W; x++) {
      const dx = x - dsx, dy = y - dsy, d = Math.hypot(dx, dy); if (d < 4) continue;
      const m = 0.5 + 0.5 * Math.sin(Math.atan2(dx, dy) * 7 + 1.3 + t * 0.2), q = (m - 0.6) * 2.2 * lit * Math.exp(-d / (190 * z)) * (0.3 + 0.7 * door);
      if (q > thr(x, y)) U[y * W + x] = mix(U[y * W + x], hex('#ffe9b0'), 0.18);
    }
    lib.halo(Math.round(dsx), Math.round(dsy - 10 * z), 120 * z, hex('#ffe0a0'), 0.4 * lit * door, 0.9);
    /* the foreground slope and its grass */
    for (let x = 0; x < W; x++) {
      const wx = wX(x), y0 = Math.max(0, Math.round(sY(fgY(wx))));
      for (let y = y0; y < H; y++) U[y * W + x] = px.ramp(HILL, clamp(0.07 + 0.2 * lit * Math.exp(-Math.pow((wx - DOORX) / 120, 2)) - 0.0018 * (y - y0) + (y - y0 < 1 ? 0.18 * lit : 0), 0, 1), x, y);
      if (hash(x, 5, 61) > 0.6) { const gl = 2 + ((hash(x, 6, 61) * 4) | 0), sw = Math.round(Math.sin(t * 2 + x * 0.3) * (o.wind || 0.5)); for (let j = 1; j <= gl; j++) px.set(x + (j > 2 ? sw : 0), y0 - j, px.ramp(HILL, 0.14 + 0.22 * lit + 0.02 * j, x, y0)); }
    }
    /* the hour of testing: the dark front, and the town kept under a dome of light */
    if (storm > 0.01) {
      const sx0 = sX(24), sy0 = sY(4), R = (24 + 96 * shield) * z;
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const n = px.fbm(x * 0.018 + t * 0.14, y * 0.04 - t * 0.04, 3, 31), g = 1 - y / (H * 0.95);
        let k = clamp(storm * 1.5 * (0.35 + g) + (n - 0.55) * storm * 1.6, 0, 1);
        const dd = Math.hypot(x - sx0, (y - sy0) * 1.2), sm = sstep(R * 0.75, R, dd); k *= sm;
        const f = Math.floor(k * 3 + thr(x, y)) / 3; if (f > 0) U[y * W + x] = mix(U[y * W + x], hex('#120912'), 0.8 * f);
      }
      for (let i = 0; i < 70; i++) {
        const ex = ((hash(i, 1, 9) * W + t * (22 + 18 * hash(i, 3, 9))) % W + W) % W, ey = ((hash(i, 2, 9) * H + t * (30 + 25 * hash(i, 3, 9))) % H + H) % H;
        if (Math.hypot(ex - sx0, (ey - sy0) * 1.2) < R) continue;
        px.dpx(Math.round(ex), Math.round(ey), hex(hash(i, 4, 9) > 0.5 ? '#ff8a2a' : '#ffc060'), storm);
      }
      /* the edge of the shield, a thin bright arc */
      if (shield > 0.05) for (let a2 = 0; a2 < 220; a2++) { const an = a2 / 220 * Math.PI, X = Math.round(sx0 + Math.cos(an) * R), Y = Math.round(sy0 - Math.sin(an) * R / 1.2); if (Y < sy0 && Math.sin(an * 24 + t * 2) > -0.2) px.dpx(X, Y, hex('#fff0c0'), 0.55 * shield); }
    }
    if (flash > 0.01) { const f = flash; for (let i = 0; i < W * H; i++) { const x = i % W, y = (i / W) | 0; if (f > thr(x, y)) U[i] = mix(U[i], hex('#fff6e0'), 0.5); } }
    if (tepid > 0.01) for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = y * W + x, c = U[i], l = (0.3 * (c & 255) + 0.59 * ((c >> 8) & 255) + 0.11 * ((c >> 16) & 255)) / 255; U[i] = mix(c, px.ramp(LUKE, clamp(l * 1.08, 0, 1), x, y), tepid); }
    return { sX, sY, z, groundY: fgY, doorX: dsx, doorY: dsy };
  };
})();
