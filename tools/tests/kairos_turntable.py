"""Kairos's turntable (Estate Final, batch A). python3 kairos_turntable.py FOLDER [OUTDIR]
Stands Kairos on open ground and on a stair, turns him to 8 sides at day, dusk and night, and checks: his head is there, his feet meet the ground
(the lowest point of his figure within 0.12 of the floor under him), his legs meet his body. Writes the views to OUTDIR when given."""
import sys, os, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from harness import serve, open_estate
from playwright.sync_api import sync_playwright
OUT = sys.argv[2] if len(sys.argv) > 2 else None
if OUT: os.makedirs(OUT, exist_ok=True)
fails = []
def check(n, ok, d=''):
    print('  %-50s %s %s' % (n, 'ok' if ok else 'FAIL', d))
    if not ok: fails.append(n)
SETUP = r"""([x,z,yaw,stair])=>{const V=__vx,L=V.life||V.LIFE,E=L.find(e=>e.kh);if(!E)return null;E.seated=false;E.static=true;E.turn=1;
  const ud=E.fig.userData;if(ud.l1){ud.l1.rotation.x=0;ud.l2.rotation.x=0}if(ud.a1){ud.a1.rotation.x=0;ud.a2.rotation.x=0}
  let y;if(stair){const f=V.FLIGHTS.find(f=>!f.lesser&&f.sty==='grand');const zx=f.axis==='z',u=f.L*.45,a=f.e0+f.dir*u,mid=(f.l0+f.l1)/2;x=zx?mid:a;z=zx?a:mid;y=f.y0+f.H*u/f.L}else{y=V.groundY?V.groundY(Math.round(x),Math.round(z)):1}
  E.x=x;E.z=z;E.y=y+.5;E.wrap.position.set(x,y,z);E.fig.rotation.y=yaw;E.wrap.updateMatrixWorld(true);
  const P=V.PL;P.x=x;P.z=z+7.5;P.y=y+.2;P.yaw=0;P.pitch=0.04;P.vy=0;
  const box=new V.THREE.Box3().setFromObject(E.fig);let legTop=-1e9,bodyBot=1e9;const ud2=E.fig.userData;
  if(ud2.l1){const b1=new V.THREE.Box3().setFromObject(ud2.l1);legTop=b1.max.y}const b0=new V.THREE.Box3().setFromObject(E.fig.children[0]);bodyBot=b0.min.y;
  let arms=!!(ud2.a1&&ud2.a2),armGap=0;if(arms){const ba=new V.THREE.Box3().setFromObject(ud2.a1),bb=new V.THREE.Box3().setFromObject(E.fig.children[0]);armGap=Math.max(0,ba.min.y-bb.max.y,bb.min.y-ba.max.y)}
  return {x,z,floor:y,minY:box.min.y,maxY:box.max.y,legTop,bodyBot,arms,armGap,head:!!(V.KH&&V.KH.piv)}}"""
with serve(sys.argv[1]) as base, sync_playwright() as p:
    b, pg, err = open_estate(p, base, w=640, h=640)
    pg.add_style_tag(content='#top,#walk,#bFind,#bStats,#bGoal,#rail,#where,#act,#card,#lvbar,#labels,#toast,#turn,#nextAct,#copy,.brand{visibility:hidden!important}')
    pg.evaluate("()=>{__vx.GOV.off=true;__vx.govSet(0);__vx.setMode('walk');__vx.setFP(true);__vx.setFly(1,1)}")
    pg.wait_for_timeout(9000)
    res = []
    for tod in ('day', 'dusk', 'night'):
        pg.evaluate("(t)=>__vx.pickTime(t)", tod)
        for i in range(8):
            yaw = i * 3.14159 / 4
            r = pg.evaluate(SETUP, [22, 112, yaw, 0]); pg.wait_for_timeout(500); r = pg.evaluate(SETUP, [22, 112, yaw, 0]); pg.wait_for_timeout(250)
            if r is None: check('Kairos is in the estate', False); break
            res.append(r)
            if OUT: pg.screenshot(path=os.path.join(OUT, '%s_%d.png' % (tod, i)))
    r = pg.evaluate(SETUP, [0, 0, 3.14159, 1]); pg.wait_for_timeout(600); r = pg.evaluate(SETUP, [0, 0, 3.14159, 1]); pg.wait_for_timeout(250)
    if OUT: pg.screenshot(path=os.path.join(OUT, 'stair.png'))
    b.close()
check('Kairos stands in the estate', bool(res))
if res:
    check('his head is built', all(x['head'] for x in res))
    worst = max(abs(x['minY'] - x['floor']) for x in res); check('his feet meet the ground (8 sides x 3 lights)', worst < .12, 'worst %.3f' % worst)
    gap = max(x['bodyBot'] - x['legTop'] for x in res); check('his legs meet his body', gap < .02, 'gap %.3f' % gap)
    check('his arms are their own limbs', all(x['arms'] for x in res))
    ag = max(x['armGap'] for x in res); check('his arms meet his body', ag < .02, 'gap %.3f' % ag)
if r: check('his feet meet a stair tread', abs(r['minY'] - r['floor']) < .2, 'off %.3f' % (r['minY'] - r['floor']))
check('no page errors', not err, str(err[:2]))
print('TURNTABLE', 'FAIL' if fails else 'PASS'); sys.exit(1 if fails else 0)
