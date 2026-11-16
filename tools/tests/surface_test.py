"""Surfaces (Estate Final, batch B). python3 surface_test.py FOLDER
1. Unfinished surfaces: every lit, opaque mesh in the scene must take the finish (the shader grain, material.userData.fin)
   or be a figure, glass, water, a light, a picture or the sky. Lists each material that does not. Target: zero.
2. Z-fighting: every quad of the built house and its props, grouped by plane; two quads facing the same way on the same
   plane that overlap and differ in colour flicker against each other. Counts the pairs. Target: zero.
"""
import sys, os, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from harness import serve, open_estate
from playwright.sync_api import sync_playwright

CENSUS = r"""()=>{const V=__vx,bad=new Map();let lit=0,fin=0;
  V.scene.traverse(o=>{if(!(o.isMesh||o.isInstancedMesh))return;const ms=Array.isArray(o.material)?o.material:[o.material];
    for(const m of ms){if(!m)continue;const litm=m.isMeshLambertMaterial||m.isMeshStandardMaterial||m.isMeshPhongMaterial||m.isMeshToonMaterial;
      if(!litm||m.transparent||m.map||m.userData.fig||m.userData.exempt)continue;
      const g=o.geometry;if(!g||!g.attributes||!g.attributes.position||!g.attributes.position.count)continue;lit++;
      if(m.userData.fin){fin++;continue}
      const k=m.type+' '+(m.name||'')+(m.vertexColors?' vc':' #'+m.color.getHexString());const e=bad.get(k)||{n:0,eg:o.name||o.parent&&o.parent.name||''};e.n++;bad.set(k,e)}});
  return {lit,fin,bad:[...bad].map(([k,e])=>k+' x'+e.n+(e.eg?' ('+e.eg+')':''))}}"""

ZF = r"""()=>{const V=__vx,T=V.THREE,P=new Map(),v=new T.Vector3();let quads=0,meshes=0;const GI=new Map(),GI0=GI,LAB=new Map();for(const g of V.GR)if(g.obj)GI.set(g.obj,g);
  const R=x=>Math.round(x*4000);   /* a quarter of a thousandth: planes set a hair apart (ZSEP) are apart */
  V.scene.updateMatrixWorld(true);
  V.scene.traverse(o=>{if(!o.isMesh||o.isInstancedMesh)return;const m=o.material;if(!m||Array.isArray(m)||m.transparent||m.userData.fig)return;
    const g=o.geometry,pa=g&&g.attributes.position,ca=g&&g.attributes.color;if(!pa||pa.count%4||!g.index||g.index.count<pa.count*1.5)return;
    if(o.userData&&o.userData.fig)return;if(o.userData.o&&o.userData.o.lod==='far')return;{const gg=GI0.get(o);if(gg&&gg.lod===2)return}   /* a far copy never shows beside its near one */
    meshes++;const M=o.matrixWorld,id=o.id;const gi=GI.get(o);const lab=gi!=null?(gi.wn!==undefined?'voxel':gi.wd?'sash':gi.d!=null?'props':gi.si?'stair':gi.lod!=null?'lod':'grp'):(o.userData.k||o.parent&&o.parent.userData&&o.parent.userData.k||o.name||'mesh');LAB.set(id,String(lab).replace(/[0-9_]+/g,''));
    for(let q=0;q<pa.count;q+=4){let x0=1e9,y0=1e9,z0=1e9,x1=-1e9,y1=-1e9,z1=-1e9;
      for(let k=0;k<4;k++){v.fromBufferAttribute(pa,q+k).applyMatrix4(M);if(v.x<x0)x0=v.x;if(v.x>x1)x1=v.x;if(v.y<y0)y0=v.y;if(v.y>y1)y1=v.y;if(v.z<z0)z0=v.z;if(v.z>z1)z1=v.z}
      const dx=x1-x0,dy=y1-y0,dz=z1-z0;let ax,c,a0,a1,b0,b1;
      if(dx<1e-4){ax=0;c=x0;a0=y0;a1=y1;b0=z0;b1=z1}else if(dy<1e-4){ax=1;c=y0;a0=x0;a1=x1;b0=z0;b1=z1}else if(dz<1e-4){ax=2;c=z0;a0=x0;a1=x1;b0=y0;b1=y1}else continue;
      /* the side the quad faces: from its winding */
      const A=new T.Vector3().fromBufferAttribute(pa,q).applyMatrix4(M),B=new T.Vector3().fromBufferAttribute(pa,q+1).applyMatrix4(M),C=new T.Vector3().fromBufferAttribute(pa,q+2).applyMatrix4(M);
      const n=B.sub(A).cross(C.sub(A));const sg=(ax===0?n.x:ax===1?n.y:n.z)>0?1:0;
      const col=ca?((ca.getX(q)*255|0)<<16|(ca.getY(q)*255|0)<<8|(ca.getZ(q)*255|0)):(m.color?m.color.getHex():0);
      const k=ax*2+sg+':'+R(c)+':'+(m.polygonOffset?m.polygonOffsetUnits:0);let L=P.get(k);if(!L){L=[];P.set(k,L)}L.push([a0,a1,b0,b1,col,id]);quads++}});
  let pairs=0;const KIND=new Map(),EGK=new Map(),eg=[],near=(a,b)=>{const d=k=>Math.abs(((a>>k)&255)-((b>>k)&255));return d(16)+d(8)+d(0)<6};
  for(const[k,L]of P){if(L.length<2)continue;L.sort((p,q)=>p[0]-q[0]);
    for(let i=0;i<L.length;i++){const p=L[i];for(let j=i+1;j<L.length;j++){const q=L[j];if(q[0]>=p[1]-2e-3)break;
      const oa=Math.min(p[1],q[1])-Math.max(p[0],q[0]),ob=Math.min(p[3],q[3])-Math.max(p[2],q[2]);if(oa<2e-3||ob<2e-3)continue;
      if(near(p[4],q[4]))continue;pairs++;const a_=LAB.get(p[5]),b_=LAB.get(q[5]),kk=a_<b_?a_+' / '+b_:b_+' / '+a_;KIND.set(kk,(KIND.get(kk)||0)+1);if(window.__ZCOL){const ck=kk+' #'+Math.min(p[4],q[4]).toString(16)+' #'+Math.max(p[4],q[4]).toString(16)+' ax'+(+k.split(':')[0]>>1)+(p[5]===q[5]?' same':'');const e=__ZCOL.get(ck)||[0,''];e[0]++;if(!e[1]){const[a2,c2]=k.split(':');const ax2=+a2>>1,cc=+c2/4000,m0=(Math.max(p[0],q[0])+Math.min(p[1],q[1]))/2,m1=(Math.max(p[2],q[2])+Math.min(p[3],q[3]))/2;e[1]=(ax2===0?[cc,m0,m1]:ax2===1?[m0,cc,m1]:[m0,m1,cc]).map(t=>t.toFixed(1)).join(',')}__ZCOL.set(ck,e)}const ne=EGK.get(kk)||0;if(ne<4){EGK.set(kk,ne+1);const[a,c]=k.split(':');const ax=+a>>1,cc=+c/4000,mid=[(Math.max(p[0],q[0])+Math.min(p[1],q[1]))/2,(Math.max(p[2],q[2])+Math.min(p[3],q[3]))/2];
        const xyz=ax===0?[cc,mid[0],mid[1]]:ax===1?[mid[0],cc,mid[1]]:[mid[0],mid[1],cc];eg.push(kk+' @ '+xyz.map(t=>+t.toFixed(2)).join(',')+' ax'+ax+' '+oa.toFixed(3)+'x'+ob.toFixed(3)+' #'+p[4].toString(16)+' #'+q[4].toString(16)+(p[5]===q[5]?' same mesh':''))}}}}
  return {cols:window.__ZCOL?[...__ZCOL].sort((a,b)=>b[1][0]-a[1][0]).slice(0,40).map(([k,e])=>e[0]+' '+k+' @'+e[1]):[],meshes,quads,planes:P.size,pairs,eg,kinds:[...KIND].sort((a,b)=>b[1]-a[1]).slice(0,20)}}"""

if __name__ == '__main__':
    fails = []
    with serve(sys.argv[1]) as base, sync_playwright() as p:
        b, pg, err = open_estate(p, base, w=480, h=320)
        pg.wait_for_timeout(6000)
        c = pg.evaluate(CENSUS)
        print('lit opaque meshes %d, with the finish %d' % (c['lit'], c['fin']))
        for x in c['bad'][:30]: print('  unfinished:', x)
        fin_on = pg.evaluate('()=>__vx.finOn?__vx.finOn():true')
        if not fin_on: print('  the finish is switched off in this build (FIN_ON): census reported, not enforced')
        if c['bad'] and fin_on: fails.append('unfinished surfaces')
        if os.environ.get('ZF_COL'): pg.evaluate('()=>{window.__ZCOL=new Map()}')
        z = pg.evaluate(ZF)
        for x in z['cols']: print('  col', x)
        print('z-fight scan: %d meshes, %d quads, %d planes, %d pairs' % (z['meshes'], z['quads'], z['planes'], z['pairs']))
        for k,n in z['kinds']: print('  %6d  %s' % (n,k))
        for x in z['eg'][:int(os.environ.get('ZF_EG','12'))]: print('  pair at', x)
        if os.environ.get('ZF_STRICT', '1') == '1' and z['pairs']: fails.append('z-fighting pairs')
        if err: print('page errors', err[:3]); fails.append('page errors')
        b.close()
    print('SURFACES ' + ('PASS' if not fails else 'FAIL: ' + ', '.join(fails)))
    sys.exit(1 if fails else 0)
