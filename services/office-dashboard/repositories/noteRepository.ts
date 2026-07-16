import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { canDeleteLeadNote, canEditLeadNote } from "@/lib/office-dashboard";
import type { LeadNote, OfficeUserContext } from "@/types/office-dashboard";
import type { Database } from "@/types/supabase";

type NoteRow = Database["public"]["Tables"]["lead_notes"]["Row"];

function mapNote(row: NoteRow, context: OfficeUserContext): LeadNote {
  const note = {
    id: row.id,
    tenantId: row.tenant_id,
    leadId: row.lead_id,
    authorUserId: row.author_user_id,
    authorName:
      row.author_user_id === context.userId
        ? context.displayName || context.email || "Você"
        : "Usuário do escritório",
    body: row.body,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    canEdit: false,
    canDelete: false,
  };

  return {
    ...note,
    canEdit: canEditLeadNote({
      role: context.role,
      userId: context.userId,
      note,
    }),
    canDelete: canDeleteLeadNote({
      role: context.role,
      userId: context.userId,
      note,
    }),
  };
}

export async function listNotesForLead(input: {
  context: OfficeUserContext;
  leadId: string;
}): Promise<LeadNote[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("lead_notes")
    .select("*")
    .eq("tenant_id", input.context.tenantId)
    .eq("lead_id", input.leadId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Unable to load lead notes.");
  }

  return (data ?? []).map((row) => mapNote(row, input.context));
}

export async function getNoteForLead(input: {
  tenantId: string;
  leadId: string;
  noteId: string;
}): Promise<NoteRow | null> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("lead_notes")
    .select("*")
    .eq("tenant_id", input.tenantId)
    .eq("lead_id", input.leadId)
    .eq("id", input.noteId)
    .maybeSingle();

  if (error) {
    throw new Error("Unable to load lead note.");
  }

  return data;
}

export async function insertLeadNote(input: {
  tenantId: string;
  leadId: string;
  authorUserId: string;
  body: string;
}): Promise<LeadNote> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("lead_notes")
    .insert({
      tenant_id: input.tenantId,
      lead_id: input.leadId,
      author_user_id: input.authorUserId,
      body: input.body,
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error("Unable to create lead note.");
  }

  return {
    id: data.id,
    tenantId: data.tenant_id,
    leadId: data.lead_id,
    authorUserId: data.author_user_id,
    authorName: "Você",
    body: data.body,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    canEdit: true,
    canDelete: true,
  };
}

export async function updateLeadNoteBody(input: {
  tenantId: string;
  leadId: string;
  noteId: string;
  body: string;
}): Promise<void> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("lead_notes")
    .update({ body: input.body })
    .eq("tenant_id", input.tenantId)
    .eq("lead_id", input.leadId)
    .eq("id", input.noteId);

  if (error) {
    throw new Error("Unable to update lead note.");
  }
}

export async function deleteLeadNoteById(input: {
  tenantId: string;
  leadId: string;
  noteId: string;
}): Promise<void> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("lead_notes")
    .delete()
    .eq("tenant_id", input.tenantId)
    .eq("lead_id", input.leadId)
    .eq("id", input.noteId);

  if (error) {
    throw new Error("Unable to delete lead note.");
  }
}
