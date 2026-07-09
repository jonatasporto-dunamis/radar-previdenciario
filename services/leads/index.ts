import type { Lead } from "@/types/database";

export type CreateLeadInput = Pick<Lead, "email" | "full_name" | "phone"> &
  Partial<
    Omit<
      Lead,
      "created_at" | "email" | "full_name" | "id" | "phone" | "updated_at"
    >
  >;

export async function createLead(input: CreateLeadInput): Promise<Lead> {
  void input;
  throw new Error("Not implemented yet");
}
