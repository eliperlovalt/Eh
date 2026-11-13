# Estate tools

The source of the Estate is the Claude artifact "Euphrates Hall: the Voxel Estate" (its `index.html`).
This repo's `index.html` is that source built for the phone by `build.py`.

- `build.py SOURCE OUT`: bundles three.js 0.160.0 with esbuild 0.28, minifies whitespace, adds the PWA tags. Needs `npm i three@0.160.0 esbuild` in `/home/claude/tools`. It reproduced v1.9 byte for byte.
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

Run the walk test, the reach test and the audit test before every push.
