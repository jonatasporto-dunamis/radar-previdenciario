import type {
  Tenant,
  TenantDomain,
  TenantSecret,
  TenantTrackingConfig,
} from "@/types/tenants";
import type { Json } from "@/types/supabase";

type JsonObject = Record<string, unknown>;

function asObject(value: Json | null | undefined): JsonObject {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value as JsonObject;
}

export function mapTenantRow(row: {
  id: string;
  slug: string;
  name: string;
  legal_name: string;
  status: string;
  is_default: boolean;
  timezone: string;
  locale: string;
  metadata: Json | null;
  created_at: string;
  updated_at: string;
}): Tenant {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    legalName: row.legal_name,
    status: row.status as Tenant["status"],
    isDefault: row.is_default,
    timezone: row.timezone,
    locale: row.locale,
    metadata: asObject(row.metadata),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapTenantDomainRow(row: {
  id: string;
  tenant_id: string;
  hostname: string;
  domain_type?: string | null;
  is_primary: boolean;
  is_platform_subdomain?: boolean | null;
  status: string;
  verification_method?: string | null;
  verification_token?: string | null;
  dns_instructions?: Json | null;
  provider_domain_id?: string | null;
  ssl_status?: string | null;
  verified_at?: string | null;
  last_checked_at?: string | null;
  last_error?: string | null;
  metadata: Json | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}): TenantDomain {
  const dnsInstructions = asObject(row.dns_instructions);

  return {
    id: row.id,
    tenantId: row.tenant_id,
    hostname: row.hostname,
    domainType:
      (row.domain_type as TenantDomain["domainType"] | undefined) ??
      "custom_domain",
    isPrimary: row.is_primary,
    isPlatformSubdomain: row.is_platform_subdomain ?? false,
    status: row.status as TenantDomain["status"],
    verificationMethod:
      (row.verification_method as TenantDomain["verificationMethod"] | null) ??
      "manual",
    verificationToken: row.verification_token ?? null,
    dnsInstructions: {
      records: Array.isArray(dnsInstructions.records)
        ? (dnsInstructions.records as TenantDomain["dnsInstructions"]["records"])
        : [],
      notes: Array.isArray(dnsInstructions.notes)
        ? (dnsInstructions.notes as string[])
        : [],
    },
    providerDomainId: row.provider_domain_id ?? null,
    sslStatus:
      (row.ssl_status as TenantDomain["sslStatus"] | null) ?? "unknown",
    verifiedAt: row.verified_at ?? null,
    lastCheckedAt: row.last_checked_at ?? null,
    lastError: row.last_error ?? null,
    metadata: asObject(row.metadata),
    createdBy: row.created_by ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapTenantTrackingConfigRow(row: {
  id: string;
  tenant_id: string;
  enabled: boolean;
  consent_required: boolean;
  external_tracking_dry_run: boolean;
  meta_enabled: boolean;
  meta_pixel_id: string | null;
  meta_api_version: string;
  meta_test_mode: boolean;
  ga4_enabled: boolean;
  ga4_measurement_id: string | null;
  gtm_enabled: boolean;
  gtm_container_id: string | null;
  event_config: Json | null;
  created_at: string;
  updated_at: string;
}): TenantTrackingConfig {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    enabled: row.enabled,
    consentRequired: row.consent_required,
    externalTrackingDryRun: row.external_tracking_dry_run,
    metaEnabled: row.meta_enabled,
    metaPixelId: row.meta_pixel_id,
    metaApiVersion: row.meta_api_version,
    metaTestMode: row.meta_test_mode,
    ga4Enabled: row.ga4_enabled,
    ga4MeasurementId: row.ga4_measurement_id,
    gtmEnabled: row.gtm_enabled,
    gtmContainerId: row.gtm_container_id,
    eventConfig: asObject(
      row.event_config,
    ) as TenantTrackingConfig["eventConfig"],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapTenantSecretRow(row: {
  id: string;
  tenant_id: string;
  secret_key: string;
  encrypted_value: string;
  status: string;
  created_at: string;
  updated_at: string;
}): TenantSecret {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    secretKey: row.secret_key,
    encryptedValue: row.encrypted_value,
    status: row.status as TenantSecret["status"],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
