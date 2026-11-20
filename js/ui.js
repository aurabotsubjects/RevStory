/* ============================================================================
 *  AURABOT PROJECT · REVELATION · landing page + menu + player controller
 * ========================================================================== */
(function () {
  'use strict';
  const Aura = window.Aura, S = Aura.SERIES;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const isTouch = window.matchMedia('(pointer:coarse)').matches;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------- load data files */
  function loadScript(src) { return new Promise((res) => { const s = document.createElement('script'); s.src = src; s.onload = () => res(true); s.onerror = () => res(false); document.head.appendChild(s); }); }
  const dataReady = Promise.all((Aura.BUILT_FILES || []).map((f) => loadScript('js/episodes/' + f)));

  /* --------------------------------------------------------- split text */
  function splitInto(el, text, extra) { el.innerHTML = ''; text.split('').forEach((c, i) => { const s = document.createElement('span'); s.textContent = c === ' ' ? '\u00a0' : c; s.style.setProperty('--i', i); if (extra) s.style.setProperty('--d', extra); el.appendChild(s); }); }

  /* ------------------------------------------------------------- hero */
  splitInto($('#h1'), 'REVELATION');
  function fitH1() { const h = $('#h1'); h.style.fontSize = '100px'; h.style.display = 'inline-flex'; const w = h.scrollWidth; h.style.display = ''; const max = window.innerWidth * (window.innerWidth < 700 ? 0.94 : 0.88); h.style.fontSize = Math.min(max / w * 100, 300, window.innerHeight * 0.34) + 'px'; }
  fitH1(); window.addEventListener('resize', fitH1); if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitH1);
  window.addEventListener('scroll', () => $('.top').classList.toggle('scrolled', window.scrollY > 60), { passive: true });
  $('#epCount').textContent = S.episodes.length;
  $('#marq').innerHTML = (function () { const w = ['Seven Churches', 'Seven Seals', 'Seven Trumpets', 'Seven Bowls', 'The Lamb', 'The Throne', 'New Jerusalem', 'Alpha & Omega']; let h = ''; for (let k = 0; k < 4; k++) w.forEach((x) => { h += '<span>' + x + '</span>'; }); return h; })();

  function fitCanvas(c) { const dpr = Math.min(window.devicePixelRatio || 1, 2); const w = c.clientWidth, h = c.clientHeight; if (c.width !== (w * dpr | 0) || c.height !== (h * dpr | 0)) { c.width = w * dpr | 0; c.height = h * dpr | 0; } return { w: c.width, h: c.height, dpr }; }

  /* animated aura field used by hero + menu */
  function auraField(canvas, o) {
    const ctx = canvas.getContext('2d'); let raf = 0, run = false, mx = 0.5, my = 0.5, tx = 0.5, ty = 0.5;
    const embers = Array.from({ length: o.embers || 70 }, () => ({ x: Math.random(), y: Math.random(), z: 0.3 + Math.random() * 0.9, p: Math.random() * 6.28 }));
    const specks = Array.from({ length: o.stars || 140 }, () => ({ x: Math.random(), y: Math.random(), r: Math.random() * 1.3 + 0.2, p: Math.random() * 6.28 }));
    window.addEventListener('pointermove', (e) => { tx = e.clientX / window.innerWidth; ty = e.clientY / window.innerHeight; }, { passive: true });
    function frame(ms) {
      raf = requestAnimationFrame(frame); if (!run) return;
      const { w, h } = fitCanvas(canvas), t = ms / 1000; mx += (tx - mx) * 0.05; my += (ty - my) * 0.05;
      ctx.clearRect(0, 0, w, h);
      specks.forEach((s) => { const a = 0.25 + 0.5 * (0.5 + 0.5 * Math.sin(t * 1.2 + s.p)); ctx.fillStyle = 'rgba(255,240,220,' + a * 0.8 + ')'; ctx.beginPath(); ctx.arc(s.x * w + (mx - 0.5) * -20 * s.r, s.y * h + (my - 0.5) * -14 * s.r, s.r * (w / 1400 + 0.6), 0, 6.28); ctx.fill(); });
      const cx = w * (0.5 + (mx - 0.5) * 0.06), cy = h * (o.cy || 0.55) + (my - 0.5) * h * 0.04, R = Math.min(w, h) * (o.r || 0.5);
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 1.5); g.addColorStop(0, 'rgba(255,170,70,' + (o.glow || 0.34) + ')'); g.addColorStop(0.4, 'rgba(180,70,30,0.12)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      ctx.lineCap = 'round';
      for (let i = 0; i < 7; i++) { const r = R * (0.32 + i * 0.17) * (1 + 0.012 * Math.sin(t * 1.1 + i)); ctx.lineWidth = (1.2 + (i % 3)) * (w / 1400 + 0.5); ctx.strokeStyle = 'rgba(255,' + (190 - i * 12) + ',' + (110 - i * 8) + ',' + (0.55 - i * 0.055) + ')'; const dir = i % 2 ? -1 : 1, a0 = t * 0.22 * dir + i, len = 1.2 + 0.7 * Math.sin(t * 0.4 + i * 2); ctx.beginPath(); ctx.arc(cx, cy, r, a0, a0 + len * 2.1); ctx.stroke(); ctx.beginPath(); ctx.arc(cx, cy, r, a0 + 3.4, a0 + 3.4 + len * 0.9); ctx.stroke(); }
      ctx.save(); ctx.translate(cx, cy); ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 18; i++) { ctx.rotate(Math.PI / 9); const gg = ctx.createLinearGradient(0, 0, R * 1.9, 0); gg.addColorStop(0, 'rgba(255,190,100,0.0)'); gg.addColorStop(0.3, 'rgba(255,170,80,' + (0.025 + 0.02 * Math.sin(t * 0.6 + i)) + ')'); gg.addColorStop(1, 'rgba(255,170,80,0)'); ctx.fillStyle = gg; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(R * 1.9, -R * 0.03); ctx.lineTo(R * 1.9, R * 0.03); ctx.closePath(); ctx.fill(); }
      ctx.restore();
      ctx.globalCompositeOperation = 'lighter';
      embers.forEach((e) => { e.y -= 0.00045 * e.z * (60 / 60); if (e.y < -0.05) { e.y = 1.05; e.x = Math.random(); } const x = (e.x + Math.sin(t * 0.5 + e.p) * 0.02 + (mx - 0.5) * 0.03 * e.z) * w, y = e.y * h, a = 0.35 + 0.5 * Math.sin(t * 2 + e.p); ctx.fillStyle = 'rgba(255,' + (150 + e.z * 60 | 0) + ',70,' + Math.max(0, a) * 0.8 + ')'; ctx.beginPath(); ctx.arc(x, y, e.z * 2.2 * (w / 1400 + 0.5), 0, 6.28); ctx.fill(); });
      ctx.globalCompositeOperation = 'source-over';
    }
    raf = requestAnimationFrame(frame);
    return { start() { run = true; }, stop() { run = false; } };
  }
  const heroField = auraField($('#heroCanvas'), { embers: 80, stars: 170 }); heroField.start();
  const menuField = auraField($('#menuCanvas'), { embers: 90, stars: 80, cy: 0.5, r: 0.55, glow: 0.22 });
  if (reduce) { heroField.stop(); }
  new IntersectionObserver((en) => { en.forEach((e) => (e.isIntersecting && !reduce ? heroField.start() : heroField.stop())); }).observe($('#top'));

  /* parallax tilt of hero text + cursor glow */
  const glow = $('#cursorGlow'), heroInner = $('#heroInner');
  window.addEventListener('pointermove', (e) => {
    glow.style.transform = 'translate(' + e.clientX + 'px,' + e.clientY + 'px)';
    const px = e.clientX / window.innerWidth - 0.5, py = e.clientY / window.innerHeight - 0.5;
    heroInner.style.transform = 'perspective(1200px) rotateY(' + px * 5 + 'deg) rotateX(' + -py * 4 + 'deg) translate3d(' + px * -14 + 'px,' + py * -10 + 'px,0)';
  }, { passive: true });

  /* magnetic buttons */
  $$('[data-magnet]').forEach((el) => {
    el.addEventListener('pointermove', (e) => { if (isTouch) return; const r = el.getBoundingClientRect(); el.style.transform = 'translate(' + (e.clientX - r.left - r.width / 2) * 0.22 + 'px,' + (e.clientY - r.top - r.height / 2) * 0.35 + 'px)'; });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });

  /* reveal + counters */
  const io = new IntersectionObserver((en) => en.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.15 });
  $$('.reveal').forEach((el) => io.observe(el));
  const cio = new IntersectionObserver((en) => en.forEach((e) => {
    if (!e.isIntersecting) return; cio.unobserve(e.target);
    const el = e.target, to = +el.dataset.count, t0 = performance.now();
    (function tick(n) { const k = Math.min(1, (n - t0) / 1600), v = 1 - Math.pow(1 - k, 4); el.textContent = Math.round(to * v); if (k < 1) requestAnimationFrame(tick); })(t0);
  }), { threshold: 0.4 });
  $$('[data-count]').forEach((el) => cio.observe(el));

  /* --------------------------------------------------------- menu */
  const menuNav = $('#menuNav');
  const menuItems = [['01', 'Watch', () => watchNow()], ['02', 'Episodes', () => goto('#episodes')], ['03', 'The Series', () => goto('#about')], ['04', 'Aurabot', () => goto('#studio')], ['05', 'Settings', () => (Aura.Studio ? Aura.Studio.open() : Player.toast('Settings are still loading'))], ['06', 'Devotional', () => { location.href = 'devotional/index.html'; }]];
  menuItems.forEach(([n, label, fn], k) => {
    const a = document.createElement('a'); a.className = 'menu-item'; a.href = '#';
    a.innerHTML = '<span class="no">' + n + '</span><span class="word"></span>';
    splitInto(a.querySelector('.word'), label, k * 90 + 250 + 'ms');
    a.addEventListener('click', (e) => { e.preventDefault(); toggleMenu(false); setTimeout(fn, 350); });
    menuNav.appendChild(a);
  });
  function toggleMenu(open) {
    const o = open === undefined ? !document.body.classList.contains('menu-open') : open;
    document.body.classList.toggle('menu-open', o); $('#menuBtn').setAttribute('aria-expanded', o); $('#menu').setAttribute('aria-hidden', !o);
    if (o) menuField.start(); else setTimeout(() => !document.body.classList.contains('menu-open') && menuField.stop(), 900);
    $('#menuBtn span:first-child').textContent = o ? 'Close' : 'Menu';
  }
  menuField.stop();
  $('#menuBtn').addEventListener('click', () => toggleMenu());
  function goto(sel) { const el = $(sel); if (el) el.scrollIntoView({ behavior: 'smooth' }); }
  $('#brandLink').addEventListener('click', (e) => { e.preventDefault(); toggleMenu(false); window.scrollTo({ top: 0, behavior: 'smooth' }); });

  /* ------------------------------------------------- episode browser */
  const partsEl = $('#parts'), navEl = $('#partnav');
  S.parts.forEach((p, pi) => {
    const a = document.createElement('a'); a.href = '#part-' + pi; a.style.setProperty('--c', p.color); a.textContent = 'Part ' + p.num; navEl.appendChild(a);
    const eps = S.episodes.filter((e) => e.part === pi);
    const sec = document.createElement('div'); sec.className = 'part reveal'; sec.id = 'part-' + pi; sec.style.setProperty('--c', p.color);
    sec.innerHTML = '<div class="part-head"><div class="part-num">' + p.num + '</div><div><div class="part-name">' + p.name.replace('&', '&amp;') + '</div><div class="part-meta">Episodes ' + eps[0].n + '–' + eps[eps.length - 1].n + ' · ' + eps[0].verses.split(':')[0] + (eps[0].verses.split(':')[0] === eps[eps.length - 1].verses.split(':')[0] ? '' : '–' + eps[eps.length - 1].verses.split(':')[0]) + '</div></div></div><div class="grid"></div>';
    const grid = sec.querySelector('.grid');
    eps.forEach((e) => {
      const c = document.createElement('button'); c.className = 'card soon'; c.dataset.n = e.n; c.style.setProperty('--c', p.color);
      c.innerHTML = '<span class="state">Coming soon</span><div><div class="n">' + String(e.n).padStart(2, '0') + '</div><h3>' + e.title.replace(/&/g, '&amp;') + '</h3></div><div class="v">Rev ' + e.verses.replace('-', '–') + '</div>';
      grid.appendChild(c);
    });
    partsEl.appendChild(sec); io.observe(sec);
  });
  function markReady() {
    $$('.card').forEach((c) => { const ok = !!Aura.episodes[c.dataset.n]; c.classList.toggle('ready', ok); c.classList.toggle('soon', !ok); c.querySelector('.state').textContent = ok ? 'Play' : 'Coming soon'; });
    const last = +localStorage.getItem('aura.last') || 0;
    if (last && Aura.episodes[last]) $('#heroWatchLabel').textContent = 'Continue Episode ' + last;
  }
  /* 3D tilt + following light */
  partsEl.addEventListener('pointermove', (e) => {
    const c = e.target.closest('.card'); if (!c || isTouch) return; const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    c.style.setProperty('--mx', x * 100 + '%'); c.style.setProperty('--my', y * 100 + '%');
    if (c.classList.contains('ready')) c.style.transform = 'rotateX(' + (0.5 - y) * 9 + 'deg) rotateY(' + (x - 0.5) * 11 + 'deg) translateZ(8px)';
  });
  partsEl.addEventListener('pointerout', (e) => { const c = e.target.closest('.card'); if (c) c.style.transform = ''; });
  partsEl.addEventListener('click', (e) => { const c = e.target.closest('.card'); if (!c) return; const n = +c.dataset.n; if (Aura.episodes[n]) Player.open(n); else Player.toast('Episode ' + n + ' is coming soon'); });

  function watchNow() { const last = +localStorage.getItem('aura.last') || 1; Player.open(Aura.episodes[last] ? last : 1); }
  $('#heroWatch').addEventListener('click', (e) => { e.preventDefault(); watchNow(); });
  $('#topWatch').addEventListener('click', (e) => { e.preventDefault(); watchNow(); });

  /* ============================================================ PLAYER */
  const playerEl = $('#player'), stageEl = $('#stage');
  const Player = {
    engine: null, n: 0, idleT: 0, qMode: 0, countdown: 0,
    autoNext: (() => { try { return localStorage.getItem('aura.autonext') !== '0'; } catch (e) { return true; } })(),
    toast(msg) { const t = $('#toast'); if (!playerEl.classList.contains('open')) { const g = document.createElement('div'); g.className = 'toast show'; g.style.position = 'fixed'; g.style.zIndex = 200; g.textContent = msg; document.body.appendChild(g); setTimeout(() => g.remove(), 2200); return; } t.textContent = msg; t.classList.add('show'); clearTimeout(this._tt); this._tt = setTimeout(() => t.classList.remove('show'), 2400); },
    /* one engine at a time: WebGL (3D episodes) or the 2D pixel engine; switch when the style changes */
    ensureEngine(def) {
      const wantPx = !!(def && def.pixel);
      if (this.engine && !!this.engine.isPixel !== wantPx) { try { this.engine.destroy(); } catch (e) { console.warn(e); } this.engine = null; }
      if (!this.engine) {
        this.engine = wantPx ? new Aura.PixelEngine(stageEl) : new Aura.Engine(stageEl); this.wire(this.engine);
        if (!wantPx && (isTouch || Math.min(screen.width, screen.height) < 700 || /iPad|iPhone/.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && /Mac/.test(navigator.platform)))) this.engine.setQuality('medium', true);
        if (wantPx) $('#bQual').style.display = 'none'; else $('#bQual').style.display = '';
      }
      return this.engine;
    },
    async open(n, auto) {
      const def = Aura.episodes[n], meta = S.episodes[n - 1];
      if (!auto) this.pl = null;
      /* back-to-back auto-play: skip the episode title card, except when a new Part begins */
      Aura.suppressTitle = !!(auto && meta && S.episodes[n - 2] && meta.part === S.episodes[n - 2].part);
      if (!def) { this.toast('Episode ' + n + ' is coming soon'); return; }
      clearInterval(this.countdown);
      this.n = n; localStorage.setItem('aura.last', n);
      document.body.classList.add('locked'); playerEl.classList.add('open', 'loading'); playerEl.classList.remove('ended'); toggleMenu(false);
      if (!def.pixel && !Aura.Engine.supported()) { $('#nogl').classList.add('show'); playerEl.classList.remove('loading'); return; }
      $('#pKicker').textContent = 'Episode ' + n + ' · ' + S.parts[meta.part].name; $('#pTitle').textContent = meta.title;
      history.replaceState(null, '', '#ep' + n);
      await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 40)));
      try {
        this.ensureEngine(def);
        await this.engine.load(def, Object.assign({ n }, meta));
        if (Aura.Studio) await Aura.Studio.hookPlayback(this.engine, n);
      } catch (err) { console.error(err); playerEl.classList.remove('loading'); this.toast('Sorry, this episode failed to load.'); return; }
      playerEl.classList.remove('loading');
      this.sync(); this.engine.play(); this.bumpUI();
      const nx = S.episodes[n]; $('#bNext').style.opacity = nx && Aura.episodes[n + 1] ? 1 : 0.35; $('#bPrev').style.opacity = n > 1 ? 1 : 0.35;
    },
    /* used by the Voice Studio: create the engine and load an episode WITHOUT showing or starting the player */
    async loadOnly(n) {
      const def = Aura.episodes[n], meta = S.episodes[n - 1];
      if (!auto) this.pl = null;
      if (!def || (!def.pixel && !Aura.Engine.supported())) return null;
      this.ensureEngine(def);
      this.n = n;
      await this.engine.load(def, Object.assign({ n }, meta));
      return this.engine;
    },
    stageEl, playerEl,
    close() {
      { const mp = document.getElementById('mixPanel'), mb = document.getElementById('bMix'); if (mp) mp.hidden = true; if (mb) { mb.classList.remove('on'); mb.setAttribute('aria-expanded', 'false'); } }
      clearInterval(this.countdown);
      if (this.engine) this.engine.stop();
      playerEl.classList.remove('open', 'ended'); document.body.classList.remove('locked');
      if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen(); else if (document.webkitFullscreenElement && document.webkitExitFullscreen) document.webkitExitFullscreen();
      history.replaceState(null, '', location.pathname); markReady();
    },
    wire(en) {
      en.on('time', (t) => this.updTime(t));
      en.on('state', (s) => { playerEl.classList.toggle('paused', s !== 'playing'); playerEl.classList.toggle('ended', s === 'ended'); this.updPlayIcon(); if (s === 'ended' && !this.studio) this.showEnd(); if (s === 'playing') { playerEl.classList.remove('ended'); clearInterval(this.countdown); } });
      en.on('toast', (m) => this.toast(m));
      en.on('loaded', () => this.updTime(0));
    },
    setAutoNext(on) { this.autoNext = !!on; try { localStorage.setItem('aura.autonext', on ? '1' : '0'); } catch (e) { /* noop */ } this.syncAuto(); },
    syncAuto() { const on = this.autoNext; $('#bAuto').classList.toggle('on', on); $('#bAuto').setAttribute('aria-pressed', on ? 'true' : 'false'); $('#ecAuto').textContent = 'Auto-play next: ' + (on ? 'On' : 'Off'); $('#ecAuto').setAttribute('aria-pressed', on ? 'true' : 'false'); },
    sync() { $('#bCC').classList.toggle('off', !this.engine.subtitlesOn); $('#bMute').classList.toggle('off', this.engine.muted); this.updPlayIcon(); },
    updTime(t) { const d = this.engine.duration, p = t / d * 100; $('#sFill').style.width = p + '%'; $('#sKnob').style.left = p + '%'; $('#pTime').textContent = Aura.fmtTime(t) + ' / ' + Aura.fmtTime(d); },
    updPlayIcon() { $('#icPlay').innerHTML = this.engine && this.engine.playing ? '<path d="M6 5h4v14H6zM14 5h4v14h-4z"/>' : '<path d="M8 5v14l11-7z"/>'; },
    showEnd() {
      const n = this.n, nx = Aura.episodes[n + 1];
      $('#ecKicker').textContent = 'Episode ' + n + ' complete'; $('#ecTitle').textContent = nx ? 'Up next: ' + S.episodes[n].title : (n >= S.episodes.length ? 'The end. Amen.' : 'More episodes are on the way');
      $('#ecNext').style.display = nx ? '' : 'none';
      clearInterval(this.countdown);
      $('#ecNextLabel').textContent = 'Next episode';
      /* auto-play next on: no end card, the next clip simply starts; off: the end card waits for the viewer */
      /* a devotional reading plays only its own chosen episodes, then stops */
      if (this.pl) {
        if (this.pl.length) { const nn = this.pl.shift(); playerEl.classList.remove('ended'); this.open(nn, true); return; }
        this.pl = null; $('#ecKicker').textContent = 'Reading complete'; $('#ecTitle').textContent = 'You have watched the animation for this reading'; return;
      }
      if (nx && this.autoNext) { playerEl.classList.remove('ended'); this.open(n + 1, true); }
    },
    bumpUI() { playerEl.classList.remove('idle'); clearTimeout(this.idleT); this.idleT = setTimeout(() => { const mp = document.getElementById('mixPanel'); if (this.engine && this.engine.playing && !(mp && !mp.hidden)) playerEl.classList.add('idle'); }, 2800); },
    toggle() { if (!this.engine || !this.engine.loaded) return; if (playerEl.classList.contains('ended')) { this.engine.seek(0); this.engine.play(); } else this.engine.toggle(); },
    cycleQuality() {
      const modes = ['auto', 'high', 'medium', 'low']; this.qMode = (this.qMode + 1) % 4; const m = modes[this.qMode];
      $('#bQual').textContent = m === 'auto' ? 'Auto' : m === 'high' ? 'High' : m === 'medium' ? 'Med' : 'Low';
      if (m === 'auto') { this.engine.autoQuality = true; } else this.engine.setQuality(m);
      this.toast('Quality: ' + $('#bQual').textContent);
    },
    fullscreen() { const el = playerEl; if (document.fullscreenElement || document.webkitFullscreenElement) { (document.exitFullscreen || document.webkitExitFullscreen).call(document); } else { const f = el.requestFullscreen || el.webkitRequestFullscreen; if (f) f.call(el).catch(() => {}); } },
  };
  if (!(document.fullscreenEnabled || document.webkitFullscreenEnabled)) $('#bFull').style.display = 'none';

  /* controls */
  $('#bPlay').addEventListener('click', () => Player.toggle());
  $('#bigPlay').addEventListener('click', () => Player.toggle());
  stageEl.addEventListener('click', () => { if (isTouch && playerEl.classList.contains('idle')) { Player.bumpUI(); return; } Player.toggle(); Player.bumpUI(); });
  $('#bAuto').addEventListener('click', () => { Player.setAutoNext(!Player.autoNext); Player.toast('Auto-play next: ' + (Player.autoNext ? 'On' : 'Off')); Player.bumpUI(); });
  $('#ecAuto').addEventListener('click', () => { Player.setAutoNext(!Player.autoNext); });
  Player.syncAuto();
  $('#bCC').addEventListener('click', () => { const e = Player.engine; e.setSubtitles(!e.subtitlesOn); Player.sync(); });
  $('#bMute').addEventListener('click', () => { const e = Player.engine; e.setMuted(!e.muted); Player.sync(); });
  /* sound mix panel: music & effects, and voice-over, each on its own slider */
  const mixPanel = $('#mixPanel'), mixBtn = $('#bMix'), mixM = $('#mixMusic'), mixV = $('#mixVoice');
  function mixShow() { const e = Player.engine; if (!e) return; mixM.value = Math.round(e.mix.music * 100); mixV.value = Math.round(e.mix.voice * 100); $('#mixMusicV').textContent = mixM.value; $('#mixVoiceV').textContent = mixV.value; }
  function mixOpen(on) { mixPanel.hidden = !on; mixBtn.classList.toggle('on', on); mixBtn.setAttribute('aria-expanded', on ? 'true' : 'false'); if (on) { mixShow(); clearTimeout(Player.idleT); } else Player.bumpUI(); }
  mixBtn.addEventListener('click', (ev) => { ev.stopPropagation(); mixOpen(mixPanel.hidden); });
  mixPanel.addEventListener('click', (ev) => ev.stopPropagation());
  mixPanel.addEventListener('keydown', (ev) => { ev.stopPropagation(); if (ev.key === 'Escape') { mixOpen(false); mixBtn.focus(); } });
  mixM.addEventListener('input', () => { Player.engine.setMix('music', mixM.value / 100); $('#mixMusicV').textContent = mixM.value; });
  mixV.addEventListener('input', () => { Player.engine.setMix('voice', mixV.value / 100); $('#mixVoiceV').textContent = mixV.value; });
  $('#mixReset').addEventListener('click', () => { Player.engine.setMix('music', 1); Player.engine.setMix('voice', 1); mixShow(); });
  document.addEventListener('click', (ev) => { if (!mixPanel.hidden && !ev.target.closest('.mixwrap')) mixOpen(false); });
  ['pointerdown', 'touchstart'].forEach((ev) => stageEl.addEventListener(ev, () => { if (!mixPanel.hidden) mixOpen(false); }, { passive: true }));
  $('#bQual').addEventListener('click', () => Player.cycleQuality());
  $('#bFull').addEventListener('click', () => Player.fullscreen());
  $('#pBack').addEventListener('click', () => Player.close());
  $('#noglClose').addEventListener('click', () => { $('#nogl').classList.remove('show'); Player.close(); });
  $('#bNext').addEventListener('click', () => { if (Aura.episodes[Player.n + 1]) Player.open(Player.n + 1); else Player.toast('The next episode is coming soon'); });
  $('#bPrev').addEventListener('click', () => { const e = Player.engine; if (e && e.time > 3) { e.seek(0); } else if (Player.n > 1 && Aura.episodes[Player.n - 1]) Player.open(Player.n - 1); else e.seek(0); });
  $('#ecNext').addEventListener('click', () => Player.open(Player.n + 1));
  $('#ecReplay').addEventListener('click', () => { clearInterval(Player.countdown); playerEl.classList.remove('ended'); Player.engine.seek(0); Player.engine.play(); });
  $('#ecBack').addEventListener('click', () => Player.close());
  ['pointermove', 'pointerdown', 'touchstart'].forEach((ev) => playerEl.addEventListener(ev, () => Player.bumpUI(), { passive: true }));

  /* scrubbing */
  const scrub = $('#scrub'), rail = $('.rail', scrub);
  let drag = false, wasPlaying = false;
  const tAt = (e) => { const r = rail.getBoundingClientRect(); return Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * Player.engine.duration; };
  scrub.addEventListener('pointerdown', (e) => { if (!Player.engine || !Player.engine.loaded) return; drag = true; wasPlaying = Player.engine.playing; if (wasPlaying) Player.engine.pause(); scrub.classList.add('drag'); scrub.setPointerCapture(e.pointerId); Player.engine.seek(tAt(e)); });
  scrub.addEventListener('pointermove', (e) => { if (!Player.engine || !Player.engine.loaded) return; const r = rail.getBoundingClientRect(), x = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)); $('#sTip').style.left = x * 100 + '%'; $('#sTip').textContent = Aura.fmtTime(x * Player.engine.duration); if (drag) Player.engine.seek(tAt(e)); });
  const endDrag = () => { if (!drag) return; drag = false; scrub.classList.remove('drag'); if (wasPlaying) Player.engine.play(); };
  scrub.addEventListener('pointerup', endDrag); scrub.addEventListener('pointercancel', endDrag);

  /* keyboard */
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.body.classList.contains('menu-open')) { toggleMenu(false); return; }
    if (!playerEl.classList.contains('open') || !Player.engine) return;
    const en = Player.engine;
    switch (e.key) {
      case ' ': case 'k': e.preventDefault(); Player.toggle(); break;
      case 'ArrowRight': en.seek(en.time + 5); break; case 'ArrowLeft': en.seek(en.time - 5); break;
      case 'c': case 'C': en.setSubtitles(!en.subtitlesOn); Player.sync(); break;
      case 'm': case 'M': en.setMuted(!en.muted); Player.sync(); break;
      case 'f': case 'F': Player.fullscreen(); break;
      case 'a': case 'A': $('#bAuto').click(); break; case 'n': case 'N': $('#bNext').click(); break; case 'p': case 'P': $('#bPrev').click(); break;
      case 'Escape': if (!document.fullscreenElement) Player.close(); break;
      default: return;
    }
    Player.bumpUI();
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden && Player.engine && Player.engine.playing) Player.engine.pause(); });

  /* expose + boot */
  Aura.Player = Player;
  dataReady.then(() => {
    markReady();
    /* deep link from the devotional: ?watch=45,46,47 plays those episodes back to back (one tap needed so audio can start) */
    try {
      const wq = new URLSearchParams(location.search).get('watch');
      const list = wq ? wq.split(',').map(Number).filter((x) => x > 0 && Aura.episodes[x]) : [];
      if (list.length) {
        const ov = document.createElement('div'); ov.style.cssText = 'position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;background:rgba(5,6,12,.88);backdrop-filter:blur(8px)';
        ov.innerHTML = '<div style="text-align:center;font-family:inherit;color:#fff"><div style="letter-spacing:.3em;font-size:12px;text-transform:uppercase;opacity:.7;margin-bottom:14px">From the devotional</div><div style="font-size:26px;margin-bottom:22px">' + (list.length > 1 ? 'Episodes ' + list[0] + '\u2013' + list[list.length - 1] : 'Episode ' + list[0]) + '</div><button class="btn primary" id="wqGo"><i class="tri"></i><span>Play the reading</span></button><div><a href="#" id="wqNo" style="display:inline-block;margin-top:18px;opacity:.7;font-size:14px;color:#fff">Not now</a></div></div>';
        document.body.appendChild(ov);
        ov.querySelector('#wqGo').addEventListener('click', () => { ov.remove(); Player.open(list[0]); Player.pl = list.slice(1); });
        ov.querySelector('#wqNo').addEventListener('click', (e) => { e.preventDefault(); ov.remove(); });
      }
    } catch (e) { /* noop */ }
    const m = /^#ep(\d+)$/.exec(location.hash);
    if (m && Aura.episodes[+m[1]]) { /* deep link: wait for a tap so audio can start */ Player.toast('Tap "Watch now" to begin Episode ' + m[1]); }
  });
})();
