import { beforeEach, describe, expect, it, vi } from "vitest";
import { TEST_TENANT_ID } from "@/tests/fixtures";

const trackEventOnce = vi.hoisted(() => vi.fn());

vi.mock("@/services/tracking", () => ({
  trackEventOnce,
}));

describe("Result tracking helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    trackEventOnce.mockResolvedValue(true);
  });

  it("tracks ResultGenerated with the required payload shape", async () => {
    const { trackResultGeneratedOnce } =
      await import("@/services/quiz/results/resultTracking");

    await trackResultGeneratedOnce({
      tenantId: TEST_TENANT_ID,
      leadId: "lead-1",
      sessionId: "session-1",
      resultId: "result-1",
      result: {
        potentialBenefit: "Aposentadoria",
        score: 90,
        classification: "alto_potencial",
        summary: "Resumo",
        ethicalDisclaimer: "Aviso",
        candidates: [],
      },
      rulesVersion: 1,
      attribution: { utmSource: "meta" },
      context: { userAgent: "Vitest", ipAddress: "127.0.0.1" },
    });

    expect(trackEventOnce).toHaveBeenCalledWith(
      expect.objectContaining({
        leadId: "lead-1",
        tenantId: TEST_TENANT_ID,
        sessionId: "session-1",
        eventName: "ResultGenerated",
        eventPayload: {
          classification: "alto_potencial",
          potentialBenefit: "Aposentadoria",
          rulesVersion: 1,
          source: "rule_engine",
        },
      }),
    );
  });

  it("tracks ResultViewed with resultId deduplication payload", async () => {
    const { trackResultViewedOnce } =
      await import("@/services/quiz/results/resultTracking");

    await trackResultViewedOnce({
      tenantId: TEST_TENANT_ID,
      leadId: "lead-1",
      sessionId: "session-1",
      resultId: "result-1",
      classification: "alto_potencial",
      potentialBenefit: "Aposentadoria",
    });

    expect(trackEventOnce).toHaveBeenCalledWith(
      expect.objectContaining({
        eventName: "ResultViewed",
        eventPayloadContains: { resultId: "result-1" },
        eventPayload: {
          resultId: "result-1",
          classification: "alto_potencial",
          potentialBenefit: "Aposentadoria",
          source: "result_page",
        },
      }),
    );
  });
});
