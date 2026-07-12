import type {
  QuestionDefinition,
  QuizAnswerMap,
  QuizNavigationState,
} from "@/types/quiz";
import { getVisibleQuestions } from "../engine/questionEngine";

export function getResumeQuestionId(
  questions: QuestionDefinition[],
  answers: QuizAnswerMap,
): string {
  const visibleQuestions = getVisibleQuestions(questions, answers);
  const firstUnansweredQuestion = visibleQuestions.find(
    (question) => !answers[question.id],
  );

  if (firstUnansweredQuestion) {
    return firstUnansweredQuestion.id;
  }

  const latestAnswer = Object.values(answers).sort((a, b) =>
    String(b.createdAt ?? "").localeCompare(String(a.createdAt ?? "")),
  )[0];

  return latestAnswer?.questionId ?? visibleQuestions[0]?.id ?? questions[0].id;
}

export function getQuizNavigationState(
  questions: QuestionDefinition[],
  answers: QuizAnswerMap,
  currentQuestionId: string,
): QuizNavigationState {
  const visibleQuestions = getVisibleQuestions(questions, answers);
  const currentIndex = Math.max(
    visibleQuestions.findIndex((question) => question.id === currentQuestionId),
    0,
  );
  const currentQuestion =
    visibleQuestions[currentIndex] ?? visibleQuestions[0] ?? questions[0];

  return {
    currentQuestionId: currentQuestion.id,
    previousQuestionId: visibleQuestions[currentIndex - 1]?.id ?? null,
    nextQuestionId: visibleQuestions[currentIndex + 1]?.id ?? null,
    isFirstQuestion: currentIndex === 0,
    isLastQuestion: currentIndex === visibleQuestions.length - 1,
  };
}
