import type {
  IntegrationEventName,
  IntegrationProvider,
  IntegrationProviderDefinition,
} from "@/types/integrations";

export const integrationProviders = [
  "meta",
  "ga4",
  "google_ads",
  "tiktok",
] as const satisfies readonly IntegrationProvider[];

export const integrationProviderDefinitions: Record<
  IntegrationProvider,
  IntegrationProviderDefinition
> = {
  meta: {
    provider: "meta",
    name: "Meta",
    shortName: "Meta",
    description: "Pixel no navegador e Conversions API em modo servidor.",
    setupHint:
      "Informe o Pixel/Dataset ID. Tokens e códigos de teste ficam criptografados no servidor.",
    supportsBrowser: true,
    supportsServer: true,
    requiresSecretForServer: true,
  },
  ga4: {
    provider: "ga4",
    name: "Google Analytics 4",
    shortName: "GA4",
    description:
      "Mensuração sem PII com tag no navegador e Measurement Protocol no servidor.",
    setupHint:
      "Use um Measurement ID no formato G-XXXXXXXXXX. O API Secret nunca aparece no navegador.",
    supportsBrowser: true,
    supportsServer: true,
    requiresSecretForServer: true,
  },
  google_ads: {
    provider: "google_ads",
    name: "Google Ads",
    shortName: "Google Ads",
    description:
      "Conversões web e estrutura preparada para conversões offline validate-only.",
    setupHint:
      "Configure Conversion ID, labels por evento e, quando houver, credenciais OAuth server-side.",
    supportsBrowser: true,
    supportsServer: true,
    requiresSecretForServer: true,
  },
  tiktok: {
    provider: "tiktok",
    name: "TikTok",
    shortName: "TikTok",
    description: "Pixel no navegador e Events API em modo de teste.",
    setupHint:
      "Informe Pixel Code/ID. Access token e test event code ficam criptografados.",
    supportsBrowser: true,
    supportsServer: true,
    requiresSecretForServer: true,
  },
};

export const integrationEventLabels: Record<IntegrationEventName, string> = {
  PageViewed: "Página visualizada",
  PageView: "PageView legado",
  LeadStarted: "Cadastro iniciado",
  LeadSubmitted: "Lead enviado",
  QuizStarted: "Quiz iniciado",
  QuestionAnswered: "Pergunta respondida",
  QuizCompleted: "Quiz concluído",
  ResultGenerated: "Resultado gerado",
  ResultViewed: "Resultado visualizado",
  LeadQualified: "Lead qualificado",
  QualifiedLead: "Lead qualificado legado",
  ContactStarted: "Contato iniciado",
  LeadStatusChanged: "Status do lead alterado",
  LeadConverted: "Lead convertido",
  Purchase: "Compra/conversão",
  WhatsAppClick: "Clique no WhatsApp",
};

export const defaultIntegrationMappings: Array<{
  provider: IntegrationProvider;
  internalEvent: IntegrationEventName;
  externalEvent: string;
  enabled: boolean;
}> = [
  {
    provider: "meta",
    internalEvent: "PageViewed",
    externalEvent: "PageView",
    enabled: true,
  },
  {
    provider: "meta",
    internalEvent: "LeadSubmitted",
    externalEvent: "Lead",
    enabled: true,
  },
  {
    provider: "meta",
    internalEvent: "QuizCompleted",
    externalEvent: "CompleteRegistration",
    enabled: true,
  },
  {
    provider: "meta",
    internalEvent: "ContactStarted",
    externalEvent: "Contact",
    enabled: false,
  },
  {
    provider: "meta",
    internalEvent: "LeadConverted",
    externalEvent: "Purchase",
    enabled: false,
  },
  {
    provider: "ga4",
    internalEvent: "PageViewed",
    externalEvent: "page_view",
    enabled: true,
  },
  {
    provider: "ga4",
    internalEvent: "LeadSubmitted",
    externalEvent: "generate_lead",
    enabled: true,
  },
  {
    provider: "ga4",
    internalEvent: "QuizStarted",
    externalEvent: "quiz_start",
    enabled: true,
  },
  {
    provider: "ga4",
    internalEvent: "QuizCompleted",
    externalEvent: "quiz_complete",
    enabled: true,
  },
  {
    provider: "ga4",
    internalEvent: "ResultViewed",
    externalEvent: "result_view",
    enabled: true,
  },
  {
    provider: "ga4",
    internalEvent: "LeadConverted",
    externalEvent: "lead_converted",
    enabled: false,
  },
  {
    provider: "google_ads",
    internalEvent: "LeadSubmitted",
    externalEvent: "Lead",
    enabled: false,
  },
  {
    provider: "google_ads",
    internalEvent: "LeadQualified",
    externalEvent: "Qualified Lead",
    enabled: false,
  },
  {
    provider: "google_ads",
    internalEvent: "LeadConverted",
    externalEvent: "Conversion",
    enabled: false,
  },
  {
    provider: "tiktok",
    internalEvent: "PageViewed",
    externalEvent: "PageView",
    enabled: true,
  },
  {
    provider: "tiktok",
    internalEvent: "LeadSubmitted",
    externalEvent: "SubmitForm",
    enabled: true,
  },
  {
    provider: "tiktok",
    internalEvent: "QuizCompleted",
    externalEvent: "CompleteRegistration",
    enabled: true,
  },
  {
    provider: "tiktok",
    internalEvent: "ContactStarted",
    externalEvent: "Contact",
    enabled: false,
  },
  {
    provider: "tiktok",
    internalEvent: "LeadConverted",
    externalEvent: "CompletePayment",
    enabled: false,
  },
];

export function isIntegrationProvider(
  value: string,
): value is IntegrationProvider {
  return integrationProviders.includes(value as IntegrationProvider);
}

export function getIntegrationProviderSlug(provider: IntegrationProvider) {
  if (provider === "ga4") return "google-analytics";
  if (provider === "google_ads") return "google-ads";

  return provider;
}

export function getIntegrationProviderFromSlug(
  slug: string,
): IntegrationProvider | null {
  if (slug === "google-analytics") return "ga4";
  if (slug === "google-ads") return "google_ads";
  if (isIntegrationProvider(slug)) return slug;

  return null;
}
