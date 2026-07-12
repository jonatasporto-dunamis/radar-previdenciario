import {
  getStringValue,
  inputClassName,
  type QuestionInputProps,
} from "./question-input-props";

export function NumberQuestion({
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
      inputMode="numeric"
      onChange={(event) => onChange(event.target.value)}
      placeholder={question.placeholder}
      type="number"
      value={stringValue}
    />
  );
}
