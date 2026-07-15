"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { loginAction } from "@/app/painel/login/actions";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      className="bg-primary text-primary-foreground hover:bg-primary/90 w-full rounded-md px-4 py-3 text-sm font-semibold transition disabled:opacity-60"
      disabled={pending}
      type="submit"
    >
      {pending ? "Entrando..." : "Entrar no painel"}
    </button>
  );
}

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction] = useActionState(loginAction, {});

  return (
    <form action={formAction} className="space-y-5">
      <input name="next" type="hidden" value={next ?? ""} />
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
        {state.fieldErrors?.email ? (
          <p className="text-danger text-sm" role="alert">
            {state.fieldErrors.email[0]}
          </p>
        ) : null}
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="password">
          Senha
        </label>
        <input
          autoComplete="current-password"
          className="bg-background w-full rounded-md border px-3 py-3 text-sm"
          id="password"
          name="password"
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
