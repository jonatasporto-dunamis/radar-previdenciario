import { z } from "zod";
import { integrationProviders } from "@/services/office-dashboard/integrations/catalog";

export const integrationProviderSchema = z.enum(integrationProviders);

export const integrationConfigurationSchema = z
  .object({
    provider: integrationProviderSchema,
    enabled: z.boolean(),
    browserTrackingEnabled: z.boolean(),
    serverTrackingEnabled: z.boolean(),
    testMode: z.boolean(),
    configuration: z.record(z.string(), z.unknown()),
    secrets: z.record(z.string(), z.string().trim().min(1)).optional(),
  })
  .strict();

export const integrationEventMappingSchema = z
  .object({
    provider: integrationProviderSchema,
    internalEvent: z.string().trim().min(1).max(80),
    externalEvent: z.string().trim().min(1).max(120),
    enabled: z.boolean(),
    valueSource: z
      .enum(["none", "fixed", "lead_value", "conversion_value"])
      .default("none"),
    currency: z
      .string()
      .trim()
      .regex(/^[A-Z]{3}$/)
      .default("BRL"),
  })
  .strict();

export function validateProviderConfiguration(input: {
  provider: z.infer<typeof integrationProviderSchema>;
  configuration: Record<string, unknown>;
  serverTrackingEnabled: boolean;
  hasSecrets: boolean;
}) {
  const issues: string[] = [];
  const getString = (key: string) => {
    const value = input.configuration[key];

    return typeof value === "string" ? value.trim() : "";
  };

  if (input.provider === "meta") {
    if (!/^[0-9]{5,30}$/.test(getString("pixelId"))) {
      issues.push("Informe um Pixel/Dataset ID numérico.");
    }
  }

  if (input.provider === "ga4") {
    if (!/^G-[A-Z0-9]{4,}$/.test(getString("measurementId"))) {
      issues.push("Informe um Measurement ID no formato G-XXXXXXXXXX.");
    }
  }

  if (input.provider === "google_ads") {
    const conversionId = getString("conversionId");

    if (conversionId && !/^AW-[0-9]{6,}$/.test(conversionId)) {
      issues.push("O Conversion ID deve seguir o formato AW-XXXXXXXXX.");
    }
  }

  if (input.provider === "tiktok") {
    if (!/^[A-Z0-9]{8,40}$/i.test(getString("pixelId"))) {
      issues.push("Informe um Pixel Code/ID válido para TikTok.");
    }
  }

  if (input.serverTrackingEnabled && !input.hasSecrets) {
    issues.push("Configure a credencial server-side antes de ativar o envio.");
  }

  return issues;
}
