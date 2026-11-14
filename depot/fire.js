/* Euphrates Hall, Parts Depot: FIRE v1 (living fire and light)
   Every 'flame' part in the Depot (hearths, inglenooks, ranges, forges, candles, chandeliers, sconces, lanterns, lamp posts)
   becomes a real flame: it licks and sways, brightens and dims, throws flickering light on the room, and big fires spit sparks.
   Plain script; three.js is passed in.

   FIRE.split(V)                    -> [base, flames]: a prop's cubes without its flames, and the flames alone
   FIRE.Flames(THREE,flames,unit,o) -> {group, update(dt), lit}   o.light (intensity), o.sparks (bool), o.reach (blocks)
   FIRE.ignite(THREE,root,o)        -> walks a built scene (meshes whose userData.r is a PROPS.build result) and lights them all
                                       o.rule(kind) -> true|false decides what burns (see FIRE.rule for the clock rule)
                                       returns {update(dt), set(rule), count, lights}
   FIRE.rule(st)                    -> the house rule from SEASONS.state: hearths at seven (st.fires), candles at dusk (st.chandeliers)
   FIRE.HEARTH, FIRE.CANDLE         -> which prop kinds count as which */
const FIRE=(()=>{
const HEARTH=['fireplace','inglenook','kitchenRange','forgeHearth'],CANDLE=['chandelier','chandelierGilt','candelabra','candleStand','sconce','lanternPendant','lampPost','newelPost','standardLamp','tableDining','libraryTable','studyTable','consoleTable','altarTable'];
const VS=`attribute float aSeed;attribute float aH;attribute float aB;uniform float uT,uOn;varying vec3 vC;varying float vA;
#include <fog_pars_vertex>
void main(){float f=sin(uT*9.+aSeed*6.)*.5+sin(uT*15.3+aSeed*11.)*.3+sin(uT*4.1+aSeed*3.)*.2;vec3 p=position;
p.y=aB+(p.y-aB)*(1.+.32*f*aH);p.x+=sin(uT*7.+aSeed*5.+p.y*30.)*.014*aH;p.z+=cos(uT*6.3+aSeed*4.)*.014*aH;
vC=mix(vec3(1.,.32,.04),vec3(1.,.86,.5),clamp(.75-aH*.7+f*.22,0.,1.))*(1.15+f*.25);vA=uOn*(1.-aH*.3);
vec4 mvPosition=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mvPosition;
#include <fog_vertex>
}`;
const FS=`varying vec3 vC;varying float vA;
#include <fog_pars_fragment>
void main(){gl_FragColor=vec4(vC*vA,vA);
#include <fog_fragment>
}`;
function split(V){const a=new Map(),f=new Map();for(const[k,v]of V)(v[4]==='flame'?f:a).set(k,v);return[a,f]}
const F6=[[[1,0,0],[1,1,0],[1,1,1],[1,0,1]],[[0,0,1],[0,1,1],[0,1,0],[0,0,0]],[[0,1,0],[0,1,1],[1,1,1],[1,1,0]],[[0,0,0],[1,0,0],[1,0,1],[0,0,1]],[[1,0,1],[1,1,1],[0,1,1],[0,0,1]],[[0,0,0],[0,1,0],[1,1,0],[1,0,0]]];
function Flames(THREE,fl,u,o={}){const col={};for(const[x,y,z]of fl.values()){const k=x+','+z;const c=col[k]||(col[k]={lo:y,hi:y});c.lo=Math.min(c.lo,y);c.hi=Math.max(c.hi,y)}
  const P=[],S=[],H=[],Bs=[];let cx=0,cy=0,cz=0,n=0;
  for(const[x,y,z]of fl.values()){const c=col[x+','+z];const h=(y-c.lo+.5)/(c.hi-c.lo+1),seed=((x*73856093^z*19349663)>>>0)%1000/1000;cx+=x;cy+=y;cz+=z;n++;
    for(const q of F6)for(const i of[0,1,2,0,2,3]){const[a,b,cc]=q[i];P.push((x-.5+a)*u,(y+b)*u,(z-.5+cc)*u);S.push(seed);H.push(Math.min(1,h+b/(c.hi-c.lo+1)));Bs.push(c.lo*u)}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('aSeed',new THREE.Float32BufferAttribute(S,1));g.setAttribute('aH',new THREE.Float32BufferAttribute(H,1));g.setAttribute('aB',new THREE.Float32BufferAttribute(Bs,1));
  const U=THREE.UniformsUtils.merge([THREE.UniformsLib.fog,{uT:{value:Math.random()*20},uOn:{value:1}}]);const mat=new THREE.ShaderMaterial({uniforms:U,vertexShader:VS,fragmentShader:FS,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,fog:true});
  const mesh=new THREE.Mesh(g,mat);mesh.renderOrder=6;const group=new THREE.Group();group.add(mesh);const big=n>=10||o.sparks;
  const I=o.light??Math.min(18,2.2+n*.5),light=o.noLight?null:new THREE.PointLight(0xff9a48,I,o.reach||(big?11:6),2);if(light){light.position.set(cx/n*u,(cy/n+2)*u,cz/n*u);group.add(light)}
  let sp=null;if(big&&o.sparks!==false){const N=36,pos=new Float32Array(N*3).fill(-99),sg=new THREE.BufferGeometry();sg.setAttribute('position',new THREE.BufferAttribute(pos,3));sp={pts:new THREE.Points(sg,new THREE.PointsMaterial({color:0xffb050,size:.035,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false})),pos,sg,Q:[...Array(N)].map(()=>({t:-Math.random()*3}))};sp.pts.frustumCulled=false;group.add(sp.pts)}
  let on=true,lv=1,t=0;const ctr=[cx/n*u,cy/n*u,cz/n*u];
  function update(dt){t+=dt;U.uT.value+=dt;lv+=((on?1:0)-lv)*Math.min(1,dt*(on?1.2:3));U.uOn.value=lv;mesh.visible=lv>.01;
    if(light){const fl2=.82+.1*Math.sin(t*11.7)+.06*Math.sin(t*23.1+1.3)+.05*Math.sin(t*5.3);light.intensity=I*fl2*lv;light.visible=lv>.01}
    if(sp){sp.Q.forEach((q,i)=>{q.t+=dt;if(q.t>1.6||(q.t>=0&&!q.on)){if(on){q.on=true;q.t=0;q.x=ctr[0]+(Math.random()-.5)*.4;q.y=ctr[1];q.z=ctr[2]+(Math.random()-.5)*.25;q.vx=(Math.random()-.5)*.3;q.vz=(Math.random()-.5)*.3;q.vy=.6+Math.random()*.9}else{q.on=false;q.t=-Math.random()}}
      if(!q.on||q.t<0){sp.pos[i*3+1]=-99;return}q.x+=q.vx*dt;q.z+=q.vz*dt;q.y+=q.vy*dt;q.vy*=.985;sp.pos.set([q.x+Math.sin(q.t*9+i)*.02,q.y,q.z],i*3)});sp.sg.attributes.position.needsUpdate=true}}
  return{group,update,get lit(){return on},set lit(v){on=!!v},light,count:n}}
function rule(st){return k=>HEARTH.includes(k)?!!st.fires:CANDLE.includes(k)?!!st.chandeliers:true}
const baseCache=new Map();
function ignite(THREE,root,o={}){const list=[];let r0=o.rule||(()=>true);const maxL=o.maxLights??12;const faces=o.faces||(typeof PROPS!=='undefined'?PROPS.faces:null);
  const meshes=[];root.traverse(m=>{if(m.isMesh&&m.userData&&((m.userData.r&&m.userData.r.V instanceof Map)||m.userData.k))meshes.push(m)});const built={};
  for(const m of meshes){let r=m.userData.r;if(!(r&&r.V instanceof Map)){const key=m.userData.k+JSON.stringify(m.userData.o||{});if(!built[key])built[key]=typeof PROPS!=='undefined'?PROPS.build(m.userData.k,m.userData.o||{}):null;r=built[key];if(!r)continue}const ck=r.kind+JSON.stringify(m.userData.o||{});let c=baseCache.get(ck);if(c===undefined){const[a,f]=split(r.V);c=f.size?{a,f,geo:null}:null;baseCache.set(ck,c)}if(!c)continue;
    if(!c.geo&&faces){const ff=faces({V:c.a,unit:r.unit});const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(ff.pos,3));g.setAttribute('color',new THREE.BufferAttribute(ff.col,3));g.setAttribute('normal',new THREE.BufferAttribute(ff.nor,3));c.geo=g}
    if(c.geo)m.geometry=c.geo;const F=Flames(THREE,c.f,r.unit,{sparks:HEARTH.includes(r.kind)});m.add(F.group);F.kind=r.kind;F.mesh=m;list.push(F)}
  const lights=list.filter(F=>F.light).sort((a,b)=>b.count-a.count);lights.forEach((F,i)=>{if(i>=maxL){F.group.remove(F.light);F.light=null}});
  const set=rule=>{r0=rule;list.forEach(F=>F.lit=r0(F.kind))};set(r0);
  return{update:dt=>list.forEach(F=>F.update(dt)),set,list,get count(){return list.length},get burning(){return list.filter(F=>F.lit).length}}}
return{split,Flames,ignite,rule,HEARTH,CANDLE}})();
if(typeof module!=='undefined')module.exports=FIRE;
