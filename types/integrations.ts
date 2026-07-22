import type { ExternalTrackingEventName } from "./tracking";

export type IntegrationProvider = "meta" | "ga4" | "google_ads" | "tiktok";

export type IntegrationStatus =
  | "connected"
  | "configuration_required"
  | "disconnected"
  | "error"
  | "test_pending";

export type IntegrationTestStatus =
  "pending" | "success" | "failed" | "configuration_required";

export type IntegrationDeliveryStatus =
  | "pending"
  | "processing"
  | "sent"
  | "failed"
  | "retrying"
  | "ignored"
  | "cancelled"
  | "dead_letter";

export type IntegrationEventName =
  | ExternalTrackingEventName
  | "PageViewed"
  | "QuestionAnswered"
  | "ResultGenerated"
  | "LeadQualified"
  | "ContactStarted"
  | "LeadStatusChanged"
  | "LeadConverted"
  | "Purchase";

export type IntegrationProviderDefinition = {
  provider: IntegrationProvider;
  name: string;
  shortName: string;
  description: string;
  setupHint: string;
  supportsBrowser: boolean;
  supportsServer: boolean;
  requiresSecretForServer: boolean;
};

export type TenantIntegration = {
  id: string;
  tenantId: string;
  provider: IntegrationProvider;
  status: IntegrationStatus;
  enabled: boolean;
  browserTrackingEnabled: boolean;
  serverTrackingEnabled: boolean;
  testMode: boolean;
  configuration: Record<string, unknown>;
  hasSecrets: boolean;
  hasAccessToken: boolean;
  hasTestEventCode: boolean;
  lastTestedAt: string | null;
  lastSuccessAt: string | null;
  lastErrorAt: string | null;
  lastErrorCode: string | null;
  lastErrorSummary: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TenantEventMapping = {
  id: string;
  tenantId: string;
  provider: IntegrationProvider;
  internalEvent: IntegrationEventName;
  externalEvent: string;
  enabled: boolean;
  configuration: Record<string, unknown>;
  valueSource: "none" | "fixed" | "lead_value" | "conversion_value";
  currency: string;
  createdAt: string;
  updatedAt: string;
};

export type IntegrationDeliveryLog = {
  id: string;
  tenantId: string;
  provider: IntegrationProvider;
  internalEventId: string | null;
  eventId: string;
  externalEvent: string;
  status: IntegrationDeliveryStatus;
  attempt: number;
  responseCode: number | null;
  errorCode: string | null;
  sanitizedError: string | null;
  externalRequestId: string | null;
  testMode: boolean;
  createdAt: string;
  deliveredAt: string | null;
};

export type IntegrationTestRun = {
  id: string;
  tenantId: string;
  provider: IntegrationProvider;
  status: IntegrationTestStatus;
  testType: "connection" | "browser" | "server" | "mapping";
  sanitizedResult: Record<string, unknown>;
  createdBy: string | null;
  createdAt: string;
};

export type IntegrationCardSummary = TenantIntegration & {
  definition: IntegrationProviderDefinition;
  latestDelivery: IntegrationDeliveryLog | null;
  latestTest: IntegrationTestRun | null;
};
