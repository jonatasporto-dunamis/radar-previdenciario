export type AppRoute =
  "/" | "/cadastro" | "/quiz" | "/resultado" | "/privacidade" | "/termos";

export type {
  JsonObject,
  Lead,
  LeadStatus,
  NotificationLog,
  NotificationPriority,
  NotificationProvider,
  NotificationStatus,
  QuizAnswer,
  QuizResult,
  QuizSession,
  QuizSessionStatus,
  ResultClassification,
  TrackingEvent,
  TrackingEventName,
} from "./database";

export type {
  BrandConfig,
  LegalConfig,
  OfficeConfig,
  SeoConfig,
  SocialUrl,
  ThemeColorScale,
  ThemeConfig,
} from "./brand";

export type { AttributionData } from "./attribution";

export type {
  BenefitDefinition,
  FlowDefinition,
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
  QuizResultClassification,
  QuizResultComputation,
  QuizStoredAnswer,
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
  CompositeTypes as SupabaseCompositeTypes,
  Database as SupabaseDatabase,
  Enums as SupabaseEnums,
  Json as SupabaseJson,
  Tables as SupabaseTables,
  TablesInsert as SupabaseTablesInsert,
  TablesUpdate as SupabaseTablesUpdate,
} from "./supabase";
