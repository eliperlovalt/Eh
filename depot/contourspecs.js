/* contourspecs.js : Parts Depot v15. The Estate's own building specs, copied out of Estate v1.14 so the Depot can preview the contours.
   In the Estate, hand CONTOURS.dress your live specs instead; this file is only for the Depot. */
const CONTOUR_SPECS=(()=>{const TW=(x0,z0)=>({x0,z0,x1:x0+20,z1:z0+20,yb:38,roofY:46,roof:'flat',winEvery:5,winW:2});
const LM=[{y:0,wr:[2,4]},{y:7,wr:[2,6]},{y:17,wr:[2,5]},{y:25,wr:[2,4]},{y:32,wr:[2,3]},{y:38,wr:[2,5]},{y:46,wr:[2,5]}];
const B={
 hall:{name:'Euphrates Hall',style:'hall',wall:'#d8ccae',roofC:'#6b6f78',levels:LM,boxes:[{x0:-64,z0:-66,x1:64,z1:30,roofY:38,roof:'flat',winEvery:5,winW:2},TW(-64,-66),TW(44,-66),TW(-64,10),TW(44,10),{x0:-12,z0:-32,x1:12,z1:-8,yb:38,roofY:54,roof:'dome',winEvery:4,winW:2}],
   doors:[[-1,8,30,1,13,30],[-12,8,-66,-10,13,-66],[-64,1,-53,-64,5,-52],[-1,39,-32,1,43,-32]],neighbours:['state','service'],balconyDoors:[[-8,-7,17],[7,8,17]],
   existing:[{what:'south terrace',x0:-26.5,z0:30.5,x1:26.5,z1:42.5,y1:7.5},{what:'north terrace',x0:-14.5,z0:-78.5,x1:14.5,z1:-66.5,y1:7.5}]},
 state:{name:'The State Wing',style:'state',wall:'#d8ccae',roofC:'#6b6f78',levels:[{y:0,wr:[2,4]},{y:7,wr:[3,10]},{y:20,wr:[2,6]}],boxes:[{x0:-128,z0:-24,x1:-65,z1:16,roofY:30,roof:'flat',winEvery:5,winW:2}],doors:[[-65,8,-19,-64,12,-17],[-65,1,-21,-63,5,-20],[-100,1,16,-99,5,16]],neighbours:['hall']},
 service:{name:'The Service Wing',style:'service',wall:'#d8ccae',roofC:'#6b6f78',levels:[{y:0,wr:[2,4]},{y:7,wr:[2,4]}],boxes:[{x0:65,z0:-24,x1:128,z1:16,roofY:14,roof:'flat',winEvery:4,winW:1}],doors:[[64,1,-6,65,5,-5],[95,1,16,96,5,16],[100,1,-24,101,5,-24]],neighbours:['hall']},
 chapel:{name:'The Chapel',style:'chapel',wall:'#cfc9bd',roofC:'#4a4f5c',levels:[{y:-5},{y:0}],boxes:[{x0:-176,z0:-91,x1:-168,z1:-85,roofY:24,roof:'spire'},{x0:-168,z0:-94,x1:-142,z1:-82,roofY:14,roof:'gableX',ov:[0,1,1,1],winRows:[2,9],winEvery:4}],doors:[[-176,1,-89,-176,4,-87],[-168,1,-89,-168,4,-87],[-156,1,-82,-154,5,-82]]},
 glass:{name:'The Glasshouse',style:'glass',wall:'#a8e4dc',roofC:'#a8e4dc',levels:[{y:0}],boxes:[{x0:146,z0:-44,x1:190,z1:-22,roofY:8,roof:'arch',glassWalls:true}],doors:[[167,1,-22,169,5,-22],[146,1,-34,146,5,-32]]},
 stable:{name:'The Stable Court',style:'stable',wall:'#8a4b32',roofC:'#3d3a40',levels:[{y:0,wr:[2,5]},{y:9,wr:[2,3]}],boxes:[{x0:72,z0:-112,x1:136,z1:-98,roofY:15,roof:'gableX',winEvery:4},{x0:72,z0:-98,x1:86,z1:-64,roofY:15,roof:'gableZ',winEvery:4},{x0:137,z0:-112,x1:169,z1:-84,roofY:13,roof:'gableZ',only:[0],winRows:[2,9],winEvery:4}],
   doors:[[90,1,-98,93,5,-98],[117,1,-98,118,5,-98],[129,1,-98,131,5,-98],[86,1,-92,86,6,-86],[136,1,-108,137,5,-104],[150,1,-84,154,6,-84],[86,1,-71,86,5,-70]]},
 gate:{name:'The Gatehouse',style:'gate',wall:'#bdb5a2',roofC:'#bdb5a2',levels:[{y:0},{y:7}],boxes:[{x0:-16,z0:194,x1:-6,z1:206,roofY:14,roof:'flat'},{x0:6,z0:194,x1:16,z1:206,roofY:14,roof:'flat'}],doors:[[-6,1,199,-6,5,201],[6,1,199,6,5,201]]},
 lodge:{name:'The Lodge',style:'lodge',wall:'#bdb5a2',roofC:'#2b3a5e',levels:[{y:0}],boxes:[{x0:24,z0:168,x1:38,z1:180,roofY:7,roof:'hip'}],doors:[[24,1,173,24,5,175]]},
 farm:{name:'The Home Farm and Woodyard',style:'farm',wall:'#9c2f26',roofC:'#4a3a30',levels:[{y:0}],boxes:[{x0:-160,z0:120,x1:-134,z1:138,roofY:9,roof:'gableX',winRows:[2,5]},{x0:-132,z0:120,x1:-118,z1:132,roofY:7,roof:'gableZ',wall:'#d8ccae'}],doors:[[-150,1,138,-144,5,138],[-134,1,128,-134,4,130],[-126,1,132,-124,5,132]]}};
const VILLAGE=['cottage','bakery','shop','smithy','school','inn','church'],COUNT={cottage:20,bakery:2,shop:2,smithy:2,school:2,inn:2,church:2};
return{B,VILLAGE,COUNT,ORDER:['hall','state','service','chapel','glass','stable','gate','lodge','farm']}})();
if(typeof module!=='undefined')module.exports=CONTOUR_SPECS;
