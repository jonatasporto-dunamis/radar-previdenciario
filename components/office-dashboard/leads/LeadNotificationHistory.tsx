import { formatDateTime } from "@/lib/office-dashboard";
import type { OfficeNotificationLog } from "@/types/office-dashboard";

export function LeadNotificationHistory({
  notifications,
}: {
  notifications: OfficeNotificationLog[];
}) {
  return (
    <section
      className="bg-card rounded-lg border p-5"
      aria-labelledby="lead-notifications"
    >
      <h2 className="text-lg font-semibold" id="lead-notifications">
        Notificações
      </h2>
      {notifications.length ? (
        <div className="mt-4 space-y-3">
          {notifications.map((notification) => (
            <article className="rounded-md border p-4" key={notification.id}>
              <p className="font-medium">
                {notification.provider} · {notification.status}
              </p>
              <p className="text-muted-foreground mt-1 text-sm">
                Prioridade {notification.priority} · tentativas{" "}
                {notification.attempt}
              </p>
              <p className="text-muted-foreground mt-1 text-sm">
                Enviado: {formatDateTime(notification.sentAt)} · Falha:{" "}
                {formatDateTime(notification.failedAt)}
              </p>
              {notification.lastError ? (
                <p className="text-danger mt-2 text-sm">
                  {notification.lastError.slice(0, 160)}
                </p>
              ) : null}
            </article>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground mt-3 text-sm">
          Nenhuma notificação registrada.
        </p>
      )}
    </section>
  );
}
