/* Euphrates Hall, Parts Depot: WATER v1 (water that behaves like water)
   Plain script. three.js is passed in, so it drops into any build. Units are blocks; y is up.

   WATER.Lake(THREE,o)       a body of water with a real wave simulation (ripples travel, bounce off the shore, fade),
                             a lake bed you can see through the shallows, live mirror reflections distorted by the
                             ripples, sun glitter, depth colour, and ice in deep winter.
       o = {cx,cz, rx,rz (ellipse radii) | r (circle), depth, level, res (cells a block, 4), reflect (true),
            shelf: {side:'s'|'n'|'e'|'w', k:.5}  a gentle beach on one side}
       .mesh                 add to the scene
       .step(dt)             run the simulation (call every frame)
       .mirror(renderer,scene,camera)   render the reflection (call before the main render)
       .disturb(x,z,amp,r)   drop something in: a foot, a duck, a stone, a raindrop
       .heightAt(x,z) .depthAt(x,z) .inside(x,z) .bedAt(x,z) .slopeAt(x,z)
       .look(sky,{ice,light})  set colours from SEASONS.sky(); ice 0..1 freezes it
   WATER.Splash(THREE)       spray particles: .burst(x,y,z,n,speed) .update(dt,lakes)
   WATER.Fountain(THREE,o)   live jets for the three-basin fountain prop; .strip(V) removes the static jets
   WATER.wade(lake,w,dt)     what water does to a walker: {mode:'dry'|'wade'|'swim', depth, y, tilt}, with ripples and splashes
   WATER.Skipper(lake,splash)   tap the water to skip a stone: .throw(fromX,fromZ,toX,toZ) .update(dt)
   WATER.duck(drake)         a voxel mallard (Map, unit .05) that paddles and leaves a wake
   WATER.Terrain(THREE,o)    stepped voxel ground with the lake bed cut in: sand at the shore, mud in the deep */
const WATER=(()=>{
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));const h2=(x,z)=>{let n=(x*374761393+z*668265263)|0;n=(n^(n>>>13))*1274126177|0;return((n^(n>>>16))>>>0)/4294967296};

const VS=`attribute float aDepth;uniform mat4 uTex;varying vec4 vR;varying vec3 vW;varying float vD;varying vec3 vN;
#include <fog_pars_vertex>
void main(){vec4 wp=modelMatrix*vec4(position,1.);vW=wp.xyz;vR=uTex*wp;vD=aDepth;vN=normal;vec4 mvPosition=viewMatrix*wp;gl_Position=projectionMatrix*mvPosition;
#include <fog_vertex>
}`;
const FS=`uniform sampler2D uRefl;uniform vec3 uSunDir,uSunCol,uDeep,uShallow,uSky,uIceCol;uniform float uIce,uTime,uHasRefl,uLight,uSunI;varying vec4 vR;varying vec3 vW;varying float vD;varying vec3 vN;
#include <fog_pars_fragment>
float hs(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
void main(){float t=uTime*(1.-uIce);vec3 n=vN;n.x+=(.035*sin(vW.x*3.1+t*1.7)+.02*sin(vW.z*4.3-t*1.3)+.012*sin((vW.x-vW.z)*7.+t*2.6))*(1.-uIce);n.z+=(.035*sin(vW.z*2.7+t*1.1)+.02*sin((vW.x+vW.z)*3.7+t*2.)+.012*sin(vW.x*8.3-t*2.2))*(1.-uIce);n=normalize(n);
vec3 V=normalize(cameraPosition-vW);float fr=.04+.96*pow(1.-max(dot(n,V),0.),5.);vec2 uv=vR.xy/vR.w+n.xz*.06;vec3 refl=mix(uSky,texture2D(uRefl,uv).rgb,uHasRefl);
float dd=clamp(vD/2.4,0.,1.);vec3 body=mix(uShallow,uDeep,dd)*uLight;vec3 col=mix(body,refl,clamp(fr+.22+.25*dd,0.,1.));vec3 H=normalize(uSunDir+V);col+=uSunCol*pow(max(dot(n,H),0.),260.)*2.2*uSunI;
float a=mix(.28,.93,dd);a=max(a,clamp(fr+.18,0.,1.));
float sn=step(.62,hs(floor(vW.xz*1.3)))*.3+.12*hs(floor(vW.xz*6.));vec3 ice=mix(uIceCol,vec3(.96,.98,1.),sn)*uLight;float crack=step(.985,hs(floor(vW.xz*14.)+floor(vW.x*.7)));ice*=1.-crack*.25;
col=mix(col,ice*.92+refl*.18,uIce);a=mix(a,1.,uIce);gl_FragColor=vec4(col,a);
#include <fog_fragment>
}`;

function Lake(THREE,o={}){const res=o.res||4,cx=o.cx||0,cz=o.cz||0,level=o.level||0,rx=o.rx||o.r||10,rz=o.rz||o.r||10,maxD=o.depth||3;
  const W=rx*2,D=rz*2,nx=Math.round(W*res)+1,nz=Math.round(D*res)+1,dx=W/(nx-1);const N=nx*nz;
  const q=(x,z)=>((x-cx)/rx)**2+((z-cz)/rz)**2;const shelf=o.shelf;
  const depthAt=(x,z)=>{const Q=q(x,z);if(Q>=1)return 0;let d=maxD*Math.pow(1-Q,.7);if(shelf){const s={s:z-cz,n:cz-z,e:x-cx,w:cx-x}[shelf.side]/({s:rz,n:rz,e:rx,w:rx}[shelf.side]);if(s>0)d*=1-(shelf.k??.5)*s}return d+(o.flat?0:(h2(Math.floor(x*2),Math.floor(z*2))-.5)*.06*Math.min(1,d))};
  let h=new Float32Array(N),p=new Float32Array(N);const mask=new Uint8Array(N),dep=new Float32Array(N);
  const pos=new Float32Array(N*3),nor=new Float32Array(N*3),ad=new Float32Array(N);
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const k=j*nx+i,x=cx-rx+i*dx,z=cz-rz+j*dx;const d=depthAt(x,z);dep[k]=d;mask[k]=d>.015?1:0;ad[k]=d;pos.set([x,level,z],k*3);nor.set([0,1,0],k*3)}
  const idx=[];for(let j=0;j<nz-1;j++)for(let i=0;i<nx-1;i++){const a=j*nx+i,b=a+1,c=a+nx,e=c+1;if(!(mask[a]||mask[b]||mask[c]||mask[e]))continue;idx.push(a,c,b,b,c,e)}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('normal',new THREE.BufferAttribute(nor,3));g.setAttribute('aDepth',new THREE.BufferAttribute(ad,1));g.setIndex(idx);
  const U=THREE.UniformsUtils.merge([THREE.UniformsLib.fog,{uRefl:{value:null},uTex:{value:new THREE.Matrix4()},uSunDir:{value:new THREE.Vector3(.4,.8,.3)},uSunCol:{value:new THREE.Color(1,.95,.85)},uSunI:{value:1},
    uDeep:{value:new THREE.Color('#123344')},uShallow:{value:new THREE.Color('#4f8f8a')},uSky:{value:new THREE.Color('#9fc3e0')},uIceCol:{value:new THREE.Color('#b9cbd4')},uIce:{value:0},uTime:{value:0},uHasRefl:{value:0},uLight:{value:1}}]);
  const mat=new THREE.ShaderMaterial({uniforms:U,vertexShader:VS,fragmentShader:FS,transparent:true,depthWrite:false,fog:true});const mesh=new THREE.Mesh(g,mat);mesh.renderOrder=2;mesh.frustumCulled=false;
  /* mirror */
  const reflect=o.reflect!==false;let rt=null;const vc=new THREE.PerspectiveCamera(),tm=U.uTex.value;const v3=new THREE.Vector3(),cw=new THREE.Vector3(),lk=new THREE.Vector3(),tg=new THREE.Vector3(),rot=new THREE.Matrix4(),nrm=new THREE.Vector3(0,1,0),pl=new THREE.Plane(),cp=new THREE.Vector4(),qq=new THREE.Vector4();
  function mirror(R,scene,cam){if(!reflect)return;const sz=R.getDrawingBufferSize(new THREE.Vector2());const w=Math.max(64,sz.x>>1),hh=Math.max(64,sz.y>>1);if(!rt||rt.width!==w||rt.height!==hh){if(rt)rt.dispose();rt=new THREE.WebGLRenderTarget(w,hh);U.uRefl.value=rt.texture;U.uHasRefl.value=1}
    const rp=new THREE.Vector3(cx,level,cz);cw.setFromMatrixPosition(cam.matrixWorld);v3.subVectors(rp,cw);if(v3.dot(nrm)>0)return;v3.reflect(nrm).negate().add(rp);rot.extractRotation(cam.matrixWorld);lk.set(0,0,-1).applyMatrix4(rot).add(cw);
    tg.subVectors(rp,lk).reflect(nrm).negate().add(rp);vc.position.copy(v3);vc.up.set(0,1,0).applyMatrix4(rot).reflect(nrm);vc.lookAt(tg);vc.far=cam.far;vc.updateMatrixWorld();vc.projectionMatrix.copy(cam.projectionMatrix);
    tm.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1);tm.multiply(vc.projectionMatrix);tm.multiply(vc.matrixWorldInverse);
    pl.setFromNormalAndCoplanarPoint(nrm,rp);pl.applyMatrix4(vc.matrixWorldInverse);cp.set(pl.normal.x,pl.normal.y,pl.normal.z,pl.constant);const P=vc.projectionMatrix.elements;
    qq.x=(Math.sign(cp.x)+P[8])/P[0];qq.y=(Math.sign(cp.y)+P[9])/P[5];qq.z=-1;qq.w=(1+P[10])/P[14];cp.multiplyScalar(2/cp.dot(qq));P[2]=cp.x;P[6]=cp.y;P[10]=cp.z+1-.003;P[14]=cp.w;
    const was=mesh.visible,prev=R.getRenderTarget(),hide=[];mesh.visible=false;scene.traverse(ob=>{if(ob.userData&&ob.userData.noReflect&&ob.visible){hide.push(ob);ob.visible=false}});
    R.setRenderTarget(rt);R.clear();R.render(scene,vc);R.setRenderTarget(prev);mesh.visible=was;hide.forEach(ob=>ob.visible=true)}
  /* simulation: damped wave equation on the grid; the shore is a wall that reflects */
  const damp=o.damp||.995;const C2=o.speed?Math.pow(o.speed/60/dx,2):Math.pow(1.6/60/dx,2);let acc=0,ice=0,time=0;
  function sub(){const nh=p;for(let j=1;j<nz-1;j++)for(let i=1;i<nx-1;i++){const k=j*nx+i;if(!mask[k]){nh[k]=0;continue}const c=h[k];
      const l=mask[k-1]?h[k-1]:c,r=mask[k+1]?h[k+1]:c,u=mask[k-nx]?h[k-nx]:c,d=mask[k+nx]?h[k+nx]:c;nh[k]=(2*c-p[k]+C2*(l+r+u+d-4*c))*damp}
    p=h;h=nh}
  const gain=1;function step(dt){time+=dt;U.uTime.value=time;if(ice>.98){return}acc+=Math.min(dt,.1);let n=0;while(acc>=1/60&&n<4){sub();acc-=1/60;n++}
    for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const k=j*nx+i;pos[k*3+1]=level+(mask[k]?h[k]*gain*(1-ice):0);
      const l=i>0?h[k-1]:h[k],r=i<nx-1?h[k+1]:h[k],u=j>0?h[k-nx]:h[k],d=j<nz-1?h[k+nx]:h[k];let ax=(l-r)/(2*dx)*3,az=(u-d)/(2*dx)*3;const L=Math.hypot(ax,1,az);nor[k*3]=ax/L;nor[k*3+1]=1/L;nor[k*3+2]=az/L}
    g.attributes.position.needsUpdate=true;g.attributes.normal.needsUpdate=true}
  const cell=(x,z)=>[Math.round((x-cx+rx)/dx),Math.round((z-cz+rz)/dx)];
  function disturb(x,z,amp=.05,r=.3){if(ice>.6)return;const[ci,cj]=cell(x,z),R=Math.max(1,Math.round(r/dx));for(let j=cj-R;j<=cj+R;j++)for(let i=ci-R;i<=ci+R;i++){if(i<1||j<1||i>=nx-1||j>=nz-1)continue;const k=j*nx+i;if(!mask[k])continue;const f=1-Math.hypot(i-ci,j-cj)/(R+1);if(f>0)h[k]-=amp*f*f}}
  function heightAt(x,z){const[i,j]=cell(x,z);if(i<0||j<0||i>=nx||j>=nz)return 0;return h[j*nx+i]*(1-ice)}
  function slopeAt(x,z){return[(heightAt(x+dx,z)-heightAt(x-dx,z))/(2*dx),(heightAt(x,z+dx)-heightAt(x,z-dx))/(2*dx)]}
  const inside=(x,z)=>depthAt(x,z)>.015;const bedAt=(x,z)=>level-depthAt(x,z);
  function look(sk,opt={}){if(sk){U.uSunDir.value.set(...sk.sunDir).normalize();U.uSunCol.value.set(sk.sunColor);U.uSunI.value=sk.sunI>0?Math.min(1,sk.sunI):0;U.uSky.value.set(sk.horizon).lerp(new THREE.Color(sk.top),.4);
      const L=Math.max(.12,Math.min(1,sk.hemiI*.85+sk.sunI*.25));U.uLight.value=L;U.uDeep.value.set(sk.night>.5?'#06121c':'#123344');U.uShallow.value.set(sk.night>.5?'#1a2a30':'#4f8f8a')}
    if(opt.ice!==undefined){ice=opt.ice;U.uIce.value=ice;if(ice>.6){h.fill(0);p.fill(0)}}}
  return{mesh,step,mirror,disturb,heightAt,slopeAt,depthAt,inside,bedAt,look,level,cx,cz,rx,rz,get frozen(){return ice>.6},get ice(){return ice},dispose(){g.dispose();mat.dispose();if(rt)rt.dispose()}}}

/* spray */
function Splash(THREE,max=900){const pos=new Float32Array(max*3).fill(-99),g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));
  const m=new THREE.Points(g,new THREE.PointsMaterial({color:0xeaf6ff,size:.07,transparent:true,opacity:.9,depthWrite:false}));m.frustumCulled=false;m.userData.noReflect=false;const P=[];let n=0;
  function burst(x,y,z,cnt=20,sp=1.6,up=2.2){for(let i=0;i<cnt;i++){const a=Math.random()*6.283,s=sp*(.3+Math.random()*.7);P[n]={x,y,z,vx:Math.cos(a)*s,vy:up*(.5+Math.random()*.7),vz:Math.sin(a)*s,life:1.5};n=(n+1)%max}}
  function update(dt,lakes=[]){for(let i=0;i<max;i++){const q=P[i];if(!q||q.life<=0){pos[i*3+1]=-99;continue}q.vy-=9.8*dt;q.x+=q.vx*dt;q.y+=q.vy*dt;q.z+=q.vz*dt;q.life-=dt;
      if(q.vy<0){for(const L of lakes)if(L.inside(q.x,q.z)&&q.y<=L.level+L.heightAt(q.x,q.z)){q.life=0;if(Math.random()<.25)L.disturb(q.x,q.z,.006,.12)}}if(q.y<-3)q.life=0;pos.set([q.x,q.y,q.z],i*3)}g.attributes.position.needsUpdate=true}
  return{points:m,burst,update}}

/* the three-basin fountain (props2 'fountain', unit .115): live jets and spills, falling into a live bottom basin */
function Fountain(THREE,o={}){const u=o.unit||.115,X=o.x||0,Y=o.y||0,Z=o.z||0,R=(o.r||22);const basin=Lake(THREE,{cx:X,cz:Z,r:(R-2.5)*u,depth:.3,level:Y+4*u,res:6,reflect:false,flat:true,speed:1.1});
  const n=o.count||420,pos=new Float32Array(n*3).fill(-99),g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));
  const pts=new THREE.Points(g,new THREE.PointsMaterial({color:0xdcefff,size:.06,transparent:true,opacity:.85,depthWrite:false}));pts.frustumCulled=false;
  const tiers=[{y:Y+27*u,r:5*u},{y:Y+17*u,r:9*u}];const P=[];for(let i=0;i<n;i++)P.push({st:-1,t:Math.random()*2});
  const spawn=(q,stage)=>{q.st=stage;if(stage===0){q.x=X+(Math.random()-.5)*.03;q.z=Z+(Math.random()-.5)*.03;q.y=Y+34*u;const a=Math.random()*6.283,s=Math.random()*.25;q.vx=Math.cos(a)*s;q.vz=Math.sin(a)*s;q.vy=2.9+Math.random()*.4}
    else{const T=tiers[stage-1],a=Math.random()*6.283;q.x=X+Math.cos(a)*T.r;q.z=Z+Math.sin(a)*T.r;q.y=T.y+u;q.vx=Math.cos(a)*(.45+Math.random()*.2);q.vz=Math.sin(a)*(.45+Math.random()*.2);q.vy=.1}};
  let on=true;
  function update(dt){basin.step(dt);for(let i=0;i<n;i++){const q=P[i];if(q.st<0){q.t-=dt;if(q.t<=0&&on)spawn(q,i%3);else{pos[i*3+1]=-99;continue}}
      q.vy-=9.8*dt;q.x+=q.vx*dt;q.y+=q.vy*dt;q.z+=q.vz*dt;const rr=Math.hypot(q.x-X,q.z-Z);
      if(q.vy<0){if(q.st===0&&q.y<=tiers[0].y){spawn(q,1);}else if(q.st===1&&q.y<=tiers[1].y&&rr<tiers[1].r){spawn(q,2)}else if(q.y<=basin.level&&rr<(R-2.5)*u){if(Math.random()<.5)basin.disturb(q.x,q.z,.01,.1);q.st=-1;q.t=Math.random()*.3}else if(q.y<Y-.5){q.st=-1}}
      pos.set([q.x,q.y,q.z],i*3)}g.attributes.position.needsUpdate=true}
  const strip=V=>{const out=new Map();for(const[k,v]of V){if(v[3]==='#bfd8e8')continue;if(v[3]==='#5a8aa8'&&v[1]===3)continue;out.set(k,v)}return out};
  return{basin,points:pts,update,strip,look:(sk,op)=>basin.look(sk,op),set on(v){on=v},get on(){return on}}}

/* what the water does to a walker. w = {x,z,px,pz,mode,_t} (keep it between frames). Returns {mode,depth,y,tilt}.
   Wading: feet on the bed, rings at every step. Over 1.35 blocks deep: swimming, head and shoulders out, a wake. */
function wade(lake,w,dt,splash){const d=lake.inside(w.x,w.z)&&!lake.frozen?lake.depthAt(w.x,w.z):0;const sp=Math.hypot(w.x-(w.px??w.x),w.z-(w.pz??w.z))/Math.max(dt,1e-3);w.px=w.x;w.pz=w.z;
  const mode=lake.frozen&&lake.inside(w.x,w.z)?'skate':d<.04?'dry':d<1.35?'wade':'swim';if(mode!==w.mode&&w.mode&&splash&&(mode==='wade'&&w.mode==='dry'||mode==='swim'))splash.burst(w.x,lake.level,w.z,mode==='swim'?40:14,1.2,mode==='swim'?2.4:1.4);
  w.mode=mode;w._t=(w._t||0)+dt;if((mode==='wade'||mode==='swim')&&w._t>(mode==='swim'?.12:.22)&&sp>.05){w._t=0;lake.disturb(w.x,w.z,(mode==='swim'?.05:.025+.02*Math.min(d,1))*Math.min(1.5,sp),mode==='swim'?.45:.3);if(splash&&mode==='swim'&&Math.random()<.5)splash.burst(w.x,lake.level+.05,w.z,4,.6,1.2)}
  const y=mode==='swim'?lake.level-1.55+Math.sin(w._t*6)*.03+lake.heightAt(w.x,w.z):mode==='skate'?lake.level+.02:mode==='wade'?lake.bedAt(w.x,w.z):null;return{mode,depth:d,y,tilt:mode==='swim'?-1.25:0}}

/* skipping stones */
function Skipper(lake,splash){const S=[];function throwIt(fx,fz,tx,tz){const dx=tx-fx,dz=tz-fz,L=Math.hypot(dx,dz)||1;S.push({x:fx,z:fz,y:lake.level+1.4,ux:dx/L,uz:dz/L,hop:L,left:L,bounces:0,maxB:3+((Math.random()*3)|0),t:0,dur:Math.max(.5,L/9)})}
  function update(dt){for(let i=S.length-1;i>=0;i--){const s=S[i];s.t+=dt;const f=Math.min(1,s.t/s.dur);const sp=s.hop/s.dur;s.x+=s.ux*sp*dt;s.z+=s.uz*sp*dt;s.y=lake.level+(s.bounces?.5*Math.sin(f*Math.PI)*s.hop/3:1.4*(1-f)+.3*Math.sin(f*Math.PI));
      if(f>=1){if(!lake.inside(s.x,s.z)){S.splice(i,1);continue}const last=s.bounces>=s.maxB;lake.disturb(s.x,s.z,last?.12:.06,last?.45:.3);if(splash)splash.burst(s.x,lake.level,s.z,last?30:10,last?1.2:.8,last?2.2:1.2);if(last){S.splice(i,1);continue}s.bounces++;s.hop*=.55;s.t=0;s.dur=Math.max(.18,s.hop/7)}}}
  return{throw:throwIt,update,stones:S}}

/* a voxel mallard, unit .05 (about 0.6 blocks long); drake true = green head */
function duck(drake=true){const V=new Map(),put=(x,y,z,c)=>V.set(x+','+y+','+z,[x,y,z,c,'b']);const body=drake?'#a9a9a0':'#8a6a48',back=drake?'#6a6a62':'#6a4f36',breast=drake?'#6a3a2a':'#9a7650',head=drake?'#2f6a3a':'#8a6a48';
  for(let z=-6;z<=6;z++)for(let x=-3;x<=3;x++)for(let y=0;y<=4;y++){const q=(x/3.5)**2+((y-2)/2.6)**2+(z/6.5)**2;if(q>1)continue;put(x,y,z,y>=3?back:z>3?breast:(h2(x+z,y)<.15&&!drake?'#6a4f36':body))}
  for(let z=-8;z<=-6;z++)for(let x=-1;x<=1;x++)put(x,3+(z===-8?1:0),z,drake?'#1a1a1a':back);
  for(let y=4;y<=6;y++)for(let x=-1;x<=1;x++)put(x,y,5,y===5&&drake?'#f4f4f0':breast);for(let x=-2;x<=2;x++)for(let y=7;y<=9;y++)for(let z=4;z<=7;z++)if(Math.abs(x)+Math.abs(z-5.5)<4)put(x,y,z,head);
  for(let x=-1;x<=1;x++)put(x,7,8,'#d9b030'),put(x,7,9,'#d9b030');put(-2,8,6,'#111');put(2,8,6,'#111');if(drake)for(const x of[-3,3])for(let z=-2;z<=0;z++)put(x,2,z,'#3a4aa8');return V}

/* stepped ground with the bed cut in. o = {x0,z0,x1,z1, cell (.5), lakes:[Lake], grass:'#hex', litter 0..1, snow 0..1, paths:[[x,z,w,d,'#hex'],..]} */
function Terrain(THREE,o){const c=o.cell||.5,P=[],C=[],N=[],col=new THREE.Color();const lakes=o.lakes||[];const ix=Math.round((o.x1-o.x0)/c),iz=Math.round((o.z1-o.z0)/c);
  const H=new Float32Array(ix*iz),K=[];const LAWN=o.top??.15;const AUT=['#a8703a','#b88a3f','#9a5a32','#b89a50','#7a5a32'];
  const pathAt=(x,z)=>{for(const p of o.paths||[])if(x>=p[0]&&x<p[0]+p[2]&&z>=p[1]&&z<p[1]+p[3])return p[4];return null};
  for(let j=0;j<iz;j++)for(let i=0;i<ix;i++){const x=o.x0+(i+.5)*c,z=o.z0+(j+.5)*c;let d=0,lv=0;for(const L of lakes){const dd=L.depthAt(x,z);if(dd>d){d=dd;lv=L.level}}const r=h2(i,j);
    let hh,cc;if(d>.015){hh=Math.round((lv-d)*4)/4;const t=clamp(d/2.2,0,1);cc=SEASONS_mix(d<.35?'#c8b48a':'#9a8a62','#3a4434',t);if(r<.2)cc=SEASONS_mix(cc,'#2a3328',.3)}
    else{let shore=false;for(const L of lakes)if(L.depthAt(x+c,z)>.015||L.depthAt(x-c,z)>.015||L.depthAt(x,z+c)>.015||L.depthAt(x,z-c)>.015)shore=true;hh=LAWN;const pth=pathAt(x,z);
      cc=pth||(shore?'#c2ad80':o.grass||'#5a8f3a');if(!pth&&!shore){cc=SEASONS_mix(cc,r<.5?'#4a6a2a':'#7a9a4a',.18*Math.abs(r-.5)*2);if(o.litter&&h2(i*7,j*3)<o.litter*.12)cc=SEASONS_mix(AUT[(r*97|0)%5],cc,.5)}
      if(o.snow&&h2(i*3,j*5)<o.snow*1.02)cc=SEASONS_mix(cc,'#eef2f6',Math.min(1,o.snow*1.1));}
    H[j*ix+i]=hh;K.push(cc)}
  const quad=(a,b,cc2,d2,n,cl,sh)=>{for(const v of[a,b,cc2,a,cc2,d2]){P.push(...v);N.push(...n);C.push(cl.r*sh,cl.g*sh,cl.b*sh)}};
  for(let j=0;j<iz;j++)for(let i=0;i<ix;i++){const k=j*ix+i,y=H[k],x0=o.x0+i*c,z0=o.z0+j*c,x1=x0+c,z1=z0+c;col.set(K[k]);quad([x0,y,z0],[x0,y,z1],[x1,y,z1],[x1,y,z0],[0,1,0],col,1);
    const side=(ni,nj,n,a,b)=>{const ny=(ni<0||nj<0||ni>=ix||nj>=iz)?-3:H[nj*ix+ni];if(ny>=y)return;const lo=ny;quad([a[0],y,a[1]],[a[0],lo,a[1]],[b[0],lo,b[1]],[b[0],y,b[1]],n,col,.72)};
    side(i+1,j,[1,0,0],[x1,z1],[x1,z0]);side(i-1,j,[-1,0,0],[x0,z0],[x0,z1]);side(i,j+1,[0,0,1],[x0,z1],[x1,z1]);side(i,j-1,[0,0,-1],[x1,z0],[x0,z0])}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(N,3));g.setAttribute('color',new THREE.Float32BufferAttribute(C,3));
  const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({vertexColors:true}));m.userData.heightAt=(x,z)=>{const i=Math.floor((x-o.x0)/c),j=Math.floor((z-o.z0)/c);if(i<0||j<0||i>=ix||j>=iz)return LAWN;return H[j*ix+i]};return m}
const SEASONS_mix=(a,b,t)=>{const A=parseInt(a.slice(1),16),B=parseInt(b.slice(1),16);const f=s=>[(s>>16)&255,(s>>8)&255,s&255];const x=f(A),y=f(B);return'#'+x.map((v,i)=>Math.round(v+(y[i]-v)*t).toString(16).padStart(2,'0')).join('')};


/* a timber boathouse on the shore (unit .115, 6 by 4.6 blocks, front faces +z): windows glow at night through SEASONS.restyle */
function boathouse(PROPS){const k=PROPS.kit(),W=26,D=20,H=26,tim='#7a5a3a',timD='#5f4630',stone='#8a8478',glass='#bfd8e8',white='#ece6d6',slate='#4a5058',slateD='#3c4148',brick='#8a4a3a';
  for(let x=-W;x<=W;x++)for(let z=-D;z<=D;z++)for(let y=0;y<=3;y++)if(Math.abs(x)===W||Math.abs(z)===D||y===3)k.put(x,y,z,y===3?'#5a4632':stone);
  for(let y=4;y<=H;y++)for(let x=-W;x<=W;x++)for(let z=-D;z<=D;z++){if(Math.abs(x)!==W&&Math.abs(z)!==D)continue;k.put(x,y,z,(Math.abs(x)===W&&Math.abs(z)===D)||y===H?white:((Math.abs(z)===D?x:z)+40)%5===0?timD:tim)}
  const win=(cx,cz,ax)=>{for(let a=-4;a<=4;a++)for(let y=9;y<=20;y++){const fr=Math.abs(a)===4||y===9||y===20||a===0||y===15;const x=ax==='x'?cx+a:cx,z=ax==='x'?cz:cz+a;k.put(x,y,z,fr?white:glass)}for(let a=-5;a<=5;a++){const x=ax==='x'?cx+a:cx,z=ax==='x'?cz:cz+a;k.put(x,8,z,white)}};
  win(-15,D,'x');win(15,D,'x');win(-W,0,'z');win(W,0,'z');win(-12,-D,'x');win(12,-D,'x');
  for(let x=-6;x<=6;x++)for(let y=4;y<=20;y++)k.put(x,y,D,Math.abs(x)===6||y===20?white:x===0?'#24382c':(y%4?'#2f4a3a':'#284034'),'door');for(let x=-7;x<=7;x++)k.put(x,21,D+1,white);
  for(let s=0;s<=16;s++){const y=H+1+s,ez=D+3-Math.round(s*1.45);if(ez<0)break;for(let x=-W-3;x<=W+3;x++){for(const z of[ez,-ez])k.put(x,y,z,(x+s)%6?slate:slateD)}for(const x of[-W,W])for(let z=-ez+1;z<ez;z++)if(Math.abs(z)<=D)k.put(x,y,z,tim)}
  for(let x=-W-3;x<=W+3;x++)k.put(x,H+17,0,slateD);for(let y=H-4;y<=H+24;y++)for(let x=16;x<=19;x++)for(let z=-9;z<=-6;z++)if(x===16||x===19||z===-9||z===-6||y===H+24)k.put(x,y,z,y>=H+22?'#6a3a2a':brick);
  return{V:k.V,unit:.115,chimney:[17.5,H+25,-7.5]}}
return{Lake,Splash,Fountain,wade,Skipper,duck,Terrain,boathouse}})();
if(typeof module!=='undefined')module.exports=WATER;
