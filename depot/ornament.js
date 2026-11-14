/* ornament.js : Euphrates Hall, Parts Depot v15 (Kairos XI.1, Nov 12 2026). The piece library for the contours.
   Plain script, no imports, no network. Load after trees.js (pieces are meshed by TREES.mesh). contours.js lays these out.

   Every piece stands proud of the wall. None cuts into a wall or changes an opening: a Face never writes a cell
   in front of an opening it was told about (within 2 blocks of the wall), nor inside a patch it was told is hidden.
   Voxels are a quarter block near and half a block far. Far forms keep the silhouette only.

   ORNAMENT.build(kind,o)  -> {V,unit,size,depth,cover,quads}   a single piece on its own (for a look, or to place by hand)
      kinds: pilaster {h,w,panel,flute}  cornice {len,dentils}  window {w,h,head:'tri'|'seg'|'hood'|'none',sill,key}
             blind {w,h,head}  sill {w}  base {len}  balcony {len}  balustrade {len,kind:'open'|'balus'}  door {w,h,grand}
             obelisk {b,h,ball}  urn  column {h,d,sq}
      depth = how far it stands out, in blocks. cover = the wall cells it sits on, [u,v] pairs in whole blocks.
   ORNAMENT.Skin, .Face, .P (pieces on a face), .W (pieces in the world), .mesh(skin) are what contours.js builds with. */
const ORNAMENT=(()=>{
const STUB='#010203';
const PAL={wall:'#d8ccae',trim:'#c3af86',deep:'#aa966c',rust:'#cdc09c',lead:'#6b6f78',leadD:'#585c66',gold:'#c9a227',iron:'#e9e4d8',white:'#f1ede4',wood:'#6b4a2e'};

/* ---------- a skin: one voxel map in world cells ---------- */
const KEY=(x,y,z)=>((x+16384)*4096+(y+1024))*32768+(z+16384);
function Skin(unit){this.V=new Map();this.unit=unit||.25;this.q=1/this.unit}
Skin.prototype.cell=function(x,y,z,c,p){this.V.set(KEY(x,y,z),[x,y,z,c,p||'o'])};
Skin.prototype.wbox=function(x0,y0,z0,x1,y1,z1,c,p){const q=this.q,R=v=>Math.round(v*q);
  for(let x=R(x0);x<R(x1);x++)for(let y=R(y0);y<R(y1);y++)for(let z=R(z0);z<R(z1);z++)this.cell(x,y,z,c,p)};
Skin.prototype.wdel=function(x0,y0,z0,x1,y1,z1){const q=this.q,R=v=>Math.round(v*q);
  for(let x=R(x0);x<R(x1);x++)for(let y=R(y0);y<R(y1);y++)for(let z=R(z0);z<R(z1);z++)this.V.delete(KEY(x,y,z))};

/* ---------- a face: u runs along the wall, v is up, w is out from the wall face ----------
   d: {axis:'x'|'z', o: world coordinate where u=0, f: world coordinate of the wall face, n: +1|-1 outward, L, H, y0: lowest v kept, zones:[{u0,u1,off,top}]} */
function Face(skin,d){this.s=skin;this.q=skin.q;this.far=skin.unit>=.5;this.axis=d.axis;this.o=d.o;this.f=d.f;this.n=d.n;this.L=d.L;this.H=d.H||64;this.free0=d.free0!==false;this.free1=d.free1!==false;
  const q=this.q;this.O=Math.round(d.o*q);this.F=Math.round(d.f*q);this.Wd=Math.round(this.L*q);this.Hd=Math.round(this.H*q);this.M=new Uint8Array(this.Wd*this.Hd);this.zones=d.zones||[];this.open=[];
  this.Lc=Math.ceil(this.L);this.D=new Float32Array(this.Lc*Math.ceil(this.H))}
Face.prototype.mark=function(u0,v0,u1,v1,val){const q=this.q,W=this.Wd,R=v=>Math.round(v*q);for(let i=Math.max(0,R(u0));i<Math.min(W,R(u1));i++)for(let j=Math.max(0,R(v0));j<Math.min(this.Hd,R(v1));j++)if(this.M[j*W+i]!==2)this.M[j*W+i]=val};
Face.prototype.opening=function(o){this.open.push(o);this.mark(o.u0,o.v0,o.u1,o.v1,1)};
/* v20: the slim glazing cross. One bar up and one across, .15 of a block wide, standing just proud of the wall face in the open of a window.
   A glazed door gets two leaves instead: a meeting stile, a kick panel and two bars across. Near form only.
   The bars are flat quads, not cubes (4 triangles a window, 8 a door); CONTOURS.dress adds them to the piece they stand in. */
Face.prototype.glaze=function(o,k){if(this.far)return 0;k=k||{};const q=this.q,c=k.c||'#efe9da',w=o.u1-o.u0,h=o.v1-o.v0;if(w<1||h<1.5)return 0;const ci=Math.floor((o.u0+o.u1)/2*q),cj=Math.floor((o.v0+o.v1)/2*q);if(ci<0||cj<0||ci>=this.Wd||cj>=this.Hd||this.M[cj*this.Wd+ci]!==1)return 0;
  const L=this.s.glz||(this.s.glz=[]),W=.06,quad=(u0,v0,u1,v1,col)=>{const P=[[u0,v0],[u1,v0],[u1,v1],[u0,v1]].map(([u,v])=>{const[x,z]=this.xz(u,W);return[x,v,z]});L.push({P,n:this.axis==='x'?[0,0,this.n]:[this.n,0,0],c:col||c})},uc=(o.u0+o.u1)/2;
  if(k.door){const kick=Math.min(.75,h/5);quad(uc-.125,o.v0+kick,uc+.125,o.v1);quad(o.u0,o.v0,o.u1,o.v0+kick,k.panel||'#e4dccb');for(const t of[.4,.72]){const v=o.v0+kick+(h-kick)*t;quad(o.u0,v-.075,o.u1,v+.075)}return 4}
  const vt=o.v0+h*.6;quad(uc-.075,o.v0,uc+.075,o.v1);quad(o.u0,vt-.075,o.u1,vt+.075);return 2};
/* glazing quads as one mesh in the same form as the pieces */
function glazeMesh(list){const n=list.length,pos=new Float32Array(n*12),col=new Float32Array(n*12),nor=new Float32Array(n*12),index=new Uint32Array(n*6);list.forEach((g,i)=>{const P=g.P,h=parseInt(g.c.slice(1),16),rgb=[(h>>16&255)/255,(h>>8&255)/255,(h&255)/255];
    const e1=[P[1][0]-P[0][0],P[1][1]-P[0][1],P[1][2]-P[0][2]],e2=[P[2][0]-P[0][0],P[2][1]-P[0][1],P[2][2]-P[0][2]],cr=[e1[1]*e2[2]-e1[2]*e2[1],e1[2]*e2[0]-e1[0]*e2[2],e1[0]*e2[1]-e1[1]*e2[0]],flip=cr[0]*g.n[0]+cr[1]*g.n[1]+cr[2]*g.n[2]<0,Q=flip?[P[0],P[3],P[2],P[1]]:P;
    for(let v=0;v<4;v++)for(let a=0;a<3;a++){pos[i*12+v*3+a]=Q[v][a];col[i*12+v*3+a]=rgb[a];nor[i*12+v*3+a]=g.n[a]}index.set([i*4,i*4+1,i*4+2,i*4,i*4+2,i*4+3],i*6)});return{pos,col,nor,index,quads:n}}
Face.prototype.hide=function(u0,v0,u1,v1){this.mark(u0,v0,u1,v1,2)};
Face.prototype.at=function(u,v){const i=Math.round(u*this.q),j=Math.round(v*this.q);return i<0||i>=this.Wd||j<0||j>=this.Hd?0:this.M[j*this.Wd+i]};
Face.prototype.off=function(u){for(const z of this.zones)if(u>=z.u0&&u<z.u1)return z.off;return 0};
Face.prototype.del=function(u0,v0,w0,u1,v1,w1){const q=this.q,R=v=>Math.round(v*q);for(let i=R(u0);i<R(u1);i++)for(let j=R(v0);j<R(v1);j++)for(let k=R(w0);k<R(w1);k++){const A=this.O+i,N=this.n>0?this.F+k:this.F-1-k;this.s.V.delete(this.axis==='x'?KEY(A,j,N):KEY(N,j,A))}};
Face.prototype.xz=function(u,w){const a=this.o+u,b=this.f+this.n*w;return this.axis==='x'?[a,b]:[b,a]};
/* raw box in face space. free: the piece stands clear of the wall (a rail, a column), so the pane rule is by distance only */
Face.prototype.box=function(u0,v0,w0,u1,v1,w1,c,p,free){const q=this.q,R=v=>Math.round(v*q),a0=R(u0),a1=R(u1),b0=R(v0),b1=R(v1),c0=R(w0),c1=R(w1),W=this.Wd,M=this.M,near=2*q;if(a1<=a0||b1<=b0||c1<=c0)return;
  for(let i=a0;i<a1;i++){const A=this.O+i,inb=i>=0&&i<W;for(let j=b0;j<b1;j++){const m=inb&&j>=0&&j<this.Hd?M[j*W+i]:0;if(m===2)continue;if(m===1&&c0<near){if(c1<=near)continue}
    for(let k=c0;k<c1;k++){if(m===1&&k<near)continue;const N=this.n>0?this.F+k:this.F-1-k;if(this.axis==='x')this.s.cell(A,j,N,c,p);else this.s.cell(N,j,A,c,p)}
    if(c0===0&&m!==1){const N=this.n>0?this.F-1:this.F,key=this.axis==='x'?KEY(A,j,N):KEY(N,j,A);if(!this.s.V.has(key))this.s.V.set(key,this.axis==='x'?[A,j,N,STUB,'stub']:[N,j,A,STUB,'stub'])}
    if(inb&&j>=0&&c1>0){const di=Math.floor(i/q),dj=Math.floor(j/q),k=dj*this.Lc+di,w=c1/q;if(k<this.D.length&&w<=2.5&&w>this.D[k])this.D[k]=w}}}};
/* a piece that sits on the wall: it starts at the wall face (never a gap) and ends w beyond its zone */
Face.prototype.on=function(u0,v0,u1,v1,w,c,p){if(!this.zones.length){this.box(u0,v0,0,u1,v1,w,c,p);return}const cuts=[u0,u1];for(const z of this.zones){if(z.u0>u0&&z.u0<u1)cuts.push(z.u0);if(z.u1>u0&&z.u1<u1)cuts.push(z.u1)}cuts.sort((a,b)=>a-b);
  for(let i=0;i<cuts.length-1;i++){if(cuts[i+1]-cuts[i]<.01)continue;const o=this.off((cuts[i]+cuts[i+1])/2);this.box(cuts[i],v0,0,cuts[i+1],v1,o+w,c,p)}};
/* a horizontal course. At a free end it returns round the corner by its own projection. */
Face.prototype.course=function(v0,v1,w,c,u0,u1,p){u0=u0==null?0:u0;u1=u1==null?this.L:u1;const e0=u0<=0&&this.free0?w+this.off(.1):0,e1=u1>=this.L&&this.free1?w+this.off(this.L-.1):0;
  if(e0)this.box(-e0,v0,0,0,v1,e0,c,p);if(e1)this.box(this.L,v0,0,this.L+e1,v1,e1,c,p);this.on(Math.max(0,u0),v0,Math.min(this.L,u1),v1,w,c,p)};
/* a band that stands on the wall top (a parapet): w from wa (inside the face) to wb beyond each zone */
Face.prototype.band=function(v0,v1,wa,wb,c,p,u0,u1){u0=u0==null?0:u0;u1=u1==null?this.L:u1;const cuts=[u0,u1];for(const z of this.zones){if(z.u0>u0&&z.u0<u1)cuts.push(z.u0);if(z.u1>u0&&z.u1<u1)cuts.push(z.u1)}cuts.sort((a,b)=>a-b);
  for(let i=0;i<cuts.length-1;i++){if(cuts[i+1]-cuts[i]<.01)continue;const o=this.off((cuts[i]+cuts[i+1])/2);let a=cuts[i],b=cuts[i+1];if(a<=0&&this.free0)a=-(wb+o);if(b>=this.L&&this.free1)b=this.L+wb+o;this.box(a,v0,wa,b,v1,o+wb,c,p,true)}};

/* ---------- pieces on a face ---------- */
const P={
 /* a window surround: architrave, sill, and a head that is plain, a hood, a triangle or a curve */
 surround(F,o,k){k=k||{};const a=k.arch==null?.5:k.arch,pr=k.proud||.25,c=k.c||PAL.trim,d=k.deep||PAL.deep,{u0,u1,v0,v1}=o,uc=(u0+u1)/2;let top=v1+a;
  if(F.far)return;
  if(a===0){F.on(u0-.25,v1,u1+.25,v1+.5,pr,c,'lintel');if(k.sill)F.on(u0-.25,v0-.5,u1+.25,v0,pr+.25,d,'sill');if(k.key)F.on(uc-.25,v1,uc+.25,v1+.75,pr+.25,d,'key');return v1+.5}
  F.on(u0-a,v0,u0,v1,pr,c,'arch');F.on(u1,v0,u1+a,v1,pr,c,'arch');F.on(u0-a,v1,u1+a,v1+a,pr,c,'arch');
  if(k.sill)F.on(u0-a-.25,v0-.5,u1+a+.25,v0,.5,d,'sill');
  if(k.apron)F.on(u0-a,v0-1.25,u1+a,v0-.5,.25,c,'apron');
  if(k.key)F.on(uc-.25,v1,uc+.25,v1+a+.25,pr+.25,d,'key');
  if(k.head==='hood'||k.head==='tri'||k.head==='seg'){F.on(u0-a-.25,top,u1+a+.25,top+.25,.75,d,'hood');top+=.25;const hw=(u1-u0)/2+a+.25;
   if(k.head==='tri'){for(let h=hw-.25,i=0;h>.2;h-=k.rich?.5:.75,i++)F.on(uc-h,top+i*.25,uc+h,top+i*.25+.25,.5,c,'ped')}
   if(k.head==='seg'){const R=k.rich?[hw-.25,hw-.5,hw-1]:[hw-.25,hw-.75];for(let i=0;i<R.length;i++)if(R[i]>.2)F.on(uc-R[i],top+i*.25,uc+R[i],top+i*.25+.25,.5,c,'ped')}}
  if(k.label){/* a Gothic hood: a pointed drip over a lancet */F.on(u0-a,v1+a,u1+a,v1+a+.25,.5,d,'hood');F.on(uc-.25,v1+a+.25,uc+.25,v1+a+.75,.5,d,'hood');F.on(u0-a-.25,v1-.5,u0-a,v1+a+.25,.5,d,'hood');F.on(u1+a,v1-.5,u1+a+.25,v1+a+.25,.5,d,'hood')}
  return top},
 /* a blank bay made to look intended: the same frame as its neighbours round a sunk panel; a niche has an arched head */
 blind(F,o,k){k=k||{};if(F.far)return;const c=k.c||PAL.trim,d=k.deep||PAL.deep,{u0,u1,v0,v1}=o,uc=(u0+u1)/2,w=u1-u0,h=v1-v0;P.surround(F,o,k);
  if(w<1.25||h<1.5){F.on(u0+.25,v0+.25,u1-.25,v1-.25,.25,PAL.rust,'blind');return}
  if(k.niche&&h>=3){const r=(w-.5)/2,sp=v1-.25-r;F.on(u0+.25,v0+.25,u1-.25,sp,.25,PAL.rust,'blind');for(let x=u0+.25;x<u1-.25;x+=.25){const dx=Math.abs(x+.125-uc),t=Math.sqrt(Math.max(0,r*r-dx*dx));const top=Math.round((sp+t)*4)/4;if(top>sp)F.on(x,sp,x+.25,top,.25,PAL.rust,'blind')}
    F.on(uc-.25,v0+.25,uc+.25,v0+.75,.5,d,'blind')}
  else{F.on(u0+.25,v0+.25,u1-.25,v1-.25,.25,PAL.rust,'blind');if(h>=3&&w>=1.5)F.on(uc-.25,(v0+v1)/2-.5,uc+.25,(v0+v1)/2+.5,.5,d,'blind')}},
 pilaster(F,uc,v0,v1,k){k=k||{};const w=(k.w||1)/2,pr=k.proud||.5,c=k.c||PAL.trim,d=k.deep||PAL.deep;if(v1-v0<1.5)return;
  if(F.far){F.on(uc-Math.max(.5,w),v0,uc+Math.max(.5,w),v1,.5,c,'pshaft');return}
  F.on(uc-w-.25,v0,uc+w+.25,v0+.5,pr+.25,d,'pbase');F.on(uc-w,v0+.5,uc+w,v1-.5,pr,c,'pshaft');
  F.on(uc-w-.25,v1-.5,uc+w+.25,v1-.25,pr+.25,c,'pcap');F.on(uc-w-.5,v1-.25,uc+w+.5,v1,pr+.5,d,'pcap');
  if(k.panel&&v1-v0>=4){const m=Math.round((v0+v1)/2*4)/4;F.on(uc-.25,m-.75,uc+.25,m+.75,pr+.25,d,'ppanel')}
  if(k.flute&&w>=.5&&v1-v0>=5){F.on(uc-w,v0+1,uc-w+.25,v1-1.25,pr+.25,d,'pflute');F.on(uc+w-.25,v0+1,uc+w,v1-1.25,pr+.25,d,'pflute')}},
 strip(F,uc,v0,v1,k){k=k||{};const w=(k.w||.75)/2;if(v1-v0<1)return;if(F.far&&!k.keep)return;F.on(uc-w,v0,uc+w,v1,F.far?.5:(k.proud||.25),k.c||PAL.trim,'strip')},
 quoins(F,ua,ub,v0,v1,k){k=k||{};const c=k.c||PAL.trim;if(F.far){F.on(ua,v0,ub,v1,.5,c,'quoin');return}let i=0;for(let v=v0;v+.75<=v1;v+=1,i++){const sh=i%2?.25:0;F.on(k.right?ua+sh:ua,v,k.right?ub:ub-sh,v+.75,.25,c,'quoin')}},
 console(F,uc,vt,proj,k){if(F.far)return;const c=(k&&k.c)||PAL.deep,h=(k&&k.h)||1,n=Math.max(1,Math.round(h*4));for(let i=0;i<n;i++){const p=Math.round(proj*(1-i/n)*4)/4;if(p<.25)break;F.on(uc-.25,vt-(i+1)*.25,uc+.25,vt-i*.25,p,c,'cons')}},
 /* a railing in face space, between wa and wb out from the wall. kind 'balus' turned balusters, 'open' posts under a rail */
 rail(F,u0,u1,v0,wa,wb,k){k=k||{};const h=k.h||1,c=k.c||PAL.trim,d=k.deep||PAL.deep,kind=k.kind||'balus';if(u1-u0<.5)return;
  if(F.far){F.box(u0,v0,wa,u1,v0+h,wb,c,'rail',true);return}
  F.box(u0,v0+h-.25,wa,u1,v0+h,wb,d,'rail',true);if(kind==='none')return;const wm=(wa+wb)/2,m0=Math.round((wm-.125)*4)/4,st=k.step||(kind==='balus'?.75:1);
  for(let u=u0+.25;u+.25<=u1+.01;u+=st)F.box(u,v0,m0,u+.25,v0+h-.25,m0+.25,c,'bal',true)},
 die(F,uc,v0,wa,wb,k){k=k||{};const h=k.h||1,c=k.c||PAL.trim;if(F.far)return;F.box(uc-.5,v0,wa,uc+.5,v0+h,wb,c,'die',true);if(!F.far)F.box(uc-.75,v0+h,wa,uc+.75,v0+h+.25,wb,PAL.deep,'die',true)},
 /* a buttress: a deep lower stage, a set-off, a slimmer upper stage, a weathered top */
 buttress(F,uc,v0,v1,k){k=k||{};const c=k.c||PAL.trim,d=k.deep||PAL.deep,m=Math.round((v0+(v1-v0)*.55)*4)/4;if(F.far){F.on(uc-.5,v0,uc+.5,v1-.5,1,c,'butt');return}
  F.on(uc-.5,v0,uc+.5,v0+.5,1.25,d,'butt');F.on(uc-.5,v0+.5,uc+.5,m,1,c,'butt');F.on(uc-.5,m,uc+.5,m+.25,.75,d,'butt');F.on(uc-.5,m+.25,uc+.5,v1-.5,.5,c,'butt');F.on(uc-.5,v1-.5,uc+.5,v1-.25,.25,d,'butt')},
 /* a door case. It frames the opening and never narrows it. grand: wide jambs and a curved head */
 /* v20: a glazed door onto a balcony. Jambs to the floor, a threshold, a frieze, a hood on two consoles and a key. */
 balconyDoor(F,g,k){k=k||{};const c=k.c||PAL.trim,d=k.deep||PAL.deep,uc=(g.u0+g.u1)/2;
  if(F.far){F.on(g.u0-.5,g.v1,g.u1+.5,g.v1+1,.5,d,'case');return}
  F.on(g.u0-.5,g.v0,g.u0,g.v1,.25,c,'case');F.on(g.u1,g.v0,g.u1+.5,g.v1,.25,c,'case');F.on(g.u0-.5,g.v1,g.u1+.5,g.v1+.5,.25,c,'case');
  F.on(g.u0-.5,g.v1+.5,g.u1+.5,g.v1+.75,.25,d,'case');F.on(g.u0-.75,g.v1+.75,g.u1+.75,g.v1+1,.75,d,'case');F.on(g.u0-.5,g.v1+1,g.u1+.5,g.v1+1.25,.5,c,'case');
  for(const u of[g.u0-.5,g.u1+.25]){F.on(u,g.v1,u+.25,g.v1+.75,.5,d,'case');F.on(u,g.v1-.5,u+.25,g.v1,.25,d,'case')}
  F.on(uc-.25,g.v1,uc+.25,g.v1+.75,.5,d,'key');F.on(g.u0-.5,g.v0,g.u0-.25,g.v0+.5,.5,d,'case');F.on(g.u1+.25,g.v0,g.u1+.5,g.v0+.5,.5,d,'case')},
 doorcase(F,g,k){k=k||{};const c=k.c||PAL.trim,d=k.deep||PAL.deep,uc=(g.u0+g.u1)/2,w=g.u1-g.u0;
  if(F.far){F.on(g.u0-.5,g.v1,g.u1+.5,g.v1+1,.5,d,'case');return}
  if(k.grand){F.on(g.u0-.75,g.v0,g.u0,g.v1,.5,c,'case');F.on(g.u1,g.v0,g.u1+.75,g.v1,.5,c,'case');F.on(g.u0-.75,g.v1,g.u1+.75,g.v1+.75,.5,c,'case');F.on(g.u0-1,g.v1+.75,g.u1+1,g.v1+1.25,1,d,'case');
   const hw=w/2+.75,R=[hw,hw-.25,hw-.75,hw-1.5,hw-2.5];for(let i=0;i<R.length;i++)if(R[i]>.3)F.on(uc-R[i],g.v1+1.25+i*.25,uc+R[i],g.v1+1.5+i*.25,.75,c,'case');F.on(uc-.5,g.v1+.25,uc+.5,g.v1+1.75,1.25,d,'key')}
  else{const j=k.jamb||.5;F.on(g.u0-j,g.v0,g.u0,g.v1,.25,c,'case');F.on(g.u1,g.v0,g.u1+j,g.v1,.25,c,'case');F.on(g.u0-j,g.v1,g.u1+j,g.v1+.5,.25,c,'case');
   if(k.hood!==false){F.on(g.u0-j-.25,g.v1+.5,g.u1+j+.25,g.v1+.75,.75,d,'case');P.console(F,g.u0-j+.25,g.v1+.5,.5,{h:.75});P.console(F,g.u1+j-.25,g.v1+.5,.5,{h:.75})}
   if(k.arch){const r=w/2+j;for(let x=uc-r;x<uc+r;x+=.25){const dx=Math.abs(x+.125-uc),t=Math.round(Math.sqrt(Math.max(0,r*r-dx*dx))*.5*4)/4;if(t>0)F.on(x,g.v1+.75,x+.25,g.v1+.75+t,.5,c,'case')}F.on(uc-.25,g.v1+.25,uc+.25,g.v1+1.25,.75,d,'key')}}
  if(g.m)for(const o of g.m)if(!o.door)F.on(o.u0-(o.u0===g.u0?.75:0),o.v0-.5,o.u1+(o.u1===g.u1?.75:0),o.v0,.5,d,'sill')}};

/* ---------- pieces in the world (roofline, porticos) ---------- */
const W={
 obelisk(S,x,y,z,k){k=k||{};const b=k.b||1,h=k.h||2.5,c=k.c||PAL.trim,u=S.unit;if(u>=.5){const s=b>=1.5?.5:.25;S.wbox(x-s,y,z-s,x+s,y+Math.round(h*2)/2,z+s,c,'fin');return}
  S.wbox(x-b/2-.25,y,z-b/2-.25,x+b/2+.25,y+.25,z+b/2+.25,PAL.deep,'fin');const n=Math.max(1,Math.round(b/2/.25));for(let i=0;i<n;i++){const s=b/2-i*.25,y0=y+.25+Math.round(h*i/n*4)/4,y1=y+.25+Math.round(h*(i+1)/n*4)/4;S.wbox(x-s,y0,z-s,x+s,y1,z+s,c,'fin')}
  if(k.ball)S.wbox(x-.25,y+.25+h,z-.25,x+.25,y+.75+h,z+.25,k.gold?PAL.gold:PAL.deep,'fin')},
 ball(S,x,y,z,k){const c=(k&&k.c)||PAL.trim;if(S.unit>=.5||(k&&k.plain)){S.wbox(x-.5,y,z-.5,x+.5,y+1,z+.5,c,'fin');return}S.wbox(x-.25,y,z-.25,x+.25,y+.25,z+.25,PAL.deep,'fin');S.wbox(x-.5,y+.25,z-.5,x+.5,y+1,z+.5,c,'fin');S.wbox(x-.25,y+1,z-.25,x+.25,y+1.25,z+.25,c,'fin')},
 urn(S,x,y,z,k){const c=(k&&k.c)||PAL.trim;if(S.unit>=.5){S.wbox(x-.5,y,z-.5,x+.5,y+1.5,z+.5,c,'urn');return}S.wbox(x-.5,y,z-.5,x+.5,y+.25,z+.5,PAL.deep,'urn');S.wbox(x-.25,y+.25,z-.25,x+.25,y+.5,z+.25,c,'urn');S.wbox(x-.5,y+.5,z-.5,x+.5,y+1.25,z+.5,c,'urn');S.wbox(x-.75,y+1.25,z-.75,x+.75,y+1.5,z+.75,PAL.deep,'urn');S.wbox(x-.25,y+1.5,z-.25,x+.25,y+2,z+.25,c,'urn')},
 cross(S,x,y,z,ax,k){const c=(k&&k.c)||PAL.trim;S.wbox(x-.25,y,z-.25,x+.25,y+2.5,z+.25,c,'fin');if(ax==='x')S.wbox(x-.75,y+1.5,z-.25,x+.75,y+2,z+.25,c,'fin');else S.wbox(x-.25,y+1.5,z-.75,x+.25,y+2,z+.75,c,'fin')},
 column(S,x,y0,y1,z,k){k=k||{};const d=k.d||1.5,c=k.c||PAL.trim,r=d/2;if(S.unit>=.5){S.wbox(x-r,y0,z-r,x+r,y1,z+r,c,'cshaft');return}
  S.wbox(x-r-.25,y0,z-r-.25,x+r+.25,y0+.5,z+r+.25,PAL.deep,'cbase');S.wbox(x-r-.25,y1-.5,z-r-.25,x+r+.25,y1,z+r+.25,PAL.deep,'ccap');
  if(k.sq){S.wbox(x-r,y0+.5,z-r,x+r,y1-.5,z+r,c,'cshaft');if(k.panel)for(const s of[-1,1])S.wbox(x-.25,(y0+y1)/2-1.5,z+s*r-(s<0?.25:0),x+.25,(y0+y1)/2+1.5,z+s*r+(s>0?.25:0),PAL.deep,'cshaft')}
  else{S.wbox(x-r,y0+.5,z-r+.5,x+r,y1-.5,z+r-.5,c,'cshaft');S.wbox(x-r+.5,y0+.5,z-r,x+r-.5,y1-.5,z+r,c,'cshaft');S.wbox(x-r+.25,y0+.5,z-r+.25,x+r-.25,y1-.5,z+r-.25,c,'cshaft')}},
 /* a railing along world x or z at p */
 rail(S,ax,a0,a1,y,p,k){k=k||{};const h=k.h||1,c=k.c||PAL.trim,d=PAL.deep,kind=k.kind||'open';if(a1-a0<.5)return;const B=(u0,v0,u1,v1,w0,w1,col)=>ax==='x'?S.wbox(u0,v0,p+w0,u1,v1,p+w1,col,'bal'):S.wbox(p+w0,v0,u0,p+w1,v1,u1,col,'bal');
  if(S.unit>=.5){B(a0,y,a1,y+h,-.25,.25,c);return}B(a0,y+h-.25,a1,y+h,-.25,.25,d);const st=k.step||(kind==='balus'?.75:1);for(let u=a0+.25;u+.25<=a1+.01;u+=st)B(u,y,u+.25,y+h-.25,-.125,.125,c)},
 /* a flat shaped piece standing along x (or z): prof(dx) gives the height above y at distance dx from the centre */
 shaped(S,ax,c0,hw,y,p0,p1,prof,c,p){const q=S.q;for(let i=-Math.round(hw*q);i<Math.round(hw*q);i++){const dx=Math.abs((i+.5)/q),h=prof(dx);if(h<=0)continue;const a=c0+i/q,b=c0+(i+1)/q,t=y+Math.round(h*q)/q;if(ax==='x')S.wbox(a,y,p0,b,t,p1,c,p||'gable');else S.wbox(p0,y,a,p1,t,b,c,p||'gable')}},
 /* an eight-sided ogee cap, coarse */
 ogee(S,cx,y,cz,R,H,k){const u=S.unit,n=Math.round(H/u),c1=(k&&k.c)||PAL.lead,c2=(k&&k.c2)||PAL.leadD;for(let i=0;i<n;i++){const t=(i+.5)/n;let r;if(t<.5)r=R*(.55+.45*Math.sqrt(1-4*t*t));else{const s=2-2*t;r=R*.55*(1-Math.sqrt(1-s*s))}r=Math.max(u,Math.round(r/u)*u);const ch=Math.round(r*.3/u)*u;
   S.wbox(cx-r,y+i*u,cz-r+ch,cx+r,y+i*u+u,cz+r-ch,i%3===2?c2:c1,'roof');S.wbox(cx-r+ch,y+i*u,cz-r,cx+r-ch,y+i*u+u,cz+r,i%3===2?c2:c1,'roof')}}};

/* ---------- meshing: cut a skin into pieces no more than 64 blocks across ---------- */
function concat(a,b){if(!a)return b;if(!b)return a;const n=a.pos.length/3,pos=new Float32Array(a.pos.length+b.pos.length),col=new Float32Array(pos.length),nor=new Float32Array(pos.length),index=new Uint32Array(a.index.length+b.index.length);
  pos.set(a.pos);pos.set(b.pos,a.pos.length);col.set(a.col);col.set(b.col,a.col.length);nor.set(a.nor);nor.set(b.nor,a.nor.length);index.set(a.index);for(let i=0;i<b.index.length;i++)index[a.index.length+i]=b.index[i]+n;return{pos,col,nor,index,quads:a.quads+b.quads}}
function mesh(skin,size,ox,oz){size=size||64;const cells=size/skin.unit,sub=Math.round(32/skin.unit),subs=new Map(),out=new Map(),fl=Math.floor,ax=Math.round((ox||0)/skin.unit),az=Math.round((oz||0)/skin.unit);
  /* meshed in 32-block cubes so the mesher never scans empty space; each cube borrows its neighbours' edge cells as stubs, so nothing is drawn where two cubes meet */
  const put=(sx,sy,sz,v,stub)=>{const k=sx+'_'+sy+'_'+sz;let m=subs.get(k);if(!m)subs.set(k,m={V:new Map(),pk:fl((sx*sub-ax)/cells)+'_'+fl((sz*sub-az)/cells)});const key=KEY(v[0],v[1],v[2]);if(stub){if(!m.V.has(key))m.V.set(key,[v[0],v[1],v[2],STUB,'stub'])}else m.V.set(key,v)};
  for(const v of skin.V.values()){const sx=fl(v[0]/sub),sy=fl(v[1]/sub),sz=fl(v[2]/sub);put(sx,sy,sz,v,false)}
  for(const v of skin.V.values()){const sx=fl(v[0]/sub),sy=fl(v[1]/sub),sz=fl(v[2]/sub),mx=v[0]-sx*sub,my=v[1]-sy*sub,mz=v[2]-sz*sub;if(mx===0)put(sx-1,sy,sz,v,true);else if(mx===sub-1)put(sx+1,sy,sz,v,true);if(my===0)put(sx,sy-1,sz,v,true);else if(my===sub-1)put(sx,sy+1,sz,v,true);if(mz===0)put(sx,sy,sz-1,v,true);else if(mz===sub-1)put(sx,sy,sz+1,v,true)}
  for(const m of subs.values()){let real=false;for(const v of m.V.values())if(v[4]!=='stub'){real=true;break}if(!real)continue;const g=strip(TREES.mesh({V:m.V,unit:skin.unit})),h=skin.unit/2;if(!g.quads)continue;for(let i=0;i<g.pos.length;i+=3){g.pos[i]+=h;g.pos[i+2]+=h}out.set(m.pk,concat(out.get(m.pk),g))}return out}
/* drop the faces of the wall stubs (they exist only so the mesher hides what touches the wall) */
function strip(m){const n=m.pos.length/12,keep=[];for(let i=0;i<n;i++){const r=m.col[i*12],g=m.col[i*12+1],b=m.col[i*12+2];if(r<.006&&g<.012&&b<.014)continue;keep.push(i)}if(keep.length===n)return m;
  const pos=new Float32Array(keep.length*12),col=new Float32Array(keep.length*12),nor=new Float32Array(keep.length*12),index=new Uint32Array(keep.length*6);keep.forEach((q,i)=>{pos.set(m.pos.subarray(q*12,q*12+12),i*12);col.set(m.col.subarray(q*12,q*12+12),i*12);nor.set(m.nor.subarray(q*12,q*12+12),i*12);for(let k=0;k<6;k++)index[i*6+k]=m.index[q*6+k]-q*4+i*4});return{pos,col,nor,index,quads:keep.length}}

/* ---------- one piece on its own ---------- */
function build(kind,o){o=o||{};const S=new Skin(o.lod==='far'?.5:.25),len=o.len||o.w||4,F=new Face(S,{axis:'x',o:0,f:0,n:1,L:Math.max(8,len+6),H:Math.max(16,(o.h||6)+8)}),u=3,v=2;
  if(kind==='pilaster')P.pilaster(F,u+1,v,v+(o.h||9),o);
  else if(kind==='cornice'){F.on(u,v,u+len,v+.5,.5,PAL.trim,'corn');F.on(u,v+.5,u+len,v+.75,.75,PAL.trim,'corn');F.on(u,v+.75,u+len,v+1.25,1,PAL.deep,'corn');if(o.dentils&&!F.far)for(let x=u+.25;x+.25<=u+len;x+=.75)F.on(x,v+.25,x+.25,v+.5,.75,PAL.deep,'dentil')}
  else if(kind==='window'||kind==='blind'){const op={u0:u,u1:u+(o.w||2),v0:v+1.5,v1:v+1.5+(o.h||4)};if(kind==='window'){F.opening(op);P.surround(F,op,{sill:o.sill!==false,head:o.head||'hood',key:o.key,apron:o.apron})}else P.blind(F,op,{sill:true,head:o.head||'hood',niche:o.niche})}
  else if(kind==='sill')F.on(u,v,u+(o.w||2)+1.5,v+.5,.5,PAL.deep,'sill');
  else if(kind==='base'){F.on(u,v,u+len,v+.75,.5,PAL.deep,'plinth');for(let y=v+.75;y+.75<=v+5;y+=1)F.on(u,y,u+len,y+.75,.25,PAL.rust,'rust')}
  else if(kind==='balcony'){F.on(u,v+1,u+len,v+1.5,1.5,PAL.deep,'balc');F.on(u,v+.75,u+len,v+1,1,PAL.trim,'balc');P.console(F,u+.5,v+.75,1,{h:1});P.console(F,u+len-.5,v+.75,1,{h:1});P.rail(F,u,u+len,v+1.5,1,1.5,{kind:o.kind||'open'})}
  else if(kind==='balustrade')P.rail(F,u,u+len,v,0,.5,{kind:o.kind||'balus',h:o.h||1});
  else if(kind==='door'){const g={u0:u,u1:u+(o.w||3),v0:v,v1:v+(o.h||6)};F.opening(g);P.doorcase(F,g,{grand:o.grand,arch:o.arch})}
  else if(kind==='obelisk')W.obelisk(S,u,v,1,o);else if(kind==='urn')W.urn(S,u,v,1,o);else if(kind==='column')W.column(S,u,v,v+(o.h||9),1,o);
  else throw new Error('ORNAMENT.build: unknown kind '+kind);
  let x0=1e9,y0=1e9,z0=1e9,x1=-1e9,y1=-1e9,z1=-1e9;const cover=new Set();for(const c of S.V.values()){if(c[4]==='stub')continue;x0=Math.min(x0,c[0]);x1=Math.max(x1,c[0]);y0=Math.min(y0,c[1]);y1=Math.max(y1,c[1]);z0=Math.min(z0,c[2]);z1=Math.max(z1,c[2]);if(c[2]===0)cover.add(Math.floor(c[0]*S.unit)+','+Math.floor(c[1]*S.unit))}
  const V=new Map();for(const c of S.V.values()){if(c[4]==='stub')continue;const n=[c[0]-x0,c[1]-y0,c[2],c[3],c[4]];V.set(n[0]+','+n[1]+','+n[2],n)}
  const r={V,unit:S.unit,size:[(x1-x0+1)*S.unit,(y1-y0+1)*S.unit,(z1+1)*S.unit],depth:(z1+1)*S.unit,cover:[...cover].map(s=>s.split(',').map(Number))};r.quads=typeof TREES!=='undefined'?TREES.mesh(r).quads:null;return r}
function geometry(THREE,m){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(m.pos,3));g.setAttribute('color',new THREE.BufferAttribute(m.col,3));g.setAttribute('normal',new THREE.BufferAttribute(m.nor,3));g.setIndex(new THREE.BufferAttribute(m.index,1));g.computeBoundingSphere();g.userData.quads=m.quads;return g}
const KINDS=['pilaster','cornice','window','blind','sill','base','balcony','balustrade','door','obelisk','urn','column'];
return{PAL,STUB,KEY,Skin,Face,P,W,mesh,concat,glazeMesh,build,geometry,KINDS}})();
if(typeof module!=='undefined')module.exports=ORNAMENT;
