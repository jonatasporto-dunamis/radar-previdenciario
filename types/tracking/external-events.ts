import type { AttributionData } from "@/types/attribution";

export type ExternalTrackingEventName =
  | "PageView"
  | "LeadStarted"
  | "LeadSubmitted"
  | "QuizStarted"
  | "QuizCompleted"
  | "QualifiedLead"
  | "ResultViewed"
  | "WhatsAppClick";

export type SafeAttributionData = Pick<
  AttributionData,
  | "utmSource"
  | "utmMedium"
  | "utmCampaign"
  | "utmContent"
  | "utmTerm"
  | "campaignId"
  | "adsetId"
  | "adId"
  | "placement"
  | "siteSourceName"
  | "referrer"
  | "landingPage"
  | "fbclid"
>;

export type SafeExternalMetadata = Record<
  string,
  string | number | boolean | null
>;

export interface ExternalTrackingEvent {
  eventName: ExternalTrackingEventName;
  eventId: string;
  eventTime: number;
  eventSourceUrl?: string;
  leadId?: string;
  sessionId?: string;
  resultId?: string;
  attribution?: SafeAttributionData;
  metadata?: SafeExternalMetadata;
}

export type SanitizedExternalPayload = {
  event_name: ExternalTrackingEventName;
  event_id: string;
  event_time: number;
  event_source_url?: string;
  source: "radar_previdenciario";
  metadata: SafeExternalMetadata;
  attribution: Omit<SafeAttributionData, "fbclid">;
};
