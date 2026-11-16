"""The look sweep. python3 aesth.py FOLDER [OUT.json]: clipping pieces, loose solid blocks in rooms, squeezes on foot, by room."""
import sys, os, json, collections
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from harness import serve, open_estate
from playwright.sync_api import sync_playwright
D = os.path.dirname(os.path.abspath(__file__))
with serve(sys.argv[1]) as base, sync_playwright() as p:
    b, pg, err = open_estate(p, base); pg.wait_for_timeout(3000)
    pg.evaluate('()=>{' + open(os.path.join(D, 'audit.js')).read() + '}'); pg.evaluate('()=>{' + open(os.path.join(D, 'aesth.js')).read() + '}')
    r = pg.evaluate('()=>({clips:__aesth.clips(),stray:__aesth.stray(),narrow:__aesth.narrow()})'); b.close()
if len(sys.argv) > 2: json.dump(r, open(sys.argv[2], 'w'), indent=0)
print('clips', len(r['clips']), 'stray', len(r['stray']), 'loose (not on a wall)', sum(1 for s in r['stray'] if not s['wall']), 'squeezes', len(r['narrow']), 'errors', err)
print('clips by room', collections.Counter(c['room'] for c in r['clips']).most_common(12))
print('clip kinds', collections.Counter(tuple(sorted((c['a'], c['b']))) for c in r['clips']).most_common(12))
print('loose', [(s['room'], s['n'], s['box']) for s in r['stray'] if not s['wall']][:25])
print('squeezes', collections.Counter(n['room'] for n in r['narrow']).most_common(25))
