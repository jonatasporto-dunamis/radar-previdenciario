import "server-only";
import { listOfficeLeadsForTenant } from "../repositories";
import type {
  LeadListFilters,
  OfficeUserContext,
} from "@/types/office-dashboard";

export async function listOfficeLeads(input: {
  context: OfficeUserContext;
  filters: LeadListFilters;
}) {
  return listOfficeLeadsForTenant({
    tenantId: input.context.tenantId,
    filters: input.filters,
  });
}
