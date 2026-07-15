import { formatDateTime } from "@/lib/office-dashboard";
import type { OfficeQuizAnswer } from "@/types/office-dashboard";

export function LeadQuizAnswers({ answers }: { answers: OfficeQuizAnswer[] }) {
  return (
    <section
      className="bg-card rounded-lg border p-5"
      aria-labelledby="lead-answers"
    >
      <h2 className="text-lg font-semibold" id="lead-answers">
        Respostas do quiz
      </h2>
      {answers.length ? (
        <div className="mt-4 space-y-3">
          {answers.map((answer, index) => (
            <article className="rounded-md border p-4" key={answer.id}>
              <p className="text-muted-foreground text-xs font-semibold uppercase">
                Pergunta {index + 1}
              </p>
              <h3 className="mt-1 font-medium">{answer.questionLabel}</h3>
              <p className="mt-2 text-sm">{answer.answerLabel}</p>
              <p className="text-muted-foreground mt-2 text-xs">
                Estado: {answer.answerState} · Contexto:{" "}
                {answer.benefitContext ?? "não informado"} ·{" "}
                {formatDateTime(answer.createdAt)}
              </p>
            </article>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground mt-3 text-sm">
          Nenhuma resposta registrada.
        </p>
      )}
    </section>
  );
}
