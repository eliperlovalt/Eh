/* Euphrates Hall, Parts Depot v15: the "Contours" view. Every building alone, turnable, near and far, by day and at dusk.
   The plain walls, roofs and panes drawn here are a stand-in for the Estate (flat boxes, as it stands today); the skin on them is the kit. */
export function mountContours(ctx){
const{THREE,S,R,cam,ctl,lights,list,card,floor}=ctx,C=CONTOURS,O=ORNAMENT,T=CONTOUR_SPECS;
const root=new THREE.Group();S.add(root);const stage=new THREE.Group();root.add(stage);
const skinMat=new THREE.MeshLambertMaterial({vertexColors:true}),boxMat=new THREE.MeshLambertMaterial({vertexColors:true}),paneMat=new THREE.MeshBasicMaterial({color:0x26323f}),glassMat=new THREE.MeshLambertMaterial({color:0xa8e4dc,transparent:true,opacity:.55});
const lawn=new THREE.Mesh(new THREE.CircleGeometry(420,48),new THREE.MeshLambertMaterial({color:0x58803a}));lawn.rotation.x=-Math.PI/2;lawn.position.y=.5;lawn.receiveShadow=true;root.add(lawn);
const NAMES={hall:'The Hall',state:'State Wing',service:'Service Wing',chapel:'Chapel',glass:'Glasshouse',stable:'Stable Court',gate:'Gatehouse',lodge:'Lodge',farm:'Home Farm',cottage:'Cottage',bakery:'Bakery',shop:'Shop',smithy:'Smithy',school:'School',inn:'Inn',church:'Village church',pieces:'The pieces'};
const VWALL={cottage:'#f1ede4',bakery:'#e8dcc0',shop:'#d8ccae',smithy:'#bdb5a2',school:'#e8dcc0',inn:'#f1ede4',church:'#cfc9bd'},VROOF={cottage:'#8a7a4a',bakery:'#2b3a5e',shop:'#8a3b2a',smithy:'#2b3a5e',school:'#8a3b2a',inn:'#2b3a5e',church:'#4a4f5c'};
let key='hall',lod='near',dusk=false,bare=false,test=false,cur=null,skin=null;const cache=new Map();

/* the kit bakes its colours as sRGB numbers, as trees.js does; this renderer wants linear ones, so the view converts them */
const lin=g=>{if(g.userData.lin)return g;g.userData.lin=1;const a=g.attributes.color.array,b=new Float32Array(a.length);for(let i=0;i<a.length;i++)b[i]=Math.pow(a[i],2.2);g.setAttribute('color',new THREE.BufferAttribute(b,3));return g};
/* a batch of plain boxes with one colour each */
function Batch(){const P=[],N=[],K=[],I=[],c=new THREE.Color();const F=[[[1,0,0],[[1,0,1],[1,0,0],[1,1,0],[1,1,1]]],[[-1,0,0],[[0,0,0],[0,0,1],[0,1,1],[0,1,0]]],[[0,1,0],[[0,1,1],[1,1,1],[1,1,0],[0,1,0]]],[[0,-1,0],[[0,0,0],[1,0,0],[1,0,1],[0,0,1]]],[[0,0,1],[[0,0,1],[1,0,1],[1,1,1],[0,1,1]]],[[0,0,-1],[[1,0,0],[0,0,0],[0,1,0],[1,1,0]]]];
  return{box(x0,y0,z0,x1,y1,z1,hex){const s=c.set(hex);for(const[n,q]of F){const b=P.length/3;for(const v of q){P.push(v[0]?x1:x0,v[1]?y1:y0,v[2]?z1:z0);N.push(n[0],n[1],n[2]);K.push(s.r,s.g,s.b)}I.push(b,b+1,b+2,b,b+2,b+3)}},
    mesh(mat){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(N,3));g.setAttribute('color',new THREE.Float32BufferAttribute(K,3));g.setIndex(I);const m=new THREE.Mesh(g,mat);m.castShadow=true;m.receiveShadow=true;return m}}}

/* the building as it stands today: flat walls, the Estate's roofs, panes where the list has them */
function standin(spec,rows,o){const g=new THREE.Group(),B=Batch(),PN=Batch(),GL=Batch(),wall=spec.wall||'#d8ccae',roofC=spec.roofC||'#6b6f78',G=.5;
  spec.boxes.forEach((b,bi)=>{const t=b.roof||'hip',flat=t==='flat'||t==='dome',wc=b.wall||wall,y0=b.yb!=null?b.yb+.5:G,top=flat?b.roofY-.5:b.roofY-.5,ov=b.ov||[1,1,1,1];
    if(b.glassWalls){GL.box(b.x0-.5,y0,b.z0-.5,b.x1+.5,top,b.z1+.5,'#a8e4dc');for(const[x,z]of[[b.x0,b.z0],[b.x1,b.z0],[b.x0,b.z1],[b.x1,b.z1]])B.box(x-.5,y0,z-.5,x+.5,top,z+.5,'#f1ede4')}else B.box(b.x0-.5,y0,b.z0-.5,b.x1+.5,top,b.z1+.5,wc);
    if(t==='flat'){B.box(b.x0-.5,b.roofY-.5,b.z0-.5,b.x1+.5,b.roofY+.5,b.z1+.5,roofC);for(let x=b.x0;x<=b.x1;x+=2)for(const z of[b.z0,b.z1])B.box(x-.5,b.roofY+.5,z-.5,x+.5,b.roofY+1.5,z+.5,wc);for(let z=b.z0;z<=b.z1;z+=2)for(const x of[b.x0,b.x1])B.box(x-.5,b.roofY+.5,z-.5,x+.5,b.roofY+1.5,z+.5,wc)}
    else if(t==='dome'||t==='arch'){const cx=(b.x0+b.x1)/2,cz=(b.z0+b.z1)/2,rx=(b.x1-b.x0)/2+.5,rz=(b.z1-b.z0)/2+.5,y=b.roofY,hf=(x,z)=>{if(t==='dome'){const d=Math.hypot((x-cx)/rx,(z-cz)/rz);return d>1?-99:y+Math.round(Math.sqrt(1-d*d)*rx*.9)}const dz=Math.abs(z-cz)/rz;return dz>1?-99:y+Math.round(Math.sqrt(1-dz*dz)*rz*.6)};
      for(let x=b.x0;x<=b.x1;x++)for(let z=b.z0;z<=b.z1;z++){const h=hf(x,z);if(h<y)continue;let lo=h;for(const[dx,dz]of[[1,0],[-1,0],[0,1],[0,-1]]){const n=hf(x+dx,z+dz);lo=Math.min(lo,n<y?y-1:n)}const frame=t==='arch'?((x-b.x0)%4===0):((x+z)%3===0);(frame?B:GL).box(x-.5,Math.min(h,lo+1)-.5,z-.5,x+.5,h+.5,z+.5,frame?(t==='arch'?'#f1ede4':'#3f8f86'):'#a8e4dc')}}
    else if(t==='spire'){let a=b.x0-1,bb=b.x1+1,c=b.z0-1,d=b.z1+1,y=b.roofY;while(a<=bb&&c<=d){B.box(a-.5,y-.5,c-.5,bb+.5,y+1.5,d+.5,roofC);y+=2;a++;bb--;c++;d--}}
    else{const fl=b.gableFlush;let a=b.x0-ov[0],bb=b.x1+ov[1],c=b.z0-ov[2],d=b.z1+ov[3],y=b.roofY;const rc=b.roofC||roofC;while(a<=bb&&c<=d){
        if(t==='gableX'){B.box(a-.5,y-.5,c-.5,bb+.5,y+.5,c+.5,rc);B.box(a-.5,y-.5,d-.5,bb+.5,y+.5,d+.5,rc);if(d-c>1){const xa=fl?b.x0:a,xb=fl?b.x1:bb;B.box(xa-.5,y-.5,c+.5,xa+.5,y+.5,d-.5,wc);B.box(xb-.5,y-.5,c+.5,xb+.5,y+.5,d-.5,wc)}c++;d--}
        else if(t==='gableZ'){B.box(a-.5,y-.5,c-.5,a+.5,y+.5,d+.5,rc);B.box(bb-.5,y-.5,c-.5,bb+.5,y+.5,d+.5,rc);if(bb-a>1){B.box(a+.5,y-.5,c-.5,bb-.5,y+.5,c+.5,wc);B.box(a+.5,y-.5,d-.5,bb-.5,y+.5,d+.5,wc)}a++;bb--}
        else{B.box(a-.5,y-.5,c-.5,bb+.5,y+.5,d+.5,rc);a++;bb--;c++;d--}y++}}});
  /* panes and doors */
  for(const r of rows){const b=spec.boxes[r.box],e=.03,f=r.side==='S'?b.z1+.5:r.side==='N'?b.z0-.5:r.side==='E'?b.x1+.5:b.x0-.5,n=r.side==='S'||r.side==='E'?1:-1,bt=r.door?B:PN,col=r.door?'#4a3626':'#26323f';
    if(r.side==='S'||r.side==='N')bt.box(r.a0,r.y0,Math.min(f,f+n*e),r.a1,r.y1,Math.max(f,f+n*e),col);else bt.box(Math.min(f,f+n*e),r.y0,r.a0,Math.max(f,f+n*e),r.y1,r.a1,col)}
  /* what already stands against it, and the neighbours, plain */
  for(const e of spec.existing||[])B.box(e.x0,G,e.z0,e.x1,e.y1,e.z1,'#cfc3a4');
  for(const k of spec.neighbours||[])for(const b of T.B[k].boxes)if(b.yb==null)B.box(b.x0-.5,G,b.z0-.5,b.x1+.5,b.roofY+.5,b.z1+.5,'#b9b09a');
  if(spec.name==='Euphrates Hall'){for(const[x0,z0]of[[-64,-66],[44,-66],[-64,10],[44,10]])for(const[x,z]of[[x0,z0],[x0+20,z0],[x0,z0+20],[x0+20,z0+20]]){B.box(x-.5,46.5,z-.5,x+.5,49.5,z+.5,'#efe6cf');B.box(x-.5,49.5,z-.5,x+.5,50.5,z+.5,'#d4af37')}}
  if(spec.name==='The State Wing')for(let x=-128;x<=-65;x+=8)for(const z of[-24,16]){B.box(x-.5,30.5,z-.5,x+.5,31.5,z+.5,'#efe6cf');B.box(x-.5,31.5,z-.5,x+.5,32.5,z+.5,'#d4af37')}
  const wm=B.mesh(boxMat);g.add(wm);const pm=PN.mesh(paneMat);pm.castShadow=false;g.add(pm);const gm=GL.mesh(glassMat);gm.castShadow=false;g.add(gm);return g}

const specOf=k=>T.B[k]||Object.assign(C.village(k),{wall:VWALL[k],roofC:VROOF[k]});
function get(k,tst){const id=k+(tst?'#t':'');let d=cache.get(id);if(d)return d;const sp=specOf(k);let rows=sp.openings||C.openings(sp);
  if(tst){let i=0;rows=rows.filter(r=>r.door||(i++%4!==2))}
  const t0=performance.now(),dr=C.dress(sp,{style:sp.style||k,openings:tst||sp.openings?rows:undefined,neighbours:(sp.neighbours||[]).map(n=>T.B[n]),existing:sp.existing});
  d={sp,rows,dr,ms:performance.now()-t0};cache.set(id,d);return d}
function clear(){while(stage.children.length){const c=stage.children.pop();if(c===skin)continue;c.traverse(o=>{if(o.geometry)o.geometry.dispose()})}skin=null}
function frame(box,away){const c=box.getCenter(new THREE.Vector3()),s=box.getSize(new THREE.Vector3()),r=Math.max(s.x,s.z,s.y*1.4),asp=cam.aspect||1,d=r*(asp<1?1.6/asp:1)+26;let dx=-.3,dz=.93;if(away){const vx=c.x-away.x,vz=c.z-away.z,l=Math.hypot(vx,vz)||1;dx=vx/l*.75;dz=.66}ctl.target.set(c.x,Math.max(2,c.y*.6),c.z);cam.position.set(c.x+d*dx,c.y*.6+d*.2+3,c.z+d*dz);cam.near=.5;cam.far=2400;cam.updateProjectionMatrix();ctl.update()}
const BUD={hall:120000};
function show(reframe){clear();
  if(key==='pieces'){let x=0;const rows=[];for(const k of O.KINDS){const r=O.build(k,k==='cornice'?{len:8,dentils:true}:k==='base'||k==='balcony'||k==='balustrade'?{len:6}:k==='door'?{grand:true}:k==='window'?{head:'tri'}:k==='blind'?{head:'seg',niche:true}:{}),m=TREES.mesh(r),h=r.unit/2;for(let i=0;i<m.pos.length;i+=3){m.pos[i]+=h;m.pos[i+2]+=h}
      const me=new THREE.Mesh(lin(O.geometry(THREE,m)),skinMat);me.position.set(x,.5,0);me.castShadow=true;me.userData={k:'ornament',o:{kind:k}};stage.add(me);const bk=new THREE.Mesh(new THREE.BoxGeometry(r.size[0]+2,r.size[1]+2,.5),new THREE.MeshLambertMaterial({color:0xcfc3a4}));bk.position.set(x+r.size[0]/2,.5+r.size[1]/2,-.25);bk.receiveShadow=true;stage.add(bk);rows.push(k+' '+m.quads);x+=r.size[0]+4}
    if(reframe!==false)frame(new THREE.Box3().setFromObject(stage));cur=null;info=['The pieces, one of each','ornament.js on its own. Each piece stands proud of a wall and reports its depth and the wall cells it covers.','<b>Quads:</b> '+rows.join(', '),'<b>Call:</b> ORNAMENT.build(\'window\',{w:2,h:5,head:\'tri\'})'];mark();return}
  const d=get(key,test);cur=d;const st=standin(d.sp,d.rows);stage.add(st);if(!bare){skin=C.object(THREE,d.dr,{material:skinMat});skin.traverse(o=>{if(o.isMesh)lin(o.geometry)});skin.setLod(lod);stage.add(skin)}
  paneMat.color.set(dusk?0xffc668:0x26323f);if(reframe!==false){const bx=new THREE.Box3();for(const b of d.sp.boxes){bx.expandByPoint(new THREE.Vector3(b.x0-1,0,b.z0-1));bx.expandByPoint(new THREE.Vector3(b.x1+1,b.roofY+8,b.z1+1))}let away=null;if(d.sp.neighbours&&d.sp.neighbours.length===1){const nb=T.B[d.sp.neighbours[0]].boxes[0];away={x:(nb.x0+nb.x1)/2,z:(nb.z0+nb.z1)/2}}frame(bx,away)}
  const dr=d.dr,vill=!T.B[key],n=vill?T.COUNT[key]:1,bud=key==='hall'?'Budget for the hall: 120,000 near.':vill?n+' of these stand in the two villages.':'All other buildings share 60,000 near.';
  info=[NAMES[key]+', '+(bare?'bare':lod)+(dusk?', dusk':', day'),'<b>Style:</b> '+C.STYLES[dr.style].label+'. '+dr.pieces.length+' piece'+(dr.pieces.length>1?'s':'')+', none over 64 blocks across.',
    '<b>Triangles:</b> near '+dr.tris.near.toLocaleString()+', far '+dr.tris.far.toLocaleString()+'. '+bud+'<br><b>Panes crossed:</b> '+dr.cross+'. <b>Blank bays dressed:</b> '+dr.blind+(test?' (test list: one window in four removed)':'')+'. <b>Solid at the ground:</b> '+dr.solids.length+'.',
    '<b>Call:</b> CONTOURS.dress(spec,{style:\''+dr.style+'\''+(vill?'':',neighbours,existing')+'})'];mark()}
let info=[];
function mark(){[...list.children].forEach(b=>b.classList.toggle('on',!!(b.dataset.k===key||(b.dataset.l&&b.dataset.l===(bare?'bare':lod))||(b.dataset.d==='dusk'&&dusk)||(b.dataset.d==='day'&&!dusk)||(b.dataset.t&&test))));card(info[0],info.slice(1))}
list.innerHTML='';const btn=(t,f,ds,rf)=>{const b=document.createElement('button');b.textContent=t;Object.assign(b.dataset,ds||{});b.onclick=()=>{f();show(rf)};list.appendChild(b);return b};
for(const k of T.ORDER.concat(T.VILLAGE))btn(NAMES[k],()=>{key=k},{k});btn('The pieces',()=>{key='pieces'},{k:'pieces'});
btn('Near',()=>{lod='near';bare=false},{l:'near'},false);btn('Far',()=>{lod='far';bare=false},{l:'far'},false);btn('Bare',()=>{bare=true},{l:'bare'},false);
btn('Day',()=>{dusk=false},{d:'day'},false);btn('Dusk',()=>{dusk=true},{d:'dusk'},false);btn('Blank bay test',()=>{test=!test},{t:'1'},false);
const saved={fog:S.fog,clear:R.getClearColor(new THREE.Color()).getHex(),hemi:[lights.hemi.color.getHex(),lights.hemi.groundColor.getHex(),lights.hemi.intensity],sun:[lights.sun.color.getHex(),lights.sun.intensity,lights.sun.position.clone(),lights.sun.castShadow],fill:lights.fill.intensity,sh:R.shadowMap.enabled,far:cam.far,floor:floor.visible};
floor.visible=false;S.fog=null;R.shadowMap.enabled=true;R.shadowMap.type=THREE.PCFSoftShadowMap;lights.sun.castShadow=true;lights.sun.shadow.mapSize.set(2048,2048);lights.sun.shadow.bias=-.0008;lights.sun.shadow.normalBias=.08;
function light(){const sc=lights.sun.shadow.camera,b=stage.children.length?new THREE.Box3().setFromObject(stage):new THREE.Box3(new THREE.Vector3(-10,0,-10),new THREE.Vector3(10,10,10)),c=b.getCenter(new THREE.Vector3()),r=b.getSize(new THREE.Vector3()).length()/2+4;
  if(dusk){R.setClearColor(0xd9a98a);lights.hemi.color.set(0xe8c4a8);lights.hemi.groundColor.set(0x4a4034);lights.hemi.intensity=1.25;lights.sun.color.set(0xffa860);lights.sun.intensity=2.3;lights.sun.position.set(c.x-r*1.6,c.y+r*.42,c.z+r*.9);lawn.material.color.set(0x566b38)}
  else{R.setClearColor(0xb4cde3);lights.hemi.color.set(0xdfe9f5);lights.hemi.groundColor.set(0x8a8468);lights.hemi.intensity=1.7;lights.sun.color.set(0xfff1da);lights.sun.intensity=2.5;lights.sun.position.set(c.x-r*.8,c.y+r*1.1,c.z+r*1.2);lawn.material.color.set(0x58803a)}
  lights.fill.intensity=.25;lights.sun.target.position.copy(c);lights.sun.target.updateMatrixWorld();sc.left=-r;sc.right=r;sc.top=r;sc.bottom=-r;sc.near=1;sc.far=r*5;sc.updateProjectionMatrix()}
if(!lights.sun.target.parent)S.add(lights.sun.target);
show();
function tick(dt){light();if(skin&&lod==='auto')skin.update(cam.position)}
function dispose(){clear();S.remove(root);floor.visible=saved.floor;S.fog=saved.fog;R.setClearColor(saved.clear);R.shadowMap.enabled=saved.sh;lights.sun.castShadow=saved.sun[3];cam.far=saved.far;cam.updateProjectionMatrix();
  lights.hemi.color.setHex(saved.hemi[0]);lights.hemi.groundColor.setHex(saved.hemi[1]);lights.hemi.intensity=saved.hemi[2];lights.sun.color.setHex(saved.sun[0]);lights.sun.intensity=saved.sun[1];lights.sun.position.copy(saved.sun[2]);lights.fill.intensity=saved.fill;for(const d of cache.values())d.dr=null;cache.clear()}
window.__contours={set:(k,o={})=>{if(k)key=k;if(o.lod){lod=o.lod;bare=false}if(o.bare!=null)bare=o.bare;if(o.dusk!=null)dusk=o.dusk;if(o.test!=null)test=o.test;show(o.keep?false:undefined);light();return cur?{tris:cur.dr.tris,cross:cur.dr.cross,blind:cur.dr.blind,pieces:cur.dr.pieces.length,ms:Math.round(cur.ms)}:true},view:(p,t)=>{cam.position.set(...p);ctl.target.set(...t);ctl.update()},keys:T.ORDER.concat(T.VILLAGE)};
return{tick,mirror(){},dispose,sound:()=>({})}}
