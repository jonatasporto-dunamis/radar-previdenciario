import type { LeadCommercialStatus } from "@/types/office-dashboard";

export const leadCommercialStatuses = [
  "new",
  "contacted",
  "in_review",
  "awaiting_information",
  "scheduled",
  "converted",
  "not_qualified",
  "lost",
  "archived",
] as const satisfies readonly LeadCommercialStatus[];

export const leadCommercialStatusLabels: Record<LeadCommercialStatus, string> =
  {
    new: "Novo",
    contacted: "Contato iniciado",
    in_review: "Em análise",
    awaiting_information: "Aguardando informações",
    scheduled: "Atendimento agendado",
    converted: "Convertido",
    not_qualified: "Não qualificado comercialmente",
    lost: "Encerrado sem conversão",
    archived: "Arquivado",
  };

export const leadCommercialStatusTone: Record<
  LeadCommercialStatus,
  "neutral" | "info" | "warning" | "success" | "danger"
> = {
  new: "info",
  contacted: "info",
  in_review: "warning",
  awaiting_information: "warning",
  scheduled: "info",
  converted: "success",
  not_qualified: "neutral",
  lost: "danger",
  archived: "neutral",
};

const allowedTransitions: Record<LeadCommercialStatus, LeadCommercialStatus[]> =
  {
    new: ["contacted", "in_review", "not_qualified", "lost", "archived"],
    contacted: [
      "in_review",
      "awaiting_information",
      "scheduled",
      "not_qualified",
      "lost",
      "archived",
    ],
    in_review: [
      "awaiting_information",
      "scheduled",
      "converted",
      "not_qualified",
      "lost",
      "archived",
    ],
    awaiting_information: [
      "in_review",
      "scheduled",
      "converted",
      "not_qualified",
      "lost",
      "archived",
    ],
    scheduled: ["converted", "in_review", "not_qualified", "lost", "archived"],
    converted: ["archived"],
    not_qualified: ["archived"],
    lost: ["archived"],
    archived: [],
  };

export function isLeadCommercialStatus(
  value: unknown,
): value is LeadCommercialStatus {
  return (
    typeof value === "string" &&
    leadCommercialStatuses.includes(value as LeadCommercialStatus)
  );
}

export function normalizeLeadCommercialStatus(
  value: string | null | undefined,
): LeadCommercialStatus {
  return isLeadCommercialStatus(value) ? value : "new";
}

export function canTransitionLeadStatus(
  from: LeadCommercialStatus,
  to: LeadCommercialStatus,
): boolean {
  return from === to || allowedTransitions[from].includes(to);
}

export function getAllowedLeadStatusTransitions(
  from: LeadCommercialStatus,
): LeadCommercialStatus[] {
  return allowedTransitions[from];
}
