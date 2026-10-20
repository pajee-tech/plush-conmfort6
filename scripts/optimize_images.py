"""
Optimise all images in public/ :
  - converts JPG / PNG / WebP to WebP, max 1600px, max 200 KB
  - creates 480px and 800px versions for /uploads/products and /uploads/blog (used for srcset)
Usage:  npm run images      (needs Python 3 + Pillow: pip install pillow)
"""
import os, io, sys
from PIL import Image

ROOT = os.path.join(os.path.dirname(__file__), '..', 'public')
MAX_BYTES, MAX_DIM = 200 * 1024, 1600

def encode(im, quality):
    buf = io.BytesIO(); im.save(buf, 'WEBP', quality=quality, method=6); return buf.getvalue()

for dirpath, _, files in os.walk(ROOT):
    for f in files:
        ext = f.rsplit('.', 1)[-1].lower()
        if ext not in ('jpg', 'jpeg', 'png', 'webp') or f.endswith(('-480.webp', '-800.webp')):
            continue
        src = os.path.join(dirpath, f)
        dst = src.rsplit('.', 1)[0] + '.webp'
        im = Image.open(src)
        im = im.convert('RGBA' if im.mode in ('RGBA', 'LA', 'P') else 'RGB')
        if ext != 'webp' or os.path.getsize(src) > MAX_BYTES or max(im.size) > MAX_DIM:
            im.thumbnail((MAX_DIM, MAX_DIM), Image.LANCZOS)
            data = b''
            for q in (85, 80, 75, 70, 65, 60, 55):
                data = encode(im, q)
                if len(data) <= MAX_BYTES: break
            while len(data) > MAX_BYTES:
                im = im.resize((int(im.width * .9), int(im.height * .9)), Image.LANCZOS); data = encode(im, 72)
            open(dst, 'wb').write(data)
            if dst != src: os.remove(src)
            print('optimised', os.path.relpath(dst, ROOT), len(data) // 1024, 'KB')
        if ('uploads/products' in dirpath.replace('\\', '/')) or ('uploads/blog' in dirpath.replace('\\', '/')):
            base = Image.open(dst); base.load()
            for w in (480, 800):
                out = dst[:-5] + f'-{w}.webp'
                if os.path.exists(out): continue
                r = base if base.width <= w else base.resize((w, round(base.height * w / base.width)), Image.LANCZOS)
                r.save(out, 'WEBP', quality=76, method=6)
print('done')
