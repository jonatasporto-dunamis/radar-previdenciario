import "server-only";
import { canDeleteLeadNote } from "@/lib/office-dashboard";
import { deleteLeadNoteById, getNoteForLead } from "../repositories";
import { createAuditLog } from "../audit";
import type { OfficeUserContext } from "@/types/office-dashboard";

export async function deleteLeadNote(input: {
  context: OfficeUserContext;
  leadId: string;
  noteId: string;
}): Promise<void> {
  const note = await getNoteForLead({
    tenantId: input.context.tenantId,
    leadId: input.leadId,
    noteId: input.noteId,
  });

  if (!note) {
    throw new Error("Lead note not found.");
  }

  if (
    !canDeleteLeadNote({
      role: input.context.role,
      userId: input.context.userId,
      note: { authorUserId: note.author_user_id },
    })
  ) {
    throw new Error("Office user cannot delete lead note.");
  }

  await deleteLeadNoteById({
    tenantId: input.context.tenantId,
    leadId: input.leadId,
    noteId: input.noteId,
  });
  await createAuditLog({
    tenantId: input.context.tenantId,
    actorUserId: input.context.userId,
    action: "lead_note_deleted",
    entityType: "lead_note",
    entityId: input.noteId,
    metadata: { leadId: input.leadId },
  });
}
