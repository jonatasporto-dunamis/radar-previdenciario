export type TenantDomainStatus = "active" | "inactive";

export type TenantDomain = {
  id: string;
  tenantId: string;
  hostname: string;
  isPrimary: boolean;
  status: TenantDomainStatus;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};
