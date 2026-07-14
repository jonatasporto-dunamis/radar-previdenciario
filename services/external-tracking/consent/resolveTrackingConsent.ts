import { cookies, headers } from "next/headers";
import type { TrackingConsentStatus } from "@/types/tracking";

export const TRACKING_CONSENT_COOKIE = "rp_tracking_consent";

export async function resolveTrackingConsent(): Promise<TrackingConsentStatus> {
  const cookieStore = await cookies();
  const value = cookieStore.get(TRACKING_CONSENT_COOKIE)?.value;

  if (value === "granted" || value === "denied") {
    return value;
  }

  const requestHeaders = await headers();

  if (requestHeaders.get("dnt") === "1") {
    return "denied";
  }

  return "unknown";
}
