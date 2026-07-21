import Link from "next/link";
import { ArrowLeft, Copy, FilePlus2 } from "lucide-react";
import { DashboardShell } from "@/components/office-dashboard/DashboardShell";
import { requireTenantRole } from "@/services/office-dashboard/auth";
import { listOfficeQuizTemplates } from "@/services/office-dashboard/quizzes";
import {
  cloneQuizTemplateAction,
  createBlankQuizTemplateAction,
} from "../actions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function NewOfficeQuizTemplatePage() {
  const context = await requireTenantRole("createQuizTemplate");
  const templates = await listOfficeQuizTemplates(context);
  const platformTemplates = templates.filter(
    (template) => template.source === "platform",
  );

  return (
    <DashboardShell context={context}>
      <div className="space-y-6">
        <div>
          <Link
            className="text-muted-foreground inline-flex items-center gap-2 text-sm"
            href="/painel/quizzes"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            Voltar para quizzes
          </Link>
          <p className="text-muted-foreground mt-4 text-sm">Novo quiz</p>
          <h2 className="text-2xl font-semibold">Criar ou clonar template</h2>
          <p className="text-muted-foreground mt-2 max-w-3xl text-sm">
            Crie um rascunho tenant do zero ou use um template da plataforma
            como ponto de partida. Templates platform nunca são editados
            diretamente.
          </p>
        </div>

        <section className="bg-card rounded-lg border p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold">Começar do zero</h3>
              <p className="text-muted-foreground mt-1 text-sm">
                Cria um draft tenant com uma pergunta inicial e abre o builder
                visual.
              </p>
            </div>
            <form action={createBlankQuizTemplateAction}>
              <button
                className="bg-primary text-primary-foreground inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold"
                type="submit"
              >
                <FilePlus2 aria-hidden="true" className="size-4" />
                Criar quiz em branco
              </button>
            </form>
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Clonar template existente</h3>
            <p className="text-muted-foreground mt-1 text-sm">
              O clone mantém perguntas e regras do template base em um draft
              tenant editável.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {platformTemplates.map((template) => (
              <article
                className="bg-card flex min-h-56 flex-col justify-between rounded-lg border p-5"
                key={template.id}
              >
                <div>
                  <p className="text-muted-foreground text-sm">
                    {template.type}
                  </p>
                  <h4 className="mt-1 font-semibold">{template.name}</h4>
                  <p className="text-muted-foreground mt-2 text-sm">
                    {template.questionsCount} perguntas - {template.rulesCount}{" "}
                    regras
                  </p>
                </div>
                <form action={cloneQuizTemplateAction} className="mt-4">
                  <input name="templateId" type="hidden" value={template.id} />
                  <button
                    className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold"
                    type="submit"
                  >
                    <Copy aria-hidden="true" className="size-4" />
                    Clonar template
                  </button>
                </form>
              </article>
            ))}
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
