import { describe, expect, it } from "vitest";
import { validateProviderConfiguration } from "@/lib/validations/integrations";

describe("integration configuration validation", () => {
  it("requires valid Meta pixel id", () => {
    expect(
      validateProviderConfiguration({
        provider: "meta",
        configuration: { pixelId: "abc" },
        serverTrackingEnabled: false,
        hasSecrets: false,
      }),
    ).toContain("O Pixel/Dataset ID deve conter apenas números.");
  });

  it("requires GA4 measurement id format", () => {
    expect(
      validateProviderConfiguration({
        provider: "ga4",
        configuration: { measurementId: "UA-123" },
        serverTrackingEnabled: false,
        hasSecrets: false,
      }),
    ).toContain("Informe um Measurement ID no formato G-XXXXXXXXXX.");
  });

  it("requires encrypted secret metadata before server-side dispatch", () => {
    expect(
      validateProviderConfiguration({
        provider: "tiktok",
        configuration: { pixelId: "ABC123456789" },
        serverTrackingEnabled: true,
        hasSecrets: false,
      }),
    ).toContain("Configure a credencial server-side antes de ativar o envio.");
  });

  it("requires Meta access token before server-side dispatch", () => {
    expect(
      validateProviderConfiguration({
        provider: "meta",
        configuration: { pixelId: "123456789012345" },
        serverTrackingEnabled: true,
        hasSecrets: false,
      }),
    ).toContain("Informe o token da Conversions API.");
  });

  it("accepts valid browser-only Google Ads configuration", () => {
    expect(
      validateProviderConfiguration({
        provider: "google_ads",
        configuration: { conversionId: "AW-123456789" },
        serverTrackingEnabled: false,
        hasSecrets: false,
      }),
    ).toEqual([]);
  });
});
