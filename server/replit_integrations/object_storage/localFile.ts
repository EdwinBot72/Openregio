// Lokale-schijf opslag (vervangt de Replit/GCS-backend).
// Objecten worden opgeslagen onder een basismap (standaard <cwd>/uploads/objects),
// met per object een <naam>.meta.json voor content-type en ACL-beleid.
import fs from "fs";
import path from "path";

export interface StoredFile {
  objectName: string; // relatief, bv. "uploads/<uuid>"
  absPath: string; // absoluut pad naar het databestand
}

export interface ObjectMeta {
  contentType?: string;
  size?: number;
  aclPolicy?: unknown;
}

export function objectBaseDir(): string {
  return process.env.LOCAL_OBJECT_DIR || path.join(process.cwd(), "uploads", "objects");
}

// Zet een (door de gebruiker aangeleverde) objectnaam om naar een StoredFile,
// met bescherming tegen path traversal (../).
export function toStoredFile(objectName: string): StoredFile {
  const clean = objectName.replace(/^\/+/, "");
  const base = path.resolve(objectBaseDir());
  const abs = path.resolve(base, clean);
  if (abs !== base && !abs.startsWith(base + path.sep)) {
    throw new Error("Ongeldig objectpad");
  }
  return { objectName: clean, absPath: abs };
}

export function metaPath(f: StoredFile): string {
  return f.absPath + ".meta.json";
}

export function fileExists(f: StoredFile): boolean {
  return fs.existsSync(f.absPath) && fs.statSync(f.absPath).isFile();
}

export function readMeta(f: StoredFile): ObjectMeta {
  try {
    return JSON.parse(fs.readFileSync(metaPath(f), "utf8"));
  } catch {
    return {};
  }
}

export function writeMeta(f: StoredFile, meta: ObjectMeta): void {
  fs.mkdirSync(path.dirname(f.absPath), { recursive: true });
  fs.writeFileSync(metaPath(f), JSON.stringify(meta));
}

export function writeData(f: StoredFile, data: Buffer): void {
  fs.mkdirSync(path.dirname(f.absPath), { recursive: true });
  fs.writeFileSync(f.absPath, data);
}

export function removeObject(f: StoredFile): void {
  try {
    fs.unlinkSync(f.absPath);
  } catch {
    /* al weg */
  }
  try {
    fs.unlinkSync(metaPath(f));
  } catch {
    /* geen meta */
  }
}
