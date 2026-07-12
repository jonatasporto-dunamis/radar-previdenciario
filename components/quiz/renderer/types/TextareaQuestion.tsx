import {
  getStringValue,
  inputClassName,
  type QuestionInputProps,
} from "./question-input-props";

export function TextareaQuestion({
  question,
  value,
  disabled,
  onChange,
  onCommit,
}: QuestionInputProps) {
  const stringValue = getStringValue(value);

  return (
    <textarea
      className={`${inputClassName} min-h-32 py-3 leading-6`}
      disabled={disabled}
      id={question.id}
      onBlur={() => onCommit(stringValue)}
      onChange={(event) => onChange(event.target.value)}
      placeholder={question.placeholder}
      value={stringValue}
    />
  );
}
