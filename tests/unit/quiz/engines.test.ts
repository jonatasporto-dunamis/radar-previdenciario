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
  createQuizSessionFixture,
  createStoredAnswerFixture,
  questionFixtures,
} from "@/tests/fixtures";
import {
  generalQuizTemplate,
  maternityQuizTemplate,
} from "@/config/quiz/templates/default";
import { selectReusableQuizSession } from "@/services/quiz/session/sessionEngine";

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

  it("reuses completed template sessions when no started session exists", () => {
    const completedMaternity = createQuizSessionFixture({
      id: "completed-maternity",
      status: "completed",
      quiz_template_id: maternityQuizTemplate.id,
      quiz_template_version: maternityQuizTemplate.version,
      template_type: maternityQuizTemplate.type,
      completed_at: "2026-07-12T12:30:00.000Z",
    });
    const startedMaternity = createQuizSessionFixture({
      id: "started-maternity",
      status: "started",
      quiz_template_id: maternityQuizTemplate.id,
      quiz_template_version: maternityQuizTemplate.version,
      template_type: maternityQuizTemplate.type,
    });
    const legacyCompletedGeneral = createQuizSessionFixture({
      id: "legacy-general",
      status: "completed",
      quiz_template_id: null,
      quiz_template_version: null,
      template_type: null,
      completed_at: "2026-07-12T12:10:00.000Z",
    });

    expect(
      selectReusableQuizSession([completedMaternity], maternityQuizTemplate)
        ?.id,
    ).toBe("completed-maternity");
    expect(
      selectReusableQuizSession(
        [completedMaternity, startedMaternity],
        maternityQuizTemplate,
      )?.id,
    ).toBe("started-maternity");
    expect(
      selectReusableQuizSession([legacyCompletedGeneral], generalQuizTemplate)
        ?.id,
    ).toBe("legacy-general");
  });
});
