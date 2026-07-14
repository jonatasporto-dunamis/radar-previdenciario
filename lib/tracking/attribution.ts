import { getAttributionFromSession } from "@/lib/attribution";
import type { SafeAttributionData } from "@/types/tracking";

export function getSafeAttributionFromSession(): SafeAttributionData {
  const attribution = getAttributionFromSession();

  return {
    utmSource: attribution.utmSource ?? null,
    utmMedium: attribution.utmMedium ?? null,
    utmCampaign: attribution.utmCampaign ?? null,
    utmContent: attribution.utmContent ?? null,
    utmTerm: attribution.utmTerm ?? null,
    campaignId: attribution.campaignId ?? null,
    adsetId: attribution.adsetId ?? null,
    adId: attribution.adId ?? null,
    placement: attribution.placement ?? null,
    siteSourceName: attribution.siteSourceName ?? null,
    referrer: attribution.referrer ?? null,
    landingPage: attribution.landingPage ?? null,
    fbclid: attribution.fbclid ?? null,
  };
}
