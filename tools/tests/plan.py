import json,sys,math
import matplotlib; matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle
d=json.load(open(sys.argv[1])); bid=int(sys.argv[2]); y=int(sys.argv[3]); out=sys.argv[4]
box=[float(v) for v in sys.argv[5].split(',')] if len(sys.argv)>5 else None
R=[r for r in d['rooms'] if r['bid']==bid and r['y']==y]
SKIP={'cornice','dado','panelling','beamRun','lanternPendant','chandelier','chandelierGilt','chandelierIron','coffer','ceilingRose','hammerbeam','skylight','corniceIn'}
WALL={'sash','wallLantern','portrait','sconce','pictureRail','tapestry','banner','bellPull','noticeBoard','keyCabinet','brushRack','copperRack','antlers','coatOfArms','doorDouble','toolWall','tackWall','plateRack','wallCalendar'}
fig,ax=plt.subplots(figsize=(22,17))
for r in R:
    ax.add_patch(Rectangle((r['x0'],r['z0']),r['x1']-r['x0'],r['z1']-r['z0'],fill=False,ec='k',lw=1.2))
    ax.text((r['x0']+r['x1'])/2,r['z0']+1.2,r['n'].replace('The ',''),ha='center',va='top',fontsize=6,color='navy')
    for side,cells in r['op'].items():
        for a in cells:
            x,z=(a,r['z0'] if side=='n' else r['z1']) if side in 'ns' else ((r['x0'] if side=='w' else r['x1']),a)
            ax.add_patch(Rectangle((x-.5,z-.5),1,1,fc='lime',ec='none',alpha=.8))
for h in d['halls']:
    if h['bid']==bid and h['y']==y: ax.add_patch(Rectangle((h['x0'],h['z0']),h['x1']-h['x0'],h['z1']-h['z0'],fill=True,fc='#ffe',ec='orange',lw=.5,ls=':'))
for p in d['pq']:
    if p['bid']!=bid or not (y<=p['y']<=y+9.5) or p['k'] in SKIP: continue
    b=p['b'];u=p['u'];c=math.cos(p['th']);s=math.sin(p['th']);xs=[];zs=[]
    LX=((b['x0']-.5)*u,(b['x1']+.5)*u) if not p.get('rw') else (-p['rw'],p['rw']); LZ=((b['z0']-.5)*u,(b['z1']+.5)*u) if not p.get('rd') else (-p['rd'],p['rd'])
    for lx in LX:
        for lz in LZ:
            xs.append(p['x']+lx*c+lz*s); zs.append(p['z']-lx*s+lz*c)
    col='#c33' if p['rug'] else ('#888' if p['k'] in WALL else '#36c')
    ax.add_patch(Rectangle((min(xs),min(zs)),max(xs)-min(xs),max(zs)-min(zs),fc=col,ec=col,alpha=.25 if p['rug'] else .55,lw=.4))
    if not p['rug'] and p['k'] not in WALL: ax.text(p['x'],p['z'],p['k'][:6],fontsize=3.2,ha='center',va='center')
if box: ax.set_xlim(box[0],box[2]); ax.set_ylim(box[3],box[1])
else: ax.autoscale(); ax.invert_yaxis()
ax.set_aspect('equal'); ax.set_title('bid %d y %d'%(bid,y)); plt.tight_layout(); plt.savefig(out,dpi=110)
