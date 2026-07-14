import { createHash } from "crypto";
import { describe, expect, it, vi } from "vitest";
import {
  buildFbc,
  buildMetaConversionsPayload,
  hashMetaValue,
  normalizeMetaEmail,
  normalizeMetaPhone,
  readFbp,
  sendMetaConversionsEvent,
} from "@/services/external-tracking/providers/meta/server";

const lead = {
  id: "11111111-1111-4111-8111-111111111111",
  email: " LEAD@Example.COM ",
  phone: "(71) 98153-3737",
} as never;

describe("Meta external tracking", () => {
  it("normalizes and hashes user data", () => {
    const normalizedEmail = normalizeMetaEmail(" LEAD@Example.COM ");
    const normalizedPhone = normalizeMetaPhone("(71) 98153-3737");

    expect(normalizedEmail).toBe("lead@example.com");
    expect(normalizedPhone).toBe("5571981533737");
    expect(hashMetaValue(normalizedEmail)).toBe(
      createHash("sha256").update("lead@example.com").digest("hex"),
    );
  });

  it("builds fbc and reads fbp without inventing missing values", () => {
    expect(buildFbc({ fbclid: "abc123", eventTime: 1_785 })).toBe(
      "fb.1.1785.abc123",
    );
    expect(buildFbc({ fbclid: "abc 123", eventTime: 1_785 })).toBeUndefined();
    expect(readFbp("_fbp=fb.1.123.456; other=value")).toBe("fb.1.123.456");
    expect(readFbp(null)).toBeUndefined();
  });

  it("builds Lead payload with hashed PII and safe custom_data", () => {
    const payload = buildMetaConversionsPayload({
      event: {
        eventName: "LeadSubmitted",
        eventId: "rp_LeadSubmitted_11111111-1111-4111-8111-111111111111",
        eventTime: 1_785_000_000,
        eventSourceUrl: "https://radarprevidenciario.com.br/cadastro",
        attribution: {
          fbclid: "fbclid-123",
        },
      },
      lead,
      ipAddress: "127.0.0.1",
      userAgent: "Vitest",
      cookieHeader: "_fbp=fb.1.123.456",
      testEventCode: "TEST123",
    });
    const event = payload.data[0];

    expect(event.event_name).toBe("Lead");
    expect(event.event_id).toBe(
      "rp_LeadSubmitted_11111111-1111-4111-8111-111111111111",
    );
    expect(event.user_data.em?.[0]).toBe(hashMetaValue("lead@example.com"));
    expect(event.user_data.ph?.[0]).toBe(hashMetaValue("5571981533737"));
    expect(event.user_data.fbp).toBe("fb.1.123.456");
    expect(event.user_data.fbc).toBe("fb.1.1785000000.fbclid-123");
    expect(JSON.stringify(event.custom_data)).not.toContain("alto_potencial");
    expect(payload.test_event_code).toBe("TEST123");
  });

  it("keeps QualifiedLead custom_data generic", () => {
    const payload = buildMetaConversionsPayload({
      event: {
        eventName: "QualifiedLead",
        eventId: "rp_QualifiedLead_11111111-1111-4111-8111-111111111111",
        eventTime: 1_785_000_000,
      },
      lead,
    });

    expect(payload.data[0].custom_data).toEqual({
      source: "qualification_pipeline",
      qualified: true,
    });
  });

  it("classifies Meta CAPI responses without leaking tokens", async () => {
    const fetcher = vi.fn().mockResolvedValue(
      new Response("too many requests", {
        status: 429,
      }),
    );

    await expect(
      sendMetaConversionsEvent({
        pixelId: "123",
        accessToken: "secret-token",
        apiVersion: "v25.0",
        payload: { data: [] },
        fetcher,
      }),
    ).resolves.toMatchObject({
      ok: false,
      temporary: true,
    });

    expect(fetcher.mock.calls[0][0]).toContain("access_token=secret-token");
  });

  it("does not retry permanent Meta CAPI validation errors in the client", async () => {
    await expect(
      sendMetaConversionsEvent({
        pixelId: "123",
        accessToken: "token",
        apiVersion: "v25.0",
        payload: { data: [] },
        fetcher: vi.fn().mockResolvedValue(
          new Response("bad request", {
            status: 400,
          }),
        ),
      }),
    ).resolves.toMatchObject({
      ok: false,
      temporary: false,
    });
  });

  it("treats fetch failures as temporary", async () => {
    await expect(
      sendMetaConversionsEvent({
        pixelId: "123",
        accessToken: "token",
        apiVersion: "v25.0",
        payload: { data: [] },
        fetcher: vi.fn().mockRejectedValue(new Error("timeout")),
      }),
    ).resolves.toMatchObject({
      ok: false,
      temporary: true,
    });
  });
});
