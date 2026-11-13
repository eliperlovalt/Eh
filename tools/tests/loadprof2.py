"""Main-thread JS cost at load: CPU profile of the first N s. python3 loadprof2.py FOLDER [secs]"""
import sys, json, time, os, collections
sys.path.insert(0,'/home/claude/tests')
from harness import serve, _route
from playwright.sync_api import sync_playwright
secs=int(sys.argv[2]) if len(sys.argv)>2 else 30
with serve(sys.argv[1]) as base, sync_playwright() as p:
    b=p.chromium.launch(executable_path=os.environ.get('CHROME') or None,args=['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
    ctx=b.new_context(viewport={'width':844,'height':390},has_touch=True,device_scale_factor=1); pg=ctx.new_page(); pg.route('**/*',_route)
    cdp=ctx.new_cdp_session(pg); cdp.send('Profiler.enable'); cdp.send('Profiler.setSamplingInterval',{'interval':1000}); cdp.send('Profiler.start')
    pg.goto(base+'index.html',wait_until='domcontentloaded',timeout=180000); pg.wait_for_function('window.__vx && window.__vx.BLD',timeout=180000)
    ready=pg.evaluate('performance.now()'); pg.wait_for_timeout(secs*1000)
    prof=cdp.send('Profiler.stop')['profile']
    nodes={n['id']:n for n in prof['nodes']}; par={}
    for n in prof['nodes']:
        for c in n.get('children',[]): par[c]=n['id']
    self_t=collections.Counter(); dts=prof['timeDeltas']
    for s,d in zip(prof['samples'],dts): self_t[s]+=d
    # self time by function, and inclusive time by top-level named ancestors
    byfn=collections.Counter(); incl=collections.Counter()
    for nid,t in self_t.items():
        n=nodes[nid]; cf=n['callFrame']; byfn[(cf['functionName'] or '(anon)')+':'+str(cf['lineNumber'])]+=t
        seen=set(); x=nid
        while x in nodes:
            f=nodes[x]['callFrame']['functionName']
            if f and f not in seen: seen.add(f); incl[f]+=t
            x=par.get(x)
            if x is None: break
    tot=sum(self_t.values())/1e6
    print('ready %.1fs; profile %.1fs'%(ready/1000,tot))
    print('SELF:'); [print('  %6.2fs %s'%(t/1e6,k)) for k,t in byfn.most_common(22)]
    print('INCL:'); [print('  %6.2fs %s'%(t/1e6,k)) for k,t in incl.most_common(45)]
    print("skins",pg.evaluate("()=>JSON.stringify({mode:__vx.skins.mode,hello:__vx.skins.hello,all:__vx.skins.all,done:__vx.skins.done,werr:__vx.skins.werr,s:__vx.skins.map(x=>[x.name,x.ms,x.tris,x.blind,x.cross,x.cells,x.houses,x.err||null])})"))
    b.close()
