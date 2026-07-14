import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TEST_TENANT_ID, TEST_TENANT_B_ID } from "@/tests/fixtures";

const getDefaultTenant = vi.hoisted(() => vi.fn());
const getTenantByHostname = vi.hoisted(() => vi.fn());
const getTenantById = vi.hoisted(() => vi.fn());
const getTenantBySlug = vi.hoisted(() => vi.fn());

vi.mock("@/services/tenants/repository", () => ({
  getDefaultTenant,
  getTenantByHostname,
  getTenantById,
  getTenantBySlug,
}));

vi.mock("next/headers", () => ({
  headers: () =>
    Promise.resolve({
      get: () => null,
    }),
}));

const tenant = {
  id: TEST_TENANT_ID,
  slug: "resende-advogados",
  name: "Resende Advogados Associados",
  legalName: "Resende Advogados Associados",
  status: "active" as const,
  isDefault: true,
  timezone: "America/Bahia",
  locale: "pt-BR",
  metadata: {},
  createdAt: "2026-07-14T00:00:00.000Z",
  updatedAt: "2026-07-14T00:00:00.000Z",
};

const tenantB = {
  ...tenant,
  id: TEST_TENANT_B_ID,
  slug: "tenant-b",
  isDefault: false,
};

describe("tenant resolver", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    getDefaultTenant.mockResolvedValue(tenant);
    getTenantById.mockResolvedValue(tenant);
    getTenantBySlug.mockResolvedValue(tenantB);
    getTenantByHostname.mockResolvedValue(tenant);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("resolves by tenant id before other inputs", async () => {
    const { resolveTenant } = await import("@/services/tenants");

    await expect(
      resolveTenant({
        tenantId: TEST_TENANT_ID,
        slug: "tenant-b",
        hostname: "tenant-b.example.com",
      }),
    ).resolves.toMatchObject({
      tenantId: TEST_TENANT_ID,
      source: "id",
    });

    expect(getTenantById).toHaveBeenCalledWith(TEST_TENANT_ID);
  });

  it("resolves by slug and hostname", async () => {
    const { resolveTenant } = await import("@/services/tenants");

    await expect(resolveTenant({ slug: "tenant-b" })).resolves.toMatchObject({
      tenantId: TEST_TENANT_B_ID,
      source: "slug",
    });

    getTenantBySlug.mockResolvedValueOnce(null);

    await expect(
      resolveTenant({ hostname: "radarprevidenciario.com.br" }),
    ).resolves.toMatchObject({
      tenantId: TEST_TENANT_ID,
      source: "hostname",
    });
  });

  it("resolves by hostname before slug after explicit tenant id", async () => {
    const { resolveTenant } = await import("@/services/tenants");

    await expect(
      resolveTenant({
        slug: "tenant-b",
        hostname: "radarprevidenciario.com.br",
      }),
    ).resolves.toMatchObject({
      tenantId: TEST_TENANT_ID,
      source: "hostname",
    });

    expect(getTenantByHostname).toHaveBeenCalledWith(
      "radarprevidenciario.com.br",
    );
    expect(getTenantBySlug).not.toHaveBeenCalled();
  });

  it("falls back to the default tenant for development localhost", async () => {
    vi.stubEnv("NODE_ENV", "development");
    getTenantByHostname.mockResolvedValue(null);
    const { resolveTenant } = await import("@/services/tenants");

    await expect(
      resolveTenant({ hostname: "localhost:3000" }),
    ).resolves.toMatchObject({
      tenantId: TEST_TENANT_ID,
      source: "development-fallback",
    });
  });

  it("rejects unknown production hostnames", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("VERCEL_ENV", "production");
    getTenantByHostname.mockResolvedValue(null);
    const { resolveTenant, TenantResolutionError } =
      await import("@/services/tenants");

    await expect(
      resolveTenant({ hostname: "unknown.example.com" }),
    ).rejects.toBeInstanceOf(TenantResolutionError);
  });
});
