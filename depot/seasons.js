/* Euphrates Hall, Parts Depot: SEASONS v2 (seasons and nightfall; v20 strengthens the spring)
   New in state(): bud, blossomEarly, candles, petals, spring (0..1 each) and bulbs {snowdrop,crocus,daffodil,primrose,tulip,bluebell}.
   The grass greens three weeks sooner and brighter; young leaf is lime, not olive; blossom shows before the leaf.
   Plain script, no dependencies at load. Works in the browser (window.SEASONS) and in node (require).
   Everything is driven by a real Date: the season, the sun, dusk, the lamplighter's round, lit windows,
   fires at seven, snow, autumn leaves, spring blossom, fireflies, dawn fog on the lake.

   SEASONS.state(date,{lat,lon})      -> the whole picture for that moment (see fields below)
   SEASONS.sky(st)                    -> colours and light for a three.js scene (hex strings and numbers)
   SEASONS.restyle(V,st,o)            -> {V,glow}: a voxel prop dressed for the season and the hour
   SEASONS.lamplighter(lamps,st,o)    -> which lamps are lit and where the lamplighter is
   SEASONS.Sky(THREE,o)               -> sky dome with stars, sun and moon: .set(st) each frame
   SEASONS.Weather(THREE,o)           -> snow, falling leaves, petals, rain and fireflies: .set(st), .update(dt,env)
   SEASONS.Mist(THREE,o)              -> dawn fog over water: .set(st), .update(dt)
   Voxel format is the engine's: Map of "x,y,z" -> [x,y,z,colour,part]. */
const SEASONS=(()=>{
const RAD=Math.PI/180,clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),ss=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t)};
const HOME={lat:41.13,lon:-73.71};/* Armonk, New York */
const hex=h=>{const n=parseInt(h.slice(1),16);return[(n>>16&255),(n>>8&255),(n&255)]};
const toHex=c=>'#'+c.map(v=>clamp(Math.round(v),0,255).toString(16).padStart(2,'0')).join('');
const mix=(a,b,t)=>{const A=hex(a),B=hex(b);return toHex(A.map((v,i)=>v+(B[i]-v)*t))};
const ramp=(stops,x)=>{if(x<=stops[0][0])return stops[0][1];for(let i=1;i<stops.length;i++)if(x<=stops[i][0]){const[a,ca]=stops[i-1],[b,cb]=stops[i];return mix(ca,cb,(x-a)/(b-a))}return stops[stops.length-1][1]};
const h3=(x,y,z,s=0)=>{let n=(x*374761393+y*668265263+z*2147483647+s*1274126177)|0;n=(n^(n>>>13))*1274126177|0;return((n^(n>>>16))>>>0)/4294967296};

/* ---------- the sun (NOAA low-precision formulae, good to a fraction of a degree) ---------- */
function sun(date,lat,lon){const d=(date.getTime()-Date.UTC(2000,0,1,12))/864e5;const g=(357.529+.98560028*d)*RAD,q=280.459+.98564736*d;
  const L=(q+1.915*Math.sin(g)+.02*Math.sin(2*g))*RAD,e=(23.439-.00000036*d)*RAD;const ra=Math.atan2(Math.cos(e)*Math.sin(L),Math.cos(L)),dec=Math.asin(Math.sin(e)*Math.sin(L));
  const gmst=((18.697374558+24.06570982441908*d)%24+24)%24;const H=(gmst*15+lon)*RAD-ra,la=lat*RAD;
  const alt=Math.asin(Math.sin(la)*Math.sin(dec)+Math.cos(la)*Math.cos(dec)*Math.cos(H));const az=Math.atan2(-Math.sin(H),Math.tan(dec)*Math.cos(la)-Math.sin(la)*Math.cos(H));
  return{alt:alt/RAD,az:((az/RAD)+360)%360}}
function riseSet(date,lat,lon){const m0=new Date(date.getFullYear(),date.getMonth(),date.getDate());let rise=null,set=null,prev=sun(m0,lat,lon).alt+.833;
  for(let m=5;m<=1440;m+=5){const t=new Date(m0.getTime()+m*6e4),a=sun(t,lat,lon).alt+.833;if(prev<0&&a>=0&&rise===null)rise=m-5*a/(a-prev);if(prev>=0&&a<0&&set===null)set=m-5*a/(a-prev);prev=a}
  return{rise:rise??390,set:set??1050}}

/* ---------- day of year windows (Westchester phenology, averages) ---------- */
const doyOf=d=>{const s=new Date(d.getFullYear(),0,1);return Math.floor((d-s)/864e5)+1};
const win=(doy,a,b,c,e)=>{/* 0 before a, up to 1 by b, 1 until c, down to 0 by e; handles windows that wrap the year */
  const sh=x=>{let y=x-a;if(y<0)y+=365;return y};const x=sh(doy),B=sh(b),C=sh(c),E=sh(e);if(x<=B)return ss(0,B,x);if(x<=C)return 1;if(x<=E)return 1-ss(C,E,x);return 0};

function state(date=new Date(),o={}){const lat=o.lat??HOME.lat,lon=o.lon??HOME.lon;const doy=doyOf(date),mins=date.getHours()*60+date.getMinutes()+date.getSeconds()/60;
  const{alt,az}=sun(date,lat,lon),{rise,set}=riseSet(date,lat,lon);const night=ss(4,-8,alt),dusk=ss(-6,6,alt)*(1-ss(6,14,alt));
  const season=doy>=80&&doy<172?'spring':doy>=172&&doy<266?'summer':doy>=266&&doy<355?'autumn':'winter';
  const leaf=win(doy,100,135,293,329),turn=win(doy,263,301,345,360),fresh=win(doy,100,118,128,160),blossom=win(doy,105,116,124,136);
  /* v20, a stronger spring: buds haze the bare trees before the leaf, cherry flowers before apple, chestnut candles in May, petals fall as each blossom goes over, and the bulbs come in their order */
  const bud=win(doy,86,98,108,124),blossomEarly=win(doy,92,101,111,122),candles=win(doy,122,130,142,152);
  const petals=clamp(Math.max(doy>108?blossomEarly:blossomEarly*.4,doy>121?blossom:blossom*.5),0,1),spring=clamp(Math.max(bud*.6,fresh,blossom,blossomEarly),0,1);
  const bulbs={snowdrop:win(doy,40,52,72,84),crocus:win(doy,60,70,86,97),daffodil:win(doy,80,92,112,124),primrose:win(doy,84,96,124,136),tulip:win(doy,96,108,128,138),bluebell:win(doy,110,120,138,150)};
  const snow=win(doy,344,5,56,74),ice=win(doy,362,12,46,64);const dayH=h3(date.getFullYear(),doy,7);
  const snowing=(snow>.3&&dayH<.3)||(doy>=324&&doy<344&&dayH<.12)?1:0;const raining=!snowing&&snow<.2&&ice<.1&&dayH>.82?1:0;
  const falling=clamp(4*leaf*(1-leaf)*turn*1.4,0,1),litter=clamp((1-leaf)*turn*1.2,0,1)*(1-snow);
  const grass=mix(ramp([[0,'#8a8a5a'],[80,'#8a8a5a'],[104,'#7cc04c'],[136,'#62ac40'],[170,'#5a8f3a'],[230,'#6f9440'],[290,'#829a4c'],[330,'#8f9256'],[365,'#8a8a5a']],doy),'#e9eef3',snow);
  const fireflies=doy>=160&&doy<=215?night*(raining?0:1):0;
  const tr=mins-rise;const fogDawn=(tr>-70&&tr<130?(tr<15?ss(-70,15,tr):1-ss(15,130,tr)):0)*({spring:.7,summer:.55,autumn:1,winter:.35}[season])*(1-ice);
  const hour=mins/60;const fires=hour>=19||hour<7?1:0,chandeliers=night>.3&&hour>=15&&hour<23.5?1:hour>=19&&hour<23.5?1:0;
  const windows=night<.15?0:hour>=23?clamp(1-(hour-23)*.8,.12,1):hour<5?.08:hour<8?.45:.85;
  return{bud,blossomEarly,candles,petals,spring,bulbs,date,doy,mins,hour,lat,lon,season,alt,az,rise,set,night,dusk,leaf,turn,fresh,blossom,snow,ice,snowing,raining,falling,litter,grass,fireflies,fogDawn,fires,chandeliers,windows,
    label:season[0].toUpperCase()+season.slice(1)+', '+(night>.6?'night':dusk>.4?(mins<720?'dawn':'dusk'):'day')}}

/* ---------- sky colours ---------- */
const DAY={spring:['#6aa4d8','#cfe3ee'],summer:['#5d9ad6','#bcd9ee'],autumn:['#6a95c4','#cdd8de'],winter:['#7c9cc0','#d7e1ea']};
function sky(st){const a=st.alt,[dt,dh]=DAY[st.season];const over=st.raining||st.snowing?.55:0;
  const top=ramp([[-18,'#05080f'],[-8,'#0b1222'],[-3,'#24305a'],[2,'#4a62a0'],[10,dt]],a),hor=ramp([[-18,'#0c1220'],[-8,'#1a2238'],[-3,'#7a4a5a'],[1,'#e88a5a'],[6,'#f0b27a'],[14,dh]],a);
  const grey=st.snowing?'#c9ced4':'#8d959c';const T=mix(top,mix(grey,'#1a1e24',st.night),over),Hh=mix(hor,mix(grey,'#22262c',st.night),over*.8);
  const sa=clamp(a,-10,90)*RAD,az=st.az*RAD;const sdir=[Math.sin(az)*Math.cos(sa),Math.sin(sa),-Math.cos(az)*Math.cos(sa)];
  const sunI=a>0?clamp(.25+a/22,0,1.55)*(1-over*.75):0;const sunC=ramp([[0,'#ff9a50'],[6,'#ffc27a'],[20,'#fff1da'],[90,'#fff6e8']],a);
  const moonI=.32*st.night*(1-over*.6),moon=[-sdir[0],Math.max(.35,-sdir[1]),-sdir[2]];
  const hemiI=.18+.9*(1-st.night)*(1-over*.3)+.1*st.night;const ground=mix(mix('#4a3e2c',st.grass,.4),'#0d0f14',st.night*.8);
  return{top:T,horizon:Hh,fog:mix(Hh,T,.3),sunDir:sdir,sunColor:sunC,sunI,moonDir:moon,moonColor:'#9fb4e0',moonI,hemiSky:mix(T,'#ffffff',.25),hemiGround:ground,hemiI,stars:clamp(st.night*1.2-.2,0,1)*(1-over),night:st.night,overcast:over}}

/* ---------- dressing a voxel prop for the season and the hour ----------
   o.evergreen  keep foliage (cedar, yew, box, topiary, palm)
   o.blossom    true for fruit trees (apple, pear, cherry); o.early flowers a fortnight sooner, before the leaf; o.blossomTint 'pink'|'white'|'magenta'
   o.candles    horse chestnut: cream candles on the crown in May
   o.beech      copper beech turns brown, not orange
   o.lit        lamps and candles lit (flame parts glow)
   o.windows    0..1 share of glass that glows (houses at night); o.lampGlass glows with the flame
   o.snow       false to skip snow; o.snowCap 'cap' adds a layer, 'paint' whitens the top (default by unit)
   o.unit       the prop's cube size (for choosing cap or paint)                                     */
const AUT=['#c8642a','#d9902f','#b8452a','#e0b040','#a8642a','#c27a2e','#8a5a2a'],BEE=['#7a3a22','#8a4a2a','#6a3a24','#9a5a32'],BLO=['#f6d3dc','#fff2f4','#f0b8c8','#fbe4ea'];
const BLOS={pink:['#f3a9c0','#f9cfdb','#ec8fb0','#fbe1e9'],white:['#fbfaf4','#f2f0e4','#ffffff','#eceedd'],magenta:['#d96a9c','#e88ab4','#c9508a','#f2b0cc']},BUD=['#c2dc62','#d8d868','#aecf52','#d6b86a'],CAN=['#f6efdc','#fbf6ea','#f1d9cf'];
const GLASS=new Set(['#bfd8e8','#a8c8dc','#cfe2ee','#9fc0d8']);
function restyle(V,st,o={}){const out=new Map(),glow=new Map(),seed=o.seed||0;
  for(const[k,v]of V){let[x,y,z,c,p]=v;const h=h3(x,y,z,seed),h2=h3(z,x,y,seed+1);
    if(p==='leaf'&&!o.evergreen){const bl=o.blossom?(o.early?(st.blossomEarly||0):st.blossom):0;
      if(bl>0&&h2<bl*(o.early?.92:.8))c=(BLOS[o.blossomTint]||BLO)[(h*97|0)%4];                      /* blossom, and it comes whether or not the leaf has */
      else if(h>Math.pow(st.leaf,1.6)+.01){if(!(st.bud>0&&st.leaf<.7&&h2<st.bud*.17))continue;c=BUD[(h*53|0)%4]}   /* not in leaf yet: a haze of buds */
      else if(h2<st.turn)c=(o.beech?BEE:AUT)[(h*131|0)%(o.beech?4:7)];
      else if(st.fresh>0)c=mix(c,h<.28?'#b9ec52':o.beech?'#9fe03c':'#8ed63a',st.fresh*(h<.28?.78:.62))}
    if(p==='leaf'&&o.evergreen&&st.fresh>0)c=mix(c,'#6a9a4a',st.fresh*(out.has(x+','+(y-1)+','+z)&&h<.4?.42:.2));
    if(p==='flame'){if(o.lit){glow.set(k,[x,y,z,c,p]);continue}c='#4a4038';p='b'}
    if(GLASS.has(c)){if(o.lit&&o.lampGlass){glow.set(k,[x,y,z,'#ffd890','glass']);continue}if(o.windows&&h3(x>>2,y>>3,z>>2,seed+5)<o.windows){glow.set(k,[x,y,z,'#ffcf73','glass']);continue}if(st.night>.5)c=mix(c,'#1a2030',.6)}
    out.set(k,[x,y,z,c,p])}
  /* chestnut candles: cream spikes standing on the crown in May */
  if(o.candles&&st.candles>0){const n=(o.unit||.25)>.3?1:3,add=[];for(const v of out.values()){if(v[4]!=='leaf'||(v[0]&1)||(v[2]&1))continue;if(out.has(v[0]+','+(v[1]+1)+','+v[2]))continue;if(h3(v[0]>>1,3,v[2]>>1,seed+3)>st.candles*.16)continue;for(let i=1;i<=n;i++)add.push([v[0],v[1]+i,v[2],CAN[i===1&&n>1?2:(v[0]+v[2]>>1)&1],'blossom'])}for(const a of add)out.set(a[0]+','+a[1]+','+a[2],a)}
  if(st.snow>.02&&o.snow!==false){const mode=o.snowCap||((o.unit||.115)>.2?'paint':'cap');const add=[];
    for(const[k,v]of out){const[x,y,z,c,p]=v;if(out.has(x+','+(y+1)+','+z)||glow.has(x+','+(y+1)+','+z))continue;if(p==='ll'||p==='lr'||p==='al'||p==='ar'||p==='face')continue;if(h3(x,y,z,seed+9)>st.snow*.95)continue;
      if(mode==='paint')v[3]=mix(c,'#f2f5f8',.85);else add.push([x,y+1,z,'#f2f5f8','snow'])}
    for(const a of add)out.set(a[0]+','+a[1]+','+a[2],a)}
  return{V:out,glow}}

/* ---------- the lamplighter's round ----------
   lamps: [[x,z],...] in walking order. o.home [x,z], o.speed blocks a minute (default 60), o.dwell minutes a lamp (.7).
   Evening round starts ten minutes before sunset; the morning round snuffs them from five minutes after sunrise. */
function lamplighter(lamps,st,o={}){const home=o.home||lamps[0],speed=o.speed||60,dwell=o.dwell??.7;const pts=[home,...lamps,home];
  const plan=[];let t=0;for(let i=1;i<pts.length;i++){const[a,b]=[pts[i-1],pts[i]];const w=Math.hypot(b[0]-a[0],b[1]-a[1])/speed;plan.push({from:a,to:b,t0:t,t1:t+w});t+=w;if(i<pts.length-1){plan.push({at:b,t0:t,t1:t+dwell,lamp:i-1});t+=dwell}}
  const total=t;const ev=st.set-10,mo=st.rise+5;const m=st.mins;const n=lamps.length;
  const run=(t0,lighting)=>{const e=m-t0;if(e<0||e>total)return null;const lit=[];let pos=home,head=0,phase='walk';
    for(const s of plan){if(s.lamp!==undefined){lit[s.lamp]=lighting?e>=(s.t0+s.t1)/2:e<(s.t0+s.t1)/2}
      if(e>=s.t0&&e<s.t1){if(s.at){pos=s.at;phase=lighting?'lighting':'snuffing'}else{const f=(e-s.t0)/(s.t1-s.t0);pos=[s.from[0]+(s.to[0]-s.from[0])*f,s.from[1]+(s.to[1]-s.from[1])*f];head=Math.atan2(s.to[0]-s.from[0],s.to[1]-s.from[1]);phase='walk'}}}
    return{lit,pos,heading:head,phase,active:true,round:lighting?'evening':'morning'}};
  const r=run(ev,true)||run(mo,false);if(r)return r;const nightNow=m>=ev||m<mo;return{lit:Array(n).fill(nightNow),pos:home,heading:0,phase:'home',active:false,round:null}}

/* ---------- three.js helpers (THREE passed in) ---------- */
function Sky(THREE,o={}){const R=o.radius||180,g=new THREE.SphereGeometry(R,32,16);const col=new Float32Array(g.attributes.position.count*3);g.setAttribute('color',new THREE.BufferAttribute(col,3));
  const dome=new THREE.Mesh(g,new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.BackSide,fog:false,depthWrite:false}));dome.renderOrder=-10;
  const N=900,sp=new Float32Array(N*3);for(let i=0;i<N;i++){const u=Math.random(),v=Math.random()*.95+.04,th=u*Math.PI*2,ph=Math.acos(v);sp.set([Math.sin(ph)*Math.cos(th)*R*.95,Math.cos(ph)*R*.95,Math.sin(ph)*Math.sin(th)*R*.95],i*3)}
  const sg=new THREE.BufferGeometry();sg.setAttribute('position',new THREE.BufferAttribute(sp,3));const stars=new THREE.Points(sg,new THREE.PointsMaterial({color:0xffffff,size:1.4,sizeAttenuation:false,transparent:true,fog:false,depthWrite:false}));
  const disc=(c,s)=>{const m=new THREE.Mesh(new THREE.CircleGeometry(s,24),new THREE.MeshBasicMaterial({color:c,fog:false,transparent:true,depthWrite:false}));return m};const sunM=disc(0xfff2c0,R*.035),moonM=disc(0xe8eef8,R*.025);
  const grp=new THREE.Group();grp.add(dome,stars,sunM,moonM);const ct=new THREE.Color(),ch=new THREE.Color(),cc=new THREE.Color();
  grp.set=(sk,cam)=>{ct.set(sk.top);ch.set(sk.horizon);const p=g.attributes.position;for(let i=0;i<p.count;i++){const y=p.getY(i)/R;const t=Math.pow(clamp(y,0,1),.55);cc.copy(ch).lerp(ct,t);if(y<0)cc.copy(ch).multiplyScalar(.85);col.set([cc.r,cc.g,cc.b],i*3)}g.attributes.color.needsUpdate=true;
    stars.material.opacity=sk.stars;stars.visible=sk.stars>.02;const sd=new THREE.Vector3(...sk.sunDir).normalize();sunM.position.copy(sd).multiplyScalar(R*.9);sunM.visible=sd.y>-.05;sunM.material.color.set(sk.sunColor);sunM.material.opacity=1-sk.overcast*.85;
    const md=new THREE.Vector3(...sk.moonDir).normalize();moonM.position.copy(md).multiplyScalar(R*.9);moonM.visible=sk.night>.3;moonM.material.opacity=sk.night*(1-sk.overcast*.8);if(cam){sunM.lookAt(cam.position);moonM.lookAt(cam.position);grp.position.set(cam.position.x,0,cam.position.z)}};
  return grp}

/* particles: one Points system per kind; env = {ground(x,z)->y, water:{inside(x,z),heightAt(x,z),frozen}} */
function Weather(THREE,o={}){const A=o.area||[-30,-22,30,22],TOP=o.top||14;const grp=new THREE.Group();const sys={};
  const mk=(kind,n,size,add)=>{const pos=new Float32Array(n*3),col=new Float32Array(n*3);const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));
    const m=new THREE.Points(g,new THREE.PointsMaterial({size,vertexColors:true,transparent:true,depthWrite:false,blending:add?THREE.AdditiveBlending:THREE.NormalBlending}));m.frustumCulled=false;grp.add(m);
    const P=[];for(let i=0;i<n;i++)P.push({x:0,y:-99,z:0,vx:0,vy:0,vz:0,ph:Math.random()*9,rest:0,on:false});sys[kind]={m,g,pos,col,P,n,rate:0};return sys[kind]};
  mk('snow',1400,.09);mk('leaves',260,.13);mk('petals',200,.09);mk('rain',900,.06);mk('flies',70,.12,true);
  const rnd=(a,b)=>a+Math.random()*(b-a);const C=new THREE.Color();let wind=[.6,.2],time=0;
  const spawn=(k,p,anyH)=>{p.x=rnd(A[0],A[2]);p.z=rnd(A[1],A[3]);p.y=anyH?rnd(0,TOP):TOP+rnd(0,3);p.rest=0;p.on=true;p.ph=Math.random()*9;
    if(k==='snow'){p.vy=-rnd(.5,.9);C.set('#f4f7fb')}else if(k==='rain'){p.vy=-rnd(9,12);C.set('#9fb0c4')}else if(k==='leaves'){p.vy=-rnd(.5,.9);C.set(AUT[(Math.random()*7)|0])}else if(k==='petals'){p.vy=-rnd(.35,.6);C.set(BLO[(Math.random()*4)|0])}
    else{p.y=rnd(.3,2.2);p.x=rnd(A[0]*.6,A[2]*.6);p.z=rnd(A[1]*.6,A[3]*.6);C.set('#d8ff6a')}const s=sys[k];const i=s.P.indexOf(p);s.col.set([C.r,C.g,C.b],i*3)};
  grp.set=st=>{sys.snow.rate=st.snowing?1:0;sys.rain.rate=st.raining?1:0;sys.leaves.rate=st.falling;sys.petals.rate=st.petals!=null?(st.petals>.25?st.petals:0):(st.blossom>.35?st.blossom:0);sys.flies.rate=st.fireflies;wind=st.wind||wind};
  grp.update=(dt,env={})=>{time+=dt;for(const k in sys){const s=sys[k],want=Math.round(s.n*s.rate);let on=0;
    s.P.forEach((p,i)=>{if(!p.on){if(on<want&&Math.random()<(k==='flies'?.05:.5)){spawn(k,p,s.firstFill!==true);on++}else{s.pos[i*3+1]=-99}return}on++;if(on>want&&p.rest<=0&&Math.random()<.02){p.on=false;s.pos[i*3+1]=-99;return}
      if(k==='flies'){p.ph+=dt;p.x+=Math.sin(p.ph*.7+i)*dt*.4;p.z+=Math.cos(p.ph*.5+i*2)*dt*.4;p.y+=Math.sin(p.ph*1.3)*dt*.2;const b=Math.max(0,Math.sin(p.ph*2.1+i))**6;C.setRGB(.85*b,1*b,.4*b);s.col.set([C.r,C.g,C.b],i*3)}
      else if(p.rest>0){p.rest-=dt;const w=env.water;if(p.float&&w&&!w.frozen){p.x+=wind[0]*dt*.08;p.z+=wind[1]*dt*.08;if(!w.inside(p.x,p.z))p.rest=0;else p.y=w.level+w.heightAt(p.x,p.z)+.01}if(p.rest<=0)spawn(k,p)}
      else{const sw=k==='leaves'||k==='petals'?Math.sin(time*2.3+p.ph)*.9:k==='snow'?Math.sin(time*1.1+p.ph)*.25:0;p.x+=(wind[0]+sw)*dt;p.z+=(wind[1]+sw*.5)*dt;p.y+=p.vy*dt;
        const w=env.water,onW=w&&w.inside(p.x,p.z);const gy=onW?w.level+(w.frozen?0:w.heightAt(p.x,p.z)):(env.ground?env.ground(p.x,p.z):0);
        if(p.y<=gy+.01){p.y=gy+.01;if(k==='rain'){if(onW&&!w.frozen&&env.drop)env.drop(p.x,p.z,.012);spawn(k,p)}else if(onW&&!w.frozen&&k==='snow'){spawn(k,p)}else{p.rest=k==='snow'?rnd(4,9):rnd(8,25);p.float=onW&&!w.frozen;if(p.float&&env.drop)env.drop(p.x,p.z,.006)}}
        if(p.x<A[0]-4||p.x>A[2]+4||p.z<A[1]-4||p.z>A[3]+4)spawn(k,p)}
      s.pos[i*3]=p.x;s.pos[i*3+1]=p.y;s.pos[i*3+2]=p.z});s.firstFill=true;s.g.attributes.position.needsUpdate=true;s.g.attributes.color.needsUpdate=true}};
  return grp}

/* dawn fog: soft drifting sheets over a lake or a lawn. o = {cx,cz,w,d,y} */
function Mist(THREE,o={}){const grp=new THREE.Group();if(typeof document==='undefined')return Object.assign(grp,{set(){},update(){}});
  const cv=document.createElement('canvas');cv.width=cv.height=128;const x=cv.getContext('2d');for(let i=0;i<70;i++){const r=10+Math.random()*30,px=Math.random()*128,py=Math.random()*128;const gr=x.createRadialGradient(px,py,0,px,py,r);gr.addColorStop(0,'rgba(255,255,255,.22)');gr.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=gr;x.fillRect(0,0,128,128)}
  const tex=new THREE.CanvasTexture(cv);tex.wrapS=tex.wrapT=THREE.RepeatWrapping;const sheets=[];const cv2=document.createElement('canvas');cv2.width=cv2.height=128;const x2=cv2.getContext('2d');const rg=x2.createRadialGradient(64,64,10,64,64,64);rg.addColorStop(0,'#fff');rg.addColorStop(.55,'#bbb');rg.addColorStop(1,'#000');x2.fillStyle=rg;x2.fillRect(0,0,128,128);const fade=new THREE.CanvasTexture(cv2);
  for(let i=0;i<5;i++){const m=new THREE.MeshBasicMaterial({map:tex.clone(),alphaMap:fade,transparent:true,opacity:0,depthWrite:false,color:0xe8eef2});m.map.needsUpdate=true;m.map.repeat.set(1.5,1.5);const p=new THREE.Mesh(new THREE.PlaneGeometry(o.w||40,o.d||28),m);p.rotation.x=-Math.PI/2;p.position.set(o.cx||0,(o.y||0)+.12+i*.22,o.cz||0);p.renderOrder=5;grp.add(p);sheets.push(p)}
  let amt=0;grp.set=(st,sk)=>{amt=st.fogDawn;sheets.forEach((p,i)=>{p.material.opacity=amt*(.34-i*.05);p.visible=amt>.01;if(sk)p.material.color.set(mix(sk.horizon,'#eef2f4',.6))})};
  grp.update=dt=>{sheets.forEach((p,i)=>{p.material.map.offset.x+=dt*(.004+i*.002);p.material.map.offset.y+=dt*.0015*(i%2?1:-1)})};return grp}

return{state,sky,restyle,lamplighter,sun,riseSet,Sky,Weather,Mist,mix,HOME,EVERGREEN:['treeCedar','treeYew','hedge','topiary','palm','orangeTree','urn','boxParterre','lavender'],BLOSSOM:['treeApple'],BEECH:['treeBeech']}})();
if(typeof module!=='undefined')module.exports=SEASONS;
