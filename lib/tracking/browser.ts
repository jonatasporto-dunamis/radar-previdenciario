"use client";

import { recordBrowserExternalDeliveryAction } from "@/app/tracking/actions";
import { externalEventMappings } from "@/config/tracking";
import { getSafeAttributionFromSession } from "./attribution";
import { readTrackingConsent } from "./cookies";
import { createExternalEventId } from "@/services/external-tracking/event-id";
import { trackGa4BrowserEvent } from "@/services/external-tracking/providers/ga4/browser";
import { trackMetaBrowserEvent } from "@/services/external-tracking/providers/meta/browser";
import { pushExternalEventToDataLayer } from "@/services/external-tracking/providers/gtm";
import type {
  ExternalTrackingEvent,
  ExternalTrackingEventName,
  SafeExternalMetadata,
} from "@/types/tracking";

export type PublicTrackingConfig = {
  enabled: boolean;
  consentRequired: boolean;
  meta: {
    enabled: boolean;
    pixelId?: string;
  };
  ga4: {
    enabled: boolean;
    measurementId?: string;
  };
  gtm: {
    enabled: boolean;
    containerId?: string;
  };
  events: Record<
    ExternalTrackingEventName,
    {
      enabled: boolean;
      browser: boolean;
    }
  >;
};

function getPagePath() {
  return window.location.pathname;
}

function shouldTrack(
  config: PublicTrackingConfig,
  eventName: ExternalTrackingEventName,
) {
  const eventConfig = config.events[eventName];

  if (!config.enabled || !eventConfig?.enabled || !eventConfig.browser) {
    return false;
  }

  if (config.consentRequired && readTrackingConsent() !== "granted") {
    return false;
  }

  return true;
}

export function getOrCreateBrowserEventId(
  eventName: ExternalTrackingEventName,
  scope: string,
): string {
  const key = `rp_external_event_id:${eventName}:${scope}`;
  const existing = window.sessionStorage.getItem(key);

  if (existing) {
    return existing;
  }

  const eventId = createExternalEventId(eventName);
  window.sessionStorage.setItem(key, eventId);

  return eventId;
}

export function dispatchBrowserExternalEvent(input: {
  config: PublicTrackingConfig;
  eventName: ExternalTrackingEventName;
  eventId?: string;
  leadId?: string;
  sessionId?: string;
  resultId?: string;
  metadata?: SafeExternalMetadata;
  scope?: string;
}) {
  if (!shouldTrack(input.config, input.eventName)) {
    return;
  }

  const eventId =
    input.eventId ??
    getOrCreateBrowserEventId(input.eventName, input.scope ?? getPagePath());
  const event: ExternalTrackingEvent = {
    eventName: input.eventName,
    eventId,
    eventTime: Math.floor(Date.now() / 1000),
    eventSourceUrl: `${window.location.origin}${window.location.pathname}`,
    leadId: input.leadId,
    sessionId: input.sessionId,
    resultId: input.resultId,
    attribution: getSafeAttributionFromSession(),
    metadata: {
      source: "browser",
      page_path: getPagePath(),
      ...(input.metadata ?? {}),
    },
  };

  pushExternalEventToDataLayer(event);

  if (input.config.meta.enabled) {
    trackMetaBrowserEvent(event);
  }

  if (input.config.ga4.enabled && !input.config.gtm.enabled) {
    trackGa4BrowserEvent(event);
  }

  const mapping = externalEventMappings[input.eventName];

  void recordBrowserExternalDeliveryAction({
    eventName: input.eventName,
    eventId,
    leadId: input.leadId,
    sessionId: input.sessionId,
    resultId: input.resultId,
    providers: [
      input.config.gtm.enabled ? "gtm" : null,
      input.config.meta.enabled ? "meta_pixel" : null,
      input.config.ga4.enabled && !input.config.gtm.enabled ? "ga4" : null,
    ].filter((provider): provider is "gtm" | "meta_pixel" | "ga4" =>
      Boolean(provider),
    ),
    requestPayloadHashSource: JSON.stringify({
      eventName: mapping.ga4,
      eventId,
      pagePath: getPagePath(),
    }),
  }).catch(() => undefined);
}
