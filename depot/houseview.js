/* Euphrates Hall, Parts Depot: "The house responds" view (series part 1 of 4).
   The entrance hall: doors open for whoever walks through, curtains draw at dusk, the long-case clock keeps real time and chimes the quarters,
   candles light themselves after dark. The drive: the gates open, the carriage and pair come up to the front door, the footman comes out to meet it. */
export function mountHouse(ctx){
const{THREE,S,R,cam,ctl,lights,list,card,floor,showRoom,getShown,loadLay}=ctx;const SE=SEASONS,AG=ctx.agents;
const vmat=new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide});const gcache={};
const geo=(V,u)=>{const f=PROPS.faces({V,unit:u});const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(f.pos,3));g.setAttribute('color',new THREE.BufferAttribute(f.col,3));g.setAttribute('normal',new THREE.BufferAttribute(f.nor,3));return g};
const meshOf=(V,u)=>V.size?new THREE.Mesh(geo(V,u),vmat):new THREE.Group();
const prop=(k,x,y,z,r,o)=>{const key=k+JSON.stringify(o||{});if(!gcache[key]){const b=PROPS.build(k,o||{});gcache[key]={g:geo(b.V,b.unit)}}const m=new THREE.Mesh(gcache[key].g,vmat);m.userData.k=k;m.userData.o=o||null;m.position.set(x,y,z);m.rotation.y=(r||0)*Math.PI/180;return m};
const firstOf=(h,skip=0)=>AG.agents.filter(a=>a.house===h&&!a.sealed&&!a.lead)[skip];
const saved={fog:S.fog,hemi:[lights.hemi.color.getHex(),lights.hemi.groundColor.getHex(),lights.hemi.intensity],sun:[lights.sun.color.getHex(),lights.sun.intensity,lights.sun.position.clone()],fill:lights.fill.intensity,clear:R.getClearColor(new THREE.Color()).getHex()};
let extras=[],mode=null,root=null,man=null,fire=null,people=[],car=null,sky=null,clock=Date.now(),live=true,speed=0,st,sk,pt=0;
const along=(path,t)=>{let L=0;const seg=[];for(let i=0;i<path.length;i++){const a=path[i],b=path[(i+1)%path.length],l=Math.hypot(b[0]-a[0],b[1]-a[1]);seg.push([a,b,l]);L+=l}let d=((t%L)+L)%L;for(const[a,b,l]of seg){if(d<=l){const f=d/l;return[a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f,Math.atan2(b[0]-a[0],b[1]-a[1])]}d-=l}return[path[0][0],path[0][1],0]};
const walker=(a,path,speedB,offset=0)=>{const r=LIVERY.rig(THREE,a,meshOf);root.add(r.group);return{r,path,sp:speedB,t:offset,x:0,z:0,update(dt){this.t+=dt*this.sp;const[x,z,h]=along(this.path,this.t);this.x=x;this.z=z;r.group.position.set(x,this.y||0,z);r.group.rotation.y=h;r.pose(dt,{mode:'walk',speed:this.sp})}}};
function clear(){if(root){S.remove(root);root=null}getShown().forEach(o=>S.remove(o));if(sky){S.remove(sky);sky=null}people=[];car=null;extras=[];man=null;fire=null;window.__lightsUp=false}

/* ---------- the entrance hall ---------- */
function hall(){clear();mode='hall';window.__lightsUp=true;showRoom('entrance');document.querySelectorAll('#views button').forEach(b=>b.classList.toggle('on',b.textContent==='The house responds'));
  const g=getShown()[0];root=new THREE.Group();S.add(root);const RM={w:24,d:30,h:9};
  g.children.filter(m=>m.isMesh&&m.geometry.type==='PlaneGeometry'&&Math.abs(m.position.z)<.01&&Math.abs(m.rotation.y)<.01&&m.geometry.parameters.width===RM.w).forEach(w=>{
    const sh=new THREE.Shape();sh.moveTo(-RM.w/2,-RM.h/2);sh.lineTo(RM.w/2,-RM.h/2);sh.lineTo(RM.w/2,RM.h/2);sh.lineTo(-RM.w/2,RM.h/2);sh.lineTo(-RM.w/2,-RM.h/2);const hole=new THREE.Path();hole.moveTo(-1.75,-RM.h/2);hole.lineTo(1.75,-RM.h/2);hole.lineTo(1.75,-RM.h/2+6.3);hole.lineTo(-1.75,-RM.h/2+6.3);hole.lineTo(-1.75,-RM.h/2);sh.holes.push(hole);w.geometry=new THREE.ShapeGeometry(sh)});
  for(const z of[9,17])g.add(prop('sash',.12,0,z,90));if(!g.children.some(m=>m.userData&&m.userData.k==='doorDouble'))g.add(prop('doorDouble',12,0,0,0));
  const out=new THREE.Mesh(new THREE.PlaneGeometry(8,7),new THREE.MeshLambertMaterial({color:0x9a8e78}));out.rotation.x=-Math.PI/2;out.position.set(12,.01,-3.5);root.add(out);
  man=MANOR.respond(THREE,g);fire=FIRE.ignite(THREE,g,{rule:FIRE.rule(SE.state(new Date(clock)))});
  people=[walker(firstOf('brown',1)||firstOf('brown'),[[12,-4],[12,5],[6,13],[8,22],[16,22],[18,12],[12,5]],1.1,0),walker(firstOf('blue')||firstOf('brown'),[[12,-5],[12,8],[19,16],[12,24],[5,16],[12,8]],1.0,12),walker(firstOf('copper')||firstOf('brown'),[[3,26],[12,14],[12,-4],[12,14]],.9,6)];
  const asp=innerWidth/innerHeight;ctl.target.set(12,1.6,10);cam.position.set(asp<1?25:22,asp<1?17:12,asp<1?36:30);ctl.update();paint()}

/* ---------- the drive ---------- */
function drive(){clear();mode='drive';root=new THREE.Group();S.add(root);const LAWN=.12;
  const ter=WATER.Terrain(THREE,{x0:-6,z0:-8,x1:54,z1:50,cell:.5,lakes:[],grass:'#5a8f3a',top:0,paths:[[2,1,44,20,'#c2b596'],[22,21,5,30,'#c2b596'],[-6,43.5,60,4,'#b4a68a']]});root.add(ter);
  const wall=new THREE.Mesh(new THREE.BoxGeometry(50,8,.8),new THREE.MeshLambertMaterial({color:0xcfc5ae}));wall.position.set(24,4,-.42);root.add(wall);const cor=new THREE.Mesh(new THREE.BoxGeometry(50.6,.6,1.2),new THREE.MeshLambertMaterial({color:0xe2d9c4}));cor.position.set(24,8.1,-.4);root.add(cor);
  const facade=new THREE.Group();root.add(facade);facade.add(prop('doorDouble',24,0,0,0));for(const x of[5,11,17,31,37,43])facade.add(prop('sash',x,.4,0,0));for(const x of[21.6,26.4])facade.add(prop('column',x,0,.9,0));
  for(const it of SETS.build('forecourt').items){if(it.k==='urn')continue;const m=prop(it.k,it.x,it.y||0,it.z,it.r,it.o);if(it.k==='ironGate')m.userData.gateSign=it.x<24?-1:1;facade.add(m)}
  man=MANOR.respond(THREE,facade,{gateNear:8});fire=FIRE.ignite(THREE,facade,{rule:FIRE.rule(SE.state(new Date(clock)))});
  const coach=firstOf('brown',2)||firstOf('brown');car=MANOR.Carriage(THREE,{path:[[24.5,50],[24.5,24],[24,6.6],[30,6.4],[37,10],[35,16],[27,18.5],[24.5,24],[24.5,50]],stops:[{at:2,wait:14}],speed:2.8,coachman:coach,coats:['bay','black'],y:0,period:150});root.add(car.group);
  const loop=[[24.5,50],[24.5,24],[24,6.6],[30,6.4],[37,10],[35,16],[27,18.5],[24.5,24],[24.5,50]];
  extras=[MANOR.Traffic(THREE,{kind:'rider',agent:firstOf('silver'),coat:'chestnut',path:loop,stops:[{at:2,wait:6}],speed:3.6,delay:62,period:150}),MANOR.Traffic(THREE,{kind:'motorcar',agent:firstOf('gold'),path:loop,stops:[{at:2,wait:10}],speed:4.4,delay:104,period:150}),MANOR.Traffic(THREE,{kind:'cart',coat:'bay',path:[[-6,45.5],[54,45.5]],speed:1.6,delay:8,period:75})];extras.forEach(e=>root.add(e.group));
  const foot=LIVERY.rig(THREE,firstOf('blue',1)||firstOf('blue'),meshOf);root.add(foot.group);const fm={x:24,z:-1.5,t:0,r:foot,update(dt){const atDoor=car.state.phase==='at the door'&&car.state.wait>2.5;const h=car.group.rotation.y,cx=car.group.position.x-1.75*Math.cos(h),cz=car.group.position.z+1.75*Math.sin(h);const tx=atDoor?cx:24,tz=atDoor?cz:-1.6;const d=Math.hypot(tx-this.x,tz-this.z);const sp=d>.05?Math.min(1.3,d*2):0;
    if(sp){this.x+=(tx-this.x)/d*sp*dt;this.z+=(tz-this.z)/d*sp*dt;foot.group.rotation.y=Math.atan2(tx-this.x,tz-this.z)}else foot.group.rotation.y=atDoor?Math.atan2(car.group.position.x-this.x,car.group.position.z-this.z):0;foot.group.position.set(this.x,0,this.z);foot.group.visible=this.z>-1.4;foot.pose(dt,{mode:'walk',speed:sp})}};people=[fm];
  sky=SE.Sky(THREE,{radius:190});S.add(sky);floor.visible=false;S.fog=new THREE.Fog(0x9fb3c8,50,170);const asp=innerWidth/innerHeight;ctl.target.set(24,1.5,12);cam.position.set(asp<1?44:40,asp<1?26:16,asp<1?52:40);ctl.update();paint()}

/* ---------- controls ---------- */
list.innerHTML='';const btn=(t,f)=>{const b=document.createElement('button');b.textContent=t;b.onclick=()=>{f();paint()};list.appendChild(b);return b};
const bH=btn('The entrance hall',hall),bD=btn('The drive',drive),bN=btn('Now',()=>{live=true;speed=0}),bDu=btn('Dusk',()=>{const s=SE.state(new Date());const d=new Date();d.setHours(0,0,0,0);clock=d.getTime()+(s.set-8)*6e4;live=false;speed=20}),bQ=btn('Play an hour a minute',()=>{live=false;speed=speed===60?0:60});
function paint(){bH.classList.toggle('on',mode==='hall');bD.classList.toggle('on',mode==='drive');bN.classList.toggle('on',live);bDu.classList.toggle('on',speed===20);bQ.classList.toggle('on',speed===60)}

function light(){if(mode==='drive'){sky.set(sk,cam);lights.hemi.color.set(sk.hemiSky);lights.hemi.groundColor.set(sk.hemiGround);lights.hemi.intensity=sk.hemiI*1.15;
    if(sk.sunI>0){lights.sun.color.set(sk.sunColor);lights.sun.intensity=sk.sunI*1.25;lights.sun.position.set(...sk.sunDir).multiplyScalar(50)}else{lights.sun.color.set(sk.moonColor);lights.sun.intensity=sk.moonI;lights.sun.position.set(...sk.moonDir).multiplyScalar(50)}
    lights.fill.intensity=.35*(1-st.night);S.fog.color.set(sk.fog);R.setClearColor(sk.fog)}
  else{const n=st.night;lights.hemi.color.setHex(saved.hemi[0]).lerp(new THREE.Color(0x2a3550),n);lights.hemi.groundColor.setHex(saved.hemi[1]).lerp(new THREE.Color(0x0e0b08),n);lights.hemi.intensity=saved.hemi[2]*(1-n)+.34*n;lights.sun.intensity=saved.sun[1]*(1-n)+.06*n;lights.fill.intensity=saved.fill*(1-n);R.setClearColor(new THREE.Color(saved.clear).lerp(new THREE.Color(0x07080c),n))}}
function tick(dt){if(!mode)return;pt+=dt;if(live)clock=Date.now();else clock+=dt*1000*speed;const date=new Date(clock);st=SE.state(date);sk=SE.sky(st);light();
  people.forEach(p=>p.update(dt));if(car)car.update(dt);extras.forEach(e=>e.update(dt));const env={people:people.map(p=>({x:p.x,z:p.z})),vehicles:car?[car.position,...extras.map(e=>e.position)]:[],date,st};man.update(dt,env);if(fire){if(pt>.5)fire.set(FIRE.rule(st));fire.update(dt)}
  if(pt>.5){pt=0;paint();const hm=d=>{const h=d.getHours(),m=d.getMinutes();return(h%12||12)+':'+String(m).padStart(2,'0')+(h<12?' am':' pm')};const cur=man.list.filter(c=>c.k==='sash');const drawn=cur.length&&cur[0].drawn>.5;
    card(mode==='hall'?'The entrance hall responds':'The drive: the carriage and pair',[hm(date)+(live?' (now)':'')+', '+st.label.toLowerCase(),
      mode==='hall'?'<b>Doors</b> open for whoever comes near and close behind them. <b>Curtains</b> are '+(drawn?'drawn for the night':'open')+'; they draw at dusk and open at dawn.':'<b>Comings and goings:</b> the carriage is '+car.state.phase+'; '+extras.map(e=>({rider:'the post rider',motorcar:'the motorcar',cart:'the farm cart'}[e.kind])+' '+e.state.phase).join('; ')+'. The gates open for each.',
      mode==='hall'?'<b>The clock</b> keeps the real time, hands sweeping, pendulum swinging; with sound on it chimes the quarters (Westminster) and strikes the hour.':'<b>Lamps</b> light at dusk, by the same house rule as the candles.',
      '<b>Call:</b> MANOR.respond(THREE, roomGroup).update(dt, {people, vehicles, date, st})'])}}
function dispose(){clear();floor.visible=true;S.fog=saved.fog;R.setClearColor(saved.clear);lights.hemi.color.setHex(saved.hemi[0]);lights.hemi.groundColor.setHex(saved.hemi[1]);lights.hemi.intensity=saved.hemi[2];lights.sun.color.setHex(saved.sun[0]);lights.sun.intensity=saved.sun[1];lights.sun.position.copy(saved.sun[2]);lights.fill.intensity=saved.fill}
loadLay(()=>hall());
window.__house={hall,drive,setTime:(h,m=0,sp=0)=>{const d=new Date();d.setHours(h,m,0,0);clock=d.getTime();live=false;speed=sp},get man(){return man},get car(){return car},get extras(){return extras}};
return{tick,mirror(){},dispose,sound:()=>({st:st||SE.state(new Date()),indoor:mode==='hall',clock:mode==='hall',fire:0,bell:mode==='drive'})}}
