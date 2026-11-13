"""The Estate Register: every room of every building, read from the build. python3 register.py DUMP.json OUT.json OUT.md"""
import json,sys,math,collections,re
d=json.load(open(sys.argv[1]))
SKIP={'cornice','dado','panelling','beamRun','lanternPendant','chandelier','chandelierGilt','chandelierIron','coffer','ceilingRose','hammerbeam','skylight','corniceIn','candle','sash','wallLantern','portrait','sconce','pictureRail','tapestry','banner','bellPull','antlers','coatOfArms','doorDouble','archway'}
def runs(cells):
    out=[];run=[]
    for a in sorted(cells)+[10**9]:
        if run and a!=run[-1]+1: out.append((run[0],run[-1])); run=[]
        if a<10**9: run.append(a)
    return out
SIDE={'n':'north','s':'south','w':'west','e':'east'}
reg=[]
for B in d['bl']:
    G={g['y']:g['rows'] for g in B['grids']}
    for r in [r for r in d['rooms'] if r['bid']==B['bid']]:
        g=G.get(r['y']); x0,z0=B['x0'],B['z0']
        doors=[];wins=[]
        for s in 'nswe':
            for a,b in runs(r['op'][s]): doors.append({'wall':SIDE[s],'from':a,'to':b,'width':b-a+1})
            if g:
                ns=s in 'ns'; w=r['z0'] if s=='n' else r['z1'] if s=='s' else r['x0'] if s=='w' else r['x1']
                cells=[]
                for a in range((r['x0'] if ns else r['z0'])+1,(r['x1'] if ns else r['z1'])):
                    x,z=(a,w) if ns else (w,a)
                    if 0<=z-z0<len(g) and 0<=x-x0<len(g[0]) and g[z-z0][x-x0]=='w': cells.append(a)
                for a,b in runs(cells): wins.append({'wall':SIDE[s],'from':a,'to':b})
        its=[p for p in d['pq'] if p['bid']==r['bid'] and not p.get('v') and r['x0']<p['x']<r['x1'] and r['z0']<p['z']<r['z1'] and r['y']<=p['y']<r['y']+1.3 and not p['rug'] and p['k'] not in SKIP]
        fire=None
        for p in its:
            if p['k']=='fireplace':
                dd={'north':p['z']-r['z0'],'south':r['z1']-p['z'],'west':p['x']-r['x0'],'east':r['x1']-p['x']}; fire=min(dd,key=dd.get)
        kinds=collections.Counter(p['k'] for p in its)
        lev=next((l['n'] for l in B['levels'] if l['y']==r['y']),str(r['y']))
        reg.append({'building':B['name'],'bid':r['bid'],'floor':lev,'y':r['y'],'name':r['n'],'rect':[r['x0'],r['z0'],r['x1'],r['z1']],'w':r['x1']-r['x0']-1,'d':r['z1']-r['z0']-1,'height':r['yt']-r['y'],
                    'doors':doors,'windows':wins,'fire':fire,'pieces':len(its),'kinds':dict(kinds),'sig':'|'.join('%s%d'%kv for kv in sorted(kinds.items()))})
sigc=collections.Counter(r['sig'] for r in reg if r['pieces']>=4)
BED=re.compile(r"Bedroom|Maid|Footman|Bedchamber|Nursery|Governess|Ward|Room$")
def state(r):
    area=r['w']*r['d']; dens=r['pieces']/max(1,area)*100
    out=[]
    if r['pieces']==0: out.append('empty')
    elif dens<2.2 and area>120: out.append('sparse')
    if r['pieces']>=4 and sigc[r['sig']]>1: out.append('same set as %d other rooms'%(sigc[r['sig']]-1))
    nd=len([x for x in r['doors'] if x['width']<=4])
    if re.search(r"Bedroom|Maid|Footman",r['name']) and nd>1: out.append('%d doors'%nd)
    return ', '.join(out) or 'furnished'
for r in reg: r['state']=state(r)
json.dump({'issued':'2026-11-13','estate':'v1.19','note':'Rect is [x0,z0,x1,z1] on the wall lines; w and d are the clear floor inside. Doors and windows give the wall and the run of blocks along it. North is -z, east is +x.','rooms':reg},open(sys.argv[2],'w'),indent=0)
# markdown
md=[]
def sides(lst): 
    c=collections.Counter(x['wall'][0].upper() for x in lst); return ' '.join('%s%s'%(k,v if v>1 else '') for k,v in c.items()) or 'none'
cur=None
for r in reg:
    key=(r['building'],r['floor'])
    if key!=cur:
        cur=key; n=sum(1 for q in reg if (q['building'],q['floor'])==key)
        md.append('\n### %s: %s (%d rooms)\n\n| Room | Clear floor | Height | Doors | Windows | Fire | Pieces | As it stands |\n|---|---|---|---|---|---|---|---|'%(r['building'],r['floor'],n))
    md.append('| %s | %d x %d | %d | %s | %s | %s | %d | %s |'%(r['name'],r['w'],r['d'],r['height'],sides([x for x in r['doors']]),sides(r['windows']),(r['fire'] or 'none'),r['pieces'],r['state']))
open(sys.argv[3],'w').write('\n'.join(md))
print(len(reg),'rooms;',collections.Counter(r['state'].split(',')[0] for r in reg).most_common(8))
print('chars',len('\n'.join(md)))
# which room is behind the south front centre at first floor
for r in reg:
    if r['bid']==1 and r['y'] in (17,) and r['rect'][3]>=29 and r['rect'][0]<=0<=r['rect'][2]: print('south centre y17:',r['name'],r['rect'])
