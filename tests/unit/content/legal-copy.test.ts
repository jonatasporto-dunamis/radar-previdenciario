import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { buildPublicResult } from "@/services/quiz/results";
import { evaluateQuizRules } from "@/services/quiz/rules";
import { validateQuestionAnswer } from "@/lib/validations/quiz";
import { createStoredAnswerFixture } from "@/tests/fixtures";
import type {
  BenefitDefinition,
  BenefitRuleDefinition,
  QuestionDefinition,
  QuizAnswerMap,
} from "@/types/quiz";

function readProjectFile(...parts: string[]) {
  return readFileSync(join(process.cwd(), ...parts), "utf8");
}

describe("legal and ethical public copy", () => {
  it("keeps public CTAs and result labels prudential", () => {
    const publicCopy = [
      readProjectFile("app", "page.tsx"),
      readProjectFile("app", "cadastro", "page.tsx"),
      readProjectFile("app", "quiz", "page.tsx"),
      readProjectFile("app", "resultado", "page.tsx"),
      readProjectFile("components", "common", "hero.tsx"),
      readProjectFile("components", "common", "cta-section.tsx"),
      readProjectFile("components", "layout", "header.tsx"),
      readProjectFile("components", "leads", "LeadRegistrationForm.tsx"),
    ].join("\n");

    [
      /Alto potencial/i,
      /M[eé]dio potencial/i,
      /Baixo potencial/i,
      />\s*Score\s*</i,
      /chance de [eê]xito/i,
      /percentual/i,
      /Benef[ií]cio prov[aá]vel/i,
      /direito garantido/i,
      /aprovad[ao]/i,
      /Iniciar an[aá]lise gratuita/i,
      /consulta gr[aá]tis/i,
      /garanta/i,
      /receba seu benef[ií]cio/i,
      /[uú]ltima chance/i,
    ].forEach((forbiddenPattern) => {
      expect(publicCopy).not.toMatch(forbiddenPattern);
    });
  });

  it("keeps the core disclaimer explicit", () => {
    const legalConfig = readProjectFile("config", "legal", "default.ts");

    expect(legalConfig).toContain("não confirma direito a benefício");
    expect(legalConfig).toContain("não constitui parecer jurídico");
    expect(legalConfig).toContain("avaliação individual");
  });

  it("keeps notification labels internal and avoids benefit probable wording", () => {
    const notificationCopy = [
      readProjectFile("services", "notification", "templates", "render.tsx"),
      readProjectFile("emails", "templates", "lead-qualified.tsx"),
      readProjectFile("emails", "templates", "lead-medium.tsx"),
    ].join("\n");

    expect(notificationCopy).not.toMatch(/Benef[ií]cio prov[aá]vel/i);
    expect(notificationCopy).toMatch(/Classificacao interna/i);
    expect(notificationCopy).toMatch(/Indicador operacional interno/i);
  });

  it("keeps PublicResult as an explicit public allowlist", () => {
    const publicResult = buildPublicResult({
      result: {
        classification: "alto_potencial",
        potential_benefit: "Aposentadoria",
        ethical_disclaimer: "Triagem informativa.",
        summary: null,
        template_type: null,
        topic: null,
      },
      fallbackDisclaimer: "Aviso padrão.",
    });

    expect(Object.keys(publicResult).sort()).toEqual([
      "disclaimer",
      "informationalMessage",
      "nextStep",
      "summary",
      "title",
      "topicLabel",
    ]);
    expect(publicResult).not.toHaveProperty("classification");
    expect(publicResult).not.toHaveProperty("score");
    expect(publicResult).not.toHaveProperty("threshold");
    expect(publicResult).not.toHaveProperty("priority");
    expect(publicResult).not.toHaveProperty("ruleMatches");
  });

  it("keeps public scenario titles non-classificatory", () => {
    const fallbackDisclaimer = "Aviso padrão.";
    const classifications = [
      "alto_potencial",
      "medio_potencial",
      "baixo_potencial",
    ] as const;

    for (const classification of classifications) {
      const publicResult = buildPublicResult({
        result: {
          classification,
          potential_benefit: "Triagem previdenciária",
          ethical_disclaimer: null,
          summary: null,
          template_type: null,
          topic: null,
        },
        fallbackDisclaimer,
      });

      expect(publicResult.title).not.toMatch(/alto|m[eé]dio|baixo/i);
      expect(publicResult.summary).not.toMatch(/chance|probabilidade|score/i);
      expect(publicResult.disclaimer).toBe(fallbackDisclaimer);
    }
  });

  it("keeps institutional identification sober and pending data explicit", () => {
    const officeConfig = readProjectFile("config", "office", "default.ts");
    const brandConfig = readProjectFile("config", "brand", "default.ts");
    const publicLegalPages = [
      readProjectFile("app", "privacidade", "page.tsx"),
      readProjectFile("app", "termos", "page.tsx"),
      readProjectFile("components", "common", "footer-company.tsx"),
    ].join("\n");

    expect(officeConfig).toContain("EDILSON DE ALMEIDA RESENDE");
    expect(officeConfig).toContain("OAB/BA 45.987");
    expect(officeConfig).toContain("Vitória da Conquista/BA");
    expect(officeConfig).toContain("Belo Campo/BA");
    expect(officeConfig).toContain("Jitaúna/BA");
    expect(brandConfig).toContain("cnpj: undefined");
    expect(publicLegalPages).toMatch(/displayRegistration|OAB\/BA 45\.987/);
    expect(publicLegalPages).toMatch(/pendente/i);
  });

  it("keeps WhatsApp and CTAs free of PII and aggressive promises", () => {
    const brandConfig = readProjectFile("config", "brand", "default.ts");
    const officeConfig = readProjectFile("config", "office", "default.ts");
    const whatsappMessages = [brandConfig, officeConfig]
      .map(
        (config) =>
          config.match(/whatsappDefaultMessage:\s*\n\s*"([^"]+)"/)?.[1],
      )
      .filter(Boolean)
      .join("\n");
    const ctas = [
      readProjectFile("components", "common", "cta-section.tsx"),
      readProjectFile("components", "layout", "header.tsx"),
      readProjectFile("components", "common", "floating-whatsapp.tsx"),
      brandConfig,
      officeConfig,
    ].join("\n");

    expect(officeConfig).toContain("concluí a triagem informativa");
    expect(whatsappMessages).not.toMatch(
      /full_name|email|phone|score|classifica|benef[ií]cio|diagn[oó]stico|direito/i,
    );
    expect(ctas).not.toMatch(/garanta|consulta gr[aá]tis|contrate agora/i);
  });

  it("keeps consent categories separated", () => {
    const leadForm = readProjectFile(
      "components",
      "leads",
      "LeadRegistrationForm.tsx",
    );
    const quizExperience = readProjectFile(
      "components",
      "quiz",
      "experience",
      "QuizExperience.tsx",
    );
    const trackingBanner = readProjectFile(
      "components",
      "tracking",
      "TrackingConsentBanner.tsx",
    );

    expect(leadForm).toContain("triageConsent");
    expect(leadForm).toContain("marketingConsent");
    expect(leadForm).toMatch(/facultativ[ao]/i);
    expect(quizExperience).toContain("sensitiveDisclaimer");
    expect(trackingBanner).toContain("Continuar sem mensuração");
  });

  it("accepts unknown and withheld states without treating them as negative answers", () => {
    const question: QuestionDefinition = {
      id: "primary-interest",
      slug: "primary-interest",
      version: 1,
      title: "Tema principal",
      type: "radio",
      required: true,
      options: [{ value: "aposentadoria", label: "Aposentadoria" }],
      validations: {},
      benefits: ["aposentadoria"],
      answerStateOptions: ["unknown", "withheld"],
      active: true,
      order: 1,
    };

    expect(validateQuestionAnswer(question, "unknown")).toEqual({
      success: true,
      value: "unknown",
    });
    expect(validateQuestionAnswer(question, "withheld")).toEqual({
      success: true,
      value: "withheld",
    });
  });

  it("rejects mixed checkbox states and activates human review for insufficient data", () => {
    const checkboxQuestion: QuestionDefinition = {
      id: "primary-interest",
      slug: "primary-interest",
      version: 1,
      title: "Tema principal",
      type: "checkbox",
      required: true,
      options: [{ value: "aposentadoria", label: "Aposentadoria" }],
      validations: { minSelections: 1 },
      benefits: ["aposentadoria"],
      answerStateOptions: ["unknown", "withheld"],
      active: true,
      order: 1,
    };
    const benefits: BenefitDefinition[] = [
      {
        id: "aposentadoria",
        slug: "aposentadoria",
        title: "Aposentadoria",
        description: "Tema interno",
        priority: 1,
        active: true,
        icon: "circle",
        color: "primary",
      },
    ];
    const rules: BenefitRuleDefinition[] = [
      {
        benefitSlug: "aposentadoria",
        active: true,
        conditions: [
          {
            questionId: "primary-interest",
            operator: "includes",
            value: "aposentadoria",
            score: 100,
            reason: "Tema informado",
          },
        ],
      },
    ];
    const answers: QuizAnswerMap = {
      "primary-interest": createStoredAnswerFixture({
        questionId: "primary-interest",
        questionLabel: "Tema principal",
        answerValue: "withheld",
        answerLabel: "Prefiro não informar",
      }),
    };

    expect(
      validateQuestionAnswer(checkboxQuestion, ["unknown", "aposentadoria"]),
    ).toMatchObject({
      success: false,
    });

    const evaluation = evaluateQuizRules(answers, rules, benefits, 1);

    expect(evaluation.topCandidate).toBeNull();
    expect(evaluation.requiresHumanReview).toBe(true);
    expect(evaluation.answerCompleteness).not.toBe("complete");
    expect(evaluation.missingCriticalAnswers).toContain("primary-interest");
  });
});
