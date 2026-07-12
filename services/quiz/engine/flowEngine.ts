import { defaultFlow, defaultQuestions } from "@/config/quiz";
import type { FlowDefinition, QuestionDefinition } from "@/types/quiz";
import { getActiveQuestions } from "./questionEngine";

export function getDefaultQuizFlow(): FlowDefinition {
  return defaultFlow;
}

export function getQuestionsForFlow(
  flow: FlowDefinition = defaultFlow,
  questions: QuestionDefinition[] = defaultQuestions,
): QuestionDefinition[] {
  const questionsById = new Map(
    getActiveQuestions(questions).map((question) => [question.id, question]),
  );

  return flow.steps
    .map((questionId) => questionsById.get(questionId))
    .filter((question): question is QuestionDefinition => Boolean(question));
}
