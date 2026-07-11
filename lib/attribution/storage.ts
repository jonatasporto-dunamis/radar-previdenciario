import type { AttributionData } from "@/types/attribution";
import { normalizeAttributionData } from "./capture";

export const ATTRIBUTION_STORAGE_KEY = "radar_previdenciario_attribution";

const attributionKeys: Array<keyof AttributionData> = [
  "utmSource",
  "utmMedium",
  "utmCampaign",
  "utmContent",
  "utmTerm",
  "fbclid",
  "gclid",
  "campaignId",
  "adsetId",
  "adId",
  "placement",
  "siteSourceName",
  "referrer",
  "landingPage",
];

function isBrowser() {
  return typeof window !== "undefined" && "sessionStorage" in window;
}

function isAttributionData(value: unknown): value is AttributionData {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  return Object.entries(value).every(
    ([key, item]) =>
      attributionKeys.includes(key as keyof AttributionData) &&
      (typeof item === "string" || item === null),
  );
}

export function mergeAttribution(
  current: AttributionData,
  next: AttributionData,
): AttributionData {
  const normalizedCurrent = normalizeAttributionData(current);
  const normalizedNext = normalizeAttributionData(next);

  return attributionKeys.reduce<AttributionData>((acc, key) => {
    const nextValue = normalizedNext[key];
    const currentValue = normalizedCurrent[key];

    if (nextValue) {
      acc[key] = nextValue;
    } else if (currentValue) {
      acc[key] = currentValue;
    }

    return acc;
  }, {});
}

export function getAttributionFromSession(): AttributionData {
  if (!isBrowser()) {
    return {};
  }

  try {
    const raw = window.sessionStorage.getItem(ATTRIBUTION_STORAGE_KEY);

    if (!raw) {
      return {};
    }

    const parsed: unknown = JSON.parse(raw);

    if (!isAttributionData(parsed)) {
      return {};
    }

    return normalizeAttributionData(parsed);
  } catch {
    return {};
  }
}

export function saveAttributionToSession(attribution: AttributionData): void {
  if (!isBrowser()) {
    return;
  }

  const merged = mergeAttribution(getAttributionFromSession(), attribution);

  try {
    window.sessionStorage.setItem(
      ATTRIBUTION_STORAGE_KEY,
      JSON.stringify(merged),
    );
  } catch {
    // Failing to persist attribution should not block the registration flow.
  }
}

export function clearAttributionFromSession(): void {
  if (!isBrowser()) {
    return;
  }

  window.sessionStorage.removeItem(ATTRIBUTION_STORAGE_KEY);
}
