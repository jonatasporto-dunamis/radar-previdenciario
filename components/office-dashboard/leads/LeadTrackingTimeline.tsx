import { formatDateTime } from "@/lib/office-dashboard";
import type { OfficeTimelineItem } from "@/types/office-dashboard";

export function LeadTrackingTimeline({
  items,
}: {
  items: OfficeTimelineItem[];
}) {
  return (
    <section
      className="bg-card rounded-lg border p-5"
      aria-labelledby="lead-timeline"
    >
      <h2 className="text-lg font-semibold" id="lead-timeline">
        Timeline
      </h2>
      {items.length ? (
        <ol className="mt-4 space-y-3">
          {items.map((item) => (
            <li
              className="rounded-md border p-4"
              key={`${item.type}-${item.id}`}
            >
              <p className="font-medium">{item.label}</p>
              {item.description ? (
                <p className="text-muted-foreground mt-1 text-sm">
                  {item.description}
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
          Nenhum evento registrado.
        </p>
      )}
    </section>
  );
}
