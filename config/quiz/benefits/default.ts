import type { BenefitDefinition } from "@/types/quiz";

export const defaultBenefits: BenefitDefinition[] = [
  {
    id: "benefit-retirement",
    slug: "aposentadoria",
    title: "Aposentadoria",
    description:
      "Agrupa perguntas de triagem inicial relacionadas a tempo de contribuição, idade e histórico de trabalho.",
    priority: 10,
    active: true,
    icon: "badge-check",
    color: "primary",
  },
  {
    id: "benefit-disability",
    slug: "incapacidade",
    title: "Benefícios por incapacidade",
    description:
      "Agrupa perguntas sobre afastamentos, condições de saúde e impacto laboral.",
    priority: 20,
    active: true,
    icon: "shield-check",
    color: "secondary",
  },
  {
    id: "benefit-assistance",
    slug: "assistencial",
    title: "Benefícios assistenciais",
    description:
      "Agrupa perguntas preliminares sobre vulnerabilidade social e renda familiar.",
    priority: 30,
    active: true,
    icon: "heart-handshake",
    color: "success",
  },
];
