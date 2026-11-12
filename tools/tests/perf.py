import sys, json
sys.path.insert(0,'.')
from harness import serve, open_estate
from playwright.sync_api import sync_playwright
SPOTS=[["lawn",0,0,58,0],["lawn_look_away",0,0,58,3.14],["saloon",0,7,-20,0],["state_hall",-15,7,-39,-1.57],["first_hall",-15,17,3,-1.57],["svc",-22,0,-30,3.14],["park_far",120,0,120,0.8],["garden_n",0,0,-100,3.14],["woods_w",-230,0,0,1.57],["avenue",0,0,150,0]]
def run(folder):
    out={}
    with serve(folder) as base, sync_playwright() as p:
        b,pg,err=open_estate(p,base)
        pg.evaluate("()=>{if(__vx.GOV){__vx.GOV.off=true;__vx.govSet(0)}__vx.setMode('walk')}")
        for name,x,y,z,yaw in SPOTS:
            pg.evaluate("([x,y,z,yaw])=>{const P=__vx.PL;P.x=x;P.y=y+.5;P.z=z;P.yaw=yaw;P.pitch=.1;P.vy=0;P.sit=null}",[x,y,z,yaw])
            pg.wait_for_timeout(3200)
            i=pg.evaluate("()=>{const i=__vx.renderer.info.render;return [i.calls,i.triangles]}")
            out[name]=i
        pg.evaluate("()=>__vx.setMode('over')"); pg.wait_for_timeout(2500)
        out['overview']=pg.evaluate("()=>{const i=__vx.renderer.info.render;return [i.calls,i.triangles]}")
        b.close()
    return out,err
a,_=run('/home/claude/v111'); b,e=run(sys.argv[1] if len(sys.argv)>1 else '/home/claude/estate')
print('%-16s %18s %18s'%('spot','v1.11 draws/tris','new draws/tris'))
for k in a: print('%-16s %6d %9dk   %6d %9dk   %+.0f%%'%(k,a[k][0],a[k][1]/1000,b[k][0],b[k][1]/1000,100*(b[k][1]-a[k][1])/a[k][1]))
print(e)
