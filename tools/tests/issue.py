"""A7: re-issue the Estate's data as built. python3 issue.py FOLDER [VERSION]
Writes room-register.json and windows.json at the repo root and src/estate-plan.json, all read from the page (regRow, holesOf, windows)."""
import sys, os, json, datetime
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from harness import serve, open_estate
from playwright.sync_api import sync_playwright
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
folder = sys.argv[1]; ver = sys.argv[2] if len(sys.argv) > 2 else ''
JS = r"""()=>{const V=__vx,SK=/^(cornice|dado|panelling|beamRun|lanternPendant|chandelier|chandelierGilt|chandelierIron|coffer|ceilingRose|hammerbeam|skylight|corniceIn|candle|sash|wallLantern|portrait|sconce|pictureRail|tapestry|banner|bellPull|antlers|coatOfArms|doorDouble|archway|rug|ragRug|stairRunner)$/;
 const reg=[],plan=[],W1={north:'N',south:'S',west:'W',east:'E'};
 for(let b=1;b<V.BLD.length;b++){const B=V.BLD[b],rooms=[];for(const R of B.rooms){const row=V.regRow(R);
   const its=V.pq.filter(p=>p.bid===b&&!p.v&&!p.wint&&p.x>R.x0&&p.x<R.x1&&p.z>R.z0&&p.z<R.z1&&p.y>=R.y&&p.y<R.y+1.3&&!SK.test(p.r.kind));const kinds={};for(const p of its)kinds[p.r.kind]=(kinds[p.r.kind]||0)+1;
   let fire=null;for(const p of its)if(p.r.kind==='fireplace'){const dd={north:p.z-R.z0,south:R.z1-p.z,west:p.x-R.x0,east:R.x1-p.x};fire=Object.keys(dd).sort((a,c)=>dd[a]-dd[c])[0]}
   reg.push({building:B.name,bid:b,floor:row.floor,y:R.y,name:R.n,rect:row.rect,w:R.x1-R.x0-1,d:R.z1-R.z0-1,height:row.height,doors:row.doors.map(x=>Object.assign(x,{width:x.to-x.from+1})),windows:row.windows,fire,pieces:its.length,kinds,plan:R.plan20||null});
   const ns=w=>w==='north'||w==='south',loc=x=>[W1[x.wall],(x.from-(ns(x.wall)?R.x0:R.z0))-.5,(x.to-(ns(x.wall)?R.x0:R.z0))+.5];
   rooms.push({n:R.n,depot:R.plan20||null,level:row.floor,box:row.rect,y:R.y,w:R.x1-R.x0,d:R.z1-R.z0,ceil:row.height,doors:row.doors.map(loc),windows:row.windows.map(loc),holes:V.holesOf(R),placed:its.length})}
  plan.push({name:B.name,rooms})}
 return {reg,plan,win:V.windows()}}"""
with serve(folder) as base, sync_playwright() as p:
    b, pg, err = open_estate(p, base); pg.wait_for_timeout(3000)
    r = pg.evaluate(JS); b.close()
day = datetime.date.today().isoformat()
json.dump({'issued': day, 'estate': ver, 'note': 'Rect is [x0,z0,x1,z1] on the wall lines; w and d are the clear floor inside. Doors and windows give the wall and the run of blocks along it. North is -z, east is +x. plan is the Depot v20 room type each room was planned as.', 'rooms': r['reg']}, open(os.path.join(ROOT, 'room-register.json'), 'w'), indent=0)
json.dump({'note': 'Euphrates Hall, Estate %s: every window and outside door as built. x and z are the centre on the wall line, y the lowest cell, w and h in blocks.' % ver, 'version': ver.lstrip('v'), 'rows': r['win']}, open(os.path.join(ROOT, 'windows.json'), 'w'), separators=(',', ':'))
json.dump({'version': ver, 'made': day, 'convention': 'World blocks. x east, z south, y up. Room box x0..x1, z0..z1 are the wall lines; the inside is x0+1..x1-1. Local coords: lx = wx-(x0+0.5), lz = wz-(z0+0.5), so lx runs 0..w where w=x1-x0. doors/windows: [wall, a0, a1] in local blocks along that wall (N and S walls run along x; W and E along z). holes: stairwells, voids, steps and the 2 kept clear round them, local [lx0,lz0,lx1,lz1] by cell. ceil: clear height in blocks. depot: the Depot v20 room type it was planned as.', 'buildings': r['plan']}, open(os.path.join(ROOT, 'src', 'estate-plan.json'), 'w'), separators=(',', ':'))
print('rooms', len(r['reg']), 'windows', len(r['win']), 'errors', err)
