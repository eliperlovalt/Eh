"""Load profile: time to ready, long tasks in the first N seconds after ready. python3 loadprof.py FOLDER [secs]"""
import sys, json, time
sys.path.insert(0,'/home/claude/tests')
from harness import serve, _route
from playwright.sync_api import sync_playwright
import os
secs=int(sys.argv[2]) if len(sys.argv)>2 else 25
INIT="window.__lt=[];try{new PerformanceObserver(l=>{for(const e of l.getEntries())window.__lt.push([Math.round(e.startTime),Math.round(e.duration)])}).observe({entryTypes:['longtask']})}catch(e){}"
with serve(sys.argv[1]) as base, sync_playwright() as p:
    b=p.chromium.launch(executable_path=os.environ.get('CHROME') or None,args=['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
    ctx=b.new_context(viewport={'width':844,'height':390},has_touch=True,device_scale_factor=1); pg=ctx.new_page(); pg.add_init_script(INIT); pg.route('**/*',_route)
    errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
    t0=time.time(); pg.goto(base+'index.html',wait_until='domcontentloaded',timeout=180000); pg.wait_for_function('window.__vx && window.__vx.BLD',timeout=180000)
    ready=pg.evaluate('performance.now()'); print('ready at %.1f s'%(ready/1000))
    pg.wait_for_timeout(secs*1000)
    lt=pg.evaluate('window.__lt'); pre=[d for s,d in lt if s<ready]; post=[(s,d) for s,d in lt if s>=ready]
    print('before ready: %d long tasks, %.1f s total, worst %.1f s'%(len(pre),sum(pre)/1000,max(pre or [0])/1000))
    big=[(s,d) for s,d in post if d>120]
    print('after ready (%ds): %d long tasks >120ms, total %.1f s, worst %.2f s'%(secs,len(big),sum(d for s,d in big)/1000,max([d for s,d in big] or [0])/1000))
    print(' ',' '.join('%.1f:%d'%((s-ready)/1000,d) for s,d in big[:60]))
    try: print('skins',pg.evaluate("()=>{const s=__vx.skins?__vx.skins():null;return s?JSON.stringify(s.map(x=>[x.name,x.ms,x.err||''])):'none'}"))
    except Exception as e: print('skins n/a',str(e)[:80])
    print('errors',errs[:3]); b.close()
