import "server-only";
import { getPrimaryTenantDomain } from "./repository";
import type { TenantContext } from "@/types/tenants";

export async function getTenantSiteUrl(
  context: TenantContext,
): Promise<string> {
  const primaryDomain = await getPrimaryTenantDomain(context.tenantId);

  if (primaryDomain) {
    return `https://${primaryDomain.hostname}`;
  }

  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}
