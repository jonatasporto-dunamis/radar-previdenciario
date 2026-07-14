import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type {
  ExternalTrackingChannel,
  ExternalTrackingDelivery,
  ExternalTrackingProvider,
} from "@/types/tracking";

export async function findDeliveryByEvent(input: {
  tenantId: string;
  eventId: string;
  provider: ExternalTrackingProvider;
  channel: ExternalTrackingChannel;
}): Promise<ExternalTrackingDelivery | null> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("external_tracking_deliveries")
    .select("*")
    .eq("tenant_id", input.tenantId)
    .eq("event_id", input.eventId)
    .eq("provider", input.provider)
    .eq("channel", input.channel)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as unknown as ExternalTrackingDelivery;
}
