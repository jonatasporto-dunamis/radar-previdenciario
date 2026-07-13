import type { BenefitRuleDefinition } from "@/types/quiz";

export const defaultBenefitRulesVersion = 1;

export const defaultBenefitRules: BenefitRuleDefinition[] = [
  {
    benefitSlug: "aposentadoria",
    active: true,
    conditions: [
      {
        questionId: "primary-interest",
        operator: "includes",
        value: "aposentadoria",
        score: 35,
        reason: "Interesse declarado em aposentadoria.",
      },
      {
        questionId: "contribution-years",
        operator: "min",
        value: 15,
        score: 30,
        reason: "Tempo de contribuição estimado relevante para triagem.",
      },
      {
        questionId: "contribution-years",
        operator: "min",
        value: 5,
        score: 15,
        reason: "Há histórico contributivo informado.",
      },
      {
        questionId: "work-type",
        operator: "not_equals",
        value: "sem_atividade",
        score: 10,
        reason: "Atividade profissional informada.",
      },
    ],
  },
  {
    benefitSlug: "incapacidade",
    active: true,
    conditions: [
      {
        questionId: "primary-interest",
        operator: "includes",
        value: "incapacidade",
        score: 30,
        reason: "Interesse declarado em benefício por incapacidade.",
      },
      {
        questionId: "has-medical-condition",
        operator: "equals",
        value: true,
        score: 45,
        reason: "Condição de saúde com impacto laboral foi informada.",
      },
      {
        questionId: "currently-working",
        operator: "equals",
        value: false,
        score: 10,
        reason: "Ausência de trabalho atual informada.",
      },
    ],
  },
  {
    benefitSlug: "assistencial",
    active: true,
    conditions: [
      {
        questionId: "primary-interest",
        operator: "includes",
        value: "assistencial",
        score: 35,
        reason: "Interesse declarado em benefício assistencial.",
      },
      {
        questionId: "last-income",
        operator: "max",
        value: 1800,
        score: 25,
        reason: "Renda aproximada informada exige atenção na triagem.",
      },
      {
        questionId: "has-medical-condition",
        operator: "equals",
        value: true,
        score: 10,
        reason: "Condição de saúde pode exigir avaliação assistencial.",
      },
    ],
  },
];
