import { createExternalEventId } from "./createEventId";
import type { ExternalTrackingEventName } from "@/types/tracking";

export function resolveExternalEventId(input: {
  eventName: ExternalTrackingEventName;
  eventId?: string | null;
}): string {
  return input.eventId || createExternalEventId(input.eventName);
}
