import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { DashboardShell } from "@/components/office-dashboard/DashboardShell";
import { VisualQuizBuilder } from "@/components/office-dashboard/quizzes/VisualQuizBuilder";
import { requireTenantRole } from "@/services/office-dashboard/auth";
import { getOfficeQuizTemplate } from "@/services/office-dashboard/quizzes";

type EditTemplatePageProps = {
  params: Promise<{ templateId: string }>;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function EditOfficeQuizTemplatePage({
  params,
}: EditTemplatePageProps) {
  const context = await requireTenantRole("editQuizTemplate");
  const { templateId } = await params;
  const template = await getOfficeQuizTemplate({ context, templateId });

  if (!template) {
    notFound();
  }

  const canEditDraft = template.source === "tenant" && template.canEdit;

  return (
    <DashboardShell context={context}>
      <div className="space-y-6">
        <div>
          <Link
            className="text-muted-foreground inline-flex items-center gap-2 text-sm"
            href={`/painel/quizzes/${template.id}`}
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            Voltar para o template
          </Link>
          <p className="text-muted-foreground mt-4 text-sm">Builder visual</p>
          <h2 className="text-2xl font-semibold">{template.name}</h2>
          <p className="text-muted-foreground mt-2 max-w-3xl text-sm">
            Edite informações, perguntas, lógica, resultado, aparência e
            publicação do template tenant em uma experiência guiada.
          </p>
        </div>

        {!canEditDraft ? (
          <div className="rounded-lg border p-4 text-sm">
            Este template é somente leitura para o seu perfil ou pertence à
            plataforma. Clone o template antes de editar.
          </div>
        ) : null}

        <VisualQuizBuilder canEdit={canEditDraft} template={template} />
      </div>
    </DashboardShell>
  );
}
