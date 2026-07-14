"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useTrackingConfig } from "./TrackingProvider";
import { dispatchBrowserExternalEvent } from "@/lib/tracking";

export function TrackingPageView() {
  const pathname = usePathname();
  const config = useTrackingConfig();
  const lastPathRef = useRef<string | null>(null);
  const [consentVersion, setConsentVersion] = useState(0);

  useEffect(() => {
    function refreshConsent() {
      lastPathRef.current = null;
      setConsentVersion((current) => current + 1);
    }

    window.addEventListener("rp-tracking-consent-change", refreshConsent);

    return () => {
      window.removeEventListener("rp-tracking-consent-change", refreshConsent);
    };
  }, []);

  useEffect(() => {
    if (lastPathRef.current === pathname) {
      return;
    }

    lastPathRef.current = pathname;
    dispatchBrowserExternalEvent({
      config,
      eventName: "PageView",
      metadata: {
        source: "page_view",
        page_path: pathname,
      },
      scope: pathname,
    });
  }, [config, consentVersion, pathname]);

  return null;
}
