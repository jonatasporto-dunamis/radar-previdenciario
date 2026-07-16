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
  {
    id: "benefit-maternity",
    slug: "salario-maternidade",
    title: "Salário-maternidade",
    description:
      "Agrupa perguntas preliminares sobre evento, categoria de segurada, contribuições e pedido no INSS.",
    priority: 40,
    active: true,
    icon: "baby",
    color: "primary",
  },
  {
    id: "benefit-fibromyalgia",
    slug: "fibromialgia",
    title: "Tema relacionado à fibromialgia",
    description:
      "Organiza informações sobre impactos funcionais relatados, sem diagnóstico ou conclusão de incapacidade.",
    priority: 50,
    active: true,
    icon: "activity",
    color: "secondary",
  },
  {
    id: "benefit-depression",
    slug: "depressao",
    title: "Tema relacionado à depressão",
    description:
      "Organiza informações sobre saúde mental e impactos funcionais informados, sem avaliar gravidade clínica.",
    priority: 60,
    active: true,
    icon: "heart-pulse",
    color: "warning",
  },
  {
    id: "benefit-autism",
    slug: "autismo",
    title: "Tema relacionado ao autismo",
    description:
      "Organiza informações preliminares sobre BPC, dependentes e contexto familiar, sem solicitar dados completos de terceiros.",
    priority: 70,
    active: true,
    icon: "users",
    color: "success",
  },
  {
    id: "benefit-death-pension",
    slug: "pensao",
    title: "Pensão ou benefício familiar",
    description:
      "Agrupa perguntas preliminares sobre pensão por morte ou benefício familiar para triagem geral.",
    priority: 80,
    active: true,
    icon: "file-heart",
    color: "neutral",
  },
];
