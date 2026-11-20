/* ============================================================================
 *  AURABOT PROJECT  ·  REVELATION  ·  SERIES ENGINE
 *  Renderer + post-FX chain, camera rig, seekable timeline, procedural score,
 *  titles & subtitles. Every frame is a pure function of episode time `t`.
 * ========================================================================== */
(function () {
  'use strict';
  const Aura = (window.Aura = window.Aura || {});
  const THREE = window.THREE;
  Aura.episodes = Aura.episodes || {};
  /* Episodes can exist in two styles: the original 3D (WebGL) cut and the 2D pixel-art cut (def.pixel = true).
   * The pixel cut wins by default, whatever order the data files finish loading in. Add ?style=3d to the URL
   * to watch the original 3D version of any episode that has one. */
  Aura.legacy3d = Aura.legacy3d || {}; Aura.pixelEps = Aura.pixelEps || {};
  Aura.define = function (n, def) {
    const want3d = /[?&]style=3d/.test(location.search);
    if (def.pixel) { Aura.pixelEps[n] = def; if (want3d) return; }
    else { Aura.legacy3d[n] = def; if (Aura.episodes[n] && Aura.episodes[n].pixel) return; }
    Aura.episodes[n] = def;
  };

  /* ---------------------------------------------------------------- math */
  const clamp = (x, a, b) => Math.min(b === undefined ? 1 : b, Math.max(a === undefined ? 0 : a, x));
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
  const ease = {
    lin: (t) => t,
    in2: (t) => t * t, out2: (t) => 1 - (1 - t) * (1 - t),
    io2: (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
    in3: (t) => t * t * t, out3: (t) => 1 - Math.pow(1 - t, 3),
    io3: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
    sine: (t) => -(Math.cos(Math.PI * t) - 1) / 2,
  };
  Aura.math = { clamp, lerp, smooth, ease };
  Aura.fmtTime = (s) => { s = Math.max(0, Math.floor(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };

  /* ------------------------------------------------------------ keyframes
   * Aura.curve([[t, a, b, c], ...], {ease:'io2'})  -> f(t) returns array [a,b,c]
   * Default: smooth cubic Hermite (Catmull-Rom style). With opts.ease: eased lerp per segment.
   * Outside the key range the first/last value is held.
   * ---------------------------------------------------------------------- */
  Aura.curve = function (keys, opts) {
    opts = opts || {};
    const n = keys.length, w = keys[0].length - 1;
    const T = keys.map((k) => k[0]);
    const V = keys.map((k) => k.slice(1));
    const out = new Array(w).fill(0);
    const ef = opts.ease ? ease[opts.ease] || ease.io2 : null;
    const tang = [];
    for (let i = 0; i < n; i++) {
      const tt = [];
      for (let c = 0; c < w; c++) {
        let m = 0;
        if (n > 1) {
          if (i === 0) m = opts.zeroEnds ? 0 : (V[1][c] - V[0][c]) / (T[1] - T[0]);
          else if (i === n - 1) m = opts.zeroEnds ? 0 : (V[i][c] - V[i - 1][c]) / (T[i] - T[i - 1]);
          else m = (V[i + 1][c] - V[i - 1][c]) / (T[i + 1] - T[i - 1]);
        }
        tt.push(m * (opts.tension === undefined ? 1 : opts.tension));
      }
      tang.push(tt);
    }
    const f = function (t) {
      if (t <= T[0] || n === 1) { for (let c = 0; c < w; c++) out[c] = V[0][c]; return out; }
      if (t >= T[n - 1]) { for (let c = 0; c < w; c++) out[c] = V[n - 1][c]; return out; }
      let i = 0;
      while (i < n - 2 && t > T[i + 1]) i++;
      const dt = T[i + 1] - T[i];
      const u = (t - T[i]) / dt;
      if (ef) {
        const e = ef(u);
        for (let c = 0; c < w; c++) out[c] = V[i][c] + (V[i + 1][c] - V[i][c]) * e;
        return out;
      }
      const u2 = u * u, u3 = u2 * u;
      const h00 = 2 * u3 - 3 * u2 + 1, h10 = u3 - 2 * u2 + u, h01 = -2 * u3 + 3 * u2, h11 = u3 - u2;
      for (let c = 0; c < w; c++) out[c] = h00 * V[i][c] + h10 * dt * tang[i][c] + h01 * V[i + 1][c] + h11 * dt * tang[i + 1][c];
      return out;
    };
    return f;
  };
  /* scalar convenience: Aura.track([[t,v],[t,v]],opts) -> f(t) number */
  Aura.track = function (keys, opts) { const c = Aura.curve(keys, opts); return (t) => c(t)[0]; };

  /* shot definition (absolute episode time)
   * {t0,t1,pos:[[t,x,y,z]..],look:[[t,x,y,z]..],fov:[[t,f]..]|number,roll:[[t,r]..],shake:[[t,amp]..]|number,
   *  shakeScale:1, ease:'io2'|undefined, show:[group,...] (visibility handled by episode)} */
  Aura.shot = function (d) {
    const o = d.ease ? { ease: d.ease } : {};
    return {
      t0: d.t0, t1: d.t1, name: d.name || '',
      pos: Aura.curve(d.pos, o), look: Aura.curve(d.look, o),
      fov: typeof d.fov === 'number' ? () => d.fov : d.fov ? Aura.track(d.fov, o) : () => 35,
      roll: d.roll ? Aura.track(d.roll, o) : () => 0,
      shake: typeof d.shake === 'number' ? () => d.shake : d.shake ? Aura.track(d.shake, { ease: 'io2' }) : () => 0,
      shakeScale: d.shakeScale || 1,
    };
  };
  function shakeN(t, s) {
    return Math.sin(t * 7.1 + s) * 0.5 + Math.sin(t * 13.7 + s * 2.3) * 0.3 + Math.sin(t * 23.1 + s * 4.1) * 0.2;
  }

  /* ----------------------------------------------------------- colour util */
  Aura.col = function (hex) { const c = new THREE.Color(hex); if (c.convertSRGBToLinear) c.convertSRGBToLinear(); return c; };

  /* --------------------------------------------------- scripture + cues */
  Aura.verseText = function (ref) {
    const m = /^(\d+):(\d+)(?:-(\d+))?$/.exec(ref);
    if (!m) return '';
    const ch = m[1], a = +m[2], b = m[3] ? +m[3] : a, parts = [];
    for (let v = a; v <= b; v++) { const s = (window.SCRIPTURE && window.SCRIPTURE[ch + ':' + v]) || ''; if (s) parts.push(s.trim()); }
    return parts.join(' ');
  };
  /* cues timed from word counts: Aura.autoCues(['1:4','1:5'], startTime, wordsPerSec, gapSeconds) */
  Aura.autoCues = function (refs, t0, wps, gap) {
    let t = t0; wps = wps || 2.5; gap = gap === undefined ? 0.6 : gap;
    return refs.map((ref) => { const w = (Aura.verseText(ref) || '').split(/\s+/).filter(Boolean).length || 25; const d = Math.max(3, w / wps); const c = { ref, t0: t, t1: t + d }; t += d + gap; return c; });
  };
  Aura.refLabel = function (ref) { return 'Revelation ' + ref.replace('-', '–'); };

  /* ----------------------------------------------------- final-look shader */
  const FINAL = {
    uniforms: {
      tDiffuse: { value: null }, uTime: { value: 0 }, uFade: { value: 0 }, uFlash: { value: 0 },
      uFlashCol: { value: new THREE.Color(1, 1, 1) },
      uAber: { value: 0.0015 }, uGrain: { value: 0.05 }, uVig: { value: 0.55 }, uExp: { value: 1 },
      uSat: { value: 1.0 }, uCon: { value: 1.06 }, uRes: { value: new THREE.Vector2(1280, 536) },
      uTint: { value: new THREE.Color(1, 1, 1) }, uShadow: { value: new THREE.Color(0.9, 0.95, 1.1) },
    },
    vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
    fragmentShader: [
      'uniform sampler2D tDiffuse; uniform float uTime,uFade,uFlash,uAber,uGrain,uVig,uExp,uSat,uCon;',
      'uniform vec2 uRes; uniform vec3 uTint,uShadow,uFlashCol; varying vec2 vUv;',
      'float hash(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y); }',
      'vec3 aces(vec3 x){ return clamp((x*(2.51*x+0.03))/(x*(2.43*x+0.59)+0.14),0.0,1.0); }',
      'void main(){',
      '  vec2 c=vUv-0.5; float r2=dot(c,c);',
      '  vec2 off=c*r2*uAber*7.0;',
      '  vec3 col=vec3(texture2D(tDiffuse,vUv+off).r, texture2D(tDiffuse,vUv).g, texture2D(tDiffuse,vUv-off).b);',
      '  col*=uExp*uTint;',
      '  col=aces(col);',
      '  float l=dot(col,vec3(0.2126,0.7152,0.0722));',
      '  col=mix(col,col*uShadow,(1.0-l)*(1.0-l)*0.6);',
      '  col=pow(col,vec3(1.0/2.2));',
      '  float l2=dot(col,vec3(0.2126,0.7152,0.0722));',
      '  col=mix(vec3(l2),col,uSat);',
      '  col=(col-0.5)*uCon+0.5;',
      '  float v=smoothstep(0.95,0.28,length(c*vec2(1.0,1.15)));',
      '  col*=mix(1.0,v,uVig);',
      '  float g=hash(vUv*uRes+fract(uTime*7.13)*91.7)-0.5;',
      '  col+=g*uGrain*(1.0-l2*0.55);',
      '  col=mix(col,uFlashCol,uFlash);',
      '  col*=1.0-uFade;',
      '  gl_FragColor=vec4(clamp(col,0.0,1.0),1.0);',
      '}',
    ].join('\n'),
  };
  const GODRAYS = {
    uniforms: { tDiffuse: { value: null }, uSun: { value: new THREE.Vector2(0.5, 0.5) }, uInt: { value: 0 }, uThresh: { value: 1.2 }, uCol: { value: new THREE.Color(1, 0.8, 0.55) } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
    fragmentShader: [
      'uniform sampler2D tDiffuse; uniform vec2 uSun; uniform float uInt,uThresh; uniform vec3 uCol; varying vec2 vUv;',
      'void main(){',
      '  vec4 base=texture2D(tDiffuse,vUv);',
      '  if(uInt<=0.001){ gl_FragColor=base; return; }',
      '  vec2 d=(uSun-vUv)/40.0*0.97; vec2 p=vUv; vec3 acc=vec3(0.0); float w=1.0;',
      '  for(int i=0;i<40;i++){ p+=d; vec3 s=texture2D(tDiffuse,p).rgb; float l=dot(s,vec3(0.3,0.59,0.11)); s*=smoothstep(uThresh,uThresh*2.5,l); acc+=s*w; w*=0.955; }',
      '  gl_FragColor=vec4(base.rgb+acc/40.0*uInt*uCol,1.0);',
      '}',
    ].join('\n'),
  };

  /* =============================================================== ENGINE */
  class Engine {
    constructor(stage) {
      this.stage = stage;
      this.canvas = document.createElement('canvas');
      this.canvas.className = 'aura-canvas';
      stage.appendChild(this.canvas);
      this.titleLayer = document.createElement('div'); this.titleLayer.className = 'aura-titles'; stage.appendChild(this.titleLayer);
      this.subEl = document.createElement('div'); this.subEl.className = 'aura-sub';
      this.subEl.innerHTML = '<div class="aura-sub-ref"></div><div class="aura-sub-text"></div>';
      stage.appendChild(this.subEl);
      this.subRef = this.subEl.querySelector('.aura-sub-ref'); this.subText = this.subEl.querySelector('.aura-sub-text');

      this.listeners = {};
      this.subtitlesOn = true; this.muted = false; this.volume = 0.9;
      /* viewer mix: music & sound effects (the score) and the recorded voice-over have separate levels, 0..1 */
      this.mix = { music: 1, voice: 1 };
      try { const m = JSON.parse(localStorage.getItem('aura.mix') || 'null'); if (m) { if (isFinite(m.music)) this.mix.music = Math.min(1, Math.max(0, +m.music)); if (isFinite(m.voice)) this.mix.voice = Math.min(1, Math.max(0, +m.voice)); } } catch (e) { /* noop */ }
      this.quality = 'high'; this.autoQuality = true;
      this.playing = false; this._t = 0; this.duration = 60; this.loaded = false;
      this._sources = []; this._frames = []; this._lastTs = 0;

      if (new.target.NO_GL) { this._initPixel(); }          /* 2D pixel engine (js/engine-px.js) supplies its own renderer */
      else {
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: false, powerPreference: 'high-performance', alpha: false, stencil: false });
        this.renderer.setClearColor(0x000000, 1);
        this.fx = this._fxDefaults();
        this._buildComposer();
      }
      const ro = new ResizeObserver(() => this._resize());
      ro.observe(stage); this._ro = ro;
      this._resize();
    }

    on(ev, fn) { (this.listeners[ev] = this.listeners[ev] || []).push(fn); }
    emit(ev, a) { (this.listeners[ev] || []).forEach((f) => f(a)); }

    _fxDefaults() {
      return {
        bloom: 0.8, bloomRadius: 0.7, bloomThreshold: 0.85, flash: 0, flashCol: [1, 1, 1], fade: 0, aber: 0.0016, grain: 0.05,
        vignette: 0.55, exposure: 1, saturation: 1, contrast: 1.06, tint: [1, 1, 1], shadow: [0.92, 0.97, 1.08],
        sunWorld: null, rays: 0, raysCol: [1, 0.8, 0.55], raysThresh: 1.2,
      };
    }

    /* ----------------------------------------------------- composer */
    _buildComposer() {
      const r = this.renderer, caps = r.capabilities, ext = r.extensions;
      const q = this.quality;
      let hf = false;
      try { hf = caps.isWebGL2 ? ext.has('EXT_color_buffer_float') : ext.has('EXT_color_buffer_half_float') && ext.has('OES_texture_half_float'); } catch (e) { hf = false; }
      this.hdr = hf;
      const size = r.getSize(new THREE.Vector2());
      const w = Math.max(2, size.x | 0), h = Math.max(2, size.y | 0);
      const opts = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat, type: hf ? THREE.HalfFloatType : THREE.UnsignedByteType };
      let rt;
      try {
        if (q === 'high' && caps.isWebGL2 && hf && THREE.WebGLMultisampleRenderTarget) { rt = new THREE.WebGLMultisampleRenderTarget(w, h, opts); rt.samples = 4; }
        else rt = new THREE.WebGLRenderTarget(w, h, opts);
      } catch (e) { rt = new THREE.WebGLRenderTarget(w, h, { format: THREE.RGBAFormat }); this.hdr = false; }
      if (this.composer) { try { this.composer.renderTarget1.dispose(); this.composer.renderTarget2.dispose(); } catch (e) { /* noop */ } }
      this.composer = new THREE.EffectComposer(r, rt);
      this.renderPass = new THREE.RenderPass(new THREE.Scene(), new THREE.PerspectiveCamera());
      this.composer.addPass(this.renderPass);
      this.bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(w, h), 0.8, 0.7, 0.85);
      this.composer.addPass(this.bloomPass);
      this.raysPass = new THREE.ShaderPass(new THREE.ShaderMaterial({ uniforms: THREE.UniformsUtils.clone(GODRAYS.uniforms), vertexShader: GODRAYS.vertexShader, fragmentShader: GODRAYS.fragmentShader }));
      this.composer.addPass(this.raysPass);
      this.finalPass = new THREE.ShaderPass(new THREE.ShaderMaterial({ uniforms: THREE.UniformsUtils.clone(FINAL.uniforms), vertexShader: FINAL.vertexShader, fragmentShader: FINAL.fragmentShader }));
      this.finalPass.renderToScreen = true;
      this.composer.addPass(this.finalPass);
      if (this.scene) { this.renderPass.scene = this.scene; this.renderPass.camera = this.camera; }
      this._resize();
    }

    setQuality(q, auto) {
      if (!auto) this.autoQuality = false;
      if (q === this.quality) return;
      this.quality = q;
      this._buildComposer();
      this.emit('quality', q);
      if (!this.playing && this.loaded) this.renderAt(this._t);
    }

    _pixelRatio() {
      const dpr = window.devicePixelRatio || 1;
      return this.quality === 'high' ? Math.min(dpr, 2) : this.quality === 'medium' ? Math.min(dpr, 1.25) : 1;
    }

    _resize() {
      const w = Math.max(2, this.stage.clientWidth), h = Math.max(2, this.stage.clientHeight);
      const pr = this._pixelRatio();
      this.renderer.setPixelRatio(pr);
      this.renderer.setSize(w, h, false);
      this.composer.setPixelRatio(pr);
      this.composer.setSize(w, h);
      if (this.finalPass) this.finalPass.uniforms.uRes.value.set(w * pr, h * pr);
      if (this.camera) { this.camera.aspect = w / h; this.camera.updateProjectionMatrix(); }
      if (this.loaded && !this.playing) this.renderAt(this._t);
    }

    /* ------------------------------------------------------- loading */
    async load(def, meta) {
      this.stop(); this._disposeScene();
      this.def = def; this.meta = meta || {};
      this.duration = def.duration || 60;
      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(35, this.stage.clientWidth / Math.max(1, this.stage.clientHeight), 0.1, 6000);
      this.renderPass.scene = this.scene; this.renderPass.camera = this.camera;
      const ctx = (this.ctx = { THREE, engine: this, scene: this.scene, camera: this.camera, renderer: this.renderer, fx: this.fx, lib: Aura.lib, quality: this.quality, Aura });
      this.ep = def.build(ctx) || {};
      this.shots = (this.ep.shots || []).map((s) => (s.pos && s.pos.call ? s : Aura.shot(s)));
      this._buildTitles(def.titles || []);
      this.cues = (def.cues || []).slice();
      this._cueIdx = -2;
      this._t = 0; this.loaded = true;
      this._tryVO(this.meta.n);
      this.renderAt(0);
      this.emit('loaded', def);
    }

    _disposeScene() {
      if (this.ep && this.ep.dispose) { try { this.ep.dispose(); } catch (e) { /* noop */ } }
      if (this.scene) {
        this.scene.traverse((o) => {
          if (o.geometry) o.geometry.dispose();
          if (o.material) { (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => { Object.keys(m).forEach((k) => { if (m[k] && m[k].isTexture) m[k].dispose(); }); if (m.uniforms) Object.keys(m.uniforms).forEach((k) => { const v = m.uniforms[k].value; if (v && v.isTexture) v.dispose(); }); m.dispose(); }); }
        });
      }
      this.titleLayer.innerHTML = ''; this.titles = [];
      this.subEl.classList.remove('on');
      if (this.vo) { this.vo.pause(); this.vo = null; }
      this.loaded = false;
    }

    _buildTitles(list) {
      this.titles = list.map((d) => {
        const el = document.createElement('div');
        el.className = 'aura-title ' + (d.cls || '');
        el.innerHTML = d.html || '';
        this.titleLayer.appendChild(el);
        return Object.assign({ fi: 0.6, fo: 0.6 }, d, { el });
      });
    }
    _updateTitles(t) {
      for (const d of this.titles) {
        const e = smooth(d.t0, d.t0 + d.fi, t) * (1 - smooth(d.t1 - d.fo, d.t1, t));
        const p = clamp((t - d.t0) / Math.max(0.001, d.t1 - d.t0));
        if (e <= 0.001) { if (d._on) { d.el.style.visibility = 'hidden'; d._on = false; } continue; }
        if (!d._on) { d.el.style.visibility = 'visible'; d._on = true; }
        d.el.style.setProperty('--in', e.toFixed(4));
        d.el.style.setProperty('--p', p.toFixed(4));
        d.el.style.setProperty('--age', (t - d.t0).toFixed(3));
      }
    }
    _updateCues(t) {
      let idx = -1;
      for (let i = 0; i < this.cues.length; i++) if (t >= this.cues[i].t0 && t < this.cues[i].t1) { idx = i; break; }
      if (idx !== this._cueIdx) {
        this._cueIdx = idx;
        if (idx >= 0) {
          const c = this.cues[idx];
          this.subRef.textContent = Aura.refLabel(c.ref);
          const txt = Aura.verseText(c.ref);
          this.subText.textContent = txt;
          this.subEl.classList.toggle('noText', !txt);
        }
      }
      let a = 0;
      if (idx >= 0 && this.subtitlesOn) { const c = this.cues[idx]; a = smooth(c.t0, c.t0 + 0.5, t) * (1 - smooth(c.t1 - 0.5, c.t1, t)); }
      this.subEl.style.opacity = a.toFixed(3);
      this.subEl.classList.toggle('on', a > 0.01);
    }

    /* -------------------------------------------------------- render */
    renderAt(t) {
      if (!this.loaded) return;
      const fx = this.fx; Object.assign(fx, this._fxDefaults());
      this._applyShot(t);
      if (this.ep.update) this.ep.update(t, this.ctx);
      this._updateTitles(t); this._updateCues(t);

      const fp = this.finalPass.uniforms;
      fp.uTime.value = t; fp.uFade.value = fx.fade; fp.uFlash.value = fx.flash; fp.uFlashCol.value.setRGB(fx.flashCol[0], fx.flashCol[1], fx.flashCol[2]);
      fp.uAber.value = fx.aber; fp.uGrain.value = fx.grain; fp.uVig.value = fx.vignette; fp.uExp.value = fx.exposure; fp.uSat.value = fx.saturation; fp.uCon.value = fx.contrast;
      fp.uTint.value.setRGB(fx.tint[0], fx.tint[1], fx.tint[2]); fp.uShadow.value.setRGB(fx.shadow[0], fx.shadow[1], fx.shadow[2]);
      this.bloomPass.strength = this.quality === 'low' ? fx.bloom * 0.6 : fx.bloom; this.bloomPass.radius = fx.bloomRadius; this.bloomPass.threshold = fx.bloomThreshold;
      this.bloomPass.enabled = this.quality !== 'low' || fx.bloom > 0.01;

      const rp = this.raysPass.material.uniforms;
      let ri = 0;
      if (fx.sunWorld && fx.rays > 0.001 && this.quality !== 'low') {
        const v = new THREE.Vector3(fx.sunWorld.x, fx.sunWorld.y, fx.sunWorld.z).project(this.camera);
        if (v.z < 1) { rp.uSun.value.set(v.x * 0.5 + 0.5, v.y * 0.5 + 0.5); ri = fx.rays * (1 - smooth(1.1, 2.4, Math.hypot(v.x, v.y))); }
      }
      rp.uInt.value = ri; rp.uThresh.value = this.hdr ? fx.raysThresh : 0.85; rp.uCol.value.setRGB(fx.raysCol[0], fx.raysCol[1], fx.raysCol[2]);
      this.raysPass.enabled = ri > 0.001;
      this.composer.render();
    }

    _applyShot(t) {
      const cam = this.camera;
      if (!this.shots.length) return;
      let s = this.shots[this.shots.length - 1];
      for (let i = 0; i < this.shots.length; i++) if (t >= this.shots[i].t0 && t < this.shots[i].t1) { s = this.shots[i]; break; }
      if (t < this.shots[0].t0) s = this.shots[0];
      const p = s.pos(t), l = s.look(t), sh = s.shake(t) * s.shakeScale;
      let px = p[0], py = p[1], pz = p[2], lx = l[0], ly = l[1], lz = l[2], roll = s.roll(t);
      if (sh > 0) {
        px += shakeN(t, 1.0) * sh; py += shakeN(t, 2.7) * sh; pz += shakeN(t, 4.1) * sh * 0.6;
        lx += shakeN(t, 5.3) * sh * 0.5; ly += shakeN(t, 6.9) * sh * 0.5;
        roll += shakeN(t, 8.3) * sh * 0.012 / Math.max(0.2, s.shakeScale);
      }
      cam.position.set(px, py, pz);
      cam.up.set(0, 1, 0);
      cam.lookAt(lx, ly, lz);
      if (roll) cam.rotateZ(roll);
      const fov = s.fov(t);
      if (Math.abs(cam.fov - fov) > 1e-4) { cam.fov = fov; cam.updateProjectionMatrix(); }
    }

    /* --------------------------------------------------------- clock */
    get time() {
      if (!this.playing) return this._t;
      const t = this.actx && this._c0 !== undefined ? this._t0 + (this.actx.currentTime - this._c0) : this._t0 + (performance.now() - this._p0) / 1000;
      return Math.min(t, this.duration);
    }

    _ensureAudio() {
      if (this.actx) return this.actx;
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      const ctx = (this.actx = new AC());
      this.master = ctx.createGain(); this.master.gain.value = this.muted ? 0 : this.volume;
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -16; comp.knee.value = 24; comp.ratio.value = 3.5; comp.attack.value = 0.01; comp.release.value = 0.3;
      this.master.connect(comp); comp.connect(ctx.destination);
      this.musicGain = ctx.createGain(); this.musicGain.gain.value = this.mix.music; this.musicGain.connect(this.master);
      this.voiceGain = ctx.createGain(); this.voiceGain.gain.value = this.mix.voice; this.voiceGain.connect(this.master);
      this.bus = ctx.createGain(); this.bus.connect(this.musicGain);
      this.reverb = ctx.createConvolver();
      const len = (ctx.sampleRate * 3.8) | 0, ir = ctx.createBuffer(2, len, ctx.sampleRate);
      for (let c = 0; c < 2; c++) {
        const d = ir.getChannelData(c); let lp = 0;
        for (let i = 0; i < len; i++) { const k = 1 - i / len; lp += (((Math.random() * 2 - 1) * Math.pow(k, 2.6)) - lp) * 0.55; d[i] = lp * 1.6; }
      }
      this.reverb.buffer = ir;
      const wet = ctx.createGain(); wet.gain.value = 0.85; this.reverb.connect(wet); wet.connect(this.musicGain);
      const nlen = ctx.sampleRate * 3, nb = ctx.createBuffer(1, nlen, ctx.sampleRate), nd = nb.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < nlen; i++) { const wn = Math.random() * 2 - 1; b0 = 0.99765 * b0 + wn * 0.099046; b1 = 0.963 * b1 + wn * 0.2965164; b2 = 0.57 * b2 + wn * 1.0526913; nd[i] = (b0 + b1 + b2 + wn * 0.1848) * 0.2; }
      this.noiseBuf = nb;
      return ctx;
    }

    play() {
      if (!this.loaded || this.playing) return;
      if (this._t >= this.duration - 0.05) this._t = 0;
      const ctx = this._ensureAudio();
      const go = () => {
        this._t0 = this._t; this._c0 = ctx ? ctx.currentTime : undefined; this._p0 = performance.now();
        this.playing = true; this._scheduleScore(this._t); this._playVO(this._t);
        this.emit('state', 'playing');
      };
      if (ctx && ctx.state !== 'running') ctx.resume().then(go).catch(go); else go();
      this._startLoop();
    }
    pause() {
      if (!this.playing) return;
      this._t = this.time; this.playing = false; this._stopSources(); if (this.vo) this.vo.pause();
      this.emit('state', 'paused'); this.renderAt(this._t);
    }
    stop() { if (this.playing) { this._t = this.time; this.playing = false; } this._stopSources(); if (this.vo) this.vo.pause(); this._stopLoop(); }
    toggle() { this.playing ? this.pause() : this.play(); }
    seek(t) {
      t = clamp(t, 0, this.duration);
      const was = this.playing;
      this._t = t; this._t0 = t; this._c0 = this.actx ? this.actx.currentTime : undefined; this._p0 = performance.now();
      this._stopSources();
      if (was) { this._scheduleScore(t); this._playVO(t); }
      this.renderAt(t); this.emit('time', t);
    }
    restart() { this.seek(0); if (!this.playing) this.play(); }
    setMuted(m) { this.muted = m; if (this.master) this.master.gain.value = m ? 0 : this.volume; if (this.vo) this.vo.muted = m; }
    /* kind: 'music' (score + sound effects) or 'voice' (recorded voice-over); v: 0..1 */
    setMix(kind, v) {
      if (kind !== 'music' && kind !== 'voice') return;
      v = Math.min(1, Math.max(0, +v || 0)); this.mix[kind] = v;
      const g = kind === 'music' ? this.musicGain : this.voiceGain;
      if (g && this.actx) { try { g.gain.setTargetAtTime(v, this.actx.currentTime, 0.02); } catch (e) { g.gain.value = v; } }
      if (kind === 'voice' && this.vo && !this.vo._wired) this.vo.volume = v;
      try { localStorage.setItem('aura.mix', JSON.stringify(this.mix)); } catch (e) { /* noop */ }
      this.emit('mix', this.mix);
    }
    setSubtitles(on) { this.subtitlesOn = on; if (this.loaded) this._updateCues(this.time); }

    _startLoop() { if (this._raf) return; const loop = () => { this._raf = requestAnimationFrame(loop); this._frame(); }; this._raf = requestAnimationFrame(loop); }
    _stopLoop() { if (this._raf) cancelAnimationFrame(this._raf); this._raf = 0; }
    _frame() {
      if (!this.loaded) return;
      const now = performance.now();
      if (this.playing) {
        const t = this.time;
        this.renderAt(t); this.emit('time', t);
        if (t >= this.duration - 1e-3) { this._t = this.duration; this.playing = false; this._stopSources(); if (this.vo) this.vo.pause(); this.renderAt(this.duration); this.emit('state', 'ended'); this.emit('ended'); this._stopLoop(); return; }
        if (this._lastTs) { this._frames.push(now - this._lastTs); if (this._frames.length > 90) { const avg = this._frames.reduce((a, b) => a + b, 0) / this._frames.length; this._frames.length = 0; if (this.autoQuality && avg > 40) { const nq = this.quality === 'high' ? 'medium' : this.quality === 'medium' ? 'low' : null; if (nq) { this.setQuality(nq, true); this.emit('toast', 'Quality adjusted to ' + nq + ' for smoother playback'); } } } }
      } else this._frames.length = 0;
      this._lastTs = now;
    }

    /* ------------------------------------------------- voice-over (optional) */
    _tryVO(n) {
      if (!n) return;
      const a = new Audio(); a.preload = 'auto'; a.muted = this.muted;
      a.addEventListener('error', () => { if (this.vo === a) this.vo = null; });
      a.src = 'audio/ep-' + String(n).padStart(3, '0') + '.mp3';
      this.vo = a;
    }
    _playVO(t) {
      /* studio / saved-recording hook (Web Audio, sample-accurate). If it claims playback, the <audio> fallback stays silent. */
      if (this.voHook && this.actx) {
        let claimed = false;
        try { claimed = !!this.voHook.start(this.actx, this.voiceGain || this.master, t, this.actx.currentTime + 0.08); } catch (e) { console.error('voice hook error', e); }
        if (claimed) { if (this.vo) { try { this.vo.pause(); } catch (e) { /* noop */ } } return; }
      }
      const a = this.vo; if (!a) return;
      /* route the saved mp3 through the voice bus so it has its own level (iPads ignore element.volume); fall back to element.volume */
      if (!a._wired && this.actx && this.voiceGain && /^https?:/.test(location.protocol)) { try { this.actx.createMediaElementSource(a).connect(this.voiceGain); a._wired = true; } catch (e) { /* noop */ } }
      if (!a._wired) a.volume = this.mix.voice;
      try { a.currentTime = t; const p = a.play(); if (p && p.catch) p.catch(() => {}); } catch (e) { /* noop */ } }

    /* --------------------------------------------------------- score */
    _stopSources() {
      if (this.voHook) { try { this.voHook.stop(); } catch (e) { /* noop */ } }
      for (const s of this._sources) { try { s.stop(); } catch (e) { /* noop */ } try { s.disconnect(); } catch (e) { /* noop */ } }
      this._sources.length = 0;
    }
    _scheduleScore(from) {
      if (!this.actx || !this.def.score) return;
      try { this.def.score(this._makeA(from), from); } catch (e) { console.error('score error', e); }
    }
    _makeA(from) {
      const eng = this, ctx = this.actx, base = ctx.currentTime + 0.08;
      const A = { ctx, from, base };
      const when = (t) => base + (t - from);
      A.when = when;
      const reg = (s) => { eng._sources.push(s); return s; };
      const out = (node, wet, pan) => {
        let last = node;
        if (pan && ctx.createStereoPanner) { const p = ctx.createStereoPanner(); p.pan.value = pan; node.connect(p); last = p; }
        const d = ctx.createGain(); d.gain.value = 1 - (wet || 0) * 0.5; last.connect(d); d.connect(eng.bus);
        if (wet) { const w = ctx.createGain(); w.gain.value = wet; last.connect(w); w.connect(eng.reverb); }
      };
      /* automate an AudioParam from a number or [[t,v],...] (absolute episode time) */
      const autom = (param, spec, expo) => {
        if (typeof spec === 'number') { param.setValueAtTime(spec, base); return; }
        const k = spec.slice().sort((a, b) => a[0] - b[0]);
        let v0 = k[0][1];
        for (let i = 0; i < k.length; i++) { if (k[i][0] <= from) v0 = k[i][1]; }
        for (let i = 0; i < k.length - 1; i++) if (from > k[i][0] && from < k[i + 1][0]) { const u = (from - k[i][0]) / (k[i + 1][0] - k[i][0]); v0 = k[i][1] + (k[i + 1][1] - k[i][1]) * u; }
        param.setValueAtTime(expo ? Math.max(v0, 0.0001) : v0, base);
        for (const [t, v] of k) if (t > from) { const w = when(t); if (expo) param.exponentialRampToValueAtTime(Math.max(v, 0.0001), w); else param.linearRampToValueAtTime(v, w); }
      };
      const env = (g, t0, t1, a, r, level) => {
        const s = Math.max(t0, from), w0 = when(s), w1 = when(t1);
        const atk = t0 >= from ? Math.max(a, 0.005) : 0.04;
        g.gain.setValueAtTime(0.0001, w0);
        if (typeof level === 'number') {
          g.gain.linearRampToValueAtTime(level, w0 + atk);
          g.gain.setValueAtTime(level, Math.max(w1 - r, w0 + atk));
        } else {
          g.gain.linearRampToValueAtTime(1, w0 + atk);
          g.gain.setValueAtTime(1, Math.max(w1 - r, w0 + atk));
        }
        g.gain.linearRampToValueAtTime(0.0001, w1);
      };
      const mkFilter = (f) => {
        if (!f) return null;
        const bq = ctx.createBiquadFilter(); bq.type = f.type || 'lowpass'; bq.Q.value = f.q || 0.7; autom(bq.frequency, f.freq || 1000, true); return bq;
      };

      /* o: {type,freq,detune,t0,t1,gain,attack,release,filter,wet,pan} gain/freq may be [[t,v]..] */
      A.voice = function (o) {
        if (o.t1 <= from) return null;
        const osc = reg(ctx.createOscillator()); osc.type = o.type || 'sine'; autom(osc.frequency, o.freq || 220, true); if (o.detune) osc.detune.value = o.detune;
        const g = ctx.createGain();
        let chain = osc; const f = mkFilter(o.filter); if (f) { osc.connect(f); chain = f; }
        const gd = typeof o.gain === 'number' || o.gain === undefined ? o.gain === undefined ? 0.2 : o.gain : null;
        if (gd !== null) { env(g, o.t0, o.t1, o.attack === undefined ? 0.05 : o.attack, o.release === undefined ? 0.2 : o.release, gd); }
        else { const ge = ctx.createGain(); env(ge, o.t0, o.t1, o.attack === undefined ? 0.05 : o.attack, o.release === undefined ? 0.2 : o.release); autom(g.gain, o.gain); chain.connect(ge); chain = ge; g.gain.cancelScheduledValues(0); autom(g.gain, o.gain); }
        chain.connect(g); out(g, o.wet === undefined ? 0.3 : o.wet, o.pan);
        osc.start(when(Math.max(o.t0, from))); osc.stop(when(o.t1) + 0.1);
        return osc;
      };
      A.noise = function (o) {
        if (o.t1 <= from) return null;
        const src = reg(ctx.createBufferSource()); src.buffer = eng.noiseBuf; src.loop = true;
        let chain = src; const f = mkFilter(o.filter); if (f) { src.connect(f); chain = f; }
        const g = ctx.createGain(); const ge = ctx.createGain();
        env(ge, o.t0, o.t1, o.attack === undefined ? 0.1 : o.attack, o.release === undefined ? 0.3 : o.release);
        chain.connect(ge);
        if (typeof o.gain === 'number' || o.gain === undefined) g.gain.value = o.gain === undefined ? 0.2 : o.gain; else autom(g.gain, o.gain);
        ge.connect(g); out(g, o.wet === undefined ? 0.2 : o.wet, o.pan);
        src.start(when(Math.max(o.t0, from)), Math.random() * 2); src.stop(when(o.t1) + 0.1);
        return src;
      };
      A.boom = function (t, o) {
        o = o || {}; const dur = o.dur || 2.2, f = o.freq || 55; if (t + dur <= from) return;
        A.voice({ type: 'sine', freq: [[t, f * 2.2], [t + dur * 0.5, f * 0.8], [t + dur, f * 0.5]], t0: t, t1: t + dur, gain: o.gain || 0.7, attack: 0.005, release: dur * 0.8, wet: 0.35 });
        A.noise({ t0: t, t1: t + dur * 0.8, gain: (o.gain || 0.7) * 0.5, filter: { type: 'lowpass', freq: [[t, 900], [t + dur * 0.8, 60]], q: 0.5 }, attack: 0.003, release: dur * 0.7, wet: 0.5 });
      };
      A.bell = function (t, freq, o) {
        o = o || {}; const dur = o.dur || 3.5, g = o.gain === undefined ? 0.14 : o.gain; if (t + dur <= from) return;
        [[1, 1, 1], [2.0, 0.5, 0.7], [2.76, 0.32, 0.5], [5.4, 0.14, 0.3], [8.9, 0.07, 0.2]].forEach(([m, a, d]) => A.voice({ type: 'sine', freq: freq * m, t0: t, t1: t + dur * d, gain: g * a, attack: 0.004, release: dur * d * 0.95, wet: o.wet === undefined ? 0.55 : o.wet, pan: o.pan }));
      };
      A.brass = function (t0, t1, freq, o) {
        o = o || {}; const g = o.gain === undefined ? 0.1 : o.gain;
        [-6, 0, 6].forEach((dt) => A.voice({ type: 'sawtooth', freq, detune: dt, t0, t1, gain: g, attack: o.attack || 1.2, release: o.release || 0.9, wet: o.wet === undefined ? 0.4 : o.wet, filter: { type: 'lowpass', freq: o.sweep || [[t0, 180], [t0 + (t1 - t0) * 0.6, 1900], [t1, 700]], q: 1.2 } }));
      };
      A.choir = function (t0, t1, freqs, o) {
        o = o || {}; const g = o.gain === undefined ? 0.05 : o.gain; if (t1 <= from) return;
        const lfo = reg(ctx.createOscillator()); lfo.frequency.value = 5.1; const lg = ctx.createGain(); lg.gain.value = 9; lfo.connect(lg);
        lfo.start(when(Math.max(t0, from))); lfo.stop(when(t1) + 0.2);
        freqs.forEach((fq, i) => {
          [-9, 0, 9].forEach((dt) => {
            const osc = reg(ctx.createOscillator()); osc.type = 'sawtooth'; osc.frequency.value = fq; osc.detune.value = dt + i; lg.connect(osc.detune);
            const sum = ctx.createGain(); sum.gain.value = 1; osc.connect(sum);
            const ge = ctx.createGain(); env(ge, t0, t1, o.attack || 2.0, o.release || 1.6, g);
            [[800, 1, 7], [1150, 0.55, 8], [2900, 0.2, 9]].forEach(([ff, fg, q]) => { const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = ff * (o.vowel || 1); bp.Q.value = q; const bg = ctx.createGain(); bg.gain.value = fg; sum.connect(bp); bp.connect(bg); bg.connect(ge); });
            out(ge, o.wet === undefined ? 0.6 : o.wet, ((i % 5) - 2) * 0.25);
            osc.start(when(Math.max(t0, from))); osc.stop(when(t1) + 0.2);
          });
        });
      };
      A.pad = function (t0, t1, freqs, o) {
        o = o || {}; const g = o.gain === undefined ? 0.05 : o.gain;
        freqs.forEach((fq, i) => [-7, 7].forEach((dt) => A.voice({ type: o.type || 'triangle', freq: fq, detune: dt, t0, t1, gain: g, attack: o.attack || 2.5, release: o.release || 2, wet: o.wet === undefined ? 0.5 : o.wet, pan: ((i % 4) - 1.5) * 0.3, filter: { type: 'lowpass', freq: o.cutoff || 1400, q: 0.5 } })));
      };
      A.drone = function (t0, t1, freq, o) {
        o = o || {}; const g = o.gain === undefined ? 0.16 : o.gain;
        A.voice({ type: 'sawtooth', freq, t0, t1, gain: g, attack: o.attack || 3, release: o.release || 2.5, wet: 0.35, filter: { type: 'lowpass', freq: o.cutoff || [[t0, 120], [t1, 300]], q: 0.8 } });
        A.voice({ type: 'sine', freq: freq / 2, t0, t1, gain: g * 1.1, attack: o.attack || 3, release: o.release || 2.5, wet: 0.2 });
      };
      A.riser = function (t0, t1, o) {
        o = o || {}; const g = o.gain === undefined ? 0.18 : o.gain;
        A.noise({ t0, t1, gain: [[t0, 0], [t1 - 0.15, g], [t1, 0]], filter: { type: 'bandpass', freq: [[t0, o.f0 || 300], [t1, o.f1 || 5000]], q: 1.4 }, attack: 0.2, release: 0.2, wet: 0.5 });
        A.voice({ type: 'sine', freq: [[t0, (o.f0 || 300) * 0.5], [t1, (o.f1 || 5000) * 0.35]], t0, t1, gain: g * 0.35, attack: 0.3, release: 0.3, wet: 0.5 });
      };
      A.wind = function (t0, t1, o) {
        o = o || {}; const g = o.gain === undefined ? 0.1 : o.gain; const keys = [], gk = [];
        for (let t = t0; t <= t1 + 1; t += 1.7) { keys.push([t, 300 + Math.abs(Math.sin(t * 1.3) + Math.sin(t * 0.7)) * 700 * (o.bright || 1)]); gk.push([t, g * (0.55 + 0.45 * Math.sin(t * 0.9 + 1))]); }
        A.noise({ t0, t1, gain: o.gainKeys || gk, filter: { type: 'bandpass', freq: keys, q: 0.9 }, attack: o.attack || 2, release: o.release || 2, wet: 0.3, pan: o.pan });
      };
      A.sea = function (t0, t1, o) {
        o = o || {}; const g = o.gain === undefined ? 0.1 : o.gain; const gk = [];
        for (let t = t0; t <= t1 + 1; t += 2.3) gk.push([t, g * (0.35 + 0.65 * Math.pow(0.5 + 0.5 * Math.sin(t * 0.85), 2))]);
        A.noise({ t0, t1, gain: gk, filter: { type: 'lowpass', freq: 520, q: 0.4 }, attack: o.attack || 3, release: o.release || 2, wet: 0.25 });
      };
      A.shimmer = function (t, freq, o) {
        o = o || {}; const dur = o.dur || 3; [1, 1.5, 2, 3, 4].forEach((m, i) => A.voice({ type: 'sine', freq: freq * m, t0: t + i * 0.09, t1: t + dur, gain: (o.gain || 0.05) / (i + 1) * 1.6, attack: 0.6, release: dur * 0.6, wet: 0.75, pan: (i - 2) * 0.3 }));
      };
      return A;
    }
  }
  Aura.Engine = Engine;
  Aura.Engine.supported = function () {
    try { const c = document.createElement('canvas'); return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl'))); } catch (e) { return false; }
  };
})();
