#!/usr/bin/env python3
"""Build -> dist/ (compressed, webp) -> docs/ (GitHub Pages) -> dist/artifact.html."""
import os, re, shutil, glob, subprocess
from PIL import Image

subprocess.run(['python3', 'build.py'], check=True)
DST = 'dist'
if os.path.exists(DST): shutil.rmtree(DST)
os.makedirs(DST)

for f in ['index.html', 'gallery.html', 'wheel.html', 'about.html', 'styles.css', 'chat.css', 'head.css',
          'main.js', 'hero.js', 'chat.js', 'chat-data.js', 'head.js', 'head-data.js']:
    shutil.copy(f, DST)
shutil.copytree('case', DST + '/case')
os.makedirs(DST + '/assets', exist_ok=True)
for d in ['icons', 'cards', 'characters', 'items', 'head']:
    shutil.copytree(f'assets/{d}', f'{DST}/assets/{d}')
shutil.copy('assets/og.png', DST + '/assets/og.png')
for p in glob.glob(f'{DST}/assets/head/**/*.png', recursive=True) + glob.glob(f'{DST}/assets/items/*.png'):
    os.remove(p)

mapping = {}
for p in sorted(glob.glob('assets/work/*/*')):
    if p.endswith('.webp') and os.path.getsize(p) < 500_000:
        out = p; os.makedirs(os.path.dirname(f'{DST}/{out}'), exist_ok=True); shutil.copy(p, f'{DST}/{out}')
    else:
        im = Image.open(p).convert('RGB')
        if im.width > 1600: im = im.resize((1600, int(im.height * 1600 / im.width)), Image.LANCZOS)
        if im.height > 6000: im = im.crop((0, 0, im.width, 6000))
        out = os.path.splitext(p)[0] + '.webp'
        os.makedirs(os.path.dirname(f'{DST}/{out}'), exist_ok=True)
        im.save(f'{DST}/{out}', quality=80, method=6)
    mapping[p] = out

for h in glob.glob(f'{DST}/*.html') + glob.glob(f'{DST}/case/*.html'):
    s = open(h).read()
    for a, b in mapping.items(): s = s.replace(a, b)
    open(h, 'w').write(s)

# artifact wrapper (head kept minimal, no <html>/<body>)
s = open(f'{DST}/index.html').read()
head = re.search(r'<head>(.*?)</head>', s, re.S).group(1)
body = re.search(r'<body>(.*?)</body>', s, re.S).group(1)
keep = '\n'.join(l for l in head.splitlines() if ('<title' in l or '<link' in l or 'og:' in l or 'twitter' in l or 'name="description"' in l))
keep = keep.replace('<title>Michael Jacques — Ask the Portfolio</title>', '<title>Ask Michael Jacques</title>')
open(f'{DST}/artifact.html', 'w').write(keep + '\n' + body)

# docs/ for GitHub Pages
if os.path.exists('docs'): shutil.rmtree('docs')
shutil.copytree(DST, 'docs')
os.remove('docs/artifact.html')
open('docs/.nojekyll', 'w').close()
open('docs/CNAME', 'w').write('michaeljacques.work\n')

n = sum(len(f) for _, _, f in os.walk(DST))
size = sum(os.path.getsize(os.path.join(r, f)) for r, _, fs in os.walk(DST) for f in fs)
print(f'release: {n} files, {size/1e6:.1f} MB')
