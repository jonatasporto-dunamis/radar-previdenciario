import type { Tenant } from "./tenant";

export type TenantResolutionSource =
  | "id"
  | "hostname"
  | "slug"
  | "default"
  | "development-fallback"
  | "preview-fallback";

export type TenantContext = {
  tenantId: string;
  slug: string;
  hostname?: string;
  source: TenantResolutionSource;
  tenant: Tenant;
};

export type TenantResolveInput = {
  tenantId?: string | null;
  slug?: string | null;
  hostname?: string | null;
};
