import type {
  QuestionAnswerValue,
  QuestionDefinition,
  QuizStoredAnswer,
} from "@/types/quiz";

export type SerializedQuestionAnswer = {
  answerValue: string;
  answerLabel: string;
};

function getOptionLabel(question: QuestionDefinition, value: string): string {
  return (
    question.options?.find((option) => option.value === value)?.label ?? value
  );
}

function formatCurrency(value: string | number): string {
  const numericValue = Number(String(value).replace(",", "."));

  if (!Number.isFinite(numericValue)) {
    return String(value);
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(numericValue);
}

export function serializeQuestionAnswer(
  question: QuestionDefinition,
  value: QuestionAnswerValue,
): SerializedQuestionAnswer {
  if (question.type === "checkbox") {
    const selectedValues = Array.isArray(value) ? value : [];

    return {
      answerValue: JSON.stringify(selectedValues),
      answerLabel: selectedValues
        .map((item) => getOptionLabel(question, item))
        .join(", "),
    };
  }

  if (question.type === "boolean") {
    const booleanValue = Boolean(value);

    return {
      answerValue: booleanValue ? "true" : "false",
      answerLabel: booleanValue ? "Sim" : "Não",
    };
  }

  if (
    (question.type === "radio" || question.type === "select") &&
    typeof value === "string"
  ) {
    return {
      answerValue: value,
      answerLabel: getOptionLabel(question, value),
    };
  }

  if (
    question.type === "currency" &&
    value !== null &&
    value !== undefined &&
    !Array.isArray(value) &&
    typeof value !== "boolean"
  ) {
    return {
      answerValue: String(value),
      answerLabel: formatCurrency(value),
    };
  }

  return {
    answerValue: value === null || value === undefined ? "" : String(value),
    answerLabel: value === null || value === undefined ? "" : String(value),
  };
}

export function deserializeQuestionAnswer(
  question: QuestionDefinition,
  answerValue: string,
): QuestionAnswerValue {
  if (question.type === "checkbox") {
    try {
      const parsed: unknown = JSON.parse(answerValue);

      return Array.isArray(parsed)
        ? parsed.filter((item): item is string => typeof item === "string")
        : [];
    } catch {
      return [];
    }
  }

  if (question.type === "boolean") {
    return answerValue === "true";
  }

  if (question.type === "number" || question.type === "currency") {
    return answerValue;
  }

  return answerValue;
}

export function createStoredAnswer(
  question: QuestionDefinition,
  answerValue: string,
  answerLabel: string,
  benefitContext: string | null,
  createdAt?: string | null,
): QuizStoredAnswer {
  return {
    questionId: question.id,
    questionLabel: question.title,
    answerValue: deserializeQuestionAnswer(question, answerValue),
    answerLabel,
    benefitContext,
    createdAt,
  };
}
