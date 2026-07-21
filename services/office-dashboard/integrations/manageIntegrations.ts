import "server-only";
import { encryptTenantSecret } from "@/lib/security/tenant-secrets";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  integrationEventMappingSchema,
  validateProviderConfiguration,
} from "@/lib/validations/integrations";
import { insertAuditLog } from "../repositories";
import {
  defaultIntegrationMappings,
  integrationProviderDefinitions,
  integrationProviders,
} from "./catalog";
import type {
  IntegrationCardSummary,
  IntegrationDeliveryLog,
  IntegrationEventName,
  IntegrationProvider,
  IntegrationStatus,
  IntegrationTestRun,
  TenantEventMapping,
  TenantIntegration,
} from "@/types/integrations";
import type { OfficeUserContext } from "@/types/office-dashboard";
import type { Database, Json } from "@/types/supabase";

type IntegrationRow =
  Database["public"]["Tables"]["tenant_integrations"]["Row"];
type IntegrationSecretRow =
  Database["public"]["Tables"]["tenant_integration_secrets"]["Row"];
type EventMappingRow =
  Database["public"]["Tables"]["tenant_event_mappings"]["Row"];
type DeliveryLogRow =
  Database["public"]["Tables"]["integration_delivery_logs"]["Row"];
type TestRunRow = Database["public"]["Tables"]["integration_test_runs"]["Row"];

export type IntegrationDetail = {
  integration: TenantIntegration;
  mappings: TenantEventMapping[];
  latestDeliveries: IntegrationDeliveryLog[];
  latestTests: IntegrationTestRun[];
};

type SaveIntegrationInput = {
  context: OfficeUserContext;
  provider: IntegrationProvider;
  enabled: boolean;
  browserTrackingEnabled: boolean;
  serverTrackingEnabled: boolean;
  testMode: boolean;
  configuration: Record<string, unknown>;
  secrets?: Record<string, string>;
};

type UpdateMappingInput = {
  context: OfficeUserContext;
  mappingId: string;
  provider: IntegrationProvider;
  internalEvent: string;
  externalEvent: string;
  enabled: boolean;
  valueSource: "none" | "fixed" | "lead_value" | "conversion_value";
  currency: string;
};

const providerOrder = new Map<IntegrationProvider, number>(
  integrationProviders.map((provider, index) => [provider, index]),
);

function toRecord(value: Json | null): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, unknown>;
}

function isProvider(value: string): value is IntegrationProvider {
  return integrationProviders.includes(value as IntegrationProvider);
}

function mapIntegration(
  row: IntegrationRow,
  hasSecrets: boolean,
): TenantIntegration {
  const provider = isProvider(row.provider) ? row.provider : "meta";

  return {
    id: row.id,
    tenantId: row.tenant_id,
    provider,
    status: row.status as IntegrationStatus,
    enabled: row.enabled,
    browserTrackingEnabled: row.browser_tracking_enabled,
    serverTrackingEnabled: row.server_tracking_enabled,
    testMode: row.test_mode,
    configuration: toRecord(row.configuration),
    hasSecrets,
    lastTestedAt: row.last_tested_at,
    lastSuccessAt: row.last_success_at,
    lastErrorAt: row.last_error_at,
    lastErrorCode: row.last_error_code,
    lastErrorSummary: row.last_error_summary,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapMapping(row: EventMappingRow): TenantEventMapping {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    provider: row.provider as IntegrationProvider,
    internalEvent: row.internal_event as IntegrationEventName,
    externalEvent: row.external_event,
    enabled: row.enabled,
    configuration: toRecord(row.configuration),
    valueSource: row.value_source as TenantEventMapping["valueSource"],
    currency: row.currency,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapDelivery(row: DeliveryLogRow): IntegrationDeliveryLog {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    provider: row.provider as IntegrationProvider,
    internalEventId: row.internal_event_id,
    eventId: row.event_id,
    externalEvent: row.external_event,
    status: row.status as IntegrationDeliveryLog["status"],
    attempt: row.attempt,
    responseCode: row.response_code,
    errorCode: row.error_code,
    sanitizedError: row.sanitized_error,
    externalRequestId: row.external_request_id,
    testMode: row.test_mode,
    createdAt: row.created_at,
    deliveredAt: row.delivered_at,
  };
}

function mapTestRun(row: TestRunRow): IntegrationTestRun {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    provider: row.provider as IntegrationProvider,
    status: row.status as IntegrationTestRun["status"],
    testType: row.test_type as IntegrationTestRun["testType"],
    sanitizedResult: toRecord(row.sanitized_result),
    createdBy: row.created_by,
    createdAt: row.created_at,
  };
}

function getNonEmptySecrets(secrets?: Record<string, string>) {
  return Object.fromEntries(
    Object.entries(secrets ?? {})
      .map(([key, value]) => [key, value.trim()])
      .filter(([, value]) => value.length > 0),
  );
}

async function getSecretRows(
  integrationIds: string[],
): Promise<Map<string, IntegrationSecretRow>> {
  if (!integrationIds.length) {
    return new Map();
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("tenant_integration_secrets")
    .select("*")
    .in("tenant_integration_id", integrationIds);

  if (error) {
    throw new Error("Unable to load integration secret metadata.");
  }

  return new Map((data ?? []).map((row) => [row.tenant_integration_id, row]));
}

async function syncLegacyTrackingConfig(input: {
  tenantId: string;
  provider: IntegrationProvider;
  enabled: boolean;
  browserTrackingEnabled: boolean;
  testMode: boolean;
  configuration: Record<string, unknown>;
}) {
  if (input.provider !== "meta" && input.provider !== "ga4") {
    return;
  }

  const supabase = createSupabaseAdminClient();
  const stringValue = (key: string) => {
    const value = input.configuration[key];

    return typeof value === "string" && value.trim() ? value.trim() : null;
  };
  const patch =
    input.provider === "meta"
      ? {
          enabled: input.enabled,
          meta_enabled: input.enabled && input.browserTrackingEnabled,
          meta_pixel_id: stringValue("pixelId"),
          meta_api_version: stringValue("apiVersion") ?? "v25.0",
          meta_test_mode: input.testMode,
        }
      : {
          enabled: input.enabled,
          ga4_enabled: input.enabled && input.browserTrackingEnabled,
          ga4_measurement_id: stringValue("measurementId"),
        };

  await supabase
    .from("tenant_tracking_configs")
    .update(patch)
    .eq("tenant_id", input.tenantId);
}

export async function ensureTenantIntegrations(
  tenantId: string,
): Promise<void> {
  const supabase = createSupabaseAdminClient();
  const { data: integrations, error: integrationsError } = await supabase
    .from("tenant_integrations")
    .select("provider")
    .eq("tenant_id", tenantId);

  if (integrationsError) {
    throw new Error("Unable to load tenant integrations.");
  }

  const existingProviders = new Set(
    (integrations ?? []).map((row) => row.provider),
  );
  const missingProviders = integrationProviders.filter(
    (provider) => !existingProviders.has(provider),
  );

  if (missingProviders.length) {
    const { error } = await supabase.from("tenant_integrations").insert(
      missingProviders.map((provider) => ({
        tenant_id: tenantId,
        provider,
        status: "configuration_required",
        enabled: false,
        browser_tracking_enabled: false,
        server_tracking_enabled: false,
        test_mode: true,
        configuration: {},
      })),
    );

    if (error) {
      throw new Error("Unable to initialize tenant integrations.");
    }
  }

  const { data: mappings, error: mappingsError } = await supabase
    .from("tenant_event_mappings")
    .select("provider, internal_event")
    .eq("tenant_id", tenantId);

  if (mappingsError) {
    throw new Error("Unable to load tenant integration mappings.");
  }

  const existingMappings = new Set(
    (mappings ?? []).map((row) => `${row.provider}:${row.internal_event}`),
  );
  const missingMappings = defaultIntegrationMappings.filter(
    (mapping) =>
      !existingMappings.has(`${mapping.provider}:${mapping.internalEvent}`),
  );

  if (missingMappings.length) {
    const { error } = await supabase.from("tenant_event_mappings").insert(
      missingMappings.map((mapping) => ({
        tenant_id: tenantId,
        provider: mapping.provider,
        internal_event: mapping.internalEvent,
        external_event: mapping.externalEvent,
        enabled: mapping.enabled,
        configuration: {},
        value_source: "none",
        currency: "BRL",
      })),
    );

    if (error) {
      throw new Error("Unable to initialize tenant integration mappings.");
    }
  }
}

export async function listIntegrationCards(
  context: OfficeUserContext,
): Promise<IntegrationCardSummary[]> {
  await ensureTenantIntegrations(context.tenantId);

  const supabase = createSupabaseAdminClient();
  const [
    { data: integrations, error: integrationsError },
    { data: deliveries, error: deliveriesError },
    { data: tests, error: testsError },
  ] = await Promise.all([
    supabase
      .from("tenant_integrations")
      .select("*")
      .eq("tenant_id", context.tenantId),
    supabase
      .from("integration_delivery_logs")
      .select("*")
      .eq("tenant_id", context.tenantId)
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("integration_test_runs")
      .select("*")
      .eq("tenant_id", context.tenantId)
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  if (integrationsError || deliveriesError || testsError) {
    throw new Error("Unable to load integration dashboard.");
  }

  const secretsByIntegrationId = await getSecretRows(
    (integrations ?? []).map((row) => row.id),
  );
  const latestDeliveryByProvider = new Map<
    IntegrationProvider,
    IntegrationDeliveryLog
  >();
  const latestTestByProvider = new Map<
    IntegrationProvider,
    IntegrationTestRun
  >();

  (deliveries ?? []).map(mapDelivery).forEach((delivery) => {
    if (!latestDeliveryByProvider.has(delivery.provider)) {
      latestDeliveryByProvider.set(delivery.provider, delivery);
    }
  });

  (tests ?? []).map(mapTestRun).forEach((testRun) => {
    if (!latestTestByProvider.has(testRun.provider)) {
      latestTestByProvider.set(testRun.provider, testRun);
    }
  });

  return (integrations ?? [])
    .map((row) => {
      const integration = mapIntegration(
        row,
        secretsByIntegrationId.has(row.id),
      );

      return {
        ...integration,
        definition: integrationProviderDefinitions[integration.provider],
        latestDelivery:
          latestDeliveryByProvider.get(integration.provider) ?? null,
        latestTest: latestTestByProvider.get(integration.provider) ?? null,
      };
    })
    .sort(
      (a, b) =>
        (providerOrder.get(a.provider) ?? 999) -
        (providerOrder.get(b.provider) ?? 999),
    );
}

export async function getIntegrationDetail(input: {
  context: OfficeUserContext;
  provider: IntegrationProvider;
}): Promise<IntegrationDetail> {
  const cards = await listIntegrationCards(input.context);
  const integration = cards.find((card) => card.provider === input.provider);

  if (!integration) {
    throw new Error("Integration provider is not available.");
  }

  const supabase = createSupabaseAdminClient();
  const [
    { data: mappings, error: mappingsError },
    { data: deliveries, error: deliveriesError },
    { data: tests, error: testsError },
  ] = await Promise.all([
    supabase
      .from("tenant_event_mappings")
      .select("*")
      .eq("tenant_id", input.context.tenantId)
      .eq("provider", input.provider)
      .order("internal_event", { ascending: true }),
    supabase
      .from("integration_delivery_logs")
      .select("*")
      .eq("tenant_id", input.context.tenantId)
      .eq("provider", input.provider)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("integration_test_runs")
      .select("*")
      .eq("tenant_id", input.context.tenantId)
      .eq("provider", input.provider)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  if (mappingsError || deliveriesError || testsError) {
    throw new Error("Unable to load integration detail.");
  }

  return {
    integration,
    mappings: (mappings ?? []).map(mapMapping),
    latestDeliveries: (deliveries ?? []).map(mapDelivery),
    latestTests: (tests ?? []).map(mapTestRun),
  };
}

export async function saveIntegrationSettings(
  input: SaveIntegrationInput,
): Promise<void> {
  await ensureTenantIntegrations(input.context.tenantId);

  const supabase = createSupabaseAdminClient();
  const { data: existing, error: existingError } = await supabase
    .from("tenant_integrations")
    .select("*")
    .eq("tenant_id", input.context.tenantId)
    .eq("provider", input.provider)
    .single();

  if (existingError || !existing) {
    throw new Error("Unable to load integration for update.");
  }

  const newSecrets = getNonEmptySecrets(input.secrets);
  const secretRows = await getSecretRows([existing.id]);
  const willHaveSecrets =
    Object.keys(newSecrets).length > 0 || secretRows.has(existing.id);
  const issues = validateProviderConfiguration({
    provider: input.provider,
    configuration: input.configuration,
    serverTrackingEnabled: input.serverTrackingEnabled,
    hasSecrets: willHaveSecrets,
  });
  const canEnable =
    input.enabled && issues.length === 0 && Boolean(existing.last_success_at);
  const nextStatus: IntegrationStatus =
    issues.length > 0
      ? "configuration_required"
      : input.enabled && !existing.last_success_at
        ? "test_pending"
        : canEnable
          ? "connected"
          : "disconnected";

  const { error: updateError } = await supabase
    .from("tenant_integrations")
    .update({
      enabled: canEnable,
      browser_tracking_enabled: input.browserTrackingEnabled,
      server_tracking_enabled: input.serverTrackingEnabled,
      test_mode: input.testMode,
      configuration: input.configuration as Json,
      status: nextStatus,
      last_error_at: issues.length
        ? new Date().toISOString()
        : existing.last_error_at,
      last_error_code: issues.length
        ? "configuration_required"
        : existing.last_error_code,
      last_error_summary: issues.length
        ? issues.join(" ")
        : existing.last_error_summary,
      updated_by: input.context.userId,
    })
    .eq("id", existing.id)
    .eq("tenant_id", input.context.tenantId);

  if (updateError) {
    throw new Error("Unable to save integration settings.");
  }

  if (Object.keys(newSecrets).length > 0) {
    const encryptedPayload = encryptTenantSecret(JSON.stringify(newSecrets));
    const keyVersion = process.env.TENANT_SECRETS_KEY_VERSION || "v1";
    const { error: secretError } = await supabase
      .from("tenant_integration_secrets")
      .upsert(
        {
          tenant_integration_id: existing.id,
          encrypted_payload: encryptedPayload,
          encryption_version: "v1",
          key_version: keyVersion,
          rotated_at: new Date().toISOString(),
        },
        { onConflict: "tenant_integration_id" },
      );

    if (secretError) {
      throw new Error("Unable to store encrypted integration secret.");
    }

    await insertAuditLog({
      tenantId: input.context.tenantId,
      actorUserId: input.context.userId,
      action: "secret_rotated",
      entityType: "tenant_integration_secret",
      entityId: existing.id,
      metadata: {
        provider: input.provider,
        keysChanged: Object.keys(newSecrets),
      },
    });
  }

  await syncLegacyTrackingConfig({
    tenantId: input.context.tenantId,
    provider: input.provider,
    enabled: canEnable,
    browserTrackingEnabled: input.browserTrackingEnabled,
    testMode: input.testMode,
    configuration: input.configuration,
  });

  await insertAuditLog({
    tenantId: input.context.tenantId,
    actorUserId: input.context.userId,
    action: canEnable
      ? "integration_enabled"
      : input.enabled
        ? "integration_updated"
        : "integration_disabled",
    entityType: "tenant_integration",
    entityId: existing.id,
    metadata: {
      provider: input.provider,
      status: nextStatus,
      browserTrackingEnabled: input.browserTrackingEnabled,
      serverTrackingEnabled: input.serverTrackingEnabled,
      testMode: input.testMode,
      configurationIssues: issues,
    },
  });
}

export async function runIntegrationConnectionTest(input: {
  context: OfficeUserContext;
  provider: IntegrationProvider;
}): Promise<IntegrationTestRun> {
  const detail = await getIntegrationDetail(input);
  const issues = validateProviderConfiguration({
    provider: input.provider,
    configuration: detail.integration.configuration,
    serverTrackingEnabled: detail.integration.serverTrackingEnabled,
    hasSecrets: detail.integration.hasSecrets,
  });
  const status = issues.length ? "configuration_required" : "success";
  const integrationStatus: IntegrationStatus =
    status === "success" ? "connected" : "configuration_required";
  const now = new Date().toISOString();
  const sanitizedResult = {
    provider: input.provider,
    mode: detail.integration.testMode ? "test" : "configured",
    browserTrackingEnabled: detail.integration.browserTrackingEnabled,
    serverTrackingEnabled: detail.integration.serverTrackingEnabled,
    hasEncryptedSecrets: detail.integration.hasSecrets,
    checks: issues.length ? issues : ["Formato público validado."],
  };
  const supabase = createSupabaseAdminClient();
  const { data: testRun, error: testRunError } = await supabase
    .from("integration_test_runs")
    .insert({
      tenant_id: input.context.tenantId,
      provider: input.provider,
      status,
      test_type: "connection",
      sanitized_result: sanitizedResult,
      created_by: input.context.userId,
    })
    .select("*")
    .single();

  if (testRunError || !testRun) {
    throw new Error("Unable to record integration test.");
  }

  const { error: updateError } = await supabase
    .from("tenant_integrations")
    .update({
      status: integrationStatus,
      last_tested_at: now,
      last_success_at:
        status === "success" ? now : detail.integration.lastSuccessAt,
      last_error_at: status === "success" ? null : now,
      last_error_code: status === "success" ? null : "configuration_required",
      last_error_summary: status === "success" ? null : issues.join(" "),
      updated_by: input.context.userId,
    })
    .eq("id", detail.integration.id)
    .eq("tenant_id", input.context.tenantId);

  if (updateError) {
    throw new Error("Unable to update integration test status.");
  }

  await insertAuditLog({
    tenantId: input.context.tenantId,
    actorUserId: input.context.userId,
    action: "integration_tested",
    entityType: "integration_test_run",
    entityId: testRun.id,
    metadata: {
      provider: input.provider,
      status,
      issues,
    },
  });

  return mapTestRun(testRun);
}

export async function updateTenantEventMapping(
  input: UpdateMappingInput,
): Promise<void> {
  const parsed = integrationEventMappingSchema.parse({
    provider: input.provider,
    internalEvent: input.internalEvent,
    externalEvent: input.externalEvent,
    enabled: input.enabled,
    valueSource: input.valueSource,
    currency: input.currency,
  });

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("tenant_event_mappings")
    .update({
      external_event: parsed.externalEvent,
      enabled: parsed.enabled,
      value_source: parsed.valueSource,
      currency: parsed.currency,
      configuration: {},
    })
    .eq("id", input.mappingId)
    .eq("tenant_id", input.context.tenantId)
    .eq("provider", parsed.provider)
    .eq("internal_event", parsed.internalEvent);

  if (error) {
    throw new Error("Unable to update integration event mapping.");
  }

  await insertAuditLog({
    tenantId: input.context.tenantId,
    actorUserId: input.context.userId,
    action: "event_mapping_updated",
    entityType: "tenant_event_mapping",
    entityId: input.mappingId,
    metadata: {
      provider: input.provider,
      internalEvent: parsed.internalEvent,
      externalEvent: parsed.externalEvent,
      enabled: parsed.enabled,
      valueSource: parsed.valueSource,
      currency: parsed.currency,
    },
  });
}

export async function listTenantEventMappings(
  context: OfficeUserContext,
): Promise<TenantEventMapping[]> {
  await ensureTenantIntegrations(context.tenantId);

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("tenant_event_mappings")
    .select("*")
    .eq("tenant_id", context.tenantId)
    .order("provider", { ascending: true })
    .order("internal_event", { ascending: true });

  if (error) {
    throw new Error("Unable to list integration event mappings.");
  }

  return (data ?? []).map(mapMapping);
}

export async function listIntegrationDeliveryLogs(
  context: OfficeUserContext,
): Promise<IntegrationDeliveryLog[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("integration_delivery_logs")
    .select("*")
    .eq("tenant_id", context.tenantId)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    throw new Error("Unable to list integration delivery logs.");
  }

  return (data ?? []).map(mapDelivery);
}

export async function listIntegrationTestRuns(
  context: OfficeUserContext,
): Promise<IntegrationTestRun[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("integration_test_runs")
    .select("*")
    .eq("tenant_id", context.tenantId)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    throw new Error("Unable to list integration test runs.");
  }

  return (data ?? []).map(mapTestRun);
}
