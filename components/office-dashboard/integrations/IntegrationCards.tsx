import Link from "next/link";
import { Activity, AlertTriangle, PlugZap } from "lucide-react";
import { getIntegrationProviderSlug } from "@/services/office-dashboard/integrations";
import { IntegrationStatusBadge } from "./IntegrationStatusBadge";
import type { IntegrationCardSummary } from "@/types/integrations";

function formatDate(value: string | null) {
  if (!value) {
    return "Sem registro";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export function IntegrationCards({
  integrations,
}: {
  integrations: IntegrationCardSummary[];
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {integrations.map((integration) => (
        <article
          className="bg-card flex min-h-72 flex-col justify-between rounded-lg border p-5 shadow-sm"
          key={integration.provider}
        >
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-muted-foreground text-sm">
                  {integration.definition.shortName}
                </p>
                <h3 className="text-lg font-semibold">
                  {integration.definition.name}
                </h3>
              </div>
              <PlugZap aria-hidden="true" className="text-primary size-5" />
            </div>

            <IntegrationStatusBadge status={integration.status} />

            <p className="text-muted-foreground text-sm">
              {integration.definition.description}
            </p>

            <dl className="space-y-2 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted-foreground">Modo</dt>
                <dd className="font-medium">
                  {integration.testMode ? "Teste" : "Produção"}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted-foreground">Último teste</dt>
                <dd className="font-medium">
                  {formatDate(integration.latestTest?.createdAt ?? null)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted-foreground">Último evento</dt>
                <dd className="font-medium">
                  {formatDate(integration.latestDelivery?.createdAt ?? null)}
                </dd>
              </div>
            </dl>

            {integration.lastErrorSummary ? (
              <div className="bg-danger/10 text-danger flex gap-2 rounded-md p-3 text-xs">
                <AlertTriangle aria-hidden="true" className="mt-0.5 size-4" />
                <p>{integration.lastErrorSummary}</p>
              </div>
            ) : null}
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold"
              href={`/painel/integracoes/${getIntegrationProviderSlug(
                integration.provider,
              )}`}
            >
              Configurar
            </Link>
            <Link
              className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold"
              href="/painel/integracoes/eventos"
            >
              <Activity aria-hidden="true" className="size-4" />
              Eventos
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
