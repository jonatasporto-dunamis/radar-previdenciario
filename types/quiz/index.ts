export type QuestionType =
  | "text"
  | "textarea"
  | "number"
  | "currency"
  | "date"
  | "boolean"
  | "radio"
  | "checkbox"
  | "select"
  | "cpf"
  | "phone"
  | "email";

export type QuizTemplateType =
  "general" | "maternity" | "fibromyalgia" | "depression" | "autism" | "custom";

export type QuizTemplateSource = "platform" | "tenant";

export type QuizTemplateOwnership = "platform_managed" | "tenant_managed";

export type QuizTemplateStatus = "draft" | "active" | "inactive" | "archived";

export type QuestionAnswerPrimitive = string | number | boolean;

export type QuestionAnswerValue = string | number | boolean | string[] | null;

export type QuestionOption = {
  value: string;
  label: string;
  description?: string;
  metadata?: Record<string, QuestionAnswerPrimitive>;
};

export type QuestionValidationDefinition = {
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  minSelections?: number;
  maxSelections?: number;
  pattern?: string;
  message?: string;
};

export type QuestionVisibilityOperator =
  "equals" | "not_equals" | "includes" | "exists";

export type QuestionVisibilityCondition = {
  questionId: string;
  operator: QuestionVisibilityOperator;
  value?: QuestionAnswerPrimitive;
};

export type QuestionNavigationTarget = {
  questionId: string;
  when?: QuestionVisibilityCondition[];
};

export type QuestionDefinition = {
  id: string;
  slug: string;
  version: number;
  title: string;
  description?: string;
  type: QuestionType;
  required: boolean;
  placeholder?: string;
  options?: QuestionOption[];
  validations?: QuestionValidationDefinition;
  answerStateOptions?: Array<Exclude<AnswerState, "answered">>;
  benefits: string[];
  next?: string | QuestionNavigationTarget[];
  previous?: string;
  visibleWhen?: QuestionVisibilityCondition[];
  metadata?: Record<
    string,
    QuestionAnswerPrimitive | QuestionAnswerPrimitive[]
  >;
  active: boolean;
  order: number;
};

export type BenefitDefinition = {
  id: string;
  slug: string;
  title: string;
  description: string;
  priority: number;
  active: boolean;
  icon: string;
  color: string;
};

export type FlowDefinition = {
  id: string;
  slug: string;
  benefit: string;
  steps: string[];
  version: number;
  active: boolean;
};

export type QuizStoredAnswer = {
  questionId: string;
  questionLabel: string;
  answerValue: QuestionAnswerValue;
  answerLabel: string;
  benefitContext: string | null;
  createdAt?: string | null;
};

export type QuizAnswerMap = Record<string, QuizStoredAnswer>;

export type QuizProgress = {
  totalQuestions: number;
  totalRequiredQuestions: number;
  answeredQuestions: number;
  answeredRequiredQuestions: number;
  currentQuestionIndex: number;
  percent: number;
  isComplete: boolean;
};

export type QuizNavigationState = {
  currentQuestionId: string;
  previousQuestionId: string | null;
  nextQuestionId: string | null;
  isFirstQuestion: boolean;
  isLastQuestion: boolean;
};

export type RuleConditionOperator =
  "equals" | "not_equals" | "includes" | "min" | "max" | "exists";

export type RuleConditionDefinition = {
  questionId: string;
  operator: RuleConditionOperator;
  value?: QuestionAnswerPrimitive;
  score: number;
  reason: string;
};

export type BenefitRuleDefinition = {
  ruleKey?: string;
  ruleType?: "score" | "topic" | "completeness";
  benefitSlug: string;
  active: boolean;
  priority?: number;
  status?: QuizTemplateStatus;
  conditions: RuleConditionDefinition[];
  effects?: Record<string, QuestionAnswerPrimitive | QuestionAnswerPrimitive[]>;
};

export type RuleMatchReason = {
  questionId: string;
  reason: string;
  score: number;
};

export type RuleCandidate = {
  benefitSlug: string;
  benefitTitle: string;
  priority: number;
  score: number;
  matched: boolean;
  reasons: RuleMatchReason[];
};

export type RuleEvaluation = {
  rulesVersion: number;
  templateType?: QuizTemplateType;
  candidates: RuleCandidate[];
  topCandidate: RuleCandidate | null;
  answeredQuestionCount: number;
  answerCompleteness: AnswerCompleteness;
  missingCriticalAnswers: string[];
  requiresHumanReview: boolean;
};

export type QuizResultClassification =
  "alto_potencial" | "medio_potencial" | "baixo_potencial";

export type QuizResultComputation = {
  potentialBenefit: string | null;
  topic: string | null;
  templateType?: QuizTemplateType;
  quizTemplateId?: string | null;
  quizTemplateVersion?: number | null;
  score: number;
  classification: QuizResultClassification;
  summary: string;
  ethicalDisclaimer: string;
  candidates: RuleCandidate[];
  dataCompleteness: AnswerCompleteness;
  missingCriticalAnswers: string[];
  requiresHumanReview: boolean;
};

export type AnswerState =
  "answered" | "unknown" | "withheld" | "not_applicable";

export type AnswerCompleteness = "complete" | "partial" | "insufficient";

export type InternalQualification = {
  classification: QuizResultClassification;
  score: number;
  templateType?: QuizTemplateType;
  topic: string | null;
  threshold: {
    high: number;
    medium: number;
  };
  priority: "high" | "medium" | "low";
  shouldNotify: boolean;
  potentialBenefit: string | null;
  ruleMatches: RuleCandidate[];
  operationalReason: string;
  dataCompleteness: AnswerCompleteness;
  missingCriticalAnswers: string[];
  requiresHumanReview: boolean;
};

export type PublicResult = {
  title: string;
  summary: string;
  nextStep: string;
  disclaimer: string;
  topicLabel: string;
  informationalMessage: string;
};

export type QuizTemplatePublicResult = Pick<
  PublicResult,
  "title" | "summary" | "nextStep" | "topicLabel"
>;

export type QuizTemplatePreventiveText = {
  shortDisclaimer: string;
  sensitiveDisclaimer?: string;
  resultDisclaimer: string;
};

export type QuizTemplateDefinition = {
  id: string;
  tenantId?: string | null;
  slug: string;
  name: string;
  description: string;
  category: string;
  audience: string;
  type: QuizTemplateType;
  source: QuizTemplateSource;
  ownership: QuizTemplateOwnership;
  status: QuizTemplateStatus;
  version: number;
  isDefault: boolean;
  questions: QuestionDefinition[];
  rules: BenefitRuleDefinition[];
  result: QuizTemplatePublicResult;
  completenessFields: string[];
  preventiveText: QuizTemplatePreventiveText;
  metadata?: Record<
    string,
    QuestionAnswerPrimitive | QuestionAnswerPrimitive[]
  >;
};

export type ModerationLevel = "allowed" | "warning" | "blocked";

export type ModerationResult = {
  level: ModerationLevel;
  matches: Array<{
    term: string;
    level: Exclude<ModerationLevel, "allowed">;
  }>;
};

export type QuizTemplatePermissionRole =
  "admin" | "manager" | "agent" | "viewer";

export type QuizTemplatePermissionAction =
  "view" | "clone" | "create" | "edit" | "publish" | "deactivate" | "version";
