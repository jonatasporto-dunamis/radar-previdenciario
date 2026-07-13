import { afterEach, describe, expect, it } from "vitest";
import {
  ATTRIBUTION_STORAGE_KEY,
  clearAttributionFromSession,
  getAttributionFromSession,
  mergeAttribution,
  parseAttributionFromSearchParams,
  sanitizeAttributionValue,
  saveAttributionToSession,
} from "@/lib/attribution";

describe("attribution helpers", () => {
  afterEach(() => {
    window.sessionStorage.clear();
  });

  it("sanitizes control characters and angle brackets", () => {
    expect(sanitizeAttributionValue(" <meta>\u0000 campanha ", 20)).toBe(
      "meta campanha",
    );
    expect(sanitizeAttributionValue("   ", 20)).toBeNull();
    expect(sanitizeAttributionValue("abcdef", 3)).toBe("abc");
  });

  it("parses known UTM parameters from search params", () => {
    const params = new URLSearchParams(
      "utm_source=meta&utm_medium=paid&utm_campaign=campanha&unknown=x",
    );

    expect(parseAttributionFromSearchParams(params)).toEqual({
      utmSource: "meta",
      utmMedium: "paid",
      utmCampaign: "campanha",
    });
  });

  it("merges new attribution over existing non-empty values", () => {
    expect(
      mergeAttribution(
        { utmSource: "google", utmCampaign: "antiga" },
        { utmSource: "meta" },
      ),
    ).toEqual({
      utmSource: "meta",
      utmCampaign: "antiga",
    });
  });

  it("persists, reads and clears attribution from session storage", () => {
    saveAttributionToSession({ utmSource: "meta", utmMedium: "paid" });

    expect(
      JSON.parse(window.sessionStorage.getItem(ATTRIBUTION_STORAGE_KEY)!),
    ).toEqual({
      utmSource: "meta",
      utmMedium: "paid",
    });
    expect(getAttributionFromSession()).toEqual({
      utmSource: "meta",
      utmMedium: "paid",
    });

    clearAttributionFromSession();
    expect(getAttributionFromSession()).toEqual({});
  });

  it("ignores invalid storage payloads", () => {
    window.sessionStorage.setItem(ATTRIBUTION_STORAGE_KEY, '{"bad": true}');

    expect(getAttributionFromSession()).toEqual({});
  });

  it("handles malformed JSON and storage write failures", () => {
    window.sessionStorage.setItem(ATTRIBUTION_STORAGE_KEY, "{bad-json");
    expect(getAttributionFromSession()).toEqual({});

    const originalSetItem = window.sessionStorage.setItem;
    window.sessionStorage.setItem = () => {
      throw new Error("quota");
    };

    expect(() => saveAttributionToSession({ utmSource: "meta" })).not.toThrow();

    window.sessionStorage.setItem = originalSetItem;
  });
});
