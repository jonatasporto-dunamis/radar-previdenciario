import { describe, expect, it } from "vitest";
import {
  assertTenantAccess,
  isDevelopmentHostname,
  isVercelPreviewHostname,
  normalizeHostname,
  normalizeTenantSlug,
  TenantAccessError,
} from "@/lib/tenants";
import { TEST_TENANT_ID, TEST_TENANT_B_ID } from "@/tests/fixtures";

describe("tenant utilities", () => {
  it("normalizes hostnames without protocol, path or port", () => {
    expect(
      normalizeHostname("https://RadarPrevidenciario.com.br/cadastro"),
    ).toBe("radarprevidenciario.com.br");
    expect(normalizeHostname("localhost:3000")).toBe("localhost");
    expect(
      normalizeHostname("radarprevidenciario.com.br, proxy.internal"),
    ).toBe("radarprevidenciario.com.br");
    expect(isDevelopmentHostname("127.0.0.1:3000")).toBe(true);
    expect(isVercelPreviewHostname("tenant-preview.vercel.app")).toBe(true);
  });

  it("accepts only safe tenant slugs", () => {
    expect(normalizeTenantSlug(" Resende-Advogados ")).toBe(
      "resende-advogados",
    );
    expect(normalizeTenantSlug("../resende")).toBeNull();
  });

  it("throws when tenant ids do not match", () => {
    expect(() =>
      assertTenantAccess({
        expectedTenantId: TEST_TENANT_ID,
        actualTenantId: TEST_TENANT_B_ID,
        resource: "lead",
      }),
    ).toThrow(TenantAccessError);

    expect(() =>
      assertTenantAccess({
        expectedTenantId: TEST_TENANT_ID,
        actualTenantId: TEST_TENANT_ID,
      }),
    ).not.toThrow();
  });
});
