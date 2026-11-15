#!/usr/bin/env python3
"""PreToolUse guard for the Estate. Enforces two CLAUDE.md rules:

1. Never hand-edit the root index.html; edit src/index.html and rebuild.
2. No push of page changes unless tools/tests/gate.sh passed on exactly the
   pages being pushed (stamp in .git/eh-gate-ok).

Exit 2 blocks the tool call; the message on stderr goes back to Claude.
"""
import json, os, re, subprocess, sys, hashlib

ev = json.load(sys.stdin)
tool = ev.get('tool_name', '')
inp = ev.get('tool_input', {}) or {}
root = os.environ.get('CLAUDE_PROJECT_DIR') or ev.get('cwd') or '.'


def block(msg):
    print(msg, file=sys.stderr)
    sys.exit(2)


def git(*a):
    return subprocess.run(['git', '-C', root, *a], capture_output=True, text=True)


if tool in ('Edit', 'Write', 'MultiEdit', 'NotebookEdit'):
    p = os.path.realpath(inp.get('file_path', ''))
    if p == os.path.realpath(os.path.join(root, 'index.html')):
        block('Root index.html is the built copy. Edit src/index.html, then run '
              'python3 tools/build.py src/index.html index.html')
    sys.exit(0)

if tool == 'Bash':
    cmd = inp.get('command', '')
    if re.search(r'(>|\btee\b|\bcp\b|\bmv\b|\bsed\s+-i)[^|;&]*(^|[\s/])index\.html\b', cmd) \
            and 'src/index.html' not in cmd and 'tools/build.py' not in cmd:
        # a shell write aimed at the root copy, not via the build
        if re.search(r'(^|[\s>])(\./)?index\.html\b', cmd):
            block('That looks like a shell write to the root index.html. Edit src/index.html '
                  'and rebuild with tools/build.py instead.')
    if not re.search(r'\bgit\b[^;&|]*\bpush\b', cmd):
        sys.exit(0)
    up = git('rev-parse', '--abbrev-ref', '@{u}')
    base = up.stdout.strip() if up.returncode == 0 else 'origin/main'
    files = git('diff', '--name-only', base, 'HEAD').stdout.split()
    if not any(f == 'index.html' or f.startswith('src/') for f in files):
        sys.exit(0)  # docs, depot or tools only: no page change to gate
    if git('diff', '--quiet', 'HEAD', '--', 'src/index.html', 'index.html').returncode != 0:
        block('src/index.html or index.html has uncommitted changes. Commit what you tested.')
    stamp = os.path.join(root, '.git', 'eh-gate-ok')
    want = {}
    try:
        for line in open(stamp):
            h, f = line.split()
            want[f] = h
    except OSError:
        block('Push blocked: the pages changed and the gate has not passed. '
              'Run tools/tests/gate.sh (walk, reach, audit on src/ and root, plus build check).')
    for f in ('src/index.html', 'index.html'):
        h = hashlib.sha256(open(os.path.join(root, f), 'rb').read()).hexdigest()
        if want.get(f) != h:
            block('Push blocked: %s changed since the gate last passed. Run tools/tests/gate.sh again.' % f)
    sys.exit(0)
