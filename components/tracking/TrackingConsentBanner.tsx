"use client";

import { useEffect, useState } from "react";
import { useTrackingConfig } from "./TrackingProvider";
import { readTrackingConsent, writeTrackingConsent } from "@/lib/tracking";
import type {
  TrackingConsentDecision,
  TrackingConsentStatus,
} from "@/types/tracking";

export function TrackingConsentBanner() {
  const config = useTrackingConfig();
  const [consent, setConsent] = useState<TrackingConsentStatus>("unknown");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setConsent(readTrackingConsent());
  }, []);

  if (!config.enabled || !config.consentRequired) {
    return null;
  }

  function decide(decision: TrackingConsentDecision) {
    writeTrackingConsent(decision);
    setConsent(decision);
    setIsOpen(false);
  }

  if (consent !== "unknown" && !isOpen) {
    return (
      <button
        className="bg-card text-muted-foreground shadow-card focus-visible:ring-ring fixed bottom-4 left-4 z-50 rounded-md border px-3 py-2 text-xs font-medium focus-visible:ring-2 focus-visible:outline-none"
        onClick={() => setIsOpen(true)}
        type="button"
      >
        Preferências de mensuração
      </button>
    );
  }

  return (
    <section
      aria-labelledby="tracking-consent-title"
      className="bg-card text-card-foreground shadow-elevated fixed right-4 bottom-4 left-4 z-50 rounded-lg border p-4 sm:left-auto sm:max-w-md"
      role="dialog"
    >
      <h2 className="text-sm font-semibold" id="tracking-consent-title">
        Preferências de mensuração
      </h2>
      <p className="text-muted-foreground mt-2 text-sm leading-6">
        Podemos usar cookies e eventos genéricos para medir campanhas e melhorar
        a experiência. Respostas do quiz e dados sensíveis não são enviados para
        Meta, Google Analytics ou GTM.
      </p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <button
          className="bg-primary text-primary-foreground focus-visible:outline-ring rounded-md px-4 py-2 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          onClick={() => decide("granted")}
          type="button"
        >
          Aceitar mensuração
        </button>
        <button
          className="border-border text-foreground focus-visible:outline-ring rounded-md border px-4 py-2 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          onClick={() => decide("denied")}
          type="button"
        >
          Continuar sem mensuração
        </button>
      </div>
    </section>
  );
}
