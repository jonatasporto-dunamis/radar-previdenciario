import "server-only";
import type { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { externalTrackingDeliveryUpdateSchema } from "@/lib/validations/external-tracking";
import type { ExternalTrackingDelivery } from "@/types/tracking";

export async function updateDeliveryLog(
  id: string,
  input: z.input<typeof externalTrackingDeliveryUpdateSchema>,
): Promise<ExternalTrackingDelivery | null> {
  const supabase = createSupabaseAdminClient();
  const payload = externalTrackingDeliveryUpdateSchema.parse(input);
  const { data, error } = await supabase
    .from("external_tracking_deliveries")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();

  if (error || !data) {
    return null;
  }

  return data as unknown as ExternalTrackingDelivery;
}
