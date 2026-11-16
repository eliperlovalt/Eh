# Status (VOXEL II, 16 Nov 2026; resumed after the halt)

## Where things stand
- Live on `main` (GitHub Pages): still v1.36. Everything below is on the branch `claude/artifact-link-reference-lrp3gp`; it goes live when His Grace merges it into `main` (or gives leave to push to `main`).
- Branch head: v1.40 (commit 495501d). Every gate passes on both copies at every version.
- v1.37: the rest of the v20 wall plan (moves 6 to 12, 18, 22, 23) and the balcony doors (A4). A1 and A4 done.
- v1.38 and v1.39: every room re-planned by the Depot's planner (A3, A6), the register, windows and estate plan re-issued (A7, `tools/tests/issue.py`), the basement panes behind the terraces walled, the winter dress (B4). Batch A and batch B closed. KAIROS has v1.39 for its re-sweep.
- v1.40: the walking view out to 760 blocks (was 290), and soft lamplight. Costs 15 to 39 percent outdoors in software GL with the governor off; on a slow device the governor now steps the view back to 290. Wants His Grace's phone Stats test before it goes live.

## Next
1. KAIROS's re-sweep of v1.39 and fixes, in tested batches.
2. Batch C (people and animals), then D (the GOLEM wiring: `src/golem-registry.json` holds GOLEM's approved registry without his links), E, F, G, as `BACKLOG.md` orders.
3. The copyright notice task from KAIROS (see below), when His Grace confirms the name.

## Waiting on His Grace
1. Merge the branch to `main`, or leave to push to `main`.
2. v1.40: keep the 760-block walking view, or a shorter one (520, 400), after a Stats test on the phone.
3. Copyright: the LICENSE would carry his full legal name in a public repository; is that the name he wants, or "Euphrates Hall"?
4. His private links for the registry: the public page ships blank by GOLEM's rule 5. Where do his links come from?

## The copyright task (from KAIROS, 16 Nov; not started)
LICENSE at the root ("Copyright (c) 2026 <name>. All rights reserved." and no licence granted without written permission); "© 2026 Euphrates Hall. All rights reserved." in the settings or about panel and the overview, never over the walking view; the same at the top of `src/index.html` and in the README; gate, tests and a version bump; report the version to KAIROS.
