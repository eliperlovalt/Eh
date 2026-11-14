/* =========================================================
   Euphrates Hall Parts Depot: sets.js (batch 3, Nov 12, 2026)
   Ready-made outdoor sets and village interiors, stamped wherever the main chat puts them.
   SETS.build(name) -> {name,label,w,d,where,ground:[{x,z,w,d,pattern}],items:[{k,o,x,y,z,r}],runs:[...],floor,ceiling}
   Same conventions as layout.js: blocks, x from the set's west edge, z from its north edge, y up,
   r = facing in degrees (0 faces +z). ground patches name a floors.js pattern to paint.
   ========================================================= */
const SETS=(()=>{
function mk(name,label,w,d,where){const S={name,label,w,d,where,ground:[],items:[],runs:[]};S.add=(k,x,z,r=0,y=0,o)=>{S.items.push({k,o:o||{},x:+x.toFixed(2),y:+y.toFixed(2),z:+z.toFixed(2),r});return S};S.g=(x,z,w,d,pattern)=>{S.ground.push({x,z,w,d,pattern});return S};return S}
const B={};
B.parterre=()=>{const S=mk('parterre','The parterre, below the south terrace',40,40,'Park, south of the house');S.g(0,0,40,40,'gravel');
  for(let i=0;i<4;i++)for(let j=0;j<4;j++){if((i===1||i===2)&&(j===1||j===2))continue;S.add('boxParterre',4+i*10.6,4+j*10.6,0,0,{seed:i*4+j,c:['#c0262b','#e8a0b4','#7b4fa0','#e3b23c'][(i+j)%4]})}
  S.g(14,14,12,12,'lawn');S.add('fountain',20,20);for(const[x,z]of[[1.2,1.2],[38.8,1.2],[1.2,38.8],[38.8,38.8]])S.add('statue',x,z,x<20?(z<20?45:135):(z<20?315:225));
  for(const[x,z,r]of[[20,1.2,0],[20,38.8,180],[1.2,20,90],[38.8,20,270]]){S.add('bench',x,z,r);S.add('urn',x-3,z+(z<20?0:0),0);S.add('urn',x+3,z,0)}
  for(const[x,z]of[[9.3,9.3],[30.7,9.3],[9.3,30.7],[30.7,30.7]])S.add('topiary',x,z);for(let t=.5;t<40;t+=1){S.add('lavender',t,.3,0,0,{seed:t*3|0});S.add('lavender',t,39.7,0,0,{seed:t*5|0})}return S};
B.kitchenGarden=()=>{const S=mk('kitchenGarden','The walled kitchen garden',48,32,'East of the service wing');S.g(0,0,48,32,'lawn');S.g(22,0,4,32,'gravel');S.g(0,14,48,4,'gravel');
  for(const x of[1,25])for(const z of[1,4.5,8.5,19,22.5,26.5])S.add('vegetableBed',x+10.5,z+.6,0,0,{seed:x*7+z|0});S.add('sundial',24,16);
  for(let z=2;z<=30;z+=3.6)S.add('rosePergola',24,z,90,0,{seed:z|0});S.add('coldFrame',4,17.4);S.add('coldFrame',44,17.4);S.add('wheelbarrow',20,13);
  for(const x of[3,8,40,45])S.add('beehive',x,30.8);for(const x of[6,42])S.add('treeApple',x,30-4,0,0,{seed:x});S.add('glasshouseBench',46.5,8,0);S.add('bench',24,30.8,180);return S};
B.stableYard=()=>{const S=mk('stableYard','The stable yard and forge',40,32,'Stable Court, north-east');S.g(0,0,40,32,'cobbles');
  for(let i=0;i<6;i++)S.add('stableStall',3.4+i*6.6,2.8,0);S.add('waterTrough',20,16);S.add('carriage',8,20,90,0,{house:'gold'});S.add('cart',30,24,270);S.add('haystack',36,29);
  S.add('forgeHearth',3,29.6,180);S.add('anvil',6,26.5,0);S.add('grindstone',10,28.5,0);S.add('horseshoeRack',1.5,24,90);S.add('saddleRack',38.5,14,270);for(const[x,z]of[[1,12],[39,12],[20,31]])S.add('lampPost',x,z);S.add('wheelbarrow',24,9,30);return S};
B.villageSquare=()=>{const S=mk('villageSquare','The village square',36,28,'Each village');S.g(0,0,36,28,'cobbles');S.g(14,10,8,8,'flagstone');S.add('well',18,14);
  S.add('marketStall',6,4,0,0,{c:'#a4161a',seed:1});S.add('marketStall',30,4,0,0,{c:'#2e5e9e',seed:2});S.add('marketStall',6,24,180,0,{c:'#3fa34d',seed:3});S.add('waterTrough',30,22,90);
  for(const[x,z]of[[12,9],[24,9],[12,19],[24,19]])S.add('lampPost',x,z);S.add('bench',18,24.5,180);S.add('bench',18,3.5,0);S.add('cart',32,13,270);S.add('treeOak',2,14,0,0,{seed:5});S.add('innSign',35.6,8,270);return S};
B.forecourt=()=>{const S=mk('forecourt','The forecourt and lodge gates',48,24,'Before the porte-cochere');S.g(0,0,48,24,'gravel');S.g(4,4,12,12,'lawn');S.g(32,4,12,12,'lawn');
  S.add('statue',10,10);S.add('statue',38,10);S.add('gatePier',18,23.2,0,0,{house:'gold'});S.add('gatePier',30,23.2,0,0,{house:'gold'});S.add('ironGate',19,23.2,0);S.add('ironGate',29,23.2,180);
  for(const[x,z]of[[2,2],[46,2],[2,22],[46,22],[16,12],[32,12]])S.add('lampPost',x,z);for(const x of[6,14,34,42])S.add('topiary',x,18);S.add('urn',24,2);return S};
B.lakeLanding=()=>{const S=mk('lakeLanding','The lake landing',16,24,'The lake shore');S.g(0,0,16,10,'gravel');for(let i=0;i<4;i++)S.add('jetty',8,10.9+i*1.84,0);S.add('rowboat',11.2,15,0);S.add('rowboat',4.8,17,180,0,{house:'blue'});
  S.add('bench',8,2,0);S.add('lampPost',13,8);S.add('treeBirch',2,3,0,0,{seed:3});S.add('treeBirch',14,2,0,0,{seed:9});return S};
/* village interiors */
B.cottage=()=>{const S=mk('cottage','A cottage, one room',10,8,'Each cottage');S.floor='flagstone';S.ceiling='beamed';S.add('inglenook',5,.5,0);S.add('settle',2,3,90);S.add('ragRug',5,3.2);S.add('trestleTable',6.5,5.8,90,0,{len:10});
  S.add('windsor',4.8,6.8,0);S.add('windsor',8.2,6.8,0);S.add('boxBed',8.6,2.4,180);S.add('welshDresser',1.4,6.5,90);S.add('spinningWheel',3.5,6,30);S.runs.push({k:'beam',o:{},wall:'ceiling',a:0,b:10,y:5,every:2.5});return S};
B.inn=()=>{const S=mk('inn','The inn\'s common room',16,12,'Each village');S.floor='flagstone';S.ceiling='beamed';S.add('inglenook',8,.5,0);S.add('settle',4,3.5,90);S.add('settle',12,3.5,270);S.add('counter',8,10.8,180);
  for(const[x,z]of[[3.5,7.5],[12.5,7.5]]){S.add('trestleTable',x,z,90,0,{len:12});for(const dx of[-2,0,2]){S.add('windsor',x+dx,z-1.8,0)}}S.add('lanternPendant',5,6,0,5-3.6);S.add('lanternPendant',11,6,0,5-3.6);S.add('ragRug',8,4);
  S.runs.push({k:'beam',o:{},wall:'ceiling',a:0,b:16,y:5,every:2.5});return S};
B.smithy=()=>{const S=mk('smithy','The village smithy',12,10,'Each village');S.floor='flagstone';S.ceiling='beamed';S.add('forgeHearth',3.5,.9,0);S.add('anvil',6,3.5,0);S.add('grindstone',9.5,2.5,0);S.add('horseshoeRack',11.8,5,270);
  S.add('waterTrough',3,8.6,0);S.add('saddleRack',.2,5,90);S.add('wheelbarrow',9,8,200);return S};
B.church=()=>{const S=mk('church','The village church nave',24,12,'Each village');S.floor='encaustic';S.ceiling='vaulted';S.add('altarTable',12,1,0);S.add('lectern',8,3.5,30);S.add('candleStand',16,3.2);S.add('font',12,10.6);
  for(let i=0;i<5;i++){S.add('pew',7,5+i*1.3,180);S.add('pew',17,5+i*1.3,180)}for(const x of[3,21])S.add('sash',x,0,0);S.add('sconce',.1,6,90);S.add('sconce',23.9,6,270);return S};
B.churchTower=()=>{const S=mk('churchTower','The church bell chamber',6,6,'Each village church tower');S.floor='boards';S.ceiling='beamed';S.add('churchBell',3,3,0);return S};
B.shop=()=>{const S=mk('shop','The village shop',10,8,'One per village');S.floor='boards';S.ceiling='plaster';S.add('counter',5,4,0);S.add('shopShelves',5,.35,0);S.add('shopShelves',.35,5,90);S.add('windsor',8.5,6.5,200);S.add('lanternPendant',5,4,0,5-3.6);return S};
function build(name){const f=B[name];if(!f)throw new Error('No set '+name);const S=f();delete S.add;delete S.g;return S}
return{build,names:Object.keys(B)}})();
if(typeof module!=='undefined')module.exports=SETS;
