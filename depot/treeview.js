/* Euphrates Hall, Parts Depot v13: the "Trees" view. The tree kit (trees.js): five species, three levels of detail,
   dressed by seasons.js, a grove drawn instanced, and the old props.js trees beside the new for comparison. */
export function mountTrees(ctx){
const{THREE,S,R,cam,ctl,lights,list,card,floor}=ctx;const SE=SEASONS,T=TREES;
const root=new THREE.Group();S.add(root);const mat=new THREE.MeshLambertMaterial({vertexColors:true});
const sky=SE.Sky(THREE,{radius:260});S.add(sky);
const lawnMat=new THREE.MeshLambertMaterial({color:0x4f7c33});const lawn=new THREE.Mesh(new THREE.CircleGeometry(150,48),lawnMat);lawn.rotation.x=-Math.PI/2;lawn.position.y=-.01;root.add(lawn);
const NAMES={oak:'Oak',cypress:'Cypress',cedar:'Cedar',willow:'Willow',olive:'Olive',beech:'Beech',cherry:'Cherry',chestnut:'Chestnut',greatOak:'Great oak',greatCedar:'Great cedar',greatBeech:'Great beech'};
let mode='oak',seed=1,lvl='hero',season='Summer',st=null,stage=new THREE.Group(),grove=null,acc=9;root.add(stage);
const PRE={Spring:[3,28],Summer:[6,15],Autumn:[9,24],Winter:[0,20]};
const setSeason=k=>{season=k;const d=new Date();const y=PRE[k][0]<2&&d.getMonth()>2?d.getFullYear()+1:d.getFullYear();st=SE.state(new Date(y,PRE[k][0],PRE[k][1],13));st.wind=[.4,.2]};setSeason('Summer');
const clear=()=>{if(grove){grove.dispose();grove=null}while(stage.children.length){const c=stage.children.pop();if(c.geometry&&!c.geometry.userData.species)c.geometry.dispose()}};
const oldMesh=(k,s)=>{const b=PROPS.build(k,{seed:s});const r=SE.restyle(b.V,st,{evergreen:SE.EVERGREEN.includes(k),beech:SE.BEECH.includes(k),unit:b.unit,seed:s});const f=PROPS.faces({V:r.V,unit:b.unit});const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.BufferAttribute(f.pos,3));g.setAttribute('color',new THREE.BufferAttribute(f.col,3));g.setAttribute('normal',new THREE.BufferAttribute(f.nor,3));const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide}));m.userData.quads=f.pos.length/18;return m};
const frameBox=(b)=>{const c=b.getCenter(new THREE.Vector3()),sz=b.getSize(new THREE.Vector3()),asp=innerWidth/(innerHeight*.78),t=Math.tan(cam.fov*Math.PI/360);
  const d=Math.max(sz.y*.5/t,Math.max(sz.x,sz.z)*.5/(t*asp))*1.3+Math.max(sz.x,sz.z)*.5;const dir=new THREE.Vector3(.32,.2,1).normalize();c.y-=sz.y*.06;ctl.target.copy(c);cam.position.copy(c).addScaledVector(dir,d);ctl.update()};
const frame=()=>{stage.updateMatrixWorld(true);frameBox(new THREE.Box3().setFromObject(stage))};
let info=[];
function show(){clear();const lawnC=st.snow>.4?0xe8ecef:st.season==='autumn'?0x6b7a3a:0x4f7c33;lawnMat.color.setHex(lawnC);
  if(NAMES[mode]){const g=T.geometry(THREE,mode,{seed,lod:lvl,st});const m=new THREE.Mesh(g,mat);m.userData={k:'tree',o:{species:mode,seed,lod:lvl}};stage.add(m);
    const q=l=>T.geometry(THREE,mode,{seed,lod:l,st}).userData.quads,sz=g.userData.size;frame();const I=T.info[mode];
    info=[I.label+', seed '+seed,'<b>Goes:</b> '+I.where+(I.evergreen?'. Evergreen.':'. Leafs, turns and drops with the year.'),
      '<b>Quads:</b> hero '+q('hero').toLocaleString()+', near '+q('near').toLocaleString()+', far '+q('far')+'. <b>Size:</b> '+sz[0]+' x '+sz[1]+' blocks. Showing <b>'+lvl+'</b>.',
      '<b>Call:</b> TREES.object(THREE,\''+mode+'\',{seed:'+seed+',st})']}
  else if(mode==='old'){const pairs=[['treeOak','oak']];let x=-9;const rows=[];for(const[k,s]of pairs){const o=oldMesh(k,seed);o.position.x=x;stage.add(o);const n=new THREE.Mesh(T.geometry(THREE,s,{seed,lod:'hero',st}),mat);n.position.x=x+18;stage.add(n);
      rows.push(PROPS.info[k].label+': old '+o.userData.quads.toLocaleString()+' quads, new hero '+n.geometry.userData.quads.toLocaleString()+', new near '+T.geometry(THREE,s,{seed,lod:'near',st}).userData.quads.toLocaleString());x+=40}
    frame();info=['The old oak and the new','On the left the old props.js oak; on the right the new trees.js oak, same seed.',rows.join('<br>'),'The new hero tree has more limbs and a lobed canopy, and still draws in fewer quads.']}
  else{const pl=[],r=T.rng(seed*31+5),sp=T.SPECIES;for(let i=0;i<140;i++){const a=r()*6.283,d=14+Math.sqrt(r())*110,s=sp[i%5==0?1:i%7==0?4:i%3==0?2:i%2?0:3];pl.push({species:s,x:Math.cos(a)*d,z:Math.sin(a)*d,seed:Math.floor(r()*99),scale:.85+r()*.3})}
    for(let i=0;i<6;i++)pl.push({species:'cypress',x:-6+i%2*12,z:-18+Math.floor(i/2)*9,seed:i});
    grove=T.forest(THREE,pl,{st,material:mat});stage.add(grove.group);ctl.target.set(0,2,48);cam.position.set(6,24,168);ctl.update();grove.update(cam.position);window.__grove=grove;info=null}
  [...list.children].forEach(b=>b.classList.toggle('on',!!(b.dataset.m===mode||b.dataset.s===season||(b.dataset.l&&b.dataset.l===lvl&&NAMES[mode]))))}
list.innerHTML='';const btn=(t,f,ds)=>{const b=document.createElement('button');b.textContent=t;Object.assign(b.dataset,ds||{});b.onclick=()=>{f();show()};list.appendChild(b);return b};
for(const k of T.SPECIES)btn(NAMES[k],()=>{mode=k},{m:k});btn('A grove of 146',()=>{mode='grove'},{m:'grove'});btn('Old and new',()=>{mode='old'},{m:'old'});btn('New seed',()=>{seed=seed%97+1});
for(const l of['hero','near','far'])btn(l[0].toUpperCase()+l.slice(1),()=>{lvl=l;if(!NAMES[mode])mode='oak'},{l});for(const k in PRE)btn(k,()=>setSeason(k),{s:k});
const saved={fog:S.fog,hemi:[lights.hemi.color.getHex(),lights.hemi.groundColor.getHex(),lights.hemi.intensity],sun:[lights.sun.color.getHex(),lights.sun.intensity,lights.sun.position.clone()],fill:lights.fill.intensity,clear:R.getClearColor(new THREE.Color()).getHex()};
floor.visible=false;S.fog=new THREE.Fog(0x9fb3c8,90,260);show();
function tick(dt){const sk=SE.sky(st);sky.set(sk,cam);lights.hemi.color.set(sk.hemiSky);lights.hemi.groundColor.set(sk.hemiGround);lights.hemi.intensity=sk.hemiI*1.15;lights.sun.color.set(sk.sunColor);lights.sun.intensity=sk.sunI*1.25;lights.sun.position.set(...sk.sunDir).multiplyScalar(60);
  lights.fill.intensity=.35;if(S.fog)S.fog.color.set(sk.fog);R.setClearColor(sk.fog);if(grove)grove.update(cam.position,dt);acc+=dt;
  if(acc>.5){acc=0;if(grove){const s=grove.stats();card('A grove of '+s.trees+' trees, '+season.toLowerCase(),['Five species, four shapes each, drawn instanced. Within 16 blocks of the eye a tree draws hero, within 60 near, beyond that far.','<b>Now:</b> '+s.hero+' hero, '+s.near+' near, '+s.far+' far; '+s.drawCalls+' draw calls, '+s.quads.toLocaleString()+' quads for the whole grove.','Orbit in close and watch the near trees swap in.','<b>Call:</b> TREES.forest(THREE,list,{st}); grove.update(camera.position,dt) each frame'])}else card(info[0]+', '+season.toLowerCase(),info.slice(1))}}
function dispose(){clear();S.remove(root);S.remove(sky);floor.visible=true;S.fog=saved.fog;R.setClearColor(saved.clear);
  lights.hemi.color.setHex(saved.hemi[0]);lights.hemi.groundColor.setHex(saved.hemi[1]);lights.hemi.intensity=saved.hemi[2];lights.sun.color.setHex(saved.sun[0]);lights.sun.intensity=saved.sun[1];lights.sun.position.copy(saved.sun[2]);lights.fill.intensity=saved.fill}
window.__trees={set:(m,o={})=>{mode=m;if(o.seed)seed=o.seed;if(o.lvl)lvl=o.lvl;if(o.season)setSeason(o.season);show();return true}};
return{tick,mirror(){},dispose,sound:()=>({st})}}
