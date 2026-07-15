import { z } from "zod";
import { leadCommercialStatuses } from "@/lib/office-dashboard/statuses";

export const officeRoleSchema = z.enum(["admin", "manager", "agent", "viewer"]);

export const officeMembershipStatusSchema = z.enum([
  "active",
  "inactive",
  "suspended",
  "invited",
]);

export const loginSchema = z
  .object({
    email: z.string().trim().email("Informe um e-mail válido."),
    password: z.string().min(1, "Informe sua senha."),
    next: z.string().trim().optional(),
  })
  .strict();

export const forgotPasswordSchema = z
  .object({
    email: z.string().trim().email("Informe um e-mail válido."),
  })
  .strict();

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "A nova senha deve possuir pelo menos 8 caracteres."),
    confirmPassword: z.string(),
  })
  .strict()
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "As senhas informadas não conferem.",
  });

export const updateLeadStatusSchema = z
  .object({
    leadId: z.string().uuid("Lead inválido."),
    status: z.enum(leadCommercialStatuses),
    reason: z.string().trim().max(500).optional(),
  })
  .strict();

export const createLeadNoteSchema = z
  .object({
    leadId: z.string().uuid("Lead inválido."),
    body: z
      .string()
      .trim()
      .min(1, "Informe a nota interna.")
      .max(5000, "A nota deve possuir no máximo 5.000 caracteres.")
      .refine((value) => !/<[^>]+>/.test(value), {
        message: "Use apenas texto simples na nota.",
      }),
  })
  .strict();

export const updateLeadNoteSchema = z
  .object({
    leadId: z.string().uuid("Lead inválido."),
    noteId: z.string().uuid("Nota inválida."),
    body: z
      .string()
      .trim()
      .min(1, "Informe a nota interna.")
      .max(5000, "A nota deve possuir no máximo 5.000 caracteres.")
      .refine((value) => !/<[^>]+>/.test(value), {
        message: "Use apenas texto simples na nota.",
      }),
  })
  .strict();

export const deleteLeadNoteSchema = z
  .object({
    leadId: z.string().uuid("Lead inválido."),
    noteId: z.string().uuid("Nota inválida."),
  })
  .strict();

export function getFieldErrors(
  fieldErrors: Record<string, string[] | undefined>,
): Record<string, string[]> {
  return Object.entries(fieldErrors).reduce<Record<string, string[]>>(
    (acc, [field, errors]) => {
      if (errors?.length) {
        acc[field] = errors;
      }

      return acc;
    },
    {},
  );
}
