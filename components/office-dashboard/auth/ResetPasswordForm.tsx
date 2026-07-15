"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { resetPasswordAction } from "@/app/painel/redefinir-senha/actions";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      className="bg-primary text-primary-foreground w-full rounded-md px-4 py-3 text-sm font-semibold disabled:opacity-60"
      disabled={pending}
      type="submit"
    >
      {pending ? "Atualizando..." : "Atualizar senha"}
    </button>
  );
}

export function ResetPasswordForm() {
  const [state, formAction] = useActionState(resetPasswordAction, {});

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="password">
          Nova senha
        </label>
        <input
          autoComplete="new-password"
          className="bg-background w-full rounded-md border px-3 py-3 text-sm"
          id="password"
          name="password"
          required
          type="password"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="confirmPassword">
          Confirmar senha
        </label>
        <input
          autoComplete="new-password"
          className="bg-background w-full rounded-md border px-3 py-3 text-sm"
          id="confirmPassword"
          name="confirmPassword"
          required
          type="password"
        />
      </div>
      {state.message ? (
        <p
          className={
            state.success ? "text-success text-sm" : "text-danger text-sm"
          }
          role="status"
        >
          {state.message}
        </p>
      ) : null}
      <SubmitButton />
    </form>
  );
}
