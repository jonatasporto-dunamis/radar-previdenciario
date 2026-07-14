import { z } from "zod";

export const externalTrackingEventNameSchema = z.enum([
  "PageView",
  "LeadStarted",
  "LeadSubmitted",
  "QuizStarted",
  "QuizCompleted",
  "QualifiedLead",
  "ResultViewed",
  "WhatsAppClick",
]);

export const externalTrackingProviderSchema = z.enum([
  "meta_pixel",
  "meta_capi",
  "ga4",
  "gtm",
]);

export const externalTrackingChannelSchema = z.enum(["browser", "server"]);

export const externalTrackingDeliveryStatusSchema = z.enum([
  "pending",
  "processing",
  "sent",
  "failed",
  "retrying",
  "ignored",
  "cancelled",
]);

export const externalEventIdSchema = z
  .string()
  .regex(/^rp_[A-Za-z]+_[0-9a-fA-F-]{36}$/);

export const safeExternalMetadataSchema = z
  .object({
    source: z.string().optional(),
    form_version: z.string().optional(),
    page_path: z.string().optional(),
    page_title: z.string().optional(),
    content_name: z.string().optional(),
    content_category: z.string().optional(),
    location: z.enum(["floating_button", "home_cta", "result_cta"]).optional(),
    qualified: z.boolean().optional(),
    campaign_source: z.string().optional(),
    campaign_medium: z.string().optional(),
    campaign_name: z.string().optional(),
  })
  .strict();

export const externalTrackingEventSchema = z.object({
  eventName: externalTrackingEventNameSchema,
  eventId: externalEventIdSchema,
  eventTime: z.number().int().positive(),
  eventSourceUrl: z.string().url().optional(),
  leadId: z.string().uuid().optional(),
  sessionId: z.string().uuid().optional(),
  resultId: z.string().uuid().optional(),
  metadata: safeExternalMetadataSchema.optional(),
});

export const externalTrackingDeliveryInsertSchema = z.object({
  tracking_event_id: z.string().uuid().nullable().optional(),
  lead_id: z.string().uuid().nullable().optional(),
  session_id: z.string().uuid().nullable().optional(),
  result_id: z.string().uuid().nullable().optional(),
  event_name: externalTrackingEventNameSchema,
  event_id: externalEventIdSchema,
  provider: externalTrackingProviderSchema,
  channel: externalTrackingChannelSchema,
  status: externalTrackingDeliveryStatusSchema.optional(),
  attempt: z.number().int().min(0).optional(),
  test_event: z.boolean().optional(),
  request_payload_hash: z.string().length(64).nullable().optional(),
  provider_event_id: z.string().nullable().optional(),
  queued_at: z.string().datetime().nullable().optional(),
  processing_started_at: z.string().datetime().nullable().optional(),
  sent_at: z.string().datetime().nullable().optional(),
  failed_at: z.string().datetime().nullable().optional(),
  last_error: z.string().max(1000).nullable().optional(),
});

export const externalTrackingDeliveryUpdateSchema =
  externalTrackingDeliveryInsertSchema.partial();
