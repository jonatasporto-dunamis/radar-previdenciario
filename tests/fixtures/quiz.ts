import type {
  QuizAnswer,
  QuizResult,
  QuizSession,
  TrackingEvent,
} from "@/types/database";
import type {
  QuestionDefinition,
  QuizAnswerMap,
  QuizStoredAnswer,
} from "@/types/quiz";

const createdAt = "2026-07-12T12:00:00.000Z";

export const questionFixtures: QuestionDefinition[] = [
  {
    id: "interest",
    slug: "interest",
    version: 1,
    title: "Interesse",
    type: "checkbox",
    required: true,
    options: [
      { value: "aposentadoria", label: "Aposentadoria" },
      { value: "incapacidade", label: "Incapacidade" },
    ],
    validations: { minSelections: 1 },
    benefits: ["aposentadoria", "incapacidade"],
    next: "age",
    active: true,
    order: 20,
  },
  {
    id: "age",
    slug: "age",
    version: 1,
    title: "Idade",
    type: "number",
    required: true,
    validations: { min: 0, max: 120 },
    benefits: ["aposentadoria"],
    previous: "interest",
    next: "details",
    active: true,
    order: 30,
  },
  {
    id: "details",
    slug: "details",
    version: 1,
    title: "Detalhes",
    type: "textarea",
    required: false,
    benefits: ["aposentadoria"],
    previous: "age",
    visibleWhen: [
      {
        questionId: "interest",
        operator: "includes",
        value: "aposentadoria",
      },
    ],
    active: true,
    order: 40,
  },
  {
    id: "inactive",
    slug: "inactive",
    version: 1,
    title: "Inativa",
    type: "text",
    required: false,
    benefits: [],
    active: false,
    order: 10,
  },
];

export function createStoredAnswerFixture(
  overrides: Partial<QuizStoredAnswer> = {},
): QuizStoredAnswer {
  return {
    questionId: "interest",
    questionLabel: "Interesse",
    answerValue: ["aposentadoria"],
    answerLabel: "Aposentadoria",
    benefitContext: "aposentadoria",
    createdAt,
    ...overrides,
  };
}

export function createQuizAnswersFixture(): QuizAnswerMap {
  return {
    interest: createStoredAnswerFixture(),
    age: createStoredAnswerFixture({
      questionId: "age",
      questionLabel: "Idade",
      answerValue: "55",
      answerLabel: "55",
      benefitContext: "aposentadoria",
      createdAt: "2026-07-12T12:01:00.000Z",
    }),
  };
}

export function createQuizSessionFixture(
  overrides: Partial<QuizSession> = {},
): QuizSession {
  return {
    id: "session-fixture-001",
    lead_id: "lead-fixture-001",
    status: "started",
    started_at: createdAt,
    completed_at: null,
    created_at: createdAt,
    updated_at: createdAt,
    ...overrides,
  };
}

export function createQuizAnswerRowFixture(
  overrides: Partial<QuizAnswer> = {},
): QuizAnswer {
  return {
    id: "answer-fixture-001",
    session_id: "session-fixture-001",
    lead_id: "lead-fixture-001",
    question_id: "interest",
    question_label: "Interesse",
    answer_value: '["aposentadoria"]',
    answer_label: "Aposentadoria",
    benefit_context: "aposentadoria",
    created_at: createdAt,
    ...overrides,
  };
}

export function createResultFixture(
  overrides: Partial<QuizResult> = {},
): QuizResult {
  return {
    id: "result-fixture-001",
    session_id: "session-fixture-001",
    lead_id: "lead-fixture-001",
    potential_benefit: "Aposentadoria",
    score: 90,
    classification: "alto_potencial",
    summary: "Resultado preliminar de teste.",
    ethical_disclaimer:
      "Esta análise possui caráter exclusivamente informativo.",
    created_at: createdAt,
    ...overrides,
  };
}

export function createTrackingFixture(
  overrides: Partial<TrackingEvent> = {},
): TrackingEvent {
  return {
    id: "tracking-fixture-001",
    lead_id: "lead-fixture-001",
    session_id: "session-fixture-001",
    event_name: "ResultGenerated",
    event_payload: {
      source: "rule_engine",
      classification: "alto_potencial",
      potentialBenefit: "Aposentadoria",
      rulesVersion: 1,
    },
    utm_source: "meta",
    utm_medium: "paid_social",
    utm_campaign: "teste_bpc",
    utm_content: "criativo_01",
    utm_term: null,
    fbclid: null,
    gclid: null,
    campaign_id: "123",
    adset_id: "456",
    ad_id: "789",
    placement: "instagram_stories",
    site_source_name: null,
    referrer: "https://example.com/origem",
    landing_page: "https://radar.test/cadastro",
    user_agent: "Vitest",
    ip_address: "127.0.0.1",
    created_at: createdAt,
    ...overrides,
  };
}
