import type { ComponentType } from "react";
import type { QuestionType } from "@/types/quiz";
import { BooleanQuestion } from "./types/BooleanQuestion";
import { CheckboxQuestion } from "./types/CheckboxQuestion";
import { CpfQuestion } from "./types/CpfQuestion";
import { CurrencyQuestion } from "./types/CurrencyQuestion";
import { DateQuestion } from "./types/DateQuestion";
import { EmailQuestion } from "./types/EmailQuestion";
import { NumberQuestion } from "./types/NumberQuestion";
import { PhoneQuestion } from "./types/PhoneQuestion";
import type { QuestionInputProps } from "./types/question-input-props";
import { RadioQuestion } from "./types/RadioQuestion";
import { SelectQuestion } from "./types/SelectQuestion";
import { TextareaQuestion } from "./types/TextareaQuestion";
import { TextQuestion } from "./types/TextQuestion";

export const questionRendererRegistry: Record<
  QuestionType,
  ComponentType<QuestionInputProps>
> = {
  text: TextQuestion,
  textarea: TextareaQuestion,
  number: NumberQuestion,
  currency: CurrencyQuestion,
  date: DateQuestion,
  boolean: BooleanQuestion,
  radio: RadioQuestion,
  checkbox: CheckboxQuestion,
  select: SelectQuestion,
  cpf: CpfQuestion,
  phone: PhoneQuestion,
  email: EmailQuestion,
};
