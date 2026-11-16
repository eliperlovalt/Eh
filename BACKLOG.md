# Voxel Estate backlog: every idea not yet built

Issued 14 November 2026 by Kairos XI, at v1.19. His Grace strikes or keeps each line; struck lines are marked `[struck]` and left in place, never deleted.
Owner key: **Estate** and **Depot** are now both Claude Code (order of 14 Nov): **Depot** means make or take the part in `depot/` first, then place it, **His Grace** (a choice he must make), **Verify** (may already exist; check the source before building).
Work order when nothing else is said: section A, then B, then whatever he picks.

## His Grace's order, 14 November 2026, 3:00 AM: keep all, do it all
He kept every line. Work through the whole list in one sustained run, without stopping to ask between items, under these terms:
- **Redundant or done already:** if an item is already built, is covered by another item, or no longer makes sense against the source, skip it. Mark it `[done]` or `[redundant]` with one line saying why. Do not build it twice.
- **Depot items:** Claude Code now does the Depot's work too. Depot v20 already delivered A3 (rooms20.json), A4 (balcony door case), A5 (glazing cross), A6 (wall art in each plan), B2 (hero trees), B5 (spring) and the indoor half of B4 (winter dress per room): fit them. Make the rest yourself in `depot/` (B1 werewolf, B3 the lights evergreen if greatCedar does not serve, the outdoor half of B4, C5 portraits), measured as the Depot measured.
- **His Grace's calls (B7, B8, C4, F4) and the design-first items (D1, E2):** gather all of them into one short multiple-choice quiz, ask it once near the start, then carry on with the answers. Do not stop the run for any other question.
- **Ship in safe batches:** one batch per section or so. Every push passes the walk, reach and audit tests on both copies and the frame-time check, and bumps the version. A batch that fails is fixed before the next starts.
- **At the end:** one report to His Grace: what was built, what was skipped and why, what waits on the Depot, and the live link.

## The quiz, 15 November 2026
D1: a room-first registry (a room opens its Color's landing page, listed objects their own page, anything unlisted says it is not yet linked). E2: daily wins pay sestertii (4 to a denarius, 25 denarii to an aureus); unbroken days rank Tiro, Legionary at 7, Veteran at 30; kept on the device. C4: the hold stays. B7, B8: no change. The other chat's ten: the phone test first, then this backlog; tree portraits from 50 blocks on phones; its gate and hooks merged.

## A. Version 20 (agreed; the Depot works first)
- [x] A1. Build the 23 inner wall moves in `wall-moves-v20.json`: no passage under 5 clear on the state and first floors, under 4 elsewhere; free the 7 crowded doors. (Estate) [done] v1.34 to v1.37: all 23 moves built; every passage meets the rule; the seventh crowded door (the Chapel nave) freed by move 23, so the audit list of crowded doors is empty.
- [ ] A2. Every bedroom one door onto a passage, suites excepted; the attic maids' and footmen's cells rebuilt as eight rooms each side of a passage. (Estate) [part, v1.34] Every bedroom and guest or ward room has a door onto a passage, except the Blue and Violet Bedrooms (corner rooms with no passage beside them; each keeps its door through a neighbour). The attic cells: [done] v1.35, eight rooms 9 by 11 either side of a passage on each side, one door each.
- [x] A3. Fit the Depot's new room plan for every one of the 157 rooms in `room-register.json`; no copied sets. (Depot, then Estate) [done] v1.38 and v1.39: every room (155 of 156; the Tower Porch is too small and keeps its dressing) planned at build by the Depot's own planner from its register row as built, with the Depot's type, fire wall, variant and stock; no two rooms share a set.
- [x] A4. A pair of glazed doors onto the south balcony from the Orange and Grey Bedrooms. (Depot surround, Estate opening) [done] v1.37: two glazed doors (x -8 to -7 and 7 to 8, y 18 to 22) in the Hall's doors list, dressed by contours.js v20 as balcony door cases; an unseen floor and rail on the balcony.
- [x] A5. The slim glazing cross on every window surround (His Grace said yes). (Depot) [done] v1.22: contours.js v20 fitted; the slim cross is on every dressed window.
- [x] A6. The Depot's wall art plan, placed by rule per wall. (Depot, then Estate) [done] v1.38: each plan's wall art (the planner's art rules) is placed with it.
- [x] A7. Re-issue `estate-plan.json`, `windows.json` and the register as built in v20, and tell the Depot the floor plan is settled. (Estate) [done] v1.38 and v1.39: tools/tests/issue.py re-issues room-register.json (156 rooms, with each room's plan type), windows.json (1,010) and src/estate-plan.json from the page. The floor plan is settled.

## B. Andy's Notes, still open
- [x] B1. A proper werewolf figure with a prowling pose (today a dark dog at 2.4 scale). (Depot) [done] v1.22: the Depot made it in props6.js (v20); fitted as a prowling figure, two halves of a stride shown in turn, on the old route.
- [x] B2. Hero trees: a few larger, finer species placed at set points in the park. (Depot, then Estate) [done] v1.22: greatOak, greatCedar and greatBeech (trees.js v2) at the set points on the lawns.
- [x] B3. An evergreen built to carry Christmas lights, in place of the stand-in Great Cedar at x -50, z 125. (Depot) [done] v1.22: the Depot's greatCedar now stands at x -50, z 125; it is an evergreen and serves. The lights go on it with B4.
- [x] B4. Winter dress as season kits: lights and garlands on trees, bushes and eaves; stockings over fireplaces; an indoor tree; something roasting at a hearth. (Depot, then Estate) [done] v1.39: shown in December and January. Indoors: a garland and stockings on every planned mantel, a lit Christmas tree with presents in seven of the Depot's eight rooms (the Ladies' Withdrawing Room has no clear spot), a roasting spit at the Great Hall and Laundry hearths. Outdoors: lights on the topiary and box parterres, a fir garland along the portico, strings of lights between the avenue lamps, a spiral of lights on the Great Cedar.
- [x] B5. Stronger spring bloom in the Depot's flower and season kits. (Depot) [done] v1.22: seasons.js v2 and flowers.js v2 fitted.
- [x] B6. Flower beds bloom by real season, not all at once. (Verify, then Estate) [done] already built: each flower species blooms in its own window of the real year (FLOWERS stage by day of year).
- [x] B7. The pointer: keep the gold arrow, or pick from three more designs. (His Grace) [done] quiz, 15 Nov: keep the gold arrow.
- [x] B8. Look speed: confirm Steady as the default on phone and PC. (His Grace) [done] quiz, 15 Nov: Steady stays the default (it already was).

## C. People and animals
- [ ] C1. Bodies use doors and stairs instead of stopping at them. (Estate)
- [ ] C2. People sit in chairs and work at their stations. (Estate)
- [ ] C3. Every agent can be spoken to. (Estate)
- [x] C4. Household faces in fine voxel detail; on hold since 12 Nov (Kairos's face is done). (His Grace to lift the hold) [on hold] quiz, 15 Nov: His Grace keeps the hold.
- [ ] C5. Saloon Gallery portraits, lifelike voxel, no likenesses of living people. (Depot, then Estate)
- [x] C6. A guided tour by Kairos so objects can be found in so large a house. (Verify, then Estate) [done] already built: Find, then "Take the tour with Kairos".

## D. GOLEM inside the Estate (the "nervous system")
- [ ] D1. Redesign the wiring: one registry of objects to pages, in place of the fixed `URLS`, `ROOMOF` and `HOUSEDOCS` tables; no object ever lands on a front page. (Estate, design with His Grace first)
- [ ] D2. Each Color's main room opens that Color's landing page; specific objects open specific pages. (Estate)
- [ ] D3. The Kairos figure links to an old chat; point it at the current Kairos. (Estate)
- [ ] D4. The Library room: click a shelf or book for a menu of his books by genre, reachable only from inside the Estate. (Verify against "The Library" directions, then Estate)
- [ ] D5. The Pantry's grounds records kept in the kitchen downstairs. (Estate)
- [ ] D6. The Genizah gets a writing room inside the mansion, not an outside building. (Estate)
- [ ] D7. His Notes, with Kairos's synthesis, filed as one doc at a place in the house. (Estate)
- [ ] D8. Kairos inside the Estate: talk by voice (Wispr Flow in, the ElevenLabs Kairos voice out), then the standalone Kairos. (Estate, after the Jarvis voice work)

## E. The game layer
- [ ] E1. In-game chores tied to real chores: crops, feeding and petting animals. (Estate)
- [ ] E2. The coin economy (sestertius, denarius, aureus), a daily wins checklist that pays, streaks as legion ranks (Tiro, Legionary, Veteran). (Estate, design with His Grace first)
- [ ] E3. Tap a wing to lift its roof and see the floor in section with people at work. (Estate)
- [ ] E4. Switchable skins: light and dark at least. (Estate)
- [ ] E5. Real weather. (Estate)

## F. Shipping
- [ ] F1. A public template build with none of his private GOLEM in it. (Estate)
- [ ] F2. The Estate (and the Globe) packaged for the App Store: requirements, security, legal. (Estate)
- [x] F3. A test on a real phone with numbers: load time, frame rate, memory. (Estate) [done] 15 Nov, His Grace's iPhone (iOS 18.7, Safari, Apple GPU, drawn at 1.5x), v1.25: first frame 3.7 s; 59 fps (17 ms median, 18 ms worst 5 percent) at the lawn, the Saloon, the park, the village and the north garden; 56 fps over the estate (21 ms worst). Memory is not given by Safari. Notes in tools/README.md.
- [x] F4. Claude Code's ten optimisation suggestions, once reported. (His Grace to rank) [done] reported in v1.20; His Grace ordered all ten done (14 Nov). The other chat's ten (15 Nov) are ranked: the phone test first, then this backlog.

## G. Small faults
- [ ] G1. Pale parapets on the service stair. (Estate)
