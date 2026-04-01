import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";

const ALGO = "aes-256-gcm";
const IV_LEN = 12;
const AUTH_TAG_LEN = 16;

function getKey(): Buffer {
  const raw = process.env.WOO_ENCRYPTION_KEY;
  if (!raw) {
    console.warn("[woo-crypto] WOO_ENCRYPTION_KEY is not set — using fallback key. Set this env var in production!");
  }
  const secret = raw || "openregio-woo-dev-fallback-key-32c";
  return scryptSync(secret, "woo-salt-2025", 32);
}

export function encryptField(plaintext: string | null | undefined): string | null {
  if (!plaintext) return null;
  try {
    const key = getKey();
    const iv = randomBytes(IV_LEN);
    const cipher = createCipheriv(ALGO, key, iv, { authTagLength: AUTH_TAG_LEN });
    const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
    const authTag = cipher.getAuthTag();
    return Buffer.concat([iv, authTag, encrypted]).toString("base64");
  } catch (err) {
    console.error("[woo-crypto] Encryption error:", err);
    return null;
  }
}

export function decryptField(ciphertext: string | null | undefined): string | null {
  if (!ciphertext) return null;
  try {
    const key = getKey();
    const buf = Buffer.from(ciphertext, "base64");
    const iv = buf.subarray(0, IV_LEN);
    const authTag = buf.subarray(IV_LEN, IV_LEN + AUTH_TAG_LEN);
    const encrypted = buf.subarray(IV_LEN + AUTH_TAG_LEN);
    const decipher = createDecipheriv(ALGO, key, iv, { authTagLength: AUTH_TAG_LEN });
    decipher.setAuthTag(authTag);
    return decipher.update(encrypted) + decipher.final("utf8");
  } catch (err) {
    console.error("[woo-crypto] Decryption error:", err);
    return null;
  }
}
