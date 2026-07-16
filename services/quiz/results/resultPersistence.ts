import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isMissingSchemaError } from "@/lib/supabase/schemaCompatibility";
import type {
  QuizResultComputation,
  QuizTemplateDefinition,
} from "@/types/quiz";
import type { Database } from "@/types/supabase";

type QuizResultRow = Database["public"]["Tables"]["quiz_results"]["Row"];

const quizResultTemplateSchemaMarkers = [
  "quiz_template_id",
  "quiz_template_version",
  "template_type",
  "topic",
  "data_completeness",
  "missing_critical_answers",
  "requires_human_review",
  "matched_rules",
  "quiz_templates",
];

export class QuizResultPersistenceError extends Error {
  constructor(message = "Quiz result persistence error") {
    super(message);
    this.name = "QuizResultPersistenceError";
  }
}

function normalizeQuizResultRow(
  result: Partial<QuizResultRow> | null,
): QuizResultRow | null {
  if (!result) {
    return null;
  }

  return {
    quiz_template_id: null,
    quiz_template_version: null,
    template_type: null,
    topic: result.potential_benefit ?? null,
    data_completeness: "insufficient",
    missing_critical_answers: [],
    requires_human_review: false,
    matched_rules: [],
    ...result,
  } as QuizResultRow;
}

export async function persistQuizResult(input: {
  tenantId: string;
  leadId: string;
  sessionId: string;
  result: QuizResultComputation;
  template?: QuizTemplateDefinition;
}): Promise<QuizResultRow> {
  const supabase = createSupabaseAdminClient();
  const template = input.template;
  const legacyPayload = {
    tenant_id: input.tenantId,
    session_id: input.sessionId,
    lead_id: input.leadId,
    potential_benefit: input.result.potentialBenefit,
    score: input.result.score,
    classification: input.result.classification,
    summary: input.result.summary,
    ethical_disclaimer: input.result.ethicalDisclaimer,
  };
  const payload = {
    ...legacyPayload,
    topic: input.result.topic,
    data_completeness: input.result.dataCompleteness,
    missing_critical_answers: input.result.missingCriticalAnswers,
    requires_human_review: input.result.requiresHumanReview,
    matched_rules: input.result.candidates.filter(
      (candidate) => candidate.matched,
    ),
    quiz_template_id: input.result.quizTemplateId ?? template?.id ?? null,
    quiz_template_version:
      input.result.quizTemplateVersion ?? template?.version ?? null,
    template_type: input.result.templateType ?? template?.type ?? null,
  };

  const { data, error } = await supabase
    .from("quiz_results")
    .upsert(payload, { onConflict: "session_id" })
    .select("*")
    .single();

  let persistedRow = normalizeQuizResultRow(data);
  let persistenceError = error;

  if (error && isMissingSchemaError(error, quizResultTemplateSchemaMarkers)) {
    const { data: legacyData, error: legacyError } = await supabase
      .from("quiz_results")
      .upsert(legacyPayload, { onConflict: "session_id" })
      .select("*")
      .single();

    persistedRow = normalizeQuizResultRow(legacyData);
    persistenceError = legacyError;
  }

  if (persistenceError || !persistedRow) {
    throw new QuizResultPersistenceError("Failed to persist quiz result.");
  }

  return persistedRow;
}

export async function getLatestQuizResultForLead(
  tenantId: string,
  leadId: string,
): Promise<QuizResultRow | null> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("quiz_results")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new QuizResultPersistenceError("Failed to load quiz result.");
  }

  return normalizeQuizResultRow(data);
}

export async function getQuizResultForLead(input: {
  tenantId: string;
  leadId: string;
  resultId: string;
}): Promise<QuizResultRow | null> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("quiz_results")
    .select("*")
    .eq("tenant_id", input.tenantId)
    .eq("id", input.resultId)
    .eq("lead_id", input.leadId)
    .maybeSingle();

  if (error) {
    throw new QuizResultPersistenceError("Failed to load quiz result.");
  }

  return normalizeQuizResultRow(data);
}
