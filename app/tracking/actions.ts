"use server";

import { createHash } from "crypto";
import { getTrackingConfig } from "@/services/configuration";
import { resolveTrackingConsent } from "@/services/external-tracking/consent";
import { createDeliveryLog } from "@/services/external-tracking/persistence";
import { getTenantContext } from "@/services/tenants";
import type {
  ExternalTrackingEventName,
  ExternalTrackingProvider,
} from "@/types/tracking";

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
