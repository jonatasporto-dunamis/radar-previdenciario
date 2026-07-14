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
  is_primary: boolean;
  status: string;
  metadata: Json | null;
  created_at: string;
  updated_at: string;
}): TenantDomain {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    hostname: row.hostname,
    isPrimary: row.is_primary,
    status: row.status as TenantDomain["status"],
    metadata: asObject(row.metadata),
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
