export type OfficeAuditAction =
  | "lead_status_changed"
  | "lead_note_created"
  | "lead_note_updated"
  | "lead_note_deleted"
  | "office_login"
  | "office_logout"
  | "template_cloned"
  | "template_created"
  | "template_updated"
  | "template_published"
  | "template_deactivated"
  | "template_archived"
  | "question_created"
  | "question_updated"
  | "question_removed"
  | "template_version_created"
  | "integration_created"
  | "integration_updated"
  | "integration_enabled"
  | "integration_disabled"
  | "integration_tested"
  | "secret_rotated"
  | "event_mapping_updated";

export type OfficeAuditLog = {
  id: string;
  tenantId: string;
  actorUserId: string | null;
  action: OfficeAuditAction;
  entityType:
    | "lead"
    | "lead_note"
    | "membership"
    | "session"
    | "quiz_template"
    | "quiz_template_question"
    | "quiz_template_version"
    | "tenant_integration"
    | "tenant_integration_secret"
    | "tenant_event_mapping"
    | "integration_delivery_log"
    | "integration_test_run";
  entityId: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
};
