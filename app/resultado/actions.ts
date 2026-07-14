"use server";

import { cookies, headers } from "next/headers";
import {
  getQuizResultForLead,
  trackResultViewedOnce,
} from "@/services/quiz/results";
import { createExternalEventId } from "@/services/external-tracking";
import { getLeadAttribution } from "@/services/quiz/session";
import { getTenantContext } from "@/services/tenants";

const LEAD_SESSION_COOKIE = "rp_lead_session";
const RESULT_VIEWED_COOKIE_PREFIX = "rp_result_viewed_";

function getFirstForwardedIp(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const [firstIp] = value.split(",");
  const ip = firstIp?.trim();

  return ip || null;
}

function getResultViewedCookieName(resultId: string): string {
  return `${RESULT_VIEWED_COOKIE_PREFIX}${resultId}`;
}

export async function trackResultViewedAction(
  resultId: string,
): Promise<{ success: true; externalEventId?: string } | { success: false }> {
  const cookieStore = await cookies();
  const leadId = cookieStore.get(LEAD_SESSION_COOKIE)?.value;

  if (!leadId || !resultId) {
    return { success: false };
  }

  const cookieName = getResultViewedCookieName(resultId);

  if (cookieStore.get(cookieName)) {
    return { success: true };
  }

  const tenantContext = await getTenantContext();
  const result = await getQuizResultForLead({
    tenantId: tenantContext.tenantId,
    leadId,
    resultId,
  });

  if (!result) {
    return { success: false };
  }

  const requestHeaders = await headers();

  const externalEventId = createExternalEventId("ResultViewed");
  let tracked = false;

  try {
    tracked = await trackResultViewedOnce({
      tenantId: tenantContext.tenantId,
      leadId,
      sessionId: result.session_id,
      resultId: result.id,
      classification: result.classification,
      potentialBenefit: result.potential_benefit,
      externalEventId,
      attribution: await getLeadAttribution(tenantContext.tenantId, leadId),
      context: {
        ipAddress:
          getFirstForwardedIp(requestHeaders.get("x-forwarded-for")) ??
          requestHeaders.get("x-real-ip"),
        userAgent: requestHeaders.get("user-agent")?.slice(0, 1000) ?? null,
      },
    });
  } catch {
    console.error("Failed to track result viewed event.");
    return { success: false };
  }

  cookieStore.set(cookieName, "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/resultado",
    maxAge: 60 * 60 * 2,
  });

  return {
    success: true,
    externalEventId: tracked ? externalEventId : undefined,
  };
}
