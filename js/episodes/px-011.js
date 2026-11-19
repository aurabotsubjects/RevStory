/* ============================================================================
 *  REVELATION · PIXEL EDITION · Episode 11 · Sardis: Wake Up! · Revelation 3:1–6
 *  2D pixel-art cut (480x200). A slow dolly down a grand hall that looks alive and is hollow.
 *  Faded grandeur; a pulse of waking; a thief in the dark; a few white robes; a scroll of names that
 *  will not be blotted out; a far door begins to glow (Philadelphia). No faces.
 *
 *  0:00  the grey of Episode 10 gives way to the hall, title
 *  0:05  v1  seven stars; the hall seems alive (warm, lamps lit, banners) ... and the life drains out
 *  0:18  v2  wake up! one pulse, a few lamps relit: the things that remain
 *  0:27  v3  like a thief: the hall darkens, a silhouette slips between the columns
 *  0:38  v4  a flash of white: a few walk in white
 *  0:46  v5  the scroll of names glows; a blot cannot touch it
 *  0:57  v6  a calm hearing; the far door starts to glow
 *  1:02  handoff: the far door glows warm (Philadelphia)
 * ========================================================================== */
(function () {
  'use strict';
  const Aura = window.Aura, px = Aura.px, lib = Aura.pxlib;
  const { W, H, clamp, lerp, sstep, hex, hexes, mix } = px;
  const S = sstep;

  Aura.define(11, {
    pixel: true,
    duration: 70,
    cues: [
      { ref: '3:1', t0: 5.0, t1: 17.0 },
      { ref: '3:2', t0: 17.6, t1: 26.0 },
      { ref: '3:3', t0: 26.6, t1: 37.0 },
      { ref: '3:4', t0: 37.6, t1: 45.4 },
      { ref: '3:5', t0: 46.0, t1: 56.5 },
      { ref: '3:6', t0: 57.0, t1: 61.5 },
    ],
    titles: [],

    build(ctx) {
      const F = 110, EYE = 24, CH = 100, HW = 80, ZEND = 520, HY = 96;
      const GREY = hexes(['#07080b', '#12141a', '#20232b', '#343943', '#525865', '#7c8290', '#b4b9c6']);
      const WHITE = hexes(['#6a6e84', '#9aa0b8', '#d0d4e6', '#f4f6ff', '#ffffff']);
      const DARKF = hexes(['#010102', '#04050a', '#0a0c14', '#181c28', '#34425a']);
      const PARCH = hexes(['#2c1e12', '#5a3e22', '#94703c', '#c8a05e', '#ecd08c', '#fff2c8']);
      const FOG = 0.08;

      const camz = (t) => 3.8 * t + 100 * Math.pow(S(61.5, 70, t), 1.5);
      const colorK = (t) => 0.95 * S(4.5, 7.5, t) * (1 - S(11.5, 16.5, t));
      const surge = (t) => t < 17.6 ? 0 : Math.exp(-(t - 17.6) / 0.9);
      const nightK = (t) => S(26.6, 29.5, t) * (1 - S(36.4, 38, t));
      const doorK = (t) => 0.1 + 0.9 * S(52, 66, t);
      const aliveK = (t) => S(3, 6.5, t);
      function lampLevel(id, t) {
        const dieT = 11.5 + ((id * 37) % 50) / 10, rel = (id % 5 === 0) ? S(19 + id * 0.2, 19.8 + id * 0.2, t) * 0.85 : 0;
        const live = aliveK(t) * (1 - S(dieT, dieT + 0.6, t)) * (t < dieT ? (0.85 + 0.15 * Math.sin(t * 9 + id)) : 1);
        return Math.max(live, rel * (0.8 + 0.2 * Math.sin(t * 7 + id)));
      }

      function sparkle(x, y, r, k, colHex) {
        if (k <= 0.01) return;
        x = Math.round(x); y = Math.round(y);
        lib.halo(x, y, r * 2.4, hex(colHex), 0.5 * k, 1);
        for (let d = 0; d <= r; d++) { const a = k * Math.pow(1 - d / r, 1.3), w = hex('#ffffff'); px.dpx(x + d, y, w, a); px.dpx(x - d, y, w, a); px.dpx(x, y + d, w, a); px.dpx(x, y - d, w, a); }
        px.set(x, y, hex('#ffffff'));
      }

      /* the hall, solved per pixel from the camera's eye (one-point perspective) */
      function hallPass(U, t) {
        const cz = camz(t), tb = ZEND - cz, night = nightK(t), hb = 1 - 0.5 * night, dk = doorK(t), sy = HY;
        for (let y = 0; y < H; y++) {
          const dy = y - sy;
          for (let x = 0; x < W; x++) {
            const dx = x - 240, adx = Math.abs(dx);
            const tf = dy > 0 ? EYE * F / dy : 1e9, tc = dy < 0 ? (CH - EYE) * F / (-dy) : 1e9, tw = adx > 0 ? HW * F / adx : 1e9;
            let zr = Math.min(tf, tc, tw, tb), kind = zr === tb ? 3 : zr === tf ? 0 : zr === tc ? 1 : 2;
            const X = dx * zr / F, Y = EYE - dy * zr / F, zw = zr + cz, fog = clamp(zr / 340, 0, 1);
            let v;
            if (kind === 0) {
              const i = Math.floor(X / 20), j = Math.floor(zw / 20);
              v = 0.3 + 0.09 * ((i + j) & 1) + 0.05 * px.hash(i, j, 5);
              if (Math.abs(X) < 15) v = 0.2 + 0.05 * (Math.floor(zw / 6) & 1);
              if (px.hash(i, j, 9) > 0.93 && ((X % 20 + 20) % 20) < 1.6) v -= 0.12;
              v += dk * 0.55 * Math.exp(-(X * X) / 1100) * Math.exp(-(ZEND - zw) / 260);
            } else if (kind === 1) {
              const f = ((zw % 50) + 50) % 50;
              v = f < 7 ? 0.09 : 0.17 + 0.05 * px.hash(Math.floor(X / 14), Math.floor(zw / 14), 4);
            } else if (kind === 2) {
              const bj = Math.floor(Y / 16), bi = Math.floor((zw + (bj & 1) * 12) / 24), mx = ((zw + (bj & 1) * 12) % 24 + 24) % 24, my = ((Y % 16) + 16) % 16;
              v = 0.3 + 0.08 * px.hash(bi, bj, 3) - ((mx < 1.4 || my < 1.2) ? 0.09 : 0) - 0.12 * (1 - clamp(Y / CH, 0, 1));
            } else {
              const bj = Math.floor(Y / 16), bi = Math.floor((X + (bj & 1) * 12 + 400) / 24), mx = ((X + (bj & 1) * 12 + 400) % 24 + 24) % 24, my = ((Y % 16) + 16) % 16;
              v = 0.27 + 0.07 * px.hash(bi, bj, 6) - ((mx < 1.4 || my < 1.2) ? 0.08 : 0);
              const inDoor = Y < 84 && Y >= 0 && Math.abs(X) < (Y < 66 ? 30 : 30 * Math.sqrt(Math.max(0, 1 - Math.pow((Y - 66) / 18, 2))));
              const inFrame = Y < 90 && Math.abs(X) < (Y < 66 ? 36 : 36 * Math.sqrt(Math.max(0, 1 - Math.pow((Y - 66) / 24, 2))));
              if (inDoor) {
                U[y * W + x] = px.ramp(lib.BRONZE, clamp(0.03 + dk * (0.55 + 0.35 * (Y / 84) - 0.2 * Math.abs(X) / 30), 0, 1), x, y);
                continue;
              } else if (inFrame) v = 0.42;
            }
            v = v * hb * (1 - fog * 0.55) + FOG * fog;
            U[y * W + x] = px.ramp(GREY, clamp(v, 0, 1), x, y);
          }
        }
        /* the colour of "being alive": a warm tint that is there, and then is not */
        const kk = clamp(colorK(t) + 0.8 * surge(t), 0, 1.2);
        if (kk > 0.01) for (let i = 0; i < W * H; i++) {
          const c = U[i], r = c & 255, g = (c >> 8) & 255, b = (c >> 16) & 255;
          U[i] = (255 << 24) | (Math.max(0, Math.min(255, (b * (1 - 0.35 * kk)) | 0)) << 16) | (Math.min(255, (g * (1 + 0.12 * kk)) | 0) << 8) | Math.min(255, (r * (1 + 0.55 * kk)) | 0);
        }
      }

      function colourOf(hx, fog, t) { const c = hex(hx), r = c & 255, g = (c >> 8) & 255, b = (c >> 16) & 255, l = (0.3 * r + 0.59 * g + 0.11 * b) | 0, k = clamp(colorK(t) + 0.8 * surge(t), 0, 1), m = 1 - k; const cc = (255 << 24) | ((((b * k + l * m) | 0) & 255) << 16) | ((((g * k + l * m) | 0) & 255) << 8) | (((r * k + l * m) | 0) & 255); return mix(cc, hex('#0a0b10'), clamp(fog * 0.7 + nightK(t) * 0.5, 0, 0.95)); }

      function columns(U, t) {
        const cz = camz(t);
        for (let k = 8; k >= 0; k--) {
          const zw = 50 + k * 70, zr = zw - cz; if (zr < 14 || zr > 470) continue;
          const sx = F / zr, fog = clamp(zr / 340, 0, 1);
          for (const s of [-1, 1]) {
            const xc = 240 + s * 58 * sx, w = Math.max(3, Math.round(9 * sx)), yt = Math.round(HY - (CH - EYE) * sx), yb = Math.round(HY + EYE * sx);
            for (let y = Math.max(0, yt); y <= Math.min(H - 1, yb); y++) {
              const rel = (y - yt) / Math.max(1, yb - yt), cap = rel < 0.07, base = rel > 0.93;
              const ww = cap || base ? w + Math.round(1.5 * sx + 1) : w;
              for (let x = Math.round(xc) - ww; x <= Math.round(xc) + ww; x++) {
                if (x < 0 || x >= W) continue;
                const u = (x - xc) / ww, lit = -s * u;
                let v = 0.36 + 0.24 * lit + (cap || base ? 0.06 : 0) - ((Math.abs(u * ww) | 0) % 5 === 0 && !cap && !base ? 0.05 : 0);
                v = v * (1 - 0.5 * nightK(t)) * (1 - fog * 0.55) + FOG * fog;
                const c = px.ramp(GREY, clamp(v, 0, 1), x, y);
                U[y * W + x] = c;
              }
            }
            /* a banner: once bright, now dusty */
            const bw = Math.max(2, Math.round(4 * sx)), bx = Math.round(xc - s * (w + 4 * sx + bw)), by0 = yt + Math.round(8 * sx), bl = Math.round(40 * sx);
            const bc = colourOf(((k + (s > 0 ? 1 : 0)) & 1) ? '#b03a3a' : '#d0a040', fog, t);
            for (let y = by0; y < by0 + bl; y++) for (let x = bx - bw; x <= bx + bw; x++) { const notch = (y - by0) > bl - bw * 0.9 && Math.abs(x - bx) < (y - (by0 + bl - bw * 0.9)); if (!notch && x >= 0 && x < W && y >= 0 && y < H && (t > 14 ? px.hash(x, y, 2) > 0.1 * S(14, 22, t) : true)) px.set(x, y, bc); }
            /* a lamp */
            const id = k * 2 + (s > 0 ? 1 : 0), lv = lampLevel(id, t), lx = Math.round(xc - s * (w + 2 * sx)), ly = Math.round(HY + (EYE - 38) * sx);
            px.set(lx, ly + 1, hex('#2a2018'));
            if (lv > 0.03 && ly > 0 && ly < H) lib.flame({ x: lx, y: ly, k: lv, pop: 0, t, seed: 40 + id, s: clamp(sx * 1.1, 1, 2.2), glow: 0.7 });
          }
        }
      }

      function body(x, y, h, a, ramp, t, seed, sway) {
        const head = Math.max(2, Math.round(h * 0.1));
        for (let r = 0; r <= h; r++) {
          const f = r / h, hw = f < 0.12 ? head : lerp(h * 0.14, h * 0.3, S(0.12, 1, f)) + sway * f * 0.8;
          const yy = Math.round(y - h + r);
          for (let dx = -Math.ceil(hw); dx <= Math.ceil(hw); dx++) {
            if (Math.abs(dx) > hw) continue;
            const u = dx / Math.max(1, hw), v = clamp(0.4 + 0.45 * (-u) + 0.2 * (1 - f), 0, 1);
            const X = Math.round(x + dx + (f > 0.5 ? Math.sin(t * 3 + seed + f * 3) * 0.6 * f : 0));
            if (a > px.thr(X, yy)) px.set(X, yy, px.ramp(ramp, v, X, yy));
          }
        }
        for (let dy = -head; dy <= head; dy++) for (let dx = -head; dx <= head; dx++) if (dx * dx + dy * dy <= head * head) { const X = Math.round(x) + dx, Y = Math.round(y - h - head * 0.4) + dy; if (a > px.thr(X, Y)) px.set(X, Y, px.ramp(ramp, clamp(0.55 - 0.3 * dx / head, 0, 1), X, Y)); }
      }

      function drawScroll(t) {
        const k = S(46, 47.8, t) * (1 - S(56.2, 58, t)); if (k <= 0.01) return;
        const U = px.cur(), dim = 0.55 * k;
        for (let i = 0; i < W * H; i++) { const c = U[i], f = 1 - dim; U[i] = (255 << 24) | ((((c >> 16) & 255) * f | 0) << 16) | ((((c >> 8) & 255) * f | 0) << 8) | ((c & 255) * f | 0); }
        const cx = 240, cy = 100, w = 150, h = 132, hw = Math.round(w * (0.55 + 0.45 * k) / 2), hh = Math.round(h * (0.3 + 0.7 * k) / 2);
        lib.halo(cx, cy, 120, hex('#ffd890'), 0.35 * k, 1);
        for (let y = cy - hh; y <= cy + hh; y++) for (let x = cx - hw; x <= cx + hw; x++) {
          const ex = Math.min(x - (cx - hw), cx + hw - x) / 10, ey = Math.min(y - (cy - hh), cy + hh - y);
          let v = 0.62 + 0.18 * px.fbm(x * 0.05, y * 0.05, 3, 4) - 0.35 * Math.max(0, 1 - ex) - (ey < 9 ? 0.3 * (1 - Math.abs(ey - 4.5) / 4.5) + 0.1 : 0);
          if (ey < 9) v = 0.35 + 0.35 * Math.abs(Math.sin(ey / 9 * 3.14)) + (ey < 3 ? -0.15 : 0);
          px.set(x, y, px.ramp(PARCH, clamp(v, 0, 1), x, y));
        }
        const rows = 10;
        for (let i = 0; i < rows; i++) {
          const yy = cy - hh + 22 + i * 10.4, lt = clamp((t - (47.8 + i * 0.5)) / 0.9, 0, 1) * k; if (yy > cy + hh - 14) continue;
          let X = cx - hw + 16;
          const n = 2 + (i % 2), segW = (hw * 2 - 34) / n;
          for (let q = 0; q < n; q++) {
            let x = Math.round(X + q * segW), len = Math.round(segW * (0.45 + 0.4 * px.hash(i, q, 11)));
            for (let d = 0; d < len; d += 3) {
              const wd = 1 + Math.floor(px.hash(i, q + d, 3) * 2.5);
              const ink = mix(hex('#3a2410'), hex('#ffd060'), lt);
              if (lt > 0.01) { for (let b = 0; b < wd; b++) for (let hy = 0; hy < 4; hy++) px.set(x + d + b, Math.round(yy) + hy, ink); }
              else for (let hy = 0; hy < 4; hy++) px.set(x + d, Math.round(yy) + hy, hex('#4a3420'));
            }
            if (lt > 0.4) lib.halo(x + len / 2, Math.round(yy) + 2, 18, hex('#ffd060'), 0.22 * lt, 1);
          }
          /* the blot that cannot take (row 5): it sweeps over and the name stays bright */
          if (i === 5) {
            const bk = S(52.4, 53.6, t) * (1 - S(54.2, 55.4, t));
            if (bk > 0.01) for (let dy = -5; dy <= 8; dy++) for (let dx = -10; dx <= 60; dx++) { const e = (dx - 25) * (dx - 25) / 1600 + dy * dy / 40; if (e < 1 && bk * (1 - e * 0.4) > px.thr(x0(dx, cx - hw + 16), Math.round(yy) + dy)) px.set(x0(dx, cx - hw + 16), Math.round(yy) + dy, hex('#08060a')); }
            if (bk > 0.01) { let x = cx - hw + 16; for (let d = 0; d < 56; d += 3) for (let hy = 0; hy < 4; hy++) if (px.hash(d, 2, 1) > 0.3) px.set(x + d, Math.round(yy) + hy, hex('#fff0a8')); lib.halo(cx - hw + 44, Math.round(yy) + 2, 34, hex('#ffe890'), 0.7 * bk, 1); }
          }
        }
      }
      function x0(dx, base) { return base + dx; }

      const gold = [hex('#fff6d0'), hex('#ffe9a0'), hex('#ffd070'), hex('#f2a444'), hex('#c8702a'), hex('#8a4420')];
      function drawTitle(t) {
        const t0 = 1.0, t1 = 4.6, k = S(t0, t0 + 1.0, t) * (1 - S(t1 - 0.8, t1, t));
        if (k <= 0.01) return;
        const sc = 4, word = 'WAKE UP', tw = px.textWidth(word, sc, 1), x0t = Math.round(240 - tw / 2), y0 = 66, fo = 1 - S(t1 - 0.8, t1, t);
        px.scrim(240, y0 + 18, 232, 46, k * 1.05);
        for (let i = 0; i < word.length; i++) {
          const ka = clamp((t - t0 - 0.1 - i * 0.07) / 0.6, 0, 1) * fo; if (ka <= 0) continue;
          const lx = x0t + i * 6 * sc, ch = word[i];
          px.text(ch, lx + 2, y0 + 2, sc, hex('#0a0408'), ka);
          const sweep = lerp(-40, 440, S(t0 + 1.1, t0 + 2.6, t));
          px.text(ch, lx, y0, sc, (cc, r, X, Y) => { let col = px.ramp(gold, (r + 1) / (7 * sc), X, Y); const d = (X - Y * 0.7) - sweep; if (d > 0 && d < 8) col = hex(d < 4 ? '#ffffff' : '#fff0c0'); return col; }, ka);
        }
        const sub = 'REVELATION · EPISODE 11', sw = px.textWidth(sub, 2, 1), sx0 = Math.round(240 - sw / 2), sy0 = y0 - 17, ks = S(t0 - 0.1, t0 + 0.8, t) * fo;
        px.text(sub, sx0 + 1, sy0 + 1, 2, hex('#0a0408'), ks); px.text(sub, sx0, sy0, 2, hex('#e8c070'), ks);
        const rule = Math.round(lerp(0, 150, S(t0 + 0.6, t0 + 2.0, t))); px.hline(240 - rule, 240 + rule, y0 + 7 * sc + 8, mix(hex('#e8c070'), hex('#0a0408'), 0.15 + (1 - k) * 0.8));
      }

      return {
        render(t) {
          const U = px.cur();
          hallPass(U, t);
          columns(U, t);
          const cz = camz(t);
          /* v1: the seven stars (3:1) */
          for (let i = 0; i < 7; i++) { const k = S(5.2 + i * 0.25, 6.4 + i * 0.25, t) * (1 - S(16.5, 19, t)); sparkle(240 + (i - 3) * 34, 24 + (i - 3) * (i - 3) * 1.6, 3 + (i % 2) * 2, k * (0.8 + 0.2 * Math.sin(t * 2 + i)), '#ffe8a0'); }
          /* v2: the pulse of waking (3:2) */
          if (t > 17.6 && t < 20.2) { const u = (t - 17.6) / 2.6, r = u * 260; for (let q = 0; q < 360; q++) { const an = q / 360 * 6.2832, x = Math.round(240 + Math.cos(an) * r), y = Math.round(100 + Math.sin(an) * r * 0.55); px.dpx(x, y, hex('#fff6d0'), (1 - u) * 0.95); px.dpx(x, y + 1, hex('#ffd070'), (1 - u) * 0.6); } }
          /* v3: like a thief (3:3): a dark shape slips between the columns */
          const ta = S(28.5, 30, t) * (1 - S(35.5, 37, t));
          if (ta > 0.01) { const X = lerp(-48, 48, S(29, 35, t)), zr = 150, sx = F / zr; body(240 + X * sx, HY + EYE * sx, 30 * sx, ta, DARKF, t, 3, 0.6 * Math.sin(t * 4)); }
          /* v4: a flash of white, and a few who walk in white (3:4 - 3:5) */
          const wa = S(37.6, 39.2, t);
          if (wa > 0.01) [[-14, 62], [8, 82], [-3, 102]].forEach(([X, zr], i) => { const sx = F / zr, y = HY + EYE * sx; lib.halo(Math.round(240 + X * sx), Math.round(y - 14 * sx), 30 * sx, hex('#e8ecff'), 0.35 * wa, 1); body(240 + X * sx, y, 28 * sx, wa, WHITE, t, 10 + i, Math.sin(t * 3 + i) * 0.7); });
          drawScroll(t);
          const fl = t >= 37.6 ? 0.55 * Math.exp(-(t - 37.6) / 0.22) : 0;
          px.post({ vignette: 1.1, fade: 0, flash: fl + 0.35 * (t >= 17.6 ? Math.exp(-(t - 17.6) / 0.25) : 0), flashCol: hex('#fffaf0') });
          drawTitle(t);
          px.fadeOnly(clamp(1 - S(0, 1.0, t)));
        },
      };
    },

    score(A, from) {
      const D2 = 73.42, D3 = 146.83, A3 = 220, E4 = 329.63, D4 = 293.66, Fs4 = 369.99, A4 = 440, D5 = 587.33, Fs5 = 739.99, A5 = 880, D6 = 1174.66;
      /* continuity: the hollow fifth from Episode 10 */
      A.drone(0, 69.6, D2, { gain: 0.09, attack: 0.8, release: 2.6 });
      A.choir(0, 6, [A3, E4], { gain: 0.045, attack: 1.0, release: 2.0, vowel: 0.6 });
      A.wind(1, 70, { gain: 0.035, bright: 0.35, attack: 2.0 });
      /* v1 (5 - 17): a bright, "alive" surface that thins out */
      A.choir(5, 12, [D3, A3, D4, Fs4], { gain: 0.05, attack: 1.4, release: 1.8, vowel: 1.0 });
      [D5, Fs5, A5, D6, A5, Fs5, D5].forEach((f, i) => A.bell(5.4 + i * 0.6, f, { gain: 0.05, dur: 3.5 }));
      A.choir(12, 18, [A3, E4], { gain: 0.045, attack: 2.4, release: 2.0, vowel: 0.5 });
      /* v2 (17.6): wake up: one great bell, a few remaining lamps */
      A.boom(17.6, { freq: 46, gain: 0.6, dur: 3.4 }); A.bell(17.6, D4, { gain: 0.16, dur: 8 }); A.bell(17.62, A5, { gain: 0.08, dur: 6 });
      A.noise({ t0: 17.6, t1: 19, gain: [[17.6, 0.12], [19, 0]], filter: { type: 'bandpass', freq: [[17.6, 4800], [19, 1200]], q: 0.8 }, wet: 0.4, attack: 0.005, release: 0.5 });
      [D5, A5, D6].forEach((f, i) => A.bell(21 + i * 1.5, f, { gain: 0.05, dur: 5 }));
      /* v3 (26.6 - 37): a thief: low pulse and dry air */
      A.choir(26.6, 37.6, [D3, A3], { gain: 0.04, attack: 2.0, release: 1.4, vowel: 0.4 });
      for (let t = 27; t < 36.8; t += 1.2) A.boom(t, { freq: 52, gain: 0.12, dur: 0.6 });
      A.noise({ t0: 28, t1: 36.5, gain: 0.022, filter: { type: 'highpass', freq: 3800, q: 0.4 }, wet: 0.4, attack: 1.2, release: 1.2 });
      /* v4 (37.6 - 45): a flash of white, then a clear, soft chord */
      A.shimmer(37.6, A5, { dur: 6, gain: 0.07 }); A.bell(37.6, D6, { gain: 0.1, dur: 6 });
      A.choir(37.8, 46, [D3, A3, D4, Fs4, A4, D5], { gain: 0.065, attack: 1.2, release: 2.2, vowel: 1.1 });
      /* v5 (46 - 56.5): the names light up, one by one */
      for (let i = 0; i < 10; i++) A.bell(47.8 + i * 0.5, [D5, Fs5, A5, D6][i % 4], { gain: 0.05, dur: 3.5 });
      A.shimmer(52.4, D6, { dur: 4, gain: 0.05 });
      A.choir(46, 57, [D3, A3, D4, Fs4, A4, D5], { gain: 0.065, attack: 1.6, release: 2.2, vowel: 1.2 });
      /* v6 + handoff (57 - 70): calm, then the far door warms */
      [A5, Fs5, D5].forEach((f, i) => A.bell(57.4 + i * 1.3, f, { gain: 0.045, dur: 5 }));
      A.riser(60, 69, { f0: 200, f1: 1800, gain: 0.04 });
      A.brass(62, 69.8, D3, { gain: 0.05, attack: 3.5, release: 1.5, sweep: [[62, 400], [69, 1500]] });
      A.choir(62, 69.8, [D3, A3, D4, Fs4, A4], { gain: 0.06, attack: 3.0, release: 1.6, vowel: 1.0 });
    },
  });
})();
