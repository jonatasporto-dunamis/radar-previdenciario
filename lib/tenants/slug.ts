const TENANT_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function normalizeTenantSlug(value?: string | null): string | null {
  if (!value) {
    return null;
  }

  const normalized = value.trim().toLowerCase();

  return TENANT_SLUG_PATTERN.test(normalized) ? normalized : null;
}
