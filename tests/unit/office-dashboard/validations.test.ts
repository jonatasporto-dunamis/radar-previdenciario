import { describe, expect, it } from "vitest";
import {
  createLeadNoteSchema,
  deleteLeadNoteSchema,
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  updateLeadNoteSchema,
  updateLeadStatusSchema,
} from "@/lib/validations/office-dashboard";

const leadId = "00000000-0000-4000-8000-000000001001";
const noteId = "00000000-0000-4000-8000-000000001501";

describe("office dashboard validation schemas", () => {
  it("validates login and recovery payloads", () => {
    expect(
      loginSchema.safeParse({
        email: "admin@example.com",
        password: "secret",
        next: "/painel",
      }).success,
    ).toBe(true);
    expect(forgotPasswordSchema.safeParse({ email: "bad-email" }).success).toBe(
      false,
    );
  });

  it("validates password reset confirmation", () => {
    expect(
      resetPasswordSchema.safeParse({
        password: "12345678",
        confirmPassword: "12345678",
      }).success,
    ).toBe(true);
    expect(
      resetPasswordSchema.safeParse({
        password: "12345678",
        confirmPassword: "different",
      }).success,
    ).toBe(false);
  });

  it("accepts only known lead statuses", () => {
    expect(
      updateLeadStatusSchema.safeParse({
        leadId,
        status: "contacted",
        reason: "Contato por WhatsApp.",
      }).success,
    ).toBe(true);
    expect(
      updateLeadStatusSchema.safeParse({
        leadId,
        status: "alto_potencial",
      }).success,
    ).toBe(false);
  });

  it("rejects arbitrary HTML in internal notes", () => {
    expect(
      createLeadNoteSchema.safeParse({
        leadId,
        body: "Nota interna em texto simples.",
      }).success,
    ).toBe(true);
    expect(
      createLeadNoteSchema.safeParse({
        leadId,
        body: "<script>alert(1)</script>",
      }).success,
    ).toBe(false);
  });

  it("validates note update and deletion identifiers", () => {
    expect(
      updateLeadNoteSchema.safeParse({
        leadId,
        noteId,
        body: "Atualização.",
      }).success,
    ).toBe(true);
    expect(deleteLeadNoteSchema.safeParse({ leadId, noteId }).success).toBe(
      true,
    );
  });
});
