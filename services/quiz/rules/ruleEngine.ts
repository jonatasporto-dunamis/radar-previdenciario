import {
  defaultBenefitRules,
  defaultBenefitRulesVersion,
  defaultBenefits,
} from "@/config/quiz";
import type {
  BenefitDefinition,
  BenefitRuleDefinition,
  QuestionAnswerPrimitive,
  QuestionAnswerValue,
  QuizAnswerMap,
  RuleCandidate,
  RuleConditionDefinition,
  RuleEvaluation,
} from "@/types/quiz";

function normalizeNumber(value: QuestionAnswerValue): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string") {
    const normalized = Number(value.replace(",", "."));

    return Number.isFinite(normalized) ? normalized : null;
  }

  return null;
}

function isMeaningfulValue(value: QuestionAnswerValue): boolean {
  if (Array.isArray(value)) {
    return value.length > 0;
  }

  return value !== null && value !== undefined && value !== "";
}

function valuesMatch(
  answerValue: QuestionAnswerValue,
  conditionValue: QuestionAnswerPrimitive | undefined,
): boolean {
  if (Array.isArray(answerValue)) {
    return answerValue.includes(String(conditionValue));
  }

  return answerValue === conditionValue;
}

function conditionMatches(
  answerValue: QuestionAnswerValue,
  condition: RuleConditionDefinition,
): boolean {
  if (condition.operator === "exists") {
    return isMeaningfulValue(answerValue);
  }

  if (condition.operator === "includes") {
    if (!Array.isArray(answerValue) || condition.value === undefined) {
      return false;
    }

    return answerValue.includes(String(condition.value));
  }

  if (condition.operator === "equals") {
    return valuesMatch(answerValue, condition.value);
  }

  if (condition.operator === "not_equals") {
    return (
      isMeaningfulValue(answerValue) &&
      !valuesMatch(answerValue, condition.value)
    );
  }

  if (condition.operator === "min" || condition.operator === "max") {
    const answerNumber = normalizeNumber(answerValue);
    const conditionNumber = Number(condition.value);

    if (!Number.isFinite(conditionNumber) || answerNumber === null) {
      return false;
    }

    return condition.operator === "min"
      ? answerNumber >= conditionNumber
      : answerNumber <= conditionNumber;
  }

  return false;
}

function sortCandidates(a: RuleCandidate, b: RuleCandidate): number {
  if (b.score !== a.score) {
    return b.score - a.score;
  }

  return a.priority - b.priority;
}

export function evaluateQuizRules(
  answers: QuizAnswerMap,
  rules: BenefitRuleDefinition[] = defaultBenefitRules,
  benefits: BenefitDefinition[] = defaultBenefits,
  rulesVersion = defaultBenefitRulesVersion,
): RuleEvaluation {
  const benefitsBySlug = new Map(
    benefits
      .filter((benefit) => benefit.active)
      .map((benefit) => [benefit.slug, benefit]),
  );

  const candidates = rules
    .filter((rule) => rule.active)
    .map<RuleCandidate>((rule) => {
      const benefit = benefitsBySlug.get(rule.benefitSlug);
      const reasons = rule.conditions
        .filter((condition) => {
          const answer = answers[condition.questionId];

          return answer
            ? conditionMatches(answer.answerValue, condition)
            : false;
        })
        .map((condition) => ({
          questionId: condition.questionId,
          reason: condition.reason,
          score: condition.score,
        }));
      const score = Math.min(
        100,
        reasons.reduce((total, reason) => total + reason.score, 0),
      );

      return {
        benefitSlug: rule.benefitSlug,
        benefitTitle: benefit?.title ?? rule.benefitSlug,
        priority: benefit?.priority ?? 999,
        score,
        matched: score > 0,
        reasons,
      };
    })
    .sort(sortCandidates);

  const topCandidate =
    candidates.find((candidate) => candidate.matched) ?? null;

  return {
    rulesVersion,
    candidates,
    topCandidate,
    answeredQuestionCount: Object.keys(answers).length,
  };
}
