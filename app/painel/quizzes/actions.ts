"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireTenantRole } from "@/services/office-dashboard/auth";
import {
  cloneOfficeQuizTemplate,
  createBlankOfficeQuizTemplate,
  saveOfficeQuizTemplateBuilderDraft,
  updateOfficeQuizTemplateDraft,
  updateOfficeQuizTemplateStatus,
} from "@/services/office-dashboard/quizzes";
import type { QuizBuilderDraftInput } from "@/lib/validations/quiz-builder";
import type { QuizTemplateStatus } from "@/types/quiz";

function readString(formData: FormData, key: string): string {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

function getEditErrorCode(error: unknown): string {
  if (
    error instanceof Error &&
    /blocked by content moderation|unsupported markup/i.test(error.message)
  ) {
    return "moderation_blocked";
  }

  return "save_failed";
}

export async function cloneQuizTemplateAction(formData: FormData) {
  const context = await requireTenantRole("createQuizTemplate");
  const templateId = readString(formData, "templateId");
  const clonedId = await cloneOfficeQuizTemplate({ context, templateId });

  revalidatePath("/painel/quizzes");
  redirect(`/painel/quizzes/${clonedId}`);
}

export async function createBlankQuizTemplateAction() {
  const context = await requireTenantRole("createQuizTemplate");
  const templateId = await createBlankOfficeQuizTemplate({ context });

  revalidatePath("/painel/quizzes");
  redirect(`/painel/quizzes/${templateId}/editar`);
}

export async function saveQuizBuilderDraftAction(
  draft: QuizBuilderDraftInput,
): Promise<{ success: boolean; message: string }> {
  const context = await requireTenantRole("editQuizTemplate");

  try {
    await saveOfficeQuizTemplateBuilderDraft({ context, draft });
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error &&
        /moderation|checklist|unsupported markup|validation/i.test(
          error.message,
        )
          ? "Revise o conteúdo do quiz antes de salvar."
          : "Não foi possível salvar o draft visual.",
    };
  }

  revalidatePath("/painel/quizzes");
  revalidatePath(`/painel/quizzes/${draft.templateId}`);
  revalidatePath(`/painel/quizzes/${draft.templateId}/editar`);

  return {
    success: true,
    message: "Draft salvo.",
  };
}

export async function updateQuizTemplateDraftAction(formData: FormData) {
  const context = await requireTenantRole("editQuizTemplate");
  const templateId = readString(formData, "templateId");

  try {
    await updateOfficeQuizTemplateDraft({
      context,
      templateId,
      name: readString(formData, "name"),
      description: readString(formData, "description"),
    });
  } catch (error) {
    redirect(
      `/painel/quizzes/${templateId}/editar?error=${getEditErrorCode(error)}`,
    );
  }

  revalidatePath("/painel/quizzes");
  revalidatePath(`/painel/quizzes/${templateId}`);
  redirect(`/painel/quizzes/${templateId}`);
}

export async function updateQuizTemplateStatusAction(formData: FormData) {
  const requestedStatus = readString(formData, "status") as QuizTemplateStatus;
  const context = await requireTenantRole(
    requestedStatus === "active" ? "publishQuizTemplate" : "editQuizTemplate",
  );
  const templateId = readString(formData, "templateId");

  if (
    requestedStatus !== "active" &&
    requestedStatus !== "inactive" &&
    requestedStatus !== "archived"
  ) {
    throw new Error("Unsupported quiz template status.");
  }

  await updateOfficeQuizTemplateStatus({
    context,
    templateId,
    status: requestedStatus,
  });

  revalidatePath("/painel/quizzes");
  revalidatePath(`/painel/quizzes/${templateId}`);
}
