"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createLeadNoteAction } from "@/app/painel/leads/[leadId]/actions";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      className="bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm font-semibold disabled:opacity-60"
      disabled={pending}
      type="submit"
    >
      {pending ? "Salvando..." : "Adicionar nota"}
    </button>
  );
}

export function LeadNoteForm({
  leadId,
  canCreate,
}: {
  leadId: string;
  canCreate: boolean;
}) {
  const [state, formAction] = useActionState(createLeadNoteAction, {});

  return (
    <form action={formAction} className="space-y-3">
      <input name="leadId" type="hidden" value={leadId} />
      <label className="sr-only" htmlFor="body">
        Nota interna
      </label>
      <textarea
        className="bg-background min-h-28 w-full rounded-md border px-3 py-2 text-sm"
        disabled={!canCreate}
        id="body"
        maxLength={5000}
        name="body"
        placeholder="Registre uma observação interna em texto simples."
      />
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
      {canCreate ? (
        <SubmitButton />
      ) : (
        <p className="text-muted-foreground text-sm">
          Seu perfil possui acesso somente leitura.
        </p>
      )}
    </form>
  );
}
