import type { NotificationLogRow } from "../persistence";

export type NotificationIdempotencyDecision =
  | {
      action: "create";
      reason: "not_found";
    }
  | {
      action: "dispatch_existing";
      reason: "retry_failed";
      log: NotificationLogRow;
    }
  | {
      action: "skip";
      reason: "already_sent" | "already_in_progress" | "cancelled";
      log: NotificationLogRow;
    };

export function getNotificationIdempotencyDecision(
  log: NotificationLogRow | null,
): NotificationIdempotencyDecision {
  if (!log) {
    return {
      action: "create",
      reason: "not_found",
    };
  }

  if (log.status === "sent") {
    return {
      action: "skip",
      reason: "already_sent",
      log,
    };
  }

  if (
    log.status === "pending" ||
    log.status === "processing" ||
    log.status === "retrying"
  ) {
    return {
      action: "skip",
      reason: "already_in_progress",
      log,
    };
  }

  if (log.status === "cancelled") {
    return {
      action: "skip",
      reason: "cancelled",
      log,
    };
  }

  return {
    action: "dispatch_existing",
    reason: "retry_failed",
    log,
  };
}
