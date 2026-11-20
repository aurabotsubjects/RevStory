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
- Episode 10 — Thyatira: Hold On Until I Come (Rev 2:24–29): **pixel cut built** (`px-010.js`, 66 s; new pixel lib: `scepter`, `pot`, `CLAY`). Burdens lift as light, the ember rises into an iron rod, the clay pots shatter, dawn and the morning star, then the colour drains to grey for Sardis.
- Episode 11 — Sardis: Wake Up! (Rev 3:1–6): **pixel cut built** (`px-011.js`, 70 s; hall renderer is local to the file). One-point-perspective dolly down a faded hall: warm "alive" surface drains to grey, a waking pulse, a thief's silhouette, three white robes, a scroll of names a blot cannot touch, and a far door warming for Philadelphia.
- Episode 12 — Philadelphia: The Open Door (Rev 3:7–9): **pixel cut built** (`px-012.js`, 54 s; new pixel lib: `titleCard`, `key`, `marks`, `pillar`, `lightFig`, `philadelphia`, ramps `HONEY` / `LUKE`). Opens on Sardis's warm door: a key of light turns, the leaves open and shadows cannot shut them, a gate shuts and no one can open it; through the door to a small hill-town under a vast door of light; a little flame stands against the wind; shadow-figures come, kneel and are loved.
- Episode 13 — Philadelphia: The Hour of Trial (Rev 3:10–13): **pixel cut built** (`px-013.js`, 58 s). A dial reaches its hour; the dark front covers the world and the town is kept under a dome of light; light falls from the door ("coming quickly"); hands of shadow cannot take the crown; a pillar rises in a temple with three names; a city comes down out of heaven; the voice ripples out; the light dims to a lukewarm haze.
- Episode 14 — Laodicea: Neither Hot nor Cold (Rev 3:14–19): **pixel cut built** (`px-014.js`, 64 s). Tepid palette; a steady beam and the beginning of creation; hot and cold streams become one tepid pool and are blasted out; a gold robe drains to grey and a haze closes in; gold refined in fire, a white cloth, a drop of light on the eyes; colour returns with a steady dawn; the light dims to a door in the dark and a knock.
- Episode 15 — Behold, I Stand at the Door (Rev 3:20–22): **pixel cut built** (`px-015.js`, 48 s). Two knocks, light under the door, a hand on the handle, the door opens; a table for two; the two seated on one throne with the Father's throne of light behind; seven lamps light one by one; a door stands open in the sky (handoff to Part II). **Part I (Episodes 1–15) is complete.**
- Episode 16 — A Door Standing Open in Heaven (Rev 4:1–5): **pixel cut built** (`px-016.js`, 72 s). The open door, a trumpet voice, the ascent, the throne of jasper and ruby, the emerald rainbow, twenty-four elders, lightning, seven lamps.
- Episode 17 — Holy, Holy, Holy (Rev 4:6–11): **built** (`px-017.js`, 94 s). The sea of glass, the four living creatures, the elders' crowns.
- Episode 18 — The Scroll Nobody Could Open (Rev 5:1–5): **built** (`px-018.js`, 66 s). The sealed scroll, the angel's question, silence, John weeping, the Lion.
- Episode 19 — The Lamb Who Was Slain (Rev 5:6–10): **built** (`px-019.js`, 78 s). The Lamb takes the scroll; harps, incense, the new song.
- Episode 20 — Worthy Is the Lamb (Rev 5:11–14): **built** (`px-020.js`, 64 s). The endless host, seven pulses, every creature, Amen, the first seal. **Part II (Episodes 16–20) is complete; next is Ep 21 (Part III, The Seven Seals).**
- Episode 21 — Come! The White Horse and the Red (Rev 6:1–4): **pixel cut built** (`px-021.js`, 60 s). The first seal cracks; the white horse and bow, the red horse and the great sword.
- Episode 22 — The Black Horse and the Pale Horse (Rev 6:5–8): **pixel cut built** (`px-022.js`, 68 s). Scales and grain, the oil and wine untouched; the pale horse, Death and Hades, a quarter of the earth.
- Episode 23 — How Long, Sovereign Lord? (Rev 6:9–11): **pixel cut built** (`px-023.js`, 56 s). Under the golden altar, souls of light, white robes unfurl; the sixth seal.
- Episode 24 — The Sky Rolls Up (Rev 6:12–14): **pixel cut built** (`px-024.js`, 46 s). Earthquake, black sun, blood moon, falling stars, the sky rolled like a scroll.
- Episode 25 — Who Can Withstand? (Rev 6:15–17): **pixel cut built** (`px-025.js`, 50 s). Caves, the cry to the rocks, silence, four points of light.
- Episode 26 — The Four Winds Held Back (Rev 7:1–3): **pixel cut built** (`px-026.js`, 54 s). The frozen world, four angels, the angel from the east with the seal.
- Episode 27 — The Twelve Tribes Sealed (Rev 7:4–8): **pixel cut built** (`px-027.js`, 62 s). Twelve tribe lights ignite in a ring; it opens onto a crowd.
- Episode 28 — A Great Multitude (Rev 7:9–12): **pixel cut built** (`px-028.js`, 60 s). From one figure to an uncountable crowd with palms; the sevenfold amen.
- Episode 29 — Out of the Great Tribulation (Rev 7:13–17): **pixel cut built** (`px-029.js`, 70 s). Robes washed white, the shelter, the Lamb the shepherd, the tear wiped away.
- Episode 30 — Silence in Heaven (Rev 8:1–6): **pixel cut built** (`px-030.js`, 76 s). The seventh seal, near-eight seconds of silence, seven trumpets, the censer hurled to earth.
  **Part III (Episodes 21–30) is complete.**
- Episodes 31–44 (Part IV, The Seven Trumpets, Rev 8:7 – 11:19): **built** (`px-031.js` … `px-044.js`): hail and fire and the burning mountain, Wormwood and the darkened sky, the Abyss, Abaddon, the four angels, fire/smoke/sulfur, the mighty angel and seven thunders, no more delay, take and eat, measuring the temple, the two witnesses, their fall, Come up here, and the Kingdom of our Lord. **Part IV is complete.**
- Episodes 45–59 (Part V, The Woman and the Dragon, Rev 12:1 – 14:20): **built** (`px-045.js` … `px-059.js`): the woman and the dragon, war in heaven, the accuser, the eagle's wings, the beast from the sea, forty-two months, the second beast, the mark, Mount Zion, Fallen Babylon, the cup of wrath, Blessed are the dead, the harvest and the great winepress. **Part V is complete.**
- Episodes 60–66 (Part VI, The Seven Bowls, Rev 15:1 – 16:21): **built** (`px-060.js` … `px-066.js`): the song of Moses and the Lamb, the seven golden bowls, the first two bowls, the third bowl, bowls four and five, Armageddon, and It Is Done. **Part VI is complete.**
- Episodes 67–78 (Part VII, The Fall of Babylon, Rev 17:1 – 18:24): **built** (`px-067.js` … `px-078.js`): Come I will show you, Mystery Babylon, the beast that was and is not, the ten kings and the Lamb, the waters and the city, Fallen Fallen, Come out of her, the kings weep, the merchants weep, In one hour, Rejoice over her, and the millstone. **Part VII is complete.**
- Episodes 79–85 (Part VIII, The Return of the King, Rev 19:1–21): **built** (`px-079.js` … `px-085.js`): Hallelujah, the wedding of the Lamb, blessed are those invited, Faithful and True, King of kings and Lord of lords, the great supper of God, and the beast is captured. **Part VIII is complete; next is Ep 86 (Part IX, The Thousand Years and the Judgment).**
- Episodes 16–102: outlined in `REVELATION_SERIES_PLAN.md`

## Sound mix
The player's sliders button (next to the speaker) opens a two-slider mixer: **Music & effects** (the procedural score) and **Voice-over** (recorded audio / Voice Studio), each 0–100%. Levels are remembered per device (`localStorage['aura.mix']`). The speaker button / `M` key still mutes everything.

## Auto-play next
The double-arrow button in the control bar (or the `A` key) turns **Auto-play next** on or off, and the choice is remembered per device. On (the default): when an episode ends the next one starts straight away, with no end card, so the clips play back to back. Off: the end card waits for the viewer, who can switch the setting from the card too.

With auto-play on, episode title cards are skipped on the continuation so the clips flow, except when a new Part begins (Eps 16, 21, 31, 45 and so on), which keeps its title. Starting an episode yourself, or with auto-play off, always shows the title.


## Devotional study
The 70-day Revelation devotional lives in `devotional/` (opened from the Devotional button in the top bar, the hero, and the menu; a Series button inside it returns here). All 70 hero images are done (`devotional/images/day-01.webp` … `day-70.webp`, 1600×900). A new `day-NN.webp` dropped into that folder replaces the picture automatically.

**Watch buttons in the devotional.** Each devotion's Read section shows a "Watch the animation" button when the reading includes Revelation verses that have been animated. It links to `index.html?watch=45,46`, which asks for one tap (so audio can start), plays those episodes back to back, then stops. The devotional reads `js/series-data.js` and `js/built.js`, so new episodes light up automatically as they are added.
