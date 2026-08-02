import { describe, expect, it } from "vitest";

import nextConfig from "../../next.config";

describe("security headers", () => {
  it("permits the Meta Pixel SDK and delivery endpoint", async () => {
    const rules = await nextConfig.headers?.();
    const contentSecurityPolicy = rules
      ?.flatMap((rule) => rule.headers)
      .find((header) => header.key === "Content-Security-Policy")?.value;

    expect(contentSecurityPolicy).toContain(
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://connect.facebook.net",
    );
    expect(contentSecurityPolicy).toContain(
      "connect-src 'self' https://*.supabase.co https://connect.facebook.net https://www.facebook.com",
    );
  });
});
