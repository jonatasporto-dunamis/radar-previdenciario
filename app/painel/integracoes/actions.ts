"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  getIntegrationProviderFromSlug,
  getIntegrationProviderSlug,
  saveIntegrationSettings,
  runIntegrationConnectionTest,
  updateTenantEventMapping,
} from "@/services/office-dashboard/integrations";
import { requireTenantRole } from "@/services/office-dashboard/auth";
import type { IntegrationProvider } from "@/types/integrations";

function readString(formData: FormData, key: string): string {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

function readBoolean(formData: FormData, key: string): boolean {
  const value = formData.get(key);

  return value === "on" || value === "true";
}

function readProvider(formData: FormData): IntegrationProvider {
  const provider = getIntegrationProviderFromSlug(
    readString(formData, "provider"),
  );

  if (!provider) {
    throw new Error("Unsupported integration provider.");
  }

  return provider;
}

function getPublicConfiguration(
  provider: IntegrationProvider,
  formData: FormData,
): Record<string, unknown> {
  if (provider === "meta") {
    return {
      pixelId: readString(formData, "pixelId"),
      apiVersion: readString(formData, "apiVersion") || "v25.0",
      consentMode: readString(formData, "consentMode") || "marketing",
    };
  }

  if (provider === "ga4") {
    return {
      measurementId: readString(formData, "measurementId"),
      debugMode: readBoolean(formData, "debugMode"),
      consentMode: readString(formData, "consentMode") || "analytics",
    };
  }

  if (provider === "google_ads") {
    return {
      conversionId: readString(formData, "conversionId"),
      defaultConversionLabel: readString(formData, "defaultConversionLabel"),
      customerId: readString(formData, "customerId"),
      validateOnly: readBoolean(formData, "validateOnly"),
      consentMode: readString(formData, "consentMode") || "ads",
    };
  }

  return {
    pixelId: readString(formData, "pixelId"),
    debugMode: readBoolean(formData, "debugMode"),
    consentMode: readString(formData, "consentMode") || "marketing",
  };
}

function getSecrets(
  provider: IntegrationProvider,
  formData: FormData,
): Record<string, string> {
  if (provider === "meta") {
    return {
      accessToken: readString(formData, "accessToken"),
      testEventCode: readString(formData, "testEventCode"),
    };
  }

  if (provider === "ga4") {
    return {
      apiSecret: readString(formData, "apiSecret"),
    };
  }

  if (provider === "google_ads") {
    return {
      developerToken: readString(formData, "developerToken"),
      oauthClientId: readString(formData, "oauthClientId"),
      oauthClientSecret: readString(formData, "oauthClientSecret"),
      refreshToken: readString(formData, "refreshToken"),
      loginCustomerId: readString(formData, "loginCustomerId"),
    };
  }

  return {
    accessToken: readString(formData, "accessToken"),
    testEventCode: readString(formData, "testEventCode"),
  };
}

export async function saveIntegrationAction(formData: FormData) {
  const provider = readProvider(formData);
  const context = await requireTenantRole("manageIntegrations");

  try {
    await saveIntegrationSettings({
      context,
      provider,
      enabled: readBoolean(formData, "enabled"),
      browserTrackingEnabled: readBoolean(formData, "browserTrackingEnabled"),
      serverTrackingEnabled: readBoolean(formData, "serverTrackingEnabled"),
      testMode: readBoolean(formData, "testMode"),
      configuration: getPublicConfiguration(provider, formData),
      secrets: getSecrets(provider, formData),
    });
  } catch {
    redirect(
      `/painel/integracoes/${getIntegrationProviderSlug(provider)}?error=save_failed`,
    );
  }

  revalidatePath("/painel/integracoes");
  revalidatePath(`/painel/integracoes/${getIntegrationProviderSlug(provider)}`);
  redirect(
    `/painel/integracoes/${getIntegrationProviderSlug(provider)}?saved=1`,
  );
}

export async function testIntegrationAction(formData: FormData) {
  const provider = readProvider(formData);
  const context = await requireTenantRole("manageIntegrations");
  let status = "failed";

  try {
    const result = await runIntegrationConnectionTest({ context, provider });
    status = result.status;
  } catch {
    redirect(
      `/painel/integracoes/${getIntegrationProviderSlug(provider)}?error=test_failed`,
    );
  }

  revalidatePath("/painel/integracoes");
  revalidatePath(`/painel/integracoes/${getIntegrationProviderSlug(provider)}`);
  revalidatePath("/painel/integracoes/testes");
  redirect(
    `/painel/integracoes/${getIntegrationProviderSlug(provider)}?tested=${status}`,
  );
}

export async function updateEventMappingAction(formData: FormData) {
  const provider = readProvider(formData);
  const context = await requireTenantRole("manageIntegrations");

  try {
    await updateTenantEventMapping({
      context,
      provider,
      mappingId: readString(formData, "mappingId"),
      internalEvent: readString(formData, "internalEvent"),
      externalEvent: readString(formData, "externalEvent"),
      enabled: readBoolean(formData, "enabled"),
      valueSource: readString(formData, "valueSource") as
        "none" | "fixed" | "lead_value" | "conversion_value",
      currency: readString(formData, "currency") || "BRL",
    });
  } catch {
    redirect("/painel/integracoes/eventos?error=save_failed");
  }

  revalidatePath("/painel/integracoes/eventos");
  redirect("/painel/integracoes/eventos?saved=1");
}
