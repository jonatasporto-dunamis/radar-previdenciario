import { beforeAll, describe, expect, it } from "vitest";
import {
  listTenantDomains,
  requestTenantDomain,
  TenantDomainManagementError,
  verifyTenantDomain,
} from "@/services/office-dashboard/domains";
import type { OfficeUserContext } from "@/types/office-dashboard";

const tenantA = "00000000-0000-4000-8000-000000000001";
const tenantB = "00000000-0000-4000-8000-000000000002";

const adminContext: OfficeUserContext = {
  userId: "00000000-0000-4000-8000-000000000901",
  email: "admin@example.com",
  tenantId: tenantA,
  tenantSlug: "resende-advogados",
  tenantName: "Resende Advogados Associados",
  tenantStatus: "active",
  membershipId: "00000000-0000-4000-8000-000000000911",
  role: "admin",
  displayName: "Admin E2E",
};

const tenantBContext: OfficeUserContext = {
  ...adminContext,
  userId: "00000000-0000-4000-8000-000000000906",
  email: "admin-b@example.com",
  tenantId: tenantB,
  tenantSlug: "tenant-b",
  tenantName: "Tenant B",
};

describe("office dashboard domains", () => {
  beforeAll(() => {
    process.env.E2E_MOCK_SUPABASE = "true";
    process.env.NEXT_PUBLIC_SITE_URL = "https://radarprevidenciario.com.br";
    delete process.env.VERCEL_TOKEN;
    delete process.env.VERCEL_PROJECT_ID;
    delete process.env.VERCEL_TEAM_ID;
  });

  it("lists only domains for the current tenant", async () => {
    const tenantADomains = await listTenantDomains(adminContext);
    const tenantBDomains = await listTenantDomains(tenantBContext);

    expect(tenantADomains.some((domain) => domain.isPrimary)).toBe(true);
    expect(
      tenantADomains.some(
        (domain) => domain.hostname === "resende.radarprevidenciario.com.br",
      ),
    ).toBe(true);
    expect(tenantBDomains).toEqual([]);
  });

  it("creates requests without provider credentials and keeps status safe", async () => {
    const domain = await requestTenantDomain({
      context: adminContext,
      domainType: "custom_domain",
      customHostname: "beneficios.e2e-domain.test",
    });

    expect(domain.status).toBe("awaiting_dns");
    expect(domain.providerDomainId).toBeNull();
    expect(domain.dnsInstructions.notes.join(" ")).toContain("server-side");

    const verified = await verifyTenantDomain({
      context: adminContext,
      domainId: domain.id,
    });

    expect(verified.status).toBe("awaiting_dns");
    expect(verified.lastError).toContain("Vercel");
  });

  it("blocks duplicate hostnames and non-admin changes", async () => {
    await expect(
      requestTenantDomain({
        context: adminContext,
        domainType: "custom_domain",
        customHostname: "beneficios.e2e-domain.test",
      }),
    ).rejects.toBeInstanceOf(TenantDomainManagementError);

    await expect(
      requestTenantDomain({
        context: { ...adminContext, role: "manager" },
        domainType: "platform_subdomain",
        subdomainSlug: "manager-e2e",
      }),
    ).rejects.toMatchObject({ code: "forbidden" });
  });
});
