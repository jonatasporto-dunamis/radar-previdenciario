import type { LeadNote } from "@/types/office-dashboard";
import { LeadNoteForm } from "./LeadNoteForm";
import { LeadNoteItem } from "./LeadNoteItem";

export function LeadNotes({
  leadId,
  notes,
  canCreate,
}: {
  leadId: string;
  notes: LeadNote[];
  canCreate: boolean;
}) {
  return (
    <section
      className="bg-card rounded-lg border p-5"
      aria-labelledby="lead-notes"
    >
      <h2 className="text-lg font-semibold" id="lead-notes">
        Notas internas
      </h2>
      <div className="mt-4">
        <LeadNoteForm canCreate={canCreate} leadId={leadId} />
      </div>
      <div className="mt-5 space-y-3">
        {notes.length ? (
          notes.map((note) => <LeadNoteItem key={note.id} note={note} />)
        ) : (
          <p className="text-muted-foreground text-sm">
            Nenhuma nota interna registrada.
          </p>
        )}
      </div>
    </section>
  );
}
