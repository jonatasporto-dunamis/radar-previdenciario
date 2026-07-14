import { TENANT_COOKIE_NAME } from "./constants";
import { normalizeTenantSlug } from "./slug";

export function readTenantSlugCookieValue(
  value?: string | null,
): string | null {
  return normalizeTenantSlug(value);
}

export { TENANT_COOKIE_NAME };
