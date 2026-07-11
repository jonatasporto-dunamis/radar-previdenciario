import { z } from "zod";

const requiredString = z.string().trim().min(1);
const optionalPublicString = z.string();
const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/);

const themeColorScaleSchema = z.object({
  background: hexColor,
  foreground: hexColor,
  card: hexColor,
  cardForeground: hexColor,
  popover: hexColor,
  popoverForeground: hexColor,
  primary: hexColor,
  primaryForeground: hexColor,
  secondary: hexColor,
  secondaryForeground: hexColor,
  accent: hexColor,
  accentForeground: hexColor,
  success: hexColor,
  successForeground: hexColor,
  warning: hexColor,
  warningForeground: hexColor,
  danger: hexColor,
  dangerForeground: hexColor,
  muted: hexColor,
  mutedForeground: hexColor,
  neutral: hexColor,
  neutralForeground: hexColor,
  border: hexColor,
  input: hexColor,
  ring: hexColor,
});

export const brandConfigSchema = z.object({
  name: requiredString,
  legalName: requiredString,
  logo: requiredString,
  favicon: requiredString,
  primaryColor: hexColor,
  secondaryColor: hexColor,
  accentColor: hexColor,
  backgroundColor: hexColor,
  foregroundColor: hexColor,
  whatsapp: requiredString,
  whatsappDefaultMessage: requiredString,
  phone: requiredString,
  email: z.string().email(),
  website: z.string().url(),
  instagram: optionalPublicString,
  facebook: optionalPublicString,
  linkedin: optionalPublicString,
  youtube: optionalPublicString,
  tiktok: optionalPublicString,
  address: requiredString,
  city: requiredString,
  state: requiredString,
  zipCode: requiredString,
  cnpj: requiredString,
  privacyEmail: z.string().email(),
  supportEmail: z.string().email(),
  copyright: requiredString,
  poweredBy: requiredString,
});

export const officeConfigSchema = z.object({
  responsibleLawyer: requiredString,
  oab: requiredString,
  specialties: z.array(requiredString).min(1),
  citiesServed: z.array(requiredString).min(1),
  statesServed: z.array(requiredString).min(1),
  serviceMode: requiredString,
  workingHours: requiredString,
  whatsappDefaultMessage: requiredString,
});

export const seoConfigSchema = z.object({
  title: requiredString,
  description: requiredString,
  keywords: z.array(requiredString).min(1),
  locale: requiredString,
  ogImage: requiredString,
  twitterImage: requiredString,
});

export const legalConfigSchema = z.object({
  privacyPolicyTitle: requiredString,
  privacyPolicyCompany: requiredString,
  termsTitle: requiredString,
  disclaimer: requiredString,
  cookiePolicy: requiredString,
});

export const themeConfigSchema = z.object({
  colors: z.object({
    light: themeColorScaleSchema,
    dark: themeColorScaleSchema,
  }),
  fonts: z.object({
    sans: requiredString,
    mono: requiredString,
  }),
  radius: z.object({
    sm: requiredString,
    md: requiredString,
    lg: requiredString,
    xl: requiredString,
    full: requiredString,
  }),
  spacing: z.object({
    page: requiredString,
    section: requiredString,
    content: requiredString,
  }),
  shadow: z.object({
    soft: requiredString,
    card: requiredString,
    elevated: requiredString,
  }),
  buttons: z.object({
    height: requiredString,
    paddingX: requiredString,
    radius: requiredString,
  }),
  cards: z.object({
    radius: requiredString,
    padding: requiredString,
  }),
  badges: z.object({
    radius: requiredString,
    paddingX: requiredString,
    paddingY: requiredString,
  }),
});

export const appConfigSchema = z.object({
  brand: brandConfigSchema,
  office: officeConfigSchema,
  theme: themeConfigSchema,
  seo: seoConfigSchema,
  legal: legalConfigSchema,
});
