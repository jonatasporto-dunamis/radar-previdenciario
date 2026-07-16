import { describe, expect, it } from "vitest";
import { leadFormSchema } from "@/lib/validations/lead";
import { validateQuestionAnswer } from "@/lib/validations/quiz";
import { questionFixtures } from "@/tests/fixtures";
import type { QuestionDefinition } from "@/types/quiz";

describe("zod schemas and quiz validation", () => {
  it("accepts a valid lead form and rejects invalid consent", () => {
    const valid = leadFormSchema.safeParse({
      fullName: "Maria Previdencia",
      email: "maria@example.com",
      phone: "(71) 98153-3737",
      termsAcknowledgement: true,
      contactConsent: true,
      marketingConsent: false,
      website: "",
      attribution: {},
    });
    const invalid = leadFormSchema.safeParse({
      fullName: "Maria Previdencia",
      email: "maria@example.com",
      phone: "(71) 98153-3737",
      termsAcknowledgement: false,
      contactConsent: false,
      marketingConsent: false,
      website: "",
      attribution: {},
    });

    expect(valid.success).toBe(true);
    expect(invalid.success).toBe(false);
  });

  it("validates checkbox options and minimum selections", () => {
    const question = questionFixtures[0];

    expect(validateQuestionAnswer(question, ["aposentadoria"])).toEqual({
      success: true,
      value: ["aposentadoria"],
    });
    expect(validateQuestionAnswer(question, [])).toMatchObject({
      success: false,
    });
    expect(validateQuestionAnswer(question, ["invalida"])).toMatchObject({
      success: false,
    });
    expect(
      validateQuestionAnswer(
        {
          ...question,
          required: false,
          validations: { maxSelections: 1, message: "Selecione menos." },
        },
        ["aposentadoria", "incapacidade"],
      ),
    ).toEqual({
      success: false,
      error: "Selecione menos.",
    });
  });

  it("validates numeric bounds and optional empty values", () => {
    const numericQuestion = questionFixtures[1];
    const optionalQuestion = questionFixtures[2];

    expect(validateQuestionAnswer(numericQuestion, "55")).toEqual({
      success: true,
      value: "55",
    });
    expect(validateQuestionAnswer(numericQuestion, "200")).toMatchObject({
      success: false,
    });
    expect(validateQuestionAnswer(numericQuestion, "abc")).toMatchObject({
      success: false,
    });
    expect(validateQuestionAnswer(numericQuestion, "-1")).toMatchObject({
      success: false,
    });
    expect(validateQuestionAnswer(optionalQuestion, "")).toEqual({
      success: true,
      value: "",
    });
  });

  it("validates email, phone, cpf and text constraints", () => {
    const emailQuestion: QuestionDefinition = {
      ...questionFixtures[2],
      id: "email",
      type: "email",
      required: true,
    };
    const phoneQuestion: QuestionDefinition = {
      ...questionFixtures[2],
      id: "phone",
      type: "phone",
      required: true,
    };
    const cpfQuestion: QuestionDefinition = {
      ...questionFixtures[2],
      id: "cpf",
      type: "cpf",
      required: true,
    };

    expect(validateQuestionAnswer(emailQuestion, "user@example.com")).toEqual({
      success: true,
      value: "user@example.com",
    });
    expect(validateQuestionAnswer(emailQuestion, "user")).toMatchObject({
      success: false,
    });
    expect(validateQuestionAnswer(phoneQuestion, "(71) 98153-3737")).toEqual({
      success: true,
      value: "(71) 98153-3737",
    });
    expect(validateQuestionAnswer(cpfQuestion, "123.456.789-10")).toEqual({
      success: true,
      value: "123.456.789-10",
    });
    expect(validateQuestionAnswer(phoneQuestion, "123")).toMatchObject({
      success: false,
    });
    expect(validateQuestionAnswer(cpfQuestion, "123")).toMatchObject({
      success: false,
    });
  });

  it("validates text length and pattern constraints", () => {
    const textQuestion: QuestionDefinition = {
      ...questionFixtures[2],
      id: "text",
      type: "text",
      required: true,
      validations: {
        minLength: 3,
        maxLength: 5,
        pattern: "^[a-z]+$",
        message: "Texto inválido.",
      },
    };

    expect(validateQuestionAnswer(textQuestion, "abc")).toEqual({
      success: true,
      value: "abc",
    });
    expect(validateQuestionAnswer(textQuestion, "ab")).toEqual({
      success: false,
      error: "Texto inválido.",
    });
    expect(validateQuestionAnswer(textQuestion, "abcdef")).toEqual({
      success: false,
      error: "Texto inválido.",
    });
    expect(validateQuestionAnswer(textQuestion, "ABC")).toEqual({
      success: false,
      error: "Texto inválido.",
    });
  });

  it("validates boolean, radio and select answers", () => {
    const booleanQuestion: QuestionDefinition = {
      ...questionFixtures[2],
      type: "boolean",
      required: true,
    };
    const radioQuestion: QuestionDefinition = {
      ...questionFixtures[0],
      type: "radio",
    };
    const selectQuestion: QuestionDefinition = {
      ...questionFixtures[0],
      type: "select",
    };

    expect(validateQuestionAnswer(booleanQuestion, true)).toEqual({
      success: true,
      value: true,
    });
    expect(validateQuestionAnswer(booleanQuestion, "true")).toMatchObject({
      success: false,
    });
    expect(validateQuestionAnswer(radioQuestion, "aposentadoria")).toEqual({
      success: true,
      value: "aposentadoria",
    });
    expect(validateQuestionAnswer(selectQuestion, "missing")).toMatchObject({
      success: false,
    });
  });
});
