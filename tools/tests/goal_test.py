"""The student goal path, end to end in the page (v1.47). python3 goal_test.py FOLDER"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import harness
from harness import serve, open_estate
from playwright.sync_api import sync_playwright
fails = []
def check(n, ok, d=''):
    print('  %-52s %s %s' % (n, 'ok' if ok else 'FAIL', d))
    if not ok: fails.append(n)
with serve(sys.argv[1]) as base, sync_playwright() as p:
    b, pg, err = open_estate(p, base, w=844, h=390)
    pg.wait_for_timeout(1500)
    check('overview shows "Set a goal"', pg.is_visible('#bGoal'))
    check('no Next action line before a goal', not pg.is_visible('#nextAct'))
    pg.click('#bGoal')
    check('screen 1 asks the goal', 'What do you want to get done?' in pg.inner_text('#goalP'))
    check('Next greyed with no text', pg.is_disabled('[data-g=next]'))
    pg.fill('#gGoal', 'Pass my history midterm'); check('Next live with text', not pg.is_disabled('[data-g=next]'))
    pg.click('[data-g=next]'); check('screen 2 asks the steps', 'Break it into steps.' in pg.inner_text('#goalP'))
    steps = ['Find the exam date and topics', 'Make a one-page outline', 'Read chapters 4 to 6', 'Do two past papers', 'Review the mistakes']
    for i, t in enumerate(steps):
        if i: pg.click('[data-g=add]')
        pg.fill('input[data-i="%d"]' % i, t)
    check('a sixth step is refused', pg.is_disabled('[data-g=add]') and 'Five is the limit' in pg.inner_text('#goalP'))
    pg.fill('input[data-i="4"]', 'x' * 81); check('over 80 characters warns and blocks save', 'Make it smaller' in pg.inner_text('#goalP') and pg.is_disabled('[data-g=save]'))
    pg.fill('input[data-i="4"]', steps[4]); pg.click('[data-g=save]')
    t = pg.inner_text('#goalP'); check('the path: first step is the Next action', 'next action:' in t.lower() and steps[0] in t.split('Done')[0])
    pg.click('[data-g=done]'); t = pg.inner_text('#goalP'); check('Done brings up step 2', steps[1] in t.split('Done')[0])
    pg.click('[data-g=tick][data-i="0"]'); t = pg.inner_text('#goalP'); check('un-ticking step 1 makes it next again', steps[0] in t.split('Done')[0])
    pg.click('[data-g=done]'); pg.click('[data-g=close]')
    check('overview shows the Next action line', pg.is_visible('#nextAct') and steps[1] in pg.inner_text('#nextAct'))
    pg.reload(); pg.wait_for_function('window.__vx && window.__vx.BLD', timeout=180000); pg.wait_for_timeout(1500)
    check('kept after a reload', pg.is_visible('#nextAct') and steps[1] in pg.inner_text('#nextAct'))
    check('saved on the device only', pg.evaluate("()=>!!localStorage.getItem('eh-goal')"))
    pg.click('#nextAct'); pg.click('[data-g=over]'); check('Start over asks first', 'Clear this goal and its steps?' in pg.inner_text('#goalP'))
    pg.click('[data-g=keep]'); check('Keep it keeps it', 'next action:' in pg.inner_text('#goalP').lower())
    for _ in range(4): pg.click('[data-g=done]')
    check('all done shows Goal done', 'Goal done.' in pg.inner_text('#goalP'))
    pg.click('[data-g=new]'); check('Set a new goal starts again', 'What do you want to get done?' in pg.inner_text('#goalP') and not pg.evaluate("()=>localStorage.getItem('eh-goal')"))
    pg.click('[data-g=close]')
    o = pg.evaluate("()=>(__vx.OBJ||[]).filter(o=>o.room&&o.room.n==='The Schoolroom').map(o=>o.n)")
    check('the Schoolroom slate is its first object', bool(o) and o[0].startswith('The slate: set a goal'), str(o[:3]))
    check('no page errors', not err, str(err[:3]))
    b.close()
print('GOAL TEST', 'FAIL' if fails else 'PASS')
sys.exit(1 if fails else 0)
