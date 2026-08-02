import { beforeEach, describe, expect, it, vi } from "vitest";

const recordBrowserExternalDeliveryAction = vi.hoisted(() =>
  vi.fn().mockResolvedValue({ success: true }),
);

vi.mock("@/app/tracking/actions", () => ({
  recordBrowserExternalDeliveryAction,
}));

const enabledEvents = {
  PageView: { enabled: true, browser: true },
  LeadStarted: { enabled: true, browser: true },
  LeadSubmitted: { enabled: true, browser: true },
  QuizStarted: { enabled: true, browser: true },
  QuizCompleted: { enabled: true, browser: true },
  QualifiedLead: { enabled: true, browser: true },
  ResultViewed: { enabled: true, browser: true },
  WhatsAppClick: { enabled: true, browser: true },
};

describe("browser tracking dispatch", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    window.dataLayer = [];
    window.fbq = undefined;
    window._fbq = undefined;
    window.sessionStorage.clear();
    document.head.innerHTML = "";
  });

  it("initializes Meta synchronously before dispatching the first PageView", async () => {
    const { dispatchBrowserExternalEvent } =
      await import("@/lib/tracking/browser");

    dispatchBrowserExternalEvent({
      config: {
        enabled: true,
        consentRequired: false,
        meta: { enabled: true, pixelId: "123456" },
        ga4: { enabled: false },
        gtm: { enabled: false },
        events: enabledEvents,
      },
      eventName: "PageView",
      eventId: "rp_PageView_11111111-1111-4111-8111-111111111111",
      scope: "/",
    });

    expect(window.fbq?.queue).toEqual([
      ["init", "123456", {}, { autoConfig: false }],
      [
        "track",
        "PageView",
        {},
        { eventID: "rp_PageView_11111111-1111-4111-8111-111111111111" },
      ],
    ]);
    expect(
      document.querySelectorAll(
        'script[src="https://connect.facebook.net/en_US/fbevents.js"]',
      ),
    ).toHaveLength(1);
    expect(recordBrowserExternalDeliveryAction).toHaveBeenCalledOnce();
  });
});
