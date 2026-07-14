import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createExternalEventId } from "@/services/external-tracking";
import { trackEvent } from "@/services/tracking";
import type { AttributionData } from "@/types/attribution";
import type {
  FlowDefinition,
  QuestionDefinition,
  QuizAnswerMap,
  QuizProgress,
  QuizStoredAnswer,
} from "@/types/quiz";
import type { Database } from "@/types/supabase";
import { getDefaultQuizFlow, getQuestionsForFlow } from "../engine/flowEngine";
import { getVisibleQuestions } from "../engine/questionEngine";
import { getResumeQuestionId } from "../navigation/navigationEngine";
import { calculateQuizProgress } from "../progress/progressEngine";
import { createStoredAnswer, serializeQuestionAnswer } from "../renderer";

type LeadRow = Database["public"]["Tables"]["leads"]["Row"];
type QuizSessionRow = Database["public"]["Tables"]["quiz_sessions"]["Row"];
type QuizAnswerRow = Database["public"]["Tables"]["quiz_answers"]["Row"];

export class QuizSessionServiceError extends Error {
  constructor(message = "Quiz session service error") {
    super(message);
    this.name = "QuizSessionServiceError";
  }
}

export type QuizRequestContext = {
  userAgent?: string | null;
  ipAddress?: string | null;
};

export type QuizSessionState = {
  lead: Pick<LeadRow, "id" | "tenant_id">;
  session: QuizSessionRow;
  flow: FlowDefinition;
  questions: QuestionDefinition[];
  answers: QuizAnswerMap;
  currentQuestionId: string;
  progress: QuizProgress;
  quizStartedExternalEventId?: string;
};

function leadAttributionToTracking(lead: LeadRow): AttributionData {
  return {
    utmSource: lead.utm_source,
    utmMedium: lead.utm_medium,
    utmCampaign: lead.utm_campaign,
    utmContent: lead.utm_content,
    utmTerm: lead.utm_term,
    fbclid: lead.fbclid,
    gclid: lead.gclid,
    campaignId: lead.campaign_id,
    adsetId: lead.adset_id,
    adId: lead.ad_id,
    placement: lead.placement,
    siteSourceName: lead.site_source_name,
    referrer: lead.referrer,
    landingPage: lead.landing_page,
  };
}

function buildAnswerMap(
  questions: QuestionDefinition[],
  answers: QuizAnswerRow[],
): QuizAnswerMap {
  const questionsById = new Map(
    questions.map((question) => [question.id, question]),
  );

  return answers.reduce<QuizAnswerMap>((acc, answer) => {
    const question = questionsById.get(answer.question_id);

    if (!question) {
      return acc;
    }

    acc[answer.question_id] = createStoredAnswer(
      question,
      answer.answer_value,
      answer.answer_label,
      answer.benefit_context,
      answer.created_at,
    );

    return acc;
  }, {});
}

async function trackQuizStarted(
  tenantId: string,
  lead: LeadRow,
  session: QuizSessionRow,
  flow: FlowDefinition,
  context: QuizRequestContext,
): Promise<string | undefined> {
  const externalEventId = createExternalEventId("QuizStarted");

  try {
    await trackEvent({
      tenantId,
      leadId: lead.id,
      sessionId: session.id,
      eventName: "QuizStarted",
      eventPayload: {
        source: "quiz",
        flowSlug: flow.slug,
        flowVersion: flow.version,
        external_event_id: externalEventId,
      },
      attribution: leadAttributionToTracking(lead),
      userAgent: context.userAgent ?? null,
      ipAddress: context.ipAddress ?? null,
    });

    return externalEventId;
  } catch {
    console.error("Failed to track quiz started event.");
    return undefined;
  }
}

export async function getQuizSessionState(
  tenantId: string,
  leadId: string,
  context: QuizRequestContext = {},
): Promise<QuizSessionState | null> {
  const supabase = createSupabaseAdminClient();
  const flow = getDefaultQuizFlow();
  const questions = getQuestionsForFlow(flow);

  const { data: lead, error: leadError } = await supabase
    .from("leads")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("id", leadId)
    .maybeSingle();

  if (leadError) {
    throw new QuizSessionServiceError("Failed to load lead.");
  }

  if (!lead) {
    return null;
  }

  const { data: existingSession, error: sessionLookupError } = await supabase
    .from("quiz_sessions")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("lead_id", leadId)
    .eq("status", "started")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (sessionLookupError) {
    throw new QuizSessionServiceError("Failed to load quiz session.");
  }

  let session = existingSession;
  let createdSession = false;
  let quizStartedExternalEventId: string | undefined;

  if (!session) {
    const { data: newSession, error: createSessionError } = await supabase
      .from("quiz_sessions")
      .insert({
        id: leadId,
        tenant_id: tenantId,
        lead_id: leadId,
        status: "started",
      })
      .select("*")
      .single();

    if (createSessionError || !newSession) {
      const { data: fallbackSession, error: fallbackError } = await supabase
        .from("quiz_sessions")
        .select("*")
        .eq("tenant_id", tenantId)
        .eq("id", leadId)
        .maybeSingle();

      if (fallbackError || !fallbackSession) {
        throw new QuizSessionServiceError("Failed to create quiz session.");
      }

      session = fallbackSession;
    } else {
      session = newSession;
      createdSession = true;
    }
  }

  if (createdSession) {
    quizStartedExternalEventId = await trackQuizStarted(
      tenantId,
      lead,
      session,
      flow,
      context,
    );
  }

  const { data: rows, error: answersError } = await supabase
    .from("quiz_answers")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("session_id", session.id)
    .order("created_at", { ascending: true });

  if (answersError) {
    throw new QuizSessionServiceError("Failed to load quiz answers.");
  }

  const answers = buildAnswerMap(questions, rows ?? []);
  const visibleQuestions = getVisibleQuestions(questions, answers);
  const currentQuestionId = getResumeQuestionId(visibleQuestions, answers);
  const progress = calculateQuizProgress(
    visibleQuestions,
    answers,
    currentQuestionId,
  );

  return {
    lead: { id: lead.id, tenant_id: lead.tenant_id },
    session,
    flow,
    questions,
    answers,
    currentQuestionId,
    progress,
    quizStartedExternalEventId,
  };
}

export async function getQuizSessionForLead(
  tenantId: string,
  leadId: string,
  sessionId: string,
): Promise<QuizSessionRow | null> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("quiz_sessions")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("id", sessionId)
    .eq("lead_id", leadId)
    .maybeSingle();

  if (error) {
    throw new QuizSessionServiceError("Failed to validate quiz session.");
  }

  return data;
}

export async function saveQuizAnswer(input: {
  tenantId: string;
  leadId: string;
  sessionId: string;
  question: QuestionDefinition;
  value: QuizStoredAnswer["answerValue"];
}): Promise<QuizStoredAnswer> {
  const supabase = createSupabaseAdminClient();
  const serialized = serializeQuestionAnswer(input.question, input.value);
  const benefitContext = input.question.benefits.join(",");

  const { data: existingAnswer, error: lookupError } = await supabase
    .from("quiz_answers")
    .select("id")
    .eq("tenant_id", input.tenantId)
    .eq("session_id", input.sessionId)
    .eq("question_id", input.question.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (lookupError) {
    throw new QuizSessionServiceError("Failed to check quiz answer.");
  }

  if (existingAnswer?.id) {
    const { data, error } = await supabase
      .from("quiz_answers")
      .update({
        question_label: input.question.title,
        answer_value: serialized.answerValue,
        answer_label: serialized.answerLabel,
        benefit_context: benefitContext,
      })
      .eq("tenant_id", input.tenantId)
      .eq("id", existingAnswer.id)
      .select("*")
      .single();

    if (error || !data) {
      throw new QuizSessionServiceError("Failed to update quiz answer.");
    }

    return createStoredAnswer(
      input.question,
      data.answer_value,
      data.answer_label,
      data.benefit_context,
      data.created_at,
    );
  }

  const { data, error } = await supabase
    .from("quiz_answers")
    .insert({
      tenant_id: input.tenantId,
      session_id: input.sessionId,
      lead_id: input.leadId,
      question_id: input.question.id,
      question_label: input.question.title,
      answer_value: serialized.answerValue,
      answer_label: serialized.answerLabel,
      benefit_context: benefitContext,
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new QuizSessionServiceError("Failed to save quiz answer.");
  }

  return createStoredAnswer(
    input.question,
    data.answer_value,
    data.answer_label,
    data.benefit_context,
    data.created_at,
  );
}

export async function loadQuizAnswers(
  tenantId: string,
  sessionId: string,
  questions: QuestionDefinition[],
): Promise<QuizAnswerMap> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("quiz_answers")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new QuizSessionServiceError("Failed to reload quiz answers.");
  }

  return buildAnswerMap(questions, data ?? []);
}

export async function completeQuizSession(
  tenantId: string,
  sessionId: string,
): Promise<void> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("quiz_sessions")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
    })
    .eq("tenant_id", tenantId)
    .eq("id", sessionId);

  if (error) {
    throw new QuizSessionServiceError("Failed to complete quiz session.");
  }
}

export async function getLeadAttribution(
  tenantId: string,
  leadId: string,
): Promise<AttributionData> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("id", leadId)
    .maybeSingle();

  if (error || !data) {
    return {};
  }

  return leadAttributionToTracking(data);
}
