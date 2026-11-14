"""Does the new build look the same? Screenshots of BASE, NEW and BASE again at the same spots and hours; the second BASE run is the
noise floor (people, animals, smoke and clouds move between runs). python lookdiff.py BASE NEW OUTDIR
Prints, per shot, the share of pixels that differ by more than 24 of 255 in any channel: base against itself, then base against new."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from harness import serve, open_estate
from playwright.sync_api import sync_playwright
import numpy as np
from PIL import Image

SHOTS = [('lawn_day', 'day', 'walk', [0, 0, 58, 0, .1]), ('saloon_day', 'day', 'walk', [0, 7, -20, 0, .1]), ('village_day', 'day', 'walk', [-150, 0, 276, 0, .1]),
         ('lawn_night', 'night', 'walk', [0, 0, 58, 0, .1]), ('hall_dusk', 'dusk', 'walk', [-15, 7, -39, -1.57, .1]), ('overview_day', 'day', 'over', None)]


def shots(folder, out, tag):
    os.makedirs(out, exist_ok=True); files = {}
    with serve(folder) as base, sync_playwright() as p:
        b, pg, err = open_estate(p, base)
        pg.evaluate("()=>{__vx.GOV.off=true;__vx.govSet(0)}"); pg.wait_for_timeout(14000)
        for name, tod, mode, s in SHOTS:
            pg.evaluate("([t,m])=>{__vx.setTime(t);__vx.setMode(m)}", [tod, mode])
            if s: pg.evaluate("([x,y,z,yaw,pt])=>{const P=__vx.PL;P.x=x;P.y=y+.5;P.z=z;P.yaw=yaw;P.pitch=pt;P.vy=0;P.sit=null}", s)
            else: pg.evaluate("()=>{const c=__vx.camera,t=__vx.controls;c.position.set(260,175,340);t.target.set(0,10,-10);t.update()}")
            pg.wait_for_timeout(3500)
            f = os.path.join(out, '%s_%s.png' % (tag, name)); pg.screenshot(path=f); files[name] = f
        b.close()
    return files, err


def diff(a, b):
    A = np.asarray(Image.open(a).convert('RGB'), dtype=np.int16); B = np.asarray(Image.open(b).convert('RGB'), dtype=np.int16)
    return 100.0 * (np.abs(A - B).max(axis=2) > 24).mean()


if __name__ == '__main__':
    out = sys.argv[3]
    a, ea = shots(sys.argv[1], out, 'base'); n, en = shots(sys.argv[2], out, 'new'); a2, _ = shots(sys.argv[1], out, 'base2')
    print('%-14s %14s %14s' % ('shot', 'base vs base', 'base vs new'))
    for name, *_ in SHOTS:
        print('%-14s %13.2f%% %13.2f%%' % (name, diff(a[name], a2[name]), diff(a[name], n[name])))
    print('errors', ea, en)
