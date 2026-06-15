#!/usr/bin/env bash
# export-clean.sh — schone Replit-upload zip (alleen broncode)
# Bevat uitsluitend: client/ server/ shared/ scripts/ + root config-bestanden
# Gebruik: bash scripts/export-clean.sh
# Output: openregio-clean.zip (in projectroot)

set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/openregio-clean.zip"

echo "Exporteren vanuit: $ROOT"

export ROOT OUT
python3 - <<'PYEOF'
import zipfile, os, sys

src = os.environ['ROOT']
out  = os.environ['OUT']

# Alleen deze mappen worden meegenomen
INCLUDE_DIRS = {'client', 'server', 'shared', 'scripts', 'migrations'}

# Alleen deze root-bestanden worden meegenomen
INCLUDE_ROOT_FILES = {
    'package.json',
    'package-lock.json',
    'tsconfig.json',
    'vite.config.ts',
    'tailwind.config.ts',
    'postcss.config.js',
    'drizzle.config.ts',
    '.replit',
    'replit.md',
    '.env.example',
}

# Bestandsextensies die niets bijdragen aan code-review
EXCLUDE_EXTS = {
    '.zip', '.log',
    '.webp', '.png', '.jpg', '.jpeg', '.gif', '.ico',
    '.woff', '.woff2', '.ttf', '.eot',
    '.mp4', '.mp3', '.wav',
    '.tar', '.gz', '.pyc',
}

# Specifieke bestanden overslaan
EXCLUDE_FILES = {
    'plus-jakarta-sans.ts',
    'uv.lock',
    '.env', '.env.local', '.env.production',
}

# Mappen binnen de include-dirs die overgeslagen worden
EXCLUDE_SUBDIRS = {'node_modules', '.cache', 'dist', '__pycache__'}

added = 0
with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED, compresslevel=6) as zf:
    # Root config-bestanden
    for fname in INCLUDE_ROOT_FILES:
        fpath = os.path.join(src, fname)
        if os.path.isfile(fpath):
            zf.write(fpath, fname)
            added += 1

    # Geselecteerde mappen
    for topdir in INCLUDE_DIRS:
        toppath = os.path.join(src, topdir)
        if not os.path.isdir(toppath):
            continue
        for root, dirs, files in os.walk(toppath):
            dirs[:] = [d for d in sorted(dirs) if d not in EXCLUDE_SUBDIRS]
            for fname in files:
                if fname in EXCLUDE_FILES:
                    continue
                if any(fname.endswith(e) for e in EXCLUDE_EXTS):
                    continue
                fpath = os.path.join(root, fname)
                arcname = os.path.relpath(fpath, src)
                try:
                    zf.write(fpath, arcname)
                    added += 1
                except Exception as e:
                    print(f'  Skip {arcname}: {e}', file=sys.stderr)

size_kb = os.path.getsize(out) / 1024
print(f'Klaar: {added} bestanden — {size_kb:.0f} KB  →  {out}')
PYEOF
