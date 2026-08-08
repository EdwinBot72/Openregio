// Object-opslag op lokale schijf (vervangt de Replit/GCS-sidecar backend).
// Volledig zelfstandig: geen externe service of credentials nodig.
import { Response } from "express";
import { randomUUID, createHmac, timingSafeEqual } from "crypto";
import fs from "fs";
import {
  StoredFile,
  toStoredFile,
  fileExists,
  readMeta,
  writeMeta,
  writeData,
  removeObject,
} from "./localFile";
import {
  ObjectAclPolicy,
  ObjectPermission,
  canAccessObject,
  getObjectAclPolicy,
  setObjectAclPolicy,
} from "./objectAcl";

export class ObjectNotFoundError extends Error {
  constructor() {
    super("Object not found");
    this.name = "ObjectNotFoundError";
    Object.setPrototypeOf(this, ObjectNotFoundError.prototype);
  }
}

// ── Ondertekende upload-URL's (vervangt presigned GCS-URL's) ──────────────
const UPLOAD_TTL_MS = 900_000; // 15 minuten

function uploadSecret(): string {
  return process.env.SESSION_SECRET || "dev-local-object-secret";
}

export function signUploadToken(objectId: string, exp: number): string {
  return createHmac("sha256", uploadSecret())
    .update(`${objectId}:${exp}`)
    .digest("hex");
}

export function verifyUploadToken(
  objectId: string,
  exp: number,
  token: string,
): boolean {
  if (!Number.isFinite(exp) || Date.now() > exp) return false;
  const expected = signUploadToken(objectId, exp);
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export class ObjectStorageService {
  constructor() {}

  // Geeft een (relatieve) upload-URL terug waar de client het bestand naartoe PUT.
  // Relatief zodat er nooit http/https mixed-content ontstaat achter de proxy.
  getObjectEntityUploadURL(): string {
    const objectId = randomUUID();
    const exp = Date.now() + UPLOAD_TTL_MS;
    const token = signUploadToken(objectId, exp);
    return `/api/uploads/put/${objectId}?exp=${exp}&token=${token}`;
  }

  // Schrijft de geüploade bytes weg (aangeroepen door de PUT-endpoint).
  async writeUpload(
    objectId: string,
    data: Buffer,
    contentType: string,
  ): Promise<StoredFile> {
    const file = toStoredFile(`uploads/${objectId}`);
    writeData(file, data);
    writeMeta(file, {
      contentType,
      size: data.length,
      aclPolicy: { owner: "", visibility: "private" },
    });
    return file;
  }

  // Slaat een buffer rechtstreeks op onder een gegeven objectnaam (bv. regiobot-docs).
  async uploadBuffer(
    objectName: string,
    data: Buffer,
    contentType: string,
  ): Promise<StoredFile> {
    const file = toStoredFile(objectName);
    writeData(file, data);
    const meta = readMeta(file);
    meta.contentType = contentType;
    meta.size = data.length;
    if (!meta.aclPolicy) meta.aclPolicy = { owner: "", visibility: "private" };
    writeMeta(file, meta);
    return file;
  }

  // Zet een (upload-URL of pad) om naar het canonieke /objects/<id> pad.
  normalizeObjectEntityPath(rawPath: string): string {
    try {
      const u = rawPath.startsWith("http")
        ? new URL(rawPath)
        : new URL(rawPath, "http://local");
      const m = u.pathname.match(/\/api\/uploads\/put\/([^/?]+)/);
      if (m) return `/objects/uploads/${m[1]}`;
    } catch {
      /* geen URL — val terug op rawPath */
    }
    return rawPath;
  }

  // Haalt het opgeslagen bestand op aan de hand van het /objects/<id> pad.
  async getObjectEntityFile(objectPath: string): Promise<StoredFile> {
    if (!objectPath.startsWith("/objects/")) {
      throw new ObjectNotFoundError();
    }
    const entityId = objectPath.slice("/objects/".length);
    if (!entityId) {
      throw new ObjectNotFoundError();
    }
    let file: StoredFile;
    try {
      file = toStoredFile(entityId);
    } catch {
      throw new ObjectNotFoundError();
    }
    if (!fileExists(file)) {
      throw new ObjectNotFoundError();
    }
    return file;
  }

  async deleteObject(file: StoredFile): Promise<void> {
    removeObject(file);
  }

  // Streamt het object naar de response.
  async downloadObject(
    file: StoredFile,
    res: Response,
    cacheTtlSec: number = 3600,
  ): Promise<void> {
    try {
      const meta = readMeta(file);
      const aclPolicy = meta.aclPolicy as ObjectAclPolicy | undefined;
      const isPublic = aclPolicy?.visibility === "public";
      const size = fs.statSync(file.absPath).size;
      res.set({
        "Content-Type": meta.contentType || "application/octet-stream",
        "Content-Length": String(size),
        "Cache-Control": `${isPublic ? "public" : "private"}, max-age=${cacheTtlSec}`,
      });
      const stream = fs.createReadStream(file.absPath);
      stream.on("error", (err) => {
        console.error("Stream error:", err);
        if (!res.headersSent) {
          res.status(500).json({ error: "Error streaming file" });
        }
      });
      stream.pipe(res);
    } catch (error) {
      console.error("Error downloading file:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Error downloading file" });
      }
    }
  }

  async trySetObjectEntityAclPolicy(
    rawPath: string,
    aclPolicy: ObjectAclPolicy,
  ): Promise<string> {
    const normalizedPath = this.normalizeObjectEntityPath(rawPath);
    if (!normalizedPath.startsWith("/")) {
      return normalizedPath;
    }
    const objectFile = await this.getObjectEntityFile(normalizedPath);
    await setObjectAclPolicy(objectFile, aclPolicy);
    return normalizedPath;
  }

  async canAccessObjectEntity({
    userId,
    objectFile,
    requestedPermission,
  }: {
    userId?: string;
    objectFile: StoredFile;
    requestedPermission?: ObjectPermission;
  }): Promise<boolean> {
    return canAccessObject({
      userId,
      objectFile,
      requestedPermission: requestedPermission ?? ObjectPermission.READ,
    });
  }
}
