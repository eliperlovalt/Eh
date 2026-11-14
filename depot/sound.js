/* Euphrates Hall, Parts Depot: SOUND v1 (the soundscape)
   Every sound is synthesized live with WebAudio: no files, nothing to download, nothing to license.
   Driven by SEASONS.state, so it follows the real clock and calendar:
     wind (stronger in winter and in weather), rain, water lapping at the shore, a fire's roar and crackle,
     birdsong (a dawn chorus, quieter by day, a few at dusk, almost none in winter), crickets on summer nights,
     a tawny owl after dark, ducks by the water, and the church bell striking the hour from seven to ten.

   const snd=SOUND.Soundscape(audioContext?)   (browsers need a tap before sound may start: call snd.start() from a click)
   snd.update(dt,{st, water:0..1, fire:0..1, indoor:bool})   every frame
   snd.stop(), snd.volume(v), snd.bell(n), snd.events (a log of what it played) */
const SOUND=(()=>{
function Soundscape(ac){let ctx=ac||null,master,layers=null,on=false,t=0,lastBell='',vol=.8;const events=[];const log=e=>{events.push(e);if(events.length>40)events.shift()};
  function init(){if(!ctx)ctx=new (window.AudioContext||window.webkitAudioContext)();master=ctx.createGain();master.gain.value=vol;const comp=ctx.createDynamicsCompressor();master.connect(comp);comp.connect(ctx.destination);
    const sr=ctx.sampleRate,len=sr*3;const white=ctx.createBuffer(1,len,sr),brown=ctx.createBuffer(1,len,sr);const w=white.getChannelData(0),b=brown.getChannelData(0);let last=0;
    for(let i=0;i<len;i++){w[i]=Math.random()*2-1;last=(last+.02*w[i])/1.02;b[i]=last*3.5}
    const bed=(buf,type,f,q)=>{const s=ctx.createBufferSource();s.buffer=buf;s.loop=true;s.loopStart=Math.random();const fl=ctx.createBiquadFilter();fl.type=type;fl.frequency.value=f;if(q)fl.Q.value=q;const g=ctx.createGain();g.gain.value=0;s.connect(fl);fl.connect(g);g.connect(master);s.start();return{s,fl,g}};
    layers={wind:bed(brown,'lowpass',420),water:bed(brown,'lowpass',320),rain:bed(white,'bandpass',3200,.5),roar:bed(brown,'lowpass',170),white,brown}}
  const T=()=>ctx.currentTime;const set=(p,v,tc=.6)=>p.setTargetAtTime(v,T(),tc);
  const pan=x=>{const p=ctx.createStereoPanner?ctx.createStereoPanner():null;if(p){p.pan.value=x;p.connect(master);return p}return master};
  function tone(type,f0,f1,t0,dur,amp,out,curve){const o=ctx.createOscillator();o.type=type;o.frequency.setValueAtTime(f0,t0);if(curve)o.frequency.setValueCurveAtTime(curve,t0,dur);else o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t0+dur);
    const g=ctx.createGain();g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(amp,t0+Math.min(.02,dur*.2));g.gain.exponentialRampToValueAtTime(.0001,t0+dur);o.connect(g);g.connect(out);o.start(t0);o.stop(t0+dur+.05);return o}
  /* voices */
  function bird(kind,indoor){const t0=T()+.05,out=pan(Math.random()*1.6-.8),a=(indoor?.012:.05)*(.5+Math.random()*.5);let t=t0;
    if(kind==='robin'){const n=5+(Math.random()*6|0);for(let i=0;i<n;i++){const f=2600+Math.random()*2200,d=.06+Math.random()*.09;tone('sine',f,f*(.8+Math.random()*.5),t,d,a,out);t+=d+.02+Math.random()*.05}}
    else if(kind==='blackbird'){const n=3+(Math.random()*4|0);for(let i=0;i<n;i++){const f=1400+Math.random()*1100,d=.14+Math.random()*.16;tone('sine',f,f*(1+Math.random()*.25-.1),t,d,a*1.1,out);t+=d+.03}}
    else{const n=2+(Math.random()*4|0);for(let i=0;i<n;i++){const f=3800+Math.random()*1200;tone('triangle',f,f*.7,t,.045,a*.7,out);t+=.11}}log(kind)}
  function owl(){const t0=T()+.05,out=pan(Math.random()*1.2-.6);const v=(t,d,f)=>{const o=ctx.createOscillator();o.frequency.setValueAtTime(f,t);o.frequency.linearRampToValueAtTime(f*.93,t+d);const lf=ctx.createOscillator();lf.frequency.value=22;const lg=ctx.createGain();lg.gain.value=9;lf.connect(lg);lg.connect(o.frequency);
      const g=ctx.createGain();g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.05,t+.06);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(out);o.start(t);lf.start(t);o.stop(t+d+.05);lf.stop(t+d+.05)};
    v(t0,.5,410);v(t0+1.4,.18,400);v(t0+1.7,.9,395);log('owl')}
  function crickets(){const t0=T()+.02,out=pan(Math.random()*1.6-.8);for(let i=0;i<3;i++)tone('sine',4700,4650,t0+i*.045,.028,.012,out);log('cricket')}
  function duck(){const t0=T()+.05,out=pan(Math.random()*1.2-.6);const n=2+(Math.random()*3|0);for(let i=0;i<n;i++){const t=t0+i*.24;const o=ctx.createOscillator();o.type='sawtooth';o.frequency.setValueAtTime(300,t);o.frequency.exponentialRampToValueAtTime(190,t+.16);
      const bp=ctx.createBiquadFilter();bp.type='bandpass';bp.frequency.value=1100;bp.Q.value=3.5;const g=ctx.createGain();g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.06,t+.015);g.gain.exponentialRampToValueAtTime(.0001,t+.17);o.connect(bp);bp.connect(g);g.connect(out);o.start(t);o.stop(t+.2)}log('duck')}
  function crackle(level){const t0=T()+Math.random()*.05,s=ctx.createBufferSource();s.buffer=layers.white;const bp=ctx.createBiquadFilter();bp.type='bandpass';bp.frequency.value=1200+Math.random()*3500;bp.Q.value=1.2;const g=ctx.createGain();const a=.05*level*(.3+Math.random());
    g.gain.setValueAtTime(a,t0);g.gain.exponentialRampToValueAtTime(.0001,t0+.012+Math.random()*.04);s.connect(bp);bp.connect(g);g.connect(pan(Math.random()*.6-.3));s.start(t0,Math.random()*2);s.stop(t0+.08)}
  function drip(){const f=900+Math.random()*900;tone('sine',f,f*1.8,T()+.02,.05,.018,pan(Math.random()*1.4-.7))}
  function bell(n){const out=pan(.35);const F=196,P=[[.5,1,9],[1,.9,7],[1.19,.55,5],[1.5,.4,4],[2,.5,3.4],[2.52,.25,2.2],[3,.18,1.6],[4.07,.08,1]];
    for(let i=0;i<n;i++){const t0=T()+.1+i*2.4;for(const[r,a,d]of P){const o=ctx.createOscillator();o.frequency.value=F*r*(1+(Math.random()-.5)*.002);const g=ctx.createGain();g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(.07*a,t0+.006);g.gain.exponentialRampToValueAtTime(.0001,t0+d);o.connect(g);g.connect(out);o.start(t0);o.stop(t0+d+.1)}}log('bell x'+n)}
  function chimeNote(f,t0,a=.05,d=2.6,out){const P=[[1,1,d],[2,.35,d*.6],[2.76,.18,d*.4],[5.4,.06,d*.2]];for(const[r,am,dd]of P){const o=ctx.createOscillator();o.frequency.value=f*r;const g=ctx.createGain();g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(a*am,t0+.005);g.gain.exponentialRampToValueAtTime(.0001,t0+dd);o.connect(g);g.connect(out);o.start(t0);o.stop(t0+dd+.1)}}
  function clock(q,strikes){const out=pan(-.2),N={g:415.3,f:370,e:329.6,b:246.9},S=[['g','f','e','b'],['e','g','f','b'],['e','f','g','e'],['g','e','f','b'],['b','f','g','e']];const seq={1:[0],2:[1,2],3:[3,4,0],4:[1,2,3,4]}[q]||[0];let t=T()+.1;
    for(const i of seq){S[i].forEach((n,j)=>chimeNote(N[n],t+j*.62,.045,2.4,out));t+=4*.62+.7}if(q===4)for(let i=0;i<(strikes||0);i++)chimeNote(164.8,t+.6+i*1.9,.07,3.4,out);log('chime '+q+(q===4?' x'+strikes:''))}
  function gong(){const out=pan(0),t0=T()+.05;for(const[r,a,d]of[[1,1,7],[1.48,.6,5],[2.07,.45,4],[2.9,.3,3],[3.63,.2,2.2],[5.1,.1,1.4]]){const o=ctx.createOscillator();o.frequency.setValueAtTime(92*r*1.03,t0);o.frequency.exponentialRampToValueAtTime(92*r,t0+.6);const g=ctx.createGain();g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(.09*a,t0+.02);g.gain.exponentialRampToValueAtTime(.0001,t0+d);o.connect(g);g.connect(out);o.start(t0);o.stop(t0+d+.1)}log('gong')}
  /* the gramophone: an original sixteen-bar waltz, played thin through a horn */
  const mus={on:false,t:0,i:0,out:null},MEL=[[76,74,72],[67,72,76],[74,71,67],[62,67,71],[77,74,71],[67,71,74],[76,72,67],[72,0,0],[77,76,74],[72,69,65],[76,72,67],[64,67,72],[74,71,67],[65,62,59],[60,64,67],[72,0,0]],CH=[[48,64,67],[48,64,67],[43,62,65],[43,62,65],[43,59,65],[43,62,65],[48,64,67],[48,64,67],[41,60,65],[41,60,65],[48,64,67],[48,64,67],[43,62,65],[43,59,65],[48,64,67],[48,64,67]];const hz=m=>440*Math.pow(2,(m-69)/12);
  function music(want){if(!want){mus.on=false;return}if(!mus.out){const bp=ctx.createBiquadFilter();bp.type='bandpass';bp.frequency.value=1500;bp.Q.value=.6;bp.connect(master);mus.out=bp}if(!mus.on){mus.on=true;mus.t=T()+.15;mus.i=0}const beat=.44;
    while(mus.t<T()+.6){const b=mus.i%16;MEL[b].forEach((m,j)=>{if(m)tone('triangle',hz(m),hz(m),mus.t+j*beat,j===2||!MEL[b][j+1]?beat*1.6:beat*.95,.05,mus.out)});tone('sine',hz(CH[b][0]),hz(CH[b][0]),mus.t,beat*1.2,.06,mus.out);for(const j of[1,2])for(const m of CH[b].slice(1))tone('triangle',hz(m),hz(m),mus.t+j*beat,beat*.5,.018,mus.out);mus.t+=3*beat;mus.i++;if(b===0)log('waltz')}}
  /* the mix */
  const chance=(rate,dt)=>Math.random()<rate*dt;
  function update(dt,sc={}){if(!on||!layers)return;t+=dt;const st=sc.st;if(!st)return;const indoor=!!sc.indoor,ice=st.ice>.6;
    const gust=.6+.4*Math.sin(t*.13)*Math.sin(t*.051+1)+.15*Math.sin(t*.7);const windL=(.035+.05*(st.season==='winter'?1:st.season==='autumn'?.6:.3)+(st.raining||st.snowing?.05:0))*gust*(indoor?.35:1);
    set(layers.wind.g.gain,windL,1.2);set(layers.wind.fl.frequency,280+260*gust,1.2);
    const wl=(sc.water||0)*(ice?0:1)*(indoor?0:1);set(layers.water.g.gain,wl*.11*(.55+.45*Math.sin(t*.85)*Math.sin(t*.37+2)),.3);
    music(!!sc.music);set(layers.rain.g.gain,st.raining?(indoor?.05:.13):0,1);set(layers.roar.g.gain,(sc.fire||0)*.16,.8);
    if(sc.fire&&chance(14*sc.fire,dt))crackle(sc.fire);if(wl>.2&&chance(.5*wl,dt))drip();
    const m=st.mins,dawn=m>st.rise-35&&m<st.rise+90,dusk=m>st.set-70&&m<st.set+10,day=st.alt>2;
    const sea={spring:1.3,summer:1,autumn:.45,winter:.18}[st.season]*(st.raining?.2:1)*(indoor?.5:1);const rate=(dawn?2.6:dusk?.9:day?.45:0)*sea;
    if(chance(rate,dt)){const r=Math.random();bird(r<.45?'robin':r<.75?'blackbird':'sparrow',indoor)}
    if(st.night>.7&&!indoor&&chance(.025,dt))owl();if(st.night>.6&&st.doy>=165&&st.doy<=262&&!indoor&&!st.raining&&chance(5,dt))crickets();
    if(wl>.2&&day&&!ice&&chance(.035,dt))duck();
    const h=Math.floor(m/60);if(sc.clock){const q=Math.floor((m%60)/15),k2=st.date.toDateString()+h+'q'+q;if(m%15<1.2&&k2!==lastBell){lastBell=k2;clock(q===0?4:q,h%12||12)}}else{const key=st.date.toDateString()+h;if(sc.bell!==false&&m%60<1.5&&h>=7&&h<=22&&key!==lastBell){lastBell=key;bell(h%12||12)}}}
  return{start(){if(!layers)init();if(ctx.state==='suspended'&&!ctx.startRendering)ctx.resume();on=true;master.gain.setTargetAtTime(vol,T(),.3)},stop(){on=false;if(master)master.gain.setTargetAtTime(0,T(),.2)},
    volume(v){vol=v;if(master&&on)master.gain.setTargetAtTime(v,T(),.2)},update,bell:n=>{if(!layers)init();bell(n)},gong:()=>{if(!layers)init();gong()},clock:(q,n)=>{if(!layers)init();clock(q,n)},events,get ctx(){return ctx},get on(){return on}}}
return{Soundscape}})();
if(typeof module!=='undefined')module.exports=SOUND;
