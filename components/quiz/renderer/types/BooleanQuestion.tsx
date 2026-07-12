import { cn } from "@/lib/utils";
import type { QuestionInputProps } from "./question-input-props";

const booleanOptions = [
  { label: "Sim", value: true },
  { label: "Não", value: false },
];

export function BooleanQuestion({
  value,
  disabled,
  onChange,
  onCommit,
}: QuestionInputProps) {
  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      {booleanOptions.map((option) => {
        const selected = value === option.value;

        return (
          <button
            aria-pressed={selected}
            className={cn(
              "border-border bg-background text-foreground focus-visible:ring-ring rounded-md border p-4 text-left text-sm font-medium transition outline-none focus-visible:ring-2",
              selected && "border-primary bg-primary/10 text-primary",
            )}
            disabled={disabled}
            key={option.label}
            onClick={() => {
              onChange(option.value);
              onCommit(option.value);
            }}
            type="button"
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
