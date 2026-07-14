import "server-only";
import { trackEventOnce } from "@/services/tracking";
import type { AttributionData } from "@/types/attribution";
import type { QuizResultComputation } from "@/types/quiz";

export type ResultTrackingContext = {
  userAgent?: string | null;
  ipAddress?: string | null;
};

export async function trackResultGeneratedOnce(input: {
  leadId: string;
  sessionId: string;
  resultId: string;
  result: QuizResultComputation;
  rulesVersion: number;
  attribution?: AttributionData;
  context?: ResultTrackingContext;
}): Promise<boolean> {
  return trackEventOnce({
    leadId: input.leadId,
    sessionId: input.sessionId,
    eventName: "ResultGenerated",
    eventPayload: {
      classification: input.result.classification,
      potentialBenefit: input.result.potentialBenefit,
      rulesVersion: input.rulesVersion,
      source: "rule_engine",
    },
    attribution: input.attribution,
    userAgent: input.context?.userAgent ?? null,
    ipAddress: input.context?.ipAddress ?? null,
  });
}

export async function trackResultViewedOnce(input: {
  leadId: string;
  sessionId?: string | null;
  resultId: string;
  classification: string;
  potentialBenefit?: string | null;
  externalEventId?: string;
  attribution?: AttributionData;
  context?: ResultTrackingContext;
}): Promise<boolean> {
  return trackEventOnce({
    leadId: input.leadId,
    sessionId: input.sessionId ?? null,
    eventName: "ResultViewed",
    eventPayload: {
      resultId: input.resultId,
      classification: input.classification,
      potentialBenefit: input.potentialBenefit ?? null,
      source: "result_page",
      ...(input.externalEventId
        ? { external_event_id: input.externalEventId }
        : {}),
    },
    eventPayloadContains: {
      resultId: input.resultId,
    },
    attribution: input.attribution,
    userAgent: input.context?.userAgent ?? null,
    ipAddress: input.context?.ipAddress ?? null,
  });
}
