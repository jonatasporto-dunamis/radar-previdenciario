"use client";

import type { AnchorHTMLAttributes } from "react";
import { useTrackingConfig } from "./TrackingProvider";
import { dispatchBrowserExternalEvent } from "@/lib/tracking";

type WhatsAppClickLocation = "floating_button" | "home_cta" | "result_cta";

type TrackedWhatsAppLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  location: WhatsAppClickLocation;
};

export function TrackedWhatsAppLink({
  location,
  onClick,
  ...props
}: TrackedWhatsAppLinkProps) {
  const config = useTrackingConfig();

  return (
    <a
      {...props}
      onClick={(event) => {
        try {
          dispatchBrowserExternalEvent({
            config,
            eventName: "WhatsAppClick",
            metadata: {
              source: "contact_cta",
              location,
            },
            scope: location,
          });
        } catch {
          // Tracking is best effort and must not block contact navigation.
        }

        onClick?.(event);
      }}
    />
  );
}
