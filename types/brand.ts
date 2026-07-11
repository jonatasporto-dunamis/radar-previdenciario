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
  phone: string;
  email: string;
  website: string;
  instagram: SocialUrl;
  facebook: SocialUrl;
  linkedin: SocialUrl;
  youtube: SocialUrl;
  tiktok: SocialUrl;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  cnpj: string;
  privacyEmail: string;
  supportEmail: string;
  copyright: string;
  poweredBy: string;
};

export type OfficeConfig = {
  responsibleLawyer: string;
  oab: string;
  specialties: string[];
  citiesServed: string[];
  statesServed: string[];
  serviceMode: string;
  workingHours: string;
  whatsappDefaultMessage: string;
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
