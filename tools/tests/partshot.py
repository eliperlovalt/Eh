"""Part shots: python3 partshot.py FOLDER OUTDIR 'kind;kind;...' [tod]
Finds one placed piece of each kind (indoors first), stands the camera on open floor 3.2 blocks from it and writes OUTDIR/<kind>.png.
For looking at a Depot part where it stands in the Estate."""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from harness import serve, open_estate
from playwright.sync_api import sync_playwright
HIDE = '#top,#walk,#bFind,#bStats,#bGoal,#rail,#where,#act,#card,#lvbar,#labels,#toast,#turn,#nextAct,#copy,.brand,#seas,#tourbar,#kchat{visibility:hidden!important}'
FIND = r"""([kind,skip])=>{const V=__vx,solid=(x,y,z)=>!!V.G(Math.round(x),Math.round(y),Math.round(z));let n=0;
  const L=V.pq.filter(it=>it.r&&it.r.kind===kind&&!it.wint).sort((a,b)=>(b.bid?1:0)-(a.bid?1:0));
  for(const it of L){const B=V.pbox(it.r),h=B.y1-B.y0,d=Math.max(2.6,h*1.15),ey=it.y+Math.min(2.2,Math.max(1.2,h*.75));
    for(const a of[it.th||0,(it.th||0)+.6,(it.th||0)-.6,(it.th||0)+Math.PI,(it.th||0)+1.57,(it.th||0)-1.57]){const cx=it.x+Math.sin(a)*d,cz=it.z+Math.cos(a)*d;let free=true;
      for(let t=.9;t<=1;t+=.05){}for(let s=.35;s<=1.001;s+=.1)if(solid(it.x+Math.sin(a)*d*s,ey,it.z+Math.cos(a)*d*s)){free=false;break}
      if(!free||!solid(cx,it.y-.6,cz))continue;if(n++<skip)continue;return {x:cx,y:ey,z:cz,yaw:a,pitch:Math.atan2(ey-(it.y+B.y0+h*.5),d),at:[it.x,it.y,it.z],bid:it.bid}}}
  return null}"""
def main():
    folder, out, kinds = sys.argv[1], sys.argv[2], [k.strip() for k in sys.argv[3].split(';') if k.strip()]
    tod = sys.argv[4] if len(sys.argv) > 4 else 'day'; os.makedirs(out, exist_ok=True)
    with serve(folder) as base, sync_playwright() as p:
        b, pg, err = open_estate(p, base, w=640, h=640); pg.add_style_tag(content=HIDE)
        pg.evaluate("()=>{__vx.GOV.off=true;__vx.govSet(0);__vx.setMode('walk');__vx.setFP(true);__vx.setFly(1,1)}")
        pg.evaluate("(t)=>__vx.pickTime(t)", tod); pg.wait_for_timeout(8000)
        for kd in kinds:
            kind, _, sk = kd.partition('#'); c = pg.evaluate(FIND, [kind, int(sk or 0)])
            if not c: print('no open view of', kind); continue
            for rep in range(2):
                pg.evaluate("([x,y,z,yaw,pitch])=>{const P=__vx.PL;P.x=x;P.y=y-1.7;P.z=z;P.yaw=yaw;P.pitch=pitch;P.vy=0;P.sit=null}", [c['x'], c['y'], c['z'], c['yaw'], c['pitch']])
                pg.wait_for_timeout(2200)
            pg.screenshot(path=os.path.join(out, kd.replace('#', '-') + '.png')); print('shot', kd, 'at', [round(v, 1) for v in c['at']], 'bid', c['bid'])
        if err: print('page errors', err[:3])
if __name__ == '__main__': main()
