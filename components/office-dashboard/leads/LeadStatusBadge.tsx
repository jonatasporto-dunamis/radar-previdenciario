import {
  leadCommercialStatusLabels,
  leadCommercialStatusTone,
} from "@/lib/office-dashboard";
import type { LeadCommercialStatus } from "@/types/office-dashboard";

const toneClass = {
  neutral:
    "bg-neutral-100 text-neutral-800 dark:bg-neutral-900 dark:text-neutral-200",
  info: "bg-primary/10 text-primary",
  warning: "bg-warning/15 text-warning",
  success: "bg-success/15 text-success",
  danger: "bg-danger/15 text-danger",
};

export function LeadStatusBadge({ status }: { status: LeadCommercialStatus }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${toneClass[leadCommercialStatusTone[status]]}`}
    >
      {leadCommercialStatusLabels[status]}
    </span>
  );
}
