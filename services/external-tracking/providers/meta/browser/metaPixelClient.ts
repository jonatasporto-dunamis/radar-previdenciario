import { externalEventMappings } from "@/config/tracking";
import type { ExternalTrackingEvent } from "@/types/tracking";

type MetaFbq = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[][];
  loaded: boolean;
  version: string;
};

declare global {
  interface Window {
    fbq?: MetaFbq;
    _fbq?: unknown;
  }
}

export function initializeMetaPixel(pixelId: string) {
  if (!pixelId || window.fbq) {
    return;
  }

  const fbq = ((...args: unknown[]) => {
    if (fbq.callMethod) {
      fbq.callMethod(...args);
      return;
    }

    fbq.queue.push(args);
  }) as MetaFbq;

  fbq.queue = [];
  fbq.loaded = true;
  fbq.version = "2.0";
  window.fbq = fbq;
  window._fbq = fbq;

  const script = document.createElement("script");
  script.async = true;
  script.src = "https://connect.facebook.net/en_US/fbevents.js";
  document.head.appendChild(script);
  window.fbq("init", pixelId, {}, { autoConfig: false });
}

export function trackMetaBrowserEvent(event: ExternalTrackingEvent) {
  const mapping = externalEventMappings[event.eventName];

  if (!window.fbq) {
    return;
  }

  if (event.eventName === "PageView") {
    window.fbq("track", "PageView", {}, { eventID: event.eventId });
    return;
  }

  window.fbq(
    "track",
    mapping.meta,
    {
      content_name: "Radar Previdenciário",
      content_category: "lead_generation",
      source: event.metadata?.source ?? "web",
    },
    { eventID: event.eventId },
  );
}
