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

export type TrackEventOnceInput = TrackEventInput & {
  eventPayloadContains?: Record<string, unknown>;
};

export type FindExternalTrackingEventIdInput = {
  leadId?: string | null;
  sessionId?: string | null;
  eventName: TrackingEventName;
  eventPayloadContains?: Record<string, unknown>;
};

function readExternalEventId(payload: Json | null): string | null {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return null;
  }

  const value = payload.external_event_id;

  return typeof value === "string" && value.startsWith("rp_") ? value : null;
}

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

export async function trackEventOnce(
  input: TrackEventOnceInput,
): Promise<boolean> {
  const supabase = createSupabaseAdminClient();
  let query = supabase
    .from("tracking_events")
    .select("id")
    .eq("event_name", input.eventName)
    .limit(1);

  if (input.leadId) {
    query = query.eq("lead_id", input.leadId);
  }

  if (input.sessionId) {
    query = query.eq("session_id", input.sessionId);
  }

  if (input.eventPayloadContains) {
    query = query.contains("event_payload", input.eventPayloadContains);
  }

  const { data: existingEvent, error: lookupError } = await query.maybeSingle();

  if (lookupError) {
    throw new TrackingServiceError("Failed to check tracking event.");
  }

  if (existingEvent) {
    return false;
  }

  await trackEvent(input);

  return true;
}

export async function findExternalTrackingEventId(
  input: FindExternalTrackingEventIdInput,
): Promise<string | null> {
  const supabase = createSupabaseAdminClient();
  let query = supabase
    .from("tracking_events")
    .select("event_payload")
    .eq("event_name", input.eventName)
    .order("created_at", { ascending: false })
    .limit(1);

  if (input.leadId) {
    query = query.eq("lead_id", input.leadId);
  }

  if (input.sessionId) {
    query = query.eq("session_id", input.sessionId);
  }

  if (input.eventPayloadContains) {
    query = query.contains("event_payload", input.eventPayloadContains);
  }

  const { data, error } = await query.maybeSingle();

  if (error || !data) {
    return null;
  }

  return readExternalEventId(data.event_payload);
}
