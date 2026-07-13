import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Text,
} from "@react-email/components";
import { createElement } from "react";
import { CTA, Footer, Header, Section, Table } from "./components";
import type { LeadNotificationPayload } from "@/services/notification/pipeline/payload";

export type LeadQualifiedEmailProps = {
  payload: LeadNotificationPayload;
};

export function LeadQualifiedEmail({ payload }: LeadQualifiedEmailProps) {
  return createElement(
    Html,
    { lang: "pt-BR" },
    createElement(Head),
    createElement(
      Preview,
      null,
      "Novo lead qualificado no Radar Previdenciario",
    ),
    createElement(
      Body,
      { style: { backgroundColor: "#f8fafc", margin: 0, padding: "32px" } },
      createElement(
        Container,
        {
          style: {
            backgroundColor: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            margin: "0 auto",
            maxWidth: "680px",
            padding: "32px",
          },
        },
        createElement(Header, {
          title: "Novo lead de alto potencial",
          subtitle:
            "Um lead concluiu a analise e apresentou sinais preliminares relevantes.",
        }),
        createElement(
          Section,
          { title: "Dados do lead" },
          createElement(Table, {
            items: [
              { label: "Nome", value: payload.lead.fullName },
              { label: "Telefone", value: payload.lead.phone },
              { label: "Email", value: payload.lead.email },
              { label: "Beneficio provavel", value: payload.result.benefit },
              { label: "Classificacao", value: payload.result.classification },
              { label: "Score interno", value: payload.result.score },
              { label: "Horario", value: payload.generatedAt },
            ],
          }),
        ),
        createElement(
          Section,
          { title: "Resumo" },
          createElement(
            Text,
            {
              style: {
                color: "#334155",
                fontSize: "14px",
                lineHeight: "22px",
                margin: 0,
              },
            },
            payload.result.summary,
          ),
        ),
        createElement(
          Section,
          { title: "Perguntas e respostas" },
          createElement(Table, {
            items: payload.answers.map((answer) => ({
              label: answer.question,
              value: answer.answer,
            })),
          }),
        ),
        createElement(
          Section,
          { title: "Atribuicao" },
          createElement(Table, {
            items: [
              { label: "UTM Source", value: payload.attribution.utmSource },
              { label: "UTM Medium", value: payload.attribution.utmMedium },
              { label: "UTM Campaign", value: payload.attribution.utmCampaign },
              { label: "UTM Content", value: payload.attribution.utmContent },
              { label: "Campanha", value: payload.attribution.campaignId },
              { label: "Origem", value: payload.attribution.placement },
            ],
          }),
        ),
        createElement(CTA, {
          href: payload.whatsappUrl,
          label: "Conversar pelo WhatsApp",
        }),
        createElement(Footer),
      ),
    ),
  );
}

export default LeadQualifiedEmail;
