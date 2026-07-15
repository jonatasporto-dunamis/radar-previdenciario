import "server-only";
import { cookies } from "next/headers";
import { createSupabaseAuthServerClient } from "@/lib/supabase/server";
import {
  getActiveMembershipContext,
  touchMembershipAccess,
} from "../repositories";
import type { OfficeUserContext } from "@/types/office-dashboard";

const E2E_USER_COOKIE = "rp_office_e2e_user_id";
const E2E_EMAIL_COOKIE = "rp_office_e2e_email";

export async function hasOfficeAuthSession(): Promise<boolean> {
  if (process.env.E2E_MOCK_SUPABASE === "true") {
    const cookieStore = await cookies();

    return Boolean(cookieStore.get(E2E_USER_COOKIE)?.value);
  }

  const supabase = await createSupabaseAuthServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return Boolean(user);
}

export async function getCurrentOfficeUser(): Promise<OfficeUserContext | null> {
  if (process.env.E2E_MOCK_SUPABASE === "true") {
    const cookieStore = await cookies();
    const userId = cookieStore.get(E2E_USER_COOKIE)?.value;

    if (!userId) {
      return null;
    }

    return getActiveMembershipContext({
      userId,
      email: cookieStore.get(E2E_EMAIL_COOKIE)?.value,
    });
  }

  const supabase = await createSupabaseAuthServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  const context = await getActiveMembershipContext({
    userId: user.id,
    email: user.email,
  });

  if (context) {
    await touchMembershipAccess(context.membershipId);
  }

  return context;
}
