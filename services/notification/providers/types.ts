import type {
  NotificationProvider as NotificationProviderName,
  NotificationPriority,
} from "@/types/database";

export type NotificationProviderHealth = {
  ok: boolean;
  provider: NotificationProviderName;
  reason?: string;
};

export type NotificationProviderSendInput = {
  to: string;
  from: string;
  subject: string;
  html: string;
  text: string;
  payloadHash: string;
  priority: NotificationPriority;
  idempotencyKey: string;
};

export type NotificationProviderSendResult =
  | {
      ok: true;
      providerMessageId?: string;
    }
  | {
      ok: false;
      error: string;
      temporary: boolean;
    };

export interface NotificationProvider {
  id: NotificationProviderName;
  send(
    input: NotificationProviderSendInput,
  ): Promise<NotificationProviderSendResult>;
  validate(): Promise<NotificationProviderHealth>;
  health(): Promise<NotificationProviderHealth>;
}
