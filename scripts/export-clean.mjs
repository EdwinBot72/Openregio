import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, relative } from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const JSZip = require('jszip');

const ROOT = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
const OUT = join(ROOT, 'openregio-clean.zip');

const INCLUDE_DIRS = ['client', 'server', 'shared', 'scripts', 'migrations'];
const INCLUDE_ROOT_FILES = [
  'package.json', 'package-lock.json', 'tsconfig.json',
  'vite.config.ts', 'tailwind.config.ts', 'postcss.config.js',
  'drizzle.config.ts', '.replit', 'replit.md', '.env.example',
];
const EXCLUDE_EXTS = new Set([
  '.zip', '.log', '.webp', '.png', '.jpg', '.jpeg', '.gif', '.ico',
  '.woff', '.woff2', '.ttf', '.eot', '.mp4', '.mp3', '.wav', '.tar', '.gz', '.pyc',
]);
const EXCLUDE_FILES = new Set(['plus-jakarta-sans.ts', 'uv.lock', '.env', '.env.local', '.env.production']);
const EXCLUDE_SUBDIRS = new Set(['node_modules', '.cache', 'dist', '__pycache__', '.git']);

function shouldSkip(name) {
  if (EXCLUDE_FILES.has(name)) return true;
  const dot = name.lastIndexOf('.');
  return dot !== -1 && EXCLUDE_EXTS.has(name.slice(dot));
}

const zip = new JSZip();
let count = 0;

function addFile(fpath, arcname) {
  try {
    zip.file(arcname, readFileSync(fpath));
    count++;
  } catch {}
}

// Root config files
for (const f of INCLUDE_ROOT_FILES) {
  const p = join(ROOT, f);
  if (existsSync(p)) addFile(p, f);
}

// Selected dirs
function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!EXCLUDE_SUBDIRS.has(entry.name)) walk(full);
    } else if (!shouldSkip(entry.name)) {
      addFile(full, relative(ROOT, full));
    }
  }
}
for (const d of INCLUDE_DIRS) {
  const p = join(ROOT, d);
  if (existsSync(p)) walk(p);
}

const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE', compressionOptions: { level: 6 } });
writeFileSync(OUT, buf);
console.log(`Klaar: ${count} bestanden — ${(buf.length / 1024).toFixed(0)} KB  →  ${OUT}`);
