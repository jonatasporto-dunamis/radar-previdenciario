import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockSupabase } from "@/tests/mocks/supabase";
import { TEST_TENANT_ID } from "@/tests/fixtures";

describe("tracking service", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("persists event payload and attribution without PII expansion", async () => {
    const supabaseMock = mockSupabase();
    supabaseMock.setQueryResult({ data: [], error: null });
    vi.doMock("@/lib/supabase/admin", () => ({
      createSupabaseAdminClient: () => supabaseMock.client,
    }));
    const { trackEvent } = await import("@/services/tracking");

    await trackEvent({
      tenantId: TEST_TENANT_ID,
      leadId: "lead-1",
      sessionId: "session-1",
      eventName: "ResultGenerated",
      eventPayload: {
        source: "rule_engine",
        classification: "alto_potencial",
        potentialBenefit: "Aposentadoria",
        rulesVersion: 1,
      },
      attribution: {
        utmSource: "meta",
        campaignId: "123",
      },
      userAgent: "Vitest",
      ipAddress: "127.0.0.1",
    });

    expect(supabaseMock.from).toHaveBeenCalledWith("tracking_events");
    expect(supabaseMock.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        lead_id: "lead-1",
        session_id: "session-1",
        event_name: "ResultGenerated",
        utm_source: "meta",
        campaign_id: "123",
        user_agent: "Vitest",
        ip_address: "127.0.0.1",
      }),
    );
  });

  it("deduplicates events before inserting", async () => {
    const supabaseMock = mockSupabase();
    vi.doMock("@/lib/supabase/admin", () => ({
      createSupabaseAdminClient: () => supabaseMock.client,
    }));
    const { trackEventOnce } = await import("@/services/tracking");
    supabaseMock.maybeSingle.mockResolvedValueOnce({
      data: { id: "event-1" },
      error: null,
    });

    await expect(
      trackEventOnce({
        leadId: "lead-1",
        tenantId: TEST_TENANT_ID,
        sessionId: "session-1",
        eventName: "ResultViewed",
        eventPayloadContains: { resultId: "result-1" },
      }),
    ).resolves.toBe(false);

    expect(supabaseMock.contains).toHaveBeenCalledWith("event_payload", {
      resultId: "result-1",
    });
    expect(supabaseMock.insert).not.toHaveBeenCalled();
  });

  it("inserts when no previous event exists", async () => {
    const supabaseMock = mockSupabase();
    supabaseMock.setQueryResult({ data: [], error: null });
    vi.doMock("@/lib/supabase/admin", () => ({
      createSupabaseAdminClient: () => supabaseMock.client,
    }));
    const { trackEventOnce } = await import("@/services/tracking");
    supabaseMock.maybeSingle.mockResolvedValueOnce({
      data: null,
      error: null,
    });

    await expect(
      trackEventOnce({
        leadId: "lead-1",
        tenantId: TEST_TENANT_ID,
        eventName: "ResultGenerated",
        eventPayload: { source: "rule_engine" },
      }),
    ).resolves.toBe(true);

    expect(supabaseMock.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        event_name: "ResultGenerated",
      }),
    );
  });

  it("throws a typed error when insert fails", async () => {
    const supabaseMock = mockSupabase();
    supabaseMock.setQueryResult({ data: null, error: { message: "failure" } });
    vi.doMock("@/lib/supabase/admin", () => ({
      createSupabaseAdminClient: () => supabaseMock.client,
    }));
    const { trackEvent, TrackingServiceError } =
      await import("@/services/tracking");

    await expect(
      trackEvent({
        tenantId: TEST_TENANT_ID,
        eventName: "ResultGenerated",
      }),
    ).rejects.toBeInstanceOf(TrackingServiceError);
  });

  it("throws a typed error when lookup fails", async () => {
    const supabaseMock = mockSupabase();
    vi.doMock("@/lib/supabase/admin", () => ({
      createSupabaseAdminClient: () => supabaseMock.client,
    }));
    const { trackEventOnce, TrackingServiceError } =
      await import("@/services/tracking");
    supabaseMock.maybeSingle.mockResolvedValueOnce({
      data: null,
      error: { message: "failure" },
    });

    await expect(
      trackEventOnce({
        tenantId: TEST_TENANT_ID,
        eventName: "ResultViewed",
      }),
    ).rejects.toBeInstanceOf(TrackingServiceError);
  });

  it("finds a persisted external event id for browser/server deduplication", async () => {
    const supabaseMock = mockSupabase();
    vi.doMock("@/lib/supabase/admin", () => ({
      createSupabaseAdminClient: () => supabaseMock.client,
    }));
    const { findExternalTrackingEventId } = await import("@/services/tracking");
    supabaseMock.maybeSingle.mockResolvedValueOnce({
      data: {
        event_payload: {
          resultId: "result-1",
          external_event_id:
            "rp_QualifiedLead_11111111-1111-4111-8111-111111111111",
        },
      },
      error: null,
    });

    await expect(
      findExternalTrackingEventId({
        tenantId: TEST_TENANT_ID,
        leadId: "lead-1",
        sessionId: "session-1",
        eventName: "QualifiedLead",
        eventPayloadContains: {
          resultId: "result-1",
        },
      }),
    ).resolves.toBe("rp_QualifiedLead_11111111-1111-4111-8111-111111111111");

    expect(supabaseMock.contains).toHaveBeenCalledWith("event_payload", {
      resultId: "result-1",
    });
  });
});
