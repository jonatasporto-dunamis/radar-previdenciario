import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import {
  getIntegrationDetail,
  listIntegrationCards,
  runIntegrationConnectionTest,
  saveIntegrationSettings,
} from "@/services/office-dashboard/integrations";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getTenantIntegrationSecret } from "@/services/integrations/secrets";
import type { OfficeUserContext } from "@/types/office-dashboard";

const sendMetaConversionsEvent = vi.hoisted(() => vi.fn());

vi.mock("@/services/external-tracking/providers/meta/server", async () => {
  const actual = await vi.importActual<
    typeof import("@/services/external-tracking/providers/meta/server")
  >("@/services/external-tracking/providers/meta/server");

  return {
    ...actual,
    sendMetaConversionsEvent,
  };
});

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

  beforeEach(() => {
    vi.clearAllMocks();
    sendMetaConversionsEvent.mockResolvedValue({
      ok: true,
      responseStatus: 200,
      eventsReceived: 1,
      providerEventId: "fbtrace-test",
    });
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

  it("saves Meta server-side config without test event code as test pending", async () => {
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
        accessToken: "meta-token-without-test-code",
        testEventCode: "",
      },
    });

    const saved = await getIntegrationDetail({
      context: adminContext,
      provider: "meta",
    });

    expect(saved.integration.hasSecrets).toBe(true);
    expect(saved.integration.hasAccessToken).toBe(true);
    expect(saved.integration.hasTestEventCode).toBe(false);
    expect(saved.integration.enabled).toBe(false);
    expect(saved.integration.status).toBe("test_pending");
    expect(saved.integration.configuration).not.toHaveProperty("accessToken");
    await expect(
      getTenantIntegrationSecret({
        tenantId: tenantA,
        provider: "meta",
        secretKey: "accessToken",
      }),
    ).resolves.toBe("meta-token-without-test-code");
    await expect(
      getTenantIntegrationSecret({
        tenantId: tenantA,
        provider: "meta",
        secretKey: "testEventCode",
      }),
    ).resolves.toBeNull();

    const testRun = await runIntegrationConnectionTest({
      context: adminContext,
      provider: "meta",
    });
    const afterTest = await getIntegrationDetail({
      context: adminContext,
      provider: "meta",
    });

    expect(testRun.status).toBe("configuration_required");
    expect(testRun.sanitizedResult).toMatchObject({
      secrets: {
        source: "tenant_integration_secrets",
        accessTokenKey: "accessToken",
        testEventCodeKey: "testEventCode",
        hasAccessToken: true,
        hasTestEventCode: false,
      },
    });
    expect(afterTest.integration.status).toBe("test_pending");
    expect(afterTest.integration.lastErrorCode).toBe("missing_test_event_code");
    expect(sendMetaConversionsEvent).not.toHaveBeenCalled();
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
        testEventCode: "TEST123",
      },
    });

    const beforeTest = await getIntegrationDetail({
      context: adminContext,
      provider: "meta",
    });

    expect(beforeTest.integration.hasSecrets).toBe(true);
    expect(beforeTest.integration.hasAccessToken).toBe(true);
    expect(beforeTest.integration.hasTestEventCode).toBe(true);
    expect(beforeTest.integration.enabled).toBe(false);
    expect(beforeTest.integration.status).toBe("test_pending");
    expect(beforeTest.integration.configuration).not.toHaveProperty(
      "accessToken",
    );
    await expect(
      getTenantIntegrationSecret({
        tenantId: tenantA,
        provider: "meta",
        secretKey: "accessToken",
      }),
    ).resolves.toBe("meta-test-token");

    const testRun = await runIntegrationConnectionTest({
      context: adminContext,
      provider: "meta",
    });

    expect(testRun.status).toBe("success");
    expect(testRun.sanitizedResult).toMatchObject({
      requestShape: {
        hasData: true,
        eventCount: 1,
        hasRootTestEventCode: true,
        testEventCodeField: "test_event_code",
        pixelConfigured: true,
        tokenConfigured: true,
        apiVersion: "v25.0",
      },
      secrets: {
        source: "tenant_integration_secrets",
        hasAccessToken: true,
        hasTestEventCode: true,
      },
    });
    expect(sendMetaConversionsEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        accessToken: "meta-test-token",
        payload: expect.objectContaining({
          test_event_code: "TEST123",
        }),
      }),
    );

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
    expect(afterTest.integration.hasAccessToken).toBe(true);
    expect(afterTest.integration.hasTestEventCode).toBe(true);

    const supabase = createSupabaseAdminClient();
    const { data: trackingConfig } = await supabase
      .from("tenant_tracking_configs")
      .select("enabled, external_tracking_dry_run, meta_enabled, meta_pixel_id")
      .eq("tenant_id", tenantA)
      .maybeSingle();

    expect(trackingConfig).toMatchObject({
      enabled: true,
      external_tracking_dry_run: false,
      meta_enabled: true,
      meta_pixel_id: "123456789012345",
    });
  });

  it("keeps previous Meta secret when token fields are empty", async () => {
    await saveIntegrationSettings({
      context: adminContext,
      provider: "meta",
      enabled: false,
      browserTrackingEnabled: true,
      serverTrackingEnabled: true,
      testMode: true,
      configuration: {
        pixelId: "123456789012345",
        apiVersion: "v25.0",
      },
      secrets: {
        accessToken: "preserved-token",
        testEventCode: "TEST123",
      },
    });

    await saveIntegrationSettings({
      context: adminContext,
      provider: "meta",
      enabled: false,
      browserTrackingEnabled: true,
      serverTrackingEnabled: true,
      testMode: true,
      configuration: {
        pixelId: "123456789012345",
        apiVersion: "v25.0",
      },
      secrets: {
        accessToken: "",
        testEventCode: "",
      },
    });

    await expect(
      getTenantIntegrationSecret({
        tenantId: tenantA,
        provider: "meta",
        secretKey: "accessToken",
      }),
    ).resolves.toBe("preserved-token");

    await saveIntegrationSettings({
      context: adminContext,
      provider: "meta",
      enabled: false,
      browserTrackingEnabled: true,
      serverTrackingEnabled: true,
      testMode: true,
      configuration: {
        pixelId: "123456789012345",
        apiVersion: "v25.0",
      },
      secrets: {
        accessToken: "",
        testEventCode: "NEWTEST123",
      },
    });

    await expect(
      getTenantIntegrationSecret({
        tenantId: tenantA,
        provider: "meta",
        secretKey: "accessToken",
      }),
    ).resolves.toBe("preserved-token");
    await expect(
      getTenantIntegrationSecret({
        tenantId: tenantA,
        provider: "meta",
        secretKey: "testEventCode",
      }),
    ).resolves.toBe("NEWTEST123");

    await saveIntegrationSettings({
      context: adminContext,
      provider: "meta",
      enabled: false,
      browserTrackingEnabled: true,
      serverTrackingEnabled: true,
      testMode: true,
      configuration: {
        pixelId: "123456789012345",
        apiVersion: "v25.0",
      },
      secrets: {
        accessToken: "new-token",
        testEventCode: "",
      },
    });

    await expect(
      getTenantIntegrationSecret({
        tenantId: tenantA,
        provider: "meta",
        secretKey: "accessToken",
      }),
    ).resolves.toBe("new-token");
    await expect(
      getTenantIntegrationSecret({
        tenantId: tenantA,
        provider: "meta",
        secretKey: "testEventCode",
      }),
    ).resolves.toBe("NEWTEST123");
  });

  it("keeps integration changes isolated by tenant", async () => {
    const tenantBMeta = await getIntegrationDetail({
      context: tenantBContext,
      provider: "meta",
    });

    expect(tenantBMeta.integration.tenantId).toBe(tenantB);
    expect(tenantBMeta.integration.enabled).toBe(false);
    expect(tenantBMeta.integration.hasSecrets).toBe(false);
    expect(tenantBMeta.integration.hasAccessToken).toBe(false);
    expect(tenantBMeta.integration.hasTestEventCode).toBe(false);
  });
});
