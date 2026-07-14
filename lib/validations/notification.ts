import { z } from "zod";

export const notificationProviderValues = [
  "email",
  "whatsapp",
  "slack",
  "discord",
  "crm",
  "webhook",
] as const;

export const notificationPriorityValues = [
  "low",
  "medium",
  "high",
  "critical",
] as const;

export const notificationStatusValues = [
  "pending",
  "processing",
  "sent",
  "failed",
  "retrying",
  "ignored",
  "cancelled",
] as const;

export const notificationProviderSchema = z.enum(notificationProviderValues);
export const notificationPrioritySchema = z.enum(notificationPriorityValues);
export const notificationStatusSchema = z.enum(notificationStatusValues);

export const notificationPayloadHashSchema = z
  .string()
  .trim()
  .regex(/^[a-f0-9]{64}$/i, "Informe um hash SHA-256 hexadecimal válido.")
  .transform((value) => value.toLowerCase());

const optionalUuidSchema = z.string().uuid().nullable().optional();
const optionalTimestampSchema = z
  .string()
  .datetime({ offset: true })
  .nullable()
  .optional();
const optionalTextSchema = z.string().trim().max(2000).nullable().optional();

export const notificationLogInsertSchema = z
  .object({
    tenant_id: z.string().uuid(),
    lead_id: optionalUuidSchema,
    result_id: optionalUuidSchema,
    notification_type: z.string().trim().min(1).max(100),
    recipient: z.string().trim().min(1).max(500),
    provider: notificationProviderSchema.default("email"),
    priority: notificationPrioritySchema.default("medium"),
    status: notificationStatusSchema.default("pending"),
    attempt: z.number().int().min(0).default(0),
    payload_hash: notificationPayloadHashSchema.nullable().optional(),
    queued_at: optionalTimestampSchema,
    processing_started_at: optionalTimestampSchema,
    sent_at: optionalTimestampSchema,
    failed_at: optionalTimestampSchema,
    error_message: optionalTextSchema,
    last_error: optionalTextSchema,
  })
  .strict();

export const notificationLogUpdateSchema = z
  .object({
    tenant_id: z.string().uuid().optional(),
    lead_id: optionalUuidSchema,
    result_id: optionalUuidSchema,
    notification_type: z.string().trim().min(1).max(100).optional(),
    recipient: z.string().trim().min(1).max(500).optional(),
    provider: notificationProviderSchema.optional(),
    priority: notificationPrioritySchema.optional(),
    status: notificationStatusSchema.optional(),
    attempt: z.number().int().min(0).optional(),
    payload_hash: notificationPayloadHashSchema.nullable().optional(),
    queued_at: optionalTimestampSchema,
    processing_started_at: optionalTimestampSchema,
    sent_at: optionalTimestampSchema,
    failed_at: optionalTimestampSchema,
    error_message: optionalTextSchema,
    last_error: optionalTextSchema,
  })
  .strict();

export type NotificationLogInsertInput = z.infer<
  typeof notificationLogInsertSchema
>;
export type NotificationLogUpdateInput = z.infer<
  typeof notificationLogUpdateSchema
>;
