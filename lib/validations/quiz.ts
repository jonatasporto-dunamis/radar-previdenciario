import type {
  QuestionAnswerValue,
  QuestionDefinition,
  QuestionOption,
} from "@/types/quiz";
import { isValidBrazilianPhone } from "@/utils/phone";

export type QuestionAnswerValidationResult =
  | {
      success: true;
      value: QuestionAnswerValue;
    }
  | {
      success: false;
      error: string;
    };

function getRequiredMessage(question: QuestionDefinition): string {
  return `Responda: ${question.title}`;
}

function hasValue(value: QuestionAnswerValue): boolean {
  if (Array.isArray(value)) {
    return value.length > 0;
  }

  return value !== null && value !== undefined && value !== "";
}

function getOptionValues(options: QuestionOption[] | undefined): string[] {
  return options?.map((option) => option.value) ?? [];
}

function normalizeStringValue(value: QuestionAnswerValue): string {
  if (value === null || value === undefined || Array.isArray(value)) {
    return "";
  }

  return String(value).trim();
}

function validateOptionValue(
  question: QuestionDefinition,
  value: string,
): QuestionAnswerValidationResult {
  if (!getOptionValues(question.options).includes(value)) {
    return {
      success: false,
      error: "Selecione uma opção válida.",
    };
  }

  return {
    success: true,
    value,
  };
}

function validateNumericValue(
  question: QuestionDefinition,
  value: string,
): QuestionAnswerValidationResult {
  const normalized = value.replace(",", ".");
  const numericValue = Number(normalized);

  if (!Number.isFinite(numericValue)) {
    return {
      success: false,
      error: question.validations?.message ?? "Informe um número válido.",
    };
  }

  if (
    typeof question.validations?.min === "number" &&
    numericValue < question.validations.min
  ) {
    return {
      success: false,
      error: question.validations.message ?? "Informe um valor maior.",
    };
  }

  if (
    typeof question.validations?.max === "number" &&
    numericValue > question.validations.max
  ) {
    return {
      success: false,
      error: question.validations.message ?? "Informe um valor menor.",
    };
  }

  return {
    success: true,
    value: normalized,
  };
}

export function validateQuestionAnswer(
  question: QuestionDefinition,
  value: QuestionAnswerValue,
): QuestionAnswerValidationResult {
  if (question.required && !hasValue(value)) {
    return {
      success: false,
      error: getRequiredMessage(question),
    };
  }

  if (!question.required && !hasValue(value)) {
    return {
      success: true,
      value: question.type === "checkbox" ? [] : "",
    };
  }

  if (question.type === "checkbox") {
    const selectedValues = Array.isArray(value) ? value : [];
    const allowedValues = getOptionValues(question.options);

    if (selectedValues.some((item) => !allowedValues.includes(item))) {
      return {
        success: false,
        error: "Selecione opções válidas.",
      };
    }

    if (
      typeof question.validations?.minSelections === "number" &&
      selectedValues.length < question.validations.minSelections
    ) {
      return {
        success: false,
        error: question.validations.message ?? "Selecione mais opções.",
      };
    }

    if (
      typeof question.validations?.maxSelections === "number" &&
      selectedValues.length > question.validations.maxSelections
    ) {
      return {
        success: false,
        error: question.validations.message ?? "Selecione menos opções.",
      };
    }

    return {
      success: true,
      value: selectedValues,
    };
  }

  if (question.type === "boolean") {
    if (typeof value !== "boolean") {
      return {
        success: false,
        error: "Escolha uma resposta.",
      };
    }

    return {
      success: true,
      value,
    };
  }

  const stringValue = normalizeStringValue(value);

  if (question.type === "radio" || question.type === "select") {
    return validateOptionValue(question, stringValue);
  }

  if (question.type === "number" || question.type === "currency") {
    return validateNumericValue(question, stringValue);
  }

  if (
    question.type === "email" &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(stringValue)
  ) {
    return {
      success: false,
      error: "Informe um e-mail válido.",
    };
  }

  if (question.type === "phone" && !isValidBrazilianPhone(stringValue)) {
    return {
      success: false,
      error: "Informe um telefone com DDD válido.",
    };
  }

  if (question.type === "cpf") {
    const digits = stringValue.replace(/\D/g, "");

    if (digits.length !== 11) {
      return {
        success: false,
        error: "Informe um CPF válido.",
      };
    }
  }

  if (
    typeof question.validations?.minLength === "number" &&
    stringValue.length < question.validations.minLength
  ) {
    return {
      success: false,
      error: question.validations.message ?? "Informe mais caracteres.",
    };
  }

  if (
    typeof question.validations?.maxLength === "number" &&
    stringValue.length > question.validations.maxLength
  ) {
    return {
      success: false,
      error: question.validations.message ?? "Informe menos caracteres.",
    };
  }

  if (
    question.validations?.pattern &&
    !new RegExp(question.validations.pattern).test(stringValue)
  ) {
    return {
      success: false,
      error: question.validations.message ?? "Informe um valor válido.",
    };
  }

  return {
    success: true,
    value: stringValue,
  };
}
