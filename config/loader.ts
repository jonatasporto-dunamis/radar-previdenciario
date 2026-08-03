import type { z } from "zod";
import { defaultBrandConfig } from "@/config/brand/default";
import { defaultLegalConfig } from "@/config/legal/default";
import { defaultOfficeConfig } from "@/config/office/default";
import { defaultSeoConfig } from "@/config/seo/default";
import { defaultThemeConfig } from "@/config/theme/default";
import { defaultTrackingConfig } from "@/config/tracking/default";
import type { AppConfig, ConfigurationContext } from "@/types/configuration";
import { defaultTenantBrandingSettings } from "@/lib/branding";
import { tenantBrandingSettingsSchema } from "@/lib/branding/validation";
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
  const baseConfig = {
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

  const tenant = context?.tenant;

  if (!tenant) {
    return appConfigSchema.parse(baseConfig) as AppConfig;
  }

  const storedBranding = tenantBrandingSettingsSchema.safeParse(
    tenant.metadata.branding,
  );
  const branding = storedBranding.success
    ? storedBranding.data
    : defaultTenantBrandingSettings;
  const keepDefaultTenantContact = tenant.isDefault && !storedBranding.success;
  const brand = {
    ...baseConfig.brand,
    name: tenant.name,
    legalName: tenant.legalName,
    logo: branding.logoUrl || branding.iconUrl || baseConfig.brand.logo,
    icon: branding.iconUrl || undefined,
    favicon: branding.faviconUrl || baseConfig.brand.favicon,
    socialImage: branding.socialImageUrl || undefined,
    primaryColor: branding.primaryColor,
    secondaryColor: branding.secondaryColor,
    accentColor: branding.accentColor,
    backgroundColor: branding.backgroundColor,
    foregroundColor: branding.textColor,
    buttonColor: branding.buttonColor,
    buttonTextColor: branding.buttonTextColor,
    whatsappColor: branding.whatsappColor,
    whatsapp: storedBranding.success
      ? branding.whatsappNumber
      : keepDefaultTenantContact
        ? baseConfig.brand.whatsapp
        : "",
    whatsappDefaultMessage: storedBranding.success
      ? branding.whatsappMessage
      : keepDefaultTenantContact
        ? baseConfig.brand.whatsappDefaultMessage
        : branding.whatsappMessage,
    phone: storedBranding.success
      ? branding.contactPhone || undefined
      : keepDefaultTenantContact
        ? baseConfig.brand.phone
        : undefined,
    email: storedBranding.success
      ? branding.contactEmail || undefined
      : keepDefaultTenantContact
        ? baseConfig.brand.email
        : undefined,
    shortContactText: branding.shortContactText || undefined,
    institutionalMessage: branding.institutionalMessage || undefined,
    registrationTitle: branding.registrationTitle,
    registrationSubtitle: branding.registrationSubtitle,
    registrationSupportText: branding.registrationSupportText,
    registrationButtonLabel: branding.registrationButtonLabel,
    registrationNamePlaceholder: branding.registrationNamePlaceholder,
    registrationEmailPlaceholder: branding.registrationEmailPlaceholder,
    registrationPhonePlaceholder: branding.registrationPhonePlaceholder,
  };
  const theme = {
    ...baseConfig.theme,
    colors: {
      ...baseConfig.theme.colors,
      light: {
        ...baseConfig.theme.colors.light,
        background: branding.backgroundColor,
        foreground: branding.textColor,
        primary: branding.buttonColor,
        primaryForeground: branding.buttonTextColor,
        secondary: branding.secondaryColor,
        accent: branding.accentColor,
        ring: branding.primaryColor,
      },
    },
  };
  const config = {
    ...baseConfig,
    brand,
    theme,
    office: {
      ...baseConfig.office,
      legalIdentity: {
        ...baseConfig.office.legalIdentity,
        officeName: tenant.name,
        responsibleProfessionalName:
          branding.responsibleProfessionalName ||
          baseConfig.office.legalIdentity.responsibleProfessionalName,
        professionalRegistration:
          branding.professionalRegistration ||
          baseConfig.office.legalIdentity.professionalRegistration,
      },
      whatsappDefaultMessage: brand.whatsappDefaultMessage,
      email: {
        ...baseConfig.office.email,
        fromName: tenant.name,
      },
    },
    seo: {
      ...baseConfig.seo,
      ogImage: branding.socialImageUrl || baseConfig.seo.ogImage,
      twitterImage: branding.socialImageUrl || baseConfig.seo.twitterImage,
    },
    legal: {
      ...baseConfig.legal,
      privacyPolicyCompany: tenant.legalName,
    },
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
