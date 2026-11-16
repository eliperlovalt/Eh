# Status at halt (VOXEL II, 16 Nov 2026)

Halted on His Grace's order, relayed by KAIROS: usage nearly spent, away about four days. Nothing half-done is in the page.

## Live
- v1.36, commit 4df5d3f on `main`: https://eliperlovalt.github.io/Eh/
- All six gate tests pass on v1.36 (re-run by VOXEL II on 16 Nov).
- This chat's work is on the branch `claude/artifact-link-reference-lrp3gp`, not on `main`. It changes no page.

## Batch A
- Shipped (by VOXEL): wall plan moves 1 to 5, 13 to 17, 19 to 21 (v1.34 to v1.36), A2 except the Blue and Violet Bedrooms (accepted).
- Left: wall moves 6, 7, 8, 9, 10, 18, 22, 23 (23 needs the Tower Porch stair moved; then drop the Chapel nave door from `audit_test.py` KNOWN); A4 balcony doors (moves 11, 12); A3 and A6 room plans from `depot/rooms20.json`, with the deferred faults (Stable lodgings' frames, the Hall's basement row behind the terraces, the pier piece in His Grace's Study and Bath); A7 re-issue `room-register.json`, `windows.json`, `src/estate-plan.json`, then send KAIROS the version.
- Then batch B: only B4 (winter dress) is left.

## Started, not finished: `tools/wip/v137-walk-distance-and-lamplight.patch`
His Grace's new goals (16 Nov): full detail at distance while walking, softer lamplight at dusk and night, and the Estate picture perfect with KAIROS. The patch applies to v1.36's `src/index.html` with `git apply`. It holds:
1. Walk view distance 290 to 760 blocks (`FULL.far`), mist starting at 42 percent of it, not 24. Screenshots showed the chapel tower and far trees where there was white mist. Frame time NOT yet measured: run `ftime3.py` before shipping.
2. Lamplight: the outdoor lamps' flat yellow discs replaced by a light map over the estate (`LMAP`, `lampify` on every `SMAT` material and the ground), with a soft falloff and no edge, none under roofs. Indoor pools get a soft radial texture. NOT yet looked at in a screenshot or tested.
Next step: apply the patch, shoot dusk and night (`spotshots.py`, poses in `tools/FAULTS-kairos.md` style), tune, run `ftime3.py` and the gate, ship as v1.37.

## Received from the other chats (saved here)
- `tools/FAULTS-kairos.md`: KAIROS's 31 open structure faults and the room-contents rows, with poses.
- `src/golem-registry.json`: GOLEM's approved registry v1 (Houses, rooms, objects, page ids and status). The page URLs are not in the public repo: registry rule 5 says no link of His Grace's ships in the public page. GOLEM holds them (`C:\Users\Elijah\Jarvis\Golem\registry.json`). Landing pages moved with GOLEM v0.26 (ids unchanged).

## Waiting on His Grace
1. Going live: this chat may only push to its branch. Merge it to `main`, or give leave to push to `main`.
2. The registry's links: how should his private links reach the page if the public page ships blank (a private file on his PC, a link only he holds, or ship them public as now)?
3. His photos of good shots and of problems, to hand to KAIROS and VOXEL.
