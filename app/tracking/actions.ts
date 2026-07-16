"use server";

import { createHash } from "crypto";
import { headers } from "next/headers";
import { getTrackingConfig } from "@/services/configuration";
import { resolveTrackingConsent } from "@/services/external-tracking/consent";
import { createDeliveryLog } from "@/services/external-tracking/persistence";
import { getTenantContext } from "@/services/tenants";
import { trackEvent } from "@/services/tracking";
import type {
  ExternalTrackingEventName,
  ExternalTrackingProvider,
} from "@/types/tracking";

const CONSENT_VERSION = "2026-07-15-mvp";

type RecordBrowserExternalDeliveryInput = {
  eventName: ExternalTrackingEventName;
  eventId: string;
  leadId?: string;
  sessionId?: string;
  resultId?: string;
  providers: Array<
    Extract<ExternalTrackingProvider, "meta_pixel" | "ga4" | "gtm">
  >;
  requestPayloadHashSource: string;
};

function hashPayload(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function getFirstForwardedIp(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const [firstIp] = value.split(",");
  const ip = firstIp?.trim();

  return ip || null;
}

export async function recordTrackingConsentAction(
  status: "granted" | "denied",
): Promise<{ success: true } | { success: false }> {
  const tenantContext = await getTenantContext();
  const requestHeaders = await headers();

  try {
    await trackEvent({
      tenantId: tenantContext.tenantId,
      eventName:
        status === "granted"
          ? "TrackingConsentGranted"
          : "TrackingConsentDenied",
      eventPayload: {
        source: "tracking_consent_banner",
        consent_type: "cookies_measurement",
        consent_version: CONSENT_VERSION,
        policy_version: CONSENT_VERSION,
        status,
        timestamp: new Date().toISOString(),
      },
      userAgent: requestHeaders.get("user-agent")?.slice(0, 1000) ?? null,
      ipAddress:
        getFirstForwardedIp(requestHeaders.get("x-forwarded-for")) ??
        requestHeaders.get("x-real-ip"),
    });

    return { success: true };
  } catch {
    console.error("Failed to record tracking consent.");
    return { success: false };
  }
}

export async function recordBrowserExternalDeliveryAction(
  input: RecordBrowserExternalDeliveryInput,
): Promise<{ success: true } | { success: false }> {
  const tenantContext = await getTenantContext();
  const config = await getTrackingConfig(tenantContext);
  const consent = await resolveTrackingConsent();

  if (
    !config.enabled ||
    !config.events[input.eventName]?.browser ||
    (config.consentRequired && consent !== "granted")
  ) {
    return { success: false };
  }

  await Promise.all(
    input.providers.map((provider) =>
      createDeliveryLog({
        tenant_id: tenantContext.tenantId,
        lead_id: input.leadId ?? null,
        session_id: input.sessionId ?? null,
        result_id: input.resultId ?? null,
        event_name: input.eventName,
        event_id: input.eventId,
        provider,
        channel: "browser",
        status: config.dryRun ? "ignored" : "sent",
        attempt: 1,
        test_event: false,
        request_payload_hash: hashPayload(input.requestPayloadHashSource),
        queued_at: new Date().toISOString(),
        sent_at: config.dryRun ? null : new Date().toISOString(),
        last_error: config.dryRun ? "External tracking dry-run enabled." : null,
      }),
    ),
  );

  return { success: true };
}
