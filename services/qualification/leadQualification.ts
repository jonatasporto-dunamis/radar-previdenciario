import type { LeadQualification } from "./types";
import type { QuizResultComputation } from "@/types/quiz";

type QualifiableResult = Pick<QuizResultComputation, "classification"> &
  Partial<
    Pick<QuizResultComputation, "requiresHumanReview" | "dataCompleteness">
  >;

export function qualifyLeadFromResult(
  result: QualifiableResult,
): LeadQualification {
  if (result.classification === "alto_potencial") {
    return {
      classification: result.classification,
      priority: "high",
      shouldNotify: true,
      reason: result.requiresHumanReview
        ? "Contato com prioridade alta de triagem e revisão humana necessária por dados incompletos."
        : "Contato com prioridade alta de triagem.",
      providers: ["email"],
    };
  }

  if (result.classification === "medio_potencial") {
    return {
      classification: result.classification,
      priority: "medium",
      shouldNotify: true,
      reason: result.requiresHumanReview
        ? "Contato com prioridade media de triagem e revisão humana necessária por dados incompletos."
        : "Contato com prioridade media de triagem.",
      providers: ["email"],
    };
  }

  return {
    classification: result.classification,
    priority: "low",
    shouldNotify: false,
    reason:
      result.dataCompleteness === "insufficient"
        ? "Contato sem elementos suficientes para priorização automatizada."
        : "Contato sem prioridade operacional para notificação automática.",
    providers: [],
  };
}
