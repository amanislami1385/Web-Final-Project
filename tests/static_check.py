"""Run python tests/static_check.py. Standard-library checks; not a W3C validator."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
from collections import Counter
ROOT = Path(__file__).resolve().parents[1]
class Page(HTMLParser):
    def __init__(self, text):
        super().__init__(); self.tags=[]; self.feed(text)
    def handle_starttag(self, tag, attrs): self.tags.append((tag,dict(attrs)))
pages={p.name:Page(p.read_text(encoding='utf-8')) for p in ROOT.glob('*.html')}
errors=[]
for name, page in pages.items():
    ids=[a['id'] for _,a in page.tags if 'id' in a]
    errors += [f'{name}: duplicate ID {i}' for i,n in Counter(ids).items() if n>1]
    if sum(t=='h1' for t,_ in page.tags)!=1: errors.append(name+': expected one h1')
    for tag, attrs in page.tags:
        if tag=='img' and 'alt' not in attrs: errors.append(name+': missing image alt')
        for attr in ('src','href'):
            if attr not in attrs: continue
            url=urlsplit(attrs[attr])
            if url.scheme or url.netloc: continue
            target=ROOT/unquote(url.path) if url.path else ROOT/name
            if not target.exists(): errors.append(f'{name}: missing {attrs[attr]}')
            if url.fragment and target.name in pages:
                target_ids=[a.get('id') for _,a in pages[target.name].tags]
                if unquote(url.fragment) not in target_ids: errors.append(f'{name}: missing anchor {attrs[attr]}')
if errors: raise SystemExit('\n'.join(errors))
print(f'PASS: {len(pages)} HTML pages; local links, IDs, headings and image alt attributes.')
