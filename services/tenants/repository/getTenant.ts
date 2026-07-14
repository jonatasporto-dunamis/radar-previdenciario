import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { normalizeHostname, normalizeTenantSlug } from "@/lib/tenants";
import type {
  Tenant,
  TenantDomain,
  TenantSecret,
  TenantSecretKey,
  TenantTrackingConfig,
} from "@/types/tenants";
import {
  mapTenantDomainRow,
  mapTenantRow,
  mapTenantSecretRow,
  mapTenantTrackingConfigRow,
} from "./mappers";

export class TenantRepositoryError extends Error {
  constructor(message = "Tenant repository error.") {
    super(message);
    this.name = "TenantRepositoryError";
  }
}

export async function getTenantById(tenantId: string): Promise<Tenant | null> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("tenants")
    .select("*")
    .eq("id", tenantId)
    .maybeSingle();

  if (error) {
    throw new TenantRepositoryError("Failed to load tenant by id.");
  }

  return data ? mapTenantRow(data) : null;
}

export async function getTenantBySlug(slug: string): Promise<Tenant | null> {
  const normalizedSlug = normalizeTenantSlug(slug);

  if (!normalizedSlug) {
    return null;
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("tenants")
    .select("*")
    .eq("slug", normalizedSlug)
    .eq("status", "active")
    .maybeSingle();

  if (error) {
    throw new TenantRepositoryError("Failed to load tenant by slug.");
  }

  return data ? mapTenantRow(data) : null;
}

export async function getDefaultTenant(): Promise<Tenant | null> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("tenants")
    .select("*")
    .eq("is_default", true)
    .eq("status", "active")
    .maybeSingle();

  if (error) {
    throw new TenantRepositoryError("Failed to load default tenant.");
  }

  return data ? mapTenantRow(data) : null;
}

export async function getTenantDomainByHostname(
  hostname: string,
): Promise<TenantDomain | null> {
  const normalizedHostname = normalizeHostname(hostname);

  if (!normalizedHostname) {
    return null;
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("tenant_domains")
    .select("*")
    .eq("hostname", normalizedHostname)
    .eq("status", "active")
    .maybeSingle();

  if (error) {
    throw new TenantRepositoryError("Failed to load tenant domain.");
  }

  return data ? mapTenantDomainRow(data) : null;
}

export async function getTenantByHostname(
  hostname: string,
): Promise<Tenant | null> {
  const domain = await getTenantDomainByHostname(hostname);

  return domain ? getTenantById(domain.tenantId) : null;
}

export async function getTenantTrackingConfigByTenantId(
  tenantId: string,
): Promise<TenantTrackingConfig | null> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("tenant_tracking_configs")
    .select("*")
    .eq("tenant_id", tenantId)
    .maybeSingle();

  if (error) {
    throw new TenantRepositoryError("Failed to load tenant tracking config.");
  }

  return data ? mapTenantTrackingConfigRow(data) : null;
}

export async function getTenantSecretRow(input: {
  tenantId: string;
  secretKey: TenantSecretKey | string;
}): Promise<TenantSecret | null> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("tenant_secrets")
    .select("*")
    .eq("tenant_id", input.tenantId)
    .eq("secret_key", input.secretKey)
    .eq("status", "active")
    .maybeSingle();

  if (error) {
    throw new TenantRepositoryError("Failed to load tenant secret.");
  }

  return data ? mapTenantSecretRow(data) : null;
}
