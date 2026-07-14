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
  email: z.object({
    fromName: z.string().trim(),
    fromAddress: z.string().trim(),
    replyTo: z.string().trim(),
    notificationEmail: z.string().trim(),
  }),
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

const externalTrackingEventConfigSchema = z.object({
  enabled: z.boolean(),
  browser: z.boolean(),
  server: z.boolean(),
});

export const trackingConfigSchema = z.object({
  enabled: z.boolean(),
  consentRequired: z.boolean(),
  dryRun: z.boolean(),
  meta: z.object({
    enabled: z.boolean(),
    pixelId: z.string().trim().optional(),
    apiVersion: z.string().trim().min(1),
    testEventCode: z.string().trim().optional(),
    testMode: z.boolean(),
  }),
  ga4: z.object({
    enabled: z.boolean(),
    measurementId: z.string().trim().optional(),
  }),
  gtm: z.object({
    enabled: z.boolean(),
    containerId: z.string().trim().optional(),
  }),
  events: z.object({
    PageView: externalTrackingEventConfigSchema,
    LeadStarted: externalTrackingEventConfigSchema,
    LeadSubmitted: externalTrackingEventConfigSchema,
    QuizStarted: externalTrackingEventConfigSchema,
    QuizCompleted: externalTrackingEventConfigSchema,
    QualifiedLead: externalTrackingEventConfigSchema,
    ResultViewed: externalTrackingEventConfigSchema,
    WhatsAppClick: externalTrackingEventConfigSchema,
  }),
});

export const appConfigSchema = z.object({
  brand: brandConfigSchema,
  office: officeConfigSchema,
  theme: themeConfigSchema,
  seo: seoConfigSchema,
  legal: legalConfigSchema,
  tracking: trackingConfigSchema,
});
