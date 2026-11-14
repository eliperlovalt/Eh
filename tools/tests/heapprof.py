"""What holds the heap once the estate has settled: live memory by the function that allocated it (Chrome's sampling heap profiler).
python heapprof.py FOLDER [page] [secs]"""
import sys, os, collections
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from harness import serve, _route
from playwright.sync_api import sync_playwright
folder = sys.argv[1]; page = sys.argv[2] if len(sys.argv) > 2 else 'index.html'; secs = int(sys.argv[3]) if len(sys.argv) > 3 else 20
with serve(folder) as base, sync_playwright() as p:
    b = p.chromium.launch(executable_path=os.environ.get('CHROME') or None, args=['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-precise-memory-info'])
    ctx = b.new_context(viewport={'width': 844, 'height': 390}, has_touch=True, device_scale_factor=1); pg = ctx.new_page(); pg.route('**/*', _route)
    cdp = ctx.new_cdp_session(pg); cdp.send('HeapProfiler.enable'); cdp.send('HeapProfiler.startSampling', {'samplingInterval': 32768})
    pg.goto(base + page, wait_until='domcontentloaded', timeout=240000); pg.wait_for_function('window.__vx && window.__vx.BLD', timeout=240000)
    pg.wait_for_timeout(secs * 1000)
    cdp.send('HeapProfiler.collectGarbage')
    prof = cdp.send('HeapProfiler.getSamplingProfile')['profile']
    used = pg.evaluate('performance.memory.usedJSHeapSize/1048576')
    self_b = collections.Counter(); incl = collections.Counter()
    def walk(n, stack):
        cf = n['callFrame']; name = (cf['functionName'] or '(anon)') + ':' + str(cf['lineNumber'] + 1)
        s = n.get('selfSize', 0); self_b[name] += s
        st = stack + [name]
        for f in set(st): incl[f] += s
        for c in n.get('children', []): walk(c, st)
    walk(prof['head'], [])
    tot = sum(self_b.values())
    print('heap used %.0f MB; sampled live %.0f MB' % (used, tot / 1048576))
    print('SELF:'); [print('  %7.1f MB %s' % (v / 1048576, k)) for k, v in self_b.most_common(30)]
    print('INCL:'); [print('  %7.1f MB %s' % (v / 1048576, k)) for k, v in incl.most_common(40)]
    b.close()
