import { beforeEach, describe, expect, it, vi } from "vitest";

const getTrackingConfig = vi.hoisted(() => vi.fn());
const resolveTrackingConsent = vi.hoisted(() => vi.fn());
const createDeliveryLog = vi.hoisted(() => vi.fn());
const updateDeliveryLog = vi.hoisted(() => vi.fn());
const findDeliveryByEvent = vi.hoisted(() => vi.fn());
const sendMetaConversionsEvent = vi.hoisted(() => vi.fn());
const supabase = vi.hoisted(() => {
  const builder: {
    select: ReturnType<typeof vi.fn>;
    eq: ReturnType<typeof vi.fn>;
    maybeSingle: ReturnType<typeof vi.fn>;
  } = {
    select: vi.fn(),
    eq: vi.fn(),
    maybeSingle: vi.fn(),
  };

  builder.select.mockReturnValue(builder);
  builder.eq.mockReturnValue(builder);

  return {
    from: vi.fn(() => builder),
    builder,
  };
});

vi.mock("@/services/configuration", () => ({
  getTrackingConfig,
}));

vi.mock("@/services/external-tracking/consent", () => ({
  resolveTrackingConsent,
}));

vi.mock("@/services/external-tracking/persistence", () => ({
  createDeliveryLog,
  updateDeliveryLog,
  findDeliveryByEvent,
}));

vi.mock("@/services/external-tracking/providers/meta/server", async () => {
  const actual = await vi.importActual<
    typeof import("@/services/external-tracking/providers/meta/server")
  >("@/services/external-tracking/providers/meta/server");

  return {
    ...actual,
    sendMetaConversionsEvent,
  };
});

vi.mock("@/lib/supabase/admin", () => ({
  createSupabaseAdminClient: () => ({
    from: supabase.from,
  }),
}));

vi.mock("next/headers", () => ({
  headers: () =>
    Promise.resolve({
      get: (key: string) => {
        const values: Record<string, string> = {
          "x-forwarded-for": "127.0.0.1",
          "user-agent": "Vitest",
          cookie: "_fbp=fb.1.123.456",
        };

        return values[key] ?? null;
      },
    }),
}));

const trackingConfig = {
  enabled: true,
  consentRequired: true,
  dryRun: false,
  meta: {
    enabled: true,
    pixelId: "123456",
    apiVersion: "v25.0",
    testMode: false,
  },
  ga4: {
    enabled: false,
  },
  gtm: {
    enabled: false,
  },
  events: {
    PageView: { enabled: true, browser: true, server: false },
    LeadStarted: { enabled: true, browser: true, server: false },
    LeadSubmitted: { enabled: true, browser: true, server: true },
    QuizStarted: { enabled: true, browser: true, server: false },
    QuizCompleted: { enabled: true, browser: true, server: true },
    QualifiedLead: { enabled: true, browser: true, server: true },
    ResultViewed: { enabled: true, browser: true, server: false },
    WhatsAppClick: { enabled: true, browser: true, server: false },
  },
};

const delivery = {
  id: "delivery-1",
  event_id: "rp_LeadSubmitted_11111111-1111-4111-8111-111111111111",
  provider: "meta_capi",
  channel: "server",
  status: "pending",
  attempt: 0,
};

const event = {
  eventName: "LeadSubmitted" as const,
  eventId: "rp_LeadSubmitted_11111111-1111-4111-8111-111111111111",
  eventTime: 1_785_000_000,
  eventSourceUrl: "https://radarprevidenciario.com.br/cadastro",
  leadId: "11111111-1111-4111-8111-111111111111",
  attribution: {
    fbclid: "fbclid-123",
    utmSource: "meta",
  },
  metadata: {
    source: "lead_registration",
  },
};

describe("external tracking orchestrator", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env.META_CONVERSIONS_API_ACCESS_TOKEN = "test-token";
    getTrackingConfig.mockResolvedValue(trackingConfig);
    resolveTrackingConsent.mockResolvedValue("granted");
    findDeliveryByEvent.mockResolvedValue(null);
    createDeliveryLog.mockResolvedValue(delivery);
    updateDeliveryLog.mockResolvedValue(delivery);
    sendMetaConversionsEvent.mockResolvedValue({
      ok: true,
      providerEventId: "fbtrace-1",
    });
    supabase.builder.maybeSingle.mockResolvedValue({
      data: {
        id: "11111111-1111-4111-8111-111111111111",
        email: "lead@example.com",
        phone: "5571981533737",
      },
      error: null,
    });
  });

  it("ignores server delivery when consent is denied", async () => {
    resolveTrackingConsent.mockResolvedValue("denied");
    const { dispatchExternalEvent } =
      await import("@/services/external-tracking");

    await expect(
      dispatchExternalEvent({
        event,
        server: true,
      }),
    ).resolves.toMatchObject({
      attempted: false,
      status: "ignored",
    });

    expect(createDeliveryLog).not.toHaveBeenCalled();
    expect(sendMetaConversionsEvent).not.toHaveBeenCalled();
  });

  it("records dry-run delivery without calling Meta", async () => {
    getTrackingConfig.mockResolvedValue({
      ...trackingConfig,
      dryRun: true,
    });
    const { dispatchExternalEvent } =
      await import("@/services/external-tracking");

    await expect(
      dispatchExternalEvent({
        event,
        server: true,
      }),
    ).resolves.toMatchObject({
      attempted: true,
      status: "ignored",
    });

    expect(createDeliveryLog).toHaveBeenCalledWith(
      expect.objectContaining({
        event_id: event.eventId,
        provider: "meta_capi",
        channel: "server",
        status: "pending",
      }),
    );
    expect(updateDeliveryLog).toHaveBeenCalledWith(
      "delivery-1",
      expect.objectContaining({
        status: "ignored",
      }),
    );
    expect(sendMetaConversionsEvent).not.toHaveBeenCalled();
  });

  it("does not duplicate an already sent provider delivery", async () => {
    findDeliveryByEvent.mockResolvedValue({
      ...delivery,
      status: "sent",
    });
    const { dispatchExternalEvent } =
      await import("@/services/external-tracking");

    await expect(
      dispatchExternalEvent({
        event,
        server: true,
      }),
    ).resolves.toMatchObject({
      attempted: false,
      status: "ignored",
    });

    expect(createDeliveryLog).not.toHaveBeenCalled();
    expect(sendMetaConversionsEvent).not.toHaveBeenCalled();
  });

  it("retries temporary Meta CAPI failures with the same event_id", async () => {
    sendMetaConversionsEvent
      .mockResolvedValueOnce({
        ok: false,
        temporary: true,
        error: "rate_limited",
      })
      .mockResolvedValueOnce({
        ok: true,
        providerEventId: "fbtrace-2",
      });
    const { dispatchExternalEvent } =
      await import("@/services/external-tracking");

    await expect(
      dispatchExternalEvent({
        event,
        server: true,
      }),
    ).resolves.toMatchObject({
      attempted: true,
      status: "sent",
    });

    expect(sendMetaConversionsEvent).toHaveBeenCalledTimes(2);
    expect(sendMetaConversionsEvent).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        payload: expect.objectContaining({
          data: [
            expect.objectContaining({
              event_id: event.eventId,
            }),
          ],
        }),
      }),
    );
    expect(updateDeliveryLog).toHaveBeenCalledWith(
      "delivery-1",
      expect.objectContaining({
        status: "retrying",
        last_error: "rate_limited",
      }),
    );
    expect(updateDeliveryLog).toHaveBeenCalledWith(
      "delivery-1",
      expect.objectContaining({
        status: "sent",
        provider_event_id: "fbtrace-2",
      }),
    );
  });
});
