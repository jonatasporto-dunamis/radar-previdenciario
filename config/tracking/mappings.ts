import type { ExternalTrackingEventName } from "@/types/tracking";

export type ExternalEventProviderMapping = {
  meta: string;
  ga4: string;
  metaType: "standard" | "custom";
  ga4Type: "recommended" | "custom";
};

export const externalEventMappings: Record<
  ExternalTrackingEventName,
  ExternalEventProviderMapping
> = {
  PageView: {
    meta: "PageView",
    ga4: "page_view",
    metaType: "standard",
    ga4Type: "recommended",
  },
  LeadStarted: {
    meta: "LeadStarted",
    ga4: "begin_lead_form",
    metaType: "custom",
    ga4Type: "custom",
  },
  LeadSubmitted: {
    meta: "Lead",
    ga4: "generate_lead",
    metaType: "standard",
    ga4Type: "recommended",
  },
  QuizStarted: {
    meta: "QuizStarted",
    ga4: "quiz_started",
    metaType: "custom",
    ga4Type: "custom",
  },
  QuizCompleted: {
    meta: "QuizCompleted",
    ga4: "quiz_completed",
    metaType: "custom",
    ga4Type: "custom",
  },
  QualifiedLead: {
    meta: "QualifiedLead",
    ga4: "qualified_lead",
    metaType: "custom",
    ga4Type: "custom",
  },
  ResultViewed: {
    meta: "ResultViewed",
    ga4: "result_viewed",
    metaType: "custom",
    ga4Type: "custom",
  },
  WhatsAppClick: {
    meta: "Contact",
    ga4: "whatsapp_click",
    metaType: "standard",
    ga4Type: "custom",
  },
};
