/* The look sweep: what a walker sees that is wrong. Loaded after audit.js; defines window.__aesth.
   clips: two standing pieces in one another; stray: solid blocks standing loose inside a room; narrow: squeezes on foot. */
(()=>{const V=window.__vx,G=V.G,A=window.__audit,inv=g=>V.isInv(g),INFO=(V.PROPS&&V.PROPS.info)||{};
const SKIP=/^(rug|ragRug|stairRunner|dado|cornice|corniceIn|panelling|pictureRail|beamRun|coffer|ceilingRose|hammerbeam|skylight|doorDouble|archway|sash|balustrade|balPost|lanternPendant|chandelier|chandelierGilt|chandelierIron|candle)$/;
function roomAt(b,x,y,z){const B=V.BLD[b];if(!B)return null;let best=null;for(const R of B.rooms)if(x>R.x0&&x<R.x1&&z>R.z0&&z<R.z1&&y>=R.y&&y<R.yt+1){if(!best||R.y>best.y)best=R}return best}
function clips(){const its=V.pq.filter(it=>it.bid&&!it.v&&!it.wint&&!SKIP.test(it.r.kind)&&!(INFO[it.r.kind]||{}).wall&&!A.HANG.has(it.r.kind)).map(it=>({it,b:A.box(it)}));
  const M=new Map();its.forEach((e,i)=>{for(let cx=Math.floor(e.b.x0/8);cx<=Math.floor(e.b.x1/8);cx++)for(let cz=Math.floor(e.b.z0/8);cz<=Math.floor(e.b.z1/8);cz++){const k=cx+','+cz;let a=M.get(k);if(!a)M.set(k,a=[]);a.push(i)}});
  const seen=new Set(),out=[];for(const a of M.values())for(let i=0;i<a.length;i++)for(let j=i+1;j<a.length;j++){const p=a[i],q=a[j],k=p<q?p+'_'+q:q+'_'+p;if(seen.has(k))continue;seen.add(k);const E=its[p],F=its[q];if(E.it.bid!==F.it.bid)continue;
    const ix=Math.min(E.b.x1,F.b.x1)-Math.max(E.b.x0,F.b.x0),iz=Math.min(E.b.z1,F.b.z1)-Math.max(E.b.z0,F.b.z0),iy=Math.min(E.b.y1,F.b.y1)-Math.max(E.b.y0,F.b.y0);
    if(ix<.12||iz<.12||iy<.25)continue;if(Math.abs(E.b.y0-F.b.y1)<.2||Math.abs(F.b.y0-E.b.y1)<.2)continue;   /* one stands on the other */
    const R=roomAt(E.it.bid,E.it.x,E.it.y,E.it.z);out.push({room:R?R.n:'?',a:E.it.r.kind,b:F.it.r.kind,x:+E.it.x.toFixed(1),y:+E.it.y.toFixed(1),z:+E.it.z.toFixed(1),area:+(ix*iz).toFixed(2)})}
  return out}
function stray(){const out=[];for(let b=1;b<V.BLD.length;b++)for(const R of V.BLD[b].rooms){const seen=new Set();
    for(let x=R.x0+1;x<R.x1;x++)for(let z=R.z0+1;z<R.z1;z++){const k=x+','+z;if(seen.has(k))continue;const g=G(x,R.y+2,z);if(!g||inv(g)||V.isWin(g))continue;
      const st=[[x,z]],cells=[];seen.add(k);const cols=new Set();while(st.length){const[cx,cz]=st.pop();cells.push([cx,cz]);cols.add(G(cx,R.y+2,cz));for(const[dx,dz]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=cx+dx,nz=cz+dz,nk=nx+','+nz;if(nx<=R.x0||nx>=R.x1||nz<=R.z0||nz>=R.z1||seen.has(nk))continue;const h=G(nx,R.y+2,nz);if(!h||inv(h)||V.isWin(h))continue;seen.add(nk);st.push([nx,nz])}}
      let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(const[cx,cz]of cells){x0=Math.min(x0,cx);x1=Math.max(x1,cx);z0=Math.min(z0,cz);z1=Math.max(z1,cz)}
      const touches=x0===R.x0+1||x1===R.x1-1||z0===R.z0+1||z1===R.z1-1;out.push({bid:b,room:R.n,y:R.y,n:cells.length,box:[x0,z0,x1,z1],wall:touches,cols:[...cols].slice(0,4)})}}return out}
function narrow(){const out=[];for(let b=1;b<V.BLD.length;b++){const B=V.BLD[b];const ys=[...new Set(B.rooms.map(R=>R.y))];
    for(const y of ys){let X0=1e9,X1=-1e9,Z0=1e9,Z1=-1e9;for(const k of B.boxes){X0=Math.min(X0,k.x0);X1=Math.max(X1,k.x1);Z0=Math.min(Z0,k.z0);Z1=Math.max(Z1,k.z1)}
      const blk=(x,z)=>{if(!G(x,y,z))return true;for(let k=1;k<=2;k++){const g=G(x,y+k,z);if(g)return true}return false};
      const walk=(x,z)=>!blk(x,z)&&G(x,y,z);const seen=new Set();
      for(let x=X0+1;x<X1;x++)for(let z=Z0+1;z<Z1;z++){if(!walk(x,z))continue;
        /* a squeeze: blocked both sides within a 2-wide gap, along x or along z, and not a doorway in a wall line */
        const sq=(blk(x-1,z)&&(blk(x+1,z)||blk(x+2,z)))||(blk(x,z-1)&&(blk(x,z+1)||blk(x,z+2)));if(!sq)continue;
        const onWall=B.rooms.some(R=>R.y===y&&((x===R.x0||x===R.x1)&&z>R.z0&&z<R.z1||(z===R.z0||z===R.z1)&&x>R.x0&&x<R.x1));if(onWall)continue;seen.add(x+','+z)}
      const done=new Set();for(const k of seen){if(done.has(k))continue;const st=[k],cells=[];done.add(k);while(st.length){const c=st.pop();cells.push(c);const[cx,cz]=c.split(',').map(Number);for(const[dx,dz]of[[1,0],[-1,0],[0,1],[0,-1]]){const nk=(cx+dx)+','+(cz+dz);if(seen.has(nk)&&!done.has(nk)){done.add(nk);st.push(nk)}}}
        if(cells.length<4)continue;const[cx,cz]=cells[cells.length>>1].split(',').map(Number);const R=roomAt(b,cx,y,cz);out.push({bid:b,y,room:R?R.n:'(passage)',n:cells.length,at:[cx,cz]})}}}return out}
window.__aesth={clips,stray,narrow,roomAt}})();
