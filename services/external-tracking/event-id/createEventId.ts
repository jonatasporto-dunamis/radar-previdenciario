import type { ExternalTrackingEventName } from "@/types/tracking";

export function createExternalEventId(
  eventName: ExternalTrackingEventName,
): string {
  return `rp_${eventName}_${crypto.randomUUID()}`;
}
