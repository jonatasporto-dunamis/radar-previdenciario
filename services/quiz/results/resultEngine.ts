import type {
  QuizAnswerMap,
  QuizResultClassification,
  QuizResultComputation,
  RuleEvaluation,
} from "@/types/quiz";

type BuildQuizResultInput = {
  answers: QuizAnswerMap;
  ruleEvaluation: RuleEvaluation;
  ethicalDisclaimer: string;
};

function classifyScore(score: number): QuizResultClassification {
  if (score >= 70) {
    return "alto_potencial";
  }

  if (score >= 40) {
    return "medio_potencial";
  }

  return "baixo_potencial";
}

function buildSummary(
  classification: QuizResultClassification,
  benefitTitle: string | null,
): string {
  const target = benefitTitle ?? "triagem previdenciária";

  if (classification === "alto_potencial") {
    return `As respostas indicam sinais preliminares relevantes para ${target}. Recomenda-se uma avaliação jurídica individual com documentos para confirmar o cenário.`;
  }

  if (classification === "medio_potencial") {
    return `As respostas apresentam alguns elementos de atenção para ${target}, mas ainda dependem de análise documental e contextual antes de qualquer conclusão.`;
  }

  return "As respostas registradas indicam baixo potencial preliminar nesta triagem automatizada. Isso não afasta a necessidade de avaliação individual quando houver documentos ou fatos adicionais.";
}

export function buildQuizResult({
  ruleEvaluation,
  ethicalDisclaimer,
}: BuildQuizResultInput): QuizResultComputation {
  const topCandidate = ruleEvaluation.topCandidate;
  const score = topCandidate?.score ?? 0;
  const classification = classifyScore(score);
  const potentialBenefit = topCandidate?.benefitTitle ?? null;

  return {
    potentialBenefit,
    score,
    classification,
    summary: buildSummary(classification, potentialBenefit),
    ethicalDisclaimer,
    candidates: ruleEvaluation.candidates,
  };
}
