import { beforeEach, describe, expect, it, vi } from "vitest";
import { TEST_TENANT_B_ID, TEST_TENANT_ID } from "@/tests/fixtures";
import { mockSupabase } from "@/tests/mocks/supabase";
import { computeNotificationPayloadHash } from "@/services/notification/pipeline/payload";

describe("multi-tenant data isolation", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("scopes lead deduplication by tenant", async () => {
    const tenantA = mockSupabase();
    tenantA.maybeSingle.mockResolvedValueOnce({ data: null, error: null });
    tenantA.single.mockResolvedValueOnce({
      data: { id: "lead-a" },
      error: null,
    });
    vi.doMock("@/lib/supabase/admin", () => ({
      createSupabaseAdminClient: () => tenantA.client,
    }));
    const { createLead } = await import("@/services/leads");

    await createLead({
      tenantId: TEST_TENANT_ID,
      fullName: "Lead A",
      email: "lead-a@example.com",
      phone: "5571981533737",
      status: "new",
    });

    expect(tenantA.eq).toHaveBeenCalledWith("tenant_id", TEST_TENANT_ID);
    expect(tenantA.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        tenant_id: TEST_TENANT_ID,
        phone: "5571981533737",
      }),
    );

    vi.resetModules();
    const tenantB = mockSupabase();
    tenantB.maybeSingle.mockResolvedValueOnce({ data: null, error: null });
    tenantB.single.mockResolvedValueOnce({
      data: { id: "lead-b" },
      error: null,
    });
    vi.doMock("@/lib/supabase/admin", () => ({
      createSupabaseAdminClient: () => tenantB.client,
    }));
    const { createLead: createLeadForTenantB } =
      await import("@/services/leads");

    await createLeadForTenantB({
      tenantId: TEST_TENANT_B_ID,
      fullName: "Lead B",
      email: "lead-b@example.com",
      phone: "5571981533737",
      status: "new",
    });

    expect(tenantB.eq).toHaveBeenCalledWith("tenant_id", TEST_TENANT_B_ID);
    expect(tenantB.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        tenant_id: TEST_TENANT_B_ID,
        phone: "5571981533737",
      }),
    );
  });

  it("keeps notification idempotency hashes tenant-specific", () => {
    const base = {
      provider: "email" as const,
      recipient: "office@example.com",
      leadId: "lead-1",
      resultId: "result-1",
      template: "lead-qualified",
    };

    expect(
      computeNotificationPayloadHash({
        ...base,
        tenantId: TEST_TENANT_ID,
      }),
    ).not.toBe(
      computeNotificationPayloadHash({
        ...base,
        tenantId: TEST_TENANT_B_ID,
      }),
    );
  });

  it("scopes external delivery lookup by tenant", async () => {
    const supabaseMock = mockSupabase();
    vi.doMock("@/lib/supabase/admin", () => ({
      createSupabaseAdminClient: () => supabaseMock.client,
    }));
    const { findDeliveryByEvent } =
      await import("@/services/external-tracking/persistence");
    supabaseMock.maybeSingle.mockResolvedValueOnce({
      data: null,
      error: null,
    });

    await findDeliveryByEvent({
      tenantId: TEST_TENANT_ID,
      eventId: "rp_LeadSubmitted_11111111-1111-4111-8111-111111111111",
      provider: "meta_capi",
      channel: "server",
    });

    expect(supabaseMock.eq).toHaveBeenCalledWith("tenant_id", TEST_TENANT_ID);
  });
});
