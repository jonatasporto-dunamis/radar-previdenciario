import type { QuestionAnswerValue, QuestionDefinition } from "@/types/quiz";

export type QuestionInputProps = {
  question: QuestionDefinition;
  value: QuestionAnswerValue;
  error?: string | null;
  disabled?: boolean;
  onChange: (value: QuestionAnswerValue) => void;
  onCommit: (value: QuestionAnswerValue) => void;
};

export const inputClassName =
  "border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring mt-3 min-h-12 w-full rounded-md border px-3 text-sm transition outline-none focus-visible:ring-2";

export function getStringValue(value: QuestionAnswerValue): string {
  if (value === null || value === undefined || Array.isArray(value)) {
    return "";
  }

  return String(value);
}
