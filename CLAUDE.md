# Euphrates Hall: the Voxel Estate

One big self-contained three.js (0.160.0) voxel page. Live at https://eliperlovalt.github.io/Eh/ (this repo's root `index.html`, served by GitHub Pages from `main`). Current version: v1.19. The brand line in the page says the version; bump it on every release.

## Where things are
- `src/index.html`: THE SOURCE (about 760 KB, one file, ES module importing three from a CDN). Edit this, never the root file.
- `index.html` (root): the built web copy. Made by `python3 tools/build.py src/index.html index.html` (bundles three with esbuild, minifies whitespace). Do not hand-edit. First time on a new machine: `npm i three@0.160.0 esbuild` somewhere, then set `EH_NODE_MODULES` to that `node_modules` folder.
- `src/estate-plan.json`, `src/kits.json`: data the page embeds or mirrors. `kits.json` and the `KITS()` function inside the source are the Parts Depot's work: do not patch them (see The fence).
- `windows.json`, `room-register.json`, `wall-moves-v20.json`: issued data. The register lists all 157 rooms as built; the wall-moves file is the agreed plan for v20.
- `tools/README.md`: the running engineering notes, one section per version ("Since v1.15" ... "Since v1.19"). Read it before changing anything.
- `tools/tests/`: Playwright tests and tools. `harness.py` serves a folder and opens the page in headless Chrome (set `CHROME` to a Chrome binary; software GL works).

## Your first job (the owner's order, 14 November 2026)
1. Read it all: `tools/README.md`, then `src/index.html` end to end.
2. Hyper-optimize it: load time, frame time, draw calls, triangles, memory, on a phone first. Measure before and after; change nothing you cannot measure.
3. Give the owner ten suggestions for what to improve next, ranked, each with what it costs and what it buys.
Then stop and report before starting larger rebuilds.

## Rules that bind every change
- Run `walk_test.py`, `reach_test.py` and `audit_test.py` on BOTH `src/` and the built root copy before every push. No push if one fails.
- Compare frame times against the last version with `ftime3.py OLD_FOLDER NEW_FOLDER "" 2` (16.7 ms steps; noise about 4 percent). No push on a real slowdown.
- Both copies every time: rebuild the root `index.html` whenever `src/index.html` changes.
- Never delete old versions or files. Never offer to. Git history is the archive.
- The page must run on a phone in landscape, GTA-style touch controls. That is the target device.
- Debug hooks live on `window.__vx` (grid, buildings, props queue, settle stats, skins, palette). Tests depend on them.

## The fence (two teams work on this)
- The Estate (this repo) owns everything inside the wall face, all placing and all collision.
- The Parts Depot (a separate chat) owns parts, room plans, and the outside and roofline as kits (`KITS()`, `kits.json`, `CONTOURS`, `SEASONS`, `TREES`, `FLOWERS`).
- Outer building boxes do not move. Add or restyle nothing on an outer wall face or roof.
- Make no new parts and never patch a Depot kit. A kit fault is written up for the Depot.

## How the source is laid out (search for these names)
`G/S` voxel grid get/set, palette `C`/`PAL`, `BLD[]` building specs (boxes, levels, rooms, doors), `HALLS`, `FLIGHTS` (stairs), `PQ` prop queue, `RK` room kit, `furnishFrom` (places a Depot room plan), `settle()` (post-pass: seating groups, plants, rugs, wall pieces, doors), `GROUPS` (culled mesh groups), `LIFE`/`lifeStep` (people and animals with bodies), `fitContours`/`skinSet`/`skinStep` (Depot stonework, dressed in a Web Worker), `mergeWater`, `TRAILS`/`trailAt`, `surf`/`baseH` (ground), `build()` (boot order), `frame()` (loop).

## Known open work
- v20: the 23 wall moves in `wall-moves-v20.json`, then new room plans from the Depot for every room.
- Bodies do not yet use doors, stairs or seats. The werewolf is a scaled dog. The Great Cedar is a stand-in.
- Every clickable object opens a fixed link (`URLS`, `ROOMOF`, `HOUSEDOCS` in the source). That wiring is to be redesigned.

## The owner
Address him as Your Grace. Short sentences, answer first, no em dashes ever. He gives the goal; you do the rest and ask taste questions as short multiple-choice quizzes. Always give the Estate as its GitHub Pages link.
