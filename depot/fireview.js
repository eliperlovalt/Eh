/* Euphrates Hall, Parts Depot: the "Fire and light" view.
   Any furnished room after dark with FIRE.ignite: hearths at seven, candles at dusk, every flame alive. Tap a flame to snuff or light it. */
export function mountFire(ctx){
const{THREE,S,R,cam,ctl,lights,list,card,showRoom,getShown,loadLay}=ctx;let ign=null,mode='evening',room='saloon',acc=0,t=0;
const saved={hemi:[lights.hemi.color.getHex(),lights.hemi.groundColor.getHex(),lights.hemi.intensity],sun:[lights.sun.color.getHex(),lights.sun.intensity],fill:lights.fill.intensity,clear:R.getClearColor(new THREE.Color()).getHex()};
const night=()=>{lights.hemi.color.setHex(0x2a3550);lights.hemi.groundColor.setHex(0x0e0b08);lights.hemi.intensity=.34;lights.sun.color.setHex(0x8fa6d8);lights.sun.intensity=.06;lights.fill.intensity=0;R.setClearColor(0x07080c)};
const rule=()=>mode==='evening'?(()=>true):mode==='out'?(()=>false):FIRE.rule(SEASONS.state(new Date()));
list.innerHTML='';const sel=document.createElement('select');sel.style.cssText='font:inherit;color:var(--ink);background:var(--card);border:1px solid #3a3026;border-radius:999px;padding:6px 10px;max-width:60vw';list.appendChild(sel);
const btn=(t,f)=>{const b=document.createElement('button');b.textContent=t;b.onclick=()=>{f();paint()};list.appendChild(b);return b};
const bE=btn('Eight in the evening',()=>{mode='evening';ign&&ign.set(rule())}),bN=btn('By the clock',()=>{mode='now';ign&&ign.set(rule())}),bO=btn('Snuff them all',()=>{mode='out';ign&&ign.set(rule())});
function paint(){bE.classList.toggle('on',mode==='evening');bN.classList.toggle('on',mode==='now');bO.classList.toggle('on',mode==='out')}paint();
function go(id){room=id;sel.value=id;window.__lightsUp=true;showRoom(id);document.querySelectorAll('#views button').forEach(b=>b.classList.toggle('on',b.textContent==='Fire and light'));const g=getShown()[0];ign=FIRE.ignite(THREE,g,{rule:rule()});night()}
loadLay(LAY=>{const fl=new Set([...FIRE.HEARTH,...FIRE.CANDLE]);const rooms=LAY.rooms.filter(r=>r.items.filter(i=>fl.has(i.k)).length>=3).sort((a,b)=>a.name.localeCompare(b.name));
  for(const r of rooms){const o=document.createElement('option');o.value=r.id;o.textContent=r.name;sel.appendChild(o)}sel.onchange=()=>go(sel.value);go(rooms.find(r=>r.id===room)?room:rooms[0].id)});
const ray=new THREE.Raycaster(),v2=new THREE.Vector2();let down=null;const pd=e=>{down=[e.clientX,e.clientY]};
const pu=e=>{if(!ign||!down||Math.hypot(e.clientX-down[0],e.clientY-down[1])>6)return;const r=R.domElement.getBoundingClientRect();v2.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(v2,cam);
  const hits=ray.intersectObjects(ign.list.map(F=>F.mesh),false);if(!hits.length)return;const F=ign.list.find(F=>F.mesh===hits[0].object);if(F)F.lit=!F.lit};
R.domElement.addEventListener('pointerdown',pd);R.domElement.addEventListener('pointerup',pu);
function tick(dt){t+=dt;if(!ign)return;ign.update(dt);acc+=dt;if(mode==='now'&&acc>5){acc=0;ign.set(rule())}
  if(acc>.5||t<1){const st=SEASONS.state(new Date());const hm=m=>{const h=Math.floor(m/60),mm=Math.floor(m%60);return(h%12||12)+':'+String(mm).padStart(2,'0')+(h<12?' am':' pm')};
    card(sel.options[sel.selectedIndex]?sel.options[sel.selectedIndex].text+' after dark':'After dark',['<b>Burning:</b> '+ign.burning+' of '+ign.count+' flames',
      '<b>House rule:</b> hearths lit at seven until seven; candles and chandeliers from dusk to half past eleven. By the clock it is '+hm(st.mins)+': hearths '+(st.fires?'lit':'out')+', candles '+(st.chandeliers?'lit':'out')+'.',
      '<b>Tap a flame</b> to snuff it or light it again.','<b>Call:</b> FIRE.ignite(THREE, roomGroup, {rule: FIRE.rule(SEASONS.state(now))})'])}}
function dispose(){window.__lightsUp=false;R.domElement.removeEventListener('pointerdown',pd);R.domElement.removeEventListener('pointerup',pu);lights.hemi.color.setHex(saved.hemi[0]);lights.hemi.groundColor.setHex(saved.hemi[1]);lights.hemi.intensity=saved.hemi[2];lights.sun.color.setHex(saved.sun[0]);lights.sun.intensity=saved.sun[1];lights.fill.intensity=saved.fill;R.setClearColor(saved.clear);getShown().forEach(o=>S.remove(o))}
window.__fire={go,get ign(){return ign},mode:m=>{mode=m;ign&&ign.set(rule());paint()}};
return{tick,mirror(){},dispose,sound:()=>({st:SEASONS.state(new Date()),fire:ign?Math.min(1,ign.list.filter(F=>F.lit&&FIRE.HEARTH.includes(F.kind)).length*.7+(ign.burning?.15:0)):0,indoor:true})}}
