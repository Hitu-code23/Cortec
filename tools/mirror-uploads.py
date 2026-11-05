#!/usr/bin/env python3
"""Mirror every WordPress upload the new site still references (images, data sheets, brochures)
into ./wp-content/uploads/ so the same URLs keep working after the domain points at the new site.

Run ONCE, BEFORE switching DNS, while the old WordPress site is still online:
    python3 tools/mirror-uploads.py
- In the source repository it saves into static/wp-content/ (commit that folder; every build copies it).
- In a built site folder it saves into wp-content/ next to index.html.
Re-running only downloads missing files.
"""
import os, sys, time, urllib.request, urllib.parse
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MAN = os.path.join(BASE_DIR, 'tools', 'uploads-manifest.txt')
ROOT = os.path.join(BASE_DIR, 'static') if os.path.isdir(os.path.join(BASE_DIR, 'build')) else BASE_DIR
urls = [u.strip() for u in open(MAN) if u.strip()]
ok = skip = fail = 0
for u in urls:
    path = urllib.parse.unquote(urllib.parse.urlparse(u).path).lstrip('/')
    dest = os.path.join(ROOT, path)
    if os.path.exists(dest) and os.path.getsize(dest) > 0:
        skip += 1; continue
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    for attempt in range(3):
        try:
            req = urllib.request.Request(u, headers={'User-Agent': 'Mozilla/5.0 (site migration)'})
            with urllib.request.urlopen(req, timeout=60) as r, open(dest, 'wb') as f:
                f.write(r.read())
            ok += 1; print('ok  ', path); break
        except Exception as e:
            if attempt == 2: fail += 1; print('FAIL', u, e, file=sys.stderr)
            time.sleep(2)
print(f'\ndownloaded {ok}, already present {skip}, failed {fail} of {len(urls)}')
