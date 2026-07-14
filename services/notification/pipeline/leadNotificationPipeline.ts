import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getOfficeConfig } from "@/services/configuration";
import {
  createExternalEventId,
  dispatchExternalEvent,
} from "@/services/external-tracking";
import { qualifyLeadFromResult } from "@/services/qualification";
import { trackEvent, trackEventOnce } from "@/services/tracking";
import { notificationConfig } from "../config";
import { EmailProvider } from "../providers";
import {
  createNotificationLog,
  findNotificationLogByPayloadHash,
  type NotificationLogRow,
} from "../persistence";
import { SyncNotificationQueue, type NotificationQueue } from "../queue";
import {
  renderLeadNotificationEmail,
  selectLeadNotificationTemplate,
} from "../templates";
import {
  buildLeadNotificationPayload,
  computeNotificationPayloadHash,
} from "./payload";
import { getNotificationIdempotencyDecision } from "./idempotency";
import type { Database } from "@/types/supabase";
import type { AttributionData } from "@/types/attribution";
import type { QuizAnswerMap, QuizResultComputation } from "@/types/quiz";

type LeadRow = Database["public"]["Tables"]["leads"]["Row"];
type QuizResultRow = Database["public"]["Tables"]["quiz_results"]["Row"];

export type LeadNotificationPipelineInput = {
  leadId: string;
  sessionId: string;
  result: QuizResultRow;
  computedResult: QuizResultComputation;
  answers: QuizAnswerMap;
};

export type LeadNotificationPipelineResult =
  | {
      status: "ignored";
      reason: string;
      logId?: string;
    }
  | {
      status: "queued" | "sent" | "failed";
      logId: string;
    };

type LeadNotificationPipelineDependencies = {
  queue: NotificationQueue;
};

async function getLeadForNotification(leadId: string): Promise<LeadRow | null> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("id", leadId)
    .maybeSingle();

  if (error) {
    throw new Error("Failed to load lead for notification.");
  }

  return data;
}

function leadAttributionToTracking(lead: LeadRow): AttributionData {
  return {
    utmSource: lead.utm_source,
    utmMedium: lead.utm_medium,
    utmCampaign: lead.utm_campaign,
    utmContent: lead.utm_content,
    utmTerm: lead.utm_term,
    fbclid: lead.fbclid,
    gclid: lead.gclid,
    campaignId: lead.campaign_id,
    adsetId: lead.adset_id,
    adId: lead.ad_id,
    placement: lead.placement,
    siteSourceName: lead.site_source_name,
    referrer: lead.referrer,
    landingPage: lead.landing_page,
  };
}

function sanitizeEventSourceUrl(value: string | null): string | undefined {
  if (!value) {
    return undefined;
  }

  try {
    const url = new URL(value);

    return `${url.origin}${url.pathname}`;
  } catch {
    return undefined;
  }
}

async function trackNotificationQueued(input: {
  log: NotificationLogRow;
  sessionId: string;
}): Promise<void> {
  await trackEvent({
    leadId: input.log.lead_id,
    sessionId: input.sessionId,
    eventName: "NotificationQueued",
    eventPayload: {
      notificationLogId: input.log.id,
      provider: input.log.provider,
      priority: input.log.priority,
      resultId: input.log.result_id,
    },
  });
}

async function trackNotificationIgnored(input: {
  leadId: string | null;
  sessionId: string;
  logId?: string;
  reason: string;
}): Promise<void> {
  await trackEvent({
    leadId: input.leadId,
    sessionId: input.sessionId,
    eventName: "NotificationIgnored",
    eventPayload: {
      notificationLogId: input.logId ?? null,
      reason: input.reason,
    },
  });
}

async function trackQualifiedLead(input: {
  lead: LeadRow;
  sessionId: string;
  resultId: string;
}): Promise<void> {
  const externalEventId = createExternalEventId("QualifiedLead");
  const attribution = leadAttributionToTracking(input.lead);
  const tracked = await trackEventOnce({
    leadId: input.lead.id,
    sessionId: input.sessionId,
    eventName: "QualifiedLead",
    eventPayload: {
      source: "qualification_pipeline",
      resultId: input.resultId,
      qualified: true,
      external_event_id: externalEventId,
    },
    eventPayloadContains: {
      resultId: input.resultId,
    },
    attribution,
    userAgent: input.lead.user_agent,
    ipAddress: input.lead.ip_address,
  });

  if (!tracked) {
    return;
  }

  void dispatchExternalEvent({
    event: {
      eventName: "QualifiedLead",
      eventId: externalEventId,
      eventTime: Math.floor(Date.now() / 1000),
      eventSourceUrl: sanitizeEventSourceUrl(input.lead.landing_page),
      leadId: input.lead.id,
      sessionId: input.sessionId,
      resultId: input.resultId,
      attribution,
      metadata: {
        source: "qualification_pipeline",
        qualified: true,
      },
    },
    server: true,
    ipAddress: input.lead.ip_address,
    userAgent: input.lead.user_agent,
  }).catch(() => undefined);
}

export async function runLeadQualificationNotificationPipeline(
  input: LeadNotificationPipelineInput,
  dependencies: LeadNotificationPipelineDependencies = {
    queue: new SyncNotificationQueue(),
  },
): Promise<LeadNotificationPipelineResult> {
  try {
    const lead = await getLeadForNotification(input.leadId);

    if (!lead) {
      return {
        status: "ignored",
        reason: "lead_not_found",
      };
    }

    const qualification = qualifyLeadFromResult(input.computedResult);
    const office = await getOfficeConfig();
    const recipient = office.email.notificationEmail || "not-configured";
    const template = selectLeadNotificationTemplate(
      input.computedResult.classification,
    );
    const payloadHash = computeNotificationPayloadHash({
      provider: "email",
      recipient,
      leadId: lead.id,
      resultId: input.result.id,
      template,
    });

    if (!qualification.shouldNotify) {
      const existing = await findNotificationLogByPayloadHash({
        provider: "email",
        payloadHash,
      });
      const log =
        existing ??
        (await createNotificationLog({
          lead_id: lead.id,
          result_id: input.result.id,
          notification_type:
            notificationConfig.providers.email.notificationType,
          recipient,
          provider: "email",
          priority: qualification.priority,
          status: "ignored",
          attempt: 0,
          payload_hash: payloadHash,
          queued_at: new Date().toISOString(),
          last_error: qualification.reason,
        }));

      await trackNotificationIgnored({
        leadId: lead.id,
        sessionId: input.sessionId,
        logId: log.id,
        reason: qualification.reason,
      });

      return {
        status: "ignored",
        reason: qualification.reason,
        logId: log.id,
      };
    }

    try {
      await trackQualifiedLead({
        lead,
        sessionId: input.sessionId,
        resultId: input.result.id,
      });
    } catch {
      console.error("Failed to track qualified lead event.");
    }

    const payload = buildLeadNotificationPayload({
      lead,
      result: input.result,
      computedResult: input.computedResult,
      answers: input.answers,
      qualification,
    });
    const rendered = await renderLeadNotificationEmail({
      template,
      payload,
    });
    const existing = await findNotificationLogByPayloadHash({
      provider: "email",
      payloadHash,
    });
    const decision = getNotificationIdempotencyDecision(existing);

    if (decision.action === "skip") {
      await trackNotificationIgnored({
        leadId: lead.id,
        sessionId: input.sessionId,
        logId: decision.log.id,
        reason: decision.reason,
      });

      return {
        status: "ignored",
        reason: decision.reason,
        logId: decision.log.id,
      };
    }

    const log =
      decision.action === "dispatch_existing"
        ? decision.log
        : await createNotificationLog({
            lead_id: lead.id,
            result_id: input.result.id,
            notification_type:
              notificationConfig.providers.email.notificationType,
            recipient,
            provider: "email",
            priority: qualification.priority,
            status: "pending",
            attempt: 0,
            payload_hash: payloadHash,
            queued_at: new Date().toISOString(),
          });

    if (decision.action === "create") {
      await trackNotificationQueued({
        log,
        sessionId: input.sessionId,
      });
    }

    const dispatchResult = await dependencies.queue.enqueue({
      log,
      provider: new EmailProvider(),
      sessionId: input.sessionId,
      providerInput: {
        subject: notificationConfig.providers.email.subject,
        html: rendered.html,
        text: rendered.text,
        payloadHash,
        priority: qualification.priority,
        idempotencyKey: payloadHash,
      },
    });

    return {
      status: dispatchResult.status,
      logId: log.id,
    };
  } catch (error) {
    console.error("Notification pipeline failed.");

    return {
      status: "ignored",
      reason: error instanceof Error ? error.name : "notification_error",
    };
  }
}
