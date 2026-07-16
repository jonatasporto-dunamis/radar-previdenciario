import type {
  InternalQualification,
  QuizAnswerMap,
  QuizResultClassification,
  QuizResultComputation,
  RuleEvaluation,
  QuizTemplateDefinition,
} from "@/types/quiz";

type BuildQuizResultInput = {
  answers: QuizAnswerMap;
  ruleEvaluation: RuleEvaluation;
  ethicalDisclaimer: string;
  template?: QuizTemplateDefinition;
};

function classifyScore(score: number): QuizResultClassification {
  if (score >= quizResultThresholds.high) {
    return "alto_potencial";
  }

  if (score >= quizResultThresholds.medium) {
    return "medio_potencial";
  }

  return "baixo_potencial";
}

export const quizResultThresholds = {
  high: 70,
  medium: 40,
} as const;

function buildSummary(
  classification: QuizResultClassification,
  benefitTitle: string | null,
): string {
  const target = benefitTitle ?? "triagem previdenciária";

  if (classification === "alto_potencial") {
    return `As respostas indicam que ${target} pode merecer análise previdenciária individualizada. Esta triagem não confirma direito a benefício; a avaliação depende de documentos, histórico contributivo e demais elementos do caso.`;
  }

  if (classification === "medio_potencial") {
    return `As respostas indicam pontos que podem exigir análise complementar sobre ${target}. Ainda não há conclusão jurídica e a avaliação depende de documentos e contexto individual.`;
  }

  return "Com as informações fornecidas, a triagem encontrou poucos elementos para priorização imediata. Isso não impede nova avaliação se houver documentos, fatos adicionais ou mudança de situação.";
}

export function buildQuizResult({
  ruleEvaluation,
  ethicalDisclaimer,
  template,
}: BuildQuizResultInput): QuizResultComputation {
  const topCandidate = ruleEvaluation.topCandidate;
  const score = topCandidate?.score ?? 0;
  const classification = classifyScore(score);
  const potentialBenefit = topCandidate?.benefitTitle ?? null;
  const topic = potentialBenefit ?? template?.result.topicLabel ?? null;

  return {
    potentialBenefit,
    topic,
    templateType: template?.type ?? ruleEvaluation.templateType,
    quizTemplateId: template?.id ?? null,
    quizTemplateVersion: template?.version ?? null,
    score,
    classification,
    summary:
      template?.result.summary ??
      buildSummary(classification, potentialBenefit),
    ethicalDisclaimer,
    candidates: ruleEvaluation.candidates,
    dataCompleteness: ruleEvaluation.answerCompleteness,
    missingCriticalAnswers: ruleEvaluation.missingCriticalAnswers,
    requiresHumanReview: ruleEvaluation.requiresHumanReview,
  };
}

export function buildInternalQualification(
  result: QuizResultComputation,
): InternalQualification {
  return {
    classification: result.classification,
    score: result.score,
    templateType: result.templateType,
    topic: result.topic,
    threshold: quizResultThresholds,
    priority:
      result.classification === "alto_potencial"
        ? "high"
        : result.classification === "medio_potencial"
          ? "medium"
          : "low",
    shouldNotify:
      result.classification === "alto_potencial" ||
      result.classification === "medio_potencial",
    potentialBenefit: result.potentialBenefit,
    ruleMatches: result.candidates.filter((candidate) => candidate.matched),
    operationalReason: result.requiresHumanReview
      ? "Triagem com dados críticos ausentes ou omitidos; requer revisão humana."
      : "Triagem completa pelos critérios operacionais vigentes.",
    dataCompleteness: result.dataCompleteness,
    missingCriticalAnswers: result.missingCriticalAnswers,
    requiresHumanReview: result.requiresHumanReview,
  };
}
