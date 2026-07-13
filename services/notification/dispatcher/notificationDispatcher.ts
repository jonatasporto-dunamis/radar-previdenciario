import { notificationConfig } from "../config";
import {
  markNotificationFailed,
  markNotificationProcessing,
  markNotificationRetrying,
  markNotificationSent,
  type NotificationLogRow,
} from "../persistence";
import type {
  NotificationProvider,
  NotificationProviderSendInput,
} from "../providers";
import { trackEvent } from "@/services/tracking";
import type { Json } from "@/types/supabase";

type TrackNotificationEventInput = {
  leadId: string | null;
  sessionId?: string | null;
  eventName: "NotificationSent" | "NotificationFailed";
  eventPayload: Json;
};

type NotificationDispatcherDependencies = {
  delay: (ms: number) => Promise<void>;
  markProcessing: typeof markNotificationProcessing;
  markRetrying: typeof markNotificationRetrying;
  markFailed: typeof markNotificationFailed;
  markSent: typeof markNotificationSent;
  track: (input: TrackNotificationEventInput) => Promise<void>;
};

export type DispatchNotificationInput = {
  log: NotificationLogRow;
  provider: NotificationProvider;
  providerInput: NotificationProviderSendInput;
  sessionId?: string | null;
};

export type DispatchNotificationResult =
  | {
      status: "sent";
      attempt: number;
    }
  | {
      status: "failed";
      attempt: number;
      error: string;
    };

export function calculateRetryBackoffMs(
  attempt: number,
  baseDelayMs = notificationConfig.retry.baseDelayMs,
): number {
  return baseDelayMs * 2 ** Math.max(attempt - 1, 0);
}

async function defaultTrack(input: TrackNotificationEventInput): Promise<void> {
  await trackEvent(input);
}

export class NotificationDispatcher {
  constructor(
    private readonly dependencies: NotificationDispatcherDependencies = {
      delay: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
      markProcessing: markNotificationProcessing,
      markRetrying: markNotificationRetrying,
      markFailed: markNotificationFailed,
      markSent: markNotificationSent,
      track: defaultTrack,
    },
  ) {}

  async dispatch(
    input: DispatchNotificationInput,
  ): Promise<DispatchNotificationResult> {
    const maxAttempts = notificationConfig.retry.maxAttempts;
    const currentAttempt = Math.max(input.log.attempt ?? 0, 0);

    for (
      let attempt = currentAttempt + 1;
      attempt <= maxAttempts;
      attempt += 1
    ) {
      await this.dependencies.markProcessing({
        logId: input.log.id,
        attempt,
      });

      const result = await input.provider.send(input.providerInput);

      if (result.ok) {
        await this.dependencies.markSent(input.log.id);
        await this.dependencies.track({
          leadId: input.log.lead_id,
          sessionId: input.sessionId,
          eventName: "NotificationSent",
          eventPayload: {
            notificationLogId: input.log.id,
            provider: input.log.provider,
            attempt,
            providerMessageId: result.providerMessageId ?? null,
          },
        });

        return { status: "sent", attempt };
      }

      const shouldRetry = result.temporary && attempt < maxAttempts;

      if (shouldRetry) {
        await this.dependencies.markRetrying({
          logId: input.log.id,
          attempt,
          error: result.error,
        });
        await this.dependencies.delay(calculateRetryBackoffMs(attempt));
        continue;
      }

      await this.dependencies.markFailed({
        logId: input.log.id,
        attempt,
        error: result.error,
      });
      await this.dependencies.track({
        leadId: input.log.lead_id,
        sessionId: input.sessionId,
        eventName: "NotificationFailed",
        eventPayload: {
          notificationLogId: input.log.id,
          provider: input.log.provider,
          attempt,
          temporary: result.temporary,
          error: result.error,
        },
      });

      return {
        status: "failed",
        attempt,
        error: result.error,
      };
    }

    return {
      status: "failed",
      attempt: currentAttempt,
      error: "Notification attempt limit reached.",
    };
  }
}
