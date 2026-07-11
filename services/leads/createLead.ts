import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { AttributionData } from "@/types/attribution";
import type { CreateLeadInput } from "@/lib/validations/lead";

const DEDUPLICATION_WINDOW_MINUTES = 15;

export class LeadServiceError extends Error {
  constructor(message = "Lead service error") {
    super(message);
    this.name = "LeadServiceError";
  }
}

export type CreateLeadServiceResult = {
  id: string;
  reused: boolean;
};

function toLeadInsert(input: CreateLeadInput) {
  const attribution: AttributionData = input.attribution ?? {};

  return {
    full_name: input.fullName,
    email: input.email,
    phone: input.phone,
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
    status: input.status,
  };
}

export async function createLead(
  input: CreateLeadInput,
): Promise<CreateLeadServiceResult> {
  const supabase = createSupabaseAdminClient();
  const dedupeThreshold = new Date(
    Date.now() - DEDUPLICATION_WINDOW_MINUTES * 60 * 1000,
  ).toISOString();

  const { data: existingLead, error: lookupError } = await supabase
    .from("leads")
    .select("id")
    .eq("phone", input.phone)
    .gte("created_at", dedupeThreshold)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (lookupError) {
    throw new LeadServiceError("Failed to check recent lead.");
  }

  if (existingLead?.id) {
    return {
      id: existingLead.id,
      reused: true,
    };
  }

  const { data, error } = await supabase
    .from("leads")
    .insert(toLeadInsert(input))
    .select("id")
    .single();

  if (error || !data?.id) {
    throw new LeadServiceError("Failed to create lead.");
  }

  return {
    id: data.id,
    reused: false,
  };
}
