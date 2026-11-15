"""Screenshots at named poses, shot the reel way (first person, flying, speed budget off, autumn, day unless given).
python spotshots.py FOLDER OUTDIR 'name:x,y,z,yaw,pitch[,tod];name2:...' [WxH]
y is the floor the pose stands on, as in the audit (FAULTS.md) and the reels. Writes OUTDIR/name.png."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from harness import serve, open_estate
from playwright.sync_api import sync_playwright

POSE = "([x,y,z,yaw,pitch])=>{const P=__vx.PL;P.x=x;P.y=y+.5;P.z=z;P.yaw=yaw;P.pitch=pitch;P.vy=0;P.sit=null}"


def main():
    folder, out, spec = sys.argv[1], sys.argv[2], sys.argv[3]
    w, h = (int(v) for v in (sys.argv[4] if len(sys.argv) > 4 else '960x540').split('x'))
    spots = []
    for part in spec.split(';'):
        if not part.strip(): continue
        name, vals = part.split(':'); v = vals.split(',')
        spots.append((name.strip(), [float(a) for a in v[:5]], v[5] if len(v) > 5 else 'day'))
    os.makedirs(out, exist_ok=True)
    with serve(folder) as base, sync_playwright() as p:
        b, pg, err = open_estate(p, base, w=w, h=h)
        pg.add_style_tag(content='#top,#walk,#bFind,#bStats,#rail,#where,#act,#card,#lvbar,#labels,#toast,#turn{visibility:hidden!important}')
        pg.evaluate("()=>{__vx.GOV.off=true;__vx.govSet(0);__vx.pickSeason('autumn',true);__vx.setMode('walk');__vx.setFP(true);__vx.setFly(1,1)}")
        pg.wait_for_timeout(14000)
        for name, pose, tod in spots:
            pg.evaluate("(t)=>{__vx.pickTime(t)}", tod)
            pg.evaluate(POSE, pose); pg.wait_for_timeout(1800); pg.evaluate(POSE, pose); pg.wait_for_timeout(300)
            pg.screenshot(path=os.path.join(out, name + '.png'))
        print('errors', err)
        b.close()


if __name__ == '__main__':
    main()
