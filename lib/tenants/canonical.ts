import type { TenantResolutionSource } from "@/types/tenants";

export function shouldRedirectTenantToCanonical(input: {
  canonicalHostname: string;
  currentHostname?: string | null;
  isOfficePanelPath: boolean;
  isPlatformSubdomain: boolean;
  isProduction: boolean;
  source: TenantResolutionSource;
}): boolean {
  return Boolean(
    input.isProduction &&
    !input.isOfficePanelPath &&
    input.source === "hostname" &&
    input.currentHostname &&
    input.currentHostname !== input.canonicalHostname &&
    !input.isPlatformSubdomain,
  );
}
