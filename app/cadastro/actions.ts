"use server";

import { cookies, headers } from "next/headers";
import { normalizeAttributionData } from "@/lib/attribution";
import { checkLeadSubmissionRateLimit } from "@/lib/rate-limit";
import { createLeadSchema, leadFormSchema } from "@/lib/validations/lead";
import { createLead } from "@/services/leads";
import { trackEvent } from "@/services/tracking";
import { normalizeBrazilianPhone } from "@/utils/phone";

const LEAD_SESSION_COOKIE = "rp_lead_session";
const GENERIC_ERROR =
  "Não foi possível concluir seu cadastro agora. Revise os dados ou tente novamente.";

export type CreateLeadActionResult =
  | {
      success: true;
      leadId: string;
    }
  | {
      success: false;
      fieldErrors?: Record<string, string[]>;
      formError?: string;
    };

function getFirstForwardedIp(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const [firstIp] = value.split(",");
  const ip = firstIp?.trim();

  return ip || null;
}

function getFieldErrors(
  fieldErrors: Record<string, string[] | undefined>,
): Record<string, string[]> {
  return Object.entries(fieldErrors).reduce<Record<string, string[]>>(
    (acc, [field, errors]) => {
      if (errors?.length) {
        acc[field] = errors;
      }

      return acc;
    },
    {},
  );
}

function normalizeFullName(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function hasHoneypotValue(input: unknown): boolean {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return false;
  }

  const website = (input as { website?: unknown }).website;

  return typeof website === "string" && website.trim().length > 0;
}

export async function createLeadAction(
  input: unknown,
): Promise<CreateLeadActionResult> {
  if (hasHoneypotValue(input)) {
    return {
      success: false,
      formError: GENERIC_ERROR,
    };
  }

  const parsedForm = leadFormSchema.safeParse(input);

  if (!parsedForm.success) {
    return {
      success: false,
      fieldErrors: getFieldErrors(parsedForm.error.flatten().fieldErrors),
      formError: GENERIC_ERROR,
    };
  }

  const requestHeaders = await headers();
  const ipAddress =
    getFirstForwardedIp(requestHeaders.get("x-forwarded-for")) ??
    requestHeaders.get("x-real-ip");
  const userAgent = requestHeaders.get("user-agent")?.slice(0, 1000) ?? null;

  const rateLimit = checkLeadSubmissionRateLimit(ipAddress);

  if (!rateLimit.allowed) {
    return {
      success: false,
      formError: GENERIC_ERROR,
    };
  }

  const attribution = normalizeAttributionData(
    parsedForm.data.attribution ?? {},
  );
  const normalizedPayload = createLeadSchema.safeParse({
    fullName: normalizeFullName(parsedForm.data.fullName),
    email: parsedForm.data.email.trim().toLowerCase(),
    phone: normalizeBrazilianPhone(parsedForm.data.phone),
    attribution,
    userAgent,
    ipAddress,
    status: "new",
  });

  if (!normalizedPayload.success) {
    return {
      success: false,
      fieldErrors: getFieldErrors(
        normalizedPayload.error.flatten().fieldErrors,
      ),
      formError: GENERIC_ERROR,
    };
  }

  try {
    const lead = await createLead(normalizedPayload.data);

    try {
      await trackEvent({
        leadId: lead.id,
        eventName: "LeadSubmitted",
        eventPayload: {
          source: "lead_registration",
          version: 1,
        },
        attribution,
        userAgent,
        ipAddress,
      });
    } catch {
      console.error("Failed to track lead submission event.");
    }

    const cookieStore = await cookies();

    cookieStore.set(LEAD_SESSION_COOKIE, lead.id, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 2,
    });

    return {
      success: true,
      leadId: lead.id,
    };
  } catch {
    console.error("Failed to create lead: database insert error");

    return {
      success: false,
      formError: GENERIC_ERROR,
    };
  }
}
