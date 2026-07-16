import type {
  QuizTemplateDefinition,
  QuizTemplatePermissionAction,
  QuizTemplatePermissionRole,
} from "@/types/quiz";

const rolePermissions = {
  admin: [
    "view",
    "clone",
    "create",
    "edit",
    "publish",
    "deactivate",
    "version",
  ],
  manager: ["view", "clone", "create", "edit"],
  agent: ["view"],
  viewer: ["view"],
} satisfies Record<QuizTemplatePermissionRole, QuizTemplatePermissionAction[]>;

export function canManageQuizTemplate(input: {
  role: QuizTemplatePermissionRole;
  action: QuizTemplatePermissionAction;
  template?: Pick<QuizTemplateDefinition, "source">;
}): boolean {
  const allowedActions: readonly QuizTemplatePermissionAction[] =
    rolePermissions[input.role];

  if (!allowedActions.includes(input.action)) {
    return false;
  }

  if (
    input.template?.source === "platform" &&
    ["edit", "publish", "deactivate", "version"].includes(input.action)
  ) {
    return false;
  }

  if (input.action === "publish") {
    return input.role === "admin";
  }

  return true;
}
