import type { InternalClassification, LeadCommercialStatus } from "./leads";

export type LeadListFilters = {
  page: number;
  pageSize: number;
  search?: string;
  status?: LeadCommercialStatus;
  classification?: InternalClassification;
  templateId?: string;
  templateType?: string;
  dataCompleteness?: "complete" | "partial" | "insufficient";
  source?: string;
  utmSource?: string;
  utmCampaign?: string;
  dateFrom?: string;
  dateTo?: string;
  requiresHumanReview?: boolean;
};
