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
