export type TenantBrandingSettings = {
  version: 1;
  logoUrl: string;
  iconUrl: string;
  faviconUrl: string;
  socialImageUrl: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  buttonColor: string;
  buttonTextColor: string;
  whatsappColor: string;
  whatsappNumber: string;
  contactEmail: string;
  contactPhone: string;
  shortContactText: string;
  institutionalMessage: string;
  registrationTitle: string;
  registrationSubtitle: string;
  registrationSupportText: string;
  registrationButtonLabel: string;
  whatsappMessage: string;
  publishedAt: string | null;
};

export type TenantBrandingAssetType = "logo" | "icon" | "favicon" | "social";
