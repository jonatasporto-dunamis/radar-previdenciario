import { beforeAll, describe, expect, it } from "vitest";
import {
  createBlankOfficeQuizTemplate,
  getOfficeQuizTemplate,
  saveOfficeQuizTemplateBuilderDraft,
} from "@/services/office-dashboard/quizzes";
import type { OfficeUserContext } from "@/types/office-dashboard";

const tenantA = "00000000-0000-4000-8000-000000000001";

const adminContext: OfficeUserContext = {
  userId: "00000000-0000-4000-8000-000000000901",
  email: "admin@example.com",
  tenantId: tenantA,
  tenantSlug: "resende-advogados",
  tenantName: "Resende Advogados Associados",
  tenantStatus: "active",
  membershipId: "00000000-0000-4000-8000-000000000911",
  role: "admin",
  displayName: "Admin E2E",
};

describe("visual quiz builder service", () => {
  beforeAll(() => {
    process.env.E2E_MOCK_SUPABASE = "true";
  });

  it("creates and saves a tenant visual quiz draft", async () => {
    const templateId = await createBlankOfficeQuizTemplate({
      context: adminContext,
    });
    const template = await getOfficeQuizTemplate({
      context: adminContext,
      templateId,
    });

    expect(template).toMatchObject({
      id: templateId,
      source: "tenant",
      status: "draft",
    });

    await saveOfficeQuizTemplateBuilderDraft({
      context: adminContext,
      draft: {
        templateId,
        name: "Quiz visual E2E",
        slug: `quiz-visual-e2e-${Date.now()}`,
        description: "Template visual salvo pelo serviço do painel interno.",
        templateType: "custom",
        theme: "default",
        channel: "organic",
        campaign: "service-test",
        introMessage: "Responda em poucos passos.",
        disclaimer:
          "Esta análise possui caráter exclusivamente informativo e não substitui avaliação jurídica individual.",
        resultTitle: "Resultado informativo",
        resultSummary: "Resumo informativo para revisão humana.",
        resultNextStep: "Aguardar contato do escritório.",
        primaryColor: "#123c69",
        secondaryColor: "#e2b714",
        buttonText: "Continuar",
        layoutDensity: "standard",
        questions: [
          {
            id: template?.questions[0]?.id,
            questionKey: "benefit-interest",
            title: "Qual assunto deseja analisar?",
            description: "Escolha a opção mais próxima.",
            type: "radio",
            required: true,
            sensitive: false,
            allowsUnknown: true,
            allowsWithheld: true,
            active: true,
            options: [
              { label: "Aposentadoria", value: "aposentadoria" },
              { label: "Benefício do INSS", value: "beneficio_inss" },
            ],
            conditions: {},
            metadata: {},
          },
          {
            questionKey: "previous-request",
            title: "Já fez pedido no INSS?",
            description: null,
            type: "boolean",
            required: true,
            sensitive: false,
            allowsUnknown: true,
            allowsWithheld: true,
            active: true,
            options: [],
            conditions: {
              visibleWhen: {
                questionKey: "benefit-interest",
                operator: "answered",
                value: "",
              },
            },
            metadata: {},
          },
        ],
      },
    });

    const updated = await getOfficeQuizTemplate({
      context: adminContext,
      templateId,
    });

    expect(updated?.name).toBe("Quiz visual E2E");
    expect(updated?.questions).toHaveLength(2);
    expect(updated?.metadata).toMatchObject({
      editorMode: "visual_builder",
      channel: "organic",
    });
  });
});
