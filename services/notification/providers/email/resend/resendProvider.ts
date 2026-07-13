import {
  getNotificationRuntimeConfig,
  validateNotificationRuntimeConfig,
} from "@/services/notification/config";
import { sanitizeErrorMessage } from "@/services/notification/security";
import { getOfficeConfig } from "@/services/configuration";
import type { OfficeConfig } from "@/types/brand";
import type {
  NotificationProvider,
  NotificationProviderHealth,
  NotificationProviderSendInput,
  NotificationProviderSendResult,
} from "../../types";

type FetchLike = typeof fetch;

type ResendProviderOptions = {
  apiKey?: string | null;
  dryRun?: boolean;
  fetcher?: FetchLike;
  loadOfficeConfig?: () => Promise<OfficeConfig>;
};

type OfficeEmailIdentity = {
  from: string;
  replyTo: string;
  destination: string;
};

export class ResendProvider implements NotificationProvider {
  id = "email" as const;

  private readonly apiKey: string | null;
  private readonly dryRun: boolean;
  private readonly fetcher: FetchLike;
  private readonly loadOfficeConfig: () => Promise<OfficeConfig>;

  constructor(options: ResendProviderOptions = {}) {
    const runtime = getNotificationRuntimeConfig();

    this.apiKey = options.apiKey ?? runtime.resendApiKey;
    this.dryRun = options.dryRun ?? runtime.dryRun;
    this.fetcher = options.fetcher ?? fetch;
    this.loadOfficeConfig = options.loadOfficeConfig ?? getOfficeConfig;
  }

  private async getOfficeEmailIdentity(): Promise<OfficeEmailIdentity> {
    const office = await this.loadOfficeConfig();
    const fromName = office.email.fromName.trim();
    const fromAddress = office.email.fromAddress.trim();
    const replyTo = office.email.replyTo.trim();
    const destination = office.email.notificationEmail.trim();

    if (!fromName || !fromAddress || !replyTo || !destination) {
      throw new Error("Office email configuration is incomplete.");
    }

    return {
      from: `${fromName} <${fromAddress}>`,
      replyTo,
      destination,
    };
  }

  async validate(): Promise<NotificationProviderHealth> {
    const validation = validateNotificationRuntimeConfig({
      ...getNotificationRuntimeConfig(),
      resendApiKey: this.apiKey,
      dryRun: this.dryRun,
    });

    if (!validation.valid) {
      return {
        ok: false,
        provider: this.id,
        reason: validation.reason,
      };
    }

    try {
      await this.getOfficeEmailIdentity();
    } catch (error) {
      return {
        ok: false,
        provider: this.id,
        reason: sanitizeErrorMessage(error),
      };
    }

    return {
      ok: true,
      provider: this.id,
    };
  }

  async health(): Promise<NotificationProviderHealth> {
    return this.validate();
  }

  async send(
    input: NotificationProviderSendInput,
  ): Promise<NotificationProviderSendResult> {
    const validation = await this.validate();

    if (!validation.ok) {
      return {
        ok: false,
        temporary: false,
        error: validation.reason ?? "Invalid email provider configuration.",
      };
    }

    const identity = await this.getOfficeEmailIdentity();

    if (this.dryRun) {
      return {
        ok: true,
        providerMessageId: `dry-run:${input.payloadHash}`,
      };
    }

    try {
      const response = await this.fetcher("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "Idempotency-Key": input.idempotencyKey,
        },
        body: JSON.stringify({
          from: identity.from,
          to: [identity.destination],
          reply_to: identity.replyTo,
          subject: input.subject,
          html: input.html,
          text: input.text,
        }),
      });

      if (!response.ok) {
        const body = await response.text();
        const temporary = response.status === 429 || response.status >= 500;

        return {
          ok: false,
          temporary,
          error: sanitizeErrorMessage(
            `Resend responded with ${response.status}: ${body}`,
          ),
        };
      }

      const data = (await response.json().catch(() => null)) as {
        id?: string;
      } | null;

      return {
        ok: true,
        providerMessageId: data?.id,
      };
    } catch (error) {
      return {
        ok: false,
        temporary: true,
        error: sanitizeErrorMessage(error),
      };
    }
  }
}
