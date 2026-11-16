"""Estate audit test (v1.15). python3 audit_test.py FOLDER
Doors: every door is found (a gap one to four blocks wide in a room wall, and every outside door) and its approach is checked:
  no free-standing piece within two blocks of the door line, no wall piece hanging into the opening.
  Structure that crowds a door (a column, a stair) is listed by name as awaiting the floor plan; anything not on that list fails.
Rugs and floors: no two rugs overlap at one height, none lies within a hair of the floor finish, none over a hole or through a wall.
Wall pieces: the lower edge of every hung piece sits above one third of its wall."""
import sys, json, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from harness import serve, open_estate
from playwright.sync_api import sync_playwright

# doors crowded by the building itself, not by furniture. They wait for the floor plan (v1.15 primer, order 5).
# v1.36: the wall plan's moves 1 to 5 freed six of the seven (the Business Room door, the Oak Stair and Billiard Room bays, the three doors by the
# men's stair). They are gone from this list, so if one comes back it fails. v1.37: move 23 freed the Chapel nave door; the list is empty.
KNOWN = {
    '1,0,z,40,-18': 'Wine Cellar door: the men\'s stair foot two blocks off (v1.48, now a fine flight)',
    '6,0,x,-98,117': 'Tack Room outside door: the tack stair foot two blocks off (v1.48, now a fine flight)',
}
folder = sys.argv[1]
fails = []


def check(name, ok, detail=''):
    print('  %-58s %s %s' % (name, 'ok' if ok else 'FAIL', detail))
    if not ok:
        fails.append(name)


with serve(folder) as base, sync_playwright() as p:
    b, pg, err = open_estate(p, base)
    pg.evaluate('()=>{' + open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'audit.js')).read() + '}')
    r = json.loads(pg.evaluate("""()=>{const A=__audit,d=A.doorFaults(),g=A.rugFaults(),h=A.hangFaults();
      return JSON.stringify({doors:d.doors,df:d.faults.map(f=>({key:[f.door.bid,f.door.y,f.door.axis,f.door.w,f.door.a0].join(','),room:f.door.room,props:f.props,blocked:f.blocked,invs:f.invs})),
        rugs:g.rugs,pairs:g.pairs.length,thin:g.thin.length,holes:g.holes.length,hung:h.hung,low:h.faults.length,lowk:h.faults.slice(0,8).map(f=>f.k+'@'+f.x.toFixed(0)+','+f.z.toFixed(0)),settle:__vx.settle||null})}"""))
    print('doors %d, rugs %d, hung pieces %d' % (r['doors'], r['rugs'], r['hung']))
    furn = [f for f in r['df'] if [k for k in f['props'] if k != 'column'] or f['blocked']]
    check('no furniture, plant, lamp, sash or picture in any door', not furn, '; '.join('%s: %s' % (f['room'], ','.join(f['props'])) for f in furn[:6]))
    struct = [f for f in r['df'] if f not in furn]
    new = [f for f in struct if f['key'] not in KNOWN]
    check('no new door crowded by a stair or a column', not new, '; '.join('%s %s' % (f['room'], f['key']) for f in new[:6]))
    for f in struct:
        if f['key'] in KNOWN:
            print('    awaiting the floor plan: %s' % KNOWN[f['key']])
    check('no two rugs overlap at one height', r['pairs'] == 0, str(r['pairs']))
    check('no rug within a hair of the floor finish', r['thin'] == 0, str(r['thin']))
    check('no rug over a hole or through a wall', r['holes'] == 0, str(r['holes']))
    check('every hung piece sits above a third of its wall', r['low'] == 0, '%d %s' % (r['low'], r['lowk']))
    check('no page errors', not err, str(err[:2]))
    if r['settle']:
        print('  settle:', json.dumps(r['settle']))
    b.close()
print('AUDIT TEST ' + ('PASS' if not fails else 'FAIL: ' + ', '.join(fails)))
sys.exit(1 if fails else 0)
