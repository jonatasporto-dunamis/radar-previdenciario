import type { ExternalTrackingEventName } from "@/types/tracking";

export interface TrackingConfig {
  enabled: boolean;
  consentRequired: boolean;
  dryRun: boolean;
  meta: {
    enabled: boolean;
    pixelId?: string;
    apiVersion: string;
    testEventCode?: string;
    testMode: boolean;
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
      server: boolean;
    }
  >;
}

const enabled = process.env.NEXT_PUBLIC_TRACKING_ENABLED === "true";
const consentRequired =
  process.env.NEXT_PUBLIC_TRACKING_CONSENT_REQUIRED !== "false";
const dryRun =
  process.env.EXTERNAL_TRACKING_DRY_RUN === "true" ||
  process.env.E2E_MOCK_SUPABASE === "true" ||
  process.env.NODE_ENV === "test";

export const defaultTrackingConfig: TrackingConfig = {
  enabled,
  consentRequired,
  dryRun,
  meta: {
    enabled: enabled && Boolean(process.env.NEXT_PUBLIC_META_PIXEL_ID),
    pixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID || undefined,
    apiVersion: process.env.META_CONVERSIONS_API_VERSION || "v25.0",
    testEventCode: process.env.META_TEST_EVENT_CODE || undefined,
    testMode: process.env.META_TRACKING_TEST_MODE === "true",
  },
  ga4: {
    enabled:
      enabled &&
      Boolean(process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID) &&
      !process.env.NEXT_PUBLIC_GTM_CONTAINER_ID,
    measurementId: process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID || undefined,
  },
  gtm: {
    enabled: enabled && Boolean(process.env.NEXT_PUBLIC_GTM_CONTAINER_ID),
    containerId: process.env.NEXT_PUBLIC_GTM_CONTAINER_ID || undefined,
  },
  events: {
    PageView: { enabled: true, browser: true, server: false },
    LeadStarted: { enabled: true, browser: true, server: false },
    LeadSubmitted: { enabled: true, browser: true, server: true },
    QuizStarted: { enabled: true, browser: true, server: false },
    QuizCompleted: { enabled: true, browser: true, server: true },
    QualifiedLead: { enabled: true, browser: true, server: true },
    ResultViewed: { enabled: true, browser: true, server: false },
    WhatsAppClick: { enabled: true, browser: true, server: false },
  },
};
