# REVELATION — The Animated Series
### 102 Episodes · ~60 seconds each · WEB · Produced by **Aurabot Project** · Built in JavaScript (2D pixel-art engine + Web Audio)

> **STYLE: PIXEL ART.** The series is a 2D pixel-art film, exactly like the pixel cut of Episode 1. The old 3D look is retired (Revision 3, below). Wherever an older section mentions 3D, Three.js, shaders or post-FX, Section 0.R3 and Section 5A win.
>
> **How to use this file:** Paste this whole file into a Claude chat (or keep it in a Claude Project), then say:
> *"Build Episode 7"* (see Section 8 for the exact prompt). **Numbering note:** the final numbering is the 102-episode Master Index in Section 12. The detailed outlines in Section 9 use the original *source IDs* (S1–S80); the Master Index maps each final episode to its source outline. Claude builds one self-contained HTML episode at a time, using the Series Bible (Sections 1–6) so every episode looks and sounds like part of the same film.

---

## 0.R3 REVISION 3 — PIXEL-ART STYLE (LOCKED; supersedes every 3D reference in this file)

The realistic-stylised 3D look did not work, so it is retired. **Episode 1's pixel cut (`js/episodes/px-001.js`) is the reference for the whole series.** Everything from here on is built in that style.

| # | Decision | Locked answer |
|---|---|---|
| 12 | Art style | **2D pixel art, as in Episode 1.** 480×200 canvas (2.4:1), limited dithered palettes, nearest-neighbour upscaling. Depth is suggested with shading, parallax layers, rim light and scale, but nothing is rendered in 3D. Full rules: Section 5A. |
| 13 | Existing 3D episodes | Episodes **2, 3, 4 and 5** exist only as 3D cuts (in `ep-001-010.js`). They are **rebuilt in pixel style first, in order 2 → 5, before Episode 6 is started**. Same verses, same cues and timing, same score and handoffs; only the look changes (exactly what was done for Ep 1). |
| 14 | Episode 1 | Done in pixel style (`px-001.js`). The old 3D cut stays in `ep-001-010.js` as a legacy version, reachable with `?style=3d`, until the cleanup step below. |
| 15 | Episodes 6–102 | **Pixel only.** No new 3D episode is ever built. |
| 16 | Engine | Keep `engine.js`: it is the base class (clock, score, voice-over, subtitles, scrubbing) that `Aura.PixelEngine` extends. It still reads `window.THREE` when it loads, so `vendor/three.min.js` stays on the page until `engine.js` is split. Leave all of that alone while building episodes. |
| 17 | Cleanup (later, separate job) | Once Eps 2–5 have pixel versions, the 3D cuts, `lib-world.js` and the Three.js/post-FX vendor files can be removed to slim the site (this needs a small refactor of `engine.js`). Do not do it in the middle of an episode build. |
| 18 | Studio sting / branding | Unchanged. The **Aurabot Project** sting is already drawn in pixels (`lib.studioMark`). |

---

## 0. REVISION 2 — LOCKED DECISIONS (supersede anything below that disagrees, except Revision 3 above, which wins on art style)

| # | Decision | Locked answer |
|---|---|---|
| 1 | Long episodes | **Split.** Any episode whose verbatim WEB text would not fit ~60s of narration is split into two parts. Total is now **102 episodes** (Section 12). A handful of borderline episodes may run up to ~70s. |
| 2 | Voice-over | Recorded **later** by the owner. Each episode looks for `audio/ep-###.mp3` and auto-syncs it if present; a separate **VO Recorder app** will be built later. Until then, episodes play with score + subtitles. |
| 3 | Music | **Generated in code** (Web Audio synth score: drones, choir pads, bells, brass swells, sub-bass hits, wind/sea ambience, procedural reverb). |
| 4 | Jesus | A **bright silhouette**: a figure made of radiant white-gold light (never a dark silhouette), no facial detail. |
| 5 | Art style | ~~Realistic-stylised 3D~~ → **changed in Revision 3 to 2D pixel art** (see 0.R3 and Section 5A). |
| 6 | Devices | **Desktop-first**; must also play well on phones and iPads. Hosted on **GitHub Pages**. Pixel episodes have a single quality level (cheap to render everywhere); the Quality button is hidden for them. |
| 7 | Structure | `index.html` is the landing page + menus + player (animated motion-graphics menu, bold fonts, mouse-hover effects). **All episodes live in JS data files, 10 episodes per file** (`ep-001-010.js`, `ep-011-020.js` ... `ep-101-102.js`). |
| 8 | Subtitles | **On by default**, toggle-able (button or **C** key). |
| 9 | Branding | Short title only. **"Aurabot Project"** appears as the studio sting (like a studio logo before a film). **No end credits.** |
| 10 | Content level | Approved: stylised, non-graphic. |
| 11 | Translation | **Changed to the World English Bible (WEB)**, public domain, so the full text ships with the project. Episodes 1 and 2 already use it. |

**Why 102 and not 80:** the WEB text of Revelation is roughly 12,000 words. At a natural narration pace that is ~85–95 minutes of pure speech before any cinematic pauses. 80 one-minute episodes cannot hold all of it word-for-word, so long passages are split at natural story beats.

### 0.1 Project folder (GitHub Pages ready)

```
revelation/
  index.html                 landing page, animated menu, episode browser AND player
  css/main.css
  js/
    vendor/three.min.js      Three.js r128 (vendored, no CDN needed)
    vendor/three-postfx.js   EffectComposer + Bloom (vendored)
    series-data.js           metadata for all 102 episodes (titles, verses, parts, colours)
    scripture-web.js         WEB verse text: YOU paste it here (all 404 keys, empty)
    engine.js                the "Series Engine" base class: clock, score tools, voice-over, subtitles, scrubbing
    engine-px.js             Aura.PixelEngine: the engine used by every episode (canvas 2D, 480x200)
    px/px-core.js            pixel renderer: dithering, ramps, noise, shapes, glow, 5x7 bitmap font, vignette/fade/flash
    px/px-lib.js             reusable PIXEL set pieces: space, planet, sea, sky, clouds, islands, cliff, grass, John, wind, studio mark...
    lib-world.js             LEGACY 3D set pieces (only needed by the old 3D cuts; not used for new work)
    ui.js                    landing page + player controls
    episodes/
      px-001.js              Episode 1, pixel cut (the style reference)
      px-002-010.js ...      new pixel episodes. Group them 10 per file where practical
                             (px-011-020.js ... px-101-102.js); every file must be listed in js/built.js
      ep-001-010.js          LEGACY 3D cuts of episodes 1-5 (kept until the cleanup step)
  audio/                     optional per-episode voice-overs: ep-001.mp3 ...
```

### 0.2 How an episode is defined (data-file contract)

```js
Aura.define(1, {
  duration: 60,
  cues:  [ { ref: "1:1", t0: 10.0, t1: 23.5 }, ... ],   // subtitle timing; text comes from scripture-web.js
  build(ctx)  { /* make scene objects; return { update(t, ctx) } */ },
  score(A, from) { /* schedule procedural music/SFX at episode-time t */ },
  titles: [ ... ]                                        // animated title overlays
});
```
Everything visual is a **pure function of time `t`**, so the progress bar can scrub anywhere and the picture and subtitles always match.

**The contract that every episode now uses (pixel):**

```js
Aura.define(N, {
  pixel: true,                 // required: the player swaps to the pixel engine and a pixel cut wins over a 3D cut of the same number
  duration: 60,
  cues:  [ { ref: "1:1", t0: 12.6, t1: 25.2 }, ... ],   // text comes from scripture-web.js
  titles: [],                  // titles/cards are drawn in pixels by the renderer
  build(ctx) {                 // ctx = { px, lib, W, H, engine, Aura }   (px = px-core.js, lib = px-lib.js)
    return { render(t, ctx) { /* draw the whole frame for time t using ctx.px / ctx.lib */ } };
  },
  score(A, from) { /* same procedural Web Audio score as before */ }
});
```
After creating a new data file, add its name to `Aura.BUILT_FILES` in `js/built.js`.

### 0.3 Scripture text: World English Bible (WEB)

Translation switched from WEB to the **World English Bible**, which is in the **public domain**. That means the full text of Revelation is already loaded in `js/scripture-web.js` (all 404 verses, copied verbatim from the WEB source data) and every episode reads its subtitles from it automatically. Nothing needs to be pasted by hand.

### 0.4 Landing page spec

Full-screen animated hero (living aura rings, drifting embers, kinetic bold type "REVELATION"), **AURABOT PROJECT** studio mark, animated main menu (large bold words with split-letter hover flicker, magnetic pull, sweeping underline, cursor-follow glow), episode browser grouped by the 10 Parts with each Part's colour, 3D-tilt cards with light that follows the mouse, locked "Coming soon" state for unbuilt episodes, resume-where-you-left-off, and keyboard/touch-friendly player (Space, arrows, C, M, F).

---

## 1. VISION

A cinematic, epic-scale retelling of the Book of Revelation, in the spirit of a big-studio animated saga: sweeping camera moves, enormous scale, striking colour, and a powerful score. Aimed at **teens to young adults**.

**Golden rules**
1. **Faithful to Scripture.** Nothing added, nothing taken away. No invented characters, plot, or dialogue. Every image on screen must come from the text of the verses assigned to that episode. Where the text is symbolic, we show the symbol as written and never explain it away.
2. **Scripture is the script.** The only words in an episode are the WEB text of its verses, spoken as voice-over and shown as subtitles. The only exceptions are the episode title card and the verse reference.
3. **Cinematic first.** Every shot has a purpose: a lens choice, a camera move, a lighting idea, a sound idea.
4. **Teen-appropriate.** Awe and dread, never gore. Violence is stylised and implied (light, shadow, silhouettes, impact). Judgments are shown through the natural world and cosmic forces. Sexual references in the text are handled symbolically and non-graphically.
5. **Continuity.** Each episode ends on a handoff beat that flows into the next episode's opening frame.

---

## 2. SERIES STRUCTURE (10 Parts, 102 Episodes)

| Part | Title | Episodes | Colour Script |
|---|---|---|---|
| I | Patmos & the Seven Churches | 1–15 (15) | Deep sea-blue night → burning gold; each church gets its own accent colour |
| II | The Throne & the Scroll | 16–20 (5) | Blinding gold, jasper-green, emerald rainbow, crystal-white |
| III | The Seven Seals | 21–30 (10) | Four horse colours (white, red, black, pale), then blood-red and black cosmic collapse; silence in white |
| IV | The Seven Trumpets | 31–44 (14) | Ash, ember orange, sickly green, abyss-black; trumpet gold |
| V | The Dragon & the Beasts | 45–59 (15) | Cosmic indigo and crimson; sea-black and iron; harvest gold |
| VI | The Seven Bowls | 60–66 (7) | Glass-sea turquoise fire; then plague palettes |
| VII | The Fall of Babylon | 67–78 (12) | Scarlet, purple, gold decadence → ash-grey ruin |
| VIII | The Return of the King | 79–85 (7) | Heaven open: pure white & gold; the rider |
| IX | The Thousand Years & the Judgment | 86–89 (4) | Chain-steel, throne-white, stark and vast |
| X | All Things New | 90–102 (13) | Dawn palette: crystal, jasper, living green, gold. The warmest of the series |

---

## 3. CINEMATIC LANGUAGE (applies to every episode)

**Frame:** 480×200 pixel canvas (2.4:1, the 2.39:1 anamorphic look) inside a 16:9 page, scaled up with nearest-neighbour so every pixel stays crisp. Dithered vignette and dithered fades/white-outs. Horizontal anamorphic-style flares drawn in pixels on bright sources. (Film grain and chromatic aberration were 3D post-effects and are not used.)

**Camera toolkit** (each episode picks 4–7 shots from this list):
- **Orbital descent** — from space down to a location (series opener signature)
- **Dolly-in / push-in** on a face, object or throne for dramatic weight
- **Crane up / crane down** — reveals scale
- **Low-angle hero shot** — makes figures monumental
- **Dutch tilt** — used only for evil, chaos, or collapse
- **Whip pan** — transitions between visions
- **Rack focus** (simulated depth-of-field via blur layers or shader)
- **Handheld shake** — only for earthquakes, trauma, and fear
- **Locked-off wide** — stillness for holy moments
- **Slow-motion + speed ramp** — impact moments
- **Orbit / 360° around a subject** — revelations
- **POV through John's eyes** — keeps the viewer inside the vision

**Camera in pixel art.** The toolkit above still defines the *intent* of every shot; it is achieved in 2D: pans and push-ins by moving/scaling layers (the planet growing for the orbital descent, the cliff mapper for the push-in), depth by parallax between layers, shake by whole-pixel jitter, dutch tilt by a sloped horizon and skewed ground lines (never rotate the whole frame: it breaks the pixel grid), rack focus by dimming/dithering the background layer. Move in whole pixels so nothing shimmers.

**Camera grammar (rules for the series)**
- *Heaven* = smooth, symmetrical, slow, wide, centred.
- *Earth under judgment* = rougher, asymmetrical, wide-angle, shake.
- *Evil* = tilted, low-key lighting, long shadows, harsh edges.
- *The Lamb / Christ* = light always the source; never shown in dutch angles.
- *John* is the viewer's anchor: small in frame, always witnessing.

**Technique stack (pixel)**
- **Renderer:** `px-core.js`, a small software renderer writing packed 32-bit pixels into a 480×200 buffer that the engine blits to a canvas. Procedural only (no external images).
- **Colour and shading:** ramps of ~6 hex colours (dark → bright) chosen per pixel with a 4×4 ordered (Bayer) dither (`px.ramp`, sharpened by `px.sharp` so colours form flat plateaus with narrow dithered seams). No smooth gradients, no anti-aliasing.
- **Light:** `px.glow` with colour ramps (replaces bloom/god-rays), `lib.flare` for anamorphic flares, `px.post` for the dithered vignette, fades and white/colour flashes.
- **Texture and motion fields:** seeded noise and fbm (`px.fbm`, `px.fbm3`, `px.vnoise`, `px.rng`) for clouds, water, smoke, fire, terrain; a lookup `px.sin` for speed.
- **Particles:** single pixels or 1–3 px sprites from seeded RNG (stars, embers, dust, locusts, hail, rain, glory-light motes). Crowds and armies are rows/fields of dots.
- **Text:** the built-in 5×7 bitmap font (`px.text`, `px.textShadow`) for in-canvas cards (studio sting, title cards).
- **Timeline:** no animation library. Each frame is a pure function of `t` with the `Aura.math.ease` helpers, so scrubbing works.
- **Web Audio API:** unchanged. Procedural score (drones, choir pads, brass swells, percussion hits, silence) + SFX (thunder, wind, trumpet, earthquake). Voice-over is recorded later in the Voice Studio and loaded from `audio/ep-###.mp3` if present.
- **Subtitles:** unchanged. WEB text in an elegant serif HTML overlay on top of the pixel canvas, fading in sync with the VO; verse reference in the bottom corner.

---

## 4. EPISODE TEMPLATE (every episode follows this 60s skeleton)

| Time | Beat |
|---|---|
| 0:00–0:04 | Short animated title card (drawn in pixels with the bitmap font): *Revelation · Episode # · Title* (Episode 1 opens with the **Aurabot Project** studio sting, then the title **REVELATION**). No end credits in any episode. |
| 0:04–0:10 | Continuity opener, matching the previous episode's final frame |
| 0:10–0:50 | Main sequence, 4–7 shots, scripture VO + subtitles |
| 0:50–0:58 | Climax / signature image |
| 0:58–1:00 | Handoff beat + fade, with a "Next Episode" button that is not part of the film |

**Player controls (every episode):** Play/Pause, Restart, Previous/Next, Subtitles (on by default; toggle), Sound, Quality, Fullscreen, scrubbable progress bar, auto-advance to the next built episode.

---

## 5. SERIES BIBLE — VISUAL & AUDIO MOTIFS

**Recurring visual motifs (consistent design across episodes)**
- **John:** an elderly man in simple robes, seen mostly from behind or in silhouette. He is the witness.
- **The Throne (Rev 4):** one fixed design: jasper and carnelian glow, an emerald rainbow halo, sea of glass, flashing lightning. Reused in every heaven scene.
- **The Lamb:** a luminous lamb bearing the marks of having been slain, seven horns, seven eyes.
- **Christ (Rev 1, 19):** a **bright silhouette**: a figure of radiant white-gold light, never dark. Only the text's attributes are shown as light: hair white as wool, eyes like blazing fire, feet like glowing bronze, a sharp sword from the mouth. No facial detail.
- **Seven lampstands / seven stars / seven spirits:** a recurring "seven" visual, with seven golden lights.
- **The Scroll and its seals:** a physical scroll with seven wax seals that break one by one across the series.
- **Trumpets:** each trumpet has the same golden design; sound = sub-bass plus brass.
- **The Dragon:** a vast red form, seven heads, ten horns, crowns; one consistent model.
- **The Beast from the sea / from the earth:** distinct silhouettes, always lit from below.
- **Babylon:** a glittering, sprawling city (gold, scarlet, purple) that will visibly rot and fall.
- **New Jerusalem:** the visual payoff, a square city of crystal-gold with 12 pearl gates.

**Audio motifs (leitmotifs)**
- **"Throne theme":** low choir + sustained major-ish chord, shimmering overtones. Heaven.
- **"Lamb theme":** gentle, rising 4-note figure on warm strings or bells.
- **"Dragon / Beast theme":** low chromatic brass and detuned drone, irregular pulse.
- **"Seven" pulse:** a 7-note rising arpeggio, used when seven things appear.
- **"Trumpet" cue:** a long, rising brass swell followed by a sub-bass hit.
- **"Silence":** used deliberately (Ep 26, 38, 56, 80).
- Score builds across the series. The final episodes bring all themes together.

---

## 5A. PIXEL ART STYLE GUIDE (the look of every episode; reference = Episode 1)

**Why this exists:** the 3D look was dropped. These rules keep every episode matching the Episode 1 pixel cut, so the series feels like one film.

**Canvas and rendering**
- 480×200 pixels, 2.4:1. Everything is drawn into that buffer and scaled up with nearest-neighbour filtering. Never use smoothing, never draw anti-aliased edges, never draw at a different resolution.
- Positions and motion snap to whole pixels. Camera moves, shake and parallax are done in whole-pixel steps so the picture never shimmers.
- Reuse and extend `px-core.js` and `px-lib.js`. A new reusable piece (a lampstand, the Throne, a horse, the Lamb, a city) is added to `px-lib.js` once and reused, so it looks the same in every episode that shows it.

**Colour**
- Build colour from **ramps** (about six hex colours from darkest to brightest) and pick between them with the ordered dither. Flat colour plateaus with narrow dithered seams give the hand-painted look.
- Palette rule (from Episode 1): **dark cool blues plus one warm accent** (dawn orange/gold). Each scene uses a small number of ramps. The Part colour scripts in Section 2 and each church's accent colour are expressed as ramps, not as free colours.
- Colour mood moves by mixing ramps over time (`px.mixRamp`), e.g. night → dawn, like the sky in Episode 1.

**Light and depth (how it still feels cinematic)**
- Light is the hero: glows from the source (`px.glow`), rim light on figures and ridgelines, anamorphic flares (`lib.flare`) on the brightest points, dithered vignette, white-outs for transitions.
- Depth comes from shaded forms (the planet's terminator and night lights), parallax layers, atmospheric haze, scale contrast (a tiny John against a vast sky) and rim light. Nothing is real 3D.

**Figures**
- **John:** small in frame, usually from behind, simple robe, long hair, rim-lit (`lib.john`). He is the anchor.
- **Christ:** a bright silhouette of radiant white-gold light, never dark, no facial detail (Revision 2, decision 4), now built from light shapes in pixels.
- **No faces** on any figure. Angels, elders, beasts and crowds are read from silhouette, light and colour.
- Symbols stay symbols: show exactly what the verse says, in pixel form, and never "decode" it.

**Type**
- In-canvas text uses the 5×7 bitmap font only (studio sting, title cards). Subtitles stay as the HTML serif overlay.

**Content**
- Same teen-appropriate rule as before. The pixel style helps: impact is a flash, a shake and a silhouette, never gore.

---

## 6. FAITHFULNESS CHECKLIST (run on every episode before finishing)

- [ ] Every visual element traces to a phrase in the episode's verses.
- [ ] No extra dialogue, no new characters, no explanatory narration.
- [ ] VO/subtitles = the WEB text for the assigned verses, in order, complete.
- [ ] Numbers, colours, creatures, and sequence match the text.
- [ ] Symbolic things are shown as symbols, with no "decoding" shown.
- [ ] Non-graphic, teen-appropriate.
- [ ] The next episode picks up exactly where this one ends.
- [ ] **Pixel style (Section 5A):** `pixel: true`; 480×200 only; dithered ramp palettes, no smooth gradients or anti-aliasing; whole-pixel motion; no faces; new reusable pieces added to `px-lib.js`; file listed in `js/built.js`.
- [ ] Rendered frames at several times (start, middle, climax, last frame) and checked the look against Episode 1.

---

## 7. TECHNICAL NOTES

- **Hosting:** static site on GitHub Pages: no build step, no server. Everything is vendored in the repo.
- **Rendering:** the 2D pixel engine (`engine-px.js`, `px-core.js`, `px-lib.js`): a 480×200 software-rendered frame, dithered ramp palettes, nearest-neighbour upscale, dithered vignette/fade/flash, 2.4:1 frame. No WebGL is needed for pixel episodes.
- **Timeline:** one master clock (the AudioContext clock). Every frame is a pure function of `t`, so scrubbing works.
- **Score:** procedural Web Audio with a convolution reverb built in code; re-scheduled from the new position whenever the viewer scrubs.
- **Quality:** pixel episodes have one quality level and run well on phones and iPads; the Quality button is hidden for them (the old High/Medium/Low tiers only applied to the legacy 3D cuts).
- **Phones:** best in landscape. Audio starts on the first tap (browser rule).
- **Data files:** about 10 episodes per file, loaded on demand when a viewer picks an episode, each file listed in `js/built.js`.
- **Legacy:** `engine.js` is still the base class of the pixel engine and loads `three.min.js`. `lib-world.js` and the 3D cuts are legacy (decision 17 in 0.R3).
- **Expectation:** pixel art is forgiving: strong silhouettes, a tight palette, good light and confident camera moves read as "cinematic" at 480×200, and it is far cheaper to render than 3D.

---

## 8. HOW TO BUILD EACH EPISODE (the prompt to paste)

Upload the current project (or at least `engine-px.js`, `px/px-core.js`, `px/px-lib.js`, `series-data.js`, `built.js`, `px-001.js` as the style reference, and the latest pixel episode file) plus this plan, then:

```
Using REVELATION_SERIES_PLAN.md and the existing project files, build Episode [N]
(final numbering, Section 12) in PIXEL ART STYLE, matching Episode 1 (px-001.js) and
Section 5A. Use Aura.define(N, { pixel: true, ... }) and add it to js/episodes/px-XXX-YYY.js,
then list that file in js/built.js. Follow the Series Bible, Episode Template and Faithfulness
Checklist. Cues must reference verse keys from scripture-web.js. Open on the previous
episode's final frame. Reuse px-lib.js pieces; add new reusable pieces there.
Render frames at several times, compare the look with Episode 1, and fix problems
before giving it to me.
```

**To convert an existing 3D episode (2, 3, 4 or 5) to pixel**, use this instead:

```
Rebuild Episode [N] in pixel art style. Keep the same verses, cues, timing, score() and
handoff as the existing 3D cut in ep-001-010.js, and match Episode 1 (px-001.js) and
Section 5A. Add it as a pixel episode (pixel: true) and list the file in js/built.js.
Leave the 3D cut in place. Render frames and fix problems before giving it to me.
```

*(The WEB text is already in `js/scripture-web.js`. See 0.3.)*

---

## 9. SOURCE OUTLINES (S1–S80)

> **Style note (Revision 3):** the *Look* lines below were written when the series was 3D. Read them as the **intent** of each shot (what is seen, the mood, the camera move) and build that intent in pixel art using this translation:
>
> | 3D idea in an outline | Pixel-art way to do it |
> |---|---|
> | Bloom, god-rays, anamorphic flare, white-out | `px.glow` ramps, `lib.flare`, dithered light wedges, `px.post` flash |
> | Shaders for water, fire, sky, clouds, crystal, lightning | Dithered ramp fields driven by fbm noise (as `lib.seascape` and the planet clouds), animated by `t` |
> | Particle systems (locusts, hail, embers, motes, stars) | Single pixels / 1–3 px sprites from a seeded RNG |
> | Armies, crowds, hosts (instanced) | Rows and fields of dots with depth-scaled size |
> | Volumetric light, light shafts | Dithered additive wedges (`px.dpx`) |
> | Depth of field / rack focus | Dim and dither the layer that is out of focus |
> | Dutch tilt | Sloped horizon and skewed ground/layers (never rotate the frame) |
> | Handheld shake | Whole-pixel jitter |
> | Colossal scale | One huge shape against a tiny John, with parallax |
> | Orbital descent | Scale and move the planet (as in Episode 1) |
>
> Faces are never drawn; light and silhouette carry every character.

> These are the original 80 outlines. IDs here are **source IDs (S#)**, not final episode numbers. Where an outline was split in Revision 2, Section 12 says where to cut it: **Part A** takes the first verse range and its images, **Part B** the rest, and each gets its own opening and handoff. Any "Ep N" callback mentioned inside an outline refers to a source ID.

Each entry: **Verses · What the text shows · Look & camera · Handoff.**

---

### PART I — PATMOS & THE SEVEN CHURCHES

**S1 — The Unveiling** · Rev 1:1–3
*Text:* The revelation of Jesus Christ, given by God, made known through His angel to John, who testifies to what he saw. Blessing on the one who reads aloud and those who hear and take it to heart.
*Look:* Orbital descent from star-field to Earth, Mediterranean dawn, the Aegean, the island of Patmos. Title reveal in cosmic gold. Slow push to a small figure on a cliff.
*Handoff:* Camera settles behind John as the wind rises.

**S2 — Grace and Peace** · Rev 1:4–8
*Text:* John to the seven churches in Asia; grace from the One who is, was and is to come, the seven spirits before the throne, and Jesus Christ, the faithful witness, firstborn from the dead, ruler of kings. He loves us, freed us by His blood, made us a kingdom. He is coming with the clouds; every eye will see Him, even those who pierced Him. "I am the Alpha and the Omega."
*Look:* Seven lights ignite over seven city silhouettes. Sky-wide shot as the clouds part; huge Alpha and Omega forms in the stars. Low-angle on John looking up.
*Handoff:* John's face lit gold; a distant sound builds.

**S3 — On the Lord's Day** · Rev 1:9–11
*Text:* John, brother and companion in suffering, on Patmos because of the word of God. In the Spirit on the Lord's Day, he hears a loud voice like a trumpet: write what you see on a scroll and send it to the seven churches, named in order.
*Look:* Rocky shore, crashing waves, wind. Whip-pan reaction to the trumpet-voice. Shockwave ripples the sea. Seven city names flare across the sky one by one.
*Handoff:* John slowly turns around.

**S4 — One Like a Son of Man** · Rev 1:12–16
*Text:* John turns; seven golden lampstands; among them one like a son of man in a robe to His feet, golden sash; head and hair white like wool, like snow; eyes like blazing fire; feet like bronze glowing in a furnace; voice like rushing waters; seven stars in His right hand; a sharp double-edged sword from His mouth; face like the sun in full strength.
*Look:* The signature reveal. Slow 180° orbit as lampstands appear, then a tilt up the figure, saving the face for a blinding sun-burst. Anamorphic flare, sub-bass roar. Face never rendered, only light.
*Handoff:* Overpowering white-gold light swallows the frame.

**S5 — Do Not Be Afraid** · Rev 1:17–20
*Text:* John falls at His feet as though dead. The right hand is laid on him: "Do not be afraid. I am the First and the Last. I am the Living One; I was dead, and now look, I am alive for ever and ever! And I hold the keys of death and Hades." Write what you have seen, what is now, and what will take place later. The mystery: seven stars = angels of the seven churches; lampstands = the seven churches.
*Look:* POV falling, then a hand entering frame, a warm light settling. Keys glint. Slow pull-back revealing seven lampstands and seven stars aligned over the seven cities.
*Handoff:* First lampstand brightens, toward Ephesus.

**S6 — Ephesus: The First Love** · Rev 2:1–7
*Text:* To the angel of the church in Ephesus: deeds, hard work, perseverance; cannot tolerate the wicked; tested false apostles. But you have forsaken your first love. Remember how far you have fallen, repent. The Nicolaitans are hated. To the one who is victorious, the right to eat from the tree of life in God's paradise.
*Look:* Ephesus in warm amber; a great harbour city, grand columns. A lamp's flame flickers low. Tree of life glimpsed in the final shot, golden leaves.
*Handoff:* Flame steadies; sea-wind carries smoke north to Smyrna.

**S7 — Smyrna: Faithful Until Death** · Rev 2:8–11
*Text:* "I know your afflictions and your poverty — yet you are rich!" Slander; the devil will put some in prison; suffering for ten days. "Be faithful, even to the point of death, and I will give you life as your victor's crown." The victorious will not be hurt by the second death.
*Look:* Cold blue palette, narrow streets, rain, a single lamp in the window. Low, intimate camera. Ten flickers of light. A crown of life shimmers into being.
*Handoff:* The rain clears into stark mountain light: Pergamum.

**S8 — Pergamum: The Throne of Satan** · Rev 2:12–17
*Text:* The One with the sharp double-edged sword. "You live where Satan has his throne." Yet you remained true; Antipas, My faithful witness, was put to death. But some hold to the teaching of Balaam and the Nicolaitans. Repent, or I will come and fight against them with the sword of My mouth. Hidden manna; a white stone with a new name.
*Look:* High acropolis, dark crimson, harsh low-key light, tilted angles for the "throne." Sword of light slices across the screen. Final calm: a white stone glowing with a name we cannot read.
*Handoff:* Torch-light from below: Thyatira's furnaces.

**S9 — Thyatira: Eyes Like Fire (I)** · Rev 2:18–23
*Text:* The Son of God, eyes like blazing fire, feet like burnished bronze. Praise: love, faith, service, perseverance, more now than before. But you tolerate that woman Jezebel who calls herself a prophet. Time to repent given; judgment promised on her and those who follow. All the churches will know He searches hearts and minds.
*Look:* Forge-city, orange light on bronze. Close-ups of burning eyes (light, not a face). Rack focus between flame and shadow. Shadow-figure (silhouette only).
*Handoff:* The glowing bronze cools to a soft ember.

**S10 — Thyatira: Hold On Until I Come (II)** · Rev 2:24–29
*Text:* To the rest in Thyatira: I will not impose any other burden. Hold on to what you have until I come. The victorious will be given authority over the nations, to rule with an iron scepter; and I will give that one the morning star. Whoever has ears, hear what the Spirit says.
*Look:* Ember rises into a glowing scepter of iron. Dawn begins to break behind it: a bright star on the horizon. Wide, calm, hopeful.
*Handoff:* The morning star fades into a dull, grey sky: Sardis.

**S11 — Sardis: Wake Up!** · Rev 3:1–6
*Text:* The One with the seven spirits and seven stars. "You have a reputation of being alive, but you are dead." Wake up! Remember what you have received; obey; repent. If not, I will come like a thief. A few have not soiled their clothes; they will walk with Me, dressed in white. Names never blotted from the book of life.
*Look:* Desaturated, faded grandeur, a city that looks alive but is hollow. Slow dolly through an empty hall. A single flash of white robes. A scroll of names glows.
*Handoff:* A door in the distance glows with warm light: Philadelphia.

**S12 — Philadelphia: The Open Door** · Rev 3:7–13
*Text:* The Holy One, True, who holds the key of David. "What he opens no one can shut." An open door set before you. You have little strength, yet kept My word. I will make others fall at your feet. Because you kept My command to endure, I will keep you from the hour of trial. I am coming soon. A pillar in the temple of My God; My new name written on you.
*Look:* A small city under a vast door of light. Keys, hinges, gold light flooding. Camera glides through the door. Final: a pillar rising, names inscribed in light.
*Handoff:* The light dims into lukewarm haze: Laodicea.

**S13 — Laodicea: Neither Hot nor Cold** · Rev 3:14–19
*Text:* The Amen, faithful and true witness, ruler of God's creation. "You are neither cold nor hot... I am about to spit you out of My mouth." You say you are rich, but you are wretched, pitiful, poor, blind and naked. Buy gold refined in the fire, white clothes, salve for your eyes. Those I love I rebuke and discipline. Be earnest and repent.
*Look:* A wealthy city, polished, golden but dull. Split-screen hot spring vs. cold spring colours meeting in tepid water. Refined gold glowing in fire; white garments; salve. Warm, firm tone.
*Handoff:* A knock is heard.

**S14 — Behold, I Stand at the Door** · Rev 3:20–22
*Text:* "Here I am! I stand at the door and knock. If anyone hears My voice and opens the door, I will come in and eat with them, and they with Me." The victorious will sit with Me on My throne. Whoever has ears, hear what the Spirit says to the churches.
*Look:* Intimate close-up on a door; knock, knock. A hand on the handle. Light under the door. Camera retreats as the door begins to open onto glory. Part I ends in a hush.
*Handoff:* Through the opening door, a doorway in the sky: heaven.

---

### PART II — THE THRONE & THE SCROLL

**S15 — A Door Standing Open in Heaven** · Rev 4:1–5
*Text:* A door standing open in heaven; the trumpet voice says "Come up here." In the Spirit, a throne in heaven with someone sitting on it, appearing like jasper and ruby, a rainbow like an emerald encircling it. Twenty-four thrones, twenty-four elders in white with gold crowns. Lightning, rumblings, thunder. Seven blazing lamps — the seven spirits of God.
*Look:* The great ascent: a rocket-like rise through clouds and starlight into the throne room. Symmetry, crystal reflections. Slow reveal, back-lit throne, 24 elders arranged in a semicircle.
*Handoff:* The sea of glass ripples beneath the throne.

**S16 — Holy, Holy, Holy** · Rev 4:6–11
*Text:* Before the throne, what looks like a sea of glass, clear as crystal. Four living creatures covered with eyes, front and back: like a lion, an ox, with a face like a human, a flying eagle. Six wings each, eyes all around. Day and night: "Holy, holy, holy is the Lord God Almighty, who was, and is, and is to come." The elders fall and lay down their crowns: "You are worthy, our Lord and God."
*Look:* Overhead crane over the crystal sea; each creature introduced with its own camera angle. Wings sweep. Crowns fly into the light in slow motion. The first full statement of the Throne Theme.
*Handoff:* Camera pushes toward the right hand of the One on the throne.

**S17 — The Scroll Nobody Could Open** · Rev 5:1–5
*Text:* In the right hand of the One on the throne, a scroll with writing on both sides, sealed with seven seals. A mighty angel: "Who is worthy to break the seals?" No one in heaven or on earth or under the earth could open it. John weeps and weeps. An elder: "Do not weep! See, the Lion of the tribe of Judah, the Root of David, has triumphed."
*Look:* Huge scroll, seven wax seals glowing. Echoing, empty silence for "no one." A small John in the vast hall, weeping. The elder's hand on his shoulder. Mood turns on "Lion": a flash of hope.
*Handoff:* John looks up and turns toward the throne's centre.

**S18 — The Lamb Who Was Slain** · Rev 5:6–10
*Text:* Standing in the centre before the throne, a Lamb looking as if it had been slain, seven horns and seven eyes (the seven spirits of God). It takes the scroll. The four creatures and elders fall down, each with a harp and golden bowls of incense (the prayers of God's people). New song: "You are worthy... with your blood you purchased people for God from every tribe and language and people and nation... a kingdom and priests."
*Look:* The Lamb enters in soft, intimate light. Slow push-in; sudden bloom as it takes the scroll. Harps, incense swirling. Lamb Theme debuts, then swells into a choir.
*Handoff:* The choir is joined by distant, countless voices.

**S19 — Worthy Is the Lamb** · Rev 5:11–14
*Text:* Thousands upon thousands, ten thousand times ten thousand angels around the throne: "Worthy is the Lamb, who was slain, to receive power and wealth and wisdom and strength and honor and glory and praise!" Every creature in heaven, earth, under the earth, in the sea: "To Him who sits on the throne and to the Lamb be praise and honor and glory and power, for ever and ever!" The four creatures say "Amen"; the elders fall and worship.
*Look:* Camera rises in a huge spiral, revealing an endless galaxy-sized host. Wave after wave of light, ocean and earth joining in. A single held chord, then silence and "Amen." Peak of Part II.
*Handoff:* The Lamb lifts the first seal.

---

### PART III — THE SEVEN SEALS

**S20 — Come! The White Horse and the Red** · Rev 6:1–4
*Text:* The Lamb opens the first seal; a thunder-voice from one of the four creatures: "Come!" A white horse; its rider holds a bow, is given a crown, rides out as a conqueror bent on conquest. Second seal: "Come!" A fiery red horse; its rider is given power to take peace from the earth and make people slay each other; a large sword.
*Look:* The seal cracks in extreme close-up (wax, light). White horse gallops through a tracking shot, then a red horse: heat shimmer, speed-ramp. Sword flash. Sound design: horse hooves in a sub-bass pulse.
*Handoff:* The sky above the red horse darkens to black.

**S21 — The Black Horse and the Pale Horse** · Rev 6:5–8
*Text:* Third seal: a black horse; its rider holds a pair of scales. A voice: "Two pounds of wheat for a day's wages, and six pounds of barley for a day's wages, and do not damage the oil and the wine!" Fourth seal: a pale horse; its rider is named Death, and Hades follows close behind. Power over a quarter of the earth, to kill by sword, famine, plague, and wild beasts.
*Look:* Scales in slow motion, grain falling. The pale horse in sickly green light, mist; Death as a hooded silhouette, with Hades following as shadow. Dutch tilt. Wide shot of the earth with a quarter darkening.
*Handoff:* An altar appears in the dim distance.

**S22 — How Long, Sovereign Lord?** · Rev 6:9–11
*Text:* Fifth seal: under the altar, the souls of those slain because of the word of God and the testimony they had maintained. They cry out: "How long, Sovereign Lord, holy and true, until you judge the inhabitants of the earth and avenge our blood?" Each is given a white robe and told to wait a little longer until the number of their fellow servants is complete.
*Look:* Solemn. Low camera under a great altar. Voices as light-forms, ethereal. White robes unfurl slowly. A quiet, gentle, reverent mood after the violence.
*Handoff:* The Lamb's hand moves to the sixth seal.

**S23 — The Sky Rolls Up** · Rev 6:12–17
*Text:* Sixth seal: a great earthquake; the sun turns black like sackcloth, the whole moon blood red, stars fall like figs from a tree shaken by wind; the heavens recede like a scroll being rolled up; every mountain and island removed. Kings, rulers, generals, the rich, the mighty, slave and free hide in caves and among rocks: "Fall on us and hide us from the face of Him who sits on the throne and from the wrath of the Lamb! The great day of their wrath has come, and who can withstand it?"
*Look:* The biggest effects shot so far: handheld shake, rolling sky, meteor shower, mountains shifting. Tiny people in caves, wide shot, silhouettes. The question "who can withstand?" ends in silence.
*Handoff:* Total darkness, then four points of light at the four corners of the earth.

**S24 — The Seal on Their Foreheads** · Rev 7:1–8
*Text:* Four angels at the four corners of the earth hold back the four winds so that no wind will blow on land or sea. Another angel from the east, with the seal of the living God: "Do not harm the land or the sea or the trees until we put a seal on the foreheads of the servants of our God." John hears the number: 144,000 from all the tribes of Israel — 12,000 from each of the twelve tribes, named in order.
*Look:* Frozen world: waves, leaves, smoke hanging mid-air. The sealing angel's golden light. Twelve tribe-lights ignite in a ring, 12,000 motes each, to form a huge radiant circle.
*Handoff:* The circle opens onto a boundless crowd.

**S25 — A Great Multitude** · Rev 7:9–17
*Text:* A great multitude that no one could count, from every nation, tribe, people and language, standing before the throne and the Lamb in white robes holding palm branches: "Salvation belongs to our God, who sits on the throne, and to the Lamb." Angels worship. An elder: "Who are these...?" — "Sir, you know." These have come out of the great tribulation; they have washed their robes in the blood of the Lamb. They will never hunger or thirst; the Lamb will be their shepherd; God will wipe away every tear.
*Look:* Crane up from a single figure to a sea of people. Warm tones, palm branches sweeping. Shepherd imagery: springs of water. Gentle slow-motion on a tear being wiped away.
*Handoff:* The roar dims. Silence begins.

**S26 — Silence in Heaven** · Rev 8:1–6
*Text:* The Lamb opens the seventh seal; silence in heaven for about half an hour. Seven angels are given seven trumpets. Another angel with a golden censer is given much incense to offer with the prayers of all God's people; the smoke goes up before God. He fills the censer with fire from the altar and hurls it on the earth; thunder, rumblings, lightning, an earthquake. The seven angels prepare to sound.
*Look:* The deliberate silence: nearly 8 seconds of no sound and total stillness, the only motion a drifting particle. Then incense smoke rising in beautiful slow-mo. Censer falls to Earth like a comet. Seven trumpets raised in perfect formation.
*Handoff:* The first angel breathes in.

---

### PART IV — THE SEVEN TRUMPETS

**S27 — Hail and Fire; the Burning Mountain** · Rev 8:7–9
*Text:* First trumpet: hail and fire mixed with blood hurled down on the earth; a third of the earth, a third of the trees, all the green grass burned up. Second trumpet: something like a huge mountain, all ablaze, thrown into the sea; a third of the sea turned to blood, a third of the living creatures in the sea died, and a third of the ships were destroyed.
*Look:* Trumpet-and-bass-hit cue debuts. Aerial shot as fire-hail sweeps over forests. A burning mountain splashes into the sea: huge wave shader, red water. Strong shake.
*Handoff:* A star in the night sky burns brighter, falling.

**S28 — Wormwood and the Darkened Sky; Woe, Woe, Woe** · Rev 8:10–13
*Text:* Third trumpet: a great star, blazing like a torch, falls on a third of the rivers and springs; its name Wormwood; a third of the waters turn bitter and many die. Fourth trumpet: a third of the sun, moon and stars struck, so that a third of the day and night had no light. An eagle flying in midair: "Woe! Woe! Woe to the inhabitants of the earth, because of the trumpet blasts about to be sounded by the other three angels!"
*Look:* Meteor tracking shot into a river system. Sky dimming by a third (clear split-light effect). Eagle crosses the dark sky in a long low-angle tracking shot; the voice is huge and echoing.
*Handoff:* A fallen star holding a key.

**S29 — The Abyss Is Opened** · Rev 9:1–6
*Text:* Fifth trumpet: a star that had fallen from the sky to the earth, given the key to the shaft of the Abyss. When he opens it, smoke rises like smoke from a gigantic furnace; sun and sky darkened. Out of the smoke, locusts come down on the earth, given power like scorpions. They are told not to harm the grass, plants or trees, only people without the seal of God on their foreheads; not to kill but to torment for five months. In those days people will seek death but not find it.
*Look:* The shaft opening in a ground-level dolly. Black smoke billows. Locusts as a living swarm particle system; the sealed ones surrounded by a gold glow that the swarm avoids. Tense, tilted, claustrophobic.
*Handoff:* The swarm resolves into shapes in the smoke.

**S30 — Abaddon** · Rev 9:7–12
*Text:* The locusts look like horses prepared for battle: crowns of something like gold; faces like human faces; hair like women's hair; teeth like lions' teeth; breastplates like iron; the sound of their wings like many horses and chariots rushing into battle; tails with stingers. Their king is the angel of the Abyss, whose name in Hebrew is Abaddon, and in Greek Apollyon. The first woe is past; two other woes are yet to come.
*Look:* Detailed creature design reveal. Close-ups piece by piece, cutting to a wide. Wing-sound design. The name Abaddon appears on a cracked black stone.
*Handoff:* A golden altar in heaven; a voice speaks from its horns.

**S31 — Release the Four Angels** · Rev 9:13–16
*Text:* Sixth trumpet: a voice from the four horns of the golden altar before God: "Release the four angels who are bound at the great river Euphrates." The four angels, kept ready for this very hour and day and month and year, are released to kill a third of mankind. The number of the mounted troops: twice ten thousand times ten thousand.
*Look:* A great river at dusk. Binding chains fall away in sparks. A cavalry mass in the distance, an ocean of silhouettes on the horizon, rendered as instanced particles to convey 200 million. Heavy bass pulse.
*Handoff:* The army charges.

**S32 — Fire, Smoke and Sulfur** · Rev 9:17–21
*Text:* The horses and riders: breastplates fiery red, dark blue, and yellow like sulfur; the horses' heads like lions' heads, with fire, smoke and sulfur from their mouths; a third of mankind killed by these three plagues; their power in their mouths and in their tails, like snakes, with heads. The rest still did not repent of the work of their hands nor stop worshiping demons and idols of gold, silver, bronze, stone and wood; nor repent of their murders, magic arts, sexual immorality or thefts.
*Look:* Speed-ramped charge, a wall of red, blue and yellow light. Stylised, non-graphic. The aftermath: survivors in a grey wasteland standing before their idols. Quiet, haunting end.
*Handoff:* A cloud-robed figure descends from the horizon.

**S33 — The Mighty Angel and the Seven Thunders** · Rev 10:1–4
*Text:* Another mighty angel coming down from heaven, robed in a cloud with a rainbow above his head; his face like the sun, his legs like fiery pillars; in his hand a little scroll, open. He sets his right foot on the sea and his left on the land and shouts like a lion roaring; the voices of seven thunders speak. John is about to write, but a voice from heaven: "Seal up what the seven thunders have said and do not write it down."
*Look:* Colossal scale: camera starts at the angel's feet in the waves, then tilts up for several seconds. Rainbow halo. Seven thunder-strikes in a rhythm, with seven lightning columns. Then a hard cut to silence.
*Handoff:* The angel raises his hand to the sky.

**S34 — No More Delay** · Rev 10:5–7
*Text:* The angel raises his right hand to heaven and swears by Him who lives for ever and ever, who created the heavens, the earth and the sea: "There will be no more delay! But in the days when the seventh angel is about to sound his trumpet, the mystery of God will be accomplished, just as he announced to his servants the prophets."
*Look:* Hero low-angle against a sun-bright sky. Slow, solemn push-in on the raised hand. Creation imagery in the clouds (sky, earth, sea). Orchestral crescendo held to a single note.
*Handoff:* The little scroll in his other hand glows.

**S35 — Take It and Eat** · Rev 10:8–11
*Text:* The voice from heaven: go, take the scroll lying open in the hand of the angel. John asks for the little scroll; "Take it and eat it. It will turn your stomach sour, but in your mouth it will be as sweet as honey." He eats it; sweet as honey in his mouth, sour in his stomach. "You must prophesy again about many peoples, nations, languages and kings."
*Look:* Intimate close-ups, honey-gold light then a shift to cold, sour green. John's face lit from the scroll. A final zoom-out shows the world of nations spread before him.
*Handoff:* A measuring rod placed in John's hand.

**S36 — The Two Witnesses** · Rev 11:1–6
*Text:* John is given a reed like a measuring rod: measure the temple of God and the altar, and count the worshipers; exclude the outer court, given to the Gentiles, who will trample on the holy city for 42 months. "I will appoint my two witnesses, and they will prophesy for 1,260 days, clothed in sackcloth." They are the two olive trees and the two lampstands. Fire comes from their mouths; they have power to shut the heavens so no rain falls, to turn waters into blood, and to strike the earth with every kind of plague.
*Look:* The temple measured by lines of light; a crowd trampling in the outer court. Two figures in sackcloth standing in a city square, shot low and monumental. Fire-breath, drought-cracked land, red rivers.
*Handoff:* A dark shape rises from below the square.

**S37 — The Witnesses Fall** · Rev 11:7–10
*Text:* When they have finished their testimony, the beast that comes up from the Abyss attacks them, overpowers and kills them. Their bodies lie in the public square of the great city, figuratively called Sodom and Egypt, where also their Lord was crucified. For three and a half days, members of every people, tribe, language and nation gaze on their bodies and refuse them burial. The inhabitants of the earth gloat, celebrate and send each other gifts, because these two prophets had tormented them.
*Look:* Beast from the Abyss shown as shadow and silhouette only. Non-graphic. Sky-high shot over the great city, a celebration with crowds and lanterns. Cold, empty close-up on the still figures.
*Handoff:* Three and a half days pass: a faint light appears in the dead figures.

**S38 — Come Up Here** · Rev 11:11–14
*Text:* After the three and a half days, the breath of life from God enters them; they stand on their feet, and terror strikes those who see them. A loud voice from heaven: "Come up here." They go up to heaven in a cloud while their enemies look on. A severe earthquake; a tenth of the city collapses; 7,000 people killed. The survivors are terrified and give glory to the God of heaven. The second woe has passed; the third is coming soon.
*Look:* Breath-of-life moment in macro close-up, then a thrilling ascent as the camera follows them up through cloud. The crowd's horror in shock-cut reactions. City earthquake with heavy handheld shake.
*Handoff:* The heavens begin to sound.

**S39 — The Kingdom of Our Lord** · Rev 11:15–19
*Text:* Seventh trumpet: loud voices in heaven: "The kingdom of the world has become the kingdom of our Lord and of His Messiah, and He will reign for ever and ever." The twenty-four elders fall on their faces, giving thanks: the nations were angry, and your wrath has come; the time has come for judging the dead and rewarding Your servants. God's temple in heaven is opened and the ark of His covenant is seen; flashes of lightning, rumblings, thunder, an earthquake and a severe hailstorm.
*Look:* The Throne Theme returns in triumph. A shimmering shot of the open temple with the ark in golden light. Hail and lightning in a heaven-to-earth cut. Closes Part IV on majesty.
*Handoff:* A great sign appears in the sky.

---

### PART V — THE DRAGON & THE BEASTS

**S40 — The Woman and the Dragon** · Rev 12:1–6
*Text:* A great sign: a woman clothed with the sun, the moon under her feet, a crown of twelve stars on her head; pregnant, she cries out in pain of childbirth. Then another sign: an enormous red dragon with seven heads and ten horns and seven crowns on its heads; its tail sweeps a third of the stars from the sky and flings them to earth. The dragon stands before the woman to devour her child the moment it is born. She gives birth to a son, a male child, who will rule all the nations with an iron scepter; the child is snatched up to God and to His throne. The woman flees into the wilderness to a place prepared by God, to be taken care of for 1,260 days.
*Look:* Constellation-scale. Slow orbit around the woman (light-sculpted). Dragon revealed from behind the stars with massive scale, the tail sweeping stars away. Child's snatching-up in a quick, bright vertical camera whoosh.
*Handoff:* Cut to war: swords of light, wings.

**S41 — War in Heaven** · Rev 12:7–12
*Text:* War in heaven. Michael and his angels fight against the dragon; the dragon and his angels fight back, but they are not strong enough, and they lose their place in heaven. The great dragon is hurled down, that ancient serpent called the devil, or Satan, who leads the whole world astray, hurled to the earth with his angels. A loud voice: "Now have come the salvation and the power and the kingdom of our God... the accuser of our brothers and sisters... has been hurled down. They triumphed over him by the blood of the Lamb and by the word of their testimony." "Woe to the earth and the sea, because the devil has gone down to you! He is filled with fury, because he knows that his time is short."
*Look:* Fast, kinetic, sweeping camera; rolling aerial battle between light and red. Speed-ramps on impacts, the fall as a long vertical dolly-down, the dragon burning through the atmosphere. Slow-mo on "the blood of the Lamb."
*Handoff:* The dragon lands on the earth and looks for the woman.

**S42 — Wings of a Great Eagle** · Rev 12:13–17
*Text:* When the dragon saw that he had been hurled to the earth, he pursued the woman who had given birth to the male child. She was given the two wings of a great eagle, so that she might fly to the place prepared for her in the wilderness, where she would be taken care of for a time, times and half a time, out of the serpent's reach. The serpent spewed water like a river after her, to overtake her with the torrent; but the earth helped the woman by opening its mouth and swallowing the river. Enraged, the dragon went off to wage war against the rest of her offspring — those who keep God's commands and hold fast their testimony about Jesus. The dragon stood on the shore of the sea.
*Look:* High-speed chase: flowing river vs. desert canyon. Earth opens in slow-motion. Final shot: the dragon at the shoreline in silhouette; waves begin to churn.
*Handoff:* The sea parts and something rises.

**S43 — The Beast from the Sea** · Rev 13:1–4
*Text:* A beast coming out of the sea, with ten horns and seven heads, ten crowns on its horns, and on each head a blasphemous name. It looks like a leopard, with feet like a bear's and a mouth like a lion's. The dragon gives it his power and his throne and great authority. One of its heads seems to have had a fatal wound, but the fatal wound had been healed. The whole world is filled with wonder and follows the beast. People worship the dragon and the beast: "Who is like the beast? Who can wage war against it?"
*Look:* A rising beast silhouette from black water, lit from beneath with a dull red glow; low camera. Detail-of-wound shot: healing as pulsing red light. Crowds worshipping in giant, dizzying overhead shots.
*Handoff:* The beast's mouth opens.

**S44 — Forty-Two Months** · Rev 13:5–10
*Text:* The beast was given a mouth to utter proud words and blasphemies and to exercise its authority for forty-two months. It opens its mouth to blaspheme God, His name, His dwelling place and those who live in heaven. It is given power to wage war against God's holy people and to conquer them, and authority over every tribe, people, language and nation. All inhabitants of the earth will worship the beast — all whose names have not been written in the Lamb's book of life. Whoever has ears, let them hear. "This calls for patient endurance and faithfulness on the part of God's people."
*Look:* A claustrophobic, dark, imperial mood, dutch angles. Shadows swallowing the small light of faithful people. The Lamb's book of life glows in a counter-image. Closes on a defiant candle flame.
*Handoff:* A second creature rises from the land.

**S45 — The Beast from the Earth** · Rev 13:11–14
*Text:* Then another beast, coming out of the earth, with two horns like a lamb, but it spoke like a dragon. It exercises all the authority of the first beast on its behalf and makes the earth and its inhabitants worship the first beast, whose fatal wound was healed. It performs great signs, even causing fire to come down from heaven to the earth in full view of everyone. It deceives the inhabitants of the earth; it ordered them to set up an image in honor of the beast who was wounded by the sword and yet lived.
*Look:* Contrast: lamb-like exterior, dragon-voice, with an unsettling audio treatment. Fire falling from the sky as a crowd gasps. A giant image of the beast constructed in a vast plaza, with a tracking crane shot.
*Handoff:* The image's eyes begin to glow.

**S46 — The Mark and the Number** · Rev 13:15–18
*Text:* The second beast is given power to give breath to the image so that it can speak and cause all who refuse to worship the image to be killed. It also forces all people, great and small, rich and poor, free and slave, to receive a mark on their right hands or on their foreheads, so that they cannot buy or sell unless they have the mark, which is the name of the beast or the number of its name. "This calls for wisdom. Let the one who has understanding calculate the number of the beast, for it is the number of a man. That number is 666."
*Look:* Marketplace in a heavy, controlled palette. Hands and foreheads receiving a glowing mark (symbolic, never gory). Doors closing on those without the mark. Number appears on screen as a large cold-light glyph.
*Handoff:* A bright flash on a distant mountain.

**S47 — The Lamb on Mount Zion** · Rev 14:1–5
*Text:* The Lamb standing on Mount Zion, and with him 144,000 who had His name and His Father's name written on their foreheads. A sound from heaven like the roar of rushing waters and a loud peal of thunder, like harpists playing. They sing a new song before the throne, the four living creatures and the elders; no one could learn the song except the 144,000 who had been redeemed from the earth. They follow the Lamb wherever He goes; they were purchased from among mankind as firstfruits to God and the Lamb; no lie was found in their mouths; they are blameless.
*Look:* A glorious, ordered shot after the dark chapter. Sunrise on Zion. Gentle rotating camera. Singing as pure harmonic layers. Names on foreheads shine.
*Handoff:* An angel flies overhead.

**S48 — Fallen Is Babylon** · Rev 14:6–8
*Text:* Another angel flying in midair, with the eternal gospel to proclaim to those who live on the earth — to every nation, tribe, language and people. "Fear God and give Him glory, because the hour of His judgment has come. Worship Him who made the heavens, the earth, the sea and the springs of water." A second angel follows: "Fallen! Fallen is Babylon the Great, which made all the nations drink the maddening wine of her adulteries."
*Look:* A long high-altitude tracking shot following the angel's flight across continents. The second angel's proclamation echoes through the cloud tops. A glimpse of a glittering city beginning to crack.
*Handoff:* A third angel arrives with a more severe voice.

**S49 — The Cup of God's Wrath; Blessed Are the Dead** · Rev 14:9–13
*Text:* A third angel: "If anyone worships the beast and its image and receives its mark on their forehead or on their hand, they, too, will drink the wine of God's fury... They will be tormented with burning sulfur in the presence of the holy angels and of the Lamb. And the smoke of their torment will rise for ever and ever. There will be no rest day or night." This calls for patient endurance on the part of the people of God who keep His commands and remain faithful to Jesus. A voice from heaven: "Write this: Blessed are the dead who die in the Lord from now on." "Yes," says the Spirit, "they will rest from their labor, for their deeds will follow them."
*Look:* Stern, controlled, no gore. Smoke imagery handled in silhouette and sound. A strong tonal turn to comfort: white light and a quiet, gentle conclusion for the faithful.
*Handoff:* A white cloud appears.

**S50 — The Harvest of the Earth** · Rev 14:14–20
*Text:* A white cloud, and seated on it, one like a son of man with a crown of gold on His head and a sharp sickle in His hand. Another angel from the temple: "Take your sickle and reap, because the harvest of the earth is ripe." He swings His sickle and the earth is harvested. Another angel from the temple has a sharp sickle; another from the altar who has charge of the fire: "Take your sharp sickle and gather the clusters of grapes from the earth's vine, because its grapes are ripe." The grapes are thrown into the great winepress of God's wrath. They are trampled outside the city, and blood flows out of the press, rising as high as the horses' bridles for a distance of 1,600 stadia.
*Look:* Harvest: a golden grainfield ripple, cinematic light. Then the grape harvest in a dark red palette. Stylised: the "blood" reads as a crimson river of light, non-graphic. A slow aerial pull-back on the vast flood.
*Handoff:* New sign in heaven.

---

### PART VI — THE SEVEN BOWLS

**S51 — The Song of Moses and of the Lamb** · Rev 15:1–4
*Text:* Another great and marvelous sign in heaven: seven angels with the seven last plagues, last because with them God's wrath is completed. Something like a sea of glass glowing with fire, and standing beside it, those who had been victorious over the beast and its image and over the number of its name. They hold harps and sing the song of Moses, the servant of God, and of the Lamb: "Great and marvelous are your deeds, Lord God Almighty. Just and true are your ways, King of the nations. Who will not fear you, Lord, and bring glory to your name? ... All nations will come and worship before you, for your righteous acts have been revealed."
*Look:* Fire-lit glass sea: reflective turquoise and orange. Choir in perfect symmetry. Slow orbital with the seven angels visible in the background.
*Handoff:* The temple of the tabernacle opens.

**S52 — The Seven Golden Bowls** · Rev 15:5–8
*Text:* The temple, that is, the tabernacle of the covenant law, in heaven is opened. Out of it come the seven angels with the seven plagues, dressed in clean, shining linen with golden sashes around their chests. One of the four living creatures gives to the seven angels seven golden bowls filled with the wrath of God, who lives for ever and ever. The temple is filled with smoke from the glory of God and from His power, and no one can enter until the seven plagues of the seven angels are completed.
*Look:* Symmetrical dolly-in on seven angels. Gold bowls handed one by one. Smoke fills the frame, dimming to near-white. Quiet before the storm. All of Part VI is built on a "pour" motif: a camera tilt-down on each bowl.
*Handoff:* A voice from the temple commands: Go.

**S53 — Bowls One, Two, Three** · Rev 16:1–7
*Text:* A loud voice from the temple: "Go, pour out the seven bowls of God's wrath on the earth." First: ugly and painful sores break out on the people who have the mark of the beast and worshiped its image. Second: the sea turns into blood like that of a dead person, and every living thing in the sea dies. Third: rivers and springs turn to blood. The angel in charge of the waters: "You are just in these judgments, you who are and who were, the Holy One..." And the altar: "Yes, Lord God Almighty, true and just are your judgments."
*Look:* Each bowl gets a distinct visual signature. Fast montage: sores represented with symbolic sigils, then the sea reddening in an aerial, the river turning in a macro shot. A voice in awe-struck calm on "true and just."
*Handoff:* The sun grows fierce.

**S54 — Bowls Four and Five** · Rev 16:8–11
*Text:* Fourth: the sun is allowed to scorch people with fire; they are seared by the intense heat and curse the name of God, who has control over these plagues, but they refuse to repent and glorify Him. Fifth: the throne of the beast and its kingdom are plunged into darkness; people gnaw their tongues in agony and curse the God of heaven because of their pains and their sores, but refuse to repent of what they have done.
*Look:* Overexposed, blown-out whites on a scorched landscape, heat distortion. Then the total opposite: black, with only dull torches. Camera is tight, shaky, claustrophobic.
*Handoff:* A great river, lower than ever.

**S55 — Armageddon** · Rev 16:12–16
*Text:* Sixth: the great river Euphrates, its water dried up to prepare the way for the kings from the East. Three impure spirits that look like frogs come out of the mouths of the dragon, the beast and the false prophet. They are demonic spirits that perform signs, and they go out to the kings of the whole world to gather them for battle on the great day of God Almighty. "Look, I come like a thief! Blessed is the one who stays awake and remains clothed, so as not to go naked and be shamefully exposed." Then they gather the kings together to the place that in Hebrew is called Armageddon.
*Look:* Dry riverbed under a blood-orange sky. Three green-tinted spirits drift out of three mouths as smoke-forms. Aerial map-style shot as armies flood into the plain. Light "interruption" for "like a thief."
*Handoff:* All is quiet. The last bowl rises.

**S56 — It Is Done!** · Rev 16:17–21
*Text:* Seventh: poured into the air; a loud voice from the throne in the temple: "It is done!" Flashes of lightning, rumblings, peals of thunder, and a severe earthquake — such as there had never been since mankind has been on earth. The great city split into three parts, and the cities of the nations collapsed. God remembered Babylon the Great and gave her the cup filled with the wine of the fury of His wrath. Every island fled and the mountains could not be found. From the sky huge hailstones, each weighing about a hundred pounds, fell on people. And they cursed God on account of the plague of hail, because the plague was so terrible.
*Look:* The first line is spoken in a hush, then the biggest sequence of the series: city splitting, mountains sinking into the sea, enormous hail in slow-mo with a handheld camera. A full-score crescendo to a hard cut-to-black. Closes Part VI.
*Handoff:* From the dust, a quiet angel's voice.

---

### PART VII — THE FALL OF BABYLON

**S57 — Mystery, Babylon the Great** · Rev 17:1–6
*Text:* One of the seven angels with the seven bowls: "Come, I will show you the punishment of the great prostitute, who sits by many waters. With her the kings of the earth committed adultery." John is carried away in the Spirit into a wilderness; he sees a woman sitting on a scarlet beast covered with blasphemous names, with seven heads and ten horns. She is dressed in purple and scarlet, glittering with gold, precious stones and pearls, holding a golden cup filled with abominable things. On her forehead: MYSTERY, BABYLON THE GREAT, THE MOTHER OF PROSTITUTES AND OF THE ABOMINATIONS OF THE EARTH. She is drunk with the blood of God's holy people and of those who bore testimony to Jesus. When John sees her, he is greatly astonished.
*Look:* Opulent, decadent visual language (scarlet, purple, gold). Her presentation is regal, imperious, entirely non-sexual, symbolic. Slow dolly past a golden cup. John in the foreground, awestruck.
*Handoff:* The angel asks: "Why are you astonished?"

**S58 — The Beast That Was, Is Not, and Will Come** · Rev 17:7–14
*Text:* The angel will explain the mystery of the woman and the beast: the beast "once was, now is not, and yet will come up out of the Abyss and go to its destruction." The seven heads are seven hills on which the woman sits; they are also seven kings: five have fallen, one is, the other has not yet come. The ten horns are ten kings who have not yet received a kingdom, but who for one hour will receive authority as kings along with the beast. They have one purpose and will give their power and authority to the beast. They will wage war against the Lamb, but the Lamb will triumph over them because He is Lord of lords and King of kings — and with Him will be His called, chosen and faithful followers.
*Look:* Diagram-style explanatory visuals built from the text only (hills, crowns, kings in a line). A "ghosted" beast. Closing shot: a calm, still Lamb in a field of light facing a dark army.
*Handoff:* The waters rise around the woman.

**S59 — The Waters and the City** · Rev 17:15–18
*Text:* The waters you saw, where the prostitute sits, are peoples, multitudes, nations and languages. The beast and the ten horns will hate the prostitute; they will bring her to ruin and leave her naked; they will eat her flesh and burn her with fire. For God has put it into their hearts to accomplish His purpose by agreeing to hand over to the beast their royal authority, until God's words are fulfilled. The woman you saw is the great city that rules over the kings of the earth.
*Look:* Aerial over an ocean of faces (a sea of people). The city's glittering skyline cracks from the inside. Non-graphic, symbolic; flame-tinted dusk. The great city shown as a dazzling metropolis.
*Handoff:* An angel's light dazzles over the city.

**S60 — Come Out of Her, My People** · Rev 18:1–8
*Text:* Another angel coming down from heaven with great authority; the earth is illuminated by his splendor. "Fallen! Fallen is Babylon the Great! She has become a dwelling for demons and a haunt for every impure spirit..." All nations have drunk the maddening wine of her adulteries; the kings of the earth committed adultery with her; the merchants grew rich from her excessive luxuries. Another voice from heaven: "Come out of her, my people, so that you will not share in her sins... for her sins are piled up to heaven, and God has remembered her crimes. Give back to her as she has given... Therefore in one day her plagues will overtake her: death, mourning and famine. She will be consumed by fire, for mighty is the Lord God who judges her."
*Look:* The great angel's descent illuminating the whole city in glorious light that exposes the rot behind its beauty (golden facade, cracked foundation). A line of people walking out of the city gates in a long, powerful tracking shot.
*Handoff:* Smoke begins on the horizon.

**S61 — The Kings and Merchants Weep** · Rev 18:9–14
*Text:* The kings of the earth who committed adultery with her and shared her luxury will weep and mourn over her when they see the smoke of her burning. Terrified at her torment, they stand far off and cry: "Woe! Woe, you great city, you mighty city of Babylon! In one hour your doom has come!" The merchants of the earth will weep and mourn over her because no one buys their cargoes any more: cargoes of gold, silver, precious stones and pearls; fine linen, purple, silk and scarlet cloth; every sort of citron wood, articles of ivory, costly wood, bronze, iron and marble; cinnamon and spice, incense, myrrh and frankincense, wine and olive oil, fine flour and wheat; cattle and sheep; horses and carriages; and human beings, bodies and souls. "The fruit you longed for is gone from you. All your luxury and splendor have vanished, never to be recovered."
*Look:* A cargo parade in rich visual detail (each item shown in a rapid, beautifully lit montage). Kings in silhouette against a burning skyline. Quiet, thoughtful, melancholic score.
*Handoff:* Ships appear on the horizon.

**S62 — Rejoice Over Her, You Heavens** · Rev 18:15–20
*Text:* The merchants who sold these things and gained their wealth from her will stand far off, terrified at her torment, weeping and mourning: "Woe! Woe, you great city, dressed in fine linen, purple and scarlet, and glittering with gold, precious stones and pearls! In one hour such great wealth has been brought to ruin!" Every sea captain, all who travel by ship, the sailors, and all who earn their living from the sea stand far off. They throw dust on their heads and cry out, weeping and mourning: "Woe! Woe, you great city! Where all who had ships on the sea became rich through her wealth! In one hour she has been brought to ruin!" "Rejoice over her, you heavens! Rejoice, you saints and apostles and prophets! God has judged her for the way she treated you."
*Look:* A harbour in firelight; ships in silhouette, sailors throwing dust. Shift to heaven: a brief, unexpected burst of joyful light. The contrast between grief below and rejoicing above.
*Handoff:* A mighty angel lifts a boulder.

**S63 — The Millstone** · Rev 18:21–24
*Text:* A mighty angel picks up a boulder the size of a large millstone and throws it into the sea: "With such violence the great city of Babylon will be thrown down, never to be found again." The music of harpists and musicians, flute players and trumpeters, will never be heard in you again. No worker of any trade will ever be found in you again. The sound of a millstone will never be heard in you again. The light of a lamp will never shine in you again. The voice of bridegroom and bride will never be heard in you again. Your merchants were the world's important people. By your magic spell all the nations were led astray. In her was found the blood of the prophets and of God's holy people, of all who have been slaughtered on the earth.
*Look:* The great stone falling in slow-mo, a massive splash. Then, one by one, the "no more" lines: light, music, voices, each fading as its sound is removed from the soundtrack until only silence. The whole city beneath the waves.
*Handoff:* A far-off roar from heaven.

---

### PART VIII — THE RETURN OF THE KING

**S64 — Hallelujah!** · Rev 19:1–5
*Text:* After this, John hears what sounds like the roar of a great multitude in heaven shouting: "Hallelujah! Salvation and glory and power belong to our God, for true and just are His judgments. He has condemned the great prostitute who corrupted the earth by her adulteries. He has avenged on her the blood of His servants." And again: "Hallelujah! The smoke from her goes up for ever and ever." The twenty-four elders and the four living creatures fall down and worship God, saying: "Amen, Hallelujah!" A voice from the throne: "Praise our God, all you His servants, you who fear Him, both great and small!"
*Look:* The major-key return of the Throne Theme. A joyful, ascending camera. Light, colour, relief. A burst of gold and white after Part VII's ashen grey.
*Handoff:* The roar becomes thunder.

**S65 — The Wedding Supper of the Lamb** · Rev 19:6–10
*Text:* The sound of a great multitude, like the roar of rushing waters and like loud peals of thunder: "Hallelujah! For our Lord God Almighty reigns. Let us rejoice and be glad and give Him glory! For the wedding of the Lamb has come, and His bride has made herself ready. Fine linen, bright and clean, was given her to wear." (Fine linen stands for the righteous acts of God's holy people.) "Blessed are those who are invited to the wedding supper of the Lamb!" John falls at his feet to worship him, but he says: "Don't do that! I am a fellow servant with you and with your brothers and sisters who hold to the testimony of Jesus. Worship God! For it is the Spirit of prophecy who bears testimony to Jesus."
*Look:* A banquet hall of light beyond measure; long table, warm candle-gold. The bride in radiant white linen, silhouette only. John kneeling; the angel's raised hand. Tender and grand.
*Handoff:* The heavens split open.

**S66 — Faithful and True** · Rev 19:11–16
*Text:* Heaven standing open; and there before John is a white horse, whose rider is called Faithful and True. With justice He judges and wages war. His eyes are like blazing fire, and on His head are many crowns. He has a name written on Him that no one knows but He Himself. He is dressed in a robe dipped in blood, and His name is the Word of God. The armies of heaven are following Him, riding on white horses and dressed in fine linen, white and clean. Coming out of His mouth is a sharp sword with which to strike down the nations. "He will rule them with an iron scepter." He treads the winepress of the fury of the wrath of God Almighty. On His robe and on His thigh He has this name written: KING OF KINGS AND LORD OF LORDS.
*Look:* The series' hero moment. Sky splitting from the top of the frame downwards; the rider emerges in a long low-angle push-in, face lost in blinding light. An epic charge of white horses. Peak score: all themes combined. The final title glyph.
*Handoff:* Cut to an angel standing in the sun.

**S67 — The Great Supper of God** · Rev 19:17–21
*Text:* An angel standing in the sun, calling in a loud voice to all the birds flying in midair: "Come, gather together for the great supper of God, so that you may eat the flesh of kings, generals, and the mighty..." The beast and the kings of the earth and their armies gathered together to wage war against the rider on the horse and His army. The beast is captured, along with the false prophet who had performed signs on its behalf. The two of them are thrown alive into the fiery lake of burning sulfur. The rest are killed with the sword coming out of the mouth of the rider, and all the birds gorge themselves on their flesh.
*Look:* The final battle as a vast, sweeping tableau, handled symbolically: silhouettes, light, shockwave, with no gore. A fiery lake glimpsed as a vast, boiling glow. The sword's single sweep ends the war in one shot.
*Handoff:* An angel carrying a chain descends.

---

### PART IX — THE THOUSAND YEARS & THE JUDGMENT

**S68 — The Dragon Bound** · Rev 20:1–3
*Text:* An angel coming down out of heaven, having the key to the Abyss and holding in his hand a great chain. He seizes the dragon, that ancient serpent, who is the devil, or Satan, and binds him for a thousand years. He throws him into the Abyss, and locks and seals it over him, to keep him from deceiving the nations anymore until the thousand years were ended. After that, he must be set free for a short time.
*Look:* Steel-grey, heavy. Giant chains in close-up, coiling; the dragon dragged down, shrinking. The seal closing: a massive wax-and-stone seal, one clean sound.
*Handoff:* Thrones in a quiet, gold light.

**S69 — The Thousand Years** · Rev 20:4–6
*Text:* Thrones on which were seated those who had been given authority to judge. John sees the souls of those who had been beheaded because of their testimony about Jesus and because of the word of God. They had not worshiped the beast or its image and had not received its mark on their foreheads or their hands. They came to life and reigned with Christ a thousand years. (The rest of the dead did not come to life until the thousand years were ended.) This is the first resurrection. Blessed and holy are those who share in the first resurrection. The second death has no power over them, but they will be priests of God and of Christ and will reign with Him for a thousand years.
*Look:* Calm, expansive. Camera glides through thrones; souls rising into life (light taking human form). Non-graphic: the "beheaded" element is conveyed by the text only, with no depiction. A long, peaceful, sunrise-lit sequence.
*Handoff:* A thousand years pass in a time-lapse sky.

**S70 — Gog and Magog; the Final Defeat** · Rev 20:7–10
*Text:* When the thousand years are over, Satan will be released from his prison and will go out to deceive the nations in the four corners of the earth — Gog and Magog — to gather them for battle. In number they are like the sand on the seashore. They marched across the breadth of the earth and surrounded the camp of God's people, the city He loves. But fire came down from heaven and devoured them. And the devil, who deceived them, was thrown into the lake of burning sulfur, where the beast and the false prophet had been thrown. They will be tormented day and night for ever and ever.
*Look:* Sand-grain-scale armies as a particle ocean surrounding a small glowing city. Fire from the sky as a single clean descending column. A brief and decisive ending, followed by quiet.
*Handoff:* A vast white light appears in the sky.

**S71 — The Great White Throne** · Rev 20:11–15
*Text:* A great white throne and Him who was seated on it. The earth and the heavens fled from His presence, and there was no place for them. The dead, great and small, standing before the throne, and books opened. Another book was opened, which is the book of life. The dead were judged according to what they had done as recorded in the books. The sea gave up the dead that were in it, and death and Hades gave up the dead that were in them, and each person was judged according to what they had done. Then death and Hades were thrown into the lake of fire. The lake of fire is the second death. Anyone whose name was not found written in the book of life was thrown into the lake of fire.
*Look:* Stark and monumental: nothing but white, a great throne, black void. Earth and sky dissolving in a long, uninterrupted shot. A vast hall of standing figures (silhouette). Books opening. Solemn, quiet, reverent; one of the most powerful episodes.
*Handoff:* The white light softens, and a new sky opens.

---

### PART X — ALL THINGS NEW

**S72 — A New Heaven and a New Earth** · Rev 21:1–4
*Text:* A new heaven and a new earth, for the first heaven and the first earth had passed away, and there was no longer any sea. John sees the Holy City, the new Jerusalem, coming down out of heaven from God, prepared as a bride beautifully dressed for her husband. A loud voice from the throne: "Look! God's dwelling place is now among the people, and He will dwell with them. They will be His people, and God Himself will be with them and be their God. 'He will wipe every tear from their eyes. There will be no more death or mourning or crying or pain, for the old order of things has passed away.'"
*Look:* A beautiful, hopeful opening: a new dawn over a new world; green, light, water-free horizon. City descends like a jewel of light. Close-up on a tear being wiped. The warmest palette of the series so far.
*Handoff:* The voice speaks again from the throne.

**S73 — I Am Making Everything New** · Rev 21:5–8
*Text:* "I am making everything new!" Then He says, "Write this down, for these words are trustworthy and true." "It is done. I am the Alpha and the Omega, the Beginning and the End. To the thirsty I will give water without cost from the spring of the water of life. Those who are victorious will inherit all this, and I will be their God and they will be My children. But the cowardly, the unbelieving, the vile, the murderers, the sexually immoral, those who practice magic arts, the idolaters and all liars — they will be consigned to the fiery lake of burning sulfur. This is the second death."
*Look:* The big, central "Alpha and Omega" moment, echoing Episode 2 with matching framing. A spring of water of life bursting up. A softer, sober, un-graphic handling of the closing lines: a distant, darker horizon only.
*Handoff:* One of the seven bowl-angels speaks.

**S74 — The Bride, the City** · Rev 21:9–14
*Text:* One of the seven angels who had the seven bowls: "Come, I will show you the bride, the wife of the Lamb." He carries John in the Spirit to a mountain great and high and shows him the Holy City, Jerusalem, coming down out of heaven from God. It shines with the glory of God, and its brilliance is like that of a very precious jewel, like a jasper, clear as crystal. It has a great, high wall with twelve gates, and with twelve angels at the gates. On the gates are written the names of the twelve tribes of Israel. There are three gates on the east, three on the north, three on the south and three on the west. The wall of the city has twelve foundations, and on them are the names of the twelve apostles of the Lamb.
*Look:* Mountaintop reveal: crane up from John to the city filling the horizon. Facets of crystal-clear light. Slow orbit of the 12 gates, each with its tribe-name glowing. Layers of golden mist.
*Handoff:* The angel lifts a golden measuring rod.

**S75 — Pure Gold, Like Glass** · Rev 21:15–21
*Text:* The angel who talked with John has a measuring rod of gold to measure the city, its gates and its walls. The city is laid out like a square, as long as it is wide. He measures the city with the rod: 12,000 stadia in length, and as wide and high as it is long. He measures the wall: 144 cubits thick, by human measurement, which the angel was using. The wall is made of jasper, and the city of pure gold, as pure as glass. The foundations of the city walls are decorated with every kind of precious stone. The twelve gates are twelve pearls, each gate made of a single pearl. The great street of the city is of gold, as pure as transparent glass.
*Look:* Clean, precise geometry: a measuring-rod line passing across the glowing structure, with measurements unfolding. Twelve foundations shown as the stones named in the text, in order. A single pearl gate in macro, then a long glide down the golden street.
*Handoff:* The camera reaches the centre of the city, and there is no temple.

**S76 — No Temple, No Night** · Rev 21:22–27
*Text:* John does not see a temple in the city, because the Lord God Almighty and the Lamb are its temple. The city does not need the sun or the moon to shine on it, for the glory of God gives it light, and the Lamb is its lamp. The nations will walk by its light, and the kings of the earth will bring their splendor into it. On no day will its gates ever be shut, for there will be no night there. The glory and honor of the nations will be brought into it. Nothing impure will ever enter it, nor will anyone who does what is shameful or deceitful, but only those whose names are written in the Lamb's book of life.
*Look:* No sun in the sky: all the light now comes from within. Daylight-white and gold, no shadows. Gates open in a wide, welcoming shot. Peoples walking in from every direction. The Book of Life as a final glimpse.
*Handoff:* A river of crystal begins to flow.

**S77 — The River of Life** · Rev 22:1–5
*Text:* The angel shows John the river of the water of life, as clear as crystal, flowing from the throne of God and of the Lamb down the middle of the great street of the city. On each side of the river stands the tree of life, bearing twelve crops of fruit, yielding its fruit every month. The leaves of the tree are for the healing of the nations. No longer will there be any curse. The throne of God and of the Lamb will be in the city, and His servants will serve Him. They will see His face, and His name will be on their foreheads. There will be no more night. They will not need the light of a lamp or the light of the sun, for the Lord God will give them light. And they will reign for ever and ever.
*Look:* A long, graceful aerial follow of the river from the throne through the city. The tree of life: slow macro on leaves and fruit. The camera reaches the throne and sees "the face" as pure light. A visual echo of Episode 6's tree of life, completing the arc.
*Handoff:* The angel speaks, in a clear and close voice.

**S78 — These Words Are Trustworthy and True** · Rev 22:6–11
*Text:* The angel says to John: "These words are trustworthy and true. The Lord, the God who inspires the prophets, sent His angel to show His servants the things that must soon take place." "Look, I am coming soon! Blessed is the one who keeps the words of the prophecy written in this scroll." John, who heard and saw these things, falls down to worship at the feet of the angel. But he says: "Don't do that! I am a fellow servant with you and with your fellow prophets and with all who keep the words of this scroll. Worship God!" Then he tells him: "Do not seal up the words of the prophecy of this scroll, because the time is near." (Followed by the statement about the evildoer, the vile, the righteous and the holy, as in the supplied WEB text, Rev 22:11.)
*Look:* Intimate; John and the angel framed in warm daylight. A callback to Ep 65 (the same blocking and posture). The scroll is unsealed: seven wax seals falling away one by one in a callback to Part III. Calm, sincere, direct.
*Handoff:* The voice shifts to a personal tone: "Look, I am coming soon!"

**S79 — The Spirit and the Bride Say, "Come!"** · Rev 22:12–17
*Text:* "Look, I am coming soon! My reward is with me, and I will give to each person according to what they have done. I am the Alpha and the Omega, the First and the Last, the Beginning and the End. Blessed are those who wash their robes, that they may have the right to the tree of life and may go through the gates into the city. Outside are the dogs, those who practice magic arts, the sexually immoral, the murderers, the idolaters and everyone who loves and practices falsehood. I, Jesus, have sent my angel to give you this testimony for the churches. I am the Root and the Offspring of David, and the bright Morning Star." The Spirit and the bride say, "Come!" And let the one who hears say, "Come!" Let the one who is thirsty come; and let the one who wishes take the free gift of the water of life.
*Look:* A massive, emotional gathering of everything: the Morning Star (callback to Ep 10), the lampstands (callback to Ep 4), the Lamb, the city, the throne. "Come!" echoed by many voices, shot as a wide, open-arms crane move. Ends with a tight close-up on water poured freely.
*Handoff:* A quiet, solemn voice speaks the final warning.

**S80 — Come, Lord Jesus** · Rev 22:18–21
*Text:* A warning to everyone who hears the words of the prophecy of this scroll: if anyone adds anything to them, God will add to that person the plagues described in this scroll. And if anyone takes words away from this scroll of prophecy, God will take away from that person any share in the tree of life and in the Holy City, which are described in this scroll. He who testifies to these things says, "Yes, I am coming soon." Amen. Come, Lord Jesus. The grace of the Lord Jesus be with God's people. Amen.
*Look:* The finale. The camera returns to the Patmos cliff where it all began (the exact framing of Ep 1), John sitting, the scroll finished and rolled in his hands. Slow, quiet crane up and away: island, sea, Earth, stars — the Ep 1 opening in reverse. The word "Amen" on the final hush. Fade to black. Credits: *"Revelation — WEB"*.
*Handoff:* END.

---

## 10. VERSE COVERAGE MAP (final numbering: every verse appears exactly once)

| Chapter | Episodes (verses) |
|---|---|
| 1 | 1 (1-3), 2 (4-8), 3 (9-11), 4 (12-16), 5 (17-20) |
| 2 | 6 (1-7), 7 (8-11), 8 (12-17), 9 (18-23), 10 (24-29) |
| 3 | 11 (1-6), 12 (7-9), 13 (10-13), 14 (14-19), 15 (20-22) |
| 4 | 16 (1-5), 17 (6-11) |
| 5 | 18 (1-5), 19 (6-10), 20 (11-14) |
| 6 | 21 (1-4), 22 (5-8), 23 (9-11), 24 (12-14), 25 (15-17) |
| 7 | 26 (1-3), 27 (4-8), 28 (9-12), 29 (13-17) |
| 8 | 30 (1-6), 31 (7-9), 32 (10-13) |
| 9 | 33 (1-6), 34 (7-12), 35 (13-16), 36 (17-21) |
| 10 | 37 (1-4), 38 (5-7), 39 (8-11) |
| 11 | 40 (1-2), 41 (3-6), 42 (7-10), 43 (11-14), 44 (15-19) |
| 12 | 45 (1-2), 46 (3-6), 47 (7-9), 48 (10-12), 49 (13-17) |
| 13 | 50 (1-4), 51 (5-10), 52 (11-14), 53 (15-18) |
| 14 | 54 (1-5), 55 (6-8), 56 (9-11), 57 (12-13), 58 (14-16), 59 (17-20) |
| 15 | 60 (1-4), 61 (5-8) |
| 16 | 62 (1-3), 63 (4-7), 64 (8-11), 65 (12-16), 66 (17-21) |
| 17 | 67 (1-2), 68 (3-6), 69 (7-11), 70 (12-14), 71 (15-18) |
| 18 | 72 (1-3), 73 (4-8), 74 (9-10), 75 (11-14), 76 (15-17), 77 (18-20), 78 (21-24) |
| 19 | 79 (1-5), 80 (6-8), 81 (9-10), 82 (11-13), 83 (14-16), 84 (17-18), 85 (19-21) |
| 20 | 86 (1-3), 87 (4-6), 88 (7-10), 89 (11-15) |
| 21 | 90 (1-4), 91 (5-8), 92 (9-11), 93 (12-14), 94 (15-17), 95 (18-21), 96 (22-27) |
| 22 | 97 (1-5), 98 (6-7), 99 (8-11), 100 (12-15), 101 (16-17), 102 (18-21) |

---

## 11. DECISIONS LOG

**Build status (after Revision 3):**
- Episode 1 *The Unveiling*: **built in pixel style** (`px-001.js`); legacy 3D cut kept.
- Episodes 2, 3 and 4 (*Grace and Peace*, *On the Lord's Day*, *One Like a Son of Man*): **built in pixel style** (`px-002.js`, `px-003.js`, `px-004.js`). Episode 5 *Do Not Be Afraid*: 3D only. **Next job: rebuild 5 in pixel style**, keeping verses, cues, timing, score and handoffs.
- Episodes 6–9 are built (`px-006.js` to `px-009.js`). Episodes 10–102: outlined, not started, pixel style only.

**Revision 3 log:** the 3D look was dropped because it did not look right; Episode 1's pixel cut became the series reference (Section 5A). 3D pieces that already exist (e.g. the 3D lampstand, Christ figure, keys and city lights from Eps 3–5) are not reused directly: redraw them as pixel pieces in `px-lib.js` while converting those episodes.

**Run-time check (from the real WEB text):** at a natural pace of ~2.5 words/second, 13 episodes carry more than 150 words and will run past 60 seconds unless split or given a longer duration: Ep 6, 8, 9, 11, 17, 19, 32, 33, 36, 44, 54, 69, 78. Ep 2 (150 words) was given a 72-second duration. Decide per episode: allow ~65–80s, or split.

All 10 original questions are answered (see Section 0). Still open (small): the GitHub repository name, and whether you want the studio sting on every episode or only Episode 1 (default: **Episode 1 only**; later episodes open with a short title card).

---

## 12. MASTER EPISODE INDEX (FINAL NUMBERING: 102 EPISODES)

> **Style and status:** every episode is pixel art. Eps 1–9 = pixel done (Eps 2–5 were rebuilt from 3D; Eps 6–9 are pixel-only). Eps 10–102 = not started; next is Ep 10 (Thyatira II, Rev 2:24–29). The *Data file* column below is the original 3D-era grouping; pixel episodes live in `px-###-###.js` files with the same 10-per-file grouping (Ep 1 currently sits alone in `px-001.js`).

| Ep | Part | Verses | Title | Source outline | Data file |
|---|---|---|---|---|---|
| 1 | I | 1:1-3 | The Unveiling | S1 | ep-001-010.js |
| 2 | I | 1:4-8 | Grace and Peace | S2 | ep-001-010.js |
| 3 | I | 1:9-11 | On the Lord's Day | S3 | ep-001-010.js |
| 4 | I | 1:12-16 | One Like a Son of Man | S4 | ep-001-010.js |
| 5 | I | 1:17-20 | Do Not Be Afraid | S5 | ep-001-010.js |
| 6 | I | 2:1-7 | Ephesus: The First Love | S6 | ep-001-010.js |
| 7 | I | 2:8-11 | Smyrna: Faithful Until Death | S7 | ep-001-010.js |
| 8 | I | 2:12-17 | Pergamum: The Throne of Satan | S8 | ep-001-010.js |
| 9 | I | 2:18-23 | Thyatira: Eyes Like Fire | S9 | ep-001-010.js |
| 10 | I | 2:24-29 | Thyatira: Hold On Until I Come | S10 | ep-001-010.js |
| 11 | I | 3:1-6 | Sardis: Wake Up! | S11 | ep-011-020.js |
| 12 | I | 3:7-9 | Philadelphia: The Open Door | S12 (Part A) | ep-011-020.js |
| 13 | I | 3:10-13 | Philadelphia: The Hour of Trial | S12 (Part B) | ep-011-020.js |
| 14 | I | 3:14-19 | Laodicea: Neither Hot nor Cold | S13 | ep-011-020.js |
| 15 | I | 3:20-22 | Behold, I Stand at the Door | S14 | ep-011-020.js |
| 16 | II | 4:1-5 | A Door Standing Open in Heaven | S15 | ep-011-020.js |
| 17 | II | 4:6-11 | Holy, Holy, Holy | S16 | ep-011-020.js |
| 18 | II | 5:1-5 | The Scroll Nobody Could Open | S17 | ep-011-020.js |
| 19 | II | 5:6-10 | The Lamb Who Was Slain | S18 | ep-011-020.js |
| 20 | II | 5:11-14 | Worthy Is the Lamb | S19 | ep-011-020.js |
| 21 | III | 6:1-4 | Come! The White Horse and the Red | S20 | ep-021-030.js |
| 22 | III | 6:5-8 | The Black Horse and the Pale Horse | S21 | ep-021-030.js |
| 23 | III | 6:9-11 | How Long, Sovereign Lord? | S22 | ep-021-030.js |
| 24 | III | 6:12-14 | The Sky Rolls Up | S23 (Part A) | ep-021-030.js |
| 25 | III | 6:15-17 | Who Can Withstand? | S23 (Part B) | ep-021-030.js |
| 26 | III | 7:1-3 | The Four Winds Held Back | S24 (Part A) | ep-021-030.js |
| 27 | III | 7:4-8 | The Twelve Tribes Sealed | S24 (Part B) | ep-021-030.js |
| 28 | III | 7:9-12 | A Great Multitude | S25 (Part A) | ep-021-030.js |
| 29 | III | 7:13-17 | Out of the Great Tribulation | S25 (Part B) | ep-021-030.js |
| 30 | III | 8:1-6 | Silence in Heaven | S26 | ep-021-030.js |
| 31 | IV | 8:7-9 | Hail and Fire; the Burning Mountain | S27 | ep-031-040.js |
| 32 | IV | 8:10-13 | Wormwood and the Darkened Sky | S28 | ep-031-040.js |
| 33 | IV | 9:1-6 | The Abyss Is Opened | S29 | ep-031-040.js |
| 34 | IV | 9:7-12 | Abaddon | S30 | ep-031-040.js |
| 35 | IV | 9:13-16 | Release the Four Angels | S31 | ep-031-040.js |
| 36 | IV | 9:17-21 | Fire, Smoke and Sulfur | S32 | ep-031-040.js |
| 37 | IV | 10:1-4 | The Mighty Angel and the Seven Thunders | S33 | ep-031-040.js |
| 38 | IV | 10:5-7 | No More Delay | S34 | ep-031-040.js |
| 39 | IV | 10:8-11 | Take It and Eat | S35 | ep-031-040.js |
| 40 | IV | 11:1-2 | Measure the Temple | S36 (Part A) | ep-031-040.js |
| 41 | IV | 11:3-6 | The Two Witnesses | S36 (Part B) | ep-041-050.js |
| 42 | IV | 11:7-10 | The Witnesses Fall | S37 | ep-041-050.js |
| 43 | IV | 11:11-14 | Come Up Here | S38 | ep-041-050.js |
| 44 | IV | 11:15-19 | The Kingdom of Our Lord | S39 | ep-041-050.js |
| 45 | V | 12:1-2 | A Woman Clothed with the Sun | S40 (Part A) | ep-041-050.js |
| 46 | V | 12:3-6 | The Enormous Red Dragon | S40 (Part B) | ep-041-050.js |
| 47 | V | 12:7-9 | War in Heaven | S41 (Part A) | ep-041-050.js |
| 48 | V | 12:10-12 | The Accuser Hurled Down | S41 (Part B) | ep-041-050.js |
| 49 | V | 12:13-17 | Wings of a Great Eagle | S42 | ep-041-050.js |
| 50 | V | 13:1-4 | The Beast from the Sea | S43 | ep-041-050.js |
| 51 | V | 13:5-10 | Forty-Two Months | S44 | ep-051-060.js |
| 52 | V | 13:11-14 | The Beast from the Earth | S45 | ep-051-060.js |
| 53 | V | 13:15-18 | The Mark and the Number | S46 | ep-051-060.js |
| 54 | V | 14:1-5 | The Lamb on Mount Zion | S47 | ep-051-060.js |
| 55 | V | 14:6-8 | Fallen Is Babylon | S48 | ep-051-060.js |
| 56 | V | 14:9-11 | The Cup of God's Wrath | S49 (Part A) | ep-051-060.js |
| 57 | V | 14:12-13 | Blessed Are the Dead | S49 (Part B) | ep-051-060.js |
| 58 | V | 14:14-16 | The Harvest of the Earth | S50 (Part A) | ep-051-060.js |
| 59 | V | 14:17-20 | The Great Winepress | S50 (Part B) | ep-051-060.js |
| 60 | VI | 15:1-4 | The Song of Moses and of the Lamb | S51 | ep-051-060.js |
| 61 | VI | 15:5-8 | The Seven Golden Bowls | S52 | ep-061-070.js |
| 62 | VI | 16:1-3 | The First Two Bowls | S53 (Part A) | ep-061-070.js |
| 63 | VI | 16:4-7 | The Third Bowl | S53 (Part B) | ep-061-070.js |
| 64 | VI | 16:8-11 | Bowls Four and Five | S54 | ep-061-070.js |
| 65 | VI | 16:12-16 | Armageddon | S55 | ep-061-070.js |
| 66 | VI | 16:17-21 | It Is Done! | S56 | ep-061-070.js |
| 67 | VII | 17:1-2 | Come, I Will Show You | S57 (Part A) | ep-061-070.js |
| 68 | VII | 17:3-6 | Mystery, Babylon the Great | S57 (Part B) | ep-061-070.js |
| 69 | VII | 17:7-11 | The Beast That Was and Is Not | S58 (Part A) | ep-061-070.js |
| 70 | VII | 17:12-14 | The Ten Kings and the Lamb | S58 (Part B) | ep-061-070.js |
| 71 | VII | 17:15-18 | The Waters and the City | S59 | ep-071-080.js |
| 72 | VII | 18:1-3 | Fallen! Fallen! | S60 (Part A) | ep-071-080.js |
| 73 | VII | 18:4-8 | Come Out of Her, My People | S60 (Part B) | ep-071-080.js |
| 74 | VII | 18:9-10 | The Kings Weep | S61 (Part A) | ep-071-080.js |
| 75 | VII | 18:11-14 | The Merchants Weep | S61 (Part B) | ep-071-080.js |
| 76 | VII | 18:15-17 | In One Hour | S62 (Part A) | ep-071-080.js |
| 77 | VII | 18:18-20 | Rejoice Over Her, You Heavens | S62 (Part B) | ep-071-080.js |
| 78 | VII | 18:21-24 | The Millstone | S63 | ep-071-080.js |
| 79 | VIII | 19:1-5 | Hallelujah! | S64 | ep-071-080.js |
| 80 | VIII | 19:6-8 | The Wedding of the Lamb | S65 (Part A) | ep-071-080.js |
| 81 | VIII | 19:9-10 | Blessed Are Those Invited | S65 (Part B) | ep-081-090.js |
| 82 | VIII | 19:11-13 | Faithful and True | S66 (Part A) | ep-081-090.js |
| 83 | VIII | 19:14-16 | King of Kings and Lord of Lords | S66 (Part B) | ep-081-090.js |
| 84 | VIII | 19:17-18 | The Great Supper of God | S67 (Part A) | ep-081-090.js |
| 85 | VIII | 19:19-21 | The Beast Is Captured | S67 (Part B) | ep-081-090.js |
| 86 | IX | 20:1-3 | The Dragon Bound | S68 | ep-081-090.js |
| 87 | IX | 20:4-6 | The Thousand Years | S69 | ep-081-090.js |
| 88 | IX | 20:7-10 | Gog and Magog | S70 | ep-081-090.js |
| 89 | IX | 20:11-15 | The Great White Throne | S71 | ep-081-090.js |
| 90 | X | 21:1-4 | A New Heaven and a New Earth | S72 | ep-081-090.js |
| 91 | X | 21:5-8 | I Am Making Everything New | S73 | ep-091-100.js |
| 92 | X | 21:9-11 | The Bride, the City | S74 (Part A) | ep-091-100.js |
| 93 | X | 21:12-14 | Twelve Gates, Twelve Foundations | S74 (Part B) | ep-091-100.js |
| 94 | X | 21:15-17 | The Measure of the City | S75 (Part A) | ep-091-100.js |
| 95 | X | 21:18-21 | Pure Gold, Like Glass | S75 (Part B) | ep-091-100.js |
| 96 | X | 21:22-27 | No Temple, No Night | S76 | ep-091-100.js |
| 97 | X | 22:1-5 | The River of Life | S77 | ep-091-100.js |
| 98 | X | 22:6-7 | These Words Are Trustworthy and True | S78 (Part A) | ep-091-100.js |
| 99 | X | 22:8-11 | Worship God! | S78 (Part B) | ep-091-100.js |
| 100 | X | 22:12-15 | I Am Coming Soon | S79 (Part A) | ep-091-100.js |
| 101 | X | 22:16-17 | The Spirit and the Bride Say, Come! | S79 (Part B) | ep-101-102.js |
| 102 | X | 22:18-21 | Come, Lord Jesus | S80 | ep-101-102.js |

---

*Next step: paste WEB text into `js/scripture-web.js`, then say "Build Episode 2".*
