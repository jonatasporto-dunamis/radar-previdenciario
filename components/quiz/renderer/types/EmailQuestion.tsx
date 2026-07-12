import {
  getStringValue,
  inputClassName,
  type QuestionInputProps,
} from "./question-input-props";

export function EmailQuestion({
  question,
  value,
  disabled,
  onChange,
  onCommit,
}: QuestionInputProps) {
  const stringValue = getStringValue(value);

  return (
    <input
      className={inputClassName}
      disabled={disabled}
      id={question.id}
      inputMode="email"
      onBlur={() => onCommit(stringValue)}
      onChange={(event) => onChange(event.target.value)}
      placeholder={question.placeholder ?? "voce@email.com"}
      type="email"
      value={stringValue}
    />
  );
}
