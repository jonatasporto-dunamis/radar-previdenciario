import "server-only";
import { createAuditLog } from "@/services/office-dashboard/audit";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  requestTenantDomainSchema,
  validateCustomDomainHostname,
  validatePlatformSubdomainSlug,
} from "@/lib/validations/domain-management";
import { mapTenantDomainRow } from "@/services/tenants/repository/mappers";
import type { OfficeUserContext } from "@/types/office-dashboard";
import type {
  TenantDnsInstructions,
  TenantDomain,
  TenantDomainStatus,
} from "@/types/tenants";
import type { Json } from "@/types/supabase";
import { provisionDomainOnProvider, verifyDomainOnProvider } from "./provider";

export class TenantDomainManagementError extends Error {
  constructor(
    message = "Não foi possível gerenciar o domínio.",
    public readonly code = "domain_management_failed",
  ) {
    super(message);
    this.name = "TenantDomainManagementError";
  }
}

function toJson(value: TenantDnsInstructions): Json {
  return value as unknown as Json;
}

function assertAdmin(context: OfficeUserContext): void {
  if (context.role !== "admin") {
    throw new TenantDomainManagementError(
      "Apenas administradores podem alterar domínios.",
      "forbidden",
    );
  }
}

function validateDomainRequest(input: {
  domainType: "platform_subdomain" | "custom_domain";
  subdomainSlug?: string;
  customHostname?: string;
}): { hostname: string; domainType: "platform_subdomain" | "custom_domain" } {
  const parsed = requestTenantDomainSchema.safeParse(input);

  if (!parsed.success) {
    throw new TenantDomainManagementError(
      "Revise os dados do domínio informado.",
      "invalid_domain",
    );
  }

  const result =
    parsed.data.domainType === "platform_subdomain"
      ? validatePlatformSubdomainSlug(parsed.data.subdomainSlug)
      : validateCustomDomainHostname(parsed.data.customHostname);

  if (!result.success) {
    throw new TenantDomainManagementError(result.message, "invalid_domain");
  }

  return {
    hostname: result.hostname,
    domainType: parsed.data.domainType,
  };
}

export async function listTenantDomains(
  context: OfficeUserContext,
): Promise<TenantDomain[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("tenant_domains")
    .select("*")
    .eq("tenant_id", context.tenantId)
    .order("is_primary", { ascending: false })
    .order("created_at", { ascending: true });

  if (error) {
    throw new TenantDomainManagementError(
      "Não foi possível listar os domínios.",
      "list_failed",
    );
  }

  return (data ?? []).map(mapTenantDomainRow);
}

export async function getTenantDomain(input: {
  context: OfficeUserContext;
  domainId: string;
}): Promise<TenantDomain | null> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("tenant_domains")
    .select("*")
    .eq("tenant_id", input.context.tenantId)
    .eq("id", input.domainId)
    .maybeSingle();

  if (error) {
    throw new TenantDomainManagementError(
      "Não foi possível localizar o domínio.",
      "load_failed",
    );
  }

  return data ? mapTenantDomainRow(data) : null;
}

export async function requestTenantDomain(input: {
  context: OfficeUserContext;
  domainType: "platform_subdomain" | "custom_domain";
  subdomainSlug?: string;
  customHostname?: string;
}): Promise<TenantDomain> {
  assertAdmin(input.context);

  const { hostname, domainType } = validateDomainRequest(input);
  const supabase = createSupabaseAdminClient();
  const { data: existing, error: existingError } = await supabase
    .from("tenant_domains")
    .select("id, tenant_id")
    .eq("hostname", hostname)
    .maybeSingle();

  if (existingError) {
    throw new TenantDomainManagementError(
      "Não foi possível verificar conflito de hostname.",
      "conflict_check_failed",
    );
  }

  if (existing) {
    throw new TenantDomainManagementError(
      "Este hostname já está cadastrado.",
      "hostname_conflict",
    );
  }

  const provisioning = await provisionDomainOnProvider({
    hostname,
    domainType,
  });
  const { data, error } = await supabase
    .from("tenant_domains")
    .insert({
      tenant_id: input.context.tenantId,
      hostname,
      domain_type: domainType,
      is_platform_subdomain: domainType === "platform_subdomain",
      is_primary: false,
      status: provisioning.status,
      verification_method:
        domainType === "platform_subdomain" ? "cname" : "manual",
      dns_instructions: toJson(provisioning.dnsInstructions),
      provider_domain_id: provisioning.providerDomainId,
      ssl_status: provisioning.sslStatus,
      last_error: provisioning.lastError,
      created_by: input.context.userId,
      metadata: {
        source: "office_dashboard",
        provider: "vercel",
      },
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new TenantDomainManagementError(
      "Não foi possível cadastrar o domínio.",
      "insert_failed",
    );
  }

  await createAuditLog({
    tenantId: input.context.tenantId,
    actorUserId: input.context.userId,
    action: "domain_requested",
    entityType: "tenant_domain",
    entityId: data.id,
    metadata: {
      hostname,
      domainType,
      status: provisioning.status,
    },
  });

  return mapTenantDomainRow(data);
}

export async function verifyTenantDomain(input: {
  context: OfficeUserContext;
  domainId: string;
}): Promise<TenantDomain> {
  assertAdmin(input.context);

  const domain = await getTenantDomain(input);

  if (!domain) {
    throw new TenantDomainManagementError(
      "Domínio não encontrado para este tenant.",
      "not_found",
    );
  }

  const verification = await verifyDomainOnProvider({
    hostname: domain.hostname,
    domainType: domain.domainType,
  });
  const supabase = createSupabaseAdminClient();
  const status: TenantDomainStatus = verification.status;
  const { data, error } = await supabase
    .from("tenant_domains")
    .update({
      status,
      ssl_status: verification.sslStatus,
      provider_domain_id:
        verification.providerDomainId ?? domain.providerDomainId,
      dns_instructions: toJson(verification.dnsInstructions),
      verified_at: status === "active" ? new Date().toISOString() : null,
      last_checked_at: new Date().toISOString(),
      last_error: verification.lastError,
    })
    .eq("tenant_id", input.context.tenantId)
    .eq("id", input.domainId)
    .select("*")
    .single();

  if (error || !data) {
    throw new TenantDomainManagementError(
      "Não foi possível atualizar a verificação.",
      "verify_failed",
    );
  }

  await createAuditLog({
    tenantId: input.context.tenantId,
    actorUserId: input.context.userId,
    action: status === "active" ? "domain_verified" : "domain_requested",
    entityType: "tenant_domain",
    entityId: data.id,
    metadata: {
      hostname: domain.hostname,
      status,
      sslStatus: verification.sslStatus,
    },
  });

  return mapTenantDomainRow(data);
}

export async function makeTenantDomainPrimary(input: {
  context: OfficeUserContext;
  domainId: string;
}): Promise<TenantDomain> {
  assertAdmin(input.context);

  const domain = await getTenantDomain(input);

  if (!domain || domain.status !== "active") {
    throw new TenantDomainManagementError(
      "Somente domínios ativos podem ser definidos como principal.",
      "not_active",
    );
  }

  const supabase = createSupabaseAdminClient();
  const reset = await supabase
    .from("tenant_domains")
    .update({ is_primary: false })
    .eq("tenant_id", input.context.tenantId)
    .neq("id", input.domainId);

  if (reset.error) {
    throw new TenantDomainManagementError(
      "Não foi possível atualizar o domínio principal.",
      "primary_reset_failed",
    );
  }

  const { data, error } = await supabase
    .from("tenant_domains")
    .update({ is_primary: true })
    .eq("tenant_id", input.context.tenantId)
    .eq("id", input.domainId)
    .select("*")
    .single();

  if (error || !data) {
    throw new TenantDomainManagementError(
      "Não foi possível definir o domínio principal.",
      "primary_failed",
    );
  }

  await createAuditLog({
    tenantId: input.context.tenantId,
    actorUserId: input.context.userId,
    action: "domain_primary_changed",
    entityType: "tenant_domain",
    entityId: data.id,
    metadata: { hostname: domain.hostname },
  });

  return mapTenantDomainRow(data);
}

export async function disableTenantDomain(input: {
  context: OfficeUserContext;
  domainId: string;
}): Promise<TenantDomain> {
  assertAdmin(input.context);

  const domain = await getTenantDomain(input);

  if (!domain) {
    throw new TenantDomainManagementError(
      "Domínio não encontrado para este tenant.",
      "not_found",
    );
  }

  if (domain.isPrimary) {
    throw new TenantDomainManagementError(
      "Defina outro domínio principal antes de desativar este domínio.",
      "primary_domain",
    );
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("tenant_domains")
    .update({ status: "disabled", is_primary: false })
    .eq("tenant_id", input.context.tenantId)
    .eq("id", input.domainId)
    .select("*")
    .single();

  if (error || !data) {
    throw new TenantDomainManagementError(
      "Não foi possível desativar o domínio.",
      "disable_failed",
    );
  }

  await createAuditLog({
    tenantId: input.context.tenantId,
    actorUserId: input.context.userId,
    action: "domain_disabled",
    entityType: "tenant_domain",
    entityId: data.id,
    metadata: { hostname: domain.hostname },
  });

  return mapTenantDomainRow(data);
}

export async function removeTenantDomain(input: {
  context: OfficeUserContext;
  domainId: string;
}): Promise<void> {
  assertAdmin(input.context);

  const domain = await getTenantDomain(input);

  if (!domain) {
    throw new TenantDomainManagementError(
      "Domínio não encontrado para este tenant.",
      "not_found",
    );
  }

  if (domain.isPrimary) {
    throw new TenantDomainManagementError(
      "O domínio principal não pode ser removido.",
      "primary_domain",
    );
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("tenant_domains")
    .delete()
    .eq("tenant_id", input.context.tenantId)
    .eq("id", input.domainId);

  if (error) {
    throw new TenantDomainManagementError(
      "Não foi possível remover o domínio.",
      "delete_failed",
    );
  }

  await createAuditLog({
    tenantId: input.context.tenantId,
    actorUserId: input.context.userId,
    action: "domain_disabled",
    entityType: "tenant_domain",
    entityId: input.domainId,
    metadata: { hostname: domain.hostname, removed: true },
  });
}
