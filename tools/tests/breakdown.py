"""What the frame is made of: draws and triangles by kind of object, at named spots, as the renderer would draw them (visible, in the frustum).
python breakdown.py FOLDER [spot,spot] [page]"""
import sys, os, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from harness import serve, open_estate
from playwright.sync_api import sync_playwright
from ftime3_spots import ALL

def main():
    folder = sys.argv[1]; names = sys.argv[2].split(',') if len(sys.argv) > 2 and sys.argv[2] else ['lawn', 'saloon', 'village']
    page = sys.argv[3] if len(sys.argv) > 3 else 'index.html'
    with serve(folder) as base, sync_playwright() as p:
        b, pg, err = open_estate(p, base, page)
        pg.wait_for_timeout(15000)
        pg.evaluate("()=>{if(__vx.GOV){__vx.GOV.off=true;__vx.govSet(0)}__vx.setMode('walk')}")
        pg.wait_for_timeout(3000)
        for nm in names:
            x, y, z, yaw = ALL[nm]
            pg.evaluate("([x,y,z,yaw])=>{const P=__vx.PL;P.x=x;P.y=y+.5;P.z=z;P.yaw=yaw;P.pitch=.1;P.vy=0;P.sit=null}", [x, y, z, yaw]); pg.wait_for_timeout(2500)
            r = pg.evaluate(FRJS)
            print(nm, 'renderer', r['info'], 'in view', r['calls'], int(r['tris']))
            for k, v in sorted(r['out'].items(), key=lambda kv: -kv[1]['t']):
                print('   %-18s draws %4d  tris %8d' % (k, v['n'], v['t']))
        b.close()


# visible and inside the view frustum (planes from the camera's matrices); instanced meshes are counted whole
FRJS = r"""()=>{const cam=__vx.camera,scene=__vx.scene;cam.updateMatrixWorld();scene.updateMatrixWorld();
 const V=cam.position.constructor;const pm=cam.projectionMatrix.clone().multiply(cam.matrixWorldInverse);const e=pm.elements;
 const planes=[[e[3]-e[0],e[7]-e[4],e[11]-e[8],e[15]-e[12]],[e[3]+e[0],e[7]+e[4],e[11]+e[8],e[15]+e[12]],[e[3]+e[1],e[7]+e[5],e[11]+e[9],e[15]+e[13]],[e[3]-e[1],e[7]-e[5],e[11]-e[9],e[15]-e[13]],[e[3]-e[2],e[7]-e[6],e[11]-e[10],e[15]-e[14]],[e[3]+e[2],e[7]+e[6],e[11]+e[10],e[15]+e[14]]].map(p=>{const l=Math.hypot(p[0],p[1],p[2]);return p.map(v=>v/l)});
 const inF=(c,r)=>planes.every(p=>p[0]*c.x+p[1]*c.y+p[2]*c.z+p[3]>=-r);
 const GR=__vx.GR||[];const byObj=new Map();for(const g of GR)byObj.set(g.obj,g);
 const kindOf=o=>{if(o.userData&&o.userData.k)return o.userData.k;const g=byObj.get(o)||byObj.get(o.parent)||byObj.get(o.parent&&o.parent.parent);
   if(g){if(g.wd)return 'windowDetail';if(g.lod!=null)return 'stairs_out';if(g.vh)return g.si?'village_in':'village';if(g.si)return g.bid?'inside':'stairs';if(g.bid){const m=o.material;const w=m&&m.transparent?'_glass':'';return (g.band===31?'roof':'bldg')+w}return 'ground'}
   if(o.isInstancedMesh)return 'inst:'+(o.name||o.material.type);let p=o.parent;while(p&&p!==scene){if(p.userData&&p.userData.k)return p.userData.k;p=p.parent}return o.type+(o.parent&&o.parent!==scene?'(child)':'')};
 const out={};let calls=0,tris=0;
 scene.traverseVisible(o=>{if(!(o.isMesh||o.isPoints||o.isLine||o.isSprite))return;const geo=o.geometry;if(!geo)return;
   if(o.frustumCulled!==false&&!o.isInstancedMesh){if(!geo.boundingSphere)geo.computeBoundingSphere();const s=geo.boundingSphere;const c=s.center.clone().applyMatrix4(o.matrixWorld);const sc=o.matrixWorld.getMaxScaleOnAxis();if(!inF(c,s.radius*sc))return}
   let t=Math.min(geo.index?geo.index.count:geo.attributes.position.count,geo.drawRange.count)/3;if(o.isInstancedMesh){if(!o.count)return;t*=o.count}
   const k=kindOf(o);const q=out[k]||(out[k]={n:0,t:0});q.n++;q.t+=t;calls++;tris+=t});
 return {out,calls,tris,info:[__vx.renderer.info.render.calls,__vx.renderer.info.render.triangles]}}"""

if __name__ == '__main__':
    main()
