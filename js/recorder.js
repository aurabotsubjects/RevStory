/* ============================================================================
 *  AURABOT PROJECT · REVELATION · SETTINGS → VOICE STUDIO
 *  Record narration against the picture, in layers, with optional voice filters.
 *  Layers are kept untouched (non-destructive) so everything can be edited,
 *  re-recorded or deleted. "Save" mixes the layers into  audio/ep-###.mp3
 * ========================================================================== */
(function () {
  'use strict';
  const Aura = window.Aura, S = Aura.SERIES, D = Aura.Dsp;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const pad3 = (n) => String(n).padStart(3, '0');
  const fileName = (n) => 'ep-' + pad3(n) + '.mp3';
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const LS = {
    get(k, d) { try { const v = localStorage.getItem('aura.studio.' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('aura.studio.' + k, JSON.stringify(v)); } catch (e) { /* noop */ } },
  };
  const fmtBytes = (b) => (b > 1048576 ? (b / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(b / 1024)) + ' KB');
  const fmtDate = (ms) => new Date(ms).toLocaleString([], { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const toast = (m) => { if (Aura.Player) Aura.Player.toast(m); };
  const FX = D.FILTERS;
  const COLORS = ['#f2c46d', '#5db7ff', '#ff8a2b', '#9dffc0', '#d6246e', '#c026d3', '#27d3c3', '#e8483b'];

  const st = {
    built: false, open: false, tab: 'studio', ep: 0, T: null, layers: [], final: null, pub: null, token: 0,
    solo: new Set(), recording: null, proc: new Map(), procP: new Map(), pcm: new Map(), nodes: new Map(),
    vbus: null, vbusCtx: null, dir: null, status: { layers: {}, finals: {} }, busy: false, mic: null, meterOn: false, dirty: false,
    fx: LS.get('fx', 'none'), amt: LS.get('amt', 0.65), saving: false,
  };

  /* ============================================================ voice hook */
  /* Plugged into the engine (voHook) while the studio is open; also used by the stand-alone transport. */
  function ensureVBus(ctx) { if (st.vbusCtx !== ctx) { st.vbus = ctx.createGain(); st.vbus.connect(ctx.destination); st.vbusCtx = ctx; } return st.vbus; }
  const procKey = (l) => [l.id, l.rev || 0, l.filter || 'none', l.filter && l.filter !== 'none' ? Math.round((l.amt === undefined ? 0.65 : l.amt) * 100) : 0].join('|');
  function stopLayers() { st.nodes.forEach((n) => { try { n.s.stop(); } catch (e) { /* noop */ } try { n.s.disconnect(); n.g.disconnect(); } catch (e) { /* noop */ } }); st.nodes.clear(); }
  function layerGain(l) { return (st.solo.size ? st.solo.has(l.id) : !l.muted) ? l.gain : 0; }
  function startLayers(ctx, from, when) {
    stopLayers();
    const bus = ensureVBus(ctx), rec = st.recording;
    if (rec && !LS.get('hearLayers', true)) return;
    for (const l of st.layers) {
      if (rec && rec.replaceId === l.id) continue;
      const buf = st.proc.get(procKey(l)); if (!buf) continue;
      const a = l.offset, end = a + buf.length / buf.sampleRate; if (end <= from) continue;
      const s = ctx.createBufferSource(); s.buffer = buf; const g = ctx.createGain(); g.gain.value = layerGain(l); s.connect(g); g.connect(bus);
      if (a >= from) s.start(when + (a - from)); else s.start(when, from - a);
      st.nodes.set(l.id, { s, g });
    }
  }
  const hook = {
    start(ctx, dest, t, when) {
      const r = st.recording; if (r && r.armed && r.alignT === null) r.alignT = when;
      st.lastStart = { ctx, t, when }; startLayers(ctx, t, when); return true;
    },
    stop() { stopLayers(); },
  };
  function restartLayers() { const T = st.T; if (T && T.playing && T.ctx) { stopLayers(); startLayers(T.ctx, T.time, T.ctx.currentTime + 0.05); } }

  /* ================================================================ transports */
  class EngineT {
    constructor(e) { this.e = e; this.kind = 'engine'; this.ctx = null; }
    get duration() { return this.e.duration; } get time() { return this.e.time; } get playing() { return this.e.playing; }
    async ensureCtx() { const c = this.e._ensureAudio(); if (c && c.state !== 'running') { try { await c.resume(); } catch (e) { /* noop */ } } this.ctx = c; applyScoreGain(); return c; }
    play() { this.e.play(); } pause() { this.e.pause(); } seek(t) { this.e.seek(t); }
  }
  class SoloT {
    constructor(d) { this.duration = d; this.playing = false; this._t = 0; this.ctx = null; this.kind = 'solo'; }
    get time() { return this.playing ? Math.min(this.duration, this._t0 + (this.ctx.currentTime - this._c0)) : this._t; }
    async ensureCtx() { if (!this.ctx) { const AC = window.AudioContext || window.webkitAudioContext; this.ctx = new AC(); } if (this.ctx.state !== 'running') { try { await this.ctx.resume(); } catch (e) { /* noop */ } } return this.ctx; }
    async play() {
      const c = await this.ensureCtx(); if (this._t >= this.duration - 0.05) this._t = 0;
      this._t0 = this._t; this._c0 = c.currentTime; this.playing = true; hook.start(c, null, this._t, c.currentTime + 0.08); onState('playing');
      const f = () => { if (!this.playing) return; const t = this.time; onTime(t); if (t >= this.duration - 1e-3) { this.playing = false; this._t = this.duration; hook.stop(); onState('ended'); return; } this._raf = requestAnimationFrame(f); };
      cancelAnimationFrame(this._raf); this._raf = requestAnimationFrame(f);
    }
    pause() { if (!this.playing) return; this._t = this.time; this.playing = false; cancelAnimationFrame(this._raf); hook.stop(); onState('paused'); }
    seek(t) { t = clamp(t, 0, this.duration); this._t = t; if (this.playing) { this._t0 = t; this._c0 = this.ctx.currentTime; hook.stop(); hook.start(this.ctx, null, t, this.ctx.currentTime + 0.08); } onTime(t); }
  }
  function applyScoreGain() {
    const T = st.T; if (!T || T.kind !== 'engine' || !T.e.master) return;
    const muteScore = st.recording && !LS.get('hearScore', false);
    T.e.master.gain.value = muteScore ? 0 : T.e.volume;
  }

  /* ================================================================ processing / caches */
  async function getPcm(l) {
    const k = l.id + '|' + (l.rev || 0); if (st.pcm.has(k)) return st.pcm.get(k);
    const o = await D.wavToPcm(l.blob); st.pcm.set(k, o); return o;
  }
  function getProc(l) {
    const k = procKey(l); if (st.proc.has(k)) return Promise.resolve(st.proc.get(k));
    if (st.procP.has(k)) return st.procP.get(k);
    const lid = l.id;
    let p = (async () => {
      const { pcm, sr } = await getPcm(l); laneBusy(lid, true);
      const buf = await D.processLayer(pcm, sr, l.filter, l.amt, (pr) => laneProg(lid, pr));
      st.proc.forEach((v, key) => { if (key.startsWith(lid + '|') && key !== k) st.proc.delete(key); });
      st.proc.set(k, buf); return buf;
    })();
    p = p.finally(() => { st.procP.delete(k); laneBusy(lid, false); });
    st.procP.set(k, p); return p;
  }
  async function prepareAll() { await Promise.all(st.layers.map((l) => getProc(l))); }
  function laneBusy(id, on) { const el = $('.vs-layer[data-id="' + id + '"] .l-proc'); if (el) { el.classList.toggle('on', on); if (on) el.textContent = 'Applying filter…'; } }
  function laneProg(id, p) { const el = $('.vs-layer[data-id="' + id + '"] .l-proc'); if (el) el.textContent = 'Applying filter… ' + Math.round(p * 100) + '%'; }

  /* ================================================================ DOM build */
  const FX_TEXT = {
    narrator: 'Deeper and older, with a faint tremor, a warm and slightly nasal “old film-reel” tone, a little gravel and a touch of room.',
    god: 'Vast and radiant: a deeper body, a shimmering octave above, choir-like width and a long cathedral reverb. Use it on the lines where God speaks.',
  };
  function build() {
    if (st.built) return; st.built = true;
    const el = document.createElement('div'); el.className = 'vs'; el.id = 'vsRoot'; el.setAttribute('aria-hidden', 'true');
    el.innerHTML = `
    <div class="vs-top">
      <div class="vs-title"><small>Aurabot Project</small><b>Settings</b></div>
      <nav class="vs-tabs" role="tablist"><button data-tab="studio" class="on">Voice Studio</button><button data-tab="options">Recording &amp; storage</button></nav>
      <button class="vs-close" id="vsClose">Close <span>✕</span></button>
    </div>
    <section class="vs-pane on" data-pane="studio">
      <aside class="vs-eps">
        <input class="vs-search" id="vsSearch" type="search" placeholder="Search episodes…" aria-label="Search episodes">
        <select class="vs-epsel" id="vsEpSel" aria-label="Episode"></select>
        <div class="vs-eplist" id="vsEpList"></div>
      </aside>
      <div class="vs-main" id="vsMain">
        <header class="vs-eh">
          <div><small id="vsKicker"></small><h2 id="vsEpTitle"></h2></div>
          <div class="vs-chips" id="vsChips"></div>
        </header>
        <div class="vs-grid">
          <div class="vs-left">
            <div class="vs-stagebox" id="vsStageBox">
              <div class="vs-stage" id="vsStage"></div>
              <div class="vs-nopic" id="vsNoPic"><b>No picture yet</b><span>This episode isn’t animated yet. You can still record to the script and the timer; the animation can be timed to your voice later.</span><label class="vs-len">Length <input type="number" id="vsDur" min="20" max="120" step="1"> s</label></div>
              <div class="vs-count" id="vsCount"></div>
            </div>
            <div class="vs-transport">
              <button class="vs-btn icon" id="vsRestart" title="Back to start" aria-label="Back to start"><svg viewBox="0 0 24 24"><path d="M6 6h2v12H6zM9.5 12 18 6v12z"/></svg></button>
              <button class="vs-btn icon" id="vsPlay" title="Play / pause (Space)" aria-label="Play or pause"><svg viewBox="0 0 24 24" id="vsPlayIc"><path d="M8 5v14l11-7z"/></svg></button>
              <span class="vs-time" id="vsTime">0:00 / 1:00</span>
              <input type="range" class="vs-scrub" id="vsScrub" min="0" max="1000" value="0" aria-label="Playhead">
            </div>
          </div>
          <div class="vs-script"><div class="vs-script-h">Script <span>World English Bible</span></div><div class="vs-verses" id="vsVerses"></div></div>
        </div>

        <div class="vs-card vs-rec">
          <div class="vs-rec-main">
            <button class="vs-recbtn" id="vsRec"><i></i><span id="vsRecLabel">Record new layer</span><small id="vsRecSub">from 0:00</small></button>
            <button class="vs-btn ghost" id="vsCancelTake" hidden>Cancel take</button>
            <div class="vs-meterwrap"><div class="vs-meter"><i id="vsMeter"></i></div><button class="vs-btn ghost sm" id="vsMicTest">Test mic</button></div>
          </div>
          <div class="vs-fxrow">
            <div class="vs-fxlabel">Voice filter <em>for new recordings</em></div>
            <button class="vs-fx" data-fx="narrator" aria-pressed="false"><span class="sw"></span><b>Old Narrator</b></button>
            <button class="vs-fx god" data-fx="god" aria-pressed="false"><span class="sw"></span><b>Voice of God</b></button>
            <label class="vs-amt">Strength <input type="range" id="vsAmt" min="0" max="100" value="65"></label>
          </div>
          <p class="vs-fxnote" id="vsFxNote"></p>
          <div class="vs-opts">
            <label><input type="checkbox" id="vsHearLayers"> Hear my other layers while recording</label>
            <label><input type="checkbox" id="vsHearScore"> Hear the music while recording</label>
            <label>Count-in <select id="vsCount3"><option value="0">None</option><option value="3">3 seconds</option><option value="5">5 seconds</option></select></label>
          </div>
          <p class="vs-tip">Wear headphones if you want to hear the picture’s music or other layers while you record, so they don’t leak into the mic. Recording starts at the playhead: drag it to a verse to record just that line (great for God’s lines).</p>
        </div>

        <div class="vs-card">
          <div class="vs-card-h"><h3>Layers <span id="vsLayerCount"></span></h3><div class="vs-card-a"><button class="vs-btn ghost sm" id="vsImport">Import audio file as layer</button><input type="file" id="vsFile" accept="audio/*" hidden></div></div>
          <div id="vsLayers"></div>
        </div>

        <div class="vs-card vs-out">
          <div class="vs-card-h"><h3>Final audio <code id="vsFileName"></code></h3></div>
          <div class="vs-outgrid">
            <div class="vs-stat" id="vsStat"></div>
            <div class="vs-outbtns">
              <button class="vs-btn primary" id="vsSave">Save episode audio</button>
              <button class="vs-btn ghost" id="vsPlaySaved">Play saved</button>
              <button class="vs-btn ghost" id="vsDownload">Download</button>
              <button class="vs-btn ghost" id="vsLoadSaved">Edit: load saved copy as layer</button>
              <button class="vs-btn ghost" id="vsLoadPub">Edit: load website copy as layer</button>
              <button class="vs-btn danger" id="vsDelFinal">Delete saved audio</button>
              <button class="vs-btn danger" id="vsClear">Clear all layers (redo)</button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="vs-pane" data-pane="options">
      <div class="vs-opt-wrap" id="vsOptions"></div>
    </section>
    <div class="vs-busy" id="vsBusy"><div><b id="vsBusyMsg">Working…</b><div class="bar"><i id="vsBusyBar"></i></div></div></div>
    <div class="vs-modal" id="vsModal"><div><h4 id="vsMTitle"></h4><p id="vsMText"></p><div class="row"><button class="vs-btn ghost" id="vsMNo">Cancel</button><button class="vs-btn danger" id="vsMYes">OK</button></div></div></div>`;
    document.body.appendChild(el);
    wire();
  }

  /* =============================================================== helpers: UI */
  function busy(msg, p) { const b = $('#vsBusy'); st.busy = !!msg; b.classList.toggle('on', !!msg); if (msg) { $('#vsBusyMsg').textContent = msg; $('#vsBusyBar').style.width = (p === undefined ? 100 : Math.round(p * 100)) + '%'; $('#vsBusyBar').parentNode.classList.toggle('ind', p === undefined); } }
  function ask(title, text, ok, danger) {
    return new Promise((res) => {
      const m = $('#vsModal'); $('#vsMTitle').textContent = title; $('#vsMText').textContent = text; const y = $('#vsMYes'); y.textContent = ok || 'OK'; y.classList.toggle('danger', danger !== false);
      m.classList.add('on'); const done = (v) => { m.classList.remove('on'); y.onclick = n.onclick = null; res(v); }; const n = $('#vsMNo'); y.onclick = () => done(true); n.onclick = () => done(false);
    });
  }
  const meta = () => S.episodes[st.ep - 1];
  function verseList() {
    const m = /^(\d+):(\d+)(?:-(\d+))?$/.exec(meta().verses); if (!m) return [];
    const ch = m[1], a = +m[2], b = m[3] ? +m[3] : a, out = [];
    for (let v = a; v <= b; v++) out.push({ ref: ch + ':' + v, v, text: (window.SCRIPTURE && window.SCRIPTURE[ch + ':' + v]) || '' });
    return out;
  }

  /* ============================================================== episode list */
  function renderEpList() {
    const list = $('#vsEpList'), sel = $('#vsEpSel'), q = ($('#vsSearch').value || '').toLowerCase().trim();
    list.innerHTML = ''; sel.innerHTML = '';
    S.parts.forEach((p, pi) => {
      const eps = S.episodes.filter((e) => e.part === pi && (!q || (String(e.n) === q) || e.title.toLowerCase().includes(q) || ('ep ' + e.n).includes(q) || p.name.toLowerCase().includes(q)));
      if (!eps.length) return;
      const h = document.createElement('div'); h.className = 'vs-ph'; h.style.setProperty('--c', p.color); h.textContent = 'Part ' + p.num + ' · ' + p.name; list.appendChild(h);
      const og = document.createElement('optgroup'); og.label = 'Part ' + p.num + ' · ' + p.name; sel.appendChild(og);
      eps.forEach((e) => {
        const nl = st.status.layers[e.n] || 0, fin = st.status.finals[e.n], built = !!Aura.episodes[e.n];
        const b = document.createElement('button'); b.className = 'vs-ep' + (e.n === st.ep ? ' on' : ''); b.dataset.n = e.n; b.style.setProperty('--c', p.color);
        b.innerHTML = '<span class="n">' + pad3(e.n) + '</span><span class="t">' + esc(e.title) + '</span><span class="s">' + (fin ? '<i class="ok" title="Audio saved"></i>' : nl ? '<i class="wip" title="' + nl + ' layer(s), not saved yet"></i>' : '') + (built ? '' : '<em title="Not animated yet">script</em>') + '</span>';
        list.appendChild(b);
        const o = document.createElement('option'); o.value = e.n; o.textContent = pad3(e.n) + ' · ' + e.title + (fin ? '  ✓ saved' : nl ? '  ● ' + nl + ' layer(s)' : ''); if (e.n === st.ep) o.selected = true; og.appendChild(o);
      });
    });
    const on = $('.vs-ep.on', list); if (on && on.scrollIntoView && !q) on.scrollIntoView({ block: 'nearest' });
  }
  async function refreshStatus() { try { st.status = await D.store.status(); } catch (e) { /* noop */ } renderEpList(); }

  /* ============================================================== select episode */
  async function leaveEpisode() {
    if (st.T) { try { if (st.T.playing) st.T.pause(); } catch (e) { /* noop */ } }
    stopLayers(); st.solo.clear(); st.proc.clear(); st.procP.clear(); st.pcm.clear();
  }
  async function selectEpisode(n) {
    if (st.recording) { toast('Stop recording first'); return; }
    if (st.busy) return;
    const tok = ++st.token;
    await leaveEpisode();
    st.ep = n; LS.set('ep', n);
    const m = meta(), def = Aura.episodes[n];
    $('#vsKicker').textContent = 'Episode ' + n + ' · ' + S.parts[m.part].name; $('#vsEpTitle').textContent = m.title;
    const box = $('#vsStageBox'); let T = null;
    if (def && Aura.Player && Aura.Engine && Aura.Engine.supported()) {
      try {
        Aura.Player.studio = true; busy('Loading the picture…');
        const eng = await Aura.Player.loadOnly(n);
        if (tok !== st.token) return;
        if (eng) {
          T = new EngineT(eng); eng.voHook = hook; $('#vsStage').appendChild(Aura.Player.stageEl);
          if (!eng._vsWired) { eng._vsWired = true; eng.on('time', onTime); eng.on('state', onState); }
        }
      } catch (e) { console.error(e); }
      busy(null);
    }
    if (!T) T = new SoloT(LS.get('dur' + n, 60));
    st.T = T; box.classList.toggle('solo', T.kind === 'solo'); $('#vsDur').value = T.duration;
    if (T.kind === 'engine') { try { await T.ensureCtx(); } catch (e) { /* noop */ } T.e.renderAt(0); }
    st.layers = ((await D.store.layersFor(n)) || []).sort((a, b) => a.createdAt - b.createdAt);
    st.final = (await D.store.get('finals', n)) || null;
    if (tok !== st.token) return;
    st.pub = null; renderEpList(); renderScript(); renderLayers(); renderOut(); onTime(0); onState('paused'); renderRecUI();
    st.layers.forEach((l) => getProc(l).catch(() => {}));
    checkPublished(n, tok);
  }
  async function checkPublished(n, tok) {
    let r = { ok: false };
    try { const res = await fetch('audio/' + fileName(n), { method: 'HEAD', cache: 'no-store' }); if (res.ok) r = { ok: true, size: +res.headers.get('content-length') || 0 }; } catch (e) { /* file:// or offline */ }
    if (tok === st.token) { st.pub = r; renderOut(); }
  }

  /* ================================================================ script panel */
  let verseWin = [], activeVerse = '';
  function renderScript() {
    const vs = verseList(), def = Aura.episodes[st.ep], box = $('#vsVerses'); verseWin = {};
    if (def && def.cues) def.cues.forEach((c) => { const m = /^(\d+):(\d+)(?:-(\d+))?$/.exec(c.ref); if (!m) return; for (let v = +m[2]; v <= (m[3] ? +m[3] : +m[2]); v++) verseWin[m[1] + ':' + v] = { t0: c.t0, t1: c.t1 }; });
    box.innerHTML = vs.map((v) => { const w = verseWin[v.ref]; return '<p data-ref="' + v.ref + '"><sup>' + v.v + '</sup>' + esc(v.text || '(verse text missing)') + (w ? '<em>on screen ' + Aura.fmtTime(w.t0) + '–' + Aura.fmtTime(w.t1) + '</em>' : '') + '</p>'; }).join('');
    $$('#vsVerses p').forEach((p) => p.addEventListener('click', () => { const w = verseWin[p.dataset.ref]; if (w && st.T && !st.recording) st.T.seek(Math.max(0, w.t0 - 0.5)); }));
    activeVerse = '';
  }
  function updScript(t) {
    let a = '';
    for (const ref in verseWin) { const w = verseWin[ref]; if (t >= w.t0 - 0.8 && t < w.t1) { a = ref; break; } }
    if (a === activeVerse) return; activeVerse = a;
    $$('#vsVerses p').forEach((p) => p.classList.toggle('on', p.dataset.ref === a));
    const e = a && $('#vsVerses p[data-ref="' + a + '"]'); if (e) { const box = $('#vsVerses'); box.scrollTo({ top: e.offsetTop - box.clientHeight / 3, behavior: 'smooth' }); }
  }

  /* ================================================================ transport UI */
  function onTime(t) {
    const T = st.T; if (!T) return;
    const d = T.duration;
    $('#vsTime').textContent = Aura.fmtTime(t) + ' / ' + Aura.fmtTime(d);
    if (!st.scrubbing) $('#vsScrub').value = Math.round((t / d) * 1000);
    $$('#vsLayers .ph').forEach((p) => { p.style.left = (t / d) * 100 + '%'; });
    updScript(t);
    if (!st.recording) $('#vsRecSub').textContent = 'from ' + Aura.fmtTime(t) + (t > 0.5 ? ' (playhead)' : '');
    const r = st.recording; if (r && r.armed && st.T.playing) { /* live level text handled by meter */ }
  }
  function onState(s) {
    $('#vsPlayIc').innerHTML = s === 'playing' ? '<path d="M6 5h4v14H6zM14 5h4v14h-4z"/>' : '<path d="M8 5v14l11-7z"/>';
    if (s === 'ended' && st.recording) stopRec(true);
  }
  async function togglePlay() {
    const T = st.T; if (!T || st.busy) return;
    if (T.playing) { T.pause(); return; }
    await T.ensureCtx(); busy(st.layers.some((l) => !st.proc.has(procKey(l))) ? 'Preparing your layers…' : null);
    try { await prepareAll(); } catch (e) { console.error(e); }
    busy(null); T.play();
  }

  /* ================================================================ layers UI */
  const lanes = new Map();
  function layerHTML(l, i) {
    const color = l.filter && l.filter !== 'none' ? FX[l.filter].color : COLORS[i % COLORS.length];
    const o = l.offset || 0;
    return `<div class="vs-layer${l.muted ? ' muted' : ''}" data-id="${l.id}" style="--lc:${color}">
      <div class="l-head">
        <span class="dot"></span>
        <input class="l-name" value="${esc(l.name)}" maxlength="40" aria-label="Layer name">
        <select class="l-filter" aria-label="Voice filter"><option value="none">No filter</option><option value="narrator">Old Narrator</option><option value="god">Voice of God</option></select>
        <label class="l-amt"${!l.filter || l.filter === 'none' ? ' hidden' : ''}>Strength <input type="range" min="0" max="100" value="${Math.round((l.amt === undefined ? 0.65 : l.amt) * 100)}"></label>
        <label class="l-vol">Volume <input type="range" min="0" max="150" value="${Math.round(l.gain * 100)}"></label>
        <span class="l-off" title="Nudge this layer earlier or later against the picture"><button class="vs-btn icon sm" data-a="off-" aria-label="Earlier">−</button><span>${o >= 0 ? '+' : '−'}${Math.abs(o).toFixed(2)}s</span><button class="vs-btn icon sm" data-a="off+" aria-label="Later">+</button></span>
        <button class="vs-btn sm tog l-mute${l.muted ? ' on' : ''}" data-a="mute" title="Mute">Mute</button>
        <button class="vs-btn sm tog l-solo${st.solo.has(l.id) ? ' on' : ''}" data-a="solo" title="Hear only this layer">Solo</button>
        <button class="vs-btn sm ghost" data-a="redo" title="Record this layer again">Redo</button>
        <button class="vs-btn sm danger" data-a="del" title="Delete this layer">Delete</button>
      </div>
      <div class="l-lane"><canvas></canvas><i class="ph"></i><span class="l-proc"></span></div>
    </div>`;
  }
  function renderLayers() {
    const box = $('#vsLayers'); lanes.clear();
    $('#vsLayerCount').textContent = st.layers.length ? '(' + st.layers.length + ')' : '';
    if (!st.layers.length) { box.innerHTML = '<div class="vs-empty">No layers yet. Press <b>Record new layer</b>. Each take becomes its own layer, so you can record on top without overwriting anything, and delete any layer you don’t want.</div>'; return; }
    box.innerHTML = st.layers.map(layerHTML).join('');
    $$('.vs-layer', box).forEach((row) => {
      const l = st.layers.find((x) => x.id === row.dataset.id); $('.l-filter', row).value = l.filter || 'none';
      lanes.set(l.id, row.querySelector('canvas')); drawLane(l);
    });
    onTime(st.T ? st.T.time : 0);
  }
  async function drawLane(l) {
    const cv = lanes.get(l.id); if (!cv || !st.T) return;
    let o; try { o = await getPcm(l); } catch (e) { return; }
    const w = cv.clientWidth, h = cv.clientHeight; if (!w) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2); cv.width = w * dpr; cv.height = h * dpr;
    const g = cv.getContext('2d'); g.scale(dpr, dpr); g.clearRect(0, 0, w, h);
    const d = st.T.duration; g.fillStyle = 'rgba(255,255,255,.06)'; for (let s = 10; s < d; s += 10) g.fillRect((s / d) * w, 0, 1, h);
    const x0 = ((l.offset || 0) / d) * w, x1 = x0 + (o.pcm.length / o.sr / d) * w;
    g.fillStyle = 'rgba(255,255,255,.05)'; g.fillRect(Math.max(0, x0), 0, Math.min(w, x1) - Math.max(0, x0), h);
    g.fillStyle = getComputedStyle(cv.parentNode.parentNode).getPropertyValue('--lc') || '#f2c46d';
    const per = o.pcm.length / Math.max(1, x1 - x0), mid = h / 2;
    for (let x = Math.max(0, Math.floor(x0)); x < Math.min(w, x1); x++) {
      const a = Math.floor((x - x0) * per), b = Math.min(o.pcm.length, Math.floor((x - x0 + 1) * per)); let pk = 0;
      for (let i = a; i < b; i += 1 + ((b - a) >> 5)) { const v = Math.abs(o.pcm[i]); if (v > pk) pk = v; }
      const bh = Math.max(1, Math.min(1, pk * 1.6) * (h * 0.46)); g.fillRect(x, mid - bh, 1, bh * 2);
    }
  }
  async function saveLayer(l) { await D.store.put('layers', l); await refreshStatus(); markDirty(); }
  function sigNow() { return st.layers.map((l) => [l.id, l.rev || 0, (l.offset || 0).toFixed(2), l.gain.toFixed(2), l.muted ? 1 : 0, l.filter || 'none', Math.round((l.amt === undefined ? 0.65 : l.amt) * 100)].join(':')).join('|'); }
  function markDirty() { renderOut(); }

  async function layerAction(row, a) {
    const l = st.layers.find((x) => x.id === row.dataset.id); if (!l) return;
    if (a === 'off-' || a === 'off+') { l.offset = Math.round(((l.offset || 0) + (a === 'off+' ? 0.05 : -0.05)) * 100) / 100; row.querySelector('.l-off span').textContent = (l.offset >= 0 ? '+' : '−') + Math.abs(l.offset).toFixed(2) + 's'; drawLane(l); restartLayers(); saveLayer(l); }
    else if (a === 'mute') { l.muted = !l.muted; row.classList.toggle('muted', l.muted); $('.l-mute', row).classList.toggle('on', l.muted); const n = st.nodes.get(l.id); if (n) n.g.gain.value = layerGain(l); saveLayer(l); }
    else if (a === 'solo') { st.solo.has(l.id) ? st.solo.delete(l.id) : st.solo.add(l.id); $$('#vsLayers .l-solo').forEach((b) => b.classList.toggle('on', st.solo.has(b.closest('.vs-layer').dataset.id))); st.layers.forEach((x) => { const n = st.nodes.get(x.id); if (n) n.g.gain.value = layerGain(x); }); }
    else if (a === 'del') { if (!(await ask('Delete this layer?', '“' + l.name + '” will be removed. This cannot be undone.', 'Delete layer'))) return; await D.store.del('layers', l.id); st.layers = st.layers.filter((x) => x.id !== l.id); st.solo.delete(l.id); restartLayers(); await refreshStatus(); renderLayers(); renderOut(); toast('Layer deleted'); }
    else if (a === 'redo') { if (st.recording) return; startRec(l.id); }
  }

  /* ================================================================ recording */
  const micError = (e) => (!navigator.mediaDevices ? 'Recording needs a secure page (https:// or http://localhost). Open the site from GitHub Pages or a local server.' : e && e.name === 'NotAllowedError' ? 'Microphone blocked. Allow it in the address bar (the camera/lock icon) and try again.' : e && e.name === 'NotFoundError' ? 'No microphone was found.' : 'Could not open the microphone: ' + (e && e.message ? e.message : e));
  async function openMic(ctx) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) throw new Error('nomedia');
    const c = { echoCancellation: LS.get('echo', false), noiseSuppression: LS.get('noise', true), autoGainControl: false, channelCount: 1 }; const id = LS.get('mic', '');
    let stream;
    try { stream = await navigator.mediaDevices.getUserMedia({ audio: id ? Object.assign({ deviceId: { exact: id } }, c) : c }); }
    catch (e) { if (id && e.name === 'OverconstrainedError') stream = await navigator.mediaDevices.getUserMedia({ audio: c }); else throw e; }
    const src = ctx.createMediaStreamSource(stream), an = ctx.createAnalyser(); an.fftSize = 1024; src.connect(an);
    return { stream, src, analyser: an };
  }
  function startMeter(an) {
    st.meterOn = true; const buf = new Float32Array(an.fftSize), bar = $('#vsMeter'); let hold = 0;
    const f = () => {
      if (!st.meterOn) { bar.style.width = '0%'; bar.classList.remove('hot'); return; }
      an.getFloatTimeDomainData(buf); let pk = 0, sum = 0; for (let i = 0; i < buf.length; i++) { const a = Math.abs(buf[i]); if (a > pk) pk = a; sum += buf[i] * buf[i]; }
      const rms = Math.sqrt(sum / buf.length), db = 20 * Math.log10(Math.max(rms, 1e-5)), pct = clamp((db + 60) / 60, 0, 1) * 100;
      hold = Math.max(hold * 0.96, pct); bar.style.width = pct + '%'; bar.classList.toggle('hot', pk > 0.97);
      if (st.recording && st.recording.armed) st.recording.peak = Math.max(st.recording.peak, pk);
      requestAnimationFrame(f);
    };
    requestAnimationFrame(f);
  }
  function stopMeter() { st.meterOn = false; }
  function showCount(n) { const c = $('#vsCount'); c.textContent = n > 0 ? n : ''; c.classList.toggle('on', n > 0); if (n > 0) { c.classList.remove('pop'); void c.offsetWidth; c.classList.add('pop'); } }
  function renderRecUI() {
    const r = st.recording;
    $('#vsRec').classList.toggle('live', !!r); $('#vsRecLabel').textContent = r ? (r.armed ? 'Stop recording' : 'Get ready…') : 'Record new layer'; $('#vsCancelTake').hidden = !r;
    $('#vsRec').disabled = false; $('#vsPlay').disabled = !!r; $('#vsRestart').disabled = !!r; $('#vsScrub').disabled = !!r;
    $('#vsMain').classList.toggle('is-rec', !!r); applyScoreGain();
  }
  async function startRec(replaceId) {
    if (st.recording || st.busy || !st.T) return;
    if (st.mic) await stopMicTest();
    const T = st.T; let ctx;
    try { ctx = await T.ensureCtx(); } catch (e) { toast('Audio could not start'); return; }
    let mic; try { mic = await openMic(ctx); } catch (e) { toast(micError(e)); return; }
    const rec = { ctx, mic, chunks: [], n: 0, firstT: null, alignT: null, armed: false, replaceId: replaceId || null, peak: 0, sr: ctx.sampleRate, from: 0 };
    const proc = ctx.createScriptProcessor(4096, 1, 1), mute = ctx.createGain(); mute.gain.value = 0;
    proc.onaudioprocess = (e) => {
      const c = new Float32Array(e.inputBuffer.getChannelData(0)); rec.chunks.push(c); rec.n += c.length;
      if (rec.firstT === null) rec.firstT = (e.playbackTime || ctx.currentTime) - (2 * proc.bufferSize) / ctx.sampleRate;
    };
    mic.src.connect(proc); proc.connect(mute); mute.connect(ctx.destination); rec.proc = proc; rec.mute = mute;
    st.recording = rec; renderRecUI(); startMeter(mic.analyser);
    let from = replaceId ? (st.layers.find((l) => l.id === replaceId).offset || 0) : T.time; if (from >= T.duration - 1) from = 0; from = Math.max(0, from); rec.from = from;
    if (T.playing) T.pause(); T.seek(from);
    busy(st.layers.some((l) => !st.proc.has(procKey(l))) ? 'Preparing your layers…' : null); try { await prepareAll(); } catch (e) { console.error(e); } busy(null);
    if (st.recording !== rec) return;
    const cd = +LS.get('count', 3);
    for (let i = cd; i > 0; i--) { showCount(i); await sleep(1000); if (st.recording !== rec) { showCount(0); return; } }
    showCount(0); rec.armed = true; renderRecUI(); T.play();
    setTimeout(() => { if (st.recording === rec && rec.alignT === null) { toast('Playback did not start. Please try again.'); stopRec(false); } }, 2500);
  }
  async function stopRec(commit) {
    const r = st.recording; if (!r) return; st.recording = null; showCount(0);
    const T = st.T; if (T && T.playing) T.pause();
    try { r.mic.src.disconnect(); r.proc.disconnect(); r.mute.disconnect(); r.proc.onaudioprocess = null; } catch (e) { /* noop */ }
    r.mic.stream.getTracks().forEach((t) => t.stop()); stopMeter(); renderRecUI();
    if (!commit || !r.armed || r.alignT === null) { if (commit === false) toast('Take cancelled'); return; }
    const all = new Float32Array(r.n); let o = 0; r.chunks.forEach((c) => { all.set(c, o); o += c.length; }); r.chunks = [];
    const comp = ((r.ctx.outputLatency || 0) + (r.ctx.baseLatency || 0) + LS.get('lat', 0) / 1000) * r.sr;
    const start = Math.round((r.alignT - r.firstT) * r.sr + comp), maxLen = Math.max(1, Math.round((T.duration - r.from) * r.sr));
    let clip;
    if (start >= 0) clip = all.slice(start, Math.min(all.length, start + maxLen));
    else { clip = new Float32Array(Math.min(all.length - start, maxLen)); clip.set(all.subarray(0, Math.max(0, clip.length + start)), -start); }
    let pk = 0; for (let i = 0; i < clip.length; i += 7) { const a = Math.abs(clip[i]); if (a > pk) pk = a; }
    if (clip.length < r.sr * 0.3 || pk < 0.003) { toast('Nothing was picked up from the microphone. Check your mic and try again.'); return; }
    busy('Saving your take…');
    let l;
    if (r.replaceId) {
      l = st.layers.find((x) => x.id === r.replaceId);
      if (l) { l.blob = D.pcmToWav(clip, r.sr); l.sr = r.sr; l.rev = (l.rev || 0) + 1; l.offset = r.from; l.len = clip.length; }
    }
    if (!l) {
      const base = st.fx === 'god' ? 'God' : st.fx === 'narrator' ? 'Narrator' : 'Voice';
      l = { id: uid(), ep: st.ep, name: base + ' ' + (st.layers.length + 1), createdAt: Date.now(), sr: r.sr, offset: r.from, gain: 1, muted: false, filter: st.fx, amt: st.amt, rev: 0, blob: D.pcmToWav(clip, r.sr), len: clip.length };
      st.layers.push(l);
    }
    st.pcm.set(l.id + '|' + (l.rev || 0), { pcm: clip, sr: r.sr });
    try { await D.store.put('layers', l); } catch (e) { console.error(e); busy(null); toast('Could not store the recording (storage full?)'); return; }
    busy(null); await refreshStatus(); renderLayers(); renderOut();
    if (pk > 0.98) toast('That take clipped (too loud). Try moving back from the mic.'); else toast(r.replaceId ? 'Layer replaced' : 'Layer added');
    getProc(l).catch(() => {});
  }
  async function stopMicTest() {
    const m = st.mic; if (!m) return; st.mic = null; stopMeter(); try { m.src.disconnect(); } catch (e) { /* noop */ } m.stream.getTracks().forEach((t) => t.stop()); $('#vsMicTest').textContent = 'Test mic';
  }
  async function micTest() {
    if (st.recording) return; if (st.mic) { await stopMicTest(); return; }
    try { const ctx = await st.T.ensureCtx(); st.mic = await openMic(ctx); startMeter(st.mic.analyser); $('#vsMicTest').textContent = 'Stop test'; toast('Say something. The bar should reach the middle or higher.'); } catch (e) { toast(micError(e)); }
  }

  /* ================================================================ import */
  async function importBlob(blob, name) {
    busy('Reading audio…');
    try {
      const ctx = await st.T.ensureCtx(); const buf = await ctx.decodeAudioData(await blob.arrayBuffer());
      const n = buf.length, mono = new Float32Array(n), chs = buf.numberOfChannels;
      for (let c = 0; c < chs; c++) { const d = buf.getChannelData(c); for (let i = 0; i < n; i++) mono[i] += d[i] / chs; }
      const l = { id: uid(), ep: st.ep, name: String(name || 'Imported').slice(0, 40), createdAt: Date.now(), sr: buf.sampleRate, offset: 0, gain: 1, muted: false, filter: 'none', amt: st.amt, rev: 0, blob: D.pcmToWav(mono, buf.sampleRate), len: n };
      await D.store.put('layers', l); st.layers.push(l); st.pcm.set(l.id + '|0', { pcm: mono, sr: buf.sampleRate });
      await refreshStatus(); renderLayers(); renderOut(); getProc(l).catch(() => {}); toast('Added as a new layer');
    } catch (e) { console.error(e); toast('That audio file could not be read.'); }
    busy(null);
  }

  /* ================================================================ final audio */
  const supportsDir = () => typeof window.showDirectoryPicker === 'function';
  async function dirReady(ask) {
    const h = st.dir; if (!h) return false;
    try { let p = await h.queryPermission({ mode: 'readwrite' }); if (p === 'granted') return true; if (!ask) return false; p = await h.requestPermission({ mode: 'readwrite' }); return p === 'granted'; } catch (e) { return false; }
  }
  async function audioDirHandle() { const h = st.dir; return h.name === 'audio' ? h : h.getDirectoryHandle('audio', { create: true }); }
  async function writeToFolder(name, blob) { const d = await audioDirHandle(), fh = await d.getFileHandle(name, { create: true }), w = await fh.createWritable(); await w.write(blob); await w.close(); }
  function downloadBlob(blob, name) { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); }

  async function saveFinal() {
    if (st.saving || st.busy || st.recording) return;
    const live = st.layers.filter((l) => !l.muted);
    if (!live.length) { toast('Record a layer (or un-mute one) first'); return; }
    st.saving = true; const n = st.ep, T = st.T;
    try {
      if (T.playing) T.pause();
      const toFolder = st.dir ? await dirReady(true) : false;
      busy('Applying filters…', 0.05); await prepareAll();
      busy('Mixing the layers…', 0.3);
      const mix = await D.mixdown(live.map((l) => ({ buf: st.proc.get(procKey(l)), offset: l.offset || 0, gain: l.gain })), T.duration, 44100);
      const blob = await D.encodeMp3(mix.L, mix.R, mix.sr, 128, (p) => busy('Making ' + fileName(n) + '…', 0.4 + p * 0.55));
      const rec = { ep: n, blob, size: blob.size, duration: T.duration, savedAt: Date.now(), sig: sigNow(), name: fileName(n) };
      await D.store.put('finals', rec); st.final = rec;
      let where = 'download';
      if (toFolder) { try { await writeToFolder(fileName(n), blob); where = 'folder'; } catch (e) { console.error(e); } }
      if (where === 'download') downloadBlob(blob, fileName(n));
      busy(null); await refreshStatus(); renderOut();
      toast(where === 'folder' ? 'Saved audio/' + fileName(n) + ' to your linked folder' : 'Saved. Put the downloaded ' + fileName(n) + ' in your audio folder');
    } catch (e) { console.error(e); busy(null); toast(e && e.message ? e.message : 'Saving failed'); }
    st.saving = false;
  }
  async function deleteFinal() {
    if (!st.final) return;
    if (!(await ask('Delete the saved audio?', fileName(st.ep) + ' will be removed from the Studio' + (st.dir ? ' and from your linked audio folder' : '') + '. Your layers are kept, so you can re-save or re-record it.', 'Delete saved audio'))) return;
    await D.store.del('finals', st.ep); st.final = null; let msg = 'Saved audio deleted';
    if (st.dir && (await dirReady(true))) { try { const d = await audioDirHandle(); await d.removeEntry(fileName(st.ep)); msg += ' (file removed from your folder)'; } catch (e) { /* not there */ } }
    else if (st.pub && st.pub.ok) msg += '. Remember to also delete audio/' + fileName(st.ep) + ' from your GitHub repository.';
    await refreshStatus(); renderOut(); toast(msg);
  }
  async function clearLayers() {
    if (!st.layers.length) return;
    if (!(await ask('Clear all layers and start over?', 'All ' + st.layers.length + ' layer(s) for this episode will be deleted. Saved audio (if any) is not touched until you save again.', 'Clear all layers'))) return;
    for (const l of st.layers) await D.store.del('layers', l.id); st.layers = []; st.solo.clear(); stopLayers(); await refreshStatus(); renderLayers(); renderOut(); toast('Layers cleared');
  }
  let savedAudio = null;
  function playSaved() {
    if (!st.final) return; if (savedAudio) { savedAudio.pause(); savedAudio = null; $('#vsPlaySaved').textContent = 'Play saved'; return; }
    if (st.T && st.T.playing) st.T.pause();
    const a = (savedAudio = new Audio(URL.createObjectURL(st.final.blob))); $('#vsPlaySaved').textContent = 'Stop playing'; a.onended = () => { savedAudio = null; $('#vsPlaySaved').textContent = 'Play saved'; }; a.play().catch(() => {});
  }
  function renderOut() {
    $('#vsFileName').textContent = 'audio/' + fileName(st.ep);
    const f = st.final, dirty = f && f.sig !== sigNow(), live = st.layers.some((l) => !l.muted);
    let h = '';
    h += f ? '<div class="row ok"><i></i><span><b>Saved in the Studio</b> · ' + fmtDate(f.savedAt) + ' · ' + fmtBytes(f.size) + ' · ' + Aura.fmtTime(f.duration || 0) + '</span></div>' : '<div class="row"><i></i><span><b>Not saved yet.</b> Record a layer, then press Save.</span></div>';
    if (dirty) h += '<div class="row warn"><i></i><span><b>Your layers changed since the last save.</b> Press Save to update ' + fileName(st.ep) + '.</span></div>';
    h += st.pub ? (st.pub.ok ? '<div class="row ok"><i></i><span><b>On the website:</b> audio/' + fileName(st.ep) + ' is live' + (st.pub.size ? ' (' + fmtBytes(st.pub.size) + ')' : '') + '</span></div>' : '<div class="row"><i></i><span><b>On the website:</b> no audio/' + fileName(st.ep) + ' uploaded yet</span></div>') : '';
    h += '<div class="row dest"><i></i><span><b>Saving will:</b> ' + (st.dir ? 'write ' + fileName(st.ep) + ' straight into your linked folder' + (st.dir.name === 'audio' ? '' : ' (<code>' + esc(st.dir.name) + '/audio</code>)') : 'download ' + fileName(st.ep) + '. Link your audio folder under “Recording &amp; storage” to skip the download') + '</span></div>';
    $('#vsStat').innerHTML = h;
    $('#vsSave').disabled = !live; $('#vsPlaySaved').disabled = !f; $('#vsDownload').disabled = !f; $('#vsLoadSaved').disabled = !f; $('#vsDelFinal').disabled = !f;
    $('#vsLoadPub').hidden = !(st.pub && st.pub.ok); $('#vsClear').disabled = !st.layers.length;
    const chips = []; if (f) chips.push('<span class="chip ok">Audio saved</span>'); else if (st.layers.length) chips.push('<span class="chip wip">' + st.layers.length + ' layer' + (st.layers.length > 1 ? 's' : '') + ' · not saved</span>'); else chips.push('<span class="chip">No audio yet</span>');
    chips.push(Aura.episodes[st.ep] ? '<span class="chip pic">Animated</span>' : '<span class="chip">Script only</span>');
    $('#vsChips').innerHTML = chips.join('');
  }

  /* ================================================================ options tab */
  async function renderOptions() {
    const box = $('#vsOptions'); let usage = '';
    try { if (navigator.storage && navigator.storage.estimate) { const e = await navigator.storage.estimate(); usage = fmtBytes(e.usage || 0) + ' used' + (e.quota ? ' of about ' + fmtBytes(e.quota) : ''); } } catch (e) { /* noop */ }
    const saved = Object.keys(st.status.finals).length, layersN = Object.values(st.status.layers).reduce((a, b) => a + b, 0);
    box.innerHTML = `
    <div class="vs-card"><h3>Playing episodes</h3>
      <label class="vs-check"><input type="checkbox" id="oUse" ${LS.get('useLocal', true) ? 'checked' : ''}> Use my Studio recordings when I watch on this device</label>
      <p class="vs-help">When on, episodes you have saved here play with your new audio straight away, before anything is uploaded. Visitors always hear whatever is in the <code>audio/</code> folder of the website.</p></div>
    <div class="vs-card"><h3>Your audio folder <small>for GitHub</small></h3>
      <p class="vs-help">Saved narration is named automatically by episode: <code>ep-001.mp3</code>, <code>ep-002.mp3</code>… and goes in the project’s <code>audio/</code> folder. Upload that folder to GitHub and the episodes pick the files up by themselves.</p>
      <div class="vs-dir"><span class="vs-dirstat ${st.dir ? 'ok' : ''}">${st.dir ? 'Linked: <b>' + esc(st.dir.name) + '</b>' : supportsDir() ? 'Not linked' : 'Not supported by this browser'}</span>
        ${supportsDir() ? '<button class="vs-btn primary" id="oLink">' + (st.dir ? 'Change folder…' : 'Link audio folder…') + '</button>' + (st.dir ? '<button class="vs-btn ghost" id="oUnlink">Unlink</button>' : '') : ''}</div>
      <p class="vs-help">${supportsDir() ? 'Choose the <code>audio</code> folder inside your project (or the project folder itself) and each Save writes the file there directly. Chrome, Edge and Opera on a computer support this.' : 'Your browser can’t write to folders (Safari, Firefox and phones). Saves will download as <code>ep-###.mp3</code>, or use “Download everything” below to get one ready-made <code>audio/</code> folder.'}</p></div>
    <div class="vs-card"><h3>Microphone</h3>
      <div class="vs-form"><label>Input <select id="oMic"><option value="">System default</option></select></label>
      <label class="vs-check"><input type="checkbox" id="oNoise" ${LS.get('noise', true) ? 'checked' : ''}> Reduce background noise</label>
      <label class="vs-check"><input type="checkbox" id="oEcho" ${LS.get('echo', false) ? 'checked' : ''}> Echo cancellation <small>(turn on only if you record with speakers)</small></label>
      <label>Sync nudge <input type="range" id="oLat" min="-250" max="400" step="5" value="${LS.get('lat', 0)}"> <b id="oLatV">${LS.get('lat', 0)} ms</b></label>
      <p class="vs-help">If your narration lands slightly late or early against the picture, adjust this once and it applies to every new recording. You can also nudge any single layer with the − / + buttons.</p></div></div>
    <div class="vs-card"><h3>Library</h3>
      <p class="vs-help"><b>${saved}</b> episode${saved === 1 ? '' : 's'} saved · <b>${layersN}</b> layer${layersN === 1 ? '' : 's'} stored in this browser${usage ? ' · ' + usage : ''}.<br>Layers live only in this browser, so keep a copy of the saved <code>ep-###.mp3</code> files too.</p>
      <div class="vs-row"><button class="vs-btn primary" id="oZip" ${saved ? '' : 'disabled'}>Download everything as an audio folder (.zip)</button><button class="vs-btn danger" id="oWipe">Delete all Studio data…</button></div></div>`;
    $('#oUse').onchange = (e) => LS.set('useLocal', e.target.checked);
    const lk = $('#oLink'); if (lk) lk.onclick = linkFolder; const ul = $('#oUnlink'); if (ul) ul.onclick = async () => { st.dir = null; try { await D.store.del('kv', 'dir'); } catch (e) { /* noop */ } renderOptions(); renderOut(); };
    $('#oNoise').onchange = (e) => LS.set('noise', e.target.checked); $('#oEcho').onchange = (e) => LS.set('echo', e.target.checked);
    $('#oLat').oninput = (e) => { $('#oLatV').textContent = e.target.value + ' ms'; LS.set('lat', +e.target.value); };
    $('#oMic').onchange = (e) => LS.set('mic', e.target.value);
    $('#oZip').onclick = zipAll; $('#oWipe').onclick = wipeAll;
    try { if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) { const dv = (await navigator.mediaDevices.enumerateDevices()).filter((d) => d.kind === 'audioinput'); const sel = $('#oMic'); dv.forEach((d, i) => { if (!d.deviceId || d.deviceId === 'default') return; const o = document.createElement('option'); o.value = d.deviceId; o.textContent = d.label || 'Microphone ' + (i + 1); sel.appendChild(o); }); sel.value = LS.get('mic', ''); } } catch (e) { /* noop */ }
  }
  async function linkFolder() {
    try { const h = await window.showDirectoryPicker({ mode: 'readwrite', id: 'aurabot-audio' }); st.dir = h; await D.store.put('kv', { key: 'dir', handle: h }); renderOptions(); renderOut(); toast('Linked: ' + h.name); }
    catch (e) { if (e && e.name !== 'AbortError') toast('Could not link that folder'); }
  }
  async function zipAll() {
    busy('Building audio.zip…');
    try {
      const all = (await D.store.all('finals')).sort((a, b) => a.ep - b.ep);
      if (!all.length) { busy(null); toast('Nothing saved yet'); return; }
      const z = await D.zip(all.map((f) => ({ name: 'audio/' + fileName(f.ep), blob: f.blob })));
      downloadBlob(z, 'aurabot-audio.zip'); busy(null); toast('Unzip it into your project so the audio/ folder sits next to index.html');
    } catch (e) { console.error(e); busy(null); toast('Could not build the zip'); }
  }
  async function wipeAll() {
    if (!(await ask('Delete ALL Studio data?', 'Every layer and every saved recording kept in this browser will be erased. Files already in your audio folder or on GitHub are not touched.', 'Delete everything'))) return;
    await leaveEpisode(); await D.store.wipe(); st.layers = []; st.final = null; await refreshStatus(); renderLayers(); renderOut(); renderOptions(); toast('Studio data deleted');
  }

  /* ================================================================ wiring */
  function setTab(t) { st.tab = t; $$('.vs-tabs button').forEach((b) => b.classList.toggle('on', b.dataset.tab === t)); $$('.vs-pane').forEach((p) => p.classList.toggle('on', p.dataset.pane === t)); if (t === 'options') renderOptions(); else setTimeout(() => st.layers.forEach(drawLane), 50); }
  function renderFx() {
    $$('.vs-fx').forEach((b) => { const on = b.dataset.fx === st.fx; b.setAttribute('aria-pressed', on); b.classList.toggle('on', on); });
    $('#vsFxNote').textContent = st.fx !== 'none' ? FX[st.fx].label + ': ' + FX_TEXT[st.fx] + ' Filters are applied after you stop, and you can switch or remove them on any layer later. Your original recording is never changed.' : 'Filters are off. Switch one on to give new recordings a different voice. Each layer can have its own, and can be changed or removed later.';
    $('#vsAmt').value = Math.round(st.amt * 100); $('#vsAmt').disabled = st.fx === 'none';
  }
  function wire() {
    $('#vsClose').onclick = close;
    $$('.vs-tabs button').forEach((b) => { b.onclick = () => setTab(b.dataset.tab); });
    $('#vsSearch').oninput = renderEpList;
    $('#vsEpList').onclick = (e) => { const b = e.target.closest('.vs-ep'); if (b) selectEpisode(+b.dataset.n); };
    $('#vsEpSel').onchange = (e) => selectEpisode(+e.target.value);
    $('#vsPlay').onclick = togglePlay;
    $('#vsRestart').onclick = () => { if (st.T && !st.recording) st.T.seek(0); };
    const sc = $('#vsScrub');
    sc.addEventListener('input', () => { st.scrubbing = true; if (st.T) st.T.seek((sc.value / 1000) * st.T.duration); });
    sc.addEventListener('change', () => { st.scrubbing = false; });
    $('#vsDur').onchange = (e) => { if (st.T && st.T.kind === 'solo' && !st.recording) { const d = clamp(+e.target.value || 60, 20, 120); LS.set('dur' + st.ep, d); const was = st.T.playing; if (was) st.T.pause(); st.T = new SoloT(d); e.target.value = d; renderLayers(); onTime(0); } };
    $('#vsRec').onclick = () => { if (st.recording) stopRec(true); else startRec(); };
    $('#vsCancelTake').onclick = () => stopRec(false);
    $('#vsMicTest').onclick = micTest;
    $$('.vs-fx').forEach((b) => { b.onclick = () => { st.fx = st.fx === b.dataset.fx ? 'none' : b.dataset.fx; LS.set('fx', st.fx); renderFx(); }; });
    $('#vsAmt').oninput = (e) => { st.amt = e.target.value / 100; LS.set('amt', st.amt); };
    $('#vsHearLayers').checked = LS.get('hearLayers', true); $('#vsHearLayers').onchange = (e) => LS.set('hearLayers', e.target.checked);
    $('#vsHearScore').checked = LS.get('hearScore', false); $('#vsHearScore').onchange = (e) => { LS.set('hearScore', e.target.checked); applyScoreGain(); };
    $('#vsCount3').value = String(LS.get('count', 3)); $('#vsCount3').onchange = (e) => LS.set('count', +e.target.value);
    $('#vsImport').onclick = () => $('#vsFile').click();
    $('#vsFile').onchange = async (e) => { const f = e.target.files[0]; e.target.value = ''; if (f) await importBlob(f, f.name.replace(/\.[^.]+$/, '')); };
    $('#vsSave').onclick = saveFinal; $('#vsPlaySaved').onclick = playSaved;
    $('#vsDownload').onclick = () => st.final && downloadBlob(st.final.blob, fileName(st.ep));
    $('#vsLoadSaved').onclick = () => st.final && importBlob(st.final.blob, 'Saved ' + fileName(st.ep));
    $('#vsLoadPub').onclick = async () => { busy('Fetching the website copy…'); try { const r = await fetch('audio/' + fileName(st.ep), { cache: 'no-store' }); if (!r.ok) throw new Error('missing'); const b = await r.blob(); busy(null); await importBlob(b, 'Website ' + fileName(st.ep)); } catch (e) { busy(null); toast('Could not fetch the website copy'); } };
    $('#vsDelFinal').onclick = deleteFinal; $('#vsClear').onclick = clearLayers;
    /* layer row events (delegated) */
    const lay = $('#vsLayers');
    lay.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-a]'); if (b) { layerAction(b.closest('.vs-layer'), b.dataset.a); return; }
      const ln = e.target.closest('.l-lane'); if (ln && st.T && !st.recording) { const r = ln.getBoundingClientRect(); st.T.seek(clamp((e.clientX - r.left) / r.width, 0, 1) * st.T.duration); }
    });
    lay.addEventListener('input', (e) => {
      const row = e.target.closest('.vs-layer'); if (!row) return; const l = st.layers.find((x) => x.id === row.dataset.id); if (!l) return;
      if (e.target.closest('.l-vol')) { l.gain = e.target.value / 100; const n = st.nodes.get(l.id); if (n) n.g.gain.value = layerGain(l); }
    });
    lay.addEventListener('change', async (e) => {
      const row = e.target.closest('.vs-layer'); if (!row) return; const l = st.layers.find((x) => x.id === row.dataset.id); if (!l) return;
      if (e.target.classList.contains('l-name')) { l.name = e.target.value.trim() || 'Layer'; saveLayer(l); }
      else if (e.target.classList.contains('l-filter')) {
        l.filter = e.target.value; row.style.setProperty('--lc', l.filter === 'none' ? COLORS[st.layers.indexOf(l) % COLORS.length] : FX[l.filter].color); $('.l-amt', row).hidden = l.filter === 'none';
        await saveLayer(l); try { await getProc(l); } catch (err) { console.error(err); } drawLane(l); restartLayers();
      } else if (e.target.closest('.l-amt')) { l.amt = e.target.value / 100; await saveLayer(l); try { await getProc(l); } catch (err) { console.error(err); } restartLayers(); }
      else if (e.target.closest('.l-vol')) saveLayer(l);
    });
    window.addEventListener('resize', () => { if (st.open) { clearTimeout(st._rz); st._rz = setTimeout(() => st.layers.forEach(drawLane), 150); } });
    window.addEventListener('keydown', (e) => {
      if (!st.open) return; const tg = e.target && e.target.tagName;
      if (e.key === 'Escape') { if ($('#vsModal').classList.contains('on')) { $('#vsMNo').click(); return; } if (st.recording) { stopRec(false); return; } close(); return; }
      if (/INPUT|SELECT|TEXTAREA|BUTTON/.test(tg) || e.metaKey || e.ctrlKey || st.tab !== 'studio') return;
      if (e.key === ' ') { e.preventDefault(); if (!st.recording) togglePlay(); } else if (e.key === 'r' || e.key === 'R') { e.preventDefault(); if (st.recording) stopRec(true); else startRec(); }
    });
  }

  /* ================================================================ open / close */
  async function open(ep) {
    build();
    if (!Aura.Player) return;
    $('#vsRoot').classList.add('on'); $('#vsRoot').setAttribute('aria-hidden', 'false'); document.body.classList.add('locked'); st.open = true;
    if (!st.dirLoaded) { st.dirLoaded = true; try { const r = await D.store.get('kv', 'dir'); if (r && r.handle) st.dir = r.handle; } catch (e) { /* noop */ } }
    renderFx(); setTab('studio'); await refreshStatus();
    const last = +ep || LS.get('ep', 0) || +localStorage.getItem('aura.last') || 1;
    await selectEpisode(clamp(last, 1, S.episodes.length));
  }
  async function close() {
    if (!st.open) return;
    if (st.recording) await stopRec(false);
    await stopMicTest(); if (savedAudio) { savedAudio.pause(); savedAudio = null; $('#vsPlaySaved').textContent = 'Play saved'; }
    if (st.T) { try { if (st.T.playing) st.T.pause(); } catch (e) { /* noop */ } }
    stopLayers(); st.token++;
    const P = Aura.Player; P.studio = false;
    if (P.engine) { P.engine.voHook = null; P.engine.stop(); P.engine.setMuted(P.engine.muted); }
    const wrap = P.playerEl.querySelector('.stage-wrap'); if (wrap && P.stageEl.parentNode !== wrap) wrap.appendChild(P.stageEl);
    st.T = null; st.open = false; $('#vsRoot').classList.remove('on'); $('#vsRoot').setAttribute('aria-hidden', 'true'); document.body.classList.remove('locked');
  }

  /* ================================================================ normal player: use saved recordings */
  async function hookPlayback(engine, n) {
    engine.voHook = null;
    if (!LS.get('useLocal', true)) return;
    let fin; try { fin = await D.store.get('finals', n); } catch (e) { return; }
    if (!fin || !fin.blob) return;
    const ctx = engine._ensureAudio(); if (!ctx) return;
    let buf; try { buf = await ctx.decodeAudioData(await fin.blob.arrayBuffer()); } catch (e) { return; }
    let src = null;
    engine.voHook = {
      start(c, dest, t, when) { this.stop(); if (t >= buf.duration) return true; src = c.createBufferSource(); src.buffer = buf; src.connect(dest || c.destination); src.start(when, t); return true; },
      stop() { if (src) { try { src.stop(); } catch (e) { /* noop */ } try { src.disconnect(); } catch (e) { /* noop */ } src = null; } },
    };
  }

  Aura.Studio = { open, close, hookPlayback, fileName };
})();
