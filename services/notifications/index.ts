import type { NotificationLog } from "@/types/database";
import type { NotificationLogInsertInput } from "@/lib/validations/notification";

export type CreateNotificationLogInput = NotificationLogInsertInput;

export async function createNotificationLog(
  input: CreateNotificationLogInput,
): Promise<NotificationLog> {
  void input;
  throw new Error("Not implemented yet");
}
