export type LeadStatus = "new";

export type QuizSessionStatus = "started" | "completed";

export type ResultClassification =
  "alto_potencial" | "medio_potencial" | "baixo_potencial";

export type TrackingEventName =
  | "PageView"
  | "LeadStarted"
  | "LeadSubmitted"
  | "QuizStarted"
  | "QuestionAnswered"
  | "QuizCompleted"
  | "ResultGenerated"
  | "ResultViewed"
  | "QualifiedLead"
  | "NotificationQueued"
  | "NotificationSent"
  | "NotificationFailed"
  | "NotificationIgnored"
  | "WhatsAppClick"
  | "TermsAcknowledged"
  | "ContactConsentGranted"
  | "SensitiveDataConsentGranted"
  | "SensitiveDataConsentDenied"
  | "MarketingConsentGranted"
  | "MarketingConsentDenied"
  | "TrackingConsentGranted"
  | "TrackingConsentDenied"
  | "ConsentRevoked";

export type NotificationProvider =
  "email" | "whatsapp" | "slack" | "discord" | "crm" | "webhook";

export type NotificationPriority = "low" | "medium" | "high" | "critical";

export type NotificationStatus =
  | "pending"
  | "processing"
  | "sent"
  | "failed"
  | "retrying"
  | "ignored"
  | "cancelled";

export type ExternalTrackingProvider =
  "meta_pixel" | "meta_capi" | "ga4" | "gtm";

export type ExternalTrackingChannel = "browser" | "server";

export type ExternalTrackingDeliveryStatus = NotificationStatus;

export type JsonObject = Record<string, unknown>;

export type TenantStatus = "active" | "inactive" | "suspended";

export type TenantDomainStatus = "active" | "inactive";

export type TenantSecretStatus = "active" | "inactive" | "rotated";

export type QuizTemplateType =
  "general" | "maternity" | "fibromyalgia" | "depression" | "autism" | "custom";

export type QuizTemplateSource = "platform" | "tenant";

export type QuizTemplateStatus = "draft" | "active" | "inactive" | "archived";

export type QuizTemplateOwnership = "platform_managed" | "tenant_managed";

export type Tenant = {
  id: string;
  slug: string;
  name: string;
  legal_name: string;
  status: TenantStatus;
  is_default: boolean;
  timezone: string;
  locale: string;
  metadata: JsonObject;
  created_at: string;
  updated_at: string;
};

export type TenantDomain = {
  id: string;
  tenant_id: string;
  hostname: string;
  is_primary: boolean;
  status: TenantDomainStatus;
  metadata: JsonObject;
  created_at: string;
  updated_at: string;
};

export type TenantTrackingConfig = {
  id: string;
  tenant_id: string;
  enabled: boolean;
  consent_required: boolean;
  external_tracking_dry_run: boolean;
  meta_enabled: boolean;
  meta_pixel_id: string | null;
  meta_api_version: string;
  meta_test_mode: boolean;
  ga4_enabled: boolean;
  ga4_measurement_id: string | null;
  gtm_enabled: boolean;
  gtm_container_id: string | null;
  event_config: JsonObject;
  created_at: string;
  updated_at: string;
};

export type TenantSecret = {
  id: string;
  tenant_id: string;
  secret_key: string;
  encrypted_value: string;
  status: TenantSecretStatus;
  created_at: string;
  updated_at: string;
};

export type Lead = {
  id: string;
  tenant_id: string;
  full_name: string;
  email: string;
  phone: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  fbclid: string | null;
  gclid: string | null;
  campaign_id: string | null;
  adset_id: string | null;
  ad_id: string | null;
  placement: string | null;
  site_source_name: string | null;
  referrer: string | null;
  landing_page: string | null;
  user_agent: string | null;
  ip_address: string | null;
  status: LeadStatus;
  created_at: string;
  updated_at: string;
};

export type QuizSession = {
  id: string;
  tenant_id: string;
  lead_id: string | null;
  quiz_template_id: string | null;
  quiz_template_version: number | null;
  template_type: QuizTemplateType | null;
  status: QuizSessionStatus;
  started_at: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type QuizAnswer = {
  id: string;
  tenant_id: string;
  session_id: string | null;
  lead_id: string | null;
  question_id: string;
  question_label: string;
  answer_value: string;
  answer_label: string;
  benefit_context: string | null;
  created_at: string;
};

export type QuizResult = {
  id: string;
  tenant_id: string;
  session_id: string | null;
  lead_id: string | null;
  quiz_template_id: string | null;
  quiz_template_version: number | null;
  template_type: QuizTemplateType | null;
  potential_benefit: string | null;
  topic: string | null;
  score: number;
  classification: ResultClassification;
  summary: string | null;
  ethical_disclaimer: string | null;
  data_completeness: "complete" | "partial" | "insufficient";
  missing_critical_answers: JsonObject[] | string[];
  requires_human_review: boolean;
  matched_rules: JsonObject[];
  created_at: string;
};

export type QuizTemplate = {
  id: string;
  tenant_id: string | null;
  slug: string;
  name: string;
  description: string;
  template_type: QuizTemplateType;
  source: QuizTemplateSource;
  status: QuizTemplateStatus;
  version: number;
  is_default: boolean;
  category: string;
  audience: string | null;
  ownership: QuizTemplateOwnership;
  created_by_user_id: string | null;
  metadata: JsonObject;
  created_at: string;
  updated_at: string;
};

export type QuizTemplateQuestion = {
  id: string;
  quiz_template_id: string;
  question_key: string;
  title: string;
  description: string | null;
  question_type: string;
  is_required: boolean;
  is_sensitive: boolean;
  allows_unknown: boolean;
  allows_withheld: boolean;
  display_order: number;
  options: JsonObject[];
  conditions: JsonObject[];
  metadata: JsonObject;
  created_at: string;
  updated_at: string;
};

export type QuizTemplateRule = {
  id: string;
  quiz_template_id: string;
  rule_key: string;
  rule_type: string;
  conditions: JsonObject[];
  effects: JsonObject;
  priority: number;
  status: QuizTemplateStatus;
  created_at: string;
  updated_at: string;
};

export type TrackingEvent = {
  id: string;
  tenant_id: string;
  lead_id: string | null;
  session_id: string | null;
  event_name: TrackingEventName;
  event_payload: JsonObject | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  fbclid: string | null;
  gclid: string | null;
  campaign_id: string | null;
  adset_id: string | null;
  ad_id: string | null;
  placement: string | null;
  site_source_name: string | null;
  referrer: string | null;
  landing_page: string | null;
  user_agent: string | null;
  ip_address: string | null;
  created_at: string;
};

export type NotificationLog = {
  id: string;
  tenant_id: string;
  lead_id: string | null;
  result_id: string | null;
  notification_type: string;
  recipient: string;
  provider: NotificationProvider;
  priority: NotificationPriority;
  status: NotificationStatus;
  attempt: number;
  payload_hash: string | null;
  queued_at: string | null;
  processing_started_at: string | null;
  error_message: string | null;
  last_error: string | null;
  sent_at: string | null;
  failed_at: string | null;
  created_at: string;
};

export type ExternalTrackingDelivery = {
  id: string;
  tenant_id: string;
  tracking_event_id: string | null;
  lead_id: string | null;
  session_id: string | null;
  result_id: string | null;
  event_name: TrackingEventName;
  event_id: string;
  provider: ExternalTrackingProvider;
  channel: ExternalTrackingChannel;
  status: ExternalTrackingDeliveryStatus;
  attempt: number;
  test_event: boolean;
  request_payload_hash: string | null;
  provider_event_id: string | null;
  queued_at: string | null;
  processing_started_at: string | null;
  sent_at: string | null;
  failed_at: string | null;
  last_error: string | null;
  created_at: string;
  updated_at: string;
};
