/* =========================================================
   Euphrates Hall Parts Depot: trees.js v2 (Depot v20, Nov 13, 2026; v1 was Depot v13)
   v20 adds six species. Hero trees, half as large again and a branch order finer: greatOak, greatCedar, greatBeech (TREES.HERO).
   Spring trees: cherry (pink before the leaves), chestnut (white candles in May), and beech (TREES.SPRING lists the flowering ones).
   The five first species grow exactly as before, seed for seed.
   The tree kit. Five species grown from a seed: English oak, Italian cypress,
   cedar of Lebanon, weeping willow, olive. Each has a real trunk with a root
   flare, branching limbs (three orders) and a layered, lobed canopy.

   Plain script. No imports, no network. three.js is passed in where needed.
   Same voxel format as props.js: a Map "x,y,z" -> [x,y,z,colour,part].
   Three levels from one seed: hero (unit .25, 4 voxels a block, as props.js trees), near (unit .5),
   far (unit 1, or 1.5 for the big oak and cedar). Parts: 'b' bark, 'leaf' foliage (seasons.js drops,
   turns and snows these). One unit is one Estate block; origin is the foot of the trunk, y up.

   TREES.build(species,{seed,lod})                  -> {V,unit,size,kind,info,count,season}; lod 'hero'|'near'|'far'
   TREES.mesh(r)                                    -> {pos,col,nor,index,quads}, greedy-merged, light baked as PROPS.faces
   TREES.geometry(THREE,species,{seed,lod,st})      -> cached BufferGeometry; st is SEASONS.state(date), optional
   TREES.object(THREE,species,{seed,st,hero,far})   -> THREE.LOD with the three levels, tagged userData.k 'tree'
   TREES.forest(THREE,list,{variants,hero,far,st})  -> an instanced grove, see the end of the file
   ========================================================= */
const TREES=(()=>{
const U=.25;
function rng(seed){let s=((seed*2654435761)>>>0)||1;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296}}
function h3(x,y,z,s){let h=(x*374761393+y*668265263+z*2147483647+(s|0)*144665)|0;h=Math.imul(h^(h>>>13),1274126177);h^=h>>>16;return(h>>>0)/4294967296}
const add=(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]],mul=(a,s)=>[a[0]*s,a[1]*s,a[2]*s],len=a=>Math.hypot(a[0],a[1],a[2]),norm=a=>{const l=len(a)||1;return[a[0]/l,a[1]/l,a[2]/l]};
/* a direction tilted `tilt` radians off `d`, turned `az` around it */
function tiltDir(d,tilt,az){d=norm(d);const up=Math.abs(d[1])<.95?[0,1,0]:[1,0,0];let a=norm([d[1]*up[2]-d[2]*up[1],d[2]*up[0]-d[0]*up[2],d[0]*up[1]-d[1]*up[0]]);const b=[d[1]*a[2]-d[2]*a[1],d[2]*a[0]-d[0]*a[2],d[0]*a[1]-d[1]*a[0]];
  const c=Math.cos(tilt),s=Math.sin(tilt),ca=Math.cos(az),sa=Math.sin(az);return norm([d[0]*c+(a[0]*ca+b[0]*sa)*s,d[1]*c+(a[1]*ca+b[1]*sa)*s,d[2]*c+(a[2]*ca+b[2]*sa)*s])}
const fromAngles=(elev,az)=>[Math.cos(elev)*Math.cos(az),Math.sin(elev),Math.cos(elev)*Math.sin(az)];

function grid(){const V=new Map();
  const put=(x,y,z,c,p)=>{x=Math.round(x);y=Math.round(y);z=Math.round(z);if(y<0)return;const k=x+','+y+','+z;const o=V.get(k);if(o&&o[4]==='b'&&p==='leaf')return;V.set(k,[x,y,z,c,p])};
  return{V,put}}

/* ---------- bark ---------- */
function barkFn(B,seed,mode){return(x,y,z)=>{const n=h3(x,z,mode==='twist'?((y+x)>>2):(y>>2),seed);return n<.24?B[1]:n>.9?B[2]:B[0]}}
/* a tapered limb from a to b, radius r0 to r1, filled solid */
function limb(g,a,b,r0,r1,bark){const L=len([b[0]-a[0],b[1]-a[1],b[2]-a[2]]),n=Math.max(1,Math.ceil(L/.5));
  for(let i=0;i<=n;i++){const t=i/n,c=[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t],r=r0+(r1-r0)*t;
    if(r<.75){g.put(c[0],c[1],c[2],bark(Math.round(c[0]),Math.round(c[1]),Math.round(c[2])),'b');continue}
    const R=Math.ceil(r);for(let x=-R;x<=R;x++)for(let y=-R;y<=R;y++)for(let z=-R;z<=R;z++)if(x*x+y*y+z*z<=r*r+.35){const X=Math.round(c[0]+x),Y=Math.round(c[1]+y),Z=Math.round(c[2]+z);g.put(X,Y,Z,bark(X,Y,Z),'b')}}}
/* a crooked limb: several short pieces with bends, gravity and light */
function crooked(g,r,a,dir,L,r0,r1,bark,o){const parts=o.kinks||3;let p=a,d=dir;
  for(let i=0;i<parts;i++){const t0=i/parts,t1=(i+1)/parts;d=tiltDir(d,(r()-.5)*2*(o.bend||.3),r()*6.283);d=norm(add(d,[0,(o.lift||0)-(o.droop||0)*t1,0]));
    const q=add(p,mul(d,L/parts));limb(g,p,q,r0+(r1-r0)*t0,r0+(r1-r0)*t1,bark);p=q}return{end:p,dir:d}}
/* recursive branching; leaves a list of tips */
function branch(g,r,a,dir,L,rad,depth,S,tips,bark){const e=crooked(g,r,a,dir,L,rad,rad*S.taper,bark,S);
  if(depth<=0||rad*S.taper<.45){tips.push({p:e.end,d:e.dir,depth});return}
  const n=S.forks[0]+(r()<(S.p3==null?.5:S.p3)?S.forks[1]-S.forks[0]:0),az0=r()*6.283;
  for(let i=0;i<n;i++){const nd=tiltDir(e.dir,S.spread*(.7+r()*.6),az0+i/n*6.283+(r()-.5)*.8);
    branch(g,r,e.end,norm(add(nd,[0,S.up||0,0])),L*S.decay*(.85+r()*.3),rad*S.taper*S.radDecay,depth-1,S,tips,bark)}
  if(S.midTip&&depth<=2)tips.push({p:add(a,mul(dir,L*.6)),d:dir,depth:depth,mid:true})}
/* a lobed foliage clump, solid inside so hidden faces cull away */
function clump(g,cx,cy,cz,rx,ry,rz,seed,lob){const X=Math.ceil(rx),Y=Math.ceil(ry),Z=Math.ceil(rz);lob=lob==null?.28:lob;
  for(let x=-X;x<=X;x++)for(let y=-Y;y<=Y;y++)for(let z=-Z;z<=Z;z++){const q=x*x/(rx*rx)+y*y/(ry*ry)+z*z/(rz*rz);if(q>1)continue;
    const X2=Math.round(cx+x),Y2=Math.round(cy+y),Z2=Math.round(cz+z);if(q>1-lob&&h3(X2>>1,Y2>>1,Z2>>1,seed)<.55*((q-(1-lob))/lob)+.05)continue;g.put(X2,Y2,Z2,'#000','leaf')}}
/* shade every leaf after growth: lit tops, darker undersides and core, low-frequency mottling so faces still merge */
function shade(V,G,seed,o={}){let y0=1e9,y1=-1e9;for(const v of V.values())if(v[4]==='leaf'){y0=Math.min(y0,v[1]);y1=Math.max(y1,v[1])}const H=Math.max(1,y1-y0),has=(x,y,z)=>V.has(x+','+y+','+z);
  for(const v of V.values()){if(v[4]!=='leaf')continue;const[x,y,z]=v;const up=!has(x,y+1,z),dn=!has(x,y-1,z);
    let s=.45*(y-y0)/H+(up?.32:0)-(dn?.18:0)+.32*(h3(x>>1,y>>1,z>>1,seed+7)-.5)+(o.bias||0);const i=Math.max(0,Math.min(G.length-1,Math.floor((s+.12)*G.length)));v[3]=G[i]}}
/* roots spreading at the base */
function roots(g,r,n,R,len0,bark){for(let i=0;i<n;i++){const az=i/n*6.283+r()*.6,d=[Math.cos(az),0,Math.sin(az)],L=len0*(.7+r()*.6);limb(g,[d[0]*R*.6,2.2,d[2]*R*.6],[d[0]*(R+L),0,d[2]*(R+L)],1.6,.5,bark)}}
/* trunk: a tapered column with a slight lean and flare */
function trunk(g,r,H,r0,r1,bark,lean){let p=[0,0,0],d=norm([lean[0],1,lean[1]]);const n=Math.max(2,Math.round(H/6));
  for(let i=0;i<n;i++){const t0=i/n,t1=(i+1)/n,q=add(p,mul(norm(add(d,[(r()-.5)*.12,0,(r()-.5)*.12])),H/n));const fl=t0===0?1.35:1;limb(g,p,q,(r0+(r1-r0)*t0)*fl,r0+(r1-r0)*t1,bark);p=q}return p}

/* ================= species ================= */
const SP={};
SP.oak={label:'English oak',where:'The park, the avenue, the lawn below the house',season:{},
  bark:['#4a3b2a','#33281d','#62503a'],leaf:['#2c4a1f','#365a24','#41692b','#4f7a33','#5f8a3c'],
  grow(g,r,seed,G){G=G||1;const big=G>1.3,s=(.9+r()*.25)*G,bark=barkFn(this.bark,seed);roots(g,r,big?8:5,3*G,5*G,bark);const top=trunk(g,r,15*s,3.4*s,2.5*s,bark,[(r()-.5)*.15,(r()-.5)*.15]);
    const tips=[],S={forks:[2,3],spread:.62,decay:.66,taper:.72,radDecay:.86,kinks:3,bend:.32,lift:.05,droop:.25,up:.02};const n=4+Math.floor(r()*2)+(big?2:0),az0=r()*6.283;
    for(let i=0;i<n;i++){const az=az0+i/n*6.283+(r()-.5)*.5,el=.55+r()*.45;branch(g,r,add(top,[0,-r()*3*G,0]),fromAngles(el,az),(13+r()*5)*s,2.3*s,3,S,tips,bark)}
    if(big){/* a veteran: two great low boughs reaching out level, and one dead stag-headed limb above the crown */for(let i=0;i<2;i++){const az=az0+1.1+i*3.1+(r()-.5)*.4;branch(g,r,[top[0]*.6,top[1]*.62,top[2]*.6],fromAngles(.12+r()*.1,az),(13+r()*3)*s,2.6*s,2,Object.assign({},S,{lift:.02,droop:.12}),tips,bark)}crooked(g,r,add(top,[0,6*s,0]),fromAngles(1.05,az0+2),15*s,1.3*s,.5,bark,{kinks:3,bend:.3,lift:.05})}
    const ks=big?.74:1;for(const t of tips){const bg=(t.mid?.75:t.depth===0?1:.8)*ks;clump(g,t.p[0],t.p[1]+1.5,t.p[2],(4.6+r()*1.6)*bg*s,(3.2+r()*1.1)*bg*s,(4.6+r()*1.6)*bg*s,seed+11,big?.36:undefined)}
    clump(g,top[0],top[1]+11*s,top[2],10*s,5.5*s,10*s,seed+12);shade(g.V,this.leaf,seed)}};
SP.cypress={lods:{far:{unit:1,F:4,leaf:16,bark:12,shades:2,smooth:2}},label:'Italian cypress',where:'Paired at gates, along the terrace walk, framing the chapel',season:{evergreen:true},
  bark:['#5a4634','#43342a','#6e5a44'],leaf:['#17301d','#1d3a24','#24452b','#2c5233','#365e3c'],
  grow(g,r,seed){const s=.9+r()*.22,H=Math.round(46*s),Rm=4.6*s,bark=barkFn(this.bark,seed);limb(g,[0,0,0],[0,5,0],1.6,1.2,bark);const lx=(r()-.5)*.06,lz=(r()-.5)*.06,ph=r()*6.283;
    for(let y=3;y<=H;y++){const t=(y-3)/(H-3),f=Math.min(1,t*4.5)*Math.pow(1-t,.75)*1.08,cx=lx*y,cz=lz*y,R=Rm*f+.6;const RR=Math.ceil(R)+1;
      for(let x=-RR;x<=RR;x++)for(let z=-RR;z<=RR;z++){const a=Math.atan2(z,x),d=Math.hypot(x,z),rj=R*(1+.13*Math.sin(a*5+ph+y*.09)+.12*(h3(Math.round(a*3),y>>2,0,seed)-.5));if(d>rj)continue;
        if(d>rj-1.2&&Math.sin(a*9+ph+y*.05)>.55&&h3(x,y>>1,z,seed)<.7)continue;g.put(cx+x,y,cz+z,'#000','leaf')}}
    g.put(lx*(H+1),H+1,lz*(H+1),'#000','leaf');shade(g.V,this.leaf,seed,{bias:-.04})}};
SP.cedar={label:'Cedar of Lebanon',where:'The great lawns, one or two to a lawn, as at the old English houses',season:{evergreen:true},
  bark:['#5a4632','#3f3125','#6f5a44'],leaf:['#1e3a2c','#244434','#2b4f3c','#335a45','#3d664f'],
  grow(g,r,seed,G){G=G||1;const big=G>1.3,s=(.92+r()*.2)*G,bark=barkFn(this.bark,seed);roots(g,r,big?7:5,3*G,4.5*G,bark);const H=40*s,top=trunk(g,r,H,3.6*s,1.3*s,bark,[(r()-.5)*.12,(r()-.5)*.12]);
    const tiers=big?7:6,tips=[];for(let t=0;t<tiers;t++){const f=t/(tiers-1),y=(9*G+f*(H-11*G)),L=(25-f*17)*s*(.9+r()*.2),n=t===tiers-1?3:4+Math.floor(r()*2),az0=r()*6.283,c=[top[0]*y/H,y,top[2]*y/H];
      for(let i=0;i<n;i++){const az=az0+i/n*6.283+(r()-.5)*.6,el=.08+r()*.16-(f<.3?.05:0);const e=crooked(g,r,c,fromAngles(el,az),L,(1.8-f*.9)*s,.6,bark,{kinks:3,bend:.14,lift:.04});
        tips.push({p:e.end,w:1-f*.45});for(let j=0;j<2;j++){const m=.45+j*.25+r()*.1,p=add(c,mul(fromAngles(el,az),L*m)),sd=fromAngles(.04+r()*.1,az+(j?1:-1)*(.9+r()*.4)),q=add(p,mul(sd,L*.32));limb(g,p,q,.8,.5,bark);tips.push({p:q,w:.65-f*.3})}}}
    for(const t of tips){const w=Math.max(.38,t.w);clump(g,t.p[0],t.p[1]+1.2,t.p[2],(7.2*w+1.4)*s*(big?.86:1),(1.7+r()*.7)*(big?1.35:1),(7.2*w+1.4)*s*(big?.86:1),seed+21,.34)}
    clump(g,top[0],(big?H:H*s)+1,top[2],6*s,1.8*(big?1.35:1),6*s,seed+22,.3);shade(g.V,this.leaf,seed,{bias:.02})}};
SP.willow={lods:{far:{unit:1,F:4,leaf:16,bark:12,shades:2,smooth:2}},label:'Weeping willow',where:'The lake shore and the stream banks',season:{},
  bark:['#5b4a36','#43362a','#6f5d47'],leaf:['#5f7f30','#6c8f37','#7a9e40','#8aad4b','#9bbd58'],
  grow(g,r,seed){const s=.9+r()*.2,bark=barkFn(this.bark,seed,'twist');roots(g,r,5,3,4,bark);const lean=[(r()-.5)*.3,(r()-.5)*.3],top=trunk(g,r,11*s,3.3*s,2.6*s,bark,lean);
    const tips=[],S={forks:[2,3],p3:.3,spread:.5,decay:.66,taper:.72,radDecay:.84,kinks:3,bend:.22,lift:.1,droop:.3,up:.05};const n=4+(r()<.5?1:0),az0=r()*6.283;
    for(let i=0;i<n;i++){const az=az0+i/n*6.283+(r()-.5)*.5;branch(g,r,top,fromAngles(1.05+r()*.2,az),(8.5+r()*2.5)*s,2*s,2,S,tips,bark)}
    /* the crown: a domed crust over the limbs, and a thin outer curtain of strands with a ragged hem and openings to see the trunk */
    const SK=new Set();let ty=top[1];for(const t of tips)ty=Math.max(ty,t.p[1]);const Rc=17*s,cx=top[0]*.6,cz=top[2]*.6,y0=top[1]+1,H=ty+4-y0,ph=r()*6.283,R0=Math.ceil(Rc*1.2);
    for(let x=-R0;x<=R0;x++)for(let z=-R0;z<=R0;z++){const a=Math.atan2(z,x),rr=Rc*(1+.1*Math.sin(a*3+ph)+.06*Math.sin(a*7+ph*2)),d=Math.hypot(x,z)/rr;if(d>1)continue;
      const X=Math.round(cx+x),Z=Math.round(cz+z),yt=Math.round(y0+H*Math.pow(1-Math.pow(d,2.4),.55)+2*(h3(X>>1,0,Z>>1,seed)-.5));let yb=yt-3;
      if(d>.84){const gap=Math.sin(a*3+ph)>.78;if(!gap&&h3(X,1,Z,seed)<.9)yb=Math.round(3+(1-d)*12+h3(X,2,Z,seed)*9+(Math.sin(a*13+ph)+1)*2.5)}
      const stripe=d>.84&&h3(X,3,Z,seed)<.35;for(let y=yt;y>=Math.max(1,yb);y--){g.put(X,y,Z,'#000','leaf');if(stripe&&y<yt-3)SK.add(X+','+y+','+Z)}}
    shade(g.V,this.leaf,seed,{bias:.04});const L=this.leaf;for(const k of SK){const v=g.V.get(k);if(v)v[3]=L[Math.min(L.length-1,L.indexOf(v[3])+1)]}}};
SP.olive={lods:{far:{unit:1,F:4,leaf:16,bark:12,shades:2,smooth:2}},label:'Olive',where:'The south terrace, the Orangery court, the kitchen garden walls',season:{evergreen:true},
  bark:['#5a5145','#433d33','#766c5c'],leaf:['#506641','#5e744c','#6d8358','#80956a','#97a982'],
  grow(g,r,seed){const s=.9+r()*.2,bark=barkFn(this.bark,seed,'twist');roots(g,r,6,3.2,3.5,bark);limb(g,[0,0,0],[0,3,0],4.4*s,3.2*s,bark);
    const stems=2+(r()<.5?1:0),az0=r()*6.283,tips=[],S={forks:[2,3],p3:.4,spread:.6,decay:.72,taper:.72,radDecay:.86,kinks:2,bend:.35,lift:.06,droop:.12,up:.03};
    for(let i=0;i<stems;i++){let p=[0,2.5,0],a=az0+i/stems*6.283;const st=3;for(let k=0;k<st;k++){a+=.6;const q=[Math.cos(a)*(1.4+k*1.1)*s,2.5+(k+1)*2.4*s,Math.sin(a)*(1.4+k*1.1)*s];limb(g,p,q,(2.3-k*.3)*s,(2.1-k*.3)*s,bark);p=q}
      const nb=2+(r()<.5?1:0);for(let j=0;j<nb;j++)branch(g,r,p,fromAngles(.7+r()*.45,a+(j-(nb-1)/2)*1.1),(6.5+r()*2.5)*s,1.3*s,2,S,tips,bark)}
    for(const t of tips)clump(g,t.p[0],t.p[1]+1,t.p[2],(3.4+r()*1.2)*s,(2.4+r()*.7)*s,(3.4+r()*1.2)*s,seed+41,.3);
    let cx=0,cy=0,cz=0;for(const t of tips){cx+=t.p[0];cy+=t.p[1];cz+=t.p[2]}const n=tips.length||1;clump(g,cx/n,cy/n+1.5,cz/n,7*s,3.2*s,7*s,seed+42,.3);shade(g.V,this.leaf,seed)}};
/* ---------- v20: the spring trees and the hero trees ---------- */
SP.beech={label:'Beech',where:'The park clumps, the long avenue, the edge of the wood',season:{beech:true},
  bark:['#8d8a80','#75726a','#a09d92'],leaf:['#2f5a22','#3a6a28','#467a2f','#548a37','#639a40'],
  grow(g,r,seed,G){G=G||1;const big=G>1.3,s=(.95+r()*.2)*G,bark=barkFn(this.bark,seed);roots(g,r,big?8:6,3*G,4*G,bark);const H=22*s,top=trunk(g,r,H,3*s,1.6*s,bark,[(r()-.5)*.08,(r()-.5)*.08]);
    const tips=[],S={forks:[2,3],spread:.5,decay:.68,taper:.7,radDecay:.84,kinks:3,bend:.2,lift:.12,droop:.1,up:.06},tiers=big?4:3;
    for(let t=0;t<tiers;t++){const f=t/(tiers-1),y=H*(.36+f*.62),n=4+(r()<.5?1:0),az0=r()*6.283,c=[top[0]*y/H,y,top[2]*y/H];
      for(let i=0;i<n;i++){const az=az0+i/n*6.283+(r()-.5)*.5,el=.22+f*.8+r()*.15;branch(g,r,c,fromAngles(el,az),(13-f*5+r()*3)*s,(1.7-f*.6)*s,2,S,tips,bark)}}
    const ks=big?.9:1.12;for(const t of tips)clump(g,t.p[0],t.p[1]+1,t.p[2],(4.2+r()*1.4)*s*ks,(3+r())*s*ks,(4.2+r()*1.4)*s*ks,seed+51,big?.34:.3);
    clump(g,top[0],H+5*s,top[2],7*s,6*s,7*s,seed+52);shade(g.V,this.leaf,seed)}};
SP.cherry={lods:{far:{unit:1,F:4,leaf:16,bark:12,shades:2,smooth:2}},label:'Flowering cherry',where:'The drive, the garden walks, beside the chapel: pink before the leaves come',season:{blossom:true,early:true,blossomTint:'pink'},
  bark:['#5a3a32','#432a26','#74504a'],leaf:['#35602a','#3f6f30','#4a7e37','#588e40','#689e4b'],
  grow(g,r,seed){const s=.9+r()*.25,bark=barkFn(this.bark,seed);roots(g,r,4,1.6,2.5,bark);const top=trunk(g,r,8*s,1.7*s,1.3*s,bark,[(r()-.5)*.25,(r()-.5)*.25]);
    const tips=[],S={forks:[2,3],spread:.55,decay:.7,taper:.7,radDecay:.84,kinks:2,bend:.25,lift:.1,droop:.05,up:.08},n=4+Math.floor(r()*2),az0=r()*6.283;
    for(let i=0;i<n;i++)branch(g,r,top,fromAngles(.75+r()*.4,az0+i/n*6.283+(r()-.5)*.4),(8+r()*3)*s,1.1*s,2,S,tips,bark);
    for(const t of tips)clump(g,t.p[0],t.p[1]+.8,t.p[2],(3.2+r()*1.2)*s,(2.4+r()*.8)*s,(3.2+r()*1.2)*s,seed+61,.34);clump(g,top[0],top[1]+7*s,top[2],6*s,4*s,6*s,seed+62,.3);shade(g.V,this.leaf,seed)}};
SP.chestnut={label:'Horse chestnut',where:'The village green, the stable court, the cricket field: white candles in May',season:{candles:true},
  bark:['#54463a','#3d332b','#6a5a4b'],leaf:['#274a1c','#305921','#3a6827','#46782e','#548837'],
  grow(g,r,seed){SP.oak.grow.call(this,g,r,seed,1.12)}};
SP.greatOak={hero:true,label:'The great oak',where:'One or two in the whole park: alone on the south lawn, at the head of the avenue',season:{},bark:SP.oak.bark,leaf:SP.oak.leaf,
  grow(g,r,seed){SP.oak.grow.call(this,g,r,seed,1.5)}};
SP.greatCedar={hero:true,label:'The great cedar',where:'One on the west lawn, where the house is seen through it',season:{evergreen:true},bark:SP.cedar.bark,leaf:SP.cedar.leaf,
  grow(g,r,seed){SP.cedar.grow.call(this,g,r,seed,1.45)}};
SP.greatBeech={hero:true,label:'The great beech',where:'The end of the long walk; a pair at the park gate',season:{beech:true},bark:SP.beech.bark,leaf:SP.beech.leaf,
  grow(g,r,seed){SP.beech.grow.call(this,g,r,seed,1.5)}};
const SPECIES=Object.keys(SP);

/* ---------- coarser versions: near (two voxels a block) and far (one a block), interior filled, smoothed ---------- */
const key=(x,y,z)=>x+','+y+','+z,NB6=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];
function coarse(V,F,minLeaf,minBark,shades,smooth){const cells=new Map();
  for(const v of V.values()){const X=Math.floor((v[0]+F/2)/F),Y=Math.floor(v[1]/F),Z=Math.floor((v[2]+F/2)/F),k=key(X,Y,Z);let c=cells.get(k);if(!c)cells.set(k,c={x:X,y:Y,z:Z,leaf:0,bark:0,lc:{},bc:{}});const m=v[4]==='leaf'?(c.leaf++,c.lc):(c.bark++,c.bc);m[v[3]]=(m[v[3]]||0)+1}
  let out=new Map();for(const[k,c]of cells){const isLeaf=c.leaf>=c.bark*.5;if(isLeaf?c.leaf<minLeaf:c.bark<minBark&&c.y>0)continue;
    let best=null,bn=-1;const cc=isLeaf?c.lc:c.bc;for(const col in cc)if(cc[col]>bn){bn=cc[col];best=col}out.set(k,[c.x,c.y,c.z,best,isLeaf?'leaf':'b'])}
  /* smoothing: fill dents, drop lone leaf cubes */
  for(let it=0;it<smooth;it++){const add=[],del=[];const cand=new Set();for(const v of out.values())for(const d of NB6)cand.add(key(v[0]+d[0],v[1]+d[1],v[2]+d[2]));
    for(const k of cand){if(out.has(k))continue;const[x,y,z]=k.split(',').map(Number);if(y<1)continue;let n=0,lf=null;for(const d of NB6){const o=out.get(key(x+d[0],y+d[1],z+d[2]));if(o&&o[4]==='leaf'){n++;lf=o}}if(n>=4)add.push([x,y,z,lf[3],'leaf'])}
    for(const[k,v]of out){if(v[4]!=='leaf')continue;let n=0;for(const d of NB6)if(out.has(key(v[0]+d[0],v[1]+d[1],v[2]+d[2])))n++;if(n<=1)del.push(k)}
    for(const k of del)out.delete(k);for(const v of add)out.set(key(v[0],v[1],v[2]),v)}
  /* fill enclosed holes so there are no inner faces */
  let x0=1e9,x1=-1e9,y1=-1e9,z0=1e9,z1=-1e9;for(const v of out.values()){x0=Math.min(x0,v[0]);x1=Math.max(x1,v[0]);y1=Math.max(y1,v[1]);z0=Math.min(z0,v[2]);z1=Math.max(z1,v[2])}
  x0--;x1++;z0--;z1++;const y0=-1;y1++;const seen=new Set(),st=[[x0,y0,z0]];seen.add(key(x0,y0,z0));
  while(st.length){const[x,y,z]=st.pop();for(const[dx,dy,dz]of NB6){const a=x+dx,b=y+dy,c=z+dz;if(a<x0||a>x1||b<y0||b>y1||c<z0||c>z1)continue;const k=key(a,b,c);if(seen.has(k)||out.has(k))continue;seen.add(k);st.push([a,b,c])}}
  for(let x=x0;x<=x1;x++)for(let y=0;y<y1;y++)for(let z=z0;z<=z1;z++){const k=key(x,y,z);if(out.has(k)||seen.has(k))continue;let best=null;for(const d of NB6){const n=out.get(key(x+d[0],y+d[1],z+d[2]));if(n){best=n;break}}if(best)out.set(k,[x,y,z,best[3],best[4]])}
  /* fewer leaf shades: lit tops get the light shade, the rest the body shade */
  const lv=[...out.values()].filter(v=>v[4]==='leaf');if(lv.length&&shades){const lum=c=>{const n=parseInt(c.slice(1),16);return(n>>16&255)*.3+(n>>8&255)*.59+(n&255)*.11};
    const pal=[...new Set(lv.map(v=>v[3]))].sort((a,b)=>lum(a)-lum(b));const pick=f=>pal[Math.min(pal.length-1,Math.floor(f*pal.length))];
    const body=pick(.35),lit=pick(.8),dark=pick(.05);for(const v of lv){const up=!out.has(key(v[0],v[1]+1,v[2])),dn=!out.has(key(v[0],v[1]-1,v[2]));v[3]=up?lit:(shades>2&&dn)?dark:body}}
  return out}
const LODS={hero:{unit:U},near:{unit:.5,F:2,leaf:2,bark:2,shades:3,smooth:1},far:{unit:1.5,F:6,leaf:50,bark:30,shades:2,smooth:3}};

/* ---------- build ---------- */
function build(species,o={}){const S=SP[species];if(!S)throw new Error('No tree '+species);const seed=(o.seed==null?1:o.seed)|0,g=grid();S.grow(g,rng(seed*7+species.length),seed);
  const L=LODS[o.lod||'near']&&Object.assign({},LODS[o.lod||'near'],(S.lods||{})[o.lod||'near']);if(!L)throw new Error('lod is hero, near or far');let V=g.V,unit=U;if(L.F){V=coarse(V,L.F,L.leaf,L.bark,L.shades,L.smooth);unit=L.unit}
  let mx=0,my=0,mz=0;for(const v of V.values()){mx=Math.max(mx,Math.abs(v[0]));my=Math.max(my,v[1]);mz=Math.max(mz,Math.abs(v[2]))}
  return{V,unit,size:[+((2*mx+1)*unit).toFixed(2),+((my+1)*unit).toFixed(2),+((2*mz+1)*unit).toFixed(2)],kind:'tree'+species[0].toUpperCase()+species.slice(1),species,seed,lod:o.lod||'near',info:{label:S.label,room:S.where,act:'none',tree:true},count:V.size,season:Object.assign({seed},S.season)}}

/* ---------- greedy mesher: same light baking as PROPS.faces, far fewer quads ---------- */
function mesh(r,scale){const s=(scale||1)*r.unit,V=r.V;let x0=1e9,y0=1e9,z0=1e9,x1=-1e9,y1=-1e9,z1=-1e9;
  for(const v of V.values()){x0=Math.min(x0,v[0]);y0=Math.min(y0,v[1]);z0=Math.min(z0,v[2]);x1=Math.max(x1,v[0]);y1=Math.max(y1,v[1]);z1=Math.max(z1,v[2])}
  const D=[x1-x0+1,y1-y0+1,z1-z0+1],O=[x0,y0,z0];if(!V.size)return{pos:new Float32Array(0),col:new Float32Array(0),nor:new Float32Array(0),index:new Uint32Array(0),quads:0};
  const ids=new Int32Array(D[0]*D[1]*D[2]),pal=[],pm={},at=(x,y,z)=>(x*D[1]+y)*D[2]+z;
  for(const v of V.values()){const k=v[3]+'|'+v[4];let i=pm[k];if(i==null){i=pm[k]=pal.length+1;pal.push(v[3])}ids[at(v[0]-x0,v[1]-y0,v[2]-z0)]=i}
  const get=(c)=>c[0]<0||c[1]<0||c[2]<0||c[0]>=D[0]||c[1]>=D[1]||c[2]>=D[2]?0:ids[at(c[0],c[1],c[2])];
  const rgb=pal.map(h=>{const n=parseInt(h.slice(1),16);return[(n>>16&255)/255,(n>>8&255)/255,(n&255)/255]});
  const P=[],C=[],N=[],I=[];let quads=0;
  for(let d=0;d<3;d++){const u=(d+1)%3,v=(d+2)%3;for(const sg of[1,-1]){const L=d===1?(sg>0?1:.55):d===0?.78:.88;const nrm=[0,0,0];nrm[d]=sg;const mask=new Int32Array(D[u]*D[v]);
    for(let sl=0;sl<D[d];sl++){const c=[0,0,0],nb=[0,0,0];for(let j=0;j<D[v];j++)for(let i=0;i<D[u];i++){c[d]=sl;c[u]=i;c[v]=j;const a=get(c);nb[d]=sl+sg;nb[u]=i;nb[v]=j;mask[j*D[u]+i]=a&&!get(nb)?a:0}
      for(let j=0;j<D[v];j++)for(let i=0;i<D[u];){const m=mask[j*D[u]+i];if(!m){i++;continue}let w=1;while(i+w<D[u]&&mask[j*D[u]+i+w]===m)w++;let h=1;outer:while(j+h<D[v]){for(let k=0;k<w;k++)if(mask[(j+h)*D[u]+i+k]!==m)break outer;h++}
        for(let jj=0;jj<h;jj++)for(let k=0;k<w;k++)mask[(j+jj)*D[u]+i+k]=0;
        const base=[0,0,0];base[d]=sl+(sg>0?1:0);base[u]=i;base[v]=j;const du=[0,0,0],dv=[0,0,0];du[u]=w;dv[v]=h;
        const cs=[base,add(base,du),add(add(base,du),dv),add(base,dv)],n0=P.length/3;for(const q of cs){P.push((q[0]+O[0]-.5)*s,(q[1]+O[1])*s,(q[2]+O[2]-.5)*s);const cc=rgb[m-1];C.push(cc[0]*L,cc[1]*L,cc[2]*L);N.push(nrm[0],nrm[1],nrm[2])}
        if(sg>0)I.push(n0,n0+1,n0+2,n0,n0+2,n0+3);else I.push(n0,n0+2,n0+1,n0,n0+3,n0+2);quads++;i+=w}}}}
  return{pos:new Float32Array(P),col:new Float32Array(C),nor:new Float32Array(N),index:new Uint32Array(I),quads}}

/* ---------- three.js helpers (THREE passed in) ---------- */
const cache=new Map();
const seasonKey=st=>st?[st.leaf,st.turn,st.fresh,st.blossom,st.snow,st.bud,st.blossomEarly,st.candles].map(v=>Math.round((v||0)*20)).join(':'):'-';
function dressed(species,o){const r=build(species,o);if(o.st&&typeof SEASONS!=='undefined'){const d=SEASONS.restyle(r.V,o.st,Object.assign({unit:r.unit},r.season));r.V=d.V;r.count=r.V.size}return r}
function geometry(THREE,species,o={}){const k=[species,o.seed|0,o.lod||'near',seasonKey(o.st)].join('/');let g=cache.get(k);if(g)return g;
  const r=dressed(species,o),m=mesh(r);g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(m.pos,3));g.setAttribute('color',new THREE.BufferAttribute(m.col,3));g.setAttribute('normal',new THREE.BufferAttribute(m.nor,3));g.setIndex(new THREE.BufferAttribute(m.index,1));
  g.computeBoundingSphere();g.userData={species,seed:o.seed|0,lod:o.lod||'near',quads:m.quads,voxels:r.count,size:r.size};cache.set(k,g);return g}
let MAT=null;const material=THREE=>MAT||(MAT=new THREE.MeshLambertMaterial({vertexColors:true}));
function object(THREE,species,o={}){const mat=o.material||material(THREE),lod=new THREE.LOD(),seed=o.seed|0;
  for(const[l,dist]of[['hero',0],['near',o.hero==null?16:o.hero],['far',o.far||60]]){const m=new THREE.Mesh(geometry(THREE,species,{seed,lod:l,st:o.st}),mat);m.userData={k:'tree',o:{species,seed,lod:l}};lod.addLevel(m,dist)}
  lod.userData={k:'tree',o:{species,seed}};return lod}
function clearCache(){for(const g of cache.values())g.dispose();cache.clear()}

/* ---------- a grove drawn cheaply: shared geometry, instanced, three levels swapped by distance ----------
   list: [{species,x,z,y?,rot?(deg),scale?,seed?}]. Seeds fold into o.variants shapes per species (default 4),
   so a park of 300 trees costs at most 5 species x 4 shapes x 3 levels = 60 draw calls.
   Within o.hero blocks of the eye (default 16) a tree draws hero, within o.far (default 40) near, beyond that far.
   Call grove.update(camera.position,dt) each frame (it rebuckets every o.every seconds, default .4)
   and grove.season(st) when SEASONS values change.                                                         */
function forest(THREE,list,o={}){const VAR=o.variants||4,HERO=o.hero==null?16:o.hero,FAR=o.far||60,mat=o.material||material(THREE),group=new THREE.Group();group.userData={k:'grove',o:{count:list.length}};
  const buckets=new Map(),Q=new THREE.Quaternion(),Y=new THREE.Vector3(0,1,0),LV=['hero','near','far'];let st=o.st||null,acc=1e9;
  list.forEach((t,i)=>{const v=((t.seed==null?i:t.seed)%VAR+VAR)%VAR,k=t.species+'/'+v;let b=buckets.get(k);if(!b)buckets.set(k,b={species:t.species,seed:v+1,items:[]});
    const sc=t.scale||1;b.items.push({x:t.x,y:t.y||0,z:t.z,m:new THREE.Matrix4().compose(new THREE.Vector3(t.x,t.y||0,t.z),Q.clone().setFromAxisAngle(Y,(t.rot==null?h3(i,7,3,1)*360:t.rot)*Math.PI/180),new THREE.Vector3(sc,sc,sc))})});
  for(const b of buckets.values())for(const l of LV){const im=new THREE.InstancedMesh(geometry(THREE,b.species,{seed:b.seed,lod:l,st}),mat,b.items.length);im.frustumCulled=false;im.count=0;im.userData={k:'tree',o:{species:b.species,seed:b.seed,lod:l}};group.add(im);b[l]=im}
  const wp=new THREE.Vector3();
  function update(cam,dt){acc+=dt==null?1e9:dt;if(acc<(o.every||.4))return;acc=0;group.updateMatrixWorld();const inv=new THREE.Matrix4().copy(group.matrixWorld).invert();wp.copy(cam).applyMatrix4(inv);const H2=HERO*HERO,F2=FAR*FAR;
    for(const b of buckets.values()){const n={hero:0,near:0,far:0};for(const it of b.items){const dx=it.x-wp.x,dz=it.z-wp.z,d=dx*dx+dz*dz,l=d<H2?'hero':d<F2?'near':'far';b[l].setMatrixAt(n[l]++,it.m)}
      for(const l of LV){b[l].count=n[l];b[l].instanceMatrix.needsUpdate=true}}}
  function season(s){if(seasonKey(s)===seasonKey(st))return;st=s;for(const b of buckets.values())for(const l of LV)b[l].geometry=geometry(THREE,b.species,{seed:b.seed,lod:l,st})}
  function stats(){let q=0,dc=0;const by={hero:0,near:0,far:0};for(const b of buckets.values())for(const l of LV){const im=b[l];if(im.count){dc++;q+=im.count*im.geometry.userData.quads;by[l]+=im.count}}return{trees:list.length,drawCalls:dc,quads:q,hero:by.hero,near:by.near,far:by.far}}
  return{group,update,season,stats,dispose(){group.removeFromParent()}}}

return{build,mesh,geometry,object,forest,clearCache,SPECIES,info:Object.fromEntries(SPECIES.map(k=>[k,{label:SP[k].label,where:SP[k].where,evergreen:!!SP[k].season.evergreen,hero:!!SP[k].hero,blossom:!!SP[k].season.blossom,candles:!!SP[k].season.candles}])),
  HERO:SPECIES.filter(k=>SP[k].hero),SPRING:SPECIES.filter(k=>SP[k].season.blossom||SP[k].season.candles),
  EVERGREEN:SPECIES.filter(k=>SP[k].season.evergreen),LODS,U,rng,h3}})();
if(typeof module!=='undefined')module.exports=TREES;
