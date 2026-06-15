#!/usr/bin/env bash
# export-live.sh — maak een schone productie-export zip
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

EXCLUDE_DIRS = {
    '.git', 'node_modules', '.local', '.cache',
    'dist', 'artifacts', 'uploads',
    'attached_assets', '.agents', '.pythonlibs',
}
EXCLUDE_EXTS = {'.zip', '.log'}
EXCLUDE_FILES = {'.env', '.env.local', '.env.production'}

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
print(f'Klaar: {added} bestanden — {size_mb:.1f} MB  →  {out}')
PYEOF
