import type { LegalConfig } from "@/types/brand";
import type { ConfigurationContext } from "@/types/configuration";
import { getAppConfig } from "./getAppConfig";

export async function getLegalConfig(
  context?: ConfigurationContext,
): Promise<LegalConfig> {
  const config = await getAppConfig(context);

  return config.legal;
}
