import { formatBoolean, formatClassification } from "@/lib/office-dashboard";
import type { OfficeLeadDetail } from "@/types/office-dashboard";

export function LeadInternalQualification({
  lead,
}: {
  lead: OfficeLeadDetail;
}) {
  const result = lead.latestResult;

  return (
    <section
      className="bg-card rounded-lg border p-5"
      aria-labelledby="lead-qualification"
    >
      <h2 className="text-lg font-semibold" id="lead-qualification">
        Qualificação interna
      </h2>
      <p className="bg-warning/10 text-warning mt-2 rounded-md p-3 text-sm">
        Classificação interna de triagem. Não representa parecer jurídico,
        probabilidade de êxito ou confirmação de direito.
      </p>
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-muted-foreground">Classificação</dt>
          <dd>{formatClassification(result?.classification)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Score operacional</dt>
          <dd>{result?.score ?? "Não calculado"}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Tema previdenciário</dt>
          <dd>{result?.potentialBenefit ?? "Não identificado"}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Template utilizado</dt>
          <dd>{result?.templateName ?? "Quiz legado"}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Tipo e versão</dt>
          <dd>
            {result?.templateType ?? "sem tipo"}{" "}
            {result?.templateVersion ? `v${result.templateVersion}` : ""}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Completude</dt>
          <dd>{result?.dataCompleteness ?? "Não calculada"}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Revisão humana</dt>
          <dd>{formatBoolean(lead.requiresHumanReview)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Respostas unknown</dt>
          <dd>{lead.unknownAnswers.length}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Respostas withheld</dt>
          <dd>{lead.withheldAnswers.length}</dd>
        </div>
      </dl>
      {lead.missingCriticalAnswers.length ? (
        <div className="mt-4">
          <p className="text-sm font-medium">Informações críticas ausentes</p>
          <ul className="text-muted-foreground mt-2 list-disc space-y-1 pl-5 text-sm">
            {lead.missingCriticalAnswers.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {result?.matchedRules.length ? (
        <div className="mt-4">
          <p className="text-sm font-medium">Regras internas aplicadas</p>
          <ul className="text-muted-foreground mt-2 list-disc space-y-1 pl-5 text-sm">
            {result.matchedRules.map((rule, index) => (
              <li key={`${index}-${String(rule.benefitSlug ?? "rule")}`}>
                {String(rule.benefitSlug ?? rule.benefitTitle ?? "regra")}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
