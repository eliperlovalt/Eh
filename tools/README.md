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
- `tests/wshots.py FOLDER '[[name,x,y,z,yaw,pitch],...]' [day|dusk|night] [prefix]`: screenshots at fixed spots.

The Depot's parts (seasons.js, trees.js, flowers.js) are embedded whole in the source inside `function KITS()`. To take a newer Depot part, replace its text there; nothing else in it is edited.

Since v1.14:
- A window pane (`C.win`) is see-through near the walker and closes to the old lit pane by 52 blocks, a pixel at a time (`WMAT`). Far groups, the overview, and any floor whose inside is not drawn use the plain opaque pane (`paneOf`, `intCut` in `cullStep`). A pane with a wall hard against it stays opaque (`blindPanes`). Lamps use `C.lamp`.
- The window frames (`buildWindowDetail`) are the two broad faces of each bar, cut into 64-block pieces, and a piece more than about 125 blocks off is not drawn. That took a third of a million triangles out of the estate.
- The grand flights and both terrace flights are climbed on unseen one-block steps (`flight2`) and drawn as fine stairs with strings, balusters, rails and newels (`buildStairs`). The walker is drawn on the slope (`stairRamp`).

Run the walk test and the reach test before every push.
