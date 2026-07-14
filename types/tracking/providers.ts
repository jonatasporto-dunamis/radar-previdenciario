export type ExternalTrackingProvider =
  "meta_pixel" | "meta_capi" | "ga4" | "gtm";

export type ExternalTrackingChannel = "browser" | "server";

export type ExternalTrackingDeliveryStatus =
  | "pending"
  | "processing"
  | "sent"
  | "failed"
  | "retrying"
  | "ignored"
  | "cancelled";
