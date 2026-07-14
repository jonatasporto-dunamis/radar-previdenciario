import "server-only";
import { headers } from "next/headers";
import {
  DEFAULT_TENANT_SLUG,
  isDevelopmentHostname,
  isVercelPreviewHostname,
  normalizeHostname,
  normalizeTenantSlug,
} from "@/lib/tenants";
import type {
  Tenant,
  TenantContext,
  TenantResolutionSource,
  TenantResolveInput,
} from "@/types/tenants";
import {
  getDefaultTenant,
  getTenantByHostname,
  getTenantById,
  getTenantBySlug,
} from "./repository";

export class TenantResolutionError extends Error {
  constructor(message = "Tenant could not be resolved.") {
    super(message);
    this.name = "TenantResolutionError";
  }
}

function toTenantContext(input: {
  tenant: Tenant;
  hostname?: string | null;
  source: TenantResolutionSource;
}): TenantContext {
  return {
    tenantId: input.tenant.id,
    slug: input.tenant.slug,
    hostname: input.hostname ?? undefined,
    source: input.source,
    tenant: input.tenant,
  };
}

async function readRequestHostname(): Promise<string | null> {
  const requestHeaders = await headers();

  return normalizeHostname(
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host"),
  );
}

async function resolveDefault(
  source: TenantResolutionSource = "default",
  hostname?: string | null,
): Promise<TenantContext> {
  const tenant = await getDefaultTenant();

  if (!tenant) {
    throw new TenantResolutionError("Default tenant is not configured.");
  }

  return toTenantContext({ tenant, hostname, source });
}

function shouldUseDevelopmentFallback(hostname?: string | null): boolean {
  return (
    process.env.NODE_ENV !== "production" && isDevelopmentHostname(hostname)
  );
}

function shouldUsePreviewFallback(hostname?: string | null): boolean {
  return (
    process.env.VERCEL_ENV === "preview" && isVercelPreviewHostname(hostname)
  );
}

export async function resolveTenant(
  input: TenantResolveInput = {},
): Promise<TenantContext> {
  if (input.tenantId) {
    const tenant = await getTenantById(input.tenantId);

    if (tenant?.status === "active") {
      return toTenantContext({
        tenant,
        hostname: input.hostname,
        source: "id",
      });
    }
  }

  const hostname = normalizeHostname(
    input.hostname ?? (await readRequestHostname()),
  );

  if (hostname) {
    const tenant = await getTenantByHostname(hostname);

    if (tenant?.status === "active") {
      return toTenantContext({ tenant, hostname, source: "hostname" });
    }

    if (shouldUseDevelopmentFallback(hostname)) {
      return resolveDefault("development-fallback", hostname);
    }

    if (shouldUsePreviewFallback(hostname)) {
      return resolveDefault("preview-fallback", hostname);
    }
  }

  const slug = normalizeTenantSlug(input.slug);

  if (slug) {
    const tenant = await getTenantBySlug(slug);

    if (tenant) {
      return toTenantContext({
        tenant,
        hostname,
        source: "slug",
      });
    }
  }

  if (!input.tenantId && !slug && !hostname) {
    return resolveDefault("default");
  }

  if (process.env.NODE_ENV !== "production" && !hostname) {
    return resolveDefault("development-fallback");
  }

  if (slug === DEFAULT_TENANT_SLUG && process.env.NODE_ENV !== "production") {
    return resolveDefault("development-fallback", hostname);
  }

  throw new TenantResolutionError("No active tenant matched the request.");
}

export async function getTenantContext(
  input?: TenantResolveInput,
): Promise<TenantContext> {
  return resolveTenant(input);
}
