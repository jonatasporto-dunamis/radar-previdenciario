import { loadAppConfig } from "@/config";
import type { AppConfig, ConfigurationContext } from "@/types/configuration";
import { getTenantContext } from "@/services/tenants";

export async function getAppConfig(
  context?: ConfigurationContext,
): Promise<AppConfig> {
  if (context?.tenant) {
    return loadAppConfig(context);
  }

  let tenantContext;

  try {
    tenantContext = await getTenantContext({
      tenantId: context?.tenantId,
      hostname: context?.hostname,
      slug: context?.tenantSlug ?? context?.slug,
    });
  } catch (error) {
    if (
      context?.tenantId ||
      context?.hostname ||
      context?.tenantSlug ||
      context?.slug
    ) {
      throw error;
    }

    // Background jobs and unit contexts do not have Next.js request headers.
    return loadAppConfig(context);
  }

  return loadAppConfig({
    ...context,
    tenantId: tenantContext.tenantId,
    tenantSlug: tenantContext.slug,
    tenant: tenantContext.tenant,
  });
}
