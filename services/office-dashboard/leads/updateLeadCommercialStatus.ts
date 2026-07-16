import "server-only";
import {
  canChangeLeadStatus,
  canTransitionLeadStatus,
  normalizeLeadCommercialStatus,
} from "@/lib/office-dashboard";
import { getOfficeLeadRow, updateOfficeLeadStatus } from "../repositories";
import { createAuditLog } from "../audit";
import { insertLeadStatusHistory } from "../history";
import type {
  LeadCommercialStatus,
  OfficeUserContext,
} from "@/types/office-dashboard";

export async function updateLeadCommercialStatus(input: {
  context: OfficeUserContext;
  leadId: string;
  status: LeadCommercialStatus;
  reason?: string | null;
}): Promise<void> {
  if (!canChangeLeadStatus(input.context.role)) {
    throw new Error("Office user cannot change lead status.");
  }

  const lead = await getOfficeLeadRow({
    tenantId: input.context.tenantId,
    leadId: input.leadId,
  });

  if (!lead) {
    throw new Error("Lead not found.");
  }

  const fromStatus = normalizeLeadCommercialStatus(lead.status);

  if (!canTransitionLeadStatus(fromStatus, input.status)) {
    throw new Error("Invalid lead status transition.");
  }

  await updateOfficeLeadStatus({
    tenantId: input.context.tenantId,
    leadId: input.leadId,
    status: input.status,
  });
  await insertLeadStatusHistory({
    tenantId: input.context.tenantId,
    leadId: input.leadId,
    fromStatus,
    toStatus: input.status,
    changedByUserId: input.context.userId,
    reason: input.reason,
  });
  await createAuditLog({
    tenantId: input.context.tenantId,
    actorUserId: input.context.userId,
    action: "lead_status_changed",
    entityType: "lead",
    entityId: input.leadId,
    metadata: {
      fromStatus,
      toStatus: input.status,
      hasReason: Boolean(input.reason),
    },
  });
}
