export type AppRoute =
  | "/"
  | "/cadastro"
  | "/quiz"
  | "/quiz/salario-maternidade"
  | "/quiz/fibromialgia"
  | "/quiz/depressao"
  | "/quiz/autismo"
  | "/resultado"
  | "/privacidade"
  | "/termos";

export type {
  JsonObject,
  ExternalTrackingChannel as DatabaseExternalTrackingChannel,
  ExternalTrackingDelivery as DatabaseExternalTrackingDelivery,
  ExternalTrackingDeliveryStatus as DatabaseExternalTrackingDeliveryStatus,
  ExternalTrackingProvider as DatabaseExternalTrackingProvider,
  Lead,
  LeadStatus,
  NotificationLog,
  NotificationPriority,
  NotificationProvider,
  NotificationStatus,
  Tenant as DatabaseTenant,
  TenantDomain as DatabaseTenantDomain,
  TenantDomainStatus as DatabaseTenantDomainStatus,
  TenantSecret as DatabaseTenantSecret,
  TenantSecretStatus as DatabaseTenantSecretStatus,
  TenantStatus as DatabaseTenantStatus,
  TenantTrackingConfig as DatabaseTenantTrackingConfig,
  QuizTemplate as DatabaseQuizTemplate,
  QuizTemplateOwnership as DatabaseQuizTemplateOwnership,
  QuizTemplateQuestion as DatabaseQuizTemplateQuestion,
  QuizTemplateRule as DatabaseQuizTemplateRule,
  QuizTemplateSource as DatabaseQuizTemplateSource,
  QuizTemplateStatus as DatabaseQuizTemplateStatus,
  QuizTemplateType as DatabaseQuizTemplateType,
  QuizAnswer,
  QuizResult,
  QuizSession,
  QuizSessionStatus,
  ResultClassification,
  TrackingEvent,
  TrackingEventName,
} from "./database";

export type {
  LeadCommercialStatus,
  LeadNote,
  LeadPriority,
  LeadListFilters,
  InternalClassification,
  OfficeAuditAction,
  OfficeAuditLog,
  OfficeAuthActionState,
  OfficeLeadAttribution,
  OfficeLeadDetail,
  OfficeLeadListItem,
  OfficeLeadListResult,
  OfficeMembership,
  OfficeMembershipStatus,
  OfficeNotificationLog,
  OfficeQuizAnswer,
  OfficeQuizResult,
  OfficeRole,
  OfficeTimelineItem,
  OfficeUserContext,
} from "./office-dashboard";

export type {
  BrandConfig,
  DataRetentionConfig,
  LegalProfessionalConfig,
  TenantLegalIdentity,
  LegalConfig,
  OfficeConfig,
  PrivacyContactConfig,
  SeoConfig,
  SocialUrl,
  ThemeColorScale,
  ThemeConfig,
} from "./brand";

export type { AttributionData } from "./attribution";

export type {
  BenefitDefinition,
  AnswerCompleteness,
  AnswerState,
  FlowDefinition,
  InternalQualification,
  QuestionAnswerPrimitive,
  QuestionAnswerValue,
  QuestionDefinition,
  QuestionNavigationTarget,
  QuestionOption,
  QuestionType,
  QuestionValidationDefinition,
  QuestionVisibilityCondition,
  QuestionVisibilityOperator,
  BenefitRuleDefinition,
  QuizAnswerMap,
  QuizNavigationState,
  QuizProgress,
  PublicResult,
  ModerationLevel,
  ModerationResult,
  QuizResultClassification,
  QuizResultComputation,
  QuizStoredAnswer,
  QuizTemplateDefinition,
  QuizTemplateOwnership,
  QuizTemplatePermissionAction,
  QuizTemplatePermissionRole,
  QuizTemplatePreventiveText,
  QuizTemplatePublicResult,
  QuizTemplateSource,
  QuizTemplateStatus,
  QuizTemplateType,
  RuleCandidate,
  RuleConditionDefinition,
  RuleConditionOperator,
  RuleEvaluation,
  RuleMatchReason,
} from "./quiz";

export type {
  AppConfig,
  ConfigurationContext,
  ConfigurationSource,
} from "./configuration";

export type {
  Tenant,
  TenantContext,
  TenantDomain,
  TenantDomainStatus,
  TenantResolutionSource,
  TenantResolveInput,
  TenantSecret,
  TenantSecretKey,
  TenantSecretStatus,
  TenantStatus,
  TenantTrackingConfig,
} from "./tenants";

export type {
  ExternalTrackingChannel,
  ExternalTrackingDelivery,
  ExternalTrackingDeliveryStatus,
  ExternalTrackingEvent,
  ExternalTrackingEventName,
  ExternalTrackingProvider,
  SafeAttributionData,
  SafeExternalMetadata,
  SanitizedExternalPayload,
  TrackingConsentDecision,
  TrackingConsentStatus,
} from "./tracking";

export type {
  IntegrationCardSummary,
  IntegrationDeliveryLog,
  IntegrationDeliveryStatus,
  IntegrationEventName,
  IntegrationProvider,
  IntegrationProviderDefinition,
  IntegrationStatus,
  IntegrationTestRun,
  IntegrationTestStatus,
  TenantEventMapping,
  TenantIntegration,
} from "./integrations";

export type {
  CompositeTypes as SupabaseCompositeTypes,
  Database as SupabaseDatabase,
  Enums as SupabaseEnums,
  Json as SupabaseJson,
  Tables as SupabaseTables,
  TablesInsert as SupabaseTablesInsert,
  TablesUpdate as SupabaseTablesUpdate,
} from "./supabase";
