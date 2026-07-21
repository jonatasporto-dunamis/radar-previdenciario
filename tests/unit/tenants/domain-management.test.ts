import { describe, expect, it } from "vitest";
import {
  normalizeDashboardHostname,
  validateCustomDomainHostname,
  validatePlatformSubdomainSlug,
} from "@/lib/validations/domain-management";

describe("tenant domain validation", () => {
  it("normalizes safe hostnames and rejects protocols, ports and paths", () => {
    expect(normalizeDashboardHostname("Beneficios.Example.com")).toBe(
      "beneficios.example.com",
    );
    expect(normalizeDashboardHostname("https://example.com")).toBeNull();
    expect(normalizeDashboardHostname("example.com/painel")).toBeNull();
    expect(normalizeDashboardHostname("example.com:443")).toBeNull();
    expect(normalizeDashboardHostname("*.example.com")).toBeNull();
  });

  it("validates custom domains without accepting localhost-like values", () => {
    expect(validateCustomDomainHostname("radar.escritorio.com.br")).toEqual({
      success: true,
      hostname: "radar.escritorio.com.br",
    });
    expect(validateCustomDomainHostname("localhost")).toMatchObject({
      success: false,
    });
  });

  it("validates platform subdomain slugs and blocks reserved names", () => {
    expect(validatePlatformSubdomainSlug("resende")).toEqual({
      success: true,
      hostname: "resende.radarprevidenciario.com.br",
    });
    expect(validatePlatformSubdomainSlug("api")).toMatchObject({
      success: false,
    });
    expect(validatePlatformSubdomainSlug("-resende")).toMatchObject({
      success: false,
    });
  });
});
