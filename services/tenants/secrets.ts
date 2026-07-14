import "server-only";
import { decryptTenantSecret } from "@/lib/security/tenant-secrets";
import type { TenantSecretKey } from "@/types/tenants";
import { getTenantById, getTenantSecretRow } from "./repository";

type GetTenantSecretInput = {
  tenantId: string;
  secretKey: TenantSecretKey | string;
  allowDefaultEnvFallback?: boolean;
};

const ENV_SECRET_FALLBACKS: Record<string, string> = {
  meta_conversions_api_access_token: "META_CONVERSIONS_API_ACCESS_TOKEN",
  meta_test_event_code: "META_TEST_EVENT_CODE",
};

export async function getTenantSecret(
  input: GetTenantSecretInput,
): Promise<string | null> {
  const secret = await getTenantSecretRow({
    tenantId: input.tenantId,
    secretKey: input.secretKey,
  });

  if (secret) {
    return decryptTenantSecret(secret.encryptedValue);
  }

  if (!input.allowDefaultEnvFallback) {
    return null;
  }

  const tenant = await getTenantById(input.tenantId);
  const envName = ENV_SECRET_FALLBACKS[input.secretKey];

  if (!tenant?.isDefault || !envName) {
    return null;
  }

  return process.env[envName] || null;
}
