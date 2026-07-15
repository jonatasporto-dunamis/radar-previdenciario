import { formatClassification } from "@/lib/office-dashboard";
import type { InternalClassification } from "@/types/office-dashboard";

const toneClass: Record<InternalClassification, string> = {
  alto_potencial: "bg-success/15 text-success",
  medio_potencial: "bg-warning/15 text-warning",
  baixo_potencial:
    "bg-neutral-100 text-neutral-800 dark:bg-neutral-900 dark:text-neutral-200",
};

export function LeadPriorityBadge({
  classification,
}: {
  classification: InternalClassification | null;
}) {
  if (!classification) {
    return (
      <span className="inline-flex rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-700">
        Não classificado
      </span>
    );
  }

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${toneClass[classification]}`}
    >
      {formatClassification(classification)}
    </span>
  );
}
