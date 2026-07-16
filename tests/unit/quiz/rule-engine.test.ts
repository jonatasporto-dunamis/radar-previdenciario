import { describe, expect, it } from "vitest";
import { evaluateQuizRules } from "@/services/quiz/rules";
import { createStoredAnswerFixture } from "@/tests/fixtures";
import type { BenefitDefinition, BenefitRuleDefinition } from "@/types/quiz";

const benefits: BenefitDefinition[] = [
  {
    id: "benefit-a",
    slug: "benefit-a",
    title: "Benefício A",
    description: "A",
    priority: 20,
    active: true,
    icon: "a",
    color: "primary",
  },
  {
    id: "benefit-b",
    slug: "benefit-b",
    title: "Benefício B",
    description: "B",
    priority: 10,
    active: true,
    icon: "b",
    color: "secondary",
  },
];

describe("Rule Engine", () => {
  it("evaluates equals, not_equals, includes, min, max and exists operators", () => {
    const answers = {
      topics: createStoredAnswerFixture({
        questionId: "topics",
        answerValue: ["aposentadoria", "rural"],
      }),
      work: createStoredAnswerFixture({
        questionId: "work",
        answerValue: "clt",
      }),
      years: createStoredAnswerFixture({
        questionId: "years",
        answerValue: "20",
      }),
      details: createStoredAnswerFixture({
        questionId: "details",
        answerValue: "contexto",
      }),
    };
    const rules: BenefitRuleDefinition[] = [
      {
        benefitSlug: "benefit-a",
        active: true,
        conditions: [
          {
            questionId: "topics",
            operator: "includes",
            value: "aposentadoria",
            score: 20,
            reason: "contains",
          },
          {
            questionId: "work",
            operator: "equals",
            value: "clt",
            score: 20,
            reason: "equals",
          },
          {
            questionId: "work",
            operator: "not_equals",
            value: "sem_atividade",
            score: 20,
            reason: "not_equals",
          },
          {
            questionId: "years",
            operator: "min",
            value: 15,
            score: 20,
            reason: "greater than or equal threshold",
          },
          {
            questionId: "years",
            operator: "max",
            value: 25,
            score: 20,
            reason: "less than or equal threshold",
          },
          {
            questionId: "details",
            operator: "exists",
            score: 20,
            reason: "is not empty",
          },
        ],
      },
    ];

    const evaluation = evaluateQuizRules(answers, rules, benefits, 3);

    expect(evaluation.rulesVersion).toBe(3);
    expect(evaluation.topCandidate?.score).toBe(100);
    expect(evaluation.topCandidate?.reasons).toHaveLength(6);
  });

  it("sorts tied candidates by configured priority and remains deterministic", () => {
    const answers = {
      work: createStoredAnswerFixture({
        questionId: "work",
        answerValue: "sim",
      }),
    };
    const rules: BenefitRuleDefinition[] = [
      {
        benefitSlug: "benefit-a",
        active: true,
        conditions: [
          {
            questionId: "work",
            operator: "equals",
            value: "sim",
            score: 50,
            reason: "match",
          },
        ],
      },
      {
        benefitSlug: "benefit-b",
        active: true,
        conditions: [
          {
            questionId: "work",
            operator: "equals",
            value: "sim",
            score: 50,
            reason: "match",
          },
        ],
      },
    ];

    const first = evaluateQuizRules(answers, rules, benefits);
    const second = evaluateQuizRules(answers, rules, benefits);

    expect(first.topCandidate?.benefitSlug).toBe("benefit-b");
    expect(second).toEqual(first);
  });

  it("ignores inactive rules and non-matching conditions", () => {
    const evaluation = evaluateQuizRules(
      {
        empty: createStoredAnswerFixture({
          questionId: "empty",
          answerValue: "",
        }),
      },
      [
        {
          benefitSlug: "benefit-a",
          active: false,
          conditions: [
            {
              questionId: "empty",
              operator: "exists",
              score: 100,
              reason: "inactive",
            },
          ],
        },
        {
          benefitSlug: "benefit-b",
          active: true,
          conditions: [
            {
              questionId: "empty",
              operator: "exists",
              score: 100,
              reason: "empty",
            },
          ],
        },
      ],
      benefits,
    );

    expect(evaluation.topCandidate).toBeNull();
    expect(evaluation.candidates).toHaveLength(1);
    expect(evaluation.candidates[0].matched).toBe(false);
  });

  it("keeps invalid numeric and unsupported operators deterministic", () => {
    const evaluation = evaluateQuizRules(
      {
        years: createStoredAnswerFixture({
          questionId: "years",
          answerValue: "abc",
        }),
        topics: createStoredAnswerFixture({
          questionId: "topics",
          answerValue: "aposentadoria",
        }),
      },
      [
        {
          benefitSlug: "benefit-a",
          active: true,
          conditions: [
            {
              questionId: "years",
              operator: "min",
              value: 15,
              score: 50,
              reason: "invalid number",
            },
            {
              questionId: "topics",
              operator: "includes",
              value: "aposentadoria",
              score: 50,
              reason: "not array",
            },
            {
              questionId: "topics",
              operator: "greater_than" as never,
              value: 1,
              score: 50,
              reason: "unsupported",
            },
          ],
        },
      ],
      benefits,
    );

    expect(evaluation.topCandidate).toBeNull();
    expect(evaluation.candidates[0].score).toBe(0);
  });

  it("does not score unknown or withheld answers and requires human review", () => {
    const rules: BenefitRuleDefinition[] = [
      {
        benefitSlug: "benefit-a",
        active: true,
        conditions: [
          {
            questionId: "primary-interest",
            operator: "includes",
            value: "aposentadoria",
            score: 50,
            reason: "Tema informado",
          },
          {
            questionId: "contribution-years",
            operator: "min",
            value: 15,
            score: 50,
            reason: "Tempo informado",
          },
        ],
      },
    ];

    const evaluation = evaluateQuizRules(
      {
        "primary-interest": createStoredAnswerFixture({
          questionId: "primary-interest",
          answerValue: "unknown",
          answerLabel: "Não sei informar",
        }),
        "contribution-years": createStoredAnswerFixture({
          questionId: "contribution-years",
          answerValue: "withheld",
          answerLabel: "Prefiro não informar",
        }),
      },
      rules,
      benefits,
    );

    expect(evaluation.topCandidate).toBeNull();
    expect(evaluation.candidates[0].score).toBe(0);
    expect(evaluation.requiresHumanReview).toBe(true);
    expect(evaluation.missingCriticalAnswers).toEqual(
      expect.arrayContaining(["primary-interest", "contribution-years"]),
    );
  });
});
