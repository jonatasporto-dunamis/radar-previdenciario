import { getAppConfig } from "./getAppConfig";
import type { TrackingConfig } from "@/config/tracking";
import type { ConfigurationContext } from "@/types/configuration";
import type { ExternalTrackingEventName } from "@/types/tracking";
import { getTenantContext } from "@/services/tenants";
import { getTenantTrackingConfigByTenantId } from "@/services/tenants/repository";

function isExternalTrackingEventName(
  value: string,
  config: TrackingConfig,
): value is ExternalTrackingEventName {
  return Object.prototype.hasOwnProperty.call(config.events, value);
}

function mergeTenantTrackingConfig(input: {
  base: TrackingConfig;
  tenant: NonNullable<
    Awaited<ReturnType<typeof getTenantTrackingConfigByTenantId>>
  >;
}): TrackingConfig {
  const events = { ...input.base.events };

  Object.entries(input.tenant.eventConfig).forEach(([eventName, override]) => {
    if (!isExternalTrackingEventName(eventName, input.base) || !override) {
      return;
    }

    events[eventName] = {
      ...events[eventName],
      ...override,
    };
  });

  return {
    enabled: input.tenant.enabled,
    consentRequired: input.tenant.consentRequired,
    dryRun: input.tenant.externalTrackingDryRun,
    meta: {
      enabled: input.tenant.enabled && input.tenant.metaEnabled,
      pixelId: input.tenant.metaPixelId ?? undefined,
      apiVersion: input.tenant.metaApiVersion,
      testEventCode: input.base.meta.testEventCode,
      testMode: input.tenant.metaTestMode,
    },
    ga4: {
      enabled: input.tenant.enabled && input.tenant.ga4Enabled,
      measurementId: input.tenant.ga4MeasurementId ?? undefined,
    },
    gtm: {
      enabled: input.tenant.enabled && input.tenant.gtmEnabled,
      containerId: input.tenant.gtmContainerId ?? undefined,
    },
    events,
  };
}

export async function getTrackingConfig(
  context?: ConfigurationContext,
): Promise<TrackingConfig> {
  const config = await getAppConfig(context);
  const tenantContext = context?.tenantId
    ? context
    : await getTenantContext({
        hostname: context?.hostname,
        slug: context?.tenantSlug ?? context?.slug,
      });

  if (!tenantContext.tenantId) {
    return config.tracking;
  }

  const tenantTracking = await getTenantTrackingConfigByTenantId(
    tenantContext.tenantId,
  );

  if (!tenantTracking) {
    return config.tracking;
  }

  return mergeTenantTrackingConfig({
    base: config.tracking,
    tenant: tenantTracking,
  });
}
