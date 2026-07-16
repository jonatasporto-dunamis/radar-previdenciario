import type {
  AnswerState,
  QuestionAnswerValue,
  QuestionDefinition,
} from "@/types/quiz";

export const answerStateLabels = {
  unknown: "Não sei informar",
  withheld: "Prefiro não informar",
  not_applicable: "Não se aplica",
} satisfies Record<Exclude<AnswerState, "answered">, string>;

const nonAnsweredStates = Object.keys(answerStateLabels) as Array<
  Exclude<AnswerState, "answered">
>;

export function isNonAnsweredState(
  value: unknown,
): value is Exclude<AnswerState, "answered"> {
  return (
    typeof value === "string" &&
    nonAnsweredStates.includes(value as Exclude<AnswerState, "answered">)
  );
}

export function isAllowedAnswerState(
  question: QuestionDefinition,
  value: unknown,
): value is Exclude<AnswerState, "answered"> {
  return (
    isNonAnsweredState(value) &&
    Boolean(question.answerStateOptions?.includes(value))
  );
}

export function getAnswerState(value: QuestionAnswerValue): AnswerState {
  if (Array.isArray(value)) {
    const state = value.find(isNonAnsweredState);

    return state ?? "answered";
  }

  return isNonAnsweredState(value) ? value : "answered";
}

export function getAnswerStateLabel(value: string): string {
  return isNonAnsweredState(value) ? answerStateLabels[value] : value;
}
