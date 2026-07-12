"use server";

import { cookies, headers } from "next/headers";
import { getQuestionsForFlow } from "@/services/quiz/engine";
import { getQuizNavigationState } from "@/services/quiz/navigation";
import { calculateQuizProgress } from "@/services/quiz/progress";
import {
  completeQuizSession,
  getLeadAttribution,
  getQuizSessionForLead,
  loadQuizAnswers,
  saveQuizAnswer,
} from "@/services/quiz/session";
import { trackEvent } from "@/services/tracking";
import type {
  QuestionAnswerValue,
  QuizAnswerMap,
  QuizNavigationState,
  QuizProgress,
  QuizStoredAnswer,
} from "@/types/quiz";
import { validateQuestionAnswer } from "@/lib/validations/quiz";

const LEAD_SESSION_COOKIE = "rp_lead_session";
const QUIZ_SESSION_COOKIE = "rp_quiz_session";
const GENERIC_QUIZ_ERROR =
  "Não foi possível salvar sua resposta agora. Tente novamente.";

export type SaveQuizAnswerActionResult =
  | {
      success: true;
      answer: QuizStoredAnswer;
      answers: QuizAnswerMap;
      progress: QuizProgress;
      navigation: QuizNavigationState;
      completed: boolean;
    }
  | {
      success: false;
      error: string;
    };

function getFirstForwardedIp(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const [firstIp] = value.split(",");
  const ip = firstIp?.trim();

  return ip || null;
}

function normalizeActionAnswerValue(value: unknown): QuestionAnswerValue {
  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }

  return null;
}

async function getLeadIdFromCookie(): Promise<string | null> {
  const cookieStore = await cookies();

  return cookieStore.get(LEAD_SESSION_COOKIE)?.value ?? null;
}

async function getRequestContext() {
  const requestHeaders = await headers();

  return {
    ipAddress:
      getFirstForwardedIp(requestHeaders.get("x-forwarded-for")) ??
      requestHeaders.get("x-real-ip"),
    userAgent: requestHeaders.get("user-agent")?.slice(0, 1000) ?? null,
  };
}

async function setQuizSessionCookie(sessionId: string) {
  const cookieStore = await cookies();

  cookieStore.set(QUIZ_SESSION_COOKIE, sessionId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 2,
  });
}

export async function persistQuizSessionCookieAction(
  sessionId: string,
): Promise<{ success: true } | { success: false }> {
  const leadId = await getLeadIdFromCookie();

  if (!leadId) {
    return { success: false };
  }

  const session = await getQuizSessionForLead(leadId, sessionId);

  if (!session) {
    return { success: false };
  }

  await setQuizSessionCookie(session.id);

  return { success: true };
}

export async function saveQuizAnswerAction(input: {
  sessionId: string;
  questionId: string;
  value: unknown;
}): Promise<SaveQuizAnswerActionResult> {
  const leadId = await getLeadIdFromCookie();

  if (!leadId) {
    return {
      success: false,
      error: GENERIC_QUIZ_ERROR,
    };
  }

  const session = await getQuizSessionForLead(leadId, input.sessionId);

  if (!session || session.status !== "started") {
    return {
      success: false,
      error: GENERIC_QUIZ_ERROR,
    };
  }

  const questions = getQuestionsForFlow();
  const question = questions.find((item) => item.id === input.questionId);

  if (!question) {
    return {
      success: false,
      error: GENERIC_QUIZ_ERROR,
    };
  }

  const validation = validateQuestionAnswer(
    question,
    normalizeActionAnswerValue(input.value),
  );

  if (!validation.success) {
    return {
      success: false,
      error: validation.error,
    };
  }

  try {
    const context = await getRequestContext();
    const answer = await saveQuizAnswer({
      leadId,
      sessionId: session.id,
      question,
      value: validation.value,
    });
    const answers = await loadQuizAnswers(session.id, questions);
    const navigation = getQuizNavigationState(questions, answers, question.id);
    const progress = calculateQuizProgress(
      questions,
      answers,
      navigation.currentQuestionId,
    );
    const attribution = await getLeadAttribution(leadId);

    try {
      await trackEvent({
        leadId,
        sessionId: session.id,
        eventName: "QuestionAnswered",
        eventPayload: {
          source: "quiz",
          questionId: question.id,
          questionSlug: question.slug,
          questionType: question.type,
          questionVersion: question.version,
        },
        attribution,
        userAgent: context.userAgent,
        ipAddress: context.ipAddress,
      });
    } catch {
      console.error("Failed to track question answered event.");
    }

    const shouldComplete = progress.isComplete && navigation.isLastQuestion;

    if (shouldComplete) {
      await completeQuizSession(session.id);

      try {
        await trackEvent({
          leadId,
          sessionId: session.id,
          eventName: "QuizCompleted",
          eventPayload: {
            source: "quiz",
            answeredRequiredQuestions: progress.answeredRequiredQuestions,
            totalRequiredQuestions: progress.totalRequiredQuestions,
          },
          attribution,
          userAgent: context.userAgent,
          ipAddress: context.ipAddress,
        });
      } catch {
        console.error("Failed to track quiz completed event.");
      }
    }

    await setQuizSessionCookie(session.id);

    return {
      success: true,
      answer,
      answers,
      progress,
      navigation,
      completed: shouldComplete,
    };
  } catch {
    console.error("Failed to save quiz answer.");

    return {
      success: false,
      error: GENERIC_QUIZ_ERROR,
    };
  }
}
