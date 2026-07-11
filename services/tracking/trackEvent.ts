import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { AttributionData } from "@/types/attribution";
import type { TrackingEventName } from "@/types/database";
import type { Json } from "@/types/supabase";

export class TrackingServiceError extends Error {
  constructor(message = "Tracking service error") {
    super(message);
    this.name = "TrackingServiceError";
  }
}

export type TrackEventInput = {
  leadId?: string | null;
  sessionId?: string | null;
  eventName: TrackingEventName;
  eventPayload?: Json | null;
  attribution?: AttributionData;
  userAgent?: string | null;
  ipAddress?: string | null;
};

export async function trackEvent(input: TrackEventInput): Promise<void> {
  const supabase = createSupabaseAdminClient();
  const attribution = input.attribution ?? {};

  const { error } = await supabase.from("tracking_events").insert({
    lead_id: input.leadId ?? null,
    session_id: input.sessionId ?? null,
    event_name: input.eventName,
    event_payload: input.eventPayload ?? null,
    utm_source: attribution.utmSource ?? null,
    utm_medium: attribution.utmMedium ?? null,
    utm_campaign: attribution.utmCampaign ?? null,
    utm_content: attribution.utmContent ?? null,
    utm_term: attribution.utmTerm ?? null,
    fbclid: attribution.fbclid ?? null,
    gclid: attribution.gclid ?? null,
    campaign_id: attribution.campaignId ?? null,
    adset_id: attribution.adsetId ?? null,
    ad_id: attribution.adId ?? null,
    placement: attribution.placement ?? null,
    site_source_name: attribution.siteSourceName ?? null,
    referrer: attribution.referrer ?? null,
    landing_page: attribution.landingPage ?? null,
    user_agent: input.userAgent ?? null,
    ip_address: input.ipAddress ?? null,
  });

  if (error) {
    throw new TrackingServiceError("Failed to track event.");
  }
}
