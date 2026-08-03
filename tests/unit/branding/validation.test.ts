import { describe, expect, it } from "vitest";
import {
  defaultTenantBrandingSettings,
  getContrastRatio,
  readTenantBrandingSettings,
  tenantBrandingFormSchema,
} from "@/lib/branding";
import { normalizeValidWhatsappNumber } from "@/lib/branding/whatsapp";

describe("tenant branding validation", () => {
  it("uses safe defaults when tenant metadata is absent or invalid", () => {
    expect(readTenantBrandingSettings({})).toEqual(
      defaultTenantBrandingSettings,
    );
    expect(
      readTenantBrandingSettings({ branding: { primaryColor: "red" } }),
    ).toEqual(defaultTenantBrandingSettings);
  });

  it("rejects color combinations below WCAG AA", () => {
    const result = tenantBrandingFormSchema.safeParse({
      ...defaultTenantBrandingSettings,
      displayName: "Escritório Teste",
      legalName: "Escritório Teste Ltda.",
      buttonColor: "#ffffff",
      buttonTextColor: "#eeeeee",
    });
    expect(result.success).toBe(false);
    expect(getContrastRatio("#ffffff", "#eeeeee")).toBeLessThan(4.5);
  });

  it("normalizes only plausible WhatsApp numbers", () => {
    expect(normalizeValidWhatsappNumber("+55 (24) 99999-1234")).toBe(
      "5524999991234",
    );
    expect(normalizeValidWhatsappNumber("00000000000")).toBe("");
    expect(normalizeValidWhatsappNumber("5500000000000")).toBe("");
    expect(normalizeValidWhatsappNumber("123")).toBe("");
  });
});
