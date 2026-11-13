import json,re,collections,html
R=json.load(open('/home/claude/room-register.json'))['rooms']; M=json.load(open('/home/claude/wall-moves-v20.json'))
BN={1:'Euphrates Hall',2:'The State Wing',3:'The Service Wing',4:'The Chapel'}
def v20(r):
    n=r['name']; s=r['state']
    if re.search(r"Maid's|Footman's",n): return 'Twelve cells become eight rooms, 9 x 11, one door each onto a new passage. New room plan'
    if n=='The Entrance Hall': return 'North wall moves: 23 x 23 clear. New room plan'
    if n in('The Day Nursery','The Night Nursery',"The Governess's Room"): return 'Nursery suite keeps its connecting doors. New room plan'
    if 'doors' in s: return 'One door, onto the passage; side doors walled up. New room plan'
    if n in('The Business Room','The Saloon','The Gun Room','The Double Library','The Tower Porch','The Long Gallery','The Saloon Gallery','The Grey Bedroom','The Orange Bedroom'): return 'Walls or doors change (see the wall plan). New room plan'
    if 'empty' in s or 'sparse' in s: return 'New room plan: it reads as bare'
    if 'same set' in s: return 'New room plan: it repeats another room'
    return 'Room plan reviewed'
rows=[]
for r in R:
    c=lambda lst: ' '.join('%s%s'%(k,v if v>1 else '') for k,v in collections.Counter(x['wall'][0].upper() for x in lst).items()) or 'none'
    tags=[t for t,k in (('empty','empty'),('sparse','sparse'),('doors','doors'),('same','same set')) if k in r['state']] or ['ok']; tag=' '.join(tags)
    rows.append({'b':r['building'],'f':r['floor'],'n':r['name'],'s':'%d x %d'%(r['w'],r['d']),'h':r['height'],'d':c(r['doors']),'w':c(r['windows']),'fi':r['fire'] or '','p':r['pieces'],'st':r['state'],'t':tag,'v':v20(r)})
cnt=collections.Counter(t for x in rows for t in x['t'].split())
mv=[{'n':m['n'],'w':BN.get(m['building'],'')+', '+{7:'state floor',17:'first floor',25:'second floor',32:'attics',0:'nave'}.get(m['y'],''),'t':m['move']} for m in M]
page='''<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Euphrates Hall: the Estate Register</title>
<style>
:root{--bg:#f6f3ec;--ink:#1d1f27;--mute:#6a6c78;--line:#d9d3c4;--card:#fffdf8;--gold:#8a6a1c;--navy:#1d2f6b;--bad:#a3261d;--warn:#8a5a00;--ok:#2d6a3a}
@media(prefers-color-scheme:dark){:root{--bg:#12141a;--ink:#ece8dc;--mute:#9a9ca8;--line:#2c303b;--card:#191c24;--gold:#d9b85a;--navy:#9db3ff;--bad:#ff8a80;--warn:#f0c060;--ok:#86d39a}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.45 Georgia,'Times New Roman',serif}
main{max-width:1100px;margin:0 auto;padding:22px 14px 60px}h1{font-size:26px;margin:0 0 2px;letter-spacing:.02em}h2{font-size:19px;margin:34px 0 8px;color:var(--gold);border-bottom:1px solid var(--line);padding-bottom:4px}
h3{font-size:15px;margin:22px 0 6px;color:var(--navy);font-family:system-ui,sans-serif;letter-spacing:.03em}
p.sub{color:var(--mute);margin:0 0 14px}.tiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(128px,1fr));gap:8px;margin:14px 0}
.tile{background:var(--card);border:1px solid var(--line);border-radius:8px;padding:10px 12px}.tile b{display:block;font-size:24px}.tile span{color:var(--mute);font:12px system-ui,sans-serif}
.bar{position:sticky;top:0;background:var(--bg);padding:8px 0;z-index:2;display:flex;gap:6px;flex-wrap:wrap;border-bottom:1px solid var(--line)}
input,button{font:14px system-ui,sans-serif}input{flex:1 1 180px;padding:8px 10px;border:1px solid var(--line);border-radius:8px;background:var(--card);color:var(--ink)}
button{padding:7px 11px;border:1px solid var(--line);border-radius:999px;background:var(--card);color:var(--ink);cursor:pointer}button.on{background:var(--ink);color:var(--bg);border-color:var(--ink)}
.wrap{overflow-x:auto;border:1px solid var(--line);border-radius:8px;background:var(--card)}table{border-collapse:collapse;width:100%;font:13px system-ui,sans-serif}
th,td{padding:7px 9px;text-align:left;border-bottom:1px solid var(--line);vertical-align:top}th{font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:var(--mute);white-space:nowrap}tr:last-child td{border-bottom:0}
td.n{font-family:Georgia,serif;font-size:14px;min-width:150px}td.num{white-space:nowrap}.st{font-weight:600}.t-empty .st,.t-doors .st{color:var(--bad)}.t-sparse .st,.t-same .st{color:var(--warn)}.t-ok .st{color:var(--ok)}
ol.mv{padding-left:22px}ol.mv li{margin:7px 0}ol.mv small{display:block;color:var(--mute);font:12px system-ui,sans-serif}.note{color:var(--mute);font-size:14px}
</style></head><body><main>
<h1>Euphrates Hall: the Estate Register</h1><p class="sub">Every room of every building, read from the Voxel Estate v1.19 as built, with what version 20 does to it. Issued 13 November 2026.</p>
<div class="tiles" id="tiles"></div>
<p class="note">Sizes are the clear floor in blocks, width by depth. Doors and windows are counted by wall: N, S, W, E. Pieces are the things standing on the floor, not what hangs on the walls. The two villages hold 32 more houses (cottages, shops, an inn and a smithy in each), furnished from four kits and not listed room by room.</p>
<h2>The wall plan for version 20</h2><p class="note">Inner walls and doors only. No outer wall moves. Three rules run through it: no passage under 5 clear on the state and first floors or under 4 elsewhere; a bedroom has one door, onto a passage, unless it is part of a suite; no door stands beside a stair foot, a rail or a column.</p><ol class="mv" id="mv"></ol>
<h2>Every room</h2><div class="bar"><input id="q" placeholder="Find a room" aria-label="Find a room"><span id="chips"></span></div><div id="list"></div>
</main><script>
const ROWS=__ROWS__,MV=__MV__,CNT=__CNT__;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
document.getElementById('tiles').innerHTML=[[ROWS.length,'rooms in 9 buildings'],[CNT.ok||0,'read as furnished'],[CNT.sparse||0,'sparse'],[CNT.empty||0,'empty'],[CNT.same||0,'repeat another room'],[CNT.doors||0,'bedrooms with more than one door']].map(t=>'<div class="tile"><b>'+t[0]+'</b><span>'+t[1]+'</span></div>').join('');
document.getElementById('mv').innerHTML=MV.map(m=>'<li>'+esc(m.t)+'<small>'+esc(m.w)+'</small></li>').join('');
const F=[['all','All'],['empty','Empty'],['sparse','Sparse'],['same','Repeats'],['doors','Too many doors'],['ok','Furnished']];let cur='all';
const chips=document.getElementById('chips');chips.innerHTML=F.map(f=>'<button data-f="'+f[0]+'"'+(f[0]==='all'?' class="on"':'')+'>'+f[1]+'</button>').join(' ');
function draw(){const q=document.getElementById('q').value.trim().toLowerCase();let h='',key='',n=0;
  for(const r of ROWS){if(cur!=='all'&&!r.t.split(' ').includes(cur))continue;if(q&&!(r.n+' '+r.b+' '+r.f).toLowerCase().includes(q))continue;const k=r.b+': '+r.f;
    if(k!==key){if(key)h+='</tbody></table></div>';key=k;h+='<h3>'+esc(k)+'</h3><div class="wrap"><table><thead><tr><th>Room</th><th>Clear floor</th><th>Height</th><th>Doors</th><th>Windows</th><th>Fire</th><th>Pieces</th><th>As it stands</th><th>Version 20</th></tr></thead><tbody>'}
    h+='<tr class="t-'+r.t.split(' ')[0]+'"><td class="n">'+esc(r.n)+'</td><td class="num">'+r.s+'</td><td>'+r.h+'</td><td class="num">'+esc(r.d)+'</td><td class="num">'+esc(r.w)+'</td><td>'+esc(r.fi)+'</td><td>'+r.p+'</td><td class="st">'+esc(r.st)+'</td><td>'+esc(r.v)+'</td></tr>';n++}
  if(key)h+='</tbody></table></div>';document.getElementById('list').innerHTML=n?h:'<p class="note">No room matches.</p>'}
chips.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;cur=b.dataset.f;for(const x of chips.querySelectorAll('button'))x.classList.toggle('on',x===b);draw()});
document.getElementById('q').addEventListener('input',draw);draw();
</script></body></html>'''
page=page.replace('__ROWS__',json.dumps(rows).replace('</','<\\/')).replace('__MV__',json.dumps(mv).replace('</','<\\/')).replace('__CNT__',json.dumps(cnt))
open('/home/claude/register/index.html','w').write(page); print(len(page),dict(cnt))
