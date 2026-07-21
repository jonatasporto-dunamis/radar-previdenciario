import "server-only";
import { headers } from "next/headers";
import { getTrackingConfig } from "@/services/configuration";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getTenantIntegrationSecret } from "@/services/integrations/secrets";
import { sanitizeErrorMessage } from "@/services/notification/security";
import { getTenantContext, getTenantSecret } from "@/services/tenants";
import { resolveTrackingConsent } from "../consent";
import {
  createDeliveryLog,
  findDeliveryByEvent,
  updateDeliveryLog,
} from "../persistence";
import {
  buildMetaConversionsPayload,
  hashExternalPayload,
  sendMetaConversionsEvent,
} from "../providers/meta/server";
import type {
  ExternalTrackingEvent,
  ExternalTrackingProvider,
} from "@/types/tracking";
import type { Database } from "@/types/supabase";

type LeadRow = Database["public"]["Tables"]["leads"]["Row"];

type DispatchExternalEventInput = {
  event: ExternalTrackingEvent;
  server?: boolean;
  trackingEventId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
};

export type DispatchExternalEventReport = {
  eventId: string;
  attempted: boolean;
  status: "sent" | "failed" | "ignored";
  providers: Array<{
    provider: ExternalTrackingProvider;
    status: "sent" | "failed" | "ignored";
    error?: string;
  }>;
};

function getFirstForwardedIp(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const [firstIp] = value.split(",");

  return firstIp?.trim() || null;
}

async function getLead(input: {
  tenantId: string;
  leadId?: string;
}): Promise<LeadRow | null> {
  const { tenantId, leadId } = input;

  if (!leadId) {
    return null;
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("id", leadId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data;
}

async function readRequestContext(input: DispatchExternalEventInput) {
  const requestHeaders = await headers();

  return {
    ipAddress:
      input.ipAddress ??
      getFirstForwardedIp(requestHeaders.get("x-forwarded-for")) ??
      requestHeaders.get("x-real-ip"),
    userAgent:
      input.userAgent ?? requestHeaders.get("user-agent")?.slice(0, 1000),
    cookieHeader: requestHeaders.get("cookie"),
  };
}

function shouldSendServerEvent(input: {
  enabled: boolean;
  eventEnabled: boolean;
  serverEnabled: boolean;
  consentRequired: boolean;
  consent: string;
}) {
  if (!input.enabled || !input.eventEnabled || !input.serverEnabled) {
    return false;
  }

  if (input.consentRequired && input.consent !== "granted") {
    return false;
  }

  return true;
}

export async function dispatchExternalEvent(
  input: DispatchExternalEventInput,
): Promise<DispatchExternalEventReport> {
  try {
    const tenantContext = input.event.tenantId
      ? await getTenantContext({ tenantId: input.event.tenantId })
      : await getTenantContext();
    const config = await getTrackingConfig(tenantContext);
    const eventConfig = config.events[input.event.eventName];
    const consent = await resolveTrackingConsent();
    const providers: DispatchExternalEventReport["providers"] = [];
    const canSend = shouldSendServerEvent({
      enabled: config.enabled,
      eventEnabled: eventConfig.enabled,
      serverEnabled: eventConfig.server && Boolean(input.server),
      consentRequired: config.consentRequired,
      consent,
    });

    if (!canSend || !config.meta.enabled || !config.meta.pixelId) {
      return {
        eventId: input.event.eventId,
        attempted: false,
        status: "ignored",
        providers: [
          {
            provider: "meta_capi",
            status: "ignored",
          },
        ],
      };
    }

    const existing = await findDeliveryByEvent({
      tenantId: tenantContext.tenantId,
      eventId: input.event.eventId,
      provider: "meta_capi",
      channel: "server",
    });

    if (existing?.status === "sent" || existing?.status === "processing") {
      return {
        eventId: input.event.eventId,
        attempted: false,
        status: "ignored",
        providers: [{ provider: "meta_capi", status: "ignored" }],
      };
    }

    const context = await readRequestContext(input);
    const lead = await getLead({
      tenantId: tenantContext.tenantId,
      leadId: input.event.leadId,
    });
    const testEventCode =
      config.meta.testMode && config.meta.testEventCode
        ? config.meta.testEventCode
        : config.meta.testMode
          ? ((await getTenantIntegrationSecret({
              tenantId: tenantContext.tenantId,
              provider: "meta",
              secretKey: "testEventCode",
            })) ??
            (await getTenantSecret({
              tenantId: tenantContext.tenantId,
              secretKey: "meta_test_event_code",
              allowDefaultEnvFallback: true,
            })))
          : null;
    const payload = buildMetaConversionsPayload({
      event: input.event,
      lead,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      cookieHeader: context.cookieHeader,
      testEventCode: testEventCode ?? undefined,
    });
    const payloadHash = hashExternalPayload(payload);
    const queuedAt = new Date().toISOString();
    const delivery =
      existing ??
      (await createDeliveryLog({
        tenant_id: tenantContext.tenantId,
        tracking_event_id: input.trackingEventId ?? null,
        lead_id: input.event.leadId ?? null,
        session_id: input.event.sessionId ?? null,
        result_id: input.event.resultId ?? null,
        event_name: input.event.eventName,
        event_id: input.event.eventId,
        provider: "meta_capi",
        channel: "server",
        status: "pending",
        attempt: 0,
        test_event: config.meta.testMode,
        request_payload_hash: payloadHash,
        queued_at: queuedAt,
      }));

    if (!delivery) {
      return {
        eventId: input.event.eventId,
        attempted: true,
        status: "failed",
        providers: [{ provider: "meta_capi", status: "failed" }],
      };
    }

    if (config.dryRun) {
      await updateDeliveryLog({
        tenantId: tenantContext.tenantId,
        id: delivery.id,
        values: {
          status: "ignored",
          last_error: "External tracking dry-run enabled.",
        },
      });

      return {
        eventId: input.event.eventId,
        attempted: true,
        status: "ignored",
        providers: [{ provider: "meta_capi", status: "ignored" }],
      };
    }

    const accessToken =
      (await getTenantIntegrationSecret({
        tenantId: tenantContext.tenantId,
        provider: "meta",
        secretKey: "accessToken",
      })) ??
      (await getTenantSecret({
        tenantId: tenantContext.tenantId,
        secretKey: "meta_conversions_api_access_token",
        allowDefaultEnvFallback: true,
      }));

    if (!accessToken) {
      await updateDeliveryLog({
        tenantId: tenantContext.tenantId,
        id: delivery.id,
        values: {
          status: "ignored",
          last_error: "Meta CAPI token is not configured.",
        },
      });

      return {
        eventId: input.event.eventId,
        attempted: false,
        status: "ignored",
        providers: [{ provider: "meta_capi", status: "ignored" }],
      };
    }

    let attempt = Math.max(delivery.attempt ?? 0, 0);

    for (; attempt < 3; attempt += 1) {
      const nextAttempt = attempt + 1;
      await updateDeliveryLog({
        tenantId: tenantContext.tenantId,
        id: delivery.id,
        values: {
          status: "processing",
          attempt: nextAttempt,
          processing_started_at: new Date().toISOString(),
        },
      });

      const result = await sendMetaConversionsEvent({
        pixelId: config.meta.pixelId,
        accessToken,
        apiVersion: config.meta.apiVersion,
        payload,
      });

      if (result.ok) {
        await updateDeliveryLog({
          tenantId: tenantContext.tenantId,
          id: delivery.id,
          values: {
            status: "sent",
            sent_at: new Date().toISOString(),
            provider_event_id: result.providerEventId ?? null,
            failed_at: null,
            last_error: null,
          },
        });
        providers.push({ provider: "meta_capi", status: "sent" });
        return {
          eventId: input.event.eventId,
          attempted: true,
          status: "sent",
          providers,
        };
      }

      const finalAttempt = nextAttempt >= 3 || !result.temporary;

      await updateDeliveryLog({
        tenantId: tenantContext.tenantId,
        id: delivery.id,
        values: {
          status: finalAttempt ? "failed" : "retrying",
          failed_at: new Date().toISOString(),
          last_error: result.error,
        },
      });

      if (finalAttempt) {
        providers.push({
          provider: "meta_capi",
          status: "failed",
          error: result.error,
        });
        return {
          eventId: input.event.eventId,
          attempted: true,
          status: "failed",
          providers,
        };
      }

      await new Promise((resolve) => setTimeout(resolve, 250 * 2 ** attempt));
    }

    return {
      eventId: input.event.eventId,
      attempted: true,
      status: "failed",
      providers: [{ provider: "meta_capi", status: "failed" }],
    };
  } catch (error) {
    return {
      eventId: input.event.eventId,
      attempted: false,
      status: "failed",
      providers: [
        {
          provider: "meta_capi",
          status: "failed",
          error: sanitizeErrorMessage(error),
        },
      ],
    };
  }
}
