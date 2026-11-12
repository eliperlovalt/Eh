#!/usr/bin/env python3
"""Walk test: landscape phone (844 by 390), enter walk mode, press every walk
button, exercise flight, fail on any page error.

usage: walk_test.py FOLDER [index.html]
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from harness import serve, open_estate
from playwright.sync_api import sync_playwright

TAP = '''(id) => { const e = document.getElementById(id); if (!e) return 'missing';
  const o = {bubbles: true, cancelable: true, pointerId: 7, pointerType: 'touch', clientX: 5, clientY: 5};
  e.dispatchEvent(new PointerEvent('pointerdown', o)); e.dispatchEvent(new PointerEvent('pointerup', o)); e.click(); return 'ok'; }'''
TAP2 = '''(id) => { const e = document.getElementById(id);
  const o = {bubbles: true, cancelable: true, pointerId: 7, pointerType: 'touch', clientX: 5, clientY: 5};
  for (let i = 0; i < 2; i++) { e.dispatchEvent(new PointerEvent('pointerdown', o)); e.dispatchEvent(new PointerEvent('pointerup', o)); } }'''
KEY2 = '''() => { for (let i = 0; i < 2; i++) { dispatchEvent(new KeyboardEvent('keydown', {key: ' ', bubbles: true, cancelable: true})); dispatchEvent(new KeyboardEvent('keyup', {key: ' ', bubbles: true, cancelable: true})); } }'''
FRAMES = '(n) => { for (let i = 0; i < n; i++) __vx.fall(1/60); return __vx.PL.y; }'


def main(folder, page='index.html'):
    fails = []

    def check(name, cond, detail=''):
        print('  %-52s %s %s' % (name, 'ok' if cond else 'FAIL', detail))
        if not cond:
            fails.append(name)

    with serve(folder) as base, sync_playwright() as p:
        b, pg, errors = open_estate(p, base, page)
        ver = pg.evaluate("() => { __vx.setMode('over'); return document.getElementById('brandS').textContent }")
        print('  brand line:', ver)
        pg.evaluate(TAP, 'bWalk')
        check('walk mode on', pg.evaluate("() => document.getElementById('walk').classList.contains('on')"))
        ids = pg.evaluate("() => [...document.querySelectorAll('#walk button')].map(b => b.id)")
        for i in ids:
            if i == 'bBack':
                continue
            check('press ' + i, pg.evaluate(TAP, i) == 'ok')
            pg.evaluate('() => { __vx.PL.auto = 0; __vx.PL.sit = null }')
        pg.evaluate("() => { if (__vx.PL.fly) __vx.setFly(0, 1); const P = __vx.PL; P.x = 0; P.z = 58; P.y = .5; P.vy = 0; P.air = 0 }")
        if pg.evaluate('() => typeof __vx.setFly') == 'function':
            # double-tap Jump on the phone pad
            pg.evaluate("() => { __vx.PL.air = 0 }")
            pg.evaluate(TAP2, 'bJump')
            check('double-tap Jump starts flight', pg.evaluate('() => __vx.PL.fly') == 1,
                  pg.evaluate("() => document.getElementById('bJump').textContent + '/' + document.getElementById('bSprint').textContent"))
            y0 = pg.evaluate('() => __vx.PL.y')
            y1 = pg.evaluate('(n) => { const P = __vx.PL; P.up = 1; for (let i = 0; i < n; i++) __vx.fall(1/60); P.up = 0; return P.y }', 120)
            check('Up rises', y1 > y0 + 15, '%.1f to %.1f' % (y0, y1))
            y2 = pg.evaluate(FRAMES, 60)
            check('hovers with no input', abs(y2 - y1) < .01)
            pg.evaluate('() => { __vx.PL.dn = 1 }'); y3 = pg.evaluate(FRAMES, 600)
            check('Down sinks and lands', abs(y3 - .5) < .01 and pg.evaluate('() => __vx.PL.fly') == 0, 'y %.2f' % y3)
            pg.evaluate('() => { __vx.PL.dn = 0 }')
            check('labels restored', pg.evaluate("() => document.getElementById('bJump').textContent") == 'Jump')
            # keyboard: double-tap Space, hold Space, Shift
            pg.evaluate(KEY2)
            check('double-tap Space starts flight', pg.evaluate('() => __vx.PL.fly') == 1)
            pg.keyboard.down('Space'); y4 = pg.evaluate(FRAMES, 60); pg.keyboard.up('Space')
            check('Space rises', y4 > 5, 'y %.1f' % y4)
            pg.keyboard.down('Shift'); y5 = pg.evaluate(FRAMES, 600); pg.keyboard.up('Shift')
            check('Shift sinks and lands', abs(y5 - .5) < .01 and pg.evaluate('() => __vx.PL.fly') == 0)
            pg.evaluate(KEY2)
            pg.wait_for_timeout(450)
            pg.evaluate(KEY2)
            check('double-tap again ends flight', pg.evaluate('() => __vx.PL.fly') == 0)
            pg.evaluate(FRAMES, 600)
            # ceilings: fly up inside every room, the head must never enter a solid
            r = pg.evaluate('''() => { const v = __vx, P = v.PL; let bad = [], n = 0;
              for (const B of v.BLD.slice(1)) for (const R of B.rooms) {
                P.x = R.c[0]; P.z = R.c[2]; P.y = R.y + .5; P.vy = 0; P.air = 0; P.sit = null;
                let ok = false; for (let r = 0; r < 6 && !ok; r++) for (let dx = -r; dx <= r && !ok; dx++) for (let dz = -r; dz <= r && !ok; dz++) {
                  const x = R.c[0] + dx, z = R.c[2] + dz; if (v.G(x, R.y, z) && !v.G(x, R.y + 1, z) && !v.G(x, R.y + 2, z) && !v.G(x, R.y + 3, z)) { P.x = x; P.z = z; ok = true } }
                if (!ok) continue; n++;
                v.setFly(1, 1); P.up = 1; for (let i = 0; i < 900; i++) v.fall(1/60); P.up = 0;
                let ceil = null; for (let y = R.y + 1; y < 80; y++) if (v.G(P.x, y, P.z)) { ceil = y; break }
                if (ceil != null && P.y + 2.4 > ceil - .5 + .001) bad.push(B.name + ': ' + R.n + ' y ' + P.y.toFixed(2) + ' ceil ' + ceil);
                if (ceil == null && R.y < 30) bad.push('no ceiling found over ' + R.n);
                v.setFly(0, 1); }
              P.x = 0; P.z = 58; P.y = .5; P.vy = 0; P.air = 0; return {n, bad} }''')
            check('flight stops at the ceiling in %d rooms' % r['n'], not r['bad'], '; '.join(r['bad'][:6]))
        else:
            print('  (no flight in this build)')
        # v1.11 checks
        if pg.evaluate('() => typeof __vx.photo') == 'function':
            pg.evaluate("() => { const P = __vx.PL; P.x = 0; P.z = 58; P.y = .5; P.vy = 0; P.air = 0 }")
            pg.evaluate(KEY2); pg.keyboard.down('Space'); pg.evaluate(FRAMES, 90); pg.keyboard.up('Space')
            pg.keyboard.down('c'); yc = pg.evaluate(FRAMES, 900); pg.keyboard.up('c')
            check('C sinks and lands', abs(yc - .5) < .01 and pg.evaluate('() => __vx.PL.fly') == 0, 'y %.2f' % yc)
            pg.evaluate(KEY2)
            pg.evaluate("() => { for (let i = 0; i < 2; i++) dispatchEvent(new KeyboardEvent('keydown', {key: 'w', bubbles: true})) }")
            check('double-tap W is fast flight', pg.evaluate('() => __vx.PL.ffast') == 1)
            pg.evaluate("() => dispatchEvent(new KeyboardEvent('keyup', {key: 'w', bubbles: true}))")
            check('releasing W ends fast flight', pg.evaluate('() => __vx.PL.ffast') == 0)
            pg.evaluate('() => __vx.setFly(0, 1)'); pg.evaluate(FRAMES, 600)
            pg.evaluate("() => document.getElementById('bPhoto').click()")
            check('photo mode hides the buttons', pg.evaluate("() => document.body.classList.contains('photo') && getComputedStyle(document.getElementById('top')).display === 'none'"))
            pg.evaluate(TAP, 'photoX')
            check('photo mode ends from the corner', pg.evaluate("() => !document.body.classList.contains('photo')"))
            pg.evaluate("() => __vx.pickTime('live')"); pg.wait_for_timeout(1200)
            check('live sky on', pg.evaluate("() => document.querySelector('#tod [data-t=live]').classList.contains('on')"), pg.evaluate('() => __vx.sea().label'))
            pg.evaluate("() => __vx.pickTime('day')")
            r = pg.evaluate("() => { const P = __vx.PL; P.x = -15; P.y = 7.5; P.z = -39; P.yaw = 1; __vx.posSave(); P.x = 0; P.y = .5; P.z = 58; const ok = __vx.posLoad(); return [ok, P.x, P.y, P.z] }")
            check('the last spot is remembered', r[0] and r[1:] == [-15, 7.5, -39], str(r))
            pg.evaluate("() => { try { localStorage.removeItem('euph_pos'); localStorage.removeItem('euph_tod') } catch (e) {} const P = __vx.PL; P.x = 0; P.y = .5; P.z = 58 }")
            h = pg.evaluate('() => __vx.dep.halls')
            check('halls dressed', h and h['halls'] >= 60 and h['pieces'] >= 1500, str(h))
            o = pg.evaluate("() => [[30,-18,8],[22,-18,8],[20,-23,8],[-33,-22,8],[-22,-22,8],[-20,-24,8],[24,-40,18],[22,-40,18],[-24,-38,18]].filter(([x,z,y]) => __vx.G(x,y,z) || __vx.G(x,y+1,z) || !__vx.G(x,y-1,z)).length")
            check('stair halls open', o == 0, '%d cells blocked' % o)
        # v1.12 checks
        if pg.evaluate('() => typeof __vx.grove') == 'function':
            pg.wait_for_function('() => __vx.grove().ready >= 22', timeout=120000)
            g = pg.evaluate('() => __vx.grove()'); f = pg.evaluate('() => __vx.flowers()')
            check('kit trees planted and grown', g['trees'] > 600 and g['ready'] >= 22, str(g))
            check('flower beds planted', f and f['plants'] > 1500, str(f))
            check('village rooms', pg.evaluate('() => __vx.vr.length') >= 100, str(pg.evaluate('() => __vx.vr.length')))
            check('map grown', pg.evaluate('() => [[0, 370], [280, 0], [-280, 100], [0, -280]].every(([x, z]) => [0, 1, 2, 3, 4].some(y => __vx.G(x, y, z) !== 0))'))
        # v1.13 checks: the season picker
        if pg.evaluate('() => typeof __vx.pickSeason') == 'function':
            g0 = pg.evaluate('() => __vx.grassRGB()')
            pg.evaluate("() => document.getElementById('bSea').click()")
            check('season chips open', pg.evaluate("() => !document.getElementById('seas').hidden"))
            pg.evaluate("() => document.querySelector('#seas [data-s=winter]').click()")
            pg.wait_for_function('() => __vx.grove().got >= 44', timeout=180000)
            g1 = pg.evaluate('() => __vx.grassRGB()')
            check('winter: snow on the lawns, trees regrown', pg.evaluate('() => __vx.sea().season') == 'winter' and g1[0] > .5 and pg.evaluate("() => document.getElementById('bSea').textContent") == 'Winter', str(g1))
            pg.evaluate("() => __vx.pickSeason('summer')"); pg.wait_for_function('() => __vx.grove().got >= 44', timeout=180000)
            f = pg.evaluate('() => __vx.flowers()')
            check('summer: beds in bloom', pg.evaluate('() => __vx.sea().season') == 'summer' and pg.evaluate('() => __vx.seak()') == 'summer', str(f))
            pg.evaluate("() => __vx.pickSeason('now')"); pg.wait_for_function('() => __vx.grove().got >= 44', timeout=180000)
            check('back to the real calendar', pg.evaluate('() => __vx.grassRGB()') == g0 and pg.evaluate("() => document.getElementById('bSea').textContent") == 'Season')
            pg.evaluate("() => { try { localStorage.removeItem('euph_season') } catch (e) {} }")
        pg.evaluate(TAP, 'bBack')
        check('back to overview', pg.evaluate("() => !document.getElementById('walk').classList.contains('on')"))
        pg.wait_for_timeout(1500)
        b.close()
    check('no page errors', not errors, '; '.join(errors[:3]))
    print('WALK TEST', 'PASS' if not fails else 'FAIL')
    return not fails


if __name__ == '__main__':
    sys.exit(0 if main(*sys.argv[1:]) else 1)
