export type TenantDomainType = "platform_subdomain" | "custom_domain";

export type TenantDomainStatus =
  | "pending"
  | "awaiting_dns"
  | "verifying"
  | "active"
  | "failed"
  | "disabled"
  | "inactive";

export type TenantDomainVerificationMethod =
  "manual" | "cname" | "txt" | "http";

export type TenantDomainSslStatus =
  "unknown" | "pending" | "provisioning" | "active" | "failed";

export type TenantDnsRecord = {
  type: "A" | "AAAA" | "CNAME" | "TXT";
  name: string;
  value: string;
  ttl?: string;
  status?: string;
  purpose?: string;
};

export type TenantDnsInstructions = {
  records: TenantDnsRecord[];
  notes: string[];
};

export type TenantDomain = {
  id: string;
  tenantId: string;
  hostname: string;
  domainType: TenantDomainType;
  isPrimary: boolean;
  isPlatformSubdomain: boolean;
  status: TenantDomainStatus;
  verificationMethod: TenantDomainVerificationMethod;
  verificationToken: string | null;
  dnsInstructions: TenantDnsInstructions;
  providerDomainId: string | null;
  sslStatus: TenantDomainSslStatus;
  verifiedAt: string | null;
  lastCheckedAt: string | null;
  lastError: string | null;
  metadata: Record<string, unknown>;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
};
