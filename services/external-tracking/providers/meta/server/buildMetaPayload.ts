import "server-only";
import { externalEventMappings } from "@/config/tracking";
import {
  buildFbc,
  hashMetaValue,
  normalizeMetaEmail,
  normalizeMetaPhone,
  readFbp,
} from "./hashMetaUserData";
import type { ExternalTrackingEvent } from "@/types/tracking";
import type { Database } from "@/types/supabase";

type LeadRow = Database["public"]["Tables"]["leads"]["Row"];

export type MetaConversionsApiPayload = {
  data: Array<{
    event_name: string;
    event_time: number;
    event_id: string;
    action_source: "website";
    event_source_url?: string;
    user_data: {
      em?: string[];
      ph?: string[];
      client_ip_address?: string;
      client_user_agent?: string;
      fbp?: string;
      fbc?: string;
      external_id?: string[];
    };
    custom_data: Record<string, string | number | boolean>;
  }>;
  test_event_code?: string;
};

function buildCustomData(
  event: ExternalTrackingEvent,
): Record<string, string | number | boolean> {
  if (event.eventName === "QualifiedLead") {
    return {
      source: "qualification_pipeline",
      qualified: true,
    };
  }

  return {
    content_name: "Radar Previdenciário",
    content_category: "lead_generation",
    source: "web",
    form_version: "v1",
  };
}

export function buildMetaConversionsPayload(input: {
  event: ExternalTrackingEvent;
  lead?: LeadRow | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  cookieHeader?: string | null;
  testEventCode?: string;
}): MetaConversionsApiPayload {
  const mapping = externalEventMappings[input.event.eventName];
  const userData: MetaConversionsApiPayload["data"][number]["user_data"] = {};
  const email = normalizeMetaEmail(input.lead?.email);
  const phone = normalizeMetaPhone(input.lead?.phone);
  const fbp = readFbp(input.cookieHeader);
  const fbc = buildFbc({
    fbclid: input.event.attribution?.fbclid,
    eventTime: input.event.eventTime,
  });

  if (email) {
    userData.em = [hashMetaValue(email)];
  }

  if (phone) {
    userData.ph = [hashMetaValue(phone)];
  }

  if (input.lead?.id) {
    userData.external_id = [hashMetaValue(input.lead.id)];
  }

  if (input.ipAddress) {
    userData.client_ip_address = input.ipAddress;
  }

  if (input.userAgent) {
    userData.client_user_agent = input.userAgent;
  }

  if (fbp) {
    userData.fbp = fbp;
  }

  if (fbc) {
    userData.fbc = fbc;
  }

  const payload: MetaConversionsApiPayload = {
    data: [
      {
        event_name: mapping.meta,
        event_time: input.event.eventTime,
        event_id: input.event.eventId,
        action_source: "website",
        event_source_url: input.event.eventSourceUrl,
        user_data: userData,
        custom_data: buildCustomData(input.event),
      },
    ],
  };

  if (input.testEventCode) {
    payload.test_event_code = input.testEventCode;
  }

  return payload;
}
