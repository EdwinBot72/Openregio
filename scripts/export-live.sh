#!/usr/bin/env bash
# export-live.sh — maak een schone code-review zip (geschikt voor ChatGPT)
# Gebruik: bash scripts/export-live.sh
# Output: openregio-live.zip (in projectroot)

set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/openregio-live.zip"

echo "Exporteren vanuit: $ROOT"

export ROOT OUT
python3 - <<'PYEOF'
import zipfile, os, sys

src = os.environ['ROOT']
out  = os.environ['OUT']

# Mappen die volledig worden overgeslagen
EXCLUDE_DIRS = {
    '.git', 'node_modules', '.local', '.cache', '.config',
    'dist', 'artifacts', 'uploads',
    'attached_assets', '.agents', '.pythonlibs',
    'wordpress-plugin', 'public',
}

# Bestandsextensies die niets bijdragen aan code-review
EXCLUDE_EXTS = {
    '.zip', '.log',
    '.webp', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico',
    '.woff', '.woff2', '.ttf', '.eot',
    '.mp4', '.mp3', '.wav',
    '.tar', '.gz',
}

# Specifieke bestanden die overgeslagen worden
EXCLUDE_FILES = {
    '.env', '.env.local', '.env.production',
    'package-lock.json', 'uv.lock',
    'plus-jakarta-sans.ts',   # 77 KB base64-font, geen echte code
}

added = 0
with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED, compresslevel=6) as zf:
    for root, dirs, files in os.walk(src):
        dirs[:] = [d for d in sorted(dirs) if d not in EXCLUDE_DIRS]
        for fname in files:
            if any(fname.endswith(e) for e in EXCLUDE_EXTS):
                continue
            if fname in EXCLUDE_FILES:
                continue
            fpath = os.path.join(root, fname)
            arcname = os.path.relpath(fpath, src)
            try:
                zf.write(fpath, arcname)
                added += 1
            except Exception as e:
                print(f'  Skip {arcname}: {e}', file=sys.stderr)

size_mb = os.path.getsize(out) / 1024 / 1024
print(f'Klaar: {added} bestanden — {size_mb:.2f} MB  →  {out}')
PYEOF
