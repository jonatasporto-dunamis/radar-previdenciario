import "server-only";
import { canEditLeadNote } from "@/lib/office-dashboard";
import { getNoteForLead, updateLeadNoteBody } from "../repositories";
import { createAuditLog } from "../audit";
import type { OfficeUserContext } from "@/types/office-dashboard";

export async function updateLeadNote(input: {
  context: OfficeUserContext;
  leadId: string;
  noteId: string;
  body: string;
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
    !canEditLeadNote({
      role: input.context.role,
      userId: input.context.userId,
      note: { authorUserId: note.author_user_id },
    })
  ) {
    throw new Error("Office user cannot update lead note.");
  }

  await updateLeadNoteBody({
    tenantId: input.context.tenantId,
    leadId: input.leadId,
    noteId: input.noteId,
    body: input.body,
  });
  await createAuditLog({
    tenantId: input.context.tenantId,
    actorUserId: input.context.userId,
    action: "lead_note_updated",
    entityType: "lead_note",
    entityId: input.noteId,
    metadata: { leadId: input.leadId, bodyLength: input.body.length },
  });
}
