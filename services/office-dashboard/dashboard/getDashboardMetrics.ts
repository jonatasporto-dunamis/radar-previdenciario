import "server-only";
import {
  canViewMetrics,
  normalizeLeadCommercialStatus,
} from "@/lib/office-dashboard";
import {
  listOfficeLeadRows,
  listFailedNotificationsForTenant,
  listOfficeLeadsForTenant,
} from "../repositories";
import type {
  LeadListFilters,
  OfficeUserContext,
} from "@/types/office-dashboard";

export type DashboardMetrics = {
  leadsToday: number;
  leadsLast7Days: number;
  leadsLast30Days: number;
  newLeads: number;
  awaitingReview: number;
  contacted: number;
  converted: number;
  requiresHumanReview: number;
  failedNotifications: number;
};

function daysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

export async function getDashboardMetrics(
  context: OfficeUserContext,
): Promise<DashboardMetrics> {
  if (!canViewMetrics(context.role)) {
    return {
      leadsToday: 0,
      leadsLast7Days: 0,
      leadsLast30Days: 0,
      newLeads: 0,
      awaitingReview: 0,
      contacted: 0,
      converted: 0,
      requiresHumanReview: 0,
      failedNotifications: 0,
    };
  }

  const [leads, failedNotifications, reviewList] = await Promise.all([
    listOfficeLeadRows(context.tenantId),
    listFailedNotificationsForTenant(context.tenantId),
    listOfficeLeadsForTenant({
      tenantId: context.tenantId,
      filters: {
        page: 1,
        pageSize: 50,
        requiresHumanReview: true,
      } as LeadListFilters,
    }),
  ]);
  const today = new Date().toISOString().slice(0, 10);
  const last7 = daysAgo(7);
  const last30 = daysAgo(30);

  return {
    leadsToday: leads.filter((lead) => lead.created_at?.startsWith(today))
      .length,
    leadsLast7Days: leads.filter(
      (lead) => String(lead.created_at ?? "") >= last7,
    ).length,
    leadsLast30Days: leads.filter(
      (lead) => String(lead.created_at ?? "") >= last30,
    ).length,
    newLeads: leads.filter(
      (lead) => normalizeLeadCommercialStatus(lead.status) === "new",
    ).length,
    awaitingReview: leads.filter(
      (lead) => normalizeLeadCommercialStatus(lead.status) === "in_review",
    ).length,
    contacted: leads.filter(
      (lead) => normalizeLeadCommercialStatus(lead.status) === "contacted",
    ).length,
    converted: leads.filter(
      (lead) => normalizeLeadCommercialStatus(lead.status) === "converted",
    ).length,
    requiresHumanReview: reviewList.items.filter(
      (item) => item.requiresHumanReview,
    ).length,
    failedNotifications: failedNotifications.length,
  };
}
