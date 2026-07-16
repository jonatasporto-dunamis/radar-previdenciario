import type { QuizResultClassification } from "@/types/quiz";
import type { NotificationPriority } from "@/types/database";

export const notificationConfig = {
  providers: {
    email: {
      enabled: true,
      notificationType: "lead_qualified",
      subject: "Novo contato para avaliação previdenciária",
    },
  },
  retry: {
    maxAttempts: 3,
    baseDelayMs: 250,
  },
  priority: {
    alto_potencial: "high",
    medio_potencial: "medium",
    baixo_potencial: "low",
  } satisfies Record<QuizResultClassification, NotificationPriority>,
  templates: {
    highPotential: "lead-qualified",
    mediumPotential: "lead-medium",
  },
} as const;

export type NotificationRuntimeConfig = {
  resendApiKey: string | null;
  dryRun: boolean;
};

export function getNotificationRuntimeConfig(): NotificationRuntimeConfig {
  return {
    resendApiKey: process.env.RESEND_API_KEY ?? null,
    dryRun:
      process.env.E2E_MOCK_SUPABASE === "true" ||
      process.env.NOTIFICATION_DRY_RUN === "true" ||
      process.env.NODE_ENV === "test",
  };
}

export function validateNotificationRuntimeConfig(
  config = getNotificationRuntimeConfig(),
): { valid: true } | { valid: false; reason: string } {
  if (!config.dryRun && !config.resendApiKey) {
    return {
      valid: false,
      reason: "RESEND_API_KEY is not configured.",
    };
  }

  return { valid: true };
}
