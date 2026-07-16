import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  getMissingCriticalAnswers,
  getPageCount,
  getQuizAnswerState,
  maskEmail,
  maskPhone,
  normalizeLeadCommercialStatus,
  requiresHumanReview,
} from "@/lib/office-dashboard";
import type {
  InternalClassification,
  LeadListFilters,
  OfficeLeadAttribution,
  OfficeLeadDetail,
  OfficeLeadListItem,
  OfficeLeadListResult,
  OfficeNotificationLog,
  OfficeQuizAnswer,
  OfficeQuizResult,
  OfficeTimelineItem,
} from "@/types/office-dashboard";
import type { Database } from "@/types/supabase";

type LeadRow = Database["public"]["Tables"]["leads"]["Row"];
type ResultRow = Database["public"]["Tables"]["quiz_results"]["Row"];
type AnswerRow = Database["public"]["Tables"]["quiz_answers"]["Row"];
type NotificationRow = Database["public"]["Tables"]["notification_logs"]["Row"];
type TrackingRow = Database["public"]["Tables"]["tracking_events"]["Row"];
type TemplateRow = Database["public"]["Tables"]["quiz_templates"]["Row"];
type StatusHistoryRow =
  Database["public"]["Tables"]["lead_status_history"]["Row"];
type NoteRow = Database["public"]["Tables"]["lead_notes"]["Row"];

function toClassification(value: string | null): InternalClassification | null {
  if (
    value === "alto_potencial" ||
    value === "medio_potencial" ||
    value === "baixo_potencial"
  ) {
    return value;
  }

  return null;
}

function mapAttribution(row: LeadRow): OfficeLeadAttribution {
  return {
    utmSource: row.utm_source,
    utmMedium: row.utm_medium,
    utmCampaign: row.utm_campaign,
    utmContent: row.utm_content,
    utmTerm: row.utm_term,
    campaignId: row.campaign_id,
    adsetId: row.adset_id,
    adId: row.ad_id,
    placement: row.placement,
    referrer: row.referrer,
    landingPage: row.landing_page,
  };
}

function toStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function toRecordArray(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value)
    ? value.filter(
        (item): item is Record<string, unknown> =>
          !!item && typeof item === "object" && !Array.isArray(item),
      )
    : [];
}

function toDataCompleteness(
  value: string | null,
): OfficeQuizResult["dataCompleteness"] {
  if (value === "complete" || value === "partial" || value === "insufficient") {
    return value;
  }

  return "insufficient";
}

function mapResult(
  row: ResultRow,
  templatesById: Map<string, TemplateRow>,
): OfficeQuizResult {
  const template = row.quiz_template_id
    ? templatesById.get(row.quiz_template_id)
    : null;

  return {
    id: row.id,
    sessionId: row.session_id,
    templateId: row.quiz_template_id,
    templateName: template?.name ?? null,
    templateType: row.template_type,
    templateVersion: row.quiz_template_version,
    topic: row.topic,
    potentialBenefit: row.potential_benefit,
    score: row.score,
    classification: toClassification(row.classification) ?? "baixo_potencial",
    dataCompleteness: toDataCompleteness(row.data_completeness),
    missingCriticalAnswers: toStringArray(row.missing_critical_answers),
    requiresHumanReview: row.requires_human_review,
    matchedRules: toRecordArray(row.matched_rules),
    summary: row.summary,
    ethicalDisclaimer: row.ethical_disclaimer,
    createdAt: row.created_at,
  };
}

function mapAnswer(row: AnswerRow): OfficeQuizAnswer {
  return {
    id: row.id,
    questionId: row.question_id,
    questionLabel: row.question_label,
    answerValue: row.answer_value,
    answerLabel: row.answer_label,
    benefitContext: row.benefit_context,
    answerState: getQuizAnswerState(row.answer_value, row.answer_label),
    createdAt: row.created_at,
  };
}

function mapNotification(row: NotificationRow): OfficeNotificationLog {
  return {
    id: row.id,
    provider: row.provider,
    status: row.status,
    priority: row.priority,
    attempt: row.attempt,
    queuedAt: row.queued_at,
    sentAt: row.sent_at,
    failedAt: row.failed_at,
    lastError: row.last_error ?? row.error_message,
    createdAt: row.created_at,
  };
}

function matchesFilters(input: {
  lead: LeadRow;
  result: OfficeQuizResult | null;
  answers: OfficeQuizAnswer[];
  filters: LeadListFilters;
}): boolean {
  const { lead, result, answers, filters } = input;
  const normalizedSearch = filters.search?.toLowerCase();

  if (
    filters.status &&
    normalizeLeadCommercialStatus(lead.status) !== filters.status
  ) {
    return false;
  }

  if (
    filters.classification &&
    result?.classification !== filters.classification
  ) {
    return false;
  }

  if (filters.templateId && result?.templateId !== filters.templateId) {
    return false;
  }

  if (filters.templateType && result?.templateType !== filters.templateType) {
    return false;
  }

  if (
    filters.dataCompleteness &&
    result?.dataCompleteness !== filters.dataCompleteness
  ) {
    return false;
  }

  if (filters.utmSource && lead.utm_source !== filters.utmSource) {
    return false;
  }

  if (filters.utmCampaign && lead.utm_campaign !== filters.utmCampaign) {
    return false;
  }

  if (
    filters.source &&
    lead.utm_source !== filters.source &&
    lead.site_source_name !== filters.source
  ) {
    return false;
  }

  if (
    filters.dateFrom &&
    String(lead.created_at ?? "") < `${filters.dateFrom}T00:00:00`
  ) {
    return false;
  }

  if (
    filters.dateTo &&
    String(lead.created_at ?? "") > `${filters.dateTo}T23:59:59`
  ) {
    return false;
  }

  if (
    typeof filters.requiresHumanReview === "boolean" &&
    requiresHumanReview({ result, answers }) !== filters.requiresHumanReview
  ) {
    return false;
  }

  if (normalizedSearch) {
    const haystack =
      `${lead.full_name} ${lead.email} ${lead.phone}`.toLowerCase();
    return haystack.includes(normalizedSearch);
  }

  return true;
}

async function getLatestResultsByLead(
  tenantId: string,
  templatesById: Map<string, TemplateRow>,
): Promise<Map<string, OfficeQuizResult>> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("quiz_results")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Unable to load office lead results.");
  }

  return (data ?? []).reduce<Map<string, OfficeQuizResult>>((acc, row) => {
    if (row.lead_id && !acc.has(row.lead_id)) {
      acc.set(row.lead_id, mapResult(row, templatesById));
    }

    return acc;
  }, new Map());
}

async function getTemplatesById(): Promise<Map<string, TemplateRow>> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from("quiz_templates").select("*");

  if (error) {
    throw new Error("Unable to load office quiz templates.");
  }

  return new Map((data ?? []).map((template) => [template.id, template]));
}

async function getAnswersByLead(
  tenantId: string,
): Promise<Map<string, OfficeQuizAnswer[]>> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("quiz_answers")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error("Unable to load office lead answers.");
  }

  return (data ?? []).reduce<Map<string, OfficeQuizAnswer[]>>((acc, row) => {
    if (!row.lead_id) {
      return acc;
    }

    const answers = acc.get(row.lead_id) ?? [];
    answers.push(mapAnswer(row));
    acc.set(row.lead_id, answers);

    return acc;
  }, new Map());
}

export async function listOfficeLeadRows(tenantId: string): Promise<LeadRow[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Unable to list office leads.");
  }

  return data ?? [];
}

export async function listOfficeLeadsForTenant(input: {
  tenantId: string;
  filters: LeadListFilters;
}): Promise<OfficeLeadListResult> {
  const templatesById = await getTemplatesById();
  const [leads, resultsByLead, answersByLead] = await Promise.all([
    listOfficeLeadRows(input.tenantId),
    getLatestResultsByLead(input.tenantId, templatesById),
    getAnswersByLead(input.tenantId),
  ]);

  const filtered = leads.filter((lead) =>
    matchesFilters({
      lead,
      result: resultsByLead.get(lead.id) ?? null,
      answers: answersByLead.get(lead.id) ?? [],
      filters: input.filters,
    }),
  );
  const total = filtered.length;
  const start = (input.filters.page - 1) * input.filters.pageSize;
  const pageRows = filtered.slice(start, start + input.filters.pageSize);

  return {
    items: pageRows.map<OfficeLeadListItem>((lead) => {
      const result = resultsByLead.get(lead.id) ?? null;
      const answers = answersByLead.get(lead.id) ?? [];

      return {
        id: lead.id,
        createdAt: lead.created_at,
        fullName: lead.full_name,
        maskedEmail: maskEmail(lead.email),
        maskedPhone: maskPhone(lead.phone),
        commercialStatus: normalizeLeadCommercialStatus(lead.status),
        potentialBenefit: result?.potentialBenefit ?? null,
        templateName: result?.templateName ?? null,
        templateType: result?.templateType ?? null,
        templateVersion: result?.templateVersion ?? null,
        dataCompleteness: result?.dataCompleteness ?? null,
        classification: result?.classification ?? null,
        score: result?.score ?? null,
        requiresHumanReview: requiresHumanReview({ result, answers }),
        source: lead.utm_source ?? lead.site_source_name,
        utmCampaign: lead.utm_campaign,
      };
    }),
    total,
    page: input.filters.page,
    pageSize: input.filters.pageSize,
    pageCount: getPageCount(total, input.filters.pageSize),
  };
}

export async function getOfficeLeadRow(input: {
  tenantId: string;
  leadId: string;
}): Promise<LeadRow | null> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("tenant_id", input.tenantId)
    .eq("id", input.leadId)
    .maybeSingle();

  if (error) {
    throw new Error("Unable to load office lead.");
  }

  return data;
}

export async function updateOfficeLeadStatus(input: {
  tenantId: string;
  leadId: string;
  status: string;
}): Promise<void> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("leads")
    .update({ status: input.status })
    .eq("tenant_id", input.tenantId)
    .eq("id", input.leadId);

  if (error) {
    throw new Error("Unable to update office lead status.");
  }
}

async function listLeadAnswers(input: {
  tenantId: string;
  leadId: string;
}): Promise<OfficeQuizAnswer[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("quiz_answers")
    .select("*")
    .eq("tenant_id", input.tenantId)
    .eq("lead_id", input.leadId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error("Unable to load office lead quiz answers.");
  }

  return (data ?? []).map(mapAnswer);
}

async function getLatestLeadResult(input: {
  tenantId: string;
  leadId: string;
}): Promise<OfficeQuizResult | null> {
  const supabase = createSupabaseAdminClient();
  const templatesById = await getTemplatesById();
  const { data, error } = await supabase
    .from("quiz_results")
    .select("*")
    .eq("tenant_id", input.tenantId)
    .eq("lead_id", input.leadId)
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) {
    throw new Error("Unable to load office lead result.");
  }

  return data?.[0] ? mapResult(data[0], templatesById) : null;
}

async function listLeadNotifications(input: {
  tenantId: string;
  leadId: string;
}): Promise<OfficeNotificationLog[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("notification_logs")
    .select("*")
    .eq("tenant_id", input.tenantId)
    .eq("lead_id", input.leadId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Unable to load office lead notifications.");
  }

  return (data ?? []).map(mapNotification);
}

async function listTrackingTimeline(input: {
  tenantId: string;
  leadId: string;
}): Promise<OfficeTimelineItem[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("tracking_events")
    .select("*")
    .eq("tenant_id", input.tenantId)
    .eq("lead_id", input.leadId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Unable to load office tracking timeline.");
  }

  return (data ?? []).map((event: TrackingRow) => ({
    id: event.id,
    type: "tracking",
    label: event.event_name,
    description: "Evento interno registrado.",
    createdAt: event.created_at,
  }));
}

async function listStatusTimeline(input: {
  tenantId: string;
  leadId: string;
}): Promise<OfficeTimelineItem[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("lead_status_history")
    .select("*")
    .eq("tenant_id", input.tenantId)
    .eq("lead_id", input.leadId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Unable to load office status timeline.");
  }

  return (data ?? []).map((item: StatusHistoryRow) => ({
    id: item.id,
    type: "status",
    label: "Status comercial alterado",
    description: `${item.from_status ?? "sem status"} -> ${item.to_status}`,
    createdAt: item.created_at,
  }));
}

async function listNoteTimeline(input: {
  tenantId: string;
  leadId: string;
}): Promise<OfficeTimelineItem[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("lead_notes")
    .select("*")
    .eq("tenant_id", input.tenantId)
    .eq("lead_id", input.leadId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Unable to load office note timeline.");
  }

  return (data ?? []).map((item: NoteRow) => ({
    id: item.id,
    type: "note",
    label: "Nota interna criada",
    createdAt: item.created_at,
  }));
}

export async function getOfficeLeadDetail(input: {
  tenantId: string;
  tenantName: string;
  leadId: string;
}): Promise<OfficeLeadDetail | null> {
  const lead = await getOfficeLeadRow(input);

  if (!lead) {
    return null;
  }

  const [answers, latestResult, notifications, tracking, status, notes] =
    await Promise.all([
      listLeadAnswers(input),
      getLatestLeadResult(input),
      listLeadNotifications(input),
      listTrackingTimeline(input),
      listStatusTimeline(input),
      listNoteTimeline(input),
    ]);
  const unknownAnswers = answers
    .filter((answer) => answer.answerState === "unknown")
    .map((answer) => answer.questionLabel);
  const withheldAnswers = answers
    .filter((answer) => answer.answerState === "withheld")
    .map((answer) => answer.questionLabel);

  return {
    id: lead.id,
    tenantId: lead.tenant_id,
    tenantName: input.tenantName,
    fullName: lead.full_name,
    email: lead.email,
    phone: lead.phone,
    createdAt: lead.created_at,
    updatedAt: lead.updated_at,
    commercialStatus: normalizeLeadCommercialStatus(lead.status),
    attribution: mapAttribution(lead),
    latestResult,
    quizAnswers: answers,
    notifications,
    timeline: [...tracking, ...status, ...notes].sort((a, b) =>
      String(b.createdAt ?? "").localeCompare(String(a.createdAt ?? "")),
    ),
    missingCriticalAnswers: getMissingCriticalAnswers(answers),
    unknownAnswers,
    withheldAnswers,
    requiresHumanReview: requiresHumanReview({ result: latestResult, answers }),
  };
}

export async function listFailedNotificationsForTenant(
  tenantId: string,
): Promise<OfficeNotificationLog[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("notification_logs")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("status", "failed")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Unable to load failed notifications.");
  }

  return (data ?? []).map(mapNotification);
}
