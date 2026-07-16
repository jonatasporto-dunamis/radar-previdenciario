"use server";

import { createSupabaseAuthServerClient } from "@/lib/supabase/server";
import {
  getFieldErrors,
  resetPasswordSchema,
} from "@/lib/validations/office-dashboard";
import type { OfficeAuthActionState } from "@/types/office-dashboard";

export async function resetPasswordAction(
  _previousState: OfficeAuthActionState,
  formData: FormData,
): Promise<OfficeAuthActionState> {
  const parsed = resetPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "Não foi possível atualizar a senha.",
      fieldErrors: getFieldErrors(parsed.error.flatten().fieldErrors),
    };
  }

  if (process.env.E2E_MOCK_SUPABASE === "true") {
    return { success: true, message: "Senha atualizada com segurança." };
  }

  const supabase = await createSupabaseAuthServerClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    return {
      success: false,
      message: "Não foi possível atualizar a senha.",
    };
  }

  return { success: true, message: "Senha atualizada com segurança." };
}
