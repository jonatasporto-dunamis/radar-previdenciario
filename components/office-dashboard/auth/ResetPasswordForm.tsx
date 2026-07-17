"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { resetPasswordAction } from "@/app/painel/redefinir-senha/actions";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type ResetSessionStatus = "checking" | "ready" | "invalid";

function getHashSession() {
  const hash = window.location.hash.startsWith("#")
    ? window.location.hash.slice(1)
    : window.location.hash;
  const params = new URLSearchParams(hash);
  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");

  if (!accessToken || !refreshToken) {
    return null;
  }

  return { accessToken, refreshToken };
}

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      className="bg-primary text-primary-foreground w-full rounded-md px-4 py-3 text-sm font-semibold disabled:opacity-60"
      disabled={pending || disabled}
      type="submit"
    >
      {pending ? "Atualizando..." : "Atualizar senha"}
    </button>
  );
}

export function ResetPasswordForm() {
  const [state, formAction] = useActionState(resetPasswordAction, {});
  const [sessionStatus, setSessionStatus] =
    useState<ResetSessionStatus>("checking");

  useEffect(() => {
    let isMounted = true;

    async function hydrateSession() {
      const hashSession = getHashSession();

      if (!hashSession) {
        setSessionStatus("ready");
        return;
      }

      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.setSession({
        access_token: hashSession.accessToken,
        refresh_token: hashSession.refreshToken,
      });

      window.history.replaceState(
        null,
        document.title,
        `${window.location.pathname}${window.location.search}`,
      );

      if (!isMounted) {
        return;
      }

      setSessionStatus(error ? "invalid" : "ready");
    }

    void hydrateSession();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <form action={formAction} className="space-y-5">
      {sessionStatus === "checking" ? (
        <p className="text-muted-foreground text-sm" role="status">
          Validando link seguro...
        </p>
      ) : null}
      {sessionStatus === "invalid" ? (
        <p className="text-danger text-sm" role="alert">
          O link de redefinição expirou ou já foi utilizado. Solicite um novo
          acesso.
        </p>
      ) : null}
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="password">
          Nova senha
        </label>
        <input
          autoComplete="new-password"
          className="bg-background w-full rounded-md border px-3 py-3 text-sm"
          disabled={sessionStatus !== "ready"}
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
          disabled={sessionStatus !== "ready"}
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
      <SubmitButton disabled={sessionStatus !== "ready"} />
    </form>
  );
}
