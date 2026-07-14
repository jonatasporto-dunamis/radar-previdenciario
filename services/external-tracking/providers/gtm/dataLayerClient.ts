import type { ExternalTrackingEvent } from "@/types/tracking";

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown> | unknown[]>;
  }
}

export function pushExternalEventToDataLayer(event: ExternalTrackingEvent) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: "rp_external_event",
    rp_event_name: event.eventName,
    rp_event_id: event.eventId,
    rp_event_time: event.eventTime,
    rp_source: "radar_previdenciario",
    ...(event.metadata ?? {}),
  });
}

export function getGtmBootstrapScript(containerId: string): string {
  const serializedContainerId = JSON.stringify(containerId);

  return `
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({'gtm.start': new Date().getTime(), event: 'gtm.js'});
    (function(w,d,s,l,i){var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer',${serializedContainerId});
  `;
}
