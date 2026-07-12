import type { QuestionInputProps } from "./types/question-input-props";
import { questionRendererRegistry } from "./registry";

export function QuestionRenderer(props: QuestionInputProps) {
  const Component = questionRendererRegistry[props.question.type];

  return <Component {...props} />;
}
