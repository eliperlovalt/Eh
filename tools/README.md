# Estate tools

The source of the Estate is the Claude artifact "Euphrates Hall: the Voxel Estate" (its `index.html`).
This repo's `index.html` is that source built for the phone by `build.py`.

- `build.py SOURCE OUT`: bundles three.js 0.160.0 with esbuild 0.28, minifies whitespace, adds the PWA tags. Needs `npm i three@0.160.0 esbuild` in `/home/claude/tools`. It reproduced v1.9 byte for byte.
- `tests/walk_test.py FOLDER`: landscape phone, every walk button, flight, photo mode, the stair openings, no page errors.
- `tests/reach_test.py FOLDER [index.html] [walk]`: all 277 rooms on foot from the front lawn (157 on the estate, 120 in the villages). `walk` leaves the Upstairs button out, and still must reach every room.
- `tests/perf.py FOLDER`: draw calls and triangles at fixed spots against the last version's source in `/home/claude/v111`.
- `tests/ftime.py`: software frame times at fixed spots, the same comparison.

The Depot's parts (seasons.js, trees.js, flowers.js) are embedded whole in the source inside `function KITS()`. To take a newer Depot part, replace its text there; nothing else in it is edited.

Run the walk test and the reach test before every push.
