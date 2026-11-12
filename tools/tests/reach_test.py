#!/usr/bin/env python3
"""Reach test: from the front lawn spawn (x 0, z 58), flood the estate on foot
with the game's own moveTo, fall and goStairs, and confirm every room is reached.

usage: reach_test.py FOLDER [index.html]
"""
import sys, time, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from harness import serve, open_estate
from playwright.sync_api import sync_playwright

JS = r'''(NOSTAIRS) => {
const v = __vx, PL = v.PL, B = v.BLD;
const save = JSON.stringify(PL);
const settle = () => { PL.vy = 0; PL.air = 1; for (let i = 0; i < 600; i++) { v.fall(1/60); if (!PL.air) break; } };
const key = (x, z, y) => x + ',' + z + ',' + Math.round(y * 2);
const seen = new Set(), q = [];
const push = (x, z, y) => { if(x<X0||x>X1||z<Z0||z>Z1)return; const k = key(x, z, y); if (seen.has(k)) return; seen.add(k); q.push([x, z, y]); };
PL.x = 0; PL.z = 58; PL.y = .5; PL.sit = null; settle(); 
const stairsDone = new Set();
let X0=1e9,X1=-1e9,Z0=1e9,Z1=-1e9;for(const b of B.slice(1))for(const k of b.boxes){X0=Math.min(X0,k.x0);X1=Math.max(X1,k.x1);Z0=Math.min(Z0,k.z0);Z1=Math.max(Z1,k.z1)}
X0-=8;X1+=8;Z0-=8;Z1=Math.max(Z1+8,60);push(0, 58, PL.y);
const LIMIT = 4000000; let n = 0;
while (n < q.length && n < LIMIT) {
  const [x, z, y] = q[n++];
  for (const [dx, dz] of [[1,0],[-1,0],[0,1],[0,-1]]) {
    PL.x = x; PL.z = z; PL.y = y; PL.vy = 0; PL.air = 0;
    if (v.moveTo(x + dx, z + dz)) { settle(); if (Math.abs(PL.x - (x+dx)) < .01 && Math.abs(PL.z - (z+dz)) < .01) push(x + dx, z + dz, PL.y); }
  }
  if (!NOSTAIRS) for (const dir of [1, -1]) {
    const sk = x + ',' + z + ',' + Math.round(y) + ',' + dir;
    if (stairsDone.has(sk)) continue; stairsDone.add(sk);
    PL.x = x; PL.z = z; PL.y = y; PL.vy = 0; PL.air = 0;
    v.goStairs(dir);
    if (PL.x !== x || PL.z !== z || PL.y !== y) { const nx = Math.round(PL.x), nz = Math.round(PL.z); PL.x = nx; PL.z = nz; settle(); push(nx, nz, PL.y); }
  }
}
// which rooms were stood in
const rooms = [];
for (const b of B.slice(1)) for (const R of b.rooms) rooms.push({b: b.name, n: R.n, x0: R.x0, x1: R.x1, z0: R.z0, z1: R.z1, y0: R.y, y1: (R.yt != null ? R.yt : R.y + 6), hit: 0});
for (const k of seen) {
  const [x, z, y2] = k.split(',').map(Number), y = y2 / 2;
  for (const R of rooms) if (!R.hit && x > R.x0 && x < R.x1 && z > R.z0 && z < R.z1 && y >= R.y0 && y < R.y1) R.hit = 1;
}
Object.assign(PL, JSON.parse(save));
const byB = {};
for (const R of rooms) { const e = byB[R.b] = byB[R.b] || [0, 0]; e[0] += R.hit; e[1]++; }
return {bbox:[X0,X1,Z0,Z1],cells: seen.size, steps: n, capped: n >= LIMIT, total: rooms.length, hit: rooms.filter(r => r.hit).length,
        byB, missed: rooms.filter(r => !r.hit).map(r => r.b + ': ' + r.n + ' (y ' + r.y0 + ')')};
}'''


def main(folder, page='index.html', mode=''):
    with serve(folder) as base, sync_playwright() as p:
        b, pg, errors = open_estate(p, base, page)
        t = time.time()
        r = pg.evaluate(JS, mode == 'walk')
        b.close()
    print(r['bbox'], 'steps', r['steps'], 'capped', r['capped']);print('reach: %d of %d rooms on foot (%d cells, %.1fs)' % (r['hit'], r['total'], r['cells'], time.time() - t))
    for name, (h, n) in r['byB'].items():
        print('  %-28s %3d / %3d' % (name, h, n))
    for m in r['missed']:
        print('  MISSED', m)
    if errors:
        print('page errors:', errors)
    ok = (r['hit'] == r['total'] or mode == 'walk') and not errors and not r['capped']
    if mode == 'walk': print('WALK-ONLY (no Upstairs button): %d of %d' % (r['hit'], r['total']))
    print('REACH TEST', 'PASS' if ok else 'FAIL')
    return ok


if __name__ == '__main__':
    sys.exit(0 if main(*sys.argv[1:]) else 1)
