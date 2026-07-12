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
  onCommit,
}: QuestionInputProps) {
  const stringValue = getStringValue(value);

  return (
    <input
      className={inputClassName}
      disabled={disabled}
      id={question.id}
      inputMode="numeric"
      onBlur={() => onCommit(stringValue)}
      onChange={(event) => onChange(event.target.value)}
      placeholder={question.placeholder}
      type="number"
      value={stringValue}
    />
  );
}
