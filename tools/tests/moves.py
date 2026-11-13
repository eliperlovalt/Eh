import json,sys,os
sys.path.insert(0,'/home/claude/tests'); import plan2
plan2.MOVES=True
M=[
 (1,7,-25.5,-42,"Business Room: the south door moves 4 east, to the middle of the landing bay beside the Oak Stair"),
 (1,7,-20,-24,"Saloon, west wall: the Oak Stair arch is centred between the columns, 3 wide"),
 (1,7,-20,-16,"Saloon, west wall: the Billiard Room arch moves one bay south, clear of its column"),
 (1,7,39,-18,"Gun Room corner: the two doors beside the men's stair rail are walled up"),
 (1,7,40,-30,"Double Library: a new west door from the Grand Stair hall, north of the fire"),
 (1,7,0,6,"Entrance Hall: its north wall moves from z 0 to z 6. The cross gallery then runs the whole width of the house, 9 clear here, and the 3-wide strip is gone"),
 (1,17,0,-41,"The 1-wide strip between the two galleries is taken into the Saloon Gallery's north walk"),
 (1,17,-34,-51,"Passage to the Oak Stair landing: 3 clear becomes 5"),
 (1,17,34,-51,"Passage to the Grand Stair landing: 3 clear becomes 5"),
 (1,17,0,-61,"Long Gallery over the Great Hall: the rail moves 2 south, 3 clear becomes 5"),
 (1,17,-7.5,30,"South balcony: the Orange Bedroom's window here becomes a glazed door"),
 (1,17,7.5,30,"South balcony: the Grey Bedroom's window here becomes a glazed door, the pair of the other"),
 (1,17,16,18,"Grey Bedroom: its three doors into His Grace's dressing room, bath and study are walled up. Those rooms open from his bedchamber only"),
 (1,17,-40,18,"Every bedroom on this floor keeps one door, onto its passage. The doors from bedroom to bedroom are walled up"),
 (1,25,0,22,"Guest Bedrooms I to VIII: the seven doors from room to room are walled up. Each keeps one door, onto the Bachelors' Corridor"),
 (1,25,-28,-58,"The nursery suite (Day Nursery, Night Nursery, Governess) keeps its connecting doors"),
 (1,25,28,-58,"Schoolroom Annexe, Laboratory, Ward, Sewing Room, Linen Room: connecting doors walled up, one door each onto the passage"),
 (1,25,-22,-12,"Passage beside the Red Staircase: 3 clear becomes 4"),
 (1,32,-44,-51,"Maids' rooms: twelve 9 by 9 cells with a door on every side become eight rooms 9 by 11, four either side of a passage 4 clear. One door each"),
 (1,32,44,-51,"Footmen's rooms: the same, eight rooms either side of a passage"),
 (1,32,0,22,"Box Room and Cistern Room: side doors walled up"),
 (1,32,-22,-10,"The open attic is divided: a passage 4 clear round the light court, with a trunk room, a lumber room, a linen store and two sitting rooms off it, in place of one floor of scattered boxes"),
 (4,0,-168,-87,"Tower Porch: the crypt stair moves against the outer wall and the nave door moves 2 south, so a clear way 3 wide runs from the porch door into the nave"),
]
extra=[{'bid':b,'y':y,'x':x,'z':z,'t':t} for b,y,x,z,t in M]
json.dump([{'n':i+1,'building':b,'y':y,'x':x,'z':z,'move':t} for i,(b,y,x,z,t) in enumerate(M)],open('/home/claude/wall-moves-v20.json','w'),indent=1)
d=json.load(open('/home/claude/tests/d119b.json')); os.makedirs('/home/claude/tests/moves',exist_ok=True); outs=[]
names={7:'State floor',17:'First floor',25:'Second floor',32:'Attics'}
for bi,y in [(0,7),(0,17),(0,25),(0,32),(3,0)]:
    B=d['bl'][bi]; lev=next(l for l in B['levels'] if l['y']==y); f='/home/claude/tests/moves/m_b%d_y%d.png'%(B['bid'],y)
    plan2.sheet(d,B,lev,f,'v1.19',extra,title='%s.  %s: the wall plan for v20'%(B['name'],lev['n'])); outs.append(f)
from PIL import Image
ims=[Image.open(f).convert('RGB') for f in outs]; ims[0].save('/home/claude/euphrates-hall-wall-plan-v20.pdf',save_all=True,append_images=ims[1:],resolution=150); ims[0].save('/home/claude/euphrates-hall-wall-plan-v20-state-floor.png'); print(len(M),'moves',[os.path.getsize(f) for f in outs])
