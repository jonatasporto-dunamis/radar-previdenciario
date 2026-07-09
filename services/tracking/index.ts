import type { TrackingEvent } from "@/types/database";

export type TrackEventInput = Omit<TrackingEvent, "created_at" | "id">;

export async function trackEvent(
  input: TrackEventInput,
): Promise<TrackingEvent> {
  void input;
  throw new Error("Not implemented yet");
}
