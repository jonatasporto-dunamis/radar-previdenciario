import type { BrandConfig } from "@/types/brand";
import type { ConfigurationContext } from "@/types/configuration";
import { getAppConfig } from "./getAppConfig";

export async function getBrandConfig(
  context?: ConfigurationContext,
): Promise<BrandConfig> {
  const config = await getAppConfig(context);

  return config.brand;
}
