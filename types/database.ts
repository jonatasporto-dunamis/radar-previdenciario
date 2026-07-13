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
  | "WhatsAppClick";

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

export type JsonObject = Record<string, unknown>;

export type Lead = {
  id: string;
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
  lead_id: string | null;
  status: QuizSessionStatus;
  started_at: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type QuizAnswer = {
  id: string;
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
  session_id: string | null;
  lead_id: string | null;
  potential_benefit: string | null;
  score: number;
  classification: ResultClassification;
  summary: string | null;
  ethical_disclaimer: string | null;
  created_at: string;
};

export type TrackingEvent = {
  id: string;
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
