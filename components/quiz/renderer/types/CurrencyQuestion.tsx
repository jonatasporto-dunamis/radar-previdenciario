import {
  getStringValue,
  inputClassName,
  type QuestionInputProps,
} from "./question-input-props";

export function CurrencyQuestion({
  question,
  value,
  disabled,
  onChange,
  onCommit,
}: QuestionInputProps) {
  const stringValue = getStringValue(value);

  return (
    <div className="relative mt-3">
      <span className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm">
        R$
      </span>
      <input
        className={`${inputClassName} mt-0 pl-10`}
        disabled={disabled}
        id={question.id}
        inputMode="decimal"
        onBlur={() => onCommit(stringValue)}
        onChange={(event) => onChange(event.target.value)}
        placeholder={question.placeholder}
        type="text"
        value={stringValue}
      />
    </div>
  );
}
