import type { ThemeConfig } from "@/types/brand";
import type { ConfigurationContext } from "@/types/configuration";
import { getAppConfig } from "./getAppConfig";

export async function getThemeConfig(
  context?: ConfigurationContext,
): Promise<ThemeConfig> {
  const config = await getAppConfig(context);

  return config.theme;
}
