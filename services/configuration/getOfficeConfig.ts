import type { OfficeConfig } from "@/types/brand";
import type { ConfigurationContext } from "@/types/configuration";
import { getAppConfig } from "./getAppConfig";

export async function getOfficeConfig(
  context?: ConfigurationContext,
): Promise<OfficeConfig> {
  const config = await getAppConfig(context);

  return config.office;
}
