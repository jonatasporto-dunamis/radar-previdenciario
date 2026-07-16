import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockCookies, mockHeaders } from "@/tests/helpers";
import { TEST_TENANT_ID } from "@/tests/fixtures";

describe("server actions", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("creates a lead and sets the HTTP-only session cookie", async () => {
    const cookiesStore = mockCookies();
    const headersStore = mockHeaders({
      "x-forwarded-for": "127.0.0.1",
      "user-agent": "Vitest",
    });
    const createLead = vi.fn().mockResolvedValue({
      id: "lead-1",
      reused: false,
    });
    const trackEvent = vi.fn().mockResolvedValue(undefined);
    const dispatchExternalEvent = vi.fn().mockResolvedValue(undefined);
    vi.doMock("next/headers", () => ({
      cookies: () => Promise.resolve(cookiesStore),
      headers: () => Promise.resolve(headersStore),
    }));
    vi.doMock("@/services/leads", () => ({ createLead }));
    vi.doMock("@/services/tracking", () => ({ trackEvent }));
    vi.doMock("@/services/tenants", () => ({
      getTenantContext: () =>
        Promise.resolve({
          tenantId: TEST_TENANT_ID,
          slug: "resende-advogados",
        }),
    }));
    vi.doMock("@/services/external-tracking", () => ({
      createExternalEventId: () =>
        "rp_LeadSubmitted_11111111-1111-4111-8111-111111111111",
      dispatchExternalEvent,
    }));
    const { createLeadAction } = await import("@/app/cadastro/actions");

    const result = await createLeadAction({
      fullName: "Maria Previdencia",
      email: "maria@example.com",
      phone: "(71) 98153-3737",
      termsAcknowledgement: true,
      contactConsent: true,
      marketingConsent: false,
      website: "",
      attribution: {
        utmSource: "meta",
      },
    });

    expect(result).toEqual({
      success: true,
      leadId: "lead-1",
      externalEventId: "rp_LeadSubmitted_11111111-1111-4111-8111-111111111111",
    });
    expect(trackEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        leadId: "lead-1",
        tenantId: TEST_TENANT_ID,
        eventName: "LeadSubmitted",
        eventPayload: expect.objectContaining({
          external_event_id:
            "rp_LeadSubmitted_11111111-1111-4111-8111-111111111111",
        }),
      }),
    );
    expect(trackEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        eventName: "TermsAcknowledged",
      }),
    );
    expect(trackEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        eventName: "ContactConsentGranted",
      }),
    );
    expect(trackEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        eventName: "MarketingConsentDenied",
      }),
    );
    expect(dispatchExternalEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        event: expect.objectContaining({
          eventId: "rp_LeadSubmitted_11111111-1111-4111-8111-111111111111",
          tenantId: TEST_TENANT_ID,
        }),
      }),
    );
    expect(cookiesStore.set).toHaveBeenCalledWith(
      "rp_lead_session",
      "lead-1",
      expect.objectContaining({
        httpOnly: true,
        sameSite: "lax",
      }),
    );
  });

  it("rejects invalid lead registration without calling services", async () => {
    const createLead = vi.fn();
    vi.doMock("@/services/leads", () => ({ createLead }));
    const { createLeadAction } = await import("@/app/cadastro/actions");

    const result = await createLeadAction({
      fullName: "Maria",
      email: "invalid",
      phone: "123",
      termsAcknowledgement: false,
      contactConsent: false,
      marketingConsent: false,
      website: "",
    });

    expect(result.success).toBe(false);
    expect(createLead).not.toHaveBeenCalled();
  });

  it("tracks ResultViewed once through the resultado action", async () => {
    const cookiesStore = mockCookies({ rp_lead_session: "lead-1" });
    const headersStore = mockHeaders({
      "x-forwarded-for": "127.0.0.1",
      "user-agent": "Vitest",
    });
    const getQuizResultForLead = vi.fn().mockResolvedValue({
      id: "result-1",
      session_id: "session-1",
      lead_id: "lead-1",
      classification: "alto_potencial",
      potential_benefit: "Aposentadoria",
    });
    const trackResultViewedOnce = vi.fn().mockResolvedValue(true);
    const getLeadAttribution = vi.fn().mockResolvedValue({
      utmSource: "meta",
    });
    vi.doMock("next/headers", () => ({
      cookies: () => Promise.resolve(cookiesStore),
      headers: () => Promise.resolve(headersStore),
    }));
    vi.doMock("@/services/quiz/results", () => ({
      getQuizResultForLead,
      trackResultViewedOnce,
    }));
    vi.doMock("@/services/quiz/session", () => ({
      getLeadAttribution,
    }));
    vi.doMock("@/services/tenants", () => ({
      getTenantContext: () =>
        Promise.resolve({
          tenantId: TEST_TENANT_ID,
          slug: "resende-advogados",
        }),
    }));
    vi.doMock("@/services/external-tracking", () => ({
      createExternalEventId: () =>
        "rp_ResultViewed_11111111-1111-4111-8111-111111111111",
    }));
    const { trackResultViewedAction } = await import("@/app/resultado/actions");

    await expect(trackResultViewedAction("result-1")).resolves.toEqual({
      success: true,
      externalEventId: "rp_ResultViewed_11111111-1111-4111-8111-111111111111",
    });

    expect(trackResultViewedOnce).toHaveBeenCalledWith(
      expect.objectContaining({
        leadId: "lead-1",
        tenantId: TEST_TENANT_ID,
        sessionId: "session-1",
        resultId: "result-1",
        classification: "alto_potencial",
        externalEventId: "rp_ResultViewed_11111111-1111-4111-8111-111111111111",
      }),
    );
    expect(cookiesStore.set).toHaveBeenCalledWith(
      "rp_result_viewed_result-1",
      "1",
      expect.objectContaining({ httpOnly: true }),
    );
  });
});
