import { describe, expect, it } from "vitest";
import {
  getIntegrationSecretPresence,
  normalizeIntegrationSecretPayload,
} from "@/services/integrations/secretPayload";

describe("integration secret payload", () => {
  it("normalizes legacy Meta test event code keys to the canonical key", () => {
    const payload = normalizeIntegrationSecretPayload({
      accessToken: " token ",
      test_event_code: " TEST123 ",
      metaTestEventCode: "TEST456",
      ignored: "",
    });

    expect(payload).toEqual({
      accessToken: "token",
      testEventCode: "TEST456",
    });
  });

  it("reports secret presence without exposing values", () => {
    expect(
      getIntegrationSecretPresence({
        accessToken: "token",
        testEventCode: "TEST123",
      }),
    ).toEqual({
      hasAnySecret: true,
      hasAccessToken: true,
      hasTestEventCode: true,
    });
  });
});
