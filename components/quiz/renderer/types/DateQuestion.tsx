import {
  getStringValue,
  inputClassName,
  type QuestionInputProps,
} from "./question-input-props";

export function DateQuestion({
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
      onChange={(event) => onChange(event.target.value)}
      type="date"
      value={stringValue}
    />
  );
}
