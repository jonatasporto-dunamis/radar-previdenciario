import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  notificationLogInsertSchema,
  notificationLogUpdateSchema,
  type NotificationLogInsertInput,
  type NotificationLogUpdateInput,
} from "@/lib/validations/notification";
import { sanitizeErrorMessage } from "@/services/notification/security";
import type { NotificationProvider } from "@/types/database";
import type { Database } from "@/types/supabase";

export type NotificationLogRow =
  Database["public"]["Tables"]["notification_logs"]["Row"];

export class NotificationLogPersistenceError extends Error {
  constructor(message = "Notification log persistence error") {
    super(message);
    this.name = "NotificationLogPersistenceError";
  }
}

export async function findNotificationLogByPayloadHash(input: {
  tenantId: string;
  provider: NotificationProvider;
  payloadHash: string;
}): Promise<NotificationLogRow | null> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("notification_logs")
    .select("*")
    .eq("tenant_id", input.tenantId)
    .eq("provider", input.provider)
    .eq("payload_hash", input.payloadHash)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new NotificationLogPersistenceError(
      "Failed to lookup notification log.",
    );
  }

  return data;
}

export async function createNotificationLog(
  input: NotificationLogInsertInput,
): Promise<NotificationLogRow> {
  const supabase = createSupabaseAdminClient();
  const payload = notificationLogInsertSchema.parse(input);
  const { data, error } = await supabase
    .from("notification_logs")
    .insert(payload)
    .select("*")
    .single();

  if (error || !data) {
    throw new NotificationLogPersistenceError(
      "Failed to create notification log.",
    );
  }

  return data;
}

export async function updateNotificationLog(
  tenantId: string,
  id: string,
  input: NotificationLogUpdateInput,
): Promise<NotificationLogRow> {
  const supabase = createSupabaseAdminClient();
  const payload = notificationLogUpdateSchema.parse(input);
  const { data, error } = await supabase
    .from("notification_logs")
    .update(payload)
    .eq("tenant_id", tenantId)
    .eq("id", id)
    .select("*")
    .single();

  if (error || !data) {
    throw new NotificationLogPersistenceError(
      "Failed to update notification log.",
    );
  }

  return data;
}

export async function markNotificationProcessing(input: {
  tenantId: string;
  logId: string;
  attempt: number;
}): Promise<NotificationLogRow> {
  return updateNotificationLog(input.tenantId, input.logId, {
    status: "processing",
    attempt: input.attempt,
    processing_started_at: new Date().toISOString(),
  });
}

export async function markNotificationSent(
  tenantId: string,
  logId: string,
): Promise<NotificationLogRow> {
  return updateNotificationLog(tenantId, logId, {
    status: "sent",
    sent_at: new Date().toISOString(),
    failed_at: null,
    error_message: null,
    last_error: null,
  });
}

export async function markNotificationRetrying(input: {
  tenantId: string;
  logId: string;
  attempt: number;
  error: unknown;
}): Promise<NotificationLogRow> {
  const message = sanitizeErrorMessage(input.error);

  return updateNotificationLog(input.tenantId, input.logId, {
    status: "retrying",
    attempt: input.attempt,
    failed_at: new Date().toISOString(),
    error_message: message,
    last_error: message,
  });
}

export async function markNotificationFailed(input: {
  tenantId: string;
  logId: string;
  attempt: number;
  error: unknown;
}): Promise<NotificationLogRow> {
  const message = sanitizeErrorMessage(input.error);

  return updateNotificationLog(input.tenantId, input.logId, {
    status: "failed",
    attempt: input.attempt,
    failed_at: new Date().toISOString(),
    error_message: message,
    last_error: message,
  });
}

export async function markNotificationIgnored(input: {
  tenantId: string;
  logId: string;
  reason: string;
}): Promise<NotificationLogRow> {
  return updateNotificationLog(input.tenantId, input.logId, {
    status: "ignored",
    last_error: sanitizeErrorMessage(input.reason),
  });
}
