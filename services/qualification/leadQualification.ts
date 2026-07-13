import type { LeadQualification } from "./types";
import type { QuizResultComputation } from "@/types/quiz";

type QualifiableResult = Pick<QuizResultComputation, "classification">;

export function qualifyLeadFromResult(
  result: QualifiableResult,
): LeadQualification {
  if (result.classification === "alto_potencial") {
    return {
      classification: result.classification,
      priority: "high",
      shouldNotify: true,
      reason: "Lead classificado com alto potencial preliminar.",
      providers: ["email"],
    };
  }

  if (result.classification === "medio_potencial") {
    return {
      classification: result.classification,
      priority: "medium",
      shouldNotify: true,
      reason: "Lead classificado com potencial preliminar medio.",
      providers: ["email"],
    };
  }

  return {
    classification: result.classification,
    priority: "low",
    shouldNotify: false,
    reason: "Lead classificado com baixo potencial preliminar.",
    providers: [],
  };
}
