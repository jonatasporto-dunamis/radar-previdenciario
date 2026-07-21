import Link from "next/link";
import { Copy, Eye, FilePlus2 } from "lucide-react";
import { DashboardShell } from "@/components/office-dashboard/DashboardShell";
import { requireTenantRole } from "@/services/office-dashboard/auth";
import { listOfficeQuizTemplates } from "@/services/office-dashboard/quizzes";
import { cloneQuizTemplateAction } from "./actions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function formatSource(source: string) {
  return source === "platform" ? "Plataforma" : "Tenant";
}

function formatStatus(status: string) {
  const labels: Record<string, string> = {
    active: "Ativo",
    draft: "Rascunho",
    inactive: "Inativo",
    archived: "Arquivado",
  };

  return labels[status] ?? status;
}

export default async function OfficeQuizzesPage() {
  const context = await requireTenantRole("viewQuizTemplate");
  const templates = await listOfficeQuizTemplates(context);

  return (
    <DashboardShell context={context}>
      <div className="space-y-6">
        <div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Quizzes</p>
              <h2 className="text-2xl font-semibold">
                Gestão básica de templates
              </h2>
              <p className="text-muted-foreground mt-2 max-w-3xl text-sm">
                Templates da plataforma são somente leitura. Admins e gestores
                podem clonar para o tenant, editar rascunhos e controlar status.
              </p>
            </div>
            <Link
              className="bg-primary text-primary-foreground inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold"
              href="/painel/quizzes/novo"
            >
              <FilePlus2 aria-hidden="true" className="size-4" />
              Novo quiz
            </Link>
          </div>
        </div>

        <div className="bg-card overflow-x-auto rounded-lg border">
          <table className="min-w-full divide-y text-sm">
            <caption className="sr-only">Templates de quiz disponíveis</caption>
            <thead className="text-muted-foreground bg-neutral-50 text-left text-xs uppercase dark:bg-neutral-950">
              <tr>
                <th className="px-4 py-3" scope="col">
                  Template
                </th>
                <th className="px-4 py-3" scope="col">
                  Tipo
                </th>
                <th className="px-4 py-3" scope="col">
                  Origem
                </th>
                <th className="px-4 py-3" scope="col">
                  Versão
                </th>
                <th className="px-4 py-3" scope="col">
                  Status
                </th>
                <th className="px-4 py-3" scope="col">
                  Estrutura
                </th>
                <th className="px-4 py-3" scope="col">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {templates.map((template) => (
                <tr key={template.id}>
                  <td className="px-4 py-4">
                    <p className="font-medium">{template.name}</p>
                    <p className="text-muted-foreground">{template.slug}</p>
                  </td>
                  <td className="px-4 py-4">{template.type}</td>
                  <td className="px-4 py-4">
                    <p>{formatSource(template.source)}</p>
                    <p className="text-muted-foreground">
                      {template.tenantLabel}
                    </p>
                  </td>
                  <td className="px-4 py-4">v{template.version}</td>
                  <td className="px-4 py-4">{formatStatus(template.status)}</td>
                  <td className="px-4 py-4">
                    {template.questionsCount} perguntas - {template.rulesCount}{" "}
                    regras
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium"
                        href={`/painel/quizzes/${template.id}`}
                      >
                        <Eye aria-hidden="true" className="size-4" />
                        Abrir
                      </Link>
                      {template.canClone ? (
                        <form action={cloneQuizTemplateAction}>
                          <input
                            name="templateId"
                            type="hidden"
                            value={template.id}
                          />
                          <button
                            className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium"
                            type="submit"
                          >
                            <Copy aria-hidden="true" className="size-4" />
                            Clonar
                          </button>
                        </form>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardShell>
  );
}
