/* Euphrates Hall, Parts Depot: ANIMALS v1
   Voxel animals in the same cube style as the people, with jointed legs, necks and tails, and a small brain.
   Plain script; three.js is passed in. Facing +z, origin on the ground under the middle of the body.

   ANIMALS.build(kind,o)   -> {V, unit, pivots, kind, gait, label}
       kinds: horse (o.coat 'bay'|'grey'|'chestnut'|'black', o.saddle), hound, deer (o.buck, o.winter),
              sheep, swan, hen (o.coat 'brown'|'white'), cat, peacock (o.display)
   ANIMALS.Rig(THREE,built,meshOf)  -> {group, pose(dt,{speed,mode})}
       modes: walk (speed sets walk, trot, gallop), graze, idle, sit (cat), peck (hen), glide (swan), display (peacock)
   ANIMALS.Brain(o)        -> wander, graze, keep with the herd, follow a leader, avoid water: .step(dt)
   ANIMALS.fence(len,o)    -> post and rail fence along x, len blocks
   ANIMALS.kinds, ANIMALS.info */
const ANIMALS=(()=>{
const h3=(x,y,z,s=0)=>{let n=(x*374761393+y*668265263+z*2147483647+s*1274126177)|0;n=(n^(n>>>13))*1274126177|0;return((n^(n>>>16))>>>0)/4294967296};
function kit(){const V=new Map();const put=(x,y,z,c,p='b')=>{x=Math.round(x);y=Math.round(y);z=Math.round(z);V.set(x+','+y+','+z,[x,y,z,typeof c==='function'?c(x,y,z):c,p])};
  const ell=(cx,cy,cz,rx,ry,rz,c,p='b',rough=0)=>{for(let x=Math.floor(-rx);x<=Math.ceil(rx);x++)for(let y=Math.floor(-ry);y<=Math.ceil(ry);y++)for(let z=Math.floor(-rz);z<=Math.ceil(rz);z++){const q=(x/rx)**2+(y/ry)**2+(z/rz)**2;if(q>1)continue;if(q<.45)continue;if(rough&&q>.75&&h3(x+cx,y+cy,z+cz,7)<rough)continue;put(cx+x,cy+y,cz+z,c,p)}};
  const cap=(a,b,r0,r1,c,p='b')=>{const L=Math.hypot(b[0]-a[0],b[1]-a[1],b[2]-a[2]),n=Math.max(1,Math.ceil(L*2));for(let i=0;i<=n;i++){const t=i/n,r=r0+(r1-r0)*t,cx=a[0]+(b[0]-a[0])*t,cy=a[1]+(b[1]-a[1])*t,cz=a[2]+(b[2]-a[2])*t;const R=Math.ceil(r);
      for(let x=-R;x<=R;x++)for(let y=-R;y<=R;y++)for(let z=-R;z<=R;z++)if(x*x+y*y+z*z<=r*r+.35)put(cx+x,cy+y,cz+z,c,p)}};
  const path=(pts,r0,r1,c,p)=>{for(let i=0;i<pts.length-1;i++){const f0=i/(pts.length-1),f1=(i+1)/(pts.length-1);cap(pts[i],pts[i+1],r0+(r1-r0)*f0,r0+(r1-r0)*f1,c,p)}};
  return{V,put,ell,cap,path}}
const INFO={horse:{label:'Horse (bay, grey, chestnut, black; saddled or loose)',where:'Stables, paddock, the drive'},hound:{label:'Foxhound, tricolour',where:'Kennels, the hunt, at heel'},
  deer:{label:'Fallow deer (buck with palmate antlers, or doe)',where:'The deer park'},sheep:{label:'Suffolk sheep',where:'Home Farm, the park'},swan:{label:'Mute swan',where:'The lake, the moat'},
  hen:{label:'Hen (brown or Sussex white)',where:'Kitchen yard, Home Farm'},cat:{label:'Tabby cat',where:'Kitchen, stables, any warm sill'},peacock:{label:'Peacock (train down or in display)',where:'Lawns, terrace'}};
const B={};

B.horse=(o={})=>{const k=kit(),coat={bay:['#7a4426','#1e1a18','#6a3a20'],grey:['#c9c5bd','#8a8680','#b3aea6'],chestnut:['#9a5a2e','#d8b878','#8a4e28'],black:['#262220','#141210','#1e1b19']}[o.coat||'bay'];
  const[C0,PT,C1]=coat;const body=(x,y,z)=>o.coat==='grey'?(h3(x,y,z)<.25?'#a8a49c':C0):(h3(x,y,z)<.12?C1:C0);const legc=(x,y,z)=>y<6?(o.coat==='chestnut'&&x>0&&z<0?'#efe8dc':(o.coat==='bay'?PT:C1)):body(x,y,z);
  for(const[lx,lz,p]of[[-3,8,'fl'],[3,8,'fr'],[-3,-8,'bl'],[3,-8,'br']]){k.cap([lx,15,lz],[lx,2,lz+(lz<0?-1:0)],1.7,1.15,legc,p);for(let x=-1;x<=1;x++)for(let z=-1;z<=1;z++)k.put(lx+x,0,lz+z+(lz<0?-1:0),'#2a2420',p),k.put(lx+x,1,lz+z+(lz<0?-1:0),'#2a2420',p)}
  k.ell(0,18,0,4.6,5,12.5,body);k.ell(0,17,9,4.3,4.8,4.2,body);k.ell(0,19,-8,4.7,5,5,body);
  const mane=o.coat==='chestnut'?PT:o.coat==='grey'?'#e8e4dc':PT;
  k.cap([0,20,10],[0,29,15],3.7,2.4,body,'head');k.cap([0,30,16],[0,25,22],2.5,1.8,body,'head');k.ell(0,25,22,1.9,1.6,1.6,o.coat==='grey'?'#6a6660':'#2a2420','head');
  for(let t=0;t<=12;t++){const y=23+t*.75,z=8+t*.62;k.put(0,y+2.6,z,mane,'head');k.put(0,y+3.2,z-.6,mane,'head')}k.put(0,32,17,mane,'head');k.put(0,31,18,mane,'head');
  for(const s of[-1,1]){k.put(s,32,15,body(0,0,0),'head');k.put(s,33,15,body(0,0,0),'head');k.put(s*2,29,18,'#0e0c0b','head')}
  if(o.coat==='chestnut'||o.blaze)for(let t=0;t<6;t++)k.put(0,30-t,18+t*.8+1,'#f2ece2','head');
  k.cap([0,22,-12],[0,10,-15],1.5,.9,mane,'tail');
  if(o.saddle){for(let x=-5;x<=5;x++)for(let z=-3;z<=4;z++){const top=Math.round(18+5*Math.sqrt(Math.max(0,1-(x/4.8)**2)))+1;if(Math.abs(x)<=3||z>-2&&z<3)k.put(x,top,z,Math.abs(x)<=1&&(z===4||z===-3)?'#4a2a18':'#6a3a1e')}for(const s of[-1,1])for(let y=13;y<=21;y++)k.put(s*5,y,1,'#3a2416');
    for(let t=0;t<7;t++)k.put(0,27-t*.3,17+t*.8,'#3a2416','head');for(const s of[-1,1])k.put(s*2,26,20,'#c8a03a','head')}
  return{V:k.V,unit:.115,gait:'quad',pivots:{fl:[-3,15,8],fr:[3,15,8],bl:[-3,15,-8],br:[3,15,-8],head:[0,21,9],tail:[0,22,-12]},speeds:{walk:1.4,trot:3.2,gallop:7}}};

B.hound=(o={})=>{const k=kit(),W='#f2ede2',T='#b8783a',K='#1e1a18';const col=(x,y,z)=>y>=9&&z>-4&&z<4?K:y<5||y<7&&z>3?W:T;
  for(const[lx,lz,p]of[[-1.4,4,'fl'],[1.4,4,'fr'],[-1.4,-4,'bl'],[1.4,-4,'br']]){k.cap([lx,6,lz],[lx,1,lz],1.25,1.05,W,p);k.put(lx,0,lz,'#c8c0b0',p)}
  k.ell(0,8,0,2.3,2.5,5.6,col);k.ell(0,7.6,4,2.1,2.7,2.3,col);
  k.cap([0,9,5],[0,11,7],1.7,1.5,T,'head');k.cap([0,12,7.5],[0,10.5,11],1.8,1.1,(x,y,z)=>z>9.5&&Math.abs(x)<1?W:T,'head');k.put(0,11,12,K,'head');
  for(const s of[-1,1]){k.cap([s*1.8,12.5,7.5],[s*2.2,9.5,8],.75,.6,'#8a5428','head');k.put(s*1.4,12,9.8,K,'head')}
  k.path([[0,9.5,-5.6],[0,12,-7],[0,14,-7.5]],.7,.6,(x,y,z)=>y>=13?W:T,'tail');
  return{V:k.V,unit:.115,gait:'quad',pivots:{fl:[-1.4,6,4],fr:[1.4,6,4],bl:[-1.4,6,-4],br:[1.4,6,-4],head:[0,9,5],tail:[0,9.5,-5.6]},speeds:{walk:1.5,trot:3.5,gallop:7.5}}};

B.deer=(o={})=>{const k=kit(),C=o.winter?'#7a6a58':'#a8743c',D=o.winter?'#5a4e40':'#8a5a2e';const coat=(x,y,z)=>!o.winter&&y>=13&&h3(x,y,z,3)<.12?'#f4ead8':y<10.5?'#e8dcc4':C;
  for(const[lx,lz,p]of[[-1.6,5,'fl'],[1.6,5,'fr'],[-1.6,-5,'bl'],[1.6,-5,'br']]){k.cap([lx,10,lz],[lx,1,lz],1.1,.75,(x,y,z)=>y<3?D:C,p);k.put(lx,0,lz,'#2a2420',p)}
  k.ell(0,12,0,2.8,3.1,6.6,coat);k.ell(0,12,-6,2.4,2.4,1.6,(x,y,z)=>Math.abs(x)<1&&y>11?'#1e1a18':'#f4ead8');
  k.cap([0,13,5],[0,19,8],1.9,1.2,C,'head');k.cap([0,20,8.5],[0,18,12],1.35,.8,C,'head');k.put(0,18,13,'#1e1a18','head');
  for(const s of[-1,1]){k.cap([s*1,21,8],[s*2.4,22.5,7.4],.6,.5,C,'head');k.put(s*1.3,19.5,10.3,'#0e0c0b','head')}
  if(o.buck){const A='#d8c8a8';for(const s of[-1,1]){k.path([[s*.8,21,8.4],[s*1.6,24,8],[s*2.6,26,6.8]],.55,.45,A,'head');k.put(s*1.4,23,9.4,A,'head');k.put(s*1.4,23,10.2,A,'head');
      for(let a=0;a<7;a++)for(let b=0;b<4;b++){k.put(s*(2.6+a*.45),26+b*.9+a*.15,6.8-a*.55,A,'head')}for(let a=0;a<4;a++)k.put(s*(3+a*.8),30+a*.2,5.8-a*.6,A,'head')}}
  k.put(0,13,-7,'#1e1a18','tail');k.put(0,12,-7,'#f4ead8','tail');
  return{V:k.V,unit:.115,gait:'quad',pivots:{fl:[-1.6,10,5],fr:[1.6,10,5],bl:[-1.6,10,-5],br:[1.6,10,-5],head:[0,13,5],tail:[0,13,-7]},speeds:{walk:1.2,trot:4,gallop:9}}};

B.sheep=(o={})=>{const k=kit(),W=(x,y,z)=>h3(x,y,z,4)<.3?'#d8d0bc':'#ebe5d4',F='#1e1a18';
  for(const[lx,lz,p]of[[-1.6,3.4,'fl'],[1.6,3.4,'fr'],[-1.6,-3.4,'bl'],[1.6,-3.4,'br']])k.cap([lx,5,lz],[lx,0,lz],1,.9,F,p);
  k.ell(0,8,0,3.7,3.7,5.4,W,'b',.35);k.ell(0,10,0,3,1.8,4.6,W,'b',.3);
  k.cap([0,9,4.6],[0,10,5.8],1.7,1.6,W,'head');k.cap([0,10,6],[0,8,8.4],1.6,1.1,F,'head');for(const s of[-1,1]){k.put(s*2.2,10,6.2,F,'head');k.put(s*3,10,6.4,F,'head');k.put(s*1.2,10,7.2,'#c8b040','head')}
  k.cap([0,8,-5.4],[0,6,-6.2],.8,.7,W,'tail');
  return{V:k.V,unit:.115,gait:'quad',pivots:{fl:[-1.6,5,3.4],fr:[1.6,5,3.4],bl:[-1.6,5,-3.4],br:[1.6,5,-3.4],head:[0,9,4.6],tail:[0,8,-5.4]},speeds:{walk:.9,trot:2.6,gallop:4.5}}};

B.swan=(o={})=>{const k=kit(),W=(x,y,z)=>h3(x,y,z,5)<.18?'#e8e8e2':'#f8f8f4';
  for(let x=-5;x<=5;x++)for(let y=-1;y<=5;y++)for(let z=-10;z<=8;z++){const zz=z<0?z/10:z/8;const q=(x/5)**2+((y-1.5)/3.6)**2+zz*zz;if(q<=1&&q>.4)k.put(x,y,z,W)}
  for(const s of[-1,1])k.ell(s*3,5,-1,2.2,1.8,6,W,'b');k.ell(0,5.5,-9,1.5,1.2,2.5,W,'b');
  k.path([[0,4,6],[0,8,9],[0,12,8.5],[0,15.5,9.2]],1.4,1,W,'head');k.ell(0,16.5,10.4,1.3,1.4,1.8,W,'head');
  for(let z=12;z<=15;z++)for(let x=-1;x<=1;x++)k.put(x,16-(z-12)*.35,z,z===12?'#1a1a1a':'#e07a2a','head');k.put(0,17,12,'#1a1a1a','head');for(const s of[-1,1])k.put(s*1.3,17,11,'#111','head');
  return{V:k.V,unit:.06,gait:'swan',pivots:{head:[0,4,6]},speeds:{walk:.5,trot:.9,gallop:1.4}}};

B.hen=(o={})=>{const k=kit(),C=o.coat==='white'?'#f2eee4':'#8a4a22',D=o.coat==='white'?'#1e1a18':'#5a2a14';
  for(const[s,p]of[[-1,'bl'],[1,'br']]){k.cap([s,3.5,0],[s,0,.5],.6,.5,'#d8a830',p);k.put(s,0,1.6,'#d8a830',p)}
  k.ell(0,6,0,3,3.4,4.4,(x,y,z)=>y>7&&z<-1?D:C);for(let i=0;i<5;i++)k.cap([0,7,-3],[0,11-i*.4,-6+i*.3],.9,.6,D,'tail');
  k.cap([0,8,3],[0,10,4],1.5,1.4,o.coat==='white'?'#e8e4dc':C,'head');k.ell(0,10.6,4.4,1.6,1.7,1.6,o.coat==='white'?'#f2eee4':C,'head');
  for(let z=3;z<=6;z++)k.put(0,12.4+(z===4||z===5?1:0),z,'#c8261e','head');k.put(0,9,6.4,'#c8261e','head');k.put(0,10,6.6,'#d8a830','head');k.put(0,10,7.2,'#d8a830','head');for(const s of[-1,1])k.put(s*1.4,11,5,'#111','head');
  return{V:k.V,unit:.05,gait:'bird',pivots:{bl:[-1,3.5,0],br:[1,3.5,0],head:[0,8,3],tail:[0,7,-3]},speeds:{walk:.5,trot:1.2,gallop:2}}};

B.cat=(o={})=>{const k=kit(),T=(x,y,z)=>(Math.round(z)+40)%3===0?'#5a4632':'#8a7050';
  for(const[lx,lz,p]of[[-1.2,3.4,'fl'],[1.2,3.4,'fr'],[-1.2,-3.4,'bl'],[1.2,-3.4,'br']])k.cap([lx,5,lz],[lx,0,lz],.9,.8,(x,y,z)=>y<1?'#e8e0d0':T(x,y,z),p);
  k.ell(0,6.5,0,2.1,2.1,5,T);k.ell(0,9,5.2,2.3,2.1,2,T,'head');k.cap([0,7,3.8],[0,8.5,4.6],1.4,1.4,T,'head');
  for(const s of[-1,1]){k.put(s*1.5,11.4,5,'#5a4632','head');k.put(s*1.6,12.2,5,'#5a4632','head');k.put(s*1,9.6,7,'#7a9a3a','head')}k.put(0,8.6,7.3,'#c88a8a','head');for(let x=-1;x<=1;x++)k.put(x,8,7,'#e8e0d0','head');
  k.path([[0,7,-5],[0,10,-7],[0,13,-7.5],[0,14.5,-6.4]],.75,.6,T,'tail');
  return{V:k.V,unit:.05,gait:'quad',pivots:{fl:[-1.2,5,3.4],fr:[1.2,5,3.4],bl:[-1.2,5,-3.4],br:[1.2,5,-3.4],head:[0,7,3.8],tail:[0,7,-5]},speeds:{walk:.7,trot:1.8,gallop:4}}};

B.peacock=(o={})=>{const k=kit(),BL=(x,y,z)=>h3(x,y,z,6)<.3?'#2a6ac8':'#1f4fa8',G='#2f7a3a',BR='#8a6a2a';
  for(const[s,p]of[[-1,'bl'],[1,'br']]){k.cap([s,6,0],[s,0,.5],.55,.5,'#9a9488',p)}k.ell(0,9,0,2.6,3,4.6,(x,y,z)=>y>9&&z<0?'#7a6a40':BL(x,y,z));
  k.cap([0,11,3],[0,17,5],1.3,1,BL,'head');k.ell(0,18,5.6,1.2,1.3,1.4,BL,'head');k.put(0,18,7.4,'#c8b080','head');for(const s of[-1,1])k.put(s*.9,18.4,6.4,'#f4f4f0','head');for(let i=-1;i<=1;i++){k.put(i*.8,20,5.2,BL,'head');k.put(i*.8,21,5,'#2a6ac8','head')}
  const eye=(x,y,z,r)=>{const d=r%4;return d<1.2?'#16285a':d<2?'#2a8aa8':d<2.6?'#c8a03a':G};
  if(o.display){for(let a=-85;a<=85;a+=3)for(let r=4;r<=22;r+=.7){const t=a*Math.PI/180,x=Math.sin(t)*r,y=8+Math.cos(t)*r,z=-4-r*.22;const ring=(r>=17&&r<=21)&&((a+85)%12<6);k.put(x,y,z,ring?eye(0,0,0,(r-17)*2):(h3(Math.round(x),Math.round(y),1)<.2?BR:G),'tail')}}
  else{for(let z=-4;z>=-24;z--)for(let x=-3;x<=3;x++){const w=3-Math.max(0,(-z-18)/2);if(Math.abs(x)>w)continue;const y=Math.max(1,Math.round(7+(z+4)*.28));const ring=(-z)%5===0&&Math.abs(x)<=1&&z<-8;k.put(x,y,z,ring?'#2a8aa8':(h3(x,y,z)<.25?BR:G),'tail')}}
  return{V:k.V,unit:.06,gait:'bird',pivots:{bl:[-1,6,0],br:[1,6,0],head:[0,11,3],tail:[0,8,-4]},speeds:{walk:.6,trot:1.4,gallop:2.2}}};

function build(kind,o={}){const f=B[kind];if(!f)throw new Error('No animal '+kind);const r=f(o);r.kind=kind;r.label=INFO[kind].label;r.count=r.V.size;return r}

/* rig: each jointed part gets its own pivot so legs swing from the hip, heads drop to graze, tails swish */
function Rig(THREE,b,meshOf){const u=b.unit,group=new THREE.Group(),body=new THREE.Group();group.add(body);const maps={};
  for(const[k,v]of b.V){const p=b.pivots[v[4]]?v[4]:'b';(maps[p]=maps[p]||new Map()).set(k,v)}if(maps.b)body.add(meshOf(maps.b,u));const J={};
  for(const p in b.pivots){if(!maps[p])continue;const[px,py,pz]=b.pivots[p];const g=new THREE.Group();g.position.set(px*u,py*u,pz*u);const m=meshOf(maps[p],u);m.position.set(-px*u,-py*u,-pz*u);g.add(m);body.add(g);J[p]=g}
  let ph=Math.random()*6,t=Math.random()*9,head=0;
  function pose(dt,s={}){const sp=s.speed||0,mode=s.mode||(sp>.05?'walk':'idle');t+=dt;const S=b.speeds;const gallop=sp>S.trot*1.25,trot=!gallop&&sp>S.walk*1.3;
    ph+=dt*(b.gait==='quad'?(gallop?sp*1.15:trot?sp*1.6:sp*2.6)/Math.max(.5,u/.115):sp*9);const a=Math.sin(ph),c=Math.cos(ph);
    if(b.gait==='quad'){const A=sp<.05?0:gallop?.75:trot?.5:.32;const L=(j,v)=>{if(J[j])J[j].rotation.x=v};
      if(mode==='sit'){body.rotation.x=-.5;body.position.y=-.03;L('fl',.5);L('fr',.5);L('bl',-1.1);L('br',-1.1)}
      else{body.rotation.x=gallop?Math.sin(ph)*.06:0;body.position.y=gallop?Math.abs(Math.sin(ph))*.12:trot?Math.abs(Math.sin(ph*1))*.04:0;
        if(gallop){L('fl',a*A);L('fr',Math.sin(ph+.5)*A);L('bl',-Math.sin(ph+1.9)*A);L('br',-Math.sin(ph+2.4)*A)}else{L('fl',a*A);L('br',a*A);L('fr',-a*A);L('bl',-a*A)}}
      const want=mode==='graze'?.95:mode==='sit'?.4:mode==='alert'?-.25:gallop?.15:0;head+=(want-head)*Math.min(1,dt*3);if(J.head)J.head.rotation.x=head+(sp>.05?Math.sin(ph*2)*.04:mode==='graze'?Math.sin(t*1.7)*.05:0);
      if(J.tail){J.tail.rotation.z=Math.sin(t*(b.kind==='hound'?9:2.2))*(b.kind==='hound'?.5:.25);J.tail.rotation.x=gallop?-.6:0}}
    else if(b.gait==='bird'){const A=sp>.02?.5:0;if(J.bl)J.bl.rotation.x=a*A;if(J.br)J.br.rotation.x=-a*A;body.position.y=sp>.02?Math.abs(a)*.01:0;
      const peck=mode==='peck'?Math.max(0,Math.sin(t*3.3))**4:0;const want=mode==='peck'?1.1*peck:0;head+=(want-head)*Math.min(1,dt*10);if(J.head){J.head.rotation.x=head;J.head.position.z=b.pivots.head[2]*u+(sp>.02?Math.sin(ph)*.012:0)}
      if(J.tail)J.tail.rotation.x=mode==='display'?Math.sin(t*14)*.02:0}
    else if(b.gait==='swan'){body.rotation.z=Math.sin(t*.9)*.03;if(J.head)J.head.rotation.x=mode==='feed'?1.6:Math.sin(t*.5)*.08}}
  return{group,body,joints:J,pose,built:b}}

/* the brain: wander, graze, keep with the herd, follow a leader. o = {x,z, area:[x0,z0,x1,z1], speeds, herd:{x,z}, follow:()=>[x,z], keep:dist, blocked:(x,z)=>bool, calm} */
function Brain(o){const s={x:o.x,z:o.z,heading:o.heading||Math.random()*6.28,speed:0,mode:'graze',t:Math.random()*4,tx:o.x,tz:o.z,run:0};const A=o.area,sp=o.speeds||{walk:1.2,trot:3,gallop:6};
  const inA=(x,z)=>x>A[0]&&x<A[2]&&z>A[1]&&z<A[3]&&!(o.blocked&&o.blocked(x,z));
  const pick=()=>{const cx=o.herd?o.herd.x:s.x,cz=o.herd?o.herd.z:s.z,R=o.herd?(o.spread||4):8;for(let i=0;i<12;i++){const x=cx+(Math.random()-.5)*2*R,z=cz+(Math.random()-.5)*2*R;if(inA(x,z)){s.tx=x;s.tz=z;return}}s.tx=(A[0]+A[2])/2;s.tz=(A[1]+A[3])/2};
  s.startle=(fx,fz)=>{const d=Math.hypot(s.x-fx,s.z-fz)||1;s.tx=s.x+(s.x-fx)/d*10;s.tz=s.z+(s.z-fz)/d*10;s.tx=Math.max(A[0]+1,Math.min(A[2]-1,s.tx));s.tz=Math.max(A[1]+1,Math.min(A[3]-1,s.tz));s.run=3;s.mode='walk'};
  s.step=dt=>{s.t-=dt;let want=0;
    if(o.follow){const[fx,fz]=o.follow();const d=Math.hypot(fx-s.x,fz-s.z),keep=o.keep||1.5;s.tx=fx+(o.offset?o.offset[0]:0);s.tz=fz+(o.offset?o.offset[1]:0);want=d>keep*3?sp.trot:d>keep?sp.walk:0;if(want===0&&s.t<=0){s.mode=Math.random()<.4?'sniff':'idle';s.t=1+Math.random()*2}if(want)s.mode='walk'}
    else{if(s.run>0)s.run-=dt;if(s.mode==='walk'||s.run>0){const d=Math.hypot(s.tx-s.x,s.tz-s.z);if(d<.4){s.mode=Math.random()<(o.calm??.65)?'graze':'idle';s.t=3+Math.random()*7}else want=s.run>0?sp.gallop*.75:sp.walk}else if(s.t<=0){pick();s.mode='walk'}}
    if(want>0){const th=Math.atan2(s.tx-s.x,s.tz-s.z);let dh=th-s.heading;while(dh>Math.PI)dh-=6.283;while(dh<-Math.PI)dh+=6.283;s.heading+=dh*Math.min(1,dt*2.5)}
    s.speed+=(want-s.speed)*Math.min(1,dt*(want>s.speed?2:3));const nx=s.x+Math.sin(s.heading)*s.speed*dt,nz=s.z+Math.cos(s.heading)*s.speed*dt;if(inA(nx,nz)||o.follow){s.x=nx;s.z=nz}else{s.speed*=.3;pick()}
    if(o.herd&&o.lead){o.herd.x+=(s.x-o.herd.x)*dt*.2;o.herd.z+=(s.z-o.herd.z)*dt*.2}return s};
  pick();return s}

/* post and rail fence along +x, len blocks; o.c colour (white or oak) */
function fence(len,o={}){const k=kit(),n=Math.round(len/.115),c=o.c||'#ece6d6',p=o.post||c;for(let x=0;x<=n;x++){if(x%17===0)for(let y=0;y<=11;y++)for(const dx of[0,1])for(const dz of[0,1])k.put(x+dx,y,dz,p);for(const y of[5,9])k.put(x,y,0,c),k.put(x,y+1,0,c)}return{V:k.V,unit:.115}}

return{build,Rig,Brain,fence,info:INFO,kinds:Object.keys(B)}})();
if(typeof module!=='undefined')module.exports=ANIMALS;
