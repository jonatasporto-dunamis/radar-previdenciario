import { describe, expect, it } from "vitest";
import {
  notificationLogInsertSchema,
  notificationLogUpdateSchema,
  notificationPrioritySchema,
  notificationProviderSchema,
  notificationStatusSchema,
} from "@/lib/validations/notification";
import { createNotificationLogFixture } from "@/tests/fixtures";

const validHash =
  "abcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcd";

describe("notification validation schemas", () => {
  it("validates supported providers", () => {
    expect(notificationProviderSchema.parse("email")).toBe("email");
    expect(notificationProviderSchema.parse("whatsapp")).toBe("whatsapp");
    expect(notificationProviderSchema.safeParse("sms").success).toBe(false);
  });

  it("validates supported priorities", () => {
    expect(notificationPrioritySchema.parse("low")).toBe("low");
    expect(notificationPrioritySchema.parse("critical")).toBe("critical");
    expect(notificationPrioritySchema.safeParse("urgent").success).toBe(false);
  });

  it("validates supported statuses", () => {
    expect(notificationStatusSchema.parse("processing")).toBe("processing");
    expect(notificationStatusSchema.parse("cancelled")).toBe("cancelled");
    expect(notificationStatusSchema.safeParse("queued").success).toBe(false);
  });

  it("rejects negative attempts", () => {
    const result = notificationLogInsertSchema.safeParse({
      notification_type: "lead_qualified",
      recipient: "advocacia@example.com",
      attempt: -1,
    });

    expect(result.success).toBe(false);
  });

  it("rejects invalid payload hashes", () => {
    const tooShort = notificationLogInsertSchema.safeParse({
      notification_type: "lead_qualified",
      recipient: "advocacia@example.com",
      payload_hash: "abc",
    });
    const nonHex = notificationLogInsertSchema.safeParse({
      notification_type: "lead_qualified",
      recipient: "advocacia@example.com",
      payload_hash: "z".repeat(64),
    });

    expect(tooShort.success).toBe(false);
    expect(nonHex.success).toBe(false);
  });

  it("accepts a valid insert and applies pipeline defaults", () => {
    const result = notificationLogInsertSchema.parse({
      lead_id: "22222222-2222-4222-8222-222222222222",
      result_id: "33333333-3333-4333-8333-333333333333",
      notification_type: "lead_qualified",
      recipient: "advocacia@example.com",
      payload_hash: validHash.toUpperCase(),
      queued_at: "2026-07-12T12:00:00.000Z",
    });

    expect(result).toMatchObject({
      provider: "email",
      priority: "medium",
      status: "pending",
      attempt: 0,
      payload_hash: validHash,
    });
  });

  it("accepts a valid update", () => {
    const result = notificationLogUpdateSchema.parse({
      status: "retrying",
      priority: "high",
      attempt: 2,
      processing_started_at: "2026-07-12T12:01:00.000Z",
      last_error: "Provider returned a temporary failure.",
    });

    expect(result).toEqual({
      status: "retrying",
      priority: "high",
      attempt: 2,
      processing_started_at: "2026-07-12T12:01:00.000Z",
      last_error: "Provider returned a temporary failure.",
    });
  });

  it("keeps compatibility with pre-pipeline notification log shape", () => {
    const legacy = createNotificationLogFixture({
      provider: undefined,
      priority: undefined,
      attempt: undefined,
      payload_hash: undefined,
      queued_at: undefined,
      processing_started_at: undefined,
      failed_at: undefined,
      last_error: undefined,
      status: "sent",
      sent_at: "2026-07-12T12:02:00.000Z",
    } as Partial<ReturnType<typeof createNotificationLogFixture>>);

    const result = notificationLogInsertSchema.parse({
      notification_type: legacy.notification_type,
      recipient: legacy.recipient,
      status: legacy.status,
      error_message: legacy.error_message,
      sent_at: legacy.sent_at,
    });

    expect(result).toMatchObject({
      provider: "email",
      priority: "medium",
      attempt: 0,
      status: "sent",
      sent_at: "2026-07-12T12:02:00.000Z",
    });
  });
});
