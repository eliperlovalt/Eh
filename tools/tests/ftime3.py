"""Frame times, one build on screen at a time, builds taken in turn, median frame per spot, best of the repeats.
python3 ftime3.py BASE NEW [spots] [repeats]"""
import sys, json
sys.path.insert(0,'/home/claude/tests')
from harness import serve, open_estate
from playwright.sync_api import sync_playwright
ALL={"lawn":[0,0,58,0],"lawn_away":[0,0,58,3.14],"saloon":[0,7,-20,0],"state_hall":[-15,7,-39,-1.57],"park":[120,0,120,0.8],"garden_n":[0,0,-100,3.14],"avenue":[0,0,150,0],"terrace":[22,7,40,0],"east_wall":[80,0,18,1.5708],"village":[-150,0,276,0],"village_ring":[-150,0,318,0],"morning":[50,7,18,3.14],"grand_stair":[31,7,-14,0],"entrance":[0,0,62,0]}
names=sys.argv[3].split(',') if len(sys.argv)>3 and sys.argv[3] else list(ALL)
REP=int(sys.argv[4]) if len(sys.argv)>4 else 2
T="(n)=>new Promise(r=>{const ts=[];let last=0;const f=t=>{if(last)ts.push(t-last);last=t;if(ts.length<n)requestAnimationFrame(f);else{ts.sort((a,b)=>a-b);r(ts[ts.length>>1])}};requestAnimationFrame(f)})"
def run(folder):
    out={}
    with serve(folder) as base, sync_playwright() as p:
        b,pg,err=open_estate(p,base)
        pg.evaluate("()=>{if(__vx.GOV){__vx.GOV.off=true;__vx.govSet(0)}__vx.setMode('walk')}")
        pg.wait_for_timeout(6000)
        for nm in names:
            x,y,z,yaw=ALL[nm]
            pg.evaluate("([x,y,z,yaw])=>{const P=__vx.PL;P.x=x;P.y=y+.5;P.z=z;P.yaw=yaw;P.pitch=.1;P.vy=0}",[x,y,z,yaw]); pg.wait_for_timeout(2600)
            t=pg.evaluate(T,15); i=pg.evaluate("()=>{const i=__vx.renderer.info.render;return [i.calls,i.triangles]}"); out[nm]=(t,i[0],i[1])
        b.close()
    return out
res={0:[],1:[]}
for r in range(REP):
    for k,f in ((0,sys.argv[1]),(1,sys.argv[2])) if r%2==0 else ((1,sys.argv[2]),(0,sys.argv[1])):
        res[k].append(run(f)); print('run',r,'build',k,' '.join('%s %.0f'%(n,res[k][-1][n][0]) for n in names),flush=True)
print()
for nm in names:
    a=min(x[nm][0] for x in res[0]); b=min(x[nm][0] for x in res[1]); ia=res[0][0][nm]; ib=res[1][0][nm]
    print('%-13s base %5.0f ms   new %5.0f ms   %+4.0f%%   draws %d>%d  tris %dk>%dk'%(nm,a,b,100*(b-a)/a,ia[1],ib[1],ia[2]/1000,ib[2]/1000))
