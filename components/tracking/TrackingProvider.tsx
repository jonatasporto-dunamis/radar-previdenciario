"use client";

import { createContext, useContext } from "react";
import type { PublicTrackingConfig } from "@/lib/tracking";

const TrackingContext = createContext<PublicTrackingConfig | null>(null);

export function TrackingProvider({
  children,
  config,
}: {
  children: React.ReactNode;
  config: PublicTrackingConfig;
}) {
  return (
    <TrackingContext.Provider value={config}>
      {children}
    </TrackingContext.Provider>
  );
}

export function useTrackingConfig(): PublicTrackingConfig {
  const config = useContext(TrackingContext);

  if (!config) {
    return {
      enabled: false,
      consentRequired: true,
      meta: { enabled: false },
      ga4: { enabled: false },
      gtm: { enabled: false },
      events: {
        PageView: { enabled: false, browser: false },
        LeadStarted: { enabled: false, browser: false },
        LeadSubmitted: { enabled: false, browser: false },
        QuizStarted: { enabled: false, browser: false },
        QuizCompleted: { enabled: false, browser: false },
        QualifiedLead: { enabled: false, browser: false },
        ResultViewed: { enabled: false, browser: false },
        WhatsAppClick: { enabled: false, browser: false },
      },
    };
  }

  return config;
}
