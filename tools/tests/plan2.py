"""The drawn floor plans. python3 plan2.py DUMP.json OUTDIR [tag]
One sheet for every floor of every building: walls and windows as built, doors, stairs, rooms by name, furniture, faults numbered in red."""
import json,sys,math,os,re,collections
import matplotlib; matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle, Circle, Polygon
from matplotlib.collections import PatchCollection
import numpy as np

SKIP={'cornice','dado','panelling','beamRun','lanternPendant','chandelier','chandelierGilt','chandelierIron','coffer','ceilingRose','hammerbeam','skylight','corniceIn','candle'}
WALLK={'sash','wallLantern','portrait','sconce','pictureRail','tapestry','banner','bellPull','noticeBoard','keyCabinet','brushRack','copperRack','antlers','coatOfArms','doorDouble','toolWall','tackWall','plateRack','wallCalendar','archway'}
CLS=[(r'^(armchair|fauteuil|wingChair|chaise|sofa|settee|chesterfield|chair|windsor|settle|pew|hallBench|bisellium|stool|bench)','#9c6b3f'),
     (r'(Table|table|desk|Desk|bureau|sideboard|counter|billiard|altar|workbench|dresser$)','#c9a66b'),
     (r'^(bed|fourPoster|cot|bunk)','#c98a9b'),(r'^(fern|palm|potPlant|vaseFlowers|orangeTree|planter)','#5b9a57'),
     (r'^(fireplace|range|stove|hearth|forge|boiler)','#b5442e'),(r'^(column|balustrade|balPost|pier)','#7d7d7d'),
     (r'(bookcase|wardrobe|cabinet|Cabinet|chest|Chest|commode|shelf|Shelf|rack|Rack|cupboard|press|strongbox|safe|crate|barrel|trunk)','#6f7f96')]
def cls(k):
    for rx,c in CLS:
        if re.search(rx,k): return c
    return '#8a8fa3'
FAULT_KNOWN={'1,7,x,-42,-30':'Business Room south door opens under the Oak Stair','1,7,z,-20,-26':'Oak Stair bay into the Saloon: a column stands in it','1,7,z,-20,-21':'Billiard Room bay into the Saloon: a column stands in it',
  '1,7,x,-18,38':'Grand Stair to Gun Room: the door sits beside the stair foot','1,7,z,40,-17':'Gun Room east door beside the men\'s stair rail','1,7,z,40,-18':'Double Library west door beside the men\'s stair rail','4,0,z,-168,-89':'Chapel nave door at the porch stair'}

def faults(d,bid,y,extra):
    out=[]
    for k,t in FAULT_KNOWN.items():
        b,yy,ax,w,a0=k.split(',');
        if int(b)==bid and int(yy)==y: out.append(((float(a0)+1,float(w)) if ax=='x' else (float(w),float(a0)+1),t))
    R=[r for r in d['rooms'] if r['bid']==bid and r['y']==y]
    for r in R:
        n=sum(len(v) for v in r['op'].values())
        if n==0 and r['k']!='empty': out.append((((r['x0']+r['x1'])/2,(r['z0']+r['z1'])/2),'%s has no door of its own: it is reached only by its stair'%r['n']))
        w=min(r['x1']-r['x0'],r['z1']-r['z0']); L=max(r['x1']-r['x0'],r['z1']-r['z0'])
    for e in extra:
        if e['bid']==bid and e['y']==y: out.append(((e['x'],e['z']),e['t']))
    return out

def sheet(d,B,lev,out,tag,extra=(),sub=None,title=None):
    bid=B['bid']; y=lev['y']; G=next(g for g in B['grids'] if g['y']==y)['rows']
    x0,z0=B['x0'],B['z0']; W=len(G[0]); H=len(G)
    R=[r for r in d['rooms'] if r['bid']==bid and r['y']==y]
    HL=[h for h in d['halls'] if h['bid']==bid and h['y']==y]
    if sub: bx0,bz0,bx1,bz1=sub
    else: bx0,bz0,bx1,bz1=x0,z0,x0+W-1,z0+H-1
    wid=bx1-bx0; dep=bz1-bz0; sc=min(17/wid,11.5/dep); fw=wid*sc+.6; fh=dep*sc+2.6
    fig=plt.figure(figsize=(fw,fh)); ax=fig.add_axes([.3/fw,1.9/fh,wid*sc/fw,dep*sc/fh])
    fs=max(6,min(10,sc*70))
    # floor
    img=np.ones((H,W,3))
    for j,row in enumerate(G):
        for i,c in enumerate(row):
            img[j,i]=(1,1,1) if c==' ' else (.965,.955,.93)
    for h in HL:
        for z in range(h['z0'],h['z1']+1):
            for x in range(h['x0'],h['x1']+1):
                i,j=x-x0,z-z0
                if 0<=i<W and 0<=j<H and G[j][i]!=' ': img[j,i]=(.99,.965,.84)
    for r in R:
        for z in range(r['z0']+1,r['z1']):
            for x in range(r['x0']+1,r['x1']):
                i,j=x-x0,z-z0
                if 0<=i<W and 0<=j<H and G[j][i]!=' ': img[j,i]=(.985,.975,.955)
    for j,row in enumerate(G):
        for i,c in enumerate(row):
            if c=='#': img[j,i]=(.16,.16,.2)
            elif c=='w': img[j,i]=(.33,.6,.9)
            elif c=='l': img[j,i]=(.62,.62,.66)
    ax.imshow(img,extent=(x0-.5,x0+W-.5,z0+H-.5,z0-.5),interpolation='nearest',zorder=0)
    # stairs
    for f in d['flights']:
        if f['bid']!=bid: continue
        if not (f['base']<=y<=f['base']+f['R']) : continue
        up=f['base']==y
        L=f['L']; a0=f['e0']; a1=a0+f['dir']*L if 'e0' in f else None
        lo,hi=min(a0,a1),max(a0,a1)
        rect=(f['l0']-.5,lo,f['l1']-f['l0']+1,hi-lo) if f['axis']=='z' else (lo,f['l0']-.5,hi-lo,f['l1']-f['l0']+1)
        ax.add_patch(Rectangle(rect[:2],rect[2],rect[3],fc='#e9dcc3',ec='#8a6d3b',lw=.6,hatch='|||' if f['axis']=='x' else '---',zorder=2,alpha=.9))
        cx=rect[0]+rect[2]/2; cz=rect[1]+rect[3]/2
        ax.text(cx,cz,'up' if up else 'down',fontsize=fs*.8,ha='center',va='center',color='#5a431b',zorder=6,bbox=dict(fc='#e9dcc3',ec='none',pad=.6))
    # furniture
    for p in d['pq']:
        if p['bid']!=bid or p.get('v') or not (y<=p['y']<=y+ (lev.get('h',6.5))) or p['k'] in SKIP or p['k'] in WALLK: continue
        b=p['b'];u=p['u'];c=math.cos(p['th']);s=math.sin(p['th'])
        LX=((b['x0']-.5)*u,(b['x1']+.5)*u) if not p.get('rw') else (-p['rw'],p['rw']); LZ=((b['z0']-.5)*u,(b['z1']+.5)*u) if not p.get('rd') else (-p['rd'],p['rd'])
        pts=[(p['x']+lx*c+lz*s,p['z']-lx*s+lz*c) for lx,lz in ((LX[0],LZ[0]),(LX[1],LZ[0]),(LX[1],LZ[1]),(LX[0],LZ[1]))]
        if p['rug']: ax.add_patch(Polygon(pts,closed=True,fc='#b8504a',ec='#8d3530',alpha=.16,lw=.4,zorder=1))
        else:
            col=cls(p['k']); ax.add_patch(Polygon(pts,closed=True,fc=col,ec='#333',alpha=.85,lw=.25,zorder=3))
            if re.search(CLS[0][0],p['k']):  # which way a seat faces
                ax.plot([p['x'],p['x']+s*.9],[p['z'],p['z']+c*.9],color='#3b2410',lw=.5,zorder=4)
    for r in R:
        nm=r['n'].replace('The ','').replace("His Grace's","H.G.'s")
        w=r['x1']-r['x0']; dp=r['z1']-r['z0']; f=fs if w*sc>1.25 else fs*.75
        if w<9 and dp>w*1.4: ax.text((r['x0']+r['x1'])/2,(r['z0']+r['z1'])/2,nm,ha='center',va='center',rotation=90,fontsize=f,color='#1d2f6b',zorder=7,bbox=dict(fc='white',ec='none',alpha=.6,pad=.4))
        else:
            words=nm.split(' ');lines=[];cur=''
            for wd in words:
                if len(cur)+len(wd)+1>max(8,int(w*sc*7.5)): lines.append(cur);cur=wd
                else: cur=(cur+' '+wd).strip()
            lines.append(cur)
            ax.text((r['x0']+r['x1'])/2,(r['z0']+r['z1'])/2,'\n'.join(lines),ha='center',va='center',fontsize=f,color='#1d2f6b',zorder=7,linespacing=.95,bbox=dict(fc='white',ec='none',alpha=.6,pad=.4))
    FL=[f for f in faults(d,bid,y,extra) if bx0-1<=f[0][0]<=bx1+1 and bz0-1<=f[0][1]<=bz1+1]
    for i,(pt,t) in enumerate(FL):
        ax.add_patch(Circle(pt,max(1.5,.16/sc),fc='#e02020',ec='white',lw=.8,zorder=9,alpha=.92)); ax.text(pt[0],pt[1],str(i+1),color='white',fontsize=max(6,fs*.95),ha='center',va='center',zorder=10,fontweight='bold')
    ax.set_xlim(bx0-.5,bx1+.5); ax.set_ylim(bz1+.5,bz0-.5); ax.set_aspect('equal'); ax.axis('off')
    # title block
    ttl=title or '%s.  %s'%(B['name'],lev['n'])
    fig.text(.3/fw,(fh-.38)/fh,ttl,fontsize=15,fontweight='bold',color='#1b1b22',va='center')
    fig.text(.3/fw,(fh-.72)/fh,'Euphrates Hall, the Voxel Estate %s.  North is up.  One square is one block.'%tag,fontsize=8.5,color='#555',va='center')
    # scale bar and north
    ax.plot([bx0+1,bx0+11],[bz1-.2,bz1-.2],color='k',lw=2.2,zorder=11,clip_on=False); ax.text(bx0+6,bz1-1.2,'10 blocks',fontsize=7,ha='center',va='bottom',zorder=11)
    ax.annotate('N',xy=(bx1-2,bz0+1),xytext=(bx1-2,bz0+6.5),ha='center',va='center',fontsize=9,fontweight='bold',arrowprops=dict(arrowstyle='-|>',color='k',lw=1.2),zorder=11)
    # legend
    lx=.3/fw; ly=1.55/fh; items=[('#28283a','wall'),('#5499e6','window'),('#fcf6d6','passage'),('#e9dcc3','stair'),('#9c6b3f','seat'),('#c9a66b','table'),('#c98a9b','bed'),('#6f7f96','storage'),('#5b9a57','plant'),('#b5442e','fire'),('#e7c9c7','rug')]
    for i,(c,t) in enumerate(items):
        fig.patches.append(Rectangle((lx+i*(.95/fw),ly),.16/fw,.16/fh,fc=c,ec='#444',lw=.4,transform=fig.transFigure)); fig.text(lx+i*(.95/fw)+.22/fw,ly+.08/fh,t,fontsize=7.5,va='center')
    if FL:
        cols=2 if len(FL)>3 else 1
        for i,(pt,t) in enumerate(FL):
            cx=lx+(i%cols)*(.5); cy=(1.22-.24*(i//cols))/fh
            fig.patches.append(Circle((cx+.09/fw,cy),.085/fw,fc='#e02020',ec='none',transform=fig.transFigure)) if False else None
            fig.text(cx,cy,'%d'%(i+1),fontsize=8,color='white',fontweight='bold',va='center',ha='center',bbox=dict(boxstyle='circle,pad=.25',fc='#e02020',ec='none'))
            fig.text(cx+.2/fw,cy,t,fontsize=8,va='center',color='#7a1010')
    else: fig.text(lx,1.15/fh,'No fault is marked on this floor.',fontsize=8,color='#3a6b35')
    fig.savefig(out,dpi=150); plt.close(fig); return len(FL)

if __name__=='__main__':
    d=json.load(open(sys.argv[1])); od=sys.argv[2]; tag=sys.argv[3] if len(sys.argv)>3 else ''; os.makedirs(od,exist_ok=True)
    extra=json.load(open(sys.argv[4])) if len(sys.argv)>4 else []
    n=0
    for B in d['bl']:
        for lev in B['levels']:
            if not any(r['bid']==B['bid'] and r['y']==lev['y'] for r in d['rooms']) and not any(h['bid']==B['bid'] and h['y']==lev['y'] for h in d['halls']): continue
            n+=1; f=os.path.join(od,'plan_%02d_b%d_y%d.png'%(n,B['bid'],lev['y'])); k=sheet(d,B,lev,f,tag,extra); print(f,k,'faults')
