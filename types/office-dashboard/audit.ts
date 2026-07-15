export type OfficeAuditAction =
  | "lead_status_changed"
  | "lead_note_created"
  | "lead_note_updated"
  | "lead_note_deleted"
  | "office_login"
  | "office_logout";

export type OfficeAuditLog = {
  id: string;
  tenantId: string;
  actorUserId: string | null;
  action: OfficeAuditAction;
  entityType: "lead" | "lead_note" | "membership" | "session";
  entityId: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
};
