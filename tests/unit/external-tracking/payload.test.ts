import { describe, expect, it } from "vitest";
import { externalEventMappings } from "@/config/tracking";
import {
  buildExternalEventPayload,
  sanitizeExternalMetadata,
  sanitizeExternalPayload,
} from "@/services/external-tracking/payload";

const baseEvent = {
  eventName: "LeadSubmitted" as const,
  eventId: "rp_LeadSubmitted_11111111-1111-4111-8111-111111111111",
  eventTime: 1_785_000_000,
  eventSourceUrl: "https://radarprevidenciario.com.br/cadastro",
};

describe("external tracking payload", () => {
  it("keeps only allowed metadata keys", () => {
    expect(
      sanitizeExternalMetadata({
        source: "lead_registration",
        form_version: "v1",
        campaign_source: "meta",
      }),
    ).toEqual({
      source: "lead_registration",
      form_version: "v1",
      campaign_source: "meta",
    });
  });

  it("rejects sensitive metadata keys", () => {
    expect(() =>
      sanitizeExternalMetadata({
        source: "test",
        email: "lead@example.com",
      }),
    ).toThrow(/sensitive/i);

    expect(() =>
      sanitizeExternalMetadata({
        score: 90,
      }),
    ).toThrow(/sensitive/i);
  });

  it("does not expose fbclid in sanitized attribution", () => {
    const payload = sanitizeExternalPayload({
      ...baseEvent,
      attribution: {
        utmSource: "meta",
        utmMedium: "paid_social",
        fbclid: "fbclid-123",
      },
      metadata: {
        source: "browser",
      },
    });

    expect(payload.attribution).toMatchObject({
      utmSource: "meta",
      utmMedium: "paid_social",
    });
    expect(payload.attribution).not.toHaveProperty("fbclid");
  });

  it("maps LeadSubmitted to Meta Lead and GA4 generate_lead", () => {
    const payload = buildExternalEventPayload(baseEvent);

    expect(payload.metaEventName).toBe("Lead");
    expect(payload.ga4EventName).toBe("generate_lead");
    expect(externalEventMappings.LeadSubmitted.metaType).toBe("standard");
    expect(externalEventMappings.LeadSubmitted.ga4Type).toBe("recommended");
  });
});
