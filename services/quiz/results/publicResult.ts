import type { PublicResult, QuizResultClassification } from "@/types/quiz";
import type { Database } from "@/types/supabase";
import { getQuizTemplateByType } from "../templates";

type QuizResultRow = Database["public"]["Tables"]["quiz_results"]["Row"];

const publicResultByClassification = {
  alto_potencial: {
    title:
      "Suas respostas indicam que a situação merece uma avaliação individualizada",
    summary:
      "As informações apresentadas apontam elementos que podem ser relevantes para uma análise previdenciária. Isso não confirma direito a benefício nem substitui a avaliação de documentos e do histórico completo por um profissional.",
    nextStep:
      "Você pode solicitar contato da equipe para esclarecer os próximos passos e verificar quais informações adicionais serão necessárias.",
  },
  medio_potencial: {
    title: "Podem ser necessárias mais informações para avaliar a situação",
    summary:
      "As respostas permitem identificar um tema previdenciário que pode merecer análise, mas ainda não são suficientes para uma conclusão. Documentos, vínculos, contribuições e outros elementos podem ser necessários.",
    nextStep:
      "Caso considere adequado, você pode solicitar uma avaliação individualizada da situação.",
  },
  baixo_potencial: {
    title: "Não foi possível identificar elementos suficientes nesta triagem",
    summary:
      "Com base apenas nas respostas fornecidas, esta ferramenta não identificou elementos suficientes para indicar um encaminhamento específico. Isso não significa inexistência de direito, pois informações não apresentadas ou circunstâncias particulares podem alterar a análise.",
    nextStep:
      "Em caso de dúvida, mudança de situação ou existência de documentos adicionais, procure orientação profissional.",
  },
} satisfies Record<
  QuizResultClassification,
  Pick<PublicResult, "title" | "summary" | "nextStep">
>;

function normalizeClassification(
  classification: string,
): QuizResultClassification {
  if (
    classification === "alto_potencial" ||
    classification === "medio_potencial" ||
    classification === "baixo_potencial"
  ) {
    return classification;
  }

  return "baixo_potencial";
}

export function buildPublicResult(input: {
  result: Pick<
    QuizResultRow,
    | "classification"
    | "potential_benefit"
    | "ethical_disclaimer"
    | "template_type"
    | "summary"
    | "topic"
  >;
  fallbackDisclaimer: string;
}): PublicResult {
  const template = getQuizTemplateByType(input.result.template_type);

  if (template) {
    return {
      title: template.result.title,
      summary: input.result.summary ?? template.result.summary,
      nextStep: template.result.nextStep,
      disclaimer:
        input.result.ethical_disclaimer ??
        template.preventiveText.resultDisclaimer ??
        input.fallbackDisclaimer,
      topicLabel:
        input.result.topic ??
        input.result.potential_benefit ??
        template.result.topicLabel,
      informationalMessage:
        "A decisão administrativa ou judicial não é feita por esta ferramenta. O preenchimento não constitui contratação do escritório.",
    };
  }

  const classification = normalizeClassification(input.result.classification);
  const content = publicResultByClassification[classification];

  return {
    title: content.title,
    summary: content.summary,
    nextStep: content.nextStep,
    disclaimer: input.result.ethical_disclaimer ?? input.fallbackDisclaimer,
    topicLabel:
      input.result.potential_benefit ?? "Triagem previdenciária informativa",
    informationalMessage:
      "A decisão administrativa ou judicial não é feita por esta ferramenta. O preenchimento não constitui contratação do escritório.",
  };
}
