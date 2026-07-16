"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseAuthServerClient } from "@/lib/supabase/server";
import {
  getFieldErrors,
  loginSchema,
} from "@/lib/validations/office-dashboard";
import { createAuditLog } from "@/services/office-dashboard/audit";
import { getCurrentOfficeUser } from "@/services/office-dashboard/auth";
import { getActiveMembershipContext } from "@/services/office-dashboard/repositories";
import type { OfficeAuthActionState } from "@/types/office-dashboard";

const GENERIC_LOGIN_ERROR = "Não foi possível entrar com os dados informados.";
const E2E_PASSWORD = "painel-e2e";
const E2E_USER_COOKIE = "rp_office_e2e_user_id";
const E2E_EMAIL_COOKIE = "rp_office_e2e_email";

const e2eUsers: Record<string, string> = {
  "admin@example.com": "00000000-0000-4000-8000-000000000901",
  "manager@example.com": "00000000-0000-4000-8000-000000000902",
  "agent@example.com": "00000000-0000-4000-8000-000000000903",
  "viewer@example.com": "00000000-0000-4000-8000-000000000904",
  "suspended@example.com": "00000000-0000-4000-8000-000000000905",
  "admin-b@example.com": "00000000-0000-4000-8000-000000000906",
  "nomembership@example.com": "00000000-0000-4000-8000-000000000999",
};

function safePanelRedirect(value: string | undefined): string {
  if (!value || !value.startsWith("/painel") || value.startsWith("//")) {
    return "/painel";
  }

  return value;
}

async function setE2ESession(email: string, userId: string): Promise<void> {
  const cookieStore = await cookies();
  const options = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: false,
    path: "/",
    maxAge: 60 * 60 * 8,
  };

  cookieStore.set(E2E_USER_COOKIE, userId, options);
  cookieStore.set(E2E_EMAIL_COOKIE, email, options);
}

async function clearE2ESession(): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.delete(E2E_USER_COOKIE);
  cookieStore.delete(E2E_EMAIL_COOKIE);
}

export async function loginAction(
  _previousState: OfficeAuthActionState,
  formData: FormData,
): Promise<OfficeAuthActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next"),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: GENERIC_LOGIN_ERROR,
      fieldErrors: getFieldErrors(parsed.error.flatten().fieldErrors),
    };
  }

  const email = parsed.data.email.toLowerCase();
  const redirectTo = safePanelRedirect(parsed.data.next);

  if (process.env.E2E_MOCK_SUPABASE === "true") {
    const userId = e2eUsers[email];

    if (!userId || parsed.data.password !== E2E_PASSWORD) {
      return { success: false, message: GENERIC_LOGIN_ERROR };
    }

    await setE2ESession(email, userId);
    const context = await getActiveMembershipContext({ userId, email });

    if (!context) {
      redirect("/painel/acesso-negado");
    }

    await createAuditLog({
      tenantId: context.tenantId,
      actorUserId: context.userId,
      action: "office_login",
      entityType: "session",
      metadata: { source: "e2e" },
    });

    redirect(redirectTo);
  }

  const supabase = await createSupabaseAuthServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: parsed.data.password,
  });

  if (error) {
    return { success: false, message: GENERIC_LOGIN_ERROR };
  }

  const context = await getCurrentOfficeUser();

  if (!context) {
    await supabase.auth.signOut();
    redirect("/painel/acesso-negado");
  }

  await createAuditLog({
    tenantId: context.tenantId,
    actorUserId: context.userId,
    action: "office_login",
    entityType: "session",
  });

  redirect(redirectTo);
}

export async function logoutAction(): Promise<void> {
  const context = await getCurrentOfficeUser();

  if (context) {
    await createAuditLog({
      tenantId: context.tenantId,
      actorUserId: context.userId,
      action: "office_logout",
      entityType: "session",
    });
  }

  if (process.env.E2E_MOCK_SUPABASE === "true") {
    await clearE2ESession();
    redirect("/painel/login");
  }

  const supabase = await createSupabaseAuthServerClient();
  await supabase.auth.signOut();
  redirect("/painel/login");
}
