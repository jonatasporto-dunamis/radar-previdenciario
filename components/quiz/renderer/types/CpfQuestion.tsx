import {
  getStringValue,
  inputClassName,
  type QuestionInputProps,
} from "./question-input-props";

function formatCpf(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (digits.length <= 3) {
    return digits;
  }

  if (digits.length <= 6) {
    return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  }

  if (digits.length <= 9) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  }

  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(
    6,
    9,
  )}-${digits.slice(9)}`;
}

export function CpfQuestion({
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
      onChange={(event) => onChange(formatCpf(event.target.value))}
      placeholder={question.placeholder ?? "000.000.000-00"}
      type="text"
      value={stringValue}
    />
  );
}
