/* =========================================================
   Euphrates Hall Parts Depot: livery.js (batch 4, Nov 12, 2026)
   House liveries for all 359 agents, in the people's small-cube detail.
   LIVERY.vox(agent) -> Map "x,y,z" -> [x,y,z,color,part], the same format personVox() makes,
   with parts 'b' (body), 'll','lr' (legs, swing when walking), 'al','ar' (arms), 'flame' (lamps).
   agent is a record from agents.json (id, house, role, name, lead). Each agent's face, hair and build
   come from a seed of its id, so the same agent always looks the same. Rank shows: a house lead wears
   the house's high mark (gold collar and sash, or the house's own), a co-lead wears a silver aiguillette.
   Each agent carries the tool of its job (book, ledger, quill, lantern, hammer, map, bag, camera, tray,
   pick, staff) in its right hand. LIVERY.outfit(agent) returns the plain outfit for personVox() too.
   ========================================================= */
const LIVERY=(()=>{
const SKINS=['#f1c9a5','#e8bd96','#e0b48c','#c68e64','#a8714a','#8d5a3b','#5c3a24'],HAIRS=['#2a1d14','#3b2618','#4a3020','#6b4423','#8a5a2b','#c9a24a','#1a1a1a','#9a9a9a','#a33a1f','#d8c9a0'];
const hash3=(x,y,z)=>{const n=Math.sin(x*12.9898+y*78.233+z*37.719)*43758.5453;return n-Math.floor(n)};
function baseVox(o){const V=new Map();const put=(x,y,z,c,part='b')=>V.set(x+','+y+','+z,[x,y,z,c,part]);const box=(x0,y0,z0,x1,y1,z1,c,part)=>{for(let x=x0;x<=x1;x++)for(let y=y0;y<=y1;y++)for(let z=z0;z<=z1;z++)put(x,y,z,c,part)};
  /* legs or skirt */
  if(o.dress||o.robe){const c=o.robe||o.dress;box(-4,1,-2,3,8,1,c);box(-5,1,-3,4,2,2,c);if(o.robe){for(let y=1;y<=8;y++){put(-1,y,1,o.accent);put(0,y,1,o.accent)}}box(-3,0,-2,-1,0,1,o.shoe);box(0,0,-2,2,0,1,o.shoe);if(o.apron)box(-3,1,2,2,8,2,o.apron)}
  else{box(-3,1,-2,-1,8,0,o.pants,'ll');box(0,1,-2,2,8,0,o.pants,'lr');box(-3,0,-2,-1,0,1,o.shoe,'ll');box(0,0,-2,2,0,1,o.shoe,'lr');if(o.stripe)for(let y=1;y<=8;y++){put(-3,y,-1,o.stripe,'ll');put(2,y,-1,o.stripe,'lr')}if(o.apron)box(-4,4,1,3,8,1,o.apron)}
  /* torso */
  box(-4,9,-2,3,16,1,o.coat);for(let x=-4;x<=3;x++)put(x,9,1,o.belt);put(-4,9,-2,o.belt);
  if(!o.robe&&!o.dress||o.tie){for(let y=13;y<=16;y++)for(let x=-2;x<=1;x++)if(Math.abs(x+.5)<=(y-12)*.5+.5)put(x,y,1,o.shirt);if(o.tie)for(let y=11;y<=15;y++){put(-1,y,1,o.tie);put(0,y,1,o.tie)}}
  if(!o.tie&&!o.robe)for(let y=10;y<=14;y+=2)put(-1,y,1,o.accent||'#d8ccae');
  if(o.apron&&!o.dress)box(-4,9,1,3,13,1,o.apron);
  if(o.apron&&o.dress)box(-3,9,1,2,13,1,o.apron);
  if(o.sash)for(let k=0;k<8;k++)put(-4+k,16-k,1,o.sash);
  if(o.ep){box(-5,16,-2,-5,16,1,o.accent);box(4,16,-2,4,16,1,o.accent)}
  if(o.scarf){box(-3,16,-2,2,16,2,o.scarf);put(1,15,2,o.scarf);put(1,14,2,o.scarf)}
  if(o.stripe)for(let y=9;y<=16;y++){put(-4,y,0,o.stripe);put(3,y,0,o.stripe)}
  /* arms and hands */
  const sleeve=o.armsShirt?o.shirt:o.coat;box(-6,10,-1,-5,16,0,sleeve,'al');box(4,10,-1,5,16,0,sleeve,'ar');box(-6,9,-1,-5,9,0,o.skin,'al');box(4,9,-1,5,9,0,o.skin,'ar');if(o.plat){box(-6,10,-1,-5,10,0,o.shirt,'al');box(4,10,-1,5,10,0,o.shirt,'ar')}
  /* head */
  box(-1,17,-1,0,17,0,o.skin);box(-3,18,-3,2,23,2,o.skin);
  put(-2,20,2,o.eye);put(1,20,2,o.eye);
  if(o.plat){put(-2,20,2,o.eye);put(1,20,2,o.eye);put(-1,20,2,o.eye);put(0,20,2,o.eye);for(let x=-3;x<=2;x++)put(x,22,2,o.accent);put(-3,19,2,o.accent);put(2,19,2,o.accent)}
  put(-1,18,2,'#8a5a4a');put(0,18,2,'#8a5a4a');
  if(o.specs){put(-3,20,2,'#c9a227');put(2,20,2,'#c9a227');put(-2,21,2,'#c9a227');put(-1,21,2,'#c9a227');put(0,21,2,'#c9a227');put(1,21,2,'#c9a227')}
  if(o.hair){const hc=o.hair;if(o.hs!=='bald'){box(-3,24,-3,2,24,2,hc);box(-3,19,-3,2,23,-3,hc);for(let y=21;y<=23;y++){put(-3,y,-2,hc);put(2,y,-2,hc);put(-3,y,-1,hc);put(2,y,-1,hc)}for(let x=-3;x<=2;x++)put(x,23,2,hc);put(-2,21,2,hc);put(1,21,2,hc);if(!o.specs){put(-2,21,2,hc);put(1,21,2,hc)}}
    if(o.hs==='long'){box(-3,15,-3,2,18,-3,hc);for(let y=16;y<=22;y++){put(-4,y,-2,hc);put(3,y,-2,hc);put(-4,y,-1,hc);put(3,y,-1,hc)}}
    if(o.hs==='bun')box(-1,23,-5,0,24,-4,hc);
    if(o.beard){box(-3,18,2,2,18,2,hc);put(-3,19,2,hc);put(2,19,2,hc);put(-1,19,2,hc);put(0,19,2,hc)}}
  if(o.cap==='beret'){box(-4,25,-3,2,25,2,o.coat);box(-2,26,-2,1,26,1,o.coat)}
  else if(o.cap==='maid'){box(-3,25,-2,2,25,-1,'#f1ede4')}
  else if(o.cap==='flat'){box(-4,25,-3,3,25,3,'#5b3d24');box(-3,26,-3,2,26,1,'#5b3d24')}
  else if(o.cap){box(-3,25,-3,2,26,2,o.cap);box(-3,25,3,2,25,4,'#0b0b0d');if(o.accent)put(-1,26,3,o.accent)}
  if(o.headset){box(-4,20,-1,-4,24,0,'#20252e');box(3,20,-1,3,24,0,'#20252e');box(-4,25,-1,3,25,0,'#20252e');put(-4,19,1,'#20252e');put(-3,19,2,o.accent)}
  return V}
const HOUSE={gold:{coat:'#b8901f',pants:'#1f2433',accent:'#f2d675',trim:'#7a1f25',badge:'#f2d675'},silver:{coat:'#8f98a3',pants:'#3a3f46',accent:'#dfe4ec',trim:'#1f3a8a',badge:'#dfe4ec'},
 white:{coat:'#f1ede4',pants:'#d8d0c0',accent:'#d4af37',trim:'#d4af37',badge:'#d4af37'},copper:{coat:'#b87333',pants:'#3b2618',accent:'#e0a46a',trim:'#14224a',badge:'#14224a'},
 blue:{coat:'#1f2f5a',pants:'#1f2f5a',accent:'#d4af37',trim:'#d4af37',badge:'#d4af37'},yellow:{coat:'#f1ede4',pants:'#4a4f5c',accent:'#e3b23c',trim:'#e3b23c',badge:'#e3b23c'},
 green:{coat:'#2f6b3a',pants:'#1f2433',accent:'#7cff8e',trim:'#1f2433',badge:'#7cff8e'},violet:{coat:'#5e3a85',pants:'#2a1d34',accent:'#d4af37',trim:'#d4af37',badge:'#d4af37'},
 orange:{coat:'#e07a1f',pants:'#3b2618',accent:'#2e2e33',trim:'#7a4a25',badge:'#2e2e33'},grey:{coat:'#6d7278',pants:'#4a4f55',accent:'#c9a227',trim:'#2e3136',badge:'#c9a227'},
 obsidian:{coat:'#1b1b1f',pants:'#1b1b1f',accent:'#a4161a',trim:'#a4161a',badge:'#eaf3ff'},brown:{coat:'#16161a',pants:'#3a3d44',accent:'#f1ede4',trim:'#16161a',badge:'#c0c7cf'},
 pink:{coat:'#e8a0b4',pants:'#4a2f3c',accent:'#f1ede4',trim:'#9a5a6a',badge:'#f1ede4'},red:{coat:'#a4161a',pants:'#5b3d24',accent:'#e3b23c',trim:'#3a1010',badge:'#e3b23c'}};
const ITEMS=[['quill',/Writer|Scribe|Poet|Letter|Copy|Wordsmith|Speech|Playwright|Headline|Correspond|Pamphlet|Pen\b|Editor/],['ledger',/Clerk|Registrar|Auditor|Budget|Ledger|Tally|Purser|Comptroller|Paymaster|Accountant|Archivist|Recorder|Keeper of the Laurel|Tracker/],
 ['lantern',/Watch|Sentinel|Gate|Konetz|Lamp|Lurcher|Picket|Sentry/],['hammer',/Builder|Engineer|Mechanic|Smith|Wright|Fixer|Armor|Fabricat|Tech\b|Artificer|Salvager|Hardware|Rig/],['map',/Navigator|Map|Course|Pilot|Trend|Scout|Explorer|Sensors|Long-Range|Cartograph|Plotter/],
 ['bag',/Physician|Dentist|Medic|EMT|Nurse|Somnus|Dermal|Almoner|Prevention|Insurance/],['camera',/Lens|Camera|Producer|Thumbnail|Painter|Holo|Illustrator/],['tray',/Majordomo|Butler|Attendant|Host\b|Cook|Steward/],
 ['book',/Tutor|Scholar|Coach|Librarian|Keeper|Reader|Catechist|Historian|Researcher|Teacher|Instructor|Mentor|Theolog|Interpreter|Codex|Loremaster|Lore/]];
const HOUSEITEM={red:'pick',obsidian:'staff'};
function rngOf(id){let s=0;for(const c of String(id))s=(s*31+c.charCodeAt(0))>>>0;s=s||1;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296}}
function outfit(a){const r=rngOf(a.id||a.name);const pick=L=>L[Math.floor(r()*L.length)];const H=HOUSE[a.house]||HOUSE.brown;
  const o={skin:pick(SKINS),hair:pick(HAIRS),hs:pick(['short','short','long','bun','bald','short']),beard:r()<.25,coat:H.coat,pants:H.pants,shoe:'#1a1410',shirt:'#f1ede4',tie:null,accent:H.accent,belt:'#2a1d14',dress:false,robe:false,apron:null,eye:'#1a1410',ep:false,sash:null,specs:false,headset:false,scarf:null,stripe:null,cap:null};
  if(o.hs==='long'||o.hs==='bun')o.beard=false;const girl=o.hs==='long'||o.hs==='bun';
  switch(a.house){case 'gold':Object.assign(o,{ep:true,tie:'#1f3a8a'});break;case 'silver':Object.assign(o,{tie:'#1f3a8a'});if(girl)o.dress=H.coat;break;case 'white':Object.assign(o,{robe:H.coat,shirt:H.coat});break;
   case 'copper':Object.assign(o,{tie:'#14224a',specs:r()<.7,armsShirt:true});break;case 'blue':Object.assign(o,{cap:'#1f2f5a',ep:true,tie:'#0b0b0d'});break;case 'yellow':Object.assign(o,{tie:'#e3b23c'});break;
   case 'green':Object.assign(o,{headset:true});break;case 'violet':Object.assign(o,{scarf:'#d4af37',cap:'beret'});if(girl)o.dress=H.coat;break;case 'orange':Object.assign(o,{apron:'#7a4a25'});break;
   case 'grey':Object.assign(o,{cap:'#4a4f55'});break;case 'obsidian':Object.assign(o,{stripe:'#a4161a',shoe:'#f1ede4'});break;
   case 'brown':if(girl)Object.assign(o,{dress:'#16161a',apron:'#f1ede4',cap:'maid'});else Object.assign(o,{tie:'#16161a',accent:'#f1ede4'});break;case 'pink':Object.assign(o,{tie:'#f1ede4'});if(girl)o.dress=H.coat;break;
   case 'red':Object.assign(o,{armsShirt:false});break}
  return o}
function itemFor(a){if(HOUSEITEM[a.house])return HOUSEITEM[a.house];const s=(a.role||'')+' '+(a.name||'');for(const[k,re]of ITEMS)if(re.test(s))return k;return null}
function tierOf(a){const l=(a.lead||'').toLowerCase();return l.includes('co-lead')?'co':l.includes('lead')?'lead':'staff'}
function vox(a){const o=outfit(a);const V=baseVox(o);const H=HOUSE[a.house]||HOUSE.brown;const tier=tierOf(a);const girl=o.hs==='long'||o.hs==='bun';
  const put=(x,y,z,c,p='b')=>V.set(x+','+y+','+z,[x,y,z,c,p]);const del=(x,y,z)=>V.delete(x+','+y+','+z);const box=(x0,y0,z0,x1,y1,z1,c,p)=>{for(let x=x0;x<=x1;x++)for(let y=y0;y<=y1;y++)for(let z=z0;z<=z1;z++)put(x,y,z,c,p)};
  const skirt=o.dress||o.robe;
  /* the tailoring: lapels, a button row, cuffs and a house pin, on every coat */
  if(!o.robe){for(let y=12;y<=16;y++){put(-3+(16-y>2?0:0),y,2,H.trim);put(2,y,2,H.trim)}for(let y=10;y<=15;y+=2)put(-2,y,2,H.accent);
    put(-3,15,2,H.badge);put(-3,14,2,H.badge)}
  box(-6,10,-1,-5,10,0,H.accent,'al');box(4,10,-1,5,10,0,H.accent,'ar');
  /* coat skirts below the waist for the formal houses */
  if(!skirt&&['gold','silver','blue','brown','copper','violet'].includes(a.house)){for(let y=5;y<=8;y++){put(-4,y,-2,o.coat,'b');put(3,y,-2,o.coat,'b');for(let x=-4;x<=3;x++)if(y>=6)put(x,y,-3,o.coat,'b')}}
  /* rank */
  if(tier==='lead'){for(let x=-3;x<=2;x++)put(x,17,1,H.accent);put(-4,16,0,H.accent);put(3,16,0,H.accent);for(let k=0;k<8;k++)put(-4+k,16-k,2,H.trim);put(-1,13,3,H.badge);put(0,13,3,H.badge)}
  if(tier==='co'){for(let k=0;k<6;k++)put(3,15-k,1+(k%2),'#dfe4ec');put(2,16,1,'#dfe4ec')}
  /* headwear by house and rank */
  const hat=(c,h,w=3,brim)=>{box(-w,25,-w,w-1,25+h,w-1,c);if(brim)box(-w-1,25,-w-1,w,25,w,brim)};
  switch(a.house){
   case 'gold':if(tier!=='staff'){for(let x=-3;x<=2;x++){put(x,25,-3,H.accent);put(x,25,2,H.accent)}for(let z=-3;z<=2;z++){put(-3,25,z,H.accent);put(2,25,z,H.accent)}put(-1,26,2,'#7a1f25');put(0,26,2,'#7a1f25')}break;
   case 'silver':if(tier!=='staff'||!girl){box(-3,25,-3,2,25,2,'#1a1a1a');box(-4,25,-4,3,25,3,'#1a1a1a');if(tier!=='staff')box(-3,26,-3,2,28,2,'#1a1a1a');else box(-3,26,-3,2,26,2,'#1a1a1a');box(-3,26,-3,2,26,2,'#1a1a1a');put(-3,26,2,'#1f3a8a')}break;
   case 'copper':box(-3,25,-3,2,26,2,'#2a1d14');box(-4,25,-4,3,25,3,'#2a1d14');put(0,27,0,'#2a1d14');break;
   case 'blue':if(tier==='lead'){box(-5,25,-1,4,27,0,'#0b0b0d');box(-4,28,-1,3,28,0,'#0b0b0d');put(0,27,1,H.accent);put(-1,27,1,H.accent)}else{box(-3,27,-3,2,27,2,H.accent)}break;
   case 'white':if(!o.hair||o.hs==='bald'){}box(-3,24,-4,2,24,-4,o.coat);for(let y=18;y<=24;y++){put(-4,y,-3,o.coat);put(3,y,-3,o.coat)}box(-4,24,-3,3,24,-3,o.coat);if(tier==='lead')for(let y=8;y<=16;y++){put(-2,y,2,H.accent);put(1,y,2,H.accent)}break;
   case 'yellow':if(tier==='lead'){box(-1,24,2,0,24,2,'#c0c7cf');put(-1,23,3,'#dfe4ec');put(0,23,3,'#dfe4ec')}break;
   case 'green':if(tier==='lead'){box(-3,21,2,2,21,2,'#1a1a1a');put(-2,21,3,'#7cff8e');put(1,21,3,'#7cff8e')}break;
   case 'violet':if(tier==='lead'){box(-3,25,-3,2,29,2,'#1a1a1a');box(-4,25,-4,3,25,3,'#1a1a1a');box(-3,26,-3,2,26,2,'#5e3a85')}break;
   case 'orange':box(-4,25,-3,3,25,3,'#5b3d24');box(-3,26,-3,2,26,1,'#5b3d24');box(-2,26,2,-1,26,2,'#bfd8e8');box(0,26,2,1,26,2,'#bfd8e8');break;
   case 'grey':if(tier==='lead'){box(-3,25,-3,2,27,2,'#b8bcc4');box(-1,28,-4,0,29,3,'#a4161a');for(let z=-4;z<=3;z++)put(-1,30,z,'#a4161a')}break;
   case 'obsidian':for(let x=-5;x<=4;x++){put(x,17,-2,'#5a4a3a');put(x,16,-2,'#6b5a48')}if(tier==='lead')for(let x=-5;x<=4;x++)put(x,17,1,'#6b5a48');break;
   case 'brown':if(!girl&&tier!=='staff'){for(let y=1;y<=8;y++){put(-4,y,-3,'#16161a');put(3,y,-3,'#16161a')}box(-4,6,-3,3,8,-3,'#16161a')}box(-6,9,-1,-5,9,0,'#f1ede4','al');box(4,9,-1,5,9,0,'#f1ede4','ar');break;
   case 'pink':if(girl){put(-3,24,1,'#c0262b');put(-3,25,1,'#e8a0b4');put(-2,24,2,'#3f6b33')}else{put(-3,15,2,'#c0262b');put(-3,16,2,'#3f6b33')}break;
   case 'red':box(-3,25,-3,2,26,2,'#e3b23c');box(-4,25,-4,3,25,3,'#c99a2a');box(-1,26,3,0,27,3,'#2e2e33');put(-1,27,4,'#ffd36b','flame');put(0,27,4,'#ffd36b','flame');break;}
  /* the tool of the job, in the right hand */
  const it=itemFor(a);const R='ar';
  if(it==='book'){box(5,8,0,6,11,2,['#7a1f2a','#2f4a6e','#2f5a3a','#5b2a1a'][Math.floor(hash3(a.id.length,1,2)*4)],R);box(6,8,0,6,11,1,'#efe6cf',R)}
  else if(it==='ledger'){box(5,7,-1,6,11,2,'#3a2a1e',R);put(6,9,2,'#c9a227',R)}
  else if(it==='quill'){box(5,9,1,5,9,1,'#efe6cf',R);for(let y=10;y<=14;y++)put(5,y,1+(y>12?1:0),y<11?'#2a1d14':'#f4f1ea',R)}
  else if(it==='lantern'){box(5,4,0,5,8,0,'#2e2e33',R);for(let y=1;y<=4;y++)for(const[dx,dz]of[[0,-1],[0,1],[1,0],[-1,0]])put(5+dx,y+1,dz,'#2e2e33',R);box(5,2,0,5,4,0,'#ffd36b','flame')}
  else if(it==='hammer'){for(let y=4;y<=9;y++)put(5,y,0,'#6b4226',R);box(4,3,0,6,3,1,'#55555c',R)}
  else if(it==='map'){for(let y=6;y<=11;y++)put(5,y,1,'#c9b88a',R);put(5,6,2,'#c9b88a',R);put(5,11,2,'#c9b88a',R);box(6,7,1,6,10,1,'#d8c49a',R)}
  else if(it==='bag'){box(4,4,-1,6,7,1,'#1a1410',R);box(5,8,0,5,8,0,'#c9a227',R);put(5,6,2,'#c0262b',R)}
  else if(it==='camera'){box(5,8,0,6,10,2,'#1a1a1a',R);put(6,9,3,'#bfd8e8',R)}
  else if(it==='tray'){box(4,10,0,8,10,4,'#c0c7cf',R);put(6,11,2,'#f4f1ea',R);put(7,11,1,'#f4f1ea',R)}
  else if(it==='pick'){for(let y=3;y<=13;y++)put(5,y,0,'#6b4226',R);for(let z=-3;z<=3;z++)put(5,13+(Math.abs(z)===3?-1:0),z,'#55555c',R)}
  else if(it==='staff'){for(let y=0;y<=26;y++)put(5,y,0,'#4a3020',R);put(5,27,0,'#a4161a',R)}
  return V}

/* LIVERY.rig(THREE,agent,meshOf): the figure split into body, legs and arms on pivots, ready to animate.
   meshOf(V,unit) -> a mesh (the Depot uses PROPS.faces). pose(dt,{mode,speed,act}) modes: walk, idle, swim, skate, ride, sit */
function rig(THREE,a,meshOf){const V=vox(a),u=.115,P={b:new Map(),ll:new Map(),lr:new Map(),al:new Map(),ar:new Map()};let sh=16;
  for(const[k,v]of V){const[x,y,z,c,p]=v;if(p==='al'||p==='ar'){P[p].set(k,v);sh=Math.max(sh,y);continue}if(y<9&&p!=='flame'){(x<=-1?P.ll:P.lr).set(k,v);continue}P.b.set(k,v)}
  const group=new THREE.Group(),tilt=new THREE.Group();group.add(tilt);if(P.b.size)tilt.add(meshOf(P.b,u));
  const piv=(m,px,py)=>{const g=new THREE.Group();g.position.set(px*u,py*u,0);if(m.size){const ms=meshOf(m,u);ms.position.set(-px*u,-py*u,0);g.add(ms)}tilt.add(g);return g};
  const J={ll:piv(P.ll,-2,9),lr:piv(P.lr,1,9),al:piv(P.al,-5,sh),ar:piv(P.ar,5,sh)};let ph=0;
  function pose(dt,s={}){const mode=s.mode||'walk',sp=s.speed||0;ph+=dt*(mode==='swim'?4:Math.min(9,sp*5.5));const w=Math.sin(ph);tilt.rotation.set(mode==='swim'?1.35:mode==='skate'?.18:0,0,0);
    for(const j in J)J[j].rotation.set(0,0,0);
    if(mode==='swim'){J.al.rotation.x=ph;J.ar.rotation.x=ph+Math.PI;J.ll.rotation.x=Math.sin(ph*2.5)*.3;J.lr.rotation.x=-Math.sin(ph*2.5)*.3;return}
    if(mode==='ride'){J.ll.rotation.set(-.35,0,-.5);J.lr.rotation.set(-.35,0,.5);J.al.rotation.x=-.55;J.ar.rotation.x=-.55;tilt.position.y=Math.abs(Math.sin(ph*.5))*.03*Math.min(1,sp);return}
    if(mode==='sit'){J.ll.rotation.x=-1.45;J.lr.rotation.x=-1.45;J.al.rotation.x=-.3;J.ar.rotation.x=-.3;return}
    const A=sp>.05?(mode==='skate'?.55:.38):0;J.ll.rotation.x=w*A;J.lr.rotation.x=-w*A;J.al.rotation.x=-w*A*.8;J.ar.rotation.x=s.act?-2.5:w*A*.8}
  return{group,tilt,joints:J,pose,agent:a}}
function card(a){return{name:a.name,role:a.role,house:a.house,lead:a.lead||null,line:a.voice&&a.voice.line||null,item:itemFor(a),tier:tierOf(a)}}
return{vox,outfit,itemFor,tierOf,card,rig,HOUSE}})();
if(typeof module!=='undefined')module.exports=LIVERY;
