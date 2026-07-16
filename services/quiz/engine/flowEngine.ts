import { defaultFlow, defaultQuestions } from "@/config/quiz";
import type {
  FlowDefinition,
  QuestionDefinition,
  QuizTemplateDefinition,
} from "@/types/quiz";
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

export function getFlowForTemplate(
  template: QuizTemplateDefinition,
): FlowDefinition {
  return {
    id: template.id,
    slug: template.slug,
    benefit: template.type,
    steps: template.questions
      .filter((question) => question.active)
      .sort((a, b) => a.order - b.order)
      .map((question) => question.id),
    version: template.version,
    active: template.status === "active",
  };
}

export function getQuestionsForTemplate(
  template: QuizTemplateDefinition,
): QuestionDefinition[] {
  return getQuestionsForFlow(getFlowForTemplate(template), template.questions);
}
