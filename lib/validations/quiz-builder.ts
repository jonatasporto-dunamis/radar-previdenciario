import { z } from "zod";

export const quizBuilderQuestionTypes = [
  "radio",
  "checkbox",
  "boolean",
  "text",
  "textarea",
  "number",
  "date",
  "phone",
  "select",
  "info",
] as const;

export const quizBuilderOptionSchema = z
  .object({
    label: z.string().trim().min(1).max(120),
    value: z
      .string()
      .trim()
      .min(1)
      .max(80)
      .regex(/^[a-z0-9][a-z0-9_-]*$/),
  })
  .strict();

export const quizBuilderQuestionSchema = z
  .object({
    id: z.string().uuid().optional(),
    questionKey: z
      .string()
      .trim()
      .min(2)
      .max(80)
      .regex(/^[a-z0-9][a-z0-9-]*$/),
    title: z.string().trim().min(3).max(220),
    description: z.string().trim().max(500).nullable().default(null),
    type: z.enum(quizBuilderQuestionTypes),
    required: z.boolean().default(true),
    sensitive: z.boolean().default(false),
    allowsUnknown: z.boolean().default(true),
    allowsWithheld: z.boolean().default(true),
    active: z.boolean().default(true),
    options: z.array(quizBuilderOptionSchema).max(20).default([]),
    conditions: z.record(z.string(), z.unknown()).default({}),
    metadata: z.record(z.string(), z.unknown()).default({}),
  })
  .strict()
  .superRefine((question, ctx) => {
    const optionTypes = new Set(["radio", "checkbox", "select"]);

    if (optionTypes.has(question.type) && question.options.length < 2) {
      ctx.addIssue({
        code: "custom",
        message: "Perguntas de escolha precisam ter pelo menos duas opções.",
        path: ["options"],
      });
    }

    const values = new Set<string>();

    question.options.forEach((option, index) => {
      if (values.has(option.value)) {
        ctx.addIssue({
          code: "custom",
          message: "Valores de opção não podem se repetir.",
          path: ["options", index, "value"],
        });
      }

      values.add(option.value);
    });
  });

export const quizBuilderDraftSchema = z
  .object({
    templateId: z.string().uuid(),
    name: z.string().trim().min(3).max(160),
    slug: z
      .string()
      .trim()
      .min(3)
      .max(120)
      .regex(/^[a-z0-9][a-z0-9-]*$/),
    description: z.string().trim().min(10).max(800),
    templateType: z.string().trim().min(3).max(80).default("custom"),
    theme: z.string().trim().max(80).default("default"),
    channel: z.string().trim().max(80).nullable().default(null),
    campaign: z.string().trim().max(120).nullable().default(null),
    introMessage: z.string().trim().max(800).nullable().default(null),
    disclaimer: z.string().trim().max(800).nullable().default(null),
    resultTitle: z.string().trim().max(160).nullable().default(null),
    resultSummary: z.string().trim().max(800).nullable().default(null),
    resultNextStep: z.string().trim().max(300).nullable().default(null),
    primaryColor: z
      .string()
      .trim()
      .regex(/^#[0-9a-f]{6}$/i)
      .default("#123c69"),
    secondaryColor: z
      .string()
      .trim()
      .regex(/^#[0-9a-f]{6}$/i)
      .default("#e2b714"),
    buttonText: z.string().trim().min(3).max(80).default("Continuar"),
    layoutDensity: z.enum(["standard", "compact"]).default("standard"),
    questions: z.array(quizBuilderQuestionSchema).min(1).max(80),
  })
  .strict();

export type QuizBuilderDraftInput = z.infer<typeof quizBuilderDraftSchema>;
