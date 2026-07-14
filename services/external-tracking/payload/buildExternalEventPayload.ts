import { externalEventMappings } from "@/config/tracking";
import { sanitizeExternalPayload } from "./sanitizeExternalPayload";
import type {
  ExternalTrackingEvent,
  SanitizedExternalPayload,
} from "@/types/tracking";

export function buildExternalEventPayload(
  event: ExternalTrackingEvent,
): SanitizedExternalPayload & {
  metaEventName: string;
  ga4EventName: string;
} {
  const payload = sanitizeExternalPayload(event);
  const mapping = externalEventMappings[event.eventName];

  return {
    ...payload,
    metaEventName: mapping.meta,
    ga4EventName: mapping.ga4,
  };
}
