import sys,json
sys.path.insert(0,'/home/claude/tests')
from harness import serve, open_estate
from playwright.sync_api import sync_playwright
folder=sys.argv[1]; out=sys.argv[2]
JS=r"""()=>{const V=__vx,G=V.G;const rooms=[];for(let b=1;b<V.BLD.length;b++){const B=V.BLD[b];for(const R of B.rooms){
  const op={};for(const side of['n','s','w','e']){const cells=[];const a0=(side==='n'||side==='s')?R.x0:R.z0,a1=(side==='n'||side==='s')?R.x1:R.z1;
    for(let a=a0;a<=a1;a++){const x=side==='n'||side==='s'?a:(side==='w'?R.x0:R.x1),z=side==='n'?R.z0:side==='s'?R.z1:a;const g1=G(x,R.y+1,z),g2=G(x,R.y+2,z);
      const fr=g=>!g||V.isInv(g);if(fr(g1)&&fr(g2))cells.push(a)}op[side]=cells}
  rooms.push({n:R.n,bid:b,bn:B.name||B.n||'',l:R.l,x0:R.x0,z0:R.z0,x1:R.x1,z1:R.z1,y:R.y,yt:R.yt,k:R.k,pk:R.pk||'',w:R.w,op})}}
 const pq=V.pq.map(it=>({k:it.r.kind,x:+it.x.toFixed(3),y:+it.y.toFixed(3),z:+it.z.toFixed(3),th:+it.th.toFixed(4),bid:it.bid,band:it.band,v:it.v,u:it.r.unit,b:it.r.b,rug:!!it.r.rtex,rw:it.rw||0,rd:it.rd||0}));
 const bl=V.BLD.slice(1).map((B,i)=>({bid:i+1,name:B.name||B.n||'',levels:B.levels.map(l=>l.y),boxes:B.boxes.map(b=>[b.x0,b.z0,b.x1,b.z1,b.yb||0,b.roofY]),doors:B.doors||[]}));
 return JSON.stringify({rooms,pq,bl,flights:V.FLIGHTS,halls:V.HALLS})}"""
with serve(folder) as base, sync_playwright() as p:
    b,pg,err=open_estate(p,base)
    s=pg.evaluate(JS); open(out,'w').write(s); print(len(s),err); b.close()
