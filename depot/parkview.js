/* Euphrates Hall, Parts Depot: the "Park and stables" view.
   ANIMALS + LIVERY + SEASONS + WATER together: the paddock, the deer park, the flock, the kitchen yard,
   the swan pond, peacocks on the lawn, and the Hound riding out with the pack at heel. Tap the grass to startle the herds. */
export function mountPark(ctx){
const{THREE,S,R,cam,ctl,lights,list,card,floor}=ctx;const W=WATER,SE=SEASONS,P=PROPS,LV=LIVERY,AN=ANIMALS,AG=ctx.agents;
const root=new THREE.Group();S.add(root);const LAWN=.15;
const vmat=new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide});
const meshOf=(V,unit)=>{if(!V.size)return new THREE.Group();const f=P.faces({V,unit});const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(f.pos,3));g.setAttribute('color',new THREE.BufferAttribute(f.col,3));g.setAttribute('normal',new THREE.BufferAttribute(f.nor,3));return new THREE.Mesh(g,vmat)};
const holder=(x,y,z,r)=>{const g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=(r||0)*Math.PI/180;root.add(g);return g};
const swap=(g,ms)=>{while(g.children.length){const c=g.children.pop();c.geometry&&c.geometry.dispose()}ms.forEach(m=>m&&g.add(m))};
const fixed=(k,x,z,r,o)=>{const b=P.build(k,o||{});const h=holder(x,LAWN,z,r);h.add(meshOf(b.V,b.unit));return h};

/* the pond */
const pond=W.Lake(THREE,{cx:12,cz:-9,rx:8,rz:5.5,depth:1.6,level:0});root.add(pond.mesh);const splash=W.Splash(THREE);root.add(splash.points);
const sky=SE.Sky(THREE,{radius:190});S.add(sky);const weather=SE.Weather(THREE,{area:[-32,-24,32,24]});root.add(weather);

/* fences, props */
const fenceRun=(x0,z0,len,rot)=>{const f=AN.fence(len);const h=holder(x0,LAWN,z0,rot);h.add(meshOf(f.V,f.unit))};
fenceRun(-30,-22,22,0);fenceRun(-30,-6,22,0);fenceRun(-30,-6,16,90);fenceRun(-8,-6,6,90);fenceRun(-8,-16,5,90);
fixed('haystack',29,-20,0);fixed('wheelbarrow',24.5,-13.5,40);fixed('well',27,-15,0);fixed('waterTrough',-12,-18,90);fixed('bench',8,-2.2,0);fixed('saddleRack',-9.5,-4.8,0);
fixed('statue',0,-4,0);fixed('urn',-3,-4);fixed('urn',3,-4);

/* trees, dressed for the season */
const TREES=[['treeOak',-29,3,4],['treeOak',-14,15,7],['treeOak',-27,19,2],['treeCedar',-18,4,5],['treeBeech',21,-16,3],['treeBirch',4,-12,6],['treeBirch',3,-7,8],['treePoplar',-2,-21,1],['treePoplar',2,-21,3],['treeApple',30,-9,2],['treeApple',27,-6,6],['treeOak',29,22,9],['treeYew',-6,-1,2]]
  .map(([k,x,z,s])=>({k,x,z,s,b:P.build(k,{seed:s}),h:holder(x,LAWN,z,0)}));let terrain=null,lastKey='',lastTer='';

/* animals */
const herds={deer:{x:-18,z:12},sheep:{x:16,z:14}};const all=[];
const add=(kind,o,brain)=>{const b=AN.build(kind,o);const r=AN.Rig(THREE,b,meshOf);root.add(r.group);const br=AN.Brain(Object.assign({speeds:b.speeds},brain));const it={kind,o,r,br,b};all.push(it);return it};
for(const[c,x,z]of[['bay',-24,-14],['chestnut',-16,-10],['black',-12,-18]])add('horse',{coat:c},{x,z,area:[-29,-21,-9,-7],calm:.75});
add('deer',{buck:true},{x:-18,z:12,area:[-30,1,-5,23],herd:herds.deer,lead:true,spread:5});for(let i=0;i<6;i++)add('deer',{},{x:-20+i*1.5,z:10+i,area:[-30,1,-5,23],herd:herds.deer,spread:5});
add('sheep',{},{x:16,z:14,area:[1,5,31,23],herd:herds.sheep,lead:true,spread:4,calm:.8});for(let i=0;i<9;i++)add('sheep',{},{x:12+i,z:12+(i%3)*2,area:[1,5,31,23],herd:herds.sheep,spread:4,calm:.8});
for(let i=0;i<7;i++)add('hen',{coat:i%3?'brown':'white'},{x:24+i*.6,z:-18+i*.4,area:[22,-22,31,-11],calm:.9,speeds:{walk:.5,trot:1.2,gallop:2}});
const swans=[0,1].map(i=>add('swan',{},{x:10+i*2,z:-9,area:[3,-15,21,-3],blocked:(x,z)=>pond.depthAt(x,z)<.6,calm:.3,speeds:{walk:.35,trot:.6,gallop:.9}}));
const cat=add('cat',{},{x:8.6,z:-2.2,area:[7,-3,10,-1]});cat.fixedMode='sit';cat.br.step=()=>cat.br;cat.br.heading=Math.PI;
const pea1=add('peacock',{display:true},{x:2,z:3,area:[1,2,3,4]});pea1.fixedMode='display';pea1.br.step=()=>pea1.br;pea1.br.heading=Math.PI*.15;
add('peacock',{},{x:-2,z:4,area:[-5,0,7,8],calm:.5,speeds:{walk:.6,trot:1.4,gallop:2.2}});
/* the Hound rides out on the grey, the pack at heel */
const hunt=AG.agents.find(a=>a.id==='grey.firewall-counter-intel')||AG.agents.find(a=>a.house==='grey'&&!a.sealed);
const mount=add('horse',{coat:'grey',saddle:true},{x:-4,z:-1,area:[-40,-40,40,40]});const rider=LV.rig(THREE,hunt,meshOf);mount.r.body.add(rider.group);rider.group.position.set(0,15.5*.115,-.05);
const ride=[[-4,-1],[6,0],[9,5],[2,8],[-6,6],[-8,1]];let rideT=0;mount.br.step=dt=>{rideT+=dt*1.35;const p=along(ride,rideT),q=along(ride,rideT+.5);const b=mount.br;b.speed=1.35;b.x=p[0];b.z=p[1];b.heading=Math.atan2(q[0]-p[0],q[1]-p[1]);b.mode='walk';return b};
for(let i=0;i<3;i++){const h=add('hound',{},{x:-6-i,z:-1,area:[-40,-40,40,40],follow:()=>[mount.br.x-Math.sin(mount.br.heading)*(2.6+i*.9)+(i-1)*.9,mount.br.z-Math.cos(mount.br.heading)*(2.6+i*.9)],keep:.6,speeds:{walk:1.5,trot:3.5,gallop:7.5}})}
function along(path,t){let L=0;const seg=[];for(let i=0;i<path.length;i++){const a=path[i],b=path[(i+1)%path.length],l=Math.hypot(b[0]-a[0],b[1]-a[1]);seg.push([a,b,l]);L+=l}let d=((t%L)+L)%L;for(const[a,b,l]of seg){if(d<=l){const f=d/l;return[a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f]}d-=l}return path[0]}

/* time: midday today by default (so the animals are in daylight); Now for the real clock */
let clock=(()=>{const d=new Date();d.setHours(13,0,0,0);return d.getTime()})(),live=false,st,sk,pt=0;
list.innerHTML='';const btn=(t,f)=>{const b=document.createElement('button');b.textContent=t;b.onclick=()=>{f();paint()};list.appendChild(b);return b};
const PRE={Spring:[3,28],Summer:[6,15],Autumn:[9,24],Winter:[0,20]};const bMid=btn('Midday',()=>{const d=new Date();d.setHours(13,0,0,0);clock=d.getTime();live=false}),bNow=btn('Now',()=>{live=true});const bs={};
for(const k in PRE)bs[k]=btn(k,()=>{const d=new Date();const y=PRE[k][0]<2&&d.getMonth()>2?d.getFullYear()+1:d.getFullYear();clock=new Date(y,PRE[k][0],PRE[k][1],13).getTime();live=false});
btn('Startle the herds',()=>startle(-16,12));
function paint(){const d=new Date(clock);bNow.classList.toggle('on',live);bMid.classList.toggle('on',!live&&d.getHours()===13&&d.toDateString()===new Date().toDateString());for(const k in PRE)bs[k].classList.toggle('on',!live&&d.getMonth()===PRE[k][0]&&d.getDate()===PRE[k][1])}paint();
function startle(x,z){for(const a of all){if(!['deer','sheep','horse','hen'].includes(a.kind))continue;const d=Math.hypot(a.br.x-x,a.br.z-z);if(d<14)a.br.startle(x,z)}}

/* tap: the pond ripples, the grass startles */
const ray=new THREE.Raycaster(),v2=new THREE.Vector2();let down=null;const pd=e=>{down=[e.clientX,e.clientY]};
const pu=e=>{if(!down||Math.hypot(e.clientX-down[0],e.clientY-down[1])>6)return;const r=R.domElement.getBoundingClientRect();v2.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(v2,cam);
  const w=ray.intersectObject(pond.mesh)[0];if(w){pond.disturb(w.point.x,w.point.z,.08,.35);splash.burst(w.point.x,0,w.point.z,14,.9,1.6);return}if(terrain){const g=ray.intersectObject(terrain)[0];if(g)startle(g.point.x,g.point.z)}};
R.domElement.addEventListener('pointerdown',pd);R.domElement.addEventListener('pointerup',pu);

const saved={fog:S.fog,hemi:[lights.hemi.color.getHex(),lights.hemi.groundColor.getHex(),lights.hemi.intensity],sun:[lights.sun.color.getHex(),lights.sun.intensity,lights.sun.position.clone()],fill:lights.fill.intensity,clear:R.getClearColor(new THREE.Color()).getHex()};
floor.visible=false;S.fog=new THREE.Fog(0x9fb3c8,45,170);const asp=innerWidth/innerHeight;ctl.target.set(0,0,0);cam.position.set(4,asp<1?34:20,asp<1?48:36);ctl.update();

function rebuild(){const q=(v,n)=>Math.round(v*n)/n;const key=[st.season,q(st.leaf,20),q(st.turn,20),q(st.blossom,10),q(st.snow,10),q(st.fresh,5)].join();
  if(key!==lastKey){lastKey=key;for(const t of TREES){const r=SE.restyle(t.b.V,st,{evergreen:SE.EVERGREEN.includes(t.k),blossom:SE.BLOSSOM.includes(t.k),beech:SE.BEECH.includes(t.k),unit:t.b.unit,seed:t.s});swap(t.h,[meshOf(r.V,t.b.unit)])}
    const winter=st.season==='winter';for(const a of all)if(a.kind==='deer'&&!!a.o.winter!==winter){a.o.winter=winter;const nb=AN.build('deer',a.o);const nr=AN.Rig(THREE,nb,meshOf);root.remove(a.r.group);root.add(nr.group);a.r=nr}}
  const tk=[st.grass,q(st.litter,10),q(st.snow,10)].join();if(tk!==lastTer){lastTer=tk;if(terrain){root.remove(terrain);terrain.geometry.dispose()}
    terrain=W.Terrain(THREE,{x0:-34,z0:-26,x1:34,z1:26,cell:.5,lakes:[pond],grass:st.grass,litter:st.litter,snow:st.snow,top:LAWN,paths:[[-8,-6.5,2,1,'#b4a68a'],[21,-23,11,13,'#9a8a68'],[-4.5,-5,9,2.2,'#bdb09a']]});root.add(terrain)}}

function tick(dt){pt+=dt;if(pt>.5){pt=0;paint()}if(live)clock=Date.now();st=SE.state(new Date(clock));st.wind=[.5,.2];sk=SE.sky(st);
  sky.set(sk,cam);lights.hemi.color.set(sk.hemiSky);lights.hemi.groundColor.set(sk.hemiGround);lights.hemi.intensity=sk.hemiI*1.15;
  if(sk.sunI>0){lights.sun.color.set(sk.sunColor);lights.sun.intensity=sk.sunI*1.25;lights.sun.position.set(...sk.sunDir).multiplyScalar(50)}else{lights.sun.color.set(sk.moonColor);lights.sun.intensity=sk.moonI;lights.sun.position.set(...sk.moonDir).multiplyScalar(50)}
  lights.fill.intensity=.35*(1-st.night);S.fog.color.set(sk.fog);S.fog.near=45-sk.overcast*25;S.fog.far=170-sk.overcast*70;R.setClearColor(sk.fog);pond.look(sk,{ice:st.ice});rebuild();
  for(const a of all){const b=a.br.step(dt);if(a.kind==='swan'){const fr=pond.frozen;a.r.group.visible=!fr;if(fr)continue;a.r.group.position.set(b.x,pond.level+pond.heightAt(b.x,b.z)-.02,b.z);a.r.group.rotation.y=b.heading;a.r.pose(dt,{speed:b.speed,mode:b.mode==='graze'?'feed':'glide'});
      a._t=(a._t||0)+dt;if(a._t>.3&&b.speed>.05){a._t=0;pond.disturb(b.x-Math.sin(b.heading)*.5,b.z-Math.cos(b.heading)*.5,.012,.22)}continue}
    const mode=a.fixedMode||(b.speed>.08?'walk':a.kind==='hen'?(b.mode==='graze'?'peck':'idle'):b.mode==='graze'?'graze':b.mode==='sniff'?'graze':'idle');a.r.group.position.set(b.x,LAWN,b.z);a.r.group.rotation.y=b.heading;a.r.pose(dt,{speed:b.speed,mode})}
  rider.pose(dt,{mode:'ride',speed:mount.br.speed});
  weather.set(st);weather.update(dt,{ground:()=>LAWN,water:pond,drop:(x,z,a)=>pond.disturb(x,z,a,.13)});pond.step(dt);splash.update(dt,[pond]);
  const n=k=>all.filter(a=>a.kind===k).length;const d=new Date(clock);
  card('The park: '+st.label.toLowerCase(),[d.toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'})+(live?' (now)':', 1 pm'),
    '<b>Out today:</b> '+n('horse')+' horses, '+n('deer')+' fallow deer, '+n('sheep')+' sheep, '+n('hound')+' hounds, '+n('hen')+' hens, 2 swans, 2 peacocks, the stable cat',
    '<b>The Hound</b> rides the grey on his round; the pack keeps at heel.','<b>Tap the grass</b> to startle the herds, or the pond to ripple it.'])}
function mirror(){pond.mirror(R,S,cam)}
function dispose(){R.domElement.removeEventListener('pointerdown',pd);R.domElement.removeEventListener('pointerup',pu);S.remove(root);S.remove(sky);pond.dispose();floor.visible=true;S.fog=saved.fog;R.setClearColor(saved.clear);
  lights.hemi.color.setHex(saved.hemi[0]);lights.hemi.groundColor.setHex(saved.hemi[1]);lights.hemi.intensity=saved.hemi[2];lights.sun.color.setHex(saved.sun[0]);lights.sun.intensity=saved.sun[1];lights.sun.position.copy(saved.sun[2]);lights.fill.intensity=saved.fill}
window.__park={startle,all,setDay:(m,d,h=13)=>{const y=new Date().getFullYear()+(m<2?1:0);clock=new Date(y,m,d,h).getTime();live=false}};
return{tick,mirror,dispose,sound:()=>({st,water:.6})}}
