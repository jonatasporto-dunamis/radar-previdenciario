import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";
import { DashboardShell } from "@/components/office-dashboard/DashboardShell";
import { requireTenantRole } from "@/services/office-dashboard/auth";
import { getOfficeQuizTemplate } from "@/services/office-dashboard/quizzes";
import {
  cloneQuizTemplateAction,
  updateQuizTemplateStatusAction,
} from "../actions";

type TemplateDetailPageProps = {
  params: Promise<{ templateId: string }>;
};

function formatStatus(status: string) {
  const labels: Record<string, string> = {
    active: "Ativo",
    draft: "Rascunho",
    inactive: "Inativo",
    archived: "Arquivado",
  };

  return labels[status] ?? status;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function OfficeQuizTemplateDetailPage({
  params,
}: TemplateDetailPageProps) {
  const context = await requireTenantRole("viewQuizTemplate");
  const { templateId } = await params;
  const template = await getOfficeQuizTemplate({ context, templateId });

  if (!template) {
    notFound();
  }

  return (
    <DashboardShell context={context}>
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link
              className="text-muted-foreground inline-flex items-center gap-2 text-sm"
              href="/painel/quizzes"
            >
              <ArrowLeft aria-hidden="true" className="size-4" />
              Voltar para quizzes
            </Link>
            <p className="text-muted-foreground mt-4 text-sm">
              Template de quiz
            </p>
            <h2 className="text-2xl font-semibold">{template.name}</h2>
            <p className="text-muted-foreground mt-2 max-w-3xl text-sm">
              {template.description}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {template.canEdit ? (
              <Link
                className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium"
                href={`/painel/quizzes/${template.id}/editar`}
              >
                <Pencil aria-hidden="true" className="size-4" />
                Editar draft
              </Link>
            ) : null}
            {template.canClone ? (
              <form action={cloneQuizTemplateAction}>
                <input name="templateId" type="hidden" value={template.id} />
                <button
                  className="rounded-md border px-3 py-2 text-sm font-medium"
                  type="submit"
                >
                  Clonar para tenant
                </button>
              </form>
            ) : null}
          </div>
        </div>

        <section className="grid gap-4 md:grid-cols-4" aria-label="Resumo">
          {[
            ["Tipo", template.type],
            ["Origem", template.source],
            ["Status", formatStatus(template.status)],
            ["Versão", `v${template.version}`],
          ].map(([label, value]) => (
            <div className="rounded-lg border p-4" key={label}>
              <p className="text-muted-foreground text-xs uppercase">{label}</p>
              <p className="mt-2 font-semibold">{value}</p>
            </div>
          ))}
        </section>

        <section className="rounded-lg border p-4">
          <h3 className="font-semibold">Governança</h3>
          <div className="text-muted-foreground mt-3 grid gap-2 text-sm md:grid-cols-2">
            <p>Tenant: {template.tenantLabel}</p>
            <p>Ownership: {template.ownership}</p>
            <p>Moderação: {template.moderation.level}</p>
            <p>
              Aviso: Classificação interna de triagem. Não representa parecer
              jurídico, confirmação de direito ou probabilidade de êxito.
            </p>
          </div>
          {template.moderation.matches.length ? (
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
              {template.moderation.matches.map((match) => (
                <li key={`${match.term}-${match.level}`}>
                  {match.level}: {match.term}
                </li>
              ))}
            </ul>
          ) : null}
        </section>

        {template.source === "tenant" ? (
          <section className="rounded-lg border p-4">
            <h3 className="font-semibold">Status do template tenant</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {template.canPublish ? (
                <form action={updateQuizTemplateStatusAction}>
                  <input name="templateId" type="hidden" value={template.id} />
                  <input name="status" type="hidden" value="active" />
                  <button
                    className="rounded-md border px-3 py-2 text-sm font-medium"
                    type="submit"
                  >
                    Publicar
                  </button>
                </form>
              ) : null}
              {template.canDeactivate ? (
                <>
                  <form action={updateQuizTemplateStatusAction}>
                    <input
                      name="templateId"
                      type="hidden"
                      value={template.id}
                    />
                    <input name="status" type="hidden" value="inactive" />
                    <button
                      className="rounded-md border px-3 py-2 text-sm font-medium"
                      type="submit"
                    >
                      Desativar
                    </button>
                  </form>
                  <form action={updateQuizTemplateStatusAction}>
                    <input
                      name="templateId"
                      type="hidden"
                      value={template.id}
                    />
                    <input name="status" type="hidden" value="archived" />
                    <button
                      className="rounded-md border px-3 py-2 text-sm font-medium"
                      type="submit"
                    >
                      Arquivar
                    </button>
                  </form>
                </>
              ) : null}
            </div>
          </section>
        ) : null}

        <section className="rounded-lg border">
          <div className="border-b p-4">
            <h3 className="font-semibold">Perguntas</h3>
          </div>
          <div className="divide-y">
            {template.questions.map((question) => (
              <div
                className="grid gap-3 p-4 md:grid-cols-[1fr_auto]"
                key={question.id}
              >
                <div>
                  <p className="font-medium">{question.title}</p>
                  <p className="text-muted-foreground text-sm">
                    {question.questionKey} - {question.type}
                  </p>
                </div>
                <div className="text-muted-foreground text-sm">
                  {question.required ? "Obrigatória" : "Opcional"} -{" "}
                  {question.sensitive ? "sensível" : "não sensível"} -{" "}
                  {question.optionsCount} opções
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border">
            <div className="border-b p-4">
              <h3 className="font-semibold">Regras internas</h3>
            </div>
            <div className="divide-y">
              {template.rules.map((rule) => (
                <div className="p-4" key={rule.id}>
                  <p className="font-medium">{rule.ruleKey}</p>
                  <p className="text-muted-foreground text-sm">
                    {rule.ruleType} - prioridade {rule.priority} -{" "}
                    {rule.active ? "ativa" : "inativa"}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border">
            <div className="border-b p-4">
              <h3 className="font-semibold">Versões</h3>
            </div>
            <div className="divide-y">
              {template.versions.map((version) => (
                <div className="p-4" key={version.id}>
                  <p className="font-medium">v{version.version}</p>
                  <p className="text-muted-foreground text-sm">
                    {formatStatus(version.status)} - {version.createdAt}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
