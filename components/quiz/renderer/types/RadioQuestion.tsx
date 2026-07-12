import { cn } from "@/lib/utils";
import {
  getStringValue,
  type QuestionInputProps,
} from "./question-input-props";

export function RadioQuestion({
  question,
  value,
  disabled,
  onChange,
  onCommit,
}: QuestionInputProps) {
  const selectedValue = getStringValue(value);

  return (
    <div className="mt-4 grid gap-3">
      {question.options?.map((option) => {
        const selected = selectedValue === option.value;

        return (
          <label
            className={cn(
              "border-border bg-background text-foreground focus-within:ring-ring rounded-md border p-4 text-sm transition focus-within:ring-2",
              selected && "border-primary bg-primary/10 text-primary",
            )}
            key={option.value}
          >
            <input
              checked={selected}
              className="sr-only"
              disabled={disabled}
              name={question.id}
              onChange={() => {
                onChange(option.value);
                onCommit(option.value);
              }}
              type="radio"
              value={option.value}
            />
            <span className="font-medium">{option.label}</span>
            {option.description ? (
              <span className="text-muted-foreground mt-1 block leading-6">
                {option.description}
              </span>
            ) : null}
          </label>
        );
      })}
    </div>
  );
}
