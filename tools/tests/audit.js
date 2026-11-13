/* Estate audit: doors, rugs and floors, wall pieces. Loaded into the page by the tests; defines window.__audit.
   Everything is measured from the built world (voxels, the prop queue, the scene), not from the source. */
(()=>{
const V=window.__vx,G=V.G,inv=g=>V.isInv(g),free=g=>!g||inv(g);
const HANG=new Set(['portrait','tapestry','sconce','antlers','banner','coatOfArms','wallLantern','pictureRail']);
const FLAT=new Set(['rug','ragRug']);
/* world box of one queued prop */
function box(it){const B=V.pbox(it.r),c=Math.cos(it.th),s=Math.sin(it.th);let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;
  for(const lx of[B.x0,B.x1])for(const lz of[B.z0,B.z1]){const x=it.x+lx*c+lz*s,z=it.z-lx*s+lz*c;x0=Math.min(x0,x);x1=Math.max(x1,x);z0=Math.min(z0,z);z1=Math.max(z1,z)}
  return{x0,x1,z0,z1,y0:it.y+B.y0,y1:it.y+B.y1}}
/* every door: a gap one to four blocks wide in a room wall, and every outside door of a building */
function doors(){const out=[],seen=new Set();
  for(let b=1;b<V.BLD.length;b++){const B=V.BLD[b];
    for(const R of B.rooms)for(const side of['n','s','w','e']){const ns=side==='n'||side==='s',a0=ns?R.x0+1:R.z0+1,a1=ns?R.x1-1:R.z1-1,w=side==='n'?R.z0:side==='s'?R.z1:side==='w'?R.x0:R.x1;
      let run=[];const flush=()=>{if(run.length&&run.length<=4){const k=[b,R.y,ns?'x':'z',w,run[0]].join(',');if(!seen.has(k)){seen.add(k);
            let h=0;const cx=ns?run[0]:w,cz=ns?w:run[0];while(h<8&&free(G(cx,R.y+1+h,cz)))h++;
            out.push({bid:b,room:R.n,y:R.y,axis:ns?'x':'z',w,a0:run[0],a1:run[run.length-1],h,ext:false})}}run=[]};
      for(let a=a0;a<=a1;a++){const x=ns?a:w,z=ns?w:a;if(free(G(x,R.y+1,z))&&free(G(x,R.y+2,z))&&G(x,R.y,z))run.push(a);else flush()}flush()}
    for(const d of B.doors||[]){const[x0,y0,z0,x1,y1,z1]=d;const ax=(x1-x0)>=(z1-z0)?'x':'z';const y=y0-1;
      if(ax==='x')for(let z=z0;z<=z1;z++){const k=[b,y,'x',z,x0].join(',');if(seen.has(k))continue;seen.add(k);out.push({bid:b,room:'(outside door)',y,axis:'x',w:z,a0:x0,a1:x1,h:y1-y0+1,ext:true})}
      else for(let x=x0;x<=x1;x++){const k=[b,y,'z',x,z0].join(',');if(seen.has(k))continue;seen.add(k);out.push({bid:b,room:'(outside door)',y,axis:'z',w:x,a0:z0,a1:z1,h:y1-y0+1,ext:true})}}}
  return out}
/* the kept-clear box of a door: its width, two blocks out from each wall face, its height */
function zone(d,reach){const r=reach==null?2:reach,lo=d.a0-.5,hi=d.a1+.5,p0=d.w-.5-r,p1=d.w+.5+r,y0=d.y+.8,y1=d.y+.5+Math.min(d.h,6);
  return d.axis==='x'?{x0:lo,x1:hi,z0:p0,z1:p1,y0,y1}:{x0:p0,x1:p1,z0:lo,z1:hi,y0,y1}}
const hit=(a,b,e)=>a.x0<b.x1-e&&a.x1>b.x0+e&&a.z0<b.z1-e&&a.z1>b.z0+e&&a.y0<b.y1-e&&a.y1>b.y0+e;
const DOORDRESS=/^(doorDouble|archway|cornice|balustrade|balPost)/;
function doorFaults(){const D=doors(),INFO=V.PROPS.info||{},items=V.pq.filter(it=>!FLAT.has(it.r.kind)&&!DOORDRESS.test(it.r.kind)&&!it.v).map(it=>({it,b:box(it),wall:!!(INFO[it.r.kind]||{}).wall})),faults=[];
  /* a free-standing piece: nothing within two blocks of the door line. A wall piece: nothing hanging into the opening */
  for(const d of D){const z2=zone(d,2),z1=zone(d,.6);const bad=[];
    for(const e of items){if(e.it.bid&&e.it.bid!==d.bid)continue;if(!e.it.bid&&!d.ext)continue;if(e.wall&&(Math.abs(Math.sin(e.it.th))<.5)!==(d.axis==='x'))continue;if(hit(e.b,e.wall?z1:z2,.12))bad.push(e.it.r.kind)}
    /* blocks standing in the opening or its approach: prop collision counts, structure two blocks out does not */
    let blocked=0;for(let a=d.a0;a<=d.a1;a++)for(let k=1;k<=Math.min(3,d.h);k++){const x=d.axis==='x'?a:d.w,zz=d.axis==='x'?d.w:a;if(G(x,d.y+k,zz))blocked++}
    let invs=0;for(let a=d.a0;a<=d.a1;a++)for(const p of[-2,-1,1,2])for(let k=1;k<=2;k++){const x=d.axis==='x'?a:d.w+p,zz=d.axis==='x'?d.w+p:a;if(inv(G(x,d.y+k,zz)))invs++}
    if(bad.length||blocked||invs)faults.push({door:d,props:bad,blocked,invs})}
  return{doors:D.length,faults}}
/* rugs: two flat pieces at one height that overlap, a rug within a hair of the floor finish, a rug over a hole or through a wall */
function rugs(){return V.pq.filter(it=>it.r.rtex).map(it=>{const r=it.r,w=it.rw||(r.b.x1-r.b.x0+1)*r.unit/2,d=it.rd||(r.b.z1-r.b.z0+1)*r.unit/2,q=Math.round(it.th/(Math.PI/2))&1;
  const hx=q?d:w,hz=q?w:d;return{x0:it.x-hx,x1:it.x+hx,z0:it.z-hz,z1:it.z+hz,y:it.y+.05,bid:it.bid}})}
function floorPlanes(){const out=[];for(const g of V.GR){const o=g.obj;if(!o||!o.isMesh||!o.material||!o.material.map||o.material.side!==2)continue;const p=o.geometry.attributes.position.array;
    for(let i=0;i<p.length;i+=18){let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9,flat=true;for(let k=0;k<18;k+=3){x0=Math.min(x0,p[i+k]);x1=Math.max(x1,p[i+k]);z0=Math.min(z0,p[i+k+2]);z1=Math.max(z1,p[i+k+2]);if(Math.abs(p[i+k+1]-p[i+1])>1e-4)flat=false}if(flat)out.push({x0,x1,z0,z1,y:p[i+1],m:o.material.uuid})}}return out}
function grid(list,cell){const M=new Map();list.forEach((r,i)=>{for(let cx=Math.floor(r.x0/cell);cx<=Math.floor(r.x1/cell);cx++)for(let cz=Math.floor(r.z0/cell);cz<=Math.floor(r.z1/cell);cz++){const k=cx+','+cz;let a=M.get(k);if(!a)M.set(k,a=[]);a.push(i)}});return M}
const over=(a,b,e)=>a.x0<b.x1-e&&a.x1>b.x0+e&&a.z0<b.z1-e&&a.z1>b.z0+e;
function rugFaults(){const R=rugs(),F=floorPlanes(),pairs=[],thin=[],holes=[];
  const GR=grid(R,16),seen=new Set();for(const a of GR.values())for(let i=0;i<a.length;i++)for(let j=i+1;j<a.length;j++){const k=a[i]+'_'+a[j];if(seen.has(k))continue;seen.add(k);const A=R[a[i]],B=R[a[j]];
      if(Math.abs(A.y-B.y)<.02&&over(A,B,.02))pairs.push([A,B])}
  const GF=grid(F,16);R.forEach(A=>{const hitF=new Set();for(let cx=Math.floor(A.x0/16);cx<=Math.floor(A.x1/16);cx++)for(let cz=Math.floor(A.z0/16);cz<=Math.floor(A.z1/16);cz++)for(const i of GF.get(cx+','+cz)||[])hitF.add(i);
    let t=false;for(const i of hitF){const P=F[i];if(Math.abs(P.y-A.y)<.035&&over(A,P,.02)){t=true;break}}if(t)thin.push(A);
    /* the floor under it, and anything standing through it */
    const fy=Math.round(A.y-.6);let air=0,wall=0;for(let x=Math.round(A.x0+.45);x<=Math.round(A.x1-.45);x++)for(let z=Math.round(A.z0+.45);z<=Math.round(A.z1-.45);z++){if(!G(x,fy,z))air++;const g=G(x,fy+1,z);if(g&&!inv(g))wall++}
    if(air||wall)holes.push({rug:A,air,wall})});
  /* two floor finishes laid one on the other */
  const fpairs=[];const seen2=new Set();for(const a of GF.values())for(let i=0;i<a.length;i++)for(let j=i+1;j<a.length;j++){const k=a[i]+'_'+a[j];if(seen2.has(k))continue;seen2.add(k);const A=F[a[i]],B=F[a[j]];if(Math.abs(A.y-B.y)<.02&&over(A,B,.02))fpairs.push([A,B])}
  return{rugs:R.length,planes:F.length,pairs,thin,holes,fpairs}}
/* wall pieces: the floor and ceiling of the room each hangs in, and where its lower edge sits */
function wallSpan(x,y,z){x=Math.round(x);z=Math.round(z);let yy=Math.round(y),f=null,c=null;if(G(x,yy,z)&&!inv(G(x,yy,z)))return null;
  for(let k=0;k<30;k++){const g=G(x,yy-k,z);if(g&&!inv(g)){f=yy-k+.5;break}}for(let k=1;k<60;k++){const g=G(x,yy+k,z);if(g&&!inv(g)){c=yy+k-.5;break}}
  return f==null||c==null?null:{f,c,H:c-f}}
function hangFaults(){const out=[];let n=0;for(const it of V.pq){if(!HANG.has(it.r.kind)||!it.bid||it.v)continue;n++;const b=box(it);const s=wallSpan(it.x,(b.y0+b.y1)/2,it.z);if(!s)continue;
    const low=b.y0-s.f;if(low<s.H/3-.02)out.push({k:it.r.kind,x:it.x,y:it.y,z:it.z,low:+low.toFixed(2),H:s.H,bid:it.bid})}return{hung:n,faults:out}}
window.__audit={doors,zone,doorFaults,rugFaults,hangFaults,box,wallSpan,HANG};
})();
