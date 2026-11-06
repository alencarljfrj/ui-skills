---
name: ascii-diorama
description: Build tilt-shift ASCII miniatures, which are small, dense, living 3D worlds in Three.js drawn entirely as coloured monospace characters and seen from high above with the top and bottom of the view blurred like a scale model. Use when someone asks for an ASCII scene, ASCII shader or renderer, glyph-rendered or text-mode 3D, an ASCII diorama or miniature, a tilt-shift ASCII effect, or a dense little world (village, harbour, coast, forest path, shrine, city block) in this style. The result is a live web page that animates and loops.
---

# ASCII diorama

Build a small, dense, animated 3D world and draw it as coloured monospace glyphs, seen from high above through a long lens. Each glyph cell takes its colour from the 3D render, and its character from what the surface is, how bright it is and which way its edges run. The middle band is sharp text; above and below, it melts into a soft painted blur, like a tilt-shift photograph of a model.

The result is a live scene in the browser that animates and loops forever.

## The look

- **Camera**: about 52 to 58 degrees down, FOV about 23, around 70 to 80 units from the subject. It sweeps slowly back and forth over about 14 degrees of yaw with eased turns and a slight push in. Nothing cuts.
- **Composition**: one leading line runs diagonally through the view, such as a stair path, shoreline, river or street. A single saturated focal colour sits against calmer greens, golds and creams. A strong focal colour is one like vermilion gates, striped parasols or a yellow tram. Something different fills the top band (a canopy, rooftops) and the bottom band (water, a plaza) so the blur has colour to work with.
- **Density**: everything is many small things. That means tens of thousands of grass blades, thousands of leaf cards clustered into tree crowns with dark gaps, flower cards in noise-shaped patches, rows of repeated props (lanterns, steps, posts) and rocks along the edges. Sparse, smooth, low-poly scenes read as toys.
- **Life**: wind moves the grass and leaves. Water rolls in bands of foam and pulls back up the shore. Petals or motes drift across. One small creature or figure walks through the focal area.
- **Glyphs**:
  - grass in `/ | \` strokes that lean with the wind
  - foliage in `. : * + o`
  - stone and steps in `— = #`
  - water in `- ~ =`, with foam in `* % #`
  - creatures in `$ &`
  - strong edges switch to `| / — \` along their direction

  The cell background is a dim, blurred copy of the render, so gaps between glyphs still carry colour.

## Files

- `templates/scene/main.js`: the complete starter miniature, which is red gates running down a green cliff to a turquoise sea. It includes stone steps, lanterns, gold and red trees, white flower patches, rocks with foam, a walking fox and drifting petals. Every system you need is in it: terrain bake, sea shader, instanced grass, flowers and leaves, path props, the glyph pass and tilt-shift. It runs live and loops; Space pauses.
- `scripts/fetch-assets.sh <scene-dir>`: downloads the starter's textures and fox model.
- `scripts/serve.mjs <scene-dir> [port]`: bundles the scene and serves it, rebuilding on every reload.

## Workflow

1. **Start from the template and change the subject.** Don't ship the template's subject unchanged. Keep the systems and swap what they build, so it becomes your own world. For example:
   - a fishing harbour with a breakwater path and boats
   - a hill village with a cobbled lane
   - a waterfall gorge with a footbridge
   - a lighthouse point
   - a desert oasis
   - a city rooftop garden

   ```bash
   mkdir -p <scene> && cp ~/.claude/skills/ascii-diorama/templates/scene/* <scene>/
   bash ~/.claude/skills/ascii-diorama/scripts/fetch-assets.sh <scene>
   ```
   It needs `three` and `esbuild` resolvable from the folder (a parent `node_modules` works).
2. **Know where things live in `main.js`**:

   | Section | What it controls |
   |---|---|
   | `coastZ`, `rawH`, `ROCKS` | the land shape and shoreline |
   | `PATH` | the leading line, as control points from top to bottom of the view |
   | `buildTerrain` | bakes ground colour and glyph class from real textures, zoned by height, path distance and noise |
   | `buildSea` | the water: depth colours, rolling foam, swash, caustics |
   | `buildGrass`, `buildFlowers`, `buildTrees` | the dense fill |
   | `buildTunnel`, `buildLanterns`, `buildShrine`, `buildRocks` | the props along and around the path; replace these with your subject's props |
   | `CLS` and the `cls<...` branches in `asciiFrag` | the glyph rules per surface |
   | `placeCamera`, `TARGET`, `DURATION` | the sweep and its period |
   | `tiltFrag` | the focus band and blur strength |
   | `COLS`, `ROWS`, `W`, `HH` | glyph grid and canvas size |
3. **Gather assets with clear licences.** Prefer CC0:
   - Poly Haven textures and HDRIs: `https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/<id>/<id>_diff_1k.jpg`, with the list at `https://api.polyhaven.com/assets?t=textures`.
   - Khronos glTF sample models: read each README's Legal section.

   Put downloads in their own folder, never run anything from them, and keep a list of each asset's source and licence. Avoid copyrighted characters.
4. **Look at it while you build.**
   ```bash
   node ~/.claude/skills/ascii-diorama/scripts/serve.mjs <scene>
   ```
   Open the printed URL, reload after each edit, and take screenshots to judge it. Check that the focal element and the leading line sit in the sharp band, that the top and bottom bands hold colour, and that large areas sit in the middle brightness range so their glyphs vary.
5. **Check motion, not just stills.** Pause with Space at a few moments, or take several screenshots in quick succession. Glyphs flipping every frame read as strobing, so slow down the noise that drives them. The creature should step, not slide.
6. **Hand it over.** The scene folder runs with `serve.mjs`. For a static copy, `index.html`, `build/main.js` and `assets/` are everything the page needs, and they can go on any static host.
7. **Report**: say how to view it, list each asset with its source, licence and any credit needed, and name any weak spots you saw.

## Tuning that works

- Grid 200×100 on a square canvas (cells of about 7×14 px). Sample the scene at the cell's mip level so each glyph averages its footprint.
- Grade: tone curve, saturation 1.2 to 1.4, glyph colour × 1.3, cell background × 0.2 to 0.35. Raise the background for large bright surfaces such as sand or snow so they stay light.
- Tilt-shift: focus around 0.42 to 0.47 of the height, blur starting about 0.27 away from it, up to 26 to 30 px on a golden-angle disc.
- Light: a low-ish sun from the front-left with 4096 shadow maps, so canopies throw dappled shadow onto the grass and props cast readable shadows. Use a warm hemisphere fill.
- Props on a path: space them at about the prop width, never tighter. Use a long gentle S rather than tight switchbacks.
- Anything time-driven should loop cleanly or ping-pong, so the live view never jumps.

## Pitfalls seen before

- **Props lying along the path instead of across it**: with local x as the wide axis, use `rotation.y = Math.atan2(tangent.x, tangent.z)`.
- **Tight switchbacks under wide props**: they pile into a claw shape.
- **Black squares spreading through the image**: NaN in the half-float target, which mipmapping spreads. Lit skinned glTF meshes are the usual cause, so use `MeshBasicMaterial` for small animated creatures.
- **Hulls or roofs black from above**: flipped normals on extruded shapes. Use `side: THREE.DoubleSide` or unlit materials.
- **Dark tops on gates or roofs**: these hide the focal colour from a steep camera, so colour the top surfaces.
- **Water blowing out to white glyphs**: lower its base colours.
- **Orange or brown blob rocks**: tint them cool grey and flatten them.
- **A glyph used in a rule but missing from `GLYPHS`**: it produces `undefined` in the shader, so add it to the atlas string first.
- **Someone else's browser view**: never navigate, resize or click in a browser someone is watching just to verify. Open your own tab or a separate headless browser instead.
