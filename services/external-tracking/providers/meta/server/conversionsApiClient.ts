import "server-only";
import { createHash } from "crypto";
import { sanitizeErrorMessage } from "@/services/notification/security";
import type { MetaConversionsApiPayload } from "./buildMetaPayload";

type SendMetaConversionsInput = {
  pixelId: string;
  accessToken: string;
  apiVersion: string;
  payload: MetaConversionsApiPayload;
  fetcher?: typeof fetch;
  timeoutMs?: number;
};

export type MetaConversionsApiResult =
  | {
      ok: true;
      providerEventId?: string;
      responseStatus?: number;
      eventsReceived?: number;
    }
  | {
      ok: false;
      temporary: boolean;
      error: string;
      responseStatus?: number;
      errorCategory?: string;
    };

export function hashExternalPayload(payload: unknown): string {
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

function classifyMetaError(status: number, body: string): string {
  const normalized = body.toLowerCase();

  if (status === 401 || normalized.includes("access token")) {
    return "invalid_or_expired_token";
  }

  if (status === 403 || normalized.includes("permission")) {
    return "insufficient_permission";
  }

  if (normalized.includes("test_event_code")) {
    return "invalid_test_event_code";
  }

  if (normalized.includes("unsupported post request")) {
    return "invalid_dataset_or_pixel";
  }

  if (normalized.includes("version")) {
    return "invalid_api_version";
  }

  if (status === 400) {
    return "invalid_payload";
  }

  if (status === 429) {
    return "rate_limited";
  }

  if (status >= 500) {
    return "meta_temporary_error";
  }

  return "meta_api_error";
}

export async function sendMetaConversionsEvent({
  pixelId,
  accessToken,
  apiVersion,
  payload,
  fetcher = fetch,
  timeoutMs = 3000,
}: SendMetaConversionsInput): Promise<MetaConversionsApiResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetcher(
      `https://graph.facebook.com/${apiVersion}/${pixelId}/events?access_token=${encodeURIComponent(accessToken)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      },
    );

    if (!response.ok) {
      const body = await response.text();
      const sanitizedBody = sanitizeErrorMessage(body);

      return {
        ok: false,
        temporary: response.status === 429 || response.status >= 500,
        responseStatus: response.status,
        error: sanitizeErrorMessage(
          `Meta CAPI responded with ${response.status}: ${sanitizedBody}`,
        ),
        errorCategory: classifyMetaError(response.status, sanitizedBody),
      };
    }

    const data = (await response.json().catch(() => null)) as {
      events_received?: number;
      fbtrace_id?: string;
    } | null;

    return {
      ok: true,
      providerEventId: data?.fbtrace_id,
      responseStatus: response.status,
      eventsReceived: data?.events_received,
    };
  } catch (error) {
    return {
      ok: false,
      temporary: true,
      error: sanitizeErrorMessage(error),
    };
  } finally {
    clearTimeout(timeout);
  }
}
