import { describe, expect, it } from "vitest";
import {
  getDefaultQuizFlow,
  getQuestionsForFlow,
  getActiveQuestions,
  getQuestionById,
  getVisibleQuestions,
  hasQuestionAnswer,
  isQuestionVisible,
} from "@/services/quiz/engine";
import {
  getQuizNavigationState,
  getResumeQuestionId,
} from "@/services/quiz/navigation";
import { calculateQuizProgress } from "@/services/quiz/progress";
import {
  createQuizAnswersFixture,
  createStoredAnswerFixture,
  questionFixtures,
} from "@/tests/fixtures";

describe("Question, Navigation and Progress Engines", () => {
  it("loads default flow and resolves active questions for a flow", () => {
    const flow = getDefaultQuizFlow();
    const questions = getQuestionsForFlow(
      {
        ...flow,
        steps: ["inactive", "interest", "missing", "age"],
      },
      questionFixtures,
    );

    expect(flow.slug).toBe("triagem-previdenciaria-inicial");
    expect(questions.map((question) => question.id)).toEqual([
      "interest",
      "age",
    ]);
  });

  it("sorts active questions and resolves questions by id", () => {
    const active = getActiveQuestions(questionFixtures);

    expect(active.map((question) => question.id)).toEqual([
      "interest",
      "age",
      "details",
    ]);
    expect(getQuestionById(active, "age")?.title).toBe("Idade");
    expect(getQuestionById(active, "missing")).toBeNull();
  });

  it("evaluates visibleWhen and answer presence", () => {
    const answers = createQuizAnswersFixture();
    const hiddenQuestion = {
      ...questionFixtures[2],
      visibleWhen: [
        {
          questionId: "interest",
          operator: "includes" as const,
          value: "incapacidade",
        },
      ],
    };

    expect(isQuestionVisible(questionFixtures[2], answers)).toBe(true);
    expect(isQuestionVisible(hiddenQuestion, answers)).toBe(false);
    expect(getVisibleQuestions(questionFixtures, answers)).toHaveLength(3);
    expect(hasQuestionAnswer(questionFixtures[0], answers)).toBe(true);
    expect(
      isQuestionVisible(
        {
          ...questionFixtures[2],
          visibleWhen: [
            { questionId: "age", operator: "equals", value: "55" },
            { questionId: "missing", operator: "not_equals", value: "x" },
            { questionId: "age", operator: "exists" },
          ],
        },
        answers,
      ),
    ).toBe(true);
    expect(
      hasQuestionAnswer(questionFixtures[2], {
        details: createStoredAnswerFixture({
          questionId: "details",
          answerValue: "",
        }),
      }),
    ).toBe(false);
  });

  it("calculates next, previous and resume points", () => {
    const partialAnswers = {
      interest: createStoredAnswerFixture(),
    };
    const navigation = getQuizNavigationState(
      questionFixtures,
      partialAnswers,
      "age",
    );

    expect(navigation).toMatchObject({
      currentQuestionId: "age",
      previousQuestionId: "interest",
      nextQuestionId: "details",
      isFirstQuestion: false,
      isLastQuestion: false,
    });
    expect(getResumeQuestionId(questionFixtures, partialAnswers)).toBe("age");
    expect(
      getResumeQuestionId(questionFixtures, createQuizAnswersFixture()),
    ).toBe("details");
    expect(
      getQuizNavigationState(questionFixtures, {}, "missing"),
    ).toMatchObject({
      currentQuestionId: "interest",
      previousQuestionId: null,
      isFirstQuestion: true,
    });
  });

  it("calculates real progress from required answered questions", () => {
    const progress = calculateQuizProgress(
      questionFixtures.filter((question) => question.active),
      createQuizAnswersFixture(),
      "age",
    );

    expect(progress).toMatchObject({
      totalQuestions: 3,
      totalRequiredQuestions: 2,
      answeredQuestions: 2,
      answeredRequiredQuestions: 2,
      currentQuestionIndex: 2,
      percent: 100,
      isComplete: true,
    });
    expect(
      calculateQuizProgress(
        questionFixtures.map((question) => ({ ...question, required: false })),
        {},
        "interest",
      ),
    ).toMatchObject({
      percent: 100,
      isComplete: false,
    });
  });
});
