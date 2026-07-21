import type {
  ModerationResult,
  QuizTemplateSource,
  QuizTemplateStatus,
  QuizTemplateType,
} from "@/types/quiz";

export type OfficeQuizTemplateListItem = {
  id: string;
  tenantId: string | null;
  name: string;
  slug: string;
  type: QuizTemplateType | "custom";
  source: QuizTemplateSource;
  version: number;
  status: QuizTemplateStatus;
  category: string;
  tenantLabel: string;
  questionsCount: number;
  rulesCount: number;
  createdAt: string | null;
  updatedAt: string | null;
  canClone: boolean;
  canEdit: boolean;
  canPublish: boolean;
  canDeactivate: boolean;
};

export type OfficeQuizTemplateQuestion = {
  id: string;
  questionKey: string;
  title: string;
  description: string | null;
  type: string;
  required: boolean;
  active: boolean;
  sensitive: boolean;
  allowsUnknown: boolean;
  allowsWithheld: boolean;
  order: number;
  options: Array<{ label: string; value: string }>;
  optionsCount: number;
  conditions: Record<string, unknown>;
  metadata: Record<string, unknown>;
};

export type OfficeQuizTemplateRule = {
  id: string;
  ruleKey: string;
  ruleType: string;
  active: boolean;
  priority: number;
};

export type OfficeQuizTemplateVersion = {
  id: string;
  version: number;
  status: QuizTemplateStatus;
  publishedAt: string | null;
  createdAt: string | null;
};

export type OfficeQuizTemplateDetail = OfficeQuizTemplateListItem & {
  description: string;
  audience: string | null;
  ownership: string;
  metadata: Record<string, unknown>;
  questions: OfficeQuizTemplateQuestion[];
  rules: OfficeQuizTemplateRule[];
  versions: OfficeQuizTemplateVersion[];
  moderation: ModerationResult;
};
