import type { LeadNote, OfficeRole } from "@/types/office-dashboard";

const writeRoles: OfficeRole[] = ["admin", "manager", "agent"];
const managerRoles: OfficeRole[] = ["admin", "manager"];

export function canViewLead(role: OfficeRole): boolean {
  return ["admin", "manager", "agent", "viewer"].includes(role);
}

export function canChangeLeadStatus(role: OfficeRole): boolean {
  return writeRoles.includes(role);
}

export function canCreateLeadNote(role: OfficeRole): boolean {
  return writeRoles.includes(role);
}

export function canEditLeadNote(input: {
  role: OfficeRole;
  userId: string;
  note: Pick<LeadNote, "authorUserId">;
}): boolean {
  return (
    input.role === "admin" ||
    (writeRoles.includes(input.role) &&
      input.note.authorUserId === input.userId)
  );
}

export function canDeleteLeadNote(input: {
  role: OfficeRole;
  userId: string;
  note: Pick<LeadNote, "authorUserId">;
}): boolean {
  return canEditLeadNote(input);
}

export function canViewMetrics(role: OfficeRole): boolean {
  return ["admin", "manager", "agent", "viewer"].includes(role);
}

export function canViewQuizTemplates(role: OfficeRole): boolean {
  return ["admin", "manager", "agent", "viewer"].includes(role);
}

export function canCreateQuizTemplate(role: OfficeRole): boolean {
  return ["admin", "manager"].includes(role);
}

export function canEditQuizTemplate(role: OfficeRole): boolean {
  return ["admin", "manager"].includes(role);
}

export function canPublishQuizTemplate(role: OfficeRole): boolean {
  return role === "admin";
}

export function canViewAuditLogs(role: OfficeRole): boolean {
  return managerRoles.includes(role);
}

export function canViewInternalQualification(role: OfficeRole): boolean {
  return ["admin", "manager", "agent", "viewer"].includes(role);
}

export function canViewIntegrations(role: OfficeRole): boolean {
  return managerRoles.includes(role);
}

export function canManageIntegrations(role: OfficeRole): boolean {
  return role === "admin";
}
