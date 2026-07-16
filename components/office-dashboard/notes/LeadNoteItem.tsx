"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  deleteLeadNoteAction,
  updateLeadNoteAction,
} from "@/app/painel/leads/[leadId]/actions";
import { formatDateTime } from "@/lib/office-dashboard";
import type { LeadNote } from "@/types/office-dashboard";

function SmallSubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      className="rounded-md border px-3 py-2 text-sm font-medium disabled:opacity-60"
      disabled={pending}
      type="submit"
    >
      {pending ? "Aguarde..." : label}
    </button>
  );
}

export function LeadNoteItem({ note }: { note: LeadNote }) {
  const [updateState, updateAction] = useActionState(updateLeadNoteAction, {});
  const [deleteState, deleteAction] = useActionState(deleteLeadNoteAction, {});

  return (
    <article className="rounded-md border p-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-medium">{note.authorName}</p>
        <p className="text-muted-foreground text-xs">
          {formatDateTime(note.createdAt)}
        </p>
      </div>
      <p className="mt-3 text-sm whitespace-pre-wrap">{note.body}</p>
      {note.canEdit ? (
        <details className="mt-4">
          <summary className="cursor-pointer text-sm font-medium">
            Editar nota
          </summary>
          <form action={updateAction} className="mt-3 space-y-3">
            <input name="leadId" type="hidden" value={note.leadId} />
            <input name="noteId" type="hidden" value={note.id} />
            <textarea
              className="bg-background min-h-24 w-full rounded-md border px-3 py-2 text-sm"
              defaultValue={note.body}
              maxLength={5000}
              name="body"
            />
            {updateState.message ? (
              <p
                className={
                  updateState.success
                    ? "text-success text-sm"
                    : "text-danger text-sm"
                }
                role="status"
              >
                {updateState.message}
              </p>
            ) : null}
            <SmallSubmitButton label="Salvar edição" />
          </form>
        </details>
      ) : null}
      {note.canDelete ? (
        <form action={deleteAction} className="mt-3">
          <input name="leadId" type="hidden" value={note.leadId} />
          <input name="noteId" type="hidden" value={note.id} />
          {deleteState.message ? (
            <p
              className={
                deleteState.success
                  ? "text-success text-sm"
                  : "text-danger text-sm"
              }
              role="status"
            >
              {deleteState.message}
            </p>
          ) : null}
          <SmallSubmitButton label="Excluir nota" />
        </form>
      ) : null}
    </article>
  );
}
