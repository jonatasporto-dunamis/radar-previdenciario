import type { QuizTemplateDefinition } from "@/types/quiz";
import { moderateCustomQuizContent } from "./moderation";

export function cloneQuizTemplateForTenant(input: {
  template: QuizTemplateDefinition;
  tenantId: string;
  slug: string;
  name?: string;
  description?: string;
}): QuizTemplateDefinition {
  const name = input.name ?? input.template.name;
  const description = input.description ?? input.template.description;
  const moderation = moderateCustomQuizContent(`${name}\n${description}`);

  if (moderation.level === "blocked") {
    throw new Error("Custom quiz template contains blocked content.");
  }

  return {
    ...input.template,
    id: crypto.randomUUID(),
    tenantId: input.tenantId,
    slug: input.slug,
    name,
    description,
    source: "tenant",
    ownership: "tenant_managed",
    status: "draft",
    isDefault: false,
    version: 1,
    metadata: {
      ...input.template.metadata,
      clonedFromTemplateId: input.template.id,
      moderationLevel: moderation.level,
    },
  };
}
