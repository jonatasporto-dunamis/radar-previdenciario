import { describe, expect, it } from "vitest";
import {
  createExternalEventId,
  resolveExternalEventId,
} from "@/services/external-tracking/event-id";

describe("external tracking event ids", () => {
  it("creates provider-safe ids without PII", () => {
    const eventId = createExternalEventId("LeadSubmitted");

    expect(eventId).toMatch(/^rp_LeadSubmitted_[0-9a-fA-F-]{36}$/);
    expect(eventId).not.toContain("@");
    expect(eventId).not.toContain(" ");
  });

  it("reuses an existing id instead of regenerating it", () => {
    const existing = "rp_QuizCompleted_11111111-1111-4111-8111-111111111111";

    expect(
      resolveExternalEventId({
        eventName: "QuizCompleted",
        eventId: existing,
      }),
    ).toBe(existing);
  });
});
