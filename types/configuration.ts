import type {
  BrandConfig,
  LegalConfig,
  OfficeConfig,
  SeoConfig,
  ThemeConfig,
} from "@/types/brand";

export interface AppConfig {
  brand: BrandConfig;
  office: OfficeConfig;
  theme: ThemeConfig;
  seo: SeoConfig;
  legal: LegalConfig;
}

export type ConfigurationSource = "local" | "remote";

export interface ConfigurationContext {
  tenantId?: string;
  slug?: string;
  hostname?: string;
  source?: ConfigurationSource;
}
