/* =========================================================
   Euphrates Hall Parts Depot: layout.js (batch 2, Nov 12, 2026)
   Dresses a room from rooms.json with props from props.js and props2.js.
   LAYOUT.furnish(room, PROPS) -> {id,w,d,ceiling,items:[{k,o,x,y,z,r}],runs:[{k,o,wall,a,b,y}]}
   Coordinates are in blocks, local to the room: x from its west wall, z from its north wall,
   y above its floor. r is the facing in degrees: 0 faces +z (south), 90 faces +x (east),
   180 faces -z, 270 faces -x. A run tiles a wall prop from a to b along that wall.
   Exterior walls (on the main block's edge) get windows; the door goes on the wall nearest
   the Saloon. Rooms without a rect use a nominal size from the Mansion Plan, placed at stage 1.
   ========================================================= */
const LAYOUT=(()=>{
const NOMINAL={'day-nursery':[24,20],'governess':[16,16],'bachelors':[14,16],'ward':[32,20],'laboratory':[24,20],'sewing':[16,12],'attic-men':[10,10],'attic-women':[10,10],
 'box-room':[24,16],'wireless':[20,20],'observatory':[20,20],'clock-room':[16,16],'flag-room':[16,16],'belvedere':[16,16],'water-tower':[16,16],'ballroom':[64,28],'orangery':[40,12],
 'theatre':[40,24],'card-room':[24,20],'laundry':[48,20],'bakehouse':[16,16],'carpenter':[20,16],'steward-office':[20,16],'kitchen-court':[48,32],'stable-court':[64,48],'grooms':[10,10],
 'chapel':[32,16],'gatehouse':[16,16],'glasshouse':[32,16]};
/* batch-2 dressing added to each room's furnish list from rooms.json */
const EXTRA={'great-hall':['suitArmor','suitArmor','banner*14','coatOfArms','antlers','tapestry','vaseFlowers'],
 'saloon':['fern','fern','bust','vaseFlowers','teaSet','sofa','armchair*2','palm','palm'],'library':['bust','bookStack','bookStack','letterTray','libraryTable*2','armchair*2','bookcase*8','fern','candelabra'],'drawing':['teaSet','vaseFlowers','gramophone','screen'],
 'music':['harp','gramophone','musicStand'],'smoking':['antlers','bookStack'],'morning':['teaSet','vaseFlowers','birdcage','letterTray'],'dining':['fruitBowl','candelabra','candelabra'],
 'billiard':['antlers'],'gun-room':['antlers','suitArmor'],'map-room':['globe','tapestry'],'estate-office':['letterTray','bookStack'],'business':['letterTray'],'muniment':['deedChest','deedChest'],
 'entrance':['suitArmor','bust','fern'],'long-gallery':['tapestry','bust','bust','suitArmor','banner*4'],'calendar':['letterTray'],'registry':['bookStack','bookStack'],
 'schoolroom':['bookStack','screen'],'bedchamber':['screen','vaseFlowers','letterTray','bookStack'],'study':['letterTray','globe'],'dressing':['screen'],
 'kitchen':['welshDresser','copperRack','copperRack','fruitBowl','kitchenTable','teaSet','bookStack'],'hall':['welshDresser'],'scullery':['copperRack'],'still-room':['welshDresser'],'housekeeper':['letterTray','vaseFlowers'],
 'pantry':['letterTray'],'linen':['ironingTable'],'steward':['letterTray'],
 'day-nursery':['rockingHorse','toyFort','bedIron','screen','bookStack','rug'],'governess':['deskWriting','globe','bookcase','chairDining'],'bachelors':['bedIron','wardrobe','washstand','armchair'],
 'ward':['wardBed*6','screen','screen','deskWriting','fern'],'laboratory':['labBench','labBench','microscope','bookcase','globe'],'sewing':['sewingMachine','sewingMachine','wardrobe','ironingTable'],
 'attic-men':['bedIron','washstand'],'attic-women':['bedIron','washstand'],'box-room':['deedChest*4','wardrobe'],'wireless':['wireless','deskWriting','mapTable','clockLong'],
 'observatory':['telescope','globe','deskWriting','bookcase'],'clock-room':['clockLong','deskWriting'],'flag-room':['banner*4','deedChest'],'belvedere':['armchair','armchair','libraryTable','telescope','rug'],
 'water-tower':['deedChest'],'ballroom':['chandelier*3','grandPiano','harp','musicStand','musicStand','chairDining*12','sash','doorDouble','cornice','dado','rug'],
 'orangery':['orangeTree*4','palm','palm','birdcage','bench','glasshouseBench'],'theatre':['stageCurtain','seatRow*6','chandelier','dado','cornice','doorDouble'],
 'card-room':['cardTable*3','chairDining*12','fireplace','dado','cornice','portrait','sash','chandelier'],'laundry':['mangle','mangle','ironingTable','ironingTable','kitchenRange'],
 'bakehouse':['kitchenRange','kitchenTable','welshDresser'],'carpenter':['kitchenTable','saddleRack','anvil'],'steward-office':['deskWriting','bookcase','strongbox','clockLong'],
 'grooms':['bedIron','washstand'],'chapel':['pew*8','lectern','candleStand','candleStand','sash'],'gatehouse':['deskWriting','clockLong','bellBoard'],
 'glasshouse':['glasshouseBench*4','orangeTree','fern','fern'],'kitchen-court':['cart','waterTrough','beehive','beehive','coldFrame','coldFrame','wheelbarrow'],
 'stable-court':['stableStall*6','forgeHearth','anvil','saddleRack','waterTrough','carriage','cart','haystack']};
const EXTRA3={'saloon':['consoleTable','consoleTable','sconce*6','standardLamp'],'entrance':['consoleTable','lanternPendant','sconce*2'],'drawing':['displayCabinet','consoleTable','sconce*4','standardLamp'],
 'morning':['displayCabinet','sconce*2','standardLamp'],'dining':['sideboard','sideboard','sconce*4'],'library':['standardLamp*2','sconce*4'],'music':['sconce*4','displayCabinet'],'smoking':['standardLamp','sconce*2'],
 'great-hall':['chairHall*4','sconce*6'],'long-gallery':['commode*2','sconce*8','displayCabinet'],'study':['bureau'],'business':['bureau'],'estate-office':['bureau'],'map-room':['sconce*2'],'billiard':['sconce*2'],
 'bedchamber':['commode','standardLamp','sconce*2'],'card-room':['sconce*4'],'ballroom':['sconce*10','consoleTable*2'],'morning-extra':[],'hall':['trestleTable','windsor*8'],'kitchen':['windsor*4'],
 'housekeeper':['bureau'],'steward':['bureau'],'pantry':['sideboard'],'schoolroom':['standardLamp'],'theatre':['sconce*6']};
const CENTER=new Set(['trestleTable','tableDining','billiard','mapTable','libraryTable','kitchenTable','labBench','grandPiano','cardTable','bisellium','bed4','bedIron','wardBed','stableStall','carriage','cart','haystack','sewingMachine','mangle','ironingTable','toyFort','rockingHorse','telescope','wireless','coldFrame','beehive','wheelbarrow','orangeTree','glasshouseBench','anvil','forgeHearth','waterTrough','seatRow','pew','studyTable']);
const WALL=new Set(['consoleTable','sideboard','bureau','displayCabinet','commode','bookcase','wardrobe','fireplace','deskWriting','cardCatalog','welshDresser','kitchenRange','bellBoard','wineRack','clockLong','strongbox','deedChest','washstand','menuSlate','sofa','gramophone','harp','screen','lectern','stageCurtain','saddleRack','forgeHearth']);
const ART=new Set(['sconce','portrait','tapestry','banner','antlers','coatOfArms','bellPull','copperRack','innSign']);
const CORNER=new Set(['standardLamp','palm','globe','fern','suitArmor','bust','birdcage','candleStand','musicStand','orangeTree','urn','vaseFlowersFloor']);
const SMALL=new Set(['teaSet','vaseFlowers','bookStack','letterTray','candelabra','fruitBowl','microscope','gramophoneTable']);
const TILE=new Set(['panelling','dado','cornice']);
const BACKPLUS=new Set(['bed4','bedIron','wardBed']); // their headboard is at +z
const TOP={tableDining:1.2,libraryTable:1.05,deskWriting:1.2,kitchenTable:1.27,labBench:1.27,cardTable:1.15,mapTable:1.3,welshDresser:1.27};
function expand(list){const out=[];for(const it of list){const m=/^(.+)\*(\d+)$/.exec(it);if(m)for(let i=0;i<+m[2];i++)out.push(m[1]);else out.push(it)}return out}
function furnish(room,PROPS,opt={}){
  const R=room.rect,nom=NOMINAL[room.id]||[16,16];const W=R?R.w:nom[0],D=R?R.d:nom[1],H=room.ceiling||9;
  if(room.kind==='stair'&&opt.batch3!==false){const items0=[];const fl=PROPS.build('stairFlight',{w:Math.round(Math.min(W,D)*.45*8.7)});const s=fl.size;const along=D>=W;
    items0.push({k:'stairFlight',o:{w:Math.round(Math.min(W,D)*.45*8.7)},x:W/2,y:0,z:D/2,r:along?0:90});items0.push({k:'newelPost',o:{},x:W/2-s[0]/2,y:0,z:D/2-s[2]/2-.4,r:0},{k:'newelPost',o:{},x:W/2+s[0]/2,y:0,z:D/2-s[2]/2-.4,r:0});
    items0.push({k:'lanternPendant',o:{},x:W/2,y:Math.max(3,(room.ceiling||9)+6-3.6),z:D/2,r:0},{k:'portrait',o:{seed:3},x:.05,y:2,z:D/2,r:90},{k:'tapestry',o:{},x:W-.05,y:3,z:D/2,r:270});
    const FL=(typeof FLOORS!=='undefined'?FLOORS:(typeof require!=='undefined'?require('./floors.js'):null));const fc=FL?FL.assign(room):{};
    return{id:room.id,name:room.name,level:room.level,house:room.house||null,w:W,d:D,ceiling:room.ceiling||9,floor:fc.floor||null,ceilingFinish:fc.ceiling||null,door:'S',exterior:[],nominal:!R,items:items0,runs:[]}}
  const kinds=expand([...(room.furnish||[]),...(EXTRA[room.id]||[]),...(opt.batch3===false?[]:(EXTRA3[room.id]||[]))]).filter(k=>PROPS.info[k]);
  if(room.id&&room.id.endsWith('-bed')&&opt.batch3!==false)kinds.push('commode','sconce','sconce','standardLamp');
  const house=room.house||null,dec=room.decor&&room.decor.color;const items=[],runs=[];
  const occ=new Uint8Array(W*D);const sz={};const size=k=>sz[k]||(sz[k]=PROPS.build(k,{}).size);
  const fp=(k,r)=>{const s=size(k);return r%180===0?[s[0],s[2]]:[s[2],s[0]]};
  const free=(x0,z0,w,d)=>{for(let x=Math.floor(x0);x<Math.ceil(x0+w);x++)for(let z=Math.floor(z0);z<Math.ceil(z0+d);z++){if(x<0||z<0||x>=W||z>=D||occ[z*W+x])return false}return true};
  const mark=(x0,z0,w,d,v=1)=>{for(let x=Math.floor(x0);x<Math.ceil(x0+w);x++)for(let z=Math.floor(z0);z<Math.ceil(z0+d);z++)if(x>=0&&z>=0&&x<W&&z<D)occ[z*W+x]=v};
  const opts=k=>{const o={};if(dec&&['bed4','armchair','sofa','rug','sash','chairDining','dado'].includes(k))o.c=dec;if(house&&['banner','coatOfArms','suitArmor','carriage','gatePier','rowboat'].includes(k))o.house=house;return o};
  let hseed=0;for(const ch of room.id)hseed=(hseed*31+ch.charCodeAt(0))>>>0;const VAR=PROPS.variants||{};const vpick={};
  const vk=k=>{if(opt.variants===false||!VAR[k])return k;if(!(k in vpick)){const low=room.level==='below'||room.level==='attic'||room.level==='court';const L=VAR[k].filter(v=>PROPS.info[v]&&(k!=='chairDining'||(low?v==='windsor':v!=='windsor')));vpick[k]=L[(hseed+k.length*7)%L.length]}return vpick[k]};
  const add=(k,x,z,r,y=0,o)=>{items.push({k:vk(k),o:o||opts(k),x:+x.toFixed(2),y:+y.toFixed(2),z:+z.toFixed(2),r})};
  // walls: N z=0 faces 0; S z=D faces 180; W x=0 faces 90; E x=W faces 270
  const ext={N:R&&R.z===0,S:R&&R.z+R.d===96,W:R&&R.x===0,E:R&&R.x+R.w===128};
  if(!R){ext.S=true;ext.N=room.level==='tower'}
  const WALLS={N:{len:W,r:0,pt:t=>[t,0]},S:{len:W,r:180,pt:t=>[W-t,D]},W:{len:D,r:90,pt:t=>[0,D-t]},E:{len:D,r:270,pt:t=>[W,t]}};
  const blocked={N:[],S:[],W:[],E:[]};const block=(w,a,b)=>blocked[w].push([a,b]);const isBlocked=(w,a,b)=>blocked[w].some(([p,q])=>a<q&&b>p);
  // door: wall nearest the main block's centre (64,48) that is not exterior
  let dw='N';if(R){const cx=R.x+R.w/2,cz=R.z+R.d/2,c={N:[cx,R.z],S:[cx,R.z+R.d],W:[R.x,cz],E:[R.x+R.w,cz]};let best=1e9;for(const w of['N','S','W','E']){if(ext[w])continue;const dd=Math.hypot(c[w][0]-64,c[w][1]-48);if(dd<best){best=dd;dw=w}}}else dw='N';
  const doorK=room.ceiling>=9&&room.level!=='below'?'doorDouble':null;const dl=WALLS[dw].len,da=dl/2-1.7,db=dl/2+1.7;block(dw,da-.5,db+.5);
  {const[px,pz]=WALLS[dw].pt(dl/2);if(doorK)add('doorDouble',px,pz,WALLS[dw].r);const ix=dw==='E'?px-3:dw==='W'?px:px-2,iz=dw==='S'?pz-3:dw==='N'?pz:pz-2;mark(ix,iz,dw==='N'||dw==='S'?4:3,dw==='N'||dw==='S'?3:4,2)}
  // windows on exterior walls, every 6 blocks
  const wantSash=kinds.includes('sash')||Object.values(ext).some(Boolean);
  if(wantSash&&room.level!=='below')for(const w of['N','S','W','E']){if(!ext[w])continue;const L=WALLS[w].len;for(let t=3;t+2.8<=L-2;t+=6){if(isBlocked(w,t,t+2.8))continue;const[px,pz]=WALLS[w].pt(t+1.4);add('sash',px,pz,WALLS[w].r);block(w,t-.2,t+3)}}
  // fireplace: middle of the longest wall that is free
  const fireAt={};if(kinds.includes('fireplace')||kinds.includes('kitchenRange')||kinds.includes('forgeHearth')){for(const fk of['fireplace','kitchenRange','forgeHearth']){if(!kinds.includes(fk))continue;
    const order=['N','S','W','E'].filter(w=>!ext[w]).sort((a,b)=>WALLS[b].len-WALLS[a].len).concat(['N','S','W','E'].filter(w=>ext[w]));for(const w of order){const L=WALLS[w].len,s=size(fk)[0];let t=L/2-s/2;if(isBlocked(w,t,t+s))t=w===dw?db+1:t;if(isBlocked(w,t,t+s)||t+s>L)continue;
      const[px,pz]=WALLS[w].pt(t+s/2);const nx=w==='W'?.35:w==='E'?-.35:0,nz=w==='N'?.35:w==='S'?-.35:0;add(fk,px+nx,pz+nz,WALLS[w].r);block(w,t-.3,t+s+.3);fireAt.w=w;fireAt.t=t+s/2;
      const hx=w==='W'?0:w==='E'?W-4:t-1,hz=w==='N'?0:w==='S'?D-4:t-1;mark(hx,hz,w==='N'||w==='S'?s+2:4,w==='N'||w==='S'?4:s+2,2);break}}}
  const used=new Set(['doorDouble','sash','fireplace','kitchenRange','forgeHearth']);
  for(let i=kinds.length-1;i>=0;i--){const k=kinds[i];if(k==='doorDouble'||k==='sash'||(fireAt.w&&(k==='fireplace'||k==='kitchenRange'||k==='forgeHearth')&&items.some(it=>it.k===k)))kinds.splice(i,1)}
  const take=k=>{const i=kinds.indexOf(k);if(i>=0){kinds.splice(i,1);return true}return false};
  // centre pieces
  const longX=W>=D;const centres=kinds.filter(k=>CENTER.has(k));for(const k of centres)take(k);
  const tables=[];
  const group={};for(const k of centres)group[k]=(group[k]||0)+1;
  for(const[k,n]of Object.entries(group)){
    if(k==='tableDining'&&n===1){const o=opts(k);const len=Math.max(10,Math.min(60,Math.floor(((longX?W:D)-8)*8.7/2)));o.len=len;const s=PROPS.build(k,o).size;const rot=longX?90:0,fw=rot?s[2]:s[0],fd=rot?s[0]:s[2];
      const cx=W/2,cz=D/2;add(k,cx,cz,rot,0,o);mark(cx-fw/2-1.5,cz-fd/2-1.5,fw+3,fd+3,1);tables.push({k,cx,cz,fw,fd,rot,top:TOP[k]});continue}
    if(k==='bisellium'){const w={N:'S',S:'N',W:'E',E:'W'}[dw];const s=size(k);const L=WALLS[w].len;const[px,pz]=WALLS[w].pt(L/2);const iw=w==='N'?[0,s[2]/2+1]:w==='S'?[0,-s[2]/2-1]:w==='W'?[s[2]/2+1,0]:[-s[2]/2-1,0];
      add(k,px+iw[0],pz+iw[1],WALLS[w].r);mark(px+iw[0]-s[0]/2-1,pz+iw[1]-s[2]/2-1,s[0]+2,s[2]+2);block(w,L/2-s[0]/2-1,L/2+s[0]/2+1);tables.push({k,cx:px+iw[0],cz:pz+iw[1],fw:s[0],fd:s[2],rot:WALLS[w].r});continue}
    if(k==='bed4'||k==='bedIron'||k==='wardBed'){ // beds: head on the wall opposite the door, or rows for wards and attics
      const opp={N:'S',S:'N',W:'E',E:'W'}[dw];if(n===1){const w=ext[opp]&&!ext[dw]?(['W','E'].find(x=>!ext[x]&&x!==dw)||opp):opp;const s=size(k);const L=WALLS[w].len;const[px,pz]=WALLS[w].pt(L/2);
        const inward=w==='N'?[0,s[2]/2]:w==='S'?[0,-s[2]/2]:w==='W'?[s[2]/2,0]:[-s[2]/2,0];const r=(WALLS[w].r+180)%360;add(k,px+inward[0],pz+inward[1],r);const fw=r%180===0?s[0]:s[2],fd=r%180===0?s[2]:s[0];mark(px+inward[0]-fw/2-.5,pz+inward[1]-fd/2,fw+1,fd,1);block(w,L/2-s[0]/2-.6,L/2+s[0]/2+.6);
        tables.push({k,cx:px+inward[0],cz:pz+inward[1],fw,fd,rot:r,top:1});}
      else{const s=size(k);const step=s[0]+1.6;let placed=0;for(const w of['N','S']){const L=WALLS[w].len;for(let t=1.5;t+s[0]<=L-1&&placed<n;t+=step){if(isBlocked(w,t,t+s[0]))continue;const[px,pz]=WALLS[w].pt(t+s[0]/2);const iz=w==='N'?s[2]/2:-s[2]/2;add(k,px,pz+iz,(WALLS[w].r+180)%360);mark(px-s[0]/2,pz+iz-s[2]/2,s[0],s[2]);placed++}}}
      continue}
    if(k==='pew'||k==='seatRow'){const s=size(k);for(let i=0;i<n;i++){const z=4+i*(s[2]+1.4);if(z+s[2]>D-2)break;for(const side of n>4?[-1,1]:[0]){const x=side?W/2+side*(s[0]/2+1):W/2;add(k,x,z+s[2]/2,180);mark(x-s[0]/2,z,s[0],s[2])}}continue}
    if(k==='stableStall'){const s=size(k);let i=0;for(let x=s[0]/2+.5;x+s[0]/2<=W&&i<n;x+=s[0]+.2,i++){add(k,x,s[2]/2+.3,0);mark(x-s[0]/2,0,s[0],s[2]+.3)}continue}
    // everything else: spread evenly along the long axis, staying clear
    const s=size(k);for(let i=0;i<n;i++){const f=(i+1)/(n+1);const rot=(k==='labBench'||k==='glasshouseBench'||k==='ironingTable'||k==='kitchenTable')&&longX?90:0;const fw=rot?s[2]:s[0],fd=rot?s[0]:s[2];
      let cx=longX?W*f:W/2,cz=longX?D/2:D*f;for(let tries=0;tries<30&&!free(cx-fw/2,cz-fd/2,fw,fd);tries++){cz+=(tries%2?1:-1)*(tries+1)*.5;cx+=(tries%3===0?.5:0)}
      if(!free(cx-fw/2,cz-fd/2,fw,fd))continue;add(k,cx,cz,rot);mark(cx-fw/2-.6,cz-fd/2-.6,fw+1.2,fd+1.2);if(TOP[k])tables.push({k,cx,cz,fw,fd,rot,top:TOP[k]})}}
  // chairs around tables
  const nCh=kinds.filter(k=>k==='chairDining').length;kinds.splice(0,kinds.length,...kinds.filter(k=>k!=='chairDining'));if(kinds.includes('windsor')||kinds.includes('chairHall')){const ex=kinds.filter(k=>k==='windsor'||k==='chairHall');kinds.splice(0,kinds.length,...kinds.filter(k=>k!=='windsor'&&k!=='chairHall'));let i=0;for(const k of ex){for(let t=0;t<40;t++){const x=1+((i*5.3+t*2.1)%(W-2)),z=1+((i*3.1+t*1.7)%(D-2));if(free(x-.5,z-.5,1,1)){items.push({k,o:{},x:+x.toFixed(2),y:0,z:+z.toFixed(2),r:(i*90)%360});mark(x-.5,z-.5,1,1);break}}i++}}
  if(nCh){const tbs=tables.filter(t=>t.k==='tableDining'||t.k==='cardTable'||t.k==='deskWriting'||t.k==='kitchenTable'||t.k==='labBench');
    if(!tbs.length&&room.id==='ballroom'){for(let i=0;i<12;i++){const x=2+i*((W-4)/11);add('chairDining',x,1.2,0);add('chairDining',x,D-1.2,180)}}
    for(const t of tbs){if(t.k==='cardTable'){for(const[dx,dz,r]of[[0,-1.3,0],[0,1.3,180],[-1.3,0,90],[1.3,0,270]])add('chairDining',t.cx+dx,t.cz+dz,r);continue}
      if(t.k!=='tableDining'){const side=t.rot?[0,t.fd/2+.6]:[0,t.fd/2+.6];add('chairDining',t.cx,t.cz+t.fd/2+.6,180);continue}
      const along=t.rot?t.fw:t.fd;const n=Math.max(2,Math.floor((along-1)/1.9));for(let i=0;i<n;i++){const off=-along/2+.9+i*((along-1.8)/(n-1||1));
        if(t.rot){add('chairDining',t.cx+off,t.cz-t.fd/2-.55,0);add('chairDining',t.cx+off,t.cz+t.fd/2+.55,180)}else{add('chairDining',t.cx-t.fw/2-.55,t.cz+off,90);add('chairDining',t.cx+t.fw/2+.55,t.cz+off,270)}}
      if(t.rot){add('chairDining',t.cx-t.fw/2-.6,t.cz,90);add('chairDining',t.cx+t.fw/2+.6,t.cz,270)}else{add('chairDining',t.cx,t.cz-t.fd/2-.6,0);add('chairDining',t.cx,t.cz+t.fd/2+.6,180)}}}
  // seating facing the fire
  if(fireAt.w){const w=fireAt.w;const[px,pz]=WALLS[w].pt(fireAt.t);const nx=w==='W'?1:w==='E'?-1:0,nz=w==='N'?1:w==='S'?-1:0;const fr=WALLS[w].r;
    if(take('sofa')){const s=size('sofa');const x=px+nx*5.2,z=pz+nz*5.2;if(free(x-s[0]/2,z-1,s[0],1.4)||true){add('sofa',x,z,(fr+180)%360);mark(x-(nz?s[0]/2:.7),z-(nx?s[0]/2:.7),nz?s[0]:1.4,nx?s[0]:1.4)}}
    let a=0;while(take('armchair')&&a<2){const side=a?1:-1;const x=px+nx*3+(nz?side*2.6:0),z=pz+nz*3+(nx?side*2.6:0);add('armchair',x,z,(fr+180+(nz?side*-35:side*35)+360)%360);mark(x-.7,z-.7,1.4,1.4);a++}}
  // rug under the main table or in the middle
  if(take('rug')&&(tables[0]||W*D<180)){const t=tables[0];const o=opts('rug');const cx=t?t.cx:W/2,cz=t?t.cz:D/2;const fw=Math.min(W-2,(t?t.fw+3:W*.55)),fd=Math.min(D-2,(t?t.fd+3:D*.55));o.w=Math.max(6,Math.round(fw*8.7/2));o.l=Math.max(6,Math.round(fd*8.7/2)-1);
    add('rug',cx,cz,0,0.01,o)}
  // wall furniture: bookcases fill free stretches of the long walls, others take the best free spot
  const wallOrder=['N','S','W','E'].sort((a,b)=>(ext[a]?1:0)-(ext[b]?1:0)||WALLS[b].len-WALLS[a].len);
  const putWall=(k,fill)=>{const s=size(k);for(const w of wallOrder){const L=WALLS[w].len;for(let t=.6;t+s[0]<=L-.6;t+=fill?s[0]+.05:.5){if(isBlocked(w,t,t+s[0]))continue;const[px,pz]=WALLS[w].pt(t+s[0]/2);
      const nx=w==='W'?s[2]/2:w==='E'?-s[2]/2:0,nz=w==='N'?s[2]/2:w==='S'?-s[2]/2:0;const x=px+nx,z=pz+nz;const fw=w==='N'||w==='S'?s[0]:s[2],fd=w==='N'||w==='S'?s[2]:s[0];
      if(!free(x-fw/2,z-fd/2,fw,fd))continue;add(k,x,z,WALLS[w].r);mark(x-fw/2,z-fd/2,fw,fd);block(w,t,t+s[0]);if(!fill)return true}}return false};
  while(take('bookcase')){if(room.id==='library'||room.id==='registry'||room.id==='muniment'){putWall('bookcase',true);while(take('bookcase'));}else putWall('bookcase',false)}
  for(const k of[...kinds]){if(WALL.has(k)&&take(k))putWall(k,k==='wineRack')}
  // corners
  const corners=[[1,1],[W-1,1],[1,D-1],[W-1,D-1]];for(const k of[...kinds]){if(!CORNER.has(k))continue;take(k);for(const c of corners){const s=size(k);if(!free(c[0]-s[0]/2,c[1]-s[2]/2,s[0],s[2]))continue;
    add(k,c[0],c[1],c[1]<D/2?0:180);mark(c[0]-s[0]/2-.3,c[1]-s[2]/2-.3,s[0]+.6,s[2]+.6);break}}
  // conversation groups fill the open floor of the big rooms: sofa, two armchairs, a lamp table with flowers, a rug, a fern
  const GROUPLV=new Set(['state','first','west-wing','tower','second']);const noGroup=new Set(['dining','ballroom','billiard','theatre','chapel','ward','laboratory','sewing','kitchen','hall','entrance','long-gallery']);
  if(GROUPLV.has(room.level)&&!noGroup.has(room.id)&&W*D>=180&&opt.groups!==false){const G=7.2,maxG=Math.max(1,Math.floor(W*D/150));let gn=0;const o=opts('sofa'),oa=opts('armchair'),orug=Object.assign(opts('rug'),{w:22,l:20});
    for(let gz=G/2+1;gz<=D-G/2-1&&gn<maxG;gz+=G+.6)for(let gx=G/2+1;gx<=W-G/2-1&&gn<maxG;gx+=G+.6){if(!free(gx-G/2,gz-G/2,G,G))continue;
      add('rug',gx,gz,0,0.01,orug);add('sofa',gx,gz-2.5,0,0,o);add('armchair',gx-2.6,gz+1.5,145,0,oa);add('armchair',gx+2.6,gz+1.5,215,0,oa);add('libraryTable',gx,gz,0);add(gn%2?'bookStack':'vaseFlowers',gx+.3,gz-.2,0,1.05);
      if(gn%2===0)add('fern',gx+3.1,gz-2.9,0);mark(gx-G/2,gz-G/2,G,G);gn++}}
  // ceiling lights
  while(take('chandelier')){const ts=tables.filter(t=>t.k==='tableDining'||t.k==='billiard');const s=size('chandelier');if(ts.length){const t=ts[0];const along=t.rot?t.fw:t.fd;const n=Math.max(1,Math.round(along/9));
      for(let i=0;i<n;i++){const off=-along/2+along*(i+.5)/n;add('chandelier',t.rot?t.cx+off:t.cx,t.rot?t.cz:t.cz+off,0,H-s[1])}}
    else{const n=1+kinds.filter(k=>k==='chandelier').length;kinds.splice(0,kinds.length,...kinds.filter(k=>k!=='chandelier'));for(let i=0;i<n;i++){const f=(i+.5)/n;add('chandelier',longX?W*f:W/2,longX?D/2:D*f,0,H-s[1])}}}
  if(take('lantern')){const s=size('lantern');const nx=Math.min(4,Math.floor(W*.5/s[0])),nz=Math.min(3,Math.floor(D*.5/s[2]));for(let i=0;i<nx;i++)for(let j=0;j<nz;j++)add('lantern',W/2+(i-(nx-1)/2)*s[0],D/2+(j-(nz-1)/2)*s[2],0,H+.01)}
  // ceiling pieces: a rose over every chandelier, hammerbeam trusses in the Great Hall, oak beams below stairs
  if(opt.batch3!==false){for(const it of items.filter(i=>i.k.startsWith('chandelier')))items.push({k:'ceilingRose',o:{},x:it.x,y:H-.02,z:it.z,r:0});
    if(room.id==='great-hall'){const span=Math.min(W,D),n=Math.floor(Math.max(W,D)/6);for(let i=1;i<n;i++){const t=i*Math.max(W,D)/n;items.push({k:'hammerbeam',o:{w:Math.round(span*8.7)-2},x:W>=D?t:W/2,y:H-.02,z:W>=D?D/2:t,r:W>=D?90:0})}}
    if(room.level==='below'&&room.kind!=='stair')runs.push({k:'beam',o:{},wall:'ceiling',a:0,b:W,y:H,every:2.5});}
  // pillars at the corners of big rooms and the Saloon's gallery
  while(take('column')){if(room.id==='saloon'||room.id==='entrance'){for(const[x,z]of[[2,2],[W-2,2],[2,D-2],[W-2,D-2]])add('column',x,z,0);while(take('column'));}else putWall('column',false)}
  // smalls on table tops and the mantel
  const tops=tables.filter(t=>t.top);let ti=0;for(const k of[...kinds]){if(!SMALL.has(k))continue;take(k);if(tops.length){const t=tops[ti%tops.length];const n=ti/tops.length|0;const off=(n%2?1:-1)*(.5+n*.6);
      add(k,t.rot?t.cx+off:t.cx+(t.fw>2?off*.3:0),t.rot?t.cz+(t.fd>1.6?.3:0):t.cz+off,0,t.top);ti++}else if(fireAt.w){const[px,pz]=WALLS[fireAt.w].pt(fireAt.t+(ti%2?1:-1)*.9);const nz=fireAt.w==='N'?.4:fireAt.w==='S'?-.4:0,nx=fireAt.w==='W'?.4:fireAt.w==='E'?-.4:0;add(k,px+nx,pz+nz,WALLS[fireAt.w].r,2.8);ti++}}
  // wall art along free stretches, at eye level (the prop carries its own height)
  const art=kinds.filter(k=>ART.has(k));for(const k of art)take(k);let ai=0;
  for(const k of art){const s=size(k);let done=false;for(const w of[...wallOrder,...wallOrder]){const L=WALLS[w].len;const step=Math.max(s[0]+.8,L/((art.length/2|0)+2));for(let t=.8+(ai%3)*.4;t+s[0]<=L-.8;t+=step){
      if(isBlocked(w,t-.2,t+s[0]+.2)&&k!=='coatOfArms')continue;const[px,pz]=WALLS[w].pt(t+s[0]/2);const y=k==='coatOfArms'?6:k==='antlers'?3.6:k==='banner'?Math.max(1.5,H-5.5):0;
      if(k==='coatOfArms'&&fireAt.w){const[qx,qz]=WALLS[fireAt.w].pt(fireAt.t);add(k,qx,qz,WALLS[fireAt.w].r,y);done=true;break}
      const nx=w==='W'?.05:w==='E'?-.05:0,nz=w==='N'?.05:w==='S'?-.05:0;add(k,px+nx,pz+nz,WALLS[w].r,y);block(w,t-.2,t+s[0]+.2);done=true;break}if(done)break}ai++}
  // tiled trim runs: panelling or dado below, cornice at the ceiling line
  for(const k of[...kinds]){if(!TILE.has(k))continue;take(k);for(const w of['N','S','W','E']){const L=WALLS[w].len;const o=opts(k);
      if(k==='cornice'){runs.push({k,o,wall:w,a:0,b:L,y:H-.75});continue}const spans=blocked[w].slice().sort((p,q)=>p[0]-q[0]);let a=0;
      for(const[p,q]of spans){if(p-a>1.8)runs.push({k,o,wall:w,a:+a.toFixed(2),b:+p.toFixed(2),y:0});a=Math.max(a,q)}if(L-a>1.8)runs.push({k,o,wall:w,a:+a.toFixed(2),b:L,y:0})}}
  // bell pull beside the door
  if(take('bellPull')){const[px,pz]=WALLS[dw].pt(db+.8);add('bellPull',px,pz,WALLS[dw].r)}
  // anything left: place on the floor where it fits
  for(const k of kinds){if(['sash','balustrade','doorDouble','lantern','panelling','dado','cornice'].includes(k))continue;const s=size(k);for(let tries=0;tries<80;tries++){const x=1+((tries*7.3)%(W-2)),z=1+((tries*3.7)%(D-2));if(free(x-s[0]/2,z-s[2]/2,s[0],s[2])){add(k,x,z,0);mark(x-s[0]/2,z-s[2]/2,s[0],s[2]);break}}}
  const FL=(typeof FLOORS!=='undefined'?FLOORS:(typeof require!=='undefined'?require('./floors.js'):null));const fc=FL?FL.assign(room):{};
  return{id:room.id,name:room.name,level:room.level,house,w:W,d:D,ceiling:H,floor:fc.floor||null,ceilingFinish:fc.ceiling||null,door:dw,exterior:Object.keys(ext).filter(k=>ext[k]),nominal:!R,items,runs}}
return{furnish,NOMINAL,EXTRA}})();
if(typeof module!=='undefined')module.exports=LAYOUT;
