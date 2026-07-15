import "server-only";
import { getOfficeLeadDetail } from "../repositories";
import type { OfficeUserContext } from "@/types/office-dashboard";

export async function getOfficeLead(input: {
  context: OfficeUserContext;
  leadId: string;
}) {
  return getOfficeLeadDetail({
    tenantId: input.context.tenantId,
    tenantName: input.context.tenantName,
    leadId: input.leadId,
  });
}
