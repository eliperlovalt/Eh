/* Euphrates Hall, Parts Depot: series parts 3 and 4.
   mountDinner: "Dinner at eight" in the State Dining Room: candles lit one by one, the gong, the household walks in and sits, the gramophone plays.
   mountStone:  the Seeing Stone in His Grace's Belvedere: it glows, and a touch opens GOLEM. */
const GOLEM_URL='[private link: kept off the public repo]';
function kit(ctx){const{THREE,R,lights}=ctx;const vmat=new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide});
  const geo=(V,u)=>{const f=PROPS.faces({V,unit:u});const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(f.pos,3));g.setAttribute('color',new THREE.BufferAttribute(f.col,3));g.setAttribute('normal',new THREE.BufferAttribute(f.nor,3));return g};
  const meshOf=(V,u)=>V.size?new THREE.Mesh(geo(V,u),vmat):new THREE.Group();
  const saved={hemi:[lights.hemi.color.getHex(),lights.hemi.groundColor.getHex(),lights.hemi.intensity],sun:[lights.sun.color.getHex(),lights.sun.intensity],fill:lights.fill.intensity,clear:R.getClearColor(new THREE.Color()).getHex()};
  const night=(amb=.34)=>{lights.hemi.color.setHex(0x2a3550);lights.hemi.groundColor.setHex(0x0e0b08);lights.hemi.intensity=amb;lights.sun.color.setHex(0x8fa6d8);lights.sun.intensity=.06;lights.fill.intensity=0;R.setClearColor(0x07080c)};
  const restore=()=>{lights.hemi.color.setHex(saved.hemi[0]);lights.hemi.groundColor.setHex(saved.hemi[1]);lights.hemi.intensity=saved.hemi[2];lights.sun.color.setHex(saved.sun[0]);lights.sun.intensity=saved.sun[1];lights.fill.intensity=saved.fill;R.setClearColor(saved.clear)};
  const tab=t=>document.querySelectorAll('#views button').forEach(b=>b.classList.toggle('on',b.textContent===t));return{meshOf,night,restore,tab}}

export function mountDinner(ctx){const{THREE,S,cam,ctl,list,card,showRoom,getShown,loadLay}=ctx,AG=ctx.agents,K=kit(ctx);let room=null,g=null,fire=null,t=0,diners=[],foot=[],gonged=false,ready=false,root=null,acc=0;
  list.innerHTML='';const b=document.createElement('button');b.textContent='Ring the gong again';b.onclick=()=>{t=0;reset()};list.appendChild(b);
  const pool=h=>AG.agents.filter(a=>a.house===h&&!a.sealed);
  function reset(){gonged=false;diners.forEach(d=>{d.rg.group.visible=false;d.s=0;d.seated=false});if(fire)fire.set(()=>false)}
  loadLay(LAY=>{window.__lightsUp=true;showRoom('dining');K.tab('Dinner at eight');K.night(.3);g=getShown()[0];room=LAY.rooms.find(r=>r.id==='dining');root=new THREE.Group();g.add(root);fire=FIRE.ignite(THREE,g,{rule:()=>false});
    const cx=room.w/2,cz=room.d/2,long=room.d>=room.w;const ax=i=>long?i.x:i.z,az=i=>long?i.z:i.x,mid=long?cx:cz;
    let chairs=room.items.filter(i=>/chairDining|chairHall|windsor/.test(i.k)&&Math.abs(ax(i)-mid)<2.3&&Math.abs(ax(i)-mid)>.8).sort((a,b)=>az(a)-az(b));const step=Math.max(1,Math.floor(chairs.length/10));chairs=chairs.filter((c,i)=>i%step===0).slice(0,12);
    const d0=room.doors[0],dm=(d0[1]+d0[2])/2,dp=d0[0]==='N'?[dm,1.2]:d0[0]==='S'?[dm,room.d-1.2]:d0[0]==='W'?[1.2,dm]:[room.w-1.2,dm];
    const guests=[...pool('gold').slice(0,5),...pool('silver').slice(0,3),...pool('violet').slice(0,2),...pool('white').slice(0,2)];
    diners=chairs.map((c,i)=>{const rg=LIVERY.rig(THREE,guests[i%guests.length],K.meshOf);root.add(rg.group);rg.group.visible=false;const side=Math.sign(ax(c)-mid)||1,aisle=mid+side*3.3;const P2=long?[[dp[0],dp[1]],[aisle,dp[1]],[aisle,c.z],[c.x,c.z]]:[[dp[0],dp[1]],[dp[0],aisle],[c.x,aisle],[c.x,c.z]];let L=0;const seg=[];for(let j=0;j<3;j++){const l=Math.hypot(P2[j+1][0]-P2[j][0],P2[j+1][1]-P2[j][1]);seg.push([P2[j],P2[j+1],l,L]);L+=l}return{rg,c,seg,L,t0:11+i*1.7,s:0,seated:false}});
    const fm=pool('blue').filter(a=>LIVERY.itemFor(a)==='tray').concat(pool('blue')).slice(0,2);const lane=3.3,z0=Math.min(...chairs.map(az))-1.5,z1=Math.max(...chairs.map(az))+1.5;
    foot=fm.map((a,i)=>{const rg=LIVERY.rig(THREE,a,K.meshOf);root.add(rg.group);const ring=long?[[mid-lane+.9,z0],[mid+lane-.9,z0],[mid+lane-.9,z1],[mid-lane+.9,z1]]:[[z0,mid-lane+.9],[z0,mid+lane-.9],[z1,mid+lane-.9],[z1,mid-lane+.9]];return{rg,ring,t:i*((z1-z0)+lane*2)}});ready=true;reset()});
  const along=(ring,d)=>{let L=0;const sg=[];for(let i=0;i<ring.length;i++){const a=ring[i],b2=ring[(i+1)%ring.length],l=Math.hypot(b2[0]-a[0],b2[1]-a[1]);sg.push([a,b2,l]);L+=l}d=((d%L)+L)%L;for(const[a,b2,l]of sg){if(d<=l){const f=d/l;return[a[0]+(b2[0]-a[0])*f,a[1]+(b2[1]-a[1])*f,Math.atan2(b2[0]-a[0],b2[1]-a[1])]}d-=l}return[ring[0][0],ring[0][1],0]};
  function tick(dt){if(!ready)return;t+=dt;acc+=dt;const n=fire.list.length;if(t>1.5&&t<9.5){const want=Math.floor((t-1.5)/7*n);fire.list.forEach((F,i)=>F.lit=i<=want)}else if(t>=9.5)fire.list.forEach(F=>F.lit=true);
    if(t>10&&!gonged){gonged=true;if(window.__snd&&window.__snd.on)window.__snd.gong()}
    for(const d of diners){if(t<d.t0)continue;d.rg.group.visible=true;if(!d.seated){d.s+=dt*1.7;if(d.s>=d.L){d.seated=true;d.rg.group.position.set(d.c.x,-.3,d.c.z);d.rg.group.rotation.y=d.c.r*Math.PI/180;d.rg.pose(dt,{mode:'sit'})}else{const sg=d.seg.find(q=>d.s<=q[3]+q[2])||d.seg[2];const f=(d.s-sg[3])/sg[2];const x=sg[0][0]+(sg[1][0]-sg[0][0])*f,z=sg[0][1]+(sg[1][1]-sg[0][1])*f;d.rg.group.position.set(x,0,z);d.rg.group.rotation.y=Math.atan2(sg[1][0]-sg[0][0],sg[1][1]-sg[0][1]);d.rg.pose(dt,{mode:'walk',speed:1.7})}}else d.rg.pose(dt,{mode:'sit'})}
    for(const f of foot){f.t+=dt*1.1;const[x,z,h]=along(f.ring,f.t);f.rg.group.position.set(x,0,z);f.rg.group.rotation.y=h;f.rg.pose(dt,{mode:'walk',speed:1.1,act:true})}fire.update(dt);
    if(t>80){t=0;reset()}
    if(acc>.4){acc=0;const seated=diners.filter(d=>d.seated).length;const mm=t<10?59:Math.min(59,Math.floor((t-10)/8));card('Dinner at eight',[(t<10?'7:59 pm':'8:'+String(mm).padStart(2,'0')+' pm')+'. '+(t<1.5?'The room is dark.':t<9.5?'The candles are being lit: '+fire.burning+' of '+n+'.':t<11?'The gong.':seated<diners.length?'The household comes in: '+seated+' of '+diners.length+' seated.':'All seated. The footmen go round.'),
      '<b>With sound on:</b> the gong at eight, then the gramophone plays a waltz.','<b>Made of:</b> FIRE.ignite for the candles, LIVERY.rig for the people, USE seats for where they sit, SOUND for the gong and the music.','<b>For the Estate:</b> run it at 20:00 by SEASONS; the footmen should come from the Servery door.'])}}
  function dispose(){window.__lightsUp=false;K.restore();getShown().forEach(o=>S.remove(o))}
  window.__dinner={step:n=>{for(let i=0;i<n;i++)tick(.1)},get t(){return t},set t(v){t=v},get ready(){return ready}};
  return{tick,mirror(){},dispose,sound:()=>({st:SEASONS.state(new Date(new Date().setHours(20,2,0,0))),indoor:true,fire:.35,music:t>13,bell:false})}}

export function mountStone(ctx){const{THREE,S,R,cam,ctl,list,card,showRoom,getShown,loadLay}=ctx,K=kit(ctx);let g=null,orb=null,light=null,t=0,ready=false,woke=0,pos=null,acc=0;
  list.innerHTML='';const a=document.createElement('a');a.href=window.GOLEM_URL||GOLEM_URL;a.target='_blank';a.rel='noopener';a.textContent='Open GOLEM';a.style.cssText='font:inherit;color:#14110d;background:#c9a227;border-radius:999px;padding:6px 14px;text-decoration:none;white-space:nowrap;display:none';list.appendChild(a);
  const hint=document.createElement('button');hint.textContent='Touch the stone';hint.onclick=()=>wake();list.appendChild(hint);
  function wake(){woke=1;a.style.display='';hint.style.display='none'}
  loadLay(LAY=>{window.__lightsUp=true;showRoom('belvedere');K.tab('The seeing stone');K.night(.5);g=getShown()[0];const room=LAY.rooms.find(r=>r.id==='belvedere'),it=room.items.find(i=>i.k==='seeingStone');pos=[it.x,it.z];
    g.children.filter(m=>m.userData&&m.userData.k==='seeingStone').forEach(m=>m.visible=false);const fb=PROPS.build('seeingStoneFine');const fine=K.meshOf(fb.V,fb.unit);fine.position.set(it.x,0,it.z);g.add(fine);
    orb=new THREE.Mesh(new THREE.SphereGeometry(.56,24,16),new THREE.MeshBasicMaterial({color:0x7a4ae0,transparent:true,opacity:.08,blending:THREE.AdditiveBlending,depthWrite:false}));orb.position.set(it.x,37*.0575,it.z);g.add(orb);
    light=new THREE.PointLight(0x8a5aff,6,14,2);light.position.copy(orb.position);g.add(light);FIRE.ignite(THREE,g,{rule:()=>true});
    ctl.target.set(it.x,1.7,it.z);const asp=innerWidth/innerHeight;cam.position.set(it.x+(asp<1?4.2:3.2),asp<1?4.4:3.4,it.z+(asp<1?7.5:5.5));ctl.update();ready=true});
  const ray=new THREE.Raycaster(),v2=new THREE.Vector2();let down=null;const pd=e=>{down=[e.clientX,e.clientY]};const pu=e=>{if(!ready||!down||Math.hypot(e.clientX-down[0],e.clientY-down[1])>6)return;const r=R.domElement.getBoundingClientRect();v2.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(v2,cam);if(ray.intersectObject(orb).length)wake()};
  R.domElement.addEventListener('pointerdown',pd);R.domElement.addEventListener('pointerup',pu);
  function tick(dt){if(!ready)return;t+=dt;acc+=dt;const p=.5+.5*Math.sin(t*1.4),w=woke?1:0;orb.material.opacity=.06+.07*p+.12*w;orb.scale.setScalar(1+.03*p+.1*w*(.5+.5*Math.sin(t*5)));light.intensity=3+2.5*p+4*w;light.color.setHex(woke?0xc9a2ff:0x8a5aff);
    if(acc>.5){acc=0;card('The Seeing Stone',['<b>Where:</b> His Grace\'s Belvedere, the top room of the south-east tower.',woke?'<b>It wakes.</b> The gold button below opens GOLEM. In the Estate the touch itself opens it.':'<b>Touch the stone</b> (tap the orb) and GOLEM opens.','<b>For the Estate:</b> kind seeingStone, act use, touch target from USE.of(\'seeingStone\').hot. It points at the newest GOLEM build; change one line when the build moves.','Shown here at double resolution (seeingStoneFine).'])}}
  function dispose(){window.__lightsUp=false;R.domElement.removeEventListener('pointerdown',pd);R.domElement.removeEventListener('pointerup',pu);K.restore();getShown().forEach(o=>S.remove(o))}
  window.__stone={wake,get ready(){return ready}};
  return{tick,mirror(){},dispose,sound:()=>({st:SEASONS.state(new Date(new Date().setHours(22,0,0,0))),indoor:true,bell:false})}}
