import { createElement } from "react";
import { render } from "react-email";
import { LeadMediumEmail } from "@/emails/templates/lead-medium";
import { LeadQualifiedEmail } from "@/emails/templates/lead-qualified";
import type { LeadNotificationPayload } from "../pipeline/payload";

export type LeadNotificationTemplateName = "lead-qualified" | "lead-medium";

export function selectLeadNotificationTemplate(
  classification: string,
): LeadNotificationTemplateName {
  return classification === "medio_potencial"
    ? "lead-medium"
    : "lead-qualified";
}

export async function renderLeadNotificationEmail(input: {
  template: LeadNotificationTemplateName;
  payload: LeadNotificationPayload;
}): Promise<{ html: string; text: string }> {
  const Component =
    input.template === "lead-medium" ? LeadMediumEmail : LeadQualifiedEmail;

  const html = await render(
    createElement(Component, { payload: input.payload }),
  );

  const answers = input.payload.answers
    .map((answer) => `- ${answer.question}: ${answer.answer}`)
    .join("\n");

  const text = [
    "Novo contato para analise previdenciaria — Radar Previdenciario",
    "",
    `Nome: ${input.payload.lead.fullName}`,
    `Telefone: ${input.payload.lead.phone}`,
    `Email: ${input.payload.lead.email}`,
    `Tema para analise: ${input.payload.result.benefit}`,
    `Classificacao interna: ${input.payload.result.classification}`,
    `Indicador operacional interno: ${input.payload.result.score}`,
    `Completude das informacoes: ${input.payload.result.dataCompleteness}`,
    `Requer revisao humana: ${input.payload.result.requiresHumanReview ? "sim" : "nao"}`,
    `Informacoes criticas ausentes: ${
      input.payload.result.missingCriticalAnswers.length > 0
        ? input.payload.result.missingCriticalAnswers.join(", ")
        : "-"
    }`,
    `Resumo: ${input.payload.result.summary}`,
    "Observacao: classificacao e indicador sao criterios internos de priorizacao; nao representam parecer juridico, probabilidade de exito ou decisao de orgao competente.",
    "",
    "Perguntas e respostas:",
    answers,
    "",
    `UTM Source: ${input.payload.attribution.utmSource ?? "-"}`,
    `UTM Medium: ${input.payload.attribution.utmMedium ?? "-"}`,
    `UTM Campaign: ${input.payload.attribution.utmCampaign ?? "-"}`,
    `UTM Content: ${input.payload.attribution.utmContent ?? "-"}`,
    `Campanha: ${input.payload.attribution.campaignId ?? "-"}`,
    `Origem: ${input.payload.attribution.placement ?? "-"}`,
    `Horario: ${input.payload.generatedAt}`,
    "",
    `WhatsApp: ${input.payload.whatsappUrl}`,
  ].join("\n");

  return { html, text };
}
