import "server-only";
import type { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { externalTrackingDeliveryInsertSchema } from "@/lib/validations/external-tracking";
import type { ExternalTrackingDelivery } from "@/types/tracking";

export async function createDeliveryLog(
  input: z.input<typeof externalTrackingDeliveryInsertSchema>,
): Promise<ExternalTrackingDelivery | null> {
  const supabase = createSupabaseAdminClient();
  const payload = externalTrackingDeliveryInsertSchema.parse(input);
  const { data, error } = await supabase
    .from("external_tracking_deliveries")
    .upsert(payload, {
      onConflict: "event_id,provider,channel",
      ignoreDuplicates: false,
    })
    .select("*")
    .single();

  if (error || !data) {
    return null;
  }

  return data as unknown as ExternalTrackingDelivery;
}
