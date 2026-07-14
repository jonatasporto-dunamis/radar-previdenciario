import type {
  BrandConfig,
  LegalConfig,
  OfficeConfig,
  SeoConfig,
  ThemeConfig,
} from "@/types/brand";
import type { TrackingConfig } from "@/config/tracking";
import type { TenantContext, TenantResolutionSource } from "@/types/tenants";

export interface AppConfig {
  brand: BrandConfig;
  office: OfficeConfig;
  theme: ThemeConfig;
  seo: SeoConfig;
  legal: LegalConfig;
  tracking: TrackingConfig;
}

export type ConfigurationSource = "local" | "remote";

export interface ConfigurationContext {
  tenantId?: string;
  tenantSlug?: string;
  slug?: string;
  hostname?: string;
  source?: ConfigurationSource | TenantResolutionSource;
  tenant?: TenantContext["tenant"];
}
