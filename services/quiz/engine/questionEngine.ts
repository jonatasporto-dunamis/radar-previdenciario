import type {
  QuestionAnswerValue,
  QuestionDefinition,
  QuestionVisibilityCondition,
  QuizAnswerMap,
} from "@/types/quiz";

function hasAnswerValue(value: QuestionAnswerValue | undefined): boolean {
  if (Array.isArray(value)) {
    return value.length > 0;
  }

  return value !== null && value !== undefined && value !== "";
}

function evaluateVisibilityCondition(
  condition: QuestionVisibilityCondition,
  answers: QuizAnswerMap,
): boolean {
  const answer = answers[condition.questionId]?.answerValue;

  if (condition.operator === "exists") {
    return hasAnswerValue(answer);
  }

  if (condition.operator === "includes") {
    return Array.isArray(answer) && answer.includes(String(condition.value));
  }

  if (condition.operator === "equals") {
    return answer === condition.value;
  }

  if (condition.operator === "not_equals") {
    return answer !== condition.value;
  }

  return true;
}

export function getActiveQuestions(
  questions: QuestionDefinition[],
): QuestionDefinition[] {
  return questions
    .filter((question) => question.active)
    .sort((a, b) => a.order - b.order);
}

export function getQuestionById(
  questions: QuestionDefinition[],
  questionId: string,
): QuestionDefinition | null {
  return questions.find((question) => question.id === questionId) ?? null;
}

export function isQuestionVisible(
  question: QuestionDefinition,
  answers: QuizAnswerMap,
): boolean {
  if (!question.visibleWhen?.length) {
    return true;
  }

  return question.visibleWhen.every((condition) =>
    evaluateVisibilityCondition(condition, answers),
  );
}

export function getVisibleQuestions(
  questions: QuestionDefinition[],
  answers: QuizAnswerMap,
): QuestionDefinition[] {
  return getActiveQuestions(questions).filter((question) =>
    isQuestionVisible(question, answers),
  );
}

export function hasQuestionAnswer(
  question: QuestionDefinition,
  answers: QuizAnswerMap,
): boolean {
  return hasAnswerValue(answers[question.id]?.answerValue);
}
