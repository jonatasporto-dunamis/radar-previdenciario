"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { forgotPasswordAction } from "@/app/painel/recuperar-senha/actions";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      className="bg-primary text-primary-foreground w-full rounded-md px-4 py-3 text-sm font-semibold disabled:opacity-60"
      disabled={pending}
      type="submit"
    >
      {pending ? "Enviando..." : "Enviar instruções"}
    </button>
  );
}

export function ForgotPasswordForm() {
  const [state, formAction] = useActionState(forgotPasswordAction, {});

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="email">
          E-mail
        </label>
        <input
          autoComplete="email"
          className="bg-background w-full rounded-md border px-3 py-3 text-sm"
          id="email"
          name="email"
          required
          type="email"
        />
      </div>
      {state.message ? (
        <p className="text-muted-foreground text-sm" role="status">
          {state.message}
        </p>
      ) : null}
      <SubmitButton />
    </form>
  );
}
