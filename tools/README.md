# Estate tools

The source of the Estate is the Claude artifact "Euphrates Hall: the Voxel Estate" (its `index.html`).
This repo's `index.html` is that source built for the phone by `build.py`.

- `build.py SOURCE OUT`: bundles three.js 0.160.0 with esbuild 0.28, minifies whitespace, adds the PWA tags. Needs `npm i three@0.160.0 esbuild` in `/home/claude/tools`. It reproduced v1.9 byte for byte.
- `tests/walk_test.py FOLDER`: landscape phone, every walk button, flight, photo mode, the stair openings, no page errors.
- `tests/reach_test.py FOLDER [index.html] [walk]`: all 157 rooms on foot from the front lawn. `walk` leaves the Upstairs button out.
- `tests/perf.py FOLDER`: draw calls and triangles at fixed spots against a v1.9 copy in `/home/claude/v19`.

Run the walk test and the reach test before every push.
