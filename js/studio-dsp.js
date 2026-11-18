/* ============================================================================
 *  AURABOT PROJECT · REVELATION · Voice Studio engine room (no DOM in here)
 *   - IndexedDB storage (layers, saved episodes, settings)
 *   - WAV helpers
 *   - Voice filters: "Old Narrator" and "Voice of God"
 *       (duration-preserving pitch shift + EQ / grit / tremor / chorus / reverb)
 *   - Mixdown, MP3 encoder (lamejs), and a tiny ZIP writer
 * ========================================================================== */
(function () {
  'use strict';
  const Aura = (window.Aura = window.Aura || {});
  const D = (Aura.Dsp = {});
  const tick = () => new Promise((r) => setTimeout(r, 0));

  /* ================================================================ STORAGE */
  let dbp = null;
  function db() {
    if (dbp) return dbp;
    dbp = new Promise((res, rej) => {
      if (!window.indexedDB) { rej(new Error('IndexedDB is not available in this browser')); return; }
      const r = indexedDB.open('aurabot-studio', 1);
      r.onupgradeneeded = () => {
        const d = r.result;
        d.createObjectStore('layers', { keyPath: 'id' }).createIndex('ep', 'ep');
        d.createObjectStore('finals', { keyPath: 'ep' });
        d.createObjectStore('kv', { keyPath: 'key' });
      };
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    });
    return dbp;
  }
  function run(store, mode, fn) {
    return db().then((d) => new Promise((res, rej) => {
      const t = d.transaction(store, mode); let out;
      const rq = fn(t.objectStore(store));
      if (rq) rq.onsuccess = () => { out = rq.result; };
      t.oncomplete = () => res(out); t.onerror = () => rej(t.error); t.onabort = () => rej(t.error);
    }));
  }
  D.store = {
    put: (store, val) => run(store, 'readwrite', (s) => s.put(val)),
    get: (store, key) => run(store, 'readonly', (s) => s.get(key)),
    del: (store, key) => run(store, 'readwrite', (s) => s.delete(key)),
    all: (store) => run(store, 'readonly', (s) => s.getAll()),
    layersFor: (ep) => run('layers', 'readonly', (s) => s.index('ep').getAll(ep)),
    /* counts layers per episode and lists saved episodes without reading any audio */
    async status() {
      const d = await db(); const layers = {}, finals = {};
      await new Promise((res, rej) => {
        const t = d.transaction(['layers', 'finals'], 'readonly');
        t.objectStore('layers').openCursor().onsuccess = (e) => { const c = e.target.result; if (c) { layers[c.value.ep] = (layers[c.value.ep] || 0) + 1; c.continue(); } };
        t.objectStore('finals').openCursor().onsuccess = (e) => { const c = e.target.result; if (c) { finals[c.value.ep] = { savedAt: c.value.savedAt, size: c.value.size }; c.continue(); } };
        t.oncomplete = res; t.onerror = () => rej(t.error);
      });
      return { layers, finals };
    },
    async wipe() { const d = await db(); await new Promise((res, rej) => { const t = d.transaction(['layers', 'finals'], 'readwrite'); t.objectStore('layers').clear(); t.objectStore('finals').clear(); t.oncomplete = res; t.onerror = () => rej(t.error); }); },
  };

  /* ===================================================================== WAV */
  D.pcmToWav = function (f32, sr) {
    const n = f32.length, buf = new ArrayBuffer(44 + n * 2), v = new DataView(buf);
    const w = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
    w(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); w(8, 'WAVE'); w(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
    v.setUint32(24, sr, true); v.setUint32(28, sr * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); w(36, 'data'); v.setUint32(40, n * 2, true);
    for (let i = 0; i < n; i++) { const s = Math.max(-1, Math.min(1, f32[i])); v.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true); }
    return new Blob([buf], { type: 'audio/wav' });
  };
  D.wavToPcm = async function (blob) {
    const buf = await blob.arrayBuffer(), v = new DataView(buf);
    let p = 12, sr = 48000, dataOff = 44, dataLen = buf.byteLength - 44;
    while (p + 8 <= buf.byteLength) {
      const id = String.fromCharCode(v.getUint8(p), v.getUint8(p + 1), v.getUint8(p + 2), v.getUint8(p + 3)), len = v.getUint32(p + 4, true);
      if (id === 'fmt ') sr = v.getUint32(p + 12, true);
      if (id === 'data') { dataOff = p + 8; dataLen = Math.min(len, buf.byteLength - dataOff); break; }
      p += 8 + len + (len & 1);
    }
    const n = dataLen >> 1, out = new Float32Array(n);
    for (let i = 0; i < n; i++) out[i] = v.getInt16(dataOff + i * 2, true) / 32768;
    return { pcm: out, sr };
  };

  /* ===================================================== PITCH SHIFT (WSOLA) */
  /* 1) resample at a (possibly wobbling) rate -> pitch changes, length changes
   * 2) WSOLA time-stretch back to the ORIGINAL length -> voice stays in sync with the picture */
  async function resampleVar(x, sr, ratioAt, onP) {
    const N = x.length, maxLen = Math.ceil(N / 0.4) + 64, out = new Float32Array(maxLen);
    let p = 0, n = 0;
    while (p < N - 2 && n < maxLen - 1) {
      const i = p | 0, f = p - i;
      const a = i > 0 ? x[i - 1] : 0, b = x[i], c = x[i + 1], d = i + 2 < N ? x[i + 2] : 0;
      out[n++] = b + 0.5 * f * (c - a + f * (2 * a - 5 * b + 4 * c - d + f * (3 * (b - c) + d - a)));
      p += ratioAt(n / sr);
      if ((n & 0x3ffff) === 0) { if (onP) onP(Math.min(1, p / N)); await tick(); }
    }
    return out.subarray(0, n);
  }
  async function wsola(x, N0, sr, onP) {
    const N1 = x.length;
    if (N1 === N0) return x;
    const frame = 2 * Math.round(sr * 0.0215), half = frame / 2, tol = Math.round(sr * 0.011), dec = 6;
    const xp = new Float32Array(tol + N1 + frame + tol + 8); xp.set(x, tol);
    const win = new Float32Array(frame); for (let i = 0; i < frame; i++) win[i] = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / frame);
    const out = new Float32Array(N0 + frame + 8), ratio = N1 / N0;
    const refN = Math.floor(half / dec), ref = new Float32Array(refN);
    let outPos = 0, prev = 0, k = 0;
    while (outPos < N0) {
      let pos = 0;
      if (k > 0) {
        const nominal = Math.round(outPos * ratio), lo = Math.max(0, nominal - tol), hi = Math.min(N1, nominal + tol);
        const rb = tol + prev + half; for (let j = 0; j < refN; j++) ref[j] = xp[rb + j * dec];
        let best = -1e30; pos = Math.min(Math.max(nominal, lo), hi);
        for (let c = lo; c <= hi; c += 3) {
          let cor = 0, e = 1e-6; const cb = tol + c;
          for (let j = 0; j < refN; j++) { const s = xp[cb + j * dec]; cor += s * ref[j]; e += s * s; }
          const sc = cor / Math.sqrt(e);
          if (sc > best) { best = sc; pos = c; }
        }
      }
      const base = tol + pos;
      for (let i = 0; i < frame; i++) out[outPos + i] += (k === 0 && i < half ? 1 : win[i]) * xp[base + i];
      prev = pos; outPos += half; k++;
      if ((k & 31) === 0) { if (onP) onP(Math.min(1, outPos / N0)); await tick(); }
    }
    return out.subarray(0, N0);
  }
  /* ratioAt(timeSeconds) -> pitch ratio (1 = unchanged, 0.5 = octave down) */
  D.pitchShift = async function (x, sr, ratioAt, onP) {
    const r = await resampleVar(x, sr, ratioAt, onP ? (p) => onP(p * 0.35) : null);
    return wsola(r, x.length, sr, onP ? (p) => onP(0.35 + p * 0.65) : null);
  };

  /* ======================================================== FILTER BUILDING */
  D.FILTERS = {
    none: { label: 'No filter', color: '#f2c46d' },
    narrator: { label: 'Old Narrator', color: '#e0a15a' },
    god: { label: 'Voice of God', color: '#bfe3ff' },
  };
  function makeIR(ctx, seconds, rt60, bright) {
    const sr = ctx.sampleRate, len = Math.max(1, Math.floor(sr * seconds)), ir = ctx.createBuffer(2, len, sr);
    for (let c = 0; c < 2; c++) {
      const d = ir.getChannelData(c); let lp = 0;
      for (let i = 0; i < len; i++) { const t = i / sr; lp += ((Math.random() * 2 - 1) - lp) * bright; d[i] = lp * Math.exp((-6.9 * t) / rt60) * (i < 60 ? i / 60 : 1); }
    }
    return ir;
  }
  const monoBuffer = (ctx, pcm, sr) => { const b = ctx.createBuffer(1, pcm.length, sr); b.getChannelData(0).set(pcm); return b; };
  const biq = (ctx, type, f, g, q) => { const n = ctx.createBiquadFilter(); n.type = type; n.frequency.value = f; if (g !== undefined) n.gain.value = g; if (q !== undefined) n.Q.value = q; return n; };
  const gain = (ctx, v) => { const g = ctx.createGain(); g.gain.value = v; return g; };
  function satCurve(k) { const n = 1024, c = new Float32Array(n); for (let i = 0; i < n; i++) { const x = (i / (n - 1)) * 2 - 1; c[i] = Math.tanh(k * x) / Math.tanh(k); } return c; }

  function toStereoBuffer(pcm, sr) {
    const mk = (typeof AudioBuffer === 'function') ? (n) => new AudioBuffer({ length: n, numberOfChannels: 2, sampleRate: sr }) : (n) => new OfflineAudioContext(2, n, sr).createBuffer(2, n, sr);
    const b = mk(pcm.length); b.getChannelData(0).set(pcm); b.getChannelData(1).set(pcm); return b;
  }

  /* pcm: Float32Array mono. returns a stereo AudioBuffer (may be a little longer than the input: reverb tail) */
  D.processLayer = async function (pcm, sr, filter, amt, onP) {
    amt = Math.max(0, Math.min(1, amt === undefined ? 0.65 : amt));
    if (!filter || filter === 'none') return toStereoBuffer(pcm, sr);
    const OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext;

    if (filter === 'narrator') {
      /* an old, dramatic, film-reel narrator: lower, a little wobbly, warm, nasal, gravelly, a touch of room */
      const semis = -(1 + 3 * amt), r0 = Math.pow(2, semis / 12), vib = 0.003 + 0.011 * amt;
      const shifted = await D.pitchShift(pcm, sr, (t) => r0 * (1 + vib * Math.sin(2 * Math.PI * 5.1 * t) + vib * 0.4 * Math.sin(2 * Math.PI * 2.3 * t + 1)), onP);
      const tail = Math.round(sr * 1.6), off = new OAC(2, shifted.length + tail, sr);
      const src = off.createBufferSource(); src.buffer = monoBuffer(off, shifted, sr);
      const hp = biq(off, 'highpass', 85, undefined, 0.7);
      const warm = biq(off, 'lowshelf', 190, 2 + 4 * amt);
      const nasal = biq(off, 'peaking', 1700, 2 + 3 * amt, 1.0);
      const pres = biq(off, 'peaking', 3300, 1.5 + 1.5 * amt, 1.2);
      const lp = biq(off, 'lowpass', 7600 - 3200 * amt, undefined, 0.6);
      const trem = off.createGain(), depth = 0.03 + 0.07 * amt; trem.gain.value = 1 - depth / 2;
      const lfo = off.createOscillator(); lfo.frequency.value = 5.4; const lfoG = gain(off, depth / 2); lfo.connect(lfoG); lfoG.connect(trem.gain); lfo.start();
      const sum = gain(off, 1), shp = off.createWaveShaper(); shp.curve = satCurve(2 + 6 * amt); shp.oversample = '2x';
      const gritHp = biq(off, 'highpass', 1400, undefined, 0.7), gritG = gain(off, 0.05 + 0.2 * amt);
      const conv = off.createConvolver(); conv.buffer = makeIR(off, 1.5, 0.9, 0.5); const wet = gain(off, 0.12 + 0.12 * amt);
      const comp = off.createDynamicsCompressor(); comp.threshold.value = -24; comp.ratio.value = 3; comp.attack.value = 0.008; comp.release.value = 0.2;
      src.connect(hp); hp.connect(warm); warm.connect(nasal); nasal.connect(pres); pres.connect(lp); lp.connect(trem); trem.connect(sum);
      lp.connect(shp); shp.connect(gritHp); gritHp.connect(gritG); gritG.connect(sum);
      sum.connect(conv); conv.connect(wet); wet.connect(comp); sum.connect(comp); comp.connect(off.destination);
      src.start(0);
      return off.startRendering();
    }

    /* god: deeper body + octave shimmer + choral width + cathedral reverb */
    const low = await D.pitchShift(pcm, sr, () => 0.5, onP ? (p) => onP(p * 0.5) : null);
    const high = await D.pitchShift(pcm, sr, () => 2, onP ? (p) => onP(0.5 + p * 0.5) : null);
    const tail = Math.round(sr * 5.2), off = new OAC(2, pcm.length + tail, sr);
    const mk = (arr, g) => { const s = off.createBufferSource(); s.buffer = monoBuffer(off, arr, sr); const gg = gain(off, g); s.connect(gg); s.start(0); return gg; };
    const dry = mk(pcm, 0.8), lowG = mk(low, 0.25 + 0.35 * amt), highG = mk(high, 0.08 + 0.2 * amt);
    const sum = gain(off, 1); dry.connect(sum); lowG.connect(sum);
    const eq1 = biq(off, 'lowshelf', 160, 3), eq2 = biq(off, 'peaking', 2600, 3.5, 0.9), eq3 = biq(off, 'highshelf', 6500, 3 + 3 * amt);
    sum.connect(eq1); eq1.connect(eq2); eq2.connect(eq3);
    const out = gain(off, 1), directPan = off.createStereoPanner ? off.createStereoPanner() : gain(off, 1);
    eq3.connect(directPan); const dG = gain(off, 0.8); directPan.connect(dG); dG.connect(out);
    [[0.016, 0.31, -0.8], [0.024, 0.43, 0.8], [0.031, 0.57, 0]].forEach(([dt, rate, pan]) => {
      const d = off.createDelay(0.1); d.delayTime.value = dt;
      const l = off.createOscillator(); l.frequency.value = rate; const lg = gain(off, 0.0028); l.connect(lg); lg.connect(d.delayTime); l.start();
      const p = off.createStereoPanner ? off.createStereoPanner() : gain(off, 1); if (p.pan) p.pan.value = pan;
      const cg = gain(off, 0.3 + 0.2 * amt); eq3.connect(d); d.connect(p); p.connect(cg); cg.connect(out);
    });
    const pre = off.createDelay(0.2); pre.delayTime.value = 0.045;
    const conv = off.createConvolver(); conv.buffer = makeIR(off, 4.9, 3.6, 0.82);
    const wet = gain(off, 0.4 + 0.4 * amt), send = gain(off, 0.55);
    eq3.connect(send); send.connect(pre); highG.connect(pre); pre.connect(conv); conv.connect(wet); wet.connect(out);
    const comp = off.createDynamicsCompressor(); comp.threshold.value = -20; comp.ratio.value = 2.5; comp.attack.value = 0.012; comp.release.value = 0.3;
    out.connect(comp); comp.connect(off.destination);
    return off.startRendering();
  };

  /* ================================================================ MIXDOWN */
  /* items: [{ buf: AudioBuffer, offset: seconds, gain }] -> { L, R, sr } normalised to about -1 dBFS */
  D.mixdown = async function (items, duration, outSr) {
    outSr = outSr || 44100;
    const OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    const off = new OAC(2, Math.ceil(duration * outSr), outSr);
    items.forEach((it) => {
      const s = off.createBufferSource(); s.buffer = it.buf; const g = off.createGain(); g.gain.value = it.gain; s.connect(g); g.connect(off.destination);
      if (it.offset >= 0) s.start(it.offset); else s.start(0, -it.offset);
    });
    const r = await off.startRendering();
    const L = r.getChannelData(0), R = r.getChannelData(1);
    let peak = 0; for (let i = 0; i < L.length; i++) { const a = Math.abs(L[i]), b = Math.abs(R[i]); if (a > peak) peak = a; if (b > peak) peak = b; }
    if (peak < 1e-4) throw new Error('The mix is silent. Check that your layers are not muted.');
    const k = Math.min(4, 0.89 / peak), n = L.length, fi = Math.round(outSr * 0.008), fo = Math.round(outSr * 0.15);
    for (let i = 0; i < n; i++) {
      let f = k; if (i < fi) f *= i / fi; if (n - i < fo) f *= (n - i) / fo;
      L[i] *= f; R[i] *= f;
    }
    return { L, R, sr: outSr };
  };

  /* ======================================================================= MP3 */
  D.encodeMp3 = async function (L, R, sr, kbps, onP) {
    if (typeof lamejs === 'undefined') throw new Error('MP3 encoder failed to load (js/vendor/lame.min.js)');
    const enc = new lamejs.Mp3Encoder(2, sr, kbps || 128), n = L.length, step = 1152 * 12, parts = [];
    const i16 = (a, s, e) => { const o = new Int16Array(e - s); for (let i = s; i < e; i++) { const v = Math.max(-1, Math.min(1, a[i])); o[i - s] = v < 0 ? v * 0x8000 : v * 0x7fff; } return o; };
    for (let i = 0; i < n; i += step) {
      const e = Math.min(n, i + step), b = enc.encodeBuffer(i16(L, i, e), i16(R, i, e));
      if (b.length) parts.push(new Uint8Array(b));
      if (onP) onP(e / n); await tick();
    }
    const f = enc.flush(); if (f.length) parts.push(new Uint8Array(f));
    return new Blob(parts, { type: 'audio/mpeg' });
  };

  /* ======================================================================= ZIP */
  let crcT = null;
  function crc32(u8) {
    if (!crcT) { crcT = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; crcT[n] = c >>> 0; } }
    let c = 0xffffffff; for (let i = 0; i < u8.length; i++) c = crcT[(c ^ u8[i]) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0;
  }
  /* files: [{ name:'audio/ep-001.mp3', blob }]  (stored, no compression: mp3 does not compress) */
  D.zip = async function (files) {
    const enc = new TextEncoder(), chunks = [], central = []; let offset = 0;
    const d = new Date(), dt = ((d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1)) & 0xffff, dd = (((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate()) & 0xffff;
    for (const f of files) {
      const data = new Uint8Array(await f.blob.arrayBuffer()), name = enc.encode(f.name), crc = crc32(data);
      const h = new DataView(new ArrayBuffer(30)); h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true); h.setUint16(6, 0x0800, true); h.setUint16(8, 0, true); h.setUint16(10, dt, true); h.setUint16(12, dd, true);
      h.setUint32(14, crc, true); h.setUint32(18, data.length, true); h.setUint32(22, data.length, true); h.setUint16(26, name.length, true); h.setUint16(28, 0, true);
      chunks.push(new Uint8Array(h.buffer), name, data);
      const c = new DataView(new ArrayBuffer(46)); c.setUint32(0, 0x02014b50, true); c.setUint16(4, 20, true); c.setUint16(6, 20, true); c.setUint16(8, 0x0800, true); c.setUint16(10, 0, true); c.setUint16(12, dt, true); c.setUint16(14, dd, true);
      c.setUint32(16, crc, true); c.setUint32(20, data.length, true); c.setUint32(24, data.length, true); c.setUint16(28, name.length, true); c.setUint32(42, offset, true);
      central.push(new Uint8Array(c.buffer), name);
      offset += 30 + name.length + data.length;
    }
    let cdLen = 0; central.forEach((p) => { cdLen += p.length; });
    const e = new DataView(new ArrayBuffer(22)); e.setUint32(0, 0x06054b50, true); e.setUint16(8, files.length, true); e.setUint16(10, files.length, true); e.setUint32(12, cdLen, true); e.setUint32(16, offset, true);
    return new Blob([...chunks, ...central, new Uint8Array(e.buffer)], { type: 'application/zip' });
  };
})();
