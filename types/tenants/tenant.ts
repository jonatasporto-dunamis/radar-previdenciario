export type TenantStatus = "active" | "inactive" | "suspended";

export type Tenant = {
  id: string;
  slug: string;
  name: string;
  legalName: string;
  status: TenantStatus;
  isDefault: boolean;
  timezone: string;
  locale: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};
