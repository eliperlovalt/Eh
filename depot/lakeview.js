/* Euphrates Hall, Parts Depot: the "Seasons and water" view.
   A worked example of SEASONS + WATER + LIVERY together: the lake, its shore, the boathouse, the fountain,
   the lamp path and the people who use them, all driven by the real calendar and clock. */
export function mountLake(ctx){
const{THREE,S,R,cam,ctl,lights,list,card,floor}=ctx;const W=WATER,SE=SEASONS,P=PROPS,LV=LIVERY,AG=ctx.agents;
const root=new THREE.Group();S.add(root);const LAWN=.15;
const vmat=new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide}),gmat=new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.DoubleSide});gmat.color.setRGB(1.35,1.25,1.05);
const geo=(V,unit)=>{const f=P.faces({V,unit});const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(f.pos,3));g.setAttribute('color',new THREE.BufferAttribute(f.col,3));g.setAttribute('normal',new THREE.BufferAttribute(f.nor,3));return g};
const meshOf=(V,unit,glow)=>V.size?new THREE.Mesh(geo(V,unit),glow?gmat:vmat):new THREE.Group();
const holder=(x,y,z,r)=>{const g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=(r||0)*Math.PI/180;root.add(g);return g};
const swap=(g,meshes)=>{while(g.children.length){const c=g.children.pop();c.geometry&&c.geometry.dispose()}meshes.forEach(m=>m&&g.add(m))};

/* water */
const lake=W.Lake(THREE,{cx:0,cz:0,rx:14,rz:9,depth:3,level:0,shelf:{side:'s',k:.6}});root.add(lake.mesh);
const fx=-21,fz=-11;const F=W.Fountain(THREE,{x:fx,z:fz,y:LAWN});root.add(F.basin.mesh,F.points);
const splash=W.Splash(THREE);root.add(splash.points);const skip=W.Skipper(lake,splash);
const sky=SE.Sky(THREE,{radius:190});S.add(sky);const weather=SE.Weather(THREE,{area:[-30,-22,30,22]});root.add(weather);const mist=SE.Mist(THREE,{cx:0,cz:0,w:34,d:24,y:0});root.add(mist);

/* fixed pieces */
const fixed=(k,x,y,z,r,o)=>{const b=P.build(k,o||{});const h=holder(x,y,z,r);h.add(meshOf(b.V,b.unit));return h};
for(let i=0;i<4;i++)fixed('jetty',6,-.95,-8.4+i*1.84,0);
fixed('bench',4.5,LAWN,13.6,180);fixed('bench',-8,LAWN,13.6,180);fixed('urn',fx-3.6,LAWN,fz+3.4);fixed('urn',fx+3.6,LAWN,fz+3.4);
{const b=P.build('fountain');const h=holder(fx,LAWN,fz,0);h.add(meshOf(F.strip(b.V),b.unit))}
const moored=holder(8.7,0,-5.2,0);moored.add(meshOf(P.build('rowboat').V,.115));const rowing=holder(0,0,0,0);rowing.add(meshOf(P.build('rowboat',{house:'blue'}).V,.115));

/* seasonal pieces: rebuilt when the season moves */
const TREES=[['treeCedar',-17,-16,3],['treeOak',10,-17,5],['treeOak',-3,-18,8],['treePoplar',19,-14,1],['treePoplar',22.5,-14,2],['treePoplar',26,-14,3],['treeBirch',15.5,-7.5,3],['treeBirch',17.5,-4.5,9],
  ['treeBeech',23,5,4],['treeYew',-26,1,2],['treeYew',-16,-5,1],['treeApple',24,15,2],['treeApple',27.5,18,5],['treeBirch',-17,9,7],['treeOak',-28,-19,11]].map(([k,x,z,s])=>({k,x,z,s,b:P.build(k,{seed:s}),h:holder(x,LAWN,z,0)}));
const bh=W.boathouse(P);const bhH=holder(-9,LAWN,-12.6,0);
const lampPos=[[-18,11.8],[-9,11.8],[0,11.8],[9,11.8],[18,11.8],[6,-2.6]];const lampB=P.build('lampPost');
const lamps=lampPos.map(([x,z])=>({x,z,h:holder(x,z===-2.6?.2:LAWN,z,0),lit:null,light:(()=>{const l=new THREE.PointLight(0xffc878,0,12,2);l.position.set(x,(z===-2.6?.2:LAWN)+4.1,z);root.add(l);return l})()}));
const homeL=[-26,11.8],winLight=new THREE.PointLight(0xffb060,0,10,2);winLight.position.set(-9,1.6,-9.6);root.add(winLight);
let terrain=null;const smoke=(()=>{const n=90,pos=new Float32Array(n*3).fill(-99),g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));const m=new THREE.Points(g,new THREE.PointsMaterial({color:0xb8b8b8,size:.28,transparent:true,opacity:.35,depthWrite:false}));m.frustumCulled=false;root.add(m);
  const Q=[...Array(n)].map(()=>({t:-Math.random()*6}));const top=[-9+bh.chimney[0]*.115,LAWN+bh.chimney[1]*.115,-12.6+bh.chimney[2]*.115];
  return{m,update(dt,on,wind){Q.forEach((q,i)=>{q.t+=dt;if(q.t>6||(!q.live&&q.t>=0)){if(on){q.live=true;q.t=0;q.x=top[0];q.y=top[1];q.z=top[2]}else{q.live=false;q.t=-Math.random()*2}}if(!q.live){pos[i*3+1]=-99;return}q.x+=wind[0]*dt*.5;q.z+=wind[1]*dt*.5;q.y+=dt*.55;pos.set([q.x+Math.sin(q.t*1.3+i)*.1,q.y,q.z],i*3)});g.attributes.position.needsUpdate=true}}})();

/* people */
const byId=id=>AG.agents.find(a=>a.id===id);const firstOf=h=>AG.agents.find(a=>a.house===h&&!a.sealed&&!a.lead);
function figure(a){const V=LV.vox(a),u=.115,parts={b:new Map(),ll:new Map(),lr:new Map(),al:new Map(),ar:new Map()};let shY=16;
  for(const[k,v]of V){const[x,y,z,c,p]=v;if(p==='al'||p==='ar'){parts[p].set(k,v);shY=Math.max(shY,y);continue}if(y<9&&p!=='flame'){(x<=-1?parts.ll:parts.lr).set(k,v);continue}parts.b.set(k,v)}
  const outer=new THREE.Group(),tilt=new THREE.Group();outer.add(tilt);root.add(outer);tilt.add(meshOf(parts.b,u));
  const piv=(Vm,px,py)=>{const g=new THREE.Group();g.position.set(px*u,py*u,0);const m=meshOf(Vm,u);m.position.set(-px*u,-py*u,0);g.add(m);tilt.add(g);return g};
  const f={outer,tilt,ll:piv(parts.ll,-2,9),lr:piv(parts.lr,1,9),al:piv(parts.al,-5,shY),ar:piv(parts.ar,5,shY),ph:0,w:{x:0,z:0},a};
  f.pose=(dt,mode,speed,act)=>{f.ph+=dt*(mode==='swim'?4:Math.min(9,speed*5.5));const s=Math.sin(f.ph);tilt.rotation.x=mode==='swim'?1.35:mode==='skate'?.18:0;
    if(mode==='swim'){f.al.rotation.x=f.ph;f.ar.rotation.x=f.ph+Math.PI;f.ll.rotation.x=Math.sin(f.ph*2.5)*.3;f.lr.rotation.x=-Math.sin(f.ph*2.5)*.3;return}
    const sw=speed>.05?(mode==='skate'?.55:.38):0;f.ll.rotation.x=s*sw;f.lr.rotation.x=-s*sw;f.al.rotation.x=-s*sw*.8;f.ar.rotation.x=act?-2.5:s*sw*.8};return f}
const keeper=byId('brown.brown-seasons-clerk')||firstOf('brown'),grounds=byId('brown.home-gardener')||firstOf('brown');
const lighter=figure(keeper),wader=figure(grounds),swimmer=figure(firstOf('blue')),skater=figure(firstOf('silver'));
const wadePath=[[-3,13.6],[-3,9.5],[-2,7],[1,6.2],[3.2,7.6],[2.2,10.5],[-.5,13.6]];let wadeT=0;
const along=(path,t)=>{let L=0;const seg=[];for(let i=0;i<path.length;i++){const a=path[i],b=path[(i+1)%path.length];const l=Math.hypot(b[0]-a[0],b[1]-a[1]);seg.push([a,b,l]);L+=l}let d=((t%L)+L)%L;for(const[a,b,l]of seg){if(d<=l){const f=d/l;return{x:a[0]+(b[0]-a[0])*f,z:a[1]+(b[1]-a[1])*f,hd:Math.atan2(b[0]-a[0],b[1]-a[1])}}d-=l}return{x:path[0][0],z:path[0][1],hd:0}};
const ducks=[[-6,-3,3.2,.35,true],[-5.2,-2.6,3.2,.35,false],[5,2,2.4,-.3,true],[-1,-5,4.5,.25,false]].map(([cx,cz,r,w,dr],i)=>{const h=holder(cx,0,cz,0);h.add(meshOf(W.duck(dr),.05));return{h,cx,cz,r,w,ph:i*1.7,t:0}});

/* time */
let clock=Date.now(),speed=0,live=true,forceRain=false,lastKey='',lastLamps='',lastBH='',lastTer='',st=null,sk=null,time=0;
const PRE={Spring:[3,28],Summer:[6,15],Autumn:[9,24],Winter:[0,20]};
function setDay(m,d){const now=new Date(clock);const y=m<new Date().getMonth()-1&&m<2?new Date().getFullYear()+1:new Date().getFullYear();const t=new Date(y,m,d,now.getHours(),now.getMinutes());clock=t.getTime();live=false;speed=0}
function setMins(mins){const d=new Date(clock);d.setHours(0,0,0,0);clock=d.getTime()+mins*6e4;live=false}

/* controls */
list.innerHTML='';const btn=(t,f)=>{const b=document.createElement('button');b.textContent=t;b.onclick=()=>{f(b);paint()};list.appendChild(b);return b};
const bNow=btn('Now',()=>{live=true;speed=0;clock=Date.now()});const bs={};for(const k in PRE)bs[k]=btn(k,()=>setDay(...PRE[k]));
const sl=document.createElement('input');sl.type='range';sl.min=0;sl.max=1439;sl.step=1;sl.style.cssText='min-width:150px;accent-color:#c9a227';sl.oninput=()=>{setMins(+sl.value);speed=0;paint()};list.appendChild(sl);
const bPlay=btn('Play a day',()=>{speed=speed===480?0:480;live=false}),bDusk=btn('Watch the lamplighter',()=>{const s=SE.state(new Date(clock));setMins(s.set-12);speed=6}),bRain=btn('Rain',()=>{forceRain=!forceRain});
function paint(){bNow.classList.toggle('on',live);bPlay.classList.toggle('on',speed===480);bDusk.classList.toggle('on',speed===6);bRain.classList.toggle('on',forceRain);const d=new Date(clock);for(const k in PRE)bs[k].classList.toggle('on',!live&&d.getMonth()===PRE[k][0]&&d.getDate()===PRE[k][1])}
paint();

/* tap the water to skip a stone */
const ray=new THREE.Raycaster(),v2=new THREE.Vector2();let down=null;
const pd=e=>{down=[e.clientX,e.clientY]},pu=e=>{if(!down||Math.hypot(e.clientX-down[0],e.clientY-down[1])>6)return;const r=R.domElement.getBoundingClientRect();v2.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(v2,cam);
  const hit=ray.intersectObject(lake.mesh)[0];if(hit&&!lake.frozen){const p=hit.point;const from=Math.hypot(p.x-6,p.z+2.6)<Math.hypot(p.x,p.z-10)?[6,-2.6]:[p.x*.3,10];skip.throw(from[0],from[1],p.x,p.z)}
  const fh=ray.intersectObject(F.basin.mesh)[0];if(fh)F.basin.disturb(fh.point.x,fh.point.z,.04,.2)};
R.domElement.addEventListener('pointerdown',pd);R.domElement.addEventListener('pointerup',pu);

/* the camera and the old lights */
const saved={fog:S.fog,hemi:[lights.hemi.color.getHex(),lights.hemi.groundColor.getHex(),lights.hemi.intensity],sun:[lights.sun.color.getHex(),lights.sun.intensity,lights.sun.position.clone()],fill:lights.fill.intensity,clear:R.getClearColor(new THREE.Color()).getHex()};
floor.visible=false;S.fog=new THREE.Fog(0x9fb3c8,45,170);ctl.target.set(0,0,-1);const asp=innerWidth/innerHeight;cam.position.set(2,asp<1?30:18,asp<1?46:33);ctl.update();

function rebuild(){const q=(v,n)=>Math.round(v*n)/n;
  const key=[st.season,q(st.leaf,20),q(st.turn,20),q(st.blossom,10),q(st.snow,10),q(st.fresh,5)].join();
  if(key!==lastKey){lastKey=key;for(const t of TREES){const r=SE.restyle(t.b.V,st,{evergreen:SE.EVERGREEN.includes(t.k),blossom:SE.BLOSSOM.includes(t.k),beech:SE.BEECH.includes(t.k),unit:t.b.unit,seed:t.s});swap(t.h,[meshOf(r.V,t.b.unit)])}}
  const tk=[q(st.grass.length,1),st.grass,q(st.litter,10),q(st.snow,10)].join();if(tk!==lastTer){lastTer=tk;if(terrain){root.remove(terrain);terrain.geometry.dispose()}
    terrain=W.Terrain(THREE,{x0:-32,z0:-24,x1:32,z1:24,cell:.5,lakes:[lake],grass:st.grass,litter:st.litter,snow:st.snow,top:LAWN,paths:[[-30,11,58,1.6,'#b4a68a'],[-26.5,-15.5,11,9,'#bdb09a'],[-22,-6.5,1.6,17.5,'#b4a68a']]});root.add(terrain)}
  const bk=[key,q(st.windows,10),st.night>.5].join();if(bk!==lastBH){lastBH=bk;const r=SE.restyle(bh.V,st,{windows:st.night>.15?st.windows:0,unit:.115,seed:3});swap(bhH,[meshOf(r.V,.115),r.glow.size?meshOf(r.glow,.115,true):null])}}

let pt=0;function tick(dt){time+=dt;pt+=dt;if(pt>.5){pt=0;paint()}if(live)clock=Date.now();else clock+=dt*1000*speed;const date=new Date(clock);
  st=SE.state(date);if(forceRain){st.raining=1;st.snowing=0}st.wind=[.6,.2];sk=SE.sky(st);if(!sl.matches(':active'))sl.value=Math.floor(st.mins);
  /* sky, light, fog */
  sky.set(sk,cam);lights.hemi.color.set(sk.hemiSky);lights.hemi.groundColor.set(sk.hemiGround);lights.hemi.intensity=sk.hemiI*1.15;
  if(sk.sunI>0){lights.sun.color.set(sk.sunColor);lights.sun.intensity=sk.sunI*1.25;lights.sun.position.set(...sk.sunDir).multiplyScalar(50)}else{lights.sun.color.set(sk.moonColor);lights.sun.intensity=sk.moonI;lights.sun.position.set(...sk.moonDir).multiplyScalar(50)}
  lights.fill.intensity=.35*(1-st.night);S.fog.color.set(sk.fog);const over=sk.overcast;S.fog.near=45-over*25-st.night*10;S.fog.far=170-over*70;R.setClearColor(sk.fog);
  lake.look(sk,{ice:st.ice});F.look(sk,{ice:st.ice});F.on=st.ice<.6;rebuild();
  /* lamps and the lamplighter */
  const LL=SE.lamplighter(lampPos,st,{home:homeL,speed:20,dwell:.8});const lk=LL.lit.join();
  if(lk!==lastLamps||lamps.some(l=>l.lit===null)){lastLamps=lk;lamps.forEach((l,i)=>{const on=!!LL.lit[i];if(on===l.lit)return;l.lit=on;const r=SE.restyle(lampB.V,st,{lit:on,lampGlass:true,unit:.115,snow:false});swap(l.h,[meshOf(r.V,.115),r.glow.size?meshOf(r.glow,.115,true):null])})}
  lamps.forEach(l=>{l.light.intensity=l.lit?14*(.2+.8*st.night):0});winLight.intensity=st.night>.15?st.windows*6*st.night:0;
  {const f=lighter,[x,z]=LL.pos;const mv=Math.hypot(x-f.w.x,z-f.w.z)/Math.max(dt,1e-3);f.w.x=x;f.w.z=z;f.outer.position.set(x,LAWN,z);if(LL.phase==='walk')f.outer.rotation.y=LL.heading;else if(LL.phase==='lighting'||LL.phase==='snuffing')f.outer.rotation.y=Math.PI;f.pose(dt,'walk',LL.phase==='walk'?Math.min(2,mv/Math.max(1,speed)):0,LL.phase==='lighting'||LL.phase==='snuffing')}
  /* the groundskeeper wades; a swimmer in summer; a skater when the lake is frozen */
  wadeT+=dt*.9;{const p=along(wadePath,wadeT);wader.outer.position.x=p.x;wader.outer.position.z=p.z;wader.outer.rotation.y=p.hd;wader.w.x=p.x;wader.w.z=p.z;const r=W.wade(lake,wader.w,dt,splash);wader.outer.position.y=r.y??LAWN;wader.pose(dt,r.mode==='swim'?'swim':'walk',.9)}
  const swimOn=st.doy>=152&&st.doy<=250&&!lake.frozen&&st.night<.5;swimmer.outer.visible=swimOn;if(swimOn){const a=time*.16;const x=-5+Math.cos(a)*3.6,z=-.5+Math.sin(a)*3;swimmer.w.x=x;swimmer.w.z=z;const r=W.wade(lake,swimmer.w,dt,splash);swimmer.outer.position.set(x,r.mode==='swim'?lake.level-.55+lake.heightAt(x,z):(r.y??LAWN),z);swimmer.outer.rotation.y=Math.atan2(-Math.sin(a),Math.cos(a));swimmer.pose(dt,r.mode,1)}
  skater.outer.visible=lake.frozen;if(lake.frozen){const a=time*.35;const x=-3+Math.cos(a)*6,z=-.5+Math.sin(a*1)*4;skater.outer.position.set(x,lake.level+.02,z);skater.outer.rotation.y=Math.atan2(-Math.sin(a)*6,Math.cos(a)*4);skater.pose(dt,'skate',1.2)}
  /* boats and ducks ride the actual surface */
  const ride=(h,x,z,hd,dr)=>{const s=lake.slopeAt(x,z);h.position.set(x,lake.level-dr+lake.heightAt(x,z),z);h.rotation.set(-s[1]*4,hd,s[0]*4,'YXZ')};
  if(lake.frozen){moored.position.y=lake.level-.12;moored.rotation.set(0,0,.02);rowing.visible=false}else{ride(moored,8.7,-5.2,0,.14);rowing.visible=st.night<.6&&!st.raining;
    if(rowing.visible){const a=time*.06,x=-2+Math.cos(a)*8,z=-1+Math.sin(a)*4.5,hd=Math.atan2(-Math.sin(a)*8,Math.cos(a)*4.5);ride(rowing,x,z,hd,.14);rowing._t=(rowing._t||0)+dt;if(rowing._t>.22){rowing._t=0;lake.disturb(x-Math.sin(hd)*1.6,z-Math.cos(hd)*1.6,.02,.35);lake.disturb(x+Math.cos(hd)*.9,z-Math.sin(hd)*.9,.012,.25);lake.disturb(x-Math.cos(hd)*.9,z+Math.sin(hd)*.9,.012,.25)}}}
  ducks.forEach(d=>{d.h.visible=!lake.frozen&&st.snow<.5;if(!d.h.visible)return;d.ph+=dt*d.w;const x=d.cx+Math.cos(d.ph)*d.r,z=d.cz+Math.sin(d.ph)*d.r*.7;const hd=Math.atan2(-Math.sin(d.ph)*d.r*Math.sign(d.w),Math.cos(d.ph)*d.r*.7*Math.sign(d.w));ride(d.h,x,z,hd,.06);d.t+=dt;if(d.t>.3){d.t=0;lake.disturb(x-Math.sin(hd)*.35,z-Math.cos(hd)*.35,.008,.18)}});
  if(!lake.frozen&&Math.random()<dt*.15&&st.doy>120&&st.doy<280){const x=(Math.random()-.5)*16,z=(Math.random()-.5)*10;if(lake.depthAt(x,z)>1){lake.disturb(x,z,.05,.25);splash.burst(x,lake.level,z,8,.7,1.6)}}/* a fish jumps */
  /* the rest of the world */
  weather.set(st);weather.update(dt,{ground:()=>LAWN,water:lake,drop:(x,z,a)=>lake.disturb(x,z,a,.13)});mist.set(st,sk);mist.update(dt);smoke.update(dt,st.fires||st.snow>.3,st.wind);
  lake.step(dt);F.update(dt);splash.update(dt,[lake,F.basin]);skip.update(dt);
  const n=LL.lit.filter(Boolean).length;const hm=m=>{m=((m%1440)+1440)%1440;const h=Math.floor(m/60),mm=Math.floor(m%60);return(h%12||12)+':'+String(mm).padStart(2,'0')+(h<12?' am':' pm')};
  card('The lake: '+st.label.toLowerCase(),[date.toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'})+', '+hm(st.mins)+(live?' (now)':''),
    '<b>Sun:</b> up '+hm(st.rise)+', down '+hm(st.set)+'. <b>Lamps:</b> '+n+' of '+lamps.length+' lit'+(LL.active?', the lamplighter is on his '+LL.round+' round':''),
    '<b>Season:</b> '+(lake.frozen?'the lake is frozen, skating':st.blossom>.3?'blossom on the apples':st.falling>.3?'leaves coming down, '+Math.round(st.leaf*100)+'% still on the trees':st.leaf<.1?'bare trees':'full leaf')+(st.snow>.2?', snow on the ground':'')+(st.fogDawn>.2?', mist on the water':'')+(st.raining?', rain':'')+(st.snowing?', snowing':''),
    lake.frozen?'Ice holds. Nothing to skip.':'<b>Tap the water</b> to skip a stone. The groundskeeper wades in; every step rings out.'])}
function mirror(){lake.mirror(R,S,cam)}
function dispose(){R.domElement.removeEventListener('pointerdown',pd);R.domElement.removeEventListener('pointerup',pu);S.remove(root);S.remove(sky);lake.dispose();floor.visible=true;S.fog=saved.fog;R.setClearColor(saved.clear);
  lights.hemi.color.setHex(saved.hemi[0]);lights.hemi.groundColor.setHex(saved.hemi[1]);lights.hemi.intensity=saved.hemi[2];lights.sun.color.setHex(saved.sun[0]);lights.sun.intensity=saved.sun[1];lights.sun.position.copy(saved.sun[2]);lights.fill.intensity=saved.fill}
window.__lake={setDay,setMins,setSpeed:v=>{speed=v;live=false},rain:v=>{forceRain=v},skip:(x,z)=>skip.throw(6,-2.6,x,z),get st(){return st},lake};
return{tick,mirror,dispose,sound:()=>({st,water:1})}}
