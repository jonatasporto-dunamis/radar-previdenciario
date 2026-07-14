import type { Tenant } from "@/types/tenants";

export const DEFAULT_TENANT_SLUG = "resende-advogados";
export const DEFAULT_TENANT_HOSTNAMES = [
  "radarprevidenciario.com.br",
  "www.radarprevidenciario.com.br",
  "radar-previdenciario.vercel.app",
] as const;

export const defaultTenantConfig: Omit<
  Tenant,
  "id" | "createdAt" | "updatedAt"
> = {
  slug: DEFAULT_TENANT_SLUG,
  name: "Resende Advogados Associados",
  legalName: "Resende Advogados Associados",
  status: "active",
  isDefault: true,
  timezone: "America/Bahia",
  locale: "pt-BR",
  metadata: {
    source: "local-config",
    role: "default_mvp_tenant",
  },
};
