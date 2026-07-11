import { loadAppConfig } from "@/config";
import type { AppConfig, ConfigurationContext } from "@/types/configuration";

export async function getAppConfig(
  context?: ConfigurationContext,
): Promise<AppConfig> {
  return loadAppConfig(context);
}
