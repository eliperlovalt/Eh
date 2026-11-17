"""Room sheets: python3 roomsheet.py FOLDER OUTDIR 'Room name[#n];Room name;...' [tod]
Shoots each named room (as in room-register.json; #n picks the n-th of that name, from 0) from its four corners, looking at the middle,
and from the middle looking at each door wall, and writes OUTDIR/<room>.jpg as one sheet. For checking a fault report against the build."""
import sys, os, json, math, re
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from harness import serve, open_estate
from playwright.sync_api import sync_playwright
from PIL import Image
HIDE = '#top,#walk,#bFind,#bStats,#bGoal,#rail,#where,#act,#card,#lvbar,#labels,#toast,#turn,#nextAct,#copy,.brand,#seas,#tourbar,#kchat{visibility:hidden!important}'
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
def main():
    folder, out, names = sys.argv[1], sys.argv[2], [n.strip() for n in sys.argv[3].split(';') if n.strip()]
    tod = sys.argv[4] if len(sys.argv) > 4 else 'day'
    reg = json.load(open(os.path.join(ROOT, 'room-register.json'))); rooms = reg['rooms'] if isinstance(reg, dict) else reg
    os.makedirs(out, exist_ok=True); W, H = 640, 400
    with serve(folder) as base, sync_playwright() as p:
        b, pg, err = open_estate(p, base, w=W, h=H)
        pg.add_style_tag(content=HIDE)
        pg.evaluate("()=>{__vx.GOV.off=true;__vx.govSet(0);__vx.setMode('walk');__vx.setFP(true);__vx.setFly(1,1)}")
        pg.evaluate("(t)=>__vx.pickTime(t)", tod); pg.wait_for_timeout(8000)
        for nm in names:
            m = re.match(r'(.*?)(?:#(\d+))?$', nm); name, k = m.group(1), int(m.group(2) or 0)
            hits = [r for r in rooms if r['name'] == name] or [r for r in rooms if name.lower() in r['name'].lower()]
            if len(hits) <= k: print('no room', nm); continue
            r = hits[k]; x0, z0, x1, z1 = r['rect']; y = r['y']; cx, cz = (x0 + x1) / 2, (z0 + z1) / 2
            eye = min(2.3, r.get('height', 5) - 1.6) + .0
            poses = []
            for (px, pz) in ((x0 + 1.6, z0 + 1.6), (x1 - 1.6, z0 + 1.6), (x1 - 1.6, z1 - 1.6), (x0 + 1.6, z1 - 1.6)):
                poses.append((px, pz, math.atan2(px - cx, pz - cz), .12))
            for yaw in (0, math.pi / 2, math.pi, -math.pi / 2): poses.append((cx, cz, yaw, .05))
            ims = []
            for i, (px, pz, yaw, pitch) in enumerate(poses):
                pg.evaluate("([x,y,z,yaw,pitch])=>{const P=__vx.PL;P.x=x;P.y=y;P.z=z;P.yaw=yaw;P.pitch=pitch;P.vy=0;P.sit=null}", [px, y + .5 + eye - 1.7, pz, yaw, pitch])
                pg.wait_for_timeout(1500 if i else 3000); f = os.path.join(out, '_t.png'); pg.screenshot(path=f); ims.append(Image.open(f).convert('RGB'))
            sheet = Image.new('RGB', (W * 4, H * 2)); [sheet.paste(im, ((i % 4) * W, (i // 4) * H)) for i, im in enumerate(ims)]
            fn = re.sub(r'[^A-Za-z0-9]+', '-', nm).strip('-') + '.jpg'; sheet.save(os.path.join(out, fn), quality=82); print('sheet', fn, r['floor'], r['rect'])
        if err: print('page errors', err[:3])
        try: os.remove(os.path.join(out, '_t.png'))
        except OSError: pass
if __name__ == '__main__': main()
