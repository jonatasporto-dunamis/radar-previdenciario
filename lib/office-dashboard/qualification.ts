import type {
  InternalClassification,
  OfficeQuizAnswer,
  OfficeQuizResult,
} from "@/types/office-dashboard";

export function isInternalClassification(
  value: unknown,
): value is InternalClassification {
  return (
    value === "alto_potencial" ||
    value === "medio_potencial" ||
    value === "baixo_potencial"
  );
}

export function getQuizAnswerState(
  answerValue: string | null | undefined,
  answerLabel: string | null | undefined,
): OfficeQuizAnswer["answerState"] {
  const normalized = `${answerValue ?? ""} ${answerLabel ?? ""}`
    .trim()
    .toLowerCase();

  if (!normalized) {
    return "not_applicable";
  }

  if (
    normalized.includes("withheld") ||
    normalized.includes("prefiro não") ||
    normalized.includes("prefiro nao")
  ) {
    return "withheld";
  }

  if (
    normalized.includes("unknown") ||
    normalized.includes("não sei") ||
    normalized.includes("nao sei")
  ) {
    return "unknown";
  }

  return "answered";
}

export function requiresHumanReview(input: {
  result: OfficeQuizResult | null;
  answers: OfficeQuizAnswer[];
}): boolean {
  return (
    !input.result ||
    input.result.classification === "baixo_potencial" ||
    input.answers.some((answer) =>
      ["unknown", "withheld", "not_applicable"].includes(answer.answerState),
    )
  );
}

export function getMissingCriticalAnswers(
  answers: OfficeQuizAnswer[],
): string[] {
  return answers
    .filter((answer) =>
      ["unknown", "withheld", "not_applicable"].includes(answer.answerState),
    )
    .map((answer) => answer.questionLabel);
}
