import type { ExternalTrackingEventName } from "@/types/tracking";

export type TenantTrackingConfig = {
  id: string;
  tenantId: string;
  enabled: boolean;
  consentRequired: boolean;
  externalTrackingDryRun: boolean;
  metaEnabled: boolean;
  metaPixelId?: string | null;
  metaApiVersion: string;
  metaTestMode: boolean;
  ga4Enabled: boolean;
  ga4MeasurementId?: string | null;
  gtmEnabled: boolean;
  gtmContainerId?: string | null;
  eventConfig: Partial<
    Record<
      ExternalTrackingEventName,
      {
        enabled?: boolean;
        browser?: boolean;
        server?: boolean;
      }
    >
  >;
  createdAt: string;
  updatedAt: string;
};
