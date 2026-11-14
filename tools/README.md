# Estate tools

The source of the Estate is the Claude artifact "Euphrates Hall: the Voxel Estate" (its `index.html`).
This repo's `index.html` is that source built for the phone by `build.py`.

- `build.py SOURCE OUT`: bundles three.js 0.160.0 with esbuild 0.28, minifies whitespace, adds the PWA tags. Needs `npm i three@0.160.0 esbuild`; set `EH_NODE_MODULES` to that `node_modules` (the default is `/home/claude/tools/node_modules`). It reproduced v1.9 byte for byte, and v1.19 byte for byte on Windows.
- `tests/walk_test.py FOLDER`: landscape phone, every walk button, flight, photo mode, the stair openings, each fine stair climbed and descended on foot with the drawn height checked for jumps, the gallery and terrace rails, the window panes near and far, no page errors.
- `tests/reach_test.py FOLDER [index.html] [walk]`: all 277 rooms on foot from the front lawn (157 on the estate, 120 in the villages). `walk` leaves the Upstairs button out, and still must reach every room.
- `tests/perf.py FOLDER [BASE]`: draw calls and triangles at fixed spots against the last version's source (kept in `/home/claude/v113`).
- `tests/ftime.py BASE NEW`: software frame times at fixed spots, one build after the other.
- `tests/ftime2.py BASE NEW [spots]`: the same, both builds open at once and timed in turn. It read about 4% either way on one build against itself, so it is a rough guide only.
- `tests/ftime3.py BASE NEW [spots] [repeats]`: one build on screen at a time, the builds taken in turn, the median frame at each spot and the best of the repeats. Use this one to decide.
- `tests/audit_test.py FOLDER`: doors, rugs and wall pieces, measured from the built world by `tests/audit.js`. Every door is found and its approach checked: no free-standing piece within two blocks of the door line, no wall piece hanging into the opening. No two rugs overlap at one height, none lies over a hole or through a wall. The lower edge of every hung piece sits above a third of its wall. Doors crowded by the building itself (a column, a stair) are listed by name in `KNOWN` as awaiting the floor plan; a new one fails the test.
- `tests/dump.py FOLDER OUT.json` then `tests/plan.py OUT.json BUILDING FLOOR_Y OUT.png [x0,z0,x1,z1]`: a drawn plan of one floor with every room, door, rug and piece on it.
- `tests/wshots.py FOLDER '[[name,x,y,z,yaw,pitch],...]' [day|dusk|night] [prefix]`: screenshots at fixed spots.

The Depot's parts (seasons.js, trees.js, flowers.js) are embedded whole in the source inside `function KITS()`. To take a newer Depot part, replace its text there; nothing else in it is edited.

Since v1.14:
- A window pane (`C.win`) is see-through near the walker and closes to the old lit pane by 52 blocks, a pixel at a time (`WMAT`). Far groups, the overview, and any floor whose inside is not drawn use the plain opaque pane (`paneOf`, `intCut` in `cullStep`). A pane with a wall hard against it stays opaque (`blindPanes`). Lamps use `C.lamp`.
- The window frames (`buildWindowDetail`) are the two broad faces of each bar, cut into 64-block pieces, and a piece more than about 125 blocks off is not drawn. That took a third of a million triangles out of the estate.
- The grand flights and both terrace flights are climbed on unseen one-block steps (`flight2`) and drawn as fine stairs with strings, balusters, rails and newels (`buildStairs`). The walker is drawn on the slope (`stairRamp`).

Since v1.15:
- `settle()` runs once everything is placed and before anything is drawn. It owns four rules; fix a fault there, at the root, not at the place that tripped it.
  - Rugs (`settleRugs`): one height (floor + .58; the floor finish is at + .53, the pools of lamplight at + .65). Two rugs that overlap by a strip share it. A rug is cut back to the largest clear rectangle: not over another rug, a hole, a wall or a stair and its approaches. A rug squeezed out of shape is rewoven.
  - Wall pieces (`settleHang`): portrait, tapestry, sconce, antlers, banner, coat of arms, wall lantern and picture rail rise until the lower edge is a third of the way up the wall. Notice boards, key cabinets and racks stay at hand height. A piece with no wall to rise on goes.
  - Upper walls (`settleUpper`): state rooms nine blocks tall or more get an upper row from the pieces the Estate already has.
  - Doors (`settleDoors`, `settlePlants`): whatever still stands within two blocks of a door line, or hangs into an opening, is taken out. Plants move to a free corner.
- Wall runs (`K.tile` without a `test`) are laid one unbroken stretch of wall at a time, with a cut bay to finish, so no bay crosses a door or a window.
- `K.windows` gives a sash no curtains when a door is within their reach (`_bare`), and no sash when the frame itself would cross the door.
- `placeLamp` keeps lamp posts off the approach to every outside door (`doorway`).
- The Saloon gallery floor runs three blocks out over the colonnade, so the columns carry it. The rail stands on the new edge.
- The harness takes the browser from `CHROME=/path/to/chrome` when Playwright's own Chromium is not installed.

Since v1.16 (Andy's Notes, first batch; the full list and its status is the doc "Andy's Notes"):
- `URLS.globe` is the newest Globe. Every globe in a room opens it (`wireRecords`); the Seeing Stone opens `URLS.golem`.
- The Glasshouse is the Greenhouse, in the source and in estate-plan.json.
- The light court over the Saloon is glazed at y 38 and stone beams at y 37 carry the tower. No rug lies on glass. `settleCeil` removes a lantern or chandelier with no ceiling over it.
- The park wall is eight blocks high. Ground beside every road is flat for three blocks, then rises one in three (the pass after `baseH`).
- Flight rises and sinks at 35 blocks a second. `LOOKS` scales the look speed (the Look button; saved as `euph_look`). The pointer is two inline SVG cursors in the first style rules.

Since v1.17 (Andy's Notes, second batch):
- The river: `RIV` and `riverD` (after `WALL`). A ring round park and villages, three tributaries, a stream from the west arm into the lake and on across the south park to the east arm. `baseH` cuts it, roads cross on stone decks, the wall crosses on arches, `blocked` keeps trees and beds off the banks. It added about 30 draw calls; trimming that is open.
- Bodies: every mover has a radius (`BODYR`, `addLife`). `bodyGo` stops it at furniture as well as walls and at other bodies, and tries a step to either side before giving up. `lifeBlock` is His Grace against a body: people and small animals are shouldered aside, a horse, a cow or the wolf stands, and nobody in a doorway can shut him in.
- The werewolf: a dark hound at 2.4 scale on a `route` along the north-east outer forest (`spawnAnimals`).
- The Great Oak is the Great Cedar: the estate's largest cedar until the Depot makes the tree built for lights.

Since v1.18 (the Depot's contours, v15):
- `ornament.js` and `contours.js` are embedded whole in `KITS()`, before `treeMesh`. To take a newer Depot issue, replace their text there; nothing in them is edited.
- `fitContours` dresses the nine estate buildings one a slice after the first frame (`CSTYLE` maps names to styles; the Hall gets the wings as neighbours and both terraces as existing, the wings get the Hall). Colours go to linear with `s2l`, as the trees' do. `skinStep` swaps near and far at 115 blocks and hides a building's skin while it is opened. The skin casts no shadows.
- On each dressed building the Estate's own window bars are put away (`g.gone`), and the kit's `solids` (portico piers, buttresses) become unseen blocks. The old south porch is not built.
- The wall rule is replayed (no `openings` passed). The triangle counts match the Depot's table exactly, which shows the walls still follow that rule. `__vx.windows()` reads the real list from the built walls; it is filed as `windows.json`.
- v1.18.1: the 32 village houses are dressed too. Each kind is dressed once and set on every house with `houseMatrix` and the house's quarter turn (`b.q`). A village skin is not drawn beyond 160 blocks.

Since v1.19 (the slow opening, the river's draw calls, the seating groups, walks and trails):
- The slow opening: `CONTOURS.dress` cost 4.3 s of main thread on a desk (2.5 s of it one stall for the Hall), far more on a phone. `fitContours` now starts a worker built from `KITS.toString()` as soon as the buildings and villages are known (after `genGrounds`), and `skinSet` sets one finished dressing a frame. `contourJob` is the one job, run in the worker or, where no worker can be had, on the main thread as before (`CSKINS.mode` says which; a watchdog takes the work back if the worker says nothing in eight seconds).
- The river's draw calls: `mergeWater` joins the 133 small water meshes (river, lake, ponds) into at most twelve sheets after the chunk groups are made. 20 to 40 fewer draws at most spots.
- The seating groups: `settleGroups` runs first in `settle()`. A pasted group is a table with a long seat and two chairs turned 70 degrees apart. The one nearest a fire is drawn up to it; a room with no fire has it in the middle, facing the windows, or as two chairs across a table at a window; three or more groups in one room stand in the quarters and face the middle. Nothing goes in a door's approach or on another piece, and a room whose floor would be cut in two is put back. `__vx.settle.groups` has the counts.
- Walks and trails: `TRAILS` (kind 2 cobbled, kind 1 earth), drawn into `TRAILM` by `mkTrails` on first use; `surf` colours them, `blocked` and `flowerBed` keep planting off them. The ground is not moved. Seventeen park meadows where there were eleven.
- The drawn floor plans: `tools/tests/dump2.py FOLDER OUT.json` then `plan2.py OUT.json OUTDIR TAG` gives one sheet for every floor of every building, faults numbered in red. `map.py` draws the park from above (`__vx.palette` is exported for it). `loadprof2.py` profiles the first seconds of main thread.
- The test harness lets `blob:` requests through so the worker runs under test.

Since v1.20 (the speed pass; first work in Claude Code. The look is unchanged):
- The lantern (`fxLantern`, a point light) is out of the scene whenever it gives no light: out of doors by day and in the overview. A light at intensity 0 is still worked out for every pixel; leaving it out is 13 to 20 percent of the frame (in-page A/B, software GL). `fxWarm` compiles the shaders both ways in the background 2.5 s after the first frame, so the first step indoors does not stall on a new shader.
- `propTrim` lets go of each prop kind's cubes (`r.V`) and quads (`r.q`) once everything is meshed, after `buildFloors`. Its box (`pbox`, `r.bx`) and seat height (`r.st`) are worked out first and kept. JS heap after a full collection: 125 MB to 23 MB. Code that runs after the build must not read `r.V` or `r.q`; `propGet` for a kind not yet built still builds it whole.
- Every quad mesh (`GB`, `FB`) shares one index (`quadIndex`, `QIX`) and draws to its own `drawRange`. About 20 MB less geometry, in memory and on the card. Read `drawRange.count`, not `index.count`, for a mesh's size. Never `dispose()` one of these geometries without setting its `index` to null first: three would free the shared buffer for every mesh (`mergeWater` does this).
- The clouds are one mesh each of the faces that look out (`cloudGeo`), not a box for every cube: 133 thousand triangles to 18 thousand. They only show in the overview; the walker's far plane is nearer than they are.
- `groveStep` does not re-count and re-send the tree instances when the camera, the speed level and the tree shapes are all as they were.
- Tools: `metrics.py BASE NEW [runs]` (load, long tasks, heap after a collection, geometry bytes, draws and triangles at the ftime3 spots and looking up, two builds taken in turn), `breakdown.py FOLDER [spots]` (draws and triangles by kind of object in view), `heapprof.py FOLDER` (live heap by the function that made it). `ftime3_spots.py` holds the spots. The harness and `build.py` take `EH_NODE_MODULES` and run on Windows.
- `walk_test.py` waits 400 ms between its separate Space presses. On a fast machine its steps finished inside the 340 ms double-tap window and the hold-Space press toggled flight off again; v1.19 failed "Space rises" the same way.

Run the walk test, the reach test and the audit test before every push.
