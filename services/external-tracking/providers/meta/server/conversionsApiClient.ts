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
    }
  | {
      ok: false;
      temporary: boolean;
      error: string;
    };

export function hashExternalPayload(payload: unknown): string {
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
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

      return {
        ok: false,
        temporary: response.status === 429 || response.status >= 500,
        error: sanitizeErrorMessage(
          `Meta CAPI responded with ${response.status}: ${body}`,
        ),
      };
    }

    const data = (await response.json().catch(() => null)) as {
      events_received?: number;
      fbtrace_id?: string;
    } | null;

    return {
      ok: true,
      providerEventId: data?.fbtrace_id,
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
