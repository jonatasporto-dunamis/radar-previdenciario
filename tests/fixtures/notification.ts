import type { NotificationLog } from "@/types/database";
import { TEST_TENANT_ID } from "./tenant";

const createdAt = "2026-07-12T12:00:00.000Z";

export function createNotificationLogFixture(
  overrides: Partial<NotificationLog> = {},
): NotificationLog {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    tenant_id: TEST_TENANT_ID,
    lead_id: "22222222-2222-4222-8222-222222222222",
    result_id: "33333333-3333-4333-8333-333333333333",
    notification_type: "lead_qualified",
    recipient: "advocacia@example.com",
    provider: "email",
    priority: "medium",
    status: "pending",
    attempt: 0,
    payload_hash:
      "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    queued_at: null,
    processing_started_at: null,
    error_message: null,
    last_error: null,
    sent_at: null,
    failed_at: null,
    created_at: createdAt,
    ...overrides,
  };
}
