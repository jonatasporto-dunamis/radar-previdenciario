import { z } from "zod";
import type { AttributionData } from "@/types/attribution";
import { isValidBrazilianPhone } from "@/utils/phone";

const nameRegex = /[A-Za-zÀ-ÖØ-öø-ÿ]/;

export const attributionSchema = z
  .object({
    utmSource: z.string().max(255).nullable().optional(),
    utmMedium: z.string().max(255).nullable().optional(),
    utmCampaign: z.string().max(255).nullable().optional(),
    utmContent: z.string().max(255).nullable().optional(),
    utmTerm: z.string().max(255).nullable().optional(),
    fbclid: z.string().max(500).nullable().optional(),
    gclid: z.string().max(500).nullable().optional(),
    campaignId: z.string().max(500).nullable().optional(),
    adsetId: z.string().max(500).nullable().optional(),
    adId: z.string().max(500).nullable().optional(),
    placement: z.string().max(255).nullable().optional(),
    siteSourceName: z.string().max(255).nullable().optional(),
    referrer: z.string().max(1000).nullable().optional(),
    landingPage: z.string().max(1000).nullable().optional(),
  })
  .strict()
  .default({});

export const leadFormSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(3, "Informe seu nome completo.")
    .max(150, "O nome deve ter no máximo 150 caracteres.")
    .refine((value) => nameRegex.test(value), "Informe um nome válido.")
    .refine(
      (value) => value.replace(/\s+/g, " ").trim().split(" ").length >= 2,
      "Informe nome e sobrenome.",
    )
    .refine((value) => !/^\d+$/.test(value), "Informe um nome válido."),
  email: z
    .string()
    .trim()
    .max(254, "O e-mail deve ter no máximo 254 caracteres.")
    .email("Informe um e-mail válido."),
  phone: z
    .string()
    .trim()
    .min(1, "Informe seu telefone.")
    .max(30, "O telefone deve ter no máximo 30 caracteres.")
    .refine(isValidBrazilianPhone, "Informe um telefone com DDD válido."),
  privacyConsent: z
    .boolean()
    .refine(
      (value) => value,
      "É necessário aceitar a Política de Privacidade.",
    ),
  website: z.string().max(100).optional(),
  attribution: attributionSchema.optional(),
});

export const createLeadSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(3)
    .max(150)
    .refine((value) => value.replace(/\s+/g, " ").trim().split(" ").length >= 2)
    .refine((value) => nameRegex.test(value))
    .refine((value) => !/^\d+$/.test(value)),
  email: z.string().trim().toLowerCase().max(254).email(),
  phone: z.string().refine(isValidBrazilianPhone),
  attribution: attributionSchema.optional(),
  userAgent: z.string().max(1000).nullable().optional(),
  ipAddress: z.string().max(100).nullable().optional(),
  status: z.literal("new").default("new"),
});

export type LeadFormInput = z.infer<typeof leadFormSchema>;
export type CreateLeadInput = z.infer<typeof createLeadSchema> & {
  attribution?: AttributionData;
};
