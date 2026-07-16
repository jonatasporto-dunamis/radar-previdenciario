import { defaultQuizTemplates, generalQuizTemplate } from "@/config/quiz";
import type {
  QuizTemplateDefinition,
  QuizTemplateStatus,
  QuizTemplateType,
} from "@/types/quiz";

export class QuizTemplateNotFoundError extends Error {
  constructor(message = "Quiz template not found.") {
    super(message);
    this.name = "QuizTemplateNotFoundError";
  }
}

function isPubliclyUsable(template: QuizTemplateDefinition): boolean {
  return template.status === "active";
}

export function getQuizTemplates(
  status: QuizTemplateStatus | "all" = "active",
): QuizTemplateDefinition[] {
  if (status === "all") {
    return [...defaultQuizTemplates];
  }

  return defaultQuizTemplates.filter((template) => template.status === status);
}

export function getDefaultQuizTemplate(): QuizTemplateDefinition {
  return (
    defaultQuizTemplates.find(
      (template) => template.isDefault && isPubliclyUsable(template),
    ) ?? generalQuizTemplate
  );
}

export function getQuizTemplateBySlug(
  slug?: string | null,
): QuizTemplateDefinition | null {
  const normalizedSlug = slug?.trim().toLowerCase();

  if (!normalizedSlug || normalizedSlug === "geral") {
    return getDefaultQuizTemplate();
  }

  return (
    defaultQuizTemplates.find(
      (template) =>
        template.slug === normalizedSlug && isPubliclyUsable(template),
    ) ?? null
  );
}

export function getQuizTemplateById(
  templateId?: string | null,
): QuizTemplateDefinition | null {
  if (!templateId) {
    return null;
  }

  return (
    defaultQuizTemplates.find((template) => template.id === templateId) ?? null
  );
}

export function getQuizTemplateByType(
  type?: QuizTemplateType | string | null,
): QuizTemplateDefinition | null {
  if (!type) {
    return null;
  }

  return (
    defaultQuizTemplates.find((template) => template.type === type) ?? null
  );
}

export function resolveQuizTemplate(
  slug?: string | null,
): QuizTemplateDefinition {
  const template = getQuizTemplateBySlug(slug);

  if (!template) {
    throw new QuizTemplateNotFoundError();
  }

  return template;
}

export function getLegacyFallbackTemplate(): QuizTemplateDefinition {
  return getDefaultQuizTemplate();
}
