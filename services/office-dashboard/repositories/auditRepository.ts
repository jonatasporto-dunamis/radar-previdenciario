import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type {
  OfficeAuditAction,
  OfficeAuditLog,
} from "@/types/office-dashboard";
import type { Json } from "@/types/supabase";

const sensitiveKeys = new Set([
  "email",
  "phone",
  "body",
  "answer",
  "answers",
  "payload",
  "ip",
  "ip_address",
  "user_agent",
  "cookie",
  "token",
  "secret",
]);

function sanitizeValue(value: unknown): Json {
  if (value === null || value === undefined) {
    return null;
  }

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.slice(0, 10).map((item) => sanitizeValue(item)) as Json[];
  }

  if (typeof value === "object") {
    return sanitizeAuditMetadata(value as Record<string, unknown>) as Json;
  }

  return String(value);
}

export function sanitizeAuditMetadata(
  metadata: Record<string, unknown>,
): Record<string, Json> {
  return Object.entries(metadata).reduce<Record<string, Json>>(
    (acc, [key, value]) => {
      const normalizedKey = key.toLowerCase();

      if (
        sensitiveKeys.has(normalizedKey) ||
        [...sensitiveKeys].some((sensitiveKey) =>
          normalizedKey.includes(sensitiveKey),
        )
      ) {
        acc[key] = "[redacted]";
        return acc;
      }

      acc[key] = sanitizeValue(value);
      return acc;
    },
    {},
  );
}

export async function insertAuditLog(input: {
  tenantId: string;
  actorUserId: string | null;
  action: OfficeAuditAction;
  entityType: OfficeAuditLog["entityType"];
  entityId?: string | null;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("office_audit_logs").insert({
    tenant_id: input.tenantId,
    actor_user_id: input.actorUserId,
    action: input.action,
    entity_type: input.entityType,
    entity_id: input.entityId ?? null,
    metadata: sanitizeAuditMetadata(input.metadata ?? {}),
  });

  if (error) {
    throw new Error("Unable to create office audit log.");
  }
}

export async function listAuditLogs(input: {
  tenantId: string;
  entityType?: string;
  entityId?: string;
  limit?: number;
}): Promise<OfficeAuditLog[]> {
  const supabase = createSupabaseAdminClient();
  let query = supabase
    .from("office_audit_logs")
    .select("*")
    .eq("tenant_id", input.tenantId)
    .order("created_at", { ascending: false })
    .limit(input.limit ?? 50);

  if (input.entityType) {
    query = query.eq("entity_type", input.entityType);
  }

  if (input.entityId) {
    query = query.eq("entity_id", input.entityId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error("Unable to list office audit logs.");
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    tenantId: row.tenant_id,
    actorUserId: row.actor_user_id,
    action: row.action as OfficeAuditAction,
    entityType: row.entity_type as OfficeAuditLog["entityType"],
    entityId: row.entity_id,
    metadata:
      row.metadata &&
      typeof row.metadata === "object" &&
      !Array.isArray(row.metadata)
        ? (row.metadata as Record<string, unknown>)
        : {},
    createdAt: row.created_at,
  }));
}
