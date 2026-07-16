import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  leadCommercialStatusLabels,
  normalizeLeadCommercialStatus,
} from "@/lib/office-dashboard";
import type { LeadCommercialStatus } from "@/types/office-dashboard";

export type LeadStatusHistoryItem = {
  id: string;
  fromStatus: LeadCommercialStatus | null;
  toStatus: LeadCommercialStatus;
  fromLabel: string;
  toLabel: string;
  reason: string | null;
  changedByUserId: string;
  createdAt: string;
};

export async function listLeadStatusHistory(input: {
  tenantId: string;
  leadId: string;
}): Promise<LeadStatusHistoryItem[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("lead_status_history")
    .select("*")
    .eq("tenant_id", input.tenantId)
    .eq("lead_id", input.leadId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Unable to list lead status history.");
  }

  return (data ?? []).map((row) => {
    const fromStatus = row.from_status
      ? normalizeLeadCommercialStatus(row.from_status)
      : null;
    const toStatus = normalizeLeadCommercialStatus(row.to_status);

    return {
      id: row.id,
      fromStatus,
      toStatus,
      fromLabel: fromStatus
        ? leadCommercialStatusLabels[fromStatus]
        : "Sem status",
      toLabel: leadCommercialStatusLabels[toStatus],
      reason: row.reason,
      changedByUserId: row.changed_by_user_id,
      createdAt: row.created_at,
    };
  });
}

export async function insertLeadStatusHistory(input: {
  tenantId: string;
  leadId: string;
  fromStatus: LeadCommercialStatus | null;
  toStatus: LeadCommercialStatus;
  changedByUserId: string;
  reason?: string | null;
}): Promise<void> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("lead_status_history").insert({
    tenant_id: input.tenantId,
    lead_id: input.leadId,
    from_status: input.fromStatus,
    to_status: input.toStatus,
    changed_by_user_id: input.changedByUserId,
    reason: input.reason ?? null,
  });

  if (error) {
    throw new Error("Unable to create lead status history.");
  }
}
