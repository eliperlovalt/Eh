"""Screenshots at fixed spots. python3 wshots.py FOLDER '[[name,x,y,z,yaw,pitch,fp],...]' [tod] [prefix]"""
import sys, json
sys.path.insert(0,'/home/claude/tests')
from harness import serve, open_estate
from playwright.sync_api import sync_playwright
folder=sys.argv[1]; spots=json.loads(sys.argv[2]); tod=sys.argv[3] if len(sys.argv)>3 else 'day'; pre=sys.argv[4] if len(sys.argv)>4 else 'w'
with serve(folder) as base, sync_playwright() as p:
    b,pg,err=open_estate(p,base,w=900,h=420)
    pg.evaluate("(t)=>{__vx.GOV.off=true;__vx.govSet(0);__vx.setMode('walk');__vx.pickSeason&&__vx.pickSeason('summer',true);__vx.setTime&&__vx.setTime(t)}",tod)
    for sp in spots:
        name,x,y,z,yaw,pitch=sp[:6]; fp=sp[6] if len(sp)>6 else 1
        pg.evaluate("([x,y,z,yaw,pitch,fp])=>{const P=__vx.PL;__vx.setFP(!!fp);P.x=x;P.y=y+.5;P.z=z;P.yaw=yaw;P.pitch=pitch;P.vy=0;P.sit=null;if(fp===2){__vx.setFly(1,1)}else if(P.fly)__vx.setFly(0,1)}",[x,y,z,yaw,pitch,fp])
        pg.wait_for_timeout(3400); pg.screenshot(path='/home/claude/tests/%s_%s.png'%(pre,name))
        print(name, pg.evaluate("()=>JSON.stringify(__vx.perf())"))
    print(err); b.close()
