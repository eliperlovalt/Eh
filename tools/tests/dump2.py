"""Dump for the drawn floor plans: rooms, props, halls, flights, and the wall grid of every floor of every building.
python3 dump2.py FOLDER OUT.json"""
import sys,json
sys.path.insert(0,'/home/claude/tests')
from harness import serve, open_estate
from playwright.sync_api import sync_playwright
folder=sys.argv[1]; out=sys.argv[2]
JS=r"""()=>{const V=__vx,G=V.G;const rooms=[];for(let b=1;b<V.BLD.length;b++){const B=V.BLD[b];for(const R of B.rooms){
  const op={};for(const side of['n','s','w','e']){const cells=[];const a0=(side==='n'||side==='s')?R.x0:R.z0,a1=(side==='n'||side==='s')?R.x1:R.z1;
    for(let a=a0;a<=a1;a++){const x=side==='n'||side==='s'?a:(side==='w'?R.x0:R.x1),z=side==='n'?R.z0:side==='s'?R.z1:a;const g1=G(x,R.y+1,z),g2=G(x,R.y+2,z);
      const fr=g=>!g||V.isInv(g);if(fr(g1)&&fr(g2))cells.push(a)}op[side]=cells}
  rooms.push({n:R.n,bid:b,bn:B.name||B.n||'',l:R.l,x0:R.x0,z0:R.z0,x1:R.x1,z1:R.z1,y:R.y,yt:R.yt,k:R.k,pk:R.pk||'',w:R.w,h:R.h,tall:R.tall||0,op})}}
 const pq=V.pq.map(it=>({k:it.r.kind,x:+it.x.toFixed(3),y:+it.y.toFixed(3),z:+it.z.toFixed(3),th:+it.th.toFixed(4),bid:it.bid,band:it.band,v:it.v,u:it.r.unit,b:it.r.b,rug:!!it.r.rtex,rw:it.rw||0,rd:it.rd||0}));
 const bl=[];for(let b=1;b<V.BLD.length;b++){const B=V.BLD[b];let x0=1e9,z0=1e9,x1=-1e9,z1=-1e9;for(const o of B.boxes){x0=Math.min(x0,o.x0);z0=Math.min(z0,o.z0);x1=Math.max(x1,o.x1);z1=Math.max(z1,o.z1)}x0-=2;z0-=2;x1+=2;z1+=2;
   const grids=[];for(const L of B.levels){const y=L.y,rows=[];for(let z=z0;z<=z1;z++){let s='';for(let x=x0;x<=x1;x++){const f=G(x,y,z),g1=G(x,y+1,z),g2=G(x,y+2,z),g3=G(x,y+3,z);const so=g=>g&&!V.isInv(g);
       let c='.';if(V.isWin(g2)||V.isWin(g3)||V.isBlind(g2)||V.isBlind(g3))c='w';else if(so(g1)&&so(g2))c='#';else if(so(g1))c='l';else if(!so(f)&&!so(G(x,y-1,z)))c=' ';s+=c}rows.push(s)}grids.push({y,n:L.n,rows})}
   bl.push({bid:b,name:B.name||'',x0,z0,x1,z1,levels:B.levels.map(l=>({y:l.y,n:l.n})),boxes:B.boxes.map(o=>[o.x0,o.z0,o.x1,o.z1,o.roofY]),doors:B.doors||[],grids})}
 return JSON.stringify({rooms,pq,bl,flights:V.FLIGHTS,halls:V.HALLS})}"""
with serve(folder) as base, sync_playwright() as p:
    b,pg,err=open_estate(p,base)
    s=pg.evaluate(JS); open(out,'w').write(s); print(len(s),err); b.close()
