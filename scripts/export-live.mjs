import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { join, relative } from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const JSZip = require('jszip');

const ROOT = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
const OUT = join(ROOT, 'openregio-live.zip');

const EXCLUDE_DIRS = new Set([
  '.git', 'node_modules', '.local', '.cache', '.config',
  'dist', 'artifacts', 'uploads', 'attached_assets', '.agents',
  '.pythonlibs', 'wordpress-plugin', 'public',
]);
const EXCLUDE_EXTS = new Set([
  '.zip', '.log', '.webp', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico',
  '.woff', '.woff2', '.ttf', '.eot', '.mp4', '.mp3', '.wav', '.tar', '.gz',
]);
const EXCLUDE_FILES = new Set([
  '.env', '.env.local', '.env.production',
  'package-lock.json', 'uv.lock', 'plus-jakarta-sans.ts',
]);

function shouldSkip(name) {
  if (EXCLUDE_FILES.has(name)) return true;
  const dot = name.lastIndexOf('.');
  return dot !== -1 && EXCLUDE_EXTS.has(name.slice(dot));
}

const zip = new JSZip();
let count = 0;

function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!EXCLUDE_DIRS.has(entry.name)) walk(full);
    } else if (!shouldSkip(entry.name)) {
      try {
        zip.file(relative(ROOT, full), readFileSync(full));
        count++;
      } catch {}
    }
  }
}
walk(ROOT);

const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE', compressionOptions: { level: 6 } });
writeFileSync(OUT, buf);
console.log(`Klaar: ${count} bestanden — ${(buf.length / 1024 / 1024).toFixed(2)} MB  →  ${OUT}`);
