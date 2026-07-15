import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type {
  OfficeMembership,
  OfficeMembershipStatus,
  OfficeRole,
  OfficeUserContext,
} from "@/types/office-dashboard";
import type { Database } from "@/types/supabase";

type MembershipRow = Database["public"]["Tables"]["tenant_memberships"]["Row"];
type TenantRow = Database["public"]["Tables"]["tenants"]["Row"];

function toOfficeRole(value: string): OfficeRole {
  if (
    value === "admin" ||
    value === "manager" ||
    value === "agent" ||
    value === "viewer"
  ) {
    return value;
  }

  return "viewer";
}

function toMembershipStatus(value: string): OfficeMembershipStatus {
  if (
    value === "active" ||
    value === "inactive" ||
    value === "suspended" ||
    value === "invited"
  ) {
    return value;
  }

  return "inactive";
}

export function mapMembershipRow(row: MembershipRow): OfficeMembership {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    userId: row.user_id,
    role: toOfficeRole(row.role),
    status: toMembershipStatus(row.status),
    displayName: row.display_name ?? undefined,
    jobTitle: row.job_title ?? undefined,
    isDefault: row.is_default,
    lastAccessAt: row.last_access_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toOfficeUserContext(input: {
  membership: MembershipRow;
  tenant: TenantRow;
  email?: string;
}): OfficeUserContext {
  return {
    userId: input.membership.user_id,
    email: input.email,
    tenantId: input.membership.tenant_id,
    tenantSlug: input.tenant.slug,
    tenantName: input.tenant.name,
    tenantStatus: input.tenant.status,
    membershipId: input.membership.id,
    role: toOfficeRole(input.membership.role),
    displayName: input.membership.display_name ?? undefined,
    jobTitle: input.membership.job_title ?? undefined,
    lastAccessAt: input.membership.last_access_at,
  };
}

export async function listMembershipsByUserId(
  userId: string,
): Promise<OfficeMembership[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("tenant_memberships")
    .select("*")
    .eq("user_id", userId)
    .order("is_default", { ascending: false });

  if (error) {
    throw new Error("Unable to list office memberships.");
  }

  return (data ?? []).map(mapMembershipRow);
}

export async function getActiveMembershipContext(input: {
  userId: string;
  email?: string;
}): Promise<OfficeUserContext | null> {
  const supabase = createSupabaseAdminClient();
  const { data: memberships, error } = await supabase
    .from("tenant_memberships")
    .select("*")
    .eq("user_id", input.userId)
    .eq("status", "active")
    .order("is_default", { ascending: false })
    .limit(1);

  if (error) {
    throw new Error("Unable to load office membership.");
  }

  const membership = memberships?.[0];

  if (!membership) {
    return null;
  }

  const { data: tenant, error: tenantError } = await supabase
    .from("tenants")
    .select("*")
    .eq("id", membership.tenant_id)
    .maybeSingle();

  if (tenantError) {
    throw new Error("Unable to load office tenant.");
  }

  if (!tenant || tenant.status !== "active") {
    return null;
  }

  return toOfficeUserContext({
    membership,
    tenant,
    email: input.email,
  });
}

export async function touchMembershipAccess(
  membershipId: string,
): Promise<void> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("tenant_memberships")
    .update({ last_access_at: new Date().toISOString() })
    .eq("id", membershipId);

  if (error) {
    throw new Error("Unable to update office membership access.");
  }
}
