export type AppRoute =
  "/" | "/cadastro" | "/quiz" | "/resultado" | "/privacidade" | "/termos";

export type {
  JsonObject,
  Lead,
  LeadStatus,
  NotificationLog,
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
  CompositeTypes as SupabaseCompositeTypes,
  Database as SupabaseDatabase,
  Enums as SupabaseEnums,
  Json as SupabaseJson,
  Tables as SupabaseTables,
  TablesInsert as SupabaseTablesInsert,
  TablesUpdate as SupabaseTablesUpdate,
} from "./supabase";
