import { z } from "zod";
import { normalizePage, normalizePageSize } from "./pagination";
import { leadCommercialStatuses } from "./statuses";
import type { LeadListFilters } from "@/types/office-dashboard";

const classificationSchema = z.enum([
  "alto_potencial",
  "medio_potencial",
  "baixo_potencial",
]);
const dataCompletenessSchema = z.enum(["complete", "partial", "insufficient"]);
const booleanFilterSchema = z
  .enum(["true", "false"])
  .transform((value) => value === "true");

export const leadListFilterSchema = z
  .object({
    page: z.coerce.number().int().positive().optional(),
    pageSize: z.coerce.number().int().positive().optional(),
    search: z.string().trim().max(80).optional(),
    status: z.enum(leadCommercialStatuses).optional(),
    classification: classificationSchema.optional(),
    templateId: z.string().trim().uuid().optional(),
    templateType: z.string().trim().max(80).optional(),
    dataCompleteness: dataCompletenessSchema.optional(),
    source: z.string().trim().max(80).optional(),
    utmSource: z.string().trim().max(80).optional(),
    utmCampaign: z.string().trim().max(120).optional(),
    dateFrom: z.string().trim().max(10).optional(),
    dateTo: z.string().trim().max(10).optional(),
    requiresHumanReview: booleanFilterSchema.optional(),
  })
  .strict();

function readParam(searchParams: URLSearchParams, key: string) {
  const value = searchParams.get(key);

  return value === "" ? undefined : (value ?? undefined);
}

export function parseLeadListFilters(
  searchParams: URLSearchParams,
): LeadListFilters {
  const parsed = leadListFilterSchema.safeParse({
    page: readParam(searchParams, "page"),
    pageSize: readParam(searchParams, "pageSize"),
    search: readParam(searchParams, "search"),
    status: readParam(searchParams, "status"),
    classification: readParam(searchParams, "classification"),
    templateId: readParam(searchParams, "templateId"),
    templateType: readParam(searchParams, "templateType"),
    dataCompleteness: readParam(searchParams, "dataCompleteness"),
    source: readParam(searchParams, "source"),
    utmSource: readParam(searchParams, "utmSource"),
    utmCampaign: readParam(searchParams, "utmCampaign"),
    dateFrom: readParam(searchParams, "dateFrom"),
    dateTo: readParam(searchParams, "dateTo"),
    requiresHumanReview: readParam(searchParams, "requiresHumanReview"),
  });

  const data = parsed.success ? parsed.data : {};

  return {
    page: normalizePage(data.page),
    pageSize: normalizePageSize(data.pageSize),
    search: data.search,
    status: data.status,
    classification: data.classification,
    templateId: data.templateId,
    templateType: data.templateType,
    dataCompleteness: data.dataCompleteness,
    source: data.source,
    utmSource: data.utmSource,
    utmCampaign: data.utmCampaign,
    dateFrom: data.dateFrom,
    dateTo: data.dateTo,
    requiresHumanReview: data.requiresHumanReview,
  };
}
