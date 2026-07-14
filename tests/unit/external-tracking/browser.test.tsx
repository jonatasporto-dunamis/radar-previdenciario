import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TrackingProvider } from "@/components/tracking/TrackingProvider";

const dispatchBrowserExternalEvent = vi.hoisted(() => vi.fn());

vi.mock("@/lib/tracking", () => {
  return {
    dispatchBrowserExternalEvent,
  };
});

describe("external browser tracking providers", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    window.dataLayer = [];
    window.gtag = undefined;
    window.fbq = undefined;
    window._fbq = undefined;
    document.head.innerHTML = "";
  });

  afterEach(() => {
    cleanup();
  });

  it("pushes the GTM dataLayer contract without PII", async () => {
    const { pushExternalEventToDataLayer } =
      await import("@/services/external-tracking/providers/gtm");

    pushExternalEventToDataLayer({
      eventName: "LeadSubmitted",
      eventId: "rp_LeadSubmitted_11111111-1111-4111-8111-111111111111",
      eventTime: 1_785_000_000,
      metadata: {
        source: "lead_registration",
        form_version: "v1",
        page_path: "/cadastro",
      },
    });

    expect(window.dataLayer).toContainEqual({
      event: "rp_external_event",
      rp_event_name: "LeadSubmitted",
      rp_event_id: "rp_LeadSubmitted_11111111-1111-4111-8111-111111111111",
      rp_event_time: 1_785_000_000,
      rp_source: "radar_previdenciario",
      source: "lead_registration",
      form_version: "v1",
      page_path: "/cadastro",
    });
    expect(JSON.stringify(window.dataLayer)).not.toContain("lead@example.com");
  });

  it("initializes Meta Pixel and tracks eventID for deduplication", async () => {
    const { initializeMetaPixel, trackMetaBrowserEvent } =
      await import("@/services/external-tracking/providers/meta/browser");

    initializeMetaPixel("123456");
    trackMetaBrowserEvent({
      eventName: "LeadSubmitted",
      eventId: "rp_LeadSubmitted_11111111-1111-4111-8111-111111111111",
      eventTime: 1_785_000_000,
      metadata: {
        source: "lead_registration",
      },
    });

    expect(window.fbq?.queue).toEqual(
      expect.arrayContaining([
        ["init", "123456", {}, { autoConfig: false }],
        [
          "track",
          "Lead",
          expect.objectContaining({
            content_category: "lead_generation",
          }),
          { eventID: "rp_LeadSubmitted_11111111-1111-4111-8111-111111111111" },
        ],
      ]),
    );
  });

  it("uses direct GA4 only as a fallback when gtag is initialized", async () => {
    const { initializeGa4, trackGa4BrowserEvent } =
      await import("@/services/external-tracking/providers/ga4/browser");

    initializeGa4("G-TEST123");
    trackGa4BrowserEvent({
      eventName: "LeadSubmitted",
      eventId: "rp_LeadSubmitted_11111111-1111-4111-8111-111111111111",
      eventTime: 1_785_000_000,
      attribution: {
        utmSource: "meta",
        utmMedium: "paid_social",
        utmCampaign: "campanha",
      },
      metadata: {
        source: "lead_registration",
        page_path: "/cadastro",
      },
    });

    expect(window.dataLayer).toContainEqual([
      "event",
      "generate_lead",
      expect.objectContaining({
        event_id: "rp_LeadSubmitted_11111111-1111-4111-8111-111111111111",
        campaign_source: "meta",
        campaign_medium: "paid_social",
        campaign_name: "campanha",
      }),
    ]);
  });

  it("keeps WhatsApp navigation independent from tracking failures", async () => {
    dispatchBrowserExternalEvent.mockImplementation(() => {
      throw new Error("tracking failed");
    });
    const { TrackedWhatsAppLink } =
      await import("@/components/tracking/TrackedWhatsAppLink");

    expect(() =>
      render(
        <TrackingProvider
          config={{
            enabled: true,
            consentRequired: false,
            meta: { enabled: false },
            ga4: { enabled: false },
            gtm: { enabled: false },
            events: {
              PageView: { enabled: true, browser: true },
              LeadStarted: { enabled: true, browser: true },
              LeadSubmitted: { enabled: true, browser: true },
              QuizStarted: { enabled: true, browser: true },
              QuizCompleted: { enabled: true, browser: true },
              QualifiedLead: { enabled: true, browser: true },
              ResultViewed: { enabled: true, browser: true },
              WhatsAppClick: { enabled: true, browser: true },
            },
          }}
        >
          <TrackedWhatsAppLink
            href="https://wa.me/5571981533737"
            location="floating_button"
          >
            WhatsApp
          </TrackedWhatsAppLink>
        </TrackingProvider>,
      ),
    ).not.toThrow();

    expect(() => fireEvent.click(screen.getByRole("link"))).not.toThrow();
  });
});
