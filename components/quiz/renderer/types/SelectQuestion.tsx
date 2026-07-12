import {
  getStringValue,
  inputClassName,
  type QuestionInputProps,
} from "./question-input-props";

export function SelectQuestion({
  question,
  value,
  disabled,
  onChange,
  onCommit,
}: QuestionInputProps) {
  const selectedValue = getStringValue(value);

  return (
    <select
      className={inputClassName}
      disabled={disabled}
      id={question.id}
      onBlur={() => onCommit(selectedValue)}
      onChange={(event) => {
        onChange(event.target.value);
        onCommit(event.target.value);
      }}
      value={selectedValue}
    >
      <option value="">Selecione uma opção</option>
      {question.options?.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
