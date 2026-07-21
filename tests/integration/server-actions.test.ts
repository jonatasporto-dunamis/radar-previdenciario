import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockCookies, mockHeaders } from "@/tests/helpers";
import {
  createQuizSessionFixture,
  createStoredAnswerFixture,
  TEST_TENANT_ID,
} from "@/tests/fixtures";

const completedGeneralAnswers = {
  "general-main-situation": createStoredAnswerFixture({
    questionId: "general-main-situation",
    questionLabel: "Qual é a principal situação que motivou sua busca?",
    answerValue: "maternity",
    answerLabel: "Salário-maternidade",
    benefitContext: "salario-maternidade",
  }),
  "general-inss-request": createStoredAnswerFixture({
    questionId: "general-inss-request",
    questionLabel: "Você já possui pedido no INSS relacionado a essa situação?",
    answerValue: "not_requested",
    answerLabel: "Ainda não fiz pedido",
    benefitContext: "salario-maternidade",
  }),
  "general-affiliation": createStoredAnswerFixture({
    questionId: "general-affiliation",
    questionLabel:
      "Você possui ou já possuiu contribuições, vínculo de emprego, atividade rural ou outra forma de filiação ao INSS?",
    answerValue: "yes",
    answerLabel: "Sim",
    benefitContext: "salario-maternidade",
  }),
  "general-recent-event": createStoredAnswerFixture({
    questionId: "general-recent-event",
    questionLabel:
      "Existe alguma data, evento ou mudança recente relacionada ao caso?",
    answerValue: "yes",
    answerLabel: "Sim",
    benefitContext: "salario-maternidade",
  }),
  "general-documents-available": createStoredAnswerFixture({
    questionId: "general-documents-available",
    questionLabel:
      "Há documentos ou informações que poderão ser apresentados posteriormente?",
    answerValue: "yes",
    answerLabel: "Sim",
    benefitContext: "salario-maternidade",
  }),
};

async function importQuizActionsWithMocks(options?: {
  savedAnswer?: (typeof completedGeneralAnswers)["general-documents-available"] & {
    wasChanged?: boolean;
  };
}) {
  const cookiesStore = mockCookies({ rp_lead_session: "lead-1" });
  const headersStore = mockHeaders({
    "x-forwarded-for": "127.0.0.1",
    "user-agent": "Vitest",
  });
  const session = createQuizSessionFixture({
    id: "session-1",
    lead_id: "lead-1",
  });
  const savedAnswer =
    options?.savedAnswer ??
    completedGeneralAnswers["general-documents-available"];
  const getQuizSessionForLead = vi.fn().mockResolvedValue(session);
  const saveQuizAnswer = vi.fn().mockResolvedValue(savedAnswer);
  const loadQuizAnswers = vi.fn().mockResolvedValue(completedGeneralAnswers);
  const completeQuizSession = vi.fn().mockResolvedValue(undefined);
  const getLeadAttribution = vi.fn().mockResolvedValue({ utmSource: "meta" });
  const trackEvent = vi.fn().mockResolvedValue(undefined);
  const trackEventOnce = vi.fn().mockResolvedValue(true);
  const persistQuizResult = vi.fn().mockResolvedValue({
    id: "result-1",
    session_id: "session-1",
    lead_id: "lead-1",
    classification: "alto_potencial",
  });
  const runLeadQualificationNotificationPipeline = vi
    .fn()
    .mockResolvedValue({ status: "sent", logId: "log-1" });

  vi.doMock("next/headers", () => ({
    cookies: () => Promise.resolve(cookiesStore),
    headers: () => Promise.resolve(headersStore),
  }));
  vi.doMock("@/services/tenants", () => ({
    getTenantContext: () =>
      Promise.resolve({
        tenantId: TEST_TENANT_ID,
        slug: "resende-advogados",
      }),
  }));
  vi.doMock("@/services/quiz/session", () => ({
    completeQuizSession,
    getLeadAttribution,
    getQuizSessionForLead,
    loadQuizAnswers,
    saveQuizAnswer,
  }));
  vi.doMock("@/services/tracking", () => ({
    trackEvent,
    trackEventOnce,
  }));
  vi.doMock("@/services/configuration", () => ({
    getLegalConfig: () =>
      Promise.resolve({
        disclaimer: "Esta análise possui caráter informativo.",
      }),
  }));
  vi.doMock("@/services/quiz/rules", () => ({
    evaluateQuizRules: () => ({
      rulesVersion: 1,
      templateType: "general",
      candidates: [],
      topCandidate: null,
      answeredQuestionCount: 5,
      answerCompleteness: "complete",
      missingCriticalAnswers: [],
      requiresHumanReview: false,
    }),
  }));
  vi.doMock("@/services/quiz/results", () => ({
    buildQuizResult: () => ({
      potentialBenefit: "Salário-maternidade",
      topic: "Salário-maternidade",
      templateType: "general",
      quizTemplateId: "11111111-1111-4111-8111-111111111111",
      quizTemplateVersion: 1,
      score: 70,
      classification: "alto_potencial",
      summary: "Resumo informativo.",
      ethicalDisclaimer: "Esta análise possui caráter informativo.",
      candidates: [],
      dataCompleteness: "complete",
      missingCriticalAnswers: [],
      requiresHumanReview: false,
    }),
    persistQuizResult,
    trackResultGeneratedOnce: vi.fn().mockResolvedValue(undefined),
  }));
  vi.doMock("@/services/notification/pipeline", () => ({
    runLeadQualificationNotificationPipeline,
  }));
  vi.doMock("@/services/external-tracking", () => ({
    createExternalEventId: () =>
      "rp_QuizCompleted_11111111-1111-4111-8111-111111111111",
    dispatchExternalEvent: vi.fn().mockResolvedValue(undefined),
  }));

  const actions = await import("@/app/quiz/actions");

  return {
    actions,
    completeQuizSession,
    cookiesStore,
    persistQuizResult,
    runLeadQualificationNotificationPipeline,
    trackEvent,
    trackEventOnce,
  };
}

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

  it("does not complete the quiz during last-question autosave", async () => {
    const {
      actions,
      completeQuizSession,
      persistQuizResult,
      runLeadQualificationNotificationPipeline,
      trackEventOnce,
    } = await importQuizActionsWithMocks();

    const result = await actions.saveQuizAnswerAction({
      sessionId: "session-1",
      questionId: "general-documents-available",
      value: "yes",
    });

    expect(result).toMatchObject({
      success: true,
      completed: false,
    });
    expect(persistQuizResult).not.toHaveBeenCalled();
    expect(completeQuizSession).not.toHaveBeenCalled();
    expect(trackEventOnce).not.toHaveBeenCalled();
    expect(runLeadQualificationNotificationPipeline).not.toHaveBeenCalled();
  });

  it("does not duplicate question tracking when the answer is unchanged", async () => {
    const { actions, trackEvent } = await importQuizActionsWithMocks({
      savedAnswer: {
        ...completedGeneralAnswers["general-documents-available"],
        wasChanged: false,
      },
    });

    await actions.saveQuizAnswerAction({
      sessionId: "session-1",
      questionId: "general-documents-available",
      value: "yes",
    });

    expect(trackEvent).not.toHaveBeenCalledWith(
      expect.objectContaining({
        eventName: "QuestionAnswered",
      }),
    );
  });

  it("completes the quiz only when explicitly requested", async () => {
    const {
      actions,
      completeQuizSession,
      persistQuizResult,
      runLeadQualificationNotificationPipeline,
      trackEventOnce,
    } = await importQuizActionsWithMocks();

    const result = await actions.saveQuizAnswerAction({
      sessionId: "session-1",
      questionId: "general-documents-available",
      value: "yes",
      complete: true,
    });

    expect(result).toMatchObject({
      success: true,
      completed: true,
      resultId: "result-1",
      redirectTo: "/resultado",
    });
    expect(persistQuizResult).toHaveBeenCalledOnce();
    expect(completeQuizSession).toHaveBeenCalledWith(
      TEST_TENANT_ID,
      "session-1",
    );
    expect(trackEventOnce).toHaveBeenCalledWith(
      expect.objectContaining({
        eventName: "QuizCompleted",
        leadId: "lead-1",
        sessionId: "session-1",
      }),
    );
    expect(runLeadQualificationNotificationPipeline).toHaveBeenCalledOnce();
  });

  it("records sensitive data consent and stores the HTTP-only cookie", async () => {
    const { actions, cookiesStore, trackEvent } =
      await importQuizActionsWithMocks();

    await expect(
      actions.recordSensitiveDataConsentAction({
        sessionId: "session-1",
        status: "denied",
      }),
    ).resolves.toEqual({ success: true, status: "denied" });

    expect(trackEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        eventName: "SensitiveDataConsentDenied",
        leadId: "lead-1",
        sessionId: "session-1",
        tenantId: TEST_TENANT_ID,
      }),
    );
    expect(cookiesStore.set).toHaveBeenCalledWith(
      "rp_sensitive_data_consent",
      "denied",
      expect.objectContaining({
        httpOnly: true,
        sameSite: "lax",
      }),
    );
  });
});
