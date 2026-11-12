"""Frame times at chosen spots, base and new interleaved, more frames. python3 ftime2.py BASE NEW 'spot,spot'"""
import sys, json
sys.path.insert(0,'/home/claude/tests')
from harness import serve, open_estate
from playwright.sync_api import sync_playwright
ALL={"lawn":[0,0,58,0],"lawn_away":[0,0,58,3.14],"saloon":[0,7,-20,0],"state_hall":[-15,7,-39,-1.57],"park":[120,0,120,0.8],"garden_n":[0,0,-100,3.14],"avenue":[0,0,150,0],"terrace":[22,7,40,0],"east_wall":[80,0,18,1.5708],"village":[-150,0,276,0],"village_ring":[-150,0,318,0],"morning":[50,7,18,3.14],"grand_stair":[31,7,-14,0],"entrance":[0,0,62,0]}
names=sys.argv[3].split(',') if len(sys.argv)>3 else list(ALL)
N=int(sys.argv[4]) if len(sys.argv)>4 else 24
T="(n)=>new Promise(r=>{let k=0,t0=performance.now();const f=()=>{k++;if(k<n)requestAnimationFrame(f);else r((performance.now()-t0)/n)};requestAnimationFrame(f)})"
with serve(sys.argv[1]) as b1, serve(sys.argv[2]) as b2, sync_playwright() as p:
    A=open_estate(p,b1); B=open_estate(p,b2)
    for br,pg,e in (A,B): pg.evaluate("()=>{if(__vx.GOV){__vx.GOV.off=true;__vx.govSet(0)}__vx.setMode('walk')}")
    for nm in names:
        x,y,z,yaw=ALL[nm]; res=[]
        for br,pg,e in (A,B):
            pg.evaluate("([x,y,z,yaw])=>{const P=__vx.PL;P.x=x;P.y=y+.5;P.z=z;P.yaw=yaw;P.pitch=.1;P.vy=0}",[x,y,z,yaw])
        for br,pg,e in (A,B): pg.wait_for_timeout(2500)
        R=3; per=max(4,N//R)
        for rnd in range(R):
            for i,(br,pg,e) in (list(enumerate((A,B))) if rnd%2==0 else list(enumerate((A,B)))[::-1]):
                pg.bring_to_front(); t=pg.evaluate(T,per); res.append((i,t))
        ta=[t for i,t in res if i==0]; tb=[t for i,t in res if i==1]; a=sum(ta)/len(ta); b=sum(tb)/len(tb); a2=min(ta); b2=min(tb)
        info=[pg.evaluate("()=>{const i=__vx.renderer.info.render;return [i.calls,i.triangles]}") for br,pg,e in (A,B)]
        print('%-13s base %5.0f ms   new %5.0f ms   %+4.0f%%  (best round %+4.0f%%)   draws %d>%d  tris %dk>%dk'%(nm,a,b,100*(b-a)/a,100*(b2-a2)/a2,info[0][0],info[1][0],info[0][1]/1000,info[1][1]/1000),flush=True)
    A[0].close(); B[0].close()
