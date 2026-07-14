import { externalEventMappings } from "@/config/tracking";
import type { ExternalTrackingEvent } from "@/types/tracking";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: Array<Record<string, unknown> | unknown[]>;
  }
}

export function initializeGa4(measurementId: string) {
  if (!measurementId || window.gtag) {
    return;
  }

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer?.push(args);
  };
  window.gtag("js", new Date());
  window.gtag("config", measurementId, {
    send_page_view: false,
  });

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);
}

export function trackGa4BrowserEvent(event: ExternalTrackingEvent) {
  if (!window.gtag) {
    return;
  }

  const mapping = externalEventMappings[event.eventName];

  window.gtag("event", mapping.ga4, {
    event_id: event.eventId,
    source: event.metadata?.source ?? "radar_previdenciario",
    page_path: event.metadata?.page_path,
    form_version: event.metadata?.form_version,
    campaign_source: event.attribution?.utmSource ?? undefined,
    campaign_medium: event.attribution?.utmMedium ?? undefined,
    campaign_name: event.attribution?.utmCampaign ?? undefined,
  });
}
