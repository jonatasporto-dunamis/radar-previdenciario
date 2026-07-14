import type {
  ExternalTrackingChannel,
  ExternalTrackingDeliveryStatus,
  ExternalTrackingProvider,
} from "./providers";
import type { ExternalTrackingEventName } from "./external-events";

export type ExternalTrackingDelivery = {
  id: string;
  tenant_id: string;
  tracking_event_id: string | null;
  lead_id: string | null;
  session_id: string | null;
  result_id: string | null;
  event_name: ExternalTrackingEventName;
  event_id: string;
  provider: ExternalTrackingProvider;
  channel: ExternalTrackingChannel;
  status: ExternalTrackingDeliveryStatus;
  attempt: number;
  test_event: boolean;
  request_payload_hash: string | null;
  provider_event_id: string | null;
  queued_at: string | null;
  processing_started_at: string | null;
  sent_at: string | null;
  failed_at: string | null;
  last_error: string | null;
  created_at: string;
  updated_at: string;
};
