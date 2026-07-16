"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { updateLeadStatusAction } from "@/app/painel/leads/[leadId]/actions";
import {
  getAllowedLeadStatusTransitions,
  leadCommercialStatusLabels,
} from "@/lib/office-dashboard";
import type { LeadCommercialStatus } from "@/types/office-dashboard";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      className="bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm font-semibold disabled:opacity-60"
      disabled={pending}
      type="submit"
    >
      {pending ? "Salvando..." : "Atualizar status"}
    </button>
  );
}

export function LeadStatusForm({
  leadId,
  currentStatus,
  canChange,
}: {
  leadId: string;
  currentStatus: LeadCommercialStatus;
  canChange: boolean;
}) {
  const [state, formAction] = useActionState(updateLeadStatusAction, {});
  const allowedStatuses = [
    currentStatus,
    ...getAllowedLeadStatusTransitions(currentStatus),
  ];

  return (
    <section
      className="bg-card rounded-lg border p-5"
      aria-labelledby="status-form"
    >
      <h2 className="text-lg font-semibold" id="status-form">
        Status comercial
      </h2>
      <form action={formAction} className="mt-4 space-y-4">
        <input name="leadId" type="hidden" value={leadId} />
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="status">
            Novo status
          </label>
          <select
            className="bg-background w-full rounded-md border px-3 py-2 text-sm"
            defaultValue={currentStatus}
            disabled={!canChange}
            id="status"
            name="status"
          >
            {allowedStatuses.map((status) => (
              <option key={status} value={status}>
                {leadCommercialStatusLabels[status]}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="reason">
            Motivo opcional
          </label>
          <textarea
            className="bg-background min-h-24 w-full rounded-md border px-3 py-2 text-sm"
            disabled={!canChange}
            id="reason"
            maxLength={500}
            name="reason"
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
        {canChange ? (
          <SubmitButton />
        ) : (
          <p className="text-muted-foreground text-sm">
            Seu perfil possui acesso somente leitura.
          </p>
        )}
      </form>
    </section>
  );
}
