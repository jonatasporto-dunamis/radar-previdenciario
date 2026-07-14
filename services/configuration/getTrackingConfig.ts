import { getAppConfig } from "./getAppConfig";
import type { TrackingConfig } from "@/config/tracking";
import type { ConfigurationContext } from "@/types/configuration";

export async function getTrackingConfig(
  context?: ConfigurationContext,
): Promise<TrackingConfig> {
  const config = await getAppConfig(context);

  return config.tracking;
}
