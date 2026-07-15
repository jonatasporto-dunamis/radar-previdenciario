"use server";

import { headers } from "next/headers";
import { createSupabaseAuthServerClient } from "@/lib/supabase/server";
import {
  forgotPasswordSchema,
  getFieldErrors,
} from "@/lib/validations/office-dashboard";
import type { OfficeAuthActionState } from "@/types/office-dashboard";

const GENERIC_MESSAGE =
  "Se houver uma conta habilitada para este e-mail, enviaremos as instruções de recuperação.";

function getPasswordResetOrigin(requestOrigin: string | null): string {
  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const fallbackOrigin = requestOrigin ?? "http://localhost:3000";

  try {
    return new URL(configuredSiteUrl ?? fallbackOrigin).origin;
  } catch {
    return "http://localhost:3000";
  }
}

export async function forgotPasswordAction(
  _previousState: OfficeAuthActionState,
  formData: FormData,
): Promise<OfficeAuthActionState> {
  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: GENERIC_MESSAGE,
      fieldErrors: getFieldErrors(parsed.error.flatten().fieldErrors),
    };
  }

  if (process.env.E2E_MOCK_SUPABASE === "true") {
    return { success: true, message: GENERIC_MESSAGE };
  }

  const requestHeaders = await headers();
  const origin = getPasswordResetOrigin(requestHeaders.get("origin"));
  const supabase = await createSupabaseAuthServerClient();

  await supabase.auth.resetPasswordForEmail(parsed.data.email.toLowerCase(), {
    redirectTo: `${origin}/painel/redefinir-senha`,
  });

  return { success: true, message: GENERIC_MESSAGE };
}
