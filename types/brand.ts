export type SocialUrl = string;

export type BrandConfig = {
  name: string;
  legalName: string;
  logo: string;
  favicon: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  foregroundColor: string;
  whatsapp: string;
  whatsappDefaultMessage: string;
  phone?: string;
  email?: string;
  website: string;
  instagram: SocialUrl;
  facebook: SocialUrl;
  linkedin: SocialUrl;
  youtube: SocialUrl;
  tiktok: SocialUrl;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  cnpj?: string;
  privacyEmail?: string;
  supportEmail?: string;
  copyright: string;
  poweredBy: string;
};

export type LegalProfessionalConfig = {
  name: string;
  registration: string;
  sectional: string;
  displayRegistration: string;
};

export type TenantLegalIdentity = {
  officeName: string;
  responsibleProfessionalName?: string;
  professionalRegistration?: string;
  companyName?: string;
  companyDocument?: string;
  officeRegistration?: string;
  privacyEmail?: string;
  address?: string;
};

export type PrivacyContactConfig = {
  contactEmail?: string;
  contactChannel?: string;
};

export type DataRetentionConfig = {
  incompleteSessionDays: number;
  completedTriageDays: number;
  activeLeadDays: number;
  trackingDays: number;
  internalTrackingDays: number;
  securityLogDays: number;
  notificationLogDays: number;
  externalDeliveryDays: number;
  auditLogDays: number;
};

export type OfficeConfig = {
  responsibleLawyer?: string;
  oab?: string;
  legalProfessional?: LegalProfessionalConfig;
  legalIdentity: TenantLegalIdentity;
  specialties: string[];
  citiesServed: string[];
  statesServed: string[];
  serviceMode: string;
  workingHours: string;
  whatsappDefaultMessage: string;
  units: string[];
  privacy: PrivacyContactConfig;
  dataRetention: DataRetentionConfig;
  email: {
    fromName: string;
    fromAddress: string;
    replyTo: string;
    notificationEmail: string;
  };
};

export type SeoConfig = {
  title: string;
  description: string;
  keywords: string[];
  locale: string;
  ogImage: string;
  twitterImage: string;
};

export type LegalConfig = {
  privacyPolicyTitle: string;
  privacyPolicyCompany: string;
  termsTitle: string;
  disclaimer: string;
  disclaimers: {
    full: string;
    short: string;
    emailInternal: string;
    registration: string;
    result: string;
  };
  cookiePolicy: string;
};

export type ThemeColorScale = {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  accent: string;
  accentForeground: string;
  success: string;
  successForeground: string;
  warning: string;
  warningForeground: string;
  danger: string;
  dangerForeground: string;
  muted: string;
  mutedForeground: string;
  neutral: string;
  neutralForeground: string;
  border: string;
  input: string;
  ring: string;
};

export type ThemeConfig = {
  colors: {
    light: ThemeColorScale;
    dark: ThemeColorScale;
  };
  fonts: {
    sans: string;
    mono: string;
  };
  radius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };
  spacing: {
    page: string;
    section: string;
    content: string;
  };
  shadow: {
    soft: string;
    card: string;
    elevated: string;
  };
  buttons: {
    height: string;
    paddingX: string;
    radius: string;
  };
  cards: {
    radius: string;
    padding: string;
  };
  badges: {
    radius: string;
    paddingX: string;
    paddingY: string;
  };
};
