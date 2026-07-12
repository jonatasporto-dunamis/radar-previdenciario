import { formatBrazilianPhone } from "@/utils/phone";
import {
  getStringValue,
  inputClassName,
  type QuestionInputProps,
} from "./question-input-props";

export function PhoneQuestion({
  question,
  value,
  disabled,
  onChange,
}: QuestionInputProps) {
  const stringValue = getStringValue(value);

  return (
    <input
      className={inputClassName}
      disabled={disabled}
      id={question.id}
      inputMode="tel"
      onChange={(event) => onChange(formatBrazilianPhone(event.target.value))}
      placeholder={question.placeholder ?? "(00) 00000-0000"}
      type="tel"
      value={stringValue}
    />
  );
}
