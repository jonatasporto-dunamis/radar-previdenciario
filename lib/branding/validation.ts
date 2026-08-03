import { z } from "zod";
import type { TenantBrandingSettings } from "@/types/branding";

const hexColor = z
  .string()
  .trim()
  .regex(/^#[0-9a-fA-F]{6}$/, "Use uma cor hexadecimal no formato #RRGGBB.")
  .transform((value) => value.toLowerCase());

const optionalUrl = z
  .string()
  .trim()
  .max(500)
  .refine(
    (value) =>
      value === "" ||
      value.startsWith("/") ||
      /^https:\/\/[^/]+\.supabase\.co\/storage\/v1\/object\/public\/tenant-branding\//.test(
        value,
      ),
    "A imagem deve vir do storage de identidade da plataforma.",
  );

const optionalEmail = z
  .string()
  .trim()
  .max(160)
  .refine(
    (value) => value === "" || z.string().email().safeParse(value).success,
    "Informe um e-mail válido.",
  );

const optionalWhatsapp = z
  .string()
  .trim()
  .transform((value) => value.replace(/\D/g, ""))
  .refine(
    (value) => value === "" || /^\d{10,15}$/.test(value),
    "Informe o WhatsApp com DDD e código do país.",
  );

const tenantBrandingSettingsObjectSchema = z.object({
  version: z.literal(1).default(1),
  logoUrl: optionalUrl.default(""),
  iconUrl: optionalUrl.default(""),
  faviconUrl: optionalUrl.default(""),
  socialImageUrl: optionalUrl.default(""),
  primaryColor: hexColor.default("#12312f"),
  secondaryColor: hexColor.default("#0f766e"),
  accentColor: hexColor.default("#b78b3b"),
  backgroundColor: hexColor.default("#fbfaf7"),
  textColor: hexColor.default("#171717"),
  buttonColor: hexColor.default("#12312f"),
  buttonTextColor: hexColor.default("#ffffff"),
  whatsappColor: hexColor.default("#166534"),
  whatsappNumber: optionalWhatsapp.default(""),
  contactEmail: optionalEmail.default(""),
  contactPhone: z.string().trim().max(40).default(""),
  shortContactText: z.string().trim().max(180).default(""),
  institutionalMessage: z.string().trim().max(220).default(""),
  registrationTitle: z.string().trim().min(3).max(80),
  registrationSubtitle: z.string().trim().min(10).max(180),
  registrationSupportText: z.string().trim().min(10).max(180),
  registrationButtonLabel: z.string().trim().min(3).max(50),
  whatsappMessage: z.string().trim().min(10).max(300),
  publishedAt: z.string().datetime().nullable().default(null),
});

function validateBrandingContrast(
  value: {
    textColor: string;
    backgroundColor: string;
    buttonTextColor: string;
    buttonColor: string;
  },
  context: z.RefinementCtx,
) {
  const contrastPairs = [
    [value.textColor, value.backgroundColor, "textColor"],
    [value.buttonTextColor, value.buttonColor, "buttonTextColor"],
  ] as const;

  contrastPairs.forEach(([foreground, background, path]) => {
    if (getContrastRatio(foreground, background) < 4.5) {
      context.addIssue({
        code: "custom",
        path: [path],
        message: "A combinação precisa atingir contraste WCAG AA de 4,5:1.",
      });
    }
  });
}

export const tenantBrandingSettingsSchema =
  tenantBrandingSettingsObjectSchema.superRefine(validateBrandingContrast);

export const tenantBrandingFormSchema = tenantBrandingSettingsObjectSchema
  .omit({
    logoUrl: true,
    iconUrl: true,
    faviconUrl: true,
    socialImageUrl: true,
    publishedAt: true,
  })
  .extend({
    displayName: z.string().trim().min(2).max(120),
    legalName: z.string().trim().min(2).max(160),
  })
  .superRefine(validateBrandingContrast);

export const defaultTenantBrandingSettings: TenantBrandingSettings =
  tenantBrandingSettingsSchema.parse({
    version: 1,
    registrationTitle: "Cadastro inicial",
    registrationSubtitle:
      "Preencha seus dados para iniciar uma triagem rápida e informativa.",
    registrationSupportText:
      "Leva poucos minutos. Ao final, você receberá uma orientação inicial sobre o seu caso.",
    registrationButtonLabel: "Iniciar minha triagem",
    whatsappMessage:
      "Olá! Acessei o Radar Previdenciário e gostaria de falar com a equipe.",
  });

function channelToLinear(value: number): number {
  const normalized = value / 255;

  return normalized <= 0.04045
    ? normalized / 12.92
    : ((normalized + 0.055) / 1.055) ** 2.4;
}

function getLuminance(color: string): number {
  const channels = [1, 3, 5].map((index) =>
    Number.parseInt(color.slice(index, index + 2), 16),
  );
  const [red, green, blue] = channels.map(channelToLinear);

  return red * 0.2126 + green * 0.7152 + blue * 0.0722;
}

export function getContrastRatio(foreground: string, background: string) {
  const lighter = Math.max(getLuminance(foreground), getLuminance(background));
  const darker = Math.min(getLuminance(foreground), getLuminance(background));

  return (lighter + 0.05) / (darker + 0.05);
}

export function readTenantBrandingSettings(
  metadata: Record<string, unknown> | undefined,
): TenantBrandingSettings {
  const parsed = tenantBrandingSettingsSchema.safeParse(metadata?.branding);

  return parsed.success ? parsed.data : defaultTenantBrandingSettings;
}
