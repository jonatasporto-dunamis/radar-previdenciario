import "server-only";
import { redirect } from "next/navigation";
import {
  canChangeLeadStatus,
  canCreateQuizTemplate,
  canCreateLeadNote,
  canEditQuizTemplate,
  canManageDomains,
  canManageBranding,
  canManageIntegrations,
  canViewDomains,
  canViewBranding,
  canPublishQuizTemplate,
  canViewIntegrations,
  canViewLead,
  canViewMetrics,
  canViewQuizTemplates,
} from "@/lib/office-dashboard";
import { requireOfficeUser } from "./requireOfficeUser";
import type { OfficeUserContext } from "@/types/office-dashboard";

type Permission =
  | "viewLead"
  | "changeLeadStatus"
  | "createLeadNote"
  | "viewMetrics"
  | "viewQuizTemplate"
  | "createQuizTemplate"
  | "editQuizTemplate"
  | "publishQuizTemplate"
  | "viewIntegrations"
  | "manageIntegrations"
  | "viewDomains"
  | "manageDomains"
  | "viewBranding"
  | "manageBranding";

function hasPermission(
  context: OfficeUserContext,
  permission: Permission,
): boolean {
  if (permission === "viewLead") {
    return canViewLead(context.role);
  }

  if (permission === "changeLeadStatus") {
    return canChangeLeadStatus(context.role);
  }

  if (permission === "createLeadNote") {
    return canCreateLeadNote(context.role);
  }

  if (permission === "viewQuizTemplate") {
    return canViewQuizTemplates(context.role);
  }

  if (permission === "createQuizTemplate") {
    return canCreateQuizTemplate(context.role);
  }

  if (permission === "editQuizTemplate") {
    return canEditQuizTemplate(context.role);
  }

  if (permission === "publishQuizTemplate") {
    return canPublishQuizTemplate(context.role);
  }

  if (permission === "viewIntegrations") {
    return canViewIntegrations(context.role);
  }

  if (permission === "manageIntegrations") {
    return canManageIntegrations(context.role);
  }

  if (permission === "viewDomains") {
    return canViewDomains(context.role);
  }

  if (permission === "manageDomains") {
    return canManageDomains(context.role);
  }

  if (permission === "viewBranding") {
    return canViewBranding(context.role);
  }

  if (permission === "manageBranding") {
    return canManageBranding(context.role);
  }

  return canViewMetrics(context.role);
}

export async function requireTenantRole(
  permission: Permission,
): Promise<OfficeUserContext> {
  const context = await requireOfficeUser();

  if (!hasPermission(context, permission)) {
    redirect("/painel/acesso-negado");
  }

  return context;
}
