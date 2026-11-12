import sys
sys.path.insert(0,'.')
from harness import serve, open_estate
from playwright.sync_api import sync_playwright
SPOTS=[["lawn",0,0,58,0],["lawn_away",0,0,58,3.14],["saloon",0,7,-20,0],["state_hall",-15,7,-39,-1.57],["park",120,0,120,0.8],["garden_n",0,0,-100,3.14],["avenue",0,0,150,0]]
def run(folder):
    out={}
    with serve(folder) as base, sync_playwright() as p:
        b,pg,err=open_estate(p,base)
        pg.evaluate("()=>{if(__vx.GOV){__vx.GOV.off=true;__vx.govSet(0)}__vx.setMode('walk')}")
        for name,x,y,z,yaw in SPOTS:
            pg.evaluate("([x,y,z,yaw])=>{const P=__vx.PL;P.x=x;P.y=y+.5;P.z=z;P.yaw=yaw;P.pitch=.1;P.vy=0}",[x,y,z,yaw]); pg.wait_for_timeout(3000)
            out[name]=pg.evaluate("()=>new Promise(r=>{let n=0,t0=performance.now();const f=()=>{n++;if(n<10)requestAnimationFrame(f);else r((performance.now()-t0)/10)};requestAnimationFrame(f)})")
        b.close()
    return out
a=run('/home/claude/v111'); b=run('/home/claude/phone')
for k in a: print('%-12s v1.11 %6.0f ms   v1.12 %6.0f ms   %+.0f%%'%(k,a[k],b[k],100*(b[k]-a[k])/a[k]))
