/* ============================================================================
 *  AURABOT PROJECT · REVELATION · PIXEL ENGINE
 *  Same clock, score, voice-over, subtitles and scrubbing as the 3D engine, but
 *  frames are drawn by a software pixel renderer (js/px/*) into a 480x200
 *  canvas that is scaled up with nearest-neighbour filtering.
 *
 *  A pixel episode is a normal Aura.define() with `pixel: true` and a build(ctx)
 *  that returns { render(t, ctx) }. ctx = { px, lib, W, H, engine, Aura }.
 * ========================================================================== */
(function () {
  'use strict';
  const Aura = window.Aura, px = Aura.px, Base = Aura.Engine;

  class PixelEngine extends Base {
    static get NO_GL() { return true; }

    _initPixel() {
      this.isPixel = true;
      this.canvas.width = px.W; this.canvas.height = px.H;
      this.canvas.classList.add('aura-canvas-px');
      this.g = this.canvas.getContext('2d', { alpha: false });
      this.g.imageSmoothingEnabled = false;
      this.surf = px.surface();
      this.img = new ImageData(this.surf.u8, px.W, px.H);
      this.autoQuality = false; this.quality = 'high';
      this.fx = {};
    }
    setQuality(q) { this.quality = q; this.emit('quality', q); }          /* pixel art has one quality */
    _resize() { if (this.loaded && !this.playing) this.renderAt(this._t); }

    async load(def, meta) {
      this.stop(); this._disposeScene();
      this.def = def; this.meta = meta || {};
      this.duration = def.duration || 60;
      const ctx = (this.ctx = { engine: this, px, lib: Aura.pxlib, W: px.W, H: px.H, Aura });
      this.ep = def.build(ctx) || {};
      this.shots = [];
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
      this.titleLayer.innerHTML = ''; this.titles = [];
      this.subEl.classList.remove('on');
      if (this.vo) { this.vo.pause(); this.vo = null; }
      this.loaded = false;
    }

    renderAt(t) {
      if (!this.loaded) return;
      px.target(this.surf.u32);
      /* auto-play continuation: hide the opening title text (shared title card and the hand-drawn ones in the early episodes) */
      const hide = Aura.suppressTitle && t < 8, keepText = px.text;
      if (hide) px.text = () => {};
      try { this.ep.render(t, this.ctx); } catch (e) { console.error('pixel render error', e); } finally { if (hide) px.text = keepText; }
      this.g.putImageData(this.img, 0, 0);
      this._updateTitles(t); this._updateCues(t);
    }

    /* tear down (used when switching between 3D and pixel episodes) */
    destroy() {
      this.stop();
      try { this._ro.disconnect(); } catch (e) { /* noop */ }
      [this.canvas, this.titleLayer, this.subEl].forEach((el) => el && el.parentNode && el.parentNode.removeChild(el));
      if (this.vo) { try { this.vo.pause(); } catch (e) { /* noop */ } }
      if (this.actx) { try { this.actx.close(); } catch (e) { /* noop */ } }
    }
  }
  Aura.PixelEngine = PixelEngine;
  Base.destroy = Base.destroy || null;
  Base.prototype.destroy = function () {
    this.stop();
    try { this._ro.disconnect(); } catch (e) { /* noop */ }
    [this.canvas, this.titleLayer, this.subEl].forEach((el) => el && el.parentNode && el.parentNode.removeChild(el));
    try { this.renderer.dispose(); this.renderer.forceContextLoss(); } catch (e) { /* noop */ }
    if (this.vo) { try { this.vo.pause(); } catch (e) { /* noop */ } }
    if (this.actx) { try { this.actx.close(); } catch (e) { /* noop */ } }
  };
})();
