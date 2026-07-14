import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  readTrackingConsent,
  TRACKING_CONSENT_COOKIE,
  writeTrackingConsent,
} from "@/lib/tracking/cookies";

describe("tracking consent cookie", () => {
  beforeEach(() => {
    document.cookie = `${TRACKING_CONSENT_COOKIE}=; Path=/; Max-Age=0`;
    vi.restoreAllMocks();
  });

  it("starts unknown when no cookie is present", () => {
    expect(readTrackingConsent()).toBe("unknown");
  });

  it("stores granted and denied decisions without user identifiers", () => {
    writeTrackingConsent("granted");

    expect(readTrackingConsent()).toBe("granted");
    expect(document.cookie).toContain(`${TRACKING_CONSENT_COOKIE}=granted`);
    expect(document.cookie).not.toContain("@");

    writeTrackingConsent("denied");

    expect(readTrackingConsent()).toBe("denied");
    expect(document.cookie).toContain(`${TRACKING_CONSENT_COOKIE}=denied`);
  });
});
