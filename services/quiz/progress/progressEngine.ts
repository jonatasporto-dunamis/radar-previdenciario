import type {
  QuestionDefinition,
  QuizAnswerMap,
  QuizProgress,
} from "@/types/quiz";
import { hasQuestionAnswer } from "../engine/questionEngine";

export function calculateQuizProgress(
  questions: QuestionDefinition[],
  answers: QuizAnswerMap,
  currentQuestionId: string,
): QuizProgress {
  const requiredQuestions = questions.filter((question) => question.required);
  const answeredQuestions = questions.filter((question) =>
    hasQuestionAnswer(question, answers),
  );
  const answeredRequiredQuestions = requiredQuestions.filter((question) =>
    hasQuestionAnswer(question, answers),
  );
  const currentIndex = Math.max(
    questions.findIndex((question) => question.id === currentQuestionId),
    0,
  );
  const totalRequiredQuestions = requiredQuestions.length;
  const percent =
    totalRequiredQuestions === 0
      ? 100
      : Math.round(
          (answeredRequiredQuestions.length / totalRequiredQuestions) * 100,
        );

  return {
    totalQuestions: questions.length,
    totalRequiredQuestions,
    answeredQuestions: answeredQuestions.length,
    answeredRequiredQuestions: answeredRequiredQuestions.length,
    currentQuestionIndex: currentIndex + 1,
    percent,
    isComplete:
      totalRequiredQuestions > 0 &&
      answeredRequiredQuestions.length === totalRequiredQuestions,
  };
}
