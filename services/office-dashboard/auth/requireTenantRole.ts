import "server-only";
import { redirect } from "next/navigation";
import {
  canChangeLeadStatus,
  canCreateLeadNote,
  canViewLead,
  canViewMetrics,
} from "@/lib/office-dashboard";
import { requireOfficeUser } from "./requireOfficeUser";
import type { OfficeUserContext } from "@/types/office-dashboard";

type Permission =
  "viewLead" | "changeLeadStatus" | "createLeadNote" | "viewMetrics";

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
