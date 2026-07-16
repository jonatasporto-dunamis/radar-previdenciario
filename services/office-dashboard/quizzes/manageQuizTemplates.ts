import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { canManageQuizTemplate } from "@/services/quiz/templates";
import { moderateCustomQuizContent } from "@/services/quiz/templates/moderation";
import { insertAuditLog } from "../repositories";
import type {
  OfficeQuizTemplateDetail,
  OfficeQuizTemplateListItem,
  OfficeQuizTemplateQuestion,
  OfficeQuizTemplateRule,
  OfficeQuizTemplateVersion,
  OfficeUserContext,
} from "@/types/office-dashboard";
import type {
  QuizTemplateSource,
  QuizTemplateStatus,
  QuizTemplateType,
} from "@/types/quiz";
import type { Database, Json } from "@/types/supabase";

type TemplateRow = Database["public"]["Tables"]["quiz_templates"]["Row"];
type TemplateInsert = Database["public"]["Tables"]["quiz_templates"]["Insert"];
type QuestionRow =
  Database["public"]["Tables"]["quiz_template_questions"]["Row"];
type RuleRow = Database["public"]["Tables"]["quiz_template_rules"]["Row"];
type VersionRow = Database["public"]["Tables"]["quiz_template_versions"]["Row"];

type TemplateCounts = {
  questionsCount: number;
  rulesCount: number;
};

const templateTypes: QuizTemplateType[] = [
  "general",
  "maternity",
  "fibromyalgia",
  "depression",
  "autism",
  "custom",
];
const templateSources: QuizTemplateSource[] = ["platform", "tenant"];
const templateStatuses: QuizTemplateStatus[] = [
  "draft",
  "active",
  "inactive",
  "archived",
];

function assertSafeTemplateText(value: string): void {
  if (
    /[<>]|javascript:|select\s+.*\s+from|insert\s+into|drop\s+table/i.test(
      value,
    )
  ) {
    throw new Error(
      "Template contains unsupported markup, script or SQL-like content.",
    );
  }
}

function toTemplateType(value: string): QuizTemplateType | "custom" {
  return templateTypes.includes(value as QuizTemplateType)
    ? (value as QuizTemplateType)
    : "custom";
}

function toTemplateSource(value: string): QuizTemplateSource {
  return templateSources.includes(value as QuizTemplateSource)
    ? (value as QuizTemplateSource)
    : "tenant";
}

function toTemplateStatus(value: string): QuizTemplateStatus {
  return templateStatuses.includes(value as QuizTemplateStatus)
    ? (value as QuizTemplateStatus)
    : "draft";
}

function toMetadata(value: Json): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, unknown>;
}

function getArrayLength(value: Json): number {
  return Array.isArray(value) ? value.length : 0;
}

function canAccessTemplate(
  context: OfficeUserContext,
  template: Pick<TemplateRow, "tenant_id" | "source">,
): boolean {
  return (
    template.source === "platform" || template.tenant_id === context.tenantId
  );
}

function getTemplatePermissions(
  context: OfficeUserContext,
  template: Pick<TemplateRow, "source">,
) {
  const source = toTemplateSource(template.source);

  return {
    canClone:
      source === "platform" &&
      canManageQuizTemplate({
        role: context.role,
        action: "clone",
        template: { source },
      }),
    canEdit: canManageQuizTemplate({
      role: context.role,
      action: "edit",
      template: { source },
    }),
    canPublish: canManageQuizTemplate({
      role: context.role,
      action: "publish",
      template: { source },
    }),
    canDeactivate: canManageQuizTemplate({
      role: context.role,
      action: "deactivate",
      template: { source },
    }),
  };
}

function mapTemplateListItem(
  context: OfficeUserContext,
  row: TemplateRow,
  counts: TemplateCounts,
): OfficeQuizTemplateListItem {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    name: row.name,
    slug: row.slug,
    type: toTemplateType(row.template_type),
    source: toTemplateSource(row.source),
    version: row.version,
    status: toTemplateStatus(row.status),
    category: row.category,
    tenantLabel: row.tenant_id ? context.tenantName : "Plataforma",
    questionsCount: counts.questionsCount,
    rulesCount: counts.rulesCount,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    ...getTemplatePermissions(context, row),
  };
}

function mapQuestion(row: QuestionRow): OfficeQuizTemplateQuestion {
  return {
    id: row.id,
    questionKey: row.question_key,
    title: row.title,
    type: row.question_type,
    required: row.is_required,
    active: true,
    sensitive: row.is_sensitive,
    allowsUnknown: row.allows_unknown,
    allowsWithheld: row.allows_withheld,
    order: row.display_order,
    optionsCount: getArrayLength(row.options),
  };
}

function mapRule(row: RuleRow): OfficeQuizTemplateRule {
  return {
    id: row.id,
    ruleKey: row.rule_key,
    ruleType: row.rule_type,
    active: row.status === "active",
    priority: row.priority,
  };
}

function mapVersion(row: VersionRow): OfficeQuizTemplateVersion {
  return {
    id: row.id,
    version: row.version,
    status: toTemplateStatus(row.status),
    publishedAt: row.created_at,
    createdAt: row.created_at,
  };
}

async function getTemplateCounts(
  templateIds: string[],
): Promise<Map<string, TemplateCounts>> {
  const supabase = createSupabaseAdminClient();
  const counts = new Map<string, TemplateCounts>(
    templateIds.map((id) => [id, { questionsCount: 0, rulesCount: 0 }]),
  );

  if (!templateIds.length) {
    return counts;
  }

  const [
    { data: questions, error: questionsError },
    { data: rules, error: rulesError },
  ] = await Promise.all([
    supabase
      .from("quiz_template_questions")
      .select("quiz_template_id")
      .in("quiz_template_id", templateIds),
    supabase
      .from("quiz_template_rules")
      .select("quiz_template_id")
      .in("quiz_template_id", templateIds),
  ]);

  if (questionsError || rulesError) {
    throw new Error("Unable to count office quiz template relations.");
  }

  (questions ?? []).forEach((question) => {
    const current = counts.get(question.quiz_template_id);
    if (current) current.questionsCount += 1;
  });

  (rules ?? []).forEach((rule) => {
    const current = counts.get(rule.quiz_template_id);
    if (current) current.rulesCount += 1;
  });

  return counts;
}

export async function listOfficeQuizTemplates(
  context: OfficeUserContext,
): Promise<OfficeQuizTemplateListItem[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("quiz_templates")
    .select("*")
    .order("source", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    throw new Error("Unable to list office quiz templates.");
  }

  const visibleTemplates = (data ?? []).filter((template) =>
    canAccessTemplate(context, template),
  );
  const counts = await getTemplateCounts(
    visibleTemplates.map((template) => template.id),
  );

  return visibleTemplates.map((template) =>
    mapTemplateListItem(
      context,
      template,
      counts.get(template.id) ?? { questionsCount: 0, rulesCount: 0 },
    ),
  );
}

export async function getOfficeQuizTemplate(input: {
  context: OfficeUserContext;
  templateId: string;
}): Promise<OfficeQuizTemplateDetail | null> {
  const supabase = createSupabaseAdminClient();
  const { data: template, error } = await supabase
    .from("quiz_templates")
    .select("*")
    .eq("id", input.templateId)
    .maybeSingle();

  if (error) {
    throw new Error("Unable to load office quiz template.");
  }

  if (!template || !canAccessTemplate(input.context, template)) {
    return null;
  }

  const [{ data: questions }, { data: rules }, { data: versions }] =
    await Promise.all([
      supabase
        .from("quiz_template_questions")
        .select("*")
        .eq("quiz_template_id", template.id)
        .order("display_order", { ascending: true }),
      supabase
        .from("quiz_template_rules")
        .select("*")
        .eq("quiz_template_id", template.id)
        .order("priority", { ascending: true }),
      supabase
        .from("quiz_template_versions")
        .select("*")
        .eq("quiz_template_id", template.id)
        .order("version", { ascending: false }),
    ]);
  const questionList = (questions ?? []).map(mapQuestion);
  const ruleList = (rules ?? []).map(mapRule);
  const base = mapTemplateListItem(input.context, template, {
    questionsCount: questionList.length,
    rulesCount: ruleList.length,
  });

  return {
    ...base,
    description: template.description,
    audience: template.audience,
    ownership: template.ownership,
    metadata: toMetadata(template.metadata),
    questions: questionList,
    rules: ruleList,
    versions: (versions ?? []).map(mapVersion),
    moderation: moderateCustomQuizContent(
      `${template.name}\n${template.description}`,
    ),
  };
}

export async function cloneOfficeQuizTemplate(input: {
  context: OfficeUserContext;
  templateId: string;
}): Promise<string> {
  const template = await getOfficeQuizTemplate(input);

  if (!template || template.source !== "platform" || !template.canClone) {
    throw new Error("Template cannot be cloned by this user.");
  }

  const supabase = createSupabaseAdminClient();
  const slug = `${template.slug}-${input.context.tenantSlug}-${Date.now()}`;
  const moderation = moderateCustomQuizContent(
    `${template.name}\n${template.description}`,
  );
  const insert: TemplateInsert = {
    tenant_id: input.context.tenantId,
    slug,
    name: `${template.name} - rascunho`,
    description: template.description,
    category: template.category,
    audience: template.audience,
    source: "tenant",
    ownership: "tenant_managed",
    status: "draft",
    template_type: template.type,
    version: 1,
    created_by_user_id: input.context.userId,
    metadata: {
      clonedFromTemplateId: template.id,
      clonedFromVersion: template.version,
      moderationLevel: moderation.level,
    },
  };
  const { data: cloned, error: cloneError } = await supabase
    .from("quiz_templates")
    .insert(insert)
    .select("*")
    .single();

  if (cloneError || !cloned) {
    throw new Error("Unable to clone office quiz template.");
  }

  const [
    { data: rawQuestions, error: rawQuestionsError },
    { data: rawRules, error: rawRulesError },
  ] = await Promise.all([
    supabase
      .from("quiz_template_questions")
      .select("*")
      .eq("quiz_template_id", template.id)
      .order("display_order", { ascending: true }),
    supabase
      .from("quiz_template_rules")
      .select("*")
      .eq("quiz_template_id", template.id)
      .order("priority", { ascending: true }),
  ]);

  if (rawQuestionsError || rawRulesError) {
    throw new Error("Unable to load source quiz template relations.");
  }

  if (rawQuestions?.length) {
    const { error: questionsError } = await supabase
      .from("quiz_template_questions")
      .insert(
        rawQuestions.map((question) => ({
          quiz_template_id: cloned.id,
          question_key: question.question_key,
          title: question.title,
          description: question.description,
          question_type: question.question_type,
          is_required: question.is_required,
          is_sensitive: question.is_sensitive,
          allows_unknown: question.allows_unknown,
          allows_withheld: question.allows_withheld,
          display_order: question.display_order,
          options: question.options,
          conditions: question.conditions,
          metadata: question.metadata,
        })),
      );

    if (questionsError) {
      throw new Error("Unable to clone office quiz template questions.");
    }
  }

  if (rawRules?.length) {
    const { error: rulesError } = await supabase
      .from("quiz_template_rules")
      .insert(
        rawRules.map((rule) => ({
          quiz_template_id: cloned.id,
          rule_key: rule.rule_key,
          rule_type: rule.rule_type,
          status: rule.status,
          priority: rule.priority,
          conditions: rule.conditions,
          effects: rule.effects,
        })),
      );

    if (rulesError) {
      throw new Error("Unable to clone office quiz template rules.");
    }
  }

  const { error: versionError } = await supabase
    .from("quiz_template_versions")
    .insert({
      quiz_template_id: cloned.id,
      version: 1,
      status: "draft",
      created_by_user_id: input.context.userId,
      snapshot: {
        clonedFromTemplateId: template.id,
        sourceTemplateVersion: template.version,
        questionsCount: rawQuestions?.length ?? 0,
        rulesCount: rawRules?.length ?? 0,
      } satisfies Json,
    });

  if (versionError) {
    throw new Error("Unable to create office quiz template version.");
  }

  await insertAuditLog({
    tenantId: input.context.tenantId,
    actorUserId: input.context.userId,
    action: "template_cloned",
    entityType: "quiz_template",
    entityId: cloned.id,
    metadata: {
      sourceTemplateId: template.id,
      sourceVersion: template.version,
      slug,
    },
  });

  return cloned.id;
}

export async function updateOfficeQuizTemplateDraft(input: {
  context: OfficeUserContext;
  templateId: string;
  name: string;
  description: string;
}): Promise<void> {
  const template = await getOfficeQuizTemplate(input);

  if (!template || !template.canEdit || template.source !== "tenant") {
    throw new Error("Template cannot be edited by this user.");
  }

  assertSafeTemplateText(input.name);
  assertSafeTemplateText(input.description);
  const moderation = moderateCustomQuizContent(
    `${input.name}\n${input.description}`,
  );

  if (moderation.level === "blocked") {
    throw new Error("Template text blocked by content moderation.");
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("quiz_templates")
    .update({
      name: input.name,
      description: input.description,
      metadata: {
        ...template.metadata,
        moderationLevel: moderation.level,
      },
    })
    .eq("id", input.templateId)
    .eq("tenant_id", input.context.tenantId);

  if (error) {
    throw new Error("Unable to update office quiz template.");
  }

  await insertAuditLog({
    tenantId: input.context.tenantId,
    actorUserId: input.context.userId,
    action: "template_updated",
    entityType: "quiz_template",
    entityId: input.templateId,
    metadata: {
      moderationLevel: moderation.level,
      moderationMatches: moderation.matches.map((match) => match.term),
    },
  });
}

export async function updateOfficeQuizTemplateStatus(input: {
  context: OfficeUserContext;
  templateId: string;
  status: Extract<QuizTemplateStatus, "active" | "inactive" | "archived">;
}): Promise<void> {
  const template = await getOfficeQuizTemplate(input);

  if (!template || template.source !== "tenant") {
    throw new Error("Template cannot be changed by this user.");
  }

  if (
    input.status === "active" &&
    !canManageQuizTemplate({ role: input.context.role, action: "publish" })
  ) {
    throw new Error("Only admins can publish quiz templates.");
  }

  if (
    input.status !== "active" &&
    !canManageQuizTemplate({
      role: input.context.role,
      action: "deactivate",
      template: { source: template.source },
    })
  ) {
    throw new Error("Template cannot be deactivated by this user.");
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("quiz_templates")
    .update({ status: input.status })
    .eq("id", input.templateId)
    .eq("tenant_id", input.context.tenantId);

  if (error) {
    throw new Error("Unable to update office quiz template status.");
  }

  await insertAuditLog({
    tenantId: input.context.tenantId,
    actorUserId: input.context.userId,
    action:
      input.status === "active"
        ? "template_published"
        : input.status === "archived"
          ? "template_archived"
          : "template_deactivated",
    entityType: "quiz_template",
    entityId: input.templateId,
    metadata: {
      previousStatus: template.status,
      nextStatus: input.status,
    },
  });
}
