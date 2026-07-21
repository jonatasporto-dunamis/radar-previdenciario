import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { DashboardShell } from "@/components/office-dashboard/DashboardShell";
import { requireTenantRole } from "@/services/office-dashboard/auth";
import { getOfficeQuizTemplate } from "@/services/office-dashboard/quizzes";
import { updateQuizTemplateDraftAction } from "../../actions";

type EditTemplatePageProps = {
  params: Promise<{ templateId: string }>;
  searchParams?: Promise<{ error?: string }>;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

function getErrorMessage(error?: string): string | null {
  if (error === "moderation_blocked") {
    return "O texto contém expressão bloqueada pela política editorial. Ajuste o conteúdo antes de salvar.";
  }

  if (error === "save_failed") {
    return "Não foi possível salvar o draft. Revise os dados e tente novamente.";
  }

  return null;
}

export default async function EditOfficeQuizTemplatePage({
  params,
  searchParams,
}: EditTemplatePageProps) {
  const context = await requireTenantRole("editQuizTemplate");
  const { templateId } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const template = await getOfficeQuizTemplate({ context, templateId });

  if (!template) {
    notFound();
  }

  const canEditDraft = template.source === "tenant" && template.canEdit;
  const errorMessage = getErrorMessage(resolvedSearchParams.error);

  return (
    <DashboardShell context={context}>
      <div className="max-w-3xl space-y-6">
        <div>
          <Link
            className="text-muted-foreground inline-flex items-center gap-2 text-sm"
            href={`/painel/quizzes/${template.id}`}
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            Voltar para o template
          </Link>
          <p className="text-muted-foreground mt-4 text-sm">Edição básica</p>
          <h2 className="text-2xl font-semibold">{template.name}</h2>
          <p className="text-muted-foreground mt-2 text-sm">
            Somente templates do tenant podem ser editados. Templates da
            plataforma devem ser clonados antes de qualquer alteração.
          </p>
        </div>

        {errorMessage ? (
          <div
            className="border-danger/30 bg-danger/10 text-danger rounded-lg border p-4 text-sm"
            role="alert"
          >
            {errorMessage}
          </div>
        ) : null}

        {!canEditDraft ? (
          <div className="rounded-lg border p-4 text-sm">
            Este template é somente leitura para o seu perfil ou pertence à
            plataforma.
          </div>
        ) : (
          <form
            action={updateQuizTemplateDraftAction}
            className="rounded-lg border p-4"
          >
            <input name="templateId" type="hidden" value={template.id} />
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium" htmlFor="name">
                  Nome
                </label>
                <input
                  className="mt-2 w-full rounded-md border bg-transparent px-3 py-2 text-sm"
                  defaultValue={template.name}
                  id="name"
                  maxLength={160}
                  name="name"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium" htmlFor="description">
                  Descrição
                </label>
                <textarea
                  className="mt-2 min-h-32 w-full rounded-md border bg-transparent px-3 py-2 text-sm"
                  defaultValue={template.description}
                  id="description"
                  maxLength={800}
                  name="description"
                  required
                />
              </div>
              <div className="rounded-md border p-3 text-sm">
                O MVP permite editar textos do template tenant. Reordenação,
                ativação de perguntas opcionais e novas perguntas devem seguir a
                moderação e versionamento antes de publicação.
              </div>
              <button
                className="rounded-md border px-4 py-2 text-sm font-medium"
                type="submit"
              >
                Salvar draft
              </button>
            </div>
          </form>
        )}
      </div>
    </DashboardShell>
  );
}
