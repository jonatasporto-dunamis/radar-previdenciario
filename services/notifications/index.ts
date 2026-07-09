import type { NotificationLog } from "@/types/database";

export type CreateNotificationLogInput = Omit<
  NotificationLog,
  "created_at" | "id" | "status"
> &
  Partial<Pick<NotificationLog, "status">>;

export async function createNotificationLog(
  input: CreateNotificationLogInput,
): Promise<NotificationLog> {
  void input;
  throw new Error("Not implemented yet");
}
