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

Since v1.21 (full detail at every distance; the owner's order of 14 November 2026: nothing gets plainer or blockier with distance):
- `FULL.on` (default true): the Depot's stonework stays in its near shape at every distance (`skinStep`), village skins are never dropped, the flower beds are planted with `far` 1e6 and `gone` = the mist, window frames (`wd`), outdoor stairs (`lod`) and outdoor pieces (`INSTS`) are drawn out to the mist, people out to the mist. The governor may lower the resolution but keeps `GOV.far` at 290. `FULL.on=false` (and `GROVE.key=null`) brings back the old distances for measuring.
- Trees: every tree is drawn in its finest shape (`hero`) within `IMP.D` (100) blocks, and beyond that as a portrait of the finest shape (`impBake`, `impPut`, `impStep`). A kind's sheet is 12 directions by 3 heights of 96 pixels, sRGB, mipmapped, lit by copies of the sun and the room light; it is taken again when `impLightSig` changes or the hero shape is regrown, one kind a frame. The portrait faces the camera and shows the nearest photograph. Trees outside a view 1.8 times the camera's angle are not set out (`groveFrustum`); the grove is counted every 0.05 s. Cost against v1.20 (software GL): 13 to 63 percent slower frames, 1.1 to 1.6 million triangles on foot, 2.1 million in the overview (every tree finest would be 4 to 19 million).
- `shadowPass`: when the shadow map is to be drawn, every tree is set out in its finest shape and the shadows drawn into a one-pixel target before the frame. Shadows no longer depend on where the camera was.
- Indoors by day the lantern is out and the room light is raised by `LDAY.k` (1.36, matched to the lantern-lit average of five rooms). The lantern is carried at dusk and night.
- The lamp pools are in 64-block cells, each with its own bounds.
- `build()` is async and yields between its phases; `TM.wall` is the whole raising.
- Tools: `lookdiff.py BASE NEW OUTDIR` (screenshots against a noise floor).

Run the walk test, the reach test and the audit test before every push.

Since v1.22 (Depot v20 fitted, first part):
- `KITS()` now embeds `depot/seasons.js` v2, `trees.js` v2, `flowers.js` v2, `ornament.js` and `contours.js` v20, whole (the `module.exports` line is left off the first three, as before). `props6.js` and `roomplan.js` follow `props5.js`. To take a newer Depot file, swap its block for the file.
- The glazing cross is on every dressed window (contours v20). The Hall is 74,326 triangles near.
- Hero trees: `TVAR` and `TRAD` know greatOak, greatCedar, greatBeech; the specimen trees on the lawns are those (clearance 0.8 of their radius), and the Great Cedar at x -50, z 125 is the Depot's greatCedar at 1.25. The west cedar at x -52, z 84 finds no room, as in v1.21.
- The werewolf is the Depot's (`wereFig`, props6 `werewolf`, steps 0 and 1 swapped by `lifeStep` as he walks), on the old route and body.

Tooling (15 November 2026; from the owner's toolkit doc, fitted to the Estate):
- `tools/tests/gate.sh`: the push gate. Checks the root `index.html` is byte for byte the build of `src/index.html` (the build is repeatable), then runs `walk_test`, `reach_test` and `audit_test` on `src/` and on the root copy. About 4.5 minutes in a cloud session. On a pass it writes `.git/eh-gate-ok` (never committed) with the hashes of both pages. It finds `EH_NODE_MODULES` and `CHROME` on its own when they are not set.
- `.claude/settings.json` and `.claude/hooks/guard.py`: a hook before every edit and command. It refuses an edit or a shell write to the root `index.html` (edit the source and rebuild), and refuses a `git push` that carries page changes unless the gate passed on exactly the committed pages. Pushes that touch only docs, `depot/` or `tools/` go through. The frame-time check (`ftime3.py`) is still by hand.
- Fresh cloud session: `npm i three@0.160.0 esbuild` into `/root/eh-node`, `pip install playwright` (the browser is already in `/opt/pw-browsers`; do not run `playwright install`).

Since v1.23 (the phone test, F3; His Grace's ranking of 15 Nov puts it first):
- Open the Estate with `?stats` (https://eliperlovalt.github.io/Eh/?stats), or press the Stats button under Find (v1.26; both a little smaller, with a 5px tap margin; it is always there, in both views; the home-screen app drops ?stats, and the gold name takes no taps). The panel (`benchUI`) shows the device, the graphics chip, the load (`BENCH.first`, `TM.wall`, `BENCH.ready`) and the memory where the browser gives it. "Run the test" walks the six `BSPOTS` with the speed budget off and times 90 frames at each (median and worst 5 percent, draws, triangles); "Copy the numbers" puts the text on the clipboard. Nothing is sent anywhere.
- On a phone (`coarse`) the tree portraits began at 50 blocks (`IMP.D`), on a PC at 100. v1.27 puts phones back at 100: the iPhone held 59 fps (His Grace).

The first phone test (15 November 2026, His Grace's iPhone, iOS 18.7 Safari, Apple GPU, 844 by 390 at 3x drawn at 1.5x, v1.25, speed budget off):
- First frame 3.7 s, raising 3.3 s. Memory: Safari gives none.
- Median frame 17.0 ms (59 fps), worst 5 percent 18.0 ms, at the lawn, the Saloon, the park, the village and the north garden (1.7 to 2.0 million triangles, 350 to 680 draws). The overview 18.0 ms (56 fps), worst 21.0 ms, 2.56 million triangles, 731 draws.
- 17 ms is the screen's own 60 Hz pace, so these show the phone keeps up, not how much room is left. The software-GL times in this file overstate a phone's cost several times over; read them as relative only.

Since v1.28 (the reel audit, first batch; the fault list is KAIROS's, kept on His Grace's PC in Jarvis\Reels\audit\FAULTS.md):
- The Chapel nave: `chapelCeil` closes the underside of the roof with a ceiling one block above the nave (the house's ceiling finish dresses it as a ribbed vault); `chapelGlass` puts a stained-glass lancet (`lancetTex`, a canvas texture) just inside every pane of the nave, culled with the nave's insides. The glass dims at dusk and night (`CHG.mats`, set in `fxLight`). Nothing on the outer wall face changes; from outside the glass shows through the clear pane.
- `placeLamp` refuses a roof cell, and any raised top with air under it (the Chapel porch, the Home Farm barn, two village roofs: `__vx.settle.lampRoof`). The terrace lamps stand.
- Tools: `reelshots.py FOLDER OUTDIR` shoots every Estate reel camera (`reel-shots.json`, both ends of each shot) the reels' way; `spotshots.py FOLDER OUTDIR 'name:x,y,z,yaw,pitch[,tod];...'` shoots any poses (y the floor, as in the audit).

Since v1.29 (the reel audit, second batch):
- `doorCasings`: every inner doorway of the Service Wing and the Stable Court gets a dark oak casing, its jambs and head recoloured in the wall (361 cells). Only walls with the inside of the same building on both sides (`B.boxes`) are touched. The Dairy now reads as a door onto a passage.
- A hammerbeam hangs only under a ceiling 9 or more blocks up (`furnishFrom`, hanging pieces). The Great Hall's seven trusses stay; the Long Gallery "stair" in the audit (r039) is one of them seen end-on from x 0.
- Found, not yet fixed: the Bakehouse's door into the passage (x 73 to 74, z -8) opens onto the side of the service stair that climbs the passage from x 70 to 75; the door wants cutting clear of the stair. The Tack Room's dark mass is a solid block stair to the lodgings (x 114 to 121, z -101 to -100).

Since v1.30 (the reel audit, third batch):
- `doorsOffStairs` runs after `genProps2`: in the Service Wing and the Stable Court an inner doorway whose far side is blocked (it was cut before the service stair rose) is walled up and cut again, the same width and height, at the nearest place in the same wall clear on both sides. It moved two: the Bakehouse and the Estate Carpenter, from x 73 to x 76 (`__vx.TM.doorsMoved`). `sealDoors` still runs where it did; it cannot see stairs built later.
- `doorCasings` now runs after it (so the casing frames the new door), and `passageBoards` lays the passages (`HALLS`) of the two buildings in dark boards (909 cells), so a doorway visibly opens onto another space.

Since v1.31 (the reel audit, fourth batch):
- The ground is one block thick, so a room below it (the Chapel crypt and Vestry) looked out into the hollow under the lawn and showed sky. `sealBlind` (after `blindPanes`, before furnishing) turns into wall of its box any pane on a box's outer edge that looks into that hollow, or onto anything solid (or, for a blind pane, solid one block beyond); and fills the hollow just outside a box with a room below ground with earth (470 cells). It sealed 733 panes, most where buildings meet.
- Not reached: the Hall's basement row behind the south and north terraces (r017 to r019, r004) stays navy. The terraces rise after the walls are checked and after the rooms are furnished, so sealing them later would leave their curtains on bare wall. To settle with batch A (a light well, or no window and no curtain).

Since v1.32 (the reel audit, fifth batch):
- `chapelDress`: warm stone pilasters with gilded capitals stand inside the nave between the lancets (none beside a door), and the east end has a reredos behind the altar, a crimson dossal with a gilded cross.
- `gunScreen`: the Gun Room's open screen onto the Grand Stair (cut on purpose in the source, columns at x 25 and 37) gets a third column at x 31: two bays of five. A fourth pair (x 29, 33) crowded a bay and failed the audit.
- `stairTreads` (after `genProps2`): a block stair standing in a room of the Service Wing or the Stable Court (the Tack Room's, to the lodgings) has light oak treads over a two-tone panelled body.

Since v1.33 (the reel audit, sixth batch):
- `glazeInside`: every window of the State Wing (102) gets white glazing bars on its inside face (`barsTex`, a border and a bar at every block, lit with the room, culled with the insides), so the tall bays of the Ballroom, the Orangery Link and the Theatre Foyer read as glazed and not as holes onto the sky. The window rectangles are found as `windowList` finds them.
- Deferred to batch A (the room plans): the Stable lodgings' frame pieces are taller than their two rows of glass (r141); fit the frames to the glass there, not the glass to the frames (that would change the outer walls).

Since v1.34 (batch A begins: the v20 wall plan, the door moves 13 to 17 and 21, and A2):
- `wallPlanDoors` (after the buildings, before furnishing): first cuts the doors the plan needs and the house lacked (2 wide, 5 tall, where the wall is solid and both sides clear, never in an outer wall; `__vx.TM.cut`): a passage door for the Gold, Silver, White, Yellow and Pink Bedrooms and the Convalescent Ward, and a door from His Grace's Bedchamber into his Dressing Room and Study. Then walls up the doors from room to room the plan names (`__vx.TM.walled`, 24): bedroom to bedroom on the first floor, the Grey Bedroom into His Grace's three rooms, those three into one another, Guest Bedrooms I to VIII, the Schoolroom Annexe, Laboratory, Ward, Sewing and Linen Rooms, the Box and Cistern Rooms. The nursery suite keeps its doors.
- A door is walled only if both rooms keep another way out. Two stay: the Blue Bedroom keeps its door through the Yellow, the Violet through the Pink. Both are corner rooms with no passage beside them; a passage for them would move walls the plan does not move.
- Still to build from the plan: moves 1 to 10 (the state-floor doors and arches, the Entrance Hall wall, the first-floor passages and the Long Gallery rail), 18 (the Red Staircase passage), 19, 20 and 22 (the attic rooms), 23 (the Tower Porch), and 11, 12 (the balcony doors, A4).

Since v1.35 (the v20 wall plan, moves 19 and 20; A2 done but for two corner bedrooms):
- The attic servants' rooms: on each side eight rooms 9 by 11 (`maids`, `men` in the Hall's spec), four either side of a passage 4 clear (`The Maids' Passage`, `The Footmen's Passage`, rooms in the spec, so the reach test counts them). `wallPlanDoors` walls up every door from cell to cell (12) and cuts a passage door where a cell had none (4). 18 rooms on the attic floor where there were 24.

Since v1.36 (the v20 wall plan, moves 1 to 5):
- In `gunScreen`: the Gun Room screen's narrow east bay (x 38 to 39) and the Gun Room's east door into the Double Library (x 40, z -18 to -17) are walled up; the Double Library has a new west door from the Grand Stair hall (x 40, z -31 to -30). The Oak Stair arch into the Saloon is z -25 to -23, centred between two of the Saloon's columns (they stand at z -34, -27, -20, -13, -6); the Billiard Room arch moved one bay south to z -18 to -16; the Business Room's south door moved 4 east to x -26 to -25, off the Oak Stair's steps.
- `audit_test.py` KNOWN keeps only the Chapel nave door (move 23); the six freed doors now fail the test if they come back.

Since v1.37 (the v20 wall plan finished: moves 6 to 12, 18, 22, 23; A4 done):
- Move 6: the Entrance Hall's north wall from z 0 to z 6, so the cross gallery runs the width of the state floor, 9 clear at the middle.
- Move 7: the Saloon Gallery's box starts at z -42, taking in the 1-wide strip by the Great Hall's upper wall.
- Moves 8 and 9: the Long Gallery's box ends at z -52, not -50; the passages to the Oak and Grand Stair landings are 5 clear (the door cuts by them moved with it).
- Move 10: the Great Hall's open well starts at z -59 and its rail stands at z -60 (three places: the build, the Long Gallery's two dressings). The walk over the hall is 5 clear.
- Move 18: the Red Staircase room on the second floor ends at x -25; the passage beside it is 4 clear.
- Move 22: the open attic has five rooms (`The Trunk Room`, `The Linen Store`, `The Maids' Sitting Room`, `The Lumber Room`, `The Footmen's Sitting Room`) off a passage 4 clear round the light court. The stair hall to the north and the hall before the Box and Cistern Rooms stay open, and so does the head of the Red Staircase (x -31 to -27): the Trunk Room stops at x -34 to keep its door clear of that rail. `wallPlanDoors` walls any door from these rooms into a maid's or footman's room.
- Move 23: the porch stair down to the crypt is one lane (z -90) against the north wall; the nave door is at z -88 to -86. `audit_test.py` KNOWN is empty.
- Moves 11 and 12 (A4): two glazed doors onto the south balcony, x -8 to -7 (the Orange Bedroom) and x 7 to 8 (the Grey Bedroom), y 18 to 22, given in the Hall's `doors`, so the Depot's `contours.js` v20 dresses them as balcony door cases. The balcony is stonework, not blocks: an unseen floor (y 17, z 31 to 32, x -12 to 12) and rail (z 33, and the two ends) let a walker step out. The rail stands 3 out so it does not crowd the doors.
- `ftime3.py` finds the harness beside itself.

Since v1.38 (A3, A6 and A7: the Depot v20 plan for every room; the data re-issued):
- `plan20(R,D0)` in `genProps2`: every room is planned again at furnishing by the Depot's `ROOMPLAN.plan`, from its register row as built (`regRow`: doors are the open runs of each wall at foot and head height, windows the pane runs), with `holesOf` (anything standing, every stairwell and step, and 2 blocks clear round each stairwell and step, so no piece stands at a stair head) and the Depot's type, fire wall and variant from `T20` (rooms20.json cut to name; 6 KB). Repeated rooms (maids', footmen's, guest bedrooms, lodgings) take variants 0 to 3 in turn. The old plan is the fall-back, and lends its floor, ceiling and house colour. 155 of 156 rooms are planned (4,570 pieces); the Tower Porch is too small and keeps its old dressing. `__vx.settle.plan20` counts them.
- Every room named in `T20` is furnished by plan (`k` 'P'), so the five new attic rooms and the two attic passages are planned too.
- `tools/tests/issue.py FOLDER VERSION` re-issues `room-register.json`, `windows.json` and `src/estate-plan.json` from the page (`__vx.regRow`, `__vx.holesOf`, `__vx.windows`). The register now gives each room's Depot plan type. 156 rooms, 1,010 windows and outside doors (the two balcony doors among them).
- Frame time against v1.37: level (draws 2 to 6 percent fewer, triangles up to 5 percent more).

Since v1.39 (batch A closed):
- `plan20` passes each work room its stock, as the Depot did for rooms20.json: the floor pieces of its old plan, or, where the old plan has fewer than 3 (31 rooms, His Grace's Bath among them, whose old plan was empty), the Depot's own pieces for it (`STOCK20`, 7 KB). With no stock the planner falls back to a kitchen table, crates and barrels; the Bath and the Steward's Room had that in v1.38.
- `terraceSeal` (after `sealBlind`): the Hall's basement panes behind the south and north terraces (96 cells, z 30 for x -26 to 26 and z -66 for x -14 to 14, y 1 to 7) become wall before furnishing, so there is no navy pane and no curtain there (KAIROS r004, r017 to r019; the choice the hand-off left: no window, no curtain).
- Checked and left: the curtains in His Grace's Study are the standard dressing (each 2-wide window's curtains reach onto the 3-block pier); His Grace's Bath has no outside window since v1.34.
- B4, the winter dress (`WDRESS`, `wdRoom`, `wdOutdoor`, `wdApply`): built with everything else and drawn only in December and January, of the season chosen or the real calendar. A winter piece is queued with `wint` set; `buildProps` never instances it and keeps it in its own groups (key suffix `w`), and `wdApply` sets those groups' `v` (the cull respects `v` for outdoor groups now too). Note `wd` on a group already means window detail. Indoors: on every planned fireplace a `mantelGarland` (5.5 up) and a `stockingRow` (4.5 up, half a block out), a `roastingSpit` at the Great Hall and Laundry hearths; a lit `christmasTree` and `presents` in the Depot's eight rooms at the clear spot nearest a wall and 4 or more from any door (the Ladies' Withdrawing Room has none). Outdoors: `bushLights` on the 8 topiaries and 12 box parterres, `eaveGarland` along the portico front, `lightString` between the avenue lamp posts, and 220 bulbs in one instanced mesh spiralling round the Great Cedar's tiers.
- `spotshots.py` takes the season from `SEASON` (default autumn).

Since v1.40 (His Grace's order of 16 Nov: the walking view as full as the overview; lamplight that falls off naturally, not hard yellow circles):
- The walker sees 760 blocks (`FULL.far`, was 290: `GOV.far` follows it when `FULL.on`), the whole estate from anywhere in it. The mist starts at 42 percent of that (was 24), so near things stay crisp and the far ones fade, not vanish. Indoors (`WB`) the old 170 cap and 24 percent stay. Everything that was drawn "out to the mist" (outside shells, window frames, outdoor pieces, people, flower beds, tree portraits) now goes out to 760.
- Lamplight (`LMAP`, `lampify`, `lampMapBuild`): the outdoor lamps light the ground, walls and trees through one light map over the estate, a block a texel (435 by 508, R the light, G the height of the lamp's foot), filtered linearly, sampled by every `SMAT` material and the ground. Each lamp falls off as 1/(1+d^2/22) eased to nothing at 18 blocks, and with height (from 5 below the foot to 11 above); columns under a roof take none (13,994 cells), so it never shines into a room. Its strength is `uLk`: 1.15 at night, 0.6 at dusk, 0 by day (and then the shader skips it). The flat additive discs under the outdoor lamps are gone; the indoor pools are kept but soft (a radial texture), and a little wider.
- Cost, against v1.39 (software GL, speed governor off, so the full 760): indoors level; outdoors draws level (the ground is meshed in 64-block chunks, not 32: 272 ground draws to 85 to 98; figures stop at 320 blocks on foot; small outdoor instances at 400), but triangles 1.4 to 1.9 million where they were 1.3 to 1.5, and frames 15 to 39 percent slower in the park and the villages. His Grace's iPhone held 56 to 59 fps at 1.7 to 2.6 million triangles (v1.25 test), so the phone should pay about what the overview costs; that wants his Stats test. On any device that misses its frames the governor now steps the view down too (`FULL.FAR` 760, 520, 400, 290; past 27 ms a frame), not only the resolution.

Since v1.41 (the look pass, first batch: His Grace's order of 16 Nov, the house 100 percent for the reels; KAIROS's re-sweep of v1.39 in tools/FAULTS-kairos-v139.md):
- `tools/tests/aesth.py FOLDER [OUT.json]` (with `aesth.js`): the look sweep. Clipping pairs (two standing pieces in one another, not one on the other), loose solid masses in rooms, and squeezes on foot (2 wide or less, off the wall lines), by room.
- `unclip()` after `settle()`: of any two standing pieces in one another the smaller goes (a fireplace, range, stove, four-poster, bisellium, dining or billiard table, altar is never the one), and the unseen blocks it held are freed. About 50 pieces; the sweep finds no clip after it.
- Show rooms whose walls never moved keep the Depot's hand plan (`plan20`): the Great Hall (its bisellium is where Kairos stands; without it he was not placed at all), the Saloon, Gun Room, Music Room, Ballroom, Private Theatre, and, with a looser size match, the Nave (8 pews) and the State Dining Room (its table and 14 chairs).
- Work rooms cap a piece: the stock list two of a big piece and six of a seat, the finished plan three and eight (the planner tops a room up from its stock over and over: four stoves in His Grace's Bath, identical crates and machines).
- No sash on a window under 4 blocks of glass (`K.windows`, 250 windows): the sash piece is near five blocks tall and hung over stone in the Gatehouse, the Lodge, the Farm Office, the Service Wing and the lodgings.
- A planned room with no finish takes `FDEF`'s (beamed under the attic roofs, the Drying Loft and the Ballroom Cellars, which showed the bare roof as flat green).
- `stairTreads` dresses the Hall's block stairs too (the Red Stair, the Red Staircase, the Wireless Room's).
- The forge chimney (x 132 to 133) stands against the north wall (z -111 to -110), a chimney breast in the Forge and Lodging VI, not a pillar mid-floor.
- Below stairs, the 1-wide strips by the Women's Stair and the Still Room are 4 clear: the Women's Stair room starts at z -33, the Still Room ends at z -41.

Since v1.42 (the look pass, second batch; the Ideas Board's section 9):
- Work rooms keep the planner's filler (crates, sacks, barrels, mop buckets) only if they are stores or working rooms (`STORE20`); the Billiard Room, Schoolroom, Night Nursery, Wireless Room and the rest lose it. Two of a big piece at most in a work room, eight of a seat.
- `belvCeil`: His Grace's Belvedere was open to the sky above its walls; a ceiling at the wall top, which takes its painted finish.
- Checked: every bedroom has its bed (KAIROS's views did not show some).
- The Ideas Board, section 9: the Houses take His Grace's British names (`HOUSES`: the House of the Crown, the Exchequer, the Chapel Royal, the Rolls Office, the Admiralty, the Royal Society, the Engine House, the Revels Office, the Board of Ordnance, the Horse Guards, the Drill Hall (Charcoal, was Obsidian), Below Stairs, the Drawing Room, the Yeomanry), in the room cards, the files and Find. The Schoolroom Annexe is the Genizah Writing Room (Green), its writing table the Genizah's object; the Pantry Book is on the Kitchen dresser; the commonplace book (his Notes) on the desk in His Grace's Study. The three pages are not live yet, so each object says so (GOLEM's rule 4). `src/golem-registry.json` follows.

Since v1.43 (the look pass, third batch; KAIROS's re-sweep of v1.42):
- `dropTrusses`: the Great Hall's seven hammerbeam trusses go; since move 10 they rose through the Long Gallery's walk as a brown spire on the rail (KAIROS r039a).
- `unclip` checks standing wall pieces too (consoles, side tables, dressers); hung ones are left out.
- Every planned room: one oil lamp and one table lamp at most (the blue-shaded lamp was the first thing in every view below stairs); no pendant or chandelier under a ceiling under 7 blocks (they hung at head height in the service rooms).
- The planner's filler (crates, sacks, barrels, mop buckets) stays only in true stores (`STORE20`: cellars, larders, coal store, box, trunk and lumber rooms, the barn, the brewhouse, the cistern room).
- No sash on a window one block wide (the Service Wing: stone either side of the glass); 411 windows go without.
- His Grace's Belvedere takes a plaster ceiling: its painted sky read as open sky.

Since v1.44: the copyright, His Grace's choice of 16 Nov (held as Euphrates Hall): `LICENSE` (all rights reserved, no licence granted, not open source), `README.md`, a comment at the top of `src/index.html` (kept in the built copy), and "© 2026 Euphrates Hall. All rights reserved." small at the bottom left of the overview (`#copy`), hidden on foot.

Since v1.45 (KAIROS's sweep of v1.43): `tidy()` after `unclip` and `dropTrusses`, on the finished house whatever placed each piece: no pendant or chandelier where floor to ceiling is 7 or less (128; below stairs, the second floor and the Service Wing are 7 or under, so v1.43's plan rule missed them); no planner filler outside a store (`STORE20` loses the cistern room; 17); one oil or table lamp a room, and none on a writing desk, which carries its own green lamp (8); no candle in a washstand's jug (20); no small table piece standing in another (9); no wall lantern below 1.6 (by its box); no statue, bust, armour or torchere within 2 of a doorway. Frame time level.

Since v1.46 (privacy; GOLEM's rule 5, KAIROS's order): no claude.ai link and no private page title in the public page or the built copy (grep: 0). `URLS`, `HOUSEDOCS` and the Manual's link come from `PRIV`, read from local storage key `eh-links`; His Grace sets it once on each device by opening the Estate at `#links=<base64url JSON>` (his private link, never in the repo), and the address is cleared at once. Without it every record says "Not yet linked." `src/golem-registry.json` keeps page ids and status, not titles. `__vx.URLS` shows what a device holds. No change to drawing; frame time not affected.

Since v1.47 (the student goal path; GOLEM's spec, His Grace's choice "free, on the device"): `GOAL`, `goalOpen`, `goalPaint`, `goalInit`. "Set a goal" under Stats on the overview, and the Schoolroom's first object "The slate: set a goal" (`run(['goal'])`), open a panel: the goal (80 characters), up to five steps (reorder, remove; over 80 warns), the path (the first unfinished step is the Next action, Done, ticks, Edit steps, Start over with a confirm), and Goal done. Saved only in this browser (`eh-goal`). Once a goal is saved, "Next action: ..." shows above the building names on the overview and opens the path. The copyright line moved under the brand, clear of the building names. `tools/tests/goal_test.py` walks it all (20 checks) and is in the gate.

Since v1.48 (the look pass from His Grace's brief of 16 Nov, first part):
- Lighting: indoors the sky light takes `INLIGHT` (warm white by day, golden at dusk, lamp-warm at night) in place of the sky's colours; dusk no longer tints rooms pink-violet and day rooms are not grey. The tree portraits are lit, and signed (`impLightSig`), by the time of day's outdoor sky colours, not the live light: with the live light they re-photographed every frame indoors (+150 percent frame time, found and fixed before shipping). Lamplight a little softer (night 0.85, dusk 0.45) so faces do not glow under the lamps.
- Seams: every tiled wall run (dado, cornice, panelling and the rest, `K.tile`) draws its bays 4 percent wider (`it.sx`), so neighbours overlap and no hairline of light shows between them.
- Stairs: `flight()` now builds every lesser stair as a fine flight (`flight2`, marked `lesser`): treads, risers, strings, balusters and a rail; 20 flights in all, each climbed up and down by the walk test (a lesser stair whose foot meets a wall is entered from the side, from its end tread). Headroom is cut over the lanes only. `stringClear` (after `wallPlanDoors`) clears the unseen side strings within 2 of a doorway at the foot and the head of each lesser stair, and walls up a door that opened onto the side of a stair. Audit KNOWN: the Wine Cellar door and the Tack Room door, each two blocks from a stair foot.
- Overview labels give way to the nearer one when they would overlap (sizes measured once by text, `LBLSZ`). Stats shows only on His Grace's device (with his links) or with ?stats. A room named as its House reads "(main room)" on its card.
- The Great Hall: the tall-backed chairs in the line between the hall and the bisellium go (4), so Kairos is not hidden below the shoulders.
- Private links taken out of CLOUD.md, depot/HANDOFF.md, depot/rooms.json, depot/seriesview.js, depot/worldview.js; the registry's "$10k Plan" object name trimmed. History is not rewritten.
- Frame time level with v1.47.
