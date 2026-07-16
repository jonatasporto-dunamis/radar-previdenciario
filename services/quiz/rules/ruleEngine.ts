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
  QuestionDefinition,
  RuleCandidate,
  RuleConditionDefinition,
  RuleEvaluation,
  QuizTemplateType,
} from "@/types/quiz";
import { getAnswerState } from "@/utils/quiz-answer-state";
import { getQuestionsForFlow } from "../engine/flowEngine";

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
  if (getAnswerState(answerValue) !== "answered") {
    return false;
  }

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

function getMissingCriticalAnswers(
  answers: QuizAnswerMap,
  questions: QuestionDefinition[],
): string[] {
  return questions
    .filter((question) => question.required)
    .filter((question) => {
      const answer = answers[question.id];

      if (!answer) {
        return true;
      }

      const state = getAnswerState(answer.answerValue);

      return state === "unknown" || state === "withheld";
    })
    .map((question) => question.id);
}

function getAnswerCompleteness(missingCriticalAnswers: string[]) {
  if (missingCriticalAnswers.length === 0) {
    return "complete" as const;
  }

  if (missingCriticalAnswers.length <= 2) {
    return "partial" as const;
  }

  return "insufficient" as const;
}

export function evaluateQuizRules(
  answers: QuizAnswerMap,
  rules: BenefitRuleDefinition[] = defaultBenefitRules,
  benefits: BenefitDefinition[] = defaultBenefits,
  rulesVersion = defaultBenefitRulesVersion,
  questions: QuestionDefinition[] = getQuestionsForFlow(),
  templateType?: QuizTemplateType,
): RuleEvaluation {
  const missingCriticalAnswers = getMissingCriticalAnswers(answers, questions);
  const answerCompleteness = getAnswerCompleteness(missingCriticalAnswers);
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
    templateType,
    candidates,
    topCandidate,
    answeredQuestionCount: Object.keys(answers).length,
    answerCompleteness,
    missingCriticalAnswers,
    requiresHumanReview: missingCriticalAnswers.length > 0,
  };
}
