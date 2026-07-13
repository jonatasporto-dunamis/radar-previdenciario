import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { QuizResultComputation } from "@/types/quiz";
import type { Database } from "@/types/supabase";

type QuizResultRow = Database["public"]["Tables"]["quiz_results"]["Row"];

export class QuizResultPersistenceError extends Error {
  constructor(message = "Quiz result persistence error") {
    super(message);
    this.name = "QuizResultPersistenceError";
  }
}

export async function persistQuizResult(input: {
  leadId: string;
  sessionId: string;
  result: QuizResultComputation;
}): Promise<QuizResultRow> {
  const supabase = createSupabaseAdminClient();
  const payload = {
    session_id: input.sessionId,
    lead_id: input.leadId,
    potential_benefit: input.result.potentialBenefit,
    score: input.result.score,
    classification: input.result.classification,
    summary: input.result.summary,
    ethical_disclaimer: input.result.ethicalDisclaimer,
  };

  const { data, error } = await supabase
    .from("quiz_results")
    .upsert(payload, { onConflict: "session_id" })
    .select("*")
    .single();

  if (error || !data) {
    throw new QuizResultPersistenceError("Failed to persist quiz result.");
  }

  return data;
}

export async function getLatestQuizResultForLead(
  leadId: string,
): Promise<QuizResultRow | null> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("quiz_results")
    .select("*")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new QuizResultPersistenceError("Failed to load quiz result.");
  }

  return data;
}

export async function getQuizResultForLead(input: {
  leadId: string;
  resultId: string;
}): Promise<QuizResultRow | null> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("quiz_results")
    .select("*")
    .eq("id", input.resultId)
    .eq("lead_id", input.leadId)
    .maybeSingle();

  if (error) {
    throw new QuizResultPersistenceError("Failed to load quiz result.");
  }

  return data;
}
