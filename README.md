# REVELATION — An Aurabot Project animated series

Cinematic, code-built animation of the Book of Revelation (World English Bible, public domain). 102 episodes, ~60 seconds each.
Static site: no build step. Works on GitHub Pages.

## Publish on GitHub Pages
1. Create a repository and upload **the contents of this folder** (so `index.html` is at the top level).
2. Repo **Settings → Pages → Build and deployment → Deploy from a branch → main / root**.
3. Open `https://<your-name>.github.io/<repo>/`.

(To test locally: run `python3 -m http.server` in this folder and open http://localhost:8000. Opening `index.html` by double-click may block some features.)

## Scripture text (subtitles)
`js/scripture-web.js` already contains the complete World English Bible text of Revelation (public domain, ebible.org/web), verse by verse. Subtitles read from it automatically. You can edit any verse there.

## Voice Studio (Menu → Settings)
Record narration for any episode, in layers, with optional voice filters.
- **Record new layer**: starts at the playhead (drag it to a verse to record just that line). Every take is its own layer, so you can record on top without overwriting; delete, mute, solo, nudge, rename or **Redo** any layer.
- **Filters**: *Old Narrator* and *Voice of God* (toggle on/off, strength slider). They are applied non-destructively, so your original recording is never changed and each layer's filter can be switched later.
- **Save episode audio** mixes the un-muted layers into `audio/ep-001.mp3`, `ep-002.mp3`... (named automatically by episode).
- Saved audio can be edited (layers stay), re-saved, deleted, or redone. "Load saved/website copy as layer" lets you edit audio on another device.
- **Recording & storage** tab: link your project's `audio/` folder (Chrome/Edge desktop) so Save writes straight into it, or download everything as an `audio/` zip. Upload the `audio/` folder to GitHub and episodes play it automatically.
- Recording needs https:// (GitHub Pages) or http://localhost. Layers are stored in the browser, so keep the saved mp3 files too.

## Adding episodes
Episodes live in `js/episodes/ep-001-010.js`, `ep-011-020.js` …  (10 per file).
After creating a new data file, add its name to `js/built.js`.

## Controls
Space/K play-pause · ←/→ ±5s · C subtitles · M mute · F fullscreen · N/P next/previous.
Quality: Auto / High / Med / Low (phones & iPads start on Medium; Auto lowers it if frames are slow).

## Pixel-art edition (new)
Episodes 1 and 2 now have a **2D pixel-art cut** (480x200, dithered palettes, nearest-neighbour upscaling). It is the same storyline,
timing, score, WEB subtitles and Voice Studio support as the 3D cut. Only the look changed.
- `js/px/px-core.js`  tiny software renderer: dithering, noise, 5x7 bitmap font, vignette/fades
- `js/px/px-lib.js`   reusable pixel set pieces: starfield, planet (night lights, terminator), sea & sky, clouds, islands, cliff, grass, John, wind.
   Added for Episode 2: `halo` (soft dithered glow), `flame` + `lampGlint` (the seven lamps), `cities` (seven far silhouettes), `cloud` (lit cloud strata), `glory` + `seaGlow` (light breaking through), `glyph('alpha'|'omega')` (letters formed from stars), `motes`
- `js/engine-px.js`   `Aura.PixelEngine`: same clock/score/VO/subtitles as the 3D engine, canvas 2D instead of WebGL
- `js/episodes/px-001.js`, `px-002.js`  Episodes 1 and 2 (`pixel: true`). Pixel cuts win automatically; add `?style=3d` to the URL to watch the original 3D cut.
To make another episode in pixel style: `Aura.define(n, { pixel: true, duration, cues, build(ctx){ return { render(t, ctx){ /* draw with ctx.px / ctx.lib */ } }; }, score(A, from){...} })`,
then list its file in `js/built.js`. 3D and pixel episodes can be mixed; the player swaps engines automatically.

## Status
- Episode 1 — The Unveiling (Rev 1:1–3): **built**
- Episode 2 — Grace and Peace (Rev 1:4–8): **built** (3D cut + pixel cut `px-002.js`; same cues and score, so a recorded voice-over works on both)
- Episode 3 — On the Lord's Day (Rev 1:9–11): **built** (3D cut + pixel cut `px-003.js`; same cues and score. Pixel lib additions: `shore`, `spray`, `waveRings`, `inland`, `shoulder`, `johnTurn`, `nameSign`; apostrophe glyph in the 5x7 font. Old 3D lib: shockwave sea ripple, grass gust, surf foam/spray, light motes, name sprites)
- Episode 4 — One Like a Son of Man (Rev 1:12–16): **pixel cut built** (`px-004.js`; same cues and score as 3D. New pixel lib: `lampstand`, `sonOfMan`, a figure made of light with no face). Old note: Episode 4 — One Like a Son of Man (Rev 1:12–16): **built** (new lib: `lampstand`, `christ` bright-silhouette figure, `star`, `flameSprite`, `terrainDisc`/`waveRings`)
- Episode 5 — Do Not Be Afraid (Rev 1:17–20): **pixel cut built** (`px-005.js`; same cues and score as 3D; the fall, a hand of light, the keys, the seven stars and lampstands over the seven cities).
- Episode 6 — Ephesus: The First Love (Rev 2:1–7): **pixel cut built** (`px-006.js`, 80 s because the text is long; new pixel lib: `colonnade`, `ephesusCity`, `robed`, `ship`, `treeOfLife`).
- Episode 7 — Smyrna: Faithful Until Death (Rev 2:8–11): **pixel cut built** (`px-007.js`, 66 s; new pixel lib: `smyrnaStreet`, `rain`, `crown`). Cold blue street, one lamp, ten lights, the crown of life; ends in stark mountain light for Pergamum.
- Episode 8 — Pergamum: The Throne of Satan (Rev 2:12–17): **pixel cut built** (`px-008.js`, 90 s; new pixel lib: `acropolis`, `throne`, `idol`, `whiteStone`). Dark crimson, tilted camera, two sword slashes, the white stone; ends in furnace light from below for Thyatira.
- Episode 9 — Thyatira: Eyes Like Fire (Rev 2:18–23): **pixel cut built** (`px-009.js`, 86 s; new pixel lib: `forge`, `anvil`). Forge-city, burning eyes as light only, rack focus between flame and a silhouette; ends with the bronze cooling to ember. Rev 2:24–29 is left for Episode 10.
- Episodes 6–102: outlined in `REVELATION_SERIES_PLAN.md`
