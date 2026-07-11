import type { SeoConfig } from "@/types/brand";
import type { ConfigurationContext } from "@/types/configuration";
import { getAppConfig } from "./getAppConfig";

export async function getSeoConfig(
  context?: ConfigurationContext,
): Promise<SeoConfig> {
  const config = await getAppConfig(context);

  return config.seo;
}
