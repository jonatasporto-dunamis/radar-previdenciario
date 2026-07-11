import type { AttributionData } from "@/types/attribution";

const PARAMETER_MAP = {
  utm_source: "utmSource",
  utm_medium: "utmMedium",
  utm_campaign: "utmCampaign",
  utm_content: "utmContent",
  utm_term: "utmTerm",
  fbclid: "fbclid",
  gclid: "gclid",
  campaign_id: "campaignId",
  adset_id: "adsetId",
  ad_id: "adId",
  placement: "placement",
  site_source_name: "siteSourceName",
} as const;

const TECHNICAL_LIMITS: Partial<Record<keyof AttributionData, number>> = {
  utmSource: 255,
  utmMedium: 255,
  utmCampaign: 255,
  utmContent: 255,
  utmTerm: 255,
  fbclid: 500,
  gclid: 500,
  campaignId: 500,
  adsetId: 500,
  adId: 500,
  placement: 255,
  siteSourceName: 255,
  referrer: 1000,
  landingPage: 1000,
};

export function sanitizeAttributionValue(
  value: string,
  limit: number,
): string | null {
  const sanitized = value
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .replace(/[<>]/g, "")
    .trim()
    .slice(0, limit);

  return sanitized.length > 0 ? sanitized : null;
}

export function normalizeAttributionData(
  attribution: AttributionData,
): AttributionData {
  return Object.entries(attribution).reduce<AttributionData>(
    (acc, [key, value]) => {
      const typedKey = key as keyof AttributionData;
      const limit = TECHNICAL_LIMITS[typedKey] ?? 255;

      if (typeof value !== "string") {
        return acc;
      }

      const sanitized = sanitizeAttributionValue(value, limit);

      if (sanitized) {
        acc[typedKey] = sanitized;
      }

      return acc;
    },
    {},
  );
}

export function parseAttributionFromSearchParams(
  searchParams: URLSearchParams,
): AttributionData {
  const attribution: AttributionData = {};

  Object.entries(PARAMETER_MAP).forEach(([parameter, key]) => {
    const value = searchParams.get(parameter);

    if (!value) {
      return;
    }

    const limit = TECHNICAL_LIMITS[key] ?? 255;
    const sanitized = sanitizeAttributionValue(value, limit);

    if (sanitized) {
      attribution[key] = sanitized;
    }
  });

  return attribution;
}
