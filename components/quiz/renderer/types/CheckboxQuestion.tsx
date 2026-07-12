import { cn } from "@/lib/utils";
import type { QuestionInputProps } from "./question-input-props";

export function CheckboxQuestion({
  question,
  value,
  disabled,
  onChange,
  onCommit,
}: QuestionInputProps) {
  const selectedValues = Array.isArray(value) ? value : [];

  function toggleValue(nextValue: string) {
    const nextValues = selectedValues.includes(nextValue)
      ? selectedValues.filter((item) => item !== nextValue)
      : [...selectedValues, nextValue];

    onChange(nextValues);
    onCommit(nextValues);
  }

  return (
    <div className="mt-4 grid gap-3">
      {question.options?.map((option) => {
        const selected = selectedValues.includes(option.value);

        return (
          <label
            className={cn(
              "border-border bg-background text-foreground focus-within:ring-ring flex gap-3 rounded-md border p-4 text-sm transition focus-within:ring-2",
              selected && "border-primary bg-primary/10 text-primary",
            )}
            key={option.value}
          >
            <input
              checked={selected}
              className="border-input text-primary focus-visible:ring-ring mt-0.5 size-4 rounded outline-none focus-visible:ring-2"
              disabled={disabled}
              onChange={() => toggleValue(option.value)}
              type="checkbox"
              value={option.value}
            />
            <span>
              <span className="font-medium">{option.label}</span>
              {option.description ? (
                <span className="text-muted-foreground mt-1 block leading-6">
                  {option.description}
                </span>
              ) : null}
            </span>
          </label>
        );
      })}
    </div>
  );
}
