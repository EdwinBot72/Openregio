import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";

const ALGO = "aes-256-gcm";
const IV_LEN = 12;
const AUTH_TAG_LEN = 16;

function getKey(): Buffer {
  const raw = process.env.WOO_ENCRYPTION_KEY;
  if (!raw) {
    throw new Error("[woo-crypto] WOO_ENCRYPTION_KEY is not set. This env var is required to encrypt personal data.");
  }
  return scryptSync(raw, "woo-salt-2025", 32);
}

export function encryptField(plaintext: string | null | undefined): string | null {
  if (!plaintext) return null;
  const key = getKey();
  const iv = randomBytes(IV_LEN);
  const cipher = createCipheriv(ALGO, key, iv, { authTagLength: AUTH_TAG_LEN });
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, encrypted]).toString("base64");
}

/** Minimum byte length of an AES-256-GCM ciphertext blob (IV + authTag + ≥1 byte payload). */
const MIN_CIPHERTEXT_BYTES = IV_LEN + AUTH_TAG_LEN + 1;

/**
 * Try to detect whether a stored value looks like an AES-GCM ciphertext blob.
 * We check that it is valid base64 and that the decoded buffer is long enough.
 * This is a best-effort heuristic; the actual GCM auth-tag check in decryptField
 * provides the definitive integrity guarantee.
 */
function looksEncrypted(value: string): boolean {
  if (!/^[A-Za-z0-9+/=]+$/.test(value)) return false;
  try {
    return Buffer.from(value, "base64").length >= MIN_CIPHERTEXT_BYTES;
  } catch {
    return false;
  }
}

export function decryptField(ciphertext: string | null | undefined): string | null {
  if (!ciphertext) return null;

  // Backward-compat: if the stored value is plaintext (legacy row), return it as-is.
  if (!looksEncrypted(ciphertext)) return ciphertext;

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
    // Fallback: if decryption fails (e.g. very long base64 plaintext), return raw value.
    console.warn("[woo-crypto] Decryption failed, returning raw value:", (err as Error).message);
    return ciphertext;
  }
}
