import type { OfficeConfig } from "@/types/brand";
import type { ConfigurationContext } from "@/types/configuration";
import { getAppConfig } from "./getAppConfig";

function withOfficeEmailFallbacks(office: OfficeConfig): OfficeConfig {
  return {
    ...office,
    email: {
      fromName: office.email.fromName || process.env.EMAIL_FROM_NAME || "",
      fromAddress:
        office.email.fromAddress || process.env.EMAIL_FROM_ADDRESS || "",
      replyTo: office.email.replyTo || process.env.EMAIL_REPLY_TO || "",
      notificationEmail:
        office.email.notificationEmail ||
        process.env.OFFICE_NOTIFICATION_EMAIL ||
        "",
    },
  };
}

export async function getOfficeConfig(
  context?: ConfigurationContext,
): Promise<OfficeConfig> {
  const config = await getAppConfig(context);

  return withOfficeEmailFallbacks(config.office);
}
