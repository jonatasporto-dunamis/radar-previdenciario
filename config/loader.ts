import type { z } from "zod";
import { defaultBrandConfig } from "@/config/brand/default";
import { defaultLegalConfig } from "@/config/legal/default";
import { defaultOfficeConfig } from "@/config/office/default";
import { defaultSeoConfig } from "@/config/seo/default";
import { defaultThemeConfig } from "@/config/theme/default";
import { defaultTrackingConfig } from "@/config/tracking/default";
import type { AppConfig, ConfigurationContext } from "@/types/configuration";
import {
  appConfigSchema,
  brandConfigSchema,
  legalConfigSchema,
  officeConfigSchema,
  seoConfigSchema,
  themeConfigSchema,
  trackingConfigSchema,
} from "./schemas";

function parseDomainConfig<T>(
  domain: string,
  schema: z.ZodType<T>,
  value: unknown,
): T {
  try {
    return schema.parse(value);
  } catch {
    throw new Error(`Failed to load ${domain} configuration.`);
  }
}

export async function loadLocalConfig(
  context?: ConfigurationContext,
): Promise<AppConfig> {
  // Future tenant resolution may use hostname -> slug -> tenantId -> default.
  // The MVP intentionally ignores context and returns the local configuration.
  void context;

  const config = {
    brand: parseDomainConfig("brand", brandConfigSchema, defaultBrandConfig),
    office: parseDomainConfig(
      "office",
      officeConfigSchema,
      defaultOfficeConfig,
    ),
    theme: parseDomainConfig("theme", themeConfigSchema, defaultThemeConfig),
    seo: parseDomainConfig("seo", seoConfigSchema, defaultSeoConfig),
    legal: parseDomainConfig("legal", legalConfigSchema, defaultLegalConfig),
    tracking: parseDomainConfig(
      "tracking",
      trackingConfigSchema,
      defaultTrackingConfig,
    ),
  };

  try {
    return appConfigSchema.parse(config) as AppConfig;
  } catch {
    throw new Error("Failed to load application configuration.");
  }
}

export async function loadAppConfig(
  context?: ConfigurationContext,
): Promise<AppConfig> {
  return loadLocalConfig(context);
}
