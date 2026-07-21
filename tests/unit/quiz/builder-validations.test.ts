import { describe, expect, it } from "vitest";
import { quizBuilderDraftSchema } from "@/lib/validations/quiz-builder";

const baseDraft = {
  templateId: "00000000-0000-4000-8000-000000001111",
  name: "Quiz de triagem",
  slug: "quiz-de-triagem",
  description: "Descrição informativa do quiz para validação.",
  templateType: "custom",
  theme: "default",
  channel: null,
  campaign: null,
  introMessage: null,
  disclaimer: "Análise exclusivamente informativa.",
  resultTitle: "Resultado informativo",
  resultSummary: "Resumo do resultado informativo.",
  resultNextStep: "Aguardar contato.",
  primaryColor: "#123c69",
  secondaryColor: "#e2b714",
  buttonText: "Continuar",
  layoutDensity: "standard",
  questions: [
    {
      questionKey: "benefit-interest",
      title: "Qual assunto deseja analisar?",
      description: null,
      type: "radio",
      required: true,
      sensitive: false,
      allowsUnknown: true,
      allowsWithheld: true,
      active: true,
      options: [
        { label: "Aposentadoria", value: "aposentadoria" },
        { label: "Benefício", value: "beneficio" },
      ],
      conditions: {},
      metadata: {},
    },
  ],
} as const;

describe("visual quiz builder validation", () => {
  it("accepts a valid visual draft", () => {
    expect(quizBuilderDraftSchema.parse(baseDraft)).toMatchObject({
      slug: "quiz-de-triagem",
      questions: [{ questionKey: "benefit-interest" }],
    });
  });

  it("rejects duplicated option values", () => {
    expect(() =>
      quizBuilderDraftSchema.parse({
        ...baseDraft,
        questions: [
          {
            ...baseDraft.questions[0],
            options: [
              { label: "Sim", value: "sim" },
              { label: "Também sim", value: "sim" },
            ],
          },
        ],
      }),
    ).toThrow(/Valores de opção/);
  });

  it("requires at least two options for choice questions", () => {
    expect(() =>
      quizBuilderDraftSchema.parse({
        ...baseDraft,
        questions: [
          {
            ...baseDraft.questions[0],
            options: [{ label: "Única", value: "unica" }],
          },
        ],
      }),
    ).toThrow(/pelo menos duas opções/);
  });
});
