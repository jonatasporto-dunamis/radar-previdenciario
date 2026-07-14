import type {
  TrackingConsentDecision,
  TrackingConsentStatus,
} from "@/types/tracking";

export const TRACKING_CONSENT_COOKIE = "rp_tracking_consent";

const maxAge = 60 * 60 * 24 * 180;

export function readTrackingConsent(): TrackingConsentStatus {
  if (typeof document === "undefined") {
    return "unknown";
  }

  const value = document.cookie
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${TRACKING_CONSENT_COOKIE}=`))
    ?.split("=")[1];

  if (value === "granted" || value === "denied") {
    return value;
  }

  if (navigator.doNotTrack === "1") {
    return "denied";
  }

  return "unknown";
}

export function writeTrackingConsent(decision: TrackingConsentDecision) {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${TRACKING_CONSENT_COOKIE}=${decision}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;
  window.dispatchEvent(new CustomEvent("rp-tracking-consent-change"));
}
