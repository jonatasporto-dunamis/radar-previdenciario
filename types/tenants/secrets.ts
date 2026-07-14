export type TenantSecretStatus = "active" | "inactive" | "rotated";

export type TenantSecretKey =
  "meta_conversions_api_access_token" | "meta_test_event_code";

export type TenantSecret = {
  id: string;
  tenantId: string;
  secretKey: TenantSecretKey | string;
  encryptedValue: string;
  status: TenantSecretStatus;
  createdAt: string;
  updatedAt: string;
};
