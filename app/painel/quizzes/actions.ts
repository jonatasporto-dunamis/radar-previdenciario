"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireTenantRole } from "@/services/office-dashboard/auth";
import {
  cloneOfficeQuizTemplate,
  updateOfficeQuizTemplateDraft,
  updateOfficeQuizTemplateStatus,
} from "@/services/office-dashboard/quizzes";
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
