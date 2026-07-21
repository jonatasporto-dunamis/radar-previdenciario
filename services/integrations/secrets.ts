import "server-only";

import { decryptTenantSecret } from "@/lib/security/tenant-secrets";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { IntegrationProvider } from "@/types/integrations";

type GetTenantIntegrationSecretInput = {
  tenantId: string;
  provider: IntegrationProvider;
  secretKey: string;
};

function parseSecretPayload(payload: string): Record<string, unknown> {
  const decrypted = decryptTenantSecret(payload);
  const parsed = JSON.parse(decrypted) as unknown;

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return {};
  }

  return parsed as Record<string, unknown>;
}

export async function getTenantIntegrationSecret(
  input: GetTenantIntegrationSecretInput,
): Promise<string | null> {
  const supabase = createSupabaseAdminClient();
  const { data: integration, error: integrationError } = await supabase
    .from("tenant_integrations")
    .select("id")
    .eq("tenant_id", input.tenantId)
    .eq("provider", input.provider)
    .maybeSingle();

  if (integrationError) {
    throw new Error("Unable to load tenant integration secret reference.");
  }

  if (!integration) {
    return null;
  }

  const { data: secret, error: secretError } = await supabase
    .from("tenant_integration_secrets")
    .select("encrypted_payload")
    .eq("tenant_integration_id", integration.id)
    .maybeSingle();

  if (secretError) {
    throw new Error("Unable to load tenant integration secret.");
  }

  if (!secret) {
    return null;
  }

  const value = parseSecretPayload(secret.encrypted_payload)[input.secretKey];

  return typeof value === "string" && value.trim() ? value.trim() : null;
}
