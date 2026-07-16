import { createHash } from "node:crypto";
import type { LeadQualification } from "@/services/qualification";
import type { NotificationProvider } from "@/types/database";
import type { Database } from "@/types/supabase";
import type { QuizAnswerMap, QuizResultComputation } from "@/types/quiz";

type LeadRow = Database["public"]["Tables"]["leads"]["Row"];
type QuizResultRow = Database["public"]["Tables"]["quiz_results"]["Row"];

export type LeadNotificationPayload = {
  lead: {
    id: string;
    fullName: string;
    phone: string;
    email: string;
  };
  result: {
    id: string;
    benefit: string;
    classification: string;
    score: number;
    summary: string;
    dataCompleteness: string;
    requiresHumanReview: boolean;
    missingCriticalAnswers: string[];
  };
  answers: Array<{
    questionId: string;
    question: string;
    answer: string;
    benefitContext: string | null;
  }>;
  attribution: {
    utmSource: string | null;
    utmMedium: string | null;
    utmCampaign: string | null;
    utmContent: string | null;
    campaignId: string | null;
    adsetId: string | null;
    adId: string | null;
    placement: string | null;
    referrer: string | null;
    landingPage: string | null;
  };
  generatedAt: string;
  whatsappUrl: string;
  qualification: LeadQualification;
};

export type BuildLeadNotificationPayloadInput = {
  lead: LeadRow;
  result: QuizResultRow;
  computedResult: QuizResultComputation;
  answers: QuizAnswerMap;
  qualification: LeadQualification;
  generatedAt?: string;
};

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`;
  }

  if (value && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => `${JSON.stringify(key)}:${stableStringify(item)}`)
      .join(",")}}`;
  }

  return JSON.stringify(value);
}

function normalizePhoneForWhatsapp(phone: string): string {
  return phone.replace(/\D/g, "");
}

export function buildLeadWhatsappUrl(lead: Pick<LeadRow, "phone">) {
  const phone = normalizePhoneForWhatsapp(lead.phone);

  return `https://wa.me/${phone}`;
}

export function buildLeadNotificationPayload({
  lead,
  result,
  computedResult,
  answers,
  qualification,
  generatedAt = new Date().toISOString(),
}: BuildLeadNotificationPayloadInput): LeadNotificationPayload {
  return {
    lead: {
      id: lead.id,
      fullName: lead.full_name,
      phone: lead.phone,
      email: lead.email,
    },
    result: {
      id: result.id,
      benefit:
        computedResult.potentialBenefit ??
        result.potential_benefit ??
        "Triagem previdenciaria",
      classification: computedResult.classification,
      score: computedResult.score,
      summary: computedResult.summary,
      dataCompleteness: computedResult.dataCompleteness,
      requiresHumanReview: computedResult.requiresHumanReview,
      missingCriticalAnswers: computedResult.missingCriticalAnswers,
    },
    answers: Object.values(answers).map((answer) => ({
      questionId: answer.questionId,
      question: answer.questionLabel,
      answer: answer.answerLabel,
      benefitContext: answer.benefitContext,
    })),
    attribution: {
      utmSource: lead.utm_source,
      utmMedium: lead.utm_medium,
      utmCampaign: lead.utm_campaign,
      utmContent: lead.utm_content,
      campaignId: lead.campaign_id,
      adsetId: lead.adset_id,
      adId: lead.ad_id,
      placement: lead.placement,
      referrer: lead.referrer,
      landingPage: lead.landing_page,
    },
    generatedAt,
    whatsappUrl: buildLeadWhatsappUrl(lead),
    qualification,
  };
}

export function computeNotificationPayloadHash(input: {
  tenantId: string;
  provider: NotificationProvider;
  recipient: string;
  leadId: string;
  resultId: string;
  template: string;
}): string {
  return createHash("sha256").update(stableStringify(input)).digest("hex");
}
