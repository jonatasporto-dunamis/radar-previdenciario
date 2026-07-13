import { ResendProvider } from "./resend/resendProvider";
import type {
  NotificationProvider,
  NotificationProviderHealth,
  NotificationProviderSendInput,
  NotificationProviderSendResult,
} from "../types";

export class EmailProvider implements NotificationProvider {
  id = "email" as const;

  constructor(
    private readonly provider: NotificationProvider = new ResendProvider(),
  ) {}

  async send(
    input: NotificationProviderSendInput,
  ): Promise<NotificationProviderSendResult> {
    return this.provider.send(input);
  }

  async validate(): Promise<NotificationProviderHealth> {
    return this.provider.validate();
  }

  async health(): Promise<NotificationProviderHealth> {
    return this.provider.health();
  }
}
