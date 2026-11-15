"""The reel cameras as fixed spots: every Estate shot of the reels (reel-shots.json, taken from the reels' shots.json files), start and end pose,
shot the way the reels shoot them: first person, flying, speed budget off, autumn, the shot's own hour, a phone held upright, controls hidden.
python reelshots.py FOLDER OUTDIR [name,name] [page]
Writes OUTDIR/<name>_from.png and _to.png, and a contact sheet OUTDIR/sheet.png. Kairos is left where the Estate puts him (the reels stage him themselves)."""
import sys, os, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from harness import serve, open_estate
from playwright.sync_api import sync_playwright
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
SHOTS = json.load(open(os.path.join(HERE, 'reel-shots.json'), encoding='utf8'))
POSE = "([x,y,z,yaw,pitch])=>{const P=__vx.PL;P.x=x;P.y=y+.5;P.z=z;P.yaw=yaw;P.pitch=pitch;P.vy=0;P.sit=null}"


def main():
    folder, out = sys.argv[1], sys.argv[2]
    names = sys.argv[3].split(',') if len(sys.argv) > 3 and sys.argv[3] else None
    page = sys.argv[4] if len(sys.argv) > 4 else 'index.html'
    os.makedirs(out, exist_ok=True); files = []
    with serve(folder) as base, sync_playwright() as p:
        b, pg, err = open_estate(p, base, page, w=540, h=960)
        pg.add_style_tag(content='#top,#walk,#bFind,#bStats,#rail,#where,#act,#card,#lvbar,#labels,#toast,#turn{visibility:hidden!important}')
        pg.evaluate("()=>{__vx.GOV.off=true;__vx.govSet(0);__vx.pickSeason('autumn',true);__vx.setMode('walk');__vx.setFP(true);__vx.setFly(1,1)}")
        pg.wait_for_timeout(15000)
        for s in SHOTS:
            if names and s['name'] not in names: continue
            pg.evaluate("(t)=>{__vx.pickTime(t)}", s['tod'])
            for end in ('from', 'to'):
                pg.evaluate(POSE, s[end]); pg.wait_for_timeout(1800)
                pg.evaluate(POSE, s[end]); pg.wait_for_timeout(300)
                f = os.path.join(out, '%s_%s.png' % (s['name'], end)); pg.screenshot(path=f); files.append(f)
            print('shot', s['name'], flush=True)
        b.close()
    if files:
        cols = 10; W, H = 216, 384; rows = (len(files) + cols - 1) // cols
        sheet = Image.new('RGB', (cols * W, rows * H))
        for i, f in enumerate(files): sheet.paste(Image.open(f).convert('RGB').resize((W, H)), ((i % cols) * W, (i // cols) * H))
        sheet.save(os.path.join(out, 'sheet.png'))
    print('errors', err)


if __name__ == '__main__':
    main()
