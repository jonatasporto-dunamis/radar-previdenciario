import "server-only";
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH_BYTES = 12;
const KEY_LENGTH_BYTES = 32;
const VERSION = "v1";

export class TenantSecretEncryptionError extends Error {
  constructor(message = "Tenant secret encryption error.") {
    super(message);
    this.name = "TenantSecretEncryptionError";
  }
}

function encode(value: Buffer): string {
  return value.toString("base64url");
}

function decode(value: string): Buffer {
  return Buffer.from(value, "base64url");
}

function getEncryptionKey(): Buffer {
  const raw = process.env.TENANT_SECRETS_ENCRYPTION_KEY;

  if (!raw) {
    throw new TenantSecretEncryptionError(
      "TENANT_SECRETS_ENCRYPTION_KEY is not configured.",
    );
  }

  const key = /^[0-9a-f]{64}$/i.test(raw)
    ? Buffer.from(raw, "hex")
    : Buffer.from(raw, "base64url");

  if (key.length !== KEY_LENGTH_BYTES) {
    throw new TenantSecretEncryptionError(
      "TENANT_SECRETS_ENCRYPTION_KEY must decode to 32 bytes.",
    );
  }

  return key;
}

export function encryptTenantSecret(plainText: string): string {
  const key = getEncryptionKey();
  const iv = randomBytes(IV_LENGTH_BYTES);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plainText, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return [VERSION, encode(iv), encode(authTag), encode(encrypted)].join(":");
}

export function decryptTenantSecret(encryptedValue: string): string {
  const [version, encodedIv, encodedAuthTag, encodedPayload] =
    encryptedValue.split(":");

  if (version !== VERSION || !encodedIv || !encodedAuthTag || !encodedPayload) {
    throw new TenantSecretEncryptionError(
      "Unsupported encrypted secret value.",
    );
  }

  const key = getEncryptionKey();
  const decipher = createDecipheriv(ALGORITHM, key, decode(encodedIv));

  decipher.setAuthTag(decode(encodedAuthTag));

  return Buffer.concat([
    decipher.update(decode(encodedPayload)),
    decipher.final(),
  ]).toString("utf8");
}
