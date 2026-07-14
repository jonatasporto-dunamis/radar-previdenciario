import {
  DEFAULT_TENANT_HOSTNAMES,
  DEFAULT_TENANT_SLUG,
} from "@/config/tenants";

export { DEFAULT_TENANT_HOSTNAMES, DEFAULT_TENANT_SLUG };

export const TENANT_COOKIE_NAME = "rp_tenant";

export const DEVELOPMENT_HOSTNAMES = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
]);
