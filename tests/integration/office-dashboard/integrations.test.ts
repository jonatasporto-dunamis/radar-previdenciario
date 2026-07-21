import { beforeAll, describe, expect, it } from "vitest";
import {
  getIntegrationDetail,
  listIntegrationCards,
  runIntegrationConnectionTest,
  saveIntegrationSettings,
} from "@/services/office-dashboard/integrations";
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

describe("office dashboard integrations", () => {
  beforeAll(() => {
    process.env.E2E_MOCK_SUPABASE = "true";
    process.env.TENANT_SECRETS_ENCRYPTION_KEY =
      "0000000000000000000000000000000000000000000000000000000000000000";
  });

  it("initializes default providers per tenant", async () => {
    const cards = await listIntegrationCards(adminContext);

    expect(cards.map((card) => card.provider)).toEqual([
      "meta",
      "ga4",
      "google_ads",
      "tiktok",
    ]);
    expect(cards.every((card) => card.tenantId === tenantA)).toBe(true);
  });

  it("stores secrets encrypted and never returns them in configuration", async () => {
    await saveIntegrationSettings({
      context: adminContext,
      provider: "meta",
      enabled: true,
      browserTrackingEnabled: true,
      serverTrackingEnabled: true,
      testMode: true,
      configuration: {
        pixelId: "123456789012345",
        apiVersion: "v25.0",
      },
      secrets: {
        accessToken: "meta-test-token",
      },
    });

    const beforeTest = await getIntegrationDetail({
      context: adminContext,
      provider: "meta",
    });

    expect(beforeTest.integration.hasSecrets).toBe(true);
    expect(beforeTest.integration.enabled).toBe(false);
    expect(beforeTest.integration.status).toBe("test_pending");
    expect(beforeTest.integration.configuration).not.toHaveProperty(
      "accessToken",
    );

    const testRun = await runIntegrationConnectionTest({
      context: adminContext,
      provider: "meta",
    });

    expect(testRun.status).toBe("success");

    await saveIntegrationSettings({
      context: adminContext,
      provider: "meta",
      enabled: true,
      browserTrackingEnabled: true,
      serverTrackingEnabled: true,
      testMode: true,
      configuration: {
        pixelId: "123456789012345",
        apiVersion: "v25.0",
      },
    });

    const afterTest = await getIntegrationDetail({
      context: adminContext,
      provider: "meta",
    });

    expect(afterTest.integration.enabled).toBe(true);
    expect(afterTest.integration.status).toBe("connected");
    expect(afterTest.integration.hasSecrets).toBe(true);
  });

  it("keeps integration changes isolated by tenant", async () => {
    const tenantBMeta = await getIntegrationDetail({
      context: tenantBContext,
      provider: "meta",
    });

    expect(tenantBMeta.integration.tenantId).toBe(tenantB);
    expect(tenantBMeta.integration.enabled).toBe(false);
    expect(tenantBMeta.integration.hasSecrets).toBe(false);
  });
});
