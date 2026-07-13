import { describe, expect, it } from "vitest";
import { buildQuizResult } from "@/services/quiz/results";
import { createQuizAnswersFixture } from "@/tests/fixtures";
import type { RuleCandidate, RuleEvaluation } from "@/types/quiz";

function candidate(overrides: Partial<RuleCandidate>): RuleCandidate {
  return {
    benefitSlug: "aposentadoria",
    benefitTitle: "Aposentadoria",
    priority: 10,
    score: 0,
    matched: false,
    reasons: [],
    ...overrides,
  };
}

function evaluation(topCandidate: RuleCandidate | null): RuleEvaluation {
  return {
    rulesVersion: 1,
    candidates: topCandidate ? [topCandidate] : [],
    topCandidate,
    answeredQuestionCount: 2,
  };
}

describe("Result Engine", () => {
  it("classifies high, medium and low potential by thresholds", () => {
    const high = buildQuizResult({
      answers: createQuizAnswersFixture(),
      ruleEvaluation: evaluation(candidate({ score: 70, matched: true })),
      ethicalDisclaimer: "Aviso",
    });
    const medium = buildQuizResult({
      answers: createQuizAnswersFixture(),
      ruleEvaluation: evaluation(candidate({ score: 40, matched: true })),
      ethicalDisclaimer: "Aviso",
    });
    const low = buildQuizResult({
      answers: createQuizAnswersFixture(),
      ruleEvaluation: evaluation(candidate({ score: 39, matched: true })),
      ethicalDisclaimer: "Aviso",
    });

    expect(high.classification).toBe("alto_potencial");
    expect(medium.classification).toBe("medio_potencial");
    expect(low.classification).toBe("baixo_potencial");
  });

  it("returns the main benefit, summary and disclaimer", () => {
    const result = buildQuizResult({
      answers: createQuizAnswersFixture(),
      ruleEvaluation: evaluation(
        candidate({ score: 85, matched: true, benefitTitle: "Aposentadoria" }),
      ),
      ethicalDisclaimer: "Disclaimer configurado.",
    });

    expect(result.potentialBenefit).toBe("Aposentadoria");
    expect(result.summary).toContain("Aposentadoria");
    expect(result.ethicalDisclaimer).toBe("Disclaimer configurado.");
  });

  it("handles missing candidates as low potential triage", () => {
    const result = buildQuizResult({
      answers: createQuizAnswersFixture(),
      ruleEvaluation: evaluation(null),
      ethicalDisclaimer: "Aviso",
    });

    expect(result).toMatchObject({
      potentialBenefit: null,
      score: 0,
      classification: "baixo_potencial",
    });
  });
});
