import { randomBytes } from "node:crypto";
import { afterEach, describe, expect, it } from "vitest";
import {
  decryptTenantSecret,
  encryptTenantSecret,
  TenantSecretEncryptionError,
} from "@/lib/security/tenant-secrets";

describe("tenant secret encryption", () => {
  const previousKey = process.env.TENANT_SECRETS_ENCRYPTION_KEY;

  afterEach(() => {
    process.env.TENANT_SECRETS_ENCRYPTION_KEY = previousKey;
  });

  it("encrypts and decrypts AES-256-GCM values", () => {
    process.env.TENANT_SECRETS_ENCRYPTION_KEY =
      randomBytes(32).toString("base64url");

    const encrypted = encryptTenantSecret("secret-token");

    expect(encrypted).toMatch(/^v1:/);
    expect(encrypted).not.toContain("secret-token");
    expect(decryptTenantSecret(encrypted)).toBe("secret-token");
  });

  it("rejects invalid encryption keys", () => {
    process.env.TENANT_SECRETS_ENCRYPTION_KEY = "short";

    expect(() => encryptTenantSecret("secret-token")).toThrow(
      TenantSecretEncryptionError,
    );
  });

  it("rejects missing encryption keys", () => {
    delete process.env.TENANT_SECRETS_ENCRYPTION_KEY;

    expect(() => encryptTenantSecret("secret-token")).toThrow(
      TenantSecretEncryptionError,
    );
  });

  it("rejects corrupted encrypted payloads", () => {
    process.env.TENANT_SECRETS_ENCRYPTION_KEY =
      randomBytes(32).toString("base64url");

    expect(() => decryptTenantSecret("v1:invalid")).toThrow(
      TenantSecretEncryptionError,
    );
  });
});
