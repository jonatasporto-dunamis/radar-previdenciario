import { describe, expect, it } from "vitest";
import { getNotificationIdempotencyDecision } from "@/services/notification/pipeline";
import { createNotificationLogFixture } from "@/tests/fixtures";
import type { NotificationLogRow } from "@/services/notification/persistence";

describe("notification idempotency", () => {
  it("cria log quando nao existe notificacao previa", () => {
    expect(getNotificationIdempotencyDecision(null)).toEqual({
      action: "create",
      reason: "not_found",
    });
  });

  it("nao reenvia quando ja existe envio sent", () => {
    const log = createNotificationLogFixture({
      status: "sent",
    }) as NotificationLogRow;

    expect(getNotificationIdempotencyDecision(log)).toMatchObject({
      action: "skip",
      reason: "already_sent",
      log,
    });
  });

  it("nao duplica notificacao em progresso", () => {
    const log = createNotificationLogFixture({
      status: "retrying",
      attempt: 1,
    }) as NotificationLogRow;

    expect(getNotificationIdempotencyDecision(log)).toMatchObject({
      action: "skip",
      reason: "already_in_progress",
    });
  });

  it("reutiliza log failed para retry controlado", () => {
    const log = createNotificationLogFixture({
      status: "failed",
      attempt: 1,
    }) as NotificationLogRow;

    expect(getNotificationIdempotencyDecision(log)).toMatchObject({
      action: "dispatch_existing",
      reason: "retry_failed",
      log,
    });
  });
});
