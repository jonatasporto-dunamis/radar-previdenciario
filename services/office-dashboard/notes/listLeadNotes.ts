import "server-only";
import { listNotesForLead } from "../repositories";
import type { OfficeUserContext } from "@/types/office-dashboard";

export async function listLeadNotes(input: {
  context: OfficeUserContext;
  leadId: string;
}) {
  return listNotesForLead(input);
}
