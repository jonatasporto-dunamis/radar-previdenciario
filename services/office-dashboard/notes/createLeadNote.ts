import "server-only";
import { canCreateLeadNote } from "@/lib/office-dashboard";
import { getOfficeLeadRow, insertLeadNote } from "../repositories";
import { createAuditLog } from "../audit";
import type { OfficeUserContext } from "@/types/office-dashboard";

export async function createLeadNote(input: {
  context: OfficeUserContext;
  leadId: string;
  body: string;
}) {
  if (!canCreateLeadNote(input.context.role)) {
    throw new Error("Office user cannot create lead note.");
  }

  const lead = await getOfficeLeadRow({
    tenantId: input.context.tenantId,
    leadId: input.leadId,
  });

  if (!lead) {
    throw new Error("Lead not found.");
  }

  const note = await insertLeadNote({
    tenantId: input.context.tenantId,
    leadId: input.leadId,
    authorUserId: input.context.userId,
    body: input.body,
  });

  await createAuditLog({
    tenantId: input.context.tenantId,
    actorUserId: input.context.userId,
    action: "lead_note_created",
    entityType: "lead_note",
    entityId: note.id,
    metadata: { leadId: input.leadId, bodyLength: input.body.length },
  });

  return note;
}
