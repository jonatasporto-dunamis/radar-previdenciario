import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockSupabase } from "@/tests/mocks/supabase";
import { TEST_TENANT_ID } from "@/tests/fixtures";

describe("result persistence", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("upserts quiz results by session_id", async () => {
    const supabaseMock = mockSupabase();
    vi.doMock("@/lib/supabase/admin", () => ({
      createSupabaseAdminClient: () => supabaseMock.client,
    }));
    const { persistQuizResult } = await import("@/services/quiz/results");
    supabaseMock.single.mockResolvedValueOnce({
      data: {
        id: "result-1",
        tenant_id: TEST_TENANT_ID,
        session_id: "session-1",
        lead_id: "lead-1",
        potential_benefit: "Aposentadoria",
        score: 90,
        classification: "alto_potencial",
        summary: "Resumo",
        ethical_disclaimer: "Aviso",
        created_at: "2026-07-12T12:00:00Z",
      },
      error: null,
    });

    await expect(
      persistQuizResult({
        tenantId: TEST_TENANT_ID,
        leadId: "lead-1",
        sessionId: "session-1",
        result: {
          potentialBenefit: "Aposentadoria",
          score: 90,
          classification: "alto_potencial",
          summary: "Resumo",
          ethicalDisclaimer: "Aviso",
          candidates: [],
        },
      }),
    ).resolves.toMatchObject({
      id: "result-1",
      classification: "alto_potencial",
    });

    expect(supabaseMock.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        session_id: "session-1",
        tenant_id: TEST_TENANT_ID,
        lead_id: "lead-1",
        score: 90,
      }),
      { onConflict: "session_id" },
    );
  });

  it("loads the latest result for a lead", async () => {
    const supabaseMock = mockSupabase();
    vi.doMock("@/lib/supabase/admin", () => ({
      createSupabaseAdminClient: () => supabaseMock.client,
    }));
    const { getLatestQuizResultForLead } =
      await import("@/services/quiz/results");
    supabaseMock.maybeSingle.mockResolvedValueOnce({
      data: { id: "result-1" },
      error: null,
    });

    await expect(
      getLatestQuizResultForLead(TEST_TENANT_ID, "lead-1"),
    ).resolves.toEqual({
      id: "result-1",
    });

    expect(supabaseMock.eq).toHaveBeenCalledWith("tenant_id", TEST_TENANT_ID);
    expect(supabaseMock.eq).toHaveBeenCalledWith("lead_id", "lead-1");
    expect(supabaseMock.order).toHaveBeenCalledWith("created_at", {
      ascending: false,
    });
  });

  it("loads a specific result for a lead", async () => {
    const supabaseMock = mockSupabase();
    vi.doMock("@/lib/supabase/admin", () => ({
      createSupabaseAdminClient: () => supabaseMock.client,
    }));
    const { getQuizResultForLead } = await import("@/services/quiz/results");
    supabaseMock.maybeSingle.mockResolvedValueOnce({
      data: { id: "result-1", lead_id: "lead-1" },
      error: null,
    });

    await expect(
      getQuizResultForLead({
        tenantId: TEST_TENANT_ID,
        leadId: "lead-1",
        resultId: "result-1",
      }),
    ).resolves.toEqual({
      id: "result-1",
      lead_id: "lead-1",
    });

    expect(supabaseMock.eq).toHaveBeenCalledWith("tenant_id", TEST_TENANT_ID);
    expect(supabaseMock.eq).toHaveBeenCalledWith("id", "result-1");
    expect(supabaseMock.eq).toHaveBeenCalledWith("lead_id", "lead-1");
  });

  it("throws when persistence or loading fails", async () => {
    const supabaseMock = mockSupabase();
    vi.doMock("@/lib/supabase/admin", () => ({
      createSupabaseAdminClient: () => supabaseMock.client,
    }));
    const {
      getLatestQuizResultForLead,
      persistQuizResult,
      QuizResultPersistenceError,
    } = await import("@/services/quiz/results");
    supabaseMock.single.mockResolvedValueOnce({
      data: null,
      error: { message: "failure" },
    });

    await expect(
      persistQuizResult({
        tenantId: TEST_TENANT_ID,
        leadId: "lead-1",
        sessionId: "session-1",
        result: {
          potentialBenefit: null,
          score: 0,
          classification: "baixo_potencial",
          summary: "Resumo",
          ethicalDisclaimer: "Aviso",
          candidates: [],
        },
      }),
    ).rejects.toBeInstanceOf(QuizResultPersistenceError);

    supabaseMock.maybeSingle.mockResolvedValueOnce({
      data: null,
      error: { message: "failure" },
    });

    await expect(
      getLatestQuizResultForLead(TEST_TENANT_ID, "lead-1"),
    ).rejects.toBeInstanceOf(QuizResultPersistenceError);
  });
});
