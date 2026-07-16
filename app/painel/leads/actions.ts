"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { OFFICE_LEAD_SEARCH_COOKIE } from "@/lib/office-dashboard";

const cookieOptions = {
  httpOnly: true,
  path: "/painel",
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
};

const filterKeys = [
  "status",
  "classification",
  "templateId",
  "templateType",
  "dataCompleteness",
  "source",
  "utmSource",
  "utmCampaign",
  "dateFrom",
  "dateTo",
  "requiresHumanReview",
] as const;

function readString(formData: FormData, key: string): string {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

function buildFilterParams(formData: FormData): URLSearchParams {
  const params = new URLSearchParams();

  filterKeys.forEach((key) => {
    const value = readString(formData, key);

    if (value) {
      params.set(key, value);
    }
  });

  return params;
}

function redirectToLeads(params?: URLSearchParams): never {
  const query = params?.toString();

  redirect(query ? `/painel/leads?${query}` : "/painel/leads");
}

export async function updateLeadFiltersAction(formData: FormData) {
  const cookieStore = await cookies();

  if (readString(formData, "intent") === "clear") {
    cookieStore.set(OFFICE_LEAD_SEARCH_COOKIE, "", {
      ...cookieOptions,
      maxAge: 0,
    });
    redirectToLeads();
  }

  const search = readString(formData, "search").slice(0, 80);

  if (search) {
    cookieStore.set(OFFICE_LEAD_SEARCH_COOKIE, search, {
      ...cookieOptions,
      maxAge: 60 * 60 * 8,
    });
  } else {
    cookieStore.set(OFFICE_LEAD_SEARCH_COOKIE, "", {
      ...cookieOptions,
      maxAge: 0,
    });
  }

  redirectToLeads(buildFilterParams(formData));
}
