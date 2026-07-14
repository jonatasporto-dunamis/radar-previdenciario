"use client";

import { useEffect, useRef } from "react";
import { useTrackingConfig } from "./TrackingProvider";
import { dispatchBrowserExternalEvent } from "@/lib/tracking";
import type {
  ExternalTrackingEventName,
  SafeExternalMetadata,
} from "@/types/tracking";

export type ExternalBrowserEventDescriptor = {
  eventName: ExternalTrackingEventName;
  eventId: string;
  leadId?: string;
  sessionId?: string;
  resultId?: string;
  metadata?: SafeExternalMetadata;
};

export function ExternalEventBridge({
  events,
}: {
  events: ExternalBrowserEventDescriptor[];
}) {
  const config = useTrackingConfig();
  const dispatched = useRef(new Set<string>());

  useEffect(() => {
    events.forEach((event) => {
      const key = `${event.eventName}:${event.eventId}`;

      if (dispatched.current.has(key)) {
        return;
      }

      dispatched.current.add(key);
      dispatchBrowserExternalEvent({
        config,
        eventName: event.eventName,
        eventId: event.eventId,
        leadId: event.leadId,
        sessionId: event.sessionId,
        resultId: event.resultId,
        metadata: event.metadata,
        scope: event.eventId,
      });
    });
  }, [config, events]);

  return null;
}
