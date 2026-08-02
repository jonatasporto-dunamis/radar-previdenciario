import { describe, expect, it } from "vitest";
import { shouldRedirectTenantToCanonical } from "@/lib/tenants";

const baseInput = {
  canonicalHostname: "radarprevidenciario.com.br",
  currentHostname: "alias.example.com",
  isOfficePanelPath: false,
  isPlatformSubdomain: false,
  isProduction: true,
  source: "hostname" as const,
};

describe("tenant canonical redirect", () => {
  it("keeps an active platform subdomain on its requested hostname", () => {
    expect(
      shouldRedirectTenantToCanonical({
        ...baseInput,
        currentHostname: "resende.radarprevidenciario.com.br",
        isPlatformSubdomain: true,
      }),
    ).toBe(false);
  });

  it("redirects a non-primary custom alias to the canonical hostname", () => {
    expect(shouldRedirectTenantToCanonical(baseInput)).toBe(true);
  });

  it("does not redirect the canonical hostname", () => {
    expect(
      shouldRedirectTenantToCanonical({
        ...baseInput,
        currentHostname: baseInput.canonicalHostname,
      }),
    ).toBe(false);
  });
});
