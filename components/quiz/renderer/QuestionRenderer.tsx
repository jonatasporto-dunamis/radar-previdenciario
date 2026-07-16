import type { QuestionInputProps } from "./types/question-input-props";
import { questionRendererRegistry } from "./registry";
import { cn } from "@/lib/utils";
import { answerStateLabels } from "@/utils/quiz-answer-state";

export function QuestionRenderer(props: QuestionInputProps) {
  const Component = questionRendererRegistry[props.question.type];
  const answerStateOptions = props.question.answerStateOptions ?? [];

  return (
    <>
      <Component {...props} />
      {answerStateOptions.length > 0 ? (
        <div className="mt-4 grid gap-3">
          {answerStateOptions.map((option) => {
            const selected = props.value === option;

            return (
              <button
                aria-pressed={selected}
                className={cn(
                  "border-border bg-background text-foreground focus-visible:ring-ring rounded-md border p-4 text-left text-sm font-medium transition outline-none focus-visible:ring-2",
                  selected && "border-primary bg-primary/10 text-primary",
                )}
                disabled={props.disabled}
                key={option}
                onClick={() => {
                  props.onChange(option);
                  props.onCommit(option);
                }}
                type="button"
              >
                {answerStateLabels[option]}
              </button>
            );
          })}
        </div>
      ) : null}
    </>
  );
}
