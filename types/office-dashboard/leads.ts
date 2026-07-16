export type LeadCommercialStatus =
  | "new"
  | "contacted"
  | "in_review"
  | "awaiting_information"
  | "scheduled"
  | "converted"
  | "not_qualified"
  | "lost"
  | "archived";

export type InternalClassification =
  "alto_potencial" | "medio_potencial" | "baixo_potencial";

export type LeadPriority = "high" | "medium" | "low";

export type OfficeLeadListItem = {
  id: string;
  createdAt: string | null;
  fullName: string;
  maskedEmail: string;
  maskedPhone: string;
  commercialStatus: LeadCommercialStatus;
  potentialBenefit: string | null;
  templateName: string | null;
  templateType: string | null;
  templateVersion: number | null;
  dataCompleteness: "complete" | "partial" | "insufficient" | null;
  classification: InternalClassification | null;
  score: number | null;
  requiresHumanReview: boolean;
  source: string | null;
  utmCampaign: string | null;
};

export type OfficeLeadAttribution = {
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  utmTerm: string | null;
  campaignId: string | null;
  adsetId: string | null;
  adId: string | null;
  placement: string | null;
  referrer: string | null;
  landingPage: string | null;
};

export type OfficeQuizAnswer = {
  id: string;
  questionId: string;
  questionLabel: string;
  answerValue: string;
  answerLabel: string;
  benefitContext: string | null;
  answerState: "answered" | "unknown" | "withheld" | "not_applicable";
  createdAt: string | null;
};

export type OfficeQuizResult = {
  id: string;
  sessionId: string | null;
  templateId: string | null;
  templateName: string | null;
  templateType: string | null;
  templateVersion: number | null;
  topic: string | null;
  potentialBenefit: string | null;
  score: number;
  classification: InternalClassification;
  dataCompleteness: "complete" | "partial" | "insufficient";
  missingCriticalAnswers: string[];
  requiresHumanReview: boolean;
  matchedRules: Record<string, unknown>[];
  summary: string | null;
  ethicalDisclaimer: string | null;
  createdAt: string | null;
};

export type OfficeNotificationLog = {
  id: string;
  provider: string;
  status: string;
  priority: string;
  attempt: number;
  queuedAt: string | null;
  sentAt: string | null;
  failedAt: string | null;
  lastError: string | null;
  createdAt: string | null;
};

export type OfficeTimelineItem = {
  id: string;
  type: "tracking" | "status" | "note" | "notification" | "audit";
  label: string;
  description?: string;
  createdAt: string | null;
};

export type OfficeLeadDetail = {
  id: string;
  tenantId: string;
  tenantName: string;
  fullName: string;
  email: string;
  phone: string;
  createdAt: string | null;
  updatedAt: string | null;
  commercialStatus: LeadCommercialStatus;
  attribution: OfficeLeadAttribution;
  latestResult: OfficeQuizResult | null;
  quizAnswers: OfficeQuizAnswer[];
  notifications: OfficeNotificationLog[];
  timeline: OfficeTimelineItem[];
  missingCriticalAnswers: string[];
  unknownAnswers: string[];
  withheldAnswers: string[];
  requiresHumanReview: boolean;
};

export type OfficeLeadListResult = {
  items: OfficeLeadListItem[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};
