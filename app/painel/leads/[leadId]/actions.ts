"use server";

import { revalidatePath } from "next/cache";
import {
  createLeadNoteSchema,
  deleteLeadNoteSchema,
  getFieldErrors,
  updateLeadNoteSchema,
  updateLeadStatusSchema,
} from "@/lib/validations/office-dashboard";
import { requireOfficeUser } from "@/services/office-dashboard/auth";
import { updateLeadCommercialStatus } from "@/services/office-dashboard/leads";
import {
  createLeadNote,
  deleteLeadNote,
  updateLeadNote,
} from "@/services/office-dashboard/notes";
import type { OfficeAuthActionState } from "@/types/office-dashboard";

function formStateError(message: string): OfficeAuthActionState {
  return { success: false, message };
}

export async function updateLeadStatusAction(
  _previousState: OfficeAuthActionState,
  formData: FormData,
): Promise<OfficeAuthActionState> {
  const parsed = updateLeadStatusSchema.safeParse({
    leadId: formData.get("leadId"),
    status: formData.get("status"),
    reason: formData.get("reason") || undefined,
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "Não foi possível atualizar o status.",
      fieldErrors: getFieldErrors(parsed.error.flatten().fieldErrors),
    };
  }

  try {
    const context = await requireOfficeUser();
    await updateLeadCommercialStatus({
      context,
      leadId: parsed.data.leadId,
      status: parsed.data.status,
      reason: parsed.data.reason,
    });
    revalidatePath(`/painel/leads/${parsed.data.leadId}`);
    revalidatePath("/painel/leads");
    revalidatePath("/painel");

    return { success: true, message: "Status atualizado." };
  } catch {
    return formStateError("Não foi possível atualizar o status.");
  }
}

export async function createLeadNoteAction(
  _previousState: OfficeAuthActionState,
  formData: FormData,
): Promise<OfficeAuthActionState> {
  const parsed = createLeadNoteSchema.safeParse({
    leadId: formData.get("leadId"),
    body: formData.get("body"),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "Não foi possível salvar a nota.",
      fieldErrors: getFieldErrors(parsed.error.flatten().fieldErrors),
    };
  }

  try {
    const context = await requireOfficeUser();
    await createLeadNote({
      context,
      leadId: parsed.data.leadId,
      body: parsed.data.body,
    });
    revalidatePath(`/painel/leads/${parsed.data.leadId}`);

    return { success: true, message: "Nota salva." };
  } catch {
    return formStateError("Não foi possível salvar a nota.");
  }
}

export async function updateLeadNoteAction(
  _previousState: OfficeAuthActionState,
  formData: FormData,
): Promise<OfficeAuthActionState> {
  const parsed = updateLeadNoteSchema.safeParse({
    leadId: formData.get("leadId"),
    noteId: formData.get("noteId"),
    body: formData.get("body"),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "Não foi possível atualizar a nota.",
      fieldErrors: getFieldErrors(parsed.error.flatten().fieldErrors),
    };
  }

  try {
    const context = await requireOfficeUser();
    await updateLeadNote({
      context,
      leadId: parsed.data.leadId,
      noteId: parsed.data.noteId,
      body: parsed.data.body,
    });
    revalidatePath(`/painel/leads/${parsed.data.leadId}`);

    return { success: true, message: "Nota atualizada." };
  } catch {
    return formStateError("Não foi possível atualizar a nota.");
  }
}

export async function deleteLeadNoteAction(
  _previousState: OfficeAuthActionState,
  formData: FormData,
): Promise<OfficeAuthActionState> {
  const parsed = deleteLeadNoteSchema.safeParse({
    leadId: formData.get("leadId"),
    noteId: formData.get("noteId"),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "Não foi possível excluir a nota.",
      fieldErrors: getFieldErrors(parsed.error.flatten().fieldErrors),
    };
  }

  try {
    const context = await requireOfficeUser();
    await deleteLeadNote({
      context,
      leadId: parsed.data.leadId,
      noteId: parsed.data.noteId,
    });
    revalidatePath(`/painel/leads/${parsed.data.leadId}`);

    return { success: true, message: "Nota excluída." };
  } catch {
    return formStateError("Não foi possível excluir a nota.");
  }
}
