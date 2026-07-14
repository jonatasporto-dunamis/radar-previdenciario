export type TrackingConsentStatus = "granted" | "denied" | "unknown";

export type TrackingConsentDecision = Exclude<TrackingConsentStatus, "unknown">;
