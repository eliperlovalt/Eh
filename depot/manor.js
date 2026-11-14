/* Euphrates Hall, Parts Depot: MANOR v1 (the house responds). Series part 1 of 4.
   One call makes a built scene come alive: double doors swing open as people come near and close behind them,
   iron gates open for the carriage, curtains draw at dusk and open at dawn, and long-case clocks keep the real time
   with sweeping hands and a swinging pendulum. MANOR.Carriage brings a carriage and pair up the drive.
   Plain script; three.js is passed in. Works on meshes tagged userData.k (prop kind) and userData.o (options).

   MANOR.respond(THREE,root,o)   -> {update(dt,{people:[{x,z}], date, st}), list}
        o.near (blocks, default 2.2) how close someone must be for a door to open; o.gateNear (default 7)
   MANOR.Carriage(THREE,o)       -> {group, update(dt), state, position}
        o = {path:[[x,z],...], stops:[{at:index, wait:s, door:true}], speed (blocks/s, 2.6), coachman (agent), coats:['bay','black'], loop:true}
   MANOR.leaf(THREE,V,unit,hinge) -> a door leaf on its hinge (for anything with a 'door' part) */
const MANOR=(()=>{
const geoOf=(THREE,V,u)=>{const f=PROPS.faces({V,unit:u});const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(f.pos,3));g.setAttribute('color',new THREE.BufferAttribute(f.col,3));g.setAttribute('normal',new THREE.BufferAttribute(f.nor,3));return g};
const cache=new Map();const built=(k,o)=>{const key=k+JSON.stringify(o||{});if(!cache.has(key))cache.set(key,PROPS.build(k,o||{}));return cache.get(key)};
function parts(V,test){const a=new Map(),b=new Map();for(const[k,v]of V)(test(v)?b:a).set(k,v);return[a,b]}
function leaf(THREE,V,u,hinge,mat){const g=new THREE.Group();g.position.set(hinge[0]*u,0,hinge[2]*u);const m=new THREE.Mesh(geoOf(THREE,V,u),mat);m.position.set(-hinge[0]*u,0,-hinge[2]*u);g.add(m);return g}
const ease=(cur,want,dt,rate)=>cur+(want-cur)*Math.min(1,dt*rate);
const wpos=(THREE,m)=>{const v=new THREE.Vector3();m.getWorldPosition(v);return v};

function respond(THREE,root,o={}){const near=o.near||2.2,gateNear=o.gateNear||7,list=[];const meshes=[];root.traverse(m=>{if(m.isMesh&&m.userData&&['doorDouble','sash','clockLong','ironGate'].includes(m.userData.k))meshes.push(m)});
  for(const m of meshes){const k=m.userData.k,b=built(k,m.userData.o),u=b.unit,mat=m.material;
    if(k==='doorDouble'){const[base,door]=parts(b.V,v=>v[4]==='door');const[L,Rr]=parts(door,v=>v[0]>=0);m.geometry=geoOf(THREE,base,u);
      const l=leaf(THREE,L,u,[-13.5,0,0],mat),r=leaf(THREE,Rr,u,[13.5,0,0],mat);m.add(l,r);list.push({k,m,open:0,hold:0,update(dt,env){const p=wpos(THREE,m);const by=(env.people||[]).some(q=>Math.hypot(q.x-p.x,q.z-p.z)<near);
        this.hold=by?1.6:this.hold-dt;this.open=ease(this.open,this.hold>0?1:0,dt,this.hold>0?3.2:1.8);l.rotation.y=-1.42*this.open;r.rotation.y=1.42*this.open}})}
    else if(k==='ironGate'){const r0=m.rotation.y,sg=m.userData.gateSign||(m.userData.o&&m.userData.o.flip?1:-1);list.push({k,m,open:0,update(dt,env){const p=wpos(THREE,m);const by=(env.vehicles||[]).concat(env.people||[]).some(q=>Math.hypot(q.x-p.x,q.z-p.z)<(q.vehicle?gateNear:near+.6));
        this.open=ease(this.open,by?1:0,dt,by?1.2:.6);m.rotation.y=r0+sg*1.35*this.open}})}
    else if(k==='sash'){const[base,cur]=parts(b.V,v=>v[4]==='door');const[L,Rr]=parts(cur,v=>v[0]>=0);m.geometry=geoOf(THREE,base,u);
      const l=leaf(THREE,L,u,[-12.5,0,0],mat),r=leaf(THREE,Rr,u,[12.5,0,0],mat);m.add(l,r);list.push({k,m,drawn:0,update(dt,env){const want=env.st?(env.st.night>.45?1:0):0;this.drawn=ease(this.drawn,want,dt,.9);const s=1+this.drawn*2.15;l.scale.x=s;r.scale.x=s}})}
    else if(k==='clockLong'){const hands=new THREE.Group();hands.position.set(0,29.5*u,5.7*u);m.add(hands);const black=new THREE.MeshBasicMaterial({color:0x14110d});const brass=new THREE.MeshLambertMaterial({color:0xc8a03a});
      const hand=(len,w)=>{const g=new THREE.Group();const b2=new THREE.Mesh(new THREE.BoxGeometry(w,len,.012),black);b2.position.y=len/2-.03;g.add(b2);hands.add(g);return g};const H=hand(.24,.035),M=hand(.36,.025),S=hand(.36,.008);S.children[0].material=new THREE.MeshBasicMaterial({color:0x8a1a1a});S.position.z=.006;
      const pend=new THREE.Group();pend.position.set(0,22*u,3.6*u);m.add(pend);const rod=new THREE.Mesh(new THREE.BoxGeometry(.02,1.05,.02),brass);rod.position.y=-.52;const bob=new THREE.Mesh(new THREE.CylinderGeometry(.14,.14,.03,16),brass);bob.rotation.x=Math.PI/2;bob.position.y=-1.08;pend.add(rod,bob);
      list.push({k,m,t:0,update(dt,env){this.t+=dt;const d=env.date||new Date();const s=d.getSeconds()+d.getMilliseconds()/1000,mi=d.getMinutes()+s/60,h=(d.getHours()%12)+mi/60;
        S.rotation.z=-Math.floor(s)/60*Math.PI*2;M.rotation.z=-mi/60*Math.PI*2;H.rotation.z=-h/12*Math.PI*2;pend.rotation.z=Math.sin(this.t*Math.PI)*.14}})}}
  return{update:(dt,env={})=>list.forEach(c=>c.update(dt,env)),list}}

/* a carriage and pair on a path: trots, slows, stops at the door (the carriage door swings open), then drives on */
function Carriage(THREE,o){const u=.115,group=new THREE.Group(),body=new THREE.Group();group.add(body);const mat=new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide});
  const b=built('carriage',{});const[base,door]=parts(b.V,v=>v[4]==='door');body.add(new THREE.Mesh(geoOf(THREE,base,u),mat));const dl=leaf(THREE,door,u,[-8,0,2.5],mat);body.add(dl);
  const meshOf=(V,uu)=>V.size?new THREE.Mesh(geoOf(THREE,V,uu),mat):new THREE.Group();const horses=(o.coats||['bay','black']).map((c,i)=>{const r=ANIMALS.Rig(THREE,ANIMALS.build('horse',{coat:c}),meshOf);r.group.position.set(i?.68:-.68,0,4.7);body.add(r.group);return r});
  const pole=new THREE.Mesh(new THREE.BoxGeometry(.08,.08,2.6),new THREE.MeshLambertMaterial({color:0x3a2416}));pole.position.set(0,1.3,3.4);body.add(pole);
  let man=null;if(o.coachman&&typeof LIVERY!=='undefined'){man=LIVERY.rig(THREE,o.coachman,meshOf);man.group.position.set(0,28*u-9*u+.04,17*u);body.add(man.group)}
  const P=o.path,seg=[];let L=0;for(let i=0;i<P.length-1;i++){const l=Math.hypot(P[i+1][0]-P[i][0],P[i+1][1]-P[i][1]);seg.push({a:P[i],b:P[i+1],l,s0:L});L+=l}
  const at=s=>{s=Math.max(0,Math.min(L,s));for(const q of seg)if(s<=q.s0+q.l){const f=(s-q.s0)/q.l;return[q.a[0]+(q.b[0]-q.a[0])*f,q.a[1]+(q.b[1]-q.a[1])*f]}return P[P.length-1]};
  const stops=(o.stops||[]).map(st=>({s:seg[Math.min(st.at,seg.length)-1]?seg[Math.min(st.at,seg.length)-1].s0+seg[Math.min(st.at,seg.length)-1].l:0,wait:st.wait||12,door:st.door!==false,done:false}));
  const state={s:o.start||0,v:0,wait:0,doorOpen:0,phase:'driving'};const top=o.speed||2.6;let T=0,hidden=!!o.delay,next=o.delay||0;group.visible=!hidden;
  function update(dt){T+=dt;if(hidden){if(T<next)return;hidden=false;group.visible=true;state.s=0;state.v=0;stops.forEach(x=>x.done=false)}const next=stops.find(x=>!x.done&&x.s>state.s-.01);let want=top;if(state.wait>0){state.wait-=dt;want=0;state.phase='at the door';if(state.wait<=0&&next)next.done=true}
    else if(next){const d=next.s-state.s;want=Math.min(top,Math.max(0,Math.sqrt(2*1.1*Math.max(0,d))));if(d<.05&&state.v<.15){state.s=next.s;state.v=0;state.wait=next.wait;want=0}}
    state.v=ease(state.v,want,dt,1.4);state.s+=state.v*dt;if(state.s>=L-.01){if(o.period){hidden=true;group.visible=false;state.phase='away';next=Math.ceil((T-(o.delay||0)+.01)/o.period)*o.period+(o.delay||0);return}if(o.loop!==false){state.s=0;stops.forEach(x=>x.done=false)}else state.v=0}
    const[x,z]=at(state.s),[x2,z2]=at(state.s+1.2);group.position.set(x,o.y||0,z);if(Math.hypot(x2-x,z2-z)>.01){const hd=Math.atan2(x2-x,z2-z);let dh=hd-group.rotation.y;while(dh>Math.PI)dh-=6.283;while(dh<-Math.PI)dh+=6.283;group.rotation.y+=dh*Math.min(1,dt*3)}
    if(state.v>.1)state.phase='driving';const dOpen=state.wait>1.2&&next&&next.door?1:0;state.doorOpen=ease(state.doorOpen,dOpen,dt,2);dl.rotation.y=1.25*state.doorOpen;
    body.position.y=state.v>.3?Math.abs(Math.sin(performance.now()/90))*.015:0;horses.forEach(h=>h.pose(dt,{speed:state.v*(1+(Math.random()*.02)),mode:state.v>.05?'walk':'idle'}));if(man)man.pose(dt,{mode:'sit'})}
  return{group,update,state,get position(){return hidden?{x:1e6,z:1e6,vehicle:true}:{x:group.position.x,z:group.position.z,vehicle:true}}}}

/* comings and goings (series part 2): a motorcar, a post rider or a farm cart on a path, on a timetable.
   o = {kind:'motorcar'|'rider'|'cart', path, stops:[{at,wait}], speed, delay (s before the first run), period (s between runs), agent, coat} */
function Traffic(THREE,o){const u=.115,group=new THREE.Group(),body=new THREE.Group();group.add(body);const mat=new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide});const meshOf=(V,uu)=>V.size?new THREE.Mesh(geoOf(THREE,V,uu),mat):new THREE.Group();
  let horse=null,man=null;const agent=o.agent&&typeof LIVERY!=='undefined'?o.agent:null;
  if(o.kind==='motorcar'){body.add(meshOf(built('motorcar',o.o||{}).V,u));if(agent){man=LIVERY.rig(THREE,agent,meshOf);man.group.position.set(-.3,-.12,-.3);body.add(man.group)}}
  else if(o.kind==='rider'){horse=ANIMALS.Rig(THREE,ANIMALS.build('horse',{coat:o.coat||'chestnut',saddle:true}),meshOf);body.add(horse.group);if(agent){man=LIVERY.rig(THREE,agent,meshOf);man.group.position.set(0,15.5*u,-.05);horse.body.add(man.group)}}
  else{body.add(meshOf(built('cart',{}).V,u));horse=ANIMALS.Rig(THREE,ANIMALS.build('horse',{coat:o.coat||'bay'}),meshOf);horse.group.position.set(0,0,3.6);body.add(horse.group)}
  const P=o.path,seg=[];let L=0;for(let i=0;i<P.length-1;i++){const l=Math.hypot(P[i+1][0]-P[i][0],P[i+1][1]-P[i][1]);seg.push({a:P[i],b:P[i+1],l,s0:L});L+=l}
  const at=s=>{s=Math.max(0,Math.min(L,s));for(const q of seg)if(s<=q.s0+q.l){const f=(s-q.s0)/q.l;return[q.a[0]+(q.b[0]-q.a[0])*f,q.a[1]+(q.b[1]-q.a[1])*f]}return P[P.length-1]};
  const stops=(o.stops||[]).map(st=>({s:seg[st.at-1].s0+seg[st.at-1].l,wait:st.wait||6,done:false}));const state={s:0,v:0,wait:0,phase:'away'};const top=o.speed||3;let T=0,hidden=true,next=o.delay||0;group.visible=false;
  function update(dt){T+=dt;if(hidden){if(T<next)return;hidden=false;group.visible=true;state.s=0;state.v=0;stops.forEach(x=>x.done=false);const[x,z]=at(0),[x2,z2]=at(1);group.rotation.y=Math.atan2(x2-x,z2-z)}
    const nx=stops.find(x=>!x.done&&x.s>state.s-.01);let want=top;if(state.wait>0){state.wait-=dt;want=0;state.phase='at the door';if(state.wait<=0&&nx)nx.done=true}else if(nx){const d=nx.s-state.s;want=Math.min(top,Math.sqrt(2*1.4*Math.max(0,d)));if(d<.05&&state.v<.2){state.s=nx.s;state.v=0;state.wait=nx.wait;want=0}}
    state.v=ease(state.v,want,dt,1.6);state.s+=state.v*dt;if(state.v>.1)state.phase='on the drive';
    if(state.s>=L-.01){hidden=true;group.visible=false;state.phase='away';next=o.period?Math.ceil((T-(o.delay||0)+.01)/o.period)*o.period+(o.delay||0):T+(o.gap||20);return}
    const[x,z]=at(state.s),[x2,z2]=at(state.s+1.2);group.position.set(x,o.y||0,z);if(Math.hypot(x2-x,z2-z)>.01){const hd=Math.atan2(x2-x,z2-z);let dh=hd-group.rotation.y;while(dh>Math.PI)dh-=6.283;while(dh<-Math.PI)dh+=6.283;group.rotation.y+=dh*Math.min(1,dt*3.5)}
    if(horse)horse.pose(dt,{speed:state.v,mode:state.v>.05?'walk':'idle'});if(man)man.pose(dt,{mode:o.kind==='rider'?'ride':'sit',speed:state.v});if(o.kind==='motorcar')body.position.y=state.v>.2?Math.sin(T*31)*.006:0}
  return{group,update,state,kind:o.kind,get position(){return hidden?{x:1e6,z:1e6,vehicle:true}:{x:group.position.x,z:group.position.z,vehicle:true}}}}

return{respond,Carriage,Traffic,leaf}})();
if(typeof module!=='undefined')module.exports=MANOR;
