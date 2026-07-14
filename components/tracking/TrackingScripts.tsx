"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { useTrackingConfig } from "./TrackingProvider";
import { readTrackingConsent } from "@/lib/tracking";
import { initializeGa4 } from "@/services/external-tracking/providers/ga4/browser";
import { getGtmBootstrapScript } from "@/services/external-tracking/providers/gtm";
import { initializeMetaPixel } from "@/services/external-tracking/providers/meta/browser";

function canLoadScripts(config: ReturnType<typeof useTrackingConfig>) {
  if (!config.enabled) {
    return false;
  }

  if (!config.consentRequired) {
    return true;
  }

  return readTrackingConsent() === "granted";
}

export function TrackingScripts() {
  const config = useTrackingConfig();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    function refreshConsent() {
      setAllowed(canLoadScripts(config));
    }

    refreshConsent();
    window.addEventListener("rp-tracking-consent-change", refreshConsent);

    return () => {
      window.removeEventListener("rp-tracking-consent-change", refreshConsent);
    };
  }, [config]);

  useEffect(() => {
    if (!allowed) {
      return;
    }

    if (config.meta.enabled && config.meta.pixelId) {
      initializeMetaPixel(config.meta.pixelId);
    }

    if (config.ga4.enabled && config.ga4.measurementId && !config.gtm.enabled) {
      initializeGa4(config.ga4.measurementId);
    }
  }, [allowed, config]);

  if (!allowed || !config.gtm.enabled || !config.gtm.containerId) {
    return null;
  }

  return (
    <Script id="radar-gtm" strategy="afterInteractive">
      {getGtmBootstrapScript(config.gtm.containerId)}
    </Script>
  );
}
