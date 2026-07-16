"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, Save } from "lucide-react";
import {
  persistQuizSessionCookieAction,
  saveQuizAnswerAction,
} from "@/app/quiz/actions";
import { ExternalEventBridge } from "@/components/tracking/ExternalEventBridge";
import { useTrackingConfig } from "@/components/tracking/TrackingProvider";
import { Button } from "@/components/ui/button";
import { dispatchBrowserExternalEvent } from "@/lib/tracking";
import { cn } from "@/lib/utils";
import { getVisibleQuestions } from "@/services/quiz/engine/questionEngine";
import { getQuizNavigationState } from "@/services/quiz/navigation/navigationEngine";
import { calculateQuizProgress } from "@/services/quiz/progress/progressEngine";
import type {
  QuestionAnswerValue,
  QuestionDefinition,
  QuizAnswerMap,
  QuizProgress,
} from "@/types/quiz";
import { QuestionRenderer } from "../renderer";

type QuizExperienceProps = {
  sessionId: string;
  flowTitle: string;
  questions: QuestionDefinition[];
  initialAnswers: QuizAnswerMap;
  initialQuestionId: string;
  initialProgress: QuizProgress;
  disclaimer: string;
  sensitiveDisclaimer?: string;
  quizStartedExternalEventId?: string;
};

function isEmptyAnswer(value: QuestionAnswerValue): boolean {
  if (Array.isArray(value)) {
    return value.length === 0;
  }

  return value === null || value === undefined || value === "";
}

function fingerprint(value: QuestionAnswerValue): string {
  return JSON.stringify(value ?? null);
}

function getInitialValues(answers: QuizAnswerMap) {
  return Object.values(answers).reduce<Record<string, QuestionAnswerValue>>(
    (acc, answer) => {
      acc[answer.questionId] = answer.answerValue;

      return acc;
    },
    {},
  );
}

function getInitialFingerprints(answers: QuizAnswerMap) {
  return Object.values(answers).reduce<Record<string, string>>(
    (acc, answer) => {
      acc[answer.questionId] = fingerprint(answer.answerValue);

      return acc;
    },
    {},
  );
}

export function QuizExperience({
  sessionId,
  flowTitle,
  questions,
  initialAnswers,
  initialQuestionId,
  initialProgress,
  disclaimer,
  sensitiveDisclaimer,
  quizStartedExternalEventId,
}: QuizExperienceProps) {
  const router = useRouter();
  const trackingConfig = useTrackingConfig();
  const [answers, setAnswers] = useState<QuizAnswerMap>(initialAnswers);
  const [values, setValues] = useState(getInitialValues(initialAnswers));
  const [savedFingerprints, setSavedFingerprints] = useState(
    getInitialFingerprints(initialAnswers),
  );
  const [currentQuestionId, setCurrentQuestionId] = useState(initialQuestionId);
  const [progress, setProgress] = useState(initialProgress);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">(
    "idle",
  );
  const [completed, setCompleted] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    void persistQuizSessionCookieAction(sessionId);
  }, [sessionId]);

  const visibleQuestions = useMemo(
    () => getVisibleQuestions(questions, answers),
    [answers, questions],
  );
  const navigation = useMemo(
    () => getQuizNavigationState(visibleQuestions, answers, currentQuestionId),
    [answers, currentQuestionId, visibleQuestions],
  );
  const currentQuestion =
    visibleQuestions.find(
      (question) => question.id === navigation.currentQuestionId,
    ) ??
    visibleQuestions[0] ??
    questions[0];
  const currentValue = values[currentQuestion.id] ?? null;

  useEffect(() => {
    setProgress(
      calculateQuizProgress(visibleQuestions, answers, currentQuestionId),
    );
  }, [answers, currentQuestionId, visibleQuestions]);

  function updateCurrentValue(value: QuestionAnswerValue) {
    setValues((current) => ({
      ...current,
      [currentQuestion.id]: value,
    }));
    setFieldError(null);
  }

  function saveAnswer(
    question: QuestionDefinition,
    value: QuestionAnswerValue,
    options: { force?: boolean; moveTo?: string | null } = {},
  ) {
    const nextFingerprint = fingerprint(value);
    const alreadySaved = savedFingerprints[question.id] === nextFingerprint;

    if (!options.force && alreadySaved && answers[question.id]) {
      if (options.moveTo) {
        setCurrentQuestionId(options.moveTo);
      }

      return;
    }

    if (!options.force && !question.required && isEmptyAnswer(value)) {
      if (options.moveTo) {
        setCurrentQuestionId(options.moveTo);
      }

      return;
    }

    setSaveState("saving");

    startTransition(async () => {
      const result = await saveQuizAnswerAction({
        sessionId,
        questionId: question.id,
        value,
      });

      if (!result.success) {
        setFieldError(result.error);
        setSaveState("idle");
        return;
      }

      setAnswers(result.answers);
      setSavedFingerprints((current) => ({
        ...current,
        [question.id]: fingerprint(result.answer.answerValue),
      }));
      setProgress(result.progress);
      setSaveState("saved");

      if (result.completed) {
        if (result.externalEventId) {
          dispatchBrowserExternalEvent({
            config: trackingConfig,
            eventName: "QuizCompleted",
            eventId: result.externalEventId,
            sessionId,
            resultId: result.resultId,
            metadata: {
              source: "quiz",
            },
            scope: sessionId,
          });
        }

        router.replace(result.redirectTo ?? "/resultado");
        setCompleted(true);
        return;
      }

      if (options.moveTo) {
        setCurrentQuestionId(options.moveTo);
        return;
      }

      const refreshedProgress = calculateQuizProgress(
        visibleQuestions,
        result.answers,
        currentQuestionId,
      );
      setProgress(refreshedProgress);
    });
  }

  function handlePrevious() {
    if (navigation.previousQuestionId) {
      setCurrentQuestionId(navigation.previousQuestionId);
      setFieldError(null);
    }
  }

  function handleNext() {
    const target = navigation.nextQuestionId;

    saveAnswer(currentQuestion, currentValue, {
      force: navigation.isLastQuestion,
      moveTo: target,
    });
  }

  if (completed) {
    return (
      <div className="bg-card shadow-card mt-10 rounded-xl border p-6">
        <div className="bg-success text-success-foreground mb-6 inline-flex size-12 items-center justify-center rounded-lg">
          <CheckCircle2 aria-hidden="true" className="size-6" />
        </div>
        <h1 className="text-foreground text-2xl font-semibold">
          Resultado em preparação
        </h1>
        <p className="text-muted-foreground mt-3 leading-7">
          Suas respostas foram registradas. Você será redirecionado para o
          resultado informativo.
        </p>
        <p className="text-muted-foreground mt-6 text-sm leading-6">
          {disclaimer}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card shadow-card mt-10 rounded-xl border p-6">
      {quizStartedExternalEventId ? (
        <ExternalEventBridge
          events={[
            {
              eventName: "QuizStarted",
              eventId: quizStartedExternalEventId,
              sessionId,
              metadata: {
                source: "quiz",
              },
            },
          ]}
        />
      ) : null}
      <div className="mb-8">
        <div className="mb-3 flex items-center justify-between gap-4 text-sm">
          <span className="text-muted-foreground">
            {flowTitle} · Pergunta {progress.currentQuestionIndex} de{" "}
            {progress.totalQuestions}
          </span>
          <span className="text-foreground font-medium">
            {progress.percent}%
          </span>
        </div>
        <div
          aria-label="Progresso real do questionário"
          aria-valuemax={100}
          aria-valuemin={0}
          aria-valuenow={progress.percent}
          className="bg-muted h-2 overflow-hidden rounded-full"
          role="progressbar"
        >
          <div
            className="bg-secondary h-full rounded-full transition-all"
            style={{ width: `${progress.percent}%` }}
          />
        </div>
      </div>

      <div className="mb-8">
        <p className="text-secondary text-sm font-medium">
          {currentQuestion.required ? "Obrigatória" : "Opcional"}
        </p>
        <h1 className="text-foreground mt-2 text-2xl font-semibold">
          {currentQuestion.title}
        </h1>
        {currentQuestion.description ? (
          <p className="text-muted-foreground mt-3 leading-7">
            {currentQuestion.description}
          </p>
        ) : null}
        {currentQuestion.metadata?.sensitive && sensitiveDisclaimer ? (
          <p className="bg-muted text-muted-foreground mt-4 rounded-lg p-4 text-sm leading-6">
            {sensitiveDisclaimer}
          </p>
        ) : null}
      </div>

      <QuestionRenderer
        disabled={isPending}
        error={fieldError}
        onChange={updateCurrentValue}
        onCommit={(value) => saveAnswer(currentQuestion, value)}
        question={currentQuestion}
        value={currentValue}
      />

      {fieldError ? (
        <p className="text-danger mt-3 text-sm" role="alert">
          {fieldError}
        </p>
      ) : null}

      <div className="mt-8 flex flex-col gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
        <Button
          disabled={isPending || navigation.isFirstQuestion}
          onClick={handlePrevious}
          type="button"
          variant="outline"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Anterior
        </Button>

        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <Save
            aria-hidden="true"
            className={cn("size-4", saveState === "saving" && "animate-pulse")}
          />
          {saveState === "saving"
            ? "Salvando..."
            : saveState === "saved"
              ? "Resposta salva"
              : "Salvamento automático"}
        </div>

        <Button disabled={isPending} onClick={handleNext} type="button">
          {navigation.isLastQuestion ? "Finalizar" : "Próximo"}
          <ArrowRight aria-hidden="true" className="size-4" />
        </Button>
      </div>

      <p className="text-muted-foreground mt-6 text-sm leading-6">
        {disclaimer}
      </p>
    </div>
  );
}
