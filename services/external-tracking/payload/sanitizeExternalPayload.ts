import { safeExternalMetadataSchema } from "@/lib/validations/external-tracking";
import type {
  ExternalTrackingEvent,
  SafeExternalMetadata,
  SanitizedExternalPayload,
} from "@/types/tracking";

const blockedKeys = new Set([
  "name",
  "full_name",
  "email",
  "phone",
  "benefit",
  "potential_benefit",
  "classification",
  "score",
  "answer",
  "answers",
  "question",
  "questions",
  "income",
  "disability",
  "health",
  "diagnosis",
  "pregnancy",
  "cpf",
  "document",
  "summary",
]);

function assertNoSensitiveKey(metadata: SafeExternalMetadata): void {
  for (const key of Object.keys(metadata)) {
    if (blockedKeys.has(key.toLowerCase())) {
      throw new Error("External tracking payload contains sensitive metadata.");
    }
  }
}

export function sanitizeExternalMetadata(
  metadata: SafeExternalMetadata = {},
): SafeExternalMetadata {
  assertNoSensitiveKey(metadata);

  return safeExternalMetadataSchema.parse(metadata);
}

export function sanitizeExternalPayload(
  event: ExternalTrackingEvent,
): SanitizedExternalPayload {
  const metadata = sanitizeExternalMetadata(event.metadata);
  const attribution = event.attribution ?? {};

  return {
    event_name: event.eventName,
    event_id: event.eventId,
    event_time: event.eventTime,
    event_source_url: event.eventSourceUrl,
    source: "radar_previdenciario",
    metadata,
    attribution: {
      utmSource: attribution.utmSource ?? null,
      utmMedium: attribution.utmMedium ?? null,
      utmCampaign: attribution.utmCampaign ?? null,
      utmContent: attribution.utmContent ?? null,
      utmTerm: attribution.utmTerm ?? null,
      campaignId: attribution.campaignId ?? null,
      adsetId: attribution.adsetId ?? null,
      adId: attribution.adId ?? null,
      placement: attribution.placement ?? null,
      siteSourceName: attribution.siteSourceName ?? null,
      referrer: attribution.referrer ?? null,
      landingPage: attribution.landingPage ?? null,
    },
  };
}
