import { formatDateTime } from "@/lib/office-dashboard";
import type { LeadStatusHistoryItem } from "@/services/office-dashboard/history";

export function LeadStatusHistory({
  items,
}: {
  items: LeadStatusHistoryItem[];
}) {
  return (
    <section
      className="bg-card rounded-lg border p-5"
      aria-labelledby="status-history"
    >
      <h2 className="text-lg font-semibold" id="status-history">
        Histórico de status
      </h2>
      {items.length ? (
        <ol className="mt-4 space-y-3">
          {items.map((item) => (
            <li className="rounded-md border p-4" key={item.id}>
              <p className="font-medium">
                {item.fromLabel} {" -> "} {item.toLabel}
              </p>
              {item.reason ? (
                <p className="text-muted-foreground mt-1 text-sm">
                  {item.reason}
                </p>
              ) : null}
              <p className="text-muted-foreground mt-2 text-xs">
                {formatDateTime(item.createdAt)}
              </p>
            </li>
          ))}
        </ol>
      ) : (
        <p className="text-muted-foreground mt-3 text-sm">
          Nenhuma alteração registrada.
        </p>
      )}
    </section>
  );
}
