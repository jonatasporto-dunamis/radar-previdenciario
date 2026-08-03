import { beforeAll, describe, expect, it } from "vitest";
import { defaultTenantBrandingSettings } from "@/lib/branding";
import {
  getTenantBranding,
  saveTenantBranding,
} from "@/services/office-dashboard/branding";
import type { OfficeUserContext } from "@/types/office-dashboard";

const tenantA = "00000000-0000-4000-8000-000000000001";
const tenantB = "00000000-0000-4000-8000-000000000002";
const context: OfficeUserContext = {
  userId: "00000000-0000-4000-8000-000000000906",
  email: "admin-b@example.com",
  tenantId: tenantB,
  tenantSlug: "tenant-b",
  tenantName: "Tenant B",
  tenantStatus: "active",
  membershipId: "00000000-0000-4000-8000-000000000916",
  role: "admin",
  displayName: "Admin B",
};

describe("tenant branding management", () => {
  beforeAll(() => {
    process.env.E2E_MOCK_SUPABASE = "true";
  });

  it("publishes settings only for the selected tenant", async () => {
    const tenantABefore = await getTenantBranding({
      ...context,
      tenantId: tenantA,
    });
    await saveTenantBranding(context, {
      ...defaultTenantBrandingSettings,
      displayName: "Tenant B Personalizado",
      legalName: "Tenant B Sociedade",
      whatsappNumber: "5524999991234",
    });

    const tenantBAfter = await getTenantBranding(context);
    const tenantAAfter = await getTenantBranding({
      ...context,
      tenantId: tenantA,
    });
    expect(tenantBAfter.displayName).toBe("Tenant B Personalizado");
    expect(tenantBAfter.settings.whatsappNumber).toBe("5524999991234");
    expect(tenantAAfter.displayName).toBe(tenantABefore.displayName);
    expect(tenantAAfter.settings).toEqual(tenantABefore.settings);
  });

  it("blocks agents even when called below the route layer", async () => {
    await expect(
      saveTenantBranding(
        { ...context, role: "agent" },
        {
          ...defaultTenantBrandingSettings,
          displayName: "Não autorizado",
          legalName: "Não autorizado",
        },
      ),
    ).rejects.toThrow(/Sem permissão/);
  });
});
