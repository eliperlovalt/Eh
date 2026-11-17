"""Objects (Estate Final, batch D). python3 objects_test.py FOLDER [OUT.json]
Every placed piece (the prop queue) is measured against the house:
  sunk      its foot is more than 0.3 below the floor under it (only its top shows: the "rails lying on the floor")
  floating  its foot is more than 0.3 above any floor or piece under it, and it is not a wall or ceiling piece
  low       a hanging piece whose lowest point is under 2.6 above the floor it hangs over (head height on a path)
  twins     two long-case clocks, stoves or four-posters in one room
Target: zero of each. ENFORCE=0 reports without failing."""
import sys, os, json, collections
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from harness import serve, open_estate
from playwright.sync_api import sync_playwright
SCAN = r"""()=>{const V=__vx,solid=(x,y,z)=>{const g=V.G(x,y,z);return !!g&&!V.isWin(g)&&!V.isInv(g)},any=(x,y,z)=>!!V.G(x,y,z);
  const WALL=/^(dado|panelling|cornice|sash|portrait|tapestry|bellPull|doorDouble|sconce|wallLantern|antlers|coatOfArms|banner|bellBoard|noticeBoard|wallCalendar|keyCabinet|toolWall|brushRack|lampShelf|menuSlate|plateRack|hamHooks|copperRack|stageCurtain|coffer|beam|hammerbeam|ceilingRose|mantelGarland|stockingRow|wreath|lightString|eaveGarland|photoFrames|silverShelves|larderShelves|horseshoeRack|saddleRack|shopShelves|innSign|flagLocker|pigeonholes|churchBell|balustrade|balustradePost|balPost|stairFlight|newelPost|column|inglenook|fireplace|rug|ragRug|bookcase|pictureRail|hymnBoard|dartBoard|dryingRack|clockMovement|churchBell|lampPost)$/;
  const HANG=/^(chandelier|chandelierGilt|chandelierIron|lantern|lanternPendant|birdcage)$/;
  const rooms=[];V.BLD.forEach((B,b)=>{if(B&&B.rooms)for(const R of B.rooms)rooms.push({b,R})});
  const roomOf=(it)=>{for(const{b,R}of rooms)if(b===it.bid&&it.x>R.x0&&it.x<R.x1&&it.z>R.z0&&it.z<R.z1&&it.y>=R.y&&it.y<=(R.yt||R.y+12)+1)return R;return null};
  const out={n:0,sunk:[],floating:[],low:[],twins:[]},per=new Map();
  for(const it of V.pq){if(!it.r||!it.r.kind||it.wint)continue;const k=it.r.kind,B=V.pbox(it.r);out.n++;const x=Math.round(it.x),z=Math.round(it.z),foot=it.y+B.y0,R=it.bid?roomOf(it):null;
    if(R&&/^(clockLong|stove|fourPosterOak|kitchenRange|grandPiano|billiard)$/.test(k)){const key=R.n+'|'+R.l+'|'+k;per.set(key,(per.get(key)||0)+1)}
    if(HANG.test(k)){let fy=null;for(let y=Math.floor(foot);y>foot-14;y--)if(solid(x,y,z)){fy=y+.5;break}if(fy!=null&&foot-fy<2.6&&foot-fy>.2)out.low.push([k,R?R.n:'',+it.x.toFixed(1),+it.y.toFixed(1),+it.z.toFixed(1),+(foot-fy).toFixed(2)]);continue}
    if(WALL.test(k)||(B.y1-B.y0)<.12)continue;
    /* the floor under the foot: the highest solid top at or below foot+0.6, over the piece's middle cells */
    let top=99;for(const[dx,dz]of[[0,0],[1,0],[-1,0],[0,1],[0,-1]]){for(let y=Math.floor(foot+1.2);y>foot-6;y--)if(solid(x+dx,y,z+dz)){top=Math.min(top,y+.5);break}}if(top>90)top=-99;   /* the lowest floor among the piece's own cell and its neighbours: a wall beside it stands higher and is passed over */
    if(R)top=R.y+.5;   /* in a room the floor is the room's own: a piece against a wall would be measured against the wall */
    if(top<-90)continue;const gap=foot-top;
    if(gap<-.3)out.sunk.push([k,R?R.n:'',+it.x.toFixed(1),+it.y.toFixed(1),+it.z.toFixed(1),+gap.toFixed(2)]);
    else if(gap>.3&&!it.onTop){let held=false;for(const o of V.pq){if(o===it||!o.r||!o.r.kind)continue;if(Math.abs(o.x-it.x)>3||Math.abs(o.z-it.z)>3)continue;const Q=V.pbox(o.r),ot=o.y+Q.y1;if(Math.abs(ot-foot)<.3&&it.x>o.x+Math.min(Q.x0,Q.z0)-.2&&it.x<o.x+Math.max(Q.x1,Q.z1)+.2&&it.z>o.z+Math.min(Q.x0,Q.z0)-.2&&it.z<o.z+Math.max(Q.x1,Q.z1)+.2){held=true;break}}
      if(!held)out.floating.push([k,R?R.n:'',+it.x.toFixed(1),+it.y.toFixed(1),+it.z.toFixed(1),+gap.toFixed(2)])}}
  for(const[key,n]of per)if(n>1)out.twins.push([key,n]);return out}"""
if __name__ == '__main__':
    with serve(sys.argv[1]) as base, sync_playwright() as p:
        b, pg, err = open_estate(p, base, w=480, h=320); pg.wait_for_timeout(4000)
        r = pg.evaluate(SCAN); b.close()
    if len(sys.argv) > 2: json.dump(r, open(sys.argv[2], 'w'))
    fails = []
    print('pieces measured', r['n'])
    for cls in ('sunk', 'floating', 'low', 'twins'):
        L = r[cls]; print('%-9s %d' % (cls, len(L)))
        c = collections.Counter((x[0] if cls != 'twins' else x[0].split('|')[2]) for x in L)
        for k, n in c.most_common(12): print('    %4d  %s' % (n, k))
        for x in L[:6]: print('      eg', x)
        if L: fails.append(cls)
    if err: print('page errors', err[:3]); fails.append('page errors')
    enforce = os.environ.get('ENFORCE', '1') == '1'
    print('OBJECTS ' + ('PASS' if not fails else ('FAIL: ' if enforce else 'report: ') + ', '.join(fails)))
    sys.exit(1 if fails and enforce else 0)
